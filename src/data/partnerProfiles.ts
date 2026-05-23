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
    highlights: ['Cuisine maison', 'Traiteur', 'Commande groupe'],
    planifiable: true,
    enterprise: true
  },
  {
    name: 'Traiteur Kreyol FDF',
    zone: 'Fort-de-France',
    offer: 'Plats du jour et desserts',
    type: 'Traiteur',
    availability: 'Commande J+0 / J+1',
    story: 'Cuisine familiale, portions genereuses et recettes traditionnelles.',
    promise: 'Portions genereuses, recettes creoles',
    eta: 'Confirmation rapide',
    specialty: 'Plats creoles, portions famille',
    highlights: ['Planifiable', 'Commande groupe', 'Fait maison'],
    planifiable: true,
    enterprise: true
  },
  {
    name: 'Boutik Lakay',
    zone: 'Lamentin',
    offer: 'Paniers frais et douceurs',
    type: 'Epicerie locale',
    availability: 'Stock limite',
    story: 'Selection locale, fruits et douceurs de saison.',
    promise: 'Produits frais, paniers saisonniers',
    eta: 'Disponibilite journaliere',
    specialty: 'Paniers, jus, epicerie',
    highlights: ['Produits frais', 'Edition limite'],
    planifiable: false,
    enterprise: false
  },
  {
    name: 'Saveurs du Nord',
    zone: 'Schoelcher',
    offer: 'Repas familiaux',
    type: 'Cuisine creole',
    availability: 'Confirmation rapide',
    story: 'Menus creoles du nord, faits maison.',
    promise: 'Cuisine maison, saveurs du nord',
    eta: 'J+0 / J+1',
    specialty: 'Recettes traditionnelles',
    highlights: ['Cuisine maison', 'Planifiable'],
    planifiable: true,
    enterprise: false
  }
];
