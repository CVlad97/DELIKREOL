-- Migration : Création de la table event_venues
-- ⚠️ NE PAS EXÉCUTER EN PRODUCTION sans validation explicite de Vladimir
-- Cette migration est RÉVERSIBLE via : DROP TABLE IF EXISTS public.event_venues;

CREATE TABLE IF NOT EXISTS public.event_venues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  venue_type text NOT NULL,
  description text,
  commune text NOT NULL,
  address text,
  latitude double precision,
  longitude double precision,
  capacity_seated integer CHECK (capacity_seated IS NULL OR capacity_seated >= 0),
  capacity_standing integer CHECK (capacity_standing IS NULL OR capacity_standing >= 0),
  parking_spaces integer CHECK (parking_spaces IS NULL OR parking_spaces >= 0),
  kitchen_available boolean,
  cold_storage_available boolean,
  loading_area_available boolean,
  delivery_access text NOT NULL DEFAULT 'unknown',
  pmr_accessible boolean,
  noise_restriction text,
  opening_notes text,
  phone text,
  whatsapp text,
  website text,
  images jsonb NOT NULL DEFAULT '[]'::jsonb,
  verification_status text NOT NULL DEFAULT 'unverified',
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Contraintes de validation des coordonnées
ALTER TABLE public.event_venues
  ADD CONSTRAINT IF NOT EXISTS event_venues_latitude_check
  CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE public.event_venues
  ADD CONSTRAINT IF NOT EXISTS event_venues_longitude_check
  CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- Index pour la recherche par commune
CREATE INDEX IF NOT EXISTS idx_event_venues_commune ON public.event_venues (commune);

-- Index pour filtrer les lieux publiés
CREATE INDEX IF NOT EXISTS idx_event_venues_published ON public.event_venues (published) WHERE published = true;

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION public.update_event_venues_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trigger_event_venues_updated_at ON public.event_venues;
CREATE TRIGGER trigger_event_venues_updated_at
  BEFORE UPDATE ON public.event_venues
  FOR EACH ROW EXECUTE FUNCTION public.update_event_venues_updated_at();

-- RLS : lecture publique uniquement si published = true
ALTER TABLE public.event_venues ENABLE ROW LEVEL SECURITY;

-- Politique de lecture publique : uniquement les lieux publiés
DROP POLICY IF EXISTS event_venues_public_read ON public.event_venues;
CREATE POLICY event_venues_public_read ON public.event_venues
  FOR SELECT TO anon, authenticated
  USING (published = true);

-- Politique d'écriture : réservée au rôle service (admin via Edge Function)
DROP POLICY IF EXISTS event_venues_service_write ON public.event_venues;
CREATE POLICY event_venues_service_write ON public.event_venues
  FOR ALL TO service_role
  USING (true) WITH CHECK (true);

-- Aucune insertion/mise à jour publique
-- Les anon et authenticated ne peuvent pas écrire

-- ROLLBACK :
-- DROP TABLE IF EXISTS public.event_venues;
-- DROP FUNCTION IF EXISTS public.update_event_venues_updated_at();
