-- ═══════════════════════════════════════════════════════════════════════════
-- SECURE DATABASE RPC: rpc_update_user_password
-- Enables password updates for users authenticated via Password, Passkey, or RPC
-- ═══════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.rpc_update_user_password(
  p_email TEXT,
  p_new_password TEXT,
  p_person_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions, auth, pg_temp
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  IF p_new_password IS NULL OR length(trim(p_new_password)) < 8 THEN
    RETURN jsonb_build_object('success', false, 'message', 'Kata sandi minimal 8 karakter');
  END IF;

  -- 1. Find user by email in auth.users
  IF p_email IS NOT NULL AND trim(p_email) <> '' THEN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE lower(trim(email)) = lower(trim(p_email))
    LIMIT 1;
  END IF;

  -- 2. Fallback: Find user by person_id mapping in user_person_identities
  IF v_user_id IS NULL AND p_person_id IS NOT NULL AND trim(p_person_id) <> '' THEN
    SELECT auth_user_id INTO v_user_id
    FROM public.user_person_identities
    WHERE person_id = trim(p_person_id)
    LIMIT 1;
  END IF;

  -- 3. Fallback: Find user by get_auth_person_id()
  IF v_user_id IS NULL THEN
    v_user_id := auth.uid();
  END IF;

  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'message', 'Akun pengguna tidak ditemukan di database');
  END IF;

  -- Update encrypted password in auth.users
  UPDATE auth.users
  SET encrypted_password = crypt(p_new_password, gen_salt('bf')),
      updated_at = now()
  WHERE id = v_user_id;

  RETURN jsonb_build_object('success', true, 'message', 'Kata sandi berhasil diperbarui');
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_update_user_password(TEXT, TEXT, TEXT) TO anon, authenticated;
