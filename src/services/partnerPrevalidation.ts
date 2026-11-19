/** Public-company checks never constitute regulatory or banking approval. */
export type PublicEnterprise = { siren?: string; nom_complet?: string; etat_administratif?: string; siege?: { siret?: string }; matching_etablissements?: Array<{siret?:string}> };
export function normalizeSiret(value: string): string | null {
  const digits = value.replace(/\s/g, '');
  if (!/^\d{14}$/.test(digits)) return null;
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    let n = Number(digits[i]);
    if (i % 2 === 0) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0 ? digits : null;
}
export function prevalidatePartnerIdentity(siret: string, enterprises: PublicEnterprise[]) {
  const normalized = normalizeSiret(siret);
  const match = normalized ? enterprises.find(e => e.siren === normalized.slice(0,9) && (e.siege?.siret === normalized || e.matching_etablissements?.some(x=>x.siret === normalized)) && e.etat_administratif === 'A') : undefined;
  return { identity: match ? 'matched' as const : 'review_required' as const, companyName: match?.nom_complet ?? null, bank: 'human_review' as const, regulatory: 'human_review' as const, approved: false as const };
}
export async function lookupPartnerSiret(siret: string) {
  const normalized = normalizeSiret(siret);
  if (!normalized) return { identity: 'invalid_siret' as const, bank: 'human_review' as const, regulatory: 'human_review' as const, approved: false as const, companyName: null };
  try {
    const res = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${encodeURIComponent(normalized)}&limite=5`);
    if (!res.ok) throw new Error('Service officiel indisponible');
    const json = await res.json() as {results?: PublicEnterprise[]};
    return prevalidatePartnerIdentity(normalized, json.results ?? []);
  } catch {
    return { identity: 'unavailable' as const, bank: 'human_review' as const, regulatory: 'human_review' as const, approved: false as const, companyName: null };
  }
}
