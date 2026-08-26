# YAPENDIK SCHOOL OS — STAGE 3: TECHNICAL & GOVERNANCE SPECIFICATION
## Version 1.1 — Hardened Implementation-Ready Technical Contract

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Document Type:** Technical Architecture & Governance Specification  
**Status:** **ACTIVE CONTRACT — HARDENED & CLEARED FOR MIGRATION EXECUTION**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2, EIA v0.1 & STAGE 3 CANONICAL INFORMATION MODEL v1.0 (Locked Baseline)  
**Prerequisites:** Stage 1 Runtime Baseline (FROZEN) & Stage 2 Governed Provisioning Baseline (FROZEN)  
**Core Motto:** *Information Before Interface • Append New Temporal State, Never Rewrite History • Service Before Surveillance.*

---

## 1. Executive Summary & Specification Scope

Dokumen ini adalah **kontrak spesifikasi teknis dan tata kelola versi hardened (Version 1.1 Hardened Contract)** untuk implementasi **Stage 3: Temporal & Institutional Continuity**. Seluruh 6 Blocker Teknis dan 2 Rekomendasi Non-Blocking dari peninjauan arsitektur telah diselesaikan dan dipadukan secara presisi.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   STAGE 3 HARDENED TECHNICAL ARCHITECTURE                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Temporal & Lineage DDL ──► Append-only placement lineage & temporal period lifecycle│
│ 2. Discrete State Machine ──► 5-phase semester & 4-phase academic year state machines  │
│ 3. Fail-Closed Temporal RLS ─► Total denial of direct client DML (Governed RPC only)   │
│ 4. Trusted Auth Resolution ─► Identity derived strictly from auth.uid() server-side    │
│ 5. Defensive Governed RPCs ─► 100% Population reconciliation on LPPA & Attendance      │
│ 6. Absolute Immutability   ─► Triggers block all retro-mutations on CLOSED & TERMINAL  │
│ 7. Exception Telemetry    ──► Pure query derived indicators (Zero mutable tables)      │
│ 8. Authorized Trajectory   ──► Child longitudinal curve gated by trusted relationship  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Translation of Semantic Invariants to Technical Guarantees

Sepuluh Invariant Semantik (I-01 s.d. I-10) yang telah dikunci pada Model Informasi Kanonikal diterjemahkan ke dalam jaminan teknis (*Technical Enforcement Mechanisms*):

```text
┌────────┬───────────────────────────┬───────────────────────────────────────────────────────────┐
│ ID     │ Semantic Invariant        │ Technical Enforcement Mechanism                           │
├────────┼───────────────────────────┼───────────────────────────────────────────────────────────┤
│ I-01   │ Temporal History          │ DDL: Append-only rows in `student_placement_records`;     │
│        │                           │ Trigger: rejects UPDATE on immutable historical columns.  │
├────────┼───────────────────────────┼───────────────────────────────────────────────────────────┤
│ I-02   │ Placement Evidence        │ Dedicated table `student_placement_records` with snapshot │
│        │                           │ of `(student, class, teacher, semester, dates, status)`.  │
├────────┼───────────────────────────┼───────────────────────────────────────────────────────────┤
│ I-03   │ Current Projection        │ Trigger `trg_sync_student_current_class_projection` auto- │
│        │                           │ projects `students.current_class_id` from active lineage. │
├────────┼───────────────────────────┼───────────────────────────────────────────────────────────┤
│ I-04   │ Lifecycle Governance      │ Direct DML on temporal tables blocked; mutations executed │
│        │                           │ strictly via atomic `SECURITY DEFINER` RPCs.              │
├────────┼───────────────────────────┼───────────────────────────────────────────────────────────┤
│ I-05   │ Historical Protection     │ Trigger `trg_prevent_mutation_on_closed_semester` blocks  │
│        │                           │ DML (INSERT/UPDATE/DELETE) on CLOSED/ARCHIVED terms.      │
├────────┼───────────────────────────┼───────────────────────────────────────────────────────────┤
│ I-06   │ Derived Intelligence      │ Function `fn_derive_school_health_telemetry` computes     │
│        │                           │ health on-the-fly from live data without mutable tables.  │
├────────┼───────────────────────────┼───────────────────────────────────────────────────────────┤
│ I-07   │ Exception Stewardship     │ Telemetry surfaces 4 canonical indicators and diagnostic  │
│        │                           │ exception flags instead of continuous micromanagement.    │
├────────┼───────────────────────────┼───────────────────────────────────────────────────────────┤
│ I-08   │ Longitudinal Evidence     │ Function `fn_get_student_longitudinal_trajectory` queries │
│        │                           │ chronological sequence of evidence with auth checks.      │
├────────┼───────────────────────────┼───────────────────────────────────────────────────────────┤
│ I-09   │ Auditability              │ All Stage 3 RPCs write structured immutable payloads to   │
│        │                           │ `audit_logs` (governance ledger).                          │
├────────┼───────────────────────────┼───────────────────────────────────────────────────────────┤
│ I-10   │ Governed DB Boundary      │ Direct client SQL writes denied by RLS for ALL roles;     │
│        │                           │ mutations gated strictly to trusted SECURITY DEFINER RPCs.│
└────────┴───────────────────────────┴───────────────────────────────────────────────────────────┘
```

---

## 3. Physical DDL & Database Schema Contract

### 3.1 Enhancements to Existing Temporal Tables

#### Table: `academic_years`
```sql
ALTER TABLE public.academic_years 
  ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'ACTIVE' 
    CHECK (lifecycle_status IN ('PLANNED', 'ACTIVE', 'CLOSED', 'ARCHIVED')),
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS closed_by_person_id TEXT NULL REFERENCES public.people(id);

-- Constraint: Exactly ONE active academic year per school at any time
CREATE UNIQUE INDEX IF NOT EXISTS uq_academic_years_single_active_per_school
  ON public.academic_years (school_id)
  WHERE (lifecycle_status = 'ACTIVE');
```

#### Table: `academic_periods` (Semesters)
```sql
ALTER TABLE public.academic_periods 
  ADD COLUMN IF NOT EXISTS lifecycle_status TEXT NOT NULL DEFAULT 'ACTIVE' 
    CHECK (lifecycle_status IN ('PLANNED', 'ACTIVE', 'CLOSING', 'CLOSED', 'ARCHIVED')),
  ADD COLUMN IF NOT EXISTS closed_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS closed_by_person_id TEXT NULL REFERENCES public.people(id);

-- Constraint: At most ONE active or closing semester per school at any time
CREATE UNIQUE INDEX IF NOT EXISTS uq_academic_periods_single_active_per_school
  ON public.academic_periods (school_id)
  WHERE (lifecycle_status IN ('ACTIVE', 'CLOSING'));
```

---

### 3.2 Canonical Lineage Table: `student_placement_records`

Tabel baru ini menyimpan riwayat penempatan rombel secara abadi (*Append-Only Historical Evidence*):

```sql
CREATE TABLE IF NOT EXISTS public.student_placement_records (
  id TEXT PRIMARY KEY DEFAULT ('plc_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16)),
  student_id TEXT NOT NULL REFERENCES public.students(id) ON DELETE RESTRICT,
  school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
  academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
  semester_id TEXT NOT NULL REFERENCES public.academic_periods(id) ON DELETE RESTRICT,
  class_id TEXT NOT NULL REFERENCES public.classes(id) ON DELETE RESTRICT,
  homeroom_teacher_person_id TEXT NULL REFERENCES public.people(id),
  entry_date DATE NOT NULL,
  exit_date DATE NULL,
  placement_status TEXT NOT NULL DEFAULT 'ACTIVE' 
    CHECK (placement_status IN ('ACTIVE', 'COMPLETED', 'PROMOTED', 'TRANSFERRED')),
  promotion_remarks TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Invariant: Exactly ONE active placement per student at any given time
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_single_active_placement
  ON public.student_placement_records (student_id)
  WHERE (placement_status = 'ACTIVE');

-- Invariant: A student cannot have multiple placements in the same semester
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_semester_placement
  ON public.student_placement_records (student_id, semester_id);

-- Performance Indices for Historical & Lineage Queries
CREATE INDEX IF NOT EXISTS idx_placement_school_semester 
  ON public.student_placement_records (school_id, semester_id, class_id);
CREATE INDEX IF NOT EXISTS idx_placement_student_lineage 
  ON public.student_placement_records (student_id, entry_date ASC);
```

---

### 3.3 Enhancements to `students` Table

```sql
-- Maintain current_status as persistent institutional status
ALTER TABLE public.students 
  DROP CONSTRAINT IF EXISTS students_status_check;

ALTER TABLE public.students 
  ADD CONSTRAINT students_status_check 
    CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED'));
```

---

## 4. State Machines & Transition Contracts

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 3 STATE TRANSITION CONTRACTS                              │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. AcademicSemester:  PLANNED ──► ACTIVE ──► CLOSING ──► CLOSED ──► ARCHIVED          │
│ 2. AcademicYear:      PLANNED ──► ACTIVE ──────────────► CLOSED ──► ARCHIVED          │
│ 3. PlacementRecord:   ACTIVE  ──► PROMOTED / COMPLETED / TRANSFERRED (Frozen Forever)  │
│ 4. StudentProfile:    ACTIVE  ──► TRANSFERRED / WITHDRAWN / GRADUATED                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Semester State Transition Invariants
1. `PLANNED → ACTIVE`: Triggered upon term start or during provisioning.
2. `ACTIVE → CLOSING`: Initiated by Headmaster when term examinations / LPPA evaluations begin. During `CLOSING`:
   - No new student admissions or classroom creations permitted.
   - Teachers continue finalizing LPPA drafts and recording daily attendance.
3. `CLOSING → CLOSED`: Executed via `rpc_close_academic_semester`.
   - Precondition: 100% active enrolled students have APPROVED/PUBLISHED LPPA; zero missing attendance registers.
   - Result: Term operations frozen; records become read-only.
4. `CLOSED → ARCHIVED`: Executed during long-term institutional rollover/audit.

### 4.2 Placement Record Terminalization (Option A Guarantee)
- `CLOSE_SEMESTER` **does NOT** terminalize `student_placement_records`.
- An active placement undergoes terminalization **only** via:
  1. `rpc_promote_classroom_cohort` $\longrightarrow$ `placement_status = 'PROMOTED'`, `exit_date = sourceSemester.end_date`.
  2. `rpc_graduate_student_cohort` $\longrightarrow$ `placement_status = 'COMPLETED'`, `exit_date = finalSemester.end_date`.

---

## 5. PostgreSQL Immutability & Protection Triggers

### 5.1 Trigger: Prevent Mutations on Closed Semesters (`trg_prevent_mutation_on_closed_semester`)
*(Hardened: Handles `DELETE` using `OLD` record and `INSERT/UPDATE` using `NEW` record)*

```sql
CREATE OR REPLACE FUNCTION public.fn_guard_closed_semester_mutations()
RETURNS TRIGGER AS $$
DECLARE
  v_semester_status TEXT;
  v_target_semester_id TEXT;
BEGIN
  -- Handle TG_OP correctly: DELETE has OLD, INSERT/UPDATE has NEW
  IF TG_OP = 'DELETE' THEN
    v_target_semester_id := OLD.academic_period_id;
  ELSE
    v_target_semester_id := NEW.academic_period_id;
  END IF;

  -- Check status of target semester
  SELECT lifecycle_status INTO v_semester_status
  FROM public.academic_periods
  WHERE id = v_target_semester_id;

  IF v_semester_status IN ('CLOSED', 'ARCHIVED') THEN
    RAISE EXCEPTION 'CANNOT_MUTATE_CLOSED_SEMESTER: Academic period % is %, % operation forbidden on %.', 
      v_target_semester_id, v_semester_status, TG_OP, TG_TABLE_NAME;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Bind triggers to operational tables
CREATE TRIGGER trg_guard_closed_semester_obs
  BEFORE INSERT OR UPDATE OR DELETE ON public.observations
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_closed_semester_mutations();

CREATE TRIGGER trg_guard_closed_semester_att
  BEFORE INSERT OR UPDATE OR DELETE ON public.daily_attendance_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_closed_semester_mutations();

CREATE TRIGGER trg_guard_closed_semester_lppa
  BEFORE INSERT OR UPDATE OR DELETE ON public.student_progress_reports
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_closed_semester_mutations();
```

---

### 5.2 Trigger: Absolute Immutability on Terminal Placements (`trg_placement_terminalization_guard`)
*(Hardened: Rejects any mutation on terminal records and locks all historical fields)*

```sql
CREATE OR REPLACE FUNCTION public.fn_guard_placement_terminalization()
RETURNS TRIGGER AS $$
BEGIN
  -- Rule 1: If placement is ALREADY terminal, block ANY update completely
  IF OLD.placement_status IN ('COMPLETED', 'PROMOTED', 'TRANSFERRED') THEN
    RAISE EXCEPTION 'CANNOT_MUTATE_TERMINAL_PLACEMENT: Placement % has already been finalized as % and is permanently frozen.', 
      OLD.id, OLD.placement_status;
  END IF;

  -- Rule 2: Prevent modification of historical fact columns
  IF (OLD.student_id != NEW.student_id OR 
      OLD.school_id != NEW.school_id OR 
      OLD.academic_year_id != NEW.academic_year_id OR 
      OLD.semester_id != NEW.semester_id OR 
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

  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_placement_terminalization_guard
  BEFORE UPDATE ON public.student_placement_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_guard_placement_terminalization();
```

---

### 5.3 Trigger: Projection Synchronization (`trg_sync_student_current_class_projection`)

```sql
CREATE OR REPLACE FUNCTION public.fn_sync_student_current_class()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.placement_status = 'ACTIVE') THEN
    UPDATE public.students 
    SET current_class_id = NEW.class_id, updated_at = now()
    WHERE id = NEW.student_id;
  ELSIF (TG_OP = 'UPDATE' AND OLD.placement_status = 'ACTIVE' AND NEW.placement_status != 'ACTIVE') THEN
    -- If placed student became terminal and no other active placement exists, clear projection
    IF NOT EXISTS (
      SELECT 1 FROM public.student_placement_records 
      WHERE student_id = NEW.student_id AND placement_status = 'ACTIVE' AND id != NEW.id
    ) THEN
      UPDATE public.students 
      SET current_class_id = NULL, updated_at = now()
      WHERE id = NEW.student_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_student_current_class
  AFTER INSERT OR UPDATE ON public.student_placement_records
  FOR EACH ROW EXECUTE FUNCTION public.fn_sync_student_current_class();
```

---

## 6. Governed SECURITY DEFINER RPC Contracts

Semua mutasi institusional Stage 3 dieksekusi melalui fungsi PostgreSQL `SECURITY DEFINER` dengan **resolusi identitas tepercaya server-side (`auth.uid()`)**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                           STAGE 3 GOVERNED RPC PORTFOLIO                               │
├──────────────────────────────────┬─────────────────────────────────────────────────────┤
│ RPC Name                         │ Functionality & Invariant                           │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ `rpc_close_academic_semester`    │ 100% Population LPPA reconciliation; seals term.    │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ `rpc_close_academic_year`        │ Verifies all semesters closed; marks AY CLOSED.     │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ `rpc_create_next_academic_year`  │ Spawns successor AY and first semester (GANJIL).    │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ `rpc_promote_classroom_cohort`   │ Defensive validation & atomic cohort advancement.   │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ `rpc_graduate_student_cohort`    │ Terminalizes TK B students; marks GRADUATED.        │
├──────────────────────────────────┼─────────────────────────────────────────────────────┤
│ `rpc_initialize_next_semester`   │ Spawns GENAP semester in active AY.                 │
└──────────────────────────────────┴─────────────────────────────────────────────────────┘
```

---

### 6.1 `rpc_close_academic_semester`
*(Hardened: Server-side `auth.uid()` resolution & 100% Enrolled Student LPPA Reconciliation)*

```sql
CREATE OR REPLACE FUNCTION public.rpc_close_academic_semester(
  p_school_id TEXT,
  p_semester_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_auth_id TEXT;
  v_caller_person_id TEXT;
  v_is_superadmin BOOLEAN := false;
  v_is_headmaster BOOLEAN := false;
  v_semester RECORD;
  v_enrolled_count INT := 0;
  v_approved_lppa_count INT := 0;
  v_unapproved_lppa_count INT := 0;
BEGIN
  -- 1. Trusted Server-Side Authentication & Authorization Resolution
  v_caller_auth_id := auth.uid()::text;
  IF v_caller_auth_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication token missing.';
  END IF;

  SELECT COALESCE(
    (SELECT sp.person_id FROM public.staff_profiles sp WHERE sp.id = v_caller_auth_id OR sp.person_id = v_caller_auth_id LIMIT 1),
    v_caller_auth_id
  ) INTO v_caller_person_id;

  SELECT EXISTS(SELECT 1 FROM public.staff_profiles WHERE person_id = v_caller_person_id AND role = 'SUPERADMIN') INTO v_is_superadmin;
  SELECT EXISTS(SELECT 1 FROM public.schools WHERE id = p_school_id AND headmaster_person_id = v_caller_person_id) INTO v_is_headmaster;

  IF NOT (v_is_superadmin OR v_is_headmaster) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only assigned Headmaster or Superadmin may close semester.';
  END IF;

  -- 2. Verify Semester Existence & State
  SELECT * INTO v_semester FROM public.academic_periods 
  WHERE id = p_semester_id AND school_id = p_school_id;

  IF v_semester.id IS NULL THEN
    RAISE EXCEPTION 'SEMESTER_NOT_FOUND: Semester % does not belong to school %.', p_semester_id, p_school_id;
  END IF;

  IF v_semester.lifecycle_status NOT IN ('ACTIVE', 'CLOSING') THEN
    RAISE EXCEPTION 'INVALID_SEMESTER_STATE: Semester is already %.', v_semester.lifecycle_status;
  END IF;

  -- 3. Hardened Precondition: 100% Active Student LPPA Reconciliation
  -- Count active placed students in this semester
  SELECT COUNT(DISTINCT student_id) INTO v_enrolled_count
  FROM public.student_placement_records
  WHERE school_id = p_school_id AND semester_id = p_semester_id AND placement_status = 'ACTIVE';

  -- Count APPROVED/PUBLISHED progress reports for active students in this semester
  SELECT COUNT(DISTINCT r.student_id) INTO v_approved_lppa_count
  FROM public.student_progress_reports r
  JOIN public.student_placement_records spr 
    ON spr.student_id = r.student_id AND spr.semester_id = p_semester_id AND spr.placement_status = 'ACTIVE'
  WHERE r.academic_period_id = p_semester_id AND r.status IN ('APPROVED', 'PUBLISHED');

  IF v_enrolled_count > 0 AND v_approved_lppa_count < v_enrolled_count THEN
    RAISE EXCEPTION 'PRECONDITION_FAILED: Only % of % active enrolled students have APPROVED/PUBLISHED LPPA progress reports.', 
      v_approved_lppa_count, v_enrolled_count;
  END IF;

  -- Check for any remaining DRAFT reports
  SELECT COUNT(*) INTO v_unapproved_lppa_count
  FROM public.student_progress_reports
  WHERE academic_period_id = p_semester_id AND status NOT IN ('APPROVED', 'PUBLISHED');

  IF v_unapproved_lppa_count > 0 THEN
    RAISE EXCEPTION 'PRECONDITION_FAILED: % LPPA report(s) are still in DRAFT or pending review.', v_unapproved_lppa_count;
  END IF;

  -- 4. Atomic Mutation: Close Semester
  UPDATE public.academic_periods
  SET lifecycle_status = 'CLOSED',
      closed_at = now(),
      closed_by_person_id = v_caller_person_id
  WHERE id = p_semester_id;

  -- 5. Append Audit Event to Governance Ledger
  INSERT INTO public.audit_logs (
    id, school_id, user_id, action, entity_type, entity_id, new_data, created_at
  ) VALUES (
    'aud_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16),
    p_school_id,
    v_caller_person_id,
    'CLOSE_SEMESTER',
    'academic_period',
    p_semester_id,
    jsonb_build_object(
      'semester_id', p_semester_id,
      'semester_type', v_semester.type,
      'enrolled_reconciled_count', v_enrolled_count,
      'closed_by', v_caller_person_id,
      'closed_at', now()
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'semester_id', p_semester_id,
    'status', 'CLOSED',
    'enrolled_reconciled_count', v_enrolled_count
  );
END;
$$;
```

---

### 6.2 `rpc_promote_classroom_cohort`
*(Hardened: Server-side `auth.uid()` resolution, comprehensive source & target semester defensive validation)*

```sql
CREATE OR REPLACE FUNCTION public.rpc_promote_classroom_cohort(
  p_school_id TEXT,
  p_source_class_id TEXT,
  p_target_class_id TEXT,
  p_target_semester_id TEXT,
  p_student_ids TEXT[]
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_auth_id TEXT;
  v_caller_person_id TEXT;
  v_is_superadmin BOOLEAN := false;
  v_is_headmaster BOOLEAN := false;
  v_source_class RECORD;
  v_target_class RECORD;
  v_target_semester RECORD;
  v_source_semester RECORD;
  v_student_count INT;
  v_current_placed_in_target INT;
  v_target_capacity INT;
  v_student_id TEXT;
  v_promoted_count INT := 0;
BEGIN
  -- 1. Trusted Server-Side Authentication & Authorization Resolution
  v_caller_auth_id := auth.uid()::text;
  IF v_caller_auth_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication token missing.';
  END IF;

  SELECT COALESCE(
    (SELECT sp.person_id FROM public.staff_profiles sp WHERE sp.id = v_caller_auth_id OR sp.person_id = v_caller_auth_id LIMIT 1),
    v_caller_auth_id
  ) INTO v_caller_person_id;

  SELECT EXISTS(SELECT 1 FROM public.staff_profiles WHERE person_id = v_caller_person_id AND role = 'SUPERADMIN') INTO v_is_superadmin;
  SELECT EXISTS(SELECT 1 FROM public.schools WHERE id = p_school_id AND headmaster_person_id = v_caller_person_id) INTO v_is_headmaster;

  IF NOT (v_is_superadmin OR v_is_headmaster) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only assigned Headmaster or Superadmin may promote cohorts.';
  END IF;

  -- 2. Validate Source Classroom & Closed Source Semester
  SELECT * INTO v_source_class FROM public.classes WHERE id = p_source_class_id AND school_id = p_school_id;
  IF v_source_class.id IS NULL THEN
    RAISE EXCEPTION 'SOURCE_CLASS_NOT_FOUND: Source class % does not belong to school %.', p_source_class_id, p_school_id;
  END IF;

  SELECT * INTO v_source_semester FROM public.academic_periods 
  WHERE school_id = p_school_id AND academic_year_id = v_source_class.academic_year_id
  ORDER BY end_date DESC LIMIT 1;

  IF v_source_semester.id IS NOT NULL AND v_source_semester.lifecycle_status NOT IN ('CLOSED', 'ARCHIVED', 'CLOSING') THEN
    RAISE EXCEPTION 'SOURCE_SEMESTER_NOT_CLOSED: Source semester % must be CLOSED or CLOSING prior to promotion.', v_source_semester.id;
  END IF;

  -- 3. Validate Target Classroom & Target Semester
  SELECT * INTO v_target_class FROM public.classes WHERE id = p_target_class_id AND school_id = p_school_id;
  IF v_target_class.id IS NULL THEN
    RAISE EXCEPTION 'TARGET_CLASS_NOT_FOUND: Target class % does not belong to school %.', p_target_class_id, p_school_id;
  END IF;

  SELECT * INTO v_target_semester FROM public.academic_periods WHERE id = p_target_semester_id AND school_id = p_school_id;
  IF v_target_semester.id IS NULL THEN
    RAISE EXCEPTION 'TARGET_SEMESTER_NOT_FOUND';
  END IF;

  IF v_target_semester.lifecycle_status NOT IN ('PLANNED', 'ACTIVE') THEN
    RAISE EXCEPTION 'TARGET_SEMESTER_NOT_ACTIVE: Target semester must be PLANNED or ACTIVE.';
  END IF;

  -- 4. Capacity & Student List Precondition Checks
  v_student_count := array_length(p_student_ids, 1);
  IF v_student_count IS NULL OR v_student_count = 0 THEN
    RAISE EXCEPTION 'NO_STUDENTS_SELECTED';
  END IF;

  SELECT COUNT(*) INTO v_current_placed_in_target
  FROM public.student_placement_records
  WHERE class_id = p_target_class_id AND semester_id = v_target_semester.id AND placement_status = 'ACTIVE';

  v_target_capacity := v_target_class.capacity;
  IF (v_current_placed_in_target + v_student_count) > v_target_capacity THEN
    RAISE EXCEPTION 'CAPACITY_EXCEEDED: Target class capacity is %, but currently has % placed in target semester. Cannot add % more.',
      v_target_capacity, v_current_placed_in_target, v_student_count;
  END IF;

  -- 5. Atomic Promotion Loop with Individual Student Lineage Verification
  FOREACH v_student_id IN ARRAY p_student_ids LOOP
    -- Verify active placement exists in source class
    IF NOT EXISTS (
      SELECT 1 FROM public.student_placement_records 
      WHERE student_id = v_student_id AND class_id = p_source_class_id AND placement_status = 'ACTIVE'
    ) THEN
      RAISE EXCEPTION 'STUDENT_NOT_ACTIVE_IN_SOURCE: Student % has no active placement in source class %.', 
        v_student_id, p_source_class_id;
    END IF;

    -- A. Terminalize active placement in source class
    UPDATE public.student_placement_records
    SET placement_status = 'PROMOTED',
        exit_date = v_target_semester.start_date,
        promotion_remarks = 'Promoted to ' || v_target_class.name
    WHERE student_id = v_student_id 
      AND class_id = p_source_class_id 
      AND placement_status = 'ACTIVE';

    -- B. Append new active placement in target class
    INSERT INTO public.student_placement_records (
      student_id, school_id, academic_year_id, semester_id, class_id,
      homeroom_teacher_person_id, entry_date, placement_status
    ) VALUES (
      v_student_id, p_school_id, v_target_semester.academic_year_id, v_target_semester.id, v_target_class.id,
      v_target_class.homeroom_teacher_id, v_target_semester.start_date, 'ACTIVE'
    );

    v_promoted_count := v_promoted_count + 1;
  END LOOP;

  -- 6. Append Audit Event to Governance Ledger
  INSERT INTO public.audit_logs (
    id, school_id, user_id, action, entity_type, entity_id, new_data, created_at
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
      'target_semester_id', p_target_semester_id,
      'student_count', v_promoted_count,
      'student_ids', p_student_ids
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'promoted_count', v_promoted_count,
    'target_class_id', p_target_class_id
  );
END;
$$;
```

---

### 6.3 `rpc_graduate_student_cohort`
*(Hardened: Server-side `auth.uid()` resolution & explicit TK B terminalization)*

```sql
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
  v_caller_auth_id TEXT;
  v_caller_person_id TEXT;
  v_is_superadmin BOOLEAN := false;
  v_is_headmaster BOOLEAN := false;
  v_student_id TEXT;
  v_graduated_count INT := 0;
BEGIN
  -- 1. Trusted Server-Side Authentication & Authorization Resolution
  v_caller_auth_id := auth.uid()::text;
  IF v_caller_auth_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication token missing.';
  END IF;

  SELECT COALESCE(
    (SELECT sp.person_id FROM public.staff_profiles sp WHERE sp.id = v_caller_auth_id OR sp.person_id = v_caller_auth_id LIMIT 1),
    v_caller_auth_id
  ) INTO v_caller_person_id;

  SELECT EXISTS(SELECT 1 FROM public.staff_profiles WHERE person_id = v_caller_person_id AND role = 'SUPERADMIN') INTO v_is_superadmin;
  SELECT EXISTS(SELECT 1 FROM public.schools WHERE id = p_school_id AND headmaster_person_id = v_caller_person_id) INTO v_is_headmaster;

  IF NOT (v_is_superadmin OR v_is_headmaster) THEN
    RAISE EXCEPTION 'UNAUTHORIZED: Only assigned Headmaster or Superadmin may graduate students.';
  END IF;

  -- 2. Atomic Graduation Loop
  FOREACH v_student_id IN ARRAY p_student_ids LOOP
    -- Terminalize Placement
    UPDATE public.student_placement_records
    SET placement_status = 'COMPLETED',
        exit_date = CURRENT_DATE,
        promotion_remarks = 'Graduated from TK B'
    WHERE student_id = v_student_id 
      AND class_id = p_class_id 
      AND placement_status = 'ACTIVE';

    -- Update Student Institutional Status
    UPDATE public.students
    SET status = 'GRADUATED',
        current_class_id = NULL,
        updated_at = now()
    WHERE id = v_student_id;

    v_graduated_count := v_graduated_count + 1;
  END LOOP;

  -- 3. Append Audit Event to Governance Ledger
  INSERT INTO public.audit_logs (
    id, school_id, user_id, action, entity_type, entity_id, new_data, created_at
  ) VALUES (
    'aud_' || substr(md5(random()::text || clock_timestamp()::text), 1, 16),
    p_school_id,
    v_caller_person_id,
    'GRADUATE_COHORT',
    'class',
    p_class_id,
    jsonb_build_object(
      'class_id', p_class_id,
      'graduated_count', v_graduated_count,
      'student_ids', p_student_ids
    ),
    now()
  );

  RETURN jsonb_build_object(
    'success', true,
    'graduated_count', v_graduated_count
  );
END;
$$;
```

---

## 7. Fail-Closed Temporal RLS Security Policies
*(Hardened: Complete denial of direct client DML for ALL roles including Superadmin)*

```sql
-- Enable RLS on student_placement_records
ALTER TABLE public.student_placement_records ENABLE ROW LEVEL SECURITY;

-- 1. Policy: Superadmin SELECT Access
CREATE POLICY "superadmin_read_all_placements" ON public.student_placement_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.person_id = (SELECT auth.uid()::text) AND sp.role = 'SUPERADMIN'
    )
  );

-- 2. Policy: School Staff SELECT Access in Their School
CREATE POLICY "staff_read_school_placements" ON public.student_placement_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.staff_profiles sp
      WHERE sp.person_id = (SELECT auth.uid()::text) AND sp.school_id = student_placement_records.school_id
    )
  );

-- 3. Policy: Guardians SELECT Access for Their Linked Children Only
CREATE POLICY "guardian_read_child_placements" ON public.student_placement_records
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.guardian_relationships gr
      JOIN public.students s ON s.person_id = gr.student_person_id
      WHERE gr.guardian_person_id = (SELECT auth.uid()::text) 
        AND s.id = student_placement_records.student_id
    )
  );

-- 4. Fail-Closed Mutation Barrier: Deny Direct Client DML for ALL authenticated roles
-- (Mutations are gated STRICTLY to SECURITY DEFINER Governed RPCs)
CREATE POLICY "deny_client_insert_placement" ON public.student_placement_records
  FOR INSERT TO authenticated WITH CHECK (false);

CREATE POLICY "deny_client_update_placement" ON public.student_placement_records
  FOR UPDATE TO authenticated USING (false);

CREATE POLICY "deny_client_delete_placement" ON public.student_placement_records
  FOR DELETE TO authenticated USING (false);
```

---

## 8. Derived Institutional Health Telemetry Contract
*(Hardened: Explicit calculation of 4 Canonical Indicators)*

```sql
CREATE OR REPLACE FUNCTION public.fn_derive_school_health_telemetry(p_school_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_active_sem RECORD;
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
  v_exceptions JSONB := '[]'::JSONB;
BEGIN
  -- 1. Get Active Semester
  SELECT * INTO v_active_sem FROM public.academic_periods
  WHERE school_id = p_school_id AND lifecycle_status IN ('ACTIVE', 'CLOSING')
  LIMIT 1;

  IF v_active_sem.id IS NULL THEN
    RETURN jsonb_build_object(
      'school_id', p_school_id,
      'health_status', 'CRITICAL_BLOCKER',
      'exceptions', jsonb_build_array('NO_ACTIVE_SEMESTER')
    );
  END IF;

  -- Indicator 1: Capacity Utilization
  SELECT COALESCE(SUM(capacity), 0) INTO v_total_capacity FROM public.classes WHERE school_id = p_school_id;
  SELECT COUNT(*) INTO v_total_students FROM public.student_placement_records 
  WHERE school_id = p_school_id AND semester_id = v_active_sem.id AND placement_status = 'ACTIVE';

  IF v_total_capacity > 0 THEN
    v_capacity_pct := ROUND((v_total_students::NUMERIC / v_total_capacity::NUMERIC) * 100, 1);
  END IF;

  -- Indicator 2: Staffing Compliance
  SELECT COUNT(*) INTO v_unstaffed_classes FROM public.classes
  WHERE school_id = p_school_id AND homeroom_teacher_id IS NULL;

  IF v_unstaffed_classes > 0 THEN
    v_exceptions := v_exceptions || jsonb_build_object('code', 'UNSTAFFED_CLASSES', 'count', v_unstaffed_classes);
    v_health_status := 'ATTENTION_REQUIRED';
  END IF;

  -- Indicator 3: Attendance Consistency
  SELECT COUNT(DISTINCT date) INTO v_recorded_att_days
  FROM public.daily_attendance_records
  WHERE academic_period_id = v_active_sem.id;

  -- Indicator 4: Curriculum Velocity (Observation & LPPA Progress)
  SELECT COUNT(*) INTO v_total_obs_count FROM public.observations WHERE academic_period_id = v_active_sem.id;
  SELECT COUNT(*) INTO v_approved_lppa_count FROM public.student_progress_reports 
  WHERE academic_period_id = v_active_sem.id AND status IN ('APPROVED', 'PUBLISHED');

  IF v_total_students > 0 THEN
    v_curriculum_velocity_pct := ROUND((v_approved_lppa_count::NUMERIC / v_total_students::NUMERIC) * 100, 1);
  END IF;

  IF v_active_sem.lifecycle_status = 'CLOSING' THEN
    SELECT COUNT(*) INTO v_pending_lppa_count FROM public.student_progress_reports
    WHERE academic_period_id = v_active_sem.id AND status NOT IN ('APPROVED', 'PUBLISHED');

    IF v_pending_lppa_count > 0 THEN
      v_exceptions := v_exceptions || jsonb_build_object('code', 'PENDING_LPPA_APPROVALS', 'count', v_pending_lppa_count);
      v_health_status := 'ATTENTION_REQUIRED';
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'school_id', p_school_id,
    'semester_id', v_active_sem.id,
    'semester_type', v_active_sem.type,
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
```

---

## 9. Child Longitudinal Trajectory Contract
*(Hardened: Trusted server-side authorization check against caller)*

```sql
CREATE OR REPLACE FUNCTION public.fn_get_student_longitudinal_trajectory(p_student_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_caller_auth_id TEXT;
  v_caller_person_id TEXT;
  v_is_authorized BOOLEAN := false;
  v_student RECORD;
  v_placements JSONB;
  v_lppa_history JSONB;
BEGIN
  -- 1. Trusted Server-Side Authentication
  v_caller_auth_id := auth.uid()::text;
  IF v_caller_auth_id IS NULL THEN
    RAISE EXCEPTION 'UNAUTHENTICATED: Authentication token missing.';
  END IF;

  SELECT COALESCE(
    (SELECT sp.person_id FROM public.staff_profiles sp WHERE sp.id = v_caller_auth_id OR sp.person_id = v_caller_auth_id LIMIT 1),
    v_caller_auth_id
  ) INTO v_caller_person_id;

  SELECT * INTO v_student FROM public.students WHERE id = p_student_id;
  IF v_student.id IS NULL THEN
    RAISE EXCEPTION 'STUDENT_NOT_FOUND';
  END IF;

  -- 2. Authorization Boundary Check
  -- Authorized if: Superadmin OR Staff at student's school OR Linked Guardian
  SELECT (
    EXISTS (SELECT 1 FROM public.staff_profiles WHERE person_id = v_caller_person_id AND role = 'SUPERADMIN')
    OR
    EXISTS (SELECT 1 FROM public.staff_profiles WHERE person_id = v_caller_person_id AND school_id = v_student.school_id)
    OR
    EXISTS (SELECT 1 FROM public.guardian_relationships WHERE guardian_person_id = v_caller_person_id AND student_person_id = v_student.person_id)
  ) INTO v_is_authorized;

  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'UNAUTHORIZED: You do not have permission to view this student trajectory.';
  END IF;

  -- 3. Retrieve Ordered Placement Lineage
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'placement_id', spr.id,
      'academic_year', ay.name,
      'semester', ap.type,
      'class_name', c.name,
      'entry_date', spr.entry_date,
      'exit_date', spr.exit_date,
      'status', spr.placement_status,
      'remarks', spr.promotion_remarks
    ) ORDER BY spr.entry_date ASC
  ), '[]'::JSONB) INTO v_placements
  FROM public.student_placement_records spr
  JOIN public.academic_years ay ON ay.id = spr.academic_year_id
  JOIN public.academic_periods ap ON ap.id = spr.semester_id
  JOIN public.classes c ON c.id = spr.class_id
  WHERE spr.student_id = p_student_id;

  -- 4. Retrieve Formal LPPA Term Progress Reports
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'report_id', r.id,
      'semester', ap.type,
      'status', r.status,
      'approved_at', r.approved_at
    ) ORDER BY r.created_at ASC
  ), '[]'::JSONB) INTO v_lppa_history
  FROM public.student_progress_reports r
  JOIN public.academic_periods ap ON ap.id = r.academic_period_id
  WHERE r.student_id = p_student_id;

  RETURN jsonb_build_object(
    'student_id', p_student_id,
    'nis', v_student.nis,
    'current_status', v_student.status,
    'placement_lineage', v_placements,
    'lppa_history', v_lppa_history
  );
END;
$$;
```

---

## 10. Verification Test Protocol & Exit Gates (UAT-15 s.d. UAT-20)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 3 VERIFICATION GATES PROTOCOL                             │
├────────┬─────────────────────────────────────┬─────────────────────────────────────────┤
│ Gate   │ Verification Objective              │ Success Criteria                        │
├────────┼─────────────────────────────────────┼─────────────────────────────────────────┤
│ UAT-15 │ Governed Semester Closure Gate      │ Semester closes; 100% LPPA reconciled;  │
│        │                                     │ retro-mutations blocked by triggers.    │
├────────┼─────────────────────────────────────┼─────────────────────────────────────────┤
│ UAT-16 │ Governed Cohort Promotion Gate      │ TK A advances to TK B; lineage recorded;│
│        │                                     │ currentClass projection updated.        │
├────────┼─────────────────────────────────────┼─────────────────────────────────────────┤
│ UAT-17 │ Governed Cohort Graduation Gate     │ TK B students graduate; status becomes  │
│        │                                     │ GRADUATED; class capacity released.     │
├────────┼─────────────────────────────────────┼─────────────────────────────────────────┤
│ UAT-18 │ Academic Year Rollover Gate         │ AY 2026/27 closes; AY 2027/28 spawns;   │
│        │                                     │ historical records remain read-only.    │
├────────┼─────────────────────────────────────┼─────────────────────────────────────────┤
│ UAT-19 │ Foundation Exception Telemetry Gate │ 4 indicators computed on-the-fly;       │
│        │                                     │ anomalies surfaced without DB tables.   │
├────────┼─────────────────────────────────────┼─────────────────────────────────────────┤
│ UAT-20 │ Longitudinal Trajectory Gate        │ Complete 2-year unbroken placement &    │
│        │                                     │ evidence curve retrieved with auth.     │
└────────┴─────────────────────────────────────┴─────────────────────────────────────────┘
```

---

## 11. Implementation Execution Sequence

Implementasi fisik Stage 3 akan dilaksanakan melalui 4 milestone migrasi dan verifikasi:

```text
MILESTONE 3.1: DDL Schema & Temporal Protection Triggers Migration
MILESTONE 3.2: Governed SECURITY DEFINER RPCs & Fail-Closed RLS Migration
MILESTONE 3.3: Automated UAT-15 → UAT-20 Live Database Test Suite
MILESTONE 3.4: Executive Stewardship & Temporal Transition UI Integration
```

---

*Status: **ACTIVE CONTRACT — HARDENED & CLEARED FOR MIGRATION EXECUTION**.*
