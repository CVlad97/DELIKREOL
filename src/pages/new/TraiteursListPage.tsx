import { Link } from 'react-router-dom';
import { AlertCircle, ArrowRight, ChefHat, Locate, MapPin, Star } from 'lucide-react';
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
import { getVerifiedPartnerLogo } from '../../data/verifiedPartnerLogos';

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
      `Les meilleurs traiteurs de Martinique par commune${communeFilter} — livraison repas, plats créoles et cuisine locale.`,
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
    if (!latitude || !longitude) return null;
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
    .filter((traiteur) => traiteur.status !== 'brouillon')
    .filter((traiteur) => !selectedCommune || traiteur.zone?.toLowerCase().includes(selectedCommune.toLowerCase()))
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

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((traiteur) => {
          const isVerified = traiteur.status === 'public confirmé';
          const verifiedLogo = getVerifiedPartnerLogo(traiteur.slug);
          const verifiedPortrait = traiteur.slug === 'les-delices-de-ninice' ? `${import.meta.env.BASE_URL}vendors/ninice/portrait-full.jpg` : null;
          const menuCount = PUBLIC_HIDDEN_PRODUCT_TRAITEURS.has(traiteur.name)
            ? 0
            : traiteur.slug === 'chef-a-mada'
              ? (traiteur.menuItems || []).length
              : (traiteur.menuItems || []).filter((item: any) => isUsableThumbnail(item.image)).length;
          const distance = distTo(traiteur);
          const visibleMenuItems = (traiteur.menuItems || []).slice(0, 4);

          return (
            <Link
              key={traiteur.slug}
              to={`/traiteur/${traiteur.slug}`}
              className="card group block overflow-hidden rounded-2xl border border-border bg-card shadow-elegant transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-warm"
            >
              <div className="relative flex aspect-video items-center justify-center overflow-hidden bg-gradient-to-br from-[#fffaf1] via-[#f8f0e5] to-[#e8f0e9] px-8 py-7">
                {verifiedLogo ? (
                  <img loading="lazy" src={verifiedLogo} alt={`Logo de ${traiteur.name}`} className="max-h-full max-w-[82%] object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-[1.04]" />
                ) : (
                  <div className="max-w-full text-center">
                    <ChefHat aria-hidden="true" className="mx-auto mb-3 h-8 w-8 text-[#a15b32]/60" />
                    <span className="font-display text-2xl font-semibold leading-tight text-[#173f32] sm:text-3xl">{traiteur.name}</span>
                  </div>
                )}
                {verifiedPortrait && (
                  <div className="absolute bottom-3 left-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-[3px] border-white bg-white shadow-lg">
                    <img loading="lazy" src={verifiedPortrait} alt={`Portrait de ${traiteur.name}`} className="h-full w-full object-cover" />
                  </div>
                )}
                {!isVerified && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#805a34]">
                    <AlertCircle className="h-3 w-3" /> À vérifier
                  </div>
                )}
                {isVerified && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-semibold text-[#176b49]">
                    <Star className="h-3 w-3" /> Partenaire
                  </div>
                )}
                <div className="absolute bottom-3 right-3 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#173f32] shadow-sm">
                  {getStartingPrice(traiteur)}
                </div>
              </div>

              <div className="p-5 pt-8">
                <h2 className="font-display text-xl font-semibold leading-snug text-[#173f32] transition-colors group-hover:text-primary">{traiteur.name}</h2>
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
