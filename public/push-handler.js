self.addEventListener('push', (event) => {
  let payload = {};
  try { payload = event.data ? event.data.json() : {}; } catch { payload = { body: event.data?.text() || '' }; }
  const title = payload.title || 'DELIKREOL — Nouvelle commande';
  const options = {
    body: payload.body || 'Une nouvelle commande attend votre réponse.',
    icon: '/branding/app-icon.svg',
    badge: '/branding/logo-mark.svg',
    tag: payload.tag || 'delikreol-order',
    renotify: true,
    data: { url: payload.url || '/espace-partenaire/commandes' },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || '/espace-partenaire/commandes', self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windows) => {
    const existing = windows.find((client) => client.url.startsWith(self.location.origin));
    if (existing) return existing.navigate(target).then(() => existing.focus());
    return clients.openWindow(target);
  }));
});
