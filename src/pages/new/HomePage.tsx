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
import { HowItWorksCompact } from '../../components/HowItWorksCompact';
import { calculateDistanceKm, type Coords } from '../../services/geolocation';
import { LocationSelector } from '../../components/LocationSelector';

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
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { showSuccess } = useToast();

  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'success' | 'denied'>('idle');
  const [geoPosition, setGeoPosition] = useState<Coords | null>(null);
  const [nearbyTraiteurs, setNearbyTraiteurs] = useState<Array<{ traiteur: TraiteurSpace; distance: number }>>([]);
  const [showLocationSelector, setShowLocationSelector] = useState(false);

  const featuredProducts = mockProducts.filter((p) => p.featured);
  const featuredTraiteurs = traiteurSpaces.slice(0, 5);

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

        // Calculer distances pour tous les traiteurs avec lat/lng
        const withDistance = traiteurSpaces
          .filter((t) => t.latitude != null && t.longitude != null)
          .map((t) => ({
            traiteur: t,
            distance: calculateDistanceKm(coords, {
              latitude: t.latitude!,
              longitude: t.longitude!,
            }),
          }))
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
  }, []);

  useEffect(() => {
    const setMeta = (property: string, content: string, name?: string) => {
      const attr = name ? 'name' : 'property';
      const key = name || property;
      let el = document.querySelector(`meta[${attr}="${key}"]`) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // OG tags
    setMeta('og:title', 'DeliKreol — Commandez créole local en Martinique | Livraison & Traiteur');
    setMeta('og:description', 'Commande de plats créoles en Martinique. Traiteurs locaux, livraison et retrait. Commandez en ligne vos plats maison.');
    setMeta('og:image', 'https://cvlad97.github.io/DELIKREOL/branding/favicon.svg');
    setMeta('og:url', 'https://cvlad97.github.io/DELIKREOL/');
    setMeta('og:type', 'website');

    // Twitter card
    setMeta('twitter:card', 'summary_large_image', 'twitter:card');
    setMeta('twitter:title', 'DeliKreol — Commandez créole local en Martinique | Livraison & Traiteur', 'twitter:title');
    setMeta('twitter:description', 'Commande de plats créoles en Martinique. Traiteurs locaux, livraison et retrait. Commandez en ligne vos plats maison.', 'twitter:description');
    setMeta('twitter:image', 'https://cvlad97.github.io/DELIKREOL/branding/favicon.svg', 'twitter:image');

    // Meta description
    setMeta('description', 'Commande de plats créoles en Martinique. Traiteurs locaux, livraison et retrait. Commandez en ligne vos plats maison.', 'description');
  }, []);

  return (
    <Layout>
      {/* Hero Section — Style original DeliKreol */}
      <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-[#FFFBF0]">
        {/* Madras pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url(${import.meta.env.BASE_URL}branding/logo-madras.svg)`,
            backgroundSize: '120px',
            backgroundRepeat: 'repeat',
          }}
        />
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-64 h-64 bg-orange-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-amber-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="text-center md:text-left order-2 md:order-1">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 text-sm font-semibold mb-4 uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                MARTINIQUE
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold mb-4 ml-2">
                🧪 Phase pilote
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-4">
                Commandez créole<br />
                <span className="text-orange-500">local en Martinique</span>
              </h1>
              <p className="text-base text-gray-500 mb-6 max-w-lg mx-auto md:mx-0 leading-relaxed">
                Plats maison, traiteurs locaux, livraison ou retrait — commandez en 3 clics.
              </p>
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start mb-8">
                <Link
                  to="/catalogue"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-orange-200 text-base"
                >
                  <ShoppingBag className="w-5 h-5" />
                  Commander maintenant
                </Link>
                <Link
                  to="/inscription-traiteur"
                  className="flex items-center justify-center gap-2 px-8 py-3.5 bg-white hover:bg-orange-50 text-orange-600 font-bold rounded-2xl border-2 border-orange-200 transition-all hover:scale-105 text-base"
                >
                  Rejoindre Delikreol comme traiteur
                </Link>
                <Link
                  to="/devenir-livreur"
                  className="flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-orange-50 text-orange-600 font-bold rounded-2xl border-2 border-orange-200 transition-all hover:scale-105 text-sm"
                >
                  Devenir livreur
                </Link>
              </div>
              {/* Steps */}
              <div className="flex items-center justify-center md:justify-start gap-4 pt-4 border-t border-orange-100">
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-[10px] font-bold">1</span>
                  Choisis
                </div>
                <span className="text-gray-300 text-xs">→</span>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-[10px] font-bold">2</span>
                  Confirme
                </div>
                <span className="text-gray-300 text-xs">→</span>
                <div className="flex items-center gap-1.5 text-xs text-gray-500">
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-[10px] font-bold">3</span>
                  Récupère
                </div>
              </div>
            </div>

            {/* Right: Food image */}
            <div className="hidden md:flex justify-center order-1 md:order-2">
              <img
                src={`${import.meta.env.BASE_URL}assets/hero-food.svg`}
                alt="Plats maison Martinique — DELIKREOL"
                className="w-full max-w-sm h-auto drop-shadow-2xl"
              />
            </div>
          </div>
            {/* Support WhatsApp */}
            <div className="flex justify-center pb-8">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur DELIKREOL.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all text-sm"
              >
                <MessageCircle className="w-4 h-4" fill="white" />
                Besoin d'aide ? Support WhatsApp
              </a>
            </div>
        </div>
      </section>

      {/* 📍 Traiteurs près de chez moi — Géolocalisation */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
              Traiteurs près de chez toi
            </h2>
            <p className="text-gray-500 text-base">
              Trouve les traiteurs DeliKreol les plus proches de ta position
            </p>
          </div>

          {geoStatus === 'idle' && !showLocationSelector && (
            <div className="text-center">
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
              <div className="inline-flex flex-col items-center gap-4 px-8 py-6 bg-amber-50 rounded-2xl border border-amber-200 max-w-lg mx-auto">
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
                        className="card group bg-white rounded-3xl border border-orange-100 hover:border-orange-300 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                      >
                        <div className={`h-32 bg-gradient-to-br ${traiteur.gradient} relative overflow-hidden`}>
                          {traiteur.heroImage && (
                            <img
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
        <section className="py-16 md:py-20 bg-[#FFFBF0]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
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
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {featuredTraiteurs.map((traiteur) => (
                <Link
                  key={traiteur.slug}
                  to={`/traiteur/${traiteur.slug}`}
                  className="snap-start flex-shrink-0 w-[260px] sm:w-[280px] group bg-white rounded-3xl border border-orange-100 hover:border-orange-300 overflow-hidden shadow-sm hover:shadow-xl transition-all"
                >
                  <div className={`h-36 bg-gradient-to-br ${traiteur.gradient} relative overflow-hidden`}>
                    {traiteur.heroImage && (
                      <img
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
                  </div>
                  <div className="p-5">
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
            </div>
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
      {featuredProducts.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
                  Plats à découvrir
                </h2>
                <p className="text-gray-500 text-lg">
                  Sélection de nos partenaires
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
            <div className="flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4">
              {featuredProducts.map((product) => (
                <div
                  key={product.id}
                  className="snap-start flex-shrink-0 w-[280px] sm:w-[300px] group bg-white rounded-3xl border border-orange-100 hover:border-orange-300 overflow-hidden shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-orange-50">
                    {product.image ? (
                      <img
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
            </div>
          </div>
        </section>
      )}

      {/* Categories Quick Links */}
      <section className="py-16 md:py-20 bg-[#FFFBF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Catégories
            </h2>
            <p className="text-gray-500 text-lg">Explorez par type de cuisine</p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {ALL_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                to={`/catalogue?cat=${cat.id}`}
                className="px-6 py-3 bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-600 font-semibold rounded-2xl border border-orange-100 hover:border-orange-300 transition-all hover:scale-105 shadow-sm text-sm"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust / Le meilleur est à venir */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              Le meilleur est à venir
            </h2>
            <p className="text-lg text-orange-100 leading-relaxed">
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
                <div key={index} className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm">
                  <Icon className="w-8 h-8 mx-auto mb-3 text-amber-200" />
                  <div className="text-3xl font-black mb-1">{stat.value}</div>
                  <div className="text-sm text-orange-100">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pourquoi Delikreol */}
      <section className="py-16 md:py-20 bg-[#FFFBF0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-3">
              Pourquoi Delikreol
            </h2>
            <p className="text-gray-500 text-lg">La plateforme martiniquaise qui valorise nos producteurs</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm hover:shadow-lg transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-5">
                <ChefHat className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Produits locaux</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Des plats préparés par des traiteurs martiniquais avec des ingrédients frais et locaux. 
                Manger créole, c'est soutenir l'économie de l'île.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm hover:shadow-lg transition-all text-center">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-5">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Livraison programmée</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Choisissez votre créneau. Retrait chez le traiteur, point relais ou livraison 
                selon votre commune. Vous décidez.
              </p>
            </div>
            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm hover:shadow-lg transition-all text-center">
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

      {/* Avis clients — Ce que disent nos clients */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="sectionTitle text-3xl md:text-4xl font-black text-gray-900 mb-3">
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
                className="card bg-[#FFFBF0] rounded-3xl p-6 border border-orange-100 shadow-sm hover:shadow-lg transition-all"
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

      {/* CTA Final */}
      <section className="py-16 md:py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
            Prêt à commander ?
          </h2>
          <p className="text-gray-500 text-lg mb-8 leading-relaxed">
            Choisissez un plat ou un traiteur, indiquez votre commune, puis DeliKreol vérifie la disponibilité avec le prestataire.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/catalogue"
              className="flex items-center gap-2 px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-orange-200 text-lg"
            >
              <ShoppingBag className="w-5 h-5" />
              Voir le catalogue
            </Link>
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur DELIKREOL.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl transition-all hover:scale-105 shadow-lg shadow-green-200 text-lg"
            >
              <MessageCircle className="w-5 h-5" fill="white" />
              Support WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
