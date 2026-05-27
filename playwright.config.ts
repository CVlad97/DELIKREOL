import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4175';
const usePrebuiltDist = process.env.PLAYWRIGHT_USE_PREBUILT === 'true';
const webServerCommand = usePrebuiltDist
  ? 'python3 -m http.server 4175 -d dist'
  : 'npm run build && python3 -m http.server 4175 -d dist';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL,
    viewport: { width: 390, height: 844 },
    trace: 'retain-on-failure',
  },
  webServer: {
    command: webServerCommand,
    url: baseURL,
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
