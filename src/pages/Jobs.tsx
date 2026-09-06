import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Briefcase, ChefHat, Mail, MapPin, MessageCircle, Store, Truck } from 'lucide-react';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
const CONTACT_EMAIL = 'contact@delikreol.com';

const opportunities = [
  {
    title: 'Cuisine et traiteur',
    description: 'Cuisiniers, cuisinières et professionnels de la restauration souhaitant rejoindre notre vivier local.',
    icon: ChefHat,
    action: 'Présenter mon profil',
    href: '/devenir-partenaire',
  },
  {
    title: 'Livraison indépendante',
    description: 'Livreurs disponibles en Martinique avec scooter, voiture ou vélo, selon les zones et créneaux proposés.',
    icon: Truck,
    action: 'Devenir livreur',
    href: '/devenir-livreur',
  },
  {
    title: 'Point relais',
    description: 'Commerces et lieux accessibles souhaitant accueillir des retraits de commandes locales.',
    icon: Store,
    action: 'Proposer un point relais',
    href: '/devenir-point-relais',
  },
];

function whatsappApplicationLink(role = 'candidature spontanée') {
  const message = [
    'Bonjour DELIKREOL,',
    `Je souhaite proposer ma ${role}.`,
    'Nom :',
    'Commune :',
    'Téléphone :',
    'Expérience / activité :',
    'Disponibilités :',
  ].join('\n');

  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function JobsPage() {
  useEffect(() => {
    document.title = 'Emplois et candidatures — DELIKREOL Martinique';
  }, []);

  return (
    <main className="bg-background">
      <section className="border-b border-border/60 bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <Briefcase className="h-4 w-4" />
            Rejoindre le réseau
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Emplois, missions et candidatures DELIKREOL
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Nous constituons un vivier de talents en Martinique pour la cuisine, la livraison et les points relais.
            Envoyez votre profil : DELIKREOL vous recontactera lorsqu'une opportunité correspondra à votre zone et vos disponibilités.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={whatsappApplicationLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-green-600 px-5 py-3 font-bold text-white transition hover:bg-green-700"
            >
              <MessageCircle className="h-5 w-5" />
              Candidater par WhatsApp
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent('Candidature DELIKREOL')}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-card px-5 py-3 font-bold text-foreground transition hover:border-primary/40"
            >
              <Mail className="h-5 w-5" />
              Envoyer mon CV par email
            </a>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Profils recherchés</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Choisissez votre parcours</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {opportunities.map((opportunity) => {
            const Icon = opportunity.icon;
            return (
              <article key={opportunity.title} className="flex flex-col rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-black">{opportunity.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{opportunity.description}</p>
                <Link
                  to={opportunity.href}
                  className="mt-6 inline-flex items-center gap-2 font-bold text-primary hover:underline"
                >
                  {opportunity.action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>

        <div className="mt-10 grid gap-6 rounded-3xl bg-foreground p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <div className="flex items-center gap-2 text-secondary">
              <MapPin className="h-5 w-5" />
              <span className="font-black">Martinique</span>
            </div>
            <h2 className="mt-3 text-2xl font-black">Votre métier n'est pas dans la liste ?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
              Envoyez une candidature spontanée avec votre commune, votre expérience, vos disponibilités et un moyen de vous joindre.
            </p>
          </div>
          <a
            href={whatsappApplicationLink()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-black text-primary-foreground"
          >
            Envoyer mon profil
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted-foreground">
          L'envoi d'une candidature ne constitue pas une promesse d'embauche ou de mission. Les conditions sont précisées avant tout engagement.
        </p>
      </section>
    </main>
  );
}
