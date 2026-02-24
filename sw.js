self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const action = event.action;
    const data = event.notification.data || {};

    if(action === 'approve' || action === 'reject') {
        event.waitUntil(
            clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
                if(list.length > 0) {
                    list[0].focus();
                    list[0].postMessage({ 
                        type: action === 'approve' ? 'APPROVE_ORDER' : 'REJECT_ORDER', 
                        orderId: data.orderId 
                    });
                }
            })
        );
    } else {
        event.waitUntil(
            clients.matchAll({type:'window', includeUncontrolled:true}).then(list => {
                if(list.length > 0) list[0].focus();
                else clients.openWindow('/yonetimpaneli');
            })
        );
    }
});

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
