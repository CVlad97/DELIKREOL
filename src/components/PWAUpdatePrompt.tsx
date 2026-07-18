import { RefreshCw, X } from 'lucide-react';
import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Bannière de mise à jour PWA — non bloquante et accessible.
 * Elle utilise directement l'API React officielle de vite-plugin-pwa.
 */
export function PWAUpdatePrompt() {
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;

    navigator.serviceWorker.getRegistration().then((registration) => {
      if (registration) return;
      navigator.serviceWorker.register('/sw.js').catch((error) => {
        console.error('[PWA] Static service worker registration failed', error);
      });
    });
  }, []);

  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('[PWA] Service worker registration failed', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-border-strong bg-card p-4 shadow-2xl sm:left-auto sm:right-4"
    >
      <div className="flex items-start gap-3">
        <RefreshCw className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />

        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground">
            Une nouvelle version de DeliKreol est disponible
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void updateServiceWorker(true)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Mettre à jour
            </button>

            <button
              type="button"
              onClick={() => setNeedRefresh(false)}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-input bg-background px-4 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <X className="h-4 w-4" aria-hidden="true" />
              Plus tard
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setNeedRefresh(false)}
          aria-label="Fermer la notification"
          className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
