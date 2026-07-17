export const PUBLIC_IMAGE_REVISION = '20260718-1';

const ABSOLUTE_SCHEME = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Adds a build-controlled cache key to local public images only.
 * External, data and blob URLs are left unchanged.
 */
export function withPublicImageRevision(src: string): string {
  const value = src.trim();
  if (!value || value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (ABSOLUTE_SCHEME.test(value)) return value;

  const hashIndex = value.indexOf('#');
  const withoutHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const hash = hashIndex >= 0 ? value.slice(hashIndex) : '';
  const separator = withoutHash.includes('?') ? '&' : '?';

  return `${withoutHash}${separator}v=${PUBLIC_IMAGE_REVISION}${hash}`;
}

export function reviseSrcSet(srcSet?: string): string | undefined {
  if (!srcSet) return srcSet;

  return srcSet
    .split(',')
    .map((candidate) => {
      const trimmed = candidate.trim();
      if (!trimmed) return trimmed;
      const firstSpace = trimmed.search(/\s/);
      if (firstSpace < 0) return withPublicImageRevision(trimmed);
      const url = trimmed.slice(0, firstSpace);
      const descriptor = trimmed.slice(firstSpace);
      return `${withPublicImageRevision(url)}${descriptor}`;
    })
    .join(', ');
}
