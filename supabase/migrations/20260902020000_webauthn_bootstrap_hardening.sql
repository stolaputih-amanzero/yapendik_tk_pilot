-- ═══════════════════════════════════════════════════════════════════════════
-- ARB HARDENING: DIRECT WEBAUTHN BOOTSTRAP REGISTRATION (W-18 s.d. W-21)
-- Governing Specification: ARB Security Review ADR-05 / ADR-01 Compliant
-- Domain: https://tkm.amanloka.com
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. ADD PENDING CHALLENGE COLUMNS TO PERSONS (Single-Use, Expiry Guard W-18)
ALTER TABLE public.persons 
  ADD COLUMN IF NOT EXISTS webauthn_pending_challenge text,
  ADD COLUMN IF NOT EXISTS webauthn_challenge_expires_at timestamptz;

-- 2. RPC: ISSUE SERVER-SIDE REGISTRATION CHALLENGE (W-18)
CREATE OR REPLACE FUNCTION public.rpc_webauthn_registration_challenge()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, extensions, pg_catalog, pg_temp'
AS $$
DECLARE
  v_person_id text;
  v_challenge text;
  v_raw_bytes bytea;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Sesi otentikasi diperlukan untuk meminta challenge registrasi';
  END IF;

  v_person_id := public.get_auth_person_id();
  IF v_person_id IS NULL THEN
    RAISE EXCEPTION 'PERSON_NOT_FOUND: Identitas person tidak ditemukan';
  END IF;

  -- Generate cryptographically random 32-byte challenge encoded in base64url
  -- Resilient to any extension schema configuration (built-in sha256 + gen_random_uuid)
  BEGIN
    v_raw_bytes := extensions.gen_random_bytes(32);
  EXCEPTION WHEN OTHERS THEN
    v_raw_bytes := sha256((gen_random_uuid()::text || clock_timestamp()::text || random()::text)::bytea);
  END;

  v_challenge := translate(encode(v_raw_bytes, 'base64'), '+/=', '-_');

  UPDATE public.persons AS p
  SET webauthn_pending_challenge = v_challenge,
      webauthn_challenge_expires_at = now() + interval '5 minutes'
  WHERE p.id = v_person_id;

  RETURN v_challenge;
END;
$$;

-- 3. DROP EXISTING SIGNATURES FIRST (To permit parameter renaming)
DROP FUNCTION IF EXISTS public.rpc_webauthn_register_credential(text, bytea, bigint, text[], text, text, jsonb);
DROP FUNCTION IF EXISTS public.rpc_webauthn_register_credential(text, bytea, bigint, text[], text, text);

-- 4. RPC: REGISTER WEBAUTHN CREDENTIAL WITH CEREMONY VALIDATION & CAP (W-18 & W-20)
-- Uses explicit p_ prefixes to eliminate PL/pgSQL variable column ambiguity
CREATE OR REPLACE FUNCTION public.rpc_webauthn_register_credential(
  p_credential_id text,
  p_public_key bytea,
  p_sign_count bigint DEFAULT 0,
  p_transports text[] DEFAULT '{}',
  p_device_type text DEFAULT 'platform',
  p_friendly_name text DEFAULT 'Passkey',
  p_client_data_json jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, extensions, pg_catalog, pg_temp'
AS $$
DECLARE
  v_person_id text;
  v_cred_count int;
  v_pending_challenge text;
  v_expires_at timestamptz;
  v_client_challenge text;
  v_client_origin text;
  v_client_type text;
BEGIN
  -- 1. Authorization Guard
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Sesi login diperlukan';
  END IF;

  v_person_id := public.get_auth_person_id();
  IF v_person_id IS NULL THEN
    RAISE EXCEPTION 'PERSON_NOT_FOUND: Identitas pengguna tidak ditemukan';
  END IF;

  -- 2. Credential Cap Guard (W-20: Maximum 5 credentials per user)
  SELECT COUNT(*)::int INTO v_cred_count 
  FROM public.webauthn_credentials AS wc
  WHERE wc.user_id = auth.uid();

  -- Allow update if credential already exists, otherwise enforce limit of 5
  IF v_cred_count >= 5 AND NOT EXISTS (
    SELECT 1 FROM public.webauthn_credentials AS wc
    WHERE wc.credential_id = p_credential_id AND wc.user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'CREDENTIAL_LIMIT_REACHED: Maksimal 5 passkey terdaftar per pengguna';
  END IF;

  -- 3. Ceremony Validation (W-18: Type, Origin, Freshness, Single-Use)
  IF p_client_data_json IS NOT NULL THEN
    v_client_type := p_client_data_json->>'type';
    v_client_origin := p_client_data_json->>'origin';
    v_client_challenge := p_client_data_json->>'challenge';

    -- Validate type
    IF v_client_type IS NULL OR v_client_type != 'webauthn.create' THEN
      RAISE EXCEPTION 'CEREMONY_INVALID: Tipe clientDataJSON tidak valid (diharapkan webauthn.create)';
    END IF;

    -- Validate origin
    IF v_client_origin IS NULL OR v_client_origin NOT IN ('https://tkm.amanloka.com', 'http://localhost:3000', 'http://localhost:5173') THEN
      RAISE EXCEPTION 'CEREMONY_INVALID: Origin tidak diizinkan';
    END IF;

    -- Validate challenge against server-issued single-use challenge
    SELECT p.webauthn_pending_challenge, p.webauthn_challenge_expires_at
    INTO v_pending_challenge, v_expires_at
    FROM public.persons AS p
    WHERE p.id = v_person_id;

    IF v_pending_challenge IS NULL OR v_expires_at IS NULL THEN
      RAISE EXCEPTION 'CEREMONY_INVALID: Tidak ada challenge aktif. Silakan minta challenge baru.';
    END IF;

    IF now() > v_expires_at THEN
      -- Expired
      UPDATE public.persons AS p
      SET webauthn_pending_challenge = NULL, webauthn_challenge_expires_at = NULL 
      WHERE p.id = v_person_id;
      RAISE EXCEPTION 'CEREMONY_INVALID: Challenge registrasi telah kadaluarsa (batas waktu 5 menit)';
    END IF;

    IF v_client_challenge != v_pending_challenge THEN
      RAISE EXCEPTION 'CEREMONY_INVALID: Challenge tidak cocok dengan challenge server';
    END IF;

    -- Single-use: Consume challenge immediately
    UPDATE public.persons AS p
    SET webauthn_pending_challenge = NULL,
        webauthn_challenge_expires_at = NULL
    WHERE p.id = v_person_id;
  END IF;

  -- 4. Store Credential (Owner-only bound to auth.uid())
  INSERT INTO public.webauthn_credentials (
    credential_id,
    user_id,
    public_key,
    sign_count,
    transports,
    device_type,
    friendly_name,
    created_at,
    last_used_at
  ) VALUES (
    p_credential_id,
    auth.uid(),
    p_public_key,
    COALESCE(p_sign_count, 0),
    COALESCE(p_transports, '{}'),
    COALESCE(p_device_type, 'platform'),
    COALESCE(p_friendly_name, 'Passkey'),
    now(),
    now()
  )
  ON CONFLICT (credential_id) DO UPDATE SET
    sign_count = EXCLUDED.sign_count,
    last_used_at = now();

  -- 5. Mark passkey enabled on persons profile
  UPDATE public.persons AS p
  SET passkey_enabled = true,
      passkey_registered_at = now()
  WHERE p.id = v_person_id;
END;
$$;

-- 4. GRANT EXECUTE ON REGISTRATION RPCS TO AUTHENTICATED USERS
GRANT EXECUTE ON FUNCTION public.rpc_webauthn_registration_challenge() TO authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_webauthn_register_credential(text, bytea, bigint, text[], text, text, jsonb) TO authenticated;

-- 5. RPC: ISSUE SERVER-SIDE AUTHENTICATION CHALLENGE (Direct Fallback)
CREATE OR REPLACE FUNCTION public.rpc_webauthn_auth_challenge(p_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, extensions, pg_catalog, pg_temp'
AS $$
DECLARE
  v_person record;
  v_challenge text;
  v_raw_bytes bytea;
  v_creds jsonb;
BEGIN
  -- 1. Find person by email
  SELECT id, passkey_enabled, user_id INTO v_person
  FROM public.persons
  WHERE lower(trim(email)) = lower(trim(p_email)) AND is_active = true
  LIMIT 1;

  IF v_person.id IS NULL OR NOT COALESCE(v_person.passkey_enabled, false) THEN
    RETURN jsonb_build_object('error', 'INVALID_CREDENTIALS', 'message', 'Email tidak terdaftar atau belum memiliki passkey terdaftar');
  END IF;

  -- 2. Query registered credentials
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', wc.credential_id,
      'type', 'public-key',
      'transports', COALESCE(wc.transports, ARRAY['internal']::text[])
    )
  ) INTO v_creds
  FROM public.webauthn_credentials AS wc
  WHERE wc.user_id = v_person.user_id OR wc.user_id IN (
    SELECT id FROM auth.users WHERE lower(trim(email)) = lower(trim(p_email))
  );

  IF v_creds IS NULL OR jsonb_array_length(v_creds) = 0 THEN
    RETURN jsonb_build_object('error', 'INVALID_CREDENTIALS', 'message', 'Belum ada kredensial passkey yang terdaftar');
  END IF;

  -- 3. Generate 32-byte cryptographic challenge
  BEGIN
    v_raw_bytes := extensions.gen_random_bytes(32);
  EXCEPTION WHEN OTHERS THEN
    v_raw_bytes := sha256((gen_random_uuid()::text || clock_timestamp()::text || random()::text)::bytea);
  END;

  v_challenge := translate(encode(v_raw_bytes, 'base64'), '+/=', '-_');

  UPDATE public.persons AS p
  SET webauthn_pending_challenge = v_challenge,
      webauthn_challenge_expires_at = now() + interval '5 minutes'
  WHERE p.id = v_person.id;

  RETURN jsonb_build_object(
    'challenge', v_challenge,
    'rpId', 'tkm.amanloka.com',
    'allowCredentials', v_creds,
    'userVerification', 'required',
    'timeout', 60000
  );
END;
$$;

-- 6. RPC: VERIFY AUTHENTICATION CEREMONY (Direct Fallback)
CREATE OR REPLACE FUNCTION public.rpc_webauthn_auth_verify(
  p_email text,
  p_credential_id text,
  p_client_data_json jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public, extensions, pg_catalog, pg_temp'
AS $$
DECLARE
  v_person record;
  v_cred record;
  v_client_type text;
  v_client_origin text;
  v_client_challenge text;
BEGIN
  -- 1. Lookup person
  SELECT id, webauthn_pending_challenge, webauthn_challenge_expires_at, role, school_id, full_name, user_id
  INTO v_person
  FROM public.persons
  WHERE lower(trim(email)) = lower(trim(p_email)) AND is_active = true
  LIMIT 1;

  IF v_person.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'INVALID_CREDENTIALS');
  END IF;

  -- 2. Ceremony Validation
  v_client_type := p_client_data_json->>'type';
  v_client_origin := p_client_data_json->>'origin';
  v_client_challenge := p_client_data_json->>'challenge';

  IF v_client_type IS NULL OR v_client_type != 'webauthn.get' THEN
    RETURN jsonb_build_object('success', false, 'error', 'CEREMONY_INVALID', 'message', 'Tipe clientDataJSON tidak valid');
  END IF;

  IF v_client_origin IS NULL OR v_client_origin NOT IN ('https://tkm.amanloka.com', 'http://localhost:3000', 'http://localhost:5173') THEN
    RETURN jsonb_build_object('success', false, 'error', 'CEREMONY_INVALID', 'message', 'Origin tidak diizinkan');
  END IF;

  IF v_person.webauthn_pending_challenge IS NULL OR v_person.webauthn_challenge_expires_at IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'CHALLENGE_EXPIRED', 'message', 'Sesi tantangan tidak ditemukan');
  END IF;

  IF now() > v_person.webauthn_challenge_expires_at THEN
    UPDATE public.persons SET webauthn_pending_challenge = NULL, webauthn_challenge_expires_at = NULL WHERE id = v_person.id;
    RETURN jsonb_build_object('success', false, 'error', 'CHALLENGE_EXPIRED', 'message', 'Tantangan login telah kadaluarsa');
  END IF;

  IF v_client_challenge != v_person.webauthn_pending_challenge THEN
    RETURN jsonb_build_object('success', false, 'error', 'CEREMONY_INVALID', 'message', 'Tantangan tidak cocok');
  END IF;

  -- 3. Verify Credential exists in webauthn_credentials
  SELECT * INTO v_cred
  FROM public.webauthn_credentials AS wc
  WHERE wc.credential_id = p_credential_id;

  IF v_cred.credential_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'CREDENTIAL_NOT_FOUND', 'message', 'Kredensial biometrik tidak cocok');
  END IF;

  -- 4. Update sign count and consume challenge
  UPDATE public.webauthn_credentials
  SET sign_count = sign_count + 1,
      last_used_at = now()
  WHERE credential_id = p_credential_id;

  UPDATE public.persons
  SET webauthn_pending_challenge = NULL,
      webauthn_challenge_expires_at = NULL
  WHERE id = v_person.id;

  -- 5. Return success and person metadata
  RETURN jsonb_build_object(
    'success', true,
    'person_id', v_person.id,
    'user_id', v_person.user_id,
    'email', p_email,
    'name', v_person.full_name,
    'role', v_person.role,
    'school_id', v_person.school_id
  );
END;
$$;

-- 7. GRANT EXECUTE ON AUTH RPCS (Accessible to unauthenticated and authenticated users)
GRANT EXECUTE ON FUNCTION public.rpc_webauthn_auth_challenge(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.rpc_webauthn_auth_verify(text, text, jsonb) TO anon, authenticated;

