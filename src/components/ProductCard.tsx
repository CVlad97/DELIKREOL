import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { SmartImage, type ImageKind } from './SmartImage';

interface ProductCardProps {
  product: Product;
}

function getProductImageKind(product: Product): ImageKind {
  const value = `${product.name} ${product.category ?? ''}`
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

  const packagingTerms = [
    'boisson', 'jus', 'sirop', 'sauce', 'bocal', 'bouteille', 'pot',
    'sachet', 'epice', 'confiture', 'punch', 'nectar', 'soda', 'biere',
  ];

  return packagingTerms.some((term) => value.includes(term)) ? 'packaging' : 'food';
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showSuccess } = useToast();
  const [showSim, setShowSim] = useState(false);
  const vendorLabel = product.vendor?.business_name ?? (product.vendor_id ? 'Vendeur local' : null);
  const isAvailable = product.is_available !== false;
  const imageKind = getProductImageKind(product);

  return (
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image_url ? (
          <SmartImage
            src={product.image_url}
            alt={`${product.name}${vendorLabel ? ` par ${vendorLabel}` : ''}`}
            kind={imageKind}
            containerClassName="w-full h-full"
            imgClassName={imageKind === 'food' ? 'group-hover:scale-105' : 'p-4 group-hover:scale-[1.02]'}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground text-sm">
            Photo à venir
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.category}
          </div>
          <h3 className="text-lg font-bold text-foreground line-clamp-2">{product.name}</h3>
          {vendorLabel && (
            <div className="text-xs text-muted-foreground">{vendorLabel}</div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xl font-black text-foreground">
            {product.price.toFixed(2)} €
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
            <Plus className="w-4 h-4" />
            Ajouter
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowSim(!showSim)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          aria-expanded={showSim}
        >
          <Sparkles className="w-3.5 h-3.5" />
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
