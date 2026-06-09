-- DELIKREOL — Seed Data
-- Project: boihlgodmclljtckhmgz

-- Delivery rule (seuil livraison éloignée)
insert into delivery_rules (commune, min_order_amount, status, message)
values ('Martinique', 40, 'active',
  'Livraison éloignée possible à partir de 40 € de commande, selon validation du prestataire et disponibilité DeliKreol.'
) on conflict (commune) do nothing;

-- Admin settings
insert into admin_settings (key, value) values
  ('whatsapp_number', '"596696653589"'),
  ('contact_email', '"contact@delikreol.mq"'),
  ('delivery_threshold', '40'),
  ('site_name', '"DeliKreol"'),
  ('order_mode', '"whatsapp_first"'),
  ('paiement_actif', 'false'),
  ('supabase_project', '"boihlgodmclljtckhmgz"')
on conflict (key) do nothing;

-- Project memory init
insert into project_memory (project, section, title, content) values
  ('DELIKREOL', 'supabase', 'Connexion Supabase',
   'Projet Supabase Delikreol lié. Ref: boihlgodmclljtckhmgz. Site: https://cvlad97.github.io/DELIKREOL/. WhatsApp: +596 696 65 35 89. Mode: WhatsApp-first.')
on conflict do nothing;