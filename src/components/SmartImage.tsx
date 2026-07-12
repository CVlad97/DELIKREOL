import { useEffect, useState } from 'react';

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

const KIND_DEFAULTS: Record<
  ImageKind,
  { fit: ImageFit; position: ImagePosition; background?: string; padding?: number }
> = {
  food: { fit: 'cover', position: '50% 50%' },
  ambient: { fit: 'cover', position: '50% 50%' },
  packaging: { fit: 'contain', position: 'center', background: '#fffaf4', padding: 6 },
  logo: { fit: 'contain', position: 'center', background: '#fffaf4', padding: 8 },
  portrait: { fit: 'cover', position: '50% 25%' },
  flyer: { fit: 'contain', position: 'center', background: '#ffffff', padding: 3 },
};

const FALLBACK_IMG =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23f5ece4"/%3E%3Cpath d="M280 360l80-90 55 62 45-50 90 108H250z" fill="%23c9b7a8"/%3E%3Ccircle cx="320" cy="220" r="34" fill="%23d8c8ba"/%3E%3Ctext x="400" y="455" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" fill="%236b5b50"%3EPhoto prochainement%3C/text%3E%3C/svg%3E';

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
  const [activeSrc, setActiveSrc] = useState(src);
  const [loaded, setLoaded] = useState(false);
  const [fallbackLevel, setFallbackLevel] = useState(0);

  useEffect(() => {
    setActiveSrc(src);
    setLoaded(false);
    setFallbackLevel(0);
  }, [src]);

  const defaults = KIND_DEFAULTS[kind];
  const fit = fitProp ?? defaults.fit;
  const position = positionProp ?? defaults.position;
  const loading = loadingProp ?? (priority ? 'eager' : 'lazy');
  const fetchPriority: 'high' | 'low' | 'auto' = priority ? 'high' : 'auto';
  const effectiveAlt = decorative ? '' : alt;

  const handleImageError = () => {
    setLoaded(false);

    if (fallbackLevel === 0 && fallbackSrc && fallbackSrc !== activeSrc) {
      setActiveSrc(fallbackSrc);
      setFallbackLevel(1);
      return;
    }

    if (activeSrc !== FALLBACK_IMG) {
      setActiveSrc(FALLBACK_IMG);
      setFallbackLevel(2);
      onError?.();
    }
  };

  const image = (
    <div
      className={`relative overflow-hidden ${containerClassName}`}
      style={{
        aspectRatio: aspectRatio || undefined,
        width: width || undefined,
        height: height || undefined,
        backgroundColor: defaults.background || undefined,
      }}
    >
      {!loaded && (
        <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />
      )}
      <img
        data-smart-image="true"
        src={activeSrc}
        alt={effectiveAlt}
        aria-hidden={decorative || undefined}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        width={width}
        height={height}
        draggable={false}
        onLoad={() => {
          setLoaded(true);
          onLoad?.();
        }}
        onError={handleImageError}
        style={{
          width: '100%',
          height: '100%',
          objectFit: fit,
          objectPosition: position,
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.25s ease, transform 0.45s ease',
          padding: defaults.padding ? `${defaults.padding}%` : undefined,
          boxSizing: 'border-box',
        }}
        className={imgClassName}
      />
    </div>
  );

  if (!onClick) return image;

  return (
    <button
      type="button"
      onClick={onClick}
      className="block w-full cursor-zoom-in rounded-[inherit] border-0 bg-transparent p-0 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      aria-label={`Agrandir : ${alt}`}
    >
      {image}
    </button>
  );
}
