// Dönerci İsmail - PWA Service Worker
const CACHE_NAME = 'donerci-ismail-v2';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json', '/icons/icon-192.png', '/icons/icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Firebase / Google isteklerini SW'den geçirme
  const url = event.request.url;
  if (
    url.includes('firestore') ||
    url.includes('googleapis') ||
    url.includes('firebase') ||
    url.includes('gstatic') ||
    url.includes('fonts.') ||
    url.includes('cdnjs.')
  ) return;

  // Sadece GET isteklerini cache'le
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(res => {
        // Geçersiz response'u cache'leme
        if (!res || res.status !== 200 || res.type !== 'basic') {
          return res;
        }
        // Clone ÖNCE alınmalı — body sadece bir kez okunabilir
        const resClone = res.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, resClone);
        });
        return res;
      })
      .catch(() => {
        // Network yoksa cache'ten sun
        return caches.match(event.request).then(cached => {
          return cached || new Response('Offline', { status: 503 });
        });
      })
  );
});

self.addEventListener('push', event => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch(e) { return; }
  event.waitUntil(
    self.registration.showNotification(data.notification?.title || 'Dönerci İsmail', {
      body: data.notification?.body || '',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: 'doner-order',
      renotify: true
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(list => list.length > 0 ? list[0].focus() : clients.openWindow('/'))
  );
});
