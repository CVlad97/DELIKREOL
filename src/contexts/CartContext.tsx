import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../lib/supabase';
import { menuSelectionKey, type MenuSelection } from '../types/menu';

interface CartItem extends Product {
  quantity: number;
  cart_line_id: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, selection?: MenuSelection) => void;
  removeItem: (cartLineId: string) => void;
  updateQuantity: (cartLineId: string, quantity: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function readInitialCart(): CartItem[] {
  const stripeStatus = new URLSearchParams(window.location.search).get('stripe');

  if (stripeStatus === 'success') {
    localStorage.removeItem('cart');
    localStorage.removeItem('pendingStripeOrderId');
    return [];
  }

  if (stripeStatus === 'cancelled') {
    localStorage.removeItem('pendingStripeOrderId');
  }

  const saved = localStorage.getItem('cart');
  if (!saved) return [];

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed)
      ? (parsed as Array<CartItem & { cart_line_id?: string }>).map((item) => ({
          ...item,
          cart_line_id: item.cart_line_id || `${item.id}:${menuSelectionKey(item.selected_options)}`,
        }))
      : [];
  } catch {
    localStorage.removeItem('cart');
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(readInitialCart);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, selection?: MenuSelection) => {
    const cartLineId = `${product.id}:${menuSelectionKey(selection)}`;
    setItems((previousItems) => {
      const existing = previousItems.find((item) => item.cart_line_id === cartLineId);
      if (existing) {
        return previousItems.map((item) =>
          item.cart_line_id === cartLineId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...previousItems, { ...product, selected_options: selection, cart_line_id: cartLineId, quantity: 1 }];
    });
  };

  const removeItem = (cartLineId: string) => {
    setItems((previousItems) => previousItems.filter((item) => item.cart_line_id !== cartLineId));
  };

  const updateQuantity = (cartLineId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(cartLineId);
      return;
    }
    setItems((previousItems) =>
      previousItems.map((item) => (item.cart_line_id === cartLineId ? { ...item, quantity } : item)),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
