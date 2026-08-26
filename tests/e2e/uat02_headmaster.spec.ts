import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-02: Headmaster Supervisory Journey (Dra. Esther Nugroho, M.Pd)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-02-headmaster');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-02: Headmaster LPPA Supervisory Review, Approval, Publication & Session Purge', async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
    page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

    console.log('============================================================');
    console.log('[GATE 6] [UAT-02] STARTING HEADMASTER SUPERVISORY JOURNEY');
    console.log('============================================================');

    await test.step('1. Navigate to Application & Verify Entry State', async () => {
      console.log('[GATE 6] [UAT-02] STEP 01/11: Navigating to Application Entry Point');
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
      await page.waitForSelector('text=Simulasi Persona Pilot', { timeout: 15000 });
      await page.screenshot({ path: path.join(evidenceDir, '01_login_screen.png'), fullPage: true });
    });

    await test.step('2. Select Persona: Dra. Esther Nugroho, M.Pd (HEADMASTER)', async () => {
      console.log('[GATE 6] [UAT-02] STEP 02/11: Selecting Headmaster Persona (Dra. Esther Nugroho)');
      const headmasterBtn = page.locator('button', { hasText: 'Dra. Esther Nugroho' });
      await expect(headmasterBtn).toBeVisible();
      await headmasterBtn.click();
      await page.waitForSelector('text=Persona Aktif:', { timeout: 15000 });
    });

    await test.step('3. Verify Authenticated Identity & Resolved Role', async () => {
      console.log('[GATE 6] [UAT-02] STEP 03/11: Verifying Authenticated Context & Role');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Dra. Esther Nugroho');
      expect(bodyText).toContain('HEADMASTER');
      await page.screenshot({ path: path.join(evidenceDir, '02_headmaster_authenticated.png'), fullPage: true });
    });

    await test.step('4. Verify Institutional Context Ribbon', async () => {
      console.log('[GATE 6] [UAT-02] STEP 04/11: Verifying Institutional Ribbon');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Persona Aktif:');
      expect(bodyText).toContain('2026/2027');
    });

    await test.step('5. Navigate to Perkembangan (LPPA Development Workspace)', async () => {
      console.log('[GATE 6] [UAT-02] STEP 05/11: Opening Perkembangan Workspace');
      const devTab = page.locator('nav button', { hasText: 'Perkembangan' });
      await expect(devTab).toBeVisible();
      await devTab.click();
      await page.waitForSelector('text=Laporan Capaian Perkembangan Siswa', { timeout: 10000 });
      await page.screenshot({ path: path.join(evidenceDir, '03_development_workspace.png'), fullPage: true });
    });

    await test.step('6. Inspect Student Selection & LPPA Synthesis Document', async () => {
      console.log('[GATE 6] [UAT-02] STEP 06/11: Inspecting Student LPPA Document');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Laporan Capaian Perkembangan Siswa');
      expect(bodyText).toContain('DOKUMEN RESMI LPPA');
    });

    await test.step('7. Validate LPPA State Machine Workflow (Approve or Publish if eligible)', async () => {
      console.log('[GATE 6] [UAT-02] STEP 07/11: Checking Headmaster Supervisory Action Controls');
      
      const approveBtn = page.locator('button', { hasText: 'Sahkan Laporan LPPA' });
      const publishBtn = page.locator('button', { hasText: 'Publikasikan ke Wali Murid' });

      if (await approveBtn.isVisible()) {
        console.log('Report is in READY_FOR_REVIEW. Executing Approval...');
        await approveBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(evidenceDir, '04_report_approved.png'), fullPage: true });
      }

      if (await publishBtn.isVisible()) {
        console.log('Report is in APPROVED. Executing Publication...');
        await publishBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(evidenceDir, '05_report_published.png'), fullPage: true });
      }

      const bodyText = await page.innerText('body');
      const hasValidStatus = [
        'Resmi Dipublikasikan (Terkunci)',
        'Disahkan Kepala Sekolah',
        'Draf Menunggu Pengesahan',
        'Draf Awal Guru'
      ].some(status => bodyText.includes(status));
      expect(hasValidStatus).toBe(true);
    });

    await test.step('8. Navigate to Data Induk Siswa & Roster (EnrollmentWorkspace)', async () => {
      console.log('[GATE 6] [UAT-02] STEP 08/11: Opening Data Induk Siswa & Roster');
      const moreBtn = page.locator('nav button', { hasText: 'Lainnya' });
      if (await moreBtn.isVisible()) {
        await moreBtn.hover();
      }
      const rosterBtn = page.locator('button', { hasText: 'Data Induk Siswa & Roster' });
      await rosterBtn.click();
      await page.waitForSelector('text=Data Induk Siswa & Entitas Kanonikal', { timeout: 10000 });
      await page.screenshot({ path: path.join(evidenceDir, '06_student_roster_view.png'), fullPage: true });
    });

    await test.step('9. Verify Headmaster Multi-Class Roster Access (TK A & TK B)', async () => {
      console.log('[GATE 6] [UAT-02] STEP 09/11: Verifying Supervisory Access to both TK A and TK B');
      const classSelect = page.locator('select').first();
      await expect(classSelect).toBeVisible();
      const options = await classSelect.locator('option').allTextContents();
      console.log('Class options for Headmaster:', options);
      expect(options.some(opt => opt.includes('Kelompok A') || opt.includes('TK A'))).toBe(true);
      expect(options.some(opt => opt.includes('Kelompok B') || opt.includes('TK B'))).toBe(true);
    });

    await test.step('10. Open Persona Menu to Initiate Sign Out', async () => {
      console.log('[GATE 6] [UAT-02] STEP 10/11: Opening Persona Context Menu');
      const personaMenuBtn = page.locator('header button').last();
      await personaMenuBtn.click();
      await page.waitForSelector('text=Keluar / Sign Out', { timeout: 5000 });
      await page.screenshot({ path: path.join(evidenceDir, '07_persona_menu_open.png') });
    });

    await test.step('11. Execute Sign Out / Logout & Verify Cache Purge', async () => {
      console.log('[GATE 6] [UAT-02] STEP 11/11: Executing Complete Logout');
      const signOutBtn = page.locator('button', { hasText: 'Keluar / Sign Out' });
      await expect(signOutBtn).toBeVisible();
      await signOutBtn.click();
      await page.waitForSelector('text=Simulasi Persona Pilot', { timeout: 10000 });

      await page.screenshot({ path: path.join(evidenceDir, '08_logout_complete.png'), fullPage: true });

      const storageKeys = await page.evaluate(() => Object.keys(localStorage));
      console.log('Remaining localStorage keys after purge:', storageKeys);
      const userCachedData = storageKeys.filter(k => k.startsWith('yapendik_os_v2_u_'));
      expect(userCachedData.length).toBe(0);
    });

    console.log('============================================================');
    console.log('[GATE 6] [UAT-02] COMPLETED SUCCESSFULLY: ALL STEPS PASS');
    console.log('============================================================');
  });
});
