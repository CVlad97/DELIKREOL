import { Link } from 'react-router-dom';
import { ChefHat, MapPin, Star, ArrowRight, AlertCircle, Locate, Euro } from 'lucide-react';
import { traiteurSpaces, formatEuro } from '../../data/traiteurs';
import { useEffect, useState } from 'react';
import { calculateDistanceKm } from '../../services/geolocation';
import { martiniqueCommunes } from '../../data/martiniqueCommunes';
import { mockProducts } from '../../data/mockCatalog';
import { setPageMeta } from '../../services/seo';
import { RatingBadge } from '../../components/ReviewSection';
import { BackBar } from '../../components/BackBar';

export function TraiteursListPage() {
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedCommune, setSelectedCommune] = useState('');
  const [requested, setRequested] = useState(false);

  useEffect(() => {
    document.title = 'Nos traiteurs partenaires — DeliKreol';
  }, []);

  useEffect(() => {
    const communeFilter = selectedCommune
      ? ` à ${selectedCommune}`
      : '';
    setPageMeta(
      `Nos traiteurs partenaires${communeFilter} — DeliKreol`,
      `Les meilleurs traiteurs de Martinique par commune${communeFilter} — livraison repas, plats créoles et cuisine locale.`
    );
  }, [selectedCommune]);

  const requestPosition = () => {
    if (!navigator.geolocation) return;
    setRequested(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserPosition({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => setRequested(false),
      { enableHighAccuracy: false, timeout: 10000 }
    );
  };

  const distTo = (lat?: number, lng?: number) => {
    if (!userPosition || !lat || !lng) return null;
    return calculateDistanceKm(userPosition, { latitude: lat, longitude: lng });
  };

  const getStartingPrice = (traiteur: any): string => {
    // 1) Vérifier priceRange ou price_level (champ futur-compatible)
    if (traiteur.priceRange) return `À partir de ${traiteur.priceRange}`;
    if (traiteur.price_level) return `À partir de ${traiteur.price_level}`;

    // 2) Utiliser startingAt déjà calculé depuis les menuItems
    if (traiteur.startingAt && traiteur.startingAt > 0) {
      return `À partir de ${formatEuro(traiteur.startingAt)}`;
    }

    // 3) Fallback : chercher dans mockCatalog les produits de ce traiteur
    const traiteurName = (traiteur.name || '').toLowerCase().trim();
    const products = mockProducts.filter(
      (p) => p.vendor?.toLowerCase().trim() === traiteurName
    );
    if (products.length > 0) {
      const minPrice = Math.min(...products.map((p) => p.price));
      return `À partir de ${formatEuro(minPrice)}`;
    }

    // 4) Rien trouvé
    return 'Prix à confirmer';
  };

  const filtered = traiteurSpaces
    .filter(t => !selectedCommune || t.zone?.toLowerCase().includes(selectedCommune.toLowerCase()))
    .sort((a, b) => {
      if (userPosition) {
        const dA = distTo(a.latitude, a.longitude) ?? 999;
        const dB = distTo(b.latitude, b.longitude) ?? 999;
        return dA - dB;
      }
      return 0;
    });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <BackBar label='Accueil' backTo='/' />
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
          Nos traiteurs partenaires
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
          Découvrez les traiteurs, snacks et restaurateurs locaux de Martinique référencés sur DeliKreol.
        </p>

        {/* Commune filter + geoloc */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-6">
          <select
            value={selectedCommune}
            onChange={e => setSelectedCommune(e.target.value)}
            className="px-4 py-2 rounded-xl border border-orange-200 text-sm bg-white outline-none focus:border-orange-400"
          >
            <option value="">Toutes les communes</option>
            {martiniqueCommunes.slice(0, 34).map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
          {!userPosition && (
            <button onClick={requestPosition} className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl text-sm font-bold hover:bg-orange-200">
              <Locate className="w-4 h-4" /> Autour de moi
            </button>
          )}
          {userPosition && (
            <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full font-semibold">
              📍 Tri par proximité actif
            </span>
          )}
          {requested && !userPosition && (
            <span className="text-xs text-gray-400">Demande de position...</span>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((traiteur) => {
          const isVerified = traiteur.status === 'public confirmé';
          const menuCount = traiteur.menuItems?.length || 0;

          return (
            <Link
              key={traiteur.slug}
              to={`/traiteur/${traiteur.slug}`}
              className="card group block bg-card rounded-2xl overflow-hidden shadow-elegant hover:shadow-warm transition-all duration-300 hover:-translate-y-1 border border-border"
            >
              {/* Cover image */}
              <div className="aspect-video bg-muted relative overflow-hidden">
                {traiteur.heroImage ? (
                  <img loading="lazy" src={traiteur.heroImage} alt={traiteur.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50">
                    <ChefHat className="w-12 h-12 text-primary/30" />
                  </div>
                )}
                {/* Portrait overlay */}
                {traiteur.portraitImage && (
                  <div className="absolute bottom-0 left-4 translate-y-1/3">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white">
                      <img loading="lazy" src={traiteur.portraitImage} alt={traiteur.name} className="w-full h-full object-cover" />
                    </div>
                  </div>
                )}
                {!isVerified && (
                  <div className="absolute top-3 right-3 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    À vérifier
                  </div>
                )}
                {isVerified && (
                  <div className="absolute top-3 left-3 bg-emerald-100 text-emerald-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Partenaire
                  </div>
                )}
                {traiteur.photoStatus && traiteur.photoStatus !== 'confirmée' && (
                  <div className="absolute bottom-3 left-3 bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                    📸 {traiteur.photoStatus === 'externe à vérifier' ? 'Externe' : 'À confirmer'}
                  </div>
                )}
                {/* Prix indicatif */}
                <div className="badge absolute bottom-3 right-3 bg-white/90 text-foreground text-[11px] px-2.5 py-1 rounded-full font-semibold shadow-sm flex items-center gap-1">
                  <Euro className="w-3 h-3 text-orange-600" />
                  {getStartingPrice(traiteur)}
                </div>
              </div>

              {/* Content */}
              <div className="p-5 pt-8">
                <h3 className="font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                      {traiteur.name}
                                    </h3>
                                    <RatingBadge traiteurSlug={traiteur.slug} />
                <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {traiteur.commune || traiteur.zone || 'Martinique'}
                  </span>
                  {(() => {
                    const dist = distTo(traiteur.latitude, traiteur.longitude);
                    return dist !== null ? (
                      <span className="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full font-semibold">
                        {dist.toFixed(1)} km
                      </span>
                    ) : null;
                  })()}
                  {traiteur.specialty && (
                    <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
                      {traiteur.specialty}
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {traiteur.description || traiteur.offer || 'Découvrez les spécialités de ce prestataire.'}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {menuCount > 0 ? `${menuCount} plat${menuCount > 1 ? 's' : ''}` : 'Menu à confirmer'}
                  </span>
                  <span className="text-primary font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Voir la vitrine <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* CTA */}
      <div className="mt-12 text-center bg-gradient-to-r from-primary/5 to-secondary/5 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-2">Vous êtes traiteur en Martinique ?</h2>
        <p className="text-muted-foreground mb-4">
          Rejoignez DeliKreol et touchez de nouveaux clients locaux.
        </p>
        <Link
          to="/devenir-partenaire"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
        >
          <Star className="w-4 h-4" />
          Devenir partenaire
        </Link>
      </div>
    </div>
  );
}

export default TraiteursListPage;