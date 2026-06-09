# SUPABASE — Guide de déploiement DELIKREOL

## Prérequis
1. Compte Supabase : https://supabase.com
2. Projet Supabase créé (gratuit — 2 projets possibles)
3. Récupérer ces 3 infos depuis Supabase Dashboard → Project Settings → API :
   - **Project URL** (ex: `https://abcdefghijklm.supabase.co`)
   - **anon public key** (clé publique frontend)
   - **service_role key** (clé secrète — jamais côté frontend)

## Étapes

### 1. Login Supabase CLI
```bash
cd /workspace/DELIKREOL
npx supabase login
```
→ Un navigateur s'ouvre pour connecter ton compte Supabase

### 2. Lier le projet
```bash
npx supabase link --project-ref abcdefghijklm
```
(remplacer `abcdefghijklm` par ton project ref, dans l'URL du dashboard)

### 3. Push les migrations
```bash
npx supabase db push
```
Cela applique :
- `20260609000001_delikreol_schema.sql` → 14 tables
- `20260609000002_rls_policies.sql` → Politiques de sécurité RLS

### 4. Seed les données
```bash
npx supabase db seed
```
Cela importe :
- 34 communes Martinique avec règles de livraison
- Paramètres administrateur (WhatsApp, email, seuil 40€)

### 5. Configurer les variables frontend
Ajouter dans `.env` ou dans les secrets GitHub (Settings → Secrets and variables → Actions) :
```
VITE_SUPABASE_URL=https://abcdefghijklm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

**⚠️ Ne jamais ajouter SUPABASE_SERVICE_ROLE_KEY dans le frontend**

## Tables créées (14)

| Table | Description |
|---|---|
| `profiles` | Utilisateurs (clients, partenaires, admins) |
| `vendors` | Traiteurs partenaires |
| `products` | Produits / plats |
| `orders` | Commandes |
| `order_items` | Lignes de commande |
| `catering_requests` | Demandes de devis traiteur |
| `partner_applications` | Candidatures partenaires |
| `driver_applications` | Candidatures livreurs |
| `relay_point_applications` | Candidatures points relais |
| `delivery_rules` | Règles de livraison par commune |
| `leads` | Leads entrants |
| `media_assets` | Photos / médias des traiteurs |
| `project_memory` | Notes de projet / audit |
| `admin_settings` | Configuration globale |

## Mode fallback

Le site fonctionne **sans Supabase** (WhatsApp-first) :
- Catalogue chargé depuis les données mock (`mockCatalog.ts`)
- Commandes via WhatsApp (`wa.me/+596696653589`)
- Toute la logique métier côté frontend
- Supabase est optionnel pour la V1

## Sécurité
- RLS activé sur toutes les tables
- `service_role` jamais exposé côté frontend
- `anon key` seule clé publique frontend
- Les mots de passe et tokens ne sont jamais commités