# DELIKREOL — Prévisionnel 36 mois 2026–2029

Version : 8 septembre 2026  
Période : septembre 2026 à août 2029

> Ce prévisionnel est un modèle de travail. Les cellules et hypothèses doivent être remplacées par des données réelles dès qu'elles sont disponibles. Les revenus B2B, événementiels et services partenaires ne sont pas intégrés au scénario central afin de ne pas créer de chiffre d'affaires fictif.

## 1. Hypothèses centrales

| Hypothèse | Valeur de travail | Statut |
|---|---:|---|
| Panier moyen produits | 25,00 EUR | hypothèse de travail issue des simulations internes |
| Commission marketplace | 15 % | alignée sur le pricing actuel du repo |
| Part des commandes livrées | 75 % | hypothèse à mesurer |
| Jours d'exploitation / mois | 26 | hypothèse |
| Mix 0–5 km | 50 % | hypothèse |
| Mix 5–8 km | 35 % | hypothèse |
| Mix 8–12 km | 15 % | hypothèse |
| Frais livraison moyen client | 5,05 EUR | dérivé du barème pilote et du mix |
| Paiement moyen livreur | 4,225 EUR | dérivé du barème pilote et du mix |
| Marge logistique moyenne | 0,825 EUR | dérivé |
| Frais paiement | 2 % + 0,20 EUR/commande | placeholder à remplacer par tarif réel |
| Provision promotions/remboursements | 1 % GMV | hypothèse prudente |

## 2. Montée en charge — commandes/jour

### Année 1

5, 7, 9, 12, 15, 18, 20, 22, 23, 24, 25, 25

### Année 2

26, 27, 28, 30, 32, 34, 35, 36, 37, 38, 39, 40

### Année 3

42, 44, 46, 48, 50, 52, 54, 55, 56, 57, 58, 60

Ces volumes sont des objectifs de scénario, pas des historiques de ventes.

## 3. Résultats annuels du scénario central

| Indicateur | Année 1 | Année 2 | Année 3 |
|---|---:|---:|---:|
| Commandes | 5 330 | 10 452 | 16 172 |
| GMV produits | 133 250 EUR | 261 300 EUR | 404 300 EUR |
| CA plateforme cœur | 23 285 EUR | 45 662 EUR | 70 651 EUR |
| EBITDA simplifié avant diversification | -8 538 EUR | -6 027 EUR | -872 EUR |

## 4. Lecture du résultat

Le modèle central atteint 25 commandes/jour en fin d'Année 1, mais ce niveau ne suffit pas, avec les hypothèses retenues, à financer simultanément les charges fixes lean et une rémunération dirigeant de 1 500 EUR/mois.

La contribution moyenne estimée par commande est d'environ **3,42 EUR** après rémunération livreur, frais de paiement de travail et provision promotions/remboursements.

## 5. Seuils de rentabilité

| Seuil | Résultat |
|---|---:|
| Charges fixes lean ~1 480 EUR/mois, sans rémunération dirigeant | ~16,7 commandes/jour |
| Charges fixes lean + 1 500 EUR/mois dirigeant | ~33,5 commandes/jour |
| À 25 commandes/jour | ~758 EUR/mois de marge additionnelle à générer |

La marge additionnelle peut provenir de :

- repas entreprises / plateaux repas ;
- événementiel ;
- commissions sur devis ;
- services partenaires ;
- optimisation des frais de livraison ;
- hausse mesurée du panier moyen ;
- réduction du coût d'acquisition et des remises.

## 6. Charges fixes de travail

| Poste | Budget mensuel central |
|---|---:|
| Hébergement / SaaS | 180 EUR |
| Marketing | 600 EUR |
| Comptabilité / juridique | 250 EUR |
| Assurance / administratif | 150 EUR |
| Télécom / support | 100 EUR |
| Opérations terrain | 200 EUR |
| **Total lean** | **1 480 EUR** |

Rémunération dirigeant modélisée :

- M1–M6 : 0 EUR/mois ;
- M7–M12 : 1 500 EUR/mois ;
- Année 2 : 2 000 EUR/mois ;
- Année 3 : 2 400 EUR/mois.

Support opérationnel supplémentaire modélisé à 800 EUR/mois en Année 3.

## 7. Besoin de financement Phase 1

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

Chaque poste doit être remplacé par un devis ou une justification avant dépôt auprès d'un financeur.

## 8. Scénarios à suivre

### Prudent

Montée en charge plus lente, panier moyen inférieur, dépenses marketing maintenues. Ce scénario sert à déterminer le besoin de trésorerie maximal.

### Central

Scénario chiffré ci-dessus.

### Accéléré

Traction plus forte, activation B2B et événementielle, mais sans augmenter les coûts fixes avant preuve de demande.

## 9. Données réelles à injecter chaque mois

- commandes créées et livrées ;
- GMV ;
- panier moyen ;
- taux de livraison ;
- distance moyenne ;
- rémunération livreur ;
- commission vendeur ;
- taux d'annulation/remboursement ;
- coûts paiement ;
- coûts marketing ;
- CAC ;
- taux de réachat ;
- marge B2B ;
- trésorerie disponible.

## 10. Source de vérité financière

Le classeur associé `DELIKREOL_Previsionnel_36_mois_2026-2029.xlsx` est la source de calcul. Ce fichier Markdown en résume les hypothèses et conclusions pour le dépôt GitHub.