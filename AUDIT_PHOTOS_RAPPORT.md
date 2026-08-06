# Audit photos produits & descriptions — Catalogue DELIKREOL

**Date :** 6 août 2026  
**Branche :** main (SHA 661d894) — *aucune modification apportée à main*  
**Périmètre :** `src/data/mockCatalog.ts`, `src/data/traiteurs.ts`, `public/vendors/`  
**Méthode :** parsing programmatique du catalogue + vérification d'existence des fichiers + analyse visuelle (vision) d'un échantillon représentatif de 5 produits (étendu à 7 sur Ninice).

---

## 1. Synthèse exécutive

| Indicateur | Valeur | Statut |
|---|---|---|
| Produits réels analysés | **86** | — |
| Produits avec photo réelle | 68 (79 %) | ✅ Correct |
| Produits avec photo placeholder (`photoAConfirmer`) | **18 (21 %)** | ⚠️ À traiter |
| Références d'image cassées / fichiers manquants | **0** | ✅ Aucune |
| Produits sans description | **0** | ✅ Tous décrits |
| Produits sans `ingredients` / `allergens` | **0** | ✅ |
| Désaccord photo ↔ description détecté (échantillon vision) | **4 sur 7** | 🔴 Significatif |
| Photos générées par IA non labellisées comme telles côté UI | 18 | ⚠️ |
| Catégories utilisées mais non définies dans `mockCategories` | **2** (`Apéritifs`, `Glaces`) | 🔴 |
| Doublons d'image (même photo pour plusieurs produits distincts) | **1 cluster** (Bao Buns) | 🔴 |
| Fichiers orphelins non référencés dans `public/vendors/` | 397 | ℹ️ Nettoyage optionnel |

**Verdict :** Aucun lien cassé, aucune photo manquante côté fichier, mais la **cohérence sémantique photo/description est dégradée** sur plusieurs vendors (notamment Ninice et Sweet Family) et 18 produits n'ont aucune photo réelle.

---

## 2. Détail des produits sans photo réelle (placeholders)

18 produits pointent vers `vendors/_fallback/photo-a-confirmer.svg` (via la constante `photoAConfirmer` ou directement le SVG). Ils s'affichent avec un visuel générique "photo à confirmer".

**Snack Save Peyia (3)**
- `save-peyia-filet-poulet` — Filet de poulet *(featured)*
- `save-peyia-crevettes` — Crevettes riz crudités *(featured)*
- `save-peyia-cote-agneau` — Côte d'agneau

**An Tjè Coco (4)** — *note : ce partenaire est masqué publiquement via `PUBLIC_HIDDEN_TRAITEURS`*
- `antjecoco-pepite-gratin-banane`, `antjecoco-pepite-coco-passion`, `antjecoco-pepite-rougail-saucisses`, `antjecoco-pepite-tiramisu-cafe`

**Saveurs d'Afrique (4)**
- `saveurs-afrique-attieke` (Attiéké — *featured, photoQuality: « à valider »*)
- `saveurs-afrique-igname` (Igname jus d'œuf)
- `saveurs-afrique-spaghetti` (Spaghetti)
- `saveurs-afrique-degue` (Dèguè 1L)

**Gouté Mwen (7)**
- `goute-mwen-ananas`, `goute-mwen-prune-cythere`, `goute-mwen-prune-maracuja`, `goute-mwen-avocat-basi` (pointent directement vers le SVG)
- `goute-mwen-cacahuete`, `goute-mwen-pistache`, `goute-mwen-choco` (via `photoAConfirmer`)

---

## 3. Vérification visuelle photo ↔ description (échantillon)

### ✅ Conformes

| Produit | Image | Constat vision |
|---|---|---|
| `save-peyia-cote-porc` (Côte de porc riz crudités) | `IMG-20260710-WA0005.jpg` | Côte de porc grillée + riz + crudités/salade présents. ✅ (photo montre aussi du poulet en bonus, acceptable) |
| `saveurs-afrique-foutou` (Foutou banane sauce arachide) | `IMG-20260526-WA0156.jpg` | Boule de foutou + sauce + viande mijotée + légumes verts. ✅ |
| `ninice-bami` (Bami des Îles) | `IMG-20260521-WA0074.jpg` | Nouilles sautées + plantain + poulet. ✅ |

### 🔴 Non conformes

| Produit | Image | Description catalogue | Constat vision | Diagnostic |
|---|---|---|---|---|
| `ninice-colombo` (Le Colombo des Deux Rives) | `IMG-20260521-WA0070.jpg` | "Colombo signature mêlant épices Caraïbes et Suriname" | **Riz sauté** (carottes, petits pois, maïs, haricots) — ressemble à un moksi/riz cantonais | **Mauvaise image** : montre un riz sauté, pas un colombo |
| `ninice-moksi-vegetarien` (Le Moksi Aleisi Végétarien) | `IMG-20260521-WA0071.jpg` | "Riz sauté surinamais aux légumes, version végétarienne" | **Ragoût de poulet + okra + carottes** (viande présente !) | **Mauvaise image** : montre un plat de viande, contredit "végétarien" |
| `goute-mwen-abricot-pays` (Glace artisanale abricot pays) | `goute-mwen-abricot-pays-ai.jpg` | "Glace artisanale à l'abricot pays" | **Poche de jus/liquide** "ABRICOT PAYS" + fruit (ressemble à corossol), **filigrane « Contenu généré par l'IA »** | **Mauvaise image** : c'est un jus, pas une glace ; IA générée |
| `sweet-family-bao-poulet` (Bao Bun Poulet) | `bao-buns.jpg` | "Bao bun vapeur, poulet mariné" | Bao buns + poulet + étiquette "Bao Bun Poullet" ✅ *pour ce produit* | **Doublon** : la MÊME photo sert pour 4 produits (voir §4) |

**Hypothèse forte sur Ninice :** les images `WA0070` et `WA0071` sont **inversées**. `WA0071` (ragoût poulet/okra, typique d'un colombo) correspondrait au Colombo, tandis que `WA0070` (riz sauté) correspondrait au Moksi. Les correspondances produit↔fichier semblent décalées sur ce lot Ninice — à vérifier sur toute la série `WA0070`→`WA0080`.

---

## 4. Doublons d'image (même photo pour plusieurs produits distincts)

`vendors/sweet-family/bao-buns.jpg` est utilisé pour **4 produits** dont 2 au bœuf — or la photo montre explicitement du **poulet** (étiquette manuscrite "Bao Bun Poullet") :

- `sweet-family-bao-poulet` — Bao Bun Poulet ✅
- `sweet-family-bao-boeuf` — Bao Bun Bœuf ❌ (photo montre poulet)
- `sweet-family-bao-boeuf-premium` — Bao Bun Bœuf Premium ❌
- `sweet-family-bao-bun-poulet` — Bao Bun Poulet (boîte de 28) ⚠️ (photo = pièce individuelle, pas boîte de 28)

**Recommandation :** photographier des baos bœuf distincts, ou à défaut remplacer par un visuel neutre + alt dédié.

---

## 5. Photos générées par IA

18 produits Gouté Mwen utilisent le dossier `supplied-ai-20260722/` (images IA). L'analyse de l'une d'elles révèle un **filigrane IA visible** et une **représentation erronée** (pochette de jus au lieu de glace).  
⚠️ Risques : (a) marketing trompeur si le visuel ne ressemble pas au produit réel, (b) filigrane visible côté client, (c) aucune mention "visuel illustratif" dans l'UI.

**Recommandation :** remplacer par de vraies photos de glaces, ou à défaut masquer le filigrane et ajouter une mention "visuel non contractuel" dans l'alt/description.

---

## 6. Cohérence des catégories

Deux catégories utilisées par des produits mais **absentes** de `mockCategories` :

- **`Apéritifs`** — 5 produits Sweet Family (`bao-bun-poulet boîte 28`, `nems-poulet`, `manchon-poulet`, `ti-nain-morue`, `pizza-vege`)
- **`Glaces`** — 1 produit (`goute-mwen-canne`)

Cela peut créer des filtres/catégorisations cassées côté UI.  
**Recommandation :** ajouter `Apéritifs` et `Glaces` à `mockCategories`, ou reclasser ces produits dans `Snacking`/`Desserts`.

---

## 7. Qualité des alt texts (accessibilité)

Bonne couverture, **aucun alt manquant** côté produit :

- `ProductThumbnail.tsx` construit un alt **contextuel** à 3 niveaux :
  - image produit réelle → `"{productName} proposé par {vendorName}"`
  - visuel partenaire de secours → `"Visuel de {vendorName} utilisé en attendant la photo de {productName}"`
  - aucun visuel → `"Photo de {productName} prochainement disponible"`
- `ImageLightbox` utilise `alt={caption || alt}` avec `aria-label`.
- `nativeImageFallback.ts` complète l'alt en cas d'erreur de chargement (`"... — photo prochainement disponible"`).
- Logos décoratifs utilisent `alt=""` (correct pour images décoratives).

⚠️ Limite : les alt sont basés sur le **nom produit**, pas sur la description — un alt descriptif (ex. "Glace artisanale abricot pays") serait plus utile aux lecteurs d'écran qu'un simple nom. Amélioration optionnelle.

---

## 8. Fichiers orphelins & nettoyage

- **509 fichiers** dans `public/vendors/`, dont **397 non référencés** par le code (legacy `drive-import/`, `gallery-XX.jpg`, `thumbs/`, anciens assets `coco-*`, `ninice-*`, `saveurs-afrique-*`, etc.).
- Aucun fichier < 2 KB suspect (hors SVG fallback 1,6 KB et 2 README).
- Le repo porte ~78 % de poids mort dans `public/vendors/`.

**Recommandation :** nettoyage optionnel après confirmation qu'aucun import dynamique n'utilise ces assets (vérifier scripts de build/import). Gain de poids significatif.

---

## 9. Statuts qualité déclarés (`photoQuality` / `descQuality`)

Seuls 21 produits ont un `photoQuality` renseigné (12 « validée », 9 « à valider ») et 18 un `descQuality` (16 « validée », 2 « à valider »). Les **65 autres n'ont aucun statut** → le workflow de validation qualité n'est pas systématiquement appliqué.

**Recommandation :** systématiser le remplissage de ces champs pour traquer le reste des désaccords (les 4 cas détectés sur 7 ont précisément ces champs vides).

---

## 10. Recommandations priorisées

| Priorité | Action | Cible | Effort |
|---|---|---|---|
| 🔴 P1 | **Corriger les images Ninice** : inverser `WA0070`↔`WA0071` (colombo / moksi végétarien) et auditer toute la série `WA0070`→`WA0080` | `ninice-colombo`, `ninice-moksi-vegetarien` | Faible |
| 🔴 P1 | **Dé-doublonner les Bao Buns** : photo bœuf dédiée ou visuel neutre | 3 produits `bao-boeuf*` | Faible |
| 🔴 P1 | **Corriger l'image `goute-mwen-abricot-pays-ai`** (pochette de jus ≠ glace) ; étendre aux 17 autres visuels IA Gouté Mwen | Gouté Mwen | Moyen |
| 🟠 P2 | **Ajouter les catégories manquantes** `Apéritifs` et `Glaces` à `mockCategories` (ou reclasser) | `mockCatalog.ts` | Faible |
| 🟠 P2 | **Fournir les 18 photos manquantes** (placeholders), surtout les produits *featured* (Filet de poulet, Crevettes, Attiéké) | 18 produits | Moyen |
| 🟡 P3 | Systématiser `photoQuality` / `descQuality` sur les 65 produits non renseignés | Tout le catalogue | Moyen |
| 🟡 P3 | Enrichir les alt texts avec un libellé descriptif (pas seulement le nom) | `ProductThumbnail.tsx` | Faible |
| ℹ️ P4 | Nettoyer les 397 fichiers orphelins de `public/vendors/` | `public/vendors/` | Faible mais à valider |
| ℹ️ P4 | Masquer/renvoyer les visuels IA Gouté Mwen (filigrane visible) | Gouté Mwen | Faible |

---

## 11. Annexe — méthodologie

- Parsing regex de `mockCatalog.ts` (86 produits réels, hors 15 entrées catégories/tags).
- Extraction des références `vendors/...` dans `mockCatalog.ts`, `traiteurs.ts`, `driveReimportAssets.ts`, `partnerAssets.ts`, `partnerProfiles.ts`, `additionalPartnerProfiles.ts` (200 références, 112 chemins uniques).
- Vérification d'existence disque des 112 chemins + détection d'orphelins (différence disque vs référencés).
- Détection de doublons d'image par regroupement inversé image→produits.
- Vérification visuelle (vision) de 7 photos produits (5 planifiés + 2 complémentaires sur Ninice pour confirmer le décalage).
- Aucune écriture sur la branche main ; ce rapport est un fichier non suivi.