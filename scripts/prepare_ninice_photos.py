#!/usr/bin/env python3
"""
Prépare des visuels produits "Les Delices de Ninice" pour usage web.

Pipeline:
- correction orientation EXIF
- recadrage center-crop en 4:3
- légère amélioration luminosité/contraste/couleur/netteté
- export JPEG optimisé + WebP
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Iterable, List, Tuple

from PIL import Image, ImageEnhance, ImageOps


SOURCE_FILES = [
    "IMG-20260521-WA0070.jpg",
    "IMG-20260521-WA0071.jpg",
    "IMG-20260521-WA0072.jpg",
    "IMG-20260521-WA0073.jpg",
    "IMG-20260521-WA0074.jpg",
    "IMG-20260521-WA0075.jpg",
    "IMG-20260521-WA0076.jpg",
    "IMG-20260521-WA0077.jpg",
    "IMG-20260521-WA0078.jpg",
    "IMG-20260521-WA0079.jpg",
    "IMG-20260521-WA0080.jpg",
]


@dataclass(frozen=True)
class RenderTarget:
    suffix: str
    size: Tuple[int, int]


TARGETS = [
    RenderTarget(suffix="card", size=(1600, 1200)),
    RenderTarget(suffix="thumb", size=(800, 600)),
]


def center_crop_to_ratio(image: Image.Image, ratio: Tuple[int, int]) -> Image.Image:
    target_w, target_h = ratio
    src_w, src_h = image.size
    src_ratio = src_w / src_h
    dst_ratio = target_w / target_h

    if src_ratio > dst_ratio:
        new_w = int(src_h * dst_ratio)
        left = (src_w - new_w) // 2
        box = (left, 0, left + new_w, src_h)
    else:
        new_h = int(src_w / dst_ratio)
        top = (src_h - new_h) // 2
        box = (0, top, src_w, top + new_h)

    return image.crop(box)


def enhance(image: Image.Image) -> Image.Image:
    # Ajustements légers pour rester naturels.
    image = ImageEnhance.Brightness(image).enhance(1.04)
    image = ImageEnhance.Contrast(image).enhance(1.12)
    image = ImageEnhance.Color(image).enhance(1.08)
    image = ImageEnhance.Sharpness(image).enhance(1.16)
    return image


def process_image(src: Path, out_dir: Path, index: int) -> List[Path]:
    with Image.open(src) as original:
        img = ImageOps.exif_transpose(original).convert("RGB")
        img = center_crop_to_ratio(img, (4, 3))
        img = enhance(img)

        outputs: List[Path] = []
        for target in TARGETS:
            resized = img.resize(target.size, Image.Resampling.LANCZOS)
            base = f"ninice-{index:02d}-{target.suffix}"
            jpg_path = out_dir / f"{base}.jpg"
            webp_path = out_dir / f"{base}.webp"

            resized.save(
                jpg_path,
                format="JPEG",
                quality=86,
                optimize=True,
                progressive=True,
                subsampling="4:2:0",
            )
            resized.save(
                webp_path,
                format="WEBP",
                quality=84,
                method=6,
            )
            outputs.extend([jpg_path, webp_path])

        return outputs


def generate_readme(out_dir: Path, pairs: Iterable[Tuple[str, str]]) -> None:
    lines = [
        "# Les Delices de Ninice - Images Produits",
        "",
        "Images retouchées automatiquement pour le catalogue DELIKREOL.",
        "",
        "| Source WhatsApp | Image catalogue (JPEG) |",
        "|---|---|",
    ]
    for src_name, out_name in pairs:
        lines.append(f"| `{src_name}` | `/vendors/ninice/{out_name}` |")

    (out_dir / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    source_dir = Path("/sdcard/Pictures/WhatsApp")
    out_dir = Path("/root/DELIKREOL/public/vendors/ninice")
    out_dir.mkdir(parents=True, exist_ok=True)

    mapping: List[Tuple[str, str]] = []
    for i, filename in enumerate(SOURCE_FILES, start=1):
        src = source_dir / filename
        if not src.exists():
            print(f"[WARN] fichier absent: {src}")
            continue
        outputs = process_image(src, out_dir, i)
        jpg_card = next((path.name for path in outputs if path.name.endswith("-card.jpg")), None)
        if jpg_card:
            mapping.append((filename, jpg_card))
        print(f"[OK] {filename} -> {len(outputs)} fichiers")

    generate_readme(out_dir, mapping)
    print(f"[DONE] export: {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
