const assetFromPublic = (relativePath: string): string => `${import.meta.env.BASE_URL}${relativePath.replace(/^\/+/, '')}`;

export const photoAConfirmer = assetFromPublic('vendors/_fallback/photo-a-confirmer.svg');

export interface LocalProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  zone?: string;
  available?: boolean;
  featured?: boolean;
  allergens?: string;
  ingredients?: string