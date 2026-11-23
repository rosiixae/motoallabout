# Auftrag: Händler-E-Mails für fehlende Wartungsdaten

Stand: 23.11.2026, nach Phase 9. Quelle der Werte: `claude/motorrad-liste-schweiz.csv` (Spalten Status, Hinweis).

## Ziel
Pro Marke eine kurze, freundliche E-Mail auf Deutsch (Schweiz, kein ß) an den **Schweizer Importeur oder einen offiziellen Händler** in der Schweiz, mit der richtigen E-Mail-Adresse (auf der offiziellen Website recherchieren und Link als Beleg angeben; keine Adresse erfinden – wenn nur ein Kontaktformular existiert, das sagen).

Gefragt wird pro Modell nach den Angaben aus dem Handbuch / Serviceheft:
- Ölwechsel alle … km und spätestens nach … Monaten
- Ölfilter bei jedem Ölwechsel?
- Ventilspiel prüfen alle … km
- Empfohlene Ölsorte (SAE, JASO/API) und Ölmenge mit Filterwechsel
- Gerne Foto oder PDF der Wartungstabelle

Absenderin: Rosalie, entwickelt die App «MotoAllAbout» für Motorrad-Einsteiger:innen in der Schweiz.

## Modelle «offen» (keine Werte)
| Marke | Modell |
|---|---|
| Beta | RR 125 (2018–) |
| Aprilia | SX 125 (2018–), RS 125 |
| SWM | SM 125 R |
| Zontes | 368 G (2025–) |
| Voge | 900 DSX (2024–) |
| Yamaha | Ray ZR 125 |

## Modelle «prüfen» (Werte da, Bestätigung fehlt)
| Marke | Modell | Was unsicher ist |
|---|---|---|
| Yamaha | MT-125, YZF-R125 | Ventilspiel-Intervall (6'000 km?) |
| Yamaha | NMAX 125 | Zeitintervall, Ölsorte |
| Yamaha | X-Max 125, X-Max 300 | Ölintervall 6'000 oder 10'000 km |
| Honda | CB 125 R, Vision 110, PCX 125 | Ölwechsel bei jeder 6'000-km-Inspektion? Ventilspiel |
| Honda | ADV 350 | Ventilspiel |
| Honda | CB 1000 Hornet | EU-Werte (12'000 / 36'000 km?) |
| Aprilia | RS 457 | EU-Wartungsplan |
| Fantic | XMF 125, XEF 125 | Monate, Ventilspiel, Ölsorte |
| Suzuki | GSX-8S, V-Strom 800DE | Bestätigung 6'000 km / 12 Mt, Ventile 24'000 km |
| BMW | F 800 GS, R 1250 RT | Ventilspiel 20'000 km bestätigen |
| Vespa | Primavera 125, GTS 125, GTS 310 | Intervalle je Baujahr |

Aprilia, Vespa (beide Piaggio-Gruppe): wenn sinnvoll, eine gemeinsame E-Mail.

## Ergebnis
Die fertigen E-Mails als Doc im Projekt ablegen (z. B. `claude/haendler-mails.md`), eine E-Mail pro Empfänger, jeweils mit: Empfänger, E-Mail-Adresse + Beleg-Link, Betreff, Text.
