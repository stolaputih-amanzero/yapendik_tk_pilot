/**
 * Supabase Edge Function: WebAuthn Registration
 * Handles registration challenge generation and verification ceremony (FIDO2/WebAuthn)
 * Domain: https://tkm.amanloka.com
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type GenerateRegistrationOptionsOpts,
  type VerifiedRegistrationResponse,
} from 'npm:@simplewebauthn/server@13.3.3';

export const RP_ID = Deno.env.get('RP_ID') || 'tkm.amanloka.com';
export const RP_NAME = 'Yapendik School OS';
export const EXPECTED_ORIGIN = Deno.env.get('RP_ORIGIN') || 'https://tkm.amanloka.com';

// In-memory challenge store for registration ceremony
export const registrationChallenges = new Map<string, string>();

Deno.serve(async (req) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Missing Authorization header' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const token = authHeader.replace('Bearer ', '');
  const { data: { user }, error: userError } = await supabase.auth.getUser(token);
  if (userError || !user) {
    return new Response(JSON.stringify({ error: 'UNAUTHORIZED', message: 'Invalid or expired token' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  // ACTION 1: Generate Registration Challenge
  if (action === 'challenge') {
    const opts: GenerateRegistrationOptionsOpts = {
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: new TextEncoder().encode(user.id),
      userName: user.email ?? '',
      userDisplayName: user.user_metadata?.full_name ?? user.email ?? '',
      attestationType: 'none',
      authenticatorSelection: {
        authenticatorAttachment: 'platform', // Built-in biometric (Touch ID / Face ID / Windows Hello)
        userVerification: 'required',
        residentKey: 'preferred',
      },
    };

    const options = await generateRegistrationOptions(opts);
    // Store challenge in memory
    registrationChallenges.set(user.id, options.challenge);

    return new Response(JSON.stringify(options), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ACTION 2: Verify & Store Credential
  if (action === 'verify') {
    const { credential, deviceType, friendlyName } = await req.json();
    const expectedChallenge = registrationChallenges.get(user.id);

    if (!expectedChallenge) {
      return new Response(JSON.stringify({ error: 'CHALLENGE_EXPIRED', message: 'Registration challenge expired' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let verification: VerifiedRegistrationResponse;
    try {
      verification = await verifyRegistrationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin: EXPECTED_ORIGIN,
        expectedRPID: RP_ID,
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: 'VERIFICATION_FAILED', message: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!verification.verified || !verification.registrationInfo) {
      return new Response(JSON.stringify({ error: 'VERIFICATION_FAILED', message: 'Credential signature not verified' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { credential: regCredential, counter } = verification.registrationInfo;

    // Call Security Definer RPC to store credential in database
    const { error: rpcError } = await supabase.rpc('rpc_webauthn_register_credential', {
      credential_id: regCredential.id,
      public_key: Buffer.from(regCredential.publicKey),
      sign_count: counter,
      transports: credential.response.transports ?? ['internal'],
      device_type: deviceType ?? 'platform',
      friendly_name: friendlyName ?? 'Biometrik Perangkat',
    });

    if (rpcError) {
      return new Response(JSON.stringify({ error: 'STORAGE_FAILED', message: rpcError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clear challenge
    registrationChallenges.delete(user.id);

    return new Response(JSON.stringify({ success: true, message: 'Passkey berhasil didaftarkan' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'INVALID_ACTION', message: 'Unknown action specified' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
