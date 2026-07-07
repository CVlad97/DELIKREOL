import { describe, it, expect, beforeEach } from 'vitest';
import {
  getLocalMetrics,
  getPendingMetricsCount,
} from './metricsService';

describe('metricsService', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('should return zero counts by default', () => {
    const metrics = getLocalMetrics();
    expect(metrics.public_view).toBe(0);
    expect(metrics.checkout_success).toBe(0);
    expect(metrics.partner_lead_success).toBe(0);
    expect(metrics.business_request_success).toBe(0);
    expect(metrics.product_submission_success).toBe(0);
  });

  it('should have zero pending metrics', () => {
    expect(getPendingMetricsCount()).toBe(0);
  });
});