# DELIKREOL — CHECKLIST GO-LIVE

Date de révision : 22 août 2026

## Verdict

- **Pilote manuel assisté : possible sous réserve des tests utilisateur.**
- **Paiement Stripe live : NON autorisé.**
- **Paiement SumUp/API : NON intégré et non vérifié.**
- **Ouverture publique automatisée : NON validée.**

## Pré-requis vérifiés

- [x] Dépôt GitHub public et branche principale identifiés.
- [x] Build Vite et workflow GitHub Pages présents.
- [x] Supabase Delikreol actif et sain côté disponibilité.
- [x] RLS activé sur les tables métier Delikreol principales.
- [x] Flux pilote WhatsApp/paiement manuel documenté.
- [x] Parcours catalogue, panier, livraison et contact présents sur le site public.

## Bloquants P0

- [ ] Exécuter un test complet : catalogue → panier → commande → création de commande Supabase.
- [ ] Vérifier la réception de la commande côté équipe/partenaire.
- [ ] Vérifier les règles livraison, notamment le seuil de 40 €.
- [ ] Vérifier le suivi de commande avec un vrai token.
- [ ] Vérifier les coordonnées publiques et les e-mails de réception.
- [ ] Corriger ou isoler les six tables publiques sans RLS signalées par Supabase : `wallets`, `trips`, `shipments`, `matches`, `projects`, `investments`.
- [ ] Ne pas activer Stripe live avant les tests webhook, idempotence, remboursement, litige et réconciliation.
- [ ] Ne pas annoncer SumUp comme disponible tant qu'aucune intégration API/TPE n'est reliée et testée.

## Paiements actuels

| Moyen | État |
|---|---|
| WhatsApp + validation humaine | Pilote |
| Virement manuel | Pilote, si compte et coordonnées confirmés |
| Paiement à la remise | À confirmer avec le partenaire |
| Stripe Checkout | Présent dans le code, désactivé pour le pilote |
| Stripe Connect | Code présent, non validé en production |
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

## Critère de décision

Le pilote peut être annoncé uniquement après réussite des tests 1 à 7 sur données de test et confirmation manuelle du canal de réception.

Le go-live automatisé reste bloqué tant que Stripe live, SumUp, la réconciliation financière et les tables publiques non classifiées ne sont pas validés.
