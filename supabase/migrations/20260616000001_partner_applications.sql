-- =============================================================================
-- DELIKREOL — Migration : table partner_applications pour les candidatures
-- =============================================================================

-- 1. Création de la table partner_applications
CREATE TABLE IF NOT EXISTS partner_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  commune TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'validated')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ
);

-- 2. Index sur le statut (pour filtrage rapide)
CREATE INDEX IF NOT EXISTS idx_partner_applications_status ON partner_applications (status);

-- 3. Row Level Security
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

-- Les admins (via le role service_role dans les triggers / actions serveur) peuvent tout voir
CREATE POLICY "service_role peut insérer"
  ON partner_applications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Les admins authentifiés (via anon key mais depuis admin panel) peuvent lire
CREATE POLICY "admin peut tout voir"
  ON partner_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Les admins peuvent modifier le statut
CREATE POLICY "admin peut modifier"
  ON partner_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);