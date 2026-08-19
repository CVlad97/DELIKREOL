-- DELIKREOL — recrutement logistique indépendant + préparation facturation électronique
-- Statut : migration préparée uniquement. Ne pas appliquer en production sans validation humaine.
--
-- Préconditions :
-- select table_name from information_schema.tables
-- where table_schema = 'public'
--   and table_name in ('driver_applications','relay_point_applications','invoices','invoice_lines','drivers','relay_points');
--
-- Rollback sans perte de données :
-- Les colonnes ajoutées ne sont pas supprimées automatiquement.
-- Pour revenir fonctionnellement en arrière, revert du code applicatif et conserver les données collectées.

alter table if exists public.driver_applications
  add column if not exists siret text,
  add column if not exists legal_status text,
  add column if not exists insurance_confirmed boolean not null default false,
  add column if not exists independent_status_confirmed boolean not null default false,
  add column if not exists terms_confirmed boolean not null default false,
  add column if not exists onboarding_whatsapp_sent_at timestamptz,
  add column if not exists pilot_ready_at timestamptz;

alter table if exists public.relay_point_applications
  add column if not exists siret text,
  add column if not exists relay_type text not null default 'commerce_partenaire'
    check (relay_type in ('commerce_partenaire', 'traiteur_point_relais', 'hub_logistique', 'consigne_refrigeree', 'point_retrait_temporaire')),
  add column if not exists storage text[] not null default '{}',
  add column if not exists pickup_windows text,
  add column if not exists can_receive_drivers boolean not null default false,
  add column if not exists can_act_as_vendor_relay boolean not null default false,
  add column if not exists independent_status_confirmed boolean not null default false,
  add column if not exists hygiene_confirmed boolean not null default false,
  add column if not exists terms_confirmed boolean not null default false,
  add column if not exists onboarding_whatsapp_sent_at timestamptz,
  add column if not exists pilot_ready_at timestamptz;

alter table if exists public.invoices
  add column if not exists partner_kind text
    check (partner_kind in ('vendor','driver','relay_host')),
  add column if not exists partner_id uuid,
  add column if not exists partner_siret text,
  add column if not exists period text,
  add column if not exists electronic_invoicing_status text not null default 'not_transmitted'
    check (electronic_invoicing_status in ('not_transmitted','pdp_required_before_send','ready_for_pdp','transmitted','rejected')),
  add column if not exists compliance_notes jsonb not null default '[]'::jsonb;

create index if not exists idx_driver_applications_status_created
  on public.driver_applications(status, created_at desc);

create index if not exists idx_relay_point_applications_status_created
  on public.relay_point_applications(status, created_at desc);

create index if not exists idx_invoices_partner_kind_status
  on public.invoices(partner_kind, status);
