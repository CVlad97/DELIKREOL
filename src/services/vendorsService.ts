/**
 * vendorsService.ts — DELIKREOL
 * Service hybride : charge les partenaires depuis Supabase avec fallback statique.
 * Mode : VITE_PUBLIC_VENDOR_SOURCE = 'supabase' | 'static' | 'hybrid'
 */
import type { TraiteurSpace } from '../data/traiteurs';
import type { PartnerProfile } from '../data/partnerProfiles';
import { traiteurSpaces } from '../data/traiteurs';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SOURCE_MODE: string = import.meta.env.VITE_PUBLIC_VENDOR_SOURCE || 'hybrid';

type VendorRaw = {
  id: string;
  name: string;
  business_name: string | null;
  description: string | null;
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
  gallery_images: string[];
  highlights: string[];
  delivery_radius_km: number;
  photo_status: string;
  public_display_status: string;
  story: string | null;
  promise: string | null;
  specialty: string | null;
  gradient: string | null;
  accent: string | null;
  legal_name: string | null;
  siret: string | null;
};

function transformVendorToTraiteurSpace(v: VendorRaw): TraiteurSpace | null {
  if (!v.is_public || v.status !== 'verified' || !v.is_active || v.is_demo) {
    return null;
  }

  const photoStatus = v.photo_status === 'confirmée' || v.photo_status === 'à confirmer' || v.photo_status === 'externe à vérifier'
    ? v.photo_status as TraiteurSpace['photoStatus']
    : 'à confirmer';

  const displayStatus = v.public_display_status === 'public confirmé' || v.public_display_status === 'public à vérifier' || v.public_display_status === 'brouillon'
    ? v.public_display_status as TraiteurSpace['status']
    : 'public à vérifier';

  return {
    slug: v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name: v.business_name || v.name,
    legalName: v.legal_name || undefined,
    offer: v.description || '',
    zone: v.zone_label || 'Martinique',
    commune: v.commune || v.zone_label || '',
    description: v.description || '',
    story: v.story || v.description || '',
    promise: v.promise || '',
    availability: 'À confirmer',
    specialty: v.specialty || '',
    heroImage: v.hero_image || null,
    portraitImage: v.portrait_image || null,
    gradient: v.gradient || 'from-[#f59e0b] via-[#f97316] to-[#dc2626]',
    accent: v.accent || '#fff7ed',
    highlights: v.highlights || [],
    startingAt: 0,
    averageTicket: 0,
    turnaround: '30-45 min',
    galleryImages: v.gallery_images || [],
    profile: {
      name: v.business_name || v.name,
      type: 'traiteur',
      zone: v.zone_label || 'Martinique',
      offer: v.description || '',
      availability: 'À confirmer',
      story: v.story || v.description || '',
      promise: v.promise || '',
      eta: '30-45 min',
      specialty: v.specialty || '',
      highlights: v.highlights || [],
      planifiable: false,
      enterprise: false,
    },
    menuItems: [],
    status: displayStatus,
    photoStatus: photoStatus,
  };
}

export async function getPublicVendors(): Promise<{ vendors: TraiteurSpace[]; source: string }> {
  if (SOURCE_MODE === 'static') {
    const featured = traiteurSpaces.filter(t => t.status === 'public confirmé');
    return { vendors: featured, source: 'static' };
  }

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true)
        .eq('is_demo', false)
        .eq('status', 'verified');

      if (error) throw error;

      if (data && data.length > 0) {
        const transformed = data
          .map(transformVendorToTraiteurSpace)
          .filter((v): v is TraiteurSpace => v !== null);

        if (SOURCE_MODE === 'supabase') {
          return { vendors: transformed, source: 'supabase' };
        }

        // Hybrid: merge Supabase with static fallback (no duplicates)
        const staticVendors = traiteurSpaces.filter(t => t.status === 'public confirmé');
        const supabaseNames = new Set(transformed.map(v => v.name.toLowerCase()));
        const merged = [
          ...transformed,
          ...staticVendors.filter(v => !supabaseNames.has(v.name.toLowerCase())),
        ];

        return { vendors: merged, source: 'hybrid' };
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.warn('[vendorsService] Supabase unavailable, using static fallback');
      }
    }
  }

  // Fallback: static data
  const featured = traiteurSpaces.filter(t => t.status === 'public confirmé');
  return { vendors: featured, source: 'static' };
}

export async function getVendorBySlug(slug: string): Promise<{ vendor: TraiteurSpace | null; source: string }> {
  const { vendors, source } = await getPublicVendors();
  const vendor = vendors.find(v => v.slug === slug) || null;
  return { vendor, source };
}

export { SOURCE_MODE };