import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-emerald-600 hover:text-emerald-700 mb-4 inline-block">
            ← Retour à l'accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Conditions Générales de Vente
          </h1>
          <p className="text-gray-600 mt-2">
            Dernière mise à jour : 22 mai 2026
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2>1. Objet</h2>
          <p>
            Les présentes Conditions Générales de Vente (CGV) régissent les relations contractuelles entre Delikreol (ci-après "la Plateforme") et tout utilisateur (ci-après "l'Utilisateur" ou "le Client") souhaitant effectuer un achat via la plateforme delikreol.com.
          </p>

          <h2>2. Acceptation des conditions</h2>
          <p>
            Toute commande passée sur la Plateforme implique l'acceptation sans réserve des présentes CGV. L'Utilisateur reconnaît avoir pris connaissance des CGV et les accepter.
          </p>

          <h2>3. Services proposés</h2>
          <p>
            Delikreol est une plateforme de mise en relation entre :
          </p>
          <ul>
            <li>Des commerçants locaux (restaurants, épiceries, producteurs)</li>
            <li>Des clients souhaitant commander des produits</li>
            <li>Des livreurs assurant la livraison</li>
            <li>Des points relais permettant le retrait de commandes</li>
          </ul>
          <p>
            Delikreol agit comme <strong>intermédiaire</strong> et coordinateur opérationnel.
            Le restaurant ou vendeur reste responsable du produit, le livreur reste responsable du transport
            et de la remise, et Delikreol reste responsable de ses propres fautes dans l’exploitation de la plateforme.
          </p>

          <h2>4. Commandes</h2>
          <h3>4.1 Processus de commande</h3>
          <p>
            Pour passer commande, l'Utilisateur doit :
          </p>
          <ul>
            <li>Créer un compte ou se connecter</li>
            <li>Sélectionner ses produits</li>
            <li>Choisir son mode de livraison (domicile ou point relais)</li>
            <li>Valider son panier et procéder au paiement</li>
          </ul>

          <h3>4.2 Validation de la commande</h3>
          <p>
            La commande est définitivement validée après confirmation du paiement. Un email de confirmation est envoyé au Client contenant le récapitulatif de la commande.
          </p>

          <h2>5. Prix et paiement</h2>
          <h3>5.1 Prix</h3>
          <p>
            Les prix sont indiqués en euros TTC. Ils comprennent :
          </p>
          <ul>
            <li>Le prix des produits</li>
            <li>Les frais de livraison (variable selon le mode choisi)</li>
            <li>Tous les taxes applicables</li>
          </ul>

          <h3>5.2 Modalités de paiement</h3>
          <p>
            Le paiement s'effectue via un lien bancaire, un prestataire de paiement, ou par virement après validation humaine de la commande.
            Le Client reçoit les modalités (lien ou coordonnées) avant préparation.
          </p>
          <p>
            Quand la solution de paiement le permet, Delikreol peut utiliser un schéma
            <strong> autorisation (empreinte) puis capture différée</strong>, dans les limites affichées au client.
            Aucune capture ne peut dépasser le montant validé selon les règles prévues.
          </p>

          <h2>6. Livraison</h2>
          <h3>6.1 Modes de livraison</h3>
          <p>
            Deux modes de livraison sont proposés :
          </p>
          <ul>
            <li><strong>Livraison à domicile</strong> : délai estimé de 1 à 2 heures selon la disponibilité</li>
            <li><strong>Point relais</strong> : retrait dans un délai de 2 à 4 heures, le Client est notifié par SMS/email</li>
          </ul>

          <h3>6.2 Zone de livraison</h3>
          <p>
            Les livraisons sont actuellement disponibles en Martinique. Les zones de livraison peuvent varier selon les partenaires.
          </p>

          <h2>7. Droit de rétractation</h2>
          <p>
            Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture de biens susceptibles de se détériorer ou de se périmer rapidement (produits frais, denrées périssables).
          </p>

          <h2>8. Réclamations, litiges et traitements</h2>
          <p>Pour toute réclamation concernant une commande, le Client peut contacter le service client :</p>
          <ul>
            <li>Par email : contact@delikreol.mq</li>
            <li>Via le formulaire de contact sur le site</li>
            <li>Via WhatsApp support pour ouverture d’un dossier</li>
          </ul>

          <h3>8.1 Matrice litiges (résumé opérationnel)</h3>
          <ul>
            <li><strong>Faute restaurant/vendeur</strong> : produit non conforme, rupture non signalée, erreur de préparation. Solution possible : remboursement total/partiel, avoir ou ristourne imputés au vendeur selon analyse.</li>
            <li><strong>Faute livreur</strong> : non-remise, mauvaise remise, dégradation en transport. Solution possible : remboursement partiel/total ou avoir selon preuves, imputé au transport.</li>
            <li><strong>Faute plateforme</strong> : erreur de transmission, dysfonctionnement avéré, mauvaise coordination Delikreol. Solution possible : remboursement/avoir imputés à la plateforme.</li>
            <li><strong>Faute client</strong> : adresse erronée, absence répétée, annulation tardive abusive. Solution possible : frais conservés partiellement selon état d’avancement.</li>
            <li><strong>Force majeure</strong> : événements extérieurs majeurs (intempéries, blocages, pannes réseau). Solution étudiée au cas par cas (report, avoir, remboursement partiel).</li>
          </ul>

          <h2>9. Protection des données</h2>
          <p>
            Les données personnelles collectées font l'objet d'un traitement conforme au RGPD. Pour plus d'informations, consultez notre{' '}
            <Link to="/legal/privacy" className="text-emerald-600 hover:text-emerald-700">
              Politique de confidentialité
            </Link>.
          </p>

          <h2>10. Responsabilité</h2>
          <p>
            Delikreol agit en tant qu'intermédiaire entre les commerçants et les clients. La responsabilité de la qualité
            des produits incombe aux commerçants partenaires. La responsabilité du transport et de la remise incombe au livreur.
            Delikreol reste responsable de ses propres fautes (ex: erreur de coordination, défaut de traitement avéré).
          </p>

          <h2>11. Propriété intellectuelle</h2>
          <p>
            Tous les éléments du site (textes, images, logos, graphismes) sont la propriété exclusive de Delikreol et sont protégés par les lois sur la propriété intellectuelle.
          </p>

          <h2>12. Modification des CGV</h2>
          <p>
            Delikreol se réserve le droit de modifier les présentes CGV à tout moment. Les CGV applicables sont celles en vigueur au moment de la commande.
          </p>

          <h2>13. Médiation, loi applicable et juridiction</h2>
          <p>
            En cas de litige de consommation non résolu amiablement, le client peut recourir à un médiateur de la consommation
            conformément au droit français.
          </p>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, et après tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents.
          </p>

          <h2>14. Programme partenaires et limites</h2>
          <p>
            Delikreol peut proposer des avoirs, ristournes, crédits de sponsoring ou fonds de soutien partenaire non financiers.
            Delikreol ne propose pas de produit d’investissement financier et ne réalise aucune conversion automatique vers des crypto-actifs.
          </p>

          <h2>15. Contact</h2>
          <p>
            Pour toute question concernant les présentes CGV, vous pouvez nous contacter :
          </p>
          <ul>
            <li>Email : contact@delikreol.mq</li>
            <li>Messages : relayés vers le compte Gmail de gestion</li>
            <li>Formulaire de contact : <Link to="/contact" className="text-emerald-600 hover:text-emerald-700">cliquez ici</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
