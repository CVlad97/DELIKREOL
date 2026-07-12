import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { SmartImage } from './SmartImage';

interface CarouselItem {
  image?: string;
  name: string;
  vendor: string;
  price: number;
  category?: string;
}

export function AutoCarousel({ items }: { items: CarouselItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext, isPaused, items.length]);

  if (items.length === 0) return null;

  const getCategoryLabel = (product: CarouselItem) => {
    if (product.category === 'Desserts') return '🍨 Dessert';
    if (product.category === 'Entrées') return '🥗 Entrée';
    const name = product.name.toLowerCase();
    if (name.includes('salade') || name.includes('nems')) return '🥗 Entrée';
    return '🍛 Plat';
  };

  const visible = [
    items[currentIndex % items.length],
    items[(currentIndex + 1) % items.length],
    items[(currentIndex + 2) % items.length],
  ];

  return (
    <div
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Produits mis en avant"
    >
      <div className="flex justify-center gap-1.5 mb-6">
        {items.slice(0, 8).map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrentIndex(i)}
            aria-label={`Afficher le produit ${i + 1}`}
            aria-current={i === currentIndex ? 'true' : undefined}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-8 bg-primary' : 'w-1.5 bg-border hover:bg-muted-foreground/40'
            }`}
          />
        ))}
      </div>

      <div className="flex justify-center gap-4 md:gap-6">
        {visible.map((product, i) => (
          <Link
            key={`${product.name}-${i}`}
            to="/catalogue"
            className={`overflow-hidden rounded-2xl border bg-card transition-all duration-500 group ${
              i === 0
                ? 'w-56 md:w-64 scale-100 border-primary/30 shadow-xl z-10'
                : 'w-40 md:w-48 scale-90 border-border shadow-md opacity-75 hidden md:block'
            } hover:border-primary/50 hover:-translate-y-1`}
          >
            <div className={`${i === 0 ? 'aspect-[4/3]' : 'aspect-square'} overflow-hidden bg-primary/[0.06]`}>
              {product.image ? (
                <SmartImage
                  src={product.image}
                  alt={`${product.name} par ${product.vendor}`}
                  kind="food"
                  loading="lazy"
                  containerClassName="w-full h-full"
                  imgClassName="group-hover:scale-105"
                  sizes={i === 0 ? '(max-width: 768px) 224px, 256px' : '192px'}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-primary/30 text-3xl" aria-hidden="true">🍽️</div>
              )}
            </div>
            <div className={`p-3 ${i === 0 ? 'p-4' : ''}`}>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{getCategoryLabel(product)}</p>
              <p className={`font-bold text-foreground truncate mt-0.5 ${i === 0 ? 'text-base' : 'text-sm'}`}>
                {product.name.split('—').pop() || product.name}
              </p>
              {i === 0 && <p className="text-xs text-muted-foreground truncate mt-0.5">{product.vendor}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className={`font-bold text-primary ${i === 0 ? 'text-base' : 'text-sm'}`}>
                  {product.price.toFixed(2)} €
                </span>
                {i === 0 && (
                  <span className="text-[10px] px-2 py-0.5 bg-primary/10 text-primary rounded-full font-semibold">
                    Voir
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Produit précédent"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/40 transition-all"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Produit suivant"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg border border-border flex items-center justify-center text-foreground/70 hover:text-primary hover:border-primary/40 transition-all"
          >
            ▶
          </button>
        </>
      )}

      {isPaused && (
        <div className="text-center mt-4">
          <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">⏸ En pause</span>
        </div>
      )}
    </div>
  );
}
