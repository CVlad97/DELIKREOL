import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), 'utf8');
}

/**
 * Garde-fou régression : CheckoutModal (parcours client authentifié) doit
 * emprunter le MÊME chemin atomique que CartPage (parcours public) :
 *  - appel à l'Edge Function `checkout-order`
  - envoi d'une `idempotency_key` générée côté client
  - aucun recours à `ordersService.create()` (INSERT direct sans idempotence)
  - fallback WhatsApp SANS seconde création en base
 *
 * L'idempotence réelle est garantie côté serveur par la contrainte unique
 * `idx_orders_idempotency_key_unique` + `create_checkout_order_atomic`
 * (vérifiée dans backend-hardening.spec.ts). On valide ici le contrat côté
 * client et on s'assure que la base ne peut pas recevoir deux INSERT pour la
 * même clé via ce chemin.
 */
describe('CheckoutModal — unification du chemin atomique de commande', () => {
  it('appelle checkout-order avec une idempotency_key côté client', () => {
    const source = read('src/components/CheckoutModal.tsx');

    expect(source).toContain("supabase.functions.invoke('checkout-order'");
    expect(source).toContain('idempotency_key: idempotencyKey');
    expect(source).toContain('getStableCheckoutIdempotencyKey');
    expect(source).toContain('buildCheckoutFingerprint');
  });

  it('ne crée plus de commande via ordersService.create()', () => {
    const source = read('src/components/CheckoutModal.tsx');

    expect(source).not.toContain('ordersService');
    expect(source).not.toMatch(/ordersService\.create\s*\(/);
  });

  it('conserve un fallback WhatsApp sans seconde création en base', () => {
    const source = read('src/components/CheckoutModal.tsx');

    expect(source).toContain('shouldFallbackToDemo');
    expect(source).toContain("buildWhatsappUrl('non enregistrée'");
    // Aucun appel d'écriture en base dans le chemin d'erreur.
    expect(source).not.toContain('ordersService.create');
    expect(source).not.toMatch(/\.from\(['"]orders['"]\)\.insert/);
  });
});

/**
 * Contrat d'idempotence côté serveur : on s'assure que la base interdit
 * physiquement deux commandes avec la même `idempotency_key`, ce qui protège
 * le chemin unifié (CheckoutModal + CartPage) contre les doubles soumissions.
 */
describe('idempotence commande — contrainte unique en base', () => {
  it('pose un index unique sur orders.idempotency_key', () => {
    const migration = read(
      'supabase/migrations/20260731000001_modular_manual_payments.sql',
    );

    expect(migration).toContain('idx_orders_idempotency_key_unique');
    expect(migration).toMatch(/create unique index if not exists idx_orders_idempotency_key_unique/);
    // La contrainte ne s'applique qu'aux clés renseignées (partial index).
    expect(migration).toMatch(/where idempotency_key is not null/);
  });

  it('expose la RPC atomique qui verrouille et déduplique la clé', () => {
    const migration = read(
      'supabase/migrations/20260731000001_modular_manual_payments.sql',
    );

    expect(migration).toContain('create_checkout_order_atomic');
    expect(migration).toContain('pg_advisory_xact_lock');
    expect(migration).toContain('target_idempotency_key');
  });

  it('vérifie les doublons avant insertion dans la RPC', () => {
    const migration = read(
      'supabase/migrations/20260731000001_modular_manual_payments.sql',
    );

    // La RPC sélectionne l'éventuelle commande existante pour la clé et la
    // renvoie à la place d'en insérer une seconde.
    expect(migration).toMatch(/select[\s\S]*from public\.orders[\s\S]*where idempotency_key = target_idempotency_key/i);
    expect(migration).toMatch(/if found then[\s\S]*'existing', true/i);
  });
});

/**
 * Test unitaire de la logique de clé stable : deux appels successifs avec le
 * même (provider, fingerprint) renvoient la même clé, ce qui fait qu'un retry
 * ou double-clic produit une seule commande côté serveur.
 */
describe('getStableCheckoutIdempotencyKey — stabilité de la clé', () => {
  it('renvoie la même clé pour le même slot (provider, fingerprint)', async () => {
    // jsdom fournit localStorage via l'environnement vitest configuré.
    const { buildCheckoutFingerprint, getStableCheckoutIdempotencyKey } =
      await import('../../src/utils/checkoutIdempotency');

    localStorage.clear();
    const fingerprint = buildCheckoutFingerprint(
      [{ id: 'p1', quantity: 2 }],
      { mode: 'pickup', provider: 'qonto_transfer' },
    );
    const first = getStableCheckoutIdempotencyKey('qonto_transfer', fingerprint);
    const second = getStableCheckoutIdempotencyKey('qonto_transfer', fingerprint);

    expect(first).toMatch(/^checkout_qonto_transfer_/);
    expect(first.length).toBeGreaterThanOrEqual(16);
    expect(second).toBe(first);
  });

  it('produit des clés distinctes pour des paniers différents', async () => {
    const { buildCheckoutFingerprint, getStableCheckoutIdempotencyKey } =
      await import('../../src/utils/checkoutIdempotency');

    localStorage.clear();
    const fp1 = buildCheckoutFingerprint([{ id: 'p1', quantity: 1 }], {
      mode: 'pickup',
      provider: 'cash_on_delivery',
    });
    const fp2 = buildCheckoutFingerprint([{ id: 'p2', quantity: 1 }], {
      mode: 'pickup',
      provider: 'cash_on_delivery',
    });
    const k1 = getStableCheckoutIdempotencyKey('cash_on_delivery', fp1);
    const k2 = getStableCheckoutIdempotencyKey('cash_on_delivery', fp2);

    expect(k1).not.toBe(k2);
  });
});
