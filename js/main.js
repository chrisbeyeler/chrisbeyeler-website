/* ===================================================================
   CHRIS BEYELER — Main JavaScript
   GSAP Animations, Particles, Counter, Navigation, Smooth Scroll
   =================================================================== */

// ===== REDUCED MOTION =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== LENIS SMOOTH SCROLL =====
const lenis = new Lenis({
    duration: prefersReducedMotion ? 0 : 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: !prefersReducedMotion,
});

// Sync Lenis with GSAP ScrollTrigger (single RAF loop via GSAP ticker)
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ===== PARTICLES.JS — subtle, premium =====
if (document.getElementById('particles-js')) {
    const isMobile = window.innerWidth < 768;
    particlesJS('particles-js', {
        particles: {
            number: { value: isMobile ? 15 : 35, density: { enable: true, value_area: 1000 } },
            color: { value: '#46BFED' },
            shape: { type: 'circle' },
            opacity: {
                value: 0.12,
                random: true,
                anim: { enable: true, speed: 0.2, opacity_min: 0.04 }
            },
            size: {
                value: 1.5,
                random: true,
                anim: { enable: false }
            },
            line_linked: {
                enable: true,
                distance: 160,
                color: '#46BFED',
                opacity: 0.05,
                width: 0.8
            },
            move: {
                enable: true,
                speed: 0.3,
                direction: 'none',
                random: true,
                out_mode: 'out',
                attract: { enable: false }
            }
        },
        interactivity: {
            detect_on: 'canvas',
            events: {
                onhover: { enable: !isMobile, mode: 'grab' },
                onclick: { enable: false },
                resize: true
            },
            modes: {
                grab: { distance: 120, line_linked: { opacity: 0.12 } }
            }
        },
        retina_detect: true
    });
}

// ===== NAVIGATION =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
        nav.classList.add('nav--scrolled');
    } else {
        nav.classList.remove('nav--scrolled');
    }
});

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// ===== HERO ANIMATIONS (Stage Layout) =====
if (prefersReducedMotion) {
    gsap.set(['.hero__stage-label', '.hero__stage-headline', '.hero__stage-sub', '.hero__ctas'], { opacity: 1, y: 0 });
} else {
    const heroTl = gsap.timeline({ delay: 0.5 });
    heroTl
        .fromTo('.hero__stage-label',
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: 'power2.out' })
        .fromTo('.hero__stage-headline',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, '-=0.2')
        .fromTo('.hero__stage-sub',
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: 'power2.out' }, '-=0.4')
        .to('.hero__ctas', {
            opacity: 1, duration: 0.5, ease: 'power2.out'
        }, '-=0.2');
}

// ===== ST-1: Hero → Keynotes Transition (Pin) =====
if (!prefersReducedMotion && window.innerWidth >= 768) {
    const heroBottom = document.querySelector('.hero__bottom');

    // Offset einmalig berechnen: wie weit muss Trust-Bar nach oben, um im Viewport-Zentrum zu landen
    let trustMoveY = 0;
    function calcTrustMove() {
        // Reset transforms für korrekte Messung
        gsap.set(heroBottom, { y: 0, scale: 1 });
        const barRect = heroBottom.getBoundingClientRect();
        const barCenter = barRect.top + barRect.height / 2;
        trustMoveY = (window.innerHeight / 2) - barCenter;
    }
    calcTrustMove();
    // Bei Resize neu berechnen
    window.addEventListener('resize', calcTrustMove);

    ScrollTrigger.create({
        trigger: '.hero',
        start: 'bottom bottom',
        end: '+=80%',
        pin: true,
        scrub: 1,
        onUpdate: (self) => {
            const p = self.progress;

            // Phase 1 (0–30%): Hero-Content fade-out, Trust-Bar bleibt
            // Phase 2 (30–70%): Trust-Bar wandert ins Viewport-Zentrum, wird grösser + Orange
            // Phase 3 (70–100%): Trust-Bar fade-out nach oben

            // Hero content verschwindet schnell
            const contentFade = Math.max(0, 1 - p * 3.3);
            gsap.set('.hero__content', { opacity: contentFade, y: -p * 80 });

            if (p < 0.3) {
                // Phase 1: Trust-Bar am Originalplatz
                gsap.set(heroBottom, { opacity: 1, scale: 1, y: 0 });
                gsap.set('.hero__trust-number', { color: 'var(--text-primary)' });
                gsap.set('.hero__trust-label', { color: 'var(--text-tertiary)' });
            } else if (p < 0.7) {
                // Phase 2: Trust-Bar gleitet ins Zentrum
                const phase = (p - 0.3) / 0.4; // 0→1
                const moveY = trustMoveY * phase;
                const scaleBoost = 1 + phase * 0.18; // bis 1.18

                gsap.set(heroBottom, {
                    opacity: 1,
                    y: moveY,
                    scale: scaleBoost,
                    transformOrigin: 'center center',
                });
                // Zahlen werden Orange
                const orangeR = 255, orangeG = Math.round(255 - phase * 109), orangeB = Math.round(255 - phase * 223);
                gsap.set('.hero__trust-number', { color: `rgb(${orangeR}, ${orangeG}, ${orangeB})` });
                // Labels werden heller
                const labelV = Math.round(128 + phase * 64);
                gsap.set('.hero__trust-label', { color: `rgb(${labelV}, ${labelV}, ${labelV})` });
            } else {
                // Phase 3: Trust-Bar fade-out nach oben
                const fadePhase = (p - 0.7) / 0.3; // 0→1
                gsap.set(heroBottom, {
                    opacity: 1 - fadePhase,
                    y: trustMoveY - fadePhase * 50,
                    scale: 1.18 - fadePhase * 0.08,
                    transformOrigin: 'center center',
                });
                gsap.set('.hero__trust-number', { color: 'var(--orange)' });
            }
        },
        onLeaveBack: () => {
            gsap.set('.hero__content', { opacity: 1, y: 0 });
            gsap.set(heroBottom, { opacity: 1, scale: 1, y: 0 });
            gsap.set('.hero__trust-number', { color: 'var(--text-primary)' });
            gsap.set('.hero__trust-label', { color: 'var(--text-tertiary)' });
        }
    });
}

// ===== COUNTER ANIMATION (ST-4: scrub-bound) =====
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));

        if (prefersReducedMotion) {
            counter.innerText = target;
            return;
        }

        gsap.fromTo(counter,
            { innerText: 0 },
            {
                innerText: target,
                ease: 'none',
                snap: { innerText: 1 },
                scrollTrigger: {
                    trigger: counter,
                    start: 'top 90%',
                    end: 'top 50%',
                    scrub: true,
                }
            }
        );
    });
}
animateCounters();

// ===== SECTION REVEAL ANIMATIONS =====
// Helper: all scroll animations use fromTo for reliability with Lenis
function scrollReveal(targets, from, to, triggerEl, options = {}) {
    if (prefersReducedMotion) {
        gsap.set(targets, { opacity: 1, x: 0, y: 0, scale: 1 });
        return;
    }
    const defaults = { start: 'top 88%', once: true };
    const cfg = { ...defaults, ...options };
    gsap.fromTo(targets, from, {
        ...to,
        scrollTrigger: { trigger: triggerEl || targets, start: cfg.start, once: cfg.once }
    });
}

// Section titles — clipPath reveal
gsap.utils.toArray('.section__title').forEach(el => {
    if (prefersReducedMotion) {
        gsap.set(el, { opacity: 1 });
        return;
    }
    gsap.fromTo(el,
        { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
        {
            clipPath: 'inset(0 0% 0 0)', opacity: 1,
            duration: 0.8, ease: 'power3.out',
            scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        }
    );
});

// Section subtitles
gsap.utils.toArray('.section__subtitle').forEach(el => {
    scrollReveal(el, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: 'power3.out' }, el);
});

// Keynote cards — reveal + ST-3: Horizontal Scroll on desktop
if (!prefersReducedMotion && window.innerWidth >= 1024) {
    // Desktop: kein scrollReveal, Cards starten sichtbar, horizontaler Scroll IST die Animation
    gsap.set('.keynote-card', { opacity: 1, y: 0, scale: 1 });
    const keynoteGrid = document.querySelector('.keynotes__grid');
    if (keynoteGrid) {
        const getScrollAmount = () => keynoteGrid.scrollWidth - keynoteGrid.parentElement.clientWidth;
        gsap.to(keynoteGrid, {
            x: () => -getScrollAmount(),
            ease: 'none',
            scrollTrigger: {
                trigger: '.keynotes',
                start: 'top 20%',
                end: () => '+=' + getScrollAmount(),
                pin: true,
                scrub: 0.8,
                invalidateOnRefresh: true,
            }
        });
    }
} else {
    // Mobile: sanftere Entrance (y: 25 statt 50, kein scale)
    scrollReveal('.keynote-card',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
        '.keynotes__grid');
}

// About bio
scrollReveal('.about__bio p',
    { opacity: 0, y: 12 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
    '.about__bio');

// About image
scrollReveal('.about__image-frame',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
    '.about__grid');

// Timeline items + ST-2: Timeline progress scrub
if (!prefersReducedMotion) {
    const timelineProgress = document.querySelector('.timeline-progress');
    if (timelineProgress) {
        gsap.to(timelineProgress, {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
                trigger: '.about__timeline',
                start: 'top 80%',
                end: 'bottom 60%',
                scrub: 0.5,
            }
        });
    }
    gsap.utils.toArray('.timeline__item').forEach((item, i) => {
        gsap.fromTo(item,
            { opacity: 0, x: -15 },
            {
                opacity: 1, x: 0, duration: 0.5, ease: 'power3.out',
                scrollTrigger: {
                    trigger: item,
                    start: 'top 85%',
                    end: 'top 60%',
                    scrub: 0.5,
                }
            }
        );
    });
} else {
    gsap.set('.timeline__item', { opacity: 1, x: 0 });
    gsap.set('.timeline-progress', { scaleY: 1 });
}

// Counter cards — enhanced entrance animation
if (!prefersReducedMotion) {
    gsap.fromTo('.counter',
        { opacity: 0, y: 40, scale: 0.9 },
        {
            opacity: 1, y: 0, scale: 1,
            duration: 0.8,
            stagger: 0.12,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.about__counters',
                start: 'top 85%',
                once: true,
            }
        }
    );
} else {
    gsap.set('.counter', { opacity: 1, y: 0, scale: 1 });
}

// Role cards
scrollReveal('.role-card',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
    '.about__roles');

// Gallery items
scrollReveal('.keynotes__gallery-item',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' },
    '.keynotes__gallery');

// Testimonials
scrollReveal('.testimonial',
    { opacity: 0, y: 30 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' },
    '.testimonials__grid');

// Article cards
scrollReveal('.article-card',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
    '.articles__grid');

// Guest podcast cards
scrollReveal('.guest-podcast-card',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
    '.guest-podcasts__grid');

// Presskit
scrollReveal('.media__presskit',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
    '.media__presskit');

// Podcast section
scrollReveal('.podcast__visual',
    { opacity: 0, x: -30 },
    { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
    '.podcast__hero');

scrollReveal('.podcast__info',
    { opacity: 0, x: 30 },
    { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
    '.podcast__hero');

scrollReveal('.podcast__story-content',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
    '.podcast__story');

scrollReveal('.podcast__topic',
    { opacity: 0, x: 20 },
    { opacity: 1, x: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
    '.podcast__topics');

scrollReveal('.podcast__why',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
    '.podcast__why');

// Essay
scrollReveal('.essay__lead',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' },
    '.essay__lead');

scrollReveal('.essay__visual',
    { opacity: 0, x: 30 },
    { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
    '.essay__grid');

// ST-6: Essay Text-Highlight (scrub)
if (!prefersReducedMotion) {
    gsap.utils.toArray('.essay__text p').forEach(p => {
        gsap.fromTo(p,
            { opacity: 0.25, color: 'var(--text-secondary)' },
            {
                opacity: 1,
                color: 'var(--text-primary)',
                ease: 'none',
                scrollTrigger: {
                    trigger: p,
                    start: 'top 85%',
                    end: 'top 40%',
                    scrub: true,
                }
            }
        );
    });
} else {
    gsap.set('.essay__text p', { opacity: 1 });
}

// Contact form
scrollReveal('.contact__card',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
    '.contact__grid');

// ===== ARTICLES PROGRESSIVE DISCLOSURE =====
(function() {
    const showMoreBtn = document.getElementById('articlesShowMore');
    const grid = document.querySelector('.articles__grid');
    if (!showMoreBtn || !grid) return;

    showMoreBtn.addEventListener('click', function() {
        grid.classList.add('articles--expanded');
        const hiddenCards = grid.querySelectorAll('.articles__hidden');

        if (!prefersReducedMotion) {
            gsap.fromTo(hiddenCards,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power3.out' }
            );
        }

        showMoreBtn.parentElement.classList.add('hidden');
        ScrollTrigger.refresh();
    });
})();

// ===== VANILLA TILT (3D Cards) =====
// Deaktiviert — zu intensiv bei kleinen Cards, Bilder werden abgeschnitten

// ===== ST-5: QUOTES CROSSFADE (replaces Swiper) =====
(function() {
    const quotes = gsap.utils.toArray('.quote--stacked');
    if (quotes.length < 2) return;

    if (prefersReducedMotion || window.innerWidth < 768) {
        // Mobile/reduced-motion: show all stacked vertically (CSS handles positioning)
        quotes.forEach(q => gsap.set(q, { opacity: 1 }));
        return;
    }

    const container = document.getElementById('quotesContainer');
    if (!container) return;

    const tl = gsap.timeline({
        scrollTrigger: {
            trigger: container,
            start: 'top center',
            end: () => '+=' + (quotes.length * 300),
            pin: true,
            scrub: 0.5,
        }
    });

    quotes.forEach((quote, i) => {
        if (i > 0) {
            tl.to(quotes[i - 1], { opacity: 0, duration: 0.5 })
              .fromTo(quote, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '<');
        }
        if (i < quotes.length - 1) {
            tl.to({}, { duration: 0.5 }); // pause between quotes
        }
    });
})();

// ===== SCROLLTRIGGER REFRESH =====
// Refresh after DOM + images are fully loaded
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    gsap.delayedCall(0.5, () => ScrollTrigger.refresh());
});
gsap.delayedCall(2, () => ScrollTrigger.refresh());

// Debounced refresh on resize (handles pin recalculations)
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
});

// ===== SMOOTH SCROLL for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Kill active ScrollTrigger pins to get accurate position
            ScrollTrigger.refresh();
            lenis.scrollTo(target, { offset: -80, duration: prefersReducedMotion ? 0 : 1.2 });
        }
    });
});

// ===== HERO INTERACTIVE: Glitch, Spotlight, Bubbles, Verb Typewriter, Chat =====
(function() {
    var hero = document.getElementById('hero');
    var heroBg = document.getElementById('heroBg');
    var headline = document.getElementById('heroHeadline');
    var verbSpan = document.getElementById('heroVerb');
    var glitchCanvas = document.getElementById('heroGlitch');
    var spotlight = document.getElementById('heroSpotlight');
    var bubbles = document.querySelectorAll('.hero-bubble');
    var heroChat = document.getElementById('heroChat');
    var heroChatMessages = document.getElementById('heroChatMessages');
    var heroAskInput = document.getElementById('heroAskInput');
    var scanlines = document.getElementById('heroScanlines');

    if (!hero || !glitchCanvas || !spotlight) return;

    var glitchCtx = glitchCanvas.getContext('2d');
    var spotCtx = spotlight.getContext('2d');
    var bgImg = heroBg.querySelector('img');
    var bgReady = false;
    function markBgReady() { bgReady = bgImg.complete && bgImg.naturalWidth > 0; }
    markBgReady();
    if (!bgReady) { bgImg.addEventListener('load', function() { markBgReady(); resize(); }); }
    var mouseX = 0, mouseY = 0, glitchActive = false, scanlinesShown = false, glitchFrame;

    function resize() {
        var r = hero.getBoundingClientRect();
        glitchCanvas.width = spotlight.width = r.width;
        glitchCanvas.height = spotlight.height = r.height;
    }
    resize();
    window.addEventListener('resize', resize);

    // ── HEADLINE VERB TYPEWRITER ──
    var verbs = ['verstehen.', 'nutzen.', 'gestalten.'];
    var verbIdx = 0;
    function typeVerb() {
        var word = verbs[verbIdx % verbs.length]; verbIdx++;
        var i = 0; verbSpan.textContent = '';
        headline.classList.add('glitching');
        setTimeout(function() { headline.classList.remove('glitching'); }, 300);
        function typeChar() {
            if (i < word.length) { verbSpan.textContent += word.charAt(i); i++; setTimeout(typeChar, 70); }
            else { setTimeout(eraseVerb, 2500); }
        }
        function eraseVerb() {
            var txt = verbSpan.textContent;
            if (txt.length > 0) { verbSpan.textContent = txt.slice(0, -1); setTimeout(eraseVerb, 35); }
            else { setTimeout(typeVerb, 300); }
        }
        typeChar();
    }
    setTimeout(typeVerb, 800);

    // ── GLITCH (local, follows cursor) ──
    // Replicate CSS object-fit:cover + object-position:center 30% for canvas
    function coverDraw(ctx, img, cw, ch) {
        var iw = img.naturalWidth, ih = img.naturalHeight;
        var scale = Math.max(cw / iw, ch / ih);
        var sw = cw / scale, sh = ch / scale;
        var sx = (iw - sw) / 2;
        var sy = (ih - sh) * 0.3; // object-position: center 30%
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, cw, ch);
    }
    function drawGlitch(cx, cy) {
        if (!bgReady) return;
        var cw = glitchCanvas.width, ch = glitchCanvas.height;
        glitchCtx.clearRect(0, 0, cw, ch);
        try {
            coverDraw(glitchCtx, bgImg, cw, ch);
            var radius = 180;
            var x0 = Math.max(0, (cx - radius) | 0), y0 = Math.max(0, (cy - radius) | 0);
            var x1 = Math.min(cw, (cx + radius) | 0), y1 = Math.min(ch, (cy + radius) | 0);
            var w = x1 - x0, h = y1 - y0;
            if (w > 0 && h > 0) {
                var id = glitchCtx.getImageData(x0, y0, w, h), d = id.data;
                var off = ((Math.random() * 14 - 7) | 0) * 4;
                for (var i = 0; i < d.length; i += 4) { var j = i + off; if (j >= 0 && j < d.length) d[i] = d[j]; }
                for (var i = 0; i < d.length; i += 4) { d[i + 1] = Math.min(255, d[i + 1] + 12); d[i + 2] = Math.min(255, d[i + 2] + 18); }
                glitchCtx.putImageData(id, x0, y0);
                for (var s = 0; s < 4; s++) {
                    if (Math.random() > 0.3) {
                        var sy = cy + ((Math.random() * 100 - 50) | 0), sh = (Math.random() * 10 + 3) | 0, sx = (Math.random() * 16 - 8) | 0;
                        if (sy > 0 && sy + sh < ch) { var sl = glitchCtx.getImageData(0, sy, cw, sh); glitchCtx.putImageData(sl, sx, sy); }
                    }
                }
            }
            glitchCtx.globalCompositeOperation = 'destination-in';
            var g = glitchCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
            g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(0.5, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
            glitchCtx.fillStyle = g; glitchCtx.fillRect(0, 0, cw, ch);
            glitchCtx.globalCompositeOperation = 'source-over';
        } catch(e) {
            // Canvas tainted (file:// protocol) — skip pixel manipulation, just show overlay
            glitchCtx.clearRect(0, 0, cw, ch);
        }
    }
    function glitchLoop() {
        if (!glitchActive) { glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height); return; }
        drawGlitch(mouseX, mouseY);
        setTimeout(function() { glitchFrame = requestAnimationFrame(glitchLoop); }, 100);
    }

    // ── SPOTLIGHT ──
    function drawSpotlight(x, y) {
        spotCtx.clearRect(0, 0, spotlight.width, spotlight.height);
        var g = spotCtx.createRadialGradient(x, y, 0, x, y, 300);
        g.addColorStop(0, 'rgba(255,255,255,0.055)'); g.addColorStop(0.5, 'rgba(255,255,255,0.015)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        spotCtx.fillStyle = g; spotCtx.fillRect(0, 0, spotlight.width, spotlight.height);
    }

    // ── BUBBLE MAGNETISM ──
    function updateBubbles(cx, cy) {
        bubbles.forEach(function(b) {
            var r = b.getBoundingClientRect(), dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2), dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 260) { var f = (1 - dist / 260) * 12; b.classList.add('active'); b.style.transform = 'translate(' + (dx / dist * f) + 'px,' + (dy / dist * f) + 'px)'; }
            else { b.classList.remove('active'); b.style.transform = ''; }
        });
    }

    // ── MOUSE EVENTS ──
    hero.addEventListener('mouseenter', function() {
        glitchActive = true; glitchCanvas.classList.add('active'); glitchLoop();
        spotlight.classList.add('active');
        if (!scanlinesShown) { scanlinesShown = true; setTimeout(function() { scanlines.classList.add('visible'); }, 500); }
    });
    hero.addEventListener('mouseleave', function() {
        glitchActive = false; glitchCanvas.classList.remove('active');
        cancelAnimationFrame(glitchFrame);
        glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
        spotlight.classList.remove('active'); heroBg.style.transform = '';
        bubbles.forEach(function(b) { b.classList.remove('active'); b.style.transform = ''; });
    });
    hero.addEventListener('mousemove', function(e) {
        var r = hero.getBoundingClientRect();
        mouseX = e.clientX - r.left; mouseY = e.clientY - r.top;
        drawSpotlight(mouseX, mouseY);
        updateBubbles(e.clientX, e.clientY);
        heroBg.style.transform = 'translate(' + ((mouseX / r.width - 0.5) * -5) + 'px,' + ((mouseY / r.height - 0.5) * -3) + 'px) scale(1.02)';
    });

    // ── TYPEWRITER UTIL ──
    function twType(el, text, speed, cb) {
        var i = 0; el.textContent = ''; el.classList.add('typing');
        function t() {
            if (i < text.length) { el.textContent += text.charAt(i); i++;
                if (el.parentElement) el.parentElement.scrollTop = el.parentElement.scrollHeight;
                setTimeout(t, speed);
            } else { el.classList.remove('typing'); if (cb) cb(); }
        } t();
    }

    // ── MOBILE PLACEHOLDER ──
    function updatePlaceholder() {
        if (!heroAskInput) return;
        if (window.innerWidth <= 768) {
            heroAskInput.setAttribute('placeholder', 'Frag Chris AI etwas...');
        } else {
            heroAskInput.setAttribute('placeholder', 'Frag die digitale Version von Chris etwas...');
        }
    }
    updatePlaceholder();
    window.addEventListener('resize', updatePlaceholder);

    // ── CHAT INPUT ──
    function handleAsk() {
        var q = heroAskInput.value.trim(); if (!q) return;
        heroAskInput.value = '';
        openMiniChat(q, null);
    }
    document.getElementById('heroAskSend').addEventListener('click', handleAsk);
    heroAskInput.addEventListener('keydown', function(e) { if (e.key === 'Enter') handleAsk(); });

    // ── BUBBLE CLICK ──
    bubbles.forEach(function(bubble) {
        bubble.addEventListener('click', function(e) {
            e.stopPropagation();
            var tmp = document.createElement('div'); tmp.innerHTML = bubble.dataset.question;
            openMiniChat(tmp.textContent, bubble);
        });
    });

    // ── MINI-CHAT ──
    function openMiniChat(question, anchor) {
        var answer = findHeroAnswer(question);
        var hRect = hero.getBoundingClientRect();
        var isMobileChat = window.innerWidth <= 768;
        var cl, ct;
        if (isMobileChat) {
            // Mobile: zentriert, unterhalb vom Ask-Input
            var aR = document.getElementById('heroAsk').getBoundingClientRect();
            cl = 16;
            ct = aR.top - hRect.top + aR.height + 10;
            // Sicherstellen, dass der Chat nicht über den Hero-Bereich rausragt
            if (ct + 280 > hRect.height) ct = hRect.height - 300;
            if (ct < 60) ct = 60;
        } else if (anchor) {
            var bR = anchor.getBoundingClientRect();
            cl = bR.left - hRect.left + bR.width + 16; ct = bR.top - hRect.top;
            if (cl + 400 > hRect.width) cl = bR.left - hRect.left - 400;
            if (ct + 320 > hRect.height - 80) ct = hRect.height - 400;
            if (ct < 20) ct = 20;
        } else {
            var aR = document.getElementById('heroAsk').getBoundingClientRect();
            cl = aR.left - hRect.left; ct = aR.top - hRect.top + aR.height + 12;
            if (cl + 400 > hRect.width) cl = hRect.width - 420;
        }
        heroChat.style.left = cl + 'px'; heroChat.style.top = ct + 'px';
        heroChatMessages.innerHTML = '';
        var um = document.createElement('div');
        um.className = 'hero-chat__msg hero-chat__msg--user';
        um.textContent = question;
        heroChatMessages.appendChild(um);
        heroChat.style.display = 'flex'; heroChat.offsetHeight;
        heroChat.classList.add('active');
        var tp = document.createElement('div');
        tp.className = 'hero-chat__typing';
        tp.innerHTML = '<span></span><span></span><span></span>';
        heroChatMessages.appendChild(tp);
        setTimeout(function() {
            tp.remove();
            var bm = document.createElement('div');
            bm.className = 'hero-chat__msg hero-chat__msg--bot';
            heroChatMessages.appendChild(bm);
            twType(bm, answer, 10);
        }, 400);
    }

    function findHeroAnswer(q) {
        q = q.toLowerCase();
        if (q.includes('alt') || q.includes('alter') || q.includes('geburtstag') || q.includes('geboren')) return 'Alter ist nur eine Zahl. Seit 2016 im KI-Game, über 2000 Menschen ausgebildet, immer noch neugierig wie am ersten Tag. Das zählt mehr, oder?';
        if (q.includes('2016') || q.includes('seit wann') || q.includes('wer ist') || q.includes('chris')) return 'Ich bin die digitale Version von Chris Beyeler. KI-Experte, Keynote Speaker, CEO der BEYONDER AG, Präsident von swissAI. Digital Shaper 2026. Seit 2016 im KI-Game, 2000+ Menschen ausgebildet, 70+ Keynotes.';
        if (q.includes('swissai') || q.includes('verband')) return 'swissAI ist der Schweizer KI-Verband, den ich 2023 gegründet habe. Rund 300 Mitglieder, gemeinnützig. Mission: Wissen, Dialog und verantwortungsvolle Innovation. Mehr auf swissai.ch';
        if (q.includes('beyonder') || q.includes('firma')) return 'BEYONDER ist mein KI-Kompetenzzentrum in Gebenstorf. Schulungen, Beratung, Keynotes. Kunden wie SUVA, Rotes Kreuz, BKW, Mobiliar. 4.9/5 auf Google mit 108 Reviews.';
        if (q.includes('teilnehmer') || q.includes('review') || q.includes('sagen')) return '4.9/5 Sterne, 108 Google Reviews. "Hat meine Erwartungen übertroffen" (Daniel Keller). "Bringt Inspiration auf die Bühne" (Romi Hofer). Das freut mich jedes Mal.';
        if (q.includes('keynote') || q.includes('vortrag') || q.includes('themen')) return 'Ich hab vier Keynotes: "The State of AI", "AI in Marketing", "5 Erfolgsfaktoren KI in KMU" und "Wie KI die Arbeit beeinflusst". 30-90 Min, alles anpassbar. Schreib mir: chris@beyonder.ch';
        if (q.includes('preis') || q.includes('kosten') || q.includes('budget')) return 'Preise nenne ich hier nicht. Schreib mir direkt an chris@beyonder.ch für ein individuelles Angebot.';
        return 'Ich bin die digitale Version von Chris Beyeler und kann dir Infos geben zu Keynotes, BEYONDER, swissAI oder KI-Workshops. Was interessiert dich?';
    }

    // ── CLOSE MINI-CHAT ──
    document.getElementById('heroChatClose').addEventListener('click', function(e) {
        e.stopPropagation(); heroChat.classList.remove('active');
        setTimeout(function() { heroChat.style.display = 'none'; }, 300);
    });
    document.getElementById('heroChatExpand').addEventListener('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        heroChat.classList.remove('active');
        setTimeout(function() {
            heroChat.style.display = 'none';
            var chatWindow = document.getElementById('chatbotWindow');
            if (chatWindow) chatWindow.classList.add('active');
            var chatInput = document.getElementById('chatbotInput');
            if (chatInput) chatInput.focus();
        }, 350);
    });
    document.addEventListener('click', function(e) {
        if (heroChat.classList.contains('active') && !e.target.closest('.hero-chat') && !e.target.closest('.hero-bubble') && !e.target.closest('.hero-ask')) {
            heroChat.classList.remove('active');
            setTimeout(function() { heroChat.style.display = 'none'; }, 300);
        }
    });

    // ── INVITE BLINK ──
    setTimeout(function() {
        var b = document.getElementById('bubble1');
        if (b && !b.classList.contains('active')) {
            b.classList.add('hero-bubble--invite');
            setTimeout(function() { b.classList.remove('hero-bubble--invite'); }, 6000);
        }
    }, 3000);
})();
