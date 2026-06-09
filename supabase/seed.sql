-- DELIKREOL — Seed Data
-- 5 traiteurs, 34 communes, delivery rules

-- Delivery Rules (34 communes Martinique)
insert into delivery_rules (commune, zone_type, min_amount_free_delivery, delivery_fee, extended_delivery_threshold, is_active) values
  ('Fort-de-France', 'proche', 0, 0, 40, true),
  ('Lamentin', 'proche', 0, 0, 40, true),
  ('Schoelcher', 'proche', 0, 0, 40, true),
  ('Saint-Joseph', 'proche', 0, 0, 40, true),
  ('Case-Pilote', 'éloignée', 15, 5, 40, true),
  ('Bellefontaine', 'éloignée', 15, 5, 40, true),
  ('Fonds-Saint-Denis', 'éloignée', 15, 5, 40, true),
  ('Saint-Pierre', 'éloignée', 15, 5, 40, true),
  ('Carbet', 'éloignée', 15, 5, 40, true),
  ('Morne-Rouge', 'éloignée', 15, 5, 40, true),
  ('Ajoupa-Bouillon', 'éloignée', 15, 5, 40, true),
  ('Basse-Pointe', 'éloignée', 15, 5, 40, true),
  ('Macouba', 'éloignée', 15, 5, 40, true),
  ('Grand-Rivière', 'éloignée', 15, 5, 40, true),
  ('Prêcheur', 'éloignée', 15, 5, 40, true),
  ('Ducos', 'proche', 0, 0, 40, true),
  ('Rivière-Salée', 'éloignée', 15, 5, 40, true),
  ('Trois-Îlets', 'éloignée', 15, 5, 40, true),
  ('Anses-d''Arlet', 'éloignée', 15, 5, 40, true),
  ('Diamant', 'éloignée', 15, 5, 40, true),
  ('Saint-Luce', 'éloignée', 15, 5, 40, true),
  ('Rivière-Pilote', 'éloignée', 15, 5, 40, true),
  ('Sainte-Anne', 'éloignée', 15, 5, 40, true),
  ('Marin', 'éloignée', 15, 5, 40, true),
  ('Vauclin', 'éloignée', 15, 5, 40, true),
  ('François', 'éloignée', 15, 5, 40, true),
  ('Saint-Esprit', 'éloignée', 15, 5, 40, true),
  ('Robert', 'proche', 0, 0, 40, true),
  ('Trinité', 'éloignée', 15, 5, 40, true),
  ('Sainte-Marie', 'éloignée', 15, 5, 40, true),
  ('Gros-Morne', 'éloignée', 15, 5, 40, true),
  ('Lorrain', 'éloignée', 15, 5, 40, true),
  ('Marigot', 'éloignée', 15, 5, 40, true),
  ('Sainte-Marie (Nord)', 'éloignée', 15, 5, 40, true);

-- Admin settings
insert into admin_settings (key, value) values
  ('whatsapp_number', '"596696653589"'),
  ('contact_email', '"contact@delikreol.mq"'),
  ('delivery_threshold', '40'),
  ('site_name', '"DeliKreol"'),
  ('site_version', '"1.0.0"'),
  ('order_mode', '"whatsapp_first"'),
  ('stripe_test_mode', 'true'),
  ('paiement_actif', 'false');