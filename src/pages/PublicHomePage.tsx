import { FormEvent, ReactNode, useEffect, useMemo, useState, type ComponentType } from 'react';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  ChevronRight,
  Filter,
  Home,
  MapPin,
  MessageCircle,
  Package,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Store,
  Truck,
  Star,
  Utensils,
} from 'lucide-react';
import { loadPublicCatalog, PublicCatalogProduct, PublicCatalogVendor } from '../services/publicCatalogService';
import { calculateOrderEconomics } from '../services/orderEconomics';
import { getMartiniqueServiceZones } from '../services/serviceZones';
import { submitPartnerLead, submitPartnerProduct, uploadPartnerProductPhoto } from '../services/partnerPortalService';
import { createBusinessRequest } from '../services/liteOrdersService';

type CatalogState = {
  configured: boolean;
  vendors: PublicCatalogVendor[];
  products: PublicCatalogProduct[];
};

type PartnerLeadForm = {
  business_name: string;
  contact_name: string;
  phone: string;
  whatsapp: string;
  email: string;
  commune: string;
  zone_label: string;
  activity_type: string;
  delivery_radius_km: string;
  opening_hours: string;
  description: string;
};

type ProductSubmissionForm = {
  business_name: string;
  product_name: string;
  category: string;
  price: string;
  description: string;
};

type BusinessRequestForm = {
  company_name: string;
  contact: string;
  people_count: string;
  requested_date: string;
  requested_time: string;
  location: string;
  budget: string;
  frequency: string;
  details: string;
};

type SubmitStatus = {
  kind: 'idle' | 'saving' | 'success' | 'error';
  message?: string;
};

const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
const whatsappBase = `https://wa.me/${whatsappNumber}`;
const fallbackZones = ['Fort-de-France', 'Le Lamentin', 'Schoelcher', 'Ducos', 'Rivière-Salée', 'Sainte-Luce', 'Le Marin', 'Le François'];
const featuredCategories = ['plats créoles', 'traiteurs', 'box / plateaux', 'desserts', 'boissons', 'commande entreprise'];
const budgetRanges = ['Tous', '≤ 15 €', '15 € - 30 €', '30 € et plus'];

const trustPills = [
  'partenaires vérifiés',
  'retrait ou livraison',
  'confirmation rapide',
  'pensé pour la Martinique',
];

const howItWorks = [
  {
    title: 'Je cherche',
    text: 'Adresse, commune ou produit: je trouve vite les offres disponibles près de moi.',
  },
  {
    title: 'J’ajoute',
    text: 'Je choisis un produit clair avec photo, prix, zone et disponibilité.',
  },
  {
    title: 'Je confirme / je paie',
    text: 'Je valide retrait ou livraison, puis PayPal, carte via lien sécurisé ou assistance WhatsApp.',
  },
  {
    title: 'Je suis ma commande',
    text: 'Je reçois une confirmation simple et les informations utiles pour récupérer ou recevoir ma commande.',
  },
];

const reassurance = [
  {
    title: 'Local et crédible',
    text: 'Le site met en avant des partenaires visibles, des zones servies lisibles et des informations utiles au premier regard.',
    icon: ShieldCheck,
  },
  {
    title: 'Simple et rapide',
    text: 'Un parcours direct sur mobile, avec des CTA visibles et une conversion pensée pour aller droit au devis ou à la commande.',
    icon: Sparkles,
  },
  {
    title: 'Pensé pour la Martinique',
    text: 'Le vocabulaire, les communes, les besoins et les usages sont adaptés à un usage local réel.',
    icon: MapPin,
  },
];

const roleCards = [
  {
    title: 'Vendeur',
    text: 'Publiez vos plats, produits ou menus locaux.',
    cta: 'Devenir vendeur',
    href: '#partenaires',
    icon: Store,
  },
  {
    title: 'Livreur',
    text: 'Choisissez votre zone, vos créneaux et votre rayon.',
    cta: 'Devenir livreur',
    href: '#livreur',
    icon: Truck,
  },
  {
    title: 'Point relais',
    text: 'Accueillez des retraits clients dans votre commerce.',
    cta: 'Proposer un relais',
    href: '#partenaires',
    icon: Home,
  },
  {
    title: 'Entreprise',
    text: 'Commandes groupées, repas d’équipe et récurrence.',
    cta: 'Demander un devis',
    href: '#entreprises',
    icon: Briefcase,
  },
];

const driverHighlights = [
  ['Gains estimés', 'À valider selon course'],
  ['Zone', 'Commune + secteur'],
  ['Rayon', '5 à 12 km conseillé'],
  ['Disponibilité', 'Créneaux libres'],
  ['Véhicule', 'Scooter, voiture ou vélo'],
];

const faqItems = [
  {
    question: 'DELIKREOL est-il un simple traiteur ?',
    answer: 'Non. DELIKREOL est une plateforme locale multi-partenaire qui relie clients, vendeurs, livraison et demandes entreprises.',
  },
  {
    question: 'Comment savoir si un partenaire est actif ?',
    answer: 'Les fiches affichent la visibilité, la commune, la zone, les horaires et l’état disponible ou à confirmer.',
  },
  {
    question: 'Peut-on commander pour une entreprise ?',
    answer: 'Oui. Le bloc Entreprises & commandes groupées permet de demander un devis, un repas d’équipe ou une récurrence.',
  },
  {
    question: 'Quels modes de paiement sont disponibles ?',
    answer: 'Les modes proposés sont affichés au niveau des fiches et du panier. Si une donnée manque, elle doit rester en [À VALIDER].',
  },
  {
    question: 'Comment rejoindre la plateforme ?',
    answer: 'Les vendeurs, traiteurs et prestataires peuvent remplir le formulaire partenaire pour être examinés puis intégrés.',
  },
];

const defaultPartnerLeadForm: PartnerLeadForm = {
  business_name: '',
  contact_name: '',
  phone: '',
  whatsapp: '',
  email: '',
  commune: '',
  zone_label: '',
  activity_type: 'restaurant',
  delivery_radius_km: '8',
  opening_hours: '',
  description: '',
};

const defaultProductSubmissionForm: ProductSubmissionForm = {
  business_name: '',
  product_name: '',
  category: 'plats créoles',
  price: '',
  description: '',
};

const defaultBusinessRequestForm: BusinessRequestForm = {
  company_name: '',
  contact: '',
  people_count: '',
  requested_date: '',
  requested_time: '',
  location: '',
  budget: '',
  frequency: '',
  details: '',
};

export function PublicHomePage() {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const [catalog, setCatalog] = useState<CatalogState>({ configured: false, vendors: [], products: [] });
  const [query, setQuery] = useState('');
  const [communeFilter, setCommuneFilter] = useState('Tous');
  const [categoryFilter, setCategoryFilter] = useState('Tous');
  const [budgetFilter, setBudgetFilter] = useState('Tous');
  const [selectedProducts, setSelectedProducts] = useState<PublicCatalogProduct[]>([]);
  const [fulfillmentMode, setFulfillmentMode] = useState<'delivery' | 'pickup'>('delivery');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [partnerLeadForm, setPartnerLeadForm] = useState<PartnerLeadForm>(defaultPartnerLeadForm);
  const [productSubmissionForm, setProductSubmissionForm] = useState<ProductSubmissionForm>(defaultProductSubmissionForm);
  const [businessRequestForm, setBusinessRequestForm] = useState<BusinessRequestForm>(defaultBusinessRequestForm);
  const [partnerStatus, setPartnerStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [productStatus, setProductStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [businessStatus, setBusinessStatus] = useState<SubmitStatus>({ kind: 'idle' });
  const [productPhoto, setProductPhoto] = useState<File | null>(null);

  useEffect(() => {
    document.title = 'DELIKREOL Martinique | Plats créoles, traiteurs, produits locaux et entreprises';
    upsertMeta('description', 'DELIKREOL est la plateforme locale premium pour commander des plats créoles, des produits locaux et des demandes entreprises en Martinique.');
    upsertMeta('og:title', 'DELIKREOL Martinique | Plateforme locale premium');
    upsertMeta('og:description', 'Commandez des plats créoles et produits locaux en Martinique, avec retrait ou livraison selon votre commune.');
  }, []);

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
        setError('Le catalogue est momentanément indisponible. Aucune donnée inventée n’est affichée.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const serviceZones = useMemo(() => {
    const vendorZones = catalog.vendors.map((vendor) => vendor.zone_label).filter(Boolean);
    return Array.from(new Set([...getMartiniqueServiceZones(vendorZones), ...fallbackZones]));
  }, [catalog.vendors]);

  const categoryOptions = useMemo(() => {
    const fromCatalog = catalog.products.map((product) => product.category || 'plats créoles');
    return ['Tous', ...Array.from(new Set([...featuredCategories, ...fromCatalog]))];
  }, [catalog.products]);

  const filteredProducts = useMemo(() => {
    const needle = query.trim().toLowerCase();

    return catalog.products.filter((product) => {
      const zone = product.zone_label || '';
      const matchQuery =
        !needle ||
        `${product.name} ${product.vendor_name} ${product.category} ${product.description} ${zone}`
          .toLowerCase()
          .includes(needle);
      const matchCategory = categoryFilter === 'Tous' || product.category === categoryFilter;
      const matchCommune = communeFilter === 'Tous' || zone.toLowerCase().includes(communeFilter.toLowerCase());
      const price = product.price;
      const matchBudget =
        budgetFilter === 'Tous' ||
        (budgetFilter === '≤ 15 €' && price <= 15) ||
        (budgetFilter === '15 € - 30 €' && price > 15 && price <= 30) ||
        (budgetFilter === '30 € et plus' && price > 30);
      return matchQuery && matchCategory && matchCommune && matchBudget;
    });
  }, [catalog.products, categoryFilter, communeFilter, budgetFilter, query]);

  const featuredProducts = useMemo(() => filteredProducts.slice(0, 6), [filteredProducts]);
  const heroProduct = featuredProducts[0] ?? catalog.products[0] ?? null;
  const highlightedVendors = useMemo(() => catalog.vendors.slice(0, 6), [catalog.vendors]);

  const selectionEconomics = useMemo(
    () =>
      calculateOrderEconomics({
        items: selectedProducts.map((product) => ({ price: product.price, commissionRate: 0.15 })),
      }),
    [selectedProducts],
  );

  const orderLink = useMemo(() => {
    const lines = selectedProducts.map((product) => `- ${product.name} — ${product.vendor_name} — ${formatPrice(product.price)}`);
    const body = [
      'Bonjour DELIKREOL, je souhaite commander.',
      '',
      selectedProducts.length ? 'Sélection :' : 'Je souhaite connaître les disponibilités du moment.',
      ...lines,
      '',
      'Merci de confirmer la disponibilité, la commune et le mode de retrait / livraison.',
    ].join('\n');

    return `${whatsappBase}?text=${encodeURIComponent(body)}`;
  }, [selectedProducts]);

  const partnerLink = `${whatsappBase}?text=${encodeURIComponent('Bonjour DELIKREOL, je souhaite devenir partenaire.')}`;

  const businessLink = useMemo(() => {
    const body = [
      'Bonjour DELIKREOL, je souhaite une demande entreprise.',
      businessRequestForm.company_name && `Entreprise : ${businessRequestForm.company_name}`,
      businessRequestForm.contact && `Contact : ${businessRequestForm.contact}`,
      businessRequestForm.people_count && `Nombre de personnes : ${businessRequestForm.people_count}`,
      businessRequestForm.requested_date && `Date : ${businessRequestForm.requested_date}`,
      businessRequestForm.requested_time && `Heure : ${businessRequestForm.requested_time}`,
      businessRequestForm.location && `Lieu : ${businessRequestForm.location}`,
      businessRequestForm.budget && `Budget : ${businessRequestForm.budget}`,
      businessRequestForm.frequency && `Fréquence : ${businessRequestForm.frequency}`,
      businessRequestForm.details && `Détails : ${businessRequestForm.details}`,
    ]
      .filter(Boolean)
      .join('\n');

    return `${whatsappBase}?text=${encodeURIComponent(body || 'Bonjour DELIKREOL, je souhaite une demande entreprise.')}`;
  }, [businessRequestForm]);

  async function handlePartnerLeadSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPartnerStatus({ kind: 'saving', message: 'Envoi de la demande partenaire...' });

    try {
      await submitPartnerLead({
        business_name: partnerLeadForm.business_name,
        contact_name: partnerLeadForm.contact_name,
        phone: partnerLeadForm.phone,
        whatsapp: partnerLeadForm.whatsapp || partnerLeadForm.phone,
        email: partnerLeadForm.email || undefined,
        commune: partnerLeadForm.commune || undefined,
        zone_label: partnerLeadForm.zone_label || partnerLeadForm.commune || undefined,
        activity_type: partnerLeadForm.activity_type || undefined,
        delivery_radius_km: Number(partnerLeadForm.delivery_radius_km || '8'),
        opening_hours: partnerLeadForm.opening_hours || undefined,
      });
      setPartnerStatus({ kind: 'success', message: 'Demande envoyée. Votre dossier sera examiné rapidement.' });
      setPartnerLeadForm(defaultPartnerLeadForm);
    } catch (submitError) {
      setPartnerStatus({ kind: 'error', message: getErrorMessage(submitError, 'Impossible d’envoyer la demande pour le moment.') });
    }
  }

  async function handleProductSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProductStatus({ kind: 'saving', message: 'Envoi de la proposition...' });

    try {
      let imageUrl: string | null = null;
      if (productPhoto) {
        const uploaded = await uploadPartnerProductPhoto(productPhoto);
        imageUrl = uploaded.publicUrl;
      }

      await submitPartnerProduct({
        business_name: productSubmissionForm.business_name,
        product_name: productSubmissionForm.product_name,
        description: productSubmissionForm.description || undefined,
        category: productSubmissionForm.category || undefined,
        price: Number(productSubmissionForm.price || '0'),
        is_available: true,
        image_url: imageUrl,
      });

      setProductStatus({ kind: 'success', message: 'Proposition envoyée. Elle sera vérifiée avant affichage.' });
      setProductSubmissionForm(defaultProductSubmissionForm);
      setProductPhoto(null);
    } catch (submitError) {
      setProductStatus({ kind: 'error', message: getErrorMessage(submitError, 'Impossible d’envoyer la proposition pour le moment.') });
    }
  }

  async function handleBusinessRequestSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusinessStatus({ kind: 'saving', message: 'Envoi de la demande entreprise...' });

    try {
      await createBusinessRequest({
        company_name: businessRequestForm.company_name,
        contact: businessRequestForm.contact,
        people_count: businessRequestForm.people_count ? Number(businessRequestForm.people_count) : null,
        requested_date: businessRequestForm.requested_date || null,
        requested_time: businessRequestForm.requested_time || null,
        location: businessRequestForm.location || null,
        budget: businessRequestForm.budget || null,
        frequency: businessRequestForm.frequency || null,
      });
      setBusinessStatus({ kind: 'success', message: 'Demande entreprise envoyée. Un retour rapide est attendu.' });
      setBusinessRequestForm(defaultBusinessRequestForm);
    } catch (submitError) {
      setBusinessStatus({ kind: 'error', message: getErrorMessage(submitError, 'Impossible d’envoyer la demande entreprise pour le moment.') });
    }
  }

  function addToSelection(product: PublicCatalogProduct) {
    setSelectedProducts((current) => [...current, product]);
  }

  function removeFromSelection(index: number) {
    setSelectedProducts((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  function clearSelection() {
    setSelectedProducts([]);
  }

  return (
    <div className="min-h-screen bg-[#fbf4ea] text-[#2a190f]">
      <header className="sticky top-0 z-50 border-b border-white/80 bg-[#fbf4ea]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <a href="#accueil" className="flex items-center gap-3" aria-label="DELIKREOL accueil">
            <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-11 w-11 rounded-2xl bg-white p-1.5 shadow-lg" />
            <div className="hidden sm:block">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Martinique locale premium</p>
              <p className="text-sm font-bold text-[#2a190f]">DELIKREOL</p>
            </div>
          </a>

          <nav className="hidden items-center gap-2 lg:flex">
            <NavLink href="#catalogue">Catalogue</NavLink>
            <NavLink href="#zones">Zones</NavLink>
            <NavLink href="#entreprises">Entreprises</NavLink>
            <NavLink href="#partenaires">Devenir partenaire</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={partnerLink}
              className="hidden rounded-full border border-orange-200 bg-white px-4 py-2 text-sm font-black text-[#7c2d12] shadow-sm transition hover:-translate-y-0.5 sm:inline-flex"
            >
              Devenir partenaire
            </a>
            <a
              href={orderLink}
              className="inline-flex rounded-full bg-[#d95f2d] px-4 py-2 text-sm font-black text-white shadow-lg shadow-orange-500/25 transition hover:-translate-y-0.5"
            >
              Commander
            </a>
          </div>
        </div>
      </header>

      <main id="accueil">
        <section className="relative overflow-hidden border-b border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(217,95,45,0.18),_transparent_34%),radial-gradient(circle_at_top_right,_rgba(10,77,62,0.12),_transparent_28%),linear-gradient(135deg,_#fff8ee_0%,_#fffdf9_50%,_#fff3e7_100%)]">
          <div className="madras-strip" />
          <div className="mx-auto grid max-w-7xl gap-7 px-4 py-7 sm:py-10 lg:grid-cols-[1.08fr_0.92fr] lg:py-14">
            <div className="flex flex-col justify-center">
              <BadgeRow />
              <h1 className="mt-5 max-w-4xl font-display text-4xl font-black leading-[0.96] tracking-tight text-[#2a190f] sm:text-5xl lg:text-7xl">
                Commandez local en Martinique.
              </h1>
              <p className="mt-4 max-w-xl text-base leading-7 text-[#5a4334] sm:text-lg">
                Trouvez un plat, un produit ou un traiteur disponible près de votre commune. Retrait ou livraison selon l’offre.
              </p>

              <div className="mt-6 rounded-[1.75rem] border border-orange-100 bg-white p-3 shadow-elegant">
                <div className="grid gap-3 lg:grid-cols-[1fr_190px]">
                  <label className="relative block">
                    <MapPin className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#c2410c]" />
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Votre commune, adresse ou produit"
                      className="h-14 w-full rounded-2xl border border-orange-100 bg-[#fffaf4] pl-12 pr-4 text-base font-black text-[#2a190f] outline-none ring-orange-200 placeholder:text-stone-400 focus:ring-4"
                    />
                  </label>
                  <a href="#catalogue" className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-5 text-sm font-black uppercase tracking-[0.12em] text-white shadow-xl shadow-orange-500/25 transition hover:-translate-y-0.5">
                    Commander <ArrowRight className="h-5 w-5" />
                  </a>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.16em] text-stone-400">Zones rapides</span>
                  {serviceZones.slice(0, 4).map((zone) => (
                    <button
                      key={zone}
                      onClick={() => {
                        setCommuneFilter(zone);
                        setQuery(zone);
                      }}
                      className="rounded-full border border-orange-100 bg-[#fff8ef] px-3 py-1.5 text-xs font-black text-[#7c2d12]"
                    >
                      {zone}
                    </button>
                  ))}
                </div>
              </div>

              <a href="#partenaires" className="mt-4 inline-flex w-fit items-center justify-center gap-2 rounded-full border border-orange-200 bg-white/80 px-5 py-3 text-sm font-black text-[#7c2d12] transition hover:-translate-y-0.5">
                Devenir partenaire <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="brand-panel rounded-[2rem] p-4 shadow-elegant">
              {heroProduct ? (
                <div className="overflow-hidden rounded-[1.75rem] bg-[#20150f] text-white shadow-2xl">
                  <div className="relative aspect-[4/3]">
                    {heroProduct.image_url ? (
                      <img src={heroProduct.image_url} alt={heroProduct.name} className="h-full w-full object-cover" />
                    ) : (
                      <HeroFallback name={heroProduct.name} />
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/45 to-transparent p-5">
                      <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Produit phare</p>
                      <h2 className="mt-2 text-2xl font-black sm:text-3xl">{heroProduct.name}</h2>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-black uppercase tracking-[0.16em]">
                        <span className="rounded-full bg-white/10 px-3 py-1">{heroProduct.vendor_name}</span>
                        <span className="rounded-full bg-white/10 px-3 py-1">{heroProduct.zone_label}</span>
                      </div>
                      <div className="mt-4 flex items-end justify-between gap-3">
                        <strong className="text-3xl font-black text-orange-200">{formatPrice(heroProduct.price)}</strong>
                        <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-200">
                          Disponible
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <HeroFallback name="DELIKREOL" loading={loading} configured={catalog.configured} />
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {trustPills.map((pill) => (
                  <TrustCard key={pill} label={pill} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <SectionTitle
            eyebrow="Comment ça marche"
            title="Chercher, ajouter, confirmer, suivre."
            text="Un parcours court, lisible sur mobile, centré sur la commande."
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {howItWorks.map((step, index) => (
              <StepCard key={step.title} index={index + 1} title={step.title} text={step.text} />
            ))}
          </div>
        </section>

        <section id="catalogue" className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <SectionTitle
                eyebrow="Catalogue"
                title="Les offres disponibles."
                text="Photo, prix, zone, disponibilité, action."
              />
              <a href={orderLink} className="inline-flex w-fit items-center gap-2 rounded-full bg-[#d95f2d] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white shadow-xl shadow-orange-500/25">
                Commander par WhatsApp <MessageCircle className="h-5 w-5" />
              </a>
            </div>

            <div className="mt-8 grid gap-4 rounded-[1.75rem] border border-orange-100 bg-[#fff8ef] p-4 shadow-soft lg:grid-cols-[1fr_220px_220px]">
              <label className="relative block">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Rechercher un plat, un traiteur, un produit ou une commune"
                  className="w-full rounded-2xl border border-orange-100 bg-white py-4 pl-12 pr-4 text-sm font-semibold outline-none ring-orange-200 focus:ring-4"
                />
              </label>
              <Select value={communeFilter} onChange={setCommuneFilter}>
                <option value="Tous">Toutes les communes</option>
                {serviceZones.map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
              </Select>
              <Select value={budgetFilter} onChange={setBudgetFilter}>
                {budgetRanges.map((range) => (
                  <option key={range} value={range}>
                    {range}
                  </option>
                ))}
              </Select>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categoryOptions.slice(0, 12).map((category) => {
                const active = categoryFilter === category;
                return (
                  <button
                    key={category}
                    onClick={() => setCategoryFilter(category)}
                    className={`shrink-0 rounded-full border px-4 py-2 text-sm font-black transition ${
                      active
                        ? 'border-transparent bg-[#d95f2d] text-white shadow-lg shadow-orange-500/20'
                        : 'border-orange-200 bg-white text-[#7c2d12] hover:-translate-y-0.5'
                    }`}
                  >
                    {category}
                  </button>
                );
              })}
            </div>

            <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                {loading && <EmptyState title="Catalogue en chargement" text="Les offres apparaîtront dès que les partenaires publiés sont récupérés." />}
                {error && <EmptyState title="Catalogue indisponible" text={error} />}
                {!loading && !error && filteredProducts.length === 0 && (
                  <EmptyState
                    title="Aucune offre visible avec ces filtres"
                    text="Affinez la commune, la catégorie ou le budget. Si vous êtes prestataire, la meilleure prochaine action est de devenir partenaire."
                    action={partnerLink}
                  />
                )}

                {filteredProducts.length > 0 && (
                  <>
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-black uppercase tracking-[0.18em] text-[#c2410c]">Sélection en vedette</p>
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">{featuredProducts.length} cartes</span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                      {featuredProducts.map((product) => (
                        <ProductCard key={`featured-${product.id}`} product={product} onAdd={() => addToSelection(product)} compact />
                      ))}
                    </div>

                    <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                        {filteredProducts.map((product) => (
                          <ProductCard key={product.id} product={product} onAdd={() => addToSelection(product)} />
                        ))}
                      </div>
                      <SelectionPanel
                        products={selectedProducts}
                        summary={selectionEconomics}
                        orderLink={orderLink}
                        fulfillmentMode={fulfillmentMode}
                        onFulfillmentModeChange={setFulfillmentMode}
                        onRemove={removeFromSelection}
                        onClear={clearSelection}
                      />
                    </div>
                  </>
                )}
              </div>

              <aside className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">Fiche produit</p>
                <h3 className="mt-2 text-2xl font-black text-[#2a190f]">Lecture rapide</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Chaque fiche affiche le vendeur, la commune, le prix et l’action de conversion la plus simple. C’est la vitrine la plus rentable du site.
                </p>
                {heroProduct ? (
                  <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-orange-100">
                    <div className="aspect-[4/3] bg-[#fff2e6]">
                      {heroProduct.image_url ? (
                        <img src={heroProduct.image_url} alt={heroProduct.name} className="h-full w-full object-cover" />
                      ) : (
                        <HeroFallback name={heroProduct.name} />
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#c2410c]">
                        <BadgeCheck className="h-4 w-4" />
                        partenaire visible
                      </div>
                      <h4 className="text-xl font-black text-[#2a190f]">{heroProduct.name}</h4>
                      <p className="text-sm text-stone-600">{heroProduct.vendor_name}</p>
                      <div className="grid gap-2 text-sm text-stone-600">
                        <InfoLine label="Commune" value={heroProduct.zone_label} />
                        <InfoLine label="Prix" value={formatPrice(heroProduct.price)} />
                        <InfoLine label="Service" value="Retrait / livraison selon zone" />
                        <InfoLine label="Disponibilité" value={heroProduct.available ? 'Disponible' : 'À confirmer'} />
                      </div>
                      <a href={orderLink} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
                        Ajouter et commander
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-5 rounded-[1.5rem] border border-dashed border-orange-200 bg-orange-50/60 p-6 text-sm text-stone-600">
                    Aucune fiche produit active pour le moment. Les prochaines offres publiées apparaîtront ici.
                  </div>
                )}
              </aside>
            </div>
          </div>
        </section>

        <section id="zones" className="mx-auto max-w-7xl px-4 py-14">
          <SectionTitle
            eyebrow="Zones desservies"
            title="La couverture est lisible, simple et locale."
            text="Les communes apparaissent clairement pour éviter les frictions au moment de commander ou de demander un devis."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {serviceZones.slice(0, 8).map((zone) => (
              <ZoneCard key={zone} zone={zone} />
            ))}
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {highlightedVendors.map((vendor) => (
              <VendorCard key={vendor.id} vendor={vendor} />
            ))}
          </div>
        </section>

        <section className="bg-[#fff8ef] py-14">
          <div className="mx-auto max-w-7xl px-4">
            <SectionTitle
              eyebrow="Rôles"
              title="Un accès clair pour chaque profil."
              text="Chaque rôle a une action unique. Le parcours client reste prioritaire."
            />
            <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {roleCards.map((role) => (
                <RoleCard key={role.title} {...role} />
              ))}
            </div>
          </div>
        </section>

        <section id="livreur" className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-6 rounded-[2rem] border border-orange-100 bg-white p-5 shadow-elegant lg:grid-cols-[0.95fr_1.05fr] lg:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Livreurs</p>
              <h2 className="mt-3 font-display text-4xl font-black tracking-tight text-[#2a190f] sm:text-5xl">Un parcours livreur simple à comprendre.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-stone-600 sm:text-base">
                DELIKREOL doit afficher ce qui compte avant l’inscription: gains estimés, zone, rayon, disponibilités et véhicule.
              </p>
              <a href={`${whatsappBase}?text=${encodeURIComponent('Bonjour DELIKREOL, je souhaite devenir livreur.')}`} className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-5 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
                Devenir livreur <Truck className="h-4 w-4" />
              </a>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {driverHighlights.map(([label, value]) => (
                <div key={label} className="rounded-[1.35rem] border border-orange-100 bg-[#fffaf4] p-4">
                  <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">{label}</p>
                  <p className="mt-2 text-lg font-black text-[#2a190f]">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {reassurance.map((item) => (
              <ValueCard key={item.title} {...item} />
            ))}
          </div>
        </section>

        <section id="entreprises" className="bg-[#24170f] py-14 text-white">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Entreprises & commandes groupées</p>
              <h2 className="mt-3 max-w-2xl font-display text-4xl font-black leading-tight sm:text-5xl">
                Repas d’équipe, commandes récurrentes, événements ou demandes urgentes.
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-7 text-stone-300">
                DELIKREOL permet à une entreprise de formuler une demande structurée, simple à traiter, avec un devis rapide et un suivi propre.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <BusinessChip text="Repas d’équipe" />
                <BusinessChip text="Commande récurrente" />
                <BusinessChip text="Événement / cocktail" />
                <BusinessChip text="Facturation" />
              </div>
              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <MiniMetric label="Frais livraison" value="[À VALIDER]" />
                  <MiniMetric label="Mode de paiement" value="[À VALIDER]" />
                  <MiniMetric label="Confirmation" value="WhatsApp + email" />
                  <MiniMetric label="Délai" value="[À VALIDER]" />
                </div>
              </div>
            </div>

            <form onSubmit={handleBusinessRequestSubmit} className="rounded-[2rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Demande entreprise</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <InputDark value={businessRequestForm.company_name} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, company_name: value }))} placeholder="Entreprise" required />
                <InputDark value={businessRequestForm.contact} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, contact: value }))} placeholder="Contact" required />
                <InputDark value={businessRequestForm.people_count} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, people_count: value }))} placeholder="Nombre de personnes" />
                <InputDark value={businessRequestForm.location} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, location: value }))} placeholder="Commune / lieu" />
                <InputDark value={businessRequestForm.requested_date} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, requested_date: value }))} placeholder="Date souhaitée" />
                <InputDark value={businessRequestForm.requested_time} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, requested_time: value }))} placeholder="Heure souhaitée" />
                <InputDark value={businessRequestForm.budget} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, budget: value }))} placeholder="Budget" />
                <InputDark value={businessRequestForm.frequency} onChange={(value) => setBusinessRequestForm((current) => ({ ...current, frequency: value }))} placeholder="Fréquence" />
                <TextareaDark
                  value={businessRequestForm.details}
                  onChange={(value) => setBusinessRequestForm((current) => ({ ...current, details: value }))}
                  placeholder="Repas d’équipe, buffet, commande récurrente, livraison..."
                  className="sm:col-span-2"
                  rows={4}
                />
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                <button type="submit" disabled={businessStatus.kind === 'saving'} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-black text-emerald-950 disabled:opacity-70">
                  {businessStatus.kind === 'saving' ? 'Envoi...' : 'Envoyer la demande'}
                </button>
                <a href={businessLink} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 px-5 py-3 font-black text-white">
                  Copier sur WhatsApp
                </a>
              </div>
              <StatusBanner status={businessStatus} />
            </form>
          </div>
        </section>

        <section id="partenaires" className="bg-[#fff4e2] py-14">
          <div className="mx-auto max-w-7xl px-4">
            <SectionTitle
              eyebrow="Devenir partenaire"
              title="Restaurants, traiteurs, vendeurs et prestataires locaux."
              text="Le site permet de rejoindre la plateforme avec une fiche simple, un catalogue clair et une conversion pensée pour les smartphones."
            />

            <div className="mt-8 grid gap-6 xl:grid-cols-[0.92fr_1.08fr_1.08fr]">
              <div className="rounded-[1.75rem] bg-[#20150f] p-6 text-white shadow-elegant">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-300">Pourquoi rejoindre DELIKREOL</p>
                <h3 className="mt-3 text-3xl font-black leading-tight">Un site qui met en avant votre offre sans vous noyer.</h3>
                <div className="mt-6 space-y-3">
                  {[
                    'Visibilité locale premium',
                    'Fiche claire avec commune et zone',
                    'CTA WhatsApp et devis rapide',
                    'Catalogue produit ou service',
                    'Parcours pensé pour la conversion mobile',
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                      <BadgeCheck className="h-5 w-5 text-emerald-300" />
                      <span className="text-sm font-semibold text-stone-100">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handlePartnerLeadSubmit} className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Formulaire partenaire</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input value={partnerLeadForm.business_name} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, business_name: value }))} placeholder="Nom de l’établissement" required className="sm:col-span-2" />
                  <Input value={partnerLeadForm.contact_name} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, contact_name: value }))} placeholder="Contact" required />
                  <Input value={partnerLeadForm.phone} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, phone: value }))} placeholder="Téléphone" required />
                  <Input value={partnerLeadForm.whatsapp} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, whatsapp: value }))} placeholder="WhatsApp" />
                  <Input value={partnerLeadForm.email} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, email: value }))} placeholder="Email" />
                  <Input value={partnerLeadForm.commune} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, commune: value }))} placeholder="Commune" />
                  <Input value={partnerLeadForm.zone_label} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, zone_label: value }))} placeholder="Zone servie" />
                  <Input value={partnerLeadForm.delivery_radius_km} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, delivery_radius_km: value }))} placeholder="Rayon (km)" />
                  <Input value={partnerLeadForm.activity_type} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, activity_type: value }))} placeholder="Type d’activité" />
                  <Input value={partnerLeadForm.opening_hours} onChange={(value) => setPartnerLeadForm((current) => ({ ...current, opening_hours: value }))} placeholder="Horaires" className="sm:col-span-2" />
                  <Textarea
                    value={partnerLeadForm.description}
                    onChange={(value) => setPartnerLeadForm((current) => ({ ...current, description: value }))}
                    placeholder="Décrivez votre activité, vos produits, votre livraison..."
                    className="sm:col-span-2"
                    rows={4}
                  />
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={partnerStatus.kind === 'saving'} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-5 py-3 font-black text-white disabled:opacity-70">
                    {partnerStatus.kind === 'saving' ? 'Envoi...' : 'Envoyer ma demande'}
                  </button>
                  <a href={partnerLink} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-[#fff8ef] px-5 py-3 font-black text-[#7c2d12]">
                    WhatsApp partenaire
                  </a>
                </div>
                <StatusBanner status={partnerStatus} />
              </form>

              <form onSubmit={handleProductSubmit} className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-soft">
                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">Proposer un produit</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">
                  Ajoutez une offre ou une carte produit pour enrichir le catalogue local. Les champs manquants restent visibles en [À VALIDER].
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Input value={productSubmissionForm.business_name} onChange={(value) => setProductSubmissionForm((current) => ({ ...current, business_name: value }))} placeholder="Nom de l’établissement" required className="sm:col-span-2" />
                  <Input value={productSubmissionForm.product_name} onChange={(value) => setProductSubmissionForm((current) => ({ ...current, product_name: value }))} placeholder="Nom du produit" required />
                  <Input value={productSubmissionForm.category} onChange={(value) => setProductSubmissionForm((current) => ({ ...current, category: value }))} placeholder="Catégorie" />
                  <Input value={productSubmissionForm.price} onChange={(value) => setProductSubmissionForm((current) => ({ ...current, price: value }))} placeholder="Prix" />
                  <Textarea
                    value={productSubmissionForm.description}
                    onChange={(value) => setProductSubmissionForm((current) => ({ ...current, description: value }))}
                    placeholder="Description courte"
                    className="sm:col-span-2"
                    rows={4}
                  />
                  <label className="sm:col-span-2 flex items-center justify-between rounded-2xl border border-dashed border-orange-200 bg-orange-50/50 px-4 py-3 text-sm font-semibold text-stone-600">
                    <span className="inline-flex items-center gap-2">
                      <Package className="h-4 w-4 text-[#c2410c]" />
                      {productPhoto ? productPhoto.name : 'Ajouter une photo produit'}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={(event) => setProductPhoto(event.target.files?.[0] ?? null)} />
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#7c2d12]">Choisir</span>
                  </label>
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={productStatus.kind === 'saving'} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-black text-white disabled:opacity-70">
                    {productStatus.kind === 'saving' ? 'Envoi...' : 'Ajouter au catalogue'}
                  </button>
                  <span className="inline-flex items-center rounded-2xl border border-orange-100 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-stone-500">
                    Visibilité locale premium
                  </span>
                </div>
                <StatusBanner status={productStatus} />
              </form>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-14">
          <SectionTitle
            eyebrow="Preuves et confiance"
            title="Le site doit rassurer au premier regard."
            text="Les preuves affichées ici sont visibles, simples et honnêtes. Lorsqu’une donnée n’est pas encore confirmée, elle reste en [À VALIDER]."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              'Partenaires visibles et vérifiés',
              'Réponse rapide par WhatsApp',
              'Commande entreprise simple à relancer',
            ].map((item) => (
              <ProofCard key={item} title={item} />
            ))}
          </div>
        </section>

        <section id="faq" className="bg-white py-14">
          <div className="mx-auto max-w-7xl px-4">
            <SectionTitle
              eyebrow="FAQ"
              title="Les questions qui déclenchent la conversion."
              text="Chaque réponse doit lever une objection simple: confiance, zone, disponibilité, commande, partenaire ou entreprise."
            />
            <div className="mt-8 grid gap-4 lg:grid-cols-2">
              {faqItems.map((item) => (
                <FaqItem key={item.question} {...item} />
              ))}
            </div>
          </div>
        </section>

        <section id="contact" className="mx-auto max-w-7xl px-4 py-14">
          <div className="grid gap-4 rounded-[1.75rem] border border-orange-100 bg-[linear-gradient(135deg,_#24170f_0%,_#392115_52%,_#d95f2d_180%)] p-6 text-white lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.24em] text-orange-200">Contact / WhatsApp</p>
              <h2 className="mt-3 text-3xl font-black sm:text-5xl">Une réponse rapide, directe, locale.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-stone-200 sm:text-base sm:leading-7">
                En cas de doute, l’utilisateur doit pouvoir joindre DELIKREOL immédiatement. Le bouton WhatsApp reste l’action la plus rentable pour convertir.
              </p>
            </div>
            <div className="grid gap-3">
              <a href={orderLink} className="rounded-2xl bg-white px-5 py-4 text-center font-black text-[#24170f]">
                Commander sur WhatsApp
              </a>
              <a href={partnerLink} className="rounded-2xl border border-white/20 px-5 py-4 text-center font-black text-white">
                Devenir partenaire
              </a>
              <a href={businessLink} className="rounded-2xl border border-white/20 px-5 py-4 text-center font-black text-white">
                Demande entreprise
              </a>
              <div className="rounded-2xl bg-white/10 px-5 py-4 text-sm leading-6 text-stone-100">
                Email: <span className="font-bold">[À VALIDER]</span>
                <br />
                Frais de livraison: <span className="font-bold">[À VALIDER]</span>
                <br />
                Minimum de commande: <span className="font-bold">[À VALIDER]</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-orange-100 bg-[#fff9f3]">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr_0.9fr]">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img src={`${baseUrl}branding/logo-mark.svg`} alt="DELIKREOL" className="h-10 w-10 rounded-2xl bg-white p-1.5 shadow-sm" />
              <div>
                <p className="font-black text-[#2a190f]">DELIKREOL</p>
                <p className="text-sm text-stone-500">Plateforme locale premium en Martinique</p>
              </div>
            </div>
            <p className="max-w-xl text-sm leading-6 text-stone-600">
              Commande locale, partenaires visibles, demandes entreprises et parcours mobile-first pour faire de DELIKREOL une vraie plateforme opérationnelle.
            </p>
          </div>
          <FooterBlock title="Zones et services">
            {serviceZones.slice(0, 6).map((zone) => (
              <FooterLink key={zone} label={zone} />
            ))}
            <FooterLink label="Retrait / livraison" />
            <FooterLink label="Entreprise / devis" />
          </FooterBlock>
          <FooterBlock title="Liens utiles">
            <FooterLink label="CGV" />
            <FooterLink label="Mentions légales" />
            <FooterLink label="Confidentialité" />
            <a href={whatsappBase} className="inline-flex items-center gap-2 text-sm font-bold text-[#7c2d12]">
              WhatsApp <MessageCircle className="h-4 w-4" />
            </a>
          </FooterBlock>
        </div>
      </footer>

      {selectedProducts.length > 0 && (
        <div className="fixed inset-x-4 bottom-4 z-50 rounded-[1.5rem] border border-orange-100 bg-white p-4 shadow-2xl shadow-orange-900/20 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c2410c]">{selectedProducts.length} article(s)</p>
              <p className="text-sm font-bold text-[#2a190f]">{formatPrice(selectionEconomics.subtotal_produits)} hors livraison</p>
            </div>
            <a href={orderLink} className="rounded-full bg-[#d95f2d] px-4 py-3 text-sm font-black text-white">
              Commander
            </a>
          </div>
        </div>
      )}

      {selectedProducts.length === 0 && (
        <div className="fixed inset-x-4 bottom-4 z-50 grid grid-cols-[1fr_auto] gap-2 rounded-[1.5rem] border border-orange-100 bg-white p-3 shadow-2xl shadow-orange-900/20 md:hidden">
          <a href="#catalogue" className="inline-flex items-center justify-center rounded-2xl bg-[#d95f2d] px-4 py-3 text-sm font-black text-white">
            Commander maintenant
          </a>
          <a href="#partenaires" className="inline-flex items-center justify-center rounded-2xl border border-orange-200 px-4 py-3 text-sm font-black text-[#7c2d12]">
            Partenaire
          </a>
        </div>
      )}

      <a
        href={whatsappBase}
        className="fixed bottom-5 right-5 z-50 hidden items-center gap-2 rounded-full bg-[#25D366] px-4 py-3 text-sm font-black text-white shadow-2xl shadow-green-500/30 md:inline-flex"
      >
        WhatsApp <MessageCircle className="h-5 w-5" />
      </a>
    </div>
  );
}

function BadgeRow() {
  return (
    <div className="flex flex-wrap gap-2">
      <span className="rounded-full border border-orange-200 bg-white px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#c2410c] shadow-sm">
        plateforme locale premium
      </span>
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-emerald-800">
        pensée pour la Martinique
      </span>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3">
      <span className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">{label}</span>
      <span className="text-right text-sm font-semibold text-[#2a190f]">{value}</span>
    </div>
  );
}

function TrustCard({ label }: { label: string }) {
  return (
    <div className="rounded-[1.4rem] border border-orange-100 bg-white px-4 py-3 text-center text-xs font-black uppercase tracking-[0.18em] text-[#c2410c] shadow-soft">
      {label}
    </div>
  );
}

function ZoneCard({ zone }: { zone: string }) {
  return (
    <div className="rounded-[1.4rem] border border-orange-100 bg-white px-4 py-3 shadow-soft">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-400">commune</p>
      <p className="mt-2 text-sm font-black text-[#2a190f]">{zone}</p>
      <p className="mt-1 text-xs leading-5 text-stone-500">Retrait ou livraison selon l’offre visible sur la fiche.</p>
    </div>
  );
}

function ValueCard({ title, text, icon: Icon }: { title: string; text: string; icon: ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-soft">
      <div className="inline-flex rounded-2xl bg-[#fff3e5] p-3 text-[#c2410c]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-xl font-black text-[#2a190f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  );
}

function RoleCard({
  title,
  text,
  cta,
  href,
  icon: Icon,
}: {
  title: string;
  text: string;
  cta: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <article className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-xl font-black text-[#2a190f]">{title}</h3>
          <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
        </div>
        <span className="rounded-2xl bg-[#fff3e5] p-3 text-[#c2410c]">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <a href={href} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-orange-200 bg-[#fffaf4] px-4 py-3 text-sm font-black text-[#7c2d12]">
        {cta} <ChevronRight className="h-4 w-4" />
      </a>
    </article>
  );
}

function StepCard({ index, title, text }: { index: number; title: string; text: string }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-soft">
      <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-[#d95f2d] text-sm font-black text-white">{index}</div>
      <h3 className="mt-4 text-xl font-black text-[#2a190f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">{text}</p>
    </div>
  );
}

function ProductCard({
  product,
  onAdd,
  compact = false,
}: {
  product: PublicCatalogProduct;
  onAdd: () => void;
  compact?: boolean;
}) {
  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-orange-100 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-xl">
      <div className={`${compact ? 'aspect-[16/11]' : 'aspect-[4/3]'} bg-[#fff4e7]`}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <HeroFallback name={product.name} />
        )}
      </div>
      <div className="space-y-4 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className={`${compact ? 'text-lg' : 'text-xl'} font-black text-[#2a190f]`}>{product.name}</h3>
            <p className="mt-1 text-sm font-semibold text-stone-500">{product.vendor_name}</p>
          </div>
          <strong className={`${compact ? 'text-xl' : 'text-2xl'} whitespace-nowrap font-black text-[#2a190f]`}>{formatPrice(product.price)}</strong>
        </div>
        <div className="grid grid-cols-2 gap-2 text-xs font-black uppercase tracking-[0.14em]">
          <span className="rounded-2xl bg-slate-100 px-3 py-2 text-slate-700">{product.zone_label || '[À VALIDER]'}</span>
          <span className="rounded-2xl bg-emerald-50 px-3 py-2 text-emerald-700">{product.available ? 'Disponible' : 'À confirmer'}</span>
        </div>
        <button onClick={onAdd} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-4 py-3 text-sm font-black uppercase tracking-[0.14em] text-white">
          Ajouter <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}

function VendorCard({ vendor }: { vendor: PublicCatalogVendor }) {
  return (
    <article className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c2410c]">{vendor.business_type}</p>
          <h3 className="mt-2 text-2xl font-black text-[#2a190f]">{vendor.business_name}</h3>
        </div>
        <BadgeCheck className="h-7 w-7 text-emerald-600" />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-600">{vendor.description}</p>
      <div className="mt-4 grid gap-2 text-sm">
        <InfoLine label="Commune" value={vendor.zone_label || '[À VALIDER]'} />
        <InfoLine label="Rayon" value={`${vendor.delivery_radius_km} km`} />
        <InfoLine label="Adresse" value={vendor.address || '[À VALIDER]'} />
      </div>
    </article>
  );
}

function SelectionPanel({
  products,
  summary,
  orderLink,
  fulfillmentMode,
  onFulfillmentModeChange,
  onRemove,
  onClear,
}: {
  products: PublicCatalogProduct[];
  summary: ReturnType<typeof calculateOrderEconomics>;
  orderLink: string;
  fulfillmentMode: 'delivery' | 'pickup';
  onFulfillmentModeChange: (mode: 'delivery' | 'pickup') => void;
  onRemove: (index: number) => void;
  onClear: () => void;
}) {
  return (
    <aside className="h-fit rounded-[1.75rem] border border-orange-100 bg-[#fffaf4] p-5 shadow-soft lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <ShoppingBag className="h-5 w-5 text-[#d95f2d]" />
          <h3 className="text-lg font-black text-[#2a190f]">Panier</h3>
        </div>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#7c2d12]">{products.length} article(s)</span>
      </div>

      {products.length === 0 ? (
        <p className="mt-4 text-sm leading-6 text-stone-600">Ajoutez une offre pour préparer votre commande. Le montant final sera confirmé avant validation.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {products.map((product, index) => (
            <div key={`${product.id}-${index}`} className="rounded-2xl bg-white p-3 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-black text-[#2a190f]">{product.name}</p>
                  <p className="text-xs text-stone-500">{product.vendor_name}</p>
                </div>
                <button onClick={() => onRemove(index)} className="text-xs font-bold text-stone-400">
                  Retirer
                </button>
              </div>
            </div>
          ))}

          <div className="grid grid-cols-2 gap-2">
            {[
              ['delivery', 'Livraison'],
              ['pickup', 'Retrait'],
            ].map(([mode, label]) => {
              const active = fulfillmentMode === mode;
              return (
                <button
                  key={mode}
                  onClick={() => onFulfillmentModeChange(mode as 'delivery' | 'pickup')}
                  className={`rounded-2xl border px-3 py-3 text-sm font-black ${
                    active ? 'border-[#d95f2d] bg-[#fff3e5] text-[#7c2d12]' : 'border-orange-100 bg-white text-stone-500'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-4 text-sm">
            <PriceLine label="Sous-total" value={formatPrice(summary.subtotal_produits)} />
            <PriceLine label={fulfillmentMode === 'delivery' ? 'Livraison' : 'Retrait'} value={fulfillmentMode === 'delivery' ? '[À VALIDER]' : '0,00 €'} />
            <div className="mt-3 rounded-2xl bg-[#2a190f] px-4 py-3 text-white">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-orange-200">Total estimé</p>
              <p className="mt-1 text-3xl font-black">{formatPrice(summary.total_client)}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-orange-100 bg-white p-4">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-stone-400">Paiement</p>
            <div className="mt-3 grid gap-2 text-sm font-bold text-[#2a190f]">
              <span className="rounded-xl bg-[#fff8ef] px-3 py-2">PayPal</span>
              <span className="rounded-xl bg-[#fff8ef] px-3 py-2">Carte via lien sécurisé</span>
              <span className="rounded-xl bg-[#fff8ef] px-3 py-2">Assistance WhatsApp</span>
            </div>
          </div>

          <a href={orderLink} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#d95f2d] px-5 py-3 font-black uppercase tracking-[0.14em] text-white">
            Commander par WhatsApp <MessageCircle className="h-4 w-4" />
          </a>
          <button onClick={onClear} className="w-full rounded-2xl border border-orange-200 bg-white px-5 py-3 text-sm font-black text-[#7c2d12]">
            Vider le panier
          </button>
          <p className="text-xs font-medium text-stone-500">La disponibilité, le retrait ou la livraison sont confirmés selon votre commune.</p>
        </div>
      )}
    </aside>
  );
}

function EmptyState({ title, text, action }: { title: string; text: string; action?: string }) {
  return (
    <div className="rounded-[1.75rem] border border-orange-100 bg-white p-6 shadow-soft">
      <div className="inline-flex rounded-2xl bg-[#fff3e5] p-3 text-[#c2410c]">
        <Package className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-2xl font-black text-[#2a190f]">{title}</h3>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-stone-600">{text}</p>
      {action && (
        <a href={action} className="mt-5 inline-flex rounded-2xl bg-[#d95f2d] px-5 py-3 text-sm font-black text-white">
          Devenir partenaire
        </a>
      )}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <details className="group rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-soft">
      <summary className="cursor-pointer list-none text-lg font-black text-[#2a190f]">
        <span className="flex items-center justify-between gap-3">
          {question}
          <ChevronRight className="h-5 w-5 transition group-open:rotate-90" />
        </span>
      </summary>
      <p className="mt-4 text-sm leading-6 text-stone-600">{answer}</p>
    </details>
  );
}

function ProofCard({ title }: { title: string }) {
  return (
    <div className="rounded-[1.5rem] border border-orange-100 bg-white p-5 shadow-soft">
      <div className="inline-flex rounded-2xl bg-[#fff3e5] p-3 text-[#c2410c]">
        <Star className="h-5 w-5" />
      </div>
      <h3 className="mt-4 text-lg font-black text-[#2a190f]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-stone-600">
        [À VALIDER] Cette preuve sera remplacée par des témoignages et des chiffres réels dès que les premières ventes sont remontées.
      </p>
    </div>
  );
}

function SectionTitle({ eyebrow, title, text }: { eyebrow: string; title: string; text: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.24em] text-[#c2410c]">{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl font-display text-3xl font-black tracking-tight text-[#2a190f] sm:text-4xl">{title}</h2>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-stone-600 sm:text-base sm:leading-7">{text}</p>
    </div>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className={`rounded-2xl border border-orange-100 bg-[#fffaf4] px-4 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4 ${className}`}
    />
  );
}

function InputDark({
  value,
  onChange,
  placeholder,
  className = '',
  required = false,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  required?: boolean;
}) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      required={required}
      className={`rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder:text-stone-300 outline-none ring-white/20 focus:ring-4 ${className}`}
    />
  );
}

function Textarea({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`rounded-2xl border border-orange-100 bg-[#fffaf4] px-4 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4 ${className}`}
    />
  );
}

function TextareaDark({
  value,
  onChange,
  placeholder,
  className = '',
  rows = 3,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white placeholder:text-stone-300 outline-none ring-white/20 focus:ring-4 ${className}`}
    />
  );
}

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="relative">
      <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-2xl border border-orange-100 bg-[#fffaf4] px-10 py-3 text-sm font-semibold text-[#2a190f] outline-none ring-orange-200 focus:ring-4"
      >
        {children}
      </select>
    </div>
  );
}

function PriceLine({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-center justify-between py-1 ${strong ? 'text-base font-black text-[#2a190f]' : 'text-stone-600'}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.18em] text-stone-300">{label}</p>
      <p className="mt-1 text-sm font-bold text-white">{value}</p>
    </div>
  );
}

function BusinessChip({ text }: { text: string }) {
  return <span className="rounded-full border border-white/10 bg-white/8 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-stone-100">{text}</span>;
}

function HeroFallback({ name, loading, configured }: { name: string; loading?: boolean; configured?: boolean }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_30%,rgba(217,95,45,0.28),transparent_35%),linear-gradient(135deg,#fde9d6,#fff3e4,#dfefe9)]">
      <div className="rounded-full bg-white/85 px-6 py-4 text-center shadow-lg">
        <Utensils className="mx-auto h-8 w-8 text-[#c2410c]" />
        <p className="mt-2 max-w-[220px] text-sm font-black text-[#2a190f]">
          {loading ? 'Chargement...' : configured === false ? 'Catalogue non configuré' : name}
        </p>
      </div>
    </div>
  );
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="rounded-full px-4 py-2 text-sm font-black text-[#5a4334] transition hover:bg-white hover:text-[#2a190f]">
      {children}
    </a>
  );
}

function FooterBlock({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#c2410c]">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FooterLink({ label }: { label: string }) {
  return <p className="text-sm font-semibold text-stone-600">{label}</p>;
}

function StatusBanner({ status }: { status: SubmitStatus }) {
  if (status.kind === 'idle') return null;
  const tone =
    status.kind === 'success'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : status.kind === 'error'
        ? 'border-rose-200 bg-rose-50 text-rose-700'
        : 'border-orange-200 bg-orange-50 text-orange-800';
  return <p className={`mt-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${tone}`}>{status.message}</p>;
}

function upsertMeta(name: string, content: string) {
  const selector = `meta[name="${name}"]`;
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', name);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function formatPrice(value: number) {
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(value);
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
