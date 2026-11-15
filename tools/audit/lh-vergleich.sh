#!/bin/bash
# usage: lh-vergleich.sh <runs> <label=url> ...
cd "$(dirname "$0")"; runs=$1; shift
for pair in "$@"; do label=${pair%%=*}; url=${pair#*=}; rm -f lh/$label-*.json; bash lh-run.sh "$url" "$label" "$runs" >/dev/null 2>&1
node -e "
const fs=require('fs');const fsn=fs.readdirSync('lh').filter(f=>/^$label-\d+\.json$/.test(f));const med=a=>{a=[...a].sort((x,y)=>x-y);return a[Math.floor(a.length/2)]};
const rs=fsn.map(f=>JSON.parse(fs.readFileSync('lh/'+f)));const m=k=>rs.map(r=>Math.round(r.audits.metrics.details.items[0][k]));
console.log('$label'.padEnd(12),'Perf',rs.map(r=>Math.round(r.categories.performance.score*100)).join('/'),'| FCP',med(m('firstContentfulPaint')),'| LCP',med(m('largestContentfulPaint')),'('+m('largestContentfulPaint').join('/')+')','| SI',med(m('speedIndex')),'| TBT',m('totalBlockingTime').join('/'),'| CLS',rs.map(r=>r.audits['cumulative-layout-shift'].numericValue.toFixed(3)).join('/'),'| beob. FCP',med(m('observedFirstContentfulPaint')),'LCP',med(m('observedLargestContentfulPaint')),'|',rs[0].audits['largest-contentful-paint-element'].details.items[0].items[0].node.selector.slice(-28))"
done
