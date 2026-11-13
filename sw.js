// Starlane Trader offline support: cache the game files on first visit, then serve them offline.
const CACHE='starlane-v2';
const FILES=['./','index.html','css/app.css','css/site.css','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','js/site.js','js/questions-pack.js','js/retro.js','js/games.js','js/voices.js','js/speech.js','js/starlane-audio.js','js/starlane-modern.js','js/starlane-adventures.js','js/starlane.js','js/arcade.js','js/vendor/three-bundle.js'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(CACHE).then(c=>c.put(e.request,cp)).catch(()=>{});return r;}).catch(()=>caches.match(e.request,{ignoreSearch:true})));});
