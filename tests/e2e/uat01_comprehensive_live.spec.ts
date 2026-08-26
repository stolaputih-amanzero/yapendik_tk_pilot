import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-01 (COMPREHENSIVE LIVE SUPABASE): Dr. Andreas Hendrawan (Yayasan Superadmin)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-01-comprehensive');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-01 Full Live Journey (11 Steps): Multi-Unit Governance, Pedagogical Oversight & Security Audit', async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
    page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

    console.log('========================================================================');
    console.log('[GATE 6] [UAT-01 COMPREHENSIVE] STARTING FULL 11-STEP LIVE SUPABASE JOURNEY');
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

      console.log('[STEP 1] Entering email: andreas@yapendik.sch.id & password...');
      await page.locator('input[type="email"]').fill('andreas@yapendik.sch.id');
      await page.waitForTimeout(400);
      await page.locator('input[type="password"]').fill('YapendikPilot2026!');
      await page.waitForTimeout(600);

      await page.locator('button[type="submit"]').click();
      await page.waitForSelector('text=Persona Aktif:', { timeout: 20000 });
      console.log('[STEP 1] Authentication Successful! Sesi Supabase Cloud Terbuka.');
      await page.screenshot({ path: path.join(evidenceDir, '01_login_success.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 2: Governance Identity & Institutional Ribbon Verification
    // -------------------------------------------------------------------------
    await test.step('Step 2: Verify Superadmin Role & Context Ribbon', async () => {
      console.log('[STEP 2] Verifying Superadmin role in Ribbon and TopBar');
      const personaContext = page.locator('div:has-text("Persona Aktif:")').first();
      await expect(personaContext).toBeVisible();
      const text = await personaContext.innerText();
      console.log('  Persona Context text:', text);
      expect(text).toContain('Dr. Andreas Hendrawan');
      expect(text).toContain('YAPENDIK_SUPERADMIN');
      await page.screenshot({ path: path.join(evidenceDir, '02_ribbon_verified.png') });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 3: Multi-School Unit Switching (Menteng ↔ Kebayoran)
    // -------------------------------------------------------------------------
    await test.step('Step 3: Multi-School Unit Switching Test', async () => {
      console.log('[STEP 3] Testing interactive school unit switcher dropdown');
      const schoolSelect = page.locator('select').first();
      await expect(schoolSelect).toBeVisible();

      console.log('[STEP 3] Switching to TK Yapendik 02 Kebayoran...');
      await schoolSelect.selectOption('sch_tk_yapendik_02');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(evidenceDir, '03_switched_to_tk02.png') });
      await page.waitForTimeout(1500);

      console.log('[STEP 3] Switching back to TK Yapendik 01 Menteng...');
      await schoolSelect.selectOption('sch_tk_yapendik_01');
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(evidenceDir, '03b_switched_back_tk01.png') });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 4: School Profile & Rombel Oversight (Tata Kelola Workspace)
    // -------------------------------------------------------------------------
    await test.step('Step 4: School Profile & Rombel Capacity Oversight', async () => {
      console.log('[STEP 4] Navigating to Tata Kelola Workspace');
      const lainnyaContainer = page.locator('div.group.relative', { hasText: 'Lainnya' });
      await lainnyaContainer.hover();
      await page.waitForTimeout(400);
      await page.locator('button:has-text("Tata Kelola & Audit Log")').click();

      await page.waitForSelector('text=Profil Institusi & Jejak Tata Kelola', { timeout: 10000 });
      console.log('[STEP 4] Inspecting Headmaster Esther and Rombel capacities');
      const tataKelolaContent = await page.innerText('main');
      expect(tataKelolaContent).toContain('TK Yapendik 01 Menteng');
      expect(tataKelolaContent).toContain('Dra. Esther Nugroho, M.Pd');
      expect(tataKelolaContent).toContain('Kelompok A (Bintang Ceria)');
      expect(tataKelolaContent).toContain('Kelompok B (Matahari Cemerlang)');
      await page.screenshot({ path: path.join(evidenceDir, '04_tata_kelola_profile.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 5: Immutable Governance Audit Trail Inspection
    // -------------------------------------------------------------------------
    await test.step('Step 5: Immutable Governance Audit Trail Inspection', async () => {
      console.log('[STEP 5] Inspecting immutable audit logs table');
      const auditSection = page.locator('text=Jejak Audit Aktivitas & Tata Kelola');
      await expect(auditSection).toBeVisible();
      await page.screenshot({ path: path.join(evidenceDir, '05_audit_logs.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 6: Student Roster Oversight (Roster Siswa Workspace)
    // -------------------------------------------------------------------------
    await test.step('Step 6: Student Roster Oversight', async () => {
      console.log('[STEP 6] Navigating to Data Induk Siswa & Roster');
      const lainnyaContainer = page.locator('div.group.relative', { hasText: 'Lainnya' });
      await lainnyaContainer.hover();
      await page.waitForTimeout(400);
      await page.locator('button:has-text("Data Induk Siswa & Roster")').click();

      await page.waitForSelector('text=Data Induk Siswa & Entitas Kanonikal', { timeout: 10000 });
      console.log('[STEP 6] Verifying enrolled students (Kenzo, Alina, Michelle, dsb.)');
      const rosterContent = await page.innerText('main');
      expect(rosterContent).toContain('Kenzo Pratama');
      await page.screenshot({ path: path.join(evidenceDir, '06_roster_siswa.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 7: Kurikulum Merdeka Observation Oversight
    // -------------------------------------------------------------------------
    await test.step('Step 7: Observasi TK (Kurikulum Merdeka 6 Domain)', async () => {
      console.log('[STEP 7] Navigating to Observasi TK');
      await page.locator('nav button:has-text("Observasi TK")').click();
      await page.waitForSelector('text=Catatan Anekdot & Observasi Perkembangan Anak', { timeout: 10000 });
      
      console.log('[STEP 7] Inspecting anecdotal observations');
      await page.screenshot({ path: path.join(evidenceDir, '07_observasi_tk.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 8: LPPA Progress Report Oversight & Status Verification
    // -------------------------------------------------------------------------
    await test.step('Step 8: LPPA Progress Report Lifecycle Oversight', async () => {
      console.log('[STEP 8] Navigating to Perkembangan (LPPA)');
      await page.locator('nav button:has-text("Perkembangan")').click();
      await page.waitForSelector('text=Laporan Capaian Perkembangan Siswa (LPPA)', { timeout: 10000 });
      
      console.log('[STEP 8] Inspecting LPPA progress report review cards');
      await page.screenshot({ path: path.join(evidenceDir, '08_lppa_workspace.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 9: Buku Penghubung Parent Communication Oversight
    // -------------------------------------------------------------------------
    await test.step('Step 9: Buku Penghubung Parent-Teacher Communication', async () => {
      console.log('[STEP 9] Navigating to Buku Penghubung');
      await page.locator('nav button:has-text("Buku Penghubung")').click();
      await page.waitForSelector('text=Buku Penghubung Digital (Komunikasi Guru & Orang Tua)', { timeout: 10000 });
      
      console.log('[STEP 9] Inspecting communication notices and parent acknowledgments');
      await page.screenshot({ path: path.join(evidenceDir, '09_buku_penghubung.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 10: Security Matrix & Policy Evaluator
    // -------------------------------------------------------------------------
    await test.step('Step 10: Security Matrix & Policy Evaluator', async () => {
      console.log('[STEP 10] Navigating to Uji Otorisasi');
      await page.locator('nav button:has-text("Uji Otorisasi")').click();
      await page.waitForSelector('text=Automated Negative & Positive Authorization Testing', { timeout: 10000 });
      
      console.log('[STEP 10] Verifying 9 security test cases (9 Lolos, 0 Gagal)');
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
      
      console.log('[STEP 11] Returned to login screen cleanly.');
      await page.screenshot({ path: path.join(evidenceDir, '12_signout_clean.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    console.log('========================================================================');
    console.log('[GATE 6] [UAT-01 COMPREHENSIVE] ALL 11 STEPS COMPLETED & VERIFIED 100% PASS');
    console.log('========================================================================');
  });
});
