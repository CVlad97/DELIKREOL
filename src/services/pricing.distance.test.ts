import { describe, expect, it } from 'vitest';
import { minimumBasketByDistance, remainingToMinimum } from './pricing';
describe('minimum panier selon distance', () => {
  it('applique 15 € jusqu’à 3 km inclus', () => { expect(minimumBasketByDistance(0)).toBe(15); expect(minimumBasketByDistance(3)).toBe(15); });
  it('applique 20 € entre 3 et 10 km', () => { expect(minimumBasketByDistance(3.01)).toBe(20); expect(minimumBasketByDistance(10)).toBe(20); });
  it('applique 30 € au-delà ou distance inconnue', () => { expect(minimumBasketByDistance(10.01)).toBe(30); expect(minimumBasketByDistance(null)).toBe(30); expect(minimumBasketByDistance(NaN)).toBe(30); expect(minimumBasketByDistance(-1)).toBe(30); });
  it('calcule le complément hors frais de livraison', () => { expect(remainingToMinimum(24.5, null)).toBe(5.5); expect(remainingToMinimum(35, null)).toBe(0); });
});
