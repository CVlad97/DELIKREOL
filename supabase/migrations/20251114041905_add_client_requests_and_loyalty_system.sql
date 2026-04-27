/*
  # Ajouter système de demandes clients et points de fidélité

  1. Nouvelles Tables
    - `client_requests` : Demandes/commandes simplifiées des clients (MVP conciergerie)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `address` (text, adresse ou commune)
      - `delivery_preference` (text, "home_delivery" ou "relay_point")
      - `request_details` (text, ce que le client veut commander)
      - `preferred_time` (text, midi/soir/autre)
      - `status` (text, pending_admin_review/in_progress/completed/cancelled)
      - `admin_notes` (text, notes internes admin)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `loyalty_points` : Solde de points de fidélité par utilisateur
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles, unique)
      - `balance` (integer, nombre de points)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `loyalty_events` : Historique des mouvements de points
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to profiles)
      - `amount` (integer, positif pour gain, négatif pour dépense)
      - `reason` (text, description du mouvement)
      - `related_order_id` (uuid, nullable)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on all tables
    - Users can view/create their own requests
    - Users can view their own loyalty points/events
    - Admins can manage everything
*/

-- Create client_requests table
CREATE TABLE IF NOT EXISTS client_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  address text NOT NULL,
  delivery_preference text NOT NULL CHECK (delivery_preference IN ('home_delivery', 'relay_point')),
  request_details text NOT NULL,
  preferred_time text NOT NULL,
  status text NOT NULL DEFAULT 'pending_admin_review' CHECK (status IN ('pending_admin_review', 'in_progress', 'completed', 'cancelled')),
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create loyalty_points table
CREATE TABLE IF NOT EXISTS loyalty_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES profiles(id) ON DELETE CASCADE,
  balance integer NOT NULL DEFAULT 0 CHECK (balance >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create loyalty_events table
CREATE TABLE IF NOT EXISTS loyalty_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount integer NOT NULL,
  reason text NOT NULL,
  related_order_id uuid REFERENCES orders(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_client_requests_user_id ON client_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_client_requests_status ON client_requests(status);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_user_id ON loyalty_points(user_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_events_user_id ON loyalty_events(user_id);

-- Enable RLS
ALTER TABLE client_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_events ENABLE ROW LEVEL SECURITY;

-- Policies for client_requests
CREATE POLICY "Users can view their own requests"
  ON client_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
  ON client_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all requests"
  ON client_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Admins can update all requests"
  ON client_requests FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Policies for loyalty_points
CREATE POLICY "Users can view their own points"
  ON loyalty_points FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage points"
  ON loyalty_points FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Policies for loyalty_events
CREATE POLICY "Users can view their own events"
  ON loyalty_events FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "System can create events"
  ON loyalty_events FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_client_requests_updated_at
  BEFORE UPDATE ON client_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at
  BEFORE UPDATE ON loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
