# Cloudflare Email Routing — delikreol.com

Date: 2026-07-10
Statut final: ACTION MANUELLE

## Objectif

Configurer gratuitement Cloudflare Email Routing pour:

| Adresse entrante | Destination |
| --- | --- |
| `contact@delikreol.com` | `contactcvs@ikabay.store` |
| `commandes@delikreol.com` | `contactcvs@ikabay.store` |
| `partenaires@delikreol.com` | `contactcvs@ikabay.store` |

## Sécurité appliquée

- Aucun paiement validé.
- Aucun secret, mot de passe, token, clé API ou code 2FA demandé ou exposé.
- Aucun DNS modifié depuis cette session.
- Sauvegarde DNS effectuée avant toute action: `reports/dns/delikreol-com-before-2026-07-10.txt`.
- Les 4 enregistrements A GitHub Pages ont été vérifiés et doivent être conservés.
- Le CNAME `www` vers GitHub Pages a été vérifié et doit être conservé.

## DNS avant

Source: requêtes DNS publiques `dig`, générées le 2026-07-10 à 17:54 UTC.

| Type | Nom | Valeur |
| --- | --- | --- |
| NS | `delikreol.com` | `aurora.dns-parking.com.` |
| NS | `delikreol.com` | `nebula.dns-parking.com.` |
| A | `delikreol.com` | `185.199.108.153` |
| A | `delikreol.com` | `185.199.109.153` |
| A | `delikreol.com` | `185.199.110.153` |
| A | `delikreol.com` | `185.199.111.153` |
| CNAME | `www.delikreol.com` | `cvlad97.github.io.` |
| MX | `delikreol.com` | Aucun détecté |
| TXT | `delikreol.com` | Aucun détecté |
| TXT | `_dmarc.delikreol.com` | Aucun détecté |

## Site avant migration Cloudflare

| URL | Statut |
| --- | --- |
| `https://delikreol.com/` | HTTP 200 GitHub Pages |
| `https://www.delikreol.com/` | HTTP 301 vers `https://delikreol.com/` |

## Blocage actuel

La session locale ne dispose pas d'un accès Cloudflare utilisable:

- `CLOUDFLARE_API_TOKEN`: absent
- `CF_API_TOKEN`: absent
- `CLOUDFLARE_ACCOUNT_ID`: absent
- `CF_ACCOUNT_ID`: absent
- `wrangler whoami`: non authentifié
- Aucun outil Cloudflare DNS/Email Routing authentifié exposé par le connecteur

Cloudflare a été ouvert sur l'appareil via:

```bash
intent '{"start":"activity","action":"android.intent.action.VIEW","data":"https://dash.cloudflare.com/?to=/:account/add-site"}'
```

## DNS après attendu

À appliquer uniquement après ajout de `delikreol.com` dans Cloudflare Free et import DNS contrôlé.

### À conserver strictement

| Type | Nom | Valeur | Proxy |
| --- | --- | --- | --- |
| A | `@` | `185.199.108.153` | DNS only recommandé pour GitHub Pages |
| A | `@` | `185.199.109.153` | DNS only recommandé pour GitHub Pages |
| A | `@` | `185.199.110.153` | DNS only recommandé pour GitHub Pages |
| A | `@` | `185.199.111.153` | DNS only recommandé pour GitHub Pages |
| CNAME | `www` | `cvlad97.github.io` | DNS only recommandé pour GitHub Pages |

### Email Routing Cloudflare attendu

Cloudflare doit créer ou demander ces records pour Email Routing:

| Type | Nom | Valeur | Priorité |
| --- | --- | --- | --- |
| MX | `@` | `route1.mx.cloudflare.net` | `5` |
| MX | `@` | `route2.mx.cloudflare.net` | `10` |
| MX | `@` | `route3.mx.cloudflare.net` | `20` |
| TXT | `@` | `v=spf1 include:_spf.mx.cloudflare.net ~all` | n/a |

Cloudflare peut aussi demander un record DKIM selon l'interface Email Routing. Laisser Cloudflare l'ajouter si proposé.

## Nameservers Cloudflare

Non disponibles tant que `delikreol.com` n'est pas ajouté au compte Cloudflare.

À récupérer dans Cloudflare après l'étape "Add site / Onboard domain", puis à remplacer chez Hostinger:

| Registrar | Action |
| --- | --- |
| Hostinger | Remplacer `aurora.dns-parking.com` et `nebula.dns-parking.com` par les 2 nameservers Cloudflare exacts affichés |

## Procédure manuelle contrôlée

1. Cloudflare > Add a domain / Onboard domain.
2. Entrer `delikreol.com`.
3. Choisir l'offre Free.
4. Importer les DNS existants.
5. Vérifier avant validation que les 4 A GitHub Pages sont présents.
6. Vérifier que `www` est un CNAME vers `cvlad97.github.io`.
7. Copier les 2 nameservers Cloudflare affichés.
8. Dans Hostinger, remplacer uniquement les nameservers du domaine par ceux de Cloudflare.
9. Attendre que Cloudflare marque le domaine actif.
10. Cloudflare > Compute > Email Service > Email Routing.
11. Ajouter `contactcvs@ikabay.store` comme destination.
12. Envoyer l'email de validation.
13. Confirmer l'adresse depuis la boîte `contactcvs@ikabay.store`.
14. Créer les règles de routing:
    - `contact@delikreol.com` vers `contactcvs@ikabay.store`
    - `commandes@delikreol.com` vers `contactcvs@ikabay.store`
    - `partenaires@delikreol.com` vers `contactcvs@ikabay.store`
15. Autoriser Cloudflare à créer ses MX/SPF/DKIM.
16. Vérifier qu'il n'existe aucun MX concurrent.
17. Tester les trois adresses.
18. Vérifier que `https://delikreol.com/` reste en ligne.

## Tests à exécuter après activation

```bash
dig +short NS delikreol.com
dig +short A delikreol.com
dig +short CNAME www.delikreol.com
dig +short MX delikreol.com
dig +short TXT delikreol.com
curl -I -L --max-time 15 https://delikreol.com/
curl -I -L --max-time 15 https://www.delikreol.com/
```

Puis envoyer trois emails de test:

| Test | Résultat |
| --- | --- |
| `contact@delikreol.com` | À faire après validation destination |
| `commandes@delikreol.com` | À faire après validation destination |
| `partenaires@delikreol.com` | À faire après validation destination |

## Statut final

ACTION MANUELLE.

Le domaine est acheté et actuellement en ligne sur GitHub Pages. La migration Cloudflare Email Routing est prête, mais elle nécessite une connexion Cloudflare côté utilisateur pour:

- ajouter le domaine au compte Cloudflare;
- récupérer les nameservers Cloudflare;
- confirmer la destination `contactcvs@ikabay.store`;
- autoriser Cloudflare à créer les records Email Routing;
- tester la réception réelle.

Sources:

- Cloudflare Email Routing: https://developers.cloudflare.com/email-service/get-started/route-emails/
- Cloudflare Email Routing domain records: https://developers.cloudflare.com/email-service/configuration/domains/
- Cloudflare routing rules and addresses: https://developers.cloudflare.com/email-service/configuration/email-routing-addresses/
- Cloudflare full setup nameservers: https://developers.cloudflare.com/dns/zone-setups/full-setup/setup/
