import { describe, expect, it } from 'vitest';
import { partnerOrderMessage, partnerOrderWhatsappLink, toInternationalDigits } from './whatsapp';

const order = {
  orderNumber: 'DK-20261115-ABC123',
  customerName: 'Marie',
  commune: 'Fort-de-France',
  mode: 'livraison',
  totalAmount: 24,
  lines: [
    { product_name: 'Poulet boucané', quantity: 2 },
    { product_name: 'Jus de goyave', quantity: 1 },
  ],
};

describe('numéro international', () => {
  it('convertit un numéro martiniquais local en format wa.me', () => {
    expect(toInternationalDigits('0696 17 80 00')).toBe('596696178000');
  });

  it('laisse intact un numéro déjà international', () => {
    expect(toInternationalDigits('+596 696 17 80 00')).toBe('596696178000');
  });
});

describe('lien WhatsApp traiteur', () => {
  it('construit un lien vers le traiteur avec la commande pré-remplie', () => {
    const link = partnerOrderWhatsappLink('+596 696 17 80 00', order);
    expect(link).toContain('https://wa.me/596696178000?text=');
    expect(decodeURIComponent(link!.split('text=')[1])).toContain('DK-20261115-ABC123');
  });

  it('renvoie null sans numéro exploitable plutôt qu\'un lien vide', () => {
    expect(partnerOrderWhatsappLink(null, order)).toBeNull();
    expect(partnerOrderWhatsappLink('', order)).toBeNull();
    expect(partnerOrderWhatsappLink('123', order)).toBeNull();
  });
});

describe('message traiteur', () => {
  it('contient les articles, le total et le client', () => {
    const message = partnerOrderMessage(order);
    expect(message).toContain('2 × Poulet boucané');
    expect(message).toContain('1 × Jus de goyave');
    expect(message).toContain('24,00 €');
    expect(message).toContain('Marie · Fort-de-France');
    expect(message).toContain('Merci de confirmer la préparation');
  });

  it('reste lisible quand le client n\'a pas renseigné son nom', () => {
    const message = partnerOrderMessage({ orderNumber: 'DK-1', totalAmount: 0 });
    expect(message).toContain('DK-1');
    expect(message).not.toContain('Total');
    expect(message).not.toContain('Client');
  });
});
