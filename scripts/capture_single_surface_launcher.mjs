import { chromium } from '@playwright/test';
import path from 'path';

const artDir = 'C:\\Users\\ADVAN AI\\.gemini\\antigravity-ide\\brain\\1a58a2ac-f534-4c87-881b-1756c099c6ed';

async function captureTheme(theme) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 }
  });
  const page = await context.newPage();
  await page.addInitScript((t) => {
    localStorage.setItem('amanaura_theme', t);
    localStorage.setItem('yapendik_theme', t === 'midnight' ? 'dark' : 'light');
  }, theme);

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
  await page.waitForTimeout(800);

  // 1. Open Menu Navigasi Sheet (3x3 + utility footer)
  const chevronHandle = page.getByTestId('mobile-chevron-handle');
  await chevronHandle.click();
  await page.waitForSelector('[data-testid="nav-sheet-content"]', { timeout: 5000 });
  await page.waitForTimeout(800);

  const sheetPath = path.join(artDir, `single_surface_sheet_${theme}_390x844.png`);
  await page.screenshot({ path: sheetPath, fullPage: false });
  console.log(`✅ Captured Sheet 3x3 (${theme}):`, sheetPath);

  // 2. Click "Profil" tile in the 3x3 grid to open Identity Card ProfileDrawer
  const profileTile = page.getByTestId('tile-profile-drawer');
  await profileTile.click();
  await page.waitForSelector('[data-testid="profile-drawer"]', { timeout: 5000 });
  await page.waitForTimeout(800);

  const profilePath = path.join(artDir, `identity_card_${theme}_390x844.png`);
  await page.screenshot({ path: profilePath, fullPage: false });
  console.log(`✅ Captured Identity Card (${theme}):`, profilePath);

  await context.close();
  await browser.close();
}

async function main() {
  await captureTheme('midnight');
  await captureTheme('ivory');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
