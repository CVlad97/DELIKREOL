import { describe, expect, it } from 'vitest';
import {
  PUBLIC_IMAGE_REVISION,
  reviseSrcSet,
  withPublicImageRevision,
} from './publicImageRevision';

describe('publicImageRevision', () => {
  it('adds a revision query to local public images', () => {
    expect(withPublicImageRevision('/vendors/save-peyia/drive-import/drive-01.webp'))
      .toBe(`/vendors/save-peyia/drive-import/drive-01.webp?v=${PUBLIC_IMAGE_REVISION}`);
  });

  it('preserves existing queries and fragments', () => {
    expect(withPublicImageRevision('/image.webp?width=800#photo'))
      .toBe(`/image.webp?width=800&v=${PUBLIC_IMAGE_REVISION}#photo`);
  });

  it('does not rewrite external or embedded sources', () => {
    expect(withPublicImageRevision('https://example.com/image.webp')).toBe('https://example.com/image.webp');
    expect(withPublicImageRevision('data:image/svg+xml,test')).toBe('data:image/svg+xml,test');
    expect(withPublicImageRevision('blob:https://delikreol.com/id')).toBe('blob:https://delikreol.com/id');
  });

  it('versions every local candidate in a srcset', () => {
    expect(reviseSrcSet('/one.webp 1x, /two.webp 2x'))
      .toBe(`/one.webp?v=${PUBLIC_IMAGE_REVISION} 1x, /two.webp?v=${PUBLIC_IMAGE_REVISION} 2x`);
  });
});
