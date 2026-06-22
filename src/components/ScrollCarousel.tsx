import { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ScrollCarouselProps {
  children: React.ReactNode;
  autoPlay?: boolean;
  interval?: number;
  title?: string;
  subtitle?: string;
}

/**
 * Carrousel horizontal avec flèches de direction.
 * - Auto-rotation optionnelle (toutes les 5s par défaut)
 * - Flèches gauche/droite toujours visibles
 * - Pause au survol
 * - Swipe mobile natif
 */
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
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.7;
    el.scrollBy({ left: direction === 'right' ? amount : -amount, behavior: 'smooth' });
    setTimeout(updateScrollState, 400);
  }, [updateScrollState]);

  // Auto-play
  useEffect(() => {
    if (!autoPlay || isPaused) return;
    const timer = setInterval(() => {
      const el = scrollRef.current;
      if (!el) return;
      if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 10) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollBy('right');
      }
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, isPaused, scrollBy]);

  useEffect(() => {
    updateScrollState();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => { if (el) el.removeEventListener('scroll', updateScrollState); };
  }, [updateScrollState]);

  return (
    <div
      className="relative group"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Header */}
      {(title || subtitle) && (
        <div className="flex items-end justify-between mb-4">
          <div>
            {title && <h2 className="text-2xl font-black text-gray-900">{title}</h2>}
            {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => scrollBy('left')}
              disabled={!canScrollLeft}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                canScrollLeft
                  ? 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50'
                  : 'border-gray-100 text-gray-200 cursor-not-allowed'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollBy('right')}
              disabled={!canScrollRight}
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                canScrollRight
                  ? 'border-gray-200 text-gray-600 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50'
                  : 'border-gray-100 text-gray-200 cursor-not-allowed'
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-1 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {children}
      </div>

      {/* Overlay flèches latérales (visible quand pas de header) */}
      {!title && (
        <>
          {canScrollLeft && (
            <button
              onClick={() => scrollBy('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-200 transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scrollBy('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-200 transition-all opacity-0 group-hover:opacity-100 z-10"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}
        </>
      )}
    </div>
  );
}