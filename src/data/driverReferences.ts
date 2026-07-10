import type { TraiteurSpace } from './traiteurs';

export type DriverRef = {
  name: string;
  contact: string;
  zone: string;
  type: 'indépendant' | 'société' | 'plateforme' | 'groupe';
  transport: string;
  disponible: boolean;
  note: string;
  whatsapp?: string;
  site?: string;
};

export const driverReferences: DriverRef[] = [
  {
    name: 'Martinique Coursier',
    contact: 'Site web',
    zone: 'Toute la Martinique',
    type: 'société',
    transport: 'Scooter / Voiture',
    disponible: true,
    note: 'Livraison express documents et colis. Partenaire potentiel pour repas.',
    site: 'martiniquecoursier.com',
  },
  {
    name: 'Coursiers Antilles',
    contact: 'Site web',
    zone: 'Fort-de-France, Schœlcher, Lamentin',
    type: 'société',
    transport: 'Scooter / Voiture',
    disponible: true,
    note: 'Société de coursier. Transport et livraison urgente.',
    site: 'coursiersantilles.com',
  },
  {
    name: 'Allo Coursier Martinique',
    contact: 'Téléphone',
    zone: 'Fort-de-France',
    type: 'société',
    transport: 'Scooter',
    disponible: true,
    note: 'Livraison de nourriture, documents, colis.',
  },
  {
    name: 'Kréyol Delivery',
    contact: 'contact@kreydelivery.com',
    zone: 'Martinique',
    type: 'plateforme',
    transport: 'Scooter / Voiture',
    disponible: true,
    note: 'Plateforme 100% martiniquaise de livraison repas. Partenariat possible.',
    site: 'kreydelivery.com',
  },
  {
    name: 'Groupe Facebook Livreurs 972',
    contact: 'facebook.com/groups/livreurs972',
    zone: 'Toute la Martinique',
    type: 'groupe',
    transport: 'Tous',
    disponible: true,
    note: 'Groupe privé de livreurs indépendants Martinique. ~200 membres.',
  },
  {
    name: 'Groupe Facebook Livreurs Martinique',
    contact: 'facebook.com/groups/livreursmartinique',
    zone: 'Toute la Martinique',
    type: 'groupe',
    transport: 'Tous',
    disponible: true,
    note: 'Recherche livreurs pour plateforme livraison repas.',
  },
];