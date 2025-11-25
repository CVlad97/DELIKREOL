/*
  # AUTO-RÉPARATION DELIKREOL - Logistique Avancée
  
  ## Tables Créées
  - driver_location_history : GPS tracking temps réel
  - delivery_routing : ETA + routes optimisées  
  - delivery_performance : KPIs livraisons
  - compensation_rules : Rémunération transparente
  - payout_calculations : Calculs auto paiements
  - responsibility_matrix : Matrice RACI
  - compliance_checks : Vérifications conformité
  
  ## Sécurité
  - RLS activé partout
  - Policies par rôle
*/

-- GPS TRACKING
CREATE TABLE IF NOT EXISTS driver_location_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
  latitude NUMERIC(10, 8) NOT NULL,
  longitude NUMERIC(11, 8) NOT NULL,
  speed_kmh NUMERIC(5, 2),
  heading_degrees INTEGER CHECK (heading_degrees BETWEEN 0 AND 360),
  accuracy_meters NUMERIC(6, 2),
  battery_level INTEGER CHECK (battery_level BETWEEN 0 AND 100),
  is_moving BOOLEAN DEFAULT TRUE,
  timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_driver_location_driver_time 
  ON driver_location_history(driver_id, timestamp DESC);

ALTER TABLE driver_location_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers insert own location"
  ON driver_location_history FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = driver_id AND drivers.user_id = auth.uid())
  );

CREATE POLICY "Admins view all locations"
  ON driver_location_history FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.user_type = 'admin')
  );

-- ROUTING & ETA
CREATE TABLE IF NOT EXISTS delivery_routing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE UNIQUE NOT NULL,
  route_polyline TEXT,
  route_source TEXT DEFAULT 'waze' CHECK (route_source IN ('waze', 'google', 'osm', 'fallback')),
  estimated_duration_minutes INTEGER NOT NULL,
  estimated_arrival TIMESTAMPTZ NOT NULL,
  actual_arrival TIMESTAMPTZ,
  distance_km NUMERIC(6, 2) NOT NULL,
  traffic_condition TEXT DEFAULT 'moderate' CHECK (traffic_condition IN ('low', 'moderate', 'heavy', 'blocked')),
  recalculated_count INTEGER DEFAULT 0,
  last_update TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_routing_delivery ON delivery_routing(delivery_id);

ALTER TABLE delivery_routing ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view routing for their orders"
  ON delivery_routing FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM deliveries d
      JOIN orders o ON o.id = d.order_id
      WHERE d.id = delivery_routing.delivery_id
      AND (o.customer_id = auth.uid() OR auth.uid() IN (SELECT user_id FROM drivers WHERE id = d.driver_id))
    )
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- PERFORMANCE & KPIs
CREATE TABLE IF NOT EXISTS delivery_performance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID REFERENCES drivers(id) ON DELETE CASCADE NOT NULL,
  delivery_id UUID REFERENCES deliveries(id) ON DELETE CASCADE UNIQUE NOT NULL,
  promised_time TIMESTAMPTZ NOT NULL,
  actual_time TIMESTAMPTZ NOT NULL,
  on_time BOOLEAN NOT NULL,
  delay_minutes INTEGER NOT NULL,
  customer_rating INTEGER CHECK (customer_rating BETWEEN 1 AND 5),
  customer_feedback TEXT,
  quality_score NUMERIC(3, 2) DEFAULT 5.00 CHECK (quality_score BETWEEN 0 AND 5),
  distance_traveled_km NUMERIC(6, 2),
  stops_count INTEGER DEFAULT 1,
  performance_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_delivery_performance_driver ON delivery_performance(driver_id, performance_date DESC);

ALTER TABLE delivery_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Drivers view own performance"
  ON delivery_performance FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM drivers WHERE drivers.id = driver_id AND drivers.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- RÉMUNÉRATION TRANSPARENTE
CREATE TABLE IF NOT EXISTS compensation_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_type TEXT NOT NULL CHECK (role_type IN ('driver', 'vendor', 'relay_host')),
  rule_name TEXT NOT NULL,
  rule_description TEXT,
  base_amount NUMERIC(10, 2) DEFAULT 0,
  commission_rate NUMERIC(5, 4) DEFAULT 0 CHECK (commission_rate >= 0 AND commission_rate <= 1),
  speed_bonus_rate NUMERIC(5, 4) DEFAULT 0,
  quality_bonus_rate NUMERIC(5, 4) DEFAULT 0,
  quality_threshold NUMERIC(3, 2) DEFAULT 4.50,
  volume_tier JSONB DEFAULT '{"tier1": {"min": 0, "max": 10, "bonus": 0}, "tier2": {"min": 11, "max": 50, "bonus": 50}, "tier3": {"min": 51, "max": 999, "bonus": 150}}'::JSONB,
  min_order_value NUMERIC(10, 2) DEFAULT 0,
  applicable_zones TEXT[],
  is_active BOOLEAN DEFAULT TRUE,
  effective_from DATE DEFAULT CURRENT_DATE,
  effective_until DATE,
  priority INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(role_type, rule_name, effective_from)
);

CREATE INDEX IF NOT EXISTS idx_compensation_rules_active ON compensation_rules(role_type, is_active, effective_from DESC);

ALTER TABLE compensation_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone views active rules"
  ON compensation_rules FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins manage rules"
  ON compensation_rules FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- CALCULS PAIEMENTS
CREATE TABLE IF NOT EXISTS payout_calculations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  role_type TEXT NOT NULL CHECK (role_type IN ('driver', 'vendor', 'relay_host')),
  related_order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  related_delivery_id UUID REFERENCES deliveries(id) ON DELETE SET NULL,
  base_amount NUMERIC(10, 2) DEFAULT 0,
  commission_amount NUMERIC(10, 2) DEFAULT 0,
  speed_bonus NUMERIC(10, 2) DEFAULT 0,
  quality_bonus NUMERIC(10, 2) DEFAULT 0,
  volume_bonus NUMERIC(10, 2) DEFAULT 0,
  total_payout NUMERIC(10, 2) NOT NULL,
  calculation_details JSONB NOT NULL,
  applied_rules UUID[] DEFAULT ARRAY[]::UUID[],
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'disputed')),
  paid_at TIMESTAMPTZ,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payout_calculations_user_period ON payout_calculations(user_id, period_end DESC);

ALTER TABLE payout_calculations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payouts"
  ON payout_calculations FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- MATRICE RACI
CREATE TABLE IF NOT EXISTS responsibility_matrix (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  process_name TEXT NOT NULL,
  process_category TEXT CHECK (process_category IN ('order', 'delivery', 'quality', 'payment', 'compliance')),
  task_name TEXT NOT NULL,
  task_description TEXT,
  responsible_role TEXT NOT NULL,
  accountable_role TEXT NOT NULL,
  consulted_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  informed_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  compliance_requirement TEXT,
  regulatory_reference TEXT,
  audit_required BOOLEAN DEFAULT FALSE,
  audit_frequency TEXT,
  expected_duration_minutes INTEGER,
  max_duration_minutes INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(process_name, task_name, version)
);

CREATE INDEX IF NOT EXISTS idx_responsibility_matrix_process ON responsibility_matrix(process_category, is_active);

ALTER TABLE responsibility_matrix ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone views active RACI"
  ON responsibility_matrix FOR SELECT
  TO authenticated
  USING (is_active = TRUE);

CREATE POLICY "Admins manage RACI"
  ON responsibility_matrix FOR ALL
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin'));

-- CONFORMITÉ
CREATE TABLE IF NOT EXISTS compliance_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('vendor', 'driver', 'relay_host')),
  entity_id UUID NOT NULL,
  check_type TEXT NOT NULL CHECK (check_type IN ('sanitary', 'insurance', 'license', 'identity', 'banking')),
  check_name TEXT NOT NULL,
  check_description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'approved', 'rejected', 'expired')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  required_documents TEXT[] NOT NULL,
  uploaded_documents TEXT[],
  document_urls TEXT[],
  valid_from DATE,
  valid_until DATE,
  renewal_required BOOLEAN DEFAULT TRUE,
  admin_notes TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_compliance_checks_entity ON compliance_checks(entity_type, entity_id, status);

ALTER TABLE compliance_checks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own compliance checks"
  ON compliance_checks FOR SELECT
  TO authenticated
  USING (
    (entity_type = 'vendor' AND EXISTS (SELECT 1 FROM vendors WHERE id = entity_id AND user_id = auth.uid()))
    OR (entity_type = 'driver' AND EXISTS (SELECT 1 FROM drivers WHERE id = entity_id AND user_id = auth.uid()))
    OR (entity_type = 'relay_host' AND EXISTS (SELECT 1 FROM relay_point_hosts WHERE id = entity_id AND user_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND user_type = 'admin')
  );

-- FONCTIONS
CREATE OR REPLACE FUNCTION calculate_distance_km(
  lat1 NUMERIC, lon1 NUMERIC,
  lat2 NUMERIC, lon2 NUMERIC
) RETURNS NUMERIC AS $$
DECLARE
  R CONSTANT NUMERIC := 6371;
  dLat NUMERIC;
  dLon NUMERIC;
  a NUMERIC;
  c NUMERIC;
BEGIN
  dLat := radians(lat2 - lat1);
  dLon := radians(lon2 - lon1);
  a := sin(dLat/2) * sin(dLat/2) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dLon/2) * sin(dLon/2);
  c := 2 * atan2(sqrt(a), sqrt(1-a));
  RETURN R * c;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- DONNÉES INITIALES
INSERT INTO compensation_rules (role_type, rule_name, rule_description, base_amount, commission_rate, speed_bonus_rate, quality_bonus_rate) VALUES
('driver', 'Standard Martinique', 'Rémunération standard livreurs', 5.00, 0.10, 0.05, 0.03),
('vendor', 'Commission Plateforme', 'Commission plateforme', 0, 0.15, 0, 0.02),
('relay_host', 'Forfait Point Relais', 'Forfait par colis', 1.50, 0, 0, 0.01)
ON CONFLICT DO NOTHING;

INSERT INTO responsibility_matrix (process_name, process_category, task_name, responsible_role, accountable_role, consulted_roles, informed_roles, compliance_requirement, audit_required) VALUES
('order_creation', 'order', 'Valider adresse livraison', 'platform', 'platform', ARRAY['customer'], ARRAY['vendor'], NULL, FALSE),
('order_preparation', 'order', 'Préparer commande', 'vendor', 'vendor', ARRAY['platform'], ARRAY['customer', 'driver'], 'Normes sanitaires', TRUE),
('delivery_assignment', 'delivery', 'Assigner livreur', 'platform', 'platform', ARRAY['driver'], ARRAY['vendor', 'customer'], NULL, FALSE),
('delivery_execution', 'delivery', 'Livrer commande', 'driver', 'driver', ARRAY[]::TEXT[], ARRAY['platform', 'customer', 'vendor'], NULL, FALSE),
('quality_control', 'quality', 'Vérifier hygiène', 'platform', 'platform', ARRAY['vendor'], ARRAY[]::TEXT[], 'Agrément sanitaire', TRUE),
('payment_processing', 'payment', 'Collecter paiement client', 'platform', 'platform', ARRAY[]::TEXT[], ARRAY['customer'], 'PCI-DSS', FALSE),
('compliance_check', 'compliance', 'Vérifier agrément sanitaire', 'platform', 'platform', ARRAY['vendor'], ARRAY[]::TEXT[], 'Arrêté préfectoral DOM', TRUE)
ON CONFLICT DO NOTHING;
