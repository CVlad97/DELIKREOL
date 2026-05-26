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
  contactEmail?: string;
  instagram?: {
    label: string;
    handle?: string;
    url?: string;
  };
  deliveryContact?: {
    label: string;
    phone?: string;
    note: string;
  };
  events?: Array<{
    title: string;
    description: string;
    location: string;
    schedule: string;
    status: string;
  }>;
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
    contactEmail: 'jereniceeduards@gmail.com',
    instagram: {
      label: 'Instagram a confirmer',
    },
    deliveryContact: {
      label: 'Orlanne BICTOLY',
      phone: '+33769433729',
      note: 'Livreuse sur le centre',
    },
    events: [
      {
        title: 'Atelier culinaire Ninice',
        description: 'Initiation simple autour des saveurs surinamiennes et martiniquaises: preparation, degustation et conseils pratiques.',
        location: 'Secteur Dillon / point relais Barber Shop de Dillon',
        schedule: 'Date a confirmer - preinscription possible',
        status: 'En preparation',
      },
      {
        title: 'Atelier snack & douceurs',
        description: 'Format court autour du bara, des mini brochettes Saoto et des douceurs type gulab jamun.',
        location: 'Dillon',
        schedule: 'Sur demande groupe ou entreprise',
        status: 'A planifier',
      },
    ],
    planifiable: true,
    enterprise: true
  }
];
