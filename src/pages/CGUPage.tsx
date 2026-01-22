import { ArrowLeft } from 'lucide-react';

interface CGUPageProps {
  onBack?: () => void;
}

export function CGUPage({ onBack }: CGUPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-6 font-semibold transition-colors"
            >
              <ArrowLeft size={20} />
              Retour
            </button>
          )}
          <h1 className="text-5xl font-bold mb-4 text-emerald-400">
            Conditions Générales d'Utilisation
          </h1>
          <p className="text-slate-400 text-lg">
            DELIKREOL - Plateforme logistique martiniquaise
          </p>
          <p className="text-slate-500 text-sm mt-2">
            Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-invert max-w-none space-y-8">
          {/* 1. Définitions */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">1. Définitions</h2>
            <div className="space-y-4 text-slate-300">
              <div>
                <strong className="text-slate-100">La Plateforme</strong>
                <p>DELIKREOL, plateforme numérique de mise en relation entre clients, vendeurs (restaurants, producteurs) et prestataires logistiques.</p>
              </div>
              <div>
                <strong className="text-slate-100">Utilisateurs</strong>
                <p>Clients, partenaires vendeurs, points relais, livreurs, administrateurs.</p>
              </div>
              <div>
                <strong className="text-slate-100">Services</strong>
                <p>Consultation de produits, commandes, paiements, livraisons, gestion de relais logistiques.</p>
              </div>
            </div>
          </section>

          {/* 2. Acceptation */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">2. Acceptation des Conditions</h2>
            <p className="text-slate-300">
              En accédant et en utilisant DELIKREOL, vous acceptez sans réserve l'intégralité de ces conditions générales d'utilisation. Si vous n'acceptez pas ces conditions, veuillez cesser l'utilisation de la Plateforme immédiatement.
            </p>
          </section>

          {/* 3. Description des Services */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">3. Description des Services</h2>
            <p className="text-slate-300 mb-4">
              DELIKREOL propose une plateforme de mise en relation permettant aux utilisateurs de :
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
              <li>Consulter des produits locaux (restaurants, producteurs, commerces)</li>
              <li>Passer des commandes</li>
              <li>Organiser la livraison ou le retrait</li>
              <li>Gérer des relais logistiques partagés</li>
              <li>Effectuer des paiements sécurisés</li>
            </ul>
          </section>

          {/* 4. RESPONSABILITÉ - CRITICAL SECTION */}
          <section className="bg-red-900/30 backdrop-blur border-2 border-red-500 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-red-400">4. Responsabilité</h2>
            <div className="bg-red-950/40 rounded-lg p-4 mb-4 border border-red-600">
              <p className="text-red-100 font-semibold leading-relaxed">
                DELIKREOL agit exclusivement en tant que plateforme technique de mise en relation. La responsabilité de la production alimentaire (normes HACCP), de la sécurité sanitaire et de la logistique de livraison incombe exclusivement au partenaire traiteur sélectionné.
              </p>
            </div>
            <p className="text-slate-300">
              DELIKREOL ne contrôle pas la qualité, la salubrité ou la légalité des produits proposés par les partenaires. Chaque vendeur demeure responsable de la conformité de ses produits aux réglementations martiniquaises et françaises en vigueur.
            </p>
          </section>

          {/* 5. Compte Utilisateur */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">5. Compte Utilisateur</h2>
            <p className="text-slate-300 mb-4">
              Pour utiliser DELIKREOL, vous devez créer un compte avec des informations exactes et à jour. Vous êtes responsable de :
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2">
              <li>Maintenir la confidentialité de vos identifiants</li>
              <li>Toute activité effectuée sous votre compte</li>
              <li>Notifier DELIKREOL de tout accès non autorisé</li>
            </ul>
          </section>

          {/* 6. Paiements */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">6. Paiements et Tarification</h2>
            <p className="text-slate-300 mb-4">
              Les prix des produits sont affichés hors TVA. La TVA (taux applicable) est calculée et ajoutée au moment du paiement.
            </p>
            <p className="text-slate-300">
              Les paiements sont traités de manière sécurisée via des tiers de confiance. DELIKREOL ne conserve pas les données de carte bancaire. Votre paiement implique votre acceptation du montant total TTC.
            </p>
          </section>

          {/* 7. Commandes et Annulation */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">7. Commandes et Annulation</h2>
            <p className="text-slate-300 mb-4">
              Toute commande est un contrat entre vous et le vendeur. Une fois confirmée, une commande ne peut être annulée que selon les conditions spécifiées par le vendeur.
            </p>
            <p className="text-slate-300">
              DELIKREOL se réserve le droit de refuser ou d'annuler toute commande jugée inappropriée ou frauduleuse.
            </p>
          </section>

          {/* 8. Propriété Intellectuelle */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">8. Propriété Intellectuelle</h2>
            <p className="text-slate-300">
              Tous les éléments de la Plateforme (logos, textes, graphiques, code) sont la propriété de DELIKREOL ou de ses partenaires. Toute reproduction ou utilisation sans autorisation est interdite.
            </p>
          </section>

          {/* 9. Limitations de Responsabilité */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">9. Limitations de Responsabilité</h2>
            <p className="text-slate-300">
              DELIKREOL ne peut être tenue responsable des :
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-300 ml-2 mt-3">
              <li>Interruptions de service ou défaillances techniques</li>
              <li>Pertes de données ou perte d'accès au compte</li>
              <li>Dommages indirects ou consécutifs</li>
              <li>Contenu fourni par les tiers (vendeurs, livreurs)</li>
            </ul>
          </section>

          {/* 10. Modifications */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">10. Modifications des Conditions</h2>
            <p className="text-slate-300">
              DELIKREOL se réserve le droit de modifier ces conditions à tout moment. Les modifications seront effectif dès leur publication. Votre utilisation continue implique votre acceptation des modifications.
            </p>
          </section>

          {/* 11. Loi Applicable */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">11. Loi Applicable</h2>
            <p className="text-slate-300">
              Ces conditions sont régies par le droit français et la loi de la Collectivité de la Martinique. Tout différend sera soumis aux juridictions compétentes de Martinique.
            </p>
          </section>

          {/* 12. Contact */}
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold mb-4 text-emerald-400">12. Contact</h2>
            <p className="text-slate-300">
              Pour toute question concernant ces conditions, veuillez contacter :
            </p>
            <div className="bg-slate-900/50 rounded-lg p-4 mt-4 border border-slate-700">
              <p className="text-slate-300">
                <strong>DELIKREOL</strong>
                <br />
                Email : support@delikreol.mq
                <br />
                Adresse : Martinique, France
              </p>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-slate-800 text-center text-slate-500 text-sm">
          <p>
            © {new Date().getFullYear()} DELIKREOL - Tous droits réservés
          </p>
        </div>
      </div>
    </div>
  );
}
