-- DELIKREOL — médias traiteurs privés, administrés et validés avant publication.
-- Pré-audit requis en staging avant application production : pg_policies, colonnes,
-- contraintes, objets Storage orphelins et sauvegarde.

CREATE TABLE IF NOT EXISTS public.traiteur_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  traiteur_slug TEXT NOT NULL,
  media_type TEXT NOT NULL,
  storage_bucket TEXT NOT NULL DEFAULT 'traiteur-media',
  storage_path TEXT,
  url TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  file_size BIGINT NOT NULL DEFAULT 0,
  mime_type TEXT NOT NULL DEFAULT '',
  uploaded_by UUID DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE SET NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.traiteur_media ADD COLUMN IF NOT EXISTS storage_bucket TEXT NOT NULL DEFAULT 'traiteur-media';
ALTER TABLE public.traiteur_media ADD COLUMN IF NOT EXISTS storage_path TEXT;
ALTER TABLE public.traiteur_media ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.traiteur_media ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;
ALTER TABLE public.traiteur_media ALTER COLUMN uploaded_by SET DEFAULT auth.uid();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.traiteur_media'::regclass
      AND conname = 'traiteur_media_type_check'
  ) THEN
    ALTER TABLE public.traiteur_media
      ADD CONSTRAINT traiteur_media_type_check
      CHECK (media_type IN ('photo', 'video', 'audio'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.traiteur_media'::regclass
      AND conname = 'traiteur_media_file_size_check'
  ) THEN
    ALTER TABLE public.traiteur_media
      ADD CONSTRAINT traiteur_media_file_size_check
      CHECK (file_size BETWEEN 0 AND 52428800);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.traiteur_media'::regclass
      AND conname = 'traiteur_media_mime_type_check'
  ) THEN
    ALTER TABLE public.traiteur_media
      ADD CONSTRAINT traiteur_media_mime_type_check
      CHECK (mime_type IN (
        'image/jpeg', 'image/png', 'image/webp',
        'audio/mpeg', 'audio/wav', 'audio/mp4',
        'video/mp4', 'video/webm'
      ));
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS idx_traiteur_media_storage_path_unique
  ON public.traiteur_media (storage_bucket, storage_path)
  WHERE storage_path IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_traiteur_media_slug_sort
  ON public.traiteur_media (traiteur_slug, sort_order, created_at);
CREATE INDEX IF NOT EXISTS idx_traiteur_media_published
  ON public.traiteur_media (traiteur_slug, is_published, sort_order);

ALTER TABLE public.traiteur_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS traiteur_media_select_public ON public.traiteur_media;
DROP POLICY IF EXISTS traiteur_media_select_admin ON public.traiteur_media;
CREATE POLICY traiteur_media_select_admin ON public.traiteur_media
  FOR SELECT TO authenticated
  USING (public.is_delikreol_admin());

DROP POLICY IF EXISTS traiteur_media_insert_admin ON public.traiteur_media;
CREATE POLICY traiteur_media_insert_admin ON public.traiteur_media
  FOR INSERT TO authenticated
  WITH CHECK (
    public.is_delikreol_admin()
    AND uploaded_by = auth.uid()
    AND is_published = false
    AND published_at IS NULL
  );

DROP POLICY IF EXISTS traiteur_media_update_admin ON public.traiteur_media;
CREATE POLICY traiteur_media_update_admin ON public.traiteur_media
  FOR UPDATE TO authenticated
  USING (public.is_delikreol_admin())
  WITH CHECK (public.is_delikreol_admin());

DROP POLICY IF EXISTS traiteur_media_delete_admin ON public.traiteur_media;
CREATE POLICY traiteur_media_delete_admin ON public.traiteur_media
  FOR DELETE TO authenticated
  USING (public.is_delikreol_admin());

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'traiteur-media',
  'traiteur-media',
  false,
  52428800,
  ARRAY[
    'image/jpeg', 'image/png', 'image/webp',
    'audio/mpeg', 'audio/wav', 'audio/mp4',
    'video/mp4', 'video/webm'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS traiteur_media_storage_select ON storage.objects;
CREATE POLICY traiteur_media_storage_select ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'traiteur-media' AND public.is_delikreol_admin());

DROP POLICY IF EXISTS traiteur_media_storage_insert ON storage.objects;
CREATE POLICY traiteur_media_storage_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'traiteur-media'
    AND public.is_delikreol_admin()
    AND owner_id = auth.uid()::text
  );

DROP POLICY IF EXISTS traiteur_media_storage_update ON storage.objects;
CREATE POLICY traiteur_media_storage_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'traiteur-media' AND public.is_delikreol_admin())
  WITH CHECK (
    bucket_id = 'traiteur-media'
    AND public.is_delikreol_admin()
    AND owner_id = auth.uid()::text
  );

DROP POLICY IF EXISTS traiteur_media_storage_delete ON storage.objects;
CREATE POLICY traiteur_media_storage_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'traiteur-media' AND public.is_delikreol_admin());

-- Rollback non destructif recommandé : supprimer seulement policies/index ajoutés.
-- Ne pas supprimer la table ni les objets Storage sans sauvegarde et inventaire.
-- DROP POLICY IF EXISTS traiteur_media_storage_delete ON storage.objects;
-- DROP POLICY IF EXISTS traiteur_media_storage_update ON storage.objects;
-- DROP POLICY IF EXISTS traiteur_media_storage_insert ON storage.objects;
-- DROP POLICY IF EXISTS traiteur_media_storage_select ON storage.objects;
-- DROP INDEX IF EXISTS public.idx_traiteur_media_published;
-- DROP INDEX IF EXISTS public.idx_traiteur_media_slug_sort;
-- DROP INDEX IF EXISTS public.idx_traiteur_media_storage_path_unique;
