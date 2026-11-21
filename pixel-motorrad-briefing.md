# Briefing: Animierte Pixel-Art-Motorräder pro Kategorie

## Kontext

Ich entwickle eine **Motorrad-Pflege-App** für (neue) Motorradfahrer*innen. Die App erinnert an Wartung (Kette, Ölwechsel, Service, Reifendruck usw.), hat einen Kalender, Tipps & Tricks zum Fahrenlernen und einen Bereich **«Mein Motorrad»**.

Auf «Mein Motorrad» gibt man Marke, Modell und Jahrgang an. Daraus soll ein **3D-Pixelart-Modell** des eigenen Motorrads entstehen. Als ersten Schritt brauche ich dafür **pro Motorradkategorie ein detailliertes, animiertes Pixel-Art-Motorrad**. Die App ordnet das Motorrad der Nutzerin oder des Nutzers später einer Kategorie zu und zeigt das passende Pixel-Motorrad.

Das Design der App ist hell, klar und sportlich, mit Orange als Akzentfarbe.

## Deine Aufgabe

Erstelle für jede Kategorie unten ein animiertes Pixel-Art-Motorrad nach den Vorgaben in diesem Dokument.

**Arbeitsweise:**
1. Mach zuerst **nur die Kategorie «Naked»** als Muster und zeig sie mir.
2. Warte auf mein Feedback.
3. Erst danach erstellst du die restlichen Kategorien im gleichen Stil.

## Kategorien

Jedes Motorrad soll allein an der Silhouette erkennbar sein. Diese Merkmale müssen sichtbar sein:

| Kategorie | Typische Merkmale |
|---|---|
| **Naked** | Keine Verkleidung, sichtbarer Motor und Rahmen, runder Scheinwerfer, gerader breiter Lenker, aufrechte Sitzposition |
| **Supersport** | Vollverkleidung, tiefe Lenkerstummel, hohes Heck, kleine Scheibe, sehr sportlich geduckt |
| **Sporttourer** | Teilverkleidung, höhere Scheibe als Supersport, Seitenkoffer optional, etwas aufrechter |
| **Tourer** | Grosse Verkleidung, hohe Scheibe, breiter Sattel mit Rückenlehne, Seiten- und Topcase |
| **Adventure / Reiseenduro** | Hoch, langer Federweg, Schnabel vorne, grosses Vorderrad (Speichen), Alukoffer, Sturzbügel |
| **Enduro / Motocross** | Sehr schmal und hoch, Stollenreifen, hoher vorderer Kotflügel, flache lange Sitzbank, wenig Verkleidung |
| **Supermoto** | Wie Enduro, aber Strassenreifen auf kleineren Felgen, tiefer |
| **Cruiser / Chopper** | Lang und tief, weit nach vorne gestreckte Gabel, tiefer Sattel, viel Chrom, V-Motor, breiter Hinterreifen |
| **Café Racer / Retro** | Klassische Linie, runder Scheinwerfer, langer flacher Tank, Höcker-Sitzbank, Speichenräder |
| **Scrambler** | Retro mit Offroad-Touch, hochgezogener Auspuff, Grobstollenreifen, breiter Lenker |
| **Roller** | Durchstieg, kleine Räder, Verkleidung rundum, Fussbrett |

Verwende **keine Logos, Markennamen oder exakten Kopien echter Modelle**. Die Motorräder sollen typisch für ihre Kategorie sein, aber keinem bestimmten Hersteller gehören.

## Technische Vorgaben

### Grösse und Ansicht
- **Seitenansicht**, Motorrad fährt nach **rechts**.
- Raster: **64 × 40 Pixel** pro Frame.
- Alle Motorräder stehen auf der **gleichen Bodenlinie** (unterste Reifenkante auf derselben Zeile), damit man sie in der App austauschen kann, ohne dass etwas springt.
- In der App wird das Bild **4-fach vergrössert** angezeigt (256 × 160), immer ohne Weichzeichnen (nearest neighbor).

### Stil
- Klare, dunkle Umrisslinie (#16191D).
- Licht kommt von **oben links**: pro Fläche 2–3 Farbtöne (Grundfarbe, Schatten, Glanzlicht).
- Genug Details, dass man Motor, Kette, Bremsscheiben, Gabel, Federbein, Auspuff, Spiegel und Lichter erkennt.
- Keine Pixel mit Halbtransparenz, Hintergrund transparent.

### Farbpalette
Halte dich an diese Palette, damit es zum App-Design passt:

| Rolle | Farbe |
|---|---|
| Umriss / Reifen | #16191D |
| Dunkelgrau (Motor, Sattel) | #3A3F45 |
| Mittelgrau (Felgen, Metall) | #8A9099 |
| Hellgrau / Chrom-Glanz | #DDE0DC |
| Lack Grundfarbe | #C2410C |
| Lack Schatten | #9A3412 |
| Lack Glanzlicht | #FDE8DC |
| Scheinwerfer | #F5C451 |
| Rücklicht | #DC2626 |

**Wichtig:** Die drei Lack-Farben müssen als **austauschbare Farbgruppe** angelegt sein. In der App soll man später die Farbe des eigenen Motorrads wählen können, und nur diese Pixel werden dann umgefärbt.

## Animation

Ein ruhiger, sich wiederholender Loop, als ob das Motorrad im Stand läuft:

- **Räder drehen sich:** Speichen bzw. Felgenmuster bewegen sich.
- **Leichtes Vibrieren:** Der Aufbau (nicht die Räder) bewegt sich alle paar Frames um 1 Pixel auf und ab.
- **Abgaswölkchen:** Kleine graue Pixelwolken kommen aus dem Auspuff und lösen sich auf.
- **Licht:** Scheinwerfer leuchtet konstant, optional ein kurzes Aufblitzen.

Umfang: **8 Frames**, abgespielt mit **10 Bildern pro Sekunde**, nahtlos wiederholbar.

## Was ich am Ende pro Kategorie brauche

1. **Sprite Sheet als PNG:** alle 8 Frames nebeneinander, Originalgrösse (512 × 40).
2. **JSON-Datei** mit Framegrösse, Anzahl Frames, Bilder pro Sekunde und den Pixel-Positionen der Lack-Farbgruppe (oder einer separaten Maske).
3. **Animiertes GIF** in 4-facher Grösse zum schnellen Anschauen.

Zusätzlich für alle Kategorien zusammen:

4. **Eine HTML-Vorschauseite**, auf der alle Motorräder animiert nebeneinander laufen, mit Kategorienamen darunter und einem Farbwähler, der die Lackfarbe live ändert.
5. **Das Python-Skript**, mit dem alles erzeugt wurde (zum Beispiel mit Pillow, Pixel als Zeichen-Raster im Code). So kann ich später einzelne Pixel anpassen und alles neu erzeugen lassen.

### Ordnerstruktur

```
pixel-motorraeder/
  generate.py
  vorschau.html
  naked/
    naked_sheet.png
    naked.json
    naked_preview.gif
  supersport/
    ...
```

## Checkliste vor der Abgabe

- [ ] Jede Kategorie ist allein an der Silhouette erkennbar.
- [ ] Alle Motorräder fahren nach rechts und stehen auf derselben Bodenlinie.
- [ ] Nur Farben aus der Palette verwendet.
- [ ] Lackfarbe lässt sich austauschen, ohne andere Teile zu verfärben.
- [ ] Animation läuft nahtlos im Loop, ohne Ruckeln beim Übergang von Frame 8 zu Frame 1.
- [ ] Keine Logos oder Markennamen.

## Ideen für später (noch nicht umsetzen)

- **Drehbares Modell:** Das Motorrad aus 8 Richtungen (alle 45°), damit man es in der App mit Wischen drehen kann.
- **Anpassung an Umbauten:** Varianten für Auspuff, Spiegel, Blinker, Heck und Sattel, die man auf das Pixel-Motorrad setzen kann.
