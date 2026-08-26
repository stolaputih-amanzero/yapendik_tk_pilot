-- ==============================================================================
-- YAPENDIK SCHOOL OS TK PILOT - MIGRATION M07 ROLLBACK (DOWN SCRIPT)
-- STAGE 5 / ADR-01: NON-DESTRUCTIVE ROLLBACK POC
-- ==============================================================================
-- WARNING: Future down-scripts for tables with historical data MUST NOT use DROP TABLE. Use ARCHIVE quarantine instead (ADR-01).
-- In this pilot bootstrap phase, M07 tables are empty/ephemeral, so managed DROP is authorized.
-- ==============================================================================

BEGIN;

-- 1. Revoke & Drop Governed RPCs
REVOKE ALL ON FUNCTION public.rpc_verify_closed_loop_condition(TEXT) FROM authenticated, anon;
DROP FUNCTION IF EXISTS public.rpc_verify_closed_loop_condition(TEXT);

REVOKE ALL ON FUNCTION public.fn_derive_curriculum_domain_pattern(TEXT, TEXT) FROM authenticated, anon;
DROP FUNCTION IF EXISTS public.fn_derive_curriculum_domain_pattern(TEXT, TEXT);

-- 2. Drop FB-06 Hard Block Triggers from Canonical School Tables (Safely guarded)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'observation_records') THEN
    DROP TRIGGER IF EXISTS trg_fb06_block_foundation_obs ON public.observation_records;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'daily_attendance') THEN
    DROP TRIGGER IF EXISTS trg_fb06_block_foundation_att ON public.daily_attendance;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'student_progress_reports') THEN
    DROP TRIGGER IF EXISTS trg_fb06_block_foundation_lppa ON public.student_progress_reports;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'students') THEN
    DROP TRIGGER IF EXISTS trg_fb06_block_foundation_stu ON public.students;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'learning_activities') THEN
    DROP TRIGGER IF EXISTS trg_fb06_block_foundation_act ON public.learning_activities;
  END IF;
END $$;

DROP FUNCTION IF EXISTS public.fn_guard_foundation_mutation_block_fb06();

-- 3. Drop 5 LEARN Domain Tables in Reverse Dependency Order (CASCADE automatically drops attached triggers, policies, and indexes)
DROP TABLE IF EXISTS public.observed_outcome_effects CASCADE;
DROP TABLE IF EXISTS public.school_adoption_responses CASCADE;
DROP TABLE IF EXISTS public.institutional_actions CASCADE;
DROP TABLE IF EXISTS public.institutional_insights CASCADE;
DROP TABLE IF EXISTS public.derived_analytical_patterns CASCADE;

-- 4. Drop Action Immutability & Lifecycle Functions
DROP FUNCTION IF EXISTS public.fn_guard_action_anchor_immutability();
DROP FUNCTION IF EXISTS public.fn_guard_action_payload_lifecycle();

COMMIT;
