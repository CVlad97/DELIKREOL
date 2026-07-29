export type WhatsAppOrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  vendor_id?: string | null;
  vendor?: { business_name?: string | null } | null;
};

export type WhatsAppOrderFingerprintInput = {
  items: WhatsAppOrderItem[];
  mode: string;
  commune: string;
  creneauText: string;
  notes: string;
  phone: string;
  email: string;
};

export type PreparedWhatsAppOrder = {
  idempotencyKey: string;
  orderId: string;
  orderNumber: string;
  whatsappUrl: string;
  persistedInSupabase: boolean;
  createdAt: string;
};

const STORAGE_PREFIX = 'delikreol_whatsapp_order_';
const LOCK_PREFIX = 'delikreol_whatsapp_order_lock_';
const LOCK_TTL_MS = 45_000;

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizePhone(value: string) {
  return value.replace(/\D/g, '');
}

function orderStorageKey(idempotencyKey: string) {
  return `${STORAGE_PREFIX}${idempotencyKey}`;
}

function orderLockKey(idempotencyKey: string) {
  return `${LOCK_PREFIX}${idempotencyKey}`;
}

async function sha256Hex(value: string) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

export function buildWhatsAppOrderFingerprint(input: WhatsAppOrderFingerprintInput) {
  return JSON.stringify({
    items: input.items
      .map((item) => ({
        id: item.id,
        quantity: item.quantity,
        vendor: item.vendor_id || item.vendor?.business_name || '',
      }))
      .sort((left, right) => `${left.vendor}:${left.id}`.localeCompare(`${right.vendor}:${right.id}`)),
    mode: input.mode,
    commune: normalizeText(input.commune),
    creneauText: normalizeText(input.creneauText),
    notes: normalizeText(input.notes),
    phone: normalizePhone(input.phone),
    email: normalizeText(input.email),
  });
}

export async function createWhatsAppIdempotencyKey(input: WhatsAppOrderFingerprintInput) {
  const hash = await sha256Hex(buildWhatsAppOrderFingerprint(input));
  return `public_manual_${hash.slice(0, 48)}`;
}

export function readPreparedWhatsAppOrder(idempotencyKey: string): PreparedWhatsAppOrder | null {
  try {
    const raw = localStorage.getItem(orderStorageKey(idempotencyKey));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PreparedWhatsAppOrder;
    if (!parsed?.idempotencyKey || !parsed.orderNumber || !parsed.whatsappUrl) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePreparedWhatsAppOrder(order: PreparedWhatsAppOrder) {
  localStorage.setItem(orderStorageKey(order.idempotencyKey), JSON.stringify(order));
}

export function tryAcquireWhatsAppOrderLock(idempotencyKey: string, now = Date.now()) {
  const key = orderLockKey(idempotencyKey);
  const owner = crypto.randomUUID();
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const current = JSON.parse(raw) as { owner?: string; expiresAt?: number };
      if (current.expiresAt && current.expiresAt > now) return null;
    }
    localStorage.setItem(key, JSON.stringify({ owner, expiresAt: now + LOCK_TTL_MS }));
    const stored = JSON.parse(localStorage.getItem(key) || '{}') as { owner?: string };
    return stored.owner === owner ? owner : null;
  } catch {
    return owner;
  }
}

export function releaseWhatsAppOrderLock(idempotencyKey: string, owner: string | null) {
  if (!owner) return;
  const key = orderLockKey(idempotencyKey);
  try {
    const raw = localStorage.getItem(key);
    const current = raw ? (JSON.parse(raw) as { owner?: string }) : null;
    if (current?.owner === owner) localStorage.removeItem(key);
  } catch {
    localStorage.removeItem(key);
  }
}

