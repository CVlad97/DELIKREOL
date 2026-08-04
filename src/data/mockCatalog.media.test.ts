import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { mockProducts } from './mockCatalog';

function publicPathFromAsset(asset: string) {
  return asset.replace(/^\/+/, '').split('?')[0];
}

describe('mockCatalog media quality', () => {
  it('references only existing public assets for product thumbnails', () => {
    const missingAssets = mockProducts
      .map((product) => product.image)
      .filter((image): image is string => Boolean(image))
      .filter((image) => !existsSync(resolve(process.cwd(), 'public', publicPathFromAsset(image))));

    expect(missingAssets).toEqual([]);
  });

  it('keeps Gouté Mwen prices aligned with the validated partner kit', () => {
    const gouteMwenProducts = mockProducts.filter((product) => product.vendor === 'Gouté Mwen');

    expect(gouteMwenProducts.length).toBeGreaterThan(0);
    expect(gouteMwenProducts.every((product) => product.price === 2.5)).toBe(true);
  });

  it('uses honest placeholders when no bankable product original exists', () => {
    const placeholderProducts = mockProducts.filter((product) => (
      product.image?.includes('photo-a-confirmer') || product.image?.includes('photo-prochainement')
    ));

    expect(placeholderProducts.map((product) => product.id)).toEqual(
      expect.arrayContaining([
        'save-peyia-filet-poulet',
        'saveurs-afrique-igname',
        'goute-mwen-cacahuete',
      ]),
    );
    expect(placeholderProducts.every((product) => product.photoQuality !== 'validée')).toBe(true);
  });
});
