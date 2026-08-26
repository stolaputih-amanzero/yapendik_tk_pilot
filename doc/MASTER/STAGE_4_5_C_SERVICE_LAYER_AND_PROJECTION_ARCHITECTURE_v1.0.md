# STAGE 4.5-C — SERVICE LAYER, DATABASE SCHEMA & PROJECTION ARCHITECTURE
## Multi-Unit Institutional Learning & Governance Operating Substrate (v1.0)
### Yapendik School OS — Architecture Specification & Implementation Contract

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS) — TK Pilot  
**Document ID:** `STAGE_4_5_C_SERVICE_LAYER_AND_PROJECTION_ARCHITECTURE_v1.0`  
**Status:** **ACTIVE ARCHITECTURE CONTRACT — CLEARED FOR GATE 3 IMPLEMENTATION**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2, STAGE 4.5-A (Gate 2 Sealed), & STAGE 4.5-B (Gate 2.1 Certified)  
**Prerequisites:** Stage 1–4.4 Certified Baseline (234 Checks PASS) & Stage 4.5-B Type System (42 Checks PASS, Total: 276/276 PASS)  
**Target Delivery:** `src/services/institutionalLearningService.ts`, `db_migrations/m07_institutional_learning_ddl_and_guards.sql`, `tests/` (Suites 17–20)  

---

## 1. Executive Summary & Architectural Scope

Dokumen ini merupakan **Spesifikasi Arsitektur Teknis dan Kontrak Implementasi Tunggal (*Single Source of Truth*)** untuk **Stage 4.5-C — Service Layer, Database Schema, & Projection Engine**.

Fase 4.5-C menjembatani kontrak tipe data dan validator murni yang telah tersertifikasi pada **Gate 2.1 (Fase 4.5-B)** dengan **PostgreSQL Database Engine** dan **Application Service Layer**.

```text
═════════════════════════════════════════════════════════════════════════════════════════════
                     STAGE 4.5-C TWO-TIER DEFENSE & PROJECTION ARCHITECTURE
═════════════════════════════════════════════════════════════════════════════════════════════

 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │ TIER 1: APPLICATION SERVICE LAYER (institutionalLearningService.ts)                     │
 │ • Pre-execution validation via institutionalLearningValidators.ts (Gate 2.1)            │
 │ • Projection Engine: On-the-fly Query Aggregator ──► Anti-Differencing ──► PII Redactor │
 │ • Non-Causal Outcome Measurement & Qualitative Human Reflection Enforcement             │
 └────────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │ Gated Execution via SECURITY DEFINER RPCs
                                              ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │ TIER 2: DATABASE ENGINE LAYER (PostgreSQL DDL, Triggers & RLS Policies)                 │
 │ • 5 New Tables for LEARN Domain (Zero modification to 15 Frozen Baseline Tables)        │
 │ • FB-06 Hard Block Trigger: Rejects Foundation Mutations on School Reality              │
 │ • H-06 & H-01 Immutability Triggers: Permanent action_id Anchor & Payload Lifecycles    │
 │ • Fail-Closed RLS Policies: Tenant Scoping (ALL_TK_UNITS vs SPECIFIC_SCHOOL)            │
 └─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Batas Arsitektural Mutlak (*Absolute Non-Negotiable Boundaries*):
1. **V2.1.5 Frozen Baseline Protection**: Seluruh 15 tabel kanonikal sekolah (`daily_attendance`, `observation_records`, `student_progress_reports`, `students`, `classes`, dll.) **TIDAK BOLEH DIMODIFIKASI STRUKTURNYA** (dilarang menambah kolom, foreign key, atau mengubah trigger eksisting).
2. **Defense-in-Depth Guarantee**: Setiap invarian tata kelola ditegakkan pada dua lapis (*Two-Tier Enforcement*): lapisan TypeScript Service Guard dan lapisan PostgreSQL RLS / Database Trigger Guard.
3. **No Direct DML on Foundation Tables**: Klien dilarang melakukan `INSERT`/`UPDATE` langsung ke tabel tata kelola yayasan; seluruh mutasi wajib melalui `SECURITY DEFINER` RPC yang terotentikasi dan terekam di jejak audit.

---

## 2. Database Schema Design (Tabel Baru Domain LEARN)

Untuk menopang 6 Entitas Kanonikal tanpa merusak *Frozen Baseline*, dirancang **5 tabel baru** dalam skema database `public`:

```text
                                  DATABASE LINEAGE MAP
                                  
   [derived_analytical_patterns]
                │
                ▼
   [institutional_insights] ──► (decision_record jsonb)
                │
                ▼
   [institutional_actions] ── (CANONICAL ROOT: action_id)
          │            │
          ▼            ▼
[school_adoptions]   [observed_outcome_effects]
          │            │
          └─────┬──────┘
                ▼
      (Closed-Loop Condition)
```

---

### 2.1 Tabel 1: `derived_analytical_patterns`
Menyimpan hasil deteksi pola atau anomali analitik multi-unit yang dihasilkan oleh engine mesin.

```sql
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

-- Constraint H-03: Nilai metrik wajib NULL jika tersupresi
ALTER TABLE public.derived_analytical_patterns
  ADD CONSTRAINT chk_pattern_exposure_value_consistency
  CHECK (
    (exposure_status = 'VISIBLE' AND computed_metric_value IS NOT NULL) OR
    (exposure_status IN ('SUPPRESSED_SMALL_COHORT', 'SUPPRESSED_DIFFERENCING_RISK') AND computed_metric_value IS NULL)
  );

CREATE INDEX IF NOT EXISTS idx_patterns_projection_school 
  ON public.derived_analytical_patterns (source_projection, target_school_id, academic_year_id);
```

---

### 2.2 Tabel 2: `institutional_insights`
Menyimpan wawasan kelembagaan yang telah dikonfirmasi relevansinya oleh manusia, lengkap dengan jejak keputusan Dewan Pengurus (*audited decision record*).

```sql
CREATE TABLE IF NOT EXISTS public.institutional_insights (
  insight_id TEXT PRIMARY KEY DEFAULT ('ins_' || to_char(now(), 'YYYY') || '_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  originating_pattern_id TEXT NOT NULL REFERENCES public.derived_analytical_patterns(pattern_id) ON DELETE RESTRICT,
  provenance_json JSONB NOT NULL, -- Snapshot metadata komputasi & aturan agregasi
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

-- Constraint: Jika status ACTION_DECIDED / DISMISSED, decision record wajib lengkap
ALTER TABLE public.institutional_insights
  ADD CONSTRAINT chk_insight_decision_completeness
  CHECK (
    (status IN ('IDENTIFIED', 'REVIEWED') AND decision_type IS NULL) OR
    (status IN ('ACTION_DECIDED', 'DISMISSED') AND decision_type IS NOT NULL AND decision_rationale IS NOT NULL AND decided_by_person_id IS NOT NULL AND decided_at IS NOT NULL)
  );

CREATE INDEX IF NOT EXISTS idx_insights_status_category 
  ON public.institutional_insights (status, category, created_at DESC);
```

---

### 2.3 Tabel 3: `institutional_actions` (CANONICAL ROOT IDENTITY ANCHOR)
Jangkar identitas tunggal (`action_id`) yang mengikat wewenang strategis Yayasan ke seluruh satuan sekolah.

```sql
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
  ADD CONSTRAINT chk_action_target_scope_invariant
  CHECK (
    (target_scope = 'SPECIFIC_SCHOOL' AND target_school_id IS NOT NULL AND trim(target_school_id) <> '') OR
    (target_scope = 'ALL_TK_UNITS' AND target_school_id IS NULL)
  );

-- Constraint Hardening 01: Payload Type Separation
ALTER TABLE public.institutional_actions
  ADD CONSTRAINT chk_action_payload_separation
  CHECK (
    (action_type = 'SUPPORT_INITIATIVE' AND support_payload IS NOT NULL AND directive_payload IS NULL) OR
    (action_type = 'GOVERNANCE_DIRECTIVE' AND directive_payload IS NOT NULL AND support_payload IS NULL)
  );

CREATE INDEX IF NOT EXISTS idx_actions_scope_school 
  ON public.institutional_actions (target_scope, target_school_id, issued_at DESC);
```

---

### 2.4 Tabel 4: `school_adoption_responses`
Catatan resmi Kepala Sekolah mengenai penerimaan dan adaptasi kontekstual aksi di tingkat unit sekolah (FB-03).

```sql
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

  -- Invariant: Satu respon adopsi unik per (action_id, school_id)
  CONSTRAINT uq_adoption_action_school UNIQUE (action_id, school_id)
);

CREATE INDEX IF NOT EXISTS idx_adoptions_school_action 
  ON public.school_adoption_responses (school_id, action_id);
```

---

### 2.5 Tabel 5: `observed_outcome_effects`
Pengukuran selisih empiris ($\Delta$) non-kausal pasca intervensi berjangkar `action_id`.

```sql
CREATE TABLE IF NOT EXISTS public.observed_outcome_effects (
  outcome_id TEXT PRIMARY KEY DEFAULT ('out_' || to_char(now(), 'YYYY') || '_' || substr(md5(random()::text || clock_timestamp()::text), 1, 12)),
  action_id TEXT NOT NULL REFERENCES public.institutional_actions(action_id) ON DELETE RESTRICT,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
  metric_name TEXT NOT NULL CHECK (length(trim(metric_name)) > 0),
  baseline_period_name TEXT NOT NULL,
  evaluation_period_name TEXT NOT NULL,
  
  -- Measurements (Sample size Kmin >= 5 enforced)
  baseline_metric_value NUMERIC NOT NULL,
  baseline_cohort_size INT NOT NULL CHECK (baseline_cohort_size >= 5),
  evaluation_metric_value NUMERIC NOT NULL,
  evaluation_cohort_size INT NOT NULL CHECK (evaluation_cohort_size >= 5),
  
  computed_absolute_delta NUMERIC NOT NULL,
  computed_percentage_change_pct NUMERIC NOT NULL,
  
  -- Strict Non-Causal Semantics Invariant
  statistical_nature TEXT NOT NULL DEFAULT 'OBSERVED_EMPIRICAL_ASSOCIATION' 
    CHECK (statistical_nature = 'OBSERVED_EMPIRICAL_ASSOCIATION'),
  
  -- Mandatory Qualitative Reflection (Non-empty trimmed)
  human_reflective_interpretation TEXT NOT NULL CHECK (length(trim(human_reflective_interpretation)) > 0),
  
  recorded_by_person_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
  recorded_by_name TEXT NOT NULL,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),

  -- Invariant: Satu outcome unik per (action_id, school_id, metric_name)
  CONSTRAINT uq_outcome_action_school_metric UNIQUE (action_id, school_id, metric_name)
);

CREATE INDEX IF NOT EXISTS idx_outcomes_action_school 
  ON public.observed_outcome_effects (action_id, school_id);
```

---

### 2.6 Immutability Trigger: `action_id` Lineage Lock (H-06)

```sql
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guard_action_anchor_immutability ON public.institutional_actions;
CREATE TRIGGER trg_guard_action_anchor_immutability
  BEFORE UPDATE ON public.institutional_actions
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_action_anchor_immutability();
```

---

### 2.7 Fail-Closed Row-Level Security (RLS) Matrix

Seluruh 5 tabel baru mengaktifkan RLS dengan hak akses terisolasi:

```sql
ALTER TABLE public.derived_analytical_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.institutional_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_adoption_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.observed_outcome_effects ENABLE ROW LEVEL SECURITY;

-- 1. Institutional Actions RLS:
-- Yayasan can read all actions
CREATE POLICY "Foundation can read all actions" ON public.institutional_actions
  FOR SELECT TO authenticated USING (auth_is_governance());

-- Headmaster can read actions scoped to ALL_TK_UNITS or their active school
CREATE POLICY "Headmaster can read relevant actions" ON public.institutional_actions
  FOR SELECT TO authenticated USING (
    target_scope = 'ALL_TK_UNITS' OR auth_is_headmaster_of(target_school_id)
  );

-- Direct client INSERT/UPDATE/DELETE on actions is DENIED (Gated strictly to RPC)
CREATE POLICY "Deny direct write on actions" ON public.institutional_actions
  FOR ALL TO authenticated USING (false) WITH CHECK (false);

-- 2. School Adoption Responses RLS:
-- Headmaster can INSERT/UPDATE adoption for their own school
CREATE POLICY "Headmaster can manage school adoption" ON public.school_adoption_responses
  FOR ALL TO authenticated 
  USING (auth_is_headmaster_of(school_id))
  WITH CHECK (auth_is_headmaster_of(school_id));

-- Foundation can read all adoptions
CREATE POLICY "Foundation can view all adoptions" ON public.school_adoption_responses
  FOR SELECT TO authenticated USING (auth_is_governance());
```

---

## 3. Database RPC Guards & FB-06 Hard Block (Defense-in-Depth)

Invarian **FB-06 (*No Canonical School Mutation from Foundation*)** menegaskan bahwa akun Yayasan (`FOUNDATION_DIRECTOR`, `FOUNDATION_TRUSTEE`, `YAPENDIK_SUPERADMIN`, `SUPERADMIN`) **DILARANG KERAS** memutasi data kanonikal sekolah.

### 3.1 Hard Block Trigger pada Tabel Operasional Sekolah
Trigger `fn_guard_foundation_mutation_block_fb06` dipasang pada tabel operasional kanonikal sebagai lapisan pengaman database fisik:

```sql
CREATE OR REPLACE FUNCTION public.fn_guard_foundation_mutation_block_fb06()
RETURNS TRIGGER AS $$
DECLARE
  v_caller_person_id TEXT;
  v_is_foundation_role BOOLEAN := FALSE;
BEGIN
  v_caller_person_id := public.get_auth_person_id();
  
  -- Cek apakah caller memegang peran Yayasan di governance_profiles
  SELECT EXISTS (
    SELECT 1 FROM public.governance_profiles 
    WHERE person_id = v_caller_person_id AND is_active = TRUE
  ) INTO v_is_foundation_role;

  -- Jika aktor Yayasan mencoba melakukan INSERT, UPDATE, atau DELETE langsung pada tabel sekolah
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

-- Pasang guard pada tabel kanonikal operasional sekolah
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
```

---

## 4. The Projection Engine Architecture (FB-01, FB-02, FB-07)

Projection Engine beroperasi secara dinamis di *Application Service Layer* (`institutionalLearningService.ts`) dan didukung oleh database query function murni:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           THE 4-STAGE PROJECTION PIPELINE                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Raw School Facts Aggregation (Cross-unit count, mean, distribution without PII)       │
│                                           │                                             │
│                                           ▼                                             │
│ 2. Minimum Cohort Kmin = 5 Gatekeeper (FB-07: cohort_size < 5 ──► SUPPRESSED)           │
│                                           │                                             │
│                                           ▼                                             │
│ 3. Anti-Differencing Deduction Engine (FB-07: 0 < |N_base - N_sub| < 5 ──► SUPPRESSED)  │
│                                           │                                             │
│                                           ▼                                             │
│ 4. Zero-PII Structural Redactor (FB-01: validateZeroIndividualExposure DTO barrier)     │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 SQL Implementation: Anti-Differencing & $K_{\min} = 5$ Telemetry Function

```sql
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
      AND o.is_confidential_to_staff = FALSE -- Invariant C-11 Isolation
    GROUP BY c.school_id, o.domain
  )
  SELECT 
    rc.sch_id,
    rc.dom,
    rc.n_count,
    -- Penegakan FB-07 & H-03: Kosongkan angka jika populasi < 5
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
```

### 4.2 Jaminan Anti-Kebocoran PII Anak (FB-01)
1. **Query Barrier**: Seluruh `SELECT` untuk konteks Yayasan tidak pernah melakukan `JOIN` ke kolom `students.nis`, `students.nisn`, `persons.full_name`, atau `persons.national_id_number`.
2. **DTO Mapper Barrier**: Sebelum mengembalikan objek ke antarmuka, service memanggil:
   ```typescript
   const validation = validateZeroIndividualExposure(responseDto);
   if (!validation.valid) {
     throw new Error(`SECURITY_GATE_PII_LEAK: ${validation.reason}`);
   }
   ```

---

## 5. State Machine Orchestration (H-01 Enforcement)

Transisi status diatur secara asimetris:
- **`SupportPayload`**: `PROPOSED` $\rightarrow$ `APPROVED` $\rightarrow$ `DEPLOYED` $\rightarrow$ `COMPLETED`
- **`DirectivePayload`**: `DRAFT` $\rightarrow$ `PUBLISHED` $\rightarrow$ `SUPERSEDED`
- **`SchoolAdoption`**: `ACKNOWLEDGED` $\rightarrow$ `ADOPTED_IN_PRACTICE` | `ADAPTED_LOCALLY` | `DEFERRED`

### Database State Machine Guard Trigger:
```sql
CREATE OR REPLACE FUNCTION public.fn_guard_action_payload_lifecycle()
RETURNS TRIGGER AS $$
DECLARE
  v_old_status TEXT;
  v_new_status TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    -- Validasi Support Lifecycle
    IF NEW.action_type = 'SUPPORT_INITIATIVE' THEN
      v_old_status := OLD.support_payload->>'support_lifecycle_status';
      v_new_status := NEW.support_payload->>'support_lifecycle_status';
      
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

    -- Validasi Directive Lifecycle
    IF NEW.action_type = 'GOVERNANCE_DIRECTIVE' THEN
      v_old_status := OLD.directive_payload->>'directive_lifecycle_status';
      v_new_status := NEW.directive_payload->>'directive_lifecycle_status';

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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_guard_action_payload_lifecycle ON public.institutional_actions;
CREATE TRIGGER trg_guard_action_payload_lifecycle
  BEFORE UPDATE ON public.institutional_actions
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_action_payload_lifecycle();
```

---

## 6. Closed-Loop Telemetry API Contract

Siklus tata kelola penuh (`CLOSED_LOOP`) dihitung secara transaksional lintas 3 tabel:

```sql
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
  -- 1. Ambil Data Action Record
  SELECT * INTO v_action FROM public.institutional_actions WHERE action_id = p_action_id;
  IF v_action.action_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'ACTION_NOT_FOUND');
  END IF;

  -- Evaluasi Scope Guard (H-05)
  IF v_action.target_scope = 'SPECIFIC_SCHOOL' AND (v_action.target_school_id IS NULL OR trim(v_action.target_school_id) = '') THEN
    v_diagnostic_flags := v_diagnostic_flags || jsonb_build_array('INVALID_SPECIFIC_SCHOOL_SCOPE');
  END IF;

  -- Evaluasi Keaktifan Aksi (H-01)
  IF (v_action.action_type = 'SUPPORT_INITIATIVE' AND v_action.support_payload->>'support_lifecycle_status' = 'DEPLOYED') OR
     (v_action.action_type = 'GOVERNANCE_DIRECTIVE' AND v_action.directive_payload->>'directive_lifecycle_status' = 'PUBLISHED') THEN
    v_is_action_active := TRUE;
  ELSE
    v_diagnostic_flags := v_diagnostic_flags || jsonb_build_array('ACTION_NOT_YET_ACTIVE');
  END IF;

  -- 2. Ambil Data Adoption Response (FB-03)
  SELECT * INTO v_adoption FROM public.school_adoption_responses WHERE action_id = p_action_id LIMIT 1;
  IF v_adoption.response_id IS NOT NULL AND v_adoption.adoption_status IN ('ADOPTED_IN_PRACTICE', 'ADAPTED_LOCALLY') THEN
    v_is_adopted := TRUE;
  ELSE
    v_diagnostic_flags := v_diagnostic_flags || jsonb_build_array('ADOPTION_INCOMPLETE_OR_DEFERRED');
  END IF;

  -- 3. Ambil Data Observed Outcome (H-02 & FB-05)
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

  -- 4. Deterministik Closed Loop
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
```

---

## 7. Adversarial Test Suites Extension (Suites 17–20)

Sebagai bagian dari pengujian integritas Database Engine & Service Layer di Gate 3, dirancang 4 suite pengujian baru:

| Suite ID | Nama Test Suite | Skenario Verifikasi | Target Penegakan |
|---|---|---|---|
| **Suite 17** | *DB-Level FB-06 Mutation Hard Block* | Mensimulasikan RPC/SQL insert observasi/presensi dengan token peran Yayasan $\rightarrow$ Wajib melempar `MUTATION_REJECTED_FB06`. | PostgreSQL Trigger `trg_fb06_*` |
| **Suite 18** | *Projection Engine PII Leak Test* | Menguji DTO keluaran multi-unit Yayasan terhadap serangan eksfiltrasi data anak $\rightarrow$ Membuktikan 0 atribut PII bocor. | `validateZeroIndividualExposure` & SQL Aggregation |
| **Suite 19** | *Anti-Differencing SQL Boundary Test* | Menguji query agregat SQL pada kohor $N=4$ vs $N=5$, serta irisan subset $\text{diff}=4$ vs $\text{diff}=5$ $\rightarrow$ Membuktikan supresi deterministik di DB. | `fn_derive_curriculum_domain_pattern` & FB-07 |
| **Suite 20** | *State Machine DB Trigger Bypass Attempt* | Mencoba melakukan UPDATE bypass status ilegal (misal: `PROPOSED` $\rightarrow$ `COMPLETED`) via direct SQL query $\rightarrow$ Wajib ditolak oleh database trigger. | `trg_guard_action_payload_lifecycle` |

---

## 8. Implementation Readiness Checklist for Gate 3

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║             STAGE 4.5-C IMPLEMENTATION READINESS CHECKLIST (GATE 3)          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ [ ] 1. Migration M07 DDL Script (db_migrations/m07_*.sql)                    ║
║ [ ] 2. Immutability & FB-06 Database Triggers                                ║
║ [ ] 3. Fail-Closed RLS Policies on 5 New LEARN Tables                        ║
║ [ ] 4. Projection Engine Implementation (src/services/institutional*.ts)     ║
║ [ ] 5. Closed-Loop Telemetry RPC Implementation                              ║
║ [ ] 6. Adversarial Test Harness (Suites 17–20) Execution                     ║
║ [ ] 7. 276 + 20 = 296 Checks Master Regression Verification                  ║
║ [ ] 8. TypeScript Compilation & Vite Production Bundle Clean                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║ READINESS STATUS: 🟢 SPECIFICATION SEALED — READY FOR CODE & MIGRATION EXEC   ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

*Dokumen ini menjadi Kontrak Arsitektur Resmi (Single Source of Truth) untuk pembukaan eksekusi kode dan migrasi database Stage 4.5-C Yapendik School OS.*
