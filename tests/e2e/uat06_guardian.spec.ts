import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-06: Guardian Journey (Budi Santoso, S.T. — Ayah Kenzo Pratama)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-06-guardian');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-06: Guardian Child Isolation, Shared Observations, Digital Communication & Session Purge', async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
    page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

    console.log('============================================================');
    console.log('[GATE 6] [UAT-06] STARTING GUARDIAN JOURNEY (BUDI SANTOSO)');
    console.log('============================================================');

    await test.step('1. Navigate to Application & Verify Entry State', async () => {
      console.log('[GATE 6] [UAT-06] STEP 01/11: Navigating to Application Entry Point');
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
      await page.waitForSelector('text=Simulasi Persona Pilot', { timeout: 15000 });
      await page.screenshot({ path: path.join(evidenceDir, '01_login_screen.png'), fullPage: true });
    });

    await test.step('2. Select Persona: Budi Santoso, S.T. (GUARDIAN)', async () => {
      console.log('[GATE 6] [UAT-06] STEP 02/11: Selecting Guardian Persona (Budi Santoso)');
      const guardianBtn = page.locator('button', { hasText: 'Budi Santoso' });
      await expect(guardianBtn).toBeVisible();
      await guardianBtn.click();
      await page.waitForSelector('text=Persona Aktif:', { timeout: 15000 });
    });

    await test.step('3. Verify Authenticated Identity & Resolved Role', async () => {
      console.log('[GATE 6] [UAT-06] STEP 03/11: Verifying Authenticated Context & Role');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Budi Santoso');
      expect(bodyText).toContain('GUARDIAN');
      await page.screenshot({ path: path.join(evidenceDir, '02_guardian_authenticated.png'), fullPage: true });
    });

    await test.step('4. Verify Institutional Context Ribbon', async () => {
      console.log('[GATE 6] [UAT-06] STEP 04/11: Verifying Institutional Ribbon');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Persona Aktif:');
      expect(bodyText).toContain('TK Yapendik 01 Menteng');
      expect(bodyText).toContain('2026/2027');
    });

    await test.step('5. Assert Child Isolation Boundary (No other children records exposed)', async () => {
      console.log('[GATE 6] [UAT-06] STEP 05/11: Asserting Child Scope Boundary (Other children hidden)');
      const bodyText = await page.innerText('body');
      expect(bodyText.includes('Nathan Timothy')).toBe(false);
    });

    await test.step('6. Navigate to Observasi TK (Shared Child Observation Feed)', async () => {
      console.log('[GATE 6] [UAT-06] STEP 06/11: Navigating to Child Observation Feed');
      const obsTab = page.locator('nav button', { hasText: 'Observasi TK' });
      await expect(obsTab).toBeVisible();
      await obsTab.click();
      await page.waitForTimeout(800);
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Kenzo Pratama');
      await page.screenshot({ path: path.join(evidenceDir, '03_guardian_child_observation.png'), fullPage: true });
    });

    await test.step('7. Assert Confidentiality Privacy Guard (Zero staff-only observation leaks)', async () => {
      console.log('[GATE 6] [UAT-06] STEP 07/11: Verifying Staff Confidentiality Filter');
      const bodyText = await page.innerText('body');
      expect(bodyText.includes('Rahasia Guru')).toBe(false);
      expect(bodyText.includes('Catatan Internal')).toBe(false);
    });

    await test.step('8. Navigate to Buku Penghubung (Parent-Teacher Communication)', async () => {
      console.log('[GATE 6] [UAT-06] STEP 08/11: Opening Buku Penghubung Digital');
      const commTab = page.locator('nav button', { hasText: 'Buku Penghubung' });
      await expect(commTab).toBeVisible();
      await commTab.click();
      await page.waitForTimeout(800);
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Buku Penghubung');
      await page.screenshot({ path: path.join(evidenceDir, '04_guardian_communication.png'), fullPage: true });
    });

    await test.step('9. Navigate to Perkembangan (Child LPPA Progress Report)', async () => {
      console.log('[GATE 6] [UAT-06] STEP 09/11: Opening Child LPPA Progress Report');
      const devTab = page.locator('nav button', { hasText: 'Perkembangan' });
      await expect(devTab).toBeVisible();
      await devTab.click();
      await page.waitForTimeout(800);
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Laporan Capaian Perkembangan Siswa');
      await page.screenshot({ path: path.join(evidenceDir, '05_guardian_lppa_view.png'), fullPage: true });
    });

    await test.step('10. Open Persona Menu to Initiate Sign Out', async () => {
      console.log('[GATE 6] [UAT-06] STEP 10/11: Opening Persona Context Menu');
      const personaMenuBtn = page.locator('header button').last();
      await personaMenuBtn.click();
      await page.waitForSelector('text=Keluar / Sign Out', { timeout: 5000 });
      await page.screenshot({ path: path.join(evidenceDir, '06_persona_menu_open.png') });
    });

    await test.step('11. Execute Sign Out / Logout & Verify Cache Purge', async () => {
      console.log('[GATE 6] [UAT-06] STEP 11/11: Executing Complete Logout');
      const signOutBtn = page.locator('button', { hasText: 'Keluar / Sign Out' });
      await expect(signOutBtn).toBeVisible();
      await signOutBtn.click();
      await page.waitForSelector('text=Simulasi Persona Pilot', { timeout: 10000 });

      await page.screenshot({ path: path.join(evidenceDir, '07_logout_complete.png'), fullPage: true });

      const storageKeys = await page.evaluate(() => Object.keys(localStorage));
      console.log('Remaining localStorage keys after purge:', storageKeys);
      const userCachedData = storageKeys.filter(k => k.startsWith('yapendik_os_v2_u_'));
      expect(userCachedData.length).toBe(0);
    });

    console.log('============================================================');
    console.log('[GATE 6] [UAT-06] COMPLETED SUCCESSFULLY: ALL STEPS PASS');
    console.log('============================================================');
  });
});
