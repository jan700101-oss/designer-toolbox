const PREFIX = 'designer-toolbox-' + new URL(self.registration.scope).pathname.replace(/[^a-z0-9]/gi, '-') + '-';
const CACHE = PREFIX + 'v6';
const ASSETS = ['./', './index.html', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith(PREFIX) && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const html = event.request.mode === 'navigate' || url.pathname.endsWith('/index.html');
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) event.waitUntil(caches.open(CACHE).then(cache => cache.put(event.request, response.clone())));
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request);
    return cached || (html ? await caches.match('./index.html') : null) || Response.error();
  }));
});
