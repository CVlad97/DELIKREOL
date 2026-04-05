import { useEffect, useMemo, useState } from 'react';
import { MapPin, ArrowRight, HelpCircle, FileText, Sparkles, ShoppingBag, Truck, Users, Zap } from 'lucide-react';
import { LocalProductCard } from '../components/LocalProductCard';
import { getFeaturedProducts, LocalProduct } from '../data/mockCatalog';
import { catalogService } from '../services/catalogService';

interface ClientHomePageProps {
  onSelectMode: (mode: 'customer' | 'pro', draftItems?: LocalProduct[]) => void;
  onShowGuide: () => void;
  onOpenDemo?: () => void;
  onShowLegal?: (page: 'legal' | 'privacy' | 'terms' | 'cgu') => void;
  demoMode?: boolean;
  liteMode?: boolean;
}

export function ClientHomePage({ onSelectMode, onShowGuide, onOpenDemo, onShowLegal, demoMode = false, liteMode = false }: ClientHomePageProps) {
  const [draftRequest, setDraftRequest] = useState<LocalProduct[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [customNeed, setCustomNeed] = useState('');
  const [customBudget, setCustomBudget] = useState('');
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'pilot' | 'outside'>('pilot');
  const [customerName, setCustomerName] = useState('');
  const [customerZone, setCustomerZone] = useState('');
  const [customerTime, setCustomerTime] = useState('');
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
  const featuredProducts = catalogProducts.length > 0 ? catalogProducts.slice(0, 6) : getFeaturedProducts();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
  const baseWhatsAppText = 'Bonjour, je souhaite commander sur DELIKREOL.';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(baseWhatsAppText)}`;

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

  const availableCategories = useMemo(() => {
    const list = Array.from(new Set(catalogProducts.map((p) => p.category || 'Divers')));
    return ['Tous', ...list];
  }, [catalogProducts]);

  const availableVendors = useMemo(() => {
    const list = Array.from(new Set(catalogProducts.map((p) => p.vendor || 'Vendeur local')));
    return ['Tous', ...list];
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

  const partnerHighlights = [
    {
      name: 'Traiteur Kreyol FDF',
      zone: 'Fort-de-France',
      offer: 'Plats du jour et desserts',
      type: 'Traiteur',
      availability: 'Commande J+0 / J+1',
    },
    {
      name: 'Boutik Lakay',
      zone: 'Lamentin',
      offer: 'Paniers frais et douceurs',
      type: 'Epicerie locale',
      availability: 'Stock limite',
    },
    {
      name: 'Saveurs du Nord',
      zone: 'Schoelcher',
      offer: 'Repas familiaux',
      type: 'Cuisine creole',
      availability: 'Confirmation rapide',
    },
  ];

  const handleAddToRequest = (product: LocalProduct) => {
    setDraftRequest(prev => [...prev, product]);
  };

  const handleRemoveFromDraft = (productId: string) => {
    setDraftRequest(prev => prev.filter(p => p.id !== productId));
  };

  const handleStartOrder = () => {
    if (liteMode) {
      setShowCart(true);
      return;
    }
    onSelectMode('customer', draftRequest);
  };

  const handleQuickOffer = (products: LocalProduct[]) => {
    setDraftRequest(products);
    onSelectMode('customer', products);
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

  const cartSummary = useMemo(() => {
    const subtotal = draftRequest.reduce((sum, item) => sum + item.price, 0);
    let deliveryFee = 0;
    if (draftRequest.length > 0 && deliveryMode === 'pilot') deliveryFee = 2.5;
    const total = subtotal + deliveryFee;
    return { subtotal, deliveryFee, total };
  }, [draftRequest, deliveryMode]);

  const cartWhatsAppLink = useMemo(() => {
    if (draftRequest.length === 0) return whatsappLink;
    const lines = draftRequest.map((item) => `- ${item.name} (${item.vendor}) ${item.price.toFixed(2)} €`);
    const modeLabel =
      deliveryMode === 'pickup'
        ? 'Retrait'
        : deliveryMode === 'pilot'
        ? 'Livraison zone pilote'
        : 'Hors zone (confirmation)';
    const contactLines = [
      customerName ? `Nom: ${customerName}` : null,
      customerZone ? `Zone: ${customerZone}` : null,
      customerTime ? `Creneau souhaite: ${customerTime}` : null,
    ].filter(Boolean);
    const text = `${baseWhatsAppText}\n\nMa selection :\n${lines.join('\n')}\n\nMode: ${modeLabel}\nTotal estimatif : ${cartSummary.total.toFixed(2)} €${contactLines.length ? `\n\nInfos:\n${contactLines.join('\n')}` : ''}`;
    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
  }, [draftRequest, whatsappLink, whatsappNumber, cartSummary.total, deliveryMode]);

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
      <div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2">
        <button
          onClick={onShowGuide}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-full text-slate-300 hover:text-emerald-300 hover:border-emerald-400 transition-colors"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Comment ça marche ?</span>
        </button>
        {onOpenDemo && (
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-full border border-emerald-400/40 transition-colors font-semibold"
          >
            <span className="text-sm">{demoMode ? 'Commander maintenant' : 'Voir le catalogue'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Draft Request Badge */}
      {draftRequest.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={() => setShowCart(true)}
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
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur">
          <div className="w-full sm:max-w-xl bg-slate-950 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-50">Mon panier</h3>
              <button
                onClick={() => setShowCart(false)}
                className="text-slate-400 hover:text-slate-200"
              >
                Fermer
              </button>
            </div>
            <div className="mt-4 space-y-3 max-h-72 overflow-y-auto">
              {draftRequest.map((item) => (
                <div key={item.id} className="flex items-center justify-between rounded-2xl bg-slate-900/60 px-4 py-3">
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
            <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-sm text-slate-200">
              <div className="flex justify-between">
                <span>Sous-total</span>
                <span>{cartSummary.subtotal.toFixed(2)} €</span>
              </div>
              <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Mode de retrait / livraison</div>
                <div className="mt-3 grid gap-2 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryMode"
                      value="pickup"
                      checked={deliveryMode === 'pickup'}
                      onChange={() => setDeliveryMode('pickup')}
                    />
                    Retrait (0 €)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryMode"
                      value="pilot"
                      checked={deliveryMode === 'pilot'}
                      onChange={() => setDeliveryMode('pilot')}
                    />
                    Livraison zone pilote (forfait 2,50 €)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="deliveryMode"
                      value="outside"
                      checked={deliveryMode === 'outside'}
                      onChange={() => setDeliveryMode('outside')}
                    />
                    Hors zone (confirmation manuelle)
                  </label>
                </div>
              </div>
              <div className="flex justify-between mt-4">
                <span>Livraison</span>
                <span>{cartSummary.deliveryFee.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between mt-3 text-base font-black text-emerald-300">
                <span>Total estimatif</span>
                <span>{cartSummary.total.toFixed(2)} €</span>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <input
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
                placeholder="Nom (optionnel)"
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
                placeholder="Heure souhaitee"
                className="rounded-2xl border border-slate-700 bg-slate-950/60 px-4 py-3 text-sm text-slate-100"
              />
            </div>
            <div className="mt-5 flex flex-col sm:flex-row gap-3">
              <a
                href={cartWhatsAppLink}
                className="flex-1 inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-slate-950 hover:bg-emerald-600"
              >
                Valider sur WhatsApp
              </a>
              <button
                onClick={handleStartOrder}
                className="flex-1 inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-4 font-bold text-slate-100 hover:border-emerald-400"
              >
                Continuer le checkout
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {demoMode && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 mb-6">
              <Sparkles className="w-4 h-4" />
              Pilote local: commandes possibles
            </div>
          )}
          <div className="flex flex-col items-center gap-5 mb-6">
            <img
              src="/branding/logo-wordmark-animated.svg"
              alt="DELIKREOL"
              className="h-10 md:h-12"
            />
            <div className="madras-strip w-24 rounded-full" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-50 mb-3">
            Commandez repas creoles et produits locaux, simplement.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-3">
            Menus, paniers et douceurs locales. Confirmation manuelle rapide par WhatsApp.
          </p>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Zones pilotes : Fort-de-France, Lamentin, Schoelcher. Prix valides avant finalisation.
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
              onClick={onOpenDemo}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-slate-600/60 bg-slate-900/40 px-8 py-4 text-lg font-bold text-slate-100 transition-colors hover:border-emerald-400/60"
            >
              Voir le menu
              <Sparkles className="w-5 h-5 text-emerald-300" />
            </button>
            <button
              onClick={() => onSelectMode('pro')}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-orange-500/50 bg-orange-500/10 px-8 py-4 text-lg font-bold text-orange-200 transition-colors hover:border-orange-400"
            >
              Devenir partenaire
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

        <section className="mb-14">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl border border-emerald-500/30 bg-slate-900/70 p-5 text-sm text-slate-200">
              <div className="font-semibold text-emerald-200 mb-1">Confirmation humaine</div>
              Prix et dispo valides avant finalisation.
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-200">
              <div className="font-semibold text-slate-100 mb-1">Zones pilotes</div>
              Fort-de-France · Lamentin · Schoelcher
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-200">
              <div className="font-semibold text-slate-100 mb-1">Support WhatsApp</div>
              Reponse rapide et suivi manuel clair.
            </div>
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-sm text-slate-200">
              <div className="font-semibold text-slate-100 mb-1">Partenaires locaux</div>
              Vendeurs pilotes et offre locale.
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Selections du moment</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6">
            Des produits locaux choisis pour commander vite et simplement.
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

        {/* Featured Products Section */}
        <section className="mb-16">
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-emerald-400" />
              <h2 className="text-3xl font-bold text-slate-50">Catalogue</h2>
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
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map(product => (
              <LocalProductCard
                key={product.id}
                product={product}
                onAddToRequest={handleAddToRequest}
              />
            ))}
          </div>
        </section>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Partenaires locaux</h2>
          </div>
          <p className="text-sm text-slate-300 mb-6">
            Des vendeurs pilotes en Martinique, visibles et joignables simplement.
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            {partnerHighlights.map((partner) => (
              <div key={partner.name} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-200">{partner.zone}</p>
                <h3 className="mt-3 text-2xl font-bold text-slate-50">{partner.name}</h3>
                <p className="mt-2 text-sm text-slate-300">{partner.offer}</p>
                <div className="mt-3 text-xs text-slate-400">
                  {partner.type} · {partner.availability}
                </div>
                <a
                  href={whatsappLink}
                  className="mt-4 inline-flex items-center gap-2 text-emerald-300 font-semibold"
                >
                  WhatsApp direct
                  <ArrowRight className="w-4 h-4" />
                </a>
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

      {/* Draft Items Preview */}
      {draftRequest.length > 0 && (
        <div className="fixed bottom-32 right-6 bg-slate-800/95 backdrop-blur border border-slate-700 rounded-xl p-4 max-w-xs z-40">
          <h3 className="font-semibold text-slate-50 mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400" />
            Ma sélection ({draftRequest.length})
          </h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {draftRequest.map((item, idx) => (
              <div key={`${item.id}-${idx}`} className="flex items-center justify-between gap-2 text-sm bg-slate-900/50 p-2 rounded">
                <div className="flex-1 min-w-0">
                  <div className="text-slate-200 font-medium truncate">{item.name}</div>
                  <div className="text-slate-400 text-xs">{item.price.toFixed(2)} €</div>
                </div>
                <button
                  onClick={() => handleRemoveFromDraft(item.id)}
                  className="text-red-400 hover:text-red-300 text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

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
