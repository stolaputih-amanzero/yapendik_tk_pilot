-- ==============================================================================
-- PROFILE HUB v2 + SUPABASE USER MANAGEMENT (ADR-UX-013)
-- Migration: 20260901185700_profile_hub_v2.sql
-- Invariant: Non-destructive, idempotent, reversible (ADR-01 Compliant)
-- ==============================================================================

-- 1. Schema Extensions for Persons
ALTER TABLE persons ADD COLUMN IF NOT EXISTS avatar_url text NULL;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS phone text NULL;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS passkey_enabled boolean NOT NULL DEFAULT false;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS passkey_registered_at timestamptz NULL;

-- 2. Storage Bucket for Staff Avatars (public read, owner write)
INSERT INTO storage.buckets (id, name, public)
VALUES ('staff-avatars', 'staff-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
DO $$
BEGIN
  -- Drop existing policies if any to ensure idempotency
  DROP POLICY IF EXISTS "Avatar owner read" ON storage.objects;
  DROP POLICY IF EXISTS "Avatar owner write" ON storage.objects;
  DROP POLICY IF EXISTS "Avatar owner update" ON storage.objects;
  DROP POLICY IF EXISTS "Avatar owner delete" ON storage.objects;
  DROP POLICY IF EXISTS "Avatar public read" ON storage.objects;
END $$;

CREATE POLICY "Avatar public read" ON storage.objects
  FOR SELECT USING (bucket_id = 'staff-avatars');

CREATE POLICY "Avatar owner write" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'staff-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar owner update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'staff-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatar owner delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'staff-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- 3. Owner-Only RPC Functions

-- RPC 1: Update own avatar URL
CREATE OR REPLACE FUNCTION rpc_update_own_avatar(new_url text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_person_id text;
BEGIN
  v_person_id := public.get_auth_person_id();
  IF v_person_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  UPDATE persons 
  SET avatar_url = new_url,
      updated_at = now()
  WHERE id = v_person_id;
  
  IF NOT FOUND THEN 
    RAISE EXCEPTION 'PERSON_NOT_FOUND'; 
  END IF;
END; $$;

-- RPC 2: Update own phone (validated regex +62 / international format)
CREATE OR REPLACE FUNCTION rpc_update_own_phone(new_phone text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_person_id text;
BEGIN
  IF new_phone IS NOT NULL AND new_phone !~ '^(\+62|0)[0-9\s\-]{8,15}$' THEN
    RAISE EXCEPTION 'INVALID_PHONE_FORMAT';
  END IF;
  
  v_person_id := public.get_auth_person_id();
  IF v_person_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  UPDATE persons 
  SET phone = new_phone,
      updated_at = now()
  WHERE id = v_person_id;

  IF NOT FOUND THEN 
    RAISE EXCEPTION 'PERSON_NOT_FOUND'; 
  END IF;
END; $$;

-- RPC 3: Update own display name (full_name)
CREATE OR REPLACE FUNCTION rpc_update_own_name(new_name text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_person_id text;
BEGIN
  IF length(trim(new_name)) < 2 OR length(new_name) > 100 THEN
    RAISE EXCEPTION 'INVALID_NAME_LENGTH';
  END IF;
  
  v_person_id := public.get_auth_person_id();
  IF v_person_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  UPDATE persons 
  SET full_name = trim(new_name),
      updated_at = now()
  WHERE id = v_person_id;

  IF NOT FOUND THEN 
    RAISE EXCEPTION 'PERSON_NOT_FOUND'; 
  END IF;
END; $$;

-- RPC 4: Toggle passkey enabled (soft flag only)
CREATE OR REPLACE FUNCTION rpc_toggle_passkey_enabled(enabled boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_person_id text;
BEGIN
  v_person_id := public.get_auth_person_id();
  IF v_person_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHORIZED';
  END IF;

  UPDATE persons 
  SET passkey_enabled = enabled,
      passkey_registered_at = CASE WHEN enabled THEN now() ELSE NULL END,
      updated_at = now()
  WHERE id = v_person_id;

  IF NOT FOUND THEN 
    RAISE EXCEPTION 'PERSON_NOT_FOUND'; 
  END IF;
END; $$;

-- RPC 5: Get own profile (read)
CREATE OR REPLACE FUNCTION rpc_get_own_profile()
RETURNS TABLE (
  full_name text, 
  email text, 
  phone text, 
  avatar_url text, 
  role text, 
  assigned_class text, 
  passkey_enabled boolean,
  passkey_registered_at timestamptz
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_person_id text;
BEGIN
  v_person_id := public.get_auth_person_id();
  RETURN QUERY
  SELECT 
    p.full_name, 
    u.email::text, 
    p.phone, 
    p.avatar_url, 
    p.role::text, 
    p.assigned_class::text, 
    p.passkey_enabled,
    p.passkey_registered_at
  FROM persons p 
  JOIN auth.users u ON u.id = auth.uid()
  WHERE p.id = v_person_id;
END; $$;

-- Email Immutability Note:
-- Email is immutable via client/owner RPCs.
-- Email updates are strictly restricted to SUPERADMIN via Supabase Admin API.
