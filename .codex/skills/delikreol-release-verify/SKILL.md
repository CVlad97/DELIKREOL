---
name: delikreol-release-verify
description: Vérifie qu'une release DeliKreol est réellement servie en production (commit, assets, cache, service worker, routes) et prépare un déploiement réversible vers le bon répertoire. Utiliser après un build, avant/après une mise en production, ou quand le site « ne montre pas les changements ».
---

# DeliKreol — vérification de release

## Ce que « déployé » veut dire

Jamais « le build a réussi ». Déployé = `https://delikreol.com/release.json` annonce le commit attendu, et les assets servis correspondent au build local.

## Contrôle d'identité de release

```bash
curl -sS https://delikreol.com/release.json
curl -sS -o /dev/null -D - https://delikreol.com/ | grep -i -E 'HTTP/|last-modified|cache-control'
curl -sS -o /dev/null -D - https://delikreol.com/sw.js | grep -i -E 'cache-control|service-worker'
```

Attendu : `release.json` = `delikreol-<commit>`, `index.html` et `sw.js` en `no-cache, no-store, must-revalidate`, assets hashés en cache long.

## Avant de publier

1. `git rev-parse --short HEAD` et comparer au commit annoncé par le site.
2. Confirmer le **docroot réel**. Il ne se devine pas : `npm run deploy` le lit dans `nginx -T` et **refuse** `/opt/delikreol-runtime/site` (copie morte `c38b5ae` du 06/10) sans `--allow-dead-copy`.
3. `npm ci` puis les gates : `typecheck`, `lint`, `test`, `build`, `audit:secrets`, `audit:catalog-media`. Un gate en échec arrête tout.
4. Sauvegarde datée du répertoire servi avant écrasement — `npm run deploy --apply` sauvegarde `index.html` avant le `rsync` et n'utilise `--delete` que sur demande explicite (`--prune`).

`npm run deploy` (sans `--apply`) est un plan en lecture seule : il contrôle SSH, résout le docroot et n'écrit rien. `wrangler deploy` a été retiré : l'hébergement est le VPS, pas Cloudflare.

## Origines concurrentes

```bash
npm run audit:origins
```

Le 14/11/2026, `delikreol.pages.dev` servait encore l'application complète (`/admin/` compris) sur le même backend Supabase, sans qu'aucun gate ne le voie. Ce script échoue dès qu'une origine non canonique répond 200 avec le balisage DELIKREOL. Un `404` ou un DNS mort est un PASS : l'absence de copie est la seule preuve acceptable.

## Après publication

```bash
curl -sS https://delikreol.com/release.json
f=$(curl -sS https://delikreol.com/ | grep -o '/assets/index-[^"]*\.js' | head -1); curl -sS -o /dev/null -w '%{http_code} %{size_download}\n' "https://delikreol.com$f"
curl -sSL -o /dev/null -w '%{http_code} %{url_effective}\n' https://delikreol.com/admin
```

Signaler deux anomalies connues plutôt que les « corriger » à l'aveugle : les routes profondes (`/admin`, `/catalogue`, `/panier`) répondent 301 vers leur variante avec slash, et `release.json` peut rester à l'ancien commit si le déploiement a visé un mauvais répertoire.

## Rollback

Toujours connaître le retour avant d'écrire : dernier commit déployé, répertoire de release précédent, archive `site.backup-*.tgz`, et la commande exacte de restauration. Aucun déploiement sans chemin de retour écrit dans le rapport.
