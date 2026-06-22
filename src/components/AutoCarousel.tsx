import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';

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

  // Auto-rotation every 5s
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(goNext, 5000);
    return () => clearInterval(timer);
  }, [goNext, isPaused]);

  if (items.length === 0) return null;
  const current = items[currentIndex];

  const getCategoryLabel = (product: CarouselItem) => {
    if (product.category === 'Desserts') return '🍨 Dessert';
    if (product.category === 'Entrées') return '🥗 Entrée';
    const name = product.name.toLowerCase();
    if (name.includes('salade') || name.includes('nems')) return '🥗 Entrée';
    return '🍛 Plat';
  };

  // Items visibles (current + 2 suivants)
  const visible = [
    items[(currentIndex) % items.length],
    items[(currentIndex + 1) % items.length],
    items[(currentIndex + 2) % items.length],
  ];

  return (
    <div
      className="relative max-w-4xl mx-auto"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Indicateur de progression */}
      <div className="flex justify-center gap-1.5 mb-6">
        {items.slice(0, 8).map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentIndex(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? 'w-8 bg-orange-500' : 'w-1.5 bg-gray-200 hover:bg-gray-300'
            }`}
          />
        ))}
      </div>

      {/* Cartes visibles */}
      <div className="flex justify-center gap-4 md:gap-6">
        {visible.map((product, i) => (
          <Link
            key={`${product.name}-${i}`}
            to="/catalogue"
            className={`bg-white rounded-2xl border transition-all duration-500 group ${
              i === 0
                ? 'w-56 md:w-64 scale-100 border-orange-200 shadow-xl z-10'
                : 'w-40 md:w-48 scale-90 border-gray-100 shadow-md opacity-70 hidden md:block'
            } hover:border-orange-300`}
          >
            <div className={`${i === 0 ? 'aspect-[4/3]' : 'aspect-square'} rounded-t-2xl overflow-hidden bg-orange-50`}>
              {product.image ? (
                <img loading="lazy" src={product.image} alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-orange-200 text-3xl">🍽️</div>
              )}
            </div>
            <div className={`p-3 ${i === 0 ? 'p-4' : ''}`}>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">{getCategoryLabel(product)}</p>
              <p className={`font-bold text-gray-900 truncate mt-0.5 ${i === 0 ? 'text-base' : 'text-sm'}`}>
                {product.name.split('—').pop() || product.name}
              </p>
              {i === 0 && <p className="text-xs text-gray-400 truncate mt-0.5">{product.vendor}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className={`font-bold text-orange-600 ${i === 0 ? 'text-base' : 'text-sm'}`}>
                  {product.price.toFixed(2)} €
                </span>
                {i === 0 && (
                  <span className="text-[10px] px-2 py-0.5 bg-orange-50 text-orange-600 rounded-full font-semibold">
                    Ajouter
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Flèches navigation */}
      <button
        onClick={goPrev}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-200 transition-all"
      >
        ◀
      </button>
      <button
        onClick={goNext}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-10 h-10 rounded-full bg-white shadow-lg border border-gray-100 flex items-center justify-center text-gray-600 hover:text-orange-500 hover:border-orange-200 transition-all"
      >
        ▶
      </button>

      {/* Pause indicator */}
      {isPaused && (
        <div className="text-center mt-4">
          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">⏸ En pause</span>
        </div>
      )}
    </div>
  );
}