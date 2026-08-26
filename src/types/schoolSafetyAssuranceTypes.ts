/**
 * Yapendik School OS — Stage 4.4 School Safety & Operational Assurance Domain Model (Fase 4.4-A)
 * 
 * Epistemological & Governance Invariants:
 * 1. "ASSURANCE-INV-01: No Silent Safety State (No signal resolves without authorized human actor)."
 * 2. "Signal != Diagnosis (Engine emits advisory alerts, never pseudo-medical diagnoses)."
 * 3. "System Signals, Institution Decides (Action recommendations require human authorization)."
 * 4. "Four-Tier Taxonomy: Fact -> Exception Signal -> Safety Incident -> Protection Dossier."
 * 5. "C-11 Absolute Quarantine: Confidential child protection cases are isolated from general views."
 * 6. "Derived Telemetry: Foundation metrics are computed purely on-the-fly, not static mutable KPIs."
 */

import { AttendanceStatus } from '../domain/types';

// ----------------------------------------------------
// 1. FOUR-TIER TAXONOMY ENUMS & PRIMITIVES
// ----------------------------------------------------

export type SafetyTierLevel = 
  | 'TIER_1_OPERATIONAL_FACT'
  | 'TIER_2_EXCEPTION_SIGNAL'
  | 'TIER_3_SAFETY_INCIDENT'
  | 'TIER_4_CHILD_PROTECTION_DOSSIER';

export type ExceptionSignalCategory =
  | 'ATTENDANCE_ANOMALY'      // Unexplained absence, sudden pattern change
  | 'HEALTH_OBSERVATION'      // Fever threshold, lethargy, visible distress
  | 'ALLERGY_ALERT'          // Active allergen exposure risk
  | 'MEDICATION_WINDOW'      // Scheduled medicine administration due
  | 'HANDOVER_DISCREPANCY'   // Unrecognized pickup person, custody protocol alert
  | 'ENVIRONMENTAL_SAFETY';  // Equipment hazard, classroom structural defect

export type IncidentSeverityLevel =
  | 'MINOR_RESOLVABLE'       // Minor scrape/bump, resolved by homeroom teacher
  | 'MODERATE_SUPERVISED'    // Sprain, high fever, requires headmaster triage & parent pickup
  | 'CRITICAL_URGENT';       // Emergency medical care, security breach, severe child protection

export type IncidentLifecycleStatus =
  | 'DETECTED'               // Incident logged with initial factual timestamp & observer
  | 'TRIAGED'                // Headmaster/Safety officer evaluated severity & protocol
  | 'CONTAINED'              // Immediate hazard neutralised, child safe, parents alerted
  | 'RESOLVED'               // Medical/disciplinary actions completed, reflection documented
  | 'AUDITED_CLOSED';        // Term closure verification & permanent archive seal

// ----------------------------------------------------
// 2. CONFIGURABLE INSTITUTIONAL POLICIES
// ----------------------------------------------------

export interface AttendanceRiskPolicy {
  policy_id: string;
  school_id: string;
  chronic_absence_rate_threshold_pct: number; // e.g. 10% instructional days
  consecutive_unexcused_alpa_limit: number;    // e.g. 3 consecutive days
  rolling_window_days: number;                 // e.g. 30 days
  temperature_fever_threshold_celsius: number; // e.g. 37.8°C
  morning_unaccounted_cutoff_time: string;     // e.g. "08:30"
}

// ----------------------------------------------------
// 3. TIER 2: ADVISORY EXCEPTION SIGNAL (Deterministic & Explainable)
// ----------------------------------------------------

export interface SafetyExceptionSignal {
  signal_id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  student_name: string;
  category: ExceptionSignalCategory;
  tier: 'TIER_2_EXCEPTION_SIGNAL';
  
  /** Human-readable explanation of why the system emitted this signal */
  deterministic_trigger_reason: string;
  factual_data_snapshot: {
    recorded_at: string;
    temperature?: number;
    consecutive_alpa_count?: number;
    allergen_tag?: string;
    parent_note_snippet?: string;
  };
  
  /** System Non-Diagnostic Advisory Recommendation */
  advisory_recommendation: {
    recommended_action: string;
    suggested_actor_role: 'TEACHER' | 'HEADMASTER' | 'SCHOOL_NURSE';
    escalation_priority: 'LOW' | 'MEDIUM' | 'HIGH';
  };
  
  is_acknowledged: boolean;
  acknowledged_by_person_id?: string;
  acknowledged_at?: string;
}

// ----------------------------------------------------
// 4. TIER 3 & 4: SAFETY INCIDENT & PROTECTION RECORD
// ----------------------------------------------------

export interface IncidentStateTransitionRecord {
  from_status: IncidentLifecycleStatus | 'NONE';
  to_status: IncidentLifecycleStatus;
  transitioned_by_person_id: string;
  transitioned_by_name: string;
  transitioned_by_role: string;
  transition_timestamp: string;
  action_summary: string;
  evidence_attachment_ids: string[];
  rationale_notes: string;
}

export interface SafetyIncidentRecord {
  incident_id: string;
  school_id: string;
  class_id: string;
  class_name: string;
  
  tier: 'TIER_3_SAFETY_INCIDENT' | 'TIER_4_CHILD_PROTECTION_DOSSIER';
  severity: IncidentSeverityLevel;
  status: IncidentLifecycleStatus;
  
  /** Invariant C-11 Guard: Strict Staff Quarantine */
  is_staff_confidential: boolean;
  
  affected_student_ids: string[];
  affected_student_names: string[];
  
  title: string;
  factual_chronology: string;
  location_in_school: string; // e.g. "Sentra Balok", "Taman Bermain Outdoor"
  
  detected_at: string;
  detected_by_person_id: string;
  detected_by_name: string;
  
  parent_notified: boolean;
  parent_notified_at?: string;
  parent_contacted_name?: string;
  
  /** Mandatory Audit Traceability of State Machine */
  state_transitions: IncidentStateTransitionRecord[];
  
  resolution_summary?: string;
  resolved_at?: string;
  resolved_by_name?: string;
}

// ----------------------------------------------------
// 5. DERIVED OPERATIONAL ASSURANCE TELEMETRY (Read Projections)
// ----------------------------------------------------

export interface ClassroomSafetyPulse {
  class_id: string;
  class_name: string;
  active_exception_signals: SafetyExceptionSignal[];
  active_incidents_count: number;
  unresolved_handover_count: number;
  attendance_cleared_for_today: boolean;
}

export interface SchoolOperationalAssuranceSummary {
  school_id: string;
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  evaluated_at: string;
  
  operational_integrity_score_pct: number; // 0-100% computed from resolution & SOP clearance
  active_exception_signals_count: number;
  open_incidents_by_severity: Record<IncidentSeverityLevel, number>;
  chronic_absence_risk_students_count: number;
  daily_handover_reconciliation_pct: number;
  
  /** High-level Foundation view (Strictly anonymized, zero individual medical details) */
  foundation_assurance_badges: {
    zero_uncontained_emergencies: boolean;
    all_safety_protocols_followed: boolean;
    attendance_audit_integrity: 'HEALTHY' | 'NEEDS_ATTENTION' | 'CRITICAL';
  };
}

// ----------------------------------------------------
// 5B. HEADMASTER OPERATIONAL ASSURANCE VIEW MODEL (Fase 4.4-D1)
// ----------------------------------------------------

export interface NeedsAttentionItem {
  id: string;
  item_type: 'INCIDENT_TRIAGE' | 'INCIDENT_CONTAINMENT' | 'EXCEPTION_MONITOR' | 'HANDOVER_PENDING';
  title: string;
  classroom_name: string;
  severity: IncidentSeverityLevel | 'NONE';
  status: IncidentLifecycleStatus | 'PENDING';
  action_required: string;
  reported_at: string;
  reported_by: string;
}

export interface HeadmasterOperationalAssuranceViewModel {
  school_context: {
    school_id: string;
    school_name: string;
    academic_year_name: string;
    semester: 'GANJIL' | 'GENAP';
    headmaster_name: string;
    is_semester_closed: boolean;
  };
  today_assurance: {
    attendance: {
      present_count: number;
      total_students: number;
      attendance_rate_pct: number;
    };
    handover: {
      reconciled_count: number;
      total_to_reconcile: number;
      handover_rate_pct: number;
      standard_handover_count: number;
      alternate_pickup_count: number;
      pending_count: number;
    };
    active_exceptions_count: number;
    open_incidents_count: number;
    operational_integrity_pct: number;
  };
  needs_attention_queue: NeedsAttentionItem[];
  incident_pipeline: SafetyIncidentRecord[];
  audit_readiness: {
    handover_cleared: boolean;
    open_critical_incidents_count: number;
    semester_close_ready: boolean;
  };
}

// ----------------------------------------------------
// 6. APPLICATION COMMAND CONTRACTS (Fase 4.4-A)
// ----------------------------------------------------

/**
 * Command 1: Log Initial Safety Incident / Emergency Fact
 */
export interface ReportSafetyIncidentCommand {
  school_id: string;
  class_id: string;
  affected_student_ids: string[];
  tier: 'TIER_3_SAFETY_INCIDENT' | 'TIER_4_CHILD_PROTECTION_DOSSIER';
  severity: IncidentSeverityLevel;
  is_staff_confidential: boolean; // Set true for C-11 child protection
  title: string;
  factual_chronology: string;
  location_in_school: string;
  detected_by_person_id: string;
  detected_by_name: string;
  role: string;
}

/**
 * Command 2: Triage or Contain Safety Incident
 */
export interface TransitionIncidentLifecycleCommand {
  incident_id: string;
  school_id: string;
  target_status: IncidentLifecycleStatus;
  action_summary: string;
  rationale_notes: string;
  evidence_attachment_ids?: string[];
  notify_parent: boolean;
  parent_name?: string;
  actor_person_id: string;
  actor_name: string;
  role: string; // Only TEACHER, HEADMASTER, or YAPENDIK_SUPERADMIN
}

/**
 * Command 3: Teacher/Headmaster Acknowledges & Clears Daily Exception Signal
 */
export interface AcknowledgeExceptionSignalCommand {
  signal_id: string;
  school_id: string;
  resolution_action_taken: string;
  acknowledged_by_person_id: string;
  acknowledged_by_name: string;
  role: string;
}
