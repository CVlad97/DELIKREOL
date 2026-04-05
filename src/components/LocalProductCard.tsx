import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';

interface LocalProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  zone?: string;
  available?: boolean;
}

interface LocalProductCardProps {
  product: LocalProduct;
  onAddToRequest: (product: LocalProduct) => void;
}

export function LocalProductCard({ product, onAddToRequest }: LocalProductCardProps) {
  const [showSim, setShowSim] = useState(false);
  const availabilityLabel = product.available === false ? 'Sur confirmation' : 'Disponible';
  return (
    <div className="group bg-card rounded-2xl border border-border hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-soft madras-accent">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-muted" />
        )}
      </div>
      
      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.category}
          </div>
          <h3 className="text-lg font-bold text-foreground line-clamp-1">{product.name}</h3>
          <div className="text-xs text-muted-foreground">{product.vendor}</div>
          {product.zone && (
            <div className="text-xs text-muted-foreground">Zone: {product.zone}</div>
          )}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xl font-black text-foreground">
            {product.price.toFixed(2)} €
          </div>
          <span className={`text-xs font-semibold ${product.available === false ? 'text-amber-500' : 'text-emerald-400'}`}>
            {availabilityLabel}
          </span>
        </div>
        <button
          onClick={() => onAddToRequest(product)}
          className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:shadow-warm transition-all"
        >
          <Plus className="w-4 h-4" />
          Ajouter au panier
        </button>

        <button
          onClick={() => setShowSim(!showSim)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Estimation indicative
        </button>
        {showSim && (
          <div className="rounded-xl border border-border/60 bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Estimation indicative: 25–35 min · Zone pilote
          </div>
        )}
      </div>
    </div>
  );
}
