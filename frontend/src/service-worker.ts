/**
 * Service Worker for Pride Training App PWA
 * Implements cache-first strategy for static assets and network-first for API calls
 */

declare const self: ServiceWorkerGlobalScope;

const CACHE_PREFIX = 'pride-app';
const CACHE_VERSION = 'v1';
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;
const OFFLINE_PAGE = '/offline.html';

// Assets to precache on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/offline.html',
];

// Install event - precache essential assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precaching essential assets');
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('[SW] Precaching failed:', err);
        // Continue even if precache fails
        return Promise.resolve();
      });
    }).then(() => {
      // Force the waiting service worker to become the active service worker
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Delete old cache versions
          if (cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
          return Promise.resolve();
        })
      );
    }).then(() => {
      // Claim all clients immediately
      return self.clients.claim();
    })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Network-first strategy for API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request);
          // Cache successful responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        } catch {
          // Fall back to cache for API calls
          const cachedResponse = await caches.match(request);
          if (cachedResponse) {
            console.log('[SW] Returning cached API response:', url.pathname);
            return cachedResponse;
          }
          // Return offline page if no cache
          const offlineResponse = await caches.match(OFFLINE_PAGE);
          return offlineResponse ||
            new Response('Offline - Resource not available', {
              status: 503,
              statusText: 'Service Unavailable',
            });
        }
      })()
    );
    return;
  }

  // Cache-first strategy for static assets
  if (
    url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot)$/i) ||
    url.pathname.startsWith('/icons/')
  ) {
    event.respondWith(
      (async () => {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }

        try {
          const response = await fetch(request);
          // Cache successful responses
          if (response && response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        } catch {
          console.log('[SW] Asset not available:', url.pathname);
          return new Response('Asset not available offline', {
            status: 404,
          });
        }
      })()
    );
    return;
  }

  // Network-first for HTML pages (but cache if offline)
  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      } catch {
        // Try cache first
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
          return cachedResponse;
        }
        // Return offline page for HTML requests
        if (request.headers.get('accept')?.includes('text/html')) {
          const offlineResponse = await caches.match(OFFLINE_PAGE);
          return offlineResponse ||
            new Response('Offline - Page not available', {
              status: 503,
              statusText: 'Service Unavailable',
            });
        }
        return new Response('Offline', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      }
    })()
  );
});

// Handle messages from clients (for update notifications, etc)
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  console.log('[SW] Message received:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

export {};
