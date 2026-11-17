#!/usr/bin/env python3
"""Compare a DELIKREOL source menu with a public catalogue snapshot.

Usage: python3 audit_catalogue.py input.json [--output report.md]
The script verifies names/aliases, price, unit, duplicates, and image-file presence.
Visual dish matching remains a model/human vision check recorded in vision_review.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
import sys
import unicodedata
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.parse import urlparse

IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"}


def norm(value: object) -> str:
    text = unicodedata.normalize("NFKD", str(value or "").casefold())
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    return " ".join(re.sub(r"[^a-z0-9]+", " ", text).split())


def keys(row: dict) -> set[str]:
    values = [row.get("name", ""), *row.get("aliases", [])]
    return {key for value in values if (key := norm(value))}


def parse_price(value: object) -> Decimal | None:
    if value is None:
        return None
    raw = str(value).strip().replace("\u00a0", " ")
    match = re.search(r"-?\d+(?:[,.]\d{1,2})?", raw.replace(" ", ""))
    if not match:
        return None
    try:
        return Decimal(match.group(0).replace(",", ".")).quantize(Decimal("0.01"))
    except InvalidOperation:
        return None


def norm_unit(value: object) -> str:
    text = norm(value)
    text = re.sub(r"\b(grammes|gramme|gr|g)\b", "g", text)
    text = re.sub(r"\b(pieces|piece|pcs)\b", "piece", text)
    return re.sub(r"\s+", "", text)


def image_status(row: dict) -> tuple[str, str]:
    image = str(row.get("image") or "").strip()
    if not image:
        return "PHOTO MISSING", ""
    lowered = image.casefold()
    if any(token in lowered for token in ("placeholder", "photo-a-confirmer", "photo-a-venir", "_fallback")):
        return "PHOTO MISSING", image
    parsed = urlparse(image)
    path = Path(parsed.path if parsed.scheme else image)
    if path.suffix.casefold() not in IMAGE_EXTENSIONS:
        return "NEEDS HUMAN CONFIRMATION", image
    if parsed.scheme in ("http", "https"):
        return "NEEDS VISUAL REVIEW", image
    if not path.is_file():
        return "IMAGE FILE NOT FOUND", image
    digest = hashlib.sha256(path.read_bytes()).hexdigest()
    return "IMAGE FILE PRESENT", f"{image} (sha256:{digest[:12]})"


def duplicates(rows: list[dict]) -> set[str]:
    seen: set[str] = set()
    repeated: set[str] = set()
    for row in rows:
        key = norm(row.get("name"))
        if key in seen:
            repeated.add(key)
        seen.add(key)
    return repeated


def audit(data: dict) -> tuple[str, int]:
    source = data.get("source_products", [])
    live = data.get("live_products", [])
    if not isinstance(source, list) or not isinstance(live, list):
        raise ValueError("source_products et live_products doivent être des listes")

    source_dupes, live_dupes = duplicates(source), duplicates(live)
    issues = 0
    lines = [
        f"# Audit catalogue — {data.get('partner', 'partenaire non précisé')}",
        "",
        f"- Source : {data.get('source', 'non précisée')}",
        f"- Lignes source : {len(source)}",
        f"- Lignes publiques : {len(live)}",
        "",
        "| Produit source | Prix / unité source | Produit public | Prix / unité public | Photo | Contrôle visuel | Statut |",
        "|---|---:|---|---:|---|---|---|",
    ]

    for item in source:
        item_keys = keys(item)
        candidates = [row for row in live if item_keys & keys(row)]
        if len(candidates) != 1:
            status = "MISSING ON SITE" if not candidates else "NEEDS HUMAN CONFIRMATION (ambiguous alias)"
            issues += 1
            live_row = candidates[0] if candidates else {}
        else:
            live_row = candidates[0]
            statuses = []
            sp, lp = parse_price(item.get("price")), parse_price(live_row.get("price"))
            if sp is None or lp is None:
                statuses.append("NEEDS HUMAN CONFIRMATION (price unreadable)")
                issues += 1
            elif sp != lp:
                statuses.append("PRICE MISMATCH")
                issues += 1
            if norm_unit(item.get("unit")) != norm_unit(live_row.get("unit")):
                statuses.append("UNIT MISMATCH")
                issues += 1
            if norm(item.get("name")) in source_dupes or norm(live_row.get("name")) in live_dupes:
                statuses.append("DUPLICATE NAME")
                issues += 1
            status = ", ".join(statuses) if statuses else "MATCH"

        photo_state, photo_label = image_status(live_row)
        visual = str(live_row.get("vision_review") or "NOT VISUALLY CHECKED")
        lines.append("| " + " | ".join([
            str(item.get("name", "")),
            f"{item.get('price', '?')} / {item.get('unit', '?')}",
            str(live_row.get("name", "—")),
            f"{live_row.get('price', '?')} / {live_row.get('unit', '?')}",
            f"{photo_state}: {photo_label or 'aucun fichier'}",
            visual,
            status,
        ]) + " |")

    source_keys = set().union(*(keys(row) for row in source)) if source else set()
    for row in live:
        if keys(row) and not (source_keys & keys(row)):
            issues += 1
            photo_state, photo_label = image_status(row)
            lines.append("| — | — | " + " | ".join([
                str(row.get("name", "")),
                f"{row.get('price', '?')} / {row.get('unit', '?')}",
                f"{photo_state}: {photo_label or 'aucun fichier'}",
                str(row.get("vision_review") or "NOT VISUALLY CHECKED"),
                "EXTRA ON SITE",
            ]) + " |")

    lines.extend([
        "",
        f"**Résultat texte/prix/unités : {'À CORRIGER' if issues else 'CONFORME'}** — {issues} anomalie(s) de catalogue.",
        "**Rappel :** le statut de fichier image ne confirme pas son sujet. Examiner chaque photo avec vision.",
        "",
    ])
    return "\n".join(lines), issues


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="Fichier JSON d'entrée")
    parser.add_argument("--output", type=Path, help="Écrire le rapport Markdown dans ce fichier")
    args = parser.parse_args()
    try:
        data = json.loads(args.input.read_text(encoding="utf-8"))
        report, issues = audit(data)
    except (OSError, json.JSONDecodeError, ValueError) as exc:
        print(f"Erreur : {exc}", file=sys.stderr)
        return 2
    if args.output:
        args.output.write_text(report, encoding="utf-8")
    print(report)
    return 1 if issues else 0


if __name__ == "__main__":
    raise SystemExit(main())
