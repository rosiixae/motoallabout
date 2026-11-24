# MotoAllAbout – Plan in Phasen

Stand: 24.11.2026

| Phase | Inhalt | Stand |
|---|---|---|
| 1 | Standard-Wartungsintervalle mit Quellen (Migration 004) | ✅ fertig, live in Supabase |
| 2 | Expo-Grundgerüst (SDK 58, TypeScript, expo-router), Design aus dem Prototyp, automatische Prüfung auf GitHub | ✅ fertig |
| 3 | Konto & Profil: Registrieren, Anmelden, Passwort vergessen, persönliche Angaben, Farbthemen, Konto löschen | ✅ fertig |
| 4 | Motorrad erfassen (Katalog oder von Hand), bearbeiten, mehrere Motorräder, «Mein Motorrad» | ✅ fertig |
| 5 | Wartung: Startseite mit Fälligkeiten, km-Stand, Wartung eintragen, Verlauf, Anleitungen und Selbst-Checks, eigene Intervalle, Werkstatt-Termin | ✅ fertig |
| 6 | Kalender mit Terminen und Fälligkeiten, Termin planen | ✅ fertig |
| 7 | Tipps & Tricks (Migration 006), Warnleuchten mit Symbolen | ✅ fertig |
| 8 | Erinnerungen auf dem Handy (Wartung, Saison, Termine, km-Stand), Einstellungen | ✅ fertig |
| 9 | Modelldaten vervollständigen (Migrationen 007, 008): 53 geprüft, 23 prüfen, 3 offen (Beta RR 125, Aprilia SX 125 / RS 125 – kein offizielles Handbuch online); Quellen S0–S31; Händler-E-Mails vorbereitet (`haendler-mails.md` im Projekt) | ✅ 23.11.2026 |
| 10 | Test mit Expo Go im Android-Emulator (Mac, Android Studio), Anleitung in `mobile/README.md`; iPhone erst mit Apple-Entwicklerkonto (App Store hat nur Expo Go SDK 54) | 🔄 Test läuft |
| 11 | Veröffentlichung: Datenschutzerklärung, App-Icon, Fotos, Store-Konten, Testpersonen | ⏳ |

## Ordner

- `mobile/` – die App (Expo / React Native)
- `supabase/migrations/` – Datenbank. Neue Dateien auf `main` spielt Supabase automatisch ein (GitHub-Integration aktiv).
- `.github/workflows/mobile.yml` – prüft bei jedem Push: Pakete, Expo-Versionen, TypeScript, Logik-Tests, Android-Bündel

## Vor der Veröffentlichung nötig (nicht für den Test)

- **E-Mail-Versand:** Supabase verschickt ohne eigenen E-Mail-Dienst (SMTP) nur an Mitglieder des Supabase-Teams und nur wenige E-Mails pro Stunde. Für den Test reicht das (mit der eigenen Supabase-E-Mail registrieren). Vor dem Start einen E-Mail-Dienst einrichten.
- **Link in der Bestätigungs-E-Mail:** Zielseite (Site URL) in Supabase festlegen, z. B. eine einfache Seite «E-Mail bestätigt».

## Offene Entscheidungen

- **Bild auf «Mein Motorrad»:** Pixel-Motorräder, eigenes Foto oder beides? Im Moment zeigt die App ein Motorrad-Symbol.
- **Persönliche Angaben:** Der Prototyp fragt nach Geschlecht, Geburtsdatum und Wohnort. Die App fragt vorerst nur, was sie braucht (Name, E-Mail, «fahre seit»). Weniger Daten heisst weniger Aufwand beim Datenschutz.
- **Abo:** im Prototyp vorhanden, in der App weggelassen (vorerst kein Abo geplant).
- **Schriften:** Barlow Condensed und Inter wie im Prototyp, sobald die App einmal auf dem Handy getestet ist.
- **Werkstätten:** Tabelle ist bereit, aber noch leer. Bis dahin sucht die App Werkstätten über Google Maps.
