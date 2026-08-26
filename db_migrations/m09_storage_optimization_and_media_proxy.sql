-- ==============================================================================
-- YAPENDIK SCHOOL OS TK PILOT - MIGRATION M09
-- STAGE 5 / ADR-03: STORAGE OPTIMIZATION, MEDIA PROXY & STORAGE RLS POLICIES
-- ==============================================================================
-- 1. Create Private Storage Bucket (yapendik_observation_media)
-- 2. Define Helper Functions for Path-Based Storage Authorization
-- 3. Fail-Closed Storage RLS Policies (Deterministic Edge Caching Compatible)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. PRIVATE STORAGE BUCKET CONFIGURATION
-- ==============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'yapendik_observation_media',
  'yapendik_observation_media',
  false, -- STRICT PRIVACY: Bucket is private, access governed via Storage RLS & Proxy
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/heic'];

-- ==============================================================================
-- 2. STORAGE AUTHORIZATION HELPER FUNCTION
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.auth_can_access_observation_media(p_storage_path TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  v_caller_person_id TEXT;
  v_school_id TEXT;
  v_student_id TEXT;
BEGIN
  v_caller_person_id := public.get_auth_person_id();
  IF v_caller_person_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. Governance & Foundation Superadmin has supervisory read access
  IF public.auth_is_governance() THEN
    RETURN TRUE;
  END IF;

  -- Parse storage path convention: {school_id}/{student_id}/{filename}
  v_school_id := split_part(p_storage_path, '/', 1);
  v_student_id := split_part(p_storage_path, '/', 2);

  IF v_school_id IS NULL OR trim(v_school_id) = '' THEN
    RETURN FALSE;
  END IF;

  -- 2. Headmaster of the target school
  IF public.auth_is_headmaster_of(v_school_id) THEN
    RETURN TRUE;
  END IF;

  -- 3. Active Teacher at the target school
  IF EXISTS (
    SELECT 1 FROM public.teacher_profiles
    WHERE person_id = v_caller_person_id 
      AND school_id = v_school_id 
      AND is_active = TRUE
  ) THEN
    RETURN TRUE;
  END IF;

  -- 4. Legal Guardian of the child
  IF v_student_id IS NOT NULL AND trim(v_student_id) <> '' THEN
    IF public.auth_is_guardian_of(v_student_id) THEN
      RETURN TRUE;
    END IF;
  END IF;

  RETURN FALSE;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.auth_can_access_observation_media(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.auth_can_access_observation_media(TEXT) TO authenticated;

-- ==============================================================================
-- 3. STORAGE RLS POLICIES (STORAGE.OBJECTS)
-- ==============================================================================

-- 3.1 SELECT (Read) Policy
DROP POLICY IF EXISTS "Authorized actors can view observation media" ON storage.objects;
CREATE POLICY "Authorized actors can view observation media"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'yapendik_observation_media' 
    AND public.auth_can_access_observation_media(name)
  );

-- 3.2 INSERT (Upload) Policy: Strictly Teachers and Headmasters in their school
DROP POLICY IF EXISTS "School educators can upload observation media" ON storage.objects;
CREATE POLICY "School educators can upload observation media"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'yapendik_observation_media' AND (
      public.auth_is_headmaster_of(split_part(name, '/', 1))
      OR EXISTS (
        SELECT 1 FROM public.teacher_profiles
        WHERE person_id = public.get_auth_person_id()
          AND school_id = split_part(name, '/', 1)
          AND is_active = TRUE
      )
      OR public.auth_is_governance()
    )
  );

-- 3.3 DELETE Policy: Restricted to Headmaster & Governance
DROP POLICY IF EXISTS "Headmaster and Governance can delete observation media" ON storage.objects;
CREATE POLICY "Headmaster and Governance can delete observation media"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'yapendik_observation_media' AND (
      public.auth_is_headmaster_of(split_part(name, '/', 1))
      OR public.auth_is_governance()
    )
  );

COMMIT;
