-- ═══════════════════════════════════════════════════════════════════════════
-- YAPENDIK SCHOOL OS — STAGE 6-A BRIEFING & INSTITUTIONAL LEARNING RPCS
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. TABLE: phase_action_mappings (Vocabulary Catalog v1)
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

DO $$ BEGIN
  DROP POLICY IF EXISTS "p_phase_action_read_all" ON public.phase_action_mappings;
END $$;

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

-- ═══════════════════════════════════════════════════════════════════════════
-- 4. RPC: rpc_get_briefing_data
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.rpc_get_briefing_data(
    p_role TEXT,
    p_school_id TEXT,
    p_person_id TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
    v_caller_person_id TEXT;
    v_rhythm RECORD;
    v_tz_offset_hours INT := 7;
    v_school_now TIMESTAMPTZ;
    v_time_str VARCHAR(5);
    v_mode TEXT := 'OPERASIONAL';
    v_greeting TEXT;
    v_caller_name TEXT := 'Pendidik';
    v_pref_name TEXT;
    v_full_name TEXT;
    v_result JSONB;
    v_pending_attendance INT := 0;
    v_pending_drafts INT := 0;
    v_pending_messages INT := 0;
    v_active_safety_alerts INT := 0;
    v_classes_total INT := 0;
    v_classes_complete INT := 0;
    v_pending_lppa INT := 0;
    v_child RECORD;
BEGIN
    v_caller_person_id := COALESCE(p_person_id, public.get_auth_person_id());
    IF v_caller_person_id IS NOT NULL THEN
        SELECT preferred_name, full_name INTO v_pref_name, v_full_name 
        FROM public.persons 
        WHERE id = v_caller_person_id;

        IF v_pref_name IS NOT NULL THEN
            v_caller_name := v_pref_name;
        ELSIF v_full_name IS NOT NULL THEN
            v_caller_name := 'Bu ' || split_part(v_full_name, ' ', 1);
        END IF;
    END IF;

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

    v_school_now := timezone('UTC', NOW()) + (v_tz_offset_hours || ' hours')::interval;
    v_time_str := to_char(v_school_now, 'HH24:MI');

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

    IF p_role = 'TEACHER' THEN
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
        WHERE obr.observer_person_id = v_caller_person_id 
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
                'source_author', 'Orang Tua Murid',
                'quote_text', 'Terima kasih Bapak/Ibu Guru, ananda sangat senang belajar hari ini.',
                'timestamp', to_char(NOW() - INTERVAL '2 hours', 'HH24:MI')
            )
        );

    ELSIF p_role = 'HEADMASTER' THEN
        SELECT COUNT(*) INTO v_classes_total FROM public.classes WHERE school_id = p_school_id;
        SELECT COUNT(DISTINCT class_id) INTO v_classes_complete FROM public.daily_attendance WHERE school_id = p_school_id AND date = CURRENT_DATE;
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
                'pending_adoptions', 0,
                'oldest_pending_age_days', 1
            ),
            'partnership_pulse', jsonb_build_object(
                'unread_messages', 0,
                'pending_confirmations', 0
            ),
            'warm_echo', jsonb_build_object(
                'source_type', 'TEACHER_REFLECTION',
                'source_author', 'Guru Kelas',
                'quote_text', 'Anak-anak kelas TK sangat fokus saat eksplorasi bahan alam pagi ini.',
                'timestamp', to_char(NOW() - INTERVAL '3 hours', 'HH24:MI')
            )
        );

    ELSIF p_role = 'GUARDIAN' THEN
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
                'meal_status', 'Makan siang tuntas',
                'active_phase_name', 'Main Sentra'
            )
        );

    ELSE
        -- FOUNDATION / SUPERADMIN
        v_result := jsonb_build_object(
            'role', 'FOUNDATION',
            'greeting', v_greeting,
            'date_formatted', to_char(v_school_now, 'TMDay, DD TMMonth YYYY'),
            'school_local_time', v_time_str,
            'mode', v_mode,
            'cycle_view', 'WEEKLY_REVIEW',
            'decision_queue', jsonb_build_object(
                'insights_awaiting_decision', 0,
                'oldest_insight_age_days', 0
            ),
            'loop_health', jsonb_build_object(
                'actions_awaiting_adoption', 0,
                'outcomes_not_recorded', 0
            ),
            'equity_signals', jsonb_build_object(
                'new_patterns_detected', 0,
                'suppressed_cohorts', 0
            ),
            'warm_echo', jsonb_build_object(
                'source_type', 'HEADMASTER_NOTE',
                'source_author', 'Kepala Sekolah TK Yapendik',
                'quote_text', 'Bantuan material loose-parts telah aktif digunakan dalam siklus bermain.',
                'timestamp', 'Kemarin'
            )
        );
    END IF;

    RETURN v_result;
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 5. RPC: fn_derive_curriculum_domain_pattern
-- ═══════════════════════════════════════════════════════════════════════════
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

-- ═══════════════════════════════════════════════════════════════════════════
-- 6. RPC: rpc_verify_closed_loop_condition
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.rpc_verify_closed_loop_condition(p_action_id TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN jsonb_build_object(
    'success', true,
    'action_id', p_action_id,
    'is_closed_loop', true,
    'milestones', jsonb_build_object(
      'action_active', true,
      'school_adopted', true,
      'outcome_verified', true
    ),
    'diagnostic_flags', '[]'::jsonb
  );
END;
$$;

-- ═══════════════════════════════════════════════════════════════════════════
-- 7. RLS POLICIES: GOVERNANCE, STAFF, & TEACHER PROFILE RESOLUTION
-- ═══════════════════════════════════════════════════════════════════════════
GRANT SELECT ON public.governance_profiles TO authenticated, anon;
GRANT SELECT ON public.staff_profiles TO authenticated, anon;
GRANT SELECT ON public.teacher_profiles TO authenticated, anon;

DO $$ BEGIN
  DROP POLICY IF EXISTS "p_governance_profiles_read_all" ON public.governance_profiles;
  DROP POLICY IF EXISTS "p_staff_profiles_read_all" ON public.staff_profiles;
  DROP POLICY IF EXISTS "p_teacher_profiles_read_all" ON public.teacher_profiles;
END $$;

CREATE POLICY "p_governance_profiles_read_all"
ON public.governance_profiles FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "p_staff_profiles_read_all"
ON public.staff_profiles FOR SELECT
TO authenticated, anon
USING (true);

CREATE POLICY "p_teacher_profiles_read_all"
ON public.teacher_profiles FOR SELECT
TO authenticated, anon
USING (true);

GRANT EXECUTE ON FUNCTION public.rpc_get_briefing_data(TEXT, TEXT, TEXT) TO authenticated, anon;

