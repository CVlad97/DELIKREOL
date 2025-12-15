import { AlertTriangle, ArrowLeft } from 'lucide-react';

export function PrivacyPolicyPage() {
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
                Ce document est un brouillon conforme aux principes du RGPD. Il doit être
                vérifié et adapté par un avocat spécialisé en protection des données avant mise en production.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-50 mb-8">Politique de Confidentialité</h1>

        <div className="space-y-8 text-slate-300">
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">1. Responsable du traitement</h2>
            <p className="mb-4">
              Le responsable du traitement des données personnelles est :
            </p>
            <p><strong className="text-slate-200">&#x3C;&#x3C;&#x3C;NOM SOCIÉTÉ&#x3E;&#x3E;&#x3E;</strong></p>
            <p>SIREN : &#x3C;&#x3C;&#x3C;XXX XXX XXX&#x3E;&#x3E;&#x3E;</p>
            <p>Adresse : &#x3C;&#x3C;&#x3C;ADRESSE&#x3E;&#x3E;&#x3E;</p>
            <p>Email : dpo@delikreol.com</p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">2. Données collectées</h2>
            <p className="mb-4">
              Nous collectons les données suivantes selon votre profil :
            </p>

            <div className="space-y-4">
              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 mb-2">Clients :</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Nom, prénom</li>
                  <li>Adresse email</li>
                  <li>Numéro de téléphone</li>
                  <li>Adresse de livraison</li>
                  <li>Historique de commandes</li>
                  <li>Données de paiement (traitées par Stripe)</li>
                </ul>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 mb-2">Partenaires (restaurants, producteurs, relais, livreurs) :</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Informations d'identification (nom, prénom, raison sociale)</li>
                  <li>Coordonnées (email, téléphone, adresse)</li>
                  <li>SIREN / SIRET</li>
                  <li>Documents administratifs (Kbis, assurance, agréments)</li>
                  <li>Catalogues de produits et matrices tarifaires</li>
                  <li>Données bancaires (IBAN pour les paiements)</li>
                  <li>Historique d'activité sur la plateforme</li>
                </ul>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 mb-2">Données techniques :</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Adresse IP</li>
                  <li>Type de navigateur</li>
                  <li>Pages consultées</li>
                  <li>Géolocalisation approximative (si autorisée)</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">3. Finalités du traitement</h2>
            <p className="mb-4">Vos données sont collectées pour :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Gérer les commandes et livraisons</li>
              <li>Faciliter la communication entre clients et partenaires</li>
              <li>Traiter les paiements (via Stripe)</li>
              <li>Vérifier l'éligibilité des partenaires (documents administratifs)</li>
              <li>Améliorer nos services et la plateforme</li>
              <li>Respecter nos obligations légales et réglementaires</li>
              <li>Gérer les litiges et réclamations</li>
            </ul>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">4. Base légale</h2>
            <p className="mb-4">Le traitement de vos données repose sur :</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-slate-200">Contrat :</strong> Exécution du service DELIKREOL</li>
              <li><strong className="text-slate-200">Consentement :</strong> Géolocalisation, newsletters</li>
              <li><strong className="text-slate-200">Obligation légale :</strong> Conservation des factures, lutte anti-fraude</li>
              <li><strong className="text-slate-200">Intérêt légitime :</strong> Amélioration des services, sécurité</li>
            </ul>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">5. Destinataires des données</h2>
            <p className="mb-4">Vos données peuvent être partagées avec :</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-slate-200">Personnel autorisé</strong> de DELIKREOL</li>
              <li><strong className="text-slate-200">Partenaires impliqués</strong> dans votre commande (restaurant, relais, livreur)</li>
              <li><strong className="text-slate-200">Sous-traitants techniques :</strong>
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1 text-sm">
                  <li>Supabase (hébergement base de données)</li>
                  <li>Stripe (paiements en ligne)</li>
                  <li>Services de communication (email, SMS)</li>
                </ul>
              </li>
              <li><strong className="text-slate-200">Autorités légales</strong> sur demande judiciaire</li>
            </ul>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">6. Durée de conservation</h2>
            <div className="space-y-3">
              <p><strong className="text-slate-200">Données clients :</strong> 3 ans après la dernière commande</p>
              <p><strong className="text-slate-200">Données partenaires :</strong> Durée de la relation contractuelle + 5 ans</p>
              <p><strong className="text-slate-200">Documents administratifs :</strong> 10 ans (obligations légales)</p>
              <p><strong className="text-slate-200">Factures :</strong> 10 ans (obligations comptables)</p>
              <p><strong className="text-slate-200">Logs techniques :</strong> 12 mois</p>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">7. Vos droits (RGPD)</h2>
            <p className="mb-4">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-2">
              <li><strong className="text-slate-200">Droit d'accès :</strong> Obtenir une copie de vos données</li>
              <li><strong className="text-slate-200">Droit de rectification :</strong> Corriger des données inexactes</li>
              <li><strong className="text-slate-200">Droit à l'effacement :</strong> Supprimer vos données (sous conditions)</li>
              <li><strong className="text-slate-200">Droit à la limitation :</strong> Limiter le traitement</li>
              <li><strong className="text-slate-200">Droit à la portabilité :</strong> Récupérer vos données dans un format standard</li>
              <li><strong className="text-slate-200">Droit d'opposition :</strong> S'opposer à certains traitements</li>
              <li><strong className="text-slate-200">Droit de retirer votre consentement</strong> à tout moment</li>
            </ul>
            <p className="mt-4">
              Pour exercer vos droits, contactez-nous à : <strong className="text-emerald-400">dpo@delikreol.com</strong>
            </p>
            <p className="mt-2 text-sm">
              Vous disposez également du droit d'introduire une réclamation auprès de la CNIL
              (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">www.cnil.fr</a>).
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">8. Sécurité des données</h2>
            <p className="mb-4">
              Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour
              protéger vos données contre :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Accès non autorisés</li>
              <li>Altération ou destruction</li>
              <li>Perte accidentelle</li>
              <li>Divulgation non autorisée</li>
            </ul>
            <p className="mt-4">
              Nos sous-traitants (Supabase, Stripe) sont conformes aux standards de sécurité internationaux.
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">9. Transferts hors UE</h2>
            <p className="mb-4">
              Certaines données peuvent être transférées vers des pays hors Union Européenne,
              notamment vers les États-Unis (Supabase, Stripe).
            </p>
            <p>
              Ces transferts sont encadrés par les clauses contractuelles types de la Commission Européenne
              et respectent le RGPD.
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">10. Cookies</h2>
            <p className="mb-4">
              Nous utilisons des cookies techniques strictement nécessaires au fonctionnement du site.
            </p>
            <p>
              Vous pouvez paramétrer votre navigateur pour refuser les cookies, mais cela peut
              affecter certaines fonctionnalités.
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">11. Modifications</h2>
            <p>
              Nous nous réservons le droit de modifier cette politique de confidentialité à tout moment.
              Les modifications prendront effet dès leur publication sur cette page.
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
