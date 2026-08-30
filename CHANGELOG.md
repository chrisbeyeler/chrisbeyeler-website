# Changelog

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
