import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  buildWhatsAppOrderFingerprint,
  createWhatsAppIdempotencyKey,
  readPreparedWhatsAppOrder,
  releaseWhatsAppOrderLock,
  tryAcquireWhatsAppOrderLock,
  writePreparedWhatsAppOrder,
} from '../src/utils/whatsappOrderIdempotency';

const items = [
  {
    id: '11111111-1111-4111-8111-111111111111',
    name: 'Colombo',
    price: 12,
    quantity: 2,
    vendor_id: 'vendor-a',
  },
  {
    id: '22222222-2222-4222-8222-222222222222',
    name: 'Jus local',
    price: 4,
    quantity: 1,
    vendor_id: 'vendor-a',
  },
];

describe('whatsapp order idempotency', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('produit la même empreinte pour le même panier malgré l’ordre des lignes', () => {
    const first = buildWhatsAppOrderFingerprint({
      items,
      mode: 'retrait',
      commune: ' Fort-de-France ',
      creneauText: 'Midi',
      notes: ' Sans piment ',
      phone: '0696 12 34 56',
      email: 'CLIENT@EXAMPLE.COM',
    });
    const second = buildWhatsAppOrderFingerprint({
      items: [...items].reverse(),
      mode: 'retrait',
      commune: 'fort-de-france',
      creneauText: 'midi',
      notes: 'sans piment',
      phone: '+596 696 12 34 56',
      email: 'client@example.com',
    });

    expect(first).toBe(second);
  });

  it('réutilise une clé stable pour deux appels identiques', async () => {
    const input = {
      items,
      mode: 'livraison',
      commune: 'Schoelcher',
      creneauText: 'Soir',
      notes: '',
      phone: '0696123456',
      email: '',
    };

    await expect(createWhatsAppIdempotencyKey(input)).resolves.toBe(await createWhatsAppIdempotencyKey(input));
  });

  it('verrouille un double appel concurrent et libère le verrou propriétaire', () => {
    const key = 'public_manual_test_key';
    const owner = tryAcquireWhatsAppOrderLock(key, 1_000);

    expect(owner).toEqual(expect.any(String));
    expect(tryAcquireWhatsAppOrderLock(key, 1_001)).toBeNull();

    releaseWhatsAppOrderLock(key, owner);
    expect(tryAcquireWhatsAppOrderLock(key, 1_002)).toEqual(expect.any(String));
  });

  it('ne laisse passer qu’une seule préparation logique sur 20 tentatives', () => {
    const key = 'public_manual_concurrent';
    const owners = Array.from({ length: 20 }, (_, index) => tryAcquireWhatsAppOrderLock(key, 2_000 + index));

    expect(owners.filter(Boolean)).toHaveLength(1);
  });

  it('conserve une demande préparée pour reprise après rafraîchissement', () => {
    writePreparedWhatsAppOrder({
      idempotencyKey: 'public_manual_resume',
      orderId: 'order-id',
      orderNumber: 'DK-20260729-ABC123',
      whatsappUrl: 'https://wa.me/596696653589?text=test',
      persistedInSupabase: false,
      createdAt: '2026-07-29T00:00:00.000Z',
    });

    expect(readPreparedWhatsAppOrder('public_manual_resume')?.orderNumber).toBe('DK-20260729-ABC123');
  });
});
