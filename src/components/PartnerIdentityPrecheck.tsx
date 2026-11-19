import { useState } from 'react';
import { lookupPartnerSiret } from '../services/partnerPrevalidation';

/** Advisory public registry lookup; never grants partner access or publication. */
export function PartnerIdentityPrecheck() {
  const [siret, setSiret] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof lookupPartnerSiret>> | null>(null);
  return <section className="rounded-2xl border border-amber-300 bg-white p-5 space-y-3" aria-label="Prévalidation entreprise">
    <h2 className="text-xl font-bold">Identifier mon entreprise</h2>
    <p className="text-sm">Vérifiez les données publiques de votre établissement. Cette étape ne valide ni le RIB, ni les documents d’hygiène, ni les licences.</p>
    <form onSubmit={async e => { e.preventDefault(); setBusy(true); try { setResult(await lookupPartnerSiret(siret)); } finally { setBusy(false); } }} className="flex flex-wrap gap-2">
      <input aria-label="SIRET de 14 chiffres" inputMode="numeric" autoComplete="off" placeholder="SIRET (14 chiffres)" value={siret} onChange={e=>{setSiret(e.target.value);setResult(null);}} className="min-w-48 flex-1 rounded-lg border p-3" maxLength={20} required />
      <button type="submit" disabled={busy} className="rounded-lg bg-[#5c2819] px-5 py-3 font-bold text-white disabled:opacity-50">{busy ? 'Vérification…' : 'Vérifier le SIRET'}</button>
    </form>
    {result && <div role="status" className="rounded-lg bg-amber-50 p-3 text-sm">
      {result.identity === 'matched' ? `Entreprise trouvée : ${result.companyName || 'identité publique concordante'}.` : result.identity === 'invalid_siret' ? 'SIRET invalide : vérifiez les 14 chiffres.' : result.identity === 'unavailable' ? 'Registre indisponible : réessayez plus tard.' : 'Établissement non confirmé : vérification manuelle nécessaire.'}
      <p className="mt-2 font-semibold">Statut : précontrôle uniquement. RIB, assurance, hygiène et licences applicables : validation humaine obligatoire.</p>
    </div>}
  </section>;
}
