const CACHE_NAME = 'lifexp-cache-v1';

const scopeUrl = new URL(self.registration.scope);
const appShell = [
  scopeUrl.href,
  new URL('manifest.webmanifest', scopeUrl).href,
  new URL('favicon.svg', scopeUrl).href,
  new URL('icons.svg', scopeUrl).href,
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(appShell)).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== location.origin || !url.pathname.startsWith(scopeUrl.pathname)) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request)
        .then((response) => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => {
          if (request.mode === 'navigate') return caches.match(scopeUrl.href);
          return cached;
        });

      return cached ?? fetched;
    }),
  );
});
