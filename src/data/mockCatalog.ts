import { Wine, Leaf, Hammer } from 'lucide-react';
import { anTjeCocoAssets } from './partnerAssets';

const assetFromPublic = (relativePath: string): string => {
  const clean = relativePath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
};

const photoAConfirmer = assetFromPublic('vendors/_fallback/photo-a-confirmer.svg');

export interface LocalProduct {
  id: string;
  name: string;
  vendor: