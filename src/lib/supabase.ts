import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured =
  typeof supabaseUrl === 'string' &&
  supabaseUrl.length > 0 &&
  typeof supabaseAnonKey === 'string' &&
  supabaseAnonKey.length > 0;

let client: SupabaseClient;

if (isSupabaseConfigured) {
  client = createClient(supabaseUrl!, supabaseAnonKey!);
} else {
  console.warn(
    '[DELIKREOL] Supabase non configuré. Définissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY pour activer les données.'
  );

  // @ts-expect-error - client minimal pour éviter les crashs
  client = {
    from() {
      throw new Error(
        'Supabase non configuré : veuillez définir VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
      );
    },
    functions: {
      invoke() {
        throw new Error(
          'Supabase non configuré : fonctions indisponibles.'
        );
      },
    },
    auth: {
      getUser() {
        return Promise.reject(
          new Error('Supabase non configuré : auth indisponible.')
        );
      },
      getSession() {
        return Promise.resolve({ data: { session: null }, error: null });
      },
      onAuthStateChange() {
        return {
          data: { subscription: { unsubscribe: () => {} } },
        };
      },
      signUp() {
        return Promise.reject(
          new Error('Supabase non configuré : auth indisponible.')
        );
      },
      signInWithPassword() {
        return Promise.reject(
          new Error('Supabase non configuré : auth indisponible.')
        );
      },
      signOut() {
        return Promise.reject(
          new Error('Supabase non configuré : auth indisponible.')
        );
      },
    },
  };
}

export const supabase = client;

export type UserType = 'customer' | 'vendor' | 'driver' | 'admin';
export type BusinessType = 'restaurant' | 'producer' | 'merchant';
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in_delivery' | 'delivered' | 'cancelled';
export type DeliveryType = 'home_delivery' | 'pickup' | 'relay_point';
export type VehicleType = 'bike' | 'scooter' | 'car';
export type DeliveryStatus = 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered';

export interface Profile {
  id: string;
  full_name: string;
  phone: string | null;
  user_type: UserType;
  avatar_url: string | null;
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
  delivery_address: string | null;
  delivery_latitude: number | null;
  delivery_longitude: number | null;
  delivery_fee: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
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
  license_number: string | null;
  is_available: boolean;
  current_latitude: number | null;
  current_longitude: number | null;
  rating: number;
  total_deliveries: number;
  created_at: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  driver_id: string | null;
  status: DeliveryStatus;
  pickup_address: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  driver_fee: number;
  estimated_time: number | null;
  assigned_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  created_at: string;
}
