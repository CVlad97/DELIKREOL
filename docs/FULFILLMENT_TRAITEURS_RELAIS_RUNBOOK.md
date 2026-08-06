# Fulfillment traiteurs + points relais

Statut : préparé pour revue. Ne pas déployer et ne pas appliquer la migration sans validation humaine.

## Modes

- `livraison_directe` : un seul traiteur, livraison client, refus serveur si plusieurs traiteurs.
- `livraison_programmee` : plusieurs traiteurs possibles avec confirmation explicite si multi-traiteurs.
- `retrait_traiteur` : un seul traiteur, créneau client obligatoire côté interface.
- `point_relais` : plusieurs traiteurs possibles uniquement si le relais, la capacité et le plan sont validés côté serveur.
- `traiteur_point_relais` : un traiteur peut aussi héberger un point relais, uniquement si le relais est explicitement configuré avec `relay_points.vendor_id`.

## Architecture

- Frontend : le panier calcule un `FulfillmentPlan` avant validation et affiche le code, les frais, les transferts, les alternatives et la confirmation.
- Moteur pur : `src/services/fulfillmentRules.ts` contient les types, règles, empreinte déterministe et sélection relais locale.
- Edge Function : `checkout-order` recalcule les contraintes critiques et refuse les contournements avant insertion.
- Base : la migration `20260804000001_vendor_relay_fulfillment_rules.sql` prépare les colonnes, `relay_reservations`, RLS et expiration des réservations.
- Traiteur-relais : l’identité traiteur (`vendor_id`) et l’identité relais (`relay_point_id`) restent distinctes. Une même entreprise peut porter les deux rôles, mais les vues doivent rester séparées.

## Sécurité

- Le frontend n’est pas autorité : `fulfillment_mode`, `relay_point_id`, `fulfillment_plan_code` et `fulfillment_plan_fingerprint` sont revalidés serveur.
- Un identifiant relais non UUID est refusé sans erreur SQL brute.
- Un point relais inactif ou absent bloque la commande avec `NO_COMPATIBLE_RELAY_OPTION`.
- Le retrait traiteur multi-traiteurs est refusé avec `VENDOR_PICKUP_MULTIPLE_VENDORS_NOT_ALLOWED`.
- La livraison directe multi-traiteurs est refusée avec `DIRECT_DELIVERY_MULTIPLE_VENDORS_NOT_ALLOWED`.
- Un traiteur configuré comme point relais ne doit pas recevoir les prix, revenus ou produits des autres traiteurs via son espace traiteur. Ces données doivent passer par une vue relais dédiée.

## Données manquantes

- Aucun point relais réel actif n’est présent dans les données locales.
- Les champs stockage chaud/froid/surgelé ne sont pas encore renseignés en production.
- Les réservations atomiques nécessitent l’application contrôlée de la migration.
- Le routage reste heuristique : aucune API de distance réelle n’est branchée.
- Les traiteurs pouvant servir de relais doivent être validés manuellement : stockage, horaires, capacité et responsabilité sanitaire.

## Rollback

Sans migration appliquée :

```bash
git revert <commit-fulfillment>
```

Si la migration a été appliquée après validation humaine :

1. Désactiver les flags serveur `ENABLE_RELAY_PICKUP`, `ENABLE_MULTI_VENDOR_RELAY`, `ENABLE_RELAY_CAPACITY_RESERVATION`.
2. Exporter les réservations :

```sql
create table backup_relay_reservations_YYYYMMDD as
select * from public.relay_reservations;
```

3. Revenir au commit applicatif précédent.
4. Ne supprimer table/fonction qu’après validation :

```sql
drop function if exists public.expire_relay_reservations();
drop table if exists public.relay_reservations;
```

## Tests attendus avant pilote

- Tests unitaires `fulfillmentRules`.
- Tests source `checkout-order` pour codes métier et validation serveur.
- Tests Supabase local pour RLS et capacité concurrente après application en environnement local.
- E2E mobile panier → relais → confirmation → commande unique avec un relais réel de test.
