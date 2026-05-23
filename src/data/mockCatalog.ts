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
  { id: 'snacking', name: 'Snacking', icon: Leaf, count: 2 },
  { id: 'desserts', name: 'Desserts', icon: Hammer, count: 1 },
  { id: 'boissons', name: 'Boissons', icon: Sprout, count: 1 },
  { id: 'accompagnements', name: 'Accompagnements', icon: Package, count: 1 },
];

export const mockProducts: LocalProduct[] = [
  {
    id: 'ninice-01',
    name: 'Box creole classique',
    vendor: 'Les Delices de Ninice',
    price: 12.90,
    category: 'plats',
    description: 'Riz, proteine marinee et legumes. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-01-card.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'ninice-02',
    name: 'Poulet sauce creole',
    vendor: 'Les Delices de Ninice',
    price: 13.90,
    category: 'plats',
    description: 'Portion complete cuisine maison. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-02-card.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'ninice-03',
    name: 'Accras de morue (8 pcs)',
    vendor: 'Les Delices de Ninice',
    price: 7.90,
    category: 'snacking',
    description: 'Portion snacking avec sauce maison. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-03-card.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'ninice-04',
    name: 'Box mix grillades',
    vendor: 'Les Delices de Ninice',
    price: 14.90,
    category: 'plats',
    description: 'Assortiment grille avec accompagnement. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-04-card.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'ninice-05',
    name: 'Assiette complete poulet',
    vendor: 'Les Delices de Ninice',
    price: 13.50,
    category: 'plats',
    description: 'Assiette complete portion standard. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-05-card.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'ninice-06',
    name: 'Douceur coco',
    vendor: 'Les Delices de Ninice',
    price: 4.90,
    category: 'desserts',
    description: 'Dessert individuel maison. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-06-card.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'ninice-07',
    name: 'Assiette brochettes marinees',
    vendor: 'Les Delices de Ninice',
    price: 10.90,
    category: 'plats',
    description: 'Brochettes marinees et cuisson minute. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-07-card.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'ninice-08',
    name: 'Crudites pep\'s',
    vendor: 'Les Delices de Ninice',
    price: 4.50,
    category: 'accompagnements',
    description: 'Accompagnement leger et frais. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-08-card.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'ninice-09',
    name: 'Box midi Ninice',
    vendor: 'Les Delices de Ninice',
    price: 12.50,
    category: 'plats',
    description: 'Menu midi complet. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-09-card.jpg'),
    featured: true,
    available: true,
  },
  {
    id: 'ninice-10',
    name: 'Box family duo',
    vendor: 'Les Delices de Ninice',
    price: 19.90,
    category: 'plats',
    description: 'Format duo a partager. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-10-card.jpg'),
    featured: false,
    available: true,
  },
  {
    id: 'ninice-11',
    name: 'Jus du jour (50cl)',
    vendor: 'Les Delices de Ninice',
    price: 3.90,
    category: 'boissons',
    description: 'Boisson fraiche du jour. Tarif estimatif provisoire.',
    image: assetFromPublic('vendors/ninice/ninice-11-card.jpg'),
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
