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
        window.matchMedia('(min-width: 62rem)').addEventListener('change', function (e) { if (e.matches) setOpen(false); });
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

// ===== PRESSESPIEGEL: weitere Artikel einblenden =====
(function () {
    const button = document.getElementById('articlesShowMore');
    const grid = document.querySelector('.articles__grid');
    if (!button || !grid) return;
    button.addEventListener('click', function () {
        const first = grid.querySelector('a.articles__hidden');
        grid.classList.add('articles--expanded');
        button.parentElement.classList.add('hidden');
        if (first) first.focus({ preventScroll: true });
    });
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
            inner.textContent = word;
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
