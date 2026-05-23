#!/usr/bin/env python3
"""
Génère des photos produits "showcase" stables pour Ninice.

Pipeline:
- mise en valeur du sujet central
- atténuation visuelle du fond via masque doux
- composition sur fond studio clair
"""

from __future__ import annotations

from pathlib import Path
from typing import Iterable

import cv2
import numpy as np


SOURCE_DIR = Path("/root/DELIKREOL/public/vendors/ninice")
FILES = [f"ninice-{i:02d}-card.jpg" for i in range(1, 12)]


def build_gradient_bg(h: int, w: int) -> np.ndarray:
    top = np.array([255, 249, 244], dtype=np.float32)
    bottom = np.array([255, 237, 220], dtype=np.float32)
    t = np.linspace(0.0, 1.0, h, dtype=np.float32)[:, None, None]
    bg = top * (1.0 - t) + bottom * t
    return np.repeat(bg, w, axis=1).astype(np.uint8)


def soft_showcase_mask(image_bgr: np.ndarray) -> np.ndarray:
    h, w = image_bgr.shape[:2]
    mask = np.zeros((h, w), dtype=np.uint8)
    x1, x2 = int(w * 0.07), int(w * 0.93)
    y1, y2 = int(h * 0.07), int(h * 0.90)
    radius = int(min(h, w) * 0.12)
    cv2.rectangle(mask, (x1 + radius, y1), (x2 - radius, y2), 255, -1)
    cv2.rectangle(mask, (x1, y1 + radius), (x2, y2 - radius), 255, -1)
    cv2.circle(mask, (x1 + radius, y1 + radius), radius, 255, -1)
    cv2.circle(mask, (x2 - radius, y1 + radius), radius, 255, -1)
    cv2.circle(mask, (x1 + radius, y2 - radius), radius, 255, -1)
    cv2.circle(mask, (x2 - radius, y2 - radius), radius, 255, -1)
    return cv2.GaussianBlur(mask, (0, 0), sigmaX=16, sigmaY=16)


def enhance_subject(image_bgr: np.ndarray) -> np.ndarray:
    img = image_bgr.astype(np.float32)
    img = np.clip((img - 127.5) * 1.12 + 127.5, 0, 255)  # contraste
    img = np.clip(img * 1.05, 0, 255)  # luminosité
    sharpen = cv2.GaussianBlur(img, (0, 0), 1.2)
    img = cv2.addWeighted(img, 1.14, sharpen, -0.14, 0)
    return np.clip(img, 0, 255).astype(np.uint8)


def compose_showcase(image_bgr: np.ndarray, mask: np.ndarray) -> np.ndarray:
    h, w = image_bgr.shape[:2]
    bg = build_gradient_bg(h, w).astype(np.float32)
    subject = enhance_subject(image_bgr).astype(np.float32)
    alpha = (mask.astype(np.float32) / 255.0)[..., None]

    # Ombre subtile.
    shadow = cv2.GaussianBlur(mask, (0, 0), sigmaX=16, sigmaY=16).astype(np.float32) / 255.0
    shadow = np.roll(shadow, shift=max(8, int(h * 0.015)), axis=0)
    shadow = shadow[..., None]
    bg = bg * (1.0 - shadow * 0.22)

    out = subject * alpha + bg * (1.0 - alpha)
    return np.clip(out, 0, 255).astype(np.uint8)


def process(path: Path) -> None:
    image = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if image is None:
        print(f"[WARN] lecture impossible: {path.name}")
        return

    mask = soft_showcase_mask(image)
    showcase = compose_showcase(image, mask)

    out_path = path.with_name(path.name.replace("-card.jpg", "-showcase.jpg"))
    cv2.imwrite(str(out_path), showcase, [int(cv2.IMWRITE_JPEG_QUALITY), 88, int(cv2.IMWRITE_JPEG_OPTIMIZE), 1])
    print(f"[OK] {path.name} -> {out_path.name}")


def main(files: Iterable[str]) -> int:
    for filename in files:
        process(SOURCE_DIR / filename)
    print("[DONE] showcase images updated.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main(FILES))
