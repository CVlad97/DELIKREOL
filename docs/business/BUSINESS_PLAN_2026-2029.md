# DELIKREOL — Business plan 2026–2029

Version : 8 septembre 2026  
Porteur : Vladimir Claveau  
Territoire pilote : Martinique

> Ce document distingue les faits vérifiés dans le dépôt, les informations déclarées par le porteur et les hypothèses de prévisionnel. Les guichets de subvention, dates limites, taux et critères doivent être revalidés sur les sources officielles au jour du dépôt.

## 1. Résumé exécutif

DELIKREOL est une marketplace logistique locale qui coordonne plats créoles, traiteurs, points relais et livraison en Martinique. Le produit est déjà structuré autour de plusieurs rôles : client, partenaire, livreur, point relais et administrateur. Le backend principal est Supabase.

Le modèle économique repose sur :

- commission marketplace sur les ventes ;
- marge logistique sur les livraisons ;
- repas entreprises et commandes groupe ;
- événementiel et coordination de devis ;
- services partenaires à développer après validation du pilote.

La stratégie recommandée est de conserver Supabase comme source de vérité unique. Une migration globale vers Firebase n’est pas justifiée à ce stade. Pour les livreurs, la meilleure option est une interface PWA installable dans la même codebase, avec permissions par rôle, avant d’envisager un wrapper natif.

## 2. Vision

DELIKREOL vise à créer un écosystème numérique et logistique hyper-local reliant :

- clients ;
- traiteurs/restaurants ;
- producteurs et commerces de proximité ;
- livreurs indépendants ;
- points relais ;
- administrateur/coordonateur.

L’ambition long terme inclut des hubs/dark-kitchens mutualisés, l’anti-gaspillage, des emballages plus sobres et une extension progressive vers la Guadeloupe et la Guyane.

## 3. État du produit

Le dépôt `CVlad97/DELIKREOL` documente déjà :

- React 18 + TypeScript + Vite ;
- Supabase pour base, auth et Edge Functions ;
- catalogue et panier ;
- candidature partenaires ;
- candidature livreurs ;
- points relais ;
- dashboard administrateur ;
- suivi de commande ;
- travaux sur géolocalisation, qualité livraison et catalogues partenaires.

Un audit interne du catalogue a identifié 86 produits statiques à la date de l’audit.

## 4. Offre commerciale

### Clients particuliers

- commande web/mobile ;
- livraison à domicile ;
- retrait chez le partenaire ;
- point relais ;
- suivi de statut ;
- assistance WhatsApp.

### Entreprises et groupes

Le projet prévoit une offre de repas entreprise, plateaux repas, réunions, formations, associations et événements. Cette ligne est stratégique car elle augmente le panier moyen et la marge de coordination.

### Partenaires vendeurs

- visibilité digitale ;
- mini-page partageable ;
- gestion catalogue/commandes ;
- accès à des demandes B2C et B2B ;
- commission de plateforme modérée.

### Livreurs

Le document interne de cadre légal recommande des prestataires indépendants avec :

- liberté d’accepter/refuser chaque mission ;
- absence d’exclusivité ;
- absence d’horaires imposés ;
- paiement à la mission sur facture ;
- SIRET et assurances adaptés.

## 5. Modèle économique

Le scénario de base retient :

- panier moyen de travail : 25 EUR ;
- commission marketplace : 15 % ;
- 75 % des commandes livrées ;
- barème pilote livraison 0–5 / 5–8 / 8–12 km ;
- aucune recette B2B ou service partenaire forcée dans le scénario de base.

Les revenus B2B, événementiels et services partenaires sont donc considérés comme levier d’équilibre, pas comme chiffre d’affaires acquis.

## 6. Réseau livreurs — architecture recommandée

Créer une PWA livreur dans la même application :

1. onboarding et conformité documentaire ;
2. statut En ligne / Hors ligne ;
3. missions proches avec rémunération affichée ;
4. acceptation/refus ;
5. navigation et confirmation retrait ;
6. livraison avec code/QR/preuve selon choix ;
7. historique des gains ;
8. facture et statut de paiement ;
9. qualité, incidents et conformité.

### Données Supabase à consolider

- `drivers` ;
- `driver_documents` ;
- `driver_availability` ;
- `driver_locations` ;
- `delivery_missions` ;
- `mission_events` ;
- `driver_payouts` ;
- `quality_scores`.

## 7. Architecture technique

Décision recommandée : **Supabase reste le backend central**.

- Frontend : React/Vite + PWA ;
- Backend : Supabase/PostgreSQL/Auth/RLS/Edge Functions/Realtime ;
- Géolocalisation : Supabase/PostGIS + cartographie existante ;
- Notifications : Web Push/in-app ; FCM seulement si un besoin mobile le justifie ;
- Mobile natif : wrapper type Capacitor après validation du pilote ;
- Paiements : activer uniquement les providers validés en production ;
- Automatisation : Edge Functions + workflows VPS/Hermes.

## 8. Stratégie commerciale

### 0–90 jours

- activer 5 à 10 partenaires réellement commandables ;
- activer 10 à 15 livreurs conformes ;
- limiter le lancement à quelques zones pilotables ;
- mesurer 5 puis 10 commandes/jour ;
- obtenir 3 pilotes B2B ;
- documenter panier moyen, délais, incidents, CAC et réachat.

### 6–12 mois

- viser 25 commandes/jour ;
- améliorer la rétention ;
- tester les points relais ;
- structurer les revenus entreprises/événementiels ;
- préparer une Phase 2 hubs/dark-kitchen uniquement si la traction le justifie.

## 9. Impact territorial

Axes à documenter pour les financeurs :

- transformation numérique de petits acteurs ;
- valorisation de l’économie locale ;
- création d’activité et d’emploi ;
- mutualisation logistique ;
- anti-gaspillage et emballages plus sobres ;
- couverture progressive du territoire.

Indicateurs proposés : partenaires actifs, GMV local, commandes, livreurs actifs, revenu moyen par mission, km/commande, temps moyen, déchets évités, communes couvertes.

## 10. Prévisionnel central

Le prévisionnel détaillé est maintenu dans le fichier Excel associé. Il démarre en septembre 2026.

| Indicateur | Année 1 | Année 2 | Année 3 |
|---|---:|---:|---:|
| Commandes | 5 330 | 10 452 | 16 172 |
| GMV produits | 133 250 EUR | 261 300 EUR | 404 300 EUR |
| CA plateforme cœur | 23 285 EUR | 45 662 EUR | 70 651 EUR |
| EBITDA simplifié avant diversification | -8 538 EUR | -6 027 EUR | -872 EUR |

Le modèle central atteint 25 commandes/jour en fin d’Année 1.

### Seuils

- seuil lean hors rémunération dirigeant : ~16,7 commandes/jour ;
- seuil avec 1 500 EUR/mois de rémunération dirigeant : ~33,5 commandes/jour ;
- à 25 commandes/jour : ~758 EUR/mois de marge additionnelle sont nécessaires avec les hypothèses retenues.

Cette marge additionnelle peut venir du B2B, de l’événementiel, de services partenaires ou d’un ajustement tarifaire mesuré.

## 11. Besoin de financement Phase 1

Budget de travail à remplacer par devis avant dépôt :

| Poste | Budget cible |
|---|---:|
| Finalisation app/PWA + QA mobile | 3 000 EUR |
| Juridique / conformité / contrats | 1 500 EUR |
| Marketing lancement | 2 500 EUR |
| Équipement livraison pilote | 1 800 EUR |
| Kits points relais / terrain | 1 500 EUR |
| Trésorerie / BFR | 4 000 EUR |
| Marge de sécurité | 1 700 EUR |
| **Total Phase 1** | **16 000 EUR** |

Les hubs/dark-kitchens ne sont pas inclus dans cette Phase 1.

## 12. Stratégie de financement

Familles de financeurs à vérifier au jour du dépôt :

- CTM / dispositifs économiques Martinique ;
- FEDER-FSE+ Martinique 2021–2027 ;
- ADEME Martinique si le volet économie circulaire/mobilité est suffisamment documenté ;
- France Travail selon la situation individuelle du porteur ;
- ADIE pour microcrédit/accompagnement ;
- réseaux Initiative / France Active, sous réserve de présence et dispositifs locaux ;
- Région/FEDER Guadeloupe en phase d’extension ;
- CTG/FEDER Guyane en phase d’extension.

Aucun de ces guichets n’est présenté ici comme actuellement ouvert sans revalidation officielle.

## 13. Module admin Financements

À ajouter au back-office :

- `funding_programs` : organisme, territoire, axe, lien, dates, critères ;
- `funding_applications` : montant, statut, échéance, prochaine action ;
- `funding_documents` : pièces, versions, dates d’expiration ;
- `funding_metrics` : indicateurs impact/emploi/numérique ;
- alertes 30/15/7 jours ;
- export du dossier standardisé.

Le site peut préparer et suivre les dossiers, mais il ne faut pas promettre un dépôt automatique sur des portails qui exigent authentification, attestations ou signature.

## 14. Extension Guadeloupe / Guyane

Avant ouverture d’un nouveau territoire :

- 3 mois de traction stable en Martinique ;
- économie unitaire positive ;
- partenaires et livreurs locaux identifiés ;
- support/qualité reproductible ;
- budget d’implantation séparé ;
- guichets locaux vérifiés ;
- architecture multi-territoire prête dans Supabase.

## 15. Sources internes principales

- README : https://github.com/CVlad97/DELIKREOL/blob/main/README.md
- Concept Partenaires : https://github.com/CVlad97/DELIKREOL/blob/main/docs/concept-partners.md
- Cadre légal livreurs : https://github.com/CVlad97/DELIKREOL/blob/main/docs/LIVREURS_CADRE_LEGAL.md
- Plan stratégique : https://github.com/CVlad97/DELIKREOL/blob/main/docs/PLAN_STRATEGIQUE_COMPLET.md
- Revenue Operating Board : https://github.com/CVlad97/DELIKREOL/blob/main/REVENUE_OPERATING_BOARD.md
- Audit UberEats vs DELIKREOL : https://github.com/CVlad97/DELIKREOL/blob/main/docs/AUDIT_UBEREATS_DELIKREOL_2026-06-24.md
- Pricing : https://github.com/CVlad97/DELIKREOL/blob/main/src/services/pricing.ts
- Audit catalogue : https://github.com/CVlad97/DELIKREOL/blob/main/AUDIT_PHOTOS_RAPPORT.md

## 16. Limite de cette version

La recherche Web live n’était pas disponible pendant cette préparation. Avant toute soumission, refaire une vérification officielle des dispositifs de financement, liens, dates limites, critères, taux et pièces demandées.