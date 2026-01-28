import { X, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { AuthModal } from './AuthModal';

interface CartProps {
  isOpen?: boolean;
  onClose: () => void;
  onCheckout?: () => void;
}

export function Cart({ onClose, onCheckout }: CartProps) {
  const { items, updateQuantity, removeItem, total, itemCount } = useCart();
  const { user } = useAuth();
  const [deliveryFee] = useState(5.0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const finalTotal = total + deliveryFee;

  return (
    <>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4">
      <div className="bg-card w-full sm:max-w-md sm:rounded-[3rem] rounded-t-[3rem] max-h-[95vh] flex flex-col shadow-elegant border-t sm:border border-border animate-slide-up sm:animate-fadeIn">
        <div className="p-8 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <ShoppingBag size={24} />
            </div>
            <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">
              Mon Panier <span className="text-primary">({itemCount})</span>
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {items.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto opacity-20">
                <ShoppingBag size={48} className="text-muted-foreground" />
              </div>
              <p className="text-xl font-black text-muted-foreground uppercase tracking-tighter">Votre panier est vide</p>
              <button 
                onClick={onClose}
                className="text-primary font-black uppercase tracking-widest text-xs hover:underline"
              >
                Parcourir la carte →
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex gap-6 group">
                  <div className="w-24 h-24 bg-muted rounded-2xl flex-shrink-0 overflow-hidden shadow-sm">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package size={24} className="text-muted-foreground opacity-20" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 space-y-1">
                    <h3 className="font-black text-lg text-foreground tracking-tight uppercase line-clamp-1">{item.name}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{item.category}</p>
                    <p className="text-xl font-black text-primary tracking-tighter mt-2">
                      {(item.price * item.quantity).toFixed(2)} €
                    </p>
                  </div>

                  <div className="flex flex-col items-end justify-between py-1">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:bg-red-50 text-red-400 hover:text-red-600 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>

                    <div className="flex items-center bg-muted rounded-xl p-1 gap-3">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center bg-card rounded-lg shadow-sm hover:text-primary transition-all active:scale-90"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="font-black text-sm w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center bg-primary text-primary-foreground rounded-lg shadow-sm hover:scale-105 transition-all active:scale-90"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-border bg-muted/30 space-y-6 rounded-b-[3rem]">
            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span>Sous-total</span>
                <span>{total.toFixed(2)} €</span>
              </div>
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                <span>Livraison Express</span>
                <span>{deliveryFee.toFixed(2)} €</span>
              </div>
              <div className="h-px w-full bg-border mt-4" />
              <div className="flex justify-between items-end pt-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-foreground">Total TTC</span>
                <span className="text-4xl font-black text-foreground tracking-tighter">
                  {finalTotal.toFixed(2)} <span className="text-2xl">€</span>
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                if (!user) {
                  setShowAuthModal(true);
                  return;
                }
                if (onCheckout) {
                  onCheckout();
                }
              }}
              className="w-full bg-primary text-primary-foreground py-6 rounded-full font-black uppercase tracking-widest text-sm hover:shadow-elegant transition-all transform active:scale-95"
            >
              Passer à la caisse
            </button>
          </div>
        )}
      </div>
    </div>

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="signup"
        />
      )}
    </>
  );
}
