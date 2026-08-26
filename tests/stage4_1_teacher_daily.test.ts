/**
 * Yapendik School OS — Stage 4.1 Teacher Daily Work & Operating Loop Test Suite
 * Automated verification of:
 * 1. Unified Read Model (teacherHomeQueryService)
 * 2. Application Commands & Closed Period Protection (teacherDailyWorkService)
 * 3. Invariant C-11 Mutual Exclusivity Guard
 * 4. Client-side UUID v4 & Fast Capture Primitive
 * 5. Offline Queue & Deterministic Auto-Drain
 */

import { db } from '../src/db/database';
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

export async function runStage41Tests() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 4.1 TEACHER DAILY WORK & OPERATING LOOP TEST SUITE');
  console.log('════════════════════════════════════════════════════════════════\n');

  const schoolId = 'sch_tk_yapendik_01';
  const classId = 'cls_tka_01';
  const testDate = '2026-08-26';
  const teacherPersonId = 'per_teacher_siti';

  // --- MODULE 1: Unified Read Model & Aggregate Projection ---
  console.log('--- MODULE 1: Teacher Home Read Model & Aggregate Projection ---');
  try {
    const aggregate = await teacherHomeQueryService.getTeacherHomeAggregate(
      schoolId,
      classId,
      testDate,
      teacherPersonId
    );

    assert(Boolean(aggregate), 'getTeacherHomeAggregate returns valid payload');
    assert(aggregate.context.school_id === schoolId, 'Active context correctly binds school_id');
    assert(aggregate.context.class_id === classId, 'Active context correctly binds class_id');
    assert(aggregate.context.teacher.person_id === teacherPersonId, 'Active context binds teacher person');
    assert(aggregate.context.is_semester_closed === false, 'Detects active semester status');
    assert(Array.isArray(aggregate.roster) && aggregate.roster.length > 0, 'Roster contains registered students');
    assert(typeof aggregate.pulse.total_students === 'number', 'Pulse contains total_students count');
    assert(typeof aggregate.daily_completion.is_attendance_complete === 'boolean', 'Contains daily_completion stats');

    // Deep dive child context
    const firstStudentId = aggregate.roster[0].student_id;
    const childDeep = await teacherHomeQueryService.getChildContextDeep(firstStudentId, schoolId, classId);
    assert(Boolean(childDeep), 'getChildContextDeep returns valid payload for child');
    assert(childDeep?.student.student_id === firstStudentId, 'Child context is strictly anchored to target student');
    assert(Array.isArray(childDeep?.evidence_portfolio), 'Child context contains evidence portfolio array');
  } catch (err: any) {
    assert(false, 'Module 1 Read Model execution', err?.message);
  }

  // --- MODULE 2: Attendance Batch Command & Idempotency ---
  console.log('\n--- MODULE 2: Attendance Batch Command & Idempotency ---');
  try {
    const students = db.getStudents(schoolId, classId);
    const entries = students.map((st, idx) => ({
      student_id: st.id,
      status: (idx === 1 ? 'SAKIT' : idx === 2 ? 'IZIN' : 'HADIR') as any,
      temperature_celsius: idx === 1 ? 38.2 : 36.5,
      arrival_mood: (idx === 1 ? 'GELISAH' : 'CERIA') as any,
      notes: idx === 1 ? 'Demam pilek sejak subuh' : undefined
    }));

    const result = await teacherDailyWorkService.recordDailyAttendanceBatch({
      school_id: schoolId,
      class_id: classId,
      attendance_date: testDate,
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: 'Ibu Siti',
      role: 'TEACHER',
      entries
    });

    assert(result.success === true, 'recordDailyAttendanceBatch executed successfully');
    assert(result.recorded_count === entries.length, `Recorded attendance for all ${entries.length} students`);

    // Verify idempotent upsert in database
    const saved = db.getAttendance(schoolId, testDate, classId);
    assert(saved.length === entries.length, 'Database has exact attendance record count without duplicates');
    const sickRecord = saved.find(s => s.status === 'SAKIT');
    assert(sickRecord?.temperatureCelsius === 38.2, 'Preserves health temperature metadata');
  } catch (err: any) {
    assert(false, 'Module 2 Attendance execution', err?.message);
  }

  // --- MODULE 3: Quick Capture Primitive & Client UUID ---
  console.log('\n--- MODULE 3: Quick Capture Primitive & Client UUID ---');
  let capturedObsId = '';
  try {
    const clientGeneratedUUID = offlineSyncQueueService.generateUUID();
    assert(typeof clientGeneratedUUID === 'string' && clientGeneratedUUID.length > 20, 'Generates valid client-side UUID v4');

    const captureResult = await teacherDailyWorkService.captureQuickObservation({
      id: `obs_${clientGeneratedUUID}`,
      school_id: schoolId,
      class_id: classId,
      target_student_ids: ['per_child_kenzo'],
      domain: 'KOGNITIF',
      quick_tags: ['STEAM_BALOK', 'KEMANDIRIAN'],
      initial_note: 'Menyusun 12 tingkat balok kayu tanpa jatuh.',
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: 'Ibu Siti',
      role: 'TEACHER'
    });

    assert(captureResult.success === true, 'captureQuickObservation saves quickly');
    assert(captureResult.observation_id.includes(clientGeneratedUUID), 'Saved observation retains client UUID');
    capturedObsId = captureResult.observation_id;

    // Verify stored observation defaults
    const obsList = db.getObservations(schoolId, classId);
    const savedObs = obsList.find(o => o.id === capturedObsId);
    assert(Boolean(savedObs), 'Observation stored in database engine');
    assert(savedObs?.isConfidentialToStaff === true, 'Initial quick capture defaults to confidential staff draft');
    assert(savedObs?.sharedWithGuardian === false, 'Initial capture is not prematurely shared with parent');
  } catch (err: any) {
    assert(false, 'Module 3 Quick Capture execution', err?.message);
  }

  // --- MODULE 4: Progressive Enrichment & Invariant C-11 Guard ---
  console.log('\n--- MODULE 4: Progressive Enrichment & Invariant C-11 Guard ---');
  try {
    // 1. Test Invariant C-11 Guard (Mutual Exclusivity)
    let c11Blocked = false;
    try {
      await teacherDailyWorkService.enrichObservationNarrative({
        observation_id: capturedObsId,
        pedagogical_narrative: 'Narasi lengkap refleksi balok.',
        domain: 'KOGNITIF',
        milestone_rating: 'BSB',
        indicators_observed: ['STEAM_BALOK'],
        is_lppa_evidence: true,
        is_staff_confidential: true, // CONFLICT! Both true
        is_shared_with_guardian: true,
        enriched_by_person_id: teacherPersonId,
        enriched_by_name: 'Ibu Siti',
        role: 'TEACHER',
        school_id: schoolId
      });
    } catch (err: any) {
      if (err.message.includes('VALIDATION_FAILED')) {
        c11Blocked = true;
      }
    }
    assert(c11Blocked, 'Invariant C-11 Guard blocks simultaneous staff_confidential AND shared_with_guardian');

    // 2. Test Valid Enrichment
    const enrichResult = await teacherDailyWorkService.enrichObservationNarrative({
      observation_id: capturedObsId,
      pedagogical_narrative: 'Ananda Kenzo secara mandiri menghitung titik tumpu dan menyusun balok secara simetris.',
      domain: 'KOGNITIF',
      milestone_rating: 'BSB',
      indicators_observed: ['STEAM_BALOK', 'KEMANDIRIAN'],
      is_lppa_evidence: true,
      is_staff_confidential: false,
      is_shared_with_guardian: true, // Governed parent share
      enriched_by_person_id: teacherPersonId,
      enriched_by_name: 'Ibu Siti',
      role: 'TEACHER',
      school_id: schoolId
    });

    assert(enrichResult.success === true, 'Enrichment narrative saved successfully');
    const updatedObs = db.getObservations(schoolId).find(o => o.id === capturedObsId);
    assert(updatedObs?.milestoneRating === 'BSB', 'Updates milestone rating to BSB');
    assert(updatedObs?.sharedWithGuardian === true, 'Sets sharedWithGuardian to true');
  } catch (err: any) {
    assert(false, 'Module 4 Enrichment execution', err?.message);
  }

  // --- MODULE 5: Offline Sync Queue & Auto-Drain ---
  console.log('\n--- MODULE 5: Offline Sync Queue & Auto-Drain ---');
  try {
    offlineSyncQueueService.clear();
    assert(offlineSyncQueueService.getPendingCount() === 0, 'Offline queue initializes empty');

    const queuedItem = offlineSyncQueueService.enqueue('ACK_NOTICE', {
      notice_id: 'notif_01',
      acknowledged_by_person_id: teacherPersonId,
      acknowledged_by_name: 'Ibu Siti',
      teacher_reply_text: 'Obat sudah diminumkan.',
      school_id: schoolId,
      role: 'TEACHER'
    });

    assert(Boolean(queuedItem.queue_id), 'Enqueues item with unique queue_id');
    assert(offlineSyncQueueService.getPendingCount() === 1, 'Pending count increments to 1');

    // Test auto drain replay
    const drainResult = await offlineSyncQueueService.autoDrainQueue(async (item) => {
      return item.command_type === 'ACK_NOTICE';
    });

    assert(drainResult.processed === 1, 'Auto-drain processed the queued item');
    assert(offlineSyncQueueService.getPendingCount() === 0, 'Queue is drained clean after replay');
  } catch (err: any) {
    assert(false, 'Module 5 Offline Queue execution', err?.message);
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 4.1 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Stage 4.1 Test Suite failed with ${failedTests} failures.`);
  }
}

// Run standalone if executed directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  runStage41Tests().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
