# Mission OpenClaw — intégrer An Tjè Coco dans DELIKREOL sans mélange de données

Tu travailles sur le dépôt `CVlad97/DELIKREOL` et le projet Supabase `boihlgodmclljtckhmgz`.

## Règle absolue
`An Tjè Coco` et `Coco's Food` sont deux enseignes distinctes.
- An Tjè Coco : Fort-de-France, +596 696 85 70 77, antjecoco@gmail.com, crêpes gastronomiques et pépites salées/sucrées.
- Coco's Food : Rivière-Pilote, cuisine de marché, photos WhatsApp `IMG-20260526-WA0064.jpg` à `IMG-20260526-WA0089.jpg`.
N'utilise jamais une photo, un menu, un téléphone, une adresse ou un produit de Coco's Food pour An Tjè Coco.

## Mode d'exécution
1. Commence en lecture seule.
2. Affiche le dépôt, la branche, le commit HEAD et l'état Git.
3. Crée une branche dédiée `prep/an-tje-coco-import-YYYYMMDD`; ne pousse jamais directement sur `main`.
4. N'écris pas en production Supabase avant validation complète du préflight.
5. Toute modification doit être idempotente et réversible.
6. Ne révèle jamais de clé `service_role`, secret, token, cookie ou mot de passe.

## Phase A — audit
1. Vérifie les fichiers :
   - `src/data/traiteurs.ts`
   - `src/data/partnerAssets.ts`
   - `src/data/mockCatalog*`
   - `supabase/seed.partners.sql`
   - migrations partenaires récentes.
2. Confirme que `PUBLIC_HIDDEN_TRAITEURS` masque encore `An Tjè Coco`.
3. Confirme que `PUBLIC_HIDDEN_PRODUCT_TRAITEURS` masque ses produits.
4. Interroge Supabase en lecture seule :
   - ligne `vendors` d'An Tjè Coco ;
   - produits associés ;
   - médias associés ;
   - codes partenaire/invitations ;
   - buckets Storage et politiques RLS.
5. Produis un rapport avant/après et arrête si l'identité n'est pas cohérente.

## Phase B — source Facebook
1. Utilise uniquement l'URL publique exacte de la page Facebook « An Tjè Coco » fournie par le propriétaire ou retrouvée de manière non ambiguë.
2. Vérifie l'identité avec au moins deux concordances parmi téléphone, e-mail, commune et nom légal.
3. Respecte les conditions d'utilisation de Facebook et les droits d'auteur.
4. Ne télécharge pas de contenu privé, restreint, éphémère ou appartenant à des clients sans autorisation.
5. Enregistre pour chaque média : URL source, date de consultation, auteur/page, texte associé, statut des droits.
6. Si l'URL ou les droits sont incertains, marque `BLOCKED_MEDIA_RIGHTS` et n'importe rien.

## Phase C — traitement photo non génératif
1. Conserve les originaux intacts dans un dossier `originals`.
2. Supprime uniquement les doublons binaires vérifiés par SHA-256.
3. Classe : hero, portrait, galerie, produits, réseaux sociaux, à rejeter.
4. Corrige seulement : orientation EXIF, balance/contraste léger, recadrage, netteté modérée, compression.
5. Interdiction d'ajouter ou de remplacer des aliments, portions, logos, emballages, décors ou textes.
6. Formats :
   - hero : 1600×900 WebP qualité 86–90 ;
   - galerie : 1200×900 WebP qualité 84–88 ;
   - cartes : 800×800 WebP ;
   - miniatures : 640×480 WebP.
7. Rédige un alt text factuel sans inventer le nom du plat.
8. Sélectionne 1 hero, 1 portrait et 5 à 8 photos galerie maximum.
9. Génère `media-manifest.json` avec SHA-256, source, dimensions, alt text, droits et rôle.

## Phase D — contenu partenaire
Utilise comme base vérifiée :
- business_name : An Tjè Coco
- legal_name : AN TJE COCO
- commune : Fort-de-France
- phone/whatsapp : +596 696 85 70 77
- email : antjecoco@gmail.com
- description : Crêpes gastronomiques, pépites salées et sucrées à base de produits locaux.
- specialty : Pépites salées et sucrées, coco-passion, rougail saucisses et créations événementielles.

Ne crée aucun prix, horaire, ingrédient, allergène ou disponibilité sans source confirmée.
Les produits sans prix/allergènes confirmés restent en brouillon et non publics.

## Phase E — implémentation GitHub
1. Ajoute les médias validés sous `public/vendors/an-tje-coco/`.
2. Mets à jour `src/data/partnerAssets.ts` avec hero, portrait et galerie locales uniquement.
3. Prépare une modification de `src/data/traiteurs.ts` :
   - retirer An Tjè Coco de `PUBLIC_HIDDEN_TRAITEURS` seulement si le préflight est PASS ;
   - conserver An Tjè Coco dans `PUBLIC_HIDDEN_PRODUCT_TRAITEURS` tant que produits/prix/allergènes ne sont pas validés.
4. Évite toute URL externe fragile pour le hero.
5. Ne modifie aucune donnée Coco's Food.
6. Ajoute tests ou assertions empêchant le croisement des slugs `an-tje-coco` et `cocos-food`.

## Phase F — Supabase
1. Utilise un UPSERT idempotent sur `public.vendors`.
2. Mets la fiche en `draft`/non publique pendant le contrôle si des champs critiques manquent.
3. N'insère des lignes `products` que pour les produits confirmés.
4. Téléverse les médias dans le bucket prévu avec chemins stables et RLS vérifiée, ou conserve les assets publics Git versionnés si l'architecture actuelle l'impose.
5. Enregistre les alt texts et le statut des droits dans `media_assets` si utilisé.
6. Exécute les advisors sécurité et performance après toute migration.
7. Vérifie qu'aucune politique RLS permissive ou clé secrète n'a été ajoutée.

## Phase G — validation obligatoire
Exécute :
- installation verrouillée avec le gestionnaire déjà utilisé ;
- lint ;
- typecheck ;
- tests ;
- build production ;
- contrôle des liens d'images ;
- contrôle responsive mobile/desktop ;
- contrôle visuel de la fiche ;
- requêtes Supabase de lecture après écriture ;
- recherche globale de toute confusion `An Tjè Coco` / `Coco's Food`.

Critères PASS :
- fiche An Tjè Coco visible uniquement avec ses propres médias ;
- aucun produit inventé ;
- aucune image cassée ;
- aucun secret ;
- build et tests verts ;
- rollback documenté.

## Livraison
1. Commit(s) clairs sur la branche dédiée.
2. Pull request en brouillon avec :
   - résumé ;
   - sources ;
   - captures avant/après ;
   - checklist ;
   - données non confirmées ;
   - plan de rollback.
3. Ne fusionne pas.
4. Termine par un tableau `PASS / BLOCKED / FAIL` et demande l'approbation humaine avant publication.
