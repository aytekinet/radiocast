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
  const url = event.request.url;

  // Never intercept live media streaming or audio proxies in service worker
  // This prevents audio pipeline resets and ensures background/lock screen audio never stalls
  if (
    url.includes('/api/radio/') ||
    url.includes('/api/podcasts/') ||
    url.includes('.m3u8') ||
    url.includes('.mp3') ||
    url.includes('.aac') ||
    url.includes('.m4a') ||
    url.includes('.ts') ||
    url.includes('corsproxy.io') ||
    url.includes('allorigins.win')
  ) {
    return;
  }

  // Direct pass-through to network for other assets
  event.respondWith(
    fetch(event.request).catch(() => {
      return new Response('', { status: 408, statusText: 'Request timed out' });
    })
  );
});
