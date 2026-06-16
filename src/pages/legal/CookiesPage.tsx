import { Layout } from '../../components/layout/Layout';
import { Link } from 'react-router-dom';

export function CookiesPage() {
  return (
    <Layout>
      <section className="pageSection max-w-3xl mx-auto">
        <div className="badge">Légal</div>
        <h1>Politique de Cookies</h1>
        <p className="text-sm text-muted-foreground mb-8">Dernière mise à jour : juin 2026</p>

        <div className="space-y-6 text-sm leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold mb-2">Qu'est-ce qu'un cookie ?</h2>
            <p>
              Un cookie est un petit fichier texte déposé sur votre appareil (ordinateur, tablette, smartphone) lors de votre visite sur notre site. Il permet de stocker des informations relatives à votre navigation et de vous offrir une expérience personnalisée. Chez Delikreol, nous utilisons des cookies uniquement dans le respect de votre vie privée et des réglementations en vigueur (RGPD, directive ePrivacy).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Cookies nécessaires (localStorage)</h2>
            <p>
              Ces cookies sont indispensables au fonctionnement du site. Ils permettent de mémoriser votre panier, votre session de connexion et vos préférences essentielles. Ils sont stockés via le <strong>localStorage</strong> de votre navigateur et ne nécessitent pas votre consentement préalable. Sans ces cookies, certaines fonctionnalités du site (comme le panier ou la connexion) ne pourraient pas fonctionner correctement.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Cookies fonctionnels</h2>
            <p>
              Ces cookies améliorent votre expérience utilisateur en mémorisant vos choix (ex. : commune de livraison, type de vue, préférences d'affichage). Ils nous permettent de personnaliser votre navigation sans vous demander de ressaisir vos informations à chaque visite. Ces cookies sont déposés sous réserve de votre consentement.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Cookies analytics (opt-in)</h2>
            <p>
              Nous utilisons des cookies analytiques (ex. : mesure d'audience) pour comprendre comment vous interagissez avec notre site. Ces données nous aident à améliorer nos services, à identifier les pages les plus consultées et à détecter d'éventuels problèmes techniques. Ces cookies ne sont déposés qu'<strong>avec votre consentement explicite</strong> (opt-in). Vous pouvez à tout moment retirer votre consentement via notre module de gestion des préférences.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Cookies tiers et tracking</h2>
            <p>
              Delikreol <strong>ne dépose aucun cookie tiers de tracking publicitaire ou de réseaux sociaux</strong> sans votre consentement préalable. Nous n'utilisons pas de pixels espions, de trackers publicitaires croisés ni de profilage à des fins commerciales sans votre autorisation explicite. Vous êtes informé de manière transparente sur l'ensemble des cookies déposés sur notre plateforme.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Gestion de vos préférences</h2>
            <p>
              Vous pouvez à tout moment gérer vos préférences en matière de cookies via notre <strong>module de consentement</strong> intégré. Accessible depuis le pied de page, il vous permet d'accepter, refuser ou personnaliser l'utilisation des cookies. Vous pouvez également configurer votre navigateur pour bloquer ou supprimer les cookies, mais cela pourrait affecter certaines fonctionnalités du site.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Contact</h2>
            <p>
              Pour toute question concernant notre politique de cookies ou l'exercice de vos droits, vous pouvez nous contacter à : <a href="mailto:contact@delikreol.mq" className="text-primary underline">contact@delikreol.mq</a>
            </p>
          </div>

          <div className="border-t pt-6 mt-8 text-xs text-muted-foreground">
            <p>
              Consultez également notre <Link to="/confidentialite" className="text-primary underline">Politique de Confidentialité</Link> et nos <Link to="/cgu" className="text-primary underline">Conditions Générales d'Utilisation</Link>.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export default CookiesPage;