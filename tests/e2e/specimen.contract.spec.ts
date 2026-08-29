/**
 * Amanaura Design System v3.0 — Living Contract E2E Playwright Spec
 * Proves: DOKUMEN = RENDER = TEST across 6 states:
 * (COMPACT 390x844 / MEDIUM 768x1024 / EXPANDED 1440x900) x (Frangipani Day / Night Temple)
 */

import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844, sizeClass: 'COMPACT' },
  { name: '768x1024', width: 768, height: 1024, sizeClass: 'MEDIUM' },
  { name: '1440x900', width: 1440, height: 900, sizeClass: 'EXPANDED' },
];

const THEMES = [
  { name: 'light', label: 'Frangipani Day', expectedCanvasHex: '#F7F4ED', expectedCanvasRgb: 'rgb(247, 244, 237)' },
  { name: 'dark', label: 'Night Temple', expectedCanvasHex: '#16130F', expectedCanvasRgb: 'rgb(22, 19, 15)' },
];

// Ensure baseline directory exists
const vrtDir = path.resolve('tests', 'vrt-baseline');
if (!fs.existsSync(vrtDir)) {
  fs.mkdirSync(vrtDir, { recursive: true });
}

for (const vp of VIEWPORTS) {
  for (const th of THEMES) {
    test(`[LIVING CONTRACT] State: ${vp.sizeClass} (${vp.name}) × ${th.label} (${th.name})`, async ({ page }) => {
      // 1. Configure viewport & theme state
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.addInitScript(({ themeName }) => {
        localStorage.setItem('yapendik_theme', themeName);
      }, { themeName: th.name });

      // 2. Open Specimen Page
      await page.goto('http://localhost:3000/#percontohan');

      // If login screen is shown, switch to simulation tab if needed and select Siti Rahmawati
      const simTabBtn = page.locator('button', { hasText: 'Simulasi Persona' }).first();
      if (await simTabBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await simTabBtn.click();
      }

      const personaItem = page.locator('text=Siti Rahmawati').first();
      if (await personaItem.isVisible({ timeout: 1500 }).catch(() => false)) {
        await personaItem.click();
        await page.waitForTimeout(500);
      }

      // Ensure hash is on #percontohan
      if (!page.url().includes('#percontohan')) {
        await page.goto('http://localhost:3000/#percontohan');
      }

      // 3. Wait for fonts and specimen content
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('h1', { hasText: 'Header Kontrak' }).first()).toBeVisible({ timeout: 15000 });

      // 4. Assert Computed Canvas Color
      const computedCanvas = await page.evaluate(() => {
        return getComputedStyle(document.documentElement).getPropertyValue('--p-canvas').trim();
      });
      expect(computedCanvas.toUpperCase()).toBe(th.expectedCanvasHex);

      // 5. Assert Typography (Plus Jakarta Sans & JetBrains Mono)
      const bodyFontFamily = await page.evaluate(() => {
        return getComputedStyle(document.body).fontFamily;
      });
      expect(bodyFontFamily.toLowerCase()).toContain('plus jakarta sans');

      const monoFontFamily = await page.evaluate(() => {
        const monoEl = document.querySelector('.font-mono');
        return monoEl ? getComputedStyle(monoEl).fontFamily : '';
      });
      expect(monoFontFamily.toLowerCase()).toContain('jetbrains mono');

      // 6. Viewport-specific assertions
      if (vp.sizeClass === 'EXPANDED') {
        const mainWidth = await page.evaluate(() => {
          const mainEl = document.querySelector('main');
          return mainEl ? mainEl.getBoundingClientRect().width : 0;
        });
        // max-w-7xl is 1280px + padding
        expect(mainWidth).toBeLessThanOrEqual(1320);

        // SegmentedControl w-fit check (< 60% viewport width)
        const segWidth = await page.evaluate(() => {
          const segEl = document.querySelector('[role="tablist"]');
          return segEl ? segEl.getBoundingClientRect().width : 0;
        });
        expect(segWidth).toBeLessThan(vp.width * 0.60);
      }

      if (vp.sizeClass === 'COMPACT') {
        // First ListItem has margin-left == 0 (edge-to-edge)
        const itemMarginLeft = await page.evaluate(() => {
          const item = document.querySelector('[role="button"]') || document.querySelector('.border-b.border-line-soft');
          if (!item) return -1;
          const style = getComputedStyle(item);
          return parseFloat(style.marginLeft) || 0;
        });
        expect(itemMarginLeft).toBe(0);
      }

      // 7. Save Screenshot Baseline
      const screenshotPath = path.join(vrtDir, `${vp.name}-${th.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  }
}
