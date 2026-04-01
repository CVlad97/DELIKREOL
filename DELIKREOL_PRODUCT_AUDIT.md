# DELIKREOL Product Audit

## Positionnement retenu
DELIKREOL devient une plateforme locale de coordination et d'orchestration:
- demandes clients
- qualification operative
- affectation partenaires
- suivi missions
- controle documentaire
- pilotage marge et commissions

Message central:
> Vous faites la demande, DELIKREOL organise et transmet aux bons partenaires.

## Stack actuelle
- React 18
- TypeScript
- Vite
- Tailwind CSS
- GitHub Pages pour publication immediate
- Supabase prepare mais optionnel
- localStorage deja exploitable pour une V1 demo stable

## Ce qui est conserve
- front client actuel
- mode demo/fallback sans backend
- base admin existante
- onboarding partenaire deja amorce
- stockage documentaire local-first
- catalogue et donnees de demonstration
- module vendeur self-service pour gerer son propre catalogue

## Ce qui est problematique
- navigation principale pilotee par etat local au lieu d'une logique metier plus nette
- sources de donnees dispersees entre Supabase, Blink et localStorage
- dashboard admin encore trop superficiel pour une vraie exploitation terrain
- absence de modele central explicite clients / partenaires / missions / documents / finances
- dette legacy dans plusieurs pages non utilisees

## Schema V1 local-first

### Client
- id
- nom
- telephone
- zone
- canal d'entree
- historique demandes
- notes operateur
- niveau de priorite

### Partenaire
- id
- raison sociale / nom commercial
- categorie
- zone
- statut
- commission
- contact
- visibilite publique
- storytelling
- statut conformite
- documents
- catalogue produits
- tarification vendeur

### Mission
- id
- reference
- etape pipeline
- type de service
- client
- partenaire
- zone
- canal
- montant
- cout partenaire
- frais livraison
- commission
- marge
- statut paiement
- notes operateur

### Documents
- type
- statut
- date expiration
- reference partenaire
- badge interne

### Finance
- chiffre journalier
- couts partenaires
- frais livraison
- commissions
- marge brute
- panier moyen
- categories rentables
- zones actives

### Produit vendeur
- id
- vendor_id
- nom
- description
- categorie
- prix vendeur
- frais partenaire
- frais livraison
- commission plateforme
- prix client calcule
- stock
- image
- disponibilite

## Pipeline V1
- nouvelle
- qualifiee
- assignee
- en cours
- terminee
- annulee

## Phase 1 critique
- cockpit DELIKREOL OPS
- pipeline missions
- fiches clients / partenaires
- statut documentaire
- finance simplifiee
- integratons WhatsApp / Telegram / Maps / Waze preparees

## Phase 2 importante
- design madras sobre moderne et coherent
- meilleure navigation pro
- responsive mobile renforce sur les vues ops
- vue partenaires plus business et moins administrative
- export catalogue vendeur CSV / JSON

## Phase 3 amelioration
- export CSV / JSON
- historique operateur plus complet
- automatisation OpenClaw preparee
- backend reel plus tard si necessaire

## Fichiers morts ou suspects
Ne pas supprimer sans validation, mais a surveiller:
- src/main.ts
- src/counter.ts
- src/App.test.tsx
- src/pages/HomePage.tsx
- src/pages/MarketingHome.tsx

## Regles d'evolution
- ne pas casser le front client
- ne pas rendre la V1 dependante de Supabase
- toujours builder avant push
- privilegier la rentabilite et l'operabilite terrain
