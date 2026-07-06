# DELIKREOL — Repos Operating Map

Date: 2026-07-06
Objectif: separer les repos, eviter les doublons, et concentrer l'effort sur ce qui peut generer des revenus.

## Repos detectes localement

| Repo local | Remote | Role | Decision |
| --- | --- | --- | --- |
| `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL` | `https://github.com/CVlad97/DELIKREOL.git` | Produit actif React/Vite publie sur GitHub Pages | Priorite revenu |
| `/root/Documents/Codex/2026-05-27/https-cvlad97-github-io-delikreol-sublime/delikreol-site` | `https://github.com/CVlad97/delikreol-site.git` | Squelette Next.js recent, non prioritaire | Archive / laboratoire uniquement |
| `/root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et` | pas de commit initial | Conteneur local avec `DELIKREOL/` | Ne pas utiliser comme produit |

## Regles

1. Le produit commercial principal est `DELIKREOL`.
2. `delikreol-site` ne doit pas recevoir de fonctionnalites business tant qu'une migration Next.js n'est pas decidee.
3. Les docs revenu, banque, campagnes et prospection restent dans `DELIKREOL`.
4. Les projets Phase 2 restent separes: Ikabay, SOS Galere, sourcing, services annexes.
5. Aucune campagne ne part depuis un repo archive.

## Priorite produit

### P0 — DELIKREOL

- Vente par devis.
- Prospection entreprise.
- Recrutement partenaires traiteurs.
- Admin offres cash.
- Verification routes et build.

### P1 — delikreol-site

- Garder comme laboratoire Next.js seulement.
- Ne pas deployer comme site public principal.
- Ne pas copier les donnees client dedans.

### P2 — conteneur parent

- Aucun developpement produit.
- Utiliser seulement pour organisation locale.

## Commandes utiles repo actif

```bash
cd /root/Documents/Codex/2026-05-25/utilise-l-ensemble-des-ressources-et/DELIKREOL
npm run typecheck
npm run lint
npm run build
npm run audit:routes
```

