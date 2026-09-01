import { chromium } from '@playwright/test';
import fs from 'fs';
import path from 'path';

async function captureAll() {
  const outputDir = path.resolve('doc/visual_captures');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
    deviceScaleFactor: 2
  });

  // ═══════════════════════════════════════════════════════════════════
  // 1. DELIVERABLE 4: Login Screen with Passkey Button & Divider
  // ═══════════════════════════════════════════════════════════════════
  const page1 = await context.newPage();
  await page1.goto('http://localhost:3000/#beranda-guru');
  await page1.evaluate(() => {
    localStorage.clear();
    localStorage.setItem('amanaura_remembered_email', 'yapendikmaranathajkt@gmail.com');
  });
  await page1.reload();
  await page1.waitForSelector('[data-testid="btn-login-passkey"]', { timeout: 5000 });
  await page1.waitForTimeout(500);

  await page1.screenshot({
    path: path.join(outputDir, 'deliverable_4_login_with_passkey.png'),
    fullPage: false
  });
  console.log('✅ 1/5 Captured deliverable_4_login_with_passkey.png');
  await page1.close();

  // ═══════════════════════════════════════════════════════════════════
  // 2. DELIVERABLE 1: Profile Hub with "Daftarkan Passkey" Button
  // ═══════════════════════════════════════════════════════════════════
  const page2 = await context.newPage();
  await page2.goto('http://localhost:3000/#beranda-guru');
  await page2.evaluate(() => {
    localStorage.setItem('yapendik_auth_persona', 'user_teacher_erna');
  });
  await page2.reload();
  await page2.waitForTimeout(1000);

  const profileBtn = page2.locator('button[data-testid="sidebar-profile-trigger"]');
  await profileBtn.click();
  await page2.waitForSelector('[data-testid="btn-register-passkey"]', { timeout: 5000 });
  await page2.waitForTimeout(500);

  await page2.screenshot({
    path: path.join(outputDir, 'deliverable_1_profile_hub_passkey_register.png'),
    fullPage: false
  });
  console.log('✅ 2/5 Captured deliverable_1_profile_hub_passkey_register.png');

  // ═══════════════════════════════════════════════════════════════════
  // 3. DELIVERABLE 2: Passkey ON Confirmation / Ceremony Dialog
  // ═══════════════════════════════════════════════════════════════════
  const toggleBtn = page2.locator('button[data-testid="toggle-passkey-switch"]');
  await toggleBtn.click();
  await page2.waitForSelector('[data-testid="btn-confirm-passkey-on"]', { timeout: 5000 });
  await page2.waitForTimeout(400);

  await page2.screenshot({
    path: path.join(outputDir, 'deliverable_2_passkey_confirmation_ceremony.png'),
    fullPage: false
  });
  console.log('✅ 3/5 Captured deliverable_2_passkey_confirmation_ceremony.png');

  // Confirm passkey toggle to active
  const confirmOnBtn = page2.locator('button[data-testid="btn-confirm-passkey-on"]');
  await confirmOnBtn.click();
  await page2.waitForTimeout(600);

  // ═══════════════════════════════════════════════════════════════════
  // 4. DELIVERABLE 3: Profile Hub with "Login Sidik Jari Aktif" & "Kelola"
  // ═══════════════════════════════════════════════════════════════════
  await page2.waitForSelector('[data-testid="btn-manage-passkeys"]', { timeout: 5000 });
  await page2.waitForTimeout(400);

  await page2.screenshot({
    path: path.join(outputDir, 'deliverable_3_profile_hub_passkey_active.png'),
    fullPage: false
  });
  console.log('✅ 4/5 Captured deliverable_3_profile_hub_passkey_active.png');

  // ═══════════════════════════════════════════════════════════════════
  // 5. DELIVERABLE 5: PasskeyManager Modal with Registered Credentials
  // ═══════════════════════════════════════════════════════════════════
  await page2.evaluate(() => {
    localStorage.setItem('yapendik_mock_passkeys', JSON.stringify([
      {
        credential_id: 'cred_iphone_15_pro',
        device_type: 'platform',
        friendly_name: 'Apple iPhone 15 Pro (Face ID)',
        created_at: new Date('2026-08-30').toISOString(),
        last_used_at: new Date().toISOString()
      },
      {
        credential_id: 'cred_windows_hello',
        device_type: 'platform',
        friendly_name: 'Windows PC (Windows Hello Fingerprint)',
        created_at: new Date('2026-09-01').toISOString(),
        last_used_at: new Date().toISOString()
      },
      {
        credential_id: 'cred_yubikey_5c',
        device_type: 'cross-platform',
        friendly_name: 'YubiKey 5C NFC (FIDO2 Hardware Key)',
        created_at: new Date('2026-09-02').toISOString(),
        last_used_at: null
      }
    ]));
  });

  const manageBtn = page2.locator('button[data-testid="btn-manage-passkeys"]');
  await manageBtn.click();
  await page2.waitForSelector('[data-testid="btn-close-passkey-manager"]', { timeout: 5000 });
  await page2.waitForTimeout(500);

  await page2.screenshot({
    path: path.join(outputDir, 'deliverable_5_passkey_manager_modal.png'),
    fullPage: false
  });
  console.log('✅ 5/5 Captured deliverable_5_passkey_manager_modal.png');

  await page2.close();
  await browser.close();

  console.log('\n🎉 ALL 5 PASSKEY VISUAL DELIVERABLES CAPTURED AND VERIFIED');
}

captureAll().catch(console.error);
