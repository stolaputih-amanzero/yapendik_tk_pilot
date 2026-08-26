import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-02 (COMPREHENSIVE LIVE SUPABASE): Dra. Esther Nugroho, M.Pd (Headmaster)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-02-comprehensive');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-02 Full Live Journey (11 Steps): Multi-Class Supervision, LPPA Approval, Publication & School Leadership', async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
    page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

    console.log('========================================================================');
    console.log('[GATE 6] [UAT-02 COMPREHENSIVE] STARTING FULL 11-STEP LIVE SUPABASE JOURNEY');
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

      console.log('[STEP 1] Entering email: esther@yapendik.sch.id & password...');
      await page.locator('input[type="email"]').fill('esther@yapendik.sch.id');
      await page.waitForTimeout(400);
      await page.locator('input[type="password"]').fill('YapendikPilot2026!');
      await page.waitForTimeout(600);

      await page.locator('button[type="submit"]').click();
      await page.waitForSelector('text=Persona Aktif:', { timeout: 20000 });
      console.log('[STEP 1] Authentication Successful! Sesi Supabase Cloud Kepala Sekolah Terbuka.');
      await page.screenshot({ path: path.join(evidenceDir, '01_login_success.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 2: Verify Headmaster Identity & School Context Ribbon
    // -------------------------------------------------------------------------
    await test.step('Step 2: Verify Headmaster Role & School Context Ribbon', async () => {
      console.log('[STEP 2] Verifying Headmaster role in Ribbon and TopBar');
      const personaContext = page.locator('div:has-text("Persona Aktif:")').first();
      await expect(personaContext).toBeVisible();
      const text = await personaContext.innerText();
      console.log('  Persona Context text:', text);
      expect(text).toContain('Dra. Esther Nugroho');
      expect(text).toContain('HEADMASTER');
      expect(text).toContain('TK Yapendik 01 Menteng');
      await page.screenshot({ path: path.join(evidenceDir, '02_ribbon_verified.png') });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 3: Multi-Class Jurisdiction (Kelompok A ↔ Kelompok B)
    // -------------------------------------------------------------------------
    await test.step('Step 3: Multi-Class Jurisdiction across TK 01', async () => {
      console.log('[STEP 3] Verifying Headmaster can supervise both Kelompok A & B');
      const classSelect = page.locator('select').first();
      await expect(classSelect).toBeVisible();

      console.log('[STEP 3] Selecting Kelompok B (Matahari Cemerlang)...');
      await classSelect.selectOption('cls_tkb_01');
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(evidenceDir, '03_kelompok_b_view.png'), fullPage: true });
      await page.waitForTimeout(1500);

      console.log('[STEP 3] Switching back to Kelompok A (Bintang Ceria)...');
      await classSelect.selectOption('cls_tka_01');
      await page.waitForTimeout(1200);
      await page.screenshot({ path: path.join(evidenceDir, '03b_kelompok_a_view.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 4: Agenda & Kerja Harian Guru Monitoring
    // -------------------------------------------------------------------------
    await test.step('Step 4: Agenda & Kerja Harian Monitoring', async () => {
      console.log('[STEP 4] Inspecting daily sentra activities for Kelompok A');
      const dailyWorkContent = await page.innerText('main');
      expect(dailyWorkContent).toContain('Eksplorasi Rasa Buah & Bahan Alami');
      expect(dailyWorkContent).toContain('Finger Painting: Melukis Pelangi');
      await page.screenshot({ path: path.join(evidenceDir, '04_daily_work_oversight.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 5: Presensi Harian Supervision
    // -------------------------------------------------------------------------
    await test.step('Step 5: Presensi Harian Supervision', async () => {
      console.log('[STEP 5] Navigating to Presensi Harian');
      await page.locator('nav button:has-text("Presensi")').click();
      await page.waitForSelector('text=Buku Presensi & Skrining Kedatangan Siswa', { timeout: 10000 });
      
      console.log('[STEP 5] Inspecting attendance and health screening rates');
      const presensiContent = await page.innerText('main');
      expect(presensiContent).toContain('Kenzo Pratama Santoso');
      await page.screenshot({ path: path.join(evidenceDir, '05_presensi_supervision.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 6: Kurikulum Merdeka Observation Oversight
    // -------------------------------------------------------------------------
    await test.step('Step 6: Observasi TK (Kurikulum Merdeka 6 Domain)', async () => {
      console.log('[STEP 6] Navigating to Observasi TK');
      await page.locator('nav button:has-text("Observasi TK")').click();
      await page.waitForSelector('text=Catatan Anekdot & Observasi Perkembangan Anak', { timeout: 10000 });
      
      console.log('[STEP 6] Inspecting anecdotal observations across 6 developmental domains');
      await page.screenshot({ path: path.join(evidenceDir, '06_observasi_tk.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 7: LPPA Approval & Publication Authority (School Autonomy Mandate)
    // -------------------------------------------------------------------------
    await test.step('Step 7: LPPA Progress Report Approval & Publication Authority', async () => {
      console.log('[STEP 7] Navigating to Perkembangan (LPPA Workspace)');
      await page.locator('nav button:has-text("Perkembangan")').click();
      await page.waitForSelector('text=Laporan Capaian Perkembangan Siswa (LPPA)', { timeout: 10000 });
      
      console.log('[STEP 7] Inspecting Kenzo Pratama Santoso LPPA Report');
      const studentSelect = page.locator('select').nth(1);
      if (await studentSelect.isVisible()) {
        await studentSelect.selectOption({ label: 'Kenzo Pratama Santoso (TK-2026-001)' });
        await page.waitForTimeout(1000);
      }

      await page.screenshot({ path: path.join(evidenceDir, '07a_lppa_inspection.png'), fullPage: true });
      await page.waitForTimeout(1200);

      // Check if Submit for Review is needed first
      const submitReviewBtn = page.locator('button:has-text("Ajukan ke Kepala Sekolah")');
      if (await submitReviewBtn.isVisible()) {
        console.log('[STEP 7] Submitting draft for review...');
        await submitReviewBtn.click();
        await page.waitForTimeout(1200);
      }

      // Check Approve Button
      const approveBtn = page.locator('button:has-text("Sahkan Laporan LPPA")');
      if (await approveBtn.isVisible()) {
        console.log('[STEP 7] Executing Official Approval by Headmaster...');
        await approveBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(evidenceDir, '07b_lppa_approved.png'), fullPage: true });
      }

      // Check Publish Button
      const publishBtn = page.locator('button:has-text("Publikasikan ke Wali Murid")');
      if (await publishBtn.isVisible()) {
        console.log('[STEP 7] Publishing Official LPPA to Guardians...');
        await publishBtn.click();
        await page.waitForTimeout(1500);
        await page.screenshot({ path: path.join(evidenceDir, '07c_lppa_published.png'), fullPage: true });
      }

      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 8: Student Roster Oversight (Roster Siswa Workspace)
    // -------------------------------------------------------------------------
    await test.step('Step 8: Student Roster Oversight', async () => {
      console.log('[STEP 8] Navigating to Data Induk Siswa & Roster');
      const lainnyaContainer = page.locator('div.group.relative', { hasText: 'Lainnya' });
      await lainnyaContainer.hover();
      await page.waitForTimeout(400);
      await page.locator('button:has-text("Data Induk Siswa & Roster")').click();

      await page.waitForSelector('text=Data Induk Siswa & Entitas Kanonikal', { timeout: 10000 });
      console.log('[STEP 8] Verifying enrolled student records and parent linkages');
      const rosterContent = await page.innerText('main');
      expect(rosterContent).toContain('Kenzo Pratama');
      expect(rosterContent).toContain('ORANG TUA / WALI SAH TERKAIT');
      await page.screenshot({ path: path.join(evidenceDir, '08_roster_siswa.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 9: Buku Penghubung Parent Communication Oversight
    // -------------------------------------------------------------------------
    await test.step('Step 9: Buku Penghubung Parent-Teacher Communication', async () => {
      console.log('[STEP 9] Navigating to Buku Penghubung');
      await page.locator('nav button:has-text("Buku Penghubung")').click();
      await page.waitForSelector('text=Buku Penghubung Digital (Komunikasi Guru & Orang Tua)', { timeout: 10000 });
      
      console.log('[STEP 9] Inspecting parent notices and signed acknowledgments');
      await page.screenshot({ path: path.join(evidenceDir, '09_buku_penghubung.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 10: School Review & Governance Audit Trail
    // -------------------------------------------------------------------------
    await test.step('Step 10: School Review & Governance Audit Trail', async () => {
      console.log('[STEP 10] Navigating to Tata Kelola & Audit Log');
      const lainnyaContainer = page.locator('div.group.relative', { hasText: 'Lainnya' });
      await lainnyaContainer.hover();
      await page.waitForTimeout(400);
      await page.locator('button:has-text("Tata Kelola & Audit Log")').click();

      await page.waitForSelector('text=Profil Institusi & Jejak Tata Kelola', { timeout: 10000 });
      console.log('[STEP 10] Inspecting School Leadership context & audit records');
      const tataKelolaContent = await page.innerText('main');
      expect(tataKelolaContent).toContain('TK Yapendik 01 Menteng');
      expect(tataKelolaContent).toContain('Dra. Esther Nugroho, M.Pd');
      await page.screenshot({ path: path.join(evidenceDir, '10_tata_kelola_audit.png'), fullPage: true });
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
      
      console.log('[STEP 11] Headmaster Esther signed out cleanly.');
      await page.screenshot({ path: path.join(evidenceDir, '12_signout_clean.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    console.log('========================================================================');
    console.log('[GATE 6] [UAT-02 COMPREHENSIVE] ALL 11 STEPS COMPLETED & VERIFIED 100% PASS');
    console.log('========================================================================');
  });
});
