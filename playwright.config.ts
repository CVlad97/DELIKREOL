import { defineConfig } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:4175';
const usePrebuiltDist = process.env.PLAYWRIGHT_USE_PREBUILT === 'true';
const isRemoteBaseURL = !/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?/i.test(baseURL);
const previewCommand = 'npx vite preview --host 127.0.0.1 --port 4175';
const webServerCommand = usePrebuiltDist
  ? previewCommand
  : `npm run build && ${previewCommand}`;

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 45_000,
  expect: {
    timeout: 12_000,
  },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI
    ? [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]]
    : [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    viewport: { width: 390, height: 844 },
    actionTimeout: 12_000,
    navigationTimeout: 30_000,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
    video: 'retain-on-failure',
    serviceWorkers: 'block',
  },
  webServer: isRemoteBaseURL
    ? undefined
    : {
        command: webServerCommand,
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
