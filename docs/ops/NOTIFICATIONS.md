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

## Canal e-mail client (confirmation de commande)

Ajouté le 15/11 dans `checkout-order`, après l'écriture de la commande.
Fournisseur : **Resend** (`POST https://api.resend.com/emails`), sans SDK.

| Secret Supabase | Obligatoire | Rôle |
|---|---|---|
| `RESEND_API_KEY` | **oui** | envoi des e-mails ; absent = aucun e-mail, la commande passe quand même |
| `ORDER_EMAIL_FROM` | non | expéditeur, défaut `DELIKREOL <commandes@delikreol.com>` |
| `ORDER_EMAIL_REPLY_TO` | non | réponse, défaut `commandes@delikreol.com` |

Règles appliquées :

- **jamais sur un rejeu idempotent** — `result.existing` vrai signifie que
  l'e-mail n'est pas renvoyé, pour éviter les doublons sur un rafraîchissement ;
- **best-effort** — un échec d'envoi ne fait pas échouer la commande, mais il
  est retourné dans `customer_email_sent` / `customer_email_error` et écrit en
  log : le silence n'est pas un état acceptable ;
- **aucune adresse** — `customer_email_error = 'aucune adresse e-mail client fournie'`.

Preuve d'envoi : la réponse de `checkout-order` (`customer_email_sent: true`)
plus l'identifiant `id` renvoyé par Resend dans le tableau de bord Resend →
Emails. Un `sent: true` seul ne prouve pas la délivrabilité, seulement l'acceptation.

### Domaine d'envoi

Resend refuse d'envoyer depuis un domaine non vérifié : tant que
`delikreol.com` n'est pas vérifié (enregistrements DKIM/SPF à ajouter), l'envoi
vers une adresse autre que celle du propriétaire du compte Resend est rejeté.
Le domaine DNS de `delikreol.com` est chez Hostinger (`dns-parking.com`).

### Limite connue

Il n'existe toujours **aucun canal pour l'administrateur** (nouvelle commande,
incident paiement) : les notifications traiteur restent du Web Push et le
client reçoit un e-mail, mais personne n'alerte l'exploitant.
