-- =============================================================================
-- DELIKREOL — Partner/livreur login access fix
-- Date: 2026-07-23
-- Objectif: permettre aux partenaires authentifiés d'avoir un profil, de déposer
-- leurs pièces, et d'envoyer des corrections sans passer par l'admin.
-- =============================================================================

ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS email text;

UPDATE public.profiles p
SET email = au.email
FROM auth.users au
WHERE p.id = au.id
  AND (p.email IS NULL OR p.email = '');

ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "profiles_insert_own_customer" ON public.profiles;
CREATE POLICY "profiles_insert_own_customer"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    id = (SELECT auth.uid())
    AND COALESCE(user_type, 'customer') = 'customer'
  );

DROP POLICY IF EXISTS "profiles_update_own_safe" ON public.profiles;
CREATE POLICY "profiles_update_own_safe"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = (SELECT auth.uid()))
  WITH CHECK (
    id = (SELECT auth.uid())
    AND user_type = (SELECT current_profile.user_type FROM public.profiles AS current_profile WHERE current_profile.id = (SELECT auth.uid()))
  );

CREATE TABLE IF NOT EXISTS public.partner_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_application_id uuid NULL,
  user_id uuid NULL,
  uploaded_by uuid NULL,
  document_type text NOT NULL,
  status text NOT NULL DEFAULT 'uploaded',
  verification_status text NOT NULL DEFAULT 'uploaded',
  file_name text,
  file_path text,
  file_url text,
  bucket_id text NOT NULL DEFAULT 'partner-documents-private',
  is_sensitive boolean NOT NULL DEFAULT true,
  file_size bigint,
  mime_type text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_note text,
  expires_at timestamptz,
  reviewed_at timestamptz,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_partner_documents_uploaded_by ON public.partner_documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_partner_documents_user_id ON public.partner_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_partner_documents_status ON public.partner_documents(verification_status);

ALTER TABLE public.partner_documents ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "partner_documents_select_own" ON public.partner_documents;
CREATE POLICY "partner_documents_select_own"
  ON public.partner_documents
  FOR SELECT
  TO authenticated
  USING (
    uploaded_by = (SELECT auth.uid())
    OR user_id = (SELECT auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "partner_documents_insert_own" ON public.partner_documents;
CREATE POLICY "partner_documents_insert_own"
  ON public.partner_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    uploaded_by = (SELECT auth.uid())
    AND COALESCE(user_id, (SELECT auth.uid())) = (SELECT auth.uid())
  );

DROP POLICY IF EXISTS "partner_documents_update_own" ON public.partner_documents;
CREATE POLICY "partner_documents_update_own"
  ON public.partner_documents
  FOR UPDATE
  TO authenticated
  USING (
    uploaded_by = (SELECT auth.uid())
    OR public.is_admin()
  )
  WITH CHECK (
    uploaded_by = (SELECT auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "partner_documents_delete_own" ON public.partner_documents;
CREATE POLICY "partner_documents_delete_own"
  ON public.partner_documents
  FOR DELETE
  TO authenticated
  USING (
    uploaded_by = (SELECT auth.uid())
    OR public.is_admin()
  );

INSERT INTO storage.buckets (id, name, public)
VALUES
  ('partner-documents-private', 'partner-documents-private', false),
  ('product-photos', 'product-photos', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "partner_private_docs_select_own" ON storage.objects;
CREATE POLICY "partner_private_docs_select_own"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'partner-documents-private'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "partner_private_docs_insert_own" ON storage.objects;
CREATE POLICY "partner_private_docs_insert_own"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'partner-documents-private'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "partner_private_docs_update_own" ON storage.objects;
CREATE POLICY "partner_private_docs_update_own"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'partner-documents-private'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  )
  WITH CHECK (
    bucket_id = 'partner-documents-private'
    AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
  );

DROP POLICY IF EXISTS "partner_private_docs_delete_own" ON storage.objects;
CREATE POLICY "partner_private_docs_delete_own"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'partner-documents-private'
    AND (
      (storage.foldername(name))[1] = (SELECT auth.uid())::text
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "authenticated_insert_partner_corrections" ON public.partner_corrections;
CREATE POLICY "authenticated_insert_partner_corrections"
  ON public.partner_corrections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    partner_id IS NOT NULL
    AND COALESCE(responsable, email, telephone) IS NOT NULL
  );
