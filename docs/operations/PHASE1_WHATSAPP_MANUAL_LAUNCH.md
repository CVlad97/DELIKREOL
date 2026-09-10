# DELIKREOL — Phase 1 : lancement commercial manuel WhatsApp

Date de cadrage : 2026-09-10
Statut : GO soft launch manuel, NO-GO paiement public automatisé

## Objectif

Lancer DELIKREOL en mode commercial contrôlé : le site prépare la commande, WhatsApp confirme la commande, et l'opérateur valide manuellement avec le partenaire.

## Règles non négociables Phase 1

- Canal central : WhatsApp DELIKREOL `+596 696 65 35 89`.
- Aucune promesse de délai fixe.
- Retrait, livraison et créneau toujours à confirmer avec le partenaire.
- Une commande = un seul partenaire pour le lancement.
- Pas de Stripe public.
- Pas de SumUp automatisé.
- Pas de déclenchement automatique livreur.
- Toute commande test doit contenir : `TEST DELIKREOL — NE PAS PRÉPARER — COMMANDE À ANNULER`.

## Traiteurs retenus Phase 1

1. Snack Savè Peyi'A — Rivière-Pilote / Pont de Fer — `+596 696 00 27 64`
2. Coco's Food — Marché de Rivière-Pilote — `+596 696 25 47 20`
3. Saveurs d'Afrique — Cluny, Rivière-Salée — `0596 68 12 25`
4. Les Délices de Ninice — Dillon, Fort-de-France — `+596 696 01 93 21`
5. Sweet Family Traiteur Orianne — Hauts de Dillon, Fort-de-France — `+596 696 88 75 28`
6. Gouté Mwen — `+596 696 16 61 93` — zone à confirmer avant campagne large

## An Tjè Coco

Application concernée : DELIKREOL.
Fiche cible : `/traiteur/an-tje-coco`.
Statut Phase 1 : ne pas pousser dans la campagne commerciale tant que les produits ne sont pas vendables.
Actions Phase 2 : photos, prix, validation produits, publication contrôlée.

## Catalogue commercial initial

Utiliser uniquement les produits : `verified`, `is_public=true`, `is_available=true`, `is_demo=false`.

Priorité campagne :

- Snack Savè Peyi'A : entrecôte, côte de porc, riz crevettes, cocktails.
- Coco's Food : plats du jour, poulet rôti, box grillé, poisson/avocat.
- Saveurs d'Afrique : bissap, dokôr, atassi, gombo, ablo, foutou.
- Les Délices de Ninice : bara, moksi aleisi, bami, colombo.
- Sweet Family : apéritifs, bao buns, land food, wraps.
- Gouté Mwen : glaces artisanales à 2 €.

## Script opérateur — réception commande

Bonjour 👋 Merci pour votre commande DELIKREOL.

Nous vérifions la disponibilité avec le partenaire. Votre commande n'est pas encore confirmée tant que nous n'avons pas validé :

- le plat,
- les accompagnements,
- le créneau,
- le retrait ou la livraison,
- le mode de paiement manuel.

On revient vers vous rapidement sur WhatsApp.

## Script partenaire — validation

Bonjour 👋 Commande DELIKREOL à confirmer.

Merci de valider :

- disponibilité du ou des plats,
- accompagnements demandés,
- prix final,
- retrait ou livraison possible,
- créneau disponible.

Répondez : `OK`, `MODIFIER`, ou `REFUSER`.

## Script annulation test

Bonjour 👋 Test DELIKREOL terminé.

Merci de ne pas préparer cette commande. Elle est annulée, non facturée et servait uniquement à vérifier :

- la réception WhatsApp,
- la lisibilité du plat,
- les accompagnements,
- le numéro de commande,
- le parcours d'annulation.

Merci 🙏

## Test prioritaire Phase 1

1. Aller sur `https://delikreol.com`.
2. Choisir Snack Savè Peyi'A.
3. Ajouter une entrecôte.
4. Choisir 2 accompagnements : par exemple Riz + Lentilles ou Frites + Crudités.
5. Saisir un téléphone Martinique valide.
6. Ajouter la note : `TEST DELIKREOL — NE PAS PRÉPARER — COMMANDE À ANNULER`.
7. Ouvrir WhatsApp.
8. Vérifier que le message contient : commande, plat, accompagnements, total, commune, téléphone, confirmation partenaire.
9. Envoyer l'annulation test.

## Traçabilité manuelle minimale

Tenir un tableau simple avec :

- date/heure,
- numéro de commande,
- client,
- téléphone,
- partenaire,
- produit,
- total,
- statut : test / reçu / confirmé / modifié / annulé / refusé,
- commentaire.

## Critères GO campagne locale

- 3 commandes test WhatsApp réussies.
- 1 annulation test réussie.
- 5 partenaires joignables confirmés.
- Catalogue sans promesse de délai fixe.
- Aucun paiement public actif.
- Message de confirmation clair : commande préparée, non confirmée.

## Phase 2 sous 48 h

- Nettoyer les produits faibles ou incohérents.
- Intégrer An Tjè Coco avec photos et produits vendables.
- Finaliser Google Auth.
- Corriger les warnings Supabase prioritaires.
- Exécuter un test réel annulable avec capture/preuve.

## Phase 3 réservée

- Stripe/SumUp automatisés.
- Facturation électronique.
- Logistique livreurs.
- Points relais automatiques.
- Rapprochement financier avancé.
