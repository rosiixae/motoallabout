-- =====================================================================
--  Migration 008 · Modelldaten: offizielle Handbücher für SWM, Zontes, Voge, Yamaha RayZR (Recherche 23.11.2026) (automatisch erzeugt mit datenbank/make_model_update.py)
--  Quelle: motorrad-liste-schweiz.csv, datenbank/quellen.csv
--  Gleicht bestehende Modelle ab; legt keine neuen Modelle an.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Quellen: Titel, Link, Abrufdatum
-- ---------------------------------------------------------------------
insert into public.data_sources (code, title, url, accessed_on)
select code, title, url, accessed
from jsonb_to_recordset($json$[
{"code": "S0", "title": "motosuisse – Neufahrzeuge Jahresstatistik", "url": "https://www.motosuisse.ch/de/neufahrzeugejahr.html", "accessed": "2026-11-18"},
{"code": "S1", "title": "maintenanceschedule.com – Wartungspläne nach Besitzerhandbuch", "url": "https://maintenanceschedule.com/sitemap/", "accessed": "2026-11-18"},
{"code": "S2", "title": "Motorrad & Reisen – Yamaha MT-07 Y-AMT Datenblatt", "url": "https://www.motorradundreisen.de/motorraddatenbank/yamaha/mt-07-y-amt-29100.html", "accessed": "2026-11-18"},
{"code": "S3", "title": "Yamaha MT-07 Owner's Manual (manualslib)", "url": "https://manualslib.com/manual/837941/Yamaha-Mt-07.html?page=97", "accessed": "2026-11-18"},
{"code": "S4", "title": "Kawasaki Z900 Oil Change Guide", "url": "https://discountstarterandalternator.com/blog/kawasaki-z900-oil-change-guide", "accessed": "2026-11-18"},
{"code": "S5", "title": "bonus.ch – meistverkaufte Motorräder und Roller in der Schweiz 2024", "url": "https://www.bonus.ch/ND/Welches-sind-die-meistverkauften-motorrader-und-roller-in-der-schweiz-in-2024-ID202503251SLV.aspx", "accessed": "2026-11-18"},
{"code": "S6", "title": "1000PS – meistverkaufte Motorräder in der Schweiz 2023", "url": "https://www.1000ps.de/businessnews-id-3011019-die-meistverkauften-motorraeder-in-der-schweiz-2023", "accessed": "2026-11-18"},
{"code": "S7", "title": "ModernVespa Forum – Serviceintervalle", "url": "https://modernvespa.com/forum/topic193014", "accessed": "2026-11-18"},
{"code": "S8", "title": "Honda PCX125 (2022) Handleiding (manualslib)", "url": "https://manualslib.nl/manual/34272/Honda-Pcx125-2022.html?page=171", "accessed": "2026-11-18"},
{"code": "S9", "title": "Biketrails Pfannenstiel – Wann Ölwechsel beim Motorrad", "url": "https://biketrailspfannenstiel.ch/auskunft/wann-olwechsel-motorrad/", "accessed": "2026-11-18"},
{"code": "S10", "title": "bikerrated – Vespa Öltabelle", "url": "https://bikerrated.com/?p=19105", "accessed": "2026-11-18"},
{"code": "S11", "title": "mototech.ch – Yamaha MT-09 SP 2023", "url": "https://mototech.ch/en/yamaha/mt-09-sp-2023", "accessed": "2026-11-18"},
{"code": "S12", "title": "easyparts – Wartungskit Yamaha NMAX 125/155", "url": "https://easyparts.com/Maintenance-kit-YAMAHA-N-Max-125-155i-4T-E3-E4-2015-2020-(service)-p33720846", "accessed": "2026-11-18"},
{"code": "S13", "title": "Honda Austria – Inspektionszeiten bis 125 ccm (2021)", "url": "https://www.honda.at/content/dam/local/austria/motorcycles/pdf/INSPEKTIONSZEITEN_bis_125ccm_2021.pdf", "accessed": "2026-11-18"},
{"code": "S14", "title": "Honda Austria – Inspektionszeiten Motorrad mit 12'000-km-Intervall (2021)", "url": "https://www.honda.at/content/dam/local/austria/motorcycles/pdf/INSPEKTIONSZEITEN_MOTORRAD_12000km_Intervalle_2021.pdf", "accessed": "2026-11-23"},
{"code": "S15", "title": "Honda Austria – Inspektionszeiten bis 125 ccm (2024)", "url": "https://www.honda.at/content/dam/local/austria/motorcycles/pdf/INSPEKTIONSZEITEN_bis_125ccm_2024.pdf", "accessed": "2026-11-23"},
{"code": "S16", "title": "Yamaha – Bedienungsanleitung MT-125 (MTN125-A, EU)", "url": "https://cdn2.yamaha-motor.eu/prod/owner-manuals/Motorcycles/PB6GF8199G1G.pdf", "accessed": "2026-11-23"},
{"code": "S17", "title": "Yamaha – Bedienungsanleitung YZF-R125 (YZF125-A, EU)", "url": "https://cdn2.yamaha-motor.eu/prod/owner-manuals/Motorcycles/PB5GF8199G0G_1.pdf", "accessed": "2026-11-23"},
{"code": "S18", "title": "maintenanceschedule.com – BMW F 900 R / F 900 XR", "url": "https://maintenanceschedule.com/?p=11351", "accessed": "2026-11-23"},
{"code": "S19", "title": "maintenanceschedule.com – Kawasaki Z500", "url": "https://maintenanceschedule.com/?p=24452", "accessed": "2026-11-23"},
{"code": "S20", "title": "Yamaha – Bedienungsanleitung NMAX 125 (GPD125-A, EU)", "url": "https://cdn2.yamaha-motor.eu/prod/owner-manuals/Scooters/PBALF8199G0G.PDF", "accessed": "2026-11-23"},
{"code": "S21", "title": "91wheels – Aprilia RS 457 Servicekosten und Intervalle", "url": "https://www.91wheels.com/news/aprilia-rs-457-service-cost-revealed-cheaper-than-the-rivals", "accessed": "2026-11-23"},
{"code": "S22", "title": "maintenanceschedule.com – Suzuki GSX-8T / GSX-8TT", "url": "https://maintenanceschedule.com/?p=26798", "accessed": "2026-11-23"},
{"code": "S23", "title": "Motorrad & Reisen – Yamaha XMAX 125 Tech MAX Datenblatt", "url": "https://www.motorradundreisen.de/motorraddatenbank/yamaha/xmax-125-tech-max-2023-4190.html", "accessed": "2026-11-23"},
{"code": "S24", "title": "SWM – Kurzanleitung SM 125 R 2020 (A000P04558, Hersteller)", "url": "https://swm-motorcycles.it/wp-content/uploads/A000P04558-SWM-SM-125-MY21-Quick-Manual-Rev.01.pdf", "accessed": "2026-11-23"},
{"code": "S25", "title": "SWM – Manuale Uso e Manutenzione RS/SM 125 R 2019 (Hersteller)", "url": "https://www.swm-motorcycles.it/wp-content/uploads/2018/09/OWNERS_Cod-A000P0XXXX_ed00_09-2018-_-MY19_REV00-compressed.pdf", "accessed": "2026-11-23"},
{"code": "S26", "title": "Zontes UK – User Manual 368G (offizieller Importeur)", "url": "https://zontes.co.uk/wp-content/uploads/2025/08/PdfZT2025072311085933036.pdf.pdf", "accessed": "2026-11-23"},
{"code": "S27", "title": "Zontes Ungarn – ZT368T-G Maintenance Manual 2025 (Werksdokument)", "url": "https://www.zontes.hu/sm-zontes-368g.pdf", "accessed": "2026-11-23"},
{"code": "S28", "title": "Voge Spanien – Manual de Propietario 900DSX E5+ (offizieller Importeur)", "url": "https://vogespain.es/wp-content/uploads/2025/03/Manual-de-Propietario-Voge-900DSX-Euro-5-Espanol_compressed.pdf", "accessed": "2026-11-23"},
{"code": "S29", "title": "Voge Italien – DS900X Handbuch, Wartungstabelle (offizieller Importeur)", "url": "https://vogeitaly.it/wp-content/uploads/DS900X-%E5%87%BA%E5%8F%A3%E6%97%A0%E6%9E%81LX900-A%EF%BC%88DS900X%EF%BC%89%E8%81%94%E5%90%88%E7%94%B5%E5%AD%90%E7%94%B5%E5%96%B7%E8%8B%B1%E6%96%87%E8%AF%B4%E6%98%8E3-5..2024-3-6-trascinato.pdf", "accessed": "2026-11-23"},
{"code": "S30", "title": "Yamaha Argentinien – Manual del Propietario Cygnus RayZR (LCG125)", "url": "https://www.yamaha-motor.com.ar/modelo/descargar-manual-de-servicio/ray-zr-125-fi", "accessed": "2026-11-23"},
{"code": "S31", "title": "Yamaha Europe – Datenblatt RayZR (LCG125) 2024, Schweiz", "url": "https://cdn2.yamaha-motor.eu/prod/product-assets/2024/LCG125/Factsheets/2024-LCG125_de-CH.pdf", "accessed": "2026-11-23"}
]$json$::jsonb)
  as x(code text, title text, url text, accessed date)
on conflict (code) do update
  set title = excluded.title, url = excluded.url, accessed_on = excluded.accessed_on;

-- ---------------------------------------------------------------------
-- Modelldaten
-- ---------------------------------------------------------------------
create temp table _bikes as
select x.*, v.id as variant_id
from jsonb_to_recordset($json$[
{"brand_slug": "yamaha", "slug": "mt-07", "category": "naked", "drive": "chain", "year_from": 2014, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": 2.6, "status": "verified", "note": "Ölmenge laut Handbuch 1. Generation", "sources": ["S0", "S1", "S2", "S3"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000},
{"brand_slug": "kawasaki", "slug": "z-900", "category": "naked", "drive": "chain", "year_from": 2017, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": 3.8, "status": "verified", "note": "Ölmenge gilt für 2017–2022", "sources": ["S0", "S1", "S4"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "bmw", "slug": "r-1300-gs", "category": "adventure", "drive": "shaft", "year_from": 2024, "year_to": null, "oil_spec": "5W-40 (BMW Advantec Ultimate)", "oil_l": null, "status": "verified", "note": "Keine Kettenpflege; Kardanwelle laut Quelle nach 60'000 km tauschen", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000},
{"brand_slug": "yamaha", "slug": "mt-125", "category": "naked", "drive": "chain", "year_from": 2014, "year_to": null, "oil_spec": "10W-40, API SG+, JASO MA", "oil_l": 0.95, "status": "to_check", "note": "EU-Handbuch: Öl nach 1'000 km, dann alle 3'000 km; Ventilspiel-Intervall in der Tabelle nicht eindeutig (6'000 km angenommen)", "sources": ["S0", "S16"], "oil_km": 3000, "oil_months": 12, "valve_km": 6000},
{"brand_slug": "bmw", "slug": "r-1300-gs-adventure", "category": "adventure", "drive": "shaft", "year_from": 2025, "year_to": null, "oil_spec": "5W-40", "oil_l": null, "status": "verified", "note": "Keine Kettenpflege", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000},
{"brand_slug": "yamaha", "slug": "tracer-9-gt-gt", "category": "sport_tourer", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000},
{"brand_slug": "yamaha", "slug": "mt-09-sp", "category": "naked", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": null, "status": "verified", "note": "Ölfilter nur alle 20'000 km", "sources": ["S0", "S1", "S11"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000},
{"brand_slug": "honda", "slug": "cb-750-hornet", "category": "naked", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "10W-30, JASO T903 MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "yamaha", "slug": "yzf-r-125", "category": "supersport", "drive": "chain", "year_from": 2019, "year_to": null, "oil_spec": "10W-40, API SG+, JASO MA", "oil_l": 0.95, "status": "to_check", "note": "EU-Handbuch: Öl nach 1'000 km, dann alle 3'000 km; Ventilspiel-Intervall in der Tabelle nicht eindeutig (6'000 km angenommen)", "sources": ["S0", "S17"], "oil_km": 3000, "oil_months": 12, "valve_km": 6000},
{"brand_slug": "beta", "slug": "rr-125", "category": "enduro", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Kein offizielles Handbuch frei online (Stand 23.11.2026); auf betamotor.com nur mit Fahrgestellnummer abrufbar – Anfrage an Importeur Amsler vorbereitet", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null},
{"brand_slug": "yamaha", "slug": "tenere-700", "category": "adventure", "drive": "chain", "year_from": 2019, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": null, "status": "verified", "note": "Ölfilter nur alle 20'000 km", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000},
{"brand_slug": "aprilia", "slug": "rs-457", "category": "supersport", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Händlerangaben Indien (Service alle 6'000 km), Ventile laut Datenportal 24'000 km; EU-Handbuch noch nicht gefunden", "sources": ["S0", "S21"], "oil_km": 6000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "fantic", "slug": "xmf-125", "category": "supermoto", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Laut Werkstatt-Ratgeber Öl alle 3'000 km", "sources": ["S0", "S9"], "oil_km": 3000, "oil_months": null, "valve_km": null},
{"brand_slug": "aprilia", "slug": "sx-125", "category": "supermoto", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Kein offizielles Handbuch online (Stand 23.11.2026); Kopien auf inoffiziellen Seiten nicht übernommen (meist altes Zweitakt-Modell 2008–2013) – Anfrage an OFRAG vorbereitet", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null},
{"brand_slug": "yamaha", "slug": "r7", "category": "supersport", "drive": "chain", "year_from": 2022, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": "US- und EU-Handbuch: 6'000 km / 6 Monate (kürzer als MT-07), Ventile 40'000 km", "sources": ["S0", "S1"], "oil_km": 6000, "oil_months": 6, "valve_km": 40000},
{"brand_slug": "aprilia", "slug": "rs-660", "category": "supersport", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000},
{"brand_slug": "yamaha", "slug": "xsr-125", "category": "cafe_racer", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": null, "status": "verified", "note": "Inspektion mit Ölfilter alle 6'000 km", "sources": ["S0", "S1"], "oil_km": 3000, "oil_months": 12, "valve_km": 6000},
{"brand_slug": "honda", "slug": "cb-1000-hornet-sp", "category": "naked", "drive": "chain", "year_from": 2025, "year_to": null, "oil_spec": "10W-30", "oil_l": null, "status": "to_check", "note": "Noch nicht im Honda-Plan 2021; US-Handbuch 12'800 / 38'400 km, EU-Werte vermutlich 12'000 / 36'000 km", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 36000},
{"brand_slug": "honda", "slug": "xl-750-transalp", "category": "adventure", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "10W-30", "oil_l": null, "status": "verified", "note": "Ölfilter nur alle 24'000 km", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "honda", "slug": "crf-1100-l-africa-twin-alle", "category": "adventure", "drive": "chain", "year_from": 2020, "year_to": null, "oil_spec": "10W-30, JASO MA", "oil_l": null, "status": "verified", "note": "Honda-Inspektionsplan EU: alle 12'000 km oder jährlich, Ventile alle 24'000 km", "sources": ["S0", "S14"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "kawasaki", "slug": "z-650", "category": "naked", "drive": "chain", "year_from": 2017, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "kawasaki", "slug": "ninja-zx-4r", "category": "supersport", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "yamaha", "slug": "xsr-700", "category": "cafe_racer", "drive": "chain", "year_from": 2016, "year_to": null, "oil_spec": "10W-40 (Yamalube)", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000},
{"brand_slug": "honda", "slug": "cbr-650-r", "category": "supersport", "drive": "chain", "year_from": 2019, "year_to": null, "oil_spec": "10W-30, JASO T903 MA", "oil_l": null, "status": "verified", "note": "Honda-Inspektionsplan EU: alle 12'000 km oder jährlich, Ventile alle 36'000 km", "sources": ["S0", "S14"], "oil_km": 12000, "oil_months": 12, "valve_km": 36000},
{"brand_slug": "honda", "slug": "cb-125-r", "category": "naked", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Honda-Inspektionsplan bis 125 ccm: alle 6'000 km oder jährlich (Ölservice schon bei 1'000 km); Ölwechsel bei jeder Inspektion und Ventilspiel im Handbuch bestätigen", "sources": ["S0", "S15"], "oil_km": 6000, "oil_months": 12, "valve_km": null},
{"brand_slug": "honda", "slug": "nt-1100", "category": "tourer", "drive": "chain", "year_from": 2022, "year_to": null, "oil_spec": "10W-30, JASO T903 MA", "oil_l": null, "status": "verified", "note": "Honda-Inspektionsplan EU: alle 12'000 km oder jährlich, Ventile alle 24'000 km", "sources": ["S0", "S14"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "honda", "slug": "cmx-500-a-rebel", "category": "cruiser", "drive": "chain", "year_from": 2017, "year_to": null, "oil_spec": "10W-30, JASO MA", "oil_l": null, "status": "verified", "note": "Honda-Inspektionsplan EU: alle 12'000 km oder jährlich, Ventile alle 24'000 km", "sources": ["S0", "S14"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "honda", "slug": "cb-500-f", "category": "naked", "drive": "chain", "year_from": 2019, "year_to": null, "oil_spec": "10W-30, JASO MA", "oil_l": null, "status": "verified", "note": "Honda-Inspektionsplan EU: alle 12'000 km oder jährlich, Ventile alle 24'000 km", "sources": ["S0", "S14"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "kawasaki", "slug": "ninja-650", "category": "supersport", "drive": "chain", "year_from": 2017, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": "Silhouette eher Sport, nicht Rennsport", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "swm", "slug": "sm-125-r", "category": "supermoto", "drive": "chain", "year_from": 2016, "year_to": null, "oil_spec": "5W-40 (Motul 7100, ab MY20)", "oil_l": 1.35, "status": "to_check", "note": "Offizielle SWM-Handbücher: Öl und Ölfilter nach 1'000 km, dann alle 5'000 km (italienische und deutsche Tabelle); die englische Tabelle der Kurzanleitung 2020 zeigt 7'500-km-Schritte – Widerspruch; Handbuch MY19 nennt 10W-50; kein Zeitintervall; Ventilspiel-Intervall nicht lesbar", "sources": ["S0", "S24", "S25"], "oil_km": 5000, "oil_months": null, "valve_km": null},
{"brand_slug": "kawasaki", "slug": "ninja-500", "category": "supersport", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": 2.3, "status": "verified", "note": "Quelle sagt nicht, ob 2,3 L mit Filter sind", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "zontes", "slug": "368-g", "category": "scooter", "drive": "cvt", "year_from": 2025, "year_to": null, "oil_spec": "5W-40 / 10W-40 / 10W-50, API SN", "oil_l": 1.75, "status": "to_check", "note": "Offizielles Handbuch (Zontes UK): 1. Service nach 1'000 km oder 3 Monaten, 2. Service bei 4'000 km, danach alle 4'000 km oder 15 Monate; Ölfilter bei jedem Service; Ventilspiel laut Werkstatthandbuch alle 20'000 km, im UK-Handbuch evtl. 40'000 km (Text unleserlich) – kürzerer Wert übernommen; Kategorie korrigiert: Maxi-Roller mit Riemenantrieb, keine Kettenpflege", "sources": ["S0", "S26", "S27"], "oil_km": 4000, "oil_months": 15, "valve_km": 20000},
{"brand_slug": "yamaha", "slug": "tracer-7", "category": "sport_tourer", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000},
{"brand_slug": "cf-moto", "slug": "450-mt", "category": "adventure", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "10W-40, JASO MA2", "oil_l": null, "status": "verified", "note": "Kurzes Ölintervall beachten", "sources": ["S0", "S1"], "oil_km": 5000, "oil_months": 6, "valve_km": 40000},
{"brand_slug": "voge", "slug": "900-dsx", "category": "adventure", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "5W-40, API SN (je nach Klima)", "oil_l": 3.0, "status": "verified", "note": "Handbücher der Voge-Importeure Spanien und Italien: Öl und Ölfilter nach 1'000 km, dann alle 10'000 km; Ventilspiel alle 20'000 km prüfen; kein Zeitintervall für den Ölwechsel angegeben", "sources": ["S0", "S28", "S29"], "oil_km": 10000, "oil_months": null, "valve_km": 20000},
{"brand_slug": "bmw", "slug": "m-1000-r", "category": "naked", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": 3.5, "status": "verified", "note": "Quelle sagt nicht, ob 3,5 L mit Filter sind", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 30000},
{"brand_slug": "bmw", "slug": "f-900-r", "category": "naked", "drive": "chain", "year_from": 2020, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": null, "status": "verified", "note": "BMW-Plan: Öl mit Filter alle 10'000 km oder jährlich, Ventile alle 20'000 km", "sources": ["S0", "S18"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000},
{"brand_slug": "bmw", "slug": "f-800-gs", "category": "adventure", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": null, "status": "to_check", "note": "BMW-Standard 10'000 km / jährlich; Ventilintervall von F 850 GS / F 900 übernommen", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000},
{"brand_slug": "kawasaki", "slug": "z-500", "category": "naked", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": 2.3, "status": "verified", "note": "Handbuch: alle 12'000 km oder jährlich, Ventile alle 24'000 km (wie Ninja 500)", "sources": ["S0", "S19"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "honda", "slug": "nc-750-x", "category": "sport_tourer", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-30, JASO T903 MA", "oil_l": null, "status": "verified", "note": "Honda-Inspektionsplan EU: alle 12'000 km oder jährlich, Ventile alle 24'000 km", "sources": ["S0", "S14"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "honda", "slug": "cb-650-r", "category": "naked", "drive": "chain", "year_from": 2019, "year_to": null, "oil_spec": "10W-30, JASO T903 MA", "oil_l": null, "status": "verified", "note": "Honda-Inspektionsplan EU: alle 12'000 km oder jährlich, Ventile alle 36'000 km", "sources": ["S0", "S14"], "oil_km": 12000, "oil_months": 12, "valve_km": 36000},
{"brand_slug": "kawasaki", "slug": "z-125", "category": "naked", "drive": "chain", "year_from": 2017, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": 0.9, "status": "verified", "note": "Quelle sagt nicht, ob 0,9 L mit Filter sind", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 12000},
{"brand_slug": "triumph", "slug": "tiger-sport-800", "category": "sport_tourer", "drive": "chain", "year_from": 2025, "year_to": null, "oil_spec": "10W-40 oder 10W-50", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 16000, "oil_months": 12, "valve_km": 32000},
{"brand_slug": "yamaha", "slug": "mt-03", "category": "naked", "drive": "chain", "year_from": 2016, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "verified", "note": "EU-Plan: 10'000 km oder jährlich, Ventile alle 40'000 km", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000},
{"brand_slug": "aprilia", "slug": "rs-125", "category": "supersport", "drive": "chain", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "open", "note": "Kein offizielles Handbuch online (Stand 23.11.2026); Kopien auf inoffiziellen Seiten nicht übernommen (meist alte Zweitakt-Modelle) – Anfrage an OFRAG vorbereitet", "sources": ["S0"], "oil_km": null, "oil_months": null, "valve_km": null},
{"brand_slug": "bmw", "slug": "f-900-xr", "category": "sport_tourer", "drive": "chain", "year_from": 2020, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": null, "status": "verified", "note": "BMW-Plan: Öl mit Filter alle 10'000 km oder jährlich, Ventile alle 20'000 km", "sources": ["S0", "S18"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000},
{"brand_slug": "ktm", "slug": "790-duke", "category": "naked", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": "Quelle gilt für 2018–2020", "sources": ["S0", "S1"], "oil_km": 15000, "oil_months": 12, "valve_km": 30000},
{"brand_slug": "yamaha", "slug": "yzf-r3", "category": "supersport", "drive": "chain", "year_from": 2015, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000},
{"brand_slug": "triumph", "slug": "trident-660", "category": "naked", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 16000, "oil_months": 12, "valve_km": 32000},
{"brand_slug": "yamaha", "slug": "yzf-r1", "category": "supersport", "drive": "chain", "year_from": 2015, "year_to": null, "oil_spec": "10W-50 (Yamalube)", "oil_l": null, "status": "verified", "note": "Quelle gilt für 2015–2020", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 40000},
{"brand_slug": "yamaha", "slug": "nmax-125", "category": "scooter", "drive": "cvt", "year_from": 2015, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "EU-Handbuch: Öl nach 1'000 km, dann nach weiteren 5'000 km, danach alle 6'000 km; Keilriemen alle 18'000 km; Zeitintervall und Ölsorte noch prüfen", "sources": ["S0", "S12", "S20"], "oil_km": 6000, "oil_months": 12, "valve_km": null},
{"brand_slug": "vespa", "slug": "primavera-125-3v", "category": "scooter", "drive": "cvt", "year_from": 2014, "year_to": null, "oil_spec": "5W-40, JASO MA2 / API SL", "oil_l": 1.0, "status": "to_check", "note": "Laut Handbuch-Zitat im Forum: Öl alle 10'000 km oder 10 Monate", "sources": ["S0", "S7", "S10"], "oil_km": 10000, "oil_months": 10, "valve_km": null},
{"brand_slug": "honda", "slug": "pcx-125", "category": "scooter", "drive": "cvt", "year_from": 2014, "year_to": null, "oil_spec": "10W-30, JASO MB", "oil_l": 0.9, "status": "to_check", "note": "Honda-125er-Inspektionsplan in 6'000-km-Schritten; Roller brauchen JASO MB statt MA", "sources": ["S0", "S8", "S13", "S15"], "oil_km": 6000, "oil_months": 12, "valve_km": null},
{"brand_slug": "vespa", "slug": "gts-310", "category": "scooter", "drive": "cvt", "year_from": 2019, "year_to": null, "oil_spec": "5W-40, JASO MA/MA2 / API SL", "oil_l": 1.3, "status": "to_check", "note": "Ventile: HPE-Motor alle 10'000 km, ältere GTS 300 alle 20'000 km", "sources": ["S0", "S7", "S10"], "oil_km": 10000, "oil_months": 12, "valve_km": 10000},
{"brand_slug": "vespa", "slug": "gts-125", "category": "scooter", "drive": "cvt", "year_from": 2017, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": 1.1, "status": "to_check", "note": "Ältere Serviceheft-Angabe: alle 6'000 km – je nach Baujahr", "sources": ["S0", "S7", "S10"], "oil_km": 10000, "oil_months": 12, "valve_km": null},
{"brand_slug": "yamaha", "slug": "x-max-300", "category": "scooter", "drive": "cvt", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Datenblatt: Erstinspektion 1'000 km, danach alle 6'000 km oder jährlich; eine andere Quelle nennt 10'000 km – Handbuch prüfen", "sources": ["S0", "S23"], "oil_km": 6000, "oil_months": 12, "valve_km": null},
{"brand_slug": "yamaha", "slug": "ray-zr-125", "category": "scooter", "drive": "cvt", "year_from": 2024, "year_to": null, "oil_spec": null, "oil_l": 0.8, "status": "to_check", "note": "Offizielles Yamaha-Handbuch, aber Argentinien-Version (Cygnus RayZR LCG125): Öl nach 1'000 km, dann alle 6'000 km, 0,80 L; EU-Handbuch nicht gefunden – Werte für die Schweizer Version (EU-Modell ab 2024) beim Importeur bestätigen", "sources": ["S0", "S30", "S31"], "oil_km": 6000, "oil_months": null, "valve_km": null},
{"brand_slug": "honda", "slug": "vision-110", "category": "scooter", "drive": "cvt", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Honda-Inspektionsplan bis 125 ccm: alle 6'000 km oder jährlich (Ölservice schon bei 1'000 km); Ölwechsel bei jeder Inspektion und Ventilspiel im Handbuch bestätigen", "sources": ["S0", "S15"], "oil_km": 6000, "oil_months": 12, "valve_km": null},
{"brand_slug": "yamaha", "slug": "x-max-125", "category": "scooter", "drive": "cvt", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Datenblatt: Erstinspektion 1'000 km, danach alle 6'000 km oder jährlich", "sources": ["S0", "S23"], "oil_km": 6000, "oil_months": 12, "valve_km": null},
{"brand_slug": "honda", "slug": "adv-350", "category": "scooter", "drive": "cvt", "year_from": null, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Honda-Inspektionsplan (12'000-km-Intervall): alle 12'000 km oder jährlich; Ventilspiel noch offen", "sources": ["S0", "S14"], "oil_km": 12000, "oil_months": 12, "valve_km": null},
{"brand_slug": "suzuki", "slug": "gsx-8s", "category": "naked", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "to_check", "note": "Schwestermodell GSX-8T (gleicher Motor, Handbuch 2026): 6'000 km oder 12 Monate; Ventile noch bestätigen", "sources": ["S0", "S1", "S22"], "oil_km": 6000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "honda", "slug": "rebel-1100-cmx1100", "category": "cruiser", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-30, JASO MA", "oil_l": null, "status": "verified", "note": "Honda-Inspektionsplan EU: alle 12'000 km oder jährlich, Ventile alle 24'000 km; DCT-Version: zusätzlich Kupplungsölfilter", "sources": ["S0", "S14"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "triumph", "slug": "speed-400", "category": "cafe_racer", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": "Handbuch: alle 16'000 km oder jährlich, Ventile alle 32'000 km", "sources": ["S0", "S1"], "oil_km": 16000, "oil_months": 12, "valve_km": 32000},
{"brand_slug": "ktm", "slug": "125-duke", "category": "naked", "drive": "chain", "year_from": 2011, "year_to": null, "oil_spec": "15W-50", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 7500, "oil_months": 12, "valve_km": 15000},
{"brand_slug": "triumph", "slug": "scrambler-400-x", "category": "scrambler", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 16000, "oil_months": 12, "valve_km": 32000},
{"brand_slug": "bmw", "slug": "f-900-gs", "category": "adventure", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "5W-40, JASO MA2", "oil_l": 3.5, "status": "verified", "note": "Quelle sagt nicht, ob 3,5 L mit Filter sind", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000},
{"brand_slug": "ktm", "slug": "390-duke", "category": "naked", "drive": "chain", "year_from": 2024, "year_to": null, "oil_spec": "15W-50, JASO MA2", "oil_l": null, "status": "verified", "note": "Modelle 2013–2023: Öl 7'500 km, Ventile 15'000 km", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000},
{"brand_slug": "kawasaki", "slug": "z900rs", "category": "cafe_racer", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "kawasaki", "slug": "vulcan-s", "category": "cruiser", "drive": "chain", "year_from": 2015, "year_to": null, "oil_spec": "10W-40", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "kawasaki", "slug": "versys-650", "category": "sport_tourer", "drive": "chain", "year_from": 2015, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "suzuki", "slug": "v-strom-800de", "category": "adventure", "drive": "chain", "year_from": 2023, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "to_check", "note": "Gleicher Motor wie GSX-8T (Handbuch 2026): 6'000 km oder 12 Monate; Ventile noch bestätigen", "sources": ["S0", "S1", "S22"], "oil_km": 6000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "ktm", "slug": "890-adventure", "category": "adventure", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 15000, "oil_months": 12, "valve_km": 30000},
{"brand_slug": "kawasaki", "slug": "z650rs", "category": "cafe_racer", "drive": "chain", "year_from": 2022, "year_to": null, "oil_spec": "10W-40, JASO MA", "oil_l": null, "status": "verified", "note": null, "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 24000},
{"brand_slug": "royal-enfield", "slug": "interceptor-650-continental-gt", "category": "cafe_racer", "drive": "chain", "year_from": 2018, "year_to": null, "oil_spec": "10W-50, JASO MA2", "oil_l": null, "status": "verified", "note": "Ventile jedes Jahr prüfen", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 10000},
{"brand_slug": "bmw", "slug": "r-1250-rt", "category": "tourer", "drive": "shaft", "year_from": 2019, "year_to": 2025, "oil_spec": "5W-40, JASO MA2", "oil_l": null, "status": "to_check", "note": "BMW-Boxer: Öl alle 10'000 km oder jährlich, Ventile alle 20'000 km (Angaben zur R 1250 GS); keine Kettenpflege", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000},
{"brand_slug": "ducati", "slug": "monster-937", "category": "naked", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": "15W-50, JASO MA2 / API SM", "oil_l": null, "status": "verified", "note": "Service alle 15'000 km oder 24 Monate, Ventilspiel (Desmo-Service) alle 30'000 km", "sources": ["S0", "S1"], "oil_km": 15000, "oil_months": 24, "valve_km": 30000},
{"brand_slug": "bmw", "slug": "r-1250-gs-gs-adventure", "category": "adventure", "drive": "shaft", "year_from": 2019, "year_to": 2023, "oil_spec": "5W-40, API SL / JASO MA2", "oil_l": null, "status": "verified", "note": "Keine Kettenpflege", "sources": ["S0", "S1"], "oil_km": 10000, "oil_months": 12, "valve_km": 20000},
{"brand_slug": "fantic", "slug": "xef-125", "category": "enduro", "drive": "chain", "year_from": 2021, "year_to": null, "oil_spec": null, "oil_l": null, "status": "to_check", "note": "Laut Werkstatt-Ratgeber Öl alle 3'000 km; gleicher Motor wie XMF 125", "sources": ["S0", "S9"], "oil_km": 3000, "oil_months": null, "valve_km": null},
{"brand_slug": "ducati", "slug": "scrambler-800", "category": "scrambler", "drive": "chain", "year_from": 2015, "year_to": 2022, "oil_spec": "15W-50", "oil_l": 3.7, "status": "verified", "note": "Quelle sagt nicht, ob 3,7 L mit Filter sind", "sources": ["S0", "S1"], "oil_km": 12000, "oil_months": 12, "valve_km": 12000}
]$json$::jsonb) as x(
  brand_slug text, slug text, category text, drive text, year_from smallint, year_to smallint,
  oil_spec text, oil_l numeric, status text, note text,
  sources text[], oil_km integer, oil_months integer, valve_km integer)
join public.manufacturers m on m.slug = x.brand_slug
join public.models md on md.manufacturer_id = m.id and md.slug = x.slug
join public.model_variants v on v.model_id = md.id;

do $check$
begin
  if (select count(*) from _bikes) <> 79 then
    raise exception 'Abgleich: % von 79 Modellen gefunden', (select count(*) from _bikes);
  end if;
end
$check$;

-- Kategorie (Pixel-Motorrad) und Antrieb (z.B. Kettenpflege ja/nein)
update public.models md
set category_code = b.category,
    drive_type_code = b.drive
from _bikes b, public.model_variants v
where v.id = b.variant_id and md.id = v.model_id
  and (md.category_code, md.drive_type_code) is distinct from (b.category, b.drive);

update public.model_variants v
set year_from = b.year_from,
    year_to = b.year_to,
    oil_spec = b.oil_spec,
    oil_capacity_with_filter_l = b.oil_l,
    data_status_code = b.status,
    notes = b.note
from _bikes b
where v.id = b.variant_id
  and (v.year_from, v.year_to, v.oil_spec, v.oil_capacity_with_filter_l, v.data_status_code, v.notes)
      is distinct from (b.year_from, b.year_to, b.oil_spec, b.oil_l, b.status, b.note);

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
