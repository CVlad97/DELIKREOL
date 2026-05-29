# Contribuer à DELIKREOL

Merci de contribuer à DELIKREOL ! 🎉

## Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase (mode demo disponible sans)
- Git

## Installation locale

```bash
# Cloner le repository
git clone https://github.com/CVlad97/DELIKREOL.git
cd DELIKREOL

# Installer les dépendances
npm install

# Configurer l'environnement
cp .env.example .env

# Lancer le serveur de développement
npm run dev
```

## Workflow Git

### Branches
- Branch depuis `main`
- Nommage : `feat/nom-feature`, `fix/nom-bug`, `docs/nom-doc`, `chore/nom-tache`

### Commits
Utiliser les commits conventionnels :
- `feat:` Nouvelle fonctionnalité
- `fix:` Correction de bug
- `docs:` Documentation
- `chore:` Tâches de maintenance
- `refactor:` Refactorisation du code
- `perf:` Optimisations de performance
- `test:` Tests

### Pull Requests
- Description claire du changement
- Référencer les issues liées (`Fixes #123`)
- Tests requis avant merge
- Une branche = une feature/bug

## Standards de code

### TypeScript & Linting
```bash
# Vérifier les types
npm run typecheck

# Linter le code
npm run lint

# Tests end-to-end
npx playwright test
```

- **TypeScript strict** : Tous les fichiers doivent passer `typecheck`
- **ESLint** : Respecter les règles définies
- **Noms cohérents** : 
  - `camelCase` pour variables/fonctions
  - `PascalCase` pour composants React
  - `UPPER_CASE` pour constantes
- **Commentaires** : Documenter les fonctions complexes
- **Imports** : Grouper logiquement (react, librairies, types, local)

### Avant de pousser

```bash
npm run typecheck
npm run lint
npx playwright test
npm run build
```

## Structure du projet

```
DELIKREOL/
├── src/
│   ├── components/     # Composants React réutilisables
│   ├── pages/         # Pages principales
│   ├── lib/           # Utilitaires et configurations
│   ├── types/         # Types TypeScript
│   ├── utils/         # Fonctions utilitaires
│   ├── data/          # Données et mocks
│   └── styles/        # Styles globaux
├── public/            # Fichiers statiques
├── docs/              # Documentation
├── tests/             # Tests end-to-end
└── vite.config.ts     # Configuration Vite
```

## Mode Lite Premium

Ce projet supporte le **Mode Lite Premium** :
- Catalogue depuis Google Sheets (CSV public)
- Confirmation via WhatsApp
- Fallback mock si Supabase indisponible
- Déploiement GitHub Pages

Consulter `docs/LITE_TUNNEL.md` pour plus de détails.

## Sécurité

⚠️ **IMPORTANT** :
- Ne JAMAIS commiter `.env` avec des vraies clés
- Stripe SECRET_KEY doit être dans Supabase Edge Functions
- Toutes les clés API doivent être dans le tableau `api_keys` Supabase
- Variables `VITE_*` sont exposées au navigateur - pas de secrets !

Consulter `docs/SECURITY_NOTES.md`

## Contact & Support

- **Email** : contact@delikreol.mq (relayé vers vladimir.claveau@gmail.com)
- **Gmail** : vladimir.claveau@gmail.com
- **Issues** : https://github.com/CVlad97/DELIKREOL/issues
- **Repository** : https://github.com/CVlad97/DELIKREOL

## Questions ?

1. Consultez la [documentation existante](./docs)
2. Explorez les issues existantes
3. Ouvrez une nouvelle issue avec détails
4. Contactez via email si besoin

---

**Bonne contribution !** 🚀
