import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollCarouselProps {
  children: React.ReactNode;
  autoPlay?: boolean;
  interval?: number;
  title?: string;
  subtitle?: string;
}

export function ScrollCarousel({
  children,
  autoPlay = false,
  interval = 5000,
  title,
  subtitle,
}: ScrollCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;
    setCanScrollLeft(element.scrollLeft > 4);
    setCanScrollRight(element.scrollLeft < element.scrollWidth - element.clientWidth - 4);
  }, []);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const element = scrollRef.current;
    if (!element) return;
    const firstCard = element.firstElementChild as HTMLElement | null;
    const amount = firstCard ? firstCard.getBoundingClientRect().width + 16 : element.clientWidth * 0.85;
    element.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
    window.setTimeout(updateScrollState, 450);
  }, [updateScrollState]);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return undefined;

    const resizeObserver = new ResizeObserver(updateScrollState);
    resizeObserver.observe(element);
    updateScrollState();
    element.addEventListener('scroll', updateScrollState, { passive: true });

    return () => {
      resizeObserver.disconnect();
      element.removeEventListener('scroll', updateScrollState);
    };
  }, [updateScrollState]);

  useEffect(() => {
    if (!autoPlay || isPaused || !canScrollRight) return undefined;
    const timer = window.setInterval(() => scrollBy('right'), interval);
    return () => window.clearInterval(timer);
  }, [autoPlay, canScrollRight, interval, isPaused, scrollBy]);

  return (
    <section
      className="group relative w-full min-w-0 overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-label={title || 'Carrousel'}
    >
      {(title || subtitle) && (
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            {title && <h2 className="text-2xl font-black text-foreground">{title}</h2>}
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => scrollBy('left')}
              disabled={!canScrollLeft}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Éléments précédents"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollBy('right')}
              disabled={!canScrollRight}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-white text-foreground shadow-sm transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35"
              aria-label="Éléments suivants"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="scroll-carousel-track flex w-full min-w-0 gap-4 overflow-x-auto overscroll-x-contain scroll-smooth pb-4 snap-x snap-mandatory scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {!title && canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy('left')}
          className="absolute left-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-foreground shadow-lg transition hover:text-primary md:flex"
          aria-label="Éléments précédents"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {!title && canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy('right')}
          className="absolute right-2 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-white/95 text-foreground shadow-lg transition hover:text-primary md:flex"
          aria-label="Éléments suivants"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </section>
  );
}
