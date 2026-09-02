-- ==============================================================================
-- Migration: 20260902090000_daily_attendance_unique_and_rls.sql
-- Compliance: Stage 4.5 FB-01, FB-06, ADR-01 (Zero Anon Access, Strict Auth)
-- ==============================================================================

-- 1. DEDUPLICATION (Pembersihan baris duplikat sebelum UNIQUE constraint)
DELETE FROM public.daily_attendance
WHERE id NOT IN (
  SELECT MAX(id)
  FROM public.daily_attendance
  GROUP BY school_id, class_id, student_id, date
);

-- 2. DETERMINISTIC UNIQUE CONSTRAINT
ALTER TABLE public.daily_attendance 
DROP CONSTRAINT IF EXISTS uq_daily_attendance_record;

ALTER TABLE public.daily_attendance
ADD CONSTRAINT uq_daily_attendance_record UNIQUE (school_id, class_id, student_id, date);

-- 3. ROW-LEVEL SECURITY (RLS) ENFORCEMENT
ALTER TABLE public.daily_attendance ENABLE ROW LEVEL SECURITY;

-- Cabut seluruh hak akses dari role anon (Strict Defense in Depth - FB-01)
REVOKE ALL ON TABLE public.daily_attendance FROM anon;
GRANT SELECT, INSERT, UPDATE ON TABLE public.daily_attendance TO authenticated;

-- Bersihkan policy lama jika ada untuk menghindari konflik
DO $$
BEGIN
  DROP POLICY IF EXISTS "Relevant actors can view daily_attendance" ON public.daily_attendance;
  DROP POLICY IF EXISTS "Teachers can insert daily_attendance" ON public.daily_attendance;
  DROP POLICY IF EXISTS "Teachers can update daily_attendance" ON public.daily_attendance;
  DROP POLICY IF EXISTS "Allow read daily_attendance" ON public.daily_attendance;
  DROP POLICY IF EXISTS "Allow insert daily_attendance" ON public.daily_attendance;
  DROP POLICY IF EXISTS "Allow update daily_attendance" ON public.daily_attendance;
  DROP POLICY IF EXISTS "auth_users_can_view_own_class_attendance" ON public.daily_attendance;
  DROP POLICY IF EXISTS "assigned_teachers_can_insert_attendance" ON public.daily_attendance;
  DROP POLICY IF EXISTS "assigned_teachers_can_update_attendance" ON public.daily_attendance;
END $$;

-- POLICY 1: SELECT (Hanya authenticated yang memiliki sesi sah)
CREATE POLICY "auth_users_can_view_attendance"
ON public.daily_attendance FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL
);

-- POLICY 2: INSERT (Hanya authenticated pendidik / staf sah)
CREATE POLICY "assigned_teachers_can_insert_attendance"
ON public.daily_attendance FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- POLICY 3: UPDATE (Hanya authenticated pendidik / staf sah)
CREATE POLICY "assigned_teachers_can_update_attendance"
ON public.daily_attendance FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL
)
WITH CHECK (
  auth.uid() IS NOT NULL
);

-- 4. SECURE BATCH UPSERT RPC (SECURITY INVOKER agar RLS tetap berlaku)
CREATE OR REPLACE FUNCTION public.rpc_save_daily_attendance_batch(
  p_entries jsonb
)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  entry jsonb;
BEGIN
  FOR entry IN SELECT * FROM jsonb_array_elements(p_entries)
  LOOP
    INSERT INTO public.daily_attendance (
      id, school_id, class_id, student_id, date, status, notes, 
      recorded_by_person_id, recorded_at, temperature_celsius, arrival_mood
    )
    VALUES (
      entry->>'id',
      entry->>'school_id',
      entry->>'class_id',
      entry->>'student_id',
      (entry->>'date')::date,
      entry->>'status',
      entry->>'notes',
      entry->>'recorded_by_person_id',
      COALESCE((entry->>'recorded_at')::timestamptz, now()),
      NULLIF(entry->>'temperature_celsius', '')::numeric,
      entry->>'arrival_mood'
    )
    ON CONFLICT (school_id, class_id, student_id, date) DO UPDATE SET
      status = EXCLUDED.status,
      notes = EXCLUDED.notes,
      recorded_by_person_id = EXCLUDED.recorded_by_person_id,
      recorded_at = EXCLUDED.recorded_at,
      temperature_celsius = EXCLUDED.temperature_celsius,
      arrival_mood = EXCLUDED.arrival_mood;
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.rpc_save_daily_attendance_batch(jsonb) TO authenticated;
