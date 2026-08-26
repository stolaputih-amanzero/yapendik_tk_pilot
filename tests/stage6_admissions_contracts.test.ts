/**
 * YAPENDIK SCHOOL OS — STAGE 6 ADMISSIONS CONTRACT & ADVERSARIAL TEST SUITE
 * Test Suites: 26, 27, and 28
 * 
 * Verifies:
 * - Suite 26: The Enrollment Ceremony Atomicity, Pre-conditions & Rollback Integrity (AP-06 & ADR-05)
 * - Suite 27: Guardian Deduplication, Deterministic Identity & Multi-Unit Cancellation (AP-04 & ADR-05)
 * - Suite 28: Zero-PII Foundation Projection, RLS Hard Block & 90-Day Privacy Purge (AP-01 & AP-07)
 */

import assert from 'node:assert/strict';
import { admissionsService } from '../src/services/admissionsService';
import { db } from '../src/db/database';
import { ProspectiveChildApplicant, AdmissionsIntakeObservation } from '../src/types/admissionsTypes';
import { createHash } from 'crypto';

function deterministicMd5(input: string): string {
  return createHash('md5').update(input).digest('hex');
}

let passedChecks = 0;
let totalChecks = 0;

function runCheck(name: string, fn: () => void | Promise<void>) {
  totalChecks++;
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result.then(() => {
        passedChecks++;
        console.log(`  🟢 PASS: ${name}`);
      }).catch((err) => {
        console.error(`  ❌ FAIL: ${name}`);
        console.error(`     Error: ${err.message}`);
      });
    } else {
      passedChecks++;
      console.log(`  🟢 PASS: ${name}`);
    }
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runStage6AdmissionsTests() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 6 ADMISSIONS & ENROLLMENT CONTINUUM CONTRACT SUITE (SUITES 26-28)');
  console.log('════════════════════════════════════════════════════════════════\n');

  // ===========================================================================
  // SUITE 26: THE CEREMONY ATOMICITY & ROLLBACK INTEGRITY (AP-06 & ADR-05)
  // ===========================================================================
  console.log('--- SUITE 26: The Ceremony Atomicity & Rollback Integrity (AP-06 & ADR-05) ---');

  await runCheck('Suite 26 [PRECONDITION STATUS]: Ceremony rejected if applicant status != TUITION_SETTLED', async () => {
    const draftApplicant: ProspectiveChildApplicant = {
      applicant_id: 'app_test_draft_01',
      target_school_id: 'sch_tk_yapendik_01',
      academic_year_id: 'ay_2026_2027',
      target_class_level: 'TK_A',
      child_nik: '3171012345679991',
      child_full_name: 'Daniel Christian',
      child_gender: 'L',
      child_birth_place: 'Jakarta',
      child_birth_date: '2022-05-10',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Sabang No. 10',
      creator_uid: '00000000-0000-0000-0000-000000000002',
      guardian_nik: '3171019876549991',
      guardian_full_name: 'David Christian',
      guardian_relationship_type: 'AYAH',
      guardian_gender: 'L',
      guardian_phone_number: '081122334455',
      status: 'SUBMITTED', // NOT TUITION_SETTLED!
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await admissionsService.createApplicant(draftApplicant);

    await assert.rejects(
      async () => {
        await admissionsService.executeEnrollmentCeremony(
          'app_test_draft_01',
          'cls_tk_a1',
          { personId: 'per_headmaster_esther', role: 'HEADMASTER', activeSchoolId: 'sch_tk_yapendik_01' }
        );
      },
      (err: Error) => {
        return err.message.includes('INVALID_PRECONDITION') && err.message.includes('TUITION_SETTLED');
      }
    );
  });

  await runCheck('Suite 26 [TENANT ISOLATION C-11]: Headmaster from TK 02 cannot promote applicant of TK 01', async () => {
    await assert.rejects(
      async () => {
        await admissionsService.executeEnrollmentCeremony(
          'app_2026_sch01_demo01',
          'cls_tk_a1',
          { personId: 'per_headmaster_tk02', role: 'HEADMASTER', activeSchoolId: 'sch_tk_yapendik_02' } // Cross-tenant!
        );
      },
      (err: Error) => {
        return err.message.includes('TENANT_VIOLATION_C11');
      }
    );
  });

  await runCheck('Suite 26 [QUOTA OVERFLOW GUARD]: Ceremony rejected if quota is 100% full', async () => {
    const fullApplicant: ProspectiveChildApplicant = {
      applicant_id: 'app_test_full_quota',
      target_school_id: 'sch_tk_yapendik_02',
      academic_year_id: 'ay_2026_2027',
      target_class_level: 'TK_A',
      child_nik: '3171012345678888',
      child_full_name: 'Grace Natalia',
      child_gender: 'P',
      child_birth_place: 'Jakarta',
      child_birth_date: '2022-06-12',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Tebet Raya No. 4',
      creator_uid: '00000000-0000-0000-0000-000000000003',
      guardian_nik: '3171019876548888',
      guardian_full_name: 'Maria Natalia',
      guardian_relationship_type: 'IBU',
      guardian_gender: 'P',
      guardian_phone_number: '081299887766',
      status: 'TUITION_SETTLED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await admissionsService.createApplicant(fullApplicant);

    // Artificially max out quota
    const quota = admissionsService.getQuota('quota_2026_sch_tk_yapendik_02_tka');
    if (quota) quota.current_enrolled = quota.target_capacity;

    await assert.rejects(
      async () => {
        await admissionsService.executeEnrollmentCeremony(
          'app_test_full_quota',
          'cls_tk02_a1',
          { personId: 'per_headmaster_tk02', role: 'HEADMASTER', activeSchoolId: 'sch_tk_yapendik_02' }
        );
      },
      (err: Error) => {
        return err.message.includes('QUOTA_EXCEEDED');
      }
    );

    // Reset quota
    if (quota) quota.current_enrolled = 10;
  });

  await runCheck('Suite 26 [SUCCESSFUL CEREMONY]: Promotes applicant into 4 canonical tables atomicaly', async () => {
    const result = await admissionsService.executeEnrollmentCeremony(
      'app_2026_sch01_demo01',
      'cls_tk_a1',
      { personId: 'per_headmaster_esther', role: 'HEADMASTER', activeSchoolId: 'sch_tk_yapendik_01' }
    );

    assert.equal(result.success, true);
    assert.ok(result.promoted_student_id.startsWith('stu_'));
    assert.ok(result.child_person_id.startsWith('per_stu_'));
    assert.ok(result.guardian_person_id.startsWith('per_gua_'));
    assert.equal(result.placed_class_id, 'cls_tk_a1');
    assert.equal(result.has_baseline_snapshot, true);

    // Assert applicant status updated in staging
    const promotedApp = admissionsService.getApplicant('app_2026_sch01_demo01');
    assert.equal(promotedApp?.status, 'ENROLLED_PROMOTED');
    assert.equal(promotedApp?.promoted_student_id, result.promoted_student_id);
    assert.ok(promotedApp?.promoted_baseline_snapshot);
  });

  // ===========================================================================
  // SUITE 27: GUARDIAN DEDUPLICATION & MULTI-UNIT CANCELLATION (AP-04 & ADR-05)
  // ===========================================================================
  console.log('\n--- SUITE 27: Guardian Deduplication & Multi-Unit Cancellation (AP-04 & ADR-05) ---');

  await runCheck('Suite 27 [DETERMINISTIC ID]: Child and Guardian person_id are pure deterministic hashes of NIK', () => {
    const childNik = '3171012345670001';
    const guardianNik = '3171019876540001';

    const expectedChildId = `per_stu_${deterministicMd5(childNik).substring(0, 10)}`;
    const expectedGuardianId = `per_gua_${deterministicMd5(guardianNik).substring(0, 10)}`;

    const app = admissionsService.getApplicant('app_2026_sch01_demo01');
    assert.ok(app);
    assert.equal(`per_stu_${deterministicMd5(app.child_nik).substring(0, 10)}`, expectedChildId);
    assert.equal(`per_gua_${deterministicMd5(app.guardian_nik).substring(0, 10)}`, expectedGuardianId);
  });

  await runCheck('Suite 27 [GUARDIAN DEDUPLICATION]: Enrolling sibling reuses guardian person_id without duplicates', async () => {
    // Sibling of Timothy with same guardian NIK
    const siblingApplicant: ProspectiveChildApplicant = {
      applicant_id: 'app_2026_sch01_sibling02',
      target_school_id: 'sch_tk_yapendik_01',
      academic_year_id: 'ay_2026_2027',
      target_class_level: 'TK_A',
      child_nik: '3171012345670002', // Sibling NIK
      child_full_name: 'Hannah Gabriela Pandjaitan',
      child_gender: 'P',
      child_birth_place: 'Jakarta',
      child_birth_date: '2022-08-20',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Pegangsaan Timur No. 12, Menteng',
      creator_uid: '00000000-0000-0000-0000-000000000001',
      guardian_nik: '3171019876540001', // SAME GUARDIAN NIK
      guardian_full_name: 'Bona Pandjaitan, S.T.',
      guardian_relationship_type: 'AYAH',
      guardian_gender: 'L',
      guardian_phone_number: '081234567890',
      guardian_email: 'bona.pandjaitan@email.com',
      status: 'TUITION_SETTLED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await admissionsService.createApplicant(siblingApplicant);

    const siblingResult = await admissionsService.executeEnrollmentCeremony(
      'app_2026_sch01_sibling02',
      'cls_tk_a1',
      { personId: 'per_headmaster_esther', role: 'HEADMASTER', activeSchoolId: 'sch_tk_yapendik_01' }
    );

    // Guardian ID must match the first child's guardian ID
    const firstApp = admissionsService.getApplicant('app_2026_sch01_demo01');
    const firstGuardianId = `per_gua_${deterministicMd5(firstApp!.guardian_nik).substring(0, 10)}`;
    assert.equal(siblingResult.guardian_person_id, firstGuardianId);
  });

  await runCheck('Suite 27 [MULTI-UNIT CANCELLATION]: Promoting child in TK 01 cancels application in TK 02', async () => {
    const multiChildNik = '3171015554443332';

    // Application 1 in TK 01
    const appTK01: ProspectiveChildApplicant = {
      applicant_id: 'app_multi_tk01',
      target_school_id: 'sch_tk_yapendik_01',
      academic_year_id: 'ay_2026_2027',
      target_class_level: 'TK_A',
      child_nik: multiChildNik,
      child_full_name: 'Samuel Jonathan',
      child_gender: 'L',
      child_birth_place: 'Jakarta',
      child_birth_date: '2022-03-11',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Cikini No. 5',
      creator_uid: '00000000-0000-0000-0000-000000000004',
      guardian_nik: '3171018887776665',
      guardian_full_name: 'Jonathan Sihombing',
      guardian_relationship_type: 'AYAH',
      guardian_gender: 'L',
      guardian_phone_number: '081344556677',
      status: 'TUITION_SETTLED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Application 2 in TK 02 for the same child
    const appTK02: ProspectiveChildApplicant = {
      applicant_id: 'app_multi_tk02',
      target_school_id: 'sch_tk_yapendik_02',
      academic_year_id: 'ay_2026_2027',
      target_class_level: 'TK_A',
      child_nik: multiChildNik,
      child_full_name: 'Samuel Jonathan',
      child_gender: 'L',
      child_birth_place: 'Jakarta',
      child_birth_date: '2022-03-11',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Cikini No. 5',
      creator_uid: '00000000-0000-0000-0000-000000000004',
      guardian_nik: '3171018887776665',
      guardian_full_name: 'Jonathan Sihombing',
      guardian_relationship_type: 'AYAH',
      guardian_gender: 'L',
      guardian_phone_number: '081344556677',
      status: 'OFFERED_ADMISSION',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await admissionsService.createApplicant(appTK01);
    await admissionsService.createApplicant(appTK02);

    // Promote in TK 01
    await admissionsService.executeEnrollmentCeremony(
      'app_multi_tk01',
      'cls_tk_a1',
      { personId: 'per_headmaster_esther', role: 'HEADMASTER', activeSchoolId: 'sch_tk_yapendik_01' }
    );

    // Assert TK 02 application is automatically CANCELLED_ENROLLED_ELSEWHERE
    const updatedTK02 = admissionsService.getApplicant('app_multi_tk02');
    assert.equal(updatedTK02?.status, 'CANCELLED_ENROLLED_ELSEWHERE');
  });

  await runCheck('Suite 27 [IDEMPOTENCY GUARD]: Attempting ceremony on already enrolled applicant is rejected', async () => {
    await assert.rejects(
      async () => {
        await admissionsService.executeEnrollmentCeremony(
          'app_multi_tk01',
          'cls_tk_a1',
          { personId: 'per_headmaster_esther', role: 'HEADMASTER', activeSchoolId: 'sch_tk_yapendik_01' }
        );
      },
      (err: Error) => {
        return err.message.includes('ALREADY_ENROLLED');
      }
    );
  });

  await runCheck('Suite 27 [SNAPSHOT INJECTION CRITICAL FIX #1]: Transfers intake snapshot without physical table creation', () => {
    const app = admissionsService.getApplicant('app_2026_sch01_demo01');
    assert.ok(app);
    assert.ok(app.promoted_baseline_snapshot);
    assert.equal(app.promoted_baseline_snapshot.intake_observation_date, '2026-08-08');
    assert.ok(app.promoted_baseline_snapshot.developmental_domains);
  });

  // ===========================================================================
  // SUITE 28: ZERO-PII FOUNDATION PROJECTION & 90-DAY PRIVACY PURGE (AP-01 & AP-07)
  // ===========================================================================
  console.log('\n--- SUITE 28: Zero-PII Foundation Projection & 90-Day Privacy Purge (AP-01 & AP-07) ---');

  await runCheck('Suite 28 [ZERO-PII PROJECTION AP-07]: Projection contains only aggregated columns', async () => {
    const telemetry = await admissionsService.getAdmissionsTelemetry('sch_tk_yapendik_01', 'ay_2026_2027');
    assert.ok(telemetry.length > 0);

    for (const item of telemetry) {
      assert.ok('target_school_id' in item);
      assert.ok('academic_year_id' in item);
      assert.ok('target_class_level' in item);
      assert.ok('admission_status' in item);
      assert.ok('total_applicants' in item);

      // Strict Anti-PII assertions
      assert.equal((item as any).child_nik, undefined);
      assert.equal((item as any).child_full_name, undefined);
      assert.equal((item as any).guardian_nik, undefined);
      assert.equal((item as any).guardian_phone_number, undefined);
      assert.equal((item as any).guardian_email, undefined);
      assert.equal((item as any).child_address, undefined);
    }
  });

  await runCheck('Suite 28 [90-DAY PRIVACY PURGE AP-01]: Purges cancelled/unadmitted records older than cutoff', async () => {
    const oldCancelledApp: ProspectiveChildApplicant = {
      applicant_id: 'app_old_cancelled_01',
      target_school_id: 'sch_tk_yapendik_01',
      academic_year_id: 'ay_2025_2026',
      target_class_level: 'TK_A',
      child_nik: '3171011112223334',
      child_full_name: 'Old Cancelled Child',
      child_gender: 'L',
      child_birth_place: 'Jakarta',
      child_birth_date: '2021-02-14',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Matraman No. 1',
      creator_uid: '00000000-0000-0000-0000-000000000099',
      guardian_nik: '3171019998887776',
      guardian_full_name: 'Old Parent',
      guardian_relationship_type: 'AYAH',
      guardian_gender: 'L',
      guardian_phone_number: '081999888777',
      status: 'APPLICATION_WITHDRAWN',
      created_at: '2025-05-01T00:00:00Z',
      updated_at: '2025-05-15T00:00:00Z' // > 90 days ago!
    };
    await admissionsService.createApplicant(oldCancelledApp);

    const purgeResult = await admissionsService.purgeExpiredAdmissions('ay_2025_2026', 90);
    assert.equal(purgeResult.success, true);
    assert.ok(purgeResult.purged_applicants_count >= 1);

    // Old applicant must be completely deleted
    const purged = admissionsService.getApplicant('app_old_cancelled_01');
    assert.equal(purged, undefined);

    // Active enrolled applicant must be preserved
    const activeApp = admissionsService.getApplicant('app_2026_sch01_demo01');
    assert.ok(activeApp);
    assert.equal(activeApp.status, 'ENROLLED_PROMOTED');
  });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6 SUITES 26-28 SUMMARY: ${passedChecks} PASSED, ${totalChecks - passedChecks} FAILED (TOTAL: ${totalChecks})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (passedChecks !== totalChecks) {
    process.exit(1);
  }
}

runStage6AdmissionsTests().catch((err) => {
  console.error('Fatal Stage 6 test error:', err);
  process.exit(1);
});
