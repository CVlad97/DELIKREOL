import { UtensilsCrossed, ShoppingBasket, Coffee, IceCream, Wine, Package } from 'lucide-react';

export interface LocalProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  icon: typeof UtensilsCrossed;
  count: number;
}

export const mockCategories: Category[] = [
  { id: 'plats', name: 'Plats', icon: UtensilsCrossed, count: 24 },
  { id: 'epicerie', name: 'Épicerie', icon: ShoppingBasket, count: 45 },
  { id: 'boissons', name: 'Boissons', icon: Coffee, count: 18 },
  { id: 'desserts', name: 'Desserts', icon: IceCream, count: 12 },
  { id: 'vins', name: 'Vins & Rhums', icon: Wine, count: 15 },
  { id: 'paniers', name: 'Paniers', icon: Package, count: 8 },
];

export const mockProducts: LocalProduct[] = [
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
