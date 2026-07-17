import { describe, expect, it, vi } from 'vitest';
import { ACTIVE_IMAGE_CACHE, clearLegacyImageCaches } from './cacheMaintenance';

describe('clearLegacyImageCaches', () => {
  it('supprime uniquement les anciens caches image DeliKreol', async () => {
    const storage = {
      keys: vi.fn().mockResolvedValue([
        'workbox-precache-v2',
        'google-fonts',
        'delikreol-images',
        'delikreol-images-v1',
        ACTIVE_IMAGE_CACHE,
      ]),
      delete: vi.fn().mockResolvedValue(true),
    };

    const deleted = await clearLegacyImageCaches(storage as unknown as CacheStorage);

    expect(deleted).toEqual(['delikreol-images', 'delikreol-images-v1']);
    expect(storage.delete).toHaveBeenCalledTimes(2);
    expect(storage.delete).toHaveBeenCalledWith('delikreol-images');
    expect(storage.delete).toHaveBeenCalledWith('delikreol-images-v1');
    expect(storage.delete).not.toHaveBeenCalledWith(ACTIVE_IMAGE_CACHE);
    expect(storage.delete).not.toHaveBeenCalledWith('workbox-precache-v2');
  });

  it('reste silencieux lorsque Cache Storage est indisponible', async () => {
    await expect(clearLegacyImageCaches(undefined)).resolves.toEqual([]);
  });
});
