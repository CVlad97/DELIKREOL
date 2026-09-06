import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, CheckCircle2, Globe2, MessageCircle, ShoppingBag, Smartphone, Utensils } from 'lucide-react';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';

const customerOffers = [
  {
    title: 'Repas créoles et produits locaux',
    description: 'Consultez le catalogue, choisissez une offre disponible puis confirmez le retrait ou la livraison.',
    price: 'Prix affiché au catalogue',
    icon: ShoppingBag,
    href: '/catalogue',
    action: 'Voir le catalogue',
  },
  {
    title: 'Devis traiteur événementiel',
    description: 'Repas privés, événements, associations et besoins sur mesure avec réponse personnalisée.',
    price: 'Sur devis',
    icon: Utensils,
    href: '/devis',
    action: 'Demander un devis',
  },
  {
    title: 'Repas entreprises et groupes',
    description: 'Repas d’équipe, commandes groupées et besoins récurrents adaptés au nombre de personnes.',
    price: 'Sur devis',
    icon: Building2,
    href: '/devis',
    action: 'Préparer ma demande',
  },
];

const professionalOffers = [
  {
    title: 'WhatsApp Business',
    description: 'Mise en place initiale d’un canal professionnel clair pour recevoir les demandes clients.',
    price: '49 € — forfait lancement',
    icon: Smartphone,
  },
  {
    title: 'Mini-site vitrine',
    description: 'Une présentation en ligne de l’activité, des informations utiles et des moyens de contact.',
    price: '79 € — forfait lancement',
    icon: Globe2,
  },
  {
    title: 'Carte menu digitale',
    description: 'Un menu partageable avec les produits, descriptions et prix communiqués par le professionnel.',
    price: '39 € — forfait lancement',
    icon: Utensils,
  },
];

function whatsappOfferLink(offer: string) {
  const message = `Bonjour DELIKREOL, je souhaite recevoir les détails et un devis pour : ${offer}.`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

export default function OffresCashPage() {
  useEffect(() => {
    document.title = 'Offres et services — DELIKREOL Martinique';
  }, []);

  return (
    <main className="bg-background">
      <section className="border-b border-border/60 bg-gradient-to-br from-amber-50 via-white to-orange-50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-primary">
            <CheckCircle2 className="h-4 w-4" />
            Offres DELIKREOL
          </span>
          <h1 className="mt-5 max-w-3xl text-4xl font-black tracking-tight text-foreground sm:text-5xl">
            Des solutions locales pour commander, organiser ou développer votre activité
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Accédez aux parcours disponibles en ligne. Les prestations professionnelles sont confirmées par devis avant tout paiement.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Clients et organisations</p>
          <h2 className="mt-2 text-3xl font-black tracking-tight">Commander ou demander un devis</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {customerOffers.map((offer) => {
            const Icon = offer.icon;
            return (
              <article key={offer.title} className="flex flex-col rounded-3xl border border-border/70 bg-card p-6 shadow-sm">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-xl font-black">{offer.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
                <p className="mt-5 font-black text-foreground">{offer.price}</p>
                <Link to={offer.href} className="mt-4 inline-flex items-center gap-2 font-bold text-primary hover:underline">
                  {offer.action}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            );
          })}
        </div>
      </section>

      <section className="border-y border-border/60 bg-muted/40">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-primary">Professionnels</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight">Outils de lancement</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Ces tarifs de lancement sont validés par un devis précisant le périmètre, les contenus fournis et le délai.
            </p>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {professionalOffers.map((offer) => {
              const Icon = offer.icon;
              return (
                <article key={offer.title} className="flex flex-col rounded-3xl border border-border/70 bg-card p-6">
                  <Icon className="h-7 w-7 text-primary" />
                  <h3 className="mt-4 text-xl font-black">{offer.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{offer.description}</p>
                  <p className="mt-5 font-black">{offer.price}</p>
                  <a
                    href={whatsappOfferLink(offer.title)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex items-center gap-2 font-bold text-green-700 hover:underline"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Demander les détails
                  </a>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 rounded-3xl bg-foreground p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <h2 className="text-2xl font-black">Un besoin différent ?</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
              Décrivez votre projet, votre commune, votre délai et votre budget. DELIKREOL vous répondra avec la solution disponible ou un devis.
            </p>
          </div>
          <a
            href={whatsappOfferLink('une demande personnalisée')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 font-black text-primary-foreground"
          >
            Contacter DELIKREOL
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </section>
    </main>
  );
}
