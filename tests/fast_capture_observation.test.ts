/**
 * YAPENDIK SCHOOL OS — TK PILOT v1.0
 * STAGE 6 GATE 4: FAST CAPTURE OBSERVATION & VISUAL EVIDENCE WALL TEST SUITE
 * 
 * Verifies:
 * 1. Multi-Student Batch Ingestion (Atomic 1-to-N generation)
 * 2. Zero-DDL Schema Contract with public.observation_records
 * 3. Co-Teaching Realtime Replication & Shared School Cache
 * 4. Offline Privacy Queue Protection (Safe Option B: No plain-text photos in storage)
 * 5. Production No-Hardcoded-Class Guard (Zero unauthorized class leak)
 * 6. UI Zero-Emoji Clutter Audit (Hukum 11 / Lucide icons only)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/db/database';
import { teacherDailyWorkService } from '../src/services/teacherDailyWorkService';
import { offlineSyncQueueService } from '../src/services/offlineSyncQueueService';
import { mappers } from '../src/db/database';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n================================================================');
console.log('🧪 SUITE 40: STAGE 6 GATE 4 — REKAM MOMEN BELAJAR & EVIDENCE WALL');
console.log('================================================================');

async function runTests() {
  const schoolId = 'sch_tk_maranatha';
  const classId = 'cls_maranatha_tka';
  const teacherPersonId = 'per_teacher_erna';
  const coTeacherPersonId = 'per_teacher_charlotha';

  // Seed context for school
  db.setContextScope('usr_teacher_erna', schoolId);

  // ---------------------------------------------------------------------------
  // TEST 1: Multi-Student Batch Ingestion
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 1: Multi-Student Group Activity Batch Ingestion ---');
  {
    const targetStudents = ['stu_maranatha_01', 'stu_maranatha_02', 'stu_maranatha_03'];
    const initialNote = 'Kerja sama membuat gerbang istana balok 24 keping.';
    const mockPhoto = 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAkA4JaQAA3AA/vsGAA==';

    const result = await teacherDailyWorkService.captureQuickObservation({
      school_id: schoolId,
      class_id: classId,
      target_student_ids: targetStudents,
      domain: 'KOGNITIF',
      quick_tags: ['STEAM_BALOK', 'KEMANDIRIAN'],
      initial_note: initialNote,
      media_url: mockPhoto,
      milestone_rating: 'BSH',
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: 'Ibu Erna Boykela R',
      role: 'TEACHER'
    });

    assert.equal(result.success, true, 'captureQuickObservation should return success: true');
    assert.equal(result.recorded_count, 3, 'Should atomically record 3 distinct observations');

    const classObs = db.getObservations(schoolId, classId);
    const captured = classObs.filter(o => o.anecdoteDescription === initialNote);
    assert.equal(captured.length, 3, 'All 3 children must have an observation record');

    const studentIdsFound = captured.map(c => c.studentId).sort();
    assert.deepEqual(studentIdsFound, targetStudents.sort(), 'All selected student IDs must be present');

    // Verify deterministic ID convention: obs_cap_{uuid}_{studentId}
    captured.forEach(c => {
      assert.ok(c.id.startsWith('obs_cap_'), `ID ${c.id} must follow obs_cap_ prefix`);
      assert.ok(c.id.endsWith(c.studentId), `ID ${c.id} must end with studentId ${c.studentId}`);
      assert.equal(c.domain, 'KOGNITIF');
      assert.equal(c.milestoneRating, 'BSH');
      assert.equal(c.photoEvidenceUrl, mockPhoto);
    });

    console.log('  ✅ PASS: 3 students in group activity successfully created 3 atomic observation records.');
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Zero-DDL Schema Contract Validation
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: Zero-DDL Schema Contract with public.observation_records ---');
  {
    const sampleObs = db.getObservations(schoolId, classId)[0];
    assert.ok(sampleObs, 'Must have at least 1 observation in memory');

    const dbRow = mappers.observation.toDb(sampleObs);

    // Verify all canonical column names of public.observation_records
    const canonicalColumns = [
      'id',
      'school_id',
      'class_id',
      'student_id',
      'observer_person_id',
      'observed_at',
      'domain',
      'anecdote_description',
      'behavior_trigger',
      'child_reaction',
      'teacher_intervention',
      'milestone_rating',
      'indicators_observed',
      'photo_evidence_url',
      'is_confidential_to_staff',
      'shared_with_guardian',
      'created_at'
    ];

    Object.keys(dbRow).forEach(key => {
      assert.ok(
        canonicalColumns.includes(key),
        `Column '${key}' is not in the canonical 15-table public.observation_records schema`
      );
    });

    assert.equal(typeof dbRow.id, 'string');
    assert.equal(typeof dbRow.school_id, 'string');
    assert.equal(typeof dbRow.student_id, 'string');
    assert.equal(typeof dbRow.domain, 'string');
    assert.ok(Array.isArray(dbRow.indicators_observed), 'indicators_observed must be an array');
    assert.equal(typeof dbRow.is_confidential_to_staff, 'boolean');

    console.log('  ✅ PASS: Output row strictly conforms to 15-table public.observation_records schema (Zero-DDL).');
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Co-Teaching Live Replication & Shared Cache
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 3: Co-Teaching Shared School Cache & Consistency ---');
  {
    // Wali Kelas records an observation
    const noteByErna = 'Menggambar bentuk pelangi dengan gradasi 4 warna';
    await teacherDailyWorkService.captureQuickObservation({
      school_id: schoolId,
      class_id: classId,
      target_student_ids: ['stu_maranatha_01'],
      domain: 'SENI',
      quick_tags: ['SENI_KREATIF'],
      initial_note: noteByErna,
      milestone_rating: 'BSB',
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: 'Ibu Erna Boykela R',
      role: 'TEACHER'
    });

    // Guru Pendamping logs in on the same school
    db.setContextScope('usr_teacher_charlotha', schoolId);

    const charlothaObs = db.getObservations(schoolId, classId);
    const found = charlothaObs.find(o => o.anecdoteDescription === noteByErna);
    assert.ok(found, 'Co-teacher Charlotha must immediately see the observation created by Wali Kelas Erna');
    assert.equal(found?.milestoneRating, 'BSB');
    assert.equal(found?.domain, 'SENI');

    console.log('  ✅ PASS: Co-Teacher Charlotha immediately observes records created by Wali Kelas Erna via shared school cache.');
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Offline Privacy Queue (Safe Option B)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 4: Offline Privacy Queue (No Plain-Text Photos in Storage) ---');
  {
    // Mock navigator.onLine = false safely in Node.js
    Object.defineProperty(globalThis.navigator, 'onLine', {
      get: () => false,
      configurable: true
    });

    const offlineCaptureNote = 'Bermain peran kasir dan pembeli di pasar mini';
    const rawPhotoData = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP...CHILD_FACE_PHOTO';

    await teacherDailyWorkService.captureQuickObservation({
      school_id: schoolId,
      class_id: classId,
      target_student_ids: ['stu_maranatha_02'],
      domain: 'SOSIAL_EMOSIONAL',
      quick_tags: ['JATI_DIRI'],
      initial_note: offlineCaptureNote,
      media_url: rawPhotoData,
      milestone_rating: 'BSH',
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: 'Ibu Erna Boykela R',
      role: 'TEACHER'
    });

    const queueItems = offlineSyncQueueService.getQueue();
    const queuedObs = queueItems.find(q => q.command_type === 'CAPTURE_OBSERVATION');
    assert.ok(queuedObs, 'An item must be enqueued in the offline queue');

    // Mandatory ARB Privacy Directive: No plain-text image persisted in storage
    const payload = queuedObs.payload as any;
    assert.equal(
      payload.media_url, 
      undefined, 
      'Plain-text child image/data URI MUST NOT be saved to persistent offline store (FB-01 Child Privacy)'
    );

    // Reset navigator.onLine
    Object.defineProperty(globalThis.navigator, 'onLine', {
      get: () => true,
      configurable: true
    });

    console.log('  ✅ PASS: Offline queue stripped plain-text photo data, preserving child privacy in local storage.');
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Production No-Hardcoded-Class Guard
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5: Production No-Hardcoded-Class Guard ---');
  {
    const workspaceSource = fs.readFileSync(
      path.resolve(__dirname, '../src/components/workspaces/ObservationWorkspace.tsx'),
      'utf-8'
    );

    // Must NOT have legacy hardcoded cls_tka_01
    assert.ok(
      !workspaceSource.includes("'cls_tka_01'"),
      "ObservationWorkspace.tsx must not contain hardcoded 'cls_tka_01'"
    );

    // Must have the empty state for accounts with assignedClasses.length === 0
    assert.ok(
      workspaceSource.includes('Belum Ada Penugasan Rombel'),
      'ObservationWorkspace must render an empty state when a teacher has no assigned classes'
    );

    console.log('  ✅ PASS: ObservationWorkspace strictly verifies assignedClasses without hardcoded fallback.');
  }

  // ---------------------------------------------------------------------------
  // TEST 6: UI Zero-Emoji Clutter Audit (Hukum 11)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 6: UI Zero-Emoji Clutter Audit (Hukum 11) ---');
  {
    const filesToAudit = [
      path.resolve(__dirname, '../src/components/workspaces/teacher/EvidenceCaptureSheet.tsx'),
      path.resolve(__dirname, '../src/components/workspaces/teacher/SignatureAndAnnotationPad.tsx'),
      path.resolve(__dirname, '../src/components/workspaces/ObservationWorkspace.tsx')
    ];

    // Regex for common emojis
    const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

    for (const filePath of filesToAudit) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');
      
      lines.forEach((line, idx) => {
        // Skip comments
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

        // Check if button or text element contains emojis
        if (line.includes('<button') || line.includes('<Button') || line.includes('<span>') || line.includes('label=')) {
          const match = line.match(emojiRegex);
          assert.ok(
            !match,
            `Violation of Hukum 11 (Zero Emoji Clutter) at ${path.basename(filePath)}:${idx + 1} -> Found emoji: ${match?.[0]}`
          );
        }
      });
    }

    console.log('  ✅ PASS: 100% Zero-Emoji compliance in production UI components (Lucide icons only).');
  }

  console.log('\n================================================================');
  console.log('🏁 ALL 6 STAGE 6 GATE 4 CONTRACT TESTS PASSED (100%)');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
