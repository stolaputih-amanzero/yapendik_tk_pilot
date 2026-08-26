-- ==============================================================================
-- YAPENDIK SCHOOL OS — STAGE 3: MIGRATION M06
-- Description: Governed Lifecycle RPCs, State Transitions & Derived Intelligence
-- Target: Functions & Governed Procedures
-- Constraints: Security Definer, Server-Side Trusted Identity, Transaction Atomic,
--              Cross-School Jurisdiction Guard, Population Reconciliation, 
--              Append-Only Audit Logging
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. GOVERNED COMMAND: rpc_close_academic_semester
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_close_academic_semester(
  p_school_id TEXT,
  p_academic_year_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_person_id TEXT;
  v_caller_role TEXT;
  v_is_superadmin BOOLEAN := FALSE;
  v_is_headmaster BOOLEAN := FALSE;
  v_ay RECORD;
  v_enrolled_count INT := 0;
  v_approved_lppa_count INT := 0;
  v_pending_lppa_count INT := 0;
BEGIN
  -- 1. Trusted Server-Side Authentication
  v_caller_person_id := public.get_auth_person_id();
  IF v_caller_person_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication token missing or unmapped.';
  END IF;

  -- 2. Contextual Jurisdiction Authorization Check
  SELECT sp.role INTO v_caller_role
  FROM public.staff_profiles sp
  WHERE sp.person_id = v_caller_person_id AND sp.is_active = TRUE;

  IF v_caller_role = 'SUPERADMIN' THEN
    v_is_superadmin := TRUE;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.schools 
    WHERE id = p_school_id AND headmaster_person_id = v_caller_person_id
  ) INTO v_is_headmaster;

  IF NOT (v_is_superadmin OR v_is_headmaster) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller % is not authorized to close academic semester for school %.', 
      v_caller_person_id, p_school_id;
  END IF;

  -- 3. Verify Target Academic Year & Current Lifecycle State
  SELECT * INTO v_ay 
  FROM public.academic_years 
  WHERE id = p_academic_year_id AND school_id = p_school_id;

  IF v_ay.id IS NULL THEN
    RAISE EXCEPTION 'SEMESTER_NOT_FOUND: Academic period % not found in school %.', p_academic_year_id, p_school_id;
  END IF;

  IF v_ay.lifecycle_status IN ('CLOSED', 'ARCHIVED') THEN
    RAISE EXCEPTION 'INVALID_SEMESTER_STATE: Academic period % is already %.', p_academic_year_id, v_ay.lifecycle_status;
  END IF;

  -- 4. Invariant: 100% Active Student LPPA Progress Report Reconciliation
  -- Count active enrolled students in this academic year
  SELECT COUNT(DISTINCT student_id) INTO v_enrolled_count
  FROM public.student_placement_records
  WHERE school_id = p_school_id AND academic_year_id = p_academic_year_id AND placement_status = 'ACTIVE';

  -- Count APPROVED or PUBLISHED LPPA reports for this academic year
  SELECT COUNT(DISTINCT r.student_id) INTO v_approved_lppa_count
  FROM public.student_progress_reports r
  JOIN public.student_placement_records spr 
    ON spr.student_id = r.student_id 
   AND spr.academic_year_id = p_academic_year_id 
   AND spr.placement_status = 'ACTIVE'
  WHERE r.school_id = p_school_id 
    AND r.academic_year_id = p_academic_year_id 
    AND r.status IN ('APPROVED', 'PUBLISHED');

  IF v_enrolled_count > 0 AND v_approved_lppa_count < v_enrolled_count THEN
    RAISE EXCEPTION 'PRECONDITION_FAILED: Only % of % active enrolled students have APPROVED/PUBLISHED LPPA progress reports.', 
      v_approved_lppa_count, v_enrolled_count;
  END IF;

  -- Verify no remaining DRAFT reports
  SELECT COUNT(*) INTO v_pending_lppa_count
  FROM public.student_progress_reports
  WHERE school_id = p_school_id 
    AND academic_year_id = p_academic_year_id 
    AND status NOT IN ('APPROVED', 'PUBLISHED');

  IF v_pending_lppa_count > 0 THEN
    RAISE EXCEPTION 'PRECONDITION_FAILED: % LPPA progress report(s) are still in DRAFT or pending review.', v_pending_lppa_count;
  END IF;

  -- 5. Atomic State Transition: Close Semester
  UPDATE public.academic_years
  SET lifecycle_status = 'CLOSED',
      is_active = FALSE,
      closed_at = timezone('utc'::text, now()),
      closed_by_person_id = v_caller_person_id
  WHERE id = p_academic_year_id;

  -- 6. Append Structured Immutable Audit Event (Atomic with transaction)
  INSERT INTO public.audit_logs (
    id, school_id, user_id, action, resource, resource_id, details, timestamp
  ) VALUES (
    'aud_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16),
    p_school_id,
    v_caller_person_id,
    'CLOSE_SEMESTER',
    'academic_year',
    p_academic_year_id,
    jsonb_build_object(
      'academic_year_id', p_academic_year_id,
      'name', v_ay.name,
      'semester', v_ay.semester,
      'enrolled_reconciled_count', v_enrolled_count,
      'closed_by', v_caller_person_id,
      'closed_at', timezone('utc'::text, now())
    )::text,
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'academic_year_id', p_academic_year_id,
    'status', 'CLOSED',
    'enrolled_reconciled_count', v_enrolled_count
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 2. GOVERNED COMMAND: rpc_promote_classroom_cohort
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_promote_classroom_cohort(
  p_school_id TEXT,
  p_source_class_id TEXT,
  p_target_class_id TEXT,
  p_target_academic_year_id TEXT,
  p_student_ids TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_person_id TEXT;
  v_caller_role TEXT;
  v_is_superadmin BOOLEAN := FALSE;
  v_is_headmaster BOOLEAN := FALSE;
  v_source_class RECORD;
  v_target_class RECORD;
  v_source_ay RECORD;
  v_target_ay RECORD;
  v_student_count INT;
  v_current_placed_in_target INT := 0;
  v_target_capacity INT := 15;
  v_student_id TEXT;
  v_promoted_count INT := 0;
BEGIN
  -- 1. Trusted Server-Side Authentication
  v_caller_person_id := public.get_auth_person_id();
  IF v_caller_person_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication token missing or unmapped.';
  END IF;

  -- 2. Contextual Jurisdiction Authorization Check
  SELECT sp.role INTO v_caller_role
  FROM public.staff_profiles sp
  WHERE sp.person_id = v_caller_person_id AND sp.is_active = TRUE;

  IF v_caller_role = 'SUPERADMIN' THEN
    v_is_superadmin := TRUE;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.schools 
    WHERE id = p_school_id AND headmaster_person_id = v_caller_person_id
  ) INTO v_is_headmaster;

  IF NOT (v_is_superadmin OR v_is_headmaster) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller % is not authorized to promote cohorts for school %.', 
      v_caller_person_id, p_school_id;
  END IF;

  -- 3. Validate Source Class & Source Academic Period Lifecycle
  SELECT * INTO v_source_class FROM public.classes WHERE id = p_source_class_id AND school_id = p_school_id;
  IF v_source_class.id IS NULL THEN
    RAISE EXCEPTION 'SOURCE_CLASS_NOT_FOUND: Class % not found in school %.', p_source_class_id, p_school_id;
  END IF;

  SELECT * INTO v_source_ay FROM public.academic_years WHERE id = v_source_class.academic_year_id AND school_id = p_school_id;
  IF v_source_ay.id IS NOT NULL AND v_source_ay.lifecycle_status NOT IN ('CLOSED', 'CLOSING') THEN
    RAISE EXCEPTION 'SOURCE_SEMESTER_NOT_CLOSED: Source period % must be CLOSED or CLOSING prior to promotion.', v_source_ay.id;
  END IF;

  -- 4. Validate Target Class & Target Academic Period Lifecycle
  SELECT * INTO v_target_class FROM public.classes WHERE id = p_target_class_id AND school_id = p_school_id;
  IF v_target_class.id IS NULL THEN
    RAISE EXCEPTION 'TARGET_CLASS_NOT_FOUND: Class % not found in school %.', p_target_class_id, p_school_id;
  END IF;

  SELECT * INTO v_target_ay FROM public.academic_years WHERE id = p_target_academic_year_id AND school_id = p_school_id;
  IF v_target_ay.id IS NULL THEN
    RAISE EXCEPTION 'TARGET_SEMESTER_NOT_FOUND: Target academic period % not found in school %.', p_target_academic_year_id, p_school_id;
  END IF;

  IF v_target_ay.lifecycle_status NOT IN ('PLANNED', 'ACTIVE') THEN
    RAISE EXCEPTION 'TARGET_SEMESTER_NOT_ACTIVE: Target academic period % must be PLANNED or ACTIVE.', p_target_academic_year_id;
  END IF;

  -- Temporal Alignment Invariant: target class must belong to target academic year
  IF v_target_class.academic_year_id != p_target_academic_year_id THEN
    RAISE EXCEPTION 'TEMPORAL_ALIGNMENT_MISMATCH: Target class % belongs to period %, not %.', 
      p_target_class_id, v_target_class.academic_year_id, p_target_academic_year_id;
  END IF;

  -- 5. Validate Student List & Target Capacity Invariant
  v_student_count := array_length(p_student_ids, 1);
  IF v_student_count IS NULL OR v_student_count = 0 THEN
    RAISE EXCEPTION 'NO_STUDENTS_SELECTED: Student IDs array cannot be empty.';
  END IF;

  SELECT COUNT(*) INTO v_current_placed_in_target
  FROM public.student_placement_records
  WHERE class_id = p_target_class_id 
    AND academic_year_id = p_target_academic_year_id 
    AND placement_status = 'ACTIVE';

  v_target_capacity := COALESCE(v_target_class.capacity, 15);
  IF (v_current_placed_in_target + v_student_count) > v_target_capacity THEN
    RAISE EXCEPTION 'CAPACITY_EXCEEDED: Target class capacity is %, but already has % active placements. Cannot promote % students.',
      v_target_capacity, v_current_placed_in_target, v_student_count;
  END IF;

  -- 6. Atomic Lineage Mutation Loop
  FOREACH v_student_id IN ARRAY p_student_ids LOOP
    -- Invariant: Verify active placement in source class and source academic period
    IF NOT EXISTS (
      SELECT 1 FROM public.student_placement_records
      WHERE student_id = v_student_id 
        AND class_id = p_source_class_id 
        AND academic_year_id = v_source_class.academic_year_id
        AND placement_status = 'ACTIVE'
    ) THEN
      RAISE EXCEPTION 'STUDENT_NOT_ACTIVE_IN_SOURCE: Student % does not have an active placement in source class % for period %.', 
        v_student_id, p_source_class_id, v_source_class.academic_year_id;
    END IF;

    -- A. Terminalize old active placement in source class
    UPDATE public.student_placement_records
    SET placement_status = 'PROMOTED',
        exit_date = v_target_ay.start_date,
        promotion_remarks = 'Promoted to ' || v_target_class.name,
        updated_at = timezone('utc'::text, now())
    WHERE student_id = v_student_id 
      AND class_id = p_source_class_id 
      AND placement_status = 'ACTIVE';

    -- B. Append new active placement in target class
    INSERT INTO public.student_placement_records (
      student_id, school_id, academic_year_id, class_id,
      homeroom_teacher_person_id, entry_date, placement_status
    ) VALUES (
      v_student_id, p_school_id, p_target_academic_year_id, p_target_class_id,
      v_target_class.homeroom_teacher_id, v_target_ay.start_date, 'ACTIVE'
    );

    v_promoted_count := v_promoted_count + 1;
  END LOOP;

  -- 7. Append Structured Immutable Audit Event
  INSERT INTO public.audit_logs (
    id, school_id, user_id, action, resource, resource_id, details, timestamp
  ) VALUES (
    'aud_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16),
    p_school_id,
    v_caller_person_id,
    'PROMOTE_COHORT',
    'class',
    p_source_class_id,
    jsonb_build_object(
      'source_class_id', p_source_class_id,
      'target_class_id', p_target_class_id,
      'target_academic_year_id', p_target_academic_year_id,
      'promoted_count', v_promoted_count,
      'student_ids', p_student_ids
    )::text,
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'promoted_count', v_promoted_count,
    'target_class_id', p_target_class_id
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. GOVERNED COMMAND: rpc_graduate_student_cohort
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_graduate_student_cohort(
  p_school_id TEXT,
  p_class_id TEXT,
  p_student_ids TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_person_id TEXT;
  v_caller_role TEXT;
  v_is_superadmin BOOLEAN := FALSE;
  v_is_headmaster BOOLEAN := FALSE;
  v_class RECORD;
  v_student_id TEXT;
  v_graduated_count INT := 0;
BEGIN
  -- 1. Trusted Server-Side Authentication
  v_caller_person_id := public.get_auth_person_id();
  IF v_caller_person_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication token missing or unmapped.';
  END IF;

  -- 2. Contextual Jurisdiction Authorization Check
  SELECT sp.role INTO v_caller_role
  FROM public.staff_profiles sp
  WHERE sp.person_id = v_caller_person_id AND sp.is_active = TRUE;

  IF v_caller_role = 'SUPERADMIN' THEN
    v_is_superadmin := TRUE;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.schools 
    WHERE id = p_school_id AND headmaster_person_id = v_caller_person_id
  ) INTO v_is_headmaster;

  IF NOT (v_is_superadmin OR v_is_headmaster) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller % is not authorized to graduate students for school %.', 
      v_caller_person_id, p_school_id;
  END IF;

  -- 3. Verify Class Ownership
  SELECT * INTO v_class FROM public.classes WHERE id = p_class_id AND school_id = p_school_id;
  IF v_class.id IS NULL THEN
    RAISE EXCEPTION 'CLASS_NOT_FOUND: Class % not found in school %.', p_class_id, p_school_id;
  END IF;

  -- 4. Atomic Graduation Loop
  FOREACH v_student_id IN ARRAY p_student_ids LOOP
    -- Invariant: Verify active placement exists in this class
    IF NOT EXISTS (
      SELECT 1 FROM public.student_placement_records
      WHERE student_id = v_student_id AND class_id = p_class_id AND placement_status = 'ACTIVE'
    ) THEN
      RAISE EXCEPTION 'STUDENT_NOT_ACTIVE_IN_CLASS: Student % does not have active placement in class %.', 
        v_student_id, p_class_id;
    END IF;

    -- A. Terminalize active placement
    UPDATE public.student_placement_records
    SET placement_status = 'COMPLETED',
        exit_date = CURRENT_DATE,
        promotion_remarks = 'Graduated from ' || v_class.name,
        updated_at = timezone('utc'::text, now())
    WHERE student_id = v_student_id 
      AND class_id = p_class_id 
      AND placement_status = 'ACTIVE';

    -- B. Update student institutional status to GRADUATED & clear current projection
    UPDATE public.students
    SET status = 'GRADUATED',
        current_class_id = NULL,
        updated_at = timezone('utc'::text, now())
    WHERE id = v_student_id;

    v_graduated_count := v_graduated_count + 1;
  END LOOP;

  -- 5. Append Structured Immutable Audit Event
  INSERT INTO public.audit_logs (
    id, school_id, user_id, action, resource, resource_id, details, timestamp
  ) VALUES (
    'aud_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16),
    p_school_id,
    v_caller_person_id,
    'GRADUATE_COHORT',
    'class',
    p_class_id,
    jsonb_build_object(
      'class_id', p_class_id,
      'class_name', v_class.name,
      'graduated_count', v_graduated_count,
      'student_ids', p_student_ids
    )::text,
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'graduated_count', v_graduated_count
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 4. GOVERNED COMMAND: rpc_initialize_next_semester
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.rpc_initialize_next_semester(
  p_school_id TEXT,
  p_name TEXT,
  p_semester TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_person_id TEXT;
  v_caller_role TEXT;
  v_is_superadmin BOOLEAN := FALSE;
  v_is_headmaster BOOLEAN := FALSE;
  v_new_ay_id TEXT;
BEGIN
  -- 1. Trusted Server-Side Authentication
  v_caller_person_id := public.get_auth_person_id();
  IF v_caller_person_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication token missing or unmapped.';
  END IF;

  -- 2. Contextual Jurisdiction Authorization Check
  SELECT sp.role INTO v_caller_role
  FROM public.staff_profiles sp
  WHERE sp.person_id = v_caller_person_id AND sp.is_active = TRUE;

  IF v_caller_role = 'SUPERADMIN' THEN
    v_is_superadmin := TRUE;
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.schools 
    WHERE id = p_school_id AND headmaster_person_id = v_caller_person_id
  ) INTO v_is_headmaster;

  IF NOT (v_is_superadmin OR v_is_headmaster) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller % is not authorized to initialize academic periods for school %.', 
      v_caller_person_id, p_school_id;
  END IF;

  -- 3. Validate Inputs
  IF p_semester NOT IN ('GANJIL', 'GENAP') THEN
    RAISE EXCEPTION 'INVALID_SEMESTER_TYPE: Semester must be GANJIL or GENAP.';
  END IF;

  IF p_end_date <= p_start_date THEN
    RAISE EXCEPTION 'INVALID_DATE_RANGE: End date must be strictly after start date.';
  END IF;

  -- Invariant: Close any active period or check single active constraint
  IF EXISTS (
    SELECT 1 FROM public.academic_years 
    WHERE school_id = p_school_id AND (lifecycle_status = 'ACTIVE' OR is_active = TRUE)
  ) THEN
    RAISE EXCEPTION 'ACTIVE_PERIOD_EXISTS: An active academic period already exists for school %. Close it first.', p_school_id;
  END IF;

  v_new_ay_id := 'ay_' || substr(p_school_id, 8, 4) || '_' || to_char(p_start_date, 'YYYY') || '_' || lower(p_semester);

  -- 4. Create and Activate New Academic Period
  INSERT INTO public.academic_years (
    id, school_id, name, semester, start_date, end_date, is_active, lifecycle_status
  ) VALUES (
    v_new_ay_id, p_school_id, p_name, p_semester, p_start_date, p_end_date, TRUE, 'ACTIVE'
  );

  -- 5. Append Structured Immutable Audit Event
  INSERT INTO public.audit_logs (
    id, school_id, user_id, action, resource, resource_id, details, timestamp
  ) VALUES (
    'aud_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16),
    p_school_id,
    v_caller_person_id,
    'INITIALIZE_SEMESTER',
    'academic_year',
    v_new_ay_id,
    jsonb_build_object(
      'academic_year_id', v_new_ay_id,
      'name', p_name,
      'semester', p_semester,
      'start_date', p_start_date,
      'end_date', p_end_date
    )::text,
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object(
    'success', true,
    'academic_year_id', v_new_ay_id,
    'status', 'ACTIVE'
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 5. DERIVED INTELLIGENCE: fn_derive_school_health_telemetry
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_derive_school_health_telemetry(p_school_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_active_ay RECORD;
  v_total_capacity INT := 0;
  v_total_students INT := 0;
  v_unstaffed_classes INT := 0;
  v_pending_lppa_count INT := 0;
  v_approved_lppa_count INT := 0;
  v_total_obs_count INT := 0;
  v_recorded_att_days INT := 0;
  v_capacity_pct NUMERIC := 0;
  v_curriculum_velocity_pct NUMERIC := 0;
  v_health_status TEXT := 'HEALTHY';
  v_exceptions JSONB := '[]'::jsonb;
BEGIN
  -- 1. Query Active/Closing Academic Period
  SELECT * INTO v_active_ay 
  FROM public.academic_years
  WHERE school_id = p_school_id AND (lifecycle_status IN ('ACTIVE', 'CLOSING') OR is_active = TRUE)
  LIMIT 1;

  IF v_active_ay.id IS NULL THEN
    RETURN jsonb_build_object(
      'school_id', p_school_id,
      'health_status', 'CRITICAL_BLOCKER',
      'exceptions', jsonb_build_array(jsonb_build_object('code', 'NO_ACTIVE_SEMESTER', 'message', 'No active academic period defined.'))
    );
  END IF;

  -- 2. Indicator 1: Capacity Utilization
  SELECT COALESCE(SUM(capacity), 0) INTO v_total_capacity 
  FROM public.classes 
  WHERE school_id = p_school_id AND academic_year_id = v_active_ay.id;

  SELECT COUNT(*) INTO v_total_students 
  FROM public.student_placement_records 
  WHERE school_id = p_school_id AND academic_year_id = v_active_ay.id AND placement_status = 'ACTIVE';

  IF v_total_capacity > 0 THEN
    v_capacity_pct := ROUND((v_total_students::NUMERIC / v_total_capacity::NUMERIC) * 100, 1);
  END IF;

  IF v_total_capacity > 0 AND v_total_students > v_total_capacity THEN
    v_exceptions := v_exceptions || jsonb_build_array(jsonb_build_object('code', 'OVERCAPACITY_ROOMS', 'capacity', v_total_capacity, 'placed', v_total_students));
    v_health_status := 'ATTENTION_REQUIRED';
  END IF;

  -- 3. Indicator 2: Staffing Compliance
  SELECT COUNT(*) INTO v_unstaffed_classes 
  FROM public.classes
  WHERE school_id = p_school_id AND academic_year_id = v_active_ay.id AND is_active = TRUE AND homeroom_teacher_id IS NULL;

  IF v_unstaffed_classes > 0 THEN
    v_exceptions := v_exceptions || jsonb_build_array(jsonb_build_object('code', 'UNSTAFFED_CLASSES', 'count', v_unstaffed_classes));
    v_health_status := 'ATTENTION_REQUIRED';
  END IF;

  -- 4. Indicator 3: Attendance Consistency
  SELECT COUNT(DISTINCT da.date) INTO v_recorded_att_days
  FROM public.daily_attendance da
  JOIN public.classes c ON c.id = da.class_id
  WHERE c.school_id = p_school_id AND c.academic_year_id = v_active_ay.id;

  -- 5. Indicator 4: Curriculum Velocity & LPPA Progress
  SELECT COUNT(*) INTO v_total_obs_count 
  FROM public.observation_records o
  JOIN public.classes c ON c.id = o.class_id
  WHERE c.school_id = p_school_id AND c.academic_year_id = v_active_ay.id;

  SELECT COUNT(*) INTO v_approved_lppa_count 
  FROM public.student_progress_reports 
  WHERE school_id = p_school_id AND academic_year_id = v_active_ay.id AND status IN ('APPROVED', 'PUBLISHED');

  IF v_total_students > 0 THEN
    v_curriculum_velocity_pct := ROUND((v_approved_lppa_count::NUMERIC / v_total_students::NUMERIC) * 100, 1);
  END IF;

  IF v_active_ay.lifecycle_status = 'CLOSING' THEN
    SELECT COUNT(*) INTO v_pending_lppa_count 
    FROM public.student_progress_reports
    WHERE school_id = p_school_id AND academic_year_id = v_active_ay.id AND status NOT IN ('APPROVED', 'PUBLISHED');

    IF v_pending_lppa_count > 0 THEN
      v_exceptions := v_exceptions || jsonb_build_array(jsonb_build_object('code', 'PENDING_LPPA_APPROVALS', 'count', v_pending_lppa_count));
      v_health_status := 'ATTENTION_REQUIRED';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'school_id', p_school_id,
    'academic_year_id', v_active_ay.id,
    'academic_year_name', v_active_ay.name,
    'semester', v_active_ay.semester,
    'lifecycle_status', v_active_ay.lifecycle_status,
    'health_status', v_health_status,
    'indicators', jsonb_build_object(
      'capacity_utilization_pct', v_capacity_pct,
      'staffing_compliance', (v_unstaffed_classes = 0),
      'attendance_recorded_days', v_recorded_att_days,
      'curriculum_velocity_pct', v_curriculum_velocity_pct
    ),
    'metrics', jsonb_build_object(
      'total_placed_students', v_total_students,
      'total_capacity', v_total_capacity,
      'unstaffed_classes', v_unstaffed_classes,
      'total_observations', v_total_obs_count,
      'approved_lppa_count', v_approved_lppa_count
    ),
    'exceptions', v_exceptions
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 6. DERIVED INTELLIGENCE: fn_get_student_longitudinal_trajectory
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_get_student_longitudinal_trajectory(p_student_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_person_id TEXT;
  v_is_authorized BOOLEAN := FALSE;
  v_student RECORD;
  v_placements JSONB;
  v_lppa_history JSONB;
  v_obs_summary JSONB;
BEGIN
  -- 1. Trusted Server-Side Authentication
  v_caller_person_id := public.get_auth_person_id();
  IF v_caller_person_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication token missing or unmapped.';
  END IF;

  SELECT * INTO v_student FROM public.students WHERE id = p_student_id;
  IF v_student.id IS NULL THEN
    RAISE EXCEPTION 'STUDENT_NOT_FOUND: Student % not found.', p_student_id;
  END IF;

  -- 2. Authorization Boundary Check
  SELECT (
    EXISTS (SELECT 1 FROM public.staff_profiles WHERE person_id = v_caller_person_id AND role = 'SUPERADMIN' AND is_active = TRUE)
    OR
    EXISTS (SELECT 1 FROM public.staff_profiles WHERE person_id = v_caller_person_id AND school_id = v_student.school_id AND is_active = TRUE)
    OR
    EXISTS (SELECT 1 FROM public.guardian_relationships WHERE guardian_person_id = v_caller_person_id AND student_person_id = v_student.person_id)
  ) INTO v_is_authorized;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Caller % is not authorized to view trajectory for student %.', 
      v_caller_person_id, p_student_id;
  END IF;

  -- 3. Retrieve Chronological Placement Lineage
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'placement_id', spr.id,
      'academic_year_id', spr.academic_year_id,
      'academic_year_name', ay.name,
      'semester', ay.semester,
      'class_id', spr.class_id,
      'class_name', c.name,
      'entry_date', spr.entry_date,
      'exit_date', spr.exit_date,
      'placement_status', spr.placement_status,
      'promotion_remarks', spr.promotion_remarks
    ) ORDER BY spr.entry_date ASC
  ), '[]'::jsonb) INTO v_placements
  FROM public.student_placement_records spr
  JOIN public.academic_years ay ON ay.id = spr.academic_year_id
  JOIN public.classes c ON c.id = spr.class_id
  WHERE spr.student_id = p_student_id;

  -- 4. Retrieve Longitudinal LPPA Term Progress Reports
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'report_id', r.id,
      'academic_year_id', r.academic_year_id,
      'semester', r.semester,
      'status', r.status,
      'headmaster_approval_date', r.headmaster_approval_date,
      'homeroom_feedback', r.homeroom_feedback
    ) ORDER BY r.evaluated_at ASC
  ), '[]'::jsonb) INTO v_lppa_history
  FROM public.student_progress_reports r
  WHERE r.student_id = p_student_id;

  RETURN jsonb_build_object(
    'student_id', p_student_id,
    'school_id', v_student.school_id,
    'nis', v_student.nis,
    'current_status', v_student.status,
    'current_class_id', v_student.current_class_id,
    'placement_lineage', v_placements,
    'lppa_history', v_lppa_history
  );
END;
$$;

-- ------------------------------------------------------------------------------
-- 7. GRANT EXECUTE PRIVILEGES (Authenticated Users Only)
-- ------------------------------------------------------------------------------
REVOKE ALL ON FUNCTION public.rpc_close_academic_semester(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_close_academic_semester(TEXT, TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.rpc_promote_classroom_cohort(TEXT, TEXT, TEXT, TEXT, TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_promote_classroom_cohort(TEXT, TEXT, TEXT, TEXT, TEXT[]) TO authenticated;

REVOKE ALL ON FUNCTION public.rpc_graduate_student_cohort(TEXT, TEXT, TEXT[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_graduate_student_cohort(TEXT, TEXT, TEXT[]) TO authenticated;

REVOKE ALL ON FUNCTION public.rpc_initialize_next_semester(TEXT, TEXT, TEXT, DATE, DATE) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.rpc_initialize_next_semester(TEXT, TEXT, TEXT, DATE, DATE) TO authenticated;

REVOKE ALL ON FUNCTION public.fn_derive_school_health_telemetry(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_derive_school_health_telemetry(TEXT) TO authenticated;

REVOKE ALL ON FUNCTION public.fn_get_student_longitudinal_trajectory(TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.fn_get_student_longitudinal_trajectory(TEXT) TO authenticated;
