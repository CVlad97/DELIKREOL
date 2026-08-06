import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();

function read(path: string) {
  return readFileSync(join(root, path), 'utf8');
}

describe('backend production hardening', () => {
  it('keeps checkout-order server-side priced and direct-delivery vendor constrained', () => {
    const source = read('supabase/functions/checkout-order/index.ts');

    expect(source).toContain('.from("products")');
    expect(source).toContain('DIRECT_DELIVERY_MULTIPLE_VENDORS_NOT_ALLOWED');
    expect(source).toContain('deliveryOrderMode === "livraison_directe" && vendorIds.size !== 1');
    expect(source).toContain('vendor_commission');
    expect(source).not.toContain('Number(total || 0)');
    expect(source).not.toContain('Number(total_amount');
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
