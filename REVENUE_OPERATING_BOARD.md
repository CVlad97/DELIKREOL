# DELIKREOL — Revenue Operating Board

Date: 2026-07-06
Mode actuel: 4G, sans Shizuku actif
Site public: https://cvlad97.github.io/DELIKREOL/

## Objectif

Faire passer DELIKREOL d'un site pilote valide techniquement a un systeme qui genere des revenus mesurables, sans melanger les projets ni lancer des campagnes avant que les canaux de conversion soient fiables.

## Regles de separation

Chaque projet a son propre objectif, ses propres preuves et son propre canal de suivi.

| Projet | Objectif | Canal principal | Statut |
| --- | --- | --- | --- |
| DELIKREOL Food | Commandes locales, traiteurs, paniers, devis | Site + WhatsApp + email | Priorite 1 |
| DELIKREOL Entreprise | Plateaux repas, repas groupe, CE, associations | Formulaire + WhatsApp + devis | Priorite 1 |
| Partenaires Traiteurs | Recruter et activer 3 a 10 traiteurs | WhatsApp + appel + fiche partenaire | Priorite 1 |
| Banque / Entreprise | Compte pro, justificatifs, encaissement, facturation | Qonto / banque + documents legaux | Bloquant revenus propres |
| Email / Domaine | Envoyer sans spam et recevoir les demandes | Google Workspace / DNS / DMARC | Bloquant campagne mailing |
| Reseaux Sociaux | Generer trafic et leads locaux | Instagram, Facebook, WhatsApp | A lancer apres tracking |
| Backoffice Admin | Suivre vues, leads, commandes, partenaires | Admin DELIKREOL | Actif mais a renforcer |
| Projets Phase 2 | Ikabay, SOS Galere, sourcing, services annexes | A isoler hors DELIKREOL Food | Ne pas melanger maintenant |

## Sources marche observees

Les sites et offres qui marchent localement ou dans le meme modele montrent les patterns suivants:

| Reference | Signal utile | Application DELIKREOL |
| --- | --- | --- |
| https://www.c-trop-bon.com/ | Livraison 7j/7, paiement especes/virement/carte, commande WhatsApp, offres pro | Afficher minimum, zones, delais et bouton WhatsApp par partenaire |
| https://traiteurmartinique.com/plateaux-repas.html | B2B: Fort-de-France, Lamentin, Schoelcher, 8 a 100 personnes, devis gratuit | Lancer offre "Repas entreprise" avec formulaire court |
| https://www.pagesjaunes.fr/annuaire/departement/martinique-972/plateau-repas | Presence de traiteurs, buffets, receptions, repas d'affaires | Prospecter traiteurs visibles et proposer mini-page |
| https://www.chefti.fr/pourquoi-chefti/ | Livraison de repas faits maison en Martinique, bureau et domicile | Positionner DELIKREOL sur choix local + demandes groupe |
| https://qonto.com/fr/blog/qonto/compte-pro-vs-banques/documents-ouverture-compte-bancaire-pro | Banque pro: piece d'identite, domiciliation, justificatif d'immatriculation | Preparer dossier banque avant campagne payante |

## Priorites revenus 7 jours

### P0 — Encaisser proprement

1. Choisir le canal d'encaissement temporaire.
   - Option A: paiement a confirmation par virement / lien bancaire.
   - Option B: Stripe seulement si les cles et webhooks sont prets.
   - Option C: acompte manuel pour devis entreprise.

2. Verifier le statut legal.
   - SIREN/SIRET final.
   - Forme juridique.
   - Adresse de domiciliation.
   - Mentions legales a jour.
   - CGV/CGU avec responsabilites et conditions de confirmation.

3. Preparer compte pro.
   - Piece d'identite.
   - Justificatif domicile/domiciliation.
   - Justificatif immatriculation.
   - Statuts si societe.
   - Beneficiaires effectifs si applicable.

### P1 — Vendre maintenant sans attendre toute l'automatisation

1. Offre "Repas entreprise".
   - Cible: entreprises, administrations, associations, formations, CE.
   - Promesse: repas groupe en Martinique, devis rapide, livraison/retrait.
   - Prix: sur devis selon volume, zone, delai, composition.
   - Action: envoyer 20 messages qualifies.

2. Offre "Traiteur evenementiel".
   - Cible: anniversaires, evenements familiaux, entreprises.
   - Promesse: mise en relation avec traiteurs locaux pilotes.
   - Prix: commission sur devis accepte.
   - Action: creer un script WhatsApp et email.

3. Offre "Mini-page partenaire".
   - Cible: traiteurs sans site clair.
   - Promesse: page vitrine + bouton commande + partage WhatsApp.
   - Prix: pilote gratuit ou forfait lancement.
   - Action: proposer a 5 partenaires.

### P2 — Campagnes sans bruler le domaine

Ne pas lancer de mailing massif tant que SPF, DKIM, DMARC et test anti-spam ne sont pas valides.

Ordre:
1. Tester reception/envoi de l'email principal.
2. Valider SPF/DKIM/DMARC.
3. Envoyer 10 emails manuels personnalises.
4. Mesurer reponses.
5. Monter a 30 par jour seulement si taux de reponse correct et pas de spam.

## Scripts commerciaux prets

### WhatsApp entreprise

Bonjour, je lance DELIKREOL, une solution locale pour organiser des repas creoles, plateaux repas et commandes groupe en Martinique.

Est-ce que vous avez parfois besoin de repas pour reunion, formation, equipe ou evenement interne ?

Je peux vous preparer une proposition simple selon le nombre de personnes, la commune, la date et le budget.

### Email entreprise

Objet: Repas groupe / plateaux repas en Martinique

Bonjour,

Je vous contacte pour vous proposer DELIKREOL, un service local de coordination de repas creoles, traiteurs et commandes groupe en Martinique.

Nous pouvons traiter des demandes pour reunions, formations, equipes, associations ou evenements, avec devis selon volume, commune, delai et composition.

Si vous avez un besoin prochainement, je peux vous envoyer une proposition simple.

Cordialement,
DELIKREOL

### WhatsApp partenaire traiteur

Bonjour, je travaille sur DELIKREOL, une vitrine locale pour aider les traiteurs et restaurateurs martiniquais a recevoir plus de demandes: commandes, devis entreprise, evenements et pages menu partageables.

Je cherche quelques partenaires pilotes. L'objectif est simple: vous donner une page visible, un bouton contact, et vous envoyer les demandes qualifiees.

Est-ce que je peux vous presenter le fonctionnement ?

## Checklist conformite minimale avant revenus publics

- [ ] Mentions legales sans placeholders.
- [ ] SIREN/SIRET ou statut "en cours d'immatriculation" explicite.
- [ ] Email public fonctionnel.
- [ ] Politique de confidentialite coherente avec les donnees collectees.
- [ ] CGV: commande confirmee seulement apres validation partenaire.
- [ ] Prix "a confirmer" non encaisses automatiquement.
- [ ] Donnees partenaires sensibles non exposees publiquement.
- [ ] Canal de remboursement / annulation defini.

## Checklist technique validee le 2026-07-06

- [x] Site public accessible.
- [x] Bundle public servi: assets/index-4uaIu7Jy.js.
- [x] Routes SPA principales servies.
- [x] Audit routes: 25 OK / 0 KO.
- [x] Audit liens: 22/22 OK.
- [x] Typecheck OK.
- [x] Lint OK.
- [x] Tests OK.
- [x] Build OK.
- [x] Chrome Android ouvre le site.
- [x] Mode 4G confirme.
- [ ] Shizuku actif: bloque sans Wi-Fi/ADB/root.

## Blocages

| Blocage | Impact | Action |
| --- | --- | --- |
| Shizuku non demarre | Pas de verification foreground systeme ni UI automation fiable | Attendre Wi-Fi ou USB/ADB |
| Email domaine non revalide aujourd'hui | Pas de campagne mailing a volume | Tester DNS et Mail-Tester |
| Statut legal / banque a confirmer | Encaissement et facturation limites | Finaliser dossier banque |
| Stripe webhooks a confirmer | Paiement automatique risque si webhook absent | Vendre d'abord par devis/confirmation |

## Travail immediat recommande

1. Finaliser la page admin "Offres cash" avec prix de lancement.
2. Creer un fichier de prospection CSV: entreprises, traiteurs, associations.
3. Envoyer 10 messages WhatsApp qualifies.
4. Verifier l'email domaine avant tout envoi massif.
5. Mettre a jour les mentions legales avec le statut reel.
6. Isoler les autres projets dans des dossiers ou boards separes.
