# DELIKREOL — Financements et aides Antilles–Guyane

Version : 8 septembre 2026

> **Important :** l'accès Web live n'était pas disponible pendant cette préparation. Les organismes ci-dessous sont des familles de guichets à vérifier sur leurs sites officiels avant tout dépôt. Aucun appel à projets, date limite, taux d'aide ou éligibilité n'est présenté comme actuellement ouvert ou acquis.

## 1. Objectif de financement

Phase 1 : sécuriser le lancement commercial en Martinique sans financer prématurément une infrastructure lourde.

Budget de travail : **16 000 EUR**.

| Poste | Budget cible |
|---|---:|
| Finalisation app/PWA + QA mobile | 3 000 EUR |
| Juridique / conformité / contrats | 1 500 EUR |
| Marketing lancement | 2 500 EUR |
| Équipement livraison pilote | 1 800 EUR |
| Kits points relais / terrain | 1 500 EUR |
| Trésorerie / BFR | 4 000 EUR |
| Marge de sécurité | 1 700 EUR |
| **Total** | **16 000 EUR** |

Les hubs/dark-kitchens sont exclus de cette première enveloppe. Ils doivent faire l'objet d'un budget et d'une étude séparés après preuve de traction.

## 2. Familles de guichets à vérifier — Martinique

### Collectivité Territoriale de Martinique

À rechercher sur les portails officiels :

- aides à la création / développement d'entreprise ;
- numérique / transformation digitale ;
- innovation ;
- économie sociale ou territoriale si applicable ;
- investissements productifs ;
- emploi / formation selon les dispositifs actifs.

### FEDER-FSE+ Martinique 2021–2027

Axes potentiellement pertinents à vérifier :

- compétitivité des TPE/PME ;
- transformation numérique ;
- innovation ;
- transition écologique ;
- emploi / compétences.

Le dossier doit démontrer l'adéquation exacte entre la dépense et l'appel ou la fiche action active.

### ADEME Martinique

À étudier uniquement si DELIKREOL peut quantifier un volet environnemental réel, par exemple :

- mutualisation logistique ;
- réduction des emballages à usage unique ;
- anti-gaspillage ;
- mobilité plus sobre ;
- économie circulaire.

### France Travail

À vérifier selon la situation individuelle du porteur et la forme juridique retenue : dispositifs de création/reprise, maintien ou capitalisation de droits, accompagnement.

### ADIE

À vérifier pour :

- microcrédit professionnel ;
- accompagnement à la création ;
- financement de petits équipements ou BFR selon conditions.

### Réseaux d'accompagnement / financement

À vérifier localement :

- Initiative France / plateforme locale ;
- France Active / opérateur local ;
- chambres consulaires ;
- incubateurs / accélérateurs ;
- Bpifrance via dispositifs accessibles localement.

## 3. Extension Guadeloupe

Avant dépôt en Guadeloupe, créer un budget d'implantation séparé et rechercher sur les sources officielles :

- Région Guadeloupe ;
- FEDER-FSE+ Guadeloupe 2021–2027 ;
- ADEME Guadeloupe ;
- réseaux d'accompagnement locaux ;
- aides numériques / TPE / innovation actives.

Condition interne recommandée : ne pas financer l'extension avant trois mois de traction stable et économie unitaire maîtrisée en Martinique.

## 4. Extension Guyane

À vérifier sur les sources officielles :

- Collectivité Territoriale de Guyane ;
- FEDER-FSE+ Guyane 2021–2027 ;
- ADEME Guyane ;
- réseaux d'accompagnement locaux ;
- dispositifs numériques, TPE/PME, innovation et emploi actifs.

## 5. Dossier standard DELIKREOL à maintenir prêt

Un dossier maître doit être conservé à jour pour réutiliser les mêmes éléments d'un portail à l'autre :

1. résumé exécutif 1 page ;
2. business plan complet ;
3. prévisionnel 36 mois ;
4. plan de financement initial ;
5. plan de trésorerie ;
6. présentation du porteur ;
7. CV ;
8. statut / extrait d'immatriculation lorsqu'ils existent ;
9. RIB professionnel ;
10. justificatif de domiciliation ;
11. attestations fiscales/sociales si demandées ;
12. devis correspondant à chaque dépense financée ;
13. preuves du produit : site, captures, audit, catalogue ;
14. preuves de traction : partenaires, lettres d'intention, commandes pilotes ;
15. indicateurs emploi / numérique / environnement ;
16. calendrier du projet ;
17. risques et mesures de maîtrise.

## 6. Preuves à renforcer pour maximiser la finançabilité

- lettres d'intention de partenaires ;
- pré-inscriptions ou dossiers complets de livreurs ;
- trois pilotes B2B ;
- données réelles de panier moyen et commandes ;
- devis pour développement, équipements, marketing et conformité ;
- budget de trésorerie ;
- métriques de délai et qualité ;
- indicateurs d'impact territorial.

## 7. Module Financements dans le back-office DELIKREOL

### Tables proposées

`funding_programs`

- id ;
- organisme ;
- territoire ;
- nom_dispositif ;
- axe ;
- url_officielle ;
- date_ouverture ;
- date_cloture ;
- montant_min ;
- montant_max ;
- taux_aide ;
- criteres ;
- statut_verification ;
- verified_at.

`funding_applications`

- programme_id ;
- montant_demande ;
- statut ;
- deadline ;
- prochaine_action ;
- responsable ;
- submitted_at ;
- decision_at.

`funding_documents`

- application_id ;
- type_document ;
- fichier ;
- version ;
- date_expiration ;
- statut.

`funding_metrics`

- période ;
- emplois ;
- partenaires_actifs ;
- livreurs_actifs ;
- commandes ;
- GMV ;
- communes_couvertes ;
- indicateurs_environnementaux.

## 8. Automatisation raisonnable

Le back-office peut :

- stocker les dispositifs vérifiés ;
- alerter à J-30 / J-15 / J-7 ;
- générer une checklist de pièces ;
- versionner les documents ;
- produire les indicateurs ;
- préparer un dossier exportable ;
- tracer les dépôts et relances.

Il ne faut pas promettre un dépôt automatique universel. Certains portails imposent authentification forte, saisie humaine, attestations ou signature du représentant légal.

## 9. Règle de vérification avant chaque dépôt

Pour chaque aide :

1. ouvrir la page officielle ;
2. vérifier qu'elle est encore active ;
3. relever la date de clôture ;
4. vérifier le territoire et la taille d'entreprise éligibles ;
5. vérifier les dépenses éligibles ;
6. vérifier le taux et les plafonds ;
7. contrôler les règles de cumul ;
8. vérifier si les dépenses doivent être engagées seulement après dépôt ;
9. collecter les pièces exactes ;
10. enregistrer la source et la date de vérification dans `funding_programs`.

## 10. Priorité recommandée

La première vague de financement doit soutenir le **pilote opérationnel et commercial Martinique**. Les extensions Guadeloupe et Guyane doivent ensuite faire l'objet de dossiers territoriaux distincts, avec preuves de traction et budgets locaux.