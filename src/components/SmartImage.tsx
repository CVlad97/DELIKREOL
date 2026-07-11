import { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';

export type ImageKind = 'food' | 'ambient' | 'packaging' | 'logo' | 'portrait' | 'flyer';
type ImageFit = 'cover' | 'contain';
type ImagePosition = 'center' | 'top' | 'bottom' | `${number}% ${number}%`;

interface SmartImageProps {
  src: string;
  alt: string;
  kind?: ImageKind;
  fit?: ImageFit;
  position?: ImagePosition;
  aspectRatio?: string;
  width?: number;
  height?: number;
  srcSet?: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
  priority?: boolean;
  fallbackSrc?: string;
  containerClassName?: string;
  imgClassName?: string;
  decorative?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
}

const KIND_DEFAULTS: Record<ImageKind, { fit: ImageFit; position: ImagePosition; bg?: string; padding?: number }> = {
  food:      { fit: 'cover', position: '50% 50%' },
  ambient:   { fit: 'cover', position: '50% 50%' },
  packaging: { fit: 'contain', position: 'center', bg: '#FFF8F0' },
  logo:      { fit: 'contain', position: 'center', bg: '#FFF8F0' },
  portrait:  { fit: 'cover', position: '50% 25%' },
  flyer:     { fit: 'contain', position: 'center' },
};

const FALLBACK_IMG = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200" fill="%23ddd"%3E%3Crect width="200" height="200"/%3E%3Ctext x="50%" y="50%" text-anchor="middle" dy=".3em" fill="%23999"%3EImage%3C/text%3E%3C/svg%3E';

export function SmartImage({
  src,
  alt,
  kind = 'food',
  fit: fitProp,
  position: positionProp,
  aspectRatio,
  width,
  height,
  srcSet,
  sizes,
  loading: loadingProp,
  priority = false,
  fallbackSrc,
  containerClassName = '',
  imgClassName = '',
  decorative = false,
  onLoad,
  onError,
  onClick,
}: SmartImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const prevSrc = useRef(src);

  // Reset when src changes
  useEffect(() => {
    if (prevSrc.current !== src) {
      setError(false);
      setLoaded(false);
      prevSrc.current = src;
    }
  }, [src]);

  const defaults = KIND_DEFAULTS[kind] || KIND_DEFAULTS.food;
  const fit = fitProp ?? defaults.fit;
  const position = positionProp ?? defaults.position;
  const loading = loadingProp ?? (priority ? 'eager' : 'lazy');
  const fetchPriority: 'high' | 'low' | 'auto' = priority ? 'high' : 'auto';
  const effectiveAlt = decorative ? '' : alt;

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/30 ${containerClassName}`}
        style={{ aspectRatio, width, height }}
        role="img"
        aria-label={effectiveAlt || undefined}
      >
        <div className="text-center text-muted-foreground p-4">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs opacity-50">Image non disponible</p>
        </div>
      </div>
    );
  }

  const imgContent = (
    <div
      className={`relative overflow-hidden ${containerClassName}`}
      style={{
        aspectRatio: aspectRatio || undefined,
        width: width || undefined,
        height: height || undefined,
        backgroundColor: defaults.bg || undefined,
      }}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); } : undefined}
    >
      {!loaded && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={effectiveAlt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        onLoad={() => { setLoaded(true); onLoad?.(); }}
        onError={() => { setError(true); onError?.(); }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          objectPosition: position,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease, transform 0.5s ease',
          padding: defaults.padding ? `${defaults.padding}%` : undefined,
          boxSizing: 'border-box',
        }}
        className={imgClassName}
      />
    </div>
  );

  if (onClick) {
    return (
      <button
        onClick={onClick}
        className={`p-0 border-0 bg-transparent cursor-zoom-in block w-full ${containerClassName}`}
        style={{ aspectRatio: aspectRatio || undefined, width: width || undefined }}
        type="button"
        aria-label={`Agrandir ${alt}`}
      >
        {imgContent}
      </button>
    );
  }

  return imgContent;
}
