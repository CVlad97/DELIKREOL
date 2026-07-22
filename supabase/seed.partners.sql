-- DELIKREOL partner import
-- Generated from scripts/partners-sync.mjs.
-- Idempotent: updates matching vendors by name/business_name, inserts missing vendors.
-- Run in Supabase SQL Editor on project Delikreol after schema migrations are applied.

BEGIN;

-- Les Delices de Ninice
DO $$
BEGIN
  UPDATE public.vendors
     SET business_name = 'Les Delices de Ninice',
         legal_name = 'Les Delices de Ninice',
         status = 'verified',
         zone_label = 'Secteur Dillon',
         commune = 'Fort-de-France',
         phone = '+596 696 01 93 21',
         whatsapp = '+596 696 01 93 21',
         email = 'jereniceeduards@gmail.com',
         description = 'Traiteur, boxes repas et snacking — cuisine de rue surinamo-caraïbe.',
         story = 'Cuisine de rue surinamo-caraïbe, épices du Suriname et générosité antillaise. Retrait au Barber Shop de Dillon, Fort-de-France.',
         promise = 'Cuisine maison, saveurs surinamiennes et caraïbes, retrait facile à Dillon',
         specialty = 'Colombo, moksi aleisi, bami, bara, gulab jamun et mini brochettes Saoto',
         hero_image = '/vendors/ninice/drive-reimport/IMG-20260521-WA0070.jpg',
         portrait_image = '/vendors/ninice/drive-reimport/IMG-20260528-WA0212.jpg',
         gradient = 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]',
         accent = '#fff7ed',
         photo_status = 'à confirmer',
         public_display_status = 'public confirmé',
         is_public = true,
         is_active = true,
         is_demo = false,
         highlights = '["Cuisine maison","Mélange Suriname / Caraïbes","Point relais Barber Shop de Dillon","Commande groupe"]'::jsonb,
         gallery_images = '["/vendors/ninice/drive-reimport/IMG-20260521-WA0070.jpg","/vendors/ninice/drive-reimport/IMG-20260521-WA0071.jpg","/vendors/ninice/drive-reimport/IMG-20260521-WA0072.jpg","/vendors/ninice/drive-reimport/IMG-20260521-WA0073.jpg","/vendors/ninice/drive-reimport/IMG-20260521-WA0074.jpg"]'::jsonb,
         delivery_radius_km = 12,
         updated_at = now()
   WHERE lower(coalesce(business_name, name)) = lower('Les Delices de Ninice')
      OR lower(name) = lower('Les Delices de Ninice');

  IF NOT FOUND THEN
    INSERT INTO public.vendors (name, business_name, legal_name, status, zone_label, commune, phone, whatsapp, email, description, story, promise, specialty, hero_image, portrait_image, gradient, accent, photo_status, public_display_status, is_public, is_active, is_demo, highlights, gallery_images, delivery_radius_km, created_at, updated_at)
    VALUES ('Les Delices de Ninice', 'Les Delices de Ninice', 'Les Delices de Ninice', 'verified', 'Secteur Dillon', 'Fort-de-France', '+596 696 01 93 21', '+596 696 01 93 21', 'jereniceeduards@gmail.com', 'Traiteur, boxes repas et snacking — cuisine de rue surinamo-caraïbe.', 'Cuisine de rue surinamo-caraïbe, épices du Suriname et générosité antillaise. Retrait au Barber Shop de Dillon, Fort-de-France.', 'Cuisine maison, saveurs surinamiennes et caraïbes, retrait facile à Dillon', 'Colombo, moksi aleisi, bami, bara, gulab jamun et mini brochettes Saoto', '/vendors/ninice/drive-reimport/IMG-20260521-WA0070.jpg', '/vendors/ninice/drive-reimport/IMG-20260528-WA0212.jpg', 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]', '#fff7ed', 'à confirmer', 'public confirmé', true, true, false, '["Cuisine maison","Mélange Suriname / Caraïbes","Point relais Barber Shop de Dillon","Commande groupe"]'::jsonb, '["/vendors/ninice/drive-reimport/IMG-20260521-WA0070.jpg","/vendors/ninice/drive-reimport/IMG-20260521-WA0071.jpg","/vendors/ninice/drive-reimport/IMG-20260521-WA0072.jpg","/vendors/ninice/drive-reimport/IMG-20260521-WA0073.jpg","/vendors/ninice/drive-reimport/IMG-20260521-WA0074.jpg"]'::jsonb, 12, now(), now());
  END IF;
END $$;

-- An Tjè Coco
DO $$
BEGIN
  UPDATE public.vendors
     SET business_name = 'An Tjè Coco',
         legal_name = 'AN TJE COCO',
         status = 'verified',
         zone_label = 'Fort-de-France',
         commune = 'Fort-de-France',
         phone = '0696 85 70 77',
         whatsapp = '0696 85 70 77',
         email = 'antjecoco@gmail.com',
         description = 'Crêpes gastronomiques, pépites salées et sucrées.',
         story = 'An Tjè Coco réinvente la crêpe en pépites artisanales sucrées et salées avec des produits locaux.',
         promise = 'Pépites artisanales, produits locaux, précommande WhatsApp',
         specialty = 'Pépites façon gratin de banane jaune, coco-passion, rougail saucisses, poulet-curry-lait de coco',
         hero_image = NULL,
         portrait_image = NULL,
         gradient = 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]',
         accent = '#fff7ed',
         photo_status = 'à confirmer',
         public_display_status = 'brouillon',
         is_public = false,
         is_active = true,
         is_demo = false,
         highlights = '["Crêpes gastronomiques","Pépites salées & sucrées","Précommande WhatsApp","Produits locaux"]'::jsonb,
         gallery_images = '[]'::jsonb,
         delivery_radius_km = 12,
         updated_at = now()
   WHERE lower(coalesce(business_name, name)) = lower('An Tjè Coco')
      OR lower(name) = lower('An Tjè Coco');

  IF NOT FOUND THEN
    INSERT INTO public.vendors (name, business_name, legal_name, status, zone_label, commune, phone, whatsapp, email, description, story, promise, specialty, hero_image, portrait_image, gradient, accent, photo_status, public_display_status, is_public, is_active, is_demo, highlights, gallery_images, delivery_radius_km, created_at, updated_at)
    VALUES ('An Tjè Coco', 'An Tjè Coco', 'AN TJE COCO', 'verified', 'Fort-de-France', 'Fort-de-France', '0696 85 70 77', '0696 85 70 77', 'antjecoco@gmail.com', 'Crêpes gastronomiques, pépites salées et sucrées.', 'An Tjè Coco réinvente la crêpe en pépites artisanales sucrées et salées avec des produits locaux.', 'Pépites artisanales, produits locaux, précommande WhatsApp', 'Pépites façon gratin de banane jaune, coco-passion, rougail saucisses, poulet-curry-lait de coco', NULL, NULL, 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]', '#fff7ed', 'à confirmer', 'brouillon', false, true, false, '["Crêpes gastronomiques","Pépites salées & sucrées","Précommande WhatsApp","Produits locaux"]'::jsonb, '[]'::jsonb, 12, now(), now());
  END IF;
END $$;

-- Coco's Food
DO $$
BEGIN
  UPDATE public.vendors
     SET business_name = 'Coco''s Food',
         legal_name = 'COCO''S FOOD',
         status = 'verified',
         zone_label = 'Rivière-Pilote — Marché',
         commune = 'Rivière-Pilote',
         phone = '+596 696 25 47 20',
         whatsapp = '+596 696 25 47 20',
         email = NULL,
         description = 'Cuisine de marché créole et caribéenne, plats complets, bowls, paella, brochettes.',
         story = 'Cuisine du marché de Rivière-Pilote : plats complets faits maison, généreux et colorés.',
         promise = 'Cuisine de marché généreuse, variée, portions XXL',
         specialty = 'Plats du jour, paella fruits de mer, bowls, brochettes, poulet rôti',
         hero_image = '/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg',
         portrait_image = '/vendors/coco/drive-reimport/IMG-20260526-WA0065.jpg',
         gradient = 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]',
         accent = '#fff7ed',
         photo_status = 'à confirmer',
         public_display_status = 'public confirmé',
         is_public = true,
         is_active = true,
         is_demo = false,
         highlights = '["Cuisine de marché","Marché de Rivière-Pilote","Plats du jour variés","Paella aux fruits de mer"]'::jsonb,
         gallery_images = '["/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0065.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0066.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0068.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0072.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0077.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0081.jpg"]'::jsonb,
         delivery_radius_km = 12,
         updated_at = now()
   WHERE lower(coalesce(business_name, name)) = lower('Coco''s Food')
      OR lower(name) = lower('Coco''s Food');

  IF NOT FOUND THEN
    INSERT INTO public.vendors (name, business_name, legal_name, status, zone_label, commune, phone, whatsapp, email, description, story, promise, specialty, hero_image, portrait_image, gradient, accent, photo_status, public_display_status, is_public, is_active, is_demo, highlights, gallery_images, delivery_radius_km, created_at, updated_at)
    VALUES ('Coco''s Food', 'Coco''s Food', 'COCO''S FOOD', 'verified', 'Rivière-Pilote — Marché', 'Rivière-Pilote', '+596 696 25 47 20', '+596 696 25 47 20', NULL, 'Cuisine de marché créole et caribéenne, plats complets, bowls, paella, brochettes.', 'Cuisine du marché de Rivière-Pilote : plats complets faits maison, généreux et colorés.', 'Cuisine de marché généreuse, variée, portions XXL', 'Plats du jour, paella fruits de mer, bowls, brochettes, poulet rôti', '/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg', '/vendors/coco/drive-reimport/IMG-20260526-WA0065.jpg', 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]', '#fff7ed', 'à confirmer', 'public confirmé', true, true, false, '["Cuisine de marché","Marché de Rivière-Pilote","Plats du jour variés","Paella aux fruits de mer"]'::jsonb, '["/vendors/coco/drive-reimport/IMG-20260526-WA0064.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0065.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0066.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0068.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0072.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0077.jpg","/vendors/coco/drive-reimport/IMG-20260526-WA0081.jpg"]'::jsonb, 12, now(), now());
  END IF;
END $$;

-- Snack Savè Peyi’A
DO $$
BEGIN
  UPDATE public.vendors
     SET business_name = 'Snack Savè Peyi’A',
         legal_name = 'Snack Savè Peyi’A',
         status = 'verified',
         zone_label = 'Rivière-Pilote — Pont de Fer',
         commune = 'Rivière-Pilote',
         phone = '+596 696 00 27 64',
         whatsapp = '+596 696 00 27 64',
         email = 'marianelitta972@gmail.com',
         description = 'Transformation de fruits et légumes, jus locaux, grillades, plats cuisinés et snacks.',
         story = 'Snack Savè Peyi’A est le spot de Rivière-Pilote près du Pont de Fer : fruits frais, jus locaux, paninis, crêpes, plats cuisinés et grillades.',
         promise = 'Grillades maison, fruits frais, produits locaux — livraison sur Rivière-Pilote et environs',
         specialty = 'Côte de porc, entrecôte, cabri, saumon sauce blanche, dorade grillée, salades de fruits, smoothies',
         hero_image = '/vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg',
         portrait_image = '/vendors/save-peyia/drive-reimport/IMG-20260710-WA0006.jpg',
         gradient = 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]',
         accent = '#fff7ed',
         photo_status = 'à confirmer',
         public_display_status = 'public confirmé',
         is_public = true,
         is_active = true,
         is_demo = false,
         highlights = '["Transformation fruits et légumes","Grillades & poissons","Rivière-Pilote — Pont de Fer","Livraison disponible"]'::jsonb,
         gallery_images = '["/vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg","/vendors/save-peyia/drive-reimport/IMG-20260710-WA0006.jpg","/vendors/save-peyia/drive-reimport/IMG-20260710-WA0007.jpg","/vendors/save-peyia/drive-reimport/IMG-20260710-WA0008.jpg","/vendors/save-peyia/drive-reimport/IMG-20260710-WA0009.jpg"]'::jsonb,
         delivery_radius_km = 12,
         updated_at = now()
   WHERE lower(coalesce(business_name, name)) = lower('Snack Savè Peyi’A')
      OR lower(name) = lower('Snack Savè Peyi’A');

  IF NOT FOUND THEN
    INSERT INTO public.vendors (name, business_name, legal_name, status, zone_label, commune, phone, whatsapp, email, description, story, promise, specialty, hero_image, portrait_image, gradient, accent, photo_status, public_display_status, is_public, is_active, is_demo, highlights, gallery_images, delivery_radius_km, created_at, updated_at)
    VALUES ('Snack Savè Peyi’A', 'Snack Savè Peyi’A', 'Snack Savè Peyi’A', 'verified', 'Rivière-Pilote — Pont de Fer', 'Rivière-Pilote', '+596 696 00 27 64', '+596 696 00 27 64', 'marianelitta972@gmail.com', 'Transformation de fruits et légumes, jus locaux, grillades, plats cuisinés et snacks.', 'Snack Savè Peyi’A est le spot de Rivière-Pilote près du Pont de Fer : fruits frais, jus locaux, paninis, crêpes, plats cuisinés et grillades.', 'Grillades maison, fruits frais, produits locaux — livraison sur Rivière-Pilote et environs', 'Côte de porc, entrecôte, cabri, saumon sauce blanche, dorade grillée, salades de fruits, smoothies', '/vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg', '/vendors/save-peyia/drive-reimport/IMG-20260710-WA0006.jpg', 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]', '#fff7ed', 'à confirmer', 'public confirmé', true, true, false, '["Transformation fruits et légumes","Grillades & poissons","Rivière-Pilote — Pont de Fer","Livraison disponible"]'::jsonb, '["/vendors/save-peyia/drive-reimport/IMG-20260710-WA0005.jpg","/vendors/save-peyia/drive-reimport/IMG-20260710-WA0006.jpg","/vendors/save-peyia/drive-reimport/IMG-20260710-WA0007.jpg","/vendors/save-peyia/drive-reimport/IMG-20260710-WA0008.jpg","/vendors/save-peyia/drive-reimport/IMG-20260710-WA0009.jpg"]'::jsonb, 12, now(), now());
  END IF;
END $$;

-- Gouté Mwen
DO $$
BEGIN
  UPDATE public.vendors
     SET business_name = 'Gouté Mwen',
         legal_name = 'Gouté Mwen',
         status = 'verified',
         zone_label = 'Martinique',
         commune = 'Martinique',
         phone = '+596 696 16 61 93',
         whatsapp = '+596 696 16 61 93',
         email = NULL,
         description = 'Glaces artisanales antillaises — pur fruit, fait maison, inclusif.',
         story = 'Gouté Mwen valorise les saveurs des Antilles avec des glaces artisanales, des fruits locaux et des versions sans sucre ajouté.',
         promise = 'Glaces faites maison, fruits locaux, 2€ seulement — inclusion & patrimoine antillais',
         specialty = 'Glaces artisanales : abricot pays, mangue, maracuja, prune cythère, corossol, coco, snow-boll',
         hero_image = '/vendors/goute-mwen/import-20260722/goute-mwen-abricot-pays.jpg',
         portrait_image = '/vendors/goute-mwen/import-20260722/goute-mwen-super-coco.jpg',
         gradient = 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]',
         accent = '#fff7ed',
         photo_status = 'à confirmer',
         public_display_status = 'public confirmé',
         is_public = true,
         is_active = true,
         is_demo = false,
         highlights = '["19 parfums de glaces artisanales","2€ chaque","Sans sucre ajouté disponible","Fait maison"]'::jsonb,
         gallery_images = '["/vendors/goute-mwen/import-20260722/goute-mwen-abricot-pays.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-super-coco.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-api.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-mangue.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-canne.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-pasteque.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-pomme-liane.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-citronade.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-ananas.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-prune-de-cythere.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-snow-ball.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-kumquat.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-maracuja.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-prune-maracuja.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-avocat-basilic.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-corossol.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-mandarine.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-cocktail.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-clitoria-corossol.jpg"]'::jsonb,
         delivery_radius_km = 12,
         updated_at = now()
   WHERE lower(coalesce(business_name, name)) = lower('Gouté Mwen')
      OR lower(name) = lower('Gouté Mwen');

  IF NOT FOUND THEN
    INSERT INTO public.vendors (name, business_name, legal_name, status, zone_label, commune, phone, whatsapp, email, description, story, promise, specialty, hero_image, portrait_image, gradient, accent, photo_status, public_display_status, is_public, is_active, is_demo, highlights, gallery_images, delivery_radius_km, created_at, updated_at)
    VALUES ('Gouté Mwen', 'Gouté Mwen', 'Gouté Mwen', 'verified', 'Martinique', 'Martinique', '+596 696 16 61 93', '+596 696 16 61 93', NULL, 'Glaces artisanales antillaises — pur fruit, fait maison, inclusif.', 'Gouté Mwen valorise les saveurs des Antilles avec des glaces artisanales, des fruits locaux et des versions sans sucre ajouté.', 'Glaces faites maison, fruits locaux, 2€ seulement — inclusion & patrimoine antillais', 'Glaces artisanales : abricot pays, mangue, maracuja, prune cythère, corossol, coco, snow-boll', '/vendors/goute-mwen/import-20260722/goute-mwen-abricot-pays.jpg', '/vendors/goute-mwen/import-20260722/goute-mwen-super-coco.jpg', 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]', '#fff7ed', 'à confirmer', 'public confirmé', true, true, false, '["19 parfums de glaces artisanales","2€ chaque","Sans sucre ajouté disponible","Fait maison"]'::jsonb, '["/vendors/goute-mwen/import-20260722/goute-mwen-abricot-pays.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-super-coco.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-api.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-mangue.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-canne.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-pasteque.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-pomme-liane.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-citronade.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-ananas.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-prune-de-cythere.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-snow-ball.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-kumquat.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-maracuja.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-prune-maracuja.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-avocat-basilic.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-corossol.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-mandarine.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-cocktail.jpg","/vendors/goute-mwen/import-20260722/goute-mwen-clitoria-corossol.jpg"]'::jsonb, 12, now(), now());
  END IF;
END $$;

-- Sweet Family Traiteur Orianne
DO $$
BEGIN
  UPDATE public.vendors
     SET business_name = 'Sweet Family Traiteur Orianne',
         legal_name = 'Sweet Family Traiteur Orianne',
         status = 'verified',
         zone_label = 'Martinique',
         commune = 'Fort-de-France',
         phone = '+596 696 88 75 28',
         whatsapp = '+596 696 88 75 28',
         email = NULL,
         description = 'Spécialiste Seafood Boil & Landfood, Bao Buns, Nems, Burgers, Verrines créoles, Desserts & Cocktails dînatoires.',
         story = 'Traiteur événementiel basé en Martinique, spécialisé Seafood Boils et cocktails dînatoires haut de gamme.',
         promise = 'Plats généreux et savoureux — Prestations sur mesure — Produits de saison',
         specialty = 'Seafood Boil, Landfood, Bao Buns, Nems, Mini Burgers, Pizzas, Verrines créoles, Desserts',
         hero_image = '/vendors/sweet-family/cocktails-mignardises-hero.webp',
         portrait_image = '/vendors/sweet-family/drive-reimport/IMG-20260627-WA0003.jpg',
         gradient = 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]',
         accent = '#fff7ed',
         photo_status = 'à confirmer',
         public_display_status = 'public confirmé',
         is_public = true,
         is_active = true,
         is_demo = false,
         highlights = '["Spécialiste Seafood Boil & Landfood","Prestations sur mesure","Grande capacité de service","Qualité et générosité"]'::jsonb,
         gallery_images = '["/vendors/sweet-family/cocktails-mignardises-menu.webp","/vendors/sweet-family/bao-buns-menu.webp","/vendors/sweet-family/seafood-boil-1.webp"]'::jsonb,
         delivery_radius_km = 12,
         updated_at = now()
   WHERE lower(coalesce(business_name, name)) = lower('Sweet Family Traiteur Orianne')
      OR lower(name) = lower('Sweet Family Traiteur Orianne');

  IF NOT FOUND THEN
    INSERT INTO public.vendors (name, business_name, legal_name, status, zone_label, commune, phone, whatsapp, email, description, story, promise, specialty, hero_image, portrait_image, gradient, accent, photo_status, public_display_status, is_public, is_active, is_demo, highlights, gallery_images, delivery_radius_km, created_at, updated_at)
    VALUES ('Sweet Family Traiteur Orianne', 'Sweet Family Traiteur Orianne', 'Sweet Family Traiteur Orianne', 'verified', 'Martinique', 'Fort-de-France', '+596 696 88 75 28', '+596 696 88 75 28', NULL, 'Spécialiste Seafood Boil & Landfood, Bao Buns, Nems, Burgers, Verrines créoles, Desserts & Cocktails dînatoires.', 'Traiteur événementiel basé en Martinique, spécialisé Seafood Boils et cocktails dînatoires haut de gamme.', 'Plats généreux et savoureux — Prestations sur mesure — Produits de saison', 'Seafood Boil, Landfood, Bao Buns, Nems, Mini Burgers, Pizzas, Verrines créoles, Desserts', '/vendors/sweet-family/cocktails-mignardises-hero.webp', '/vendors/sweet-family/drive-reimport/IMG-20260627-WA0003.jpg', 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]', '#fff7ed', 'à confirmer', 'public confirmé', true, true, false, '["Spécialiste Seafood Boil & Landfood","Prestations sur mesure","Grande capacité de service","Qualité et générosité"]'::jsonb, '["/vendors/sweet-family/cocktails-mignardises-menu.webp","/vendors/sweet-family/bao-buns-menu.webp","/vendors/sweet-family/seafood-boil-1.webp"]'::jsonb, 12, now(), now());
  END IF;
END $$;

-- Saveurs d'Afrique
DO $$
BEGIN
  UPDATE public.vendors
     SET business_name = 'Saveurs d''Afrique',
         legal_name = 'SAVEURS D''AFRIQUE',
         status = 'verified',
         zone_label = 'Cluny',
         commune = 'Rivière-Salée',
         phone = '0596 68 12 25',
         whatsapp = '0596 68 12 25',
         email = NULL,
         description = 'Cuisine africaine, buffet, traiteur et commandes groupe.',
         story = 'Saveurs d''Afrique propose des spécialités africaines et créoles. Fiche en cours de validation avec la partenaire.',
         promise = 'Cuisine maison, portions généreuses — fiche en cours de validation',
         specialty = 'Spécialités africaines et créoles',
         hero_image = '/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0155.jpg',
         portrait_image = '/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0156.jpg',
         gradient = 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]',
         accent = '#fff7ed',
         photo_status = 'à confirmer',
         public_display_status = 'public confirmé',
         is_public = true,
         is_active = true,
         is_demo = false,
         highlights = '["Cuisine africaine et créole","Commune : Cluny","Fiche en cours de validation","Photos et descriptions à valider"]'::jsonb,
         gallery_images = '["/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0155.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0156.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0157.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0158.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0159.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0160.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0161.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0163.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0164.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0141.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0142.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0205.jpg"]'::jsonb,
         delivery_radius_km = 12,
         updated_at = now()
   WHERE lower(coalesce(business_name, name)) = lower('Saveurs d''Afrique')
      OR lower(name) = lower('Saveurs d''Afrique');

  IF NOT FOUND THEN
    INSERT INTO public.vendors (name, business_name, legal_name, status, zone_label, commune, phone, whatsapp, email, description, story, promise, specialty, hero_image, portrait_image, gradient, accent, photo_status, public_display_status, is_public, is_active, is_demo, highlights, gallery_images, delivery_radius_km, created_at, updated_at)
    VALUES ('Saveurs d''Afrique', 'Saveurs d''Afrique', 'SAVEURS D''AFRIQUE', 'verified', 'Cluny', 'Rivière-Salée', '0596 68 12 25', '0596 68 12 25', NULL, 'Cuisine africaine, buffet, traiteur et commandes groupe.', 'Saveurs d''Afrique propose des spécialités africaines et créoles. Fiche en cours de validation avec la partenaire.', 'Cuisine maison, portions généreuses — fiche en cours de validation', 'Spécialités africaines et créoles', '/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0155.jpg', '/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0156.jpg', 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]', '#fff7ed', 'à confirmer', 'public confirmé', true, true, false, '["Cuisine africaine et créole","Commune : Cluny","Fiche en cours de validation","Photos et descriptions à valider"]'::jsonb, '["/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0155.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0156.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0157.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0158.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0159.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0160.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0161.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0163.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260526-WA0164.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0141.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0142.jpg","/vendors/saveurs-afrique/drive-reimport/IMG-20260612-WA0205.jpg"]'::jsonb, 12, now(), now());
  END IF;
END $$;

-- Chef à Mada
DO $$
BEGIN
  UPDATE public.vendors
     SET business_name = 'Chef à Mada',
         legal_name = 'Chef à Mada',
         status = 'verified',
         zone_label = 'Fort-de-France',
         commune = 'Fort-de-France',
         phone = NULL,
         whatsapp = NULL,
         email = NULL,
         description = 'Traiteur malgache et créole — ateliers culinaires, plats sur commande, événements.',
         story = 'Association Loi 1901 basée à Fort-de-France qui promeut la cuisine malgache et créole à travers ateliers, prestations traiteur et événements culturels.',
         promise = 'Cuisine malgacho-créole authentique — ateliers et traiteur sur commande',
         specialty = 'Cuisine malgache et créole, rougail, poulet massalé, samoussas, ateliers culinaires',
         hero_image = '/vendors/chef-a-mada/logo.jpg',
         portrait_image = '/vendors/chef-a-mada/logo.jpg',
         gradient = 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]',
         accent = '#fff7ed',
         photo_status = 'à confirmer',
         public_display_status = 'public confirmé',
         is_public = true,
         is_active = true,
         is_demo = false,
         highlights = '["Association Loi 1901","Cuisine malgache et créole","Fort-de-France","Ateliers culinaires","HelloAsso"]'::jsonb,
         gallery_images = '["/vendors/chef-a-mada/logo.jpg"]'::jsonb,
         delivery_radius_km = 12,
         updated_at = now()
   WHERE lower(coalesce(business_name, name)) = lower('Chef à Mada')
      OR lower(name) = lower('Chef à Mada');

  IF NOT FOUND THEN
    INSERT INTO public.vendors (name, business_name, legal_name, status, zone_label, commune, phone, whatsapp, email, description, story, promise, specialty, hero_image, portrait_image, gradient, accent, photo_status, public_display_status, is_public, is_active, is_demo, highlights, gallery_images, delivery_radius_km, created_at, updated_at)
    VALUES ('Chef à Mada', 'Chef à Mada', 'Chef à Mada', 'verified', 'Fort-de-France', 'Fort-de-France', NULL, NULL, NULL, 'Traiteur malgache et créole — ateliers culinaires, plats sur commande, événements.', 'Association Loi 1901 basée à Fort-de-France qui promeut la cuisine malgache et créole à travers ateliers, prestations traiteur et événements culturels.', 'Cuisine malgacho-créole authentique — ateliers et traiteur sur commande', 'Cuisine malgache et créole, rougail, poulet massalé, samoussas, ateliers culinaires', '/vendors/chef-a-mada/logo.jpg', '/vendors/chef-a-mada/logo.jpg', 'from-[#7c2d12] via-[#d97706] to-[#f59e0b]', '#fff7ed', 'à confirmer', 'public confirmé', true, true, false, '["Association Loi 1901","Cuisine malgache et créole","Fort-de-France","Ateliers culinaires","HelloAsso"]'::jsonb, '["/vendors/chef-a-mada/logo.jpg"]'::jsonb, 12, now(), now());
  END IF;
END $$;

COMMIT;
