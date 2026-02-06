/*
  # Seed Demo Data for DELIKREOL

  This migration inserts realistic demonstration data for showcasing the platform
  to new collaborators and partners.

  1. New Data
    - 6 vendors (restaurants, producers, merchants) across Martinique
    - 18 products across various categories with realistic prices
    - 4 relay points in key locations (Fort-de-France, Le Lamentin, Sainte-Anne, Le Marin)

  2. Important Notes
    - All vendors are created without user_id (standalone demo entries)
    - Products reference their respective vendor IDs dynamically
    - Relay points are created with realistic capacity and location data
    - Uses IF NOT EXISTS checks via business_name to avoid duplicate inserts
*/

DO $$
DECLARE
  v_tatie uuid;
  v_case uuid;
  v_verger uuid;
  v_boulangerie uuid;
  v_pecherie uuid;
  v_epicerie uuid;
  r_fdf uuid;
  r_lamentin uuid;
  r_stanine uuid;
  r_marin uuid;
BEGIN
  -- Check if demo data already exists
  IF EXISTS (SELECT 1 FROM vendors WHERE business_name = 'Chez Tatie Mireille') THEN
    RAISE NOTICE 'Demo data already exists, skipping seed';
    RETURN;
  END IF;

  -- Insert Vendors
  INSERT INTO vendors (business_name, business_type, description, address, latitude, longitude, phone, commission_rate, is_active, delivery_radius_km)
  VALUES ('Chez Tatie Mireille', 'restaurant', 'Cuisine creole traditionnelle, plats faits maison avec amour', 'Rue Victor Hugo, Fort-de-France', 14.6037, -61.0588, '0696 12 34 56', 15, true, 20)
  RETURNING id INTO v_tatie;

  INSERT INTO vendors (business_name, business_type, description, address, latitude, longitude, phone, commission_rate, is_active, delivery_radius_km)
  VALUES ('La Case a Rhum', 'restaurant', 'Bar-restaurant avec vue mer, specialites grillades et poissons', 'Boulevard Allegre, Le Lamentin', 14.6137, -60.9578, '0696 23 45 67', 18, true, 15)
  RETURNING id INTO v_case;

  INSERT INTO vendors (business_name, business_type, description, address, latitude, longitude, phone, commission_rate, is_active, delivery_radius_km)
  VALUES ('Verger Tropical', 'producer', 'Fruits exotiques frais et jus naturels de Martinique', 'Chemin Rural, Sainte-Anne', 14.4374, -60.8643, '0696 34 56 78', 12, true, 25)
  RETURNING id INTO v_verger;

  INSERT INTO vendors (business_name, business_type, description, address, latitude, longitude, phone, commission_rate, is_active, delivery_radius_km)
  VALUES ('Boulangerie du Marin', 'merchant', 'Pains artisanaux, viennoiseries et patisseries creoles', 'Place de la Mairie, Le Marin', 14.4683, -60.8711, '0696 45 67 89', 10, true, 10)
  RETURNING id INTO v_boulangerie;

  INSERT INTO vendors (business_name, business_type, description, address, latitude, longitude, phone, commission_rate, is_active, delivery_radius_km)
  VALUES ('Pecherie du Robert', 'producer', 'Poissons frais et fruits de mer peches du jour', 'Quai des Pecheurs, Le Robert', 14.6769, -60.9370, '0696 56 78 90', 14, true, 18)
  RETURNING id INTO v_pecherie;

  INSERT INTO vendors (business_name, business_type, description, address, latitude, longitude, phone, commission_rate, is_active, delivery_radius_km)
  VALUES ('Epicerie Fine Antillaise', 'merchant', 'Produits locaux premium, epices, rhums et confitures', 'Avenue des Caraibes, Schoelcher', 14.6155, -61.0879, '0696 67 89 01', 16, false, 12)
  RETURNING id INTO v_epicerie;

  -- Insert Products
  INSERT INTO products (vendor_id, name, description, category, price, is_available, stock_quantity) VALUES
    (v_tatie, 'Colombo de poulet', 'Poulet marine aux epices colombo, riz et haricots rouges', 'Plats', 12.50, true, 25),
    (v_tatie, 'Accras de morue (12 pcs)', 'Beignets croustillants a la morue et piment vegetarien', 'Entrees', 8.00, true, 40),
    (v_tatie, 'Poulet boucane', 'Poulet fume au bois de canne, sauce chien maison', 'Plats', 14.00, true, 15),
    (v_tatie, 'Gratin de christophine', 'Christophine gratinee au four avec fromage local', 'Accompagnements', 6.50, true, 20),
    (v_tatie, 'Court-bouillon de poisson', 'Poisson mijote sauce tomate et piment', 'Plats', 13.00, true, 18),
    (v_case, 'Langouste grillee', 'Langouste fraiche grillee, beurre citron vert', 'Plats', 35.00, true, 8),
    (v_case, 'Ti-punch traditionnel', 'Rhum blanc AOC, citron vert, sirop de canne', 'Boissons', 5.50, true, 100),
    (v_verger, 'Panier fruits exotiques', 'Mangues, ananas, fruits de la passion, goyaves', 'Paniers', 18.00, true, 12),
    (v_verger, 'Jus de goyave frais (1L)', 'Jus 100% naturel, sans sucre ajoute', 'Boissons', 4.50, true, 30),
    (v_verger, 'Confiture de maracuja', 'Pot artisanal 250g, recette familiale', 'Epicerie', 7.00, true, 45),
    (v_boulangerie, 'Pain au beurre creole', 'Viennoiserie briochee, specialite antillaise', 'Boulangerie', 2.50, true, 50),
    (v_boulangerie, 'Tourment d''amour', 'Gateau coco et confiture de goyave', 'Patisserie', 3.50, true, 35),
    (v_boulangerie, 'Flan coco maison', 'Flan onctueux a la noix de coco rapee', 'Patisserie', 4.00, true, 20),
    (v_pecherie, 'Filet de dorade coryphene', 'Dorade fraiche pechee du jour, 300g', 'Poissons', 16.00, true, 10),
    (v_pecherie, 'Crevettes geantes (500g)', 'Crevettes fraiches de Martinique', 'Fruits de mer', 22.00, false, 0),
    (v_epicerie, 'Rhum vieux 10 ans', 'Rhum AOC Martinique, vieilli en fut de chene', 'Spiritueux', 45.00, true, 15),
    (v_epicerie, 'Epices colombo (100g)', 'Melange d''epices traditionnel fait main', 'Epicerie', 5.00, true, 60),
    (v_epicerie, 'Sauce chien maison', 'Sauce pimentee aux herbes fraiches, 250ml', 'Epicerie', 6.00, true, 35);

  -- Insert Relay Points
  INSERT INTO relay_points (name, address, latitude, longitude, type, is_active, parking_available, pmr_accessible, rating, total_pickups, capacity_notes)
  VALUES ('Relais Fort-de-France Centre', 'Rue Victor Hugo, Fort-de-France', 14.6037, -61.0588, 'partner_store', true, false, true, 4.7, 156, 'Capacite 30 colis, froid disponible')
  RETURNING id INTO r_fdf;

  INSERT INTO relay_points (name, address, latitude, longitude, type, is_active, parking_available, pmr_accessible, rating, total_pickups, capacity_notes)
  VALUES ('Relais Lamentin Centre Commercial', 'Centre Commercial La Galleria, Le Lamentin', 14.6137, -60.9578, 'partner_store', true, true, true, 4.5, 234, 'Grande capacite, parking gratuit')
  RETURNING id INTO r_lamentin;

  INSERT INTO relay_points (name, address, latitude, longitude, type, is_active, parking_available, pmr_accessible, rating, total_pickups, capacity_notes)
  VALUES ('Relais Sainte-Anne Bourg', 'Place du Marche, Sainte-Anne', 14.4374, -60.8643, 'vendor_location', true, true, false, 4.8, 89, 'Petit relais communal, ambiance marche')
  RETURNING id INTO r_stanine;

  INSERT INTO relay_points (name, address, latitude, longitude, type, is_active, parking_available, pmr_accessible, rating, total_pickups, capacity_notes)
  VALUES ('Relais Le Marin Port', 'Quai Ouest, Le Marin', 14.4683, -60.8711, 'partner_store', false, true, true, 4.2, 45, 'Temporairement ferme pour renovation')
  RETURNING id INTO r_marin;

  -- Insert Storage Capacities for relay points
  INSERT INTO storage_capacities (relay_point_id, storage_type, total_capacity, current_usage, temperature_min, temperature_max, equipment_type) VALUES
    (r_fdf, 'cold', 15, 7, 2, 8, 'Refrigerateur commercial'),
    (r_fdf, 'dry', 20, 9, NULL, NULL, 'Etageres metalliques'),
    (r_lamentin, 'cold', 25, 18, 2, 8, 'Chambre froide'),
    (r_lamentin, 'dry', 40, 15, NULL, NULL, 'Rayonnage industriel'),
    (r_lamentin, 'frozen', 10, 3, -18, -12, 'Congelateur coffre'),
    (r_stanine, 'dry', 10, 2, NULL, NULL, 'Etageres bois'),
    (r_marin, 'cold', 12, 0, 2, 8, 'Refrigerateur'),
    (r_marin, 'dry', 15, 0, NULL, NULL, 'Etageres');

  RAISE NOTICE 'Demo data seeded successfully';
END $$;
