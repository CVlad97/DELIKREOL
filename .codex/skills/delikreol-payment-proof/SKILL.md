---
name: delikreol-payment-proof
description: Produit et vérifie les preuves de paiement DeliKreol en sandbox (cycle complet, webhook, idempotence, remboursement, paiement refusé) sans jamais activer de paiement réel. Utiliser dès qu'on veut « tester le paiement », valider un provider, ou prouver qu'une commande peut être encaissée.
---

# DeliKreol — preuve de paiement

## État de départ à respecter

- `stripe_disabled` est le provider exposé en production : Stripe n'est pas proposé au client.
- Les fonctions `create-sumup-checkout` et `sumup-webhook` sont **déployées et configurées** en production (vérifié : `400 Invalid order_id` et `200 Missing checkout id`, donc secrets présents). `CartPage.tsx` les appelle. Mais `external_payment_events` ne contient **aucune ligne `sumup`** : l'intégration est **déployée, jamais prouvée**. Voir `docs/payments/SUMUP_SANDBOX_RUNBOOK.md`.
- Remboursement SumUp : `POST /v1.0/merchants/{merchant_code}/payments/{transaction_id}/refunds` exige le **transaction_id**, pas le checkout_id, et les webhooks SumUp ne couvrent que les checkouts. Un remboursement ne peut donc pas être déduit d'une notification : il se réconcilie par requête ou via le dashboard, sous 90 jours.
- Les règlements réels du pilote sont manuels (virement, à la livraison, lien externe). C'est l'état honnête, pas un provisoire à masquer.

## Ce qu'une preuve doit contenir

Un cycle prouvé, c'est une suite exécutée dans l'ordre, avec la référence de commande conservée :

1. création de commande côté serveur, total recalculé serveur (jamais le montant du navigateur) ;
2. session/checkout sandbox ouvert, retour navigateur ;
3. webhook reçu, signature vérifiée, **rejeu du même événement sans double effet** (idempotence) ;
4. statut `payé` posé par le webhook, pas par le retour navigateur ;
5. paiement refusé → statut correct, pas de commande fantôme ;
6. remboursement → montant et référence tracés ;
7. double soumission → une seule commande.

Chaque étape produit une ligne `étape | commande | résultat | horodatage`. Sans cette ligne, l'étape est NOT_TESTED.

## Interdits

- Aucune clé live, aucun encaissement réel, aucune activation d'offre sans autorisation écrite.
- Ne jamais déduire un paiement réussi d'un HTTP 200 ou d'un retour d'URL.
- Ne jamais désactiver `verify_jwt` ni la vérification de signature pour faire passer un test.
- Ne jamais afficher de clé, de token ou de donnée bancaire dans un rapport, un commit ou un message.

## Sortie

`reports/launch/payment_sandbox.json` au format `{"gate":"payment_sandbox","status":"PASS|FAIL|BLOCKED_HUMAN|NOT_TESTED","evidence":"...","date":"..."}`. En l'absence de cycle complet, le statut est BLOCKED_HUMAN avec l'action humaine exacte (qui, où, quoi).
