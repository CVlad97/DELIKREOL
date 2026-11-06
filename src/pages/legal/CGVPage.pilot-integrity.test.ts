import { describe,it,expect } from 'vitest';import { readFileSync } from 'node:fs';
const cgv=readFileSync('src/pages/legal/CGVPage.tsx','utf8');
const cgu=readFileSync('src/pages/legal/TermsOfService.tsx','utf8');
describe('Pilot terms do not misrepresent operational state or consumer rights',()=>{
 it('identifies pilot and legal seller role',()=>{expect(cgv).toContain('Version pilote');expect(cgv).toContain('vendeur contractuel')});
 it('does not claim allergens are complete or limit claims to 2 hours',()=>{expect(cgv).not.toContain('allergènes et origines des viandes sont indiqués sur chaque fiche');expect(cgv).not.toContain('client doit contacter le support dans les 2 heures')});
 it('does not guarantee delivery time',()=>expect(cgu).not.toContain('délai estimé de 1 à 2 heures'));
});
