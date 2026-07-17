import { useCallback, useEffect, useState } from 'react';
import { SmartImage } from './SmartImage';
import {
  resolveProductThumbnail,
  type ThumbnailSource,
} from '../services/catalogImageResolver';

interface ProductThumbnailProps {
  src?: string | null;
  partnerImage?: string | null;
  productName: string;
  vendorName?: string | null;
  category?: string | null;
  aspectRatio?: string;
  priority?: boolean;
  sizes?: string;
  containerClassName?: string;
  imgClassName?: string;
  showBadge?: boolean;
  onClick?: () => void;
}

export function ProductThumbnail({
  src,
  partnerImage,
  productName,
  vendorName,
  category,
  aspectRatio = '4 / 3',
  priority = false,
  sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
  containerClassName = '',
  imgClassName = '',
  showBadge = true,
  onClick,
}: ProductThumbnailProps) {
  const resolved = resolveProductThumbnail({
    src,
    partnerImage,
    name: productName,
    vendor: vendorName,
    category,
  });
  const [runtimeSource, setRuntimeSource] = useState<ThumbnailSource>(resolved.source);

  useEffect(() => {
    setRuntimeSource(resolved.source);
  }, [resolved.source, resolved.src]);

  const handleFallbackLevel = useCallback((level: number) => {
    if (level === 0) {
      setRuntimeSource(resolved.source);
      return;
    }

    if (
      level === 1 &&
      resolved.source === 'product' &&
      resolved.fallbackSrc !== resolved.finalFallbackSrc
    ) {
      setRuntimeSource('partner');
      return;
    }

    setRuntimeSource('placeholder');
  }, [resolved.fallbackSrc, resolved.finalFallbackSrc, resolved.source]);

  const label = runtimeSource === 'partner'
    ? 'Visuel du partenaire'
    : runtimeSource === 'placeholder'
      ? 'Photo à venir'
      : null;

  const alt = runtimeSource === 'product'
    ? `${productName}${vendorName ? ` proposé par ${vendorName}` : ''}`
    : runtimeSource === 'partner'
      ? `Visuel de ${vendorName || 'ce partenaire'} utilisé en attendant la photo de ${productName}`
      : `Photo de ${productName} prochainement disponible`;

  const runtimeKind = runtimeSource === 'partner'
    ? 'ambient'
    : runtimeSource === 'placeholder'
      ? 'flyer'
      : resolved.kind;
  const runtimeFit = runtimeSource === 'partner'
    ? 'cover'
    : runtimeSource === 'placeholder'
      ? 'contain'
      : resolved.fit;

  return (
    <div
      className={`relative overflow-hidden bg-transparent ${containerClassName}`}
      data-thumbnail-source={runtimeSource}
      data-thumbnail-product={productName}
      data-color-fidelity="original"
    >
      <SmartImage
        src={resolved.src}
        fallbackSrc={resolved.fallbackSrc}
        finalFallbackSrc={resolved.finalFallbackSrc}
        alt={alt}
        kind={runtimeKind}
        fit={runtimeFit}
        aspectRatio={aspectRatio}
        priority={priority}
        sizes={sizes}
        containerClassName="h-full w-full bg-transparent"
        imgClassName={`product-photo-natural ${imgClassName}`.trim()}
        onFallbackLevelChange={handleFallbackLevel}
        onClick={onClick}
      />

      {showBadge && label && (
        <span className="pointer-events-none absolute bottom-2 left-2 max-w-[calc(100%-1rem)] rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
          {label}
        </span>
      )}
    </div>
  );
}
