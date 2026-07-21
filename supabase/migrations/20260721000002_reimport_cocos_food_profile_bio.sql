-- DELIKREOL — réimport durable de la fiche Coco's Food
-- Date : 2026-07-21
-- Portée : bio, photo de profil et galerie existante uniquement.
-- Aucun produit, prix, allergène, horaire ou contact n'est créé par cette migration.

begin;

update public.vendors
set
  description = 'Cuisine de marché créole et caribéenne, plats complets, bowls, paella, brochettes.',
  story = 'Coco''s Food, c''est la cuisine du marché de Rivière-Pilote : des plats complets faits maison, généreux et colorés. Du poulet rôti aux paellas noires aux fruits de mer, en passant par les brochettes panées et les bowls garnis, chaque assiette est pensée pour rassasier et faire plaisir. Une cuisine simple, authentique, avec des portions qui ne trichent pas.',
  promise = 'Cuisine de marché généreuse, variée, portions XXL',
  specialty = 'Plats du jour, paella fruits de mer, bowls, brochettes, poulet rôti',
  highlights = '["Cuisine de marché","Marché de Rivière-Pilote","Plats du jour variés","Paella aux fruits de mer","Bowls et assiettes complètes","Brochettes panées","Commande sur demande"]'::jsonb,
  hero_image = 'https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg',
  portrait_image = 'https://delikreol.com/vendors/coco/profile.svg',
  logo_url = 'https://delikreol.com/vendors/coco/profile.svg',
  establishment_photo_url = 'https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg',
  gallery_images = '[
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0065.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0066.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0067.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0068.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0069.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0070.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0071.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0072.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0073.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0074.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0075.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0076.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0077.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0078.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0079.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0080.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0081.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0082.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0083.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0084.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0085.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0086.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0087.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0088.jpg",
    "https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0089.jpg"
  ]'::jsonb,
  photo_status = 'confirmée',
  public_display_status = 'public confirmé',
  status = 'verified',
  is_public = true,
  is_active = true,
  is_demo = false,
  updated_at = now()
where lower(coalesce(business_name, name)) = lower('Coco''s Food')
   or lower(name) = lower('Coco''s Food');

commit;
