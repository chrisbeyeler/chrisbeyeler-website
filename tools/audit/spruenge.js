// Sprungmarken: landet jeder Sprung am Ziel, auch quer über nicht gerenderte Abschnitte?
const {chromium,devices}=require('playwright');
(async()=>{const url=process.argv[2]||'http://localhost:8765/';const b=await chromium.launch();let bad=0;
for(const [n,o] of [['mobil',devices['Pixel 7']],['desktop',{viewport:{width:1440,height:900}}]]){
 for(const [label,steps] of [['Hero-Knopf → Anfrage',['.hero a[href="#contact"]']],['Navigation → FAQ (von oben)',['NAV#faq']],['Navigation → Medien, dann Keynotes',['NAV#media','NAV#keynotes']],['Keynote 02 → Anfrage',['.talk[data-talk="2"] summary','.talk[data-talk="2"] .talk__cta']],['Footer-Schriftzug → Anfrage',['SCROLLEND','.footer__mark']],['Über mich: Trailer ansehen',['NAV#about','#about a[href="#beyonder-trailer"]']]]){
  const c=await b.newContext(o);const p=await c.newPage();await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(900);let target=null;
  try{for(const s of steps){
    if(s==='SCROLLEND'){await p.evaluate(()=>window.scrollTo(0,document.documentElement.scrollHeight));await p.waitForTimeout(1500);continue}
    let sel=s;if(s.startsWith('NAV')){const id=s.slice(3);target=id;if(n==='mobil'){await p.click('#navToggle');await p.waitForTimeout(400)}sel='#navLinks a[href="'+id+'"]'}
    const href=await p.evaluate(sel=>{const e=document.querySelector(sel);return e&&e.getAttribute('href')},sel);if(href&&href.startsWith('#'))target=href;
    await p.click(sel);await p.waitForTimeout(2600)}
   const top=await p.evaluate(t=>Math.round(document.querySelector(t).getBoundingClientRect().top),target);const ok=top>=60&&top<=110;if(!ok)bad++;
   console.log(ok?'OK  ':'FAIL',n,label,'→',target,'Oberkante bei',top,'px')}
  catch(e){bad++;console.log('FAIL',n,label,e.message.split('\n')[0].slice(0,120))}
  await c.close()}}
console.log('Sprünge mit Befund:',bad);await b.close()})();
