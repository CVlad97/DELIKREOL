# DELIKREOL — Cadre légal points relais

## Montage recommandé

**Prestataires indépendants (commerçants existants en Martinique)**

Le commerçant met à disposition un espace de réception et stockage temporaire des commandes DELIKREOL, contre une commission par colis retiré.

## Conditions d'indépendance
- le commerçant reste libre d'accepter ou refuser chaque commande
- pas d'exclusivité DELIKREOL
- pas d'horaires imposés au-delà de ses horaires d'ouverture normaux
- pas de lien de subordination
- rémunération par colis retiré, facture obligatoire
- SIRET obligatoire (le commerce existe déjà)

## Risques

| Risque | Niveau | Mitigation |
|---|---|---|
| Requalification | 🟢 Faible | Le commerçant a déjà son activité propre, pas de lien de subordination |
| Sécurité des colis | 🟡 Moyen | Assurance responsabilité du commerçant + charte qualité |
| Non-déclaration | 🟢 Faible | Facture obligatoire, SIRET existant |
| Capacité de stockage | 🟡 Moyen | Vérifier capacité avant activation |

## Contrat cadre de prestation point relais

### Entre les soussignés

**DELIKREOL** (le Donneur d'Ordre) et **le Point Relais** (commerçant prestataire).

### Article 1 — Objet
Le Point Relais met à disposition un espace de réception et de remise des colis DELIKREOL à ses clients finaux.

### Article 2 — Indépendance
Le Point Relais exerce son activité commerciale en toute indépendance. La mise à disposition d'un espace pour DELIKREOL est accessoire à son activité principale.

### Article 3 — Missions
DELIKREOL dépose des colis chez le Point Relais. Le Point Relais les conserve pendant les horaires d'ouverture et les remet aux clients sur présentation d'un justificatif (numéro de commande + pièce d'identité).

### Article 4 — Rémunération
Le Point Relais perçoit une commission par colis retiré, selon le barème annexé. Paiement sur facture sous 15 jours fin de mois.

### Article 5 — Obligations
- Horaires d'ouverture affichés et respectés
- Sécurité des colis (local fermé)
- Remise uniquement sur justificatif valide
- Information DELIKREOL en cas d'absence ou fermeture exceptionnelle

### Article 6 — Résiliation
Résiliation possible à tout moment par l'une ou l'autre des parties, par notification écrite (WhatsApp ou email).

## Barème — Phase pilote

| Service | Commission point relais | Client | DELIKREOL |
|---|---|---|---|
| Retrait colis standard | 1,00 €/colis | 2,50 € | 1,50 € |
| Week-end ou hors horaires | 1,50 €/colis | — | — |
| Colis volumineux (+5 kg) | 1,50 €/colis | 3,00 € | 1,50 € |

## Onboarding point relais — Checklist

- [ ] Nom du commerce
- [ ] SIRET
- [ ] Adresse complète
- [ ] Horaires d'ouverture
- [ ] Photos du lieu (devanture + espace de stockage)
- [ ] Capacité estimée (colis/jour)
- [ ] Assurance RC pro du commerce
- [ ] Contact téléphone
- [ ] Email
- [ ] Charte qualité signée
- [ ] Contrat cadre signé

## Messages WhatsApp point relais

### Présentation
```
Bonjour [Prénom],

DELIKREOL recherche des points relais en Martinique pour permettre à nos clients de retirer leurs commandes près de chez eux.

Le principe est simple :
- nous déposons des colis chez vous
- vous les remettez aux clients sur justificatif
- vous êtes rémunéré par colis retiré
- flexibilité totale, pas d'exclusivité

Ce service peut être complémentaire à votre activité actuelle.

Intéressé ? Envoyez-nous :
1. nom du commerce
2. adresse
3. horaires
4. capacité estimée
```

### Demande de documents
```
Bonjour [Prénom],

Pour finaliser votre inscription comme point relais DELIKREOL, merci de nous envoyer :

1. SIRET
2. Photo de la devanture
3. Photo de l'espace de stockage
4. Horaires d'ouverture précis
5. Assurance RC pro

Une fois validé, nous activons votre point relais sur le site.
```

### Proposition de colis
```
Bonjour [Prénom],

Un colis arrive chez vous aujourd'hui :

📦 Commande : DK-[ORDER_ID]
📍 À remettre à : [CLIENT]
⏰ Horaires : [HORAIRES]
💰 Commission : [X] €

Merci de confirmer la réception et la remise.
```

### Paiement effectué
```
💳 Paiement réalisé

Colis retirés : [X]
Commission : [X] €
Date : [DATE]

Facture disponible dans votre espace.
Merci pour votre partenariat ! 🙏
```

## Tables Supabase à créer

```sql
-- Points relais
create table if not exists relay_points (
  id uuid primary key default gen_random_uuid(),
  place_name text,
  owner_name text,
  phone text,
  email text,
  commune text not null,
  address text,
  horaires jsonb default '[]'::jsonb,
  capacity integer default 10,
  photos jsonb default '[]'::jsonb,
  insurance_status text default 'à vérifier',
  status text default 'candidat' check (status in ('candidat', 'documents reçus', 'validé', 'actif', 'suspendu')),
  contrat_signe boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Colis déposés en point relais
create table if not exists relay_packages (
  id uuid primary key default gen_random_uuid(),
  relay_point_id uuid references relay_points(id),
  order_id text,
  status text default 'en attente' check (status in ('en attente', 'déposé', 'retiré', 'retourné')),
  deposited_at timestamptz,
  picked_up_at timestamptz,
  commission_relais numeric(10,2),
  client_fee numeric(10,2),
  delikreol_fee numeric(10,2),
  created_at timestamptz default now()
);
```

## RLS
```sql
alter table relay_points enable row level security;
alter table relay_packages enable row level security;

drop policy if exists "Public relay points visible" on relay_points;
create policy "Public relay points visible" on relay_points for select using (status = 'actif' or is_admin());

drop policy if exists "Admin only relay" on relay_points;
create policy "Admin only relay" on relay_points for all using (is_admin());

drop policy if exists "Admin only packages" on relay_packages;
create policy "Admin only packages" on relay_packages for all using (is_admin());
```