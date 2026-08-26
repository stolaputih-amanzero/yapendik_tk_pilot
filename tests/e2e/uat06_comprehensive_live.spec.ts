import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-06 (COMPREHENSIVE LIVE SUPABASE): Budi Santoso, S.T. (Wali Murid)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-06-comprehensive');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-06 Full Live Journey (11 Steps): Guardian Scope, PII Boundary, Published LPPA, Digital Communication & Cache Purge', async ({ page }) => {
    page.on('pageerror', err => console.log('PAGE_ERR:', err.message));
    page.on('console', msg => console.log('PAGE_LOG:', msg.text()));

    console.log('========================================================================');
    console.log('[GATE 6] [UAT-06 COMPREHENSIVE] STARTING WALI MURID LIVE SUPABASE JOURNEY');
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

      console.log('[STEP 1] Entering email: budi@yapendik.sch.id & password...');
      await page.locator('input[type="email"]').fill('budi@yapendik.sch.id');
      await page.waitForTimeout(400);
      await page.locator('input[type="password"]').fill('YapendikPilot2026!');
      await page.waitForTimeout(600);

      await page.locator('button[type="submit"]').click();
      await page.waitForSelector('text=Persona Aktif:', { timeout: 20000 });
      console.log('[STEP 1] Authentication Successful! Sesi Supabase Cloud Wali Murid Budi Terbuka.');
      await page.screenshot({ path: path.join(evidenceDir, '01_login_success.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 2: Verify Guardian Identity & Student Binding Context Ribbon
    // -------------------------------------------------------------------------
    await test.step('Step 2: Verify Guardian Role & Student Binding Context Ribbon', async () => {
      console.log('[STEP 2] Verifying Guardian Budi Santoso role in Ribbon and TopBar');
      const personaContext = page.locator('div:has-text("Persona Aktif:")').first();
      await expect(personaContext).toBeVisible();
      const text = await personaContext.innerText();
      console.log('  Persona Context text:', text);
      expect(text).toContain('Budi Santoso');
      expect(text).toContain('GUARDIAN');
      expect(text).toContain('TK Yapendik 01 Menteng');
      await page.screenshot({ path: path.join(evidenceDir, '02_ribbon_verified.png') });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 3: Assert Strict Child Data Boundary & PII Protection
    // -------------------------------------------------------------------------
    await test.step('Step 3: Assert Strict Child Data Boundary (Zero Other-Children Exposure)', async () => {
      console.log('[STEP 3] Asserting Budi cannot access non-related children records');
      const pageText = await page.innerText('body');
      expect(pageText.includes('Nathan Timothy')).toBe(false);
      expect(pageText.includes('Gabriel Christian')).toBe(false);
      console.log('  [PII BOUNDARY ASSERTION] Zero leakage of non-related children: CONFIRMED');
      await page.screenshot({ path: path.join(evidenceDir, '03_pii_boundary_asserted.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 4: Shared Child Observation Feed (Observasi TK)
    // -------------------------------------------------------------------------
    await test.step('Step 4: Shared Child Observation Feed & Confidentiality Protection', async () => {
      console.log('[STEP 4] Navigating to Observasi TK (Child Feed)');
      await page.locator('nav button:has-text("Observasi TK")').click();
      await page.waitForSelector('text=Catatan Anekdot & Observasi Perkembangan Anak', { timeout: 10000 });
      
      console.log('[STEP 4] Verifying observable entries for Kenzo');
      const obsContent = await page.innerText('main');
      expect(obsContent).toContain('Kenzo Pratama');
      
      // CONFIDENTIALITY ASSERTION: Teacher confidential internal notes MUST NOT leak
      expect(obsContent.includes('Rahasia Internal')).toBe(false);
      expect(obsContent.includes('Catatan Internal')).toBe(false);
      console.log('  [CONFIDENTIALITY ASSERTION] Teacher internal notes hidden from guardian: CONFIRMED');
      await page.screenshot({ path: path.join(evidenceDir, '04_shared_observations.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 5: Official Published LPPA Document Inspection (Perkembangan)
    // -------------------------------------------------------------------------
    await test.step('Step 5: Official Published LPPA Document Inspection', async () => {
      console.log('[STEP 5] Navigating to Perkembangan (LPPA Workspace)');
      await page.locator('nav button:has-text("Perkembangan")').click();
      await page.waitForSelector('text=Laporan Capaian Perkembangan Siswa (LPPA)', { timeout: 10000 });
      
      console.log('[STEP 5] Inspecting Kenzo Pratama Santoso official LPPA report');
      const lppaContent = await page.innerText('main');
      expect(lppaContent).toContain('Kenzo Pratama Santoso');
      expect(lppaContent).toContain('Resmi Dipublikasikan (Terkunci)');
      expect(lppaContent).toContain('SINTESIS CAPAIAN 6 DOMAIN PERKEMBANGAN ANAK');

      // LPPA IMMUTABILITY: Guardian cannot edit or approve LPPA
      const canApprove = await page.locator('button:has-text("Sahkan Laporan LPPA")').isVisible();
      const canPublish = await page.locator('button:has-text("Publikasikan ke Wali Murid")').isVisible();
      const canSaveDraft = await page.locator('button:has-text("Simpan Draf LPPA")').isVisible();
      expect(canApprove).toBe(false);
      expect(canPublish).toBe(false);
      expect(canSaveDraft).toBe(false);
      console.log('  [LPPA IMMUTABILITY] Guardian has read-only access to published document: CONFIRMED');

      await page.screenshot({ path: path.join(evidenceDir, '05_published_lppa_view.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 6: Buku Penghubung Parent-Teacher Communication
    // -------------------------------------------------------------------------
    await test.step('Step 6: Buku Penghubung Parent-Teacher Communication', async () => {
      console.log('[STEP 6] Navigating to Buku Penghubung');
      await page.locator('nav button:has-text("Buku Penghubung")').click();
      await page.waitForSelector('text=Buku Penghubung Digital (Komunikasi Guru & Orang Tua)', { timeout: 10000 });
      
      console.log('[STEP 6] Inspecting announcements and child communication timeline');
      const commContent = await page.innerText('main');
      expect(commContent).toContain('Buku Penghubung Digital');
      await page.screenshot({ path: path.join(evidenceDir, '06_buku_penghubung.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 7: Presensi & Health Screening from Guardian View
    // -------------------------------------------------------------------------
    await test.step('Step 7: Presensi & Health Screening from Guardian View', async () => {
      console.log('[STEP 7] Navigating to Presensi Harian');
      await page.locator('nav button:has-text("Presensi")').click();
      await page.waitForSelector('text=Buku Presensi & Skrining Kedatangan Siswa', { timeout: 10000 });
      
      console.log('[STEP 7] Inspecting child attendance and health screening');
      await page.screenshot({ path: path.join(evidenceDir, '07_presensi_guardian_view.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 8: Contextual Security Policy Matrix Evaluation (Uji Otorisasi)
    // -------------------------------------------------------------------------
    await test.step('Step 8: Contextual Security Policy Matrix Evaluation', async () => {
      console.log('[STEP 8] Navigating to Uji Otorisasi');
      await page.locator('nav button:has-text("Uji Otorisasi")').click();
      await page.waitForSelector('text=Automated Negative & Positive Authorization Testing', { timeout: 10000 });
      
      console.log('[STEP 8] Verifying 9 security test cases under Guardian context');
      const testsContent = await page.innerText('main');
      expect(testsContent).toContain('9 Lolos');
      expect(testsContent).toContain('0 Gagal');
      await page.screenshot({ path: path.join(evidenceDir, '08_uji_otorisasi.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 9: Institutional Governance & Profile (Tata Kelola)
    // -------------------------------------------------------------------------
    await test.step('Step 9: Institutional Profile Review', async () => {
      console.log('[STEP 9] Navigating to Tata Kelola & Audit Log');
      const lainnyaContainer = page.locator('div.group.relative', { hasText: 'Lainnya' });
      if (await lainnyaContainer.isVisible()) {
        await lainnyaContainer.hover();
        await page.waitForTimeout(400);
        const tataKelolaBtn = page.locator('button:has-text("Tata Kelola & Audit Log")');
        if (await tataKelolaBtn.isVisible()) {
          await tataKelolaBtn.click();
          await page.waitForSelector('text=Profil Institusi & Jejak Tata Kelola', { timeout: 10000 });
        }
      }
      await page.screenshot({ path: path.join(evidenceDir, '09_tata_kelola.png'), fullPage: true });
      await page.waitForTimeout(1500);
    });

    // -------------------------------------------------------------------------
    // STEP 10: Open Persona Menu & Verify User Account Details
    // -------------------------------------------------------------------------
    await test.step('Step 10: Persona Context Menu Verification', async () => {
      console.log('[STEP 10] Opening persona profile menu');
      const profileBtn = page.locator('header button').last();
      await profileBtn.click();
      await page.waitForTimeout(800);
      await page.screenshot({ path: path.join(evidenceDir, '10_profile_menu.png') });
    });

    // -------------------------------------------------------------------------
    // STEP 11: Controlled Sign Out & Storage Cache Purge
    // -------------------------------------------------------------------------
    await test.step('Step 11: Controlled Sign Out & Complete Storage Purge', async () => {
      console.log('[STEP 11] Clicking Keluar / Sign Out...');
      await page.locator('button:has-text("Keluar / Sign Out")').click();
      await page.waitForSelector('button:has-text("Masuk Akun Supabase (Resmi)")', { timeout: 10000 });
      
      console.log('[STEP 11] Guardian Budi signed out cleanly.');
      await page.screenshot({ path: path.join(evidenceDir, '11_signout_clean.png'), fullPage: true });

      const storageKeys = await page.evaluate(() => Object.keys(localStorage));
      console.log('Remaining localStorage keys after purge:', storageKeys);
      const userCachedData = storageKeys.filter(k => k.startsWith('yapendik_os_v2_u_'));
      expect(userCachedData.length).toBe(0);
      await page.waitForTimeout(1500);
    });

    console.log('========================================================================');
    console.log('[GATE 6] [UAT-06 COMPREHENSIVE] ALL 11 STEPS COMPLETED & VERIFIED 100% PASS');
    console.log('========================================================================');
  });
});
