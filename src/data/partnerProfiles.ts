export type PartnerProfile = {
  name: string;
  zone: string;
  offer: string;
  type: string;
  availability: string;
  story: string;
  promise: string;
  eta: string;
  specialty: string;
  highlights: string[];
  planifiable: boolean;
  enterprise: boolean;
};

export const partnerProfiles: PartnerProfile[] = [
  {
    name: 'Les Delices de Ninice',
    zone: 'Martinique centre / sud',
    offer: 'Traiteur, boxes repas et snacking',
    type: 'Traiteur',
    availability: 'Preparation quotidienne',
    story: 'Cuisine maison orientee portions genereuses et service de proximite.',
    promise: 'Cuisine fraiche, portions regulieres, commande simple',
    eta: 'Meme jour / J+1 selon flux',
    specialty: 'Boxes creoles, accras, brochettes',
    highlights: ['Cuisine maison', 'Traiteur', 'Commande groupe', 'Tarifs estimatifs provisoires'],
    planifiable: true,
    enterprise: true
  }
];
