import { mockProducts } from './mockCatalog';
import { anTjeCocoAssets, cocoFoodAssets } from './partnerAssets';
import { partnerProfiles, type PartnerProfile } from './partnerProfiles';
import { additionalPartnerProfiles } from './additionalPartnerProfiles';

export type TraiteurMenuItem = {
  name: string;
  description: string;
  price: number;
  category: string;
  featured?: boolean;
  image?: string | null;
};

export type TraiteurSpace = {
  slug: string;
  name: string;
  legalName?: string;
  zone: string;
  commune?: string;
  address?: string;
  offer: string;
  description: string;
  story: string;
  promise: string;
  availability: string;
  specialty: string;
  heroImage?: string | null;
  portraitImage?: string | null;
  gradient: string;
  accent: string;
  highlights: string[];
  startingAt: number;
  averageTicket: number;
  turnaround: string;
  galleryImages: string[];
  profile: PartnerProfile;
  menuItems: TraiteurMenuItem[];
  status: 'public confirmé' | 'public à vérifier' | 'brouillon';
  photoStatus: 'confirmée' | 'à confirmer' | 'externe à vérifier';
  bioStatus?: 'confirmée' | 'à confirmer';
  photoCredit?: string;
};

const allPartnerProfiles: PartnerProfile[] = [...partnerProfiles, ...additionalPartnerProfiles];

function resolveHeroImage(name: string) {
  if (name === 'An Tjè Coco') {
    return anTjeCocoAssets.hero;
  }
  if (name === "Coco's Food") {
    return cocoFoodAssets.hero;
  }
  if (name === "Saveurs d'Afrique") {
    return assetFromPublic('vendors/saveurs-afrique/hero.jpg');
  }
  if (name === 'Snack Savè Peyi\\u2019A') {
    return assetFromPublic('vendors/save-peyia/hero.jpg');
  }
  if (name === 'Les Delices de Ninice') {
    return assetFromPublic('vendors/ninice/hero.jpg');
  }
  return mockProducts.find((product) => product.vendor === name && product.image)?.image ?? null;
}

function resolveGalleryImages(name: string) {
  if (name === 'An Tjè Coco') {
    return anTjeCocoAssets.gallery;
  }
  if (name === "Coco's Food") {
    return cocoFoodAssets.gallery;
  }
  if (name === "Saveurs d'Afrique") {
    return [
      assetFromPublic('vendors/saveurs-afrique/gallery-01.jpg'),
      assetFromPublic('vendors/saveurs-afrique/gallery-02.jpg'),
      assetFromPublic('vendors/saveurs-afrique/gallery-03.jpg'),
      assetFromPublic('vendors/saveurs-afrique/gallery-04.jpg'),
      assetFromPublic('vendors/saveurs-afrique/gallery-05.jpg'),
      assetFromPublic('vendors/saveurs-afrique/gallery-06.jpg'),
      assetFromPublic('vendors/saveurs-afrique/gallery-07.jpg'),
      assetFromPublic('vendors/saveurs-afrique/gallery-08.jpg'),
      assetFromPublic('vendors/saveurs-afrique/gallery-09.jpg'),
      assetFromPublic('vendors/saveurs-afrique/gallery-10.jpg'),
    ];
  }
  if (name === 'Les Delices de Ninice') {
    return [
      assetFromPublic('vendors/ninice/gallery-01.jpg'),
      assetFromPublic('vendors/ninice/gallery-02.jpg'),
      assetFromPublic('vendors/ninice/gallery-03.jpg'),
      assetFromPublic('vendors/ninice/gallery-04.jpg'),
      assetFromPublic('vendors/ninice/gallery-05.jpg'),
      assetFromPublic('vendors/ninice/gallery-06.jpg'),
      assetFromPublic('vendors/ninice/gallery-07.jpg'),
      assetFromPublic('vendors/ninice/gallery-08.jpg'),
      assetFromPublic('vendors/ninice/gallery-09.jpg'),
      assetFromPublic('vendors/ninice/gallery-10.jpg'),
      assetFromPublic('vendors/ninice/gallery-11.jpg'),
    ];
  }
  if (name === 'Snack Savè Peyi\u2019A') {
    return [];
  }
  return [];
}

function normalizeVendorName(v: string) {
  return v.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/['']/g, '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function resolveMenuItems(name: string): TraiteurMenuItem[] {
  const normalized = normalizeVendorName(name);
  return mockProducts
    .filter((product) => normalizeVendorName(product.vendor) === normalized)
    .map((product) => ({
      name: product.name,
      description: product.description ?? 'Menu local disponible sur demande.',
      price: product.price,
      category: product.category,
      featured: product.featured,
      image: product.image ?? null,
    }))
    .sort((left, right) => Number(right.featured) - Number(left.featured) || left.price - right.price);
}

export function normalizeSpaceSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

function formatStartPrice(menuItems: TraiteurMenuItem[]) {
  return menuItems.length ? menuItems.reduce((lowest, item) => Math.min(lowest, item.price), Number.POSITIVE_INFINITY) : 0;
}

function formatAverageTicket(menuItems: TraiteurMenuItem[]) {
  const total = menuItems.reduce((sum, item) => sum + item.price, 0);
  return menuItems.length ? total / menuItems.length : 0;
}

function buildSpace(profile: PartnerProfile, gradient: string, accent: string, status: TraiteurSpace['status'], photoStatus: TraiteurSpace['photoStatus']): TraiteurSpace {
  const menuItems = resolveMenuItems(profile.name);
  const startingAt = formatStartPrice(menuItems);
  const averageTicket = formatAverageTicket(menuItems);
  const commune = profile.zone.split('—')[0].split('–')[0].trim();

  return {
    slug: normalizeSpaceSlug(profile.name),
    name: profile.name,
    legalName: profile.legalName,
    zone: profile.zone,
    commune,
    address: profile.address,
    offer: profile.offer,
    description: profile.story,
    story: profile.story,
    promise: profile.promise,
    availability: profile.availability,
    specialty: profile.specialty,
    heroImage: resolveHeroImage(profile.name),
    portraitImage: null,
    gradient,
    accent,
    highlights: profile.highlights,
    startingAt,
    averageTicket,
    turnaround: profile.eta,
    galleryImages: resolveGalleryImages(profile.name),
    profile,
    menuItems,
    status,
    photoStatus,
    bioStatus: 'confirmée',
    photoCredit: undefined,
  };
}

export function buildTraiteurSpaces(profiles: PartnerProfile[] = allPartnerProfiles) {
  return profiles
    .filter((profile) => profile.type.toLowerCase() === 'traiteur')
    .map((profile) => {
      if (profile.name === 'Les Delices de Ninice') {
        return buildSpace(profile, 'from-[#d95f2d] via-[#f49d4b] to-[#7c2d12]', '#fff7ed', 'public confirmé', 'confirmée');
      }

      if (profile.name === 'An Tjè Coco') {
        return buildSpace(profile, 'from-[#7c3aed] via-[#ec4899] to-[#c2410c]', '#fff1f2', 'public confirmé', 'confirmée');
      }

      if (profile.name === "Coco's Food") {
        return buildSpace(profile, 'from-[#2b1b10] via-[#8b5e34] to-[#d97706]', '#fff7ed', 'public confirmé', 'confirmée');
      }

      if (profile.name.startsWith('Snack Savè Peyi')) {
        return buildSpace(profile, 'from-[#f59e0b] via-[#dc2626] to-[#15803d]', '#fff7ed', 'public confirmé', 'confirmée');
      }

      // Saveurs d'Afrique — public confirmé
      return buildSpace(profile, 'from-[#0f766e] via-[#14b8a6] to-[#14532d]', '#ecfeff', 'public confirmé', 'confirmée');
    });
}

export const traiteurSpaces: TraiteurSpace[] = buildTraiteurSpaces();

export const featuredTraiteurSpaces = traiteurSpaces.filter(t => t.status === 'public confirmé');

export function getTraiteurSpaceBySlug(slug: string) {
  const normalizedSlug = normalizeSpaceSlug(slug);
  return traiteurSpaces.find((space) => space.slug === normalizedSlug);
}

function resolveBaseUrl(baseUrl: string) {
  return baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
}

export function buildTraiteurSpaceLink(baseUrl: string, slug: string) {
  const root = resolveBaseUrl(baseUrl);
  const params = new URLSearchParams({ view: 'traiteurs', vendor: slug });
  return `${root}?${params.toString()}`;
}

export function buildCustomerSpaceLink(baseUrl: string, slug: string) {
  const root = resolveBaseUrl(baseUrl);
  const params = new URLSearchParams({ view: 'customer', vendor: slug });
  return `${root}?${params.toString()}#catalogue`;
}

function assetFromPublic(relativePath: string): string {
  const clean = relativePath.replace(/^\/+/, '');
  return `${import.meta.env.BASE_URL}${clean}`;
}
