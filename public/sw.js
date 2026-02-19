const CACHE_NAME = 'truescholar-v1';
const STATIC_CACHE = 'truescholar-static-v1';
const DYNAMIC_CACHE = 'truescholar-dynamic-v1';

const REQUIRED_STATIC_ASSETS = [
  '/',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

const OPTIONAL_STATIC_ASSETS = [
  '/manifest.webmanifest',
];

const API_PATTERNS = [
  /\/api\//,
];

const STATIC_PATTERNS = [
  /\.(?:js|css|woff|woff2|ttf|eot)$/,
  /\/_next\/static\//,
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);

    // Required assets must succeed for predictable offline boot.
    await cache.addAll(REQUIRED_STATIC_ASSETS);

    // Optional assets should not fail the entire service worker install.
    const optionalResults = await Promise.allSettled(
      OPTIONAL_STATIC_ASSETS.map((asset) => cache.add(asset))
    );

    optionalResults.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.warn('[SW] Optional precache failed:', OPTIONAL_STATIC_ASSETS[index], result.reason);
      }
    });
  })());
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') {
    return;
  }

  if (url.origin !== location.origin) {
    return;
  }

  if (STATIC_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  if (API_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request));
    return;
  }

  event.respondWith(networkFirst(request));
});

async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return new Response('Offline', { status: 503 });
  }
}

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
