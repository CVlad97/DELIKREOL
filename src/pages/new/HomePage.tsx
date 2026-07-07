import { useState, useEffect } from 'react';
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
  Plus,
  Sparkles,
  Star,
  Users,
  Heart,
  Locate,
  Crosshair,
  Navigation,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { mockProducts, type LocalProduct } from '../../data/mockCatalog';
import { traiteurSpaces, formatEuro, type TraiteurSpace } from '../../data/traiteurs';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import type { Product } from '../../lib/supabase';
import { resolveTraiteurCoords } from '../../services/partnerGeo';
import { HowItWorksCompact } from '../../components/HowItWorksCompact';
import { AutoCarousel } from '../../components/AutoCarousel';
import { ScrollCarousel } from '../../components/ScrollCarousel';
import { calculateDistanceKm, type Coords } from '../../services/geolocation';
import { LocationSelector } from '../../components/LocationSelector';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { setPageMeta } from '../../services/seo';
import { trackPublicView } from '../../services/metricsService';

const WHATSAPP_NUMBER = '596696653589';

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

function localProductToCartProduct(p: LocalProduct): Product {
  return {
    id: p.id,
    vendor_id: p.vendor,
    name: p.name,
    description: p.description ?? null,
    category: p.category,
    price: p.price,
    image_url: p.image ?? null,
    is_available: p.available !== false,
    stock_quantity: null,
    created_at: new Date().toISOString(),
  };
}

export default function HomePage() {
  useEffect(() => { trackPublicView(); }, []);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showSuccess } = useToast();

  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'denied'>('idle');
  const [geoPosition, setGeoPosition] = useState<Coords | null>(null);
  const [nearbyTraiteurs, setNearbyTraiteurs] = useState<Array<{ traiteur: TraiteurSpace; distance: number }>>([]);
  const [showLocationSelector, setShowLocationSelector] = useState(false);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [selectedMode, setSelectedMode] = useState('tous');

  const featuredProducts = mockProducts.filter((p) => p.featured);
  // Ajouter les produits phares des traiteurs (featured menu items)
  const featuredTraiteurItems = traiteurSpaces.flatMap(space =>
    space.menuItems.filter(item => item.featured).map(item => ({
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
      tone: 'from-orange-500 to-amber-500',
    },
    {
      title: 'Demande pro',
      description: 'Devis rapide pour entreprises, événements, santé, seniors et commandes groupées.',
      to: '/devis',
      cta: 'Créer une demande',
      icon: FileText,
      tone: 'from-emerald-600 to-teal-500',
    },
    {
      title: 'Rejoindre DeliKreol',
      description: 'Traiteurs, points relais et livreurs peuvent entrer dans le réseau séparément.',
      to: '/devenir-partenaire',
      cta: 'Devenir partenaire',
      icon: Handshake,
      tone: 'from-stone-900 to-orange-700',
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

  const handleAddToCart = (product: LocalProduct) => {
    addItem(localProductToCartProduct(product));
    showSuccess(`${product.name} ajouté au panier`);
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
      <section className="relative isolate overflow-hidden bg-[#fffdf8] text-stone-950">
        <div className="absolute inset-0">
          <img
            loading="lazy"
            src={`${import.meta.env.BASE_URL}branding/hero-tropical.png`}
            alt="Livraison DeliKreol en Martinique"
            className="h-full w-full object-cover object-center opacity-32 lg:opacity-55"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(251,146,60,0.14),transparent_28%),radial-gradient(circle_at_86%_20%,rgba(16,185,129,0.1),transparent_24%),linear-gradient(90deg,rgba(255,253,248,0.98)_0%,rgba(255,249,239,0.94)_48%,rgba(255,253,248,0.38)_100%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/85" />
        </div>

        <div className="relative mx-auto grid min-h-[720px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1.08fr)_minmax(360px,0.92fr)] lg:px-8 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-orange-700 shadow-sm">
              <Sparkles className="h-3.5 w-3.5" />
              Livraison & retrait en Martinique
            </div>

            <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-emerald-950 sm:text-6xl lg:text-7xl">
              Commandez <span className="text-orange-600">créole local</span> en Martinique
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-600 md:text-xl">
              Plats maison, traiteurs locaux — livraison ou retrait.
            </p>

            <div className="mt-8 max-w-2xl rounded-[2rem] border border-orange-100 bg-white p-2 shadow-[0_22px_70px_-42px_rgba(42,25,15,0.65)]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="flex min-h-[58px] flex-1 items-center gap-3 rounded-3xl bg-orange-50/80 px-4 text-left">
                  <Search className="h-5 w-5 shrink-0 text-orange-500" />
                  <span className="sr-only">Choisir une commune</span>
                  <select
                    value={selectedCommune}
                    onChange={(e) => {
                      const nextCommune = e.target.value;
                      setSelectedCommune(nextCommune);
                      if (nextCommune) navigate(`/catalogue?commune=${encodeURIComponent(nextCommune)}`);
                    }}
                    className="w-full bg-transparent text-sm font-bold text-stone-800 outline-none"
                  >
                    <option value="">Choisir ma commune</option>
                    {martiniqueCommunes.slice(0, 34).map((c) => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </label>
                <Link
                  to="/catalogue"
                  className="inline-flex min-h-[58px] items-center justify-center gap-2 rounded-3xl bg-orange-500 px-6 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition-all hover:-translate-y-0.5 hover:bg-orange-600"
                >
                  Commander maintenant
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/devis"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-100 bg-white px-5 py-3 text-sm font-black text-stone-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-orange-200"
              >
                <FileText className="h-4 w-4" />
                Demande pro
              </Link>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, je veux lancer une commande DELIKREOL.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-3 text-sm font-black text-emerald-800 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp rapide
              </a>
            </div>

            <div className="mt-9 grid max-w-2xl grid-cols-3 gap-3">
              {heroStats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="rounded-3xl border border-orange-100 bg-white/90 p-4 shadow-sm backdrop-blur-xl">
                    <Icon className="mb-3 h-5 w-5 text-orange-500" />
                    <div className="text-2xl font-black text-emerald-950">{stat.value}</div>
                    <div className="mt-1 text-xs font-semibold leading-snug text-stone-500">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute -left-10 top-12 h-32 w-32 rounded-full bg-orange-400/20 blur-3xl" />
            <div className="absolute -right-8 bottom-12 h-40 w-40 rounded-full bg-emerald-400/20 blur-3xl" />
            <div className="relative rounded-[2.5rem] border border-orange-100 bg-white/72 p-4 shadow-[0_32px_100px_-48px_rgba(42,25,15,0.72)] backdrop-blur-2xl">
              <div className="overflow-hidden rounded-[2rem] bg-white">
                <img
                  loading="lazy"
                  src={`${import.meta.env.BASE_URL}vendors/ninice/ninice-01-showcase.jpg`}
                  alt="Plat local DeliKreol"
                  className="h-[420px] w-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 left-8 right-8 rounded-[1.75rem] border border-orange-100 bg-white p-5 text-stone-900 shadow-2xl">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-orange-500">À commander</p>
                    <h2 className="mt-1 text-xl font-black">Colombo, accras, desserts pays</h2>
                    <p className="mt-1 text-sm text-stone-500">Sélection locale, disponibilité vérifiée avec le prestataire.</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-right">
                    <p className="text-xs font-bold text-emerald-700">Retrait</p>
                    <p className="text-sm font-black text-emerald-900">ou livraison</p>
                  </div>
                </div>
              </div>
              <div className="absolute -left-8 top-10 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-2xl">
                <img
                  loading="lazy"
                  src={`${import.meta.env.BASE_URL}vendors/saveurs-afrique/saveurs-afrique-board.jpg`}
                  alt="Traiteur partenaire DeliKreol"
                  className="h-32 w-32 object-cover"
                />
              </div>
              <div className="absolute -right-7 top-28 rounded-3xl border border-white/50 bg-white/90 p-4 text-stone-900 shadow-2xl backdrop-blur-xl">
                <Truck className="mb-2 h-6 w-6 text-orange-500" />
                <p className="text-sm font-black">Créneau planifié</p>
                <p className="text-xs text-stone-500">commande maîtrisée</p>
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
                  className="group rounded-[2rem] border border-orange-100 bg-white p-5 shadow-[0_18px_55px_-36px_rgba(42,25,15,0.55)] transition-all hover:-translate-y-1 hover:border-orange-200 hover:shadow-[0_28px_80px_-42px_rgba(42,25,15,0.7)]"
                >
                  <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.tone} text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-stone-950">{card.title}</h2>
                  <p className="mt-2 min-h-[48px] text-sm leading-6 text-stone-500">{card.description}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-sm font-black text-orange-600">
                    {card.cta}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 rounded-[2.25rem] border border-orange-100 bg-white p-4 shadow-soft md:p-6">
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
              <div>
                <h2 className="text-3xl font-black tracking-tight text-stone-950 md:text-4xl">À commander maintenant</h2>
                <p className="mt-2 text-stone-500">Entrées, plats et desserts — les préférés de nos clients</p>
              </div>
              <Link
                to="/catalogue"
                className="inline-flex items-center gap-2 self-start rounded-2xl bg-stone-950 px-5 py-3 text-sm font-black text-white transition-all hover:bg-orange-600 md:self-auto"
              >
                Catalogue complet
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <AutoCarousel items={featuredProducts.slice(0, 12)} />
          </div>
        </div>
      </section>

      {/* 📍 Traiteurs près de chez moi */}
      <section className="py-14 md:py-20 bg-gradient-to-b from-background via-white to-orange-50/45">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-orange-700">
              <Locate className="h-3.5 w-3.5" />
              Localisation
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
              Traiteurs près de chez toi
            </h2>
            <p className="text-gray-500 text-base">
              Trouve les traiteurs DeliKreol les plus proches de ta position
            </p>
          </div>

          {geoStatus === 'idle' && !showLocationSelector && (
            <div className="text-center rounded-[2.25rem] border border-orange-100 bg-white p-8 shadow-soft">
              <button
                onClick={handleFindNearby}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-orange-200 text-base"
              >
                <Locate className="w-5 h-5" />
                📍 Trouver les traiteurs près de chez moi
              </button>
            </div>
          )}

          {geoStatus === 'loading' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-orange-50 rounded-2xl">
                <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-orange-700 font-semibold">
                  Recherche de ta position…
                </span>
              </div>
            </div>
          )}

          {geoStatus === 'denied' && !showLocationSelector && (
            <div className="text-center py-8">
              <div className="inline-flex flex-col items-center gap-4 px-8 py-7 bg-white rounded-[2rem] border border-amber-200 max-w-lg mx-auto shadow-soft">
                <MapPin className="w-8 h-8 text-amber-600" />
                <p className="text-amber-800 font-semibold">
                  Active ta position pour voir les traiteurs près de chez toi
                </p>
                <p className="text-sm text-amber-600">
                  Nous utilisons ta position uniquement pour estimer les distances.
                </p>
                <button
                  onClick={() => setShowLocationSelector(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all text-sm"
                >
                  <MapPin className="w-4 h-4" />
                  Sélectionner une commune
                </button>
              </div>
            </div>
          )}

          {showLocationSelector && (
            <div className="max-w-md mx-auto">
              <LocationSelector onSelect={handleCommuneSelect} compact />
              <div className="text-center mt-4">
                <button
                  onClick={() => setShowLocationSelector(false)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {geoStatus === 'success' && (
            <div>
              {nearbyTraiteurs.length > 0 ? (
                <>
                  <div className="grid md:grid-cols-3 gap-5 mb-8">
                    {nearbyTraiteurs.map(({ traiteur, distance }) => (
                      <Link
                        key={traiteur.slug}
                        to={`/traiteur/${traiteur.slug}`}
                        className="card group bg-white rounded-[2rem] border border-orange-100 hover:border-orange-300 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all"
                      >
                        <div className={`h-32 bg-gradient-to-br ${traiteur.gradient} relative overflow-hidden`}>
                          {traiteur.heroImage && (
                            <img loading="lazy"
                              src={traiteur.heroImage}
                              alt={traiteur.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-overlay opacity-60"
                            />
                          )}
                          <div className="absolute inset-0 flex items-end p-4">
                            <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1.5">
                              <Navigation className="w-3.5 h-3.5 text-orange-500" />
                              {distance < 1
                                ? `À ${Math.round(distance * 1000)} m`
                                : `À ${distance.toFixed(1)} km`}
                            </div>
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-orange-600 transition-colors">
                            {traiteur.name}
                          </h3>
                          <p className="text-xs text-gray-500 mb-1">
                            {traiteur.offer}
                          </p>
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <MapPin className="w-3 h-3" />
                            {traiteur.commune || traiteur.zone}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="text-center">
                    <Link
                      to="/traiteurs"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-md text-sm"
                    >
                      Voir tous les traiteurs
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <div className="inline-flex flex-col items-center gap-3 px-8 py-6 bg-orange-50 rounded-2xl max-w-lg mx-auto">
                    <Crosshair className="w-8 h-8 text-orange-500" />
                    <p className="text-gray-700 font-semibold text-lg">
                      📍 Traiteurs disponibles
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      {traiteurSpaces.slice(0, 5).map((t) => (
                        <Link
                          key={t.slug}
                          to={`/traiteur/${t.slug}`}
                          className="px-4 py-2 bg-white rounded-xl border border-orange-100 text-sm font-medium text-gray-700 hover:text-orange-600 hover:border-orange-300 transition-all"
                        >
                          {t.name}
                          <span className="text-gray-400 ml-1">— {t.commune || t.zone}</span>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-4">
                      <Link
                        to="/traiteurs"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-all hover:scale-105 shadow-md text-sm"
                      >
                        Voir tous les traiteurs
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Comment ça marche — version compacte */}
      <HowItWorksCompact />

      {/* Featured Traiteurs */}
      {featuredTraiteurs.length > 0 && (
        <section className="py-16 md:py-24 bg-gradient-to-b from-orange-50/70 via-white to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-2">
                  Nos traiteurs partenaires
                </h2>
                <p className="text-gray-500 text-lg">
                  Des artisans locaux, passionnés et engagés
                </p>
              </div>
              <Link
                to="/catalogue"
                className="hidden md:flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors"
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
                  className="snap-start flex-shrink-0 w-[260px] sm:w-[290px] group bg-white rounded-[2rem] border border-orange-100 hover:border-orange-300 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <div className={`h-36 bg-gradient-to-br ${traiteur.gradient} relative overflow-hidden`}>
                    {traiteur.heroImage && (
                      <img loading="lazy"
                        src={traiteur.heroImage}
                        alt={traiteur.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 mix-blend-overlay opacity-60"
                      />
                    )}
                    <div className="absolute inset-0 flex items-end p-4">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-lg text-xs font-bold text-gray-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {traiteur.zone}
                      </div>
                    </div>
                    {/* Portrait */}
                    {traiteur.portraitImage && (
                      <div className="absolute -bottom-8 right-4">
                        <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                          <img loading="lazy" src={traiteur.portraitImage} alt={traiteur.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-5 pt-10">
                    <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-orange-600 transition-colors">
                      {traiteur.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{traiteur.offer}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      {traiteur.startingAt > 0 && (
                        <span className="font-semibold text-orange-600">
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
                className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors"
              >
                Voir tous les traiteurs
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products — Carrousel */}
      {allFeatured.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-2">
                  Meilleures ventes
                </h2>
                <p className="text-gray-500 text-lg">
                  Les produits phares de nos traiteurs
                </p>
              </div>
              <Link
                to="/catalogue"
                className="hidden md:flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors"
              >
                Voir le catalogue
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ScrollCarousel>
              {allFeatured.map((product: any) => (
                <div
                  key={product.id}
                  className="snap-start flex-shrink-0 w-[280px] sm:w-[310px] group bg-white rounded-[2rem] border border-orange-100 hover:border-orange-300 overflow-hidden shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
                    {product.image ? (
                      <img loading="lazy"
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ChefHat className="w-12 h-12" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                        product.available !== false
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {product.available !== false ? 'Disponible' : 'Sur confirmation'}
                      </span>
                    </div>
                    {!product.image && (
                      <div className="absolute bottom-3 left-3">
                        <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-xs font-medium">
                          Photo à confirmer
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-1">
                      {product.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-1">{product.vendor}</p>
                    {product.zone && (
                      <p className="text-xs text-gray-400 flex items-center gap-1 mb-3">
                        <MapPin className="w-3 h-3" />
                        {product.zone}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-black text-gray-900">
                        {product.price.toFixed(2).replace('.', ',')} €
                      </span>
                      <span className="text-[10px] text-gray-400 block -mt-1">Prix DELIKREOL</span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all hover:scale-105"
                      >
                        <Plus className="w-4 h-4" />
                        Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollCarousel>
          </div>
        </section>
      )}

      {/* Categories Quick Links */}
      <section className="py-16 md:py-20 bg-gradient-to-b from-orange-50/70 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
              Catégories
            </h2>
            <p className="text-gray-500 text-lg">Explorez par type de cuisine</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {ALL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue?cat=${cat.id}`}
                className="px-6 py-3 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-bold rounded-2xl border border-orange-100 hover:border-orange-300 transition-all hover:-translate-y-0.5 shadow-sm text-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Le meilleur est à venir */}
      <section className="relative overflow-hidden py-16 md:py-24 bg-gradient-to-br from-stone-950 via-emerald-950 to-orange-700 text-white">
        <div className="absolute left-0 top-0 h-64 w-64 rounded-full bg-orange-400/25 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-300/15 blur-3xl" />
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
                  <Icon className="w-8 h-8 mx-auto mb-3 text-amber-200" />
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-sm text-white/70">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pourquoi Delikreol */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
              Pourquoi Delikreol
            </h2>
            <p className="text-gray-500 text-lg">La plateforme martiniquaise qui valorise nos producteurs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-[2rem] p-8 border border-orange-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-5">
                <ChefHat className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Produits locaux</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Des plats préparés par des traiteurs martiniquais avec des ingrédients frais et locaux. 
                Manger créole, c'est soutenir l'économie de l'île.
              </p>
            </div>
            <div className="bg-white rounded-[2rem] p-8 border border-orange-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-5">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Livraison programmée</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Choisissez votre créneau. Retrait chez le traiteur, point relais ou livraison 
                selon votre commune. Vous décidez.
              </p>
            </div>
            <div className="bg-white rounded-[2rem] p-8 border border-orange-100 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-5">
                <MessageCircle className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Support WhatsApp</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
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
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
              Ils nous ont rejoints
            </h2>
            <p className="text-gray-500 text-lg">
              Des traiteurs martiniquais déjà partenaires DeliKreol
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {([
              { name: 'Ninice', slug: 'ninice', image: `${import.meta.env.BASE_URL}vendors/ninice/portrait.jpg` },
              { name: "Coco's Food", slug: 'coco', image: `${import.meta.env.BASE_URL}vendors/coco/hero.jpg` },
              { name: "Saveurs d'Afrique", slug: 'saveurs-afrique', image: `${import.meta.env.BASE_URL}vendors/saveurs-afrique/hero.jpg` },
              { name: 'An Tjè Coco', slug: 'an-tje-coco', image: `${import.meta.env.BASE_URL}vendors/an-tje-coco/hero.jpg` },
              { name: 'Snack Save Peyi\'A', slug: 'save-peyia', image: `${import.meta.env.BASE_URL}vendors/save-peyia/hero.jpg` },
            ] as const).map((caterer) => (
              <Link
                key={caterer.slug}
                to={`/traiteur/${caterer.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-[1.75rem] bg-orange-50/70 border border-orange-100 hover:-translate-y-1 hover:border-orange-300 hover:shadow-lg transition-all text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-2 border-orange-200 group-hover:border-orange-400 transition-colors bg-white shadow-sm">
                                  <img loading="lazy"
                                     src={caterer.image}
                                     alt={caterer.name}
                                     className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                   />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
                  {caterer.name}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Avis clients — Ce que disent nos clients */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-orange-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="sectionTitle text-3xl md:text-5xl font-black tracking-tight text-gray-900 mb-3">
              Ce que disent nos clients
            </h2>
            <p className="text-gray-500 text-lg">
              Des avis de Martiniquais comme vous
            </p>
          </div>
          <div className="cardGrid grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
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
                comment: 'Le service traiteur événementiel au Marin, nickel. Livraison à l\'heure, plat chaud. Je recommande.',
              },
            ].map((review, index) => (
              <div
                key={index}
                className="card bg-white rounded-[2rem] p-6 border border-orange-100 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-lg font-bold shrink-0">
                    {review.initial}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{review.name}</p>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed italic">
                  &ldquo;{review.comment}&rdquo;
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════
          LIVRAISON SPÉCIALE & SERVICES SANTÉ
          ═══════════════════════════════════════════ */}
      <section className="py-14 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
              <span>💚</span>
              Services spéciaux
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight mb-3">
              Livraison adaptée à vos besoins
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto leading-relaxed">
              Des solutions de livraison sur mesure pour les établissements de santé, les seniors et les zones insulaires
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Carte 1 — Livraison retraite */}
            <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-[2rem] border border-blue-100 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center text-2xl mb-4 shadow-md">
                🏠
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Livraison retraite</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
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
            <div className="p-6 bg-gradient-to-br from-emerald-50 to-emerald-100/50 rounded-[2rem] border border-emerald-100 hover:-translate-y-1 hover:shadow-lg transition-all">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center text-2xl mb-4 shadow-md">
                🩺
              </div>
              <h3 className="text-xl font-black text-gray-900 mb-2">Partenariat infirmier</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
                En lien avec les <strong>infirmiers libéraux</strong> et professions médicales.
                Repas adaptés, livraison programmée, suivi personnalisé.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {traiteurSpaces.filter(t => t.deliveryOptions?.includes('infirmiere')).slice(0, 3).map(t => (
                  <Link key={t.slug} to={`/?view=traiteurs&vendor=${t.slug}`}
                    className="text-xs px-2 py-1 bg-white rounded-lg font-semibold text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all">
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
              <h3 className="text-xl font-black text-gray-900 mb-2">Livraison bateau</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-4">
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
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all"
            >
              <span>💚</span>
              Voir tous les filtres santé
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-16 md:py-24 bg-gradient-to-b from-white to-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-stone-950 via-emerald-950 to-orange-700 px-6 py-12 text-center text-white shadow-[0_32px_100px_-55px_rgba(42,25,15,0.75)] md:px-12 md:py-16">
            <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-orange-400/25 blur-3xl" />
            <div className="absolute -right-10 bottom-0 h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl" />
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
                  className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg shadow-orange-950/20 text-lg"
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
