# Referenzanalyse am Quellcode

Erhoben am 14. November 2026 mit `tools/audit/ref-analyze.js`: Seite in Chromium geladen (1440 × 900 und 390 × 844), ganz durchgescrollt, berechnete Stile aller sichtbaren Textelemente ausgelesen, alle CSS- und JS-Dateien nach Schriften, Dauern und Easing-Kurven durchsucht. Rohdaten: `messwerte/referenz-*.json`. Alle Werte sind **gemessen**. Lighthouse lief je einmal mobil.

## Messwerte pro Seite

### zrk.technology

| Bereich | Messwert |
|---|---|
| Schriften | Inter Display 500 (139 KB) und Geist Mono 400 (38 KB). Zwei Dateien. |
| Typo-Skala Desktop | 200 px Zahlen · 48 px Titel · 14 px Text · 10 px Mono-Labels in Versalien |
| Typo-Skala mobil | 120 / 96 · 32 · 15,6 · 10–11 px |
| Zeilenhöhen | 0,74–0,75 (Zahlen) · 0,9 (Titel) · 1,3 (Text) |
| Laufweite | −0,05 em (Zahlen) · −0,04 em (Titel) · −0,01 em (Text) |
| Farben | #050505 Fläche, #DDD Text, ein Akzent #FC4F00. Keine Rundungen. |
| Abstände | Raster 1408 px, Lücken 28,8 / 24 / 12 px, Sektionen als Vollbild-Szenen (Hero 9900 px hoch, gepinnt) |
| Animation | GSAP 3.15 mit 45 ScrollTriggern, Lenis (`lerp` 0,04–0,05). Easing: `power2.out`, `power3.out`, `power2.inOut`. CSS: 0,35 s `ease` für Farbe, `cubic-bezier(0.25, 1, 0.5, 1)`. Laufband 80 s linear. |
| Auslöser | Scroll (Scrub `true`, Start `top top` und `top 85%`), Hover, Mausbewegung |
| Reduzierte Bewegung | 0 Regeln im CSS |
| Ladegewicht | Desktop 51,5 MB (26,7 MB Video, 494 Bilder), mobil 36,6 MB. 4304 DOM-Elemente. |
| Lighthouse mobil | Performance 87 · LCP 3,1 s · TBT 150 ms · Barrierefreiheit 66 |

### anml.com/work/salesloft

| Bereich | Messwert |
|---|---|
| Schriften | Sharp Sans No1 ExtraBold 800 (Titel) und Crimson Text 400 (Fliesstext, Serif). Drei Dateien, 65 KB. |
| Typo-Skala Desktop | 158 px · 68 px Kennzahl · 40 px H2 · 32 px H3 · 20 px Text · 12 px Label |
| Typo-Skala mobil | 68 · 52 · 32 · 26 · 20 · 12 px |
| Zeilenhöhen | 1,0–1,2 (Titel) · 1,6 (Text) |
| Laufweite | 0 (Titel und Text) · +0,13 em (Labels in Versalien) |
| Farben | Schwarz, Weiss, drei Grautöne. Rundung 8 px. |
| Abstände | Sektionen 224 / 112 px (Desktop) und 128 / 64 px (mobil). Textspalte 1008 px. |
| Animation | Übergänge 0,25 / 0,45 / 0,5 s. Kurven `cubic-bezier(.625,.05,0,1)`, `(.76,0,.24,1)`, `(.53,.21,0,1)`. GSAP-Dauern 0,3–0,65 s, Staffelung 0,12–0,15 s. Lenis (`lerp` 0,11). |
| Auslöser | Eintritt in den Viewport (19 IntersectionObserver-Stellen), Hover |
| Reduzierte Bewegung | 2 Regeln im CSS |
| Ladegewicht | Desktop 131 MB (129 MB Video), mobil 102 MB. 667 DOM-Elemente. |
| Lighthouse mobil | FCP 1,2 s · LCP nicht ermittelbar · Barrierefreiheit 87 · 73 MB im Testlauf |
| Inhaltsmuster | Kennzahl («50 % Higher MQL-to-Sales Rate») → Erzählung → Zitat mit Name und Funktion |

### koffiracha.com

| Bereich | Messwert |
|---|---|
| Schriften | Founders Grotesk 400/500 und Condensed 600. Drei Dateien, 66 KB. |
| Typo-Skala Desktop | 263 px H1 in Versalien · 70 · 45 · 35 · 21,6 · 16 px |
| Typo-Skala mobil | 140 · 109 · 35 · 32 · 24 · 16 px |
| Zeilenhöhen | 0,8 (H1) · 1,0 für alles andere, auch Fliesstext |
| Laufweite | 0 bis +0,01 em |
| Farben | Schwarz auf Weiss, ein Akzent #E6FE52. Rundung 36 px. |
| Abstände | Sektionen 128 px, Lücken 10 / 45 / 48 px |
| Animation | GSAP mit `power2.out`, `power4.out`, `elastic(0.3,0.5)`, `back.out(1.5)`. Dauern 0,5–2 s. Scrub 1–2. |
| Auslöser | Scroll (`top center`, `top 75%`), Hover (16 Stellen), Lottie-Sequenzen |
| Reduzierte Bewegung | 0 Regeln im CSS |
| Ladegewicht | Desktop 38,8 MB (601 Anfragen), mobil 11,3 MB |
| Lighthouse mobil | Performance 53 · LCP 3,1 s · TBT 2620 ms · Barrierefreiheit 95 |

### jeton.com

| Bereich | Messwert |
|---|---|
| Schriften | Sequel Sans 400/450/500/600 (vier Dateien, 71 KB) und Sora (25 KB) |
| Typo-Skala | Acht fluide Stufen mit `clamp()`: 18–20 · 19–24 · 23–36 · 27–48 · 32–64 · 40–80 · 48–120 · 56–180 px |
| Zeilenhöhen | 0,9–1,0 (Display) · 1,2 (Zwischentitel) · 1,5 (Text 16 px) |
| Laufweite | 0 bis +0,01 em (Titel) · +0,03 em (Text) |
| Farben | Eine Markenfarbe #F73B20, Weiss, dunkles Braun #360802. Rundungen 8 / 12 / 16 px. |
| Abstände | Lücken 8 / 16 / 24 px. Sektionen 120–140 px. |
| Animation | Übergänge vor allem 0,2 s (57-mal) und 0,3 s (36-mal). Häufigste Kurve `cubic-bezier(.215,.61,.355,1)` (24-mal), dann `(.2,0,0,1)` und `(.165,.84,.44,1)`. Staffelung 0,03–0,05 s. View Transitions. |
| Auslöser | Eintritt in den Viewport, Scroll (Scrub), Hover |
| Reduzierte Bewegung | 2 Regeln im CSS, 13 Stellen im JS |
| Ladegewicht | Desktop 39,9 MB (33 MB Video), mobil 32,4 MB |
| Lighthouse mobil | Performance 45 · LCP 15,9 s · TBT 940 ms · Barrierefreiheit 84 |

## Fünf Prinzipien für die Speaker-Seite

| Nr. | Prinzip | Beleg in den Referenzen | Umsetzung |
|---|---|---|---|
| 1 | **Eine Schriftfamilie, zwei Stimmen.** | zrk lädt zwei Dateien, jeton und koffiracha je eine Familie. Labels in Mono-Versalien (zrk) tragen die technische Note. | Mona Sans variabel (Gewicht und Breite) für Titel, Text und Labels. Eine Datei, 96 KB statt 132 KB. Die Schrift und der Versalien-Satz folgen dem Wunsch des Auftraggebers und der Seite praktikum.beyonder.ch (gemessen: Gewicht 850, Breite 85 %, Zeilenhöhe 0,86, Kurve `cubic-bezier(.16,1,.3,1)`). Deren Signalwellen und Farbwelt sind bewusst nicht übernommen. |
| 2 | **Grosse Skalensprünge auf einer fluiden Skala.** | zrk 200 → 48 → 14 px. jeton acht `clamp()`-Stufen. Display-Zeilenhöhe 0,9–1,0, negative Laufweite. | Claim 46–152 px, Kennzahlen bis 128 px, Typo-Band bis 240 px, Zeilenhöhe 0,86–0,98, Laufweite −0,04 bis −0,055 em. Fliesstext bleibt bei 17 px und 1,6. |
| 3 | **Ein Akzent auf neutraler Fläche, Linien statt Karten.** | zrk: ein Orange, keine Rundungen, Haarlinien. koffiracha und jeton: je eine Akzentfarbe. | BEYONDER-Orange als einziger Akzent. Verläufe, Glas-Effekt und Schatten entfernt. Sektionen und Listen über 1-px-Linien getrennt. |
| 4 | **Spiel mit Schrift und Zeiger, ohne Scroll-Zwang.** | zrk und jeton: Text fährt zeilenweise ein (SplitText), Bewegung hängt am Scroll. anml und koffiracha: Bild und Fläche reagieren auf den Zeiger. jeton: 0,2–0,3 s, eine Kurvenfamilie. | Zeilen- und Wort-Reveal, wechselndes Akzentwort, Spotlight und Bühnenfoto am Zeiger, scrollgekoppeltes Typo-Band. Drei Dauern (0,2 / 0,45 / 0,8 s), zwei Kurven. Technik: CSS und IntersectionObserver statt GSAP. |
| 5 | **Beleg vor Behauptung.** | anml: Kennzahl → Erzählung → Zitat mit Name und Funktion. | Kennzahlen mit Quelle, Bühnen mit Datum und Link, Bewertungen wörtlich mit Namen. |

## Bewusst nicht übernommen

| Muster | Gefunden bei | Grund |
|---|---|---|
| Smooth-Scroll per JavaScript (Lenis) | zrk, anml, jeton | Greift ins Scrollen ein, kostet Rechenzeit, stört Tastatur und Screenreader. Der Code von zrk schaltet es für Touch selbst ab. |
| Gepinnte Scroll-Szenen | zrk (Hero 9900 px) | Verzögert den Weg zur Anfrage. Die alte Seite hatte genau dieses Problem bei den Keynotes. |
| Autoplay-Video als Fläche | alle vier (26 bis 129 MB) | Sprengt jedes Budget. Lighthouse: jeton LCP 15,9 s, koffiracha TBT 2620 ms. Der Trailer lädt erst nach Klick. |
| 10-px-Text in Versalien | zrk | Unlesbar auf Mobilgeräten, Barrierefreiheit 66. Labels sind hier 12 px, Fliesstext 17 px. |
| Zeilenhöhe 1,0 im Fliesstext | koffiracha | Für kurze Produkttexte tragbar, für Keynote-Beschreibungen nicht. |
| Elastische und federnde Kurven | koffiracha (`elastic`, `back.out`) | Passt zu Hot Sauce, nicht zu einem Redner für Geschäftsleitungen. |
| Display-Grössen über 200 px im Lesetext | zrk, koffiracha | Deutsche Wörter wie «Künstliche Intelligenz» brechen dann auf Mobilgeräten. Der Claim endet bei 152 px. Nur das dekorative Typo-Band geht bis 240 px. |
| Serifenschrift für Fliesstext | anml | Zweite Familie, zusätzliche Datei. Die Wirkung «redaktionell» entsteht hier über Spaltenbreite und Linien. |
| Fehlende Regeln für reduzierte Bewegung | zrk, koffiracha (0 im CSS) | Pflicht nach Vorgabe. |
| WebGL, Lottie, Rive, Preloader | zrk, koffiracha, jeton | Kein Nutzen für die Buchungsentscheidung. |
