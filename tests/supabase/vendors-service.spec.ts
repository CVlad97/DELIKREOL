import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { traiteurSpaces } from '../../src/data/traiteurs';
import {
  getPublicVendors,
  getVendorBySlug,
  mergeVendorWithStatic,
  type VendorRaw,
} from '../../src/services/vendorsService';

function sparseVendor(overrides: Partial<VendorRaw> = {}): VendorRaw {
  return {
    id: 'vendor-test-id',
    name: 'Gouté Mwen',
    business_name: 'Gouté Mwen',
    description: null,
    address: null,
    zone_label: 'Martinique',
    commune: null,
    phone: null,
    whatsapp: null,
    email: null,
    is_public: true,
    is_active: true,
    is_demo: false,
    status: 'verified',
    hero_image: null,
    portrait_image: null,
    gallery_images: [],
    highlights: [],
    delivery_radius_km: 3,
    photo_status: 'à confirmer',
    public_display_status: 'public à vérifier',
    story: null,
    promise: null,
    specialty: null,
    gradient: null,
    accent: null,
    legal_name: null,
    siret: null,
    planifiable: false,
    enterprise: false,
    ...overrides,
  };
}

describe('vendorsService', () => {
  it('returns the static catalogue when Supabase is not configured', async () => {
    const result = await getPublicVendors();
    expect(result.vendors.length).toBeGreaterThanOrEqual(6);
    expect(result.vendors.some((vendor) => vendor.slug === 'goute-mwen')).toBe(true);
  });

  it('preserves validated static content when a Supabase row is sparse', () => {
    const fallback = traiteurSpaces.find((vendor) => vendor.slug === 'goute-mwen');
    expect(fallback).toBeDefined();

    const merged = mergeVendorWithStatic(sparseVendor(), fallback);

    expect(merged).not.toBeNull();
    expect(merged?.slug).toBe('goute-mwen');
    expect(merged?.status).toBe('public confirmé');
    expect(merged?.heroImage).toBe(fallback?.heroImage);
    expect(merged?.galleryImages).toEqual(fallback?.galleryImages);
    expect(merged?.menuItems.length).toBe(fallback?.menuItems.length);
    expect(merged?.story).toBe(fallback?.story);
    expect(merged?.photoStatus).toBe(fallback?.photoStatus);
  });

  it('uses populated Supabase editorial fields without losing the static menu', () => {
    const fallback = traiteurSpaces.find((vendor) => vendor.slug === 'goute-mwen');
    const merged = mergeVendorWithStatic(
      sparseVendor({
        description: 'Description publiée depuis Supabase',
        hero_image: 'https://delikreol.com/vendors/goute-mwen/hero.jpg',
        gallery_images: ['https://delikreol.com/vendors/goute-mwen/mangue.jpg'],
        highlights: ['Glaces locales'],
        public_display_status: 'public confirmé',
        photo_status: 'confirmée',
      }),
      fallback,
    );

    expect(merged?.description).toBe('Description publiée depuis Supabase');
    expect(merged?.heroImage).toBe('https://delikreol.com/vendors/goute-mwen/hero.jpg');
    expect(merged?.galleryImages).toEqual(['https://delikreol.com/vendors/goute-mwen/mangue.jpg']);
    expect(merged?.highlights).toEqual(['Glaces locales']);
    expect(merged?.menuItems.length).toBe(fallback?.menuItems.length);
    expect(merged?.photoStatus).toBe('confirmée');
  });

  it('rejects demo or non-public rows', () => {
    expect(mergeVendorWithStatic(sparseVendor({ is_demo: true }))).toBeNull();
    expect(mergeVendorWithStatic(sparseVendor({ is_public: false }))).toBeNull();
    expect(mergeVendorWithStatic(sparseVendor({ is_active: false }))).toBeNull();
  });

  it('keeps locally hidden partners unpublished even when Supabase marks them public', () => {
    const merged = mergeVendorWithStatic(
      sparseVendor({
        name: 'An Tjè Coco',
        business_name: 'An Tjè Coco',
        is_public: true,
        status: 'verified',
        hero_image: 'https://delikreol.com/vendors/an-tje-coco/gallery-05.jpg',
        gallery_images: ['https://delikreol.com/vendors/an-tje-coco/gallery-01.jpg'],
      }),
    );

    expect(merged).toBeNull();
  });

  it('keeps An Tjè Coco draft and Coco media URLs valid in corrective SQL', () => {
    const migration = readFileSync(
      resolve(process.cwd(), 'supabase/migrations/20260720000001_fix_partner_media_publication.sql'),
      'utf8',
    );
    const seed = readFileSync(resolve(process.cwd(), 'supabase/seed.partners.sql'), 'utf8');

    expect(migration).toContain("lower('An Tjè Coco')");
    expect(migration).toContain('is_public = false');
    expect(migration).not.toContain('vendors/an-tje-coco/hero.jpg');
    expect(migration).not.toContain('vendors/an-tje-coco/portrait.jpg');
    expect(migration).toContain('vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg');
    expect(migration).toContain('drop policy if exists "product_photos_public_insert" on storage.objects');
    expect(seed).not.toContain("'/vendors/coco/hero.jpg'");
    expect(seed).not.toContain("'/vendors/coco/portrait.jpg'");
    expect(seed).not.toContain("'/vendors/an-tje-coco/hero.jpg'");
    expect(seed).not.toContain("'/vendors/an-tje-coco/portrait.jpg'");
  });

  it('returns a vendor by normalized slug', async () => {
    const result = await getVendorBySlug('les-delices-de-ninice');
    expect(result.vendor).not.toBeNull();
    expect(result.vendor?.name).toContain('Ninice');
  });

  it('does not contain duplicate public vendor slugs', async () => {
    const result = await getPublicVendors();
    const slugs = result.vendors.map((vendor) => vendor.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });
});
