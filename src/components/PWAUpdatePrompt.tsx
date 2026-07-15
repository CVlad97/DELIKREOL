import { useEffect, useState } from 'react';
import { RefreshCw, X } from 'lucide-react';

/**
 * Bannière de mise à jour PWA — non bloquante, accessible.
 * Détecte une nouvelle version du service worker et propose la mise à jour.
 * Ne recharge pas automatiquement (respecte les formulaires en cours).
 */
export function PWAUpdatePrompt() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<(() => void) | null>(null);

  useEffect(() => {
    // Écouter l'événement de mise à jour du service worker
    const handler = (event: Event) => {
      event.preventDefault();
      setUpdateAvailable(true);
      // Stocker la fonction pour déclencher la mise à jour plus tard
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then((reg) => {
          if (reg?.waiting) {
            setDeferredPrompt(() => () => {
              reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
            });
          }
        });
      }
    };

    // VitePWA émet cet événement quand registerType='prompt'
    document.addEventListener('sw:updatefound', handler);

    // Fallback: écouter directement le controllerchange
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // Le nouveau SW a pris le contrôle — recharger proprement
        if (updateAvailable) {
          window.location.reload();
        }
      });
    }

    return () => {
      document.removeEventListener('sw:updatefound', handler);
    };
  }, [updateAvailable]);

  const handleUpdate = () => {
    if (deferredPrompt) {
      deferredPrompt();
    }
    // Recharger après un court délai pour laisser le SW s'activer
    setTimeout(() => window.location.reload(), 500);
  };

  const handleDismiss = () => {
    setUpdateAvailable(false);
  };

  if (!updateAvailable) return null;

  return (
    <div
      role="alert"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-primary/20 bg-card p-4 shadow-2xl sm:left-auto sm:right-4"
    >
      <div className="flex items-start gap-3">
        <RefreshCw className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <div className="flex-1">
          <p className="text-sm font-bold text-foreground">
            Une nouvelle version de DeliKreol est disponible
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={handleUpdate}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <RefreshCw className="h-4 w-4" />
              Mettre à jour
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="inline-flex min-h-10 items-center rounded-xl border border-input px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Plus tard
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Fermer la notification"
          className="inline-flex min-h-10 min-w-10 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
