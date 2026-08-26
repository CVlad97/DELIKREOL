# Audit marketing DELIKREOL — 2026-07-31

## Synthèse exécutive

DeliKreol doit se positionner comme la solution simple pour commander local en Martinique : marketplace de traiteurs, confirmation WhatsApp, livraison planifiée et offre B2B à panier moyen élevé. Le site est techniquement publiable pour acquisition contrôlée, mais la conversion dépend encore de trois points critiques : preuve sociale Meta, photos partenaires irréprochables et parcours de paiement manuel clairement rassurant.

## État observé

| Zone | État | Décision |
| --- | --- | --- |
| Site web | Pages catalogue, traiteurs, livraison, devis et espace pro présentes | Renforcer pages SEO longues et CTA B2B |
| Facebook | Page officielle non confirmée publiquement dans l’audit | Créer/compléter Page Facebook avant publicité |
| Instagram | Compte officiel non confirmé publiquement dans l’audit | Créer/relier compte pro Instagram à la Page |
| WhatsApp | Canal opérationnel prioritaire via lien direct | Passer en WhatsApp Business, catalogue et templates |
| SEO | Sitemap existant, méta dynamiques côté SPA | Ajouter FAQ, Blog, Business, Recrutement et contenus locaux |
| Ads | Aucun plan structuré visible dans le repo | Créer campagnes Meta : clients, B2B, partenaires, livreurs |
| Analytics | Pixel possible via env, events à renforcer | Installer Pixel/CAPI seulement après création Business Manager |

## Priorités critiques

1. **Créer la Page Facebook officielle** : nom recommandé `DeliKreol Martinique`, catégorie `Service de livraison de repas` + `Traiteur`, URL `https://delikreol.com`, WhatsApp +596 696 65 35 89.
2. **Relier Instagram professionnel** : handle court recommandé `@delikreol.mq` ou `@delikreol_martinique`, bio orientée commande WhatsApp.
3. **Photos partenaires** : retirer du trafic public les visuels flous, saturés ou “affiche dans affiche” ; privilégier originaux partenaires et visuels validés.
4. **Confiance paiement** : garder Stripe désactivé, expliquer Qonto/Revolut/paiement livraison/crypto facultatif et statut “à confirmer”.
5. **Conversion mobile** : CTA sticky Panier + WhatsApp déjà utile ; continuer à vérifier les routes /catalogue, /panier, /traiteurs, /business.

## Priorités importantes

- Créer une offre B2B visible : `Repas d’équipe / séminaire / mairie / association / événement`.
- Publier 1 Reel/jour pendant 30 jours puis 4/semaine.
- Mettre en avant “livraison planifiée” plutôt que livraison immédiate type Uber Eats.
- Créer un formulaire partenaire avec pièces minimales : bio, logo, portrait, 5 photos HD, horaires, zones, conditions.
- Installer un suivi de conversions : clic WhatsApp, ajout panier, demande devis, inscription partenaire.

## Priorités optionnelles

- UGC clients : reposts stories, témoignages, code par partenaire.
- Programme ambassadeurs : micro-influenceurs locaux, clubs sportifs, associations.
- Blog long-tail : “traiteur Fort-de-France”, “repas entreprise Martinique”, “livraison bokit”, “buffet créole”.

## Positionnement recommandé

**Phrase marché :** “DeliKreol centralise les meilleurs traiteurs et repas créoles de Martinique, avec commande simple, confirmation WhatsApp et livraison planifiée.”

**Ne pas promettre :** livraison instantanée partout, paiement automatique complet, volume garanti aux partenaires.

**Promettre :** visibilité locale, demandes qualifiées, organisation, suivi, photos propres, mise en avant B2B.

## KPI à suivre chaque semaine

| KPI | Cible 30 jours | Cible 90 jours |
| --- | ---: | ---: |
| Clics WhatsApp | 250 | 1 500 |
| Demandes devis B2B | 10 | 60 |
| Commandes préparées | 30 | 250 |
| Partenaires actifs | 6 | 20 |
| Panier moyen B2C | 22 € | 28 € |
| Panier moyen B2B | 180 € | 350 € |
| Taux conversion panier → WhatsApp | 18 % | 30 % |

## Corrections appliquées dans cette passe

- Ajout pages SEO : FAQ, Blog, Business, Recrutement.
- Ajout route `/traiteur` pour acquisition partenaire.
- Ajout sitemap des nouvelles pages.
- Ajout actifs publicitaires SVG prêts à exporter.
- Ajout calendrier éditorial 90 jours.
- Ajout runbook Meta / Instagram / WhatsApp Business.
- Paiement public : Stripe reste désactivé par défaut, Qonto/Revolut/livraison/crypto restent manuels.

## Validation locale du 2026-07-31

| Contrôle | Résultat |
| --- | --- |
| TypeScript | OK — `npm run typecheck` |
| ESLint | OK — `npm run lint` |
| Tests unitaires | OK — 15 fichiers, 53 tests passés |
| Build production | OK — `npm run build`, 68 routes SPA générées |
| Audit secrets | OK — 0 secret détecté |
| Audit liens | OK — 22/22 pages, 22/22 avec WhatsApp, assets principaux HTTP 200 |
| Playwright mobile | OK sur `/`, `/catalogue`, `/traiteurs`, `/panier`, `/business`, `/faq`, `/blog`, `/recrutement`, `/livraison` ; aucun débordement horizontal |
| Zoom photo catalogue | OK — lightbox ouverte après clic image |
| Images catalogue | Fichiers testés HTTP 200 ; une alerte `naturalWidth=0` observée avant décodage complet sur image lazy-load Coco, vérifiée ensuite en navigateur isolé à `1080×1251` |
| npm audit production | NO-GO important — 10 vulnérabilités hautes dans dépendances `react-router` et chaîne `vite-plugin-pwa/workbox`, correction à faire sans `npm audit fix --force` |

## Décision marketing / go-live acquisition

- **GO acquisition contrôlée** : site, pages SEO, liens, assets et calendrier sont prêts pour publication organique et campagnes test faibles budgets.
- **NO-GO automatisation Meta complète** : il manque la création/validation propriétaire de la Page Facebook, du compte Instagram professionnel, de WhatsApp Business et du Business Manager.
- **NO-GO paiement automatique** : volontairement hors scope de lancement, paiement manuel et validation humaine maintenus.

## Backlog immédiat

1. Corriger les vulnérabilités npm par mise à jour contrôlée des dépendances, sans `--force`.
2. Créer Page Facebook et Instagram officiel, puis remplacer/valider les liens sociaux du footer.
3. Installer Pixel Meta uniquement après validation du Business Manager.
4. Exporter les SVG publicitaires en PNG/JPG et publier 7 jours de contenu test.
5. Vérifier les photos partenaires après déploiement avec cache vidé/PWA rechargée.
