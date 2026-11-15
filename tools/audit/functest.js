const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const out=[];const ok=(n,c,d='')=>out.push(`${c?'OK  ':'FAIL'} ${n} ${d}`);
// --- mobil
let ctx=await b.newContext({...devices['Pixel 7']});let p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('http://localhost:8765/',{waitUntil:'load'});await p.waitForTimeout(800);
ok('kein horizontaler Überlauf (mobil)',await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),await p.evaluate(()=>document.documentElement.scrollWidth+'/'+window.innerWidth));
await p.click('#navToggle');ok('Menü öffnet',await p.evaluate(()=>document.getElementById('navLinks').classList.contains('active')&&document.getElementById('navToggle').getAttribute('aria-expanded')==='true'));
await p.keyboard.press('Escape');ok('Menü schliesst mit Escape',await p.evaluate(()=>!document.getElementById('navLinks').classList.contains('active')));
await p.click('.talk[data-talk="2"] summary');await p.waitForTimeout(600);await p.click('.talk[data-talk="2"] .talk__cta');await p.waitForTimeout(900);ok('Thema wird ins Formular übernommen',await p.evaluate(()=>document.getElementById('contact-topic').value.startsWith('Agentic AI')),await p.evaluate(()=>document.getElementById('contact-topic').value));
await p.click('#konfigBranche [data-value="kmu"]');await p.click('#konfigInteresse [data-value="praxis"]');ok('Konfigurator empfiehlt',await p.evaluate(()=>document.getElementById('konfigResult').textContent.includes('5 Erfolgsfaktoren')&&document.querySelector('.talk[data-talk="5"]').classList.contains('talk--recommended')),await p.evaluate(()=>document.getElementById('konfigResult').textContent));
ok('Alle Beiträge sichtbar, Mosaik ohne Lücke',await p.evaluate(()=>{const w=[...document.querySelectorAll('.wall')];return w.length===1&&document.querySelectorAll('.plist>a').length===17&&[...document.querySelectorAll('.plist>a')].every(x=>x.offsetParent)&&w.every(g=>{const a=[...g.querySelectorAll(':scope>a')];if(a.some(x=>!x.offsetParent))return false;const r=g.getBoundingClientRect();const area=a.reduce((t,x)=>{const q=x.getBoundingClientRect();return t+q.width*q.height},0);const cs=getComputedStyle(g);const gap=parseFloat(cs.rowGap);const rows=cs.gridTemplateRows.split(' ').length,cols=cs.gridTemplateColumns.split(' ').length;const cell=(r.width-(cols-1)*gap)/cols;const cells=a.reduce((t,x)=>{const q=x.getBoundingClientRect();return t+Math.round((q.width+gap)/(cell+gap))*Math.round((q.height+gap)/((r.height-(rows-1)*gap)/rows+gap))},0);return cells===rows*cols})}),await p.evaluate(()=>document.querySelectorAll('.wall>a').length+' Mosaik + '+document.querySelectorAll('.plist>a').length+' Liste'));
ok('Anfrage: nur Schritt 1 sichtbar',await p.evaluate(()=>{const st=[...document.querySelectorAll('#contactForm .step')];return st.length===3&&!!st[0].offsetParent&&!st[1].offsetParent&&!st[2].offsetParent}));
await p.check('#contactForm input[name="Format"][value="Keynote Standard"]',{force:true});await p.click('#contactForm .step.is-active [data-next]');await p.waitForTimeout(500);
await p.check('#contact-date-unknown');ok('Datum offen deaktiviert Felder',await p.evaluate(()=>document.getElementById('contact-date').disabled));
await p.click('#contactForm .step.is-active [data-next]');await p.waitForTimeout(500);
ok('Anfrage: Zusammenfassung in Schritt 3',await p.evaluate(()=>{const t=document.querySelector('.step__summary').textContent;return t.includes('Keynote Standard')&&t.includes('Agentic AI')&&t.includes('Termin noch offen')}),await p.evaluate(()=>document.querySelector('.step__summary').textContent));
await p.click('#contactForm button[type="submit"]');await p.waitForTimeout(400);
ok('Anfrage: leere Pflichtfelder melden Fehler am Feld',await p.evaluate(()=>{const n=document.getElementById('contact-name');const e=document.getElementById('contact-name-error');return location.pathname==='/'&&n.getAttribute('aria-invalid')==='true'&&!!e&&n.getAttribute('aria-describedby')===e.id&&document.activeElement===n&&document.querySelectorAll('.form-error').length===4}),await p.evaluate(()=>document.querySelectorAll('.form-error').length+' Meldungen'));
await p.route(/youtube/,r=>r.abort());ok('Video: vor dem Klick kein YouTube',await p.evaluate(()=>!document.querySelector('iframe[src*="youtube"]')));
await p.click('.vstage__list li:nth-child(2) a');await p.waitForTimeout(600);ok('Video spielt auf der Seite',await p.evaluate(()=>{const f=document.querySelector('.vstage__player iframe');return !!f&&f.src.startsWith('https://www.youtube-nocookie.com/embed/Vz5p7pJ7WEg')&&document.querySelector('.vstage__list li:nth-child(2) a').getAttribute('aria-current')==='true'}));
await p.evaluate(()=>document.querySelector('.marquee-toggle').scrollIntoView({block:'center'}));await p.click('.marquee-toggle');ok('Laufband lässt sich anhalten',await p.evaluate(()=>document.querySelector('.media__logos .logos-row').classList.contains('is-stopped')&&document.querySelector('.marquee-toggle').textContent==='Laufband starten'));
ok('Mail-Link gesetzt',await p.evaluate(()=>document.querySelector('.contact__direct .js-mail').href.startsWith('mailto:')));
ok('Zahlen stehen im HTML',await p.evaluate(()=>document.querySelector('.numbers').textContent.includes('2500')));
await p.evaluate(()=>document.getElementById('trailer').scrollIntoView({block:'center'}));await p.waitForTimeout(2500);ok('Trailer startet von selbst (stumm)',await p.evaluate(()=>{const v=document.querySelector('#trailer video');return !!v&&v.muted&&document.getElementById('trailer').classList.contains('is-active')}));ok('Navigation bleibt bedienbar',await p.evaluate(()=>{const n=document.querySelector('.nav');const c=getComputedStyle(n);return c.opacity==='1'&&c.pointerEvents!=='none'}));
// kleine Ziele (WCAG 2.5.8: 24px)
const small=await p.evaluate(()=>[...document.querySelectorAll('a,button,summary,input,select,textarea')].filter(e=>e.offsetParent).map(e=>{const r=e.getBoundingClientRect();return{w:r.width,h:r.height,t:(e.textContent||e.name||'').trim().slice(0,30),c:e.className.toString().slice(0,30),inline:getComputedStyle(e).display==='inline'}}).filter(x=>!x.inline&&x.c!=='contact__honeypot'&&(x.w<24||x.h<24)));
ok('Zielgrössen ≥ 24px',small.length===0,JSON.stringify(small.slice(0,5)));
ok('keine JS-Fehler (mobil)',errs.length===0,errs.slice(0,3).join(' | '));
await ctx.close();
// --- ohne JS
ctx=await b.newContext({javaScriptEnabled:false,viewport:{width:1280,height:800}});p=await ctx.newPage();await p.goto('http://localhost:8765/');
ok('ohne JS: Inhalte sichtbar',await p.evaluate(()=>[...document.querySelectorAll('[data-reveal]')].every(e=>getComputedStyle(e).opacity==='1')));
ok('ohne JS: H1',true,await p.evaluate(()=>document.querySelector('h1').textContent.replace(/\s+/g,' ').trim()));
ok('Überschriften-Reihenfolge',await p.evaluate(()=>{let prev=0,good=true;document.querySelectorAll('h1,h2,h3,h4').forEach(h=>{const l=+h.tagName[1];if(l>prev+1)good=false;prev=l});return good}),await p.evaluate(()=>document.querySelectorAll('h1').length+' h1, '+document.querySelectorAll('h2').length+' h2'));
await ctx.close();
// --- Tastatur Desktop
ctx=await b.newContext({viewport:{width:1440,height:900}});p=await ctx.newPage();await p.goto('http://localhost:8765/',{waitUntil:'load'});
await p.keyboard.press('Tab');ok('Skip-Link zuerst',await p.evaluate(()=>document.activeElement.className==='skip-link'));
ok('kein horizontaler Überlauf (Desktop)',await p.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1));
ok('Hero passt auf 1440×900',await p.evaluate(()=>document.querySelector('.hero__ctas').getBoundingClientRect().bottom<900),await p.evaluate(()=>Math.round(document.querySelector('.hero__ctas').getBoundingClientRect().bottom)+'px CTA-Unterkante; Hero '+Math.round(document.querySelector('.hero').getBoundingClientRect().height)));
await p.waitForTimeout(5200);ok('Akzentwort endet auf «Verständlich.»',await p.evaluate(()=>{const l=document.querySelector('.line--accent').getBoundingClientRect();const r=document.querySelector('.rotator').getBoundingClientRect();return Math.abs((l.top-r.top)/r.height-0.75)<0.02}));
await ctx.close();await b.close();console.log(out.join('\n'))})();
