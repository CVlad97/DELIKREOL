import React from 'react';
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
            Dernière mise à jour : 19 décembre 2024
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
            Le paiement s'effectue en ligne par carte bancaire via notre prestataire de paiement sécurisé Stripe. Le compte du Client est débité lors de la validation de la commande.
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
            Les livraisons sont actuellement disponibles en Guadeloupe. Les zones de livraison peuvent varier selon les commerçants.
          </p>

          <h2>7. Droit de rétractation</h2>
          <p>
            Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne peut être exercé pour les contrats de fourniture de biens susceptibles de se détériorer ou de se périmer rapidement (produits frais, denrées périssables).
          </p>

          <h2>8. Réclamations</h2>
          <p>
            Pour toute réclamation concernant une commande, le Client peut contacter le service client :
          </p>
          <ul>
            <li>Par email : contact@delikreol.com</li>
            <li>Via le formulaire de contact sur le site</li>
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
            Delikreol agit en tant qu'intermédiaire entre les commerçants et les clients. La responsabilité de la qualité des produits incombe aux commerçants partenaires. Delikreol s'engage néanmoins à faire son maximum pour garantir la satisfaction de ses utilisateurs.
          </p>

          <h2>11. Propriété intellectuelle</h2>
          <p>
            Tous les éléments du site (textes, images, logos, graphismes) sont la propriété exclusive de Delikreol et sont protégés par les lois sur la propriété intellectuelle.
          </p>

          <h2>12. Modification des CGV</h2>
          <p>
            Delikreol se réserve le droit de modifier les présentes CGV à tout moment. Les CGV applicables sont celles en vigueur au moment de la commande.
          </p>

          <h2>13. Loi applicable et juridiction</h2>
          <p>
            Les présentes CGV sont soumises au droit français. En cas de litige, et après tentative de recherche d'une solution amiable, les tribunaux français seront seuls compétents.
          </p>

          <h2>14. Contact</h2>
          <p>
            Pour toute question concernant les présentes CGV, vous pouvez nous contacter :
          </p>
          <ul>
            <li>Email : contact@delikreol.com</li>
            <li>Formulaire de contact : <Link to="/contact" className="text-emerald-600 hover:text-emerald-700">cliquez ici</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}
