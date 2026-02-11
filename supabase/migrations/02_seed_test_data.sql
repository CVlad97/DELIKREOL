-- ============================================
-- SEED DATA: Test data for DELIKREOL
-- Date: 2026-02-11
-- Objectif: Injecter données de test pour valider tous les flows
-- ============================================

-- Note: This script uses hardcoded UUIDs for reproducibility
-- In production, users would be created via Supabase Auth

-- ==================== PROFILES ====================
-- Admin user
INSERT INTO public.profiles (id, role, full_name, phone, created_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin', 'Admin DeliKreol', '+596696001111', NOW())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- Vendors
INSERT INTO public.profiles (id, role, full_name, phone, created_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'vendor', 'Marie-Josée Accras', '+596696002222', NOW()),
  ('22222222-2222-2222-2222-222222222223', 'vendor', 'Jean-Claude Colombo', '+596696002223', NOW()),
  ('22222222-2222-2222-2222-222222222224', 'vendor', 'Sylvie Poisson', '+596696002224', NOW())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- Relay hosts
INSERT INTO public.profiles (id, role, full_name, phone, created_at)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'relay_host', 'Point Relais Fort-de-France', '+596696003333', NOW()),
  ('33333333-3333-3333-3333-333333333334', 'relay_host', 'Point Relais Lamentin', '+596696003334', NOW()),
  ('33333333-3333-3333-3333-333333333335', 'relay_host', 'Point Relais Schoelcher', '+596696003335', NOW())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- Drivers
INSERT INTO public.profiles (id, role, full_name, phone, created_at)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'driver', 'Michaël Livraison', '+596696004444', NOW()),
  ('44444444-4444-4444-4444-444444444445', 'driver', 'Sophie Route', '+596696004445', NOW())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- Clients
INSERT INTO public.profiles (id, role, full_name, phone, created_at)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'client', 'Pierre Dupont', '+596696005555', NOW()),
  ('55555555-5555-5555-5555-555555555556', 'client', 'Lucie Martin', '+596696005556', NOW()),
  ('55555555-5555-5555-5555-555555555557', 'client', 'Antoine Bernard', '+596696005557', NOW())
ON CONFLICT (id) DO UPDATE SET
  role = EXCLUDED.role,
  full_name = EXCLUDED.full_name,
  phone = EXCLUDED.phone;

-- ==================== VENDORS ====================
INSERT INTO public.vendors (id, user_id, name, address, zone_label, is_active, created_at)
VALUES 
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 
   'Les Accras de Marie-Jo', '12 Rue Victor Hugo, Fort-de-France 97200', 'Fort-de-France', true, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaab', '22222222-2222-2222-2222-222222222223', 
   'Colombo du Chef Jean-Claude', '45 Avenue des Tropiques, Lamentin 97232', 'Lamentin', true, NOW()),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaac', '22222222-2222-2222-2222-222222222224', 
   'Poissonnerie Sylvie', '8 Quai des Pêcheurs, Schoelcher 97233', 'Schoelcher', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== RELAY POINTS ====================
INSERT INTO public.relay_points (id, user_id, name, address, zone_label, capacity, is_active, created_at)
VALUES 
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '33333333-3333-3333-3333-333333333333',
   'Relais Central FdF', '25 Rue de la République, Fort-de-France 97200', 'Fort-de-France', 50, true, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc', '33333333-3333-3333-3333-333333333334',
   'Relais Lamentin Zone Commerciale', '102 Route Nationale 1, Lamentin 97232', 'Lamentin', 30, true, NOW()),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd', '33333333-3333-3333-3333-333333333335',
   'Relais Schoelcher Plage', '18 Boulevard de la Mer, Schoelcher 97233', 'Schoelcher', 20, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== DRIVERS ====================
INSERT INTO public.drivers (id, user_id, vehicle_type, zone_label, is_active, created_at)
VALUES 
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', '44444444-4444-4444-4444-444444444444',
   'scooter', 'Fort-de-France', true, NOW()),
  ('cccccccc-cccc-cccc-cccc-cccccccccccd', '44444444-4444-4444-4444-444444444445',
   'car', 'Lamentin', true, NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== CLIENT REQUESTS ====================
INSERT INTO public.client_requests (id, user_id, address, zone_label, delivery_mode, relay_point_id, 
  request_text, desired_slot, status, admin_notes, created_at, updated_at)
VALUES 
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', '55555555-5555-5555-5555-555555555555',
   '32 Rue Schoelcher, Fort-de-France 97200', 'Fort-de-France', 'home_delivery', NULL,
   'Commande accras x10 + sauce chien', '2026-02-12 12:00-14:00', 'pending', NULL, NOW(), NOW()),
  ('dddddddd-dddd-dddd-dddd-ddddddddddde', '55555555-5555-5555-5555-555555555556',
   NULL, 'Lamentin', 'relay_pickup', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbc',
   'Colombo poulet 2 parts + riz', '2026-02-13 18:00-20:00', 'pending', NULL, NOW(), NOW()),
  ('dddddddd-dddd-dddd-dddd-dddddddddddf', '55555555-5555-5555-5555-555555555557',
   NULL, 'Schoelcher', 'relay_pickup', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbd',
   'Poisson frais 1kg + citrons', '2026-02-14 10:00-12:00', 'approved', 'Prêt pour livraison', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== LOYALTY POINTS ====================
INSERT INTO public.loyalty_points (user_id, balance, updated_at)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 150.00, NOW()),
  ('55555555-5555-5555-5555-555555555556', 75.50, NOW()),
  ('55555555-5555-5555-5555-555555555557', 200.00, NOW())
ON CONFLICT (user_id) DO UPDATE SET
  balance = EXCLUDED.balance,
  updated_at = EXCLUDED.updated_at;

-- ==================== LOYALTY EVENTS ====================
INSERT INTO public.loyalty_events (id, user_id, delta, reason, related_request_id, created_at)
VALUES 
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '55555555-5555-5555-5555-555555555555',
   50.00, 'Inscription nouveau client', NULL, NOW() - INTERVAL '10 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeef', '55555555-5555-5555-5555-555555555555',
   100.00, 'Commande complétée', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW() - INTERVAL '5 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeef0', '55555555-5555-5555-5555-555555555556',
   50.00, 'Inscription nouveau client', NULL, NOW() - INTERVAL '8 days'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeef1', '55555555-5555-5555-5555-555555555556',
   25.50, 'Commande complétée', 'dddddddd-dddd-dddd-dddd-ddddddddddde', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- ==================== INVESTMENT PROJECTS ====================
INSERT INTO public.investment_projects (id, title, description, project_type, target_points, 
  collected_points, status, zone_label, created_at, updated_at)
VALUES 
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 
   'Cuisine Partagée Fort-de-France',
   'Installation d''une cuisine partagée professionnelle pour les producteurs locaux du centre-ville',
   'infrastructure', 5000.00, 2350.00, 'funding', 'Fort-de-France', NOW(), NOW()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff1',
   'Frigo Collectif Lamentin',
   'Chambre froide mutualisée pour les pêcheurs et maraîchers de la zone',
   'equipment', 3000.00, 3000.00, 'completed', 'Lamentin', NOW() - INTERVAL '30 days', NOW()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff2',
   'Formation HACCP Martinique',
   'Programme de formation HACCP pour 50 producteurs locaux',
   'training', 2000.00, 450.00, 'funding', 'Martinique', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ==================== INVESTMENT CONTRIBUTIONS ====================
INSERT INTO public.investment_contributions (id, user_id, project_id, contribution_points, source, created_at)
VALUES 
  ('gggggggg-gggg-gggg-gggg-gggggggggggg', '55555555-5555-5555-5555-555555555555',
   'ffffffff-ffff-ffff-ffff-ffffffffffff', 50.00, 'loyalty_conversion', NOW() - INTERVAL '7 days'),
  ('gggggggg-gggg-gggg-gggg-gggggggggggh', '55555555-5555-5555-5555-555555555557',
   'ffffffff-ffff-ffff-ffff-ffffffffffff', 100.00, 'loyalty_conversion', NOW() - INTERVAL '5 days'),
  ('gggggggg-gggg-gggg-gggg-ggggggggggg2', '55555555-5555-5555-5555-555555555556',
   'ffffffff-ffff-ffff-ffff-ffffffffffff2', 25.50, 'loyalty_conversion', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;

-- ==================== INVESTMENT PREFERENCES ====================
INSERT INTO public.investment_preferences (user_id, mode, auto_ratio, preferred_project_types, updated_at)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'manual', 0.00, ARRAY['infrastructure'], NOW()),
  ('55555555-5555-5555-5555-555555555556', 'auto', 0.10, ARRAY['training', 'equipment'], NOW()),
  ('55555555-5555-5555-5555-555555555557', 'auto', 0.20, ARRAY['infrastructure', 'training'], NOW())
ON CONFLICT (user_id) DO UPDATE SET
  mode = EXCLUDED.mode,
  auto_ratio = EXCLUDED.auto_ratio,
  preferred_project_types = EXCLUDED.preferred_project_types,
  updated_at = EXCLUDED.updated_at;

-- ==================== PROJECT OWNERS ====================
INSERT INTO public.project_owners (project_id, user_id, role, created_at)
VALUES 
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', '22222222-2222-2222-2222-222222222222', 'lead', NOW()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff1', '22222222-2222-2222-2222-222222222224', 'lead', NOW()),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff2', '22222222-2222-2222-2222-222222222223', 'contributor', NOW())
ON CONFLICT (project_id, user_id) DO NOTHING;

-- ==================== SUCCESS MESSAGE ====================
DO $$ 
DECLARE
  profile_count INT;
  vendor_count INT;
  relay_count INT;
  driver_count INT;
  request_count INT;
BEGIN
  SELECT COUNT(*) INTO profile_count FROM public.profiles;
  SELECT COUNT(*) INTO vendor_count FROM public.vendors;
  SELECT COUNT(*) INTO relay_count FROM public.relay_points;
  SELECT COUNT(*) INTO driver_count FROM public.drivers;
  SELECT COUNT(*) INTO request_count FROM public.client_requests;
  
  RAISE NOTICE '✅ Données de test injectées avec succès:';
  RAISE NOTICE '   - % profiles (1 admin, 3 vendors, 3 relay_hosts, 2 drivers, 3 clients)', profile_count;
  RAISE NOTICE '   - % vendors', vendor_count;
  RAISE NOTICE '   - % relay points', relay_count;
  RAISE NOTICE '   - % drivers', driver_count;
  RAISE NOTICE '   - % client requests', request_count;
END $$;
