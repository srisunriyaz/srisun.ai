/* Retired service worker. Browsers that installed the earlier PWA fetch this
 * on their next visit; it clears Srisun caches, unregisters itself and reloads
 * open tabs so they load straight from the network. Safe to delete once old
 * visitors have cycled through (a few weeks). */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((key) => key.startsWith('srisun-')).map((key) => caches.delete(key)));
    await self.registration.unregister();
    const windows = await self.clients.matchAll({ type: 'window' });
    windows.forEach((client) => client.navigate(client.url));
  })());
});
