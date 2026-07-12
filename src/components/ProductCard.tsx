import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { ProductThumbnail } from './ProductThumbnail';
import { formatEuro, traiteurSpaces } from '../data/traiteurs';

interface ProductCardProps {
  product: Product;
}

function normalizeVendor(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function findPartnerImage(vendorName?: string | null): string | null {
  if (!vendorName) return null;
  const normalized = normalizeVendor(vendorName);
  const space = traiteurSpaces.find((item) => normalizeVendor(item.name) === normalized);
  return space?.heroImage || space?.galleryImages?.[0] || space?.portraitImage || null;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showSuccess } = useToast();
  const [showSim, setShowSim] = useState(false);
  const vendorLabel = product.vendor?.business_name ?? (product.vendor_id ? 'Vendeur local' : null);
  const isAvailable = product.is_available !== false;
  const partnerImage = findPartnerImage(vendorLabel);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
      <ProductThumbnail
        src={product.image_url}
        partnerImage={partnerImage}
        productName={product.name}
        vendorName={vendorLabel}
        category={product.category}
        aspectRatio="4 / 3"
        containerClassName="w-full bg-muted"
        imgClassName="transition-transform duration-500 group-hover:scale-[1.03]"
        showBadge
      />

      <div className="space-y-3 p-4">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.category}
          </div>
          <h3 className="line-clamp-2 text-lg font-bold text-foreground">{product.name}</h3>
          {vendorLabel && (
            <div className="text-xs text-muted-foreground">{vendorLabel}</div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xl font-black text-foreground">
            {formatEuro(product.price)}
          </div>
          <button
            type="button"
            onClick={() => {
              addItem(product);
              showSuccess('Ajouté au panier');
            }}
            disabled={!isAvailable}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowSim(!showSim)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          aria-expanded={showSim}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Délai estimé
        </button>
        {showSim && (
          <div className="rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            Estimation : 25–35 min · Confirmation par le partenaire
          </div>
        )}

        {!isAvailable && (
          <div className="text-xs font-semibold text-destructive">Indisponible pour le moment</div>
        )}
      </div>
    </article>
  );
}
