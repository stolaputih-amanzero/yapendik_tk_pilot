/**
 * YAPENDIK SCHOOL OS — STAGE 6-A DOMAIN TYPES
 * The Warm Briefing & The Closure Mode
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 */

export type SchoolTimezone = 'WIB' | 'WITA' | 'WIT';
export type RhythmVocabularyVersion = 'v1';
export type BriefingMode = 'PRATINJAU' | 'OPERASIONAL' | 'PENUTUP';
export type ClosureState = 'TUNTAS' | 'SISA_TENANG';
export type UserRole = 'TEACHER' | 'HEADMASTER' | 'FOUNDATION' | 'GUARDIAN';
export type ActionTargetType = 'NAVIGATION' | 'MODAL' | 'SHEET' | 'RITUAL';
export type MessageDeliveryPolicy = 'HOLD_UNTIL_MORNING' | 'DELIVER_IMMEDIATELY';

export type SoundTriggerContext =
  | 'EARNED'
  | 'INTENTIONAL'
  | 'NAVIGATION'
  | 'AUTO'
  | 'TASK_COMPLETION_EARNED'
  | 'USER_TAP_INTENTIONAL'
  | 'AUTO_AMBIENT_PROHIBITED'
  | 'NAVIGATION_PROHIBITED';

// ============================================================================
// 1. SCHOOL RHYTHM & PHASE ACTION ENTITIES
// ============================================================================

export interface PhaseConfig {
  phase_id: string;          // e.g. 'WELCOME' | 'CENTRA' | 'LUNCH' | 'SYNTHESIS' | 'HANDOVER' | 'CLOSING'
  phase_name: string;        // "Sambut Ananda", "Main Sentra", dsb.
  start_time: string;        // "07:15" (Format HH:mm)
  end_time: string;          // "08:30" (Format HH:mm)
  is_active: boolean;
  quick_action_id?: string;  // ID dari PhaseActionMapping (Override lokal KS)
}

export interface SchoolRhythmConfig {
  config_id?: string;
  school_id: string;
  academic_year_id: string;
  school_timezone: SchoolTimezone;           // T-1 Resolved: WIB | WITA | WIT
  rhythm_vocabulary_version: RhythmVocabularyVersion; // T-4 Resolved: 'v1'
  school_opening_time: string;               // "06:45"
  school_closing_time: string;               // "14:30"
  phases: PhaseConfig[];
  updated_by_person_id: string;
  updated_at?: string;
  created_at?: string;
}

export interface PhaseActionMapping {
  action_id: string;          // 'act_take_attendance' | 'act_record_moment' | 'act_close_day'
  action_name: string;        // "Buka Presensi", "Rekam Momen", "Tutup Hari"
  action_type: ActionTargetType;
  target_route?: string;
  target_component?: string;
  is_default: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// 2. GUARDIAN RELATIONSHIP ENTITY (FB-09)
// ============================================================================

export interface GuardianRelationshipRecord {
  relationship_id: string;
  guardian_user_id: string;
  child_id: string;
  relationship_type: 'PARENT' | 'GUARDIAN' | 'WALI' | 'AYAH' | 'IBU';
  is_active: boolean;
  verified_at: string;
}

// ============================================================================
// 3. CLOSURE RITUAL EVENT (T-3: Non-Aggregable)
// ============================================================================

export interface ClosureRitualEvent {
  event_id: string;
  teacher_user_id: string;
  school_id: string;
  ritual_date: string;       // YYYY-MM-DD
  closure_state: ClosureState;
  pending_tasks_count: number;
  safety_alerts_count: number;
  personal_reflection?: string;
  recorded_at: string;
  created_at?: string;
  updated_at?: string;
}

// ============================================================================
// 4. BRIEFING DATA CONTRACTS (Discriminated Union)
// ============================================================================

export interface WarmEcho {
  source_type: 'PARENT_MESSAGE' | 'TEACHER_REFLECTION' | 'CHILD_QUOTE' | 'HEADMASTER_NOTE';
  source_author: string;
  quote_text: string;
  timestamp: string;
}

export interface BaseBriefingData {
  mode: BriefingMode;
  greeting: string;
  date_formatted: string;
  school_local_time: string;
  warm_echo?: WarmEcho;
}

export interface TeacherBriefingData extends BaseBriefingData {
  role: 'TEACHER';
  active_phase?: PhaseConfig;
  quick_action?: PhaseActionMapping;
  pending_tasks: {
    attendance_incomplete: boolean;
    active_allergies: number;
    unread_messages: number;
    draft_observations: number;
    oldest_draft_title?: string;
  };
  closure_summary?: {
    present_children: number;
    total_children: number;
    moments_recorded: number;
    messages_replied: number;
    pending_drafts_count: number;
    closure_state: ClosureState;
  };
}

export interface HeadmasterBriefingData extends BaseBriefingData {
  role: 'HEADMASTER';
  reconciliation: {
    classes_complete: number;
    classes_total: number;
    safety_alerts: number;
  };
  authority_queue: {
    pending_lppa_approvals: number;
    pending_adoptions: number;
    oldest_pending_age_days: number;
  };
  partnership_pulse: {
    unread_messages: number;
    pending_confirmations: number;
  };
  closure_summary?: {
    lppa_approved_today: number;
    directives_responded_today: number;
    safety_status_green: boolean;
  };
}

export interface FoundationBriefingData extends BaseBriefingData {
  role: 'FOUNDATION';
  cycle_view: 'DAILY_SIGNAL' | 'WEEKLY_REVIEW' | 'WEEKLY_PREVIEW';
  decision_queue: {
    insights_awaiting_decision: number;
    oldest_insight_age_days: number;
  };
  loop_health: {
    actions_awaiting_adoption: number;
    outcomes_not_recorded: number;
  };
  equity_signals: {
    new_patterns_detected: number;
    suppressed_cohorts: number; // FB-07 K-Anonymity
  };
}

export interface GuardianBriefingData extends BaseBriefingData {
  role: 'GUARDIAN';
  child_name: string;
  today_summary: {
    attendance_status: 'Hadir' | 'Izin' | 'Sakit' | 'Belum Ada Kabar';
    meal_status?: string;
    active_phase_name?: string;
  };
  latest_moment?: {
    moment_id: string;
    thumbnail_url: string;
    caption: string;
    captured_at: string;
  };
  teacher_note?: string;
  lppa_published_available: boolean;
}

export type BriefingData =
  | TeacherBriefingData
  | HeadmasterBriefingData
  | FoundationBriefingData
  | GuardianBriefingData;
