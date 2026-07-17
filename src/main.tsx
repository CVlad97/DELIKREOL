import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './services/i18n';
import './leaflet.css';
import './index.css';
import './bankable-fixes.css';
import './image-color-fidelity.css';
import { AppRouter } from './router';
import { installNativeImageFallbacks } from './services/nativeImageFallback';
import { primePublicVendors } from './services/vendorsService';

installNativeImageFallbacks();

const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse text-2xl font-display text-primary">DELIKREOL</div>
  </div>
);

const root = createRoot(document.getElementById('root')!);

root.render(<Loader />);

async function bootstrap() {
  try {
    await primePublicVendors();
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('[bootstrap] Partner hydration failed; static catalogue retained', error);
    }
  }

  root.render(
    <StrictMode>
      <Suspense fallback={<Loader />}>
        <AppRouter />
      </Suspense>
    </StrictMode>,
  );
}

void bootstrap();
