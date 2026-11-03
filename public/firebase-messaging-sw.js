/* Push alerts for Srisun admins (Firebase Cloud Messaging). Registered only
 * when an admin turns notifications on, under its own scope so it never
 * controls or caches site pages. Messages are data-only: { title, body, url }. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data?.json()?.data || {}; } catch { /* not JSON */ }
  const url = typeof data.url === 'string' && new URL(data.url, self.location.origin).origin === self.location.origin
    ? data.url : '/admin/enquiries';
  event.waitUntil(self.registration.showNotification(data.title || 'Srisun admin', {
    body: data.body || 'You have a new notification.',
    icon: '/assets/srisun-favicon.png',
    badge: '/assets/srisun-favicon.png',
    tag: url,
    data: { url }
  }));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = new URL(event.notification.data?.url || '/admin/enquiries', self.location.origin).href;
  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const admin = windows.find((client) => new URL(client.url).pathname.startsWith('/admin'));
    if (admin) { await admin.focus(); return admin.navigate(url); }
    return self.clients.openWindow(url);
  })());
});
