import { describe, expect, it } from 'vitest';
import { sanitizeAuthNext } from './authRedirect';

describe('auth redirect helpers', () => {
  it('keeps dashboard routes', () => {
    expect(sanitizeAuthNext('/admin/parametres')).toBe('/admin/parametres');
    expect(sanitizeAuthNext('/espace-partenaire')).toBe('/espace-partenaire');
    expect(sanitizeAuthNext('/espace-livreur?tab=missions')).toBe('/espace-livreur?tab=missions');
  });

  it('blocks external or public redirects', () => {
    expect(sanitizeAuthNext('https://evil.test/admin')).toBe('/espace-partenaire');
    expect(sanitizeAuthNext('//evil.test')).toBe('/espace-partenaire');
    expect(sanitizeAuthNext('/catalogue')).toBe('/espace-partenaire');
  });
});
