import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  FileText,
  Handshake,
  HeartHandshake,
  Mail,
  Rocket,
  ShieldCheck,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { Layout } from '../components/layout/Layout';
import { setPageMeta } from '../services/seo';

const CONTACT_EMAIL = 'contact@delikreol.com';
const WHATSAPP_URL = 'https://wa.me/596696653589?text=Bonjour%20DELIKREOL%2C%20je%20souhaite%20%C3%A9changer%20sur%20le%20financement%20du%20projet.';

const uses = [
  ['Finalisation PWA & QA mobile', '3 000 €'],
  ['Juridique, conformité & contrats', '1 500 €'],
  ['Marketing de lancement', '2 500 €'],
  ['Équipement livraison pilote', '1 800 €'],
  ['Kits points relais & terrain', '1 500 €'],
  ['Trésorerie / BFR', '4 000 €'],
  ['Marge de sécurité', '1 700 €'],
];

const milestones = [
  'Parcours mobile/PWA et paiement de production contrôlés',
  'Réseau pilote de partenaires et livreurs conformes',
  'Premières commandes payantes et prestations B2B',
  'Mesure du panier, des délais, de la marge et de la rétention',
  'Décision Phase 2 fondée sur des métriques réelles',
];

const audiences = [
  {
    title: 'Financeurs publics & accompagnateurs',
    description: 'Dossier complet, budget, impact territorial, calendrier et pièces justificatives.',
    icon: Building2,
  },
  {
    title: 'Investisseurs & financeurs privés',
    description: 'Produit existant, projections clairement identifiées, roadmap et risques explicités.',
    icon: TrendingUp,
  },
  {
    title: 'Partenaires & sponsors',
    description: 'Activation locale, visibilité, commandes B2B et coopération opérationnelle.',
    icon: Handshake,
  },
];

export default function FundingPage() {
  useEffect(() => {
    setPageMeta(
      'Financer DELIKREOL — Soutenir le lancement en Martinique',
      'Découvrez le besoin Phase 1 de DELIKREOL, l’usage prévu des fonds et les jalons du pilote commercial en Martinique.',
      'financement DELIKREOL, levée de fonds Martinique, foodtech Martinique, logistique locale, traiteur Martinique'
    );
  }, []);

  return (
    <Layout>
      <main className="bg-background text-foreground">
        <section className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/[0.10] via-white to-secondary/[0.10]">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="max-w-4xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary">
                <Rocket className="h-4 w-4" /> Phase 1 — Martinique
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
                Financer la preuve commerciale de DELIKREOL
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">
                DELIKREOL dispose déjà d’un socle numérique pour connecter clients, traiteurs, livreurs, points relais et administration. Le besoin de travail de la Phase 1 est de <strong className="text-foreground">16 000 €</strong> pour finaliser, sécuriser, lancer et mesurer un pilote commercial en Martinique.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href={`mailto:${CONTACT_EMAIL}?subject=Dossier%20financement%20DELIKREOL`}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-primary-foreground transition hover:bg-primary/90"
                >
                  <FileText className="h-4 w-4" /> Demander le dossier <ArrowRight className="h-4 w-4" />
                </a>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-6 py-3.5 text-sm font-black text-foreground transition hover:border-primary/40"
                >
                  Échanger sur le financement
                </a>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-primary/20 bg-white p-7 shadow-sm lg:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Usage prévu des fonds</p>
              <h2 className="mt-2 text-3xl font-black">16 000 € pour atteindre des jalons mesurables</h2>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {uses.map(([label, amount]) => (
                  <div key={label} className="flex items-center justify-between gap-4 rounded-2xl bg-muted/50 px-4 py-3">
                    <span className="text-sm font-semibold text-muted-foreground">{label}</span>
                    <span className="shrink-0 font-black text-foreground">{amount}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
                Budget de travail issu du business plan 2026. Les postes devront être consolidés par des devis avant tout dépôt formel auprès d’un financeur.
              </p>
            </div>

            <div className="rounded-[2rem] bg-foreground p-7 text-white shadow-sm">
              <WalletCards className="h-8 w-8 text-secondary" />
              <h2 className="mt-4 text-2xl font-black">Financement progressif</h2>
              <p className="mt-3 text-sm leading-relaxed text-white/70">
                La Phase 1 privilégie les aides applicables, le microcrédit, les prêts d’honneur, les partenariats et les préventes. Une levée en capital plus importante n’est envisagée qu’après preuve de traction et d’économie unitaire.
              </p>
            </div>
          </div>
        </section>

        <section className="border-y border-border/50 bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Jalons du pilote</p>
                <h2 className="mt-2 text-3xl font-black">Ce que le financement doit prouver</h2>
                <p className="mt-4 text-muted-foreground">
                  Le financement doit produire des données réelles, pas seulement davantage de fonctionnalités.
                </p>
              </div>
              <div className="space-y-3">
                {milestones.map((milestone) => (
                  <div key={milestone} className="flex gap-3 rounded-2xl border border-border/60 bg-white p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                    <span className="text-sm font-semibold">{milestone}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-primary">Trois portes d’entrée</p>
            <h2 className="mt-2 text-3xl font-black">Choisir la relation adaptée</h2>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {audiences.map(({ title, description, icon: Icon }) => (
              <article key={title} className="rounded-[2rem] border border-border/60 bg-white p-6 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-black">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-amber-200 bg-amber-50 p-6 sm:p-8">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-amber-700" />
              <div>
                <h2 className="text-lg font-black text-amber-950">Transparence financière</h2>
                <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
                  Les chiffres de croissance présentés dans le business plan sont des projections de travail et non des performances réalisées. Aucun bouton d’investissement ou de collecte n’est proposé ici tant qu’un cadre juridique, une plateforme et les conditions applicables n’ont pas été formellement validés.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-border/50 bg-foreground text-white">
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-12 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 text-sm font-black text-secondary">
                <HeartHandshake className="h-5 w-5" /> Faire avancer DELIKREOL
              </div>
              <h2 className="mt-2 text-3xl font-black">Financeur, investisseur, sponsor ou partenaire ?</h2>
              <p className="mt-3 text-sm text-white/70">Nous pouvons transmettre le business plan, le prévisionnel 36 mois et le plan d’utilisation des fonds.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a href={`mailto:${CONTACT_EMAIL}?subject=Financement%20DELIKREOL`} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">
                <Mail className="h-4 w-4" /> Contacter DELIKREOL
              </a>
              <Link to="/devenir-partenaire" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-black text-white">
                Devenir partenaire <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
