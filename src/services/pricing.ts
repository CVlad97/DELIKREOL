// DELIKREOL — Tarification complète
// Source unique de vérité pour tous les calculs de prix
// Formule : prix_client = prix_net_vendeur / 0.85

// ═══════════════════════════════════════════════════
// MODES DE LIVRAISON
// ═══════════════════════════════════════

export type DeliveryMode = 'retrait' | 'relais' | 'livraison';

export const DELIVERY_FEES: Record<DeliveryMode, { label: string; fee: number; description: string }> = {
  retrait: { label: 'Retrait', fee: 0, description: 'Retrait chez le partenaire — gratuit' },
  relais: { label: 'Point relais', fee: 2.5, description: 'Retrait en point relais + 2,50 €' },
  livraison: { label: 'Livraison', fee: 4, description: 'Livraison à domicile + 4,00 €' },
};

/** Part livreur dans les 4€ de livraison */
export const DRIVER_SHARE_EUR = 3.5;

/** Part DELIKREOL logistique */
export const DELIKREOL_LOGISTICS_EUR = 0.5;

/** Seuil livraison éloignée */
export const DELIVERY_THRESHOLD_EUR = 40;
export const DELIVERY_NOTICE = `Livraison éloignée possible à partir de ${DELIVERY_THRESHOLD_EUR} € de commande, sous réserve de validation.`;

// ═══════════════════════════════════════════════════
// CALCUL PRIX CLIENT
// ═══════════════════════════════════════

/** Prix client DELIKREOL = prix_net_vendeur / 0.85 */
export function computeClientPrice(prixNetVendeur: number): number {
  return roundCommercial(prixNetVendeur / 0.85);
}

/** Commission DELIKREOL = prix_client - prix_net_vendeur */
export function computeCommission(prixNetVendeur: number): number {
  return computeClientPrice(prixNetVendeur) - prixNetVendeur;
}

function roundCommercial(price: number): number {
  const decimal = price - Math.floor(price);
  if (decimal <= 0.25) return Math.floor(price) + 0.5;
  if (decimal <= 0.6) return Math.floor(price) + 0.9;
  return Math.ceil(price);
}

/** Prix total client selon mode */
export function computeTotal(clientPrice: number, mode: DeliveryMode): number {
  return clientPrice + DELIVERY_FEES[mode].fee;
}

// ═══════════════════════════════════════════════════
// DÉCOMPOSITION COMPLÈTE
// ═══════════════════════════════════════

export interface FullBreakdown {
  prixNetVendeur: number;
  prixClientDelikreol: number;
  commissionDelikreol: number;
  fraisMode: number;
  totalClient: number;
  partLivreur: number | null;
  partDelikreolLogistique: number | null;
}

export function getFullBreakdown(prixNetVendeur: number, mode: DeliveryMode): FullBreakdown {
  const prixClient = computeClientPrice(prixNetVendeur);
  const totalClient = computeTotal(prixClient, mode);
  return {
    prixNetVendeur,
    prixClientDelikreol: prixClient,
    commissionDelikreol: prixClient - prixNetVendeur,
    fraisMode: DELIVERY_FEES[mode].fee,
    totalClient,
    partLivreur: mode === 'livraison' ? DRIVER_SHARE_EUR : null,
    partDelikreolLogistique: mode === 'livraison' ? DELIKREOL_LOGISTICS_EUR : null,
  };
}

export function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' €';
}

// ═══════════════════════════════════════════════════
// FORFAITS PARTENAIRES OPTIONNELS
// ═══════════════════════════════════════

export interface PartnerPlan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export const PARTNER_PLANS: PartnerPlan[] = [
  {
    id: 'autonome',
    name: 'Accès autonome',
    price: 0,
    description: 'Envoyez vos corrections à DELIKREOL. Nous les appliquons gratuitement avant publication.',
    features: [
      'Corrections gratuites par WhatsApp',
      'Photos, prix, description, bio',
      'Accès espace partenaire (prochainement)',
      'Support par email',
    ],
  },
  {
    id: 'mise-en-ligne',
    name: 'Mise en ligne simple',
    price: 49,
    description: 'DELIKREOL importe jusqu\'à 10 photos et corrige les descriptions principales.',
    features: [
      'Import jusqu\'à 10 photos',
      'Correction descriptions principales',
      'Mise en ligne complète',
      'Validation avant publication',
    ],
  },
  {
    id: 'catalogue-optimise',
    name: 'Catalogue complet optimisé',
    price: 89,
    description: 'DELIKREOL importe jusqu\'à 25 photos, rédige les descriptions et optimise la bio.',
    features: [
      'Import jusqu\'à 25 photos',
      'Rédaction descriptions complètes',
      'Structuration catégories',
      'Bio optimisée et fiche vendeuse',
    ],
  },
  {
    id: 'gestion-mensuelle',
    name: 'Gestion mensuelle',
    price: 39,
    description: 'DELIKREOL gère les mises à jour régulières : nouveaux plats, prix, promos.',
    features: [
      'Mise à jour mensuelle',
      'Nouveaux plats et prix',
      'Photos et promos',
      'Disponibilités en temps réel',
    ],
  },
];