/**
 * YAPENDIK SCHOOL OS — STAGE 4.5-B TYPE SYSTEM & CONTRACT TEST SUITE
 * 
 * Formal Certification Suite for Gate 2.1 (Domain & Invariant Contracts)
 * Reference: doc/MASTER/STAGE_4_5_A_DOMAIN_MODEL_AND_INVARIANT_CONTRACTS_v1.0.md
 * 
 * Test Suites (Suites 09–16):
 * - Suite 09: Canonical Action Root Identity (H-01, H-06)
 * - Suite 10: State Machine Integrity (Payload-bound Asymmetrical Lifecycle)
 * - Suite 11: Derived Closed-Loop Calculation (H-02, FB-05)
 * - Suite 12: FB-01 Zero Individual Exposure (PII Redaction)
 * - Suite 13: FB-06 Canonical Mutation Hard Block
 * - Suite 14: FB-07 Minimum Cohort Suppression (Kmin = 5)
 * - Suite 15: Anti-Differencing Engine (Exact Boundary Verification)
 * - Suite 16: Non-Causal Association Semantics
 * 
 * Four-Quadrant Verification for every invariant:
 * [VALID] | [INVALID] | [BOUNDARY] | [ADVERSARIAL]
 */

import { strict as assert } from 'node:assert/strict';
import {
  DerivedAnalyticalPattern,
  InstitutionalInsight,
  InsightDecisionRecord,
  InstitutionalActionRecord,
  SchoolAdoptionResponse,
  ObservedOutcomeEffect,
  SupportPayload,
  DirectivePayload,
  ObservationWindow,
  InsightProvenance,
  MeasurementValue,
  DeltaChange,
  ExposurePrivacyStatus
} from '../src/types/institutionalLearningTypes';

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
} from '../src/domain/institutionalLearningValidators';

export async function runStage45TypeAndContractTests() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 4.5-B TYPE SYSTEM & CONTRACT TEST SUITE (SUITES 09–16)');
  console.log('════════════════════════════════════════════════════════════════\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function runCheck(testName: string, fn: () => void) {
    totalTests++;
    try {
      fn();
      passedTests++;
      console.log(`  🟢 PASS: ${testName}`);
    } catch (err: any) {
      failedTests++;
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err?.message || err}`);
    }
  }

  // Common Fixtures
  const validWindow: ObservationWindow = {
    academic_year_id: 'ay_2026_2027_ganjil',
    semester: 'GANJIL',
    start_date: '2026-07-15',
    end_date: '2026-12-20'
  };

  const validProvenance: InsightProvenance = {
    source_projection: 'CURRICULUM_DOMAIN_DISTRIBUTION',
    target_school_id: 'sch_tk_yapendik_01',
    academic_period_name: '2026/2027 Ganjil',
    semester: 'GANJIL',
    aggregation_rule: 'AGG_MEDIAN_SCORE_V1',
    threshold_rule_version: 'THR_2026_V1',
    computation_timestamp: '2026-08-26T10:00:00Z'
  };

  const validSupportPayload: SupportPayload = {
    initiative_type: 'TEACHER_COACHING',
    resource_allocation_details: 'Alokasi 2 Pelatih Ahli Sentra STEAM selama 3 minggu',
    deployed_facilitator_name: 'Dra. Maria Magdalena',
    support_lifecycle_status: 'DEPLOYED'
  };

  const validDirectivePayload: DirectivePayload = {
    directive_code: 'DIR-2026-STEAM-01',
    advisory_guidelines: 'Pedoman alokasi waktu sentra STEAM minimal 120 menit/minggu',
    compliance_recommendations: 'Evaluasi berkala setiap bulan',
    directive_lifecycle_status: 'PUBLISHED'
  };

  const validActionSupport: InstitutionalActionRecord = {
    action_id: 'act_2026_steam_supp_01',
    originating_insight_id: 'ins_2026_steam_gap_01',
    originating_decision_id: 'dec_2026_091',
    action_type: 'SUPPORT_INITIATIVE',
    target_scope: 'SPECIFIC_SCHOOL',
    target_school_id: 'sch_tk_yapendik_01',
    title: 'Inisiatif Pendampingan Sentra STEAM TK Menteng',
    policy_intent: 'Meningkatkan kesiapan eksplorasi saintifik anak',
    issued_by_person_id: 'per_superadmin_andreas',
    issued_by_name: 'Dr. Andreas Hendrawan',
    issued_at: '2026-08-26T10:30:00Z',
    support_payload: validSupportPayload
  };

  const validActionDirective: InstitutionalActionRecord = {
    action_id: 'act_2026_steam_dir_01',
    originating_insight_id: 'ins_2026_steam_gap_01',
    originating_decision_id: 'dec_2026_091',
    action_type: 'GOVERNANCE_DIRECTIVE',
    target_scope: 'ALL_TK_UNITS',
    title: 'Direktif Standar Integrasi STEAM Seluruh Unit TK',
    policy_intent: 'Standarisasi alokasi waktu bermain STEAM',
    issued_by_person_id: 'per_superadmin_andreas',
    issued_by_name: 'Dr. Andreas Hendrawan',
    issued_at: '2026-08-26T10:30:00Z',
    directive_payload: validDirectivePayload
  };

  const validAdoption: SchoolAdoptionResponse = {
    response_id: 'adp_2026_act01_menteng',
    action_id: 'act_2026_steam_supp_01',
    action_type: 'SUPPORT_INITIATIVE',
    school_id: 'sch_tk_yapendik_01',
    headmaster_person_id: 'per_headmaster_esther',
    headmaster_name: 'Dra. Esther Nugroho, M.Pd',
    adoption_status: 'ADOPTED_IN_PRACTICE',
    local_context_adaptation_notes: 'Diterapkan pada sentra balok dan bahan alam setiap hari Rabu & Kamis',
    action_timeline: 'Semester Ganjil 2026/2027',
    acknowledged_at: '2026-08-26T11:00:00Z'
  };

  const validOutcome: ObservedOutcomeEffect = {
    outcome_id: 'out_2026_act01_eval',
    action_id: 'act_2026_steam_supp_01',
    school_id: 'sch_tk_yapendik_01',
    metric_name: 'STEAM_EXPLORATION_VELOCITY',
    observation_window: {
      baseline_period_name: '2025/2026 Genap',
      evaluation_period_name: '2026/2027 Ganjil'
    },
    measurements: {
      baseline_measurement: { metric_value: 62.5, unit_of_measure: 'PERCENT', sample_cohort_size: 16 },
      evaluation_measurement: { metric_value: 78.0, unit_of_measure: 'PERCENT', sample_cohort_size: 16 },
      computed_delta: { absolute_delta: 15.5, percentage_change_pct: 24.8 }
    },
    statistical_nature: 'OBSERVED_EMPIRICAL_ASSOCIATION',
    human_reflective_interpretation: 'Peningkatan keterlibatan anak dalam eksplorasi bahan alam teramati pasca pendampingan fasilitator.',
    recorded_by_person_id: 'per_teacher_siti',
    recorded_by_name: 'Siti Rahmawati, S.Pd',
    recorded_at: '2026-08-26T14:00:00Z'
  };

  // -------------------------------------------------------------------------
  // SUITE 09: Canonical Action Root Identity (H-01, H-06)
  // -------------------------------------------------------------------------
  console.log('--- SUITE 09: Canonical Action Root Identity (H-01, H-06) ---');

  runCheck('Suite 09 [VALID]: Immutable canonical action root bindings', () => {
    const resH05 = validateTargetScopeInvariant(validActionSupport);
    assert.equal(resH05.valid, true);

    const resH01 = validatePayloadLifecycleSeparation(validActionSupport);
    assert.equal(resH01.valid, true);

    const resImmutability = validateActionAnchorImmutability(validActionSupport, { title: 'Updated Title Only' });
    assert.equal(resImmutability.valid, true);
  });

  runCheck('Suite 09 [INVALID]: Reassigning action_id must be rejected (H-06)', () => {
    const res = validateActionAnchorImmutability(validActionSupport, { action_id: 'act_hijacked_new_id' });
    assert.equal(res.valid, false);
    assert.equal(res.code, 'CANNOT_MUTATE_ACTION_ID');
  });

  runCheck('Suite 09 [BOUNDARY]: Modifying originating lineage IDs must be rejected (H-06)', () => {
    const resInsight = validateActionAnchorImmutability(validActionSupport, { originating_insight_id: 'ins_other_gap' });
    assert.equal(resInsight.valid, false);
    assert.equal(resInsight.code, 'CANNOT_MUTATE_ORIGINATING_INSIGHT');

    const resDecision = validateActionAnchorImmutability(validActionSupport, { originating_decision_id: 'dec_other_choice' });
    assert.equal(resDecision.valid, false);
    assert.equal(resDecision.code, 'CANNOT_MUTATE_ORIGINATING_DECISION');
  });

  runCheck('Suite 09 [ADVERSARIAL]: Cross-wiring payloads (SUPPORT containing directive_payload) must fail (H-01)', () => {
    const maliciousAction: InstitutionalActionRecord = {
      ...validActionSupport,
      directive_payload: validDirectivePayload
    };
    const res = validatePayloadLifecycleSeparation(maliciousAction);
    assert.equal(res.valid, false);
    assert.equal(res.code, 'CROSS_WIRED_PAYLOAD');
  });

  // -------------------------------------------------------------------------
  // SUITE 10: State Machine Integrity (Payload-Bound Asymmetrical Lifecycle)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 10: State Machine Integrity (Payload-Bound Asymmetrical Lifecycle) ---');

  runCheck('Suite 10 [VALID]: Sequential support lifecycle progression (PROPOSED -> APPROVED -> DEPLOYED -> COMPLETED)', () => {
    assert.equal(isValidSupportTransition('PROPOSED', 'APPROVED'), true);
    assert.equal(isValidSupportTransition('APPROVED', 'DEPLOYED'), true);
    assert.equal(isValidSupportTransition('DEPLOYED', 'COMPLETED'), true);
    assert.equal(isValidSupportTransition('DEPLOYED', 'DEPLOYED'), true); // Idempotent
  });

  runCheck('Suite 10 [VALID]: Sequential directive lifecycle progression (DRAFT -> PUBLISHED -> SUPERSEDED)', () => {
    assert.equal(isValidDirectiveTransition('DRAFT', 'PUBLISHED'), true);
    assert.equal(isValidDirectiveTransition('PUBLISHED', 'SUPERSEDED'), true);
  });

  runCheck('Suite 10 [INVALID]: Illegal state skips rejected (PROPOSED -> COMPLETED directly)', () => {
    assert.equal(isValidSupportTransition('PROPOSED', 'COMPLETED'), false);
    assert.equal(isValidDirectiveTransition('DRAFT', 'SUPERSEDED'), false);
  });

  runCheck('Suite 10 [BOUNDARY]: Terminal states cannot transition back to active states', () => {
    assert.equal(isValidSupportTransition('COMPLETED', 'PROPOSED'), false);
    assert.equal(isValidSupportTransition('COMPLETED', 'DEPLOYED'), false);
    assert.equal(isValidDirectiveTransition('SUPERSEDED', 'DRAFT'), false);
    assert.equal(isValidDirectiveTransition('SUPERSEDED', 'PUBLISHED'), false);
  });

  runCheck('Suite 10 [ADVERSARIAL]: Fake root status injection on action record must be rejected (H-01)', () => {
    const injectedAction = {
      ...validActionSupport,
      lifecycle_status: 'DEPLOYED' // Injected fake root status
    };
    const res = validatePayloadLifecycleSeparation(injectedAction as any);
    assert.equal(res.valid, false);
    assert.equal(res.code, 'FORBIDDEN_ROOT_LIFECYCLE_STATUS');
  });

  // -------------------------------------------------------------------------
  // SUITE 11: Derived Closed-Loop Calculation (H-02, FB-05)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 11: Derived Closed-Loop Calculation (H-02, FB-05) ---');

  runCheck('Suite 11 [VALID]: Complete verified chain returns CLOSED_LOOP = true', () => {
    const isClosed = isInstitutionalClosedLoopSatisfied(validActionSupport, validAdoption, validOutcome);
    assert.equal(isClosed, true);
  });

  runCheck('Suite 11 [INVALID]: Un-deployed action (PROPOSED) cannot satisfy closed loop', () => {
    const inactiveAction: InstitutionalActionRecord = {
      ...validActionSupport,
      support_payload: {
        ...validSupportPayload,
        support_lifecycle_status: 'PROPOSED'
      }
    };
    const isClosed = isInstitutionalClosedLoopSatisfied(inactiveAction, validAdoption, validOutcome);
    assert.equal(isClosed, false);
  });

  runCheck('Suite 11 [BOUNDARY]: Boundary cohort threshold (N=5 on baseline & evaluation) satisfies closed loop', () => {
    const boundaryOutcome: ObservedOutcomeEffect = {
      ...validOutcome,
      measurements: {
        baseline_measurement: { metric_value: 50, unit_of_measure: 'PCT', sample_cohort_size: 5 },
        evaluation_measurement: { metric_value: 65, unit_of_measure: 'PCT', sample_cohort_size: 5 },
        computed_delta: { absolute_delta: 15, percentage_change_pct: 30 }
      }
    };
    const isClosed = isInstitutionalClosedLoopSatisfied(validActionSupport, validAdoption, boundaryOutcome);
    assert.equal(isClosed, true);
  });

  runCheck('Suite 11 [ADVERSARIAL]: Sneak-in cohort size N=4 in outcome must fail loop closure', () => {
    const undersizedOutcome: ObservedOutcomeEffect = {
      ...validOutcome,
      measurements: {
        baseline_measurement: { metric_value: 50, unit_of_measure: 'PCT', sample_cohort_size: 4 }, // N < 5
        evaluation_measurement: { metric_value: 65, unit_of_measure: 'PCT', sample_cohort_size: 5 },
        computed_delta: { absolute_delta: 15, percentage_change_pct: 30 }
      }
    };
    const isClosed = isInstitutionalClosedLoopSatisfied(validActionSupport, validAdoption, undersizedOutcome);
    assert.equal(isClosed, false);
  });

  runCheck('Suite 11 [ADVERSARIAL]: Whitespace-only human reflection must fail loop closure', () => {
    const blankReflectionOutcome: ObservedOutcomeEffect = {
      ...validOutcome,
      human_reflective_interpretation: '   \n  \t  '
    };
    const isClosed = isInstitutionalClosedLoopSatisfied(validActionSupport, validAdoption, blankReflectionOutcome);
    assert.equal(isClosed, false);
  });

  // -------------------------------------------------------------------------
  // SUITE 12: FB-01 Zero Individual Exposure (PII Redaction)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 12: FB-01 Zero Individual Exposure (PII Redaction) ---');

  runCheck('Suite 12 [VALID]: Aggregated statistical DTO with zero child PII passes guard', () => {
    const cleanDto = {
      projection_name: 'CURRICULUM_DOMAIN_DISTRIBUTION',
      academic_year: '2026/2027',
      total_cohort_count: 32,
      distribution: {
        steam_competency_pct: 78.5,
        social_emotional_pct: 82.1
      }
    };
    const res = validateZeroIndividualExposure(cleanDto);
    assert.equal(res.valid, true);
  });

  runCheck('Suite 12 [INVALID]: Leaking student_id in foundation DTO is rejected (FB-01)', () => {
    const leakingDto = {
      school_id: 'sch_tk_yapendik_01',
      student_id: 'stu_kenzo_secret',
      score: 85
    };
    const res = validateZeroIndividualExposure(leakingDto);
    assert.equal(res.valid, false);
    assert.equal(res.code, 'LEAK_INDIVIDUAL_PII');
  });

  runCheck('Suite 12 [BOUNDARY]: Empty or numeric aggregate payload passes without false positives', () => {
    assert.equal(validateZeroIndividualExposure({}).valid, true);
    assert.equal(validateZeroIndividualExposure({ count: 0, average_score: 0 }).valid, true);
  });

  runCheck('Suite 12 [ADVERSARIAL]: Deeply nested or obfuscated child PII key is detected and blocked', () => {
    const disguisedPayload = {
      metadata: {
        report_scope: 'MULTI_UNIT',
        drilldown: [
          { group: 'A', details: { nik_anak: '3171010101010001' } }
        ]
      }
    };
    const res = validateZeroIndividualExposure(disguisedPayload);
    assert.equal(res.valid, false);
    assert.equal(res.code, 'LEAK_INDIVIDUAL_PII');
  });

  // -------------------------------------------------------------------------
  // SUITE 13: FB-06 Canonical Mutation Hard Block
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 13: FB-06 Canonical Mutation Hard Block ---');

  runCheck('Suite 13 [VALID]: Foundation view/read actions and school-level mutations are allowed', () => {
    // Foundation VIEW is permitted
    assert.equal(validateFoundationMutationHardBlock('FOUNDATION_DIRECTOR', 'STUDENT_OBSERVATION', 'VIEW').valid, true);
    // School TEACHER CREATE is permitted
    assert.equal(validateFoundationMutationHardBlock('TEACHER', 'STUDENT_OBSERVATION', 'CREATE').valid, true);
    // School HEADMASTER APPROVE is permitted
    assert.equal(validateFoundationMutationHardBlock('HEADMASTER', 'STUDENT_DEVELOPMENT', 'APPROVE').valid, true);
  });

  runCheck('Suite 13 [INVALID]: Foundation Trustee attempting to EDIT student observation is blocked (FB-06)', () => {
    const res = validateFoundationMutationHardBlock('FOUNDATION_TRUSTEE', 'STUDENT_OBSERVATION', 'EDIT');
    assert.equal(res.valid, false);
    assert.equal(res.code, 'FOUNDATION_MUTATION_BLOCKED');
  });

  runCheck('Suite 13 [BOUNDARY]: Foundation Superadmin attempting to DELETE attendance register is blocked (FB-06)', () => {
    const res = validateFoundationMutationHardBlock('YAPENDIK_SUPERADMIN', 'ATTENDANCE_REGISTER', 'DELETE');
    assert.equal(res.valid, false);
    assert.equal(res.code, 'FOUNDATION_MUTATION_BLOCKED');
  });

  runCheck('Suite 13 [ADVERSARIAL]: Case-insensitive spoofing and RPC mutation attempts by Foundation blocked', () => {
    const res1 = validateFoundationMutationHardBlock('foundation_director', 'student_observation', 'create');
    assert.equal(res1.valid, false);
    assert.equal(res1.code, 'FOUNDATION_MUTATION_BLOCKED');

    const res2 = validateFoundationMutationHardBlock('SUPERADMIN', 'DAILY_ATTENDANCE', 'INSERT');
    assert.equal(res2.valid, false);
    assert.equal(res2.code, 'FOUNDATION_MUTATION_BLOCKED');
  });

  // -------------------------------------------------------------------------
  // SUITE 14: FB-07 Minimum Cohort Suppression (Kmin = 5)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 14: FB-07 Minimum Cohort Suppression (Kmin = 5) ---');

  runCheck('Suite 14 [VALID]: Cohort N >= 5 yields VISIBLE status (H-03, FB-07)', () => {
    assert.equal(evaluatePrivacyExposure(5), 'VISIBLE');
    assert.equal(evaluatePrivacyExposure(6), 'VISIBLE');
    assert.equal(evaluatePrivacyExposure(15), 'VISIBLE');
    assert.equal(evaluatePrivacyExposure(100), 'VISIBLE');
  });

  runCheck('Suite 14 [INVALID]: Cohort N < 5 yields SUPPRESSED_SMALL_COHORT status (H-03, FB-07)', () => {
    assert.equal(evaluatePrivacyExposure(1), 'SUPPRESSED_SMALL_COHORT');
    assert.equal(evaluatePrivacyExposure(2), 'SUPPRESSED_SMALL_COHORT');
    assert.equal(evaluatePrivacyExposure(3), 'SUPPRESSED_SMALL_COHORT');
    assert.equal(evaluatePrivacyExposure(4), 'SUPPRESSED_SMALL_COHORT');
  });

  runCheck('Suite 14 [BOUNDARY]: Exact threshold step (N=4 suppressed vs N=5 visible)', () => {
    assert.equal(evaluatePrivacyExposure(4), 'SUPPRESSED_SMALL_COHORT');
    assert.equal(evaluatePrivacyExposure(5), 'VISIBLE');
  });

  runCheck('Suite 14 [ADVERSARIAL]: Negative numbers, non-integers, NaN, and 0 cohort handled safely', () => {
    assert.equal(evaluatePrivacyExposure(0), 'SUPPRESSED_SMALL_COHORT');
    assert.equal(evaluatePrivacyExposure(-5), 'SUPPRESSED_SMALL_COHORT');
    assert.equal(evaluatePrivacyExposure(4.99), 'SUPPRESSED_SMALL_COHORT');
    assert.equal(evaluatePrivacyExposure(NaN), 'SUPPRESSED_SMALL_COHORT');
  });

  // -------------------------------------------------------------------------
  // SUITE 15: Anti-Differencing Engine (Exact Boundary Verification - DIRECTIVE 4)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 15: Anti-Differencing Engine (Exact Boundary Verification) ---');

  runCheck('Suite 15 [VALID]: Non-differencing queries (Diff >= 5) yield VISIBLE', () => {
    // 20 - 10 = 10 >= 5 -> VISIBLE
    assert.equal(evaluatePrivacyExposure(20, 10), 'VISIBLE');
    // 15 - 5 = 10 >= 5 -> VISIBLE
    assert.equal(evaluatePrivacyExposure(15, 5), 'VISIBLE');
  });

  runCheck('Suite 15 [INVALID]: Differencing risk (8 - 5 = 3 < 5) yields SUPPRESSED_DIFFERENCING_RISK', () => {
    // Total 8, Subset 5 -> Residual 3 exposes 3 individuals
    assert.equal(evaluatePrivacyExposure(8, 5), 'SUPPRESSED_DIFFERENCING_RISK');
    // Total 10, Subset 8 -> Residual 2 exposes 2 individuals
    assert.equal(evaluatePrivacyExposure(10, 8), 'SUPPRESSED_DIFFERENCING_RISK');
  });

  runCheck('Suite 15 [BOUNDARY PASS - DIRECTIVE 4]: Base N=9, Subset N=4 (Diff=5) -> Expect VISIBLE', () => {
    const status = evaluatePrivacyExposure(9, 4);
    assert.equal(status, 'VISIBLE');
  });

  runCheck('Suite 15 [BOUNDARY FAIL - DIRECTIVE 4]: Base N=8, Subset N=4 (Diff=4) -> Expect SUPPRESSED_DIFFERENCING_RISK', () => {
    const status = evaluatePrivacyExposure(8, 4);
    assert.equal(status, 'SUPPRESSED_DIFFERENCING_RISK');
  });

  runCheck('Suite 15 [BOUNDARY]: Diff = 0 (identical query population, diff not exposing residuals)', () => {
    // Diff 0 does not isolate a residual subgroup (diff = 0)
    assert.equal(evaluatePrivacyExposure(10, 10), 'VISIBLE');
  });

  runCheck('Suite 15 [ADVERSARIAL]: Inverted subset queries (subset > base) and negative subsets rejected', () => {
    assert.equal(evaluatePrivacyExposure(8, 12), 'SUPPRESSED_DIFFERENCING_RISK');
    assert.equal(evaluatePrivacyExposure(10, -2), 'SUPPRESSED_DIFFERENCING_RISK');
    assert.equal(evaluatePrivacyExposure(10, 8.5), 'SUPPRESSED_DIFFERENCING_RISK');
  });

  // -------------------------------------------------------------------------
  // SUITE 16: Non-Causal Association Semantics (H-02, FB-05)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 16: Non-Causal Association Semantics (H-02, FB-05) ---');

  runCheck('Suite 16 [VALID]: Strict OBSERVED_EMPIRICAL_ASSOCIATION declaration with delta and human reflection', () => {
    const res = validateObservedOutcomeEffect(validOutcome, 'act_2026_steam_supp_01');
    assert.equal(res.valid, true);
  });

  runCheck('Suite 16 [INVALID]: Declaring causal claim (e.g. CAUSAL_PROOF) is rejected by validator', () => {
    const pseudoCausalOutcome: any = {
      ...validOutcome,
      statistical_nature: 'CAUSAL_PROOF_ESTABLISHED'
    };
    const res = validateObservedOutcomeEffect(pseudoCausalOutcome);
    assert.equal(res.valid, false);
    assert.equal(res.code, 'INVALID_STATISTICAL_NATURE');
  });

  runCheck('Suite 16 [BOUNDARY]: Stagnant / Zero Delta (delta=0) with valid human reflection passes', () => {
    const zeroDeltaOutcome: ObservedOutcomeEffect = {
      ...validOutcome,
      measurements: {
        baseline_measurement: { metric_value: 70, unit_of_measure: 'PCT', sample_cohort_size: 15 },
        evaluation_measurement: { metric_value: 70, unit_of_measure: 'PCT', sample_cohort_size: 15 },
        computed_delta: { absolute_delta: 0, percentage_change_pct: 0 }
      },
      human_reflective_interpretation: 'Tidak ada perubahan kuantitatif signifikan, namun stabilitas interaksi bermain tetap terjaga.'
    };
    const res = validateObservedOutcomeEffect(zeroDeltaOutcome);
    assert.equal(res.valid, true);
  });

  runCheck('Suite 16 [ADVERSARIAL]: Missing or whitespace-only reflection rejected (Cannot automate human meaning)', () => {
    const blankReflection: ObservedOutcomeEffect = {
      ...validOutcome,
      human_reflective_interpretation: ''
    };
    const res = validateObservedOutcomeEffect(blankReflection);
    assert.equal(res.valid, false);
    assert.equal(res.code, 'EMPTY_HUMAN_REFLECTION');
  });

  // Additional Invariant Checks: FB-03 & FB-04 & H-05
  console.log('\n--- ADDITIONAL INVARIANTS: Scope Invariant (H-05), Adoption Authority (FB-03), Anti-Ranking (FB-04) ---');

  runCheck('Scope Invariant (H-05): SPECIFIC_SCHOOL without target_school_id is invalid', () => {
    const res = validateTargetScopeInvariant({ target_scope: 'SPECIFIC_SCHOOL', target_school_id: undefined });
    assert.equal(res.valid, false);
    assert.equal(res.code, 'INVALID_TARGET_SCOPE');
  });

  runCheck('Scope Invariant (H-05): ALL_TK_UNITS with target_school_id specified is invalid', () => {
    const res = validateTargetScopeInvariant({ target_scope: 'ALL_TK_UNITS', target_school_id: 'sch_tk_yapendik_01' });
    assert.equal(res.valid, false);
    assert.equal(res.code, 'INVALID_TARGET_SCOPE');
  });

  runCheck('School Adoption Authority (FB-03): Foundation Director recording adoption is forbidden', () => {
    const res = validateSchoolAdoptionAuthority('FOUNDATION_DIRECTOR');
    assert.equal(res.valid, false);
    assert.equal(res.code, 'FOUNDATION_ADOPTION_FORBIDDEN');
  });

  runCheck('School Adoption Authority (FB-03): Headmaster recording adoption is valid', () => {
    const res = validateSchoolAdoptionAuthority('HEADMASTER');
    assert.equal(res.valid, true);
  });

  runCheck('No Cross-School Ranking (FB-04): Schema containing leaderboard_position is rejected', () => {
    const res = validateNoCrossSchoolRanking({ school_id: 'sch_01', leaderboard_position: 1 });
    assert.equal(res.valid, false);
    assert.equal(res.code, 'PROHIBITED_RANKING_ATTRIBUTE');
  });

  runCheck('Derived Telemetry Only (FB-02): Schema containing static mutable KPI score override is rejected', () => {
    const res = validateDerivedTelemetryOnly({ school_id: 'sch_01', manual_kpi_score: 95 });
    assert.equal(res.valid, false);
    assert.equal(res.code, 'STATIC_MUTABLE_KPI_FORBIDDEN');
  });

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 4.5-B TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Stage 4.5-B Test Suite Failed with ${failedTests} error(s).`);
  }
}

// Execute when invoked directly via tsx
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('stage4_5_type_and_contract.test.ts')) {
  runStage45TypeAndContractTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
