import { chromium } from '@playwright/test';
import path from 'path';

const artDir = 'C:\\Users\\ADVAN AI\\.gemini\\antigravity-ide\\brain\\1a58a2ac-f534-4c87-881b-1756c099c6ed';

async function main() {
  const browser = await chromium.launch({ headless: true });

  // 1. IVORY CANVAS (Light)
  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 }
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      localStorage.setItem('amanaura_theme', 'ivory');
      localStorage.setItem('yapendik_theme', 'light');
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
    await page.waitForTimeout(1500);

    const ivoryPath = path.join(artDir, 'dawn_aura_v4_ivory_390x844.png');
    await page.screenshot({ path: ivoryPath, fullPage: false });
    console.log('✅ Captured Ivory 390x844:', ivoryPath);
    await context.close();
  }

  // 2. MIDNIGHT SANCTUARY (Dark)
  {
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
    await page.waitForTimeout(1500);

    const midnightPath = path.join(artDir, 'dawn_aura_v4_midnight_390x844.png');
    await page.screenshot({ path: midnightPath, fullPage: false });
    console.log('✅ Captured Midnight 390x844:', midnightPath);
    await context.close();
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
