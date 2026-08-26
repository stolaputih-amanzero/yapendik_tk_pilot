-- ==============================================================================
-- YAPENDIK SCHOOL OS — STAGE 3: MIGRATION M05
-- Description: Temporal Lineage DDL, Immutability Triggers & Placement Backfill
-- Target: academic_years, students, student_placement_records, operational tables
-- Constraints: Non-destructive, Idempotent, All-or-Nothing Reconciliation Guard
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ENHANCE ACADEMIC YEARS TEMPORAL LIFECYCLE
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- 1.1 Add lifecycle_status column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'academic_years' AND column_name = 'lifecycle_status'
  ) THEN
    ALTER TABLE public.academic_years 
      ADD COLUMN lifecycle_status TEXT NOT NULL DEFAULT 'ACTIVE' 
      CHECK (lifecycle_status IN ('PLANNED', 'ACTIVE', 'CLOSING', 'CLOSED', 'ARCHIVED'));
    COMMENT ON COLUMN public.academic_years.lifecycle_status IS 'Temporal lifecycle state (PLANNED, ACTIVE, CLOSING, CLOSED, ARCHIVED)';
  END IF;

  -- 1.2 Add closed_at column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'academic_years' AND column_name = 'closed_at'
  ) THEN
    ALTER TABLE public.academic_years ADD COLUMN closed_at TIMESTAMPTZ NULL;
  END IF;

  -- 1.3 Add closed_by_person_id column
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'academic_years' AND column_name = 'closed_by_person_id'
  ) THEN
    ALTER TABLE public.academic_years 
      ADD COLUMN closed_by_person_id TEXT NULL REFERENCES public.persons(id) ON DELETE SET NULL;
  END IF;

  -- 1.4 Synchronize existing active rows
  UPDATE public.academic_years 
  SET lifecycle_status = 'ACTIVE' 
  WHERE is_active = TRUE AND lifecycle_status = 'ACTIVE';
END $$;

-- Single Active Academic Period / Year Constraint per School
CREATE UNIQUE INDEX IF NOT EXISTS uq_academic_years_single_active_per_school
  ON public.academic_years (school_id)
  WHERE (lifecycle_status = 'ACTIVE' OR is_active = TRUE);

-- ------------------------------------------------------------------------------
-- 2. ENHANCE STUDENTS INSTITUTIONAL STATUS CHECK & UPDATED_AT
-- ------------------------------------------------------------------------------
DO $$
BEGIN
  -- Add updated_at column if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'students' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.students ADD COLUMN updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());
  END IF;

  -- Drop existing status check if present
  ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_status_check;
  
  -- Add comprehensive status check
  ALTER TABLE public.students 
    ADD CONSTRAINT students_status_check 
    CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED', 'INACTIVE'));
    
  -- Migrate any INACTIVE status to WITHDRAWN
  UPDATE public.students SET status = 'WITHDRAWN' WHERE status = 'INACTIVE';
END $$;

-- ------------------------------------------------------------------------------
-- 3. CANONICAL LINEAGE TABLE: student_placement_records
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.student_placement_records (
  id TEXT PRIMARY KEY DEFAULT ('plc_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16)),
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
  academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  homeroom_teacher_person_id TEXT NULL REFERENCES public.persons(id) ON DELETE SET NULL,
  entry_date DATE NOT NULL,
  exit_date DATE NULL,
  placement_status TEXT NOT NULL DEFAULT 'ACTIVE' 
    CHECK (placement_status IN ('ACTIVE', 'COMPLETED', 'PROMOTED', 'TRANSFERRED')),
  promotion_remarks TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Invariant: Exactly ONE active placement per student at any given time
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_single_active_placement
  ON public.student_placement_records (student_id)
  WHERE (placement_status = 'ACTIVE');

-- Invariant: A student cannot have multiple placements in the same academic year / semester
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_academic_year_placement
  ON public.student_placement_records (student_id, academic_year_id);

-- Performance Indices for Historical Lineage Queries
CREATE INDEX IF NOT EXISTS idx_placement_school_ay_class 
  ON public.student_placement_records (school_id, academic_year_id, class_id);
CREATE INDEX IF NOT EXISTS idx_placement_student_lineage 
  ON public.student_placement_records (student_id, entry_date ASC);

-- ------------------------------------------------------------------------------
-- 4. EXISTING POPULATION BACKFILL & RECONCILIATION GUARD
-- ------------------------------------------------------------------------------
DO $$
DECLARE
  v_expected_count INT;
  v_actual_count INT;
  v_mismatch_count INT;
BEGIN
  -- 4.1 Perform deterministic backfill for all active placed students
  INSERT INTO public.student_placement_records (
    id, student_id, school_id, academic_year_id, class_id,
    homeroom_teacher_person_id, entry_date, placement_status
  )
  SELECT 
    'plc_init_' || substr(md5(s.id || c.id), 1, 12),
    s.id,
    s.school_id,
    c.academic_year_id,
    s.current_class_id,
    c.homeroom_teacher_id,
    COALESCE(s.enrollment_date, c_ay.start_date, CURRENT_DATE),
    'ACTIVE'
  FROM public.students s
  JOIN public.classes c ON c.id = s.current_class_id
  JOIN public.academic_years c_ay ON c_ay.id = c.academic_year_id
  WHERE s.current_class_id IS NOT NULL AND s.status = 'ACTIVE'
  ON CONFLICT (student_id, academic_year_id) DO NOTHING;

  -- 4.2 Verify Reconciliation: Population Count Match
  SELECT COUNT(*) INTO v_expected_count 
  FROM public.students 
  WHERE current_class_id IS NOT NULL AND status = 'ACTIVE';

  SELECT COUNT(*) INTO v_actual_count 
  FROM public.student_placement_records 
  WHERE placement_status = 'ACTIVE';

  IF v_actual_count < v_expected_count THEN
    RAISE EXCEPTION 'MIGRATION_ABORT_BACKFILL_POPULATION_MISMATCH: Expected % active placements, but created %.', 
      v_expected_count, v_actual_count;
  END IF;

  -- 4.3 Verify Reconciliation: Zero Data Integrity Discrepancies
  SELECT COUNT(*) INTO v_mismatch_count
  FROM public.student_placement_records spr
  JOIN public.students s ON s.id = spr.student_id
  JOIN public.classes c ON c.id = spr.class_id
  WHERE spr.school_id != s.school_id 
     OR spr.academic_year_id != c.academic_year_id 
     OR spr.class_id != s.current_class_id;

  IF v_mismatch_count > 0 THEN
    RAISE EXCEPTION 'MIGRATION_ABORT_BACKFILL_DATA_INTEGRITY_VIOLATION: Found % mismatched placement records.', v_mismatch_count;
  END IF;

  RAISE NOTICE '✅ MIGRATION M05 RECONCILIATION PASSED: % active students backfilled with 100 percent integrity.', v_actual_count;
END $$;

-- ------------------------------------------------------------------------------
-- 5. IMMUTABILITY & PROTECTION TRIGGERS
-- ------------------------------------------------------------------------------

-- 5.1 Trigger: Prevent Mutations on Closed Semesters
CREATE OR REPLACE FUNCTION public.fn_guard_closed_semester_mutations()
RETURNS TRIGGER AS $$
DECLARE
  v_ay_status TEXT;
  v_target_ay_id TEXT;
BEGIN
  -- Determine Target Academic Year ID based on table and TG_OP
  IF TG_TABLE_NAME = 'observation_records' THEN
    IF TG_OP = 'DELETE' THEN
      SELECT c.academic_year_id INTO v_target_ay_id FROM public.classes c WHERE c.id = OLD.class_id;
    ELSE
      SELECT c.academic_year_id INTO v_target_ay_id FROM public.classes c WHERE c.id = NEW.class_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'daily_attendance' THEN
    IF TG_OP = 'DELETE' THEN
      SELECT c.academic_year_id INTO v_target_ay_id FROM public.classes c WHERE c.id = OLD.class_id;
    ELSE
      SELECT c.academic_year_id INTO v_target_ay_id FROM public.classes c WHERE c.id = NEW.class_id;
    END IF;
  ELSIF TG_TABLE_NAME = 'student_progress_reports' THEN
    IF TG_OP = 'DELETE' THEN
      v_target_ay_id := OLD.academic_year_id;
    ELSE
      v_target_ay_id := NEW.academic_year_id;
    END IF;
  END IF;

  -- Check status of target academic period
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guard_closed_semester_obs ON public.observation_records;
CREATE TRIGGER trg_guard_closed_semester_obs
  BEFORE INSERT OR UPDATE OR DELETE ON public.observation_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_closed_semester_mutations();

DROP TRIGGER IF EXISTS trg_guard_closed_semester_att ON public.daily_attendance;
CREATE TRIGGER trg_guard_closed_semester_att
  BEFORE INSERT OR UPDATE OR DELETE ON public.daily_attendance
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_closed_semester_mutations();

DROP TRIGGER IF EXISTS trg_guard_closed_semester_lppa ON public.student_progress_reports;
CREATE TRIGGER trg_guard_closed_semester_lppa
  BEFORE INSERT OR UPDATE OR DELETE ON public.student_progress_reports
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_closed_semester_mutations();

-- 5.2 Trigger: Absolute Immutability on Terminal Placements
CREATE OR REPLACE FUNCTION public.fn_guard_placement_terminalization()
RETURNS TRIGGER AS $$
BEGIN
  -- Rule 1: If placement is ALREADY terminal, block ANY update completely
  IF OLD.placement_status IN ('COMPLETED', 'PROMOTED', 'TRANSFERRED') THEN
    RAISE EXCEPTION 'CANNOT_MUTATE_TERMINAL_PLACEMENT: Placement % is already terminalized as % and is permanently frozen.', 
      OLD.id, OLD.placement_status;
  END IF;

  -- Rule 2: Prevent modification of historical fact columns
  IF (OLD.student_id != NEW.student_id OR 
      OLD.school_id != NEW.school_id OR 
      OLD.academic_year_id != NEW.academic_year_id OR 
      OLD.class_id != NEW.class_id OR 
      OLD.homeroom_teacher_person_id IS DISTINCT FROM NEW.homeroom_teacher_person_id OR
      OLD.entry_date != NEW.entry_date) THEN
    RAISE EXCEPTION 'CANNOT_MUTATE_PLACEMENT_FACTS: Placement historical facts are permanently immutable.';
  END IF;

  -- Rule 3: Allow transition ONLY from ACTIVE to terminal state
  IF NEW.placement_status NOT IN ('COMPLETED', 'PROMOTED', 'TRANSFERRED') THEN
    RAISE EXCEPTION 'INVALID_PLACEMENT_TRANSITION: Active placement can only transition to COMPLETED, PROMOTED, or TRANSFERRED.';
  END IF;

  -- Rule 4: Ensure exit_date is set upon terminalization
  IF NEW.exit_date IS NULL THEN
    NEW.exit_date := CURRENT_DATE;
  END IF;

  NEW.updated_at := timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_placement_terminalization_guard ON public.student_placement_records;
CREATE TRIGGER trg_placement_terminalization_guard
  BEFORE UPDATE ON public.student_placement_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_placement_terminalization();

-- 5.3 Trigger: Lineage-Wins Projection Synchronization
CREATE OR REPLACE FUNCTION public.fn_sync_student_current_class()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.placement_status = 'ACTIVE') THEN
    UPDATE public.students 
    SET current_class_id = NEW.class_id, updated_at = timezone('utc'::text, now())
    WHERE id = NEW.student_id;
  ELSIF (TG_OP = 'UPDATE' AND OLD.placement_status = 'ACTIVE' AND NEW.placement_status != 'ACTIVE') THEN
    -- If active placement became terminal and no other active placement exists, clear projection
    IF NOT EXISTS (
      SELECT 1 FROM public.student_placement_records 
      WHERE student_id = NEW.student_id AND placement_status = 'ACTIVE' AND id != NEW.id
    ) THEN
      UPDATE public.students 
      SET current_class_id = NULL, updated_at = timezone('utc'::text, now())
      WHERE id = NEW.student_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_student_current_class ON public.student_placement_records;
CREATE TRIGGER trg_sync_student_current_class
  AFTER INSERT OR UPDATE ON public.student_placement_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_sync_student_current_class();

-- ------------------------------------------------------------------------------
-- 6. FAIL-CLOSED RLS SECURITY POLICIES
-- ------------------------------------------------------------------------------
ALTER TABLE public.student_placement_records ENABLE ROW LEVEL SECURITY;

-- Policy 1: Superadmin SELECT Access
DROP POLICY IF EXISTS "superadmin_read_all_placements" ON public.student_placement_records;
CREATE POLICY "superadmin_read_all_placements" ON public.student_placement_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.person_id = get_auth_person_id() AND sp.role = 'SUPERADMIN'
    )
  );

-- Policy 2: School Staff SELECT Access in Their School
DROP POLICY IF EXISTS "staff_read_school_placements" ON public.student_placement_records;
CREATE POLICY "staff_read_school_placements" ON public.student_placement_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.person_id = get_auth_person_id() AND sp.school_id = student_placement_records.school_id
    )
  );

-- Policy 3: Guardians SELECT Access for Their Linked Children Only
DROP POLICY IF EXISTS "guardian_read_child_placements" ON public.student_placement_records;
CREATE POLICY "guardian_read_child_placements" ON public.student_placement_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.guardian_relationships gr
      JOIN public.students s ON s.person_id = gr.student_person_id
      WHERE gr.guardian_person_id = get_auth_person_id() 
        AND s.id = student_placement_records.student_id
    )
  );

-- Policy 4: Complete Denial of Direct Client DML (Invariant I-10)
DROP POLICY IF EXISTS "deny_client_insert_placement" ON public.student_placement_records;
CREATE POLICY "deny_client_insert_placement" ON public.student_placement_records
  FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "deny_client_update_placement" ON public.student_placement_records;
CREATE POLICY "deny_client_update_placement" ON public.student_placement_records
  FOR UPDATE TO authenticated USING (false);

DROP POLICY IF EXISTS "deny_client_delete_placement" ON public.student_placement_records;
CREATE POLICY "deny_client_delete_placement" ON public.student_placement_records
  FOR DELETE TO authenticated USING (false);
