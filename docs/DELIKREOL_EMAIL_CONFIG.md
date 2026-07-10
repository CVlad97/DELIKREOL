# Configuration Email DELIKREOL → contactcvs@ikabay.store

## État actuel

| Enregistrement | delikreol.com | ikabay.store |
|---|---|---|
| **MX** (email) | ❌ Absent | ✅ mx1.hostinger.com (10), mx2.hostinger.com (20) |
| **SPF** (TXT) | ❌ Absent | ✅ v=spf1 include:_spf.mail.hostinger.com ~all |
| **Site** | ✅ HTTP 200 | HTTP 404 |

## Objectif

Tout email envoyé à `@delikreol.com` est forwardé vers `contactcvs@ikabay.store`.

---

## Étape 1 — Connecte-toi à Hostinger

1. Va sur **https://hpanel.hostinger.com/**
2. Connecte-toi avec ton compte
3. Menu → **Domaines** → **delikreol.com** → **Zone DNS**

---

## Étape 2 — Ajoute ces 3 enregistrements DNS

### MX (réception des emails)

| Type | Nom | Valeur | Priorité | TTL |
|---|---|---|---|---|
| **MX** | @ | mx1.hostinger.com | **5** | 3600 |
| **MX** | @ | mx2.hostinger.com | **10** | 3600 |

*(priorité 5 = serveur principal, priorité 10 = backup)*

### SPF (sécurisation anti-spam)

| Type | Nom | Valeur | TTL |
|---|---|---|---|
| **TXT** | @ | `v=spf1 include:_spf.mail.hostinger.com ~all` | 3600 |

⚠️ **Ne supprime PAS les A records** (185.199.108-111.153) — ils font marcher le site.

---

## Étape 3 — Crée le forward email

Dans Hostinger → **Email** → **Forwarding** :

| De | Vers |
|---|---:|---:|
| **contact@delikreol.com** | → | **contactcvs@ikabay.store** |
| **commandes@delikreol.com** | → | **contactcvs@ikabay.store** |
| **partenaires@delikreol.com** | → | **contactcvs@ikabay.store** |

(Si le forwarding n'est pas disponible, crée d'abord la boîte contact@delikreol.com puis règle le forward dans les paramètres de la boîte.)

---

## Étape 4 — Vérification

Après 15 min à 2h de propagation DNS :

```bash
# Vérifier MX
curl -s "https://dns.google/resolve?name=delikreol.com&type=MX"

# Tester l'envoi
Envoie un email à contact@delikreol.com depuis Gmail
→ Doit arriver dans ta boîte contactcvs@ikabay.store
```

---

## Rappel zone DNS complète attendue pour delikreol.com

```
A      @    185.199.108.153   (site web)
A      @    185.199.109.153   (site web)
A      @    185.199.110.153   (site web)
A      @    185.199.111.153   (site web)
CNAME  www  cvlad97.github.io (redirection www)
MX     @    mx1.hostinger.com (priorité 5)  ← À AJOUTER
MX     @    mx2.hostinger.com (priorité 10) ← À AJOUTER
TXT    @    v=spf1 include:_spf.mail.hostinger.com ~all  ← À AJOUTER
```