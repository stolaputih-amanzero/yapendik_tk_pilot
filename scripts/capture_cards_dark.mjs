import { chromium } from '@playwright/test';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 950 } });

  // 1. Enter Simulation mode
  await page.goto('http://localhost:3000');
  await page.waitForTimeout(800);
  const simBtn = await page.$('text=Masuk Mode Simulasi Pendidik');
  if (simBtn) {
    await simBtn.click();
    await page.waitForTimeout(1000);
  }

  // 2. Set Theme to Midnight in localStorage
  await page.evaluate(() => {
    localStorage.setItem('theme', 'midnight');
    document.documentElement.classList.add('dark');
  });

  // 3. Go to #percontohan in Midnight theme
  await page.goto('http://localhost:3000/#percontohan');
  await page.waitForTimeout(1000);

  const section6 = await page.$('section:has-text("Spesimen Kartu Nama Digital CR80")');
  if (section6) {
    await section6.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await section6.screenshot({ path: 'doc/visual_captures/kartu_keluarga_and_staff_specimens_midnight.png' });
    console.log('✅ Captured doc/visual_captures/kartu_keluarga_and_staff_specimens_midnight.png');
  }

  await browser.close();
}

main().catch(console.error);
