const CACHE_NAME = 'briconomy-v2';
const STATIC_CACHE = [
  '/',
  '/src/main.tsx',
  '/src/App.tsx',
  '/src/styles/global.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
   
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }
  
  const isDoc = event.request.destination === 'document' || event.request.mode === 'navigate';
  const isModule = event.request.destination === 'script' || url.pathname.startsWith('/src/');

  if (isDoc || isModule) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              // Double-check URL protocol before caching
              if (event.request.url.startsWith('http')) {
                cache.put(event.request, copy);
              }
            });
          }
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            // Double-check URL protocol before caching
            if (event.request.url.startsWith('http')) {
              cache.put(event.request, copy);
            }
          });
        }
        return response;
      });
    })
  );
});