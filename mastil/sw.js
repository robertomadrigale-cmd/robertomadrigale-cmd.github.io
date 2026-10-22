const CACHE='mastil-20261022132525';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png',
'fonts/barlow-condensed-latin-800-normal.woff2','fonts/source-sans-3-latin-400-normal.woff2','fonts/source-sans-3-latin-600-normal.woff2','fonts/source-sans-3-latin-700-normal.woff2','fonts/ibm-plex-mono-latin-500-normal.woff2','fonts/ibm-plex-mono-latin-600-normal.woff2'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
const SMPC='roka-muestras-v1';
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==SMPC).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r,{cache:'no-store'}).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('index.html',cp));return res}).catch(()=>caches.match('index.html')));
    return;
  }
  // las muestras de sonido no cambian: van en su propio caché que sobrevive a las actualizaciones
  if(new URL(r.url).pathname.includes('/samples/')){e.respondWith(caches.open(SMPC).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok)c.put(r,res.clone());return res}))));return}
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res})));
});
