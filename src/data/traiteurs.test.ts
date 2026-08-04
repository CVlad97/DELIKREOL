import { describe, it, expect } from 'vitest';
import { formatEuro, getTraiteurSpaceBySlug, traiteurSpaces } from './traiteurs';

describe('formatEuro', () => {
  it('should format whole numbers correctly', () => {
    const result = formatEuro(10);
    expect(result).toContain('10');
    expect(result).toContain('€');
    expect(result).not.toContain('NaN');
  });

  it('should format decimal numbers', () => {
    expect(formatEuro(10.5)).toContain('10,50');
    expect(formatEuro(3.99)).toContain('3,99');
    expect(formatEuro(0)).toContain('0');
  });
});

describe('traiteur media mapping', () => {
  it('separates Coco logo/profile from product gallery photos', () => {
    const coco = getTraiteurSpaceBySlug('cocos-food');

    expect(coco?.logoImage).toContain('/vendors/coco/profile.svg');
    expect(coco?.portraitImage).toContain('/vendors/coco/profile.svg');
    expect(coco?.galleryImages.some((image) => image.includes('/profile.svg'))).toBe(false);
  });

  it('uses validated Gouté Mwen pricing from the supplied partner kit', () => {
    const gouteMwen = getTraiteurSpaceBySlug('goute-mwen');
    const prices = gouteMwen?.menuItems.map((item) => item.price) ?? [];

    expect(gouteMwen?.photoStatus).toBe('confirmée');
    expect(Math.min(...prices)).toBe(2.5);
    expect(gouteMwen?.promise).toContain('2,50€');
  });

  it('does not publish An Tjè Coco while original product photos are unavailable', () => {
    expect(traiteurSpaces.some((traiteur) => traiteur.name === 'An Tjè Coco')).toBe(false);
  });
});
