#!/usr/bin/env python3
"""
Prepare des visuels produits "Les Delices de Ninice" pour usage web.

Pipeline:
- correction orientation EXIF
- recadrage center-crop en 4:3
- detourage automatique (fond retire) via rembg
- composition sur fond propre avec ombre douce
- amelioration luminosite/contraste/couleur/nettete
- export JPEG optimise + WebP + PNG detoure
"""

from __future__ import annotations

import io
from dataclasses import dataclass
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

from PIL import Image, ImageChops, ImageDraw, ImageEnhance, ImageFilter, ImageOps
from rembg import new_session, remove


@dataclass(frozen=True)
class ProductSpec:
    index: int
    slug: str
    label: str
    price_eur: float
    source_file: str


# Mapping valide contre la conversation WhatsApp du 23/05.
PRODUCT_SPECS: List[ProductSpec] = [
    ProductSpec(1, "colombo-deux-rives", "Le Colombo des Deux Rives", 14.00, "IMG-20260521-WA0071.jpg"),
    ProductSpec(2, "moksi-veg", "Le Moksi Aleisi Vegetarien", 7.00, "IMG-20260521-WA0070.jpg"),
    ProductSpec(3, "moksi-poulet", "Le Moksi Aleisi + Poulet", 10.50, "IMG-20260521-WA0070.jpg"),
    ProductSpec(4, "moksi-porc", "Le Moksi Aleisi + Porc", 11.50, "IMG-20260521-WA0070.jpg"),
    ProductSpec(5, "bami-iles", "Bami des Iles", 14.00, "IMG-20260521-WA0074.jpg"),
    ProductSpec(6, "bara-signature", "Bara + sauce signature", 1.80, "IMG-20260521-WA0073.jpg"),
    ProductSpec(7, "gulab-amande", "Gulab Jamun Amande", 0.80, "IMG-20260521-WA0075.jpg"),
    ProductSpec(8, "gulab-coco", "Gulab Jamun Coco", 0.80, "IMG-20260521-WA0075.jpg"),
    ProductSpec(9, "mini-brochette-poulet", "Mini brochette Saoto Poulet", 2.50, "IMG-20260521-WA0076.jpg"),
    ProductSpec(10, "mini-brochette-porc", "Mini brochette Saoto Porc", 3.00, "IMG-20260521-WA0076.jpg"),
    ProductSpec(11, "mini-brochette-boeuf", "Mini brochette Saoto Boeuf", 3.50, "IMG-20260521-WA0076.jpg"),
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
    # Ajustements legers pour rester naturels.
    image = ImageOps.autocontrast(image, cutoff=1)
    image = ImageEnhance.Brightness(image).enhance(1.03)
    image = ImageEnhance.Contrast(image).enhance(1.10)
    image = ImageEnhance.Color(image).enhance(1.11)
    image = ImageEnhance.Sharpness(image).enhance(1.12)
    return image


def remove_background_rgba(image_rgb: Image.Image, session) -> Image.Image:
    buf = io.BytesIO()
    image_rgb.save(buf, format="PNG")
    out = remove(buf.getvalue(), session=session)
    fg = Image.open(io.BytesIO(out)).convert("RGBA")
    alpha = fg.getchannel("A").filter(ImageFilter.MedianFilter(size=3))

    def _remap(a: int) -> int:
        if a <= 56:
            return 0
        if a >= 170:
            return 255
        return int((a - 56) * 255 / (170 - 56))

    alpha = alpha.point(_remap)
    alpha = alpha.filter(ImageFilter.GaussianBlur(radius=0.5))
    fg.putalpha(alpha)
    return fg


def trim_transparent(image_rgba: Image.Image, padding: int = 14) -> Image.Image:
    alpha = image_rgba.getchannel("A")
    bbox = alpha.getbbox()
    if bbox is None:
        return image_rgba
    left = max(0, bbox[0] - padding)
    top = max(0, bbox[1] - padding)
    right = min(image_rgba.width, bbox[2] + padding)
    bottom = min(image_rgba.height, bbox[3] + padding)
    return image_rgba.crop((left, top, right, bottom))


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


def build_gradient_bg(size: Tuple[int, int]) -> Image.Image:
    w, h = size
    bg = Image.new("RGB", size, (255, 249, 241))
    draw = ImageDraw.Draw(bg)
    for y in range(h):
        t = y / max(1, h - 1)
        r = int(255 - (255 - 248) * t)
        g = int(249 - (249 - 236) * t)
        b = int(241 - (241 - 224) * t)
        draw.line((0, y, w, y), fill=(r, g, b))
    return bg


def render_catalog_image(fg_rgba: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
    bg = build_gradient_bg(target_size).convert("RGBA")

    fit_w = int(target_size[0] * 0.82)
    fit_h = int(target_size[1] * 0.78)
    fg = trim_transparent(fg_rgba, padding=12)
    fg = ImageOps.contain(fg, (fit_w, fit_h), Image.Resampling.LANCZOS)

    # Ombre douce.
    shadow_pad = max(18, int(min(target_size) * 0.02))
    shadow = Image.new("RGBA", (fg.width + shadow_pad * 2, fg.height + shadow_pad * 2), (0, 0, 0, 0))
    sh_mask = fg.getchannel("A")
    sh_mask = sh_mask.filter(ImageFilter.GaussianBlur(radius=max(10, int(min(target_size) * 0.015))))
    sh_layer = Image.new("RGBA", fg.size, (0, 0, 0, 105))
    sh_layer.putalpha(sh_mask)
    shadow.alpha_composite(sh_layer, (shadow_pad, shadow_pad))

    # Leger glow en haut pour un rendu plus premium.
    glow = Image.new("RGBA", target_size, (255, 255, 255, 0))
    glow.putalpha(_top_glow(target_size))

    x = (target_size[0] - fg.width) // 2
    y = (target_size[1] - fg.height) // 2

    out = bg.copy()
    out.alpha_composite(shadow, (x - shadow_pad + 4, y - shadow_pad + 9))
    out.alpha_composite(fg, (x, y))
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


def render_fullframe_image(image_rgb: Image.Image, target_size: Tuple[int, int]) -> Image.Image:
    base = ImageOps.fit(image_rgb, target_size, Image.Resampling.LANCZOS)
    base = enhance(base)
    blur = base.filter(ImageFilter.GaussianBlur(radius=max(4, int(min(target_size) * 0.01))))
    mask = Image.new("L", target_size, 0)
    draw = ImageDraw.Draw(mask)
    mw = int(target_size[0] * 0.08)
    mh = int(target_size[1] * 0.10)
    draw.ellipse((mw, mh, target_size[0] - mw, target_size[1] - mh), fill=255)
    mask = mask.filter(ImageFilter.GaussianBlur(radius=max(18, int(min(target_size) * 0.03))))
    out = Image.composite(base, blur, mask).convert("RGBA")
    glow = Image.new("RGBA", target_size, (255, 255, 255, 0))
    glow.putalpha(_top_glow(target_size))
    out = Image.alpha_composite(out, glow)
    return out.convert("RGB")


def process_image(src: Path, out_dir: Path, index: int, session) -> List[Path]:
    with Image.open(src) as original:
        img = ImageOps.exif_transpose(original).convert("RGB")
        img = center_crop_to_ratio(img, (4, 3))
        img = enhance(img)
        fg_rgba = remove_background_rgba(img, session=session)
        alpha = fg_rgba.getchannel("A")
        alpha_hist = alpha.histogram()
        coverage = (sum(alpha_hist[1:])) / (img.width * img.height)
        cutout = trim_transparent(fg_rgba, padding=4)
        fallback_fullframe = coverage < 0.10 or cutout.width < 220 or cutout.height < 220

        outputs: List[Path] = []
        rendered_targets: Dict[str, Image.Image] = {}

        if not fallback_fullframe:
            cutout_path = out_dir / f"ninice-{index:02d}-cutout.png"
            cutout.save(cutout_path, format="PNG", optimize=True)
            outputs.append(cutout_path)

        for target in TARGETS:
            if fallback_fullframe:
                rendered = render_fullframe_image(img, target.size)
            else:
                rendered = render_catalog_image(fg_rgba, target.size)
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


def generate_readme(out_dir: Path, rows: Iterable[Tuple[ProductSpec, str]]) -> None:
    lines = [
        "# Les Delices de Ninice - Images Produits",
        "",
        "Images retouchees automatiquement pour le catalogue DELIKREOL.",
        "Fonds retires + composition catalogue propre.",
        "",
        "| Produit | Prix (EUR) | Source WhatsApp | Image catalogue (JPEG) |",
        "|---|---:|---|---|",
    ]
    for spec, out_name in rows:
        lines.append(
            f"| {spec.label} | {spec.price_eur:.2f} | `{spec.source_file}` | `/vendors/ninice/{out_name}` |"
        )

    (out_dir / "README.md").write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    source_dir = Path("/sdcard/Pictures/WhatsApp")
    out_dir = Path("/root/DELIKREOL/public/vendors/ninice")
    out_dir.mkdir(parents=True, exist_ok=True)

    session = new_session("u2netp")

    mapping: List[Tuple[ProductSpec, str]] = []
    for spec in PRODUCT_SPECS:
        src = source_dir / spec.source_file
        if not src.exists():
            print(f"[WARN] fichier absent: {src}")
            continue
        outputs = process_image(src, out_dir, spec.index, session=session)
        jpg_card = next((path.name for path in outputs if path.name.endswith("-card.jpg")), None)
        if jpg_card:
            mapping.append((spec, jpg_card))
        print(f"[OK] {spec.source_file} -> ninice-{spec.index:02d} ({len(outputs)} fichiers)")

    generate_readme(out_dir, mapping)
    print(f"[DONE] export: {out_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
