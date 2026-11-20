# DELIKREOL — protocole qualité obligatoire

**Statut :** procédure interne, pas une certification de conformité.

## 1. Analyser
- Identifier la demande, les pages et parcours impactés, le résultat mobile attendu et les éléments officiels fournis.
- Consigner les inconnues. Ne pas inventer logo, portrait, prix, autorisation ou validation administrative.

## 2. Modifier sur branche isolée
- Préserver les sources originales et les secrets. Associer chaque logo à une entreprise explicitement identifiée.
- Une photographie de plat n'est pas un logo ; une image générée n'est pas un portrait réel.
- Ne jamais utiliser un badge de collectif comme identité d'une entreprise membre.

## 3. Tester automatiquement
- `npm run typecheck`, `npm run test`, `npm run build` et `npm run quality:brands` doivent réussir.
- Tester aussi les routes et parcours de commande/paiement lorsque ces composants sont modifiés.
- Toute erreur bloque la publication ; les exceptions doivent être documentées et approuvées.

## 4. Vérifier visuellement
- Captures réelles sur mobile étroit (~360 px), mobile standard (~390 px) et bureau (~1280 px).
- Examiner chaque vignette : logo net et entier, portrait autorisé dans le rond, texte lisible, prix vérifié, pas de chevauchement ni de badge inapproprié.
- Examiner navigation, images cassées, accessibilité élémentaire et bandeau fixe.
- **Les tests de compilation ne remplacent jamais cette étape.**

## 5. Corriger puis comparer
- Comparer avant/après avec captures ; enregistrer les anomalies et refaire les tests après correction.
- Si la vérification visuelle n'a pas eu lieu, indiquer « visuel non validé ».

## 6. Validation humaine
- Obtenir accord explicite sur les visuels, les données partenaires et toute modification sensible.
- Une entreprise non vérifiée ne devient pas « validée » du seul fait d'un contrôle automatisé.

## 7. Publier et contrôler
- Conserver commit, sauvegarde, méthode de retour arrière et URL de contrôle.
- Vérifier la version réellement servie, les images et au moins les parcours affectés après déploiement.
- Ne jamais déclarer « GO commercial » sans tests réels du paiement, de la commande, de l'accès partenaire et du support.

## Sources de référence
- UNESCO, *Guidance for Generative AI in Education and Research* (2023) : https://unesdoc.unesco.org/ark:/48223/pf0000386693
- NIST, *AI Risk Management Framework 1.0* (2023) : https://doi.org/10.6028/NIST.AI.100-1
- Commission européenne, *Ethics Guidelines for Trustworthy AI* (2019) : https://digital-strategy.ec.europa.eu/en/library/ethics-guidelines-trustworthy-ai

Ces références inspirent la gouvernance et la supervision humaine ; elles ne prescrivent pas ce protocole spécifique de tests web.
