"""Erzeugt eine Abgleich-Migration für Modelldaten und Quellen.

Aufruf: python3 make_model_update.py <projektordner> <ausgabe.sql>

Liest motorrad-liste-schweiz.csv und datenbank/quellen.csv und gleicht für
alle bestehenden Modelle ab: Ölsorte, Ölmenge, Status, Hinweis, Öl- und
Ventilintervalle sowie die Quellen. Neue Modelle legt das Skript NICHT an.
Die Migration darf mehrfach laufen (gleiches Ergebnis).
"""
import csv
import importlib.util
import json
import sys
from pathlib import Path

here = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("make_seed", here / "make_seed.py")
seed = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seed)


def bikes_from_csv(path):
    with open(path, encoding="utf-8") as f:
        rows = list(csv.DictReader(f, delimiter=";"))
    out = []
    for r in rows:
        brand = r["Marke"]
        name = r["Modell (wie motosuisse)"].strip()
        for p in seed.MODEL_PREFIXES + [brand]:
            if name.startswith(p + " "):
                name = name[len(p) + 1:]
                break
        to_int = lambda v: int(v) if seed.num(v) else None
        oil_l = seed.liters(r["Ölmenge mit Filter"])
        out.append({
            "brand_slug": seed.slugify(brand), "slug": seed.slugify(name),
            "oil_spec": r["Ölsorte"] or None, "oil_l": float(oil_l) if oil_l else None,
            "status": seed.STATUS[r["Status"]], "note": r["Hinweis"] or None,
            "sources": [s.strip() for s in r["Quellen"].split(",") if s.strip()],
            "oil_km": to_int(r["Ölwechsel alle km"]),
            "oil_months": to_int(r["Ölwechsel spätestens nach Monaten"]),
            "valve_km": to_int(r["Ventilspiel prüfen alle km"]),
        })
    return out


def sources_from_csv(path):
    with open(path, encoding="utf-8") as f:
        return [{"code": r["Code"], "title": r["Titel"] or None, "url": r["URL"] or None,
                 "accessed": r["Abgerufen"] or None}
                for r in csv.DictReader(f, delimiter=";")]


def main(root, out, title="Modelldaten abgleichen"):
    root = Path(root)
    bikes = bikes_from_csv(root / "motorrad-liste-schweiz.csv")
    sources = sources_from_csv(root / "datenbank" / "quellen.csv")
    dump = lambda d: "[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in d) + "\n]"

    sql = f"""-- =====================================================================
--  {title} (automatisch erzeugt mit datenbank/make_model_update.py)
--  Quelle: motorrad-liste-schweiz.csv, datenbank/quellen.csv
--  Gleicht bestehende Modelle ab; legt keine neuen Modelle an.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Quellen: Titel, Link, Abrufdatum
-- ---------------------------------------------------------------------
insert into public.data_sources (code, title, url, accessed_on)
select code, title, url, accessed
from jsonb_to_recordset($json${dump(sources)}$json$::jsonb)
  as x(code text, title text, url text, accessed date)
on conflict (code) do update
  set title = excluded.title, url = excluded.url, accessed_on = excluded.accessed_on;

-- ---------------------------------------------------------------------
-- Modelldaten
-- ---------------------------------------------------------------------
create temp table _bikes as
select x.*, v.id as variant_id
from jsonb_to_recordset($json${dump(bikes)}$json$::jsonb) as x(
  brand_slug text, slug text, oil_spec text, oil_l numeric, status text, note text,
  sources text[], oil_km integer, oil_months integer, valve_km integer)
join public.manufacturers m on m.slug = x.brand_slug
join public.models md on md.manufacturer_id = m.id and md.slug = x.slug
join public.model_variants v on v.model_id = md.id;

do $check$
begin
  if (select count(*) from _bikes) <> {len(bikes)} then
    raise exception 'Abgleich: % von {len(bikes)} Modellen gefunden', (select count(*) from _bikes);
  end if;
end
$check$;

update public.model_variants v
set oil_spec = b.oil_spec,
    oil_capacity_with_filter_l = b.oil_l,
    data_status_code = b.status,
    notes = b.note
from _bikes b
where v.id = b.variant_id
  and (v.oil_spec, v.oil_capacity_with_filter_l, v.data_status_code, v.notes)
      is distinct from (b.oil_spec, b.oil_l, b.status, b.note);

-- Intervalle: nur Öl und Ventile kommen aus der Liste
insert into public.model_maintenance_intervals
  (model_variant_id, task_type_code, interval_km, interval_period, data_status_code)
select variant_id, 'oil_change', oil_km, make_interval(months => oil_months), status
from _bikes where oil_km is not null or oil_months is not null
union all
select variant_id, 'valve_check', valve_km, null, status
from _bikes where valve_km is not null
on conflict (model_variant_id, task_type_code) do update
  set interval_km = excluded.interval_km,
      interval_period = excluded.interval_period,
      data_status_code = excluded.data_status_code
  where (model_maintenance_intervals.interval_km, model_maintenance_intervals.interval_period,
         model_maintenance_intervals.data_status_code)
        is distinct from (excluded.interval_km, excluded.interval_period, excluded.data_status_code);

delete from public.model_maintenance_intervals i
using _bikes b
where i.model_variant_id = b.variant_id
  and ((i.task_type_code = 'oil_change' and b.oil_km is null and b.oil_months is null)
    or (i.task_type_code = 'valve_check' and b.valve_km is null));

-- Quellen je Variante und je Intervall neu zuordnen
delete from public.model_variant_sources s using _bikes b where s.model_variant_id = b.variant_id;
insert into public.model_variant_sources (model_variant_id, source_id)
select b.variant_id, s.id
from _bikes b cross join lateral unnest(b.sources) as src(code)
join public.data_sources s on s.code = src.code;

delete from public.model_maintenance_interval_sources x
using public.model_maintenance_intervals i, _bikes b
where x.interval_id = i.id and i.model_variant_id = b.variant_id
  and i.task_type_code in ('oil_change', 'valve_check');
insert into public.model_maintenance_interval_sources (interval_id, source_id)
select i.id, s.id
from _bikes b
join public.model_maintenance_intervals i
  on i.model_variant_id = b.variant_id and i.task_type_code in ('oil_change', 'valve_check')
cross join lateral unnest(b.sources) as src(code)
join public.data_sources s on s.code = src.code;

drop table _bikes;
"""
    Path(out).write_text(sql, encoding="utf-8")
    print(f"{len(bikes)} Modelle, {len(sources)} Quellen -> {out}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], *sys.argv[3:4])
