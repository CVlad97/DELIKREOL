import { ShoppingCart, Plus } from 'lucide-react';

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
    <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden hover:border-emerald-500 transition-all group">
      <div className="relative h-40 bg-gradient-to-br from-slate-700 to-slate-800 overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-12 h-12 text-slate-600" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-emerald-500 text-slate-950 text-xs font-bold px-2 py-1 rounded-full">
          {product.price.toFixed(2)} €
        </div>
      </div>
      
      <div className="p-4">
        <div className="text-xs text-emerald-400 mb-1">{product.vendor}</div>
        <h3 className="font-semibold text-slate-50 mb-1 line-clamp-1">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{product.description}</p>
        )}
        
        <button
          onClick={() => onAddToRequest(product)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          Ajouter à ma demande
        </button>
      </div>
    </div>
  );
}
