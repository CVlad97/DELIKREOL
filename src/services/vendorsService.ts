/**
 * vendorsService.ts — DELIKREOL
 * Service hybride : charge les partenaires depuis Supabase et complète chaque
 * fiche avec les données statiques lorsque Supabase ne contient pas encore tous
 * les champs éditoriaux ou médias.
 * Mode : VITE_PUBLIC_VENDOR_SOURCE = 'supabase' | 'static' | 'hybrid'
 */
import type { TraiteurSpace } from '../data/traiteurs';
import type { PartnerProfile } from '../data/partnerProfiles';
import { PUBLIC_HIDDEN_TRAITEURS, normalizeSpaceSlug, traiteurSpaces } from '../data/traiteurs';
import { publicSupabase } from '../lib/publicSupabase';
import { sanitizeSocialLinks, type SocialLinkSet } from '../utils/socialLinks';

type SourceMode = 'supabase' | 'static' | 'hybrid';

const SOURCE_MODE: SourceMode =
  import.meta.env.VITE_PUBLIC_VENDOR_SOURCE === 'supabase' ||
  import.meta.env.VITE_PUBLIC_VENDOR_SOURCE === 'static'
    ? import.meta.env.VITE_PUBLIC_VENDOR_SOURCE
    : 'hybrid';

export type VendorRaw = {
  id: string;
  name: string;
  business_name: string | null;
  description: string | null;
  address: string | null;
  zone_label: string | null;
  commune: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  is_public: boolean;
  is_active: boolean;
  is_demo: boolean;
  status: string;
  hero_image: string | null;
  portrait_image: string | null;
  gallery_images: string[] | null;
  highlights: string[] | null;
  delivery_radius_km: number;
  photo_status: string | null;
  public_display_status: string | null;
  story: string | null;
  promise: string | null;
  specialty: string | null;
  gradient: string | null;
  accent: string | null;
  legal_name: string | null;
  siret: string | null;
  planifiable: boolean | null;
  enterprise: boolean | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  website_url?: string | null;
  social_links?: Partial<SocialLinkSet> | null;
};

function normalizedKey(value: string | null | undefined): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '');
}

function isHiddenPublicVendor(vendor: VendorRaw): boolean {
  const hiddenKeys = new Set(Array.from(PUBLIC_HIDDEN_TRAITEURS, normalizedKey));
  return hiddenKeys.has(normalizedKey(vendor.business_name)) || hiddenKeys.has(normalizedKey(vendor.name));
}

function nonEmptyText(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function nonEmptyArray<T>(value: T[] | null | undefined): T[] | null {
  return Array.isArray(value) && value.length > 0 ? value : null;
}

function trustedPublicMedia(value: string | null | undefined): string | null {
  const media = nonEmptyText(value);
  if (!media) return null;

  const normalized = media.toLowerCase();
  const isRejectedByEditorialTriage =
    normalized.includes('vendors/an-tje-coco/') ||
    normalized.includes('vendors/goute-mwen/import-20260722/') ||
    /vendors\/goute-mwen\/supplied-ai-20260722\/goute-mwen-(?:assortiment-(?:nappe|serviette|sable)|glaciere-(?:nappe|sable)|kit-bio)/.test(normalized) ||
    /vendors\/coco\/drive-reimport\/(?:img-20260521-wa009[12]|img-20260601-wa0244)\.jpg/.test(normalized) ||
    /vendors\/ninice\/drive-reimport\/(?:img-20260521-wa009[12]|img-20260521-wa0238|img-20260526-wa0069)\.jpg/.test(normalized) ||
    /vendors\/save-peyia\/drive-reimport\/(?:img-20260710-wa000[567]|img-20260521-wa009[12]|img-20260710-wa004[01])\.jpg/.test(normalized) ||
    /vendors\/saveurs-afrique\/drive-reimport\/(?:img-20260525-wa0106|img-20260525-wa0181|img-20260612-wa020[123])\.jpg/.test(normalized);
  const isKnownLegacyLocalMedia =
    /(?:^|\/)vendors\/(?:an-tje-coco|coco|save-peyia|ninice|saveurs-afrique|sweet-family)\/(?:hero|portrait)\.(?:jpe?g|png|webp)(?:$|\?)/.test(normalized) ||
    /(?:^|\/)vendors\/[^?#]*(?:card|menu|conditions|commande|board|flyer|capture|screenshot|whatsapp)[^?#]*\.(?:jpe?g|png|webp)(?:$|\?)/.test(normalized) ||
    normalized.includes('vendors/sweet-family/cocktails-mignardises-hero.webp');

  return isRejectedByEditorialTriage || isKnownLegacyLocalMedia ? null : media;
}

function trustedPublicMediaArray(value: string[] | null | undefined): string[] | null {
  const trusted = (value || []).map((item) => trustedPublicMedia(item)).filter((item): item is string => Boolean(item));
  return trusted.length > 0 ? trusted : null;
}

function resolveStaticVendor(vendor: VendorRaw): TraiteurSpace | undefined {
  const keys = new Set([
    normalizedKey(vendor.business_name),
    normalizedKey(vendor.name),
  ]);

  return traiteurSpaces.find((candidate) =>
    keys.has(normalizedKey(candidate.name)) || keys.has(normalizedKey(candidate.legalName)),
  );
}

function resolveDisplayStatus(vendor: VendorRaw): TraiteurSpace['status'] {
  if (
    vendor.public_display_status === 'public confirmé' ||
    vendor.public_display_status === 'public à vérifier' ||
    vendor.public_display_status === 'brouillon'
  ) {
    return vendor.public_display_status;
  }

  return vendor.status === 'verified' ? 'public confirmé' : 'public à vérifier';
}

function resolvePhotoStatus(vendor: VendorRaw): TraiteurSpace['photoStatus'] {
  if (
    vendor.photo_status === 'confirmée' ||
    vendor.photo_status === 'à confirmer' ||
    vendor.photo_status === 'externe à vérifier'
  ) {
    return vendor.photo_status;
  }

  return 'à confirmer';
}

/**
 * Fusionne une ligne Supabase avec sa fiche statique. Les valeurs Supabase
 * renseignées restent prioritaires, mais les champs vides ne remplacent jamais
 * les photos, menus, descriptions ou coordonnées déjà validés côté frontend.
 */
export function mergeVendorWithStatic(
  vendor: VendorRaw,
  fallback: TraiteurSpace | undefined = resolveStaticVendor(vendor),
): TraiteurSpace | null {
  if (isHiddenPublicVendor(vendor) || !vendor.is_public || vendor.status !== 'verified' || !vendor.is_active || vendor.is_demo) {
    return null;
  }

  const businessName = nonEmptyText(vendor.business_name) || nonEmptyText(vendor.name) || fallback?.name || 'Partenaire DeliKreol';
  const description = nonEmptyText(vendor.description) || fallback?.description || fallback?.offer || '';
  const story = nonEmptyText(vendor.story) || fallback?.story || description;
  const promise = nonEmptyText(vendor.promise) || fallback?.promise || '';
  const specialty = nonEmptyText(vendor.specialty) || fallback?.specialty || '';

  const rawZone = nonEmptyText(vendor.zone_label);
  const zone = rawZone && normalizedKey(rawZone) !== 'martinique'
    ? rawZone
    : fallback?.zone || rawZone || 'Martinique';
  const commune = nonEmptyText(vendor.commune) || fallback?.commune || (normalizedKey(zone) !== 'martinique' ? zone : '');
  const address = nonEmptyText(vendor.address) || fallback?.address;

  const supabaseGallery = trustedPublicMediaArray(vendor.gallery_images);
  const supabaseHighlights = nonEmptyArray(vendor.highlights);
  const heroImage = trustedPublicMedia(vendor.hero_image) || fallback?.heroImage || null;
  const portraitImage = trustedPublicMedia(vendor.portrait_image) || fallback?.portraitImage || null;
  const galleryImages = supabaseGallery || fallback?.galleryImages || [];
  const highlights = supabaseHighlights || fallback?.highlights || [];
  const hasSupabaseMedia = Boolean(trustedPublicMedia(vendor.hero_image) || trustedPublicMedia(vendor.portrait_image) || supabaseGallery);
  const socialLinks = sanitizeSocialLinks({
    instagram: vendor.instagram_url || vendor.social_links?.instagram || fallback?.profile.instagram?.url,
    facebook: vendor.facebook_url || vendor.social_links?.facebook || fallback?.profile.facebook?.url,
    website: vendor.website_url || vendor.social_links?.website || fallback?.profile.website?.url,
  });

  const profileFallback = fallback?.profile;
  const profile: PartnerProfile = {
    ...(profileFallback || {}),
    name: fallback?.name || businessName,
    legalName: nonEmptyText(vendor.legal_name) || profileFallback?.legalName,
    zone,
    address: address || profileFallback?.address,
    offer: description || profileFallback?.offer || '',
    type: profileFallback?.type || 'Traiteur',
    availability: profileFallback?.availability || 'À confirmer',
    story: story || profileFallback?.story || '',
    promise: promise || profileFallback?.promise || '',
    eta: profileFallback?.eta || fallback?.turnaround || '30-45 min',
    specialty: specialty || profileFallback?.specialty || '',
    highlights,
    contactPhone: nonEmptyText(vendor.phone) || profileFallback?.contactPhone,
    contactEmail: nonEmptyText(vendor.email) || profileFallback?.contactEmail,
    instagram: socialLinks.instagram
      ? { label: profileFallback?.instagram?.label || 'Instagram', handle: profileFallback?.instagram?.handle, url: socialLinks.instagram }
      : profileFallback?.instagram,
    facebook: socialLinks.facebook
      ? { label: profileFallback?.facebook?.label || 'Facebook', url: socialLinks.facebook }
      : profileFallback?.facebook,
    website: socialLinks.website
      ? { label: profileFallback?.website?.label || 'Site web', url: socialLinks.website }
      : profileFallback?.website,
    planifiable: fallback ? profileFallback?.planifiable ?? false : vendor.planifiable ?? false,
    enterprise: fallback ? profileFallback?.enterprise ?? false : vendor.enterprise ?? false,
  };

  return {
    ...(fallback || {}),
    slug: fallback?.slug || normalizeSpaceSlug(businessName),
    name: fallback?.name || businessName,
    legalName: nonEmptyText(vendor.legal_name) || fallback?.legalName,
    zone,
    commune,
    address,
    offer: description || fallback?.offer || '',
    description,
    story,
    promise,
    availability: fallback?.availability || 'À confirmer',
    specialty,
    heroImage,
    portraitImage,
    gradient: nonEmptyText(vendor.gradient) || fallback?.gradient || 'from-[#f59e0b] via-[#f97316] to-[#dc2626]',
    accent: nonEmptyText(vendor.accent) || fallback?.accent || '#fff7ed',
    highlights,
    startingAt: fallback?.startingAt || 0,
    averageTicket: fallback?.averageTicket || 0,
    turnaround: fallback?.turnaround || profile.eta || '30-45 min',
    galleryImages,
    socialLinks,
    profile,
    menuItems: fallback?.menuItems || [],
    status: fallback?.status || resolveDisplayStatus(vendor),
    photoStatus: hasSupabaseMedia ? resolvePhotoStatus(vendor) : fallback?.photoStatus || resolvePhotoStatus(vendor),
    bioStatus: fallback?.bioStatus || 'confirmée',
    photoCredit: fallback?.photoCredit,
    horaires: fallback?.horaires,
    cutoff_time: fallback?.cutoff_time,
    prep_time: fallback?.prep_time,
    delivery_slots: fallback?.delivery_slots,
    healthTags: fallback?.healthTags,
    deliveryOptions: fallback?.deliveryOptions,
  };
}

function staticPublicVendors(): TraiteurSpace[] {
  return traiteurSpaces.filter((vendor) => vendor.status === 'public confirmé');
}

export async function getPublicVendors(): Promise<{ vendors: TraiteurSpace[]; source: SourceMode }> {
  if (SOURCE_MODE === 'static' || !publicSupabase) {
    return { vendors: staticPublicVendors(), source: 'static' };
  }

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), 2500);

  try {
    const { data, error } = await publicSupabase
      .from('vendors')
      .select('*')
      .eq('is_public', true)
      .eq('is_active', true)
      .eq('is_demo', false)
      .eq('status', 'verified')
      .abortSignal(controller.signal);

    if (error) throw error;

    const rows = (data || []) as VendorRaw[];
    const transformed = rows
      .map((vendor) => mergeVendorWithStatic(vendor))
      .filter((vendor): vendor is TraiteurSpace => vendor !== null);

    if (SOURCE_MODE === 'supabase') {
      return { vendors: transformed, source: 'supabase' };
    }

    const transformedKeys = new Set(transformed.map((vendor) => normalizedKey(vendor.name)));
    const merged = [
      ...transformed,
      ...staticPublicVendors().filter((vendor) => !transformedKeys.has(normalizedKey(vendor.name))),
    ];

    return { vendors: merged, source: 'hybrid' };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[vendorsService] Supabase unavailable, using static fallback', error);
    }
    return { vendors: staticPublicVendors(), source: 'static' };
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

let hydrationPromise: Promise<{ vendors: TraiteurSpace[]; source: SourceMode }> | null = null;

/**
 * Charge une seule fois le catalogue public avant le rendu React, puis remplace
 * le contenu du tableau partagé sans casser les imports historiques.
 */
export function primePublicVendors(): Promise<{ vendors: TraiteurSpace[]; source: SourceMode }> {
  if (!hydrationPromise) {
    hydrationPromise = getPublicVendors().then((result) => {
      if (result.vendors.length > 0) {
        traiteurSpaces.splice(0, traiteurSpaces.length, ...result.vendors);
      }
      return result;
    });
  }

  return hydrationPromise;
}

export async function getVendorBySlug(slug: string): Promise<{ vendor: TraiteurSpace | null; source: SourceMode }> {
  const { vendors, source } = await getPublicVendors();
  const normalizedSlug = normalizeSpaceSlug(slug);
  const vendor = vendors.find((item) => normalizeSpaceSlug(item.slug) === normalizedSlug) || null;
  return { vendor, source };
}

export { SOURCE_MODE };
