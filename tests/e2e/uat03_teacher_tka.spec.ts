import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-03: Teacher TK A Journey (Siti Rahmawati, S.Pd)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-03-teacher-tka');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-03: Teacher TK A Daily Work, Attendance Screening, LPPA Draft & State Machine Boundary', async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
    page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

    console.log('============================================================');
    console.log('[GATE 6] [UAT-03] STARTING TEACHER TK A JOURNEY (SITI RAHMAWATI)');
    console.log('============================================================');

    await test.step('1. Navigate to Application & Verify Entry State', async () => {
      console.log('[GATE 6] [UAT-03] STEP 01/11: Navigating to Application Entry Point');
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
      await page.waitForSelector('text=Simulasi Persona Pilot', { timeout: 15000 });
      await page.screenshot({ path: path.join(evidenceDir, '01_login_screen.png'), fullPage: true });
    });

    await test.step('2. Select Persona: Siti Rahmawati, S.Pd (TEACHER - TK A)', async () => {
      console.log('[GATE 6] [UAT-03] STEP 02/11: Selecting Teacher TK A Persona (Siti Rahmawati)');
      const teacherBtn = page.locator('button', { hasText: 'Siti Rahmawati' });
      await expect(teacherBtn).toBeVisible();
      await teacherBtn.click();
      await page.waitForSelector('text=Persona Aktif:', { timeout: 15000 });
    });

    await test.step('3. Verify Authenticated Identity & Resolved Role', async () => {
      console.log('[GATE 6] [UAT-03] STEP 03/11: Verifying Authenticated Context & Role');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Siti Rahmawati');
      expect(bodyText).toContain('TEACHER');
      await page.screenshot({ path: path.join(evidenceDir, '02_teacher_tka_authenticated.png'), fullPage: true });
    });

    await test.step('4. Verify Institutional Context Ribbon', async () => {
      console.log('[GATE 6] [UAT-03] STEP 04/11: Verifying Institutional Ribbon');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Persona Aktif:');
      expect(bodyText).toContain('TK Yapendik 01 Menteng');
      expect(bodyText).toContain('2026/2027');
    });

    await test.step('5. Inspect Teacher Daily Work & Learning Plans Workspace', async () => {
      console.log('[GATE 6] [UAT-03] STEP 05/11: Inspecting Daily Work & Learning Activities');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Agenda & Kerja Harian Guru');
      expect(bodyText).toContain('Pengorganisasian sentra kegiatan');
      await page.screenshot({ path: path.join(evidenceDir, '03_daily_work_observation.png'), fullPage: true });
    });

    await test.step('6. Navigate to Presensi (Attendance & Health Screening) Workspace', async () => {
      console.log('[GATE 6] [UAT-03] STEP 06/11: Navigating to Attendance Register');
      const presensiTab = page.locator('nav button', { hasText: 'Presensi' });
      await expect(presensiTab).toBeVisible();
      await presensiTab.click();
      await page.waitForSelector('text=Buku Presensi & Skrining Kedatangan Siswa', { timeout: 10000 });
      await page.screenshot({ path: path.join(evidenceDir, '04_attendance_roster.png'), fullPage: true });
    });

    await test.step('7. Verify Class Scope Isolation in Attendance Register', async () => {
      console.log('[GATE 6] [UAT-03] STEP 07/11: Verifying Scoped Class Context (Kelompok A)');
      const bodyText = await page.innerText('body');
      expect(bodyText).toContain('Buku Presensi & Skrining Kedatangan Siswa');
      expect(bodyText).toContain('Kelompok A (Bintang Ceria)');
    });

    await test.step('8. Navigate to Perkembangan (LPPA Progress Report Drafting)', async () => {
      console.log('[GATE 6] [UAT-03] STEP 08/11: Opening LPPA Development Workspace');
      const devTab = page.locator('nav button', { hasText: 'Perkembangan' });
      await expect(devTab).toBeVisible();
      await devTab.click();
      await page.waitForSelector('text=Laporan Capaian Perkembangan Siswa', { timeout: 10000 });
      await page.screenshot({ path: path.join(evidenceDir, '05_lppa_draft_view.png'), fullPage: true });
    });

    await test.step('9. Assert Teacher State Machine Boundary (No Approval / No Publish)', async () => {
      console.log('[GATE 6] [UAT-03] STEP 09/11: Asserting State Machine Boundary (Teacher Forbidden from Approval)');
      const bodyText = await page.innerText('body');
      expect(bodyText.includes('Sahkan Laporan LPPA')).toBe(false);
      expect(bodyText.includes('Publikasikan ke Wali Murid')).toBe(false);
    });

    await test.step('10. Open Persona Menu to Initiate Sign Out', async () => {
      console.log('[GATE 6] [UAT-03] STEP 10/11: Opening Persona Context Menu');
      const personaMenuBtn = page.locator('header button').last();
      await personaMenuBtn.click();
      await page.waitForSelector('text=Keluar / Sign Out', { timeout: 5000 });
      await page.screenshot({ path: path.join(evidenceDir, '06_persona_menu_open.png') });
    });

    await test.step('11. Execute Sign Out / Logout & Verify Cache Purge', async () => {
      console.log('[GATE 6] [UAT-03] STEP 11/11: Executing Complete Logout');
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
    console.log('[GATE 6] [UAT-03] COMPLETED SUCCESSFULLY: ALL STEPS PASS');
    console.log('============================================================');
  });
});
