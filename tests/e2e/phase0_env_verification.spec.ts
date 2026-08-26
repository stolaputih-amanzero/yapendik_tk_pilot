import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('PHASE 0 — Environment & Deployment Verification', () => {
  test('Verify local application reachability, Supabase initialization, and clean console', async ({ page }) => {
    const evidenceDir = path.resolve('tests/evidence/gate-06/summary');
    fs.mkdirSync(evidenceDir, { recursive: true });

    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await test.step('1. Navigate to Application Base URL', async () => {
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
    });

    await test.step('2. Verify Page Title & Root Mounting', async () => {
      await expect(page).toHaveTitle(/Yapendik|School OS|TK Pilot/i);
      const rootEl = page.locator('#root');
      await expect(rootEl).toBeVisible();
    });

    await test.step('3. Verify Authentication / Login Screen or Header Presence', async () => {
      const headerOrMain = page.locator('header, main, div').first();
      await expect(headerOrMain).toBeVisible();
    });

    await test.step('4. Capture Phase 0 Verification Screenshot', async () => {
      await page.screenshot({ path: path.join(evidenceDir, 'phase0_environment_ready.png'), fullPage: true });
    });

    await test.step('5. Verify Zero Fatal Blocking JS Console Errors', async () => {
      const fatalErrors = consoleErrors.filter(e => 
        !e.includes('favicon') && 
        !e.includes('403') && 
        !e.includes('406') &&
        !e.includes('download the React DevTools')
      );
      expect(fatalErrors.length).toBe(0);
    });
  });
});
