import { lazy, Suspense, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  ShoppingBag,
  Handshake,
  FileText,
  MessageCircle,
  ChefHat,
  Truck,
  Clock,
  MapPin,
  ArrowRight,
  Utensils,
  Sparkles,
  Star,
  Users,
  Heart,
  Locate,
  Crosshair,
  Navigation,
  PenLine,
  Share2,
  ShieldCheck,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { mockProducts } from '../../data/mockCatalog';
import { PUBLIC_HIDDEN_PRODUCT_TRAITEURS, PUBLIC_HIDDEN_TRAITEURS, traiteurSpaces, formatEuro, type TraiteurSpace } from '../../data/traiteurs';
import { useToast } from '../../contexts/ToastContext';
import { isUsableThumbnail } from '../../services/catalogImageResolver';
import { resolveTraiteurCoords } from '../../services/partnerGeo';
import { HowItWorksCompact } from '../../components/HowItWorksCompact';
import { AutoCarousel } from '../../components/AutoCarousel';
import { ScrollCarousel } from '../../components/ScrollCarousel';
import { calculateDistanceKm, type Coords } from '../../services/geolocation';
import { LocationSelector } from '../../components/LocationSelector';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { setPageMeta } from '../../services/seo';
import { trackPublicView } from '../../services/metricsService';
import { loadLocalReviews } from './ReviewPage';
import type { ReviewItem } from './ReviewPage';

const ExpandableGeoMap = lazy(() => import('../../components/ExpandableGeoMap'));

const WHATSAPP_NUMBER = '596696653589';
const MADA_BADGE_TRAITEURS = new Set([
  "Saveurs d'Afrique",
  'Les Delices de Ninice',
  'Sweet Family Traiteur Orianne',
]);

function hasMadaBadge(traiteurName: string) {
  return MADA_BADGE_TRAITEURS.has(traiteurName);
}

const ALL_CATEGORIES = [
  { id: 'tous', name: 'Tous' },
  { id: 'plats', name: 'Plats' },
  { id: 'snacking', name: 'Snacking' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'boissons', name: 'Boissons' },
  { id: 'bowl', name: 'Bowl' },
  { id: 'pates', name: 'Pâtes' },
  { id: 'traiteur-evenementiel', name: 'Traiteur événementiel' },
  { id: 'commandes-entreprise', name: 'Commandes entreprise' },
];

// Demo fallback reviews — used until real approved reviews arrive from localStorage
const DEMO_REVIEWS: Array<{ initial: string; name: string; comment: string }> = [
  {
    initial: 'M',
    name: 'Marie-Line',
    comment: 'Le colombo de Ninice est un délice. Livré en 45 min à Ducos, parfait !',
  },
  {
    initial: 'J',
    name: 'Jean-Philippe',
    comment: "Commander les accras de Coco's Food pour une fête, tout le monde a adoré. Click & collect super pratique.",
  },
  {
    initial: 'S',
    name: 'Sandra',
    comment: "Je commande toutes les semaines chez Saveurs d'Afrique. Les plats sont toujours frais et les portions généreuses.",
  },
  {
    initial: 'P',
    name: 'Patrick',
    comment: "Le service traiteur événementiel au Marin, nickel. Livraison à l'heure, plat chaud. Je recommande.",
  },
];

function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const stored = loadLocalReviews().filter(r => r.status === 'approved');
    let homeReviews: ReviewItem[] = [];
    try {
      const homeStored = localStorage.getItem('delikreol_home_reviews');
      if (homeStored) {
        const parsed = JSON.parse(homeStored);
        if (Array.isArray(parsed)) homeReviews = parsed;
      }
    } catch { /* ignore */ }

    const realReviews = homeReviews.length > 0 ? homeReviews : stored;
    if (realReviews.length > 0) {
      setReviews(realReviews);
    }
    setLoaded(true);
  }, []);

  const displayReviews = reviews.length > 0
    ? reviews.map(r => ({
        initial: r.name.charAt(0).toUpperCase(),
        name: r.name,
        comment: r.comment,
        rating: r.rating,
      }))
    : DEMO_REVIEWS.map(r => ({ ...r, rating: 5 }));

  return (
    <div className="cardGrid grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {displayReviews.map((review, index) => (
        <div
          key={index}
          className="card bg-white rounded-[2rem] p-6 border border-primary/20 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold shrink-0">
              {review.initial}
            </div>
            <div>
              <p className="font-bold text-foreground">{review.name}</p>
              <div className="flex items-center gap-0.5" role="img" aria-label={`Note : ${review.rating} sur 5`}>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    aria-hidden="true"
                    className={`w-4 h-4 ${
                      i < review.rating ? 'fill-secondary text-secondary' : 'text-border-strong'
                    }`}
                  />
                ))}
                <span className="ml-1 text-xs text-muted-foreground">{review.rating}/5</span>
              </div>
            </div>
          </div>
          <p className="text-muted-foreground text-sm leading-relaxed italic">
            &ldquo;{review.comment}&rdquo;
          </p>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  useEffect(() => { trackPublicView(); }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const [shareFeedback, setShareFeedback] = useState('');
  const navigate = useNavigate();
  const { showSuccess } = useToast();

  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'denied'>('idle');
  const [geoPosition, setGeoPosition] = useState<Coords | null>(null);
  const [nearbyTraiteurs, setNearbyTraiteurs] = useState<Array<{ traiteur: TraiteurSpace; distance: number }>>([]);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedMode, setSelectedMode] = useState('tous');

  const featuredProducts = mockProducts.filter((p) => (
    p.featured && !PUBLIC_HIDDEN_TRAITEURS.has(p.vendor) && isUsableThumbnail(p.image)
    && !PUBLIC_HIDDEN_PRODUCT_TRAITEURS.has(p.vendor)
  ));
  // Ajouter les produits phares des traiteurs (featured menu items)
  const featuredTraiteurItems = traiteurSpaces.flatMap(space =>
    space.menuItems.filter(item => (
      item.featured && !PUBLIC_HIDDEN_PRODUCT_TRAITEURS.has(space.name) && isUsableThumbnail(item.image)
    )).map(item => ({
      ...item,
      vendor: space.name,
      zone: space.zone,
      image: item.image ?? space.heroImage ?? undefined,
      available: true,
      id: `${space.slug}-${item.name.toLowerCase().replace(/\\s+/g, '-')}`,
    }))
  );
  const allFeatured = [...featuredProducts, ...featuredTraiteurItems.filter(p => !featuredProducts.find(fp => fp.id === p.id))];
  // Tous les traiteurs confirmés sur l'accueil
  const featuredTraiteurs = traiteurSpaces.filter(t => t.status === 'public confirmé');
  const heroStats = [
    { value: `${featuredTraiteurs.length}`, label: 'traiteurs locaux', icon: ChefHat },
    { value: '34', label: 'communes couvertes', icon: MapPin },
    { value: '25+', label: 'produits visibles', icon: Utensils },
  ];
  const launchCards = [
    {
      title: 'Commander maintenant',
      description: 'Parcours court vers les plats disponibles, retrait ou livraison selon la commune.',
      to: '/catalogue',
      cta: 'Voir le catalogue',
      icon: ShoppingBag,
      tone: 'from-primary to-primary',
    },
    {
      title: 'Demande pro',
      description: 'Devis rapide pour entreprises, événements, santé, seniors et commandes groupées.',
      to: '/devis',
      cta: 'Créer une demande',
      icon: FileText,
      tone: 'from-success to-accent',
    },
    {
      title: 'Rejoindre DeliKreol',
      description: 'Traiteurs, points relais et livreurs peuvent entrer dans le réseau séparément.',
      to: '/devenir-partenaire',
      cta: 'Devenir partenaire',
      icon: Handshake,
      tone: 'from-foreground to-primary',
    },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalogue?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/catalogue');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: 'DeliKreol — plats créoles en Martinique',
      text: 'Découvre DeliKreol : plats créoles, traiteurs locaux, retrait ou livraison en Martinique.',
      url: 'https://delikreol.com/catalogue',
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        setShareFeedback('Partage ouvert');
        return;
      }
      await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
      setShareFeedback('Lien copié');
      showSuccess('Lien DeliKreol copié');
    } catch {
      setShareFeedback('');
    }
  };

  const handleFindNearby = () => {
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords: Coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setGeoPosition(coords);
        setGeoStatus('success');

        // Calculer distances pour tous les traiteurs
        const withDistance = traiteurSpaces
          .map((t) => {
            const lat = t.latitude ?? resolveTraiteurCoords(t.zone, t.commune)?.latitude;
            const lng = t.longitude ?? resolveTraiteurCoords(t.zone, t.commune)?.longitude;
            if (!lat || !lng) return null;
            return {
              traiteur: t,
              distance: calculateDistanceKm(coords, { latitude: lat, longitude: lng }),
            };
          })
          .filter((item): item is NonNullable<typeof item> => item !== null)
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 3);

        setNearbyTraiteurs(withDistance);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGeoStatus('denied');
        } else {
          setGeoStatus('denied');
        }
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  const handleCommuneSelect = (location: { commune: string; coords?: { latitude: number; longitude: number } }) => {
    setShowLocationSelector(false);
    if (location.coords) {
      setGeoPosition(location.coords);
      setGeoStatus('success');
      const withDistance = traiteurSpaces
        .filter((t) => t.latitude != null && t.longitude != null)
        .map((t) => ({
          traiteur: t,
          distance: calculateDistanceKm(location.coords!, {
            latitude: t.latitude!,
            longitude: t.longitude!,
          }),
        }))
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 3);
      setNearbyTraiteurs(withDistance);
    }
  };

  useEffect(() => {
    document.title = 'DeliKreol — Commandez créole local en Martinique | Livraison & Traiteur';
    setPageMeta(
      'DeliKreol — Commandez créole local en Martinique | Livraison & Traiteur',
      'Commande de plats créoles en Martinique. Traiteurs locaux, livraison et retrait. Commandez en ligne vos plats maison.',
      'livraison repas Martinique, traiteur Martinique, plats créoles, Delikreol, click and collect Martinique'
    );
  }, []);

  useEffect(() => {
    const upsertMeta = (attr: 'name' | 'property', key: string, content: string) => {
      const selector = `meta[${attr}="${key}"]`;
      let el = document.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Geotags Martinique
    upsertMeta('name', 'geo.position', '14.616065;-61.058906');
    upsertMeta('name', 'ICBM', '14.616065, -61.058906');
  }, []);

  return (
    <Layout>
      {/* Hero Section — concept moderne orienté conversion */}
      <section className="relative isolate overflow-hidden bg-background text-foreground">
        <div className="absolute inset-0">
          <img
            loading="eager"
            {...{ fetchpriority: 'high' }}
            decoding="async"
            src={`${import.meta.env.BASE_URL}branding/hero-tropical.png`}
            alt="Livraison DeliKreol en Martinique"
            className="h-full w-full object-cover object-center"
            width={714}
            height={720}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(251,146,60,0.14),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(16,185,129,0.1),transparent_24%),linear-gradient(90deg,rgba(255,253,248,0.98)_0%,rgba(255,249,239,0.94)_48%,rgba(255,253,248,0.38)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/85" />
        </div>

        <div className="relative mx-auto grid min-h-[calc(100svh-72px)] max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 md:min-h-[720px] md:py-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-primary/20 bg-white/70 px-4 py-2 text-[10px] font-black uppercase tracking-[0.12em] text-primary/90 shadow-sm backdrop-blur md:mb-5 md:bg-primary/[0.08] md:text-xs md:tracking-[0.22em]">
              <Sparkles className="h-3.5 w-3.5" />
              Livraison & retrait en Martinique
            </div>

            <h1 className="max-w-4xl text-[clamp(3rem,13vw,4.35rem)] font-black leading-[0.9] tracking-[-0.055em] text-accent sm:text-6xl lg:text-7xl">
              Commandez <span className="text-primary">créole local</span>
              <span className="mt-2 block text-[0.52em] leading-none tracking-[-0.035em] text-accent/90 sm:inline sm:text-inherit sm:text-accent">
                {' '}en Martinique
              </span>
            </h1>
            <p className="mt-5 max-w-2xl rounded-2xl bg-white/70 px-4 py-3 text-lg leading-7 text-foreground/75 shadow-sm backdrop-blur md:mt-6 md:bg-transparent md:px-0 md:py-0 md:text-xl md:leading-8 md:text-muted-foreground md:shadow-none">
              Plats maison, traiteurs locaux — livraison ou retrait.
            </p>

            <div className="mt-6 max-w-2xl rounded-[2rem] border border-primary/20 bg-white p-2 shadow-[0_22px_70px_-42px_rgba(42,25,15,0.65)] md:mt-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="flex min-h-[58px] flex-1 items-center gap-3 rounded-3xl bg-primary/[0.08] px-4 text-left">
                  <Search className="h-5 w-5 shrink-0 text-primary" />
                  <span className="sr-only">Choisir une commune</span>
                  <select
                    value={selectedCommune}
                    onChange={(e) => {
                      const nextCommune = e.target.value;
                      setSelectedCommune(nextCommune);
                      if (nextCommune) navigate(`/catalogue?commune=${encodeURIComponent(nextCommune)}`);
                    }}
                    className="w-full bg-transparent text-sm font-bold text-foreground outline-none"
                  >
                    <option value="">Choisir ma commune</option>
                    {martiniqueCommunes.slice(0, 34).map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <Link
                  to="/catalogue"
                  className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-3xl bg-primary px-6 text-sm font-black text-white shadow-lg shadow-primary/25 transition-all hover:-translate-y-0.5 hover:bg-primary"
                >
                  Commander maintenant
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/devis"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-primary/20 bg-white px-5 py-3 text-sm font-black text-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30"
              >
                <FileText className="h-4 w-4" />
                Demande pro
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, je veux lancer une commande DELIKREOL.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-success/[0.35] bg-success/10 px-5 py-3 text-sm font-black text-success shadow-sm transition-all hover:-translate-y-0.5 hover:bg-success/[0.15]"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp rapide
              </a>
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-secondary/30 bg-secondary/10 px-5 py-3 text-sm font-black text-secondary-foreground shadow-sm transition-all hover:-translate-y-0.5 hover:bg-secondary/15"
              >
                <Share2 className="h-4 w-4" />
                Partager
                {shareFeedback && <span className="text-xs font-bold opacity-75">· {shareFeedback}</span>}
              </button>
            </div>

            <div className="mt-9 grid max-w-2xl grid-cols-3 gap-3">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-3xl border border-primary/20 bg-white/90 p-4 shadow-sm backdrop-blur-xl">
                    <Icon className="mb-3 h-5 w-5 text-primary" />
                    <div className="text-2xl font-black text-accent">{stat.value}</div>
                    <div className="mt-1 text-xs font-semibold leading-snug text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>
            <div className="mt-5 grid max-w-2xl gap-2 text-sm font-bold text-foreground sm:grid-cols-3">
              {[
                'Commande préparée sur le site',
                'Confirmation humaine WhatsApp',
                'Aucun paiement public forcé',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 rounded-2xl border border-success/20 bg-white/90 px-3 py-2 shadow-sm">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -left-10 top-12 h-32 w-32 rounded-full bg-primary/20 blur-3xl" />
            <div className="absolute -right-8 bottom-12 h-40 w-40 rounded-full bg-success/20 blur-3xl" />
            <div className="relative rounded-[2.5rem] border border-primary/20 bg-white/[0.84] p-4 shadow-[0_32px_100px_-48px_rgba(42,25,15,0.72)] backdrop-blur-2xl">
              <div className="overflow-hidden rounded-[2rem] bg-white">
                <img
                  loading="lazy"
                  src={`${import.meta.env.BASE_URL}vendors/ninice/drive-reimport/IMG-20260521-WA0070.jpg`}
                  alt="Plat local DeliKreol"
                  className="h-[420px] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 left-8 right-8 rounded-[1.75rem] border border-primary/20 bg-white p-5 text-foreground shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">À commander</p>
                    <h2 className="mt-1 text-xl font-black">Colombo, accras, desserts pays</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Sélection locale, disponibilité vérifiée avec le prestataire.</p>
                  </div>
                  <div className="rounded-2xl bg-success/10 px-3 py-2 text-right">
                    <p className="text-xs font-bold text-success">Retrait</p>
                    <p className="text-sm font-black text-success">ou livraison</p>
                  </div>
                </div>
              </div>
              <div className="absolute -left-8 top-10 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl">
                <img
                  loading="lazy"
                  src={`${import.meta.env.BASE_URL}vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0156.jpg`}
                  alt="Traiteur partenaire DeliKreol"
                  className="h-32 w-32 object-cover"
                />
              </div>
              <div className="absolute -right-7 top-28 rounded-3xl border border-white/50 bg-white/90 p-4 text-foreground shadow-2xl backdrop-blur-xl">
                <Truck className="mb-2 h-6 w-6 text-primary" />
                <p className="text-sm font-black">Créneau planifié</p>
                <p className="text-xs text-muted-foreground">commande maîtrisée</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative -mt-10 pb-10 md:-mt-12 md:pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {launchCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.title}
                  to={card.to}
                  className="group rounded-[2rem] border border-primary/20 bg-white p-5 shadow-[0_18px_55px_-36px_rgba(42,25,15,0.55)] transition-all hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_28px_80px_-42px_rgba(42,25,15,0.7)]"
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-foreground">{card.title}</h2>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-muted-foreground">{card.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-primary">
                    {card.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 overflow-hidden rounded-[2.25rem] border border-secondary/30 bg-gradient-to-r from-secondary/20 via-white to-success/15 p-5 shadow-soft md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.22em] text-primary">À partager aujourd’hui</p>
                <h2 className="mt-1 text-2xl font-black text-foreground md:text-3xl">
                  Fais découvrir DeliKreol à quelqu’un qui commande local
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Le lien ouvre le catalogue directement. La commande reste simple : panier, téléphone, validation WhatsApp.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleShare}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-foreground px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary"
                >
                  <Share2 className="h-4 w-4" />
                  Partager le catalogue
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent('Découvre DeliKreol : plats créoles et traiteurs locaux en Martinique 👉 https://delikreol.com/catalogue')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-success px-6 py-3 text-sm font-black text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-success/90"
                >
                  <MessageCircle className="h-4 w-4" />
                  Envoyer sur WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[2.25rem] border border-primary/20 bg-white p-4 shadow-soft md:p-6">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-foreground md:text-4xl">À commander maintenant</h2>
                <p className="mt-2 text-muted-foreground">Meilleures ventes et plats disponibles dès le haut de page</p>
              </div>
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 self-start rounded-2xl bg-foreground px-5 py-3 text-sm font-black text-white transition-all hover:bg-primary md:self-auto"
              >
                Catalogue complet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <AutoCarousel items={allFeatured.slice(0, 12)} />
          </div>
        </div>
      </section>

      {/* 📍 Carte géolocalisation interactive */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-background via-white to-primary/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/[0.15] px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-primary/90">
              <Locate className="h-3.5 w-3.5" />
              Localisation
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-foreground mb-2">
              Traiteurs près de chez toi
            </h2>
            <p className="text-muted-foreground text-base">
              Active la géolocalisation pour voir les partenaires autour de toi sur la carte
            </p>
          </div>
          <Suspense
            fallback={
              <div className="rounded-2xl border border-primary/20 bg-white p-5 shadow-sm">
                <div className="h-5 w-48 rounded-full animate-shimmer" />
                <div className="mt-4 h-[320px] rounded-2xl animate-shimmer md:h-[420px]" />
              </div>
            }
          >
            <ExpandableGeoMap />
          </Suspense>
        </div>
      </section>

      {/* Featured Traiteurs */}
      {featuredTraiteurs.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-primary/10 via-white to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-2">
                  Nos traiteurs partenaires
                </h2>
                <p className="text-muted-foreground text-lg">
                  Des artisans locaux, passionnés et engagés
                </p>
              </div>
              <Link
                to="/catalogue"
                className="hidden md:flex items-center gap-2 text-primary font-bold hover:text-primary/90 transition-colors"
              >
                Voir tous
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ScrollCarousel>
              {featuredTraiteurs.map((traiteur) => (
                <Link
                  key={traiteur.slug}
                  to={`/traiteur/${traiteur.slug}`}
                  className="snap-start flex-shrink-0 w-[260px] sm:w-[290px] group bg-white rounded-[2rem] border border-primary/20 hover:border-primary/40 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <div className="h-36 relative overflow-hidden bg-muted">
                    {traiteur.heroImage && (
                      <img loading="lazy"
                        src={traiteur.heroImage}
                        alt={traiteur.name}
                        className="product-photo-natural w-full h-full object-cover"
                      />
                    )}
                    {hasMadaBadge(traiteur.name) && (
                      <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full border border-white/70 bg-white/95 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-primary shadow-lg">
                        <img
                          loading="lazy"
                          src={`${import.meta.env.BASE_URL}vendors/chef-a-mada/logo.jpg`}
                          alt="Écusson Chef à Mada"
                          className="h-6 w-6 rounded-full object-contain"
                        />
                        Écusson Chef à Mada
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
                    <div className="absolute inset-0 flex items-end p-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {traiteur.zone}
                      </div>
                    </div>
                    {/* Portrait */}
                    {traiteur.portraitImage && (
                      <div className="absolute -bottom-8 right-4">
                        <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                          <img loading="lazy" src={traiteur.portraitImage} alt={traiteur.name} className="product-photo-natural w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5 pt-10">
                    <h3 className="text-lg font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                      {traiteur.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{traiteur.description || traiteur.offer}</p>
                    {traiteur.menuItems.length > 0 && (
                      <p className="mb-3 line-clamp-1 text-xs font-semibold text-foreground/70">
                        {traiteur.menuItems.slice(0, 3).map((item) => item.name.replace(/\s+—.+$/, '')).join(' · ')}
                      </p>
                    )}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      {traiteur.startingAt > 0 && (
                        <span className="font-semibold text-primary">
                          À partir de {formatEuro(traiteur.startingAt)}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {traiteur.turnaround}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </ScrollCarousel>
            <div className="text-center mt-8 md:hidden">
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 text-primary font-bold hover:text-primary/90 transition-colors"
              >
                Voir tous les traiteurs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Quick Links */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-primary/10 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-3">
              Catégories
            </h2>
            <p className="text-muted-foreground text-lg">Explorez par type de cuisine</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {ALL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue?cat=${cat.id}`}
                className="px-6 py-3 bg-white hover:bg-primary/[0.08] text-foreground hover:text-primary font-bold rounded-2xl border border-primary/20 hover:border-primary/40 transition-all hover:-translate-y-0.5 shadow-sm text-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Le meilleur est à venir */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-stone-950 via-accent to-primary text-white">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-success/[0.15] blur-3xl" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Le meilleur est à venir
            </h2>
            <p className="text-lg text-white/70 leading-relaxed">
              DeliKreol grandit chaque jour. De nouveaux traiteurs, de nouvelles communes, de nouvelles saveurs rejoignent la plateforme.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: ChefHat, label: 'Traiteurs partenaires', value: `${traiteurSpaces.length}` },
              { icon: MapPin, label: 'Communes Martinique', value: '34' },
              { icon: Users, label: 'Commandes traitées', value: 'Bientôt' },
              { icon: Heart, label: 'Produits au catalogue', value: '25+' },
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center p-6 rounded-[1.75rem] border border-white/10 bg-white/10 backdrop-blur-sm">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-secondary" />
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pourquoi Delikreol */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-3">
              Pourquoi Delikreol
            </h2>
            <p className="text-muted-foreground text-lg">La plateforme martiniquaise qui valorise nos producteurs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-[2rem] p-8 border border-primary/20 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-primary/[0.15] text-primary flex items-center justify-center mx-auto mb-5">
                <ChefHat className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Produits locaux</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Des plats préparés par des traiteurs martiniquais avec des ingrédients frais et locaux. 
                Manger créole, c'est soutenir l'économie de l'île.
              </p>
            </div>
            <div className="bg-white rounded-[2rem] p-8 border border-primary/20 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-secondary/15 text-secondary flex items-center justify-center mx-auto mb-5">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Livraison programmée</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Choisissez votre créneau. Retrait chez le traiteur, point relais ou livraison 
                selon votre commune. Vous décidez.
              </p>
            </div>
            <div className="bg-white rounded-[2rem] p-8 border border-primary/20 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">Support WhatsApp</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Une question ? Un souci avec votre commande ? Contactez-nous directement 
                sur WhatsApp. Réponse rapide, service humain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ils nous ont rejoints */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-3">
              Ils nous ont rejoints
            </h2>
            <p className="text-muted-foreground text-lg">
              Des traiteurs martiniquais déjà partenaires DeliKreol
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {([
              { name: 'Ninice', slug: 'ninice', image: `${import.meta.env.BASE_URL}vendors/ninice/drive-reimport/IMG-20260521-WA0070.jpg` },
              { name: "Coco's Food", slug: 'coco', image: `${import.meta.env.BASE_URL}vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg` },
              { name: "Saveurs d'Afrique", slug: 'saveurs-afrique', image: `${import.meta.env.BASE_URL}vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0156.jpg` },
              { name: 'Snack Save Peyi\'A', slug: 'save-peyia', image: `${import.meta.env.BASE_URL}vendors/save-peyia/drive-reimport/IMG-20260710-WA0008.jpg` },
            ] as const).map((caterer) => (
              <Link
                key={caterer.slug}
                to={`/traiteur/${caterer.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-[1.75rem] bg-primary/[0.08] border border-primary/20 hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg transition-all text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-colors bg-white shadow-sm">
                                  <img loading="lazy"
                                     src={caterer.image}
                                     alt={caterer.name}
                                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                   />
                </div>
                <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">
                  {caterer.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Avis clients — Ce que disent nos clients */}
            <section className="py-16 md:py-24 bg-gradient-to-b from-white to-primary/5">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-10">
                  <h2 className="sectionTitle text-3xl md:text-5xl font-black tracking-tight text-foreground mb-3">
                    Ce que disent nos clients
                  </h2>
                  <p className="text-muted-foreground text-lg">
                    Des avis de Martiniquais comme vous
                  </p>
                </div>
                <ReviewsSection />
                <div className="mt-8 text-center">
                  <Link
                    to="/avis"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary text-white font-bold rounded-xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-sm"
                  >
                    <PenLine className="w-4 h-4" />
                    Donnez votre avis
                  </Link>
                </div>
              </div>
            </section>

      {/* ═══════════════════════════════════════════
          LIVRAISON SPÉCIALE & SERVICES SANTÉ
          ═══════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-success/10 text-success rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span>💚</span>
              Services spéciaux
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-foreground tracking-tight mb-3">
              Livraison adaptée à vos besoins
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Des solutions de livraison sur mesure pour les établissements de santé, les seniors et les zones insulaires
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Carte 1 — Livraison retraite */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[2rem] border border-blue-100 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl mb-4 shadow-md">
                🏠
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">Livraison retraite</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Livraison adaptée aux <strong>maisons de retraite</strong> et <strong>EHPAD</strong>.
                Repas en portions adaptées, commandes groupées, livraison en matinée.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {traiteurSpaces.filter(t => t.deliveryOptions?.includes('retraite')).slice(0, 3).map(t => (
                  <Link key={t.slug} to={`/?view=traiteurs&vendor=${t.slug}`}
                    className="text-xs px-2 py-1 bg-white rounded-lg font-semibold text-blue-600 hover:bg-blue-500 hover:text-white transition-all">
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Carte 2 — Partenariat infirmier */}
            <div className="p-6 bg-gradient-to-br from-success/10 to-accent/10 rounded-[2rem] border border-success/[0.35] hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-success text-white flex items-center justify-center text-2xl mb-4 shadow-md">
                🩺
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">Partenariat infirmier</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                En lien avec les <strong>infirmiers libéraux</strong> et professions médicales.
                Repas adaptés, livraison programmée, suivi personnalisé.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {traiteurSpaces.filter(t => t.deliveryOptions?.includes('infirmiere')).slice(0, 3).map(t => (
                  <Link key={t.slug} to={`/?view=traiteurs&vendor=${t.slug}`}
                    className="text-xs px-2 py-1 bg-white rounded-lg font-semibold text-success hover:bg-success hover:text-white transition-all">
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Carte 3 — Livraison bateau */}
            <div className="p-6 bg-gradient-to-br from-cyan-50 to-cyan-100/50 rounded-[2rem] border border-cyan-100 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500 text-white flex items-center justify-center text-2xl mb-4 shadow-md">
                🚤
              </div>
              <h3 className="text-xl font-black text-foreground mb-2">Livraison bateau</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                Livraison vers les <strong>zones insulaires</strong> et îles environnantes.
                Transport maritime organisé pour les commandes groupes.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {traiteurSpaces.filter(t => t.deliveryOptions?.includes('bateau')).slice(0, 3).map(t => (
                  <Link key={t.slug} to={`/?view=traiteurs&vendor=${t.slug}`}
                    className="text-xs px-2 py-1 bg-white rounded-lg font-semibold text-cyan-600 hover:bg-cyan-500 hover:text-white transition-all">
                    {t.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8 text-center">
            <Link
              to="/catalogue"
              className="inline-flex items-center gap-2 px-6 py-3 bg-success hover:bg-success/90 text-white font-bold rounded-xl transition-all"
            >
              <span>💚</span>
              Voir tous les filtres santé
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche — placé en bas pour garder les ventes en haut */}
      <HowItWorksCompact />

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-stone-950 via-accent to-primary px-6 py-12 text-center text-white shadow-[0_32px_100px_-55px_rgba(42,25,15,0.75)] md:px-12 md:py-16">
            <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-primary/25 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-success/[0.15] blur-3xl" />
            <div className="relative mx-auto max-w-3xl">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
                Prêt à commander ?
              </h2>
              <p className="text-white/70 text-lg mb-8 leading-relaxed">
                Choisissez un plat ou un traiteur, indiquez votre commune, puis DeliKreol vérifie la disponibilité avec le prestataire.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/catalogue"
                  className="flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-primary/20 text-lg"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Voir le catalogue
                </Link>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur DELIKREOL.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 text-lg"
                >
                  <MessageCircle className="w-5 h-5" fill="white" />
                  Support WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
