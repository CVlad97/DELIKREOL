-- Restore existing vendor photos in the admin media library.
-- New uploads are synchronized directly by AdminTraiteurMedia.
WITH vendor_media AS (
  SELECT
    COALESCE(business_name, name, 'Traiteur') AS business_name,
    hero_image AS url,
    'Photo principale — ' || COALESCE(business_name, name, 'Traiteur') AS title,
    0 AS sort_order
  FROM public.vendors
  WHERE hero_image IS NOT NULL AND btrim(hero_image) <> ''

  UNION ALL

  SELECT
    COALESCE(vendor.business_name, vendor.name, 'Traiteur') AS business_name,
    gallery.url,
    'Galerie — ' || COALESCE(vendor.business_name, vendor.name, 'Traiteur') AS title,
    gallery.ordinality::int AS sort_order
  FROM public.vendors AS vendor
  CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(vendor.gallery_images, '[]'::jsonb))
    WITH ORDINALITY AS gallery(url, ordinality)
  WHERE btrim(gallery.url) <> ''
), deduplicated_media AS (
  SELECT DISTINCT ON (url) business_name, url, title, sort_order
  FROM vendor_media
  ORDER BY url, sort_order
)
INSERT INTO public.traiteur_media (
  traiteur_slug,
  media_type,
  storage_bucket,
  storage_path,
  url,
  title,
  description,
  file_size,
  mime_type,
  uploaded_by,
  sort_order,
  is_published,
  published_at
)
SELECT
  trim(both '-' from regexp_replace(lower(deduplicated_media.business_name), '[^a-z0-9]+', '-', 'g')),
  'photo',
  'existing-public-media',
  NULL,
  deduplicated_media.url,
  deduplicated_media.title,
  'Photo restaurée depuis la fiche traiteur',
  0,
  CASE
    WHEN lower(deduplicated_media.url) LIKE '%.png%' THEN 'image/png'
    WHEN lower(deduplicated_media.url) LIKE '%.webp%' THEN 'image/webp'
    ELSE 'image/jpeg'
  END,
  NULL,
  deduplicated_media.sort_order,
  true,
  now()
FROM deduplicated_media
WHERE NOT EXISTS (
  SELECT 1 FROM public.traiteur_media AS existing WHERE existing.url = deduplicated_media.url
);
