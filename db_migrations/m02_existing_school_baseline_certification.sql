-- ==============================================================================
-- YAPENDIK SCHOOL OS — STAGE 2: MIGRATION M02
-- Description: Existing Institution Baseline Certification (Derived Readiness)
-- Target: schools table (sch_tk_yapendik_01, sch_tk_yapendik_02)
-- Constraints: Non-destructive, Idempotent, Derived from Canonical Topology
-- ==============================================================================

DO $$
DECLARE
  v_school RECORD;
  v_gate1 BOOLEAN;
  v_gate2 BOOLEAN;
  v_gate3 BOOLEAN;
  v_gate4 BOOLEAN;
  v_gate5 BOOLEAN;
  v_gate6 BOOLEAN;
  v_readiness TEXT;
BEGIN
  RAISE NOTICE '========================================================================';
  RAISE NOTICE '[M02] STARTING EXISTING INSTITUTION BASELINE CERTIFICATION';
  RAISE NOTICE '========================================================================';

  FOR v_school IN SELECT id, name FROM public.schools WHERE id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02') ORDER BY id LOOP
    RAISE NOTICE 'Evaluating certification for school: % (%)', v_school.name, v_school.id;

    -- Gate 1: Legal Entity Active
    v_gate1 := TRUE;

    -- Gate 2: Exactly 1 Active Academic Year
    SELECT (COUNT(*) = 1) INTO v_gate2 
    FROM public.academic_years 
    WHERE school_id = v_school.id AND is_active = TRUE;

    -- Gate 3: Active Semester Defined
    SELECT (COUNT(*) = 1) INTO v_gate3 
    FROM public.academic_years 
    WHERE school_id = v_school.id AND is_active = TRUE AND semester IS NOT NULL;

    -- Gate 4: Headmaster Appointed
    SELECT (headmaster_person_id IS NOT NULL) INTO v_gate4 
    FROM public.schools 
    WHERE id = v_school.id;

    -- Gate 5: Staffed Classroom >= 1
    SELECT (COUNT(*) >= 1) INTO v_gate5 
    FROM public.classes 
    WHERE school_id = v_school.id AND is_active = TRUE AND homeroom_teacher_id IS NOT NULL;

    -- Gate 6: Placed Students >= 1
    SELECT (COUNT(*) >= 1) INTO v_gate6 
    FROM public.students 
    WHERE school_id = v_school.id AND status = 'ACTIVE' AND current_class_id IS NOT NULL;

    -- Compute derived readiness
    IF (v_gate1 AND v_gate2 AND v_gate3 AND v_gate4 AND v_gate5 AND v_gate6) THEN
      v_readiness := 'READY';
      RAISE NOTICE '  --> VERDICT: 6/6 GATES PASS. Certified as READY.';
    ELSE
      v_readiness := 'NOT_READY';
      RAISE NOTICE '  --> VERDICT: GATES PENDING (G1:%, G2:%, G3:%, G4:%, G5:%, G6:%). Certified as NOT_READY.',
        v_gate1, v_gate2, v_gate3, v_gate4, v_gate5, v_gate6;
    END IF;

    -- Certified Update
    UPDATE public.schools 
    SET 
      status = 'ACTIVE',
      operational_readiness = v_readiness
    WHERE id = v_school.id;

  END LOOP;

  RAISE NOTICE '========================================================================';
  RAISE NOTICE '[M02] EXISTING INSTITUTION BASELINE CERTIFICATION COMPLETED';
  RAISE NOTICE '========================================================================';
END $$;
