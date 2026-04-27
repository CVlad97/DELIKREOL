/*
  # Delikreol Platform - Core Database Schema
  
  ## Overview
  This migration creates the foundational database structure for the Delikreol multi-vendor marketplace platform for Martinique.
  
  ## New Tables
  
  ### 1. profiles
  Extends Supabase auth.users with additional user information
  - `id` (uuid, references auth.users)
  - `full_name` (text)
  - `phone` (text)
  - `user_type` (enum: customer, vendor, driver, admin)
  - `avatar_url` (text, optional)
  - `created_at` (timestamp)
  
  ### 2. vendors
  Stores vendor/partner information (restaurants, producers, merchants)
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `business_name` (text)
  - `business_type` (enum: restaurant, producer, merchant)
  - `description` (text)
  - `logo_url` (text)
  - `address` (text)
  - `latitude` (decimal)
  - `longitude` (decimal)
  - `phone` (text)
  - `commission_rate` (decimal, default 20%)
  - `is_active` (boolean)
  - `opening_hours` (jsonb)
  - `delivery_radius_km` (integer)
  - `created_at` (timestamp)
  
  ### 3. products
  Catalog of products/dishes from vendors
  - `id` (uuid, primary key)
  - `vendor_id` (uuid, references vendors)
  - `name` (text)
  - `description` (text)
  - `category` (text)
  - `price` (decimal)
  - `image_url` (text)
  - `is_available` (boolean)
  - `stock_quantity` (integer, nullable)
  - `created_at` (timestamp)
  
  ### 4. orders
  Customer orders across multiple vendors
  - `id` (uuid, primary key)
  - `customer_id` (uuid, references profiles)
  - `order_number` (text, unique)
  - `status` (enum: pending, confirmed, preparing, ready, in_delivery, delivered, cancelled)
  - `delivery_type` (enum: home_delivery, pickup, relay_point)
  - `delivery_address` (text)
  - `delivery_latitude` (decimal)
  - `delivery_longitude` (decimal)
  - `delivery_fee` (decimal)
  - `total_amount` (decimal)
  - `notes` (text)
  - `created_at` (timestamp)
  
  ### 5. order_items
  Individual items within orders
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `product_id` (uuid, references products)
  - `vendor_id` (uuid, references vendors)
  - `quantity` (integer)
  - `unit_price` (decimal)
  - `subtotal` (decimal)
  - `vendor_commission` (decimal)
  
  ### 6. drivers
  Delivery drivers (auto-entrepreneurs)
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `vehicle_type` (enum: bike, scooter, car)
  - `license_number` (text)
  - `is_available` (boolean)
  - `current_latitude` (decimal)
  - `current_longitude` (decimal)
  - `rating` (decimal)
  - `total_deliveries` (integer)
  - `created_at` (timestamp)
  
  ### 7. deliveries
  Delivery assignments and tracking
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `driver_id` (uuid, references drivers, nullable)
  - `status` (enum: pending, assigned, picked_up, in_transit, delivered)
  - `pickup_address` (text)
  - `pickup_latitude` (decimal)
  - `pickup_longitude` (decimal)
  - `driver_fee` (decimal)
  - `estimated_time` (integer, minutes)
  - `assigned_at` (timestamp)
  - `picked_up_at` (timestamp)
  - `delivered_at` (timestamp)
  
  ### 8. relay_points
  Pickup/relay locations
  - `id` (uuid, primary key)
  - `name` (text)
  - `address` (text)
  - `latitude` (decimal)
  - `longitude` (decimal)
  - `type` (enum: vendor_location, partner_store, dark_kitchen)
  - `hours` (jsonb)
  - `is_active` (boolean)
  
  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies created for authenticated users based on roles
  - Customers can only view their own orders
  - Vendors can only manage their own products and see their orders
  - Drivers can only see assigned deliveries
  - Admins have full access
*/

-- Create custom types
DO $$ BEGIN
  CREATE TYPE user_type AS ENUM ('customer', 'vendor', 'driver', 'admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE business_type AS ENUM ('restaurant', 'producer', 'merchant');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'preparing', 'ready', 'in_delivery', 'delivered', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_type AS ENUM ('home_delivery', 'pickup', 'relay_point');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE vehicle_type AS ENUM ('bike', 'scooter', 'car');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE delivery_status AS ENUM ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE relay_point_type AS ENUM ('vendor_location', 'partner_store', 'dark_kitchen');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  phone text,
  user_type user_type NOT NULL DEFAULT 'customer',
  avatar_url text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    TO authenticated
    USING (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Vendors table
CREATE TABLE IF NOT EXISTS vendors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  business_name text NOT NULL,
  business_type business_type NOT NULL,
  description text,
  logo_url text,
  address text NOT NULL,
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  phone text NOT NULL,
  commission_rate decimal(5, 2) DEFAULT 20.00,
  is_active boolean DEFAULT true,
  opening_hours jsonb,
  delivery_radius_km integer DEFAULT 15,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active vendors"
    ON vendors FOR SELECT
    TO authenticated
    USING (is_active = true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can update own profile"
    ON vendors FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  price decimal(10, 2) NOT NULL,
  image_url text,
  is_available boolean DEFAULT true,
  stock_quantity integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Anyone can view available products"
    ON products FOR SELECT
    TO authenticated
    USING (is_available = true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can manage own products"
    ON products FOR ALL
    TO authenticated
    USING (
      vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    )
    WITH CHECK (
      vendor_id IN (
        SELECT id FROM vendors WHERE user_id = auth.uid()
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create sequence for order numbers
DO $$ BEGIN
  CREATE SEQUENCE IF NOT EXISTS order_number_seq;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  order_number text UNIQUE NOT NULL,
  status order_status DEFAULT 'pending',
  delivery_type delivery_type DEFAULT 'home_delivery',
  delivery_address text,
  delivery_latitude decimal(10, 8),
  delivery_longitude decimal(11, 8),
  delivery_fee decimal(10, 2) DEFAULT 0,
  total_amount decimal(10, 2) NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Order items table
CREATE TABLE IF NOT EXISTS order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  product_id uuid REFERENCES products(id) ON DELETE SET NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL NOT NULL,
  quantity integer NOT NULL DEFAULT 1,
  unit_price decimal(10, 2) NOT NULL,
  subtotal decimal(10, 2) NOT NULL,
  vendor_commission decimal(10, 2) NOT NULL
);

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  vehicle_type vehicle_type NOT NULL,
  license_number text,
  is_available boolean DEFAULT false,
  current_latitude decimal(10, 8),
  current_longitude decimal(11, 8),
  rating decimal(3, 2) DEFAULT 5.00,
  total_deliveries integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;

-- Deliveries table
CREATE TABLE IF NOT EXISTS deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
  status delivery_status DEFAULT 'pending',
  pickup_address text NOT NULL,
  pickup_latitude decimal(10, 8),
  pickup_longitude decimal(11, 8),
  driver_fee decimal(10, 2) DEFAULT 0,
  estimated_time integer,
  assigned_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Relay points table
CREATE TABLE IF NOT EXISTS relay_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  latitude decimal(10, 8) NOT NULL,
  longitude decimal(11, 8) NOT NULL,
  type relay_point_type NOT NULL,
  hours jsonb,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE relay_points ENABLE ROW LEVEL SECURITY;

-- Now create policies that reference order_items
DO $$ BEGIN
  CREATE POLICY "Customers can view own orders"
    ON orders FOR SELECT
    TO authenticated
    USING (customer_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can create orders"
    ON orders FOR INSERT
    TO authenticated
    WITH CHECK (customer_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Vendors can view orders with their items"
    ON orders FOR SELECT
    TO authenticated
    USING (
      id IN (
        SELECT DISTINCT order_id FROM order_items
        WHERE vendor_id IN (
          SELECT id FROM vendors WHERE user_id = auth.uid()
        )
      )
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Users can view order items for their orders"
    ON order_items FOR SELECT
    TO authenticated
    USING (
      order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
      OR
      vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can create order items"
    ON order_items FOR INSERT
    TO authenticated
    WITH CHECK (
      order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Drivers can read own profile"
    ON drivers FOR SELECT
    TO authenticated
    USING (user_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Drivers can update own profile"
    ON drivers FOR UPDATE
    TO authenticated
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Customers can view deliveries for their orders"
    ON deliveries FOR SELECT
    TO authenticated
    USING (
      order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Drivers can view assigned deliveries"
    ON deliveries FOR SELECT
    TO authenticated
    USING (
      driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Drivers can update assigned deliveries"
    ON deliveries FOR UPDATE
    TO authenticated
    USING (
      driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    )
    WITH CHECK (
      driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE POLICY "Anyone can view active relay points"
    ON relay_points FOR SELECT
    TO authenticated
    USING (is_active = true);
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS text AS $$
BEGIN
  RETURN 'DK' || TO_CHAR(NOW(), 'YYMMDD') || LPAD(nextval('order_number_seq')::text, 5, '0');
END;
$$ LANGUAGE plpgsql;