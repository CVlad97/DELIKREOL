/*
  # Système complet d'onboarding partenaires

  1. Nouvelles Tables
    - `partner_documents` : Documents administratifs (Kbis, assurance, ID, etc.)
    - `partner_catalog_files` : Fichiers matrices tarifaires / catalogues (CSV, Excel, PDF)
    - `partner_catalog_items` : Produits clés saisis manuellement (3-10 produits de départ)

  2. Modifications
    - Aucune modification des tables existantes
    - Extension du système partner_applications existant

  3. Sécurité
    - RLS activé sur toutes les tables
    - Policies restrictives : admin + propriétaire uniquement
    - Stockage Supabase pour les fichiers (buckets à créer séparément)

  4. Objectif
    - Permettre aux partenaires de uploader leurs documents réglementaires
    - Permettre aux partenaires d'envoyer leurs matrices tarifaires
    - Permettre une saisie rapide de quelques produits clés
    - Faciliter la vérification par les admins
*/

-- Table pour les documents administratifs
CREATE TABLE IF NOT EXISTS public.partner_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_application_id uuid NOT NULL REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  document_type text NOT NULL,
  file_url text NOT NULL,
  file_name text,
  file_size bigint,
  mime_type text,
  uploaded_at timestamptz DEFAULT now(),

  CONSTRAINT valid_document_type CHECK (document_type IN (
    'kbis',
    'id_card',
    'hygiene_cert',
    'insurance',
    'tax_cert',
    'license',
    'other'
  ))
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_partner_documents_application
  ON public.partner_documents(partner_application_id);

-- Table pour les fichiers catalogues/matrices tarifaires
CREATE TABLE IF NOT EXISTS public.partner_catalog_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_application_id uuid NOT NULL REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  file_name text NOT NULL,
  file_size bigint,
  format text NOT NULL,
  note text,
  uploaded_at timestamptz DEFAULT now(),

  CONSTRAINT valid_format CHECK (format IN ('csv', 'xlsx', 'xls', 'pdf', 'other'))
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_partner_catalog_files_application
  ON public.partner_catalog_files(partner_application_id);

-- Table pour les produits clés (saisie manuelle rapide)
CREATE TABLE IF NOT EXISTS public.partner_catalog_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_application_id uuid NOT NULL REFERENCES public.partner_applications(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  category text,
  unit text NOT NULL DEFAULT 'unité',
  price numeric(10, 2) NOT NULL,
  currency text DEFAULT 'EUR',
  is_signature boolean DEFAULT false,
  allergens text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  CONSTRAINT positive_price CHECK (price >= 0)
);

-- Index pour recherche rapide
CREATE INDEX IF NOT EXISTS idx_partner_catalog_items_application
  ON public.partner_catalog_items(partner_application_id);

CREATE INDEX IF NOT EXISTS idx_partner_catalog_items_signature
  ON public.partner_catalog_items(is_signature)
  WHERE is_signature = true;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- partner_documents : RLS
ALTER TABLE public.partner_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all partner documents"
  ON public.partner_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Partner owner can view own documents"
  ON public.partner_documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_documents.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Partner owner can insert own documents"
  ON public.partner_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_documents.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Partner owner can delete own documents"
  ON public.partner_documents
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_documents.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  );

-- partner_catalog_files : RLS
ALTER TABLE public.partner_catalog_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all catalog files"
  ON public.partner_catalog_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Partner owner can view own catalog files"
  ON public.partner_catalog_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_catalog_files.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Partner owner can insert own catalog files"
  ON public.partner_catalog_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_catalog_files.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Partner owner can delete own catalog files"
  ON public.partner_catalog_files
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_catalog_files.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  );

-- partner_catalog_items : RLS
ALTER TABLE public.partner_catalog_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin can view all catalog items"
  ON public.partner_catalog_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.user_type = 'admin'
    )
  );

CREATE POLICY "Partner owner can view own catalog items"
  ON public.partner_catalog_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_catalog_items.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Partner owner can insert own catalog items"
  ON public.partner_catalog_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_catalog_items.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Partner owner can update own catalog items"
  ON public.partner_catalog_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_catalog_items.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_catalog_items.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  );

CREATE POLICY "Partner owner can delete own catalog items"
  ON public.partner_catalog_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.partner_applications
      WHERE partner_applications.id = partner_catalog_items.partner_application_id
      AND partner_applications.user_id = auth.uid()
    )
  );

-- Trigger pour updated_at sur partner_catalog_items
CREATE OR REPLACE FUNCTION public.update_partner_catalog_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_partner_catalog_items_updated_at
  BEFORE UPDATE ON public.partner_catalog_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_partner_catalog_items_updated_at();
