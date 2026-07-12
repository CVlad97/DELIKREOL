import { SmartImage } from './SmartImage';
import { resolveProductThumbnail } from '../services/catalogImageResolver';

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

  const alt = resolved.source === 'product'
    ? `${productName}${vendorName ? ` proposé par ${vendorName}` : ''}`
    : resolved.source === 'partner'
      ? `Visuel de ${vendorName || 'ce partenaire'} utilisé en attendant la photo de ${productName}`
      : `Photo de ${productName} prochainement disponible`;

  return (
    <div
      className={`relative overflow-hidden ${containerClassName}`}
      data-thumbnail-source={resolved.source}
      data-thumbnail-product={productName}
    >
      <SmartImage
        src={resolved.src}
        fallbackSrc={resolved.fallbackSrc}
        finalFallbackSrc={resolved.finalFallbackSrc}
        alt={alt}
        kind={resolved.kind}
        fit={resolved.fit}
        aspectRatio={aspectRatio}
        priority={priority}
        sizes={sizes}
        containerClassName="h-full w-full"
        imgClassName={imgClassName}
        onClick={onClick}
      />

      {showBadge && resolved.label && (
        <span className="pointer-events-none absolute bottom-2 left-2 max-w-[calc(100%-1rem)] rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow-sm backdrop-blur-sm">
          {resolved.label}
        </span>
      )}
    </div>
  );
}
