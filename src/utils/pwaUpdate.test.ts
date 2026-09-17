import { describe, expect, it, vi } from 'vitest';
import { activatePwaUpdate } from './pwaUpdate';

describe('activatePwaUpdate', () => {
  it('activates the waiting worker before requesting the reload', async () => {
    const postMessage = vi.fn();
    const updateServiceWorker = vi.fn().mockResolvedValue(undefined);
    const serviceWorkerContainer = {
      getRegistration: vi.fn().mockResolvedValue({ waiting: { postMessage } }),
    };

    await activatePwaUpdate(updateServiceWorker, serviceWorkerContainer);

    expect(postMessage).toHaveBeenCalledWith({ type: 'SKIP_WAITING' });
    expect(updateServiceWorker).toHaveBeenCalledWith(true);
    expect(postMessage.mock.invocationCallOrder[0]).toBeLessThan(updateServiceWorker.mock.invocationCallOrder[0]);
  });

  it('still requests the update when no worker is waiting', async () => {
    const updateServiceWorker = vi.fn().mockResolvedValue(undefined);
    const serviceWorkerContainer = {
      getRegistration: vi.fn().mockResolvedValue(undefined),
    };

    await activatePwaUpdate(updateServiceWorker, serviceWorkerContainer);

    expect(updateServiceWorker).toHaveBeenCalledWith(true);
  });
});
