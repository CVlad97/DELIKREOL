import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Camera,
  ChevronLeft,
  ChevronRight,
  Clock,
  ImagePlus,
  MapPin,
  MapPinned,
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

type SubmitStatus = { kind: 'idle' | 'saving' | 'success' | 'error'; message?: string };

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
const whatsappBase = `https://wa.me/${whatsappNumber}`;
const southZones = ['Ducos', 'Riviere-Salee', 'Le Diamant', 'Sainte-Luce', 'Sainte-Anne', 'Le Marin', 'Le Francois'];
const defaultZones = Array.from(new Set([...getMartiniqueServiceZones(), ...southZones, 'Secteur sud']));

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
  const [activeSlide, setActiveSlide] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Toutes');
  const [proCompany, setProCompany] = useState('');
  const [proContact, setProContact] = useState('');
  const [proNeed, setProNeed] = useState('');
  const [partnerForm, setPartnerForm] = useState<PartnerFormState>(defaultPartnerForm);
  const [productForm, setProductForm] = useState<ProductFormState>(defaultProductForm);
  const [partnerStatus, setPartnerStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [productStatus, setProductStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [productPhoto, setProductPhoto] = useState<File | null>(null);

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
        setError('Catalogue public temporairement indisponible. Aucune donnee fictive n est affichee.');
        setCatalog({ configured: true, vendors: [], products: [] });
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(
    () => ['Toutes', ...Array.from(new Set(catalog.products.map((product) => product.category || 'Cuisine locale')))],
    [catalog.products],
  );

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return catalog.products.filter((product) => {
      const text = `${product.name} ${product.vendor_name} ${product.category} ${product.description}`.toLowerCase();
      return (!needle || text.includes(needle)) && (category === 'Toutes' || product.category === category);
    });
  }, [catalog.products, category, query]);

  const carouselProducts = useMemo(() => catalog.products.slice(0, 8), [catalog.products]);

  useEffect(() => {
    if (carouselProducts.length < 2) return;
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % carouselProducts.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [carouselProducts.length]);

  const serviceZones = useMemo(
    () => Array.from(new Set([...getMartiniqueServiceZones(catalog.vendors.map((vendor) => vendor.zone_label)), ...southZones, 'Secteur sud'])).slice(0, 12),
    [catalog.vendors],
  );

  const economics = useMemo(
    () =>
      calculateOrderEconomics({
        items: selected.map((product) => ({ price: product.price, commissionRate: 0.15 })),
        deliveryFee: selected.length > 0 ? 4.5 : 0,
        serviceFee: selected.length > 0 ? 1.5 : 0,
      }),
    [selected],
  );

  const orderLink = useMemo(() => {
    const lines = selected.map((product) => `- ${product.name} - ${product.vendor_name} - ${formatPrice(product.price)}`);
    const text = [
      'Bonjour, je souhaite commander sur DELIKREOL Martinique.',
      '',
      selected.length ? 'Selection :' : 'Je souhaite connaitre les produits disponibles.',
      ...lines,
      '',
      'Merci de confirmer la disponibilite, le retrait ou la livraison.',
    ].join('\n');
    return `${whatsappBase}?text=${encodeURIComponent(text)}`;
  }, [selected]);

  const partnerLink = `${whatsappBase}?text=${encodeURIComponent('Bonjour, je souhaite devenir partenaire DELIKREOL en Martinique.')}`;

  const proLink = useMemo(() => {
    const text = [
      'Bonjour, je souhaite faire une demande pro sur DELIKREOL Martinique.',
      proCompany && `Entreprise : ${proCompany}`,
      proContact && `Contact : ${proContact}`,
      proNeed && `Besoin : ${proNeed}`,
    ]
      .filter(Boolean)
      .join('\n');
    return `${whatsappBase}?text=${encodeURIComponent(text)}`;
  }, [proCompany, proContact, proNeed]);

  const addProduct = (product: PublicCatalogProduct) => setSelected((current) => [...current, product]);
  const removeProduct = (index: number) => setSelected((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const currentSlide = carouselProducts[activeSlide];
  const hasProducts = catalog.products.length > 0;

  const handlePartnerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPartnerStatus({ kind: 'saving', message: 'Enregistrement du partenaire...' });
    try {
      await submitPartnerLead({
        business_name: partnerForm.business_name,
        contact_name: partnerForm.contact_name,
        phone: partnerForm.phone,
        whatsapp: partnerForm.whatsapp || partnerForm.phone,
        email: partnerForm.email,
        address: partnerForm.address,
        commune: partnerForm.commune,
        zone_label: partnerForm.zone_label,
        activity_type: partnerForm.activity_type,
        delivery_radius_km: Number(partnerForm.delivery_radius_km || '8'),
        opening_hours: partnerForm.opening_hours,
      });
      setPartnerStatus({ kind: 'success', message: 'Demande partenaire enregistree. Nous revenons vers vous apres verification.' });
      setPartnerForm(defaultPartnerForm);
    } catch (submitError) {
      setPartnerStatus({ kind: 'error', message: extractError(submitError, 'Impossible d enregistrer la demande partenaire.') });
    }
  };

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProductStatus({ kind: 'saving', message: 'Enregistrement du catalogue...' });
    try {
      let imageUrl: string | null = null;
      if (productPhoto) {
        const upload = await uploadPartnerProductPhoto(productPhoto);
        imageUrl = upload.publicUrl;
      }
      await submitPartnerProduct({
        business_name: productForm.business_name,
        product_name: productForm.product_name,
        description: productForm.description,
        category: productForm.category,
        price: Number(productForm.price || '0'),
        stock_quantity: productForm.stock_quantity ? Number(productForm.stock_quantity) : undefined,
        is_available: true,
        image_url: imageUrl,
      });
      setProductStatus({ kind: 'success', message: 'Produit transmis pour verification. La photo sera publiee apres validation.' });
      setProductForm(defaultProductForm);
      setProductPhoto(null);
    } catch (submitError) {
      setProductStatus({ kind: 'error', message: extractError(submitError, 'Impossible d enregistrer le produit pour le moment.') });
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8ed] text-[#24170f]">
      <header className="sticky top-0 z-50 border-b border-orange-100 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
          <a href="#accueil" className="flex items-center gap-3" aria-label="DELIKREOL accueil">
            <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-11 w-11 rounded-2xl shadow-[0_10px_30px_rgba(249,115,22,0.18)]" />
            <img src={`${baseUrl}branding/logo-wordmark-premium.svg`} alt="DELIKREOL" className="hidden h-10 sm:block" />
          </a>
          <nav className="hidden items-center gap-2 md:flex">
            <a href="#catalogue" className="rounded-full bg-[#f97316] px-5 py-2.5 text-sm font-black text-white shadow-lg shadow-orange-500/20">Commander</a>
            <a href="#partenaires" className="rounded-full border border-orange-200 px-5 py-2.5 text-sm font-bold text-[#7c2d12]">Devenir partenaire</a>
            <a href="#demande-pro" className="rounded-full border border-emerald-200 bg-emerald-50 px-5 py-2.5 text-sm font-bold text-emerald-800">Demande pro</a>
          </nav>
          <a href="#catalogue" className="rounded-full bg-[#f97316] px-4 py-2 text-sm font-black text-white md:hidden">Commander</a>
        </div>
      </header>

      <main id="accueil">
        <section className="relative overflow-hidden border-b border-orange-100 bg-[radial-gradient(circle_at_10%_15%,rgba(251,146,60,0.24),transparent_30%),radial-gradient(circle_at_90%_8%,rgba(16,185,129,0.18),transparent_30%),linear-gradient(135deg,#fff7ed_0%,#fff_46%,#fff4e6_100%)]">
          <div className="madras-strip" />
          <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 md:grid-cols-[1.05fr_0.95fr] md:py-16 lg:py-20">
            <div className="flex flex-col justify-center">
              <div className="mb-6 inline-flex w-fit items-center gap-2 rounded-full border border-orange-200 bg-white/80 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[#c2410c] shadow-sm">
                <MapPin className="h-4 w-4" /> Martinique uniquement
              </div>
              <div className="mb-6 flex items-center gap-4">
                <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-20 w-20 animate-float rounded-[1.5rem] bg-white p-2 shadow-2xl shadow-orange-500/20" />
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.28em] text-emerald-700">Commande locale</p>
                  <p className="text-sm font-semibold text-stone-500">Vendeurs verifies - retrait ou livraison selon zone</p>
                </div>
              </div>
              <h1 className="max-w-4xl font-display text-4xl font-black tracking-tight text-[#301607] md:text-6xl lg:text-7xl">
                Commandez local en Martinique, simplement et sans faux catalogue.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-700">
                DELIKREOL met en relation particuliers, pros et vendeurs martiniquais autour d offres disponibles, confirmees et activees publiquement.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <a href="#catalogue" className="inline-flex items-center gap-2 rounded-2xl bg-[#f97316] px-6 py-4 font-black text-white shadow-xl shadow-orange-500/25">Commander <ArrowRight className="h-5 w-5" /></a>
                <a href="#partenaires" className="inline-flex items-center gap-2 rounded-2xl border border-orange-200 bg-white px-6 py-4 font-bold text-[#7c2d12]">Devenir partenaire</a>
                <a href="#demande-pro" className="inline-flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-6 py-4 font-bold text-emerald-800">Demande pro</a>
              </div>
              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <TrustPill icon={<ShieldCheck />} label="Partenaires verifies" />
                <TrustPill icon={<Clock />} label="Confirmation rapide" />
                <TrustPill icon={<Truck />} label="Zones servies claires" />
              </div>
            </div>

            <div className="rounded-[2rem] border border-orange-100 bg-white/86 p-4 shadow-2xl shadow-orange-900/10 backdrop-blur">
              {currentSlide ? (
                <ProductCarousel product={currentSlide} count={carouselProducts.length} active={activeSlide} onPrev={() => setActiveSlide((activeSlide - 1 + carouselProducts.length) % carouselProducts.length)} onNext={() => setActiveSlide((activeSlide + 1) % carouselProducts.length)} />
              ) : (
                <EmptyHeroCard configured={catalog.configured} loading={loading} />
              )}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-4 px-4 py-10 md:grid-cols-3">
          <InfoCard icon={<ShoppingBag />} title="Commande simple" text="Choisissez une offre visible, puis confirmez la disponibilite avant validation." />
          <InfoCard icon={<Store />} title="Vendeurs locaux" text="Le public affiche uniquement les partenaires verifies, actifs et publies." />
          <InfoCard icon={<MessageCircle />} title="Contact direct" text="WhatsApp sert a confirmer les commandes, les besoins pro et les demandes partenaires." />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-10">
          <SectionIntro eyebrow="Types d offres" title="Une facade claire pour les besoins particuliers et pros" text="La premiere version publique reste volontairement simple : offres reelles, partenaires verifies, zones martiniquaises lisibles." />
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <OfferCard title="Plats et produits locaux" text="Catalogue vivant lorsque les produits sont actifs et verifies." icon={<Utensils />} />
            <OfferCard title="Commandes groupees" text="Demandes pro, repas d equipe et besoins recurrents." icon={<Briefcase />} />
            <OfferCard title="Retrait ou livraison" text="Affichage selon commune, zone et partenaire disponible." icon={<Truck />} />
          </div>
        </section>

        <section id="catalogue" className="bg-white py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <SectionIntro eyebrow="Catalogue reel" title="Produits publics verifies" text="Aucune ligne fictive n est affichee : les offres doivent etre publiques, actives et liees a un partenaire verifie." />
              <a href={orderLink} className="inline-flex w-fit items-center gap-2 rounded-2xl bg-[#f97316] px-5 py-3 font-black text-white">Commander <ArrowRight className="h-5 w-5" /></a>
            </div>
            <div className="mt-6 grid gap-3 md:grid-cols-[1fr_260px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Rechercher un plat, produit ou partenaire" className="w-full rounded-2xl border border-orange-100 bg-orange-50/60 py-4 pl-12 pr-4 text-sm font-semibold outline-none ring-orange-200 focus:ring-4" />
              </label>
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-orange-100 bg-orange-50/60 px-4 py-4 text-sm font-semibold outline-none ring-orange-200 focus:ring-4">
                {categories.map((item) => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            {loading && <p className="mt-6 rounded-2xl bg-orange-50 p-5 text-sm font-semibold text-stone-600">Chargement du catalogue public...</p>}
            {error && <p className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm font-semibold text-amber-800">{error}</p>}
            {!loading && !hasProducts && <EmptyCatalogue configured={catalog.configured} />}
            {hasProducts && <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]"><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredProducts.map((product) => <ProductCard key={product.id} product={product} onAdd={() => addProduct(product)} />)}</div><Selection products={selected} onRemove={removeProduct} orderLink={orderLink} economics={economics} /></div>}
          </div>
        </section>

        <section id="partenaires" className="mx-auto max-w-7xl px-4 py-12">
          <SectionIntro eyebrow="Partenaires" title="Vendeurs verifies en Martinique" text="La liste reste volontairement stricte : pas de partenaire visible sans validation publique." />
          <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {catalog.vendors.map((vendor) => <VendorCard key={vendor.id} vendor={vendor} />)}
          </div>
          {!loading && catalog.vendors.length === 0 && <p className="mt-6 rounded-2xl border border-orange-100 bg-white p-5 text-sm font-semibold text-stone-600">Aucun partenaire public verifie n est encore visible. La facade reste honnete jusqu a activation des donnees reelles.</p>}
        </section>

        <section className="bg-[#fff1df] py-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionIntro eyebrow="Secteur sud et portail partenaire" title="Developper le sud Martinique, puis alimenter le catalogue" text="Cette passe compacte ajoute une base exploitable pour les partenaires : inscription, proposition de produits et envoi de photos sans casser la facade publique actuelle." />
            <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr_1.05fr]">
              <SouthCoverageCard zones={southZones} />
              <PortalCard title="Inscription partenaire" icon={<Store className='h-5 w-5' />}>
                <form className="space-y-3" onSubmit={handlePartnerSubmit}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={partnerForm.business_name} onChange={(event) => setPartnerForm((current) => ({ ...current, business_name: event.target.value }))} placeholder="Nom de l etablissement" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4 sm:col-span-2" required />
                    <input value={partnerForm.contact_name} onChange={(event) => setPartnerForm((current) => ({ ...current, contact_name: event.target.value }))} placeholder="Contact" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" required />
                    <input value={partnerForm.phone} onChange={(event) => setPartnerForm((current) => ({ ...current, phone: event.target.value }))} placeholder="Telephone" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" required />
                    <input value={partnerForm.whatsapp} onChange={(event) => setPartnerForm((current) => ({ ...current, whatsapp: event.target.value }))} placeholder="WhatsApp" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" />
                    <input value={partnerForm.email} onChange={(event) => setPartnerForm((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" />
                    <input value={partnerForm.address} onChange={(event) => setPartnerForm((current) => ({ ...current, address: event.target.value }))} placeholder="Adresse" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4 sm:col-span-2" />
                    <input value={partnerForm.commune} onChange={(event) => setPartnerForm((current) => ({ ...current, commune: event.target.value }))} placeholder="Commune" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" />
                    <input value={partnerForm.zone_label} onChange={(event) => setPartnerForm((current) => ({ ...current, zone_label: event.target.value }))} placeholder="Zone servie" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" />
                    <input value={partnerForm.delivery_radius_km} onChange={(event) => setPartnerForm((current) => ({ ...current, delivery_radius_km: event.target.value }))} placeholder="Rayon livraison (km)" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" />
                    <input value={partnerForm.activity_type} onChange={(event) => setPartnerForm((current) => ({ ...current, activity_type: event.target.value }))} placeholder="Type d activite" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" />
                    <textarea value={partnerForm.opening_hours} onChange={(event) => setPartnerForm((current) => ({ ...current, opening_hours: event.target.value }))} placeholder="Horaires et creneaux" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4 sm:col-span-2" rows={3} />
                  </div>
                  <button type="submit" disabled={partnerStatus.kind === 'saving'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f97316] px-5 py-4 font-black text-white disabled:opacity-70">{partnerStatus.kind === 'saving' ? 'Envoi en cours...' : 'Envoyer la demande partenaire'}</button>
                  <StatusBanner status={partnerStatus} />
                </form>
              </PortalCard>
              <PortalCard title="Ajouter catalogue et photos" icon={<ImagePlus className='h-5 w-5' />}>
                <form className="space-y-3" onSubmit={handleProductSubmit}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <input value={productForm.business_name} onChange={(event) => setProductForm((current) => ({ ...current, business_name: event.target.value }))} placeholder="Nom de l etablissement" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4 sm:col-span-2" required />
                    <input value={productForm.product_name} onChange={(event) => setProductForm((current) => ({ ...current, product_name: event.target.value }))} placeholder="Nom du produit" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" required />
                    <input value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} placeholder="Categorie" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" />
                    <input value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} placeholder="Prix" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" />
                    <input value={productForm.stock_quantity} onChange={(event) => setProductForm((current) => ({ ...current, stock_quantity: event.target.value }))} placeholder="Stock" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4" />
                    <textarea value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description courte" className="rounded-2xl border border-orange-100 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-700 outline-none ring-orange-200 focus:ring-4 sm:col-span-2" rows={3} />
                    <label className="flex items-center justify-between rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-600 sm:col-span-2">
                      <span className="inline-flex items-center gap-2"><Camera className="h-4 w-4 text-[#c2410c]" /> {productPhoto ? productPhoto.name : 'Ajouter une photo produit'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(event) => setProductPhoto(event.target.files?.[0] ?? null)} />
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#7c2d12]">Choisir</span>
                    </label>
                  </div>
                  <button type="submit" disabled={productStatus.kind === 'saving'} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-4 font-black text-white disabled:opacity-70">{productStatus.kind === 'saving' ? 'Envoi du produit...' : 'Ajouter catalogue et photos'}</button>
                  <StatusBanner status={productStatus} />
                </form>
              </PortalCard>
            </div>
          </div>
        </section>

        <section className="bg-[#fff1df] py-12">
          <div className="mx-auto max-w-7xl px-4">
            <SectionIntro eyebrow="Comment ca marche" title="Un parcours volontairement court" text="Le client comprend vite ce qui est disponible, comment confirmer, et dans quelle zone la commande peut etre traitee." />
            <div className="mt-6 grid gap-4 md:grid-cols-4">
              <Step number="1" title="Choisir" text="Produit ou besoin pro visible sur la facade publique." />
              <Step number="2" title="Confirmer" text="Disponibilite, zone, creneau et mode retrait/livraison." />
              <Step number="3" title="Valider" text="Commande transmise au partenaire concerne." />
              <Step number="4" title="Suivre" text="Contact direct pour ajuster et finaliser." />
            </div>
          </div>
        </section>

        <section id="zones" className="mx-auto max-w-7xl px-4 py-12">
          <SectionIntro eyebrow="Zones desservies" title="Martinique, avec zones claires par partenaire" text="Le site ne promet pas une couverture hors zone. La logique evolue par commune, rayon interne et zone partenaire." />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(serviceZones.length ? serviceZones : defaultZones).map((zone) => <ZoneCard key={zone} zone={zone} />)}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-12">
          <div className="grid gap-5 lg:grid-cols-3">
            <ProofCard icon={<BadgeCheck />} title="Donnees reelles seulement" text="Les filtres publics imposent partenaires verifies, produits publics, statut valide et disponibilite non desactivee." />
            <ProofCard icon={<ShieldCheck />} title="Marge tracable" text="La logique interne separe total client, livraison, frais service, commission, payout vendeur et marge plateforme." />
            <ProofCard icon={<MapPin />} title="Zones controlees" text="Rayon prestataire, geolocalisation et fallback par commune sont prepares pour l exploitation terrain." />
          </div>
        </section>

        <section id="demande-pro" className="bg-[#24170f] py-12 text-white">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-300">Pros et partenaires</p>
              <h2 className="mt-3 font-display text-4xl font-black">Une demande pro claire, sans parcours complique.</h2>
              <p className="mt-4 max-w-2xl text-stone-300">Repas d equipe, commandes groupees, partenaires vendeurs ou besoins recurrents : DELIKREOL qualifie la demande avant engagement.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href={partnerLink} className="rounded-2xl border border-white/20 px-5 py-3 font-bold text-white">Devenir partenaire</a>
                <a href={proLink} className="rounded-2xl bg-[#f97316] px-5 py-3 font-black text-white">Demande pro</a>
              </div>
            </div>
            <div className="rounded-[2rem] border border-white/10 bg-white/8 p-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <input value={proCompany} onChange={(event) => setProCompany(event.target.value)} placeholder="Entreprise" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400" />
                <input value={proContact} onChange={(event) => setProContact(event.target.value)} placeholder="Contact / telephone" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400" />
                <textarea value={proNeed} onChange={(event) => setProNeed(event.target.value)} placeholder="Besoin, volume, commune, date souhaitee" className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-stone-400 sm:col-span-2" rows={4} />
              </div>
              <a href={proLink} className="mt-4 inline-flex w-full justify-center rounded-2xl bg-emerald-400 px-5 py-4 font-black text-emerald-950">Envoyer la demande pro</a>
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
              <p className="text-sm text-stone-500">Commande locale - partenaires verifies - zones desservies claires</p>
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
  return <div><p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">{eyebrow}</p><h2 className="mt-2 font-display text-3xl font-black tracking-tight text-[#301607] md:text-4xl">{title}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600">{text}</p></div>;
}

function TrustPill({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="flex items-center gap-2 rounded-2xl border border-orange-100 bg-white/80 px-4 py-3 text-sm font-black text-stone-700 shadow-sm">{icon}<span>{label}</span></div>;
}

function InfoCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-3 text-[#c2410c]">{icon}<span className="font-black text-[#301607]">{title}</span></div><p className="mt-3 text-sm leading-6 text-stone-600">{text}</p></div>;
}

function OfferCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-orange-100 bg-white p-6 shadow-sm"><div className="mb-4 inline-flex rounded-2xl bg-orange-100 p-3 text-[#c2410c]">{icon}</div><h3 className="text-xl font-black text-[#301607]">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{text}</p></div>;
}

function ProductCarousel({ product, count, active, onPrev, onNext }: { product: PublicCatalogProduct; count: number; active: number; onPrev: () => void; onNext: () => void }) {
  return <div className="overflow-hidden rounded-[1.5rem] bg-[#24170f] text-white"><div className="relative aspect-[4/3] bg-gradient-to-br from-orange-200 via-amber-100 to-emerald-100">{product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /> : <DishPlaceholder name={product.name} /> }<div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/78 to-transparent p-5"><p className="text-xs font-black uppercase tracking-[0.2em] text-orange-200">Disponible si confirme</p><h3 className="mt-2 text-3xl font-black">{product.name}</h3><p className="mt-1 text-sm text-stone-200">{product.vendor_name} - {product.zone_label}</p><p className="mt-3 text-2xl font-black text-orange-200">{formatPrice(product.price)}</p></div><button onClick={onPrev} className="absolute left-3 top-1/2 rounded-full bg-white/90 p-2 text-stone-900"><ChevronLeft className="h-5 w-5" /></button><button onClick={onNext} className="absolute right-3 top-1/2 rounded-full bg-white/90 p-2 text-stone-900"><ChevronRight className="h-5 w-5" /></button></div><div className="flex items-center justify-between px-5 py-4 text-sm text-stone-300"><span>Offres reelles activees</span><span>{active + 1} / {count}</span></div></div>;
}

function EmptyHeroCard({ configured, loading }: { configured: boolean; loading: boolean }) {
  return <div className="flex min-h-[380px] flex-col justify-center rounded-[1.5rem] bg-gradient-to-br from-[#24170f] to-[#6b2d08] p-8 text-white"><p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Catalogue vivant</p><h3 className="mt-4 font-display text-4xl font-black">{loading ? 'Verification des offres publiques...' : 'Activation des partenaires reels en cours'}</h3><p className="mt-4 text-stone-200">{configured ? 'Aucune offre publique validee n est visible pour le moment.' : 'La configuration publique doit etre activee avant affichage des donnees.'}</p></div>;
}

function EmptyCatalogue({ configured }: { configured: boolean }) {
  return <div className="mt-8 rounded-[2rem] border border-amber-200 bg-amber-50 p-7"><div className="flex items-center gap-3 text-amber-800"><Package className="h-6 w-6" /><p className="text-lg font-black">Catalogue public en cours d activation</p></div><p className="mt-3 max-w-3xl text-sm leading-6 text-amber-900">{configured ? 'Aucun partenaire et produit public verifie n est encore visible. DELIKREOL n affiche pas de faux catalogue.' : 'La configuration publique doit etre completee dans GitHub Actions avant lecture des donnees reelles.'}</p><div className="mt-5 flex flex-wrap gap-3"><a href="#partenaires" className="rounded-2xl border border-amber-300 bg-white px-5 py-3 font-bold text-amber-900">Devenir partenaire</a><a href="#demande-pro" className="rounded-2xl bg-[#f97316] px-5 py-3 font-black text-white">Demande pro</a></div></div>;
}

function ProductCard({ product, onAdd }: { product: PublicCatalogProduct; onAdd: () => void }) {
  return <article className="overflow-hidden rounded-[1.5rem] border border-orange-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"><div className="aspect-[4/3] bg-orange-50">{product.image_url ? <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" /> : <DishPlaceholder name={product.name} />}</div><div className="p-5"><div className="flex items-center justify-between gap-3"><span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-black uppercase tracking-wider text-[#c2410c]">{product.category}</span><span className="text-xs font-bold text-emerald-700">Verifie</span></div><h3 className="mt-4 text-xl font-black text-[#301607]">{product.name}</h3><p className="mt-2 line-clamp-2 text-sm leading-6 text-stone-600">{product.description}</p><div className="mt-4 text-sm font-bold text-stone-500">{product.vendor_name} - {product.zone_label}</div><div className="mt-5 flex items-center justify-between gap-3"><strong className="text-2xl font-black text-[#24170f]">{formatPrice(product.price)}</strong><button onClick={onAdd} className="rounded-xl bg-[#f97316] px-4 py-2 text-sm font-black text-white">Ajouter</button></div></div></article>;
}

function VendorCard({ vendor }: { vendor: PublicCatalogVendor }) {
  return <article className="rounded-[1.5rem] border border-orange-100 bg-white p-6 shadow-sm"><div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#c2410c]">{vendor.business_type}</p><h3 className="mt-3 text-2xl font-black text-[#301607]">{vendor.business_name}</h3></div><BadgeCheck className="h-7 w-7 text-emerald-600" /></div><p className="mt-3 text-sm leading-6 text-stone-600">{vendor.description}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-stone-600"><span className="rounded-full bg-orange-50 px-3 py-1">{vendor.zone_label}</span><span className="rounded-full bg-emerald-50 px-3 py-1">Rayon {vendor.delivery_radius_km} km</span></div></article>;
}

function PortalCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-sm"><div className="mb-4 flex items-center gap-3 text-[#c2410c]">{icon}<h3 className="text-xl font-black text-[#301607]">{title}</h3></div>{children}</div>;
}

function SouthCoverageCard({ zones }: { zones: string[] }) {
  return <div className="rounded-[1.75rem] border border-orange-100 bg-[#24170f] p-6 text-white shadow-sm"><div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-black uppercase tracking-[0.2em] text-orange-200"><MapPinned className="h-4 w-4" /> Secteur sud</div><h3 className="mt-4 text-2xl font-black">Renforcer la couverture partenaire au sud de la Martinique</h3><p className="mt-3 text-sm leading-6 text-stone-200">Cette passe compacte ouvre un parcours public pour les partenaires du sud : inscription, proposition de produits et ajout de photos avant validation.</p><div className="mt-5 flex flex-wrap gap-2">{zones.map((zone) => <span key={zone} className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-bold text-stone-100">{zone}</span>)}</div><ul className="mt-5 space-y-2 text-sm text-stone-200"><li>- inscription partenaire rapide</li><li>- ajout catalogue unitaire</li><li>- photo produit via bucket dedie</li><li>- validation publique ensuite seulement</li></ul></div>;
}

function StatusBanner({ status }: { status: SubmitStatus }) {
  if (status.kind === 'idle') return null;
  const tone = status.kind === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : status.kind === 'error' ? 'border-rose-200 bg-rose-50 text-rose-700' : 'border-orange-200 bg-orange-50 text-orange-800';
  return <p className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${tone}`}>{status.message}</p>;
}

function Step({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-sm"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f97316] font-black text-white">{number}</div><h3 className="mt-4 text-lg font-black text-[#301607]">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{text}</p></div>;
}

function ZoneCard({ zone }: { zone: string }) {
  return <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm"><div className="flex items-center gap-2 font-black text-[#301607]"><MapPin className="h-5 w-5 text-[#f97316]" />{zone}</div><p className="mt-2 text-sm text-stone-600">Retrait ou livraison selon partenaire active.</p></div>;
}

function ProofCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-orange-100 bg-white p-6 shadow-sm"><div className="mb-4 inline-flex rounded-2xl bg-emerald-50 p-3 text-emerald-700">{icon}</div><h3 className="text-xl font-black text-[#301607]">{title}</h3><p className="mt-2 text-sm leading-6 text-stone-600">{text}</p></div>;
}

function Selection({ products, onRemove, orderLink, economics }: { products: PublicCatalogProduct[]; onRemove: (index: number) => void; orderLink: string; economics: ReturnType<typeof calculateOrderEconomics> }) {
  return <aside className="sticky top-24 h-fit rounded-[1.5rem] border border-orange-100 bg-[#fff8ed] p-5 shadow-sm"><div className="flex items-center gap-3"><ShoppingBag className="h-5 w-5 text-[#f97316]" /><h3 className="text-lg font-black text-[#301607]">Selection</h3></div>{products.length === 0 ? <p className="mt-4 text-sm leading-6 text-stone-600">Ajoutez des produits pour preparer une demande de confirmation.</p> : <div className="mt-4 space-y-3">{products.map((product, index) => <div key={`${product.id}-${index}`} className="rounded-2xl bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-black text-[#301607]">{product.name}</p><p className="text-xs text-stone-500">{product.vendor_name}</p></div><button onClick={() => onRemove(index)} className="text-xs font-bold text-stone-400">Retirer</button></div></div>)}<div className="rounded-2xl border border-orange-100 bg-white p-4 text-sm"><Line label="Produits" value={formatPrice(economics.subtotal_produits)} /><Line label="Livraison estimee" value={formatPrice(economics.frais_livraison)} /><Line label="Frais service" value={formatPrice(economics.frais_service)} /><Line label="Total a confirmer" value={formatPrice(economics.total_client)} strong /></div><a href={orderLink} className="inline-flex w-full justify-center rounded-2xl bg-[#f97316] px-5 py-4 font-black text-white">Commander</a></div>}</aside>;
}

function Line({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return <div className={`flex justify-between py-1 ${strong ? 'text-base font-black text-[#301607]' : 'text-stone-600'}`}><span>{label}</span><span>{value}</span></div>;
}

function DishPlaceholder({ name }: { name: string }) {
  return <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,rgba(251,146,60,0.35),transparent_35%),linear-gradient(135deg,#ffedd5,#fef3c7,#dcfce7)]"><div className="rounded-full bg-white/80 px-6 py-4 text-center shadow-lg"><Utensils className="mx-auto h-8 w-8 text-[#c2410c]" /><p className="mt-2 max-w-[180px] text-sm font-black text-[#301607]">{name}</p></div></div>;
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

function extractError(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
