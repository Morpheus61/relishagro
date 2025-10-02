const CACHE_NAME = 'flavorcore-v1.0.0';
const STATIC_CACHE = 'flavorcore-static-v1';

// Essential files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request).then(fetchedResponse => {
        // Cache fetched response only if valid
        if (!fetchedResponse || fetchedResponse.status !== 200) return fetchedResponse;
        
        const responseToCache = fetchedResponse.clone();
        caches.open('static-cache').then(cache => {
          cache.put(event.request, responseToCache);
        });
        return fetchedResponse;
      });
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'worker-registration') {
    event.waitUntil(
      syncWorkerRegistrations()
    );
  }
});

// Sync functions
async function syncWorkerRegistrations() {
  try {
    console.log('[SW] Syncing worker registrations...');
    // Add your sync logic here
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}