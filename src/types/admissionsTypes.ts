/**
 * Yapendik School OS — Stage 6 Admissions & Enrollment Continuum Domain Types
 * 
 * Sealed Technical Specification Baseline (Gate 1):
 * Reference: doc/MASTER/STAGE_6_GATE_1_ADMISSIONS_TECHNICAL_ARCHITECTURE_v1.0.md
 * 
 * Epistemological & Admissions Invariants:
 * 1. "AP-01: Prospective Child Privacy & Retention (90-Day Purge for cancelled applicants)."
 * 2. "AP-02: Intake Observation Quarantine (Separated from active LPPA/portfolio)."
 * 3. "AP-03: Waitlist Confidentiality & Anti-Comparison."
 * 4. "AP-04: Guardian Self-Service Boundary (Contextual Auth APPLICANT_GUARDIAN)."
 * 5. "AP-05: Non-Discriminatory Developmental Intake (Diagnostic profiling, not elimination)."
 * 6. "AP-06: Atomic Promotion Transactionality (All-or-nothing canonical promotion)."
 * 7. "AP-07: Anti-Panopticon Multi-Unit Redaction (Zero-PII Foundation Projection)."
 * 8. "ADR-05: Pre-Canonical Staging & Atomic Ceremony RPC Pattern."
 */

export type AdmissionStatus =
  | 'DRAFT_APPLICATION'
  | 'SUBMITTED'
  | 'DOCUMENT_VERIFIED'
  | 'INTAKE_SCHEDULED'
  | 'INTAKE_ASSESSED'
  | 'OFFERED_ADMISSION'
  | 'WAITLISTED'
  | 'NOT_ADMITTED'
  | 'APPLICATION_WITHDRAWN'
  | 'CANCELLED_ENROLLED_ELSEWHERE'
  | 'TUITION_SETTLED'
  | 'ENROLLED_PROMOTED';

export type ClassLevel = 'TK_A' | 'TK_B' | 'KB' | 'TPA';

export type DocumentType =
  | 'KARTU_KELUARGA'
  | 'AKTA_KELAHIRAN'
  | 'BUKU_IMUNISASI'
  | 'SURAT_KETERANGAN_DOKTER'
  | 'FOTO_CALON_SISWA';

export type DocumentVerificationStatus =
  | 'PENDING_VERIFICATION'
  | 'VERIFIED_VALID'
  | 'REJECTED_INVALID';

export type GuardianRelationshipType = 'AYAH' | 'IBU' | 'WALI_HUKUM';

export type Gender = 'L' | 'P';

export interface AdmissionsCapacityQuota {
  quota_id: string;
  school_id: string;
  academic_year_id: string;
  class_level: ClassLevel;
  target_capacity: number;
  current_enrolled: number;
  waitlist_capacity: number;
  is_open_for_registration: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProspectiveChildApplicant {
  applicant_id: string; // e.g. "app_2026_sch01_7f8a9b1c"
  target_school_id: string;
  academic_year_id: string;
  target_class_level: ClassLevel;
  
  // Child Pre-Canonical Identifiers (AP-01)
  child_nik: string;
  child_full_name: string;
  child_nickname?: string;
  child_gender: Gender;
  child_birth_place: string;
  child_birth_date: string;
  child_religion: string;
  child_address: string;
  
  // Guardian Pre-Canonical Identifiers (AP-04)
  creator_uid: string;
  guardian_nik: string;
  guardian_full_name: string;
  guardian_relationship_type: GuardianRelationshipType;
  guardian_gender: Gender;
  guardian_phone_number: string;
  guardian_email?: string;
  
  status: AdmissionStatus;
  
  // Promoted Audit Tracking & Baseline Snapshot (ADR-05 & Critical Fix #1)
  promoted_at?: string;
  promoted_by_person_id?: string;
  promoted_student_id?: string;
  promoted_baseline_snapshot?: Record<string, any>;
  
  created_at: string;
  updated_at: string;
}

export interface AdmissionsDocument {
  document_id: string;
  applicant_id: string;
  document_type: DocumentType;
  storage_file_path: string;
  file_size_bytes: number;
  mime_type: string;
  verification_status: DocumentVerificationStatus;
  verified_by_person_id?: string;
  verified_at?: string;
  rejection_reason?: string;
  uploaded_at: string;
}

export interface DevelopmentalDomainsReadiness {
  gross_motor_skills?: string;
  fine_motor_skills?: string;
  language_communication?: string;
  social_emotional_adaptation?: string;
  toilet_training_autonomy?: string;
  focus_attention_span?: string;
  numeric_visual_recognition?: string;
}

export interface AdmissionsIntakeObservation {
  observation_id: string;
  applicant_id: string;
  observer_person_id: string;
  observation_date: string;
  developmental_domains: DevelopmentalDomainsReadiness;
  observer_qualitative_notes: string;
  special_learning_needs_flag: boolean;
  special_needs_description?: string;
  recommended_class_level: ClassLevel;
  assessed_at: string;
}

export interface AdmissionsTelemetryProjection {
  target_school_id: string;
  academic_year_id: string;
  target_class_level: ClassLevel;
  admission_status: AdmissionStatus;
  total_applicants: number;
  computed_at: string;
}

export interface EnrollmentCeremonyResult {
  success: boolean;
  applicant_id: string;
  promoted_student_id: string;
  child_person_id: string;
  guardian_person_id: string;
  placed_class_id: string;
  has_baseline_snapshot: boolean;
  enrolled_at: string;
}

export interface PurgeAdmissionsResult {
  success: boolean;
  purged_applicants_count: number;
  purged_documents_count: number;
  cutoff_applied_days: number;
  executed_at: string;
}
