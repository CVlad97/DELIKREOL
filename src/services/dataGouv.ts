// DELIKREOL — Intégration data.gouv.fr
// APIs publiques françaises pour valider communes, adresses et entreprises

const API_BASE = 'https://geo.api.gouv.fr';
const ADRESSE_BASE = 'https://api-adresse.data.gouv.fr';
const ENTREPRISE_BASE = 'https://recherche-entreprises.api.gouv.fr';

// ─── CACHE ───────────────────────────────────────────────────
const cache = new Map<string, { data: any; ts: number }>();
const CACHE_TTL = 3600 * 1000; // 1h

async function cachedFetch<T>(key: string, url: string): Promise<T | null> {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data as T;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    cache.set(key, { data, ts: Date.now() });
    return data as T;
  } catch {
    return null;
  }
}

// ─── 1. COMMUNES DE MARTINIQUE ──────────────────────────────
interface Commune {
  code: string;
  nom: string;
  codesPostaux: string[];
  centre: { coordinates: [number, number]; type: string };
}

export async function searchCommunes(query: string): Promise<Commune[]> {
  const data = await cachedFetch<Commune[]>(
    `communes:${query}`,
    `${API_BASE}/communes?nom=${encodeURIComponent(query)}&boost=population&limit=10`
  );
  return data || [];
}

export async function getCommuneByCodePostal(cp: string): Promise<Commune | null> {
  const list = await cachedFetch<Commune[]>(
    `cp:${cp}`,
    `${API_BASE}/communes?codePostal=${cp}&limit=1`
  );
  return list?.[0] || null;
}

export async function getCommunesByDepartement(dep: string = '972'): Promise<Commune[]> {
  const data = await cachedFetch<Commune[]>(
    `dep:${dep}`,
    `${API_BASE}/communes?codeDepartement=${dep}&fields=nom,codesPostaux,centre,surface&format=json&limit=50`
  );
  return data || [];
}

// ─── 2. ADRESSE (Base Adresse Nationale) ─────────────────────
interface AdresseFeature {
  properties: {
    label: string;
    score: number;
    housenumber: string;
    street: string;
    postcode: string;
    city: string;
    context: string;
  };
  geometry: { coordinates: [number, number]; type: string };
}

export async function searchAddress(query: string): Promise<AdresseFeature[]> {
  const data = await cachedFetch<{ features: AdresseFeature[] }>(
    `addr:${query}`,
    `${ADRESSE_BASE}/search/?q=${encodeURIComponent(query)}&limit=5&autocomplete=1`
  );
  return data?.features || [];
}

export async function reverseGeocode(lat: number, lng: number): Promise<AdresseFeature | null> {
  const data = await cachedFetch<{ features: AdresseFeature[] }>(
    `rev:${lat},${lng}`,
    `${ADRESSE_BASE}/reverse/?lon=${lng}&lat=${lat}`
  );
  return data?.features?.[0] || null;
}

// ─── 3. ENTREPRISE (SIRET/SIREN) ────────────────────────────
interface EntrepriseResult {
  siren: string;
  nom_complet: string;
  nature_juridique: string;
  code_postal: string;
  commune: string;
  etat_administratif: string;
  date_creation: string;
  activite_principale: string;
}

export async function searchEntreprise(query: string): Promise<EntrepriseResult[]> {
  const data = await cachedFetch<{ results: EntrepriseResult[] }>(
    `ent:${query}`,
    `${ENTREPRISE_BASE}/search?q=${encodeURIComponent(query)}&limite=5&page=1`
  );
  return data?.results || [];
}

export async function getEntrepriseBySiret(siret: string): Promise<EntrepriseResult | null> {
  try {
    const res = await fetch(`https://data.rapport-entreprise.urssaf.fr/api/v1/entreprises?siret=${siret}`, {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data || null;
  } catch {
    return null;
  }
}

// ─── 4. VALIDATEUR INTÉGRÉ POUR DELIKREOL ───────────────────
export interface ValidationResult {
  valid: boolean;
  commune?: string;
  codePostal?: string;
  coordinates?: [number, number];
  source: 'data.gouv' | 'fallback' | 'invalid';
}

export async function validateDeliveryAddress(commune: string, address?: string): Promise<ValidationResult> {
  // 1. Try geo.api.gouv.fr for commune info
  const communes = await searchCommunes(commune);
  if (communes.length > 0) {
    const c = communes.find(c => c.nom.toLowerCase() === commune.toLowerCase()) || communes[0];
    const coords = c.centre?.coordinates;
    return {
      valid: true,
      commune: c.nom,
      codePostal: c.codesPostaux?.[0],
      coordinates: coords as [number, number] | undefined,
      source: 'data.gouv',
    };
  }

  // 2. Try address search if address provided
  if (address) {
    const features = await searchAddress(`${address} ${commune}`);
    if (features.length > 0 && features[0].properties.score > 0.5) {
      const f = features[0].properties;
      return {
        valid: true,
        commune: f.city,
        codePostal: f.postcode,
        coordinates: features[0].geometry.coordinates as [number, number],
        source: 'data.gouv',
      };
    }
  }

  return { valid: false, source: 'invalid' };
}

export async function validatePartnerSiret(siret: string): Promise<{ valid: boolean; name?: string; commune?: string }> {
  if (!siret || siret.length !== 14) return { valid: false };
  const ent = await getEntrepriseBySiret(siret);
  if (!ent) return { valid: false };
  return {
    valid: ent.etat_administratif === 'actif',
    name: ent.nom_complet,
    commune: ent.commune,
  };
}

// ─── EXPORT POUR UTILISATION ────────────────────────────────
export const DATA_GOUV = {
  searchCommunes,
  getCommuneByCodePostal,
  getCommunesByDepartement,
  searchAddress,
  reverseGeocode,
  searchEntreprise,
  validateDeliveryAddress,
  validatePartnerSiret,
};