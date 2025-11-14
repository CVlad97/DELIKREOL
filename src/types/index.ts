export type UserType = 'customer' | 'vendor' | 'driver' | 'relay_host' | 'admin';
export type BusinessType = 'restaurant' | 'producer' | 'merchant';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_delivery' | 'delivered' | 'cancelled';
export type DeliveryType = 'home_delivery' | 'pickup' | 'relay_point';
export type VehicleType = 'bike' | 'scooter' | 'car';
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';
export type StorageType = 'cold' | 'hot' | 'dry' | 'frozen';
export type DepositStatus = 'awaiting_deposit' | 'deposited' | 'picked_up' | 'expired';
export type PaymentStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
export type CompensationType = 'per_pickup' | 'per_storage' | 'percentage';

export interface Profile {
  id: string;
  full_name: string;
  phone?: string;
  user_type: UserType;
  avatar_url?: string;
  created_at: string;
}

export interface Vendor {
  id: string;
  user_id: string;
  business_name: string;
  business_type: BusinessType;
  description: string | null;
  logo_url: string | null;
  address: string;
  latitude: number | null;
  longitude: number | null;
  phone: string;
  commission_rate: number;
  is_active: boolean;
  opening_hours: Record<string, any> | null;
  delivery_radius_km: number;
  created_at: string;
}

export interface Product {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  image_url: string | null;
  is_available: boolean;
  stock_quantity: number | null;
  created_at: string;
  vendor?: Vendor;
}

export interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: OrderStatus;
  delivery_type: DeliveryType;
  delivery_address?: string;
  delivery_latitude?: number;
  delivery_longitude?: number;
  delivery_fee: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  items?: OrderItem[];
  delivery?: Delivery;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  vendor_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  vendor_commission: number;
  product?: Product;
}

export interface Driver {
  id: string;
  user_id: string;
  vehicle_type: VehicleType;
  license_number?: string;
  is_available: boolean;
  current_latitude?: number;
  current_longitude?: number;
  rating: number;
  total_deliveries: number;
  created_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  driver_id?: string;
  status: DeliveryStatus;
  pickup_address: string;
  pickup_latitude?: number;
  pickup_longitude?: number;
  driver_fee: number;
  estimated_time?: number;
  assigned_at?: string;
  picked_up_at?: string;
  delivered_at?: string;
  created_at: string;
  driver?: Driver;
  order?: Order;
}

export interface RelayPoint {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  type: string;
  hours?: Record<string, any>;
  is_active: boolean;
  owner_id?: string;
  capacity_notes?: string;
  parking_available: boolean;
  pmr_accessible: boolean;
  security_notes?: string;
  rating: number;
  total_pickups: number;
  created_at: string;
  storage_capacities?: StorageCapacity[];
  distance?: number;
}

export interface RelayPointHost {
  id: string;
  user_id: string;
  relay_point_id?: string;
  business_name?: string;
  identity_verified: boolean;
  sanitary_compliance: boolean;
  compensation_type: CompensationType;
  compensation_amount: number;
  bank_account_verified: boolean;
  rating: number;
  total_pickups: number;
  created_at: string;
  relay_point?: RelayPoint;
}

export interface StorageCapacity {
  id: string;
  relay_point_id: string;
  storage_type: StorageType;
  total_capacity: number;
  current_usage: number;
  temperature_min?: number;
  temperature_max?: number;
  equipment_type?: string;
  updated_at: string;
}

export interface RelayPointDeposit {
  id: string;
  order_id: string;
  relay_point_id: string;
  vendor_id?: string;
  deposited_by?: string;
  deposit_qr_code: string;
  pickup_qr_code: string;
  storage_type: StorageType;
  deposited_at?: string;
  picked_up_at?: string;
  picked_up_by?: string;
  status: DepositStatus;
  created_at: string;
  relay_point?: RelayPoint;
  order?: Order;
}

export interface DeliveryZone {
  id: string;
  name: string;
  zone_polygon?: any;
  is_active: boolean;
  priority: number;
  base_delivery_fee: number;
  estimated_time_minutes: number;
  restrictions?: Record<string, any>;
  created_at: string;
}

export interface Payment {
  id: string;
  order_id: string;
  stripe_payment_intent_id?: string;
  total_amount: number;
  vendor_amount: number;
  driver_amount: number;
  relay_point_amount: number;
  platform_commission: number;
  status: PaymentStatus;
  paid_at?: string;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}
