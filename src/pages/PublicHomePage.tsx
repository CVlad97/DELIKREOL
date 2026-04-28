import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Briefcase,
  Camera,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
  Utensils,
} from 'lucide-react';
import { loadPublicCatalog, PublicCatalogProduct, PublicCatalogVendor } from '../services/publicCatalogService';
import { calculateOrderEconomics } from '../services/orderEconomics';
import { getMartiniqueServiceZones } from '../services/serviceZones';
import { submitPartnerLead, submitPartnerProduct, uploadPartnerProductPhoto } from '../services/partnerPortalService';

type CatalogState = {
  configured: boolean;
  vendors: PublicCatalogVendor[];
  products: PublicCatalogProduct[];
};

type PartnerFormState = {
  business_name: string;
  contact_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  commune: string;
  zone_label: string;
  activity_type: string;
  delivery_radius_km: string;
  opening_hours: string;
};

type ProductFormState = {
  business_name: string;
  product_name: string;
  description: string;
  category: string;
  price: string;
  stock_quantity: string;
};

type SubmitStatus = {
  kind: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
};

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
const whatsappBase = `https://wa.me/${whatsappNumber}`;
const shortcutCategories = ['Tous', 'Cuisine locale', 'Plats', 'Boissons', 'Epicerie', 'Service'];
const southZones = ['Ducos', 'Riviere-Salee', 'Le Diamant', 'Sainte-Luce', 'Sainte-Anne', 'Le Marin', 'Le Francois'];

const defaultPartnerForm: PartnerFormState = {
  business_name: '',
  contact_name: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  commune: '',
  zone_label: 'Secteur sud',
  activity_type: 'food_partner',
  delivery_radius_km: '8',
  opening_hours: '',
};

const defaultProductForm: ProductFormState = {
  business_name: '',
  product_name: '',
  description: '',
  category: 'Cuisine locale',
  price: '',
  stock_quantity: '',
};

export function PublicHomePage() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const [catalog, setCatalog] = useState<CatalogState>({ configured: false, vendors: [], products: [] });
  const [selected, setSelected] = useState<PublicCatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tous');
  const [partnerForm, setPartnerForm] = useState<PartnerFormState>(defaultPartnerForm);
  const [productForm, setProductForm] = useState<ProductFormState>(defaultProductForm);
  const [partnerStatus, setPartnerStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [productStatus, setProductStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [productPhoto, setProductPhoto] = useState<File | null>(null);
  const [proCompany, setProCompany] = useState('');
  const [proContact, setProContact] = useState('');
  const [proNeed, setProNeed] = useState('');

  useEffect(() => {
    let active = true;
    loadPublicCatalog()
      .then((result) => {
        if (!active) return;
        setCatalog(result);
        setError(null);
      })
      .catch(() => {
        if (!active) return;
        setCatalog({ configured: true, vendors: [], products: [] });
        setError('Le catalogue est momentanement indisponible. Aucune ligne fictive n est affichee.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ['Tous', ...Array.from(new Set(catalog.products.map((product) => product.category || 'Cuisine locale')))],
    [catalog.products],
  );

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalog.products.filter((product) => {
      const haystack = `${product.name} ${product.vendor_name} ${product.category} ${product.description}`.toLowerCase();
      const categoryMatch = category === 'Tous' || product.category === category;
      const queryMatch = !needle || haystack.includes(needle);
      return categoryMatch && queryMatch;
    });
  }, [catalog.products, category, query]);

  const heroProducts = useMemo(() => filteredProducts.slice(0, 3), [filteredProducts]);
  const featuredProducts = useMemo(() => filteredProducts.slice(0, 6), [filteredProducts]);

  const serviceZones = useMemo(() => {
    const zones = catalog.vendors.map((vendor) => vendor.zone_label).filter(Boolean);
    return Array.from(new Set([...getMartiniqueServiceZones(zones), ...southZones])).slice(0, 12);
  }, [catalog.vendors]);

  const economics = useMemo(
    () =>
      calculateOrderEconomics({
        items: selected.map((product) => ({ price: product.price, commissionRate: 0.15 })),
        deliveryFee: selected.length > 0 ? 4.5 : 0,
        serviceFee: selected.length > 0 ? 1.5 : 0,
      }),
    [selected],
  );

  const productPreviewEconomics = useMemo(() => {
    const price = Number(productForm.price || '0');
    if (!Number.isFinite(price) || price <= 0) return null;
    return calculateOrderEconomics({
      items: [{ price, commissionRate: 0.15 }],
      deliveryFee: 4.5,
      serviceFee: 1.5,
    });
  }, [productForm.price]);

  const orderLink = useMemo(() => {
    const lines = selected.map((product) => `- ${product.name} - ${product.vendor_name} - ${formatPrice(product.price)}`);
    const message = [
      'Bonjour, je souhaite commander sur DELIKREOL Martinique.',
      '',
      selected.length ? 'Selection :' : 'Je souhaite connaitre les produits disponibles maintenant.',
      ...lines,
      '',
      'Merci de confirmer la disponibilite et le retrait ou la livraison selon ma zone.',
    ].join('\n');
    return `${whatsappBase}?text=${encodeURIComponent(message)}`;
  }, [selected]);

  const partnerLink = `${whatsappBase}?text=${encodeURIComponent('Bonjour, je souhaite devenir partenaire sur DELIKREOL Martinique.')}`;

  const proLink = useMemo(() => {
    const message = [
      'Bonjour, je souhaite faire une demande entreprise sur DELIKREOL Martinique.',
      proCompany && `Entreprise : ${proCompany}`,
      proContact && `Contact : ${proContact}`,
      proNeed && `Besoin : ${proNeed}`,
    ]
      .filter(Boolean)
      .join('\n');
    return `${whatsappBase}?text=${encodeURIComponent(message)}`;
  }, [proCompany, proContact, proNeed]);

  async function handlePartnerSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPartnerStatus({ kind: 'saving', message: 'Envoi de votre demande...' });
    try {
      await submitPartnerLead({
        business_name: partnerForm.business_name,
        contact_name: partnerForm.contact_name,
        phone: partnerForm.phone,
        whatsapp: partnerForm.whatsapp || partnerForm.phone,
        email: partnerForm.email || undefined,
        address: partnerForm.address || undefined,
        commune: partnerForm.commune || undefined,
        zone_label: partnerForm.zone_label || undefined,
        activity_type: partnerForm.activity_type || undefined,
        delivery_radius_km: Number(partnerForm.delivery_radius_km || '8'),
        opening_hours: partnerForm.opening_hours || undefined,
      });
      setPartnerStatus({ kind: 'success', message: 'Demande envoyee. Nous revenons vers vous rapidement.' });
      setPartnerForm(defaultPartnerForm);
    } catch (submitError) {
      setPartnerStatus({ kind: 'error', message: getErrorMessage(submitError, 'Impossible d envoyer la demande pour le moment.') });
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductStatus({ kind: 'saving', message: 'Envoi du produit...' });
    try {
      let imageUrl: string | null = null;
      if (productPhoto) {
        const upload = await uploadPartnerProductPhoto(productPhoto);
        imageUrl = upload.publicUrl;
      }

      await submitPartnerProduct({
        business_name: productForm.business_name,
        product_name: productForm.product_name,
        description: productForm.description || undefined,
        category: productForm.category || undefined,
        price: Number(productForm.price || '0'),
        stock_quantity: productForm.stock_quantity ? Number(productForm.stock_quantity) : undefined,
        is_available: true,
        image_url: imageUrl,
      });

      setProductStatus({ kind: 'success', message: 'Produit envoye. Il sera verifie avant affichage.' });
      setProductForm(defaultProductForm);
      setProductPhoto(null);
    } catch (submitError) {
      setProductStatus({ kind: 'error', message: getErrorMessage(submitError, 'Impossible d envoyer le produit pour le moment.') });
    }
  }

  function addToSelection(product: PublicCatalogProduct) {
    setSelected((current) => [...current, product]);
  }

  function removeFromSelection(index: number) {
    setSelected((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <div className="min-h-screen bg-[#fff8ed] text-[#24170f]">
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a href="#accueil" className="flex items-center gap-3" aria-label="DELIKREOL accueil">
            <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-11 w-11 rounded-2xl shadow-[0_12px_30px_rgba(249,115,22,0.18)]" />
            <img src={`${baseUrl}branding/logo-wordmark-premium.svg`} alt="DELIKREOL" className="hidden h-10 sm:block" />
          </a>
          <nav className="hidden items-center gap-2 md:flex">
            <a href="#catalogue" className="rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-black text-white">Commander</a>
            <a href="#partenaires" className="rounded-full border border-orange-200 px-5 py-2.5 text-sm font-bold text-[#7c2d12]">Devenir partenaire</a>
            <a href="#demande-pro" className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-800">Demande pro</a>
          </nav>
          <a href="#catalogue" className="rounded-full bg-[#f97316] px-4 py-2 text-sm font-black text-white md:hidden">Commander</a>
        </div>
      </header>

      <main id="accueil">
        <section className="relative overflow-hidden border-b border-orange-100 bg-[radial-gradient(circle_at_10%_15%,rgba(251,146,60,0.22),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(16,185,129,0.14),transparent_28%),linear-gradient(135deg,#fff7ed_0%,#ffffff_48%,#fff4e6_100%)]">
          <div className="madras-strip" />
          <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 md:grid-cols-[1.05fr_0.95fr] md:py-14 lg:py-16">
            <div className="flex flex-col justify-center">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-white/90 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.22em] text-[#c2410c] shadow-sm sm:mb-6 sm:px-4 sm:py-2 sm:text-xs">
                <MapPin className="h-4 w-4" /> Martinique uniquement
              </div>
              <div className="mb-4 flex items-center gap-3 sm:mb-5 sm:gap-4">
                <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-16 w-16 rounded-[1.5rem] bg-white p-2 shadow-2xl shadow-orange-500/20 sm:h-20 sm:w-20" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.28em] text-emerald-700">Commande immediate</p>
                  <p className="text-sm font-semibold text-stone-500">Retrait ou livraison selon zone et partenaire</p>
                </div>
              </div>
              <h1 className="max-w-4xl font-display text-[2.4rem] font-black leading-[0.95] tracking-tight text-[#301607] sm:text-5xl md:text-6xl lg:text-7xl">
                Commander en Martinique sans perdre de temps.
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-stone-700 sm:mt-4 sm:text-lg sm:leading-8">
                Recherchez un plat, un produit ou un vendeur local. Ajoutez au panier, puis confirmez le retrait ou la livraison selon votre zone.
              </p>
              <div className="mt-5 rounded-[1.5rem] border border-orange-100 bg-white/95 p-2 shadow-xl shadow-orange-900/5 sm:mt-6 sm:rounded-[1.75rem] sm:p-3">
                <div className="grid gap-2 sm:grid-cols-[1fr_auto] lg:grid-cols-[1fr_auto_auto] lg:gap-3">
                  <label className="relative block">
                    <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Rechercher un plat, un produit ou un vendeur"
                      className="w-full rounded-2xl border border-orange-100 bg-orange-50/60 py-4 pl-12 pr-4 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4"
                    />
                  </label>
                  <a href="#catalogue" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-6 py-4 font-black text-white shadow-xl shadow-orange-500/25 sm:w-auto">Commander <ArrowRight className="h-5 w-5" /></a>
                  <a href="#partenaires" className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-6 py-4 font-bold text-[#7c2d12] sm:w-auto">Devenir partenaire</a>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ProofChip label="Partenaires verifies" />
                  <ProofChip label="Retrait ou livraison" />
                  <ProofChip label="Confirmation rapide" />
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:mt-6 sm:flex sm:flex-wrap">
                <a href="#catalogue" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-6 py-4 font-black text-white shadow-xl shadow-orange-500/25">Commander <ArrowRight className="h-5 w-5" /></a>
                <a href="#partenaires" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-white px-6 py-4 font-bold text-[#7c2d12]">Devenir partenaire</a>
                <a href="#demande-pro" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 font-bold text-emerald-800">Demande pro</a>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-orange-100 bg-white/88 p-3 shadow-2xl shadow-orange-900/10 backdrop-blur sm:rounded-[2rem] sm:p-4">
              {heroProducts.length > 0 ? (
                <div className="space-y-4">
                  <div className="overflow-hidden rounded-[1.5rem] bg-[#24170f] text-white">
                    <div className="relative aspect-[4/3] bg-gradient-to-br from-orange-200 via-amber-100 to-emerald-100">
                      {heroProducts[0].image_url ? (
                        <img src={heroProducts[0].image_url} alt={heroProducts[0].name} className="h-full w-full object-cover" />
                      ) : (
                        <DishPlaceholder name={heroProducts[0].name} />
                      )}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-200">Disponible maintenant</p>
                        <h2 className="mt-2 text-3xl font-black">{heroProducts[0].name}</h2>
                        <p className="mt-1 text-sm text-stone-200">{heroProducts[0].vendor_name} - {heroProducts[0].zone_label}</p>
                        <p className="mt-3 text-2xl font-black text-orange-200">{formatPrice(heroProducts[0].price)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {heroProducts.slice(1).map((product) => (
                      <div key={product.id} className="rounded-[1.25rem] border border-orange-100 bg-orange-50/60 p-4">
                        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#c2410c]">{product.category}</p>
                        <h3 className="mt-2 text-lg font-black text-[#301607]">{product.name}</h3>
                        <p className="mt-1 text-sm text-stone-500">{product.vendor_name}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <strong className="text-xl font-black text-[#24170f]">{formatPrice(product.price)}</strong>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">{product.zone_label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyHero loading={loading} configured={catalog.configured} />
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex flex-wrap gap-3">
            {shortcutCategories.map((item) => {
              const target = item === 'Tous' ? 'Tous' : item;
              const active = category === target;
              return (
                <button
                  key={item}
                  onClick={() => {
                    setCategory(target);
                    document.getElementById('catalogue')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`rounded-full border px-4 py-2 text-sm font-black transition ${active ? 'border-orange-300 bg-[#f97316] text-white' : 'border-orange-200 bg-white text-[#7c2d12] hover:-translate-y-0.5'}`}
                >
                  {item}
                </button>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-8">
          <SectionIntro
            eyebrow="Interface client"
            title="Je cherche, j ajoute, je confirme."
            text="Le parcours est court : vous trouvez un produit, vous le mettez dans la selection, puis vous confirmez le retrait ou la livraison selon votre zone."
          />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <ClientStep icon={<Search className="h-5 w-5" />} title="Je cherche" text="Recherche directe par produit, vendeur ou categorie." />
            <ClientStep icon={<ShoppingBag className="h-5 w-5" />} title="J ajoute" text="Le panier reste visible et le total estimatif se met a jour tout de suite." />
            <ClientStep icon={<MessageCircle className="h-5 w-5" />} title="Je confirme" text="WhatsApp sert a confirmer rapidement le retrait ou la livraison." />
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-10">
          <SectionIntro
            eyebrow="Par type de partenaire"
            title="Chaque partenaire voit tout de suite ou aller."
            text="Le site distingue clairement les parcours pour vendre, livrer ou gerer une demande groupee."
          />
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            <PartnerTypeCard icon={<Utensils className="h-5 w-5" />} title="Restaurant / traiteur" text="Ajouter vos informations, proposer vos produits et envoyer vos photos depuis le formulaire partenaire." />
            <PartnerTypeCard icon={<Truck className="h-5 w-5" />} title="Livraison / point relais" text="Preciser votre zone, votre rayon et vos horaires pour recevoir des demandes adaptees." />
            <PartnerTypeCard icon={<Briefcase className="h-5 w-5" />} title="Entreprise / commande groupee" text="Envoyer une demande claire pour repas d equipe, besoin recurent ou commande programmee." />
          </div>
        </section>

        <section id="catalogue" className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionIntro
                eyebrow="Catalogue"
                title="Produits disponibles maintenant"
                text="Prix, vendeur, zone et bouton d ajout sont visibles tout de suite. Vous ne voyez que les lignes reelles disponibles."
              />
              <a href={orderLink} className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#f97316] px-5 py-3 font-black text-white">Commander <ArrowRight className="h-5 w-5" /></a>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_260px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher un plat, un produit ou un partenaire"
                  className="w-full rounded-2xl border border-orange-100 bg-orange-50/60 py-4 pl-12 pr-4 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4"
                />
              </label>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-4 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4"
              >
                {categories.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            {loading && <InfoBanner tone="neutral" message="Chargement des produits disponibles..." />}
            {error && <InfoBanner tone="warning" message={error} />}
            {!loading && filteredProducts.length === 0 && <EmptyCatalog configured={catalog.configured} />}

            {filteredProducts.length > 0 && (
              <div className="mt-8 space-y-8">
                <div>
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-xl font-black text-[#301607]">A regarder en premier</h3>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-stone-400">{featuredProducts.length} cartes</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {featuredProducts.map((product) => (
                      <ProductCard key={`top-${product.id}`} product={product} onAdd={() => addToSelection(product)} compact />
                    ))}
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
                  <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                    {filteredProducts.map((product) => (
                      <ProductCard key={product.id} product={product} onAdd={() => addToSelection(product)} />
                    ))}
                  </div>
                  <SelectionPanel products={selected} economics={economics} orderLink={orderLink} onRemove={removeFromSelection} />
                </div>
              </div>
            )}
          </div>
        </section>

        <section id="zones" className="mx-auto max-w-7xl px-4 py-12">
          <SectionIntro
            eyebrow="Zones et confiance"
            title="Zones servies claires, partenaires visibles"
            text="Les zones sont affichees simplement. Les partenaires visibles ont deja leur place dans le catalogue reel."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(serviceZones.length ? serviceZones : southZones).map((zone) => (
              <ZoneCard key={zone} zone={zone} />
            ))}
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {catalog.vendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
          {!loading && catalog.vendors.length === 0 && (
            <InfoBanner tone="neutral" message="Aucun partenaire verifie n est visible pour le moment." />
          )}
        </section>

        <section id="partenaires" className="bg-[#fff1df] py-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionIntro
              eyebrow="Partenaire"
              title="Choisissez votre formulaire et envoyez vos informations rapidement"
              text="Un formulaire pour vous presenter, un second pour ajouter un produit et une photo. Le parcours reste direct et lisible."
            />
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr_1.05fr]">
              <SouthCoverageCard zones={southZones} />

              <FormCard title="Devenir partenaire" subtitle="Restaurant, traiteur, point relais ou livraison : envoyez vos infos principales.">
                <form className="space-y-3" onSubmit={handlePartnerSubmit}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextInput value={partnerForm.business_name} onChange={(value) => setPartnerForm((current) => ({ ...current, business_name: value }))} placeholder="Nom de l etablissement" required className="sm:col-span-2" />
                    <TextInput value={partnerForm.contact_name} onChange={(value) => setPartnerForm((current) => ({ ...current, contact_name: value }))} placeholder="Contact" required />
                    <TextInput value={partnerForm.phone} onChange={(value) => setPartnerForm((current) => ({ ...current, phone: value }))} placeholder="Telephone" required />
                    <TextInput value={partnerForm.whatsapp} onChange={(value) => setPartnerForm((current) => ({ ...current, whatsapp: value }))} placeholder="WhatsApp" />
                    <TextInput value={partnerForm.email} onChange={(value) => setPartnerForm((current) => ({ ...current, email: value }))} placeholder="Email" />
                    <TextInput value={partnerForm.address} onChange={(value) => setPartnerForm((current) => ({ ...current, address: value }))} placeholder="Adresse" className="sm:col-span-2" />
                    <TextInput value={partnerForm.commune} onChange={(value) => setPartnerForm((current) => ({ ...current, commune: value }))} placeholder="Commune" />
                    <TextInput value={partnerForm.zone_label} onChange={(value) => setPartnerForm((current) => ({ ...current, zone_label: value }))} placeholder="Zone servie" />
                    <TextInput value={partnerForm.delivery_radius_km} onChange={(value) => setPartnerForm((current) => ({ ...current, delivery_radius_km: value }))} placeholder="Rayon livraison (km)" />
                    <TextInput value={partnerForm.activity_type} onChange={(value) => setPartnerForm((current) => ({ ...current, activity_type: value }))} placeholder="Type d activite" />
                    <TextArea value={partnerForm.opening_hours} onChange={(value) => setPartnerForm((current) => ({ ...current, opening_hours: value }))} placeholder="Horaires et creneaux" className="sm:col-span-2" rows={3} />
                  </div>
                  <button type="submit" disabled={partnerStatus.kind === 'saving'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-5 py-4 font-black text-white disabled:opacity-70">
                    {partnerStatus.kind === 'saving' ? 'Envoi en cours...' : 'Envoyer ma demande'}
                  </button>
                  <StatusBanner status={partnerStatus} />
                </form>
              </FormCard>

              <FormCard title="Ajouter mon produit" subtitle="Ajoutez un nom, un prix, une photo et une description courte. Le bouton vous concerne si vous vendez deja.">
                <form className="space-y-3" onSubmit={handleProductSubmit}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <TextInput value={productForm.business_name} onChange={(value) => setProductForm((current) => ({ ...current, business_name: value }))} placeholder="Nom de l etablissement" required className="sm:col-span-2" />
                    <TextInput value={productForm.product_name} onChange={(value) => setProductForm((current) => ({ ...current, product_name: value }))} placeholder="Nom du produit" required />
                    <TextInput value={productForm.category} onChange={(value) => setProductForm((current) => ({ ...current, category: value }))} placeholder="Categorie" />
                    <TextInput value={productForm.price} onChange={(value) => setProductForm((current) => ({ ...current, price: value }))} placeholder="Prix" />
                    <TextInput value={productForm.stock_quantity} onChange={(value) => setProductForm((current) => ({ ...current, stock_quantity: value }))} placeholder="Stock" />
                    <TextArea value={productForm.description} onChange={(value) => setProductForm((current) => ({ ...current, description: value }))} placeholder="Description courte" className="sm:col-span-2" rows={3} />
                    <label className="flex items-center justify-between rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-600 sm:col-span-2">
                      <span className="inline-flex items-center gap-2"><Camera className="h-4 w-4 text-[#c2410c]" /> {productPhoto ? productPhoto.name : 'Ajouter une photo produit'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => setProductPhoto(event.target.files?.[0] ?? null)} />
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#7c2d12]">Choisir</span>
                    </label>
                  </div>

                  {productPreviewEconomics && (
                    <div className="rounded-[1.25rem] border border-orange-100 bg-orange-50/70 p-4 text-sm">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c2410c]">Lecture rapide</p>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        <MiniLine label="Prix client" value={formatPrice(productPreviewEconomics.total_client)} />
                        <MiniLine label="Net vendeur" value={formatPrice(productPreviewEconomics.remuneration_vendeur)} />
                        <MiniLine label="Livraison" value={formatPrice(productPreviewEconomics.frais_livraison)} />
                        <MiniLine label="Marge plateforme" value={formatPrice(productPreviewEconomics.marge_nette_plateforme)} />
                      </div>
                    </div>
                  )}

                  <button type="submit" disabled={productStatus.kind === 'saving'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 font-black text-white disabled:opacity-70">
                    {productStatus.kind === 'saving' ? 'Envoi en cours...' : 'Ajouter mon produit'}
                  </button>
                  <StatusBanner status={productStatus} />
                </form>
              </FormCard>
            </div>
          </div>
        </section>

        <section id="demande-pro" className="bg-[#24170f] py-12 text-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Demande entreprise</p>
              <h2 className="mt-3 font-display text-4xl font-black">Une demande claire pour repas d equipe, besoin groupe ou commande recurente.</h2>
              <p className="mt-4 max-w-2xl text-stone-300">
                Ce bloc s adresse aux entreprises, groupes et organisateurs qui veulent envoyer une demande simple et etre recontactes rapidement.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={partnerLink} className="rounded-2xl border border-white/20 px-5 py-3 font-bold text-white">Devenir partenaire</a>
                <a href={proLink} className="rounded-2xl bg-[#f97316] px-5 py-3 font-black text-white">Envoyer ma demande</a>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/8 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <TextInputDark value={proCompany} onChange={setProCompany} placeholder="Entreprise" />
                <TextInputDark value={proContact} onChange={setProContact} placeholder="Contact / telephone" />
                <TextAreaDark value={proNeed} onChange={setProNeed} placeholder="Besoin, volume, commune, date souhaitee" className="sm:col-span-2" rows={4} />
              </div>
              <a href={proLink} className="mt-4 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-400 px-5 py-4 font-black text-emerald-950">Demande pro</a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-orange-100 bg-white py-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-10 w-10" />
            <div>
              <p className="font-black">DELIKREOL Martinique</p>
              <p className="text-sm text-stone-500">Commande locale - partenaires verifies - zones servies claires</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 text-sm font-bold text-stone-600">
            <a href="#catalogue">Commander</a>
            <a href="#partenaires">Devenir partenaire</a>
            <a href="#demande-pro">Demande pro</a>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-orange-100 bg-white/95 p-3 shadow-2xl backdrop-blur md:hidden">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-2 text-center text-xs font-black">
          <a href="#catalogue" className="rounded-xl bg-[#f97316] px-2 py-3 text-white">Commander</a>
          <a href="#partenaires" className="rounded-xl border border-orange-200 px-2 py-3 text-[#7c2d12]">Partenaire</a>
          <a href="#demande-pro" className="rounded-xl border border-emerald-200 bg-emerald-50 px-2 py-3 text-emerald-800">Pro</a>
        </div>
      </div>
    </div>
  );
}

function SectionIntro({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-black tracking-tight text-[#301607] md:text-4xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 md:text-base md:leading-7">{text}</p>
    </div>
  );
}

function ProofChip({ label }: { label: string }) {
  return <span className="rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-[#c2410c]">{label}</span>;
}

function ClientStep({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-sm">
      <div className="inline-flex rounded-2xl bg-orange-100 p-3 text-[#c2410c]">{icon}</div>
      <h3 className="mt-4 text-lg font-black text-[#301607]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  );
}

function PartnerTypeCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="rounded-[1.5rem] border border-orange-100 bg-white p-6 shadow-sm">
      <div className="inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">{icon}</div>
      <h3 className="mt-4 text-xl font-black text-[#301607]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  );
}

function ProductCard({ product, onAdd, compact = false }: { product: PublicCatalogProduct; onAdd: () => void; compact?: boolean }) {
  return (
    <article className="overflow-hidden rounded-[1.5rem] border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`${compact ? 'aspect-[16/11]' : 'aspect-[4/3]'} bg-orange-50`}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <DishPlaceholder name={product.name} />
        )}
      </div>
      <div className={compact ? 'p-4' : 'p-5'}>
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#c2410c]">{product.category}</span>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-emerald-700">Disponible</span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-slate-600">{product.zone_label || 'Martinique'}</span>
        </div>
        <h3 className={`mt-3 font-black text-[#301607] ${compact ? 'text-lg' : 'text-xl'}`}>{product.name}</h3>
        <p className={`mt-2 line-clamp-2 text-sm text-stone-600 ${compact ? 'leading-5' : 'leading-6'}`}>{product.description}</p>
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-stone-400">
          <span>Retrait</span>
          <span>Livraison selon zone</span>
          <span>{product.vendor_name}</span>
        </div>
        <div className="mt-4 flex items-center justify-between gap-3">
          <strong className={`${compact ? 'text-xl' : 'text-2xl'} font-black text-[#24170f]`}>{formatPrice(product.price)}</strong>
          <button onClick={onAdd} className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-black text-white">Ajouter au panier</button>
        </div>
      </div>
    </article>
  );
}

function VendorCard({ vendor }: { vendor: PublicCatalogVendor }) {
  const zone = vendor.zone_label || 'Martinique';
  const destination = `${zone}, Martinique`;
  const googleMaps = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`;
  const waze = `https://waze.com/ul?q=${encodeURIComponent(destination)}&navigate=yes`;

  return (
    <article className="rounded-[1.5rem] border border-orange-100 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#c2410c]">{vendor.business_type}</p>
          <h3 className="mt-3 text-2xl font-black text-[#301607]">{vendor.business_name}</h3>
        </div>
        <CheckCircle2 className="h-7 w-7 text-emerald-600" />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">{vendor.description}</p>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-stone-600">
        <span className="rounded-full bg-orange-50 px-3 py-1">{zone}</span>
        <span className="rounded-full bg-emerald-50 px-3 py-1">Rayon {vendor.delivery_radius_km} km</span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <a href={googleMaps} target="_blank" rel="noreferrer" className="rounded-full border border-orange-200 px-3 py-2 text-xs font-black text-[#7c2d12]">Google Maps</a>
        <a href={waze} target="_blank" rel="noreferrer" className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-black text-emerald-800">Waze</a>
      </div>
    </article>
  );
}

function FormCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm">
      <h3 className="text-2xl font-black text-[#301607]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{subtitle}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function SouthCoverageCard({ zones }: { zones: string[] }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-[#24170f] p-6 text-white shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-orange-200">
        <MapPin className="h-4 w-4" /> Secteur sud
      </div>
      <h3 className="mt-4 text-2xl font-black">Zones a servir en priorite</h3>
      <p className="mt-3 text-sm leading-6 text-stone-200">
        Vous voyez ici les communes mises en avant pour la prise de contact, la livraison et le retrait.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {zones.map((zone) => (
          <span key={zone} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-stone-100">{zone}</span>
        ))}
      </div>
      <ul className="mt-5 space-y-2 text-sm text-stone-200">
        <li>- inscription simple</li>
        <li>- ajout produit</li>
        <li>- ajout photo</li>
        <li>- zone de service lisible</li>
      </ul>
    </div>
  );
}

function SelectionPanel({
  products,
  economics,
  orderLink,
  onRemove,
}: {
  products: PublicCatalogProduct[];
  economics: ReturnType<typeof calculateOrderEconomics>;
  orderLink: string;
  onRemove: (index: number) => void;
}) {
  return (
    <aside className="h-fit rounded-[1.5rem] border border-orange-100 bg-[#fff8ed] p-4 shadow-sm sm:sticky sm:top-24 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-[#f97316]" />
          <h3 className="text-lg font-black text-[#301607]">Selection</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#7c2d12]">{products.length} article{products.length > 1 ? 's' : ''}</span>
      </div>

      {products.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-stone-600">Ajoutez des produits pour preparer votre commande.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {products.map((product, index) => (
            <div key={`${product.id}-${index}`} className="rounded-2xl bg-white p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#301607]">{product.name}</p>
                  <p className="text-xs text-stone-500">{product.vendor_name}</p>
                </div>
                <button onClick={() => onRemove(index)} className="text-xs font-bold text-stone-400">Retirer</button>
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-orange-100 bg-white p-4 text-sm">
            <SummaryLine label="Sous-total" value={formatPrice(economics.subtotal_produits)} />
            <SummaryLine label="Livraison" value={formatPrice(economics.frais_livraison)} />
            <SummaryLine label="Frais service" value={formatPrice(economics.frais_service)} />
            <SummaryLine label="Total estime" value={formatPrice(economics.total_client)} strong />
          </div>

          <a href={orderLink} className="inline-flex w-full justify-center rounded-2xl bg-[#f97316] px-5 py-4 font-black text-white">Confirmer la commande</a>
          <p className="text-xs font-semibold text-stone-500">Retrait ou livraison confirmes ensuite selon votre zone.</p>
        </div>
      )}
    </aside>
  );
}

function EmptyHero({ loading, configured }: { loading: boolean; configured: boolean }) {
  return (
    <div className="flex min-h-[300px] flex-col justify-center rounded-[1.5rem] bg-gradient-to-br from-[#24170f] to-[#6b2d08] p-6 text-white sm:min-h-[380px] sm:p-8">
      <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Catalogue</p>
      <h3 className="mt-4 font-display text-3xl font-black sm:text-4xl">{loading ? 'Chargement des produits...' : 'Aucun produit visible pour le moment'}</h3>
      <p className="mt-4 text-stone-200">
        {configured ? 'Les prochaines lignes verifiees apparaitront ici.' : 'La connexion au catalogue n est pas disponible pour le moment.'}
      </p>
    </div>
  );
}

function EmptyCatalog({ configured }: { configured: boolean }) {
  return (
    <div className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-7">
      <div className="flex items-center gap-3 text-amber-800">
        <Package className="h-6 w-6" />
        <p className="text-lg font-black">Aucun produit visible pour le moment</p>
      </div>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-amber-900">
        {configured ? 'Le site n affiche pas de faux catalogue. Les prochains produits verifies apparaitront ici.' : 'Le catalogue ne peut pas etre lu pour le moment.'}
      </p>
      <div className="mt-5 flex flex-wrap gap-3">
        <a href="#partenaires" className="rounded-2xl border border-amber-300 bg-white px-5 py-3 font-bold text-amber-900">Devenir partenaire</a>
        <a href="#demande-pro" className="rounded-2xl bg-[#f97316] px-5 py-3 font-black text-white">Demande pro</a>
      </div>
    </div>
  );
}

function InfoBanner({ tone, message }: { tone: 'neutral' | 'warning'; message: string }) {
  const classes = tone === 'warning'
    ? 'border-amber-200 bg-amber-50 text-amber-800'
    : 'border-orange-100 bg-white text-stone-600';
  return <p className={`mt-6 rounded-2xl border p-5 text-sm font-semibold ${classes}`}>{message}</p>;
}

function StatusBanner({ status }: { status: SubmitStatus }) {
  if (status.kind === 'idle') return null;
  const tone = status.kind === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
    : status.kind === 'error'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-orange-200 bg-orange-50 text-orange-800';
  return <p className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${tone}`}>{status.message}</p>;
}

function SummaryLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex justify-between py-1 ${strong ? 'text-base font-black text-[#301607]' : 'text-stone-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function MiniLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-black text-[#301607]">{value}</p>
    </div>
  );
}

function ZoneCard({ zone }: { zone: string }) {
  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2 font-black text-[#301607]">
        <MapPin className="h-5 w-5 text-[#f97316]" />
        {zone}
      </div>
      <p className="mt-2 text-sm text-stone-600">Retrait ou livraison selon partenaire actif.</p>
    </div>
  );
}

function TextInput({ value, onChange, placeholder, className = '', required = false }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string; required?: boolean }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className={`rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4 ${className}`}
    />
  );
}

function TextArea({ value, onChange, placeholder, className = '', rows = 3 }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4 ${className}`}
    />
  );
}

function TextInputDark({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400"
    />
  );
}

function TextAreaDark({ value, onChange, placeholder, className = '', rows = 4 }: { value: string; onChange: (value: string) => void; placeholder: string; className?: string; rows?: number }) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400 ${className}`}
    />
  );
}

function DishPlaceholder({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,rgba(251,146,60,0.35),transparent_35%),linear-gradient(135deg,#ffedd5,#fef3c7,#dcfce7)]">
      <div className="rounded-full bg-white/80 px-6 py-4 text-center shadow-lg">
        <Utensils className="mx-auto h-8 w-8 text-[#c2410c]" />
        <p className="mt-2 max-w-[180px] text-sm font-black text-[#301607]">{name}</p>
      </div>
    </div>
  );
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
