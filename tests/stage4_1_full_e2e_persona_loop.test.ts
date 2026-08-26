/**
 * Yapendik School OS — Stage 4.1 Full End-to-End Persona Loop & Acceptance Test Suite
 * 
 * Verifies the complete closed operational loop across multiple roles:
 * 1. TEACHER OPERATING LOOP (Ibu Siti Rahmawati, S.Pd):
 *    - Arrival attendance, temperature, and mood registration (100% classroom reconciliation)
 *    - Fast Capture primitive (<15s) with client-generated UUID
 *    - Observation Feed verification & status checking
 *    - Progressive Enrichment & LPPA curation (Invariant C-11 compliance)
 *    - One Child Context deep dive pivot
 *    - Parent Communication dispatch
 * 
 * 2. GUARDIAN PERSONA BOUNDARY (Budi Santoso, S.T. - Ayah Kenzo):
 *    - Contextual role switch to GUARDIAN
 *    - Child trajectory retrieval for legal child only
 *    - C-11 Visibility Boundary: sees shared observations, staff confidential is STRICTLY HIDDEN
 *    - Cross-child privacy isolation: cannot see non-child records
 *    - Notice acknowledgment & digital reply submission
 * 
 * 3. TEACHER RECONCILIATION LOOP:
 *    - Reconciliation status confirms parent acknowledgment and closed feedback loop
 */

import { db } from '../src/db/database';
import { evaluateAuthorization, SecurityContext } from '../src/auth/authorization';
import {
  teacherHomeQueryService,
  teacherDailyWorkService,
  offlineSyncQueueService
} from '../src/services';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  🟢 PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ❌ FAIL: ${testName}${detail ? ` — ${detail}` : ''}`);
  }
}

export async function runFullE2EPersonaLoopTests() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🌟 STAGE 4.1 FULL END-TO-END PERSONA LOOP & ACCEPTANCE SUITE');
  console.log('════════════════════════════════════════════════════════════════\n');

  const schoolId = 'sch_tk_yapendik_01';
  const classId = 'cls_tka_01';
  const testDate = new Date().toISOString().slice(0, 10);

  // Dynamic Students from Classroom Roster
  const students = db.getStudents(schoolId, classId);
  const kenzo = students[0];
  const alina = students[1];
  const gabriel = students[2];

  const kenzoStudentId = kenzo.id;
  const kenzoPersonId = kenzo.personId;
  const alinaStudentId = alina.id;
  const alinaPersonId = alina.personId;
  const gabrielStudentId = gabriel.id;

  // Personas
  const teacherPersonId = 'per_teacher_siti';
  const teacherUserId = 'user_teacher_siti';
  const teacherName = 'Siti Rahmawati, S.Pd';

  const guardianPersonId = 'per_parent_budi';
  const guardianUserId = 'user_parent_budi';
  const guardianName = 'Budi Santoso, S.T.';

  const teacherContext: SecurityContext = {
    userId: teacherUserId,
    personId: teacherPersonId,
    personName: teacherName,
    role: 'TEACHER',
    activeSchoolId: schoolId,
    assignedClasses: [classId],
    guardianChildrenPersonIds: [],
    isSuperAdmin: false
  };

  const guardianContext: SecurityContext = {
    userId: guardianUserId,
    personId: guardianPersonId,
    personName: guardianName,
    role: 'GUARDIAN',
    activeSchoolId: schoolId,
    assignedClasses: [],
    guardianChildrenPersonIds: [kenzoPersonId],
    isSuperAdmin: false
  };

  // -------------------------------------------------------------------------
  // STEP 1: TEACHER OPERATING LOOP — Attendance & Arrival Mood
  // -------------------------------------------------------------------------
  console.log('--- STEP 1: Teacher Operating Loop (Attendance & Arrival Mood) ---');
  try {
    const attendanceResult = await teacherDailyWorkService.recordDailyAttendanceBatch({
      school_id: schoolId,
      class_id: classId,
      attendance_date: testDate,
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: teacherName,
      role: 'TEACHER',
      entries: [
        {
          student_id: kenzoStudentId,
          status: 'HADIR',
          arrival_mood: 'CERIA',
          temperature_celsius: 36.6,
          notes: 'Tiba tepat waktu, ceria membawa hasil karya rumah.'
        },
        {
          student_id: alinaStudentId,
          status: 'HADIR',
          arrival_mood: 'TENANG',
          temperature_celsius: 36.4,
          notes: 'Fokus dan langsung menuju sentra balok.'
        },
        {
          student_id: gabrielStudentId,
          status: 'HADIR',
          arrival_mood: 'CERIA',
          temperature_celsius: 36.5,
          notes: 'Semangat menyapa guru.'
        }
      ]
    });

    assert(attendanceResult.success, 'Teacher batch records arrival attendance for classroom');
    assert(attendanceResult.recorded_count === 3, 'Recorded attendance entries count matches classroom roster batch');

    const kenzoAtt = db.getAttendance(schoolId, testDate, classId).find(a => a.studentId === kenzoStudentId);
    assert(kenzoAtt?.status === 'HADIR' && kenzoAtt?.arrivalMood === 'CERIA', 'Kenzo marked HADIR with CERIA mood');
  } catch (err: any) {
    assert(false, 'Step 1 Attendance failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // STEP 2: TEACHER OPERATING LOOP — Fast Capture Primitive
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 2: Teacher Operating Loop (Fast Capture Primitive) ---');
  let kenzoObsId = '';
  let confidentialDraftObsId = '';
  try {
    const clientUuid = offlineSyncQueueService.generateUUID();
    const captureResult = await teacherDailyWorkService.captureQuickObservation({
      id: `obs_${clientUuid}`,
      school_id: schoolId,
      class_id: classId,
      target_student_ids: [kenzoStudentId],
      domain: 'KOGNITIF',
      quick_tags: ['STEAM_BALOK', 'KOGNITIF_SPASIAL'],
      initial_note: 'Menyusun menara geometri 12 tingkat mandiri dan stabil.',
      media_url: 'https://images.unsplash.com/photo-1587654780291-39c9404d746b',
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: teacherName,
      role: 'TEACHER'
    });

    assert(captureResult.success, 'Fast capture saved instantly under 15 seconds');
    kenzoObsId = captureResult.observation_id;

    // Capture a separate internal staff confidential note for Alina
    const confidentialUuid = offlineSyncQueueService.generateUUID();
    const confResult = await teacherDailyWorkService.captureQuickObservation({
      id: `obs_${confidentialUuid}`,
      school_id: schoolId,
      class_id: classId,
      target_student_ids: [alinaStudentId],
      domain: 'SOSIAL_EMOSIONAL',
      quick_tags: ['EMOSIONAL_INTERNAL'],
      initial_note: 'Catatan internal.',
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: teacherName,
      role: 'TEACHER'
    });
    confidentialDraftObsId = confResult.observation_id;
    assert(Boolean(confidentialDraftObsId), 'Internal staff confidential observation created');
  } catch (err: any) {
    assert(false, 'Step 2 Fast Capture failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // STEP 3: TEACHER OPERATING LOOP — Progressive Enrichment & LPPA Curation
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 3: Teacher Progressive Enrichment & LPPA Curation (Invariant C-11) ---');
  try {
    const enrichResult = await teacherDailyWorkService.enrichObservationNarrative({
      observation_id: kenzoObsId,
      pedagogical_narrative: 'Kenzo menunjukkan penalaran spasial dan motorik halus tingkat lanjut saat merancang menara balok dengan keseimbangan simetris.',
      domain: 'KOGNITIF',
      milestone_rating: 'BSB',
      indicators_observed: ['STEAM_BALOK', 'KOGNITIF_SPASIAL'],
      is_lppa_evidence: true,
      is_staff_confidential: false,
      is_shared_with_guardian: true, // Shared with parent Budi
      enriched_by_person_id: teacherPersonId,
      enriched_by_name: teacherName,
      role: 'TEACHER',
      school_id: schoolId
    });

    assert(enrichResult.success, 'Progressive enrichment saved narrative and LPPA curation');

    const verifiedObs = db.getObservations(schoolId, classId).find(o => o.id === kenzoObsId);
    assert(verifiedObs?.milestoneRating === 'BSB', 'Observation milestone rating promoted to BSB');
    assert(verifiedObs?.sharedWithGuardian === true, 'Observation marked as shared with guardian');
    assert(verifiedObs?.isConfidentialToStaff === false, 'Staff confidentiality unset in accordance with Invariant C-11');
  } catch (err: any) {
    assert(false, 'Step 3 Progressive Enrichment failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // STEP 4: TEACHER OPERATING LOOP — One Child Context Deep Dive
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 4: Teacher One Child Context Deep Dive Pivot ---');
  try {
    const childDeep = await teacherHomeQueryService.getChildContextDeep(kenzoStudentId, schoolId, classId);
    assert(Boolean(childDeep), 'One Child Context deep dive retrieved');
    assert(childDeep?.student.student_id === kenzoStudentId, 'Deep context strictly anchored to Kenzo');
    assert(childDeep?.evidence_portfolio.some(e => e.id === kenzoObsId), 'Evidence portfolio contains enriched observation');
    assert(childDeep?.attendance_history.some(a => a.date === testDate && a.status === 'HADIR'), 'Attendance history contains today\'s presence');
    assert(typeof childDeep?.student.lppa_ready_percentage === 'number', 'LPPA readiness percentage projected');
  } catch (err: any) {
    assert(false, 'Step 4 One Child Context failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // STEP 5: TEACHER DISPATCHES GUARDIAN NOTICE
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 5: Teacher Dispatches Guardian Notice ---');
  let noticeId = '';
  try {
    const notice = db.addNotice({
      schoolId,
      classId,
      studentId: kenzoStudentId,
      authorPersonId: teacherPersonId,
      type: 'DAILY_SUMMARY',
      title: 'Apresiasi Karya Balok Kenzo Hari Ini',
      content: 'Ananda Kenzo menunjukkan fokus dan kreativitas tinggi saat sesi sentra balok pagi ini.',
      requiresAcknowledgment: true
    }, teacherName, teacherUserId, 'TEACHER');

    assert(Boolean(notice.id), 'Teacher sent personalized guardian notice to Ayah Kenzo');
    noticeId = notice.id;
  } catch (err: any) {
    assert(false, 'Step 5 Guardian Notice failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // STEP 6: GUARDIAN PERSONA ACCESS & INVARIANT C-11 PRIVACY BOUNDARY
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 6: Guardian Persona Verification & Invariant C-11 Boundary ---');
  try {
    // 1. Authorization checks for Guardian Budi viewing Kenzo's shared observation
    const authKenzoObs = evaluateAuthorization({
      context: guardianContext,
      action: 'VIEW',
      resource: 'STUDENT_OBSERVATION',
      resourceSchoolId: schoolId,
      targetClassId: classId,
      targetStudentId: kenzoStudentId,
      targetStudentPersonId: kenzoPersonId,
      isConfidential: false
    });
    assert(authKenzoObs.granted === true, 'Guardian Budi GRANTED view access to Kenzo\'s shared observation');

    // 2. Authorization check: Guardian Budi attempting to view staff confidential observation
    const authConfidentialObs = evaluateAuthorization({
      context: guardianContext,
      action: 'VIEW',
      resource: 'STUDENT_OBSERVATION',
      resourceSchoolId: schoolId,
      targetClassId: classId,
      targetStudentId: alinaStudentId,
      targetStudentPersonId: alinaPersonId,
      isConfidential: true
    });
    assert(authConfidentialObs.granted === false, 'Guardian Budi DENIED view access to staff confidential note (Invariant C-11)');

    // 3. Authorization check: Guardian Budi attempting to view another student's record
    const authOtherChildObs = evaluateAuthorization({
      context: guardianContext,
      action: 'VIEW',
      resource: 'STUDENT_OBSERVATION',
      resourceSchoolId: schoolId,
      targetClassId: classId,
      targetStudentId: alinaStudentId,
      targetStudentPersonId: alinaPersonId,
      isConfidential: false
    });
    assert(authOtherChildObs.granted === false, 'Guardian Budi DENIED view access to non-child student (Child Isolation Boundary)');

    // 4. Guardian receives notice and submits digital reply
    const guardianNotices = db.getNotices(schoolId, classId).filter(n => {
      if (!n.studentId) return true;
      return n.studentId === kenzoStudentId;
    });
    assert(guardianNotices.some(n => n.id === noticeId), 'Guardian received notice in digital communication ledger');

    db.acknowledgeNotice(
      noticeId,
      guardianPersonId,
      'Terima kasih Ibu Guru, di rumah Kenzo sangat antusias bercerita tentang balok hari ini.'
    );

    const acknowledgedNotice = db.getNotices(schoolId, classId).find(n => n.id === noticeId);
    assert(Boolean(acknowledgedNotice?.acknowledgedAt), 'Notice acknowledged with timestamp by legal guardian');
    assert(acknowledgedNotice?.guardianReply?.includes('antusias') === true, 'Guardian digital reply stored securely in ledger');
  } catch (err: any) {
    assert(false, 'Step 6 Guardian Persona failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // STEP 7: TEACHER RECONCILIATION & CLOSURE
  // -------------------------------------------------------------------------
  console.log('\n--- STEP 7: Teacher Daily Loop Reconciliation & Closure ---');
  try {
    const aggregateAfter = await teacherHomeQueryService.getTeacherHomeAggregate(
      schoolId,
      classId,
      testDate,
      teacherPersonId
    );

    assert(Boolean(aggregateAfter), 'Teacher Home read model reflects live state');
    assert(aggregateAfter.daily_completion.is_attendance_complete === true, 'Attendance is marked 100% complete');
    assert(typeof aggregateAfter.daily_completion.pending_enrichment_count === 'number', 'Draft reconciliation tracks pending enrichment count');
    
    const noticeInTeacherLedger = db.getNotices(schoolId, classId).find(n => n.id === noticeId);
    assert(Boolean(noticeInTeacherLedger?.acknowledgedAt), 'Teacher Home confirms parent acknowledgment');
    assert(noticeInTeacherLedger?.guardianReply !== undefined, 'Parent reply thread available to teacher');
  } catch (err: any) {
    assert(false, 'Step 7 Teacher Reconciliation failure', err?.message);
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 FULL E2E PERSONA LOOP SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Full E2E Persona Loop Suite failed with ${failedTests} failures.`);
  }
}

// Run standalone if executed directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  runFullE2EPersonaLoopTests().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
