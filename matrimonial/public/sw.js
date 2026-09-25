const CACHE_NAME = 'haldimehendi-v2';
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const isDev =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  self.location.hostname.startsWith('192.168.');

// Install event - cache static assets
self.addEventListener('install', (event) => {
  if (isDev) {
    self.skipWaiting();
    return;
  }
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  if (isDev) {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames.map((name) => caches.delete(name)));
      }).then(() => self.registration.unregister())
    );
    return;
  }
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  if (isDev) return;

  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip API routes, auth routes, admin routes, and Next.js internal/chunk requests
  // Next.js chunks have content hashes and immutable HTTP headers; caching them in SW causes chunk mismatch errors
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/') ||
    url.pathname.startsWith('/admin/') ||
    url.pathname.startsWith('/_next/')
  ) {
    return;
  }

  // Strategy: Cache first for static images and manifest
  const isStaticAsset =
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/images/') ||
    url.pathname === '/manifest.json';

  if (isStaticAsset) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request).then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
  } else {
    // Network first for pages (HTML)
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            if (request.mode === 'navigate') {
              return caches.match('/');
            }
            return new Response('Offline', { status: 503 });
          });
        })
    );
  }
});

// Background sync for offline actions (optional)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-interests') {
    event.waitUntil(syncInterests());
  }
});

async function syncInterests() {
  console.log('Background sync triggered');
}