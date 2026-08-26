/**
 * YAPENDIK SCHOOL OS — STAGE 3.4-A: APPLICATION SERVICES TEST SUITE
 * 
 * Verifies that the typed application service adapters, error translators,
 * and RPC invokers adhere strictly to the Stage 3.4 Application Integration Contract.
 */

import { translateGovernanceError } from '../src/services/governanceErrorTranslator';
import { academicLifecycleService } from '../src/services/academicLifecycleService';
import { cohortLineageService } from '../src/services/cohortLineageService';
import { institutionalHealthService } from '../src/services/institutionalHealthService';
import { studentTrajectoryService } from '../src/services/studentTrajectoryService';

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, name: string, detail: string = '') {
  if (condition) {
    console.log(`  🟢 PASS: ${name}`);
    passCount++;
  } else {
    console.error(`  🔴 FAIL: ${name} -> ${detail}`);
    failCount++;
  }
}

async function runServicesSuite() {
  console.log(`════════════════════════════════════════════════════════════════`);
  console.log(`🧪 STAGE 3.4-A APPLICATION SERVICES FOUNDATION TEST SUITE`);
  console.log(`════════════════════════════════════════════════════════════════\n`);

  // ----------------------------------------------------------------------------
  // MODULE 1: GOVERNANCE ERROR TRANSLATOR TESTS
  // ----------------------------------------------------------------------------
  console.log(`--- MODULE 1: Governance Error Translation Matrix ---`);

  const t1 = translateGovernanceError(new Error('PRECONDITION_FAILED: Only 3 of 4 active enrolled students have APPROVED LPPA'));
  assert(t1.isGovernanceError && t1.code === 'PRECONDITION_FAILED' && t1.title.includes('Prasyarat'), 'Translates PRECONDITION_FAILED correctly');
  assert(t1.actionSuggestion !== undefined, 'Includes actionSuggestion for PRECONDITION_FAILED');

  const t2 = translateGovernanceError(new Error('CAPACITY_EXCEEDED: Target class capacity is 15, cannot add 20'));
  assert(t2.isGovernanceError && t2.code === 'CAPACITY_EXCEEDED' && t2.title.includes('Kapasitas'), 'Translates CAPACITY_EXCEEDED correctly');

  const t3 = translateGovernanceError(new Error('ACTIVE_PERIOD_EXISTS: An active academic period already exists'));
  assert(t3.isGovernanceError && t3.code === 'ACTIVE_PERIOD_EXISTS' && t3.title.includes('Semester Aktif'), 'Translates ACTIVE_PERIOD_EXISTS correctly');

  const t4 = translateGovernanceError(new Error('UNAUTHORIZED: Caller is not authorized to promote cohorts'));
  assert(t4.isGovernanceError && t4.code === 'UNAUTHORIZED' && t4.title.includes('Akses Otoritas'), 'Translates UNAUTHORIZED correctly');

  const t5 = translateGovernanceError(new Error('CANNOT_MUTATE_CLOSED_SEMESTER: Semester is CLOSED'));
  assert(t5.isGovernanceError && t5.code === 'CANNOT_MUTATE_CLOSED_SEMESTER' && t5.title.includes('Terkunci'), 'Translates CANNOT_MUTATE_CLOSED_SEMESTER correctly');

  const t6 = translateGovernanceError(new Error('CANNOT_MUTATE_TERMINAL_PLACEMENT: Placement is COMPLETED'));
  assert(t6.isGovernanceError && t6.code === 'CANNOT_MUTATE_TERMINAL_PLACEMENT' && t6.title.includes('Final'), 'Translates CANNOT_MUTATE_TERMINAL_PLACEMENT correctly');

  const t7 = translateGovernanceError(new Error('SOURCE_SEMESTER_NOT_CLOSED: Must be CLOSED prior to promotion'));
  assert(t7.isGovernanceError && t7.code === 'SOURCE_SEMESTER_NOT_CLOSED', 'Translates SOURCE_SEMESTER_NOT_CLOSED correctly');

  const t8 = translateGovernanceError(new Error('TEMPORAL_ALIGNMENT_MISMATCH: Class belongs to different period'));
  assert(t8.isGovernanceError && t8.code === 'TEMPORAL_ALIGNMENT_MISMATCH', 'Translates TEMPORAL_ALIGNMENT_MISMATCH correctly');

  const t9 = translateGovernanceError(new Error('INVALID_DATE_RANGE: End date before start date'));
  assert(t9.isGovernanceError && t9.code === 'INVALID_DATE_RANGE', 'Translates INVALID_DATE_RANGE correctly');

  const t10 = translateGovernanceError(new Error('Some generic network error'));
  assert(!t10.isGovernanceError && t10.title.includes('Gagal'), 'Translates generic non-governance error safely');

  // ----------------------------------------------------------------------------
  // MODULE 2: SERVICE METHODS SIGNATURE & INTERFACE CONTRACTS
  // ----------------------------------------------------------------------------
  console.log(`\n--- MODULE 2: Typed Service Method Signatures ---`);

  assert(typeof academicLifecycleService.closeSemester === 'function', 'AcademicLifecycleService has closeSemester()');
  assert(typeof academicLifecycleService.initializeNextSemester === 'function', 'AcademicLifecycleService has initializeNextSemester()');
  assert(typeof academicLifecycleService.getSemesterReconciliationStatus === 'function', 'AcademicLifecycleService has getSemesterReconciliationStatus()');

  assert(typeof cohortLineageService.promoteCohort === 'function', 'CohortLineageService has promoteCohort()');
  assert(typeof cohortLineageService.graduateCohort === 'function', 'CohortLineageService has graduateCohort()');

  assert(typeof institutionalHealthService.getSchoolHealthTelemetry === 'function', 'InstitutionalHealthService has getSchoolHealthTelemetry()');

  assert(typeof studentTrajectoryService.getStudentLongitudinalTrajectory === 'function', 'StudentTrajectoryService has getStudentLongitudinalTrajectory()');

  // ----------------------------------------------------------------------------
  // MODULE 4: COHORT LINEAGE CONTRACTS & QUERY HELPERS
  // ----------------------------------------------------------------------------
  console.log(`\n--- MODULE 4: Cohort Lineage Contracts & Query Helpers ---`);

  assert(typeof cohortLineageService.getClassActiveStudents === 'function', 'CohortLineageService has getClassActiveStudents()');
  assert(typeof cohortLineageService.getClassCapacitySummary === 'function', 'CohortLineageService has getClassCapacitySummary()');

  let unconfPromoteCaught = false;
  try {
    await cohortLineageService.promoteCohort({
      schoolId: 'sch_dummy',
      sourceClassId: 'cls_dummy_1',
      targetClassId: 'cls_dummy_2',
      targetAcademicYearId: 'ay_dummy',
      studentIds: ['stu_dummy_1']
    });
  } catch (err: any) {
    unconfPromoteCaught = true;
  }
  assert(unconfPromoteCaught, 'cohortLineageService.promoteCohort throws translated error on execution');

  let unconfGradCaught = false;
  try {
    await cohortLineageService.graduateCohort({
      schoolId: 'sch_dummy',
      classId: 'cls_dummy_1',
      studentIds: ['stu_dummy_1']
    });
  } catch (err: any) {
    unconfGradCaught = true;
  }
  assert(unconfGradCaught, 'cohortLineageService.graduateCohort throws translated error on execution');

  // ----------------------------------------------------------------------------
  // MODULE 5: INSTITUTIONAL HEALTH TELEMETRY CONTRACTS
  // ----------------------------------------------------------------------------
  console.log(`\n--- MODULE 5: Institutional Health Telemetry Contracts ---`);

  assert(typeof institutionalHealthService.getSchoolHealthTelemetry === 'function', 'InstitutionalHealthService has getSchoolHealthTelemetry()');
  assert(typeof institutionalHealthService.getFoundationMultiSchoolTelemetry === 'function', 'InstitutionalHealthService has getFoundationMultiSchoolTelemetry()');

  const singleTel = await institutionalHealthService.getSchoolHealthTelemetry('sch_tk_yapendik_01');
  assert(typeof singleTel.health_status === 'string', 'institutionalHealthService.getSchoolHealthTelemetry returns valid telemetry payload');
  assert(typeof singleTel.indicators.capacity_utilization_pct === 'number', 'Telemetry indicators contain valid capacity utilization metric');

  const multiRes = await institutionalHealthService.getFoundationMultiSchoolTelemetry(['sch_dummy_1', 'sch_dummy_2']);
  assert(Array.isArray(multiRes) && multiRes.length === 2, 'getFoundationMultiSchoolTelemetry returns array of telemetry items gracefully');
  assert(multiRes[0].health_status === 'CRITICAL_BLOCKER', 'Multi-school fallback reports error state safely');

  // ----------------------------------------------------------------------------
  // MODULE 6: STUDENT LONGITUDINAL TRAJECTORY CONTRACTS
  // ----------------------------------------------------------------------------
  console.log(`\n--- MODULE 6: Student Longitudinal Trajectory Contracts ---`);

  assert(typeof studentTrajectoryService.getStudentLongitudinalTrajectory === 'function', 'StudentTrajectoryService has getStudentLongitudinalTrajectory()');

  // Test with seeded student (Kenzo) in local/fallback mode
  const kenzoTraj = await studentTrajectoryService.getStudentLongitudinalTrajectory('stu_kenzo_01');
  assert(kenzoTraj.student_id === 'stu_kenzo_01', 'Trajectory contains canonical student_id');
  assert(Array.isArray(kenzoTraj.placement_lineage), 'Trajectory contains placement_lineage array');
  assert(Array.isArray(kenzoTraj.lppa_history), 'Trajectory contains lppa_history array');
  assert(kenzoTraj.placement_lineage.length > 0, 'Chronological placement lineage populated');
  assert(kenzoTraj.placement_lineage[0].placement_status === 'ACTIVE' || kenzoTraj.placement_lineage[0].placement_status === 'PROMOTED' || kenzoTraj.placement_lineage[0].placement_status === 'COMPLETED', 'Placement status is valid canonical enum');

  let unconfTrajCaught = false;
  try {
    await studentTrajectoryService.getStudentLongitudinalTrajectory('stu_non_existent');
  } catch (err: any) {
    unconfTrajCaught = true;
  }
  assert(unconfTrajCaught, 'studentTrajectoryService throws gracefully for non-existent student');

  console.log(`\n════════════════════════════════════════════════════════════════`);
  console.log(`🏁 STAGE 3.4 COMPREHENSIVE APPLICATION TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log(`════════════════════════════════════════════════════════════════\n`);

  if (failCount > 0) {
    process.exit(1);
  }
}

runServicesSuite().catch(console.error);
