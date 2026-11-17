---
name: delikreol-catalogue-vision-audit
description: Audit a DELIKREOL caterer catalogue against source emails, WhatsApp messages, menus, price lists, and product images. Use when checking or preparing a partner catalogue, verifying dish photos and menu prices, comparing published pages with vendor documents, or deciding whether an item is ready to publish.
---

# DELIKREOL Catalogue Vision Audit

## Goal

Verify every catalogue row against the latest partner-provided evidence, inspect product images visually, and compare the public partner page with the source menu. Produce an evidence-based audit that clearly separates confirmed facts, preview data, and missing information.

## Workflow

1. **Resolve the partner and source set**
   - Identify the partner, public profile URL, and the exact task scope.
   - Search connected email, Drive, WhatsApp exports, and Library files for the partner and menu.
   - Read the full relevant message/thread and each menu or price attachment. Record sender, date, filename, and whether the content is vendor-submitted, vendor-confirmed, or an AI draft forwarded by the vendor.
   - Prefer the latest explicit vendor correction for a field. Keep older values visible in the audit when they conflict. Do not treat an AI-generated proposal as a confirmed price unless the vendor explicitly adopts it.

2. **Build the source menu**
   - Extract each product name, variant, portion or weight, price, price unit, category, and any included components.
   - Preserve unit pricing such as €/100 g. Never compare a per-weight price with a fixed-portion price as if they were equivalent.
   - Mark missing values as unknown. Do not infer a portion, price, availability, or recipe from a photo.

3. **Inspect every candidate image with vision**
   - Read images as pixels; do not rely on filenames or OCR alone.
   - For each image, record the likely dish, confidence, whether it is an actual food photo, visible match to the product, image clarity/crop, and any mismatch or uncertainty.
   - Reject screenshots, logos, unrelated dishes, generic stock images, generated images presented as real food, and images whose subject cannot be identified.
   - Do not publish a product image as authentic unless the image visibly matches the item and its provenance is suitable. Never use a screenshot of a menu or phone as a product photo.
   - If no usable image exists, report “photo missing” and keep a clear placeholder. Do not fabricate a product photo.

4. **Compare the source with the live catalogue**
   - Run `scripts/audit_catalogue.py` against a JSON snapshot containing source and live product rows. Read the script's output; it checks names, duplicates, prices, units, missing/extra products, and photo-file presence.
   - Treat the script as a deterministic cross-check, not a substitute for reading the source or visually inspecting photos.
   - Open the public partner page in a clean browser tab. Wait for asynchronous catalogue loading to finish, then inspect the page visually and read the rendered product names, prices, units, photos/placeholders, availability controls, and page title.
   - If the first view shows “not found”, zero products, or a loading state, wait and reload once with a cache-busting query. Then reopen the clean URL and confirm its final rendered state. Do not report a successful check from the initial loading frame.
   - Check that an “à confirmer” preview does not present products as orderable. Confirm that all item prices and weight units match the current vendor source.

5. **Classify and act**
   - Assign each row one status: `MATCH`, `PRICE MISMATCH`, `UNIT MISMATCH`, `MISSING ON SITE`, `EXTRA ON SITE`, `PHOTO MISSING`, `PHOTO MISMATCH`, or `NEEDS HUMAN CONFIRMATION`.
   - Never silently change the menu, prices, units, availability, or partner identity based on uncertain evidence.
   - When the user asks for a correction or publication, make only changes supported by source evidence and their explicit instruction. Preserve preview-only/order-disabled behavior when the partner has not confirmed opening and availability.
   - After any change, reopen the exact clean public URL and inspect the final rendered result, including photo and price. Report any unresolved checks separately.

## Audit output

Return a compact table with one row per menu item: source name and price/unit, live name and price/unit, photo filename or placeholder, visual match/confidence, status, and evidence. Add a short summary naming the source sender/date, the public URL, the number of checked rows, and all blockers. Cite exact email, Drive, or Library items with their accessible links where available. Never claim a photo or price was verified when it was not.

## Input format for the comparison script

Use JSON with `source_products` and `live_products` arrays. Each row requires `name`, `price`, and `unit`; `image` and `vision_review` are optional. Example:

```json
{
  "partner": "Example Caterer",
  "source": "Vendor email, 2026-10-22",
  "source_products": [{"name": "Dish (250 g)", "price": "15,00", "unit": "250 g"}],
  "live_products": [{"name": "Dish (250 g)", "price": "15.00", "unit": "250 g", "image": "/vendors/example/dish.jpg", "vision_review": "matches dish, high confidence"}]
}
```
