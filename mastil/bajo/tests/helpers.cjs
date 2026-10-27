const fs=require('node:fs'),path=require('node:path'),http=require('node:http');
const root=path.resolve(__dirname,'../../..');
const puppeteer=require(process.env.PUPPETEER_MODULE||process.env.TEMP+'/roka-bajo-qa-node/node_modules/puppeteer-core');
const executablePath=process.env.CHROME||process.env.LOCALAPPDATA+'/ms-playwright/chromium-1243/chrome-win64/chrome.exe';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
async function server(){try{const r=await fetch('http://localhost:8765/mastil/bajo/',{signal:AbortSignal.timeout(2000)});if(r.ok)return null}catch{}
 const s=http.createServer((req,res)=>{const u=new URL(req.url,'http://localhost'),rel=decodeURIComponent(u.pathname).replace(/^\//,'');let p=path.resolve(root,rel);if(!p.startsWith(root+path.sep)&&p!==root){res.writeHead(403);res.end();return}try{if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');res.setHeader('Content-Type',({'.html':'text/html; charset=utf-8','.js':'text/javascript','.mp3':'audio/mpeg','.woff2':'font/woff2','.png':'image/png','.webmanifest':'application/manifest+json'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p))}catch{res.writeHead(404);res.end()}});await new Promise(r=>s.listen(8765,r));return s;
}
const routes=(n=10)=>['','lecciones',...Array.from({length:n},(_,i)=>'leccion/'+(i+1)),'acordes','punteo',...Array.from({length:8},(_,i)=>'punteo/'+(i+1)),'cuenta','apariencia','practicar',...['metronomo','afinador','juego','pistas','rutina','reto','grabar','lento'].map(s=>'practicar/'+s),'logros','cancionero','cancionero/ver/pd0','cancionero/ver/pd0/lento','cancionero/editar/nueva','referencia',...['canciones','notas','acordes','explorar','glosario'].map(s=>'referencia/'+s)];
module.exports={fs,path,root,puppeteer,executablePath,delay,server,routes};
