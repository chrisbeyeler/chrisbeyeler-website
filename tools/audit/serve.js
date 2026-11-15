// Statischer Server mit gzip und Cache-Header wie GitHub Pages. usage: node serve.js <root> <port>
// Mit LATENZ=80 antwortet jede Anfrage 80 ms verzögert (wie ein echtes Netz; wichtig für Messungen der Lade-Reihenfolge).
const http=require('http'),fs=require('fs'),path=require('path'),zlib=require('zlib');
const [root,port]=process.argv.slice(2);
const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'application/javascript; charset=utf-8','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.woff':'font/woff','.mp4':'video/mp4','.txt':'text/plain; charset=utf-8','.xml':'application/xml'};
const LATENZ=+(process.env.LATENZ||0);
http.createServer((req0,res0)=>{setTimeout(()=>handle(req0,res0),LATENZ)}).listen(+port,()=>console.log('serving',root,port,'Latenz',LATENZ));
function handle(req,res){let p=decodeURIComponent(req.url.split('?')[0]);if(p.endsWith('/'))p+='index.html';const f=path.join(root,p);
 if(!f.startsWith(path.resolve(root))||!fs.existsSync(f)||fs.statSync(f).isDirectory()){res.writeHead(404);return res.end('404')}
 const ext=path.extname(f);const h={'Content-Type':types[ext]||'application/octet-stream','Cache-Control':'max-age=600'};
 const buf=fs.readFileSync(f);
 if(/\.(html|css|js|json|svg|txt|xml)$/.test(ext)&&/gzip/.test(req.headers['accept-encoding']||'')){h['Content-Encoding']='gzip';const z=zlib.gzipSync(buf);h['Content-Length']=z.length;res.writeHead(200,h);return res.end(z)}
 h['Content-Length']=buf.length;res.writeHead(200,h);res.end(buf)}
