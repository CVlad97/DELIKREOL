import { describe, expect, it } from 'vitest';
import { isStripeTestPublicEnabled } from './integrations';

describe('integrations Stripe public guard', () => {
  it('disables Stripe when the feature flag is false', () => {
    expect(isStripeTestPublicEnabled('false', 'pk_test_example')).toBe(false);
  });

  it('enables Stripe only with a test publishable key', () => {
    expect(isStripeTestPublicEnabled('true', 'pk_test_example')).toBe(true);
    expect(isStripeTestPublicEnabled('true', 'pk_live_example')).toBe(false);
  });
});
