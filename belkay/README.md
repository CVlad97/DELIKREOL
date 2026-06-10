# BELKAY — belkay.mq

BELKAY est une application web React/Vite pour structurer les demandes de travaux en Martinique : artisans locaux, estimation de budget, matériaux à bas prix, chef de travaux, suivi projet et dashboards.

## Statut

Version MVP démonstration créée dans le dépôt `CVlad97/DELIKREOL`, dossier `belkay/`.

Cette version fonctionne sans backend externe : les formulaires enregistrent les données dans le `localStorage` du navigateur pour permettre une démonstration rapide. Le branchement à Hostinger Horizons, Supabase, Firebase ou autre backend pourra être fait ensuite.

## Fonctionnalités incluses

- Accueil BELKAY avec positionnement clair.
- Dépôt de projet travaux avec budget, commune, catégorie, délai et besoin matériaux.
- Simulateur de budget indicatif.
- Annuaire d’artisans locaux avec filtres.
- Formulaire devenir artisan partenaire.
- Catalogue matériaux : local, import, destockage, achat groupé.
- Offre chef de travaux / coordination.
- Suivi projet avec timeline.
- Dashboard client.
- Dashboard artisan.
- Dashboard admin BELKAY.
- Pages À propos et Contact.
- Design responsive mobile/tablette/desktop.

## Installation locale

```bash
cd belkay
npm install
npm run dev
```

Ouvrir ensuite l’URL affichée par Vite. Si le site est servi depuis ce sous-dossier du dépôt, ouvrir `/belkay`.

## Build

```bash
cd belkay
npm run build
```

## Important métier

Les prix affichés sont indicatifs et doivent être confirmés par devis. BELKAY ne remplace pas les assurances obligatoires, garanties décennales, diagnostics techniques ou obligations légales. La plateforme aide à sélectionner, cadrer et suivre.

## Prochaine étape recommandée

Créer un dépôt GitHub dédié `belkay-mq` ou extraire ce dossier en projet autonome, puis déployer sur Vercel/Hostinger avec un vrai backend et le domaine `belkay.mq`.
