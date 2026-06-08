export const photoAConfirmer = '/DELIKREOL/vendors/_fallback/photo-a-confirmer.svg';

export interface LocalProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  category: string;
  image?: string | null;
  description?: string;
  zone?: string;
  available?: boolean;
  featured?: boolean;
  allergens?: string;
  ingredients?: string;
}

export type Category = {
  id: string;
  name: string;
  description?: string;
};

export const mockCategories: Category[] = [
  { id: 'plats', name: 'Plats' },
  { id: 'snacking', name: 'Snacking' },
  { id: 'desserts', name: 'Desserts' }
];

export const mockProducts: LocalProduct[] = [
  {
    id: 'save-peyia-cote-porc',
    name: 'Cote de porc',
    vendor: 'Snack Save Peyia',
    price: 12,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Plat local avec accompagnements. Horaires et livraison a confirmer.',
    zone: 'Riviere-Pilote',
    available: true,
    featured: true,
    ingredients: 'Cote de porc et accompagnements a confirmer.',
    allergens: 'A confirmer.'
  },
  {
    id: 'save-peyia-filet-poulet',
    name: 'Filet de poulet',
    vendor: 'Snack Save Peyia',
    price: 10,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Filet de poulet avec accompagnements. Horaires et livraison a confirmer.',
    zone: 'Riviere-Pilote',
    available: true,
    featured: true,
    ingredients: 'Poulet et accompagnements a confirmer.',
    allergens: 'A confirmer.'
  },
  {
    id: 'save-peyia-crevettes',
    name: 'Crevettes grillees',
    vendor: 'Snack Save Peyia',
    price: 14,
    category: 'Plats',
    image: photoAConfirmer,
    description: 'Crevettes grillees avec accompagnements. Horaires et livraison a confirmer.',
    zone: 'Riviere-Pilote',
    available: true,
    featured: true,
    ingredients: 'Crevettes et accompagnements a confirmer.',
    allergens: 'Crustaces. Autres allergenes a confirmer.'
  }
];
