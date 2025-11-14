# Guide des Opérations Admin - DELIKREOL

## 🎯 Vue d'Ensemble

Ce guide explique comment gérer efficacement la plateforme DELIKREOL en tant qu'administrateur. Vous apprendrez à utiliser le dashboard, interpréter les données, et gérer les situations courantes.

---

## 📊 Dashboard Principal

### Accès
- URL : `/admin` (après connexion admin)
- Raccourci : Bouton "Admin" dans la navigation

### Vue d'Ensemble
Le dashboard affiche :
- **Statistiques temps réel** : Utilisateurs, vendeurs, commandes, revenus
- **Carte interactive** : Zones, relais, livreurs
- **Commandes actives** : Liste avec statuts
- **Alertes** : Relais saturés, livraisons en retard

---

## 🗺️ Cartographie Interactive

### Lecture de la Carte

#### Zones de Livraison (Polygones Colorés)
- **Vert** : Charge normale (< 50 commandes/jour)
- **Jaune** : Charge modérée (50-100 commandes/jour)
- **Orange** : Charge élevée (100-150 commandes/jour)
- **Rouge** : Surcharge (> 150 commandes/jour)

#### Points Relais (Marqueurs)
- **🟢 Vert** : Disponible (< 50% capacité)
- **🟡 Jaune** : Modéré (50-80% capacité)
- **🔴 Rouge** : Saturé (> 80% capacité)
- **⚫ Gris** : Fermé/Inactif

#### Livreurs (Marqueurs en Mouvement)
- **Position temps réel** via GPS
- **Statut** :
  - 🟢 Disponible
  - 🔵 En livraison (1 commande)
  - 🟣 Occupé (2-3 commandes)
  - ⚫ Hors ligne

### Filtres Disponibles
- Par zone géographique
- Par statut (ouvert/fermé)
- Par type (restaurant/producteur/commerce)
- Par disponibilité livreur

---

## 📈 Interprétation des Stats

### KPIs Essentiels

#### 1. Taux de Conversion
```
Commandes complétées / Visites × 100
```
- **Bon** : > 5%
- **Moyen** : 2-5%
- **Faible** : < 2%

**Actions si faible :**
- Vérifier UX du tunnel de commande
- Analyser abandons panier
- Optimiser délais de livraison

#### 2. Temps Moyen de Livraison
- **Excellent** : < 30 min
- **Bon** : 30-45 min
- **Acceptable** : 45-60 min
- **Problématique** : > 60 min

**Actions si élevé :**
- Recruter plus de livreurs
- Optimiser affectation automatique
- Ajouter des points relais

#### 3. Taux de Satisfaction
```
Reviews positives (4-5★) / Total reviews × 100
```
- **Excellent** : > 90%
- **Bon** : 80-90%
- **Attention** : < 80%

**Actions si faible :**
- Analyser commentaires négatifs
- Former vendeurs/livreurs
- Améliorer qualité contrôle

#### 4. Charge des Relais
```
Current load / Capacity × 100
```
- **Optimal** : 40-60%
- **Sous-utilisé** : < 40%
- **Surcharge** : > 80%

---

## 🤖 Assistant IA Admin

### Accès
- Menu Admin → "Insights IA"
- Ou bouton "💡 Demander à l'IA"

### Questions Pré-Configurées

#### 1. "Analyser les commandes du jour"
**Résultat attendu :**
- Nombre total de commandes
- Chiffre d'affaires
- Top 3 vendeurs
- Heures de pointe
- Recommandations

#### 2. "Identifier les relais saturés"
**Résultat attendu :**
- Liste des relais > 80% capacité
- Impact sur les livraisons
- Solutions proposées (augmenter capacité, ajouter relais)

#### 3. "Optimiser les zones de livraison"
**Résultat attendu :**
- Analyse distribution commandes
- Zones surchargées/sous-utilisées
- Proposition de nouvelle découpe
- Estimation impact

#### 4. "Métriques de performance"
**Résultat attendu :**
- KPIs actuels vs objectifs
- Tendances (↗️ ↘️)
- Points forts & faibles
- Plan d'action prioritaire

### Questions Personnalisées
Exemples :
- "Quel est le meilleur moment pour recruter des livreurs ?"
- "Quels vendeurs ont le plus de commandes annulées ?"
- "Comment améliorer le taux de remplissage des relais ?"

---

## 🔧 Scénarios Courants

### Scénario 1 : Relais Saturé

#### Symptômes
- ⚠️ Alerte "Point relais Fort-de-France Centre saturé"
- Charge actuelle : 28/30 (93%)
- Commandes en attente : 5

#### Actions Immédiates
1. **Contacter l'hôte de relais**
   ```
   WhatsApp → "Bonjour, votre relais approche la capacité max.
   Pouvez-vous accepter 2 colis de plus aujourd'hui ?"
   ```

2. **Réaffecter nouvelles commandes**
   - Dashboard → Commandes en attente
   - Sélectionner commande
   - "Changer point relais" → Suggérer alternative

3. **Solution moyen terme**
   - Recruter nouveau relais dans la zone
   - Ou augmenter capacité actuelle (+5-10 places)

#### Prévention
- Monitoring quotidien (9h, 14h, 18h)
- Alert automatique à 70% capacité
- Diversification des relais par zone

---

### Scénario 2 : Vague de Commandes

#### Symptômes
- 🔥 50+ commandes en 1 heure (vs 20 normalement)
- Exemple : Heure du déjeuner, événement spécial

#### Actions Immédiates
1. **Évaluer ressources**
   ```
   Dashboard → Livreurs disponibles : 3/12
   ```

2. **Recruter temporaire**
   - Notification push → Tous livreurs inactifs
   - "Forte demande ! Bonus +2€/livraison pendant 2h"

3. **Prioriser commandes**
   - Livraisons directes urgentes d'abord
   - Point relais pour non-urgent

4. **Communication clients**
   - Auto-notification : "Forte affluence, délai +15 min"

#### Prévention
- Prévoir pics (midi, soir, weekend)
- Pool de livreurs "on-call"
- Incitations dynamiques

---

### Scénario 3 : Nouvel Hôte de Relais

#### Process Complet

#### 1. Candidature
- Formulaire web avec :
  - Nom, adresse, contact
  - Type local (commerce, particulier)
  - Capacité proposée
  - Horaires disponibles

#### 2. Vérification
- ✅ Visite physique obligatoire
- ✅ Vérifier :
  - Accessibilité (parking, transport)
  - Espace de stockage sécurisé
  - Réfrigération si applicable
  - Professionnalisme hôte

#### 3. Formation (2h)
- **Partie 1 : Concept** (30 min)
  - Rôle dans l'écosystème
  - Rémunération
  - Règles de fonctionnement

- **Partie 2 : Application** (1h)
  - Installation app mobile
  - Scan QR codes (dépôt/retrait)
  - Gestion capacité
  - Communication plateforme

- **Partie 3 : Pratique** (30 min)
  - Simulation complète
  - Q&A

#### 4. Activation
- Admin Dashboard → Points Relais → Nouveau
- Remplir fiche :
  ```
  Nom: Épicerie du Centre
  Adresse: 12 Rue Victor Hugo, 97200 Fort-de-France
  Coordonnées GPS: Auto-détectées
  Capacité: 25 colis
  Horaires: Lun-Sam 8h-19h
  Type stockage: Sec + Froid
  Contact: +596 696 XX XX XX
  ```
- Valider → Point relais actif !

#### 5. Suivi Post-Activation
- Semaine 1 : Appel quotidien
- Mois 1 : Visite hebdomadaire
- Après : Monitoring automatique

---

## 📊 Exports & Reporting

### Exports Automatiques

#### 1. Commandes du Jour
- **Format** : Google Sheets
- **Colonnes** : N°, Client, Vendeur, Total, Statut, Heure
- **Fréquence** : Bouton manuel ou automatique 20h

#### 2. État des Relais
- **Format** : Google Sheets
- **Colonnes** : Nom, Capacité, Charge, %, Statut, Contact
- **Fréquence** : Quotidien 18h

#### 3. Performance Livreurs
- **Format** : Google Sheets
- **Colonnes** : Livreur, Livraisons, Temps moyen, Note, Revenus
- **Fréquence** : Hebdomadaire lundi 9h

### Exports Manuels
- Admin Dashboard → Section concernée → Bouton "📥 Exporter"
- Formats disponibles : CSV, Excel, Google Sheets, PDF

---

## ⚠️ Gestion des Erreurs

### Erreur : Paiement Échoué

#### Diagnostic
1. Dashboard → Commandes → Filtrer "Payment failed"
2. Consulter détails → Raison Stripe

#### Solutions
- **Carte refusée** : Contacter client (SMS/Email)
- **Fonds insuffisants** : Proposer autre moyen de paiement
- **Problème technique** : Ré-essayer après 1h

#### Prévention
- Vérification carte avant validation
- Options de paiement multiples

---

### Erreur : Livreur Non Disponible

#### Diagnostic
- Commande bloquée en "pending_assignment" > 15 min

#### Solutions
1. **Assignation manuelle**
   - Dashboard → Commande → "Assigner livreur"
   - Choisir dans liste disponibles

2. **Basculer en point relais**
   - Si client d'accord
   - "Changer mode livraison"

3. **Annulation**
   - En dernier recours
   - Remboursement automatique
   - Email d'excuse + bon 5€

---

## 🔒 Sécurité & Conformité

### Données Personnelles (RGPD)
- ✅ Conservation : 3 ans max
- ✅ Anonymisation commandes anciennes
- ✅ Droit à l'oubli : Bouton "Supprimer compte"
- ✅ Export données : Accessible utilisateur

### Paiements (PCI-DSS)
- ✅ Aucune carte stockée côté serveur
- ✅ Tokenisation Stripe uniquement
- ✅ HTTPS obligatoire partout
- ✅ Logs audits conservés 1 an

### Accès Admin
- ✅ Authentification 2FA obligatoire
- ✅ Logs actions admin
- ✅ Permissions granulaires
- ✅ Révision accès trimestrielle

---

## 📞 Support Escalade

### Niveau 1 : Auto-Résolution
- Documentation (ce fichier)
- Assistant IA
- FAQs internes

### Niveau 2 : Support Technique
- Email : tech@delikreol.com
- Slack : #support-admin
- Réponse : < 2h

### Niveau 3 : Urgence Critique
- Téléphone : +596 696 XX XX XX
- Exemples : Site down, faille sécurité, perte données
- Disponibilité : 24/7

---

## 📚 Ressources Complémentaires

- **Guide Partenaires** : `docs/concept-partners.md`
- **Documentation API** : `/api/docs`
- **Changelog** : `/changelog`
- **Roadmap** : [Trello Board](#)

---

## ✅ Checklist Quotidienne Admin

### Matin (9h)
- [ ] Vérifier commandes en attente (< 5)
- [ ] Check relais saturés (aucun > 90%)
- [ ] Consulter stats J-1
- [ ] Lire rapport IA automatique

### Midi (13h)
- [ ] Monitor pic déjeuner
- [ ] Vérifier disponibilité livreurs (>30%)
- [ ] Traiter signalements urgents

### Soir (18h)
- [ ] Export données du jour
- [ ] Valider nouveaux vendeurs/relais
- [ ] Planifier J+1
- [ ] Rapport hebdomadaire (vendredi)

---

**DELIKREOL Admin** - Piloter avec efficacité 🚀
