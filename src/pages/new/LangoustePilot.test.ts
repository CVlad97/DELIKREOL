import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
const home=readFileSync('src/pages/new/HomePage.tsx','utf8');
const profile=readFileSync('src/data/partnerProfiles.ts','utf8');
describe('Langouste House pilot',()=>{
  it('shows a real image and offers quote not unverified checkout',()=>{
    expect(home).toContain('vendors/langouste-house/langouste-entiere-bbq.jpg');
    expect(home).toContain('to="/traiteur/langouste-house"');
    expect(home).toContain('to="/devis"');
    expect(home).toContain('Disponibilités, tarifs et livraison à confirmer');
  });
  it('keeps order activation gated',()=>{
    const section=profile.split("name: 'Langouste House'")[1];
    expect(section).toContain('planifiable: false');
    expect(section).toContain('enterprise: true');
  });
});
