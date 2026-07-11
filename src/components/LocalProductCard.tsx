import { Plus, Sparkles, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { ImageLightbox } from './ImageLightbox';
import { SmartImage } from './SmartImage';

interface LocalProduct {
  id: string;
  name: string;
  vendor: string;
  price: number;
  image?: string;
  category: string;
  description?: string;
  zone?: string;
  available: boolean;
  featured?: boolean;
  ingredients?: string;
  allergens?: string;
}

interface LocalProductCardProps {
  product: LocalProduct;
  onAddToRequest: (product: LocalProduct) => void;
}

/**
 * Determine image type based on vendor and product name for correct fit.
 */
function getProductImageType(product: { vendor: string; name: string; category?: string }): string {
  const vendor = product.vendor.toLowerCase();
  const name = product.name.toLowerCase();
  const cat = (product.category || '').toLowerCase();

  // Gouté Mwen → packaging (bottles/jars)
  if (vendor.includes('goute') || name.includes('glace') || name.includes('sorbet')) return 'packaging';
  
  // Save Peyi'a boissons → packaging
  if (vendor.includes('snack save') && (name.includes('eau') || name.includes('jus') || name.includes('boisson') || name.includes('coca') || name.includes('bière') || name.includes('soda') || name.includes('smoothie') || name.includes('milkshake') || name.includes('nectar'))) return 'packaging';
  
  // Save Peyi'a épices/fruits secs → packaging
  if (vendor.includes('snack save') && (name.includes('épice') || name.includes('fruit sec'))) return 'packaging';
  
  // Save Peyi'a snacks & crêpes → food
  if (vendor.includes('snack save') && (name.includes('crêpe') || name.includes('spécialité') || name.includes('formule') || name.includes('panini'))) return 'food';
  
  // Ninice packaged products
  if (vendor.includes('ninice') && (name.includes('sauce') || name.includes('bocal') || name.includes('bouteille'))) return 'packaging';
  
  // Sweet Family → food
  if (vendor.includes('sweet')) return 'food';
  
  // Coco's Food → food
  if (vendor.includes('coco')) return 'food';
  
  // Saveurs d'Afrique → food
  if (vendor.includes('saveurs')) return 'food';
  
  // An Tjè Coco → food
  if (vendor.includes('tjè') || vendor.includes('tje')) return 'food';
  
  // Default: food
  return 'food';
}

export function LocalProductCard({ product, onAddToRequest }: LocalProductCardProps) {
  const [showSim, setShowSim] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const availabilityLabel = product.available === false ? 'Sur confirmation' : 'Disponible';
  const timingLabel = product.available === false ? 'Planifiable' : 'Des que possible';
  
  const imageType = getProductImageType(product) as any;
  
  return (
    <>
      {lightboxOpen && product.image && (
        <ImageLightbox
          images={[{ src: product.image, alt: product.name, caption: product.name }]}
          onClose={() => setLightboxOpen(false)}
        />
      )}
      <div className="group rounded-2xl border border-border/40 hover:border-primary/30 transition-all duration-300 overflow-hidden shadow-sm">
        <div className="relative aspect-[3/2] overflow-hidden">
          {product.image ? (
            <div className="w-full h-full">
              <SmartImage
                src={product.image}
                alt={`${product.name} préparé par ${product.vendor}`}
                kind={imageType}
                containerClassName="w-full h-full"
                onClick={() => setLightboxOpen(true)}
              />
              <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 bg-white/90 text-gray-800 text-xs px-3 py-1.5 rounded-full font-semibold shadow-lg transition-opacity flex items-center gap-1">
                  <ZoomIn className="w-3.5 h-3.5" /> Agrandir
                </span>
              </div>
            </div>
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
        </div>
      
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {product.category}
            </div>
            <h3 className="text-lg font-bold text-foreground line-clamp-1">{product.name}</h3>
            <div className="text-xs text-muted-foreground">{product.vendor}</div>
            {product.zone && (
              <div className="text-xs text-muted-foreground">Zone: {product.zone}</div>
            )}
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="rounded-full border border-border px-2 py-1">{availabilityLabel}</span>
              <span className="rounded-full border border-border px-2 py-1">{timingLabel}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-xl font-black text-foreground">
              {product.price.toFixed(2)} €
            </div>
            <span className={`text-xs font-semibold ${product.available === false ? 'text-amber-500' : 'text-emerald-400'}`}>
              {availabilityLabel}
            </span>
          </div>
          <button
            onClick={() => onAddToRequest(product)}
            className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:shadow-warm transition-all"
          >
            <Plus className="w-4 h-4" />
            Ajouter au panier
          </button>

          <button
            onClick={() => setShowSim(!showSim)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Delai & confirmation
          </button>
          {showSim && (
            <div className="rounded-xl border border-border/60 bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Delai confirme par partenaire · Créneau planifiable.
            </div>
          )}
        </div>
      </div>
    </>
  );
}