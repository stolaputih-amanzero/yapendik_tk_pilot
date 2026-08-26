/**
 * Yapendik School OS — Stage 4.5: Institutional Learning & Governance Service (Fase 4.5-C)
 * 
 * Production Application Service for Multi-Unit Telemetry, State Machine Orchestration,
 * Anti-Differencing Privacy Gate, and Closed-Loop Verification.
 * 
 * References:
 * - doc/MASTER/STAGE_4_5_A_DOMAIN_MODEL_AND_INVARIANT_CONTRACTS_v1.0.md
 * - doc/MASTER/STAGE_4_5_C_SERVICE_LAYER_AND_PROJECTION_ARCHITECTURE_v1.0.md
 */

import { db } from '../db/database';
import { getSupabaseClient } from '../db/supabaseClient';
import {
  DerivedAnalyticalPattern,
  InstitutionalInsight,
  InsightDecisionRecord,
  InstitutionalActionRecord,
  SchoolAdoptionResponse,
  ObservedOutcomeEffect,
  SupportPayload,
  DirectivePayload,
  ExposurePrivacyStatus,
  SupportLifecycleStatus,
  DirectiveLifecycleStatus,
  AdoptionLifecycleStatus
} from '../types/institutionalLearningTypes';

import {
  evaluatePrivacyExposure,
  validateZeroIndividualExposure,
  validateFoundationMutationHardBlock,
  validateTargetScopeInvariant,
  validateActionAnchorImmutability,
  validatePayloadLifecycleSeparation,
  validateObservedOutcomeEffect,
  isInstitutionalClosedLoopSatisfied,
  validateSchoolAdoptionAuthority,
  validateNoCrossSchoolRanking,
  validateDerivedTelemetryOnly,
  isValidSupportTransition,
  isValidDirectiveTransition,
  isValidAdoptionTransition,
  isValidPatternTransition,
  isValidInsightTransition
} from '../domain/institutionalLearningValidators';

export interface ClosedLoopVerificationResult {
  action_id: string;
  is_closed_loop: boolean;
  milestones: {
    action_active: boolean;
    school_adopted: boolean;
    outcome_verified: boolean;
  };
  diagnostic_flags: string[];
}

export class InstitutionalLearningService {
  // In-Memory Storage Repositories (Sprint 0 / Local Engine Fallback)
  private patterns: Map<string, DerivedAnalyticalPattern> = new Map();
  private insights: Map<string, InstitutionalInsight> = new Map();
  private actions: Map<string, InstitutionalActionRecord> = new Map();
  private adoptions: Map<string, SchoolAdoptionResponse> = new Map();
  private outcomes: Map<string, ObservedOutcomeEffect> = new Map();

  constructor() {
    this.seedBaselineFixtures();
  }

  private seedBaselineFixtures(): void {
    // Initial in-memory fixtures for seamless local developer loop & UI rendering
    const sampleInsight: InstitutionalInsight = {
      insight_id: 'ins_2026_steam_support_01',
      originating_pattern_id: 'pat_ay_2026_2027_all_steam',
      provenance: {
        source_projection: 'CURRICULUM_DOMAIN_DISTRIBUTION',
        academic_period_name: '2026/2027 Ganjil',
        semester: 'GANJIL',
        aggregation_rule: 'AGG_MEDIAN_SCORE_V1',
        threshold_rule_version: 'THR_2026_V1',
        computation_timestamp: '2026-07-28T10:00:00Z'
      },
      category: 'CURRICULUM_BALANCE',
      title: 'Peluang Penguatan Eksplorasi STEAM & Kolaborasi Motorik',
      empirical_observation: 'Observasi lintas unit menunjukkan perlunya media manipulatif terstandar untuk memfasilitasi integrasi STEAM pada kelompok usia 4-5 tahun.',
      urgency_level: 'PRIORITY_SUPPORT',
      status: 'ACTION_DECIDED',
      decision_record: {
        decision_id: 'dec_2026_steam_01',
        insight_id: 'ins_2026_steam_support_01',
        decision_type: 'ACCEPTED_FOR_ACTION',
        decision_rationale: 'Disetujui pengadaan APE balok unit kayu untuk seluruh unit TK Pilot.',
        action_plan_type: 'SUPPORT_INITIATIVE',
        decided_by_person_id: 'per_superadmin_andreas',
        decided_by_name: 'Dr. Andreas Hendrawan',
        decided_by_role: 'YAPENDIK_SUPERADMIN',
        decided_at: '2026-08-01T09:00:00Z'
      },
      created_at: '2026-07-28T10:00:00Z'
    };
    this.insights.set(sampleInsight.insight_id, sampleInsight);

    const sampleAction: InstitutionalActionRecord = {
      action_id: 'act_2026_q1_curriculum_support_01',
      originating_insight_id: 'ins_2026_steam_support_01',
      originating_decision_id: 'dec_2026_steam_01',
      action_type: 'SUPPORT_INITIATIVE',
      target_scope: 'ALL_TK_UNITS',
      title: 'Fasilitasi APE Balok Unit Kayu untuk Sentra Balok & STEAM',
      policy_intent: 'Distribusi bantuan material manipulatif terstandar untuk mendorong inkuiri dan kolaborasi motorik anak.',
      issued_by_person_id: 'per_superadmin_andreas',
      issued_by_name: 'Dr. Andreas Hendrawan',
      issued_at: '2026-08-02T10:00:00Z',
      support_payload: {
        initiative_type: 'LEARNING_MATERIALS',
        resource_allocation_details: 'Set balok unit kayu hardwood 120 pcs per rombel TK A dan TK B.',
        support_lifecycle_status: 'DEPLOYED'
      }
    };
    this.actions.set(sampleAction.action_id, sampleAction);

    const sampleAdoption: SchoolAdoptionResponse = {
      response_id: 'adp_sch_tk_yapendik_01_act_01',
      action_id: 'act_2026_q1_curriculum_support_01',
      action_type: 'SUPPORT_INITIATIVE',
      school_id: 'sch_tk_yapendik_01',
      headmaster_person_id: 'per_headmaster_esther',
      headmaster_name: 'Dra. Esther Nugroho, M.Pd',
      adoption_status: 'ADOPTED_IN_PRACTICE',
      local_context_adaptation_notes: 'Diterapkan pada rotasi sentra balok hari Selasa dan Kamis kelompok TK A.',
      action_timeline: '2026-08-16 s.d. 2026-11-20',
      acknowledged_at: '2026-08-16T14:30:00Z'
    };
    this.adoptions.set(sampleAdoption.response_id, sampleAdoption);

    const sampleOutcome: ObservedOutcomeEffect = {
      outcome_id: 'out_2026_steam_01',
      action_id: 'act_2026_q1_curriculum_support_01',
      school_id: 'sch_tk_yapendik_01',
      metric_name: 'Literasi STEAM & Kemandirian',
      observation_window: {
        baseline_period_name: 'Juli 2026',
        evaluation_period_name: 'Agustus 2026'
      },
      measurements: {
        baseline_measurement: {
          metric_value: 62.0,
          unit_of_measure: '%',
          sample_cohort_size: 14
        },
        evaluation_measurement: {
          metric_value: 74.4,
          unit_of_measure: '%',
          sample_cohort_size: 14
        },
        computed_delta: {
          absolute_delta: 12.4,
          percentage_change_pct: 20.0
        }
      },
      statistical_nature: 'OBSERVED_EMPIRICAL_ASSOCIATION',
      human_reflective_interpretation: 'Pendidik mengamati interaksi verbal anak meningkat selama bermain balok kayu.',
      recorded_by_person_id: 'per_headmaster_esther',
      recorded_by_name: 'Dra. Esther Nugroho, M.Pd',
      recorded_at: '2026-08-20T11:00:00Z'
    };
    this.outcomes.set(sampleOutcome.outcome_id, sampleOutcome);
  }

  public listPatterns(): DerivedAnalyticalPattern[] {
    return Array.from(this.patterns.values());
  }

  public listInsights(): InstitutionalInsight[] {
    return Array.from(this.insights.values());
  }

  public listActions(): InstitutionalActionRecord[] {
    return Array.from(this.actions.values());
  }

  public listAdoptions(): SchoolAdoptionResponse[] {
    return Array.from(this.adoptions.values());
  }

  public listOutcomes(): ObservedOutcomeEffect[] {
    return Array.from(this.outcomes.values());
  }

  // ---------------------------------------------------------------------------
  // 1. PROJECTION ENGINE PIPELINE (FB-01, FB-02, FB-07, REFINEMENT 2)
  // ---------------------------------------------------------------------------

  /**
   * Derives curriculum domain distribution telemetry on-the-fly.
   * Enforces Anti-Differencing, Kmin=5 privacy threshold, and Zero-PII redaction barrier.
   */
  public async deriveCurriculumDomainDistribution(
    academicYearId: string,
    targetSchoolId?: string,
    subsetCohortSize?: number
  ): Promise<DerivedAnalyticalPattern[]> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('fn_derive_curriculum_domain_pattern', {
          p_academic_year_id: academicYearId,
          p_target_school_id: targetSchoolId || null
        });
        if (!error && Array.isArray(data)) {
          return data.map((row: any) => this.mapAndSanitizePattern(row, subsetCohortSize));
        }
      } catch (err) {
        console.warn('Supabase RPC fn_derive_curriculum_domain_pattern failed, using local engine fallback:', err);
      }
    }

    // Local in-memory calculation fallback
    const domains = ['STEAM', 'LITERACY', 'SOCIAL_EMOTIONAL', 'RELIGIOUS_AND_MORAL'];
    const results: DerivedAnalyticalPattern[] = [];

    for (const domain of domains) {
      // In local mode, calculate base cohort count
      const students = targetSchoolId ? db.getStudents(targetSchoolId).filter(s => s.status === 'ACTIVE') : [];
      const baseCohortSize = students.length > 0 ? students.length : 16; // Default active pilot cohort

      // Refinement 2: Anti-Differencing & Kmin=5 threshold evaluation
      const exposureStatus = evaluatePrivacyExposure(baseCohortSize, subsetCohortSize);
      const isVisible = exposureStatus === 'VISIBLE';

      const pattern: DerivedAnalyticalPattern = {
        pattern_id: `pat_${academicYearId}_${targetSchoolId || 'all'}_${domain.toLowerCase()}`,
        source_projection: 'CURRICULUM_DOMAIN_DISTRIBUTION',
        target_school_id: targetSchoolId,
        observation_window: {
          academic_year_id: academicYearId,
          semester: 'GANJIL',
          start_date: '2026-07-15',
          end_date: '2026-12-20'
        },
        cohort_size: baseCohortSize,
        exposure_status: exposureStatus,
        aggregation_rule: 'AGG_MEDIAN_SCORE_V1',
        threshold_rule_version: 'THR_2026_V1',
        computed_metric_value: isVisible ? 78.5 : undefined, // Undefined if suppressed (H-03)
        pattern_status: 'DETECTED',
        detected_at: new Date().toISOString()
      };

      // Defense-in-Depth Guard: Redaction barrier
      const piiCheck = validateZeroIndividualExposure(pattern);
      if (!piiCheck.valid) {
        throw new Error(`SECURITY_GATE_PII_LEAK: ${piiCheck.reason}`);
      }

      // Anti-ranking invariant verification
      const rankingCheck = validateNoCrossSchoolRanking(pattern);
      if (!rankingCheck.valid) {
        throw new Error(`SECURITY_GATE_RANKING_PROHIBITED: ${rankingCheck.reason}`);
      }

      results.push(pattern);
      this.patterns.set(pattern.pattern_id, pattern);
    }

    return results;
  }

  private mapAndSanitizePattern(row: any, subsetCohortSize?: number): DerivedAnalyticalPattern {
    const baseCohortSize = Number(row.cohort_size ?? row.n_count ?? 0);
    const exposureStatus = evaluatePrivacyExposure(baseCohortSize, subsetCohortSize);
    const isVisible = exposureStatus === 'VISIBLE';

    const pattern: DerivedAnalyticalPattern = {
      pattern_id: row.pattern_id || `pat_db_${Date.now()}`,
      source_projection: 'CURRICULUM_DOMAIN_DISTRIBUTION',
      target_school_id: row.school_id,
      observation_window: {
        academic_year_id: row.academic_year_id || 'ay_active',
        semester: 'GANJIL',
        start_date: '2026-07-15',
        end_date: '2026-12-20'
      },
      cohort_size: baseCohortSize,
      exposure_status: exposureStatus,
      aggregation_rule: 'AGG_MEDIAN_SCORE_V1',
      threshold_rule_version: 'THR_2026_V1',
      computed_metric_value: isVisible && row.computed_percentage !== null ? Number(row.computed_percentage) : undefined,
      pattern_status: 'DETECTED',
      detected_at: new Date().toISOString()
    };

    const piiCheck = validateZeroIndividualExposure(pattern);
    if (!piiCheck.valid) {
      throw new Error(`SECURITY_GATE_PII_LEAK: ${piiCheck.reason}`);
    }

    return pattern;
  }

  // ---------------------------------------------------------------------------
  // 2. INSTITUTIONAL INSIGHTS & DECISIONS
  // ---------------------------------------------------------------------------

  public async createInsight(insight: InstitutionalInsight): Promise<InstitutionalInsight> {
    const piiCheck = validateZeroIndividualExposure(insight);
    if (!piiCheck.valid) throw new Error(`SECURITY_GATE_PII_LEAK: ${piiCheck.reason}`);

    this.insights.set(insight.insight_id, insight);
    return insight;
  }

  public async recordInsightDecision(decision: InsightDecisionRecord): Promise<InstitutionalInsight> {
    const insight = this.insights.get(decision.insight_id);
    if (!insight) {
      throw new Error(`INSIGHT_NOT_FOUND: Insight with ID '${decision.insight_id}' does not exist.`);
    }

    const nextStatus = decision.decision_type === 'ACCEPTED_FOR_ACTION' ? 'ACTION_DECIDED' : 'DISMISSED';
    if (!isValidInsightTransition(insight.status, nextStatus)) {
      throw new Error(`ILLEGAL_INSIGHT_TRANSITION: Cannot transition insight from '${insight.status}' to '${nextStatus}'.`);
    }

    const updatedInsight: InstitutionalInsight = {
      ...insight,
      status: nextStatus,
      decision_record: decision
    };

    this.insights.set(insight.insight_id, updatedInsight);
    return updatedInsight;
  }

  public getInsight(insightId: string): InstitutionalInsight | undefined {
    return this.insights.get(insightId);
  }

  // ---------------------------------------------------------------------------
  // 3. INSTITUTIONAL ACTIONS (CANONICAL ROOT IDENTITY: action_id)
  // ---------------------------------------------------------------------------

  public async issueInstitutionalAction(action: InstitutionalActionRecord): Promise<InstitutionalActionRecord> {
    // 1. Target Scope Invariant (H-05)
    const scopeCheck = validateTargetScopeInvariant(action);
    if (!scopeCheck.valid) throw new Error(`INVALID_TARGET_SCOPE: ${scopeCheck.reason}`);

    // 2. Payload Separation Invariant (H-01)
    const payloadCheck = validatePayloadLifecycleSeparation(action);
    if (!payloadCheck.valid) throw new Error(`INVALID_PAYLOAD_CONFIGURATION: ${payloadCheck.reason}`);

    // 3. Zero PII Check (FB-01)
    const piiCheck = validateZeroIndividualExposure(action);
    if (!piiCheck.valid) throw new Error(`SECURITY_GATE_PII_LEAK: ${piiCheck.reason}`);

    this.actions.set(action.action_id, action);
    return action;
  }

  public getAction(actionId: string): InstitutionalActionRecord | undefined {
    return this.actions.get(actionId);
  }

  /**
   * Transitions Support Initiative Lifecycle with Payload Immutability Guarantee (Refinement 3).
   */
  public async transitionSupportLifecycle(
    actionId: string,
    nextStatus: SupportLifecycleStatus,
    updatedPayloadDetails?: Partial<SupportPayload>
  ): Promise<InstitutionalActionRecord> {
    const action = this.actions.get(actionId);
    if (!action) throw new Error(`ACTION_NOT_FOUND: Action '${actionId}' does not exist.`);
    if (action.action_type !== 'SUPPORT_INITIATIVE' || !action.support_payload) {
      throw new Error(`INVALID_ACTION_TYPE: Action '${actionId}' is not a SUPPORT_INITIATIVE.`);
    }

    const currentStatus = action.support_payload.support_lifecycle_status;

    // Validate State Machine Progression
    if (!isValidSupportTransition(currentStatus, nextStatus)) {
      throw new Error(`ILLEGAL_STATE_TRANSITION: Support initiative cannot transition from '${currentStatus}' to '${nextStatus}'.`);
    }

    // Refinement 3: Post-Deployment Content Immutability
    if (currentStatus === 'DEPLOYED' || currentStatus === 'COMPLETED') {
      if (updatedPayloadDetails) {
        const { support_lifecycle_status, ...bodyUpdates } = updatedPayloadDetails;
        if (Object.keys(bodyUpdates).length > 0) {
          throw new Error(`PAYLOAD_CONTENT_IMMUTABLE: Support payload content is permanently immutable once status is DEPLOYED or COMPLETED (Refinement 3).`);
        }
      }
    }

    const newPayload: SupportPayload = {
      ...action.support_payload,
      ...(updatedPayloadDetails || {}),
      support_lifecycle_status: nextStatus
    };

    const updatedAction: InstitutionalActionRecord = {
      ...action,
      support_payload: newPayload
    };

    // Assert Anchor Immutability
    const anchorCheck = validateActionAnchorImmutability(action, updatedAction);
    if (!anchorCheck.valid) throw new Error(`IMMUTABILITY_BREACH: ${anchorCheck.reason}`);

    this.actions.set(actionId, updatedAction);
    return updatedAction;
  }

  /**
   * Transitions Governance Directive Lifecycle with Payload Immutability Guarantee (Refinement 3).
   */
  public async transitionDirectiveLifecycle(
    actionId: string,
    nextStatus: DirectiveLifecycleStatus,
    updatedPayloadDetails?: Partial<DirectivePayload>
  ): Promise<InstitutionalActionRecord> {
    const action = this.actions.get(actionId);
    if (!action) throw new Error(`ACTION_NOT_FOUND: Action '${actionId}' does not exist.`);
    if (action.action_type !== 'GOVERNANCE_DIRECTIVE' || !action.directive_payload) {
      throw new Error(`INVALID_ACTION_TYPE: Action '${actionId}' is not a GOVERNANCE_DIRECTIVE.`);
    }

    const currentStatus = action.directive_payload.directive_lifecycle_status;

    // Validate State Machine Progression
    if (!isValidDirectiveTransition(currentStatus, nextStatus)) {
      throw new Error(`ILLEGAL_STATE_TRANSITION: Directive cannot transition from '${currentStatus}' to '${nextStatus}'.`);
    }

    // Refinement 3: Post-Deployment Content Immutability
    if (currentStatus === 'PUBLISHED' || currentStatus === 'SUPERSEDED') {
      if (updatedPayloadDetails) {
        const { directive_lifecycle_status, ...bodyUpdates } = updatedPayloadDetails;
        if (Object.keys(bodyUpdates).length > 0) {
          throw new Error(`PAYLOAD_CONTENT_IMMUTABLE: Directive payload content is permanently immutable once status is PUBLISHED or SUPERSEDED (Refinement 3).`);
        }
      }
    }

    const newPayload: DirectivePayload = {
      ...action.directive_payload,
      ...(updatedPayloadDetails || {}),
      directive_lifecycle_status: nextStatus
    };

    const updatedAction: InstitutionalActionRecord = {
      ...action,
      directive_payload: newPayload
    };

    // Assert Anchor Immutability
    const anchorCheck = validateActionAnchorImmutability(action, updatedAction);
    if (!anchorCheck.valid) throw new Error(`IMMUTABILITY_BREACH: ${anchorCheck.reason}`);

    this.actions.set(actionId, updatedAction);
    return updatedAction;
  }

  // ---------------------------------------------------------------------------
  // 4. SCHOOL ADOPTION (FB-03: SCHOOL AUTONOMOUS ADOPTION AUTHORITY)
  // ---------------------------------------------------------------------------

  public async recordSchoolAdoption(
    adoption: SchoolAdoptionResponse,
    actorRole: string
  ): Promise<SchoolAdoptionResponse> {
    // Check FB-03 Adoption Authority
    const authCheck = validateSchoolAdoptionAuthority(actorRole);
    if (!authCheck.valid) {
      throw new Error(`FB03_AUTHORITY_VIOLATION: ${authCheck.reason}`);
    }

    const action = this.actions.get(adoption.action_id);
    if (!action) throw new Error(`ACTION_NOT_FOUND: Action '${adoption.action_id}' does not exist.`);

    // Scope check: If action is SPECIFIC_SCHOOL, verify target school matches
    if (action.target_scope === 'SPECIFIC_SCHOOL' && action.target_school_id !== adoption.school_id) {
      throw new Error(`SCHOOL_MISMATCH: Action is targeted to school '${action.target_school_id}', not '${adoption.school_id}'.`);
    }

    const existing = this.adoptions.get(adoption.response_id);
    if (existing) {
      if (!isValidAdoptionTransition(existing.adoption_status, adoption.adoption_status)) {
        throw new Error(`ILLEGAL_ADOPTION_TRANSITION: Cannot transition from '${existing.adoption_status}' to '${adoption.adoption_status}'.`);
      }
    }

    this.adoptions.set(adoption.response_id, adoption);
    return adoption;
  }

  public getAdoption(responseId: string): SchoolAdoptionResponse | undefined {
    return this.adoptions.get(responseId);
  }

  // ---------------------------------------------------------------------------
  // 5. OBSERVED OUTCOME EFFECTS (H-02, NON-CAUSAL SEMANTICS)
  // ---------------------------------------------------------------------------

  public async recordObservedOutcome(outcome: ObservedOutcomeEffect): Promise<ObservedOutcomeEffect> {
    const outcomeCheck = validateObservedOutcomeEffect(outcome, outcome.action_id);
    if (!outcomeCheck.valid) {
      throw new Error(`INVALID_OUTCOME_EFFECT: ${outcomeCheck.reason}`);
    }

    this.outcomes.set(outcome.outcome_id, outcome);
    return outcome;
  }

  public getOutcome(outcomeId: string): ObservedOutcomeEffect | undefined {
    return this.outcomes.get(outcomeId);
  }

  // ---------------------------------------------------------------------------
  // 6. CLOSED-LOOP TELEMETRY API (H-02, FB-05)
  // ---------------------------------------------------------------------------

  public async verifyClosedLoopCondition(actionId: string): Promise<ClosedLoopVerificationResult> {
    const supabase = getSupabaseClient();
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('rpc_verify_closed_loop_condition', {
          p_action_id: actionId
        });
        if (!error && data) {
          return data as ClosedLoopVerificationResult;
        }
      } catch (err) {
        console.warn('Supabase RPC rpc_verify_closed_loop_condition failed, using local engine fallback:', err);
      }
    }

    // Local deterministic verification
    const action = this.actions.get(actionId);
    if (!action) {
      return {
        action_id: actionId,
        is_closed_loop: false,
        milestones: { action_active: false, school_adopted: false, outcome_verified: false },
        diagnostic_flags: ['ACTION_NOT_FOUND']
      };
    }

    const flags: string[] = [];

    // Milestone 1: Action Active
    const isActionActive =
      (action.action_type === 'SUPPORT_INITIATIVE' && action.support_payload?.support_lifecycle_status === 'DEPLOYED') ||
      (action.action_type === 'GOVERNANCE_DIRECTIVE' && action.directive_payload?.directive_lifecycle_status === 'PUBLISHED');

    if (!isActionActive) flags.push('ACTION_NOT_YET_ACTIVE');

    // Milestone 2: School Adopted
    const adoption = Array.from(this.adoptions.values()).find(a => a.action_id === actionId);
    const isAdopted = Boolean(adoption) && (adoption?.adoption_status === 'ADOPTED_IN_PRACTICE' || adoption?.adoption_status === 'ADAPTED_LOCALLY');

    if (!isAdopted) flags.push('ADOPTION_INCOMPLETE_OR_DEFERRED');

    // Milestone 3: Valid Outcome Effect
    const outcome = Array.from(this.outcomes.values()).find(o => o.action_id === actionId);
    const isOutcomeValid = Boolean(outcome) && validateObservedOutcomeEffect(outcome!).valid;

    if (!isOutcomeValid) flags.push('OUTCOME_RECORD_INVALID_OR_MISSING');

    const isClosedLoop = isInstitutionalClosedLoopSatisfied(action, adoption, outcome);

    return {
      action_id: actionId,
      is_closed_loop: isClosedLoop,
      milestones: {
        action_active: isActionActive,
        school_adopted: isAdopted,
        outcome_verified: isOutcomeValid
      },
      diagnostic_flags: flags
    };
  }

  // ---------------------------------------------------------------------------
  // 7. FB-06 CANONICAL MUTATION HARD BLOCK INTERCEPTOR
  // ---------------------------------------------------------------------------

  public async executeSchoolMutation<T>(
    actorRole: string,
    targetResource: string,
    actionType: string,
    mutationFn: () => Promise<T> | T
  ): Promise<T> {
    const blockCheck = validateFoundationMutationHardBlock(actorRole, targetResource, actionType);
    if (!blockCheck.valid) {
      const error: any = new Error(blockCheck.reason);
      error.code = 'MUTATION_REJECTED_FB06';
      throw error;
    }

    return await mutationFn();
  }
}

export const institutionalLearningService = new InstitutionalLearningService();
