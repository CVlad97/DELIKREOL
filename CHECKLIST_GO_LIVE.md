# DELIKREOL — CHECKLIST GO-LIVE

Date de révision : 22 août 2026

## Verdict

- **Pilote manuel assisté : possible sous réserve des tests utilisateur.**
- **Paiement Stripe live : NON autorisé.**
- **Paiement SumUp/API : NON intégré et non vérifié.**
- **Ouverture commerciale complète : NON validée tant que les tests et comptes live ne sont pas terminés.**

## Pré-requis vérifiés

- [x] Dépôt GitHub public et branche principale identifiés.
- [x] Build Vite et workflows GitHub présents.
- [x] CI et Playwright réussis sur le dernier commit de code.
- [x] Supabase Delikreol actif et sain côté disponibilité.
- [x] RLS activé sur les tables métier Delikreol principales.
- [x] RLS activé sur les six anciennes tables publiques sans usage identifié dans le flux commercial.
- [x] Vue `api.managed_wallets` passée en `security_invoker` et accès anonyme retiré.
- [x] Fonctions Stripe corrigées déployées : checkout v8, webhook v8, Connect v5, payout v5.
- [x] Flux pilote WhatsApp/paiement manuel documenté.
- [x] Parcours catalogue, panier, livraison et contact présents sur le site public.

## Bloquants P0

- [ ] Exécuter un test complet : catalogue → panier → commande → création de commande Supabase.
- [ ] Vérifier la réception de la commande côté équipe/partenaire.
- [ ] Vérifier les règles livraison, notamment le seuil de 40 €.
- [ ] Vérifier le suivi de commande avec un vrai token.
- [ ] Vérifier les coordonnées publiques et les e-mails de réception.
- [ ] Activer la protection Supabase contre les mots de passe compromis.
- [ ] Ne pas activer Stripe live avant les tests webhook, idempotence, remboursement, litige et réconciliation.
- [ ] Configurer le compte Stripe live, les clés live et le webhook live.
- [ ] Ne pas annoncer SumUp comme disponible tant qu'aucune intégration API/TPE n'est reliée et testée.
- [ ] Confirmer l'adresse e-mail professionnelle DELIKREOL sur Hostinger.
- [ ] Mettre en place sauvegarde, monitoring et procédure de retour arrière.

## Paiements actuels

| Moyen | État |
|---|---|
| WhatsApp + validation humaine | Pilote |
| Virement manuel | Pilote, si compte et coordonnées confirmés |
| Paiement à la remise | À confirmer avec le partenaire |
| Stripe Checkout | Corrigé côté serveur, désactivé côté lancement |
| Stripe Connect | Déployé en test, non validé en live |
| SumUp | Non intégré |
| Qonto API | Non configuré dans l'application |

## Tests utilisateur obligatoires

1. Client → commande.
2. Commande → notification/coordination.
3. Partenaire → confirmation.
4. Paiement manuel → preuve → validation admin.
5. Livraison/retrait → statut final.
6. Réouverture du lien de suivi.
7. Double-clic ou nouvelle tentative → aucune double commande.
8. Erreur réseau → message compréhensible et reprise possible.
9. Paiement Stripe test réussi.
10. Webhook Stripe test reçu et idempotent.
11. Remboursement et paiement refusé testés.

## Critère de décision

Le pilote peut être annoncé uniquement après réussite des tests 1 à 8 sur données de test et confirmation manuelle du canal de réception.

L'ouverture commerciale complète nécessite en plus la validation des tests Stripe 9 à 11, un compte Stripe live correctement configuré, l'e-mail professionnel confirmé, et une décision explicite sur SumUp.
