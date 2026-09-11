# DELIKREOL — demandes actives consolidées

Date : 2026-09-11

## Validé par Vladimir

- Rendu logo/header premium validé visuellement.
- Réintégration des photos traiteurs demandée avec chemins vérifiés et pas de texte au hasard.
- Chaque message utilisateur doit être conservé comme demande importante.

## Corrections demandées en priorité

- Logo centré, mis en valeur, avec badge « À la carte ».
- Libellé géolocalisé : DeliKreol Martinique par défaut, puis Guadeloupe, Guyane, Saint-Martin, Dominique selon position.
- Photos traiteurs bankables réintégrées : hero, portrait, galerie, établissement quand disponible.
- Composition produit obligatoire quand le plat le demande : accompagnements, boissons, sauces, consigne cuisine.
- Cases à cocher client visibles avant ajout panier.
- Les choix doivent rester dans le panier, la commande, l'admin, l'espace partenaire et le message WhatsApp.
- Ne pas appliquer de composition absurde aux boissons, desserts, glaces, cocktails et jus.

## Règles de composition publiées

Plats :
- 1 accompagnement obligatoire : Riz blanc, Riz lentilles, Légumes pays, Frites, Crudités.
- 1 boisson obligatoire : Eau, Jus local du jour, Soda, Sans boisson.
- 1 sauce obligatoire : Sauce chien, Sauce créole, Sauce piment à part, Sans sauce.
- Consigne cuisine optionnelle.

Pâtes / bowl :
- 1 accompagnement obligatoire : Crudités, Légumes pays, Sans accompagnement.
- 1 boisson obligatoire.
- 1 sauce obligatoire.
- Consigne cuisine optionnelle.

Snacking salé / apéritifs :
- 1 accompagnement obligatoire : Frites, Crudités, Sans accompagnement.
- 1 boisson obligatoire.
- 1 sauce obligatoire.
- Consigne cuisine optionnelle.

Boissons / desserts / glaces / cocktails / jus :
- Pas de composition forcée.

## NOGO réels restant à ne pas masquer

- SumUp Save Peyi'A : lien partenaire réel non fourni/non connecté.
- Stripe Connect partenaires : onboarding partenaire non terminé.
- Dispatch livreur 100 % automatique : nécessite livreurs disponibles, acceptation/refus mission, preuve retrait/remise et règles litige.
- Facturation électronique complète : nécessite SIRET, régime TVA, numérotation, avoirs, canal PDP/OD/Factur-X/Chorus selon usage.
- Déploiement Supabase Edge Function : nécessite `SUPABASE_ACCESS_TOKEN` côté VPS ou secret CI sécurisé.

## Règle de communication

Ne jamais annoncer un GO global sans bug détecté si un NOGO externe demeure. Annoncer plutôt : GO pilote publié + NOGO externes listés.
