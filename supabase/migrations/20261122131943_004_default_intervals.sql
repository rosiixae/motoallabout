-- =====================================================================
--  Migration 004 · Standard-Wartungsintervalle mit Quellen
-- =====================================================================
--  Diese Werte gelten nur, wenn für ein Modell im Katalog nichts steht
--  und die Person nichts Eigenes eingestellt hat
--  (Reihenfolge: eigene Anpassung → Katalog → Standardwert).
--  Was stark vom Modell abhängt (Ventilspiel, Zündkerzen, Luftfilter,
--  Kardanöl, Zahnriemen, Variomatik), bekommt bewusst keinen Standardwert.
--
--  Ausserdem:
--    - neue Wartungsart «mfk» (amtliche Fahrzeugprüfung Schweiz)
--    - Motorrad: Datum 1. Inverkehrsetzung und nächste MFK
--    - Quellen der Standardwerte (Tabelle maintenance_task_type_sources)
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Quellen
-- ---------------------------------------------------------------------
insert into public.data_sources (code, title, url, accessed_on) values
  ('G1',  'TCS – Frühlingscheck fürs Motorrad', 'https://www.tcs.ch/de/testberichte-ratgeber/ratgeber/kontrollen-unterhalt/fruehlingscheck.php', '2026-11-22'),
  ('G2',  'MOTORRAD – Richtige Kettenpflege: spannen und schmieren', 'https://www.motorradonline.de/ratgeber/richtige-kettenpflege-beim-motorrad-spannen-und-schmieren', '2026-11-22'),
  ('G3',  'Motul – Pflegetipps Motorrad (PDF)', 'https://motul.com/de/de/document_assets/251', '2026-11-22'),
  ('G4',  'Allianz Direct – Motorrad-Reifendruck', 'https://www.allianzdirect.de/motorradversicherung/motorrad-reifendruck-ratgeber/', '2026-11-22'),
  ('G5',  'ADAC – Motorrad: Auf die Reifen kommt es an', 'https://www.adac.de/rund-ums-fahrzeug/motorrad-roller/technik-zubehoer-rueckrufe/reifen/', '2026-11-22'),
  ('G6',  'TCS – FAQ Reifen (Mindestprofiltiefe 1.6 mm)', 'https://www.tcs.ch/de/testberichte-ratgeber/ratgeber/reifen/faq-reifen.php', '2026-11-22'),
  ('G7',  'MOTORRAD – Bremsflüssigkeit wechseln', 'https://www.motorradonline.de/ratgeber/bremsfluessigkeit-wechseln-die-bremsanlage-mit-neuer-fluessigkeit-befuellen/', '2026-11-22'),
  ('G8',  'Louis – Hydraulische Motorradbremse (PDF)', 'https://cdn3.louis.de/content/catalogue/articles/zusatz/anl/hydraulischeMotoradbremse.pdf', '2026-11-22'),
  ('G9',  'Yamaha Tracer 9 – Wartungstabelle (PDF)', 'https://mt09.de/forum/core/attachment/39412-yamaha-tracer-9-wartungstabelle-pdf', '2026-11-22'),
  ('G10', 'Yamaha MT-07 – Bedienungsanleitung, Wartungsplan', 'https://manualslib.com/manual/1161614/Yamaha-Mt07.html?page=56', '2026-11-22'),
  ('G11', 'ch.ch – Fahrzeugprüfung', 'https://ch.ch/de/fahrzeuge-und-verkehr/autos-und-andere-fahrzeuge/fahrzeugpruefung', '2026-11-22'),
  ('G12', 'Beobachter – Periodische Fahrzeugprüfung (MFK)', 'https://www.beobachter.ch/beratung/rechtsratgeber/strassenverkehr/verkehrszulassung-von-fahrzeugen/motorfahrzeugkontrolle-mfk/periodische-fahrzeugprufung-mfk', '2026-11-22'),
  ('G13', 'TCS St. Gallen – MFK Motorrad und Roller', 'https://www.tcs.ch/de/der-tcs/sektionen/st-gallen-appenzell-innerrhoden/content/fahrzeugkontrollen/mfksgeb-moto.php', '2026-11-22');

create table public.maintenance_task_type_sources (
  task_type_code  text not null references public.maintenance_task_types(code) on delete cascade,
  source_id       uuid not null references public.data_sources(id) on delete cascade,
  primary key (task_type_code, source_id)
);
create index maintenance_task_type_sources_source_id_idx
  on public.maintenance_task_type_sources (source_id);

alter table public.maintenance_task_type_sources enable row level security;
create policy "public read" on public.maintenance_task_type_sources for select using (true);
grant select on public.maintenance_task_type_sources to anon, authenticated;


-- ---------------------------------------------------------------------
-- 2. Neue Wartungsart: MFK
--    Kein festes Intervall: 1. Prüfung 5 Jahre nach der 1. Inverkehr-
--    setzung, dann nach 3 Jahren, danach alle 2 Jahre. Die App rechnet
--    das aus (oder nimmt das Datum aus dem Aufgebot).
-- ---------------------------------------------------------------------
insert into public.maintenance_task_types
  (code, name_i18n, drive_type_code, seasonal_month, can_do_yourself, sort_order) values
  ('mfk', '{"de": "MFK (amtliche Prüfung)", "en": "Official inspection (MFK)"}', null, null, false, 20);

alter table public.motorcycles
  add column first_registration_on date,          -- 1. Inverkehrsetzung (Fahrzeugausweis, Feld 36)
  add column next_inspection_on    date;          -- nächste MFK, z.B. aus dem Aufgebot


-- ---------------------------------------------------------------------
-- 3. Standardwerte und Beschreibungen
-- ---------------------------------------------------------------------
update public.maintenance_task_types t set
  default_interval_km = v.km,
  default_interval    = v.period,
  description_i18n    = jsonb_build_object('de', v.description)
from (values
  ('oil_change',      null::integer, interval '12 months',
   'Öl mindestens einmal im Jahr wechseln, auch wenn wenig gefahren wurde. Die km-Angabe kommt vom Modell.'),
  ('oil_filter',      null,          interval '12 months',
   'Ölfilter in der Regel zusammen mit dem Öl. Manche Modelle nur bei jedem zweiten Ölwechsel (siehe Modell).'),
  ('general_service', null,          interval '12 months',
   'Jährliche Kontrolle laut Wartungsplan. Die km-Angabe kommt vom Modell.'),
  ('chain_care',      500,           null,
   'Kette alle 300–1000 km reinigen und schmieren, nach Regenfahrten sofort. Nur im Leerlauf und bei stehendem Motor.'),
  ('chain_check',     1000,          null,
   'Durchhang und Verschleiss der Kette prüfen. Sollwert für den Durchhang steht im Handbuch.'),
  ('tire_pressure',   null,          interval '14 days',
   'Am kalten Reifen messen, alle zwei Wochen und vor jeder längeren Fahrt. Sollwerte stehen im Handbuch.'),
  ('tire_check',      null,          interval '1 month',
   'Profil (gesetzlich mind. 1.6 mm), Risse, Fremdkörper und Reifenalter (DOT-Nummer) prüfen.'),
  ('brake_fluid',     null,          interval '24 months',
   'Bremsflüssigkeit spätestens alle 2 Jahre wechseln lassen, weil sie Wasser aufnimmt.'),
  ('brake_pads',      null,          interval '12 months',
   'Belagdicke prüfen (Verschleissmarke). Vor längeren Touren zusätzlich kontrollieren.'),
  ('coolant',         null,          interval '36 months',
   'Kühlflüssigkeit wechseln (z.B. Yamaha: alle 3 Jahre). Stand regelmässig bei kaltem Motor prüfen. Nur bei wassergekühlten Motoren.'),
  ('winter_prep',     null,          interval '12 months',
   'Einwintern: waschen, Kette pflegen, volltanken, Reifendruck erhöhen, Batterie ans Erhaltungsladegerät.'),
  ('spring_check',    null,          interval '12 months',
   'Frühlingscheck: Batterie, Reifen, Bremsen, Kette, Licht und Flüssigkeiten prüfen.'),
  ('mfk',             null,          null,
   'Amtliche Prüfung: erstmals 5 Jahre nach der 1. Inverkehrsetzung, dann nach 3 Jahren, danach alle 2 Jahre. Das Strassenverkehrsamt bietet dich auf.')
) as v(code, km, period, description)
where t.code = v.code;

insert into public.maintenance_task_type_sources (task_type_code, source_id)
select v.task, s.id
from (values
  ('oil_change', 'G1'), ('oil_filter', 'G1'),
  ('general_service', 'G10'),
  ('chain_care', 'G2'), ('chain_care', 'G3'),
  ('chain_check', 'G3'),
  ('tire_pressure', 'G4'),
  ('tire_check', 'G5'), ('tire_check', 'G6'),
  ('brake_fluid', 'G7'), ('brake_fluid', 'G8'), ('brake_fluid', 'G9'),
  ('brake_pads', 'G9'),
  ('coolant', 'G9'), ('coolant', 'G10'),
  ('winter_prep', 'G1'), ('spring_check', 'G1'),
  ('mfk', 'G11'), ('mfk', 'G12'), ('mfk', 'G13')
) as v(task, source)
join public.data_sources s on s.code = v.source;
