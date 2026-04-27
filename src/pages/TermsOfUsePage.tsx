import { AlertTriangle, ArrowLeft } from 'lucide-react';

export function TermsOfUsePage() {
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
                Ce document est un brouillon. Il doit être vérifié, complété et adapté
                par un avocat spécialisé avant mise en production.
              </p>
            </div>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-slate-50 mb-8">
          Conditions Générales d'Utilisation et de Service
        </h1>

        <div className="space-y-8 text-slate-300">
          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">1. Objet</h2>
            <p className="mb-4">
              Les présentes Conditions Générales d'Utilisation (CGU) et de Service (CGS) régissent
              l'utilisation de la plateforme DELIKREOL, accessible à l'adresse &#x3C;&#x3C;&#x3C;URL&#x3E;&#x3E;&#x3E;.
            </p>
            <p>
              DELIKREOL est une plateforme d'intermédiation qui met en relation :
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Des <strong className="text-slate-200">clients</strong> souhaitant commander des produits alimentaires</li>
              <li>Des <strong className="text-slate-200">partenaires</strong> (restaurants, producteurs, points relais, livreurs)</li>
            </ul>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">2. Définitions</h2>
            <div className="space-y-3">
              <p><strong className="text-slate-200">Plateforme :</strong> Le site web et l'application DELIKREOL</p>
              <p><strong className="text-slate-200">Opérateur :</strong> &#x3C;&#x3C;&#x3C;NOM SOCIÉTÉ&#x3E;&#x3E;&#x3E;, éditeur de la plateforme</p>
              <p><strong className="text-slate-200">Client :</strong> Toute personne physique ou morale passant commande</p>
              <p><strong className="text-slate-200">Partenaire :</strong> Restaurant, producteur, point relais ou livreur référencé</p>
              <p><strong className="text-slate-200">Demande :</strong> Requête formulée par un client via le service de conciergerie</p>
              <p><strong className="text-slate-200">Commande :</strong> Achat validé et payé par le client</p>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">3. Acceptation des CGU/CGS</h2>
            <p className="mb-4">
              L'utilisation de la plateforme implique l'acceptation pleine et entière des présentes CGU/CGS.
            </p>
            <p>
              En créant un compte ou en passant commande, vous reconnaissez avoir pris connaissance
              de ces conditions et les accepter sans réserve.
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">4. Rôle de DELIKREOL (Plateforme d'intermédiation)</h2>
            <p className="mb-4">
              DELIKREOL agit en qualité d'<strong className="text-slate-200">intermédiaire</strong> et de
              <strong className="text-slate-200"> facilitateur</strong> entre clients et partenaires.
            </p>

            <div className="space-y-4">
              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 mb-2">DELIKREOL s'engage à :</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Mettre à disposition une plateforme fonctionnelle et sécurisée</li>
                  <li>Faciliter la communication entre clients et partenaires</li>
                  <li>Vérifier l'éligibilité des partenaires (documents administratifs)</li>
                  <li>Coordonner la logistique (stockage, livraison)</li>
                  <li>Gérer les paiements de manière sécurisée</li>
                  <li>Traiter les réclamations dans des délais raisonnables</li>
                </ul>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 mb-2">DELIKREOL ne garantit PAS :</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>La qualité intrinsèque des produits vendus par les partenaires</li>
                  <li>Le respect des délais de préparation par les restaurants/producteurs</li>
                  <li>L'absence d'erreur ou de retard de livraison</li>
                  <li>La disponibilité permanente de tous les partenaires</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">5. Responsabilités des Partenaires</h2>

            <div className="space-y-4">
              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 mb-2">5.1. Restaurants et Producteurs</h3>
                <p className="text-sm mb-2">Les partenaires s'engagent à :</p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Respecter la réglementation sanitaire en vigueur</li>
                  <li>Disposer des agréments et autorisations nécessaires</li>
                  <li>Fournir des produits conformes aux normes de qualité et d'hygiène</li>
                  <li>Respecter les délais de préparation annoncés</li>
                  <li>Informer DELIKREOL de toute rupture de stock ou indisponibilité</li>
                  <li>Maintenir à jour leur catalogue et leurs tarifs</li>
                </ul>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 mb-2">5.2. Points Relais</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Assurer la conservation des produits dans de bonnes conditions</li>
                  <li>Respecter la chaîne du froid si nécessaire</li>
                  <li>Permettre le retrait des commandes aux horaires convenus</li>
                  <li>Informer le client en cas de problème</li>
                </ul>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 mb-2">5.3. Livreurs</h3>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Disposer d'une assurance professionnelle valide</li>
                  <li>Respecter le Code de la route</li>
                  <li>Livrer les commandes dans les délais annoncés</li>
                  <li>Traiter les produits avec soin</li>
                  <li>Respecter les consignes de livraison du client</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">6. Responsabilités du Client</h2>
            <p className="mb-4">Le client s'engage à :</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Fournir des informations exactes (adresse de livraison, coordonnées)</li>
              <li>Être présent ou joignable lors de la livraison</li>
              <li>Réceptionner sa commande dans des conditions normales</li>
              <li>Signaler tout problème dans un délai de 24h</li>
              <li>Payer le montant dû selon les modalités acceptées</li>
              <li>Ne pas abuser du service (commandes fictives, annulations répétées)</li>
            </ul>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">7. Commandes et Paiements</h2>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-200 mb-2">7.1. Processus de commande</h3>
                <p className="text-sm mb-2">
                  Le client peut passer commande de deux manières :
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Conciergerie :</strong> Formulaire de demande libre, traité par l'équipe DELIKREOL</li>
                  <li><strong>Commande directe :</strong> Sélection de produits dans le catalogue partenaires</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-200 mb-2">7.2. Paiement</h3>
                <p className="text-sm mb-2">
                  Le paiement s'effectue en ligne via <strong className="text-slate-200">Stripe</strong>
                  (carte bancaire, Apple Pay, Google Pay).
                </p>
                <p className="text-sm">
                  Le montant est débité à la confirmation de la commande.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-200 mb-2">7.3. Annulation</h3>
                <p className="text-sm mb-2">
                  Le client peut annuler sa commande :
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Sans frais jusqu'à &#x3C;&#x3C;&#x3C;XX&#x3E;&#x3E;&#x3E; minutes après validation</li>
                  <li>Avec frais si la préparation a déjà commencé</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-slate-200 mb-2">7.4. Remboursement</h3>
                <p className="text-sm">
                  En cas de problème avéré (produit non conforme, livraison impossible), le client
                  peut demander un remboursement total ou partiel dans un délai de 48h.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">8. Limitations de responsabilité</h2>

            <div className="space-y-4">
              <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
                <h3 className="font-semibold text-yellow-400 mb-2">Exclusions de responsabilité de DELIKREOL</h3>
                <p className="text-sm mb-2">
                  DELIKREOL ne peut être tenu responsable en cas de :
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Intoxication alimentaire liée à un produit fourni par un partenaire</li>
                  <li>Non-respect des normes sanitaires par un restaurant/producteur</li>
                  <li>Accident causé par un livreur partenaire</li>
                  <li>Vol ou dégradation lors d'une livraison</li>
                  <li>Indisponibilité temporaire de la plateforme (maintenance, force majeure)</li>
                  <li>Erreur de saisie du client (mauvaise adresse, coordonnées erronées)</li>
                </ul>
              </div>

              <div className="bg-slate-950/50 rounded-lg p-4">
                <h3 className="font-semibold text-slate-200 mb-2">Limitation de montant</h3>
                <p className="text-sm">
                  En tout état de cause, la responsabilité de DELIKREOL est limitée au montant
                  de la commande concernée, hors dommages intentionnels ou faute lourde.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">9. Protection des données personnelles</h2>
            <p className="mb-4">
              DELIKREOL s'engage à protéger vos données conformément au RGPD.
            </p>
            <p>
              Pour plus d'informations, consultez notre{' '}
              <a href="/privacy-policy" className="text-emerald-400 hover:underline">
                Politique de confidentialité
              </a>.
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">10. Propriété intellectuelle</h2>
            <p className="mb-4">
              Tous les éléments de la plateforme (logo, design, textes, code) sont protégés
              par le droit de la propriété intellectuelle.
            </p>
            <p>
              Toute reproduction non autorisée est interdite.
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">11. Résiliation et suspension</h2>
            <p className="mb-4">
              DELIKREOL se réserve le droit de suspendre ou résilier un compte en cas de :
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Non-respect des présentes CGU/CGS</li>
              <li>Comportement abusif ou frauduleux</li>
              <li>Impayés répétés</li>
              <li>Atteinte à l'image ou au fonctionnement de la plateforme</li>
            </ul>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">12. Litiges et médiation</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-200 mb-2">12.1. Réclamations</h3>
                <p className="text-sm">
                  Toute réclamation doit être adressée à : <strong className="text-emerald-400">contact@delikreol.com</strong>
                </p>
                <p className="text-sm mt-2">
                  Nous nous engageons à répondre sous 48h ouvrées.
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-200 mb-2">12.2. Médiation</h3>
                <p className="text-sm">
                  En cas de litige, vous pouvez recourir à la médiation de la consommation
                  (voir Mentions légales).
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-slate-200 mb-2">12.3. Droit applicable</h3>
                <p className="text-sm">
                  Les présentes CGU/CGS sont régies par le droit français.
                </p>
                <p className="text-sm mt-2">
                  En cas de litige non résolu à l'amiable, les tribunaux compétents seront
                  ceux de &#x3C;&#x3C;&#x3C;VILLE&#x3E;&#x3E;&#x3E;.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">13. Modifications des CGU/CGS</h2>
            <p>
              DELIKREOL se réserve le droit de modifier les présentes CGU/CGS à tout moment.
              Les utilisateurs seront informés par email des modifications importantes.
            </p>
          </section>

          <section className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-emerald-400 mb-4">14. Contact</h2>
            <p className="mb-2">
              Pour toute question concernant ces conditions :
            </p>
            <p><strong className="text-slate-200">Email :</strong> legal@delikreol.com</p>
            <p><strong className="text-slate-200">Téléphone :</strong> &#x3C;&#x3C;&#x3C;0596 XX XX XX&#x3E;&#x3E;&#x3E;</p>
            <p><strong className="text-slate-200">Adresse :</strong> &#x3C;&#x3C;&#x3C;ADRESSE COMPLÈTE&#x3E;&#x3E;&#x3E;</p>
          </section>
        </div>

        <div className="mt-12 text-center text-sm text-slate-500">
          <p>Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          <p className="mt-2">Version 1.0 (brouillon)</p>
        </div>
      </div>
    </div>
  );
}
