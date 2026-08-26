BEGIN;

-- ==============================================================================
-- YAPENDIK SCHOOL OS TK PILOT - RLS MIGRATION V2.1.5 (DEFINITIVE PRODUCTION BASELINE)
-- ==============================================================================
-- 1. RLS: Row-Level Contextual Authorization (WHO touches WHICH ROW)
-- 2. Trusted RPCs: Full State-Machine Suite (Placement, Draft, Submit, Approve, Publish)
-- 3. Database Triggers: Placement Guard (INSERT+UPDATE), Class-School Integrity, & Immutability
-- 4. Canonical Audit Writer: fn_write_audit_log (Centralized format)
-- 5. Concurrency Protection: Row-level lock (FOR UPDATE) & Immediate Session Flag Reset
-- 6. PostgreSQL Engine Correctness: Proper TG_OP handling for DELETE triggers
-- 7. Governed Privacy Projections: Isolated Safety View & Educational Roster

-- ==============================================================================
-- PHASE 1: GOVERNANCE INFRASTRUCTURE & BOOTSTRAP (PILOT SEED ONLY)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS governance_profiles (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'SUPERADMIN' CHECK (role IN ('SUPERADMIN', 'AUDITOR', 'SUPERVISOR')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);
CREATE INDEX IF NOT EXISTS idx_governance_profiles_person ON governance_profiles(person_id);

ALTER TABLE governance_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON governance_profiles FROM anon, authenticated;

-- PILOT SEED BOOTSTRAP: Dipindahkan ke file terpisah (pilot_seed_v2_1_5.sql)

-- ==============================================================================
-- PHASE 2: CANONICAL AUDIT WRITER (INTERNAL ONLY)
-- ==============================================================================
CREATE OR REPLACE FUNCTION fn_write_audit_log(
  p_school_id TEXT,
  p_action TEXT,
  p_resource TEXT,
  p_resource_id TEXT,
  p_details JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO audit_logs (id, school_id, user_id, action, resource, resource_id, details)
  VALUES (
    gen_random_uuid()::text,
    p_school_id,
    auth.uid()::text,
    p_action,
    p_resource,
    p_resource_id,
    p_details::text
  );
END;
$$;
REVOKE EXECUTE ON FUNCTION fn_write_audit_log(TEXT, TEXT, TEXT, TEXT, JSONB) FROM anon, authenticated;

-- ==============================================================================
-- PHASE 3: GRANULAR GOVERNANCE & CONTEXT HELPERS
-- ==============================================================================
-- 3.1. Governance Granular Roles
CREATE OR REPLACE FUNCTION auth_is_governance() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM governance_profiles 
    WHERE person_id = get_auth_person_id() AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION auth_is_superadmin() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM governance_profiles 
    WHERE person_id = get_auth_person_id() AND role = 'SUPERADMIN' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION auth_is_auditor() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM governance_profiles 
    WHERE person_id = get_auth_person_id() AND role = 'AUDITOR' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION auth_is_supervisor() RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM governance_profiles 
    WHERE person_id = get_auth_person_id() AND role = 'SUPERVISOR' AND is_active = true
  );
$$;

-- 3.2. School & Academic Context Helpers
CREATE OR REPLACE FUNCTION auth_is_headmaster_of(target_school_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE person_id = get_auth_person_id() AND school_id = target_school_id AND role = 'HEADMASTER' AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION auth_is_staff_of(target_school_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM staff_profiles
    WHERE person_id = get_auth_person_id() AND school_id = target_school_id AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION auth_is_teacher_of_class(target_class_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM classes c
    JOIN academic_years ay ON c.academic_year_id = ay.id
    JOIN teacher_profiles tp ON tp.school_id = c.school_id AND tp.person_id = get_auth_person_id()
    WHERE c.id = target_class_id 
      AND (c.homeroom_teacher_id = get_auth_person_id() OR c.co_teacher_id = get_auth_person_id())
      AND c.is_active = true
      AND ay.is_active = true
      AND tp.is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION auth_is_teacher_of_school(target_school_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM teacher_profiles
    WHERE person_id = get_auth_person_id() AND school_id = target_school_id AND is_active = true
  );
$$;

-- 3.3. Guardian & Personal Helpers
CREATE OR REPLACE FUNCTION auth_is_guardian_of(target_student_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM students s
    JOIN guardian_relationships gr ON gr.student_person_id = s.person_id
    WHERE s.id = target_student_id AND gr.guardian_person_id = get_auth_person_id()
  );
$$;

CREATE OR REPLACE FUNCTION auth_is_guardian_of_class(target_class_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM students s
    JOIN guardian_relationships gr ON gr.student_person_id = s.person_id
    WHERE s.current_class_id = target_class_id AND gr.guardian_person_id = get_auth_person_id()
  );
$$;

CREATE OR REPLACE FUNCTION auth_is_owner(target_person_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT target_person_id = get_auth_person_id();
$$;

CREATE OR REPLACE FUNCTION auth_is_guardian_of_person(target_person_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM guardian_relationships 
    WHERE student_person_id = target_person_id AND guardian_person_id = get_auth_person_id()
  );
$$;

CREATE OR REPLACE FUNCTION auth_has_operational_access_to_student(target_student_person_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM students s
    WHERE s.person_id = target_student_person_id
      AND (auth_is_teacher_of_class(s.current_class_id) OR auth_is_staff_of(s.school_id))
  );
$$;

-- 3.4. Specific Capability Helper for Medical/Safety Data Access
CREATE OR REPLACE FUNCTION auth_can_view_student_safety(target_student_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM students s
    WHERE s.id = target_student_id
      AND (
        auth_is_teacher_of_class(s.current_class_id)
        OR auth_is_headmaster_of(s.school_id)
        OR auth_is_guardian_of(s.id)
        OR auth_is_superadmin()
      )
  );
$$;

CREATE OR REPLACE FUNCTION auth_shares_school_with(target_person_id TEXT) RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM (
      SELECT school_id FROM teacher_profiles WHERE person_id = get_auth_person_id() AND is_active = true
      UNION SELECT school_id FROM staff_profiles WHERE person_id = get_auth_person_id() AND is_active = true
    ) auth_schools
    JOIN (
      SELECT school_id FROM teacher_profiles WHERE person_id = target_person_id
      UNION SELECT school_id FROM staff_profiles WHERE person_id = target_person_id
      UNION SELECT school_id FROM students WHERE person_id = target_person_id
    ) target_schools ON auth_schools.school_id = target_schools.school_id
  );
$$;

-- ==============================================================================
-- PHASE 4: HELPER GRANTS
-- ==============================================================================
REVOKE EXECUTE ON FUNCTION auth_is_governance() FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_governance() TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_superadmin() FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_superadmin() TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_auditor() FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_auditor() TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_supervisor() FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_supervisor() TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_headmaster_of(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_headmaster_of(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_staff_of(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_staff_of(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_teacher_of_class(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_teacher_of_class(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_teacher_of_school(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_teacher_of_school(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_guardian_of(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_guardian_of(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_guardian_of_class(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_guardian_of_class(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_owner(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_owner(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_is_guardian_of_person(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_is_guardian_of_person(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_has_operational_access_to_student(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_has_operational_access_to_student(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_can_view_student_safety(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_can_view_student_safety(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION auth_shares_school_with(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION auth_shares_school_with(TEXT) TO authenticated;

-- ==============================================================================
-- PHASE 5: ENABLE RLS & REVOKE ALL PRIVILEGES
-- ==============================================================================
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON schools FROM anon, authenticated;
GRANT SELECT ON schools TO authenticated;

ALTER TABLE academic_years ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON academic_years FROM anon, authenticated;
GRANT SELECT ON academic_years TO authenticated;

ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON classes FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON classes TO authenticated;

ALTER TABLE students ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON students FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON students TO authenticated;

ALTER TABLE guardian_relationships ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON guardian_relationships FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON guardian_relationships TO authenticated;

ALTER TABLE teacher_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON teacher_profiles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON teacher_profiles TO authenticated;

ALTER TABLE staff_profiles ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON staff_profiles FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON staff_profiles TO authenticated;

ALTER TABLE developmental_milestones ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON developmental_milestones FROM anon, authenticated;
GRANT SELECT ON developmental_milestones TO authenticated;

ALTER TABLE learning_activities ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON learning_activities FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON learning_activities TO authenticated;

ALTER TABLE observation_records ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON observation_records FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON observation_records TO authenticated;

ALTER TABLE daily_attendance ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON daily_attendance FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON daily_attendance TO authenticated;

ALTER TABLE guardian_notices ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON guardian_notices FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON guardian_notices TO authenticated;

ALTER TABLE student_progress_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON student_progress_reports FROM anon, authenticated;
GRANT SELECT ON student_progress_reports TO authenticated;

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON audit_logs FROM anon, authenticated;
GRANT SELECT ON audit_logs TO authenticated;

ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON persons FROM anon, authenticated;
GRANT SELECT, UPDATE ON persons TO authenticated;

-- ==============================================================================
-- PHASE 6: GRANULAR POLICIES
-- ==============================================================================
-- 6.1. Metadata
DROP POLICY IF EXISTS "Authenticated users can view schools" ON schools;
CREATE POLICY "Authenticated users can view schools" ON schools FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Relevant actors can view academic_years" ON academic_years;
CREATE POLICY "Relevant actors can view academic_years" ON academic_years FOR SELECT TO authenticated USING (
  auth_is_staff_of(school_id) OR auth_is_teacher_of_school(school_id) OR auth_is_governance()
);

DROP POLICY IF EXISTS "Authenticated users can view milestones" ON developmental_milestones;
CREATE POLICY "Authenticated users can view milestones" ON developmental_milestones FOR SELECT TO authenticated USING (true);

-- 6.2. Persons & Profiles
DROP POLICY IF EXISTS "Users can view relevant persons" ON persons;
CREATE POLICY "Users can view relevant persons" ON persons FOR SELECT TO authenticated USING (
  auth_is_owner(id) OR auth_shares_school_with(id) OR auth_is_guardian_of_person(id) OR auth_is_governance()
);

DROP POLICY IF EXISTS "Users can update their own profile" ON persons;
CREATE POLICY "Users can update their own profile" ON persons FOR UPDATE TO authenticated USING (auth_is_owner(id)) WITH CHECK (auth_is_owner(id));

DROP POLICY IF EXISTS "Governance actors can view governance profiles" ON governance_profiles;
CREATE POLICY "Governance actors can view governance profiles" ON governance_profiles FOR SELECT TO authenticated USING (auth_is_governance());

DROP POLICY IF EXISTS "Relevant actors can view staff profiles" ON staff_profiles;
CREATE POLICY "Relevant actors can view staff profiles" ON staff_profiles FOR SELECT TO authenticated USING (
  auth_shares_school_with(person_id) OR auth_is_governance() OR auth_is_owner(person_id)
);

DROP POLICY IF EXISTS "Headmaster and Superadmin can insert staff" ON staff_profiles;
CREATE POLICY "Headmaster and Superadmin can insert staff" ON staff_profiles FOR INSERT TO authenticated WITH CHECK (auth_is_headmaster_of(school_id) OR auth_is_superadmin());

DROP POLICY IF EXISTS "Headmaster and Superadmin can update staff" ON staff_profiles;
CREATE POLICY "Headmaster and Superadmin can update staff" ON staff_profiles FOR UPDATE TO authenticated USING (auth_is_headmaster_of(school_id) OR auth_is_superadmin()) WITH CHECK (auth_is_headmaster_of(school_id) OR auth_is_superadmin());

DROP POLICY IF EXISTS "Relevant actors can view teacher profiles" ON teacher_profiles;
CREATE POLICY "Relevant actors can view teacher profiles" ON teacher_profiles FOR SELECT TO authenticated USING (
  auth_shares_school_with(person_id) OR auth_is_governance() OR auth_is_owner(person_id)
);

DROP POLICY IF EXISTS "Headmaster and Superadmin can insert teachers" ON teacher_profiles;
CREATE POLICY "Headmaster and Superadmin can insert teachers" ON teacher_profiles FOR INSERT TO authenticated WITH CHECK (auth_is_headmaster_of(school_id) OR auth_is_superadmin());

DROP POLICY IF EXISTS "Headmaster and Superadmin can update teachers" ON teacher_profiles;
CREATE POLICY "Headmaster and Superadmin can update teachers" ON teacher_profiles FOR UPDATE TO authenticated USING (auth_is_headmaster_of(school_id) OR auth_is_superadmin()) WITH CHECK (auth_is_headmaster_of(school_id) OR auth_is_superadmin());

-- 6.3. Academic Context (Classes)
DROP POLICY IF EXISTS "Relevant actors can view classes" ON classes;
CREATE POLICY "Relevant actors can view classes" ON classes FOR SELECT TO authenticated USING (
  auth_is_teacher_of_school(school_id) OR 
  auth_is_staff_of(school_id) OR 
  auth_is_governance() OR 
  auth_is_guardian_of_class(id)
);

DROP POLICY IF EXISTS "Headmaster and Superadmin can insert classes" ON classes;
CREATE POLICY "Headmaster and Superadmin can insert classes" ON classes FOR INSERT TO authenticated WITH CHECK (auth_is_headmaster_of(school_id) OR auth_is_superadmin());

DROP POLICY IF EXISTS "Headmaster and Superadmin can update classes" ON classes;
CREATE POLICY "Headmaster and Superadmin can update classes" ON classes FOR UPDATE TO authenticated USING (auth_is_headmaster_of(school_id) OR auth_is_superadmin()) WITH CHECK (auth_is_headmaster_of(school_id) OR auth_is_superadmin());

-- 6.4. Students & Guardians
DROP POLICY IF EXISTS "Teachers, Staff, and Guardians can view students" ON students;
CREATE POLICY "Teachers, Staff, and Guardians can view students" ON students FOR SELECT TO authenticated USING (
  auth_is_teacher_of_class(current_class_id) OR auth_is_staff_of(school_id) OR auth_is_guardian_of(id) OR auth_is_governance()
);

DROP POLICY IF EXISTS "Headmaster and Superadmin can insert students" ON students;
CREATE POLICY "Headmaster and Superadmin can insert students" ON students FOR INSERT TO authenticated WITH CHECK (auth_is_headmaster_of(school_id) OR auth_is_superadmin());

DROP POLICY IF EXISTS "Headmaster and Superadmin can update students" ON students;
CREATE POLICY "Headmaster and Superadmin can update students" ON students FOR UPDATE TO authenticated USING (auth_is_headmaster_of(school_id) OR auth_is_superadmin()) WITH CHECK (auth_is_headmaster_of(school_id) OR auth_is_superadmin());

DROP POLICY IF EXISTS "Relevant actors can view guardian_relationships" ON guardian_relationships;
CREATE POLICY "Relevant actors can view guardian_relationships" ON guardian_relationships FOR SELECT TO authenticated USING (
  auth_is_owner(guardian_person_id) OR 
  auth_has_operational_access_to_student(student_person_id) OR 
  auth_is_governance()
);

DROP POLICY IF EXISTS "Headmaster and Superadmin can insert guardian_relationships" ON guardian_relationships;
CREATE POLICY "Headmaster and Superadmin can insert guardian_relationships" ON guardian_relationships FOR INSERT TO authenticated WITH CHECK (
  auth_is_headmaster_of((SELECT school_id FROM students WHERE person_id = student_person_id LIMIT 1)) OR auth_is_superadmin()
);

DROP POLICY IF EXISTS "Headmaster and Superadmin can update guardian_relationships" ON guardian_relationships;
CREATE POLICY "Headmaster and Superadmin can update guardian_relationships" ON guardian_relationships FOR UPDATE TO authenticated USING (
  auth_is_headmaster_of((SELECT school_id FROM students WHERE person_id = student_person_id LIMIT 1)) OR auth_is_superadmin()
) WITH CHECK (
  auth_is_headmaster_of((SELECT school_id FROM students WHERE person_id = student_person_id LIMIT 1)) OR auth_is_superadmin()
);

-- 6.5. Daily Operations
DROP POLICY IF EXISTS "Relevant actors can view learning_activities" ON learning_activities;
CREATE POLICY "Relevant actors can view learning_activities" ON learning_activities FOR SELECT TO authenticated USING (
  auth_is_teacher_of_class(class_id) OR auth_is_staff_of(school_id) OR auth_is_governance()
);

DROP POLICY IF EXISTS "Teachers can insert learning_activities" ON learning_activities;
CREATE POLICY "Teachers can insert learning_activities" ON learning_activities FOR INSERT TO authenticated WITH CHECK (auth_is_teacher_of_class(class_id));

DROP POLICY IF EXISTS "Teachers can update learning_activities" ON learning_activities;
CREATE POLICY "Teachers can update learning_activities" ON learning_activities FOR UPDATE TO authenticated USING (auth_is_teacher_of_class(class_id)) WITH CHECK (auth_is_teacher_of_class(class_id));

DROP POLICY IF EXISTS "Relevant actors can view daily_attendance" ON daily_attendance;
CREATE POLICY "Relevant actors can view daily_attendance" ON daily_attendance FOR SELECT TO authenticated USING (
  auth_is_teacher_of_class(class_id) OR auth_is_staff_of(school_id) OR auth_is_guardian_of(student_id) OR auth_is_governance()
);

DROP POLICY IF EXISTS "Teachers can insert daily_attendance" ON daily_attendance;
CREATE POLICY "Teachers can insert daily_attendance" ON daily_attendance FOR INSERT TO authenticated WITH CHECK (
  auth_is_teacher_of_class(class_id) AND recorded_by_person_id = get_auth_person_id()
);

DROP POLICY IF EXISTS "Teachers can update daily_attendance" ON daily_attendance;
CREATE POLICY "Teachers can update daily_attendance" ON daily_attendance FOR UPDATE TO authenticated USING (
  auth_is_teacher_of_class(class_id) AND recorded_by_person_id = get_auth_person_id()
) WITH CHECK (
  auth_is_teacher_of_class(class_id) AND recorded_by_person_id = get_auth_person_id()
);

-- 6.6. Observations
DROP POLICY IF EXISTS "Relevant actors can view observations" ON observation_records;
CREATE POLICY "Relevant actors can view observations" ON observation_records FOR SELECT TO authenticated USING (
  auth_is_teacher_of_class(class_id) OR 
  auth_is_staff_of(school_id) OR 
  auth_is_governance() OR 
  (auth_is_guardian_of(student_id) AND is_confidential_to_staff = false AND shared_with_guardian = true)
);

DROP POLICY IF EXISTS "Teachers can insert observations" ON observation_records;
CREATE POLICY "Teachers can insert observations" ON observation_records FOR INSERT TO authenticated WITH CHECK (
  auth_is_teacher_of_class(class_id) AND observer_person_id = get_auth_person_id()
);

DROP POLICY IF EXISTS "Teachers can update observations" ON observation_records;
CREATE POLICY "Teachers can update observations" ON observation_records FOR UPDATE TO authenticated USING (
  auth_is_teacher_of_class(class_id) AND observer_person_id = get_auth_person_id()
) WITH CHECK (
  auth_is_teacher_of_class(class_id) AND observer_person_id = get_auth_person_id()
);

-- 6.7. Reports (Read-Only via Client; Mutated exclusively via RPC)
DROP POLICY IF EXISTS "Relevant actors can view reports" ON student_progress_reports;
CREATE POLICY "Relevant actors can view reports" ON student_progress_reports FOR SELECT TO authenticated USING (
  auth_is_governance() OR
  auth_is_staff_of(school_id) OR
  (auth_is_teacher_of_school(school_id) AND EXISTS(SELECT 1 FROM students s WHERE s.id = student_id AND auth_is_teacher_of_class(s.current_class_id))) OR
  (status IN ('APPROVED', 'PUBLISHED') AND auth_is_guardian_of(student_id))
);

DROP POLICY IF EXISTS "Deny insert reports" ON student_progress_reports;
CREATE POLICY "Deny insert reports" ON student_progress_reports FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "Deny update reports" ON student_progress_reports;
CREATE POLICY "Deny update reports" ON student_progress_reports FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Deny delete reports" ON student_progress_reports;
CREATE POLICY "Deny delete reports" ON student_progress_reports FOR DELETE TO authenticated USING (false);

-- 6.8. Notices & Audit Logs
DROP POLICY IF EXISTS "Involved actors can view notices" ON guardian_notices;
CREATE POLICY "Involved actors can view notices" ON guardian_notices FOR SELECT TO authenticated USING (
  author_person_id = get_auth_person_id() OR 
  recipient_person_id = get_auth_person_id() OR 
  auth_is_governance() OR 
  auth_is_staff_of(school_id)
);

DROP POLICY IF EXISTS "Actors can insert notices" ON guardian_notices;
CREATE POLICY "Actors can insert notices" ON guardian_notices FOR INSERT TO authenticated WITH CHECK (
  author_person_id = get_auth_person_id()
);

DROP POLICY IF EXISTS "Actors can update notices" ON guardian_notices;
CREATE POLICY "Actors can update notices" ON guardian_notices FOR UPDATE TO authenticated USING (
  author_person_id = get_auth_person_id()
) WITH CHECK (
  author_person_id = get_auth_person_id()
);

DROP POLICY IF EXISTS "Relevant actors can view audit_logs" ON audit_logs;
CREATE POLICY "Relevant actors can view audit_logs" ON audit_logs FOR SELECT TO authenticated USING (
  auth_is_governance() OR auth_is_headmaster_of(school_id)
);

DROP POLICY IF EXISTS "Deny insert audit_logs" ON audit_logs;
CREATE POLICY "Deny insert audit_logs" ON audit_logs FOR INSERT TO authenticated WITH CHECK (false);

DROP POLICY IF EXISTS "Deny update audit_logs" ON audit_logs;
CREATE POLICY "Deny update audit_logs" ON audit_logs FOR UPDATE TO authenticated USING (false) WITH CHECK (false);

DROP POLICY IF EXISTS "Deny delete audit_logs" ON audit_logs;
CREATE POLICY "Deny delete audit_logs" ON audit_logs FOR DELETE TO authenticated USING (false);

-- ==============================================================================
-- PHASE 7: DOMAIN TRIGGERS & INVARIANTS
-- ==============================================================================
-- 7.1. Cross-School Consistency Trigger for Classes
CREATE OR REPLACE FUNCTION trg_verify_class_academic_year_school()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_ay_school_id TEXT;
  v_ay_active BOOLEAN;
BEGIN
  IF NEW.academic_year_id IS NOT NULL THEN
    SELECT school_id, is_active INTO v_ay_school_id, v_ay_active
    FROM academic_years
    WHERE id = NEW.academic_year_id;

    IF v_ay_school_id IS DISTINCT FROM NEW.school_id THEN
      RAISE EXCEPTION 'INTEGRITY_VIOLATION: Class school_id (%) does not match Academic Year school_id (%)',
        NEW.school_id, v_ay_school_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_class_school_consistency ON classes;
CREATE TRIGGER trg_class_school_consistency
BEFORE INSERT OR UPDATE ON classes
FOR EACH ROW EXECUTE FUNCTION trg_verify_class_academic_year_school();

-- 7.2. Gated Student Class Placement Trigger (Guards both INSERT and UPDATE)
CREATE OR REPLACE FUNCTION trg_guard_student_class_placement()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Gated INSERT & UPDATE: current_class_id modification is prohibited for direct client queries
  -- Authorized ONLY via SECURITY DEFINER RPCs (where current_user becomes function owner)
  IF (TG_OP = 'INSERT' AND NEW.current_class_id IS NOT NULL) OR 
     (TG_OP = 'UPDATE' AND OLD.current_class_id IS DISTINCT FROM NEW.current_class_id) THEN
    IF current_user IN ('anon', 'authenticated') THEN
      RAISE EXCEPTION 'FORBIDDEN: Direct modification of current_class_id is prohibited. Use rpc_place_student_in_class().';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_student_placement_guard ON students;
CREATE TRIGGER trg_student_placement_guard
BEFORE INSERT OR UPDATE ON students
FOR EACH ROW EXECUTE FUNCTION trg_guard_student_class_placement();

-- 7.3. Published Report Immutability Trigger (Engine-correct handling for UPDATE and DELETE)
CREATE OR REPLACE FUNCTION trg_enforce_published_report_immutability()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF (TG_OP = 'UPDATE' AND OLD.status = 'PUBLISHED') OR (TG_OP = 'DELETE' AND OLD.status = 'PUBLISHED') THEN
    RAISE EXCEPTION 'IMMUTABLE_RECORD: Progress reports with status PUBLISHED cannot be modified or deleted.';
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

DROP TRIGGER IF EXISTS trg_report_published_immutability ON student_progress_reports;
CREATE TRIGGER trg_report_published_immutability
BEFORE UPDATE OR DELETE ON student_progress_reports
FOR EACH ROW EXECUTE FUNCTION trg_enforce_published_report_immutability();

-- 7.4. Guardian Relationship Integrity Trigger
CREATE OR REPLACE FUNCTION trg_verify_guardian_relationship()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM students WHERE person_id = NEW.student_person_id) THEN
    RAISE EXCEPTION 'INTEGRITY_VIOLATION: student_person_id must belong to a registered student in the students table.';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_guardian_relationship_integrity ON guardian_relationships;
CREATE TRIGGER trg_guardian_relationship_integrity
BEFORE INSERT OR UPDATE ON guardian_relationships
FOR EACH ROW EXECUTE FUNCTION trg_verify_guardian_relationship();

-- ==============================================================================
-- PHASE 8: TRUSTED RPC MUTATIONS (FULL LIFECYCLE & CONTEXT-VERIFIED)
-- ==============================================================================
-- 8.1. Trusted Class Placement RPC (Concurrency-safe with FOR UPDATE lock & immediate reset)
CREATE OR REPLACE FUNCTION rpc_place_student_in_class(
  p_student_id TEXT,
  p_target_class_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id TEXT;
  v_student_school_id TEXT;
  v_class_school_id TEXT;
  v_class_is_active BOOLEAN;
  v_ay_is_active BOOLEAN;
  v_class_capacity INTEGER;
  v_enrolled_count INTEGER;
BEGIN
  v_person_id := get_auth_person_id();
  IF v_person_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  SELECT school_id INTO v_student_school_id FROM students WHERE id = p_student_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'STUDENT_NOT_FOUND'; END IF;

  IF NOT auth_is_headmaster_of(v_student_school_id) AND NOT auth_is_superadmin() THEN
    RAISE EXCEPTION 'FORBIDDEN: Only Headmaster or Superadmin can assign class placement';
  END IF;

  IF p_target_class_id IS NOT NULL THEN
    -- Concurrency Guard: Lock the class row to prevent race conditions on capacity
    SELECT c.school_id, c.is_active, ay.is_active, c.capacity
    INTO v_class_school_id, v_class_is_active, v_ay_is_active, v_class_capacity
    FROM classes c
    JOIN academic_years ay ON c.academic_year_id = ay.id
    WHERE c.id = p_target_class_id
    FOR UPDATE;

    IF NOT FOUND THEN RAISE EXCEPTION 'CLASS_NOT_FOUND'; END IF;
    IF v_student_school_id <> v_class_school_id THEN RAISE EXCEPTION 'SCHOOL_MISMATCH'; END IF;
    IF NOT v_class_is_active OR NOT v_ay_is_active THEN RAISE EXCEPTION 'CLASS_OR_YEAR_INACTIVE'; END IF;

    -- Concurrency-safe capacity count
    SELECT COUNT(*) INTO v_enrolled_count 
    FROM students 
    WHERE current_class_id = p_target_class_id AND status = 'ACTIVE' AND id <> p_student_id;

    IF v_class_capacity IS NOT NULL AND v_enrolled_count >= v_class_capacity THEN
      RAISE EXCEPTION 'CLASS_CAPACITY_EXCEEDED: Class % has reached maximum capacity of %', p_target_class_id, v_class_capacity;
    END IF;
  END IF;

  -- Update student class directly
  -- (Trigger will allow this because this RPC runs as SECURITY DEFINER and current_user is not anon/authenticated)
  UPDATE students
  SET current_class_id = p_target_class_id
  WHERE id = p_student_id;

  PERFORM fn_write_audit_log(
    v_student_school_id,
    'STUDENT_PLACEMENT',
    'students',
    p_student_id,
    jsonb_build_object('placed_by_person_id', v_person_id, 'class_id', p_target_class_id)
  );

  RETURN jsonb_build_object('success', true, 'student_id', p_student_id, 'class_id', p_target_class_id);
END;
$$;

-- 8.2. Trusted Progress Report Draft RPC (With strict School-Student-AcademicYear validation)
CREATE OR REPLACE FUNCTION rpc_save_progress_report_draft(
  p_report_id TEXT,
  p_school_id TEXT,
  p_student_id TEXT,
  p_academic_year_id TEXT,
  p_semester TEXT,
  p_summary_notes JSONB DEFAULT '[]'::jsonb,
  p_physical_health_notes JSONB DEFAULT '{}'::jsonb,
  p_attendance_summary JSONB DEFAULT '{}'::jsonb,
  p_homeroom_feedback TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id TEXT;
  v_student_school_id TEXT;
  v_student_class_id TEXT;
  v_ay_school_id TEXT;
  v_ay_is_active BOOLEAN;
  v_current_status TEXT;
BEGIN
  v_person_id := get_auth_person_id();
  IF v_person_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  -- 1. Validate Student Context
  SELECT school_id, current_class_id INTO v_student_school_id, v_student_class_id
  FROM students WHERE id = p_student_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'STUDENT_NOT_FOUND'; END IF;
  IF v_student_school_id <> p_school_id THEN RAISE EXCEPTION 'STUDENT_SCHOOL_MISMATCH'; END IF;

  -- 2. Validate Academic Year Context
  SELECT school_id, is_active INTO v_ay_school_id, v_ay_is_active
  FROM academic_years WHERE id = p_academic_year_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'ACADEMIC_YEAR_NOT_FOUND'; END IF;
  IF v_ay_school_id <> p_school_id THEN RAISE EXCEPTION 'ACADEMIC_YEAR_SCHOOL_MISMATCH'; END IF;
  IF NOT v_ay_is_active THEN RAISE EXCEPTION 'ACADEMIC_YEAR_INACTIVE'; END IF;

  -- 3. Authorize Caller (Must be assigned teacher of student's class or superadmin)
  IF NOT auth_is_teacher_of_class(v_student_class_id) AND NOT auth_is_superadmin() THEN
    RAISE EXCEPTION 'FORBIDDEN: Only the assigned teacher can create or update report drafts';
  END IF;

  -- 4. Check existing status and strictly assert IDOR / context matches
  DECLARE
    v_existing_student_id TEXT;
    v_existing_school_id TEXT;
    v_existing_ay_id TEXT;
    v_existing_semester TEXT;
  BEGIN
    SELECT status, student_id, school_id, academic_year_id, semester 
    INTO v_current_status, v_existing_student_id, v_existing_school_id, v_existing_ay_id, v_existing_semester
    FROM student_progress_reports WHERE id = p_report_id;

    IF FOUND THEN
      IF v_existing_student_id <> p_student_id OR v_existing_school_id <> p_school_id OR v_existing_ay_id <> p_academic_year_id OR v_existing_semester <> p_semester THEN
        RAISE EXCEPTION 'IDOR_ATTEMPT: Report context does not match provided arguments';
      END IF;

      IF v_current_status <> 'DRAFT' THEN
        RAISE EXCEPTION 'INVALID_STATE: Only DRAFT reports can be edited. Current status: %', v_current_status;
      END IF;

    UPDATE student_progress_reports
    SET summary_notes = p_summary_notes,
        physical_health_notes = p_physical_health_notes,
        attendance_summary = p_attendance_summary,
        homeroom_feedback = p_homeroom_feedback,
        evaluated_by_person_id = v_person_id,
        evaluated_at = timezone('utc'::text, now())
    WHERE id = p_report_id;
  ELSE
    INSERT INTO student_progress_reports (
      id, school_id, student_id, academic_year_id, semester,
      evaluated_by_person_id, evaluated_at, summary_notes,
      physical_health_notes, attendance_summary, homeroom_feedback, status
    ) VALUES (
      p_report_id, p_school_id, p_student_id, p_academic_year_id, p_semester,
      v_person_id, timezone('utc'::text, now()), p_summary_notes,
      p_physical_health_notes, p_attendance_summary, p_homeroom_feedback, 'DRAFT'
    );
  END IF;
  END;

  RETURN jsonb_build_object('success', true, 'report_id', p_report_id, 'status', 'DRAFT');
END;
$$;

-- 8.3. Trusted Progress Report Submission RPC (Teacher: DRAFT -> READY_FOR_REVIEW)
CREATE OR REPLACE FUNCTION rpc_submit_report_for_review(
  p_report_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id TEXT;
  v_school_id TEXT;
  v_student_id TEXT;
  v_student_class_id TEXT;
  v_current_status TEXT;
BEGIN
  v_person_id := get_auth_person_id();
  IF v_person_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  DECLARE
    v_ay_is_active BOOLEAN;
  BEGIN
    SELECT spr.school_id, spr.student_id, spr.status, ay.is_active 
    INTO v_school_id, v_student_id, v_current_status, v_ay_is_active
    FROM student_progress_reports spr
    JOIN academic_years ay ON spr.academic_year_id = ay.id
    WHERE spr.id = p_report_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'REPORT_NOT_FOUND'; END IF;
    IF NOT v_ay_is_active THEN RAISE EXCEPTION 'ACADEMIC_YEAR_INACTIVE: Cannot mutate reports for closed academic years'; END IF;
  END;

  SELECT current_class_id INTO v_student_class_id FROM students WHERE id = v_student_id;

  IF NOT auth_is_teacher_of_class(v_student_class_id) AND NOT auth_is_superadmin() THEN
    RAISE EXCEPTION 'FORBIDDEN: Only the assigned teacher can submit reports for review';
  END IF;

  IF v_current_status <> 'DRAFT' THEN
    RAISE EXCEPTION 'INVALID_STATE: Report must be in DRAFT status to submit. Current: %', v_current_status;
  END IF;

  UPDATE student_progress_reports
  SET status = 'READY_FOR_REVIEW'
  WHERE id = p_report_id;

  PERFORM fn_write_audit_log(
    v_school_id,
    'SUBMIT_REPORT_REVIEW',
    'student_progress_reports',
    p_report_id,
    jsonb_build_object('submitted_by_person_id', v_person_id)
  );

  RETURN jsonb_build_object('success', true, 'report_id', p_report_id, 'new_status', 'READY_FOR_REVIEW');
END;
$$;

-- 8.4. Trusted Progress Report Approval RPC (Headmaster: READY_FOR_REVIEW -> APPROVED)
CREATE OR REPLACE FUNCTION rpc_approve_progress_report(
  p_report_id TEXT,
  p_approval_notes TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id TEXT;
  v_school_id TEXT;
  v_current_status TEXT;
BEGIN
  v_person_id := get_auth_person_id();
  IF v_person_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  DECLARE
    v_ay_is_active BOOLEAN;
  BEGIN
    SELECT spr.school_id, spr.status, ay.is_active 
    INTO v_school_id, v_current_status, v_ay_is_active
    FROM student_progress_reports spr
    JOIN academic_years ay ON spr.academic_year_id = ay.id
    WHERE spr.id = p_report_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'REPORT_NOT_FOUND'; END IF;
    IF NOT v_ay_is_active THEN RAISE EXCEPTION 'ACADEMIC_YEAR_INACTIVE: Cannot mutate reports for closed academic years'; END IF;
  END;

  IF NOT auth_is_headmaster_of(v_school_id) AND NOT auth_is_superadmin() THEN
    RAISE EXCEPTION 'FORBIDDEN: Only active Headmaster or Superadmin can approve reports';
  END IF;

  IF v_current_status <> 'READY_FOR_REVIEW' THEN
    RAISE EXCEPTION 'INVALID_STATE: Report must be in READY_FOR_REVIEW status to be approved. Current status: %', v_current_status;
  END IF;

  UPDATE student_progress_reports
  SET status = 'APPROVED',
      headmaster_approval_date = timezone('utc'::text, now()),
      homeroom_feedback = COALESCE(p_approval_notes, homeroom_feedback)
  WHERE id = p_report_id;

  PERFORM fn_write_audit_log(
    v_school_id,
    'APPROVE_REPORT',
    'student_progress_reports',
    p_report_id,
    jsonb_build_object('approved_by_person_id', v_person_id, 'notes', p_approval_notes)
  );

  RETURN jsonb_build_object('success', true, 'report_id', p_report_id, 'new_status', 'APPROVED');
END;
$$;

-- 8.5. Trusted Progress Report Publish RPC (Headmaster: APPROVED -> PUBLISHED)
CREATE OR REPLACE FUNCTION rpc_publish_progress_report(
  p_report_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id TEXT;
  v_school_id TEXT;
  v_current_status TEXT;
BEGIN
  v_person_id := get_auth_person_id();
  IF v_person_id IS NULL THEN RAISE EXCEPTION 'UNAUTHENTICATED'; END IF;

  DECLARE
    v_ay_is_active BOOLEAN;
  BEGIN
    SELECT spr.school_id, spr.status, ay.is_active 
    INTO v_school_id, v_current_status, v_ay_is_active
    FROM student_progress_reports spr
    JOIN academic_years ay ON spr.academic_year_id = ay.id
    WHERE spr.id = p_report_id;

    IF NOT FOUND THEN RAISE EXCEPTION 'REPORT_NOT_FOUND'; END IF;
    IF NOT v_ay_is_active THEN RAISE EXCEPTION 'ACADEMIC_YEAR_INACTIVE: Cannot mutate reports for closed academic years'; END IF;
  END;

  IF NOT auth_is_headmaster_of(v_school_id) AND NOT auth_is_superadmin() THEN
    RAISE EXCEPTION 'FORBIDDEN: Only active Headmaster or Superadmin can publish reports';
  END IF;

  IF v_current_status <> 'APPROVED' THEN
    RAISE EXCEPTION 'INVALID_STATE: Report must be in APPROVED status to be published. Current: %', v_current_status;
  END IF;

  UPDATE student_progress_reports
  SET status = 'PUBLISHED'
  WHERE id = p_report_id;

  PERFORM fn_write_audit_log(
    v_school_id,
    'PUBLISH_REPORT',
    'student_progress_reports',
    p_report_id,
    jsonb_build_object('published_by_person_id', v_person_id)
  );

  RETURN jsonb_build_object('success', true, 'report_id', p_report_id, 'new_status', 'PUBLISHED');
END;
$$;

-- 8.6. Governed Client Audit Event Logger (Non-spoofable authenticated session derivation)
CREATE OR REPLACE FUNCTION rpc_log_client_event(
  p_school_id TEXT,
  p_action TEXT,
  p_resource TEXT,
  p_resource_id TEXT,
  p_details TEXT DEFAULT ''
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_person_id TEXT;
  v_person_name TEXT;
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED';
  END IF;

  v_person_id := get_auth_person_id();
  SELECT full_name INTO v_person_name FROM persons WHERE id = v_person_id;

  IF auth_is_superadmin() THEN
    v_role := 'YAPENDIK_SUPERADMIN';
  ELSIF auth_is_headmaster_of(p_school_id) THEN
    v_role := 'HEADMASTER';
  ELSIF auth_is_teacher_of_school(p_school_id) THEN
    v_role := 'TEACHER';
  ELSIF auth_is_staff_of(p_school_id) THEN
    v_role := 'STAFF';
  ELSE
    v_role := 'GUARDIAN';
  END IF;

  INSERT INTO audit_logs (id, school_id, user_id, person_name, role, action, resource, resource_id, details, timestamp)
  VALUES (
    gen_random_uuid()::text,
    p_school_id,
    auth.uid()::text,
    COALESCE(v_person_name, 'Authenticated User'),
    v_role,
    p_action,
    p_resource,
    p_resource_id,
    p_details,
    timezone('utc'::text, now())
  );

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Ensure deterministic attendance constraint exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_daily_attendance_record'
  ) THEN
    ALTER TABLE daily_attendance ADD CONSTRAINT uq_daily_attendance_record UNIQUE (school_id, class_id, student_id, date);
  END IF;
END $$;

REVOKE EXECUTE ON FUNCTION rpc_place_student_in_class(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_place_student_in_class(TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION rpc_save_progress_report_draft(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_save_progress_report_draft(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, JSONB, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION rpc_submit_report_for_review(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_submit_report_for_review(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION rpc_approve_progress_report(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_approve_progress_report(TEXT, TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION rpc_publish_progress_report(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_publish_progress_report(TEXT) TO authenticated;

REVOKE EXECUTE ON FUNCTION rpc_log_client_event(TEXT, TEXT, TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION rpc_log_client_event(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- ==============================================================================
-- PHASE 9: GOVERNED PRIVACY PROJECTIONS (VIEWS)
-- ==============================================================================
-- 9.1. Basic Educational Roster
CREATE OR REPLACE VIEW v_teacher_class_roster
WITH (security_invoker = true)
AS
SELECT 
  s.id AS student_id,
  s.school_id,
  s.current_class_id,
  s.nis,
  s.status,
  p.full_name AS student_name,
  p.gender,
  p.birth_date
FROM students s
JOIN persons p ON s.person_id = p.id
WHERE auth_is_teacher_of_class(s.current_class_id);

-- 9.2. Specific Student Safety & Health Profile (Capability-Governed)
CREATE OR REPLACE VIEW v_student_safety_profile
WITH (security_invoker = true)
AS
SELECT 
  s.id AS student_id,
  s.school_id,
  s.current_class_id,
  p.full_name AS student_name,
  s.blood_type,
  s.allergies,
  s.special_needs_notes
FROM students s
JOIN persons p ON s.person_id = p.id
WHERE auth_can_view_student_safety(s.id);

-- 9.3. Guardian Child Profile
CREATE OR REPLACE VIEW v_guardian_student_profile
WITH (security_invoker = true)
AS
SELECT 
  s.id AS student_id,
  p.full_name AS child_name,
  p.birth_date,
  s.blood_type,
  s.allergies,
  c.name AS class_name
FROM students s
JOIN persons p ON s.person_id = p.id
JOIN classes c ON s.current_class_id = c.id
WHERE auth_is_guardian_of(s.id);

REVOKE ALL ON v_teacher_class_roster FROM anon;
GRANT SELECT ON v_teacher_class_roster TO authenticated;

REVOKE ALL ON v_student_safety_profile FROM anon;
GRANT SELECT ON v_student_safety_profile TO authenticated;

REVOKE ALL ON v_guardian_student_profile FROM anon;
GRANT SELECT ON v_guardian_student_profile TO authenticated;

-- ==============================================================================
-- PHASE 10: REMOVE PUBLIC FULL ACCESS FOR PILOT
-- ==============================================================================
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON persons;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON schools;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON academic_years;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON classes;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON students;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON guardian_relationships;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON teacher_profiles;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON staff_profiles;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON developmental_milestones;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON learning_activities;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON observation_records;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON daily_attendance;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON guardian_notices;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON student_progress_reports;
DROP POLICY IF EXISTS "Public Full Access For Pilot" ON audit_logs;

COMMIT;
