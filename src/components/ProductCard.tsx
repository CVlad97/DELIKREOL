import { Plus, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../contexts/ToastContext';
import { SmartImage, type ImageKind } from './SmartImage';

interface ProductCardProps {
  product: Product;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getProductImageKind(product: Product): ImageKind {
  const text = normalize(
    `${product.name} ${product.category} ${product.vendor?.business_name ?? ''}`
  );

  const packagingWords = [
    'bouteille',
    'bocal',
    'pot ',
    'sachet',
    'packaging',
    'sirop',
    'sauce',
    'confiture',
    'epice',
    'boisson',
    'jus ',
  ];

  return packagingWords.some((word) => text.includes(word)) ? 'packaging' : 'food';
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { showSuccess } = useToast();
  const [showSim, setShowSim] = useState(false);
  const vendorLabel = product.vendor?.business_name ?? (product.vendor_id ? 'Partenaire local' : null);
  const isAvailable = product.is_available !== false;
  const imageKind = getProductImageKind(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:border-primary/35 hover:shadow-elegant">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.image_url ? (
          <SmartImage
            src={product.image_url}
            alt={`${product.name}${vendorLabel ? ` — ${vendorLabel}` : ''}`}
            kind={imageKind}
            aspectRatio="4 / 3"
            containerClassName="h-full w-full"
            imgClassName={imageKind === 'food' ? 'group-hover:scale-[1.035]' : ''}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-muted text-sm font-semibold text-muted-foreground">
            Photo prochainement
          </div>
        )}
        <span
          className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm ${
            isAvailable
              ? 'bg-white/95 text-success'
              : 'bg-white/95 text-destructive'
          }`}
        >
          {isAvailable ? 'Disponible' : 'Sur confirmation'}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="space-y-1">
          <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            {product.category}
          </div>
          <h3 className="line-clamp-2 text-lg font-black leading-tight text-foreground">
            {product.name}
          </h3>
          {vendorLabel && (
            <div className="text-sm font-medium text-muted-foreground">{vendorLabel}</div>
          )}
          {product.description && (
            <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
              {product.description}
            </p>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div>
            <div className="text-2xl font-black text-foreground">
              {product.price.toFixed(2).replace('.', ',')} €
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Prix DeliKreol
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              addItem(product);
              showSuccess('Ajouté au panier');
            }}
            disabled={!isAvailable}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-black text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            Ajouter
          </button>
        </div>

        <button
          type="button"
          onClick={() => setShowSim(!showSim)}
          className="inline-flex items-center gap-2 self-start text-xs font-bold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-expanded={showSim}
        >
          <Sparkles className="h-3.5 w-3.5" />
          Délai et confirmation
        </button>
        {showSim && (
          <div className="rounded-xl border border-border bg-muted/60 px-3 py-2 text-xs leading-5 text-muted-foreground">
            Disponibilité et créneau confirmés par le partenaire avant validation définitive.
          </div>
        )}
      </div>
    </article>
  );
}
