import { useState, useMemo } from 'react';
import { Layout } from '../../components/layout/Layout';
import { getMarchesPublics, MarchePublic, SOURCES_OFFICIELLES } from '../../services/marchesPublics';
import { ExternalLink, Calendar, MapPin, Building2, Euro, Clock, Ship, Utensils, Users, Briefcase } from 'lucide-react';

const TYPE_LABELS: Record<string, string> = {
  restauration_collective: '🍽️ Restauration collective',
  livraison_repas: '🚚 Livraison de repas',
  traiteur_evenementiel: '🎉 Traiteur événementiel',
  prestation_alimentaire: '📦 Prestation alimentaire',
};

const STATUT_STYLES: Record<string, string> = {
  ouvert: 'bg-emerald-100 text-emerald-700',
  bientot: 'bg-amber-100 text-amber-700',
  ferme: 'bg-gray-100 text-gray-500',
};

export function MarchesPublicsPage() {
  const [filterType, setFilterType] = useState<string>('tous');
  const [filterStatut, setFilterStatut] = useState<string>('tous');

  const marches = useMemo(() => {
    let result = getMarchesPublics();
    if (filterType !== 'tous') result = result.filter(m => m.type === filterType);
    if (filterStatut !== 'tous') result = result.filter(m => m.statut === filterStatut);
    return result.sort((a, b) => new Date(b.datePublication).getTime() - new Date(a.datePublication).getTime());
  }, [filterType, filterStatut]);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold mb-4 uppercase tracking-wider">
            📋 NOUVEAU
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-3">
            Appels d'offre <span className="text-orange-500">publics</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Marchés publics de restauration collective, livraison de repas et traiteur en Martinique. 
            DELIKREOL aspire les appels d'offre pour vous et vous aide à répondre.
          </p>
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-8">
          <select value={filterType} onChange={e => setFilterType(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-orange-400">
            <option value="tous">Tous les types</option>
            <option value="restauration_collective">Restauration collective</option>
            <option value="livraison_repas">Livraison de repas</option>
            <option value="traiteur_evenementiel">Traiteur événementiel</option>
          </select>
          <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm bg-white outline-none focus:border-orange-400">
            <option value="tous">Tous les statuts</option>
            <option value="ouvert">Ouvert</option>
            <option value="bientot">Bientôt</option>
            <option value="ferme">Fermé</option>
          </select>
          <span className="text-sm text-gray-400 self-center ml-auto">{marches.length} marché{marches.length > 1 ? 's' : ''}</span>
        </div>

        {/* Liste */}
        <div className="space-y-4">
          {marches.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Aucun appel d'offre trouvé pour ces critères.</p>
            </div>
          ) : marches.map(m => (
            <div key={m.id} className="bg-white rounded-2xl border border-gray-100 hover:border-orange-200 shadow-sm hover:shadow-md transition-all p-6">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STATUT_STYLES[m.statut]}`}>
                      {m.statut === 'ouvert' ? '✅ Ouvert' : m.statut === 'bientot' ? '⏳ Bientôt' : '🔒 Fermé'}
                    </span>
                    <span className="text-xs text-gray-400">{TYPE_LABELS[m.type]}</span>
                    <span className="text-xs text-gray-400">{m.source}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{m.titre}</h3>
                  <p className="text-sm text-gray-500 mb-3">{m.objet}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{m.organisme}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{m.commune}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Limite : {new Date(m.dateLimite).toLocaleDateString('fr-FR')}</span>
                    {m.montantEstime && <span className="flex items-center gap-1"><Euro className="w-3 h-3" />{m.montantEstime.toLocaleString('fr-FR')} € est.</span>}
                    {m.dureeMois && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{m.dureeMois} mois</span>}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {m.cpvCodes.map(cpv => <span key={cpv} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">CPV: {cpv}</span>)}
                  </div>
                </div>
                <div className="flex flex-col gap-2 lg:items-end flex-shrink-0">
                  <a href={m.url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all text-sm">
                    Voir l'annonce <ExternalLink className="w-3 h-3" />
                  </a>
                  <button className="text-xs text-orange-600 hover:underline font-semibold">
                    📩 Je suis intéressé — contacter DELIKREOL
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Sources officielles */}
        <section className="mt-12 bg-amber-50/50 rounded-3xl p-8 border border-amber-100">
          <h2 className="text-xl font-black text-gray-900 mb-4">📡 Sources officielles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {SOURCES_OFFICIELLES.map(s => (
              <div key={s.nom} className="bg-white rounded-xl p-4 border border-amber-100">
                <p className="font-bold text-sm text-gray-900 mb-1">{s.nom}</p>
                <p className="text-xs text-gray-500 mb-2">{s.description}</p>
                {s.url && <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-xs text-orange-600 hover:underline font-semibold">Accéder →</a>}
              </div>
            ))}
          </div>
        </section>

        {/* CTA traiteur */}
        <section className="mt-8 text-center bg-gradient-to-br from-orange-500 to-amber-500 rounded-3xl p-10 text-white">
          <h2 className="text-2xl font-black mb-3">Vous êtes traiteur ?</h2>
          <p className="text-orange-100 mb-6 max-w-lg mx-auto">
            DELIKREOL vous aide à répondre aux appels d'offre publics. 
            Nous centralisons les marchés, organisons les livraisons et gérons la logistique.
          </p>
          <a href={`https://wa.me/596696653589?text=${encodeURIComponent('Bonjour, je suis traiteur et je souhaite être informé des appels d\'offre publics.')}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-600 font-bold rounded-2xl hover:scale-105 transition-all shadow-lg">
            💬 Contactez-nous sur WhatsApp
          </a>
        </section>
      </div>
    </Layout>
  );
}