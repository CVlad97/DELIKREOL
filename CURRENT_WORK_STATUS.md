# DeliKreol — statut de travail actuel

## Audit et corrections du 22 août 2026

Le site public `delikreol.com` est accessible. Le dépôt GitHub principal est `CVlad97/DELIKREOL`, branche `main`.

La branche de correction `fix/delikreol-go-live-20260822` prépare les changements sans modifier `main`. La PR #55 reste ouverte en brouillon.

## État du lancement

- Pilote manuel assisté : possible après tests utilisateur.
- Stripe live : désactivé ; le compte connecté est uniquement en mode test.
- SumUp : non intégré.
- Paiement et coordination : WhatsApp / validation humaine pendant le pilote.
- Livraison éloignée : possible à partir de 40 €, selon validation et disponibilité.

## Corrections vérifiées

- CI GitHub et tests Playwright : réussis sur le dernier commit de code.
- Fonctions Stripe Supabase déployées et actives : `create-checkout-session` v8, `stripe-webhook` v8, `stripe-connect-onboard` v5, `stripe-payout` v5.
- API Stripe des fonctions : `2026-07-29.dahlia`.
- RLS activé sur les six anciennes tables publiques non utilisées par le flux commercial actuel.
- Accès anonyme retiré de la vue `api.managed_wallets`, avec mode `security_invoker`.

## Points restant obligatoires avant ouverture commerciale complète

1. Exécuter une commande de test complète : catalogue → panier → commande → paiement test → webhook → suivi.
2. Vérifier la réception côté équipe et partenaire.
3. Vérifier remboursement, paiement refusé, double soumission et litige en mode test.
4. Configurer un compte Stripe live et ses secrets uniquement après validation des tests.
5. Activer la protection Supabase contre les mots de passe compromis.
6. Confirmer une boîte e-mail DELIKREOL sur Hostinger.
7. Intégrer SumUp ou retirer toute mention de paiement SumUp.
8. Mettre en place sauvegarde, journalisation et procédure de retour arrière.

## Limites d'accès actuelles

- L'accès Hostinger Mail disponible pointe vers `contactcvs@ikabay.store`, pas vers une boîte DELIKREOL confirmée.
- Aucun accès de gestion VPS/domaine Hostinger ni connecteur SumUp n'est disponible dans la session actuelle.
