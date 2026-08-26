import { test, expect } from '@playwright/test';

test.describe('STAGE 2 — PROVISIONING & INSTITUTIONAL READINESS UI (LIVE SUPABASE)', () => {
  test('Superadmin & Headmaster Provisioning & Lifecycle Dashboard Journey', async ({ page }) => {
    test.setTimeout(90000);

    console.log(`========================================================================`);
    console.log(`[STAGE 2 UI] STARTING PROVISIONING WORKSPACE LIVE UI VERIFICATION`);
    console.log(`========================================================================`);

    page.on('console', msg => console.log('BROWSER_LOG:', msg.text()));
    page.on('pageerror', err => console.log('BROWSER_ERR:', err.message));

    // STEP 1: Login as Superadmin
    console.log('[STEP 1] Navigating to http://localhost:3000');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');

    console.log('[STEP 1] Logging in as Dr. Andreas Hendrawan (Superadmin)...');
    await page.getByRole('button', { name: /Masuk Akun Supabase/i }).click();
    await page.locator('input[type="email"]').fill('andreas@yapendik.sch.id');
    await page.locator('input[type="password"]').fill('YapendikPilot2026!');
    await page.locator('button[type="submit"]').click();

    await page.waitForSelector('text=Persona Aktif:', { timeout: 20000 });
    console.log('[STEP 1] Superadmin login verified!');

    // STEP 2: Navigate to Provisioning Workspace
    console.log('[STEP 2] Navigating to Kesiapan Sekolah (Stage 2 Workspace)...');
    const provBtn = page.getByRole('button', { name: /Kesiapan Sekolah/i });
    await provBtn.click();
    await page.waitForTimeout(600);

    // STEP 3: Verify Institutional Lifecycle Header & 6 Gates
    console.log('[STEP 3] Verifying Institutional Lifecycle Dashboard & 6 Gates...');
    await expect(page.locator('text=Manajemen Siklus Hidup & Kesiapan Institusi')).toBeVisible();
    await expect(page.locator('text=Diagnostik Kesiapan (6 Gates)')).toBeVisible();

    // Verify TK 01 Menteng is READY
    await expect(page.locator('text=KESIAPAN OPERASIONAL: READY')).toBeVisible();
    await expect(page.locator('text=Gerbang Terpenuhi: 6 / 6')).toBeVisible();
    console.log('[STEP 3] TK 01 Menteng 6/6 Gates READY verified!');

    // STEP 4: Switch Context to TK 02 Kebayoran in Provisioning UI
    console.log('[STEP 4] Switching context to TK 02 Kebayoran in Provisioning UI...');
    const unitSelect = page.locator('select').first();
    await unitSelect.selectOption('sch_tk_yapendik_02');
    await page.waitForTimeout(600);

    // Verify TK 02 Kebayoran is NOT_READY
    await expect(page.locator('text=KESIAPAN OPERASIONAL: NOT_READY')).toBeVisible();
    await expect(page.locator('text=Gerbang Terpenuhi: 5 / 6')).toBeVisible();
    await expect(page.locator('text=Item yang Masih Menghalangi Kesiapan Operasional (Blockers):')).toBeVisible();
    console.log('[STEP 4] TK 02 Kebayoran 5/6 Gates NOT_READY & Blocker projection verified!');

    // STEP 5: Switch Tab to School Registry (Multi-Unit Matrix)
    console.log('[STEP 5] Viewing Multi-Unit School Registry Matrix...');
    await page.getByRole('button', { name: /Matriks Seluruh Cabang/i }).click();
    await expect(page.locator('text=Matriks Cabang Institusi Yayasan GPIB')).toBeVisible();
    await expect(page.getByRole('cell', { name: 'TK Yapendik 01 Menteng' })).toBeVisible();
    await expect(page.getByRole('cell', { name: 'TK Yapendik 02 Kebayoran' })).toBeVisible();
    console.log('[STEP 5] Multi-unit registry matrix verified!');

    // STEP 6: Open "Dirikan Unit Sekolah Baru" Modal
    console.log('[STEP 6] Opening Superadmin School Establishment Modal...');
    await page.getByRole('button', { name: /Dirikan Unit Sekolah Baru/i }).click();
    await expect(page.locator('text=Dirikan Unit Sekolah Baru (Yayasan Superadmin)')).toBeVisible();
    await page.getByRole('button', { name: /Batal/i }).click();
    console.log('[STEP 6] Establishment modal opened and closed cleanly!');

    console.log(`========================================================================`);
    console.log(`[STAGE 2 UI] ALL PROVISIONING WORKSPACE CHECKS PASSED 100%!`);
    console.log(`========================================================================`);
  });
});
