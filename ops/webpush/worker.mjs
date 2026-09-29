import fs from 'node:fs';
import webpush from 'web-push';

const gateway = 'https://boihlgodmclljtckhmgz.supabase.co/functions/v1/vendor-push-gateway';
const workerKey = fs.readFileSync('/opt/delikreol-whatsapp/secrets/worker-key', 'utf8').trim();
const vapid = JSON.parse(fs.readFileSync('/opt/delikreol-webpush-worker/vapid.json', 'utf8'));
webpush.setVapidDetails('mailto:vladimir.claveau@gmail.com', vapid.publicKey, vapid.privateKey);

async function gatewayCall(body) {
  const response = await fetch(gateway, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-delikreol-worker-key': workerKey },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(`gateway ${response.status}: ${data.error || 'unknown'}`);
  return data;
}

async function disableSubscription(subscriptionId) {
  try { await gatewayCall({ action: 'disable_subscription', subscription_id: subscriptionId }); }
  catch (error) { console.error('[webpush] disable failed', String(error)); }
}
async function processItem(item) {
  const subscriptions = Array.isArray(item.subscriptions) ? item.subscriptions : [];
  if (subscriptions.length === 0) {
    await gatewayCall({ action: 'ack', id: item.id, status: 'no_subscription', last_error: 'Aucun appareil traiteur abonné aux notifications Web Push.' });
    return;
  }
  const payload = JSON.stringify({
    title: `DELIKREOL — ${item.order_number || 'Nouvelle commande'}`,
    body: item.message || 'Une commande attend votre réponse.',
    tag: `delikreol-${item.order_number || item.id}`,
    url: '/espace-partenaire/commandes',
  });
  let sent = 0;
  const errors = [];
  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, { TTL: 300, urgency: 'high' });
      sent += 1;
    } catch (error) {
      const status = Number(error?.statusCode || 0);
      if (status === 404 || status === 410) await disableSubscription(sub.id);
      errors.push(`${status || 'ERR'}:${String(error?.body || error?.message || error).slice(0, 180)}`);
    }
  }
  await gatewayCall({ action: 'ack', id: item.id, status: sent > 0 ? 'sent' : 'failed', provider_message_id: sent > 0 ? `webpush:${sent}` : null, last_error: errors.join(' | ').slice(0, 500) || null });
}
async function tick() {
  const { items = [] } = await gatewayCall({ action: 'pull_webpush' });
  for (const item of items) {
    try { await processItem(item); }
    catch (error) { console.error('[webpush] item failed', item?.id, String(error)); }
  }
  return items.length;
}

console.log('[webpush] worker started');
for (;;) {
  try {
    const count = await tick();
    if (count > 0) console.log(`[webpush] processed ${count} queued notification(s)`);
  } catch (error) {
    console.error('[webpush] tick failed', String(error));
  }
  await new Promise((resolve) => setTimeout(resolve, 10000));
}
