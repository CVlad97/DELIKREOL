export const photoAConfirmer = '/DELIKREOL/vendors/_fallback/photo-a-confirmer.svg';

function vendorImage(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path.replace(/^\//, '')}`;
}

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
}

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
    name: 'Côte de porc',
    vendor: 'Snack Save Peyia',
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/hero.jpg'),
    description: 'Côte de porc grillée au feu de bois, tendre et savoureuse, servie avec riz, lentilles pays, légumes et crudités croquants. Le plat signature du Pont de Fer ! 🔥',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
        ingredients: 'Côte de porc grillée, accompagnée de riz, lentilles, légumes pays et crudités.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'save-peyia-filet-poulet',
    name: 'Filet de poulet',
    vendor: 'Snack Save Peyia',
    price: 10,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/hero.jpg'),
    description: 'Filet de poulet grillé aux herbes, mariné maison, accompagné de riz parfumé, lentilles pays, légumes et crudités fraîches. Sain, généreux, fait maison avec amour ! 🐔',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
        ingredients: 'Filet de poulet grillé, accompagné de riz, lentilles, légumes pays et crudités.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'save-peyia-crevettes',
    name: 'Crevettes grillées',
    vendor: 'Snack Save Peyia',
    price: 14,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/hero.jpg'),
    description: 'Crevettes grillées marinées aux épices locales, servies avec riz, lentilles, légumes pays et crudités. La spécialité qui fait la réputation du Pont de Fer ! 🦐',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
        ingredients: 'Crevettes grillées, accompagnées de riz, lentilles, légumes pays et crudités.',
    allergens: 'Crustacés. Peut contenir des traces de gluten et d\'arachide.'
  },

  // ═══════════════════════════════════════════════════════
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
    image: vendorImage('vendors/an-tje-coco/hero.jpg'),
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
    image: vendorImage('vendors/an-tje-coco/gallery-02.jpg'),
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
    image: vendorImage('vendors/an-tje-coco/gallery-01.jpg'),
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
    image: vendorImage('vendors/an-tje-coco/gallery-03.jpg'),
    description: 'Pépite sucrée façon tiramisu au café. Une fusion italo-créole en format bouchée.',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Café, mascarpone, cacao. Composition à confirmer.',
    allergens: 'Gluten, produits laitiers. Autres allergènes à confirmer.',
  },

  // ═══════════════════════════════════════════════════════
  // COCO'S FOOD — Rivière-Pilote (Marché)
  // Cuisine de marché créole et caribéenne — photos WhatsApp mai 2026
  // 8 produits identifiés sur photos — prix estimés à confirmer
  // ═══════════════════════════════════════════════════════
  {
    id: 'cocos-food-paella-noire',
    name: 'Paella noire aux fruits de mer',
    vendor: "Coco's Food",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-paella-noire-card.jpg'),
    description: 'Riz noir à l\'encre de seiche garni de crevettes, moules, poissons, poivrons et petits pois. La spécialité du marché.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Riz, encre de seiche, crevettes, moules, poisson, poivrons, oignons, petits pois.',
    allergens: 'Crustacés, mollusques, poisson. Autres à confirmer.',
  },
  {
    id: 'cocos-food-box-poisson-avocat',
    name: 'Box poisson effiloché & avocat',
    vendor: "Coco's Food",
    price: 13,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-box-poisson-avocat-card.jpg'),
    description: 'Box complète avec poisson effiloché, avocat frais, plantain, accompagnements et jus cocktail maison.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Poisson effiloché, avocat, plantain, herbes, piment. Accompagné de jus cocktail.',
    allergens: 'Poisson. Autres à confirmer.',
  },
  {
    id: 'cocos-food-brochettes',
    name: 'Brochettes panées du marché',
    vendor: "Coco's Food",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-brochettes-panees-card.jpg'),
    description: 'Brochettes panées dorées servies avec lentilles, brocoli, haricots verts et riz.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Brochettes panées, lentilles, brocoli, haricots verts, riz.',
    allergens: 'Gluten. Autres à confirmer.',
  },
  {
    id: 'cocos-food-poulet-roti',
    name: 'Poulet rôti, riz aux pois & crudités',
    vendor: "Coco's Food",
    price: 11,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-poulet-roti-card.jpg'),
    description: 'Pilons de poulet rôtis, riz aux pois assaisonné, crudités fraîches et salsa créole.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Poulet, riz aux pois, chou violet, carottes, maïs, laitue, herbes.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'cocos-food-plat-jour',
    name: 'Plat du jour complet',
    vendor: "Coco's Food",
    price: 11,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-plat-jour-complet-card.jpg'),
    description: 'Assiette du jour : viande mijotée, riz, maïs, crudités variées et betteraves. Composition selon arrivage.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Viande, riz aux pois, maïs, betteraves, crudités. Variable selon le jour.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'cocos-food-box-grille',
    name: 'Box viande grillée & crudités',
    vendor: "Coco's Food",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-box-grille-card.jpg'),
    description: 'Viande grillée juteuse servie avec riz, maïs, chou, carottes et laitue. Copieux !',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Viande grillée, riz, maïs, chou, carottes, laitue.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'cocos-food-friture',
    name: 'Friture caramélisée aux oignons',
    vendor: "Coco's Food",
    price: 10,
    category: 'Snacking',
    image: vendorImage('vendors/coco/coco-friture-caramel-card.jpg'),
    description: 'Morceaux frits et caramélisés aux oignons et herbes. Un classique du marché.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Viande ou poisson frit, oignons, herbes, sauce caramel.',
    allergens: 'À confirmer avec le prestataire.'
  },
  {
    id: 'cocos-food-salade-viande',
    name: 'Salade de viande marinée pimentée',
    vendor: "Coco's Food",
    price: 8,
    category: 'Snacking',
    image: vendorImage('vendors/coco/coco-salade-viande-card.jpg'),
    description: 'Viande marinée en salade fraîche avec oignons rouges, cive et piment. Parfait en entrée.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Viande marinée, oignons rouges, cive, piment, vinaigrette.',
    allergens: 'À confirmer avec le prestataire.'
  },

  // ═══════════════════════════════════════════════════════
  // SAVEURS D'AFRIQUE / LODIKA — Rivière-Salée
  // Cuisine africaine maison — photos WhatsApp 2026
  // Source : menu photos WhatsApp juin 2026
  {
    id: 'saveurs-afrique-foutou',
    name: 'Foutou banane',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-foutou-banane.jpg'),
    description: 'Banane plantain pilée à la perfection, servie en boules généreuses nappées d'une sauce tomate-épices relevée aux oignons fondants et à la viande mijotée. Une signature ivoirienne qui marie la douceur du plantain à la puissance des épices africaines.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Banane plantain, manioc, huile de palme rouge, tomate, oignon, viande mijotée, piment, épices africaines.',
    allergens: 'Sans gluten.'
  },
  {
    id: 'saveurs-afrique-ablo',
    name: 'Galettes de riz (Ablo)',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-ablo.jpg'),
    description: 'Galettes de riz fermenté d'un jaune soleil, cuites à la vapeur, servies avec une sauce tomate épicée au poisson fumé. L'ablo traditionnel ivoirien, doux et légèrement acidulé, idéal pour absorber les saveurs de la sauce.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Riz fermenté, tomate, poisson fumé, oignon, piment, huile de palme, épices.',
    allergens: 'Poisson.'
  },
  {
    id: 'saveurs-afrique-atassi',
    name: 'Riz aux haricots (Atassi)',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/gallery-05.jpg'),
    description: 'Riz blanc parfumé généreusement mélangé à des haricots rouges mijotés, relevé d'une sauce tomate-oignon épicée. Plat complet et nourrissant, véritable comfort food africaine.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Riz, haricots rouges, tomate, oignon, huile de palme, épices.',
    allergens: 'Sans gluten.'
  },
  {
    id: 'saveurs-afrique-pate-legume',
    name: 'Pâte, sauce légume',
    vendor: "Saveurs d'Afrique",
    price: 13,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-pate-legume.jpg'),
    description: 'Pâte de semoule ou farine, ferme et dense, accompagnée d'une sauce légume généreuse aux épinards frais, gombo et morceaux de viande tendre. Un plat rustique et profondément savoureux.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Semoule de blé, épinards, gombo, viande, tomate, oignon, huile de palme, épices.',
    allergens: 'Gluten.'
  },
  {
    id: 'saveurs-afrique-pate-gombo',
    name: 'Pâte, sauce gombo',
    vendor: "Saveurs d'Afrique",
    price: 13,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-pate.jpg'),
    description: 'Pâte traditionnelle servie avec une sauce gombo onctueuse aux crevettes séchées et au poisson fumé. La texture filante du gombo et la richesse des fruits de mer en font un plat emblématique de l'Afrique de l'Ouest.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Semoule, gombo, crevettes séchées, poisson fumé, huile de palme, épices.',
    allergens: 'Crustacés, gluten, poisson.'
  },
  {
    id: 'saveurs-afrique-igname',
    name: 'Igname jus d'œuf',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/gallery-08.jpg'),
    description: 'Igname pilée, lisse et élastique, accompagnée d'une sauce tomate aux œufs durs. Un plat réconfortant où la douceur de l'igname rencontre l'acidité de la sauce.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Igname, œufs, tomate, oignon, huile, épices.',
    allergens: 'Œufs.'
  },
  {
    id: 'saveurs-afrique-monyo',
    name: 'Mônyo',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-monyo.jpg'),
    description: 'Viande marinée longuement mijotée dans une sauce tomate-oignon parfumée au piment et aux épices africaines. Plat mijoté traditionnel, riche en saveurs, servi avec du riz ou de la pâte.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Viande, tomate, oignon, piment, épices africaines, huile.',
    allergens: 'À confirmer avec la partenaire.'
  },
  {
    id: 'saveurs-afrique-spaghetti',
    name: 'Spaghetti',
    vendor: "Saveurs d'Afrique",
    price: 10,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/gallery-10.jpg'),
    description: 'Spaghetti cuits al dente, enrobés d'une sauce tomate maison aux légumes frais et épices. Une version africaine des pâtes, simple et savoureuse.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Pâtes, tomate, légumes, épices.',
    allergens: 'Gluten.'
  },
  {
    id: 'saveurs-afrique-salade',
    name: 'Salade béninoise',
    vendor: "Saveurs d'Afrique",
    price: 10,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-salade-beninoise.jpg'),
    description: 'Salade composée fraîche et colorée : laitue croquante, tomates juteuses, thon émietté, œufs durs, avocat fondant et oignons. Une entrée complète, idéale pour un déjeuner léger.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Laitue, tomate, thon, œuf, avocat, oignon, vinaigrette.',
    allergens: 'Poisson, œufs.'
  },
  {
    id: 'saveurs-afrique-pate-rouge',
    name: 'Pâte rouge (Amiwô)',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/gallery-05.jpg'),
    description: 'Semoule de maïs teintée à la tomate et au palmiste, servie avec une sauce viande ou poisson. L'amiwô béninois, coloré et parfumé, est un plat de fête du quotidien.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Farine de maïs, tomate, huile de palme, viande, épices.',
    allergens: 'Sans gluten.'
  },
  {
    id: 'saveurs-afrique-bissap',
    name: 'Jus de bissap',
    vendor: "Saveurs d'Afrique",
    price: 5,
    category: 'Boissons',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-bissap.jpg'),
    description: 'Boisson rouge rubis à base de fleurs d'hibiscus, infusée à froid et légèrement sucrée. Naturellement désaltérante, riche en vitamine C, parfumée à la menthe fraîche.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Fleurs d'hibiscus, sucre de canne, eau, menthe fraîche.',
    allergens: 'Aucun.'
  },
  {
    id: 'saveurs-afrique-yaourt',
    name: 'Yaourt 1L',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Desserts',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-yaourt.jpg'),
    description: 'Yaourt brassé maison, épais et onctueux, au goût lacté pur. Vendu en pot d'un litre — idéal pour toute la famille, nature ou accompagné de fruits.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Lait entier, ferments lactiques.',
    allergens: 'Lait.'
  },
  {
    id: 'saveurs-afrique-yaourt-couscous',
    name: 'Yaourt couscous 1L',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Desserts',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-yaourt.jpg'),
    description: 'Yaourt onctueux au couscous fin, légèrement sucré, à la texture unique entre le flan et le yaourt. Spécialité maison vendue en pot d'un litre.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Lait, couscous, ferments lactiques, sucre.',
    allergens: 'Lait, gluten.'
  },
  {
    id: 'saveurs-afrique-petits-cailloux',
    name: 'Petits cailloux',
    vendor: "Saveurs d'Afrique",
    price: 10,
    category: 'Snacking',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-petits-cailloux.jpg'),
    description: 'Chin chin — petits beignets frits croustillants, légèrement sucrés à la vanille. Une collation addictive, parfaite pour accompagner le thé ou le café.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Farine, sucre, beurre, vanille, œuf.',
    allergens: 'Gluten, lait, œufs.'
  },
  {
    id: 'saveurs-afrique-doko',
    name: 'Beignet sucré (Dokô)',
    vendor: "Saveurs d'Afrique",
    price: 5,
    category: 'Snacking',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-doko.jpg'),
    description: 'Dokô — beignets moelleux et dorés, légèrement sucrés, à la mie aérienne. Parfaits pour le petit-déjeuner ou la pause gourmande.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Farine, levure, sucre, vanille.',
    allergens: 'Gluten.'
  },// LES DELICES DE NINICE — Fort-de-France (Dillon)
  // 11 produits avec photos professionnelles retouchées
  // Source : WhatsApp import mai 2026
  // ═══════════════════════════════════════════════════════
  {
    id: 'ninice-colombo',
    name: 'Le Colombo des Deux Rives',
    vendor: 'Les Delices de Ninice',
    price: 14,
    category: 'Plats',
    image: vendorImage('vendors/ninice/ninice-01-card.jpg'),
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
    image: vendorImage('vendors/ninice/ninice-02-card.jpg'),
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
    image: vendorImage('vendors/ninice/ninice-03-card.jpg'),
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
    image: vendorImage('vendors/ninice/ninice-04-card.jpg'),
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
    image: vendorImage('vendors/ninice/ninice-05-card.jpg'),
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
    image: vendorImage('vendors/ninice/ninice-06-card.jpg'),
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
    image: vendorImage('vendors/ninice/ninice-07-card.jpg'),
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
    image: vendorImage('vendors/ninice/ninice-08-card.jpg'),
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
    image: vendorImage('vendors/ninice/ninice-09-card.jpg'),
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
    image: vendorImage('vendors/ninice/ninice-10-card.jpg'),
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
    image: vendorImage('vendors/ninice/ninice-11-card.jpg'),
    description: 'Mini brochettes de bœuf marinées façon Saoto. La plus généreuse.',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Bœuf, marinade Saoto, épices.',
    allergens: 'À confirmer avec le prestataire.'
  },
];

export function getFeaturedProducts(): LocalProduct[] {
  return mockProducts.filter(p => p.featured);
}
