import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const [showSim, setShowSim] = useState(false);
  const vendorLabel = product.vendor?.business_name ?? (product.vendor_id ? 'Vendeur local' : null);

  return (
    <div className="group bg-card rounded-2xl border border-border hover:border-primary/40 transition-all duration-300 overflow-hidden shadow-soft madras-accent">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
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
          {vendorLabel && (
            <div className="text-xs text-muted-foreground">{vendorLabel}</div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xl font-black text-foreground">
            {product.price.toFixed(2)} €
          </div>
          <button
            onClick={() => addItem(product)}
            disabled={!product.is_available}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:shadow-warm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <button
          onClick={() => setShowSim(!showSim)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Simulation rapide
        </button>
        {showSim && (
          <div className="rounded-xl border border-border/60 bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Estimation: 25–35 min · Zone pilote
          </div>
        )}

        {!product.is_available && (
          <div className="text-xs font-semibold text-destructive">Indisponible</div>
        )}
      </div>
    </div>
  );
}
