import { useEffect, useMemo, useState } from 'react';
import { MapPin, ArrowRight, HelpCircle, FileText, Sparkles, ShoppingBag, Truck, Users, Zap, Store, CalendarDays, Building2, Phone, Clock3 } from 'lucide-react';
import { LocalProductCard } from '../components/LocalProductCard';
import { getFeaturedProducts, LocalProduct } from '../data/mockCatalog';
import { partnerProfiles, PartnerProfile } from '../data/partnerProfiles';
import { catalogService } from '../services/catalogService';

interface ClientHomePageProps {
  onSelectMode: (mode: 'customer' | 'pro', draftItems?: LocalProduct[]) => void;
  onShowGuide: () => void;
  onOpenDemo?: () => void;
  onShowLegal?: (page: 'legal' | 'privacy' | 'terms' | 'cgu') => void;
  demoMode?: boolean;
  liteMode?: boolean;
}

type VendorProfile = PartnerProfile;

export function ClientHomePage({ onSelectMode, onShowGuide, onOpenDemo, onShowLegal, demoMode = false, liteMode = false }: ClientHomePageProps) {
  const baseUrl = import.meta.env.BASE_URL || '/';
  const [draftRequest, setDraftRequest] = useState<LocalProduct[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customNeed, setCustomNeed] = useState('');
  const [customBudget, setCustomBudget] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'pilot' | 'outside'>('pilot');
  const [customerName, setCustomerName] = useState('');
  const [customerZone, setCustomerZone] = useState('');
  const [customerTime, setCustomerTime] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderTiming, setOrderTiming] = useState<'now' | 'asap' | 'scheduled'>('asap');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [orderNote, setOrderNote] = useState('');
  const [showByVendor, setShowByVendor] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [proCompany, setProCompany] = useState('');
  const [proContact, setProContact] = useState('');
  const [proPeople, setProPeople] = useState('');
  const [proDate, setProDate] = useState('');
  const [proTime, setProTime] = useState('');
  const [proLocation, setProLocation] = useState('');
  const [proBudget, setProBudget] = useState('');
  const [proFrequency, setProFrequency] = useState('');
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [geoLabel, setGeoLabel] = useState<string | null>(null);
  const [catalogProducts, setCatalogProducts] = useState<LocalProduct[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedVendor, setSelectedVendor] = useState('Tous');
  const [selectedZone, setSelectedZone] = useState('Toutes');
  const [sortBy, setSortBy] = useState<'default' | 'priceAsc' | 'priceDesc'>('default');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [selectedVendorMenu, setSelectedVendorMenu] = useState<string | null>(null);
  const [selectedVendorCategory, setSelectedVendorCategory] = useState<string>('Tous');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isBusinessCheckout, setIsBusinessCheckout] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [businessPeople, setBusinessPeople] = useState('');
  const featuredProducts = catalogProducts.length > 0 ? catalogProducts.slice(0, 6) : getFeaturedProducts();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
  const baseWhatsAppText = 'Bonjour, je souhaite commander sur DELIKREOL.';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(baseWhatsAppText)}`;

  const scrollToId = (id: string) => {
    if (typeof document === 'undefined') return;
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setCatalogLoading(true);
      setCatalogError(null);
      try {
        const items = await catalogService.listProducts();
        if (!mounted) return;
        const mapped = items.map((item) => ({
          id: item.id,
          name: item.name,
          vendor: item.vendor?.business_name ?? item.vendor_id,
          price: item.price,
          category: item.category ?? 'Divers',
          description: item.description ?? undefined,
          image: item.image_url ?? undefined,
          zone: (item as { zone?: string }).zone ?? undefined,
          available: item.is_available ?? true
        }));
        setCatalogProducts(mapped);
      } catch (err) {
        if (!mounted) return;
        setCatalogError('Catalogue indisponible pour le moment.');
      } finally {
        if (mounted) setCatalogLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const syncVendorFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const vendor = params.get('vendor');
      setSelectedVendor(vendor ?? 'Tous');
      setSelectedVendorMenu(vendor);
      setSelectedVendorCategory('Tous');
    };
    syncVendorFromUrl();
    window.addEventListener('popstate', syncVendorFromUrl);
    return () => window.removeEventListener('popstate', syncVendorFromUrl);
  }, []);

  const availableCategories = useMemo(() => {
    const list = Array.from(new Set(catalogProducts.map((p) => p.category || 'Divers')));
    return ['Tous', ...list];
  }, [catalogProducts]);

  const availableVendors = useMemo(() => {
    const list = Array.from(new Set(catalogProducts.map((p) => p.vendor || 'Vendeur local')));
    return ['Tous', ...list];
  }, [catalogProducts]);

  const vendorStats = useMemo(() => {
    const stats = new Map<string, number>();
    catalogProducts.forEach((product) => {
      const key = product.vendor || 'Vendeur local';
      stats.set(key, (stats.get(key) || 0) + 1);
    });
    return stats;
  }, [catalogProducts]);

  const availableZones = useMemo(() => {
    const list = Array.from(new Set(catalogProducts.map((p) => p.zone || 'Martinique')));
    return ['Toutes', ...list];
  }, [catalogProducts]);

  const filteredProducts = useMemo(() => {
    let items = [...(catalogProducts.length > 0 ? catalogProducts : getFeaturedProducts())];
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      items = items.filter((p) => `${p.name} ${p.vendor} ${p.category}`.toLowerCase().includes(q));
    }
    if (selectedCategory !== 'Tous') {
      items = items.filter((p) => p.category === selectedCategory);
    }
    if (selectedVendor !== 'Tous') {
      items = items.filter((p) => p.vendor === selectedVendor);
    }
    if (selectedZone !== 'Toutes') {
      items = items.filter((p) => (p.zone ?? 'Martinique') === selectedZone);
    }
    if (onlyAvailable) {
      items = items.filter((p) => p.available !== false);
    }
    if (sortBy === 'priceAsc') {
      items.sort((a, b) => a.price - b.price);
    }
    if (sortBy === 'priceDesc') {
      items.sort((a, b) => b.price - a.price);
    }
    return items;
  }, [catalogProducts, searchTerm, selectedCategory, selectedVendor, selectedZone, onlyAvailable, sortBy]);

  const productsByVendor = useMemo(() => {
    const groups = new Map<string, LocalProduct[]>();
    filteredProducts.forEach((product) => {
      const key = product.vendor || 'Vendeur local';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)?.push(product);
    });
    return Array.from(groups.entries());
  }, [filteredProducts]);

  const activeVendorProducts = useMemo(() => {
    if (!selectedVendorMenu) return [];
    return (catalogProducts.length > 0 ? catalogProducts : getFeaturedProducts()).filter(
      (product) => product.vendor === selectedVendorMenu
    );
  }, [catalogProducts, selectedVendorMenu]);

  const activeVendorCategories = useMemo(() => {
    if (activeVendorProducts.length === 0) return ['Tous'];
    return ['Tous', ...Array.from(new Set(activeVendorProducts.map((product) => product.category || 'Divers')))];
  }, [activeVendorProducts]);

  const visibleVendorProducts = useMemo(() => {
    if (selectedVendorCategory === 'Tous') return activeVendorProducts;
    return activeVendorProducts.filter((product) => product.category === selectedVendorCategory);
  }, [activeVendorProducts, selectedVendorCategory]);

  useEffect(() => {
    if (!selectedVendorMenu || selectedVendorCategory === 'Tous') return;
    if (!activeVendorCategories.includes(selectedVendorCategory)) {
      setSelectedVendorCategory('Tous');
    }
  }, [activeVendorCategories, selectedVendorCategory, selectedVendorMenu]);

  const matchesCategory = (product: LocalProduct, keywords: string[]) => {
    const hay = `${product.category}`.toLowerCase();
    return keywords.some((word) => hay.includes(word));
  };

  const quickOffers = [
    {
      id: 'dej-crew',
      title: 'Dejeuner express',
      description: 'Repas creole pour 2 a 4 personnes sur Fort-de-France ou Lamentin.',
      products: featuredProducts.filter((product) => matchesCategory(product, ['plat', 'repas', 'menu'])),
    },
    {
      id: 'panier-local',
      title: 'Panier local',
      description: 'Fruits, douceurs et produits signatures pour offrir ou découvrir.',
      products: featuredProducts.filter((product) => matchesCategory(product, ['panier', 'epicerie', 'boisson', 'fruit'])),
    },
    {
      id: 'demande-libre',
      title: 'Besoin sur mesure',
      description: 'Dites-nous ce que vous voulez, on confirme rapidement par WhatsApp.',
      products: [],
    },
  ];

  const howItWorks = [
    {
      icon: ShoppingBag,
      title: 'Je choisis',
      description: 'Je selectionne un repas, un panier ou une demande simple.',
    },
    {
      icon: Users,
      title: 'Je commande',
      description: 'Je confirme ma commande, en quelques secondes.',
    },
    {
      icon: Truck,
      title: 'On me confirme rapidement',
      description: 'Un partenaire local valide par WhatsApp et on organise.',
    },
  ];

  const vendorProfiles = useMemo(() => {
    const profiles = new Map<string, VendorProfile>();
    partnerProfiles.forEach((partner) => {
      profiles.set(partner.name, partner);
    });
    return profiles;
  }, []);

  const activeVendorProfile = useMemo(() => {
    if (!selectedVendorMenu) return null;
    return (
      vendorProfiles.get(selectedVendorMenu) ?? {
        name: selectedVendorMenu,
        zone: selectedZone !== 'Toutes' ? selectedZone : 'Martinique',
        offer: 'Selection locale',
        type: 'Partenaire local',
        availability: 'Confirmation manuelle',
        story: 'Partenaire local visible dans DELIKREOL Lite.',
        promise: 'Offre locale, confirmation rapide',
        eta: 'Delai indicatif selon la demande',
        specialty: 'Menu local selon disponibilite',
        highlights: ['Confirmation manuelle'],
        planifiable: true,
        enterprise: false
      }
    );
  }, [selectedVendorMenu, vendorProfiles, selectedZone]);

  useEffect(() => {
    if (!selectedVendorMenu) return;
    const vendorExists =
      activeVendorProducts.length > 0 || vendorProfiles.has(selectedVendorMenu);
    if (vendorExists) return;
    closeVendorMenu();
  }, [activeVendorProducts.length, selectedVendorMenu, vendorProfiles]);

  const handleAddToRequest = (product: LocalProduct) => {
    setDraftRequest(prev => [...prev, product]);
  };

  const handleRemoveFromDraft = (productId: string) => {
    setDraftRequest((prev) => {
      const index = prev.findIndex((item) => item.id === productId);
      if (index === -1) return prev;
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const openCart = () => {
    if (draftRequest.length === 0) {
      scrollToId(selectedVendorMenu ? 'vendor-menu' : 'catalogue');
      return;
    }
    setShowCart(true);
  };

  const handleStartOrder = () => {
    if (liteMode) {
      openCart();
      return;
    }
    onSelectMode('customer', draftRequest);
  };

  const handleQuickOffer = (products: LocalProduct[]) => {
    setDraftRequest(products);
    if (liteMode) {
      setShowCart(true);
      return;
    }
    onSelectMode('customer', products);
  };

  const openVendorMenu = (vendorName: string) => {
    setSelectedVendor(vendorName);
    setSelectedVendorMenu(vendorName);
    setSelectedVendorCategory('Tous');
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.set('vendor', vendorName);
      const next = `${window.location.pathname}?${params.toString()}`;
      window.history.replaceState({}, '', next);
      window.setTimeout(() => {
        document.getElementById('vendor-menu')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const closeVendorMenu = () => {
    setSelectedVendorMenu(null);
    setSelectedVendor('Tous');
    setSelectedVendorCategory('Tous');
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      params.delete('vendor');
      const search = params.toString();
      const next = `${window.location.pathname}${search ? `?${search}` : ''}`;
      window.history.replaceState({}, '', next);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('delikreol_cart');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as LocalProduct[];
        if (Array.isArray(parsed)) setDraftRequest(parsed);
      } catch {
        // ignore invalid cache
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('delikreol_cart', JSON.stringify(draftRequest));
  }, [draftRequest]);

  useEffect(() => {
    if (draftRequest.length === 0 && showCart) {
      setShowCart(false);
    }
  }, [draftRequest.length, showCart]);

  const cartSummary = useMemo(() => {
    const subtotal = draftRequest.reduce((sum, item) => sum + item.price, 0);
    let deliveryFee = 0;
    if (draftRequest.length > 0 && deliveryMode === 'pilot') deliveryFee = 2.5;
    const total = subtotal + deliveryFee;
    return { subtotal, deliveryFee, total };
  }, [draftRequest, deliveryMode]);

  const sanitizeInput = (value: string, maxLength: number) => {
    const cleaned = value
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[<>]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (cleaned.length > maxLength) return cleaned.slice(0, maxLength);
    return cleaned;
  };

  const parsePeopleCount = (value: string) => {
    const numeric = value.replace(/[^\d]/g, '');
    if (!numeric) return Number.NaN;
    return Number.parseInt(numeric, 10);
  };

  const checkoutValidation = useMemo(() => {
    const name = sanitizeInput(customerName, 60);
    const phone = sanitizeInput(customerPhone, 20);
    const zone = sanitizeInput(customerZone, 60);
    const address = sanitizeInput(customerAddress, 120);
    const time = sanitizeInput(customerTime, 60);
    const note = sanitizeInput(orderNote, 240);
    const scheduledDateSafe = sanitizeInput(scheduledDate, 10);
    const scheduledTimeSafe = sanitizeInput(scheduledTime, 10);
    const businessNameSafe = sanitizeInput(businessName, 80);
    const peopleCount = parsePeopleCount(businessPeople);

    const phonePattern = /^[+()\d\s.-]{6,20}$/;
    const nameOk = name.length >= 2;
    const requiresPhone = deliveryMode !== 'pickup' || isBusinessCheckout;
    const phoneOk = !requiresPhone ? (!phone || phonePattern.test(phone)) : phonePattern.test(phone);
    const addressOk = deliveryMode === 'pickup' ? true : address.length >= 5;
    const scheduleOk =
      orderTiming !== 'scheduled' ? true : Boolean(scheduledDateSafe && scheduledTimeSafe);
    const businessOk = !isBusinessCheckout
      ? true
      : businessNameSafe.length >= 2 && Number.isFinite(peopleCount) && peopleCount > 0;
    const noteOk = note.length <= 240;

    return {
      sanitized: {
        name,
        phone,
        zone,
        address,
        time,
        note,
        scheduledDate: scheduledDateSafe,
        scheduledTime: scheduledTimeSafe,
        businessName: businessNameSafe,
        businessPeople: Number.isFinite(peopleCount) ? peopleCount : null
      },
      errors: {
        name: nameOk ? null : 'Nom requis (2 caracteres min).',
        phone: phoneOk ? null : 'Telephone invalide.',
        address: addressOk ? null : 'Adresse requise pour la livraison.',
        schedule: scheduleOk ? null : 'Date et heure requises pour une commande planifiee.',
        business: businessOk ? null : 'Nom entreprise et nombre de personnes requis.',
        note: noteOk ? null : 'Note trop longue (240 caracteres max).'
      },
      isValid: nameOk && phoneOk && addressOk && scheduleOk && businessOk && noteOk
    };
  }, [
    businessName,
    businessPeople,
    customerAddress,
    customerName,
    customerPhone,
    customerTime,
    customerZone,
    deliveryMode,
    isBusinessCheckout,
    orderNote,
    orderTiming,
    scheduledDate,
    scheduledTime
  ]);

  const canSubmitCheckout = draftRequest.length > 0 && checkoutValidation.isValid;

  const cartWhatsAppLink = useMemo(() => {
    if (draftRequest.length === 0 || !canSubmitCheckout) return whatsappLink;
    const sanitized = checkoutValidation.sanitized;
    const lines = draftRequest.map((item) => `- ${item.name} (${item.vendor}) ${item.price.toFixed(2)} €`);
    const vendors = Array.from(new Set(draftRequest.map((item) => item.vendor)));
    const modeLabel =
      deliveryMode === 'pickup'
        ? 'Retrait'
        : deliveryMode === 'pilot'
        ? 'Livraison zone pilote'
        : 'Hors zone (confirmation)';
    const contactLines = [
      sanitized.name ? `Nom: ${sanitized.name}` : null,
      sanitized.phone ? `Telephone: ${sanitized.phone}` : null,
      sanitized.zone ? `Zone: ${sanitized.zone}` : null,
      sanitized.address ? `Adresse: ${sanitized.address}` : null,
    ].filter(Boolean);
    const planningLines = [
      `Type: ${orderTiming === 'now' ? 'Commande maintenant' : orderTiming === 'asap' ? 'Des que possible' : 'Planifiee'}`,
      orderTiming === 'scheduled' && sanitized.scheduledDate
        ? `Date souhaitee: ${sanitized.scheduledDate}`
        : null,
      orderTiming === 'scheduled' && sanitized.scheduledTime
        ? `Heure souhaitee: ${sanitized.scheduledTime}`
        : null,
      sanitized.time ? `Repere horaire libre: ${sanitized.time}` : null,
      sanitized.note ? `Note: ${sanitized.note}` : null,
    ].filter(Boolean);
    const businessLines = isBusinessCheckout
      ? [
          'Type client: Entreprise',
          sanitized.businessName ? `Entreprise: ${sanitized.businessName}` : null,
          sanitized.businessPeople ? `Personnes: ${sanitized.businessPeople}` : null,
        ].filter(Boolean)
      : ['Type client: Particulier'];
    const text = `${baseWhatsAppText}\n\nVendeur(s): ${vendors.join(', ')}\n\nMa selection :\n${lines.join('\n')}\n\nMode: ${modeLabel}\nTotal estimatif : ${cartSummary.total.toFixed(2)} €${contactLines.length ? `\n\nInfos:\n${contactLines.join('\n')}` : ''}`;
    const fullText = `${text}${planningLines.length ? `\n\nPlanning:\n${planningLines.join('\n')}` : ''}\n\n${businessLines.join('\n')}\n\nCreaneau souhaite soumis a confirmation.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fullText)}`;
  }, [
    draftRequest,
    whatsappLink,
    whatsappNumber,
    cartSummary.total,
    deliveryMode,
    orderTiming,
    isBusinessCheckout,
    canSubmitCheckout,
    checkoutValidation.sanitized
  ]);

  const proWhatsAppLink = useMemo(() => {
    const sanitize = (value: string, max = 120) =>
      value.replace(/[<>]/g, '').trim().slice(0, max);
    const company = sanitize(proCompany, 80);
    const contact = sanitize(proContact, 80);
    const people = sanitize(proPeople, 20);
    const date = sanitize(proDate, 24);
    const time = sanitize(proTime, 16);
    const location = sanitize(proLocation, 80);
    const budget = sanitize(proBudget, 40);
    const frequency = sanitize(proFrequency, 40);
    const lines = [
      'Type: Devis entreprise',
      company ? `Entreprise: ${company}` : null,
      contact ? `Contact: ${contact}` : null,
      people ? `Nombre de personnes: ${people}` : null,
      date ? `Date souhaitee: ${date}` : null,
      time ? `Heure souhaitee: ${time}` : null,
      location ? `Lieu: ${location}` : null,
      budget ? `Budget indicatif: ${budget}` : null,
      frequency ? `Frequence: ${frequency}` : null,
    ].filter(Boolean);
    const text = `Bonjour, je souhaite un devis entreprise sur DELIKREOL.\n\n${lines.join('\n')}\n\nTarif entreprise selon volume, zone, delai et composition.\nCreaneau souhaite soumis a confirmation.`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }, [proCompany, proContact, proPeople, proDate, proTime, proLocation, proBudget, proFrequency, whatsappNumber]);

  const handleLocate = () => {
    if (!('geolocation' in navigator)) {
      setGeoStatus('error');
      setGeoLabel("Géolocalisation indisponible sur cet appareil.");
      return;
    }
    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGeoStatus('ok');
        setGeoLabel(`Position détectée: ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
      },
      () => {
        setGeoStatus('error');
        setGeoLabel("Position non autorisée. Activez la géolocalisation.");
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1114] via-[#12151a] to-[#141a15]">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${baseUrl}branding/logo-mark.svg`}
              alt="DELIKREOL"
              className="h-10 w-10"
            />
            <img
              src={`${baseUrl}branding/logo-wordmark-premium.svg`}
              alt="DELIKREOL"
              className="h-10 hidden md:block"
            />
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-200">
            <a href={`${baseUrl}#commander`} className="hover:text-emerald-300">Commander</a>
            <a href={`${baseUrl}#planifier`} className="hover:text-emerald-300">Planifier</a>
            <a href={`${baseUrl}#entreprise`} className="hover:text-emerald-300">Entreprise</a>
            <a href={`${baseUrl}#partenaires`} className="hover:text-emerald-300">Partenaires</a>
            <a href={`${baseUrl}?order-status=1`} className="hover:text-emerald-300">Suivi</a>
          </nav>
          <div className="flex items-center gap-3">
            <a
              href={whatsappLink}
              className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500 text-slate-950 font-semibold"
            >
              WhatsApp
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={() => setShowMobileNav((prev) => !prev)}
              className="md:hidden px-3 py-2 rounded-full border border-slate-700 text-slate-200"
            >
              Menu
            </button>
          </div>
        </div>
        {showMobileNav && (
          <div className="md:hidden border-t border-slate-800 px-4 py-3 flex flex-col gap-3 text-sm text-slate-200">
            <a href={`${baseUrl}#commander`} className="hover:text-emerald-300">Commander</a>
            <a href={`${baseUrl}#planifier`} className="hover:text-emerald-300">Planifier</a>
            <a href={`${baseUrl}#entreprise`} className="hover:text-emerald-300">Entreprise</a>
            <a href={`${baseUrl}#partenaires`} className="hover:text-emerald-300">Partenaires</a>
            <a href={`${baseUrl}?order-status=1`} className="hover:text-emerald-300">Suivi</a>
            <a href={whatsappLink} className="inline-flex items-center gap-2 text-emerald-300">
              WhatsApp direct
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        )}
      </header>

      {/* Draft Request Badge */}
      {draftRequest.length > 0 && (
        <div className="fixed bottom-24 right-4 md:bottom-6 md:right-6 z-50">
          <button
            onClick={openCart}
            aria-label="Ouvrir le checkout"
            className="flex items-center gap-3 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl transition-colors font-semibold"
          >
            <ShoppingBag className="w-6 h-6" />
            <div className="text-left">
              <div className="text-sm">Ma sélection</div>
              <div className="text-xs opacity-80">{draftRequest.length} produit(s)</div>
            </div>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {showCart && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur"
          role="dialog"
          aria-modal="true"
          aria-labelledby="lite-checkout-title"
        >
          <div className="w-full sm:max-w-5xl bg-slate-950 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300">Checkout local</p>
                <h3 id="lite-checkout-title" className="mt-2 text-2xl font-bold text-slate-50">Valider ma commande</h3>
                <p className="mt-2 text-sm text-slate-400">Prix et disponibilite confirmes avant finalisation. Support WhatsApp inclus.</p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Fermer
              </button>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
              <div className="space-y-5">
                <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <ShoppingBag className="w-4 h-4 text-emerald-300" />
                    1. Produits
                  </div>
                  <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
                    {draftRequest.map((item) => (
                      <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-950/50 px-4 py-3">
                        <div>
                          <div className="text-sm font-semibold text-slate-100">{item.name}</div>
                          <div className="text-xs text-slate-400">{item.vendor}</div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-black text-emerald-300">{item.price.toFixed(2)} €</div>
                          <button
                            onClick={() => handleRemoveFromDraft(item.id)}
                            className="text-xs text-slate-400 hover:text-slate-200"
                          >
                            Retirer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <Truck className="w-4 h-4 text-emerald-300" />
                    2. Retrait ou livraison
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                    <button
                      onClick={() => setDeliveryMode('pickup')}
                      className={`rounded-2xl border px-4 py-4 text-left ${deliveryMode === 'pickup' ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-slate-800 bg-slate-950/40 text-slate-300'}`}
                    >
                      <div className="font-semibold">Retrait</div>
                      <div className="mt-1 text-xs">0 €</div>
                    </button>
                    <button
                      onClick={() => setDeliveryMode('pilot')}
                      className={`rounded-2xl border px-4 py-4 text-left ${deliveryMode === 'pilot' ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-slate-800 bg-slate-950/40 text-slate-300'}`}
                    >
                      <div className="font-semibold">Livraison pilote</div>
                      <div className="mt-1 text-xs">Forfait 2,50 €</div>
                    </button>
                    <button
                      onClick={() => setDeliveryMode('outside')}
                      className={`rounded-2xl border px-4 py-4 text-left ${deliveryMode === 'outside' ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-slate-800 bg-slate-950/40 text-slate-300'}`}
                    >
                      <div className="font-semibold">Hors zone</div>
                      <div className="mt-1 text-xs">Confirmation manuelle</div>
                    </button>
                  </div>
                  <p className="mt-3 text-xs text-slate-400">Zones desservies: Fort-de-France, Lamentin, Schoelcher.</p>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <CalendarDays className="w-4 h-4 text-emerald-300" />
                    3. Quand veux-tu etre servi ?
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3 text-sm">
                    <button
                      onClick={() => setOrderTiming('now')}
                      className={`rounded-2xl border px-4 py-4 text-left ${orderTiming === 'now' ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-slate-800 bg-slate-950/40 text-slate-300'}`}
                    >
                      <div className="font-semibold">Maintenant</div>
                      <div className="mt-1 text-xs">Confirmation rapide</div>
                    </button>
                    <button
                      onClick={() => setOrderTiming('asap')}
                      className={`rounded-2xl border px-4 py-4 text-left ${orderTiming === 'asap' ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-slate-800 bg-slate-950/40 text-slate-300'}`}
                    >
                      <div className="font-semibold">Des que possible</div>
                      <div className="mt-1 text-xs">Au plus tot selon la charge</div>
                    </button>
                    <button
                      onClick={() => setOrderTiming('scheduled')}
                      className={`rounded-2xl border px-4 py-4 text-left ${orderTiming === 'scheduled' ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-slate-800 bg-slate-950/40 text-slate-300'}`}
                    >
                      <div className="font-semibold">Planifier</div>
                      <div className="mt-1 text-xs">Aujourd'hui ou demain</div>
                    </button>
                  </div>
                  {orderTiming === 'scheduled' && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(event) => setScheduledDate(event.target.value)}
                        className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
                      />
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(event) => setScheduledTime(event.target.value)}
                        className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
                      />
                    </div>
                  )}
                  <div className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/50 px-4 py-3 text-xs text-slate-400">
                    Créneau souhaité soumis à confirmation.
                  </div>
                  {checkoutValidation.errors.schedule && (
                    <p className="mt-2 text-xs text-red-400">{checkoutValidation.errors.schedule}</p>
                  )}
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <Phone className="w-4 h-4 text-emerald-300" />
                    4. Coordonnees
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <input
                      value={customerName}
                      onChange={(event) => setCustomerName(event.target.value)}
                      placeholder="Nom"
                      className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
                    />
                    <input
                      value={customerPhone}
                      onChange={(event) => setCustomerPhone(event.target.value)}
                      placeholder="Telephone"
                      className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
                    />
                    <input
                      value={customerZone}
                      onChange={(event) => setCustomerZone(event.target.value)}
                      placeholder="Zone / Quartier"
                      className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
                    />
                    <input
                      value={customerTime}
                      onChange={(event) => setCustomerTime(event.target.value)}
                      placeholder="Repere horaire libre"
                      className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
                    />
                    <input
                      value={customerAddress}
                      onChange={(event) => setCustomerAddress(event.target.value)}
                      placeholder="Adresse ou point de retrait"
                      className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 sm:col-span-2"
                    />
                  </div>
                  {(checkoutValidation.errors.name ||
                    checkoutValidation.errors.phone ||
                    checkoutValidation.errors.address ||
                    checkoutValidation.errors.note) && (
                    <div className="mt-3 text-xs text-red-400 space-y-1">
                      {checkoutValidation.errors.name && <p>{checkoutValidation.errors.name}</p>}
                      {checkoutValidation.errors.phone && <p>{checkoutValidation.errors.phone}</p>}
                      {checkoutValidation.errors.address && <p>{checkoutValidation.errors.address}</p>}
                      {checkoutValidation.errors.note && <p>{checkoutValidation.errors.note}</p>}
                    </div>
                  )}
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                    <Building2 className="w-4 h-4 text-emerald-300" />
                    5. Particulier ou entreprise
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                    <button
                      onClick={() => setIsBusinessCheckout(false)}
                      className={`rounded-2xl border px-4 py-4 text-left ${!isBusinessCheckout ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-slate-800 bg-slate-950/40 text-slate-300'}`}
                    >
                      <div className="font-semibold">Commande particulier</div>
                      <div className="mt-1 text-xs">Usage personnel ou familial</div>
                    </button>
                    <button
                      onClick={() => setIsBusinessCheckout(true)}
                      className={`rounded-2xl border px-4 py-4 text-left ${isBusinessCheckout ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200' : 'border-slate-800 bg-slate-950/40 text-slate-300'}`}
                    >
                      <div className="font-semibold">Commande entreprise</div>
                      <div className="mt-1 text-xs">Equipe, reunion, evenement</div>
                    </button>
                  </div>
                  {isBusinessCheckout && (
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <input
                        value={businessName}
                        onChange={(event) => setBusinessName(event.target.value)}
                        placeholder="Nom entreprise"
                        className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
                      />
                      <input
                        value={businessPeople}
                        onChange={(event) => setBusinessPeople(event.target.value)}
                        placeholder="Nombre de personnes"
                        className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
                      />
                    </div>
                  )}
                  <textarea
                    value={orderNote}
                    onChange={(event) => setOrderNote(event.target.value)}
                    placeholder="Note speciale, allergie, consigne d'acces..."
                    className="mt-4 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
                    rows={3}
                  />
                  {checkoutValidation.errors.business && (
                    <p className="mt-2 text-xs text-red-400">{checkoutValidation.errors.business}</p>
                  )}
                </section>
              </div>

              <aside className="space-y-5">
                <section className="rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-5">
                  <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">Recapitulatif</div>
                  <div className="mt-4 space-y-3 text-sm text-slate-200">
                    <div className="flex justify-between">
                      <span>Sous-total</span>
                      <span>{cartSummary.subtotal.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Frais indicatifs</span>
                      <span>{cartSummary.deliveryFee.toFixed(2)} €</span>
                    </div>
                    <div className="flex justify-between text-base font-black text-emerald-300">
                      <span>Total estimatif</span>
                      <span>{cartSummary.total.toFixed(2)} €</span>
                    </div>
                  </div>
                  <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/50 p-4 text-xs text-slate-400">
                    Disponibilite, frais et creneau confirmes avant validation finale.
                  </div>
                  <a
                    href={canSubmitCheckout ? cartWhatsAppLink : undefined}
                    aria-disabled={!canSubmitCheckout}
                    tabIndex={canSubmitCheckout ? 0 : -1}
                    className={`mt-5 inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 font-bold text-slate-950 ${canSubmitCheckout ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-emerald-500/50 cursor-not-allowed pointer-events-none'}`}
                  >
                    Valider sur WhatsApp
                  </a>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-3 inline-flex w-full items-center justify-center rounded-2xl border border-slate-700 px-5 py-4 font-semibold text-slate-100"
                  >
                    Retour au menu
                  </button>
                </section>

                <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
                  <div className="text-sm font-semibold text-slate-100">Infos pratiques</div>
                  <div className="mt-4 space-y-3 text-sm text-slate-300">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                      <div className="font-semibold text-slate-100">Livraison / retrait</div>
                      <div className="mt-1 text-xs text-slate-400">Retrait 0 €, livraison pilote 2,50 €, hors zone sur confirmation.</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                      <div className="font-semibold text-slate-100">Planification</div>
                      <div className="mt-1 text-xs text-slate-400">Commande immediate, ASAP, plus tard aujourd'hui ou demain.</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
                      <div className="font-semibold text-slate-100">Support</div>
                      <div className="mt-1 text-xs text-slate-400">WhatsApp central DELIKREOL pour confirmation, rupture ou ajustement.</div>
                    </div>
                  </div>
                </section>
              </aside>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div id="commander" className="text-center mb-12">
          {demoMode && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 mb-6">
              <Sparkles className="w-4 h-4" />
              Pilote local: commandes possibles
            </div>
          )}
          <div className="flex flex-col items-center gap-5 mb-8">
            <img
              src={`${baseUrl}branding/logo-wordmark-premium.svg`}
              alt="DELIKREOL"
              className="h-12 md:h-14"
            />
            <div className="madras-strip w-24 rounded-full" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-slate-50 mb-4">
            Repas créoles, menus locaux et commandes planifiées en Martinique
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-4">
            Livraison, retrait, devis entreprise et confirmation rapide par WhatsApp.
          </p>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto">
            Zones pilotes : Fort-de-France, Lamentin, Schoelcher. Créneau souhaité soumis à confirmation.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleStartOrder}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-bold text-slate-950 transition-colors hover:bg-emerald-600"
            >
              Commander maintenant
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => {
                document.getElementById('planifier')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-600/60 bg-slate-900/40 px-8 py-4 text-lg font-bold text-slate-100 transition-colors hover:border-emerald-400/60"
            >
              Planifier une commande
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </button>
            <button
              onClick={() => {
                document.getElementById('entreprise')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-orange-500/50 bg-orange-500/10 px-8 py-4 text-lg font-bold text-orange-200 transition-colors hover:border-orange-400"
            >
              Devis entreprise
              <MapPin className="w-5 h-5" />
            </button>
          </div>
          <div className="mt-5 flex flex-col items-center gap-2 text-sm text-slate-300">
            <button
              onClick={handleLocate}
              className="rounded-full border border-emerald-400/40 px-4 py-2 font-semibold text-emerald-200 hover:border-emerald-300 transition-colors"
            >
              Vérifier ma zone
            </button>
            {geoStatus !== 'idle' && (
              <span className={geoStatus === 'ok' ? 'text-emerald-200' : 'text-amber-200'}>
                {geoLabel}
              </span>
            )}
          </div>
          <div className="mt-6 text-sm text-emerald-200 font-semibold">
            WhatsApp direct : réponse rapide
            <a href={whatsappLink} className="ml-2 text-emerald-300 underline underline-offset-4">
              {whatsappNumber}
            </a>
          </div>
        </div>

        <section className="mb-14" id="planifier">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-5 text-sm text-slate-200">
              <div className="font-semibold text-emerald-200 mb-1">Confirmation humaine</div>
              Prix et dispo valides avant finalisation.
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-200">
              <div className="font-semibold text-slate-100 mb-1">Commande planifiable</div>
              Choisis un creneau, confirme ensuite.
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-200">
              <div className="font-semibold text-slate-100 mb-1">Support WhatsApp</div>
              Reponse rapide et suivi manuel clair.
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-200">
              <div className="font-semibold text-slate-100 mb-1">Partenaires locaux</div>
              Vendeurs pilotes et offre locale.
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-200">
              <div className="font-semibold text-slate-100 mb-1">Zones pilotes</div>
              Fort-de-France · Lamentin · Schoelcher
            </div>
          </div>
        </section>

        {availableVendors.length > 1 && (
          <section className="mb-14">
            <div className="mb-6 flex items-center gap-3">
              <Users className="w-6 h-6 text-emerald-400" />
              <h2 className="text-3xl font-bold text-slate-50">Vendeurs pilotes</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {availableVendors.filter((vendor) => vendor !== 'Tous').map((vendor) => {
                const profile = vendorProfiles.get(vendor);
                return (
                <button
                  key={vendor}
                  onClick={() => openVendorMenu(vendor)}
                  className="text-left rounded-3xl border border-slate-800 bg-slate-900/60 p-6 hover:border-emerald-400/60 transition-colors"
                >
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Vendeur</div>
                  <div className="mt-2 text-xl font-bold text-slate-50">{vendor}</div>
                  <div className="mt-2 text-sm text-slate-300">
                    {profile?.specialty ?? 'Cuisine locale et selection du jour'}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                    <span className="rounded-full border border-slate-700 px-2 py-1">{profile?.zone ?? 'Martinique'}</span>
                    <span className="rounded-full border border-slate-700 px-2 py-1">{profile?.availability ?? 'Confirmation rapide'}</span>
                    {profile?.planifiable && <span className="rounded-full border border-emerald-500/40 px-2 py-1 text-emerald-300">Planifiable</span>}
                    {profile?.enterprise && <span className="rounded-full border border-amber-500/40 px-2 py-1 text-amber-300">Entreprise</span>}
                  </div>
                  <div className="mt-4 text-sm font-semibold text-emerald-300">Voir le menu</div>
                </button>
              )})}
            </div>
          </section>
        )}

        {selectedVendorMenu && activeVendorProfile && (
          <section id="vendor-menu" className="mb-16 scroll-mt-28">
            <div className="rounded-[2rem] border border-slate-800 bg-slate-950/60 overflow-hidden">
              <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="p-8">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.2em] text-emerald-300">
                    <span>{activeVendorProfile.zone}</span>
                    <span>{activeVendorProfile.type}</span>
                    <span>{activeVendorProfile.availability}</span>
                    {activeVendorProfile.planifiable && <span>Planifiable</span>}
                    {activeVendorProfile.enterprise && <span>Entreprise</span>}
                  </div>
                  <h2 className="mt-4 text-4xl font-bold text-slate-50">{activeVendorProfile.name}</h2>
                  <p className="mt-3 text-lg text-slate-300">{activeVendorProfile.offer}</p>
                  <p className="mt-2 text-sm text-emerald-200">{activeVendorProfile.specialty}</p>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-400">{activeVendorProfile.story}</p>
                  <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                    {activeVendorProfile.highlights.map((tag) => (
                      <span key={tag} className="rounded-full border border-slate-700 px-2 py-1">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Promesse</div>
                      <div className="mt-2 text-sm font-semibold text-slate-100">{activeVendorProfile.promise}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Delai indicatif</div>
                      <div className="mt-2 text-sm font-semibold text-slate-100">{activeVendorProfile.eta}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Specialite</div>
                      <div className="mt-2 text-sm font-semibold text-slate-100">{activeVendorProfile.specialty}</div>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Confirmation</div>
                      <div className="mt-2 text-sm font-semibold text-slate-100">Commande confirmee par WhatsApp</div>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      onClick={openCart}
                      className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-5 py-3 font-bold text-slate-950"
                    >
                      {draftRequest.length > 0 ? `Valider chez ${activeVendorProfile.name}` : `Voir le menu de ${activeVendorProfile.name}`}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={closeVendorMenu}
                      className="inline-flex items-center gap-2 rounded-2xl border border-slate-700 px-5 py-3 font-semibold text-slate-200"
                    >
                      Revenir au catalogue
                    </button>
                  </div>
                </div>
                <div className="p-8 bg-gradient-to-br from-emerald-500/10 to-orange-500/10 border-l border-slate-800">
                  <div className="grid gap-4">
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                        <Store className="w-4 h-4 text-emerald-300" />
                        Vrai partenaire local
                      </div>
                      <p className="mt-2 text-sm text-slate-400">Menu separe, offre lisible, commande humaine et locale.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                        <Clock3 className="w-4 h-4 text-emerald-300" />
                        Planifiable
                      </div>
                      <p className="mt-2 text-sm text-slate-400">Commande maintenant, des que possible ou a un creneau souhaite.</p>
                    </div>
                    <div className="rounded-2xl border border-slate-800 bg-slate-950/50 p-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-slate-100">
                        <MapPin className="w-4 h-4 text-emerald-300" />
                        Zone couverte
                      </div>
                      <p className="mt-2 text-sm text-slate-400">{activeVendorProfile.zone} et zones pilotes selon confirmation.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-800 p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-50">Menu de {activeVendorProfile.name}</h3>
                    <p className="mt-1 text-sm text-slate-400">Choisis une categorie puis ajoute directement au panier.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeVendorCategories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedVendorCategory(category)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                          selectedVendorCategory === category
                            ? 'bg-emerald-500 text-slate-950'
                            : 'border border-slate-700 text-slate-300'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                  {visibleVendorProducts.map((product) => (
                    <LocalProductCard
                      key={product.id}
                      product={product}
                      onAddToRequest={handleAddToRequest}
                    />
                  ))}
                </div>
                {visibleVendorProducts.length === 0 && (
                  <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-300">
                    Aucun produit disponible dans cette categorie pour le moment.
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        <section id="catalogue" className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Choix par usage</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6">
            Choisis ton usage principal: rapide, famille, planifie ou entreprise.
          </p>
          <div className="grid gap-6 lg:grid-cols-3">
            {quickOffers.map((offer) => (
              <div key={offer.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-200">Populaire</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-50">{offer.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{offer.description}</p>
                {offer.products.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {offer.products.map((product) => (
                      <div key={product.id} className="flex items-center justify-between rounded-2xl bg-slate-950/70 px-4 py-3 text-sm">
                        <span className="font-semibold text-slate-200">{product.name}</span>
                        <span className="font-black text-emerald-300">{product.price.toFixed(2)} €</span>
                      </div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => handleQuickOffer(offer.products)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-slate-950 transition-colors hover:bg-emerald-600"
                >
                  {offer.products.length > 0 ? 'Commander cette selection' : 'Decrire mon besoin'}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
          {catalogLoading && (
            <p className="mt-4 text-sm text-slate-400">Chargement du catalogue...</p>
          )}
          {catalogError && (
            <p className="mt-4 text-sm text-amber-300">{catalogError}</p>
          )}
        </section>

        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Besoin sur mesure</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6">
            Dites-nous ce que vous cherchez : on vous repond rapidement par WhatsApp.
          </p>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">Votre besoin</label>
              <textarea
                value={customNeed}
                onChange={(event) => setCustomNeed(event.target.value)}
                placeholder="Ex: 3 repas creoles + dessert, livraison ce soir"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
                rows={4}
              />
              <label className="mt-4 block text-xs font-semibold uppercase tracking-wider text-slate-400">Budget indicatif (optionnel)</label>
              <input
                value={customBudget}
                onChange={(event) => setCustomBudget(event.target.value)}
                placeholder="Ex: 25€ / personne"
                className="mt-2 w-full rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              />
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Bonjour, voici ma demande sur mesure : ${customNeed || '...'}${customBudget ? ` | Budget: ${customBudget}` : ''}`)}`}
                className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-slate-950 hover:bg-emerald-600"
              >
                Envoyer ma demande
              </a>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
              <div className="font-semibold text-slate-100 mb-3">Ce que vous recevez</div>
              <ul className="space-y-2">
                <li>✅ Confirmation rapide par WhatsApp</li>
                <li>✅ Proposition de partenaire local</li>
                <li>✅ Prix clair avant validation</li>
                <li>✅ Zones pilotes Fort-de-France / Lamentin / Schoelcher</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="mb-16" id="entreprise">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Commande entreprise</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6">
            Repas d'equipe, reunions, evenements, commandes recurrentes. Devis rapide par WhatsApp.
          </p>
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2 text-xs uppercase tracking-[0.2em] text-slate-400">Brief express</div>
              <input
                value={proCompany}
                onChange={(event) => setProCompany(event.target.value)}
                placeholder="Entreprise / Organisation"
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              />
              <input
                value={proContact}
                onChange={(event) => setProContact(event.target.value)}
                placeholder="Contact (nom + tel)"
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              />
              <input
                value={proPeople}
                onChange={(event) => setProPeople(event.target.value)}
                placeholder="Nombre de personnes"
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              />
              <input
                type="date"
                value={proDate}
                onChange={(event) => setProDate(event.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              />
              <input
                type="time"
                value={proTime}
                onChange={(event) => setProTime(event.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              />
              <input
                value={proLocation}
                onChange={(event) => setProLocation(event.target.value)}
                placeholder="Lieu / Zone"
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              />
              <input
                value={proBudget}
                onChange={(event) => setProBudget(event.target.value)}
                placeholder="Budget indicatif"
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              />
              <input
                value={proFrequency}
                onChange={(event) => setProFrequency(event.target.value)}
                placeholder="Frequence (ponctuel / hebdo / mensuel)"
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 sm:col-span-2"
              />
              <a
                href={proWhatsAppLink}
                className="sm:col-span-2 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-slate-950 hover:bg-emerald-600"
              >
                Demander un devis entreprise
              </a>
              <p className="sm:col-span-2 text-xs text-slate-400">
                Confirmation et tarif final par WhatsApp. Creaneau souhaite soumis a confirmation.
              </p>
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6 text-sm text-slate-300">
              <div className="font-semibold text-slate-100 mb-3">Pour les equipes</div>
              <ul className="space-y-2">
                <li>✅ Plateaux repas & paniers</li>
                <li>✅ Livraison sur site ou retrait</li>
                <li>✅ Confirmation manuelle</li>
                <li>✅ Facturation simple sur demande</li>
              </ul>
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-xs text-slate-300">
                Tarif entreprise ajuste selon volume, zone, delai et composition.
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="mb-16">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <h2 className="text-3xl font-bold text-slate-50">Menu / Catalogue</h2>
            </div>
            <p className="text-sm text-slate-300">
              Choisis un produit, ajoute au panier, puis valide sur WhatsApp. Donnees mises a jour selon les partenaires.
            </p>
            <div className="grid gap-3 md:grid-cols-4">
              <input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Rechercher un plat, un vendeur..."
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100 md:col-span-2"
              />
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              >
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <select
                value={selectedVendor}
                onChange={(event) => setSelectedVendor(event.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              >
                {availableVendors.map((vendor) => (
                  <option key={vendor} value={vendor}>{vendor}</option>
                ))}
              </select>
              <select
                value={selectedZone}
                onChange={(event) => setSelectedZone(event.target.value)}
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              >
                {availableZones.map((zone) => (
                  <option key={zone} value={zone}>{zone}</option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as typeof sortBy)}
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              >
                <option value="default">Tri: par defaut</option>
                <option value="priceAsc">Tri: prix croissant</option>
                <option value="priceDesc">Tri: prix decroissant</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={(event) => setOnlyAvailable(event.target.checked)}
                />
                Disponibles uniquement
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={showByVendor}
                  onChange={(event) => setShowByVendor(event.target.checked)}
                />
                Vue par vendeur
              </label>
            </div>
            <div className="text-xs text-slate-400">
              {filteredProducts.length} resultat(s)
            </div>
            {selectedVendor !== 'Tous' && (
              <button
                onClick={() => openVendorMenu(selectedVendor)}
                className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-300"
              >
                Ouvrir la page vendeur
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
          {showByVendor ? (
            <div className="space-y-8">
              {productsByVendor.map(([vendor, items]) => (
                <div key={vendor}>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Vendeur</div>
                      <h3 className="text-2xl font-bold text-slate-50">{vendor}</h3>
                      <div className="text-sm text-slate-400">{items.length} produit(s)</div>
                    </div>
                    <button
                      onClick={() => openVendorMenu(vendor)}
                      className="text-sm font-semibold text-emerald-300"
                    >
                      Ouvrir ce menu
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {items.map((product) => (
                      <LocalProductCard
                        key={product.id}
                        product={product}
                        onAddToRequest={handleAddToRequest}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map(product => (
                <LocalProductCard
                  key={product.id}
                  product={product}
                  onAddToRequest={handleAddToRequest}
                />
              ))}
            </div>
          )}
          {filteredProducts.length === 0 && !catalogLoading && (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-300">
              Aucun produit ne correspond a ta recherche. Essaie une autre categorie ou reinitialise les filtres.
            </div>
          )}
        </section>

        <section className="mb-16" id="partenaires">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Partenaires locaux</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6">
            Nos partenaires, leurs histoires et leurs specialites locales.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {partnerProfiles.map((partner) => (
              <div key={partner.name} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="h-24 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-orange-500/10 border border-slate-800 mb-4 flex items-center justify-center text-xs text-emerald-200 uppercase tracking-[0.2em]">
                  {partner.zone}
                </div>
                <h3 className="mt-3 text-2xl font-bold text-slate-50">{partner.name}</h3>
                <p className="mt-2 text-sm text-emerald-300">{partner.offer}</p>
                <p className="mt-2 text-xs text-slate-400">{partner.story}</p>
                <p className="mt-2 text-xs text-slate-300">{partner.specialty}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-slate-700 px-2 py-1">{partner.type}</span>
                  <span className="rounded-full border border-slate-700 px-2 py-1">{partner.availability}</span>
                  {partner.planifiable && <span className="rounded-full border border-emerald-500/40 px-2 py-1 text-emerald-300">Planifiable</span>}
                  {partner.enterprise && <span className="rounded-full border border-amber-500/40 px-2 py-1 text-amber-300">Entreprise</span>}
                </div>
                <div className="mt-3 text-xs text-emerald-300">{partner.promise} · {partner.eta}</div>
                <button
                  onClick={() => openVendorMenu(partner.name)}
                  className="mt-4 inline-flex items-center gap-2 text-emerald-300 font-semibold"
                >
                  Decouvrir le partenaire
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Comment ca marche</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {howItWorks.map((step) => (
              <div key={step.title} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="inline-flex rounded-2xl bg-emerald-500/15 p-4 text-emerald-300">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-slate-50">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-8">
            <h2 className="text-2xl font-bold text-slate-50 mb-3">Fidelite pilote</h2>
            <p className="text-sm text-slate-300 mb-4">
              Programme fidelite local en test: avantages simples, confirmes manuellement.
            </p>
            <div className="grid gap-4 md:grid-cols-3 text-sm text-slate-200">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="font-semibold text-emerald-200">3 commandes</div>
                <div className="text-slate-300 mt-1">Bonus local surprise</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="font-semibold text-emerald-200">5 commandes</div>
                <div className="text-slate-300 mt-1">Livraison pilote offerte (si dispo)</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <div className="font-semibold text-emerald-200">10 commandes</div>
                <div className="text-slate-300 mt-1">Acces prioritaire aux offres</div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="rounded-full border border-slate-700 px-3 py-1">Bonus partenaires locaux</span>
              <span className="rounded-full border border-slate-700 px-3 py-1">Activation manuelle</span>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Bonjour, je souhaite activer la fidelite pilote DELIKREOL.')}`}
                className="ml-auto inline-flex items-center gap-2 rounded-full border border-emerald-500/50 px-4 py-2 text-emerald-300 hover:border-emerald-400"
              >
                Activer ma fidelite
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-8">
            <h2 className="text-2xl font-bold text-slate-50 mb-4">FAQ rapide</h2>
            <div className="grid gap-4 md:grid-cols-2 text-sm text-slate-300">
              <div>
                <div className="font-semibold text-slate-100">Comment je commande ?</div>
                Panier → WhatsApp → confirmation manuelle.
              </div>
              <div>
                <div className="font-semibold text-slate-100">Les prix sont-ils fixes ?</div>
                Oui, confirmes avant validation.
              </div>
              <div>
                <div className="font-semibold text-slate-100">Zones couvertes ?</div>
                Fort-de-France, Lamentin, Schoelcher (pilote).
              </div>
              <div>
                <div className="font-semibold text-slate-100">Support ?</div>
                WhatsApp direct, reponse rapide.
              </div>
            </div>
          </div>
        </section>

        <section className="mb-12">
          <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-8 text-center">
            <h2 className="text-2xl font-bold text-slate-50 mb-3">Contact / WhatsApp</h2>
            <p className="text-sm text-slate-300 mb-6">
              Besoin d'aide ou d'une commande spéciale ? Écrivez-nous directement.
            </p>
            <a
              href={whatsappLink}
              className="inline-flex items-center gap-3 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold transition-colors"
            >
              WhatsApp direct
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </section>
      </div>

      <footer className="border-t border-slate-800 bg-slate-950/50 backdrop-blur mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            <button
              onClick={() => onShowLegal?.('legal')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              Mentions légales
            </button>
            <button
              onClick={() => onShowLegal?.('privacy')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              Confidentialité
            </button>
            <button
              onClick={() => onShowLegal?.('terms')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              Conditions d'utilisation
            </button>
            <button
              onClick={() => onShowLegal?.('cgu')}
              className="hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              CGU
            </button>          </div>
        </div>
      </footer>
    </div>
  );
}
