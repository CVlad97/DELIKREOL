import type { ImageKind } from '../components/SmartImage';

export type ThumbnailSource = 'product' | 'partner' | 'placeholder';

export interface ThumbnailInput {
  src?: string | null;
  partnerImage?: string | null;
  name?: string | null;
  vendor?: string | null;
  category?: string | null;
}

export interface ResolvedThumbnail {
  src: string;
  fallbackSrc: string;
  finalFallbackSrc: string;
  source: ThumbnailSource;
  label: string | null;
  kind: ImageKind;
  fit: 'cover' | 'contain';
}

const PLACEHOLDER_PATH = 'vignettes/photo-prochainement.svg';

export function publicAsset(relativePath: string): string {
  const base = import.meta.env.BASE_URL || '/';
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalizedBase}${relativePath.replace(/^\/+/, '')}`;
}

export function getThumbnailPlaceholder(): string {
  return publicAsset(PLACEHOLDER_PATH);
}

export function isUsableThumbnail(src?: string | null): src is string {
  if (!src) return false;
  const value = src.trim();
  if (!value) return false;

  return ![
    'photo-a-confirmer',
    'photo_a_confirmer',
    'image-non-disponible',
    'image_non_disponible',
    'placeholder',
  ].some((token) => value.toLowerCase().includes(token));
}

function normalize(value?: string | null): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function inferProductImageKind(input: Pick<ThumbnailInput, 'name' | 'vendor' | 'category'>): ImageKind {
  const value = normalize(`${input.name || ''} ${input.vendor || ''} ${input.category || ''}`);
  const compactValue = value.replace(/[^a-z0-9]/g, '');

  if (
    value.includes('logo') ||
    value.includes('marque')
  ) {
    return 'logo';
  }

  if (
    value.includes('flyer') ||
    value.includes('menu') ||
    value.includes('affiche')
  ) {
    return 'flyer';
  }

  /*
   * Les visuels Save Peyi'A contiennent souvent une composition de marque,
   * du texte et du packaging. Ils doivent rester entièrement visibles, même
   * lorsque le nom du produit ressemble à un plat classique.
   */
  if (compactValue.includes('savepeyia')) {
    return 'packaging';
  }

  if (
    compactValue.includes('saveursdafrique') &&
    normalize(input.category).includes('plat')
  ) {
    return 'food';
  }

  if (
    value.includes('bouteille') ||
    value.includes('bocal') ||
    value.includes('pot ') ||
    value.includes('sachet') ||
    value.includes('sirop') ||
    value.includes('sauce') ||
    value.includes('jus') ||
    value.includes('punch') ||
    value.includes('nectar') ||
    value.includes('boisson') ||
    value.includes('confiture') ||
    value.includes('epice') ||
    value.includes('glace') ||
    value.includes('sorbet') ||
    value.includes('goute mwen')
  ) {
    return 'packaging';
  }

  return 'food';
}

export function resolveProductThumbnail(input: ThumbnailInput): ResolvedThumbnail {
  const placeholder = getThumbnailPlaceholder();
  const productImage = isUsableThumbnail(input.src) ? input.src : null;
  const partnerImage = isUsableThumbnail(input.partnerImage) ? input.partnerImage : null;
  const source: ThumbnailSource = productImage
    ? 'product'
    : partnerImage
      ? 'partner'
      : 'placeholder';

  const src = productImage || partnerImage || placeholder;
  const fallbackSrc = productImage ? (partnerImage || placeholder) : placeholder;
  const kind = source === 'partner'
    ? 'ambient'
    : source === 'placeholder'
      ? 'flyer'
      : inferProductImageKind(input);

  return {
    src,
    fallbackSrc,
    finalFallbackSrc: placeholder,
    source,
    label: source === 'partner'
      ? 'Visuel du partenaire'
      : source === 'placeholder'
        ? 'Photo à venir'
        : null,
    kind,
    fit: kind === 'food' || kind === 'ambient' || kind === 'portrait' ? 'cover' : 'contain',
  };
}
