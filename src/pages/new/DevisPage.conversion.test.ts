import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const source = readFileSync(join(process.cwd(), 'src/pages/new/DevisPage.tsx'), 'utf8');
const home = readFileSync(join(process.cwd(), 'src/pages/new/HomePage.tsx'), 'utf8');

describe('Devis commercial : transmission réelle', () => {
  it('opens WhatsApp from a validated submit and provides a fallback link', () => {
    expect(source).toContain("window.open(whatsappUrl(), '_blank', 'noopener,noreferrer')");
    expect(source).toContain('href={whatsappUrl()}');
    expect(source).toContain('Ouvrir WhatsApp pour envoyer');
  });
  it('never claims receipt or saves sensitive quotes only in localStorage', () => {
    expect(source).not.toContain('delikreol_catering_requests');
    expect(source).not.toContain('localStorage.');
    expect(source).not.toContain('Votre demande a bien été reçue');
    expect(source).toContain('appuyez sur « Envoyer »');
  });
  it('has an entry point visible on the public home', () => {
    expect(home).toContain('to="/devis"');
    expect(home).toContain('Devis traiteur &amp; événements');
  });
});
