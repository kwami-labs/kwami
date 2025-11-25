/**
 * Service Worker for Kwami.io
 * Provides offline support and caching for better performance
 */

const CACHE_NAME = 'kwami-v1.5.8';
const STATIC_CACHE = 'kwami-static-v2';
const DYNAMIC_CACHE = 'kwami-dynamic-v2';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => {
      console.log('[SW] Service worker installed');
      return self.skipWaiting();
    })
  );
});

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Skip analytics requests
  if (url.hostname.includes('google-analytics.com') || 
      url.hostname.includes('googletagmanager.com')) {
    return;
  }

  // DEVELOPMENT MODE: Network-first strategy for localhost
  const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
  
  if (isLocalhost) {
    // Network-first for development
    event.respondWith(
      fetch(request).then((response) => {
        // Clone and cache the response
        if (response && response.status === 200) {
          const responseToCache = response.clone();
          const cacheName = isStaticAsset(url) ? STATIC_CACHE : DYNAMIC_CACHE;
          caches.open(cacheName).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // Fallback to cache if network fails
        return caches.match(request).then((cachedResponse) => {
          return cachedResponse || caches.match('/index.html');
        });
      })
    );
    return;
  }

  // PRODUCTION MODE: Cache-first strategy
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version
        console.log('[SW] Serving from cache:', request.url);
        return cachedResponse;
      }

      // Fetch from network and cache
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Determine which cache to use
        const cacheName = isStaticAsset(url) ? STATIC_CACHE : DYNAMIC_CACHE;

        caches.open(cacheName).then((cache) => {
          // Don't cache very large files (>5MB)
          const contentLength = response.headers.get('content-length');
          if (!contentLength || parseInt(contentLength) < 5 * 1024 * 1024) {
            cache.put(request, responseToCache);
            console.log('[SW] Cached:', request.url);
          }
        });

        return response;
      }).catch((error) => {
        console.error('[SW] Fetch failed:', error);
        
        // Return offline page if available
        return caches.match('/index.html').then((response) => {
          return response || new Response('Offline - Please check your connection', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      });
    })
  );
});

// Helper function to determine if asset is static
function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.woff', '.woff2', '.ttf', '.eot', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.ico'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

// Handle messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});

// Listen for push notifications (future feature)
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('Kwami', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[SW] Service worker script loaded');

