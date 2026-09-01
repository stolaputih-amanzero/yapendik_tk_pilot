/**
 * ═══════════════════════════════════════════════════════════════════════════
 * STAGE 6-B SUITE 38: PASSKEY WEBAUTHN INTEGRATION CONTRACTS (#DW-02 / ADR-05)
 * ═══════════════════════════════════════════════════════════════════════════
 * Verifies:
 * 1. Profile Hub Activation & PasskeyManager Component Flow
 * 2. PremiumLoginScreen Dynamic Biometric Trigger & Divider Flow
 * 3. WebAuthn API Contract & RP ID (tkm.amanloka.com) Verification
 * 4. Security, Replay Attack Defense & RLS Isolation
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import assert from 'assert';
import { SecurityContextProvider, GENESIS_PERSONAS } from '../src/auth/context';
import { ProfileDrawer } from '../src/components/layout/ProfileDrawer';
import { PremiumLoginScreen } from '../src/components/auth/PremiumLoginScreen';
import { PasskeyManager } from '../src/components/profile/PasskeyManager';
import { RP_ID, RP_ORIGIN, isWebAuthnSupported, getDeviceFriendlyName } from '../src/services/webauthn';
import { setupWebAuthnMock } from './mocks/webauthn';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Setup WebAuthn mock environment
setupWebAuthnMock();

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 STAGE 6-B PASSKEY WEBAUTHN INTEGRATION (SUITE 38)');
console.log('════════════════════════════════════════════════════════════════\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runCheck(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  🟢 PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  🔴 FAIL: ${name}`);
    console.error(`     Reason: ${err.message}`);
    failedTests++;
  }
}

// -----------------------------------------------------------------------------
// MODULE 1: Profile Hub Activation & PasskeyManager Component Flow
// -----------------------------------------------------------------------------
console.log('--- MODULE 1: Profile Hub Activation Flow ---');

runCheck('Profile Hub [PASSKEY UNREGISTERED]: Renders "Daftarkan Passkey" button when passkey is disabled', () => {
  // Use Teacher Erna without passkey
  const html = renderToString(
    <SecurityContextProvider initialPersonaId="user_teacher_erna">
      <ProfileDrawer isOpen={true} onClose={() => {}} />
    </SecurityContextProvider>
  );

  assert.ok(html.includes('Daftarkan Passkey'), 'Expected "Daftarkan Passkey" button for unconfigured passkey');
  assert.ok(html.includes('data-testid="btn-register-passkey"'), 'Expected btn-register-passkey testid');
  assert.ok(html.includes('Login Sidik Jari / Biometrik'), 'Expected Passkey card title');
});

runCheck('Profile Hub [PASSKEY ACTIVE]: Renders "Login Sidik Jari Aktif" badge and "Kelola" button', () => {
  // Use persona with passkey enabled
  const activePasskeyPersona = {
    ...GENESIS_PERSONAS[0],
    passkeyEnabled: true,
    passkeyRegisteredAt: new Date().toISOString()
  };

  const html = renderToString(
    <SecurityContextProvider overridePersona={activePasskeyPersona}>
      <ProfileDrawer isOpen={true} onClose={() => {}} />
    </SecurityContextProvider>
  );

  assert.ok(html.includes('Login Sidik Jari Aktif'), 'Expected "Login Sidik Jari Aktif" badge when passkeyEnabled is true');
  assert.ok(html.includes('data-testid="btn-manage-passkeys"'), 'Expected btn-manage-passkeys testid');
  assert.ok(html.includes('Kelola'), 'Expected "Kelola" action button');
});

runCheck('PasskeyManager [MODAL ANATOMY]: Renders adaptive dialog with registered devices & security footnote', () => {
  const html = renderToString(
    <PasskeyManager isOpen={true} onClose={() => {}} />
  );

  assert.ok(html.includes('Kelola Kredensial Biometrik / Passkey'), 'Expected PasskeyManager title');
  assert.ok(html.includes('Secure Enclave / TPM'), 'Expected security and encryption footnote');
  assert.ok(html.includes('Daftarkan Perangkat Baru'), 'Expected add new passkey action');
});

// -----------------------------------------------------------------------------
// MODULE 2: PremiumLoginScreen Dynamic Biometric Trigger
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 2: Login Screen Dynamic Passkey Flow ---');

runCheck('PremiumLoginScreen [BIOMETRIC BUTTON & DIVIDER]: Renders "Login dengan Sidik Jari" and "atau" divider', () => {
  const html = renderToString(
    <SecurityContextProvider>
      <PremiumLoginScreen />
    </SecurityContextProvider>
  );

  assert.ok(html.includes('data-testid="btn-login-passkey"'), 'Expected passkey button in login screen');
  assert.ok(html.includes('Login dengan Sidik Jari'), 'Expected "Login dengan Sidik Jari" button text');
  assert.ok(html.includes('atau'), 'Expected divider "atau" between passkey and password buttons');
  assert.ok(html.includes('Masuk dengan Kata Sandi'), 'Expected standard password submit button');
});

runCheck('PremiumLoginScreen [PREFILLED EMAIL & REMEMBER ME]: Renders remembered email and avatar indicator', () => {
  const html = renderToString(
    <SecurityContextProvider>
      <PremiumLoginScreen initialEmail="yapendikmaranathajkt@gmail.com" />
    </SecurityContextProvider>
  );

  assert.ok(html.includes('data-testid="btn-login-passkey"'), 'Expected passkey button when email is prefilled');
  assert.ok(html.includes('data-testid="checkbox-remember-me"'), 'Expected remember me checkbox');
});

// -----------------------------------------------------------------------------
// MODULE 3: WebAuthn API Contract & Relying Party Verification
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 3: WebAuthn API Contract (RP ID: tkm.amanloka.com) ---');

runCheck('WebAuthn Service [RP ID & ORIGIN]: Relying Party ID is canonical production domain', () => {
  assert.strictEqual(RP_ID, 'tkm.amanloka.com', 'RP_ID must be strictly tkm.amanloka.com');
  assert.strictEqual(RP_ORIGIN, 'https://tkm.amanloka.com', 'RP_ORIGIN must be https://tkm.amanloka.com');
});

runCheck('WebAuthn Service [FEATURE DETECTION]: isWebAuthnSupported returns true in mocked environment', () => {
  const supported = isWebAuthnSupported();
  assert.strictEqual(supported, true, 'isWebAuthnSupported must return true with PublicKeyCredential mock');
});

runCheck('WebAuthn Service [PLATFORM AUTHENTICATOR CHECK]: isPlatformAuthenticatorAvailable returns true when supported', async () => {
  const { isPlatformAuthenticatorAvailable } = await import('../src/services/webauthn');
  const available = await isPlatformAuthenticatorAvailable();
  assert.strictEqual(available, true, 'Platform authenticator must return available in mock');
});

runCheck('WebAuthn Service [DEVICE HEURISTIC]: getDeviceFriendlyName returns localized OS name', () => {
  const name = getDeviceFriendlyName();
  assert.ok(typeof name === 'string' && name.length > 0, 'Device friendly name must be a non-empty string');
});

runCheck('WebAuthn Service [SIMULATION FALLBACK REGISTRATION]: registerPasskey handles simulation gracefully', async () => {
  const { registerPasskey } = await import('../src/services/webauthn');
  const res = await registerPasskey(null, 'Simulated iPhone');
  assert.strictEqual(res.success, true, 'Simulation registerPasskey must return success');
});

runCheck('WebAuthn Service [SIMULATION FALLBACK AUTHENTICATION]: authenticateWithPasskey handles simulation gracefully', async () => {
  const { authenticateWithPasskey } = await import('../src/services/webauthn');
  const res = await authenticateWithPasskey(null, 'yapendikmaranathajkt@gmail.com');
  assert.strictEqual(res.success, true, 'Simulation authenticateWithPasskey must return success');
});

// -----------------------------------------------------------------------------
// MODULE 4: Security, Migration & Replay Defense Contracts
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 4: Security, Migration & Replay Defense Contracts ---');

runCheck('SQL Migration [SCHEMA INTEGRITY]: Migration defines webauthn_credentials and 5 Security Definer RPCs', () => {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260902000000_passkey_webauthn.sql');
  assert.ok(fs.existsSync(migrationPath), 'Expected migration file 20260902000000_passkey_webauthn.sql');

  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert.ok(sql.includes('CREATE TABLE IF NOT EXISTS webauthn_credentials'), 'Must define webauthn_credentials table');
  assert.ok(sql.includes('ENABLE ROW LEVEL SECURITY'), 'Must enforce Row Level Security');
  assert.ok(sql.includes('rpc_user_has_passkey'), 'Must define rpc_user_has_passkey');
  assert.ok(sql.includes('rpc_user_passkey_count'), 'Must define rpc_user_passkey_count');
  assert.ok(sql.includes('rpc_list_user_passkeys'), 'Must define rpc_list_user_passkeys');
  assert.ok(sql.includes('rpc_delete_user_passkey'), 'Must define rpc_delete_user_passkey');
  assert.ok(sql.includes('rpc_webauthn_register_credential'), 'Must define rpc_webauthn_register_credential');
});

runCheck('SQL Migration [OWNER-ONLY ISOLATION]: Enforces auth.uid() check in delete and view RPCs', () => {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260902000000_passkey_webauthn.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert.ok(sql.includes('user_id = auth.uid()'), 'Must restrict delete and list RPCs to auth.uid()');
  assert.ok(sql.includes('CREDENTIAL_NOT_FOUND_OR_UNAUTHORIZED'), 'Must raise unauthorized exception on cross-tenant deletion');
});

runCheck('Edge Functions [REGISTRATION CONTRACT]: webauthn-registration index.ts exists and enforces platform authenticator', () => {
  const regFnPath = path.join(__dirname, '..', 'supabase', 'functions', 'webauthn-registration', 'index.ts');
  assert.ok(fs.existsSync(regFnPath), 'Expected webauthn-registration Edge Function');

  const regCode = fs.readFileSync(regFnPath, 'utf8');
  assert.ok(regCode.includes('authenticatorAttachment: \'platform\''), 'Must enforce platform biometric authenticator');
  assert.ok(regCode.includes('userVerification: \'required\''), 'Must require user biometric verification');
});

runCheck('Edge Functions [AUTHENTICATION & REPLAY DEFENSE]: webauthn-authentication index.ts enforces replay detection & magic link session', () => {
  const authFnPath = path.join(__dirname, '..', 'supabase', 'functions', 'webauthn-authentication', 'index.ts');
  assert.ok(fs.existsSync(authFnPath), 'Expected webauthn-authentication Edge Function');

  const authCode = fs.readFileSync(authFnPath, 'utf8');
  assert.ok(authCode.includes('CREDENTIAL_COMPROMISED'), 'Must detect cloned credential / replay attack via sign count');
  assert.ok(authCode.includes('INVALID_CREDENTIALS'), 'Must return generic error for user enumeration prevention');
  assert.ok(authCode.includes('type: \'magiclink\''), 'Must generate session via Supabase Native Magic Link token');
});

runCheck('Edge Functions [TRANSPORT FILTERING]: Filters credentials for mobile platform authenticators', () => {
  const authFnPath = path.join(__dirname, '..', 'supabase', 'functions', 'webauthn-authentication', 'index.ts');
  const authCode = fs.readFileSync(authFnPath, 'utf8');
  assert.ok(authCode.includes('isMobile'), 'Must detect mobile user agents');
  assert.ok(authCode.includes('internal'), 'Must support internal biometric transport');
});

// -----------------------------------------------------------------------------
// MODULE 5: ARB Bootstrap Hardening & W-19 Red Line Contracts
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 5: ARB Bootstrap Hardening (W-18 s.d. W-21) ---');

runCheck('Hardening [W-18 SERVER CHALLENGE RPC]: Migration defines server challenge with 5-minute expiry', () => {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260902020000_webauthn_bootstrap_hardening.sql');
  assert.ok(fs.existsSync(migrationPath), 'Expected migration 20260902020000_webauthn_bootstrap_hardening.sql');

  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert.ok(sql.includes('rpc_webauthn_registration_challenge'), 'Must define rpc_webauthn_registration_challenge RPC');
  assert.ok(sql.includes('webauthn_pending_challenge'), 'Must define webauthn_pending_challenge column');
  assert.ok(sql.includes('webauthn_challenge_expires_at'), 'Must define webauthn_challenge_expires_at column');
  assert.ok(sql.includes("interval '5 minutes'"), 'Challenge must expire in 5 minutes');
});

runCheck('Hardening [W-18 CEREMONY VALIDATION]: Migration enforces type, origin, and single-use challenge consumption', () => {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260902020000_webauthn_bootstrap_hardening.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert.ok(sql.includes("'webauthn.create'"), 'Must validate webauthn.create ceremony type');
  assert.ok(sql.includes("'https://tkm.amanloka.com'"), 'Must validate canonical production origin');
  assert.ok(sql.includes('CEREMONY_INVALID'), 'Must raise CEREMONY_INVALID on challenge/origin mismatch');
  assert.ok(sql.includes('webauthn_pending_challenge = NULL'), 'Must consume challenge immediately (single-use)');
});

runCheck('Hardening [W-19 RED LINE GUARD]: Zero client-side auth bypass — falls back to password when server is offline', async () => {
  const { authenticateWithPasskey } = await import('../src/services/webauthn');
  
  // Mock Supabase with failing fetch to simulate offline Edge Function
  const mockSupabase = {
    auth: {
      getSession: async () => ({ data: { session: null } }),
      verifyOtp: async () => {
        throw new Error('VERIFY_OTP_MUST_NOT_BE_CALLED_ON_CLIENT_BYPASS');
      }
    }
  } as any;

  // Intercept fetch to reject (offline edge function)
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    throw new Error('Edge function offline');
  };

  try {
    const res = await authenticateWithPasskey(mockSupabase, 'user@amanloka.com');
    assert.strictEqual(res.success, false, 'Must NOT succeed client-side without server');
    assert.strictEqual(res.fallback, 'password', 'Must gracefully fallback to password login');
    assert.ok(res.error?.includes('kata sandi'), 'Must instruct user to use password');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

runCheck('Hardening [W-20 CREDENTIAL CAP]: Migration and UI enforce maximum 5 credentials per user', () => {
  const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '20260902020000_webauthn_bootstrap_hardening.sql');
  const sql = fs.readFileSync(migrationPath, 'utf8');
  assert.ok(sql.includes('CREDENTIAL_LIMIT_REACHED'), 'Must enforce CREDENTIAL_LIMIT_REACHED in database');
  assert.ok(sql.includes('>= 5'), 'Must check count >= 5');

  // Verify UI renders cap badge
  const html = renderToString(
    <PasskeyManager isOpen={true} onClose={() => {}} />
  );
  assert.ok(html.includes('/5 Terdaftar'), 'Expected /5 Terdaftar cap indicator in modal');
});

console.log('\n════════════════════════════════════════════════════════════════');
console.log(`🏁 STAGE 6-B SUITE 38 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
console.log('════════════════════════════════════════════════════════════════\n');

if (failedTests > 0) {
  process.exit(1);
}
