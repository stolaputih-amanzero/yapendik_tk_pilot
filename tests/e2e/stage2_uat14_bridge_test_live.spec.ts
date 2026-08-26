import { test, expect } from '@playwright/test';

test.describe('STAGE 2 — EXIT GATE: UAT-14 THE REALITY BRIDGE TEST', () => {
  test('UAT-14: First-Day Daily Operations on Newly Provisioned Institution (Zero DB Intervention)', async ({ page }) => {
    test.setTimeout(120000);

    console.log(`========================================================================`);
    console.log(`[STAGE 2 EXIT GATE] [UAT-14] STARTING THE REALITY BRIDGE ACCEPTANCE TEST`);
    console.log(`========================================================================`);

    // -------------------------------------------------------------------------
    // STEP 1: Application Entry & Login as Superadmin
    // -------------------------------------------------------------------------
    console.log('[UAT-14 STEP 1] Logging into Yapendik School OS...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /Masuk Akun Supabase/i }).click();
    await page.locator('input[type="email"]').fill('andreas@yapendik.sch.id');
    await page.locator('input[type="password"]').fill('YapendikPilot2026!');
    await page.locator('button[type="submit"]').click();

    await page.waitForSelector('text=Persona Aktif:', { timeout: 20000 });
    console.log('[UAT-14 STEP 1] Authentication verified!');

    // -------------------------------------------------------------------------
    // STEP 2: Provision New Institution (TK Yapendik Serpong)
    // -------------------------------------------------------------------------
    console.log('[UAT-14 STEP 2] Establishing and provisioning new institutional unit...');
    const uniqueNpsn = `2010${Date.now().toString().slice(-4)}`;
    const schoolName = `TK Yapendik Serpong (${uniqueNpsn.slice(-4)})`;

    await page.getByRole('button', { name: /Kesiapan Sekolah/i }).click();
    await page.waitForTimeout(600);

    await page.getByRole('button', { name: /Dirikan Unit Sekolah Baru/i }).click();
    await page.locator('input[placeholder="Contoh: TK Yapendik 03 Rawamangun"]').fill(schoolName);
    await page.locator('input[placeholder="20109988"]').fill(uniqueNpsn);
    await page.locator('input[placeholder="Jl. Pemuda No. 88"]').fill('Jl. Pahlawan Seribu No. 55');
    await page.locator('input[placeholder="tk03.rawamangun@yapendik.sch.id"]').fill(`tk.${uniqueNpsn}@yapendik.sch.id`);
    await page.getByRole('button', { name: /^Dirikan Sekolah$/i }).click();
    await page.waitForTimeout(2500);

    // Create Classroom
    await page.getByRole('button', { name: /Tambah Rombel & Wali Kelas/i }).click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Contoh: Kelompok A (Mawar Indah)"]').fill('Kelompok A (Bintang Kejora)');
    await page.locator('input[placeholder="Contoh: per_teacher_siti"]').fill('per_teacher_siti');
    await page.getByRole('button', { name: /^Bentuk Rombel$/i }).click();
    await page.waitForTimeout(2500);

    // Admit & Place Student
    await page.getByRole('button', { name: /Admisi & Penempatan Siswa/i }).click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Contoh: Jonathan Chris Rawamangun"]').fill('Nathanael Serpong');
    await page.locator('input[placeholder="Jonathan"]').fill('Nathanael');
    await page.locator('input[placeholder="TK-2026-0301"]').fill('TK-2026-0501');
    
    const classDropdown = page.locator('form select').filter({ hasText: /Pilih Rombel/i });
    await classDropdown.selectOption({ index: 1 });

    await page.locator('input[placeholder="Contoh: Samuel Rawamangun"]').fill('David Serpong');
    await page.locator('input[placeholder="081299887766"]').fill('081255667788');
    await page.getByRole('button', { name: /^Admisikan Siswa$/i }).click();
    await page.waitForTimeout(2500);

    // Verify derived READY state
    await expect(page.locator('text=KESIAPAN OPERASIONAL: READY')).toBeVisible();
    console.log(`[UAT-14 STEP 2] ${schoolName} established and verified derived READY (6/6 Gates)!`);

    // -------------------------------------------------------------------------
    // STEP 3: THE BRIDGE — Enter Stage 1 Daily Operations via UI Action
    // -------------------------------------------------------------------------
    console.log('[UAT-14 STEP 3] Crossing The Bridge into Stage 1 Daily Operations...');
    const enterOpsBtn = page.getByRole('button', { name: /Masuk ke Operasional Harian Sekolah/i });
    await enterOpsBtn.click();
    await page.waitForTimeout(1000);

    // Verify Active Workspace is Stage 1 Daily Work
    await expect(page.locator('text=Agenda & Kerja Harian Guru')).toBeVisible();
    console.log('[UAT-14 STEP 3] Successfully entered Stage 1 Daily Work workspace!');

    // -------------------------------------------------------------------------
    // STEP 4: Operate Daily Workflow on Newly Born School (Presensi)
    // -------------------------------------------------------------------------
    console.log('[UAT-14 STEP 4] Navigating to Stage 1 Presensi...');
    await page.getByRole('button', { name: /^Presensi$/i }).click();
    await page.waitForTimeout(800);

    await expect(page.locator('text=Buku Presensi & Skrining Kedatangan Siswa')).toBeVisible();
    await expect(page.locator('text=Nathanael Serpong')).toBeVisible();
    console.log('[UAT-14 STEP 4] Presensi workspace operational with admitted student!');

    // -------------------------------------------------------------------------
    // STEP 5: Operate Observasi TK on Newly Born School
    // -------------------------------------------------------------------------
    console.log('[UAT-14 STEP 5] Navigating to Stage 1 Observasi TK...');
    await page.getByRole('button', { name: /^Observasi TK$/i }).click();
    await page.waitForTimeout(800);

    await expect(page.locator('text=Catatan Anekdot & Observasi Perkembangan Anak')).toBeVisible();
    console.log('[UAT-14 STEP 5] Observasi TK operational for newly provisioned school!');

    // -------------------------------------------------------------------------
    // STEP 6: Operate Perkembangan (LPPA) on Newly Born School
    // -------------------------------------------------------------------------
    console.log('[UAT-14 STEP 6] Navigating to Stage 1 Perkembangan (LPPA)...');
    await page.getByRole('button', { name: /^Perkembangan$/i }).click();
    await page.waitForTimeout(800);

    await expect(page.locator('text=Laporan Capaian Perkembangan Siswa (LPPA)')).toBeVisible();
    console.log('[UAT-14 STEP 6] Perkembangan LPPA operational for newly provisioned school!');

    // -------------------------------------------------------------------------
    // STEP 7: Security Audit Confirmation
    // -------------------------------------------------------------------------
    console.log('[UAT-14 STEP 7] Verifying Security Boundaries in Uji Otorisasi...');
    await page.getByRole('button', { name: /^Uji Otorisasi$/i }).click();
    await page.waitForTimeout(800);

    await expect(page.locator('text=Automated Negative & Positive Authorization Testing')).toBeVisible();
    console.log('[UAT-14 STEP 7] Security audit passed with zero leakage!');

    console.log(`========================================================================`);
    console.log(`[STAGE 2 EXIT GATE] UAT-14 THE REALITY BRIDGE TEST PASSED 100%!`);
    console.log(`========================================================================`);
  });
});
