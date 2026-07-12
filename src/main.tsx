import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './services/i18n';
import './leaflet.css';
import './index.css';
import './bankable.css';
import { AppRouter } from './router';

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
