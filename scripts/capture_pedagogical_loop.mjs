import { chromium } from 'playwright';
import path from 'path';

const ARTIFACTS_DIR = 'C:\\Users\\ADVAN AI\\.gemini\\antigravity-ide\\brain\\d7fdd781-1921-4718-bfbb-0dafb825faa6';

async function capture() {
  console.log('Launching browser to capture Pedagogical Loop Synchronization evidence...');
  const browser = await chromium.launch({ headless: true });
  
  // 1. Desktop Viewport
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  // Seed local storage with active persona
  await page.addInitScript(() => {
    localStorage.setItem('amanaura_active_persona', 'user_teacher_erna');
  });

  // Navigate to teacher daily work / RPPM
  await page.goto('http://localhost:3000/#kerja-harian');
  await page.waitForTimeout(2000);

  // Switch to WEEKLY mode (RPPM)
  const weeklyTabBtn = page.locator('button:has-text("Rencana Mingguan")');
  if (await weeklyTabBtn.count() > 0) {
    await weeklyTabBtn.first().click();
    await page.waitForTimeout(600);
  }

  // Navigate week selector to September 21-25, 2026 if not already
  // Check the current date text in week selector
  for (let i = 0; i < 10; i++) {
    const text = await page.innerText('body');
    if (text.includes('21 Sep') && text.includes('25 Sep')) {
      break;
    }
    // Try shifting week
    const nextWeekBtn = page.locator('button[title="Pekan Berikutnya"]');
    if (await nextWeekBtn.count() > 0) {
      await nextWeekBtn.first().click();
      await page.waitForTimeout(300);
    }
  }

  // Screenshot 1: RPPM Calm Planning Matrix (Desktop)
  const rppmPath = path.join(ARTIFACTS_DIR, 'pedagogical_loop_rppm_matrix.png');
  await page.screenshot({ path: rppmPath, fullPage: false });
  console.log('Captured RPPM Matrix screenshot:', rppmPath);

  // Switch back to Agenda Harian (DAILY)
  const dailyTabBtn = page.locator('button:has-text("Agenda Harian")');
  if (await dailyTabBtn.count() > 0) {
    await dailyTabBtn.first().click();
    await page.waitForTimeout(600);
  }

  // Set date to 2026-09-25 (Maulid Nabi)
  const dateInput = page.locator('input[type="date"][aria-label="Pilih Tanggal Pembelajaran"]');
  if (await dateInput.count() > 0) {
    await dateInput.first().fill('2026-09-25');
    await page.waitForTimeout(800);
  }

  // Screenshot 2: Daily Calm Morning State (2026-09-25 Maulid Nabi)
  const dailyPath = path.join(ARTIFACTS_DIR, 'pedagogical_loop_daily_calm_morning.png');
  await page.screenshot({ path: dailyPath, fullPage: false });
  console.log('Captured Daily Calm Morning screenshot:', dailyPath);

  // Click on "Buka formulir untuk kegiatan khusus / persiapan" to verify progressive disclosure
  const specialLink = page.locator('button:has-text("Buka formulir untuk kegiatan khusus")');
  if (await specialLink.count() > 0) {
    await specialLink.first().click();
    await page.waitForTimeout(500);

    const modalPath = path.join(ARTIFACTS_DIR, 'pedagogical_loop_special_activity_modal.png');
    await page.screenshot({ path: modalPath, fullPage: false });
    console.log('Captured Special Activity Modal screenshot:', modalPath);

    // Close modal
    const closeBtn = page.locator('button[title="Tutup Modal"], button:has-text("Batal")');
    if (await closeBtn.count() > 0) {
      await closeBtn.first().click();
      await page.waitForTimeout(300);
    }
  }

  // Screenshot 4: Mobile Viewport (390 x 844)
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);

  const mobilePath = path.join(ARTIFACTS_DIR, 'pedagogical_loop_mobile_calm_morning.png');
  await page.screenshot({ path: mobilePath, fullPage: false });
  console.log('Captured Mobile Calm Morning screenshot:', mobilePath);

  // Switch to Weekly RPPM on mobile to verify compact view
  if (await weeklyTabBtn.count() > 0) {
    await weeklyTabBtn.first().click();
    await page.waitForTimeout(600);

    const mobileRppmPath = path.join(ARTIFACTS_DIR, 'pedagogical_loop_mobile_rppm.png');
    await page.screenshot({ path: mobileRppmPath, fullPage: false });
    console.log('Captured Mobile RPPM screenshot:', mobileRppmPath);
  }

  await browser.close();
  console.log('All pedagogical loop screenshots captured successfully!');
}

capture().catch(err => {
  console.error('Capture error:', err);
  process.exit(1);
});
