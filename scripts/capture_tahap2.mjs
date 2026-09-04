import { chromium } from '@playwright/test';
import path from 'path';

const artifactsDir = 'C:\\Users\\ADVAN AI\\.gemini\\antigravity-ide\\brain\\d7fdd781-1921-4718-bfbb-0dafb825faa6';

async function main() {
  console.log('Launching browser for Tahap 2 visual verification...');
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Inject logged in persona as Teacher Erna
  await page.addInitScript(() => {
    localStorage.setItem('amanaura_active_persona', 'user_teacher_erna');
    // Clear any cached holiday catalog to test fresh canonical fallback
    localStorage.removeItem('holiday_catalog_2026');
  });

  // Navigate to presensi
  await page.goto('http://localhost:3000/#presensi', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // 1. Set date to 2026-09-25 (Maulid Nabi Muhammad SAW)
  console.log('Setting date to 2026-09-25...');
  await page.evaluate(() => {
    const input = document.querySelector('input[type="date"]');
    if (input) {
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
      nativeInputValueSetter.call(input, '2026-09-25');
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  await page.waitForTimeout(1200);

  // Screenshot 1: Calm Morning State
  const calmMorningPath = path.join(artifactsDir, 'tahap2_calm_morning.png');
  await page.screenshot({ path: calmMorningPath, fullPage: false });
  console.log('Captured:', calmMorningPath);

  // 2. Click special attendance form button
  console.log('Opening special attendance form...');
  const specialBtn = page.getByText('Ada kegiatan khusus hari ini? Buka Formulir Presensi');
  if (await specialBtn.isVisible()) {
    await specialBtn.click();
    await page.waitForTimeout(800);
    const specialPath = path.join(artifactsDir, 'tahap2_special_attendance.png');
    await page.screenshot({ path: specialPath, fullPage: false });
    console.log('Captured:', specialPath);

    // Return to calm mode
    const backBtn = page.getByText('Kembali ke Mode Santai');
    if (await backBtn.isVisible()) {
      await backBtn.click();
      await page.waitForTimeout(600);
    }
  }

  // 3. Bulanan Tab
  console.log('Navigating to Bulanan tab...');
  // Find the Bulanan button inside the segmented control on top of attendance card
  await page.locator('div.bg-surface-subtle button', { hasText: 'Bulanan' }).first().click();
  await page.waitForTimeout(1000);
  const bulananPath = path.join(artifactsDir, 'tahap2_bulanan_21_hari.png');
  await page.screenshot({ path: bulananPath, fullPage: false });
  console.log('Captured:', bulananPath);

  // 4. Mobile Viewport (390 x 844)
  console.log('Capturing mobile viewport...');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('div.bg-surface-subtle button', { hasText: 'Harian' }).first().click();
  await page.waitForTimeout(800);
  const mobilePath = path.join(artifactsDir, 'tahap2_mobile_calm_morning.png');
  await page.screenshot({ path: mobilePath, fullPage: false });
  console.log('Captured:', mobilePath);

  await browser.close();
  console.log('All verification screenshots captured successfully!');
}

main().catch(err => {
  console.error('Error during capture:', err);
  process.exit(1);
});
