import { useEffect, useCallback, useState } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ImageLightboxProps {
  images: { src: string; alt: string; caption?: string }[];
  initialIndex?: number;
  onClose: () => void;
}

export function ImageLightbox({ images, initialIndex = 0, onClose }: ImageLightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [fullscreen, setFullscreen] = useState(false);

  const current = images[index];

  const goNext = useCallback(() => setIndex((i) => (i + 1) % images.length), [images.length]);
  const goPrev = useCallback(() => setIndex((i) => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'f') setFullscreen(!fullscreen);
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, goNext, goPrev, fullscreen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!zoomed) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={current.caption || current.alt}
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-3">
          {images.length > 1 && (
            <span className="text-white/70 text-sm font-medium bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-sm">
              {index + 1} / {images.length}
            </span>
          )}
          {current.caption && (
            <span className="text-white/80 text-sm truncate max-w-[300px] hidden sm:block">
              {current.caption}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setZoomed(!zoomed); }}
            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/25 transition-all backdrop-blur-sm"
            title={zoomed ? 'Dézoomer' : 'Zoomer (clic sur l\'image)'}
            aria-label={zoomed ? 'Dézoomer la photo' : 'Zoomer la photo'}
          >
            {zoomed ? <ZoomOut className="w-5 h-5" /> : <ZoomIn className="w-5 h-5" />}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setFullscreen(!fullscreen); }}
            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/25 transition-all backdrop-blur-sm"
            title="Plein écran (F)"
            aria-label="Afficher la photo en plein écran"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 text-white hover:bg-white/25 transition-all backdrop-blur-sm"
            title="Fermer (Échap)"
            aria-label="Fermer la photo en gros plan"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-all backdrop-blur-sm opacity-60 hover:opacity-100"
            aria-label="Photo précédente"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/10 text-white hover:bg-white/25 transition-all backdrop-blur-sm opacity-60 hover:opacity-100"
            aria-label="Photo suivante"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </>
      )}

      {/* Image - immersive full screen */}
      <div
        className={`flex items-center justify-center cursor-crosshair ${fullscreen ? 'w-screen h-screen' : 'max-w-[95vw] max-h-[92vh]'}`}
        onClick={(e) => e.stopPropagation()}
        onMouseMove={handleMouseMove}
      >
        {zoomed ? (
          <div className="relative overflow-hidden w-full h-full">
            <img
              src={current.src}
              alt={current.alt}
              className="absolute max-w-none"
              style={{
                width: '250%',
                height: '250%',
                objectFit: 'none',
                transform: `translate(-${mousePos.x / 1.5}%, -${mousePos.y / 1.5}%)`,
              }}
            />
          </div>
        ) : (
          <img
            src={current.src}
            alt={current.alt}
            className="max-w-full max-h-full object-contain drop-shadow-2xl"
            style={{ maxHeight: fullscreen ? '100vh' : '88vh' }}
          />
        )}
      </div>

      {/* Bottom caption for mobile */}
      {current.caption && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 sm:hidden bg-black/70 text-white px-4 py-2 rounded-full text-xs max-w-[90%] text-center backdrop-blur-sm">
          {current.caption}
        </div>
      )}
    </div>
  );
}
