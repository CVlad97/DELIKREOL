import { useState } from 'react';
import { MapPin, ArrowRight, HelpCircle, FileText, Sparkles, ShoppingBag, Truck, Users, Zap } from 'lucide-react';
import { LocalProductCard } from '../components/LocalProductCard';
import { getFeaturedProducts, LocalProduct } from '../data/mockCatalog';

interface ClientHomePageProps {
  onSelectMode: (mode: 'customer' | 'pro', draftItems?: LocalProduct[]) => void;
  onShowGuide: () => void;
  onOpenDemo?: () => void;
  onShowLegal?: (page: 'legal' | 'privacy' | 'terms' | 'cgu') => void;
  demoMode?: boolean;
}

export function ClientHomePage({ onSelectMode, onShowGuide, onOpenDemo, onShowLegal, demoMode = false }: ClientHomePageProps) {
  const [draftRequest, setDraftRequest] = useState<LocalProduct[]>([]);
  const featuredProducts = getFeaturedProducts();
  const whatsappNumber = import.meta.env.VITE_WHATSAPP_NUMBER || '596696653589';
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Bonjour, je souhaite commander sur DELIKREOL.')}`;
  const quickOffers = [
    {
      id: 'dej-crew',
      title: 'Dejeuner express',
      description: 'Repas creole pour 2 a 4 personnes sur Fort-de-France ou Lamentin.',
      products: featuredProducts.filter((product) => ['p1', 'p2', 'p4'].includes(product.id)),
    },
    {
      id: 'panier-local',
      title: 'Panier local',
      description: 'Fruits, douceurs et produits signatures pour offrir ou découvrir.',
      products: featuredProducts.filter((product) => ['p3', 'p5', 'p8'].includes(product.id)),
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
    },
    {
      name: 'Boutik Lakay',
      zone: 'Lamentin',
      offer: 'Paniers frais et douceurs',
    },
    {
      name: 'Saveurs du Nord',
      zone: 'Schoelcher',
      offer: 'Repas familiaux',
    },
  ];

  const handleAddToRequest = (product: LocalProduct) => {
    setDraftRequest(prev => [...prev, product]);
  };

  const handleRemoveFromDraft = (productId: string) => {
    setDraftRequest(prev => prev.filter(p => p.id !== productId));
  };

  const handleStartOrder = () => {
    onSelectMode('customer', draftRequest);
  };

  const handleQuickOffer = (products: LocalProduct[]) => {
    setDraftRequest(products);
    onSelectMode('customer', products);
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
            onClick={handleStartOrder}
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

      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-12">
          {demoMode && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-200 mb-6">
              <Sparkles className="w-4 h-4" />
              Service en lancement, commandes possibles
            </div>
          )}
          <div className="flex flex-col items-center gap-5 mb-6">
            <img
              src="/branding/logo-wordmark.svg"
              alt="DELIKREOL"
              className="h-10 md:h-12"
            />
            <div className="madras-strip w-24 rounded-full" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-50 mb-3">
            Commandez local en Martinique, simplement.
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-3">
            Repas creoles, paniers frais, douceurs locales. Confirmation rapide par WhatsApp.
          </p>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Zones pilotes : Fort-de-France, Lamentin, Schoelcher.
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
              Voir le catalogue
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
          <div className="mt-6 text-sm text-emerald-200 font-semibold">
            WhatsApp direct : réponse rapide
            <a href={whatsappLink} className="ml-2 text-emerald-300 underline underline-offset-4">
              {whatsappNumber}
            </a>
          </div>
        </div>

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
        </section>

        {/* Featured Products Section */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Pépites locales du moment</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 8).map(product => (
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
              <div>Commande simple</div>
              <div>Réponse rapide</div>
              <div>Support WhatsApp</div>
              <div>Zones pilotes</div>
              <div>Partenaires locaux</div>
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
