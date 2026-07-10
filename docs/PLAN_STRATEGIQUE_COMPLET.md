# PLAN STRATÉGIQUE DELIKREOL — 2026

## ✅ Ce qui est fait
- [x] Site en ligne sur **delikreol.com** (HTTP 200)
- [x] Code migré `.mq` → `.com` (35 fichiers, 0 occurrence restante)
- [x] DNS : A records GitHub Pages, www CNAME
- [x] Typecheck 0 erreur, Build OK

---

## 1️⃣ URGENT — Config email Hostinger

**Connecte-toi :** [hpanel.hostinger.com](https://hpanel.hostinger.com) → Domaines → delikreol.com → Zone DNS

| Type | Nom | Valeur | Priorité |
|:----:|:---:|:-------|:--------:|
| **MX** | @ | `mx1.hostinger.com` | **5** |
| **MX** | @ | `mx2.hostinger.com` | **10** |
| **TXT** | @ | `v=spf1 include:_spf.mail.hostinger.com ~all` | — |

Puis **Email → Forwarding** :

| De (delikreol.com) | → | Vers |
|:---|---:|:---:|
| `contact@delikreol.com` | → | `contactcvs@ikabay.store` |
| `commandes@delikreol.com` | → | `contactcvs@ikabay.store` |
| `partenaires@delikreol.com` | → | `contactcvs@ikabay.store` |

⏱ 15 min — attente propagation 15 min à 2h

---

## 2️⃣ PROCHAINE — Protection DNS

Après les MX, active dans Hostinger :
- **DNSSEC** : Hostinger → Domaines → delikreol.com → Protection DNS → Activer
- **DMARC** : Ajouter `_dmarc` TXT : `v=DMARC1; p=quarantine; rua=mailto:contact@delikreol.com`

---

## 3️⃣ META BUSINESS — Instagram + Facebook

### Création des comptes

| Plateforme | Nom recommandé | Email |
|---|---|---|
| **Page Facebook** | DELIKREOL — Livraison Plats Créoles Martinique | contact@delikreol.com |
| **Instagram Pro** | @delikreol.mq | contact@delikreol.com |

### Configuration

1. Crée la **Page Facebook** d'abord depuis facebook.com/business
2. Crée le **compte Instagram Pro** et lie-le à la page
3. Dans **Meta Business Suite** (business.facebook.com), ajoute le domaine `delikreol.com`
4. Ajoute le **TXT de vérification** donné par Meta dans la zone DNS Hostinger
5. Connecte le **WhatsApp Business** (+596 696 65 35 89) dans Meta

### Redirection Instagram vers site

Dans la bio Instagram : `📍 Martinique | Commandes sur delikreol.com`

---

## 4️⃣ WHATSAPP BUSINESS API — Partenaires

### Architecture recommandée

```
Commande client → Supabase → Webhook → Hermes Gateway
                                       ↓
                           WhatsApp Cloud API (Meta)
                                       ↓
                         Notification au traiteur concerné
```

### Actions partenaires via WhatsApp

Les traiteurs pourront :
- ✅ Recevoir notification : "Nouvelle commande #{id}""
- ✅ Accepter/refuser une commande
- ✅ Modifier leur statut (ouvert/fermé)
- ✅ Voir leur planning du jour

### Template messages

```
[Nouvelle commande] #{orderId}
Client: {name}
Plat: {product}
Mode: {mode}
📅 {date}
→ Confirmer: OUI
→ Refuser: NON
```

### Setup
- Utiliser **WhatsApp Cloud API** (gratuit, 1000 conversations/mois offertes)
- Connecter via le **Hermes Gateway** (déjà dans ton stack)
- Chaque partenaire reçoit les notifications sur son propre WhatsApp

---

## 5️⃣ LIVREURS — Recrutement et modèle

### Où trouver des livreurs

| Source | Lien/Contact |
|---|---|
| **Groupe Facebook Livreurs Martinique** | facebook.com/groups/livreursmartinique |
| **Groupe Facebook Livreurs 972** | facebook.com/groups/livreurs972 |
| **Martinique Coursier** | martiniquecoursier.com |
| **Coursiers Antilles** | coursiersantilles.com |
| **Le Bon Coin** | leboncoin.fr → Offres d'emploi Martinique |
| **Pôle Emploi Martinique** | francetravail.fr |

### Statut requi pour livreurs

| Élément | Définition |
|---|---|
| **Statut** | Micro-entrepreneur (auto-entrepreneur) |
| **SIRET** | Obligatoire |
| **Assurance** | RC Pro + véhicule usage professionnel |
| **Coût assurance** | ~500-800€/an |
| **URSSAF** | ~12,3% du CA |

### Modèle économique DELIKREOL

```
Prix livraison client : 4,00 €
  → Livreur : 3,00 € (75%)
  → Plateforme : 1,00 € (25%)
Retrait gratuit : 0,00 €
Commission traiteur : 12-15% (vs Uber Eats 30%)
```

### Annonce type

```
🔥 DELIKREOL recrute des livreurs indépendants en Martinique !
• Livraison plats créoles 🍛
• Secteur : Fort-de-France, Schœlcher, Lamentin et environs
• Statut : micro-entrepreneur (SIRET requis)
• Rémunération : 3€/livraison + pourboires
• Horaires flexibles
• Pas d'exclusivité

📲 Contact : contact@delikreol.com ou WhatsApp 0696 65 35 89
```

---

## 6️⃣ CHEF À MADA — Proposition de partenariat

### Fiche contact

| Info | Détail |
|---|---|
| **Nom** | Chef à Mada (Association Loi 1901) |
| **Adresse** | 12 Rue Victor Sévère, Fort-de-France 97200 |
| **Instagram** | @chefamada |
| **Facebook** | Chef à Mada Martinique |
| **HelloAsso** | helloasso.com/associations/chef-a-mada |
| **Type** | Traiteur malgache et créole |

### Proposition à leur faire

```
Bonjour,
Je suis Vladimir, fondateur de DELIKREOL (delikreol.com).
Nous mettons en relation les traiteurs locaux avec les clients
en Martinique — livraison, click & collect, commande en ligne.

On aimerait vous proposer de rejoindre notre plateforme :
✅ Visibilité gratuite pendant la phase pilote
✅ Commission zéro les 3 premiers mois
✅ Vous gérez vos prix, on s'occupe de la com' et des livraisons

Si ça vous intéresse, on peut échanger par WhatsApp au 0696 65 35 89
ou par mail : partenaires@delikreol.com
```

---

## 7️⃣ CONCURRENCE LOCALE — Positionnement

| Concurrent | Commission | Couverture | Forces |
|---|---|---|---|
| **Uber Eats** | 30% | ❌ Pas en Martinique | Marque mondiale |
| **Deliveroo** | 25-35% | ❌ Pas en Martinique | Marque mondiale |
| **MiamMiam Martinique** | 12-18% | FDF, Schœlcher | Locale, connue |
| **Kréyol Delivery** | ? | Martinique | 100% locale, récente |
| **Zebox** | ? | FDF | 50 restaurateurs |
| **Kari Moun** | ? | Martinique | App mobile |

**Avantage DELIKREOL** : Aucun concurrent sérieux n'a de plateforme complète avec géolocalisation, PostGIS, dashboard temps réel et WhatsApp intégré.

---

## 🎯 SÉQUENCE RECOMMANDÉE CETTE SEMAINE

| # | Action | Temps | Dépend |
|:--:|:-------|:-----:|:------:|
| 1 | **Hostinger** — MX + SPF + forwarding | 15 min | — |
| 2 | **Hostinger** — Activer DNSSEC | 5 min | — |
| 3 | **Email** — Tester envoi à contact@delikreol.com | 5 min | #1 |
| 4 | **Facebook** — Créer la Page DELIKREOL | 20 min | #1 |
| 5 | **Instagram** — Créer @delikreol.mq + lier | 15 min | #4 |
| 6 | **Meta Business** — Valider domaine + connecter WhatsApp | 15 min | #2, #4, #5 |
| 7 | **WhatsApp API** — Configurer via Hermes Gateway | 1h | #6 |
| 8 | **Recrutement** — Publier annonce livreurs Facebook | 10 min | — |
| 9 | **Chef à Mada** — Contacter pour partenariat | 15 min | — |

---

## 📁 Fichiers docs utiles dans le projet

| Fichier | Contenu |
|---|---|
| `docs/DELIKREOL_EMAIL_CONFIG.md` | Configuration MX Hostinger |
| `docs/WHATSAPP_BUSINESS_SETUP.md` | Setup WhatsApp Business |
| `docs/SUPABASE_DEPLOY.md` | Déploiement Supabase |
| `docs/CHECKLIST_FINALE.md` | Checklist points restants |
| `docs/LIVREURS_CADRE_LEGAL.md` | Cadre légal livreurs |
| `docs/POINTS_RELAIS_CADRE_LEGAL.md` | Cadre légal points relais |
