#!/usr/bin/env python3
"""
Amélioration massive de toutes les photos des traiteurs DELIKREOL.
- Fond coloré cohérent (pas de noir, pas de blanc flou)
- Zoom centré sur le produit
- Luminosité/contraste améliorés
- Label avec nom du produit
"""
import os, math, json
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter

VENDORS = '/workspace/DELIKREOL/public/vendors'
SIZE = 800

# Brand colors per vendor
BRAND = {
    'an-tje-coco': {'bg': (100, 40, 180), 'accent': (230, 50, 120), 'text': (255, 220, 50)},
    'coco': {'bg': (40, 30, 20), 'accent': (200, 120, 50), 'text': (255, 200, 100)},
    'saveurs-afrique': {'bg': (15, 100, 90), 'accent': (20, 180, 150), 'text': (255, 220, 100)},
    'ninice': {'bg': (200, 80, 40), 'accent': (230, 150, 60), 'text': (255, 240, 200)},
    'goute-mwen': {'bg': (30, 100, 180), 'accent': (220, 50, 50), 'text': (255, 200, 50)},
    'save-peyia': {'bg': (200, 80, 30), 'accent': (200, 50, 50), 'text': (255, 220, 100)},
    'sweet-family': {'bg': (180, 30, 50), 'accent': (200, 150, 30), 'text': (255, 230, 150)},
    'chef-a-mada': {'bg': (20, 120, 80), 'accent': (200, 80, 40), 'text': (255, 220, 100)},
}

# Skip these files (already processed or special)
SKIP = {'hero.jpg', 'portrait.jpg', 'logo.jpg'}

# Product name mapping for labels
NAMES = {
    'an-tje-coco': {
        'gallery-01.jpg': 'Pépite gratin banane',
        'gallery-02.jpg': 'Pépite coco-passion',
        'gallery-03.jpg': 'Pépite fleur d\'oranger',
        'gallery-04.jpg': 'Pépite rougail saucisses',
        'gallery-05.jpg': 'Pépite poulet curry',
    },
}

def process_photo(filepath, vendor, filename):
    """Process a single photo: enhance, zoom, brand."""
    try:
        img = Image.open(filepath).convert('RGB')
    except:
        return False
    
    w, h = img.size
    
    # --- Step 1: Centre crop to square (zoom) ---
    min_dim = min(w, h)
    left = (w - min_dim) // 2
    top = (h - min_dim) // 2
    img = img.crop((left, top, left + min_dim, top + min_dim))
    
    # --- Step 2: Enhance brightness/contrast ---
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(1.15)
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.10)
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(1.3)
    
    # --- Step 3: Resize ---
    img = img.resize((SIZE - 120, SIZE - 120), Image.LANCZOS)
    
    # --- Step 4: Branded background ---
    colors = BRAND.get(vendor, BRAND['goute-mwen'])
    top_c, bottom_c = colors['bg'], (min(255, colors['bg'][0]+60), min(255, colors['bg'][1]+60), min(255, colors['bg'][2]+60))
    
    bg = Image.new('RGB', (SIZE, SIZE))
    draw = ImageDraw.Draw(bg)
    for y in range(SIZE):
        r = top_c[0] + (bottom_c[0] - top_c[0]) * y // SIZE
        g = top_c[1] + (bottom_c[1] - top_c[1]) * y // SIZE
        b = top_c[2] + (bottom_c[2] - top_c[2]) * y // SIZE
        draw.line([(0, y), (SIZE, y)], fill=(r, g, b))
    
    # Decorative circles
    for i in range(15):
        x = int(math.sin(i * 0.9) * 350) + SIZE // 2
        y = int(math.cos(i * 1.3) * 300) + SIZE // 2
        r = 40 + int(math.sin(i) * 15)
        draw.ellipse([x-r, y-r, x+r, y+r], fill=(255, 255, 255, 20))
    
    # --- Step 5: Paste product with shadow ---
    x_pos = (SIZE - img.width) // 2
    y_pos = (SIZE - img.height) // 2
    
    # Shadow
    sd = ImageDraw.Draw(bg)
    sd.ellipse([x_pos+30, y_pos + img.height - 10, x_pos + img.width - 30, y_pos + img.height + 15], fill=(0, 0, 0, 70))
    
    bg.paste(img, (x_pos, y_pos))
    
    # --- Step 6: Brand label ---
    draw = ImageDraw.Draw(bg)
    bar_y = SIZE - 55
    draw.rounded_rectangle([10, bar_y, SIZE - 10, SIZE - 12], radius=10, fill=(0, 0, 0, 170))
    
    # Get readable name
    name_map = NAMES.get(vendor, {})
    label = name_map.get(filename, filename.replace('.jpg','').replace('-',' ').replace('_',' ').title())
    
    draw.text((SIZE // 2, bar_y + 17), label, fill=(255, 255, 255), font_size=15, anchor="mm")
    
    # Vendor name top-left
    vendor_name = vendor.replace('-',' ').title()
    draw.text((20, 15), vendor_name, fill=colors['text'], font_size=12)
    
    # --- Step 7: Save ---
    bg.save(filepath, quality=92)
    return True

def main():
    total = 0
    improved = 0
    for vendor in sorted(os.listdir(VENDORS)):
        vpath = os.path.join(VENDORS, vendor)
        if not os.path.isdir(vpath) or vendor.startswith('_'):
            continue
        if vendor not in BRAND:
            print(f"  ⏭️  {vendor}: pas de couleurs définies")
            continue
        
        for f in sorted(os.listdir(vpath)):
            if not f.endswith(('.jpg','.jpeg','.png')):
                continue
            if f in SKIP:
                print(f"  ⏭️  {vendor}/{f}: conservé tel quel")
                continue
            
            fp = os.path.join(vpath, f)
            size_before = os.path.getsize(fp)
            ok = process_photo(fp, vendor, f)
            if ok:
                size_after = os.path.getsize(fp)
                print(f"  ✅ {vendor}/{f}: {size_before//1024}KB → {size_after//1024}KB")
                improved += 1
            else:
                print(f"  ❌ {vendor}/{f}: erreur")
            total += 1
    
    print(f"\n=== RÉSULTAT ===")
    print(f"Total photos traitées: {total}")
    print(f"Améliorées: {improved}")
    print(f"Images hero/portrait/logo conservées: ✅")

if __name__ == '__main__':
    main()