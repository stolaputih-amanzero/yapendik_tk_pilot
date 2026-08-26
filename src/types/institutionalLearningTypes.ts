/**
 * Yapendik School OS — Stage 4.5 Institutional Learning & Governance Domain Types (Fase 4.5-B)
 * 
 * Sealed Domain Model & Invariant Contract Baseline (Gate 2 Sealed):
 * Reference: doc/MASTER/STAGE_4_5_A_DOMAIN_MODEL_AND_INVARIANT_CONTRACTS_v1.0.md
 * 
 * Epistemological & Governance Invariants:
 * 1. "FB-01: Zero Individual Exposure (All multi-unit telemetry redacted of child PII)."
 * 2. "FB-02: Derived Telemetry Only (Calculated on-the-fly, zero mutable KPI tables)."
 * 3. "FB-03: Autonomous Unit Leadership (School owns contextual adoption & classroom authority)."
 * 4. "FB-04: No Cross-School Ranking (Equity and priority support, zero competitive ranking)."
 * 5. "FB-05: Close the Loop (Traceable chain from Insight to Outcome Reflection)."
 * 6. "FB-06: No Canonical School Mutation (Foundation issues actions, never mutates school records)."
 * 7. "FB-07: Minimum Cohort Privacy (Kmin = 5 threshold + Anti-Differencing protection)."
 * 8. "H-01 to H-06: 6 Semantic Hardenings (Payload-bound lifecycle, immutable action_id anchor, etc.)."
 */

// ----------------------------------------------------
// 1. VALUE OBJECTS & STRING UNION ENUMS
// ----------------------------------------------------

export type ExposurePrivacyStatus = 
  | 'VISIBLE' 
  | 'SUPPRESSED_SMALL_COHORT' 
  | 'SUPPRESSED_DIFFERENCING_RISK';

export type PatternLifecycleStatus = 
  | 'DETECTED' 
  | 'AVAILABLE_FOR_REVIEW' 
  | 'INSIGHT_CANDIDATE' 
  | 'ARCHIVED';

export type InsightLifecycleStatus = 
  | 'IDENTIFIED' 
  | 'REVIEWED' 
  | 'ACTION_DECIDED' 
  | 'DISMISSED';

export type SupportLifecycleStatus = 
  | 'PROPOSED' 
  | 'APPROVED' 
  | 'DEPLOYED' 
  | 'COMPLETED';

export type DirectiveLifecycleStatus = 
  | 'DRAFT' 
  | 'PUBLISHED' 
  | 'SUPERSEDED';

export type AdoptionLifecycleStatus = 
  | 'ACKNOWLEDGED' 
  | 'ADOPTED_IN_PRACTICE' 
  | 'ADAPTED_LOCALLY' 
  | 'DEFERRED';

export type TargetScope = 'ALL_TK_UNITS' | 'SPECIFIC_SCHOOL';

export type DecisionMakerRole = 'FOUNDATION_DIRECTOR' | 'FOUNDATION_TRUSTEE' | 'YAPENDIK_SUPERADMIN';

export type PatternSourceProjection = 
  | 'CURRICULUM_DOMAIN_DISTRIBUTION' 
  | 'SAFETY_INTEGRITY_INDEX' 
  | 'ATTENDANCE_STABILITY';

export type InsightCategory = 
  | 'PEDAGOGICAL_EQUITY' 
  | 'SAFETY_INTEGRITY' 
  | 'CURRICULUM_BALANCE' 
  | 'RESOURCE_NEED';

export type UrgencyLevel = 
  | 'ROUTINE' 
  | 'PRIORITY_SUPPORT' 
  | 'STRATEGIC_REVIEW';

export type SupportInitiativeType = 
  | 'TEACHER_COACHING' 
  | 'LEARNING_MATERIALS' 
  | 'SAFETY_EQUIPMENT' 
  | 'SPECIALIST_CONSULTATION';

// ----------------------------------------------------
// 2. VALUE OBJECT INTERFACES
// ----------------------------------------------------

export interface ObservationWindow {
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  start_date: string;
  end_date: string;
}

export interface InsightProvenance {
  source_projection: PatternSourceProjection;
  target_school_id?: string;
  academic_period_name: string;
  semester: 'GANJIL' | 'GENAP';
  aggregation_rule: string;
  threshold_rule_version: string;
  computation_timestamp: string;
}

export interface SupportPayload {
  initiative_type: SupportInitiativeType;
  resource_allocation_details: string;
  deployed_facilitator_name?: string;
  support_lifecycle_status: SupportLifecycleStatus;
}

export interface DirectivePayload {
  directive_code: string; // e.g. "DIR-2026-STEAM-01"
  advisory_guidelines: string;
  compliance_recommendations: string;
  directive_lifecycle_status: DirectiveLifecycleStatus;
}

export interface MeasurementValue {
  metric_value: number;
  unit_of_measure: string;
  sample_cohort_size: number;
}

export interface DeltaChange {
  absolute_delta: number;
  percentage_change_pct: number;
}

export interface ValidationResult {
  valid: boolean;
  code?: string;
  reason?: string;
}

// ----------------------------------------------------
// 3. CANONICAL ENTITY MODELS (6 ENTITIES)
// ----------------------------------------------------

/**
 * Entity 1: DerivedAnalyticalPattern
 * Machine-detected analytical observation or distributed anomaly across schools.
 */
export interface DerivedAnalyticalPattern {
  pattern_id: string; // e.g. "pat_2026_tk_menteng_steam_01"
  source_projection: PatternSourceProjection;
  target_school_id?: string; // Empty if systemic across all units
  observation_window: ObservationWindow;
  cohort_size: number;
  exposure_status: ExposurePrivacyStatus; // Hardening 03
  aggregation_rule: string;
  threshold_rule_version: string;
  computed_metric_value?: number; // number | undefined (Undefined if exposure_status !== 'VISIBLE')
  pattern_status: PatternLifecycleStatus;
  detected_at: string;
}

/**
 * Entity 2: InstitutionalInsight
 * Human-confirmed institutional finding originated from analytical pattern(s).
 */
export interface InstitutionalInsight {
  insight_id: string; // e.g. "ins_2026_steam_gap_01"
  originating_pattern_id: string;
  provenance: InsightProvenance;
  category: InsightCategory;
  title: string;
  empirical_observation: string;
  urgency_level: UrgencyLevel;
  status: InsightLifecycleStatus;
  decision_record?: InsightDecisionRecord;
  created_at: string;
}

/**
 * Entity 3: InsightDecisionRecord
 * Audited governance decision record made by Foundation Trustees/Directors.
 */
export interface InsightDecisionRecord {
  decision_id: string; // e.g. "dec_2026_091"
  insight_id: string;
  decision_type: 'ACCEPTED_FOR_ACTION' | 'DISMISSED' | 'DEFERRED_MONITORING';
  decision_rationale: string;
  action_plan_type?: 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE' | 'NONE';
  decided_by_person_id: string;
  decided_by_name: string;
  decided_by_role: DecisionMakerRole;
  decided_at: string;
}

/**
 * Entity 4: InstitutionalActionRecord (CANONICAL ROOT IDENTITY: action_id)
 * Anchors foundation governance actions. Identity is immutable forever (H-06).
 */
export interface InstitutionalActionRecord {
  readonly action_id: string; // CANONICAL ROOT IDENTITY (IMMUTABLE FOREVER - Hardening 06)
  readonly originating_insight_id: string;
  readonly originating_decision_id: string;
  action_type: 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE';
  target_scope: TargetScope;
  target_school_id?: string; // Required if SPECIFIC_SCHOOL, must be absent/empty if ALL_TK_UNITS (Hardening 05)
  title: string;
  policy_intent: string;
  issued_by_person_id: string;
  issued_by_name: string;
  issued_at: string;

  // Specific Payloads with Independent State Machines (Hardening 01)
  support_payload?: SupportPayload;
  directive_payload?: DirectivePayload;
}

/**
 * Entity 5: SchoolAdoptionResponse
 * Official record of local contextual adoption and adaptation by School Headmaster.
 */
export interface SchoolAdoptionResponse {
  response_id: string; // e.g. "adp_2026_act01_menteng"
  action_id: string; // Canonically bound to action_id
  action_type: 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE';
  school_id: string;
  headmaster_person_id: string;
  headmaster_name: string;
  adoption_status: AdoptionLifecycleStatus;
  local_context_adaptation_notes: string;
  action_timeline: string;
  acknowledged_at: string;
}

/**
 * Entity 6: ObservedOutcomeEffect
 * Mathematical empirical delta and qualitative reflection post-adoption. Strict non-causal semantics.
 */
export interface ObservedOutcomeEffect {
  outcome_id: string; // e.g. "out_2026_act01_eval"
  action_id: string; // Canonically bound to action_id
  school_id: string;
  metric_name: string;
  observation_window: {
    baseline_period_name: string;
    evaluation_period_name: string;
  };
  measurements: {
    baseline_measurement: MeasurementValue;
    evaluation_measurement: MeasurementValue;
    computed_delta: DeltaChange;
  };
  statistical_nature: 'OBSERVED_EMPIRICAL_ASSOCIATION'; // Strict Non-Causal Semantics
  human_reflective_interpretation: string; // Meaningful qualitative reflection (Mandatory)
  recorded_by_person_id: string;
  recorded_by_name: string;
  recorded_at: string;
}
