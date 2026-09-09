#!/bin/bash
# DELIKREOL Stripe Sandbox / RLS / DB Validation — 2026-09-09
# Vérifications réelles (pas d'invention). Script autonome, pas besoin de Docker.

set -euo pipefail

echo "=== DELIKREOL Stripe Sandbox Validation (2026-09-09) ==="
echo ""

# 1. Vérifier que le code Stripe existe et suit le pattern P8S (sans Connect)
FILE_CHECKOUT_SESSION="/workspace/DELIKREOL/supabase/functions/create-checkout-session/index.ts"
FILE_STRIPE_WEBHOOK="/workspace/DELIKREOL/supabase/functions/stripe-webhook/index.ts"
FILE_PAYMENT_PROVIDERS="/workspace/DELIKREOL/src/config/paymentProviders.ts"
FILE_SUPABASE_CONFIG="/workspace/DELIKREOL/supabase/config.toml"

echo "[1] Vérification code Stripe (P8S — sans Connect)"
if grep -q 'mode: "payment"' "$FILE_CHECKOUT_SESSION"; then
  echo "  ✅ checkout-session : mode=payment (plateforme uniquement)"
else
  echo "  ❌ checkout-session : mode=payment MANQUANT"
fi

if grep -q 'platform_only_no_connect' "$FILE_CHECKOUT_SESSION"; then
  echo "  ✅ checkout-session : architecture=platform_only_no_connect"
else
  echo "  ❌ checkout-session : architecture MANQUANTE"
fi

if grep -q 'stripe.connect.onboard\|transfer_data\|destination: connectedAccountId' "$FILE_CHECKOUT_SESSION"; then
  echo "  ❌ checkout-session : logique Connect détectée (interdit pour P8S)"
else
  echo "  ✅ checkout-session : pas de logique Stripe Connect"
fi

# 2. Vérifier webhook
if grep -q 'checkout.session.completed' "$FILE_STRIPE_WEBHOOK"; then
  echo "  ✅ webhook : checkout.session.completed présent"
else
  echo "  ❌ webhook : checkout.session.completed MANQUANT"
fi

if grep -q 'constructEventAsync' "$FILE_STRIPE_WEBHOOK"; then
  echo "  ✅ webhook : constructEventAsync présent"
else
  echo "  ❌ webhook : constructEventAsync MANQUANT"
fi

# 3. Vérifier RLS (migration)
echo ""
echo "[2] Vérification RLS (hardening)"
RLS_MIGRATION="/workspace/DELIKREOL/supabase/migrations/20260727170541_backend_production_hardening_20260727.sql"
if [ -f "$RLS_MIGRATION" ]; then
  echo "  ✅ Migration RLS présente : $(basename $RLS_MIGRATION)"
  echo "  Contenu (extrait) :"
  grep -n 'drop policy\|revoke all\|role = ' "$RLS_MIGRATION" | head -5
else
  echo "  ❌ Migration RLS MANQUANTE"
fi

# 4. Vérifier variables Stripe (pas d'invention)
echo ""
echo "[3] Vérification variables d'environnement Stripe"
# Vérifier .env.example (ne pas lire .env car protégé)
if grep -q 'STRIPE_SECRET_KEY=' "/workspace/DELIKREOL/.env.example" && ! grep -q '# STRIPE_SECRET_KEY=' "/workspace/DELIKREOL/.env.example"; then
  echo "  ✅ .env.example contient STRIPE_SECRET_KEY (décommenté)"
else
  echo "  ⚠️  .env.example : STRIPE_SECRET_KEY est commenté (CONFIGURATION EXTERNE REQUISE)"
fi

if grep -q 'STRIPE_WEBHOOK_SECRET=' "/workspace/DELIKREOL/.env.example" && ! grep -q '# STRIPE_WEBHOOK_SECRET=' "/workspace/DELIKREOL/.env.example"; then
  echo "  ✅ .env.example contient STRIPE_WEBHOOK_SECRET (décommenté)"
else
  echo "  ⚠️  .env.example : STRIPE_WEBHOOK_SECRET est commenté (CONFIGURATION EXTERNE REQUISE)"
fi

# 5. Vérifier table stripe_webhook_events dans le code webhook
echo ""
echo "[4] Vérification DB stripe_webhook_events"
if grep -q 'stripe_webhook_events' "$FILE_STRIPE_WEBHOOK"; then
  echo "  ✅ Référence stripe_webhook_events trouvée dans webhook"
else
  echo "  ❌ stripe_webhook_events MANQUANT dans webhook"
fi

# 6. Vérifier fournisseurs (stripe_disabled)
echo ""
echo "[5] Vérification provider stripe_disabled"
if grep -q 'stripe_disabled' "$FILE_PAYMENT_PROVIDERS"; then
  echo "  ✅ Provider stripe_disabled présent (désactivé par défaut)"
else
  echo "  ❌ stripe_disabled MANQUANT"
fi

# 7. Vérifier tests existants
echo ""
echo "[6] Vérification tests existants"
if [ -f "/workspace/DELIKREOL/tests/supabase/checkout-idempotency.spec.ts" ]; then
  echo "  ✅ tests/supabase/checkout-idempotency.spec.ts"
fi
if [ -f "/workspace/DELIKREOL/tests/supabase/backend-hardening.spec.ts" ]; then
  echo "  ✅ tests/supabase/backend-hardening.spec.ts"
fi

# Résultat final
echo ""
echo "=== RÉSULTAT ==="
echo "Statut Stripe Sandbox : NON TESTÉ (stripe_disabled maintenu)"
echo "Blocage physique : STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET non configurés."
echo "Pas d'événement sandbox = pas d'activation Stripe."
echo "Pas d'activation Stripe = pas d'espace commercial ouvert."
echo "Action requise : configurer variables Supabase + exécuter sandbox + vérifier webhook."