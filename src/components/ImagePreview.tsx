import { useEffect, useState } from 'react';
import { X, ZoomIn } from 'lucide-react';

interface ImagePreviewProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
}

export function ImagePreview({ src, alt, className = '', imgClassName = '', loading = 'lazy' }: ImagePreviewProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group relative block overflow-hidden text-left ${className}`}
        aria-label={`Agrandir la photo : ${alt}`}
        title="Cliquer pour agrandir"
      >
        <img loading={loading} src={src} alt={alt} className={imgClassName} />
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-black text-gray-800 shadow-lg">
            <ZoomIn className="h-4 w-4" /> Agrandir
          </span>
        </span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-3 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-h-[92vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white transition hover:bg-black/80"
              aria-label="Fermer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="flex max-h-[82vh] items-center justify-center bg-neutral-950">
              <img src={src} alt={alt} className="max-h-[82vh] w-full object-contain" />
            </div>
            <div className="bg-white px-4 py-3 text-sm font-semibold text-gray-700">
              {alt}
              <span className="ml-2 text-xs text-gray-400">Échap ou clic dehors pour fermer</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ImagePreview;
