import { ShoppingCart, Plus, Store, ArrowRight } from 'lucide-react';

interface LocalProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
}

interface LocalProductCardProps {
  product: LocalProduct;
  onAddToRequest: (product: LocalProduct) => void;
}

export function LocalProductCard({ product, onAddToRequest }: LocalProductCardProps) {
  return (
    <div className="group bg-card rounded-[2.5rem] border-2 border-border/50 hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-sm hover:shadow-elegant">
      <div className="relative h-56 overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-muted-foreground opacity-20" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
        <div className="absolute bottom-4 right-4 bg-primary text-primary-foreground font-black px-4 py-2 rounded-2xl shadow-lg text-lg tracking-tighter">
          {product.price.toFixed(2)} €
        </div>
      </div>
      
      <div className="p-8 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
            <Store className="w-3 h-3" />
            {product.vendor}
          </div>
          <h3 className="text-2xl font-black text-foreground tracking-tight uppercase group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed">{product.description}</p>
          )}
        </div>
        
        <button
          onClick={() => onAddToRequest(product)}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-foreground text-background hover:bg-primary hover:text-primary-foreground rounded-full font-black uppercase tracking-widest text-xs transition-all transform active:scale-95 group/btn shadow-xl"
        >
          <Plus className="w-5 h-5 group-hover/btn:rotate-90 transition-transform" />
          Ajouter à ma sélection
        </button>
      </div>
    </div>
  );
}
