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
  available?: boolean;
  featured?: boolean;
  allergens?: string;
  ingredients?: string;
  sides?: string[];
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
    description: 'Côte de porc grillée, servie avec riz, lentilles, légumes pays et crudités. Fait maison avec amour !',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    sides: ['riz', 'lentilles', 'légumes pays', 'crudités'],
    ingredients: 'Côte de porc grillée, accompagnée de riz, lentilles, légumes pays et crudités.',
    allergens: 'À confirmer.',
  },
  {
    id: 'save-peyia-filet-poulet',
    name: 'Filet de poulet',
    vendor: 'Snack Save Peyia',
    price: 10,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/hero.jpg'),
    description: 'Filet de poulet grillé aux herbes, servi avec riz, lentilles, légumes pays et crudités.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    sides: ['riz', 'lentilles', 'légumes pays', 'crudités'],
    ingredients: 'Filet de poulet grillé, accompagné de riz, lentilles, légumes pays et crudités.',
    allergens: 'À confirmer.',
  },
  {
    id: 'save-peyia-crevettes',
    name: 'Crevettes grillées',
    vendor: 'Snack Save Peyia',
    price: 14,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/hero.jpg'),
    description: 'Crevettes grillées assaisonnées, servies avec riz, lentilles, légumes pays et crudités. La spécialité du Pont de Fer !',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    sides: ['riz', 'lentilles', 'légumes pays', 'crudités'],
    ingredients: 'Crevettes grillées, accompagnées de riz, lentilles, légumes pays et crudités.',
    allergens: 'Crustacés. Autres allergènes à confirmer.',
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
    ingredients: 'Banane jaune, fromage, épices antillaises. Composition à confirmer avec la prestataire.',
    allergens: 'À confirmer.',
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
    allergens: 'Gluten. Autres allergènes à confirmer.',
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
  // Cuisine de marché — photos WhatsApp 2026
  // Source : conversation WhatsApp mai 2026 — prix à confirmer
  // ═══════════════════════════════════════════════════════
  {
    id: 'cocos-food-plat-jour-1',
    name: 'Plat du jour',
    vendor: "Coco's Food",
    price: 11,
    category: 'Plats',
    image: vendorImage('vendors/coco/gallery-01.jpg'),
    description: 'Plat du jour cuisine de marché, servi au Marché de Rivière-Pilote. Prix et composition à confirmer avec le traiteur.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Composition à confirmer avec le prestataire.',
    allergens: 'À confirmer.',
  },
  {
    id: 'cocos-food-bowl',
    name: 'Bowl frais du marché',
    vendor: "Coco's Food",
    price: 12,
    category: 'Bowl',
    image: vendorImage('vendors/coco/gallery-03.jpg'),
    description: 'Bowl frais et complet. Prix et composition à confirmer avec le traiteur.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Composition à confirmer.',
    allergens: 'À confirmer.',
  },
  {
    id: 'cocos-food-pates',
    name: 'Assiette de pâtes',
    vendor: "Coco's Food",
    price: 10,
    category: 'Pâtes',
    image: vendorImage('vendors/coco/gallery-04.jpg'),
    description: 'Assiette de pâtes généreuse, spécialité du marché. Prix à confirmer.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Pâtes, sauce, accompagnements. Composition à confirmer.',
    allergens: 'Gluten. Autres allergènes à confirmer.',
  },

  // ═══════════════════════════════════════════════════════
  // SAVEURS D'AFRIQUE / LODIKA — Rivière-Salée
  // Cuisine africaine maison — photos WhatsApp 2026
  // Source : conversation WhatsApp — prix à confirmer
  // ═══════════════════════════════════════════════════════
  {
    id: 'saveurs-afrique-matoutou',
    name: 'Matoutou de crabe',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/gallery-01.jpg'),
    description: 'Matoutou de crabe, spécialité de Lodika Saveurs d\'Afrique. Cuisine africaine maison. Prix à confirmer.',
    zone: 'Rivière-Salée',
    available: true,
    featured: true,
    ingredients: 'Crabe, riz, légumes, épices africaines. Composition à confirmer.',
    allergens: 'Crustacés. Autres allergènes à confirmer.',
  },
  {
    id: 'saveurs-afrique-ablo',
    name: 'Ablo',
    vendor: "Saveurs d'Afrique",
    price: 6,
    category: 'Snacking',
    image: vendorImage('vendors/saveurs-afrique/gallery-02.jpg'),
    description: 'Ablo — pain vapeur ivoirien, servi avec sauce. Prix à confirmer.',
    zone: 'Rivière-Salée',
    available: true,
    featured: true,
    ingredients: 'Farine de maïs, semoule, levure. Composition à confirmer.',
    allergens: 'Gluten. Autres allergènes à confirmer.',
  },
  {
    id: 'saveurs-afrique-doko',
    name: 'Doko',
    vendor: "Saveurs d'Afrique",
    price: 5,
    category: 'Snacking',
    image: vendorImage('vendors/saveurs-afrique/gallery-04.jpg'),
    description: 'Doko — beignet africain moelleux. Prix à confirmer.',
    zone: 'Rivière-Salée',
    available: true,
    featured: false,
    ingredients: 'Farine, levure, sucre. Composition à confirmer.',
    allergens: 'Gluten. Autres allergènes à confirmer.',
  },
  {
    id: 'saveurs-afrique-bissap',
    name: 'Bissap',
    vendor: "Saveurs d'Afrique",
    price: 3,
    category: 'Boissons',
    image: vendorImage('vendors/saveurs-afrique/gallery-03.jpg'),
    description: 'Bissap — boisson rafraîchissante à l\'hibiscus, faite maison. Prix à confirmer.',
    zone: 'Rivière-Salée',
    available: true,
    featured: false,
    ingredients: 'Fleurs d\'hibiscus, sucre, eau, menthe.',
    allergens: 'Aucun.',
  },

  // ═══════════════════════════════════════════════════════
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
    allergens: 'À confirmer.',
  },
  {
    id: 'ninice-moksi-vegetarien',
    name: 'Le Moksi Aleisi Végétarien',
    vendor: 'Les Delices de Ninice',
    price: 7,
    category: 'Plats',
    image: vendorImage('vendors/ninice/ninice-02-card.jpg'),
    description: 'Riz sauté surinamais aux légumes, version végétarienne. Simple et savoureux.',
    zone: 'Fort-de-France',
    available: true,
    featured: false,
    ingredients: 'Riz, légumes variés, épices surinamaises.',
    allergens: 'À confirmer.',
  },
  {
    id: 'ninice-moksi-poulet',
    name: 'Le Moksi Aleisi + Poulet',
    vendor: 'Les Delices de Ninice',
    price: 10.5,
    category: 'Plats',
    image: vendorImage('vendors/ninice/ninice-03-card.jpg'),
    description: 'Riz sauté surinamais accompagné de poulet. Recette traditionnelle maison.',
    zone: 'Fort-de-France',
    available: true,
    featured: true,
    ingredients: 'Riz, poulet, légumes, épices surinamaises.',
    allergens: 'À confirmer.',
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
    allergens: 'À confirmer.',
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
    allergens: 'Gluten. Autres allergènes à confirmer.',
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
    allergens: 'À confirmer.',
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
    allergens: 'À confirmer.',
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
    allergens: 'À confirmer.',
  },
];

export function getFeaturedProducts(): LocalProduct[] {
  return mockProducts.filter(p => p.featured);
}
