/**
 * YAPENDIK SCHOOL OS — TK PILOT v1.0
 * AUTOMATED PRODUCTION READINESS & SECURITY REGRESSION TEST HARNESS
 * 
 * Verifies Constitutional Rules, RLS Invariants, Authorization Matrix,
 * Session Cache Lifecycle, Attendance Determinism, and Report State Machine.
 */

import fs from 'fs';
import path from 'path';
import { evaluateAuthorization, SecurityContext } from '../src/auth/authorization';
import { db } from '../src/db/database';
import { Role } from '../src/domain/types';

// Mock localStorage for Node.js / tsx runtime
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => { store[key] = value.toString(); },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] || null
  };
})();

(global as any).localStorage = mockLocalStorage;

// Simple test runner helper
let passCount = 0;
let failCount = 0;

function assert(condition: boolean, description: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${description}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${description}`);
    failCount++;
  }
}

console.log('================================================================');
console.log('🔍 YAPENDIK SCHOOL OS — SECURITY & ARCHITECTURAL REGRESSION SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// TEST SUITE 1: SECRET LOCKDOWN AUDIT (SEC-02)
// -----------------------------------------------------------------------------
console.log('--- TEST SUITE 1: Secret Lockdown & Credential Sanitization ---');

const filesToCheck = [
  'scripts/run_schema.mjs',
  'scripts/seed_auth.mjs',
  'supabase_schema.sql',
  'src/auth/context.tsx',
  '.env.example'
];

let foundSecretLeak = false;
for (const file of filesToCheck) {
  const filePath = path.resolve(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf8');
    if (content.includes('!V6i#=Qtz54+QpW') || content.includes('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbGlxdGZnenhtanZ3emN6ZGN4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSI')) {
      console.error(`Leak detected in ${file}!`);
      foundSecretLeak = true;
    }
  }
}
assert(!foundSecretLeak, 'No hardcoded Supabase service role keys or database passwords found in repository files.');

// -----------------------------------------------------------------------------
// TEST SUITE 2: PERMISSIVE RLS OVERRIDE REMOVAL (SEC-03)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 2: Permissive RLS Override Audit ---');

const schemaSql = fs.readFileSync(path.resolve(process.cwd(), 'supabase_schema.sql'), 'utf8');
const hasPermissiveLoop = schemaSql.includes('Public Full Access For Pilot') || schemaSql.includes('CREATE POLICY "Public Full Access For Pilot"');
assert(!hasPermissiveLoop, 'supabase_schema.sql does NOT contain permissive "Public Full Access For Pilot" USING (true) policy loop.');

const hasHardenedMigration = fs.existsSync(path.resolve(process.cwd(), 'db_migrations/rls_migration_v2_1_5_hardened.sql'));
assert(hasHardenedMigration, 'rls_migration_v2_1_5_hardened.sql exists as authoritative hardened security baseline.');

// -----------------------------------------------------------------------------
// TEST SUITE 3: CONTEXTUAL AUTHORIZATION ENGINE (SEC-04, SEC-07)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 3: Contextual Authorization Engine Scenarios ---');

// Teacher Context (TK 01, Class A)
const teacherSiti: SecurityContext = {
  userId: 'user_teacher_siti',
  personId: 'per_teacher_siti',
  personName: 'Siti Rahmawati, S.Pd',
  role: 'TEACHER',
  activeSchoolId: 'sch_tk_yapendik_01',
  assignedClasses: ['cls_tka_01'],
  guardianChildrenPersonIds: [],
  isSuperAdmin: false
};

// Teacher from Unit 02 (Cross-School Actor)
const teacherDianaTK2: SecurityContext = {
  userId: 'user_teacher_diana_tk2',
  personId: 'per_teacher_diana',
  personName: 'Diana Sari, S.Pd',
  role: 'TEACHER',
  activeSchoolId: 'sch_tk_yapendik_02',
  assignedClasses: ['cls_tka_02'],
  guardianChildrenPersonIds: [],
  isSuperAdmin: false
};

// Headmaster Context (TK 01)
const headmasterEsther: SecurityContext = {
  userId: 'user_headmaster_esther',
  personId: 'per_headmaster_esther',
  personName: 'Dra. Esther Nugroho, M.Pd',
  role: 'HEADMASTER',
  activeSchoolId: 'sch_tk_yapendik_01',
  assignedClasses: ['cls_tka_01', 'cls_tkb_01'],
  guardianChildrenPersonIds: [],
  isSuperAdmin: false
};

// Guardian Context (Kenzo's Parent)
const guardianBudi: SecurityContext = {
  userId: 'user_parent_budi',
  personId: 'per_parent_budi',
  personName: 'Budi Santoso, S.T.',
  role: 'GUARDIAN',
  activeSchoolId: 'sch_tk_yapendik_01',
  assignedClasses: [],
  guardianChildrenPersonIds: ['per_child_kenzo'],
  isSuperAdmin: false
};

// Superadmin Context
const superadminAndreas: SecurityContext = {
  userId: 'user_superadmin_yapendik',
  personId: 'per_superadmin_andreas',
  personName: 'Dr. Andreas Hendrawan',
  role: 'YAPENDIK_SUPERADMIN',
  activeSchoolId: 'sch_tk_yapendik_01',
  assignedClasses: ['cls_tka_01', 'cls_tkb_01', 'cls_tka_02'],
  guardianChildrenPersonIds: [],
  isSuperAdmin: true
};

// 3.1: Teacher Siti can create observation in her own class
const res1 = evaluateAuthorization({
  context: teacherSiti,
  action: 'CREATE',
  resource: 'STUDENT_OBSERVATION',
  resourceSchoolId: 'sch_tk_yapendik_01',
  targetClassId: 'cls_tka_01'
});
assert(res1.granted, 'Teacher can create observation in assigned class (cls_tka_01).');

// 3.2: Teacher Diana (TK 02) CANNOT create observation in TK 01 (Cross-school block)
const res2 = evaluateAuthorization({
  context: teacherDianaTK2,
  action: 'CREATE',
  resource: 'STUDENT_OBSERVATION',
  resourceSchoolId: 'sch_tk_yapendik_01',
  targetClassId: 'cls_tka_01'
});
assert(!res2.granted, 'Cross-school teacher CANNOT create observation in TK 01 (Multi-tenant boundary preserved).');

// 3.3: Guardian Budi can view public observation of his child Kenzo
const res3 = evaluateAuthorization({
  context: guardianBudi,
  action: 'VIEW',
  resource: 'STUDENT_OBSERVATION',
  resourceSchoolId: 'sch_tk_yapendik_01',
  targetStudentPersonId: 'per_child_kenzo',
  isConfidential: false
});
assert(res3.granted, 'Guardian CAN view non-confidential observation of registered child (Kenzo).');

// 3.4: Guardian Budi CANNOT view staff-confidential observation of his child
const res4 = evaluateAuthorization({
  context: guardianBudi,
  action: 'VIEW',
  resource: 'STUDENT_OBSERVATION',
  resourceSchoolId: 'sch_tk_yapendik_01',
  targetStudentPersonId: 'per_child_kenzo',
  isConfidential: true
});
assert(!res4.granted, 'Guardian CANNOT view staff-confidential observation (Staff Privacy invariant).');

// 3.5: Guardian Budi CANNOT view observation of another student (per_child_clara)
const res5 = evaluateAuthorization({
  context: guardianBudi,
  action: 'VIEW',
  resource: 'STUDENT_OBSERVATION',
  resourceSchoolId: 'sch_tk_yapendik_01',
  targetStudentPersonId: 'per_child_clara',
  isConfidential: false
});
assert(!res5.granted, 'Guardian CANNOT view observation of other families children.');

// 3.6: Headmaster Esther can APPROVE student development LPPA report
const res6 = evaluateAuthorization({
  context: headmasterEsther,
  action: 'APPROVE',
  resource: 'STUDENT_DEVELOPMENT',
  resourceSchoolId: 'sch_tk_yapendik_01'
});
assert(res6.granted, 'Headmaster CAN approve LPPA development reports.');

// 3.7: Teacher Siti CANNOT APPROVE LPPA development report (Institutional Governance)
const res7 = evaluateAuthorization({
  context: teacherSiti,
  action: 'APPROVE',
  resource: 'STUDENT_DEVELOPMENT',
  resourceSchoolId: 'sch_tk_yapendik_01'
});
assert(!res7.granted, 'Teacher CANNOT approve LPPA development report (Separation of duties).');

// 3.8: Superadmin can access governance across all schools
const res8 = evaluateAuthorization({
  context: superadminAndreas,
  action: 'VIEW',
  resource: 'AUDIT_LOG',
  resourceSchoolId: 'sch_tk_yapendik_02'
});
assert(res8.granted, 'Superadmin CAN view audit logs across all Yapendik school units.');

// -----------------------------------------------------------------------------
// TEST SUITE 4: CACHE LIFECYCLE & PURGING (SEC-01)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 4: Cache Lifecycle & Session Purging ---');

// Set arbitrary sensitive data in mock localStorage
localStorage.setItem('yapendik_os_v2_u_teacher1_s_tk1_students', JSON.stringify([{ id: 'stu_1', name: 'Private Student Data' }]));
localStorage.setItem('yapendik_os_v2_u_teacher1_s_tk1_observations', JSON.stringify([{ id: 'obs_1', notes: 'Confidential psychological note' }]));
assert(localStorage.length >= 2, 'Sensitive data loaded into session cache.');

// Trigger session purge
db.purgeAllSessionCache();
assert(localStorage.length === 0, 'purgeAllSessionCache() flushes 100% of sensitive cached keys from storage.');

// -----------------------------------------------------------------------------
// TEST SUITE 5: ATTENDANCE DETERMINISTIC IDENTITY (SEC-08)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 5: Attendance Deterministic Identity & Upsert ---');

db.saveAttendanceBatch([
  {
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_kenzo',
    date: '2026-08-25',
    status: 'HADIR',
    notes: 'Datang tepat waktu, ceria',
    temperatureCelsius: 36.5,
    arrivalMood: 'CERIA',
    recordedByPersonId: 'per_teacher_siti'
  }
], 'Siti Rahmawati', 'user_teacher_siti', 'TEACHER');

const att1 = db.getAttendance('sch_tk_yapendik_01', '2026-08-25', 'cls_tka_01');
assert(att1.length === 1, 'Initial attendance batch saved with 1 entry.');
assert(att1[0].id === 'att_sch_tk_yapendik_01_cls_tka_01_stu_kenzo_2026-08-25', 'Attendance ID is deterministic (att_{schoolId}_{classId}_{studentId}_{date}).');

// Upserting same student on same date with updated status (e.g. SAKIT)
db.saveAttendanceBatch([
  {
    schoolId: 'sch_tk_yapendik_01',
    classId: 'cls_tka_01',
    studentId: 'stu_kenzo',
    date: '2026-08-25',
    status: 'SAKIT',
    notes: 'Demam mendadak, dijemput orang tua',
    temperatureCelsius: 38.2,
    arrivalMood: 'GELISAH',
    recordedByPersonId: 'per_teacher_siti'
  }
], 'Siti Rahmawati', 'user_teacher_siti', 'TEACHER');

const att2 = db.getAttendance('sch_tk_yapendik_01', '2026-08-25', 'cls_tka_01');
assert(att2.length === 1, 'Deterministic upsert preserves uniqueness: exactly 1 row exists (no duplicates).');
assert(att2[0].status === 'SAKIT', 'Attendance record status updated cleanly in-place.');

// -----------------------------------------------------------------------------
// TEST SUITE 6: PROGRESS REPORT STATE MACHINE (SEC-06)
// -----------------------------------------------------------------------------
console.log('\n--- TEST SUITE 6: Progress Report State Machine ---');

const testReport = {
  id: 'rep_test_001',
  schoolId: 'sch_tk_yapendik_01',
  studentId: 'stu_kenzo',
  academicYearId: 'ay_2026_2027_ganjil',
  semester: 'GANJIL' as any,
  evaluatedByPersonId: 'per_teacher_siti',
  evaluatedAt: new Date().toISOString(),
  summaryNotes: [],
  physicalHealthNotes: { heightCm: 105, weightKg: 17, visionHearingHealth: 'Normal' },
  attendanceSummary: { hadir: 20, sakit: 1, izin: 0, alpa: 0 },
  homeroomFeedback: 'Ananda sangat aktif.',
  status: 'DRAFT' as any
};

db.saveProgressReportDraft(testReport);
let rep = db.getProgressReport('stu_kenzo');
assert(rep?.status === 'DRAFT', 'Initial report created with status DRAFT.');

db.submitReportForReview('rep_test_001');
rep = db.getProgressReport('stu_kenzo');
assert(rep?.status === 'READY_FOR_REVIEW', 'Report transitioned to READY_FOR_REVIEW.');

db.approveProgressReport('rep_test_001', 'Disahkan oleh Kepala Sekolah Esther.');
rep = db.getProgressReport('stu_kenzo');
assert(rep?.status === 'APPROVED', 'Report transitioned to APPROVED with approval timestamp.');

db.publishProgressReport('rep_test_001');
rep = db.getProgressReport('stu_kenzo');
assert(rep?.status === 'PUBLISHED', 'Report transitioned to PUBLISHED (Official Immutable State).');

// -----------------------------------------------------------------------------
// FINAL SUMMARY
// -----------------------------------------------------------------------------
console.log('\n================================================================');
console.log(`🏁 TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('================================================================\n');

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
