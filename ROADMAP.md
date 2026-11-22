# MotoAllAbout – Plan in Phasen

Stand: 22.11.2026

| Phase | Inhalt | Stand |
|---|---|---|
| 1 | Standard-Wartungsintervalle mit Quellen (Migration 004) | ✅ fertig, live in Supabase |
| 2 | Expo-Grundgerüst (SDK 58, TypeScript, expo-router), Design aus dem Prototyp, automatische Prüfung auf GitHub | ✅ fertig |
| 3 | Konto & Profil: Registrieren, Anmelden, Passwort vergessen, persönliche Angaben, Farbthemen, Konto löschen | ✅ fertig (Konto löschen braucht Migration 005) |
| 4 | Motorrad erfassen (Katalog oder von Hand), bearbeiten, mehrere Motorräder, «Mein Motorrad» | ✅ fertig |
| 5 | Wartung: Startseite mit Fälligkeiten, km-Stand, Wartung eintragen, Verlauf, Anleitungen und Selbst-Checks, eigene Intervalle, Werkstatt-Termin | ✅ fertig |
| 6 | Kalender mit Terminen und Fälligkeiten, Termin planen | ✅ fertig |
| 7 | Tipps & Tricks (Migration 006), Warnleuchten mit Symbolen | ✅ App fertig, Migration 006 noch einspielen |
| 8 | Erinnerungen auf dem Handy (Wartung, Saison, Termine, km-Stand), Einstellungen | ✅ fertig |
| 9 | Modelldaten vervollständigen (28 «prüfen», 14 «offen»), Quellen S0–S13 | ⏳ als Nächstes |
| 10 | Test auf dem Handy mit Expo Go, Korrekturen | ⏳ |
| 11 | Veröffentlichung: Datenschutzerklärung, App-Icon, Fotos, Store-Konten, Testpersonen | ⏳ |

## Ordner

- `mobile/` – die App (Expo / React Native)
- `supabase/migrations/` – Datenbank. Neue Dateien auf `main` spielt Supabase automatisch ein, sobald die GitHub-Integration aktiv ist.
- `.github/workflows/mobile.yml` – prüft bei jedem Push: Pakete, Expo-Versionen, TypeScript, Logik-Tests, Android-Bündel

## Offene Entscheidungen

- **Bild auf «Mein Motorrad»:** Pixel-Motorräder, eigenes Foto oder beides? Im Moment zeigt die App ein Motorrad-Symbol.
- **Persönliche Angaben:** Der Prototyp fragt nach Geschlecht, Geburtsdatum und Wohnort. Die App fragt vorerst nur, was sie braucht (Name, E-Mail, «fahre seit»). Weniger Daten heisst weniger Aufwand beim Datenschutz.
- **Abo:** im Prototyp vorhanden, in der App weggelassen (vorerst kein Abo geplant).
- **Schriften:** Barlow Condensed und Inter wie im Prototyp, sobald die App einmal auf dem Handy getestet ist.
- **Werkstätten:** Tabelle ist bereit, aber noch leer. Bis dahin sucht die App Werkstätten über Google Maps.
