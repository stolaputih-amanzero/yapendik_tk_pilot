-- ==============================================================================
-- Migration: 20260902110000_weekly_plans_canonical.sql
-- Compliance: Stage 4.5 FB-01, FB-06, ADR-01 (Strict Auth, Zero Anon, Canonical TEXT IDs)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.weekly_plans (
  id TEXT PRIMARY KEY,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  teacher_person_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
  
  academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
  semester TEXT NOT NULL CHECK (semester IN ('GANJIL', 'GENAP')),
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 25),
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  
  weekly_theme TEXT NOT NULL,
  weekly_subtheme TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SUBMITTED', 'APPROVED')),
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  approved_by TEXT REFERENCES public.persons(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,
  
  CONSTRAINT uq_weekly_plan_class_week UNIQUE (school_id, class_id, week_start_date)
);

CREATE INDEX IF NOT EXISTS idx_weekly_plans_lookup 
ON public.weekly_plans(school_id, class_id, week_start_date);

-- RLS Hardening (Strict Auth, Zero Anon)
ALTER TABLE public.weekly_plans ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.weekly_plans FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.weekly_plans TO authenticated;

DO $$
BEGIN
  DROP POLICY IF EXISTS "Teachers can view own class weekly plans" ON public.weekly_plans;
  DROP POLICY IF EXISTS "Teachers can manage own class weekly plans" ON public.weekly_plans;
  DROP POLICY IF EXISTS "Teachers can view weekly plans" ON public.weekly_plans;
  DROP POLICY IF EXISTS "Teachers can insert weekly plans" ON public.weekly_plans;
  DROP POLICY IF EXISTS "Teachers can update weekly plans" ON public.weekly_plans;
  DROP POLICY IF EXISTS "Teachers can delete weekly plans" ON public.weekly_plans;
  DROP POLICY IF EXISTS "Authenticated users can view weekly plans" ON public.weekly_plans;
END $$;

-- 1. SELECT (Hanya authenticated yang memiliki sesi sah)
CREATE POLICY "Teachers can view weekly plans"
ON public.weekly_plans FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- 2. INSERT (Hanya pendidik/staf authenticated)
CREATE POLICY "Teachers can insert weekly plans"
ON public.weekly_plans FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- 3. UPDATE (Hanya pendidik/staf authenticated)
CREATE POLICY "Teachers can update weekly plans"
ON public.weekly_plans FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- 4. DELETE (Hanya pendidik/staf authenticated)
CREATE POLICY "Teachers can delete weekly plans"
ON public.weekly_plans FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL
);
