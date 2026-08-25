# Changelog

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
