const CACHE='roka-bajo-20261025110304',SMPC='roka-bajo-muestras-v1';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png'];
const SCOPE=new URL('./',self.location.href);
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('roka-bajo-')&&k!==CACHE&&k!==SMPC).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{
 const r=e.request,u=new URL(r.url);if(r.method!=='GET'||u.origin!==SCOPE.origin)return;
 if(u.pathname.includes('/samples/')){e.respondWith(caches.open(SMPC).then(async c=>{const hit=await c.match(r);if(hit)return hit;const res=await fetch(r);if(res.ok)await c.put(r,res.clone());return res}));return}
 if(!u.pathname.startsWith(SCOPE.pathname))return;
 if(r.mode==='navigate'){e.respondWith(caches.open(CACHE).then(async c=>{try{const res=await fetch(r,{cache:'no-store'});if(res.ok){await c.put(new URL('index.html',SCOPE).href,res.clone());return res}return await c.match('index.html')||res}catch(_){return await c.match('index.html')||Response.error()}}));return}
 if(SHELL.some(p=>new URL(p,SCOPE).href===u.href))e.respondWith(caches.open(CACHE).then(async c=>await c.match(r)||fetch(r)));
});
