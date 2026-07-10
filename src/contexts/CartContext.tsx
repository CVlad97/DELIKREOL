import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../lib/supabase';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
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
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
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

  const addItem = (product: Product) => {
    setItems((previousItems) => {
      const existing = previousItems.find((item) => item.id === product.id);
      if (existing) {
        return previousItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...previousItems, { ...product, quantity: 1 }];
    });
  };

  const removeItem = (productId: string) => {
    setItems((previousItems) => previousItems.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    setItems((previousItems) =>
      previousItems.map((item) => (item.id === productId ? { ...item, quantity } : item)),
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
