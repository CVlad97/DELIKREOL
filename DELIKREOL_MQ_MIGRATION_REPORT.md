# DELIKREOL.MQ — rapport de migration

Date: 2026-07-08
Statut: pret techniquement apres achat/configuration du domaine

## Decision courte

Oui, le projet peut migrer vers `delikreol.com`, avec une condition externe: le domaine doit etre achete et les DNS doivent etre configures avant d'activer officiellement le domaine public.

Le code a ete ajuste pour supporter deux modes sans casser l'existant:

- GitHub Pages actuel: `https://cvlad97.github.io/DELIKREOL/` avec `VITE_BASE_PATH=/DELIKREOL/`
- Domaine racine futur: `https://delikreol.com/` avec `VITE_BASE_PATH=/`

## Ce qui a ete finalise aujourd'hui

- Le routage React n'est plus bloque sur `/DELIKREOL`; il suit maintenant `VITE_BASE_PATH` ou `BASE_URL`.
- Le build racine `delikreol.com` passe avec `VITE_BASE_PATH=/`.
- Le build GitHub Pages historique passe avec `VITE_BASE_PATH=/DELIKREOL/`.
- Le warning CSS de build a ete corrige dans la page finance admin.
- La sequence operationnelle reste verte: 12 checks OK, 0 echec.

## Verification technique locale

Commandes executees:

```bash
npm run typecheck
npm run lint
VITE_BASE_PATH=/ npm run build
VITE_BASE_PATH=/DELIKREOL/ npm run build
npm run sequence:status
```

Resultat:

- TypeScript: OK
- ESLint: OK
- Build domaine racine: OK, sans warning
- Build GitHub Pages: OK, sans warning
- Sequence revenus/ops: 12 OK / 0 fail
- Site public actuel: HTTP 200 sur `https://cvlad97.github.io/DELIKREOL/`

## Domaine et Hostinger

### Ce qui est verifie

- `.mq` est bien un TLD officiel dans la racine IANA.
- La page publique Hostinger des extensions liste les TLD disponibles chez Hostinger, mais je n'ai pas de capacite fiable ici pour finaliser l'achat ou confirmer ton panier Hostinger.
- Le connecteur Hostinger disponible dans cette session sert surtout a ouvrir/modifier un site Hostinger Horizons; il ne donne pas un outil de commande/achat de domaine.

### Decision achat

Tu peux tenter l'achat dans ton compte Hostinger si `delikreol.com` apparait disponible dans leur recherche de domaine. Si Hostinger ne propose pas `.mq`, il faut acheter `delikreol.com` chez un registrar qui vend les domaines `.mq`, puis pointer les DNS vers GitHub Pages, Cloudflare, Netlify ou Hostinger.

Je ne recommande pas d'annoncer publiquement `delikreol.com` avant achat + DNS + HTTPS + test formulaire.

## Plan DNS GitHub Pages

Pour servir le site a la racine `delikreol.com` via GitHub Pages:

| Type | Nom | Valeur |
| --- | --- | --- |
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `cvlad97.github.io` |

Ensuite:

1. Dans GitHub Pages, configurer le domaine custom `delikreol.com`.
2. Activer `Enforce HTTPS` quand GitHub le permet.
3. Lancer les tests:
   - `https://delikreol.com/`
   - `https://www.delikreol.com/`
   - `https://delikreol.com/catalogue`
   - `https://delikreol.com/contact`
   - `https://delikreol.com/admin`

## Email domaine

Avant toute campagne mailing:

- Creer `contact@delikreol.com`.
- Ajouter MX selon le fournisseur email choisi.
- Ajouter SPF.
- Ajouter DKIM.
- Ajouter DMARC en mode prudent au depart: `p=quarantine` ou `p=none` le temps des tests.
- Tester la delivrabilite avant envoi massif.

## Basculer le site sans casser l'existant

### Option A — GitHub Pages d'abord

C'est l'option la plus directe et economique.

1. Acheter `delikreol.com`.
2. Configurer DNS chez le registrar.
3. Ajouter le domaine custom dans GitHub Pages.
4. Modifier le workflow de production pour `VITE_BASE_PATH=/` quand le domaine custom devient actif.
5. Ajouter `public/CNAME` uniquement au moment du basculement officiel.

### Option B — Cloudflare en facade

Recommandee si tu veux plus de controle DNS, securite, cache et redirections.

1. Acheter `delikreol.com`.
2. Mettre les nameservers Cloudflare.
3. Pointer vers GitHub Pages ou un autre hebergement.
4. Gerer redirections, HTTPS, cache et protection depuis Cloudflare.

### Option C — Hostinger

Possible si tu veux centraliser domaine/hebergement/email, mais a confirmer dans ton compte Hostinger pour `.mq`.

## Blocages restants avant revenus reels

- Achat et possession effective de `delikreol.com`.
- DNS + HTTPS verifies.
- Email domaine configure avant mailing.
- Variables production confirmees: Supabase, Stripe, email, analytics.
- Paiement live Stripe active uniquement apres verification juridique/banque.
- Conditions legales relues avant trafic payant.

## Sources de verification

- IANA `.mq`: https://www.iana.org/domains/root/db/mq.html
- GitHub Pages custom domain: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
- Hostinger TLD list: https://www.hostinger.com/tld
