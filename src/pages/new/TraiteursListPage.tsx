import { Link } from 'react-router-dom';
import { ArrowRight, Locate, MapPin, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatEuro, PUBLIC_HIDDEN_PRODUCT_TRAITEURS, traiteurSpaces } from '../../data/traiteurs';
import { calculateDistanceKm } from '../../services/geolocation';
import { resolveTraiteurCoords } from '../../services/partnerGeo';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { mockProducts } from '../../data/mockCatalog';
import { setPageMeta } from '../../services/seo';
import { RatingBadge } from '../../components/ReviewSection';
import { BackBar } from '../../components/BackBar';
import { trackPublicView } from '../../services/metricsService';
import { isUsableThumbnail } from '../../services/catalogImageResolver';

const MADA_BADGE_TRAITEURS = new Set([
  "Saveurs d'Afrique",
  'Les Delices de Ninice',
  'Sweet Family Traiteur Orianne',
]);

function hasMadaBadge(name: string) {
  return MADA_BADGE_TRAITEURS.has(name);
}

// Only use an actual partner logo when the partner asset exists.
// Do not display DeliKreol branding as though it were a partner logo.
function getLogoForTraiteur(slug: string): string | null {
  const logos: Record<string, string> = {
    'chef-a-mada': 'vendors/chef-a-mada/logo.jpg',
    'les-delices-de-ninice': 'vendors/ninice/logo-les-delices-de-ninice.webp',
    'saveurs-dafrique': 'vendors/saveurs-afrique/logo-officiel-20261123.jpg',
  };
  const file = logos[slug];
  return file ? `${import.meta.env.BASE_URL}${file}` : null;
}

// Couleurs distinctes, photos existantes et logos fournis. Aucune création de marque.
// Coco's Food : profile.svg n'est pas un logo officiel confirmé ; utiliser le portrait.
const PARTNER_CARD_COLORS: Record<string, string> = {
  'langouste-house': 'from-[#100f0d] via-[#442615] to-[#a75a16]',
  'les-delices-de-ninice': 'from-[#56114d] via-[#9c2369] to-[#f0a02b]',
  'saveurs-dafrique': 'from-[#351c12] via-[#834323] to-[#c98a2c]',
  'cocos-food': 'from-[#20140f] via-[#69442d] to-[#b87b39]',
  'sweet-family-traiteur-orianne': 'from-[#4e1738] via-[#963e5d] to-[#d28e6e]',
  'snack-save-peyia': 'from-[#224331] via-[#427149] to-[#cb972c]',
  'goute-mwen': 'from-[#522b6b] via-[#a45c94] to-[#eaad44]',
  'chef-a-mada': 'from-[#3e1615] via-[#8d392c] to-[#d6a34e]',
};

function getPartnerCardCover(traiteur: (typeof traiteurSpaces)[number]): string | null {
  // Le jeu Gouté Mwen est identifié comme illustré par IA : ne pas le faire passer pour une photo réelle.
  if (traiteur.slug === 'goute-mwen') return null;
  if (traiteur.slug === 'saveurs-dafrique') return traiteur.galleryImages?.[0] ?? null;
  return traiteur.heroImage || traiteur.galleryImages?.[0] || null;
}

const RAPID_DELIVERY_RADIUS_KM = 3;

function getPartnerInitials(name: string) {
  return name.split(/\s+/).filter((word) => !['de', 'des', 'la', 'le', 'à', 'a'].includes(word.toLowerCase())).slice(0, 2).map((word) => word[0]).join('').toUpperCase();
}

export function TraiteursListPage() {
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    document.title = 'Nos traiteurs partenaires — DeliKreol';
    trackPublicView();
  }, []);

  useEffect(() => {
    const communeFilter = selectedCommune ? ` à ${selectedCommune}` : '';
    setPageMeta(
      `Nos traiteurs partenaires${communeFilter} — DeliKreol`,
      `Découvrez les traiteurs référencés en Martinique${communeFilter}, leurs spécialités et les modalités de commande, retrait ou livraison à confirmer.`,
    );
  }, [selectedCommune]);

  const requestPosition = () => {
    if (!navigator.geolocation) return;
    setRequested(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({ latitude: position.coords.latitude, longitude: position.coords.longitude });
        setRequested(false);
      },
      () => setRequested(false),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const distTo = (traiteur: any) => {
    if (!userPosition) return null;
    const latitude = traiteur.latitude ?? resolveTraiteurCoords(traiteur.zone, traiteur.commune)?.latitude;
    const longitude = traiteur.longitude ?? resolveTraiteurCoords(traiteur.zone, traiteur.commune)?.longitude;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
    return calculateDistanceKm(userPosition, { latitude, longitude });
  };

  const getStartingPrice = (traiteur: any): string => {
    if (traiteur.slug === 'chef-a-mada') return 'Sur devis';
    if (PUBLIC_HIDDEN_PRODUCT_TRAITEURS.has(traiteur.name)) return 'Offre à valider';
    if (traiteur.priceRange) return `À partir de ${traiteur.priceRange}`;
    if (traiteur.price_level) return `À partir de ${traiteur.price_level}`;

    const traiteurName = (traiteur.name || '').toLowerCase().trim();
    const products = mockProducts.filter((product) => (
      product.vendor?.toLowerCase().trim() === traiteurName && isUsableThumbnail(product.image)
    ));
    if (products.length > 0) return `À partir de ${formatEuro(Math.min(...products.map((product) => product.price)))}`;
    if (traiteur.startingAt && traiteur.startingAt > 0) return `À partir de ${formatEuro(traiteur.startingAt)}`;
    return 'Prix à confirmer';
  };

  const filtered = traiteurSpaces
    .filter((traiteur) => !selectedCommune || [traiteur.commune, traiteur.zone].some((value) => value?.toLowerCase().includes(selectedCommune.toLowerCase())))
    .sort((left, right) => {
      if (!userPosition) return 0;
      return (distTo(left) ?? 999) - (distTo(right) ?? 999);
    });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <BackBar label="Accueil" backTo="/" />
      <header className="mb-10 text-center">
        <h1 className="mb-3 text-3xl font-display font-bold text-foreground md:text-4xl">
          Nos traiteurs partenaires
        </h1>
        <p className="mx-auto mb-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
          Découvrez les traiteurs, snacks et restaurateurs locaux de Martinique référencés sur DeliKreol.
        </p>

        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <select
            value={selectedCommune}
            onChange={(event) => setSelectedCommune(event.target.value)}
            className="min-h-11 rounded-xl border border-input bg-white px-4 py-2 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            aria-label="Filtrer les traiteurs par commune"
          >
            <option value="">Toutes les communes</option>
            {martiniqueCommunes.slice(0, 34).map((commune) => (
              <option key={commune.name} value={commune.name}>{commune.name}</option>
            ))}
          </select>
          {!userPosition && (
            <button type="button" onClick={requestPosition} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary/10 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/[0.15]">
              <Locate className="h-4 w-4" /> Autour de moi
            </button>
          )}
          {userPosition && (
            <span className="rounded-full bg-success/10 px-3 py-2 text-xs font-semibold text-success">
              📍 Tri par proximité actif
            </span>
          )}
          {requested && !userPosition && (
            <span className="text-xs text-muted-foreground">Demande de position…</span>
          )}
        </div>
      </header>

      <section aria-label="Comment commander" className="mb-8 rounded-2xl border border-primary/15 bg-primary/[0.04] p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="text-lg font-bold text-foreground">Commander en 3 étapes</h2><p className="mt-1 text-sm text-muted-foreground">1. Choisissez un traiteur et ses produits · 2. Vérifiez votre panier · 3. Confirmez les modalités disponibles au paiement.</p></div>
          <div className="flex flex-wrap gap-2"><Link to="/catalogue" className="inline-flex min-h-11 items-center rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground">Voir les produits</Link><Link to="/panier" className="inline-flex min-h-11 items-center rounded-xl border border-primary/25 bg-white px-4 py-2 text-sm font-bold text-primary">Mon panier</Link></div>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">Les horaires, frais de livraison, stocks et moyens de paiement dépendent du partenaire et doivent être confirmés avant validation.</p>
      </section>
      {filtered.length === 0 && (
        <div role="status" className="mb-6 rounded-2xl border border-border bg-card p-6 text-center">
          <p className="font-semibold">Aucun traiteur affiché pour cette commune.</p>
          <button type="button" onClick={() => setSelectedCommune('')} className="mt-3 min-h-11 rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground">Afficher toutes les communes</button>
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((traiteur) => {
          const isVerified = traiteur.status === 'public confirmé';
          const menuCount = PUBLIC_HIDDEN_PRODUCT_TRAITEURS.has(traiteur.name)
            ? 0
            : traiteur.slug === 'chef-a-mada'
              ? (traiteur.menuItems || []).length
              : (traiteur.menuItems || []).filter((item: any) => isUsableThumbnail(item.image)).length;
          const distance = distTo(traiteur);
          const deliveryLabel = distance === null
            ? 'Localisez-vous pour vérifier la livraison rapide (3 km)'
            : distance <= RAPID_DELIVERY_RADIUS_KM
              ? 'Zone de livraison rapide · sous réserve de disponibilité'
              : 'Hors portée rapide · livraison programmée sur confirmation';
          const visibleMenuItems = (traiteur.menuItems || []).slice(0, 4);
          const coverImage = getPartnerCardCover(traiteur);
          const cardColors = PARTNER_CARD_COLORS[traiteur.slug] || 'from-[#2e241c] via-[#77513b] to-[#bc8458]';

          return (
            <Link
              key={traiteur.slug}
              to={`/traiteur/${traiteur.slug}`}
              className="card group block overflow-hidden rounded-2xl border border-border bg-card shadow-elegant transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-warm"
            >
              <div className={`relative isolate flex min-h-[220px] flex-col items-center justify-center overflow-hidden bg-gradient-to-br px-5 py-7 sm:min-h-[240px] ${cardColors}`}>
                {coverImage && <img loading="lazy" decoding="async" src={coverImage} alt="" aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-40" />}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute left-3 top-3 z-10 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-emerald-800 shadow-sm">
                  {isVerified ? 'Partenaire référencé' : 'Informations à confirmer'}
                </div>
                {hasMadaBadge(traiteur.name) && (
                  <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase text-primary shadow-sm">
                    Chef à Mada
                  </div>
                )}
                {traiteur.name === 'Langouste House' ? (
                  <img loading="lazy" decoding="async" src={`${import.meta.env.BASE_URL}vendors/langouste-house/bandeau-original.jpg`} alt="Bandeau original Langouste House fourni par le partenaire" className="relative z-10 mt-8 h-36 w-full max-w-[290px] rounded-xl bg-white object-contain shadow-xl" />
                ) : (
                <div className="relative z-10 flex h-36 w-36 items-center justify-center overflow-hidden rounded-3xl border-4 border-white bg-white p-3 shadow-xl sm:h-40 sm:w-40" aria-label={`Identité visuelle de ${traiteur.name}`}>
                  {getLogoForTraiteur(traiteur.slug) ? (
                    <img loading="lazy" decoding="async" src={getLogoForTraiteur(traiteur.slug)!} alt={`Logo de ${traiteur.name}`} className="h-full w-full object-contain" />
                  ) : traiteur.portraitImage ? (
                    <img loading="lazy" decoding="async" src={traiteur.portraitImage} alt={`Photo de profil de ${traiteur.name}`} className="h-full w-full rounded-2xl object-cover" />
                  ) : (
                    <span className="text-4xl font-black tracking-tight text-emerald-900" aria-label={`Initiales de ${traiteur.name}`}>{getPartnerInitials(traiteur.name)}</span>
                  )}
                </div>
                )}
                <div className="relative z-10 mt-4 rounded-full bg-white px-4 py-1.5 text-xs font-bold text-foreground shadow-sm">
                  {getStartingPrice(traiteur)}
                </div>
              </div>
              <div className="p-5 pt-5">
                <h2 className="font-bold text-foreground transition-colors group-hover:text-primary">{traiteur.name}</h2>
                <RatingBadge traiteurSlug={traiteur.slug} />

                <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {traiteur.commune || traiteur.zone || 'Martinique'}
                  </span>
                  {distance !== null && (
                    <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                      {distance.toFixed(1)} km
                    </span>
                  )}
                </div>

                <p className="mt-2 rounded-lg bg-primary/[0.06] px-3 py-2 text-xs font-semibold text-primary" aria-label="Modalités de livraison">
                  {deliveryLabel}
                </p>
                {traiteur.specialty && (
                  <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-primary">
                    {traiteur.specialty}
                  </p>
                )}

                <p className="mb-4 mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {traiteur.description || traiteur.offer || 'Découvrez les spécialités de ce prestataire.'}
                </p>
                {visibleMenuItems.length > 0 && (
                  <div className="mb-4 rounded-2xl border border-primary/10 bg-primary/[0.04] p-3">
                    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                      Plats visibles
                    </p>
                    <ul className="space-y-1 text-xs font-semibold leading-5 text-foreground/75">
                      {visibleMenuItems.map((item: any) => (
                        <li key={item.name || item.id} className="line-clamp-1">• {String(item.name ?? 'Produit local').replace(/\s+—.+$/, '')}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {traiteur.heroImage && traiteur.slug !== 'chef-a-mada' && (
                  <div className="mb-4 overflow-hidden rounded-xl border border-border bg-muted">
                    <img
                      loading="lazy"
                      decoding="async"
                      src={traiteur.heroImage || undefined}
                      alt={`Photographie de la vitrine ${traiteur.name}`}
                      className="h-44 w-full object-cover object-center sm:h-48"
                    />
                    <p className="px-3 py-2 text-[11px] text-muted-foreground">Photo du partenaire — visuel à confirmer</p>
                  </div>
                )}
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm text-muted-foreground">
                    {menuCount > 0 ? `${menuCount} plat${menuCount > 1 ? 's' : ''}` : 'Menu à confirmer'}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-primary transition-all group-hover:gap-2">
                    Voir la vitrine <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-12 rounded-2xl bg-gradient-to-r from-primary/5 to-accent/5 p-8 text-center">
        <h2 className="mb-2 text-xl font-bold text-foreground">Vous êtes traiteur en Martinique ?</h2>
        <p className="mb-4 text-muted-foreground">Rejoignez DeliKreol et touchez de nouveaux clients locaux.</p>
        <Link to="/devenir-partenaire" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary">
          <Star className="h-4 w-4" /> Devenir partenaire
        </Link>
      </section>
    </main>
  );
}

export default TraiteursListPage;
