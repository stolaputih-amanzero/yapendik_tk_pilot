/**
 * Yapendik School OS — Stage 4.5 Institutional Learning Validators & Invariant Guards (Fase 4.5-B)
 * 
 * Sealed Domain Model & Invariant Contract Baseline (Gate 2 Sealed):
 * Reference: doc/MASTER/STAGE_4_5_A_DOMAIN_MODEL_AND_INVARIANT_CONTRACTS_v1.0.md
 * 
 * Epistemological & Governance Invariants:
 * - H-01: Action Anchor vs Payload Lifecycle Separation
 * - H-02: Valid Outcome Effect for Loop Closure
 * - H-03: 3-Tier Exposure Privacy Enum
 * - H-04: Kmin = 5 Minimum Cohort Privacy Threshold
 * - H-05: Target Scope Invariant (SPECIFIC_SCHOOL ↔ target_school_id)
 * - H-06: Immutable action_id Anchor
 * - FB-01: Zero Individual Exposure in Foundation Telemetry
 * - FB-02: Derived Telemetry Only (Zero mutable KPI tables)
 * - FB-03: Autonomous Unit Leadership (School Adoption Authority)
 * - FB-04: No Cross-School Ranking / Leaderboard
 * - FB-05: Institutional Learning Must Close the Loop
 * - FB-06: No Canonical School Mutation from Foundation
 * - FB-07: Minimum Cohort Suppression (Kmin = 5) + Anti-Differencing Protection
 */

import {
  ExposurePrivacyStatus,
  PatternLifecycleStatus,
  InsightLifecycleStatus,
  SupportLifecycleStatus,
  DirectiveLifecycleStatus,
  AdoptionLifecycleStatus,
  InstitutionalActionRecord,
  SchoolAdoptionResponse,
  ObservedOutcomeEffect,
  ValidationResult
} from '../types/institutionalLearningTypes';

// ----------------------------------------------------
// 1. PRIVACY & ANTI-DIFFERENCING ENGINE (H-03, H-04, FB-07)
// ----------------------------------------------------

/**
 * Pure Mathematical Anti-Differencing & Privacy Threshold Evaluator.
 * 
 * Rules:
 * 1. Base cohort size < 5 -> 'SUPPRESSED_SMALL_COHORT' (FB-07 Minimum Cohort Kmin = 5).
 * 2. If subsetCohortSize is provided, calculate diff = baseCohortSize - subsetCohortSize.
 *    If diff > 0 && diff < 5 -> 'SUPPRESSED_DIFFERENCING_RISK'.
 * 3. If subsetCohortSize > baseCohortSize or subsetCohortSize < 0 -> 'SUPPRESSED_DIFFERENCING_RISK'.
 * 4. Otherwise -> 'VISIBLE'.
 * 
 * @param baseCohortSize - Size of the primary/base cohort population.
 * @param subsetCohortSize - Optional size of an overlapping subset cohort population.
 * @returns ExposurePrivacyStatus ('VISIBLE' | 'SUPPRESSED_SMALL_COHORT' | 'SUPPRESSED_DIFFERENCING_RISK')
 */
export function evaluatePrivacyExposure(
  baseCohortSize: number,
  subsetCohortSize?: number
): ExposurePrivacyStatus {
  // 1. Minimum Cohort Privacy Threshold (Kmin = 5)
  if (baseCohortSize < 5 || isNaN(baseCohortSize) || !Number.isInteger(baseCohortSize)) {
    return 'SUPPRESSED_SMALL_COHORT';
  }

  // 2. Anti-Differencing Protection Check (FB-07 & Section 8 Protocol)
  if (subsetCohortSize !== undefined) {
    if (isNaN(subsetCohortSize) || !Number.isInteger(subsetCohortSize) || subsetCohortSize < 0 || subsetCohortSize > baseCohortSize) {
      return 'SUPPRESSED_DIFFERENCING_RISK';
    }

    const diff = baseCohortSize - subsetCohortSize;
    if (diff > 0 && diff < 5) {
      return 'SUPPRESSED_DIFFERENCING_RISK';
    }
  }

  return 'VISIBLE';
}

// ----------------------------------------------------
// 2. ZERO INDIVIDUAL EXPOSURE GUARD (FB-01)
// ----------------------------------------------------

const FORBIDDEN_PII_KEYS = new Set([
  'student_id',
  'student_name',
  'student_person_id',
  'studentid',
  'studentname',
  'nik',
  'nis',
  'nisn',
  'child_name',
  'childname',
  'medical_diagnosis',
  'parent_name',
  'parent_phone',
  'child_health_notes',
  'nik_anak',
  'guardian_name'
]);

/**
 * Validates that an aggregated telemetry DTO contains zero individual child PII.
 * 
 * @description Application Layer Guard. Canonical enforcement MUST also exist at the PostgreSQL RLS / RPC Invoker layer (Stage 4.5-C).
 * @param payload - Any DTO object destined for Foundation Context.
 * @returns ValidationResult
 */
export function validateZeroIndividualExposure(payload: Record<string, any>): ValidationResult {
  if (!payload || typeof payload !== 'object') {
    return { valid: true };
  }

  function scan(obj: any, path: string = ''): ValidationResult {
    if (!obj || typeof obj !== 'object') return { valid: true };

    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        const res = scan(obj[i], `${path}[${i}]`);
        if (!res.valid) return res;
      }
      return { valid: true };
    }

    for (const key of Object.keys(obj)) {
      const lowerKey = key.toLowerCase();
      const val = obj[key];

      if (FORBIDDEN_PII_KEYS.has(lowerKey)) {
        if (val !== undefined && val !== null && val !== '') {
          return {
            valid: false,
            code: 'LEAK_INDIVIDUAL_PII',
            reason: `Individual child PII field '${key}' detected at '${path ? path + '.' + key : key}'. Foundation DTOs must strictly contain zero individual PII (FB-01).`
          };
        }
      }

      if (typeof val === 'object' && val !== null) {
        const res = scan(val, path ? `${path}.${key}` : key);
        if (!res.valid) return res;
      }
    }

    return { valid: true };
  }

  return scan(payload);
}

// ----------------------------------------------------
// 3. FOUNDATION CANONICAL MUTATION HARD BLOCK (FB-06)
// ----------------------------------------------------

const FOUNDATION_ROLES = new Set([
  'FOUNDATION_DIRECTOR',
  'FOUNDATION_TRUSTEE',
  'YAPENDIK_SUPERADMIN',
  'SUPERADMIN'
]);

const CANONICAL_SCHOOL_RESOURCES = new Set([
  'STUDENT_OBSERVATION',
  'ATTENDANCE_REGISTER',
  'TEACHER_DAILY_WORK',
  'STUDENT_DEVELOPMENT',
  'CLASS_ROSTER',
  'STUDENT_PROFILE',
  'OBSERVATION_RECORD',
  'DAILY_ATTENDANCE'
]);

const MUTATION_ACTIONS = new Set([
  'CREATE',
  'EDIT',
  'DELETE',
  'APPROVE',
  'PUBLISH',
  'UPDATE',
  'INSERT'
]);

/**
 * Hard blocks Foundation roles from directly mutating canonical classroom/school entities.
 * 
 * @description Application Layer Guard. Canonical enforcement MUST also exist at the PostgreSQL RLS / RPC Invoker layer (Stage 4.5-C).
 * @param actorRole - The role of the actor attempting the action.
 * @param targetResource - The domain resource being accessed.
 * @param actionType - The type of operation (VIEW, CREATE, EDIT, DELETE, etc.).
 * @returns ValidationResult
 */
export function validateFoundationMutationHardBlock(
  actorRole: string,
  targetResource: string,
  actionType: string
): ValidationResult {
  const isFoundation = FOUNDATION_ROLES.has(actorRole.toUpperCase());
  const isCanonicalSchoolResource = CANONICAL_SCHOOL_RESOURCES.has(targetResource.toUpperCase());
  const isMutation = MUTATION_ACTIONS.has(actionType.toUpperCase());

  if (isFoundation && isCanonicalSchoolResource && isMutation) {
    return {
      valid: false,
      code: 'FOUNDATION_MUTATION_BLOCKED',
      reason: `Foundation role '${actorRole}' is strictly forbidden from mutating canonical school resource '${targetResource}' via '${actionType}'. Foundation authority is limited to issuing InstitutionalActionRecords (FB-06).`
    };
  }

  return { valid: true };
}

// ----------------------------------------------------
// 4. TARGET SCOPE INVARIANT GUARD (H-05)
// ----------------------------------------------------

/**
 * Enforces Target Scope Invariant (Hardening 05):
 * - SPECIFIC_SCHOOL requires a non-empty target_school_id.
 * - ALL_TK_UNITS must have target_school_id undefined/empty.
 */
export function validateTargetScopeInvariant(
  action: Pick<InstitutionalActionRecord, 'target_scope' | 'target_school_id'>
): ValidationResult {
  if (action.target_scope === 'SPECIFIC_SCHOOL') {
    if (!action.target_school_id || !action.target_school_id.trim()) {
      return {
        valid: false,
        code: 'INVALID_TARGET_SCOPE',
        reason: "Target scope 'SPECIFIC_SCHOOL' requires a non-empty 'target_school_id' (H-05)."
      };
    }
  } else if (action.target_scope === 'ALL_TK_UNITS') {
    if (action.target_school_id !== undefined && action.target_school_id !== null && action.target_school_id.trim() !== '') {
      return {
        valid: false,
        code: 'INVALID_TARGET_SCOPE',
        reason: "Target scope 'ALL_TK_UNITS' must not specify 'target_school_id' (H-05)."
      };
    }
  } else {
    return {
      valid: false,
      code: 'INVALID_TARGET_SCOPE',
      reason: `Unrecognized target_scope value '${(action as any).target_scope}'.`
    };
  }

  return { valid: true };
}

// ----------------------------------------------------
// 5. ACTION ANCHOR IMMUTABILITY GUARD (H-06)
// ----------------------------------------------------

/**
 * Enforces Action Anchor Immutability (Hardening 06):
 * action_id, originating_insight_id, and originating_decision_id can never be mutated once issued.
 */
export function validateActionAnchorImmutability(
  original: InstitutionalActionRecord,
  candidateUpdate: Partial<InstitutionalActionRecord>
): ValidationResult {
  if (candidateUpdate.action_id !== undefined && candidateUpdate.action_id !== original.action_id) {
    return {
      valid: false,
      code: 'CANNOT_MUTATE_ACTION_ID',
      reason: `Canonical root 'action_id' ('${original.action_id}') is immutable forever and cannot be modified (H-06).`
    };
  }

  if (candidateUpdate.originating_insight_id !== undefined && candidateUpdate.originating_insight_id !== original.originating_insight_id) {
    return {
      valid: false,
      code: 'CANNOT_MUTATE_ORIGINATING_INSIGHT',
      reason: `originating_insight_id ('${original.originating_insight_id}') is an immutable lineage anchor (H-06).`
    };
  }

  if (candidateUpdate.originating_decision_id !== undefined && candidateUpdate.originating_decision_id !== original.originating_decision_id) {
    return {
      valid: false,
      code: 'CANNOT_MUTATE_ORIGINATING_DECISION',
      reason: `originating_decision_id ('${original.originating_decision_id}') is an immutable lineage anchor (H-06).`
    };
  }

  return { valid: true };
}

// ----------------------------------------------------
// 6. PAYLOAD LIFECYCLE SEPARATION GUARD (H-01)
// ----------------------------------------------------

/**
 * Enforces Action Anchor vs Payload Lifecycle Separation (Hardening 01):
 * - Root InstitutionalActionRecord must NOT have a general lifecycle status property.
 * - SUPPORT_INITIATIVE requires support_payload and forbids directive_payload.
 * - GOVERNANCE_DIRECTIVE requires directive_payload and forbids support_payload.
 */
export function validatePayloadLifecycleSeparation(
  action: InstitutionalActionRecord
): ValidationResult {
  // Reject fake root status injection
  if ((action as any).status !== undefined || (action as any).lifecycle_status !== undefined) {
    return {
      valid: false,
      code: 'FORBIDDEN_ROOT_LIFECYCLE_STATUS',
      reason: 'Root InstitutionalActionRecord must not contain a root lifecycle status. State machine lives in support_payload or directive_payload (H-01).'
    };
  }

  if (action.action_type === 'SUPPORT_INITIATIVE') {
    if (!action.support_payload) {
      return {
        valid: false,
        code: 'MISSING_SUPPORT_PAYLOAD',
        reason: "Action type 'SUPPORT_INITIATIVE' requires a valid 'support_payload' (H-01)."
      };
    }
    if (action.directive_payload !== undefined && action.directive_payload !== null) {
      return {
        valid: false,
        code: 'CROSS_WIRED_PAYLOAD',
        reason: "Action type 'SUPPORT_INITIATIVE' must not contain 'directive_payload' (H-01)."
      };
    }
    const validStatuses: SupportLifecycleStatus[] = ['PROPOSED', 'APPROVED', 'DEPLOYED', 'COMPLETED'];
    if (!validStatuses.includes(action.support_payload.support_lifecycle_status)) {
      return {
        valid: false,
        code: 'INVALID_SUPPORT_STATUS',
        reason: `Invalid support_lifecycle_status '${action.support_payload.support_lifecycle_status}'.`
      };
    }
  } else if (action.action_type === 'GOVERNANCE_DIRECTIVE') {
    if (!action.directive_payload) {
      return {
        valid: false,
        code: 'MISSING_DIRECTIVE_PAYLOAD',
        reason: "Action type 'GOVERNANCE_DIRECTIVE' requires a valid 'directive_payload' (H-01)."
      };
    }
    if (action.support_payload !== undefined && action.support_payload !== null) {
      return {
        valid: false,
        code: 'CROSS_WIRED_PAYLOAD',
        reason: "Action type 'GOVERNANCE_DIRECTIVE' must not contain 'support_payload' (H-01)."
      };
    }
    const validStatuses: DirectiveLifecycleStatus[] = ['DRAFT', 'PUBLISHED', 'SUPERSEDED'];
    if (!validStatuses.includes(action.directive_payload.directive_lifecycle_status)) {
      return {
        valid: false,
        code: 'INVALID_DIRECTIVE_STATUS',
        reason: `Invalid directive_lifecycle_status '${action.directive_payload.directive_lifecycle_status}'.`
      };
    }
  } else {
    return {
      valid: false,
      code: 'INVALID_ACTION_TYPE',
      reason: `Unrecognized action_type '${(action as any).action_type}'.`
    };
  }

  return { valid: true };
}

// ----------------------------------------------------
// 7. OBSERVED OUTCOME EFFECT VALIDITY (H-02, NON-CAUSAL SEMANTICS)
// ----------------------------------------------------

/**
 * Validates an ObservedOutcomeEffect record for non-causal association and mathematical completeness.
 */
export function validateObservedOutcomeEffect(
  outcome: ObservedOutcomeEffect,
  expectedActionId?: string
): ValidationResult {
  if (!outcome.outcome_id || !outcome.outcome_id.trim()) {
    return {
      valid: false,
      code: 'MISSING_OUTCOME_ID',
      reason: "ObservedOutcomeEffect requires a valid 'outcome_id' (H-02)."
    };
  }

  if (expectedActionId && outcome.action_id !== expectedActionId) {
    return {
      valid: false,
      code: 'ACTION_ID_MISMATCH',
      reason: `Outcome action_id '${outcome.action_id}' does not match expected action anchor '${expectedActionId}'.`
    };
  }

  if (!outcome.school_id || !outcome.school_id.trim()) {
    return {
      valid: false,
      code: 'MISSING_SCHOOL_ID',
      reason: "ObservedOutcomeEffect requires a valid 'school_id' (H-02)."
    };
  }

  // Strict Non-Causal Semantics Check
  if (outcome.statistical_nature !== 'OBSERVED_EMPIRICAL_ASSOCIATION') {
    return {
      valid: false,
      code: 'INVALID_STATISTICAL_NATURE',
      reason: `Non-Causal Semantics Violation: statistical_nature must be strictly 'OBSERVED_EMPIRICAL_ASSOCIATION', got '${outcome.statistical_nature}'.`
    };
  }

  // Mandatory Meaningful Qualitative Human Reflection
  if (!outcome.human_reflective_interpretation || !outcome.human_reflective_interpretation.trim()) {
    return {
      valid: false,
      code: 'EMPTY_HUMAN_REFLECTION',
      reason: "ObservedOutcomeEffect requires a meaningful, non-empty 'human_reflective_interpretation' (H-02)."
    };
  }

  // Measurements validation
  if (!outcome.measurements?.baseline_measurement || !outcome.measurements?.evaluation_measurement) {
    return {
      valid: false,
      code: 'INCOMPLETE_MEASUREMENTS',
      reason: 'ObservedOutcomeEffect requires both baseline_measurement and evaluation_measurement (H-02).'
    };
  }

  if (outcome.measurements.baseline_measurement.sample_cohort_size < 5) {
    return {
      valid: false,
      code: 'BASELINE_COHORT_TOO_SMALL',
      reason: `Baseline cohort size (${outcome.measurements.baseline_measurement.sample_cohort_size}) is below Kmin = 5 threshold.`
    };
  }

  if (outcome.measurements.evaluation_measurement.sample_cohort_size < 5) {
    return {
      valid: false,
      code: 'EVALUATION_COHORT_TOO_SMALL',
      reason: `Evaluation cohort size (${outcome.measurements.evaluation_measurement.sample_cohort_size}) is below Kmin = 5 threshold.`
    };
  }

  if (outcome.measurements.computed_delta === undefined || typeof outcome.measurements.computed_delta.absolute_delta !== 'number') {
    return {
      valid: false,
      code: 'INVALID_DELTA',
      reason: 'ObservedOutcomeEffect requires a valid computed_delta (H-02).'
    };
  }

  if (!outcome.recorded_by_person_id || !outcome.recorded_by_person_id.trim() || !outcome.recorded_at) {
    return {
      valid: false,
      code: 'MISSING_AUDIT_TRAIL',
      reason: 'ObservedOutcomeEffect requires recorded_by_person_id and recorded_at (H-02).'
    };
  }

  return { valid: true };
}

// ----------------------------------------------------
// 8. DERIVED CLOSED-LOOP CALCULATION (H-02, FB-05)
// ----------------------------------------------------

/**
 * Deterministically evaluates whether the full institutional closed loop condition is satisfied.
 * 
 * Chain: Insight ──► Decision ──► Action (Active) ──► Adoption (Local) ──► Outcome (Valid) ──► CLOSED_LOOP
 * Reference: Section 6 of STAGE_4_5_A_DOMAIN_MODEL_AND_INVARIANT_CONTRACTS_v1.0.md
 */
export function isInstitutionalClosedLoopSatisfied(
  action: InstitutionalActionRecord,
  adoption?: SchoolAdoptionResponse,
  outcome?: ObservedOutcomeEffect
): boolean {
  // 1. Invariant Scope Guard (Hardening 05)
  if (action.target_scope === 'SPECIFIC_SCHOOL' && !action.target_school_id?.trim()) return false;
  if (action.target_scope === 'ALL_TK_UNITS' && action.target_school_id && action.target_school_id.trim() !== '') return false;

  // 2. Action must be deployed or published (Hardening 01)
  const isActionActive = 
    (action.action_type === 'SUPPORT_INITIATIVE' && action.support_payload?.support_lifecycle_status === 'DEPLOYED') ||
    (action.action_type === 'GOVERNANCE_DIRECTIVE' && action.directive_payload?.directive_lifecycle_status === 'PUBLISHED');

  if (!isActionActive) return false;

  // 3. School must have formally adopted the action (School Autonomy / FB-03)
  const isAdopted = 
    Boolean(adoption) && 
    adoption?.action_id === action.action_id &&
    (adoption?.adoption_status === 'ADOPTED_IN_PRACTICE' || adoption?.adoption_status === 'ADAPTED_LOCALLY');

  if (!isAdopted) return false;

  // 4. Complete, valid Outcome Record with Kmin >= 5 and non-empty reflection (Hardening 02)
  const isOutcomeValid = 
    Boolean(outcome) && 
    outcome?.action_id === action.action_id &&
    Boolean(outcome?.human_reflective_interpretation?.trim()) &&
    outcome?.statistical_nature === 'OBSERVED_EMPIRICAL_ASSOCIATION' &&
    (outcome?.measurements?.baseline_measurement?.sample_cohort_size ?? 0) >= 5 &&
    (outcome?.measurements?.evaluation_measurement?.sample_cohort_size ?? 0) >= 5 &&
    outcome?.measurements?.computed_delta !== undefined;

  return Boolean(isOutcomeValid);
}

// ----------------------------------------------------
// 9. SCHOOL ADOPTION AUTHORITY GUARD (FB-03)
// ----------------------------------------------------

const AUTHORIZED_SCHOOL_ROLES = new Set(['HEADMASTER', 'TEACHER']);

/**
 * Validates that only school leadership/educators can record adoption of institutional actions.
 */
export function validateSchoolAdoptionAuthority(actorRole: string): ValidationResult {
  const upperRole = actorRole.toUpperCase();

  if (FOUNDATION_ROLES.has(upperRole)) {
    return {
      valid: false,
      code: 'FOUNDATION_ADOPTION_FORBIDDEN',
      reason: `Foundation role '${actorRole}' is forbidden from recording school adoption. School leadership retains exclusive adoption authority (FB-03).`
    };
  }

  if (AUTHORIZED_SCHOOL_ROLES.has(upperRole)) {
    return { valid: true };
  }

  return {
    valid: false,
    code: 'INSUFFICIENT_ADOPTION_ROLE',
    reason: `Role '${actorRole}' is not authorized to record local school adoption.`
  };
}

// ----------------------------------------------------
// 10. NO CROSS-SCHOOL RANKING GUARD (FB-04)
// ----------------------------------------------------

const PROHIBITED_RANKING_KEYS = new Set([
  'rank',
  'ranking',
  'leaderboard_position',
  'relative_grade',
  'school_rank',
  'unit_rank',
  'standing_position'
]);

/**
 * Validates that projection schemas contain no competitive ranking or leaderboard attributes.
 */
export function validateNoCrossSchoolRanking(projection: Record<string, any>): ValidationResult {
  if (!projection || typeof projection !== 'object') {
    return { valid: true };
  }

  for (const key of Object.keys(projection)) {
    if (PROHIBITED_RANKING_KEYS.has(key.toLowerCase())) {
      return {
        valid: false,
        code: 'PROHIBITED_RANKING_ATTRIBUTE',
        reason: `Attribute '${key}' represents competitive cross-school ranking, which is strictly prohibited. Data must serve equity and support needs only (FB-04).`
      };
    }
  }

  return { valid: true };
}

// ----------------------------------------------------
// 11. DERIVED TELEMETRY ONLY GUARD (FB-02)
// ----------------------------------------------------

const PROHIBITED_MUTABLE_KPI_KEYS = new Set([
  'is_kpi_target_met_override',
  'manual_kpi_score',
  'static_score_override',
  'kpi_score_table_id'
]);

/**
 * Validates that records represent on-the-fly derived telemetry rather than static mutable KPI rows.
 */
export function validateDerivedTelemetryOnly(record: Record<string, any>): ValidationResult {
  if (!record || typeof record !== 'object') return { valid: true };

  for (const key of Object.keys(record)) {
    if (PROHIBITED_MUTABLE_KPI_KEYS.has(key.toLowerCase())) {
      return {
        valid: false,
        code: 'STATIC_MUTABLE_KPI_FORBIDDEN',
        reason: `Mutable KPI field '${key}' detected. Foundation telemetry must be strictly derived on-the-fly without mutable KPI status tables (FB-02).`
      };
    }
  }

  return { valid: true };
}

// ----------------------------------------------------
// 12. STATE TRANSITION GUARDS (ASYMMETRICAL LIFECYCLES)
// ----------------------------------------------------

/**
 * Validates legal sequential transitions for Support Initiative payloads.
 * PROPOSED ──► APPROVED ──► DEPLOYED ──► COMPLETED
 */
export function isValidSupportTransition(
  from: SupportLifecycleStatus,
  to: SupportLifecycleStatus
): boolean {
  if (from === to) return true; // Idempotent
  const transitions: Record<SupportLifecycleStatus, SupportLifecycleStatus[]> = {
    PROPOSED: ['APPROVED'],
    APPROVED: ['DEPLOYED'],
    DEPLOYED: ['COMPLETED'],
    COMPLETED: []
  };
  return transitions[from]?.includes(to) ?? false;
}

/**
 * Validates legal sequential transitions for Governance Directive payloads.
 * DRAFT ──► PUBLISHED ──► SUPERSEDED
 */
export function isValidDirectiveTransition(
  from: DirectiveLifecycleStatus,
  to: DirectiveLifecycleStatus
): boolean {
  if (from === to) return true; // Idempotent
  const transitions: Record<DirectiveLifecycleStatus, DirectiveLifecycleStatus[]> = {
    DRAFT: ['PUBLISHED'],
    PUBLISHED: ['SUPERSEDED'],
    SUPERSEDED: []
  };
  return transitions[from]?.includes(to) ?? false;
}

/**
 * Validates legal transitions for School Adoption responses.
 * ACKNOWLEDGED ──► ADOPTED_IN_PRACTICE | ADAPTED_LOCALLY | DEFERRED
 */
export function isValidAdoptionTransition(
  from: AdoptionLifecycleStatus,
  to: AdoptionLifecycleStatus
): boolean {
  if (from === to) return true; // Idempotent
  const transitions: Record<AdoptionLifecycleStatus, AdoptionLifecycleStatus[]> = {
    ACKNOWLEDGED: ['ADOPTED_IN_PRACTICE', 'ADAPTED_LOCALLY', 'DEFERRED'],
    ADOPTED_IN_PRACTICE: ['ADAPTED_LOCALLY'],
    ADAPTED_LOCALLY: ['ADOPTED_IN_PRACTICE'],
    DEFERRED: ['ACKNOWLEDGED', 'ADOPTED_IN_PRACTICE', 'ADAPTED_LOCALLY']
  };
  return transitions[from]?.includes(to) ?? false;
}

/**
 * Validates legal transitions for Derived Analytical Patterns.
 * DETECTED ──► AVAILABLE_FOR_REVIEW ──► INSIGHT_CANDIDATE ──► ARCHIVED
 */
export function isValidPatternTransition(
  from: PatternLifecycleStatus,
  to: PatternLifecycleStatus
): boolean {
  if (from === to) return true;
  if (to === 'ARCHIVED') return true; // Can archive from any state
  const transitions: Record<PatternLifecycleStatus, PatternLifecycleStatus[]> = {
    DETECTED: ['AVAILABLE_FOR_REVIEW', 'ARCHIVED'],
    AVAILABLE_FOR_REVIEW: ['INSIGHT_CANDIDATE', 'ARCHIVED'],
    INSIGHT_CANDIDATE: ['AVAILABLE_FOR_REVIEW', 'ARCHIVED'],
    ARCHIVED: []
  };
  return transitions[from]?.includes(to) ?? false;
}

/**
 * Validates legal transitions for Institutional Insights.
 * IDENTIFIED ──► REVIEWED ──► ACTION_DECIDED | DISMISSED
 */
export function isValidInsightTransition(
  from: InsightLifecycleStatus,
  to: InsightLifecycleStatus
): boolean {
  if (from === to) return true;
  const transitions: Record<InsightLifecycleStatus, InsightLifecycleStatus[]> = {
    IDENTIFIED: ['REVIEWED', 'DISMISSED'],
    REVIEWED: ['ACTION_DECIDED', 'DISMISSED'],
    ACTION_DECIDED: [],
    DISMISSED: ['REVIEWED'] // Can reopen for review if new evidence emerges
  };
  return transitions[from]?.includes(to) ?? false;
}
