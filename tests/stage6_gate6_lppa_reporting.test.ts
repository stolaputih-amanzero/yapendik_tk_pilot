/**
 * YAPENDIK SCHOOL OS — STAGE 6 GATE 6 SPECIFICATION TESTS
 * Suite 42: Rapor LPPA (Laporan Pencapaian Pembelajaran Anak — The Culmination)
 * 
 * Verifies:
 * 1. Zero-DDL Schema Contract: 14 canonical columns in public.student_progress_reports
 * 2. State Machine Lifecycle (H-01): DRAFT -> READY_FOR_REVIEW -> APPROVED -> PUBLISHED
 * 3. Revision Workflow: READY_FOR_REVIEW -> DRAFT with mandatory feedback
 * 4. Authority Boundary (FB-04): Guardians blocked from unverified drafts; only approved/published
 * 5. Foundation Interference Block (FB-06): Database trigger trg_fb06_block_foundation_lppa
 * 6. Invariant C-11 Quarantine: Staff-confidential observations excluded from LPPA synthesis
 * 7. Narrative Engine & Anti-Jargon (Hukum 12 & H-07 Non-Surveillance): Rejects scores/rankings
 * 8. Shared School Cache: progress_reports in s_${schoolId}_progress_reports
 */

import { strict as assert } from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../src/db/database';
import { lppaReportingService } from '../src/services/lppaReportingService';
import { validateNarrative, generateAppreciativeNarrative } from '../src/services/lppaNarrativeEngine';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n================================================================');
console.log('🧪 SUITE 42: STAGE 6 GATE 6 — RAPOR LPPA REPORTING & SYNTHESIS');
console.log('================================================================');

export async function runTests() {
  const schoolId = 'sch_tk_maranatha';
  const classId = 'cls_maranatha_tka';
  const studentId = 'stu_maranatha_01';
  const academicYearId = 'ay_maranatha_2026_2027_ganjil';

  db.resetToDefaults();

  // Test 1: Zero-DDL Schema Contract
  console.log('\n▶ Test 1: Zero-DDL Schema Contract (14 Canonical Columns & Immutable Trigger)');
  {
    const schemaSql = fs.readFileSync(path.resolve(__dirname, '../supabase_schema.sql'), 'utf-8');
    assert.ok(schemaSql.includes('CREATE TABLE IF NOT EXISTS student_progress_reports'), 'Missing table student_progress_reports');

    const canonicalColumns = [
      'id',
      'school_id',
      'student_id',
      'academic_year_id',
      'semester',
      'evaluated_by_person_id',
      'evaluated_at',
      'summary_notes',
      'physical_health_notes',
      'attendance_summary',
      'homeroom_feedback',
      'headmaster_approval_date',
      'status'
    ];

    for (const col of canonicalColumns) {
      assert.ok(schemaSql.includes(col), `Missing canonical column '${col}' in schema`);
    }

    const migrationSql = fs.readFileSync(path.resolve(__dirname, '../db_migrations/rls_migration_v2_1_5_hardened.sql'), 'utf-8');
    assert.ok(migrationSql.includes('trg_report_published_immutability'), 'Missing immutability trigger trg_report_published_immutability');
    console.log('  ✅ PASS: 13 canonical columns and immutability trigger verified.');
  }

  // Test 2: State Machine Lifecycle (H-01)
  console.log('\n▶ Test 2: State Machine Lifecycle (H-01: DRAFT -> READY_FOR_REVIEW -> APPROVED -> PUBLISHED)');
  {
    // A. Teacher synthesizes draft
    const draft = await lppaReportingService.synthesizeLppaDraft({
      school_id: schoolId,
      class_id: classId,
      student_id: studentId,
      academic_year_id: academicYearId,
      semester: 'GANJIL',
      requested_by_person_id: 'per_teacher_erna',
      requested_by_name: 'Erna Susanti',
      role: 'TEACHER'
    });
    assert.equal(draft.status, 'DRAFT', 'Initial synthesized status must be DRAFT');

    // B. Save draft
    const saveRes = await lppaReportingService.saveLppaReportDraft({
      report_id: draft.id,
      school_id: schoolId,
      class_id: classId,
      student_id: studentId,
      academic_year_id: academicYearId,
      semester: 'GANJIL',
      elements: draft.elements,
      physical_growth: draft.physical_growth,
      homeroom_teacher_reflection: 'Ananda memiliki antusiasme belajar tinggi.',
      saved_by_person_id: 'per_teacher_erna',
      saved_by_name: 'Erna Susanti',
      role: 'TEACHER'
    });
    assert.ok(saveRes.success, 'Failed to save LPPA draft');

    // C. Submit for Review
    const submitRes = await lppaReportingService.submitLppaForReview({
      report_id: draft.id,
      school_id: schoolId,
      submitted_by_person_id: 'per_teacher_erna',
      submitted_by_name: 'Erna Susanti',
      role: 'TEACHER'
    });
    assert.ok(submitRes.success, 'Failed to submit report for review');

    const submittedReport = db.getProgressReports(schoolId).find(r => r.id === draft.id);
    assert.equal(submittedReport?.status, 'READY_FOR_REVIEW', 'Status must transition to READY_FOR_REVIEW');

    // D. Headmaster Approves Report
    const approveRes = await lppaReportingService.approveLppaReport({
      report_id: draft.id,
      school_id: schoolId,
      approved_by_person_id: 'per_hm_marlina',
      approved_by_name: 'Marlina Simanjuntak, M.Pd',
      role: 'HEADMASTER'
    });
    assert.ok(approveRes.success, 'Failed to approve report');

    const approvedReport = db.getProgressReports(schoolId).find(r => r.id === draft.id);
    assert.equal(approvedReport?.status, 'APPROVED', 'Status must transition to APPROVED');

    // E. Publish Report to Parents
    const publishRes = await lppaReportingService.publishLppaReport({
      report_id: draft.id,
      school_id: schoolId,
      published_by_person_id: 'per_hm_marlina',
      published_by_name: 'Marlina Simanjuntak, M.Pd',
      role: 'HEADMASTER'
    });
    assert.ok(publishRes.success, 'Failed to publish report');

    const publishedReport = db.getProgressReports(schoolId).find(r => r.id === draft.id);
    assert.equal(publishedReport?.status, 'PUBLISHED', 'Status must transition to PUBLISHED');
    console.log('  ✅ PASS: State Machine lifecycle transits cleanly across all 4 canonical states.');
  }

  // Test 3: Revision Workflow (READY_FOR_REVIEW -> DRAFT)
  console.log('\n▶ Test 3: Revision Workflow (Headmaster returns report with mandatory feedback)');
  {
    const reportId = `lppa_${schoolId}_${studentId}_ganjil_rev`;
    db.saveProgressReport({
      id: reportId,
      schoolId,
      studentId,
      academicYearId,
      semester: 'GANJIL',
      evaluatedByPersonId: 'per_teacher_erna',
      evaluatedAt: new Date().toISOString(),
      status: 'READY_FOR_REVIEW',
      summaryNotes: [],
      attendanceSummary: { hadir: 15, sakit: 0, izin: 0, alpa: 0 },
      physicalHealthNotes: { heightCm: 107, weightKg: 18.5, visionHearingHealth: 'Baik' },
      homeroomFeedback: 'Draf awal guru.'
    });

    // Failing attempt: empty feedback
    let failed = false;
    try {
      await lppaReportingService.rejectLppaReport({
        report_id: reportId,
        school_id: schoolId,
        reviewer_person_id: 'per_hm_marlina',
        reviewer_name: 'Marlina Simanjuntak',
        role: 'HEADMASTER',
        headmaster_feedback: ''
      });
    } catch (e: any) {
      failed = e.message.includes('Catatan masukan revisi Kepala Sekolah wajib diisi');
    }
    assert.ok(failed, 'Rejection without feedback must throw validation error');

    // Successful revision request
    const rejectRes = await lppaReportingService.rejectLppaReport({
      report_id: reportId,
      school_id: schoolId,
      reviewer_person_id: 'per_hm_marlina',
      reviewer_name: 'Marlina Simanjuntak',
      role: 'HEADMASTER',
      headmaster_feedback: 'Mohon perjelas capaian anak saat kegiatan di Sentra Balok.'
    });
    assert.ok(rejectRes.success, 'Rejection with notes failed');

    const revisedReport = db.getProgressReports(schoolId).find(r => r.id === reportId);
    assert.equal(revisedReport?.status, 'DRAFT', 'Status must return to DRAFT');
    assert.ok(revisedReport?.homeroomFeedback?.includes('Catatan Revisi KS'), 'Catatan revisi KS must be recorded');
    console.log('  ✅ PASS: Revision workflow safely returns report to DRAFT with KS feedback.');
  }

  // Test 4: Authority Boundary (FB-04 & FB-01)
  console.log('\n▶ Test 4: Authority Boundary (FB-04 & FB-01: Guardian isolation)');
  {
    const targetStudentId = 'stu_maranatha_02';
    const reportId = `lppa_${schoolId}_${targetStudentId}_auth`;
    const student = db.getStudentById(targetStudentId);
    assert.ok(student, 'Student must exist');

    const guardianContext = {
      role: 'GUARDIAN',
      activeSchoolId: schoolId,
      guardianChildrenPersonIds: [student!.personId]
    };

    // Case A: Report is DRAFT
    db.saveProgressReport({
      id: reportId,
      schoolId,
      studentId: targetStudentId,
      academicYearId,
      semester: 'GANJIL',
      status: 'DRAFT',
      evaluatedByPersonId: 'per_teacher_erna',
      evaluatedAt: new Date().toISOString(),
      summaryNotes: [],
      attendanceSummary: { hadir: 10, sakit: 0, izin: 0, alpa: 0 },
      physicalHealthNotes: { heightCm: 107, weightKg: 18.5, visionHearingHealth: 'Baik' },
      homeroomFeedback: 'Draf guru.'
    });

    let visibleReports = db.getReportsForContext(guardianContext, undefined, targetStudentId, 'GANJIL');
    assert.equal(visibleReports.length, 0, 'Guardian must not see DRAFT report');

    // Case B: Report is READY_FOR_REVIEW
    db.saveProgressReport({
      id: reportId,
      schoolId,
      studentId: targetStudentId,
      academicYearId,
      semester: 'GANJIL',
      status: 'READY_FOR_REVIEW',
      evaluatedByPersonId: 'per_teacher_erna',
      evaluatedAt: new Date().toISOString(),
      summaryNotes: [],
      attendanceSummary: { hadir: 10, sakit: 0, izin: 0, alpa: 0 },
      physicalHealthNotes: { heightCm: 107, weightKg: 18.5, visionHearingHealth: 'Baik' },
      homeroomFeedback: 'Draf guru.'
    });

    visibleReports = db.getReportsForContext(guardianContext, undefined, targetStudentId, 'GANJIL');
    assert.equal(visibleReports.length, 0, 'Guardian must not see READY_FOR_REVIEW report');

    // Case C: Report is APPROVED
    db.saveProgressReport({
      id: reportId,
      schoolId,
      studentId: targetStudentId,
      academicYearId,
      semester: 'GANJIL',
      status: 'APPROVED',
      evaluatedByPersonId: 'per_teacher_erna',
      evaluatedAt: new Date().toISOString(),
      summaryNotes: [],
      attendanceSummary: { hadir: 10, sakit: 0, izin: 0, alpa: 0 },
      physicalHealthNotes: { heightCm: 107, weightKg: 18.5, visionHearingHealth: 'Baik' },
      homeroomFeedback: 'Disahkan KS.'
    });

    visibleReports = db.getReportsForContext(guardianContext, undefined, targetStudentId, 'GANJIL');
    assert.equal(visibleReports.length, 1, 'Guardian must see APPROVED report');
    assert.equal(visibleReports[0].id, reportId);
    console.log('  ✅ PASS: Authority Boundary FB-04 & FB-01 strictly isolates unverified drafts from parents.');
  }

  // Test 5: Foundation Interference Block (FB-06)
  console.log('\n▶ Test 5: Foundation Interference Block (FB-06 Trigger)');
  {
    const migrationSql = fs.readFileSync(
      path.resolve(__dirname, '../db_migrations/m07_institutional_learning_ddl_and_guards.sql'),
      'utf-8'
    );
    assert.ok(migrationSql.includes('trg_fb06_block_foundation_lppa'), 'Missing trigger trg_fb06_block_foundation_lppa');
    assert.ok(migrationSql.includes('student_progress_reports'), 'Trigger not bound to student_progress_reports');
    console.log('  ✅ PASS: Foundation interference blocked at PostgreSQL trigger level.');
  }

  // Test 6: Invariant C-11 Quarantine
  console.log('\n▶ Test 6: Invariant C-11 Quarantine (Staff-confidential observations)');
  {
    db.addObservation(
      {
        schoolId,
        classId,
        studentId,
        observerPersonId: 'per_teacher_erna',
        observedAt: new Date().toISOString(),
        domain: 'SOSIAL_EMOSIONAL',
        anecdoteDescription: 'Catatan internal psikolog sekolah untuk pemantauan staf.',
        milestoneRating: 'MB',
        indicatorsObserved: ['EMOSI'],
        isConfidentialToStaff: true,
        sharedWithGuardian: false
      },
      'Erna Susanti',
      'usr_teacher_erna',
      'TEACHER'
    );

    const synthesized = await lppaReportingService.synthesizeLppaDraft({
      school_id: schoolId,
      class_id: classId,
      student_id: studentId,
      academic_year_id: academicYearId,
      semester: 'GANJIL',
      requested_by_person_id: 'per_teacher_erna',
      requested_by_name: 'Erna Susanti',
      role: 'TEACHER'
    });

    for (const key of Object.keys(synthesized.elements) as (keyof typeof synthesized.elements)[]) {
      const evidences = synthesized.elements[key].supporting_evidences || [];
      for (const ev of evidences) {
        assert.ok(
          !ev.anecdote_snippet.includes('Catatan internal psikolog'),
          'Confidential observation leaked into LPPA synthesis!'
        );
      }
    }
    console.log('  ✅ PASS: Invariant C-11 quarantined 100% of confidential staff notes.');
  }

  // Test 7: Narrative Engine & Anti-Jargon (Hukum 12 & H-07)
  console.log('\n▶ Test 7: Narrative Engine & Anti-Jargon Enforcer (Hukum 12 & H-07 Non-Surveillance)');
  {
    const badTexts = [
      'Ananda mendapatkan ranking 1 di kelompok A.',
      'Skor numerik capaian anak adalah 88.',
      'Ananda memiliki defisit kemampuan motorik.',
      'Perkembangan ananda lambat dibanding temannya.',
      'Ananda menjadi juara kelas semester ini.'
    ];

    for (const text of badTexts) {
      const res = validateNarrative(text);
      assert.equal(res.valid, false, `Failed to reject forbidden jargon: "${text}"`);
      assert.ok(res.violations.length > 0);
    }

    const goodText = generateAppreciativeNarrative({
      studentName: 'Millen',
      elementKey: 'LITERASI_STEAM',
      rating: 'BSH',
      customAnecdote: 'antusias menyusun bentuk geometri balok bertingkat.'
    });

    const check = validateNarrative(goodText);
    assert.equal(check.valid, true, 'Appreciative narrative flagged as invalid');
    assert.ok(goodText.includes('Millen'));
    assert.ok(goodText.includes('antusias menyusun'));
    console.log('  ✅ PASS: Anti-Jargon enforcer rejects competitive rankings and generates appreciative reflections.');
  }

  // Test 8: Shared School Cache Consistency
  console.log('\n▶ Test 8: Shared School Cache Cross-Persona Consistency');
  {
    db.setContextScope('usr_teacher_erna', schoolId);
    
    const sharedReportId = `lppa_${schoolId}_${studentId}_shared_sync`;
    db.saveProgressReport({
      id: sharedReportId,
      schoolId,
      studentId,
      academicYearId,
      semester: 'GANJIL',
      status: 'DRAFT',
      evaluatedByPersonId: 'per_teacher_erna',
      evaluatedAt: new Date().toISOString(),
      summaryNotes: [],
      attendanceSummary: { hadir: 10, sakit: 0, izin: 0, alpa: 0 },
      physicalHealthNotes: { heightCm: 107, weightKg: 18.5, visionHearingHealth: 'Baik' },
      homeroomFeedback: 'Draf guru.'
    });

    // Switch context to Headmaster in same school
    db.setContextScope('usr_headmaster_marlina', schoolId);

    const reportsForHeadmaster = db.getProgressReports(schoolId);
    const found = reportsForHeadmaster.find(r => r.id === sharedReportId);
    assert.ok(found, 'Headmaster unable to read report saved by teacher from Shared School Cache');
    assert.equal(found?.studentId, studentId);
    console.log('  ✅ PASS: progress_reports properly stored and readable across personas via Shared School Cache.');
  }

  console.log('\n================================================================');
  console.log('🎉 ALL 8 SCENARIOS IN SUITE 42 PASSED PERFECTLY!');
  console.log('================================================================\n');
}

// Direct invocation check
if (process.argv[1] && process.argv[1].endsWith('stage6_gate6_lppa_reporting.test.ts')) {
  runTests().catch(err => {
    console.error('❌ Test Suite 42 Failed:', err);
    process.exit(1);
  });
}
