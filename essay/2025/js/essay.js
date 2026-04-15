(function() {
    'use strict';

    // ===== 1. SETUP =====
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: prefersReducedMotion ? 0 : 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smooth: !prefersReducedMotion,
    });

    gsap.registerPlugin(ScrollTrigger);
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    // ===== 2. KAPITEL-DOTS =====
    var dotsNav = document.getElementById('essayDots');
    var dots = document.querySelectorAll('.essay-dots__item');
    var dotsArray = Array.from(dots);
    var readChapters = new Set();
    var sections = document.querySelectorAll('.essay-section');
    var sectionsArray = Array.from(sections);
    var trackFill = document.getElementById('dotsTrackFill');
    var dotsGlow = document.getElementById('dotsGlow');
    var dotsGhost = document.getElementById('dotsGhost');
    var activeChapterIndex = 0;
    var prevChapterIndex = -1;

    // --- Idee 3: Kapitel-Vorschau aus Lead-Text befüllen ---
    dotsArray.forEach(function(dot) {
        var targetEl = document.getElementById(dot.dataset.target);
        if (!targetEl) return;
        var lead = targetEl.querySelector('.essay-section__lead');
        var preview = dot.querySelector('.essay-dots__label-preview');
        if (lead && preview) {
            var text = lead.textContent.trim();
            preview.textContent = text.length > 80 ? text.slice(0, 77) + '...' : text;
        }
    });

    // --- Dots nach Hero einblenden ---
    if (dotsNav) {
        ScrollTrigger.create({
            trigger: '.essay-hero',
            start: 'bottom 80%',
            onEnter: function() { dotsNav.classList.add('is-visible'); },
            onLeaveBack: function() { dotsNav.classList.remove('is-visible'); },
        });
    }

    // --- Idee 2: Verbindungslinie füllen ---
    if (trackFill) {
        gsap.to(trackFill, {
            height: '100%',
            ease: 'none',
            scrollTrigger: {
                trigger: document.documentElement,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.3,
            }
        });
    }

    // --- Idee 6: Pro-Kapitel Fortschritt (conic-gradient Ring) ---
    sectionsArray.forEach(function(section, i) {
        var dot = dotsArray[i];
        if (!dot) return;
        gsap.to(dot, {
            '--dot-progress': 1,
            ease: 'none',
            scrollTrigger: {
                trigger: section,
                start: 'top 70%',
                end: 'bottom 30%',
                scrub: 0.2,
                onUpdate: function(self) {
                    var p = self.progress;
                    if (p > 0.02 && p < 0.98 && !readChapters.has(section.dataset.chapter)) {
                        dot.classList.add('has-progress');
                    } else {
                        dot.classList.remove('has-progress');
                    }
                }
            }
        });
    });

    // --- Section Tracking: aktiv + gelesen + Ripple + Glow ---
    sectionsArray.forEach(function(section, i) {
        ScrollTrigger.create({
            trigger: section,
            start: 'top 50%',
            end: 'bottom 50%',
            onEnter: function() { activateChapter(i); },
            onEnterBack: function() { activateChapter(i); },
            onLeave: function() { markRead(i, section.dataset.chapter); },
        });
    });

    function activateChapter(index) {
        prevChapterIndex = activeChapterIndex;
        activeChapterIndex = index;
        // Update alle Dots
        dotsArray.forEach(function(dot, i) {
            var target = dot.dataset.target;
            var sec = document.getElementById(target);
            var ch = sec ? sec.dataset.chapter : null;
            dot.classList.toggle('is-active', i === index);
            if (readChapters.has(ch)) dot.classList.add('is-read');
        });
        // Ripple + Glow
        if (prevChapterIndex !== index) {
            triggerRipple(index);
        }
        updateGlow(index);
    }

    function markRead(index, chapter) {
        readChapters.add(chapter);
        var dot = dotsArray[index];
        if (dot) {
            dot.classList.remove('has-progress');
            dot.classList.add('is-read');
        }
    }

    // --- Idee 9: Ripple via separates Element ---
    function triggerRipple(index) {
        if (prefersReducedMotion) return;
        var dot = dotsArray[index];
        if (!dot) return;
        var ripple = dot.querySelector('.essay-dots__ripple');
        if (!ripple) return;
        ripple.classList.remove('is-animating');
        // Force reflow für sauberen Neustart
        void ripple.offsetWidth;
        ripple.classList.add('is-animating');
        ripple.addEventListener('animationend', function handler() {
            ripple.classList.remove('is-animating');
            ripple.removeEventListener('animationend', handler);
        });
    }

    // --- Idee 4: Ambient Glow positionieren ---
    function updateGlow(index) {
        if (!dotsGlow || !dotsNav) return;
        var dot = dotsArray[index];
        if (!dot) return;
        // Position relativ zum Dots-Container berechnen
        // Jeder Dot ist 12px hoch, Gap ist 12px, also Dot-Center = index * 24 + 6
        var topPx = index * 24 + 6;
        dotsGlow.style.top = topPx + 'px';
        dotsGlow.classList.add('is-visible');
    }

    // --- Idee 10: Quote-Pulse ---
    if (!prefersReducedMotion) {
        gsap.utils.toArray('.essay-quote[data-accent="true"]').forEach(function(quote) {
            var section = quote.closest('.essay-section');
            if (!section) return;
            var chapterIndex = sectionsArray.indexOf(section);
            if (chapterIndex < 0) return;

            ScrollTrigger.create({
                trigger: quote,
                start: 'top 60%',
                once: true,
                onEnter: function() {
                    var dot = dotsArray[chapterIndex];
                    if (!dot) return;
                    dot.classList.add('is-pulsing');
                    setTimeout(function() { dot.classList.remove('is-pulsing'); }, 600);
                }
            });
        });
    }

    // --- Idee 7: Parallax-Tiefe (nur visuell auf Dots, nicht auf Items) ---
    if (!prefersReducedMotion && dotsNav) {
        var parallaxDots = dotsArray.map(function(item) {
            return item.querySelector('.essay-dots__dot');
        });

        lenis.on('scroll', function(e) {
            var v = e.velocity || 0;
            v = Math.min(Math.max(v * 0.15, -3), 3);
            parallaxDots.forEach(function(dotEl, i) {
                if (!dotEl) return;
                if (i === activeChapterIndex) {
                    dotEl.style.transform = '';
                } else {
                    var distance = Math.abs(i - activeChapterIndex);
                    var shift = v * Math.min(distance * 0.2, 1);
                    dotEl.style.transform = 'translateY(' + shift.toFixed(1) + 'px)';
                }
            });
        });
    }

    // --- Idee 8: Ghost Dot (geschätzte Position in ~5 Min) ---
    if (dotsGhost && dotsNav && dotsArray.length > 1) {
        var ghostSamples = [];
        var ghostLastY = window.scrollY;
        var ghostLastTime = Date.now();
        var ghostVisible = false;

        lenis.on('scroll', function() {
            var now = Date.now();
            var dt = now - ghostLastTime;
            if (dt < 800) return; // Nur alle 800ms samplen
            var currentY = window.scrollY;
            var dy = currentY - ghostLastY;
            var speed = dy / (dt / 1000); // px/s

            ghostSamples.push(speed);
            if (ghostSamples.length > 6) ghostSamples.shift();
            ghostLastY = currentY;
            ghostLastTime = now;

            // Durchschnitt berechnen
            var sum = 0;
            for (var s = 0; s < ghostSamples.length; s++) sum += ghostSamples[s];
            var avgSpeed = sum / ghostSamples.length;

            // Nur anzeigen wenn konstant vorwärts gescrollt wird
            if (avgSpeed <= 10 || !isFinite(avgSpeed) || ghostSamples.length < 3) {
                if (ghostVisible) {
                    dotsGhost.classList.remove('is-visible');
                    ghostVisible = false;
                }
                return;
            }

            var docHeight = document.documentElement.scrollHeight - window.innerHeight;
            if (docHeight <= 0) return;
            var futureY = currentY + avgSpeed * 300; // 5 Min
            var futureProgress = Math.min(1, Math.max(0, futureY / docHeight));

            // Ghost-Top: linear zwischen erstem und letztem Dot
            // Dot-Center: index * 24 + 6
            var firstCenter = 6;
            var lastCenter = (dotsArray.length - 1) * 24 + 6;
            var ghostTop = firstCenter + (lastCenter - firstCenter) * futureProgress;

            dotsGhost.style.top = ghostTop + 'px';
            if (!ghostVisible) {
                dotsGhost.classList.add('is-visible');
                ghostVisible = true;
            }
        });
    }

    // --- Idee 5: Keyboard Navigation (J/K + G+Nummer) ---
    var gKeyPressed = false;
    var gKeyTimer = null;

    document.addEventListener('keydown', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;

        var key = e.key.toLowerCase();

        if (key === 'g') {
            gKeyPressed = true;
            clearTimeout(gKeyTimer);
            gKeyTimer = setTimeout(function() { gKeyPressed = false; }, 1500);
            return;
        }

        if (gKeyPressed && key >= '0' && key <= '9') {
            gKeyPressed = false;
            clearTimeout(gKeyTimer);
            var num = parseInt(key, 10);
            var idx = num === 0 ? 9 : num - 1; // 0→Kap.10, 1-9→Kap.1-9
            if (sections[idx]) {
                e.preventDefault();
                lenis.scrollTo(sections[idx], { offset: -80, duration: prefersReducedMotion ? 0 : 1.2 });
            }
            return;
        }
        gKeyPressed = false;

        if (key === 'j') {
            e.preventDefault();
            var next = Math.min(activeChapterIndex + 1, sections.length - 1);
            lenis.scrollTo(sections[next], { offset: -80, duration: prefersReducedMotion ? 0 : 1.2 });
        }
        if (key === 'k') {
            e.preventDefault();
            var prev = Math.max(activeChapterIndex - 1, 0);
            lenis.scrollTo(sections[prev], { offset: -80, duration: prefersReducedMotion ? 0 : 1.2 });
        }
    });

    // --- Klick auf Dots → Smooth Scroll ---
    dotsArray.forEach(function(dot) {
        dot.addEventListener('click', function() {
            var target = document.getElementById(dot.dataset.target);
            if (target) {
                lenis.scrollTo(target, { offset: -80, duration: prefersReducedMotion ? 0 : 1.2 });
            }
        });
    });

    // ===== 4. TEXT ANIMATIONS =====

    // 4a. Paragraph highlight (scrub-based, like main site ST-6)
    if (!prefersReducedMotion) {
        gsap.utils.toArray('.essay-p').forEach(p => {
            gsap.fromTo(p,
                { opacity: 0.25 },
                {
                    opacity: 1,
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
    }

    // 4b. Quote accent color animation (scrub)
    if (!prefersReducedMotion) {
        gsap.utils.toArray('.essay-quote[data-accent="true"]').forEach(quote => {
            gsap.fromTo(quote,
                { color: 'var(--text-secondary)' },
                {
                    color: '#FF9220',
                    ease: 'none',
                    scrollTrigger: {
                        trigger: quote,
                        start: 'top 80%',
                        end: 'top 40%',
                        scrub: true,
                    }
                }
            );
        });
    }

    // 4c. Word-by-word reveal for lead text
    if (!prefersReducedMotion) {
        gsap.utils.toArray('.essay-section__lead').forEach(lead => {
            const text = lead.textContent;
            const words = text.split(' ');
            lead.innerHTML = words.map(w => '<span class="essay-word">' + w + '</span>').join(' ');

            gsap.fromTo(lead.querySelectorAll('.essay-word'),
                { opacity: 0.15 },
                {
                    opacity: 1,
                    stagger: 0.05,
                    ease: 'none',
                    scrollTrigger: {
                        trigger: lead,
                        start: 'top 85%',
                        end: 'top 35%',
                        scrub: true,
                    }
                }
            );
        });
    }

    // ===== 5. SECTION REVEALS =====

    // 5a. Section title clipPath reveal
    if (!prefersReducedMotion) {
        gsap.utils.toArray('.essay-section__title').forEach(el => {
            gsap.fromTo(el,
                { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
                {
                    clipPath: 'inset(0 0% 0 0)', opacity: 1,
                    duration: 0.8, ease: 'power3.out',
                    scrollTrigger: { trigger: el, start: 'top 88%', once: true }
                }
            );
        });
    }

    // 5b. Section number reveal
    if (!prefersReducedMotion) {
        gsap.utils.toArray('.essay-section__number').forEach(el => {
            gsap.fromTo(el,
                { x: -20, opacity: 0 },
                {
                    x: 0, opacity: 1,
                    duration: 0.6, ease: 'power2.out',
                    scrollTrigger: { trigger: el, start: 'top 90%', once: true }
                }
            );
        });
    }

    // 5c. Stagger entrance for glass cards, skills items, lists
    if (!prefersReducedMotion) {
        // Skills cards
        gsap.utils.toArray('.essay-skills-grid').forEach(grid => {
            gsap.fromTo(grid.children,
                { y: 30, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    stagger: 0.15,
                    duration: 0.6, ease: 'power2.out',
                    scrollTrigger: { trigger: grid, start: 'top 85%', once: true }
                }
            );
        });

        // Callouts
        gsap.utils.toArray('.essay-callout').forEach(card => {
            gsap.fromTo(card,
                { y: 30, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.6, ease: 'power2.out',
                    scrollTrigger: { trigger: card, start: 'top 88%', once: true }
                }
            );
        });

        // Brain activity items
        gsap.utils.toArray('.essay-brain-activity').forEach(container => {
            gsap.fromTo(container.querySelectorAll('.essay-brain-activity__item'),
                { y: 40, opacity: 0, scale: 0.9 },
                {
                    y: 0, opacity: 1, scale: 1,
                    stagger: 0.2,
                    duration: 0.7, ease: 'power2.out',
                    scrollTrigger: { trigger: container, start: 'top 80%', once: true }
                }
            );
        });

        // Chart containers
        gsap.utils.toArray('.essay-chart-container').forEach(chart => {
            gsap.fromTo(chart,
                { y: 30, opacity: 0 },
                {
                    y: 0, opacity: 1,
                    duration: 0.6, ease: 'power2.out',
                    scrollTrigger: { trigger: chart, start: 'top 85%', once: true }
                }
            );
        });
    }

    // ===== 6. COUNTER ANIMATIONS =====
    var counters = document.querySelectorAll('[data-count]');
    counters.forEach(counter => {
        var target = parseFloat(counter.getAttribute('data-count'));
        var suffix = counter.getAttribute('data-suffix') || '';
        var prefix = counter.getAttribute('data-prefix') || '';
        var decimals = target % 1 !== 0 ? 1 : 0;

        if (prefersReducedMotion) {
            counter.textContent = prefix + target.toFixed(decimals) + suffix;
            return;
        }

        var obj = { val: 0 };
        gsap.to(obj, {
            val: target,
            ease: 'none',
            scrollTrigger: {
                trigger: counter,
                start: 'top 90%',
                end: 'top 50%',
                scrub: true,
            },
            onUpdate: () => {
                counter.textContent = prefix + obj.val.toFixed(decimals) + suffix;
            }
        });
    });

    // ===== 7. CHART RENDERER (Chart.js) =====
    var chartDefaults = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                labels: {
                    color: '#C0C0C0',
                    font: { family: "'Inter', sans-serif", size: 13 },
                    padding: 16,
                }
            },
            tooltip: {
                backgroundColor: '#121A2E',
                titleColor: '#FFFFFF',
                bodyColor: '#C0C0C0',
                borderColor: 'rgba(255,255,255,0.08)',
                borderWidth: 1,
                cornerRadius: 8,
                padding: 12,
            }
        },
        scales: {
            x: {
                ticks: { color: '#808898', font: { family: "'Inter', sans-serif", size: 12 } },
                grid: { color: 'rgba(255,255,255,0.04)' },
                border: { color: 'rgba(255,255,255,0.08)' }
            },
            y: {
                ticks: { color: '#808898', font: { family: "'Inter', sans-serif", size: 12 } },
                grid: { color: 'rgba(255,255,255,0.04)' },
                border: { color: 'rgba(255,255,255,0.08)' },
                beginAtZero: true,
            }
        }
    };

    // AI Knowledge Chart (Bar) - 2023 vs 2024
    var aiKnowledgeCanvas = document.getElementById('aiKnowledgeChart');
    if (aiKnowledgeCanvas) {
        var chartCreated = false;
        ScrollTrigger.create({
            trigger: aiKnowledgeCanvas,
            start: 'top 90%',
            once: true,
            onEnter: () => {
                if (chartCreated) return;
                chartCreated = true;
                new Chart(aiKnowledgeCanvas.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: ['Haben davon gehört', 'Haben es angewendet'],
                        datasets: [
                            {
                                label: '2023',
                                data: [79, 37],
                                backgroundColor: 'rgba(70, 191, 237, 0.6)',
                                borderColor: '#46BFED',
                                borderWidth: 1,
                                borderRadius: 6,
                            },
                            {
                                label: '2024',
                                data: [98, 54],
                                backgroundColor: 'rgba(255, 146, 32, 0.7)',
                                borderColor: '#FF9220',
                                borderWidth: 1,
                                borderRadius: 6,
                            }
                        ]
                    },
                    options: {
                        ...chartDefaults,
                        scales: {
                            ...chartDefaults.scales,
                            y: {
                                ...chartDefaults.scales.y,
                                max: 100,
                                ticks: {
                                    ...chartDefaults.scales.y.ticks,
                                    callback: (v) => v + '%'
                                }
                            }
                        }
                    }
                });
            }
        });
    }

    // ===== 8. SVG BRAIN ANIMATIONS =====
    if (!prefersReducedMotion) {
        gsap.utils.toArray('.essay-brain-activity__item').forEach(item => {
            var pulses = item.querySelectorAll('.essay-brain-svg__pulse');
            var core = item.querySelector('.essay-brain-svg__core');
            var level = item.dataset.level;

            // Pulse animation speed based on activity level
            var speed = level === 'high' ? 1.2 : level === 'medium' ? 2 : 3;

            ScrollTrigger.create({
                trigger: item,
                start: 'top 80%',
                once: true,
                onEnter: () => {
                    // Animate core
                    gsap.to(core, {
                        opacity: 1,
                        duration: 0.5,
                        ease: 'power2.out'
                    });

                    // Pulse animation
                    pulses.forEach((pulse, i) => {
                        gsap.to(pulse, {
                            opacity: level === 'high' ? 0.5 : level === 'medium' ? 0.3 : 0.15,
                            duration: 0.6,
                            delay: i * 0.2,
                            ease: 'power2.out'
                        });

                        // Continuous pulse
                        gsap.to(pulse, {
                            scale: 1.1,
                            opacity: 0,
                            duration: speed,
                            delay: i * 0.3 + 0.8,
                            repeat: -1,
                            ease: 'power1.out',
                        });
                    });
                }
            });
        });
    }

    // ===== 9. PARALLAX DIVIDERS =====
    if (!prefersReducedMotion) {
        gsap.utils.toArray('.essay-divider').forEach(divider => {
            var bg = divider.querySelector('.essay-divider__bg');
            if (bg) {
                gsap.fromTo(bg,
                    { yPercent: -20 },
                    {
                        yPercent: 20,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: divider,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true,
                        }
                    }
                );
            }

            // Fade in divider content
            var content = divider.querySelector('.essay-divider__content');
            if (content) {
                gsap.fromTo(content,
                    { y: 30, opacity: 0 },
                    {
                        y: 0, opacity: 1,
                        duration: 0.8, ease: 'power2.out',
                        scrollTrigger: { trigger: divider, start: 'top 70%', once: true }
                    }
                );
            }

            // Large number parallax
            var number = divider.querySelector('.essay-divider__number');
            if (number) {
                gsap.fromTo(number,
                    { yPercent: 30 },
                    {
                        yPercent: -30,
                        ease: 'none',
                        scrollTrigger: {
                            trigger: divider,
                            start: 'top bottom',
                            end: 'bottom top',
                            scrub: true,
                        }
                    }
                );
            }
        });
    }

    // ===== 10. SMOOTH ANCHOR SCROLL =====
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                ScrollTrigger.refresh();
                lenis.scrollTo(target, {
                    offset: -80,
                    duration: prefersReducedMotion ? 0 : 1.2
                });
            }
        });
    });

    // ===== 12. BACK TO TOP =====
    var backToTop = document.getElementById('backToTop');
    if (backToTop) {
        ScrollTrigger.create({
            trigger: document.body,
            start: '300px top',
            onEnter: () => backToTop.classList.add('is-visible'),
            onLeaveBack: () => backToTop.classList.remove('is-visible'),
        });

        backToTop.addEventListener('click', () => {
            lenis.scrollTo(0, { duration: prefersReducedMotion ? 0 : 2 });
        });
    }

    // ===== 13. SHARE FUNCTIONALITY =====
    var shareBtn = document.querySelector('.essay-share-btn');
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            var shareData = {
                title: 'Gestalte deine Zukunft mit KI',
                text: 'Ein Plädoyer für kritisches Denken und aktives Handeln — von Chris Beyeler',
                url: window.location.href,
            };

            if (navigator.share) {
                navigator.share(shareData).catch(() => {});
            } else {
                // Fallback: copy URL
                navigator.clipboard.writeText(window.location.href).then(() => {
                    var originalText = shareBtn.textContent;
                    shareBtn.textContent = 'Link kopiert!';
                    setTimeout(() => { shareBtn.textContent = originalText; }, 2000);
                });
            }
        });
    }

    // ===== 14. HERO SCROLL INDICATOR FADE =====
    if (!prefersReducedMotion) {
        var scrollIndicator = document.querySelector('.essay-hero__scroll-indicator');
        if (scrollIndicator) {
            gsap.to(scrollIndicator, {
                opacity: 0,
                scrollTrigger: {
                    trigger: '.essay-hero',
                    start: '80% top',
                    end: 'bottom top',
                    scrub: true,
                }
            });
        }
    }

    // ===== 15. NAV BACKGROUND ON SCROLL =====
    var essayNav = document.querySelector('.essay-nav');
    if (essayNav) {
        ScrollTrigger.create({
            trigger: document.body,
            start: '100px top',
            onEnter: () => essayNav.classList.add('essay-nav--scrolled'),
            onLeaveBack: () => essayNav.classList.remove('essay-nav--scrolled'),
        });
    }

})();
