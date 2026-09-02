/**
 * Yapendik School OS — Stage 4.2 LPPA Reporting & Synthesis Test Suite
 * 
 * Epistemological Principle:
 * "LPPA Synthesis Engine generates a proposed narrative, not the truth."
 * 
 * Verified Modules:
 * - Module 1: Evidence Extraction & Grounded Narrative Proposal Generation
 * - Module 2: Invariant C-11 Privacy Guard (Staff Confidential Exclusion)
 * - Module 3: Traceable Evidence Citations & Backlinks
 * - Module 4: Teacher Authoring & Draft Save Command
 * - Module 5: State Machine & Headmaster Approval Gate
 * - Module 6: Stage 3 Closed Semester Mutation Guard
 */

import { db } from '../src/db/database';
import { lppaReportingService, teacherDailyWorkService } from '../src/services';

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

export async function runStage42LppaReportingTests() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 4.2 LPPA SYNTHESIS & REPORTING CONTRACT TEST SUITE');
  console.log('════════════════════════════════════════════════════════════════\n');

  const schoolId = 'sch_tk_yapendik_01';
  const classId = 'cls_tka_01';
  const academicYearId = 'ay_2025_2026';
  const semester = 'GANJIL';

  const teacherPersonId = 'per_teacher_siti';
  const teacherName = 'Siti Rahmawati, S.Pd';
  const headmasterPersonId = 'per_headmaster_sheryl';
  const headmasterName = 'SHERYL Y N UMBAS, S.IKOM, M.PD';

  const students = db.getStudents(schoolId, classId);
  const kenzo = students[0];
  const kenzoStudentId = kenzo.id;

  // -------------------------------------------------------------------------
  // MODULE 1: Grounded Narrative Proposal & Evidence Extraction
  // -------------------------------------------------------------------------
  console.log('--- MODULE 1: Grounded Narrative Proposal & Evidence Extraction ---');
  let synthesizedDraft: any;
  try {
    // 1. Seed/ensure a curated BSB STEAM observation exists
    const captureRes = await teacherDailyWorkService.captureQuickObservation({
      school_id: schoolId,
      class_id: classId,
      target_student_ids: [kenzoStudentId],
      domain: 'KOGNITIF',
      quick_tags: ['STEAM_BALOK', 'SPASIAL'],
      initial_note: 'Menyusun menara 12 tingkat mandiri dan stabil.',
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: teacherName,
      role: 'TEACHER'
    });

    await teacherDailyWorkService.enrichObservationNarrative({
      observation_id: captureRes.observation_id,
      pedagogical_narrative: 'Kenzo merancang menara balok dengan simetri dan penalaran spasial yang sangat baik.',
      domain: 'KOGNITIF',
      milestone_rating: 'BSB',
      indicators_observed: ['STEAM_BALOK', 'SPASIAL'],
      is_lppa_evidence: true,
      is_staff_confidential: false,
      is_shared_with_guardian: true,
      enriched_by_person_id: teacherPersonId,
      enriched_by_name: teacherName,
      role: 'TEACHER',
      school_id: schoolId
    });

    synthesizedDraft = await lppaReportingService.synthesizeLppaDraft({
      school_id: schoolId,
      class_id: classId,
      student_id: kenzoStudentId,
      academic_year_id: academicYearId,
      semester,
      requested_by_person_id: teacherPersonId,
      requested_by_name: teacherName,
      role: 'TEACHER'
    });

    assert(Boolean(synthesizedDraft), 'synthesizeLppaDraft returns valid LPPA draft payload');
    assert(synthesizedDraft.student_id === kenzoStudentId, 'Draft is anchored strictly to target student');
    assert(synthesizedDraft.status === 'DRAFT', 'Initial synthesized draft status is DRAFT (Proposal state)');
    assert(Boolean(synthesizedDraft.elements.NILAI_AGAMA_BUDI_PEKERTI), 'Contains NABP element draft');
    assert(Boolean(synthesizedDraft.elements.JATI_DIRI), 'Contains Jati Diri element draft');
    assert(Boolean(synthesizedDraft.elements.LITERASI_STEAM), 'Contains Literasi & STEAM element draft');
    assert(Boolean(synthesizedDraft.elements.PROJEK_P5), 'Contains Projek P5 element draft');
    assert(synthesizedDraft.elements.LITERASI_STEAM.proposed_narrative.includes('Ananda'), 'Narrative is child-centered and mentions student name');
    assert(synthesizedDraft.elements.LITERASI_STEAM.rating_summary === 'BSB', 'Detects BSB rating from enriched STEAM evidence');
  } catch (err: any) {
    assert(false, 'Module 1 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 2: Invariant C-11 Privacy Guard (Staff Confidential Exclusion)
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 2: Invariant C-11 Privacy Guard (Staff Confidential Exclusion) ---');
  try {
    // Capture an internal staff confidential note for Kenzo
    const confObs = await teacherDailyWorkService.captureQuickObservation({
      school_id: schoolId,
      class_id: classId,
      target_student_ids: [kenzoStudentId],
      domain: 'SOSIAL_EMOSIONAL',
      quick_tags: ['EMOSIONAL_INTERNAL_RAHASIA'],
      initial_note: 'Catatan rahasia internal guru tentang sensitivitas emosional.',
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: teacherName,
      role: 'TEACHER'
    });

    // Re-synthesize
    const reSynthesized = await lppaReportingService.synthesizeLppaDraft({
      school_id: schoolId,
      class_id: classId,
      student_id: kenzoStudentId,
      academic_year_id: academicYearId,
      semester,
      requested_by_person_id: teacherPersonId,
      requested_by_name: teacherName,
      role: 'TEACHER'
    });

    const allSupportingIds = Object.values(reSynthesized.elements).flatMap(e => e.supporting_evidence_ids);
    assert(!allSupportingIds.includes(confObs.observation_id), 'Staff-confidential observation is STRICTLY EXCLUDED from LPPA narrative synthesis (Invariant C-11)');
    assert(!reSynthesized.elements.JATI_DIRI.proposed_narrative.includes('rahasia'), 'Confidential text never leaks into proposed LPPA narrative');
  } catch (err: any) {
    assert(false, 'Module 2 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 3: Traceable Citations & Supporting Evidence Backlinks
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 3: Traceable Citations & Supporting Evidence Backlinks ---');
  try {
    const steamElement = synthesizedDraft.elements.LITERASI_STEAM;
    assert(steamElement.supporting_evidence_ids.length > 0, 'Element draft maintains backlink array to supporting evidence IDs');
    assert(steamElement.supporting_evidences.length > 0, 'Element draft embeds supporting evidence metadata (photo, date, anecdote)');
    assert(Boolean(steamElement.supporting_evidences[0].observed_at), 'Evidence citation includes valid timestamp');
  } catch (err: any) {
    assert(false, 'Module 3 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 4: Teacher Authoring & Save Draft Command
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 4: Teacher Authoring & Save Draft Command ---');
  let savedReportId = '';
  try {
    const teacherCustomNarrative = 'Ananda Kenzo sangat antusias dan mandiri dalam merancang bangun menara balok yang kompleks dan seimbang.';
    const saveRes = await lppaReportingService.saveLppaReportDraft({
      school_id: schoolId,
      class_id: classId,
      student_id: kenzoStudentId,
      academic_year_id: academicYearId,
      semester,
      elements: {
        NILAI_AGAMA_BUDI_PEKERTI: {
          teacher_final_narrative: synthesizedDraft.elements.NILAI_AGAMA_BUDI_PEKERTI.proposed_narrative,
          rating_summary: 'BSH',
          growth_recommendations: 'Pendampingan doa bersama di rumah.',
          supporting_evidence_ids: []
        },
        JATI_DIRI: {
          teacher_final_narrative: synthesizedDraft.elements.JATI_DIRI.proposed_narrative,
          rating_summary: 'BSH',
          growth_recommendations: 'Stimulasi kemandirian merapikan mainan.',
          supporting_evidence_ids: []
        },
        LITERASI_STEAM: {
          teacher_final_narrative: teacherCustomNarrative,
          rating_summary: 'BSB',
          growth_recommendations: 'Diberi tantangan balok geometri yang lebih variatif.',
          supporting_evidence_ids: synthesizedDraft.elements.LITERASI_STEAM.supporting_evidence_ids
        },
        PROJEK_P5: {
          teacher_final_narrative: synthesizedDraft.elements.PROJEK_P5.proposed_narrative,
          rating_summary: 'BSH',
          growth_recommendations: 'Kerja sama tim.',
          supporting_evidence_ids: []
        }
      },
      p5_project_title: 'Aku Sayang Lingkungan Sekolah',
      p5_project_description: 'Eksplorasi tanaman dan daur ulang bahan kelas.',
      physical_growth: {
        height_cm: 107,
        weight_kg: 19.0,
        head_circumference_cm: 50.5,
        physical_notes: 'Pertumbuhan fisik sangat baik dan proporsional.',
        vision_hearing_notes: 'Penglihatan & pendengaran normal.'
      },
      homeroom_teacher_reflection: 'Kenzo adalah anak yang ceria dan menjadi teladan bagi teman-temannya.',
      saved_by_person_id: teacherPersonId,
      saved_by_name: teacherName,
      role: 'TEACHER'
    });

    assert(saveRes.success, 'saveLppaReportDraft executes successfully');
    savedReportId = saveRes.report_id;
    assert(Boolean(savedReportId), 'Returns valid persistent report ID');

    const retrieved = await lppaReportingService.getLppaReport(savedReportId, schoolId);
    assert(retrieved?.status === 'DRAFT', 'Persistent report status is DRAFT');
    assert(retrieved?.elements.LITERASI_STEAM.teacher_final_narrative === teacherCustomNarrative, 'Preserves teacher custom narrative edits');
  } catch (err: any) {
    assert(false, 'Module 4 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 5: State Machine & Headmaster Approval Gate
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 5: State Machine & Headmaster Approval Gate ---');
  try {
    // 1. Submit for review by Teacher
    const submitRes = await lppaReportingService.submitLppaForReview({
      report_id: savedReportId,
      school_id: schoolId,
      submitted_by_person_id: teacherPersonId,
      submitted_by_name: teacherName,
      role: 'TEACHER'
    });
    assert(submitRes.success, 'submitLppaForReview transitions report to READY_FOR_REVIEW');

    const afterSubmit = await lppaReportingService.getLppaReport(savedReportId, schoolId);
    assert(afterSubmit?.status === 'READY_FOR_REVIEW', 'Report verified in READY_FOR_REVIEW state');

    // 2. Unauthorized role attempt to approve
    let unauthorizedBlocked = false;
    try {
      await lppaReportingService.approveLppaReport({
        report_id: savedReportId,
        school_id: schoolId,
        approved_by_person_id: teacherPersonId,
        approved_by_name: teacherName,
        role: 'TEACHER' // Teacher cannot approve own report
      });
    } catch (err: any) {
      if (err?.message?.includes('UNAUTHORIZED')) {
        unauthorizedBlocked = true;
      }
    }
    assert(unauthorizedBlocked, 'Teacher role UNAUTHORIZED to approve LPPA report (Approval Gate Guard)');

    // 3. Authorized Headmaster Approval
    const approveRes = await lppaReportingService.approveLppaReport({
      report_id: savedReportId,
      school_id: schoolId,
      approved_by_person_id: headmasterPersonId,
      approved_by_name: headmasterName,
      role: 'HEADMASTER'
    });
    assert(approveRes.success, 'Headmaster successfully approved LPPA report');

    const afterApprove = await lppaReportingService.getLppaReport(savedReportId, schoolId);
    assert(afterApprove?.status === 'APPROVED', 'Report status promoted to APPROVED');
    assert(Boolean(afterApprove?.approved_at), 'Approval date recorded');

    // 4. Publish LPPA report to Parent Portal
    const pubRes = await lppaReportingService.publishLppaReport({
      report_id: savedReportId,
      school_id: schoolId,
      published_by_person_id: headmasterPersonId,
      published_by_name: headmasterName,
      role: 'HEADMASTER'
    });
    assert(pubRes.success, 'publishLppaReport promotes status to PUBLISHED');

    const afterPublish = await lppaReportingService.getLppaReport(savedReportId, schoolId);
    assert(afterPublish?.status === 'PUBLISHED', 'Report status is PUBLISHED');
  } catch (err: any) {
    assert(false, 'Module 5 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 6: Stage 3 Closed Semester Guard
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 6: Stage 3 Closed Semester Guard ---');
  try {
    // Temporarily simulate a closed semester by setting isActive = false
    const academicYears = db.getAcademicYears(schoolId);
    const activeAy = academicYears.find(ay => ay.isActive);
    if (activeAy) {
      activeAy.isActive = false;

      let closedBlocked = false;
      try {
        await lppaReportingService.saveLppaReportDraft({
          school_id: schoolId,
          class_id: classId,
          student_id: kenzoStudentId,
          academic_year_id: academicYearId,
          semester,
          elements: {} as any,
          physical_growth: {} as any,
          homeroom_teacher_reflection: '',
          saved_by_person_id: teacherPersonId,
          saved_by_name: teacherName,
          role: 'TEACHER'
        });
      } catch (err: any) {
        if (err?.message?.includes('CANNOT_MUTATE_CLOSED_SEMESTER')) {
          closedBlocked = true;
        }
      }

      assert(closedBlocked, 'saveLppaReportDraft blocked by CANNOT_MUTATE_CLOSED_SEMESTER guard on closed semester');

      // Restore active AY
      activeAy.isActive = true;
    }
  } catch (err: any) {
    assert(false, 'Module 6 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 7: Fase E Canonical Output & Immutable Archive
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 7: Fase E Canonical Output & Immutable Archive ---');
  try {
    const publishedDoc = await lppaReportingService.getLppaReport(savedReportId, schoolId);
    assert(Boolean(publishedDoc), 'Published document is retrievable');

    if (publishedDoc) {
      const canonical = lppaReportingService.toCanonicalPublishedRecord(
        publishedDoc,
        'TK Yapendik 01 Menteng',
        '20104821',
        'Kelompok A (Usia 4-5 Tahun)',
        teacherName,
        headmasterName
      );

      assert(Boolean(canonical.published_record_id), 'Generates unique published_record_id');
      assert(canonical.publication_metadata.official_report_number.includes('LPPA-TK-YPD'), 'Embeds official institutional letter number');
      assert(Boolean(canonical.publication_metadata.canonical_checksum_sha256), 'Computes cryptographic checksum SHA-256');
      assert(canonical.publication_metadata.verification_qr_payload.includes('/verify/lppa/'), 'Generates valid canonical QR verification link');
      assert(canonical.student_snapshot.full_name.includes('Kenzo'), 'Snapshots student demographics accurately');
      assert(canonical.signatures.headmaster.digital_signature_stamp === 'VALIDATED_OFFICIAL_STAMP', 'Applies official Headmaster digital stamp');
      assert(canonical.curriculum_elements.literasi_steam.rating_summary === 'BSB', 'Projects STEAM rating BSB correctly');
      assert(canonical.curriculum_elements.literasi_steam.supporting_evidences.length > 0, 'Embeds supporting empirical evidence backlinks');
    }
  } catch (err: any) {
    assert(false, 'Module 7 failure', err?.message);
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 4.2 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Stage 4.2 Test Suite failed with ${failedTests} failures.`);
  }
}

// Run standalone if executed directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  runStage42LppaReportingTests().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
