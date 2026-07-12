import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ChefHat,
  Eye,
  LocateFixed,
  Map,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Layout } from '../../components/layout/Layout';
import { BackBar } from '../../components/BackBar';
import { ProductThumbnail } from '../../components/ProductThumbnail';
import { InteractiveMap } from '../../components/InteractiveMap';
import { mockProducts, HEALTH_TAGS, type HealthTag, type LocalProduct } from '../../data/mockCatalog';
import { traiteurSpaces } from '../../data/traiteurs';
import {
  findCommune,
  martiniqueCommunes,
  normalizeCommuneQuery,
} from '../../data/martiniqueCommunes';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import { calculateDistanceKm } from '../../services/geolocation';
import { trackPublicView } from '../../services/metricsService';
import { setPageMeta } from '../../services/seo';
import type { Product } from '../../lib/supabase';

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

const BUDGET_RANGES = [
  { label: 'Tous les prix', min: 0, max: Number.POSITIVE_INFINITY },
  { label: 'Moins de 10 €', min: 0, max: 10 },
  { label: '10 € – 15 €', min: 10, max: 15 },
  { label: '15 € – 25 €', min: 15, max: 25 },
  { label: 'Plus de 25 €', min: 25, max: Number.POSITIVE_INFINITY },
];

type SortMode = 'default' | 'prix-croissant' | 'prix-decroissant' | 'disponible' | 'distance';

function normalizeVendor(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function localProductToCartProduct(product: LocalProduct): Product {
  return {
    id: product.id,
    vendor_id: product.vendor,
    name: product.name,
    description: product.description ?? null,
    category: product.category,
    price: product.price,
    image_url: product.image ?? null,
    is_available: product.available !== false,
    stock_quantity: null,
    created_at: new Date().toISOString(),
  };
}

export default function CataloguePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addItem } = useCart();
  const { showSuccess } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') ?? '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('cat') ?? 'tous');
  const [selectedCommune, setSelectedCommune] = useState(searchParams.get('commune') ?? '');
  const [selectedBudgetIndex, setSelectedBudgetIndex] = useState(0);
  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [selectedHealthTag, setSelectedHealthTag] = useState<HealthTag | ''>('');
  const [selectedDeliveryOption, setSelectedDeliveryOption] = useState('');
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [userPosition, setUserPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoRequested, setGeoRequested] = useState(false);

  useEffect(() => {
    setPageMeta(
      'Catalogue — DeliKreol | Plats & traiteurs en Martinique',
      'Parcourez notre sélection de plats créoles et traiteurs partenaires en Martinique. Livraison et retrait.',
      'catalogue, plats créoles, traiteurs Martinique, livraison repas',
    );
    trackPublicView();
  }, []);

  const vendorMap = useMemo(() => {
    return new Map(
      traiteurSpaces.map((space) => [
        normalizeVendor(space.name),
        {
          space,
          partnerImage: space.heroImage || space.galleryImages?.[0] || space.portraitImage || null,
          healthTags: space.healthTags || [],
          deliveryOptions: space.deliveryOptions || [],
        },
      ]),
    );
  }, []);

  const allProducts = useMemo<LocalProduct[]>(() => {
    const merged = [...mockProducts];
    const knownIds = new Set(merged.map((product) => product.id));

    for (const space of traiteurSpaces) {
      for (const item of space.menuItems) {
        const id = `${space.slug}-${slugify(item.name)}`;
        if (knownIds.has(id)) continue;

        merged.push({
          id,
          name: item.name,
          vendor: space.name,
          price: item.price,
          category: item.category,
          image: item.image ?? undefined,
          description: item.description,
          zone: space.commune || space.zone,
          available: true,
          featured: item.featured,
          healthTags: space.healthTags,
        });
        knownIds.add(id);
      }
    }

    return merged;
  }, []);

  const filteredProducts = useMemo(() => {
    let results = [...allProducts];

    if (searchQuery.trim()) {
      const query = normalizeCommuneQuery(searchQuery);
      results = results.filter((product) => {
        const haystack = normalizeCommuneQuery(
          `${product.name} ${product.vendor} ${product.description ?? ''} ${product.zone ?? ''} ${product.category}`,
        );
        return haystack.includes(query);
      });
    }

    if (selectedCategory !== 'tous') {
      const categoryName = ALL_CATEGORIES.find((category) => category.id === selectedCategory)?.name ?? '';
      results = results.filter(
        (product) => normalizeCommuneQuery(product.category) === normalizeCommuneQuery(categoryName),
      );
    }

    if (selectedCommune) {
      const commune = findCommune(selectedCommune);
      const communeName = commune?.name || selectedCommune;
      const normalizedCommune = normalizeCommuneQuery(communeName);
      results = results.filter((product) => (
        product.zone ? normalizeCommuneQuery(product.zone).includes(normalizedCommune) : false
      ));
    }

    const budget = BUDGET_RANGES[selectedBudgetIndex];
    results = results.filter((product) => product.price >= budget.min && product.price < budget.max);

    if (showAvailableOnly) {
      results = results.filter((product) => product.available !== false);
    }

    if (selectedHealthTag) {
      results = results.filter((product) => {
        const vendorData = vendorMap.get(normalizeVendor(product.vendor));
        const tags = product.healthTags || vendorData?.healthTags || [];
        return tags.includes(selectedHealthTag);
      });
    }

    if (selectedDeliveryOption) {
      results = results.filter((product) => {
        const vendorData = vendorMap.get(normalizeVendor(product.vendor));
        return vendorData?.deliveryOptions.includes(selectedDeliveryOption as never) ?? false;
      });
    }

    if (sortMode === 'prix-croissant') {
      results.sort((left, right) => left.price - right.price);
    } else if (sortMode === 'prix-decroissant') {
      results.sort((left, right) => right.price - left.price);
    } else if (sortMode === 'disponible') {
      results.sort((left, right) => Number(right.available !== false) - Number(left.available !== false));
    } else if (sortMode === 'distance' && userPosition) {
      results.sort((left, right) => {
        const leftSpace = vendorMap.get(normalizeVendor(left.vendor))?.space;
        const rightSpace = vendorMap.get(normalizeVendor(right.vendor))?.space;
        const leftDistance = leftSpace?.latitude && leftSpace?.longitude
          ? calculateDistanceKm(userPosition, { latitude: leftSpace.latitude, longitude: leftSpace.longitude })
          : Number.POSITIVE_INFINITY;
        const rightDistance = rightSpace?.latitude && rightSpace?.longitude
          ? calculateDistanceKm(userPosition, { latitude: rightSpace.latitude, longitude: rightSpace.longitude })
          : Number.POSITIVE_INFINITY;
        return leftDistance - rightDistance;
      });
    }

    return results;
  }, [
    allProducts,
    searchQuery,
    selectedCategory,
    selectedCommune,
    selectedBudgetIndex,
    showAvailableOnly,
    selectedHealthTag,
    selectedDeliveryOption,
    sortMode,
    userPosition,
    vendorMap,
  ]);

  const mapPoints = useMemo(() => (
    traiteurSpaces
      .filter((space) => space.status === 'public confirmé' && space.latitude && space.longitude)
      .map((space) => ({
        name: space.name,
        type: 'partner' as const,
        latitude: space.latitude as number,
        longitude: space.longitude as number,
        address: space.address || space.zone,
        status: 'Disponible',
      }))
  ), []);

  const hasActiveFilters = Boolean(
    searchQuery.trim() ||
    selectedCategory !== 'tous' ||
    selectedCommune ||
    selectedBudgetIndex !== 0 ||
    showAvailableOnly ||
    selectedHealthTag ||
    selectedDeliveryOption ||
    sortMode !== 'default',
  );

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('tous');
    setSelectedCommune('');
    setSelectedBudgetIndex(0);
    setShowAvailableOnly(false);
    setSelectedHealthTag('');
    setSelectedDeliveryOption('');
    setSortMode('default');
    setSearchParams({});
  };

  const requestGeo = () => {
    if (!navigator.geolocation) return;
    setGeoRequested(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserPosition({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setSortMode('distance');
        setGeoRequested(false);
      },
      () => setGeoRequested(false),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const handleAddToCart = (product: LocalProduct) => {
    addItem(localProductToCartProduct(product));
    showSuccess(`${product.name} ajouté au panier`);
  };

  return (
    <Layout>
      <BackBar label="Accueil" backTo="/" />
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/80">Marketplace locale</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Catalogue</h1>
            <p className="mt-3 max-w-2xl text-base text-white/85 md:text-lg">
              Produits, plats et offres de traiteurs martiniquais. Les vignettes génériques sont clairement signalées.
            </p>

            <div className="relative mt-7 max-w-3xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Rechercher un plat, un traiteur ou une commune…"
                className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-12 text-base text-foreground shadow-lg outline-none ring-offset-2 focus:ring-4 focus:ring-white/35"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted"
                  aria-label="Effacer la recherche"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">
                {filteredProducts.length} référence{filteredProducts.length > 1 ? 's' : ''}
              </p>
              <h2 className="text-2xl font-black text-foreground">Choisissez votre prochain repas</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((value) => !value)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold text-foreground shadow-sm hover:border-primary/40"
                aria-expanded={showFilters}
              >
                <SlidersHorizontal className="h-4 w-4" /> Filtres
              </button>
              <button
                type="button"
                onClick={() => setShowMap((value) => !value)}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold text-foreground shadow-sm hover:border-primary/40"
                aria-pressed={showMap}
              >
                <Map className="h-4 w-4" /> {showMap ? 'Voir les cartes' : 'Voir la carte'}
              </button>
              <button
                type="button"
                onClick={requestGeo}
                disabled={geoRequested}
                className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground shadow-sm disabled:opacity-60"
              >
                <LocateFixed className="h-4 w-4" /> {geoRequested ? 'Localisation…' : 'Près de moi'}
              </button>
            </div>
          </div>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {ALL_CATEGORIES.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setSelectedCategory(category.id)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                  selectedCategory === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border bg-white text-foreground hover:border-primary/40'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {showFilters && (
            <div className="mb-8 grid gap-4 rounded-3xl border border-border bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-5">
              <label className="space-y-2 text-sm font-bold text-foreground">
                Commune
                <select
                  value={selectedCommune}
                  onChange={(event) => setSelectedCommune(event.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium"
                >
                  <option value="">Toute la Martinique</option>
                  {martiniqueCommunes.map((commune) => (
                    <option key={commune.name} value={commune.name}>{commune.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-bold text-foreground">
                Budget
                <select
                  value={selectedBudgetIndex}
                  onChange={(event) => setSelectedBudgetIndex(Number(event.target.value))}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium"
                >
                  {BUDGET_RANGES.map((range, index) => (
                    <option key={range.label} value={index}>{range.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-bold text-foreground">
                Besoin alimentaire
                <select
                  value={selectedHealthTag}
                  onChange={(event) => setSelectedHealthTag(event.target.value as HealthTag | '')}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium"
                >
                  <option value="">Tous</option>
                  {HEALTH_TAGS.map((tag) => (
                    <option key={tag.id} value={tag.id}>{tag.name}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-bold text-foreground">
                Livraison spéciale
                <select
                  value={selectedDeliveryOption}
                  onChange={(event) => setSelectedDeliveryOption(event.target.value)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium"
                >
                  <option value="">Toutes</option>
                  <option value="retraite">Seniors / retraite</option>
                  <option value="bateau">Bateau</option>
                  <option value="infirmiere">Infirmière / santé</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-bold text-foreground">
                Trier
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value as SortMode)}
                  className="w-full rounded-xl border border-border bg-white px-3 py-2.5 text-sm font-medium"
                >
                  <option value="default">Pertinence</option>
                  <option value="prix-croissant">Prix croissant</option>
                  <option value="prix-decroissant">Prix décroissant</option>
                  <option value="disponible">Disponibles d'abord</option>
                  <option value="distance">Distance</option>
                </select>
              </label>

              <button
                type="button"
                onClick={() => setShowAvailableOnly((value) => !value)}
                className={`rounded-xl px-4 py-2.5 text-sm font-bold md:col-span-2 xl:col-span-1 ${
                  showAvailableOnly
                    ? 'bg-success text-success-foreground'
                    : 'border border-border bg-muted text-foreground'
                }`}
              >
                {showAvailableOnly ? '✓ Disponibles uniquement' : 'Afficher uniquement les disponibles'}
              </button>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/5 md:col-span-2 xl:col-span-1"
                >
                  Réinitialiser
                </button>
              )}
            </div>
          )}

          {showMap ? (
            <div className="mb-8 overflow-hidden rounded-3xl border border-border bg-white p-3 shadow-sm">
              {mapPoints.length > 0 ? (
                <InteractiveMap points={mapPoints} compact />
              ) : (
                <div className="flex min-h-64 items-center justify-center text-center text-muted-foreground">
                  Les positions partenaires sont en cours de validation.
                </div>
              )}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-catalogue-grid="true">
              {filteredProducts.map((product) => {
                const vendorData = vendorMap.get(normalizeVendor(product.vendor));
                const partnerImage = vendorData?.partnerImage || null;
                const tags = product.healthTags || vendorData?.healthTags || [];

                return (
                  <article
                    key={product.id}
                    className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
                    data-product-card={product.id}
                  >
                    <ProductThumbnail
                      src={product.image}
                      partnerImage={partnerImage}
                      productName={product.name}
                      vendorName={product.vendor}
                      category={product.category}
                      aspectRatio="3 / 2"
                      containerClassName="w-full bg-muted"
                      imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                      showBadge
                    />

                    <div className="flex flex-1 flex-col p-4">
                      <div className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                        {product.category}
                      </div>
                      <h3 className="line-clamp-2 min-h-[3rem] text-lg font-black leading-snug text-foreground">
                        {product.name}
                      </h3>
                      <p className="mt-1 text-sm font-semibold text-muted-foreground">{product.vendor}</p>

                      {product.zone && (
                        <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5" /> {product.zone}
                        </p>
                      )}

                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tags.slice(0, 3).map((tag) => {
                            const tagInfo = HEALTH_TAGS.find((item) => item.id === tag);
                            return tagInfo ? (
                              <span key={tag} className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">
                                {tagInfo.icon} {tagInfo.name}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      {product.description && (
                        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                          {product.description}
                        </p>
                      )}

                      <div className="mt-auto pt-5">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-2xl font-black text-foreground">
                              {product.price.toFixed(2).replace('.', ',')} €
                            </p>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Prix DELIKREOL</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${
                            product.available !== false
                              ? 'bg-success/10 text-success'
                              : 'bg-amber-100 text-amber-800'
                          }`}>
                            {product.available !== false ? 'Disponible' : 'Sur confirmation'}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                          <button
                            type="button"
                            onClick={() => handleAddToCart(product)}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-black text-primary-foreground transition hover:bg-primary/90"
                          >
                            <Plus className="h-4 w-4" /> Ajouter
                          </button>
                          <Link
                            to={`/produit/${product.id}`}
                            className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted text-foreground transition hover:border-primary/40 hover:text-primary"
                            aria-label={`Voir le détail de ${product.name}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-white py-20 text-center">
              <ChefHat className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-xl font-black text-foreground">Aucun résultat</h3>
              <p className="mt-2 text-muted-foreground">Essayez d'élargir votre recherche ou de retirer un filtre.</p>
              <button
                type="button"
                onClick={clearFilters}
                className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground"
              >
                Réinitialiser les filtres
              </button>
            </div>
          )}
        </section>
      </main>
    </Layout>
  );
}
