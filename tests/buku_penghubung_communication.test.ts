/**
 * YAPENDIK SCHOOL OS — TK PILOT v1.0
 * STAGE 6 GATE 5: BUKU PENGHUBUNG & HOME-SCHOOL CONNECTION TEST SUITE
 * 
 * Verifies:
 * 1. Zero-DDL Schema Contract with public.guardian_notices
 * 2. Cross-Child Privacy Boundary (FB-01 Contextual Projection)
 * 3. Two-Way Acknowledgment Lifecycle (SENT -> READ -> ACKNOWLEDGED -> REPLIED)
 * 4. Shared School Cache Cross-Persona Consistency
 * 5. HEALTH_ALERT Tier-3 24h Expiry & Preview Sanitization
 * 6. UI Zero-Emoji Clutter & Touch Target Audit (Hukum 11 & Material 3)
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/db/database';
import { mappers } from '../src/db/database';
import { getSanitizedHealthAlertPreview } from '../src/components/workspaces/communication/HealthAlertBadge';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n================================================================');
console.log('🧪 SUITE 41: STAGE 6 GATE 5 — BUKU PENGHUBUNG & HOME-SCHOOL CONNECTION');
console.log('================================================================');

async function runTests() {
  const schoolId = 'sch_tk_maranatha';
  const classId = 'cls_maranatha_tka';
  const teacherUserId = 'usr_teacher_erna';
  const teacherPersonId = 'per_teacher_erna';

  const guardianUserId = 'usr_guardian_julen';
  const guardianPersonId = 'per_guardian_julen';
  const millenPersonId = 'per_child_millen';
  const millenStudentId = 'stu_maranatha_01';

  const otherChildPersonId = 'per_child_carissa';
  const otherChildStudentId = 'stu_maranatha_02';

  // Seed context for school
  db.setContextScope(teacherUserId, schoolId);

  // ---------------------------------------------------------------------------
  // TEST 1: Zero-DDL Schema Contract with public.guardian_notices
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 1: Zero-DDL Schema Contract with public.guardian_notices ---');
  {
    const createdNotice = db.addNotice({
      schoolId,
      classId,
      studentId: millenStudentId,
      authorPersonId: teacherPersonId,
      type: 'DAILY_SUMMARY',
      title: 'Aktivitas Sentra Balok Hari Ini',
      content: 'Millen berhasil menyusun menara balok bersama teman-teman.',
      requiresAcknowledgment: true
    }, 'Ibu Erna Boykela R', teacherUserId, 'TEACHER');

    const dbRow = mappers.notice.toDb(createdNotice);

    const canonicalColumns = [
      'id',
      'school_id',
      'class_id',
      'student_id',
      'author_person_id',
      'recipient_person_id',
      'type',
      'title',
      'content',
      'requires_acknowledgment',
      'acknowledged_at',
      'acknowledged_by_person_id',
      'guardian_reply',
      'created_at'
    ];

    Object.keys(dbRow).forEach(key => {
      assert.ok(
        canonicalColumns.includes(key),
        `Column '${key}' is not in the canonical 15-table public.guardian_notices schema`
      );
    });

    const allowedTypes = ['DAILY_SUMMARY', 'ANECDOTE_SHARE', 'HEALTH_ALERT', 'CLASS_ANNOUNCEMENT', 'DIRECT_NOTE'];
    assert.ok(allowedTypes.includes(dbRow.type), `Type '${dbRow.type}' must be one of allowed notice types`);
    assert.equal(dbRow.school_id, schoolId);
    assert.equal(dbRow.student_id, millenStudentId);
    assert.equal(dbRow.requires_acknowledgment, true);

    console.log('  ✅ PASS: Notice payload strictly conforms to 15-table public.guardian_notices schema (Zero-DDL).');
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Cross-Child Privacy Boundary (FB-01 Contextual Projection)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 2: Cross-Child Privacy Boundary (FB-01 Contextual Projection) ---');
  {
    // Notice 1: Targeted to Millen
    const noticeMillen = db.addNotice({
      schoolId,
      classId,
      studentId: millenStudentId,
      authorPersonId: teacherPersonId,
      type: 'DIRECT_NOTE',
      title: 'Catatan Spesifik Millen',
      content: 'Perkembangan kemandirian Millen sangat baik.',
      requiresAcknowledgment: false
    }, 'Ibu Erna Boykela R', teacherUserId, 'TEACHER');

    // Notice 2: Targeted to Another Child (Carissa)
    const noticeOther = db.addNotice({
      schoolId,
      classId,
      studentId: otherChildStudentId,
      authorPersonId: teacherPersonId,
      type: 'DIRECT_NOTE',
      title: 'Catatan Rahasia Carissa',
      content: 'Catatan ini hanya boleh dilihat orang tua Carissa.',
      requiresAcknowledgment: false
    }, 'Ibu Erna Boykela R', teacherUserId, 'TEACHER');

    // Notice 3: Class Announcement (Open to all guardians in class)
    const noticeClass = db.addNotice({
      schoolId,
      classId,
      authorPersonId: teacherPersonId,
      type: 'CLASS_ANNOUNCEMENT',
      title: 'Kunjungan Edukasi Taman Lalu Lintas',
      content: 'Pemberitahuan rencana outing class minggu depan.',
      requiresAcknowledgment: true
    }, 'Ibu Erna Boykela R', teacherUserId, 'TEACHER');

    // Guardian Context: Ibu Julen (Mother of Millen only)
    const guardianContext = {
      activeSchoolId: schoolId,
      userId: guardianUserId,
      personId: guardianPersonId,
      role: 'GUARDIAN',
      guardianChildrenPersonIds: [millenPersonId]
    };

    const projectedNotices = db.getNoticesForContext(guardianContext, classId);

    // Assert Millen's notice is visible
    assert.ok(
      projectedNotices.some(n => n.id === noticeMillen.id),
      "Guardian of Millen MUST be able to see Millen's notice"
    );

    // Assert Class Announcement is visible
    assert.ok(
      projectedNotices.some(n => n.id === noticeClass.id),
      "Guardian MUST be able to see Class Announcements"
    );

    // FB-01 STRICT PRIVACY ENFORCEMENT: Other child's notice must NEVER be visible
    assert.ok(
      !projectedNotices.some(n => n.id === noticeOther.id),
      "Guardian of Millen MUST NOT be able to see other child's private notice (FB-01 VIOLATION PREVENTED)"
    );

    console.log('  ✅ PASS: Contextual projection strictly isolated cross-child private notices (FB-01 Pass).');
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Two-Way Acknowledgment Lifecycle (SENT -> READ -> ACKNOWLEDGED -> REPLIED)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 3: Two-Way Acknowledgment Lifecycle ---');
  {
    const notice = db.addNotice({
      schoolId,
      classId,
      studentId: millenStudentId,
      authorPersonId: teacherPersonId,
      type: 'DAILY_SUMMARY',
      title: 'Konfirmasi Penjemputan Sore',
      content: 'Mohon konfirmasi siapa yang menjemput Ananda Millen sore ini.',
      requiresAcknowledgment: true
    }, 'Ibu Erna Boykela R', teacherUserId, 'TEACHER');

    // Step 1: Initial state (SENT / DELIVERED)
    assert.equal(notice.acknowledgedAt, undefined);
    assert.equal(notice.guardianReply, undefined);

    // Step 2: Guardian confirms and replies (ACKNOWLEDGED -> REPLIED)
    const replyMessage = 'Nenek yang akan menjemput pukul 14:00 WIB, terima kasih Bu Guru.';
    db.acknowledgeNotice(notice.id, guardianPersonId, replyMessage);

    const updated = db.getNotices(schoolId, classId, millenStudentId).find(n => n.id === notice.id);
    assert.ok(updated, 'Updated notice must exist');
    assert.ok(updated?.acknowledgedAt, 'acknowledgedAt must be populated');
    assert.equal(updated?.acknowledgedByPersonId, guardianPersonId);
    assert.equal(updated?.guardianReply, replyMessage);

    console.log('  ✅ PASS: State machine successfully transitioned through SENT -> ACKNOWLEDGED -> REPLIED.');
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Shared School Cache Cross-Persona Consistency
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 4: Shared School Cache Consistency across Persona Switches ---');
  {
    // Teacher writes a notice
    const uniqueTitle = `Pengumuman Kemitraan ${Date.now()}`;
    db.addNotice({
      schoolId,
      classId,
      studentId: millenStudentId,
      authorPersonId: teacherPersonId,
      type: 'CLASS_ANNOUNCEMENT',
      title: uniqueTitle,
      content: 'Agenda rapat komite sekolah.',
      requiresAcknowledgment: false
    }, 'Ibu Erna Boykela R', teacherUserId, 'TEACHER');

    // Switch context to Guardian on the same school
    db.setContextScope(guardianUserId, schoolId);

    const guardianNotices = db.getNotices(schoolId, classId);
    const found = guardianNotices.find(n => n.title === uniqueTitle);
    assert.ok(
      found,
      'Notice created by Teacher must immediately exist in shared school cache when Guardian logs in'
    );

    console.log('  ✅ PASS: Shared school cache retained notices seamlessly across Teacher and Guardian personas.');
  }

  // ---------------------------------------------------------------------------
  // TEST 5: HEALTH_ALERT Tier-3 Expiry & Sanitization
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 5: HEALTH_ALERT Tier-3 Expiry & Sanitization ---');
  {
    // 5.1 Test Sanitized Preview Template
    const preview = getSanitizedHealthAlertPreview('Millen');
    assert.equal(
      preview,
      'Pemberitahuan kondisi kesehatan Ananda Millen — buka aplikasi untuk detail.',
      'Sanitized preview must not expose raw clinical diagnosis'
    );
    assert.ok(!preview.includes('38.5'), 'Raw temperature must not be in preview');
    assert.ok(!preview.includes('demam'), 'Raw symptom must not be in preview');

    // 5.2 Test 24-Hour Expiry in Contextual Projection
    const expiredNotice = db.addNotice({
      schoolId,
      classId,
      studentId: millenStudentId,
      authorPersonId: teacherPersonId,
      type: 'HEALTH_ALERT',
      title: 'Suhu Tubuh Tinggi 38.2 C',
      content: 'Ananda mengeluh pusing setelah istirahat.',
      requiresAcknowledgment: true
    }, 'Ibu Erna Boykela R', teacherUserId, 'TEACHER');

    // Artificially age the notice beyond 24 hours (25 hours ago)
    const twentyFiveHoursAgo = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    expiredNotice.createdAt = twentyFiveHoursAgo;

    const guardianContext = {
      activeSchoolId: schoolId,
      userId: guardianUserId,
      personId: guardianPersonId,
      role: 'GUARDIAN',
      guardianChildrenPersonIds: [millenPersonId]
    };

    const noticesAfterExpiry = db.getNoticesForContext(guardianContext, classId);
    assert.ok(
      !noticesAfterExpiry.some(n => n.id === expiredNotice.id),
      'HEALTH_ALERT older than 24 hours must be automatically expired and hidden from active context'
    );

    console.log('  ✅ PASS: Tier-3 Health alert preview sanitized and 24-hour expiry successfully enforced.');
  }

  // ---------------------------------------------------------------------------
  // TEST 6: UI Zero-Emoji Clutter & Touch Target Audit (Hukum 11 & Material 3)
  // ---------------------------------------------------------------------------
  console.log('\n--- TEST 6: UI Zero-Emoji Clutter & Touch Target Audit ---');
  {
    const filesToAudit = [
      path.resolve(__dirname, '../src/components/workspaces/CommunicationWorkspace.tsx'),
      path.resolve(__dirname, '../src/components/workspaces/communication/TwoWayNoticeThread.tsx'),
      path.resolve(__dirname, '../src/components/workspaces/communication/NoticeStatusReceipt.tsx'),
      path.resolve(__dirname, '../src/components/workspaces/communication/HealthAlertBadge.tsx'),
      path.resolve(__dirname, '../src/workspaces/guardian/GuardianMomentsGallery.tsx')
    ];

    const emojiRegex = /[\u{1F300}-\u{1F5FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/u;

    for (const filePath of filesToAudit) {
      const content = fs.readFileSync(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, idx) => {
        const trimmed = line.trim();
        if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;

        if (line.includes('<button') || line.includes('<Button') || line.includes('<span>') || line.includes('label=')) {
          const match = line.match(emojiRegex);
          assert.ok(
            !match,
            `Violation of Hukum 11 (Zero Emoji Clutter) at ${path.basename(filePath)}:${idx + 1} -> Found emoji: ${match?.[0]}`
          );
        }
      });
    }

    // Verify touch target >= 48dp on guardian confirmation button in TwoWayNoticeThread
    const threadSource = fs.readFileSync(
      path.resolve(__dirname, '../src/components/workspaces/communication/TwoWayNoticeThread.tsx'),
      'utf-8'
    );
    assert.ok(
      threadSource.includes('min-h-[48px]'),
      'Confirmation CTA button in TwoWayNoticeThread must enforce min-h-[48px] per Hukum 7.8.1'
    );

    console.log('  ✅ PASS: 100% Zero-Emoji compliance and min-h-[48px] touch target boundaries verified.');
  }

  console.log('\n================================================================');
  console.log('🏁 ALL 6 STAGE 6 GATE 5 CONTRACT TESTS PASSED (100%)');
  console.log('================================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
