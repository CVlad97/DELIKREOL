# LIMITATION DU ROUTING SPA SUR GITHUB PAGES

**Date:** 2026-07-15

## Problème

GitHub Pages retourne un statut HTTP **404** pour toutes les routes qui ne correspondent pas à un fichier physique, y compris les routes SPA comme `/catalogue`, `/panier`, `/devis`, etc.

Le fichier `dist/404.html` (copie de `index.html`) est bien servi en body — le routing côté client fonctionne en navigateur — mais le status code est **404** au lieu de **200**.

## Impact

- **SEO** : Les moteurs de recherche peuvent interpréter le 404 comme "page inexistante" malgré le contenu servi.
- **Réseaux sociaux** : Les aperçus de liens (Open Graph) peuvent échouer si le crawler suit le status 404.
- **Analytics** : Les pages peuvent être comptées comme erreurs.

## Mitigation actuelle

Le workflow CI copie `dist/index.html` vers `dist/404.html` :
```yaml
- name: Add SPA fallback and nojekyll marker
  run: |
    cp dist/index.html dist/404.html
    touch dist/.nojekyll
```

Cela permet au routing côté client de fonctionner, mais ne corrige pas le status code.

## Solution durable

Pour obtenir un vrai status 200 sur toutes les routes, il faut migrer vers un hébergement supportant les **rewrites SPA** :

1. **Cloudflare Pages** — `Functions` avec rewrite vers `index.html`
2. **Cloudflare Workers** — Proxy devant GitHub Pages avec rewrite
3. **Netlify** — Fichier `_redirects` avec `/* /index.html 200`
4. **Vercel** — Configuration `rewrites` automatique
5. **Nginx/Caddy** — `try_files $uri /index.html`

**Aucune modification de DNS ne doit être effectuée sans autorisation explicite de Vladimir.**

## Headers de sécurité

GitHub Pages ne permet pas de configurer des headers de sécurité personnalisés :
- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

Une balise `<meta http-equiv="Content-Security-Policy">` peut être ajoutée au HTML, mais elle ne remplace pas une vraie CSP serveur (les navigateurs ignorent certains directives via meta). **Ne pas prétendre avoir ajouté une vraie CSP serveur via une balise meta.**

Pour des headers complets, configurer Cloudflare en proxy devant GitHub Pages (plan gratuit suffit).
