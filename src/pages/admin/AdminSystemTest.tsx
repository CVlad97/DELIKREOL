import { Link } from 'react-router-dom';
import {
  Activity,
  UserRound,
  Store,
  Truck,
  MapPin,
  ChefHat,
  Bug,
  Euro,
  ShoppingCart,
  ShieldCheck,
} from 'lucide-react';

const blocks = [
  {
    title: 'Client',
    icon: UserRound,
    links: [
      ['Accueil', '/'],
      ['Connexion', '/connexion'],
      ['Compte client', '/compte'],
      ['Catalogue', '/catalogue'],
      ['Panier', '/panier'],
      ['Suivi commande', '/statut-commande'],
    ],
  },
  {
    title: 'Commande',
    icon: ShoppingCart,
    links: [
      ['Créer une commande test', '/catalogue'],
      ['Voir commandes admin', '/admin/commandes'],
      ['Suivi commande', '/statut-commande'],
    ],
  },
  {
    title: 'Partenaires / Traiteurs',
    icon: ChefHat,
    links: [
      ['Espace pro', '/pro'],
      ['Devenir partenaire', '/devenir-partenaire'],
      ['Accès partenaire', '/partenaire'],
      ['Admin partenaires', '/admin/partenaires'],
      ['Candidatures', '/admin/applications'],
      ['Validation traiteurs', '/admin/caterer-validation'],
    ],
  },
  {
    title: 'Livreurs',
    icon: Truck,
    links: [
      ['Formulaire livreur', '/devenir-livreur'],
      ['Admin livreurs', '/admin/livreurs'],
    ],
  },
  {
    title: 'Points relais',
    icon: MapPin,
    links: [
      ['Page points relais', '/points-relais'],
      ['Admin points relais', '/admin/points-relais'],
    ],
  },
  {
    title: 'Finance',
    icon: Euro,
    links: [
      ['Finance', '/admin/finance'],
      ['Commandes', '/admin/commandes'],
    ],
  },
  {
    title: 'Bugs / Support',
    icon: Bug,
    links: [
      ['Signaler un bug', '/feedback'],
      ['Admin feedback', '/admin/feedback'],
    ],
  },
  {
    title: 'Admin',
    icon: ShieldCheck,
    links: [
      ['Vue admin', '/admin'],
      ['Paramètres', '/admin/parametres'],
      ['Accès pilote', '/admin/acces-pilote'],
    ],
  },
];

export default function AdminSystemTest() {
  return (
    <div className="space-y-6">
      <div>
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase text-primary">
          <Activity className="h-4 w-4" />
          Test système
        </div>
        <h1 className="mt-3 text-3xl font-black">Centre de test multiplexe</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Accès rapide aux pages publiques, pro et admin pour tester DeliKreol de bout en bout.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {blocks.map((block) => {
          const Icon = block.icon;
          return (
            <div key={block.title} className="rounded-2xl border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-black">{block.title}</h2>
              </div>
              <div className="grid gap-2">
                {block.links.map(([label, to]) => (
                  <Link
                    key={`${block.title}-${to}`}
                    to={to}
                    className="rounded-xl border px-3 py-2 text-sm font-bold hover:bg-muted"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
