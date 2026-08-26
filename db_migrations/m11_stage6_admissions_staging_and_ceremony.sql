-- ============================================================================
-- YAPENDIK SCHOOL OS — MIGRATION M11 (STAGE 6)
-- ADMISSIONS & ENROLLMENT CONTINUUM (PPDB LOOP) & ATOMIC CEREMONY ENGINE (ADR-05)
-- ============================================================================

-- 1. Table: admissions_capacity_quotas
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

-- 2. Table: admissions_applicants (Pre-Canonical Staging Entity)
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

-- 3. Table: admissions_documents
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

-- 4. Table: admissions_intake_observations
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

-- 5. View: admissions_telemetry_projection (Zero-PII Foundation View - Invarian AP-07)
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

-- 6. Row-Level Security (RLS) Configuration
ALTER TABLE public.admissions_capacity_quotas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_applicants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admissions_intake_observations ENABLE ROW LEVEL SECURITY;

-- Quotas: Public read for active users
CREATE POLICY rls_quotas_select ON public.admissions_capacity_quotas
    FOR SELECT TO authenticated USING (TRUE);

-- Guardian: Self-Service Boundary (AP-04)
CREATE POLICY rls_guardian_applicants ON public.admissions_applicants
    FOR ALL TO authenticated
    USING (
        auth.jwt() ->> 'role' = 'APPLICANT_GUARDIAN' AND creator_uid = auth.uid()
    );

CREATE POLICY rls_guardian_documents ON public.admissions_documents
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admissions_applicants a 
            WHERE a.applicant_id = admissions_documents.applicant_id 
              AND a.creator_uid = auth.uid()
        )
    );

-- School Staff & Headmaster: Unit Tenant Isolation (C-11)
CREATE POLICY rls_school_admissions ON public.admissions_applicants
    FOR ALL TO authenticated
    USING (
        (auth.jwt() ->> 'role' IN ('HEADMASTER', 'STAFF', 'TEACHER'))
        AND target_school_id = (auth.jwt() ->> 'school_id')
    );

CREATE POLICY rls_school_documents ON public.admissions_documents
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admissions_applicants a 
            WHERE a.applicant_id = admissions_documents.applicant_id 
              AND a.target_school_id = (auth.jwt() ->> 'school_id')
        )
    );

CREATE POLICY rls_school_intake_obs ON public.admissions_intake_observations
    FOR ALL TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admissions_applicants a 
            WHERE a.applicant_id = admissions_intake_observations.applicant_id 
              AND a.target_school_id = (auth.jwt() ->> 'school_id')
        )
    );

-- 7. RPC: rpc_execute_enrollment_ceremony (ADR-05 Atomic Promotion)
CREATE OR REPLACE FUNCTION public.rpc_execute_enrollment_ceremony(
    p_applicant_id TEXT,
    p_target_class_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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

    -- 2. Transactional Advisory Lock on Child NIK (Pencegahan Race Condition Multi-Unit)
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

    -- 8. Snapshot Preparation for Staging Record (Zero Physical Insert into CCP)
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

-- 8. RPC: rpc_purge_expired_admissions (Invarian AP-01 90-Day Privacy Retention)
CREATE OR REPLACE FUNCTION public.rpc_purge_expired_admissions(
    p_academic_year_id TEXT,
    p_cutoff_days INTEGER DEFAULT 90
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
