/**
 * YAPENDIK SCHOOL OS — TK PILOT v1.0
 * RUNTIME BEHAVIORAL SECURITY & STATE MACHINE TEST SUITE
 * 
 * Verifies live runtime behavior of:
 * - Dynamic Supabase Identity Resolution Pipeline
 * - Multi-tenant & Role-Based Contextual Authorization
 * - Scoped Storage Cache Lifecycle & Complete Session Purging
 * - Privacy Projection Predicates (Staff Confidentiality Protection)
 * - Attendance Deterministic Idempotency & Conflict Resolution
 * - LPPA Progress Report State Machine (Draft -> Review -> Approve -> Publish)
 * - Audit Trail Event Generation & Cloud RPC Contract
 */

import { evaluateAuthorization, SecurityContext } from '../src/auth/authorization';
import { db } from '../src/db/database';
import { SEED_PERSONAS, PersonaProfile } from '../src/auth/context';
import { DevelopmentDomain, Role } from '../src/domain/types';

// Mock storage for Node runtime
const mockStorageEngine: Record<string, string> = {};
(globalThis as any).__memStore = mockStorageEngine;

let passCount = 0;
let failCount = 0;

function test(description: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✅ PASS: ${description}`);
    passCount++;
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${description}`);
    console.error(`     Error: ${err?.message || err}`);
    failCount++;
  }
}

function expect(actual: any) {
  return {
    toBe(expected: any) {
      if (actual !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toEqual(expected: any) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeGreaterThanOrEqual(expected: number) {
      if (actual < expected) {
        throw new Error(`Expected ${actual} >= ${expected}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value, got ${JSON.stringify(actual)}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value, got ${JSON.stringify(actual)}`);
      }
    }
  };
}

console.log('================================================================');
console.log('🧪 RUNTIME BEHAVIORAL & INTEGRATION SECURITY TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// MODULE 1: AUTHENTICATION & IDENTITY RESOLUTION PIPELINE (SEC-04)
// -----------------------------------------------------------------------------
console.log('--- MODULE 1: Dynamic Identity Resolution Pipeline ---');

test('Resolves Teacher Siti correctly with assigned class cls_tka_01', () => {
  const persona = SEED_PERSONAS.find(p => p.personId === 'per_teacher_siti');
  expect(persona).toBeTruthy();
  expect(persona?.role).toBe('TEACHER');
  expect(persona?.schoolId).toBe('sch_tk_yapendik_01');
  expect(persona?.assignedClasses.includes('cls_tka_01')).toBe(true);
});

test('Resolves Headmaster Esther with supervisory jurisdiction over all classes in TK 01', () => {
  const persona = SEED_PERSONAS.find(p => p.personId === 'per_headmaster_esther');
  expect(persona).toBeTruthy();
  expect(persona?.role).toBe('HEADMASTER');
  expect(persona?.schoolId).toBe('sch_tk_yapendik_01');
});

test('Resolves Guardian Budi strictly mapped to registered child Kenzo (per_child_kenzo)', () => {
  const persona = SEED_PERSONAS.find(p => p.personId === 'per_parent_budi');
  expect(persona).toBeTruthy();
  expect(persona?.role).toBe('GUARDIAN');
  expect(persona?.guardianChildrenPersonIds).toEqual(['per_child_kenzo']);
});

test('Resolves Superadmin Andreas with foundation-wide governance role', () => {
  const persona = SEED_PERSONAS.find(p => p.personId === 'per_superadmin_andreas');
  expect(persona).toBeTruthy();
  expect(persona?.role).toBe('YAPENDIK_SUPERADMIN');
});

// -----------------------------------------------------------------------------
// MODULE 2: CONTEXTUAL AUTHORIZATION DECISION MATRIX (SEC-04, SEC-07)
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 2: Contextual Authorization Engine Matrix ---');

const teacherContext: SecurityContext = {
  userId: 'user_teacher_siti',
  personId: 'per_teacher_siti',
  personName: 'Siti Rahmawati, S.Pd',
  role: 'TEACHER',
  activeSchoolId: 'sch_tk_yapendik_01',
  assignedClasses: ['cls_tka_01'],
  guardianChildrenPersonIds: [],
  isSuperAdmin: false
};

const crossSchoolTeacherContext: SecurityContext = {
  userId: 'user_teacher_diana_tk2',
  personId: 'per_teacher_diana',
  personName: 'Diana Sari, S.Pd',
  role: 'TEACHER',
  activeSchoolId: 'sch_tk_yapendik_02',
  assignedClasses: ['cls_tka_02'],
  guardianChildrenPersonIds: [],
  isSuperAdmin: false
};

const guardianContext: SecurityContext = {
  userId: 'user_parent_budi',
  personId: 'per_parent_budi',
  personName: 'Budi Santoso, S.T.',
  role: 'GUARDIAN',
  activeSchoolId: 'sch_tk_yapendik_01',
  assignedClasses: [],
  guardianChildrenPersonIds: ['per_child_kenzo'],
  isSuperAdmin: false
};

const headmasterContext: SecurityContext = {
  userId: 'user_headmaster_esther',
  personId: 'per_headmaster_esther',
  personName: 'Dra. Esther Nugroho, M.Pd',
  role: 'HEADMASTER',
  activeSchoolId: 'sch_tk_yapendik_01',
  assignedClasses: ['cls_tka_01', 'cls_tkb_01'],
  guardianChildrenPersonIds: [],
  isSuperAdmin: false
};

test('Teacher can view and create observations for own assigned class (cls_tka_01)', () => {
  const auth = evaluateAuthorization({
    context: teacherContext,
    action: 'CREATE',
    resource: 'STUDENT_OBSERVATION',
    resourceSchoolId: 'sch_tk_yapendik_01',
    targetClassId: 'cls_tka_01'
  });
  expect(auth.granted).toBe(true);
});

test('Teacher cannot create observation in unassigned class (cls_tkb_01)', () => {
  const auth = evaluateAuthorization({
    context: teacherContext,
    action: 'CREATE',
    resource: 'STUDENT_OBSERVATION',
    resourceSchoolId: 'sch_tk_yapendik_01',
    targetClassId: 'cls_tkb_01'
  });
  expect(auth.granted).toBe(false);
});

test('Cross-school teacher from TK 02 is blocked from accessing TK 01 records', () => {
  const auth = evaluateAuthorization({
    context: crossSchoolTeacherContext,
    action: 'VIEW',
    resource: 'STUDENT_OBSERVATION',
    resourceSchoolId: 'sch_tk_yapendik_01',
    targetClassId: 'cls_tka_01'
  });
  expect(auth.granted).toBe(false);
});

test('Guardian can view shared non-confidential observations of own child', () => {
  const auth = evaluateAuthorization({
    context: guardianContext,
    action: 'VIEW',
    resource: 'STUDENT_OBSERVATION',
    resourceSchoolId: 'sch_tk_yapendik_01',
    targetStudentPersonId: 'per_child_kenzo',
    isConfidential: false
  });
  expect(auth.granted).toBe(true);
});

test('Guardian is strictly forbidden from viewing staff-confidential observations of own child', () => {
  const auth = evaluateAuthorization({
    context: guardianContext,
    action: 'VIEW',
    resource: 'STUDENT_OBSERVATION',
    resourceSchoolId: 'sch_tk_yapendik_01',
    targetStudentPersonId: 'per_child_kenzo',
    isConfidential: true
  });
  expect(auth.granted).toBe(false);
});

test('Guardian is strictly forbidden from viewing observations of other children', () => {
  const auth = evaluateAuthorization({
    context: guardianContext,
    action: 'VIEW',
    resource: 'STUDENT_OBSERVATION',
    resourceSchoolId: 'sch_tk_yapendik_01',
    targetStudentPersonId: 'per_child_clara',
    isConfidential: false
  });
  expect(auth.granted).toBe(false);
});

test('Headmaster has authorization to approve LPPA development reports', () => {
  const auth = evaluateAuthorization({
    context: headmasterContext,
    action: 'APPROVE',
    resource: 'STUDENT_DEVELOPMENT',
    resourceSchoolId: 'sch_tk_yapendik_01'
  });
  expect(auth.granted).toBe(true);
});

test('Teacher is forbidden from approving LPPA development reports', () => {
  const auth = evaluateAuthorization({
    context: teacherContext,
    action: 'APPROVE',
    resource: 'STUDENT_DEVELOPMENT',
    resourceSchoolId: 'sch_tk_yapendik_01'
  });
  expect(auth.granted).toBe(false);
});

// -----------------------------------------------------------------------------
// MODULE 3: CACHE NAMESPACING & SESSION PURGING (SEC-01)
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 3: Storage Cache Lifecycle & Complete Session Purge ---');

test('Cache keys are strictly isolated by User ID and School ID', () => {
  db.setContextScope('user_teacher_siti', 'sch_tk_yapendik_01');
  const initialKeys = Object.keys((globalThis as any).__memStore);
  expect(initialKeys.some(k => k.includes('u_user_teacher_siti_s_sch_tk_yapendik_01_'))).toBe(true);
});

test('purgeAllSessionCache completely clears all cached data from memory and storage', () => {
  (globalThis as any).__memStore['yapendik_os_v2_u_test_s_sch1_students'] = 'sensitive_data';
  (globalThis as any).__memStore['yapendik_os_v2_u_test_s_sch1_observations'] = 'sensitive_obs';
  
  db.purgeAllSessionCache();
  
  const remainingKeys = Object.keys((globalThis as any).__memStore);
  expect(remainingKeys.length).toBe(0);
});

// -----------------------------------------------------------------------------
// MODULE 4: SERVER-SIDE PRIVACY PROJECTIONS (SEC-07)
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 4: Server-Side Privacy Projections & Query Filters ---');

test('getObservations with isGuardian: true filters out all staff-confidential observations', () => {
  db.resetToDefaults();
  
  // Add a confidential observation
  db.addObservation({
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_kenzo_01',
    observerPersonId: 'per_teacher_siti',
    observedAt: new Date().toISOString(),
    domain: 'SOSIAL_EMOSIONAL',
    anecdoteDescription: 'Catatan internal psikolog sekolah',
    milestoneRating: 'MB',
    indicatorsObserved: [],
    isConfidentialToStaff: true,
    sharedWithGuardian: false
  }, 'Siti', 'user_teacher_siti', 'TEACHER');

  const staffObs = db.getObservations('sch_tk_yapendik_01', 'cls_tka_01', 'stu_kenzo_01', false);
  const guardianObs = db.getObservations('sch_tk_yapendik_01', 'cls_tka_01', 'stu_kenzo_01', true);

  expect(staffObs.some(o => o.isConfidentialToStaff)).toBe(true);
  expect(guardianObs.some(o => o.isConfidentialToStaff)).toBe(false);
});

test('getChildrenForGuardian returns only children linked via GuardianRelationship', () => {
  const children = db.getChildrenForGuardian('per_parent_budi');
  expect(children.length).toBeGreaterThanOrEqual(1);
  children.forEach(c => {
    expect(c.relation.guardianPersonId).toBe('per_parent_budi');
  });
});

// -----------------------------------------------------------------------------
// MODULE 5: ATTENDANCE DETERMINISTIC IDENTITY & IDEMPOTENCY (SEC-08)
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 5: Attendance Deterministic Identity & Idempotency ---');

test('Attendance batch save produces deterministic primary keys', () => {
  db.saveAttendanceBatch([
    {
      schoolId: 'sch_tk_yapendik_01',
      classId: 'cls_tka_01',
      studentId: 'stu_kenzo_01',
      date: '2026-08-25',
      status: 'HADIR',
      recordedByPersonId: 'per_teacher_siti'
    }
  ], 'Siti', 'user_teacher_siti', 'TEACHER');

  const records = db.getAttendance('sch_tk_yapendik_01', '2026-08-25', 'cls_tka_01');
  const record = records.find(r => r.studentId === 'stu_kenzo_01');
  expect(record?.id).toBe('att_sch_tk_yapendik_01_cls_tka_01_stu_kenzo_01_2026-08-25');
});

test('Re-submitting attendance for same class and date updates in-place without duplicating rows', () => {
  db.saveAttendanceBatch([
    {
      schoolId: 'sch_tk_yapendik_01',
      classId: 'cls_tka_01',
      studentId: 'stu_kenzo_01',
      date: '2026-08-25',
      status: 'HADIR',
      recordedByPersonId: 'per_teacher_siti'
    }
  ], 'Siti', 'user_teacher_siti', 'TEACHER');

  const countBefore = db.getAttendance('sch_tk_yapendik_01', '2026-08-25', 'cls_tka_01').length;

  // Update with SAKIT
  db.saveAttendanceBatch([
    {
      schoolId: 'sch_tk_yapendik_01',
      classId: 'cls_tka_01',
      studentId: 'stu_kenzo_01',
      date: '2026-08-25',
      status: 'SAKIT',
      recordedByPersonId: 'per_teacher_siti'
    }
  ], 'Siti', 'user_teacher_siti', 'TEACHER');

  const recordsAfter = db.getAttendance('sch_tk_yapendik_01', '2026-08-25', 'cls_tka_01');
  expect(recordsAfter.length).toBe(countBefore);
  const updated = recordsAfter.find(r => r.studentId === 'stu_kenzo_01');
  expect(updated?.status).toBe('SAKIT');
});

// -----------------------------------------------------------------------------
// MODULE 6: LPPA REPORT STATE MACHINE & RPC WORKFLOW (SEC-06)
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 6: LPPA Progress Report State Machine & Immutability ---');

test('Progress report transitions legally through DRAFT -> READY_FOR_REVIEW -> APPROVED -> PUBLISHED', async () => {
  const reportId = 'rep_test_integration_001';
  
  // 1. Save Draft
  const saveRes = await db.saveProgressReportDraft({
    id: reportId,
    schoolId: 'sch_tk_yapendik_01',
    studentId: 'stu_kenzo_01',
    academicYearId: 'ay_2026_2027_ganjil',
    semester: 'GANJIL',
    evaluatedByPersonId: 'per_teacher_siti',
    evaluatedAt: new Date().toISOString(),
    summaryNotes: [],
    physicalHealthNotes: { heightCm: 105, weightKg: 17, visionHearingHealth: 'Normal' },
    attendanceSummary: { hadir: 20, sakit: 0, izin: 0, alpa: 0 },
    homeroomFeedback: 'Ananda aktif dan mandiri.',
    status: 'DRAFT'
  });
  expect(saveRes.success).toBe(true);
  expect(db.getProgressReport('stu_kenzo_01')?.status).toBe('DRAFT');

  // 2. Submit for Review
  const submitRes = await db.submitReportForReview(reportId);
  expect(submitRes.success).toBe(true);
  expect(db.getProgressReport('stu_kenzo_01')?.status).toBe('READY_FOR_REVIEW');

  // 3. Headmaster Approval
  const approveRes = await db.approveProgressReport(reportId, 'Disahkan oleh Kepala Sekolah Esther.');
  expect(approveRes.success).toBe(true);
  const approved = db.getProgressReport('stu_kenzo_01');
  expect(approved?.status).toBe('APPROVED');
  expect(approved?.headmasterApprovalDate).toBeTruthy();

  // 4. Publish Report
  const pubRes = await db.publishProgressReport(reportId);
  expect(pubRes.success).toBe(true);
  expect(db.getProgressReport('stu_kenzo_01')?.status).toBe('PUBLISHED');
});

// -----------------------------------------------------------------------------
// MODULE 7: AUDIT LOG EVENT GENERATION (SEC-05)
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 7: Governed Audit Trail Event Recording ---');

test('recordAudit writes structured immutable log entry into audit trail', () => {
  db.recordAudit({
    schoolId: 'sch_tk_yapendik_01',
    userId: 'user_headmaster_esther',
    personName: 'Dra. Esther Nugroho',
    role: 'HEADMASTER',
    action: 'APPROVE_DEVELOPMENT_REPORT',
    resource: 'STUDENT_DEVELOPMENT',
    resourceId: 'rep_test_integration_001',
    details: 'Pengesahan LPPA Semester Ganjil 2026/2027'
  });

  const logs = db.getAuditLogs('sch_tk_yapendik_01');
  expect(logs.length).toBeGreaterThanOrEqual(1);
  const latest = logs[0];
  expect(latest.action).toBe('APPROVE_DEVELOPMENT_REPORT');
  expect(latest.role).toBe('HEADMASTER');
  expect(latest.userId).toBe('user_headmaster_esther');
});

// -----------------------------------------------------------------------------
// SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`🏁 RUNTIME TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
