import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './services/i18n';
import './leaflet.css';
import './index.css';
import './bankable-fixes.css';
import { AppRouter } from './router';
import { installNativeImageFallbacks } from './services/nativeImageFallback';

installNativeImageFallbacks();

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-pulse text-2xl font-display text-primary">DELIKREOL</div>
  </div>
);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense fallback={<Loader />}>
      <AppRouter />
    </Suspense>
  </StrictMode>,
);
