import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-gradient-to-br from-emerald-50 to-teal-50 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/" className="text-emerald-600 hover:text-emerald-700 mb-4 inline-block">
            ← Retour à l'accueil
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Politique de Confidentialité
          </h1>
          <p className="text-gray-600 mt-2">
            Dernière mise à jour : 19 décembre 2024
          </p>
        </div>
      </section>

      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto prose prose-lg">
          <h2>1. Introduction</h2>
          <p>
            Delikreol s'engage à protéger la vie privée de ses utilisateurs. La présente Politique de Confidentialité décrit comment nous collectons, utilisons, partageons et protégeons vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>

          <h2>2. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données est Delikreol, joignable à l'adresse : contact@delikreol.com
          </p>

          <h2>3. Données collectées</h2>
          <h3>3.1 Données d'identification</h3>
          <ul>
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>Adresse de livraison</li>
          </ul>

          <h3>3.2 Données de connexion</h3>
          <ul>
            <li>Identifiant de connexion</li>
            <li>Mot de passe (chiffré)</li>
            <li>Adresse IP</li>
            <li>Données de navigation</li>
          </ul>

          <h3>3.3 Données de commande</h3>
          <ul>
            <li>Historique des commandes</li>
            <li>Produits commandés</li>
            <li>Montants des transactions</li>
            <li>Mode de paiement utilisé</li>
          </ul>

          <h3>3.4 Données de localisation</h3>
          <ul>
            <li>Adresse de livraison</li>
            <li>Géolocalisation (avec votre consentement)</li>
          </ul>

          <h2>4. Finalités du traitement</h2>
          <p>
            Vos données personnelles sont collectées et traitées pour les finalités suivantes :
          </p>
          <ul>
            <li>Gestion de votre compte utilisateur</li>
            <li>Traitement et suivi de vos commandes</li>
            <li>Gestion des paiements et facturation</li>
            <li>Service client et support</li>
            <li>Communication sur nos services et offres (avec votre consentement)</li>
            <li>Amélioration de nos services</li>
            <li>Respect de nos obligations légales</li>
            <li>Prévention de la fraude</li>
          </ul>

          <h2>5. Base légale du traitement</h2>
          <p>
            Le traitement de vos données repose sur :
          </p>
          <ul>
            <li><strong>L'exécution du contrat</strong> : pour traiter vos commandes</li>
            <li><strong>Votre consentement</strong> : pour les communications marketing et la géolocalisation</li>
            <li><strong>L'intérêt légitime</strong> : pour améliorer nos services et prévenir la fraude</li>
            <li><strong>Les obligations légales</strong> : pour la facturation et la comptabilité</li>
          </ul>

          <h2>6. Destinataires des données</h2>
          <p>
            Vos données peuvent être partagées avec :
          </p>
          <ul>
            <li><strong>Nos partenaires commerçants</strong> : pour préparer votre commande</li>
            <li><strong>Nos livreurs</strong> : pour effectuer la livraison</li>
            <li><strong>Nos prestataires de services</strong> :
              <ul>
                <li>Hébergement (Supabase)</li>
                <li>Paiement (Stripe)</li>
                <li>Communication (services email/SMS)</li>
              </ul>
            </li>
            <li><strong>Autorités compétentes</strong> : en cas d'obligation légale</li>
          </ul>

          <h2>7. Durée de conservation</h2>
          <p>
            Vos données sont conservées pour les durées suivantes :
          </p>
          <ul>
            <li><strong>Données de compte</strong> : pendant toute la durée d'utilisation du service + 3 ans après la dernière activité</li>
            <li><strong>Données de commande</strong> : 10 ans pour les obligations comptables et fiscales</li>
            <li><strong>Données de paiement</strong> : 13 mois (obligation légale anti-fraude)</li>
            <li><strong>Cookies</strong> : 13 mois maximum</li>
          </ul>

          <h2>8. Vos droits</h2>
          <p>
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul>
            <li><strong>Droit d'accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : corriger vos données inexactes</li>
            <li><strong>Droit à l'effacement</strong> : demander la suppression de vos données</li>
            <li><strong>Droit à la limitation</strong> : limiter le traitement de vos données</li>
            <li><strong>Droit à la portabilité</strong> : récupérer vos données dans un format structuré</li>
            <li><strong>Droit d'opposition</strong> : vous opposer au traitement de vos données</li>
            <li><strong>Droit de retirer votre consentement</strong> : à tout moment</li>
          </ul>
          <p>
            Pour exercer vos droits, contactez-nous à : contact@delikreol.com
          </p>

          <h2>9. Sécurité des données</h2>
          <p>
            Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre :
          </p>
          <ul>
            <li>L'accès non autorisé</li>
            <li>La modification, divulgation ou destruction non autorisée</li>
            <li>La perte accidentelle</li>
          </ul>
          <p>
            Ces mesures incluent :
          </p>
          <ul>
            <li>Chiffrement des données sensibles (SSL/TLS)</li>
            <li>Authentification sécurisée</li>
            <li>Hébergement sur des serveurs sécurisés</li>
            <li>Accès limité aux données (principe du moindre privilège)</li>
            <li>Sauvegardes régulières</li>
          </ul>

          <h2>10. Cookies</h2>
          <p>
            Notre site utilise des cookies pour :
          </p>
          <ul>
            <li>Assurer le fonctionnement technique du site</li>
            <li>Mémoriser vos préférences</li>
            <li>Améliorer votre expérience utilisateur</li>
            <li>Analyser l'utilisation du site (avec votre consentement)</li>
          </ul>
          <p>
            Vous pouvez gérer vos préférences de cookies dans les paramètres de votre navigateur.
          </p>

          <h2>11. Transferts de données hors UE</h2>
          <p>
            Certains de nos prestataires peuvent être situés en dehors de l'Union Européenne. Dans ce cas, nous nous assurons qu'ils offrent un niveau de protection adéquat des données personnelles conforme au RGPD.
          </p>

          <h2>12. Mineurs</h2>
          <p>
            Nos services ne sont pas destinés aux personnes de moins de 18 ans. Si vous êtes mineur, vous devez obtenir l'autorisation de vos parents ou tuteurs légaux avant d'utiliser nos services.
          </p>

          <h2>13. Modifications de la politique</h2>
          <p>
            Nous nous réservons le droit de modifier cette Politique de Confidentialité à tout moment. Toute modification sera publiée sur cette page avec une nouvelle date de "dernière mise à jour".
          </p>

          <h2>14. Contact et réclamation</h2>
          <p>
            Pour toute question concernant cette politique ou l'exercice de vos droits :
          </p>
          <ul>
            <li>Email : contact@delikreol.com</li>
            <li>Formulaire de contact : <Link to="/contact" className="text-emerald-600 hover:text-emerald-700">cliquez ici</Link></li>
          </ul>
          <p>
            Vous avez également le droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) :
          </p>
          <ul>
            <li>Site web : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700">www.cnil.fr</a></li>
            <li>Adresse : 3 Place de Fontenoy - TSA 80715 - 75334 PARIS CEDEX 07</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
