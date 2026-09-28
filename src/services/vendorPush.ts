import { supabase } from '../lib/supabase';

export const WEB_PUSH_PUBLIC_KEY = 'BICmnocR6FoJA9Bp_j7A21IQkbTyr8wK9XxlyZmqjDfeL1VAwvZ5-W0GfNt0wP-cXTKN0x1d1vEl7ZZ2zg718QA';

export type VendorPushStatus = 'unsupported' | 'default' | 'denied' | 'granted' | 'subscribed';

function base64UrlToUint8Array(value: string) {
  const padding = '='.repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((char) => char.charCodeAt(0)));
}

export function getVendorPushStatus(): VendorPushStatus {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return 'unsupported';
  }
  return Notification.permission;
}

async function getCurrentVendor() {
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw userError || new Error('Session partenaire requise.');
  const { data: vendor, error: vendorError } = await supabase
    .from('vendors').select('id,user_id,is_active,status').eq('user_id', userData.user.id).eq('is_active', true).maybeSingle();
  if (vendorError) throw vendorError;
  if (!vendor?.id) throw new Error('Fiche traiteur active introuvable.');
  return { userId: userData.user.id, vendorId: vendor.id };
}
export async function enableVendorPush() {
  if (getVendorPushStatus() === 'unsupported') throw new Error('Notifications push non supportées sur cet appareil.');
  const permission = Notification.permission === 'granted' ? 'granted' : await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Autorisation de notification refusée.');

  const registration = await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToUint8Array(WEB_PUSH_PUBLIC_KEY),
    });
  }

  const { userId, vendorId } = await getCurrentVendor();
  const json = subscription.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) throw new Error('Abonnement push incomplet.');
  const payload = {
    vendor_id: vendorId,
    user_id: userId,
    endpoint: json.endpoint,
    p256dh: json.keys.p256dh,
    auth: json.keys.auth,
    user_agent: navigator.userAgent.slice(0, 500),
    last_seen_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    disabled_at: null,
  };
  const { error } = await supabase.from('vendor_push_subscriptions').upsert(payload, { onConflict: 'endpoint' });
  if (error) throw error;
  return subscription;
}
export async function refreshVendorPushStatus(): Promise<VendorPushStatus> {
  const status = getVendorPushStatus();
  if (status !== 'granted') return status;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  return subscription ? 'subscribed' : 'granted';
}

export async function disableVendorPush() {
  if (getVendorPushStatus() === 'unsupported') return;
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();
  if (!subscription) return;
  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await supabase.from('vendor_push_subscriptions')
    .update({ disabled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('endpoint', endpoint);
}
