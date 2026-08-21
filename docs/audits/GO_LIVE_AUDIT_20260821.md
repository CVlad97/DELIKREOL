# Audit GO-LIVE DELIKREOL — 2026-08-21

## Verdict

**NO-GO commercial** tant que les deux blocages backend ci-dessous ne sont pas levés.

| Élément | État prouvé |
|---|---|
| Production frontend | Déployée sur `delikreol.com` |
| CI dernier SHA avant audit | Verte |
| Google OAuth | Désactivé dans Supabase (`external.google=false`) |
| Email Auth | Activé |
| WhatsApp bridge VPS | Journal utilisateur : connecté sur port 3000 ; aller-retour non testé |
| Checkout Edge Function | Déployée |
| RPC atomique production | **Absente** (`PGRST202`) |
| Catalogue actif | 86 produits statiques, 0 identifiant UUID |
| Edge Function produits | Exige un UUID ; slug réel refusé HTTP 400 |
| Suivi public sécurisé | Edge Function `public-order-status` déployée, token invalide → HTTP 400 |

## P0 bloquants

### P0-1 — RPC atomique absente en production

Test non destructif :

- appel REST de découverte avec les quatre paramètres exacts ;
- réponse HTTP 404 / `PGRST202` ;
- fonction `create_checkout_order_atomic` introuvable dans le schéma exposé.

Action propriétaire contrôlée :

1. auditer `pg_policies`, contraintes, index et doublons dans le Dashboard Supabase ;
2. sauvegarder la base ;
3. appliquer `supabase/migrations/20260731000001_modular_manual_payments.sql` corrigée en staging ;
4. exécuter les cinq scénarios de concurrence ;
5. appliquer en production seulement après validation.

### P0-2 — Catalogue frontend non synchronisé avec Supabase

- `src/data/mockCatalog.ts` contient 86 produits ;
- les 86 identifiants sont des slugs, aucun n’est UUID ;
- `checkout-order` exige des UUID et recharge les produits depuis Supabase ;
- test réel `save-peyia-cote-porc` : HTTP 400, aucune commande créée.

Action : importer et valider les produits réels dans Supabase, puis conserver une table de correspondance slug frontend → UUID Supabase. Aucun prix, photo ou produit ne doit être inventé.

## Corrections autonomes livrées

- suppression du checkout direct `orders` + `order_items` dans `PublicHomePage` ;
- passage exclusif par `checkout-order` ;
- correction des quatre tranches PostgreSQL `array_agg(...)[1:10]` ;
- `AdminCommandes` lit Supabase et sépare les secours localStorage ;
- suivi public par token 128 bits via `public-order-status`, sans PII ;
- rate limiter `checkout-order` en mode fail-closed HTTP 503 ;
- tests statiques de non-régression.

## P1/P2 restants

| Priorité | Sujet | État |
|---|---|---|
| P1 | Google OAuth | activation Client ID/Secret dans Supabase requise |
| P1 | Policies propriétaire `orders/order_items` | audit et migration contrôlée requis |
| P1 | Transition admin des statuts | RPC métier recommandée, pas UPDATE libre |
| P1 | Routes produit/traiteur directes | HTTP 404 GitHub Pages pour slugs non pré-générés |
| P1 | SEO initial | métadonnées serveur génériques |
| P1 | Headers sécurité | absents sur GitHub Pages |
| P2 | PWA offline | service worker sans cache réel |
| P2 | WhatsApp | aller-retour réel depuis un second numéro non prouvé |
| P2 | Catalogue visuel | 65 images réelles, 21 placeholders, validation humaine une par une |

## Critères de sortie NO-GO

Le verdict passe à GO seulement après :

1. RPC atomique présente et limitée à `service_role` ;
2. migrations validées en staging ;
3. 86 produits ou sous-ensemble commercial validé synchronisé avec UUID ;
4. cinq scénarios concurrence réussis ;
5. commande réelle test créée, affichée dans admin, suivie via token et confirmée WhatsApp ;
6. zéro P0 ouvert.
