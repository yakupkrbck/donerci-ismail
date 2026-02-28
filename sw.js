// Dönerci İsmail - PWA Service Worker
const CACHE_NAME = 'donerci-ismail-v1';
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
  if (event.request.url.includes('firestore') || event.request.url.includes('googleapis') || event.request.url.includes('firebase')) return;
  event.respondWith(
    fetch(event.request).then(res => {
      if (res && res.status===200 && res.type==='basic') {
        caches.open(CACHE_NAME).then(c => c.put(event.request, res.clone()));
      }
      return res;
    }).catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(self.registration.showNotification(data.notification?.title||'Dönerci İsmail', {
    body: data.notification?.body||'',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-96.png',
    tag: 'doner-order',
    renotify: true
  }));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({type:'window'}).then(list => list.length>0 ? list[0].focus() : clients.openWindow('/')));
});
