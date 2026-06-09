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
    name: 'An Tjè Coco',
    legalName: 'AN TJE COCO',
    zone: 'Fort-de-France',
    address: 'Fort-de-France, Martinique',
    offer: 'Crêpes gastronomiques, pépites salées et sucrées',
    type: 'Traiteur',
    availability: 'Précommande du dimanche au mardi 12h, retrait mercredi 12h-14h30, jeudi et vendredi 17h-20h',
    story: 'Fondée par Coralie Arnaud, infirmière anesthésiste reconvertie dans la gastronomie, An Tjè Coco réinvente la crêpe en Pépites artisanales sucrées et salées, avec des produits locaux, des saveurs antillaises et une approche haut de gamme.',
    promise: 'Pépites artisanales, produits locaux, précommande WhatsApp',
    eta: 'Conservation jusqu’à 72h',
    specialty: 'Pépite façon gratin de banane jaune, coco-passion, fleur d’oranger-pistache, rougail saucisses, poulet-curry-lait de coco, tiramisu café',
    highlights: [
      'Crêpes gastronomiques',
      'Pépites salées & sucrées',
      'Précommande WhatsApp',
      'Produits locaux',
      'Traiteur événementiel',
    ],
    contactPhone: '0696 85 70 77',
    contactEmail: 'antjecoco@gmail.com',
    instagram: {
      label: 'Instagram à confirmer',
    },
    events: [
      {
        title: 'Maison La Mauny x An Tjè Coco',
        description: 'Prestation événementielle avec accords rhum et pépites, sur réservation.',
        location: 'Maison La Mauny, Rivière-Pilote',
        schedule: 'Sur réservation',
        status: 'Actif',
      },
    ],
    planifiable: true,
    enterprise: true,
  },
  {
    name: "Coco's Food",
    legalName: "COCO'S FOOD",
    zone: 'Rivière-Pilote — Marché',
    address: 'Marché, 97211 Rivière-Pilote, Martinique',
    offer: 'Cuisine de marché créole et caribéenne, plats complets, bowls, paella, brochettes',
    type: 'Traiteur',
    availability: 'Service de marché, commandes à confirmer avant préparation',
    story: "Coco's Food, c'est la cuisine du marché de Rivière-Pilote : des plats complets faits maison, généreux et colorés. Du poulet rôti aux paellas noires aux fruits de mer, en passant par les brochettes panées et les bowls garnis, chaque assiette est pensée pour rassasier et faire plaisir. Une cuisine simple, authentique, avec des portions qui ne trichent pas.",
    promise: 'Cuisine de marché généreuse, variée, portions XXL',
    eta: 'Préparation à la commande',
    specialty: 'Plats du jour, paella fruits de mer, bowls, brochettes, poulet rôti',
    highlights: [
      'Cuisine de marché',
      'Marché de Rivière-Pilote',
      'Plats du jour variés',
      'Paella aux fruits de mer',
      'Bowls et assiettes complètes',
      'Brochettes panées',
      'Commande sur demande',
    ],
    contactPhone: '+596 696 25 47 20',
    instagram: {
      label: 'Instagram à confirmer',
    },
    planifiable: true,
    enterprise: true,
  },
  {
    name: "Saveurs d'Afrique",
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
  {
    name: 'Les Delices de Ninice',
    zone: 'Secteur Dillon',
    address: 'Barber Shop de Dillon, Fort-de-France',
    offer: 'Traiteur, boxes repas et snacking',
    type: 'Traiteur',
    availability: 'Preparation quotidienne',
    story: 'Les Délices de Ninice est une cuisine de rue surinamo-caraïbe, tenue par une passionnée qui réunit les épices du Suriname et la générosité antillaise dans des plats faits maison. Au menu : le Colombo des Deux Rives — un colombo signature entre deux mondes —, le Moksi Aleisi (riz sauté surinamais) décliné en versions poulet, porc ou végétarienne, le Bami des Îles, les bara (beignets croustillants) accompagnés de sauce maison, les mini brochettes Saoto, et les douceurs gulab jamun. Retrait au Barber Shop de Dillon, Fort-de-France. Service traiteur et ateliers culinaires sur demande.',
    promise: 'Cuisine maison, saveurs surinamiennes et caraïbes, retrait facile à Dillon',
    eta: 'Meme jour / J+1 selon flux',
    specialty: 'Colombo, moksi aleisi, bami, bara, gulab jamun et mini brochettes Saoto',
    highlights: [
      'Cuisine maison',
      'Mélange Suriname / Caraïbes',
      'Traiteur de proximité',
      'Point relais: Barber Shop de Dillon',
      'Commande groupe',
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
        description: 'Rencontre cuisine autour des saveurs surinamiennes et caraïbes: préparation, dégustation et conseils pratiques.',
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
];
