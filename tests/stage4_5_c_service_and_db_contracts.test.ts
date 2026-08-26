/**
 * YAPENDIK SCHOOL OS — STAGE 4.5-C SERVICE & DATABASE CONTRACT TEST SUITE
 * 
 * Formal Verification Suite for Gate 3 (Service Layer, DB Schema & Projection Engine)
 * Reference: doc/MASTER/STAGE_4_5_C_SERVICE_LAYER_AND_PROJECTION_ARCHITECTURE_v1.0.md
 * 
 * Test Suites (Suites 17–20):
 * - Suite 17: Database-Level FB-06 Mutation Hard Block & V2.1.5 Role Resolution
 * - Suite 18: Projection Engine PII Leak Test (Zero-PII Assurance)
 * - Suite 19: Anti-Differencing & Kmin=5 Orchestration in Service Layer (FB-07 & Refinement 2)
 * - Suite 20: H-01 JSONB Payload Immutability Post-Deployment & State Machine (Refinement 3)
 */

import { strict as assert } from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

import {
  InstitutionalLearningService,
  institutionalLearningService
} from '../src/services/institutionalLearningService';

import {
  InstitutionalActionRecord,
  SchoolAdoptionResponse,
  ObservedOutcomeEffect,
  SupportPayload,
  DirectivePayload
} from '../src/types/institutionalLearningTypes';

import {
  validateZeroIndividualExposure,
  validateFoundationMutationHardBlock,
  evaluatePrivacyExposure
} from '../src/domain/institutionalLearningValidators';

export async function runStage45CServiceAndDbContractsTests() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 4.5-C SERVICE & DB CONTRACT TEST SUITE (SUITES 17–20)');
  console.log('════════════════════════════════════════════════════════════════\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function runCheck(testName: string, fn: () => void | Promise<void>) {
    totalTests++;
    try {
      const res = fn();
      if (res instanceof Promise) {
        throw new Error(`Sync runner called with async test '${testName}'. Use await inside runCheckAsync.`);
      }
      passedTests++;
      console.log(`  🟢 PASS: ${testName}`);
    } catch (err: any) {
      failedTests++;
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err?.message || err}`);
    }
  }

  async function runCheckAsync(testName: string, fn: () => Promise<void>) {
    totalTests++;
    try {
      await fn();
      passedTests++;
      console.log(`  🟢 PASS: ${testName}`);
    } catch (err: any) {
      failedTests++;
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err?.message || err}`);
    }
  }

  // Load Migration M07 SQL File
  const migrationPath = path.resolve(process.cwd(), 'db_migrations/m07_institutional_learning_ddl_and_guards.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf8');

  // -------------------------------------------------------------------------
  // SUITE 17: Database-Level FB-06 Mutation Hard Block & Role Resolution
  // -------------------------------------------------------------------------
  console.log('--- SUITE 17: Database-Level FB-06 Mutation Hard Block & Role Resolution ---');

  runCheck('Suite 17 [SQL DDL]: Migration M07 installs FB-06 triggers on all 5 canonical school tables', () => {
    assert.ok(migrationSql.includes('trg_fb06_block_foundation_obs'), 'Missing trigger on observation_records');
    assert.ok(migrationSql.includes('trg_fb06_block_foundation_att'), 'Missing trigger on daily_attendance');
    assert.ok(migrationSql.includes('trg_fb06_block_foundation_lppa'), 'Missing trigger on student_progress_reports');
    assert.ok(migrationSql.includes('trg_fb06_block_foundation_stu'), 'Missing trigger on students (Refinement 1)');
    assert.ok(migrationSql.includes('trg_fb06_block_foundation_act'), 'Missing trigger on learning_activities (Refinement 1)');
    assert.ok(migrationSql.includes('MUTATION_REJECTED_FB06'), 'Missing MUTATION_REJECTED_FB06 error message');
  });

  runCheck('Suite 17 [SQL RLS]: Migration M07 defines SECURITY DEFINER helpers with search_path = public, pg_temp', () => {
    assert.ok(migrationSql.includes('CREATE OR REPLACE FUNCTION public.auth_is_governance()'));
    assert.ok(migrationSql.includes('CREATE OR REPLACE FUNCTION public.auth_is_headmaster_of('));
    assert.ok(migrationSql.includes('SET search_path = public, pg_temp'));
  });

  await runCheckAsync('Suite 17 [SERVICE GUARD]: Foundation role attempting school mutation is blocked with MUTATION_REJECTED_FB06', async () => {
    const service = new InstitutionalLearningService();
    
    let caughtError: any = null;
    try {
      await service.executeSchoolMutation(
        'FOUNDATION_DIRECTOR',
        'STUDENT_OBSERVATION',
        'CREATE',
        () => ({ id: 'obs_01', notes: 'Unauthorized edit' })
      );
    } catch (err: any) {
      caughtError = err;
    }

    assert.ok(caughtError, 'Expected mutation to throw error');
    assert.equal(caughtError.code, 'MUTATION_REJECTED_FB06');
    assert.ok(caughtError.message.includes('Foundation role \'FOUNDATION_DIRECTOR\' is strictly forbidden'));
  });

  await runCheckAsync('Suite 17 [VALID CASE]: School Teacher can execute classroom mutations legitimately', async () => {
    const service = new InstitutionalLearningService();
    const result = await service.executeSchoolMutation(
      'TEACHER',
      'STUDENT_OBSERVATION',
      'CREATE',
      () => ({ id: 'obs_valid_01', notes: 'Legitimate teacher observation' })
    );

    assert.equal(result.id, 'obs_valid_01');
  });

  // -------------------------------------------------------------------------
  // SUITE 18: Projection Engine PII Leak Test (Zero-PII Assurance)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 18: Projection Engine PII Leak Test (Zero-PII Assurance) ---');

  await runCheckAsync('Suite 18 [PROJECTION ENGINE]: deriveCurriculumDomainDistribution produces 0 child PII', async () => {
    const service = new InstitutionalLearningService();
    const patterns = await service.deriveCurriculumDomainDistribution('ay_2026_2027_ganjil', 'sch_tk_yapendik_01');

    assert.ok(patterns.length > 0, 'Should return domain patterns');
    for (const pattern of patterns) {
      const piiCheck = validateZeroIndividualExposure(pattern);
      assert.equal(piiCheck.valid, true, `Pattern leaked PII: ${piiCheck.reason}`);
      assert.equal((pattern as any).student_id, undefined);
      assert.equal((pattern as any).student_name, undefined);
      assert.equal((pattern as any).nik, undefined);
      assert.equal((pattern as any).nisn, undefined);
    }
  });

  runCheck('Suite 18 [ADVERSARIAL REDACTOR]: DTO mapper detects and halts on attempted PII infiltration', () => {
    const leakedPattern = {
      pattern_id: 'pat_test_01',
      source_projection: 'CURRICULUM_DOMAIN_DISTRIBUTION',
      distribution: {
        metric_score: 85,
        drilldown: [{ student_id: 'stu_kenzo_secret_id' }]
      }
    };
    const res = validateZeroIndividualExposure(leakedPattern);
    assert.equal(res.valid, false);
    assert.equal(res.code, 'LEAK_INDIVIDUAL_PII');
  });

  // -------------------------------------------------------------------------
  // SUITE 19: Anti-Differencing & Kmin=5 Orchestration (FB-07 & Refinement 2)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 19: Anti-Differencing & Kmin=5 Orchestration in Service Layer ---');

  runCheck('Suite 19 [SQL DDL]: fn_derive_curriculum_domain_pattern implements CASE WHEN count < 5 THEN NULL', () => {
    assert.ok(migrationSql.includes('CASE \n      WHEN rc.n_count < 5 THEN NULL') || migrationSql.includes('rc.n_count < 5 THEN NULL'));
    assert.ok(migrationSql.includes('SUPPRESSED_SMALL_COHORT'));
    assert.ok(migrationSql.includes('VISIBLE'));
  });

  await runCheckAsync('Suite 19 [BOUNDARY PASS]: Base N=9, Subset N=4 (Diff=5) yields VISIBLE with computed value', async () => {
    const service = new InstitutionalLearningService();
    // Simulating N=9 base, N=4 subset
    const status = evaluatePrivacyExposure(9, 4);
    assert.equal(status, 'VISIBLE');

    // Service derivation with Diff=5
    const patterns = await service.deriveCurriculumDomainDistribution('ay_2026_ganjil', 'sch_01', 11); // 16 - 11 = 5
    assert.ok(patterns.length > 0);
    assert.equal(patterns[0].exposure_status, 'VISIBLE');
    assert.ok(patterns[0].computed_metric_value !== undefined);
  });

  await runCheckAsync('Suite 19 [BOUNDARY FAIL]: Base N=8, Subset N=4 (Diff=4) yields SUPPRESSED_DIFFERENCING_RISK (metric=undefined)', async () => {
    const service = new InstitutionalLearningService();
    // Simulating Diff=4 (16 - 12 = 4)
    const patterns = await service.deriveCurriculumDomainDistribution('ay_2026_ganjil', 'sch_01', 12);
    assert.ok(patterns.length > 0);
    assert.equal(patterns[0].exposure_status, 'SUPPRESSED_DIFFERENCING_RISK');
    assert.equal(patterns[0].computed_metric_value, undefined, 'Metric must be masked/undefined when differencing risk detected');
  });

  // -------------------------------------------------------------------------
  // SUITE 20: H-01 JSONB Immutability Post-Deployment & State Machine (Refinement 3)
  // -------------------------------------------------------------------------
  console.log('\n--- SUITE 20: H-01 JSONB Immutability Post-Deployment & State Machine ---');

  runCheck('Suite 20 [SQL DDL]: trg_guard_action_payload_lifecycle enforces PAYLOAD_CONTENT_IMMUTABLE', () => {
    assert.ok(migrationSql.includes('trg_guard_action_payload_lifecycle'));
    assert.ok(migrationSql.includes('PAYLOAD_CONTENT_IMMUTABLE'));
    assert.ok(migrationSql.includes('ILLEGAL_STATE_TRANSITION'));
    assert.ok(migrationSql.includes('TERMINAL_STATE_FROZEN'));
  });

  const stateMachineService = new InstitutionalLearningService();
  const testActionFixture: InstitutionalActionRecord = {
    action_id: 'act_test_supp_01',
    originating_insight_id: 'ins_01',
    originating_decision_id: 'dec_01',
    action_type: 'SUPPORT_INITIATIVE',
    target_scope: 'SPECIFIC_SCHOOL',
    target_school_id: 'sch_tk_yapendik_01',
    title: 'Pendampingan Sentra STEAM',
    policy_intent: 'Penguatan eksplorasi saintifik',
    issued_by_person_id: 'per_admin',
    issued_by_name: 'Superadmin',
    issued_at: new Date().toISOString(),
    support_payload: {
      initiative_type: 'TEACHER_COACHING',
      resource_allocation_details: 'Fasilitator 2 minggu',
      support_lifecycle_status: 'PROPOSED'
    }
  };

  await runCheckAsync('Suite 20 [SERVICE STATE MACHINE]: Support lifecycle transitions through valid steps', async () => {
    await stateMachineService.issueInstitutionalAction(testActionFixture);

    // PROPOSED -> APPROVED
    const approved = await stateMachineService.transitionSupportLifecycle('act_test_supp_01', 'APPROVED');
    assert.equal(approved.support_payload?.support_lifecycle_status, 'APPROVED');

    // APPROVED -> DEPLOYED
    const deployed = await stateMachineService.transitionSupportLifecycle('act_test_supp_01', 'DEPLOYED');
    assert.equal(deployed.support_payload?.support_lifecycle_status, 'DEPLOYED');
  });

  await runCheckAsync('Suite 20 [REFINEMENT 3 IMMUTABILITY]: Mutating payload content while DEPLOYED is rejected', async () => {
    let caughtError: any = null;
    try {
      await stateMachineService.transitionSupportLifecycle('act_test_supp_01', 'COMPLETED', {
        resource_allocation_details: 'Hacked new allocation details post-deployment'
      });
    } catch (err: any) {
      caughtError = err;
    }

    assert.ok(caughtError, 'Expected modifying payload body post-deployment to be rejected');
    assert.ok(caughtError.message.includes('PAYLOAD_CONTENT_IMMUTABLE'));
  });

  await runCheckAsync('Suite 20 [VALID REFINEMENT 3]: Status transition without body change from DEPLOYED to COMPLETED succeeds', async () => {
    const completed = await stateMachineService.transitionSupportLifecycle('act_test_supp_01', 'COMPLETED');
    assert.equal(completed.support_payload?.support_lifecycle_status, 'COMPLETED');
  });

  await runCheckAsync('Suite 20 [TERMINAL STATE]: Transition from terminal COMPLETED state is rejected', async () => {
    let caughtError: any = null;
    try {
      await stateMachineService.transitionSupportLifecycle('act_test_supp_01', 'DEPLOYED');
    } catch (err: any) {
      caughtError = err;
    }

    assert.ok(caughtError);
    assert.ok(caughtError.message.includes('ILLEGAL_STATE_TRANSITION'));
  });

  await runCheckAsync('Suite 20 [DIRECTIVE LIFECYCLE & IMMUTABILITY]: Directive lifecycle progression and post-publish immutability', async () => {
    const directiveAction: InstitutionalActionRecord = {
      action_id: 'act_test_dir_01',
      originating_insight_id: 'ins_01',
      originating_decision_id: 'dec_01',
      action_type: 'GOVERNANCE_DIRECTIVE',
      target_scope: 'ALL_TK_UNITS',
      title: 'Direktif Standar Integrasi STEAM',
      policy_intent: 'Standarisasi alokasi waktu sentra',
      issued_by_person_id: 'per_admin',
      issued_by_name: 'Superadmin',
      issued_at: new Date().toISOString(),
      directive_payload: {
        directive_code: 'DIR-2026-01',
        advisory_guidelines: 'Pedoman alokasi waktu 120 menit',
        compliance_recommendations: 'Evaluasi berkala',
        directive_lifecycle_status: 'DRAFT'
      }
    };
    await stateMachineService.issueInstitutionalAction(directiveAction);

    // DRAFT -> PUBLISHED
    const published = await stateMachineService.transitionDirectiveLifecycle('act_test_dir_01', 'PUBLISHED');
    assert.equal(published.directive_payload?.directive_lifecycle_status, 'PUBLISHED');

    // Mutating body while PUBLISHED is rejected
    let caughtError: any = null;
    try {
      await stateMachineService.transitionDirectiveLifecycle('act_test_dir_01', 'SUPERSEDED', {
        advisory_guidelines: 'Altered guidelines post-publish'
      });
    } catch (err: any) {
      caughtError = err;
    }
    assert.ok(caughtError);
    assert.ok(caughtError.message.includes('PAYLOAD_CONTENT_IMMUTABLE'));

    // PUBLISHED -> SUPERSEDED succeeds
    const superseded = await stateMachineService.transitionDirectiveLifecycle('act_test_dir_01', 'SUPERSEDED');
    assert.equal(superseded.directive_payload?.directive_lifecycle_status, 'SUPERSEDED');
  });

  await runCheckAsync('Suite 20 [CLOSED-LOOP RPC]: verifyClosedLoopCondition calculates transactional closure', async () => {
    const service = new InstitutionalLearningService();
    
    // Action is now COMPLETED (was DEPLOYED), let's create an active DEPLOYED action for closed loop
    const activeAction: InstitutionalActionRecord = {
      action_id: 'act_loop_01',
      originating_insight_id: 'ins_01',
      originating_decision_id: 'dec_01',
      action_type: 'SUPPORT_INITIATIVE',
      target_scope: 'SPECIFIC_SCHOOL',
      target_school_id: 'sch_tk_yapendik_01',
      title: 'Inisiatif Aktif',
      policy_intent: 'Uji Closed Loop',
      issued_by_person_id: 'per_admin',
      issued_by_name: 'Superadmin',
      issued_at: new Date().toISOString(),
      support_payload: {
        initiative_type: 'TEACHER_COACHING',
        resource_allocation_details: 'Alokasi valid',
        support_lifecycle_status: 'DEPLOYED'
      }
    };
    await service.issueInstitutionalAction(activeAction);

    const adoption: SchoolAdoptionResponse = {
      response_id: 'adp_loop_01',
      action_id: 'act_loop_01',
      action_type: 'SUPPORT_INITIATIVE',
      school_id: 'sch_tk_yapendik_01',
      headmaster_person_id: 'per_headmaster',
      headmaster_name: 'Kepala Sekolah',
      adoption_status: 'ADOPTED_IN_PRACTICE',
      local_context_adaptation_notes: 'Diterapkan di sentra',
      action_timeline: 'Semester Ganjil',
      acknowledged_at: new Date().toISOString()
    };
    await service.recordSchoolAdoption(adoption, 'HEADMASTER');

    const outcome: ObservedOutcomeEffect = {
      outcome_id: 'out_loop_01',
      action_id: 'act_loop_01',
      school_id: 'sch_tk_yapendik_01',
      metric_name: 'STEAM_ENGAGEMENT',
      observation_window: {
        baseline_period_name: '2025/2026 Genap',
        evaluation_period_name: '2026/2027 Ganjil'
      },
      measurements: {
        baseline_measurement: { metric_value: 60, unit_of_measure: 'PCT', sample_cohort_size: 10 },
        evaluation_measurement: { metric_value: 80, unit_of_measure: 'PCT', sample_cohort_size: 10 },
        computed_delta: { absolute_delta: 20, percentage_change_pct: 33.3 }
      },
      statistical_nature: 'OBSERVED_EMPIRICAL_ASSOCIATION',
      human_reflective_interpretation: 'Peningkatan signifikan dalam observasi sentra balok.',
      recorded_by_person_id: 'per_teacher',
      recorded_by_name: 'Guru Siti',
      recorded_at: new Date().toISOString()
    };
    await service.recordObservedOutcome(outcome);

    const loopResult = await service.verifyClosedLoopCondition('act_loop_01');
    assert.equal(loopResult.is_closed_loop, true);
    assert.equal(loopResult.milestones.action_active, true);
    assert.equal(loopResult.milestones.school_adopted, true);
    assert.equal(loopResult.milestones.outcome_verified, true);
    assert.equal(loopResult.diagnostic_flags.length, 0);
  });

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 4.5-C TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Stage 4.5-C Test Suite Failed with ${failedTests} error(s).`);
  }
}

// Execute when invoked directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('stage4_5_c_service_and_db_contracts.test.ts')) {
  runStage45CServiceAndDbContractsTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
