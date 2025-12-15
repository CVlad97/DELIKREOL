import { AlertTriangle, ArrowLeft } from 'lucide-react';

export function LegalMentionsPage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={() => window.history.back()}
          className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-red-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold shadow-lg mb-8"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Retour</span>
        </button>

        <div className="bg-orange-900/20 border-2 border-orange-500 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-orange-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-bold text-orange-400 mb-2">
                À VALIDER PAR UN JURISTE
              </h2>
              <p className="text-slate-300">
                Ce document est un brouillon. Les informations ci-dessous doivent être
                vérifiées et complétées par un professionnel du droit avant mise en production.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-50 mb-8">Mentions Légales</h1>

        <div className="space-y-8 text-slate-300">
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">Éditeur du site</h2>
            <div className="space-y-2">
              <p><strong className="text-slate-200">Raison sociale :</strong> &#x3C;&#x3C;&#x3C;NOM SOCIÉTÉ&#x3E;&#x3E;&#x3E;</p>
              <p><strong className="text-slate-200">Forme juridique :</strong> &#x3C;&#x3C;&#x3C;SARL / SAS / etc.&#x3E;&#x3E;&#x3E;</p>
              <p><strong className="text-slate-200">Capital social :</strong> &#x3C;&#x3C;&#x3C;MONTANT&#x3E;&#x3E;&#x3E; €</p>
              <p><strong className="text-slate-200">SIREN :</strong> &#x3C;&#x3C;&#x3C;XXX XXX XXX&#x3E;&#x3E;&#x3E;</p>
              <p><strong className="text-slate-200">SIRET :</strong> &#x3C;&#x3C;&#x3C;XXX XXX XXX XXXXX&#x3E;&#x3E;&#x3E;</p>
              <p><strong className="text-slate-200">N° TVA intracommunautaire :</strong> &#x3C;&#x3C;&#x3C;FR XX XXXXXXXXX&#x3E;&#x3E;&#x3E;</p>
              <p><strong className="text-slate-200">Adresse du siège social :</strong> &#x3C;&#x3C;&#x3C;ADRESSE COMPLÈTE&#x3E;&#x3E;&#x3E;</p>
              <p><strong className="text-slate-200">Téléphone :</strong> &#x3C;&#x3C;&#x3C;0596 XX XX XX&#x3E;&#x3E;&#x3E;</p>
              <p><strong className="text-slate-200">Email :</strong> contact@delikreol.com</p>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">Directeur de la publication</h2>
            <div className="space-y-2">
              <p><strong className="text-slate-200">Nom :</strong> &#x3C;&#x3C;&#x3C;NOM PRÉNOM&#x3E;&#x3E;&#x3E;</p>
              <p><strong className="text-slate-200">Qualité :</strong> Gérant / Président</p>
              <p><strong className="text-slate-200">Email :</strong> &#x3C;&#x3C;&#x3C;EMAIL&#x3E;&#x3E;&#x3E;</p>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">Hébergeur</h2>
            <div className="space-y-2">
              <p><strong className="text-slate-200">Hébergement de l'application :</strong></p>
              <p>Supabase Inc.</p>
              <p>970 Toa Payoh North, #07-04, Singapore 318992</p>
              <p>Site web : <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">https://supabase.com</a></p>
            </div>
            <div className="mt-4 space-y-2">
              <p><strong className="text-slate-200">Hébergement des paiements :</strong></p>
              <p>Stripe, Inc.</p>
              <p>510 Townsend Street, San Francisco, CA 94103, USA</p>
              <p>Site web : <a href="https://stripe.com" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">https://stripe.com</a></p>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">Contact</h2>
            <div className="space-y-2">
              <p>Pour toute question concernant le site ou son contenu :</p>
              <p><strong className="text-slate-200">Email :</strong> contact@delikreol.com</p>
              <p><strong className="text-slate-200">Téléphone :</strong> &#x3C;&#x3C;&#x3C;0596 XX XX XX&#x3E;&#x3E;&#x3E;</p>
              <p><strong className="text-slate-200">Adresse postale :</strong> &#x3C;&#x3C;&#x3C;ADRESSE COMPLÈTE&#x3E;&#x3E;&#x3E;</p>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">Propriété intellectuelle</h2>
            <p className="mb-4">
              L'ensemble de ce site (structure, textes, logos, images, vidéos, etc.) est la
              propriété exclusive de &#x3C;&#x3C;&#x3C;NOM SOCIÉTÉ&#x3E;&#x3E;&#x3E; ou de ses partenaires.
            </p>
            <p>
              Toute reproduction, représentation, modification, publication, adaptation de tout
              ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, est
              interdite, sauf autorisation écrite préalable.
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">Cookies et données personnelles</h2>
            <p className="mb-4">
              Ce site utilise des cookies techniques nécessaires à son fonctionnement.
            </p>
            <p>
              Pour plus d'informations sur la collecte et le traitement de vos données personnelles,
              consultez notre{' '}
              <a href="/privacy-policy" className="text-emerald-400 hover:underline">
                Politique de confidentialité
              </a>.
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">Médiation de la consommation</h2>
            <p className="mb-4">
              Conformément aux articles L.616-1 et R.616-1 du code de la consommation, nous proposons
              un dispositif de médiation de la consommation.
            </p>
            <p>
              <strong className="text-slate-200">Médiateur :</strong> &#x3C;&#x3C;&#x3C;NOM MÉDIATEUR&#x3E;&#x3E;&#x3E;
            </p>
            <p>
              <strong className="text-slate-200">Site web :</strong> &#x3C;&#x3C;&#x3C;URL&#x3E;&#x3E;&#x3E;
            </p>
          </section>
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
    </div>
  );
}
