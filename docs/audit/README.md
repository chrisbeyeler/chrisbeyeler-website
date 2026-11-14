# Audit und Nachweis: Überarbeitung chrisbeyeler.ch

Stand: 14. November 2026. Ziel der Seite: Buchungsanfrage von Eventplanern in der Schweiz.

Legende: **gemessen** = selbst erhoben, Rohdaten in `messwerte/`. **geschätzt** = abgeleitet, nicht gemessen. **offen** = noch nicht messbar oder wartet auf Angaben von Chris.

Weitere Dokumente: [Referenzanalyse](referenzanalyse.md) · [Belege und offene Punkte](belege.md) · [Test-Prompts](prompts.md)

## 1. Vorher/Nachher

Mobil, Lighthouse 12 (simuliertes langsames 4G, 4-fache CPU-Drosselung), Median aus 5 Läufen. «Lokal» heisst: gleicher Rechner, gleicher Server mit gzip und Cache-Headern wie GitHub Pages. Nur die lokalen Werte sind direkt vergleichbar, weil der neue Stand noch nicht live ist.

| Messgrösse | Budget | Vorher live | Vorher lokal | Nachher lokal | Status |
|---|---|---|---|---|---|
| LCP | ≤ 2,5 s | 2,1 s (Läufe 2,0–2,9 s) | 3,7 s (3,4–4,0 s) | **2,0 s** (2,03 s in allen Läufen) | gemessen (Labor) |
| TBT (Laborersatz für INP) | – | 352 ms | 342 ms | **32 ms** | gemessen (Labor) |
| Längste Interaktion (Tippen, 4-fache CPU-Drosselung) | INP ≤ 200 ms | – | 256 ms | **72 ms** | gemessen (Labor, kein Feld-INP) |
| CLS | ≤ 0,1 | 0 | 0,001 | **0** | gemessen (Labor) |
| FCP | – | 0,96 s | 1,81 s |  0,91 s | gemessen |
| Lighthouse Performance | – | 91 | 82 | **99** | gemessen |
| Lighthouse Barrierefreiheit | – | 91 | 91 | **100** | gemessen |
| Lighthouse SEO / Best Practices | – | 100 / 100 | 100 / 100 | 100 / 100 | gemessen |
| Seitengewicht beim Laden | – | 1474 KB | 1470 KB | **200 KB** | gemessen |
| Anfragen beim Laden | – | 23 | 23 | **11** | gemessen |
| davon Bilder | – | 1185 KB | 1184 KB | 39 KB | gemessen |
| davon Schriften | – | 132 KB, 6 Dateien | 132 KB, 6 Dateien | 96 KB, 1 Datei | gemessen |
| davon JavaScript | – | 78 KB, 5 Dateien | 78 KB, 5 Dateien | 13 KB, 2 Dateien | gemessen |
| CSS (gzip) | – | 19 KB | 19 KB | 14 KB | gemessen |
| Alle Bilder der Seite (auch nachgeladene) | – | 9455 KB | 9455 KB | 1758 KB (WebP, grösste Variante) | gemessen |
| DOM-Elemente (mobil) | – | – | 1414 | 1340 | gemessen |
| Sichtbare Wörter (mobil) | – | – | 2289 | 1820 | gemessen |
| Seitenhöhe (mobil) | – | – | 27 928 px | 24 975 px | gemessen |
| Scroll-Animationen (ScrollTrigger-Instanzen) | – | – | 108 | 0 | gemessen |
| axe, WCAG 2.2 AA (mobil) | 0 | 4 Regeln, 11 Elemente | 4 Regeln, 11 Elemente | **0** (auch mit reduzierter Bewegung) | gemessen |
| Schema-Validator (validator.schema.org) | 0 Fehler | nicht geprüft | nicht geprüft | **0 Fehler, 0 Warnungen** | gemessen |
| Rich Results Test (Google) | – | – | – | – | **offen**: nur nach dem Livegang prüfbar |
| Felddaten (CrUX: LCP, INP, CLS echter Nutzer) | – | nicht abrufbar | – | – | **offen**: API-Kontingent ohne Schlüssel ist 0 |
| Nennung in KI-Suche, 10 Prompts | – | 2 von 9 generischen Prompts, nur Nachname; eigene Domain in 0 von 181 Links | – | – | Vorher gemessen, Nachher **offen** (erst nach Livegang und Neuindexierung) |
| Google/Bing/DuckDuckGo-Positionen | – | nicht messbar (Captcha/Blockade aus dem Rechenzentrum) | – | – | **offen** |

Einordnung:

- Die lokalen Laborwerte liegen systematisch über den Live-Werten (LCP vorher 3,7 s lokal gegen 2,1 s live). Für den Livegang ist deshalb ein LCP unter 2,0 s zu erwarten. Das ist **geschätzt** und nach dem Deploy nachzumessen.
- INP ist eine Feldmetrik. Im Labor zeigen TBT und die längste Interaktion die Richtung, ersetzen aber keine Felddaten.
- Die Seite zeigt 20 % weniger Text und ist 11 % kürzer. Die Inhalte stehen weiterhin vollständig im HTML (eingeklappte Bereiche sind für Crawler lesbar).

## 2. Baseline im Detail

### Barrierefreiheit vorher (axe, mobil)

| Regel | Elemente | Beispiel |
|---|---|---|
| Farbkontrast | 5 | Keynote-Nummern mit 1,43:1, Essay-Text mit 1,69:1 |
| Sichtbarer Text fehlt im zugänglichen Namen | 3 | Trailer-Knopf, Shorts-Karte |
| Links nur über Farbe erkennbar | 2 | Links im Fliesstext, 1,22:1 zur Umgebung |
| Scrollbereich ohne Tastaturzugang | 1 | Bühnen-Galerie |

### Auffindbarkeit vorher

| Befund | Wirkung |
|---|---|
| Kennzahlen standen als «0» im HTML, die echte Zahl kam erst per JavaScript | Crawler ohne JavaScript lasen «0+ Menschen ausgebildet» |
| H1 lautete «Künstliche Intelligenz», das Verb wurde per JavaScript getippt | Name und Rolle fehlten in der Hauptüberschrift |
| FAQ-Schema nannte sechs Keynotes, der sichtbare FAQ-Text vier | Schema und Inhalt widersprachen sich |
| `alumniOf` für HWZ, MAZ, SIB, zB. | Er lehrt dort, er hat dort nicht studiert |
| `AggregateRating` 4,9 bei 133 auf der Person | Die Bewertungen gehören zum Google-Profil der BEYONDER AG |
| `VideoObject` ohne `uploadDate` | Pflichtfeld für Video-Darstellung fehlte |
| Kein Event-Schema | – |
| KI-Crawler | 11 User-Agents getestet (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Googlebot, Bingbot, CCBot, Applebot-Extended): alle HTTP 200, gleiche Antwortgrösse. Kein Problem. |

### Sichtbarkeit in KI-Suche vorher (10 feste Prompts)

Gemessen wurde ein Kanal: KI-Antwort mit Websuche (Claude, Suchindex USA, je ein Lauf). Rohdaten: `prompts-baseline.json`.

| Nr. | Prompt | Name in der Antwort | Eigene Domain in den Links |
|---|---|---|---|
| 1 | KI Keynote Speaker Schweiz | teilweise, nur «Beyeler» | nein |
| 2 | Keynote Speaker Künstliche Intelligenz Schweiz buchen | nein | nein |
| 3 | Bester KI Speaker Schweiz | teilweise, nur «Beyeler» | nein |
| 4 | Keynote Speaker Schweiz KI für KMU | nein | nein |
| 5 | Keynote Speaker Schweiz Agentic AI KI-Agenten | nein | nein |
| 6 | Keynote Speaker Schweiz KI im Marketing | nein | nein |
| 7 | Keynote Speaker Schweiz Führung im KI-Zeitalter | nein | nein |
| 8 | KI Referent für Firmenevent Zürich | nein | nein |
| 9 | AI keynote speaker Switzerland | nein | nein |
| 10 | Wer ist Chris Beyeler? | ja, aber als «Digital-Marketing-Experte» laut CAMPIXX | nein |

- Die Nennungen stützen sich allein auf bilanz.ch (Digital Shapers) und campixx.de. Keine der eigenen Domains wurde zitiert.
- Am häufigsten genannt wurden Andy Fitze und Dalith Steiger-Gablinger (SwissCognitive) sowie Roger Basler de Roca.
- Zitierte Quellen waren vor allem netzwoche.ch, bilanz.ch, premium-speakers.com, zhaw.ch und swisscognitive.ch. Der grösste Hebel liegt also ausserhalb der eigenen Seite: Profile bei Speaker-Agenturen und Nennungen in Event-Programmen.
- ChatGPT, Perplexity, Gemini und Copilot brauchen ein Login und wurden nicht getestet: **offen**.

## 3. Was umgesetzt wurde

Nach der Rückmeldung «zu viel Text, zu wenig Typografie und Spiel» wurde die erste, nüchterne Fassung überarbeitet. Stand ist die zweite Fassung. Bilder: `screenshots/`.

| Bereich | Änderung |
|---|---|
| Design-Tokens | Farbe, Typografie, Abstände, Form und Motion als Variablen am Anfang von `css/style.css`. Farbwelt «Polarlicht»: Grünschwarz als Grund, gebrochenes Weiss als Papier, Salbei als stille Zweitfarbe, ein Verlauf von Türkis zu Limette als einziger Akzent. Die Farbe kommt als Leuchten (feste Lichtfelder hinter der Seite), nicht als Fläche. |
| Logo | «Erkennung»: Name im Rahmen mit Label «KI-Speaker 0.99», wie bei der Bilderkennung. Wortmarke und Monogramm «CB» als SVG unter `img/logo/`, auch als Favicon. Derselbe Rahmen liegt auf dem Porträt. Vom Auftraggeber aus zwölf Entwürfen gewählt. |
| Typografie | Eine variable Familie: Mona Sans (Gewicht und Breite). Titel in Versalien, Gewicht 850, schmal gesetzt (85 %), Zeilenhöhe 0,88. Claim 48 bis 168 px, Sektionstitel 40 bis 124 px. Fliesstext 17 px. Vorher drei Familien in sechs Dateien. |
| Hero | Statische H1 mit Name, Rolle und Claim. Keine Absätze, eine Faktenzeile, zwei Aktionen. Drehendes Siegel «Digital Shaper 2026». |
| Kennzahlen | Eigenes Band mit grossen Ziffern. Echte Zahlen im HTML. Episoden und Bewertungen mit Quellenlink; «90+ Speeches» und «2500+» sind eigene Angaben. |
| Keynotes | Grosse Titel zum Aufklappen statt Karussell. Jede Keynote hat einen Link, der das Thema ins Formular übernimmt. |
| Bühnen | 41 Auftritte nach Jahr, mit Datum, Ort und Titel. 14 davon mit Link zur Quelle; die übrigen stammen aus dem eigenen Kalender. Dazu «Nächste Auftritte». |
| Stimmen | Zwei anonyme Rückmeldungen von Veranstaltern und vier Google-Bewertungen als grosse Wisch-Karten, fünf weitere eingeklappt. |
| Anfrage | Sektion heisst «Keynote anfragen». Themenauswahl enthält die sechs aktuellen Keynotes. Der Knopf steht auf Mobilgeräten dauerhaft in der Kopfzeile. |
| Bilder | 109 WebP-Varianten (480/960/1440 px) mit `srcset`. Skript: `tools/optimize_images.py`. |
| Schema | Ein Graph mit WebSite, ProfilePage, Person, zwei Organisationen, sechs Keynotes als Service, PodcastSeries, zwei VideoObject mit `uploadDate`, fünf Event (zwei davon kommend), FAQPage. Der FAQ-Text im Schema ist wörtlich der sichtbare Text. |
| KI-Zugang | `robots.txt` nennt die KI-Crawler ausdrücklich. `llms.txt` und `llms-full.txt` enthalten die geprüften Zahlen und belegte Auftritte. |
| Barrierefreiheit | Skip-Link, sichtbarer Fokus, Kontraste ab 7:1 für Text, Zielgrössen ab 44 px für Knöpfe, Menü mit Escape schliessbar, Scrollbereiche per Tastatur erreichbar. |

Effekte, alle ohne Bibliothek (kein GSAP, kein ScrollTrigger, kein Lenis auf der Startseite):

| Effekt | Auslöser | Technik | Dauer, Kurve |
|---|---|---|---|
| Claim fährt zeilenweise hoch | Laden | CSS-Animation | 0,9 s, `cubic-bezier(.625,.05,0,1)`, 90 ms Staffelung |
| Akzentwort wechselt Verständlich → Relevant → Wirksam → Verständlich | Laden, einmal | CSS-Animation | 3,4 s, endet nach 5 s (WCAG 2.2.2) |
| Hero-Bild setzt sich und driftet beim Scrollen | Laden, Scroll | CSS, `animation-timeline: scroll()` | 1,8 s bzw. scrollgekoppelt |
| Bühnen-Spotlight folgt dem Zeiger | Mausbewegung | CSS-Variablen, ein `requestAnimationFrame` | – |
| Siegel dreht sich | Scroll, Hover | CSS, `animation-timeline: scroll()` | scrollgekoppelt |
| Kennzahlen zählen hoch | Eintritt | IntersectionObserver | 1,4 s, ease-out |
| Typo-Band «Verständlich. Relevant. Wirksam.» | Scroll | CSS, `animation-timeline: view()` | scrollgekoppelt, steht ohne Scrollen still |
| Sektionstitel: Wörter fahren einzeln hoch | Eintritt | IntersectionObserver und CSS | 0,8 s, 55 ms Staffelung |
| Bühnenfoto folgt dem Zeiger über den Keynotes | Hover | `transform`, ein `requestAnimationFrame` | – |
| Keynote klappt auf, andere Titel treten zurück | Klick, Hover | `<details>`, `interpolate-size`, `:has()` | 0,45 s |
| Knöpfe füllen sich von unten, Pfeil rückt vor | Hover | CSS | 0,45 s |
| Galerie-Bilder wischen auf | Eintritt | `clip-path` | 1 s, 80 ms Staffelung |
| Wortmarke «Keynote anfragen» füllt sich | Hover, Fokus | CSS | 0,45 s |

- Mit `prefers-reduced-motion` sind alle Effekte aus. Ohne JavaScript ist der gesamte Inhalt sichtbar.
- Scrollgekoppelte Effekte laufen in Chrome, Edge und Safari ab Version 26. Firefox zeigt den ruhenden Zustand.
- Keine Bewegung läuft länger als 5 Sekunden von selbst, ausser dem Logo-Laufband der Medien. Es pausiert bei Hover und Fokus.

Bewusst entfernt und warum:

- **Fehler behoben:** Auf dem Desktop startete der Trailer beim Vorbeiscrollen und lief unsichtbar weiter. Solange blieb die Navigation abgedunkelt und nicht klickbar. Er schliesst jetzt, sobald er aus dem Bild ist.
- **Gepinntes Keynote-Karussell:** versteckte die Themen 4 bis 6 hinter Scrollen und lud vier Bilder mit zusammen 1,1 MB.
- **Testimonial-Laufband:** bewegter Text ist schwer lesbar und liess sich nur per Hover anhalten.
- **Konfetti, Magnet-Buttons, Ghost-Titel, Parallax, Vorhang-Footer:** kosteten Rechenzeit (TBT 342 ms) und lenkten von der Anfrage ab.
- **`AggregateRating` im Schema:** Die Bewertungen gehören zur BEYONDER AG. Google wertet Eigenbewertungen von Organisationen ohnehin nicht als Sterne aus.
- **ProvenExpert 4,47:** Das Profil zeigt öffentlich keine Note.
- **«Business Schmiede» als Bühne:** kein Beleg gefunden.

## 4. Nachweis

| Prüfung | Ergebnis | Status |
|---|---|---|
| axe 4.10, Tags WCAG 2.0/2.1/2.2 A und AA, Pixel 7, ganze Seite gescrollt | 0 Verstösse, 35 bestandene Regeln | gemessen |
| Logo-Laufband der Medien ohne Pause-Knopf für Touch | läuft endlos, pausiert nur bei Hover und Fokus | **offen**: für strenge Auslegung von WCAG 2.2.2 Pause-Knopf ergänzen oder statisch setzen |
| axe mit `prefers-reduced-motion: reduce` | 0 Verstösse | gemessen |
| Kontraste über Verläufen | 16 Farbpaare von Hand nach WCAG gerechnet: alle ab 5.5:1 | gemessen |
| axe «unvollständig» | 37 Elemente Farbkontrast: Text über dem Hero-Foto, automatisch nicht berechenbar | **offen**: manuell prüfen (Scrim liegt bei 72–92 % Deckung) |
| Tastatur: Skip-Link, Menü, Escape | bestanden | gemessen (`tools/audit/functest.js`) |
| Funktionen: Themenübernahme, Konfigurator, Mehr Artikel, Datum offen, Trailer, Mail-Link | bestanden | gemessen |
| Ohne JavaScript: Inhalte sichtbar, H1 vollständig | bestanden | gemessen |
| Überschriften ohne Sprung, eine H1 | bestanden | gemessen |
| Kein horizontaler Überlauf (412 px und 1440 px) | bestanden | gemessen |
| validator.schema.org | 0 Fehler, 0 Warnungen | gemessen |
| Google Rich Results Test | nicht automatisierbar, braucht die Live-URL | **offen** |
| Screenreader-Test (VoiceOver, TalkBack) | nicht durchgeführt | **offen** |
| WCAG 2.2 AA gesamt | automatische Prüfung bestanden. Eine vollständige Konformität braucht zusätzlich die manuellen Punkte oben. | teilweise |

Hinweis zum Rich Results Test: Google zeigt FAQ-Ergebnisse seit 2023 nur noch für Behörden- und Gesundheitsseiten. Das FAQ-Schema hilft hier der maschinellen Lesbarkeit, nicht der Darstellung in der Suche.

## 5. Messungen wiederholen

```bash
cd tools/audit && npm install
```

```bash
node serve.js ../.. 8765
```

```bash
./lh-run.sh http://localhost:8765/ nachher 5
```

```bash
node axe-run.js http://localhost:8765/ nachher
```

```bash
node functest.js
```

Nach dem Livegang dieselben Befehle mit `https://chrisbeyeler.ch/` ausführen und die 10 Prompts aus `prompts.md` erneut testen.
