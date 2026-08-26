-- ==============================================================================
-- YAPENDIK SCHOOL OS — STAGE 2: MIGRATION M04
-- Description: Fail-Closed Provisioning RLS Policies (Dual-Boundary Security)
-- Target: schools, academic_years, classes, students, guardian_relationships, profiles
-- Constraints: Fail-Closed, No Permissive Bypasses, Zero Regression on Stage 1
-- ==============================================================================

-- ==============================================================================
-- 1. SCHOOLS TABLE (DUAL-BOUNDARY LOCK)
-- ==============================================================================
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Schools are readable by authenticated users" ON public.schools;
CREATE POLICY "Schools are readable by authenticated users" 
  ON public.schools FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Only Superadmin can insert schools" ON public.schools;
CREATE POLICY "Only Superadmin can insert schools" 
  ON public.schools FOR INSERT TO authenticated 
  WITH CHECK (auth_is_superadmin());

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can update schools" ON public.schools;
CREATE POLICY "Only Superadmin and Headmaster can update schools" 
  ON public.schools FOR UPDATE TO authenticated 
  USING (auth_is_superadmin() OR auth_is_headmaster_of(id))
  WITH CHECK (auth_is_superadmin() OR auth_is_headmaster_of(id));

DROP POLICY IF EXISTS "Deny delete on schools" ON public.schools;
CREATE POLICY "Deny delete on schools" 
  ON public.schools FOR DELETE TO authenticated 
  USING (false);

-- ==============================================================================
-- 2. ACADEMIC YEARS TABLE (GOVERNED BOUNDARY)
-- ==============================================================================
ALTER TABLE public.academic_years ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Academic years are readable by authenticated users" ON public.academic_years;
CREATE POLICY "Academic years are readable by authenticated users" 
  ON public.academic_years FOR SELECT TO authenticated USING (
    auth_is_teacher_of_school(school_id) OR 
    auth_is_staff_of(school_id) OR 
    auth_is_governance() OR 
    auth_is_guardian_of_class((SELECT id FROM public.classes WHERE academic_year_id = academic_years.id LIMIT 1))
  );

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can insert academic_years" ON public.academic_years;
CREATE POLICY "Only Superadmin and Headmaster can insert academic_years" 
  ON public.academic_years FOR INSERT TO authenticated 
  WITH CHECK (auth_is_superadmin() OR auth_is_headmaster_of(school_id));

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can update academic_years" ON public.academic_years;
CREATE POLICY "Only Superadmin and Headmaster can update academic_years" 
  ON public.academic_years FOR UPDATE TO authenticated 
  USING (auth_is_superadmin() OR auth_is_headmaster_of(school_id))
  WITH CHECK (auth_is_superadmin() OR auth_is_headmaster_of(school_id));

DROP POLICY IF EXISTS "Deny delete on academic_years" ON public.academic_years;
CREATE POLICY "Deny delete on academic_years" 
  ON public.academic_years FOR DELETE TO authenticated 
  USING (false);

-- ==============================================================================
-- 3. CLASSES TABLE (ROMBEL BOUNDARY)
-- ==============================================================================
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Relevant actors can view classes" ON public.classes;
CREATE POLICY "Relevant actors can view classes" 
  ON public.classes FOR SELECT TO authenticated USING (
    auth_is_teacher_of_school(school_id) OR 
    auth_is_staff_of(school_id) OR 
    auth_is_governance() OR 
    auth_is_guardian_of_class(id)
  );

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can insert classes" ON public.classes;
CREATE POLICY "Only Superadmin and Headmaster can insert classes" 
  ON public.classes FOR INSERT TO authenticated 
  WITH CHECK (auth_is_superadmin() OR auth_is_headmaster_of(school_id));

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can update classes" ON public.classes;
CREATE POLICY "Only Superadmin and Headmaster can update classes" 
  ON public.classes FOR UPDATE TO authenticated 
  USING (auth_is_superadmin() OR auth_is_headmaster_of(school_id))
  WITH CHECK (auth_is_superadmin() OR auth_is_headmaster_of(school_id));

DROP POLICY IF EXISTS "Deny delete on classes" ON public.classes;
CREATE POLICY "Deny delete on classes" 
  ON public.classes FOR DELETE TO authenticated 
  USING (false);

-- ==============================================================================
-- 4. STUDENTS TABLE (ADMISSION & PLACEMENT BOUNDARY)
-- ==============================================================================
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Teachers, Staff, and Guardians can view students" ON public.students;
CREATE POLICY "Teachers, Staff, and Guardians can view students" 
  ON public.students FOR SELECT TO authenticated USING (
    auth_is_teacher_of_class(current_class_id) OR 
    auth_is_staff_of(school_id) OR 
    auth_is_guardian_of(id) OR 
    auth_is_governance()
  );

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can insert students" ON public.students;
CREATE POLICY "Only Superadmin and Headmaster can insert students" 
  ON public.students FOR INSERT TO authenticated 
  WITH CHECK (auth_is_superadmin() OR auth_is_headmaster_of(school_id));

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can update students" ON public.students;
CREATE POLICY "Only Superadmin and Headmaster can update students" 
  ON public.students FOR UPDATE TO authenticated 
  USING (auth_is_superadmin() OR auth_is_headmaster_of(school_id))
  WITH CHECK (auth_is_superadmin() OR auth_is_headmaster_of(school_id));

DROP POLICY IF EXISTS "Deny delete on students" ON public.students;
CREATE POLICY "Deny delete on students" 
  ON public.students FOR DELETE TO authenticated 
  USING (false);

-- ==============================================================================
-- 5. GUARDIAN RELATIONSHIPS TABLE
-- ==============================================================================
ALTER TABLE public.guardian_relationships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Relevant actors can view guardian_relationships" ON public.guardian_relationships;
CREATE POLICY "Relevant actors can view guardian_relationships" 
  ON public.guardian_relationships FOR SELECT TO authenticated USING (
    auth_is_owner(guardian_person_id) OR 
    auth_has_operational_access_to_student(student_person_id) OR 
    auth_is_governance()
  );

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can insert guardian_relationships" ON public.guardian_relationships;
CREATE POLICY "Only Superadmin and Headmaster can insert guardian_relationships" 
  ON public.guardian_relationships FOR INSERT TO authenticated 
  WITH CHECK (
    auth_is_superadmin() OR 
    auth_is_headmaster_of((SELECT school_id FROM public.students WHERE person_id = student_person_id LIMIT 1))
  );

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can update guardian_relationships" ON public.guardian_relationships;
CREATE POLICY "Only Superadmin and Headmaster can update guardian_relationships" 
  ON public.guardian_relationships FOR UPDATE TO authenticated 
  USING (
    auth_is_superadmin() OR 
    auth_is_headmaster_of((SELECT school_id FROM public.students WHERE person_id = student_person_id LIMIT 1))
  )
  WITH CHECK (
    auth_is_superadmin() OR 
    auth_is_headmaster_of((SELECT school_id FROM public.students WHERE person_id = student_person_id LIMIT 1))
  );

DROP POLICY IF EXISTS "Deny delete on guardian_relationships" ON public.guardian_relationships;
CREATE POLICY "Deny delete on guardian_relationships" 
  ON public.guardian_relationships FOR DELETE TO authenticated 
  USING (false);

-- ==============================================================================
-- 6. TEACHER & STAFF PROFILES TABLE
-- ==============================================================================
ALTER TABLE public.teacher_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Relevant actors can view teacher profiles" ON public.teacher_profiles;
CREATE POLICY "Relevant actors can view teacher profiles" 
  ON public.teacher_profiles FOR SELECT TO authenticated USING (
    auth_shares_school_with(person_id) OR auth_is_governance() OR auth_is_owner(person_id)
  );

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can insert teachers" ON public.teacher_profiles;
CREATE POLICY "Only Superadmin and Headmaster can insert teachers" 
  ON public.teacher_profiles FOR INSERT TO authenticated 
  WITH CHECK (auth_is_superadmin() OR auth_is_headmaster_of(school_id));

DROP POLICY IF EXISTS "Only Superadmin and Headmaster can update teachers" ON public.teacher_profiles;
CREATE POLICY "Only Superadmin and Headmaster can update teachers" 
  ON public.teacher_profiles FOR UPDATE TO authenticated 
  USING (auth_is_superadmin() OR auth_is_headmaster_of(school_id))
  WITH CHECK (auth_is_superadmin() OR auth_is_headmaster_of(school_id));

DROP POLICY IF EXISTS "Deny delete on teacher_profiles" ON public.teacher_profiles;
CREATE POLICY "Deny delete on teacher_profiles" 
  ON public.teacher_profiles FOR DELETE TO authenticated 
  USING (false);
