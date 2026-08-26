-- ==============================================================================
-- YAPENDIK SCHOOL OS TK PILOT - MIGRATION M08
-- STAGE 5 / ADR-02: ZERO-DOWNTIME SHADOW PARTITIONING (DAILY ATTENDANCE)
-- ==============================================================================
-- 1. Step 1: Provision Shadow Partitioned Table (daily_attendance_partitioned)
-- 2. Step 2: Replicate Constraints, Indexes, RLS Policies & Triggers
-- 3. Step 3: Non-Blocking Chunked Backfill Engine (with advisory lock)
-- 4. Step 4 & 5: Guarded Manual Cutover Procedure (fn_execute_attendance_cutover)
-- ==============================================================================
-- SAFETY DIRECTIVE: DO NOT EXECUTE CUTOVER AUTOMATICALLY IN MIGRATION SCRIPT.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- STEP 1: PROVISION SHADOW PARTITIONED TABLE (DECLARATIVE RANGE PARTITIONING)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.daily_attendance_partitioned (
  id TEXT NOT NULL,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('HADIR', 'SAKIT', 'IZIN', 'ALPA')),
  notes TEXT,
  recorded_by_person_id TEXT REFERENCES public.persons(id) ON DELETE SET NULL,
  recorded_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  temperature_celsius NUMERIC(4, 1),
  arrival_mood TEXT CHECK (arrival_mood IN ('CERIA', 'TENANG', 'GELISAH', 'MENANGIS')),
  CONSTRAINT pk_daily_attendance_partitioned PRIMARY KEY (id, date),
  CONSTRAINT uq_daily_attendance_partitioned_record UNIQUE (school_id, class_id, student_id, date)
) PARTITION BY RANGE (date);

-- Concrete Academic Year Partitions (Temporal Windows)
CREATE TABLE IF NOT EXISTS public.daily_attendance_p2024_2025 
  PARTITION OF public.daily_attendance_partitioned
  FOR VALUES FROM ('2024-07-01') TO ('2025-07-01');

CREATE TABLE IF NOT EXISTS public.daily_attendance_p2025_2026 
  PARTITION OF public.daily_attendance_partitioned
  FOR VALUES FROM ('2025-07-01') TO ('2026-07-01');

CREATE TABLE IF NOT EXISTS public.daily_attendance_p2026_2027 
  PARTITION OF public.daily_attendance_partitioned
  FOR VALUES FROM ('2026-07-01') TO ('2027-07-01');

CREATE TABLE IF NOT EXISTS public.daily_attendance_p2027_2028 
  PARTITION OF public.daily_attendance_partitioned
  FOR VALUES FROM ('2027-07-01') TO ('2028-07-01');

CREATE TABLE IF NOT EXISTS public.daily_attendance_default 
  PARTITION OF public.daily_attendance_partitioned DEFAULT;

-- ==============================================================================
-- STEP 2: REPLICATE CONTROLS (INDEXES, RLS POLICIES, & TRIGGERS)
-- ==============================================================================

-- 2.1 Replicate Indexes
CREATE INDEX IF NOT EXISTS idx_att_part_school_date 
  ON public.daily_attendance_partitioned (school_id, date);

CREATE INDEX IF NOT EXISTS idx_att_part_class_date 
  ON public.daily_attendance_partitioned (class_id, date);

CREATE INDEX IF NOT EXISTS idx_att_part_student_date 
  ON public.daily_attendance_partitioned (student_id, date);

-- 2.2 Replicate Row Level Security
ALTER TABLE public.daily_attendance_partitioned ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.daily_attendance_partitioned FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.daily_attendance_partitioned TO authenticated;

DROP POLICY IF EXISTS "Relevant actors can view daily_attendance_partitioned" ON public.daily_attendance_partitioned;
CREATE POLICY "Relevant actors can view daily_attendance_partitioned" 
  ON public.daily_attendance_partitioned FOR SELECT TO authenticated USING (
    public.auth_is_teacher_of_class(class_id) 
    OR public.auth_is_staff_of(school_id) 
    OR public.auth_is_guardian_of(student_id) 
    OR public.auth_is_governance()
  );

DROP POLICY IF EXISTS "Teachers can insert daily_attendance_partitioned" ON public.daily_attendance_partitioned;
CREATE POLICY "Teachers can insert daily_attendance_partitioned" 
  ON public.daily_attendance_partitioned FOR INSERT TO authenticated WITH CHECK (
    public.auth_is_teacher_of_class(class_id) AND recorded_by_person_id = public.get_auth_person_id()
  );

DROP POLICY IF EXISTS "Teachers can update daily_attendance_partitioned" ON public.daily_attendance_partitioned;
CREATE POLICY "Teachers can update daily_attendance_partitioned" 
  ON public.daily_attendance_partitioned FOR UPDATE TO authenticated USING (
    public.auth_is_teacher_of_class(class_id) AND recorded_by_person_id = public.get_auth_person_id()
  ) WITH CHECK (
    public.auth_is_teacher_of_class(class_id) AND recorded_by_person_id = public.get_auth_person_id()
  );

-- 2.3 Ensure Guard Trigger Functions Exist (Self-Contained Migration)
CREATE OR REPLACE FUNCTION public.fn_guard_closed_semester_mutations()
RETURNS TRIGGER AS $$
DECLARE
  v_target_ay_id TEXT;
  v_ay_status TEXT;
BEGIN
  IF TG_TABLE_NAME LIKE 'observation_records%' THEN
    IF TG_OP = 'DELETE' THEN
      SELECT c.academic_year_id INTO v_target_ay_id FROM public.classes c WHERE c.id = OLD.class_id;
    ELSE
      SELECT c.academic_year_id INTO v_target_ay_id FROM public.classes c WHERE c.id = NEW.class_id;
    END IF;
  ELSIF TG_TABLE_NAME LIKE 'daily_attendance%' THEN
    IF TG_OP = 'DELETE' THEN
      SELECT c.academic_year_id INTO v_target_ay_id FROM public.classes c WHERE c.id = OLD.class_id;
    ELSE
      SELECT c.academic_year_id INTO v_target_ay_id FROM public.classes c WHERE c.id = NEW.class_id;
    END IF;
  ELSIF TG_TABLE_NAME LIKE 'student_progress_reports%' THEN
    IF TG_OP = 'DELETE' THEN
      v_target_ay_id := OLD.academic_year_id;
    ELSE
      v_target_ay_id := NEW.academic_year_id;
    END IF;
  END IF;

  SELECT lifecycle_status INTO v_ay_status
  FROM public.academic_years
  WHERE id = v_target_ay_id;

  IF v_ay_status IN ('CLOSED', 'ARCHIVED') THEN
    RAISE EXCEPTION 'CANNOT_MUTATE_CLOSED_SEMESTER: Academic period % is %, % operation forbidden on %.', 
      v_target_ay_id, v_ay_status, TG_OP, TG_TABLE_NAME;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

CREATE OR REPLACE FUNCTION public.fn_guard_foundation_mutation_block_fb06()
RETURNS TRIGGER AS $$
DECLARE
  v_caller_person_id TEXT;
  v_is_foundation_role BOOLEAN := FALSE;
BEGIN
  v_caller_person_id := public.get_auth_person_id();
  
  IF v_caller_person_id IS NOT NULL THEN
    -- Check governance_profiles
    SELECT EXISTS (
      SELECT 1 FROM public.governance_profiles 
      WHERE person_id = v_caller_person_id 
        AND role IN ('SUPERADMIN', 'FOUNDATION_DIRECTOR', 'FOUNDATION_TRUSTEE', 'YAPENDIK_SUPERADMIN', 'AUDITOR', 'SUPERVISOR')
        AND is_active = TRUE
    ) INTO v_is_foundation_role;

    -- Also check staff_profiles
    IF NOT v_is_foundation_role THEN
      SELECT EXISTS (
        SELECT 1 FROM public.staff_profiles
        WHERE person_id = v_caller_person_id
          AND role IN ('SUPERADMIN', 'FOUNDATION_DIRECTOR', 'FOUNDATION_TRUSTEE', 'YAPENDIK_SUPERADMIN')
          AND is_active = TRUE
      ) INTO v_is_foundation_role;
    END IF;
  END IF;

  IF v_is_foundation_role THEN
    RAISE EXCEPTION 'MUTATION_REJECTED_FB06: Foundation roles are strictly prohibited from mutating canonical school entity % (FB-06). Foundation authority is restricted to issuing Institutional Actions.', TG_TABLE_NAME;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

-- 2.4 Replicate Triggers (Temporal Guards & FB-06 Foundation Hard Block)
DROP TRIGGER IF EXISTS trg_guard_closed_semester_att_part ON public.daily_attendance_partitioned;
CREATE TRIGGER trg_guard_closed_semester_att_part
  BEFORE INSERT OR UPDATE OR DELETE ON public.daily_attendance_partitioned
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_closed_semester_mutations();

DROP TRIGGER IF EXISTS trg_fb06_block_foundation_att_part ON public.daily_attendance_partitioned;
CREATE TRIGGER trg_fb06_block_foundation_att_part
  BEFORE INSERT OR UPDATE OR DELETE ON public.daily_attendance_partitioned
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_foundation_mutation_block_fb06();

-- ==============================================================================
-- STEP 3: NON-BLOCKING CHUNKED BACKFILL ENGINE
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.fn_backfill_attendance_to_shadow(p_batch_size INT DEFAULT 1000)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_inserted_count INT := 0;
  v_rows_in_batch INT := 0;
BEGIN
  -- Acquire advisory lock (key: 8492019) to serialize backfill workers
  IF NOT pg_try_advisory_lock(8492019) THEN
    RAISE EXCEPTION 'BACKFILL_LOCKED: Another backfill process is currently running.';
  END IF;

  LOOP
    INSERT INTO public.daily_attendance_partitioned (
      id, school_id, class_id, student_id, date, status, notes,
      recorded_by_person_id, recorded_at, temperature_celsius, arrival_mood
    )
    SELECT 
      da.id, da.school_id, da.class_id, da.student_id, da.date, da.status, da.notes,
      da.recorded_by_person_id, da.recorded_at, da.temperature_celsius, da.arrival_mood
    FROM public.daily_attendance da
    LEFT JOIN public.daily_attendance_partitioned dap 
      ON dap.id = da.id AND dap.date = da.date
    WHERE dap.id IS NULL
    LIMIT p_batch_size
    ON CONFLICT (id, date) DO NOTHING;

    GET DIAGNOSTICS v_rows_in_batch = ROW_COUNT;
    v_inserted_count := v_inserted_count + v_rows_in_batch;

    EXIT WHEN v_rows_in_batch = 0;

    -- Yield briefly to prevent lock starvation on production read/write workloads
    PERFORM pg_sleep(0.01);
  END LOOP;

  PERFORM pg_advisory_unlock(8492019);
  RETURN v_inserted_count;
END;
$$;

-- ==============================================================================
-- STEP 4 & 5: MANUAL CUTOVER PROCEDURE (DO NOT EXECUTE AUTOMATICALLY)
-- ==============================================================================
-- This function encapsulates the atomic rename swap. It MUST only be invoked
-- manually by the Database Administrator during an authorized maintenance window.
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.fn_execute_attendance_cutover()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_count_orig INT;
  v_count_shadow INT;
BEGIN
  -- 1. Integrity Verification: original vs shadow row counts
  SELECT count(*) INTO v_count_orig FROM public.daily_attendance;
  SELECT count(*) INTO v_count_shadow FROM public.daily_attendance_partitioned;

  IF v_count_orig <> v_count_shadow THEN
    RAISE EXCEPTION 'CUTOVER_ABORTED: Row count mismatch! Original=% vs Shadow=%. Please run backfill again.', 
      v_count_orig, v_count_shadow;
  END IF;

  -- 2. Atomic Rename Swap within Single Transaction
  ALTER TABLE public.daily_attendance RENAME TO daily_attendance_archive_monolith;
  ALTER TABLE public.daily_attendance_partitioned RENAME TO daily_attendance;

  -- 3. Return status
  RETURN format('CUTOVER_SUCCESSFUL: Successfully migrated %s records into partitioned daily_attendance.', v_count_shadow);
END;
$$;

COMMIT;
