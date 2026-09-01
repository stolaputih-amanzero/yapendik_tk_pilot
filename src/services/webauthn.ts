/**
 * WebAuthn FIDO2 Client Service (Amanaura OS — ADR-05 Hardened / W-18 - W-21)
 * Handles feature detection, device name parsing, server-issued challenges, and WebAuthn registration/authentication ceremonies
 * Domain: https://tkm.amanloka.com
 */

import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from '@simplewebauthn/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export const RP_ID = (import.meta as any).env?.VITE_WEBAUTHN_RP_ID || 'tkm.amanloka.com';
export const RP_ORIGIN = (import.meta as any).env?.VITE_WEBAUTHN_ORIGIN || 'https://tkm.amanloka.com';

function toBase64URL(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function parseBase64URL(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  const padded = pad ? base64 + '='.repeat(4 - pad) : base64;
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

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
  fallback?: 'password';
}

/**
 * Executes Passkey registration ceremony (W-18 Server Challenge + W-20 Cap)
 */
export async function registerPasskey(
  supabase: SupabaseClient | null,
  customFriendlyName?: string
): Promise<WebAuthnOperationResult> {
  const friendlyName = customFriendlyName || getDeviceFriendlyName();

  // Simulation mode fallback
  if (!supabase) {
    if (typeof localStorage !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('yapendik_mock_passkeys') || '[]');
      if (existing.length >= 5) {
        return { success: false, error: 'Maksimal 5 passkey terdaftar per pengguna' };
      }
      const mockCredId = `cred_${Date.now()}`;
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
    const user = sessionData?.session?.user;

    if (!token || !user) {
      return { success: false, error: 'Sesi login tidak aktif' };
    }

    // 1. Get Challenge: Try Edge Function first, then server RPC (W-18)
    let options: any = null;
    let isServerRpcChallenge = false;

    try {
      const challengeRes = await fetch(
        `${supabaseUrl}/functions/v1/webauthn-registration?action=challenge`,
        {
          headers: {
            'apikey': anonKey,
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (challengeRes.ok) {
        options = await challengeRes.json();
      }
    } catch (e) {
      console.warn('Edge function unreachable, requesting server RPC challenge (W-18):', e);
    }

    // W-18: Fallback to Server-Issued Challenge RPC
    if (!options) {
      const { data: serverChallenge, error: challengeRpcErr } = await supabase.rpc('rpc_webauthn_registration_challenge');
      if (challengeRpcErr || !serverChallenge) {
        return { 
          success: false, 
          error: challengeRpcErr?.message || 'Gagal menerbitkan challenge registrasi server' 
        };
      }

      isServerRpcChallenge = true;
      const hostname = (typeof window !== 'undefined' && window.location.hostname) ? window.location.hostname : 'localhost';
      const effectiveRpId = (hostname !== 'localhost' && !hostname.includes('127.0.0.1'))
        ? hostname
        : (RP_ID || 'localhost');

      options = {
        challenge: serverChallenge,
        rp: {
          name: 'Amanaura OS',
          id: effectiveRpId,
        },
        user: {
          id: toBase64URL(new TextEncoder().encode(user.id)),
          name: user.email || 'user@amanloka.com',
          displayName: user.user_metadata?.full_name || user.email || 'Pengguna',
        },
        pubKeyCredParams: [
          { alg: -7, type: 'public-key' as const },
          { alg: -257, type: 'public-key' as const },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform' as const,
          userVerification: 'required' as const,
          residentKey: 'preferred' as const,
        },
        timeout: 60000,
        attestation: 'none' as const,
      };
    }

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

    // 3. Send verification: Edge Function or Server RPC with Ceremony Validation (W-18 & W-20)
    let verifiedViaEdge = false;
    if (!isServerRpcChallenge) {
      try {
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

        if (verifyRes.ok) {
          const verifyResult = await verifyRes.json().catch(() => ({}));
          if (verifyResult.success) {
            verifiedViaEdge = true;
          }
        }
      } catch (e) {
        console.warn('Edge function verify unreachable, falling back to direct RPC:', e);
      }
    }

    // Direct Database Registration with W-18 Ceremony Validation & W-20 Cap
    if (!verifiedViaEdge) {
      const pubKey = credential.response?.publicKey || toBase64URL(new Uint8Array([0]));

      // Decode clientDataJSON for server ceremony validation
      let clientDataJsonObj: any = null;
      try {
        if (credential.response?.clientDataJSON) {
          const decodedStr = new TextDecoder().decode(parseBase64URL(credential.response.clientDataJSON));
          clientDataJsonObj = JSON.parse(decodedStr);
        }
      } catch (decodeErr) {
        console.warn('Failed to parse clientDataJSON:', decodeErr);
      }

      const { error: rpcErr } = await supabase.rpc('rpc_webauthn_register_credential', {
        credential_id: credential.id,
        public_key: pubKey,
        sign_count: 0,
        transports: credential.response?.transports || ['internal'],
        device_type: 'platform',
        friendly_name: friendlyName,
        client_data_json: clientDataJsonObj,
      });

      if (rpcErr) {
        if (rpcErr.message.includes('CREDENTIAL_LIMIT_REACHED')) {
          return { success: false, error: 'Maksimal 5 passkey terdaftar. Hapus passkey lama terlebih dahulu.' };
        }
        if (rpcErr.message.includes('CEREMONY_INVALID')) {
          return { success: false, error: 'Validasi upacara biometrik gagal di server (CEREMONY_INVALID).' };
        }
        return { success: false, error: rpcErr.message || 'Gagal menyimpan kredensial passkey' };
      }
    }

    // Cache locally for instant UI responsiveness
    if (typeof localStorage !== 'undefined') {
      const existing = JSON.parse(localStorage.getItem('yapendik_mock_passkeys') || '[]');
      const filtered = existing.filter((p: any) => p.credential_id !== credential.id);
      filtered.unshift({
        credential_id: credential.id,
        device_type: 'platform',
        friendly_name: friendlyName,
        created_at: new Date().toISOString(),
        last_used_at: new Date().toISOString(),
      });
      localStorage.setItem('yapendik_mock_passkeys', JSON.stringify(filtered.slice(0, 5)));
    }

    return { success: true, message: 'Passkey berhasil didaftarkan pada perangkat ini' };
  } catch (err: any) {
    console.error('Passkey registration error:', err);
    return { success: false, error: err.message || 'Terjadi kesalahan sistem saat mendaftarkan passkey' };
  }
}

/**
 * Executes Passkey authentication ceremony (W-19 Garis Merah: Server-Verification Only)
 */
export async function authenticateWithPasskey(
  supabase: SupabaseClient | null,
  email: string
): Promise<WebAuthnOperationResult> {
  const cleanEmail = email.trim().toLowerCase();

  // If running in simulation mode
  if (!supabase) {
    return { success: true, message: 'Autentikasi biometrik berhasil (Mode Simulasi)' };
  }

  try {
    const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
    const anonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

    // 1. Get Authentication Challenge from Edge Function
    let options: any = null;
    try {
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

      if (challengeRes.ok) {
        options = await challengeRes.json();
      } else {
        const errJson = await challengeRes.json().catch(() => ({}));
        if (errJson.error === 'INVALID_CREDENTIALS') {
          return { 
            success: false, 
            fallback: 'password', 
            error: 'Email tidak terdaftar atau belum memiliki passkey terdaftar' 
          };
        }
      }
    } catch (e) {
      console.warn('Edge function auth challenge unreachable:', e);
    }

    // W-19 GARIS MERAH: No Client-Side Authentication Bypass
    // If Edge Function is offline or pending deployment, gracefully fall back to password login
    if (!options) {
      return {
        success: false,
        fallback: 'password',
        error: 'Layanan login biometrik belum tersedia — silakan masuk menggunakan kata sandi',
      };
    }

    // 2. Trigger Browser WebAuthn Ceremony (Assertion)
    let credential: AuthenticationResponseJSON;
    try {
      credential = await startAuthentication(options);
    } catch (ceremonyError: any) {
      if (ceremonyError.name === 'NotAllowedError') {
        return { success: false, cancelled: true, error: 'Login biometrik dibatalkan' };
      }
      return { 
        success: false, 
        fallback: 'password',
        error: ceremonyError.message || 'Gagal memverifikasi biometrik pada perangkat' 
      };
    }

    // 3. Server-side Verify Assertion with Edge Function
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

    // Replay attack / compromise detection (Refinement 2)
    if (verifyResult.error === 'CREDENTIAL_COMPROMISED') {
      return {
        success: false,
        fallback: 'password',
        error: verifyResult.message || 'Passkey dicabut karena terdeteksi digunakan mencurigakan.',
      };
    }

    if (!verifyRes.ok || !verifyResult.success || !verifyResult.token) {
      return {
        success: false,
        fallback: 'password',
        error: verifyResult.message || 'Verifikasi tanda tangan passkey gagal di server',
      };
    }

    // 4. Complete Supabase Auth Session using Magic Link Token
    const { error: otpError } = await supabase.auth.verifyOtp({
      token_hash: verifyResult.token,
      type: 'magiclink',
    });

    if (otpError) {
      return { 
        success: false, 
        fallback: 'password', 
        error: otpError.message || 'Gagal mengaktifkan sesi login' 
      };
    }

    return { success: true, message: 'Autentikasi biometrik berhasil' };
  } catch (err: any) {
    console.error('Passkey authentication error:', err);
    return { 
      success: false, 
      fallback: 'password', 
      error: err.message || 'Terjadi kesalahan saat login biometrik' 
    };
  }
}
