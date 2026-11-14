const fs=require("fs");const label=process.argv[2];
const files=fs.readdirSync("lh").filter(f=>f.startsWith(label+"-")&&f.endsWith(".json"));
const med=a=>{a=[...a].sort((x,y)=>x-y);return a[Math.floor(a.length/2)]};
const rs=files.map(f=>JSON.parse(fs.readFileSync("lh/"+f)));
const m=k=>med(rs.map(r=>r.audits[k].numericValue));
const c=k=>med(rs.map(r=>Math.round(r.categories[k].score*100)));
const out={label,runs:rs.length,perf:c("performance"),a11y:c("accessibility"),bp:c("best-practices"),seo:c("seo"),
FCP_ms:Math.round(m("first-contentful-paint")),LCP_ms:Math.round(m("largest-contentful-paint")),TBT_ms:Math.round(m("total-blocking-time")),CLS:+m("cumulative-layout-shift").toFixed(3),SI_ms:Math.round(m("speed-index")),TTI_ms:Math.round(m("interactive")),
bytes:Math.round(m("total-byte-weight")),requests:med(rs.map(r=>r.audits["network-requests"].details.items.length)),
perfRange:rs.map(r=>Math.round(r.categories.performance.score*100)).join("/"),LCPrange:rs.map(r=>Math.round(r.audits["largest-contentful-paint"].numericValue)).join("/")};
console.log(JSON.stringify(out,null,1));
const r=rs[0];
const lcp=r.audits["largest-contentful-paint-element"]||r.audits["lcp-breakdown-insight"];
try{console.log("LCP el:",JSON.stringify(lcp.details.items.map(i=>i.items?i.items.map(x=>x.node?x.node.snippet:x):i)).slice(0,900))}catch(e){}
const rt=r.audits["resource-summary"]; if(rt) console.log(rt.details.items.map(i=>`${i.resourceType}:${i.requestCount}/${Math.round(i.transferSize/1024)}KB`).join(" "));
else{const by={};for(const i of r.audits["network-requests"].details.items){by[i.resourceType]=by[i.resourceType]||[0,0];by[i.resourceType][0]++;by[i.resourceType][1]+=i.transferSize}console.log(Object.entries(by).map(([k,v])=>`${k}:${v[0]}/${Math.round(v[1]/1024)}KB`).join(" "))}
console.log("top requests:");for(const i of [...r.audits["network-requests"].details.items].sort((a,b)=>b.transferSize-a.transferSize).slice(0,12))console.log(" ",Math.round(i.transferSize/1024)+"KB",i.resourceType,i.url.slice(0,110));
for(const cat of ["accessibility","seo","best-practices"]){for(const ref of r.categories[cat].auditRefs){const a=r.audits[ref.id];if(a.score!==null&&a.score<1)console.log("FAIL",cat,ref.id,"-",a.title,"|",(a.details&&a.details.items?a.details.items.length:"")+" items")}}
for(const id of ["render-blocking-resources","render-blocking-insight","unused-javascript","unused-css-rules","mainthread-work-breakdown","bootup-time","uses-long-cache-ttl","cache-insight","font-display","dom-size","dom-size-insight","modern-image-formats","uses-responsive-images","image-delivery-insight","third-party-summary","long-tasks"]){const a=r.audits[id];if(a)console.log("AUD",id,a.score,a.displayValue||"",a.details&&a.details.overallSavingsMs?("save "+a.details.overallSavingsMs+"ms"):"")}
fs.writeFileSync(`lh/${label}-summary.json`,JSON.stringify(out,null,1));
