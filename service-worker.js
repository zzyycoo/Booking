// Service Worker for Hotel Booking Email Generator PWA
const CACHE_NAME = 'booking-cache-v4';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Files cached successfully');
        return self.skipWaiting();
      })
      .catch((err) => {
        console.error('Service Worker: Cache failed:', err);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Now active');
      // Notify all clients that new version is active
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage('reload');
        });
      });
      return self.clients.claim();
    })
  );
});

// Fetch event - Cache First strategy with fallback
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html')
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('Service Worker: Serving cached page');
            return cachedResponse;
          }
          // Try network if not in cache
          return fetch(event.request)
            .catch(() => {
              console.log('Service Worker: Network failed, serving offline page');
              return caches.match('./index.html');
            });
        })
    );
    return;
  }

  // Handle other requests (assets, etc.)
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Cache successful GET responses
            if (event.request.method === 'GET' && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
              });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed:', error);
            // For HTML requests, return cached index
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('./index.html');
            }
          });
      })
  );
});
