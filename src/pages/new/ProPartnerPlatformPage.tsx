import { useState } from 'react';
import { Layout } from '../../components/layout/Layout';
import { validatePartnerSiret } from '../../services/dataGouv';

const WHATSAPP_NUMBER = '596696653589';
const MARTINIQUE_DEP = '972';

const PLATEFORMES = [
  { name: 'Martinique Coursier', type: 'Coursier', area: 'Toute la Martinique', app: 'Site web', integration: 'Partenaire potentiel' },
  { name: 'Coursiers Antilles', type: 'Coursier', area: 'FDF, Schœlcher, Lamentin', app: 'Site web', integration: 'Partenaire potentiel' },
  { name: 'Kréyol Delivery', type: 'Plateforme livraison', area: 'Martinique', app: 'Kréyol Delivery', integration: 'Partenariat possible' },
  { name: 'Allo Coursier Martinique', type: 'Coursier', area: 'Fort-de-France', app: 'Téléphone', integration: 'À contacter' },
  { name: 'Groupe Facebook Livreurs 972', type: 'Réseau livreurs', area: 'Toute la Martinique', app: 'Facebook', integration: 'Recrutement direct' },
  { name: 'Livreurs indépendants (WhatsApp)', type: 'Réseau informel', area: 'Martinique', app: 'WhatsApp', integration: 'Manuel' },
];

const HACCP_INFOS = [
  { label: 'Obligation légale', value: 'Oui — formation HACCP obligatoire pour tout commerce alimentaire (Code rural L.233-4)' },
  { label: 'Organisme agréé', value: 'CCI Martinique, CMA Martinique, AFTRAL, CNFDI, IFOCOP' },
  { label: 'Prix formation', value: '200–500 € selon organisme, finançable via CPF' },
  { label: 'Validité', value: 'Illimitée (recommandation : mise à jour tous les 5 ans)' },
  { label: 'Documents requis', value: 'Attestation HACCP, justificatif SIRET/SIREN, extrait KBIS < 3 mois' },
  { label: 'Assurance', value: 'RC Pro obligatoire (Responsabilité Civile Professionnelle)' },
];

export function ProPartnerPlatformPage() {
  const [siret, setSiret] = useState('');
  const [siretResult, setSiretResult] = useState<{ valid: boolean; name?: string; commune?: string } | null>(null);
  const [siretLoading, setSiretLoading] = useState(false);

  const verifySiret = async () => {
    if (siret.length !== 14) return;
    setSiretLoading(true);
    const r = await validatePartnerSiret(siret);
    setSiretResult(r);
    setSiretLoading(false);
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">

        {/* HERO */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Partenariat <span className="text-orange-500">plateforme livreurs</span>
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            DELIKREOL s'associe aux plateformes de livraison, coursiers indépendants 
            et professionnels certifiés HACCP en Martinique pour offrir un service fiable.
          </p>
        </div>

        {/* PLATEFORMES LIVREURS */}
        <section>
          <h2 className="text-2xl font-black text-gray-900 mb-6">📦 Plateformes livreurs en Martinique</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-orange-50 text-left">
                  <th className="p-3 font-semibold">Plateforme</th>
                  <th className="p-3 font-semibold">Type</th>
                  <th className="p-3 font-semibold">Zone</th>
                  <th className="p-3 font-semibold">Application</th>
                  <th className="p-3 font-semibold">Intégration DELIKREOL</th>
                </tr>
              </thead>
              <tbody>
                {PLATEFORMES.map((p, i) => (
                  <tr key={i} className="border-t border-gray-50 hover:bg-orange-50/30">
                    <td className="p-3 font-medium">{p.name}</td>
                    <td className="p-3 text-gray-600">{p.type}</td>
                    <td className="p-3 text-gray-600">{p.area}</td>
                    <td className="p-3 text-gray-600">{p.app}</td>
                    <td className="p-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                        p.integration.includes('30%') ? 'bg-red-100 text-red-700' :
                        p.integration === 'API disponible' ? 'bg-emerald-100 text-emerald-700' :
                        p.integration === 'Partenaire direct possible' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {p.integration}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            DELIKREOL privilégie les partenaires locaux et les livreurs indépendants pour garder une commission basse (15%).
          </p>
        </section>

        {/* HACCP */}
        <section className="bg-amber-50/50 rounded-3xl p-8 border border-amber-100">
          <h2 className="text-2xl font-black text-gray-900 mb-2">🛡️ Licence HACCP — Obligation légale</h2>
          <p className="text-sm text-gray-500 mb-6">
            Tout partenaire DELIKREOL manipulant des aliments doit être en règle avec la réglementation française.
          </p>
          <div className="grid md:grid-cols-2 gap-4">
            {HACCP_INFOS.map((info, i) => (
              <div key={i} className="bg-white rounded-xl p-4 border border-amber-100">
                <p className="text-xs text-orange-600 font-semibold uppercase tracking-wider mb-1">{info.label}</p>
                <p className="text-sm text-gray-800">{info.value}</p>
              </div>
            ))}
          </div>
        </section>

        {/* VÉRIFICATEUR SIRET */}
        <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <h2 className="text-2xl font-black text-gray-900 mb-2">🔍 Vérifier un partenaire (SIRET)</h2>
          <p className="text-sm text-gray-500 mb-6">
            Validez un SIRET de partenaire, livreur ou point relais via l'API Entreprise data.gouv.fr.
          </p>
          <div className="flex gap-3 max-w-md">
            <input
              value={siret}
              onChange={e => { setSiret(e.target.value); setSiretResult(null); }}
              placeholder="SIRET (14 chiffres)"
              maxLength={14}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-orange-400"
            />
            <button onClick={verifySiret} disabled={siret.length !== 14 || siretLoading}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all text-sm disabled:opacity-50">
              {siretLoading ? '...' : 'Vérifier'}
            </button>
          </div>
          {siretResult && (
            <div className={`mt-4 p-4 rounded-xl ${siretResult.valid ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
              <p className="text-sm font-semibold">{siretResult.valid ? '✅ SIRET valide' : '❌ SIRET non trouvé ou inactif'}</p>
              {siretResult.name && <p className="text-xs text-gray-600 mt-1">{siretResult.name}</p>}
              {siretResult.commune && <p className="text-xs text-gray-500">{siretResult.commune}</p>}
            </div>
          )}
        </section>

        {/* CTA CONTACT */}
        <section className="text-center bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-10 text-white">
          <h2 className="text-3xl font-black mb-3">Vous êtes plateforme ou livreur ?</h2>
          <p className="text-orange-100 mb-6 max-w-lg mx-auto">
            Intégrez DELIKREOL comme partenaire livraison. Commission 15%, zone Martinique, 
            coordination humaine et support WhatsApp.
          </p>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, je suis livreur/plateforme et je souhaite devenir partenaire DELIKREOL.')}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:scale-105 transition-all shadow-lg"
          >
            💬 Contactez-nous sur WhatsApp
          </a>
        </section>
      </div>
    </Layout>
  );
}