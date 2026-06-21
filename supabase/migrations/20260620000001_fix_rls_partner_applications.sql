-- =============================================================================
-- DELIKREOL — HOTFIX : Sécurisation RLS partner_applications
-- Ordre correct : 1) admin_users  2) supprimer anciennes policies  3) créer nouvelles
-- =============================================================================
-- PRÉREQUIS : Cette migration suppose que la table partner_applications existe déjà.

-- 1. Créer la table admin_users AVANT les policies qui la référencent
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users (is_active);

-- 2. Supprimer les anciennes policies trop permissives
DROP POLICY IF EXISTS "admin peut tout voir" ON partner_applications;
DROP POLICY IF EXISTS "admin peut modifier" ON partner_applications;
DROP POLICY IF EXISTS "service_role peut insérer" ON partner_applications;

-- 3. Nouvelle policy SELECT : seulement pour les admins (via admin_users ou service_role)
CREATE POLICY "admins_select_partner_applications"
  ON partner_applications
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'service_role'
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 4. Nouvelle policy UPDATE : seulement pour les admins
CREATE POLICY "admins_update_partner_applications"
  ON partner_applications
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'service_role'
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  )
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
    OR EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- 5. Insert public contrôlé via Edge Function (recommandé) :
--    Le formulaire public appelle une Edge Function qui utilise service_role
--    pour insérer sans exposer la table en INSERT.
--    Policy INSERT ci-dessous = sécurité supplémentaire (fallback).
CREATE POLICY "service_role_insert_partner_applications"
  ON partner_applications
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- 6. DELETE : seulement service_role
CREATE POLICY "service_role_delete_partner_applications"
  ON partner_applications
  FOR DELETE
  TO service_role
  USING (true);

-- =============================================================================
-- TESTS DE SÉCURITÉ (à exécuter dans Supabase SQL Editor)
-- =============================================================================
-- TEST 1 : user non-admin → SELECT refusé
-- EXPECTED: 0 rows ou erreur
-- BEGIN;
--   SET LOCAL ROLE authenticated;
--   SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000000';
--   SELECT * FROM partner_applications LIMIT 1;
-- ROLLBACK;

-- TEST 2 : user non-admin → UPDATE refusé
-- EXPECTED: erreur de permission
-- BEGIN;
--   SET LOCAL ROLE authenticated;
--   SET LOCAL request.jwt.claim.sub = '00000000-0000-0000-0000-000000000000';
--   UPDATE partner_applications SET status = 'validated' WHERE id = (SELECT id FROM partner_applications LIMIT 1);
-- ROLLBACK;

-- TEST 3 : admin actif → SELECT autorisé
-- EXPECTED: données visibles
-- BEGIN;
--   INSERT INTO admin_users (user_id, email) VALUES ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'admin@delikreol.mq');
--   SET LOCAL ROLE authenticated;
--   SET LOCAL request.jwt.claim.sub = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
--   SELECT * FROM partner_applications LIMIT 1;
-- ROLLBACK;

-- TEST 4 : admin inactif → SELECT refusé
-- EXPECTED: 0 rows ou erreur
-- BEGIN;
--   INSERT INTO admin_users (user_id, email, is_active) VALUES ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ancien@delikreol.mq', false);
--   SET LOCAL ROLE authenticated;
--   SET LOCAL request.jwt.claim.sub = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
--   SELECT * FROM partner_applications LIMIT 1;
-- ROLLBACK;

-- =============================================================================
-- NOTES POUR L'INSERT PARTENAIRE (flux recommandé)
-- =============================================================================
-- Le flux d'insertion d'une candidature partenaire doit utiliser une Edge Function :
--   1. Frontend envoie les données à /api/apply-partner (Edge Function)
--   2. L'Edge Function valide, nettoie, ajoute anti-spam (rate limiting, captcha)
--   3. L'Edge Function insère avec service_role (contourne RLS)
--   4. Le candidat ne reçoit pas de confirmation de lecture (empêche le scraping)
-- Alternativement, on peut créer une policy INSERT pour anon avec champs stricts :
--   CREATE POLICY "anon_insert_partner_applications"
--     ON partner_applications
--     FOR INSERT
--     TO anon
--     WITH CHECK (
--       name IS NOT NULL
--       AND business_name IS NOT NULL
--       AND phone IS NOT NULL
--       AND commune IS NOT NULL
--       AND activity_type IS NOT NULL
--     );