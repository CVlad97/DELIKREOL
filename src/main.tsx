import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './services/i18n';
import './leaflet.css';
import './index.css';
import './bankable-fixes.css';
import './image-color-fidelity.css';
import { AppRouter } from './router';
import { clearLegacyImageCaches } from './services/cacheMaintenance';
import { installNativeImageFallbacks } from './services/nativeImageFallback';
import { primePublicVendors } from './services/vendorsService';

const PRELOAD_RELOAD_KEY = 'delikreol-preload-reload-at';
const PRELOAD_RETRY_WINDOW_MS = 60_000;

window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();

  const now = Date.now();
  const previousReloadAt = Number(sessionStorage.getItem(PRELOAD_RELOAD_KEY) || '0');
  const retryAllowed = !Number.isFinite(previousReloadAt)
    || now - previousReloadAt > PRELOAD_RETRY_WINDOW_MS;

  if (retryAllowed) {
    sessionStorage.setItem(PRELOAD_RELOAD_KEY, String(now));
    window.location.reload();
    return;
  }

  console.error('[bootstrap] A stale application chunk could not be loaded after retry.');
});

installNativeImageFallbacks();

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-2xl font-display text-primary">DELIKREOL</div>
  </div>
);

const root = createRoot(document.getElementById('root')!);

root.render(<Loader />);

function renderApp() {
  root.render(
    <StrictMode>
      <Suspense fallback={<Loader />}>
        <AppRouter />
      </Suspense>
    </StrictMode>,
  );

  window.setTimeout(() => {
    sessionStorage.removeItem(PRELOAD_RELOAD_KEY);
  }, PRELOAD_RETRY_WINDOW_MS);
}

async function bootstrap() {
  renderApp();

  void clearLegacyImageCaches();

  try {
    await primePublicVendors();
    renderApp();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[bootstrap] Partner hydration failed; static catalogue retained', error);
    }
  }
}

void bootstrap();
