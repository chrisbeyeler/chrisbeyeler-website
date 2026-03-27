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

function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

// Sync Lenis with GSAP ScrollTrigger
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ===== PARTICLES.JS — subtle, premium =====
if (document.getElementById('particles-js')) {
    const isMobile = window.innerWidth < 768;
    particlesJS('particles-js', {
        particles: {
            number: { value: isMobile ? 20 : 40, density: { enable: true, value_area: 1200 } },
            color: { value: ['#FF9220', '#46BFED'] },
            shape: { type: 'circle' },
            opacity: {
                value: 0.15,
                random: true,
                anim: { enable: true, speed: 0.3, opacity_min: 0.05 }
            },
            size: {
                value: 2,
                random: true,
                anim: { enable: false }
            },
            line_linked: {
                enable: true,
                distance: 180,
                color: '#46BFED',
                opacity: 0.06,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.5,
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
                grab: { distance: 120, line_linked: { opacity: 0.15 } }
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

// ===== HERO ANIMATIONS =====
const heroTl = gsap.timeline({ delay: 0.2 });

heroTl
    .to('.hero__badge', {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power3.out'
    })
    .to('.hero__title-line', {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.12,
        ease: 'power4.out'
    }, '-=0.3')
    .to('.hero__subtitle', {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
    }, '-=0.4')
    .to('.hero__trust', {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
    }, '-=0.3')
    .to('.hero__ctas', {
        opacity: 1,
        duration: 0.6,
        ease: 'power2.out'
    }, '-=0.2')
    .to('.hero__scroll', {
        opacity: 1,
        duration: 0.5,
        ease: 'power2.out'
    }, '-=0.1');

// Hero image: fade in with slight scale
gsap.fromTo('.hero__image img', {
    opacity: 0,
    scale: 0.95,
    y: 30
}, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 1.2,
    delay: 0.4,
    ease: 'power3.out'
});

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
gsap.utils.toArray('.section__title').forEach(title => {
    gsap.from(title, {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: title,
            start: 'top 85%',
            once: true
        }
    });
});

gsap.utils.toArray('.section__subtitle').forEach(sub => {
    gsap.from(sub, {
        opacity: 0,
        y: 20,
        duration: 0.6,
        delay: 0.1,
        ease: 'power3.out',
        scrollTrigger: {
            trigger: sub,
            start: 'top 85%',
            once: true
        }
    });
});

// Keynote cards
gsap.from('.keynote-card', {
    opacity: 0,
    y: 40,
    duration: 0.7,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.keynotes__grid',
        start: 'top 80%',
        once: true
    }
});

// Counter cards
gsap.from('.counter', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.about__counters',
        start: 'top 85%',
        once: true
    }
});

// Role cards
gsap.from('.role-card', {
    opacity: 0,
    y: 20,
    duration: 0.5,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.about__roles',
        start: 'top 85%',
        once: true
    }
});

// Timeline items
gsap.from('.timeline__item', {
    opacity: 0,
    x: -20,
    duration: 0.5,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.about__timeline',
        start: 'top 80%',
        once: true
    }
});

// Gallery items
gsap.from('.keynotes__gallery-item', {
    opacity: 0,
    y: 30,
    duration: 0.7,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.keynotes__gallery',
        start: 'top 80%',
        once: true
    }
});

// Testimonials
gsap.from('.testimonial', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.1,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.testimonials__grid',
        start: 'top 85%',
        once: true
    }
});

// About bio
gsap.from('.about__bio p', {
    opacity: 0,
    y: 15,
    duration: 0.5,
    stagger: 0.08,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.about__bio',
        start: 'top 80%',
        once: true
    }
});

// Presskit
gsap.from('.media__presskit', {
    opacity: 0,
    y: 30,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.media__presskit',
        start: 'top 85%',
        once: true
    }
});

// Contact form
gsap.from('.contact__form', {
    opacity: 0,
    y: 30,
    duration: 0.7,
    ease: 'power3.out',
    scrollTrigger: {
        trigger: '.contact__form',
        start: 'top 85%',
        once: true
    }
});

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
