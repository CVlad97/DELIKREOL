import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type {
  SimProduct, SimVendor, SimCartItem, SimOrder, SimDriver,
  SimRelayPoint, SimNotification, SimRouteInfo, SimGPS,
  SimOrderStatus, SimDeliveryType,
} from './types';
import { SIM_VENDORS, SIM_PRODUCTS, SIM_DRIVERS, SIM_RELAY_POINTS } from './data';

function generateId() {
  return `sim-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function generateOrderNumber() {
  const n = Math.floor(Math.random() * 900) + 100;
  return `DK-SIM-${n}`;
}

function haversineKm(a: SimGPS, b: SimGPS): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

function buildRouteInfo(origin: SimGPS, destination: SimGPS, label: string): SimRouteInfo {
  const distanceKm = Math.round(haversineKm(origin, destination) * 100) / 100;
  const estimatedMinutes = Math.max(5, Math.ceil((distanceKm / 30) * 60));
  const wazeLink = `https://waze.com/ul?ll=${destination.lat},${destination.lon}&navigate=yes`;
  const googleMapsLink = `https://www.google.com/maps/dir/${origin.lat},${origin.lon}/${destination.lat},${destination.lon}`;
  const whatsappMessage = encodeURIComponent(
    `DELIKREOL - ${label}\n` +
    `Distance: ${distanceKm} km\n` +
    `ETA: ~${estimatedMinutes} min\n` +
    `Waze: ${wazeLink}\n` +
    `Google Maps: ${googleMapsLink}`
  );

  return { origin, destination, distanceKm, estimatedMinutes, wazeLink, googleMapsLink, whatsappMessage };
}

interface SimulationContextValue {
  vendors: SimVendor[];
  products: SimProduct[];
  cart: SimCartItem[];
  orders: SimOrder[];
  drivers: SimDriver[];
  relayPoints: SimRelayPoint[];
  notifications: SimNotification[];
  addToCart: (product: SimProduct) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  placeOrder: (deliveryType: SimDeliveryType, address: string, relayId?: string) => SimOrder;
  confirmOrder: (orderId: string) => void;
  markPreparing: (orderId: string) => void;
  markReady: (orderId: string) => void;
  assignDriver: (orderId: string, driverId: string) => void;
  driverPickUp: (orderId: string) => void;
  driverDeliver: (orderId: string) => void;
  driverDeliverToRelay: (orderId: string) => void;
  clientPickUpFromRelay: (orderId: string) => void;
  getRouteInfo: (origin: SimGPS, destination: SimGPS, label: string) => SimRouteInfo;
  getRelayLoad: (relayId: string) => { totalUsed: number; totalCapacity: number; pct: number };
  dismissNotification: (notifId: string) => void;
}

const SimulationContext = createContext<SimulationContextValue | null>(null);

export function useSimulation() {
  const ctx = useContext(SimulationContext);
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider');
  return ctx;
}

export function SimulationProvider({ children }: { children: ReactNode }) {
  const [vendors] = useState<SimVendor[]>(SIM_VENDORS);
  const [products] = useState<SimProduct[]>(SIM_PRODUCTS);
  const [cart, setCart] = useState<SimCartItem[]>([]);
  const [orders, setOrders] = useState<SimOrder[]>([]);
  const [drivers, setDrivers] = useState<SimDriver[]>(SIM_DRIVERS);
  const [relayPoints, setRelayPoints] = useState<SimRelayPoint[]>(SIM_RELAY_POINTS);
  const [notifications, setNotifications] = useState<SimNotification[]>([]);

  const pushNotif = useCallback((role: SimNotification['role'], message: string, type: SimNotification['type'] = 'info', orderId?: string) => {
    setNotifications(prev => [
      { id: generateId(), role, message, type, timestamp: new Date(), orderId },
      ...prev,
    ]);
  }, []);

  const addToCart = useCallback((product: SimProduct) => {
    setCart(prev => {
      const existing = prev.find(c => c.product.id === product.id);
      if (existing) {
        return prev.map(c => c.product.id === product.id ? { ...c, quantity: c.quantity + 1 } : c);
      }
      return [...prev, { product, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart(prev => prev.filter(c => c.product.id !== productId));
  }, []);

  const updateCartQty = useCallback((productId: string, qty: number) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(c => c.product.id !== productId));
    } else {
      setCart(prev => prev.map(c => c.product.id === productId ? { ...c, quantity: qty } : c));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartTotal = cart.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const placeOrder = useCallback((deliveryType: SimDeliveryType, address: string, relayId?: string) => {
    const vendorId = cart[0]?.product.vendorId;
    const vendor = vendors.find(v => v.id === vendorId);
    const requiresColdChain = cart.some(c => c.product.requiresColdChain);
    const deliveryFee = deliveryType === 'home_delivery' ? 3.50 : deliveryType === 'relay_point' ? 1.50 : 0;
    const total = cartTotal + deliveryFee;

    let deliveryGPS: SimGPS;
    if (deliveryType === 'relay_point' && relayId) {
      const relay = relayPoints.find(r => r.id === relayId);
      deliveryGPS = relay?.gps || { lat: 14.6065, lon: -61.0742 };
    } else if (deliveryType === 'home_delivery') {
      deliveryGPS = { lat: 14.6065 + (Math.random() - 0.5) * 0.02, lon: -61.0742 + (Math.random() - 0.5) * 0.02 };
    } else {
      deliveryGPS = vendor?.gps || { lat: 14.6065, lon: -61.0742 };
    }

    const order: SimOrder = {
      id: generateId(),
      orderNumber: generateOrderNumber(),
      customerName: 'Marie-Jose D.',
      customerPhone: '+596696123456',
      status: 'pending',
      deliveryType,
      deliveryAddress: address,
      deliveryGPS,
      pickupGPS: vendor?.gps || { lat: 14.6065, lon: -61.0742 },
      vendorId: vendorId || '',
      vendorName: vendor?.name || cart[0]?.product.vendorName || '',
      items: cart.map(c => ({
        name: c.product.name,
        qty: c.quantity,
        price: c.product.price,
        requiresColdChain: c.product.requiresColdChain,
      })),
      totalAmount: total,
      deliveryFee,
      assignedDriverId: null,
      assignedRelayId: relayId || null,
      requiresColdChain,
      createdAt: new Date(),
      confirmedAt: null,
      readyAt: null,
      pickedUpAt: null,
      deliveredAt: null,
    };

    setOrders(prev => [order, ...prev]);
    clearCart();
    pushNotif('client', `Commande ${order.orderNumber} passee avec succes !`, 'success', order.id);
    pushNotif('vendor', `Nouvelle commande ${order.orderNumber} recue !`, 'warning', order.id);
    pushNotif('admin', `Nouvelle commande ${order.orderNumber} - ${total.toFixed(2)} EUR`, 'info', order.id);
    return order;
  }, [cart, cartTotal, vendors, relayPoints, clearCart, pushNotif]);

  const updateOrder = useCallback((orderId: string, updates: Partial<SimOrder>) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, ...updates } : o));
  }, []);

  const confirmOrder = useCallback((orderId: string) => {
    updateOrder(orderId, { status: 'confirmed', confirmedAt: new Date() });
    const order = orders.find(o => o.id === orderId);
    pushNotif('client', `Votre commande ${order?.orderNumber} a ete confirmee par le vendeur`, 'success', orderId);
    pushNotif('vendor', `Commande ${order?.orderNumber} confirmee - commencez la preparation`, 'info', orderId);
  }, [orders, updateOrder, pushNotif]);

  const markPreparing = useCallback((orderId: string) => {
    updateOrder(orderId, { status: 'preparing' });
    const order = orders.find(o => o.id === orderId);
    pushNotif('client', `Votre commande ${order?.orderNumber} est en preparation`, 'info', orderId);
  }, [orders, updateOrder, pushNotif]);

  const markReady = useCallback((orderId: string) => {
    updateOrder(orderId, { status: 'ready', readyAt: new Date() });
    const order = orders.find(o => o.id === orderId);
    pushNotif('client', `Votre commande ${order?.orderNumber} est prete !`, 'success', orderId);
    pushNotif('driver', `Course disponible : ${order?.orderNumber} chez ${order?.vendorName}`, 'warning', orderId);
    if (order?.deliveryType === 'relay_point') {
      pushNotif('relay', `Colis ${order?.orderNumber} en attente de depot ${order?.requiresColdChain ? '(FROID)' : ''}`, 'warning', orderId);
    }
  }, [orders, updateOrder, pushNotif]);

  const assignDriver = useCallback((orderId: string, driverId: string) => {
    updateOrder(orderId, { assignedDriverId: driverId });
    setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, available: false } : d));
    const order = orders.find(o => o.id === orderId);
    const driver = drivers.find(d => d.id === driverId);
    pushNotif('client', `Livreur ${driver?.name} assigne a votre commande ${order?.orderNumber}`, 'success', orderId);
    pushNotif('driver', `Vous etes assigne a la commande ${order?.orderNumber}`, 'success', orderId);
    if (order?.requiresColdChain && !driver?.hasColdBox) {
      pushNotif('driver', `ATTENTION: Commande ${order?.orderNumber} necessite un maintien au froid !`, 'warning', orderId);
      pushNotif('admin', `Alerte chaine du froid: livreur ${driver?.name} sans caisse isotherme pour ${order?.orderNumber}`, 'warning', orderId);
    }
  }, [orders, drivers, updateOrder, pushNotif]);

  const driverPickUp = useCallback((orderId: string) => {
    updateOrder(orderId, { status: 'picked_up', pickedUpAt: new Date() });
    const order = orders.find(o => o.id === orderId);
    pushNotif('client', `Votre commande ${order?.orderNumber} a ete recuperee par le livreur`, 'info', orderId);
    pushNotif('vendor', `Commande ${order?.orderNumber} recuperee par le livreur`, 'success', orderId);
  }, [orders, updateOrder, pushNotif]);

  const driverDeliver = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    updateOrder(orderId, { status: 'delivered', deliveredAt: new Date() });
    if (order?.assignedDriverId) {
      setDrivers(prev => prev.map(d =>
        d.id === order.assignedDriverId
          ? { ...d, available: true, todayEarnings: d.todayEarnings + (order.deliveryFee * 0.7), totalDeliveries: d.totalDeliveries + 1 }
          : d
      ));
    }
    pushNotif('client', `Votre commande ${order?.orderNumber} a ete livree ! Bon appetit !`, 'success', orderId);
    pushNotif('vendor', `Commande ${order?.orderNumber} livree avec succes`, 'success', orderId);
    pushNotif('admin', `Commande ${order?.orderNumber} livree - ${order?.totalAmount.toFixed(2)} EUR`, 'success', orderId);
  }, [orders, updateOrder, pushNotif]);

  const driverDeliverToRelay = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    updateOrder(orderId, { status: 'at_relay' });
    if (order?.assignedRelayId) {
      setRelayPoints(prev => prev.map(r => {
        if (r.id !== order.assignedRelayId) return r;
        const storageType = order.requiresColdChain ? 'cold' : 'ambient';
        return {
          ...r,
          depositsWaiting: r.depositsWaiting + 1,
          capacities: r.capacities.map(c =>
            c.storageType === storageType ? { ...c, used: c.used + 1 } : c
          ),
        };
      }));
    }
    if (order?.assignedDriverId) {
      setDrivers(prev => prev.map(d =>
        d.id === order.assignedDriverId
          ? { ...d, available: true, todayEarnings: d.todayEarnings + (order.deliveryFee * 0.7), totalDeliveries: d.totalDeliveries + 1 }
          : d
      ));
    }
    pushNotif('client', `Votre commande ${order?.orderNumber} est disponible au point relais`, 'success', orderId);
    pushNotif('relay', `Colis ${order?.orderNumber} depose ${order?.requiresColdChain ? '- STOCKAGE FROID' : ''}`, 'success', orderId);
    pushNotif('driver', `Depot confirme au relais pour ${order?.orderNumber}`, 'success', orderId);
  }, [orders, updateOrder, pushNotif]);

  const clientPickUpFromRelay = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    updateOrder(orderId, { status: 'delivered', deliveredAt: new Date() });
    if (order?.assignedRelayId) {
      setRelayPoints(prev => prev.map(r => {
        if (r.id !== order.assignedRelayId) return r;
        const storageType = order.requiresColdChain ? 'cold' : 'ambient';
        return {
          ...r,
          depositsWaiting: Math.max(0, r.depositsWaiting - 1),
          todayPickups: r.todayPickups + 1,
          capacities: r.capacities.map(c =>
            c.storageType === storageType ? { ...c, used: Math.max(0, c.used - 1) } : c
          ),
        };
      }));
    }
    pushNotif('client', `Retrait confirme pour ${order?.orderNumber} ! Merci !`, 'success', orderId);
    pushNotif('relay', `Colis ${order?.orderNumber} retire par le client`, 'info', orderId);
  }, [orders, updateOrder, pushNotif]);

  const getRouteInfo = useCallback((origin: SimGPS, destination: SimGPS, label: string) => {
    return buildRouteInfo(origin, destination, label);
  }, []);

  const getRelayLoad = useCallback((relayId: string) => {
    const relay = relayPoints.find(r => r.id === relayId);
    if (!relay) return { totalUsed: 0, totalCapacity: 0, pct: 0 };
    const totalUsed = relay.capacities.reduce((s, c) => s + c.used, 0);
    const totalCapacity = relay.capacities.reduce((s, c) => s + c.total, 0);
    return { totalUsed, totalCapacity, pct: totalCapacity > 0 ? Math.round((totalUsed / totalCapacity) * 100) : 0 };
  }, [relayPoints]);

  const dismissNotification = useCallback((notifId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  }, []);

  return (
    <SimulationContext.Provider value={{
      vendors, products, cart, orders, drivers, relayPoints, notifications,
      addToCart, removeFromCart, updateCartQty, clearCart, cartTotal, cartCount,
      placeOrder, confirmOrder, markPreparing, markReady, assignDriver,
      driverPickUp, driverDeliver, driverDeliverToRelay, clientPickUpFromRelay,
      getRouteInfo, getRelayLoad, dismissNotification,
    }}>
      {children}
    </SimulationContext.Provider>
  );
}
