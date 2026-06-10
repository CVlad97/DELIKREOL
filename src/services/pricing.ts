// DeliKreol — Tarification plats
// Formule : prix_client = prix_net_vendeur / 0.85
// Arrondi : 0,50 / 0,90 / euro supérieur

export function computeClientPrice(prixNetVendeur: number): number {
  const raw = prixNetVendeur / 0.85;
  return roundCommercial(raw);
}

export function computeCommission(prixNetVendeur: number): number {
  return computeClientPrice(prixNetVendeur) - prixNetVendeur;
}

function roundCommercial(price: number): number {
  const decimal = price - Math.floor(price);
  if (decimal <= 0.25) return Math.floor(price) + 0.50;
  if (decimal <= 0.60) return Math.floor(price) + 0.90;
  return Math.ceil(price);
}

export function formatPrice(price: number): string {
  return price.toFixed(2).replace('.', ',') + ' €';
}

export interface PriceBreakdown {
  prixNetVendeur: number;
  commissionDelikreol: number;
  prixClient: number;
  tauxCommission: number;
}

export function getPriceBreakdown(prixNetVendeur: number): PriceBreakdown {
  const prixClient = computeClientPrice(prixNetVendeur);
  return {
    prixNetVendeur,
    commissionDelikreol: prixClient - prixNetVendeur,
    prixClient,
    tauxCommission: 15, // 15%
  };
}

// Forfaits partenaires
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
    description: 'Le partenaire modifie lui-même ses plats, photos, prix, compositions, bio et horaires.',
    features: [
      'Modification libre de la fiche',
      'Photos, prix, description, bio',
      'Accès espace partenaire',
      'Support par email',
    ],
  },
  {
    id: 'mise-en-ligne',
    name: 'Mise en ligne simple',
    price: 49,
    description: 'DELIKREOL importe jusqu\'à 10 photos, corrige les descriptions principales et publie la fiche.',
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
    description: 'DELIKREOL importe jusqu\'à 25 photos, rédige les descriptions, structure les catégories et optimise la bio.',
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
    description: 'DELIKREOL gère les mises à jour régulières : nouveaux plats, prix, promos, photos, disponibilités.',
    features: [
      'Mise à jour mensuelle',
      'Nouveaux plats et prix',
      'Photos et promos',
      'Disponibilités en temps réel',
    ],
  },
];