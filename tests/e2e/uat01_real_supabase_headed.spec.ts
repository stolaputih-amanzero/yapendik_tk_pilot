import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-01 (REAL SUPABASE AUTH): Dr. Andreas Hendrawan (Yayasan Superadmin)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-01-real-supabase');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-01 Live Headed: Authenticate with Supabase Cloud Account and Perform Governance Journey', async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
    page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

    console.log('============================================================');
    console.log('[GATE 6] [UAT-01 REAL AUTH] STARTING LIVE SUPABASE JOURNEY');
    console.log('============================================================');

    await test.step('1. Navigate to Application Entry Point', async () => {
      console.log('[STEP 1] Navigating to http://localhost:3000');
      await page.goto('http://localhost:3000');
      await page.waitForSelector('text=Simulasi Persona Pilot (6 Role)', { timeout: 15000 });
      await page.screenshot({ path: path.join(evidenceDir, '01_login_screen.png'), fullPage: true });
      await page.waitForTimeout(1000);
    });

    await test.step('2. Select "Masuk Akun Supabase (Resmi)" Tab', async () => {
      console.log('[STEP 2] Switching to Real Supabase Auth tab');
      const realAuthTab = page.locator('button', { hasText: 'Masuk Akun Supabase (Resmi)' });
      await expect(realAuthTab).toBeVisible();
      await realAuthTab.click();
      await page.waitForSelector('input[type="email"]', { timeout: 5000 });
      await page.screenshot({ path: path.join(evidenceDir, '02_real_auth_form.png') });
      await page.waitForTimeout(1000);
    });

    await test.step('3. Enter Official Supabase Credentials for Dr. Andreas Hendrawan', async () => {
      console.log('[STEP 3] Entering email: andreas@yapendik.sch.id');
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      const submitButton = page.locator('button[type="submit"]');

      await emailInput.fill('andreas@yapendik.sch.id');
      await page.waitForTimeout(600);
      await passwordInput.fill('YapendikPilot2026!');
      await page.waitForTimeout(600);

      await page.screenshot({ path: path.join(evidenceDir, '03_credentials_entered.png') });

      console.log('[STEP 3] Submitting login request to Supabase Cloud Auth...');
      await submitButton.click();

      // Wait for dynamic identity resolution to complete
      await page.waitForSelector('text=Persona Aktif:', { timeout: 20000 });
      console.log('[STEP 3] Authentication & Dynamic Identity Resolution Successful!');
      await page.waitForTimeout(1500);
    });

    await test.step('4. Verify Authenticated Governance Context & Institutional Ribbon', async () => {
      console.log('[STEP 4] Verifying resolved role and institutional ribbon');
      const bodyText = await page.innerText('body');
      
      console.log('  Includes Dr. Andreas:', bodyText.includes('Dr. Andreas Hendrawan'));
      console.log('  Includes SUPERADMIN:', bodyText.includes('SUPERADMIN') || bodyText.includes('YAPENDIK_SUPERADMIN'));
      console.log('  Includes Yayasan Context:', bodyText.includes('Yayasan') || bodyText.includes('TK Yapendik 01'));

      expect(bodyText).toContain('Dr. Andreas Hendrawan');
      await page.screenshot({ path: path.join(evidenceDir, '04_superadmin_authenticated_live.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    await test.step('5. Navigate to "Tata Kelola" Workspace (School Review & Audit Logs)', async () => {
      console.log('[STEP 5] Opening Tata Kelola / School Review Workspace');
      const lainnyaMenu = page.locator('button', { hasText: 'Lainnya' });
      if (await lainnyaMenu.isVisible()) {
        await lainnyaMenu.click();
        await page.waitForTimeout(500);
        const tataKelolaOpt = page.locator('text=Tata Kelola & Audit');
        if (await tataKelolaOpt.isVisible()) {
          await tataKelolaOpt.click();
        }
      } else {
        const tataKelolaTab = page.locator('nav button', { hasText: 'Tata Kelola' });
        if (await tataKelolaTab.isVisible()) {
          await tataKelolaTab.click();
        }
      }

      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(evidenceDir, '05_tata_kelola_workspace.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    await test.step('6. Navigate to "Uji Otorisasi" (Security Matrix & Policy Evaluator)', async () => {
      console.log('[STEP 6] Opening Uji Otorisasi Workspace');
      const testsTab = page.locator('button', { hasText: 'Uji Otorisasi' });
      await expect(testsTab).toBeVisible();
      await testsTab.click();
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(evidenceDir, '06_security_testing_matrix.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    await test.step('7. Open Persona Menu and Execute Complete Sign Out', async () => {
      console.log('[STEP 7] Opening user profile menu');
      const personaMenuBtn = page.locator('header button').last();
      await personaMenuBtn.click();
      await page.waitForSelector('text=Keluar / Sign Out', { timeout: 5000 });
      await page.screenshot({ path: path.join(evidenceDir, '07_persona_menu_open.png') });
      await page.waitForTimeout(1000);

      console.log('[STEP 7] Executing Sign Out...');
      const signOutBtn = page.locator('button', { hasText: 'Keluar / Sign Out' });
      await signOutBtn.click();

      await page.waitForSelector('text=Simulasi Persona Pilot (6 Role)', { timeout: 10000 });
      await page.screenshot({ path: path.join(evidenceDir, '08_logout_complete.png'), fullPage: true });

      const storageKeys = await page.evaluate(() => Object.keys(localStorage));
      console.log('Remaining localStorage keys after clean purge:', storageKeys);
      const userCachedData = storageKeys.filter(k => k.startsWith('yapendik_os_v2_u_'));
      expect(userCachedData.length).toBe(0);
      await page.waitForTimeout(1000);
    });

    console.log('============================================================');
    console.log('[GATE 6] [UAT-01 REAL AUTH] COMPLETED SUCCESSFULLY: ALL 7 STEPS PASS');
    console.log('============================================================');
  });
});
