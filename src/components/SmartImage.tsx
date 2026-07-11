import { useState } from 'react';
import { AlertCircle } from 'lucide-react';

type ImageFit = 'cover' | 'contain';
type ImagePosition = 'center' | 'top' | 'bottom' | `${number}% ${number}%`;

interface SmartImageProps {
  src: string;
  alt: string;
  fit?: ImageFit;
  position?: ImagePosition;
  aspectRatio?: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  fetchPriority?: 'high' | 'low' | 'auto';
  onClick?: () => void;
  bgColor?: string;
  padding?: number;
}

export function SmartImage({
  src,
  alt,
  fit = 'cover',
  position = 'center',
  aspectRatio,
  className = '',
  loading = 'lazy',
  fetchPriority = 'auto',
  onClick,
  bgColor,
  padding = 0,
}: SmartImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (error) {
    return (
      <div
        className={`flex items-center justify-center bg-muted/30 ${className}`}
        style={{ aspectRatio }}
      >
        <div className="text-center text-muted-foreground p-4">
          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-xs opacity-50">Image non disponible</p>
        </div>
      </div>
    );
  }

  const containerStyle: React.CSSProperties = {
    overflow: 'hidden',
    aspectRatio: aspectRatio || undefined,
    backgroundColor: bgColor || undefined,
  };

  const imgStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    objectPosition: position,
    transition: 'transform 0.5s ease, opacity 0.3s ease',
    opacity: loaded ? 1 : 0,
    padding: padding ? `${padding}%` : undefined,
    boxSizing: 'border-box',
  };

  return (
    <div style={containerStyle} className={`relative ${className}`} onClick={onClick}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/20 animate-pulse">
          <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        fetchPriority={fetchPriority}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
        style={imgStyle}
      />
    </div>
  );
}

/**
 * Returns the appropriate fit mode based on image type.
 */
export function getImageType(fileName: string): 'food' | 'packaging' | 'logo' | 'portrait' | 'flyer' | 'gallery' {
  const name = fileName.toLowerCase();
  if (name.includes('hero') && !name.includes('goute-mwen')) return 'logo';
  if (name.includes('portrait')) return 'portrait';
  if (name.includes('logo')) return 'logo';
  if (name.includes('goute-mwen') || name.includes('super-coco')) return 'packaging';
  if (name.includes('menu') || name.includes('flyer') || name.includes('carte')) return 'flyer';
  if (name.includes('boisson') || name.includes('bouteille') || name.includes('bocal')) return 'packaging';
  if (name.includes('sf-') || name.includes('vignette') || name.includes('branded')) return 'food';
  if (name.startsWith('gallery-')) return 'gallery';
  return 'food';
}

export function getFitForImageType(type: string): 'cover' | 'contain' {
  switch (type) {
    case 'packaging':
    case 'logo':
    case 'flyer':
      return 'contain';
    case 'food':
    case 'portrait':
    case 'gallery':
      return 'cover';
    default:
      return 'cover';
  }
}

export function getPositionForImageType(type: string): ImagePosition {
  switch (type) {
    case 'portrait':
      return '50% 25%';
    case 'logo':
    case 'packaging':
    case 'flyer':
      return 'center';
    case 'food':
    case 'gallery':
      return '50% 50%';
    default:
      return 'center';
  }
}