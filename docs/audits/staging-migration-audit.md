# Audit de la migration PR #43 — Paiements modulaires & idempotence atomique checkout

**Branche auditée :** `feat/manual-payments-idempotency` (PR #43 — **ne PAS merger**)
**Fichier audité :** `supabase/migrations/20260731000001_modular_manual_payments.sql` (331 lignes)
**Date d'audit :** 2026-08-02
**Appliqué en production :** ❌ NON (audit statique uniquement — aucune exécution contre une base live)
**Appliqué en staging :** ❌ NON (aucune branche Supabase staging créée)

---

## 1. Méthode d'audit

- Lecture statique complète du fichier de migration (331 lignes).
- Croisement avec les migrations antérieures touchant `orders` :
  - `20260610000004_notifications.sql` (ajoute `idempotency_key`, `tracking_token`, `order_number`)
  - `20260721000003_payment_preprod_hardening.sql` (ajoute `payment_provider`, `payment_method`, `payment_status`, `idempotency_key`, et un index unique `idx_orders_idempotency_key`)
  - `20260727170541_backend_production_hardening_20260727.sql` (supprime la policy dangereuse `orders_insert_public_checkout`)
- Revue du consommateur de la RPC : `supabase/functions/checkout-order/index.ts`.
- Revue des tests : `tests/supabase/backend-hardening.spec.ts`.
- **Aucune connexion à une base Supabase n'a été ouverte.** Aucune migration appliquée. Toutes les conclusions sont dérivées de la lecture du code ; les points nécessitant une vérification sur base live sont explicitement marqués **[À VÉRIFIER SUR STAGING]**.

---

## 2. Périmètre réel de la migration (vs. description de la PR)

> ⚠️ **Écart détecté entre la description de la tâche/PR et le contenu réel du fichier.**

La description annonce « Des politiques RLS » et « Des triggers ». **Le fichier ne contient AUCUNE politique RLS et AUCUN trigger.** Vérification :

```
grep -c "row level security\|create policy\|create trigger" \
  supabase/migrations/20260731000001_modular_manual_payments.sql
# → 0
```

La migration se contente de :
1. Créer la table `public.payment_duplicate_audit` et la peupler (lignes 4-39).
2. Ajouter des colonnes de paiement modulaires sur `orders` (lignes 41-53).
3. Déposer/recréer les CHECK constraints `payment_provider`/`payment_status` (lignes 55-108).
4. Créer 5 index dont 4 index uniques partiels conditionnels (lignes 110-161).
5. Créer la RPC `create_checkout_order_atomic` SECURITY DEFINER (lignes 163-321).
6. Révoquer/accorder EXECUTE (lignes 323-324).

**Conclusion :** la migration **délègue entièrement la sécurité RLS aux migrations antérieures**. Ce n'est pas forcément un défaut (RLS est censé être déjà en place), mais c'est un point à valider explicitement car la PR ne renforce pas la posture RLS.

---

## 3. Vérifications de sécurité

### 3.1 RLS (Row Level Security)

| Élément | Attendu | Constat | Statut |
| --- | --- | --- | --- |
| `alter table public.orders enable row level security` dans la migration | Non requis si déjà activé | **Absent du fichier** | ⚠️ Dépend de l'état antérieur |
| RLS sur `orders` activé par une migration précédente | Oui | **Aucune migration ne contient `alter table ... orders ... enable row level security`** | 🔴 **[À VÉRIFIER SUR STAGING]** |
| RLS sur la **nouvelle** table `payment_duplicate_audit` | Attendu (table nouvelle) | **ABSENT** — ni `enable row level security`, ni policy | 🔴 **Critique** |
| Policy `orders_insert_public_checkout` (écriture publique) supprimée | Oui (fait par `20260727170541`) | Confirmé supprimée dans la migration antérieure | ✅ |

**🔴 Risque critique — `payment_duplicate_audit` sans RLS :**
La table est créée (lignes 4-11) **sans** `enable row level security` ni aucune policy. En configuration Supabase par défaut, les rôles `anon`/`authenticated` disposent de privilèges sur les nouvelles tables via le rôle `public`. Avec RLS désactivé, **toute la table est lisible/inscriptible par ces rôles**, exposant :
- des `order_id` (UUID de commandes),
- la détection de doublons (métadonnées d'audit internes),
- un vecteur d'écriture (corruption possible de la table d'audit).

Cette table ne devrait être accessible qu'au `service_role` / `admin`.

**Vérification à exécuter sur staging avant tout merge :**
```sql
select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c
where c.relname in ('orders','payment_duplicate_audit','order_items','order_events')
order by c.relname;
-- relrowsecurity = true  → RLS activé
-- relforcerowsecurity = true → RLS forcé (service_role lui-même filtré)
```

### 3.2 SECURITY DEFINER sur la RPC

| Élément | Constat | Statut |
| --- | --- | --- |
| `security definer` présent (ligne 171) | ✅ Oui | ✅ |
| Fonction exécutée avec privilèges du propriétaire (bypass RLS) | ✅ Comportement attendu pour une RPC de création de commande | ✅ |
| Le corps n'exécute que des INSERT/SELECT paramétrés (pas de SQL dynamique) | ✅ Aucun `execute` de chaîne utilisateur | ✅ |
| Pas de `set role` ni d'escalade implicite | ✅ | ✅ |

**Note :** SECURITY DEFINER contourne donc la RLS sur `orders`, `order_items`, `order_events` pendant l'exécution. C'est légitime ici (la RPC est le seul chemin d'insertion côté client), mais cela signifie que la sécurité repose **entièrement** sur le fait que seuls les rôles autorisés peuvent *appeler* la fonction (voir 3.4).

### 3.3 `search_path` verrouillé

| Élément | Constat | Statut |
| --- | --- | --- |
| `set search_path = public` (ligne 172) | ✅ Présent | ✅ |
| `search_path` figé au niveau de la fonction (`SET` dans `CREATE FUNCTION`) | ✅ Oui — correct, s'applique à toute la portée de la fonction | ✅ |
| Toutes les références de schéma dans le corps sont qualifiées `public.` | ✅ Oui (`public.orders`, `public.order_items`, `public.order_events`) | ✅ |

✅ **Pas de vecteur de hijacking de search_path.**

### 3.4 Droits EXECUTE minimaux

| Élément | Constat | Statut |
| --- | --- | --- |
| `revoke all on function ... from public, anon, authenticated` (ligne 323) | ✅ Présent et explicite | ✅ |
| `grant execute on function ... to service_role` (ligne 324) | ✅ Seul `service_role` peut appeler | ✅ |
| Correspondance avec le consommateur (`checkout-order` utilise la `service_role_key`) | ✅ Cohérent | ✅ |

✅ **Droits EXECUTE minimaux respectés.** La fonction n'est callable que par le backend (edge function via clé service). Un client ne peut pas l'invoquer directement via l'API PostgREST avec sa clé anon/authenticated.

---

## 4. Risques et anomalies détectés

### 🔴 Critique

**R4.1 — Table `payment_duplicate_audit` créée sans RLS ni policy.**
Voir §3.1. La table expose des données d'audit interne et accepte des écritures non contrôlées.
**Correctif requis avant merge :**
```sql
alter table public.payment_duplicate_audit enable row level security;
revoke all on public.payment_duplicate_audit from public, anon, authenticated;
create policy "payment_duplicate_audit_service_only"
  on public.payment_duplicate_audit
  for all
  to service_role
  using (true)
  with check (true);
```

### 🟠 Majeur

**R4.2 — `payment_provider` NOT NULL / default 'qonto_transfer' non appliqué sur colonne existante.**
Ligne 41 : `alter table if exists public.orders add column if not exists payment_provider text not null default 'qonto_transfer';`
La colonne `payment_provider` **existe déjà** (ajoutée par `20260721000003` avec `default 'manual'` et **nullable**). La clause `add column if not exists` rend cette instruction **no-op** : ni le `NOT NULL`, ni le défaut `'qonto_transfer'` ne sont appliqués. La colonne reste nullable avec défaut `'manual'`.
- Conséquence : un INSERT direct (hors RPC) avec `payment_provider = null` réussit ; le défaut devient `'manual'` (qui est dans la liste CHECK, donc accepté).
- La RPC compense par `coalesce(order_payload->>'payment_provider','qonto_transfer')`, donc le chemin checkout est sain.
- **L'intention déclarée de la migration n'est pas atteinte silencieusement.**
**Recommandation :** ajouter explicitement :
```sql
alter table public.orders alter column payment_provider set default 'qonto_transfer';
alter table public.orders alter column payment_provider set not null; -- ⚠️ échoue si des NULL existent
```
(Préalable : vérifier l'absence de NULL : `select count(*) from public.orders where payment_provider is null;`)

**R4.3 — RLS sur `orders` non confirmé par les migrations.**
Aucune migration du dépôt ne contient `alter table ... orders ... enable row level security`. La table `orders` n'est pas créée par une migration visible (schéma initial out-of-band). Si RLS n'est pas activé sur `orders` en production, l'ensemble du modèle de sécurité des commandes est compromis, indépendamment de cette PR.
**Action :** vérifier §3.1 sur staging avant tout déploiement.

### 🟡 Modéré

**R4.4 — Double index unique sur `idempotency_key`.**
- `20260721000003` crée `idx_orders_idempotency_key` (unique, `where idempotency_key is not null`).
- Cette PR crée `idx_orders_idempotency_key_unique` (unique, même prédicat).
Résultat : **deux index uniques identiques** sur la même colonne/prédicat. Redondance, double coût d'écriture, double stockage, sans bénéfice fonctionnel.
**Recommandation :** ne pas recréer l'index si `idx_orders_idempotency_key` existe déjà, ou supprimer l'ancien explicitement.

**R4.5 — Race sur `payment_external_id` → 500 au lieu de 409.**
L'edge function `checkout-order` fait un pré-check `select ... eq("payment_external_id", ...).maybeSingle()` (lignes 255-265) **avant** la RPC. La RPC ne re-vérifie PAS `payment_external_id` dans sa transaction. En cas de concurrence (même hash crypto soumis deux fois rapidement), les deux pré-checks passent, puis l'INSERT de la deuxième déclenche l'index unique `idx_orders_payment_external_id_unique` → `unique_violation` → exception **non gérée** dans la RPC → erreur 500 côté edge function, au lieu d'un 409 propre « référence déjà utilisée ».
**Correctif :** ajouter dans la RPC une gestion `on conflict (payment_external_id) do nothing` ou un `begin ... exception when unique_violation then return jsonb_build_object('existing', true, ...)`. Alternativement, déplacer la détection dans la RPC (SELECT verrouillé par advisory lock).

**R4.6 — Index uniques créés de manière conditionnelle (silencieusement skippés).**
Les index uniques (lignes 116-161) ne sont créés **que s'il n'existe aucun doublon**. Si des doublons préexistent, l'index n'est pas créé et **aucun warning n'est émis** ; la migration se termine en succès. Conséquence : l'unicité n'est pas garantie, l'idempotence ne s'appuie que sur l'advisory lock, et un futur `VALIDATE CONSTRAINT` échouerait.
**Recommandation :** le bloc DO doit au moins `raise notice` quand il skippe la création d'index, et le post-migration doit échouer (ou alerter) si des doublons bloquants subsistent.

**R4.7 — Peuplement de `payment_duplicate_audit` non idempotent.**
Les 4 `INSERT` (lignes 13-39) ne sont pas protégés contre la ré-exécution. Si la migration venait à être rejouée (scénario anormal mais possible en staging), des doublons de lignes d'audit seraient insérés. Faible impact (Supabase applique chaque migration une fois), mais à signaler.

### 🟢 Mineur / Informationnel

- **R4.8 — `payment_method` référencée dans l'INSERT de la RPC (ligne 232) mais non ajoutée par cette migration.** Dépend de `20260721000003` qui ajoute `payment_method text`. Pas de CHECK constraint sur cette colonne. La migration suppose l'ordre des migrations respecté. ✅ acceptable, à documenter.
- **R4.9 — `updated_at` ajoutée avec `default now()` mais aucun trigger de mise à jour.** La colonne ne s'auto-actualisera pas sur UPDATE (comportement trompeur).
- **R4.10 — Drift entre la migration et l'architecture doc.** Le CHECK `payment_status` autorise `processing`, `awaiting_payment`, `paid_external` (non listés dans `docs/payments/MANUAL_PAYMENT_ARCHITECTURE_20260731.md` §2). Le CHECK `payment_provider` autorise `stripe_test`, `sumup_manual`, `sumup_payment_link`, `manual` (non listés). La migration est plus permissive que la doc.
- **R4.11 — `payment_amount numeric` sans contrainte de positivité.** Une valeur négable/zéro est autorisée. La RPC ne valide pas. Faible risque (calculé par l'edge function).
- **R4.12 — Pas de validation que `items_payload` est un tableau non vide.** Un panier vide créerait une commande sans lignes. L'edge function valide en amont ; la RPC seule non.
- **R4.13 — Rollback documenté en commentaire (lignes 326-331) est partiel.** Ne dépose que la fonction, la table d'audit et 2 index sur 5 ; ne dépose ni les index uniques ni les CHECK constraints. Voir §7 pour un rollback complet.
- **R4.14 — Représentation monétaire double** (`numeric` ET `integer cents`) insérée côte à côte par la RPC. Risque de divergence si un chemin met à jour l'un sans l'autre. Hors scope de cette PR mais à surveiller.

---

## 5. SQL de pré-audit (détection de doublons)

> À exécuter **sur staging, avant** d'appliquer la migration, pour décider si les index uniques pourront être créés. Aucune écriture. Toutes en lecture seule.

### 5.1 Synthèse — nombre de doublons par champ

```sql
-- Vue d'ensemble : compte de valeurs dupliquées par champ critique
select 'order_number'      as field, count(*) as dup_values, sum(cnt-1) as extra_rows
from (select order_number, count(*) cnt from public.orders
      where order_number is not null and order_number <> ''
      group by order_number having count(*) > 1) t
union all
select 'idempotency_key', count(*), sum(cnt-1)
from (select idempotency_key, count(*) cnt from public.orders
      where idempotency_key is not null and idempotency_key <> ''
      group by idempotency_key having count(*) > 1) t
union all
select 'payment_reference', count(*), sum(cnt-1)
from (select payment_reference, count(*) cnt from public.orders
      where payment_reference is not null and payment_reference <> ''
      group by payment_reference having count(*) > 1) t
union all
select 'payment_external_id', count(*), sum(cnt-1)
from (select payment_external_id, count(*) cnt from public.orders
      where payment_external_id is not null and payment_external_id <> ''
      group by payment_external_id having count(*) > 1) t
order by extra_rows desc nulls last;
```
**Interprétation :** si `extra_rows > 0` pour un champ, l'index unique correspondant **ne sera pas créé** par la migration (silencieusement skippé). Décision métier requise (dédoublonner ou accepter l'absence d'unicité).

### 5.2 Détail — échantillon des doublons (10 max par valeur)

```sql
-- order_number
select order_number, count(*) as n, array_agg(id order by created_at desc)[:10] as sample_ids
from public.orders
where order_number is not null and order_number <> ''
group by order_number having count(*) > 1
order by n desc;

-- idempotency_key
select idempotency_key, count(*) as n, array_agg(id order by created_at desc)[:10] as sample_ids
from public.orders
where idempotency_key is not null and idempotency_key <> ''
group by idempotency_key having count(*) > 1
order by n desc;

-- payment_reference
select payment_reference, count(*) as n, array_agg(id order by created_at desc)[:10] as sample_ids
from public.orders
where payment_reference is not null and payment_reference <> ''
group by payment_reference having count(*) > 1
order by n desc;

-- payment_external_id
select payment_external_id, count(*) as n, array_agg(id order by created_at desc)[:10] as sample_ids
from public.orders
where payment_external_id is not null and payment_external_id <> ''
group by payment_external_id having count(*) > 1
order by n desc;
```

### 5.3 Vérifications de pré-conditions

```sql
-- Colonnes déjà présentes (pour anticiper les no-op silencieux de ADD COLUMN IF NOT EXISTS)
select column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema='public' and table_name='orders'
  and column_name in ('payment_provider','payment_method','payment_status','payment_reference',
                     'payment_external_id','payment_amount','payment_currency','payment_proof_url',
                     'payment_verified_at','payment_verified_by','payment_review_comment',
                     'idempotency_key','order_number','updated_at')
order by column_name;

-- Index existants sur orders (pour détecter la redondance idx_orders_idempotency_key)
select indexname, indexdef
from pg_indexes
where schemaname='public' and tablename='orders'
order by indexname;

-- Contraintes CHECK existantes sur orders
select conname, pg_get_constraintdef(oid)
from pg_constraint
where conrelid='public.orders'::regclass and contype='c'
order by conname;

-- RLS effective sur les tables concernées
select relname, relrowsecurity, relforcerowsecurity
from pg_class
where relname in ('orders','order_items','order_events','payment_duplicate_audit')
order by relname;

-- Privilèges sur la fonction
select routine_name, privilege_type, grantee
from information_schema.routine_privileges
where routine_schema='public'
  and routine_name='create_checkout_order_atomic'
order by grantee;
```

---

## 6. Tests de concurrence

> Objectif : valider l'idempotence atomique sous charge réelle sur staging. À exécuter **après** application de la migration sur une base de staging isolée. Chaque test inclut une procédure de réinitialisation. Compteur de vérification : exactement **1** commande créée par clé.

### Préparation commune

```sql
-- Table de test pour tracer les appels concurrents (création à part, hors migration)
create table if not exists audit.concurrency_test_log (
  test_id text, run_id text, returned_existing boolean,
  returned_order_id uuid, started_at timestamptz default now(),
  finished_at timestamptz, error text
);
```

### 6.1 Test A — 2 requêtes simultanées, même clé

**Description :** deux transactions lancent `create_checkout_order_atomic` avec la **même** `idempotency_key` et le **même** payload, au même instant. L'une doit créer la commande (`existing=false`), l'autre doit recevoir la commande existante (`existing=true`). Aucune erreur attendue. Exactement 1 ligne dans `orders`, 1 entrée dans `order_events`.

**Procédure :** ouvrir 2 sessions psql en parallèle (deux terminaux), lancer le bloc ci-dessous dans chacun **simultanément** (même `p_key`, même `p_payload`) :

```sql
-- Session 1 et Session 2 (identiques) :
begin;
select public.create_checkout_order_atomic(
  target_idempotency_key := 'TST-A-0000000000000A',
  order_payload := jsonb_build_object(
    'order_number','DK-TST-A-1','customer_phone','0600000000',
    'subtotal',10,'delivery_fee',0,'delivery_fee_cents',0,
    'sub_total_cents',1000,'total_cents',1000,'total_amount',10,
    'delivery_type','pickup','source','concurrency_test',
    'status','pending','delivery_status','pending','payment_status','pending',
    'payment_provider','qonto_transfer','payment_method','manual',
    'tracking_token','tokA'
  ),
  items_payload := '[]'::jsonb,
  event_payload := jsonb_build_object('event_type','concurrency_test')
) as r;
commit;
```

**Vérification post-test :**
```sql
select count(*) as orders_count from public.orders where idempotency_key='TST-A-0000000000000A';           -- attendu : 1
select count(*) as events_count from public.order_events oe
  join public.orders o on o.id=oe.order_id
  where o.idempotency_key='TST-A-0000000000000A';                                                          -- attendu : 1
```
**Réinitialisation :**
```sql
delete from public.order_events where order_id in (select id from public.orders where idempotency_key like 'TST-A-%');
delete from public.order_items   where order_id in (select id from public.orders where idempotency_key like 'TST-A-%');
delete from public.orders where idempotency_key like 'TST-A-%';
```

### 6.2 Test B — 10 requêtes simultanées, même clé

**Description :** 10 appels concurrents, même `idempotency_key`. Exactement 1 création, 9 retours `existing=true`. Aucun `unique_violation` ne doit remonter (l'advisory lock sérialise les appels de même clé).

**Procédure :** utiliser un script shell lançant 10 jobs en arrière-plan :

```bash
# run_concurrency_b.sh
PKEY="TST-B-0000000000000B"
PAYLOAD='{"order_number":"DK-TST-B","customer_phone":"0600000001","subtotal":10,"delivery_fee":0,"delivery_fee_cents":0,"sub_total_cents":1000,"total_cents":1000,"total_amount":10,"delivery_type":"pickup","source":"concurrency_test","status":"pending","delivery_status":"pending","payment_status":"pending","payment_provider":"qonto_transfer","payment_method":"manual","tracking_token":"tokB"}'
for i in $(seq 1 10); do
  psql "$DATABASE_URL" -c "select public.create_checkout_order_atomic(
    target_idempotency_key := '$PKEY',
    order_payload := '$PAYLOAD'::jsonb,
    items_payload := '[]'::jsonb,
    event_payload := '{\"event_type\":\"concurrency_test\"}'::jsonb);" > "/tmp/cb_$i.out" 2>&1 &
done
wait
echo "existing=true count:"; grep -l '"existing":true' /tmp/cb_*.out | wc -l
echo "existing=false count:"; grep -l '"existing":false' /tmp/cb_*.out | wc -l
```
**Attendu :** 1 × `existing=false`, 9 × `existing=true`, 0 erreur.

**Vérification post-test :**
```sql
select count(*) from public.orders where idempotency_key='TST-B-0000000000000B'; -- attendu : 1
```
**Réinitialisation :** même pattern que 6.1 avec préfixe `TST-B-%`.

### 6.3 Test C — mêmes données, clés différentes

**Description :** 2 appels simultanés avec le **même** payload mais des `idempotency_key` **différentes`. Doivent produire **2** commandes distinctes (l'idempotence est par clé, pas par contenu). Vérifie que l'advisory lock ne sérialise pas abusivement des clés différentes.

```sql
-- Session 1 :
select public.create_checkout_order_atomic(
  target_idempotency_key := 'TST-C-11111111111111',
  order_payload := jsonb_build_object('order_number','DK-TST-C-1','customer_phone','0600000002',
    'subtotal',10,'delivery_fee',0,'delivery_fee_cents',0,'sub_total_cents',1000,
    'total_cents',1000,'total_amount',10,'delivery_type','pickup','source','concurrency_test',
    'status','pending','delivery_status','pending','payment_status','pending',
    'payment_provider','qonto_transfer','payment_method','manual','tracking_token','tokC1'),
  items_payload := '[]'::jsonb, event_payload := jsonb_build_object('event_type','concurrency_test'));

-- Session 2 (en parallèle) :
select public.create_checkout_order_atomic(
  target_idempotency_key := 'TST-C-22222222222222',
  order_payload := jsonb_build_object('order_number','DK-TST-C-2','customer_phone','0600000002',
    'subtotal',10,'delivery_fee',0,'delivery_fee_cents',0,'sub_total_cents',1000,
    'total_cents',1000,'total_amount',10,'delivery_type','pickup','source','concurrency_test',
    'status','pending','delivery_status','pending','payment_status','pending',
    'payment_provider','qonto_transfer','payment_method','manual','tracking_token','tokC2'),
  items_payload := '[]'::jsonb, event_payload := jsonb_build_object('event_type','concurrency_test'));
```
**Attendu :** 2 commandes, 0 erreur.

### 6.4 Test D — perte réseau après commit (relance après timeout)

**Description :** un client soumet, le serveur commit la commande, mais la réponse est perdue (timeout côté client). Le client relance avec la **même** `idempotency_key`. La relance doit retourner la commande **existante** (`existing=true`), **sans** recréer ni dupliquer.

**Procédure :**
1. Appel 1 — réussit (commit) ; simuler la perte en interrompant la connexion juste après le commit (ou simplement ignorer la réponse). On peut le reproduire en validant l'appel puis en supprimant le résultat côté client.
2. Attendre un délai > timeout client (ex. 31 s).
3. Appel 2 — **même** `idempotency_key`, même payload.

```sql
-- Appel 2 (relance) :
select public.create_checkout_order_atomic(
  target_idempotency_key := 'TST-D-33333333333333',
  order_payload := jsonb_build_object('order_number','DK-TST-D','customer_phone','0600000003',
    'subtotal',10,'delivery_fee',0,'delivery_fee_cents',0,'sub_total_cents',1000,
    'total_cents',1000,'total_amount',10,'delivery_type','pickup','source','concurrency_test',
    'status','pending','delivery_status','pending','payment_status','pending',
    'payment_provider','qonto_transfer','payment_method','manual','tracking_token','tokD'),
  items_payload := '[]'::jsonb, event_payload := jsonb_build_object('event_type','concurrency_test'));
-- Attendu : {"existing": true, "order": {...}}
```
**Vérification :**
```sql
select count(*) from public.orders where idempotency_key='TST-D-33333333333333'; -- attendu : 1
select count(*) from public.order_events oe join public.orders o on o.id=oe.order_id
  where o.idempotency_key='TST-D-33333333333333';                                  -- attendu : 1 (pas 2)
```

### 6.5 Test E — collision sur `payment_external_id` (cas limite de R4.5)

**Description :** 2 appels concurrents, **clés idempotency différentes**, mais **même** `payment_external_id` (ex. même hash crypto rejoué). L'un doit réussir, l'autre doit échouer proprement. **État actuel attendu (bug R4.5) :** le second remonte une erreur 500 (`unique_violation` non gérée). Ce test est là pour **confirmer le bug** et valider le correctif une fois appliqué.

```sql
-- Session 1 :
select public.create_checkout_order_atomic(
  target_idempotency_key := 'TST-E-44444444444441',
  order_payload := jsonb_build_object('order_number','DK-TST-E-1','customer_phone','0600000004',
    'subtotal',10,'delivery_fee',0,'delivery_fee_cents',0,'sub_total_cents',1000,
    'total_cents',1000,'total_amount',10,'delivery_type','pickup','source','concurrency_test',
    'status','pending','delivery_status','pending','payment_status','proof_submitted',
    'payment_provider','crypto_wallet','payment_method','crypto_wallet',
    'payment_external_id','0xCOLLIDE','payment_reference','CRYPTO-DK-TST-E-1','tracking_token','tokE1'),
  items_payload := '[]'::jsonb, event_payload := jsonb_build_object('event_type','concurrency_test'));

-- Session 2 (en parallèle, même payment_external_id, clé différente) :
select public.create_checkout_order_atomic(
  target_idempotency_key := 'TST-E-55555555555552',
  order_payload := jsonb_build_object('order_number','DK-TST-E-2','customer_phone','0600000004',
    'subtotal',10,'delivery_fee',0,'delivery_fee_cents',0,'sub_total_cents',1000,
    'total_cents',1000,'total_amount',10,'delivery_type','pickup','source','concurrency_test',
    'status','pending','delivery_status','pending','payment_status','proof_submitted',
    'payment_provider','crypto_wallet','payment_method','crypto_wallet',
    'payment_external_id','0xCOLLIDE','payment_reference','CRYPTO-DK-TST-E-2','tracking_token','tokE2'),
  items_payload := '[]'::jsonb, event_payload := jsonb_build_object('event_type','concurrency_test'));
```
**Attendu après correctif :** 1 commande créée, 1 retour 409 « référence déjà utilisée ». **Sans correctif :** 1 commande + 1 erreur 500.

---

## 7. Procédure de rollback (vérifiable)

> Pré-requis : exécuter sur la base où la migration a été appliquée. **Sauvegarder avant toute action.** Procédure **idempotente** (ré-exécutable sans erreur). Préserve les données métier (commandes, lignes, événements). Ne supprime les colonnes **que sur décision explicite** (section 7.3).

### 7.1 Sauvegarde préalable (obligatoire)

```bash
# Dump de la table orders et des objets liés avant rollback
pg_dump "$DATABASE_URL" \
  --table=public.orders \
  --table=public.order_items \
  --table=public.order_events \
  --table=public.payment_duplicate_audit \
  --no-owner --clean --if-exists \
  > /tmp/backup_pr43_$(date +%Y%m%d_%H%M%S).sql
```

### 7.2 Vérifications pré-rollback (lecture seule)

```sql
-- Confirmer que la migration a bien été appliquée
select 1 from pg_proc where oid='public.create_checkout_order_atomic(text,jsonb,jsonb,jsonb)'::regprocedure;
select 1 from pg_class where relname='payment_duplicate_audit';
-- Lister les index créés par la PR
select indexname from pg_indexes
where schemaname='public' and tablename='orders'
  and indexname in ('idx_orders_payment_provider','idx_orders_payment_status',
    'idx_orders_payment_reference','idx_orders_payment_external_id',
    'idx_orders_idempotency_key_lookup','idx_orders_order_number_unique',
    'idx_orders_idempotency_key_unique','idx_orders_payment_reference_unique',
    'idx_orders_payment_external_id_unique');
-- Lister les CHECK constraints à déposer
select conname from pg_constraint
where conrelid='public.orders'::regclass and contype='c'
  and conname in ('orders_payment_provider_check','orders_payment_status_check');
```

### 7.3 Rollback — Option 1 : Conservateur (recommandé)

Préserve les colonnes de paiement pour l'audit historique (conforme à la doc §8). Dépose uniquement les **objets** ajoutés par la PR (fonction, table d'audit, index, CHECK constraints). Les colonnes restent.

```sql
begin;

-- 1. Révoquer puis déposer la RPC
revoke execute on function public.create_checkout_order_atomic(text, jsonb, jsonb, jsonb) from service_role;
drop function if exists public.create_checkout_order_atomic(text, jsonb, jsonb, jsonb);

-- 2. Déposer la table d'audit (créée par cette PR)
drop table if exists public.payment_duplicate_audit;

-- 3. Déposer les index créés par cette PR
drop index if exists public.idx_orders_payment_provider;
drop index if exists public.idx_orders_payment_status;
drop index if exists public.idx_orders_payment_reference;
drop index if exists public.idx_orders_payment_external_id;
drop index if exists public.idx_orders_idempotency_key_lookup;
drop index if exists public.idx_orders_order_number_unique;
drop index if exists public.idx_orders_idempotency_key_unique;
drop index if exists public.idx_orders_payment_reference_unique;
drop index if exists public.idx_orders_payment_external_id_unique;

-- 4. Déposer les CHECK constraints créés par cette PR
alter table public.orders drop constraint if exists orders_payment_provider_check;
alter table public.orders drop constraint if exists orders_payment_status_check;

commit;
```

### 7.4 Rollback — Option 2 : Complet (supprime aussi les colonnes)

À n'utiliser que si l'on veut revenir strictement au schéma d'origine. ⚠️ **perte de données** sur ces colonnes (valeurs de paiement historiques). Effectuer un export préalable :

```sql
-- Export préalable des colonnes (à conserver hors base)
copy (
  select id, payment_provider, payment_method, payment_status, payment_reference,
         payment_external_id, payment_amount, payment_currency, payment_proof_url,
         payment_verified_at, payment_verified_by, payment_review_comment,
         idempotency_key, order_number, updated_at
  from public.orders
) to '/tmp/orders_payment_columns_backup.csv' with csv header;

-- Puis rollback complet (suite à l'Option 1) :
begin;
alter table public.orders drop column if exists payment_provider;
alter table public.orders drop column if exists payment_method;       -- ajoutée par 20260721000003 (hors PR43 strictement)
alter table public.orders drop column if exists payment_reference;
alter table public.orders drop column if exists payment_external_id;
alter table public.orders drop column if exists payment_amount;
alter table public.orders drop column if exists payment_currency;
alter table public.orders drop column if exists payment_proof_url;
alter table public.orders drop column if exists payment_verified_at;
alter table public.orders drop column if exists payment_verified_by;
alter table public.orders drop column if exists payment_review_comment;
-- NB : idempotency_key, order_number, updated_at, tracking_token existaient avant la PR43 -> conservés
commit;
```
⚠️ Ne pas déposer `payment_method` (colonne `20260721000003`) ni `idempotency_key`/`order_number`/`tracking_token`/`updated_at` si l'on veut un rollback ciblé à la PR43. Les lignes commentées ci-dessus précisent l'origine.

### 7.5 Vérifications post-rollback

```sql
-- La RPC ne doit plus exister
select count(*) from pg_proc where oid='public.create_checkout_order_atomic(text,jsonb,jsonb,jsonb)'::regprocedure;
-- attendu : 0

-- La table d'audit ne doit plus exister
select count(*) from pg_class where relname='payment_duplicate_audit';
-- attendu : 0

-- Aucun index de la PR ne doit subsister
select count(*) from pg_indexes
where schemaname='public' and tablename='orders'
  and indexname in ('idx_orders_payment_provider','idx_orders_payment_status',
    'idx_orders_payment_reference','idx_orders_payment_external_id',
    'idx_orders_idempotency_key_lookup','idx_orders_order_number_unique',
    'idx_orders_idempotency_key_unique','idx_orders_payment_reference_unique',
    'idx_orders_payment_external_id_unique');
-- attendu : 0

-- Aucune CHECK constraint de la PR ne doit subsister
select count(*) from pg_constraint
where conrelid='public.orders'::regclass and contype='c'
  and conname in ('orders_payment_provider_check','orders_payment_status_check');
-- attendu : 0

-- Les commandes existantes sont intactes (aucune perte de ligne)
select count(*) from public.orders;  -- comparer avec le total d'avant rollback
```

### 7.6 Rollback applicatif (frontend / edge functions)

Si la PR43 a été accompagnée d'un déploiement de `checkout-order` utilisant la RPC, le rollback SQL seul rend l'edge function inopérante (RPC manquante → erreur 500 sur checkout). Actions complémentaires :
1. Redéployer la version de `checkout-order` **antérieure** à la PR43 (chemin d'insertion direct, sans RPC).
2. Désactiver les variables de paiement manuel si nécessaire (`VITE_CRYPTO_WALLET_ADDRESS`, `VITE_EXTERNAL_PAYMENT_URL`).
3. Conserver les colonnes de paiement (Option 1) pour ne pas casser l'historique.

---

## 8. Recommandation finale

### Verdict : 🔴 **NE PAS merger en l'état — corrections requises avant validation.**

La migration est globalement bien structurée (SECURITY DEFINER, `search_path = public`, EXECUTE minimal, idempotence par advisory lock + index unique). Cependant, **un risque critique de sécurité** et **plusieurs défauts fonctionnels silencieux** bloquent le merge.

#### Blocants (à corriger impérativement)
1. **R4.1** — Activer RLS + policy service_role-only sur `payment_duplicate_audit`.
2. **R4.3** — Vérifier sur staging que RLS est activé sur `orders` (ne peut pas être confirmé par lecture du dépôt).
3. **R4.5** — Gérer explicitement la collision `payment_external_id` dans la RPC (return 409 au lieu de 500).

#### À corriger avant merge (recommandé)
4. **R4.2** — Appliquer explicitement `default 'qonto_transfer'` et `NOT NULL` sur `payment_provider` plutôt que de compter sur un `ADD COLUMN IF NOT EXISTS` no-op.
5. **R4.4** — Éviter le double index unique sur `idempotency_key` (réutiliser `idx_orders_idempotency_key` ou le déposer explicitement).
6. **R4.6** — Émettre un avertissement (et idéalement échouer) si des doublons empêchent la création d'un index unique.

#### À documenter / corriger plus tard
7. **R4.9** — Ajouter un trigger `updated_at` ou supprimer le `default now()` trompeur.
8. **R4.10** — Aligner la doc d'architecture et le CHECK `payment_status`/`payment_provider`.
9. **R4.13** — Remplacer le rollback en commentaire par un vrai fichier `down.sql` ou une procédure documentée (présente §7).

#### Feuille de route de validation (hors production)
1. **Staging isolé** : appliquer la migration corrigée sur une branche Supabase staging (**après validation humaine**, conformément aux contraintes).
2. Exécuter le SQL de pré-audit (§5) **avant** la migration.
3. Exécuter les tests de concurrence A→E (§6).
4. Exécuter les vérifications post-rollback (§7.5) sur un clone.
5. Rédiger le PV de validation puis envisager la revue de merge.

**Position :** conformément aux contraintes, **aucune application en production**, **aucune branche staging créée sans validation**, **`main` non modifié**. Cet audit est purement statique et préparatoire.