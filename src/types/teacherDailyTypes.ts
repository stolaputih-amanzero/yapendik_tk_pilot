/**
 * Yapendik School OS — Stage 4.1 Domain Types & Command Interfaces
 * Teacher Daily Operating Loop & Unified Teacher Home Workspace
 */

import { DevelopmentDomain, MilestoneRating, AttendanceStatus } from '../domain/types';

// ==============================================================================
// 1. OPERATING STATES (RITME PEDAGOGIS GURU)
// ==============================================================================
export type OperatingState =
  | 'PREPARE'       // 06:45 - 07:15: Persiapan Ruang Kelas & Sentra
  | 'WELCOME'       // 07:15 - 07:45: Penyambutan, Kedatangan, Cek Mood & Suhu
  | 'GATHER'        // 07:45 - 08:30: Lingkaran Pagi & Intensi Belajar (RPPH)
  | 'PLAY_OBSERVE'  // 08:30 - 10:00: Main Sentra & Momen Cepat (Fast Capture)
  | 'CARE_BREAK'    // 10:00 - 10:30: Makan Bersama, Toilet Training & Istirahat
  | 'REFLECT'       // 10:30 - 11:00: Refleksi Bersama & Apresiasi Karya
  | 'HANDOVER'      // 11:00 - 11:30: Kepulangan & Buku Penghubung Ortu
  | 'SYNTHESIZE';   // 11:30 - 13:00: Sintesis Siang & Pengayaan Bukti LPPA

// ==============================================================================
// 2. EVIDENCE & CAPTURE STATUS
// ==============================================================================
export type EvidenceStatus = 'QUICK_DRAFT' | 'MATURE_EVIDENCE';

export type ArrivalMood = 'CERIA' | 'TENANG' | 'GELISAH' | 'MENANGIS';

export type HealthAlertType = 'ALLERGY' | 'FEVER' | 'MEDICATION' | 'SPECIAL_CARE';

// Kurikulum Merdeka PAUD Quick Tags
export type PAUDQuickTag =
  | 'NILAI_AGAMA_BUDI_PEKERTI'
  | 'JATI_DIRI'
  | 'LITERASI_STEAM'
  | 'MOTORIK_KASAR'
  | 'MOTORIK_HALUS'
  | 'KEMANDIRIAN'
  | 'SOSIAL_EMOSIONAL'
  | 'SENI_KREATIF'
  | 'STEAM_BALOK';

// ==============================================================================
// 3. READ MODEL / AGGREGATE PAYLOADS (TEACHER HOME)
// ==============================================================================
export interface ActiveTeacherContext {
  school_id: string;
  school_name: string;
  class_id: string;
  class_name: string;
  academic_year_id: string;
  academic_year_name: string;
  semester: 'GANJIL' | 'GENAP';
  is_semester_closed: boolean;
  date: string; // YYYY-MM-DD
  teacher: {
    person_id: string;
    name: string;
    role: 'HOMEROOM' | 'CO_TEACHER' | 'HEADMASTER';
    initials: string;
  };
}

export interface ClassroomPulseData {
  total_students: number;
  present_count: number;
  sick_count: number;
  permit_count: number;
  absent_count: number;
  unaccounted_count: number;
  health_alerts: Array<{
    student_id: string;
    student_name: string;
    alert_type: HealthAlertType;
    note: string;
    temperature?: number;
  }>;
  unread_guardian_notes: number;
}

export interface StudentRosterItem {
  student_id: string;
  person_id: string;
  nis: string;
  nisn?: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birth_date?: string;
  photo_url?: string;
  allergies?: string;
  special_needs_notes?: string;
  blood_type?: string;
  today_status?: AttendanceStatus;
  today_temperature?: number;
  today_mood?: ArrivalMood;
  today_arrival_note?: string;
  evidence_count_semester: number;
  lppa_ready_percentage: number;
}

export interface ClassObservationItem {
  id: string;
  recorded_at: string;
  recorded_by_person_id: string;
  recorded_by_name: string;
  recorded_by_initials: string;
  target_student_ids: string[];
  target_student_names: string[];
  media_url?: string;
  media_type?: 'IMAGE' | 'AUDIO';
  anecdote_description: string;
  domain: DevelopmentDomain;
  milestone_rating: MilestoneRating;
  quick_tags: string[];
  status: EvidenceStatus;
  is_lppa_evidence: boolean;
  is_shared_with_guardian: boolean;
  is_staff_confidential: boolean;
}

export interface GuardianNoticeItem {
  id: string;
  student_id?: string;
  student_name?: string;
  class_id?: string;
  author_person_id: string;
  author_name: string;
  recipient_person_id?: string;
  type: 'DAILY_SUMMARY' | 'ANECDOTE_SHARE' | 'HEALTH_ALERT' | 'CLASS_ANNOUNCEMENT' | 'DIRECT_NOTE';
  title: string;
  content: string;
  requires_acknowledgment: boolean;
  acknowledged_at?: string;
  acknowledged_by_person_id?: string;
  guardian_reply?: string;
  created_at: string;
}

export interface TeacherHomeAggregatePayload {
  context: ActiveTeacherContext;
  pulse: ClassroomPulseData;
  roster: StudentRosterItem[];
  recent_observations: ClassObservationItem[];
  guardian_notices: GuardianNoticeItem[];
  daily_completion: {
    is_attendance_complete: boolean;
    pending_enrichment_count: number;
    unacknowledged_notice_count: number;
    is_all_clear: boolean;
  };
}

export interface ChildContextDeepPayload {
  student: StudentRosterItem;
  attendance_history: Array<{
    date: string;
    status: AttendanceStatus;
    temperature?: number;
    mood?: ArrivalMood;
    notes?: string;
  }>;
  evidence_portfolio: ClassObservationItem[];
  guardian_communications: GuardianNoticeItem[];
  lppa_summary: {
    report_id?: string;
    status?: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'PUBLISHED';
    domains_covered: number;
    homeroom_feedback?: string;
  };
}

// ==============================================================================
// 4. APPLICATION COMMAND CONTRACTS (WRITE MODEL)
// ==============================================================================
export interface AttendanceBatchEntry {
  student_id: string;
  status: AttendanceStatus;
  temperature_celsius?: number;
  arrival_mood?: ArrivalMood;
  notes?: string;
}

export interface RecordDailyAttendanceBatchCommand {
  school_id: string;
  class_id: string;
  attendance_date: string; // YYYY-MM-DD
  recorded_by_person_id: string;
  recorded_by_name: string;
  role: string;
  entries: AttendanceBatchEntry[];
}

export interface CaptureQuickObservationCommand {
  id?: string; // Client-side UUID v4 (Auto-generated if absent)
  school_id: string;
  class_id: string;
  target_student_ids: string[];
  domain?: DevelopmentDomain;
  quick_tags: string[];
  initial_note: string;
  media_url?: string;
  media_type?: 'IMAGE' | 'AUDIO';
  milestone_rating?: MilestoneRating;
  recorded_by_person_id: string;
  recorded_by_name: string;
  role: string;
}

export interface EnrichObservationNarrativeCommand {
  observation_id: string;
  pedagogical_narrative: string;
  domain: DevelopmentDomain;
  milestone_rating: MilestoneRating;
  indicators_observed: string[];
  is_lppa_evidence: boolean;
  is_shared_with_guardian: boolean;
  is_staff_confidential: boolean;
  enriched_by_person_id: string;
  enriched_by_name: string;
  role: string;
  school_id: string;
}

export interface AcknowledgeGuardianNoticeCommand {
  notice_id: string;
  acknowledged_by_person_id: string;
  acknowledged_by_name: string;
  teacher_reply_text?: string;
  school_id: string;
  role: string;
}

// ==============================================================================
// 5. OFFLINE QUEUE COMMAND ITEM
// ==============================================================================
export interface OfflineQueueItem {
  queue_id: string;
  command_type: 'RECORD_ATTENDANCE' | 'CAPTURE_OBSERVATION' | 'ENRICH_OBSERVATION' | 'ACK_NOTICE';
  payload: RecordDailyAttendanceBatchCommand | CaptureQuickObservationCommand | EnrichObservationNarrativeCommand | AcknowledgeGuardianNoticeCommand;
  created_at: string;
  retry_count: number;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  error_message?: string;
}
