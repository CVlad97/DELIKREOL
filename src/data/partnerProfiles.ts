export type PartnerProfile = {
  name: string;
  legalName?: string;
  zone: string;
  address?: string;
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
    address: 'Barber Shop de Dillon, Fort-de-France',
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
    legalName: 'LODIKA SAVEURS D\'AFRIQUE',
    zone: 'Rivière-Salée — quartier Laugier',
    address: 'Chemin la Simon, quartier la Laugier, 97215 Rivière-Salée, Martinique',
    offer: 'Cuisine africaine, buffet, traiteur et commandes groupe',
    type: 'Traiteur',
    availability: 'Lundi, mardi, jeudi, vendredi 08:00-15:00',
    story: 'Restaurant-traiteur de Rivière-Salée, identifié publiquement sous le nom Lodika Saveurs d’Afrique. L’adresse est connue pour une cuisine africaine maison, des portions généreuses et une offre orientée déjeuner, retrait et commande de groupe.',
    promise: 'Cuisine maison, portions généreuses, accueil convivial',
    eta: 'Préparation sur commande',
    specialty: 'Matoutou de crabe, plats africains maison, boissons et desserts',
    highlights: [
      'Cuisine africaine',
      'Nom public: Lodika Saveurs d\'Afrique',
      'Adresse publique vérifiée',
      'Téléphone public disponible',
      'Commande groupe',
      'Retrait ou livraison selon zone',
    ],
    contactPhone: '0596 68 12 25',
    instagram: {
      label: 'Instagram a confirmer',
    },
    planifiable: true,
    enterprise: true,
  },
];
