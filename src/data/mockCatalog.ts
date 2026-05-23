import { Wine, Leaf, Hammer, Sprout, Package } from 'lucide-react';

export interface LocalProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  featured?: boolean;
  zone?: string;
  available?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: typeof Wine;
  count: number;
}

export const mockCategories: Category[] = [
  { id: 'rhums', name: 'Rhums', icon: Wine, count: 15 },
  { id: 'epices', name: 'Epices', icon: Leaf, count: 34 },
  { id: 'artisanat', name: 'Artisanat', icon: Hammer, count: 22 },
  { id: 'agricoles', name: 'Produits agricoles', icon: Sprout, count: 28 },
  { id: 'transformes', name: 'Produits transformes', icon: Package, count: 17 },
];

export const mockProducts: LocalProduct[] = [
  {
    id: 'ninice-1',
    name: 'Box creole complete',
    vendor: 'Les Delices de Ninice',
    price: 13.50,
    category: 'plats',
    description: 'Box traiteur: riz, proteines marinees, legumes et accompagnement.',
    image: '/vendors/ninice/ninice-09-card.jpg',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-2',
    name: 'Riz saute signature',
    vendor: 'Les Delices de Ninice',
    price: 12.00,
    category: 'plats',
    description: 'Riz saute aux epices, legumes et sauce maison.',
    image: '/vendors/ninice/ninice-01-card.jpg',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-3',
    name: 'Poulet sauce creole',
    vendor: 'Les Delices de Ninice',
    price: 12.50,
    category: 'plats',
    description: 'Poulet sauce creole avec accompagnement du jour.',
    image: '/vendors/ninice/ninice-02-card.jpg',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-4',
    name: 'Assiette brochettes',
    vendor: 'Les Delices de Ninice',
    price: 11.50,
    category: 'snacking',
    description: 'Brochettes assaisonnees, cuisson minute.',
    image: '/vendors/ninice/ninice-07-card.jpg',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-5',
    name: 'Accras croustillants',
    vendor: 'Les Delices de Ninice',
    price: 8.50,
    category: 'snacking',
    description: 'Accras servis chauds avec sauce piment doux.',
    image: '/vendors/ninice/ninice-03-card.jpg',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-6',
    name: 'Douceur coco',
    vendor: 'Les Delices de Ninice',
    price: 5.50,
    category: 'desserts',
    description: 'Dessert maison sucre, format individuel.',
    image: '/vendors/ninice/ninice-06-card.jpg',
    featured: true,
    available: true,
  },
  {
    id: 'p1',
    name: 'Colombo de poulet',
    vendor: 'Chez Tatie',
    price: 12.50,
    category: 'plats',
    description: 'Plat traditionnel martiniquais avec riz et légumes',
    featured: true,
  },
  {
    id: 'p2',
    name: 'Accras de morue (12)',
    vendor: 'La Case Créole',
    price: 8.00,
    category: 'plats',
    description: 'Beignets croustillants de morue épicée',
    featured: true,
  },
  {
    id: 'p3',
    name: 'Jus de goyave frais',
    vendor: 'Verger Tropical',
    price: 4.50,
    category: 'boissons',
    description: 'Jus 100% naturel, fraîchement pressé',
    featured: true,
  },
  {
    id: 'p4',
    name: 'Flan coco maison',
    vendor: 'Douceurs des Îles',
    price: 5.00,
    category: 'desserts',
    description: 'Dessert onctueux à la noix de coco',
    featured: true,
  },
  {
    id: 'p5',
    name: 'Panier fruits exotiques',
    vendor: 'Marché Paysan',
    price: 15.00,
    category: 'paniers',
    description: 'Mangues, ananas, fruits de la passion, bananes',
    featured: true,
  },
  {
    id: 'p6',
    name: 'Rhum agricole vieux 5 ans',
    vendor: 'Distillerie du Nord',
    price: 35.00,
    category: 'vins',
    description: 'Rhum AOC Martinique vieilli en fût de chêne',
    featured: true,
  },
  {
    id: 'p7',
    name: 'Poulet boucané',
    vendor: 'Chez Tatie',
    price: 14.00,
    category: 'plats',
    description: 'Poulet fumé au bois, sauce chien',
    featured: true,
  },
  {
    id: 'p8',
    name: 'Confiture goyave',
    vendor: 'Confitures Maison',
    price: 6.50,
    category: 'epicerie',
    description: 'Pot de 250g, recette traditionnelle',
    featured: true,
  },
  {
    id: 'p9',
    name: 'Gratin de christophine',
    vendor: 'La Case Créole',
    price: 9.00,
    category: 'plats',
    description: 'Légume local gratiné au four',
  },
  {
    id: 'p10',
    name: 'Tourment d\'amour',
    vendor: 'Douceurs des Îles',
    price: 3.50,
    category: 'desserts',
    description: 'Pâtisserie à la noix de coco et confiture',
  },
  {
    id: 'p11',
    name: 'Jus de maracuja',
    vendor: 'Verger Tropical',
    price: 4.50,
    category: 'boissons',
    description: 'Fruit de la passion, 100% naturel',
  },
  {
    id: 'p12',
    name: 'Boudin créole',
    vendor: 'Charcuterie Locale',
    price: 7.50,
    category: 'plats',
    description: 'Boudin noir antillais épicé (250g)',
  },
];

export const getFeaturedProducts = (): LocalProduct[] => {
  return mockProducts.filter(p => p.featured);
};

export const getProductsByCategory = (categoryId: string): LocalProduct[] => {
  return mockProducts.filter(p => p.category === categoryId);
};
