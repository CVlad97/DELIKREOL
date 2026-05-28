# DELIKREOL - Lite premium (WhatsApp-first)

DELIKREOL Lite premium est une experience locale premium, WhatsApp-first, concue pour commander des menus et offres locales en Martinique.
Le tunnel principal est: Home -> Vendeur/Menu -> Panier -> Checkout -> Validation WhatsApp -> Suivi.

## Stack
- React 18 + TypeScript + Vite + TailwindCSS
- Donnees catalogue via Google Sheets (CSV public) + fallback mock
- WhatsApp pour la confirmation et l'operationnel

## Demarrage rapide
```bash
npm install
cp .env.example .env
npm run dev
```

## Variables d'environnement (Lite premium)
Obligatoires:
- `VITE_LITE_MODE=true`
- `VITE_SHEETS_PUBLIC_URL="<url csv produits>"`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Recommandees:
- `VITE_WHATSAPP_NUMBER=59669653589`
- `VITE_BASE_PATH=/`

Optionnelles:
- `VITE_SHEETS_ORDERS_URL="<endpoint post commandes>"`
- `VITE_SHEETS_FALLBACK=true` (fallback catalogue si Supabase indisponible)
- `VITE_FREE_MODE=true` (force enregistrement prioritaire via Sheets/Form)
- `VITE_ORDER_FORM_URL="<url formulaire commande>"`
- `VITE_CONTACT_EMAIL=contact@delikreol.mq`
- `VITE_OPERATIONS_EMAIL=operations@delikreol.mq`

Important: avec Vite, les variables `VITE_*` sont lues au build. Sur GitHub Pages, le redeploiement est necessaire apres modification.

## Qualite
```bash
npm run typecheck
npm run build
npx playwright test
```

## Preview production locale
```bash
npm run build
npm run preview
```

## Fonctionnement Lite premium

### Traiteurs Partenaires

#### Delices d'Afrique
- **Nom** : Delices d'Afrique
- **Spécialité** : Cuisine africaine traditionnelle et fusion
- **Plats phares** : Yassa poulet, mafe, alloco, banane plantain grillée
- **Style** : Authentique, convivial, généreux
- **Personnalité** : Chaleureux, accueillant, passionné par la cuisine et la culture africaine
- **Objectif** : Promouvoir la cuisine africaine en Martinique et offrir une expérience culinaire unique aux clients.

**Conversation avec un client :**
- **Client** : Bonjour, pouvez-vous me parler de vos plats ?
- **Delices d'Afrique** : Bonjour ! Bien sûr, je suis ravi de partager notre cuisine avec vous. Nous proposons des plats traditionnels africains comme le yassa poulet, un poulet mariné aux oignons et au citron, ou encore le mafe, un ragoût de bœuf aux arachides. Nos allocos et bananes plantain grillées sont également très appréciés ! Tout est préparé avec des épices et des ingrédients authentiques.
- **Client** : Cela semble délicieux ! Qu'est-ce qui vous inspire dans la cuisine africaine ?
- **Delices d'Afrique** : La cuisine africaine est bien plus qu'une simple préparation de plats. C'est une célébration de notre héritage, de notre culture et de notre histoire. Chaque plat raconte une histoire, et chaque épice est une invitation à voyager. Je suis passionné par l'idée de partager cette richesse avec les autres et de créer des moments de convivialité autour de la table.

#### Ninice
- **Nom** : Ninice
- **Spécialité** : Pâtisserie créole et française, desserts personnalisés
- **Plats phares** : Gâteaux créoles (bélébélé, pain d'épices), tartes aux fruits exotiques, entremets, pièces montées
- **Style** : Élégant, raffiné, créatif
- **Personnalité** : Douce, attentive, passionnée par la pâtisserie et la création de moments sucrés
- **Objectif** : Offrir des desserts uniques et personnalisés pour les événements spéciaux (mariages, anniversaires, réceptions).

**Conversation avec un client :**
- **Client** : Bonjour, quelles sont vos spécialités ?
- **Ninice** : Bonjour ! Je suis spécialisée dans la pâtisserie créole et française. Je propose des gâteaux créoles traditionnels comme le bélébélé ou le pain d'épices, mais aussi des tartes aux fruits exotiques et des entremets élégants. Chaque création est faite avec soin et personnalisée selon vos envies.
- **Client** : Cela semble parfait pour un événement spécial. Pouvez-vous créer des pièces montées ?
- **Ninice** : Absolument ! Les pièces montées sont ma spécialité. Que ce soit pour un mariage, un anniversaire ou une réception, je peux créer une pièce unique et sur mesure qui marquera les esprits. Je travaille avec vous pour choisir les saveurs, les designs et les détails qui rendront votre événement inoubliable.
- Catalogue charge depuis Google Sheets (CSV public), fallback mock si indisponible
- Checkout structure avec planification, entreprise, fidelite pilote
- Validation finale par WhatsApp (confirmation manuelle)

## Limites actuelles (connues)
- Paiement non integre (WhatsApp-first)
- ETA indicatif et confirmation manuelle
- Fidelite en mode pilote (activation manuelle)

## Documentation utile
- Tunnel Lite: `docs/LITE_TUNNEL.md`
- Google Sheets: `docs/GOOGLE_SHEETS_SETUP.md`
- Notes securite: `docs/SECURITY_NOTES.md`
- Operations: `docs/OPERATIONS.md`
- Installation generale: `docs/INSTALLATION.md`
- Deploiement: `docs/DEPLOIEMENT.md`

## Notes
- Ne jamais exposer de secret dans le frontend.
- Les donnees sensibles doivent passer par des variables GitHub/CI.
