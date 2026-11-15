// LCP-Kandidaten in zeitlicher Folge, mobil und Desktop, mit CPU-Drosselung
const {chromium,devices}=require('playwright');
(async()=>{const url=process.argv[2]||'http://localhost:8765/';const b=await chromium.launch();
for(const [n,o] of [['mobil',devices['Pixel 7']],['desktop',{viewport:{width:1440,height:900}}]]){
 const c=await b.newContext(o);const p=await c.newPage();const s=await c.newCDPSession(p);await s.send('Emulation.setCPUThrottlingRate',{rate:4});
 await p.addInitScript(()=>{window.__lcp=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lcp.push({t:Math.round(e.startTime),size:e.size,el:e.element?(e.element.tagName+'.'+(e.element.className&&e.element.className.baseVal!==undefined?e.element.className.baseVal:e.element.className)+' «'+(e.element.textContent||'').trim().slice(0,30)+'»'):'?',url:(e.url||'').slice(-30)})}).observe({type:'largest-contentful-paint',buffered:true});
  window.__lt=[];new PerformanceObserver(l=>{for(const e of l.getEntries())window.__lt.push([Math.round(e.startTime),Math.round(e.duration)])}).observe({type:'longtask',buffered:true})});
 await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(4000);
 const r=await p.evaluate(()=>({lcp:window.__lcp,lt:window.__lt,fcp:Math.round(performance.getEntriesByName('first-contentful-paint')[0].startTime),load:Math.round(performance.timing.loadEventEnd-performance.timing.navigationStart),dcl:Math.round(performance.timing.domContentLoadedEventEnd-performance.timing.navigationStart)}));
 console.log('==',n,'FCP',r.fcp,'DCL',r.dcl,'load',r.load);r.lcp.forEach(e=>console.log('  LCP',e.t,'ms Fläche',e.size,e.el,e.url));console.log('  Long Tasks [Start,Dauer]:',JSON.stringify(r.lt));
 await c.close()}
await b.close()})();
