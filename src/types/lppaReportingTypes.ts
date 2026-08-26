/**
 * Yapendik School OS — Stage 4.2 LPPA Reporting & Synthesis Types
 * 
 * Epistemological Principle:
 * "LPPA Synthesis Engine generates a proposed narrative, not the truth."
 * 
 * 10 Canonical Constraints:
 * 1. Evidence First
 * 2. Child-Centered
 * 3. Progress Over Labeling
 * 4. Specific Over Generic
 * 5. Teacher Remains the Author
 * 6. No Fabrication (Zero Hallucination)
 * 7. Privacy by Construction (Invariant C-11)
 * 8. Developmental Continuity
 * 9. Human, Dignified & Warm
 * 10. Traceable
 */

import { DevelopmentDomain, MilestoneRating, AttendanceStatus } from '../domain/types';

export type LppaElementKey = 
  | 'NILAI_AGAMA_BUDI_PEKERTI'
  | 'JATI_DIRI'
  | 'LITERASI_STEAM'
  | 'PROJEK_P5';

export type LppaReportStatus = 
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED';

export interface LppaSupportingEvidenceItem {
  observation_id: string;
  observed_at: string;
  anecdote_snippet: string;
  milestone_rating: MilestoneRating;
  indicators_observed: string[];
  photo_url?: string;
  observer_name: string;
}

export interface LppaElementNarrativeDraft {
  element_key: LppaElementKey;
  element_title: string;
  rating_summary: MilestoneRating;
  proposed_narrative: string;
  teacher_final_narrative: string;
  observed_strengths: string[];
  growth_recommendations: string;
  supporting_evidence_ids: string[];
  supporting_evidences: LppaSupportingEvidenceItem[];
  is_teacher_edited: boolean;
}

export interface LppaPhysicalGrowth {
  height_cm: number;
  weight_kg: number;
  head_circumference_cm?: number;
  physical_notes?: string;
  vision_hearing_notes?: string;
}

export interface LppaAttendanceSummary {
  hadir_count: number;
  sakit_count: number;
  izin_count: number;
  alpa_count: number;
  total_days: number;
  attendance_percentage: number;
}

export interface LppaReportDocument {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  student_name: string;
  student_nis: string;
  student_nisn?: string;
  student_gender: 'MALE' | 'FEMALE';
  student_birth_date?: string;
  academic_year_id: string;
  academic_year_name: string;
  semester: 'GANJIL' | 'GENAP';
  
  // 4 Kurikulum Merdeka PAUD Elemen Capaian
  elements: Record<LppaElementKey, LppaElementNarrativeDraft>;
  
  // P5 Projek Narasi Khusus
  p5_project_title?: string;
  p5_project_description?: string;
  
  // Rekam Fisik & Kehadiran
  physical_growth: LppaPhysicalGrowth;
  attendance_summary: LppaAttendanceSummary;
  
  // Refleksi Pendidik
  homeroom_teacher_reflection: string;
  
  // Metadata Penilaian & Persetujuan
  created_by_person_id: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  submitted_for_review_at?: string;
  approved_by_person_id?: string;
  approved_by_name?: string;
  approved_at?: string;
  published_at?: string;
  
  status: LppaReportStatus;
}

// ==============================================================================
// APPLICATION COMMAND CONTRACTS (STAGE 4.2 MUTATIONS)
// ==============================================================================

/**
 * Command 1: Sintesis Proposal Draf Narasi LPPA dari Bukti Empiris
 */
export interface SynthesizeLppaDraftCommand {
  school_id: string;
  class_id: string;
  student_id: string;
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  requested_by_person_id: string;
  requested_by_name: string;
  role: string;
}

/**
 * Command 2: Guru Menyimpan Draf Rapor & Revisi Narasi Guru
 */
export interface SaveLppaReportDraftCommand {
  report_id?: string;
  school_id: string;
  class_id: string;
  student_id: string;
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  elements: Record<LppaElementKey, {
    teacher_final_narrative: string;
    rating_summary: MilestoneRating;
    growth_recommendations: string;
    supporting_evidence_ids: string[];
    observed_strengths?: string[];
  }>;
  p5_project_title?: string;
  p5_project_description?: string;
  physical_growth: LppaPhysicalGrowth;
  homeroom_teacher_reflection: string;
  saved_by_person_id: string;
  saved_by_name: string;
  role: string;
}

/**
 * Command 3: Guru Mengunci & Mengajukan Rapor ke Kepala Sekolah
 */
export interface SubmitLppaForReviewCommand {
  report_id: string;
  school_id: string;
  submitted_by_person_id: string;
  submitted_by_name: string;
  role: string;
}

/**
 * Command 4: Kepala Sekolah Mengesahkan Rapor (Approval Gate)
 */
export interface ApproveLppaReportCommand {
  report_id: string;
  school_id: string;
  approved_by_person_id: string;
  approved_by_name: string;
  role: string; // WAJIB 'HEADMASTER' atau 'YAPENDIK_SUPERADMIN'
}

/**
 * Command 5: Publikasikan Rapor ke Portal Wali Murid
 */
export interface PublishLppaReportCommand {
  report_id: string;
  school_id: string;
  published_by_person_id: string;
  published_by_name: string;
  role: string;
}

// ----------------------------------------------------
// 4. CANONICAL PUBLISHED LPPA RECORD & ARCHIVE (FASE E)
// ----------------------------------------------------

export interface CanonicalElementReport {
  element_title: string;
  rating_summary: MilestoneRating;
  final_narrative: string;
  growth_recommendations: string;
  supporting_evidences: {
    observation_id: string;
    observed_at: string;
    milestone_rating: string;
    anecdote_snippet: string;
    photo_url?: string;
  }[];
}

export interface CanonicalPublishedLppaRecord {
  /** Unique published archive identifier */
  published_record_id: string;
  
  /** Source LPPA report ID */
  report_id: string;
  
  /** Institutional context */
  school_id: string;
  school_name: string;
  school_npsn: string;
  class_id: string;
  class_name: string;
  academic_year_id: string;
  academic_year_name: string;
  semester: 'GANJIL' | 'GENAP';

  /** Official Publication Metadata */
  publication_metadata: {
    published_at: string;
    published_by_person_id: string;
    published_by_name: string;
    published_by_role: 'HEADMASTER' | 'YAPENDIK_SUPERADMIN';
    official_report_number: string;
    canonical_checksum_sha256: string;
    verification_qr_payload: string;
  };

  /** Student Demographics at publication time */
  student_snapshot: {
    student_id: string;
    full_name: string;
    nis: string;
    nisn?: string;
    gender: 'MALE' | 'FEMALE';
    birth_place_date: string;
    age_years_months: string;
    guardian_name: string;
  };

  /** 4 Kurikulum Merdeka PAUD Elements */
  curriculum_elements: {
    nilai_agama_budi_pekerti: CanonicalElementReport;
    jati_diri: CanonicalElementReport;
    literasi_steam: CanonicalElementReport;
    projek_p5: CanonicalElementReport & {
      project_title: string;
      project_description: string;
    };
  };

  /** Physical Growth & Health */
  physical_growth_snapshot: {
    height_cm: number;
    weight_kg: number;
    head_circumference_cm?: number;
    physical_notes: string;
    vision_hearing_notes: string;
  };

  /** Attendance Summary */
  attendance_snapshot: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    attendance_percentage: number;
    total_effective_days: number;
  };

  /** Homeroom Teacher & Institutional Reflections */
  homeroom_teacher_reflection: string;
  headmaster_approval_notes: string;

  /** Canonical Signatures */
  signatures: {
    teacher: {
      name: string;
      title: string;
      signed_at: string;
    };
    headmaster: {
      name: string;
      title: string;
      signed_at: string;
      digital_signature_stamp: string;
    };
  };
}
