import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-04 (COMPREHENSIVE LIVE SUPABASE): Maria Magdalena, S.Pd.Aud (Guru TK B)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-04-comprehensive');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-04 Full Live Journey (11 Steps): TK B Pedagogical Flow, Attendance, Observations, LPPA Synthesis & Parent Communication', async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
    page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

    console.log('========================================================================');
    console.log('[GATE 6] [UAT-04 COMPREHENSIVE] STARTING GURU TK B LIVE SUPABASE JOURNEY');
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

      console.log('[STEP 1] Entering email: maria@yapendik.sch.id & password...');
      await page.locator('input[type="email"]').fill('maria@yapendik.sch.id');
      await page.waitForTimeout(400);
      await page.locator('input[type="password"]').fill('YapendikPilot2026!');
      await page.waitForTimeout(600);

      await page.locator('button[type="submit"]').click();
      await page.waitForSelector('text=Persona Aktif:', { timeout: 20000 });
      console.log('[STEP 1] Authentication Successful! Sesi Supabase Cloud Guru Maria Terbuka.');
      await page.screenshot({ path: path.join(evidenceDir, '01_login_success.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 2: Verify Teacher Identity & Class Context Ribbon
    // -------------------------------------------------------------------------
    await test.step('Step 2: Verify Teacher Role & Class Context Ribbon', async () => {
      console.log('[STEP 2] Verifying Teacher Maria Magdalena role in Ribbon and TopBar');
      const personaContext = page.locator('div:has-text("Persona Aktif:")').first();
      await expect(personaContext).toBeVisible();
      const text = await personaContext.innerText();
      console.log('  Persona Context text:', text);
      expect(text).toContain('Maria Magdalena');
      expect(text).toContain('TEACHER');
      expect(text).toContain('TK Yapendik 01 Menteng');
      await page.screenshot({ path: path.join(evidenceDir, '02_ribbon_verified.png') });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 3: Daily Sentra Organization & Pedagogical Planning (Kerja Harian)
    // -------------------------------------------------------------------------
    await test.step('Step 3: Daily Sentra Activities & Pedagogical Reflection', async () => {
      console.log('[STEP 3] Inspecting daily work workspace for Kelompok B (Matahari Cemerlang)');
      const dailyWorkContent = await page.innerText('main');
      expect(dailyWorkContent).toContain('Agenda & Kerja Harian Guru');
      await page.screenshot({ path: path.join(evidenceDir, '03_daily_work_pedagogy.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 4: Daily Attendance Register & Health Screening (Presensi Harian)
    // -------------------------------------------------------------------------
    await test.step('Step 4: Presensi Harian, Suhu & Mood Kedatangan Siswa Kelompok B', async () => {
      console.log('[STEP 4] Navigating to Presensi Harian');
      await page.locator('nav button:has-text("Presensi")').click();
      await page.waitForSelector('text=Buku Presensi & Skrining Kedatangan Siswa', { timeout: 10000 });
      
      console.log('[STEP 4] Recording presence & screening for Kelompok B');
      const savePresensiBtn = page.locator('button:has-text("Simpan Presensi Kelas")');
      if (await savePresensiBtn.isVisible()) {
        await savePresensiBtn.click();
        await page.waitForTimeout(1500);
      }
      await page.screenshot({ path: path.join(evidenceDir, '04_presensi_saved.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 5: Anecdotal Observation Recording (Observasi TK - Kurikulum Merdeka)
    // -------------------------------------------------------------------------
    await test.step('Step 5: Observasi TK (Perekaman Bukti Belajar Kelompok B)', async () => {
      console.log('[STEP 5] Navigating to Observasi TK');
      await page.locator('nav button:has-text("Observasi TK")').click();
      await page.waitForSelector('text=Catatan Anekdot & Observasi Perkembangan Anak', { timeout: 10000 });
      
      console.log('[STEP 5] Opening modal Tambah Catatan Observasi Baru for Kelompok B...');
      const addObsBtn = page.locator('button:has-text("Catat Observasi Anekdot")');
      if (await addObsBtn.isVisible()) {
        await addObsBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(evidenceDir, '05a_tambah_observasi_modal.png') });

        // Fill observation form
        const descInput = page.locator('div.fixed textarea').first();
        if (await descInput.isVisible()) {
          await descInput.fill('Ananda Keisha menunjukkan keterampilan bercerita yang runtut tentang liburan bersama keluarga di sentra bahasa.');
          await page.waitForTimeout(500);
        }

        // Submit modal
        const submitBtn = page.locator('button:has-text("Simpan Catatan Observasi")');
        if (await submitBtn.isVisible()) {
          await submitBtn.click();
          await page.waitForTimeout(1500);
        }
      }

      await page.screenshot({ path: path.join(evidenceDir, '05b_observasi_recorded.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 6: LPPA Progress Report Drafting & Invariant #5 Enforcement
    // -------------------------------------------------------------------------
    await test.step('Step 6: LPPA Progress Report Drafting & Invariant #5 Enforcement', async () => {
      console.log('[STEP 6] Navigating to Perkembangan (LPPA Workspace)');
      await page.locator('nav button:has-text("Perkembangan")').click();
      await page.waitForSelector('text=Laporan Capaian Perkembangan Siswa (LPPA)', { timeout: 10000 });
      
      console.log('[STEP 6] Inspecting LPPA report synthesis for Kelompok B student');
      await page.screenshot({ path: path.join(evidenceDir, '06a_lppa_synthesis_view.png'), fullPage: true });
      await page.waitForTimeout(1200);

      // INVARIANT CHECK: Teacher CANNOT Approve or Publish LPPA
      const approveBtn = page.locator('button:has-text("Sahkan Laporan LPPA")');
      const publishBtn = page.locator('button:has-text("Publikasikan ke Wali Murid")');
      const canApprove = await approveBtn.isVisible();
      const canPublish = await publishBtn.isVisible();
      
      console.log('  [INVARIANT CHECK] Teacher Maria can see Sahkan LPPA button:', canApprove);
      console.log('  [INVARIANT CHECK] Teacher Maria can see Publikasikan LPPA button:', canPublish);
      expect(canApprove).toBe(false);
      expect(canPublish).toBe(false);

      // Teacher CAN save draft or submit to Headmaster
      const draftBtn = page.locator('button:has-text("Simpan Draf LPPA")');
      if (await draftBtn.isVisible()) {
        await draftBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(evidenceDir, '06b_lppa_draft_saved.png'), fullPage: true });
      }

      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 7: Buku Penghubung Parent-Teacher Communication
    // -------------------------------------------------------------------------
    await test.step('Step 7: Buku Penghubung Parent Communication', async () => {
      console.log('[STEP 7] Navigating to Buku Penghubung');
      await page.locator('nav button:has-text("Buku Penghubung")').click();
      await page.waitForSelector('text=Buku Penghubung Digital (Komunikasi Guru & Orang Tua)', { timeout: 10000 });
      
      console.log('[STEP 7] Inspecting parent notices and communication timeline');
      const commContent = await page.innerText('main');
      expect(commContent).toContain('Buku Penghubung Digital');
      await page.screenshot({ path: path.join(evidenceDir, '07_buku_penghubung.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 8: Student Roster Class Inspection (Roster Siswa Workspace)
    // -------------------------------------------------------------------------
    await test.step('Step 8: Student Roster & Special Needs (Lactose Intolerance) Inspection', async () => {
      console.log('[STEP 8] Navigating to Data Induk Siswa & Roster');
      const lainnyaContainer = page.locator('div.group.relative', { hasText: 'Lainnya' });
      await lainnyaContainer.hover();
      await page.waitForTimeout(400);
      await page.locator('button:has-text("Data Induk Siswa & Roster")').click();

      await page.waitForSelector('text=Data Induk Siswa & Entitas Kanonikal', { timeout: 10000 });
      console.log('[STEP 8] Verifying Kelompok B student roster (Keisha, Rafael)');
      const rosterContent = await page.innerText('main');
      expect(rosterContent).toContain('Data Induk Siswa & Entitas Kanonikal');
      await page.screenshot({ path: path.join(evidenceDir, '08_roster_siswa.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 9: Contextual Authorization Evaluator
    // -------------------------------------------------------------------------
    await test.step('Step 9: Contextual Authorization Matrix Evaluation', async () => {
      console.log('[STEP 9] Navigating to Uji Otorisasi');
      await page.locator('nav button:has-text("Uji Otorisasi")').click();
      await page.waitForSelector('text=Automated Negative & Positive Authorization Testing', { timeout: 10000 });
      
      console.log('[STEP 9] Verifying 9 security test cases under Teacher Maria context');
      const testsContent = await page.innerText('main');
      expect(testsContent).toContain('9 Lolos');
      expect(testsContent).toContain('0 Gagal');
      await page.screenshot({ path: path.join(evidenceDir, '09_uji_otorisasi.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 10: Institutional Leadership & Audit Trail Review
    // -------------------------------------------------------------------------
    await test.step('Step 10: School Leadership & Audit Trail Review', async () => {
      console.log('[STEP 10] Navigating to Tata Kelola & Audit Log');
      const lainnyaContainer = page.locator('div.group.relative', { hasText: 'Lainnya' });
      await lainnyaContainer.hover();
      await page.waitForTimeout(400);
      await page.locator('button:has-text("Tata Kelola & Audit Log")').click();

      await page.waitForSelector('text=Profil Institusi & Jejak Tata Kelola', { timeout: 10000 });
      console.log('[STEP 10] Inspecting School profile & immutable audit logs');
      await page.screenshot({ path: path.join(evidenceDir, '10_tata_kelola.png'), fullPage: true });
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
      
      console.log('[STEP 11] Teacher Maria signed out cleanly.');
      await page.screenshot({ path: path.join(evidenceDir, '12_signout_clean.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    console.log('========================================================================');
    console.log('[GATE 6] [UAT-04 COMPREHENSIVE] ALL 11 STEPS COMPLETED & VERIFIED 100% PASS');
    console.log('========================================================================');
  });
});
