"""Erzeugt 002_seed.sql aus den Projekt-CSVs.

Aufruf: python3 make_seed.py <ordner-mit-csvs> <ausgabe.sql>
Bei neuen Modellen: CSV ergänzen und die neuen Zeilen als eigene Migration
(003_…) einspielen.
"""
import csv
import re
import sys
import unicodedata
from pathlib import Path

def slugify(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", s.lower()).strip("-")


def num(v):
    v = (v or "").strip()
    return v if v.isdigit() else None


def liters(v):
    m = re.search(r"(\d+(?:,\d+)?)", v or "")
    return m.group(1).replace(",", ".") if m else None


CATEGORY = {
    "Naked": "naked", "Supersport": "supersport", "Sporttourer": "sport_tourer",
    "Tourer": "tourer", "Adventure": "adventure", "Enduro": "enduro",
    "Supermoto": "supermoto", "Cruiser": "cruiser", "Retro / Café Racer": "cafe_racer",
    "Scrambler": "scrambler", "Roller": "scooter",
}
DRIVE = {"Kette": "chain", "Kardan": "shaft", "Riemen (CVT)": "cvt"}
STATUS = {"geprüft": "verified", "prüfen": "to_check", "offen": "open"}
SEVERITY = {"rot": "red", "gelb": "yellow", "info": "info"}
MODEL_PREFIXES = ["Betamotor", "Fantic Motor"]

LOOKUPS = """
-- ---------------------------------------------------------------------
-- Nachschlagewerte
-- ---------------------------------------------------------------------
insert into public.locales (code, name) values
  ('de', 'Deutsch'), ('en', 'English'), ('fr', 'Français'), ('it', 'Italiano');

insert into public.drive_types (code, name_i18n, sort_order) values
  ('chain', '{"de": "Kette", "en": "Chain"}', 1),
  ('shaft', '{"de": "Kardan", "en": "Shaft"}', 2),
  ('belt',  '{"de": "Zahnriemen", "en": "Belt"}', 3),
  ('cvt',   '{"de": "Variomatik (Roller)", "en": "CVT (scooter)"}', 4);

insert into public.bike_categories (code, name_i18n, sprite_key, sort_order) values
  ('naked',        '{"de": "Naked", "en": "Naked"}', 'naked', 1),
  ('supersport',   '{"de": "Supersport", "en": "Supersport"}', 'supersport', 2),
  ('sport_tourer', '{"de": "Sporttourer", "en": "Sport tourer"}', 'sporttourer', 3),
  ('tourer',       '{"de": "Tourer", "en": "Tourer"}', 'tourer', 4),
  ('adventure',    '{"de": "Adventure / Reiseenduro", "en": "Adventure"}', 'adventure', 5),
  ('enduro',       '{"de": "Enduro / Motocross", "en": "Enduro / Motocross"}', 'enduro', 6),
  ('supermoto',    '{"de": "Supermoto", "en": "Supermoto"}', 'supermoto', 7),
  ('cruiser',      '{"de": "Cruiser / Chopper", "en": "Cruiser / Chopper"}', 'cruiser', 8),
  ('cafe_racer',   '{"de": "Café Racer / Retro", "en": "Café racer / Retro"}', 'cafe_racer', 9),
  ('scrambler',    '{"de": "Scrambler", "en": "Scrambler"}', 'scrambler', 10),
  ('scooter',      '{"de": "Roller", "en": "Scooter"}', 'roller', 11);

insert into public.data_statuses (code, name_i18n) values
  ('verified', '{"de": "geprüft", "en": "verified"}'),
  ('to_check', '{"de": "prüfen", "en": "to check"}'),
  ('open',     '{"de": "offen", "en": "open"}');

-- Standard-Intervalle (default_interval_km / default_interval) bewusst leer:
-- selber festlegen, sobald verlässliche Werte vorliegen.
insert into public.maintenance_task_types
  (code, name_i18n, drive_type_code, seasonal_month, can_do_yourself, sort_order) values
  ('oil_change',      '{"de": "Ölwechsel", "en": "Oil change"}', null, null, false, 1),
  ('oil_filter',      '{"de": "Ölfilter", "en": "Oil filter"}', null, null, false, 2),
  ('general_service', '{"de": "Service / Inspektion", "en": "Service"}', null, null, false, 3),
  ('valve_check',     '{"de": "Ventilspiel prüfen", "en": "Valve clearance check"}', null, null, false, 4),
  ('chain_care',      '{"de": "Kette reinigen & schmieren", "en": "Chain clean & lube"}', 'chain', null, true, 5),
  ('chain_check',     '{"de": "Kettenspannung prüfen", "en": "Chain slack check"}', 'chain', null, true, 6),
  ('shaft_oil',       '{"de": "Kardanöl", "en": "Final drive oil"}', 'shaft', null, false, 7),
  ('belt_check',      '{"de": "Zahnriemen prüfen", "en": "Belt check"}', 'belt', null, false, 8),
  ('cvt_service',     '{"de": "Variomatik-Service", "en": "CVT service"}', 'cvt', null, false, 9),
  ('tire_pressure',   '{"de": "Reifendruck prüfen", "en": "Tire pressure"}', null, null, true, 10),
  ('tire_check',      '{"de": "Reifen prüfen (Profil, Alter)", "en": "Tire inspection"}', null, null, true, 11),
  ('brake_fluid',     '{"de": "Bremsflüssigkeit", "en": "Brake fluid"}', null, null, false, 12),
  ('brake_pads',      '{"de": "Bremsbeläge prüfen", "en": "Brake pads"}', null, null, true, 13),
  ('coolant',         '{"de": "Kühlflüssigkeit", "en": "Coolant"}', null, null, false, 14),
  ('spark_plugs',     '{"de": "Zündkerzen", "en": "Spark plugs"}', null, null, false, 15),
  ('air_filter',      '{"de": "Luftfilter", "en": "Air filter"}', null, null, false, 16),
  ('battery',         '{"de": "Batterie pflegen", "en": "Battery care"}', null, null, true, 17),
  ('winter_prep',     '{"de": "Winter-Vorbereitung", "en": "Winter prep"}', null, 10, true, 18),
  ('spring_check',    '{"de": "Frühlings-Check", "en": "Spring check"}', null, 3, true, 19);

insert into public.warning_severities (code, name_i18n, sort_order) values
  ('red',    '{"de": "Rot – sofort anhalten", "en": "Red – stop now"}', 1),
  ('yellow', '{"de": "Gelb – bald handeln", "en": "Yellow – act soon"}', 2),
  ('info',   '{"de": "Info", "en": "Info"}', 3);

insert into public.tip_categories (code, name_i18n, sort_order) values
  ('basics',   '{"de": "Grundlagen", "en": "Basics"}', 1),
  ('braking',  '{"de": "Bremsen", "en": "Braking"}', 2),
  ('cornering','{"de": "Kurvenfahren", "en": "Cornering"}', 3),
  ('traffic',  '{"de": "Im Verkehr", "en": "Traffic"}', 4),
  ('weather',  '{"de": "Wetter & Jahreszeiten", "en": "Weather"}', 5),
  ('gear',     '{"de": "Ausrüstung", "en": "Gear"}', 6),
  ('care',     '{"de": "Pflege selber machen", "en": "DIY care"}', 7);
"""


def main(src, out):
    """Schreibt die Startdaten als kompakte JSON-Blöcke, die Postgres selbst
    in Tabellen verteilt. So bleibt die Datei klein und gut lesbar."""
    import json
    src = Path(src)

    with open(src / "warnleuchten.csv", encoding="utf-8") as f:
        reader = list(csv.DictReader(f, delimiter=";"))
    for r in reader:
        # Ein Strichpunkt im Text «Was tun» ohne Anführungszeichen teilt die
        # Zeile in zu viele Spalten: den Rest wieder anhängen.
        if r.get(None):
            r["Was tun"] = "; ".join([r["Was tun"]] + [x.strip() for x in r.pop(None)])
    lights = [{
        "code": r["id"], "severity": SEVERITY[r["Gruppe"]], "colors": r["Farbe"] or None,
        "std": r["Genormt"] == "ja", "name": r["Name"],
        "aliases": r["Andere Namen / Varianten"] or None,
        "meaning": r["Bedeutung"], "action": r["Was tun"], "sort": i,
        } for i, r in enumerate(reader, start=1)]

    with open(src / "motorrad-liste-schweiz.csv", encoding="utf-8") as f:
        rows = list(csv.DictReader(f, delimiter=";"))

    bikes = []
    for r in rows:
        brand = r["Marke"]
        name = r["Modell (wie motosuisse)"].strip()
        for p in MODEL_PREFIXES + [brand]:
            if name.startswith(p + " "):
                name = name[len(p) + 1:]
                break
        years = re.findall(r"\d{4}", r["Baujahre"])
        to_int = lambda v: int(v) if num(v) else None
        oil_l = liters(r["Ölmenge mit Filter"])
        bikes.append({
            "brand": brand, "brand_slug": slugify(brand), "name": name, "slug": slugify(name),
            "category": CATEGORY[r["Kategorie (Pixel-Motorrad)"]], "drive": DRIVE[r["Antrieb"]],
            "year_from": int(years[0]) if years else None,
            "year_to": int(years[1]) if len(years) > 1 else None,
            "oil_spec": r["Ölsorte"] or None, "oil_l": float(oil_l) if oil_l else None,
            "status": STATUS[r["Status"]], "note": r["Hinweis"] or None,
            "sources": [s.strip() for s in r["Quellen"].split(",") if s.strip()],
            "oil_km": to_int(r["Ölwechsel alle km"]),
            "oil_months": to_int(r["Ölwechsel spätestens nach Monaten"]),
            "valve_km": to_int(r["Ventilspiel prüfen alle km"]),
            "list": r["Liste"], "rank": to_int(r["Rang CH 2025"]),
            "reg_2025": to_int(r["Zulassungen 2025"]), "reg_2024": to_int(r["Zulassungen 2024"]),
        })

    dump = lambda d: "[\n" + ",\n".join(json.dumps(x, ensure_ascii=False) for x in d) + "\n]"
    sql = f"""-- =====================================================================
--  Migration 002 · Startdaten (automatisch erzeugt mit make_seed.py)
--  Quelle: motorrad-liste-schweiz.csv, warnleuchten.csv
--  Neue Modelle: CSV ergänzen und eine neue Migration erzeugen, statt
--  diese Datei zu ändern.
-- =====================================================================
{LOOKUPS}
-- ---------------------------------------------------------------------
-- Warnleuchten
-- ---------------------------------------------------------------------
create temp table _lights as
select * from jsonb_to_recordset($json${dump(lights)}$json$::jsonb) as x(
  code text, severity text, colors text, std boolean, name text,
  aliases text, meaning text, action text, sort smallint);

insert into public.warning_lights (code, severity_code, colors, is_standardized, icon_key, sort_order)
select code, severity, colors, std, code, sort from _lights;

insert into public.warning_light_translations (warning_light_code, locale_code, name, aliases, meaning, action)
select code, 'de', name, aliases, meaning, action from _lights;

drop table _lights;

-- ---------------------------------------------------------------------
-- Modelle, Varianten, Intervalle, Quellen, Zulassungen CH
-- ---------------------------------------------------------------------
create temp table _bikes as
select * from jsonb_to_recordset($json${dump(bikes)}$json$::jsonb) as x(
  brand text, brand_slug text, name text, slug text, category text, drive text,
  year_from smallint, year_to smallint, oil_spec text, oil_l numeric, status text,
  note text, sources text[], oil_km integer, oil_months integer, valve_km integer,
  list text, rank smallint, reg_2025 integer, reg_2024 integer);

-- Quellen (Titel/URL im Dashboard nachtragen)
insert into public.data_sources (code)
select distinct unnest(sources) from _bikes order by 1;

insert into public.manufacturers (name, slug)
select distinct brand, brand_slug from _bikes;

insert into public.models (manufacturer_id, name, slug, category_code, drive_type_code)
select m.id, b.name, b.slug, b.category, b.drive
from _bikes b join public.manufacturers m on m.slug = b.brand_slug;

-- eine Variante pro Zeile der Liste; ID merken für die nächsten Schritte
alter table _bikes add column variant_id uuid;
update _bikes set variant_id = gen_random_uuid();

insert into public.model_variants
  (id, model_id, year_from, year_to, oil_spec, oil_capacity_with_filter_l, data_status_code, notes)
select b.variant_id, md.id, b.year_from, b.year_to, b.oil_spec, b.oil_l, b.status, b.note
from _bikes b
join public.manufacturers m on m.slug = b.brand_slug
join public.models md on md.manufacturer_id = m.id and md.slug = b.slug;

insert into public.model_variant_sources (model_variant_id, source_id)
select b.variant_id, s.id
from _bikes b cross join lateral unnest(b.sources) as src(code)
join public.data_sources s on s.code = src.code;

insert into public.model_maintenance_intervals
  (model_variant_id, task_type_code, interval_km, interval_period, data_status_code)
select variant_id, 'oil_change', oil_km, make_interval(months => oil_months), status
from _bikes where oil_km is not null or oil_months is not null
union all
select variant_id, 'valve_check', valve_km, null, status
from _bikes where valve_km is not null;

insert into public.model_maintenance_interval_sources (interval_id, source_id)
select i.id, s.id
from _bikes b
join public.model_maintenance_intervals i on i.model_variant_id = b.variant_id
cross join lateral unnest(b.sources) as src(code)
join public.data_sources s on s.code = src.code;

insert into public.model_registration_stats (model_id, country_code, year, registrations, rank, list_name)
select v.model_id, 'CH', y.year, y.n, y.rank, b.list
from _bikes b
join public.model_variants v on v.id = b.variant_id
cross join lateral (values (2025::smallint, b.reg_2025, b.rank), (2024::smallint, b.reg_2024, null::smallint)) as y(year, n, rank)
where y.n is not null;

drop table _bikes;
"""
    Path(out).write_text(sql, encoding="utf-8")
    print(f"{len(rows)} Modelle, {len(lights)} Warnleuchten -> {out}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
