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
    zone: 'Secteur Dillon',
    offer: 'Traiteur, boxes repas et snacking',
    type: 'Traiteur',
    availability: 'Preparation quotidienne',
    story: 'Ninice prepare une cuisine maison inspiree des saveurs surinamiennes et martiniquaises, avec des plats genereux, du snacking sale-sucre et un service de proximite depuis Dillon.',
    promise: 'Cuisine fraiche, portions regulieres, retrait simple a Dillon',
    eta: 'Meme jour / J+1 selon flux',
    specialty: 'Colombo, moksi aleisi, bami, bara, gulab jamun et mini brochettes Saoto',
    highlights: [
      'Cuisine maison',
      'Traiteur',
      'Commande groupe',
      'Point relais: Barber Shop de Dillon',
      'Tarifs estimatifs provisoires',
    ],
    planifiable: true,
    enterprise: true
  }
];
