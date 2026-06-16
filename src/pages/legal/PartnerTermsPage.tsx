import { Layout } from '../../components/layout/Layout';
import { Link } from 'react-router-dom';

export function PartnerTermsPage() {
  return (
    <Layout>
      <section className="pageSection max-w-3xl mx-auto">
        <div className="badge">Partenaires</div>
        <h1>Conditions de la Phase Bêta</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : juin 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold mb-2">Accès gratuit pendant la phase bêta</h2>
            <p>
              Pendant toute la durée de la phase bêta, l'accès à la plateforme Delikreol est <strong>totalement gratuit</strong> pour les partenaires (traiteurs, restaurateurs, producteurs locaux). Aucuns frais d'inscription, d'abonnement ou de mise en ligne ne vous seront facturés. Vous pouvez créer et gérer votre catalogue, recevoir des commandes et interagir avec vos clients sans aucun coût fixe.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Engagement du partenaire</h2>
            <p>En tant que partenaire Delikreol, vous vous engagez à :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Qualité :</strong> Proposer des produits de qualité, frais et conformes à leur description sur la plateforme.</li>
              <li><strong>Hygiène :</strong> Respecter les normes d'hygiène et de sécurité alimentaire en vigueur en Martinique et en France.</li>
              <li><strong>Disponibilité :</strong> Maintenir votre catalogue à jour et indiquer les indisponibilités en temps réel.</li>
              <li><strong>Photos :</strong> Fournir des photos claires, récentes et représentatives de vos plats et produits. Les photos doivent être libres de droits pour utilisation sur la plateforme.</li>
              <li><strong>Réactivité :</strong> Confirmer ou refuser les commandes dans les délais impartis et communiquer avec les clients de manière professionnelle.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Commission Delikreol : 15%</h2>
            <p>
              La commission Delikreol s'élève à <strong>15% du montant total de chaque commande</strong> (hors frais de livraison). Cette commission est <strong>incluse dans le prix affiché</strong> au client : le prix que vous définissez est le prix de vente final, et Delikreol prélève sa part sur le montant reversé. Aucun frais supplémentaire n'est appliqué au client. Le reversement au partenaire est effectué selon les modalités définies dans votre espace partenaire.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Modes de livraison</h2>
            <p>Delikreol propose plusieurs modes de livraison pour vos commandes :</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong>Retrait chez le traiteur :</strong> Le client vient récupérer sa commande directement à votre établissement.</li>
              <li><strong>Point relais :</strong> La commande est déposée dans un point relais partenaire pour que le client la récupère.</li>
              <li><strong>Livraison à domicile :</strong> Un livreur partenaire Delikreol assure la livraison chez le client.</li>
            </ul>
            <p className="mt-2">
              Les frais de livraison sont à la charge du client et ne sont pas inclus dans la commission Delikreol.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Propriété des données et photos</h2>
            <p>
              Les photos et contenus que vous publiez sur la plateforme restent <strong>votre propriété intellectuelle</strong>. En les publiant sur Delikreol, vous nous accordez une licence d'utilisation non exclusive, gratuite et limitée à la durée de votre présence sur la plateforme, afin de les afficher sur le site et nos supports de communication (réseaux sociaux, newsletters, etc.). Vous pouvez demander le retrait de vos contenus à tout moment.
            </p>
            <p className="mt-2">
              Les données clients (noms, adresses, historique) collectées via Delikreol sont la propriété conjointe de Delikreol et du partenaire, et sont traitées conformément à notre <Link to="/confidentialite" className="text-primary underline">Politique de Confidentialité</Link>.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Résiliation</h2>
            <p>
              La collaboration peut être résiliée <strong>à tout moment par l'une ou l'autre des parties</strong>, sans pénalité, moyennant un préavis de 7 jours ouvrés. En cas de non-respect des engagements (qualité, hygiène, disponibilité), Delikreol se réserve le droit de suspendre ou résilier l'accès au partenaire avec effet immédiat. Les commandes en cours au moment de la résiliation seront honorées.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p>
              Pour toute question relative aux conditions partenaires ou à la phase bêta : <a href="mailto:contact@delikreol.mq" className="text-primary underline">contact@delikreol.mq</a>
            </p>
          </div>

          <div className="border-t pt-6 mt-8 text-xs text-muted-foreground">
            <p>
              Consultez également notre <Link to="/confidentialite" className="text-primary underline">Politique de Confidentialité</Link> et nos <Link to="/cgv" className="text-primary underline">Conditions Générales de Vente</Link>.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default PartnerTermsPage;