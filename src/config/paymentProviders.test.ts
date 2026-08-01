import { describe, expect, it } from 'vitest';
import {
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  buildPaymentReference,
  isCustomerSelectablePaymentProvider,
} from './paymentProviders';

describe('manual payment providers', () => {
  it('exposes the expected non-Stripe providers', () => {
    expect(PAYMENT_PROVIDERS.map((provider) => provider.id)).toEqual([
      'qonto_transfer',
      'revolut_transfer',
      'cash_on_delivery',
      'crypto_wallet',
      'external_payment_link',
      'stripe_disabled',
    ]);
  });

  it('keeps Stripe unavailable to customers', () => {
    expect(isCustomerSelectablePaymentProvider('stripe_disabled')).toBe(false);
    expect(PAYMENT_PROVIDERS.find((provider) => provider.id === 'stripe_disabled')?.status).toBe('disabled');
  });

  it('supports requested manual payment statuses', () => {
    expect(PAYMENT_STATUSES).toEqual([
      'pending',
      'proof_submitted',
      'under_review',
      'paid',
      'failed',
      'refunded',
      'cancelled',
    ]);
  });

  it('builds auditable payment references', () => {
    expect(buildPaymentReference('DK-20260731-ABC123', 'qonto_transfer')).toBe('QONTO-DK-20260731-ABC123');
    expect(buildPaymentReference('DK-20260731-ABC123', 'revolut_transfer')).toBe('REVOLUT-DK-20260731-ABC123');
    expect(buildPaymentReference('DK-20260731-ABC123', 'crypto_wallet')).toBe('CRYPTO-DK-20260731-ABC123');
  });
});
