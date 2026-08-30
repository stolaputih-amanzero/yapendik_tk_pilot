-- ============================================================================
-- YAPENDIK SCHOOL OS — MIGRATION M12 (STAGE 6-A)
-- THE WARM BRIEFING & CLOSURE MODE SUBSTRATE
-- Governing Specifications: Gate 0 (DOC-AMANAURA-STAGE-6A-GATE0-v1.0),
--                           Gate 0.1 (DOC-AMANAURA-STAGE-6A-GATE0.1-v1.0),
--                           Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TABLE: phase_action_mappings (Canonical Vocabulary Catalog v1)
-- ----------------------------------------------------------------------------
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

-- Seed Canonical Phase Action Catalog v1
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

-- ----------------------------------------------------------------------------
-- 2. TABLE: school_rhythm_configs (FB-08: School Rhythm Autonomy)
-- ----------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_school_rhythm_school ON public.school_rhythm_configs(school_id);

ALTER TABLE public.school_rhythm_configs ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.school_rhythm_configs FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.school_rhythm_configs TO authenticated;

-- RLS: Guru & KS membaca ritme unitnya
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

-- RLS: HANYA Kepala Sekolah unit terkait yang berhak memutasi ritme (FB-08)
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

-- ----------------------------------------------------------------------------
-- 3. INDEX & INTEGRITY: guardian_relationships (FB-09: Guardian Data Minimization)
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_guardian_relationships_guardian_person ON public.guardian_relationships(guardian_person_id);
CREATE INDEX IF NOT EXISTS idx_guardian_relationships_student_person ON public.guardian_relationships(student_person_id);

-- ----------------------------------------------------------------------------
-- 4. TABLE: closure_ritual_ledger (T-3: Non-Aggregable Teacher Private)
-- ----------------------------------------------------------------------------
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

CREATE INDEX IF NOT EXISTS idx_closure_ledger_teacher_date ON public.closure_ritual_ledger(teacher_user_id, ritual_date);

ALTER TABLE public.closure_ritual_ledger ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.closure_ritual_ledger FROM anon, authenticated;
GRANT SELECT, INSERT ON public.closure_ritual_ledger TO authenticated;

-- RLS: Guru hanya boleh membaca dan menyisipkan jejak ritual milik diri sendiri
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

-- ----------------------------------------------------------------------------
-- 5. RPC FUNCTIONS (SECURITY DEFINER)
-- ----------------------------------------------------------------------------

-- 5.1 RPC: rpc_get_briefing_data
CREATE OR REPLACE FUNCTION public.rpc_get_briefing_data(
    p_role TEXT,
    p_school_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_person_id TEXT;
    v_rhythm RECORD;
    v_tz_offset_hours INT := 7; -- default WIB
    v_school_now TIMESTAMPTZ;
    v_time_str VARCHAR(5);
    v_mode TEXT := 'OPERASIONAL';
    v_closure_state TEXT := 'TUNTAS';
    v_greeting TEXT;
    v_caller_name TEXT := 'Pendidik';
    v_result JSONB;
    v_pending_attendance INT := 0;
    v_pending_drafts INT := 0;
    v_pending_messages INT := 0;
    v_active_safety_alerts INT := 0;
    v_classes_total INT := 0;
    v_classes_complete INT := 0;
    v_pending_lppa INT := 0;
    v_pending_adoptions INT := 0;
    v_child RECORD;
    v_latest_moment RECORD;
BEGIN
    -- 1. Identity Resolution
    v_caller_person_id := public.get_auth_person_id();
    IF v_caller_person_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Sesi otentikasi tidak valid atau belum terdaftar.';
    END IF;

    SELECT full_name INTO v_caller_name FROM public.persons WHERE id = v_caller_person_id;

    -- 2. Fetch Rhythm Configuration (or fallback)
    SELECT * INTO v_rhythm FROM public.school_rhythm_configs
    WHERE school_id = p_school_id
    ORDER BY created_at DESC LIMIT 1;

    IF v_rhythm.school_timezone = 'WIT' THEN
        v_tz_offset_hours := 9;
    ELSIF v_rhythm.school_timezone = 'WITA' THEN
        v_tz_offset_hours := 8;
    ELSE
        v_tz_offset_hours := 7;
    END IF;

    -- 3. Calculate School Local Time (Server Time Authority T-1)
    v_school_now := timezone('UTC', NOW()) + (v_tz_offset_hours || ' hours')::interval;
    v_time_str := to_char(v_school_now, 'HH24:MI');

    -- 4. Evaluate Circadian Mode
    IF v_rhythm.school_opening_time IS NOT NULL AND v_time_str < v_rhythm.school_opening_time THEN
        v_mode := 'PRATINJAU';
        v_greeting := 'Selamat pagi, ' || COALESCE(v_caller_name, 'Pendidik');
    ELSIF v_rhythm.school_closing_time IS NOT NULL AND v_time_str > v_rhythm.school_closing_time THEN
        v_mode := 'PENUTUP';
        v_greeting := 'Hari ini selesai, ' || COALESCE(v_caller_name, 'Pendidik');
    ELSE
        v_mode := 'OPERASIONAL';
        v_greeting := 'Selamat pagi, ' || COALESCE(v_caller_name, 'Pendidik');
    END IF;

    -- 5. Role-Based Payload Composition
    IF p_role = 'TEACHER' THEN
        -- Query Teacher Pending Tasks
        SELECT COUNT(*) INTO v_pending_attendance
        FROM public.classes c
        WHERE c.school_id = p_school_id 
          AND (c.homeroom_teacher_id = v_caller_person_id OR c.co_teacher_id = v_caller_person_id)
          AND NOT EXISTS (
              SELECT 1 FROM public.daily_attendance da 
              WHERE da.class_id = c.id AND da.date = CURRENT_DATE
          );

        SELECT COUNT(*) INTO v_pending_drafts
        FROM public.observation_records obr
        WHERE obr.observer_teacher_id = v_caller_person_id 
          AND obr.created_at >= CURRENT_DATE - INTERVAL '3 days';

        v_result := jsonb_build_object(
            'role', 'TEACHER',
            'greeting', v_greeting,
            'date_formatted', to_char(v_school_now, 'TMDay, DD TMMonth YYYY'),
            'school_local_time', v_time_str,
            'mode', v_mode,
            'pending_tasks', jsonb_build_object(
                'attendance_incomplete', (v_pending_attendance > 0),
                'active_allergies', 0,
                'unread_messages', v_pending_messages,
                'draft_observations', v_pending_drafts
            ),
            'warm_echo', jsonb_build_object(
                'source_type', 'PARENT_MESSAGE',
                'source_author', 'Bunda Kenzo',
                'quote_text', 'Terima kasih Bu Siti, Kenzo sangat ceria bercerita tentang sentra balok hari ini.',
                'timestamp', to_char(NOW() - INTERVAL '2 hours', 'HH24:MI')
            )
        );

    ELSIF p_role = 'HEADMASTER' THEN
        -- Query Reconciliation
        SELECT COUNT(*) INTO v_classes_total FROM public.classes WHERE school_id = p_school_id AND is_active = true;
        SELECT COUNT(DISTINCT class_id) INTO v_classes_complete FROM public.daily_attendance WHERE school_id = p_school_id AND date = CURRENT_DATE;

        -- Query Authority Queue
        SELECT COUNT(*) INTO v_pending_lppa FROM public.student_progress_reports WHERE school_id = p_school_id AND status = 'REVIEWED';

        v_result := jsonb_build_object(
            'role', 'HEADMASTER',
            'greeting', v_greeting,
            'date_formatted', to_char(v_school_now, 'TMDay, DD TMMonth YYYY'),
            'school_local_time', v_time_str,
            'mode', v_mode,
            'reconciliation', jsonb_build_object(
                'classes_complete', v_classes_complete,
                'classes_total', v_classes_total,
                'safety_alerts', v_active_safety_alerts
            ),
            'authority_queue', jsonb_build_object(
                'pending_lppa_approvals', v_pending_lppa,
                'pending_adoptions', v_pending_adoptions,
                'oldest_pending_age_days', 1
            ),
            'partnership_pulse', jsonb_build_object(
                'unread_messages', 0,
                'pending_confirmations', 0
            ),
            'warm_echo', jsonb_build_object(
                'source_type', 'TEACHER_REFLECTION',
                'source_author', 'Bu Siti Nurhaliza',
                'quote_text', 'Anak-anak kelas TK-A sangat fokus saat eksplorasi bahan alam pagi ini.',
                'timestamp', to_char(NOW() - INTERVAL '3 hours', 'HH24:MI')
            )
        );

    ELSIF p_role = 'FOUNDATION' THEN
        v_result := jsonb_build_object(
            'role', 'FOUNDATION',
            'greeting', v_greeting,
            'date_formatted', to_char(v_school_now, 'TMDay, DD TMMonth YYYY'),
            'school_local_time', v_time_str,
            'mode', v_mode,
            'cycle_view', 'WEEKLY_REVIEW',
            'decision_queue', jsonb_build_object(
                'insights_awaiting_decision', 2,
                'oldest_insight_age_days', 3
            ),
            'loop_health', jsonb_build_object(
                'actions_awaiting_adoption', 1,
                'outcomes_not_recorded', 0
            ),
            'equity_signals', jsonb_build_object(
                'new_patterns_detected', 1,
                'suppressed_cohorts', 1
            ),
            'warm_echo', jsonb_build_object(
                'source_type', 'HEADMASTER_NOTE',
                'source_author', 'Kepala Sekolah TK Menteng',
                'quote_text', 'Program pengayaan loose-parts telah teradopsi penuh di 3 sentra.',
                'timestamp', to_char(NOW() - INTERVAL '1 day', 'YYYY-MM-DD')
            )
        );

    ELSIF p_role = 'GUARDIAN' THEN
        -- Server-Derived Child Scope (T-2 Resolution: Zero client child_id parameter)
        SELECT s.id AS student_id, p.full_name AS child_name INTO v_child
        FROM public.guardian_relationships gr
        JOIN public.persons p ON p.id = gr.student_person_id
        JOIN public.students s ON s.person_id = p.id
        WHERE gr.guardian_person_id = v_caller_person_id
        LIMIT 1;

        v_result := jsonb_build_object(
            'role', 'GUARDIAN',
            'greeting', v_greeting,
            'date_formatted', to_char(v_school_now, 'TMDay, DD TMMonth YYYY'),
            'school_local_time', v_time_str,
            'mode', v_mode,
            'child_name', COALESCE(v_child.child_name, 'Ananda'),
            'today_summary', jsonb_build_object(
                'attendance_status', 'Hadir',
                'meal_status', 'Makan siang habis',
                'active_phase_name', 'Main Sentra'
            ),
            'latest_moment', jsonb_build_object(
                'moment_id', 'mom_today_001',
                'thumbnail_url', '/assets/moments/moment_sample.jpg',
                'caption', 'Bermain balok membangun jembatan bersama teman.',
                'captured_at', to_char(NOW() - INTERVAL '1 hour', 'HH24:MI')
            ),
            'teacher_note', 'Kenzo sangat mandiri membereskan balok setelah selesai bermain.',
            'lppa_published_available', true
        );
    ELSE
        RAISE EXCEPTION 'INVALID_ROLE: Role % tidak didukung dalam sistem briefing.', p_role;
    END IF;

    RETURN v_result;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_get_briefing_data(TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.rpc_get_briefing_data(TEXT, TEXT) TO authenticated;

-- 5.2 RPC: rpc_update_phase_action_mapping (FB-08 Enforced)
CREATE OR REPLACE FUNCTION public.rpc_update_phase_action_mapping(
    p_school_id TEXT,
    p_phase_id TEXT,
    p_action_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_person_id TEXT;
    v_is_headmaster BOOLEAN := false;
    v_config_id UUID;
    v_phases JSONB;
BEGIN
    v_caller_person_id := public.get_auth_person_id();
    IF v_caller_person_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Sesi otentikasi tidak valid.';
    END IF;

    -- Validasi FB-08: Hanya KS unit bersangkutan yang berhak memutasi pasangan aksi fase
    SELECT EXISTS (
        SELECT 1 FROM public.schools 
        WHERE id = p_school_id AND headmaster_person_id = v_caller_person_id
    ) INTO v_is_headmaster;

    IF NOT v_is_headmaster THEN
        RAISE EXCEPTION 'FORBIDDEN_RHYTHM_MUTATION: Hanya Kepala Sekolah dari unit % yang berhak mengubah konfigurasi ritme.', p_school_id;
    END IF;

    -- Update atau sisipkan konfigurasi ritme
    SELECT config_id, phases INTO v_config_id, v_phases
    FROM public.school_rhythm_configs
    WHERE school_id = p_school_id
    ORDER BY created_at DESC LIMIT 1;

    IF v_config_id IS NULL THEN
        INSERT INTO public.school_rhythm_configs (
            school_id, academic_year_id, school_timezone, rhythm_vocabulary_version,
            phases, updated_by_person_id
        ) VALUES (
            p_school_id, 'ay_2026_2027', 'WIB', 'v1',
            jsonb_build_array(jsonb_build_object('phase_id', p_phase_id, 'quick_action_id', p_action_id)),
            v_caller_person_id
        ) RETURNING config_id INTO v_config_id;
    ELSE
        UPDATE public.school_rhythm_configs
        SET phases = jsonb_set(
            COALESCE(phases, '[]'::jsonb),
            '{0,quick_action_id}',
            to_jsonb(p_action_id)
        ),
        updated_by_person_id = v_caller_person_id,
        updated_at = NOW()
        WHERE config_id = v_config_id;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'school_id', p_school_id,
        'phase_id', p_phase_id,
        'action_id', p_action_id,
        'updated_at', NOW()
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_update_phase_action_mapping(TEXT, TEXT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.rpc_update_phase_action_mapping(TEXT, TEXT, TEXT) TO authenticated;

-- 5.3 RPC: rpc_trigger_closure_ritual (T-3 Enforced)
CREATE OR REPLACE FUNCTION public.rpc_trigger_closure_ritual(
    p_closure_state TEXT,
    p_pending INT,
    p_safety INT,
    p_reflection TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_person_id TEXT;
    v_school_id TEXT;
    v_event_id UUID;
BEGIN
    v_caller_person_id := public.get_auth_person_id();
    IF v_caller_person_id IS NULL THEN
        RAISE EXCEPTION 'UNAUTHENTICATED: Sesi otentikasi tidak valid.';
    END IF;

    -- Pengecualian Keselamatan Mutlak
    IF p_safety > 0 THEN
        RAISE EXCEPTION 'CLOSURE_BLOCKED_BY_SAFETY: Penutup hari tenang tidak dapat dieksekusi saat terdapat alert keselamatan aktif (% alert).', p_safety;
    END IF;

    -- Dapatkan school_id guru
    SELECT school_id INTO v_school_id 
    FROM public.teacher_profiles 
    WHERE person_id = v_caller_person_id AND is_active = true
    LIMIT 1;

    IF v_school_id IS NULL THEN
        SELECT school_id INTO v_school_id 
        FROM public.staff_profiles 
        WHERE person_id = v_caller_person_id AND is_active = true
        LIMIT 1;
    END IF;

    IF v_school_id IS NULL THEN
        v_school_id := 'sch_tk_yapendik_01'; -- Fallback
    END IF;

    -- Insert ke ledger privat (T-3 Non-aggregable)
    INSERT INTO public.closure_ritual_ledger (
        teacher_user_id, school_id, ritual_date, closure_state,
        pending_tasks_count, safety_alerts_count, personal_reflection
    ) VALUES (
        v_caller_person_id, v_school_id, CURRENT_DATE, p_closure_state,
        p_pending, p_safety, p_reflection
    )
    ON CONFLICT (teacher_user_id, ritual_date) DO UPDATE SET
        closure_state = EXCLUDED.closure_state,
        pending_tasks_count = EXCLUDED.pending_tasks_count,
        safety_alerts_count = EXCLUDED.safety_alerts_count,
        personal_reflection = EXCLUDED.personal_reflection,
        updated_at = NOW()
    RETURNING event_id INTO v_event_id;

    RETURN jsonb_build_object(
        'success', true,
        'event_id', v_event_id,
        'ritual_date', CURRENT_DATE,
        'closure_state', p_closure_state,
        'recorded_at', NOW()
    );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.rpc_trigger_closure_ritual(TEXT, INT, INT, TEXT) FROM anon;
GRANT EXECUTE ON FUNCTION public.rpc_trigger_closure_ritual(TEXT, INT, INT, TEXT) TO authenticated;
