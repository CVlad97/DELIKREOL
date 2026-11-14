# DELIKREOL — SumUp Hosted Checkout : état réel et runbook sandbox

**Date de constat : 14/11/2026.** Remplace la mention « SumUp non intégré » de `CHECKLIST_GO_LIVE.md` et de `PREUVES_MANQUANTES_2026-09-07.md`.

## 1. Ce qui est vrai, vérifié par appel HTTP

Les deux Edge Functions sont **déployées et actives** sur le projet `boihlgodmclljtckhmgz` :

```bash
curl -sS -X POST https://boihlgodmclljtckhmgz.supabase.co/functions/v1/create-sumup-checkout \
  -H 'Content-Type: application/json' -d '{}'
# → HTTP 400 {"error":"Invalid order_id"}

curl -sS -X POST https://boihlgodmclljtckhmgz.supabase.co/functions/v1/sumup-webhook \
  -H 'Content-Type: application/json' -d '{}'
# → HTTP 200 {"received":true,"processed":false,"reason":"Missing checkout id"}
```

Réponse `400` et non `500` : les secrets (`SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`, `SUPABASE_SECRET_KEYS`) sont bien présents, sinon le module lèverait « Missing SumUp/Supabase server configuration ».

Le front est branché : `src/pages/new/CartPage.tsx` invoque `supabase.functions.invoke('create-sumup-checkout', …)` après création de la commande.

**Ce qui manque n'est donc pas du code, c'est une preuve** : la table `external_payment_events` ne contient **aucune** ligne `provider = 'sumup'`. Aucun checkout n'a jamais été créé.

## 2. Architecture réellement implémentée

| Étape | Responsable | Détail |
|---|---|---|
| 1. Commande | `checkout-order` | Montant total recalculé serveur ; `sumup` n'est **pas** un provider de création (choix assumé) |
| 2. Bascule paiement | `create-sumup-checkout` | Vérifie `order_id` + `tracking_token` + email + téléphone, refuse une commande non payable, réutilise un checkout `pending` existant |
| 3. Appel SumUp | `create-sumup-checkout` | `POST https://api.sumup.com/v0.1/checkouts` avec `hosted_checkout.enabled`, `return_url` = page de suivi, `amount` en **unités majeures** |
| 4. Retour client | SumUp | Page hébergée, puis redirection vers `/statut-commande?order=<token>` |
| 5. Notification | `sumup-webhook` | Le corps reçu n'est **qu'un déclencheur** : la fonction relit `GET /v0.1/checkouts/{id}` (source de vérité) |
| 6. Contrôles | `sumup-webhook` | `id` identique, `checkout_reference` identique, **montant et devise comparés à la base**, statut `paid` irréversible |
| 7. Trace | les deux | `orders` (statut, `paid_at`, `payment_verified_at`) + `external_payment_events` |

Trois pièges d'API correctement traités par le code, à ne pas « optimiser » :

- `return_url` est un **callback serveur** envoyé par SumUp, pas la redirection du navigateur. Le client est redirigé via `hosted_checkout_url`.
- Le corps du webhook n'est pas signé : **ne jamais** l'utiliser pour marquer une commande payée. Le code relit SumUp, c'est la bonne pratique.
- `amount` est en **unités majeures** (`12.00`), pas en centimes. La base stocke `total_cents` : la conversion se fait une seule fois.

## 3. Runbook sandbox — la preuve qui manque

### Pré-requis

1. Compte SumUp **sandbox** avec un `merchant_code` de test.
2. Secrets Supabase (Edge Functions) : `SUMUP_API_KEY`, `SUMUP_MERCHANT_CODE`, `SUMUP_ENV=sandbox`, `SUPABASE_SECRET_KEYS` contenant une clé nommée `payments`.
3. Une commande **payable** : `payment_status` ∈ {`pending`, `awaiting_payment`, `failed`, `processing`}, avec email, téléphone et `tracking_token`.

### Étape 1 — trouver une commande payable (lecture seule)

```sql
select id, order_number, payment_status, payment_provider, total_cents,
       payment_currency, tracking_token is not null as has_token
from public.orders
order by created_at desc
limit 5;
```

### Étape 2 — créer le checkout

```bash
ORDER_ID='<uuid>'
TOKEN='<tracking_token 16 hex>'
EMAIL='<email de la commande>'
PHONE='<téléphone de la commande>'

curl -sS -X POST https://boihlgodmclljtckhmgz.supabase.co/functions/v1/create-sumup-checkout \
  -H 'Content-Type: application/json' -H 'Origin: https://delikreol.com' \
  -d "{\"order_id\":\"$ORDER_ID\",\"tracking_token\":\"$TOKEN\",\"email\":\"$EMAIL\",\"phone\":\"$PHONE\"}"
```

Attendu : `200` avec `checkout_id` et `payment_url` en `https://`. Codes possibles : `403` (données non concordantes), `409` (commande non payable ou `DUPLICATED_CHECKOUT`), `502` (SumUp a refusé).

### Étape 3 — payer

Ouvrir `payment_url`. En sandbox, SumUp documente des cartes de test dans son dashboard ; **ne jamais** utiliser de vraie carte.

### Étape 4 — attendre la notification et vérifier en base

```sql
select payment_status, payment_provider, payment_external_id, paid_at, payment_verified_at
from public.orders where id = '<uuid>';

select provider, provider_event_id, status, amount_cents, currency, created_at
from public.external_payment_events where order_id = '<uuid>' order by created_at;
```

Attendu : `payment_status = 'paid'`, `paid_at` et `payment_verified_at` renseignés, une ligne d'événement `status = 'paid'`.

### Étape 5 — rejouer la notification (idempotence)

```bash
curl -sS -X POST https://boihlgodmclljtckhmgz.supabase.co/functions/v1/sumup-webhook \
  -H 'Content-Type: application/json' -d "{\"checkout_id\":\"<checkout_id>\"}"
```

Attendu : `200` et **aucun** second effet — `paid_at` inchangé, une seule ligne d'événement.

### Étape 6 — cas d'échec

- Montant altéré en base → le webhook doit répondre `409` « amount or currency mismatch » et **ne pas** marquer payé.
- `checkout_id` inconnu → `200` `{processed:false, reason:"No matching order"}`.
- Remboursement signalé sur une commande non payée → `409`.

## 3 bis. Remboursements — ce que SumUp permet réellement (vérifié 14/11/2026)

**Oui, l'API le permet.** `POST /v1.0/merchants/{merchant_code}/payments/{transaction_id}/refunds` : corps vide pour un remboursement total, `{"amount": 5}` pour un partiel, en **unités majeures**. L'ancienne route `POST /v0.1/me/refund/{txn_id}` existe encore. Limite documentée par SumUp : certains paiements de **plus de 90 jours** ne sont plus remboursables.

Trois conséquences directes pour DELIKREOL :

1. **Il faut le `transaction_id`, pas le `checkout_id`.** `orders.payment_external_id` stocke aujourd'hui l'identifiant de *checkout*. Un remboursement par API exigera donc de résoudre le `transaction_id` (via la transaction du checkout chez SumUp) avant l'appel. Sans ça, la route `refunds` répondra une erreur de ressource.
2. **SumUp ne notifie pas un remboursement sur `return_url`.** Les webhooks SumUp ne couvrent que les changements de statut de *checkout* (« our system only allows you to get notified about a status change for a checkout »). Donc le `case "REFUNDED"` de `mapStatus` dans `sumup-webhook` ne se déclenchera jamais depuis ce canal : ce n'est pas un bug, c'est du code qui ne sert qu'en cas d'évolution de l'API. Un remboursement doit être réconcilié par requête sur la transaction, ou saisi depuis le dashboard SumUp.
3. **Conséquence commerciale :** DELIKREOL ne peut pas promettre un « remboursement en ligne en un clic » tant qu'une fonction `sumup-refund` n'existe pas. La formulation correcte aujourd'hui est : remboursement traité par l'équipe via SumUp, sous 90 jours, sur la carte d'origine.

Si un remboursement automatisé devient nécessaire, la fonction à écrire est petite et suit le même schéma que `sumup-webhook` : authentifier l'admin, lire la commande, résoudre le `transaction_id`, appeler `refunds`, puis écrire `payment_status = 'refunded'` + `refunded_at` et tracer l'événement. Elle n'a pas été écrite ici : elle touche à l'argent et exige une autorisation explicite ainsi qu'un test sandbox.

## 4. Ce qui reste à faire pour être « opérationnel »

| # | Action | Propriétaire |
|---|---|---|
| 1 | Exécuter les étapes 1 à 6 en sandbox et conserver les sorties | humain (compte sandbox) |
| 2 | Renseigner `payment_sandbox.json` (`reports/launch/`) avec la preuve → débloque G3 | agent |
| 3 | Décider du remboursement : SumUp ne notifie pas les remboursements de la même façon qu'un encaissement — vérifier la voie retenue avant d'annoncer un remboursement en ligne | humain + agent |
| 4 | Ne pas passer `SUMUP_ENV=production` avant 20 commandes pilotes tracées | humain |

## 5. Nettoyage effectué

`src/services/sumupService.ts` (77 lignes) a été supprimé : c'était un stub mort (aucun import dans `src/`, `tests/` ou `scripts/`), conditionné à `VITE_SUMUP_PUBLIC_KEY`, qui affirmait « module framework, activation requise » alors que la production exécute une intégration complète. Il induisait en erreur tout audit futur. La réalité est dans les deux Edge Functions et dans ce document.
