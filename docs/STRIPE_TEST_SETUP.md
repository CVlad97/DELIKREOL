# STRIPE — Mode Test DELIKREOL

## Statut : ❌ DÉSACTIVÉ sur le site public
Le site reste WhatsApp-first. Stripe est prêt en mode test, pas activé.

## Pour activer le test

### 1. Créer compte Stripe
https://dashboard.stripe.com/register

### 2. Récupérer les clés de test
Dashboard → Developers → API Keys :
- `STRIPE_SECRET_KEY` = `sk_test_...` → backend uniquement
- `VITE_STRIPE_PUBLISHABLE_KEY` = `pk_test_...` → frontend

### 3. Configurer les variables
```bash
# Backend (Edge Function)
STRIPE_SECRET_KEY=sk_test_...

# Frontend (GitHub Actions var ou .env)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Déployer Edge Function
```bash
cd /workspace/DELIKREOL
npx supabase functions deploy create-payment-intent
```

### 5. Configurer Webhook
Dashboard → Developers → Webhooks → Add endpoint :
URL : `https://boihlgodmclljtckhmgz.supabase.co/functions/v1/stripe-webhook`
Events :
- `checkout.session.completed`
- `payment_intent.succeeded`
- `payment_intent.payment_failed`

### 6. Tester
```bash
# Carte de test Stripe : 4242 4242 4242 4242
# Date future, CVC quelconque
```

## Activation sur le site
1. Mettre `enabled: true` dans `src/config/integrations.ts`
2. Vérifier que le badge "Paiement en ligne prévu en phase 2" reste visible
3. Obtenir validation humaine
4. GO STRIPE TEST → activation

## Sécurité
- `STRIPE_SECRET_KEY` jamais dans le frontend
- `STRIPE_WEBHOOK_SECRET` jamais dans GitHub
- Webhook signing secret obligatoire
- Mode test seulement jusqu'à GO STRIPE LIVE