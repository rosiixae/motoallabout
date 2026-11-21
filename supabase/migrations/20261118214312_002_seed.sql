-- =====================================================================
--  Migration 002 · Startdaten (automatisch erzeugt mit make_seed.py)
--  Quelle: motorrad-liste-schweiz.csv, warnleuchten.csv
--  Neue Modelle: CSV ergänzen und eine neue Migration erzeugen, statt
--  diese Datei zu ändern.
-- =====================================================================

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

-- ---------------------------------------------------------------------
-- Warnleuchten
-- ---------------------------------------------------------------------
create temp table _lights as
select * from jsonb_to_recordset($json$[
{"code": "oil_pressure", "severity": "red", "colors": "rot", "std": true, "name": "Öldruck", "aliases": null, "meaning": "Öldruck zu tief, Motor wird nicht richtig geschmiert. Kann beim starken Beschleunigen kurz aufflackern.", "action": "Sofort sicher anhalten, Motor aus, Ölstand prüfen/nachfüllen. Leuchtet weiter: nicht weiterfahren, Werkstatt.", "sort": 1},
{"code": "coolant", "severity": "red", "colors": "rot", "std": true, "name": "Kühlmitteltemperatur", "aliases": "nur wassergekühlte Motoren", "meaning": "Motor überhitzt (zu wenig Kühlflüssigkeit, Leck).", "action": "Anhalten, Motor aus, abkühlen lassen, dann Kühlflüssigkeit prüfen. Werkstatt prüfen lassen.", "sort": 2},
{"code": "battery", "severity": "red", "colors": "rot", "std": true, "name": "Ladekontrolle (Batterie)", "aliases": null, "meaning": "Batterie wird nicht geladen (Lichtmaschine, Regler, Batterie).", "action": "Verbraucher aus, direkt zur Werkstatt. Motor springt evtl. nicht mehr an.", "sort": 3},
{"code": "brake", "severity": "red", "colors": "rot", "std": true, "name": "Bremsanlage", "aliases": "nicht bei allen Modellen", "meaning": "Störung Bremsanlage, oft zu wenig Bremsflüssigkeit.", "action": "Vorsichtig anhalten, Bremsflüssigkeit prüfen. Bremsen anders: nicht weiterfahren.", "sort": 4},
{"code": "general", "severity": "red", "colors": "rot oder gelb", "std": false, "name": "Allgemeine Warnung", "aliases": "z. B. BMW", "meaning": "Sammelwarnung, Display zeigt Details.", "action": "Display-Text lesen, Handbuch. Rot: anhalten.", "sort": 5},
{"code": "hazard", "severity": "red", "colors": "rot (oder beide grünen Blinkerpfeile)", "std": true, "name": "Warnblinker", "aliases": null, "meaning": "Warnblinkanlage an.", "action": "Nur bei Panne/Stauende, danach ausschalten.", "sort": 6},
{"code": "mil", "severity": "yellow", "colors": "gelb", "std": true, "name": "Motorkontrollleuchte", "aliases": "Motorstörung, FI, PGM-FI", "meaning": "Störung Motorsteuerung/Abgasreinigung. Blinkt: Zündaussetzer.", "action": "Leuchtet: hohe Drehzahlen meiden, bald Werkstatt. Blinkt: anhalten, 10 Min. abkühlen; blinkt wieder: max. 50 km/h zur Werkstatt.", "sort": 7},
{"code": "abs", "severity": "yellow", "colors": "gelb", "std": true, "name": "ABS", "aliases": null, "meaning": "Selbsttest, geht ab ca. 5–10 km/h aus. Während der Fahrt: ABS gestört.", "action": "Bremsen ohne ABS möglich, vorsichtig bremsen, Werkstatt.", "sort": 8},
{"code": "fuel", "severity": "yellow", "colors": "gelb", "std": true, "name": "Kraftstoffreserve", "aliases": null, "meaning": "Tank fast leer.", "action": "Bald tanken.", "sort": 9},
{"code": "oil_level", "severity": "yellow", "colors": "gelb", "std": false, "name": "Ölstand niedrig", "aliases": "nicht = Öldruck", "meaning": "Ölstand unter Minimum.", "action": "Ölstand auf ebenem Boden prüfen, nachfüllen.", "sort": 10},
{"code": "tc", "severity": "yellow", "colors": "gelb", "std": false, "name": "Traktionskontrolle", "aliases": "TCS, KTRC, ASC, DTC, MTC, HSTC", "meaning": "Blinkt: greift ein (normal). Dauernd: aus oder gestört.", "action": "Blinkt: sanfter Gas. Dauernd ohne eigenes Ausschalten: Werkstatt.", "sort": 11},
{"code": "tpms", "severity": "yellow", "colors": "gelb", "std": true, "name": "Reifendruck", "aliases": "RDC, TPMS", "meaning": "Reifendruck zu tief oder Sensor gestört.", "action": "Anhalten, Druck messen.", "sort": 12},
{"code": "service", "severity": "yellow", "colors": "gelb", "std": false, "name": "Service fällig", "aliases": "Schraubenschlüssel", "meaning": "Service-Intervall erreicht.", "action": "Werkstatttermin.", "sort": 13},
{"code": "ice", "severity": "yellow", "colors": "gelb (oft weiss)", "std": false, "name": "Glättewarnung", "aliases": "Eiskristall", "meaning": "Glatteis möglich.", "action": "Vorsichtig fahren, v. a. Brücken und Schatten.", "sort": 14},
{"code": "immobilizer", "severity": "yellow", "colors": "gelb (je nach Marke rot)", "std": false, "name": "Wegfahrsperre", "aliases": "HISS, EWS", "meaning": "Bleibt an: Schlüssel nicht erkannt. Blinkt bei Zündung aus: Diebstahlschutz aktiv (normal).", "action": "Andere Schlüssel weg, nochmals versuchen; sonst Ersatzschlüssel/Werkstatt.", "sort": 15},
{"code": "sidestand", "severity": "yellow", "colors": "gelb", "std": false, "name": "Seitenständer ausgeklappt", "aliases": null, "meaning": "Seitenständer unten.", "action": "Vor dem Losfahren hochklappen.", "sort": 16},
{"code": "rear_fog", "severity": "yellow", "colors": "gelb", "std": true, "name": "Nebelschlussleuchte", "aliases": null, "meaning": "Nebelschlussleuchte an.", "action": "Nur bei dichtem Nebel.", "sort": 17},
{"code": "bulb", "severity": "yellow", "colors": "gelb", "std": false, "name": "Lampenausfall", "aliases": null, "meaning": "Lampe defekt.", "action": "Lichter prüfen, Lampe ersetzen.", "sort": 18},
{"code": "neutral", "severity": "info", "colors": "grün", "std": true, "name": "Leerlauf (N)", "aliases": null, "meaning": "Kein Gang eingelegt.", "action": "Nichts.", "sort": 19},
{"code": "turn", "severity": "info", "colors": "grün", "std": true, "name": "Blinker", "aliases": null, "meaning": "Blinker an.", "action": "Nach dem Abbiegen ausschalten.", "sort": 20},
{"code": "high", "severity": "info", "colors": "blau", "std": true, "name": "Fernlicht", "aliases": null, "meaning": "Fernlicht an.", "action": "Bei Gegenverkehr abblenden.", "sort": 21},
{"code": "low", "severity": "info", "colors": "grün", "std": true, "name": "Abblendlicht", "aliases": "oft nicht vorhanden", "meaning": "Abblendlicht an.", "action": "Nichts.", "sort": 22},
{"code": "position", "severity": "info", "colors": "grün", "std": true, "name": "Standlicht", "aliases": null, "meaning": "Standlicht an.", "action": "Beim Parken nicht vergessen.", "sort": 23},
{"code": "front_fog", "severity": "info", "colors": "grün", "std": true, "name": "Nebel-/Zusatzscheinwerfer", "aliases": null, "meaning": "Nebelscheinwerfer an.", "action": "Nichts.", "sort": 24},
{"code": "cruise", "severity": "info", "colors": "grün (weiss = bereit)", "std": false, "name": "Tempomat", "aliases": null, "meaning": "Tempomat bereit/aktiv.", "action": "Bremse, Kupplung oder Gas zurück schaltet aus.", "sort": 25},
{"code": "grip", "severity": "info", "colors": "grün", "std": false, "name": "Griffheizung", "aliases": null, "meaning": "Griffheizung an.", "action": "Bei schwacher Batterie aus.", "sort": 26},
{"code": "seat", "severity": "info", "colors": "grün", "std": false, "name": "Sitzheizung", "aliases": null, "meaning": "Sitzheizung an.", "action": "Nichts.", "sort": 27},
{"code": "shift", "severity": "info", "colors": "grün (oft weiss/rot)", "std": false, "name": "Schaltanzeige", "aliases": "Shift, Schaltblitz", "meaning": "Hochschalten.", "action": "Gang hochschalten.", "sort": 28}
]$json$::jsonb) as x(
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
select * from jsonb_to_recordset($json$[
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "MT 07", "slug": "mt-07", "category": "naked", "drive": "chain", "year_from": 2014, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": 2.6, "status": "verified", "note": "Ölmenge laut Handbuch 1. Generation", "sources": ["S0", "S1", "S2", "S3"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 1, "reg_2025": 829, "reg_2024": 754},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Z 900", "slug": "z-900", "category": "naked", "drive": "chain", "year_from": 2017, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": 3.8, "status": "verified", "note": "Ölmenge gilt für 2017–2022", "sources": ["S0", "S1", "S4"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 2, "reg_2025": 762, "reg_2024": 528},
{"brand": "BMW", "brand_slug": "bmw", "name": "R 1300 GS", "slug": "r-1300-gs", "category": "adventure", "drive": "shaft", "year_from": 2024, "year_to": null, "oil_spec": "5W-40 (BMW Advantec Ultimate)", "oil_l": null, "status": "verified", "note": "Keine Kettenpflege; Kardanwelle laut Quelle nach 60'000 km tauschen", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000, "list": "Top 50 Motorräder", "rank": 3, "reg_2025": 648, "reg_2024": 933},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "MT 125", "slug": "mt-125", "category": "naked", "drive": "chain", "year_from": 2014, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "to_check", "note": "Werte vom Schwestermodell XSR125 (Inspektion 6'000 km, Öl schon nach 3'000 km); im CH-Handbuch bestätigen", "sources": ["S0", "S1"], "oil_km": 3000, "oil_months": 12, "valve_km": 6000, "list": "Top 50 Motorräder", "rank": 4, "reg_2025": 568, "reg_2024": 718},
{"brand": "BMW", "brand_slug": "bmw", "name": "R 1300 GS Adventure", "slug": "r-1300-gs-adventure", "category": "adventure", "drive": "shaft", "year_from": 2025, "year_to": null, "oil_spec": "5W-40", "oil_l": null, "status": "verified", "note": "Keine Kettenpflege", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000, "list": "Top 50 Motorräder", "rank": 5, "reg_2025": 560, "reg_2024": 73},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "Tracer 9 GT / GT+", "slug": "tracer-9-gt-gt", "category": "sport_tourer", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 6, "reg_2025": 557, "reg_2024": 340},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "MT 09 / SP", "slug": "mt-09-sp", "category": "naked", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": null, "status": "verified", "note": "Ölfilter nur alle 20'000 km", "sources": ["S0", "S1", "S11"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 7, "reg_2025": 556, "reg_2024": 587},
{"brand": "Honda", "brand_slug": "honda", "name": "CB 750 Hornet", "slug": "cb-750-hornet", "category": "naked", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "10W-30, JASO T903 MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 8, "reg_2025": 497, "reg_2024": 561},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "YZF-R 125", "slug": "yzf-r-125", "category": "supersport", "drive": "chain", "year_from": 2019, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "to_check", "note": "Wie MT-125 (gleicher Motor) – bestätigen", "sources": ["S0", "S1"], "oil_km": 3000, "oil_months": 12, "valve_km": 6000, "list": "Top 50 Motorräder", "rank": 9, "reg_2025": 468, "reg_2024": 442},
{"brand": "Beta", "brand_slug": "beta", "name": "RR 125", "slug": "rr-125", "category": "enduro", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 50 Motorräder", "rank": 10, "reg_2025": 457, "reg_2024": 405},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "Ténéré 700", "slug": "tenere-700", "category": "adventure", "drive": "chain", "year_from": 2019, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": null, "status": "verified", "note": "Ölfilter nur alle 20'000 km", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 11, "reg_2025": 442, "reg_2024": 394},
{"brand": "Aprilia", "brand_slug": "aprilia", "name": "RS 457", "slug": "rs-457", "category": "supersport", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 50 Motorräder", "rank": 12, "reg_2025": 399, "reg_2024": 226},
{"brand": "Fantic", "brand_slug": "fantic", "name": "XMF 125", "slug": "xmf-125", "category": "supermoto", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Laut Werkstatt-Ratgeber Öl alle 3'000 km", "sources": ["S0", "S9"], "oil_km": 3000, "oil_months": null, "valve_km": null, "list": "Top 50 Motorräder", "rank": 13, "reg_2025": 358, "reg_2024": 302},
{"brand": "Aprilia", "brand_slug": "aprilia", "name": "SX 125", "slug": "sx-125", "category": "supermoto", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 50 Motorräder", "rank": 14, "reg_2025": 354, "reg_2024": 346},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "R7", "slug": "r7", "category": "supersport", "drive": "chain", "year_from": 2022, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "to_check", "note": "Quelle: 6'000 km / 6 Mt – die MT-07 mit gleichem Motor hat 10'000 km; Handbuch prüfen", "sources": ["S0", "S1"], "oil_km": 6000, "oil_months": 6, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 15, "reg_2025": 348, "reg_2024": 356},
{"brand": "Aprilia", "brand_slug": "aprilia", "name": "RS 660", "slug": "rs-660", "category": "supersport", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000, "list": "Top 50 Motorräder", "rank": 16, "reg_2025": 339, "reg_2024": 414},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "XSR 125", "slug": "xsr-125", "category": "cafe_racer", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": null, "status": "verified", "note": "Inspektion mit Ölfilter alle 6'000 km", "sources": ["S0", "S1"], "oil_km": 3000, "oil_months": 12, "valve_km": 6000, "list": "Top 50 Motorräder", "rank": 17, "reg_2025": 297, "reg_2024": 160},
{"brand": "Honda", "brand_slug": "honda", "name": "CB 1000 Hornet / SP", "slug": "cb-1000-hornet-sp", "category": "naked", "drive": "chain", "year_from": 2025, "year_to": null, "oil_spec": "10W-30", "oil_l": null, "status": "to_check", "note": "Quelle nennt US-Werte (12'800 / 38'000 km)", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 38000, "list": "Top 50 Motorräder", "rank": 18, "reg_2025": 280, "reg_2024": 0},
{"brand": "Honda", "brand_slug": "honda", "name": "XL 750 Transalp", "slug": "xl-750-transalp", "category": "adventure", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "10W-30", "oil_l": null, "status": "verified", "note": "Ölfilter nur alle 24'000 km", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 19, "reg_2025": 274, "reg_2024": 290},
{"brand": "Honda", "brand_slug": "honda", "name": "CRF 1100 L Africa Twin (alle)", "slug": "crf-1100-l-africa-twin-alle", "category": "adventure", "drive": "chain", "year_from": 2020, "year_to": null, "oil_spec": "10W-30, JASO MA", "oil_l": null, "status": "to_check", "note": "Quelle nennt US-Werte (12'800 / 25'600 km)", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 20, "reg_2025": 267, "reg_2024": 278},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Z 650", "slug": "z-650", "category": "naked", "drive": "chain", "year_from": 2017, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 21, "reg_2025": 266, "reg_2024": 304},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Ninja ZX-4R", "slug": "ninja-zx-4r", "category": "supersport", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 22, "reg_2025": 249, "reg_2024": 95},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "XSR 700", "slug": "xsr-700", "category": "cafe_racer", "drive": "chain", "year_from": 2016, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 23, "reg_2025": 236, "reg_2024": 78},
{"brand": "Honda", "brand_slug": "honda", "name": "CBR 650 R", "slug": "cbr-650-r", "category": "supersport", "drive": "chain", "year_from": 2019, "year_to": null, "oil_spec": "10W-30, JASO T903 MA", "oil_l": null, "status": "to_check", "note": "Quelle nennt US-Werte (12'800 / 38'400 km)", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 38000, "list": "Top 50 Motorräder", "rank": 24, "reg_2025": 233, "reg_2024": 155},
{"brand": "Honda", "brand_slug": "honda", "name": "CB 125 R", "slug": "cb-125-r", "category": "naked", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 50 Motorräder", "rank": 25, "reg_2025": 220, "reg_2024": 154},
{"brand": "Honda", "brand_slug": "honda", "name": "NT 1100", "slug": "nt-1100", "category": "tourer", "drive": "chain", "year_from": 2022, "year_to": null, "oil_spec": "10W-30, JASO T903 MA", "oil_l": null, "status": "to_check", "note": "Quelle nennt US-Werte (12'800 / 25'600 km), ohne Zeitangabe", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 26, "reg_2025": 220, "reg_2024": 202},
{"brand": "Honda", "brand_slug": "honda", "name": "CMX 500 A Rebel", "slug": "cmx-500-a-rebel", "category": "cruiser", "drive": "chain", "year_from": 2017, "year_to": null, "oil_spec": "10W-30, JASO MA", "oil_l": null, "status": "to_check", "note": "Quelle nennt US-Werte (12'800 / 25'600 km)", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 27, "reg_2025": 201, "reg_2024": 169},
{"brand": "Honda", "brand_slug": "honda", "name": "CB 500 F", "slug": "cb-500-f", "category": "naked", "drive": "chain", "year_from": 2019, "year_to": null, "oil_spec": "10W-30, JASO MA", "oil_l": null, "status": "to_check", "note": "Quelle nennt US-Werte 12'800 / 25'600 km; EU-Handbücher rechnen meist in 12'000er-Schritten", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 28, "reg_2025": 198, "reg_2024": 199},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Ninja 650", "slug": "ninja-650", "category": "supersport", "drive": "chain", "year_from": 2017, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": "Silhouette eher Sport, nicht Rennsport", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 29, "reg_2025": 186, "reg_2024": 119},
{"brand": "SWM", "brand_slug": "swm", "name": "SM 125 R", "slug": "sm-125-r", "category": "supermoto", "drive": "chain", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 50 Motorräder", "rank": 30, "reg_2025": 184, "reg_2024": 254},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Ninja 500", "slug": "ninja-500", "category": "supersport", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": 2.3, "status": "verified", "note": "Quelle sagt nicht, ob 2,3 L mit Filter sind", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 31, "reg_2025": 174, "reg_2024": 179},
{"brand": "Zontes", "brand_slug": "zontes", "name": "368 G", "slug": "368-g", "category": "adventure", "drive": "chain", "year_from": 2025, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 50 Motorräder", "rank": 32, "reg_2025": 172, "reg_2024": 0},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "Tracer 7", "slug": "tracer-7", "category": "sport_tourer", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 33, "reg_2025": 170, "reg_2024": 96},
{"brand": "CF Moto", "brand_slug": "cf-moto", "name": "450 MT", "slug": "450-mt", "category": "adventure", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "10W-40, JASO MA2", "oil_l": null, "status": "verified", "note": "Kurzes Ölintervall beachten", "sources": ["S0", "S1"], "oil_km": 5000, "oil_months": 6, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 34, "reg_2025": 159, "reg_2024": 103},
{"brand": "Voge", "brand_slug": "voge", "name": "900 DSX", "slug": "900-dsx", "category": "adventure", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 50 Motorräder", "rank": 35, "reg_2025": 154, "reg_2024": 59},
{"brand": "BMW", "brand_slug": "bmw", "name": "M 1000 R", "slug": "m-1000-r", "category": "naked", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": 3.5, "status": "verified", "note": "Quelle sagt nicht, ob 3,5 L mit Filter sind", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 30000, "list": "Top 50 Motorräder", "rank": 36, "reg_2025": 153, "reg_2024": 155},
{"brand": "BMW", "brand_slug": "bmw", "name": "F 900 R", "slug": "f-900-r", "category": "naked", "drive": "chain", "year_from": 2020, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": null, "status": "to_check", "note": "Werte vom F 900 GS (gleiche Motorfamilie) übernommen", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000, "list": "Top 50 Motorräder", "rank": 37, "reg_2025": 151, "reg_2024": 111},
{"brand": "BMW", "brand_slug": "bmw", "name": "F 800 GS", "slug": "f-800-gs", "category": "adventure", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": null, "status": "to_check", "note": "Werte vom Vorgänger F 850 GS übernommen", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000, "list": "Top 50 Motorräder", "rank": 38, "reg_2025": 148, "reg_2024": 112},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Z 500", "slug": "z-500", "category": "naked", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": 2.3, "status": "to_check", "note": "Gleicher Motor wie Ninja 500 übernommen", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 39, "reg_2025": 148, "reg_2024": 183},
{"brand": "Honda", "brand_slug": "honda", "name": "NC 750 X", "slug": "nc-750-x", "category": "sport_tourer", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-30, JASO T903 MA", "oil_l": null, "status": "to_check", "note": "Quelle nennt US-Werte (12'800 / 25'600 km)", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Top 50 Motorräder", "rank": 40, "reg_2025": 147, "reg_2024": 87},
{"brand": "Honda", "brand_slug": "honda", "name": "CB 650 R", "slug": "cb-650-r", "category": "naked", "drive": "chain", "year_from": 2019, "year_to": null, "oil_spec": "10W-30, JASO T903 MA", "oil_l": null, "status": "to_check", "note": "Quelle nennt US-Werte (12'800 / 38'400 km)", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 38000, "list": "Top 50 Motorräder", "rank": 41, "reg_2025": 146, "reg_2024": 124},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Z 125", "slug": "z-125", "category": "naked", "drive": "chain", "year_from": 2017, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": 0.9, "status": "verified", "note": "Quelle sagt nicht, ob 0,9 L mit Filter sind", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 12000, "list": "Top 50 Motorräder", "rank": 42, "reg_2025": 143, "reg_2024": 148},
{"brand": "Triumph", "brand_slug": "triumph", "name": "Tiger Sport 800", "slug": "tiger-sport-800", "category": "sport_tourer", "drive": "chain", "year_from": 2025, "year_to": null, "oil_spec": "10W-40 oder 10W-50", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 16000, "oil_months": 12, "valve_km": 32000, "list": "Top 50 Motorräder", "rank": 43, "reg_2025": 143, "reg_2024": 0},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "MT 03", "slug": "mt-03", "category": "naked", "drive": "chain", "year_from": 2016, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "to_check", "note": "Werte von der YZF-R3 (gleicher Motor) übernommen", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 44, "reg_2025": 141, "reg_2024": 129},
{"brand": "Aprilia", "brand_slug": "aprilia", "name": "RS 125", "slug": "rs-125", "category": "supersport", "drive": "chain", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 50 Motorräder", "rank": 45, "reg_2025": 139, "reg_2024": 78},
{"brand": "BMW", "brand_slug": "bmw", "name": "F 900 XR", "slug": "f-900-xr", "category": "sport_tourer", "drive": "chain", "year_from": 2020, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": null, "status": "to_check", "note": "Werte vom F 900 GS (gleiche Motorfamilie) übernommen", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000, "list": "Top 50 Motorräder", "rank": 46, "reg_2025": 135, "reg_2024": 95},
{"brand": "KTM", "brand_slug": "ktm", "name": "790 Duke", "slug": "790-duke", "category": "naked", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": "Quelle gilt für 2018–2020", "sources": ["S0", "S1"], "oil_km": 15000, "oil_months": 12, "valve_km": 30000, "list": "Top 50 Motorräder", "rank": 47, "reg_2025": 130, "reg_2024": 214},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "YZF-R3", "slug": "yzf-r3", "category": "supersport", "drive": "chain", "year_from": 2015, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 48, "reg_2025": 129, "reg_2024": 118},
{"brand": "Triumph", "brand_slug": "triumph", "name": "Trident 660", "slug": "trident-660", "category": "naked", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 16000, "oil_months": 12, "valve_km": 32000, "list": "Top 50 Motorräder", "rank": 49, "reg_2025": 128, "reg_2024": 126},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "YZF-R1", "slug": "yzf-r1", "category": "supersport", "drive": "chain", "year_from": 2015, "year_to": null, "oil_spec": "10W-50 (Yamalube)", "oil_l": null, "status": "verified", "note": "Quelle gilt für 2015–2020", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000, "list": "Top 50 Motorräder", "rank": 50, "reg_2025": 128, "reg_2024": 135},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "NMAX 125", "slug": "nmax-125", "category": "scooter", "drive": "cvt", "year_from": 2015, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Händler-Servicekit nennt Inspektionen bei 12'000 / 24'000 km; Ölintervall im Handbuch prüfen", "sources": ["S0", "S12"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 10 Roller", "rank": 1, "reg_2025": 2218, "reg_2024": 1300},
{"brand": "Vespa", "brand_slug": "vespa", "name": "Primavera 125 3V", "slug": "primavera-125-3v", "category": "scooter", "drive": "cvt", "year_from": 2014, "year_to": null, "oil_spec": "5W-40, JASO MA2 / API SL", "oil_l": 1.0, "status": "to_check", "note": "Laut Handbuch-Zitat im Forum: Öl alle 10'000 km oder 10 Monate", "sources": ["S0", "S7", "S10"], "oil_km": 10000, "oil_months": 10, "valve_km": null, "list": "Top 10 Roller", "rank": 2, "reg_2025": 1879, "reg_2024": 1849},
{"brand": "Honda", "brand_slug": "honda", "name": "PCX 125", "slug": "pcx-125", "category": "scooter", "drive": "cvt", "year_from": 2014, "year_to": null, "oil_spec": "10W-30, JASO MB", "oil_l": 0.9, "status": "to_check", "note": "Honda-125er-Inspektionsplan in 6'000-km-Schritten; Roller brauchen JASO MB statt MA", "sources": ["S0", "S8", "S13"], "oil_km": 6000, "oil_months": 12, "valve_km": null, "list": "Top 10 Roller", "rank": 3, "reg_2025": 1508, "reg_2024": 1109},
{"brand": "Vespa", "brand_slug": "vespa", "name": "GTS 310", "slug": "gts-310", "category": "scooter", "drive": "cvt", "year_from": 2019, "year_to": null, "oil_spec": "5W-40, JASO MA/MA2 / API SL", "oil_l": 1.3, "status": "to_check", "note": "Ventile: HPE-Motor alle 10'000 km, ältere GTS 300 alle 20'000 km", "sources": ["S0", "S7", "S10"], "oil_km": 10000, "oil_months": 12, "valve_km": 10000, "list": "Top 10 Roller", "rank": 4, "reg_2025": 994, "reg_2024": 22},
{"brand": "Vespa", "brand_slug": "vespa", "name": "GTS 125", "slug": "gts-125", "category": "scooter", "drive": "cvt", "year_from": 2017, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": 1.1, "status": "to_check", "note": "Ältere Serviceheft-Angabe: alle 6'000 km – je nach Baujahr", "sources": ["S0", "S7", "S10"], "oil_km": 10000, "oil_months": 12, "valve_km": null, "list": "Top 10 Roller", "rank": 5, "reg_2025": 928, "reg_2024": 853},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "X-Max 300", "slug": "x-max-300", "category": "scooter", "drive": "cvt", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 10 Roller", "rank": 6, "reg_2025": 677, "reg_2024": 734},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "Ray ZR 125", "slug": "ray-zr-125", "category": "scooter", "drive": "cvt", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 10 Roller", "rank": 7, "reg_2025": 649, "reg_2024": 544},
{"brand": "Honda", "brand_slug": "honda", "name": "Vision 110", "slug": "vision-110", "category": "scooter", "drive": "cvt", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 10 Roller", "rank": 8, "reg_2025": 563, "reg_2024": 324},
{"brand": "Yamaha", "brand_slug": "yamaha", "name": "X-Max 125", "slug": "x-max-125", "category": "scooter", "drive": "cvt", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 10 Roller", "rank": 9, "reg_2025": 527, "reg_2024": 574},
{"brand": "Honda", "brand_slug": "honda", "name": "ADV 350", "slug": "adv-350", "category": "scooter", "drive": "cvt", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Keine verlässliche Quelle gefunden – Handbuch nötig", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null, "list": "Top 10 Roller", "rank": 10, "reg_2025": 495, "reg_2024": 362},
{"brand": "Suzuki", "brand_slug": "suzuki", "name": "GSX-8S", "slug": "gsx-8s", "category": "naked", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "to_check", "note": "Quelle sagt nicht, ob EU-Plan", "sources": ["S0", "S1"], "oil_km": 6000, "oil_months": 12, "valve_km": 24000, "list": "Weitere", "rank": null, "reg_2025": 115, "reg_2024": 160},
{"brand": "Honda", "brand_slug": "honda", "name": "Rebel 1100 (CMX1100)", "slug": "rebel-1100-cmx1100", "category": "cruiser", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-30, JASO MA", "oil_l": null, "status": "to_check", "note": "US-Werte; DCT-Version: zusätzlich Kupplungsölfilter", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Weitere", "rank": null, "reg_2025": 114, "reg_2024": 161},
{"brand": "Triumph", "brand_slug": "triumph", "name": "Speed 400", "slug": "speed-400", "category": "cafe_racer", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "to_check", "note": "Gleicher Motor wie Scrambler 400 X übernommen", "sources": ["S0", "S1"], "oil_km": 16000, "oil_months": 12, "valve_km": 32000, "list": "Weitere", "rank": null, "reg_2025": 114, "reg_2024": 197},
{"brand": "KTM", "brand_slug": "ktm", "name": "125 Duke", "slug": "125-duke", "category": "naked", "drive": "chain", "year_from": 2011, "year_to": null, "oil_spec": "15W-50", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 7500, "oil_months": 12, "valve_km": 15000, "list": "Weitere", "rank": null, "reg_2025": 105, "reg_2024": 218},
{"brand": "Triumph", "brand_slug": "triumph", "name": "Scrambler 400 X", "slug": "scrambler-400-x", "category": "scrambler", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 16000, "oil_months": 12, "valve_km": 32000, "list": "Weitere", "rank": null, "reg_2025": 101, "reg_2024": 159},
{"brand": "BMW", "brand_slug": "bmw", "name": "F 900 GS", "slug": "f-900-gs", "category": "adventure", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": 3.5, "status": "verified", "note": "Quelle sagt nicht, ob 3,5 L mit Filter sind", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000, "list": "Weitere", "rank": null, "reg_2025": 80, "reg_2024": 96},
{"brand": "KTM", "brand_slug": "ktm", "name": "390 Duke", "slug": "390-duke", "category": "naked", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "15W-50, JASO MA2", "oil_l": null, "status": "verified", "note": "Modelle 2013–2023: Öl 7'500 km, Ventile 15'000 km", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000, "list": "Weitere", "rank": null, "reg_2025": 77, "reg_2024": 183},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Z900RS", "slug": "z900rs", "category": "cafe_racer", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Weitere", "rank": null, "reg_2025": 67, "reg_2024": 81},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Vulcan S", "slug": "vulcan-s", "category": "cruiser", "drive": "chain", "year_from": 2015, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Weitere", "rank": null, "reg_2025": 65, "reg_2024": 60},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Versys 650", "slug": "versys-650", "category": "sport_tourer", "drive": "chain", "year_from": 2015, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Weitere", "rank": null, "reg_2025": 45, "reg_2024": 45},
{"brand": "Suzuki", "brand_slug": "suzuki", "name": "V-Strom 800DE", "slug": "v-strom-800de", "category": "adventure", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "to_check", "note": "Quelle sagt nicht, ob EU-Plan", "sources": ["S0", "S1"], "oil_km": 6000, "oil_months": 12, "valve_km": 24000, "list": "Weitere", "rank": null, "reg_2025": 43, "reg_2024": 52},
{"brand": "KTM", "brand_slug": "ktm", "name": "890 Adventure", "slug": "890-adventure", "category": "adventure", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 15000, "oil_months": 12, "valve_km": 30000, "list": "Weitere", "rank": null, "reg_2025": 39, "reg_2024": 73},
{"brand": "Kawasaki", "brand_slug": "kawasaki", "name": "Z650RS", "slug": "z650rs", "category": "cafe_racer", "drive": "chain", "year_from": 2022, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000, "list": "Weitere", "rank": null, "reg_2025": 34, "reg_2024": 54},
{"brand": "Royal Enfield", "brand_slug": "royal-enfield", "name": "Interceptor 650 / Continental GT", "slug": "interceptor-650-continental-gt", "category": "cafe_racer", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": "Ventile jedes Jahr prüfen", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 10000, "list": "Weitere", "rank": null, "reg_2025": 31, "reg_2024": 29},
{"brand": "BMW", "brand_slug": "bmw", "name": "R 1250 RT", "slug": "r-1250-rt", "category": "tourer", "drive": "shaft", "year_from": 2019, "year_to": 2025, "oil_spec": "5W-40, JASO MA2", "oil_l": null, "status": "to_check", "note": "Gleicher Motor wie R 1250 GS übernommen; keine Kettenpflege", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000, "list": "Weitere", "rank": null, "reg_2025": 3, "reg_2024": 64},
{"brand": "Ducati", "brand_slug": "ducati", "name": "Monster (937)", "slug": "monster-937", "category": "naked", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Ölsorte fehlt in der Quelle", "sources": ["S0", "S1"], "oil_km": 15000, "oil_months": 24, "valve_km": 30000, "list": "Weitere", "rank": null, "reg_2025": null, "reg_2024": null},
{"brand": "BMW", "brand_slug": "bmw", "name": "R 1250 GS / GS Adventure", "slug": "r-1250-gs-gs-adventure", "category": "adventure", "drive": "shaft", "year_from": 2019, "year_to": 2023, "oil_spec": "5W-40, API SL / JASO MA2", "oil_l": null, "status": "verified", "note": "Keine Kettenpflege", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000, "list": "Weitere", "rank": null, "reg_2025": null, "reg_2024": null},
{"brand": "Fantic", "brand_slug": "fantic", "name": "XEF 125", "slug": "xef-125", "category": "enduro", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Laut Werkstatt-Ratgeber Öl alle 3'000 km; gleicher Motor wie XMF 125", "sources": ["S0", "S9"], "oil_km": 3000, "oil_months": null, "valve_km": null, "list": "Weitere", "rank": null, "reg_2025": null, "reg_2024": null},
{"brand": "Ducati", "brand_slug": "ducati", "name": "Scrambler 800", "slug": "scrambler-800", "category": "scrambler", "drive": "chain", "year_from": 2015, "year_to": 2022, "oil_spec": "15W-50", "oil_l": 3.7, "status": "verified", "note": "Quelle sagt nicht, ob 3,7 L mit Filter sind", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 12000, "list": "Weitere", "rank": null, "reg_2025": null, "reg_2024": null}
]$json$::jsonb) as x(
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
