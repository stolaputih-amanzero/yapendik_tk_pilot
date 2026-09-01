/**
 * WebAuthn FIDO2 Client Service (Amanaura OS — ADR-05)
 * Handles feature detection, device name parsing, and WebAuthn registration/authentication ceremonies
 * Domain: https://tkm.amanloka.com
 */

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const RP_ID = (import.meta as any).env?.VITE_WEBAUTHN_RP_ID || 'tkm.amanloka.com';
export const RP_ORIGIN = (import.meta as any).env?.VITE_WEBAUTHN_ORIGIN || 'https://tkm.amanloka.com';

/**
 * Checks if browser supports basic WebAuthn (PublicKeyCredential)
 */
export function isWebAuthnSupported(): boolean {
  const globalTarget = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? (globalThis as any) : null);
  if (!globalTarget) return false;
  return (
    globalTarget.PublicKeyCredential !== undefined &&
    typeof globalTarget.PublicKeyCredential === 'function'
  );
}

/**
 * Checks if platform authenticator (Touch ID, Face ID, Windows Hello, Android Biometric) is available
 */
export async function isPlatformAuthenticatorAvailable(): Promise<boolean> {
  if (!isWebAuthnSupported()) return false;

  const globalTarget = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? (globalThis as any) : null);
  try {
    if (typeof globalTarget?.PublicKeyCredential?.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
      return await globalTarget.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Parses user agent to detect a friendly device name (e.g. "iPhone 15", "Samsung Galaxy S24", "Mac", "Windows Hello")
 */
export function getDeviceFriendlyName(): string {
  if (typeof navigator === 'undefined') return 'Perangkat Terdaftar';

  const ua = navigator.userAgent;

  // iOS / iPadOS
  if (/iPhone/.test(ua)) {
    const match = ua.match(/iPhone\s*(\d+)?/);
    return match && match[1] ? `iPhone ${match[1]}` : 'Apple iPhone';
  }
  if (/iPad/.test(ua)) {
    return 'Apple iPad';
  }

  // Android
  if (/Android/.test(ua)) {
    const match = ua.match(/;\s*([^;)]+)\s+Build/);
    if (match && match[1]) {
      const model = match[1].trim();
      if (/SM-|GT-/.test(model)) {
        return `Samsung (${model})`;
      }
      return model;
    }
    return 'Perangkat Android';
  }

  // Desktop OS
  if (/Macintosh|Mac OS X/.test(ua)) return 'Mac (Touch ID / Passkey)';
  if (/Windows/.test(ua)) return 'Windows PC (Windows Hello)';
  if (/Linux/.test(ua)) return 'Linux PC (FIDO2 Key)';

  return 'Perangkat Biometrik';
}

export interface WebAuthnOperationResult {
  success: boolean;
  message?: string;
  error?: string;
  cancelled?: boolean;
}

/**
 * Executes Passkey registration ceremony
 */
export async function registerPasskey(
  supabase: SupabaseClient | null,
  customFriendlyName?: string
): Promise<WebAuthnOperationResult> {
  const friendlyName = customFriendlyName || getDeviceFriendlyName();

  // If running in simulation / offline mock mode without live Supabase
  if (!supabase) {
    if (typeof localStorage !== 'undefined') {
      const mockCredId = `cred_${Date.now()}`;
      const existing = JSON.parse(localStorage.getItem('yapendik_mock_passkeys') || '[]');
      existing.unshift({
        credential_id: mockCredId,
        device_type: 'platform',
        friendly_name: friendlyName,
        created_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      });
      localStorage.setItem('yapendik_mock_passkeys', JSON.stringify(existing));
    }
    return { success: true, message: 'Passkey biometrik berhasil didaftarkan (Mode Simulasi)' };
  }

  try {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData?.session?.access_token;

    if (!token) {
      return { success: false, error: 'Sesi login tidak aktif' };
    }

    // 1. Get Challenge from Edge Function
    const challengeRes = await fetch(
      `${supabaseUrl}/functions/v1/webauthn-registration?action=challenge`,
      {
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!challengeRes.ok) {
      const err = await challengeRes.json().catch(() => ({}));
      return { success: false, error: err.message || 'Gagal memulai registrasi passkey' };
    }

    const options = await challengeRes.json();

    // 2. Trigger Browser WebAuthn Ceremony (Touch ID / Face ID / Windows Hello)
    let credential: RegistrationResponseJSON;
    try {
      credential = await startRegistration(options);
    } catch (ceremonyError: any) {
      if (ceremonyError.name === 'NotAllowedError') {
        return { success: false, cancelled: true, error: 'Pendaftaran passkey dibatalkan oleh pengguna' };
      }
      return { success: false, error: ceremonyError.message || 'Gagal menyelesaikan otentikasi biometrik' };
    }

    // 3. Send verification to Edge Function
    const verifyRes = await fetch(
      `${supabaseUrl}/functions/v1/webauthn-registration?action=verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          credential,
          deviceType: 'platform',
          friendlyName,
        }),
      }
    );

    const verifyResult = await verifyRes.json().catch(() => ({}));
    if (!verifyRes.ok || !verifyResult.success) {
      return { success: false, error: verifyResult.message || 'Verifikasi tanda tangan passkey gagal' };
    }

    return { success: true, message: 'Passkey berhasil didaftarkan' };
  } catch (err: any) {
    console.error('Passkey registration error:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan sistem saat mendaftarkan passkey' };
  }
}

/**
 * Executes Passkey authentication ceremony
 */
export async function authenticateWithPasskey(
  supabase: SupabaseClient | null,
  email: string
): Promise<WebAuthnOperationResult> {
  const cleanEmail = email.trim().toLowerCase();

  // If simulation mode
  if (!supabase) {
    return { success: true, message: 'Autentikasi biometrik berhasil (Mode Simulasi)' };
  }

  try {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

    // 1. Get Authentication Challenge from Edge Function
    const challengeRes = await fetch(
      `${supabaseUrl}/functions/v1/webauthn-authentication?action=challenge`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
        },
        body: JSON.stringify({ email: cleanEmail }),
      }
    );

    if (!challengeRes.ok) {
      const err = await challengeRes.json().catch(() => ({}));
      return { success: false, error: err.message || 'Email tidak terdaftar atau passkey belum diaktifkan' };
    }

    const options = await challengeRes.json();

    // 2. Trigger Browser WebAuthn Ceremony (Assertion)
    let credential: AuthenticationResponseJSON;
    try {
      credential = await startAuthentication(options);
    } catch (ceremonyError: any) {
      if (ceremonyError.name === 'NotAllowedError') {
        return { success: false, cancelled: true, error: 'Login biometrik dibatalkan' };
      }
      return { success: false, error: ceremonyError.message || 'Gagal memverifikasi biometrik pada perangkat' };
    }

    // 3. Verify Assertion with Edge Function
    const verifyRes = await fetch(
      `${supabaseUrl}/functions/v1/webauthn-authentication?action=verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': anonKey,
        },
        body: JSON.stringify({ email: cleanEmail, credential }),
      }
    );

    const verifyResult = await verifyRes.json().catch(() => ({}));
    if (!verifyRes.ok || !verifyResult.success || !verifyResult.token) {
      return { success: false, error: verifyResult.message || 'Verifikasi passkey gagal' };
    }

    // 4. Complete Supabase Auth Session using Magic Link Token
    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: verifyResult.token,
      type: 'magiclink',
    });

    if (otpError) {
      return { success: false, error: otpError.message || 'Gagal mengaktifkan sesi login' };
    }

    return { success: true, message: 'Autentikasi biometrik berhasil' };
  } catch (err: any) {
    console.error('Passkey authentication error:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan saat login biometrik' };
  }
}
