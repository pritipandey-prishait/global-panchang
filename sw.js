// Global Panchang Service Worker
const CACHE_NAME = 'global-panchang-v1';
const ASSETS = ['/', '/index.html', '/manifest.json'];

// Install — cache core files
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache (so app works offline)
self.addEventListener('fetch', (e) => {
  // Skip API calls and non-GET requests
  if (e.request.method !== 'GET' || e.request.url.includes('api.anthropic.com')) return;
  
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, resClone));
        return res;
      })
      .catch(() => caches.match(e.request).then((cached) => cached || caches.match('/')))
  );
});
