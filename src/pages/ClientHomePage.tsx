import { useState } from 'react';
import { Package, MapPin, Clock, Shield, ArrowRight, HelpCircle, FileText, Sparkles, ShoppingBag, Zap, Star } from 'lucide-react';
import { LocalProductCard } from '../components/LocalProductCard';
import { CategoryCard } from '../components/CategoryCard';
import { mockCategories, getFeaturedProducts, LocalProduct } from '../data/mockCatalog';

interface ClientHomePageProps {
  onSelectMode: (mode: 'customer' | 'pro', draftItems?: LocalProduct[]) => void;
  onShowGuide: () => void;
  onShowLegal?: (page: 'legal' | 'privacy' | 'terms') => void;
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Premium Header/Nav Floating */}
      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <button
          onClick={onShowGuide}
          className="flex items-center gap-2 px-5 py-2.5 bg-card/80 backdrop-blur-md border border-border rounded-full text-foreground hover:text-primary hover:border-primary/50 transition-all font-bold shadow-elegant"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-sm uppercase tracking-widest">Guide</span>
        </button>
      </div>

      {/* Floating Cart Badge */}
      {draftRequest.length > 0 && (
        <div className="fixed bottom-8 right-8 z-50">
          <button
            onClick={handleStartOrder}
            className="flex items-center gap-4 px-8 py-5 bg-primary text-primary-foreground rounded-[2rem] shadow-elegant hover:scale-105 transition-all transform active:scale-95 group"
          >
            <div className="relative">
              <ShoppingBag className="w-7 h-7" />
              <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full shadow-md">
                {draftRequest.length}
              </span>
            </div>
            <div className="text-left border-l border-white/20 pl-4">
              <div className="text-xs font-black uppercase tracking-widest opacity-80 leading-none mb-1">Ma Sélection</div>
              <div className="text-lg font-black tracking-tighter leading-none">Commander</div>
            </div>
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      )}

      {/* Hero Content Area */}
      <div className="max-w-7xl mx-auto px-4 pt-20 pb-32">
        <div className="text-center mb-24 space-y-8">
          <div className="inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground font-black text-4xl shadow-elegant animate-bounce-slow">
            D
          </div>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-black uppercase tracking-[0.2em]">
              <Star className="w-3 h-3 fill-accent" />
              Le Terroir à votre porte
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-foreground tracking-tighter uppercase leading-[0.9]">
              Saveurs Locales <br />
              <span className="text-primary">Martinique</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto font-medium leading-relaxed">
              Produits frais, plats créoles authentiques et logistique intelligente pour une île connectée.
            </p>
          </div>
          <div className="flex justify-center gap-6 pt-8">
            <button 
              onClick={handleStartOrder}
              className="px-10 py-5 bg-primary text-primary-foreground rounded-full font-black uppercase tracking-widest hover:shadow-elegant transition-all transform hover:scale-105 active:scale-95"
            >
              Lancer ma commande
            </button>
          </div>
        </div>

        {/* Featured Products Section */}
        <section className="mb-32">
          <div className="flex items-end justify-between mb-12 border-b border-border pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-primary" />
                <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">Les pépites du moment</h2>
              </div>
              <p className="text-muted-foreground font-medium">Sélectionnés avec soin parmi nos meilleurs partenaires.</p>
            </div>
            <button className="text-primary font-black uppercase tracking-widest text-sm hover:underline">Voir tout</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.slice(0, 8).map(product => (
              <LocalProductCard
                key={product.id}
                product={product}
                onAddToRequest={handleAddToRequest}
              />
            ))}
          </div>
        </section>

        {/* Categories Grid - High Fidelity */}
        <section className="mb-32">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter uppercase">Parcourir le Marché</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto font-medium">Explorez la diversité gastronomique et agricole de la Martinique par catégorie.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
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

        {/* Conciergerie / Custom Request - Premium Card */}
        <section className="mb-32">
          <div className="relative overflow-hidden bg-foreground text-background rounded-[3rem] p-16 md:p-24 shadow-elegant border-4 border-primary/20 group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px] group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-[100px]" />
            
            <div className="relative z-10 text-center space-y-8">
              <div className="inline-flex p-4 bg-primary rounded-2xl mb-4">
                <Package className="w-10 h-10 text-primary-foreground" />
              </div>
              <h2 className="text-4xl md:text-7xl font-black tracking-tighter uppercase leading-none">
                Service Conciergerie <br />
                <span className="text-primary">Sur Mesure</span>
              </h2>
              <p className="text-xl text-background/70 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                Vous ne trouvez pas un produit spécifique ? Décrivez votre besoin, nous sourçons, préparons et livrons directement chez vous.
              </p>
              <button
                onClick={handleStartOrder}
                className="inline-flex items-center gap-4 px-12 py-6 bg-white text-foreground hover:bg-primary hover:text-white rounded-full font-black text-xl uppercase tracking-widest transition-all transform hover:scale-105 shadow-2xl"
              >
                Faire une demande libre
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        </section>

        {/* Pro / Partners Split Section */}
        <section className="mb-16">
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            {/* Pro Card */}
            <div 
              onClick={() => onSelectMode('pro')}
              className="group cursor-pointer relative bg-card border-2 border-border/50 rounded-[3rem] p-12 overflow-hidden hover:border-primary/50 transition-all duration-500 shadow-elegant"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform" />
              <div className="space-y-6">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                  <Zap className="w-8 h-8" />
                </div>
                <h2 className="text-4xl font-black text-foreground tracking-tighter uppercase">Espace Pro</h2>
                <p className="text-muted-foreground font-medium leading-relaxed">
                  Restaurateurs, producteurs, livreurs et points relais. Gérez votre activité avec nos outils avancés.
                </p>
                <div className="space-y-3">
                  {['Flux de commandes', 'IA logistique', 'Revenus garantis'].map((feat, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm font-bold uppercase tracking-widest text-foreground/60">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                      {feat}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-primary font-black uppercase tracking-widest group-hover:gap-5 transition-all">
                  <span>Accéder à l'espace</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Why Us Card */}
            <div className="bg-muted/30 border border-border/50 rounded-[3rem] p-12 space-y-10">
              <h3 className="text-3xl font-black text-foreground tracking-tighter uppercase">L'engagement Delikreol</h3>
              <div className="space-y-8">
                {[
                  { icon: Clock, title: 'Rapidité Absolue', desc: 'Livraison en moins de 30 minutes ou retrait express.', color: 'text-primary' },
                  { icon: MapPin, title: 'Ancrage Local', desc: 'Soutenez activement les producteurs martiniquais.', color: 'text-secondary' },
                  { icon: Shield, title: 'Sécurité Totale', desc: 'Paiements cryptés et produits tracés par QR code.', color: 'text-accent' }
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-6">
                    <div className={`w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center flex-shrink-0 ${item.color}`}>
                      <item.icon className="w-7 h-7" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black tracking-tight uppercase">{item.title}</h4>
                      <p className="text-muted-foreground font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <footer className="border-t border-border bg-card py-16">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-8">
          <div className="flex justify-center gap-12 text-xs font-black uppercase tracking-widest text-muted-foreground">
            {['Mentions légales', 'Confidentialité', 'Conditions d\'utilisation'].map((link, i) => (
              <button 
                key={i}
                onClick={() => onShowLegal?.(i === 0 ? 'legal' : i === 1 ? 'privacy' : 'terms')}
                className="hover:text-primary transition-colors"
              >
                {link}
              </button>
            ))}
          </div>
          <div className="h-px w-24 bg-primary/20 mx-auto" />
          <p className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/50">
            © 2026 DELIKREOL · Made with love in Martinique
          </p>
        </div>
      </footer>
    </div>
  );
}
