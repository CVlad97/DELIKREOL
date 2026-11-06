import { describe, expect, it } from 'vitest';
import {
  PUBLIC_IMAGE_REVISION,
  reviseSrcSet,
  withPublicImageRevision,
} from './publicImageRevision';

describe('publicImageRevision', () => {
  it('adds a revision query to local public images', () => {
    expect(withPublicImageRevision('/vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg'))
      .toBe(`/vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg?v=${PUBLIC_IMAGE_REVISION}`);
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

  it('rewrites canonical site images to the current origin for previews', () => {
    expect(withPublicImageRevision('https://delikreol.com/vendors/ninice/drive-reimport/photo.jpg'))
      .toBe(`/vendors/ninice/drive-reimport/photo.jpg?v=${PUBLIC_IMAGE_REVISION}`);
    expect(withPublicImageRevision('https://www.delikreol.com/branding/hero.webp'))
      .toBe(`/branding/hero.webp?v=${PUBLIC_IMAGE_REVISION}`);
    expect(withPublicImageRevision('https://delikreol.com/private/image.jpg'))
      .toBe('https://delikreol.com/private/image.jpg');
  });

  it('versions every local candidate in a srcset', () => {
    expect(reviseSrcSet('/one.webp 1x, /two.webp 2x'))
      .toBe(`/one.webp?v=${PUBLIC_IMAGE_REVISION} 1x, /two.webp?v=${PUBLIC_IMAGE_REVISION} 2x`);
  });
});
