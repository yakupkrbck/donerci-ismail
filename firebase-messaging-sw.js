importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
    apiKey: "AIzaSyBNpz1_e4eqKCsdTQJSOxBg4O9gF9qOWX8",
    authDomain: "donerci-ismail-siparis.firebaseapp.com",
    projectId: "donerci-ismail-siparis",
    storageBucket: "donerci-ismail-siparis.firebasestorage.app",
    messagingSenderId: "641245277881",
    appId: "1:641245277881:web:1faaac95dbb2fcd1abb568"
});

const messaging = firebase.messaging();

// Uygulama arka plandayken bildirim göster
messaging.onBackgroundMessage(payload => {
    const { title, body } = payload.notification || {};
    self.registration.showNotification(title || '🔔 Bildirim', {
        body: body || '',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        requireInteraction: false,
    });
});
