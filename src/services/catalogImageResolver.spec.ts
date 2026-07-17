import { describe, expect, it } from 'vitest';
import {
  inferImageKindFromPath,
  inferProductImageKind,
  resolveProductThumbnail,
} from './catalogImageResolver';

describe('catalogImageResolver', () => {
  it('renders verified Save Peyi dishes as food photography', () => {
    const input = {
      src: '/vendors/save-peyia/drive-import/drive-01.webp',
      partnerImage: '/vendors/save-peyia/hero.jpg',
      name: 'Côte de porc riz crudités',
      vendor: "Snack Savè Peyi'A",
      category: 'Plats',
    };

    expect(inferProductImageKind(input)).toBe('food');
    expect(resolveProductThumbnail(input)).toMatchObject({
      source: 'product',
      kind: 'food',
      fit: 'cover',
    });
  });

  it('keeps explicit Save Peyi flyers fully visible', () => {
    const input = {
      src: '/vendors/save-peyia/flyer-menu.webp',
      name: 'Flyer menu du week-end',
      vendor: "Snack Savè Peyi'A",
      category: 'Menu',
    };

    expect(inferProductImageKind(input)).toBe('flyer');
    expect(resolveProductThumbnail(input).fit).toBe('contain');
  });

  it('keeps ordinary food photography edge-to-edge', () => {
    const input = {
      src: '/vendors/ninice/gallery-01.jpg',
      name: 'Colombo des deux rives',
      vendor: 'Les Delices de Ninice',
      category: 'Plats',
    };

    expect(inferProductImageKind(input)).toBe('food');
    expect(resolveProductThumbnail(input).fit).toBe('cover');
  });

  it('contains partner logos and flyers even when used as fallback thumbnails', () => {
    const logoInput = {
      partnerImage: '/vendors/chef-a-mada/logo.jpg',
      name: 'Logo Chef a Mada',
      vendor: 'Chef à Mada',
      category: 'Traiteur',
    };

    const flyerInput = {
      partnerImage: '/vendors/sweet-family/cocktails-mignardises-hero.jpg',
      name: 'Cocktails et mignardises',
      vendor: 'Sweet Family Traiteur Orianne',
      category: 'Traiteur',
    };

    expect(inferImageKindFromPath(logoInput.partnerImage, logoInput.vendor)).toBe('logo');
    expect(resolveProductThumbnail(logoInput).fit).toBe('contain');
    expect(inferImageKindFromPath(flyerInput.partnerImage, flyerInput.vendor)).toBe('flyer');
    expect(resolveProductThumbnail(flyerInput).fit).toBe('contain');
  });
});
