export type SocialLinkSet = {
  instagram?: string;
  facebook?: string;
  website?: string;
};

const ALLOWED_SOCIAL_HOSTS: Record<keyof SocialLinkSet, string[]> = {
  instagram: ['instagram.com', 'www.instagram.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'fb.com', 'www.fb.com'],
  website: [],
};

function normalizeUrl(value: string | null | undefined): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;

  try {
    const url = new URL(trimmed.startsWith('http://') || trimmed.startsWith('https://') ? trimmed : `https://${trimmed}`);
    if (url.protocol !== 'https:') return undefined;
    url.hash = '';
    return url.toString();
  } catch {
    return undefined;
  }
}

export function sanitizeSocialUrl(kind: keyof SocialLinkSet, value: string | null | undefined): string | undefined {
  const normalized = normalizeUrl(value);
  if (!normalized) return undefined;

  const url = new URL(normalized);
  const allowedHosts = ALLOWED_SOCIAL_HOSTS[kind];
  if (allowedHosts.length > 0 && !allowedHosts.includes(url.hostname.toLowerCase())) return undefined;

  return url.toString();
}

export function socialLabel(kind: keyof SocialLinkSet, value: string): string {
  const url = new URL(value);
  if (kind === 'instagram') {
    const handle = url.pathname.split('/').filter(Boolean)[0];
    return handle ? `@${handle}` : 'Instagram';
  }
  if (kind === 'facebook') {
    const page = url.pathname.split('/').filter(Boolean)[0];
    return page ? `Facebook ${page}` : 'Facebook';
  }
  return url.hostname.replace(/^www\./, '');
}

export function sanitizeSocialLinks(input: Partial<SocialLinkSet> | null | undefined): SocialLinkSet {
  if (!input) return {};
  return {
    instagram: sanitizeSocialUrl('instagram', input.instagram),
    facebook: sanitizeSocialUrl('facebook', input.facebook),
    website: sanitizeSocialUrl('website', input.website),
  };
}
