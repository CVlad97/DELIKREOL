import { Plus, Package } from 'lucide-react';
import { Product } from '../lib/supabase';
import { useCart } from '../contexts/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="h-48 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package size={48} className="text-orange-600" />
        )}
      </div>

      <div className="p-4">
        <div className="mb-2">
          <h3 className="font-bold text-lg text-gray-900 line-clamp-1">{product.name}</h3>
          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded mt-1">
            {product.category}
          </span>
        </div>

        {product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
        )}

        <div className="flex items-center justify-between">
          <div>
            <span className="text-2xl font-bold text-emerald-600">{product.price.toFixed(2)} €</span>
            {product.stock_quantity !== null && (
              <p className="text-xs text-gray-500 mt-1">Stock: {product.stock_quantity}</p>
            )}
          </div>

          <button
            onClick={() => addItem(product)}
            disabled={!product.is_available}
            className="bg-emerald-600 text-white p-3 rounded-full hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
          </button>
        </div>

        {!product.is_available && (
          <p className="text-sm text-red-600 mt-2 font-medium">Indisponible</p>
        )}
      </div>
    </div>
  );
}
