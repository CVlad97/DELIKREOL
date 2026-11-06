import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
const source = readFileSync('src/pages/new/DevenirPartenairePage.tsx','utf8');
describe('Partner applications are actually recorded or explicitly escalated',()=>{
 it('uses real database columns, never imaginary name / description',()=>{
   expect(source).toContain('contact_name:');
   expect(source).toContain("partner_type: 'vendor'");
   expect(source).toContain('business_name:');
   expect(source).toContain('details:');
   expect(source).not.toMatch(/\n\s+name: form\.nomResponsable/);
   expect(source).not.toContain('description: form.message');
 });
 it('avoids silent local-only backup and incorrect receipt',()=>{
   expect(source).not.toContain('delikreol_partner_applications');
   expect(source).not.toContain('localStorage.');
   expect(source).toContain('if (error) throw error');
   expect(source).toContain('setSubmissionError(');
   expect(source).toContain('Transmettre ma candidature sur WhatsApp');
 });
});
