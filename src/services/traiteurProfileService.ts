import { publicSupabase, isPublicSupabaseConfigured } from '../lib/publicSupabase';
import { partnerProfiles, type PartnerProfile } from '../data/partnerProfiles';

type PublicVendorRow = {
  id: string;
  business_name?: string | null;
  name?: string | null;
  description?: string | null;
  address?: string | null;
  phone?: string | null;
  zone_label?: string | null;
  service_zone?: string | null;
  business_type?: string | null;
  status?: string | null;
  is_public?: boolean | string | null;
  is_demo?: boolean | string | null;
  is_active?: boolean | string | null;
  created_at?: string | null;
};

type PublicTraiteurProfile = PartnerProfile & {
  source: 'local' | 'backend';
};

const normalize = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ');

const truthy = (value: unknown) => value === true || String(value ?? '').toLowerCase() === 'true';

function vendorLooksPublic(row: PublicVendorRow) {
  return truthy(row.is_public) && !truthy(row.is_demo) && row.is_active !== false && String(row.status ?? '').toLowerCase() !== 'draft';
}

function matchProfile(profile: PartnerProfile, row: PublicVendorRow) {
  const profileName = normalize(profile.name);
  const vendorName = normalize(row.business_name ?? row.name ?? '');
  return (
    profileName === vendorName ||
    vendorName.includes(profileName) ||
    profileName.includes(vendorName)
  );
}

function mergeProfile(profile: PartnerProfile, row?: PublicVendorRow): PublicTraiteurProfile {
  if (!row) {
    return { ...profile, source: 'local' };
  }

  const legalName = row.business_name ?? row.name ?? profile.legalName;
  const address = row.address ?? row.zone_label ?? row.service_zone ?? profile.address ?? profile.zone;
  const story = row.description ?? profile.story;
  const phone = row.phone ?? profile.contactPhone;

  return {
    ...profile,
    legalName: legalName ?? profile.legalName,
    address: address ?? profile.address,
    zone: row.zone_label ?? row.service_zone ?? profile.zone,
    story,
    contactPhone: phone ?? profile.contactPhone,
    source: 'backend',
  };
}

export async function loadTraiteurProfiles() {
  if (!isPublicSupabaseConfigured || !publicSupabase) {
    return partnerProfiles.map((profile) => ({ ...profile, source: 'local' as const }));
  }

  try {
    const { data, error } = await publicSupabase
      .from('vendors')
      .select('id,business_name,name,description,address,phone,zone_label,service_zone,business_type,status,is_public,is_demo,is_active,created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const rows = ((data ?? []) as PublicVendorRow[]).filter(vendorLooksPublic);

    return partnerProfiles.map((profile) => {
      const remote = rows.find((row) => matchProfile(profile, row));
      return mergeProfile(profile, remote);
    });
  } catch {
    return partnerProfiles.map((profile) => ({ ...profile, source: 'local' as const }));
  }
}

export function buildTraiteurConversationContext() {
  const lines = partnerProfiles
    .filter((profile) => profile.type.toLowerCase() === 'traiteur')
    .map((profile) => {
      const bits = [
        `Nom public: ${profile.name}`,
        profile.legalName ? `Nom légal: ${profile.legalName}` : null,
        profile.address ? `Adresse: ${profile.address}` : null,
        `Zone: ${profile.zone}`,
        profile.contactPhone ? `Téléphone: ${profile.contactPhone}` : null,
        `Offre: ${profile.offer}`,
        `Disponibilité: ${profile.availability}`,
        `Bio: ${profile.story}`,
      ].filter(Boolean);

      return `- ${bits.join(' | ')}`;
    });

  return lines.length ? lines.join('\n') : '- Aucun traiteur disponible.';
}
