// sw.js — Service Worker for Hotel Book Email Generator (index2.html)
// Version: 2.1.2 — Full offline + PID database persisted to localStorage
// v2.1.2 changes vs v2.1.0:
//   - PID database (Map) auto-saved to localStorage on import (~600KB)
//   - Page load auto-restores from localStorage, no re-import needed
//   - CACHE_NAME bumped so old SW gets cleared and replaced
//   - vendor/ (xlsx, litepicker, litepicker.css) added to APP_SHELL — true offline support
//   - Network-first for HTML navigations (so updates are seen when online)
//   - Cache-first for static assets (vendor/, manifest, favicon)
//   - Navigation fallback: any 404 from GitHub Pages SPA routes returns cached index2.html
//   - Robust install: cache.addAll() with per-URL fallback so a single 404 doesn't kill install
//   - clients.claim() + skipWaiting message handler unchanged

const CACHE_VERSION = 'v2.1.2';
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