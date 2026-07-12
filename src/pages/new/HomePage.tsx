import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ChefHat,
  Clock,
  FileText,
  Handshake,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Store,
  Truck,
  Users,
  Utensils,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { SmartImage } from '../../components/SmartImage';
import { AutoCarousel } from '../../components/AutoCarousel';
import { ScrollCarousel } from '../../components/ScrollCarousel';
import { HowItWorksCompact } from '../../components/HowItWorksCompact';
import ExpandableGeoMap from '../../components/ExpandableGeoMap';
import { mockProducts } from '../../data/mockCatalog';
import { formatEuro, traiteurSpaces } from '../../data/traiteurs';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { setPageMeta } from '../../services/seo';
import { trackPublicView } from '../../services/metricsService';
import { loadLocalReviews } from './ReviewPage';
import type { ReviewItem } from './ReviewPage';

const WHATSAPP_NUMBER = '596696653589';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Bonjour, je souhaite être accompagné pour une commande DeliKreol.'
)}`;

const journeyCards = [
  {
    title: 'Je veux commander',
    description: 'Découvrez les plats, choisissez votre partenaire et préparez votre demande en quelques minutes.',
    to: '/catalogue',
    cta: 'Voir le catalogue',
    icon: ShoppingBag,
    tone: 'bg-primary text-primary-foreground',
  },
  {
    title: 'J’ai un besoin professionnel',
    description: 'Entreprise, événement, association ou commande groupée : recevez une proposition adaptée.',
    to: '/devis',
    cta: 'Demander un devis',
    icon: Building2,
    tone: 'bg-accent text-accent-foreground',
  },
  {
    title: 'Je veux rejoindre le réseau',
    description: 'Traiteurs, producteurs, livreurs et points relais peuvent présenter leur activité à DeliKreol.',
    to: '/devenir-partenaire',
    cta: 'Devenir partenaire',
    icon: Handshake,
    tone: 'bg-foreground text-background',
  },
];

const trustItems = [
  {
    icon: CheckCircle2,
    title: 'Disponibilité confirmée',
    text: 'La demande est vérifiée avec le partenaire avant validation définitive.',
  },
  {
    icon: Truck,
    title: 'Retrait ou livraison',
    text: 'Le mode et le créneau sont définis selon la commune et les possibilités du partenaire.',
  },
  {
    icon: MessageCircle,
    title: 'Accompagnement local',
    text: 'Une question ou une demande particulière ? DeliKreol reste joignable sur WhatsApp.',
  },
];

export default function HomePage() {
  const [selectedCommune, setSelectedCommune] = useState('');
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  useEffect(() => {
    trackPublicView();
    setPageMeta(
      'DeliKreol — Plats locaux, traiteurs et livraison en Martinique',
      'Découvrez les traiteurs et produits locaux de Martinique. Commande, devis professionnel, retrait et livraison selon disponibilité.',
      'traiteur Martinique, plats créoles, livraison repas Martinique, produits locaux, devis traiteur'
    );
    document.title = 'DeliKreol — Le goût local en Martinique';

    const approvedReviews = loadLocalReviews()
      .filter((review) => review.status === 'approved')
      .slice(0, 3);
    setReviews(approvedReviews);
  }, []);

  const publicPartners = useMemo(
    () => traiteurSpaces.filter((space) => space.status === 'public confirmé'),
    []
  );

  const featuredCatalogue = useMemo(() => {
    const directProducts = mockProducts
      .filter((product) => product.featured && product.image)
      .map((product) => ({
        image: product.image ?? undefined,
        name: product.name,
        vendor: product.vendor,
        price: product.price,
        category: product.category,
      }));

    const partnerProducts = publicPartners.flatMap((space) =>
      space.menuItems
        .filter((item) => item.featured && item.image)
        .map((item) => ({
          image: item.image ?? undefined,
          name: item.name,
          vendor: space.name,
          price: item.price,
          category: item.category,
        }))
    );

    const seen = new Set<string>();
    return [...directProducts, ...partnerProducts]
      .filter((item) => {
        const key = `${item.vendor}-${item.name}`.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 12);
  }, [publicPartners]);

  const catalogueCount = useMemo(
    () => publicPartners.reduce((total, partner) => total + partner.menuItems.length, 0),
    [publicPartners]
  );

  const catalogueTarget = selectedCommune
    ? `/catalogue?commune=${encodeURIComponent(selectedCommune)}`
    : '/catalogue';

  return (
    <Layout>
      <main>
        <section className="relative isolate overflow-hidden bg-background">
          <div className="absolute inset-0" aria-hidden="true">
            <SmartImage
              src={`${import.meta.env.BASE_URL}branding/hero-tropical.png`}
              alt=""
              decorative
              kind="ambient"
              priority
              containerClassName="h-full w-full"
              imgClassName="opacity-35"
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,hsl(var(--background))_0%,hsl(var(--background)/0.96)_46%,hsl(var(--background)/0.56)_100%)]" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
          </div>

          <div className="relative mx-auto grid min-h-[700px] max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)] lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-white/90 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-primary shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Marketplace locale · Martinique
              </div>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.96] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
                Le goût local,
                <span className="block text-primary">simple à commander.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground md:text-xl">
                Plats maison, produits locaux et prestations traiteur. DeliKreol met en relation clients,
                professionnels et partenaires de Martinique dans un parcours clair et humain.
              </p>

              <div className="mt-8 max-w-2xl rounded-[2rem] border border-primary/20 bg-white p-2 shadow-elegant">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <label className="flex min-h-[58px] flex-1 items-center gap-3 rounded-3xl bg-primary/5 px-4">
                    <Search className="h-5 w-5 shrink-0 text-primary" />
                    <span className="sr-only">Choisir une commune</span>
                    <select
                      value={selectedCommune}
                      onChange={(event) => setSelectedCommune(event.target.value)}
                      className="w-full bg-transparent text-sm font-bold text-foreground outline-none"
                    >
                      <option value="">Toutes les communes</option>
                      {martiniqueCommunes.map((commune) => (
                        <option key={commune.name} value={commune.name}>
                          {commune.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <Link
                    to={catalogueTarget}
                    className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-3xl bg-primary px-6 text-sm font-black text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    Voir les offres
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/devis"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border bg-white px-5 py-3 text-sm font-black text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/35 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <FileText className="h-4 w-4 text-primary" />
                  Demande professionnelle
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-accent/20 bg-accent/10 px-5 py-3 text-sm font-black text-accent shadow-sm transition-all hover:-translate-y-0.5 hover:bg-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <MessageCircle className="h-4 w-4" />
                  Parler à DeliKreol
                </a>
              </div>

              <div className="mt-9 grid max-w-2xl grid-cols-3 gap-3">
                {[
                  { value: publicPartners.length, label: 'partenaires présentés', icon: ChefHat },
                  { value: martiniqueCommunes.length, label: 'communes référencées', icon: MapPin },
                  { value: `${catalogueCount}+`, label: 'offres visibles', icon: Utensils },
                ].map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="rounded-3xl border border-border bg-white/90 p-4 shadow-sm backdrop-blur">
                      <Icon className="mb-3 h-5 w-5 text-primary" />
                      <div className="text-2xl font-black text-foreground">{stat.value}</div>
                      <div className="mt-1 text-xs font-semibold leading-snug text-muted-foreground">{stat.label}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute -left-10 top-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
              <div className="absolute -right-8 bottom-12 h-40 w-40 rounded-full bg-accent/20 blur-3xl" />
              <div className="relative rounded-[2.5rem] border border-primary/20 bg-white/80 p-4 shadow-elegant backdrop-blur-xl">
                <SmartImage
                  src={`${import.meta.env.BASE_URL}vendors/ninice/ninice-01-showcase.jpg`}
                  alt="Plat local proposé sur DeliKreol"
                  kind="food"
                  loading="eager"
                  aspectRatio="4 / 5"
                  containerClassName="h-[500px] w-full rounded-[2rem]"
                  imgClassName="rounded-[2rem]"
                  sizes="460px"
                />

                <div className="absolute bottom-8 left-8 right-8 rounded-[1.75rem] border border-white/70 bg-white/95 p-5 text-foreground shadow-2xl backdrop-blur">
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Sélection locale</p>
                  <h2 className="mt-1 text-xl font-black">Des offres présentées par partenaire</h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Prix, commune et disponibilité sont affichés avant la demande.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative -mt-8 pb-14 md:-mt-10 md:pb-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-3">
              {journeyCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to={card.to}
                    className="group rounded-[2rem] border border-border bg-white p-6 shadow-soft transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl shadow-sm ${card.tone}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-black text-foreground">{card.title}</h2>
                    <p className="mt-2 min-h-[72px] text-sm leading-6 text-muted-foreground">{card.description}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                      {card.cta}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {featuredCatalogue.length > 0 && (
          <section className="py-14 md:py-20">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">À découvrir</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-5xl">
                    Une sélection qui donne envie
                  </h2>
                  <p className="mt-2 text-lg text-muted-foreground">Des produits et plats issus des catalogues partenaires.</p>
                </div>
                <Link to="/catalogue" className="inline-flex items-center gap-2 self-start text-sm font-black text-primary hover:underline md:self-auto">
                  Catalogue complet
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <AutoCarousel items={featuredCatalogue} />
            </div>
          </section>
        )}

        {publicPartners.length > 0 && (
          <section className="bg-white py-16 md:py-24">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Le réseau</p>
                  <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-5xl">
                    Nos partenaires publics
                  </h2>
                  <p className="mt-2 text-lg text-muted-foreground">Chaque fiche présente son offre, sa zone et ses modalités.</p>
                </div>
                <Link to="/traiteurs" className="inline-flex items-center gap-2 self-start text-sm font-black text-primary hover:underline md:self-auto">
                  Voir tous les partenaires
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <ScrollCarousel>
                {publicPartners.map((partner) => (
                  <Link
                    key={partner.slug}
                    to={`/traiteur/${partner.slug}`}
                    className="group w-[280px] flex-shrink-0 snap-start overflow-hidden rounded-[2rem] border border-border bg-card shadow-soft transition-all hover:-translate-y-1 hover:border-primary/35 hover:shadow-elegant focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-[320px]"
                  >
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {partner.heroImage ? (
                        <SmartImage
                          src={partner.heroImage}
                          alt={`Univers de ${partner.name}`}
                          kind="food"
                          containerClassName="h-full w-full"
                          imgClassName="group-hover:scale-[1.04]"
                          sizes="320px"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                          <Store className="h-10 w-10" />
                        </div>
                      )}
                      <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-success shadow-sm">
                        Partenaire présenté
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-black text-foreground transition-colors group-hover:text-primary">{partner.name}</h3>
                          <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-primary" />
                            {partner.commune || partner.zone}
                          </p>
                        </div>
                        {partner.portraitImage && (
                          <SmartImage
                            src={partner.portraitImage}
                            alt={`Portrait de ${partner.name}`}
                            kind="portrait"
                            width={52}
                            height={52}
                            containerClassName="h-13 w-13 shrink-0 rounded-full border-2 border-white shadow-md"
                            imgClassName="rounded-full"
                          />
                        )}
                      </div>

                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">{partner.offer}</p>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-4 text-xs font-bold">
                        <span className="text-primary">
                          {partner.startingAt > 0 ? `À partir de ${formatEuro(partner.startingAt)}` : 'Tarif sur demande'}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {partner.turnaround}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </ScrollCarousel>
            </div>
          </section>
        )}

        <HowItWorksCompact />

        <section className="bg-gradient-to-b from-background to-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-primary">Proximité</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-5xl">
                Repérez les acteurs autour de vous
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
                Consultez la carte et ouvrez la fiche du partenaire correspondant à votre besoin.
              </p>
            </div>
            <ExpandableGeoMap />
          </div>
        </section>

        <section className="bg-white py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-10 text-center">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-accent">Confiance</p>
              <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-5xl">
                Un parcours transparent
              </h2>
              <p className="mx-auto mt-3 max-w-2xl text-lg text-muted-foreground">
                Pas de faux avis ni de promesse automatique : les informations importantes sont confirmées avant la commande.
              </p>
            </div>

            {reviews.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-3">
                {reviews.map((review) => (
                  <article key={review.id} className="rounded-[2rem] border border-border bg-card p-6 shadow-soft">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-black text-primary-foreground">
                          {review.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-black text-foreground">{review.name}</h3>
                          <p className="text-xs text-muted-foreground">Avis approuvé</p>
                        </div>
                      </div>
                      <div className="flex" aria-label={`${review.rating} étoiles sur 5`}>
                        {Array.from({ length: 5 }).map((_, index) => (
                          <Star
                            key={index}
                            className={`h-4 w-4 ${
                              index < review.rating ? 'fill-secondary text-secondary' : 'text-border'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="mt-4 text-sm italic leading-6 text-muted-foreground">“{review.comment}”</p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                {trustItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <article key={item.title} className="rounded-[2rem] border border-border bg-card p-7 text-center shadow-soft">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="mt-5 text-xl font-black text-foreground">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.text}</p>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-accent to-primary py-16 text-white md:py-24">
          <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-primary/30 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-secondary/20 blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-5xl px-4 text-center sm:px-6 lg:px-8">
            <HeartHandshake className="mx-auto h-12 w-12 text-secondary" />
            <h2 className="mt-5 text-3xl font-black tracking-tight md:text-5xl">
              Une plateforme utile aux clients comme aux partenaires
            </h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg leading-8 text-white/80">
              Vous souhaitez commander, organiser un événement ou présenter votre activité ? Choisissez le parcours qui vous correspond.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/catalogue"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary px-6 py-3.5 text-sm font-black text-primary-foreground shadow-lg transition-all hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <ShoppingBag className="h-4 w-4" />
                Commander
              </Link>
              <Link
                to="/devenir-partenaire"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-black text-white transition-all hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
              >
                <Users className="h-4 w-4" />
                Rejoindre DeliKreol
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
