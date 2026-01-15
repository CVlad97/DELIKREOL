# 📧 Configuration DNS Google Workspace pour delikreol.com

**Objectif :** Configurer les enregistrements DNS pour utiliser Gmail avec votre domaine @delikreol.com

---

## 🎯 PRÉREQUIS

Avant de commencer :
- ✅ Domaine delikreol.com connecté à Bolt
- ✅ Compte Google Workspace actif
- ✅ Accès à Bolt Project Settings > DNS records

---

## 📋 CHECKLIST DNS COMPLÈTE

### Étape 1 : Enregistrements MX (Mail Exchange) - OBLIGATOIRE

**Action :** Configurer les serveurs de messagerie Google

**Dans Bolt Dashboard > Project Settings > DNS records :**

1. **SUPPRIMER tous les enregistrements MX existants**
   - Supprimer les anciens MX (s'il y en a)

2. **Ajouter les 5 enregistrements MX Google** (par ordre de priorité) :

```
Type: MX
Host: @
Priority: 1
Value: smtp.google.com

Type: MX
Host: @
Priority: 5
Value: alt1.aspmx.l.google.com

Type: MX
Host: @
Priority: 5
Value: alt2.aspmx.l.google.com

Type: MX
Host: @
Priority: 10
Value: alt3.aspmx.l.google.com

Type: MX
Host: @
Priority: 10
Value: alt4.aspmx.l.google.com
```

**✅ Format pour Bolt :**

| Type | Host | Priority | Value |
|------|------|----------|-------|
| MX | @ | 1 | smtp.google.com |
| MX | @ | 5 | alt1.aspmx.l.google.com |
| MX | @ | 5 | alt2.aspmx.l.google.com |
| MX | @ | 10 | alt3.aspmx.l.google.com |
| MX | @ | 10 | alt4.aspmx.l.google.com |

**⏱️ TTL :** 3600 (1 heure) ou Auto

**🚨 IMPORTANT :** Ne pas oublier le point final `.` si requis par votre hébergeur DNS

---

### Étape 2 : Enregistrement SPF (Sender Policy Framework) - OBLIGATOIRE

**Action :** Autoriser Google à envoyer des emails au nom de votre domaine

**Format SPF :**

```
Type: TXT
Host: @
Value: v=spf1 include:_spf.google.com ~all
```

**✅ Format pour Bolt :**

| Type | Host | Value |
|------|------|-------|
| TXT | @ | v=spf1 include:_spf.google.com ~all |

**Explications :**
- `v=spf1` : Version SPF 1
- `include:_spf.google.com` : Autorise les serveurs Google
- `~all` : Soft fail (recommandé pour le début)
  - `~all` = Marque comme suspect mais accepte
  - `-all` = Rejette (à utiliser après tests)

**⏱️ TTL :** 3600 (1 heure)

---

### Étape 3 : Enregistrement DKIM (DomainKeys Identified Mail) - FORTEMENT RECOMMANDÉ

**Action :** Signature cryptographique pour authentifier vos emails

#### 3.1 Générer la clé DKIM dans Google Admin

1. **Aller dans Google Admin Console**
   - URL : https://admin.google.com
   - Se connecter avec votre compte admin

2. **Accéder aux paramètres d'authentification**
   - Menu > Apps > Google Workspace > Gmail
   - Cliquer sur "Authenticate email" (Authentifier les e-mails)

3. **Générer une clé DKIM**
   - Cliquer sur "Generate new record" (Générer un nouvel enregistrement)
   - Sélectionner votre domaine : `delikreol.com`
   - Prefix selector : laisser par défaut `google` (ou personnaliser)
   - Key length : **2048 bits** (recommandé)
   - Cliquer sur "Generate"

4. **Récupérer les informations DKIM**
   - Google affiche :
     - **DNS Host Name (TXT record name)** : `google._domainkey.delikreol.com`
     - **TXT record value** : `v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...`

#### 3.2 Ajouter l'enregistrement DKIM dans Bolt

```
Type: TXT
Host: google._domainkey
Value: v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
```

**✅ Format pour Bolt :**

| Type | Host | Value |
|------|------|-------|
| TXT | google._domainkey | v=DKIM1; k=rsa; p=VOTRE_LONGUE_CLE_PUBLIQUE |

**🚨 ATTENTION :**
- La valeur est TRÈS LONGUE (plusieurs centaines de caractères)
- Copier-coller exactement sans espace ni retour à la ligne
- Si Bolt affiche une erreur "trop long", contacter le support ou diviser en plusieurs enregistrements TXT

**⏱️ TTL :** 3600 (1 heure)

#### 3.3 Activer DKIM dans Google Admin

Après avoir ajouté l'enregistrement DNS (attendre 15-30 min) :

1. Retourner dans Google Admin > Gmail > Authenticate email
2. Cliquer sur "Start authentication" à côté de votre domaine
3. Status doit passer à "Authenticating email"

---

### Étape 4 : Enregistrement DMARC (Domain-based Message Authentication) - RECOMMANDÉ

**Action :** Politique de gestion des emails non authentifiés

#### Option A : Mode Monitoring (recommandé pour commencer)

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=none; rua=mailto:dmarc-reports@delikreol.com; ruf=mailto:dmarc-forensics@delikreol.com; pct=100
```

**✅ Format pour Bolt :**

| Type | Host | Value |
|------|------|-------|
| TXT | _dmarc | v=DMARC1; p=none; rua=mailto:dmarc-reports@delikreol.com; pct=100 |

**Explications :**
- `v=DMARC1` : Version DMARC 1
- `p=none` : Mode monitoring (aucune action, juste rapport)
- `rua=mailto:...` : Adresse pour recevoir les rapports agrégés
- `pct=100` : Applique la politique à 100% des emails

#### Option B : Mode Strict (après tests, pour production)

```
Type: TXT
Host: _dmarc
Value: v=DMARC1; p=reject; rua=mailto:dmarc-reports@delikreol.com; ruf=mailto:dmarc-forensics@delikreol.com; pct=100; adkim=s; aspf=s
```

**Explications :**
- `p=reject` : Rejette les emails non authentifiés
- `adkim=s` : Strict DKIM alignment
- `aspf=s` : Strict SPF alignment

**⚠️ RECOMMANDATION :** Commencer avec `p=none` pendant 1-2 semaines, analyser les rapports, puis passer à `p=quarantine` puis `p=reject`

**⏱️ TTL :** 3600 (1 heure)

---

### Étape 5 : Enregistrement de vérification de domaine (si nécessaire)

**Action :** Prouver que vous êtes propriétaire du domaine

Google peut demander un enregistrement TXT de vérification :

```
Type: TXT
Host: @
Value: google-site-verification=XXXXXXXXXXXXXXXXXXXXXX
```

**Où trouver cette valeur :**
1. Google Admin Console > Domains > Manage domains
2. Cliquer sur "Verify" à côté de delikreol.com
3. Choisir la méthode "TXT record"
4. Copier le code de vérification

**✅ Format pour Bolt :**

| Type | Host | Value |
|------|------|-------|
| TXT | @ | google-site-verification=VOTRE_CODE |

**⏱️ TTL :** 3600 (1 heure)

---

## 🔍 VÉRIFICATION DES ENREGISTREMENTS DNS

### Méthode 1 : Outil en ligne MXToolbox

1. **Tester les MX :**
   - URL : https://mxtoolbox.com/SuperTool.aspx
   - Entrer : `delikreol.com`
   - Type : MX Lookup
   - Vérifier que les 5 serveurs Google apparaissent

2. **Tester le SPF :**
   - Type : SPF Record Lookup
   - Doit afficher : `v=spf1 include:_spf.google.com ~all`

3. **Tester le DKIM :**
   - Type : DKIM Lookup
   - Entrer : `google._domainkey.delikreol.com`
   - Doit afficher la clé publique

4. **Tester le DMARC :**
   - Type : DMARC Lookup
   - Doit afficher votre politique DMARC

### Méthode 2 : Ligne de commande

**MX :**
```bash
dig MX delikreol.com +short
# Doit afficher :
# 1 smtp.google.com.
# 5 alt1.aspmx.l.google.com.
# ...
```

**SPF :**
```bash
dig TXT delikreol.com +short | grep spf
# Doit afficher : "v=spf1 include:_spf.google.com ~all"
```

**DKIM :**
```bash
dig TXT google._domainkey.delikreol.com +short
# Doit afficher la clé DKIM
```

**DMARC :**
```bash
dig TXT _dmarc.delikreol.com +short
# Doit afficher : "v=DMARC1; p=none; ..."
```

### Méthode 3 : Google Admin Console

1. Aller dans Gmail > Authenticate email
2. Status DKIM doit être : "Authenticating email" (vert)
3. Pas d'erreur affichée

---

## 🧪 TESTS D'ENVOI ET RÉCEPTION

### Test 1 : Envoi depuis Gmail

1. **Envoyer un email depuis Gmail**
   - Se connecter sur https://gmail.com avec votre compte @delikreol.com
   - Composer un email vers votre adresse personnelle (Gmail, Outlook, etc.)
   - Envoyer

2. **Vérifier l'authentification**
   - Ouvrir l'email reçu
   - Afficher l'en-tête complet (Show original / Afficher l'original)
   - Vérifier :
     - ✅ `SPF: PASS`
     - ✅ `DKIM: PASS`
     - ✅ `DMARC: PASS`

### Test 2 : Réception vers Gmail

1. **Envoyer un email VERS votre adresse @delikreol.com**
   - Depuis une autre adresse (Gmail perso, etc.)
   - Vers : contact@delikreol.com ou votre.nom@delikreol.com

2. **Vérifier la réception**
   - Se connecter sur Gmail
   - Email doit arriver dans la boîte de réception (pas spam)

### Test 3 : Test anti-spam

1. **Utiliser Mail-Tester**
   - URL : https://www.mail-tester.com
   - Envoyer un email depuis @delikreol.com vers l'adresse fournie
   - Cliquer sur "Then check your score"
   - **Objectif : Score ≥ 8/10** (idéalement 10/10)

---

## ⏰ DÉLAIS DE PROPAGATION DNS

**Important :** Les modifications DNS ne sont pas instantanées

| Enregistrement | Temps de propagation typique |
|----------------|------------------------------|
| MX | 15 minutes - 2 heures |
| TXT (SPF/DKIM/DMARC) | 15 minutes - 2 heures |
| Propagation mondiale complète | 24-48 heures |

**Conseil :** Attendre 30-60 minutes après chaque modification avant de tester

---

## 🐛 TROUBLESHOOTING

### Problème : Emails n'arrivent pas

**Vérifications :**
1. Les 5 enregistrements MX sont-ils bien configurés ?
   ```bash
   dig MX delikreol.com +short
   ```
2. Priorités correctes ? (1, 5, 5, 10, 10)
3. Attendre 30 min pour propagation DNS

**Solution :**
- Vérifier dans Google Admin > Domains > Advanced DNS settings > MX records
- Status doit être "Verified" (vert)

---

### Problème : Emails partent en spam

**Causes possibles :**
1. ❌ SPF non configuré ou invalide
2. ❌ DKIM non activé ou invalide
3. ❌ DMARC absent
4. ❌ Réputation IP faible (nouveau domaine)

**Solutions :**
1. Vérifier SPF :
   ```bash
   dig TXT delikreol.com +short | grep spf
   ```
   Doit afficher : `"v=spf1 include:_spf.google.com ~all"`

2. Activer DKIM dans Google Admin (étape 3.3)

3. Ajouter DMARC (étape 4)

4. Éviter l'envoi massif les premiers jours (réchauffer la réputation)

---

### Problème : DKIM non vérifié dans Google Admin

**Erreur :** "Waiting to authenticate" ou "Not verified"

**Solutions :**
1. Vérifier que l'enregistrement DNS est bien présent :
   ```bash
   dig TXT google._domainkey.delikreol.com +short
   ```

2. Attendre 30-60 minutes (propagation DNS)

3. Si > 1h, vérifier qu'il n'y a pas d'espace ou de retour à la ligne dans la valeur TXT

4. Essayer de régénérer la clé DKIM dans Google Admin

---

### Problème : Score Mail-Tester < 8/10

**Vérifications :**
- ✅ SPF configuré ? → +2 points
- ✅ DKIM activé ? → +2 points
- ✅ DMARC configuré ? → +1 point
- ✅ Reverse DNS (PTR) ? → +1 point (géré par Google)
- ✅ Pas de contenu spam dans l'email ? → +2 points

**Solution :**
- Corriger les problèmes indiqués par Mail-Tester
- Attendre 24h et retester

---

### Problème : Enregistrement TXT DKIM trop long

**Erreur :** "TXT record exceeds maximum length"

**Solution 1 :** Diviser en plusieurs strings (certains DNS providers)
```
Type: TXT
Host: google._domainkey
Value: "v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8A..." "MIIBCgKCAQEA..."
```

**Solution 2 :** Utiliser une clé 1024 bits (moins sécurisée mais plus courte)
- Dans Google Admin > Regenerate DKIM key
- Choisir "1024 bits" au lieu de 2048

**Solution 3 :** Contacter le support Bolt si le problème persiste

---

## 📊 RÉCAPITULATIF CONFIGURATION COMPLÈTE

| Enregistrement | Host | Type | Priority | Value | Status |
|----------------|------|------|----------|-------|--------|
| MX Principal | @ | MX | 1 | smtp.google.com | ☐ |
| MX Alt 1 | @ | MX | 5 | alt1.aspmx.l.google.com | ☐ |
| MX Alt 2 | @ | MX | 5 | alt2.aspmx.l.google.com | ☐ |
| MX Alt 3 | @ | MX | 10 | alt3.aspmx.l.google.com | ☐ |
| MX Alt 4 | @ | MX | 10 | alt4.aspmx.l.google.com | ☐ |
| SPF | @ | TXT | - | v=spf1 include:_spf.google.com ~all | ☐ |
| DKIM | google._domainkey | TXT | - | v=DKIM1; k=rsa; p=... | ☐ |
| DMARC | _dmarc | TXT | - | v=DMARC1; p=none; rua=... | ☐ |
| Verification | @ | TXT | - | google-site-verification=... | ☐ |

---

## 🎓 BONNES PRATIQUES

### Sécurité

1. **Activer 2FA sur Google Workspace**
   - Admin Console > Security > 2-Step Verification

2. **Configurer les alias d'équipe**
   - contact@delikreol.com → redirige vers plusieurs personnes
   - support@delikreol.com
   - no-reply@delikreol.com

3. **Surveiller les rapports DMARC**
   - Analyser les emails rua@ pour détecter le spoofing

### Performance

1. **Utiliser un TTL approprié**
   - 3600 (1h) : bon compromis flexibilité/performance
   - 86400 (24h) : meilleure performance mais moins flexible

2. **Précharger les enregistrements DNS**
   - Ajouter `<link rel="dns-prefetch" href="//smtp.google.com">` dans le HTML

### Maintenance

1. **Vérifier régulièrement**
   - Tester tous les 3 mois avec Mail-Tester
   - Vérifier que DKIM est toujours actif

2. **Surveiller les rapports**
   - Créer une règle Gmail pour filtrer les rapports DMARC
   - Analyser mensuellement

---

## 🎉 VALIDATION FINALE

Avant de considérer la configuration comme terminée :

- [ ] Les 5 MX records sont configurés avec les bonnes priorités
- [ ] SPF vérifié avec `dig TXT delikreol.com +short`
- [ ] DKIM généré dans Google Admin
- [ ] DKIM record ajouté dans Bolt DNS
- [ ] DKIM status "Authenticating email" dans Google Admin
- [ ] DMARC configuré (au moins p=none)
- [ ] Test d'envoi réussi (email envoyé depuis @delikreol.com)
- [ ] Test de réception réussi (email reçu sur @delikreol.com)
- [ ] En-têtes email affichent SPF PASS, DKIM PASS, DMARC PASS
- [ ] Score Mail-Tester ≥ 8/10
- [ ] Aucun email en spam pendant les tests
- [ ] Documentation des alias créés
- [ ] 2FA activé sur tous les comptes admin

---

## 📞 SUPPORT

**En cas de problème :**
- Support Google Workspace : https://support.google.com/a/
- Support Bolt DNS : via dashboard Bolt
- Communauté Google Workspace : https://support.google.com/a/community

**Documentation officielle :**
- Google MX records : https://support.google.com/a/answer/140034
- SPF setup : https://support.google.com/a/answer/33786
- DKIM setup : https://support.google.com/a/answer/174124
- DMARC setup : https://support.google.com/a/answer/2466580

---

✅ **Configuration terminée avec succès !** Vos emails @delikreol.com sont maintenant opérationnels et sécurisés.
