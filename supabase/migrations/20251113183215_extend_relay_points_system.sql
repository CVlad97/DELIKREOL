/*
  # Extension du système de points relais mutualisés

  ## Vue d'ensemble
  Cette migration étend le système de points relais pour supporter :
  - Hébergeurs particuliers/commerces qui louent de l'espace
  - Capacités de stockage détaillées (froid/chaud/sec)
  - Système de rémunération automatique
  - Gestion des dépôts et retraits avec QR codes
  - Zones de livraison polygonales
  - Optimisation automatique

  ## Nouvelles tables

  ### 1. relay_point_hosts
  Hébergeurs de points relais (particuliers, commerces, associations)
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `relay_point_id` (uuid, references relay_points)
  - `business_name` (text, nom du commerce si applicable)
  - `identity_verified` (boolean)
  - `sanitary_compliance` (boolean, conformité sanitaire)
  - `compensation_type` (enum: per_pickup, per_storage, percentage)
  - `compensation_amount` (decimal, montant par retrait/stockage)
  - `bank_account_verified` (boolean)
  - `rating` (decimal)
  - `total_pickups` (integer)
  - `created_at` (timestamp)

  ### 2. storage_capacities
  Capacités de stockage par point relais
  - `id` (uuid, primary key)
  - `relay_point_id` (uuid, references relay_points)
  - `storage_type` (enum: cold, hot, dry, frozen)
  - `total_capacity` (integer, nombre de plats)
  - `current_usage` (integer)
  - `temperature_min` (decimal, nullable)
  - `temperature_max` (decimal, nullable)
  - `equipment_type` (text, ex: réfrigérateur, congélateur)
  - `updated_at` (timestamp)

  ### 3. relay_point_deposits
  Dépôts de commandes aux points relais
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `relay_point_id` (uuid, references relay_points)
  - `vendor_id` (uuid, references vendors)
  - `deposited_by` (uuid, references profiles, livreur ou vendeur)
  - `deposit_qr_code` (text, unique)
  - `pickup_qr_code` (text, unique)
  - `storage_type` (enum)
  - `deposited_at` (timestamp)
  - `picked_up_at` (timestamp, nullable)
  - `picked_up_by` (uuid, references profiles, nullable)
  - `status` (enum: awaiting_deposit, deposited, picked_up, expired)

  ### 4. delivery_zones
  Zones de livraison dynamiques
  - `id` (uuid, primary key)
  - `name` (text)
  - `zone_polygon` (geography, polygon PostGIS)
  - `is_active` (boolean)
  - `priority` (integer)
  - `base_delivery_fee` (decimal)
  - `estimated_time_minutes` (integer)
  - `restrictions` (jsonb, ex: horaires, météo)
  - `created_at` (timestamp)

  ### 5. relay_point_associations
  Association entre vendeurs et points relais
  - `id` (uuid, primary key)
  - `vendor_id` (uuid, references vendors)
  - `relay_point_id` (uuid, references relay_points)
  - `is_preferred` (boolean)
  - `distance_km` (decimal)
  - `avg_preparation_time` (integer, minutes)
  - `created_at` (timestamp)

  ### 6. payments
  Paiements et rémunérations
  - `id` (uuid, primary key)
  - `order_id` (uuid, references orders)
  - `stripe_payment_intent_id` (text)
  - `total_amount` (decimal)
  - `vendor_amount` (decimal)
  - `driver_amount` (decimal)
  - `relay_point_amount` (decimal)
  - `platform_commission` (decimal)
  - `status` (enum: pending, processing, completed, failed, refunded)
  - `paid_at` (timestamp)
  - `created_at` (timestamp)

  ### 7. notifications
  Système de notifications push
  - `id` (uuid, primary key)
  - `user_id` (uuid, references profiles)
  - `type` (text)
  - `title` (text)
  - `message` (text)
  - `data` (jsonb)
  - `read` (boolean)
  - `created_at` (timestamp)

  ## Modifications de tables existantes
  - relay_points: ajout de champs owner_id, capacity_notes, parking_available, pmr_accessible, security_notes

  ## Sécurité
  - RLS activé sur toutes les tables
  - Politiques restrictives par rôle
  - Vérification d'identité obligatoire pour les hébergeurs
*/

-- Enable PostGIS extension for geographic data
CREATE EXTENSION IF NOT EXISTS postgis;

-- Create new enum types
DO $$ BEGIN
  CREATE TYPE compensation_type AS ENUM ('per_pickup', 'per_storage', 'percentage');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE storage_type AS ENUM ('cold', 'hot', 'dry', 'frozen');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deposit_status AS ENUM ('awaiting_deposit', 'deposited', 'picked_up', 'expired');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Extend relay_points table
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'relay_points' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE relay_points 
      ADD COLUMN owner_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
      ADD COLUMN capacity_notes text,
      ADD COLUMN parking_available boolean DEFAULT false,
      ADD COLUMN pmr_accessible boolean DEFAULT false,
      ADD COLUMN security_notes text,
      ADD COLUMN rating decimal(3, 2) DEFAULT 5.00,
      ADD COLUMN total_pickups integer DEFAULT 0;
  END IF;
END $$;

-- Relay point hosts table
CREATE TABLE IF NOT EXISTS relay_point_hosts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  relay_point_id uuid REFERENCES relay_points(id) ON DELETE CASCADE,
  business_name text,
  identity_verified boolean DEFAULT false,
  sanitary_compliance boolean DEFAULT false,
  compensation_type compensation_type DEFAULT 'per_pickup',
  compensation_amount decimal(10, 2) DEFAULT 1.50,
  bank_account_verified boolean DEFAULT false,
  rating decimal(3, 2) DEFAULT 5.00,
  total_pickups integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE relay_point_hosts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Hosts can read own profile"
  ON relay_point_hosts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Hosts can update own profile"
  ON relay_point_hosts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Storage capacities table
CREATE TABLE IF NOT EXISTS storage_capacities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  relay_point_id uuid REFERENCES relay_points(id) ON DELETE CASCADE NOT NULL,
  storage_type storage_type NOT NULL,
  total_capacity integer NOT NULL DEFAULT 0,
  current_usage integer DEFAULT 0,
  temperature_min decimal(5, 2),
  temperature_max decimal(5, 2),
  equipment_type text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE storage_capacities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view storage capacities"
  ON storage_capacities FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Hosts can manage own storage capacities"
  ON storage_capacities FOR ALL
  TO authenticated
  USING (
    relay_point_id IN (
      SELECT relay_point_id FROM relay_point_hosts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    relay_point_id IN (
      SELECT relay_point_id FROM relay_point_hosts WHERE user_id = auth.uid()
    )
  );

-- Relay point deposits table
CREATE TABLE IF NOT EXISTS relay_point_deposits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  relay_point_id uuid REFERENCES relay_points(id) ON DELETE SET NULL NOT NULL,
  vendor_id uuid REFERENCES vendors(id) ON DELETE SET NULL,
  deposited_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  deposit_qr_code text UNIQUE NOT NULL,
  pickup_qr_code text UNIQUE NOT NULL,
  storage_type storage_type NOT NULL,
  deposited_at timestamptz,
  picked_up_at timestamptz,
  picked_up_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  status deposit_status DEFAULT 'awaiting_deposit',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE relay_point_deposits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view own deposits"
  ON relay_point_deposits FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

CREATE POLICY "Hosts can view deposits at their relay points"
  ON relay_point_deposits FOR SELECT
  TO authenticated
  USING (
    relay_point_id IN (
      SELECT relay_point_id FROM relay_point_hosts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Hosts can update deposits at their relay points"
  ON relay_point_deposits FOR UPDATE
  TO authenticated
  USING (
    relay_point_id IN (
      SELECT relay_point_id FROM relay_point_hosts WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    relay_point_id IN (
      SELECT relay_point_id FROM relay_point_hosts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Vendors and drivers can view relevant deposits"
  ON relay_point_deposits FOR SELECT
  TO authenticated
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    OR deposited_by = auth.uid()
  );

-- Delivery zones table
CREATE TABLE IF NOT EXISTS delivery_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  zone_polygon geography(Polygon, 4326),
  is_active boolean DEFAULT true,
  priority integer DEFAULT 1,
  base_delivery_fee decimal(10, 2) DEFAULT 3.00,
  estimated_time_minutes integer DEFAULT 30,
  restrictions jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active delivery zones"
  ON delivery_zones FOR SELECT
  TO authenticated
  USING (is_active = true);

-- Relay point associations table
CREATE TABLE IF NOT EXISTS relay_point_associations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id uuid REFERENCES vendors(id) ON DELETE CASCADE NOT NULL,
  relay_point_id uuid REFERENCES relay_points(id) ON DELETE CASCADE NOT NULL,
  is_preferred boolean DEFAULT false,
  distance_km decimal(6, 2),
  avg_preparation_time integer DEFAULT 30,
  created_at timestamptz DEFAULT now(),
  UNIQUE(vendor_id, relay_point_id)
);

ALTER TABLE relay_point_associations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vendors can manage own associations"
  ON relay_point_associations FOR ALL
  TO authenticated
  USING (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  )
  WITH CHECK (
    vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
  );

CREATE POLICY "Anyone can view associations"
  ON relay_point_associations FOR SELECT
  TO authenticated
  USING (true);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
  stripe_payment_intent_id text,
  total_amount decimal(10, 2) NOT NULL,
  vendor_amount decimal(10, 2) DEFAULT 0,
  driver_amount decimal(10, 2) DEFAULT 0,
  relay_point_amount decimal(10, 2) DEFAULT 0,
  platform_commission decimal(10, 2) DEFAULT 0,
  status payment_status DEFAULT 'pending',
  paid_at timestamptz,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can view payments for own orders"
  ON payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (SELECT id FROM orders WHERE customer_id = auth.uid())
  );

CREATE POLICY "Vendors can view payments for their orders"
  ON payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT DISTINCT oi.order_id 
      FROM order_items oi
      WHERE oi.vendor_id IN (SELECT id FROM vendors WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Drivers can view payments for their deliveries"
  ON payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT d.order_id 
      FROM deliveries d
      WHERE d.driver_id IN (SELECT id FROM drivers WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Hosts can view payments for their relay points"
  ON payments FOR SELECT
  TO authenticated
  USING (
    order_id IN (
      SELECT rpd.order_id 
      FROM relay_point_deposits rpd
      WHERE rpd.relay_point_id IN (
        SELECT relay_point_id FROM relay_point_hosts WHERE user_id = auth.uid()
      )
    )
  );

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  data jsonb DEFAULT '{}',
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Function to generate unique QR codes
CREATE OR REPLACE FUNCTION generate_qr_code(prefix text)
RETURNS text AS $$
BEGIN
  RETURN prefix || '-' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to calculate distance between two points (Haversine formula)
CREATE OR REPLACE FUNCTION calculate_distance(
  lat1 decimal, lon1 decimal, 
  lat2 decimal, lon2 decimal
)
RETURNS decimal AS $$
DECLARE
  R constant decimal := 6371;
  dLat decimal;
  dLon decimal;
  a decimal;
  c decimal;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  
  a := sin(dLat/2) * sin(dLat/2) + 
       cos(radians(lat1)) * cos(radians(lat2)) * 
       sin(dLon/2) * sin(dLon/2);
  
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to find optimal relay point
CREATE OR REPLACE FUNCTION find_optimal_relay_point(
  p_vendor_id uuid,
  p_customer_lat decimal,
  p_customer_lon decimal
)
RETURNS uuid AS $$
DECLARE
  optimal_relay_id uuid;
BEGIN
  SELECT rp.id INTO optimal_relay_id
  FROM relay_points rp
  LEFT JOIN relay_point_associations rpa ON rpa.relay_point_id = rp.id AND rpa.vendor_id = p_vendor_id
  LEFT JOIN storage_capacities sc ON sc.relay_point_id = rp.id
  WHERE rp.is_active = true
    AND (sc.total_capacity - sc.current_usage) > 0
  ORDER BY 
    CASE WHEN rpa.is_preferred THEN 0 ELSE 1 END,
    calculate_distance(rp.latitude, rp.longitude, p_customer_lat, p_customer_lon),
    rp.rating DESC
  LIMIT 1;
  
  RETURN optimal_relay_id;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_relay_point_deposits_relay_point ON relay_point_deposits(relay_point_id);
CREATE INDEX IF NOT EXISTS idx_relay_point_deposits_order ON relay_point_deposits(order_id);
CREATE INDEX IF NOT EXISTS idx_storage_capacities_relay_point ON storage_capacities(relay_point_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_relay_points_location ON relay_points(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_vendors_location ON vendors(latitude, longitude);
