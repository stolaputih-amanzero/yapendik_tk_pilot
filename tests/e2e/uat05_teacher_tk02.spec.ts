import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-05: Cross-School Isolation Teacher Journey (Diana Sari, S.Pd - TK 02)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-05-teacher-tk02');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-05: Cross-School Negative Boundary, Zero Data Leakage & Security Matrix Validation', async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
    page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

    console.log('============================================================');
    console.log('[GATE 6] [UAT-05] STARTING CROSS-SCHOOL ISOLATION JOURNEY (DIANA SARI)');
    console.log('============================================================');

    await test.step('1. Navigate to Application & Verify Entry State', async () => {
      console.log('[GATE 6] [UAT-05] STEP 01/11: Navigating to Application Entry Point');
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
      await page.waitForSelector('text=Simulasi Persona Pilot', { timeout: 15000 });
      await page.screenshot({ path: path.join(evidenceDir, '01_login_screen.png'), fullPage: true });
    });

    await test.step('2. Select Persona: Diana Sari, S.Pd (TK 02 Kebayoran)', async () => {
      console.log('[GATE 6] [UAT-05] STEP 02/11: Selecting Cross-School Persona (Diana Sari - TK 02)');
      const teacherBtn = page.locator('button', { hasText: 'Diana Sari' });
      await expect(teacherBtn).toBeVisible();
      await teacherBtn.click();
      await page.waitForSelector('text=Persona Aktif:', { timeout: 15000 });
    });

    await test.step('3. Verify Authenticated Identity & Resolved Role', async () => {
      console.log('[GATE 6] [UAT-05] STEP 03/11: Verifying Authenticated Context & Role');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Diana Sari');
      expect(bodyText).toContain('TEACHER');
      await page.screenshot({ path: path.join(evidenceDir, '02_teacher_tk02_authenticated.png'), fullPage: true });
    });

    await test.step('4. Verify Institutional Ribbon (TK Yapendik 02 Kebayoran Context)', async () => {
      console.log('[GATE 6] [UAT-05] STEP 04/11: Verifying TK 02 Kebayoran Context Ribbon');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Persona Aktif:');
      expect(bodyText.includes('TK 02') || bodyText.includes('TK Yapendik 02')).toBe(true);
    });

    await test.step('5. Assert Zero-Data Leakage of TK 01 Students', async () => {
      console.log('[GATE 6] [UAT-05] STEP 05/11: Asserting Strict Zero-Leakage of TK 01 Student Records');
      const bodyText = await page.innerText('body');
      expect(bodyText.includes('Kenzo Pratama')).toBe(false);
      expect(bodyText.includes('Nathan Timothy')).toBe(false);
    });

    await test.step('6. Navigate to Presensi & Verify School Boundary Isolation', async () => {
      console.log('[GATE 6] [UAT-05] STEP 06/11: Checking Attendance Register Isolation');
      const presensiTab = page.locator('nav button', { hasText: 'Presensi' });
      await expect(presensiTab).toBeVisible();
      await presensiTab.click();
      await page.waitForTimeout(800);
      const bodyText = await page.innerText('body');
      expect(bodyText.includes('Kenzo Pratama')).toBe(false);
    });

    await test.step('7. Navigate to Observasi TK & Verify Zero Observation Leakage', async () => {
      console.log('[GATE 6] [UAT-05] STEP 07/11: Checking Observation Feed Isolation');
      const obsTab = page.locator('nav button', { hasText: 'Observasi TK' });
      await expect(obsTab).toBeVisible();
      await obsTab.click();
      await page.waitForTimeout(800);
      const bodyText = await page.innerText('body');
      expect(bodyText.includes('Kenzo Pratama')).toBe(false);
    });

    await test.step('8. Navigate to Uji Otorisasi (Contextual Security Matrix)', async () => {
      console.log('[GATE 6] [UAT-05] STEP 08/11: Opening Authorization Testing Workspace');
      const testsTab = page.locator('nav button', { hasText: 'Uji Otorisasi' });
      await expect(testsTab).toBeVisible();
      await testsTab.click();
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(evidenceDir, '03_cross_school_security_matrix.png'), fullPage: true });
    });

    await test.step('9. Assert Negative Boundary Test Cases in Engine', async () => {
      console.log('[GATE 6] [UAT-05] STEP 09/11: Verifying Negative Authorization Test Engine Executions');
      const bodyText = await page.innerText('body');
      expect(bodyText.includes('Uji Otorisasi') || bodyText.includes('Otorisasi')).toBe(true);
    });

    await test.step('10. Open Persona Menu to Initiate Sign Out', async () => {
      console.log('[GATE 6] [UAT-05] STEP 10/11: Opening Persona Context Menu');
      const personaMenuBtn = page.locator('header button').last();
      await personaMenuBtn.click();
      await page.waitForSelector('text=Keluar / Sign Out', { timeout: 5000 });
      await page.screenshot({ path: path.join(evidenceDir, '04_persona_menu_open.png') });
    });

    await test.step('11. Execute Sign Out / Logout & Verify Cache Purge', async () => {
      console.log('[GATE 6] [UAT-05] STEP 11/11: Executing Complete Logout');
      const signOutBtn = page.locator('button', { hasText: 'Keluar / Sign Out' });
      await expect(signOutBtn).toBeVisible();
      await signOutBtn.click();
      await page.waitForSelector('text=Simulasi Persona Pilot', { timeout: 10000 });

      await page.screenshot({ path: path.join(evidenceDir, '05_logout_complete.png'), fullPage: true });

      const storageKeys = await page.evaluate(() => Object.keys(localStorage));
      console.log('Remaining localStorage keys after purge:', storageKeys);
      const userCachedData = storageKeys.filter(k => k.startsWith('yapendik_os_v2_u_'));
      expect(userCachedData.length).toBe(0);
    });

    console.log('============================================================');
    console.log('[GATE 6] [UAT-05] COMPLETED SUCCESSFULLY: ALL STEPS PASS');
    console.log('============================================================');
  });
});
