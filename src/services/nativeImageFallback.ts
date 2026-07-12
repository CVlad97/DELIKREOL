import { getThumbnailPlaceholder } from './catalogImageResolver';

const FALLBACK_ATTRIBUTE = 'data-native-image-fallback';

function shouldIgnore(image: HTMLImageElement): boolean {
  const source = image.currentSrc || image.src || '';
  return (
    image.dataset.smartImage === 'true' ||
    image.classList.contains('leaflet-tile') ||
    source.includes('tile.openstreetmap.org') ||
    source.includes('/vignettes/photo-prochainement.svg') ||
    source.startsWith('data:image/')
  );
}

function applyFallback(image: HTMLImageElement): void {
  if (shouldIgnore(image) || image.hasAttribute(FALLBACK_ATTRIBUTE)) return;

  const originalSource = image.currentSrc || image.src || '';
  image.setAttribute(FALLBACK_ATTRIBUTE, 'true');
  image.dataset.originalImage = originalSource;
  image.removeAttribute('srcset');
  image.removeAttribute('sizes');
  image.loading = 'eager';
  image.src = getThumbnailPlaceholder();
  image.style.objectFit = 'contain';
  image.style.objectPosition = 'center';
  image.style.backgroundColor = '#fffaf4';
  image.style.padding = '0.35rem';
  image.alt = image.alt
    ? `${image.alt} — photo prochainement disponible`
    : 'Photo prochainement disponible';

  const host = image.parentElement;
  if (host) {
    host.classList.add('native-image-fallback-host');
    host.setAttribute('data-image-fallback-label', 'Photo à venir');
  }
}

export function installNativeImageFallbacks(): () => void {
  if (typeof document === 'undefined') return () => undefined;

  const handleError = (event: Event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement) applyFallback(target);
  };

  document.addEventListener('error', handleError, true);

  queueMicrotask(() => {
    for (const image of Array.from(document.images)) {
      if (image.complete && image.naturalWidth === 0) applyFallback(image);
    }
  });

  return () => document.removeEventListener('error', handleError, true);
}
