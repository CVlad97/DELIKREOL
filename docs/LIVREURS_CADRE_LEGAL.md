# DELIKREOL — Cadre légal livreurs prestataires indépendants

## Montage recommandé

**Prestataires indépendants micro-entrepreneurs (portage léger)**

Ce montage est légal si les conditions réelles d'indépendance sont respectées :
- acceptation libre de chaque mission
- pas d'exclusivité
- pas d'horaires imposés
- pas de lien de subordination
- paiement à la mission sur facture

## Risques

| Risque | Niveau | Mitigation |
|---|---|---|
| Requalification en salarié | 🟡 Moyen | Respecter strictement les conditions d'indépendance |
| Absence de contrat écrit | 🟢 Faible | Faire signer un contrat cadre avant la 1ère mission |
| Assurance insuffisante | 🟡 Moyen | Vérifier RC pro + véhicule usage professionnel |
| Non-déclaration URSSAF | 🟡 Moyen | Facture obligatoire, SIRET obligatoire, déclaration |
| Absence de bon de mission | 🟢 Faible | Systématiser le bon de mission écrit |

## Contrat cadre de prestation de livraison

### Entre les soussignés

**DELIKREOL** (le Donneur d'Ordre), et **le Prestataire** (livreur micro-entrepreneur).

### Article 1 — Objet
Le Donneur d'Ordre confie au Prestataire des missions de livraison de repas auprès de clients finaux, sur le territoire de la Martinique.

### Article 2 — Indépendance du Prestataire
Le Prestataire exerce son activité en toute indépendance. Il n'existe aucun lien de subordination avec le Donneur d'Ordre.
Le Prestataire est libre de :
- accepter ou refuser chaque mission proposée
- organiser son emploi du temps
- travailler pour d'autres clients
- utiliser ses propres outils et véhicule

### Article 3 — Missions
Les missions sont proposées au cas par cas via WhatsApp ou l'interface DELIKREOL. Chaque mission fait l'objet d'un bon de mission écrit reprenant :
- identifiant commande
- point de retrait
- adresse de livraison
- rémunération convenue
- délai estimé

### Article 4 — Rémunération
Le Prestataire est rémunéré à la mission, selon le barème annexé au contrat.
Le paiement est effectué sur facture, sous 15 jours fin de mois.

### Article 5 — Assurances
Le Prestataire doit être couvert par :
- une assurance responsabilité civile professionnelle
- une assurance véhicule avec usage professionnel

### Article 6 — Confidentialité
Le Prestataire s'engage à ne pas divulguer les informations clients, les adresses de livraison, les données de commande.

### Article 7 — Résiliation
Le contrat peut être résilié à tout moment par l'une ou l'autre des parties, sans préavis, par simple notification écrite.

### Article 8 — Absence de lien de subordination
Aucune clause du présent contrat ne crée de lien de subordination. Le Prestataire n'est pas soumis à :
- des horaires imposés
- des sanctions disciplinaires
- un pouvoir de direction
- une exclusivité

## Barème livraison — Phase pilote

| Distance | Livreur | Client | DELIKREOL logistique |
|---|---|---|---|
| 0–5 km | 3,50 € | 4,00 € | 0,50 € |
| 5–8 km | 4,50 € | 5,50 € | 1,00 € |
| 8–12 km | 6,00 € | 7,50 € | 1,50 € |
| Attente >10 min | +1,00 € | — | — |
| Annulation arrivé | 1,50 € | — | — |

## Bon de mission (template)

```
BON DE MISSION N° DK-{ORDER_ID}
Date : {DATE}

DONNEUR D'ORDRE : DELIKREOL
PRESTATAIRE : {NOM LIVREUR}

MISSION :
- Retrait chez : {PARTENAIRE}
- Adresse : {ADRESSE RETRAIT}
- Livraison : {ADRESSE LIVRAISON}
- Client : {NOM / TÉLÉPHONE}

TARIFS :
- Prestation livreur : {MONTANT} €
- Frais logistique : 0,50 €
- Total client : {TOTAL} €

STATUT : {EN ATTENTE / ACCEPTÉ / EN COURS / LIVRÉ}
```

## Onboarding livreur — Checklist

- [ ] Pièce d'identité
- [ ] SIRET (micro-entrepreneur)
- [ ] RIB
- [ ] Assurance RC professionnelle
- [ ] Assurance véhicule usage pro
- [ ] Permis de conduire (si motorisé)
- [ ] Type de véhicule
- [ ] Zones de livraison
- [ ] Créneaux souhaités
- [ ] Charte qualité signée
- [ ] Contrat cadre signé
- [ ] Compte DELIKREOL créé

## Messages WhatsApp livreur

### Présentation
```
Bonjour [Prénom],

DELIKREOL prépare le lancement de ses livraisons en Martinique et recherche des livreurs partenaires indépendants.

Le principe :
- vous êtes micro-entrepreneur
- vous choisissez vos missions
- paiement à la mission sur facture
- flexibilité totale

Si vous êtes intéressé, envoyez-nous :
1. votre SIRET
2. votre assurance RC pro
3. votre secteur

Bienvenue dans l'aventure DELIKREOL !
```

### Demande de documents
```
Bonjour [Prénom],

Pour finaliser votre inscription comme livreur partenaire DELIKREOL, merci de nous envoyer :

1. Pièce d'identité (recto/verso)
2. SIRET
3. RIB
4. Attestation RC pro
5. Attestation assurance véhicule usage pro
6. Permis de conduire (si motorisé)

Une fois les documents reçus et vérifiés, nous activons votre accès. Vous recevrez ensuite vos premières propositions de mission.
```

### Proposition de mission
```
Bonjour [Prénom],

Nouvelle mission disponible :

📦 Retrait : [PARTENAIRE] — [ADRESSE]
📍 Livraison : [ADRESSE]
📏 Distance : [X] km
💰 Votre rémunération : [X] €

Acceptez-vous cette mission ?
Répondez OK ou PAS MAINTENANT.
```

### Confirmation mission
```
✅ Mission confirmée !

Retrait : [PARTENAIRE] — [ADRESSE]
Livraison : [ADRESSE]
Client : [NOM] — [TÉLÉPHONE]

Merci de confirmer le retrait et la livraison dans l'interface.

Bonne route ! 🚗
```

### Paiement effectué
```
💳 Paiement réalisé

Mission DK-[ORDER_ID]
Montant : [X] €
Date : [DATE]

La facture correspondante est disponible dans votre espace.

Merci pour votre service ! 🙏
```

## Tables Supabase à créer

```sql
-- Livreurs
create table if not exists drivers (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  siret text,
  rib text,
  vehicle_type text,
  insurance_status text default 'à vérifier',
  zones jsonb default '[]'::jsonb,
  disponibilites text,
  status text default 'candidat' check (status in ('candidat', 'documents reçus', 'validé', 'actif', 'suspendu')),
  contrat_signe boolean default false,
  created_at timestamptz default now()
);

-- Missions de livraison
create table if not exists delivery_missions (
  id uuid primary key default gen_random_uuid(),
  order_id text,
  driver_id uuid references drivers(id),
  status text default 'proposée' check (status in ('proposée', 'acceptée', 'retrait', 'livraison', 'livrée', 'annulée')),
  pickup_partner text,
  pickup_address text,
  delivery_address text,
  customer_phone text,
  distance_km numeric(5,2),
  courier_payout numeric(10,2),
  delikreol_logistic_fee numeric(10,2) default 0.50,
  accepted_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz,
  created_at timestamptz default now()
);
```

## Sortie vers salariat (prévisionnel)

Si le volume devient régulier (>50 missions/mois pour un même livreur), étudier :
- CDD/CPI (contrat à durée déterminée d'usage)
- CDI temps partiel
- Avenant contrat cadre avec rémunération mensuelle minimale (attention : augmente le risque de requalification)

**Action recommandée** : consulter un expert-comptable ou avocat en droit social avant d'embaucher le premier livreur en contrat salarié.