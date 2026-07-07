# SECURITY.md — DELIKREOL

## 🔐 Sécurité des données

### Supabase

#### Auth
- ✅ Auth Supabase configuré avec JWT
- ✅ Sessions persistées dans localStorage
- ✅ Auto-refresh des tokens activé
- ✅ Détection de session dans l'URL
- ✅ Mode démo avec dégradation gracieuse (pas de crash sans credentials)
- ❌ Google OAuth non intégré (placeholder)

#### Row Level Security (RLS)
Toutes les tables métier ont des policies RLS :

| Table | RLS | Policy |
|---|---|---|
| `profiles` | ✅ | Lecture : soi-même ou admin. Écriture : soi-même |
| `orders` | ✅ | Clients : leurs commandes. Admins : tout |
| `order_items` | ✅ | Même scope que orders |
| `products` | ✅ | Lecture publique. Écriture : vendor propriétaire ou admin |
| `vendors` | ✅ | Lecture publique. Écriture : propriétaire ou admin |
| `drivers` | ✅ | Lecture publique. Écriture : propriétaire ou admin |
| `relay_points` | ✅ | Lecture publique. Écriture : propriétaire ou admin |
| `partner_applications` | ✅ | Admins uniquement (hotfix 20260620) |
| `admin_users` | ✅ | Administrateurs définis nommément |
| `payments` | ✅ | Limitée aux concernés et admins |
| `deliveries` | ✅ | Limitée aux concernés et admins |

#### Storage (Stocker des photos)
- Bucket `caterer-photos` : lecture publique, écriture authentifiée
- Limite de taille : 5 MB par fichier
- Types MIME autorisés : JPEG, PNG, WebP, GIF, AVIF

#### Edge Functions
- `stripe-webhook` : `verify_jwt: false` (signature Stripe → pas de JWT)
- `create-payment-intent` : `verify_jwt: true`
- `stripe-connect-onboard` : `verify_jwt: true`
- `stripe-payout` : `verify_jwt: true`
- `checkout-order` : authentifié
- `qonto-finance` : admin uniquement

### Frontend

#### Protection des secrets
- ✅ Aucune clé secrète dans le code frontend
- ✅ Variables VITE_ sont les seules exposées côté client
- ✅ `STRIPE_SECRET_KEY` jamais dans les variables VITE_
- ✅ Qonto : paramètres backend uniquement (commentés dans .env.example)
- ✅ Service role : jamais exposé

#### Injections XSS
- ✅ React JSX échappe automatiquement
- ✅ Pas de `dangerouslySetInnerHTML` (vérifié)
- ✅ Aucun `eval()` ou template dynamique non sécurisé

#### CSRF
- ✅ Supabase gère les JWT + refresh tokens
- ✅ Les sessions sont liées à l'origine

### Stripe

#### Paiements
- ✅ Idempotency key stable basée sur `orderId` (évite les doubles paiements)
- ✅ Recalcul serveur du montant (vérification côté serveur vs frontend)
- ✅ Webhook signature vérifiée (Stripe secret)
- ✅ Webhook idempotent : Set mémoire + table `stripe_webhook_events`
- ✅ `application_fee_amount` calculé côté serveur

#### Stripe Connect
- ✅ Transfert automatique vers compte Connect du partenaire
- ✅ Commission plateforme (15%) prélevée automatiquement
- ✅ Statut du compte tracké via webhook `account.updated`

### Recommandations de sécurité

1. **Ajouter CSP (Content Security Policy)** dans les headers HTTP
2. **Activer la double authentification** pour les comptes admin Supabase
3. **Configurer les rate limits** sur les endpoints Supabase
4. **Ajouter une politique de backup** pour la base de données Supabase
5. **Remplacer le Google OAuth placeholder** par une implémentation réelle
6. **Mettre en place un monitoring** des tentatives de connexion échouées