# DELIKREOL — Intégrations paiements et services externes

## Position de production

Le parcours public de lancement ne dépend ni de Google Auth ni de Stripe.

- Stripe public : désactivé par `VITE_ENABLE_STRIPE_PUBLIC=false`.
- Google Auth : optionnel, jamais bloquant pour commander.
- Paiement MVP : virement Qonto, virement Revolut, paiement à la livraison, crypto wallet facultatif, confirmation WhatsApp.
- Toute API bancaire reste côté serveur via Supabase Edge Functions ou backend Hostinger.

## Variables autorisées côté frontend

Les variables `VITE_*` sont visibles dans le navigateur. Elles doivent contenir uniquement des informations affichables publiquement :

```bash
VITE_QONTO_ACCOUNT_NAME=DELIKREOL
VITE_QONTO_IBAN=FR76...
VITE_QONTO_BIC=...
VITE_REVOLUT_ACCOUNT_NAME=DELIKREOL
VITE_REVOLUT_IBAN=FR76...
VITE_REVOLUT_BIC=...
VITE_CRYPTO_NETWORK=polygon
VITE_CRYPTO_WALLET_ADDRESS=0x...
VITE_EXTERNAL_PAYMENT_URL=https://...
```

Ne jamais placer dans `VITE_*` : clé Qonto, token Revolut, clé Stripe secrète, secret webhook, clé OpenAI, clé Supabase `service_role`, seed phrase ou clé privée wallet.

## Qonto

**Statut :** MVP manuel fonctionnel après déploiement de la migration paiement.

- Le panier affiche bénéficiaire, IBAN, BIC et référence unique.
- Le client confirme sur WhatsApp.
- L’admin valide le statut dans `/admin/paiements`.
- `supabase/functions/qonto-finance` est réservé admin et lit les credentials via `Deno.env`.
- Si les credentials Qonto sont absents, la commande reste possible en mode manuel.

Secrets serveur uniquement :

```bash
QONTO_API_BASE_URL=https://thirdparty.qonto.com/v2
QONTO_CLIENT_ID=...
QONTO_CLIENT_SECRET=...
QONTO_WEBHOOK_SECRET=...
```

## Revolut Business

**Statut :** MVP manuel fonctionnel après déploiement de la migration paiement.

- Le panier affiche les coordonnées Revolut Business publiques.
- `supabase/functions/revolut-business` est un adaptateur serveur sécurisé, admin-only.
- L’automatisation API doit être validée en sandbox avant activation.

Secrets serveur uniquement :

```bash
REVOLUT_BUSINESS_API_TOKEN=...
REVOLUT_WEBHOOK_SECRET=...
```

## Crypto wallet

**Statut :** facultatif, validation manuelle.

- Priorité réseau : USDT Polygon, puis USDT Solana.
- Le frontend peut afficher une adresse publique de réception et un QR code.
- Le client renseigne un hash de transaction.
- Le backend refuse la réutilisation d’un même hash via `payment_external_id`.
- Aucune seed phrase ni clé privée ne doit exister dans GitHub, Supabase public, `localStorage` ou le navigateur.

## Stripe

**Statut :** désactivé pour le go-live manuel.

- `create-payment-intent` reste neutralisé.
- Le panier public ne propose plus Stripe.
- L’ancien code Stripe est conservé derrière feature flag désactivé pour une réactivation future en mode test uniquement.
- Ne pas activer Stripe Live tant qu’un test complet signé webhook → commande payée → audit n’a pas été réalisé.

## WhatsApp

**Statut :** canal principal de confirmation.

- La commande est préparée avec un numéro `DK-...`.
- Le client confirme le mode de paiement et les détails sur WhatsApp.
- Si popup WhatsApp bloquée, la commande reste enregistrée et le client peut relancer le lien.
- Aucun message WhatsApp réel ne doit être envoyé par automation sans validation explicite.

## Google Sheets, Zapier, Make, OpenAI

**Statut :** non bloquants pour le paiement.

- Les webhooks Zapier/Make peuvent rester publics uniquement s’ils ne contiennent pas de secret.
- Google Sheets doit rester fallback/reporting, pas source de vérité paiement.
- OpenAI doit passer par un proxy/Edge Function ; aucune clé OpenAI dans `VITE_*`.

## Hostinger / VPS

- Mettre les secrets bancaires dans un fichier serveur non versionné avec permissions restrictives ou dans le gestionnaire de secrets du déploiement.
- Auditer Docker, UFW, ports exposés, reverse proxy, certificats TLS et logs avant tout changement.
- Préparer rollback avant modification de service.

## Procédure de rollback paiement manuel

1. Désactiver les providers publics dans `.env` sauf `cash_on_delivery`.
2. Redéployer le frontend.
3. Conserver les colonnes paiement ajoutées pour audit historique.
4. Si la migration SQL doit être annulée, supprimer seulement les fonctions/RLS créées après export des événements d’audit.
