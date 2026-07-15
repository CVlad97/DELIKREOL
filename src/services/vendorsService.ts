/**
 * vendorsService.ts — DELIKREOL
 * Service hybride : charge les partenaires depuis Supabase avec fallback statique.
 * Mode : VITE_PUBLIC_VENDOR_SOURCE = 'supabase' | 'static' | 'hybrid'
 */
import { createClient } from '@supabase/supabase-js';
import { traiteurSpaces, type TraiteurSpace } from '../data/traiteurs';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SOURCE_MODE = import.meta.env.VITE_PUBLIC_VENDOR_SOURCE || 'hybrid';

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

export type VendorRecord = {
  id: string;
  name: string;
  business_name: string;
  description: string;
  zone_label: string;
  commune?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  is_public: boolean;
  status: string;
  hero_image?: string;
  portrait_image?: string;
  gallery_images: string[];
  highlights: string[];
  delivery_radius_km: number;
  photo_status: string;
  public_display_status: string;
};

function transformVendorToTraiteurSpace(v: VendorRecord): TraiteurSpace | null {
  if (!v.is_public || v.status !== 'verified') return null;
  return {
    slug: v.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    name: v.business_name || v.name,
    offer: v.description || '',
    zone: v.zone_label || 'Martinique',
    commune: v.commune || v.zone_label || '',
    description: v.description || '',
    story: v.description || '',
    promise: '',
    availability: 'À confirmer',
    specialty: '',
    heroImage: v.hero_image || null,
    portraitImage: v.portrait_image || null,
    gradient: 'from-[#f59e0b] via-[#f97316] to-[#dc2626]',
    accent: '#fff7ed',
    highlights: v.highlights || [],
    startingAt: 0,
    averageTicket: 0,
    turnaround: '30-45 min',
    galleryImages: v.gallery_images || [],
    profile: { name: v.business_name || v.name, type: 'traiteur' } as any,
    menuItems: [],
    status: 'public à vérifier',
    photoStatus: (v.photo_status as TraiteurSpace['photoStatus']) || 'à confirmer',
  };
}

export async function getPublicVendors(): Promise<{ vendors: TraiteurSpace[]; source: string }> {
  // Static mode: return frontend data only
  if (SOURCE_MODE === 'static') {
    return { vendors: traiteurSpaces.filter(t => t.status === 'public confirmé'), source: 'static' };
  }

  // Try Supabase
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('vendors')
        .select('*')
        .eq('is_public', true)
        .eq('status', 'verified');

      if (error) throw error;

      if (data && data.length > 0) {
        const transformed = data
          .map(transformVendorToTraiteurSpace)
          .filter((v): v is TraiteurSpace => v !== null);

        if (SOURCE_MODE === 'supabase') {
          return { vendors: transformed, source: 'supabase' };
        }

        // Hybrid: merge Supabase with static fallback
        const staticVendors = traiteurSpaces.filter(t => t.status === 'public confirmé');
        const supabaseNames = new Set(transformed.map(v => v.name));
        const merged = [...transformed, ...staticVendors.filter(v => !supabaseNames.has(v.name))];

        if (process.env.NODE_ENV === 'development') {
          console.log('[vendorsService] Supabase vendors:', transformed.length);
          console.log('[vendorsService] Static fallback used for:', staticVendors.filter(v => !supabaseNames.has(v.name)).map(v => v.name));
        }

        return { vendors: merged, source: 'hybrid' };
      }
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[vendorsService] Supabase unavailable, using static fallback:', err);
      }
    }
  }

  // Fallback to static
  return { vendors: traiteurSpaces.filter(t => t.status === 'public confirmé'), source: 'static' };
}

export async function getVendorBySlug(slug: string): Promise<{ vendor: TraiteurSpace | null; source: string }> {
  const { vendors, source } = await getPublicVendors();
  const vendor = vendors.find(v => v.slug === slug) || null;
  return { vendor, source };
}

export { SOURCE_MODE };