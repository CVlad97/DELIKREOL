# DELIKREOL — Audit consolidé (14/11/2026)

**Référence unique de l'état du projet.** Remplace `AUDIT_FINAL.md`, `AUDIT_PRODUCTION_READY.md`, `VERIFICATION.md`, `DEPLOYMENT_LOG.md` et `CURRENT_WORK_STATUS.md`, supprimés du dépôt le 14/11/2026 (contenu conservé dans l'historique Git).
**Complète sans remplacer :** `CHECKLIST_GO_LIVE.md` (bloquants commerciaux), `docs/ECC_AUDIT_2026-11-05.md` (qualité du harness) et `AGENTS.md` (contrat de travail).

## 0. Méthode et limites

Sources utilisées :

1. lecture des 9 rapports d'audit présents dans le dépôt ;
2. vérifications réseau externes sur `delikreol.com` et `srv1729857.hstgr.cloud` (HTTP, en-têtes, TLS, `release.json`) ;
3. audit serveur fourni par l'opérateur le 13/11/2026 à 23:51 UTC (`docker ps`, `df`, `free`, `certbot`, `ss`, `git rev-parse`, `git status`).

Chaque constat porte un état : **PASS**, **FAIL**, **BLOCKED_HUMAN**, **NOT_TESTED**. Un HTTP 200 ne vaut pas PASS. Aucune donnée commerciale n'a été inventée. Aucun secret n'est reproduit ici.

**Non vérifiable depuis cette session :** intérieur du conteneur `delikreol-web`, contenu de `/opt/delikreol-runtime/releases/`, `nginx -T`, pare-feu, Supabase en direct, paiement réel.

---

## 1. Ce que disent les rapports existants — et ce qui est périmé

| Rapport | Date | Verdict à l'époque | Statut aujourd'hui | Pourquoi |
|---|---|---|---|---|
| `AUDIT_PRODUCTION_READY.md` | 05/01/2026 | « prêt pour Netlify » | **PÉRIMÉ** | La production tourne sur un VPS nginx, pas Netlify. `netlify.toml` subsiste comme relique. |
| `AUDIT_FINAL.md` | 25/06/2026 | build/TS/lint OK, « Service Worker non implémenté » | **PÉRIMÉ sur le PWA** | `vite-plugin-pwa` est dans `package.json` et `vite.config.ts`, et `https://delikreol.com/sw.js` répond 200. |
| `GO_LIVE_CHECKLIST.md` | non daté | Bolt + MX Google Workspace | **PÉRIMÉ / À ARCHIVER** | Bolt n'héberge plus rien ; l'e-mail est passé par Cloudflare Routing (voir `docs/DELIKREOL_EMAIL_CONFIG.md`). Cette checklist décrit une infrastructure qui n'existe plus. |
| `VERIFICATION.md` | non daté | `VITE_SUPABASE_URL = xmwzpoqzwwjuzoedcqep` | **FAUX aujourd'hui** | Le projet actif est `boihlgodmclljtckhmgz` (`package.json`, scripts `supabase:*`). Ce fichier ferait perdre du temps à quiconque le suit. |
| `DEPLOYMENT_LOG.md` | 10/09/2026 | PR #78/#79 « en attente » | **PÉRIMÉ** | `main` a avancé jusqu'à la PR #103. |
| `CURRENT_WORK_STATUS.md` | 22/08/2026 | « aucun accès VPS/domaine » | **PÉRIMÉ sur ce point** | L'audit serveur du 13/11 existe désormais (§ 5). |
| `CHECKLIST_GO_LIVE.md` | 22/08/2026 | NO-GO commercial, 12 bloquants | **TOUJOURS VALIDE** | Aucun des bloquants P0 n'a été refermé depuis. |
| `PREUVES_MANQUANTES_2026-09-07.md` | 07/09/2026 | 6 blocages humains | **PARTIELLEMENT VALIDE** | 4 sur 6 encore ouverts (§ 3). |
| `docs/ECC_AUDIT_2026-11-05.md` | 05/11/2026 | ECC 32/59, NO-GO commercial | **VALIDE — référence la plus fiable** | Seul rapport postérieur à la mise en service du VPS. |

**Conclusion de lecture :** le dépôt ne manquait pas d'audits, il manquait **un audit unique et à jour**. Cinq documents décrivaient une infrastructure abandonnée (Netlify, Bolt, GitHub Pages, ancienne référence Supabase).

**Nettoyage du 14/11/2026 :** 21 rapports de session ou périmés ont été supprimés (dont les cinq ci-dessus et les séries `*_READY`, `AUTOFIX*`, `*_TL_DR`, `VAGUE_1_STATUS`, `START_HERE`). Leur contenu reste accessible via `git log -- <fichier>` ; rien n'a été réécrit dans l'historique. Les documents conservés sont ceux qui gardent une valeur opérationnelle ou probatoire (contrats, checklists ouvertes, cadre légal, preuves partenaires, audits de sécurité).

---

## 2. Contradictions résolues

| Sujet | Ce que disent les documents | Réalité vérifiée le 13-14/11/2026 |
|---|---|---|
| **Hébergement** | README : GitHub Pages. `AUDIT_PRODUCTION_READY` : Netlify. `Dockerfile`/`nginx.conf` : VPS. | **VPS Hostinger.** `delikreol.com`, `www.delikreol.com` et `srv1729857.hstgr.cloud` partagent l'IPv4 `2.24.15.8`, nginx 1.24.0 Ubuntu, conteneur `delikreol-web`. `dist/CNAME` et GitHub Pages ne servent plus. |
| **Release servie** | `AUDIT_FINAL` : « audit en cours ». Divers rapports citent `6d1afbb`, `84c0d40`, `c38b5ae`. | Live = **`delikreol-84c0d40`**, publié `2026-11-06T03:23:18Z` (`/release.json` + `Last-Modified`). |
| **Document root** | `/opt/delikreol-runtime/site` (doc VPS). | **Faux ou périmé.** Le `release.json` de ce répertoire annonce `c38b5ae` du 06/10, alors que le site sert `84c0d40` du 06/11. Le vrai docroot est ailleurs (probablement sous `releases/`). **Tant que `nginx -T` ne l'a pas confirmé, tout script de déploiement est aveugle.** |
| **PWA / service worker** | `AUDIT_FINAL` : non implémenté. | **Implémenté.** `vite-plugin-pwa` actif, `sw.js` servi, `index.html` et `sw.js` en `no-store` (règle P0 respectée). |
| **SumUp** | `PREUVES_MANQUANTES` : « aucune intégration API vérifiée ». | **Faux.** Les fonctions `create-sumup-checkout` et `sumup-webhook` sont **déployées et configurées** (vérifié le 14/11 : `400 Invalid order_id` et `200 Missing checkout id`, donc les secrets serveur sont présents), et `CartPage.tsx` les appelle. `external_payment_events` ne contient **aucune ligne `sumup`** : jamais testé. Statut réel : **déployé, jamais prouvé** — voir `docs/payments/SUMUP_SANDBOX_RUNBOOK.md`. |
| **Stripe** | Rapports de juin : Connect OK. `CHECKLIST_GO_LIVE` : live non autorisé. | Le code expose volontairement `stripe_disabled` en production. **Cohérent** : Stripe n'est pas proposé au client. |

---

## 3. État réel consolidé

### 3.1 Service public — PASS

| Contrôle | Résultat |
|---|---|
| HTTPS `delikreol.com` | 200, certificat Let's Encrypt CN=delikreol.com, valide jusqu'au **16/01/2027 15:24** |
| HTTP → HTTPS | 301 |
| `www.delikreol.com` | même certificat, même serveur |
| `/robots.txt`, `/sitemap.xml`, `/tarifs` | 200 |
| `/admin`, `/catalogue`, `/panier` | 301 vers la variante avec slash, puis 200 (copies de routes générées). Fonctionnel, coût d'une redirection par lien profond. |
| `index.html`, `sw.js` | `no-cache, no-store, must-revalidate` **PASS** |
| Assets hashés | `/assets/index-*.js` 192 Ko, cache long **PASS** |
| TLS `srv1729857.hstgr.cloud` | Let's Encrypt, valide jusqu'au **16/01/2027 02:09** |
| Conteneurs unhealthy | aucun |
| RAM | 7,9 Go, 5,7 Go disponibles, load 0,30 |

### 3.2 Inférence de déploiement — FAIL

- **Pipeline obsolète** : `.github/workflows/deploy.yml` publie sur **GitHub Pages** à chaque push sur `main`, alors que la production est le VPS nginx. Un push ne met donc **pas** à jour delikreol.com, et publie en parallèle un site fantôme. Le workflow fige aussi `VITE_SUPABASE_ANON_KEY` en clair (clé publishable, donc publique par nature, mais la duplication crée deux sources de vérité). À trancher : soit le workflow déploie vers le VPS, soit il est limité à la CI et le déploiement devient explicite.

- prod `84c0d40` = HEAD du checkout VPS, mais **`main` est à `4194bd0`** : 2 commits d'avance (démo Langouste House, lien fiche partenaire → carte ; 2 fichiers, +8 lignes).
- Le docroot réel n'est pas celui documenté (§ 2).
- 9 fichiers de production **non suivis** dans `/opt/vlad/projects/DELIKREOL` : `nginx-spa.conf`, `Dockerfile.production`, `docker-compose.production.yml` (+ `.bak-20261020`), `founder/`, `scripts/founder-local.py`, `scripts/ops-status-safe.sh`, `scripts/profit-simulator-local.py`, `.claude/skills/`. Un clone propre ne les aurait pas.

### 3.3 Serveur — P0

| Constat | Mesure | Seuil du contrat |
|---|---|---|
| Disque racine | 88 Go / 96 Go, **8,5 Go libres, 92 %** | exige >10 % libres → **FAIL** |
| Redémarrage requis | signalé par l'opérateur (noyau en attente) | à planifier |
| Processus zombies | 17 | à solder par reboot |
| Uptime | 22 jours | — |

### 3.4 Hygiène des conteneurs — FAIL

- **Doublons** : `hermes-agent-1/2/3`, `hermes-webui-1/3`, `hermes-dashboard-2` publient des ports identiques (8787 deux fois, 9119 deux fois). Un seul de chaque paire détient réellement le port ; les autres tournent à vide.
- `cupsd` (serveur d'impression, port 631) n'a pas de fonction sur ce VPS.
- **Conflit de port** : `openclaw-6n0r-openclaw-1` (2 semaines) et `ikabay-dropshipping-api` (démarré le 13/11) publient tous deux `0.0.0.0:63970`. Un seul possède le port. Depuis l'extérieur, 63970 est filtré (timeout) : l'API est peut-être « Up » sans être joignable.
- Charge : `delikreol-web`, `listmonk_app` + `listmonk_db` (PostgreSQL 17), `ollama-gsz1-ollama-1` (modèles locaux, gros consommateur de disque probable), `traefik`, `freellmapi` (127.0.0.1:3001).

### 3.5 WhatsApp — BLOCKED_HUMAN, et pire qu'annoncé

Aucun conteneur `delikreol-whatsapp` dans `docker ps`, alors que la documentation VPS (`_docs/VPS_MASTER_FINALISATION_PROMPT.md`, `docs/NEXT_MANUAL_STEPS.md`) le suppose actif (`/opt/delikreol-whatsapp`, conteneur `delikreol-whatsapp`). WhatsApp automatisé = **indisponible**, cohérent avec `WHATSAPP_APP_SECRET` / `WHATSAPP_ACCESS_TOKEN` / `WHATSAPP_PHONE_NUMBER_ID` non configurés. Le fallback manuel reste la seule voie, ce qui est conforme au contrat (§ Règles non négociables, 6).

### 3.6 Commercial — NO-GO (inchangé depuis le 05/11)

| Blocage | État |
|---|---|
| 20 commandes pilotes tracées de bout en bout | **NOT_TESTED** |
| Cycle paiement sandbox (SumUp ou Stripe) + webhook + idempotence + remboursement | **BLOCKED_HUMAN** |
| Allergènes (9 déclarations à confirmer) et photos partenaires | **BLOCKED_HUMAN** |
| E-mail professionnel `contact@delikreol.com` | **BLOCKED_HUMAN** (SMTP Hostinger répondait 535 en septembre) |
| Boîte de réception / canal de réclamation opérationnel | **NOT_TESTED** |
| Base Supabase : 1 commande, 11 vendors, 91 produits (lecture du 05/11) | PASS en lecture, non re-vérifié depuis |

---

## 4. Verdict

**STATE : NO-GO pour l'ouverture commerciale. Pilote manuel assisté uniquement.**
**SCORE : 58/100** — inchangé après intégration des constats serveur : les P0 déjà comptés (disque, docroot, paiement non prouvé) dominent, et les nouveaux points sont de l'hygiène, pas des régressions.

Le score mesure la préparation au lancement, pas la qualité du code.

---

## 5. Plan ordonné

### P0 — avant toute nouvelle mise en production

1. **Identifier le vrai docroot** : `nginx -T | grep -E 'root|server_name'`, `ls /opt/delikreol-runtime/releases/`. Sans ça, aucun déploiement n'est fiable.
2. **Repasser le disque sous 85 %** (libérer ≥ 6,5 Go, viser 8-10 Go), par paliers mesurés : journal/apt/builder → images dangling → doublons Hermes → modèles Ollama. **Interdit : `docker system prune --volumes`** (le volume `listmonk_db` serait détruit).
3. **Fenêtre unique** pour reboot + rotation des logs Docker (`daemon.json`, `max-size 10m`, `max-file 3`) : un seul redémarrage au lieu de deux, et les 17 zombies disparaissent.
4. **Réconcilier documentation et serveur** : remplacer le docroot documenté par le réel, et versionner (ou sauvegarder) les 9 fichiers de prod non suivis.

### P1 — fiabilité

5. Résoudre le conflit 63970 (`docker port`, `ss -lntp | grep 63970`) et décider quel service garde le port.
6. Supprimer les conteneurs Hermes perdants et `cupsd`, après confirmation d'usage (arbitrage humain requis).
7. Déployer `4194bd0` **vers le docroot réel**, puis vérifier `release.json` et les hashes d'assets servis.
8. Mettre à jour `README.md` : hébergement VPS (et non GitHub Pages), source unique de vérité = ce fichier.

### P2 — qualité

9. Aplatir les 301 des liens profonds dans la conf nginx.
10. Archiver les rapports périmés (`AUDIT_PRODUCTION_READY.md`, `GO_LIVE_CHECKLIST.md`, `VERIFICATION.md`, `DEPLOYMENT_LOG.md`) ou les marquer `OBSOLETE` en tête de fichier.
11. Vérifier le renouvellement automatique des certificats (`systemctl list-timers | grep certbot`), échéance 16/01/2027.

---

## 6. Journal des preuves

| Commande | Résultat |
|---|---|
| `curl -s https://delikreol.com/release.json` | `{"release":"delikreol-84c0d40","published_at":"2026-11-06T03:23:18.639Z"}` |
| `curl -sI https://delikreol.com/` | 200, `Last-Modified: Fri, 06 Nov 2026 03:23:15 GMT`, `no-cache, no-store` |
| `curl -sI https://delikreol.com/sw.js` | 200, `no-cache, no-store, must-revalidate` |
| `curl -sI https://delikreol.com/assets/index-D1akiXX0.js` | 200, 192 360 octets, cache long |
| `curl -sI http://delikreol.com/` | 301 → `https://delikreol.com/` |
| `getaddrinfo(delikreol.com, srv1729857.hstgr.cloud)` | `2.24.15.8` pour les deux + `2a02:4780:7:4639::1` |
| `openssl s_client` `delikreol.com` | CN=delikreol.com, Let's Encrypt YE2, 18/10/2026 → 16/01/2027 |
| `git rev-parse --short HEAD` (dépôt) | `4194bd0` |
| `git rev-parse --short HEAD` (checkout VPS) | `84c0d40` |
| `cat /opt/delikreol-runtime/site/release.json` (VPS) | `c38b5ae`, 2026-10-06 → **copie morte** |
| `df -h /` (VPS) | 96 Go, 88 Go utilisés, 8,5 Go libres, **92 %** |
| `free -m` (VPS) | 7940 total, 2228 used, 5711 available |
| `certbot certificates` (VPS) | `delikreol.com` + `srv1729857.hstgr.cloud`, VALID 63 jours |
| `docker ps` (VPS) | 14 conteneurs, aucun unhealthy, `delikreol-web` healthy 2 semaines, **pas de `delikreol-whatsapp`** |
| `git status --short` (VPS) | 9 entrées non suivies (configs de production) |

---

## 7. Rollback

Document de constat, aucune action serveur exécutée. La seule modification de ce dépôt est l'ajout de ce fichier. Suppression = `git rm docs/audits/AUDIT_CONSOLIDE_2026-11-14.md`.
Sauvegarde serveur existante à ne pas supprimer : `/opt/delikreol-runtime/site.backup-20261003-053547.tgz` (85 Mo).
