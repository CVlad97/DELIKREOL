# DELIKREOL — Campaign Launch Kit

Date: 2026-07-06
Objectif: generer les premiers leads qualifies sans melanger les projets, sans mailing massif, et sans encaissement automatique non valide.

## Regle de lancement

1. Un prospect = une ligne dans `data/prospection/revenue-prospects-template.csv`.
2. Une offre = un message dedie.
3. Pas d'envoi massif tant que SPF, DKIM, DMARC et reception email ne sont pas valides.
4. Pas de paiement automatique tant que compte pro, mentions legales et webhooks Stripe ne sont pas confirmes.
5. Les commandes sont vendues par devis, confirmation WhatsApp et paiement manuel temporaire.

## Campagne 1 — Repas entreprise

Cible: entreprises, administrations, associations, organismes de formation, CE.

Canal prioritaire: WhatsApp ou email personnalise.

Volume initial: 10 contacts/jour pendant 3 jours.

Message WhatsApp:

Bonjour, je lance DELIKREOL, une solution locale pour organiser des repas creoles, plateaux repas et commandes groupe en Martinique.

Est-ce que vous avez parfois besoin de repas pour reunion, formation, equipe ou evenement interne ?

Je peux vous preparer une proposition simple selon le nombre de personnes, la commune, la date et le budget.

Email:

Objet: Repas groupe / plateaux repas en Martinique

Bonjour,

Je vous contacte pour vous proposer DELIKREOL, un service local de coordination de repas creoles, traiteurs et commandes groupe en Martinique.

Nous pouvons traiter des demandes pour reunions, formations, equipes, associations ou evenements, avec devis selon volume, commune, delai et composition.

Si vous avez un besoin prochainement, je peux vous envoyer une proposition simple.

Cordialement,
DELIKREOL

Qualification a noter:

- Nombre de personnes.
- Commune.
- Date / creneau.
- Budget indicatif.
- Contraintes alimentaires.
- Contact decisionnaire.

## Campagne 2 — Partenaires traiteurs

Cible: traiteurs, snacks, restaurants avec livraison/retrait, prestataires evenementiels.

Canal prioritaire: WhatsApp ou Instagram DM.

Volume initial: 5 partenaires/jour pendant 5 jours.

Message:

Bonjour, je travaille sur DELIKREOL, une vitrine locale pour aider les traiteurs et restaurateurs martiniquais a recevoir plus de demandes: commandes, devis entreprise, evenements et pages menu partageables.

Je cherche quelques partenaires pilotes. L'objectif est simple: vous donner une page visible, un bouton contact, et vous envoyer les demandes qualifiees.

Est-ce que je peux vous presenter le fonctionnement ?

Offre de lancement:

- Page vitrine pilote: 79 EUR.
- Carte menu digitale: 39 EUR.
- Pack visibilite traiteur: 49 EUR/mois pilote.
- Commission uniquement sur demande acceptee si le partenaire prefere commencer sans forfait.

## Campagne 3 — Carte menu digitale

Cible: snacks, petits restaurants, vendeurs qui utilisent deja WhatsApp/Facebook mais sans menu propre.

Canal prioritaire: Instagram DM / WhatsApp.

Message:

Bonjour, je peux vous creer une carte menu digitale simple a partager sur WhatsApp, Instagram et Facebook: produits, prix, horaires, commune et bouton de commande.

Le forfait lancement est a 39 EUR. Si vous voulez, je peux vous montrer un exemple sur DELIKREOL.

## Cadence de relance

| Moment | Action |
| --- | --- |
| J0 | Premier message personnalise |
| J2 | Relance courte avec une question simple |
| J5 | Derniere relance: proposer appel ou abandon |
| J10 | Classer: interesse, pas maintenant, refuse, sans reponse |

Relance courte:

Bonjour, je me permets de revenir vers vous. Est-ce que les repas groupe / demandes traiteur / menu digital peuvent vous interesser en ce moment ?

## Table de suivi

Statuts autorises:

- a_contacter
- contacte
- interesse
- devis_a_envoyer
- devis_envoye
- gagne
- perdu
- relance_plus_tard

Sources autorisees:

- whatsapp
- email
- instagram
- facebook
- appel
- site
- bouche_a_oreille

## Actions du jour

1. Remplir 20 lignes prospects.
2. Envoyer 10 messages entreprise.
3. Envoyer 5 messages partenaire.
4. Noter chaque reponse dans le CSV.
5. Ne lancer aucun paiement automatique.
6. Corriger les mentions legales quand les donnees entreprise sont confirmees.

