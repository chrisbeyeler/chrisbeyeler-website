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
// Mobile URL-Bar-Resizes (nur Höhe) dürfen keinen Refresh mitten im Pin auslösen
ScrollTrigger.config({ ignoreMobileResize: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// ===== PARTICLES.JS — non-critical decoration, loaded after first render =====
function initHeroParticles() {
    if (!document.getElementById('particles-js') || typeof particlesJS !== 'function') return;
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

function loadHeroParticles() {
    if (prefersReducedMotion || window.innerWidth < 768 || !document.getElementById('particles-js')) return;
    const script = document.createElement('script');
    script.src = 'vendor/particles.min.js';
    script.async = true;
    script.onload = initHeroParticles;
    document.head.appendChild(script);
}

window.addEventListener('load', () => {
    if ('requestIdleCallback' in window) {
        window.requestIdleCallback(loadHeroParticles, { timeout: 2500 });
    } else {
        window.setTimeout(loadHeroParticles, 1200);
    }
}, { once: true });

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
        navToggle.setAttribute('aria-expanded', String(navLinks.classList.contains('active')));
    });
}

navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    });
});

// ===== HERO FIRST PAINT =====
// Above-the-fold copy stays visible immediately. Delaying it behind a GSAP
// intro makes the perceived load slower and can postpone the LCP candidate.
gsap.set(['.hero__stage-label', '.hero__stage-headline', '.hero__stage-sub', '.hero__ctas'], { opacity: 1, y: 0 });

// ===== Hero → Keynotes =====
// Kein Pin mehr: Der Hero scrollt normal weg, die Keynotes-Section folgt direkt.
// Das vermeidet den leeren Header beim Zurückscrollen und das Springen beim
// Section-Wechsel, das die frühere gepinnte Trust-Bar-Animation verursacht hat.
// Die Trust-Zahlen zählen über die Counter-Animation (ST-4) hoch, die Bubbles
// bleiben in ihrem CSS-Zustand (opacity 0.55, Hover intakt).

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
        // Inline-Transforms nach dem Reveal entfernen, damit CSS-Hover (scale) wieder greift
        clearProps: 'opacity,transform',
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

// ===== KEYNOTES: gepinnte 100svh-Bühne mit horizontalem Scrub (Desktop) =====
// Der frühere Pin (a78d403) pinnte die ganze Section mit start 'top 20%' und
// verursachte Leerraum/Springen. Jetzt wird nur der eigene 100svh-Wrapper
// .keynotes__pin mit start 'top top' gepinnt; der Rest der Section fliesst normal.
// gsap.matchMedia() räumt bei Resize/Breakpoint-Wechsel selbst auf.
(function() {
    const pinEl = document.querySelector('.keynotes__pin');
    const viewportEl = document.querySelector('.keynotes__carousel');
    const grid = document.querySelector('.keynotes__grid');
    const prev = document.getElementById('keynotesNavPrev');
    const next = document.getElementById('keynotesNavNext');
    const progressFill = document.querySelector('.keynotes__progress-fill');
    if (!pinEl || !grid || !viewportEl) return;

    const getScrollAmount = () => Math.max(0, grid.scrollWidth - viewportEl.clientWidth);
    const mm = gsap.matchMedia();
    const keynotesSection = document.querySelector('.keynotes');

    // Ohne Reduced Motion: Pin + horizontaler Scrub auf ALLEN Breiten
    mm.add('(prefers-reduced-motion: no-preference)', () => {
        keynotesSection.classList.add('kn-pin');
        if (prev) prev.hidden = true;
        if (next) next.hidden = true;
        gsap.set('.keynote-card', { opacity: 1, y: 0 });

        const tween = gsap.to(grid, {
            x: () => -getScrollAmount(),
            ease: 'none',
            scrollTrigger: {
                trigger: pinEl,
                start: 'top top',
                end: () => '+=' + getScrollAmount(),
                pin: true,
                pinSpacing: true,
                // scrub true: Lenis ist das einzige Smoothing. Ein Lag-Wert (0.8)
                // liess den Track beim Pin-Austritt sichtbar nachtweenen (Sprung).
                // anticipatePin ist mit Lenis kontraproduktiv (synthetischer Scroll
                // ohne den Lag, den es kompensieren soll) und verursachte den
                // Versatz beim Einrasten.
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    if (progressFill) progressFill.style.transform = 'scaleX(' + self.progress + ')';
                },
            }
        });
        const st = tween.scrollTrigger;

        // Konfigurator: Karte anfahren, indem der Seiten-Scroll auf den
        // passenden Pin-Progress gefahren wird
        window.keynoteScrollToCard = function(card) {
            const amount = getScrollAmount();
            if (!amount) return;
            const targetX = Math.max(0, Math.min(amount,
                card.offsetLeft - (viewportEl.clientWidth - card.offsetWidth) / 2));
            const y = st.start + (targetX / amount) * (st.end - st.start);
            lenis.scrollTo(y, { duration: 1 });
        };

        return () => {
            keynotesSection.classList.remove('kn-pin');
            window.keynoteScrollToCard = undefined;
        };
    });

    // Desktop mit Reduced Motion: natives Karussell (CSS-Fallback-Query aktiv)
    mm.add('(min-width: 1024px) and (prefers-reduced-motion: reduce)', () => {
        if (!prev || !next) return;

        function stepWidth() {
            const card = grid.querySelector('.keynote-card');
            return card ? card.getBoundingClientRect().width + 24 : 320;
        }
        function updateButtons() {
            const max = grid.scrollWidth - grid.clientWidth;
            prev.hidden = next.hidden = max <= 10;
            prev.disabled = grid.scrollLeft <= 2;
            next.disabled = grid.scrollLeft >= max - 2;
        }
        function scrollStep(dir) {
            grid.scrollLeft = Math.max(0, Math.min(grid.scrollWidth - grid.clientWidth,
                grid.scrollLeft + dir * stepWidth() * 2));
        }
        const onPrev = () => scrollStep(-1);
        const onNext = () => scrollStep(1);
        prev.addEventListener('click', onPrev);
        next.addEventListener('click', onNext);
        grid.addEventListener('scroll', updateButtons, { passive: true });
        updateButtons();

        window.keynoteScrollToCard = function(card) {
            grid.scrollLeft = card.offsetLeft - (grid.clientWidth - card.getBoundingClientRect().width) / 2;
        };

        return () => {
            prev.removeEventListener('click', onPrev);
            next.removeEventListener('click', onNext);
            grid.removeEventListener('scroll', updateButtons);
            prev.hidden = next.hidden = true;
            window.keynoteScrollToCard = undefined;
        };
    });

    // Mobile/Tablet mit Reduced Motion: gestapelte Karten, sofort sichtbar
    mm.add('(max-width: 1023px) and (prefers-reduced-motion: reduce)', () => {
        if (prev) prev.hidden = true;
        if (next) next.hidden = true;
        gsap.set('.keynote-card', { opacity: 1, y: 0 });
    });
})();

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

// ===== CINEMATIC TRAILER CONTROLLER =====
(function () {
    const stages = Array.from(document.querySelectorAll('.trailer-stage'));
    if (!stages.length) return;
    const instances = [];
    const saveData = navigator.connection && navigator.connection.saveData;
    const manualOnly = prefersReducedMotion || saveData || matchMedia('(max-width: 600px)').matches;

    function syncBodyState() {
        document.body.classList.toggle('trailer-active', document.querySelector('.trailer-stage.is-active') !== null);
    }

    function closeOtherStages(activeStage) {
        instances.forEach(function (instance) {
            if (instance.stage !== activeStage) instance.close(true);
        });
    }

    function initStage(stage) {
        const media = stage.querySelector('.trailer-stage__media');
        const startButton = stage.querySelector('.trailer-stage__start');
        const soundButton = stage.querySelector('[data-trailer-action="sound"]');
        const playButton = stage.querySelector('[data-trailer-action="play"]');
        const endCard = stage.querySelector('.trailer-stage__end');
        const triggers = Array.from(document.querySelectorAll('[data-trailer-target="' + stage.id + '"]'));
        const config = {
            provider: (stage.dataset.provider || 'file').toLowerCase(),
            source: stage.dataset.source || '',
            mobileSource: stage.dataset.mobileSource || '',
            poster: stage.dataset.poster || '',
            duration: Number(stage.dataset.duration) || 0
        };
        let state = 'idle';
        let player = null;
        let started = false;
        let muted = true;
        let progressTimer = null;
        let fallbackStartedAt = 0;
        let fallbackElapsed = 0;
        let lastFocus = null;
        const milestones = new Set();

        function emit(name, detail) {
            const payload = Object.assign({ provider: config.provider, state: state, stageId: stage.id }, detail || {});
            stage.dispatchEvent(new CustomEvent('trailer_' + name, { bubbles: true, detail: payload }));
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push(Object.assign({ event: 'trailer_' + name }, payload));
        }

        function setState(next) {
            state = next;
            stage.dataset.state = next;
            const active = ['playing-muted', 'playing-sound', 'paused'].includes(next);
            stage.classList.toggle('is-active', active);
            stage.classList.toggle('is-ended', next === 'ended');
            stage.classList.toggle('is-closed', next === 'idle' && started);
            stage.classList.toggle('is-entering', next === 'entering');
            syncBodyState();
            endCard.setAttribute('aria-hidden', next === 'ended' ? 'false' : 'true');
            startButton.disabled = active || next === 'ended';
            stage.querySelectorAll('.trailer-stage__controls button').forEach(function (button) { button.disabled = !active; });
            playButton.textContent = next === 'paused' ? 'Play' : 'Pause';
            playButton.setAttribute('aria-label', next === 'paused' ? 'Trailer fortsetzen' : 'Trailer pausieren');
            soundButton.textContent = muted ? 'Ton einschalten' : 'Ton ausschalten';
            soundButton.setAttribute('aria-label', muted ? 'Ton einschalten' : 'Ton ausschalten');
        }

        function post(command, value) {
            if (!player || !player.contentWindow) return;
            if (config.provider === 'youtube') {
                player.contentWindow.postMessage(JSON.stringify({ event: 'command', func: command, args: value === undefined ? [] : [value] }), '*');
            } else if (config.provider === 'vimeo') {
                player.contentWindow.postMessage({ method: command, value: value }, '*');
            }
        }

        function resolveSource() {
            return window.innerWidth <= 600 && config.mobileSource ? config.mobileSource : config.source;
        }

        function createPlayer(withSound) {
            if (player) return;
            const source = resolveSource();
            if (!source) return;
            if (config.provider === 'youtube' || config.provider === 'vimeo') {
                const iframe = document.createElement('iframe');
                const origin = encodeURIComponent(location.origin);
                iframe.src = config.provider === 'youtube'
                    ? 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(source) + '?autoplay=1&playsinline=1&rel=0&controls=0&enablejsapi=1&origin=' + origin + (withSound ? '' : '&mute=1')
                    : 'https://player.vimeo.com/video/' + encodeURIComponent(source) + '?autoplay=1&playsinline=1&controls=0&dnt=1&muted=' + (withSound ? '0' : '1');
                iframe.title = stage.getAttribute('aria-label') || 'Trailer';
                iframe.allow = 'autoplay; encrypted-media; fullscreen; picture-in-picture';
                iframe.allowFullscreen = true;
                media.appendChild(iframe);
                player = iframe;
                iframe.addEventListener('load', function () {
                    if (config.provider === 'youtube') iframe.contentWindow.postMessage(JSON.stringify({ event: 'listening', id: stage.id + '-player' }), '*');
                    if (config.provider === 'vimeo') post('addEventListener', 'ended');
                });
            } else {
                const video = document.createElement('video');
                video.preload = 'metadata';
                video.playsInline = true;
                video.poster = config.poster;
                video.muted = !withSound;
                const sources = source.split(',').map(function (item) { return item.trim(); }).filter(Boolean);
                sources.forEach(function (src) {
                    const el = document.createElement('source');
                    el.src = src;
                    if (/\.webm(?:$|\?)/i.test(src)) el.type = 'video/webm';
                    if (/\.mp4(?:$|\?)/i.test(src)) el.type = 'video/mp4';
                    video.appendChild(el);
                });
                video.addEventListener('timeupdate', function () { trackProgress(video.currentTime, video.duration); });
                video.addEventListener('ended', finish);
                media.appendChild(video);
                player = video;
                video.play().catch(function () { pause(); });
            }
        }

        function restartPlayerPosition() {
            if (!player) return;
            if (player.tagName === 'VIDEO') {
                player.currentTime = 0;
            } else if (config.provider === 'youtube') {
                post('seekTo', 0);
            } else if (config.provider === 'vimeo') {
                post('setCurrentTime', 0);
            }
        }

        function start(withSound) {
            lastFocus = document.activeElement;
            closeOtherStages(stage);
            muted = !withSound;
            if (!player) createPlayer(withSound);
            else if (player.tagName === 'VIDEO') {
                if (state === 'ended') {
                    restartPlayerPosition();
                    fallbackElapsed = 0;
                    milestones.clear();
                }
                player.muted = muted;
                player.play();
            } else {
                if (state === 'ended') restartPlayerPosition();
                post(config.provider === 'youtube' ? (muted ? 'mute' : 'unMute') : 'setMuted', muted);
                post(config.provider === 'youtube' ? 'playVideo' : 'play');
            }
            if (!started) {
                started = true;
                emit('start', { muted: muted });
            }
            setState(muted ? 'playing-muted' : 'playing-sound');
            fallbackStartedAt = performance.now();
            clearInterval(progressTimer);
            progressTimer = setInterval(function () {
                if (config.duration && state.indexOf('playing') === 0) {
                    trackProgress(fallbackElapsed + (performance.now() - fallbackStartedAt) / 1000, config.duration);
                }
            }, 1000);
        }

        function pause() {
            if (!player || state.indexOf('playing') !== 0) return;
            if (player.tagName === 'VIDEO') player.pause();
            else post(config.provider === 'youtube' ? 'pauseVideo' : 'pause');
            fallbackElapsed += (performance.now() - fallbackStartedAt) / 1000;
            clearInterval(progressTimer);
            setState('paused');
        }

        function toggleSound() {
            muted = !muted;
            if (player && player.tagName === 'VIDEO') player.muted = muted;
            else if (player) post(config.provider === 'youtube' ? (muted ? 'mute' : 'unMute') : 'setMuted', muted);
            setState(muted ? 'playing-muted' : 'playing-sound');
            if (!muted) emit('sound_on');
        }

        function trackProgress(current, duration) {
            if (!duration || !isFinite(duration)) return;
            const percent = Math.min(100, current / duration * 100);
            [25, 50, 75, 100].forEach(function (mark) {
                if (percent >= mark && !milestones.has(mark)) {
                    milestones.add(mark);
                    emit(String(mark), { percent: mark });
                }
            });
            if (percent >= 99.5) finish();
        }

        function finish() {
            if (state === 'ended') return;
            clearInterval(progressTimer);
            if (!milestones.has(100)) {
                milestones.add(100);
                emit('100', { percent: 100 });
            }
            setState('ended');
            const replayButton = stage.querySelector('[data-trailer-action="replay"]');
            if (replayButton) replayButton.focus();
        }

        function close(silent) {
            pause();
            setState('idle');
            if (!silent && lastFocus && lastFocus.focus) lastFocus.focus();
        }

        startButton.addEventListener('click', function () { start(true); });
        triggers.forEach(function (trigger) {
            trigger.addEventListener('click', function (event) {
                event.preventDefault();
                start(true);
                stage.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' });
            });
        });
        stage.addEventListener('click', function (event) {
            const action = event.target.closest('[data-trailer-action]');
            if (!action) return;
            if (action.dataset.trailerAction === 'sound') toggleSound();
            if (action.dataset.trailerAction === 'play') state === 'paused' ? start(!muted) : pause();
            if (action.dataset.trailerAction === 'close') close();
            if (action.dataset.trailerAction === 'replay') {
                milestones.clear();
                fallbackElapsed = 0;
                restartPlayerPosition();
                start(!muted);
            }
            if (action.dataset.trailerAction === 'fullscreen') {
                const target = player || stage.querySelector('.trailer-stage__frame');
                const request = target.requestFullscreen || target.webkitRequestFullscreen;
                if (request) {
                    request.call(target);
                    emit('fullscreen');
                }
            }
        });
        stage.querySelectorAll('[data-trailer-end-link]').forEach(function (link) {
            link.addEventListener('click', function () {
                emit('end_click', { target: link.dataset.trailerEndLink });
                close();
            });
        });
        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && state !== 'idle') close();
        });
        window.addEventListener('message', function (event) {
            if (player && event.source && event.source !== player.contentWindow) return;
            let data = event.data;
            try {
                if (typeof data === 'string') data = JSON.parse(data);
            } catch (ignore) {
                return;
            }
            if (!data) return;
            if (data.event === 'infoDelivery' && data.info) trackProgress(data.info.currentTime, data.info.duration || config.duration);
            if (data.event === 'onStateChange' && data.info === 0) finish();
            if (data.event === 'ended') finish();
            if (data.event === 'timeupdate' && data.data) trackProgress(data.data.seconds, data.data.duration);
        });

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver(function (entries) {
                const entry = entries[0];
                if (entry.intersectionRatio >= .25 && !stage.dataset.impressed) {
                    stage.dataset.impressed = 'true';
                    stage.classList.add('is-entering');
                    setState('entering');
                    emit('impression');
                }
                if (entry.intersectionRatio >= .6 && !started && !manualOnly) {
                    start(false);
                    observer.disconnect();
                }
            }, { threshold: [0, .25, .6, 1] });
            observer.observe(stage);
        }

        setState('idle');
        return {
            stage: stage,
            close: close
        };
    }

    stages.forEach(function (stage) {
        instances.push(initStage(stage));
    });
})();

// ===== ABOUT SCROLL STORYTELLING =====
if (!prefersReducedMotion) {
    var aboutSection = document.querySelector('.about');
    var timelineItems = document.querySelectorAll('.timeline__item');
    if (aboutSection && timelineItems.length) {
        // Riesige Jahreszahl im Hintergrund, crossfadet mit dem aktiven Timeline-Jahr
        var yearGhost = document.createElement('span');
        yearGhost.className = 'about__year-ghost';
        yearGhost.setAttribute('aria-hidden', 'true');
        (document.querySelector('.about__timeline') || aboutSection).appendChild(yearGhost);
        var setYearGhost = function(item) {
            var yearEl = item && item.querySelector('.timeline__year');
            if (!yearEl) { yearGhost.classList.remove('visible'); return; }
            yearGhost.textContent = yearEl.textContent;
            yearGhost.classList.add('visible');
        };

        var yearColors = [
            { start: 'rgba(16, 30, 53, 0.4)', end: 'rgba(16, 30, 53, 0.2)', glow: 'rgba(70, 130, 200, 0.4)' },  // 2016 deep blue
            { start: 'rgba(16, 30, 53, 0.3)', end: 'rgba(30, 50, 80, 0.2)', glow: 'rgba(70, 150, 220, 0.4)' },  // 2017
            { start: 'rgba(30, 50, 80, 0.3)', end: 'rgba(50, 80, 120, 0.2)', glow: 'rgba(70, 191, 237, 0.4)' },  // 2019 sky
            { start: 'rgba(50, 80, 120, 0.2)', end: 'rgba(80, 100, 140, 0.15)', glow: 'rgba(51, 208, 153, 0.4)' }, // 2023 aqua
            { start: 'rgba(80, 100, 140, 0.15)', end: 'rgba(120, 100, 60, 0.15)', glow: 'rgba(252, 192, 1, 0.4)' }, // 2025 gold
            { start: 'rgba(120, 100, 60, 0.15)', end: 'rgba(255, 146, 32, 0.1)', glow: 'rgba(255, 146, 32, 0.5)' }  // 2026 orange
        ];

        timelineItems.forEach(function(item, i) {
            var color = yearColors[i] || yearColors[yearColors.length - 1];
            ScrollTrigger.create({
                trigger: item,
                start: 'top 70%',
                end: 'bottom 40%',
                onEnter: function() {
                    aboutSection.style.setProperty('--about-grad-start', color.start);
                    aboutSection.style.setProperty('--about-grad-end', color.end);
                    aboutSection.style.setProperty('--about-grad-opacity', '1');
                    item.classList.add('timeline-glow');
                    item.style.setProperty('--timeline-glow-color', color.glow);
                    setYearGhost(item);
                },
                onLeaveBack: function() {
                    item.classList.remove('timeline-glow');
                    if (i === 0) {
                        aboutSection.style.setProperty('--about-grad-opacity', '0');
                        setYearGhost(null);
                    } else {
                        setYearGhost(timelineItems[i - 1]);
                    }
                }
            });
        });
    }
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
            clearProps: 'opacity,transform',
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

// Format items (Keynote / Workshop / Moderation / Podium)
scrollReveal('.format-item',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' },
    '.keynotes__formats-grid');

// Testimonial ratings (Google / ProvenExpert)
scrollReveal('.testimonials__rating',
    { opacity: 0, y: 20 },
    { opacity: 1, y: 0, duration: 0.7, stagger: 0.12, ease: 'power3.out' },
    '.testimonials__ratings');

// Podcast stats
scrollReveal('.podcast__stat',
    { opacity: 0, y: 18 },
    { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: 'power3.out' },
    '.podcast__stats-grid');

// Logo marquees (Events + Medien): sanftes Einblenden beim Erreichen
gsap.utils.toArray('.logos-row').forEach(row => {
    scrollReveal(row, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, row);
});

// Role cards
scrollReveal('.role-card',
    { opacity: 0, y: 15 },
    { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power3.out' },
    '.about__roles');

// Gallery items — Clip-Wipe-Reveal (Vorhang-Effekt) statt einfachem Fade
if (!prefersReducedMotion) {
    gsap.fromTo('.keynotes__gallery-item',
        { clipPath: 'inset(0 100% 0 0)' },
        {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.9, stagger: 0.1, ease: 'power3.inOut',
            clearProps: 'clipPath',
            scrollTrigger: { trigger: '.keynotes__gallery', start: 'top 85%', once: true }
        }
    );
    gsap.fromTo('.keynotes__gallery-item img',
        { scale: 1.12 },
        {
            scale: 1, duration: 1.1, stagger: 0.1, ease: 'power2.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: '.keynotes__gallery', start: 'top 85%', once: true }
        }
    );
}

// ===== TESTIMONIAL-MARQUEE: zwei gegenläufige Endlos-Reihen =====
// Baut das statische Grid per JS in zwei Marquee-Reihen um (Klone für den
// Loop, aria-hidden). Reduced Motion behält das Grid unverändert.
(function() {
    const gridEl = document.querySelector('.testimonials__grid');
    if (!gridEl || prefersReducedMotion) {
        // Statisches Grid: bisheriger Karten-Reveal
        scrollReveal('.testimonial',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.7, stagger: 0.08, ease: 'power3.out' },
            '.testimonials__grid');
        return;
    }

    const cards = Array.from(gridEl.querySelectorAll('.testimonial'));
    if (cards.length < 4) return;

    gridEl.classList.add('testimonials--marquee');
    const half = Math.ceil(cards.length / 2);
    const rows = [cards.slice(0, half), cards.slice(half)];
    const tracks = rows.map(rowCards => {
        const row = document.createElement('div');
        row.className = 'testimonials__row';
        const track = document.createElement('div');
        track.className = 'testimonials__row-track';
        // Zwei identische Sets: -50% xPercent loopt dann exakt nahtlos
        const set = document.createElement('div');
        set.className = 'testimonials__set';
        rowCards.forEach(c => set.appendChild(c));
        const cloneSet = set.cloneNode(true);
        cloneSet.setAttribute('aria-hidden', 'true');
        track.appendChild(set);
        track.appendChild(cloneSet);
        row.appendChild(track);
        gridEl.appendChild(row);
        return track;
    });

    const tweens = tracks.map((track, i) => gsap.fromTo(track,
        { xPercent: i === 0 ? 0 : -50 },
        { xPercent: i === 0 ? -50 : 0, duration: 45, ease: 'none', repeat: -1 }
    ));

    // Sanftes Anhalten bei Hover und Touch (timeScale statt hartem Pause)
    tracks.forEach((track, i) => {
        const row = track.parentElement;
        const stop = () => gsap.to(tweens[i], { timeScale: 0, duration: 0.4, overwrite: true });
        const go = () => gsap.to(tweens[i], { timeScale: 1, duration: 0.6, overwrite: true });
        row.addEventListener('pointerenter', stop);
        row.addEventListener('pointerleave', go);
        row.addEventListener('pointerdown', stop);
        row.addEventListener('pointerup', go);
        row.addEventListener('pointercancel', go);
    });

    // Offscreen pausieren
    if ('IntersectionObserver' in window) {
        new IntersectionObserver(entries => {
            entries.forEach(en => tweens.forEach(t => en.isIntersecting ? t.play() : t.pause()));
        }, { rootMargin: '150px 0px' }).observe(gridEl);
    }

    // Reveal der Reihen als Ganzes
    scrollReveal('.testimonials__row',
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' },
        gridEl);
})();

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

// Optional event date: allow enquiries before the schedule is known.
(function() {
    var unknownDate = document.getElementById('contact-date-unknown');
    var dateFields = document.getElementById('contact-date-fields');
    if (!unknownDate || !dateFields) return;

    var inputs = dateFields.querySelectorAll('input');

    function syncDateFields() {
        inputs.forEach(function(input) {
            if (unknownDate.checked) {
                input.dataset.previousValue = input.value;
                input.value = '';
                input.disabled = true;
            } else {
                input.disabled = false;
                input.value = input.dataset.previousValue || '';
                delete input.dataset.previousValue;
            }
        });

        dateFields.classList.toggle('is-undecided', unknownDate.checked);
    }

    unknownDate.addEventListener('change', syncDateFields);
    if (unknownDate.checked) syncDateFields();
})();

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

// ===== KEYNOTE KONFIGURATOR =====
(function() {
    var brancheEl = document.getElementById('konfigBranche');
    var interesseEl = document.getElementById('konfigInteresse');
    var resultEl = document.getElementById('konfigResult');
    if (!brancheEl || !interesseEl) return;

    var branche = null, interesse = null;
    var cards = document.querySelectorAll('.keynote-card');

    // Mapping: [branche][interesse] => keynote index (0-5)
    // 0=State of AI, 1=KI und die Schweiz, 2=Agentic AI, 3=Führen im KI-Zeitalter,
    // 4=AI in Marketing, 5=5 Erfolgsfaktoren KMU
    var mapping = {
        marketing:  { ueberblick: 0, praxis: 4, strategie: 4, future: 3 },
        kmu:        { ueberblick: 0, praxis: 5, strategie: 5, future: 3 },
        hr:         { ueberblick: 0, praxis: 3, strategie: 3, future: 3 },
        tech:       { ueberblick: 0, praxis: 2, strategie: 2, future: 3 },
        allgemein:  { ueberblick: 0, praxis: 5, strategie: 1, future: 3 }
    };

    var lastRecommendedIdx = null;
    function updateSelection() {
        cards.forEach(function(c) { c.classList.remove('keynote-card--highlighted'); });
        if (branche && interesse && mapping[branche]) {
            var idx = mapping[branche][interesse];
            if (idx !== undefined && cards[idx]) {
                cards[idx].classList.add('keynote-card--highlighted');
                if (idx !== lastRecommendedIdx && window.__confettiBurst) {
                    window.__confettiBurst(resultEl, 45);
                }
                lastRecommendedIdx = idx;
                var title = cards[idx].querySelector('.keynote-card__title');
                resultEl.textContent = 'Empfehlung: ' + (title ? title.textContent : '');
                if (window.keynoteScrollToCard) {
                    window.keynoteScrollToCard(cards[idx]);
                } else {
                    cards[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }
        } else {
            resultEl.textContent = '';
        }
    }

    function setupPills(container, setter) {
        container.querySelectorAll('.konfig-pill').forEach(function(pill) {
            pill.addEventListener('click', function() {
                container.querySelectorAll('.konfig-pill').forEach(function(p) { p.classList.remove('active'); });
                pill.classList.add('active');
                setter(pill.dataset.value);
                updateSelection();
            });
        });
    }

    setupPills(brancheEl, function(v) { branche = v; });
    setupPills(interesseEl, function(v) { interesse = v; });
})();

// ===== GHOST-TITEL: Parallax der Hintergrund-Wörter =====
gsap.set('.ghost-title', { xPercent: -50 }); // Zentrierung (resize-fest, statt CSS-translateX)
if (!prefersReducedMotion) {
    gsap.utils.toArray('.ghost-title').forEach(el => {
        const section = el.closest('section');
        gsap.fromTo(el,
            { y: 90 },
            {
                y: -90, ease: 'none',
                scrollTrigger: {
                    trigger: section || el,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                }
            }
        );
    });
}

// ===== BILD-PARALLAX: grosse Bilder bewegen sich gegen den Scroll =====
if (!prefersReducedMotion && window.innerWidth >= 768) {
    // Galerie-Bilder ausgenommen: deren scale gehört dem Clip-Wipe-Reveal
    const parallaxImgs = document.querySelectorAll(
        '.essay__image, .about__image-frame img, .podcast__cover'
    );
    parallaxImgs.forEach(img => {
        gsap.fromTo(img,
            { yPercent: -7, scale: 1.14 },
            {
                yPercent: 7, scale: 1.14, ease: 'none',
                scrollTrigger: {
                    trigger: img.closest('.keynotes__gallery-item, .about__image-frame, .essay__visual, .podcast__visual') || img,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: true,
                }
            }
        );
    });
}

// ===== HERO-HEADLINE: Buchstaben-Reveal =====
(function() {
    const headline = document.getElementById('heroHeadline');
    if (!headline || prefersReducedMotion) return;
    const firstNode = headline.childNodes[0];
    if (!firstNode || firstNode.nodeType !== Node.TEXT_NODE) return;

    const text = firstNode.textContent;
    headline.setAttribute('aria-label', headline.textContent.trim());
    const frag = document.createDocumentFragment();
    const chars = [];
    // Wort-Wrapper (nowrap) verhindern Umbrüche mitten im Wort
    text.trim().split(/\s+/).forEach((word, wi) => {
        if (wi > 0) frag.appendChild(document.createTextNode(' '));
        const wordSpan = document.createElement('span');
        wordSpan.className = 'hero-word';
        wordSpan.setAttribute('aria-hidden', 'true');
        for (const ch of word) {
            const span = document.createElement('span');
            span.className = 'hero-char';
            span.textContent = ch;
            wordSpan.appendChild(span);
            chars.push(span);
        }
        frag.appendChild(wordSpan);
    });
    headline.replaceChild(frag, firstNode);

    gsap.fromTo(chars,
        { y: 42, opacity: 0, filter: 'blur(8px)' },
        {
            y: 0, opacity: 1, filter: 'blur(0px)',
            duration: 0.7, stagger: 0.032, ease: 'power3.out', delay: 0.25,
            clearProps: 'all',
        }
    );
})();

// ===== CUSTOM CURSOR (Desktop-Pointer) =====
(function() {
    if (prefersReducedMotion || !window.matchMedia('(pointer: fine)').matches) return;

    const dot = document.createElement('div');
    dot.className = 'cursor-dot';
    const ring = document.createElement('div');
    ring.className = 'cursor-ring';
    ring.innerHTML = '<span class="cursor-ring__label"></span>';
    document.body.appendChild(dot);
    document.body.appendChild(ring);
    const label = ring.querySelector('.cursor-ring__label');

    let mx = -100, my = -100, rx = -100, ry = -100, visible = false;
    document.addEventListener('mousemove', (e) => {
        mx = e.clientX; my = e.clientY;
        if (!visible) {
            visible = true;
            dot.classList.add('visible');
            ring.classList.add('visible');
            rx = mx; ry = my;
        }
    }, { passive: true });
    document.addEventListener('mouseleave', () => {
        visible = false;
        dot.classList.remove('visible');
        ring.classList.remove('visible');
    });

    // Ring folgt weich im bestehenden GSAP-Ticker (dort läuft auch Lenis)
    gsap.ticker.add(() => {
        if (!visible) return;
        rx += (mx - rx) * 0.16;
        ry += (my - ry) * 0.16;
        dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
        ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
    });

    // Hover-Zustände per Delegation
    document.addEventListener('mouseover', (e) => {
        const trailer = e.target.closest('.trailer-stage');
        const card = e.target.closest('.keynote-card, .article-card');
        const interactive = e.target.closest('a, button, .btn, [role="button"], input, textarea, select, .glass-card');
        if (trailer && !e.target.closest('button, a')) {
            ring.classList.add('cursor-ring--label');
            label.textContent = 'Play';
        } else if (card && !e.target.closest('button')) {
            ring.classList.add('cursor-ring--label');
            label.textContent = 'Ansehen';
        } else {
            ring.classList.remove('cursor-ring--label');
            label.textContent = '';
        }
        ring.classList.toggle('cursor-ring--active', !!(interactive || trailer || card));
    }, { passive: true });
})();

// ===== COUNTER-POP: Puls beim Fertigzählen =====
if (!prefersReducedMotion) {
    ['.hero__bottom', '.about__counters', '.podcast__stats-grid'].forEach(sel => {
        const group = document.querySelector(sel);
        if (!group) return;
        const numbers = group.querySelectorAll('[data-count]');
        if (!numbers.length) return;
        ScrollTrigger.create({
            trigger: group,
            // Erst wenn die Zähler oberhalb 50% (= Zählende, ST-4) sind
            start: 'top 42%',
            once: true,
            onEnter: () => {
                gsap.fromTo(numbers,
                    { scale: 1 },
                    {
                        scale: 1.16, duration: 0.22, stagger: 0.08, ease: 'power2.out',
                        yoyo: true, repeat: 1,
                        onStart: () => numbers.forEach(n => n.classList.add('counter-flash')),
                        onComplete: () => {
                            gsap.set(numbers, { clearProps: 'transform' });
                            setTimeout(() => numbers.forEach(n => n.classList.remove('counter-flash')), 350);
                        },
                    }
                );
            }
        });
    });
}

// ===== KONFETTI-PAYOFF (Canvas, Markenfarben) =====
window.__confettiBurst = function(anchorEl, count) {
    if (prefersReducedMotion || !anchorEl) return;
    const colors = ['#FF9220', '#FCC001', '#46BFED', '#33D099'];
    const r = anchorEl.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    const canvas = document.createElement('canvas');
    canvas.className = 'confetti-canvas';
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    const parts = [];
    const n = count || 70;
    for (let i = 0; i < n; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 3 + Math.random() * 7;
        parts.push({
            x: cx, y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 3,
            size: 4 + Math.random() * 5,
            rot: Math.random() * Math.PI,
            vr: (Math.random() - 0.5) * 0.3,
            color: colors[i % colors.length],
            life: 1,
        });
    }
    let raf;
    function frame() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = 0;
        parts.forEach(p => {
            p.vy += 0.22;          // Schwerkraft
            p.vx *= 0.985;
            p.x += p.vx; p.y += p.vy;
            p.rot += p.vr;
            p.life -= 0.012;
            if (p.life <= 0) return;
            alive++;
            ctx.save();
            ctx.globalAlpha = Math.max(0, p.life);
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
            ctx.restore();
        });
        if (alive > 0) { raf = requestAnimationFrame(frame); }
        else { cancelAnimationFrame(raf); canvas.remove(); }
    }
    frame();
};

// Konfetti beim Absenden des Kontaktformulars
(function() {
    const form = document.querySelector('.contact__form');
    if (!form) return;
    form.addEventListener('submit', () => {
        const btn = form.querySelector('button[type="submit"], .btn');
        window.__confettiBurst(btn || form, 60);
    });
})();

// ===== NAV SCROLL-SPY: aktive Sektion mit Underline-Draw =====
(function() {
    const links = Array.from(document.querySelectorAll('.nav__links a[href^="#"]'));
    if (!links.length) return;
    const byId = {};
    links.forEach(l => { byId[l.getAttribute('href').slice(1)] = l; });

    Object.keys(byId).forEach(id => {
        const section = document.getElementById(id);
        if (!section) return;
        ScrollTrigger.create({
            trigger: section,
            start: 'top 55%',
            end: 'bottom 55%',
            onToggle: (self) => {
                if (self.isActive) {
                    links.forEach(l => l.classList.remove('active'));
                    byId[id].classList.add('active');
                } else {
                    byId[id].classList.remove('active');
                }
            }
        });
    });
})();

// ===== VIEWPORT-SPOTLIGHT (Touch): Karte in der Mitte hebt sich hervor =====
if (!prefersReducedMotion && window.matchMedia('(pointer: coarse)').matches) {
    // Vertikal gescrollte Karten: Fokus über ScrollTrigger-Zone um die Mitte
    const verticalTargets = document.querySelectorAll(
        '.role-card, .podcast__topic, .faq__item, .contact__card, .format-item, .more-topic'
    );
    verticalTargets.forEach(el => {
        ScrollTrigger.create({
            trigger: el,
            start: 'top 62%',
            end: 'bottom 38%',
            toggleClass: { targets: el, className: 'is-focus' },
        });
    });

    // Horizontale Swipe-Reihen: Karte am nächsten zur Containermitte fokussieren
    document.querySelectorAll('.articles__grid, .keynotes__gallery, .guest-podcasts__grid, .shorts__grid')
        .forEach(row => {
            let rafId = 0;
            function focusCenter() {
                rafId = 0;
                const mid = row.getBoundingClientRect().left + row.clientWidth / 2;
                let best = null, bestDist = Infinity;
                Array.from(row.children).forEach(card => {
                    const r = card.getBoundingClientRect();
                    const d = Math.abs(r.left + r.width / 2 - mid);
                    if (d < bestDist) { bestDist = d; best = card; }
                });
                Array.from(row.children).forEach(card =>
                    card.classList.toggle('is-focus', card === best));
            }
            row.addEventListener('scroll', () => {
                if (!rafId) rafId = requestAnimationFrame(focusCenter);
            }, { passive: true });
            focusCenter();
        });
}

// ===== HERO MOBILE: Gyro-Parallax (Android) bzw. Scroll-Parallax (iOS) =====
(function() {
    if (prefersReducedMotion || !window.matchMedia('(pointer: coarse)').matches) return;
    const heroBg = document.getElementById('heroBg');
    if (!heroBg) return;

    const canGyro = 'DeviceOrientationEvent' in window &&
        typeof DeviceOrientationEvent.requestPermission !== 'function';

    if (canGyro) {
        // Android: Neigung bewegt den Hintergrund (ohne Permission-Dialog)
        let gRaf = 0, gx = 0, gy = 0;
        window.addEventListener('deviceorientation', (e) => {
            if (e.gamma === null) return;
            gx = Math.max(-1, Math.min(1, e.gamma / 30));
            gy = Math.max(-1, Math.min(1, (e.beta - 45) / 30));
            if (!gRaf) gRaf = requestAnimationFrame(() => {
                gRaf = 0;
                heroBg.style.transform =
                    'translate(' + (gx * -8) + 'px,' + (gy * -6) + 'px) scale(1.04)';
            });
        }, { passive: true });
    } else {
        // iOS (Permission-Dialog wäre nötig): dezenter Scroll-Parallax stattdessen
        gsap.fromTo(heroBg,
            { y: 0, scale: 1.06 },
            {
                y: 60, scale: 1.06, ease: 'none',
                scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
            }
        );
    }
})();

// ===== SCRUB-DRIFT: Grids gleiten kontinuierlich mit dem Scroll =====
if (!prefersReducedMotion) {
    ['.keynotes__formats-grid', '.about__roles', '.podcast__topics', '.faq__grid']
        .forEach(sel => {
            const el = document.querySelector(sel);
            if (!el) return;
            gsap.fromTo(el,
                { y: 45 },
                {
                    y: -45, ease: 'none',
                    scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 1 }
                }
            );
        });
}

// ===== MAGNETIC BUTTONS (Desktop-Pointer) =====
if (!prefersReducedMotion && window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn').forEach(btn => {
        btn.classList.add('btn--magnetic');
        gsap.set(btn, { transformPerspective: 500 });

        // Setter nach jedem Rückstell-Tween neu erzeugen: overwrite killt die
        // quickTo-Tweens, gekillte quickTo-Setter reagieren danach nicht mehr.
        let setX, setY, setRotX, setRotY, setScale;
        function makeSetters() {
            const opt = { duration: 0.4, ease: 'power2.out' };
            setX = gsap.quickTo(btn, 'x', opt);
            setY = gsap.quickTo(btn, 'y', opt);
            setRotX = gsap.quickTo(btn, 'rotationX', opt);
            setRotY = gsap.quickTo(btn, 'rotationY', opt);
            setScale = gsap.quickTo(btn, 'scale', { duration: 0.3, ease: 'power2.out' });
        }
        makeSetters();

        let rect = null;
        btn.addEventListener('mouseenter', () => {
            // Laufenden Rückstell-Tween stoppen und Setter erneuern,
            // sonst reagieren gekillte quickTo-Setter nicht mehr
            gsap.killTweensOf(btn);
            makeSetters();
            rect = btn.getBoundingClientRect();
        });
        btn.addEventListener('mousemove', (e) => {
            if (!rect) rect = btn.getBoundingClientRect();
            const cx = e.clientX - rect.left - rect.width / 2;
            const cy = e.clientY - rect.top - rect.height / 2;
            setX(cx * 0.35);
            setY(cy * 0.35);
            setRotX(-cy * 0.12);
            setRotY(cx * 0.12);
            setScale(1.06);
        });
        btn.addEventListener('mouseleave', () => {
            rect = null;
            gsap.to(btn, {
                x: 0, y: 0, rotationX: 0, rotationY: 0, scale: 1,
                duration: 1, ease: 'elastic.out(1, 0.4)', overwrite: 'auto',
            });
        });
    });
}

// ===== MARQUEES: ausserhalb des Viewports pausieren =====
(function() {
    if (prefersReducedMotion) return; // CSS setzt animation: none, nichts zu pausieren
    const tracks = document.querySelectorAll('.logos-row__track');
    if (!tracks.length || !('IntersectionObserver' in window)) return;
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            entry.target.style.animationPlayState = entry.isIntersecting ? 'running' : 'paused';
        });
    }, { rootMargin: '100px 0px' });
    tracks.forEach(t => observer.observe(t));
})();

// ===== FOOTER CURTAIN REVEAL (Desktop) =====
(function() {
    const footer = document.querySelector('.footer');
    const mainEl = document.querySelector('main');
    if (!footer || !mainEl) return;

    const footerContainer = footer.querySelector('.container');
    const mq = window.matchMedia('(min-width: 900px)');
    let curtainTrigger = null;

    // Platz für den fixierten Footer unterhalb von <main> schaffen
    function setFooterHeight() {
        document.documentElement.style.setProperty('--footer-h', footer.offsetHeight + 'px');
    }

    function enableCurtain() {
        document.documentElement.classList.add('curtain');
        setFooterHeight();
        if (!prefersReducedMotion && !curtainTrigger) {
            const tween = gsap.fromTo(footerContainer,
                { y: 90, opacity: 0 },
                {
                    y: 0, opacity: 1, ease: 'none',
                    scrollTrigger: {
                        trigger: mainEl,
                        start: 'bottom bottom',
                        // Endet exakt am Seitenende (Scrollweg = Footer-Höhe)
                        end: () => '+=' + footer.offsetHeight,
                        scrub: 1,
                        invalidateOnRefresh: true,
                    }
                }
            );
            curtainTrigger = tween.scrollTrigger;
        }
        ScrollTrigger.refresh();
    }

    function disableCurtain() {
        document.documentElement.classList.remove('curtain');
        if (curtainTrigger) {
            curtainTrigger.kill();
            curtainTrigger = null;
            gsap.set(footerContainer, { clearProps: 'opacity,transform' });
        }
        ScrollTrigger.refresh();
    }

    function applyMode() {
        if (mq.matches) { enableCurtain(); } else { disableCurtain(); }
    }
    applyMode();
    mq.addEventListener('change', applyMode);

    // Footer-Höhe bleibt aktuell: nach Font-/Bild-Load und bei jeder Grössenänderung
    window.addEventListener('load', setFooterHeight);
    window.addEventListener('resize', setFooterHeight);
    if ('ResizeObserver' in window) {
        new ResizeObserver(setFooterHeight).observe(footer);
    }
})();

// ===== SCROLLTRIGGER REFRESH =====
// Refresh after DOM + images are fully loaded
window.addEventListener('load', () => {
    ScrollTrigger.refresh();
    gsap.delayedCall(0.5, () => ScrollTrigger.refresh());
});
gsap.delayedCall(2, () => ScrollTrigger.refresh());

// Debounced refresh on resize (handles pin recalculations).
// Nur bei BREITEN-Änderung: Höhen-only-Resizes (mobile URL-Bar) würden
// mitten im Pin refreshen und einen sichtbaren Sprung verursachen.
let resizeTimer;
let lastViewportWidth = window.innerWidth;
window.addEventListener('resize', () => {
    if (window.innerWidth === lastViewportWidth) return;
    lastViewportWidth = window.innerWidth;
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
            // Ziele mit gepinntem Wrapper: exakt auf den Pin-Start scrollen,
            // sonst greift der Pin nicht sauber (offset -80 läge davor)
            const pinChild = target.querySelector('.keynotes__pin');
            const pinSt = pinChild && ScrollTrigger.getAll().find(st => st.trigger === pinChild && st.pin);
            if (pinSt) {
                lenis.scrollTo(pinSt.start, { duration: prefersReducedMotion ? 0 : 1.2 });
            } else {
                lenis.scrollTo(target, { offset: -80, duration: prefersReducedMotion ? 0 : 1.2 });
            }
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

    // ── BUBBLE CHOREOGRAFIE: Einflug, Orbit-Float, Puls, Magnetismus ──
    // Alles in GSAP: CSS-Keyframes auf transform würden die Inline-/GSAP-
    // Transforms überschreiben (dokumentierte Fehlerklasse).
    var bubbleIntroDone = false;
    var bubbleMagnets = [];
    (function initBubbles() {
        if (!bubbles.length) return;
        var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        // Magnet-Setter pro Bubble (Kanäle x/y; Float läuft auf xPercent/yPercent)
        bubbles.forEach(function(b) {
            bubbleMagnets.push({
                el: b,
                setX: gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power2.out' }),
                setY: gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power2.out' }),
            });
        });

        if (reduced) { bubbleIntroDone = true; return; }

        // Tiefenstaffelung: hintere Bubbles kleiner und minimal unscharf
        var depth = [1, 0.94, 1.04, 0.92];
        bubbles.forEach(function(b, i) {
            gsap.set(b, { scale: depth[i] || 1 });
            if ((depth[i] || 1) < 1) b.style.filter = 'blur(0.4px)';
        });

        // Einflug: gestaffelt vom jeweils nächsten Bildrand, elastisch
        var fromDir = [{ x: -90, y: 0 }, { x: 0, y: -70 }, { x: -90, y: 20 }, { x: 90, y: 0 }];
        var introTl = gsap.timeline({
            delay: 1.1,
            onComplete: function() { bubbleIntroDone = true; gsap.set(bubbles, { clearProps: 'opacity' }); }
        });
        bubbles.forEach(function(b, i) {
            var d = fromDir[i] || { x: 60, y: 0 };
            introTl.fromTo(b,
                { x: d.x, y: d.y, opacity: 0, scale: 0.4 },
                { x: 0, y: 0, opacity: 0.55, scale: depth[i] || 1, duration: 1.1, ease: 'elastic.out(1, 0.5)' },
                i * 0.15);
        });

        // Orbit-Float: pro Bubble zwei überlagerte Sinus-Bewegungen mit
        // zufälliger Dauer/Amplitude — keine zwei bewegen sich gleich
        var floatTweens = [];
        bubbles.forEach(function(b) {
            floatTweens.push(gsap.to(b, {
                xPercent: gsap.utils.random(-7, 7),
                duration: gsap.utils.random(5, 9),
                ease: 'sine.inOut', yoyo: true, repeat: -1, delay: gsap.utils.random(0, 2),
            }));
            floatTweens.push(gsap.to(b, {
                yPercent: gsap.utils.random(-9, 9),
                duration: gsap.utils.random(6, 10),
                ease: 'sine.inOut', yoyo: true, repeat: -1, delay: gsap.utils.random(0, 2),
            }));
        });

        // Puls & Glow: reihum bekommt eine Bubble alle ~3.5s einen Glow-Puls
        var pulseIdx = 0, pulseTimer = null;
        function pulseNext() {
            var b = bubbles[pulseIdx % bubbles.length];
            pulseIdx++;
            if (!b.classList.contains('active')) {
                b.classList.add('hero-bubble--pulse');
                gsap.fromTo(b, { scale: depth[(pulseIdx - 1) % bubbles.length] || 1 },
                    {
                        scale: (depth[(pulseIdx - 1) % bubbles.length] || 1) * 1.07,
                        duration: 0.45, ease: 'back.out(2.5)', yoyo: true, repeat: 1,
                        onComplete: function() { b.classList.remove('hero-bubble--pulse'); },
                    });
            }
        }
        function startPulse() { if (!pulseTimer) pulseTimer = setInterval(pulseNext, 3500); }
        function stopPulse() { clearInterval(pulseTimer); pulseTimer = null; }

        // Ausserhalb des Viewports: Float und Puls pausieren
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function(entries) {
                var on = entries[0].isIntersecting;
                floatTweens.forEach(function(t) { on ? t.play() : t.pause(); });
                on ? startPulse() : stopPulse();
            }, { rootMargin: '50px 0px' }).observe(hero);
        } else {
            startPulse();
        }
    })();

    // ── BUBBLE MAGNETISM (quickTo, koexistiert mit dem Float) ──
    function updateBubbles(cx, cy) {
        if (!bubbleIntroDone) return;
        bubbleMagnets.forEach(function(m) {
            var r = m.el.getBoundingClientRect();
            var dx = cx - (r.left + r.width / 2), dy = cy - (r.top + r.height / 2);
            var dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 300 && dist > 0.001) {
                var f = (1 - dist / 300) * 16;
                m.el.classList.add('active');
                m.setX(dx / dist * f);
                m.setY(dy / dist * f);
            } else {
                m.el.classList.remove('active');
                m.setX(0);
                m.setY(0);
            }
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
        // Pending Move-Frame verwerfen, sonst setzt er den Zoom nach dem Cleanup wieder
        if (moveRafId) { cancelAnimationFrame(moveRafId); moveRafId = 0; }
        glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
        spotlight.classList.remove('active');
        heroBg.style.transition = 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        heroBg.style.transform = '';
        setTimeout(function() { heroBg.style.transition = ''; }, 600);
        // Nur den Magnet-Anteil (x/y) zurückfahren; style.transform leeren
        // würde auch Float (xPercent/yPercent) und Scale löschen
        bubbleMagnets.forEach(function(m) {
            m.el.classList.remove('active');
            m.setX(0);
            m.setY(0);
        });
    });
    // Mousemove auf rAF gedrosselt: Layout-Reads (getBoundingClientRect) max. 1x pro Frame
    var moveRafId = 0, moveClientX = 0, moveClientY = 0;
    hero.addEventListener('mousemove', function(e) {
        moveClientX = e.clientX; moveClientY = e.clientY;
        if (moveRafId) return;
        moveRafId = requestAnimationFrame(function() {
            moveRafId = 0;
            var r = hero.getBoundingClientRect();
            mouseX = moveClientX - r.left; mouseY = moveClientY - r.top;
            drawSpotlight(mouseX, mouseY);
            updateBubbles(moveClientX, moveClientY);
            heroBg.style.transform = 'translate(' + ((mouseX / r.width - 0.5) * -5) + 'px,' + ((mouseY / r.height - 0.5) * -3) + 'px) scale(1.02)';
        });
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
        if (q.includes('keynote') || q.includes('vortrag') || q.includes('themen')) return 'Ich hab sechs Keynotes: "The State of AI", "KI und die Schweiz", "Agentic AI", "Führen im KI-Zeitalter", "AI in Marketing" und "5 Erfolgsfaktoren KI in KMU". 30-90 Min, alles anpassbar. Schreib mir: chris@beyonder.ch';
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

    // Invite-Blink entfällt: der zyklische Puls (initBubbles) übernimmt die Einladung
})();
