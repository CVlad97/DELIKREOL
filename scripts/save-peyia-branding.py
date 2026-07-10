#!/usr/bin/env python3
"""Brand Snack Savè Peyi'A product photos with consistent styling."""

import os, math
from PIL import Image, ImageDraw

SRC = '/workspace/DELIKREOL/public/vendors/save-peyia'
SIZE = 800
BG_TOP = (200, 80, 30)    # Orange/marron chaud
BG_BOT = (250, 180, 50)   # Jaune clair
ACCENT = (200, 50, 50)    # Rouge

NAMES = {
    'cote-porc-riz.jpg': 'Côte de porc riz crudités 12€',
    'panini-saumon.jpg': 'Panini saumon 8€',
    'crevettes-riz.jpg': 'Crevettes riz crudités 14€',
    'viande-riz-1.jpg': 'Grillade riz crudités',
    'crevettes-double.jpg': 'Crevettes riz crudités x2',
    'viande-riz-2.jpg': 'Grillade riz salade',
    'cocktail-fruit.jpg': 'Cocktail de fruits 6€',
    'cocktail-ananas.jpg': 'Cocktail ananas 6€',
    'salade-fruits-1.jpg': 'Salade de fruits frais 6€',
    'salade-fruits-2.jpg': 'Salade de fruits 6€',
    'salade-fruits-rhum.jpg': 'Salade fruits rhum 10€',
}

def create_gradient(w, h, top, bottom):
    base = Image.new('RGB', (w, h))
    draw = ImageDraw.Draw(base)
    for y in range(h):
        r = top[0] + (bottom[0] - top[0]) * y // h
        g = top[1] + (bottom[1] - top[1]) * y // h
        b = top[2] + (bottom[2] - top[2]) * y // h
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return base

for filename, label in NAMES.items():
    path = os.path.join(SRC, filename)
    try:
        img = Image.open(path).convert('RGB')
    except:
        print(f"  ❌ {filename}: cant open")
        continue
    
    w, h = img.size
    print(f"  {filename} ({w}x{h}) → {label[:30]}…")
    
    bg = create_gradient(SIZE, SIZE, BG_TOP, BG_BOT)
    
    # Decorative pattern
    draw = ImageDraw.Draw(bg)
    for i in range(20):
        x = int(math.sin(i * 0.8) * 300) + SIZE // 2
        y = int(math.cos(i * 1.2) * 200) + SIZE // 2
        r = 30 + int(math.sin(i) * 10)
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(255, 200, 100, 30))
    
    # Resize product to fit
    max_dim = SIZE - 160
    if w > h:
        new_w = max_dim
        new_h = int(h * max_dim / w)
    else:
        new_h = max_dim
        new_w = int(w * max_dim / h)
    
    img_r = img.resize((new_w, new_h), Image.LANCZOS)
    x_pos = (SIZE - new_w) // 2
    y_pos = (SIZE - new_h) // 2 - 30
    
    # Shadow
    sd = ImageDraw.Draw(bg)
    sd.ellipse([x_pos + 20, y_pos + new_h - 5, x_pos + new_w - 20, y_pos + new_h + 10], fill=(0, 0, 0, 60))
    
    bg.paste(img_r, (x_pos, y_pos))
    
    # Label bar at bottom
    draw = ImageDraw.Draw(bg)
    bar_y = SIZE - 50
    draw.rounded_rectangle([10, bar_y, SIZE - 10, SIZE - 15], radius=10, fill=(0, 0, 0, 170))
    draw.text((SIZE // 2, bar_y + 17), label, fill=(255, 255, 255), font_size=16, anchor="mm")
    
    # "Snack Savè Peyi'A" brand
    draw.text((25, 15), "Snack Savè Peyi'A", fill=(255, 220, 100), font_size=13)
    
    bg.save(path, quality=90)
    print(f"  ✅ Saved")

print("=== Done ===")