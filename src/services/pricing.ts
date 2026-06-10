// DeliKreol — Règles de tarification (source unique de vérité)

/** Frais de livraison standard (à confirmer selon commune) */
export const DELIVERY_FEE_EUR = 3.5;

/** Frais de service DeliKreol (si applicable) */
export const SERVICE_FEE_EUR = 1;

/** Seuil pour livraison éloignée */
export const DELIVERY_THRESHOLD_EUR = 40;

/** Message livraison standard */
export const DELIVERY_NOTICE =
  `Livraison éloignée possible à partir de ${DELIVERY_THRESHOLD_EUR} € de commande, selon validation du prestataire et disponibilité DeliKreol.`;

/** Texte affiché si livraison non calculée */
export const DELIVERY_PENDING_TEXT = 'À confirmer sur WhatsApp selon commune et disponibilité';

/** Texte affiché si retrait */
export const PICKUP_TEXT = 'Frais de livraison non appliqués';

/** Calcule le total estimé */
export function estimateTotal(subtotal: number, mode: 'retrait' | 'livraison'): {
  subtotal: number;
  deliveryFee: number | null;
  serviceFee: number;
  estimatedTotal: number;
} {
  const deliveryFee = mode === 'livraison' ? DELIVERY_FEE_EUR : 0;
  return {
    subtotal,
    deliveryFee: mode === 'livraison' ? DELIVERY_FEE_EUR : null,
    serviceFee: SERVICE_FEE_EUR,
    estimatedTotal: subtotal + deliveryFee + SERVICE_FEE_EUR,
  };
}