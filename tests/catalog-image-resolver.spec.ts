import { describe, expect, it } from 'vitest';
import {
  inferProductImageKind,
  resolveProductThumbnail,
} from '../src/services/catalogImageResolver';

describe('catalogImageResolver', () => {
  it('keeps Save Peyi branded artwork fully visible', () => {
    const input = {
      src: '/vendors/save-peyia/drive-import/drive-01.webp',
      partnerImage: '/vendors/save-peyia/hero.jpg',
      name: 'Côte de porc riz crudités',
      vendor: "Snack Savè Peyi'A",
      category: 'Plats',
    };

    expect(inferProductImageKind(input)).toBe('packaging');
    expect(resolveProductThumbnail(input)).toMatchObject({
      source: 'product',
      kind: 'packaging',
      fit: 'contain',
    });
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
});
