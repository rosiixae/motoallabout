# Datenbank MotoAllAbout (Supabase)

**Projekt:** MotoAllAbout · Region eu-west-1 (Irland) · Gratis-Plan
**API-URL:** https://bszhiiimzskgnwadjbpk.supabase.co
**Publishable Key (darf in die App):** sb_publishable_FxJuwMu6pBtP_toh0vYcAQ_sufs3wqU

Den geheimen Schlüssel (service_role / secret key) niemals in die App oder in Dateien schreiben.

## Eingespielte Migrationen (Stand 18.11.2026)

Die Migrationen liegen im Ordner `supabase/migrations/`. Der Dateiname beginnt mit der Versionsnummer, unter der Supabase die Migration gespeichert hat. So weiss Supabase, dass diese Dateien schon eingespielt sind.

| Nr. | Datei | Inhalt |
|---|---|---|
| 001 | 20261118214001_001_schema.sql | 33 Tabellen, 2 Views, Row Level Security, Rechte |
| 002 | 20261118214312_002_seed.sql | Nachschlagewerte, 79 Modelle, 125 Intervalle, 28 Warnleuchten |
| 003 | 20261118214359_003_private_helpers.sql | Hilfsfunktionen ins Schema «private» (nicht über die API aufrufbar) |
| 004 | 20261122140000_004_default_intervals.sql | Standard-Wartungsintervalle mit Quellen (G1–G13), Wartungsart MFK, Felder 1. Inverkehrsetzung / nächste MFK |

## GitHub-Integration (Deploy to production)

Supabase ist mit diesem Repository verbunden (Working directory `.`, Branch `main`).
Jede **neue** Datei in `supabase/migrations/`, die auf `main` landet, wird automatisch in die Produktionsdatenbank eingespielt.

## Regeln für Änderungen

- Nie eine eingespielte Datei ändern oder umbenennen. Jede Änderung ist eine neue Datei.
- Neue Datei immer mit Zeitstempel davor, später als die letzte: `JJJJMMTTHHMMSS_004_beschreibung.sql`, z. B. `20261125120000_004_tipps.sql`.
- Neue Modelle: CSV ergänzen, `python3 datenbank/make_seed.py . <datei>` gibt die Vorlage. Daraus nur die neuen Zeilen in eine neue Migration übernehmen.
- Nach jeder Änderung die Security Advisors im Dashboard prüfen.

## Geprüft

- Neues Konto bekommt automatisch Profil und Benachrichtigungs-Einstellungen.
- Person A sieht nur ihre Motorräder; Person B sieht und ändert nichts davon.
- Ohne Login: Katalog und Warnleuchten lesbar, keine Nutzerdaten.
- Niemand kann über die App den Katalog ändern.
- Security Advisor: keine Warnungen.

Hinweis: Gratis-Projekte werden nach einer Woche ohne Nutzung pausiert. Im Dashboard mit «Restore» wieder starten.
