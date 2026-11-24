# Datenbank MotoAllAbout (Supabase)

**Projekt:** MotoAllAbout · Region eu-west-1 (Irland) · Gratis-Plan
**API-URL:** https://bszhiiimzskgnwadjbpk.supabase.co
**Publishable Key (darf in die App):** sb_publishable_FxJuwMu6pBtP_toh0vYcAQ_sufs3wqU

Den geheimen Schlüssel (service_role / secret key) niemals in die App oder in Dateien schreiben.

## Eingespielte Migrationen (Stand 23.11.2026)

Die Migrationen liegen im Ordner `supabase/migrations/`. Der Dateiname beginnt mit der Versionsnummer, unter der Supabase die Migration gespeichert hat. So weiss Supabase, dass diese Dateien schon eingespielt sind.

| Nr. | Datei | Inhalt |
|---|---|---|
| 001 | 20261118214001_001_schema.sql | 33 Tabellen, 2 Views, Row Level Security, Rechte |
| 002 | 20261118214312_002_seed.sql | Nachschlagewerte, 79 Modelle, 125 Intervalle, 28 Warnleuchten |
| 003 | 20261118214359_003_private_helpers.sql | Hilfsfunktionen ins Schema «private» (nicht über die API aufrufbar) |
| 004 | 20261122131943_004_default_intervals.sql | Standard-Wartungsintervalle mit Quellen (G1–G13), Wartungsart MFK, Felder 1. Inverkehrsetzung / nächste MFK |
| 005 | 20261122150000_005_delete_account.sql | Funktion delete_my_account (Konto in der App löschen) |
| 006 | 20261122160000_006_tips.sql | 14 Tipps & Tricks aus dem Prototyp |
| 007 | 20261123150000_007_model_data.sql | Modelldaten Phase 9: 52 geprüft, 20 prüfen, 7 offen; Quellen S0–S23 mit Titel und Link |
| 008 | 20261123160000_008_model_data.sql | Offizielle Handbücher für SWM SM 125 R, Zontes 368 G, Voge 900 DSX, Yamaha RayZR; Zontes 368 G jetzt Roller mit Riemenantrieb; Quellen S24–S31; Abgleich-Skript gleicht neu auch Kategorie, Antrieb und Baujahre ab |
| 009 | 20261124120000_009_model_data.sql | Prüfung der „prüfen“-Modelle mit offiziellen Handbüchern: GSX-8S und V-Strom 800DE (Europa: Öl 12'000 km statt 6'000 km), XMAX 125, MT-125 und CB1000 Hornet jetzt geprüft; NMAX 125, XMAX 300 und F 800 GS ergänzt; Quellen S32–S39 |

## GitHub-Integration (Deploy to production)

Supabase ist mit diesem Repository verbunden (Working directory `.`, Branch `main`). Funktioniert seit 23.11.2026: 005 und 006 wurden so eingespielt.
Jede **neue** Datei in `supabase/migrations/`, die auf `main` landet, wird automatisch in die Produktionsdatenbank eingespielt.

## Regeln für Änderungen

- Nie eine eingespielte Datei ändern oder umbenennen. Jede Änderung ist eine neue Datei.
- Neue Datei immer mit Zeitstempel davor, später als die letzte: `JJJJMMTTHHMMSS_004_beschreibung.sql`, z. B. `20261125120000_004_tipps.sql`.
- Neue Modelle: CSV ergänzen, `python3 datenbank/make_seed.py . <datei>` gibt die Vorlage. Daraus nur die neuen Zeilen in eine neue Migration übernehmen.
- Geänderte Modellwerte (Kategorie, Antrieb, Baujahre, Intervalle, Ölsorte, Status, Hinweis, Quellen): `motorrad-liste-schweiz.csv` und `datenbank/quellen.csv` anpassen, dann `python3 datenbank/make_model_update.py . supabase/migrations/<zeitstempel>_00X_model_data.sql` – die Datei gleicht alle bestehenden Modelle ab.
- Nach jeder Änderung die Security Advisors im Dashboard prüfen.

## Geprüft

- Neues Konto bekommt automatisch Profil und Benachrichtigungs-Einstellungen.
- Person A sieht nur ihre Motorräder; Person B sieht und ändert nichts davon.
- Ohne Login: Katalog und Warnleuchten lesbar, keine Nutzerdaten.
- Niemand kann über die App den Katalog ändern.
- Security Advisor: eine gewollte Warnung. `delete_my_account` darf von eingeloggten Personen aufgerufen werden, löscht aber nur das eigene Konto (auth.uid()).

Hinweis: Gratis-Projekte werden nach einer Woche ohne Nutzung pausiert. Im Dashboard mit «Restore» wieder starten.
