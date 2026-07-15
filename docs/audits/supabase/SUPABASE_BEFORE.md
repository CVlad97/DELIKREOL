# SUPABASE_BEFORE.md — DELIKREOL

## SHA initial
`547f3b5809ccf6dbb3a37be211041b1bf9f7d356`
Branche: `fix/supabase-security-partner-sync`
Date: 2026-07-15

## État avant migration
Project: `boihlgodmclljtckhmgz` (East US)
Org: `rrelgibggrlxtbrbuvnu`

### Tables (33 total)
| Table | Rows | Notes |
|---|---|---|
| vendors | 2 | Verger Tropical (draft), Chez Tatie Mireille (verified) — Aucun des 7 partenaires frontend |
| products | 6 | Liés aux 2 vendors existants |
| orders | 8 | Tests d'avril 2026 |
| order_items | 3 | Tests |
| profiles | 1 | Vladimir (admin) |
| admin_users | 1 | vladimir.claveau@gmail.com |
| admin_settings | 6 | whatsapp, email, seuil, site_name, order_mode, paiement_actif |
| delivery_rules | 1 | Martinique seuil 40€ |
| partner_applications | 2 | Candidatures |
| partner_invites | 3 | Invitations |
| driver_applications | 4 | Candidatures livreurs |
| Autres (23) | 0 | Tables vides (structure prête) |

### Fonction admin
`public.is_delikreol_admin()` — à vérifier (SECURITY DEFINER)

### RLS
20 migrations existantes, politique RLS à auditer

### Variables env
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_PUBLISHABLE_KEY
VITE_WHATSAPP_URL, VITE_BANK_IBAN, VITE_BANK_BIC, VITE_FB_PIXEL_ID
SUPABASE_ENV: service_role key disponible

### CI/CD
3 workflows: CI (PR), Deploy (main push), Playwright Images (PR)
