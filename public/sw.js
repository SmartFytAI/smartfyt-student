// SmartFyt Student PWA Service Worker
const CACHE_NAME = 'smartfyt-student-v1';
const API_CACHE_NAME = 'smartfyt-api-v1';

// Static assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icon-192x192.svg',
  '/icon-512x512.svg',
  '/offline.html'
];

// API endpoints to cache for offline
const API_ENDPOINTS = [
  '/health',
  '/sports',
  '/schools'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
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
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
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
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle API requests with network-first strategy
  if (url.origin === self.location.origin && url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME)
        .then((cache) => {
          return fetch(request)
            .then((response) => {
              // Cache successful responses
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Return cached version on network failure
              return cache.match(request)
                .then((cached) => {
                  if (cached) {
                    console.log('[SW] Serving cached API response:', request.url);
                    return cached;
                  }
                  // Return offline page for failed API requests
                  return new Response(
                    JSON.stringify({ 
                      error: 'Offline - No cached data available',
                      status: 503 
                    }),
                    {
                      status: 503,
                      headers: { 'Content-Type': 'application/json' }
                    }
                  );
                });
            });
        })
    );
    return;
  }

  // Handle external API requests (SmartFyt API)
  if (url.hostname === 'localhost' && url.port === '3001') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(API_CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Try to serve from cache
          return caches.match(request)
            .then((cached) => {
              if (cached) {
                console.log('[SW] Serving cached external API response:', request.url);
                return cached;
              }
              // Return offline response
              return new Response(
                JSON.stringify({ 
                  error: 'API offline - using cached data',
                  status: 503 
                }),
                {
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            });
        })
    );
    return;
  }

  // Handle static assets with cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((cached) => {
        if (cached) {
          console.log('[SW] Serving cached asset:', request.url);
          return cached;
        }

        // Fetch and cache new assets
        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseClone);
                });
            }
            return response;
          })
          .catch(() => {
            // Return offline page for failed navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html');
            }
            // Return a basic offline response for other assets
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});

// Handle background sync for when connection is restored
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background tasks when online
      self.clients.matchAll()
        .then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'SYNC_COMPLETE',
              message: 'App is back online!'
            });
          });
        })
    );
  }
});

// Handle push notifications (for future implementation)
self.addEventListener('push', (event) => {
  console.log('[SW] Push message received:', event);
  
  const options = {
    body: event.data ? event.data.text() : 'New SmartFyt notification',
    icon: '/icon-192x192.svg',
    badge: '/icon-96x96.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icon-96x96.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-96x96.svg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('SmartFyt Student', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received:', event);
  
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

console.log('[SW] Service worker script loaded successfully'); 