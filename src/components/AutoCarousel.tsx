import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductThumbnail } from './ProductThumbnail';
import { traiteurSpaces } from '../data/traiteurs';

interface CarouselItem {
  image?: string;
  name: string;
  vendor: string;
  price: number;
  category?: string;
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

export function AutoCarousel({ items }: { items: CarouselItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((previous) => (previous + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    if (items.length <= 1) return;
    setCurrentIndex((previous) => (previous - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return undefined;
    const timer = window.setInterval(goNext, 6000);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, items.length]);

  useEffect(() => {
    if (currentIndex >= items.length) setCurrentIndex(0);
  }, [currentIndex, items.length]);

  const visibleItems = useMemo(() => {
    if (items.length === 0) return [];
    const count = Math.min(3, items.length);
    return Array.from({ length: count }, (_, offset) => items[(currentIndex + offset) % items.length]);
  }, [currentIndex, items]);

  if (items.length === 0) return null;

  return (
    <section
      className="relative w-full overflow-hidden"
      aria-label="Produits à commander"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5" aria-label="Position dans le carrousel">
          {items.slice(0, 8).map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-border hover:bg-primary/40'
              }`}
              aria-label={`Afficher le produit ${index + 1}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={goPrev}
            disabled={items.length <= 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Produit précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={items.length <= 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Produit suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
        {visibleItems.map((product, index) => (
          <Link
            key={`${product.name}-${currentIndex}-${index}`}
            to="/catalogue"
            className={`group min-w-0 overflow-hidden rounded-3xl border bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
              index === 0 ? 'border-primary/35' : 'border-border'
            } ${index > 0 ? 'hidden md:block' : ''}`}
          >
            <ProductThumbnail
              src={product.image}
              partnerImage={getPartnerImage(product.vendor)}
              productName={product.name}
              vendorName={product.vendor}
              category={product.category}
              aspectRatio="4 / 3"
              containerClassName="w-full bg-muted"
              imgClassName="product-photo-natural transition-transform duration-500 group-hover:scale-[1.02]"
              showBadge
            />

            <div className="p-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                {product.category || 'Sélection locale'}
              </p>
              <h3 className="mt-1 line-clamp-2 min-h-[3rem] text-base font-black leading-snug text-foreground">
                {product.name.split('—').pop() || product.name}
              </h3>
              <p className="mt-1 truncate text-sm text-muted-foreground">{product.vendor}</p>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xl font-black text-foreground">{product.price.toFixed(2).replace('.', ',')} €</p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Prix DELIKREOL</p>
                </div>
                <span className="shrink-0 rounded-full bg-primary px-3 py-1.5 text-xs font-black text-primary-foreground">
                  Voir
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
