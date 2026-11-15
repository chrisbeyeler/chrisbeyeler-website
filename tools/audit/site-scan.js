// Liest eine Startseite aus: Abschnitte, Überschriften, Knöpfe, Schriften, Farben, Rundungen, Schatten, Bewegung.
const {chromium}=require('playwright');const fs=require('fs');
const [out,...urls]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();
for(const url of urls){const name=url.replace(/https?:\/\/(www\.)?/,'').replace(/[^a-z0-9]+/gi,'-').replace(/-$/,'');
 const ctx=await b.newContext({viewport:{width:1440,height:900},deviceScaleFactor:1,userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'});
 const p=await ctx.newPage();let bytes=0,reqs=0;p.on('response',async r=>{reqs++;try{const h=r.headers()['content-length'];if(h)bytes+=+h}catch(e){}});
 try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:45000});await p.waitForTimeout(4000);
  const H=await p.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<Math.min(H,24000);y+=700){await p.evaluate(y=>window.scrollTo(0,y),y);await p.waitForTimeout(120)}
  await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(600);
  await p.screenshot({path:`${out}/${name}.png`});
  const data=await p.evaluate(()=>{
   const vis=e=>{const r=e.getBoundingClientRect();const c=getComputedStyle(e);return r.width>0&&r.height>0&&c.visibility!=='hidden'&&c.display!=='none'};
   const txt=e=>(e.innerText||'').replace(/\s+/g,' ').trim();
   const heads=[...document.querySelectorAll('h1,h2,h3')].filter(vis).map(e=>e.tagName+': '+txt(e).slice(0,110)).slice(0,60);
   const btns=[...new Set([...document.querySelectorAll('a,button')].filter(vis).map(e=>txt(e)).filter(t=>t&&t.length<40))].slice(0,70);
   const count=(sel,prop)=>{const m={};document.querySelectorAll(sel).forEach(e=>{if(!vis(e))return;const v=getComputedStyle(e)[prop];m[v]=(m[v]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1]).slice(0,6)};
   const all='body *';
   const h1=document.querySelector('h1');const cs=h1?getComputedStyle(h1):null;const bc=getComputedStyle(document.body);
   const pEl=[...document.querySelectorAll('p')].find(vis);const pc=pEl?getComputedStyle(pEl):null;
   const btn=[...document.querySelectorAll('a,button')].filter(vis).find(e=>{const c=getComputedStyle(e);return c.backgroundColor!=='rgba(0, 0, 0, 0)'&&e.getBoundingClientRect().height>30&&txt(e).length>2});const bcs=btn?getComputedStyle(btn):null;
   return {title:document.title,height:document.documentElement.scrollHeight,dom:document.querySelectorAll('*').length,
    lead:txt(document.querySelector('main')||document.body).slice(0,1500),heads,btns,
    fonts:count(all,'fontFamily').map(x=>[x[0].slice(0,60),x[1]]),radius:count(all,'borderRadius'),shadow:count(all,'boxShadow').map(x=>[x[0].slice(0,90),x[1]]),
    h1:cs&&{size:cs.fontSize,weight:cs.fontWeight,lh:cs.lineHeight,ls:cs.letterSpacing,font:cs.fontFamily.slice(0,50),transform:cs.textTransform},
    body:{bg:bc.backgroundColor,color:bc.color},p:pc&&{size:pc.fontSize,lh:pc.lineHeight,color:pc.color},
    button:bcs&&{text:txt(btn),bg:bcs.backgroundColor,color:bcs.color,radius:bcs.borderRadius,border:bcs.border,shadow:bcs.boxShadow.slice(0,90),height:Math.round(btn.getBoundingClientRect().height),pad:bcs.padding,weight:bcs.fontWeight,size:bcs.fontSize},
    video:document.querySelectorAll('video').length,canvas:document.querySelectorAll('canvas').length,iframes:document.querySelectorAll('iframe').length,imgs:document.querySelectorAll('img').length,
    reduced:[...document.styleSheets].reduce((n,s)=>{try{return n+[...s.cssRules].filter(r=>r.conditionText&&r.conditionText.includes('prefers-reduced-motion')).length}catch(e){return n}},0),
    anim:[...document.querySelectorAll('*')].filter(e=>{const c=getComputedStyle(e);return c.animationName!=='none'&&vis(e)}).length};
  });
  data.url=url;data.requests=reqs;data.bytesHeader=bytes;fs.writeFileSync(`${out}/${name}.json`,JSON.stringify(data,null,1));
  console.log('OK',name,'Höhe',data.height,'DOM',data.dom,'Anfragen',reqs,'canvas',data.canvas,'video',data.video,'animiert',data.anim,'reduced-motion-Regeln',data.reduced);
 }catch(e){console.log('FEHLER',name,e.message.slice(0,150))}
 await ctx.close()}
await b.close()})();
