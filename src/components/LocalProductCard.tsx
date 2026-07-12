import { Plus, Sparkles, ZoomIn } from 'lucide-react';
import { useState } from 'react';
import { ImageLightbox } from './ImageLightbox';
import { ProductThumbnail } from './ProductThumbnail';
import { traiteurSpaces } from '../data/traiteurs';
import { isUsableThumbnail } from '../services/catalogImageResolver';

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

function normalizeVendor(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function getPartnerImage(vendor: string): string | null {
  const normalized = normalizeVendor(vendor);
  const space = traiteurSpaces.find((item) => normalizeVendor(item.name) === normalized);
  return space?.heroImage || space?.galleryImages?.[0] || space?.portraitImage || null;
}

export function LocalProductCard({ product, onAddToRequest }: LocalProductCardProps) {
  const [showSim, setShowSim] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const availabilityLabel = product.available === false ? 'Sur confirmation' : 'Disponible';
  const timingLabel = product.available === false ? 'Planifiable' : 'Dès que possible';
  const hasRealImage = isUsableThumbnail(product.image);
  const partnerImage = getPartnerImage(product.vendor);

  return (
    <>
      {lightboxOpen && hasRealImage && product.image && (
        <ImageLightbox
          images={[{ src: product.image, alt: product.name, caption: product.name }]}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <article className="group overflow-hidden rounded-2xl border border-border/40 shadow-sm transition-all duration-300 hover:border-primary/30 hover:shadow-lg">
        <div className="relative">
          <ProductThumbnail
            src={product.image}
            partnerImage={partnerImage}
            productName={product.name}
            vendorName={product.vendor}
            category={product.category}
            aspectRatio="3 / 2"
            containerClassName="w-full"
            imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
            showBadge
            onClick={hasRealImage ? () => setLightboxOpen(true) : undefined}
          />

          {hasRealImage && (
            <span className="pointer-events-none absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold text-foreground opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-3.5 w-3.5" /> Agrandir
            </span>
          )}
        </div>

        <div className="space-y-3 p-4">
          <div className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {product.category}
            </div>
            <h3 className="line-clamp-2 text-lg font-bold text-foreground">{product.name}</h3>
            <div className="text-xs text-muted-foreground">{product.vendor}</div>
            {product.zone && (
              <div className="text-xs text-muted-foreground">Zone : {product.zone}</div>
            )}
            <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-muted-foreground">
              <span className="rounded-full border border-border px-2 py-1">{availabilityLabel}</span>
              <span className="rounded-full border border-border px-2 py-1">{timingLabel}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="text-xl font-black text-foreground">
              {product.price.toFixed(2)} €
            </div>
            <span className={`text-xs font-semibold ${product.available === false ? 'text-amber-700' : 'text-success'}`}>
              {availabilityLabel}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onAddToRequest(product)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-warm"
          >
            <Plus className="h-4 w-4" />
            Ajouter au panier
          </button>

          <button
            type="button"
            onClick={() => setShowSim(!showSim)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            aria-expanded={showSim}
          >
            <Sparkles className="h-3.5 w-3.5" />
            Délai et confirmation
          </button>

          {showSim && (
            <div className="rounded-xl border border-border/60 bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              Délai confirmé par le partenaire · Créneau planifiable.
            </div>
          )}
        </div>
      </article>
    </>
  );
}
