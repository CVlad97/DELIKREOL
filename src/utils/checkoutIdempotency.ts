// Shared client-side idempotency helpers for the checkout-order Edge Function.
//
// The checkout-order Edge Function refuses to create a second order when it
// receives a request whose `idempotency_key` already matches an existing
// order row (see `idx_orders_idempotency_key_unique` and
// `create_checkout_order_atomic`). To make that protection effective on the
// client, we derive a *stable* key per (provider, cart fingerprint) and cache
// it in localStorage so that a retry / double-click reuses the same key
// instead of minting a fresh UUID.

const CHECKOUT_IDEMPOTENCY_STORAGE_KEY = 'delikreol_checkout_idempotency_v1';

export interface CartFingerprintItem {
  id: string;
  quantity: number;
}

/**
 * Build a deterministic fingerprint of the checkout payload so that two
 * identical carts map to the same idempotency slot.
 */
export function buildCheckoutFingerprint(
  items: CartFingerprintItem[],
  extras: Record<string, string | number | undefined>,
): string {
  return JSON.stringify({
    items: items
      .map((item) => ({ id: item.id, quantity: item.quantity }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    ...extras,
  });
}

function randomUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID (e.g. jsdom).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Returns a stable idempotency key for a given (provider, fingerprint) slot.
 * The key is persisted in localStorage so retries reuse it; if persistence is
 * unavailable (private mode, quota) a fresh key is still produced.
 */
export function getStableCheckoutIdempotencyKey(
  provider: string,
  fingerprint: string,
): string {
  const slot = `${provider}:${fingerprint}`;
  try {
    const existing = JSON.parse(
      localStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY) || '{}',
    ) as Record<string, string>;
    if (typeof existing[slot] === 'string' && existing[slot].length >= 16) {
      return existing[slot];
    }
    const nextKey = `checkout_${provider}_${randomUUID()}`;
    localStorage.setItem(
      CHECKOUT_IDEMPOTENCY_STORAGE_KEY,
      JSON.stringify({ ...existing, [slot]: nextKey }),
    );
    return nextKey;
  } catch {
    return `checkout_${provider}_${randomUUID()}`;
  }
}

/**
 * Clears the cached idempotency key for a slot once the order has been
 * successfully created, so a future *different* checkout can mint a new key.
 */
export function clearCheckoutIdempotencyKey(provider: string, fingerprint: string): void {
  const slot = `${provider}:${fingerprint}`;
  try {
    const existing = JSON.parse(
      localStorage.getItem(CHECKOUT_IDEMPOTENCY_STORAGE_KEY) || '{}',
    ) as Record<string, string>;
    if (!(slot in existing)) return;
    delete existing[slot];
    localStorage.setItem(
      CHECKOUT_IDEMPOTENCY_STORAGE_KEY,
      JSON.stringify(existing),
    );
  } catch {
    // ignore storage failures
  }
}
