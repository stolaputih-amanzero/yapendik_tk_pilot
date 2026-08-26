import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45000,
  expect: {
    timeout: 10000
  },
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'tests/evidence/gate-06/html-report', open: 'never' }]
  ],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on',
    screenshot: 'on',
    video: 'on',
    viewport: { width: 1440, height: 900 },
    ignoreHTTPSErrors: true
  },
  projects: [
    {
      name: 'chromium',
      use: {
        viewport: { width: 1440, height: 900 }
      },
    }
  ],
  outputDir: 'tests/evidence/gate-06/raw-artifacts'
});
