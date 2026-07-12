import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './services/i18n';
import './leaflet.css';
import './index.css';
import './bankable.css';
import { AppRouter } from './router';

const LEGACY_IMAGE_FALLBACK =
  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23f5ece4"/%3E%3Cpath d="M280 360l80-90 55 62 45-50 90 108H250z" fill="%23c9b7a8"/%3E%3Ccircle cx="320" cy="220" r="34" fill="%23d8c8ba"/%3E%3Ctext x="400" y="455" text-anchor="middle" font-family="Arial,sans-serif" font-size="28" fill="%236b5b50"%3EPhoto prochainement%3C/text%3E%3C/svg%3E';

document.addEventListener(
  'error',
  (event) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (target.dataset.smartImage === 'true' || target.dataset.fallbackApplied === 'true') return;
    if (!target.src || target.src.startsWith('data:image/')) return;

    target.dataset.fallbackApplied = 'true';
    target.removeAttribute('srcset');
    target.removeAttribute('sizes');
    target.src = LEGACY_IMAGE_FALLBACK;
    target.alt = target.alt || 'Photo prochainement';
    target.classList.add('object-contain');
  },
  true
);

const Loader = () => (
  <div className="flex min-h-screen items-center justify-center bg-background px-4">
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-soft" role="status" aria-live="polite">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/25 border-t-primary" aria-hidden="true" />
      <span className="font-display text-lg font-bold text-foreground">Chargement de DeliKreol…</span>
    </div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<Loader />}>
      <AppRouter />
    </Suspense>
  </StrictMode>,
);
