-- =============================================================================
-- DELIKREOL — Hydratation éditoriale des partenaires publics
-- Date: 2026-07-16
-- Objectif: aligner Supabase avec les fiches et médias validés du frontend.
-- Aucun identifiant généré n'est codé en dur: rapprochement par nom commercial.
-- =============================================================================

with source (
  name, zone_label, commune, phone, whatsapp, email, legal_name,
  description, story, promise, specialty, highlights,
  hero_image, portrait_image, gallery_images, gradient, accent,
  planifiable, enterprise, photo_status, public_display_status
) as (
  values
  (
    'An Tjè Coco', 'Fort-de-France', 'Fort-de-France', '+596 696 85 70 77', '+596 696 85 70 77', 'antjecoco@gmail.com', 'AN TJE COCO',
    'Crêpes gastronomiques, pépites salées et sucrées à base de produits locaux.',
    'An Tjè Coco réinvente la crêpe en pépites artisanales sucrées et salées, avec des saveurs antillaises et une approche haut de gamme.',
    'Pépites artisanales, produits locaux et précommande WhatsApp.',
    'Pépites salées et sucrées, coco-passion, rougail saucisses et créations événementielles.',
    '["Crêpes gastronomiques","Pépites salées & sucrées","Précommande WhatsApp","Produits locaux","Traiteur événementiel"]'::jsonb,
	    null,
	    null,
	    '[]'::jsonb,
	    'from-[#7c3aed] via-[#ec4899] to-[#c2410c]', '#fff1f2', true, true, 'à confirmer', 'brouillon'
  ),
  (
    'Coco''s Food', 'Rivière-Pilote — Marché', 'Rivière-Pilote', '+596 696 25 47 20', '+596 696 25 47 20', null, 'COCO''S FOOD',
    'Cuisine de marché créole et caribéenne, plats complets, bowls, paella et brochettes.',
    'Coco''s Food propose au marché de Rivière-Pilote une cuisine généreuse, colorée et faite maison.',
    'Cuisine de marché généreuse, variée et portions généreuses.',
    'Plats du jour, paella aux fruits de mer, bowls, brochettes et poulet rôti.',
    '["Cuisine de marché","Marché de Rivière-Pilote","Plats du jour variés","Paella aux fruits de mer","Bowls et assiettes complètes"]'::jsonb,
	    'https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg',
	    'https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0065.jpg',
	    '["https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg","https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0065.jpg","https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0066.jpg","https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0068.jpg","https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0072.jpg","https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0077.jpg","https://delikreol.com/vendors/coco/drive-reimport/IMG-20260526-WA0081.jpg"]'::jsonb,
    'from-[#2b1b10] via-[#8b5e34] to-[#d97706]', '#fff7ed', true, true, 'confirmée', 'public confirmé'
  ),
  (
    'Gouté Mwen', 'Martinique', null, '+596 696 16 61 93', '+596 696 16 61 93', null, 'Gouté Mwen',
    'Glaces artisanales antillaises, pur fruit, faites maison et proposées en versions inclusives.',
    'Gouté Mwen valorise les saveurs des Antilles, les fruits locaux et des recettes accessibles avec ou sans sucre ajouté.',
    'Glaces faites maison, fruits locaux et patrimoine antillais.',
    'Abricot pays, mangue, maracuja, prune de Cythère, coco, snow-boll et parfums sans sucre ajouté.',
    '["18 parfums de glaces artisanales","Fruits locaux","Fait maison","Versions sans sucre ajouté","Patrimoine antillais"]'::jsonb,
	    null,
	    null,
	    '[]'::jsonb,
    'from-[#eab308] via-[#f97316] to-[#dc2626]', '#fff7ed', true, false, 'à confirmer', 'public confirmé'
  ),
  (
    'Les Delices de Ninice', 'Secteur Dillon', 'Fort-de-France', '+596 696 01 93 21', '+596 696 01 93 21', 'jereniceeduards@gmail.com', 'Les Délices de Ninice',
    'Cuisine de rue surinamo-caraïbe, boxes repas, snacking et service traiteur.',
    'Les Délices de Ninice réunit les épices du Suriname et la générosité antillaise dans des plats faits maison.',
    'Cuisine maison, saveurs surinamiennes et caraïbes, retrait facile à Dillon.',
    'Colombo, moksi aleisi, bami, bara, gulab jamun et mini brochettes Saoto.',
    '["Cuisine maison","Mélange Suriname / Caraïbes","Traiteur de proximité","Point relais à Dillon","Commandes groupe"]'::jsonb,
	    'https://delikreol.com/vendors/ninice/drive-reimport/IMG-20260521-WA0070.jpg',
	    'https://delikreol.com/vendors/ninice/drive-reimport/IMG-20260528-WA0212.jpg',
	    '["https://delikreol.com/vendors/ninice/drive-reimport/IMG-20260521-WA0070.jpg","https://delikreol.com/vendors/ninice/drive-reimport/IMG-20260521-WA0071.jpg","https://delikreol.com/vendors/ninice/drive-reimport/IMG-20260521-WA0072.jpg","https://delikreol.com/vendors/ninice/drive-reimport/IMG-20260521-WA0073.jpg","https://delikreol.com/vendors/ninice/drive-reimport/IMG-20260521-WA0074.jpg"]'::jsonb,
    'from-[#d95f2d] via-[#f49d4b] to-[#7c2d12]', '#fff7ed', true, true, 'confirmée', 'public confirmé'
  ),
  (
    'Saveurs d''Afrique', 'Cluny', 'Rivière-Salée', '0596 68 12 25', '0596 68 12 25', null, 'SAVEURS D''AFRIQUE',
    'Cuisine africaine et créole, buffet, traiteur et commandes groupe.',
    'Saveurs d''Afrique propose des spécialités africaines et créoles généreuses, préparées maison.',
    'Cuisine maison et portions généreuses.',
    'Spécialités africaines et créoles, ablo, poisson frit, atassi, fufu, bissap et douceurs maison.',
    '["Cuisine africaine et créole","Buffets et groupes","Fait maison","Portions généreuses","Rivière-Salée"]'::jsonb,
	    'https://delikreol.com/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0155.jpg',
	    'https://delikreol.com/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0156.jpg',
	    '["https://delikreol.com/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0155.jpg","https://delikreol.com/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0156.jpg","https://delikreol.com/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0157.jpg","https://delikreol.com/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0158.jpg","https://delikreol.com/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0159.jpg"]'::jsonb,
    'from-[#0f766e] via-[#14b8a6] to-[#14532d]', '#ecfeff', true, true, 'confirmée', 'public confirmé'
  ),
  (
    'Snack Savè Peyi''A', 'Rivière-Pilote — Pont de Fer', 'Rivière-Pilote', '+596 696 00 27 64', '+596 696 00 27 64', 'marianelitta972@gmail.com', 'Snack Savè Peyi''A',
    'Snack local : fruits frais, smoothies, granita, jus, paninis, crêpes, plats cuisinés et grillades.',
    'Snack Savè Peyi''A transforme fruits et légumes locaux et propose une offre complète de snack et de grillades à Rivière-Pilote.',
    'Grillades maison, fruits frais et produits locaux.',
    'Côte de porc, entrecôte, cabri, saumon, dorade grillée, salades de fruits, smoothies et granita.',
    '["Transformation fruits et légumes","Grillades et poissons","Rivière-Pilote","Fait maison","Livraison disponible"]'::jsonb,
	    'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg',
	    'https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0006.jpg',
	    '["https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg","https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0006.jpg","https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0007.jpg","https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0008.jpg","https://delikreol.com/vendors/save-peyia/drive-reimport/IMG-20260710-WA0009.jpg"]'::jsonb,
    'from-[#f59e0b] via-[#dc2626] to-[#15803d]', '#fff7ed', true, false, 'confirmée', 'public confirmé'
  ),
  (
    'Sweet Family Traiteur Orianne', 'Les Hauts de Dillon', 'Fort-de-France', '+596 696 88 75 28', '+596 696 88 75 28', null, 'Sweet Family Traiteur Orianne',
    'Traiteur événementiel spécialisé en Seafood Boil, Landfood, bao buns, verrines et cocktails dînatoires.',
    'Sweet Family Traiteur accompagne mariages, anniversaires, baptêmes, cocktails, buffets et repas d''entreprise avec des prestations sur mesure.',
    'Plats généreux, prestations sur mesure et produits de saison.',
    'Seafood Boil, Landfood, bao buns, nems, mini burgers, verrines créoles, desserts et cocktails.',
    '["Seafood Boil & Landfood","Prestations sur mesure","Mariages et événements","Grande capacité de service","Qualité et générosité"]'::jsonb,
    'https://delikreol.com/vendors/sweet-family/cocktails-mignardises-hero.webp',
	    'https://delikreol.com/vendors/sweet-family/drive-reimport/IMG-20260627-WA0003.jpg',
    '["https://delikreol.com/vendors/sweet-family/cocktails-mignardises-hero.webp","https://delikreol.com/vendors/sweet-family/cocktails-mignardises-menu.webp","https://delikreol.com/vendors/sweet-family/bao-buns-menu.webp","https://delikreol.com/vendors/sweet-family/commande-conditions.webp","https://delikreol.com/vendors/sweet-family/seafood-boil-1.webp","https://delikreol.com/vendors/sweet-family/seafood-boil-2.webp","https://delikreol.com/vendors/sweet-family/seafood-boil-3.webp","https://delikreol.com/vendors/sweet-family/seafood-boil-4.webp","https://delikreol.com/vendors/sweet-family/seafood-boil-5.webp"]'::jsonb,
    'from-[#dc2626] via-[#f97316] to-[#eab308]', '#fff7ed', true, true, 'à confirmer', 'public confirmé'
  )
)
update public.vendors as v
set
  zone_label = source.zone_label,
  commune = source.commune,
  phone = source.phone,
  whatsapp = source.whatsapp,
  email = source.email,
  legal_name = source.legal_name,
  description = source.description,
  story = source.story,
  promise = source.promise,
  specialty = source.specialty,
  highlights = source.highlights,
  hero_image = source.hero_image,
  portrait_image = source.portrait_image,
  gallery_images = source.gallery_images,
  gradient = source.gradient,
  accent = source.accent,
  planifiable = source.planifiable,
  enterprise = source.enterprise,
  photo_status = source.photo_status,
  public_display_status = source.public_display_status,
  status = 'verified',
  is_public = true,
  is_active = true,
  is_demo = false,
  updated_at = now()
from source
where lower(coalesce(v.business_name, v.name)) = lower(source.name);

-- Cette fiche provenait des données de démonstration et ne doit pas être publique.
update public.vendors
set
  is_public = false,
  is_demo = true,
  public_display_status = 'brouillon',
  updated_at = now()
where lower(coalesce(business_name, name)) = lower('Chez Tatie Mireille');
