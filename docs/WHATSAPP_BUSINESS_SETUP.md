# WhatsApp Business — Configuration DeliKreol

## Profil WhatsApp Business

**Nom :** DeliKreol
**Catégorie :** Restauration / Service traiteur / Livraison de repas
**WhatsApp :** +596 696 65 35 89
**Site web :** https://delikreol.mq

**Description :**
DeliKreol connecte les clients aux traiteurs, snacks et plats locaux de Martinique. Commandes, devis traiteur, retrait ou livraison selon disponibilité des partenaires. Le meilleur est à venir.

## Messages

### Message d'accueil
```
Bonjour 👋 Bienvenue sur DeliKreol.

Vous pouvez nous écrire pour :
1. Commander un plat
2. Demander un devis traiteur
3. Devenir partenaire
4. Proposer un service de livraison
5. Devenir point relais

Envoyez simplement votre demande, votre commune et le créneau souhaité. On vous répond rapidement.
```

### Message d'absence
```
Merci pour votre message 🙏

Nous avons bien reçu votre demande DeliKreol. Nous vous répondrons dès que possible pour confirmer les disponibilités, les prix, le retrait ou la livraison.

Pour gagner du temps, envoyez :
- votre nom
- votre commune
- le plat ou le service souhaité
- le jour et l'heure
- livraison ou retrait
```

## Réponses rapides à configurer

| Commande | Contenu |
|---|---|
| `/commande` | Demande d'infos client + commune + plat + quantité + mode + créneau |
| `/devis` | Date + commune + personnes + budget + événement + allergies |
| `/partenaire` | Nom activité + commune + cuisine + photos + prix + horaires |
| `/livreur` | Nom + commune + zones + transport + disponibilités |
| `/relais` | Nom lieu + commune + adresse + horaires + capacité |
| `/validation` | Vérification fiche partenaire avant publication |

## Étiquettes WhatsApp

- Nouveau client
- Commande à confirmer
- Commande validée
- Devis traiteur
- Partenaire à valider
- Fiche partenaire OK
- Photos à confirmer
- Prix à confirmer
- Livreur candidat
- Point relais candidat
- Entreprise
- Urgent
- À rappeler

## Intégration technique

Tous les boutons du site utilisent `wa.me/596696653589` avec messages pré-remplis.
Les messages sont générés par `src/utils/whatsapp.ts`.
Le mode WhatsApp-first reste actif quoi qu'il arrive (même si Supabase est connecté).