-- =============================================================================
-- DELIKREOL — Migration : bucket caterer-photos + policies RLS
-- =============================================================================

-- 1. Création du bucket 'caterer-photos' (public pour les lectures)
INSERT INTO storage.buckets (id, name, public, avif_autodetection, file_size_limit, allowed_mime_types)
VALUES (
  'caterer-photos',
  'caterer-photos',
  true,
  false,
  5242880,  -- 5 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Row Level Security sur storage.objects
-- Les fichiers du bucket caterer-photos sont publics en lecture
CREATE POLICY "Caterer photos are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'caterer-photos');

-- Les utilisateurs authentifiés peuvent uploader dans caterer-photos
CREATE POLICY "Authenticated users can upload caterer photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'caterer-photos'
  AND auth.role() = 'authenticated'
);

-- Les authentifiés peuvent modifier leurs uploads
CREATE POLICY "Authenticated users can update caterer photos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'caterer-photos' AND auth.role() = 'authenticated')
WITH CHECK (bucket_id = 'caterer-photos' AND auth.role() = 'authenticated');

-- Les authentifiés peuvent supprimer leurs uploads
CREATE POLICY "Authenticated users can delete caterer photos"
ON storage.objects FOR DELETE
USING (bucket_id = 'caterer-photos' AND auth.role() = 'authenticated');

-- =============================================================================
-- Extension de partner_applications pour support statuts traiteurs
-- =============================================================================
ALTER TABLE partner_applications
  DROP CONSTRAINT IF EXISTS partner_applications_status_check;

ALTER TABLE partner_applications
  ADD CONSTRAINT partner_applications_status_check
    CHECK (status IN ('new', 'contacted', 'validated', 'a_verifier', 'integrated', 'refused'));

-- Colonnes supplémentaires pour les candidatures traiteurs
ALTER TABLE partner_applications
  ADD COLUMN IF NOT EXISTS reject_reason TEXT,
  ADD COLUMN IF NOT EXISTS specialties JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS prix_depart TEXT,
  ADD COLUMN IF NOT EXISTS temps_preparation TEXT,
  ADD COLUMN IF NOT EXISTS heure_limite TEXT,
  ADD COLUMN IF NOT EXISTS creneaux JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS site_web TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS photo_urls JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS photo_descriptions JSONB DEFAULT '[]'::jsonb;