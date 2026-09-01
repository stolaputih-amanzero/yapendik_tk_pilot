/**
 * Supabase Edge Function: WebAuthn Authentication
 * Handles authentication challenge generation, replay attack detection, and magic link session token generation
 * Domain: https://tkm.amanloka.com
 */

import { createClient } from 'jsr:@supabase/supabase-js@2';
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type GenerateAuthenticationOptionsOpts,
  type VerifiedAuthenticationResponse,
} from 'npm:@simplewebauthn/server@13.3.3';

export const RP_ID = Deno.env.get('RP_ID') || 'tkm.amanloka.com';
export const EXPECTED_ORIGIN = Deno.env.get('RP_ORIGIN') || 'https://tkm.amanloka.com';

// In-memory challenge store for authentication ceremony (keyed by email)
export const authChallenges = new Map<string, string>();

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

  const url = new URL(req.url);
  const action = url.searchParams.get('action');

  // Generic constant error message to prevent user enumeration
  const GENERIC_INVALID_CREDENTIALS_RESPONSE = () =>
    new Response(
      JSON.stringify({
        error: 'INVALID_CREDENTIALS',
        message: 'Email tidak terdaftar atau passkey belum diaktifkan',
      }),
      {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  // ACTION 1: Generate Authentication Challenge
  if (action === 'challenge') {
    const { email } = await req.json();
    if (!email || typeof email !== 'string') {
      return GENERIC_INVALID_CREDENTIALS_RESPONSE();
    }

    const cleanEmail = email.trim().toLowerCase();

    // 1. Lookup user in auth.users by email via Admin API
    const { data: usersData, error: userError } = await supabase.auth.admin.listUsers();
    const user = usersData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

    if (userError || !user) {
      return GENERIC_INVALID_CREDENTIALS_RESPONSE();
    }

    // 2. Fetch user's registered passkey credentials
    const { data: credentials, error: credError } = await supabase
      .from('webauthn_credentials')
      .select('credential_id, transports, device_type')
      .eq('user_id', user.id);

    if (credError || !credentials || credentials.length === 0) {
      return GENERIC_INVALID_CREDENTIALS_RESPONSE();
    }

    // 3. Transport filtering based on client user agent
    const userAgent = req.headers.get('user-agent') || '';
    const isMobile = /Mobile|Android|iPhone|iPad/i.test(userAgent);

    const filteredCredentials = credentials.filter(c => {
      if (isMobile) {
        return (c.transports && c.transports.includes('internal')) || c.device_type === 'platform';
      }
      return true;
    });

    const allowedCredentials = (filteredCredentials.length > 0 ? filteredCredentials : credentials).map(c => ({
      id: c.credential_id,
      type: 'public-key' as const,
      transports: (c.transports as any[]) || ['internal'],
    }));

    const opts: GenerateAuthenticationOptionsOpts = {
      rpID: RP_ID,
      allowCredentials: allowedCredentials,
      userVerification: 'required',
    };

    const options = await generateAuthenticationOptions(opts);
    // Store challenge keyed by email
    authChallenges.set(cleanEmail, options.challenge);

    return new Response(JSON.stringify(options), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  // ACTION 2: Verify Authentication Response
  if (action === 'verify') {
    const { email, credential } = await req.json();
    if (!email || !credential) {
      return GENERIC_INVALID_CREDENTIALS_RESPONSE();
    }

    const cleanEmail = email.trim().toLowerCase();
    const expectedChallenge = authChallenges.get(cleanEmail);

    if (!expectedChallenge) {
      return new Response(
        JSON.stringify({ error: 'CHALLENGE_EXPIRED', message: 'Sesi autentikasi telah kadaluarsa. Silakan coba lagi.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Find user
    const { data: usersData } = await supabase.auth.admin.listUsers();
    const user = usersData?.users?.find(u => u.email?.toLowerCase() === cleanEmail);

    if (!user) {
      return GENERIC_INVALID_CREDENTIALS_RESPONSE();
    }

    // 2. Retrieve credential from database
    const { data: storedCredential, error: credError } = await supabase
      .from('webauthn_credentials')
      .select('*')
      .eq('credential_id', credential.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (credError || !storedCredential) {
      return GENERIC_INVALID_CREDENTIALS_RESPONSE();
    }

    // 3. Verify assertion with @simplewebauthn/server
    let verification: VerifiedAuthenticationResponse;
    try {
      verification = await verifyAuthenticationResponse({
        response: credential,
        expectedChallenge,
        expectedOrigin: EXPECTED_ORIGIN,
        expectedRPID: RP_ID,
        credential: {
          id: storedCredential.credential_id,
          publicKey: new Uint8Array(storedCredential.public_key),
          counter: Number(storedCredential.sign_count),
          transports: storedCredential.transports,
        },
      });
    } catch (error: any) {
      return new Response(JSON.stringify({ error: 'VERIFICATION_FAILED', message: error.message }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!verification.verified) {
      return new Response(JSON.stringify({ error: 'VERIFICATION_FAILED', message: 'Signature verification failed' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const newCounter = verification.authenticationInfo.newCounter;

    // 4. SIGN COUNT REPLAY ATTACK DETECTION
    // If sign count did not increment and counter is non-zero, credential may be cloned
    if (newCounter <= Number(storedCredential.sign_count) && Number(storedCredential.sign_count) > 0) {
      // Invalidate compromised credential immediately
      await supabase
        .from('webauthn_credentials')
        .delete()
        .eq('credential_id', credential.id);

      return new Response(
        JSON.stringify({
          error: 'CREDENTIAL_COMPROMISED',
          message: 'Passkey terdeteksi digunakan pada perangkat lain secara mencurigakan. Demi keamanan, passkey telah dinonaktifkan.',
        }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Update sign count and last used timestamp
    await supabase
      .from('webauthn_credentials')
      .update({
        sign_count: newCounter,
        last_used_at: new Date().toISOString(),
      })
      .eq('credential_id', credential.id);

    // 6. Generate Supabase Native Magic Link Session Token
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: user.email!,
      options: {
        redirectTo: `${EXPECTED_ORIGIN}/#beranda-guru`,
      },
    });

    if (linkError || !linkData?.properties?.hashed_token) {
      return new Response(JSON.stringify({ error: 'SESSION_CREATION_FAILED', message: linkError?.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Clear challenge
    authChallenges.delete(cleanEmail);

    return new Response(
      JSON.stringify({
        success: true,
        token: linkData.properties.hashed_token,
        email: user.email,
        message: 'Autentikasi biometrik berhasil',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  return new Response(JSON.stringify({ error: 'INVALID_ACTION', message: 'Unknown action specified' }), {
    status: 400,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
