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
  contactPhone?: string;
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
    enterprise: true,
  },
  {
    name: 'Saveurs d\'Afrique',
    zone: 'Rivière-Salée — quartier Laugier',
    offer: 'Cuisine africaine, plats maison, boissons et commandes groupe',
    type: 'Traiteur',
    availability: 'Sur commande / horaires à confirmer',
    story: 'Référencé comme Lodika Saveurs d’Afrique à Rivière-Salée, quartier Laugier / chemin de la Simon, ce traiteur est présenté comme une adresse conviviale de cuisine africaine maison, avec des plats généreux, une belle réputation locale et un service orienté commande et retrait.',
    promise: 'Cuisine maison, portions généreuses, saveurs authentiques',
    eta: 'Préparation sur commande',
    specialty: 'Foutou banane, ablo, atassi, pâte sauce légume, pâte sauce gombo, pâte rouge, bissap, yaourts, petits cailloux et doko',
    highlights: [
      'Cuisine africaine',
      'Adresse Rivière-Salée',
      'Menu riche',
      'Commande groupe',
      'Retrait ou livraison selon zone',
      'Référencé aussi comme Lodika',
    ],
    contactPhone: '+596696677679',
    instagram: {
      label: 'Instagram a confirmer',
    },
    planifiable: true,
    enterprise: true,
  },
];
