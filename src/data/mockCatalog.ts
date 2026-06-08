export const photoAConfirmer = '';

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

export const mockCategories: Category[] = [];

export const mockProducts: LocalProduct[] = [];
