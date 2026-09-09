# ARCHITECTURE SUMUP — HOSTED CHECKOUT (MVP) — LOCAL SEUL — 2026-09-08
# Aucun secret inventé — aucun appel réel — adaptation locale uniquement

## PARCOURS HOSTED CHECKOUT (côté serveur requis)
1. Client (frontend) demande checkout → POST /create-checkout-session (Supabase Edge Function)
2. Serveur crée checkout SumUp via SUMUP_API_KEY (secret serveur uniquement — jamais dans VITE_)
3. Référence unique et idempotente (SUMUP-<orderId> via buildSumUpReference)
4. Serveur conserve : checkout_id + hosted_checkout_url
5. Redirection client vers hosted_checkout_url (HTTPS return_url)
6. Client retourne sur return_url (success / cancel)
7. Webhook SumUp reçoit événement (PAID / FAILED)
8. Webhook vérifie signature (SUMUP_WEBHOOK_SECRET) → met à jour commande

## ADAPTATIONS LOCALES PRÉSENTES / À CONFIRMER
- sumupService.ts : framework avec isSumUpEnabled(), createSumUpCheckout(), verifySumUpPayment(), handleSumUpWebhook()
- paymentProviders.ts : provider 'sumup' déclaré, status 'manual' si VITE_SUMUP_PUBLIC_KEY présent
- checkout-order/index.ts : no sumup dans BASE_PAYMENT_PROVIDERS (bloqué volontairement par test backend-hardening)
- sumupService.ts : pas d'appel réseau réel — TODO conservé

## POINTS NON MODIFIÉS (interdiction)
- Pas de modification du provider actif (sumup reste 'manual' / 'disabled')
- Pas d'invention de clé SUMUP_API_KEY ou SUMUP_WEBHOOK_SECRET
- Pas d'appel réel SumUp
- Pas de modification checkout-order/index.ts (test backend-hardening interdit 'add("sumup_')')

## NEXT STEP (si autorisation externe)
- Fournir SUMUP_API_KEY + SUMUP_WEBHOOK_SECRET dans Supabase secrets
- Créer fonction Supabase `sumup-webhook` (nouvelle, pas modification checkout-order)
- Tester avec sandbox/mocks uniquement
