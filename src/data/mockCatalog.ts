import type { MenuOptions } from '../types/menu';

function vendorImage(path: string): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path.replace(/^\//, '')}`;
}

export const photoAConfirmer = vendorImage('vendors/_fallback/photo-a-confirmer.svg');

export type HealthTag = 'diabétique' | 'sans-sel' | 'fibre' | 'sans-gluten' | 'vegan' | 'equilibre' | 'brunch' | 'traiteur-evenementiel' | 'fait-maison';

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
  photoQuality?: 'validée' | 'floue' | 'non bankable' | 'à valider';
  descQuality?: 'validée' | 'à corriger' | 'composition manquante' | 'à valider';
  healthTags?: HealthTag[];
  menuOptions?: MenuOptions | null;
}

export const HEALTH_TAGS: { id: HealthTag; name: string; icon: string; description: string }[] = [
  { id: 'diabétique', name: 'Diabétique', icon: '🩺', description: 'Sans sucre ajouté, adapté aux diabétiques' },
  { id: 'sans-sel', name: 'Sans sel', icon: '🧂', description: 'Pauvre en sodium, pour régime sans sel' },
  { id: 'fibre', name: 'Riche en fibres', icon: '🌾', description: 'Aliments riches en fibres alimentaires' },
  { id: 'sans-gluten', name: 'Sans gluten', icon: '🌾', description: 'Convient aux intolérants au gluten' },
  { id: 'vegan', name: 'Vegan', icon: '🌱', description: 'Sans produit animal' },
  { id: 'equilibre', name: 'Équilibré', icon: '⚖️', description: 'Repas équilibré / healthy' },
  { id: 'fait-maison', name: 'Fait maison', icon: '✓', description: 'Préparation artisanale maison' },
];

export type Category = { id: string; name: string; description?: string };

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

const standardMenu: MenuOptions = {
  sides: ['Riz', 'Lentilles', 'Légumes pays', 'Frites', 'Crudités'],
  drinks: ['Jus local', 'Eau', 'Citronnade', 'Boisson à confirmer'],
  included_side_count: 1,
  included_drink_count: 1,
};

export const mockProducts: LocalProduct[] = [
  {
    id: 'save-peyia-cote-porc',
    name: 'Côte de porc riz crudités',
    vendor: "Snack Savè Peyi'A",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg'),
    description: 'Côte de porc grillée au feu de bois, riz et crudités. Composition à confirmer par le partenaire avant préparation.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Côte de porc, riz, crudités, sauce maison.',
    allergens: 'À confirmer avec le partenaire.',
    healthTags: ['fait-maison'],
    menuOptions: standardMenu,
  },
  {
    id: 'save-peyia-entrecote',
    name: 'Entrecôte',
    vendor: "Snack Savè Peyi'A",
    price: 18,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0008.jpg'),
    description: 'Entrecôte grillée, accompagnement au choix. Commande pilote confirmée manuellement.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Entrecôte, accompagnement au choix.',
    allergens: 'À confirmer avec le partenaire.',
    healthTags: ['fait-maison'],
    menuOptions: standardMenu,
  },
  {
    id: 'save-peyia-cabri',
    name: 'Cabri',
    vendor: "Snack Savè Peyi'A",
    price: 16,
    category: 'Plats',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0010.jpg'),
    description: 'Cabri grillé aux épices créoles, accompagnement au choix.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Cabri grillé, épices, accompagnement au choix.',
    allergens: 'À confirmer avec le partenaire.',
    healthTags: ['fait-maison'],
    menuOptions: standardMenu,
  },
  {
    id: 'save-peyia-cocktail-fruit',
    name: 'Cocktail de fruits',
    vendor: "Snack Savè Peyi'A",
    price: 6,
    category: 'Boissons',
    image: vendorImage('vendors/save-peyia/drive-reimport/IMG-20260710-WA0015.jpg'),
    description: 'Cocktail de fruits frais sans alcool. Disponibilité à confirmer.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: false,
    ingredients: 'Fruits frais de saison.',
    allergens: 'Aucun connu, à confirmer.',
    healthTags: ['fait-maison'],
  },
  {
    id: 'saveurs-afrique-foutou',
    name: 'Foutou banane sauce arachide',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0156.jpg'),
    description: 'Foutou banane avec sauce arachide onctueuse. Allergène arachide à signaler clairement.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Banane plantain, arachide, viande ou protéine selon disponibilité.',
    allergens: 'Arachide.',
    healthTags: ['fait-maison'],
  },
  {
    id: 'saveurs-afrique-ablo',
    name: 'Ablo (gâteau de riz)',
    vendor: "Saveurs d'Afrique",
    price: 15,
    category: 'Plats',
    image: vendorImage('vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0155.jpg'),
    description: 'Ablo vapeur avec poisson et sauce, selon disponibilité.',
    zone: 'Cluny',
    available: true,
    featured: true,
    ingredients: 'Riz, poisson, sauce tomate-piment.',
    allergens: 'Poisson.',
    healthTags: ['fait-maison', 'sans-gluten'],
  },
  {
    id: 'cocos-food-box-grille',
    name: 'Box grillé du marché',
    vendor: "Coco's Food",
    price: 12,
    category: 'Plats',
    image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg'),
    description: 'Box grillé généreux avec accompagnements du marché.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Grillade, riz, crudités, légumes selon disponibilité.',
    allergens: 'À confirmer avec le partenaire.',
    healthTags: ['fait-maison'],
    menuOptions: standardMenu,
  },
  {
    id: 'cocos-food-poulet-roti',
    name: 'Poulet rôti, riz & crudités',
    vendor: "Coco's Food",
    price: 11,
    category: 'Plats',
    image: vendorImage('vendors/coco/drive-reimport/IMG-20260526-WA0066.jpg'),
    description: 'Poulet rôti, riz et crudités. Plat pilote à confirmer avant préparation.',
    zone: 'Rivière-Pilote',
    available: true,
    featured: true,
    ingredients: 'Poulet, riz, crudités, épices.',
    allergens: 'À confirmer avec le partenaire.',
    healthTags: ['fait-maison'],
    menuOptions: standardMenu,
  },
  {
    id: 'ninice-colombo',
    name: 'Le Colombo des Deux Rives',
    vendor: 'Les Delices de Ninice',
    price: 14,
    category: 'Plats',
    image: vendorImage('vendors/ninice/drive-reimport/IMG-20260521-WA0071.jpg'),
    description: 'Colombo signature. Disponibilité et composition à confirmer.',
    zone: 'Fort-de-France',
    available: true,
    featured: true,
    ingredients: 'Viande, colombo, légumes, riz.',
    allergens: 'À confirmer avec le partenaire.',
    healthTags: ['fait-maison'],
  },
  {
    id: 'sweet-family-landfood-solo',
    name: 'Land food solo',
    vendor: 'Sweet Family Traiteur Orianne',
    price: 39.9,
    category: 'Traiteur événementiel',
    image: vendorImage('vendors/sweet-family/landfood-solo.jpg'),
    description: 'Offre événementielle généreuse. Précommande et capacité à confirmer.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Viandes grillées, maïs, œufs, accompagnements.',
    allergens: 'Œuf.',
    healthTags: ['traiteur-evenementiel', 'fait-maison'],
  },
  {
    id: 'goute-mwen-mangue',
    name: 'Gouté Mwen — Mangue',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-mangue-ai.jpg'),
    description: 'Glace artisanale à la mangue. Disponibilité à confirmer avant commande.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Mangue, sucre.',
    allergens: 'À confirmer avec le partenaire.',
    healthTags: ['fait-maison'],
  },
  {
    id: 'goute-mwen-canne',
    name: 'Gouté Mwen — Canne (sans sucre ajouté)',
    vendor: 'Gouté Mwen',
    price: 2,
    category: 'Desserts',
    image: vendorImage('vendors/goute-mwen/supplied-ai-20260722/goute-mwen-canne-ai.jpg'),
    description: 'Glace artisanale à la canne, sans sucre ajouté.',
    zone: 'Martinique',
    available: true,
    featured: true,
    ingredients: 'Canne.',
    allergens: 'À confirmer avec le partenaire.',
    healthTags: ['diabétique', 'sans-gluten', 'fait-maison'],
  },
];

export function getFeaturedProducts(): LocalProduct[] {
  return mockProducts.filter((product) => product.available && product.featured);
}
