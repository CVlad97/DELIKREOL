type UpdateServiceWorker = (reloadPage?: boolean) => Promise<void>;

export async function activatePwaUpdate(
  updateServiceWorker: UpdateServiceWorker,
  serviceWorkerContainer: Pick<ServiceWorkerContainer, 'getRegistration'> | null =
    typeof navigator !== 'undefined' && 'serviceWorker' in navigator ? navigator.serviceWorker : null
) {
  const registration = await serviceWorkerContainer?.getRegistration();
  registration?.waiting?.postMessage({ type: 'SKIP_WAITING' });
  await updateServiceWorker(true);
}
