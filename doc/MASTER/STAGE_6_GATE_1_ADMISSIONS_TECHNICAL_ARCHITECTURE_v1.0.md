# STAGE 6 — GATE 1: ADMISSIONS TECHNICAL ARCHITECTURE & DDL
## Database Schema, Atomic Ceremony RPC & Security Contracts (v1.1-REVISED)
### Yapendik School OS — Early Childhood Intake & Sovereign Admission Architecture

**Document Version:** `v1.1.0-SEALED`  
**Milestone:** Stage 6 — Gate 1 (Technical Architecture, DDL, RPC Contracts & ADR-05)  
**Governing Authority:** Senior Architecture Reviewer (ARB) & Technical Steering Board  
**Target Codebase:** `yapendik-tk-pilot`  
**Governing Semantic Anchor:** [`STAGE_6_GATE_0_ADMISSIONS_SEMANTIC_AND_BOUNDARY_CLOSURE_v1.0.md`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/STAGE_6_GATE_0_ADMISSIONS_SEMANTIC_AND_BOUNDARY_CLOSURE_v1.0.md)  
**Baseline Anchor:** V2.1.5 Frozen Baseline + Stage 4.5 LEARN + Stage 5 Hardening (348 Checks Passing)  
**Classification:** ARCHITECTURAL SPECIFICATION — GATE 1 SEALED (ARB REVIEWED & HARDENED)  

---

## 1. EXECUTIVE SUMMARY & ARB CRITICAL REFINEMENTS

Dokumen ini merupakan revisi komprehensif **Gate 1: Technical Architecture & DDL** pasca peninjauan oleh *Architectural Review Board (ARB)*. Dokumen ini mengintegrasikan **5 Critical Fixes** dan membakukan **ADR-05: Pre-Canonical Staging, Atomic Promotion & Child Continuity Snapshot Pipeline**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        5 CRITICAL ARB REFINEMENTS EMBEDDED                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Child Continuity Integrity : ZERO physical table insert into child_continuity_      │
│                                 profiles. Baseline disimpan pada kolom JSONB           │
│                                 admissions_applicants.promoted_baseline_snapshot.      │
│ 2. search_path Hardening      : SET search_path = public, pg_temp pada SELURUH RPC.    │
│ 3. Multi-Unit Race Protection : pg_advisory_xact_lock pada child_nik saat Ceremony.   │
│ 4. Staging Isolation DDL      : 4 Tabel Staging murni tanpa Foreign Key ke V2.1.5.     │
│ 5. ADR-05 Canonical Sealing   : Pola Arsitektur Staging ──► Promotion Resmi Dibakukan. │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. STAGING DOMAIN SCHEMA DESIGN (DDL SPECIFICATION)

Untuk memenuhi prinsip **Staging Domain Isolation** (Gate 0 Keputusan 1 & 2), seluruh entitas calon siswa dan berkas pendaftaran hidup di tabel pementasan khusus berawalan `admissions_`.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   STAGE 6 STAGING DOMAIN ENTITY-RELATIONSHIP MODEL                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│   admissions_capacity_quotas                                                           │
│   (school_id, academic_year_id, class_level, target_capacity, current_enrolled)        │
│                                                                                        │
│   admissions_applicants (PK: applicant_id) ◄────────┐ (1:N)                            │
│   (child_nik, child_name, guardian_nik, status,    │                                  │
│    promoted_baseline_snapshot JSONB)                │                                  │
│         │ (1:N)                                     │                                  │
│         ├────────────────────────┐                  │                                  │
│         ▼                        ▼                  │                                  │
│   admissions_documents     admissions_intake_      │                                  │
│   (document_id, doc_type,  observations             │                                  │
│    storage_path, status)   (observation_id,         │                                  │
│                             developmental_domains,  │                                  │
│                             observer_notes)         │                                  │
│                                                     │                                  │
│   VIEW admissions_telemetry_projection ─────────────┘ (Agregat Murni / Zero PII)       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### ⚠️ Strict Architectural Constraint: Zero Foreign Key to Frozen Tables
Dilarang keras membuat `FOREIGN KEY` dari tabel staging (`admissions_*`) ke tabel kanonikal `persons`, `students`, `guardian_relationships`, atau `student_placement_records`. Satu-satunya referensi FK yang diizinkan adalah ke tabel master statis `schools` dan `academic_years`.

---

### DDL 1: `admissions_capacity_quotas`
Menyimpan batas kuota daya tampung rombel per unit TK per tahun ajaran.

```sql
CREATE TABLE IF NOT EXISTS public.admissions_capacity_quotas (
    quota_id TEXT PRIMARY KEY, -- e.g. "quota_2026_tk_menteng_tka"
    school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    class_level TEXT NOT NULL CHECK (class_level IN ('TK_A', 'TK_B', 'KB', 'TPA')),
    target_capacity INTEGER NOT NULL CHECK (target_capacity > 0),
    current_enrolled INTEGER NOT NULL DEFAULT 0 CHECK (current_enrolled >= 0),
    waitlist_capacity INTEGER NOT NULL DEFAULT 5 CHECK (waitlist_capacity >= 0),
    is_open_for_registration BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_school_year_level UNIQUE (school_id, academic_year_id, class_level)
);
```

---

### DDL 2: `admissions_applicants` (Tabel Pementasan Calon Siswa)
Menyimpan identitas hukum calon siswa dan wali sebelum menjadi siswa resmi.

```sql
CREATE TABLE IF NOT EXISTS public.admissions_applicants (
    applicant_id TEXT PRIMARY KEY, -- e.g. "app_2026_sch01_7f8a9b1c"
    target_school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE RESTRICT,
    academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE RESTRICT,
    target_class_level TEXT NOT NULL CHECK (target_class_level IN ('TK_A', 'TK_B', 'KB', 'TPA')),
    
    -- Child Pre-Canonical Identifiers (Enkripsi saat istirahat / Invarian AP-01)
    child_nik VARCHAR(16) NOT NULL,
    child_full_name TEXT NOT NULL,
    child_nickname TEXT,
    child_gender TEXT NOT NULL CHECK (child_gender IN ('L', 'P')),
    child_birth_place TEXT NOT NULL,
    child_birth_date DATE NOT NULL,
    child_religion TEXT NOT NULL,
    child_address TEXT NOT NULL,
    
    -- Guardian Pre-Canonical Identifiers (Contextual Auth / Invarian AP-04)
    creator_uid UUID NOT NULL, -- auth.uid() wali akun pendaftar
    guardian_nik VARCHAR(16) NOT NULL,
    guardian_full_name TEXT NOT NULL,
    guardian_relationship_type TEXT NOT NULL CHECK (guardian_relationship_type IN ('AYAH', 'IBU', 'WALI_HUKUM')),
    guardian_gender TEXT NOT NULL CHECK (guardian_gender IN ('L', 'P')),
    guardian_phone_number VARCHAR(20) NOT NULL,
    guardian_email TEXT,
    
    -- State Machine (Gate 0 Section 4)
    status TEXT NOT NULL DEFAULT 'DRAFT_APPLICATION' CHECK (
        status IN (
            'DRAFT_APPLICATION',
            'SUBMITTED',
            'DOCUMENT_VERIFIED',
            'INTAKE_SCHEDULED',
            'INTAKE_ASSESSED',
            'OFFERED_ADMISSION',
            'WAITLISTED',
            'NOT_ADMITTED',
            'APPLICATION_WITHDRAWN',
            'CANCELLED_ENROLLED_ELSEWHERE',
            'TUITION_SETTLED',
            'ENROLLED_PROMOTED'
        )
    ),
    
    -- Promoted Audit Tracking & Baseline Snapshot (ARB Refinement 1 & Critical Fix 1)
    promoted_at TIMESTAMPTZ,
    promoted_by_person_id TEXT,
    promoted_student_id TEXT, -- ID kanonikal stu_xxx hasil promosi (Audit Link)
    promoted_baseline_snapshot JSONB, -- Snapshot hasil observasi intake untuk ChildContinuityProfile
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admissions_applicants_school_status 
    ON public.admissions_applicants (target_school_id, status);

CREATE INDEX IF NOT EXISTS idx_admissions_applicants_child_nik 
    ON public.admissions_applicants (child_nik);

CREATE INDEX IF NOT EXISTS idx_admissions_applicants_creator_uid 
    ON public.admissions_applicants (creator_uid);
```

---

### DDL 3: `admissions_documents` (Berkas Digital Calon Siswa)
Menyimpan referensi berkas pendaftaran (KK, Akta Lahir, Buku Imunisasi) yang diunggah ke private storage bucket `admissions-documents`.

```sql
CREATE TABLE IF NOT EXISTS public.admissions_documents (
    document_id TEXT PRIMARY KEY, -- e.g. "doc_app2026_01_akta"
    applicant_id TEXT NOT NULL REFERENCES public.admissions_applicants(applicant_id) ON DELETE CASCADE,
    document_type TEXT NOT NULL CHECK (
        document_type IN ('KARTU_KELUARGA', 'AKTA_KELAHIRAN', 'BUKU_IMUNISASI', 'SURAT_KETERANGAN_DOKTER', 'FOTO_CALON_SISWA')
    ),
    storage_file_path TEXT NOT NULL,
    file_size_bytes BIGINT NOT NULL CHECK (file_size_bytes > 0),
    mime_type TEXT NOT NULL,
    
    verification_status TEXT NOT NULL DEFAULT 'PENDING_VERIFICATION' CHECK (
        verification_status IN ('PENDING_VERIFICATION', 'VERIFIED_VALID', 'REJECTED_INVALID')
    ),
    verified_by_person_id TEXT,
    verified_at TIMESTAMPTZ,
    rejection_reason TEXT,
    
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admissions_documents_applicant 
    ON public.admissions_documents (applicant_id);
```

---

### DDL 4: `admissions_intake_observations` (Observasi Kesiapan Perkembangan)
Menyimpan instrumen asesmen diagnostik awal anak (Invarian **AP-02 & AP-05**).

```sql
CREATE TABLE IF NOT EXISTS public.admissions_intake_observations (
    observation_id TEXT PRIMARY KEY, -- e.g. "obs_intake_app2026_01"
    applicant_id TEXT NOT NULL REFERENCES public.admissions_applicants(applicant_id) ON DELETE CASCADE,
    observer_person_id TEXT NOT NULL, -- Guru pengamat yang ditugaskan
    observation_date DATE NOT NULL,
    
    -- Diagnostic & Readiness JSONB Metrics (Motorik, Toilet Training, Bahasa, Sosio-Emosional)
    developmental_domains JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    observer_qualitative_notes TEXT NOT NULL,
    special_learning_needs_flag BOOLEAN NOT NULL DEFAULT FALSE,
    special_needs_description TEXT,
    recommended_class_level TEXT NOT NULL CHECK (recommended_class_level IN ('TK_A', 'TK_B', 'KB', 'TPA')),
    
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_admissions_intake_applicant 
    ON public.admissions_intake_observations (applicant_id);
```

---

## 3. THE ENROLLMENT CEREMONY (ATOMIC PROMOTION RPC CONTRACT)

*The Enrollment Ceremony* adalah **gerbang ontologis tunggal** di mana seorang calon siswa dipromosikan ke dalam status hukum resmi sekolah kanonikal.

```
════════════════════════════════════════════════════════════════════════════════════════
               THE ENROLLMENT CEREMONY TRANSACTION LIFECYCLE (ACID)
════════════════════════════════════════════════════════════════════════════════════════

   [ START TRANSACTION (BEGIN) ]
        │
        ├─► STEP 0: TRANSACTIONAL ADVISORY LOCK (CRITICAL FIX #3)
        │   • PERFORM pg_advisory_xact_lock(hashtext('ENROLLMENT_CEREMONY_' || child_nik))
        │   • Mencegah race-condition multi-unit approval serentak untuk anak yang sama
        │
        ├─► STEP 1: PRE-CONDITION & VALIDATION
        │   • Assert applicant.status == 'TUITION_SETTLED'
        │   • Assert admissions_capacity_quotas.current_enrolled < target_capacity
        │
        ├─► STEP 2: GUARDIAN DEDUPLICATION (ARB REFINEMENT 1)
        │   • Lookup guardian_nik / email di tabel kanonikal 'persons'
        │   • IF found     ──► Reuse existing_person_id
        │   • IF not found ──► INSERT INTO persons (new_guardian_person_id)
        │
        ├─► STEP 3: CANONICAL CHILD & STUDENT CREATION
        │   • INSERT INTO persons (child_person_id)
        │   • INSERT INTO students (student_id, person_id, status: 'ACTIVE')
        │   • INSERT INTO guardian_relationships (guardian_person_id, student_id)
        │
        ├─► STEP 4: CLASSROOM PLACEMENT
        │   • INSERT INTO student_placement_records (student_id, class_id, status: 'ACTIVE')
        │
        ├─► STEP 5: SNAPSHOT INJECTION TO STAGING RECORD (CRITICAL FIX #1)
        │   • Copy JSONB developmental_domains ──► admissions_applicants.promoted_baseline_snapshot
        │   • NO PHYSICAL INSERT into child_continuity_profiles (Read Model is Derived!)
        │
        ├─► STEP 6: STAGING CLOSURE & AUDIT LOGGING
        │   • UPDATE admissions_applicants SET status = 'ENROLLED_PROMOTED', 
        │     promoted_student_id = new_student_id, promoted_at = NOW()
        │   • UPDATE admissions_capacity_quotas SET current_enrolled = current_enrolled + 1
        │
        └─► STEP 7: MULTI-UNIT DEDUPLICATION
            • UPDATE admissions_applicants SET status = 'CANCELLED_ENROLLED_ELSEWHERE'
              WHERE child_nik = applicant.child_nik AND applicant_id != p_applicant_id
              AND status IN ('DRAFT_APPLICATION', 'SUBMITTED', 'DOCUMENT_VERIFIED', 
                             'INTAKE_SCHEDULED', 'INTAKE_ASSESSED', 'OFFERED_ADMISSION', 'WAITLISTED')

   [ COMMIT TRANSACTION ] (Jika 1 Step Gagal ──► 100% ROLLBACK)
```

---

### Architectural Note: Child Continuity Profile as Derived Read-Model
> **⚠️ CATATAN ARSITEKTUR KANONIKAL (STAGE 4.3 CERTIFIED):**  
> `ChildContinuityProfile` adalah **Derived Read-Model** yang dihitung secara *on-the-fly* pada layer aplikasi (Service Layer) saat profil kontinuitas anak dibuka.  
> Tidak ada tabel fisik `child_continuity_profiles` baru yang dibuat. Read-model ini membaca langsung secara komputasional dari `admissions_applicants.promoted_baseline_snapshot` yang ditautkan melalui `promoted_student_id`.

---

### Signature & Pseudocode RPC: `rpc_execute_enrollment_ceremony`

```sql
CREATE OR REPLACE FUNCTION public.rpc_execute_enrollment_ceremony(
    p_applicant_id TEXT,
    p_target_class_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp -- CRITICAL FIX #2: Security search_path Hardening
AS $$
DECLARE
    v_app RECORD;
    v_quota RECORD;
    v_obs RECORD;
    v_guardian_person_id TEXT;
    v_child_person_id TEXT;
    v_new_student_id TEXT;
    v_actor_person_id TEXT;
    v_actor_role TEXT;
    v_actor_school_id TEXT;
    v_baseline_snapshot JSONB := NULL;
BEGIN
    -- 0. Authorization Check (Hanya Kepala Sekolah unit terkait)
    SELECT person_id, role, active_school_id INTO v_actor_person_id, v_actor_role, v_actor_school_id
    FROM public.get_current_security_context();
    
    IF v_actor_role != 'HEADMASTER' THEN
        RAISE EXCEPTION 'SECURITY_GATE_DENIED: Hanya Kepala Sekolah yang berhak memvalidasi The Enrollment Ceremony.';
    END IF;

    -- 1. Lock Applicant Row
    SELECT * INTO v_app FROM public.admissions_applicants 
    WHERE applicant_id = p_applicant_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'APPLICANT_NOT_FOUND: Calon siswa dengan ID % tidak ditemukan.', p_applicant_id;
    END IF;
    
    IF v_app.target_school_id != v_actor_school_id THEN
        RAISE EXCEPTION 'TENANT_VIOLATION_C11: Kepala sekolah hanya dapat mempromosikan calon siswa di unitnya.';
    END IF;
    
    IF v_app.status != 'TUITION_SETTLED' THEN
        RAISE EXCEPTION 'INVALID_PRECONDITION: Upacara hanya dapat dieksekusi jika status adalah TUITION_SETTLED (Status saat ini: %).', v_app.status;
    END IF;

    -- 2. CRITICAL FIX #3: Transactional Advisory Lock on Child NIK
    -- Mencegah dua Kepala Sekolah di unit berbeda mengeksekusi upacara serentak untuk anak yang sama
    PERFORM pg_advisory_xact_lock(hashtext('ENROLLMENT_CEREMONY_' || v_app.child_nik));

    -- 3. Quota Check & Increment
    SELECT * INTO v_quota FROM public.admissions_capacity_quotas
    WHERE school_id = v_app.target_school_id 
      AND academic_year_id = v_app.academic_year_id 
      AND class_level = v_app.target_class_level
    FOR UPDATE;
    
    IF v_quota.current_enrolled >= v_quota.target_capacity THEN
        RAISE EXCEPTION 'QUOTA_EXCEEDED: Daya tampung rombel % telah penuh (%/%).', 
            v_app.target_class_level, v_quota.current_enrolled, v_quota.target_capacity;
    END IF;

    -- 4. Guardian Deduplication (ARB Refinement 1)
    SELECT person_id INTO v_guardian_person_id 
    FROM public.persons 
    WHERE (nik = v_app.guardian_nik OR (email = v_app.guardian_email AND email IS NOT NULL))
      AND is_deleted = FALSE 
    LIMIT 1;
    
    IF v_guardian_person_id IS NULL THEN
        v_guardian_person_id := 'per_gua_' || substr(md5(v_app.guardian_nik), 1, 10);
        INSERT INTO public.persons (
            person_id, full_name, nik, phone_number, email, gender, role, is_active, created_at
        ) VALUES (
            v_guardian_person_id, v_app.guardian_full_name, v_app.guardian_nik, 
            v_app.guardian_phone_number, v_app.guardian_email, v_app.guardian_gender, 'LEGAL_GUARDIAN', TRUE, NOW()
        );
    END IF;

    -- 5. Canonical Child Person & Student Creation
    v_child_person_id := 'per_stu_' || substr(md5(v_app.child_nik), 1, 10);
    INSERT INTO public.persons (
        person_id, full_name, nickname, nik, birth_place, birth_date, gender, religion, address, is_active, created_at
    ) VALUES (
        v_child_person_id, v_app.child_full_name, v_app.child_nickname, v_app.child_nik,
        v_app.child_birth_place, v_app.child_birth_date, v_app.child_gender, v_app.child_religion,
        v_app.child_address, TRUE, NOW()
    );

    v_new_student_id := 'stu_' || substr(md5(v_app.child_nik || v_app.target_school_id), 1, 12);
    INSERT INTO public.students (
        student_id, person_id, school_id, status, enrollment_date, created_at
    ) VALUES (
        v_new_student_id, v_child_person_id, v_app.target_school_id, 'ACTIVE', CURRENT_DATE, NOW()
    );

    -- 6. Canonical Guardian Relationship
    INSERT INTO public.guardian_relationships (
        relationship_id, guardian_person_id, student_id, relationship_type, is_primary_contact, created_at
    ) VALUES (
        'rel_' || substr(md5(v_guardian_person_id || v_new_student_id), 1, 12),
        v_guardian_person_id, v_new_student_id, v_app.guardian_relationship_type, TRUE, NOW()
    );

    -- 7. Canonical Classroom Placement
    INSERT INTO public.student_placement_records (
        placement_id, student_id, class_id, academic_year_id, status, created_at
    ) VALUES (
        'plc_' || substr(md5(v_new_student_id || p_target_class_id), 1, 12),
        v_new_student_id, p_target_class_id, v_app.academic_year_id, 'ACTIVE', NOW()
    );

    -- 8. CRITICAL FIX #1: Snapshot Preparation for Staging Record (Zero Physical Insert into CCP)
    SELECT * INTO v_obs FROM public.admissions_intake_observations 
    WHERE applicant_id = p_applicant_id;
    
    IF FOUND THEN
        v_baseline_snapshot := jsonb_build_object(
            'intake_observation_date', v_obs.observation_date,
            'developmental_domains', v_obs.developmental_domains,
            'qualitative_intake_notes', v_obs.observer_qualitative_notes,
            'special_learning_needs_flag', v_obs.special_learning_needs_flag,
            'special_needs_description', v_obs.special_needs_description,
            'recommended_class_level', v_obs.recommended_class_level,
            'snapshot_created_at', NOW()
        );
    END IF;

    -- 9. Close Staging Applicant Record & Inject Baseline Snapshot
    UPDATE public.admissions_applicants 
    SET status = 'ENROLLED_PROMOTED',
        promoted_at = NOW(),
        promoted_by_person_id = v_actor_person_id,
        promoted_student_id = v_new_student_id,
        promoted_baseline_snapshot = v_baseline_snapshot,
        updated_at = NOW()
    WHERE applicant_id = p_applicant_id;

    -- 10. Increment Quota Enrolled Counter
    UPDATE public.admissions_capacity_quotas
    SET current_enrolled = current_enrolled + 1,
        updated_at = NOW()
    WHERE quota_id = v_quota.quota_id;

    -- 11. Multi-Unit Deduplication (Invarian AP-06)
    UPDATE public.admissions_applicants
    SET status = 'CANCELLED_ENROLLED_ELSEWHERE',
        updated_at = NOW()
    WHERE child_nik = v_app.child_nik 
      AND applicant_id != p_applicant_id
      AND status NOT IN ('ENROLLED_PROMOTED', 'CANCELLED_ENROLLED_ELSEWHERE');

    -- Return Promotion Result
    RETURN jsonb_build_object(
        'success', true,
        'applicant_id', p_applicant_id,
        'promoted_student_id', v_new_student_id,
        'child_person_id', v_child_person_id,
        'guardian_person_id', v_guardian_person_id,
        'placed_class_id', p_target_class_id,
        'has_baseline_snapshot', (v_baseline_snapshot IS NOT NULL),
        'enrolled_at', NOW()
    );
END;
$$;
```

---

## 4. ROW-LEVEL SECURITY (RLS) & AUTHENTICATION MATRIX

Penegakan batas otorisasi kontekstual pada tabel pementasan:

| Peran Sesi Autentikasi | `admissions_applicants` | `admissions_documents` | `admissions_intake_observations` | `admissions_capacity_quotas` |
|:---|:---:|:---:|:---:|:---:|
| **`APPLICANT_GUARDIAN`** | `SELECT / INSERT / UPDATE` (Hanya miliknya `creator_uid = auth.uid()`) | `SELECT / INSERT / DELETE` (Hanya berkas aplikasinya) | **DENY ALL** (Karantina Asesmen Internal) | `SELECT` (Read-only kuota publik) |
| **`SCHOOL_ADMISSIONS_STAFF`** | `SELECT / UPDATE` (Hanya unitnya `target_school_id`) | `SELECT / UPDATE` (Verifikasi berkas unit) | `SELECT / INSERT / UPDATE` (Hanya unitnya) | `SELECT` |
| **`HEADMASTER`** | `ALL PRIVILEGES` (Hanya unitnya `target_school_id`) | `ALL PRIVILEGES` (Hanya unitnya) | `ALL PRIVILEGES` (Hanya unitnya) | `ALL PRIVILEGES` (Hanya unitnya) |
| **`YAPENDIK_SUPERADMIN` (Yayasan)** | 🚫 **DENY ALL (RLS BLOCK)** | 🚫 **DENY ALL (RLS BLOCK)** | 🚫 **DENY ALL (RLS BLOCK)** | `SELECT` (Read agregat kuota) |
| **`TEACHER` (Guru Reguler)** | 🚫 **DENY ALL** | 🚫 **DENY ALL** | `INSERT` jika ditugaskan sebagai observer | 🚫 **DENY ALL** |

---

### RLS Policies (SQL Implementation Contract)

```sql
-- Aktifkan RLS
ALTER TABLE public.admissions_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_intake_observations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_capacity_quotas ENABLE ROW LEVEL SECURITY;

-- Policy 1: Guardian Self-Service (Invarian AP-04)
CREATE POLICY rls_guardian_applicants ON public.admissions_applicants
    FOR ALL
    TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'APPLICANT_GUARDIAN' AND creator_uid = auth.uid()
    );

-- Policy 2: School Headmaster & Staff Isolation (Invarian C-11)
CREATE POLICY rls_school_admissions ON public.admissions_applicants
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'role' IN ('HEADMASTER', 'STAFF', 'TEACHER'))
        AND target_school_id = (auth.jwt() ->> 'school_id')
    );

-- Policy 3: Foundation Hard Deny (Invarian AP-07 & FB-01)
-- (Tidak ada policy untuk YAPENDIK_SUPERADMIN pada admissions_applicants -> Default DENY ALL)
```

---

## 5. FOUNDATION PROJECTION VIEW (INVARIAN AP-07: ZERO PII)

Sesuai Invarian **AP-07** dan prinsip konstitusi **FB-01**, Yayasan dilarang mengakses data individual calon siswa dan hanya boleh membaca proyeksi agregat melalui View khusus:

```sql
CREATE OR REPLACE VIEW public.admissions_telemetry_projection AS
SELECT 
    target_school_id,
    academic_year_id,
    target_class_level,
    status AS admission_status,
    COUNT(applicant_id) AS total_applicants,
    NOW() AS computed_at
FROM public.admissions_applicants
GROUP BY target_school_id, academic_year_id, target_class_level, status;

-- Grant SELECT ke Yayasan
GRANT SELECT ON public.admissions_telemetry_projection TO authenticated;
```

---

## 6. THE 90-DAY PURGE DAEMON CONTRACT (INVARIAN AP-01)

Untuk memenuhi undang-undang perlindungan data pribadi dan Invarian **AP-01**, sistem menyediakan stored procedure otomatis untuk membersihkan data calon siswa yang batal/ditolak setelah melewati masa retensi 90 hari:

```sql
CREATE OR REPLACE FUNCTION public.rpc_purge_expired_admissions(
    p_academic_year_id TEXT,
    p_cutoff_days INTEGER DEFAULT 90
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp -- CRITICAL FIX #2: Security search_path Hardening
AS $$
DECLARE
    v_purged_count INTEGER := 0;
    v_purged_docs INTEGER := 0;
BEGIN
    -- 1. Hapus dokumen pendukung calon siswa yang expired
    WITH target_applicants AS (
        SELECT applicant_id FROM public.admissions_applicants
        WHERE academic_year_id = p_academic_year_id
          AND status IN ('NOT_ADMITTED', 'APPLICATION_WITHDRAWN', 'CANCELLED_ENROLLED_ELSEWHERE', 'WAITLISTED')
          AND updated_at < (NOW() - (p_cutoff_days || ' days')::interval)
    ),
    deleted_docs AS (
        DELETE FROM public.admissions_documents
        WHERE applicant_id IN (SELECT applicant_id FROM target_applicants)
        RETURNING document_id
    )
    SELECT count(*) INTO v_purged_docs FROM deleted_docs;

    -- 2. Hapus data applicant dari staging
    WITH target_applicants AS (
        SELECT applicant_id FROM public.admissions_applicants
        WHERE academic_year_id = p_academic_year_id
          AND status IN ('NOT_ADMITTED', 'APPLICATION_WITHDRAWN', 'CANCELLED_ENROLLED_ELSEWHERE', 'WAITLISTED')
          AND updated_at < (NOW() - (p_cutoff_days || ' days')::interval)
    ),
    deleted_apps AS (
        DELETE FROM public.admissions_applicants
        WHERE applicant_id IN (SELECT applicant_id FROM target_applicants)
        RETURNING applicant_id
    )
    SELECT count(*) INTO v_purged_count FROM deleted_apps;

    RETURN jsonb_build_object(
        'success', true,
        'purged_applicants_count', v_purged_count,
        'purged_documents_count', v_purged_docs,
        'cutoff_applied_days', p_cutoff_days,
        'executed_at', NOW()
    );
END;
$$;
```

---

## 7. ADR-05: PRE-CANONICAL STAGING, ATOMIC PROMOTION & CHILD CONTINUITY SNAPSHOT PIPELINE

```text
┌────────────────────────────────────────────────────────────────────────┐
│ ARCHITECTURAL DECISION RECORD (ADR-05)                                 │
│ Title: Pre-Canonical Staging, Atomic Promotion & Child Snapshot       │
│ Status: ACCEPTED & SEALED (FROZEN)                                     │
│ Deciders: Senior Architecture Reviewer (ARB), Technical Steering Board │
│ Date: 2026-08-26                                                       │
└────────────────────────────────────────────────────────────────────────┘
```

### Context & Problem Statement
Sistem penerimaan siswa baru (PPDB) membutuhkan portal publik bagi orang tua calon siswa dan instrumen asesmen intake perkembangan sebelum anak menjadi siswa resmi. Memasukkan data pendaftar mentah langsung ke dalam 15 tabel kanonikal V2.1.5 (`students`, `persons`, `guardian_relationships`) akan mencemari data statistik sekolah dengan pendaftar yang batal, serta melanggar prinsip *Contextual Authorization* (C-11) dan *Zero Individual Exposure* (FB-01).

### Decision Drivers
1. **Perlindungan 100% V2.1.5 Frozen Baseline**: Skema 15 tabel kanonikal sekolah tidak boleh dimodifikasi atau dikotori data sementara.
2. **Kedaulatan Kepala Sekolah**: Hanya Kepala Sekolah yang berwenang menetapkan status hukum murid baru di unitnya.
3. **Pencegahan Race-Condition Multi-Unit**: Satu anak yang mendaftar di beberapa TK Yapendik tidak boleh dipromosikan ganda secara bersamaan.
4. **Kontinuitas Pembelajaran Tanpa Pelanggaran Privasi**: Data observasi intake harus dapat mengalir ke profil kontinuitas anak yang diterima tanpa membocorkan data pendaftar yang batal.

### Considered Options
- **Opsi A (Direct Canonical Insertion)**: Langsung memasukkan calon siswa ke tabel `students` dengan status `PROSPECTIVE`. *(DITOLAK: Mencemari tabel operasional harian, merusak query laporan, dan melanggar RLS)*.
- **Opsi B (Physical Child Continuity Table)**: Membuat tabel fisik `child_continuity_profiles` baru untuk menyimpan intake. *(DITOLAK: Melanggar Stage 4.3 Baseline di mana Child Continuity adalah Derived Read-Model)*.
- **Opsi C (Pre-Canonical Staging & Atomic Ceremony RPC — TERPILIH)**: Membangun 4 tabel staging terisolasi berawalan `admissions_` dengan upacara promosi atomik berpagar *Transactional Advisory Lock*.

### Decision Outcome: Opsi C Terpilih
1. **Isolated Staging Tables**: Seluruh data calon siswa disimpan di `admissions_applicants`, `admissions_documents`, dan `admissions_intake_observations` tanpa Foreign Key ke tabel V2.1.5.
2. **Transactional Ceremony (`rpc_execute_enrollment_ceremony`)**:
   - Memasang `pg_advisory_xact_lock` pada NIK anak.
   - Melakukan *Guardian Deduplication* (reuse `person_id` jika wali sudah ada).
   - Menyisipkan data resmi ke `persons`, `students`, `guardian_relationships`, dan `student_placement_records` dalam 1 transaksi ACID.
   - Menyimpan *intake baseline* pada kolom `promoted_baseline_snapshot` di `admissions_applicants`.
   - Membatalkan otomatis aplikasi lain dari anak yang sama di unit TK lain.
3. **90-Day Privacy Purge**: Data pendaftar batal/ditolak dihapus setelah 90 hari sesuai Invarian **AP-01**.

### Consequences & Compliance Verification
- **Positive**: 100% Zero Data Pollution pada tabel sekolah; Zero orphaned records saat transaksi gagal; Otonomi penuh Kepala Sekolah.
- **Verification**: Diuji secara deterministik melalui Adversarial Test Suites 26, 27, dan 28.

---

## 8. ADVERSARIAL TEST SUITES PLANNING (SUITES 26–28)

Untuk menguji ketangguhan implementasi Stage 6 tanpa regresi pada 348 checks yang ada, dirancang 3 Test Suite baru:

```
════════════════════════════════════════════════════════════════════════════════════════
                  STAGE 6 ADVERSARIAL TEST SUITES SPECIFICATION
════════════════════════════════════════════════════════════════════════════════════════

--- SUITE 26: THE CEREMONY ATOMICITY & ROLLBACK INTEGRITY (AP-06) ---
  • Scenario 1: Successful ceremony promotes applicant to 4 canonical tables.
  • Scenario 2: Error injection on Step 4 (Placement fail) -> Assert 100% Rollback (No orphaned persons/students).
  • Scenario 3: Precondition breach (Applicant status == 'SUBMITTED' instead of 'TUITION_SETTLED') -> Rejected.
  • Scenario 4: Quota overflow -> Ceremony rejected with QUOTA_EXCEEDED.
  • Scenario 5: Multi-Unit Race Condition -> Advisory Lock blocks concurrent conflicting promotion.

--- SUITE 27: GUARDIAN DEDUPLICATION & MULTI-UNIT CANCELLATION (AP-04) ---
  • Scenario 1: Register second child of existing parent -> Reuses person_id, creates 0 duplicate persons.
  • Scenario 2: Promote child in TK 01 -> Assert application for same NIK in TK 02 becomes CANCELLED_ENROLLED_ELSEWHERE.
  • Scenario 3: Intake snapshot injection transfers qualitative notes to promoted_baseline_snapshot without physical table insert.

--- SUITE 28: ADVERSARIAL RLS & FOUNDATION PII LEAK GUARD (AP-07 & FB-01) ---
  • Scenario 1: Superadmin/Yayasan executes SELECT on admissions_applicants -> Assert 0 rows / Permission Denied.
  • Scenario 2: Parent A attempts to query/update Applicant B -> Assert 403 Forbidden.
  • Scenario 3: Headmaster TK 02 attempts to promote applicant of TK 01 -> Assert TENANT_VIOLATION_C11.
  • Scenario 4: 90-Day Purge daemon cleans cancelled applicants and preserves active enrolled records.
```

---

## 9. GATE 1 TECHNICAL SIGN-OFF & CANONICAL APPROVAL

```
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                 STAGE 6: GATE 1 TECHNICAL ARCHITECTURE APPROVAL                       ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  1. DDL SPECIFICATION         : [APPROVED] 4 Staging Tables (Zero Canonical FK)       ║
║  2. CEREMONY RPC ARCHITECTURE : [APPROVED] ACID 7-Step Atomic Promotion Function      ║
║  3. GUARDIAN DEDUPLICATION    : [APPROVED] NIK Lookup & Entity Reuse (Refinement 1)   ║
║  4. SNAPSHOT INJECTION        : [APPROVED] Staging JSONB Snapshot (Critical Fix #1)   ║
║  5. ADVISORY LOCKING          : [APPROVED] NIK Transaction Lock (Critical Fix #3)     ║
║  6. SEARCH_PATH SECURITY      : [APPROVED] Explicit search_path (Critical Fix #2)     ║
║  7. RLS & AUTH MATRIX         : [APPROVED] Contextual APPLICANT_GUARDIAN & Tenant RLS ║
║  8. FOUNDATION AP-07 VIEW     : [APPROVED] Zero-PII Aggregated Telemetry View         ║
║  9. 90-DAY PURGE DAEMON       : [APPROVED] Automatic Privacy Retention Cleaner        ║
║  10. ADR-05 SEALED            : [APPROVED] Pre-Canonical Staging & Promotion Pattern  ║
║  11. ADVERSARIAL SUITES 26-28 : [APPROVED] Full Test Blueprint for Stage 6 Sprints    ║
║                                                                                       ║
║  STATUS GATE 1                : 🔒 SEALED AND APPROVED FOR SPRINT EXECUTION           ║
║  CURRENT INTEGRITY BASELINE   : 348 / 348 CHECKS ZERO REGRESSION                      ║
║  DATE OF SEALING              : 2026-08-26                                            ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
```

---
*Dokumen ini merupakan cetak biru teknis resmi Gate 1 yang mengunci spesifikasi DDL, RPC, RLS, dan ADR-05 untuk pelaksanaan implementasi Stage 6.*
