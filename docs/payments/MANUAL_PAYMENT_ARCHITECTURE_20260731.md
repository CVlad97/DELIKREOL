# DELIKREOL — Audit et architecture paiements manuels

Date : 2026-07-31
Décision : Stripe et Google Auth ne doivent pas bloquer la production. Le parcours prioritaire est Supabase + paiement manuel + confirmation WhatsApp.

## 1. État initial audité

| Élément | Statut | Décision |
| --- | --- | --- |
| Stripe frontend | Partiellement implémenté | Désactivé côté panier et ancienne modale ; code conservé derrière feature flag/off |
| `create-payment-intent` | Neutralisé | Conserver désactivé |
| `create-checkout-session` / `stripe-webhook` | Préparés pour test Stripe | Ne pas utiliser au go-live manuel |
| Qonto | Partiellement implémenté | Mode manuel prioritaire ; API admin-only et désactivée si secrets absents |
| Revolut | Nouveau squelette sécurisé | Mode manuel prioritaire ; API future admin-only |
| Crypto wallet | Nouveau mode facultatif | Adresse publique + QR + hash ; validation manuelle uniquement |
| WhatsApp | Fonctionnel comme confirmation | Canal principal de confirmation commande |
| `checkout-order` | Fonctionnel mais idempotence non atomique avant patch | Corrigé via RPC transactionnelle + verrou advisory |
| `order_number` | Généré côté serveur | Doublons audités avant index unique conditionnel |
| `idempotency_key` | Utilisé mais risque concurrence avant patch | Corrigé côté serveur |
| `payment_provider` / `payment_status` | Présents selon migrations historiques | Normalisés par migration non destructive |
| wallets / loyalty / trading | Présents ou référencés dans le projet | Non supprimés ; rapport requis avant nettoyage |
| Hostinger VPS | Non audité dans cette session | Accès serveur réel requis avant correction |
| GitHub Actions | Présentes | Audit secrets/build locaux nécessaires avant push |

## 2. Architecture retenue

Providers acceptés :

- `qonto_transfer`
- `revolut_transfer`
- `cash_on_delivery`
- `crypto_wallet`
- `external_payment_link`
- `stripe_disabled`

Statuts paiement :

- `pending`
- `proof_submitted`
- `under_review`
- `paid`
- `failed`
- `refunded`
- `cancelled`

Le frontend envoie seulement les lignes minimales, le mode livraison, les informations client nécessaires et une `idempotency_key`. Les prix, totaux et disponibilités sont recalculés dans `checkout-order` depuis Supabase.

## 3. Idempotence atomique

La migration `20260731000001_modular_manual_payments.sql` ajoute `create_checkout_order_atomic` :

1. contrôle `idempotency_key` ;
2. verrouille la transaction par `pg_advisory_xact_lock` ;
3. recharge une commande existante avant insertion ;
4. insère commande, lignes et événement dans la même transaction ;
5. retourne la commande existante en cas de double soumission.

Cette migration ne supprime aucune commande et ne modifie aucun montant historique.

## 4. Sécurité

- Aucune clé privée n’est placée dans `VITE_*`.
- Qonto/Revolut API : secrets lus uniquement via `Deno.env`.
- `qonto-finance`, `qonto-sync` et `revolut-business` exigent un JWT et le rôle admin.
- Le hash crypto est stocké en `payment_external_id` et préparé pour unicité conditionnelle.
- Aucune seed phrase ni clé privée wallet ne doit être stockée dans GitHub, Supabase public, `localStorage` ou navigateur.

## 5. Variables d’environnement

Frontend affichable :

```bash
VITE_QONTO_ACCOUNT_NAME=DELIKREOL
VITE_QONTO_IBAN=FR76...
VITE_QONTO_BIC=...
VITE_REVOLUT_ACCOUNT_NAME=DELIKREOL
VITE_REVOLUT_IBAN=FR76...
VITE_REVOLUT_BIC=...
VITE_CRYPTO_NETWORK=polygon
VITE_CRYPTO_WALLET_ADDRESS=0x...
VITE_EXTERNAL_PAYMENT_URL=
VITE_ENABLE_STRIPE_PUBLIC=false
```

Serveur uniquement :

```bash
QONTO_API_BASE_URL=https://thirdparty.qonto.com/v2
QONTO_CLIENT_ID=...
QONTO_CLIENT_SECRET=...
QONTO_WEBHOOK_SECRET=...
REVOLUT_BUSINESS_API_TOKEN=...
REVOLUT_WEBHOOK_SECRET=...
```

## 6. Tests à exécuter

- Commande Qonto avec double clic.
- Commande Revolut avec popup WhatsApp bloquée.
- Commande paiement livraison.
- Commande crypto avec hash fictif, sans transaction réelle.
- Tentative de réutilisation du même hash.
- Deux onglets avec même panier et même idempotency key.
- Validation admin `paid` puis rejet impossible sans commentaire métier.
- Lecture dashboard admin/partenaire après login.

## 7. Hostinger

Non modifié dans cette session. Procédure avant toute action serveur :

1. sauvegarder `.env`, compose, reverse proxy et certificats ;
2. lister Docker, ports, UFW, services et logs ;
3. vérifier permissions des fichiers secrets ;
4. retirer tout secret exposé dans volume public ;
5. documenter rollback avant redémarrage.

## 8. Rollback

1. Désactiver `VITE_CRYPTO_WALLET_ADDRESS`, `VITE_EXTERNAL_PAYMENT_URL`, IBAN/BIC si besoin.
2. Redéployer le frontend.
3. Conserver les colonnes paiement pour audit historique.
4. Désactiver les Edge Functions bancaires sans supprimer les logs.
5. Si rollback SQL impératif : supprimer uniquement les fonctions `admin_review_payment` et `create_checkout_order_atomic` après export `payment_audit_events`.

## 9. Actions manuelles restantes

- Appliquer la migration Supabase en staging puis production.
- Déployer `checkout-order`, `qonto-finance`, `qonto-sync`, `revolut-business`.
- Renseigner les IBAN/BIC publics corrects dans l’environnement de build.
- Tester un flux réel sans paiement bancaire automatique : commande → WhatsApp → preuve → validation admin.
- Ne pas fusionner/réactiver PR #41 tant que l’idempotence atomique n’est pas validée sur Supabase.
