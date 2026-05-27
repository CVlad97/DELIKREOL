import { mockProducts } from './mockCatalog';
import { partnerProfiles, type PartnerProfile } from './partnerProfiles';

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
  address?: string;
  offer: string;
  description: string;
  story: string;
  promise: string;
  availability: string;
  specialty: string;
  heroImage?: string | null;
  gradient: string;
  accent: string;
  highlights: string[];
  startingAt: number;
  averageTicket: number;
  turnaround: string;
  galleryImages: string[];
  profile: PartnerProfile;
  menuItems: TraiteurMenuItem[];
};

function resolveHeroImage(name: string) {
  if (name === "Saveurs d'Afrique") {
    return assetFromPublic('vendors/saveurs-afrique/saveurs-afrique-board.jpg');
  }
  return mockProducts.find((product) => product.vendor === name && product.image)?.image ?? null;
}

function resolveGalleryImages(name: string) {
  if (name === "Saveurs d'Afrique") {
    return [assetFromPublic('vendors/saveurs-afrique/saveurs-afrique-pate.jpg')];
  }
  return [];
}

function resolveMenuItems(name: string): TraiteurMenuItem[] {
  return mockProducts
    .filter((product) => product.vendor === name)
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

function buildSpace(profile: PartnerProfile, gradient: string, accent: string): TraiteurSpace {
  const menuItems = resolveMenuItems(profile.name);
  const startingAt = formatStartPrice(menuItems);
  const averageTicket = formatAverageTicket(menuItems);

  return {
    slug: normalizeSpaceSlug(profile.name),
    name: profile.name,
    legalName: profile.legalName,
    zone: profile.zone,
    address: profile.address,
    offer: profile.offer,
    description: profile.story,
    story: profile.story,
    promise: profile.promise,
    availability: profile.availability,
    specialty: profile.specialty,
    heroImage: resolveHeroImage(profile.name),
    gradient,
    accent,
    highlights: profile.highlights,
    startingAt,
    averageTicket,
    turnaround: profile.eta,
    galleryImages: resolveGalleryImages(profile.name),
    profile,
    menuItems,
  };
}

export function buildTraiteurSpaces(profiles: PartnerProfile[] = partnerProfiles) {
  return profiles
    .filter((profile) => profile.type.toLowerCase() === 'traiteur')
    .map((profile) => {
    if (profile.name === 'Les Delices de Ninice') {
      return buildSpace(profile, 'from-[#d95f2d] via-[#f49d4b] to-[#7c2d12]', '#fff7ed');
    }

    return buildSpace(profile, 'from-[#0f766e] via-[#14b8a6] to-[#14532d]', '#ecfeff');
  });
}

export const traiteurSpaces: TraiteurSpace[] = buildTraiteurSpaces();

export const featuredTraiteurSpaces = traiteurSpaces.slice(0, 2);

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
