const CACHE_VERSION = 'v1.0.1';
const STATIC_CACHE = `flavorcore-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `flavorcore-dynamic-${CACHE_VERSION}`;
const API_CACHE = `flavorcore-api-${CACHE_VERSION}`;

// Essential files to cache for offline functionality
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Install event - cache essential assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker version:', CACHE_VERSION);
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting(); // Force activate immediately
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker version:', CACHE_VERSION);
  
  const currentCaches = [STATIC_CACHE, DYNAMIC_CACHE, API_CACHE];
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete any cache that's not in our current cache list
            if (!currentCaches.includes(cacheName)) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated and old caches cleaned');
        return self.clients.claim(); // Take control of all pages immediately
      })
  );
});

// Fetch event - implement smart caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Strategy 1: Network First for API calls (with fallback to cache)
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request, API_CACHE));
    return;
  }

  // Strategy 2: Cache First for static assets
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/) ||
    STATIC_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Strategy 3: Network First for HTML pages (with cache fallback)
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

// Network First Strategy - try network, fallback to cache
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback if available
    return new Response('Offline - Content not available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Cache First Strategy - try cache, fallback to network
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    // Cache the new response
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Fetch failed:', error);
    throw error;
  }
}

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'worker-registration') {
    event.waitUntil(syncWorkerRegistrations());
  }
  
  if (event.tag === 'sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icons/flavorcore-logo-192x192.png',
    badge: '/icons/favicon-32x32.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };
  
  event.waitUntil(
    self.registration.showNotification('RelishAgro', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Sync functions
async function syncWorkerRegistrations() {
  try {
    console.log('[SW] Syncing worker registrations...');
    // Your sync logic here
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Worker registration sync failed:', error);
    throw error;
  }
}

async function syncOfflineData() {
  try {
    console.log('[SW] Syncing offline data...');
    // Your offline data sync logic here
    return Promise.resolve();
  } catch (error) {
    console.error('[SW] Offline data sync failed:', error);
    throw error;
  }
}

// Message handler for communication with main app
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});