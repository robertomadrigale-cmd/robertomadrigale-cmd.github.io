const CACHE='roka-bajo-20261026212219',SMPC='roka-bajo-muestras-v1';
const SHELL=['./','index.html','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('roka-bajo-')&&k!==CACHE&&k!==SMPC).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);if(u.origin!==location.origin||e.request.method!=='GET')return;
 if(u.pathname.includes('/samples/')){e.respondWith(caches.open(SMPC).then(async c=>{const hit=await c.match(e.request);if(hit)return hit;const r=await fetch(e.request);if(r.ok)await c.put(e.request,r.clone());return r}));return}
 const scope=new URL(self.registration.scope).pathname;if(!u.pathname.startsWith(scope)&&!u.pathname.includes('/fonts/'))return;
 if(e.request.mode==='navigate'){e.respondWith(fetch(e.request).then(async r=>{if(r.ok){const c=await caches.open(CACHE);await c.put('index.html',r.clone())}return r}).catch(()=>caches.match('index.html')));return}
 e.respondWith(caches.match(e.request).then(hit=>hit||fetch(e.request).then(async r=>{if(r.ok){const c=await caches.open(CACHE);await c.put(e.request,r.clone())}return r})));
});
