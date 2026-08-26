-- ==============================================================================
-- YAPENDIK SCHOOL OS TK PILOT - MIGRATION M07
-- STAGE 4.5-C: INSTITUTIONAL LEARNING & MULTI-SCHOOL GOVERNANCE SUBSTRATE
-- ==============================================================================
-- 1. Governance Context Helpers (SECURITY DEFINER with search_path = public, pg_temp)
-- 2. DDL for 5 New Tables (derived_analytical_patterns, institutional_insights,
--    institutional_actions, school_adoption_responses, observed_outcome_effects)
-- 3. Invariant Constraints (H-01, H-03, H-05, FB-07, etc.)
-- 4. Immutability Trigger (H-06: permanent action_id lineage lock)
-- 5. Payload-Bound State Machine & Immutability Trigger (H-01 & Refinement 3)
-- 6. FB-06 Hard Block Triggers on Canonical School Tables
-- 7. Fail-Closed Row Level Security (RLS) Policies on all 5 new tables
-- 8. Governed RPCs (fn_derive_curriculum_domain_pattern, rpc_verify_closed_loop_condition)
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- PHASE 1: CONTEXT HELPERS & RESOLUTION (REFINEMENT 4)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.get_auth_person_id()
RETURNS TEXT
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE AS $$
  SELECT coalesce(
    (SELECT person_id FROM public.user_person_identities WHERE auth_user_id = auth.uid() LIMIT 1),
    (SELECT person_id FROM public.governance_profiles WHERE person_id = auth.uid()::text OR id = auth.uid()::text LIMIT 1),
    (SELECT person_id FROM public.staff_profiles WHERE person_id = auth.uid()::text OR id = auth.uid()::text LIMIT 1),
    (SELECT person_id FROM public.teacher_profiles WHERE person_id = auth.uid()::text OR id = auth.uid()::text LIMIT 1),
    auth.uid()::text
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_is_governance() 
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.governance_profiles 
    WHERE person_id = public.get_auth_person_id() AND is_active = true
  ) OR EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE person_id = public.get_auth_person_id() 
      AND role IN ('SUPERADMIN', 'FOUNDATION_DIRECTOR', 'FOUNDATION_TRUSTEE', 'YAPENDIK_SUPERADMIN')
      AND is_active = true
  );
$$;

CREATE OR REPLACE FUNCTION public.auth_is_headmaster_of(target_school_id TEXT) 
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER SET search_path = public, pg_temp STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.staff_profiles
    WHERE person_id = public.get_auth_person_id() 
      AND school_id = target_school_id 
      AND role = 'HEADMASTER' 
      AND is_active = true
  );
$$;

REVOKE EXECUTE ON FUNCTION public.auth_is_governance() FROM anon;
GRANT EXECUTE ON FUNCTION public.auth_is_governance() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.auth_is_headmaster_of(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.auth_is_headmaster_of(TEXT) TO authenticated;

-- ==============================================================================
-- PHASE 2: 5 NEW TABLES FOR LEARN DOMAIN (ZERO MODIFICATION TO FROZEN BASELINE)
-- ==============================================================================

-- 2.1 Derived Analytical Patterns
CREATE TABLE IF NOT EXISTS public.derived_analytical_patterns (
  pattern_id TEXT PRIMARY KEY DEFAULT ('pat_' || to_char(now(), 'YYYY') || '_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  source_projection TEXT NOT NULL 
    CHECK (source_projection IN ('CURRICULUM_DOMAIN_DISTRIBUTION', 'SAFETY_INTEGRITY_INDEX', 'ATTENDANCE_STABILITY')),
  target_school_id TEXT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
  academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
  semester TEXT NOT NULL CHECK (semester IN ('GANJIL', 'GENAP')),
  window_start_date DATE NOT NULL,
  window_end_date DATE NOT NULL,
  cohort_size INT NOT NULL CHECK (cohort_size >= 0),
  exposure_status TEXT NOT NULL 
    CHECK (exposure_status IN ('VISIBLE', 'SUPPRESSED_SMALL_COHORT', 'SUPPRESSED_DIFFERENCING_RISK')),
  aggregation_rule TEXT NOT NULL,
  threshold_rule_version TEXT NOT NULL,
  computed_metric_value NUMERIC NULL, -- NULL jika exposure_status !== 'VISIBLE' (H-03)
  pattern_status TEXT NOT NULL DEFAULT 'DETECTED' 
    CHECK (pattern_status IN ('DETECTED', 'AVAILABLE_FOR_REVIEW', 'INSIGHT_CANDIDATE', 'ARCHIVED')),
  detected_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.derived_analytical_patterns
  DROP CONSTRAINT IF EXISTS chk_pattern_exposure_value_consistency;
ALTER TABLE public.derived_analytical_patterns
  ADD CONSTRAINT chk_pattern_exposure_value_consistency
  CHECK (
    (exposure_status = 'VISIBLE' AND computed_metric_value IS NOT NULL) OR
    (exposure_status IN ('SUPPRESSED_SMALL_COHORT', 'SUPPRESSED_DIFFERENCING_RISK') AND computed_metric_value IS NULL)
  );

CREATE INDEX IF NOT EXISTS idx_patterns_projection_school 
  ON public.derived_analytical_patterns (source_projection, target_school_id, academic_year_id);

-- 2.2 Institutional Insights
CREATE TABLE IF NOT EXISTS public.institutional_insights (
  insight_id TEXT PRIMARY KEY DEFAULT ('ins_' || to_char(now(), 'YYYY') || '_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  originating_pattern_id TEXT NOT NULL REFERENCES public.derived_analytical_patterns(pattern_id) ON DELETE RESTRICT,
  provenance_json JSONB NOT NULL,
  category TEXT NOT NULL 
    CHECK (category IN ('PEDAGOGICAL_EQUITY', 'SAFETY_INTEGRITY', 'CURRICULUM_BALANCE', 'RESOURCE_NEED')),
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  empirical_observation TEXT NOT NULL CHECK (length(trim(empirical_observation)) > 0),
  urgency_level TEXT NOT NULL 
    CHECK (urgency_level IN ('ROUTINE', 'PRIORITY_SUPPORT', 'STRATEGIC_REVIEW')),
  status TEXT NOT NULL DEFAULT 'IDENTIFIED' 
    CHECK (status IN ('IDENTIFIED', 'REVIEWED', 'ACTION_DECIDED', 'DISMISSED')),
  
  -- Audited Decision Record Fields (Embedded)
  decision_id TEXT NULL,
  decision_type TEXT NULL 
    CHECK (decision_type IN ('ACCEPTED_FOR_ACTION', 'DISMISSED', 'DEFERRED_MONITORING')),
  decision_rationale TEXT NULL,
  action_plan_type TEXT NULL 
    CHECK (action_plan_type IN ('SUPPORT_INITIATIVE', 'GOVERNANCE_DIRECTIVE', 'NONE')),
  decided_by_person_id TEXT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  decided_by_name TEXT NULL,
  decided_by_role TEXT NULL 
    CHECK (decided_by_role IN ('FOUNDATION_DIRECTOR', 'FOUNDATION_TRUSTEE', 'YAPENDIK_SUPERADMIN')),
  decided_at TIMESTAMPTZ NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.institutional_insights
  DROP CONSTRAINT IF EXISTS chk_insight_decision_completeness;
ALTER TABLE public.institutional_insights
  ADD CONSTRAINT chk_insight_decision_completeness
  CHECK (
    (status IN ('IDENTIFIED', 'REVIEWED') AND decision_type IS NULL) OR
    (status IN ('ACTION_DECIDED', 'DISMISSED') AND decision_type IS NOT NULL AND decision_rationale IS NOT NULL AND decided_by_person_id IS NOT NULL AND decided_at IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_insights_status_category 
  ON public.institutional_insights (status, category, created_at DESC);

-- 2.3 Institutional Actions (CANONICAL ROOT IDENTITY ANCHOR)
CREATE TABLE IF NOT EXISTS public.institutional_actions (
  action_id TEXT PRIMARY KEY DEFAULT ('act_' || to_char(now(), 'YYYY') || '_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  originating_insight_id TEXT NOT NULL REFERENCES public.institutional_insights(insight_id) ON DELETE RESTRICT,
  originating_decision_id TEXT NOT NULL,
  action_type TEXT NOT NULL 
    CHECK (action_type IN ('SUPPORT_INITIATIVE', 'GOVERNANCE_DIRECTIVE')),
  target_scope TEXT NOT NULL 
    CHECK (target_scope IN ('ALL_TK_UNITS', 'SPECIFIC_SCHOOL')),
  target_school_id TEXT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
  title TEXT NOT NULL CHECK (length(trim(title)) > 0),
  policy_intent TEXT NOT NULL CHECK (length(trim(policy_intent)) > 0),
  issued_by_person_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  issued_by_name TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Independent Asymmetrical Payloads (H-01)
  support_payload JSONB NULL,
  directive_payload JSONB NULL,

  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Constraint Hardening 05: Target Scope Invariant
ALTER TABLE public.institutional_actions
  DROP CONSTRAINT IF EXISTS chk_action_target_scope_invariant;
ALTER TABLE public.institutional_actions
  ADD CONSTRAINT chk_action_target_scope_invariant
  CHECK (
    (target_scope = 'SPECIFIC_SCHOOL' AND target_school_id IS NOT NULL AND trim(target_school_id) <> '') OR
    (target_scope = 'ALL_TK_UNITS' AND target_school_id IS NULL)
  );

-- Constraint Hardening 01: Payload Type Separation
ALTER TABLE public.institutional_actions
  DROP CONSTRAINT IF EXISTS chk_action_payload_separation;
ALTER TABLE public.institutional_actions
  ADD CONSTRAINT chk_action_payload_separation
  CHECK (
    (action_type = 'SUPPORT_INITIATIVE' AND support_payload IS NOT NULL AND directive_payload IS NULL) OR
    (action_type = 'GOVERNANCE_DIRECTIVE' AND directive_payload IS NOT NULL AND support_payload IS NULL)
  );

CREATE INDEX IF NOT EXISTS idx_actions_scope_school 
  ON public.institutional_actions (target_scope, target_school_id, issued_at DESC);

-- 2.4 School Adoption Responses
CREATE TABLE IF NOT EXISTS public.school_adoption_responses (
  response_id TEXT PRIMARY KEY DEFAULT ('adp_' || to_char(now(), 'YYYY') || '_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  action_id TEXT NOT NULL REFERENCES public.institutional_actions(action_id) ON DELETE RESTRICT,
  action_type TEXT NOT NULL 
    CHECK (action_type IN ('SUPPORT_INITIATIVE', 'GOVERNANCE_DIRECTIVE')),
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
  headmaster_person_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  headmaster_name TEXT NOT NULL,
  adoption_status TEXT NOT NULL 
    CHECK (adoption_status IN ('ACKNOWLEDGED', 'ADOPTED_IN_PRACTICE', 'ADAPTED_LOCALLY', 'DEFERRED')),
  local_context_adaptation_notes TEXT NOT NULL CHECK (length(trim(local_context_adaptation_notes)) > 0),
  action_timeline TEXT NOT NULL,
  acknowledged_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT uq_adoption_action_school UNIQUE (action_id, school_id)
);

CREATE INDEX IF NOT EXISTS idx_adoptions_school_action 
  ON public.school_adoption_responses (school_id, action_id);

-- 2.5 Observed Outcome Effects
CREATE TABLE IF NOT EXISTS public.observed_outcome_effects (
  outcome_id TEXT PRIMARY KEY DEFAULT ('out_' || to_char(now(), 'YYYY') || '_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  action_id TEXT NOT NULL REFERENCES public.institutional_actions(action_id) ON DELETE RESTRICT,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
  metric_name TEXT NOT NULL CHECK (length(trim(metric_name)) > 0),
  baseline_period_name TEXT NOT NULL,
  evaluation_period_name TEXT NOT NULL,
  
  baseline_metric_value NUMERIC NOT NULL,
  baseline_cohort_size INT NOT NULL CHECK (baseline_cohort_size >= 5),
  evaluation_metric_value NUMERIC NOT NULL,
  evaluation_cohort_size INT NOT NULL CHECK (evaluation_cohort_size >= 5),
  
  computed_absolute_delta NUMERIC NOT NULL,
  computed_percentage_change_pct NUMERIC NOT NULL,
  
  statistical_nature TEXT NOT NULL DEFAULT 'OBSERVED_EMPIRICAL_ASSOCIATION' 
    CHECK (statistical_nature = 'OBSERVED_EMPIRICAL_ASSOCIATION'),
  
  human_reflective_interpretation TEXT NOT NULL CHECK (length(trim(human_reflective_interpretation)) > 0),
  
  recorded_by_person_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  recorded_by_name TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  CONSTRAINT uq_outcome_action_school_metric UNIQUE (action_id, school_id, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_outcomes_action_school 
  ON public.observed_outcome_effects (action_id, school_id);

-- ==============================================================================
-- PHASE 3: IMMUTABILITY & STATE MACHINE TRIGGERS (H-06, H-01 & REFINEMENT 3)
-- ==============================================================================

-- 3.1 Action Anchor Immutability (H-06)
CREATE OR REPLACE FUNCTION public.fn_guard_action_anchor_immutability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF OLD.action_id <> NEW.action_id THEN
      RAISE EXCEPTION 'CANNOT_MUTATE_ACTION_ID: Canonical root action_id % is immutable forever (H-06).', OLD.action_id;
    END IF;
    IF OLD.originating_insight_id <> NEW.originating_insight_id THEN
      RAISE EXCEPTION 'CANNOT_MUTATE_ORIGINATING_INSIGHT: Lineage originating_insight_id is immutable (H-06).';
    END IF;
    IF OLD.originating_decision_id <> NEW.originating_decision_id THEN
      RAISE EXCEPTION 'CANNOT_MUTATE_ORIGINATING_DECISION: Lineage originating_decision_id is immutable (H-06).';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_guard_action_anchor_immutability ON public.institutional_actions;
CREATE TRIGGER trg_guard_action_anchor_immutability
  BEFORE UPDATE ON public.institutional_actions
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_action_anchor_immutability();

-- 3.2 Payload State Machine & Post-Deployment Immutability (H-01 & Refinement 3)
CREATE OR REPLACE FUNCTION public.fn_guard_action_payload_lifecycle()
RETURNS TRIGGER AS $$
DECLARE
  v_old_status TEXT;
  v_new_status TEXT;
  v_old_body JSONB;
  v_new_body JSONB;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Support Initiative Lifecycle
    IF NEW.action_type = 'SUPPORT_INITIATIVE' THEN
      v_old_status := OLD.support_payload->>'support_lifecycle_status';
      v_new_status := NEW.support_payload->>'support_lifecycle_status';
      
      -- Refinement 3: Content Immutability post DEPLOYED/COMPLETED
      IF v_old_status IN ('DEPLOYED', 'COMPLETED') THEN
        v_old_body := OLD.support_payload - 'support_lifecycle_status';
        v_new_body := NEW.support_payload - 'support_lifecycle_status';
        IF v_old_body IS DISTINCT FROM v_new_body THEN
          RAISE EXCEPTION 'PAYLOAD_CONTENT_IMMUTABLE: Support payload content is permanently immutable once status is DEPLOYED or COMPLETED (Refinement 3).';
        END IF;
      END IF;

      IF v_old_status <> v_new_status THEN
        IF v_old_status = 'PROPOSED' AND v_new_status NOT IN ('APPROVED') THEN
          RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION: Support initiative cannot jump from PROPOSED to %.', v_new_status;
        ELSIF v_old_status = 'APPROVED' AND v_new_status NOT IN ('DEPLOYED') THEN
          RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION: Support initiative cannot jump from APPROVED to %.', v_new_status;
        ELSIF v_old_status = 'DEPLOYED' AND v_new_status NOT IN ('COMPLETED') THEN
          RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION: Support initiative cannot jump from DEPLOYED to %.', v_new_status;
        ELSIF v_old_status = 'COMPLETED' THEN
          RAISE EXCEPTION 'TERMINAL_STATE_FROZEN: Support initiative is COMPLETED and permanently frozen.';
        END IF;
      END IF;
    END IF;

    -- Governance Directive Lifecycle
    IF NEW.action_type = 'GOVERNANCE_DIRECTIVE' THEN
      v_old_status := OLD.directive_payload->>'directive_lifecycle_status';
      v_new_status := NEW.directive_payload->>'directive_lifecycle_status';

      -- Refinement 3: Content Immutability post PUBLISHED/SUPERSEDED
      IF v_old_status IN ('PUBLISHED', 'SUPERSEDED') THEN
        v_old_body := OLD.directive_payload - 'directive_lifecycle_status';
        v_new_body := NEW.directive_payload - 'directive_lifecycle_status';
        IF v_old_body IS DISTINCT FROM v_new_body THEN
          RAISE EXCEPTION 'PAYLOAD_CONTENT_IMMUTABLE: Directive payload content is permanently immutable once status is PUBLISHED or SUPERSEDED (Refinement 3).';
        END IF;
      END IF;

      IF v_old_status <> v_new_status THEN
        IF v_old_status = 'DRAFT' AND v_new_status NOT IN ('PUBLISHED') THEN
          RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION: Directive cannot jump from DRAFT to %.', v_new_status;
        ELSIF v_old_status = 'PUBLISHED' AND v_new_status NOT IN ('SUPERSEDED') THEN
          RAISE EXCEPTION 'ILLEGAL_STATE_TRANSITION: Directive cannot jump from PUBLISHED to %.', v_new_status;
        ELSIF v_old_status = 'SUPERSEDED' THEN
          RAISE EXCEPTION 'TERMINAL_STATE_FROZEN: Directive is SUPERSEDED and permanently frozen.';
        END IF;
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS trg_guard_action_payload_lifecycle ON public.institutional_actions;
CREATE TRIGGER trg_guard_action_payload_lifecycle
  BEFORE UPDATE ON public.institutional_actions
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_action_payload_lifecycle();

-- ==============================================================================
-- PHASE 4: FB-06 HARD BLOCK TRIGGERS (DEFENSE-IN-DEPTH & REFINEMENT 1)
-- ==============================================================================

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

-- Install FB-06 Hard Block Triggers across Canonical School Tables (Refinement 1)
DROP TRIGGER IF EXISTS trg_fb06_block_foundation_obs ON public.observation_records;
CREATE TRIGGER trg_fb06_block_foundation_obs
  BEFORE INSERT OR UPDATE OR DELETE ON public.observation_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_foundation_mutation_block_fb06();

DROP TRIGGER IF EXISTS trg_fb06_block_foundation_att ON public.daily_attendance;
CREATE TRIGGER trg_fb06_block_foundation_att
  BEFORE INSERT OR UPDATE OR DELETE ON public.daily_attendance
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_foundation_mutation_block_fb06();

DROP TRIGGER IF EXISTS trg_fb06_block_foundation_lppa ON public.student_progress_reports;
CREATE TRIGGER trg_fb06_block_foundation_lppa
  BEFORE INSERT OR UPDATE OR DELETE ON public.student_progress_reports
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_foundation_mutation_block_fb06();

DROP TRIGGER IF EXISTS trg_fb06_block_foundation_stu ON public.students;
CREATE TRIGGER trg_fb06_block_foundation_stu
  BEFORE INSERT OR UPDATE OR DELETE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_foundation_mutation_block_fb06();

DROP TRIGGER IF EXISTS trg_fb06_block_foundation_act ON public.learning_activities;
CREATE TRIGGER trg_fb06_block_foundation_act
  BEFORE INSERT OR UPDATE OR DELETE ON public.learning_activities
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_foundation_mutation_block_fb06();

-- ==============================================================================
-- PHASE 5: FAIL-CLOSED ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.derived_analytical_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_adoption_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observed_outcome_effects ENABLE ROW LEVEL SECURITY;

-- 1. Patterns RLS
DROP POLICY IF EXISTS "Foundation can view all patterns" ON public.derived_analytical_patterns;
CREATE POLICY "Foundation can view all patterns" ON public.derived_analytical_patterns
  FOR SELECT TO authenticated USING (public.auth_is_governance());

-- 2. Insights RLS
DROP POLICY IF EXISTS "Foundation can view all insights" ON public.institutional_insights;
CREATE POLICY "Foundation can view all insights" ON public.institutional_insights
  FOR SELECT TO authenticated USING (public.auth_is_governance());

-- 3. Actions RLS
DROP POLICY IF EXISTS "Foundation can read all actions" ON public.institutional_actions;
CREATE POLICY "Foundation can read all actions" ON public.institutional_actions
  FOR SELECT TO authenticated USING (public.auth_is_governance());

DROP POLICY IF EXISTS "Headmaster can read scoped actions" ON public.institutional_actions;
CREATE POLICY "Headmaster can read scoped actions" ON public.institutional_actions
  FOR SELECT TO authenticated USING (
    target_scope = 'ALL_TK_UNITS' OR public.auth_is_headmaster_of(target_school_id)
  );

DROP POLICY IF EXISTS "Deny direct write on actions" ON public.institutional_actions;
CREATE POLICY "Deny direct write on actions" ON public.institutional_actions
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- 4. Adoptions RLS
DROP POLICY IF EXISTS "Headmaster can manage school adoption" ON public.school_adoption_responses;
CREATE POLICY "Headmaster can manage school adoption" ON public.school_adoption_responses
  FOR ALL TO authenticated 
  USING (public.auth_is_headmaster_of(school_id))
  WITH CHECK (public.auth_is_headmaster_of(school_id));

DROP POLICY IF EXISTS "Foundation can view all adoptions" ON public.school_adoption_responses;
CREATE POLICY "Foundation can view all adoptions" ON public.school_adoption_responses
  FOR SELECT TO authenticated USING (public.auth_is_governance());

-- 5. Outcomes RLS
DROP POLICY IF EXISTS "Staff and Foundation can view outcomes" ON public.observed_outcome_effects;
CREATE POLICY "Staff and Foundation can view outcomes" ON public.observed_outcome_effects
  FOR SELECT TO authenticated USING (
    public.auth_is_governance() OR public.auth_is_headmaster_of(school_id)
  );

-- ==============================================================================
-- PHASE 6: GOVERNED RPCS (PROJECTIONS & CLOSED-LOOP TELEMETRY)
-- ==============================================================================

-- 6.1 Curriculum Domain Telemetry Function (with Kmin=5 Privacy Threshold)
CREATE OR REPLACE FUNCTION public.fn_derive_curriculum_domain_pattern(
  p_academic_year_id TEXT,
  p_target_school_id TEXT DEFAULT NULL
)
RETURNS TABLE (
  school_id TEXT,
  domain_name TEXT,
  cohort_size INT,
  computed_percentage NUMERIC,
  exposure_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN QUERY
  WITH raw_cohort AS (
    SELECT 
      c.school_id AS sch_id,
      o.domain AS dom,
      COUNT(DISTINCT o.student_id)::INT AS n_count,
      ROUND(AVG(CASE o.milestone_rating 
        WHEN 'BB' THEN 25 
        WHEN 'MB' THEN 50 
        WHEN 'BSH' THEN 75 
        WHEN 'BSB' THEN 100 
      END), 1) AS raw_val
    FROM public.observation_records o
    JOIN public.classes c ON c.id = o.class_id
    WHERE c.academic_year_id = p_academic_year_id
      AND (p_target_school_id IS NULL OR c.school_id = p_target_school_id)
      AND o.is_confidential_to_staff = FALSE
    GROUP BY c.school_id, o.domain
  )
  SELECT 
    rc.sch_id,
    rc.dom,
    rc.n_count,
    CASE 
      WHEN rc.n_count < 5 THEN NULL 
      ELSE rc.raw_val 
    END AS computed_percentage,
    CASE 
      WHEN rc.n_count < 5 THEN 'SUPPRESSED_SMALL_COHORT'::TEXT 
      ELSE 'VISIBLE'::TEXT 
    END AS exposure_status
  FROM raw_cohort rc;
END;
$$;

-- 6.2 Transactional Closed-Loop Verification RPC
CREATE OR REPLACE FUNCTION public.rpc_verify_closed_loop_condition(p_action_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_action RECORD;
  v_adoption RECORD;
  v_outcome RECORD;
  v_is_action_active BOOLEAN := FALSE;
  v_is_adopted BOOLEAN := FALSE;
  v_is_outcome_valid BOOLEAN := FALSE;
  v_is_closed_loop BOOLEAN := FALSE;
  v_diagnostic_flags JSONB := '[]'::jsonb;
BEGIN
  -- 1. Action Record & Invariant Checks
  SELECT * INTO v_action FROM public.institutional_actions WHERE action_id = p_action_id;
  IF v_action.action_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ACTION_NOT_FOUND');
  END IF;

  IF v_action.target_scope = 'SPECIFIC_SCHOOL' AND (v_action.target_school_id IS NULL OR trim(v_action.target_school_id) = '') THEN
    v_diagnostic_flags := v_diagnostic_flags || jsonb_build_array('INVALID_SPECIFIC_SCHOOL_SCOPE');
  END IF;

  IF (v_action.action_type = 'SUPPORT_INITIATIVE' AND v_action.support_payload->>'support_lifecycle_status' = 'DEPLOYED') OR
     (v_action.action_type = 'GOVERNANCE_DIRECTIVE' AND v_action.directive_payload->>'directive_lifecycle_status' = 'PUBLISHED') THEN
    v_is_action_active := TRUE;
  ELSE
    v_diagnostic_flags := v_diagnostic_flags || jsonb_build_array('ACTION_NOT_YET_ACTIVE');
  END IF;

  -- 2. School Adoption Check (FB-03)
  SELECT * INTO v_adoption FROM public.school_adoption_responses WHERE action_id = p_action_id LIMIT 1;
  IF v_adoption.response_id IS NOT NULL AND v_adoption.adoption_status IN ('ADOPTED_IN_PRACTICE', 'ADAPTED_LOCALLY') THEN
    v_is_adopted := TRUE;
  ELSE
    v_diagnostic_flags := v_diagnostic_flags || jsonb_build_array('ADOPTION_INCOMPLETE_OR_DEFERRED');
  END IF;

  -- 3. Observed Outcome Check (H-02 & FB-05)
  SELECT * INTO v_outcome FROM public.observed_outcome_effects WHERE action_id = p_action_id LIMIT 1;
  IF v_outcome.outcome_id IS NOT NULL AND
     length(trim(v_outcome.human_reflective_interpretation)) > 0 AND
     v_outcome.baseline_cohort_size >= 5 AND
     v_outcome.evaluation_cohort_size >= 5 AND
     v_outcome.computed_absolute_delta IS NOT NULL THEN
    v_is_outcome_valid := TRUE;
  ELSE
    v_diagnostic_flags := v_diagnostic_flags || jsonb_build_array('OUTCOME_RECORD_INVALID_OR_MISSING');
  END IF;

  -- 4. Closed Loop Synthesis
  IF v_is_action_active AND v_is_adopted AND v_is_outcome_valid AND jsonb_array_length(v_diagnostic_flags) = 0 THEN
    v_is_closed_loop := TRUE;
  END IF;

  RETURN jsonb_build_object(
    'action_id', p_action_id,
    'is_closed_loop', v_is_closed_loop,
    'milestones', jsonb_build_object(
      'action_active', v_is_action_active,
      'school_adopted', v_is_adopted,
      'outcome_verified', v_is_outcome_valid
    ),
    'diagnostic_flags', v_diagnostic_flags
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.fn_derive_curriculum_domain_pattern(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.fn_derive_curriculum_domain_pattern(TEXT, TEXT) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.rpc_verify_closed_loop_condition(TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.rpc_verify_closed_loop_condition(TEXT) TO authenticated;

COMMIT;
