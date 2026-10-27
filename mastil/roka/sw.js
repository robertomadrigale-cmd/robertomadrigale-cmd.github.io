// Portada Om: guarda solo la portada para abrirla sin internet. Cada app tiene su propio service worker.
const C='om-portada-v1';
const FILES=['./','manifest.webmanifest','../icons/icon-192.png','../icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('om-portada-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request,u=new URL(r.url);
  if(r.method!=='GET'||u.origin!==location.origin)return;
  // primero la red (para recibir cambios), si no hay conexión lo guardado
  if(r.mode==='navigate'){
    if(!/\/roka\/(index\.html)?$/.test(u.pathname))return; // conoce/ y lo demás van directo a la red
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(C).then(c=>c.put('./',cp));return res}).catch(()=>caches.match('./')));
    return;
  }
  if(FILES.some(f=>new URL(f,location).href===u.href))e.respondWith(caches.match(r).then(m=>m||fetch(r)));
});
