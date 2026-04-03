import { useState } from 'react';
import { Package, MapPin, Clock, Shield, ArrowRight, HelpCircle, FileText, Sparkles, ShoppingBag, Truck, Users, Zap } from 'lucide-react';
import { LocalProductCard } from '../components/LocalProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { mockCategories, getFeaturedProducts, LocalProduct } from '../data/mockCatalog';

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
      description: 'Fruits, douceurs et produits signatures pour offrir ou tester le concept.',
      products: featuredProducts.filter((product) => ['p3', 'p5', 'p8'].includes(product.id)),
    },
    {
      id: 'demande-libre',
      title: 'Besoin sur mesure',
      description: 'Tu decris le besoin, on confirme et on organise la reponse.',
      products: [],
    },
  ];

  const howItWorks = [
    {
      icon: ShoppingBag,
      title: 'Vous faites la demande',
      description: 'Repas, courses, colis ou besoin local. Le parcours reste simple et rapide sur mobile.',
    },
    {
      icon: Users,
      title: 'On confirme avec vous',
      description: 'Votre demande est lue et precisee, puis transmise au bon partenaire local.',
    },
    {
      icon: Truck,
      title: 'Le partenaire execute',
      description: 'Preparation, livraison ou service local avec suivi basique et coordination operateur.',
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
            className="flex items-center gap-3 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl shadow-xl transition-colors font-semibold"
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
        <div className="text-center mb-16">
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
          <h1 className="text-4xl md:text-5xl font-bold text-slate-50 mb-4">
            Produits locaux et repas creoles, livrés simplement
          </h1>
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-4">
            Commande rapide, confirmation WhatsApp, partenaires martiniquais proches de chez vous.
          </p>
          <p className="text-base text-slate-400 max-w-2xl mx-auto">
            Zones pilote : Fort-de-France, Lamentin, Schoelcher.
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
        </div>

        <section className="mb-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-emerald-500/15 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-200">Local et frais</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Repas creoles & paniers</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Plats du jour, douceurs, paniers locaux. Des produits simples, clairs, et disponibles rapidement.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-500/15 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-200">Commande facile</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Confirmation rapide</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Vous choisissez, on confirme par WhatsApp, et on organise la préparation avec le partenaire.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-500/15 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">Support humain</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Aide locale</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Besoin particulier ? On vous répond vite et on ajuste la commande au besoin.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <Zap className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Comment ca marche</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {howItWorks.map((step) => (
              <div key={step.title} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
                <div className="inline-flex rounded-2xl bg-emerald-500/15 p-4 text-emerald-300">
                  <step.icon className="w-7 h-7" />
                </div>
                <h3 className="mt-5 text-2xl font-bold text-slate-50">{step.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16 grid gap-4 lg:grid-cols-3">
          <div className="rounded-3xl border border-red-500/15 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-200">Confiance</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Partenaires locaux visibles</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Vous voyez qui prépare votre commande et vous savez d'ou viennent les produits.
            </p>
          </div>
          <div className="rounded-3xl border border-yellow-500/15 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-200">Prix clairs</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Pas de surprise</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Prix affichés et contact direct. Une commande simple, sans jargon.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-500/15 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-200">WhatsApp</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Support rapide</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Besoin de modifier ? On vous répond vite sur WhatsApp pour valider.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Selections du moment</h2>
          </div>
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

        {/* Categories Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-50 mb-6 text-center">
            Parcourir par catégorie
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {mockCategories.map(category => (
              <CategoryCard
                key={category.id}
                name={category.name}
                icon={category.icon}
                count={category.count}
                onClick={handleStartOrder}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="mb-16">
          <div className="bg-slate-900/70 border border-emerald-500/30 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-50 mb-4">
              Besoin particulier ou commande de groupe ?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Decrivez votre besoin, le quartier et l'heure souhaitee. On vous repond vite pour confirmer.
            </p>
            <button
              onClick={handleStartOrder}
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold text-lg transition-colors"
            >
              <Package className="w-6 h-6" />
              Demander un devis simple
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Pro Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <button
              onClick={() => onSelectMode('pro')}
              className="group relative bg-slate-900/60 border border-orange-500/40 rounded-3xl p-8 text-left hover:border-orange-400 transition-colors"
            >
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold text-orange-200 mb-3">Espace partenaires</h2>
              <p className="text-slate-300 mb-6">
                Restaurants, traiteurs, boutiques, points relais
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>Recevez des commandes locales</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>Gerez vos produits et disponibilites</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>Augmentez vos ventes localement</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-orange-200 font-semibold group-hover:gap-4 transition-all">
                <span>Je suis partenaire</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-slate-50 mb-6">Pourquoi DELIKREOL ?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-1">Rapide</h4>
                    <p className="text-sm text-slate-400">Confirmation rapide via WhatsApp</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-1">100% Local</h4>
                    <p className="text-sm text-slate-400">Partenaires proches de chez vous</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-1">Sécurisé</h4>
                    <p className="text-sm text-slate-400">Suivi simple et support humain</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Draft Items Preview */}
      {draftRequest.length > 0 && (
        <div className="fixed bottom-32 right-6 bg-slate-800/95 backdrop-blur border border-slate-700 rounded-xl p-4 shadow-2xl max-w-xs z-40">
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
