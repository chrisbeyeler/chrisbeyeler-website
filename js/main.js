/* ===================================================================
   CHRIS BEYELER — Main JavaScript (ohne Bibliotheken)
   Navigation, Eintritts-Animation, Trailer, Konfigurator, Formular
   =================================================================== */
'use strict';

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== NAVIGATION =====
(function () {
    const nav = document.getElementById('nav');
    const toggle = document.getElementById('navToggle');
    const links = document.getElementById('navLinks');
    if (!nav) return;

    // Zustand «gescrollt» über einen Sentinel statt über einen Scroll-Listener
    const sentinel = document.createElement('div');
    sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:60px;pointer-events:none';
    document.body.prepend(sentinel);
    new IntersectionObserver(function (entries) {
        nav.classList.toggle('nav--scrolled', !entries[0].isIntersecting);
    }).observe(sentinel);

    function setOpen(open) {
        links.classList.toggle('active', open);
        nav.classList.toggle('nav--open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Menü schliessen' : 'Menü öffnen');
        document.body.style.overflow = open ? 'hidden' : '';
    }
    if (toggle && links) {
        toggle.addEventListener('click', function () { setOpen(!links.classList.contains('active')); });
        links.addEventListener('click', function (e) { if (e.target.closest('a')) setOpen(false); });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && links.classList.contains('active')) { setOpen(false); toggle.focus(); }
        });
        window.matchMedia('(min-width: 72rem)').addEventListener('change', function (e) { if (e.matches) setOpen(false); });
    }

    // Scroll-Spy: aktive Sektion in der Navigation markieren
    const map = new Map();
    links.querySelectorAll('a[href^="#"]').forEach(function (a) {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) map.set(target, a);
    });
    const spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            map.forEach(function (a) { a.classList.remove('is-active'); a.removeAttribute('aria-current'); });
            const a = map.get(entry.target);
            a.classList.add('is-active');
            a.setAttribute('aria-current', 'true');
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    map.forEach(function (_a, target) { spy.observe(target); });
})();

// ===== EINTRITTS-ANIMATION: einmal, kurz, ohne Scroll-Listener =====
(function () {
    const items = Array.from(document.querySelectorAll('[data-reveal]'));
    if (!items.length) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
        items.forEach(function (el) { el.classList.add('is-in'); });
        return;
    }
    const io = new IntersectionObserver(function (entries) {
        // Elemente, die gemeinsam eintreten, werden gestaffelt
        entries.filter(function (e) { return e.isIntersecting; }).forEach(function (entry, i) {
            entry.target.style.setProperty('--i', Math.min(i, 5));
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    items.forEach(function (el) { io.observe(el); });
})();

// ===== LOGO-LAUFBAND: ausserhalb des Viewports pausieren =====
(function () {
    if (!('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) { entry.target.classList.toggle('is-paused', !entry.isIntersecting); });
    });
    document.querySelectorAll('.logos-row').forEach(function (row) { row.classList.add('is-paused'); io.observe(row); });
})();

// ===== CINEMATIC TRAILER CONTROLLER =====
(function () {
    const stages = Array.from(document.querySelectorAll('.trailer-stage'));
    if (!stages.length) return;
    const instances = [];
    const saveData = navigator.connection && navigator.connection.saveData;
    // Trailer startet stumm, sobald er im Bild ist. Ausnahmen: reduzierte Bewegung und Datensparmodus.
    const manualOnly = prefersReducedMotion || saveData;

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
            playButton.textContent = next === 'paused' ? 'Weiter' : 'Pause';
            soundButton.textContent = muted ? 'Ton einschalten' : 'Ton ausschalten';
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

        // Ausser Sicht: Trailer schliessen. Sonst läuft er unsichtbar weiter und
        // die Navigation bleibt abgedunkelt und nicht klickbar.
        if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (entries) {
                if (!entries[0].isIntersecting && stage.classList.contains('is-active') && !document.fullscreenElement) close(true);
            }).observe(stage);
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

// ===== KEYNOTE-KONFIGURATOR =====
(function () {
    const brancheEl = document.getElementById('konfigBranche');
    const interesseEl = document.getElementById('konfigInteresse');
    const resultEl = document.getElementById('konfigResult');
    if (!brancheEl || !interesseEl || !resultEl) return;

    const talks = Array.from(document.querySelectorAll('.talk[data-talk]'));
    // 0 State of AI, 1 KI und die Schweiz, 2 Agentic AI, 3 Führen im KI-Zeitalter,
    // 4 AI in Marketing, 5 Erfolgsfaktoren KMU
    const mapping = {
        marketing: { ueberblick: 0, praxis: 4, strategie: 4, future: 3 },
        kmu:       { ueberblick: 0, praxis: 5, strategie: 5, future: 3 },
        hr:        { ueberblick: 0, praxis: 3, strategie: 3, future: 3 },
        tech:      { ueberblick: 0, praxis: 2, strategie: 2, future: 3 },
        allgemein: { ueberblick: 0, praxis: 5, strategie: 1, future: 3 }
    };
    const choice = { branche: null, interesse: null };

    function update() {
        talks.forEach(function (t) { t.classList.remove('talk--recommended'); });
        resultEl.textContent = '';
        if (!choice.branche || !choice.interesse) return;
        const talk = talks[mapping[choice.branche][choice.interesse]];
        if (!talk) return;
        talk.classList.add('talk--recommended');
        talk.querySelector('details').open = true;
        const title = talk.querySelector('.talk__title').textContent;
        resultEl.append('Empfehlung: «' + title + '»');
        const link = document.createElement('a');
        link.className = 'arrow-link';
        link.href = '#contact';
        link.dataset.topic = title;
        link.textContent = 'Diese Keynote anfragen';
        resultEl.append(link);
    }

    function setup(container, key) {
        container.addEventListener('click', function (e) {
            const pill = e.target.closest('.konfig-pill');
            if (!pill) return;
            container.querySelectorAll('.konfig-pill').forEach(function (p) { p.setAttribute('aria-pressed', String(p === pill)); });
            choice[key] = pill.dataset.value;
            update();
        });
    }
    setup(brancheEl, 'branche');
    setup(interesseEl, 'interesse');
})();

// ===== ANFRAGE: Thema aus Keynote-Liste oder URL (?thema=) übernehmen =====
(function () {
    const select = document.getElementById('contact-topic');
    if (!select) return;

    function setTopic(topic) {
        const option = Array.from(select.options).find(function (o) { return o.textContent.trim() === topic; });
        if (option) select.value = option.value || option.textContent;
    }
    document.addEventListener('click', function (e) {
        const link = e.target.closest('[data-topic]');
        if (link) setTopic(link.dataset.topic);
    });
    const fromUrl = new URLSearchParams(location.search).get('thema');
    if (fromUrl) setTopic(fromUrl);
})();

// ===== ANFRAGE: Datum noch offen =====
(function () {
    const unknownDate = document.getElementById('contact-date-unknown');
    const dateFields = document.getElementById('contact-date-fields');
    if (!unknownDate || !dateFields) return;
    const inputs = dateFields.querySelectorAll('input');

    function sync() {
        inputs.forEach(function (input) {
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
    unknownDate.addEventListener('change', sync);
    if (unknownDate.checked) sync();
})();

// ===== E-MAIL-ADRESSEN (Spam-Schutz) =====
document.querySelectorAll('.js-mail').forEach(function (el) {
    el.href = 'mai' + 'lto:' + el.dataset.n + '@' + el.dataset.d;
});

// ===== SEKTIONSTITEL: Wörter einzeln einblenden =====
(function () {
    const titles = document.querySelectorAll('[data-split]');
    if (!titles.length || prefersReducedMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-in');
            io.unobserve(entry.target);
        });
    }, { rootMargin: '0px 0px -12% 0px' });
    titles.forEach(function (title) {
        const words = title.textContent.trim().split(/\s+/);
        title.setAttribute('aria-label', words.join(' '));
        title.textContent = '';
        words.forEach(function (word, i) {
            const outer = document.createElement('span');
            outer.className = 'w';
            outer.setAttribute('aria-hidden', 'true');
            const inner = document.createElement('span');
            inner.style.setProperty('--w', i);
            // Schlusspunkt als Signatur in der Akzentfarbe
            if (i === words.length - 1 && word.endsWith('.')) {
                inner.textContent = word.slice(0, -1);
                const dot = document.createElement('i');
                dot.className = 'dot';
                dot.textContent = '.';
                inner.append(dot);
            } else {
                inner.textContent = word;
            }
            outer.append(inner);
            title.append(outer, ' ');
        });
        io.observe(title);
    });
})();

// ===== KENNZAHLEN: beim Eintritt hochzählen (der echte Wert steht im HTML) =====
(function () {
    const numbers = document.querySelectorAll('[data-count]');
    if (!numbers.length || prefersReducedMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            const el = entry.target;
            const target = parseFloat(el.dataset.count);
            const decimals = parseInt(el.dataset.decimals || '0', 10);
            const final = el.textContent;
            const start = performance.now();
            const duration = 1400;
            (function tick(now) {
                const t = Math.min(1, (now - start) / duration);
                const eased = 1 - Math.pow(1 - t, 4);
                el.textContent = t < 1 ? (target * eased).toFixed(decimals).replace('.', ',') : final;
                if (t < 1) requestAnimationFrame(tick);
            })(start);
        });
    }, { threshold: 0.6 });
    numbers.forEach(function (el) { io.observe(el); });
})();

// ===== GALERIE: Bilder wischen beim Eintritt auf =====
(function () {
    const gallery = document.querySelector('.gallery');
    if (!gallery) return;
    if (prefersReducedMotion || !('IntersectionObserver' in window)) { gallery.classList.add('is-in'); return; }
    const io = new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) { gallery.classList.add('is-in'); io.disconnect(); }
    }, { threshold: 0.2 });
    io.observe(gallery);
})();

// ===== ZEIGER-EFFEKTE (nur Maus, nur wenn Bewegung erlaubt) =====
(function () {
    if (prefersReducedMotion || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    // Bühnen-Spotlight im Hero
    const hero = document.getElementById('hero');
    if (hero) {
        let frame = 0;
        hero.addEventListener('pointermove', function (e) {
            if (frame) return;
            frame = requestAnimationFrame(function () {
                const r = hero.getBoundingClientRect();
                hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
                hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
                hero.classList.add('is-lit');
                frame = 0;
            });
        }, { passive: true });
        hero.addEventListener('pointerleave', function () { hero.classList.remove('is-lit'); });
    }

    // Bühnenfoto folgt dem Zeiger über der Keynote-Liste
    const list = document.querySelector('.talks');
    if (!list) return;
    const preview = document.createElement('div');
    preview.className = 'talk-preview';
    preview.setAttribute('aria-hidden', 'true');
    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';
    preview.append(img);
    document.body.append(preview);
    let x = 0, y = 0, tx = 0, ty = 0, running = false;
    function loop() {
        x += (tx - x) * 0.16;
        y += (ty - y) * 0.16;
        preview.style.transform = 'translate3d(' + x + 'px,' + y + 'px,0)';
        if (running) requestAnimationFrame(loop);
    }
    list.addEventListener('pointermove', function (e) {
        const talk = e.target.closest('.talk[data-img]');
        // rechts vom Titel halten, damit das Foto die Schrift nicht verdeckt
        tx = Math.max(e.clientX + 40, window.innerWidth * 0.54);
        ty = e.clientY - 170;
        if (!talk || !e.target.closest('summary')) { preview.classList.remove('is-on'); return; }
        if (img.dataset.src !== talk.dataset.img) { img.src = talk.dataset.img; img.dataset.src = talk.dataset.img; }
        if (!running) { x = tx; y = ty; running = true; requestAnimationFrame(loop); }
        preview.classList.add('is-on');
    }, { passive: true });
    list.addEventListener('pointerleave', function () { preview.classList.remove('is-on'); running = false; });
})();

// ===== SCROLLYTELLING =====
// Ein Scroll-Listener (pro Bild höchstens einmal) schreibt den Fortschritt --p auf wenige Elemente.
// Das ersetzt CSS-Scroll-Timelines, die nicht jeder Browser kann.
(function () {
    if (prefersReducedMotion) return;
    const items = Array.from(document.querySelectorAll('[data-scroll]'));
    const bar = document.querySelector('.progress');
    let ticking = false;
    function update() {
        ticking = false;
        const vh = window.innerHeight;
        for (const el of items) {
            const r = el.getBoundingClientRect();
            if (r.bottom < -300 || r.top > vh + 300) continue;
            el.style.setProperty('--p', Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))).toFixed(4));
        }
        if (bar) {
            const max = document.documentElement.scrollHeight - vh;
            bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, window.scrollY / max) : 0).toFixed(4) + ')';
        }
    }
    function request() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    update();

    if (!('IntersectionObserver' in window)) return;
    // Keynotes: die Zeile in der Bildmitte hervorheben
    const list = document.querySelector('.talks');
    if (list) {
        const io = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { e.target.classList.toggle('is-current', e.isIntersecting); });
            list.classList.toggle('has-current', !!list.querySelector('.is-current'));
        }, { rootMargin: '-42% 0px -42% 0px' });
        list.querySelectorAll('.talk[data-talk]').forEach(function (t) { io.observe(t); });
    }
    // Werdegang: Jahre, die die Bildmitte passiert haben, bleiben hell
    const years = document.querySelectorAll('.timeline[data-scroll] li');
    if (years.length) {
        const io2 = new IntersectionObserver(function (entries) {
            entries.forEach(function (e) { if (e.isIntersecting || e.boundingClientRect.top < 0) e.target.classList.add('is-past'); else e.target.classList.remove('is-past'); });
        }, { rootMargin: '0px 0px -45% 0px' });
        years.forEach(function (y) { io2.observe(y); });
    }
})();

// ===== ANFRAGE IN DREI SCHRITTEN =====
// Ohne JavaScript bleibt es ein einziges Formular. Mit JavaScript: ein Schritt nach dem anderen,
// Fehler stehen direkt beim Feld, vor dem Senden gibt es eine kurze Zusammenfassung.
(function () {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const steps = Array.from(form.querySelectorAll('.step'));
    const tabs = Array.from(form.querySelectorAll('.steps__nav button'));
    const summary = form.querySelector('.step__summary');
    const submit = form.querySelector('button[type="submit"]');
    if (!steps.length || !submit) return;
    const last = steps.length - 1;
    const submitText = submit.textContent;
    let current = 0;
    form.classList.add('is-stepped');
    form.noValidate = true;

    function value(name) {
        const el = form.elements[name];
        return el && el.value ? String(el.value).trim() : '';
    }
    function writeSummary() {
        if (!summary) return;
        const parts = [];
        if (value('Format')) parts.push(value('Format'));
        const topic = form.elements['Themenwunsch'];
        if (topic && topic.value) parts.push(topic.options[topic.selectedIndex].text);
        if (value('Anzahl Publikum')) parts.push(value('Anzahl Publikum') + ' Personen');
        const open = form.elements['Terminstatus'];
        if (open && open.checked) parts.push('Termin noch offen');
        else if (value('Datum')) parts.push(new Date(value('Datum') + 'T12:00').toLocaleDateString('de-CH'));
        if (value('Ort')) parts.push(value('Ort'));
        summary.textContent = parts.length ? 'Deine Anfrage: ' + parts.join(' · ') : '';
    }
    function show(n, moveFocus) {
        current = Math.max(0, Math.min(last, n));
        steps.forEach(function (s, i) { s.classList.toggle('is-active', i === current); });
        tabs.forEach(function (t, i) {
            if (i === current) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current');
            t.classList.toggle('is-done', i < current);
        });
        if (current === last) writeSummary();
        if (!moveFocus) return;
        const legend = steps[current].querySelector('legend');
        if (legend) legend.focus({ preventScroll: true });
        const top = form.getBoundingClientRect().top;
        if (top < 0 || top > window.innerHeight * 0.6) form.scrollIntoView({ block: 'start', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
    function check(el) {
        if (!el.id || !el.willValidate) return true;
        let note = document.getElementById(el.id + '-error');
        if (el.checkValidity()) {
            el.removeAttribute('aria-invalid');
            el.removeAttribute('aria-describedby');
            if (note) note.remove();
            return true;
        }
        if (!note) {
            note = document.createElement('p');
            note.className = 'form-error';
            note.id = el.id + '-error';
            const group = el.closest('.form-group');
            if (group) group.appendChild(note); else el.closest('label').after(note);
        }
        note.textContent = el.type === 'checkbox' ? 'Bitte zustimmen, sonst darf ich dir nicht antworten.'
            : el.validity.valueMissing ? 'Bitte ausfüllen.'
            : el.validity.typeMismatch ? 'Bitte eine gültige E-Mail-Adresse angeben.'
            : 'Bitte prüfen.';
        el.setAttribute('aria-invalid', 'true');
        el.setAttribute('aria-describedby', note.id);
        return false;
    }

    form.addEventListener('click', function (e) {
        const b = e.target.closest('[data-next], [data-prev], [data-go]');
        if (!b) return;
        if (b.hasAttribute('data-next')) show(current + 1, true);
        else if (b.hasAttribute('data-prev')) show(current - 1, true);
        else show(Number(b.dataset.go), true);
    });
    ['input', 'change'].forEach(function (type) {
        form.addEventListener(type, function (e) { if (e.target.getAttribute('aria-invalid')) check(e.target); });
    });
    form.addEventListener('submit', function (e) {
        // Enter in Schritt 1 oder 2 führt weiter, statt ein halbes Formular zu senden
        if (current < last) { e.preventDefault(); show(current + 1, true); return; }
        const bad = Array.from(form.elements).filter(function (el) { return !check(el); });
        if (bad.length) { e.preventDefault(); bad[0].focus(); return; }
        submit.disabled = true;
        submit.textContent = 'Wird gesendet …';
    });
    window.addEventListener('pageshow', function () { submit.disabled = false; submit.textContent = submitText; });
    // Thema aus einer Keynote übernommen: zurück zu Schritt 1, damit man es sieht
    document.addEventListener('click', function (e) { if (e.target.closest('[data-topic]')) show(0, false); });
    show(0, false);
})();

// ===== KEYNOTE-VIDEOS: Wiedergabe direkt auf der Seite =====
// YouTube wird erst beim Klick geladen (youtube-nocookie.com). Ohne JavaScript öffnen die Links YouTube.
(function () {
    const stage = document.getElementById('vstage');
    if (!stage) return;
    const player = stage.querySelector('.vstage__player');
    const links = Array.from(stage.querySelectorAll('.vstage__list a'));
    stage.addEventListener('click', function (e) {
        const a = e.target.closest('a[data-yt]');
        if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button) return;
        e.preventDefault();
        const frame = document.createElement('iframe');
        frame.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(a.dataset.yt) + '?autoplay=1&rel=0&playsinline=1';
        frame.title = 'Video: ' + a.dataset.title;
        frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        frame.allowFullscreen = true;
        player.replaceChildren(frame);
        links.forEach(function (l) {
            if (l.dataset.yt === a.dataset.yt) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
        const r = player.getBoundingClientRect();
        if (r.top < 0 || r.bottom > window.innerHeight) player.scrollIntoView({ block: 'center', behavior: prefersReducedMotion ? 'auto' : 'smooth' });
        frame.focus();
    });
})();

// ===== LAUFBAND DER MEDIEN: anhalten und starten =====
(function () {
    const btn = document.querySelector('.marquee-toggle');
    const row = document.querySelector('.media__logos .logos-row');
    if (!btn || !row || prefersReducedMotion) return;
    btn.hidden = false;
    btn.addEventListener('click', function () {
        const stopped = row.classList.toggle('is-stopped');
        btn.textContent = stopped ? 'Laufband starten' : 'Laufband anhalten';
    });
})();

// ===== ERKENNUNGSRAHMEN: Trefferwert zählt hoch, sobald der Rahmen im Bild ist =====
(function () {
    if (prefersReducedMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            io.unobserve(entry.target);
            const el = entry.target;
            const m = /^(.*\s)(\d\.\d\d)$/.exec(el.dataset.label);
            if (!m) return;
            const target = Number(m[2]);
            const start = performance.now();
            (function tick(now) {
                const t = Math.min(1, (now - start) / 900);
                el.dataset.label = m[1] + (target * (1 - Math.pow(1 - t, 3))).toFixed(2);
                if (t < 1) requestAnimationFrame(tick);
            })(start);
        });
    }, { threshold: 0.4 });
    document.querySelectorAll('.detect[data-label]').forEach(function (el) { io.observe(el); });
})();

// ===== FOOTER-SCHRIFTZUG: Buchstaben ziehen sich zum Zeiger hin zusammen =====
// Nutzt die Breiten- und Gewichtsachse von Mona Sans. Nur mit Maus, nie breiter als die Grundform.
(function () {
    const mark = document.querySelector('.footer__mark span');
    if (!mark || prefersReducedMotion || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    const text = mark.textContent;
    mark.textContent = '';
    const letters = [];
    text.split('').forEach(function (ch) {
        if (ch === ' ') { mark.appendChild(document.createTextNode(' ')); return; }
        const s = document.createElement('span');
        s.textContent = ch;
        mark.appendChild(s);
        letters.push(s);
    });
    const host = mark.parentElement;
    let frame = 0, x = 0, y = 0;
    function paint() {
        frame = 0;
        letters.forEach(function (s) {
            const r = s.getBoundingClientRect();
            const d = Math.hypot(x - (r.left + r.width / 2), y - (r.top + r.height / 2));
            const k = Math.max(0, 1 - d / 320);
            s.style.fontVariationSettings = k > 0.01 ? '"wdth" ' + (85 - k * 10).toFixed(1) + ', "wght" ' + Math.round(850 + k * 50) : '';
        });
    }
    host.addEventListener('pointermove', function (e) { x = e.clientX; y = e.clientY; if (!frame) frame = requestAnimationFrame(paint); });
    host.addEventListener('pointerleave', function () { letters.forEach(function (s) { s.style.fontVariationSettings = ''; }); });
})();
