-- =============================================================================
-- DELIKREOL — Pilot partner access and correction submissions
-- Objectif : préparer des accès partenaires limités, traçables, sans mot de passe en clair.
-- =============================================================================

-- Admin registry used by RLS policies.
CREATE TABLE IF NOT EXISTS public.admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_admin_users_email ON public.admin_users (lower(email));
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON public.admin_users (is_active);

-- Helper: current user is an active admin or the known pilot owner email.
CREATE OR REPLACE FUNCTION public.is_delikreol_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    auth.jwt()->>'email' = 'vladimir.claveau@gmail.com'
    OR EXISTS (
      SELECT 1
      FROM public.admin_users au
      WHERE au.user_id = auth.uid()
        AND au.is_active = true
    ),
    false
  );
$$;

-- Optional future secure token table. Store only a token hash, never the raw token.
CREATE TABLE IF NOT EXISTS public.partner_access_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id TEXT,
  partner_name TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  label TEXT,
  expires_at TIMESTAMPTZ,
  used_count INTEGER NOT NULL DEFAULT 0,
  max_uses INTEGER NOT NULL DEFAULT 20,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ
);

ALTER TABLE public.partner_access_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "admins_manage_partner_access_tokens" ON public.partner_access_tokens;
CREATE POLICY "admins_manage_partner_access_tokens"
  ON public.partner_access_tokens
  FOR ALL
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

-- Partner correction submissions from pilot links.
CREATE TABLE IF NOT EXISTS public.partner_corrections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  access_code TEXT,
  partner_name TEXT,
  responsable TEXT,
  telephone TEXT,
  email TEXT,
  commune TEXT,
  description TEXT,
  horaires TEXT,
  modes TEXT[] DEFAULT '{}',
  plats TEXT,
  prix TEXT,
  compositions TEXT,
  allergenes TEXT,
  remarques TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  source TEXT NOT NULL DEFAULT 'partner_pilot_page',
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at TIMESTAMPTZ,
  processed_at TIMESTAMPTZ
);

ALTER TABLE public.partner_corrections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_partner_corrections" ON public.partner_corrections;
CREATE POLICY "public_insert_partner_corrections"
  ON public.partner_corrections
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "admins_read_partner_corrections" ON public.partner_corrections;
CREATE POLICY "admins_read_partner_corrections"
  ON public.partner_corrections
  FOR SELECT
  TO authenticated
  USING (public.is_delikreol_admin());

DROP POLICY IF EXISTS "admins_update_partner_corrections" ON public.partner_corrections;
CREATE POLICY "admins_update_partner_corrections"
  ON public.partner_corrections
  FOR UPDATE
  TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

CREATE INDEX IF NOT EXISTS idx_partner_corrections_created_at ON public.partner_corrections (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partner_corrections_status ON public.partner_corrections (status);
CREATE INDEX IF NOT EXISTS idx_partner_corrections_access_code ON public.partner_corrections (access_code);

COMMENT ON TABLE public.partner_corrections IS 'Corrections envoyées par les partenaires depuis les liens pilotes DELIKREOL.';
COMMENT ON TABLE public.partner_access_tokens IS 'Préparation des accès partenaires sécurisés : seuls les hash de tokens doivent être stockés.';
