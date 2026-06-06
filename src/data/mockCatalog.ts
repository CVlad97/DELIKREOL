import { Wine, Leaf, Hammer } from 'lucide-react';

const assetFromPublic = (relativePath: string): string => {
  const clean = relativePath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
};

const photoAConfirmer = assetFromPublic('vendors/_fallback/photo-a-confirmer.svg');

export interface LocalProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
 