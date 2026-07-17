export const ACTIVE_IMAGE_CACHE = 'delikreol-images-v2';
const IMAGE_CACHE_PREFIX = 'delikreol-images';

type CacheStorageSubset = Pick<CacheStorage, 'keys' | 'delete'>;

/**
 * Removes only obsolete DeliKreol image caches.
 * Other Workbox, authentication and third-party caches are left untouched.
 */
export async function clearLegacyImageCaches(
  storage?: CacheStorageSubset,
): Promise<string[]> {
  const cacheStorage = storage
    ?? (typeof globalThis.caches === 'undefined' ? undefined : globalThis.caches);

  if (!cacheStorage) return [];

  try {
    const cacheNames = await cacheStorage.keys();
    const obsolete = cacheNames.filter((name) => (
      name.startsWith(IMAGE_CACHE_PREFIX) && name !== ACTIVE_IMAGE_CACHE
    ));

    const deleted = await Promise.all(
      obsolete.map(async (name) => ((await cacheStorage.delete(name)) ? name : null)),
    );

    return deleted.filter((name): name is string => Boolean(name));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[cache] Unable to clear legacy image caches', error);
    }
    return [];
  }
}
