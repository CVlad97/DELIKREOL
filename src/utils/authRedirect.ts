const AUTH_NEXT_STORAGE_KEY = 'delikreol_auth_next';

const allowedAuthPrefixes = [
  '/admin',
  '/espace-partenaire',
  '/espace-livreur',
  '/partner-documents',
  '/terminal-partenaire',
  '/compte',
];

export function sanitizeAuthNext(next?: string | null): string {
  if (!next) return '/espace-partenaire';

  let decoded = next.trim();
  try {
    decoded = decodeURIComponent(decoded).trim();
  } catch {
    return '/espace-partenaire';
  }
  if (!decoded.startsWith('/') || decoded.startsWith('//')) return '/espace-partenaire';
  if (decoded.includes('://')) return '/espace-partenaire';

  const [path] = decoded.split(/[?#]/);
  const isAllowed = allowedAuthPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));

  return isAllowed ? decoded : '/espace-partenaire';
}

export function getAuthCallbackUrl(): string {
  if (typeof window === 'undefined') return '/';
  return `${window.location.origin}${import.meta.env.BASE_URL || '/'}`;
}

export function rememberAuthNext(next: string): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(AUTH_NEXT_STORAGE_KEY, sanitizeAuthNext(next));
}

export function consumeAuthNext(): string | null {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(AUTH_NEXT_STORAGE_KEY);
  window.localStorage.removeItem(AUTH_NEXT_STORAGE_KEY);
  return value ? sanitizeAuthNext(value) : null;
}
