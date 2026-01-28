import { Plus, Package, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="group bg-card rounded-[2rem] border border-border hover:border-primary/50 transition-all duration-500 overflow-hidden shadow-elegant hover:-translate-y-1">
      <div className="relative h-56 overflow-hidden">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <Package size={48} className="text-muted-foreground opacity-20" />
          </div>
        )}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-md text-foreground text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <div className="space-y-1">
          <h3 className="font-black text-xl text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground font-medium line-clamp-2 leading-relaxed">{product.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Prix Unitaire</span>
            <span className="text-2xl font-black text-foreground tracking-tighter">{product.price.toFixed(2)} €</span>
          </div>

          <button
            onClick={() => addItem(product)}
            disabled={!product.is_available}
            className="bg-primary text-primary-foreground p-4 rounded-2xl hover:shadow-elegant transition-all transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
          >
            <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-transform" />
          </button>
        </div>

        {!product.is_available && (
          <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-[10px] pt-2 border-t border-border">
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            Victime de son succès
          </div>
        )}
      </div>
    </div>
  );
}
