-- =============================================================================
-- DELIKREOL — Migration Stripe Connect : tables, RLS, idempotence
-- =============================================================================

-- 1. Ajout des colonnes Stripe Connect sur partners
ALTER TABLE partners ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS stripe_status TEXT DEFAULT 'inactive';
ALTER TABLE partners ADD COLUMN IF NOT EXISTS charges_enabled BOOLEAN DEFAULT false;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS payouts_enabled BOOLEAN DEFAULT false;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS details_submitted BOOLEAN DEFAULT false;
ALTER TABLE partners ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 2. Ajout des colonnes Stripe Connect sur drivers
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS stripe_connect_account_id TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS stripe_account_id TEXT;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS stripe_status TEXT DEFAULT 'inactive';
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT false;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS details_submitted BOOLEAN DEFAULT false;
ALTER TABLE drivers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- 3. Ajout des colonnes paiement sur orders
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending'
  CHECK (payment_status IN ('pending','paid','failed','refunded','cancelled'));
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_error TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS vendor_stripe_account_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS application_fee_cents INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS transfer_id TEXT;

-- 4. Ajout des colonnes livraison sur orders (pour metadata Stripe)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_fee_cents INTEGER DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS sub_total_cents INTEGER;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_cents INTEGER;

-- 5. Table stripe_webhook_events (idempotence base de données)
CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Table payouts
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_transfer_id TEXT UNIQUE,
  stripe_account_id TEXT,
  order_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','completed','failed')),
  description TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Table payments (historique complet)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT NOT NULL,
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'eur',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','succeeded','failed','refunded','cancelled')),
  vendor_stripe_account_id TEXT,
  application_fee_cents INTEGER,
  transfer_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- =============================================================================
-- RLS (Row Level Security)
-- =============================================================================

-- Enable RLS sur toutes les tables
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- 1. payouts : admin only
DROP POLICY IF EXISTS "payouts_admin_all" ON payouts;
CREATE POLICY "payouts_admin_all" ON payouts
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 2. payments : admin only
DROP POLICY IF EXISTS "payments_admin_all" ON payments;
CREATE POLICY "payments_admin_all" ON payments
  FOR ALL USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- 3. stripe_webhook_events : service_role only (jamais côté client)
DROP POLICY IF EXISTS "stripe_webhook_events_service" ON stripe_webhook_events;
CREATE POLICY "stripe_webhook_events_service" ON stripe_webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- 4. orders : admin voit tout, client voit ses propres commandes
DROP POLICY IF EXISTS "orders_select" ON orders;
CREATE POLICY "orders_select" ON orders
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    client_phone = (SELECT phone FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "orders_update_payment" ON orders;
CREATE POLICY "orders_update_payment" ON orders
  FOR UPDATE USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- 5. partners : admin voit tout, partenaire voit son propre profil
DROP POLICY IF EXISTS "partners_select" ON partners;
CREATE POLICY "partners_select" ON partners
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "partners_update_own" ON partners;
CREATE POLICY "partners_update_own" ON partners
  FOR UPDATE USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- 6. drivers : admin voit tout, livreur voit son propre profil
DROP POLICY IF EXISTS "drivers_select" ON drivers;
CREATE POLICY "drivers_select" ON drivers
  FOR SELECT USING (
    auth.role() = 'service_role' OR
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin') OR
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "drivers_update_own" ON drivers;
CREATE POLICY "drivers_update_own" ON drivers
  FOR UPDATE USING (
    email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- =============================================================================
-- Indexes
-- =============================================================================
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON orders(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payouts_order_id ON payouts(order_id);
CREATE INDEX IF NOT EXISTS idx_partners_stripe_account ON partners(stripe_connect_account_id);
CREATE INDEX IF NOT EXISTS idx_drivers_stripe_account ON drivers(stripe_connect_account_id);
