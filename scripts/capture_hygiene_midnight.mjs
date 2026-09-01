import { chromium } from '@playwright/test';
import path from 'path';

const artDir = 'C:\\Users\\ADVAN AI\\.gemini\\antigravity-ide\\brain\\1a58a2ac-f534-4c87-881b-1756c099c6ed';

async function main() {
  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  await page.addInitScript(() => {
    localStorage.setItem('amanaura_theme', 'midnight');
    localStorage.setItem('yapendik_theme', 'dark');
  });

  await page.goto('http://localhost:3000/#beranda-guru', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // If on login screen, click simulation button
  const simButton = page.getByRole('button', { name: /Masuk Mode Simulasi Pendidik/i });
  if (await simButton.isVisible()) {
    await simButton.click();
    await page.waitForTimeout(1000);
  }

  await page.waitForSelector('text=Hari ini selesai, Bu Erna.', { timeout: 10000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1000);

  // 1. Capture Open Menu Navigasi Sheet (3-col wrap, no search, no dev rows)
  const chevronHandle = page.getByTestId('mobile-chevron-handle');
  await chevronHandle.click();
  await page.waitForSelector('[data-testid="nav-sheet-content"]', { timeout: 5000 });
  await page.waitForTimeout(800);

  const sheetPath = path.join(artDir, 'sheet_hygiene_3col_midnight.png');
  await page.screenshot({ path: sheetPath, fullPage: false });
  console.log('✅ Captured Sheet 3-Col Midnight:', sheetPath);

  // 2. Open Profile Drawer from sheet [Pengaturan] button
  const settingsButton = page.getByRole('button', { name: /Buka Profil & Pengaturan/i });
  if (await settingsButton.isVisible()) {
    await settingsButton.click();
  } else {
    // Alternatively click close on sheet and trigger profile drawer
    const closeSheet = page.getByRole('button', { name: /Tutup Menu Navigasi/i });
    await closeSheet.click();
    await page.waitForTimeout(300);
    // Find profile trigger
    const profileTrigger = page.getByRole('button', { name: /Menu Profil/i });
    if (await profileTrigger.isVisible()) {
      await profileTrigger.click();
    }
  }

  await page.waitForSelector('[data-testid="profile-drawer"]', { timeout: 5000 });
  await page.waitForTimeout(800);

  const profilePath = path.join(artDir, 'profile_drawer_hygiene_midnight.png');
  await page.screenshot({ path: profilePath, fullPage: false });
  console.log('✅ Captured Profile Drawer Hygiene Midnight:', profilePath);

  await context.close();
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
