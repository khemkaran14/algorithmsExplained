import { loadEnvFile } from 'node:process';
try {
  loadEnvFile('.env');
} catch (error) {
  if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
}
import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {},
    baseURL: 'http://127.0.0.1:3000',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        extraHTTPHeaders: { 'X-Real-IP': '127.0.0.2' },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone SE'],
        defaultBrowserType: 'chromium',
        extraHTTPHeaders: { 'X-Real-IP': '127.0.0.3' },
      },
    },
  ],
  webServer: {
    command: 'pnpm start',
    url: 'http://127.0.0.1:3000',
    reuseExistingServer: !process.env.CI,
    env: {
      RATE_LIMIT_MODE: 'memory',
      // Model two proxy-identified clients so projects do not exhaust one actor's budget.
      TRUSTED_PROXY_IP_HEADER: 'x-real-ip',
      AUTH_SECRET: 'test-only-not-for-production-000000000000000000',
      AUTH_URL: 'http://127.0.0.1:3000',
      RAZORPAY_WEBHOOK_SECRET: 'e2e-fixture-webhook-secret-not-for-production',
    },
  },
});
