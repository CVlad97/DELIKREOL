import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Product } from '../lib/supabase';
import {
  DIRECT_DELIVERY_MULTIPLE_VENDORS_MESSAGE,
  type CartDeliveryOrderMode,
  validateCartVendorRule,
} from '../utils/cartVendorRules';

interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  deliveryOrderMode: CartDeliveryOrderMode;
  setDeliveryOrderMode: (mode: CartDeliveryOrderMode) => void;
  addItem: (product: Product, options?: { replaceCart?: boolean; deliveryOrderMode?: CartDeliveryOrderMode }) => {
    added: boolean;
    message?: string;
  };
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
  const [deliveryOrderMode, setDeliveryOrderModeState] = useState<CartDeliveryOrderMode>(() => {
    const saved = localStorage.getItem('cart_delivery_order_mode');
    return saved === 'livraison_programmee' ? 'livraison_programmee' : 'livraison_directe';
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('cart_delivery_order_mode', deliveryOrderMode);
  }, [deliveryOrderMode]);

  const setDeliveryOrderMode = (nextMode: CartDeliveryOrderMode) => {
    setDeliveryOrderModeState(nextMode);
  };

  const addItem = (product: Product, options?: { replaceCart?: boolean; deliveryOrderMode?: CartDeliveryOrderMode }) => {
    let result = { added: true as boolean, message: undefined as string | undefined };

    setItems((previousItems) => {
      const baseItems = options?.replaceCart ? [] : previousItems;
      const rule = validateCartVendorRule(baseItems, product, options?.deliveryOrderMode || deliveryOrderMode);
      if (!rule.allowed) {
        result = {
          added: false,
          message: rule.message || DIRECT_DELIVERY_MULTIPLE_VENDORS_MESSAGE,
        };
        return previousItems;
      }

      const existing = baseItems.find((item) => item.id === product.id);
      if (existing) {
        return baseItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...baseItems, { ...product, quantity: 1 }];
    });

    return result;
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
      value={{
        items,
        deliveryOrderMode,
        setDeliveryOrderMode,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        total,
        itemCount,
      }}
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
