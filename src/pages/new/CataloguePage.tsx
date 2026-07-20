import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ChefHat,
  Eye,
  LocateFixed,
  Map as MapIcon,
  MapPin,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { BackBar } from '../../components/BackBar';
import { ImageLightbox } from '../../components/ImageLightbox';
import { InteractiveMap } from '../../components/InteractiveMap';
import { ProductThumbnail } from '../../components/ProductThumbnail';
import { Layout } from '../../components/layout/Layout';
import { useCart } from '../../contexts/CartContext';
import { useToast } from '../../contexts/ToastContext';
import {
  HEALTH_TAGS,
  mockProducts,
  type HealthTag,
  type LocalProduct,
} from '../../data/mockCatalog';
import { martiniqueCommunes, normalizeCommuneQuery } from '../../data/martiniqueCommunes';
import { PUBLIC_HIDDEN_PRODUCT_TRAITEURS, PUBLIC_HIDDEN_TRAITEURS, traiteurSpaces, type TraiteurSpace } from '../../data/traiteurs';
import type { Product } from '../../lib/supabase';
import { calculateDistanceKm } from '../../services/geolocation';
import { isUsableThumbnail } from '../../services/catalogImageResolver';
import { trackPublicView } from '../../services/metricsService';
import { setPageMeta } from '../../services/seo';

type SortMode = 'default' | 'prix-croissant' | 'prix-decroissant' | 'disponible' | 'distance';
type DeliveryOption = 'retraite' | 'bateau' | 'infirmiere';

type VendorData = {
  space: TraiteurSpace;
  partnerImage: string | null;
  healthTags: HealthTag[];
  deliveryOptions: DeliveryOption[];
};

const CATEGORIES = [
  { id: 'tous', label: 'Tous' },
  { id: 'plats', label: 'Plats' },
  { id: 'snacking', label: 'Snacking' },
  { id: 'desserts', label: 'Desserts' },
  { id: 'boissons', label: 'Boissons' },
  { id: 'bowl', label: 'Bowl' },
  { id: 'pates', label: 'Pâtes' },
  { id: 'traiteur-evenementiel', label: 'Traiteur événementiel' },
  { id: 'commandes-entreprise', label: 'Commandes entreprise' },
];

const BUDGETS = [
  { label: 'Tous les prix', min: 0, max: Number.POSITIVE_INFINITY },
  { label: 'Moins de 10 €', min: 0, max: 10 },
  { label: '10 € – 15 €', min: 10, max: 15 },
  { label: '15 € – 25 €', min: 15, max: 25 },
  { label: 'Plus de 25 €', min: 25, max: Number.POSITIVE_INFINITY },
];

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

function toCartProduct(product: LocalProduct): Product {
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

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('cat') ?? 'tous');
  const [commune, setCommune] = useState(searchParams.get('commune') ?? '');
  const [budgetIndex, setBudgetIndex] = useState(0);
  const [healthTag, setHealthTag] = useState<HealthTag | ''>('');
  const [deliveryOption, setDeliveryOption] = useState<DeliveryOption | ''>('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [sortMode, setSortMode] = useState<SortMode>('default');
  const [showFilters, setShowFilters] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [locating, setLocating] = useState(false);
  const [position, setPosition] = useState<{ latitude: number; longitude: number } | null>(null);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string; caption: string } | null>(null);

  useEffect(() => {
    setPageMeta(
      'Catalogue — DeliKreol | Plats et traiteurs en Martinique',
      'Découvrez les plats, desserts, boissons et offres des partenaires DeliKreol en Martinique.',
      'catalogue, plats créoles, traiteurs Martinique, livraison repas',
    );
    trackPublicView();
  }, []);

  const vendorMap = useMemo<Map<string, VendorData>>(() => {
    const entries: Array<[string, VendorData]> = traiteurSpaces.map((space) => [
      normalizeVendor(space.name),
      {
        space,
        partnerImage: space.heroImage || space.galleryImages[0] || space.portraitImage || null,
        healthTags: space.healthTags || [],
        deliveryOptions: space.deliveryOptions || [],
      },
    ]);
    return new globalThis.Map(entries);
  }, []);

  const allProducts = useMemo<LocalProduct[]>(() => {
    const products: LocalProduct[] = mockProducts.filter((product) => (
      !PUBLIC_HIDDEN_TRAITEURS.has(product.vendor) &&
      !PUBLIC_HIDDEN_PRODUCT_TRAITEURS.has(product.vendor) &&
      isUsableThumbnail(product.image)
    ));
    const ids = new Set(products.map((product) => product.id));

    for (const space of traiteurSpaces) {
      for (const item of space.menuItems) {
        if (PUBLIC_HIDDEN_PRODUCT_TRAITEURS.has(space.name)) continue;
        if (!isUsableThumbnail(item.image)) continue;
        const id = `${space.slug}-${slugify(item.name)}`;
        if (ids.has(id)) continue;

        products.push({
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
        ids.add(id);
      }
    }

    return products;
  }, []);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = normalizeCommuneQuery(query.trim());
    const normalizedCommune = normalizeCommuneQuery(commune);
    const selectedBudget = BUDGETS[budgetIndex];

    const filtered = allProducts.filter((product) => {
      const vendorData = vendorMap.get(normalizeVendor(product.vendor));
      const tags: HealthTag[] = product.healthTags || vendorData?.healthTags || [];
      const deliveryOptions: DeliveryOption[] = vendorData?.deliveryOptions || [];
      const haystack = normalizeCommuneQuery(
        `${product.name} ${product.vendor} ${product.description || ''} ${product.zone || ''} ${product.category}`,
      );

      if (normalizedQuery && !haystack.includes(normalizedQuery)) return false;
      if (category !== 'tous' && normalizeCommuneQuery(product.category) !== normalizeCommuneQuery(CATEGORIES.find((item) => item.id === category)?.label || '')) return false;
      if (normalizedCommune && !normalizeCommuneQuery(product.zone || '').includes(normalizedCommune)) return false;
      if (product.price < selectedBudget.min || product.price >= selectedBudget.max) return false;
      if (availableOnly && product.available === false) return false;
      if (healthTag && !tags.includes(healthTag)) return false;
      if (deliveryOption && !deliveryOptions.includes(deliveryOption)) return false;
      return true;
    });

    if (sortMode === 'prix-croissant') filtered.sort((left, right) => left.price - right.price);
    if (sortMode === 'prix-decroissant') filtered.sort((left, right) => right.price - left.price);
    if (sortMode === 'disponible') filtered.sort((left, right) => Number(right.available !== false) - Number(left.available !== false));
    if (sortMode === 'distance' && position) {
      filtered.sort((left, right) => {
        const leftSpace = vendorMap.get(normalizeVendor(left.vendor))?.space;
        const rightSpace = vendorMap.get(normalizeVendor(right.vendor))?.space;
        const leftDistance = leftSpace?.latitude != null && leftSpace.longitude != null
          ? calculateDistanceKm(position, { latitude: leftSpace.latitude, longitude: leftSpace.longitude })
          : Number.POSITIVE_INFINITY;
        const rightDistance = rightSpace?.latitude != null && rightSpace.longitude != null
          ? calculateDistanceKm(position, { latitude: rightSpace.latitude, longitude: rightSpace.longitude })
          : Number.POSITIVE_INFINITY;
        return leftDistance - rightDistance;
      });
    }

    return filtered;
  }, [allProducts, availableOnly, budgetIndex, category, commune, deliveryOption, healthTag, position, query, sortMode, vendorMap]);

  const mapPoints = useMemo(() => traiteurSpaces
    .filter((space) => space.status === 'public confirmé' && space.latitude != null && space.longitude != null)
    .map((space) => ({
      name: space.name,
      type: 'partner' as const,
      latitude: space.latitude as number,
      longitude: space.longitude as number,
      address: space.address || space.zone,
      status: 'Disponible',
    })), []);

  const clearFilters = () => {
    setQuery('');
    setCategory('tous');
    setCommune('');
    setBudgetIndex(0);
    setHealthTag('');
    setDeliveryOption('');
    setAvailableOnly(false);
    setSortMode('default');
    setSearchParams({});
  };

  const requestLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setPosition({ latitude: coords.latitude, longitude: coords.longitude });
        setSortMode('distance');
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  };

  const addToCart = (product: LocalProduct) => {
    addItem(toCartProduct(product));
    showSuccess(`${product.name} ajouté au panier`);
  };

  const openProductPreview = (product: LocalProduct, partnerImage?: string | null) => {
    const src = product.image || partnerImage;
    if (!src) return;

    setLightboxImage({
      src,
      alt: product.name,
      caption: `${product.name} — ${product.vendor}`,
    });
  };

  return (
    <Layout>
      <BackBar label="Accueil" backTo="/" />
      <main className="min-h-screen bg-background">
        <section className="bg-gradient-to-r from-primary via-primary to-secondary text-primary-foreground">
          <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-white/80">Marketplace locale</p>
            <h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Catalogue</h1>
            <p className="mt-3 max-w-2xl text-white/85">
              Plats, desserts, boissons et prestations de partenaires martiniquais. Les visuels provisoires sont signalés clairement.
            </p>

            <div className="relative mt-7 max-w-3xl">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un plat, un traiteur ou une commune…"
                className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-12 text-foreground shadow-lg outline-none focus:ring-4 focus:ring-white/35"
              />
              {query && (
                <button type="button" onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted" aria-label="Effacer la recherche">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground">{filteredProducts.length} référence{filteredProducts.length > 1 ? 's' : ''}</p>
              <h2 className="text-2xl font-black text-foreground">Choisissez votre prochain repas</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={() => setShowFilters((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:border-primary/40" aria-expanded={showFilters}>
                <SlidersHorizontal className="h-4 w-4" /> Filtres
              </button>
              <button type="button" onClick={() => setShowMap((value) => !value)} className="inline-flex items-center gap-2 rounded-xl border border-border bg-white px-4 py-2.5 text-sm font-bold shadow-sm hover:border-primary/40" aria-pressed={showMap}>
                <MapIcon className="h-4 w-4" /> {showMap ? 'Voir les cartes' : 'Voir la carte'}
              </button>
              <button type="button" onClick={requestLocation} disabled={locating} className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-accent-foreground disabled:opacity-60">
                <LocateFixed className="h-4 w-4" /> {locating ? 'Localisation…' : 'Près de moi'}
              </button>
            </div>
          </div>

          <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((item) => (
              <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${category === item.id ? 'bg-primary text-primary-foreground' : 'border border-border bg-white hover:border-primary/40'}`}>
                {item.label}
              </button>
            ))}
          </div>

          {showFilters && (
            <div className="mb-8 grid gap-4 rounded-3xl border border-border bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-5">
              <label className="space-y-2 text-sm font-bold">Commune
                <select value={commune} onChange={(event) => setCommune(event.target.value)} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 font-medium">
                  <option value="">Toute la Martinique</option>
                  {martiniqueCommunes.map((item) => <option key={item.name} value={item.name}>{item.name}</option>)}
                </select>
              </label>

              <label className="space-y-2 text-sm font-bold">Budget
                <select value={budgetIndex} onChange={(event) => setBudgetIndex(Number(event.target.value))} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 font-medium">
                  {BUDGETS.map((item, index) => <option key={item.label} value={index}>{item.label}</option>)}
                </select>
              </label>

              <label className="space-y-2 text-sm font-bold">Besoin alimentaire
                <select value={healthTag} onChange={(event) => setHealthTag(event.target.value as HealthTag | '')} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 font-medium">
                  <option value="">Tous</option>
                  {HEALTH_TAGS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              </label>

              <label className="space-y-2 text-sm font-bold">Livraison spéciale
                <select value={deliveryOption} onChange={(event) => setDeliveryOption(event.target.value as DeliveryOption | '')} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 font-medium">
                  <option value="">Toutes</option>
                  <option value="retraite">Seniors / retraite</option>
                  <option value="bateau">Bateau</option>
                  <option value="infirmiere">Santé / infirmière</option>
                </select>
              </label>

              <label className="space-y-2 text-sm font-bold">Trier
                <select value={sortMode} onChange={(event) => setSortMode(event.target.value as SortMode)} className="w-full rounded-xl border border-border bg-white px-3 py-2.5 font-medium">
                  <option value="default">Pertinence</option>
                  <option value="prix-croissant">Prix croissant</option>
                  <option value="prix-decroissant">Prix décroissant</option>
                  <option value="disponible">Disponibles d’abord</option>
                  <option value="distance">Distance</option>
                </select>
              </label>

              <button type="button" onClick={() => setAvailableOnly((value) => !value)} className={`rounded-xl px-4 py-2.5 text-sm font-bold ${availableOnly ? 'bg-success text-success-foreground' : 'border border-border bg-muted'}`}>
                {availableOnly ? '✓ Disponibles uniquement' : 'Disponibles uniquement'}
              </button>
              <button type="button" onClick={clearFilters} className="rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-primary hover:bg-primary/5">Réinitialiser</button>
            </div>
          )}

          {showMap ? (
            <div className="mb-8 overflow-hidden rounded-3xl border border-border bg-white p-3 shadow-sm">
              {mapPoints.length > 0 ? <InteractiveMap points={mapPoints} compact /> : <div className="flex min-h-64 items-center justify-center text-muted-foreground">Positions partenaires en cours de validation.</div>}
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" data-catalogue-grid="true">
              {filteredProducts.map((product) => {
                const vendorData = vendorMap.get(normalizeVendor(product.vendor));
                const tags: HealthTag[] = product.healthTags || vendorData?.healthTags || [];

                return (
                  <article key={product.id} className="group relative flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg" data-product-card={product.id}>
                    <ProductThumbnail
                      src={product.image}
                      partnerImage={vendorData?.partnerImage || null}
                      productName={product.name}
                      vendorName={product.vendor}
                      category={product.category}
                      aspectRatio="3 / 2"
                      containerClassName="w-full cursor-zoom-in bg-muted"
                      imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
                      showBadge
                      onClick={() => openProductPreview(product, vendorData?.partnerImage)}
                    />

                    <button
                      type="button"
                      onClick={() => openProductPreview(product, vendorData?.partnerImage)}
                      className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/70 px-3 py-1.5 text-[11px] font-black uppercase tracking-wide text-white shadow-sm backdrop-blur transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
                      aria-label={`Voir ${product.name} en gros plan`}
                    >
                      <Eye className="h-3.5 w-3.5" /> Voir
                    </button>

                    <div className="flex flex-1 flex-col p-4">
                      <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{product.category}</p>
                      <h3 className="mt-1 line-clamp-2 min-h-[3rem] text-lg font-black leading-snug">{product.name}</h3>
                      <p className="mt-1 text-sm font-semibold text-muted-foreground">{product.vendor}</p>
                      {product.zone && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3.5 w-3.5" /> {product.zone}</p>}

                      {tags.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {tags.slice(0, 3).map((tag: HealthTag) => {
                            const info = HEALTH_TAGS.find((item) => item.id === tag);
                            return info ? <span key={tag} className="rounded-full bg-success/10 px-2 py-1 text-[10px] font-bold text-success">{info.icon} {info.name}</span> : null;
                          })}
                        </div>
                      )}

                      {product.description && <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.description}</p>}

                      <div className="mt-auto pt-5">
                        <div className="flex items-end justify-between gap-3">
                          <div>
                            <p className="text-2xl font-black">{product.price.toFixed(2).replace('.', ',')} €</p>
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Prix DELIKREOL</p>
                          </div>
                          <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${product.available !== false ? 'bg-success/10 text-success' : 'bg-secondary/15 text-secondary'}`}>
                            {product.available !== false ? 'Disponible' : 'Sur confirmation'}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
                          <button type="button" onClick={() => addToCart(product)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-3 py-2.5 text-sm font-black text-primary-foreground hover:bg-primary">
                            <Plus className="h-4 w-4" /> Ajouter
                          </button>
                          <button type="button" onClick={() => openProductPreview(product, vendorData?.partnerImage)} className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-muted hover:border-primary/40 hover:text-primary" aria-label={`Voir ${product.name} en gros plan`}>
                            <Eye className="h-4 w-4" />
                          </button>
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
              <h3 className="mt-4 text-xl font-black">Aucun résultat</h3>
              <p className="mt-2 text-muted-foreground">Élargissez votre recherche ou retirez un filtre.</p>
              <button type="button" onClick={clearFilters} className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-black text-primary-foreground">Réinitialiser</button>
            </div>
          )}
        </section>
        {lightboxImage && (
          <ImageLightbox images={[lightboxImage]} onClose={() => setLightboxImage(null)} />
        )}
      </main>
    </Layout>
  );
}
