// usage: node axe-run.js <url> <label> [reduced]
const {chromium,devices}=require('playwright');const {AxeBuilder}=require('@axe-core/playwright');const fs=require('fs');
(async()=>{const [url,label,reduced]=process.argv.slice(2);
const b=await chromium.launch();const ctx=await b.newContext({...devices['Pixel 7'],reducedMotion:reduced?'reduce':'no-preference'});
const p=await ctx.newPage();await p.goto(url,{waitUntil:'load'});await p.waitForTimeout(2500);
// scroll through page so lazy content + reveals settle
const h=await p.evaluate(()=>document.documentElement.scrollHeight);
for(let y=0;y<h;y+=600){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(120)}
await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(800);
const r=await new AxeBuilder({page:p}).withTags(['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']).analyze();
const sum=r.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.length,help:v.help,sample:v.nodes.slice(0,4).map(n=>n.target.join(' ')+' :: '+(n.any[0]?.message||n.all[0]?.message||n.none[0]?.message||'').slice(0,140))}));
fs.writeFileSync(`axe-${label}.json`,JSON.stringify({url,violations:r.violations,incomplete:r.incomplete.map(i=>({id:i.id,nodes:i.nodes.length})),passes:r.passes.length},null,1));
console.log(label,'violations:',sum.length,'nodes:',sum.reduce((a,v)=>a+v.nodes,0),'passes:',r.passes.length,'incomplete:',r.incomplete.map(i=>i.id+':'+i.nodes.length).join(', '),'pageHeight',h);
for(const v of sum){console.log(`- ${v.id} [${v.impact}] x${v.nodes}: ${v.help}`);v.sample.forEach(s=>console.log('    ',s))}
await b.close()})();
