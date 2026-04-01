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
      description: 'Tu decris le besoin, DELIKREOL qualifie et organise la reponse.',
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
      title: 'DELIKREOL qualifie',
      description: 'La demande est lue, clarifiee puis transmise au bon partenaire ou au bon relais terrain.',
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="fixed top-4 right-4 z-50 flex flex-col sm:flex-row gap-2">
        <button
          onClick={onShowGuide}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-full text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-all"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Comment ça marche ?</span>
        </button>
        {onOpenDemo && (
          <button
            onClick={onOpenDemo}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/90 hover:bg-emerald-500 text-slate-950 rounded-full border border-emerald-400 transition-all font-semibold shadow-lg shadow-emerald-500/20"
          >
            <span className="text-sm">{demoMode ? 'Tester le parcours' : 'Acces demo'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Draft Request Badge */}
      {draftRequest.length > 0 && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            onClick={handleStartOrder}
            className="flex items-center gap-3 px-6 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-2xl shadow-2xl shadow-emerald-500/50 transition-all transform hover:scale-105 font-semibold"
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
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-semibold text-emerald-300 mb-6">
              <Sparkles className="w-4 h-4" />
              Mode test actif: catalogue et demandes disponibles sans backend
            </div>
          )}
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-bold text-3xl mb-6 shadow-2xl shadow-emerald-500/50">
            D
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-50 mb-4">
            Commandez local en Martinique des aujourd'hui
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-4">
            Repas creoles, paniers locaux et demandes sur mesure avec un parcours simple
          </p>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Objectif MVP: prendre des commandes, qualifier des besoins et recruter des partenaires sans friction
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={handleStartOrder}
              className="inline-flex items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-8 py-4 text-lg font-bold text-slate-950 shadow-xl shadow-emerald-500/20 transition-transform hover:scale-[1.02]"
            >
              Tester une commande
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={onOpenDemo}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-cyan-500/40 bg-cyan-500/10 px-8 py-4 text-lg font-bold text-cyan-300 transition-transform hover:scale-[1.02]"
            >
              Tester sans compte
              <Sparkles className="w-5 h-5" />
            </button>
            <button
              onClick={() => onSelectMode('pro')}
              className="inline-flex items-center justify-center gap-3 rounded-2xl border border-orange-500/40 bg-orange-500/10 px-8 py-4 text-lg font-bold text-orange-300 transition-transform hover:scale-[1.02]"
            >
              Rejoindre les partenaires
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        <section className="mb-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-emerald-500/20 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">Cash rapide</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Dejeuner et diner creole</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Priorite aux paniers repas, plats du jour et commandes de groupe sur Fort-de-France, Lamentin et Schoelcher.
            </p>
          </div>
          <div className="rounded-3xl border border-orange-500/20 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-300">Operation simple</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Demande libre + validation manuelle</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Le MVP peut encaisser des demandes et convertir en commande confirmee sans dependre d'une stack complexe.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Objectif demain</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">3 demandes qualifiees minimum</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              On vise un test terrain concret avec des besoins reels, pas un faux trafic.
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
          <div className="rounded-3xl border border-red-500/20 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-red-300">Positionnement</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Plateforme locale de coordination</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              DELIKREOL ne se limite pas a une vitrine. La plateforme organise demandes, partenaires et execution locale.
            </p>
          </div>
          <div className="rounded-3xl border border-yellow-500/20 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-yellow-300">Confiance</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">Transparence sur les partenaires</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Les partenaires gardent la main sur leur catalogue, leurs prix de base et leurs zones d'intervention.
            </p>
          </div>
          <div className="rounded-3xl border border-cyan-500/20 bg-slate-900/60 p-6">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-300">Execution</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-50">WhatsApp et qualif manuelle au depart</h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-300">
              Le systeme reste exploitable sans backend lourd: demande rapide, qualification operateur, execution terrain.
            </p>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-6 flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-emerald-400" />
            <h2 className="text-3xl font-bold text-slate-50">Offres test a lancer demain</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {quickOffers.map((offer) => (
              <div key={offer.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
                <p className="text-xs font-black uppercase tracking-[0.25em] text-emerald-300">Sprint cash</p>
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
                  className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl bg-emerald-500 px-5 py-4 font-bold text-slate-950 transition-transform hover:scale-[1.02]"
                >
                  {offer.products.length > 0 ? 'Preparer cette offre' : 'Ouvrir la demande libre'}
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
          <div className="bg-gradient-to-br from-emerald-900/50 to-emerald-800/30 backdrop-blur border-2 border-emerald-600 rounded-3xl p-12 text-center">
            <h2 className="text-3xl font-bold text-slate-50 mb-4">
              Vous voulez quelque chose de precis pour demain ?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Decris le besoin, le quartier et le creneau. DELIKREOL qualifie la demande puis organise la preparation et la livraison.
            </p>
            <button
              onClick={handleStartOrder}
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
            >
              <Package className="w-6 h-6" />
              Lancer une demande rentable
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Pro Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <button
              onClick={() => onSelectMode('pro')}
              className="group relative bg-gradient-to-br from-orange-900/50 to-orange-800/30 backdrop-blur border-2 border-orange-600 rounded-3xl p-8 text-left hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/50 transition-all duration-300"
            >
              <div className="absolute top-4 right-4 w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-orange-400" />
              </div>
              <h2 className="text-3xl font-bold text-orange-400 mb-3">Espace Pro / Métiers</h2>
              <p className="text-slate-300 mb-6">
                Restaurants, points relais, livreurs, administrateurs
              </p>
              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>Recevez des demandes qualifiées</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>Gérez vos produits et commandes</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>
                  <span>Générez des revenus complémentaires</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-orange-400 font-semibold group-hover:gap-4 transition-all">
                <span>Accéder</span>
                <ArrowRight className="w-5 h-5" />
              </div>
            </button>

            <div className="bg-slate-900/50 backdrop-blur border border-slate-800 rounded-3xl p-8">
              <h3 className="text-2xl font-bold text-slate-50 mb-6">Pourquoi Delikreol ?</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-1">Rapide</h4>
                    <p className="text-sm text-slate-400">Traitement express de vos demandes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-1">100% Local</h4>
                    <p className="text-sm text-slate-400">Partenaires et produits martiniquais</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200 mb-1">Sécurisé</h4>
                    <p className="text-sm text-slate-400">Paiement et données protégés</p>
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
