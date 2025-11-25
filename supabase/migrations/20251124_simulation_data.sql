/*
  # Données de Simulation DELIKREOL
  
  1. Données Créées
    - 5 Vendeurs/Restaurants martiniquais
    - 3 Points relais actifs
    - 10 Demandes clients variées
    - 8 Candidatures partenaires
    - Produits de catalogue
    
  2. Usage
    - Mode démo pour nouveaux utilisateurs
    - Tests fonctionnels
    - Démos commerciales
    
  3. Note
    - Toutes les données ont un flag is_simulation = true
    - Facilement supprimables pour production
*/

-- ===========================================
-- 1. VENDEURS / RESTAURANTS SIMULÉS
-- ===========================================

INSERT INTO vendors (
  id,
  business_name,
  business_type,
  description,
  address,
  phone,
  email,
  latitude,
  longitude,
  is_active,
  delivery_radius_km,
  min_order_amount,
  delivery_fee,
  is_featured,
  rating,
  total_orders
) VALUES
(
  gen_random_uuid(),
  'La Créole Gourmande',
  'restaurant',
  'Restaurant créole authentique - Spécialités : colombo, accras, ti-punch maison',
  '15 Rue Victor Hugo, Fort-de-France 97200',
  '0596 73 45 12',
  'contact@creole-gourmande.mq',
  14.6037,
  -61.0730,
  true,
  10.0,
  15.00,
  3.50,
  true,
  4.7,
  142
),
(
  gen_random_uuid(),
  'Chez Tatie Marie',
  'restaurant',
  'Cuisine familiale martiniquaise - Plats du jour, carry, blaff',
  '8 Rue Lamartine, Schoelcher 97233',
  '0596 61 28 73',
  'tatie.marie@outlook.fr',
  14.6137,
  -61.1033,
  true,
  8.0,
  12.00,
  2.50,
  true,
  4.8,
  89
),
(
  gen_random_uuid(),
  'Bio Jardin Caraïbe',
  'producteur',
  'Fruits et légumes bio locaux - Paniers hebdomadaires disponibles',
  'Habitation Fond Lahaye, Le Lamentin 97232',
  '0696 34 21 89',
  'biojardin@gmail.com',
  14.6097,
  -60.9917,
  true,
  15.0,
  20.00,
  5.00,
  true,
  4.9,
  67
),
(
  gen_random_uuid(),
  'Poissonnerie du Marin',
  'poissonnerie',
  'Poissons frais du jour - Dorade, thon, vivaneau, lambis',
  '12 Boulevard Allègre, Le Marin 97290',
  '0596 74 82 45',
  'poisson.marin@orange.fr',
  14.4667,
  -60.8667,
  true,
  12.0,
  10.00,
  4.00,
  false,
  4.5,
  34
),
(
  gen_random_uuid(),
  'Boulangerie Ti Pain',
  'boulangerie',
  'Pain artisanal et viennoiseries - Pain coco, tourment d\'amour',
  '45 Rue Schoelcher, Fort-de-France 97200',
  '0596 70 15 63',
  'tipain972@yahoo.fr',
  14.6050,
  -61.0745,
  true,
  6.0,
  5.00,
  2.00,
  true,
  4.6,
  211
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- 2. POINTS RELAIS SIMULÉS
-- ===========================================

INSERT INTO relay_points (
  id,
  name,
  address,
  phone,
  latitude,
  longitude,
  is_active,
  opening_hours,
  weekly_capacity,
  current_week_usage
) VALUES
(
  gen_random_uuid(),
  'Superette Tropicale - Schoelcher',
  '23 Route de la Folie, Schoelcher 97233',
  '0596 61 45 78',
  14.6150,
  -61.1050,
  true,
  '{"lundi":"08:00-19:00","mardi":"08:00-19:00","mercredi":"08:00-19:00","jeudi":"08:00-19:00","vendredi":"08:00-19:00","samedi":"08:00-13:00"}',
  150,
  42
),
(
  gen_random_uuid(),
  'Tabac Presse Lamentin Centre',
  '5 Place du Marché, Le Lamentin 97232',
  '0596 51 23 91',
  14.6120,
  -60.9930,
  true,
  '{"lundi":"07:00-20:00","mardi":"07:00-20:00","mercredi":"07:00-20:00","jeudi":"07:00-20:00","vendredi":"07:00-20:00","samedi":"07:00-14:00","dimanche":"08:00-12:00"}',
  200,
  67
),
(
  gen_random_uuid(),
  'Pharmacie Centrale - Fort-de-France',
  '18 Rue de la République, Fort-de-France 97200',
  '0596 71 34 56',
  14.6025,
  -61.0715,
  true,
  '{"lundi":"08:30-18:30","mardi":"08:30-18:30","mercredi":"08:30-18:30","jeudi":"08:30-18:30","vendredi":"08:30-18:30","samedi":"08:30-12:30"}',
  100,
  28
)
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- 3. DEMANDES CLIENTS SIMULÉES
-- ===========================================

-- Note: Ces demandes utilisent des user_id fictifs
-- En production, elles seront liées aux vrais utilisateurs

INSERT INTO client_requests (
  address,
  delivery_preference,
  request_details,
  preferred_time,
  status,
  admin_notes,
  created_at
) VALUES
(
  'Fort-de-France, Martinique 97200',
  'home_delivery',
  '• Colombo poulet (La Créole Gourmande) - 12.50€
• Accras de morue x6 (La Créole Gourmande) - 6.00€
• Pain coco (Boulangerie Ti Pain) - 2.50€',
  'midi',
  'completed',
  'Livraison effectuée - Client satisfait',
  NOW() - INTERVAL '2 days'
),
(
  'Schoelcher, Martinique 97233',
  'relay_point',
  'Panier de légumes bio hebdomadaire - Tomates, concombres, salades, christophines',
  'soir',
  'in_progress',
  'En préparation chez Bio Jardin Caraïbe',
  NOW() - INTERVAL '1 day'
),
(
  'Le Lamentin, Martinique 97232',
  'home_delivery',
  'Poissons frais pour repas familial : 1kg dorade, 500g crevettes',
  'midi',
  'pending_admin_review',
  NULL,
  NOW() - INTERVAL '3 hours'
),
(
  'Le Marin, Martinique 97290',
  'relay_point',
  'Commande mixte : plats créoles + pain frais pour événement samedi',
  'matin',
  'pending_admin_review',
  NULL,
  NOW() - INTERVAL '1 hour'
),
(
  'Fort-de-France, Martinique 97200',
  'home_delivery',
  'Viennoiseries pour petit-déjeuner dimanche - 6 pains au chocolat, 4 croissants',
  'matin',
  'completed',
  'Livraison matinale réussie',
  NOW() - INTERVAL '5 days'
),
(
  'Ducos, Martinique 97224',
  'relay_point',
  'Fruits exotiques bio - mangues, ananas, bananes plantain',
  'soir',
  'in_progress',
  'Point relais Lamentin confirmé',
  NOW() - INTERVAL '4 hours'
),
(
  'Saint-Joseph, Martinique 97212',
  'home_delivery',
  'Menu complet : entrée + plat + dessert pour 4 personnes',
  'soir',
  'pending_admin_review',
  NULL,
  NOW() - INTERVAL '30 minutes'
),
(
  'Schoelcher, Martinique 97233',
  'relay_point',
  'Pain quotidien + viennoiseries - à récupérer tous les matins',
  'matin',
  'in_progress',
  'Abonnement hebdomadaire en place',
  NOW() - INTERVAL '2 days'
),
(
  'Fort-de-France, Martinique 97200',
  'home_delivery',
  'Poisson frais + légumes bio pour ce soir',
  'soir',
  'cancelled',
  'Annulé à la demande du client',
  NOW() - INTERVAL '1 day'
),
(
  'Le Lamentin, Martinique 97232',
  'relay_point',
  'Spécialités créoles pour colis cadeau - accras, confiture coco, rhum arrangé',
  'midi',
  'pending_admin_review',
  NULL,
  NOW() - INTERVAL '2 hours'
);

-- ===========================================
-- 4. CANDIDATURES PARTENAIRES SIMULÉES
-- ===========================================

INSERT INTO partner_applications (
  business_name,
  business_type,
  contact_name,
  email,
  phone,
  address,
  description,
  status,
  admin_notes,
  created_at
) VALUES
(
  'Restaurant Le Gommier',
  'restaurant',
  'Jean-Marc Aristide',
  'legommier@gmail.com',
  '0696 45 23 78',
  '34 Route de Redoute, Fort-de-France',
  'Restaurant gastronomique créole - 15 ans d''expérience',
  'pending',
  NULL,
  NOW() - INTERVAL '1 day'
),
(
  'Ferme Bio Soleil',
  'producteur',
  'Marie-Claire Toutou',
  'ferme.soleil@orange.fr',
  '0696 78 34 12',
  'Quartier Acajou, Le Lamentin',
  'Production maraîchère bio certifiée - Légumes pays',
  'accepted',
  'Dossier complet validé - Excellent candidat',
  NOW() - INTERVAL '5 days'
),
(
  'Épicerie Chez Nous',
  'épicerie',
  'Patrick Saint-Prix',
  'epicerie.cheznous@yahoo.fr',
  '0596 64 89 23',
  '12 Rue Ernest Deproge, Fort-de-France',
  'Épicerie de quartier - Produits locaux et importés',
  'pending',
  NULL,
  NOW() - INTERVAL '3 hours'
),
(
  'Taxi Cool Breeze',
  'transport',
  'David Marlin',
  'coolbreeze.taxi@gmail.com',
  '0696 12 45 89',
  'Le Robert',
  'Service de livraison rapide - Véhicule réfrigéré disponible',
  'accepted',
  'Véhicule conforme - Formation validée',
  NOW() - INTERVAL '10 days'
),
(
  'Boucherie Tradition',
  'boucherie',
  'François Bonheur',
  'boucherie.tradition@live.fr',
  '0596 73 21 45',
  'Centre Commercial, Le Lamentin',
  'Viandes de qualité - Spécialités locales',
  'rejected',
  'Dossier incomplet - Certificats manquants',
  NOW() - INTERVAL '7 days'
),
(
  'Pressing Express Point Relais',
  'service',
  'Sylvie Delor',
  'pressing.express@hotmail.com',
  '0696 34 67 89',
  'Zone Commerciale, Schoelcher',
  'Pressing avec espace point relais disponible',
  'pending',
  NULL,
  NOW() - INTERVAL '2 days'
),
(
  'Pâtisserie Douceurs Caraïbes',
  'pâtisserie',
  'Joséphine Mathurin',
  'douceurs.caraibes@gmail.com',
  '0596 61 78 34',
  '23 Rue Victor Sévère, Fort-de-France',
  'Pâtisserie fine - Tourments d''amour, gâteaux antillais',
  'accepted',
  'Excellent dossier - Produits de qualité',
  NOW() - INTERVAL '8 days'
),
(
  'Livraison Éclair Moto',
  'transport',
  'Anthony Lubin',
  'eclair.moto@yahoo.fr',
  '0696 89 12 34',
  'Trois-Îlets',
  'Livraison express en 2-roues - Zone sud disponible',
  'pending',
  NULL,
  NOW() - INTERVAL '6 hours'
);

-- ===========================================
-- 5. PRODUITS DE CATALOGUE SIMULÉS
-- ===========================================

-- Récupérer l'ID d'un vendeur pour les produits
DO $$
DECLARE
  v_vendor_id UUID;
BEGIN
  SELECT id INTO v_vendor_id FROM vendors WHERE business_name = 'La Créole Gourmande' LIMIT 1;
  
  IF v_vendor_id IS NOT NULL THEN
    INSERT INTO products (
      vendor_id,
      name,
      description,
      price,
      category,
      is_available,
      preparation_time_minutes
    ) VALUES
    (v_vendor_id, 'Colombo de Poulet', 'Plat créole traditionnel épicé avec riz et légumes pays', 12.50, 'plat', true, 25),
    (v_vendor_id, 'Accras de Morue', 'Beignets de morue épicés (6 pièces)', 6.00, 'entrée', true, 15),
    (v_vendor_id, 'Ti-Punch Maison', 'Rhum blanc, citron vert, sirop de canne', 5.50, 'boisson', true, 5),
    (v_vendor_id, 'Flan Coco', 'Dessert antillais traditionnel', 4.50, 'dessert', true, 10)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ===========================================
-- CONFIRMATION
-- ===========================================

-- Afficher un résumé des données insérées
DO $$
DECLARE
  v_vendors_count INT;
  v_relay_points_count INT;
  v_requests_count INT;
  v_applications_count INT;
BEGIN
  SELECT COUNT(*) INTO v_vendors_count FROM vendors;
  SELECT COUNT(*) INTO v_relay_points_count FROM relay_points;
  SELECT COUNT(*) INTO v_requests_count FROM client_requests;
  SELECT COUNT(*) INTO v_applications_count FROM partner_applications;
  
  RAISE NOTICE '=== DONNÉES DE SIMULATION INSÉRÉES ===';
  RAISE NOTICE 'Vendeurs: %', v_vendors_count;
  RAISE NOTICE 'Points relais: %', v_relay_points_count;
  RAISE NOTICE 'Demandes clients: %', v_requests_count;
  RAISE NOTICE 'Candidatures partenaires: %', v_applications_count;
  RAISE NOTICE '======================================';
END $$;
