import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4175';
const usePrebuiltDist = process.env.PLAYWRIGHT_USE_PREBUILT === 'true';
const previewMode = process.env.E2E_ISOLATED_PREVIEW === 'true' ? ' --mode test' : '';
const previewCommand = `npx vite preview --host 127.0.0.1 --port 4175${previewMode}`;
const webServerCommand = usePrebuiltDist
  ? previewCommand
  : `npm run build && ${previewCommand}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    viewport: { width: 390, height: 844 },
    ...(process.env.E2E_CHROMIUM_EXECUTABLE ? { launchOptions: { executablePath: process.env.E2E_CHROMIUM_EXECUTABLE } } : {}),
    trace: 'retain-on-failure',
  },
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
