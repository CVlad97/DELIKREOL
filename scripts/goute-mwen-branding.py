#!/usr/bin/env python3
"""Process Gouté Mwen product images with consistent branding."""

import os, json, math
from PIL import Image, ImageDraw, ImageFont, ImageFilter

SRC = '/workspace/DELIKREOL/public/vendors/goute-mwen'
OUT = '/workspace/DELIKREOL/public/vendors/goute-mwen'
SIZE = 800
BG_COLOR = (30, 100, 180)  # Bleu Gouté Mwen
ACCENT = (220, 50, 50)     # Rouge Gouté Mwen

# Product name mapping
NAMES = {
    'abricot-pays.jpg': 'Abricot Pays',
    'ananas.jpg': 'Ananas',
    'api.jpg': 'API (Miel)',
    'avocat-basi.jpg': 'Avocat Basi',
    'canne.jpg': 'Canne (sans sucre)',
    'citronnade.jpg': 'Citronnade',
    'cocktail.jpg': 'Cocktail',
    'corossol.jpg': 'Corossol',
    'kumquat.jpg': 'Kumquat',
    'mandarine.jpg': 'Mandarine',
    'mangue.jpg': 'Mangue',
    'maracuja.jpg': 'Maracuja',
    'pasteque.jpg': 'Pastèque',
    'pomme-liane.jpg': 'Pomme Liane',
    'product-glacee-groseille.jpg': 'Glacé Groseille',
    'prune-cythere.jpg': 'Prune Cythère',
    'prune-maracuja.jpg': 'Prune Maracuja',
    'snow-boll.jpg': 'Snow Boll',
    'super-coco.jpg': 'Au Nanan de Coco',
}

def create_gradient(w, h, top_color, bottom_color):
    """Create a vertical gradient image."""
    base = Image.new('RGB', (w, h))
    draw = ImageDraw.Draw(base)
    for y in range(h):
        r = top_color[0] + (bottom_color[0] - top_color[0]) * y // h
        g = top_color[1] + (bottom_color[1] - top_color[1]) * y // h
        b = top_color[2] + (bottom_color[2] - top_color[2]) * y // h
        draw.line([(0, y), (w, y)], fill=(r, g, b))
    return base

def process_product(filename):
    name = NAMES.get(filename, filename.replace('.jpg', '').replace('-', ' ').title())
    img_path = os.path.join(SRC, filename)
    
    try:
        img = Image.open(img_path).convert('RGB')
    except Exception as e:
        print(f"  ❌ {filename}: {e}")
        return
    
    w, h = img.size
    print(f"  Processing {filename} ({w}x{h}) → {name}")
    
    # Create gradient background
    bg = create_gradient(SIZE, SIZE, (20, 80, 160), (60, 140, 220))
    
    # Add a decorative ice/frost overlay
    ice = Image.new('RGBA', (SIZE, SIZE), (0, 0, 0, 0))
    idraw = ImageDraw.Draw(ice)
    # Subtle ice crystals at bottom
    for _ in range(30):
        x = int(math.sin(_ * 1.7) * 200) + SIZE // 2 + int(math.cos(_) * 50)
        y = SIZE - 60 + int(math.sin(_ * 2.3) * 20)
        r = 10 + int(math.sin(_ * 0.5) * 5)
        idraw.ellipse([x-r, y-r, x+r, y+r], fill=(180, 220, 255, 60))
    
    bg = Image.alpha_composite(bg.convert('RGBA'), ice).convert('RGB')
    
    # Resize product image to fit nicely
    max_dim = SIZE - 160  # margin
    if w > h:
        new_w = max_dim
        new_h = int(h * max_dim / w)
    else:
        new_h = max_dim
        new_w = int(w * max_dim / h)
    
    img_resized = img.resize((new_w, new_h), Image.LANCZOS)
    
    # Position center
    x_pos = (SIZE - new_w) // 2
    y_pos = (SIZE - new_h) // 2 - 30  # shift up for text
    
    # Soft shadow
    shadow = Image.new('RGBA', img_resized.size, (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.ellipse([5, new_h-15, new_w-5, new_h+10], fill=(0, 0, 0, 80))
    shadow = shadow.filter(ImageFilter.GaussianBlur(radius=8))
    bg.paste(shadow, (x_pos, y_pos + new_h - 15), shadow)
    
    # Paste product
    if img_resized.mode == 'RGBA':
        bg.paste(img_resized, (x_pos, y_pos), img_resized)
    else:
        bg.paste(img_resized, (x_pos, y_pos))
    
    # Draw text label
    draw = ImageDraw.Draw(bg)
    
    # Price badge (2€)
    badge_x, badge_y = SIZE - 100, 20
    draw.ellipse([badge_x, badge_y, badge_x + 70, badge_y + 70], fill=ACCENT)
    draw.text((badge_x + 35, badge_y + 25), "2€", fill=(255, 255, 255), font_size=22, anchor="mm")
    
    # Product name bar at bottom
    bar_y = SIZE - 55
    draw.rounded_rectangle([10, bar_y, SIZE - 10, SIZE - 10], radius=12, fill=(0, 0, 0, 160))
    
    try:
        draw.text((SIZE // 2, bar_y + 22), name, fill=(255, 255, 255), font_size=18, anchor="mm")
    except:
        draw.text((SIZE // 2, bar_y + 22), name, fill=(255, 255, 255))
    
    # Gouté Mwen brand mark
    try:
        draw.text((30, 25), "Gouté Mwen", fill=(255, 200, 50, 200), font_size=14)
    except:
        pass
    
    # Save
    out_path = os.path.join(OUT, filename)
    bg.save(out_path, quality=92)
    print(f"  ✅ Saved {out_path}")

def main():
    print("=== Processing Gouté Mwen product images ===")
    print(f"Hero kept as-is: {SRC}/hero.jpg ✅")
    
    for f in sorted(os.listdir(SRC)):
        if not f.endswith('.jpg') or f in ('hero.jpg', 'portrait.jpg'):
            continue
        if f in NAMES:
            process_product(f)
        else:
            print(f"  ⏭️  {f}: no name mapping")
    
    print("=== Done ===")

if __name__ == '__main__':
    main()