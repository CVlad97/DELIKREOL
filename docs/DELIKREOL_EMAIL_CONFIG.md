# Configuration Email DELIKREOL — Cloudflare Email Routing

## Choix final : Cloudflare Free (pas Hostinger MX)

Cloudflare Email Routing est **gratuit** et plus simple que Hostinger.

## État actuel (vérifié)

| Domaine | Statut |
|---|---|
| **delikreol.com** | ✅ HTTP 200 sur GitHub Pages |
| **www.delikreol.com** | ✅ CNAME → CVlad97.github.io |
| **A records** (185.199.108-111.153) | ✅ OK — NE PAS SUPPRIMER | 
| **NS** | aurora.dns-parking.com / nebula.dns-parking.com (Hostinger) |
| **MX** | ❌ Aucun |
| **TXT** | ❌ Aucun |

## Procédure Cloudflare (action manuelle)

### Étape 1 — Ajouter delikreol.com dans Cloudflare

1. Va sur **https://dash.cloudflare.com/**
2. Ajoute ton domaine : `delikreol.com`
3. Cloudflare va scanner les DNS existants (A records + CNAME)
4. **GARDE** tous les enregistrements existants (surtout les 4 A GitHub Pages)

### Étape 2 — Changer les nameservers

Cloudflare te donnera 2 nameservers (ex: `ns1.cloudflare.com`, `ns2.cloudflare.com`).

Va chez **Hostinger** → Domaines → delikreol.com → Nameservers → remplace par ceux de Cloudflare.

⏱ Propagation : 15 min à 48h (souvent 1-2h)

### Étape 3 — Activer Email Routing

Dans Cloudflare → **Email** → **Email Routing** → Activer

Ajoute les **Destination Addresses** :
- `contactcvs@ikabay.store` ← Cloudflare va envoyer un email de validation

### Étape 4 — Créer les règles de routage

| De (delikreol.com) | → | Vers |
|:---|---:|:---:|
| `contact@delikreol.com` | → | `contactcvs@ikabay.store` |
| `commandes@delikreol.com` | → | `contactcvs@ikabay.store` |
| `partenaires@delikreol.com` | → | `contactcvs@ikabay.store` |

### Étape 5 — Vérification

```bash
# Vérifier MX (doivent pointer vers Cloudflare)
curl -s "https://dns.google/resolve?name=delikreol.com&type=MX"

# Tester : envoie un email à contact@delikreol.com
# → Doit arriver dans contactcvs@ikabay.store
```

## ⚠️ NE PAS SUPPRIMER

Les 4 enregistrements A suivants font marcher le site :
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```