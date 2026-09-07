// Service Worker Kill Switch
// Immediately unregisters itself and purges all cached assets to fix stuck blank screens.

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => {
      return self.registration.unregister();
    }).then(() => {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Direct pass-through to network, never fail or return undefined
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('', { status: 408, statusText: 'Request timed out' });
    })
  );
});
