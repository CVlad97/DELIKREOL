import { describe, expect, it } from 'vitest';
import { normalizePublicPath, shouldShowGlobalBackBar } from './router';

describe('global public BackBar routing', () => {
  it('normalizes the GitHub Pages base path', () => {
    expect(normalizePublicPath('/DELIKREOL/panier/')).toBe('/panier');
    expect(normalizePublicPath('/DELIKREOL')).toBe('/');
  });

  it('does not show a global BackBar on home, admin, or pages with their own BackBar', () => {
    expect(shouldShowGlobalBackBar('/')).toBe(false);
    expect(shouldShowGlobalBackBar('/admin')).toBe(false);
    expect(shouldShowGlobalBackBar('/admin/commandes')).toBe(false);
    expect(shouldShowGlobalBackBar('/catalogue')).toBe(false);
    expect(shouldShowGlobalBackBar('/produit/ninice-colombo')).toBe(false);
    expect(shouldShowGlobalBackBar('/traiteur/les-delices-de-ninice')).toBe(false);
  });

  it('shows a global BackBar on public pages that need child-safe navigation', () => {
    expect(shouldShowGlobalBackBar('/panier')).toBe(true);
    expect(shouldShowGlobalBackBar('/feedback')).toBe(true);
    expect(shouldShowGlobalBackBar('/devenir-partenaire')).toBe(true);
    expect(shouldShowGlobalBackBar('/DELIKREOL/panier')).toBe(true);
  });
});
