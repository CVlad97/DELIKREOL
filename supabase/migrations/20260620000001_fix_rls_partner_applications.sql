-- =============================================================================
-- DELIKREOL — HOTFIX : Sécurisation RLS partner_applications
-- Problème : les politiques autorisaient tout utilisateur authenticated
-- à lire/modifier les candidatures sans filtre admin.
-- Correctif : on restreint aux admins, et on autorise l'insert public
-- via une policy WITH CHECK contrôlée (pas d'accès en lecture).
-- =============================================================================

-- 1. Supprimer les anciennes policies trop permissives
DROP POLICY IF EXISTS "admin peut tout voir" ON partner_applications;
DROP POLICY IF EXISTS "admin peut modifier" ON partner_applications;

-- 2. Nouvelle policy SELECT : seulement pour les admins
-- Les admins sont identifiés via une table admin_users ou un claim custom
-- Ici on utilise une approche simple : vérifier que l'UID est dans la table
-- des administrateurs (à créer si nécessaire).
-- Fallback : utiliser le role service_role pour les opérations admin depuis
-- les Edge Functions ou le dashboard.
CREATE POLICY "admins_select_partner_applications"
  ON partner_applications
  FOR SELECT
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'service_role'
    OR auth.uid() IN (
      SELECT user_id FROM admin_users WHERE is_active = true
    )
  );

-- 3. Nouvelle policy UPDATE : seulement pour les admins
CREATE POLICY "admins_update_partner_applications"
  ON partner_applications
  FOR UPDATE
  TO authenticated
  USING (
    auth.jwt()->>'role' = 'service_role'
    OR auth.uid() IN (
      SELECT user_id FROM admin_users WHERE is_active = true
    )
  )
  WITH CHECK (
    auth.jwt()->>'role' = 'service_role'
    OR auth.uid() IN (
      SELECT user_id FROM admin_users WHERE is_active = true
    )
  );

-- 4. Insert public contrôlé : les candidats peuvent POST leur dossier
-- mais ne voient jamais les autres candidatures.
-- Le check est minimal : on vérifie juste que l'insert est fait par un
-- utilisateur authentifié (le candidat lui-même via le formulaire public).
-- Les données sensibles (email, phone) ne peuvent pas être lues.
CREATE POLICY "public_insert_partner_applications"
  ON partner_applications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- 5. DELETE : seulement service_role (presque jamais utilisé)
CREATE POLICY "service_role_delete_partner_applications"
  ON partner_applications
  FOR DELETE
  TO service_role
  USING (true);

-- 6. Créer la table admin_users si elle n'existe pas
CREATE TABLE IF NOT EXISTS admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index sur is_active
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users (is_active);