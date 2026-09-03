import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const cartPageSource = readFileSync(join(process.cwd(), 'src/pages/new/CartPage.tsx'), 'utf8');

describe('CartPage WhatsApp mobile fallback', () => {
  it('keeps a visible fallback link to reopen the prepared WhatsApp order after checkout', () => {
    expect(cartPageSource).toContain('whatsappShareUrl &&');
    expect(cartPageSource).toContain('href={whatsappShareUrl}');
    expect(cartPageSource).toContain('Ouvrir ma demande WhatsApp');
  });

  it('persists the prepared WhatsApp order in session storage and avoids forced redirect', () => {
    expect(cartPageSource).toContain('LAST_WHATSAPP_ORDER_STORAGE_KEY');
    expect(cartPageSource).toContain('sessionStorage.setItem');
    expect(cartPageSource).toContain('sessionStorage.removeItem');
    expect(cartPageSource).toContain('Voir le statut');
    expect(cartPageSource).not.toContain('setTimeout(\n () => navigate');
  });

  it('keeps future orders possible and validates restored URLs', () => {
    expect(cartPageSource).toContain('function isSafePreparedWhatsAppUrl');
    expect(cartPageSource).toContain("url.protocol === 'https:'");
    expect(cartPageSource).toContain("url.hostname === 'wa.me'");
    expect(cartPageSource).toContain('function isSafeOrderStatusUrl');
    expect(cartPageSource).toContain("if (checkoutStatus ==='processing')");
    expect(cartPageSource).not.toContain("checkoutStatus ==='processing' || messageSent");
  });

  it('makes the form easier on mobile with phone help, error focus, and a sticky CTA', () => {
    expect(cartPageSource).toContain('function scrollToField');
    expect(cartPageSource).toContain('phoneInputRef');
    expect(cartPageSource).toContain('scrollToField(phoneInputRef.current)');
    expect(cartPageSource).toContain('id="cart-phone-help"');
    expect(cartPageSource).toContain('aria-describedby="cart-phone-help cart-phone-error"');
    expect(cartPageSource).toContain('id="cart-phone-error"');
    expect(cartPageSource).toContain('fixed inset-x-0 bottom-0');
    expect(cartPageSource).toContain('Confirmer WhatsApp ·');
    expect(cartPageSource).toContain('pb-28 lg:pb-0');
  });
});
