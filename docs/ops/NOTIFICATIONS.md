# Notifications partenaire — comment elles partent, pourquoi elles n'arrivent pas

## Chaîne complète

1. `checkout-order` (edge function) crée la commande, puis insère une ligne dans
   `public.partner_notifications` avec `channel = 'webpush'` et `status =
   'queued'`. Le numéro du traiteur est copié depuis `vendors.phone`.
2. Un worker Node tourne sur le VPS (`ops/webpush/worker.mjs`, service
   `delikreol-webpush-worker`) et interroge `vendor-push-gateway` toutes les
   quelques secondes (`action: pull_webpush`).
3. La fonction résout le traiteur par téléphone, charge ses abonnements dans
   `vendor_push_subscriptions` (`disabled_at is null`), et renvoie la liste.
4. Le worker envoie le Web Push avec les clés VAPID puis renvoie `ack`
   (`sent`, `failed`, `no_subscription`, `blocked`).
5. La fonction met à jour la ligne, et — depuis le 15/11 — pose
   `orders.partner_notified_at` **uniquement** quand l'envoi a réussi.

## Les cinq raisons pour lesquelles rien n'arrive

| Cause | Symptôme en base | Correctif |
|---|---|---|
| Aucun appareil abonné | `vendor_push_subscriptions` vide ; `last_error = 'Aucun appareil traiteur abonné aux notifications Web Push.'` | Le traiteur ouvre son espace commandes et appuie sur « Activer les alertes » |
| Traiteur sans compte | `vendors.user_id is null` → `getCurrentVendor()` lève « Fiche traiteur active introuvable » | créer son compte auth et rattacher `vendors.user_id` |
| Traiteur sans téléphone | `vendors.phone` et `whatsapp` nuls → aucune notification n'est même créée | renseigner un numéro |
| Worker arrêté sur le VPS | les lignes restent `queued` avec `attempts = 0` | `systemctl status delikreol-webpush-worker` |
| Ancien bug : traiteur inactif | `findVendor` filtrait `is_active = true` → `no_subscription` sur une commande pourtant passée chez lui | corrigé le 15/11 |

## Diagnostic en trois requêtes

```sql
select count(*) filter (where disabled_at is null) as actifs from public.vendor_push_subscriptions;
select status, count(*), max(created_at) from public.partner_notifications group by status;
select business_name, phone, user_id is not null as a_un_compte from public.vendors;
```

Une file qui grossit en `queued` avec `attempts = 0` désigne le worker, pas
l'application.

## Ce qui a changé le 15/11

- `vendor-push-gateway` : `findVendor` ne filtre plus `is_active` (un traiteur
  désactivé reste destinataire des commandes déjà passées) et préfère un
  compte actif quand plusieurs fiches partagent un numéro.
- `vendor-push-gateway` : `no_subscription` n'est plus terminal — la
  notification repart en file (10 tentatives, espacées de 2 minutes) pour
  qu'une activation tardive du téléphone la débloque au lieu de la perdre.
- `vendor-push-gateway` : `orders.partner_notified_at` est posé à l'envoi
  réussi, plus à la mise en file.
- `checkout-order` : un traiteur sans téléphone produit désormais une erreur
  explicite (`partner_notification_error`) au lieu d'un silence.

## Déployer

```bash
SUPABASE_ACCESS_TOKEN=... npm run supabase:deploy:functions
```

Puis vérifier qu'une commande de test produit bien une ligne `queued` avec un
`attempts` qui progresse — c'est la preuve que le worker tourne.

## Limite connue

Il n'existe **aucun canal de notification pour le client** (confirmation de
commande, commande prête) ni pour l'administrateur : la chaîne ci-dessus est
exclusivement destinée au traiteur. Ajouter un canal e-mail demande un
fournisseur et une clé d'API.
