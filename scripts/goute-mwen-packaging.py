#!/usr/bin/env python3
"""
Gouté Mwen — Packaging uniforme avec parfums et fruits associés.
Chaque vignette a le même design : fond couleur, logo GM, nom du parfum, fruits.
"""
import os, math
from PIL import Image, ImageDraw, ImageFont

SRC = '/workspace/DELIKREOL/public/vendors/goute-mwen'
OUT = '/workspace/DELIKREOL/public/vendors/goute-mwen'
SIZE = 800

# ── Définition des parfums ──────────────────────────────────
FLAVORS = {
    'abricot-pays.jpg': {
        'name': 'ABRICOT PAYS',
        'bg': (255, 140, 50),    # Orange abricot
        'badge': (200, 80, 30),
        'fruits': ['abricot'],
    },
    'ananas.jpg': {
        'name': 'ANANAS',
        'bg': (255, 200, 50),    # Jaune ananas
        'badge': (200, 150, 20),
        'fruits': ['ananas'],
    },
    'api.jpg': {
        'name': 'API (MIEL)',
        'bg': (255, 180, 60),    # Jaune miel
        'badge': (180, 120, 30),
        'fruits': ['miel'],
    },
    'avocat-basi.jpg': {
        'name': 'AVOCAT BASI',
        'bg': (80, 160, 60),     # Vert avocat
        'badge': (50, 120, 40),
        'fruits': ['avocat'],
    },
    'canne.jpg': {
        'name': 'CANNE (SS)',
        'bg': (140, 180, 80),    # Vert canne
        'badge': (90, 130, 50),
        'fruits': ['canne'],
    },
    'citronnade.jpg': {
        'name': 'CITRONNADE',
        'bg': (200, 220, 50),    # Jaune citron
        'badge': (160, 180, 20),
        'fruits': ['citron'],
    },
    'cocktail.jpg': {
        'name': 'COCKTAIL',
        'bg': (255, 100, 100),   # Rouge cocktail
        'badge': (200, 50, 50),
        'fruits': ['cocktail'],
    },
    'corossol.jpg': {
        'name': 'COROSSOL',
        'bg': (160, 200, 100),   # Vert pâle corossol
        'badge': (100, 150, 60),
        'fruits': ['corossol'],
    },
    'kumquat.jpg': {
        'name': 'KUMQUAT',
        'bg': (255, 180, 40),    # Orange kumquat
        'badge': (200, 120, 20),
        'fruits': ['kumquat'],
    },
    'mandarine.jpg': {
        'name': 'MANDARINE',
        'bg': (255, 160, 50),    # Orange mandarine
        'badge': (200, 110, 30),
        'fruits': ['mandarine'],
    },
    'mangue.jpg': {
        'name': 'MANGUE',
        'bg': (255, 200, 60),    # Jaune mangue
        'badge': (220, 160, 30),
        'fruits': ['mangue'],
    },
    'maracuja.jpg': {
        'name': 'MARACUJA',
        'bg': (255, 180, 40),    # Orange maracuja
        'badge': (200, 120, 20),
        'fruits': ['maracuja'],
    },
    'pasteque.jpg': {
        'name': 'PASTÈQUE / ANIS',
        'bg': (220, 60, 60),     # Rouge pastèque
        'badge': (200, 50, 50),
        'fruits': ['pasteque', 'anis'],
    },
    'pomme-liane.jpg': {
        'name': 'POMME LIANE',
        'bg': (180, 220, 80),    # Vert pomme-liane
        'badge': (120, 170, 40),
        'fruits': ['pomme-liane'],
    },
    'product-glacee-groseille.jpg': {
        'name': 'GLACÉ GROSEILLE',
        'bg': (220, 60, 80),     # Rouge groseille
        'badge': (180, 40, 50),
        'fruits': ['groseille'],
    },
    'prune-cythere.jpg': {
        'name': 'PRUNE CYTHÈRE',
        'bg': (180, 200, 60),    # Jaune-vert prune
        'badge': (130, 160, 30),
        'fruits': ['prune-cythere'],
    },
    'prune-maracuja.jpg': {
        'name': 'PRUNE MARACUJA',
        'bg': (255, 160, 60),    # Orange
        'badge': (200, 110, 30),
        'fruits': ['prune', 'maracuja'],
    },
    'snow-boll.jpg': {
        'name': 'SNOW BOLL',
        'bg': (180, 220, 240),   # Bleu glacier
        'badge': (100, 160, 200),
        'fruits': ['snow-boll'],
    },
    'super-coco.jpg': {
        'name': 'AU NANAN DE COCO',
        'bg': (140, 100, 60),    # Marron coco
        'badge': (100, 70, 40),
        'fruits': ['coco'],
    },
}

# ── Couleurs du logo ──
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
LOGO_RED = (220, 50, 50)

def draw_diamond(draw, cx, cy, size, color):
    """Draw a diamond shape at center (cx, cy)."""
    draw.polygon([
        (cx, cy - size),
        (cx + size, cy),
        (cx, cy + size),
        (cx - size, cy)
    ], fill=color)

def draw_badge(draw, cx, cy, text, color):
    """Draw a rounded pill badge with text."""
    # Background pill
    w = len(text) * 11 + 40
    h = 50
    x1 = cx - w // 2
    y1 = cy - h // 2
    x2 = cx + w // 2
    y2 = cy + h // 2
    draw.rounded_rectangle([x1, y1, x2, y2], radius=25, fill=color)
    
    # Try to use a font, fallback to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
    except:
        font = ImageFont.load_default()
    
    # White text centered
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    tx = cx - tw // 2
    ty = cy - th // 2 - 2
    draw.text((tx, ty), text, fill=WHITE, font=font)

def create_packaging(filename):
    flavor = FLAVORS.get(filename)
    if not flavor:
        print(f"  ⏭️  {filename}: pas dans la config")
        return False
    
    name = flavor['name']
    bg_color = flavor['bg']
    badge_color = flavor['badge']
    
    # Create base image with solid background and bubble texture
    img = Image.new('RGB', (SIZE, SIZE), bg_color)
    draw = ImageDraw.Draw(img)
    
    # Bubble overlay (fizz effect)
    for i in range(80):
        x = int(math.sin(i * 1.7) * 350) + SIZE // 2 + int(math.cos(i * 0.5) * 100)
        y = int(math.cos(i * 1.3) * 350) + SIZE // 2 + int(math.sin(i * 0.7) * 80)
        r = 8 + int(math.sin(i * 0.3) * 4)
        alpha = 30 + int(math.sin(i) * 15)
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(255, 255, 255, alpha))
    
    # ── Logo: diamond GM ──
    diamond_size = 40
    draw_diamond(draw, SIZE // 2, 80, diamond_size, LOGO_RED)
    # "G" and "M" inside diamond
    try:
        font_gm = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 24)
        draw.text((SIZE // 2 - 18, 70), "G", fill=WHITE, font=font_gm)
        draw.text((SIZE // 2 + 4, 70), "M", fill=WHITE, font=font_gm)
    except:
        draw.text((SIZE // 2 - 10, 72), "GM", fill=WHITE)
    
    # ── "Gouté Mwen" text ──
    try:
        font_brand = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 16)
        draw.text((SIZE // 2 - 45, 110), "Gouté Mwen", fill=(255, 255, 255, 200), font=font_brand)
    except:
        draw.text((SIZE // 2 - 40, 110), "Gouté Mwen", fill=(255, 255, 255))
    
    # ── Flavor name badge ──
    draw_badge(draw, SIZE // 2, 170, name, badge_color)
    
    # ── Bottom fruits (illustration circles) ──
    fruits = flavor['fruits']
    fruit_colors = {
        'abricot': (255, 160, 60),
        'ananas': (255, 220, 80),
        'miel': (255, 200, 100),
        'avocat': (100, 180, 60),
        'canne': (160, 200, 80),
        'citron': (220, 240, 80),
        'cocktail': (255, 100, 150),
        'corossol': (160, 200, 120),
        'kumquat': (255, 180, 60),
        'mandarine': (255, 170, 70),
        'mangue': (255, 210, 80),
        'maracuja': (255, 150, 40),
        'pasteque': (60, 180, 60),
        'anis': (120, 100, 60),
        'pomme-liane': (160, 200, 80),
        'groseille': (220, 60, 80),
        'prune-cythere': (200, 220, 80),
        'prune': (180, 80, 160),
        'snow-boll': (180, 220, 240),
        'coco': (180, 150, 100),
    }
    
    n = len(fruits)
    spacing = 120
    start_x = (SIZE - (n - 1) * spacing) // 2
    fruit_y = SIZE - 120
    
    for i, fruit in enumerate(fruits):
        fx = start_x + i * spacing
        fy = fruit_y
        color = fruit_colors.get(fruit, (200, 200, 200))
        
        # Fruit circle
        draw.ellipse([fx-35, fy-35, fx+35, fy+35], fill=color)
        
        # Leaf detail
        draw.ellipse([fx-8, fy-45, fx+8, fy-30], fill=(60, 160, 60))
        
        # Inner highlight
        draw.ellipse([fx-15, fy-15, fx+15, fy+15], fill=(255, 255, 255, 60))
        
        # Label
        try:
            font_fruit = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 11)
            draw.text((fx, fy + 45), fruit.replace('-', ' ').title(), fill=WHITE, font=font_fruit, anchor="mt")
        except:
            draw.text((fx - 15, fy + 45), fruit.title(), fill=WHITE)
    
    # ── Price badge ──
    try:
        font_price = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 22)
    except:
        font_price = ImageFont.load_default()
    
    draw.ellipse([SIZE - 70, 15, SIZE - 10, 75], fill=LOGO_RED)
    draw.text((SIZE - 40, 38), "2€", fill=WHITE, font=font_price, anchor="mm")
    
    # ── Save ──
    out_path = os.path.join(OUT, filename)
    img.save(out_path, quality=92)
    return True

def main():
    print("=== Gouté Mwen — Nouveau packaging uniforme ===")
    count = 0
    for f in sorted(os.listdir(SRC)):
        if not f.endswith('.jpg') or f in ('hero.jpg', 'portrait.jpg'):
            continue
        ok = create_packaging(f)
        if ok:
            sz = os.path.getsize(os.path.join(OUT, f)) // 1024
            print(f"  ✅ {f}: {FLAVORS[f]['name']} — {sz}KB")
            count += 1
    print(f"\n✅ {count} packagings générés")

if __name__ == '__main__':
    main()