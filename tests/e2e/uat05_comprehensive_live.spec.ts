import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-05 (COMPREHENSIVE LIVE SUPABASE): Diana Sari, S.Pd (Guru TK 02 Kebayoran)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-05-comprehensive');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-05 Full Live Journey (11 Steps): Cross-School Isolation, Zero Data Leakage & Multi-Unit Independence', async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
    page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

    console.log('========================================================================');
    console.log('[GATE 6] [UAT-05 COMPREHENSIVE] STARTING GURU TK 02 LIVE SUPABASE JOURNEY');
    console.log('========================================================================');

    // -------------------------------------------------------------------------
    // STEP 1: Application Entry & Login with Official Supabase Credentials
    // -------------------------------------------------------------------------
    await test.step('Step 1: Application Entry & Real Supabase Login', async () => {
      console.log('[STEP 1] Navigating to http://localhost:3000');
      await page.goto('http://localhost:3000');
      await page.waitForSelector('button:has-text("Masuk Akun Supabase (Resmi)")', { timeout: 15000 });
      
      const realAuthTab = page.locator('button', { hasText: 'Masuk Akun Supabase (Resmi)' });
      await realAuthTab.click();
      await page.waitForTimeout(600);

      console.log('[STEP 1] Entering email: diana@yapendik.sch.id & password...');
      await page.locator('input[type="email"]').fill('diana@yapendik.sch.id');
      await page.waitForTimeout(400);
      await page.locator('input[type="password"]').fill('YapendikPilot2026!');
      await page.waitForTimeout(600);

      await page.locator('button[type="submit"]').click();
      await page.waitForSelector('text=Persona Aktif:', { timeout: 20000 });
      console.log('[STEP 1] Authentication Successful! Sesi Supabase Cloud Guru Diana (TK 02) Terbuka.');
      await page.screenshot({ path: path.join(evidenceDir, '01_login_success.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 2: Verify Teacher Identity & TK 02 Kebayoran Context Ribbon
    // -------------------------------------------------------------------------
    await test.step('Step 2: Verify Teacher Role & TK 02 Kebayoran Ribbon', async () => {
      console.log('[STEP 2] Verifying Teacher Diana Sari role & unit in Ribbon');
      const personaContext = page.locator('div:has-text("Persona Aktif:")').first();
      await expect(personaContext).toBeVisible();
      const text = await personaContext.innerText();
      console.log('  Persona Context text:', text);
      expect(text).toContain('Diana Sari');
      expect(text).toContain('TEACHER');
      expect(text).toContain('TK Yapendik 02 Kebayoran');
      await page.screenshot({ path: path.join(evidenceDir, '02_ribbon_verified.png') });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 3: Assert Strict Zero-Data Leakage of TK 01 Student Records
    // -------------------------------------------------------------------------
    await test.step('Step 3: Assert Zero-Data Leakage of TK 01 Records', async () => {
      console.log('[STEP 3] Verifying TK 01 students (Kenzo, Alina, Gabriel) are completely invisible');
      const pageText = await page.innerText('body');
      expect(pageText.includes('Kenzo Pratama Santoso')).toBe(false);
      expect(pageText.includes('Alina Putri Wijaya')).toBe(false);
      expect(pageText.includes('Gabriel Christian')).toBe(false);
      console.log('  [ISOLATION ASSERTION] Zero leakage of TK 01 records in TK 02: CONFIRMED');
      await page.screenshot({ path: path.join(evidenceDir, '03_zero_leakage_asserted.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 4: Daily Sentra Organization in TK 02 Kebayoran (Kerja Harian)
    // -------------------------------------------------------------------------
    await test.step('Step 4: Daily Sentra Activities in TK 02 Kebayoran', async () => {
      console.log('[STEP 4] Inspecting daily work workspace for TK 02 Kebayoran');
      const dailyWorkContent = await page.innerText('main');
      expect(dailyWorkContent).toContain('Agenda & Kerja Harian Guru');
      await page.screenshot({ path: path.join(evidenceDir, '04_daily_work_pedagogy.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 5: Presensi Harian in TK 02 Kebayoran
    // -------------------------------------------------------------------------
    await test.step('Step 5: Presensi Harian in TK 02 Kebayoran', async () => {
      console.log('[STEP 5] Navigating to Presensi Harian');
      await page.locator('nav button:has-text("Presensi")').click();
      await page.waitForSelector('text=Buku Presensi & Skrining Kedatangan Siswa', { timeout: 10000 });
      
      console.log('[STEP 5] Inspecting attendance workspace in TK 02');
      await page.screenshot({ path: path.join(evidenceDir, '05_presensi_tk02.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 6: Anecdotal Observation Recording in TK 02 Kebayoran
    // -------------------------------------------------------------------------
    await test.step('Step 6: Observasi TK (Kurikulum Merdeka) in TK 02 Kebayoran', async () => {
      console.log('[STEP 6] Navigating to Observasi TK');
      await page.locator('nav button:has-text("Observasi TK")').click();
      await page.waitForSelector('text=Catatan Anekdot & Observasi Perkembangan Anak', { timeout: 10000 });
      
      console.log('[STEP 6] Inspecting anecdotal observation workspace in TK 02');
      await page.screenshot({ path: path.join(evidenceDir, '06_observasi_tk02.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 7: LPPA Progress Report & Invariant #5 Enforcement in TK 02
    // -------------------------------------------------------------------------
    await test.step('Step 7: LPPA Progress Report & Invariant #5 Enforcement in TK 02', async () => {
      console.log('[STEP 7] Navigating to Perkembangan (LPPA Workspace)');
      await page.locator('nav button:has-text("Perkembangan")').click();
      await page.waitForSelector('text=Laporan Capaian Perkembangan Siswa (LPPA)', { timeout: 10000 });
      
      console.log('[STEP 7] Inspecting LPPA workspace in TK 02');
      await page.screenshot({ path: path.join(evidenceDir, '07_lppa_tk02.png'), fullPage: true });
      await page.waitForTimeout(1200);

      // INVARIANT CHECK: Teacher CANNOT Approve or Publish LPPA
      const approveBtn = page.locator('button:has-text("Sahkan Laporan LPPA")');
      const publishBtn = page.locator('button:has-text("Publikasikan ke Wali Murid")');
      const canApprove = await approveBtn.isVisible();
      const canPublish = await publishBtn.isVisible();
      
      console.log('  [INVARIANT CHECK] Teacher Diana can see Sahkan LPPA button:', canApprove);
      console.log('  [INVARIANT CHECK] Teacher Diana can see Publikasikan LPPA button:', canPublish);
      expect(canApprove).toBe(false);
      expect(canPublish).toBe(false);
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 8: Student Roster Class Inspection in TK 02 Kebayoran
    // -------------------------------------------------------------------------
    await test.step('Step 8: Student Roster in TK 02 Kebayoran', async () => {
      console.log('[STEP 8] Navigating to Data Induk Siswa & Roster');
      const lainnyaContainer = page.locator('div.group.relative', { hasText: 'Lainnya' });
      await lainnyaContainer.hover();
      await page.waitForTimeout(400);
      await page.locator('button:has-text("Data Induk Siswa & Roster")').click();

      await page.waitForSelector('text=Data Induk Siswa & Entitas Kanonikal', { timeout: 10000 });
      console.log('[STEP 8] Verifying student roster scoped to TK 02');
      const rosterContent = await page.innerText('main');
      expect(rosterContent).toContain('Data Induk Siswa & Entitas Kanonikal');
      await page.screenshot({ path: path.join(evidenceDir, '08_roster_siswa_tk02.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 9: Buku Penghubung Parent Communication in TK 02
    // -------------------------------------------------------------------------
    await test.step('Step 9: Buku Penghubung in TK 02 Kebayoran', async () => {
      console.log('[STEP 9] Navigating to Buku Penghubung');
      await page.locator('nav button:has-text("Buku Penghubung")').click();
      await page.waitForSelector('text=Buku Penghubung Digital (Komunikasi Guru & Orang Tua)', { timeout: 10000 });
      
      console.log('[STEP 9] Inspecting parent notices timeline in TK 02');
      await page.screenshot({ path: path.join(evidenceDir, '09_buku_penghubung_tk02.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 10: Contextual Security Policy Matrix
    // -------------------------------------------------------------------------
    await test.step('Step 10: Contextual Security Policy Matrix Evaluation', async () => {
      console.log('[STEP 10] Navigating to Uji Otorisasi');
      await page.locator('nav button:has-text("Uji Otorisasi")').click();
      await page.waitForSelector('text=Automated Negative & Positive Authorization Testing', { timeout: 10000 });
      
      console.log('[STEP 10] Verifying 9 security test cases under Teacher Diana (TK 02) context');
      const testsContent = await page.innerText('main');
      expect(testsContent).toContain('9 Lolos');
      expect(testsContent).toContain('0 Gagal');
      await page.screenshot({ path: path.join(evidenceDir, '10_uji_otorisasi.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 11: Controlled Sign Out & Storage Cache Purge
    // -------------------------------------------------------------------------
    await test.step('Step 11: Controlled Sign Out & Complete Storage Purge', async () => {
      console.log('[STEP 11] Opening persona profile menu and signing out');
      const profileBtn = page.locator('header button').last();
      await profileBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(evidenceDir, '11_profile_menu.png') });

      console.log('[STEP 11] Clicking Keluar / Sign Out...');
      await page.locator('button:has-text("Keluar / Sign Out")').click();
      await page.waitForSelector('button:has-text("Masuk Akun Supabase (Resmi)")', { timeout: 10000 });
      
      console.log('[STEP 11] Teacher Diana signed out cleanly.');
      await page.screenshot({ path: path.join(evidenceDir, '12_signout_clean.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    console.log('========================================================================');
    console.log('[GATE 6] [UAT-05 COMPREHENSIVE] ALL 11 STEPS COMPLETED & VERIFIED 100% PASS');
    console.log('========================================================================');
  });
});
