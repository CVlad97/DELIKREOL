# DELIKREOL — pilote livreurs et points relais indépendants

Statut : préparation pilote. Aucun partenaire n’est activé automatiquement.

## Objectif

Lancer les premières commandes avec un réseau limité :

- 2 à 3 livreurs indépendants vérifiés ;
- 1 à 2 points relais vérifiés ;
- des traiteurs pouvant aussi agir comme points relais adaptés ;
- factures brouillon préparées dans les tableaux de bord ;
- validation humaine avant activation, reversement ou transmission officielle.

## Recrutement livreur indépendant

Contrôles minimum avant statut `pret_pilote` :

- identité du représentant ;
- SIRET ou preuve d’activité en création ;
- assurance responsabilité civile professionnelle ou mobilité ;
- véhicule et zones acceptées ;
- WhatsApp vérifié ;
- acceptation du statut prestataire indépendant ;
- test de réception d’une mission fictive ;
- test de facture brouillon non transmise.

## Recrutement point relais

Contrôles minimum avant statut `pret_pilote` :

- adresse vérifiée ;
- capacité par créneau ;
- horaires de réception et retrait client ;
- compatibilité chaud/froid/surgelé ;
- procédure de remise avec code de retrait ;
- capacité à recevoir les livreurs ;
- si le relais est aussi traiteur : séparation claire entre rôle traiteur et rôle relais.

## Facturation électronique

Les tableaux de bord préparent des brouillons de facture. Ils ne transmettent pas de facture à une plateforme de dématérialisation partenaire.

Repères réglementaires à valider avec l’expert-comptable :

- 1er septembre 2026 : toutes les entreprises doivent pouvoir recevoir des factures électroniques ;
- 1er septembre 2027 : les PME/TPE/micro-entreprises doivent pouvoir émettre électroniquement.

Source officielle : https://www.economie.gouv.fr/tout-savoir-sur-la-facturation-electronique-pour-les-entreprises

## Première commande pilote

1. Vérifier que le traiteur est actif et disponible.
2. Vérifier que le client sait que la commande reste à confirmer sur WhatsApp.
3. Créer la commande via le checkout.
4. Confirmer qu’une mission `deliveries` existe si livraison ou point relais.
5. Préparer le message WhatsApp sans envoi automatique.
6. Affecter manuellement un livreur validé.
7. Marquer retrait, transit et livraison depuis l’espace livreur.
8. Vérifier le statut client.
9. Générer le brouillon de facture livreur/relais.
10. Valider manuellement avant tout paiement ou transmission comptable.

## Rollback

- Revert des commits applicatifs de la branche.
- Ne pas appliquer les migrations préparées si les tests Supabase locaux ne sont pas validés.
- Si une migration a été appliquée en environnement de test, conserver les colonnes ajoutées pour éviter toute perte de candidatures et désactiver les vues/routes applicatives par revert.
