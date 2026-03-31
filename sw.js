// Dönerci İsmail - Service Worker
const CACHE = 'di-v2';
const OFFLINE_URLS = ['/siparis-1.html', '/manifest.json', '/icons/icon-192.png'];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE).then(c => c.addAll(OFFLINE_URLS)).catch(() => {})
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    // Sadece GET isteklerini önbellekle
    if (e.request.method !== 'GET') return;
    
    // Firebase, Netgsm, dış API'leri atla
    const url = e.request.url;
    if (url.includes('firestore.googleapis.com') ||
        url.includes('firebase') ||
        url.includes('netgsm') ||
        url.includes('workers.dev') ||
        url.includes('googleapis.com') ||
        url.includes('gstatic.com') ||
        url.includes('fonts.') ||
        url.includes('cdnjs.') ||
        url.includes('mixkit.')) {
        return; // SW'yi atla, direkt fetch
    }

    e.respondWith(
        fetch(e.request)
            .then(response => {
                // Geçerli response'u önbelleğe al
                if (response && response.status === 200 && response.type === 'basic') {
                    const toCache = response.clone(); // önce clone, sonra kullan
                    caches.open(CACHE).then(c => c.put(e.request, toCache));
                }
                return response;
            })
            .catch(() => {
                // Ağ yoksa önbellekten sun
                return caches.match(e.request)
                    .then(cached => cached || caches.match('/siparis-1.html'));
            })
    );
});

// Push bildirimi
self.addEventListener('push', e => {
    let data = { title: '🔔 Yeni bildirim', body: '' };
    try { data = { ...data, ...e.data.json() }; } catch (err) {}

    e.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/icons/icon-192.png',
            badge: '/icons/icon-192.png',
            tag: 'order-update',
            renotify: true,
            data: { url: data.url || '/siparis-1.html' }
        })
    );
});

// Bildirime tıklanınca
self.addEventListener('notificationclick', e => {
    e.notification.close();
    const url = e.notification.data?.url || '/siparis-1.html';
    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            for (const client of list) {
                if (client.url.includes('siparis') && 'focus' in client) return client.focus();
            }
            return clients.openWindow(url);
        })
    );
});
