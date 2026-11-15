# Analyse von sieben UI-Angeboten und was davon in die Seite geflossen ist

Stand 15. November 2026. Auftrag: die sieben Angebote ansehen und die Seite damit noch einmal prüfen.

## Quellenlage

Zwei Durchgänge:

1. **Repos:** Zuerst waren die Websites gesperrt. Gelesen wurden die öffentlichen GitHub-Repos (Komponentenlisten, Skill-Dateien, Regelwerke).
2. **Websites:** Nach der Freigabe wurden alle sechs Seiten im Browser geladen (Chromium, 1440 × 900) und mit `tools/audit/site-scan.js` vermessen. Rohdaten: `messwerte/ui-*.json`. Die Zahl der Anfragen gilt nach einem Scroll durch die ganze Seite, also mit allen nachgeladenen Bildern und Videos. Beim ersten Laden sind es bei dieser Seite 11.

| Angebot | Repo gelesen | Website gemessen |
|---|---|---|
| untitledui.com | README von `untitleduico/react` | ja |
| magicui.design | `registry.json` (79 Komponenten), `SKILL.md` | ja |
| smoothui.dev | README | ja |
| retroui.io | **anderes Projekt** als zuerst gelesen, siehe unten | ja |
| ui.shadcn.com/docs/skills | `skills/shadcn/SKILL.md` | ja |
| reactbits.dev | README, `Categories.js` | ja |
| ui-ux-pro-max-skill | README, `ux-guidelines.csv` (120 Regeln), `landing.csv` (34 Muster) | nur GitHub |

**Korrektur zu RetroUI:** Im ersten Durchgang habe ich `Logging-Studio/RetroUI` gelesen. Dieses Projekt gehört zu retroui.dev. Die verlinkte Seite retroui.io ist ein anderes Projekt: «Retro UI – Pixelated React Components», eine Pixel-Bibliothek mit Minecraft-Schrift. Beide arbeiten mit harten Schatten ohne Unschärfe und ohne Rundung. Die übernommene Idee (Punkt 9) gilt für beide.

Alle Bibliotheken sind für React gebaut. Diese Seite ist statisches HTML ohne Framework. Ich habe deshalb **keinen Code übernommen**, sondern Muster und Regeln, und sie in CSS und wenig JavaScript nachgebaut. Das hält das Ladegewicht bei 201 KB.

## Messwerte der Websites (gemessen)

| Seite | Seitenhöhe | DOM-Elemente | Anfragen | Canvas / Video | H1 | Schrift | Knopf | Regeln für reduzierte Bewegung |
|---|---|---|---|---|---|---|---|---|
| untitledui.com | 20 085 px | 4 717 | 163 | 0 / 0 | 44 px, 600, −0,02 em | nur Inter | Radius 8 px, feiner Innenschatten | 0 |
| magicui.design | 3 733 px | 2 079 | 120 | 0 / 3 | 72 px, 600, −0,05 em | Geist, Geist Mono | Radius 8 px | 1 |
| smoothui.dev | 11 739 px | 1 909 | 158 | 3 / 0 | 72 px, 600, −0,025 em | Inter | Radius 10 px, 44 px hoch | 3 |
| retroui.io | 900 px | 121 | 23 | 0 / 0 | 24 px | Minecraft | Rahmen 5 px schwarz, Schatten `2px 2px 0 2px` in zwei Farben, Radius 0 | 0 |
| reactbits.dev | 9 132 px | 1 960 | 89 | 9 / 0 | 42 px, 500, −0,036 em | Geist | Radius 10 px | 37 |
| ui.shadcn.com/docs/skills | 2 449 px | 990 | 250 | 0 / 0 | 30 px, 600 | Geist | Radius 10 px | 2 |
| **chrisbeyeler.ch (neu, lokal)** | 29 633 px | 1 663 | 74 | 0 / 2 | Claim bis 152 px, 850 | nur Mona Sans | Radius 0, harter Schatten | 13 |

Was auffällt:

- **Eine Schriftfamilie reicht.** Untitled UI nutzt nur Inter, Magic UI und React Bits nur Geist. Das bestätigt die Wahl von Mona Sans als einzige Schrift.
- **Beweis mit Zahl und Zusatz.** Untitled UI: «10,000+ Components and variants», «420+ Page design examples», «Join 380,000+ designers». Magic UI nennt Kunden mit Zusatz («YC W23, raised $4M»). Auf dieser Seite: Kennzahlen mit Quelle, Bühnen mit Datum und Link.
- **Schluss mit Fragen und Aufruf.** React Bits endet mit «Questions, answered» und dem Satz «Build something people remember.» Diese Seite endet mit FAQ, Anfrage und dem grossen Schriftzug.
- **Bewegung kostet.** React Bits lädt 9 Canvas-Flächen und hat 27 gleichzeitig animierte Elemente, dafür 37 Regeln für reduzierte Bewegung. Untitled UI und retroui.io haben keine einzige. Diese Seite: kein Canvas, 13 Regeln.
- **Preise offen zeigen.** Untitled UI hat einen Abschnitt «Simple, transparent pricing». Die Keynote-Preise stehen jetzt bei den Formaten, in der FAQ und im Formular.

## Was die Quellen sagen (Wortlaut)

| Quelle | Kern |
|---|---|
| Magic UI (Website) | «150+ free and open-source animated components and effects built with React, Typescript, Tailwind CSS, and Motion.» |
| Magic UI (Skill) | «Keep motion intentional; avoid stacking many high-motion effects in one viewport.» «Start with 1 core component + 1 supporting effect.» |
| React Bits | «All 216 components and backgrounds on this site, across five categories: Text Animations, Animations, Components, Micro and Backgrounds.» |
| SmoothUI | «Every component ships with motion built in — powered by Motion and GSAP, tuned for spring physics, and fully reduced-motion aware.» |
| Untitled UI | «Accessible by design: Based on React Aria components with WAI-ARIA standards for accessibility, including keyboard navigation and screen reader support.» |
| shadcn (Doku) | «Pattern enforcement — The assistant follows shadcn/ui composition rules: using FieldGroup for forms, ToggleGroup for option sets, semantic colors, and correct base-specific APIs.» |
| retroui.io | «A simple pixelated UI library.» |
| UI UX Pro Max | Prüfliste: keine Emojis als Icons, sichtbarer Fokus, Kontrast 4,5:1, reduzierte Bewegung, Text bricht um statt abzuschneiden, Breiten 375 / 768 / 1024 / 1440. Muster «Hero + Testimonials + CTA» mit Aufruf nach den Stimmen. |

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
| 1 | **Anfrage in drei Schritten** (Anlass, Termin und Ort, Kontakt) mit Format-Auswahl inklusive Preisen, Zusammenfassung vor dem Senden, Fehlermeldung direkt am Feld, Sende-Zustand am Knopf. Ohne JavaScript bleibt es ein einziges Formular. | React Bits «Stepper»; shadcn (Schaltergruppe für Optionen, Feldgruppen); UX Pro Max (Fehler am Feld, Rückmeldung beim Senden) |
| 2 | **Keynote-Videos als Bühne mit Wiedergabeliste**, Wiedergabe direkt auf der Seite. YouTube lädt erst beim Klick. | Magic UI «Hero Video Dialog» |
| 3 | **Kein Element doppelt:** Beiträge als Mosaik, Podcasts als Liste mit Cover, Videos als Bühne, Stimmen als Wischkarten. | React Bits «Masonry» und «Magic Bento» als Gegenstück |
| 4 | **Knopf zum Anhalten des Laufbands.** Schliesst den offenen Punkt zu WCAG 2.2.2. | UX Pro Max «Auto-Rotating Content Controls» |
| 5 | **Aufruf nach den Stimmen** («Das sollen deine Gäste auch sagen?»). | UX Pro Max, Muster «Hero + Testimonials + CTA» |
| 6 | **Marker** zieht sich über den Kernsatz des Essays. | Magic UI «Highlighter» |
| 7 | **Footer-Schriftzug reagiert auf den Zeiger:** Buchstaben ziehen sich zusammen. Nutzt die Achsen von Mona Sans, kostet keine zusätzlichen Daten. | React Bits «Variable Proximity», Magic UI «Kinetic Text» |
| 8 | **Trefferwert im Erkennungsrahmen zählt hoch** («Bühne 0.96»). | Magic UI «Number Ticker», auf das eigene Logo-Motiv angewendet |
| 9 | **Knöpfe heben sich mit hartem Schatten an** und drücken sich beim Klick ein. | retroui.io (`2px 2px 0 2px`), RetroUI von Logging-Studio (`3px 3px 0 0`) |
| 10 | **Leichtes Federn** bei Rückmeldung am Zeiger (Knopf, Play-Feld, Podcast-Cover). Nur dort, nicht bei Inhalten. | SmoothUI «tuned for spring physics» |
| 11 | **Tastatur-Durchgang als Test** (`tools/audit/tastatur.js`): 170 Halte, jeder sichtbar, nicht verdeckt, mit Fokusrahmen. Der Test fand einen Fehler: Das Eingabefeld im KI-Chat hatte keinen sichtbaren Fokus. Behoben, dazu ein richtiger Name statt nur Platzhalter. | Untitled UI «Accessible by design», UX Pro Max «Placeholder as only label» |
| 12 | **z-index-Skala aufgeräumt** (Ausreisser 999 entfernt). | UX Pro Max «Z-Index Management» |

## Prüfliste von UI UX Pro Max gegen die Seite

| Regel | Ergebnis | Status |
|---|---|---|
| Keine Emojis als Icons | 0 gefunden | gemessen |
| Kontrast 4,5:1 | axe: 0 Verstösse | gemessen |
| Sichtbarer Fokus, Tastaturbedienung | 170 Halte ohne Befund, keine Tastaturfalle, Footer erreichbar | gemessen |
| Reduzierte Bewegung | axe-Lauf mit reduzierter Bewegung: 0 Verstösse. Kein Autostart und keine Scroll-Effekte laut Code | gemessen (axe), Verhalten am Code geprüft |
| Text bricht um, nichts abgeschnitten | 11 Breiten von 320 bis 1920 px ohne Überlauf | gemessen |
| Zielgrösse mindestens 24 px | bestanden | gemessen |
| Fokus nicht verdeckt (feste Navigation) | kein Halt unter der Navigation | gemessen |
| Automatisch laufende Inhalte anhaltbar | Laufband und Trailer haben einen Knopf | gemessen |
| Fehler am Feld, mit `aria-describedby` | umgesetzt | gemessen (Funktionstest) |
| KI-Inhalte gekennzeichnet | Chat heisst «Chris Beyeler AI» und «KI-Version von Chris» | gemessen |
| Wichtiges nicht nur per Hover | Bilder der kleinen Kacheln und das grosse Cover sind Zugabe, der Inhalt steht immer da | am Code geprüft |
| z-index-Skala | Inhalt 1–8, Zeigerbild 50, Navigation 100, Fortschritt 101, Chat 150, Skip-Link 200 | gemessen |
| Höchstens 1 bis 2 bewegte Elemente pro Ansicht | Der Hero hat mehr (Akzentwort, Lichtkegel, Siegel, Wort-Einfahrt) | **bewusst abgewichen**: ausdrücklicher Wunsch nach mehr Spiel. Alles endet nach kurzer Zeit oder hängt am Zeiger |

## Bewusst nicht übernommen

| Muster | Quelle | Grund |
|---|---|---|
| WebGL- und Canvas-Hintergründe | React Bits (9 Canvas auf der Startseite), Magic UI, SmoothUI (3 Canvas) | Sprengen das Budget und lenken von der Anfrage ab |
| Eigener Zeiger (Target Cursor, Smooth Cursor, Blob Cursor) | React Bits, Magic UI | Ersetzt ein Bedienelement des Systems. Stört Tastatur- und Touch-Nutzung |
| Regenbogen-, Neon- und Shimmer-Knöpfe, Konfetti | Magic UI | Nicht «edel». UX Pro Max führt Neon und violette KI-Verläufe als Fehlmuster |
| Violett getönter Hintergrund | React Bits (`rgb(18, 15, 23)`) | Ausdrücklich kein Violett gewünscht |
| Pixel-Schrift, 5-px-Rahmen, Gelb-Schwarz | retroui.io, RetroUI | Eigene Farbwelt «Polarlicht» bleibt. Übernommen ist nur der harte Schatten |
| Rundungen von 8 bis 16 px | Untitled UI, Magic UI, SmoothUI, React Bits | Die Seite bleibt kantig. Das trägt das Logo-Motiv «Erkennung» |
| React, Tailwind, Motion als Abhängigkeit | alle | Die Seite kommt ohne Framework aus. Ein Umbau brächte für Besucher nichts |
| Scroll-Stapel und gepinnte Szenen | React Bits «Scroll Stack» | Verzögern den Weg zur Anfrage |

## Erledigt

- Datenschutztext zu YouTube: vom Auftraggeber am 15. November 2026 freigegeben.

## Offen

- Alte Farb-Aliasse im CSS (`--orange`, `--glass-bg`) zeigen auf die neuen Tokens. Sie funktionieren, heissen aber nicht nach ihrer Rolle (shadcn: «semantic colors»). Aufräumen bei Gelegenheit.
- Screenreader-Durchgang mit echter Software (VoiceOver, NVDA) steht aus. Gemessen sind axe und Tastatur.
