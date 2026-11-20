---
name: delikreol-catalog-photo-go
description: Audit and improve DeliKreol product catalog images, vendor logos, portraits, descriptions and merchandising safely. Use for missing/blurry/repeated product photos, partner card design, image optimization, catalog completeness, and GO readiness without inventing real food or stock.
---

# DeliKreol — Catalogue Photo GO

## Mission and non-negotiable rules

Improve the discoverability and trustworthiness of the Martinique catering marketplace while preserving actual vendor identity. **Never claim that a synthetic photo depicts a real menu item.** AI images are allowed only as clearly labelled temporary illustrations with partner approval, not as a substitute for documentary proof. Never fabricate prices, ingredients, allergens, provenance, availability, delivery, opening hours or partner authorizations. Do not change payments, RLS, orders, production data or deployment settings during a photo task.

## Research and evidence hierarchy

1. Confirmed photos supplied by the partner, with permission and product mapping.
2. Photos already stored in the partner's DeliKreol asset folders, manually checked for correct product identity and rights.
3. Licensed documentary/stock images **only for generic category illustration**, with source, licence and clear label.
4. Generated AI illustrations **only as labelled placeholders**, never passed off as real products or vendor portraits.

Use current authoritative references when researching (official Google Search Central image guidance, web.dev Core Web Vitals, W3C WCAG, Schema.org Product, French DGCCRF/Service-Public food allergen and price information, CNIL GDPR). Do not attribute recommendations to an AI school or institution without a specific verifiable source. Human approval remains mandatory for all product identity and factual descriptions.

## Execute on VPS / Codex / Replica

1. Work in `/opt/vlad/projects/DELIKREOL`, inspect `git status`, current branch and origin. **Never overwrite uncommitted user work.** Use a clean worktree from `origin/main` for proposed changes.
2. Run `node scripts/audit-catalog-media.mjs reports/catalog-media-audit.json`, then `node .codex/skills/delikreol-catalog-photo-go/audit-images.mjs`. Read both reports and group defects by vendor and severity.
3. Review all public product images and partner logos separately. Verify actual asset content visually, product match, image permission and mobile cropping. Automated file checks **cannot** validate visual authenticity, licensing or product identity.
4. Prepare a proposal manifest per image: `vendor`, `product_id`, `current_path`, `proposed_path`, `source`, `rights`, `real_or_illustration`, `partner_approved`, `reviewer`, `status`. Only apply approved changes.
5. For verified photos, prepare responsive formats WebP/AVIF if supported, sensible 1:1 product crop and 16:9 hero crop, correct `object-fit`, descriptive alt text, `loading="lazy"` below fold, and stable aspect ratio. Never distort logos: use `object-contain` and ample whitespace. Keep vendor portrait **below** logo and details on listing cards.
6. Confirm product description (what it is, composition, portions, options), allergens and displayed price against partner records. Flag uncertain fields for partner verification, not AI completion.
7. Test keyboard navigation, mobile 390px and desktop, broken images, cumulative layout shift, empty states, product options, basket, and checkout **in sandbox**. Prefer a before/after screenshot comparison and Lighthouse evidence.
8. Run `npm run build`, `npm run typecheck`, relevant tests and `git diff --check`. Report failures honestly; a passing build does not establish commercial GO.
9. Push only after review and approval. Confirm deployment and public images with browser checks. For GO, require separately the 20-order pilot evidence, sandbox payments/webhooks, verified vendor availability, delivery and refunds. See `docs/PILOTE_20_COMMANDES_2026-11-20.md`.

## Quality gates

- **P0:** missing/broken or misleading image, incorrect product/vendor, unapproved portrait, price/allergen mismatch, payment misrepresentation.
- **P1:** low resolution, duplicate imagery across distinct products, placeholder, bad mobile crop, missing alt text, oversized image affecting LCP.
- **P2:** aesthetic consistency, image SEO, better composition, alt wording and thumbnails.

For a production GO, require zero P0, partner sign-off on visible catalog, and independent checkout/delivery acceptance tests. Never report GO from photo audit alone.

## Output

Write a dated JSON audit in `reports/` and a concise Markdown summary with per-vendor backlog, evidence, blockers and tested commit. No private contact data or secrets in reports. This skill is a Codex project skill; it does not install a global agent or grant unattended production permissions.
