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
scrollReveal('.contact__form',
    { opacity: 0, y: 25 },
    { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
    '.contact__form');

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
