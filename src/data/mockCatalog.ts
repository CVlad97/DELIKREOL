import { Wine, Leaf, Hammer } from 'lucide-react';

const assetFromPublic = (relativePath: string): string => {
  const clean = relativePath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
};

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
  { id: 'plats', name: 'Plats', icon: Wine, count: 5 },
  { id: 'snacking', name: 'Snacking', icon: Leaf, count: 4 },
  { id: 'desserts', name: 'Desserts', icon: Hammer, count: 2 },
];

export const mockProducts: LocalProduct[] = [
  {
    id: 'ninice-colombo-deux-rives',
    name: 'Colombo des deux rives',
    vendor: 'Les Delices de Ninice',
    price: 14.00,
    category: 'plats',
    description: 'Accompagnement inclus: riz aux piments vegetariens.',
    image: assetFromPublic('vendors/ninice/ninice-01-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-moksi-veg',
    name: 'Moksi Aleisi vegetarien',
    vendor: 'Les Delices de Ninice',
    price: 7.00,
    category: 'plats',
    description: 'Base vegetarienne. Option poulet +3,50 EUR ou porc +4,50 EUR.',
    image: assetFromPublic('vendors/ninice/ninice-02-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-moksi-poulet',
    name: 'Moksi Aleisi + poulet',
    vendor: 'Les Delices de Ninice',
    price: 10.50,
    category: 'plats',
    description: 'Version avec supplement poulet.',
    image: assetFromPublic('vendors/ninice/ninice-03-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-moksi-porc',
    name: 'Moksi Aleisi + porc',
    vendor: 'Les Delices de Ninice',
    price: 11.50,
    category: 'plats',
    description: 'Version avec supplement porc.',
    image: assetFromPublic('vendors/ninice/ninice-04-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-bami-iles',
    name: 'Bami des iles',
    vendor: 'Les Delices de Ninice',
    price: 14.00,
    category: 'plats',
    description: 'Plat signature Bami des iles.',
    image: assetFromPublic('vendors/ninice/ninice-05-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-bara-signature',
    name: 'Bara + sauce signature',
    vendor: 'Les Delices de Ninice',
    price: 1.80,
    category: 'snacking',
    description: 'Beignet vegetarien au curry.',
    image: assetFromPublic('vendors/ninice/ninice-06-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-gulab-amande',
    name: 'Gulab Jamun amande',
    vendor: 'Les Delices de Ninice',
    price: 0.80,
    category: 'desserts',
    description: 'Dessert avec sirop maison.',
    image: assetFromPublic('vendors/ninice/ninice-07-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-gulab-coco',
    name: 'Gulab Jamun coco',
    vendor: 'Les Delices de Ninice',
    price: 0.80,
    category: 'desserts',
    description: 'Dessert avec sirop maison.',
    image: assetFromPublic('vendors/ninice/ninice-08-card.jpg'),
    zone: 'Dillon',
    featured: false,
    available: true,
  },
  {
    id: 'ninice-mini-brochette-poulet',
    name: 'Mini brochette Saoto poulet',
    vendor: 'Les Delices de Ninice',
    price: 2.50,
    category: 'snacking',
    description: 'Mini brochette Saoto.',
    image: assetFromPublic('vendors/ninice/ninice-09-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-mini-brochette-porc',
    name: 'Mini brochette Saoto porc',
    vendor: 'Les Delices de Ninice',
    price: 3.00,
    category: 'snacking',
    description: 'Mini brochette Saoto.',
    image: assetFromPublic('vendors/ninice/ninice-10-card.jpg'),
    zone: 'Dillon',
    featured: false,
    available: true,
  },
  {
    id: 'ninice-mini-brochette-boeuf',
    name: 'Mini brochette Saoto boeuf',
    vendor: 'Les Delices de Ninice',
    price: 3.50,
    category: 'snacking',
    description: 'Mini brochette Saoto.',
    image: assetFromPublic('vendors/ninice/ninice-11-card.jpg'),
    zone: 'Dillon',
    featured: false,
    available: true,
  },
];

export const getFeaturedProducts = (): LocalProduct[] => {
  return mockProducts.filter(p => p.featured);
};

export const getProductsByCategory = (categoryId: string): LocalProduct[] => {
  return mockProducts.filter(p => p.category === categoryId);
};
