# 🚀 CHECKLIST GO LIVE - delikreol.com

**Date de mise en production prévue :** ______________

**Responsable :** ______________

---

## 📋 PHASE 1 : PRÉPARATION (À faire AVANT le lancement)

### 1.1 Domaine et DNS (⏱️ 2-3 heures)

#### A. Vérification domaine dans Bolt

- [ ] Domaine delikreol.com connecté à Bolt
- [ ] Status : "Verified" (vérifié)
- [ ] Certificat SSL actif et valide
- [ ] URL https://delikreol.com accessible

#### B. Configuration DNS Google Workspace

**Enregistrements MX :**
- [ ] MX 1 : smtp.google.com (priorité 1)
- [ ] MX 5 : alt1.aspmx.l.google.com (priorité 5)
- [ ] MX 5 : alt2.aspmx.l.google.com (priorité 5)
- [ ] MX 10 : alt3.aspmx.l.google.com (priorité 10)
- [ ] MX 10 : alt4.aspmx.l.google.com (priorité 10)
- [ ] Tous les anciens MX supprimés

**Enregistrement SPF :**
- [ ] TXT @ : `v=spf1 include:_spf.google.com ~all`
- [ ] Vérifié avec `dig TXT delikreol.com +short`

**Enregistrement DKIM :**
- [ ] Clé DKIM générée dans Google Admin Console
- [ ] TXT google._domainkey : `v=DKIM1; k=rsa; p=...`
- [ ] Status dans Google Admin : "Authenticating email" (vert)

**Enregistrement DMARC :**
- [ ] TXT _dmarc : `v=DMARC1; p=none; rua=mailto:dmarc-reports@delikreol.com`
- [ ] (Optionnel strict) : `p=reject` après tests

**Propagation DNS :**
- [ ] Attendre 30-60 minutes après modifications
- [ ] Vérifier avec MXToolbox.com
- [ ] Tous les enregistrements résolus correctement

---

### 1.2 Tests Email (⏱️ 30 minutes)

#### A. Test d'envoi

- [ ] Envoi depuis contact@delikreol.com vers email perso
- [ ] Email reçu (pas en spam)
- [ ] En-têtes affichent :
  - [ ] SPF: PASS
  - [ ] DKIM: PASS
  - [ ] DMARC: PASS

#### B. Test de réception

- [ ] Envoi vers contact@delikreol.com depuis email externe
- [ ] Email reçu dans Gmail
- [ ] Pas de délai anormal

#### C. Test anti-spam

- [ ] Test avec Mail-Tester.com
- [ ] Score ≥ 8/10 (idéalement 10/10)
- [ ] Corrections effectuées si nécessaire

---

### 1.3 Configuration Google SSO (⏱️ 1 heure)

#### A. Google Cloud Console

- [ ] Projet Google Cloud créé
- [ ] Google+ API activée
- [ ] OAuth consent screen configuré
- [ ] OAuth consent screen **publié** (status: In production)
- [ ] Client ID créé (type: Web application)
- [ ] Client Secret généré
- [ ] Authorized JavaScript origins ajoutés :
  - [ ] https://delikreol.com
  - [ ] https://www.delikreol.com
- [ ] Authorized redirect URIs ajoutés :
  - [ ] https://VOTRE_PROJECT_REF.supabase.co/auth/v1/callback

#### B. Supabase Configuration

- [ ] Google provider activé dans Authentication > Providers
- [ ] Client ID collé
- [ ] Client Secret collé
- [ ] Configuration sauvegardée

#### C. Code Frontend

- [ ] Bouton "Se connecter avec Google" ajouté
- [ ] Page `/auth/callback` créée
- [ ] Route ajoutée dans App.tsx
- [ ] Redirection après login configurée

#### D. Tests Google SSO

- [ ] Test de connexion Google réussi
- [ ] Utilisateur créé dans Supabase
- [ ] Profil créé automatiquement
- [ ] Redirection correcte après login
- [ ] Déconnexion fonctionne

---

### 1.4 Site Marketing (⏱️ 30 minutes)

#### A. Pages créées

- [ ] Page Accueil (`/`)
- [ ] Page Produits (`/products`)
- [ ] Page À propos (`/about`)
- [ ] Page Contact (`/contact`)
- [ ] Page CGV (`/legal/terms`)
- [ ] Page Politique de confidentialité (`/legal/privacy`)
- [ ] Page Mentions légales (`/legal/mentions`)

#### B. Formulaire de contact

- [ ] Formulaire fonctionnel sur `/contact`
- [ ] Enregistrement en base de données (table `contact_messages`)
- [ ] Email de confirmation (optionnel)
- [ ] Validation des champs
- [ ] Message de succès/erreur

#### C. Page admin messages

- [ ] Accessible via `/admin/contact-messages`
- [ ] Liste des messages affichée
- [ ] Filtres (nouveau/lu/archivé) fonctionnels
- [ ] Actions (marquer lu/archiver) opérationnelles
- [ ] RLS : seuls les admins y ont accès

---

### 1.5 Base de données (⏱️ 15 minutes)

- [ ] Migration `contact_messages` appliquée
- [ ] RLS activé sur la table
- [ ] Policy "Anyone can submit" active
- [ ] Policy "Admins can view" active
- [ ] Test d'insertion depuis formulaire : OK
- [ ] Test de lecture admin : OK

---

### 1.6 Sécurité (⏱️ 30 minutes)

#### A. Variables d'environnement

- [ ] `.env` contient toutes les clés nécessaires
- [ ] `.env` dans `.gitignore`
- [ ] Aucun secret hardcodé dans le code
- [ ] Variables Bolt configurées si nécessaire

#### B. Authentification

- [ ] RLS activé sur toutes les tables sensibles
- [ ] Policies testées
- [ ] Pas d'accès non autorisé possible
- [ ] 2FA activé sur comptes admin Google Workspace

#### C. HTTPS

- [ ] SSL actif sur delikreol.com
- [ ] Redirection HTTP → HTTPS active
- [ ] Certificat valide (pas d'avertissement navigateur)

---

### 1.7 Performance & SEO (⏱️ 1 heure)

#### A. Performance (Lighthouse)

- [ ] Test Lighthouse sur page d'accueil
- [ ] Performance : ≥ 90/100
- [ ] Accessibilité : ≥ 90/100
- [ ] Best Practices : ≥ 90/100
- [ ] SEO : ≥ 90/100
- [ ] Corrections effectuées si nécessaire

#### B. SEO de base

- [ ] Balises `<title>` sur toutes les pages
- [ ] Balises `<meta description>` sur toutes les pages
- [ ] Balise `<meta property="og:title">` (Open Graph)
- [ ] Balise `<meta property="og:description">`
- [ ] Balise `<meta property="og:image">` (image du site)
- [ ] Favicon ajouté
- [ ] robots.txt créé (si besoin)
- [ ] sitemap.xml créé (si besoin)

#### C. Responsive Design

- [ ] Test sur mobile (iPhone, Android)
- [ ] Test sur tablette (iPad)
- [ ] Test sur desktop (1920px, 1366px)
- [ ] Aucun débordement horizontal
- [ ] Texte lisible sur tous les écrans
- [ ] Boutons cliquables sur mobile

---

### 1.8 Tests Fonctionnels (⏱️ 1 heure)

#### A. Navigation

- [ ] Tous les liens du menu fonctionnent
- [ ] Footer liens fonctionnent
- [ ] Pas de lien cassé (404)
- [ ] Breadcrumbs corrects (si applicable)

#### B. Formulaires

- [ ] Formulaire contact : validation OK
- [ ] Formulaire contact : envoi OK
- [ ] Formulaire contact : message de succès affiché
- [ ] Formulaire login/signup : OK
- [ ] Google SSO : OK

#### C. Pages

- [ ] Accueil : contenu visible et attractif
- [ ] Produits : sections claires
- [ ] À propos : histoire de l'entreprise
- [ ] Contact : formulaire + coordonnées
- [ ] CGV : texte légal complet
- [ ] Politique confidentialité : conforme RGPD

#### D. Admin

- [ ] Dashboard admin accessible (si connecté admin)
- [ ] Messages contact affichés
- [ ] Actions admin fonctionnelles

---

### 1.9 Tests Navigateurs (⏱️ 30 minutes)

- [ ] Chrome (dernière version)
- [ ] Firefox (dernière version)
- [ ] Safari (Mac/iOS)
- [ ] Edge (dernière version)
- [ ] Aucune erreur console critique

---

## 📋 PHASE 2 : DÉPLOIEMENT (Jour J)

### 2.1 Sauvegarde (⏱️ 15 minutes)

- [ ] Backup base de données Supabase
- [ ] Backup code source (Git commit + tag)
- [ ] Backup configuration DNS (screenshot)
- [ ] Documentation à jour

### 2.2 Mise en production (⏱️ 30 minutes)

- [ ] Code déployé sur Bolt
- [ ] Build réussi
- [ ] Site accessible sur https://delikreol.com
- [ ] Pas d'erreur 500 ou 404 sur pages principales

### 2.3 Vérification post-déploiement (⏱️ 30 minutes)

#### A. Site web

- [ ] Accueil charge en < 3 secondes
- [ ] Images affichées correctement
- [ ] CSS chargé (pas de style cassé)
- [ ] JavaScript fonctionnel

#### B. Fonctionnalités

- [ ] Formulaire contact fonctionne
- [ ] Google SSO fonctionne
- [ ] Admin peut voir les messages
- [ ] Pas d'erreur dans la console navigateur

#### C. Email

- [ ] Envoi email test depuis contact@delikreol.com
- [ ] Réception email test vers contact@delikreol.com

---

## 📋 PHASE 3 : POST-LANCEMENT (Première semaine)

### 3.1 Monitoring quotidien (⏱️ 15 min/jour)

- [ ] Jour 1 : Vérifier site accessible
- [ ] Jour 1 : Vérifier formulaire contact
- [ ] Jour 1 : Vérifier logs Supabase (pas d'erreur)
- [ ] Jour 3 : Vérifier rapports DMARC
- [ ] Jour 7 : Lighthouse score (performance stable)

### 3.2 Analytics (si configuré)

- [ ] Google Analytics installé (optionnel)
- [ ] Trafic visible dans dashboard
- [ ] Événements trackés (formulaire, etc.)

### 3.3 Optimisations (selon besoins)

- [ ] Analyser logs erreurs
- [ ] Corriger bugs remontés
- [ ] Optimiser performance si < 90
- [ ] Améliorer SEO selon résultats

---

## 📋 PHASE 4 : MAINTENANCE CONTINUE

### Hebdomadaire

- [ ] Vérifier messages contact non lus
- [ ] Répondre aux demandes dans les 24-48h
- [ ] Vérifier site accessible

### Mensuel

- [ ] Lighthouse audit complet
- [ ] Analyser rapports DMARC
- [ ] Vérifier certificat SSL (expiration)
- [ ] Backup base de données

### Trimestriel

- [ ] Test Mail-Tester.com
- [ ] Audit sécurité (mettre à jour dépendances)
- [ ] Révision contenu pages (CGV, etc.)

---

## 🆘 PLAN D'URGENCE

### Si le site est inaccessible

1. Vérifier status Bolt Dashboard
2. Vérifier DNS avec `dig delikreol.com`
3. Vérifier certificat SSL
4. Contacter support Bolt si nécessaire

### Si les emails ne fonctionnent plus

1. Vérifier MX records avec MXToolbox
2. Vérifier status Google Workspace
3. Vérifier DKIM dans Google Admin
4. Attendre propagation DNS (30-60 min)

### Si Google SSO ne fonctionne pas

1. Vérifier que OAuth consent screen est "publié"
2. Vérifier Client ID/Secret dans Supabase
3. Vérifier redirect URIs dans Google Cloud
4. Vérifier logs dans Supabase Dashboard

---

## 📞 CONTACTS UTILES

**Support technique :**
- Bolt Support : via dashboard
- Supabase Support : https://supabase.com/support
- Google Workspace Support : https://support.google.com/a/

**Documentation :**
- `GOOGLE_SSO_SETUP.md` : Guide Google OAuth
- `GOOGLE_WORKSPACE_DNS_SETUP.md` : Guide DNS complet
- Supabase Docs : https://supabase.com/docs

---

## ✅ VALIDATION FINALE

**Le site est prêt à être lancé si TOUS ces points sont validés :**

### Critères bloquants (MUST HAVE)

- [ ] Site accessible sur https://delikreol.com
- [ ] SSL actif et valide
- [ ] Toutes les pages chargent sans erreur
- [ ] Formulaire contact fonctionne
- [ ] Emails envoyés/reçus avec SPF/DKIM/DMARC PASS
- [ ] Google SSO fonctionne
- [ ] Admin peut consulter les messages
- [ ] Responsive sur mobile/tablette/desktop
- [ ] CGV et Politique confidentialité en ligne
- [ ] Aucun secret exposé dans le code

### Critères recommandés (SHOULD HAVE)

- [ ] Lighthouse score ≥ 90 sur toutes métriques
- [ ] Mail-Tester score ≥ 8/10
- [ ] Tests navigateurs (Chrome/Firefox/Safari/Edge) OK
- [ ] DMARC en mode monitoring actif
- [ ] Backup effectué

### Critères optionnels (NICE TO HAVE)

- [ ] Google Analytics configuré
- [ ] Sitemap.xml généré
- [ ] robots.txt configuré
- [ ] Open Graph meta tags complets

---

## 📝 SIGNATURE DE VALIDATION

**Je certifie avoir vérifié tous les points critiques de cette checklist :**

Nom : ______________________________

Date : ______________________________

Signature : ______________________________

---

## 🎉 LANCEMENT !

**Une fois tous les points validés, vous êtes prêt à lancer delikreol.com !**

**Prochaines étapes :**
1. Communiquer le lancement (réseaux sociaux, email, etc.)
2. Onboarder les premiers commerçants
3. Surveiller les retours utilisateurs
4. Itérer et améliorer

**Bon lancement ! 🚀**
