import { useEffect, useRef, useState } from 'react';
import { reviseSrcSet, withPublicImageRevision } from '../services/publicImageRevision';

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
  finalFallbackSrc?: string;
  containerClassName?: string;
  imgClassName?: string;
  decorative?: boolean;
  onLoad?: () => void;
  onError?: () => void;
  onFallbackLevelChange?: (level: number) => void;
  onClick?: () => void;
}

const KIND_DEFAULTS: Record<
  ImageKind,
  { fit: ImageFit; position: ImagePosition }
> = {
  food: { fit: 'cover', position: '50% 50%' },
  ambient: { fit: 'cover', position: '50% 50%' },
  packaging: { fit: 'contain', position: 'center' },
  logo: { fit: 'contain', position: 'center' },
  portrait: { fit: 'cover', position: '50% 25%' },
  flyer: { fit: 'contain', position: 'center' },
};

const FALLBACK_IMG =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23f5ece4"/%3E%3Cpath d="M280 360l80-90 55 62 45-50 90 108H250z" fill="%23c9b7a8"/%3E%3Ccircle cx="320" cy="220" r="34" fill="%23d8c8ba"/%3E%3Ctext x="400" y="455" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" fill="%236b5b50"%3EPhoto prochainement%3C/text%3E%3C/svg%3E';

function resolveSource(value?: string): string {
  return withPublicImageRevision(value || FALLBACK_IMG);
}

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
  finalFallbackSrc,
  containerClassName = '',
  imgClassName = '',
  decorative = false,
  onLoad,
  onError,
  onFallbackLevelChange,
  onClick,
}: SmartImageProps) {
  const primarySrc = resolveSource(src || fallbackSrc || finalFallbackSrc);
  const revisedFallbackSrc = fallbackSrc ? resolveSource(fallbackSrc) : undefined;
  const revisedFinalFallbackSrc = finalFallbackSrc ? resolveSource(finalFallbackSrc) : undefined;
  const revisedSrcSet = reviseSrcSet(srcSet);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [activeSrc, setActiveSrc] = useState(primarySrc);
  const [loaded, setLoaded] = useState(false);
  const [fallbackLevel, setFallbackLevel] = useState(0);

  useEffect(() => {
    setActiveSrc(primarySrc);
    setLoaded(false);
    setFallbackLevel(0);
    onFallbackLevelChange?.(0);
  }, [primarySrc, onFallbackLevelChange]);

  useEffect(() => {
    const imageElement = imageRef.current;

    if (imageElement?.complete && imageElement.naturalWidth > 0) {
      setLoaded(true);
    }
  }, [activeSrc]);

  const defaults = KIND_DEFAULTS[kind];
  const fit = fitProp ?? defaults.fit;
  const position = positionProp ?? defaults.position;
  const loading = loadingProp ?? (priority ? 'eager' : 'lazy');
  const fetchPriorityProps = priority ? { fetchpriority: 'high' } : {};
  const effectiveAlt = decorative ? '' : alt;

  const switchFallback = (nextSrc: string, level: number) => {
    setActiveSrc(nextSrc);
    setFallbackLevel(level);
    onFallbackLevelChange?.(level);
  };

  const handleImageError = () => {
    setLoaded(false);

    if (fallbackLevel === 0 && revisedFallbackSrc && revisedFallbackSrc !== activeSrc) {
      switchFallback(revisedFallbackSrc, 1);
      return;
    }

    if (
      fallbackLevel <= 1
      && revisedFinalFallbackSrc
      && revisedFinalFallbackSrc !== activeSrc
    ) {
      switchFallback(revisedFinalFallbackSrc, 2);
      return;
    }

    if (activeSrc !== FALLBACK_IMG) {
      switchFallback(FALLBACK_IMG, 3);
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
        backgroundColor: 'transparent',
      }}
      data-smart-image-container="true"
      data-image-kind={kind}
      data-image-fit={fit}
      data-color-fidelity="original"
      data-fallback-level={fallbackLevel}
    >
      {!loaded && <div className="absolute inset-0 animate-pulse bg-muted" aria-hidden="true" />}
      <img
        ref={imageRef}
        data-smart-image="true"
        data-color-fidelity="original"
        data-original-src={src}
        src={activeSrc}
        alt={effectiveAlt}
        aria-hidden={decorative || undefined}
        loading={loading}
        {...fetchPriorityProps}
        decoding="async"
        srcSet={revisedSrcSet}
        sizes={revisedSrcSet ? sizes : undefined}
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
          transition: 'opacity 0.25s ease',
          padding: 0,
          boxSizing: 'border-box',
          filter: 'none',
          mixBlendMode: 'normal',
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
