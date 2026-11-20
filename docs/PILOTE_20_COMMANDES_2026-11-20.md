# DELIKREOL — Contrôle GO / 20 commandes pilotes (20 novembre 2026)

## Verdict
**NO-GO pour encaissement et livraison automatisés tant que les preuves ci-dessous ne sont pas réunies.** Un HTTP 200 ou des tests unitaires réussis ne constituent pas une commande réelle.

## Contrôles réellement effectués sur srv1741142
- Site public `https://delikreol.com/` : HTTP 200.
- Audit des routes et médias : 30 OK / 0 KO (contrôles HTTP et existence d'assets seulement).
- Audit catalogue : 12 produits contrôlés ; 0 image manquante ; qualité photo et description non validée sur 12 ; allergènes à confirmer sur 9.
- Tests Vitest Supabase exécutés depuis l'environnement Replica : 33 réussis / 33, couvrant les contrats d'idempotence, le durcissement backend et le service vendeurs. **Tests statiques/unitaires, pas preuve d'un paiement réel.**
- Build Vite : réussi, 78 routes SPA générées (mise à jour UX page traiteurs).
- Dernier push UX : `37460ce`, branche `main` ; publication de la version sur `delikreol.com` à confirmer indépendamment.

## Blocages avant GO
1. Vérifier configuration Supabase réelle (RLS, clés côté serveur, accès client et partenaire) sans afficher les secrets.
2. SumUp : le code de configuration indique actuellement un **lien manuel**, pas un checkout automatisé ; aucune preuve de webhook SumUp en production dans le dépôt inspecté. Ne pas afficher « paiement instantané » tant que le flux n'est pas validé.
3. Stripe : désactivé par défaut ; aucun basculement live sans accord explicite et test sandbox.
4. Confirmation du catalogue, horaires, capacités et allergènes par trois partenaires pilotes.
5. Livraison : feature flag `VITE_ENABLE_LIVE_DELIVERY` ; ne pas promettre de suivi temps réel sans service et preuve de notifications.
6. Établir le protocole de remboursement et de litige ; contrôler acceptation/refus, annulation et idempotence sur backend réel.

## Matrice de 20 commandes à exécuter avec preuves (NON exécutées)
Chaque ligne nécessite un ID de commande unique, horodatage, partenaire, canal, statut initial/final, trace backend, preuve de notification, et responsable de validation. Utiliser des données tests, aucun encaissement réel non autorisé.

| N° | Scénario | Résultat attendu |
|---|---|---|
| 01 | Client invité / retrait | Confirmation enregistrée une fois |
| 02 | Client connecté / retrait | Commande visible dans son espace |
| 03 | Livraison zone autorisée | Frais et créneau affichés avant validation |
| 04 | Livraison hors zone | Blocage clair, aucune commande silencieuse |
| 05 | Commande multi-produit même traiteur | Total recalculé serveur |
| 06 | Produits de traiteurs différents | Règle multi-vendeur explicite |
| 07 | Options de menu et suppléments | Choix présents dans commande partenaire |
| 08 | Produit indisponible | Refus avant paiement |
| 09 | Créneau fermé | Message et proposition de replanification |
| 10 | Acceptation par partenaire | Statut client mis à jour |
| 11 | Refus par partenaire | Annulation/remboursement selon état du paiement |
| 12 | Annulation client avant acceptation | Aucune double opération |
| 13 | Annulation après acceptation | Politique appliquée et journalisée |
| 14 | Retrait confirmé | Preuve de remise |
| 15 | Livraison confirmée | Preuve de remise et notification |
| 16 | Double clic sur validation | Une seule commande (idempotence) |
| 17 | Rejeu webhook paiement | Aucun double encaissement/statut |
| 18 | Webhook signature invalide | Rejet et log sans fuite de secret |
| 19 | Paiement échoué | Commande non marquée payée |
| 20 | Remboursement sandbox | Statut cohérent et trace comptable |

## GO seulement après
- 20/20 scénarios testés et documentés, dont échecs et reprises ; aucune régression bloquante.
- Trois partenaires pilotes confirment leurs données et peuvent accepter/refuser une commande.
- Paiement sandbox et notifications prouvés ; accord séparé pour basculer en production.
- Zones et prix de livraison validés, CGV et politique d'annulation conformes.
