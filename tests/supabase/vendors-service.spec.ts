import { describe, it, expect, vi, beforeEach } from 'vitest';
import { traiteurSpaces } from '../../src/data/traiteurs';

describe('vendorsService', () => {
  const ORIGINAL_VITE_MODE = process.env.VITE_USER_NODE_ENV;

  beforeEach(() => {
    vi.resetModules();
    // Default: static mode for tests
    process.env.VITE_PUBLIC_VENDOR_SOURCE = 'static';
  });

  it('should return static vendors in static mode', async () => {
    const { getPublicVendors } = await import('../../src/services/vendorsService');
    const result = await getPublicVendors();
    expect(result.source).toBe('static');
    expect(result.vendors.length).toBeGreaterThanOrEqual(7);
    expect(result.vendors[0].status).toBe('public confirmé');
  });

  it('should filter only public confirmé vendors in static mode', async () => {
    const { getPublicVendors } = await import('../../src/services/vendorsService');
    const result = await getPublicVendors();
    const allConfirmed = result.vendors.every(v => v.status === 'public confirmé');
    expect(allConfirmed).toBe(true);
  });

  it('should handle Supabase unavailable gracefully in hybrid mode', async () => {
    process.env.VITE_PUBLIC_VENDOR_SOURCE = 'hybrid';
    process.env.VITE_SUPABASE_URL = 'https://nonexistent.supabase.co';
    process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

    // Mock the supabase import to throw
    vi.mock('@supabase/supabase-js', () => ({
      createClient: () => { throw new Error('Supabase unavailable'); },
    }));

    const { getPublicVendors } = await import('../../src/services/vendorsService');
    const result = await getPublicVendors();
    // Should fall back to static data
    expect(result.source).toBe('static');
    expect(result.vendors.length).toBeGreaterThanOrEqual(7);
  });

  it('should return vendor by slug', async () => {
    const { getVendorBySlug } = await import('../../src/services/vendorsService');
    const result = await getVendorBySlug('les-delices-de-ninice');
    expect(result.vendor).not.toBeNull();
    expect(result.vendor!.name).toContain('Ninice');
  });

  it('should return null for unknown slug', async () => {
    const { getVendorBySlug } = await import('../../src/services/vendorsService');
    const result = await getVendorBySlug('unknown-slug-that-does-not-exist');
    expect(result.vendor).toBeNull();
  });

  it('should not contain duplicate vendor slugs', async () => {
    const { getPublicVendors } = await import('../../src/services/vendorsService');
    const result = await getPublicVendors();
    const slugs = result.vendors.map(v => v.slug);
    const uniqueSlugs = new Set(slugs);
    expect(uniqueSlugs.size).toBe(slugs.length);
  });
});