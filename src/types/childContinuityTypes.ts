/**
 * Yapendik School OS — Stage 4.3 Child Continuity Domain Model & Governance Contracts (Fase 4.3-A)
 * 
 * Epistemological & Architecture Foundation:
 * 1. "ChildContinuityProfile is a DERIVED PROJECTION over Canonical Published LPPA Records, not a duplicate source of truth."
 * 2. "System Proposes, Educator Decides (Strict separation of System Suggestion vs Teacher Decision)."
 * 3. "LearningStimulationPlan MUST be anchored to a Source Historical Baseline (Traceable Why)."
 * 4. "Guardian Projection is a Read-Only Scoped Partnership, never mutating canonical assessments."
 * 5. "C-11 Zero Leakage: Confidential internal notes are strictly quarantined."
 */

import { MilestoneRating, DevelopmentDomain } from '../domain/types';
import { LppaElementKey, CanonicalPublishedLppaRecord } from './lppaReportingTypes';

// ----------------------------------------------------
// 1. LIFECYCLE & STATE MACHINE ENUMS
// ----------------------------------------------------

export type PlanLifecycleStatus = 
  | 'PROPOSED'        // Engine generated suggestion from historical baseline
  | 'TEACHER_REVIEW'   // Teacher actively examining/refining the proposal
  | 'ACTIVE'           // Teacher confirmed and actively executing in classroom
  | 'COMPLETED'        // Goals evaluated and successfully concluded
  | 'ARCHIVED';        // Historical plan preserved for retrospective inquiry

export type StimulationTargetType = 
  | 'INDIVIDUAL'      // Tailored to a single specific child
  | 'SMALL_GROUP'     // Collaborative group with shared developmental growth focus
  | 'CLASSROOM_WIDE'; // Whole classroom environmental/center adjustment

export type PlayCenterType =
  | 'SENTRA_BALOK'           // Block & Spatial Play Center
  | 'SENTRA_BAHAN_ALAM'      // Natural Materials & Sensory Exploration
  | 'SENTRA_MAIN_PERAN_MAKRO' // Macro Roleplay Center
  | 'SENTRA_MAIN_PERAN_MIKRO' // Micro Roleplay Center
  | 'SENTRA_PERSIAPAN_LITERASI' // Literacy & Early Numeracy Center
  | 'SENTRA_SENI_KREATIF'    // Art & Creative Expression Center
  | 'SENTRA_IBADAH_KARAKTER'; // Spiritual & Character Formation Center

// ----------------------------------------------------
// 2. READ-MODEL PROJECTION: CHILD CONTINUITY PROFILE
// ----------------------------------------------------

/**
 * Historical LPPA Summary Reference (Immutable Backlink)
 */
export interface HistoricalLppaReference {
  published_record_id: string;
  academic_year_id: string;
  academic_year_name: string;
  semester: 'GANJIL' | 'GENAP';
  published_at: string;
  official_report_number: string;
  homeroom_teacher_name: string;
  element_ratings: Record<LppaElementKey, MilestoneRating>;
  growth_recommendations_summary: Record<LppaElementKey, string>;
  strengths_snapshot: string[];
}

/**
 * Developmental Trajectory Arc for a Single Kurikulum Merdeka Element
 */
export interface DevelopmentalTrajectoryArc {
  element_key: LppaElementKey;
  element_title: string;
  trajectory_points: {
    academic_year_name: string;
    semester: 'GANJIL' | 'GENAP';
    rating: MilestoneRating;
    published_record_id: string;
  }[];
  current_rating: MilestoneRating;
  observed_strengths: string[];
  system_identified_growth_focus: string[];
  historical_growth_recommendations: string[];
}

/**
 * Derived Read-Model: Child Longitudinal Continuity Profile
 * (Computed dynamically from Canonical Published LPPA Records + Empirical Portfolios)
 */
export interface ChildContinuityProfile {
  student_id: string;
  student_name: string;
  nis: string;
  current_class_id: string;
  current_class_name: string;
  age_years_months: string;
  
  /** Historical Chronological LPPA Baseline References */
  historical_lppa_references: HistoricalLppaReference[];
  
  /** Multi-Semester Developmental Arcs (4 Elements) */
  developmental_trajectories: Record<LppaElementKey, DevelopmentalTrajectoryArc>;
  
  /** Active / In-Flight Stimulation Plans for this Child */
  active_stimulation_plans: LearningStimulationPlan[];
  
  /** Guardian Partnership Summary */
  guardian_bridge_summary: {
    guardian_name: string;
    last_home_reflection_date?: string;
    active_home_activities_count: number;
  };
}

// ----------------------------------------------------
// 3. SEPARATION: SYSTEM PROPOSALS VS TEACHER DECISIONS
// ----------------------------------------------------

/**
 * Non-Authoritative Engine Suggestion
 */
export interface StimulationRecommendation {
  recommendation_id: string;
  element_key: LppaElementKey;
  reasoning_basis: {
    source_published_record_id: string;
    historical_rating: MilestoneRating;
    extracted_growth_focus: string;
    recent_observation_indicators: string[];
  };
  suggested_goal: string;
  suggested_play_centers: PlayCenterType[];
  suggested_provocations: string[]; // Contoh: "Menyediakan balok lengkung dan jembatan untuk mengeksplorasi keseimbangan bertingkat."
  confidence_rationale: string;
}

/**
 * Authoritative Educator Pedagogical Decision
 */
export interface TeacherPedagogicalDecision {
  decided_by_person_id: string;
  decided_by_name: string;
  decision_timestamp: string;
  is_accepted_as_suggested: boolean;
  adapted_goal: string;
  chosen_play_centers: PlayCenterType[];
  custom_teacher_provocations: string[];
  pedagogical_notes: string;
  differentiation_strategy: string; // Strategi perancah (scaffolding) khusus anak
}

// ----------------------------------------------------
// 4. CORE ENTITY: LEARNING STIMULATION PLAN
// ----------------------------------------------------

/**
 * Governed Learning Stimulation Plan Entity
 */
export interface LearningStimulationPlan {
  plan_id: string;
  school_id: string;
  class_id: string;
  class_name: string;
  academic_year_id: string;
  academic_year_name: string;
  semester: 'GANJIL' | 'GENAP';
  
  /** Mandatory Invariant: Source Historical Baseline Anchor */
  source_historical_baseline_record_id: string;
  
  target_type: StimulationTargetType;
  target_student_ids: string[];
  target_student_names: string[];
  target_element_key: LppaElementKey;
  
  /** Lifecycle State */
  status: PlanLifecycleStatus;
  
  /** System Proposal (Non-Authoritative) */
  system_proposal: StimulationRecommendation;
  
  /** Teacher Decision (Authoritative) */
  teacher_decision?: TeacherPedagogicalDecision;
  
  /** Home-School Shared Extension (Optional Guardian Projection) */
  home_school_extension?: {
    is_shared_with_home: boolean;
    home_activity_prompt: string;
    parent_acknowledgment_status: 'PENDING' | 'ACKNOWLEDGED';
    parent_reflection_notes?: string;
    parent_acknowledged_at?: string;
  };
  
  created_at: string;
  updated_at: string;
  activated_at?: string;
  completed_at?: string;
}

// ----------------------------------------------------
// 5. CLASSROOM HEATMAP & AGGREGATE READ MODEL
// ----------------------------------------------------

export interface ClassroomDevelopmentalHeatmap {
  school_id: string;
  class_id: string;
  class_name: string;
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  total_students_count: number;
  
  element_distribution: Record<LppaElementKey, {
    element_title: string;
    mb_count: number;
    bsh_count: number;
    bsb_count: number;
    common_growth_themes: string[];
    priority_stimulation_centers: PlayCenterType[];
  }>;
  
  active_plans_count: number;
  unaddressed_growth_focus_count: number;
}

// ----------------------------------------------------
// 6. APPLICATION COMMAND CONTRACTS (FASE 4.3-A)
// ----------------------------------------------------

/**
 * Command 1: Engine Synthesizes Proposed Continuity Stimulation Plans
 */
export interface GenerateProposedStimulationPlansCommand {
  school_id: string;
  class_id: string;
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  student_ids?: string[]; // Jika kosong, proses seluruh siswa aktif di kelas
  requested_by_person_id: string;
  requested_by_name: string;
  role: string;
}

/**
 * Command 2: Teacher Authorizes / Confirms Pedagogical Decision for a Plan
 */
export interface ConfirmLearningStimulationPlanCommand {
  plan_id: string;
  school_id: string;
  teacher_decision: TeacherPedagogicalDecision;
  share_with_home: boolean;
  home_activity_prompt?: string;
  confirmed_by_person_id: string;
  confirmed_by_name: string;
  role: string; // WAJIB 'TEACHER' atau 'HEADMASTER'
}

/**
 * Command 3: Teacher Updates Plan Execution Progress / Completes Goal
 */
export interface CompleteLearningStimulationPlanCommand {
  plan_id: string;
  school_id: string;
  completion_reflection: string;
  linked_observation_evidence_ids: string[]; // Bukti observasi baru yang memvalidasi ketercapaian
  completed_by_person_id: string;
  completed_by_name: string;
  role: string;
}

/**
 * Command 4: Parent Confirms Home Stimulation Reflection (Home-School Bridge)
 */
export interface RecordHomeStimulationFeedbackCommand {
  plan_id: string;
  school_id: string;
  student_id: string;
  guardian_person_id: string;
  guardian_name: string;
  home_reflection_notes: string;
  role: string; // WAJIB 'GUARDIAN' / 'PARENT_BUDI'
}
