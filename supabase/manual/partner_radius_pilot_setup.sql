-- DELIKREOL - réglage pilote couverture réelle par partenaire.
-- À exécuter manuellement dans Supabase après vérification des partenaires réels.
-- Objectif: position + rayon court, la commune servant uniquement de fallback.

ALTER TABLE public.vendors
  ALTER COLUMN delivery_radius_km SET DEFAULT 3;

-- Exemple de réglage pilote sur partenaires existants.
-- Remplacer/adapter les noms, coordonnées et produits selon les vrais partenaires.
-- Ne pas activer is_public/status si les fiches ne sont pas validées commercialement.

UPDATE public.vendors
SET
  latitude = 14.6037,
  longitude = -61.0588,
  delivery_radius_km = 3,
  zone_label = COALESCE(zone_label, 'Fort-de-France')
WHERE business_name = 'Chez Tatie Mireille';

UPDATE public.vendors
SET
  latitude = 14.6137,
  longitude = -60.9578,
  delivery_radius_km = 3,
  zone_label = COALESCE(zone_label, 'Le Lamentin')
WHERE business_name = 'La Case a Rhum';

UPDATE public.vendors
SET
  latitude = 14.4683,
  longitude = -60.8711,
  delivery_radius_km = 3,
  zone_label = COALESCE(zone_label, 'Le Marin')
WHERE business_name = 'Boulangerie du Marin';

-- Contrôle rapide:
-- select business_name, latitude, longitude, delivery_radius_km, zone_label, is_public, is_demo, status
-- from public.vendors
-- order by business_name;
