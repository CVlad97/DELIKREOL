import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), 'utf8');
}

describe('backend production hardening', () => {
  it('keeps checkout-order server-side priced and single-vendor', () => {
    const source = read('supabase/functions/checkout-order/index.ts');

    expect(source).toContain('.from("products")');
    expect(source).toContain('Panier multi-vendeur bloqué');
    expect(source).toContain('vendor_commission');
    expect(source).toContain('create_checkout_order_atomic');
    expect(source).not.toContain('Number(total || 0)');
    expect(source).not.toContain('Number(total_amount');
  });

  it('rejects forged and disabled payment providers with an explicit 400', () => {
    const source = read('supabase/functions/checkout-order/index.ts');

    // Liste blanche serveur stricte : seuls ces providers de base sont
    // toujours autorisés. crypto_wallet et external_payment_link sont
    // conditionnés par feature flag serveur.
    expect(source).toContain('BASE_PAYMENT_PROVIDERS');
    expect(source).toContain('"qonto_transfer"');
    expect(source).toContain('"revolut_transfer"');
    expect(source).toContain('"cash_on_delivery"');
    expect(source).toContain('resolveAllowedPaymentProviders');
    expect(source).toContain('Deno.env.get("ENABLE_CRYPTO_PAYMENT")');
    expect(source).toContain('Deno.env.get("ENABLE_EXTERNAL_PAYMENT_LINK")');

    // Les providers dangereux ou trop vastes ne doivent jamais être ajoutés à
    // la liste blanche serveur (ni en base, ni via feature flag).
    expect(source).not.toContain('providers.add("stripe_disabled")');
    expect(source).not.toContain('providers.add("stripe_test")');
    expect(source).not.toContain('providers.add("manual")');
    expect(source).not.toContain('add("sumup_');
    expect(source).toContain('providers.add("crypto_wallet")');
    expect(source).toContain('providers.add("external_payment_link")');

    // Tout provider inconnu/désactivé doit être rejeté en 400, jamais
    // silencieusement remplacé par qonto_transfer.
    expect(source).toContain('payment_provider non autorisé');
    expect(source).toContain('Provider de paiement inconnu, désactivé ou non activé par feature flag serveur.');
    expect(source).not.toContain('|| "qonto_transfer"');
    expect(source).not.toContain('? rawPaymentProvider : "qonto_transfer"');
  });

  it('derives payment_status from server data only, never from client payment_external_id', () => {
    const source = read('supabase/functions/checkout-order/index.ts');

    // Le statut est fixé côté serveur à "pending" à la création, indépendant
    // du payment_external_id envoyé par le client.
    expect(source).toContain('const paymentStatus = "pending";');
    // L'ancienne dérivation basée sur payment_external_id doit avoir disparu.
    expect(source).not.toContain('paymentExternalId ? "proof_submitted" : "pending"');
    // Aucune confiance dans un éventuel body.payment_status envoyé par le
    // client : il ne doit pas être lu pour calculer le statut persisté.
    expect(source).not.toMatch(/paymentStatus\s*=\s*sanitizeText\(body\.payment_status/);
  });

  it('never trusts a client-supplied order total', () => {
    const source = read('supabase/functions/checkout-order/index.ts');

    // Le total est recalculé depuis la base (prix produits + frais de
    // livraison serveur), jamais depuis body.total / body.total_amount.
    expect(source).toContain('subtotalCents = orderItems.reduce');
    expect(source).toContain('totalCents = subtotalCents + delivery.cents');
    expect(source).toContain('if (totalCents <= 0) return json(req, { error: "Total commande invalide" }, 400)');
    expect(source).not.toContain('Number(body.total');
    expect(source).not.toContain('Number(body.total_amount');
    expect(source).not.toContain('body.total_cents');
  });

  it('prepares atomic idempotence for checkout-order', () => {
    const migration = read('supabase/migrations/20260731000001_modular_manual_payments.sql');

    expect(migration).toContain('create_checkout_order_atomic');
    expect(migration).toContain('pg_advisory_xact_lock');
    expect(migration).toContain('target_idempotency_key');
    expect(migration).toContain('grant execute on function public.create_checkout_order_atomic');
    expect(migration).toContain('payment_duplicate_audit');
    expect(migration).toContain('idx_orders_idempotency_key_unique');
  });

  it('disables legacy create-payment-intent public flow', () => {
    const source = read('supabase/functions/create-payment-intent/index.ts');

    expect(source).toContain('create-payment-intent disabled');
    expect(source).toContain('create-checkout-session');
    expect(source).not.toContain('paymentIntents.create');
  });

  it('requires Connect readiness before Stripe Checkout', () => {
    const source = read('supabase/functions/create-checkout-session/index.ts');

    expect(source).toContain('stripe_payouts_enabled');
    expect(source).toContain('Compte Stripe Connect vendeur incomplet');
    expect(source).toContain('destination: connectedAccountId');
    expect(source).toContain('application_fee_amount');
  });

  it('tracks required Stripe webhook events durably', () => {
    const source = read('supabase/functions/stripe-webhook/index.ts');

    for (const eventType of [
      'checkout.session.completed',
      'checkout.session.async_payment_succeeded',
      'checkout.session.async_payment_failed',
      'payment_intent.succeeded',
      'payment_intent.payment_failed',
      'charge.refunded',
      'charge.dispute.created',
      'account.updated',
      'payout.paid',
      'payout.failed',
    ]) {
      expect(source).toContain(eventType);
    }
    expect(source).toContain('constructEventAsync');
    expect(source).toContain('idempotent: true');
    expect(source).toContain('upsertPaymentTrace');
  });

  it('contains RLS hardening migration for public writes and role escalation', () => {
    const migration = read('supabase/migrations/20260727170541_backend_production_hardening_20260727.sql');

    expect(migration).toContain('drop policy if exists "orders_insert_public_checkout"');
    expect(migration).toContain('drop policy if exists "order_items_insert_public_checkout"');
    expect(migration).toContain('drop policy if exists "Customers can create payments for own orders"');
    expect(migration).toContain('role = (');
    expect(migration).toContain('idx_external_payment_events_order_id');
  });
});
