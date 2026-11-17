import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock('../lib/publicSupabase', () => ({
  isPublicSupabaseConfigured: true,
  publicSupabase: { from: mockFrom },
}));

import { loadPublicCatalog } from './publicCatalogService';

describe('loadPublicCatalog pilot fallback', () => {
  beforeEach(() => {
    mockFrom.mockImplementation((table: string) => ({
      select: () => ({
        order: async () => ({
          data: table === 'vendors'
            ? [{
                id: 'langouste-vendor',
                business_name: 'Langouste House',
                is_public: true,
                is_demo: false,
                status: 'verified',
                is_active: true,
              }]
            : [],
          error: null,
        }),
      }),
    }));
  });

  it('keeps the proposed Langouste House menu visible when its vendor exists without product rows', async () => {
    const catalog = await loadPublicCatalog();
    const langousteProducts = catalog.products.filter((product) => product.vendor_name === 'Langouste House');

    expect(langousteProducts).toHaveLength(10);
    expect(langousteProducts[0]).toMatchObject({
      name: 'Bisque de langouste maison (250 g)',
      price: 15,
      available: false,
    });
  });
});
