import { useState } from 'react';
import { Package, MapPin, Clock, Shield, ArrowRight, HelpCircle, FileText, Sparkles, ShoppingBag } from 'lucide-react';
import { LocalProductCard } from '../components/LocalProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { mockCategories, getFeaturedProducts, LocalProduct } from '../data/mockCatalog';

interface ClientHomePageProps {
  onSelectMode: (mode: 'customer' | 'pro', draftItems?: LocalProduct[]) => void;
  onShowGuide: () => void;
  onShowLegal?: (page: 'legal' | 'privacy' | 'terms' | 'cgu') => void;
}

export function ClientHomePage({ onSelectMode, onShowGuide, onShowLegal }: ClientHomePageProps) {
  const [draftRequest, setDraftRequest] = useState<LocalProduct[]>([]);
  const featuredProducts = getFeaturedProducts();

  const handleAddToRequest = (product: LocalProduct) => {
    setDraftRequest(prev => [...prev, product]);
  };

  const handleRemoveFromDraft = (productId: string) => {
    setDraftRequest(prev => prev.filter(p => p.id !== productId));
  };

  const handleStartOrder = () => {
    onSelectMode('customer', draftRequest);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={onShowGuide}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/80 backdrop-blur border border-slate-700 rounded-full text-slate-300 hover:text-emerald-400 hover:border-emerald-500 transition-all"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm font-medium">Comment ça marche ?</span>
        </button>
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
          <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500 text-slate-950 font-bold text-3xl mb-6 shadow-2xl shadow-emerald-500/50">
            D
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-slate-50 mb-4">
            Saveurs Locales Martinique
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-4">
            Produits locaux, repas créoles et conciergerie logistique
          </p>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Commandez en un clic ou décrivez votre besoin, on s'occupe de tout
          </p>
        </div>

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
              Vous ne trouvez pas ce que vous cherchez ?
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              Utilisez notre service de conciergerie : décrivez ce que vous voulez, on s'occupe de trouver, préparer et livrer
            </p>
            <button
              onClick={handleStartOrder}
              className="inline-flex items-center gap-3 px-8 py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-xl"
            >
              <Package className="w-6 h-6" />
              Faire une demande personnalisée
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