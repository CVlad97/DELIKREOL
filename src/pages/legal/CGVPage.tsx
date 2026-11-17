import { Layout } from '../../components/layout/Layout';

export function CGVPage() {
  return (
    <Layout>
      <section className="pageSection max-w-3xl mx-auto">
        <div className="badge">Légal</div>
        <h1>Conditions Générales de Vente</h1>
        <p className="text-sm text-muted-foreground mb-8">Version pilote — clauses à valider avant toute ouverture des paiements commerciaux</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold mb-2">1. Objet</h2>
            <p>Ces conditions présentent le fonctionnement pilote de DELIKREOL, plateforme de mise en relation avec des professionnels de la restauration et des produits locaux. L’identité du vendeur contractuel et ses responsabilités doivent être précisées pour chaque offre avant toute commande ferme. Les ventes B2B et export nécessitent des conditions particulières validées par les parties.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">2. Produits</h2>
            <p>Les produits visibles peuvent être des propositions pilotes et ne valent pas disponibilité garantie. Le vendeur doit confirmer les caractéristiques, les ingrédients, les allergènes et les informations d’origine exigées avant toute vente. Une fiche incomplète ne doit pas donner lieu à une commande payante.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">3. Prix</h2>
            <p>Pour les offres effectivement commercialisées, le montant total, les taxes et les éventuels frais de livraison ou de service doivent être confirmés avant paiement. Les produits et devis en préparation n’ont pas de prix ferme tant que le vendeur ne les a pas validés.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">4. Commande</h2>
            <p>Une demande de devis ou de disponibilité n’est pas une commande acceptée. La vente est subordonnée à la confirmation du vendeur et, si paiement en ligne disponible, aux contrôles du prestataire de paiement et aux informations précontractuelles applicables.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">5. Livraison et retrait</h2>
            <p>Selon les partenaires et les produits, retrait, livraison ou point relais peuvent être proposés. Les frais, délais, conditions de conservation et la personne responsable de la livraison doivent être confirmés avant engagement.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">6. Paiement</h2>
            <p>Les seuls moyens de paiement utilisables sont ceux affichés au moment de la commande. Lorsque SumUp est proposé, le paiement par carte est réalisé sur le checkout hébergé et sécurisé de SumUp ; DELIKREOL ne reçoit ni ne stocke les données de carte. Le statut payé n'est enregistré qu'après confirmation serveur du prestataire de paiement. Stripe et les moyens manuels (virement, paiement à la remise ou lien externe) ne sont proposés que lorsqu'ils sont explicitement activés et affichés au client.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">7. Rétractation et remboursement</h2>
            <p>Certaines denrées susceptibles de se détériorer ou de se périmer rapidement relèvent d’exceptions au droit de rétractation, selon les conditions légales applicables. Les droits du client en matière de non-conformité et de réclamation demeurent applicables. Le support peut être contacté rapidement via WhatsApp ; aucun délai arbitraire de deux heures ne limite les droits légaux.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">8. Données personnelles</h2>
            <p>Les données nécessaires au service peuvent être utilisées pour les demandes, commandes, facturation et obligations légales, dans les conditions précisées par la politique de confidentialité. Les personnes disposent des droits prévus par le RGPD, sous réserve des durées de conservation obligatoires. Voir notre <a href="/confidentialite" className="text-primary underline">Politique de confidentialité</a>.</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">9. Contact</h2>
            <p>Pour toute réclamation ou question : WhatsApp +596 696 65 35 89 ou email contact@delikreol.com</p>
          </div>

          <div className="border-t pt-6 mt-8 text-xs text-muted-foreground">
            <p>DELIKREOL — CLAVEAU VLADIMIR, Entrepreneur individuel (EI) — Martinique.</p>
            <p>SIREN 103 128 716 · SIRET 103 128 716 00018 · Quartier Fougainville, 97211 Rivière-Pilote.</p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default CGVPage;
