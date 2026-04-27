export type SimOrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked_up' | 'in_transit' | 'at_relay' | 'delivered';
export type SimDeliveryType = 'home_delivery' | 'relay_point' | 'pickup';
export type SimStorageType = 'cold' | 'ambient' | 'frozen';

export interface SimGPS {
  lat: number;
  lon: number;
}

export interface SimProduct {
  id: string;
  vendorId: string;
  vendorName: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
  stock: number;
  imageEmoji: string;
  requiresColdChain: boolean;
  storageType: SimStorageType;
}

export interface SimVendor {
  id: string;
  name: string;
  type: 'restaurant' | 'producer' | 'merchant';
  address: string;
  phone: string;
  gps: SimGPS;
  rating: number;
  active: boolean;
}

export interface SimCartItem {
  product: SimProduct;
  quantity: number;
}

export interface SimOrderItem {
  name: string;
  qty: number;
  price: number;
  requiresColdChain: boolean;
}

export interface SimOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  status: SimOrderStatus;
  deliveryType: SimDeliveryType;
  deliveryAddress: string;
  deliveryGPS: SimGPS;
  pickupGPS: SimGPS;
  vendorId: string;
  vendorName: string;
  items: SimOrderItem[];
  totalAmount: number;
  deliveryFee: number;
  assignedDriverId: string | null;
  assignedRelayId: string | null;
  requiresColdChain: boolean;
  createdAt: Date;
  confirmedAt: Date | null;
  readyAt: Date | null;
  pickedUpAt: Date | null;
  deliveredAt: Date | null;
}

export interface SimDriver {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'bike' | 'scooter' | 'car';
  available: boolean;
  gps: SimGPS;
  rating: number;
  totalDeliveries: number;
  todayEarnings: number;
  hasColdBox: boolean;
}

export interface SimRelayCapacity {
  storageType: SimStorageType;
  total: number;
  used: number;
  temperatureRange: string;
}

export interface SimRelayPoint {
  id: string;
  name: string;
  address: string;
  gps: SimGPS;
  active: boolean;
  capacities: SimRelayCapacity[];
  depositsWaiting: number;
  todayPickups: number;
  openHours: string;
}

export interface SimNotification {
  id: string;
  role: 'client' | 'vendor' | 'driver' | 'relay' | 'admin';
  message: string;
  type: 'info' | 'success' | 'warning';
  timestamp: Date;
  orderId?: string;
}

export interface SimRouteInfo {
  origin: SimGPS;
  destination: SimGPS;
  distanceKm: number;
  estimatedMinutes: number;
  wazeLink: string;
  googleMapsLink: string;
  whatsappMessage: string;
}
