import { Link } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { PUBLIC_CONTACT_EMAIL } from '../config/publicRuntime';

export function LegalMentionsPage() {
  return (
    <Layout>
      <section className="pageSection mx-auto max-w-3xl">
        <div className="badge">Informations légales</div>
        <h1>Mentions légales</h1>
        <p className="mb-8 text-sm text-muted-foreground">Dernière mise à jour : octobre 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="mb-2 text-lg font-semibold">Édition et contact</h2>
            <p>
              DELIKREOL est une plateforme numérique exploitée en Martinique et actuellement en phase de lancement contrôlé.
              Les informations d’immatriculation complètes de l’éditeur doivent être affichées ici avant toute ouverture commerciale générale. Contact :{' '}
              <a className="text-primary underline" href={`mailto:${PUBLIC_CONTACT_EMAIL}`}>
                {PUBLIC_CONTACT_EMAIL}
              </a>.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">Hébergement</h2>
            <p>Le site public est servi depuis une infrastructure VPS Hostinger. Les services de données applicatives et d’authentification sont fournis par Supabase.</p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">Phase pilote</h2>
            <p>
              Les demandes de commande restent soumises à la confirmation du partenaire. Les moyens de
              paiement réellement disponibles sont indiqués au moment de la demande ; aucun moyen non
              activé n’est présenté comme opérationnel.
            </p>
          </section>

          <section>
            <h2 className="mb-2 text-lg font-semibold">Données et cookies</h2>
            <p>
              Consultez la{' '}
              <Link className="text-primary underline" to="/confidentialite">politique de confidentialité</Link>
              {' '}et la <Link className="text-primary underline" to="/cookies">politique relative aux cookies</Link>.
            </p>
          </section>

          <p className="border-t pt-6 text-xs text-muted-foreground">
            L’ouverture commerciale complète reste conditionnée à la publication des informations légales
            obligatoires et du médiateur de la consommation.
          </p>
        </div>
      </section>
    </Layout>
  );
}

export default LegalMentionsPage;
