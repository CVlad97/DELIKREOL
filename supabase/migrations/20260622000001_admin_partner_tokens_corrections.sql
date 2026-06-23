-- =============================================================================
-- DELIKREOL — Accès admin Vladimir + table partner_access_tokens + corrections
-- =============================================================================

-- 1. S'assurer que admin_users existe (déjà créé dans migration précédente)
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Table partner_access_tokens (remplace PARTNER_CODES hardcodés)
CREATE TABLE IF NOT EXISTS partner_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT NOT NULL,
  partner_name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '30 days'),
  used_count INT NOT NULL DEFAULT 0,
  max_uses INT NOT NULL DEFAULT 100,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pat_token ON partner_access_tokens (token_hash);
CREATE INDEX IF NOT EXISTS idx_pat_active ON partner_access_tokens (is_active);

-- RLS : lecture par service_role uniquement (pas de lecture front)
ALTER TABLE partner_access_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_full_access_pat"
  ON partner_access_tokens
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- 3. Table partner_corrections (sauvegarde corrections partenaires)
CREATE TABLE IF NOT EXISTS partner_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT NOT NULL,
  responsable TEXT,
  telephone TEXT,
  email TEXT,
  commune TEXT,
  description TEXT,
  horaires TEXT,
  modes TEXT,
  plats TEXT,
  prix TEXT,
  compositions TEXT,
  allergenes TEXT,
  remarques TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'applied')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE partner_corrections ENABLE ROW LEVEL SECURITY;

-- Insert public (les partenaires peuvent soumettre sans login)
CREATE POLICY "anon_insert_partner_corrections"
  ON partner_corrections
  FOR INSERT
  TO anon
  WITH CHECK (
    partner_id IS NOT NULL
    AND responsable IS NOT NULL
  );

-- Lecture admin uniquement
CREATE POLICY "admin_select_partner_corrections"
  ON partner_corrections
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND is_active = true)
  );

-- 4. Table pilot_test_feedback (bugs de test)
CREATE TABLE IF NOT EXISTS pilot_test_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page TEXT NOT NULL,
  message TEXT NOT NULL,
  telephone TEXT,
  user_type TEXT DEFAULT 'testeur',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE pilot_test_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_insert_pilot_feedback"
  ON pilot_test_feedback
  FOR INSERT
  TO anon
  WITH CHECK (message IS NOT NULL AND page IS NOT NULL);

CREATE POLICY "admin_select_pilot_feedback"
  ON pilot_test_feedback
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM admin_users WHERE admin_users.user_id = auth.uid() AND is_active = true)
  );

-- NOTE POST-DEPLOY :
-- Exécuter manuellement dans Supabase SQL Editor :
-- INSERT INTO admin_users (user_id, email)
-- SELECT id, email FROM auth.users WHERE email = 'vladimir.claveau@gmail.com'
-- ON CONFLICT (user_id) DO NOTHING;
--
-- UPDATE profiles SET user_type = 'admin' WHERE id = (
--   SELECT id FROM auth.users WHERE email = 'vladimir.claveau@gmail.com'
-- );