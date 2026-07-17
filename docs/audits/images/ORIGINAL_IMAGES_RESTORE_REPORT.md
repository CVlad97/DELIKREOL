# DeliKreol Image Audit - Initial Inventory

Date: 2026-07-17  
Branch: `fix/restore-original-images-20260717`  
Status: inventory completed; unreferenced blurry/placeholder assets removed from the public tree.

## Scope

- Repository scanned: `public/` and `src/`
- Files inventoried: `399` image files
- Exact duplicate hash groups: `4`
- Priority partners audited:
  - Les Delices de Ninice
  - An Tjè Coco
  - Coco's Food
  - Snack Savè Peyi’A
  - Gouté Mwen
  - Sweet Family Traiteur Orianne
  - Saveurs d'Afrique
  - Chef à Mada

## Method

- Scanned all image files with `find`.
- Measured file type, dimensions, size, and SHA-256 hash.
- Cross-checked current references in `src/` for hero, portrait, gallery, logo, poster, cover, thumbnail, and imageUrl fields.
- Checked Git history for the main legacy assets that still exist in the repository.

Full machine-readable manifest:

- `/tmp/delikreol-image-inventory.json`

## Inventory Snapshot

| Partner | Files | Risk level | Notes |
|---|---:|---|---|
| An Tjè Coco | 11 | Medium | Clean assets exist in `public/vendors/an-tje-coco/clean/`; legacy `hero.jpg` and `portrait.jpg` were exact 1x1 JPEG placeholders and have been removed. |
| Coco's Food | 94 | Medium | Rich set of drive-import assets exists; legacy `hero.jpg` and `portrait.jpg` were exact 1x1 JPEG placeholders and have been removed. |
| Les Delices de Ninice | 84 | High | Drive-import assets exist and are used by the frontend; several legacy JPGs were exact 1x1 placeholders and duplicate hashes existed in the gallery set. |
| Snack Savè Peyi’A | 46 | Medium | Drive-import assets exist and are used by the frontend; legacy `hero.jpg` and `portrait.jpg` were exact 1x1 JPEG placeholders and have been removed. |
| Gouté Mwen | 22 | High | Mixed quality assets; low-res PNGs were removed and the legacy hero poster file is no longer in the public tree. |
| Sweet Family Traiteur Orianne | 67 | High | Valid poster/menu assets exist at 1600x1131; legacy `conditions.jpg` was removed and hero/portrait placeholders are no longer in the public tree. |
| Saveurs d'Afrique | 50 | Medium | Drive-import assets are available and used; legacy `hero.jpg` and `portrait.jpg` were removed from the public tree. |
| Chef à Mada | 1 | Medium | Logo exists as a JPEG screenshot-style image, not a transparent SVG/PNG. |

## Exact Duplicate Groups

1. `public/vendors/ninice/thumbs/ninice-03.webp` and `public/vendors/ninice/thumbs/ninice-04.webp`
2. `public/vendors/ninice/thumbs/ninice-10.webp` and `public/vendors/ninice/thumbs/ninice-11.webp`
3. `public/vendors/ninice/gallery-02.jpg` through `public/vendors/ninice/gallery-10.jpg` previously shared the same hash as:
   - `public/vendors/sweet-family/bao-buns.jpg`
   - `public/vendors/sweet-family/cocktails-mignardises.jpg`
   - `public/vendors/sweet-family/conditions.jpg`

## Priority Partner Anomalies

| Partner | Page / route | Current file | Dimensions | Weight | Ratio | Format | State | Original found | Source of original | Action proposed |
|---|---|---|---|---:|---:|---|---|---|---|---|
| Les Delices de Ninice | `/traiteur/ninice`, `/catalogue`, home cards | `public/vendors/ninice/hero.jpg` | 1x1 | 135005 B | square | JPEG | removed | yes | Git history shows legacy introduction in `bbff8dd`, `429068c`, `25df9a4`; current better assets are `public/vendors/ninice/drive-import/drive-01.webp` to `drive-13.webp` | Removed from public tree; keep drive-import assets only |
| Les Delices de Ninice | same | `public/vendors/ninice/portrait.jpg` | 1x1 | 172146 B | square | JPEG | removed | yes | Git history as above; current better assets are drive-import files | Removed from public tree; keep drive-import assets only |
| Les Delices de Ninice | gallery / thumbnails | `public/vendors/ninice/gallery-02.jpg` ... `gallery-10.jpg` | 1x1 | mixed | square | JPEG | removed | not yet proven | Exact hash duplicates with Sweet Family assets | Removed from public tree; keep only if a source can be proven later |
| An Tjè Coco | `/traiteur/an-tje-coco`, cards | `public/vendors/an-tje-coco/hero.jpg` | 1x1 | 173011 B | square | JPEG | removed | yes | Git history shows `3ddab58`, `78b910a`, `856277d`; current clean asset is `public/vendors/an-tje-coco/clean/hero-clean.webp` | Removed from public tree; keep clean asset only |
| An Tjè Coco | same | `public/vendors/an-tje-coco/portrait.jpg` | 1x1 | 97256 B | square | JPEG | removed | yes | Same history as above | Removed from public tree; keep clean asset only |
| Coco's Food | `/traiteur/coco`, cards | `public/vendors/coco/hero.jpg` | 1x1 | 218338 B | square | JPEG | removed | yes | Git history includes `59fcfc1`, `78b910a`, `333acbc`; current better assets are `public/vendors/coco/drive-import/drive-01.webp` and `drive-09.webp` | Removed from public tree; keep drive-import assets only |
| Coco's Food | same | `public/vendors/coco/portrait.jpg` | 1x1 | 102290 B | square | JPEG | removed | yes | Same history as above | Removed from public tree; keep drive-import assets only |
| Snack Savè Peyi’A | `/traiteur/save-peyia`, cards | `public/vendors/save-peyia/hero.jpg` | 1x1 | 564227 B | square | JPEG | removed | yes | Git history includes `28f93fc`, `924c441`; current better assets are `public/vendors/save-peyia/drive-import/drive-01.webp` to `drive-12.webp` | Removed from public tree; keep drive-import assets only |
| Snack Savè Peyi’A | same | `public/vendors/save-peyia/portrait.jpg` | 1x1 | 174022 B | square | JPEG | removed | yes | Git history includes `e79ab70`, `3456237`, `856277d` | Removed from public tree; keep drive-import assets only |
| Saveurs d'Afrique | `/traiteur/saveurs-afrique`, cards | `public/vendors/saveurs-afrique/hero.jpg` | 1x1 | 197600 B | square | JPEG | removed | yes | Git history includes `d4aaddd`, `3456237`, `856277d`; current better assets are `public/vendors/saveurs-afrique/drive-import/drive-02.webp` and `drive-04.webp` | Removed from public tree; keep drive-import assets only |
| Saveurs d'Afrique | same | `public/vendors/saveurs-afrique/portrait.jpg` | 1x1 | 135465 B | square | JPEG | removed | yes | Same history as above | Removed from public tree; keep drive-import assets only |
| Sweet Family Traiteur Orianne | `/traiteur/sweet-family`, cards, legal views | `public/vendors/sweet-family/hero.jpg` | 1x1 | 175465 B | square | JPEG | removed | yes | Git history includes `d4aaddd`, `e79ab70`, `856277d`; current better assets include `public/vendors/sweet-family/drive-import/drive-02.webp` and valid poster assets `cocktails-mignardises-hero.*` | Removed from public tree; keep poster assets for contain-based views only |
| Sweet Family Traiteur Orianne | same | `public/vendors/sweet-family/portrait.jpg` | 1x1 | 87294 B | square | JPEG | removed | yes | Git history includes `67dde50`, `78b910a`, `856277d` | Removed from public tree; keep poster/photo assets only |
| Sweet Family Traiteur Orianne | legal / flyer views | `public/vendors/sweet-family/conditions.jpg` | 1x1 | 4034 B | square | JPEG | removed | no clear proof | Exact hash duplicate of unrelated assets; not a valid public flyer | Removed from public tree; use owner-provided original if this content returns |
| Gouté Mwen | home hero / partner cards | `public/vendors/goute-mwen/hero.jpg` | 1x1 | 157651 B | square | JPEG | removed | yes | Git history includes `a6b4484`, `e91cb5f`, `0ed6276`, `856277d`; current preferred hero is `public/vendors/goute-mwen/product-glacee-groseille.jpg` | Removed from public tree; keep product hero only |
| Gouté Mwen | product / thumbnail candidate | `public/vendors/goute-mwen/cacahuete.jpg` | 305x414 | 326244 B | portrait | PNG | removed | no clear proof | Deleted from public assets because it was low-res and unreferenced in the app | Keep deleted unless the owner provides a verified HD original |
| Gouté Mwen | product / thumbnail candidate | `public/vendors/goute-mwen/choco.jpg` | 601x408 | 575690 B | landscape | PNG | removed | no clear proof | Deleted from public assets because it was low-res and unreferenced in the app | Keep deleted unless the owner provides a verified HD original |
| Chef à Mada | logo / profile | `public/vendors/chef-a-mada/logo.jpg` | 1080x2340 | 401244 B | portrait | JPEG | not ideal for logo | yes | Git history includes `5054cc4` and later photo cleanup commits | Prefer transparent SVG/PNG if a real logo exists; otherwise keep only as a temporary photo |

## Current Frontend Sources Confirmed

- Frontend hero and partner card sources are currently routed through:
  - `src/data/traiteurs.ts`
  - `src/data/mockCatalog.ts`
  - `src/services/vendorsService.ts`
  - `src/pages/new/HomePage.tsx`
  - `src/pages/new/TraiteurDetailPage.tsx`
  - `src/pages/new/ProductDetailPage.tsx`
  - `src/services/catalogImageResolver.ts`
- Current visual behavior on mobile:
  - `Mon espace` is visible in the header.
  - Home and catalogue currently avoid the obvious legacy `thumbs`, `portrait.jpg`, and `hero.jpg` references for the priority partners above.

## Pending Or Unresolved

- No image replacement has been committed in this audit phase yet.
- Exact source proof still needed for:
  - none in the currently removed blurry/placeholder set
- The exact duplicate groups in Ninice and Sweet Family were reduced by removing the non-referenced public assets; remaining duplicates still need manual review if they become live.
- `Chef à Mada` still needs a proper logo asset if a transparent version exists outside the repo.

## Next Step

1. Keep this report as the baseline.
2. Replace only the files with verified originals.
3. Record every replacement with before/after captures.
4. Re-run desktop and mobile validation after each batch.

## Final Validation Update

Date: 2026-07-17

- Code-level image handling was updated to prefer verified originals, preserve logos/posters with `contain`, and keep portrait/food crops stable.
- No verified original image was deleted.
- Removed unreferenced blurry/placeholder assets:
  - `public/vendors/an-tje-coco/hero.jpg`
  - `public/vendors/an-tje-coco/portrait.jpg`
  - `public/vendors/coco/hero.jpg`
  - `public/vendors/coco/portrait.jpg`
  - `public/vendors/save-peyia/hero.jpg`
  - `public/vendors/save-peyia/portrait.jpg`
  - `public/vendors/saveurs-afrique/hero.jpg`
  - `public/vendors/saveurs-afrique/portrait.jpg`
  - `public/vendors/goute-mwen/hero.jpg`
  - `public/vendors/goute-mwen/portrait.jpg`
  - `public/vendors/ninice/hero.jpg`
  - `public/vendors/ninice/portrait.jpg`
  - `public/vendors/ninice/gallery-02.jpg` through `public/vendors/ninice/gallery-10.jpg`
  - `public/vendors/sweet-family/conditions.jpg`
- No new AI-generated or random internet image was introduced.
- Validation passed:
  - `npm run typecheck`
  - `npm run lint`
  - `npm run build`
  - `npm test`
  - `npm run test:e2e`
- Remaining image warnings during Playwright are mostly lazy-loaded/offscreen assets and OSM tiles on the interactive map; visible routes and functional checks completed successfully.
