-- ==============================================================================
-- Migration: RPC for Student Photo Update & Roster RLS Access
-- Version: 20260902080000
-- ==============================================================================

-- 1. Create RPC to update student photo in both students & persons tables
CREATE OR REPLACE FUNCTION public.rpc_update_student_photo(
  p_student_id text,
  p_photo_url text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Update photo_url in students table
  UPDATE public.students
  SET photo_url = p_photo_url
  WHERE id = p_student_id;

  -- 2. Sync avatar_url in persons table
  UPDATE public.persons p
  SET avatar_url = p_photo_url,
      updated_at = now()
  FROM public.students s
  WHERE s.id = p_student_id AND s.person_id = p.id;
END;
$$;

-- Grant execute permissions to authenticated and anon users
GRANT EXECUTE ON FUNCTION public.rpc_update_student_photo(text, text) TO authenticated, anon;

-- 2. Ensure guardian_relationships is readable for class roster
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow read guardian_relationships for roster" ON public.guardian_relationships;
END $$;

CREATE POLICY "Allow read guardian_relationships for roster"
ON public.guardian_relationships
FOR SELECT
TO authenticated, anon
USING (true);

-- 3. Ensure persons table is readable for student guardians and teachers
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow read persons for roster" ON public.persons;
END $$;

CREATE POLICY "Allow read persons for roster"
ON public.persons
FOR SELECT
TO authenticated, anon
USING (true);

-- 4. Ensure students table is readable for roster
DO $$
BEGIN
  DROP POLICY IF EXISTS "Allow read students for roster" ON public.students;
END $$;

CREATE POLICY "Allow read students for roster"
ON public.students
FOR SELECT
TO authenticated, anon
USING (true);
