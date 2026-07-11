// sw.js — Service Worker for Hotel Book Email Generator (index2.html)
// Version: 2.1.9 — Cache bust only
// v2.1.9 changes vs v2.1.8:
//   - Cache bust only: force clients to re-fetch index2.html
//   - No SW behavior change — only CACHE_VERSION bump to ship the new code
// v2.1.8 changes vs v2.1.4:
//   - Cache bust only: force clients to re-fetch index2.html
//   - No SW behavior change — only CACHE_VERSION bump to ship the new code
// v2.1.4 changes vs v2.1.3:
//   - Cache bust only: force clients to re-fetch index2.html (now uses img saveToGoogleSheets)
//   - No SW behavior change — only CACHE_VERSION bump to ship the new code
// v2.1.3 changes vs v2.1.2:
//   - CACHE_VERSION bumped 2.1.2 -> 2.1.3 so old SW (cached 2.1.1 HTML) gets purged
//   - Forces one fresh fetch of index2.html from network on next page load
//   - No code behavior change — only cache busting

const CACHE_VERSION = 'v2.1.9';
const CACHE_NAME = `akang-tool-${CACHE_VERSION}`;

const APP_SHELL = [
  './index.html',
  './index2.html',
  './manifest.webmanifest',
  './favicon.svg',
  './favicon.ico',
  './vendor/xlsx.full.min.js',
  './vendor/litepicker.js',
  './vendor/litepicker.css',
];

// ---------------------------------------------------------------------------
// Install: pre-cache app shell. Tolerant — a single 404 won't kill the install.
// ---------------------------------------------------------------------------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Add each URL independently so one missing file doesn't abort the whole cache.
      await Promise.all(
        APP_SHELL.map(url =>
          cache.add(url).catch(err => {
            console.warn(`[SW] Failed to cache ${url}: ${err.message}`);
          })
        )
      );
    }).then(() => self.skipWaiting())
  );
});

// ---------------------------------------------------------------------------
// Activate: clear stale caches (different version).
// ---------------------------------------------------------------------------
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key.startsWith('akang-tool-'))
          .map(key => {
            console.log(`[SW] Deleting old cache: ${key}`);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Fetch strategy:
//   - Same-origin HTML/navigation: network-first, cache fallback (always up-to-date online)
//   - Same-origin static asset (vendor/, manifest, favicon): cache-first
//   - Cross-origin: pass-through (no offline support, but won't break anything)
//   - HTML requests with ?_cb cache-buster: bypass SW (used by "Check Update" flow)
// ---------------------------------------------------------------------------
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Cache-buster (?_cb=...) is how the page forces a fresh HTML load. Don't intercept.
  if (url.searchParams.has('_cb')) return;

  // Cross-origin: pass-through (CDN resources were vendored locally, so this is mostly dead code).
  if (url.origin !== self.location.origin) return;

  const isNavigation = request.mode === 'navigate'
    || (request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    // Network-first for HTML.
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        })
        .catch(() =>
          caches.match(request).then(cached =>
            cached || caches.match('./index2.html')
          )
        )
    );
    return;
  }

  // Cache-first for static assets.
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => {
        // Offline + uncached asset: give a useful error.
        return new Response(`Offline: ${url.pathname} not in cache`, {
          status: 503,
          statusText: 'Service Unavailable',
        });
      });
    })
  );
});

// ---------------------------------------------------------------------------
// Messages: page can request immediate activation of a waiting SW.
// ---------------------------------------------------------------------------
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});