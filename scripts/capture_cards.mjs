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

  // 2. Go to #percontohan (Living Contract) and capture Section 6
  await page.goto('http://localhost:3000/#percontohan');
  await page.waitForTimeout(1000);

  const section6 = await page.$('section:has-text("Spesimen Kartu Nama Digital CR80")');
  if (section6) {
    await section6.scrollIntoViewIfNeeded();
    await page.waitForTimeout(600);
    await section6.screenshot({ path: 'doc/visual_captures/kartu_keluarga_and_staff_specimens.png' });
    console.log('✅ Captured doc/visual_captures/kartu_keluarga_and_staff_specimens.png');
  }

  // 3. Switch to Guardian Persona via evaluation
  await page.evaluate(() => {
    // Dispatch persona override to Guardian (Julen Patricia)
    const savedOverrides = JSON.parse(localStorage.getItem('yapendik_persona_overrides') || '{}');
    localStorage.setItem('yapendik_selected_persona_id', 'user_guard_julen');
  });

  // Reload or switch persona
  await page.goto('http://localhost:3000/#portal-keluarga');
  await page.waitForTimeout(1000);

  // If topbar/bottombar has role or persona trigger, let's open Profile Drawer
  const profileTrigger = await page.$('[data-testid="sidebar-profile-trigger"]');
  if (profileTrigger) {
    await profileTrigger.click();
    await page.waitForTimeout(500);
  }

  // Click "Unduh Kartu Keluarga" or "Unduh Kartu Nama Digital"
  const cardBtn = await page.$('[data-testid="btn-open-namecard"]');
  if (cardBtn) {
    await cardBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: 'doc/visual_captures/kartu_keluarga_modal_preview_expanded.png' });
    console.log('✅ Captured doc/visual_captures/kartu_keluarga_modal_preview_expanded.png');
  }

  await browser.close();
}

main().catch(console.error);
