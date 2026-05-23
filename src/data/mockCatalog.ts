import { Wine, Leaf, Hammer, Sprout, Package } from 'lucide-react';

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
  { id: 'plats', name: 'Plats', icon: Wine, count: 6 },
  { id: 'snacking', name: 'Snacking', icon: Leaf, count: 3 },
  { id: 'desserts', name: 'Desserts', icon: Hammer, count: 1 },
  { id: 'accompagnements', name: 'Accompagnements', icon: Package, count: 1 },
];

export const mockProducts: LocalProduct[] = [
  {
    id: 'ninice-01',
    name: 'Riz djon djon legumes',
    vendor: 'Les Delices de Ninice',
    price: 12.90,
    category: 'plats',
    description: 'Riz djon djon maison avec legumes saisis.',
    image: assetFromPublic('vendors/ninice/ninice-01-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-02',
    name: 'Poulet sauce creole et gombo',
    vendor: 'Les Delices de Ninice',
    price: 13.90,
    category: 'plats',
    description: 'Sauce creole maison, gombo et cuisson mijotee.',
    image: assetFromPublic('vendors/ninice/ninice-02-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-03',
    name: 'Accras maison (8 pcs)',
    vendor: 'Les Delices de Ninice',
    price: 7.90,
    category: 'snacking',
    description: 'Accras croustillants servis avec sauce maison.',
    image: assetFromPublic('vendors/ninice/ninice-03-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-04',
    name: 'Box poulet fume et pates',
    vendor: 'Les Delices de Ninice',
    price: 14.90,
    category: 'plats',
    description: 'Poulet fume, pates, legumes frais et plantain.',
    image: assetFromPublic('vendors/ninice/ninice-04-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-05',
    name: 'Box poulet grille et crudites',
    vendor: 'Les Delices de Ninice',
    price: 13.50,
    category: 'plats',
    description: 'Poulet grille, crudites relevees et accompagnement.',
    image: assetFromPublic('vendors/ninice/ninice-05-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-06',
    name: 'Douceurs sucrees coco',
    vendor: 'Les Delices de Ninice',
    price: 4.90,
    category: 'desserts',
    description: 'Bouchees sucrees maison enrobage coco.',
    image: assetFromPublic('vendors/ninice/ninice-06-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-07',
    name: 'Brochettes marinees sesame',
    vendor: 'Les Delices de Ninice',
    price: 10.90,
    category: 'snacking',
    description: 'Brochettes marinees, saisies minute, finition sesame.',
    image: assetFromPublic('vendors/ninice/ninice-07-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-08',
    name: 'Crudites pimentees maison',
    vendor: 'Les Delices de Ninice',
    price: 4.50,
    category: 'accompagnements',
    description: 'Concombre, tomate, herbes et piment maison.',
    image: assetFromPublic('vendors/ninice/ninice-08-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-09',
    name: 'Box midi Ninice',
    vendor: 'Les Delices de Ninice',
    price: 12.50,
    category: 'plats',
    description: 'Menu du midi en box scellee, pret a emporter.',
    image: assetFromPublic('vendors/ninice/ninice-09-card.jpg'),
    zone: 'Dillon',
    featured: true,
    available: true,
  },
  {
    id: 'ninice-10',
    name: 'Plateau partage accras et beignets',
    vendor: 'Les Delices de Ninice',
    price: 19.90,
    category: 'snacking',
    description: 'Assortiment a partager pour groupe et evenement.',
    image: assetFromPublic('vendors/ninice/ninice-10-card.jpg'),
    zone: 'Dillon',
    featured: false,
    available: true,
  },
  {
    id: 'ninice-11',
    name: 'Plateau pret a servir',
    vendor: 'Les Delices de Ninice',
    price: 3.90,
    category: 'plats',
    description: 'Plateau organise selon commande, retrait Dillon.',
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
