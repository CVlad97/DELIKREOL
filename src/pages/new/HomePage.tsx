import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ChefHat,
  Gift,
  Heart,
  Leaf,
  MapPin,
  Navigation,
  Plus,
  ShieldCheck,
  ShoppingBag,
  Star,
  Truck,
  Utensils,
  Clock3,
} from 'lucide-react';
import { DeliveryAvailability } from '../../components/DeliveryAvailability';
import { Layout } from '../../components/layout/Layout';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { mockProducts } from '../../data/mockCatalog';
import {
  PUBLIC_HIDDEN_PRODUCT_TRAITEURS,
  PUBLIC_HIDDEN_TRAITEURS,
  formatEuro,
  traiteurSpaces,
} from '../../data/traiteurs';
import { trackPublicView } from '../../services/metricsService';
import { setPageMeta } from '../../services/seo';
import { calculateDistanceKm, type Coords } from '../../services/geolocation';
import { resolveTraiteurCoords } from '../../services/partnerGeo';

const HOME_PARTNER_ORDER = [
  "Snack Savè Peyi'A",
  'Les Delices de Ninice',
  'Gouté Mwen',
  "Saveurs d'Afrique",
  "Coco's Food",
];

const HOME_PRODUCT_ORDER = [
  'Colombo de poulet',
  'Panini saumon',
  'Jus de maracuja',
  'Riz djon djon',
  'Entrecôte',
  'Crevettes grillées',
];

function publicAsset(path: string) {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}${path.replace(/^\//, '')}`;
}

function safeImage(src?: string | null) {
  return src || publicAsset('branding/hero-tropical.png');
}

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedCommune, setSelectedCommune] = useState('');
  const [geoPosition, setGeoPosition] = useState<Coords | null>(null);
  const [geoFeedback, setGeoFeedback] = useState('');
  const [nearbyProductIndex, setNearbyProductIndex] = useState(0);

  useEffect(() => {
    trackPublicView();
    document.title = 'DeliKreol — Commandez créole local en Martinique';
    setPageMeta(
      'DeliKreol — Commandez créole local en Martinique',
      'Commandez des plats créoles maison chez des traiteurs locaux en Martinique. Retrait ou livraison selon disponibilité du partenaire.',
      'DeliKreol, plats créoles Martinique, traiteurs Martinique, livraison repas Martinique'
    );
  }, []);

  const partners = useMemo(() => {
    const visible = traiteurSpaces.filter(
      (partner) => partner.status === 'public confirmé' && !PUBLIC_HIDDEN_TRAITEURS.has(partner.name)
    );
    const selectedOrigin = geoPosition ?? (selectedCommune ? (() => {
      const point = resolveTraiteurCoords(selectedCommune, selectedCommune);
      return point ? { latitude: point.latitude, longitude: point.longitude } : null;
    })() : null);
    const normalizedCommune = selectedCommune.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

    const filtered = visible.filter((partner) => {
      if (!selectedCommune) return true;
      const zone = ((partner.commune || '') + ' ' + (partner.zone || '')).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return zone.includes(normalizedCommune);
    });

    const ordered = HOME_PARTNER_ORDER
      .map((name) => filtered.find((partner) => partner.name === name))
      .filter((partner): partner is NonNullable<typeof partner> => Boolean(partner))
      .concat(filtered.filter((partner) => !HOME_PARTNER_ORDER.includes(partner.name)));

    if (!selectedOrigin) return ordered.slice(0, 5);
    return [...ordered].sort((a, b) => {
      const aPoint = a.latitude != null && a.longitude != null
        ? { latitude: a.latitude, longitude: a.longitude }
        : resolveTraiteurCoords(a.address, a.commune || a.zone);
      const bPoint = b.latitude != null && b.longitude != null
        ? { latitude: b.latitude, longitude: b.longitude }
        : resolveTraiteurCoords(b.address, b.commune || b.zone);
      const aDistance = aPoint ? calculateDistanceKm(selectedOrigin, aPoint) : Number.POSITIVE_INFINITY;
      const bDistance = bPoint ? calculateDistanceKm(selectedOrigin, bPoint) : Number.POSITIVE_INFINITY;
      return aDistance - bDistance;
    }).slice(0, 5);
  }, [geoPosition, selectedCommune]);

  const spotlightPartner = useMemo(() => {
    return partners.find((partner) => partner.name === 'Les Delices de Ninice') || partners[0] || null;
  }, [partners]);

  const productsNow = useMemo(() => {
    const visible = mockProducts.filter(
      (product) => product.available && !PUBLIC_HIDDEN_PRODUCT_TRAITEURS.has(product.vendor) && product.image
    );
    const normalizedCommune = selectedCommune.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const selectedOrigin = geoPosition ?? (selectedCommune ? (() => {
      const point = resolveTraiteurCoords(selectedCommune, selectedCommune);
      return point ? { latitude: point.latitude, longitude: point.longitude } : null;
    })() : null);
    const filtered = visible.filter((product) => {
      if (!selectedCommune) return true;
      const zone = (product.zone || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
      return zone.includes(normalizedCommune) || product.vendor.toLowerCase().includes(normalizedCommune);
    });

    const ordered = HOME_PRODUCT_ORDER
      .map((name) => filtered.find((product) => product.name.toLowerCase().includes(name.toLowerCase())))
      .filter((product): product is NonNullable<typeof product> => Boolean(product));
    const featured = filtered.filter((product) => product.featured && !ordered.some((item) => item.id === product.id));
    const others = filtered.filter(
      (product) => !ordered.some((item) => item.id === product.id) && !featured.some((item) => item.id === product.id)
    );
    const result = [...ordered, ...featured, ...others];

    if (!selectedOrigin) return result.slice(0, 4);
    return [...result].sort((a, b) => {
      const aPoint = resolveTraiteurCoords(a.zone, a.zone);
      const bPoint = resolveTraiteurCoords(b.zone, b.zone);
      const aDistance = aPoint ? calculateDistanceKm(selectedOrigin, { latitude: aPoint.latitude, longitude: aPoint.longitude }) : Number.POSITIVE_INFINITY;
      const bDistance = bPoint ? calculateDistanceKm(selectedOrigin, { latitude: bPoint.latitude, longitude: bPoint.longitude }) : Number.POSITIVE_INFINITY;
      return aDistance - bDistance;
    }).slice(0, 4);
  }, [geoPosition, selectedCommune]);

  useEffect(() => {
    setNearbyProductIndex(0);
  }, [productsNow]);

  useEffect(() => {
    if (productsNow.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setNearbyProductIndex((current) => (current + 1) % productsNow.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [productsNow.length]);

  const nearbyProduct = productsNow[nearbyProductIndex] || productsNow[0] || null;

  const goToCatalogue = () => {
    const params = new URLSearchParams();
    if (selectedCommune) params.set('commune', selectedCommune);
    navigate(`/catalogue${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const handleGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoFeedback('Géolocalisation indisponible sur cet appareil.');
      return;
    }

    setGeoFeedback('Recherche de votre position…');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoPosition({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setGeoFeedback('Position détectée. Vérification des livreurs et points relais autour de vous…');
      },
      () => setGeoFeedback('Position non autorisée. Choisissez votre commune pour continuer.'),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 }
    );
  };

  return (
    <Layout>
      <section className="overflow-hidden bg-[#fff8ed] text-[#173f32]">
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm font-bold text-amber-950">
          <span className="inline-flex items-center gap-2">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            Préouverture DELIKREOL : découvrez les traiteurs et composez vos menus. Les commandes publiques ouvriront prochainement après les derniers tests partenaires.
          </span>
        </div>
        <div className="relative min-h-[560px] border-b border-orange-100">
          <img
            src={publicAsset('branding/hero-tropical.png')}
            alt="Plat créole local en Martinique"
            className="absolute inset-0 z-0 h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 z-10 bg-[linear-gradient(90deg,rgba(255,248,237,0.98)_0%,rgba(255,248,237,0.92)_42%,rgba(255,248,237,0.38)_72%,rgba(255,248,237,0.2)_100%)]" />
          <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-[#fff8ed] to-transparent" />

          <div className="relative z-20 mx-auto grid max-w-[1840px] gap-8 px-5 py-12 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-16">
            <div className="flex max-w-3xl flex-col justify-center">
              <p className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.32em] text-[#c84814]">
                <span className="text-lg">✦</span>
                Livraison & retrait en Martinique
              </p>

              <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-tight text-[#07614e] sm:text-7xl lg:text-8xl">
                Commandez <span className="text-[#d54510]">créole local</span> en Martinique
              </h1>
              <p className="mt-5 max-w-2xl text-xl font-semibold text-[#4b5f55] sm:text-2xl">
                Plats maison, traiteurs locaux, livraison ou retrait.
              </p>

              <div className="mt-8 grid max-w-4xl gap-3 rounded-[2rem] bg-white/90 p-2 shadow-[0_20px_70px_rgba(70,38,15,0.18)] ring-1 ring-orange-100 backdrop-blur md:grid-cols-[1fr_auto_auto]">
                <label className="flex items-center gap-3 rounded-[1.5rem] bg-white px-5 py-4 text-sm font-black text-[#173f32] ring-1 ring-orange-100">
                  <MapPin className="h-5 w-5 text-[#d54510]" aria-hidden="true" />
                  <select
                    className="w-full bg-transparent text-base font-black outline-none"
                    value={selectedCommune}
                    onChange={(event) => {
                      setSelectedCommune(event.target.value);
                      setGeoPosition(null);
                    }}
                    aria-label="Choisir ma commune"
                  >
                    <option value="">Choisir ma commune</option>
                    {martiniqueCommunes.map((commune) => (
                      <option key={commune.name} value={commune.name}>{commune.name}</option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={goToCatalogue}
                  className="inline-flex items-center justify-center gap-3 rounded-[1.5rem] bg-[#cc460f] px-7 py-4 text-base font-black text-white shadow-lg shadow-orange-900/20 transition hover:-translate-y-0.5 hover:bg-[#b83d0c]"
                >
                  Commander maintenant
                  <ArrowRight className="h-5 w-5" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={handleGeolocation}
                  className="inline-flex items-center justify-center gap-3 rounded-[1.5rem] bg-white px-6 py-4 text-base font-black text-[#173f32] ring-1 ring-orange-100 transition hover:-translate-y-0.5 hover:ring-[#cc460f]/40"
                >
                  <Navigation className="h-5 w-5 text-[#d54510]" aria-hidden="true" />
                  Me géolocaliser
                </button>
              </div>

              {geoFeedback && <p className="mt-3 text-sm font-semibold text-[#4b5f55]">{geoFeedback}</p>}
              <DeliveryAvailability commune={selectedCommune} coords={geoPosition} />

              {nearbyProduct && (
                <div className="mt-5 max-w-4xl overflow-hidden rounded-[1.75rem] bg-white/95 shadow-[0_18px_55px_rgba(70,38,15,0.18)] ring-1 ring-orange-100 backdrop-blur" aria-live="polite">
                  <div className="grid min-h-36 grid-cols-[120px_1fr] sm:grid-cols-[180px_1fr]">
                    <img
                      key={nearbyProduct.id}
                      src={safeImage(nearbyProduct.image)}
                      alt={nearbyProduct.name}
                      className="h-full w-full animate-[fadeIn_.45s_ease-out] object-cover"
                    />
                    <div className="flex min-w-0 flex-col justify-center p-4 sm:p-5">
                      <p className="text-[10px] font-black uppercase tracking-[.18em] text-[#09614f]">
                        Commander près de chez vous
                      </p>
                      <h2 className="mt-1 truncate text-xl font-black text-[#1e1d1a] sm:text-2xl">{nearbyProduct.name}</h2>
                      <p className="mt-1 text-sm font-bold text-[#6c6157]">
                        {nearbyProduct.vendor} · {nearbyProduct.zone || 'Martinique'}
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <strong className="text-lg text-[#cc460f]">{formatEuro(nearbyProduct.price)}</strong>
                        <button
                          type="button"
                          onClick={() => navigate(`/produit/${nearbyProduct.id}`)}
                          className="inline-flex items-center gap-2 rounded-full bg-[#cc460f] px-4 py-2 text-xs font-black text-white shadow-lg"
                        >
                          Voir le plat <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-center gap-1.5 border-t border-orange-100 py-2" aria-label="Plats proposés">
                    {productsNow.map((product, index) => (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setNearbyProductIndex(index)}
                        aria-label={`Afficher ${product.name}`}
                        aria-current={index === nearbyProductIndex ? 'true' : undefined}
                        className={`h-2 rounded-full transition-all ${index === nearbyProductIndex ? 'w-7 bg-[#cc460f]' : 'w-2 bg-orange-200'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-7 grid gap-3 text-sm font-bold text-[#294d41] sm:grid-cols-3">
                <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 backdrop-blur">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#09614f] text-white"><Leaf className="h-5 w-5" /></span>
                  Des traiteurs locaux de confiance
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 backdrop-blur">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#09614f] text-white"><Truck className="h-5 w-5" /></span>
                  Livraison ou retrait près de chez vous
                </div>
                <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 backdrop-blur">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[#09614f] text-white"><Heart className="h-5 w-5" /></span>
                  Une cuisine authentique 100% Martinique
                </div>
              </div>
            </div>

            <div className="relative hidden min-h-[440px] items-end justify-end lg:flex">
              <div className="absolute right-0 top-40 max-w-xs rounded-[2rem] bg-white/95 p-6 shadow-[0_20px_70px_rgba(70,38,15,0.2)] ring-1 ring-orange-100">
                <div className="mb-3 flex items-center gap-3">
                  <span className="grid h-12 w-12 place-items-center rounded-2xl bg-orange-100 text-[#d54510]"><ChefHat className="h-7 w-7" /></span>
                  <p className="text-lg font-black leading-tight">Le goût<br />de chez nous</p>
                </div>
                <p className="text-sm font-semibold text-[#4b5f55]">
                  Des plats préparés avec passion, par des artisans martiniquais.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-[1840px] px-5 pb-12 sm:px-8 lg:px-16">
          <section className="pt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-black text-[#1e1d1a] sm:text-4xl">Nos traiteurs partenaires</h2>
                <p className="mt-1 text-lg font-semibold text-[#6c6157]">Des artisans locaux, passionnés et engagés</p>
              </div>
              <Link to="/traiteurs" className="hidden items-center gap-2 text-sm font-black text-[#cc460f] sm:inline-flex">
                Voir tous les traiteurs <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {partners.map((partner) => (
                <Link
                  key={partner.slug}
                  to={`/traiteur/${partner.slug}`}
                  className="group overflow-hidden rounded-[1.6rem] bg-white shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="relative h-32 overflow-hidden">
                    <img src={safeImage(partner.heroImage || partner.galleryImages[0])} alt={partner.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-black text-[#1e1d1a] shadow-sm">
                      <MapPin className="h-3.5 w-3.5" /> {partner.commune || partner.zone}
                    </span>
                    <img src={safeImage(partner.portraitImage)} alt="" className="absolute -bottom-5 right-4 h-16 w-16 rounded-full border-4 border-white object-cover shadow-lg" loading="lazy" />
                  </div>
                  <div className="p-5 pt-7">
                    <h3 className="text-xl font-black text-[#cc460f]">{partner.name}</h3>
                    <p className="mt-1 min-h-[44px] text-sm font-semibold leading-relaxed text-[#6c6157]">{partner.offer}</p>
                    <p className="mt-4 text-sm font-black text-[#cc460f]">À partir de {formatEuro(partner.startingAt || 6)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-5 grid gap-6 xl:grid-cols-[0.83fr_1fr]">
            {spotlightPartner && (
              <article className="rounded-[2rem] bg-[#eef8ea] p-4 shadow-sm ring-1 ring-emerald-100 sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="flex items-center gap-2 text-2xl font-black text-[#09614f]"><span>👑</span> Traiteur à l’honneur</h2>
                  <span className="hidden rounded-2xl bg-[#0b7f63] px-4 py-3 text-sm font-black text-white shadow-lg sm:inline-flex"><Gift className="mr-2 h-4 w-4" /> Bons repas à gagner !</span>
                </div>

                <div className="grid gap-5 sm:grid-cols-[260px_1fr]">
                  <img src={safeImage(spotlightPartner.heroImage || spotlightPartner.galleryImages[0])} alt={spotlightPartner.name} className="h-48 w-full rounded-[1.4rem] object-cover sm:h-full" loading="lazy" />
                  <div className="flex flex-col justify-center">
                    <h3 className="text-2xl font-black text-[#173f32]">{spotlightPartner.name}</h3>
                    <p className="mt-1 max-w-lg text-base font-semibold leading-relaxed text-[#4b5f55]">{spotlightPartner.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-sm font-bold text-[#294d41]">
                      <span className="inline-flex items-center gap-2"><MapPin className="h-4 w-4 text-[#09614f]" /> {spotlightPartner.zone}</span>
                      <span className="inline-flex items-center gap-2"><Utensils className="h-4 w-4 text-[#09614f]" /> 30-50 plats/jour</span>
                      <span className="inline-flex items-center gap-2"><Star className="h-4 w-4 fill-[#f5a524] text-[#f5a524]" /> Avis vérifiés à venir</span>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <Link to={`/traiteur/${spotlightPartner.slug}`} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#cc460f]/30 bg-white px-5 py-3 text-sm font-black text-[#cc460f] transition hover:bg-[#cc460f] hover:text-white">
                        Découvrir ce traiteur <ArrowRight className="h-4 w-4" />
                      </Link>
                      <Link to="/devenir-partenaire" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-[#09614f] ring-1 ring-emerald-100">
                        Devenir partenaire
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            )}

            <section className="rounded-[2rem] bg-[#fff8ed]">
              <div className="mb-3 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-black text-[#1e1d1a]">À commander maintenant</h2>
                  <p className="text-base font-semibold text-[#6c6157]">Les meilleures ventes et plats disponibles dès le haut de page</p>
                </div>
                <Link to="/catalogue" className="hidden items-center gap-2 text-sm font-black text-[#cc460f] sm:inline-flex">
                  Voir tout le catalogue <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {productsNow.map((product) => (
                  <article key={product.id} className="group overflow-hidden rounded-[1.4rem] bg-white shadow-sm ring-1 ring-orange-100 transition hover:-translate-y-1 hover:shadow-xl">
                    <button type="button" onClick={() => navigate(`/produit/${product.id}`)} className="block w-full text-left">
                      <img src={safeImage(product.image)} alt={product.name} className="h-28 w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy" />
                    </button>
                    <div className="relative p-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-[#cc460f]">{product.category}</p>
                      <h3 className="mt-1 line-clamp-2 min-h-[42px] text-base font-black leading-tight text-[#1e1d1a]">{product.name}</h3>
                      <p className="mt-1 text-sm font-black text-[#cc460f]">{formatEuro(product.price)}</p>
                      <button
                        type="button"
                        onClick={() => navigate(`/produit/${product.id}`)}
                        className="absolute bottom-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-[#cc460f] text-white shadow-lg transition hover:scale-105"
                        aria-label={`Commander ${product.name}`}
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          </section>

          <section className="mt-8 grid gap-4 rounded-[2rem] bg-white p-5 shadow-sm ring-1 ring-orange-100 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-100 text-[#cc460f]"><ShoppingBag className="h-6 w-6" /></span>
              <div>
                <h3 className="font-black text-[#173f32]">Commande rapide</h3>
                <p className="mt-1 text-sm font-semibold text-[#6c6157]">Sélectionnez votre commune, composez votre plat et confirmez la demande.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-[#09614f]"><ShieldCheck className="h-6 w-6" /></span>
              <div>
                <h3 className="font-black text-[#173f32]">Validation partenaire</h3>
                <p className="mt-1 text-sm font-semibold text-[#6c6157]">Les disponibilités, horaires et options de livraison restent confirmés par le traiteur.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-100 text-[#cc460f]"><ChefHat className="h-6 w-6" /></span>
              <div>
                <h3 className="font-black text-[#173f32]">Cuisine locale</h3>
                <p className="mt-1 text-sm font-semibold text-[#6c6157]">Une vitrine claire pour les snacks, traiteurs, livreurs et points relais de Martinique.</p>
              </div>
            </div>
          </section>
        </div>
      </section>
    </Layout>
  );
}
