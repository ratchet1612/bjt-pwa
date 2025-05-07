const CACHE_NAME = 'bjt-cache-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS)));
});

self.addEventListener('fetch',e=>{
  e.respondWith(
    caches.match(e.request).then(r=>r||fetch(e.request))
  );
});
