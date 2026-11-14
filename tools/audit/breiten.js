// Prüft auf elf Bildschirmbreiten, ob etwas über den Rand läuft oder die Kopfzeile überlappt.
// Aufruf: node breiten.js http://localhost:8765/
const { chromium } = require('playwright');
(async () => {
  const url = process.argv[2] || 'http://localhost:8765/';
  const b = await chromium.launch();
  let bad = 0;
  for (const w of [320, 360, 412, 600, 768, 1024, 1100, 1152, 1280, 1440, 1920]) {
    const c = await b.newContext({ viewport: { width: w, height: 800 }, reducedMotion: 'reduce' });
    const p = await c.newPage();
    await p.goto(url, { waitUntil: 'load' });
    await p.waitForTimeout(500);
    const r = await p.evaluate(() => {
      const clipped = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { if (/(hidden|auto|scroll|clip)/.test(getComputedStyle(a).overflowX)) return true; } return false; };
      const res = [];
      for (const el of document.querySelectorAll('body *')) {
        const q = el.getBoundingClientRect();
        if (q.width > 0 && q.right > innerWidth + 1 && !clipped(el) && getComputedStyle(el).position !== 'fixed') res.push(el.tagName.toLowerCase() + '.' + String(el.className).split(' ')[0]);
      }
      const nav = [...document.querySelector('.nav__inner').children].filter((e) => e.offsetParent).map((e) => e.getBoundingClientRect());
      let navOv = false;
      for (let i = 1; i < nav.length; i++) if (nav[i].left < nav[i - 1].right - 1) navOv = true;
      return { sw: document.documentElement.scrollWidth, res: [...new Set(res)].slice(0, 4), navOv };
    });
    const ok = r.sw <= w + 1 && !r.navOv;
    if (!ok) bad++;
    console.log(w, ok ? 'ok' : 'BEFUND', r.navOv ? 'Kopfzeile überlappt' : '', r.res.join(' '));
    await c.close();
  }
  console.log('Breiten mit Befund:', bad);
  await b.close();
  process.exit(bad ? 1 : 0);
})();
