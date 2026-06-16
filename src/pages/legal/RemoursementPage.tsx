import { Layout } from '../../components/layout/Layout';
import { Link } from 'react-router-dom';

export function RemoursementPage() {
  return (
    <Layout>
      <section className="pageSection max-w-3xl mx-auto">
        <div className="badge">Légal</div>
        <h1>Politique de Remboursement et Annulation</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : juin 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold mb-2">Denrées périssables : pas de droit de rétractation</h2>
            <p>
              Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux denrées alimentaires périssables. En effet, les plats préparés, les produits frais et les denrées périssables commandés sur Delikreol ne peuvent faire l'objet d'un retour ou d'un remboursement pour simple changement d'avis après réception.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Produits livrés : signaler un problème</h2>
            <p>
              Si vous constatez un problème avec votre commande (produit manquant, non conforme, abîmé ou problème d'hygiène), vous devez <strong>le signaler dans les 2 heures suivant la réception</strong> via notre support WhatsApp au <strong>+596 696 65 35 89</strong>. Passé ce délai, Delikreol ne pourra garantir la prise en charge de votre réclamation. Merci de préciser votre numéro de commande et de fournir une photo du problème constaté.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Commandes annulées par le traiteur</h2>
            <p>
              Si le traiteur partenaire annule votre commande pour quelque raison que ce soit (indisponibilité d'un produit, problème technique, etc.), vous serez informé dans les meilleurs délais et <strong>un remboursement intégral</strong> vous sera effectué. Le remboursement sera traité sous 48 à 72 heures ouvrées selon votre moyen de paiement.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Commandes annulées par le client avant préparation</h2>
            <p>
              Vous pouvez annuler votre commande <strong>tant que celle-ci n'a pas été confirmée et préparée</strong> par le traiteur. Une fois la préparation commencée, l'annulation n'est plus possible. Pour annuler, contactez notre support au plus vite via WhatsApp ou email. Si l'annulation est acceptée avant préparation, le remboursement sera intégral.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Procédure de réclamation</h2>
            <p>Pour toute réclamation, suivez les étapes suivantes :</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1">
              <li>Contactez notre support dans les 2 heures suivant la réception via WhatsApp <strong>+596 696 65 35 89</strong> ou par email.</li>
              <li>Indiquez votre numéro de commande et décrivez le problème rencontré.</li>
              <li>Joignez une photo si le problème est visuel (produit abîmé, non conforme, etc.).</li>
              <li>Notre équipe analysera votre réclamation et vous proposera une solution sous 48 heures ouvrées.</li>
              <li>En cas de litige non résolu, vous pouvez nous contacter directement à l'adresse ci-dessous.</li>
            </ol>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Contact support</h2>
            <p>
              Pour toute question relative à un remboursement ou une annulation :
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>WhatsApp :</strong> +596 696 65 35 89</li>
              <li><strong>Email :</strong> <a href="mailto:contact@delikreol.mq" className="text-primary underline">contact@delikreol.mq</a></li>
              <li><strong>Formulaire :</strong> <Link to="/contact" className="text-primary underline">Page de contact</Link></li>
            </ul>
          </div>

          <div className="border-t pt-6 mt-8 text-xs text-muted-foreground">
            <p>
              Consultez également nos <Link to="/cgv" className="text-primary underline">Conditions Générales de Vente</Link> pour plus d'informations.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default RemoursementPage;