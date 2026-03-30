/* ===================================================================
   CHRIS BEYELER — Main JavaScript
   GSAP Animations, Particles, Counter, Navigation, Smooth Scroll
   =================================================================== */

// ===== LENIS SMOOTH SCROLL =====
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smooth: true,
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
    }, '-=0.2')
    .to('.hero__trust', {
        opacity: 1, duration: 0.5, ease: 'power2.out'
    }, '-=0.2');

// ===== COUNTER ANIMATION =====
function animateCounters() {
    const counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        const duration = target > 100 ? 2.5 : 1.5;

        gsap.fromTo(counter,
            { innerText: 0 },
            {
                innerText: target,
                duration: duration,
                ease: 'power2.out',
                snap: { innerText: 1 },
                scrollTrigger: {
                    trigger: counter,
                    start: 'top 85%',
                    once: true
                }
            }
        );
    });
}
animateCounters();

// ===== SECTION REVEAL ANIMATIONS =====
// Helper: all scroll animations use fromTo for reliability with Lenis
function scrollReveal(targets, from, to, triggerEl, options = {}) {
    const defaults = { start: 'top 88%', once: true };
    const cfg = { ...defaults, ...options };
    gsap.fromTo(targets, from, {
        ...to,
        scrollTrigger: { trigger: triggerEl || targets, start: cfg.start, once: cfg.once }
    });
}

// Section titles
gsap.utils.toArray('.section__title').forEach(el => {
    scrollReveal(el, { opacity: 0, y: 25 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, el);
});

// Section subtitles
gsap.utils.toArray('.section__subtitle').forEach(el => {
    scrollReveal(el, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.6, delay: 0.1, ease: 'power3.out' }, el);
});

// Keynote cards
scrollReveal('.keynote-card',
    { opacity: 0, y: 50, scale: 0.96 },
    { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
    '.keynotes__grid');

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

// Timeline items
scrollReveal('.timeline__item',
    { opacity: 0, x: -15 },
    { opacity: 1, x: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
    '.about__timeline');

// Counter cards
scrollReveal('.counter',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
    '.about__counters');

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
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power3.out' },
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
    { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
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

scrollReveal('.essay__text p',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
    '.essay__text');

scrollReveal('.essay__visual',
    { opacity: 0, x: 30 },
    { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' },
    '.essay__grid');

// Contact form
scrollReveal('.contact__card',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
    '.contact__grid');

// ===== VANILLA TILT (3D Cards) =====
if (window.innerWidth > 768) {
    VanillaTilt.init(document.querySelectorAll('[data-tilt]'), {
        max: 5,
        speed: 400,
        glare: true,
        'max-glare': 0.08,
        perspective: 1200,
    });
}

// ===== SWIPER (Quotes Carousel) =====
const quotesSwiper = new Swiper('.media__quotes', {
    loop: true,
    autoplay: {
        delay: 6000,
        disableOnInteraction: false,
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
    speed: 900,
    effect: 'fade',
    fadeEffect: {
        crossFade: true
    }
});

// ===== SCROLLTRIGGER REFRESH =====
// Refresh after DOM + images are fully loaded
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    // Extra refresh after lazy images might have changed layout
    gsap.delayedCall(0.5, () => ScrollTrigger.refresh());
});
// Fallback: refresh after 2s in case load event fires too early
gsap.delayedCall(2, () => ScrollTrigger.refresh());

// ===== SMOOTH SCROLL for anchor links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            lenis.scrollTo(target, { offset: -80 });
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
    function drawGlitch(cx, cy) {
        glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
        glitchCtx.drawImage(bgImg, 0, 0, glitchCanvas.width, glitchCanvas.height);
        var radius = 180;
        var x0 = Math.max(0, (cx - radius) | 0), y0 = Math.max(0, (cy - radius) | 0);
        var x1 = Math.min(glitchCanvas.width, (cx + radius) | 0), y1 = Math.min(glitchCanvas.height, (cy + radius) | 0);
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
                    if (sy > 0 && sy + sh < glitchCanvas.height) { var sl = glitchCtx.getImageData(0, sy, glitchCanvas.width, sh); glitchCtx.putImageData(sl, sx, sy); }
                }
            }
        }
        glitchCtx.globalCompositeOperation = 'destination-in';
        var g = glitchCtx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        g.addColorStop(0, 'rgba(0,0,0,0.6)'); g.addColorStop(0.5, 'rgba(0,0,0,0.25)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        glitchCtx.fillStyle = g; glitchCtx.fillRect(0, 0, glitchCanvas.width, glitchCanvas.height);
        glitchCtx.globalCompositeOperation = 'source-over';
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
        if (q.includes('2016') || q.includes('seit wann') || q.includes('wer ist') || q.includes('chris')) return 'Chris Beyeler ist KI-Experte, Keynote Speaker, Gründer & CEO der BEYONDER AG und Präsident von swissAI. Digital Shaper 2026. Seit 2016 aktiv, 2000+ Menschen ausgebildet, 70+ Keynotes.';
        if (q.includes('swissai') || q.includes('verband')) return 'swissAI ist der Schweizer Verband für Künstliche Intelligenz mit ~300 Mitgliedern. Chris Beyeler ist Präsident. Gegründet 2023. Mission: Wissen, Dialog und verantwortungsvolle Innovation.';
        if (q.includes('beyonder') || q.includes('firma')) return 'BEYONDER AG ist das Schweizer KI-Kompetenzzentrum in Gebenstorf. Schulungen, Beratung, Keynotes. Kunden: SUVA, Rotes Kreuz, BKW, Mobiliar. 4.9/5 Google (108 Reviews).';
        if (q.includes('teilnehmer') || q.includes('review') || q.includes('sagen')) return '4.9/5 Sternen (108 Reviews). "Hat meine Erwartungen übertroffen" – Daniel Keller. "Bringt Inspiration auf die Bühne" – Romi Hofer.';
        if (q.includes('keynote') || q.includes('vortrag') || q.includes('themen')) return '4 Keynotes: "The State of AI", "AI in Marketing", "5 Erfolgsfaktoren KI in KMU", "Wie KI die Arbeit beeinflusst". 30-90 Min, individuell anpassbar.';
        return 'Ich kann dir Infos geben zu Chris Beyeler, Keynotes, BEYONDER, swissAI oder KI-Workshops. Was möchtest du wissen?';
    }

    // ── CLOSE MINI-CHAT ──
    document.getElementById('heroChatClose').addEventListener('click', function(e) {
        e.stopPropagation(); heroChat.classList.remove('active');
        setTimeout(function() { heroChat.style.display = 'none'; }, 300);
    });
    document.getElementById('heroChatExpand').addEventListener('click', function(e) {
        e.preventDefault(); heroChat.classList.remove('active');
        setTimeout(function() { heroChat.style.display = 'none'; }, 300);
        var t = document.getElementById('chatbotTrigger'); if (t) t.click();
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
