# Audit backend production DELIKREOL — Supabase / RLS / Edge Functions / Stripe Connect

Date : 2026-07-27  
Projet Supabase : `boihlgodmclljtckhmgz`  
Décision : **NO-GO production paiement Stripe / Connect** tant qu’un test Stripe signé complet n’a pas validé commande, paiement, webhook, commission et reversement/payout.

## 1. État initial

- Dépôt local sauvegardé avant intervention : `/tmp/delikreol-backups/pre-backend-prod-audit-20260727.patch`.
- Migrations locales sauvegardées : `/tmp/delikreol-backups/pre-backend-prod-migrations-20260727.txt`.
- HEAD initial : `134d2e4257e182d737ba274321df1f3675476201`.
- Plusieurs changements frontend/images existaient déjà avant cet audit ; ils n’ont pas été écrasés.
- Edge Functions distantes présentes : `checkout-order`, `create-checkout-session`, `create-payment-intent`, `stripe-webhook`, `stripe-payout`, `stripe-connect-onboard`, `create-connected-account`.
- Connect réel non prêt : `vendors_with_connect=0`, `charges_enabled=0`, `payouts_enabled=0`.
- Auth advisor : protection contre mots de passe compromis désactivée côté Supabase Auth.

## 2. Vulnérabilités confirmées

| Gravité | Zone | Problème | Impact | Correctif |
|---|---|---|---|---|
| P0 | `contact_messages` | Politique `Allow authenticated select` avec `USING true` | Tous les utilisateurs authentifiés pouvaient lire les messages de contact | Politique supprimée |
| P0 | `orders` | Insertion publique directe `orders_insert_public_checkout` | Commandes falsifiables depuis frontend | Politique supprimée ; passage par `checkout-order` |
| P0 | `order_items` | Insertion publique directe `order_items_insert_public_checkout` | Lignes/prix/vendeurs falsifiables | Politique supprimée ; création serveur |
| P0 | `payments` | Insertion client directe `Customers can create payments for own orders` | Traces paiement falsifiables | Politique supprimée ; webhook/fonctions serveur |
| P0 | `profiles` | Update utilisateur sans `WITH CHECK` robuste | Risque d’escalade de rôle/type | Remplacé par `profiles_update_own_safe` |
| P0 | `create-payment-intent` | Risque ancien flux paiement public | Montant/destination potentiellement falsifiables | Fonction neutralisée HTTP 410 |
| P0 | `stripe-payout` | Risque de confiance dans montant/destination frontend | Reversements incorrects possibles | Recalcul base + admin serveur |
| P1 | RLS | Politiques admin doublonnées avec `{public}` + helpers | Surface confuse, risque de dérive | P0 corrigés ; fusion complète à planifier |
| P1 | Auth | Protection mots de passe compromis désactivée | Comptes plus exposés | Action manuelle Supabase Auth requise |
| P1 | Dépendances | `npm audit --omit=dev` signale vulnérabilités high | Risque supply-chain | Non corrigé car `--force` interdit |

## 3. Faux positifs ou risques acceptés

- `stripe_webhook_events_service` utilise `USING true`, mais uniquement pour `service_role` : acceptable pour traitement webhook serveur.
- `contact_messages_public_insert_strict` reste ouvert à `anon`/`authenticated` avec validation stricte : nécessaire pour formulaire contact public.
- Les politiques de lecture publique des vendeurs/produits restent nécessaires au catalogue public.
- Les index “unused” ne sont pas supprimés : absence d’usage peut venir du faible trafic.

## 4. Migrations créées

Migration locale et appliquée au projet Supabase réel :

- `supabase/migrations/20260727170541_backend_production_hardening_20260727.sql`

Contenu :

- Table `checkout_rate_limits` pour limiter les créations de commandes publiques.
- RPC `consume_checkout_rate_limit(...)` réservée `service_role`.
- Colonnes `stripe_webhook_events.attempt_count` et `stripe_webhook_events.error_message`.
- RPC `increment_stripe_webhook_attempt(...)` réservée `service_role`.
- Index ajoutés :
  - `external_payment_events(order_id)`
  - `partner_notifications(order_id)`
  - `payouts(requested_by)`
  - `partner_documents(reviewed_by)`
  - `partner_documents(validated_by)`
  - `stripe_webhook_events(attempt_count)`
  - `payments(order_id)` unique si aucune donnée dupliquée.
- Suppression des politiques P0 permissives.
- Remplacement de l’update profil par une politique qui préserve `role` et `user_type`.

Migration distante confirmée :

- `20260727173755 backend_production_hardening_20260727`.

## 5. Fonctions modifiées

| Fonction | Statut local | Statut distant | Changement |
|---|---:|---:|---|
| `checkout-order` | Modifiée | Non déployée | Point d’entrée serveur unique : validation, recalcul prix, commission 15 %, mono-vendeur, idempotence, rate limit |
| `create-checkout-session` | Modifiée | Non déployée | Checkout Stripe Connect single-vendor, Destination Charge, compte vendeur obligatoire |
| `create-payment-intent` | Modifiée | Non déployée | Neutralisée HTTP 410, flux legacy désactivé |
| `stripe-webhook` | Modifiée | Non déployée | Signature brute, idempotence durable, events Stripe étendus, paiements/remboursements/litiges |
| `stripe-payout` | Modifiée | Non déployée | JWT + rôle admin serveur, recalcul montant éligible, compte Connect obligatoire |
| `stripe-connect-onboard` | Modifiée | Non déployée | Onboarding admin, ne fait plus confiance aux données frontend |

Déploiement bloqué :

- `npx supabase functions deploy ... --use-api` échoue sans `SUPABASE_ACCESS_TOKEN`.

## 6. Politiques RLS avant/après

| Table | Avant | Après | Décision |
|---|---|---|---|
| `contact_messages` | `Allow authenticated select` avec `USING true` | Supprimée | Remplacer |
| `orders` | Insert public direct possible | Insert direct public supprimé | Remplacer par Edge Function |
| `order_items` | Insert public direct possible | Insert direct public supprimé | Remplacer par Edge Function |
| `payments` | Insert client direct possible | Insert client direct supprimé | Remplacer par webhook/fonctions |
| `profiles` | Update propre profil sans préservation stricte rôle/type | `profiles_update_own_safe` | Remplacer |
| `external_payment_events` | Admin policy recréée | Admin authenticated avec `(select auth.uid())` | Conserver |
| `partner_notifications` | Admin policy recréée | Admin authenticated avec `(select auth.uid())` | Conserver |
| `payouts` | Admin policy recréée | Admin authenticated avec `(select auth.uid())` | Conserver |
| `stripe_webhook_events` | Service role + admin read | Service role conservé, admin read optimisé | Conserver |
| `vendors`, `drivers`, `partner_documents`, `dashboard_alerts` | Doublons admin encore présents | Non fusionnés pour éviter régression | À nettoyer en lot suivant |

## 7. Architecture Stripe retenue

- Lancement : **panier mono-vendeur uniquement**.
- Paiement : **Stripe Checkout + Destination Charge** vers un seul compte Connect vendeur.
- Commission : **15 % par défaut**, recalculée serveur depuis `order_items.vendor_commission` ou `vendors.commission_rate`.
- Multi-vendeur : explicitement bloqué avec réponse `409`; architecture multi-vendeur reportée.
- Architecture multi-vendeur recommandée plus tard : une sous-commande et un paiement par vendeur.
- `on_behalf_of` non utilisé : décision juridique/merchant of record non actée.

## 8. Événements webhook couverts

| Événement Stripe | Effet |
|---|---|
| `checkout.session.completed` | Met `paid` seulement si `payment_status='paid'`, sinon `processing` |
| `checkout.session.async_payment_succeeded` | Même logique que checkout payé |
| `checkout.session.async_payment_failed` | `orders.payment_status='failed'`, trace paiement échouée |
| `payment_intent.succeeded` | `orders.payment_status='paid'`, `payments.status='completed'` |
| `payment_intent.payment_failed` | `orders.payment_status='failed'`, erreur enregistrée |
| `charge.refunded` | `orders.payment_status='refunded'`, `payments.status='refunded'` |
| `charge.dispute.created` | `order_event=payment_dispute_created`, pas de remboursement automatique |
| `account.updated` | Synchronise état Connect vendeur/livreur |
| `payout.paid` | Événement reconnu/loggué |
| `payout.failed` | Événement reconnu/loggué |
| `transfer.created` | Trace payout locale |

## 9. Résultats des tests

Commandes exécutées :

- `npm run typecheck` : OK.
- `npm run lint` : OK.
- `npm run test --if-present -- --maxWorkers=1` : OK, 13 fichiers, 43 tests.
- `npm run build` : OK.
- `npm run audit:secrets --if-present` : OK, aucun secret détecté.
- `npm run audit:links` : OK, 22/22 pages.
- `npm run test --if-present -- tests/supabase/backend-hardening.spec.ts --maxWorkers=1` : OK, 5 tests backend statiques.
- `npm audit --omit=dev` : ÉCHEC, 10 vulnérabilités high ; pas corrigées car `npm audit fix --force` interdit.

Tests non exécutés faute de prérequis :

- Paiement Stripe 4242 complet.
- Webhook signé Stripe réel.
- Transfer/payout test traçable.
- Tests Edge Functions distantes mises à jour, car les fonctions locales ne sont pas déployées.

## 10. Risques restants

- **Blocant** : aucune fonction Edge modifiée n’est déployée sans `SUPABASE_ACCESS_TOKEN`.
- **Blocant** : aucun vendeur n’a un compte Stripe Connect prêt (`charges_enabled=0`, `payouts_enabled=0`).
- **Blocant** : aucun paiement Stripe test signé complet n’a été validé.
- **Blocant** : `npm audit --omit=dev` échoue avec vulnérabilités high.
- **Action manuelle** : activer la protection Supabase contre les mots de passe compromis.
- **Compatibilité** : les anciens écrans qui écrivaient directement dans `orders` / `order_items` ne doivent plus le faire ; ils doivent passer par `checkout-order`.
- **Nettoyage P1** : doublons RLS admin encore présents sur plusieurs tables.

## 11. Décision GO / NO-GO

Décision : **NO-GO production paiement / Stripe Connect**.

Ce qui est prêt :

- Base Supabase renforcée contre les écritures publiques critiques.
- Migrations P0 appliquées.
- Code local des fonctions durci.
- Suite TypeScript/lint/tests/build OK.

Ce qui manque pour GO :

1. Déployer les Edge Functions modifiées.
2. Onboarder au moins un vendeur Connect test avec `charges_enabled=true` et `payouts_enabled=true`.
3. Créer une commande via `checkout-order`.
4. Payer en Stripe test.
5. Recevoir un webhook signé.
6. Vérifier idempotence sur event dupliqué.
7. Vérifier commission 15 %.
8. Vérifier transfert ou payout test traçable.
9. Résoudre ou accepter formellement les vulnérabilités `npm audit`.

## 12. Procédure de rollback

Rollback local :

```bash
git apply -R /tmp/delikreol-backups/pre-backend-prod-audit-20260727.patch
```

Rollback DB recommandé :

1. Créer une nouvelle migration Supabase de rollback.
2. Si urgence compatibilité, recréer temporairement les politiques supprimées, en priorité `orders_insert_public_checkout` et `order_items_insert_public_checkout`, mais ce rollback rouvre le risque P0.
3. Supprimer ou neutraliser `checkout_rate_limits` et les RPC associées seulement si elles bloquent un flux critique.
4. Conserver les index ajoutés sauf preuve d’impact négatif.

Rollback Edge Functions :

- Aucune fonction distante n’a été déployée pendant cette passe, donc aucun rollback distant n’est nécessaire à ce stade.
