# MotoAllAbout – App testen (Phase 10)

Anleitung für den Test auf dem **Mac mit dem Android-Emulator** aus Android Studio.
Der Emulator ist ein Android-Handy auf dem Bildschirm. Die App läuft darin in **Expo Go**.

> iPhone: Die Expo Go aus dem App Store kann diese App (Expo SDK 58) nicht öffnen.
> Fürs iPhone braucht es später das Apple-Entwicklerkonto (99 USD pro Jahr), das
> für den App Store sowieso nötig ist. Bis dahin testen wir auf Android.

---

## Einmal einrichten

### 1. Node.js installieren
1. Öffne <https://nodejs.org> und lade die Version **LTS** (22 oder neuer) für macOS.
2. Installiere sie wie ein normales Programm.
3. Öffne das Programm **Terminal** (Spotlight: `cmd` + Leertaste, «Terminal» eingeben).
4. Tippe `node -v` und drücke Enter. Es muss eine Zahl ab `v22` erscheinen.

### 2. App-Dateien holen
1. Öffne <https://github.com/rosiixae/motoallabout> (eingeloggt).
2. Grüner Knopf **Code** → **Download ZIP**.
3. Die ZIP-Datei im Ordner «Downloads» doppelklicken. Es entsteht der Ordner `motoallabout-main`.

### 3. Handy im Emulator anlegen
1. Android Studio öffnen → **More Actions** (oder Menü **Tools**) → **Device Manager**.
2. Gibt es noch kein Gerät: **+** → **Create Virtual Device** → **Pixel 8** (oder ähnlich) → neuestes Android-System wählen (falls nötig zuerst **Download** klicken) → **Finish**.
3. Beim Gerät auf **▶︎ (Play)** klicken. Ein Handy erscheint auf dem Bildschirm. Warten, bis der Startbildschirm da ist.

---

## App starten (jedes Mal)

Der Emulator muss laufen (Schritt 3). Dann im **Terminal** nacheinander eingeben, nach jeder Zeile Enter:

```
cd ~/Downloads/motoallabout-main/mobile
npm install
npx expo start
```

- `npm install` dauert beim ersten Mal ein paar Minuten. Danach nur noch, wenn du eine neue ZIP geholt hast.
- Wenn `npx expo start` läuft, erscheint ein QR-Code. Drücke jetzt im Terminal die Taste **a** (für Android).
- Expo installiert beim ersten Mal **Expo Go** im Emulator (Frage mit **Y** bestätigen, falls sie kommt) und öffnet die App.
- Beenden: im Terminal `ctrl` + `C`.

**Neue Version testen:** Neue ZIP herunterladen (alten Ordner vorher löschen), dann wieder die drei Zeilen oben.

---

## Was testen

Hake ab, was klappt. Wenn etwas nicht klappt: **Screenshot** (im Emulator: Kamera-Symbol in der Seitenleiste) und kurz aufschreiben, was du gemacht hast.

### Konto
- [ ] Registrieren mit einer echten E-Mail-Adresse
- [ ] Bestätigungs-E-Mail kommt an, Link anklicken (lädt danach eine leere oder Fehler-Seite: zuerst ignorieren, aber notieren)
- [ ] Einloggen
- [ ] Passwort vergessen: E-Mail kommt an
- [ ] Ausloggen und wieder einloggen

### Motorrad
- [ ] Motorrad aus der Liste wählen (z. B. Yamaha MT-07)
- [ ] Ein zweites Motorrad von Hand eintragen
- [ ] Zwischen den Motorrädern wechseln
- [ ] Motorrad bearbeiten und löschen

### Kilometer und Wartung
- [ ] Kilometerstand eintragen
- [ ] Startseite zeigt, was bald fällig ist (Farben, Balken)
- [ ] Eine Wartung eintragen (z. B. Ölwechsel) – Status springt zurück
- [ ] Verlauf ansehen
- [ ] Eigenes Intervall für eine Wartung festlegen
- [ ] Eine Anleitung öffnen (z. B. Kette schmieren)

### Kalender, Tipps, Warnleuchten
- [ ] Termin anlegen
- [ ] Tipps & Tricks öffnen und lesen
- [ ] Warnleuchten-Seite öffnen

### Profil
- [ ] Angaben ändern
- [ ] Farbthema wechseln
- [ ] Erinnerungen einschalten (Benachrichtigungen erlauben) – kommt eine Erinnerung?
- [ ] Quellen-Seite öffnen
- [ ] **Zum Schluss:** Konto löschen (nur mit einem Testkonto!)

### Allgemein
- [ ] Texte gut lesbar, nichts abgeschnitten
- [ ] Gibt es Stellen, die verwirrend sind?

---

## Wenn etwas nicht geht

| Meldung | Lösung |
|---|---|
| `command not found: node` oder `npm` | Node.js (Schritt 1) installieren, Terminal neu öffnen |
| `No Android connected device found` | Emulator zuerst starten (Schritt 3), dann **a** drücken |
| Roter Fehlerbildschirm in der App | Screenshot machen und mir schicken |
| App hängt beim Laden | Im Terminal **r** drücken (neu laden) |

Tipp: Mit der Claude-Desktop-App kannst du den Ordner `motoallabout-main` verbinden. Dann kann Claude die Befehle im Terminal selbst ausführen und Fehlermeldungen direkt lesen.
