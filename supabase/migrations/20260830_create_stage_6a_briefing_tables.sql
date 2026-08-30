-- ============================================================================
-- SUPABASE MIGRATION: 20260830_create_stage_6a_briefing_tables.sql
-- STAGE 6-A: THE WARM BRIEFING & CLOSURE MODE SUBSTRATE
-- ============================================================================

-- 1. TABLE: phase_action_mappings
CREATE TABLE IF NOT EXISTS public.phase_action_mappings (
    action_id VARCHAR(50) PRIMARY KEY,
    action_name VARCHAR(100) NOT NULL,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('NAVIGATION', 'MODAL', 'SHEET', 'RITUAL')),
    target_route VARCHAR(255),
    target_component VARCHAR(100),
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO public.phase_action_mappings (action_id, action_name, action_type, target_route, target_component, is_default)
VALUES
    ('act_take_attendance', 'Buka Presensi', 'NAVIGATION', '/teacher/attendance', 'AttendanceSheet', true),
    ('act_record_moment', 'Rekam Momen', 'MODAL', '/teacher/moments/new', 'RecordMomentModal', true),
    ('act_send_message', 'Kirim Pesan', 'MODAL', '/teacher/messages/new', 'SendMessageModal', true),
    ('act_close_day', 'Tutup Hari', 'RITUAL', '/teacher/closure', 'ClosureRitualModal', true),
    ('act_review_lppa', 'Lihat LPPA', 'NAVIGATION', '/teacher/lppa', 'LppaReviewSheet', true),
    ('act_review_authority_queue', 'Tinjau Antrean Otoritas', 'NAVIGATION', '/headmaster/authority', 'AuthorityQueueSheet', true),
    ('act_review_foundation_insights', 'Telaah Wawasan Dewan', 'NAVIGATION', '/foundation/insights', 'InsightReviewSheet', true),
    ('act_view_child_moments', 'Lihat Momen Ananda', 'NAVIGATION', '/guardian/moments', 'GuardianMomentGallery', true)
ON CONFLICT (action_id) DO UPDATE SET
    action_name = EXCLUDED.action_name,
    action_type = EXCLUDED.action_type,
    target_route = EXCLUDED.target_route,
    target_component = EXCLUDED.target_component,
    is_default = EXCLUDED.is_default,
    updated_at = NOW();

ALTER TABLE public.phase_action_mappings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "p_phase_action_read_all" ON public.phase_action_mappings;
CREATE POLICY "p_phase_action_read_all"
ON public.phase_action_mappings FOR SELECT
TO authenticated, anon
USING (true);

-- 2. TABLE: school_rhythm_configs
CREATE TABLE IF NOT EXISTS public.school_rhythm_configs (
    config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    academic_year_id TEXT NOT NULL REFERENCES public.academic_years(id) ON DELETE CASCADE,
    school_timezone VARCHAR(4) NOT NULL CHECK (school_timezone IN ('WIB', 'WITA', 'WIT')),
    rhythm_vocabulary_version VARCHAR(4) NOT NULL DEFAULT 'v1',
    school_opening_time VARCHAR(5) NOT NULL DEFAULT '06:45',
    school_closing_time VARCHAR(5) NOT NULL DEFAULT '14:30',
    phases JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_by_person_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_school_rhythm_year UNIQUE (school_id, academic_year_id)
);

ALTER TABLE public.school_rhythm_configs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.school_rhythm_configs FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.school_rhythm_configs TO authenticated;

DROP POLICY IF EXISTS "p_school_rhythm_read_unit" ON public.school_rhythm_configs;
CREATE POLICY "p_school_rhythm_read_unit"
ON public.school_rhythm_configs FOR SELECT
TO authenticated
USING (
    school_id IN (
        SELECT school_id FROM public.teacher_profiles WHERE person_id = public.get_auth_person_id() AND is_active = true
        UNION
        SELECT school_id FROM public.staff_profiles WHERE person_id = public.get_auth_person_id() AND is_active = true
        UNION
        SELECT id FROM public.schools WHERE headmaster_person_id = public.get_auth_person_id()
    )
);

DROP POLICY IF EXISTS "p_school_rhythm_ks_manage" ON public.school_rhythm_configs;
CREATE POLICY "p_school_rhythm_ks_manage"
ON public.school_rhythm_configs FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.schools 
        WHERE id = school_rhythm_configs.school_id 
          AND headmaster_person_id = public.get_auth_person_id()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.schools 
        WHERE id = school_rhythm_configs.school_id 
          AND headmaster_person_id = public.get_auth_person_id()
    )
);

-- 3. TABLE: closure_ritual_ledger
CREATE TABLE IF NOT EXISTS public.closure_ritual_ledger (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_user_id TEXT NOT NULL REFERENCES public.persons(id) ON DELETE CASCADE,
    school_id TEXT NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    ritual_date DATE NOT NULL DEFAULT CURRENT_DATE,
    closure_state VARCHAR(20) NOT NULL CHECK (closure_state IN ('TUNTAS', 'SISA_TENANG')),
    pending_tasks_count INTEGER NOT NULL DEFAULT 0 CHECK (pending_tasks_count >= 0),
    safety_alerts_count INTEGER NOT NULL DEFAULT 0 CHECK (safety_alerts_count >= 0),
    personal_reflection TEXT,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_teacher_daily_closure UNIQUE (teacher_user_id, ritual_date)
);

ALTER TABLE public.closure_ritual_ledger ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.closure_ritual_ledger FROM anon, authenticated;
GRANT SELECT, INSERT ON public.closure_ritual_ledger TO authenticated;

DROP POLICY IF EXISTS "p_closure_teacher_select_self" ON public.closure_ritual_ledger;
CREATE POLICY "p_closure_teacher_select_self"
ON public.closure_ritual_ledger FOR SELECT
TO authenticated
USING (teacher_user_id = public.get_auth_person_id());

DROP POLICY IF EXISTS "p_closure_teacher_insert_self" ON public.closure_ritual_ledger;
CREATE POLICY "p_closure_teacher_insert_self"
ON public.closure_ritual_ledger FOR INSERT
TO authenticated
WITH CHECK (teacher_user_id = public.get_auth_person_id());
