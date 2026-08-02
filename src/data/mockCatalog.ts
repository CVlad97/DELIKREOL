function vendorImage(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path.replace(/^\//, '')}`;
}

export const photoAConfirmer = vendorImage('vendors/_fallback/photo-a-confirmer.svg');

export interface LocalProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  category: string;
  image?: string;
  description?: string;
  zone?: string;
  available: boolean;
  featured?: boolean;
  ingredients?: string;
  allergens?: string;
  /** Statut qualité photo : validée | floue | non bankable | à valider */
  photoQuality?: 'validée' | 'floue' | 'non bankable' | 'à valider';
  /** Statut qualité description : validée | à corriger | composition manquante | à valider */
  descQuality?: 'validée' | 'à corriger' | 'composition manquante' | 'à valider';
  /** Tags santé : diabétique, sans-sel, fibre, sans-gluten, vegan, etc. */
  healthTags?: HealthTag[];
}

export type HealthTag = 'diabétique' | 'sans-sel' | 'fibre' | 'sans-gluten' | 'vegan' | 'equilibre' | 'brunch' | 'traiteur-evenementiel' | 'fait-maison';

export const HEALTH_TAGS: { id: HealthTag; name: string; icon: string; description: string }[] = [
  { id: 'diabétique', name: 'Diabétique', icon: '🩺', description: 'Sans sucre ajouté, adapté aux diabétiques' },
  { id: 'sans-sel', name: 'Sans sel', icon: '🧂', description: 'Pauvre en sodium, pour régime sans sel' },
  { id: 'fibre', name: 'Riche en fibres', icon: '🌾', description: 'Aliments riches en fibres alimentaires' },
  { id: 'sans-gluten', name: 'Sans gluten', icon: '🌾', description: 'Convient aux intolérants au gluten' },
  { id: 'vegan', name: 'Vegan', icon: '🌱', description: 'Sans produit animal' },
  { id: 'equilibre', name: 'Équilibré', icon: '⚖️', description: 'Repas équilibré, Healthy' },
  { id: 'fait-maison', name: 'Fait maison', icon: '✓', description: 'Préparation artisanale maison' },
];

export type Category = {
  id: string;
  name: string;
  description?: string;
};

export const mockCategories: Category[] = [
  { id: 'plats', name: 'Plats' },
  { id: 'snacking', name: 'Snacking' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'boissons', name: 'Boissons' },
  { id: 'bowl', name: 'Bowl' },
  { id: 'pates', name: 'Pâtes' },
  { id: 'traiteur-evenementiel', name: 'Traiteur événementiel' },
  { id: 'commandes-entreprise', name: 'Commandes entreprise' },
];

export const mockProducts: LocalProduct[] = [
  // ═══════════════════════════════════════════════════════
  // SNACK SAVÈ PEYI'A — Rivière-Pilote (Pont de Fer)
  // 3 produits confirmés — photo flyer disponible
  // ═══════════════════════════════════════════════════════
  {
    id: 'save-peyia-cote-porc',
    name: 'Côte de porc riz crudités',
    vendor: 'Snack Save Peyia',
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg'),
    description: 'Côte de porc grillée au feu de bois, tendre et savoureuse, servie avec du riz blanc parfumé et des crudités fraîches. Le plat signature de Snack Savè Peyi\'A, un régal généreux fait maison ! 🔥',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Côte de porc grillée, riz blanc, salade verte, tomate, sauce maison.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'save-peyia-filet-poulet',
    name: 'Filet de poulet',
    vendor: 'Snack Save Peyia',
    price: 10,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Filet de poulet grillé aux herbes, mariné maison, accompagné de riz parfumé, lentilles pays, légumes et crudités fraîches. Sain, généreux, fait maison avec amour ! 🐔',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
        ingredients: 'Filet de poulet grillé, accompagné de riz, lentilles, légumes pays et crudités.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'save-peyia-crevettes',
    name: 'Crevettes riz crudités',
    vendor: 'Snack Save Peyia',
    price: 14,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Crevettes sautées aux épices locales et oignons, servies avec du riz blanc et une salade fraîche croquante. Un plat léger et savoureux, parfait pour découvrir les saveurs de Snack Savè Peyi\'A ! 🦐',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Crevettes sautées, oignons, tomates, riz blanc, salade verte, tomate, sauce maison.',
    allergens: 'Crustacés.'
  },
  {
    id: 'save-peyia-cote-agneau',
    name: 'Côte d\'agneau',
    vendor: 'Snack Save Peyia',
    price: 16,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Côte d\'agneau grillée aux épices, fondante et parfumée, servie avec frites maison, gratin, légumes pays ou riz au choix.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Côte d\'agneau grillée. Accompagnements : frites, gratin, légumes pays, riz, lentilles, bananes frites, crudités.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'save-peyia-entrecote',
    name: 'Entrecôte',
    vendor: 'Snack Save Peyia',
    price: 18,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0008.jpg'),
    description: 'Entrecôte grillée, cuisson maîtrisée, servie avec frites maison croustillantes, gratin, légumes pays ou riz au choix. 🥩',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Entrecôte grillée. Accompagnements : frites, gratin, légumes pays, riz, lentilles, bananes frites, crudités.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'save-peyia-bavette',
    name: 'Bavette de bœuf',
    vendor: 'Snack Save Peyia',
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0009.jpg'),
    description: 'Bavette de bœuf grillée, tendre et savoureuse, accompagnée de frites maison, gratin, légumes pays ou riz au choix.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Bavette de bœuf grillée. Accompagnements : frites, gratin, légumes pays, riz, lentilles, bananes frites, crudités.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'save-peyia-cabri',
    name: 'Cabri',
    vendor: 'Snack Save Peyia',
    price: 16,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0010.jpg'),
    description: 'Cabri grillé aux épices créoles, une spécialité antillaise généreuse, servie avec frites, gratin, légumes pays ou riz au choix. 🐐',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Cabri grillé. Accompagnements : frites, gratin, légumes pays, riz, lentilles, bananes frites, crudités.',
    allergens: 'À confirmer avec le prestataire.'
  },







  {
    id: 'save-peyia-panini-saumon',
    name: 'Panini saumon',
    vendor: 'Snack Save Peyia',
    price: 8,
    category: 'Snacking',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0011.jpg'),
    description: 'Panini chaud garni de saumon, laitue, fromage râpé et sauce maison, toasté sur place. Idéal pour un déjeuner rapide et gourmand ! 🥪',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Pain panini, saumon, laitue, fromage râpé, sauce maison.',
    allergens: 'Gluten, poisson, produits laitiers.'
  },
  {
    id: 'save-peyia-cocktail-fruit',
    name: 'Cocktail de fruits',
    vendor: 'Snack Save Peyia',
    price: 6,
    category: 'Snacking',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0015.jpg'),
    description: 'Cocktail de fruits frais rafraîchissant — jus naturels, glaçons, citron vert, ananas. Sans alcool. Parfait pour se désaltérer sous le soleil martiniquais ! 🍍🥤',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Jus de fruits frais, glaçons, citron vert, ananas.',
    allergens: 'Aucun.'
  },
  {
    id: 'save-peyia-cocktail-alcool',
    name: 'Cocktail fruits (alcool)',
    vendor: 'Snack Save Peyia',
    price: 10,
    category: 'Snacking',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0016.jpg'),
    description: 'Cocktail de fruits frais avec alcool (rhum, punch). Rafraîchissant et festif, idéal pour les soirées vendredi et samedi au Pont de Fer ! 🍹',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Jus de fruits frais, alcool (rhum/punch), glaçons, citron vert, ananas.',
    allergens: 'Alcool. Service réservé aux adultes.'
  },
  {
    id: 'save-peyia-salade-fruits-assortie',
    name: 'Salade de fruits frais',
    vendor: 'Snack Save Peyia',
    price: 6,
    category: 'Snacking',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0012.jpg'),
    description: 'Salade de fruits frais de saison — ananas, pastèque, kiwi, raisins — en coupelle. Vitamines et fraîcheur garanties ! 🍉🍍',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Fruits frais de saison (ananas, pastèque, kiwi, raisins).',
    allergens: 'Aucun.'
  },
  {
    id: 'save-peyia-salade-fruits-rhum',
    name: 'Salade de fruits au rhum',
    vendor: 'Snack Save Peyia',
    price: 10,
    category: 'Snacking',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0013.jpg'),
    description: 'Salade de fruits frais de saison marinée au rhum arrangé. Une explosion de saveurs antillaises ! Idéal pour les soirées. 🥃',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Fruits frais de saison, rhum arrangé, glaçons.',
    allergens: 'Alcool. Service réservé aux adultes.'
  },

  // ═══════════════════ MENU SAVE PEYI'A — CARTE ═══════════════
















  //   // ═══════════════════════════════════════════════════════
  // AN TJÈ COCO — Fort-de-France
  // Pépites artisanales sucrées et salées — sur précommande
  // Source : profil partenaire vérifié
  // ═══════════════════════════════════════════════════════
  {
    id: 'antjecoco-pepite-gratin-banane',
    name: 'Pépite façon gratin de banane jaune',
    vendor: 'An Tjè Coco',
    price: 9,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Pépite artisanale salée façon gratin de banane jaune. Sur précommande du dimanche au mardi 12h, retrait mercredi ou jeudi/vendredi.',
    zone: 'Fort-de-France',
    available: true,
    featured: true,
    ingredients: 'Banane jaune, fromage râpé, œuf, épices antillaises, farine. Composition à valider avec la prestataire.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'antjecoco-pepite-coco-passion',
    name: 'Pépite coco-passion',
    vendor: 'An Tjè Coco',
    price: 8,
    category: 'Desserts',
    image: photoAConfirmer,
    description: 'Pépite artisanale sucrée à la noix de coco et au fruit de la passion. Une douceur antillaise raffinée.',
    zone: 'Fort-de-France',
    available: true,
    featured: true,
    ingredients: 'Noix de coco, fruit de la passion, farine, œufs. Composition à confirmer.',
    allergens: 'Gluten, œufs. Autres allergènes à confirmer.',
  },
  {
    id: 'antjecoco-rougail-saucisses',
    name: 'Pépite rougail saucisses',
    vendor: 'An Tjè Coco',
    price: 10,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Pépite salée au rougail saucisses, une revisite créole de la crêpe gastronomique.',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Saucisses, tomate, oignons, épices. Composition à confirmer.',
    allergens: 'Gluten (blé). Sans œufs ni produits laitiers.'
  },
  {
    id: 'antjecoco-tiramisu-cafe',
    name: 'Pépite tiramisu café',
    vendor: 'An Tjè Coco',
    price: 8,
    category: 'Desserts',
    image: photoAConfirmer,
    description: 'Pépite sucrée façon tiramisu au café. Une fusion italo-créole en format bouchée.',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Café, mascarpone, cacao. Composition à confirmer.',
    allergens: 'Gluten, produits laitiers. Autres allergènes à confirmer.',
  },

  // ═══════════════════════════════════════════════════════
    // COCO'S FOOD — Rivière-Pilote
    // 9 produits — photos analysées par vision AI (juin 2026)
    // Les chemins d'images ont été ré-associés pour correspondre
    // au contenu réel des photos (les fichiers étaient mal nommés)
    // ═══════════════════════════════════════════════════════
    {
      id: 'cocos-food-paella-noire',
      name: 'Paella noire aux fruits de mer',
      vendor: "Coco's Food",
      price: 15,
      category: 'Plats',
      image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0081.jpg'),
      description: 'Riz noir à l\'encre de seiche, généreusement garni de crevettes, moules et morceaux de poisson, relevé de lanières de poivrons jaunes et rouges, petits pois et oignons frais. La spécialité signature de Coco\'s Food, un plat marin riche en saveurs et en couleurs.',
      zone: 'Rivière-Pilote',
      available: true,
      featured: true,
      ingredients: 'Riz, encre de seiche, crevettes, moules, poisson blanc, poivrons, oignons, petits pois, épices.',
      allergens: 'Crustacés, mollusques, poisson.',
      healthTags: ['fait-maison'],
    },
    {
      id: 'cocos-food-box-grille',
      name: 'Box grillé du marché',
      vendor: "Coco's Food",
      price: 12,
      category: 'Plats',
      image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg'),
      description: 'Viande de porc grillée marinée aux épices, cuite à la perfection avec une belle croûte caramélisée, servie avec un riz aux pois parfumé, du maïs doux, des carottes râpées et une salade de concombre frais. Un plat généreux relevé d\'herbes fraîches.',
      zone: 'Rivière-Pilote',
      available: true,
      featured: true,
      ingredients: 'Viande de porc grillée, riz aux pois, maïs, carottes, concombre, oignons, herbes fraîches, épices.',
      allergens: 'À confirmer avec la partenaire.',
      healthTags: ['fait-maison'],
    },
    {
      id: 'cocos-food-poulet-roti',
      name: 'Poulet rôti, riz & crudités',
      vendor: "Coco's Food",
      price: 11,
      category: 'Plats',
      image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0066.jpg'),
      description: 'Pilons de poulet rôtis à la peau dorée et caramélisée, marinés aux herbes et épices, servis sur un lit de riz assaisonné. Accompagnés de chou rouge croquant, carottes râpées, maïs doux, salade verte et une salsa créole aux oignons et piment frais.',
      zone: 'Rivière-Pilote',
      available: true,
      featured: true,
      ingredients: 'Poulet, riz aux herbes, chou rouge, carottes, maïs, laitue, oignons, piment, épices.',
      allergens: 'À confirmer avec la partenaire.',
      healthTags: ['fait-maison'],
    },
    {
      id: 'cocos-food-box-poisson-avocat',
      name: 'Box poisson & avocat',
      vendor: "Coco's Food",
      price: 13,
      category: 'Plats',
      image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0076.jpg'),
      description: 'Chiquetaille de morue parfumée à l\'huile et aux herbes, accompagnée de ti-nains (bananes vertes bouillies) fondants, d\'une belle tranche d\'avocat bien mûr, d\'une salade de concombre et oignons croquants, le tout relevé d\'une vinaigrette maison. Servi avec un jus de fruits cocktail artisanal.',
      zone: 'Rivière-Pilote',
      available: true,
      featured: true,
      ingredients: 'Morue effilochée, bananes vertes (ti-nain), avocat, concombre, oignons, herbes, huile, citron, piment.',
      allergens: 'Poisson.',
      healthTags: ['fait-maison'],
    },
    {
      id: 'cocos-food-brochettes',
      name: 'Brochettes panées du marché',
      vendor: "Coco's Food",
      price: 12,
      category: 'Plats',
      image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0077.jpg'),
      description: 'Pièces panées dorées et croustillantes, servies avec un accompagnement du jour. Plat généreux de marché, à confirmer selon disponibilité.',
      zone: 'Rivière-Pilote',
      available: true,
      featured: true,
      ingredients: 'Pièces panées, accompagnement du jour, herbes et épices. Composition exacte à confirmer avec la partenaire.',
      allergens: 'Gluten possible. Autres allergènes à confirmer.',
      healthTags: ['fait-maison'],
    },
    {
      id: 'cocos-food-friture',
      name: 'Friture caramélisée',
      vendor: "Coco's Food",
      price: 10,
      category: 'Snacking',
      image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0080.jpg'),
      description: 'Bananes plantains mûres frites caramélisées, mélangées à des morceaux de porc ou bœuf frits et des rondelles de saucisse, relevés d\'oignons émincés et de piment. Un alloco-viande généreux aux saveurs sucrées-salées irrésistibles.',
      zone: 'Rivière-Pilote',
      available: true,
      featured: false,
      ingredients: 'Banane plantain, viande de porc ou bœuf, saucisse, oignons, piment, huile, épices.',
      allergens: 'À confirmer avec la partenaire.',
      healthTags: ['fait-maison'],
    },
    {
      id: 'cocos-food-plat-jour',
      name: 'Plat du jour complet',
      vendor: "Coco's Food",
      price: 11,
      category: 'Plats',
      image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0082.jpg'),
      description: 'Bol généreux et équilibré : riz noir djon-djon aux petits pois, poisson ou viande effiloché(e) en sauce tomate épicée, dés de betteraves, salade verte croquante, oignons blancs, carottes râpées, maïs doux et rondelles de banane plantain. Un festival de saveurs et de couleurs qui change chaque jour.',
      zone: 'Rivière-Pilote',
      available: true,
      featured: false,
      ingredients: 'Riz djon-djon, poisson ou viande effiloché(e), betteraves, salade, oignons, carottes, maïs, banane plantain, épices.',
      allergens: 'Poisson. Autres à confirmer.',
      healthTags: ['fait-maison'],
    },
    {
      id: 'cocos-food-salade-viande',
      name: 'Salade de viande marinée',
      vendor: "Coco's Food",
      price: 8,
      category: 'Snacking',
      image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0085.jpg'),
      description: 'Salade fraîche et relevée : dés de viande ou pâté de porc marinés, mélangés à des oignons rouges croquants, de la cébette et du piment rouge frais, le tout assaisonné d\'une sauce vinaigrée aux épices et au citron. Parfaite en entrée ou repas léger.',
      zone: 'Rivière-Pilote',
      available: true,
      featured: false,
      ingredients: 'Viande marinée ou pâté de porc, oignons rouges, cébette, piment, citron, vinaigre, épices.',
      allergens: 'À confirmer avec la partenaire.',
      healthTags: ['fait-maison'],
    },
    {
      id: 'cocos-food-spaghetti',
      name: 'Spaghetti sauté',
      vendor: "Coco's Food",
      price: 8,
      category: 'Plats',
      image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0071.jpg'),
      description: 'Spaghettis sautés aux légumes — poivrons verts et rouges, oignons — et aux saucisses cocktail, relevés d\'épices. Un plat de pâtes savoureux et généreux, parfait pour les petits et grands appétits.',
      zone: 'Rivière-Pilote',
      available: true,
      featured: false,
      ingredients: 'Spaghetti, saucisse cocktail, poivrons, oignons, épices, huile.',
      allergens: 'Gluten. Autres à confirmer.',
      healthTags: ['fait-maison'],
    },

    // ═══════════════════════════════════════════════════════
    // ═══════════════════════════════════════════════════════
    // SAVEURS D'AFRIQUE — Cluny
  // Menu réel WhatsApp juin 2026 — 17 produits
  {
    id: 'saveurs-afrique-attieke',
    name: 'Attiéké',
    vendor: "Saveurs d'Afrique",
    price: 14,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Poisson grillé doré à la perfection, servi sur un lit d\'attiéké (semoule de manioc fermentée), accompagné de banane plantain frite (alloco), crudités croquantes (chou, carotte, concombre) et mayonnaise maison. Deux sauces maison complètent le tableau : piment rouge relevé et oignons fondants confits. Un plat complet et parfumé, signature incontournable de la cuisine ivoirienne de rue.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Poisson grillé, attiéké (manioc), banane plantain, chou, carotte, concombre, mayonnaise maison, piment rouge, oignon confit, épices.',
    allergens: 'Poisson, œuf (mayonnaise).',
    photoQuality: 'à valider',
    descQuality: 'validée',
    healthTags: ['fait-maison', 'equilibre']
  },
  {
    id: 'saveurs-afrique-foutou',
    name: 'Foutou banane sauce arachide',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0156.jpg'),
    description: 'Foutou — banane plantain pilée à la perfection en une boule dense et élastique, servie avec une sauce arachide onctueuse et parfumée aux épices africaines. Accompagné de viande de mouton ou dinde longuement mijotée. Un grand classique ivoirien riche et réconfortant, où la douceur du plantain rencontre la rondeur de l\'arachide.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Banane plantain pilée, pâte d\'arachide, viande de mouton ou dinde, tomate, oignon, piment, épices africaines.',
    allergens: 'Arachide.',
    photoQuality: 'validée',
    descQuality: 'validée',
    healthTags: ['fait-maison']
  },
  {
    id: 'saveurs-afrique-ablo',
    name: 'Ablo (Gâteau de riz)',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0155.jpg'),
    description: 'Galettes de riz fermenté cuites à la vapeur, d\'un blanc immaculé à la texture spongieuse et légèrement acidulée. Servies avec un poisson entier frit (tilapia) à la peau croustillante et dorée, accompagné d\'une sauce tomate-piment rouge intense longuement réduite aux oignons et épices. L\'ablo traditionnel ivoirien, doux et aérien, idéal pour absorber les saveurs puissantes de la sauce.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Riz fermenté, maïs, poisson (tilapia), tomate, oignon, piment, huile de palme, épices.',
    allergens: 'Poisson.',
    photoQuality: 'validée',
    descQuality: 'validée',
    healthTags: ['fait-maison', 'sans-gluten']
  },
  {
    id: 'saveurs-afrique-atassi',
    name: 'Atassi (riz aux haricots)',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0158.jpg'),
    description: 'Atassi maison : riz aux haricots, généreux et nourrissant, servi avec sauce et accompagnement du jour selon disponibilité. Un classique simple, complet et réconfortant.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Riz, haricots, sauce maison, épices. Accompagnement du jour à confirmer.',
    allergens: 'À confirmer avec la partenaire.',
    photoQuality: 'validée',
    descQuality: 'validée',
    healthTags: ['fait-maison', 'equilibre']
  },
  {
    id: 'saveurs-afrique-sauce-legume',
    name: 'Sauce légume',
    vendor: "Saveurs d'Afrique",
    price: 13,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0142.jpg'),
    description: 'Sauce légume africaine, riche et parfumée, préparée avec feuilles/légumes mijotés et épices. Servie avec l’accompagnement disponible du jour.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Feuilles ou légumes mijotés, tomate, oignon, huile, piment, épices. Viande, poisson ou accompagnement à confirmer.',
    allergens: 'À confirmer avec la partenaire.',
    photoQuality: 'à valider',
    descQuality: 'validée',
    healthTags: ['fait-maison']
  },
  {
    id: 'saveurs-afrique-sauce-gombo',
    name: 'Sauce gombo',
    vendor: "Saveurs d'Afrique",
    price: 13,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0159.jpg'),
    description: 'Sauce gombo onctueuse à la texture filante caractéristique, mijotée aux épices africaines. Servie avec l’accompagnement du jour selon disponibilité.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Gombo, oignon, piment, épices, huile. Protéine et accompagnement à confirmer.',
    allergens: 'À confirmer avec la partenaire.',
    photoQuality: 'validée',
    descQuality: 'validée',
    healthTags: ['fait-maison']
  },
  {
    id: 'saveurs-afrique-igname',
    name: 'Igname jus d\'œuf',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Igname pilée, lisse et élastique — cette pâte blanche traditionnelle est accompagnée d\'une sauce tomate-oignon aux œufs durs, parfumée au piment et aux épices africaines. Un plat réconfortant où la douceur de l\'igname rencontre l\'acidité de la sauce tomate relevée.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Igname pilée, œufs durs, tomate, oignon, piment, huile, épices.',
    allergens: 'Œufs.',
    photoQuality: 'à valider',
    descQuality: 'validée',
    healthTags: ['fait-maison', 'sans-gluten']
  },
  {
    id: 'saveurs-afrique-monyo',
    name: 'Mônyo',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0141.jpg'),
    description: 'Mônyo maison : sauce tomate-oignon relevée aux épices africaines, servie avec l’accompagnement disponible du jour. Plat parfumé, généreux et mijoté.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Tomate, oignon, piment, gingembre, ail, épices africaines, huile. Protéine et accompagnement à confirmer.',
    allergens: 'À confirmer avec la partenaire.',
    photoQuality: 'à valider',
    descQuality: 'validée',
    healthTags: ['fait-maison']
  },
  {
    id: 'saveurs-afrique-spaghetti',
    name: 'Spaghetti',
    vendor: "Saveurs d'Afrique",
    price: 10,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Spaghetti cuits al dente, enrobés d\'une sauce tomate maison aux légumes frais (carottes, oignons, poivrons) et épices africaines — une version généreuse et parfumée des pâtes, simple et savoureuse.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Pâtes (blé), tomate, carotte, oignon, poivron, épices, herbes.',
    allergens: 'Gluten.',
    photoQuality: 'à valider',
    descQuality: 'validée',
    healthTags: ['fait-maison']
  },
  {
    id: 'saveurs-afrique-salade',
    name: 'Salade béninoise',
    vendor: "Saveurs d'Afrique",
    price: 10,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0157.jpg'),
    description: 'Salade composée fraîche et colorée façon buddha bowl : dés d\'avocat fondant, thon émietté rose pâle, tomates juteuses éclatantes, œufs durs parsemés de poivre noir, oignons verts croquants et laitue fraîche. Chaque ingrédient est disposé séparément pour apprécier sa fraîcheur. Idéale pour un déjeuner léger et équilibré.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Laitue, tomate, thon au naturel, œuf dur, avocat, oignon vert, poivre noir.',
    allergens: 'Poisson, œufs.',
    photoQuality: 'validée',
    descQuality: 'validée',
    healthTags: ['fait-maison', 'equilibre', 'sans-gluten']
  },
  {
    id: 'saveurs-afrique-bissap',
    name: 'Jus de bissap',
    vendor: "Saveurs d'Afrique",
    price: 5,
    category: 'Boissons',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0160.jpg'),
    description: 'Boisson rouge rubis intense à base de fleurs d\'hibiscus (Hibiscus sabdariffa), infusée à froid et légèrement sucrée au sucre de canne. Servie bien fraîche sur glaçons avec une tranche d\'ananas frais en garniture — la combinaison parfaite pour adoucir l\'acidité naturelle du bissap. Naturellement désaltérante et riche en vitamine C.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Fleurs d\'hibiscus, sucre de canne, eau, glaçons, ananas frais.',
    allergens: 'Aucun.',
    photoQuality: 'validée',
    descQuality: 'validée',
    healthTags: ['vegan', 'sans-gluten', 'equilibre']
  },
  {
    id: 'saveurs-afrique-yaourt',
    name: 'Yaourt simple 1L',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Desserts',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0161.jpg'),
    description: 'Yaourt brassé maison, épais et onctueux, à la texture lisse et brillante. Fabriqué à partir de lait entier et de ferments lactiques. Vendu en pot d\'un litre — idéal pour toute la famille, nature ou accompagné de fruits, miel ou confiture.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Lait entier, ferments lactiques.',
    allergens: 'Lait.',
    photoQuality: 'validée',
    descQuality: 'validée',
    healthTags: ['fait-maison']
  },
  {
    id: 'saveurs-afrique-degue',
    name: 'Dèguè 1L',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Desserts',
    image: photoAConfirmer,
    description: 'Yaourt onctueux au couscous fin légèrement sucré — une spécialité maison à la texture unique entre le flan et le yaourt, avec le croquant subtil du couscous. Vendu en pot d\'un litre.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Lait entier, couscous fin, sucre de canne, ferments lactiques.',
    allergens: 'Lait, gluten.',
    photoQuality: 'à valider',
    descQuality: 'validée',
    healthTags: ['fait-maison']
  },
  {
    id: 'saveurs-afrique-atchonmon',
    name: 'Atchonmon (Petits cailloux)',
    vendor: "Saveurs d'Afrique",
    price: 10,
    category: 'Snacking',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0164.jpg'),
    description: 'Atchonmon (Chin Chin) — petits dés de pâte sablée frits, dorés et croustillants, légèrement sucrés à la vanille. Une collation addictive à la texture ferme et friable, parfaite pour accompagner le thé, le café ou pour une pause gourmande à tout moment de la journée.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Farine de blé, œuf, sucre, beurre, vanille.',
    allergens: 'Gluten, œufs, lait.',
    photoQuality: 'validée',
    descQuality: 'validée',
    healthTags: ['fait-maison']
  },
  {
    id: 'saveurs-afrique-dokor',
    name: 'Dokôr (beignets sucrés) 8u',
    vendor: "Saveurs d'Afrique",
    price: 5,
    category: 'Snacking',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0163.jpg'),
    description: 'Dokôr (puff-puff) — beignets moelleux et dorés, à la forme sphérique parfaitement ronde, légèrement croustillants à l\'extérieur et d\'une incroyable légèreté aérienne à l\'intérieur. Des boules de pâte levée frites, idéales pour le petit-déjeuner ou la pause gourmande. Vendu par 8 unités.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Farine de blé, sucre, levure, vanille, œuf.',
    allergens: 'Gluten, œufs.',
    photoQuality: 'validée',
    descQuality: 'validée',
    healthTags: ['fait-maison']
  },

  // ═══════════════════════════════════════════════════════
  // VIRTUEL GOUTÉ MWEN — Sirops artisanaux
  // 18 produits — 2€ chaque — photos WhatsApp à intégrer
  // ═══════════════════════════════════════════════════════
  {
    id: 'goute-mwen-abricot-pays',
    name: 'Gouté Mwen — Abricot Pays',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-abricot-pays-ai.jpg'),
    description: "Glace artisanale à l'abricot pays. Douce et fruitée.",
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Abricot pays, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-super-coco',
    name: 'Gouté Mwen — Au Nanan de Coco',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-super-coco-ai.jpg'),
    description: "Glace artisanale à la noix de coco. Sans sucre ajouté. Ingrédients : nan-nan coco et eau de coco.",
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Nan-nan coco, eau de coco.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-api',
    name: 'Gouté Mwen — API',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-api-ai.jpg'),
    description: 'Glace artisanale à l\'ananas, piment végétarien. ‼️ Attention ça pique !',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Ananas, sucre, piment végétarien.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-mangue',
    name: 'Gouté Mwen — Mangue',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-mangue-ai.jpg'),
    description: 'Glace artisanale à la mangue. Plein de saveurs des Antilles.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Mangue, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-canne',
    name: 'Gouté Mwen — Canne (sans sucre ajouté)',
        vendor: 'Gouté Mwen',
        price: 2,
        category: 'Glaces',
        image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-canne-ai.jpg'),
        description: 'Glace artisanale à la canne. Sans sucre ajouté. Naturellement sucrée par la canne fraîche.',
        zone: 'Martinique',
        available: true,
        featured: true,
        healthTags: ['diabétique', 'sans-gluten', 'fait-maison'],
    ingredients: 'Canne.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-pasteque',
    name: 'Gouté Mwen — Pastèque (sans sucre ajouté)',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-pasteque-ai.jpg'),
    description: 'Glace artisanale à la pastèque. Sans sucre ajouté. Rafraîchissante.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Pastèque.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-pomme-liane',
    name: 'Gouté Mwen — Pomme Liane',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-pomme-liane-ai.jpg'),
    description: "Glace artisanale à la pomme liane, fruit exotique au goût unique.",
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Pomme liane, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-citronnade',
    name: 'Gouté Mwen — Citronnade',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-citronade-ai.jpg'),
    description: "Citronnade artisanale faite avec le zeste du citron. Rafraîchissante et acidulée ! 🚨 Fait réellement avec le zeste.",
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Citron, zeste de citron, eau, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-ananas',
    name: 'Gouté Mwen — Ananas (sans sucre ajouté)',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/_fallback/photo-a-confirmer.svg'),
    description: 'Glace artisanale à l\'ananas avec des morceaux d\'ananas. Sans sucre ajouté.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Ananas, morceaux d\'ananas.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-prune-cythere',
    name: 'Gouté Mwen — Prune de Cythere',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/_fallback/photo-a-confirmer.svg'),
    description: 'Glace artisanale à la prune de cythere (pomme cythere). Saveur tropicale authentique.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Prune de cythere, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-snow-boll',
    name: 'Gouté Mwen — Snow Boll',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-snow-ball-ai.jpg'),
    description: 'Glace artisanale groseille et menthe. Très apprécié de tous, enfants compris. Rafraîchissant ! ❄️',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Groseille, sirop de menthe.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-kumquat',
    name: 'Gouté Mwen — Kumquat',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-kumquat-ai.jpg'),
    description: 'Glace artisanale au kumquat. Agrumes antillais au goût subtil.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Kumquat, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-maracuja',
    name: 'Gouté Mwen — Maracuja',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-maracuja-ai.jpg'),
    description: 'Glace artisanale au maracuja (fruit de la passion). Exotique et fruité.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Maracuja, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-prune-maracuja',
    name: 'Gouté Mwen — Prune Maracuja',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/_fallback/photo-a-confirmer.svg'),
    description: 'Glace artisanale prune de cythere et maracuja. Le mélange parfait !',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Prune de cythere, maracuja, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-avocat-basi',
    name: 'Gouté Mwen — Avocat-basi',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/_fallback/photo-a-confirmer.svg'),
    description: 'Glace artisanale avocat et sirop de basilic. Original et surprenant !',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Avocat, sirop de basilic.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-corossol',
    name: 'Gouté Mwen — Corossol',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-corossol-ai.jpg'),
    description: 'Glace artisanale au corossol. Fruit crémeux aux vertues naturelles.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Corossol, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-mandarine',
    name: 'Gouté Mwen — Mandarine',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-mandarine-ai.jpg'),
    description: 'Glace artisanale à la mandarine. Agrumes frais et acidulés.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Mandarine, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-cocktail',
    name: 'Gouté Mwen — Cocktail',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-cocktail-ai.jpg'),
    description: 'Glace artisanale cocktail — abricot pays, goyave et maracuja. Le mix parfait des Antilles !',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Abricot pays, goyave, maracuja, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-clitoria-corossol',
    name: 'Gouté Mwen — Clitoria / Corossol',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-clitoria-corossol-ai.jpg'),
    description: 'Glace artisanale Gouté Mwen au clitoria et corossol, fraîche et florale, issue du kit import validé.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Clitoria, corossol, sucre.',
    allergens: 'À confirmer avec le prestataire.',
    photoQuality: 'validée',
    descQuality: 'validée',
    healthTags: ['fait-maison']
  },
  {
    id: 'goute-mwen-pasteque-anis',
    name: 'Gouté Mwen — Pastèque / Anis',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-pasteque-anis-ai.jpg'),
    description: 'Glace artisanale pastèque et anis étoilé. Un mélange rafraîchissant et original — la douceur de la pastèque rencontre les notes anisées. Nouveauté Tour des Yoles 2026 !',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Pastèque, anis étoilé, sucre.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-cerise-pomme-deau',
    name: 'Gouté Mwen — Cerise / Pomme d’eau',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-cerise-pomme-deau-ai.jpg'),
    description: 'Glace artisanale cerise et pomme d’eau, fraîche et locale. Visuel fourni par le partenaire, recette à confirmer avant activation commerciale.',
    zone: 'Martinique',
    available: true,
    featured: false,
    ingredients: 'Cerise, pomme d’eau, sucre.',
    allergens: 'À confirmer avec le prestataire.',
    photoQuality: 'validée',
    descQuality: 'à valider'
  },
  {
    id: 'goute-mwen-cerise',
    name: 'Gouté Mwen — Cerise',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-cerise-ai.jpg'),
    description: 'Glace artisanale à la cerise, gourmande et rafraîchissante. Visuel fourni par le partenaire, recette à confirmer avant activation commerciale.',
    zone: 'Martinique',
    available: true,
    featured: false,
    ingredients: 'Cerise, sucre.',
    allergens: 'À confirmer avec le prestataire.',
    photoQuality: 'validée',
    descQuality: 'à valider'
  },

  // ═══════════════════════════════════════════════════════
  // SWEET FAMILY TRAITEUR ORIANNE — Traiteur événementiel
  // Seafood Boils · Bao Buns · Cocktails & Mignardises
  // Menu réécrit pro — Contact : 0696 88 75 28 | 48h min
  // ═══════════════════════════════════════════════════════







  {
    id: 'sweet-family-bao-poulet',
    name: 'Bao Bun Poulet',
    vendor: 'Sweet Family Traiteur Orianne',
    price: 1.80,
    category: 'Snacking',
    image: vendorImage('vendors/sweet-family/bao-buns.jpg'),
    description: 'Bao bun vapeur moelleux, poulet mariné aux herbes antillaises. Min. 10 pièces.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Pain bao vapeur, poulet mariné, herbes fraîches, pickles de légumes.',
    allergens: 'Gluten.'
  },
  {
    id: 'sweet-family-bao-boeuf',
        name: 'Bao Bun B\u0153uf',
        vendor: 'Sweet Family Traiteur Orianne',
        price: 1.90,
        category: 'Snacking',
        image: vendorImage('vendors/sweet-family/bao-buns.jpg'),
    description: 'Bao bun garni de bœuf mariné et poivrons caramélisés. Min. 10 pièces.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Pain bao vapeur, bœuf mariné, poivrons caramélisés, herbes fraîches.',
    allergens: 'Gluten.'
  },


  {
    id: 'sweet-family-bao-boeuf-premium',
    name: 'Bao Bun Bœuf Premium',
    vendor: 'Sweet Family Traiteur Orianne',
    price: 2.50,
    category: 'Snacking',
    image: vendorImage('vendors/sweet-family/bao-buns.jpg'),
    description: 'Bao signature : bœuf haché premium, garniture raffinée, sauce secrète. Min. 10 pièces.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Pain bao vapeur, bœuf haché premium, garniture raffinée, sauce secrète.',
    allergens: 'Gluten.'
  },
















  {
    id: 'sweet-family-landfood-solo',
    name: 'Land food solo',
    vendor: 'Sweet Family Traiteur Orianne',
    price: 39.90,
    category: 'Plats',
    image: vendorImage('vendors/sweet-family/landfood-solo.jpg'),
    description: 'Côtes de porc grillées, pilons de poulet, saucisses, maïs, œufs — un plat généreux pour les amateurs de viande ! 🥩',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Côtes de porc, pilons de poulet, saucisses, maïs, œufs, épices.',
    allergens: 'Œuf.'
  },
  {
    id: 'sweet-family-bao-bun-poulet',
    name: 'Bao Bun Poulet (boîte de 28)',
    vendor: 'Sweet Family Traiteur Orianne',
    price: 44,
    category: 'Apéritifs',
    image: vendorImage('vendors/sweet-family/bao-buns.jpg'),
    description: 'Boîte de 28 bao buns garnis au poulet. Moelleux et savoureux, parfaits pour vos événements et cocktails ! 🥟',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Bao bun (farine, levure, eau), poulet effiloché, légumes croquants.',
    allergens: 'Gluten.'
  },
  {
    id: 'sweet-family-nems-poulet',
    name: 'Nems poulet (pièce)',
    vendor: 'Sweet Family Traiteur Orianne',
    price: 1.70,
    category: 'Apéritifs',
    image: vendorImage('vendors/sweet-family/nems-poulet.jpg'),
    description: 'Nems poulet croustillants, dorés à souhait, servis sur lit de salade. Idéal pour l\'apéritif ou le buffet ! 🥟',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Galette de riz, poulet haché, légumes, épices.',
    allergens: 'Gluten.'
  },

  {
    id: 'sweet-family-manchon-poulet',
    name: 'Manchon de poulet',
    vendor: 'Sweet Family Traiteur Orianne',
    price: 1,
    category: 'Apéritifs',
    image: vendorImage('vendors/sweet-family/manchon-poulet.jpg'),
    description: 'Manchons de poulet dorés et assaisonnés, format apéritif ou buffet. Idéal pour compléter une commande événementielle.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Manchons de poulet, marinade, herbes et épices.',
    allergens: 'Gluten.'
  },
  {
    id: 'sweet-family-ti-nain-morue',
    name: 'Ti nain morue',
    vendor: 'Sweet Family Traiteur Orianne',
    price: 3.20,
    category: 'Apéritifs',
    image: vendorImage('vendors/sweet-family/ti-nain-morue.jpg'),
    description: 'Ti nain morue antillais — salade de morue émiettée, poivrons, oignons, persil, servie en coupelle sur lit de salade. Frais, savoureux, parfait pour l\'apéritif ! 🥗',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Morue émiettée, poivrons rouges et jaunes, oignons, persil, salade verte.',
    allergens: 'Poisson.'
  },

  {
    id: 'sweet-family-chicken-wrap',
    name: 'Chicken Wrap',
    vendor: 'Sweet Family Traiteur Orianne',
    price: 2.50,
    category: 'Snacking',
    image: vendorImage('vendors/sweet-family/chicken-wrap.jpg'),
    description: 'Wrap garni de poulet pané croustillant, laitue fraîche et fromage. Pratique et savoureux, idéal pour un snack rapide ou un buffet ! 🌯',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Tortilla, poulet pané, laitue, fromage.',
    allergens: 'Gluten, lait.'
  },

  {
    id: 'sweet-family-pizza-vege',
    name: 'Pizza végé',
    vendor: 'Sweet Family Traiteur Orianne',
    price: 1.10,
    category: 'Apéritifs',
    image: vendorImage('vendors/sweet-family/pizza-vege.jpg'),
    description: 'Mini pizza végétarienne garnie de tomate, champignons, fromage et olive noire. Format pratique pour apéritif, buffet ou cocktail.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Pâte à pizza, tomate, champignons, fromage, olives noires, pousses fraîches.',
    allergens: 'Gluten, lait.'
  },

// LES DELICES DE NINICE — Fort-de-France (Dillon)
  // 11 produits avec photos professionnelles retouchées
  // Source : WhatsApp import mai 2026
  // ═══════════════════════════════════════════════════════
  {
    id: 'ninice-colombo',
    name: 'Le Colombo des Deux Rives',
    vendor: 'Les Delices de Ninice',
    price: 14,
    category: 'Plats',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0070.jpg'),
    description: 'Colombo signature mêlant les épices des Caraïbes et du Suriname. Un plat généreux aux saveurs profondes.',
    zone: 'Fort-de-France',
    available: true,
    featured: true,
    ingredients: 'Viande, colombo, légumes, riz. Détails à confirmer avec le prestataire.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'ninice-moksi-vegetarien',
    name: 'Le Moksi Aleisi Végétarien',
    vendor: 'Les Delices de Ninice',
    price: 7,
    category: 'Plats',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0071.jpg'),
    description: 'Riz sauté surinamais aux légumes, version végétarienne. Simple, coloré et savoureux ! 🌿',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Riz, légumes variés, épices surinamaises.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'ninice-moksi-poulet',
    name: 'Le Moksi Aleisi + Poulet',
    vendor: 'Les Delices de Ninice',
    price: 10.5,
    category: 'Plats',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0072.jpg'),
    description: 'Riz sauté surinamais au poulet tendre. Recette traditionnelle maison, un délice ! 🍗',
    zone: 'Fort-de-France',
    available: true,
    featured: true,
    ingredients: 'Riz, poulet, légumes, épices surinamaises.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'ninice-moksi-porc',
    name: 'Le Moksi Aleisi + Porc',
    vendor: 'Les Delices de Ninice',
    price: 11.5,
    category: 'Plats',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0073.jpg'),
    description: 'Riz sauté surinamais accompagné de porc. Généreux et parfumé.',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Riz, porc, légumes, épices surinamaises.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'ninice-bami',
    name: 'Bami des Îles',
    vendor: 'Les Delices de Ninice',
    price: 14,
    category: 'Pâtes',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0074.jpg'),
    description: 'Nouilles sautées à la surinamaise, un classique revisité avec des influences caribéennes.',
    zone: 'Fort-de-France',
    available: true,
    featured: true,
    ingredients: 'Nouilles, viande, légumes, sauce soja, épices.',
    allergens: 'Gluten, soja. Autres allergènes à confirmer.',
  },
  {
    id: 'ninice-bara',
    name: 'Bara + sauce signature',
    vendor: 'Les Delices de Ninice',
    price: 1.8,
    category: 'Snacking',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0075.jpg'),
    description: 'Beignet surinamais croustillant servi avec la sauce maison. Parfait en encas.',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Farine, lentilles, épices, sauce signature.',
    allergens: 'Gluten (blé). Sans œufs ni produits laitiers.'
  },
  {
    id: 'ninice-gulab-amande',
    name: 'Gulab Jamun Amande',
    vendor: 'Les Delices de Ninice',
    price: 0.8,
    category: 'Desserts',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0076.jpg'),
    description: "Douceur frite à base de lait, parfumée à l'amande et nappée de sirop.",
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Lait, farine, amande, sirop de sucre.',
    allergens: 'Lait, gluten, fruits à coque (amande). Autres à confirmer.',
  },
  {
    id: 'ninice-gulab-coco',
    name: 'Gulab Jamun Coco',
    vendor: 'Les Delices de Ninice',
    price: 0.8,
    category: 'Desserts',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0077.jpg'),
    description: 'Douceur frite à base de lait, parfumée à la noix de coco et nappée de sirop.',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Lait, farine, coco râpé, sirop de sucre.',
    allergens: 'Lait, gluten. Autres à confirmer.',
  },
  {
    id: 'ninice-brochette-poulet',
    name: 'Mini brochette Saoto Poulet',
    vendor: 'Les Delices de Ninice',
    price: 2.5,
    category: 'Snacking',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0078.jpg'),
    description: "Mini brochettes de poulet marinées façon Saoto. Idéales pour l'apéritif.",
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Poulet, marinade Saoto, épices.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'ninice-brochette-porc',
    name: 'Mini brochette Saoto Porc',
    vendor: 'Les Delices de Ninice',
    price: 3,
    category: 'Snacking',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0079.jpg'),
    description: 'Mini brochettes de porc marinées façon Saoto.',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Porc, marinade Saoto, épices.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'ninice-brochette-boeuf',
    name: 'Mini brochette Saoto Bœuf',
    vendor: 'Les Delices de Ninice',
    price: 3.5,
    category: 'Snacking',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0080.jpg'),
    description: 'Mini brochettes de bœuf marinées façon Saoto. La plus généreuse.',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Bœuf, marinade Saoto, épices.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'goute-mwen-cacahuete',
    name: 'Gouté Mwen — Cacahuète (sans lactose)',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: photoAConfirmer,
    photoQuality: 'à valider',
    description: 'Glace artisanale à la cacahuète, sans lactose. Onctueuse et gourmande, elle ravit les amateurs de saveurs authentiques ! 🥜',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Cacahuète, lait végétal, sucre.',
    allergens: 'Arachide.'
  },
  {
    id: 'goute-mwen-pistache',
    name: 'Gouté Mwen — Pistache (sans lactose)',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: photoAConfirmer,
    photoQuality: 'à valider',
    description: 'Glace artisanale à la pistache, sans lactose. Onctueuse, parfumée et délicatement verte — un délice authentique des Antilles ! 🍦',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Pistache, lait végétal, sucre.',
    allergens: 'Fruits à coque.'
  },
  {
    id: 'goute-mwen-choco',
    name: 'Gouté Mwen — Choco (sans lactose)',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: photoAConfirmer,
    photoQuality: 'à valider',
    description: 'Glace artisanale au chocolat, cacao amer et eau de coco, sans lactose. Riche, onctueuse et intense — comme un voyage sous les tropiques ! 🍫🥥',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Cacao, eau de coco, nan-nan (lait de coco), sucre.',
    allergens: 'Aucun.'
  },
];

export function getFeaturedProducts(): LocalProduct[] {
  return mockProducts.filter(p => p.featured);
}
