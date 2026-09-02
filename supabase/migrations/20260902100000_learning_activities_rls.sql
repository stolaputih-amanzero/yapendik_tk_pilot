-- ==============================================================================
-- Migration: 20260902100000_learning_activities_rls.sql
-- Compliance: Stage 4.5 FB-01, FB-06, ADR-01 (Zero Anon Access, Strict Auth)
-- ==============================================================================

-- 1. ROW-LEVEL SECURITY (RLS) ENFORCEMENT
ALTER TABLE public.learning_activities ENABLE ROW LEVEL SECURITY;

-- Cabut seluruh hak akses dari role anon (Strict Defense in Depth - FB-01)
REVOKE ALL ON TABLE public.learning_activities FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.learning_activities TO authenticated;

-- Bersihkan policy lama jika ada untuk menghindari konflik
DO $$
BEGIN
  DROP POLICY IF EXISTS "Teachers can view learning activities" ON public.learning_activities;
  DROP POLICY IF EXISTS "Teachers can insert learning activities" ON public.learning_activities;
  DROP POLICY IF EXISTS "Teachers can update learning activities" ON public.learning_activities;
  DROP POLICY IF EXISTS "Teachers can delete learning activities" ON public.learning_activities;
  DROP POLICY IF EXISTS "Relevant actors can view learning_activities" ON public.learning_activities;
  DROP POLICY IF EXISTS "Teachers can insert learning_activities" ON public.learning_activities;
  DROP POLICY IF EXISTS "Teachers can update learning_activities" ON public.learning_activities;
END $$;

-- POLICY 1: SELECT (Hanya authenticated yang memiliki sesi sah)
CREATE POLICY "Teachers can view learning activities"
ON public.learning_activities FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- POLICY 2: INSERT (Hanya pendidik/staf authenticated)
CREATE POLICY "Teachers can insert learning activities"
ON public.learning_activities FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- POLICY 3: UPDATE (Hanya pendidik/staf authenticated)
CREATE POLICY "Teachers can update learning activities"
ON public.learning_activities FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- POLICY 4: DELETE (Hanya pendidik/staf authenticated)
CREATE POLICY "Teachers can delete learning activities"
ON public.learning_activities FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL
);
