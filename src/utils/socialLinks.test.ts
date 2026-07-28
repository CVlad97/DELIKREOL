import { describe, expect, it } from 'vitest';
import { sanitizeSocialLinks, sanitizeSocialUrl, socialLabel } from './socialLinks';

describe('socialLinks', () => {
  it('keeps only HTTPS official social profile URLs', () => {
    expect(sanitizeSocialUrl('instagram', 'instagram.com/delikreol')).toBe('https://instagram.com/delikreol');
    expect(sanitizeSocialUrl('facebook', 'https://www.facebook.com/delikreol')).toBe('https://www.facebook.com/delikreol');
    expect(sanitizeSocialUrl('instagram', 'https://evil.test/delikreol')).toBeUndefined();
    expect(sanitizeSocialUrl('facebook', 'http://facebook.com/delikreol')).toBeUndefined();
  });

  it('normalizes a set of partner social links', () => {
    expect(sanitizeSocialLinks({ instagram: 'www.instagram.com/goute_mwen', website: 'delikreol.com' })).toEqual({
      instagram: 'https://www.instagram.com/goute_mwen',
      facebook: undefined,
      website: 'https://delikreol.com/',
    });
  });

  it('builds readable labels without exposing tracking data', () => {
    expect(socialLabel('instagram', 'https://www.instagram.com/delikreol?utm_source=test')).toBe('@delikreol');
    expect(socialLabel('website', 'https://www.delikreol.com/traiteurs')).toBe('delikreol.com');
  });
});
