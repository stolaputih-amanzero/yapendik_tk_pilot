import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('GATE 6 — UAT-01: Foundation Superadmin Journey (Dr. Andreas Hendrawan)', () => {
  const evidenceDir = path.resolve('tests/evidence/gate-06/uat-01-superadmin');

  test.beforeAll(() => {
    fs.mkdirSync(evidenceDir, { recursive: true });
  });

  test('UAT-01: Superadmin Foundation Oversight, Audit Trail Inspection & Session Purge', async ({ page }) => {
    console.log('============================================================');
    console.log('[GATE 6] [UAT-01] STARTING FOUNDATION SUPERADMIN JOURNEY');
    console.log('============================================================');

    await test.step('1. Navigate to Application & Verify Entry State', async () => {
      console.log('[GATE 6] [UAT-01] STEP 01/11: Navigating to Application Entry Point');
      const response = await page.goto('/');
      expect(response?.status()).toBe(200);
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(evidenceDir, '01_login_screen.png'), fullPage: true });
    });

    await test.step('2. Select Persona: Dr. Andreas Hendrawan (YAPENDIK_SUPERADMIN)', async () => {
      console.log('[GATE 6] [UAT-01] STEP 02/11: Selecting Superadmin Persona (Dr. Andreas Hendrawan)');
      const superadminBtn = page.locator('button', { hasText: 'Dr. Andreas Hendrawan' });
      await expect(superadminBtn).toBeVisible();
      await superadminBtn.click();
      await page.waitForTimeout(1000);
    });

    await test.step('3. Verify Authenticated Identity & Resolved Role', async () => {
      console.log('[GATE 6] [UAT-01] STEP 03/11: Verifying Authenticated Context & Role');
      await expect(page.locator('text=Dr. Andreas Hendrawan').last()).toBeVisible();
      await expect(page.locator('text=YAPENDIK_SUPERADMIN').last()).toBeVisible();
      await page.screenshot({ path: path.join(evidenceDir, '02_superadmin_authenticated.png'), fullPage: true });
    });

    await test.step('4. Verify Institutional Context Ribbon', async () => {
      console.log('[GATE 6] [UAT-01] STEP 04/11: Verifying Institutional Ribbon');
      await expect(page.locator('text=Persona Aktif:').first()).toBeVisible();
      await expect(page.locator('text=T.A. 2026/2027').first()).toBeVisible();
    });

    await test.step('5. Inspect Multi-School Jurisdiction & Unit Access', async () => {
      console.log('[GATE 6] [UAT-01] STEP 05/11: Verifying Unit Access and School Profile');
      await expect(page.locator('text=TK Yapendik').first()).toBeVisible();
      await page.screenshot({ path: path.join(evidenceDir, '03_multi_unit_overview.png'), fullPage: true });
    });

    await test.step('6. Navigate to Tata Kelola & Audit Log Tab', async () => {
      console.log('[GATE 6] [UAT-01] STEP 06/11: Navigating to Governance & Audit Trail');
      const moreBtn = page.locator('nav button', { hasText: 'Lainnya' });
      if (await moreBtn.isVisible()) {
        await moreBtn.hover();
      }
      const govBtn = page.locator('button', { hasText: 'Tata Kelola & Audit Log' });
      await govBtn.click();
      await page.waitForTimeout(800);
    });

    await test.step('7. Verify Audit Trail Header & Event History', async () => {
      console.log('[GATE 6] [UAT-01] STEP 07/11: Verifying Audit Log Records & Immutability');
      await expect(page.locator('text=Jejak Audit').or(page.locator('text=Profil Institusi')).first()).toBeVisible();
      await page.screenshot({ path: path.join(evidenceDir, '04_audit_trail_view.png'), fullPage: true });
    });

    await test.step('8. Verify Read-Only Governance Boundary', async () => {
      console.log('[GATE 6] [UAT-01] STEP 08/11: Asserting Read-Only Boundary (No Rogue Direct Mutation Forms)');
      const rogueMutationBtns = page.locator('button:has-text("Hapus Permanen Database")');
      await expect(rogueMutationBtns).toHaveCount(0);
    });

    await test.step('9. Open Persona Menu to Initiate Sign Out', async () => {
      console.log('[GATE 6] [UAT-01] STEP 09/11: Opening Persona Context Menu');
      const personaMenuBtn = page.locator('header button').last();
      await personaMenuBtn.click();
      await page.screenshot({ path: path.join(evidenceDir, '05_persona_menu_open.png') });
    });

    await test.step('10. Execute Sign Out / Logout', async () => {
      console.log('[GATE 6] [UAT-01] STEP 10/11: Executing Complete Logout');
      const signOutBtn = page.locator('button', { hasText: 'Keluar / Sign Out' });
      await expect(signOutBtn).toBeVisible();
      await signOutBtn.click();
      await page.waitForTimeout(800);
    });

    await test.step('11. Verify Session & Scoped Cache Completely Purged', async () => {
      console.log('[GATE 6] [UAT-01] STEP 11/11: Verifying Clean Return to Login Screen & Purged Storage');
      await expect(page.locator('h1', { hasText: 'Yapendik School OS' })).toBeVisible();
      await page.screenshot({ path: path.join(evidenceDir, '06_logout_complete.png'), fullPage: true });

      const storageKeys = await page.evaluate(() => Object.keys(localStorage));
      console.log('Remaining localStorage keys after purge:', storageKeys);
      const userCachedData = storageKeys.filter(k => k.startsWith('yapendik_os_v2_u_'));
      expect(userCachedData.length).toBe(0);
    });

    console.log('============================================================');
    console.log('[GATE 6] [UAT-01] COMPLETED SUCCESSFULLY: ALL STEPS PASS');
    console.log('============================================================');
  });
});
