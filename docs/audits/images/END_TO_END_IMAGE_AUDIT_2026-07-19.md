# Audit images et go-live — 2026-07-19

## Résumé

- Domaine contrôlé : `https://delikreol.com`
- Commit audité avant corrections infra : `de2634c`
- Images locales auditées : 378
- Images raster auditées : 363
- SVG / logos audités : 15
- Fichiers image cassés : 0
- Fichiers image vides : 0
- Références catalogue contrôlées : 113
- Références catalogue manquantes : 0
- Hero / portrait sous seuil minimum : 0

## Images à surveiller

Ces fichiers ne sont pas cassés et ne sont pas remplacés, car aucun original plus fiable n'a été prouvé pendant cet audit.

| Fichier | Dimensions | État | Action |
|---|---:|---|---|
| `public/vendors/sweet-family/nems-poulet.jpg` | 417×265 | Authentique mais faible définition | Garder temporairement, demander original HD |
| `public/vendors/sweet-family/drive-import/drive-06.webp` | 417×265 | Authentique mais faible définition | Garder temporairement, demander original HD |

## Contrôles réalisés

- Inventaire disque avec `identify` sur `public/` et `src/`.
- Détection des fichiers vides ou illisibles.
- Contrôle des chemins utilisés par `assetFromPublic`, `vendorImage`, `branding`, `manifest` et page d'accueil.
- Contrôle HTTP de `https://delikreol.com`.
- Vérification que `og:image` et `twitter:image` pointent vers `https://delikreol.com/branding/hero-tropical.png`.
- Smoke test production sur les routes principales.

## Corrections associées

- Ajout de `assets.directory = "./dist"` dans `wrangler.jsonc` pour que `npm run preview` ne bloque plus l'audit local.
- Remplacement de `npm run preview` par `vite preview --host 0.0.0.0`, car Wrangler crashe dans l'environnement Android/proot avec une erreur mémoire TCMalloc non liée au site.
- Mise à jour de `scripts/audit-routes.cjs` et `scripts/audit-http.cjs` pour auditer `https://delikreol.com` et les médias actuels, pas les anciens chemins GitHub Pages.
- Mise à jour des workflows GitHub Actions vers Node.js 24 pour supprimer l'avertissement de dépréciation Node 20.

## Décision images

Aucune image n'a été remplacée pendant cet audit. Les règles de restauration restent respectées :

- pas d'image générée par IA ;
- pas d'image trouvée au hasard sur Internet ;
- pas de suppression d'original ;
- aucune bonne image HD remplacée par une miniature.
