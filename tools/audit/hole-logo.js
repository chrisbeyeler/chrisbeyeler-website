// Holt das Logo aus dem Kopf einer Website: inline-SVG oder Bilddatei. usage: node hole.js <outdir> name=url ...
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const [out,...pairs]=process.argv.slice(2);
(async()=>{const b=await chromium.launch();
for(const pair of pairs){const i=pair.indexOf('=');const name=pair.slice(0,i),url=pair.slice(i+1);
 const ctx=await b.newContext({viewport:{width:1440,height:900},locale:'de-CH',userAgent:'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'});const p=await ctx.newPage();
 try{await p.goto(url,{waitUntil:'domcontentloaded',timeout:40000});await p.waitForTimeout(3500);
  const found=await p.evaluate(()=>{
   const vis=e=>{const r=e.getBoundingClientRect();const c=getComputedStyle(e);return r.width>=40&&r.height>=10&&r.width<700&&r.top<260&&r.top>-5&&c.visibility!=='hidden'&&c.display!=='none'&&+c.opacity>0.1};
   const score=e=>{let s=0;const t=(e.outerHTML.slice(0,400)+' '+(e.closest('a')?e.closest('a').outerHTML.slice(0,300):'')).toLowerCase();if(/logo|brand|wordmark/.test(t))s+=5;const a=e.closest('a');if(a){const h=a.getAttribute('href')||'';if(h==='/'||/^https?:\/\/[^/]+\/?$/.test(h)||h==='./'||h==='#')s+=4}if(e.closest('header,[role=banner],nav'))s+=2;const r=e.getBoundingClientRect();if(r.left<500)s+=1;if(/icon|menu|search|burger|user|login|close|arrow|facebook|twitter|linkedin|instagram/.test(t)&&!/logo/.test(t))s-=6;if(r.width/r.height<1.15)s-=2;return s};
   const cands=[...document.querySelectorAll('svg, img, picture img')].filter(vis).map(e=>({e,s:score(e)})).sort((x,y)=>y.s-x.s);
   if(!cands.length||cands[0].s<3)return {type:'none',top:cands.slice(0,4).map(c=>c.s+' '+c.e.tagName+' '+Math.round(c.e.getBoundingClientRect().width)+'x'+Math.round(c.e.getBoundingClientRect().height)+' '+(c.e.currentSrc||c.e.getAttribute('class')||'').toString().slice(-50)),title:document.title.slice(0,60),n:document.querySelectorAll('svg,img').length};const e=cands[0].e;const r=e.getBoundingClientRect();
   if(e.tagName.toLowerCase()==='svg'){const clone=e.cloneNode(true);
     // use-Verweise auflösen
     clone.querySelectorAll('use').forEach(u=>{const id=(u.getAttribute('href')||u.getAttribute('xlink:href')||'').replace('#','');const t=id&&document.getElementById(id);if(t){const g=document.createElementNS('http://www.w3.org/2000/svg','g');g.innerHTML=t.innerHTML;if(t.getAttribute('viewBox')&&!clone.getAttribute('viewBox'))clone.setAttribute('viewBox',t.getAttribute('viewBox'));u.replaceWith(g)}});
     if(!clone.getAttribute('viewBox'))clone.setAttribute('viewBox','0 0 '+(parseFloat(e.getAttribute('width'))||r.width)+' '+(parseFloat(e.getAttribute('height'))||r.height));
     clone.setAttribute('xmlns','http://www.w3.org/2000/svg');['class','style','width','height','id','aria-hidden','focusable','role'].forEach(a=>clone.removeAttribute(a));
     return {type:'svg',svg:clone.outerHTML,w:Math.round(r.width),h:Math.round(r.height),score:cands[0].s}}
   return {type:'img',src:e.currentSrc||e.src,alt:e.alt,w:Math.round(r.width),h:Math.round(r.height),score:cands[0].s}});
  if(!found||found.type==='none'){console.log('KEIN',name,JSON.stringify(found));await p.screenshot({path:path.join(out,'_'+name+'.png'),clip:{x:0,y:0,width:1440,height:300}});await ctx.close();continue}
  if(found.type==='svg'){fs.writeFileSync(path.join(out,name+'.svg'),found.svg);console.log('SVG ',name,found.w+'x'+found.h,'Punkte',found.score,found.svg.length,'Bytes')}
  else{const p2=await ctx.newPage();const r=await p2.goto(found.src,{timeout:30000});const ct=r.headers()['content-type']||'';const ext=/svg/.test(ct)||/\.svg(\?|$)/.test(found.src)?'svg':/png/.test(ct)?'png':/webp/.test(ct)?'webp':/jpe?g/.test(ct)?'jpg':/gif/.test(ct)?'gif':'bin';fs.writeFileSync(path.join(out,name+'.'+ext),await r.body());await p2.close();console.log('IMG ',name,ext,found.w+'x'+found.h,'Punkte',found.score,found.src.slice(0,90))}
 }catch(e){console.log('FEHL',name,e.message.split('\n')[0].slice(0,100))}
 await ctx.close()}
await b.close()})();
