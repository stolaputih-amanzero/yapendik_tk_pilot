import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const VIEWPORTS = [
  { name: '390x844', width: 390, height: 844, sizeClass: 'COMPACT' },
  { name: '768x1024', width: 768, height: 1024, sizeClass: 'MEDIUM' },
  { name: '1024x768', width: 1024, height: 768, sizeClass: 'EXPANDED-MID' },
  { name: '1440x900', width: 1440, height: 900, sizeClass: 'EXPANDED' },
];

const THEMES = [
  { name: 'light', label: 'Frangipani Day' },
  { name: 'dark', label: 'Night Temple' },
];

const outDir = path.resolve('tests', 'vrt-baseline', 'teacher-home-audit');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const vp of VIEWPORTS) {
  for (const th of THEMES) {
    test(`[AUDIT] Teacher Home: ${vp.sizeClass} (${vp.name}) × ${th.label} (${th.name})`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });

      await page.addInitScript(({ themeName }) => {
        localStorage.setItem('yapendik_theme', themeName);
      }, { themeName: th.name });

      await page.goto('http://localhost:3000/#beranda-guru');

      const simTabBtn = page.locator('button', { hasText: 'Simulasi Persona' }).first();
      if (await simTabBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await simTabBtn.click();
      }

      const personaItem = page.locator('text=Siti Rahmawati').first();
      if (await personaItem.isVisible({ timeout: 1500 }).catch(() => false)) {
        await personaItem.click();
        await page.waitForTimeout(500);
      }

      if (!page.url().includes('#beranda-guru')) {
        await page.goto('http://localhost:3000/#beranda-guru');
      }

      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1000);

      // Universal Layout & Anti-Overlap Invariant Assertions (V-14)
      const pulseBannerCard = page.locator('.rounded-card').filter({ hasText: 'Kelompok A' }).first();
      const reconciliationCard = vp.width < 1200
        ? page.locator('.large\\:hidden').locator('.rounded-card').filter({ hasText: /Status Rekonsiliasi|Semua Tugas Selesai/ }).first()
        : page.locator('.large\\:block').locator('.rounded-card').filter({ hasText: /Status Rekonsiliasi|Semua Tugas Selesai/ }).first();
      const todaySurfaceTitle = page.locator('text=Presensi Harian').first();

      await expect(pulseBannerCard).toBeVisible();
      await expect(reconciliationCard).toBeVisible();

      const boxBanner = await pulseBannerCard.boundingBox();
      const boxReconciliation = await reconciliationCard.boundingBox();
      const boxToday = await todaySurfaceTitle.boundingBox();

      expect(boxBanner).not.toBeNull();
      expect(boxReconciliation).not.toBeNull();

      if (boxBanner && boxReconciliation) {
        // Assert mathematical ZERO OVERLAP between Banner and Reconciliation card
        const isHorizontalOverlap = (boxReconciliation.x < boxBanner.x + boxBanner.width) && 
                                    (boxReconciliation.x + boxReconciliation.width > boxBanner.x);
        const isVerticalOverlap = (boxReconciliation.y < boxBanner.y + boxBanner.height) && 
                                  (boxReconciliation.y + boxReconciliation.height > boxBanner.y);
        const hasOverlap = isHorizontalOverlap && isVerticalOverlap;

        expect(hasOverlap).toBe(false);

        // Responsive behavior assertions
        if (vp.width < 1200 && boxToday) {
          // Stacked mode: rail must be rendered below Today surface
          expect(boxReconciliation.y).toBeGreaterThan(boxToday.y);
        } else if (vp.width >= 1200) {
          // 2-column mode: rail must be positioned to the right of main column
          expect(boxReconciliation.x).toBeGreaterThanOrEqual(boxBanner.x + boxBanner.width);
        }
      }

      // CI HARDENING: Asersi Kirim Pengumuman boundingBox
      const btnKirim = page.locator('button', { hasText: 'Kirim Pengumuman' }).first();
      if (await btnKirim.isVisible()) {
        const boxBtnKirim = await btnKirim.boundingBox();
        expect(boxBtnKirim).not.toBeNull();
        if (boxBtnKirim) {
          expect(boxBtnKirim.x + boxBtnKirim.width).toBeLessThanOrEqual(vp.width - 8);
        }
      }

      // CI HARDENING: Asersi pil-segment × chips-RITME overlap
      const pilSegment = page.locator('button', { hasText: 'Hari Ini' }).first(); // Bagian dari SegmentedControl
      const ritmeIndicator = page.locator('.flex-1.min-w-0.flex.flex-wrap.gap-2').first(); // Kontainer chips waktu
      
      if (await pilSegment.isVisible() && await ritmeIndicator.isVisible()) {
        const boxPil = await pilSegment.boundingBox();
        const boxRitme = await ritmeIndicator.boundingBox();
        
        expect(boxPil).not.toBeNull();
        expect(boxRitme).not.toBeNull();
        
        if (boxPil && boxRitme) {
          const isHorizontalOverlap = (boxRitme.x < boxPil.x + boxPil.width) && 
                                      (boxRitme.x + boxRitme.width > boxPil.x);
          const isVerticalOverlap = (boxRitme.y < boxPil.y + boxPil.height) && 
                                    (boxRitme.y + boxRitme.height > boxPil.y);
          const hasOverlap = isHorizontalOverlap && isVerticalOverlap;
          
          expect(hasOverlap).toBe(false);
        }
      }

      const screenshotPath = path.join(outDir, `${vp.name}-${th.name}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      expect(fs.existsSync(screenshotPath)).toBe(true);
    });
  }
}
