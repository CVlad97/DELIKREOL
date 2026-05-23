#!/usr/bin/env python3
"""
Prepare des visuels produits "Les Delices de Ninice" pour usage web.

Pipeline:
- correction orientation EXIF
- recadrage center-crop en 4:3
- rendu "catalogue" avec sujet centre, fond floute et ombre douce
- amelioration luminosite/contraste/couleur/nettete
- export JPEG optimisé + WebP
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps


# Mapping aligne avec le menu publie (WhatsApp 23/05).
# On evite les photos hors produit (salade seule / boites fermees non vendeuses).
PRODUCT_SOURCE_MAP: Dict[int, str] = {
    1: "IMG-20260521-WA0071.jpg",  # Colombo des deux rives
    2: "IMG-20260521-WA0070.jpg",  # Moksi Aleisi vegetarien
    3: "IMG-20260521-WA0079.jpg",  # Moksi + poulet
    4: "IMG-20260521-WA0074.jpg",  # Moksi + porc
    5: "IMG-20260521-WA0074.jpg",  # Bami des iles
    6: "IMG-20260521-WA0073.jpg",  # Bara
    7: "IMG-20260521-WA0075.jpg",  # Gulab amande
    8: "IMG-20260521-WA0075.jpg",  # Gulab coco
    9: "IMG-20260521-WA0076.jpg",  # Mini brochette poulet
    10: "IMG-20260521-WA0076.jpg",  # Mini brochette porc
    11: "IMG-20260521-WA0076.jpg",  # Mini brochette boeuf
}


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
    # Ajustements legers pour rester naturels.
    image = ImageOps.autocontrast(image, cutoff=1)
    image = ImageEnhance.Brightness(image).enhance(1.03)
    image = ImageEnhance.Contrast(image).enhance(1.10)
    image = ImageEnhance.Color(image).enhance(1.11)
    image = ImageEnhance.Sharpness(image).enhance(1.12)
    return image


def _top_glow(size: Tuple[int, int]) -> Image.Image:
    w, h = size
    glow = Image.new("L", size, 0)
    draw = ImageDraw.Draw(glow)
    for y in range(h):
        # Plus lumineux en haut, puis transparence progressive.
        t = max(0.0, 1.0 - (y / max(1, h - 1)))
        a = int(58 * (t ** 1.6))
        if a:
            draw.line((0, y, w, y), fill=a)
    return glow


def render_catalog_image(image: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
    base = ImageOps.fit(image, target_size, Image.Resampling.LANCZOS)
    base = enhance(base)

    # Full-frame: on conserve la photo en plein format, on adoucit juste les bords.
    blur = base.filter(ImageFilter.GaussianBlur(radius=max(4, int(min(target_size) * 0.009))))

    mask = Image.new("L", target_size, 0)
    draw = ImageDraw.Draw(mask)
    margin_w = int(target_size[0] * 0.07)
    margin_h = int(target_size[1] * 0.08)
    draw.ellipse(
        (
            margin_w,
            margin_h,
            target_size[0] - margin_w,
            target_size[1] - margin_h,
        ),
        fill=255,
    )
    mask = mask.filter(ImageFilter.GaussianBlur(radius=max(20, int(min(target_size) * 0.035))))
    out = Image.composite(base, blur, mask).convert("RGBA")

    # Leger glow en haut pour un rendu plus premium.
    glow = Image.new("RGBA", target_size, (255, 255, 255, 0))
    glow.putalpha(_top_glow(target_size))
    out = Image.alpha_composite(out, glow)

    # Vignette subtile pour guider le regard.
    vignette = Image.new("L", target_size, 255)
    vdraw = ImageDraw.Draw(vignette)
    margin = int(min(target_size) * 0.01)
    vdraw.ellipse((margin, margin, target_size[0] - margin, target_size[1] - margin), fill=230)
    vignette = vignette.filter(ImageFilter.GaussianBlur(radius=max(10, int(min(target_size) * 0.03))))
    out_rgb = out.convert("RGB")
    out_rgb = ImageChops.multiply(out_rgb, Image.merge("RGB", (vignette, vignette, vignette)))

    return out_rgb


def process_image(src: Path, out_dir: Path, index: int) -> List[Path]:
    with Image.open(src) as original:
        img = ImageOps.exif_transpose(original).convert("RGB")
        img = center_crop_to_ratio(img, (4, 3))

        outputs: List[Path] = []
        rendered_targets: Dict[str, Image.Image] = {}

        for target in TARGETS:
            rendered = render_catalog_image(img, target.size)
            rendered_targets[target.suffix] = rendered

            base_name = f"ninice-{index:02d}-{target.suffix}"
            jpg_path = out_dir / f"{base_name}.jpg"
            webp_path = out_dir / f"{base_name}.webp"

            rendered.save(
                jpg_path,
                format="JPEG",
                quality=88,
                optimize=True,
                progressive=True,
                subsampling="4:2:0",
            )
            rendered.save(
                webp_path,
                format="WEBP",
                quality=86,
                method=6,
            )
            outputs.extend([jpg_path, webp_path])

        # Showcase = version card renforcee pour hero/preview.
        showcase = rendered_targets["card"].resize((1600, 1200), Image.Resampling.LANCZOS)
        showcase = ImageEnhance.Contrast(showcase).enhance(1.04)
        showcase = ImageEnhance.Sharpness(showcase).enhance(1.10)
        showcase_path = out_dir / f"ninice-{index:02d}-showcase.jpg"
        showcase.save(
            showcase_path,
            format="JPEG",
            quality=90,
            optimize=True,
            progressive=True,
            subsampling="4:2:0",
        )
        outputs.append(showcase_path)

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
    for i in range(1, 12):
        filename = PRODUCT_SOURCE_MAP[i]
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
