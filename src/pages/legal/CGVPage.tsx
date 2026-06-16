import { Layout } from '../../components/layout/Layout';

export function CGVPage() {
  return (
    <Layout>
      <section className="pageSection max-w-3xl mx-auto">
        <div className="badge">Légal</div>
        <h1>Conditions Générales de Vente</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : juin 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold mb-2">1. Objet</h2>
            <p>Les présentes CGV régissent les ventes de plats et services proposés par Delikreol (ci-après « la Plateforme ») reliant des clients à des traiteurs, restaurateurs, producteurs locaux, livreurs et points relais en Martinique.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">2. Produits</h2>
            <p>Les produits proposés à la vente sont décrits sur la Plateforme. Les photos des plats sont non contractuelles. Les allergènes et origines des viandes sont indiqués sur chaque fiche produit.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">3. Prix</h2>
            <p>Les prix sont indiqués en euros TTC. Le prix total est clairement affiché avant validation de la commande, incluant : le prix des articles, les frais de service, et les frais de livraison le cas échéant. Aucun frais caché n'est appliqué.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">4. Commande</h2>
            <p>La commande est enregistrée après validation par le client. Un récapitulatif est envoyé. La commande est soumise à la confirmation du traiteur partenaire. En cas d'indisponibilité, le client est informé dans les meilleurs délais.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">5. Livraison et retrait</h2>
            <p>Les modes de livraison proposés sont : livraison à domicile, retrait chez le traiteur, point relais. Les délais sont estimatifs et communiqués avant validation. Le client est responsable de la réception de sa commande.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">6. Paiement</h2>
            <p>Le paiement est sécurisé via Stripe ou PayPal. Delikreol traite les transactions et reverse les montants aux partenaires selon les conditions définies. Aucune donnée bancaire n'est stockée par Delikreol.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">7. Rétractation et remboursement</h2>
            <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux denrées périssables. En cas de problème constaté, le client doit contacter le support dans les 2 heures suivant la réception via WhatsApp. Delikreol s'engage à trouver une solution amiable avec le partenaire.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">8. Données personnelles</h2>
            <p>Les données collectées sont utilisées uniquement dans le cadre de la commande et de la livraison. Conformément au RGPD, le client peut demander la suppression de ses données à tout moment. Voir notre <a href="/confidentialite" className="text-primary underline">Politique de confidentialité</a>.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">9. Contact</h2>
            <p>Pour toute réclamation ou question : WhatsApp +596 696 65 35 89 ou email contact@delikreol.mq</p>
          </div>

          <div className="border-t pt-6 mt-8 text-xs text-muted-foreground">
            <p>Delikreol — Martinique, Caraïbe</p>
            <p>SIRET à venir</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default CGVPage;
