import { describe, expect, it } from 'vitest';
import { simulateDeliveryQuote } from './pricing';
describe('simulation transport hors encaissement', () => {
 it('préserve 4 € pour le livreur à 3 km, plus la marge', () => { expect(simulateDeliveryQuote(3, false, 0.15)).toMatchObject({ driverPay: 4, platformGrossMargin: 0.15, customerDeliveryFee: 4.15 }); });
 it('applique la majoration proposée après 3 km', () => { expect(simulateDeliveryQuote(4, false, 0.5)).toMatchObject({ driverPay: 4.75, customerDeliveryFee: 5.25, distanceSurcharge: 0.75 }); });
 it('ajoute la majoration de nuit au livreur', () => { expect(simulateDeliveryQuote(3, true, 0.30)).toMatchObject({ driverPay: 5.5, customerDeliveryFee: 5.8, nightSurcharge: 1.5 }); });
 it('refuse une distance inconnue', () => { expect(() => simulateDeliveryQuote(NaN, false)).toThrow(); });
});
