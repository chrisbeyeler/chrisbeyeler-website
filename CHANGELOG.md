# Changelog

## 2026-11-27 — Pressekit als Download-Kit

- Neue Seite `assets/pressekit/`: Kurzbeschrieb, Bio kurz, Bio lang, Kurz-CV (je kopieren oder als TXT), Fotos in mehreren Formaten, ZIP mit allem
- Fotos: Porträt als Hochformat 4:5, Quadrat, Querformat und Avatar; Bühnenfotos als Web (1600 px) und Druck (Original); zwei neue Hochformat-Bühnenfotos
- Texte auf die Zahlen der Website gebracht (2500 Ausgebildete, 150 Folgen, 400+ Mitglieder)
- Alte Fotoseite `assets/pressekit/fotos/` leitet aufs Pressekit um; Startseite und `llms*.txt` verlinken das Kit

## 2026-11-15 (später Abend) — Termine aus dem Kalender, neues Video, Wort-Rahmen, Frist

- Bühnen: Business Schmiede Live Festival (29.–30. Mai 2026) neu; OMT Summit auf 4.–6. März 2026 datiert; Daten für AS-TAG, BrainFood, Automotive Summit 2026 und Panoff ergänzt. Summe 96 (Herleitung in `docs/audit/belege.md`, Abschnitt 6)
- Neues Video «The State of AI» (Business Schmiede) in der Video-Bühne
- Wort-Rahmen in der Keynote-Liste (`.frame`)
- FAQ, Formular, Chat und `llms.txt`: gesicherte Zusage ab vier Monaten Vorlauf

## 2026-11-15 (Abend) — Ladezeit, Auftritte pro Jahr, echte Medienlogos

### Ladezeit
- Abschnitte unter dem ersten Bildschirm werden erst gerendert, wenn sie in die Nähe kommen (`content-visibility`). Rechenzeit beim Laden sinkt deutlich
- Schrift wird nicht mehr vorab geladen; angeglichene Ersatzschriften verhindern Layoutsprünge beim Wechsel
- `js/main.js` läuft in kurzen Portionen statt am Stück; `js/chatbot.js` lädt erst, wenn jemand den Chat braucht
- Strukturierte Daten stehen am Ende des HTML statt im Kopf
- Weite Sprünge (z. B. «Keynote anfragen» im Hero) gehen direkt statt gleitend und werden nachkontrolliert
- Ein Kern-CSS im Kopf wurde gemessen und verworfen (schnelleres erstes Bild, aber Rechenspitzen danach)

### Fehler behoben
- `css/style.css` hatte drei Syntaxfehler aus früheren Umbauten (zwei überzählige Klammern, ein abgeschnittenes `-webkit-`). Folge: Regeln für reduzierte Bewegung beim Akzentwort und der Rahmen des Chat-Kastens wurden vom Browser verworfen. Neu prüft `tools/audit/css-check.js` das Stylesheet

### Inhalt
- Bühnen: pro Jahr öffentlich aufgeführte Auftritte plus nicht öffentliche Einsätze, Summe 95 (Herleitung in `docs/audit/belege.md`, Abschnitt 5)
- Medien: 12 echte Logos von den Verlagsseiten in `img/media/`, einfarbig auf hellem Band; 8 Medien weiterhin als Schriftzug
- Chat-Dienst (`worker/index.js`): Preisregel an die neuen Ab-Preise angepasst. **Der Worker muss neu ausgerollt werden**, sonst antwortet der Chat weiter ohne Preise
- `llms-full.txt`: unbelegte Bühne «Business Schmiede Festival» entfernt
- Chat-Dienst: veraltete Zahlen an die Seite angeglichen (2500+ ausgebildet, 90+ Speeches, 150 Episoden, 165 Bewertungen), «Business Schmiede» entfernt

## 2026-11-15 — Scrollytelling, Trailer-Autostart, Mosaik, Preise

- Typo-Band, Hero-Bild, Siegel und Werdegang hängen jetzt per JavaScript am Scroll (`--p`). Vorher lief das nur in Browsern mit CSS-Scroll-Timelines, sonst stand das Band still und war abgeschnitten
- Neu: Fortschrittsbalken oben, Keynote in der Bildmitte tritt hervor, Linie im Werdegang füllt sich
- Trailer starten stumm von selbst, sobald sie im Bild sind, auch auf dem Handy. Ausnahmen: reduzierte Bewegung und Datensparmodus. Die Navigation bleibt dabei bedienbar
- Beiträge und Podcast-Gastauftritte als Mosaik: alle 27 und 17 Einträge sichtbar, kein «Mehr anzeigen», keine Wischreihe. Das Raster bleibt bei jeder Anzahl lückenlos
- Medien als grosse Wortmarken in Mona Sans, abgeleitet aus `content/press.json`. Die alten Text-Logos in `img/media/` sind gelöscht
- Preise: Standard-Keynote ab CHF 3'000, individuelle Keynote ab CHF 5'000 (Formate, FAQ, Schema, Chatbot, `llms.txt`)
- Keynote-Konfigurator steht jetzt direkt unter dem Sektionstitel
- Zeilenabstand der Titel erhöht, damit Kommata die nächste Zeile nicht berühren
- Ein schwaches Zitat entfernt
- Impressum und Datenschutz haben ihre Gestaltung zurück

### Zweite Runde am selben Tag
- Anfrage in drei Schritten (Anlass, Termin und Ort, Kontakt) mit Format-Auswahl inklusive Preisen, Zusammenfassung, Fehlermeldungen am Feld. Ohne JavaScript ein einziges Formular
- Keynote-Videos als Bühne mit Wiedergabeliste; Wiedergabe direkt auf der Seite, YouTube lädt erst beim Klick (`youtube-nocookie.com`). Datenschutztext entsprechend angepasst
- Kein Element doppelt: Beiträge als Mosaik, Podcasts als Liste mit Cover
- Laufband der Medien lässt sich anhalten; Aufruf nach den Stimmen; Marker auf dem Kernsatz des Essays
- Footer-Schriftzug reagiert auf den Zeiger, Trefferwert im Erkennungsrahmen zählt hoch, Knöpfe mit hartem Schatten
- Analyse von sieben UI-Angeboten: `docs/audit/ui-bibliotheken.md`

### Dritte Runde: Websites live vermessen
- Alle sechs Websites im Browser geladen und vermessen (`tools/audit/site-scan.js`, Rohdaten in `docs/audit/messwerte/ui-*.json`); Analyse ergänzt und RetroUI korrigiert
- Tastatur-Durchgang als Test (`tools/audit/tastatur.js`): 170 Halte ohne Befund
- Fehler behoben: Eingabefeld im KI-Chat hatte keinen sichtbaren Fokus und nur einen Platzhalter als Namen
- z-index-Skala aufgeräumt, leichtes Federn bei Rückmeldung am Zeiger

## 2026-11-14 — Überarbeitung für Buchungsanfragen: Design, Tempo, Belege, Auffindbarkeit

Messwerte, Referenzanalyse und offene Punkte: `docs/audit/`.

### Design
- Eigenes Logo «Erkennung»: Name im Rahmen mit Label «KI-Speaker 0.99», Monogramm «CB» (`img/logo/`), auch als Favicon
- Mona Sans als einzige Schrift; Titel in Versalien, fett und schmal gesetzt
- Farbwelt «Polarlicht»: Grünschwarz, gebrochenes Weiss, ein Verlauf von Türkis zu Limette als einziger Akzent
- Drehendes Siegel im Hero, Erkennungsrahmen als wiederkehrendes Zeichen
- Design-Tokens für Farbe, Typografie, Abstände, Form und Motion; `css/style.css` neu geschrieben
- Eine Schriftfamilie (Inter variabel) plus Geist Mono für Labels, statt Inter, Montserrat und Lexend
- Hero mit statischer H1, grossem Claim und wechselndem Akzentwort; Kennzahlen als eigenes Band
- Keynotes als grosse Titel zum Aufklappen statt gepinntem Karussell; «Anfragen» übernimmt das Thema ins Formular
- Stimmen als Wisch-Karten, Bühnen als Liste mit Datum und Quelle, Typo-Band, Wortmarke im Footer

### Motion
- GSAP, ScrollTrigger und Lenis von der Startseite entfernt (der Essay nutzt sie weiter)
- Effekte über CSS und IntersectionObserver: Zeilen- und Wort-Reveal, Hochzählen, Spotlight und Bühnenfoto am Zeiger, scrollgekoppeltes Typo-Band
- Vollständige `prefers-reduced-motion`-Fallbacks; ohne JavaScript ist alles sichtbar

### Performance (mobil, Labor, lokal gemessen)
- LCP 3,7 s → 2,0 s, TBT 342 ms → 39 ms, Seitengewicht 1470 KB → 177 KB, Anfragen 23 → 12
- 109 WebP-Varianten mit `srcset` (`tools/optimize_images.py`)

### Inhalt und Belege
- «90+ Speeches», anonyme Rückmeldungen von Veranstaltern, Bühnen nach Jahr, nächste Auftritte
- Sieben weitere Podcast-Folgen, Profile bei HWZ und OMT, Essay wieder in der Navigation
- Fehler behoben: Trailer schliesst beim Verlassen, die Navigation bleibt bedienbar
- Zahlen stehen als echte Werte im HTML, mit Quelle oder dem Hinweis «Eigene Zählung»
- Korrigiert: 165 statt 133 Google-Bewertungen (Profil BEYONDER), 150 Episoden, swissAI über 400 Mitglieder, Vergabe der Digital Shapers
- Entfernt: ProvenExpert-Note, Bühne «Business Schmiede», zwei Wertungen ohne Beleg
- FAQ auf sieben Fragen erweitert; Text identisch mit dem Schema

### Auffindbarkeit
- Ein Schema-Graph: WebSite, ProfilePage, Person, Organisationen, Keynotes, Podcast, Videos mit `uploadDate`, drei Events, FAQ
- `robots.txt` nennt KI-Crawler ausdrücklich; `llms.txt` und `llms-full.txt` aktualisiert

### Barrierefreiheit
- axe (WCAG 2.2 AA): 4 Regeln mit 11 Elementen → 0
- Skip-Link, sichtbarer Fokus, Kontraste, Zielgrössen, Menü mit Escape

### Aufgeräumt
- Ungenutzte Bibliotheken entfernt: particles, swiper, vanilla-tilt

## 2026-10-21 — Weiterleitung für Planungsmail-Knöpfe

- Neue Seite `/k/` (noindex, in robots.txt gesperrt): leitet die Antwort-Knöpfe der Planungsmails samt Parametern an die Apps-Script-Web-App «Planungssystem Mail-Buttons» weiter. Grund: Gmail zeigt bei Links direkt auf script.google.com einen Weiterleitungshinweis, der einen zweiten Klick verlangt. Ändert sich die Web-App-Bereitstellung, nur `ZIEL` in `k/index.html` anpassen.

## 2026-08-30 — Motion-Dramaturgie und CLS

Audit gegen den website-motion-Katalog (21 Patterns, GSAP + ScrollTrigger + Lenis). Befund: nicht zu wenig Motion, sondern zu viel gleichzeitig. Acht parallele Ambient-Effekte und zwei gepinnte Kapitel auf 24.8 Bildschirmhöhen.

### Performance und CLS
- Hero-Headline entkoppelt: Zeichen starten auf `opacity: 1`, animiert werden nur `y` und Blur. Die H1 ist LCP-Kandidat und wartete zuvor hinter `delay: 0.25` plus 0.7 s Animationsdauer
- Blur des Zeichen-Reveals von 8 px auf 3 px reduziert (teuerster Filter der Seite, 40 Spans gleichzeitig)
- Zeichen-Split läuft neu hinter `document.fonts.ready`: beim Font-Swap verschoben sich zuvor die Zeichenbreiten mitten in der Animation
- `width`/`height` auf 110 Bildern ergänzt, Werte aus den echten Bilddateien; damit tragen 120 von 120 Bildern Angaben
- `height: auto` in die globale `img`-Regel ergänzt, ohne die hätten die neuen Attribute skalierte Bilder verzerrt (verifiziert: 0 von 120 verzerrt)

### Dramaturgie
- Quotes-Pin aufgelöst: die Keynotes sind das einzige gepinnte Kapitel. Der Crossfade läuft ungepinnt über die Durchquerung des Containers (`top 75%` bis `bottom 25%`) statt über den Blindwert `quotes.length * 300`, dazu `invalidateOnRefresh` und `gsap.matchMedia()` mit Breakpoint exakt auf der CSS-Grenze von 768 px
- Particles.js entfernt (Init, Loader, Container, CSS): `line_linked` ist der teuerste Modus der Bibliothek
- Custom Cursor entfernt: lief in jedem GSAP-Tick mit und konkurrierte mit dem Keynotes-Pin um Aufmerksamkeit
- Hero-Scanlines entfernt (JS, Markup, CSS inkl. Mobile-Variante)
- Scrub-Drift auf Formate-, Rollen-, Themen- und FAQ-Grid entfernt: höchste Trigger-Kosten auf den Strecken, die laut Katalog bewusst ruhig sein sollen
- Als Ambient-Effekt bleiben die Ghost-Titel

### Messwerte
- ScrollTrigger-Instanzen 96 → 92, gepinnte Kapitel 2 → 1, Bilder ohne Dimensionen 110 → 0
- Verbleibende Dauerlast sind 35 Scrub-Trigger, davon 12 für die Zähl-Animationen. Deren Umstellung auf `once` ist der nächste Hebel, ändert aber das Zählverhalten sichtbar und wurde bewusst offengelassen
- Die About-Timeline-Farbwechsel bleiben als Callback-Trigger in beide Richtungen: dort laufen keine Tweens, `toggleActions` greift nicht

## 2026-08-25 — Pin-Sprung-Fix und Hero-Bubbles-Choreografie

- Keynotes-Pin springt nicht mehr: `anticipatePin` entfernt (kontraproduktiv mit Lenis), `scrub: true` statt 0.8 (kein Doppel-Smoothing), `ignoreMobileResize` plus Breiten-Gate im Resize-Handler (mobile URL-Bar refresht nicht mehr mitten im Pin), Pin-Inhalt kompaktiert, damit er in 100svh passt
- Hero-Info-Bubbles neu choreografiert, komplett in GSAP (die alten CSS-Float-Keyframes überschrieben den Magnetismus): elastischer Einflug von den Bildrändern, organisches Orbit-Schweben mit Tiefenstaffelung, zyklischer Glow-Puls, weicher quickTo-Magnetismus; pausiert ausserhalb des Viewports

## 2026-08-25 — Animations- und Interaktionspaket

Analyse von ki-workplace.ch als Vorlage, drei Iterationen (v2 Grundlagen, v3 Signature-Effekte, v4 Mobile + Verstärkung).

### Scroll-Effekte
- Keynotes als gepinnte 100svh-Bühne mit horizontalem Scrub auf allen Geräten (Desktop und Mobile), inkl. Progress-Balken; Konfigurator navigiert über den Pin-Progress zur empfohlenen Karte
- Curtain-Reveal-Footer ab 900px: Footer liegt fix hinter dem Content und wird beim Scrollen freigelegt
- Ghost-Titel: grosse Kontur-Wörter mit Parallax hinter allen Hauptsektionen
- Riesen-Jahreszahlen neben der About-Timeline, crossfaden mit dem aktiven Jahr
- Bild-Parallax auf Essay-Bild, About-Portrait und Podcast-Cover
- Galerie-Fotos mit Clip-Wipe-Reveal
- Scrub-Drift auf Formate-, Rollen-, Themen- und FAQ-Grids
- Essay-, Titel- und Karten-Reveals unverändert, neu auch für Formate, Ratings, Podcast-Stats und Logo-Marquees

### Interaktion
- Magnetische 3D-Tilt-Buttons auf allen CTAs (Desktop-Pointer, elastisches Zurückschnappen)
- Custom Cursor: Dot + Ring, wächst über Interaktivem, zeigt «Play»/«Ansehen» (Desktop)
- Hero-Headline baut sich Buchstabe für Buchstabe mit Blur auf
- Testimonials als zwei gegenläufige, bei Hover/Touch pausierende Endlos-Reihen
- Counter-Pop beim Fertigzählen, Konfetti bei Konfigurator-Empfehlung und Formular-Absenden
- Nav-Scroll-Spy mit sich zeichnender Unterlinie
- Karten-Glow beim Hover (Light-Mode-Variante vorbereitet)

### Mobile
- Artikel, Galerie, Shorts und Gast-Podcasts als horizontale Snap-Swipe-Reihen
- Viewport-Spotlight: Karte in der Bildschirmmitte hebt sich hervor (Ersatz für Hover)
- Tap-Feedback auf allen Karten und Buttons
- Hero: Gyro-Parallax (Android), Scroll-Parallax (iOS), dezente Scanlines

### Technik
- `gsap.matchMedia()` für alle Breakpoint-/Reduced-Motion-Zweige (räumt bei Resize selbst auf)
- Vollständige `prefers-reduced-motion`-Fallbacks (statische Zustände, natives Keynote-Karussell)
- Perf: Marquees pausieren ausserhalb des Viewports, Hero-Mausverfolgung rAF-gedrosselt, `clearProps` nach Reveals (repariert CSS-Hover)
