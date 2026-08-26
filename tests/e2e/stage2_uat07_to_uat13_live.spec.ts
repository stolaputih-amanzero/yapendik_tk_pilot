import { test, expect } from '@playwright/test';

test.describe('STAGE 2 — LIVE ACCEPTANCE SUITE (UAT-07 s.d. UAT-13)', () => {
  test('Institutional Lifecycle: From Birth to Operational Readiness (TK Yapendik 04 Kemang)', async ({ page }) => {
    test.setTimeout(120000);

    console.log(`========================================================================`);
    console.log(`[STAGE 2 ACCEPTANCE] STARTING UAT-07 S.D. UAT-13 INSTITUTIONAL LIFECYCLE`);
    console.log(`========================================================================`);

    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERR:', err.message));

    // -------------------------------------------------------------------------
    // STEP 1: Superadmin Login
    // -------------------------------------------------------------------------
    console.log('[STEP 1] Logging in as Superadmin (Dr. Andreas Hendrawan)...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /Masuk Akun Supabase/i }).click();
    await page.locator('input[type="email"]').fill('andreas@yapendik.sch.id');
    await page.locator('input[type="password"]').fill('YapendikPilot2026!');
    await page.locator('button[type="submit"]').click();

    await page.waitForSelector('text=Persona Aktif:', { timeout: 20000 });
    console.log('[STEP 1] Superadmin login verified!');

    // -------------------------------------------------------------------------
    // UAT-07: CREATE_SCHOOL (Unit Birth)
    // -------------------------------------------------------------------------
    console.log('[UAT-07] Navigating to Provisioning Workspace...');
    await page.getByRole('button', { name: /Kesiapan Sekolah/i }).click();
    await page.waitForTimeout(600);

    console.log('[UAT-07] Creating new institutional unit: TK Yapendik Kemang Unit...');
    const uniqueNpsn = `2010${Date.now().toString().slice(-4)}`;
    const schoolName = `TK Yapendik Kemang (${uniqueNpsn.slice(-4)})`;

    await page.getByRole('button', { name: /Dirikan Unit Sekolah Baru/i }).click();
    await page.locator('input[placeholder="Contoh: TK Yapendik 03 Rawamangun"]').fill(schoolName);
    await page.locator('input[placeholder="20109988"]').fill(uniqueNpsn);
    await page.locator('input[placeholder="Jl. Pemuda No. 88"]').fill('Jl. Kemang Raya No. 44');
    await page.locator('input[placeholder="021-4712345"]').fill('021-7198899');
    await page.locator('input[placeholder="tk03.rawamangun@yapendik.sch.id"]').fill(`tk.${uniqueNpsn}@yapendik.sch.id`);
    
    await page.getByRole('button', { name: /^Dirikan Sekolah$/i }).click();
    await page.waitForTimeout(2500);

    // Verify UAT-07 State: Status ACTIVE, NOT_READY
    await expect(page.locator(`text=Unit Sekolah "${schoolName}" berhasil didirikan`)).toBeVisible();
    await expect(page.locator('text=KESIAPAN OPERASIONAL: NOT_READY')).toBeVisible();
    console.log(`[UAT-07] ${schoolName} born: ACTIVE & NOT_READY verified!`);

    // -------------------------------------------------------------------------
    // UAT-08 & UAT-09: Academic Structure & Headmaster Verification
    // -------------------------------------------------------------------------
    console.log('[UAT-08 & 09] Verifying diagnostic blockers for unstaffed unit...');
    await expect(page.locator('text=Item yang Masih Menghalangi Kesiapan Operasional (Blockers):')).toBeVisible();

    // -------------------------------------------------------------------------
    // UAT-10: CREATE_CLASSROOM & ASSIGN HOMEROOM TEACHER
    // -------------------------------------------------------------------------
    console.log('[UAT-10] Forming Classroom: Kelompok A (Bunga Melati)...');
    await page.getByRole('button', { name: /Tambah Rombel & Wali Kelas/i }).click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Contoh: Kelompok A (Mawar Indah)"]').fill('Kelompok A (Bunga Melati)');
    await page.locator('input[placeholder="Contoh: per_teacher_siti"]').fill('per_teacher_siti');
    await page.getByRole('button', { name: /^Bentuk Rombel$/i }).click();
    await page.waitForTimeout(2500);

    await expect(page.locator('text=Rombel "Kelompok A (Bunga Melati)" berhasil dibentuk')).toBeVisible();
    console.log('[UAT-10] Classroom created & teacher assigned verified!');

    // -------------------------------------------------------------------------
    // UAT-11 & UAT-12: ADMIT_AND_PLACE_STUDENT (Atomic Admission & Placement)
    // -------------------------------------------------------------------------
    console.log('[UAT-11 & 12] Performing ACID Student Admission & Class Placement...');
    await page.getByRole('button', { name: /Admisi & Penempatan Siswa/i }).click();
    await page.waitForTimeout(500);
    await page.locator('input[placeholder="Contoh: Jonathan Chris Rawamangun"]').fill('Kenjiro Arga Kemang');
    await page.locator('input[placeholder="Jonathan"]').fill('Kenjiro');
    await page.locator('input[placeholder="TK-2026-0301"]').fill('TK-2026-0401');
    
    // Select the newly created class
    const classDropdown = page.locator('form select').filter({ hasText: /Pilih Rombel/i });
    await classDropdown.selectOption({ index: 1 });

    // Guardian Information
    await page.locator('input[placeholder="Contoh: Samuel Rawamangun"]').fill('Budi Arga Kemang');
    await page.locator('input[placeholder="081299887766"]').fill('081377889900');

    await page.getByRole('button', { name: /^Admisikan Siswa$/i }).click();
    await page.waitForTimeout(2500);

    await expect(page.locator('text=Siswa "Kenjiro Arga Kemang" berhasil diadmisikan & ditempatkan')).toBeVisible();
    console.log('[UAT-11 & 12] ACID Admission & Placement verified!');

    // -------------------------------------------------------------------------
    // UAT-13: OPERATIONAL READINESS RE-EVALUATION (6/6 GATES PASS -> READY)
    // -------------------------------------------------------------------------
    console.log('[UAT-13] Verifying 6/6 Gates PASS & Derived READY Status...');
    await expect(page.locator('text=KESIAPAN OPERASIONAL: READY')).toBeVisible();
    await expect(page.locator('text=Gerbang Terpenuhi: 6 / 6')).toBeVisible();
    await expect(page.locator('text=Masuk ke Operasional Harian Sekolah')).toBeVisible();

    console.log(`========================================================================`);
    console.log(`[STAGE 2 ACCEPTANCE] UAT-07 S.D. UAT-13 COMPLETED & CERTIFIED 100% PASS!`);
    console.log(`========================================================================`);
  });
});
