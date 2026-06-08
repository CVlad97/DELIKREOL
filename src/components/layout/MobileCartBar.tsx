import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';

export function MobileCartBar() {
  const { items, total, itemCount } = useCart();

  if (items.length === 0) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden animate-slide-up">
      <div className="mx-2 mb-2 rounded-2xl bg-gradient-to-r from-primary to-orange-600 text-white shadow-elegant">
        <Link
          to="/panier"
          className="flex items-center justify-between px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-2 -right-2 bg-white text-primary text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {itemCount}
              </span>
            </div>
            <span className="text-sm font-semibold">
              {itemCount} article{itemCount > 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-base font-bold">
              {total.toFixed(2)} €
            </span>
            <span className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-1 text-sm font-semibold">
              Voir panier
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
}
