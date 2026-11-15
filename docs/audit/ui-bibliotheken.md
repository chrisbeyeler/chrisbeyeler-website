# Analyse von sieben UI-Angeboten und was davon in die Seite geflossen ist

Stand 15. November 2026. Auftrag: die sieben Angebote ansehen und die Seite damit noch einmal prüfen.

## Quellenlage (wichtig)

Sechs der sieben Websites waren aus dieser Sitzung nicht erreichbar (Netzwerksperre). Erreichbar war nur GitHub. Ich habe deshalb die öffentlichen Original-Repos derselben Projekte ausgewertet. Was ich nicht lesen konnte, steht als **offen** da und ist nicht geschätzt.

| Angebot | Gelesene Quelle | Status |
|---|---|---|
| untitledui.com | README von `untitleduico/react` | **teilweise**: nur Beschreibung, keine Komponentenliste, keine Website |
| magicui.design | `magicuidesign/magicui`: `registry.json` (79 Komponenten), `skills/magic-ui/SKILL.md` | gelesen |
| smoothui.dev | README von `educlopez/smoothui` | **teilweise**: 16 Komponenten genannt, keine Motion-Regeln im Text |
| retroui.io | `Logging-Studio/RetroUI`: `registry.json`, `app/global.css` | gelesen. Das Repo verweist auf retroui.dev. Ob retroui.io dasselbe Projekt ist, konnte ich nicht prüfen: **offen** |
| ui.shadcn.com/docs/skills | `shadcn-ui/ui`: `skills/shadcn/SKILL.md` | gelesen (Skill-Datei statt Doku-Seite) |
| reactbits.dev | `DavidHDev/react-bits`: README, `src/constants/Categories.js` | gelesen |
| ui-ux-pro-max-skill | README, `ux-guidelines.csv` (120 Regeln), `landing.csv` (34 Muster) | gelesen |

Alle Bibliotheken sind für React und Tailwind gebaut. Diese Seite ist statisches HTML ohne Framework. Ich habe deshalb **keinen Code übernommen**, sondern Muster und Regeln, und sie in CSS und wenig JavaScript nachgebaut. Das hält das Ladegewicht bei 201 KB.

## Was die Quellen sagen

| Quelle | Kern | Beleg |
|---|---|---|
| Magic UI | 79 Effekt-Bausteine: Marquee, Bento Grid, Number Ticker, Word Rotate, Scroll Progress, Text Reveal, Highlighter, Border Beam, Hero Video Dialog, Kinetic Text. Regel: «Keep motion intentional; avoid stacking many high-motion effects in one viewport» und «Start with 1 core component + 1 supporting effect». | `registry.json`, `SKILL.md` |
| React Bits | 216 Bausteine in fünf Gruppen (33 Text, 38 Animation, 48 Komponenten, 34 Micro, 63 Hintergründe), z. B. Split Text, Rotating Text, Count Up, Scroll Velocity, Variable Proximity, Magnet, Spotlight Card, Masonry, Stepper, Target Cursor. Lizenz MIT mit Commons Clause. | `Categories.js`, README |
| SmoothUI | Kleine, weiche Interaktionen: Expandable Cards, Scrollable Card Stack, Scramble Hover, Cursor Follow, Clip Corners Button. | README |
| RetroUI | Neo-Brutalismus: Radius 0, schwarze Rahmen, harte Schatten ohne Unschärfe (`4px 4px 0 0`), Gelb `#ffdb33` auf Beige. | `global.css` |
| shadcn-Skill | Regeln statt Effekte: semantische Farbtokens statt Einzelfarben, Abstände über `gap`, Auswahl aus 2 bis 7 Optionen als Schaltergruppe, `fieldset` mit `legend` für Gruppen, Fehler über `aria-invalid`, Dialoge brauchen einen Titel. | `SKILL.md` |
| Untitled UI | Grosse Komponentensammlung auf React Aria, also Bedienbarkeit per Tastatur und Screenreader als Grundlage. | README |
| UI UX Pro Max | Prüfliste vor Abgabe: keine Emojis als Icons, sichtbarer Fokus, Kontrast 4,5:1, reduzierte Bewegung, Text bricht um statt abzuschneiden, Breiten 375 / 768 / 1024 / 1440. Dazu 120 UX-Regeln und 34 Seitenmuster, z. B. «Hero + Testimonials + CTA» mit Aufruf nach den Stimmen. | README, CSV-Dateien |

## Abgleich: was die Seite schon hatte

| Baustein aus den Bibliotheken | Auf der Seite |
|---|---|
| Marquee / Logo Loop | Laufband der Medien |
| Bento Grid / Magic Bento | Mosaik der Beiträge |
| Number Ticker / Count Up | Kennzahlen zählen hoch |
| Word Rotate / Rotating Text | Akzentwort im Hero |
| Split Text | Titel fahren wortweise ein |
| Scroll Progress | Fortschrittsbalken oben |
| Spotlight Card | Lichtkegel im Hero |
| Scroll Velocity | scrollgekoppeltes Typo-Band |

## Neu umgesetzt

| Nr. | Änderung | Herkunft |
|---|---|---|
| 1 | **Anfrage in drei Schritten** (Anlass, Termin und Ort, Kontakt) mit Format-Auswahl inklusive Preisen, Zusammenfassung vor dem Senden, Fehlermeldung direkt am Feld, Sende-Zustand am Knopf. Ohne JavaScript bleibt es ein einziges Formular. | React Bits «Stepper»; shadcn (Schaltergruppe, `fieldset`, `aria-invalid`); UX Pro Max (Fehler am Feld, Rückmeldung beim Senden) |
| 2 | **Keynote-Videos als Bühne mit Wiedergabeliste**, Wiedergabe direkt auf der Seite. YouTube lädt erst beim Klick. | Magic UI «Hero Video Dialog» |
| 3 | **Kein Element doppelt:** Beiträge als Mosaik, Podcasts als Liste mit Cover, Videos als Bühne, Stimmen als Wischkarten. | React Bits «Masonry» und «Magic Bento» als Gegenstück |
| 4 | **Knopf zum Anhalten des Laufbands.** Schliesst den offenen Punkt zu WCAG 2.2.2. | UX Pro Max «Auto-Rotating Content Controls» |
| 5 | **Aufruf nach den Stimmen** («Das sollen deine Gäste auch sagen?»). | UX Pro Max, Muster «Hero + Testimonials + CTA» |
| 6 | **Marker** zieht sich über den Kernsatz des Essays. | Magic UI «Highlighter» |
| 7 | **Footer-Schriftzug reagiert auf den Zeiger:** Buchstaben ziehen sich zusammen. Nutzt die Achsen von Mona Sans, kostet keine zusätzlichen Daten. | React Bits «Variable Proximity», Magic UI «Kinetic Text» |
| 8 | **Trefferwert im Erkennungsrahmen zählt hoch** («Bühne 0.96»). | Magic UI «Number Ticker», auf das eigene Logo-Motiv angewendet |
| 9 | **Knöpfe heben sich mit hartem Schatten an** und drücken sich beim Klick ein. | RetroUI (`shadow: 3px 3px 0 0`) |

## Prüfliste von UI UX Pro Max gegen die Seite

| Regel | Ergebnis | Status |
|---|---|---|
| Keine Emojis als Icons | 0 gefunden | gemessen |
| Kontrast 4,5:1 | axe: 0 Verstösse | gemessen |
| Sichtbarer Fokus, Tastaturbedienung | Fokusring auf allen Bedienelementen, Format-Auswahl sind echte Radio-Felder | gemessen (axe). Ein Durchgang nur mit Tastatur steht aus: **offen** |
| Reduzierte Bewegung | axe-Lauf mit reduzierter Bewegung: 0 Verstösse. Kein Autostart und keine Scroll-Effekte laut Code | gemessen (axe), Verhalten am Code geprüft |
| Text bricht um, nichts abgeschnitten | 11 Breiten von 320 bis 1920 px ohne Überlauf | gemessen |
| Zielgrösse mindestens 24 px | bestanden | gemessen |
| Fokus nicht verdeckt (feste Navigation) | `scroll-padding-top` gesetzt | gemessen |
| Automatisch laufende Inhalte anhaltbar | Laufband und Trailer haben einen Knopf | gemessen |
| Fehler am Feld, mit `aria-describedby` | umgesetzt | gemessen (Funktionstest) |
| KI-Inhalte gekennzeichnet | Chat heisst «Chris Beyeler AI» und «KI-Version von Chris» | gemessen |
| Wichtiges nicht nur per Hover | Bilder der kleinen Kacheln und das grosse Cover sind Zugabe, der Inhalt steht immer da | am Code geprüft |
| z-index-Skala | Werte 1 bis 200 plus ein Ausreisser 999 | **offen**: aufräumen |
| Höchstens 1 bis 2 bewegte Elemente pro Ansicht | Der Hero hat mehr (Akzentwort, Lichtkegel, Siegel, Wort-Einfahrt) | **bewusst abgewichen**: ausdrücklicher Wunsch nach mehr Spiel. Alles endet nach kurzer Zeit oder hängt am Zeiger |

## Bewusst nicht übernommen

| Muster | Quelle | Grund |
|---|---|---|
| WebGL- und Canvas-Hintergründe (Globe, Particles, 63 Hintergründe) | Magic UI, React Bits | Sprengen das Budget und lenken von der Anfrage ab |
| Eigener Zeiger (Target Cursor, Smooth Cursor, Blob Cursor) | React Bits, Magic UI | Ersetzt ein Bedienelement des Systems. Stört Tastatur- und Touch-Nutzung |
| Regenbogen-, Neon- und Shimmer-Knöpfe, Konfetti | Magic UI | Nicht «edel». UX Pro Max führt Neon und violette KI-Verläufe als Fehlmuster |
| Gelb-Schwarz-Palette und Comic-Schrift | RetroUI | Eigene Farbwelt «Polarlicht» bleibt. Übernommen ist nur der harte Schatten |
| React, Tailwind, Motion als Abhängigkeit | alle | Die Seite kommt ohne Framework aus. Ein Umbau brächte für Besucher nichts |
| Scroll-Stapel und gepinnte Szenen | React Bits «Scroll Stack», SmoothUI | Verzögern den Weg zur Anfrage |

## Offen

- Die sechs gesperrten Websites selbst ansehen, sobald sie in den Netzwerk-Einstellungen freigegeben sind. Vor allem Untitled UI (Aufbau der Startseite, Komponenten-Zustände) und die Doku-Seite von shadcn.
- Datenschutztext: Der Absatz zu YouTube ist an die Wiedergabe auf der Seite angepasst. Bitte rechtlich gegenlesen.
- z-index-Skala aufräumen.
