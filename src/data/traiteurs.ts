import { mockProducts } from './mockCatalog';
import type { HealthTag } from './mockCatalog';
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
  latitude?: number;
  longitude?: number;
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
  horaires?: Partial<Record<string, { open: string; close: string }>>;
  cutoff_time?: string;
  prep_time?: number;
  delivery_slots?: string[];
  /** Tags santé associés à ce traiteur */
  healthTags?: HealthTag[];
  /** Options de livraison spéciale : retraite, bateau */
  deliveryOptions?: ('retraite' | 'bateau' | 'infirmiere')[];
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
  if (name === 'Sweet Family Traiteur Orianne') {
    return assetFromPublic('vendors/sweet-family/bao-buns.jpg');
  }
  if (name === 'Virtuel Gouté Mwen') {
    return assetFromPublic('vendors/sweet-family/bao-buns.jpg');
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
    // 10 vraies photos WhatsApp mai 2026 — optimisées et rehaussées
    return [
      assetFromPublic('vendors/ninice/gallery-01.jpg'),  // Colombo — ragoût poulet épicé
      assetFromPublic('vendors/ninice/gallery-02.jpg'),  // Bami des Îles — bowl nouilles complet
      assetFromPublic('vendors/ninice/gallery-03.jpg'),  // Brochettes Saoto — présentation traiteur
      assetFromPublic('vendors/ninice/gallery-04.jpg'),  // Bowl complet poulet grillé + plantain
      assetFromPublic('vendors/ninice/gallery-05.jpg'),  // Gulab Jamun — douceurs sucrées
      assetFromPublic('vendors/ninice/gallery-06.jpg'),  // Bara — beignets croustillants
      assetFromPublic('vendors/ninice/gallery-07.jpg'),  // Packaging + logo Les Délices de Ninice
      assetFromPublic('vendors/ninice/gallery-08.jpg'),  // Moksi Aleisi — riz sauté végétarien
      assetFromPublic('vendors/ninice/gallery-09.jpg'),  // Bara version traiteur en boîte
      assetFromPublic('vendors/ninice/gallery-10.jpg'),  // Condiment mariné fait maison
    ];
  }
    if (name === 'Snack Savè Peyi\u2019A') {
    return [];
  }
  if (name === 'Sweet Family Traiteur Orianne') {
    return [
      assetFromPublic('vendors/sweet-family/bao-buns.jpg'),
      assetFromPublic('vendors/sweet-family/cocktails-mignardises.jpg'),
      assetFromPublic('vendors/sweet-family/conditions.jpg'),
    ];
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

function resolvePortraitImage(name: string) {
  if (name === 'Les Delices de Ninice') {
    return assetFromPublic('vendors/ninice/portrait.jpg');
  }
  if (name === 'An Tjè Coco') {
    return assetFromPublic('vendors/an-tje-coco/portrait.jpg');
  }
  if (name === "Coco's Food") {
    return assetFromPublic('vendors/coco/portrait.jpg');
  }
  if (name === "Saveurs d'Afrique") {
    return assetFromPublic('vendors/saveurs-afrique/portrait.jpg');
  }
  if (name === 'Snack Savè Peyi\u2019A') {
    return assetFromPublic('vendors/save-peyia/portrait.jpg');
  }
  if (name === 'Sweet Family Traiteur Orianne') {
    return assetFromPublic('vendors/sweet-family/portrait.jpg');
  }
  return null;
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
    portraitImage: resolvePortraitImage(profile.name),
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
    healthTags: profile.healthTags,
    deliveryOptions: profile.deliveryOptions,
  };
}

export function buildTraiteurSpaces(profiles: PartnerProfile[] = allPartnerProfiles) {
  return profiles
    .filter((profile) => profile.type.toLowerCase() === 'traiteur')
    .map((profile) => {
      if (profile.name === 'Les Delices de Ninice') {
        return {
          ...buildSpace(profile, 'from-[#d95f2d] via-[#f49d4b] to-[#7c2d12]', '#fff7ed', 'public confirmé', 'confirmée'),
          horaires: { lun: { open: '08:00', close: '18:00' }, mar: { open: '08:00', close: '18:00' }, mer: { open: '08:00', close: '18:00' }, jeu: { open: '08:00', close: '18:00' }, ven: { open: '08:00', close: '18:00' }, sam: { open: '09:00', close: '15:00' } },
          cutoff_time: '10:30',
          prep_time: 30,
          delivery_slots: ['11:30-12:30', '12:30-13:30', '18:00-19:00', '19:00-20:00'],
        };
      }

      if (profile.name === 'An Tjè Coco') {
        return {
          ...buildSpace(profile, 'from-[#7c3aed] via-[#ec4899] to-[#c2410c]', '#fff1f2', 'public confirmé', 'confirmée'),
          horaires: { mar: { open: '14:00', close: '22:00' }, mer: { open: '14:00', close: '22:00' }, jeu: { open: '14:00', close: '22:00' }, ven: { open: '14:00', close: '22:00' }, sam: { open: '14:00', close: '22:00' } },
          cutoff_time: '09:30',
          prep_time: 40,
          delivery_slots: ['18:00-19:00', '19:00-20:00', '20:00-21:00'],
        };
      }

      if (profile.name === "Coco's Food") {
        return {
          ...buildSpace(profile, 'from-[#2b1b10] via-[#8b5e34] to-[#d97706]', '#fff7ed', 'public confirmé', 'confirmée'),
          horaires: { lun: { open: '09:00', close: '21:00' }, mar: { open: '09:00', close: '21:00' }, mer: { open: '09:00', close: '21:00' }, jeu: { open: '09:00', close: '21:00' }, ven: { open: '09:00', close: '21:00' }, sam: { open: '09:00', close: '21:00' }, dim: { open: '10:00', close: '16:00' } },
          cutoff_time: '11:00',
          prep_time: 25,
          delivery_slots: ['11:30-12:30', '12:30-13:30', '18:00-19:00', '19:00-20:00', '20:00-21:00'],
        };
      }

      if (profile.name.startsWith('Snack Savè Peyi')) {
        return {
          ...buildSpace(profile, 'from-[#f59e0b] via-[#dc2626] to-[#15803d]', '#fff7ed', 'public confirmé', 'confirmée'),
          horaires: { lun: { open: '07:00', close: '19:00' }, mar: { open: '07:00', close: '19:00' }, mer: { open: '07:00', close: '19:00' }, jeu: { open: '07:00', close: '19:00' }, ven: { open: '07:00', close: '19:00' }, sam: { open: '07:00', close: '19:00' } },
          cutoff_time: '11:30',
          prep_time: 20,
          delivery_slots: ['11:30-12:30', '12:30-13:30', '18:00-19:00', '19:00-20:00'],
        };
      }

      // Virtuel Gouté Mwen — sirops artisanaux, public confirmé
      if (profile.name === 'Virtuel Gouté Mwen') {
        return {
          ...buildSpace(profile, 'from-[#eab308] via-[#f97316] to-[#dc2626]', '#fff7ed', 'public confirmé', 'à confirmer'),
          horaires: { lun: { open: '08:00', close: '18:00' }, mar: { open: '08:00', close: '18:00' }, mer: { open: '08:00', close: '18:00' }, jeu: { open: '08:00', close: '18:00' }, ven: { open: '08:00', close: '18:00' }, sam: { open: '09:00', close: '13:00' } },
          cutoff_time: '10:00',
          prep_time: 15,
          delivery_slots: ['11:30-12:30', '12:30-13:30', '18:00-19:00'],
        };
      }

      // Sweet Family Traiteur Orianne — cocktails & mignardises, public confirmé
      if (profile.name === 'Sweet Family Traiteur Orianne') {
        return {
          ...buildSpace(profile, 'from-[#dc2626] via-[#f97316] to-[#eab308]', '#fff7ed', 'public confirmé', 'à confirmer'),
          horaires: { lun: { open: '08:00', close: '20:00' }, mar: { open: '08:00', close: '20:00' }, mer: { open: '08:00', close: '20:00' }, jeu: { open: '08:00', close: '20:00' }, ven: { open: '08:00', close: '20:00' }, sam: { open: '09:00', close: '18:00' } },
          cutoff_time: '48:00',
          prep_time: 60,
          delivery_slots: ['11:30-12:30', '12:30-13:30', '18:00-19:00', '19:00-20:00'],
        };
      }

      // Saveurs d'Afrique — public confirmé
      return {
        ...buildSpace(profile, 'from-[#0f766e] via-[#14b8a6] to-[#14532d]', '#ecfeff', 'public confirmé', 'confirmée'),
        horaires: { lun: { open: '09:00', close: '18:00' }, mar: { open: '09:00', close: '18:00' }, mer: { open: '09:00', close: '18:00' }, jeu: { open: '09:00', close: '18:00' }, ven: { open: '09:00', close: '18:00' }, sam: { open: '10:00', close: '16:00' } },
        cutoff_time: '10:00',
        prep_time: 35,
        delivery_slots: ['11:30-12:30', '12:30-13:30', '18:00-19:00', '19:00-20:00'],
      };
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
