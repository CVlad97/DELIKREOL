# DELIKREOL — Paiements, dispatch, facturation — statut GO live

Date: 2026-09-11

## Statut synthèse

- Site public: GO phase pilote publié.
- Stripe DELIKREOL.COM: compte plateforme actif pour encaisser, mais Connect partenaire non onboardé.
- Save Peyi’A SumUp: NOGO automatisation, aucun lien SumUp validé en base pour Snack Savè Peyi’A.
- Dispatch livreur: GO contrôle humain, NOGO 100% automatique tant que pool livreurs/relais n’a pas disponibilités temps réel.
- Facturation électronique: GO suivi/facture interne, NOGO e-facturation complète tant que PDP/OD ou export Factur-X/Chorus n’est pas choisi et données légales partenaires complètes.

## Décision opérationnelle

La mise en production sûre est une phase pilote: commande site, confirmation WhatsApp, paiement manuel ou Stripe plateforme validé, puis affectation livreur/relais par contrôle humain.

## Stripe

Le compte Stripe DELIKREOL.COM est exploitable côté plateforme quand les fonctions Edge Supabase sont déployées avec les secrets serveur. Le modèle cible recommandé est Stripe Connect marketplace avec comptes Express/recipient pour les partenaires, puis reversement après confirmation de préparation/livraison.

## SumUp Save Peyi’A

Ne pas utiliser le lien SumUp existant tant qu’il est rattaché à Saveurs d’Afrique. Le risque est un encaissement vers le mauvais partenaire.

## Dispatch

Le dispatch automatique doit s’appuyer sur: commande payée ou validée, commune/distance, capacité traiteur, mode retrait/livraison/relais, livreur disponible, point relais disponible, acceptation mission, horodatage, preuve de remise.

## Facturation électronique

La facturation complète doit séparer: reçu client, facture plateforme, relevé partenaire, commission DELIKREOL, frais livraison, reversements, avoirs/remboursements. Pour l’e-facturation française, prévoir PDP/OD ou génération structurée Factur-X/Chorus selon typologie B2B/B2C.

## Actions obligatoires avant full automatic

1. Créer/valider le compte Stripe Connect ou lien SumUp réel de Save Peyi’A.
2. Déployer/valider les Edge Functions Stripe avec secrets serveur.
3. Ajouter les livreurs/relais avec zones et créneaux.
4. Choisir le canal de facture électronique et compléter SIRET/RIB/TVA/mentions légales.
5. Faire une commande test payée en petit montant puis remboursée/annulée.
