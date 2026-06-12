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
    // COCO'S FOOD — Rivi\xe8re-Pilote
  // 8 produits avec photos sp\xe9cifiques (card + showcase)
  // Source : WhatsApp import mai 2026 + analyse photo
  {
    id: 'cocos-food-paella-noire',
    name: 'Paella noire aux fruits de mer',
    vendor: "Coco's Food",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-paella-noire-card.jpg'),
    description: 'Riz noir \xe0 l\'encre de seiche, garni g\xe9n\xe9reusement de crevettes, moules et poissons, relev\xe9 de poivrons et petits pois. La sp\xe9cialit\xe9 du march\xe9 sign\xe9e Coco\'s Food \u2014 un plat marin riche en saveurs et en couleurs.',
    zone: 'Rivi\xe8re-Pilote',
    available: true,
    featured: true,
    ingredients: 'Riz, encre de seiche, crevettes, moules, poisson, poivrons, oignons, petits pois, \xe9pices.',
    allergens: 'Crustac\xe9s, mollusques, poisson.'
  },
  {
    id: 'cocos-food-box-poisson-avocat',
    name: 'Box poisson avocat',
    vendor: "Coco's Food",
    price: 14,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-box-poisson-avocat-card.jpg'),
    description: 'Poulet r\xf4ti tendre et juteux, accompagn\xe9 de riz parfum\xe9 aux herbes, chou rouge croquant, carottes r\xe2p\xe9es et ma\xefs doux. Un bowl complet et color\xe9, relev\xe9 d\'une sauce \xe9pic\xe9e aux oignons et piment frais.',
    zone: 'Rivi\xe8re-Pilote',
    available: true,
    featured: true,
    ingredients: 'Poulet r\xf4ti, riz aux herbes, chou rouge, carottes, ma\xefs, oignon, piment, \xe9pices.',
    allergens: '\xc0 confirmer avec la partenaire.'
  },
  {
    id: 'cocos-food-brochettes-panees',
    name: 'Brochettes pan\xe9es',
    vendor: "Coco's Food",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-brochettes-panees-card.jpg'),
    description: 'Brochettes de poulet pan\xe9es, dor\xe9es et croustillantes, servies avec une sauce saveur maison. Accompagn\xe9es de riz blanc et de crudit\xe9s fra\xeeches.',
    zone: 'Rivi\xe8re-Pilote',
    available: true,
    featured: true,
    ingredients: 'Poulet, chapelure, \u0153uf, riz, salade, tomate, sauce.',
    allergens: 'Gluten, \u0153ufs.'
  },
  {
    id: 'cocos-food-poulet-roti',
    name: 'Poulet r\xf4ti',
    vendor: "Coco's Food",
    price: 13,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-poulet-roti-card.jpg'),
    description: 'Poulet r\xf4ti \xe0 la perfection, peau croustillante et chair fondante, accompagn\xe9 de riz pilaf, de banane plantain frite et de crudit\xe9s. Un grand classique de la cuisine cr\xe9ole.',
    zone: 'Rivi\xe8re-Pilote',
    available: true,
    featured: true,
    ingredients: 'Poulet, riz, banane plantain, salade, tomate, \xe9pices.',
    allergens: '\xc0 confirmer avec la partenaire.'
  },
  {
    id: 'cocos-food-plat-jour-complet',
    name: 'Plat du jour complet',
    vendor: "Coco's Food",
    price: 14,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-plat-jour-complet-card.jpg'),
    description: 'Assiette compl\xe8te et g\xe9n\xe9reuse : viande mijot\xe9e tendre, riz parfum\xe9, gratin de l\xe9gumes pays et crudit\xe9s fra\xeeches. Un repas \xe9quilibr\xe9 qui change chaque jour.',
    zone: 'Rivi\xe8re-Pilote',
    available: true,
    featured: true,
    ingredients: 'Viande mijot\xe9e, riz, l\xe9gumes pays, gratin, salade.',
    allergens: '\xc0 confirmer avec la partenaire.'
  },
  {
    id: 'cocos-food-box-grille',
    name: 'Box grill\xe9',
    vendor: "Coco's Food",
    price: 14,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-box-grille-card.jpg'),
    description: 'Viande grill\xe9e marin\xe9e aux \xe9pices, cuite au barbecue, servie avec riz blanc, banane plantain frite et salade de crudit\xe9s maison. Les saveurs fum\xe9es du grill.',
    zone: 'Rivi\xe8re-Pilote',
    available: true,
    featured: false,
    ingredients: 'Viande grill\xe9e, riz, banane plantain, salade, tomate, oignon.',
    allergens: '\xc0 confirmer avec la partenaire.'
  },
  {
    id: 'cocos-food-friture-caramel',
    name: 'Friture caramel',
    vendor: "Coco's Food",
    price: 6,
    category: 'Desserts',
    image: vendorImage('vendors/coco/coco-friture-caramel-card.jpg'),
    description: 'Beignets croustillants enrob\xe9s d\'un caramel fondant. Une douceur traditionnelle martiniquaise, parfaite pour terminer le repas sur une note sucr\xe9e.',
    zone: 'Rivi\xe8re-Pilote',
    available: true,
    featured: false,
    ingredients: 'Farine, beurre, sucre, \u0153uf, caramel, vanille.',
    allergens: 'Gluten, lait, \u0153ufs.'
  },
  {
    id: 'cocos-food-salade-viande',
    name: 'Salade viande',
    vendor: "Coco's Food",
    price: 11,
    category: 'Plats',
    image: vendorImage('vendors/coco/coco-salade-viande-card.jpg'),
    description: 'Salade fra\xeeche et compl\xe8te : viande froide \xe9minc\xe9e, mesclun de salade verte, tomates cerises, ma\xefs, carottes r\xe2p\xe9es et \u0153uf dur. Une option l\xe9g\xe8re et \xe9quilibr\xee.',
    zone: 'Rivi\xe8re-Pilote',
    available: true,
    featured: false,
    ingredients: 'Viande, salade verte, tomate, ma\xefs, carotte, \u0153uf.',
    allergens: '\u0152ufs.'
  },
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
  // ═══════════════════════════════════════════════════════
    // SAVEURS D'AFRIQUE — Cluny
  // Menu réel WhatsApp juin 2026 — 17 produits
  {
    id: 'saveurs-afrique-attieke',
    name: 'Atti\xe9k\xe9',
    vendor: "Saveurs d'Afrique",
    price: 14,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-foutou-banane.jpg'),
    description: 'Poisson grill\xe9 dor\xe9 \xe0 la perfection, servi avec un lit d\'atti\xe9k\xe9 (semoule de manioc), banane plantain frite (alloco), crudit\xe9s mayonnaise et deux sauces maison : piment rouge et oignons fondants. Un plat complet et parfum\xe9, signature de la cuisine ivoirienne.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Poisson grill\xe9, atti\xe9k\xe9 (manioc), banane plantain, chou, carotte, concombre, mayonnaise, piment, oignon.',
    allergens: 'Poisson, œuf (mayonnaise).'
  },
  {
    id: 'saveurs-afrique-foutou',
    name: 'Foutou banane sauce arachide',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-foutou-banane.jpg'),
    description: 'Foutou banane plantain pil\xe9, servi dans une sauce arachide onctueuse et parfum\xe9e, accompagn\xe9 de viande de mouton ou dinde. Un grand classique ivoirien, riche et r\xe9confortant.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Banane plantain, p\xe2te d\'arachide, viande de mouton ou dinde, \xe9pices.',
    allergens: 'Arachide.'
  },
  {
    id: 'saveurs-afrique-ablo',
    name: 'Ablo (G\xe2teau de riz)',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-ablo.jpg'),
    description: 'Galettes de riz ferment\xe9 cuites \xe0 la vapeur, servies avec du poisson grill\xe9 et une sauce tomate \xe9pic\xe9e. L\'ablo traditionnel ivoirien, doux et l\xe9g\xe8rement acidul\xe9.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Riz, ma\xefs, poisson, tomate, \xe9pices.',
    allergens: 'Poisson.'
  },
  {
    id: 'saveurs-afrique-atassi',
    name: 'Atassi (riz aux haricots)',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/gallery-05.jpg'),
    description: 'Riz aux haricots rouges, plat complet et nourrissant. Accompagn\xe9 de poisson et d\'\u0153uf dur, relev\xe9 d\'une sauce \xe9pic\xe9e.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Riz, haricot, poudre de crevette (facultatif), poisson, \u0153uf, \xe9pices.',
    allergens: 'Crustac\xe9s (poudre de crevette), \u0153uf, poisson.'
  },
  {
    id: 'saveurs-afrique-sauce-legume',
    name: 'Sauce l\xe9gume',
    vendor: "Saveurs d'Afrique",
    price: 13,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-pate-legume.jpg'),
    description: 'Sauce l\xe9gume verte aux \xe9pinards, poudre de crevette et poisson, servie avec une p\xe2te de semoule ferme et dense. Un plat rustique et profond\xe9ment savoureux de l\'Afrique de l\'Ouest.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: '\xc9pinard, poudre de crevette, poisson, semoule, \xe9pices.',
    allergens: 'Crustac\xe9s, poisson, gluten.'
  },
  {
    id: 'saveurs-afrique-sauce-gombo',
    name: 'Sauce gombo',
    vendor: "Saveurs d'Afrique",
    price: 13,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-pate.jpg'),
    description: 'Sauce gombo onctueuse aux morceaux de poisson, servie avec une p\xe2te de ma\xefs traditionnelle. La texture filante du gombo et la richesse du poisson fum\xe9 en font un plat embl\xe9matique.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Gombo, p\xe2te de ma\xefs, poisson, \xe9pices.',
    allergens: 'Poisson.'
  },
  {
    id: 'saveurs-afrique-igname',
    name: 'Igname jus d\'\u0153uf',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/gallery-08.jpg'),
    description: 'Igname pil\xe9e, lisse et \xe9lastique, accompagn\xe9e d\'une sauce tomate aux \u0153ufs durs. Un plat r\xe9confortant.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Igname, \u0153ufs, tomate, oignon, \xe9pices.',
    allergens: '\u0152ufs.'
  },
  {
    id: 'saveurs-afrique-monyo',
    name: 'M\xf4nyo',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-monyo.jpg'),
    description: 'Viande marin\xe9e longuement mijot\xe9e dans une sauce tomate-oignon parfum\xe9e. Plat mijot\xe9 traditionnel africain.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Viande, tomate, oignon, piment, \xe9pices.',
    allergens: '\xc0 confirmer avec la partenaire.'
  },
  {
    id: 'saveurs-afrique-spaghetti',
    name: 'Spaghetti',
    vendor: "Saveurs d'Afrique",
    price: 10,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/gallery-10.jpg'),
    description: 'Spaghetti sauce tomate maison aux l\xe9gumes frais et \xe9pices. Version africaine des p\xe2tes.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'P\xe2tes, tomate, l\xe9gumes, \xe9pices.',
    allergens: 'Gluten.'
  },
  {
    id: 'saveurs-afrique-salade',
    name: 'Salade b\xe9ninoise',
    vendor: "Saveurs d'Afrique",
    price: 10,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-salade-beninoise.jpg'),
    description: 'Salade fra\xeechen : laitue, tomate, thon, \u0153uf dur, avocat. Id\xe9ale pour un d\xe9jeuner l\xe9ger.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Laitue, tomate, thon, \u0153uf, avocat, oignon.',
    allergens: 'Poisson, \u0153ufs.'
  },
  {
    id: 'saveurs-afrique-bissap',
    name: 'Jus de bissap',
    vendor: "Saveurs d'Afrique",
    price: 5,
    category: 'Boissons',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-bissap.jpg'),
    description: 'Boisson rouge rubis \xe0 base de fleurs d\'hibiscus, infus\xe9e et l\xe9g\xe8rement sucr\xe9e. Rafra\xeechenchissante, riche en vitamine C.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Fleurs d\'hibiscus, sucre de canne, eau, menthe.',
    allergens: 'Aucun.'
  },
  {
    id: 'saveurs-afrique-yaourt',
    name: 'Yaourt simple 1L',
    vendor: "Saveurs d'Afrique",
    price: 12,
    category: 'Desserts',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-yaourt.jpg'),
    description: 'Yaourt brass\xe9 maison, \xe9pais et onctueux. Vendu en pot d\'un litre.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Lait entier, ferments lactiques.',
    allergens: 'Lait.'
  },
  {
    id: 'saveurs-afrique-degue',
    name: 'D\xe8gu\xe8 1L',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Desserts',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-yaourt.jpg'),
    description: 'Yaourt maison au couscous fin, l\xe9g\xe8rement sucr\xe9. Sp\xe9cialit\xe9 onctueuse vendue en pot d\'un litre.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Yaourt maison, couscous, sucre.',
    allergens: 'Lait, gluten.'
  },
  {
    id: 'saveurs-afrique-atchonmon',
    name: 'Atchonmon (Petits cailloux)',
    vendor: "Saveurs d'Afrique",
    price: 10,
    category: 'Snacking',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-petits-cailloux.jpg'),
    description: 'Atchonmon \u2014 petits beignets frits croustillants, l\xe9g\xe8rement sucr\xe9s. Une collation traditionnelle irr\xe9sistible.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Farine de bl\xe9, \u0153uf, sucre, lait (facultatif).',
    allergens: 'Gluten, \u0153ufs, lait.'
  },
  {
    id: 'saveurs-afrique-dokor',
    name: 'Dok\xf4r (beignets sucr\xe9s) 8u',
    vendor: "Saveurs d'Afrique",
    price: 5,
    category: 'Snacking',
    image: vendorImage('vendors/saveurs-afrique/saveurs-afrique-doko.jpg'),
    description: 'Dok\xf4r \u2014 beignets moelleux et dor\xe9s, l\xe9g\xe8rement sucr\xe9s. Parfaits pour le petit-d\xe9jeuner ou la pause gourmande. 8 unit\xe9s.',
    zone: 'Cluny',
    available: true,
    featured: false,
    ingredients: 'Farine de bl\xe9, sucre.',
    allergens: 'Gluten.'
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
