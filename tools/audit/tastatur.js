// Tastatur-Durchgang: Tab durch die ganze Seite. Prüft pro Halt: sichtbar, nicht von der Navigation verdeckt, Fokus erkennbar.
const {chromium}=require('playwright');
(async()=>{const url=process.argv[2]||'http://localhost:8765/';const b=await chromium.launch();
const p=await b.newPage({viewport:{width:1440,height:900}});await p.route(/youtube/,r=>r.abort());
await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(1200);
const seen=[];const bad=[];let last='';let same=0;
for(let i=0;i<400;i++){await p.keyboard.press('Tab');let y=-1;for(let k=0;k<25;k++){await p.waitForTimeout(70);const n=await p.evaluate(()=>scrollY);if(n===y)break;y=n}
 const r=await p.evaluate(()=>{const e=document.activeElement;if(!e||e===document.body)return null;
  const q=e.getBoundingClientRect();const nav=document.querySelector('.nav');const nh=nav.getBoundingClientRect().bottom;
  const inNav=!!e.closest('.nav')||e.classList.contains('skip-link');
  const c=getComputedStyle(e);let ring=c.outlineStyle!=='none'&&parseFloat(c.outlineWidth)>0;
  if(!ring&&e.matches('.chip input')){const s=getComputedStyle(e.nextElementSibling);ring=s.outlineStyle!=='none'&&parseFloat(s.outlineWidth)>0}
  if(!ring&&c.boxShadow!=='none')ring=true;
  const id=(e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+(e.className&&typeof e.className==='string'?'.'+e.className.trim().split(/\s+/)[0]:'')+' «'+(e.innerText||e.getAttribute('aria-label')||e.name||'').replace(/\s+/g,' ').trim().slice(0,32)+'»');
  return {id,vis:q.width>0&&q.height>0&&q.bottom>0&&q.top<innerHeight,covered:!inNav&&q.top<nh-1&&q.bottom>0&&!e.closest('.chatbot'),ring,footer:!!e.closest('footer')}});
 if(!r)continue;
 if(r.id===last){same++;if(same>3){bad.push('Tastaturfalle bei '+r.id);break}}else same=0;last=r.id;
 if(seen.length&&r.id===seen[0].id&&seen.length>20)break;
 seen.push(r);
 if(!r.vis)bad.push('nicht sichtbar: '+r.id);if(r.covered)bad.push('von Navigation verdeckt: '+r.id);if(!r.ring)bad.push('kein Fokusrahmen: '+r.id);}
console.log('Halte:',seen.length,'| erreicht Footer:',seen.some(s=>s.footer),'| Befunde:',bad.length);[...new Set(bad)].slice(0,25).forEach(x=>console.log(' -',x));
await b.close()})();
