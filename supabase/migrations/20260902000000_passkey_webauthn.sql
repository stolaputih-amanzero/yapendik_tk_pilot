-- ═══════════════════════════════════════════════════════════════════════════
-- YAPENDIK SCHOOL OS — PASSKEY WEBAUTHN MIGRATION (ADR-01 & ADR-05)
-- Domain: https://tkm.amanloka.com (RP ID: tkm.amanloka.com)
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. TABEL KREDENSIAL WEBAUTHN
CREATE TABLE IF NOT EXISTS webauthn_credentials (
  credential_id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  public_key bytea NOT NULL,
  sign_count bigint NOT NULL DEFAULT 0,
  transports text[] DEFAULT '{}',
  device_type text CHECK (device_type IN ('platform', 'cross-platform')),
  friendly_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  last_used_at timestamptz
);

-- 2. INDEX UNTUK LOOKUP CEPAT
CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_user_id 
  ON webauthn_credentials(user_id);

CREATE INDEX IF NOT EXISTS idx_webauthn_credentials_credential_id
  ON webauthn_credentials(credential_id);

-- 3. RLS POLICIES (Defense-in-Depth)
ALTER TABLE webauthn_credentials ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Users can view own credentials" ON webauthn_credentials;
  DROP POLICY IF EXISTS "System can manage credentials" ON webauthn_credentials;
END $$;

-- Users can view their own credentials
CREATE POLICY "Users can view own credentials"
  ON webauthn_credentials FOR SELECT
  USING (auth.uid() = user_id);

-- System / RPC can manage credentials
CREATE POLICY "System can manage credentials"
  ON webauthn_credentials FOR ALL
  USING (true)
  WITH CHECK (true);

-- 4. HELPER FUNCTION: Check if user has passkey
CREATE OR REPLACE FUNCTION rpc_user_has_passkey()
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM webauthn_credentials 
    WHERE user_id = auth.uid()
  );
$$;

-- 5. HELPER FUNCTION: Get user's passkey count
CREATE OR REPLACE FUNCTION rpc_user_passkey_count()
RETURNS integer LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::integer FROM webauthn_credentials 
  WHERE user_id = auth.uid();
$$;

-- 6. HELPER FUNCTION: List user's passkeys (for management UI)
CREATE OR REPLACE FUNCTION rpc_list_user_passkeys()
RETURNS TABLE (
  credential_id text,
  device_type text,
  friendly_name text,
  created_at timestamptz,
  last_used_at timestamptz
) LANGUAGE sql SECURITY DEFINER AS $$
  SELECT credential_id, device_type, friendly_name, created_at, last_used_at
  FROM webauthn_credentials
  WHERE user_id = auth.uid()
  ORDER BY created_at DESC;
$$;

-- 7. HELPER FUNCTION: Register / Store WebAuthn Credential
CREATE OR REPLACE FUNCTION rpc_webauthn_register_credential(
  credential_id text,
  public_key bytea,
  sign_count bigint,
  transports text[] DEFAULT '{}',
  device_type text DEFAULT 'platform',
  friendly_name text DEFAULT 'Passkey'
)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  INSERT INTO webauthn_credentials (
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
    credential_id,
    auth.uid(),
    public_key,
    COALESCE(sign_count, 0),
    COALESCE(transports, '{}'),
    COALESCE(device_type, 'platform'),
    COALESCE(friendly_name, 'Passkey'),
    now(),
    now()
  )
  ON CONFLICT (credential_id) DO UPDATE SET
    sign_count = EXCLUDED.sign_count,
    last_used_at = now();

  -- Update persons table flag
  UPDATE persons
  SET passkey_enabled = true,
      passkey_registered_at = now()
  WHERE user_id = auth.uid();
END; $$;

-- 8. HELPER FUNCTION: Delete user's passkey (device management)
CREATE OR REPLACE FUNCTION rpc_delete_user_passkey(target_credential_id text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_deleted integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  DELETE FROM webauthn_credentials
  WHERE credential_id = target_credential_id
    AND user_id = auth.uid();
  
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  IF v_deleted = 0 THEN
    RAISE EXCEPTION 'CREDENTIAL_NOT_FOUND_OR_UNAUTHORIZED';
  END IF;
  
  -- Update passkey_enabled flag if no credentials remain
  UPDATE persons
  SET passkey_enabled = false,
      passkey_registered_at = NULL
  WHERE user_id = auth.uid()
    AND NOT EXISTS (
      SELECT 1 FROM webauthn_credentials WHERE user_id = auth.uid()
    );
END; $$;
