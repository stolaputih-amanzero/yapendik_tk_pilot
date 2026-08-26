-- ==============================================================================
-- YAPENDIK SCHOOL OS — STAGE 2: MIGRATION M03
-- Description: Governed Provisioning Engine (Atomic RPCs, Invariants & Readiness)
-- Target: Functions & Governed Procedures
-- Constraints: Security Definer, Role-Restricted, Concurrency-Safe, Audit-Emitting
-- ==============================================================================

-- ==============================================================================
-- 1. DETERMINISTIC READINESS EVALUATION RPC
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_evaluate_school_readiness(p_school_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_school RECORD;
  v_gate1 BOOLEAN := FALSE;
  v_gate2 BOOLEAN := FALSE;
  v_gate3 BOOLEAN := FALSE;
  v_gate4 BOOLEAN := FALSE;
  v_gate5 BOOLEAN := FALSE;
  v_gate6 BOOLEAN := FALSE;
  v_is_ready BOOLEAN := FALSE;
  v_readiness_status TEXT := 'NOT_READY';
  v_blockers JSONB := '[]'::jsonb;
BEGIN
  -- 1. Query school
  SELECT id, name, status, headmaster_person_id, academic_year_active_id 
  INTO v_school 
  FROM public.schools 
  WHERE id = p_school_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'SCHOOL_NOT_FOUND: School % does not exist', p_school_id;
  END IF;

  -- Gate 1: Legal Entity Active
  IF v_school.status = 'ACTIVE' THEN
    v_gate1 := TRUE;
  ELSE
    v_blockers := v_blockers || jsonb_build_array('Gate 1: Status hukum sekolah belum ACTIVE');
  END IF;

  -- Gate 2: Exactly 1 Active Academic Year
  SELECT (COUNT(*) = 1) INTO v_gate2 
  FROM public.academic_years 
  WHERE school_id = p_school_id AND is_active = TRUE;
  IF NOT v_gate2 THEN
    v_blockers := v_blockers || jsonb_build_array('Gate 2: Belum ada tepat 1 Tahun Akademik yang aktif');
  END IF;

  -- Gate 3: Active Semester Defined
  SELECT (COUNT(*) = 1) INTO v_gate3 
  FROM public.academic_years 
  WHERE school_id = p_school_id AND is_active = TRUE AND semester IS NOT NULL;
  IF NOT v_gate3 THEN
    v_blockers := v_blockers || jsonb_build_array('Gate 3: Semester/Periode Akademik belum terdefinisi');
  END IF;

  -- Gate 4: Headmaster Appointed
  IF v_school.headmaster_person_id IS NOT NULL THEN
    v_gate4 := TRUE;
  ELSE
    v_blockers := v_blockers || jsonb_build_array('Gate 4: Kepala Sekolah belum diangkat/ditetapkan');
  END IF;

  -- Gate 5: Staffed Classroom >= 1
  SELECT (COUNT(*) >= 1) INTO v_gate5 
  FROM public.classes 
  WHERE school_id = p_school_id AND is_active = TRUE AND homeroom_teacher_id IS NOT NULL;
  IF NOT v_gate5 THEN
    v_blockers := v_blockers || jsonb_build_array('Gate 5: Belum ada Rombel aktif dengan Guru Wali Kelas yang ditugaskan');
  END IF;

  -- Gate 6: Placed Students >= 1
  SELECT (COUNT(*) >= 1) INTO v_gate6 
  FROM public.students 
  WHERE school_id = p_school_id AND status = 'ACTIVE' AND current_class_id IS NOT NULL;
  IF NOT v_gate6 THEN
    v_blockers := v_blockers || jsonb_build_array('Gate 6: Belum ada Siswa aktif yang ditempatkan pada Rombel');
  END IF;

  -- Compute derived readiness
  IF (v_gate1 AND v_gate2 AND v_gate3 AND v_gate4 AND v_gate5 AND v_gate6) THEN
    v_is_ready := TRUE;
    v_readiness_status := 'READY';
  ELSE
    v_is_ready := FALSE;
    v_readiness_status := 'NOT_READY';
  END IF;

  -- Update operational_readiness atomically
  UPDATE public.schools 
  SET operational_readiness = v_readiness_status 
  WHERE id = p_school_id;

  RETURN jsonb_build_object(
    'school_id', p_school_id,
    'school_name', v_school.name,
    'is_ready', v_is_ready,
    'status', v_readiness_status,
    'gates', jsonb_build_object(
      'gate1_legal_active', v_gate1,
      'gate2_academic_year', v_gate2,
      'gate3_academic_period', v_gate3,
      'gate4_headmaster', v_gate4,
      'gate5_staffed_classroom', v_gate5,
      'gate6_placed_students', v_gate6
    ),
    'blockers', v_blockers,
    'evaluated_at', timezone('utc'::text, now())
  );
END;
$$;

-- ==============================================================================
-- 2. CREATE SCHOOL (YAYASAN SUPERADMIN ONLY)
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_create_school(
  p_id TEXT,
  p_npsn TEXT,
  p_name TEXT,
  p_level TEXT DEFAULT 'TK',
  p_sub_type TEXT DEFAULT 'STANDARD',
  p_address TEXT DEFAULT '',
  p_city TEXT DEFAULT '',
  p_province TEXT DEFAULT '',
  p_phone TEXT DEFAULT '',
  p_email TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id TEXT;
  v_readiness_result JSONB;
BEGIN
  v_person_id := get_auth_person_id();
  IF v_person_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  IF NOT auth_is_superadmin() THEN
    RAISE EXCEPTION 'FORBIDDEN: Only Yayasan Superadmin can establish new schools';
  END IF;

  IF EXISTS (SELECT 1 FROM public.schools WHERE npsn = p_npsn) THEN
    RAISE EXCEPTION 'DUPLICATE_NPSN: School with NPSN % already exists', p_npsn;
  END IF;

  INSERT INTO public.schools (
    id, npsn, name, level, sub_type, address, city, province, phone, email, 
    status, operational_readiness
  ) VALUES (
    p_id, p_npsn, p_name, p_level, p_sub_type, p_address, p_city, p_province, p_phone, p_email,
    'ACTIVE', 'NOT_READY'
  );

  PERFORM fn_write_audit_log(
    p_id,
    'SCHOOL_ESTABLISHED',
    'schools',
    p_id,
    jsonb_build_object('established_by', v_person_id, 'npsn', p_npsn, 'name', p_name)
  );

  v_readiness_result := rpc_evaluate_school_readiness(p_id);

  RETURN jsonb_build_object(
    'success', true,
    'school_id', p_id,
    'name', p_name,
    'status', 'ACTIVE',
    'readiness', v_readiness_result
  );
END;
$$;

-- ==============================================================================
-- 3. ASSIGN HEADMASTER (YAYASAN SUPERADMIN ONLY)
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_assign_headmaster(
  p_school_id TEXT,
  p_person_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_person_id TEXT;
  v_readiness_result JSONB;
BEGIN
  v_auth_person_id := get_auth_person_id();
  IF v_auth_person_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  IF NOT auth_is_superadmin() THEN
    RAISE EXCEPTION 'FORBIDDEN: Only Yayasan Superadmin can assign Headmasters';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.schools WHERE id = p_school_id) THEN
    RAISE EXCEPTION 'SCHOOL_NOT_FOUND';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM public.persons WHERE id = p_person_id) THEN
    RAISE EXCEPTION 'PERSON_NOT_FOUND';
  END IF;

  -- Update school headmaster
  UPDATE public.schools 
  SET headmaster_person_id = p_person_id 
  WHERE id = p_school_id;

  -- Ensure staff profile exists
  INSERT INTO public.staff_profiles (
    id, person_id, school_id, role, employment_type, is_active
  ) VALUES (
    'stf_hm_' || substr(md5(random()::text), 1, 8),
    p_person_id,
    p_school_id,
    'HEADMASTER',
    'TETAP',
    TRUE
  )
  ON CONFLICT (id) DO NOTHING;

  PERFORM fn_write_audit_log(
    p_school_id,
    'HEADMASTER_APPOINTED',
    'schools',
    p_school_id,
    jsonb_build_object('headmaster_person_id', p_person_id, 'appointed_by', v_auth_person_id)
  );

  v_readiness_result := rpc_evaluate_school_readiness(p_school_id);

  RETURN jsonb_build_object(
    'success', true,
    'school_id', p_school_id,
    'headmaster_person_id', p_person_id,
    'readiness', v_readiness_result
  );
END;
$$;

-- ==============================================================================
-- 4. INITIALIZE ACADEMIC YEAR (SUPERADMIN / HEADMASTER)
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_initialize_academic_year(
  p_id TEXT,
  p_school_id TEXT,
  p_name TEXT,
  p_semester TEXT,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id TEXT;
  v_readiness_result JSONB;
BEGIN
  v_person_id := get_auth_person_id();
  IF v_person_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  IF NOT auth_is_superadmin() AND NOT auth_is_headmaster_of(p_school_id) THEN
    RAISE EXCEPTION 'FORBIDDEN: Insufficient permissions to initialize Academic Year';
  END IF;

  -- Deactivate previous active years in this school
  UPDATE public.academic_years 
  SET is_active = FALSE 
  WHERE school_id = p_school_id;

  -- Insert new active academic year
  INSERT INTO public.academic_years (
    id, school_id, name, semester, start_date, end_date, is_active
  ) VALUES (
    p_id, p_school_id, p_name, p_semester, p_start_date, p_end_date, TRUE
  );

  -- Link active academic year to school
  UPDATE public.schools 
  SET academic_year_active_id = p_id 
  WHERE id = p_school_id;

  PERFORM fn_write_audit_log(
    p_school_id,
    'ACADEMIC_YEAR_INITIALIZED',
    'academic_years',
    p_id,
    jsonb_build_object('name', p_name, 'semester', p_semester, 'initialized_by', v_person_id)
  );

  v_readiness_result := rpc_evaluate_school_readiness(p_school_id);

  RETURN jsonb_build_object(
    'success', true,
    'academic_year_id', p_id,
    'school_id', p_school_id,
    'readiness', v_readiness_result
  );
END;
$$;

-- ==============================================================================
-- 5. CREATE CLASSROOM & ASSIGN HOMEROOM TEACHER (HEADMASTER / SUPERADMIN)
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_create_classroom(
  p_id TEXT,
  p_school_id TEXT,
  p_academic_year_id TEXT,
  p_name TEXT,
  p_age_group TEXT,
  p_capacity INTEGER DEFAULT 15,
  p_homeroom_teacher_person_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id TEXT;
  v_readiness_result JSONB;
BEGIN
  v_person_id := get_auth_person_id();
  IF v_person_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  IF NOT auth_is_headmaster_of(p_school_id) AND NOT auth_is_superadmin() THEN
    RAISE EXCEPTION 'FORBIDDEN: Only Headmaster can configure classrooms';
  END IF;

  IF EXISTS (SELECT 1 FROM public.classes WHERE school_id = p_school_id AND academic_year_id = p_academic_year_id AND name = p_name) THEN
    RAISE EXCEPTION 'DUPLICATE_CLASS_NAME: Class % already exists for this academic year', p_name;
  END IF;

  INSERT INTO public.classes (
    id, school_id, academic_year_id, name, age_group, capacity, homeroom_teacher_id, is_active
  ) VALUES (
    p_id, p_school_id, p_academic_year_id, p_name, p_age_group, p_capacity, p_homeroom_teacher_person_id, TRUE
  );

  -- Ensure teacher profile exists if homeroom teacher assigned
  IF p_homeroom_teacher_person_id IS NOT NULL THEN
    INSERT INTO public.teacher_profiles (
      id, person_id, school_id, employment_type, is_active
    ) VALUES (
      'tch_' || substr(md5(random()::text), 1, 8),
      p_homeroom_teacher_person_id,
      p_school_id,
      'TETAP',
      TRUE
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  PERFORM fn_write_audit_log(
    p_school_id,
    'CLASSROOM_CREATED',
    'classes',
    p_id,
    jsonb_build_object('name', p_name, 'capacity', p_capacity, 'teacher', p_homeroom_teacher_person_id)
  );

  v_readiness_result := rpc_evaluate_school_readiness(p_school_id);

  RETURN jsonb_build_object(
    'success', true,
    'class_id', p_id,
    'school_id', p_school_id,
    'readiness', v_readiness_result
  );
END;
$$;

-- ==============================================================================
-- 6. ATOMIC STUDENT ADMISSION & PLACEMENT (HEADMASTER / SUPERADMIN)
-- ==============================================================================
CREATE OR REPLACE FUNCTION rpc_admit_and_place_student(
  p_school_id TEXT,
  p_target_class_id TEXT,
  p_child_person JSONB,
  p_student_info JSONB,
  p_guardian_person JSONB DEFAULT NULL,
  p_guardian_relation JSONB DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_auth_person_id TEXT;
  v_child_person_id TEXT;
  v_student_id TEXT;
  v_guardian_person_id TEXT;
  v_relation_id TEXT;
  v_class_capacity INTEGER;
  v_enrolled_count INTEGER;
  v_readiness_result JSONB;
BEGIN
  v_auth_person_id := get_auth_person_id();
  IF v_auth_person_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  IF NOT auth_is_headmaster_of(p_school_id) AND NOT auth_is_superadmin() THEN
    RAISE EXCEPTION 'FORBIDDEN: Only Headmaster can admit and place students';
  END IF;

  -- 1. Concurrency Guard: Lock class row and check capacity
  SELECT capacity INTO v_class_capacity 
  FROM public.classes 
  WHERE id = p_target_class_id AND school_id = p_school_id AND is_active = TRUE
  FOR UPDATE;

  IF NOT FOUND THEN RAISE EXCEPTION 'TARGET_CLASS_NOT_FOUND_OR_INACTIVE'; END IF;

  SELECT COUNT(*) INTO v_enrolled_count 
  FROM public.students 
  WHERE current_class_id = p_target_class_id AND status = 'ACTIVE';

  IF v_class_capacity IS NOT NULL AND v_enrolled_count >= v_class_capacity THEN
    RAISE EXCEPTION 'CLASS_CAPACITY_EXCEEDED: Maximum capacity of % reached', v_class_capacity;
  END IF;

  -- 2. Extract / Generate Child Person ID
  v_child_person_id := COALESCE(p_child_person->>'id', 'per_stu_' || substr(md5(random()::text), 1, 8));
  
  -- Upsert Child Person
  INSERT INTO public.persons (
    id, full_name, preferred_name, gender, birth_date, birth_place, address
  ) VALUES (
    v_child_person_id,
    p_child_person->>'full_name',
    COALESCE(p_child_person->>'preferred_name', p_child_person->>'full_name'),
    (p_child_person->>'gender')::TEXT,
    (p_child_person->>'birth_date')::DATE,
    p_child_person->>'birth_place',
    p_child_person->>'address'
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    preferred_name = EXCLUDED.preferred_name,
    address = EXCLUDED.address;

  -- 3. Upsert Student Entity & Place in Class
  v_student_id := COALESCE(p_student_info->>'id', 'stu_' || substr(md5(random()::text), 1, 8));
  
  INSERT INTO public.students (
    id, person_id, school_id, nis, nisn, current_class_id, blood_type, 
    allergies, special_needs_notes, enrollment_date, status
  ) VALUES (
    v_student_id,
    v_child_person_id,
    p_school_id,
    p_student_info->>'nis',
    p_student_info->>'nisn',
    p_target_class_id,
    p_student_info->>'blood_type',
    p_student_info->>'allergies',
    p_student_info->>'special_needs_notes',
    COALESCE((p_student_info->>'enrollment_date')::DATE, CURRENT_DATE),
    'ACTIVE'
  )
  ON CONFLICT (id) DO UPDATE SET
    current_class_id = EXCLUDED.current_class_id,
    status = 'ACTIVE';

  -- 4. Upsert Guardian & Relationship (if provided)
  IF p_guardian_person IS NOT NULL AND p_guardian_person->>'full_name' IS NOT NULL THEN
    v_guardian_person_id := COALESCE(p_guardian_person->>'id', 'per_grd_' || substr(md5(random()::text), 1, 8));
    
    INSERT INTO public.persons (
      id, full_name, preferred_name, gender, phone, address
    ) VALUES (
      v_guardian_person_id,
      p_guardian_person->>'full_name',
      COALESCE(p_guardian_person->>'preferred_name', p_guardian_person->>'full_name'),
      COALESCE((p_guardian_person->>'gender')::TEXT, 'MALE'),
      p_guardian_person->>'phone',
      p_guardian_person->>'address'
    )
    ON CONFLICT (id) DO UPDATE SET
      phone = EXCLUDED.phone;

    v_relation_id := 'rel_' || substr(md5(random()::text), 1, 8);
    INSERT INTO public.guardian_relationships (
      id, student_person_id, guardian_person_id, relationship_type, is_primary_contact, is_legal_guardian
    ) VALUES (
      v_relation_id,
      v_child_person_id,
      v_guardian_person_id,
      COALESCE(p_guardian_relation->>'relationship_type', 'GUARDIAN'),
      COALESCE((p_guardian_relation->>'is_primary_contact')::BOOLEAN, TRUE),
      COALESCE((p_guardian_relation->>'is_legal_guardian')::BOOLEAN, TRUE)
    )
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- 5. Audit Log Event
  PERFORM fn_write_audit_log(
    p_school_id,
    'STUDENT_ADMITTED_AND_PLACED',
    'students',
    v_student_id,
    jsonb_build_object(
      'student_id', v_student_id,
      'class_id', p_target_class_id,
      'child_name', p_child_person->>'full_name',
      'admitted_by', v_auth_person_id
    )
  );

  -- 6. Trigger Derived Readiness Re-evaluation
  v_readiness_result := rpc_evaluate_school_readiness(p_school_id);

  RETURN jsonb_build_object(
    'success', true,
    'student_id', v_student_id,
    'person_id', v_child_person_id,
    'class_id', p_target_class_id,
    'school_id', p_school_id,
    'readiness', v_readiness_result
  );
END;
$$;

-- ==============================================================================
-- 7. GRANTS FOR AUTHENTICATED USERS
-- ==============================================================================
REVOKE EXECUTE ON FUNCTION rpc_evaluate_school_readiness(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_evaluate_school_readiness(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION rpc_create_school(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_create_school(TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION rpc_assign_headmaster(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_assign_headmaster(TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION rpc_initialize_academic_year(TEXT, TEXT, TEXT, TEXT, DATE, DATE) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_initialize_academic_year(TEXT, TEXT, TEXT, TEXT, DATE, DATE) TO authenticated;

REVOKE EXECUTE ON FUNCTION rpc_create_classroom(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_create_classroom(TEXT, TEXT, TEXT, TEXT, TEXT, INTEGER, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION rpc_admit_and_place_student(TEXT, TEXT, JSONB, JSONB, JSONB, JSONB) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_admit_and_place_student(TEXT, TEXT, JSONB, JSONB, JSONB, JSONB) TO authenticated;
