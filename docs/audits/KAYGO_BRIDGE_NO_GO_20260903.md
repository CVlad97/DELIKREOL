# Audit Kaygo bridge — NO-GO

Le lot `kaygoBridge.ts` / `20260901000001_kaygo_delivery_bridge.sql` ne doit pas être publié ni appliqué.

## Bloquants

- policies basées sur des colonnes inexistantes (`orders.user_id`, `driver_applications.user_id`) ;
- `driver_id` relié à une candidature au lieu d'une identité opérationnelle ;
- relations PostgREST incompatibles avec les FK existantes ;
- faux suivi temps réel avec coordonnées et ETA aléatoires ;
- création de livraison non idempotente ;
- assignation non transactionnelle et `tripId` ignoré ;
- UPDATE livreur trop large ;
- trajets publics exposés via `select('*')` ;
- duplication du domaine existant `deliveries` / `drivers` ;
- aucune API Kaygo réelle, signature webhook, retry ou journal d'intégration.

## Décision

1. ne pas commit/push ces deux fichiers dans le lot média ;
2. ne pas appliquer la migration distante ;
3. refondre comme adaptateur serveur versionné autour des tables existantes ;
4. utiliser une identité explicite `drivers.id` ou `auth.users.id` ;
5. créer une RPC transactionnelle/idempotente pour affectation et transitions ;
6. retourner `tracking unavailable` tant qu'aucune télémétrie réelle n'existe ;
7. auditer RLS et schéma réel avant toute migration.

## Fichiers maintenus hors publication

- `src/services/kaygoBridge.ts`
- `supabase/migrations/20260901000001_kaygo_delivery_bridge.sql`

Aucune donnée Kaygo ou livraison n'a été modifiée à distance.
