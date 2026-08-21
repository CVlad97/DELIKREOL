import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  Eye,
  ImageIcon,
  Loader,
  MessageCircle,
  RefreshCw,
  Search,
  SlidersHorizontal,
  Store,
  X,
} from 'lucide-react';
import { ImageLightbox } from '../../components/ImageLightbox';
import { ProductThumbnail } from '../../components/ProductThumbnail';
import { mockProducts, type LocalProduct } from '../../data/mockCatalog';
import { partnerProfiles, type PartnerProfile } from '../../data/partnerProfiles';
import { isDemoMode, supabase } from '../../lib/supabase';

type CorrectionStatus = 'pending' | 'reviewed' | 'applied';
type StatusFilter = 'all' | CorrectionStatus;

type Correction = {
  id: string;
  partner_id?: string | null;
  partner_name?: string | null;
  responsable?: string | null;
  telephone?: string | null;
  email?: string | null;
  commune?: string | null;
  description?: string | null;
  horaires?: string | null;
  modes?: string | string[] | null;
  plats?: string | null;
  prix?: string | null;
  compositions?: string | null;
  allergenes?: string | null;
  remarques?: string | null;
  status: CorrectionStatus;
  created_at: string;
};

type VendorRow = {
  id: string;
  user_id?: string | null;
  business_name?: string | null;
  name?: string | null;
  legal_name?: string | null;
  description?: string | null;
  story?: string | null;
  promise?: string | null;
  specialty?: string | null;
  logo_url?: string | null;
  image_url?: string | null;
  hero_image?: string | null;
  portrait_image?: string | null;
  establishment_photo_url?: string | null;
  gallery_images?: string[] | null;
};

type ProductRow = {
  id: string;
  vendor_id: string;
  name: string;
  description?: string | null;
  price?: number | string | null;
  image_url?: string | null;
  category?: string | null;
  is_available?: boolean | null;
};

type PreviewProduct = {
  id: string;
  name: string;
  description: string;
  price: number | null;
  image: string | null;
  category: string;
  source: 'supabase' | 'catalogue';
};

type EnrichedCorrection = {
  correction: Correction;
  partnerName: string;
  vendor: VendorRow | null;
  profile: PartnerProfile | null;
  products: PreviewProduct[];
  matchLabel: string;
};

type LightboxImage = { src: string; alt: string; caption?: string };

const LOCAL_STORAGE_KEY = 'delikreol_partner_corrections_v1';
const STATUS_FILTERS: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'Toutes' },
  { id: 'pending', label: 'En attente' },
  { id: 'reviewed', label: 'Revues' },
  { id: 'applied', label: 'Appliquées' },
];

const PARTNER_ALIASES: Record<string, string> = {
  'snack save peyia': "snack save peyia",
  'snack save peyia riviere pilote': "snack save peyia",
  'snack save peyi a': "snack save peyia",
  'saveur afrique': "saveurs d afrique",
  'lodika afrique': "saveurs d afrique",
  'virtuel goute mwen': 'goute mwen',
  'les delices de ninice': 'les delices de ninice',
};

function normalize(value: string | null | undefined): string {
  const normalized = (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
  return PARTNER_ALIASES[normalized] || normalized;
}

function readLocalCorrections(): Correction[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || '[]');
    return Array.isArray(parsed) ? (parsed as Correction[]) : [];
  } catch {
    return [];
  }
}

function whatsappHref(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  const international = digits.startsWith('0') ? `596${digits.slice(1)}` : digits;
  return `https://wa.me/${international}`;
}

function vendorName(vendor: VendorRow | null): string {
  return vendor?.business_name || vendor?.name || vendor?.legal_name || '';
}

function productPrice(value: number | string | null | undefined): number | null {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function uniqueImages(images: Array<string | null | undefined>): string[] {
  return [...new Set(images.filter((image): image is string => Boolean(image?.trim())))];
}

function matchesPartner(product: LocalProduct, name: string): boolean {
  return normalize(product.vendor) === normalize(name);
}

function staticProductsFor(name: string): PreviewProduct[] {
  return mockProducts
    .filter((product) => matchesPartner(product, name))
    .map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description || 'Description non renseignée.',
      price: product.price,
      image: product.image || null,
      category: product.category,
      source: 'catalogue' as const,
    }));
}

function resolveProfile(name: string): PartnerProfile | null {
  return partnerProfiles.find((profile) => normalize(profile.name) === normalize(name)) || null;
}

function resolveVendor(correction: Correction, vendors: VendorRow[]): VendorRow | null {
  const rawPartnerId = correction.partner_id || '';
  if (rawPartnerId.startsWith('account:')) {
    const userId = rawPartnerId.slice('account:'.length);
    const byUser = vendors.find((vendor) => vendor.user_id === userId);
    if (byUser) return byUser;
  }
  const byId = vendors.find((vendor) => vendor.id === rawPartnerId);
  if (byId) return byId;

  const wantedNames = [correction.partner_name, correction.responsable]
    .map(normalize)
    .filter(Boolean);
  const candidates = vendors.filter((vendor) => {
    const names = [vendor.business_name, vendor.name, vendor.legal_name].map(normalize);
    return wantedNames.some((wanted) => names.includes(wanted));
  });
  return candidates.length === 1 ? candidates[0] : null;
}

function enrichCorrection(
  correction: Correction,
  vendors: VendorRow[],
  products: ProductRow[],
): EnrichedCorrection {
  const vendor = resolveVendor(correction, vendors);
  const resolvedName = vendorName(vendor) || correction.partner_name || correction.responsable || 'Partenaire non identifié';
  const profile = resolveProfile(resolvedName);
  const supabaseProducts = vendor
    ? products
        .filter((product) => product.vendor_id === vendor.id)
        .map((product) => ({
          id: product.id,
          name: product.name,
          description: product.description || 'Description non renseignée.',
          price: productPrice(product.price),
          image: product.image_url || null,
          category: product.category || 'Sans catégorie',
          source: 'supabase' as const,
        }))
    : [];
  const catalogueProducts = staticProductsFor(resolvedName);

  return {
    correction,
    partnerName: resolvedName,
    vendor,
    profile,
    products: supabaseProducts.length > 0 ? supabaseProducts : catalogueProducts,
    matchLabel: vendor
      ? 'Correspondance Supabase'
      : profile || catalogueProducts.length > 0
        ? 'Correspondance catalogue éditorial'
        : 'Correspondance à confirmer',
  };
}

function CorrectionField({ label, value }: { label: string; value: string | string[] | null | undefined }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-1 whitespace-pre-wrap text-sm text-foreground">
        {Array.isArray(value) ? value.join(', ') : value}
      </div>
    </div>
  );
}

export default function AdminPartnerCorrections() {
  const [items, setItems] = useState<Correction[]>([]);
  const [vendors, setVendors] = useState<VendorRow[]>([]);
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<'supabase' | 'local'>('supabase');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [partnerFilter, setPartnerFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [lightbox, setLightbox] = useState<{ images: LightboxImage[]; index: number } | null>(null);

  const load = async () => {
    setLoading(true);
    setError('');
    if (isDemoMode) {
      setItems(readLocalCorrections());
      setVendors([]);
      setProducts([]);
      setSource('local');
      setLoading(false);
      return;
    }

    const [correctionsResult, vendorsResult, productsResult] = await Promise.all([
      supabase.from('partner_corrections').select('*').order('created_at', { ascending: false }),
      supabase.from('vendors').select('*'),
      supabase.from('products').select('id, vendor_id, name, description, price, image_url, category, is_available'),
    ]);

    const errors = [correctionsResult.error, vendorsResult.error, productsResult.error].filter(Boolean);
    if (errors.length > 0) {
      setError(`Chargement partiel : ${errors.map((loadError) => loadError?.message).filter(Boolean).join(' · ')}`);
    }
    setItems((correctionsResult.data || []) as Correction[]);
    setVendors((vendorsResult.data || []) as VendorRow[]);
    setProducts((productsResult.data || []) as ProductRow[]);
    setSource('supabase');
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const enriched = useMemo(
    () => items.map((correction) => enrichCorrection(correction, vendors, products)),
    [items, products, vendors],
  );

  const partnerNames = useMemo(
    () => [...new Set(enriched.map((item) => item.partnerName))].sort((left, right) => left.localeCompare(right, 'fr')),
    [enriched],
  );

  const filtered = useMemo(() => {
    const query = normalize(search);
    return enriched.filter((item) => {
      const correction = item.correction;
      if (statusFilter !== 'all' && correction.status !== statusFilter) return false;
      if (partnerFilter !== 'all' && item.partnerName !== partnerFilter) return false;
      if (!query) return true;
      const haystack = normalize([
        item.partnerName,
        correction.responsable,
        correction.description,
        correction.plats,
        correction.prix,
        correction.compositions,
        correction.allergenes,
        correction.remarques,
        ...item.products.map((product) => `${product.name} ${product.description}`),
      ].filter(Boolean).join(' '));
      return haystack.includes(query);
    });
  }, [enriched, partnerFilter, search, statusFilter]);

  const updateStatus = async (id: string, status: 'reviewed' | 'applied') => {
    setUpdatingId(id);
    setError('');
    if (isDemoMode) {
      const updated = readLocalCorrections().map((correction) =>
        correction.id === id ? { ...correction, status } : correction,
      );
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      setItems(updated);
      setUpdatingId(null);
      return;
    }

    const { error: updateError } = await supabase
      .from('partner_corrections')
      .update({ status })
      .eq('id', id);
    if (updateError) {
      setError(`Mise à jour refusée : ${updateError.message}`);
      setUpdatingId(null);
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item));
    setUpdatingId(null);
  };

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPartnerFilter('all');
  };

  const pending = items.filter((correction) => correction.status === 'pending').length;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-3 text-3xl font-black">
            <AlertTriangle className="h-7 w-7 text-amber-500" />
            Corrections partenaires
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Comparer les demandes avec la bio, les photos, les descriptions et les prix actuellement publiés.
            {pending > 0 && <span className="ml-2 font-bold text-amber-600">({pending} en attente)</span>}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">Source corrections : {source}</span>
          <button type="button" onClick={() => void load()} disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold disabled:opacity-50">
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} /> Actualiser
          </button>
        </div>
      </header>

      <section className="rounded-2xl border bg-card p-4 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-sm font-black">
          <SlidersHorizontal className="h-4 w-4 text-primary" /> Filtres et recherche
        </div>
        <div className="grid gap-3 lg:grid-cols-[minmax(220px,1fr)_220px_auto]">
          <label className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={(event) => setSearch(event.target.value)}
              placeholder="Partenaire, produit, description, prix…"
              className="w-full rounded-xl border bg-background py-2.5 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
          </label>
          <select value={partnerFilter} onChange={(event) => setPartnerFilter(event.target.value)}
            className="rounded-xl border bg-background px-3 py-2.5 text-sm">
            <option value="all">Tous les partenaires</option>
            {partnerNames.map((name) => <option key={name} value={name}>{name}</option>)}
          </select>
          <button type="button" onClick={resetFilters}
            className="inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-bold hover:bg-muted">
            <X className="h-4 w-4" /> Réinitialiser
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((status) => {
            const count = status.id === 'all' ? items.length : items.filter((item) => item.status === status.id).length;
            return (
              <button key={status.id} type="button" onClick={() => setStatusFilter(status.id)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${statusFilter === status.id ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
                {status.label} ({count})
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{filtered.length} correction(s) affichée(s)</p>
      </section>

      {loading && <div className="flex items-center justify-center gap-2 py-10 text-muted-foreground"><Loader className="h-5 w-5 animate-spin" /> Chargement…</div>}
      {error && <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"><AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> {error}</div>}
      {!loading && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed py-14 text-center text-muted-foreground">
          Aucune correction ne correspond aux filtres.
          <button type="button" onClick={resetFilters} className="ml-2 font-bold text-primary hover:underline">Réinitialiser</button>
        </div>
      )}

      <div className="space-y-5">
        {filtered.map(({ correction, partnerName, vendor, profile, products: previewProducts, matchLabel }) => {
          const expanded = expandedId === correction.id;
          const partnerImages = uniqueImages([
            vendor?.hero_image,
            vendor?.portrait_image,
            vendor?.image_url,
            vendor?.logo_url,
            vendor?.establishment_photo_url,
            ...(vendor?.gallery_images || []),
            ...previewProducts.map((product) => product.image),
          ]);
          const lightboxImages = partnerImages.map((image, index) => ({
            src: image,
            alt: `${partnerName} — visuel ${index + 1}`,
            caption: index === 0 ? partnerName : `${partnerName} — visuel ${index + 1}`,
          }));
          const bio = vendor?.story || vendor?.description || profile?.story || correction.description;

          return (
            <article key={correction.id} className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="grid gap-5 p-5 lg:grid-cols-[180px_1fr_auto]">
                <button type="button" disabled={lightboxImages.length === 0}
                  onClick={() => lightboxImages.length > 0 && setLightbox({ images: lightboxImages, index: 0 })}
                  className="group relative h-40 overflow-hidden rounded-2xl border bg-muted text-left disabled:cursor-default">
                  {partnerImages[0] ? (
                    <ProductThumbnail src={partnerImages[0]} productName={partnerName} vendorName={partnerName}
                      aspectRatio="1 / 1" containerClassName="h-full" imgClassName="h-full w-full object-cover"
                      showBadge={false} />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground"><ImageIcon className="h-8 w-8" /><span className="text-xs">Aucun visuel associé</span></div>
                  )}
                  {partnerImages[0] && <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-1 text-[10px] font-bold text-white"><Eye className="mr-1 inline h-3 w-3" /> Agrandir</span>}
                </button>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-black">{partnerName}</h2>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${correction.status === 'pending' ? 'bg-amber-100 text-amber-700' : correction.status === 'reviewed' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {correction.status === 'pending' ? 'En attente' : correction.status === 'reviewed' ? 'Revue' : 'Appliquée'}
                    </span>
                    <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">{matchLabel}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Soumis par {correction.responsable || 'responsable non renseigné'} · {new Date(correction.created_at).toLocaleDateString('fr-FR')}
                  </p>
                  {bio ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-muted-foreground">{bio}</p> : <p className="mt-3 text-sm italic text-muted-foreground">Bio non renseignée.</p>}
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {profile?.zone && <span className="rounded-full bg-muted px-2.5 py-1">{profile.zone}</span>}
                    {profile?.specialty && <span className="rounded-full bg-primary/10 px-2.5 py-1 text-primary">{profile.specialty}</span>}
                    <span className="rounded-full bg-muted px-2.5 py-1">{previewProducts.length} produit(s)</span>
                    <span className="rounded-full bg-muted px-2.5 py-1">{partnerImages.length} image(s)</span>
                  </div>
                </div>

                <div className="flex flex-row flex-wrap items-start gap-2 lg:max-w-48 lg:flex-col">
                  {correction.telephone && <a href={whatsappHref(correction.telephone)} target="_blank" rel="noopener noreferrer" className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-[#25D366] px-3 py-2 text-xs font-bold text-white"><MessageCircle className="h-3.5 w-3.5" /> WhatsApp</a>}
                  <button type="button" onClick={() => setExpandedId(expanded ? null : correction.id)} className="inline-flex w-full items-center justify-center gap-1 rounded-xl border px-3 py-2 text-xs font-bold hover:bg-muted"><BookOpen className="h-3.5 w-3.5" /> {expanded ? 'Réduire' : 'Comparer et prévisualiser'}</button>
                  {correction.status === 'pending' && <button type="button" onClick={() => void updateStatus(correction.id, 'reviewed')} disabled={updatingId === correction.id} className="w-full rounded-xl bg-blue-500 px-3 py-2 text-xs font-bold text-white disabled:opacity-50">Marquer revue</button>}
                  {correction.status !== 'applied' && <button type="button" onClick={() => void updateStatus(correction.id, 'applied')} disabled={updatingId === correction.id} className="inline-flex w-full items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50"><CheckCircle2 className="h-3.5 w-3.5" /> Marquer appliquée</button>}
                </div>
              </div>

              {expanded && (
                <div className="space-y-6 border-t bg-muted/10 p-5">
                  <section>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-black"><AlertTriangle className="h-4 w-4 text-amber-500" /> Modification demandée</h3>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      <CorrectionField label="Description / bio" value={correction.description} />
                      <CorrectionField label="Horaires" value={correction.horaires} />
                      <CorrectionField label="Modes" value={correction.modes} />
                      <CorrectionField label="Plats" value={correction.plats} />
                      <CorrectionField label="Prix" value={correction.prix} />
                      <CorrectionField label="Compositions" value={correction.compositions} />
                      <CorrectionField label="Allergènes" value={correction.allergenes} />
                      <CorrectionField label="Remarques" value={correction.remarques} />
                    </div>
                  </section>

                  <section>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <h3 className="flex items-center gap-2 text-sm font-black"><Store className="h-4 w-4 text-primary" /> Prévisualisation actuelle des produits</h3>
                      <span className="text-xs text-muted-foreground">Source : {previewProducts[0]?.source === 'supabase' ? 'Supabase' : 'catalogue éditorial'}</span>
                    </div>
                    {previewProducts.length === 0 ? (
                      <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Aucun produit relié automatiquement. Le rattachement doit être confirmé manuellement.</div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {previewProducts.map((product) => {
                          const imageIndex = product.image ? partnerImages.indexOf(product.image) : -1;
                          return (
                            <div key={`${product.source}-${product.id}`} className="overflow-hidden rounded-2xl border bg-background">
                              <ProductThumbnail src={product.image} partnerImage={partnerImages[0]} productName={product.name} vendorName={partnerName} category={product.category}
                                aspectRatio="4 / 3" containerClassName="h-44" imgClassName="h-full w-full object-cover"
                                onClick={imageIndex >= 0 ? () => setLightbox({ images: lightboxImages, index: imageIndex }) : undefined} />
                              <div className="space-y-2 p-4">
                                <div className="flex items-start justify-between gap-3">
                                  <h4 className="font-black leading-tight">{product.name}</h4>
                                  <span className="shrink-0 text-lg font-black text-primary">{product.price === null ? 'Prix à confirmer' : `${product.price.toFixed(2)} €`}</span>
                                </div>
                                <p className="line-clamp-4 text-sm leading-5 text-muted-foreground">{product.description}</p>
                                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-muted-foreground"><span>{product.category}</span><span>{product.source}</span></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                </div>
              )}
            </article>
          );
        })}
      </div>

      {lightbox && <ImageLightbox images={lightbox.images} initialIndex={lightbox.index} onClose={() => setLightbox(null)} />}
    </div>
  );
}
