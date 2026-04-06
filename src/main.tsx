import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BlinkProvider, BlinkAuthProvider } from '@blinkdotnew/react';
import './leaflet.css';
import App from './App.tsx';
import './index.css';

function getProjectId(): string {
  const envId = import.meta.env.VITE_BLINK_PROJECT_ID;
  if (envId) return envId;
  const hostname = window.location.hostname;
  const match = hostname.match(/^([^.]+)\.sites\.blink\.new$/);
  if (match) return match[1];
  return 'delikreol-platform-yf4gaa0e';
}

const isLiteMode = import.meta.env.VITE_LITE_MODE === 'true';
const blinkPublishableKey = import.meta.env.VITE_BLINK_PUBLISHABLE_KEY;
const shouldUseBlinkProviders = !isLiteMode && Boolean(blinkPublishableKey);

const appTree = <App />;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {shouldUseBlinkProviders ? (
      <BlinkProvider
        projectId={getProjectId()}
        publishableKey={blinkPublishableKey}
      >
        <BlinkAuthProvider>{appTree}</BlinkAuthProvider>
      </BlinkProvider>
    ) : (
      appTree
    )}
  </StrictMode>
);
