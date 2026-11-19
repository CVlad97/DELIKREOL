import { describe, expect, it } from 'vitest';
import { normalizeSiret, prevalidatePartnerIdentity } from './partnerPrevalidation';

describe('partner public identity prevalidation', () => {
  it('normalizes and validates SIRET checksum', () => {
    expect(normalizeSiret('732 829 320 00074')).toBe('73282932000074');
    expect(normalizeSiret('73282932000075')).toBeNull();
    expect(normalizeSiret('bad')).toBeNull();
  });
  it('never approves banking or regulatory documents from public data', () => {
    const result = prevalidatePartnerIdentity('73282932000074', [{siren:'732829320',nom_complet:'EXEMPLE',etat_administratif:'A',siege:{siret:'73282932000074'}}]);
    expect(result.identity).toBe('matched');
    expect(result.bank).toBe('human_review');
    expect(result.regulatory).toBe('human_review');
    expect(result.approved).toBe(false);
  });
  it('rejects a company with mismatched establishment or inactive status', () => {
    expect(prevalidatePartnerIdentity('73282932000074', [{siren:'732829320',etat_administratif:'F',siege:{siret:'73282932000074'}}]).identity).toBe('review_required');
    expect(prevalidatePartnerIdentity('73282932000074', [{siren:'732829320',etat_administratif:'A',siege:{siret:'73282932000082'}}]).identity).toBe('review_required');
  });
});
