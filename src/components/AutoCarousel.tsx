import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause } from 'lucide-react';
import { SmartImage, type ImageKind } from './SmartImage';

interface CarouselItem {
  image?: string;
  name: string;
  vendor: string;
  price: number;
  category?: string;
}

function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function getImageKind(item: CarouselItem): ImageKind {
  const text = normalize(`${item.name} ${item.category ?? ''} ${item.vendor}`);
  const packagingWords = [
    'bouteille',
    'bocal',
    'sachet',
    'sirop',
    'sauce',
    'confiture',
    'epice',
    'boisson',
    'jus ',
  ];
  return packagingWords.some((word) => text.includes(word)) ? 'packaging' : 'food';
}

export function AutoCarousel({ items }: { items: CarouselItem[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    if (items.length > 0) {
      setCurrentIndex((previous) => (previous + 1) % items.length);
    }
  }, [items.length]);

  const goPrev = useCallback(() => {
    if (items.length > 0) {
      setCurrentIndex((previous) => (previous - 1 + items.length) % items.length);
    }
  }, [items.length]);

  useEffect(() => {
    if (isPaused || items.length < 2) return;
    const timer = window.setInterval(goNext, 5000);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, items.length]);

  useEffect(() => {
    if (currentIndex >= items.length && items.length > 0) setCurrentIndex(0);
  }, [currentIndex, items.length]);

  if (items.length === 0) return null;

  const getCategoryLabel = (product: CarouselItem) => {
    const category = normalize(product.category ?? '');
    const name = normalize(product.name);
    if (category.includes('dessert')) return 'Dessert';
    if (category.includes('boisson')) return 'Boisson';
    if (category.includes('snack') || name.includes('nems') || name.includes('accras')) return 'Snacking';
    return product.category || 'Plat local';
  };

  const visibleCount = Math.min(3, items.length);
  const visible = Array.from({ length: visibleCount }, (_, offset) =>
    items[(currentIndex + offset) % items.length]
  );

  return (
    <section
      className="relative mx-auto max-w-4xl"
      aria-label="Sélection de produits DeliKreol"
      aria-roledescription="carrousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false);
      }}
    >
      {items.length > 1 && (
        <div className="mb-6 flex justify-center gap-2" aria-label="Choisir un produit">
          {items.slice(0, 8).map((item, index) => (
            <button
              key={`${item.name}-${index}`}
              type="button"
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                index === currentIndex
                  ? 'w-8 bg-primary'
                  : 'w-2 bg-border hover:bg-primary/35'
              }`}
              aria-label={`Afficher ${item.name}`}
              aria-current={index === currentIndex ? 'true' : undefined}
            />
          ))}
        </div>
      )}

      <div className="flex justify-center gap-4 md:gap-6">
        {visible.map((product, index) => {
          const isMain = index === 0;
          const imageKind = getImageKind(product);
          return (
            <Link
              key={`${product.name}-${index}`}
              to={`/catalogue?q=${encodeURIComponent(product.name)}`}
              className={`group overflow-hidden rounded-3xl border bg-card text-left transition-all duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                isMain
                  ? 'z-10 w-60 scale-100 border-primary/30 shadow-elegant md:w-72'
                  : 'hidden w-44 scale-95 border-border opacity-75 shadow-soft md:block md:w-52'
              } hover:-translate-y-1 hover:border-primary/45 hover:opacity-100`}
              aria-label={`Voir ${product.name} de ${product.vendor}`}
            >
              <div className={`${isMain ? 'aspect-[4/3]' : 'aspect-square'} overflow-hidden bg-primary/10`}>
                {product.image ? (
                  <SmartImage
                    src={product.image}
                    alt={`${product.name} — ${product.vendor}`}
                    kind={imageKind}
                    containerClassName="h-full w-full"
                    imgClassName={imageKind === 'food' ? 'group-hover:scale-[1.04]' : ''}
                    priority={isMain}
                    sizes={isMain ? '(max-width: 768px) 240px, 288px' : '208px'}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm font-bold text-muted-foreground">
                    Photo prochainement
                  </div>
                )}
              </div>

              <div className={isMain ? 'p-5' : 'p-4'}>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-primary">
                  {getCategoryLabel(product)}
                </p>
                <h3 className={`mt-1 truncate font-black text-foreground ${isMain ? 'text-lg' : 'text-sm'}`}>
                  {product.name.split('—').pop() || product.name}
                </h3>
                <p className="mt-1 truncate text-xs font-medium text-muted-foreground">
                  {product.vendor}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className={`font-black text-foreground ${isMain ? 'text-xl' : 'text-base'}`}>
                    {product.price.toFixed(2).replace('.', ',')} €
                  </span>
                  {isMain && (
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[10px] font-black text-primary">
                      Voir
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-0 top-1/2 flex h-11 w-11 -translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-lg transition-all hover:border-primary/35 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:-translate-x-5"
            aria-label="Produit précédent"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-0 top-1/2 flex h-11 w-11 translate-x-2 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-lg transition-all hover:border-primary/35 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:translate-x-5"
            aria-label="Produit suivant"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {isPaused && items.length > 1 && (
        <div className="mt-4 flex justify-center" aria-live="polite">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[10px] font-bold text-muted-foreground">
            <Pause className="h-3 w-3" />
            Carrousel en pause
          </span>
        </div>
      )}
    </section>
  );
}
