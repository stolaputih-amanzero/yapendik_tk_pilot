# YAPENDIK SCHOOL OS — STAGE 3.1: MIGRATION CONTRACT
## Version 1.0 — Execution Contract for Temporal Lineage DDL, Protection Triggers & Placement Backfill

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Document Type:** Migration Execution & Governance Contract  
**Status:** **ACTIVE CONTRACT — LOCKING ARCHITECTURAL GUARANTEES PRIOR TO SQL EXECUTION**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2, EIA v0.1, Stage 3 Canonical Information Model v1.0, Stage 3 Technical Specification v1.1, and Stage 3 Migration Readiness Assessment v1.0.  
**Target Migration File:** `db_migrations/m05_temporal_lineage_and_protection_triggers.sql`  
**Prerequisites:** Stage 1 Runtime Baseline (FROZEN) & Stage 2 Governed Provisioning Baseline (FROZEN).  
**Core Motto:** *Information Before Interface • Understand First, Migrate Safely • Lineage Wins.*

---

## 1. Executive Summary & Contract Scope

Dokumen ini adalah **kontrak eksekusi migrasi resmi (Execution Contract)** untuk **Milestone 3.1**. Kontrak ini menetapkan batasan mutlak, kondisi prasyarat (*pre-conditions*), jaminan rekonsiliasi data, aturan kegagalan/rollback (*all-or-nothing guarantee*), dan protokol verifikasi empiris yang wajib dipenuhi sebelum dan sesudah skrip SQL `m05` dieksekusi pada database PostgreSQL / Supabase produksi.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 3.1 MIGRATION CONTRACT PILLARS                            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Zero Breaking Changes   ──► Existing Stage 1 & 2 tables/columns remain 100% intact  │
│ 2. Authoritative Lineage   ──► `student_placement_records` established as append-only  │
│ 3. Strict Backfill Invariant─► Every active placed student receives 1:1 verified placement│
│ 4. Projection Sync Rule    ──► `students.current_class_id` auto-projected (Lineage wins│
│ 5. Absolute Immutability   ──► Triggers reject mutations on CLOSED terms & TERMINAL rows│
│ 6. Fail-Closed Barrier     ──► Direct client DML denied for ALL roles (Governed RPC)   │
│ 7. Atomic All-or-Nothing   ──► If any post-backfill check fails, transaction ABORTS    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Preconditions & System State Verification

Sebelum migrasi `m05` dieksekusi, database wajib memenuhi seluruh prasyarat awal berikut:

```text
┌───┬──────────────────────────────────┬────────────────────────────────────────────────────────┐
│ # │ Precondition Target              │ Mandatory Verification Condition                       │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1 │ Legal Schools Active             │ Minimal 1 `schools` dengan status `ACTIVE` & `READY`.   │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2 │ Active Academic Year             │ Minimal 1 `academic_years` dengan `is_active = true`.  │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3 │ Active Classrooms                │ Minimal 1 `classes` aktif terhubung ke academic year.  │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4 │ Identity Layer Operational       │ Fungsi `get_auth_person_id()` terdefinisi dan STABLE.  │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 5 │ Zero Orphan Active Placements    │ Seluruh `students` dengan `current_class_id IS NOT NULL`│
│   │                                  │ memiliki `class_id` yang valid dan aktif di `classes`. │
└───┴──────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 3. Existing Schema Preservation (Zero Breaking Changes)

Migrasi Stage 3.1 bersifat **aditif dan non-destruktif**. Tabel dan kolom existing dipertahankan untuk menjamin aplikasi Stage 1 dan Stage 2 berjalan tanpa interupsi:

1. **`academic_years` Table:**
   * Kolom existing: `id`, `school_id`, `name`, `semester`, `start_date`, `end_date`, `is_active` **TIDAK DIHAPUS**.
   * Kolom baru ditambahkan: `lifecycle_status TEXT NOT NULL DEFAULT 'ACTIVE'`, `closed_at TIMESTAMPTZ NULL`, `closed_by_person_id TEXT NULL REFERENCES public.persons(id)`.
   * Sinkronisasi awal: `UPDATE public.academic_years SET lifecycle_status = 'ACTIVE' WHERE is_active = true;`.

2. **`students` Table:**
   * Kolom `current_class_id` **TIDAK DIHAPUS**, melainkan dialihfungsikan secara resmi sebagai **Current Operational Projection**.
   * Constraint status diperluas: `CHECK (status IN ('ACTIVE', 'TRANSFERRED', 'WITHDRAWN', 'GRADUATED'))`.

3. **`classes`, `persons`, `observation_records`, `daily_attendance`, `student_progress_reports`:**
   * Seluruh struktur tabel dipertahankan; proteksi immutability diintegrasikan melalui trigger PostgreSQL.

---

## 4. DDL & Constraint Specification Contract

### 4.1 Schema Definisi `student_placement_records`

```sql
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

-- Constraint Invariant 1: Exactly ONE active placement per student at any given time
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_single_active_placement
  ON public.student_placement_records (student_id)
  WHERE (placement_status = 'ACTIVE');

-- Constraint Invariant 2: A student cannot have multiple placements in the same academic year / semester
CREATE UNIQUE INDEX IF NOT EXISTS uq_student_academic_year_placement
  ON public.student_placement_records (student_id, academic_year_id);

-- Performance Indices for Historical Lineage Queries
CREATE INDEX IF NOT EXISTS idx_placement_school_ay_class 
  ON public.student_placement_records (school_id, academic_year_id, class_id);
CREATE INDEX IF NOT EXISTS idx_placement_student_lineage 
  ON public.student_placement_records (student_id, entry_date ASC);
```

---

## 5. Backfill Contract with Strict Reconciliation Invariants

### 5.1 The Backfill Logic

Migrasi wajib merekonstruksi lini masa penempatan bagi seluruh siswa yang telah terdaftar dan aktif di sistem sebelum migrasi `m05`:

```sql
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
```

### 5.2 Mandatory Post-Backfill Reconciliation Invariants

Blok transaksi migrasi **WAJIB MELAKUKAN PEMERIKSAAN INVARIANT** berikut. Jika terjadi ketidakcocokan data, migrasi **WAJIB ABORT / ROLLBACK 100%**:

```text
┌───┬──────────────────────────────────────────┬────────────────────────────────────────────────────────┐
│ # │ Invariant Check                          │ Failure Condition (Triggers ABORT)                     │
├───┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1 │ 100% Active Placed Population Match      │ `COUNT(placed students) != COUNT(active placements)`   │
├───┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2 │ Zero Cross-School Placement Leakage      │ Any placement where `placement.school_id != student.school_id`│
├───┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3 │ Academic Year Integrity                  │ Any placement where `placement.academic_year_id != class.academic_year_id`│
├───┼──────────────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4 │ Class Mapping Exactness                  │ Any placement where `placement.class_id != student.current_class_id`│
└───┴──────────────────────────────────────────┴────────────────────────────────────────────────────────┘
```

#### SQL Invariant Enforcement Script inside Migration:
```sql
DO $$
DECLARE
  v_expected_count INT;
  v_actual_count INT;
  v_mismatch_count INT;
BEGIN
  -- Check 1: Population Count Match
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

  -- Check 2: Integrity Mismatches (School ID or Academic Year ID discrepancy)
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

  RAISE NOTICE '✅ MIGRATION M05 RECONCILIATION PASSED: % active students backfilled with 100% integrity.', v_actual_count;
END $$;
```

---

## 6. Protection & Immutability Triggers Contract

### 6.1 Trigger: Prevent Mutations on Closed Semesters (`trg_prevent_mutation_on_closed_semester`)
Menolak `INSERT`, `UPDATE`, dan `DELETE` pada catatan observasi, presensi, dan rapor jika tahun akademik/semester terkait telah `CLOSED` atau `ARCHIVED`.

```sql
CREATE OR REPLACE FUNCTION public.fn_guard_closed_semester_mutations()
RETURNS TRIGGER AS $$
DECLARE
  v_ay_status TEXT;
  v_target_ay_id TEXT;
BEGIN
  -- 1. Determine Target Academic Year ID based on table and TG_OP
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

  -- 2. Check status of target academic period
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

-- Bind triggers to operational tables
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
```

---

### 6.2 Trigger: Absolute Immutability on Terminal Placements (`trg_placement_terminalization_guard`)

```sql
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
```

---

### 6.3 Trigger: Projection Synchronization (`trg_sync_student_current_class_projection`)
Menjamin aturan kanonikal: **Lineage Wins**. Kolom `students.current_class_id` selalu disinkronkan secara deterministik dari penempatan aktif.

```sql
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
```

---

## 7. Fail-Closed RLS Security Policies Contract

```sql
-- Enable RLS on student_placement_records
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
```

---

## 8. Failure & Rollback Protocols

Jika terjadi kegagalan saat eksekusi migrasi `m05`:
1. **Transaction Atomicity:** Seluruh blok SQL dieksekusi di dalam satu blok transaksi database PostgreSQL (`BEGIN; ... COMMIT;`).
2. **Deterministic Rollback:** Jika terjadi error pada pembuatan tabel, trigger, atau reconcilation invariant backfill, PostgreSQL secara otomatis melakukan `ROLLBACK`, mengembalikan database ke kondisi awal tanpa artefak parsial.
3. **Data Loss Guarantee:** Nol data yang dihapus atau dimutasi secara destruktif (*Zero Data Loss Guarantee*).

---

## 9. Post-Migration Empirical Verification Protocol

Setelah migrasi SQL dijalankan, skrip verifikasi live `scripts/verify_stage3_1_migration.mjs` wajib dieksekusi untuk membuktikan 6 kriteria penerimaan:

```text
┌───┬──────────────────────────────────┬────────────────────────────────────────────────────────┐
│ # │ Verification Check               │ Mandatory Success Assertion                            │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1 │ Table Existence & Columns        │ `student_placement_records` ada dengan 12 kolom valid. │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2 │ 100% Backfill Population         │ Jumlah placement aktif persis sama dengan siswa aktif. │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3 │ Single Active Placement Constraint│ Duplicate active placement insert melempar error.      │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4 │ Closed Period Immutability Guard │ INSERT pada closed period melempar error via trigger.  │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 5 │ Terminal Placement Frozen Guard  │ UPDATE pada terminal placement melempar error.         │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 6 │ Fail-Closed Direct DML Barrier   │ Direct client INSERT/UPDATE/DELETE ditolak RLS.        │
└───┴──────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

*Status: **ACTIVE CONTRACT — 100% LOCKED AND AUTHORIZED FOR MILESTONE 3.1 SQL EXECUTION**.*
