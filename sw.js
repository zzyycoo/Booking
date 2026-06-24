// sw.js — Service Worker for Hotel Book Email Generator (index2.html)
// Version: 2.0.59 — Cache-first, full offline

const CACHE_NAME = 'akang-tool-v2059';
const CACHE_URLS = [
  './index2.html',
  './manifest.webmanifest',
];

// Install: cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(CACHE_URLS);
    }).then(() => self.skipWaiting())
  );
});

// Activate: clear old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch: Cache-first strategy
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  const isCached = CACHE_URLS.some(u => {
    const cu = new URL(u, event.request.url);
    return url.pathname === cu.pathname || url.href.includes(u);
  });

  if (!isCached) return;

  // Skip cache-first for cache-busted requests (force-update flow bypasses SW cache)
  if (url.searchParams.has('_cb')) {
    return fetch(event.request);
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(event.request).then(cached => {
        if (cached) return cached;

        return fetch(event.request).then(response => {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => {
          if (url.href.includes('index2.html')) {
            return caches.match('./index2.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
    )
  );
});

// Handle skipWaiting message from page
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
