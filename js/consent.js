/* Cookie and external-media consent for chrisbeyeler.ch */
(function () {
    'use strict';

    var STORAGE_KEY = 'cb-consent-v1';
    var CONSENT_VERSION = 1;
    var MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
    var banner = document.getElementById('consentBanner');
    var externalMediaInput = document.getElementById('consentExternalMedia');
    var overview = banner ? banner.querySelector('[data-consent-view="overview"]') : null;
    var settings = banner ? banner.querySelector('[data-consent-view="settings"]') : null;
    var closeButton = banner ? banner.querySelector('[data-consent-close]') : null;
    var storedChoice = readChoice();
    var choice = storedChoice || { version: CONSENT_VERSION, externalMedia: false, savedAt: null };
    var lastFocus = null;

    function readChoice() {
        try {
            var parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (!parsed || parsed.version !== CONSENT_VERSION || typeof parsed.externalMedia !== 'boolean') return null;
            if (!parsed.savedAt || Date.now() - parsed.savedAt > MAX_AGE_MS) {
                localStorage.removeItem(STORAGE_KEY);
                return null;
            }
            return parsed;
        } catch (error) {
            return null;
        }
    }

    function persist(externalMedia) {
        choice = {
            version: CONSENT_VERSION,
            externalMedia: Boolean(externalMedia),
            savedAt: Date.now()
        };
        storedChoice = choice;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(choice));
        } catch (error) {
            // Consent remains valid for the current page view if storage is unavailable.
        }
        applyChoice();
        hideBanner();
        window.dispatchEvent(new CustomEvent('cookieconsentchange', { detail: choice }));
    }

    function applyChoice() {
        var allowExternalMedia = Boolean(choice.externalMedia);
        document.documentElement.classList.toggle('consent-external-media', allowExternalMedia);

        document.querySelectorAll('[data-consent-src]').forEach(function (element) {
            if (allowExternalMedia) {
                if (!element.getAttribute('src')) element.setAttribute('src', element.dataset.consentSrc);
            } else {
                element.removeAttribute('src');
            }
        });

        if (allowExternalMedia) {
            document.querySelectorAll('template[data-consent-template="external-media"]').forEach(function (template) {
                var parent = template.parentElement;
                if (parent && !parent.querySelector('[data-consent-frame="external-media"]')) {
                    parent.appendChild(template.content.cloneNode(true));
                }
            });
        } else {
            document.querySelectorAll('[data-consent-frame="external-media"]').forEach(function (frame) {
                frame.remove();
            });
            document.querySelectorAll('[data-consent-hidden]').forEach(function (element) {
                element.hidden = false;
                delete element.dataset.consentHidden;
            });
        }
    }

    function showView(view) {
        if (!banner) return;
        var showSettings = view === 'settings';
        overview.hidden = showSettings;
        settings.hidden = !showSettings;
        externalMediaInput.checked = Boolean(choice.externalMedia);
    }

    function showBanner(view) {
        if (!banner) return;
        lastFocus = document.activeElement;
        showView(view || 'overview');
        closeButton.hidden = !storedChoice;
        banner.hidden = false;
        document.body.classList.add('consent-open');
        window.setTimeout(function () {
            var target = banner.querySelector(view === 'settings' ? 'h2' : '[data-consent-accept]');
            if (target) {
                if (target.tagName === 'H2') target.setAttribute('tabindex', '-1');
                target.focus();
            }
        }, 0);
    }

    function hideBanner() {
        if (!banner) return;
        banner.hidden = true;
        document.body.classList.remove('consent-open');
        if (lastFocus && typeof lastFocus.focus === 'function') lastFocus.focus();
    }

    function closeOrReturn() {
        if (storedChoice) hideBanner();
        else showView('overview');
    }

    window.CookieConsent = {
        has: function (category) {
            return category === 'necessary' || (category === 'external-media' && Boolean(choice.externalMedia));
        },
        openSettings: function () {
            showBanner('settings');
        }
    };

    document.querySelectorAll('[data-consent-settings]').forEach(function (button) {
        button.addEventListener('click', function () { showBanner('settings'); });
    });

    if (banner) {
        banner.querySelector('[data-consent-accept]').addEventListener('click', function () { persist(true); });
        banner.querySelectorAll('[data-consent-reject]').forEach(function (button) {
            button.addEventListener('click', function () { persist(false); });
        });
        banner.querySelector('[data-consent-customize]').addEventListener('click', function () { showView('settings'); });
        banner.querySelector('[data-consent-save]').addEventListener('click', function () { persist(externalMediaInput.checked); });
        closeButton.addEventListener('click', closeOrReturn);
        banner.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') closeOrReturn();
        });
    }

    applyChoice();
    if (!storedChoice) showBanner('overview');
})();
