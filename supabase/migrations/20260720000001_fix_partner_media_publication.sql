-- DELIKREOL — Correctif médias partenaires avant réactivation publique
-- Date: 2026-07-20
-- Objectif:
-- - garder An Tjè Coco non-public tant que les originaux HD ne sont pas validés ;
-- - remplacer les URLs hero/portrait cassées de Coco's Food par des médias Drive valides ;
-- - supprimer l'upload public anonyme sur product-photos.

begin;

update public.vendors
set
  hero_image = null,
  portrait_image = null,
  gallery_images = '[]'::jsonb,
  photo_status = 'à confirmer',
  public_display_status = 'brouillon',
  is_public = false,
  updated_at = now()
where lower(coalesce(business_name, name)) = lower('An Tjè Coco')
   or lower(name) = lower('An Tjè Coco');

update public.vendors
set
  hero_image = 'https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg',
  portrait_image = 'https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0065.jpg',
  gallery_images = '[
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0065.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0066.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0068.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0072.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0077.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0081.jpg"
  ]'::jsonb,
  photo_status = 'confirmée',
  public_display_status = 'public confirmé',
  is_public = true,
  updated_at = now()
where lower(coalesce(business_name, name)) = lower('Coco''s Food')
   or lower(name) = lower('Coco''s Food');

drop policy if exists "product_photos_public_insert" on storage.objects;

commit;
