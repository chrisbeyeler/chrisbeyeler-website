// usage: node ref-analyze.js <url> <label>
const {chromium}=require('playwright');const fs=require('fs');
const [url,label]=process.argv.slice(2);
const count=(arr)=>{const m={};for(const a of arr)m[a]=(m[a]||0)+1;return Object.entries(m).sort((a,b)=>b[1]-a[1])};
async function pass(browser,vp,mobile){
  const ctx=await browser.newContext({viewport:vp,deviceScaleFactor:mobile?3:1,isMobile:mobile,hasTouch:mobile,userAgent:mobile?'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36':undefined});
  const page=await ctx.newPage();const reqs=[];const bodies={css:[],js:[]};
  page.on('response',async r=>{try{const rq=r.request();const t=rq.resourceType();const h=r.headers();let len=+(h['content-length']||0);let body=null;
    if(t==='stylesheet'||t==='script'||t==='document'){try{body=await r.text()}catch(e){}}
    let size=len; try{const s=await rq.sizes();size=s.responseBodySize||len}catch(e){}
    reqs.push({url:r.url(),type:t,size,enc:h['content-encoding']||'',ct:h['content-type']||''});
    if(body){if(t==='stylesheet')bodies.css.push({url:r.url(),body});else bodies.js.push({url:r.url(),body})}}catch(e){}});
  const t0=Date.now();
  await page.goto(url,{waitUntil:'load',timeout:90000}).catch(e=>console.log('goto',e.message));
  const loadMs=Date.now()-t0;
  await page.waitForTimeout(6000);
  const atLoad={n:reqs.length,bytes:reqs.reduce((a,r)=>a+r.size,0)};
  const h=await page.evaluate(()=>document.documentElement.scrollHeight);
  for(let y=0;y<Math.min(h,30000);y+=vp.height*0.8){await page.mouse.wheel(0,vp.height*0.8);await page.waitForTimeout(250)}
  await page.waitForTimeout(1500);
  const dom=await page.evaluate(()=>{
    const vis=el=>{const r=el.getBoundingClientRect();const cs=getComputedStyle(el);return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'};
    const text=[];const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);let n;
    const seen=new Set();
    while(n=walker.nextNode()){const s=n.textContent.trim();if(s.length<2)continue;const el=n.parentElement;if(!el||seen.has(el))continue;seen.add(el);if(!vis(el))continue;
      if(['SCRIPT','STYLE','NOSCRIPT'].includes(el.tagName))continue;
      const cs=getComputedStyle(el);
      let tag=el.tagName.toLowerCase();let anc=el;for(let i=0;i<4&&anc;i++){if(/^H[1-6]$|^P$|^A$|^BUTTON$|^LI$|^NAV$/.test(anc.tagName)){tag=anc.tagName.toLowerCase();break}anc=anc.parentElement}
      text.push({tag,fs:parseFloat(cs.fontSize),lh:cs.lineHeight==='normal'?'normal':+(parseFloat(cs.lineHeight)/parseFloat(cs.fontSize)).toFixed(2),ls:cs.letterSpacing==='normal'?0:+(parseFloat(cs.letterSpacing)/parseFloat(cs.fontSize)).toFixed(3),fw:cs.fontWeight,ff:cs.fontFamily.split(',')[0].replace(/["']/g,'').trim(),tt:cs.textTransform,color:cs.color,len:s.length,sample:s.slice(0,40)})}
    // sections
    const secs=[...document.querySelectorAll('section, main > div, [class*="section"], footer, header')].filter(vis).slice(0,80).map(el=>{const cs=getComputedStyle(el);const r=el.getBoundingClientRect();return{cls:(el.className&&el.className.baseVal!==undefined?el.className.baseVal:el.className||'').toString().slice(0,50),tag:el.tagName,pt:parseFloat(cs.paddingTop),pb:parseFloat(cs.paddingBottom),pl:parseFloat(cs.paddingLeft),mt:parseFloat(cs.marginTop),mb:parseFloat(cs.marginBottom),h:Math.round(r.height),bg:cs.backgroundColor}});
    const gaps=[];document.querySelectorAll('*').forEach(el=>{const cs=getComputedStyle(el);if((cs.display.includes('grid')||cs.display.includes('flex'))&&cs.gap!=='normal'&&cs.gap!=='0px'&&vis(el))gaps.push(cs.gap)});
    const radii=[];const bgs=[];const trans=[];
    document.querySelectorAll('*').forEach(el=>{const cs=getComputedStyle(el);if(cs.borderRadius!=='0px'&&vis(el))radii.push(cs.borderRadius);if(cs.backgroundColor!=='rgba(0, 0, 0, 0)'&&vis(el)){const r=el.getBoundingClientRect();if(r.width*r.height>20000)bgs.push(cs.backgroundColor)}
      if(cs.transitionDuration&&cs.transitionDuration!=='0s'){trans.push(cs.transitionDuration.split(',')[0].trim()+' | '+cs.transitionTimingFunction.split(/,(?![^(]*\))/)[0].trim()+' | '+cs.transitionProperty.split(',').slice(0,3).join(','))}});
    const rootVars={};for(const ss of document.styleSheets){let rules;try{rules=ss.cssRules}catch(e){continue}for(const r of rules){if(r.selectorText&&/^(:root|html|body)/.test(r.selectorText)){for(const p of r.style){if(p.startsWith('--'))rootVars[p]=r.style.getPropertyValue(p).trim().slice(0,80)}}}}
    const fonts=[...document.fonts].filter(f=>f.status==='loaded').map(f=>`${f.family.replace(/["']/g,'')} ${f.weight} ${f.style} display:${f.display}`);
    const g=window;const libs={gsap:!!g.gsap,gsapVersion:g.gsap&&g.gsap.version,ScrollTrigger:!!g.ScrollTrigger,stCount:g.ScrollTrigger&&g.ScrollTrigger.getAll?g.ScrollTrigger.getAll().length:null,Lenis:!!(g.Lenis||g.lenis||document.documentElement.classList.contains('lenis')),lenisClass:document.documentElement.className.slice(0,120),THREE:!!g.THREE,barba:!!g.barba,Webflow:!!g.Webflow,next:!!g.__NEXT_DATA__||!!document.getElementById('__next'),nuxt:!!g.__NUXT__||!!document.getElementById('__nuxt'),astro:!!document.querySelector('astro-island'),canvas:document.querySelectorAll('canvas').length,video:document.querySelectorAll('video').length,generator:(document.querySelector('meta[name=generator]')||{}).content||''};
    const anims=document.getAnimations?document.getAnimations().slice(0,200).map(a=>{const t=a.effect&&a.effect.getTiming?a.effect.getTiming():{};return `${a.constructor.name} ${t.duration}ms ${t.easing} iter:${t.iterations}`}):[];
    const maxw=[];document.querySelectorAll('*').forEach(el=>{const cs=getComputedStyle(el);if(cs.maxWidth!=='none'&&parseFloat(cs.maxWidth)>900&&cs.maxWidth.endsWith('px'))maxw.push(cs.maxWidth)});
    return{text,secs,gaps,radii,bgs,trans,rootVars,fonts,libs,anims,maxw,domCount:document.querySelectorAll('*').length,bodyBg:getComputedStyle(document.body).backgroundColor,bodyColor:getComputedStyle(document.body).color,bodyFont:getComputedStyle(document.body).fontFamily,title:document.title,scrollH:document.documentElement.scrollHeight}});
  await page.screenshot({path:`ref/${label}-${mobile?'m':'d'}.png`}).catch(()=>{});
  await ctx.close();
  return{reqs,bodies,dom,loadMs,atLoad};
}
(async()=>{const browser=await chromium.launch();
 const d=await pass(browser,{width:1440,height:900},false);
 const m=await pass(browser,{width:390,height:844},true);
 await browser.close();
 const out={url,label};
 for(const [k,p] of [['desktop',d],['mobile',m]]){
   const by={};for(const r of p.reqs){by[r.type]=by[r.type]||{n:0,b:0};by[r.type].n++;by[r.type].b+=r.size}
   const styles={};for(const t of p.dom.text){const key=`${t.fs}px/${t.lh} ls${t.ls} w${t.fw} ${t.ff}${t.tt!=='none'?' '+t.tt:''}`;styles[key]=styles[key]||{n:0,chars:0,tags:{},sample:t.sample};styles[key].n++;styles[key].chars+=t.len;styles[key].tags[t.tag]=(styles[key].tags[t.tag]||0)+1}
   const typeScale=Object.entries(styles).sort((a,b)=>parseFloat(b[0])-parseFloat(a[0])).map(([k,v])=>`${k} | n=${v.n} chars=${v.chars} tags=${Object.entries(v.tags).map(e=>e.join(':')).join(',')} | "${v.sample}"`);
   out[k]={loadEventMs:p.loadMs,atLoad:p.atLoad,total:{n:p.reqs.length,bytes:p.reqs.reduce((a,r)=>a+r.size,0)},byType:by,
     fontFiles:p.reqs.filter(r=>r.type==='font').map(r=>`${r.url.split('/').pop().split('?')[0]} ${Math.round(r.size/1024)}KB`),
     topReqs:[...p.reqs].sort((a,b)=>b.size-a.size).slice(0,8).map(r=>`${Math.round(r.size/1024)}KB ${r.type} ${r.url.slice(0,100)}`),
     fontsLoaded:p.dom.fonts,typeScale,colors:count(p.dom.text.map(t=>t.color)).slice(0,8),bgs:count(p.dom.bgs).slice(0,8),
     sectionPadding:count(p.dom.secs.filter(s=>s.pt+s.pb>0).map(s=>`${s.pt}/${s.pb}`)).slice(0,12),sectionSamples:p.dom.secs.filter(s=>s.h>300).slice(0,20).map(s=>`${s.tag}.${s.cls} pt${s.pt} pb${s.pb} pl${s.pl} mt${s.mt} mb${s.mb} h${s.h}`),
     gaps:count(p.dom.gaps).slice(0,15),radii:count(p.dom.radii).slice(0,8),maxw:count(p.dom.maxw).slice(0,6),transitions:count(p.dom.trans).slice(0,20),
     libs:p.dom.libs,anims:count(p.dom.anims).slice(0,15),domCount:p.dom.domCount,scrollH:p.dom.scrollH,body:{bg:p.dom.bodyBg,color:p.dom.bodyColor,font:p.dom.bodyFont},rootVars:p.dom.rootVars,title:p.dom.title};
 }
 // static code analysis (desktop pass bodies)
 const css=d.bodies.css.map(b=>b.body).join('\n')+'\n'+d.bodies.js.filter(b=>/<style/.test(b.body)).map(b=>(b.body.match(/<style[^>]*>([\s\S]*?)<\/style>/g)||[]).join('\n')).join('\n');
 const js=d.bodies.js.map(b=>b.body).join('\n');
 const rx=(s,re)=>count([...s.matchAll(re)].map(m=>m[1]||m[0]));
 out.code={cssBytes:css.length,jsBytes:js.length,
  cssBezier:rx(css,/(cubic-bezier\([^)]*\))/g).slice(0,12),
  cssTransitionDur:rx(css,/transition(?:-duration)?\s*:[^;}]*?(\d*\.?\d+m?s)/g).slice(0,12),
  cssAnimDur:rx(css,/animation(?:-duration)?\s*:[^;}]*?(\d*\.?\d+m?s)/g).slice(0,12),
  cssEaseKeywords:rx(css,/(?:transition|animation)[^;}]*?\b(ease-in-out|ease-out|ease-in|linear|ease)\b/g).slice(0,6),
  keyframes:rx(css,/@keyframes\s+([\w-]+)/g).length,
  fontFace:rx(css,/font-family\s*:\s*([^;}]+)/g).slice(0,12),
  fontDisplay:rx(css,/font-display\s*:\s*(\w+)/g),
  clamp:rx(css,/font-size\s*:\s*(clamp\([^;}]+\)|[^;}]*v[wh][^;}]*)/g).slice(0,25),
  fontSizes:rx(css,/font-size\s*:\s*([^;}]+)/g).slice(0,40),
  lineHeights:rx(css,/line-height\s*:\s*([^;}]+)/g).slice(0,20),
  letterSpacing:rx(css,/letter-spacing\s*:\s*([^;}]+)/g).slice(0,15),
  media:rx(css,/@media[^{]*?\((?:min|max)-width\s*:\s*([\d.]+(?:px|em|rem))\)/g).slice(0,12),
  reducedMotion:(css.match(/prefers-reduced-motion/g)||[]).length,
  jsReducedMotion:(js.match(/prefers-reduced-motion/g)||[]).length,
  jsEase:rx(js,/ease\s*:\s*["'`]([\w.()\-, ]+?)["'`]/g).slice(0,20),
  jsBezier:rx(js,/(cubic-bezier\([^)]*\))/g).slice(0,10),
  jsCustomEase:rx(js,/CustomEase\.create\(\s*["'`]([\w-]+)["'`]\s*,\s*["'`]([^"'`]+)["'`]/g).slice(0,10),
  jsCustomEaseFull:[...js.matchAll(/CustomEase\.create\(\s*["'`]([\w-]+)["'`]\s*,\s*["'`]([^"'`]+)["'`]/g)].slice(0,10).map(m=>m[1]+' = '+m[2]),
  jsDuration:rx(js,/\bduration\s*:\s*(\d*\.?\d+)\b/g).slice(0,20),
  jsStagger:rx(js,/\bstagger\s*:\s*(\d*\.?\d+)\b/g).slice(0,10),
  jsDelay:rx(js,/\bdelay\s*:\s*(\d*\.?\d+)\b/g).slice(0,10),
  jsScrub:rx(js,/\bscrub\s*:\s*([\w.!]+)/g).slice(0,8),
  jsStart:rx(js,/\bstart\s*:\s*["'`]([^"'`]{3,40})["'`]/g).slice(0,12),
  lenis:[...js.matchAll(/new\s+\w*[Ll]enis\w*\(\{([^}]{0,300})\}/g)].slice(0,3).map(m=>m[1]),
  lerp:rx(js,/\blerp\s*:\s*(\d*\.?\d+)/g).slice(0,6),
  signals:{gsap:/gsap|GreenSock/.test(js),ScrollTrigger:/ScrollTrigger/.test(js),SplitText:/SplitText/.test(js),lenis:/[Ll]enis/.test(js),locomotive:/locomotive/i.test(js),three:/THREE\.|three\.module|WebGLRenderer/.test(js),ogl:/\bogl\b|OGL/.test(js),framerMotion:/framer-motion|motion\.div|useScroll/.test(js),barba:/barba/.test(js),swup:/swup/i.test(js),IntersectionObserver:(js.match(/IntersectionObserver/g)||[]).length,mouseenter:(js.match(/mouseenter|pointerenter/g)||[]).length,mousemove:(js.match(/mousemove|pointermove/g)||[]).length,rAF:(js.match(/requestAnimationFrame/g)||[]).length,lottie:/lottie/i.test(js),rive:/rive/i.test(js),viewTransition:/startViewTransition/.test(js)||/view-transition/.test(css),scrollTimeline:/animation-timeline|scroll-timeline/.test(css)}};
 fs.writeFileSync(`ref/${label}.json`,JSON.stringify(out,null,1));
 fs.writeFileSync(`ref/${label}-css.txt`,css);fs.writeFileSync(`ref/${label}-js.txt`,js);
 console.log(label,'done',JSON.stringify({d:out.desktop.total,m:out.mobile.total,libs:out.desktop.libs}))})().catch(e=>{console.error(label,'ERR',e);process.exit(1)});
