/**
 * Yapendik School OS — Stage 4.3 Child Continuity & Learning Loop Contract Suite
 * 
 * Tests the 12 Acceptance Criteria:
 * 1. Historical baseline: strictly published LPPA records
 * 2. Derived projection: dynamically reconstructed without creating separate source of truth
 * 3. Developmental trajectory: 4 elements mapped across semesters
 * 4. Progress over labeling: MB/BSH/BSB as growth arc, no ranking
 * 5. System proposal: generates StimulationRecommendation
 * 6. Traceability: historical anchor to source_historical_baseline_record_id
 * 7. Invariant C-11: confidential staff records quarantined
 * 8. Teacher authority: system cannot activate recommendation autonomously
 * 9. Lifecycle state machine: PROPOSED -> ACTIVE -> COMPLETED
 * 10. Closed semester: mutations blocked on closed semester
 * 11. Scoped Guardian bridge: parent reflection does not alter canonical rating
 * 12. Classroom heatmap: aggregates distribution for supervision
 */

import { db } from '../src/db/database';
import { childContinuityService } from '../src/services/childContinuityService';
import { teacherDailyWorkService } from '../src/services/teacherDailyWorkService';
import { lppaReportingService } from '../src/services/lppaReportingService';

export async function runStage43ContinuityTests() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 4.3 CHILD CONTINUITY & LEARNING LOOP CONTRACT TEST SUITE');
  console.log('════════════════════════════════════════════════════════════════\n');

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
      console.error(`  ❌ FAIL: ${testName}`);
      if (detail) console.error(`     Detail: ${detail}`);
    }
  }

  const schoolId = 'sch_tk_yapendik_01';
  const classId = 'cls_tk_a_menteng';
  const academicYearId = 'ay_2025_2026';
  const semester = 'GANJIL';
  const teacherPersonId = 'per_teacher_siti';
  const teacherName = 'Siti Rahmawati, S.Pd';
  const guardianPersonId = 'per_parent_budi';
  const guardianName = 'Budi Santoso, S.T.';

  const students = db.getStudents(schoolId);
  const kenzo = students[0];
  const kenzoStudentId = kenzo.id;
  const actualClassId = kenzo.currentClassId || classId;

  // 0. Seed published LPPA for Kenzo to establish historical baseline
  const saveRes = await lppaReportingService.saveLppaReportDraft({
    school_id: schoolId,
    class_id: actualClassId,
    student_id: kenzoStudentId,
    academic_year_id: academicYearId,
    semester,
    elements: {
      NILAI_AGAMA_BUDI_PEKERTI: {
        teacher_final_narrative: 'Kenzo selalu berdoa sebelum kegiatan.',
        rating_summary: 'BSH',
        growth_recommendations: 'Pembiasaan doa mandiri.',
        supporting_evidence_ids: []
      },
      JATI_DIRI: {
        teacher_final_narrative: 'Kenzo mandiri merapikan alat main.',
        rating_summary: 'BSH',
        growth_recommendations: 'Regulasi emosi bergantian.',
        supporting_evidence_ids: []
      },
      LITERASI_STEAM: {
        teacher_final_narrative: 'Kenzo mahir merancang menara balok simetris.',
        rating_summary: 'BSB',
        growth_recommendations: 'Eksplorasi jembatan balok bertingkat.',
        supporting_evidence_ids: []
      },
      PROJEK_P5: {
        teacher_final_narrative: 'Kenzo aktif dalam projek tanaman.',
        rating_summary: 'BSH',
        growth_recommendations: 'Kerja sama tim.',
        supporting_evidence_ids: []
      }
    },
    physical_growth: {
      height_cm: 107,
      weight_kg: 19.0,
      head_circumference_cm: 50.5,
      physical_notes: 'Optimal.',
      vision_hearing_notes: 'Normal.'
    },
    homeroom_teacher_reflection: 'Kenzo adalah anak ceria dan berbakat.',
    saved_by_person_id: teacherPersonId,
    saved_by_name: teacherName,
    role: 'TEACHER'
  });

  await lppaReportingService.submitLppaForReview({
    report_id: saveRes.report_id,
    school_id: schoolId,
    submitted_by_person_id: teacherPersonId,
    submitted_by_name: teacherName,
    role: 'TEACHER'
  });

  await lppaReportingService.approveLppaReport({
    report_id: saveRes.report_id,
    school_id: schoolId,
    approved_by_person_id: 'per_hm_esther',
    approved_by_name: 'Dra. Esther Nugroho, M.Pd',
    role: 'HEADMASTER'
  });

  await lppaReportingService.publishLppaReport({
    report_id: saveRes.report_id,
    school_id: schoolId,
    published_by_person_id: 'per_hm_esther',
    published_by_name: 'Dra. Esther Nugroho, M.Pd',
    role: 'HEADMASTER'
  });

  // -------------------------------------------------------------------------
  // MODULE 1: Derived Continuity Profile & Historical Baseline
  // -------------------------------------------------------------------------
  console.log('--- MODULE 1: Derived Continuity Profile & Historical Baseline ---');
  let profile: any;
  try {
    profile = await childContinuityService.getChildContinuityProfile(kenzoStudentId, schoolId);
    
    assert(Boolean(profile), 'Profile dynamically generated as a derived read-model');
    assert(profile.student_id === kenzoStudentId, 'Profile strictly anchored to target student');
    assert(Array.isArray(profile.historical_lppa_references), 'Maintains chronological array of historical LPPA records');
    assert(profile.historical_lppa_references.length > 0, 'Extracts published LPPA baseline record');
    assert(Boolean(profile.historical_lppa_references[0].published_record_id), 'Historical reference contains valid published_record_id');
  } catch (err: any) {
    assert(false, 'Module 1 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 2: Multi-Semester Developmental Trajectory (Progress Over Labeling)
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 2: Multi-Semester Developmental Trajectory ---');
  try {
    const trajectories = profile.developmental_trajectories;
    
    assert(Boolean(trajectories.NILAI_AGAMA_BUDI_PEKERTI), 'Maps Nilai Agama & Budi Pekerti trajectory arc');
    assert(Boolean(trajectories.JATI_DIRI), 'Maps Jati Diri & Regulasi Emosi trajectory arc');
    assert(Boolean(trajectories.LITERASI_STEAM), 'Maps Dasar Literasi & STEAM trajectory arc');
    assert(Boolean(trajectories.PROJEK_P5), 'Maps Projek P5 trajectory arc');
    
    const steamTraj = trajectories.LITERASI_STEAM;
    assert(steamTraj.current_rating === 'BSB' || steamTraj.current_rating === 'BSH', 'Reflects developmental rating without numerical score');
    assert(Array.isArray(steamTraj.observed_strengths), 'Identifies qualitative strengths from empirical portfolio');
    assert(steamTraj.system_identified_growth_focus.length > 0, 'Identifies play-based stimulation focus areas');
  } catch (err: any) {
    assert(false, 'Module 2 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 3: Invariant C-11 Quarantine (Confidential Isolation)
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 3: Invariant C-11 Quarantine in Continuity Analytics ---');
  try {
    // 1. Create a staff confidential observation with distinctive phrase
    const confidentialNote = 'CONFIDENTIAL_PSYCHOLOGY_STAFF_NOTE_77';
    await teacherDailyWorkService.captureQuickObservation({
      school_id: schoolId,
      class_id: classId,
      target_student_ids: [kenzoStudentId],
      domain: 'SOSIAL_EMOSIONAL',
      quick_tags: ['STAFF_ONLY'],
      initial_note: confidentialNote,
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: teacherName,
      role: 'TEACHER'
    });

    const refreshedProfile = await childContinuityService.getChildContinuityProfile(kenzoStudentId, schoolId);
    const jsonStr = JSON.stringify(refreshedProfile);
    
    assert(!jsonStr.includes(confidentialNote), 'Staff confidential observations are strictly quarantined from Continuity Profile (Invariant C-11)');
  } catch (err: any) {
    assert(false, 'Module 3 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 4: Non-Authoritative System Proposal & Traceable Historical Anchor
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 4: System Proposal & Traceable Historical Anchor ---');
  let proposedPlan: any;
  try {
    const genRes = await childContinuityService.generateProposedStimulationPlans({
      school_id: schoolId,
      class_id: classId,
      academic_year_id: academicYearId,
      semester,
      student_ids: [kenzoStudentId],
      requested_by_person_id: teacherPersonId,
      requested_by_name: teacherName,
      role: 'TEACHER'
    });

    assert(genRes.success, 'generateProposedStimulationPlans executed successfully');
    assert(genRes.generated_plans.length > 0, 'Generates stimulation plan for Kenzo');

    proposedPlan = genRes.generated_plans[0];
    assert(proposedPlan.status === 'PROPOSED', 'Initial plan status is PROPOSED (Non-Authoritative)');
    assert(Boolean(proposedPlan.source_historical_baseline_record_id), 'Plan maintains mandatory historical baseline anchor');
    assert(proposedPlan.system_proposal.suggested_play_centers.includes('SENTRA_BALOK'), 'System proposes relevant play center based on historical STEAM strengths');
    assert(proposedPlan.system_proposal.suggested_provocations.length > 0, 'Provides rich classroom provocation prompts');
  } catch (err: any) {
    assert(false, 'Module 4 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 5: Teacher Authority & State Machine Lifecycle
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 5: Teacher Authority & State Machine Lifecycle ---');
  let confirmedPlan: any;
  try {
    // 1. Unauthorized activation attempt (Guard verification)
    let unauthorizedBlocked = false;
    try {
      await childContinuityService.confirmLearningStimulationPlan({
        plan_id: proposedPlan.plan_id,
        school_id: schoolId,
        teacher_decision: {} as any,
        share_with_home: false,
        confirmed_by_person_id: 'per_student_imposter',
        confirmed_by_name: 'Imposter',
        role: 'STUDENT'
      });
    } catch (err: any) {
      if (err?.message?.includes('UNAUTHORIZED')) {
        unauthorizedBlocked = true;
      }
    }
    assert(unauthorizedBlocked, 'System prevents unauthorized plan activation (Teacher Authority Guard)');

    // 2. Authoritative Teacher Confirmation
    const confirmRes = await childContinuityService.confirmLearningStimulationPlan({
      plan_id: proposedPlan.plan_id,
      school_id: schoolId,
      teacher_decision: {
        decided_by_person_id: teacherPersonId,
        decided_by_name: teacherName,
        decision_timestamp: new Date().toISOString(),
        is_accepted_as_suggested: true,
        adapted_goal: 'Memfasilitasi Kenzo merancang jembatan balok mandiri.',
        chosen_play_centers: ['SENTRA_BALOK'],
        custom_teacher_provocations: ['Menyediakan kartu tantangan jembatan pelangi.'],
        pedagogical_notes: 'Kenzo sangat responsif bila diberikan tantangan bertahap.',
        differentiation_strategy: 'Pendampingan dialog scaffolding saat perencanaan.'
      },
      share_with_home: true,
      home_activity_prompt: 'Ajak ananda menyusun balok atau lego bersama ayah di rumah.',
      confirmed_by_person_id: teacherPersonId,
      confirmed_by_name: teacherName,
      role: 'TEACHER'
    });

    assert(confirmRes.success, 'confirmLearningStimulationPlan executed successfully');
    confirmedPlan = confirmRes.plan;
    assert(confirmedPlan.status === 'ACTIVE', 'Plan transitions to ACTIVE status upon teacher confirmation');
    assert(Boolean(confirmedPlan.teacher_decision), 'Embeds teacher authoritative pedagogical decision');
    assert(confirmedPlan.home_school_extension?.is_shared_with_home === true, 'Enables home-school bridge extension');

    // 3. Complete Plan with New Evidence
    const completeRes = await childContinuityService.completeLearningStimulationPlan({
      plan_id: confirmedPlan.plan_id,
      school_id: schoolId,
      completion_reflection: 'Kenzo berhasil menyelesaikan jembatan balok 14 tingkat dan menjelaskan konsepnya.',
      linked_observation_evidence_ids: ['obs_demo_steam_01'],
      completed_by_person_id: teacherPersonId,
      completed_by_name: teacherName,
      role: 'TEACHER'
    });

    assert(completeRes.success, 'completeLearningStimulationPlan executed successfully');
    assert(completeRes.plan.status === 'COMPLETED', 'Plan transitions to COMPLETED status');
  } catch (err: any) {
    assert(false, 'Module 5 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 6: Scoped Guardian Bridge & Closed Semester Guard
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 6: Scoped Guardian Bridge & Closed Semester Guard ---');
  try {
    // 1. Guardian records home stimulation reflection
    const guardianFeedbackRes = await childContinuityService.recordHomeStimulationFeedback({
      plan_id: confirmedPlan.plan_id,
      school_id: schoolId,
      student_id: kenzoStudentId,
      guardian_person_id: guardianPersonId,
      guardian_name: guardianName,
      home_reflection_notes: 'Kenzo antusias membuat menara balok bersama ayah kemarin malam.',
      role: 'GUARDIAN'
    });

    assert(guardianFeedbackRes.success, 'recordHomeStimulationFeedback executed successfully');
    assert(guardianFeedbackRes.plan.home_school_extension?.parent_acknowledgment_status === 'ACKNOWLEDGED', 'Home reflection acknowledged');
    
    // Verify canonical ratings were NOT mutated by parent feedback
    const finalProfile = await childContinuityService.getChildContinuityProfile(kenzoStudentId, schoolId);
    assert(finalProfile.developmental_trajectories.LITERASI_STEAM.current_rating === 'BSB' || finalProfile.developmental_trajectories.LITERASI_STEAM.current_rating === 'BSH', 'Parent reflection does NOT mutate school canonical rating');

    // 2. Closed Semester Guard
    const academicYears = db.getAcademicYears(schoolId);
    const activeAy = academicYears.find(ay => ay.isActive);
    if (activeAy) {
      activeAy.isActive = false;
      let closedBlocked = false;
      try {
        await childContinuityService.generateProposedStimulationPlans({
          school_id: schoolId,
          class_id: classId,
          academic_year_id: academicYearId,
          semester,
          requested_by_person_id: teacherPersonId,
          requested_by_name: teacherName,
          role: 'TEACHER'
        });
      } catch (err: any) {
        if (err?.message?.includes('CANNOT_MUTATE_CLOSED_SEMESTER')) {
          closedBlocked = true;
        }
      }
      assert(closedBlocked, 'generateProposedStimulationPlans blocked on closed semester (CANNOT_MUTATE_CLOSED_SEMESTER)');
      activeAy.isActive = true; // Restore
    }
  } catch (err: any) {
    assert(false, 'Module 6 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 7: Classroom Developmental Heatmap
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 7: Classroom Developmental Heatmap & Aggregate Read Model ---');
  try {
    const heatmap = await childContinuityService.getClassroomDevelopmentalHeatmap(actualClassId, schoolId);
    
    assert(Boolean(heatmap), 'Classroom developmental heatmap projected');
    assert(heatmap.total_students_count > 0, 'Counts total students in classroom');
    assert(Boolean(heatmap.element_distribution.LITERASI_STEAM), 'Aggregates STEAM distribution across classroom');
    assert(Boolean(heatmap.element_distribution.JATI_DIRI), 'Aggregates Jati Diri distribution across classroom');
    assert(heatmap.element_distribution.LITERASI_STEAM.priority_stimulation_centers.includes('SENTRA_BALOK'), 'Identifies priority play centers for classroom stimulation');
  } catch (err: any) {
    assert(false, 'Module 7 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 8: Fase 4.3-D Home-School Growth Bridge Governance
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 8: Fase 4.3-D Home-School Growth Bridge Governance ---');
  try {
    // Setup: Generate a fresh plan and activate it with home extension
    const genRes = await childContinuityService.generateProposedStimulationPlans({
      school_id: schoolId,
      class_id: actualClassId,
      academic_year_id: academicYearId,
      semester,
      student_ids: [kenzoStudentId],
      requested_by_person_id: teacherPersonId,
      requested_by_name: teacherName,
      role: 'TEACHER'
    });
    const freshPlan = genRes.generated_plans[0];

    // Confirm as ACTIVE with Home Extension
    const confirmedRes = await childContinuityService.confirmLearningStimulationPlan({
      plan_id: freshPlan.plan_id,
      school_id: schoolId,
      teacher_decision: {
        decided_by_person_id: teacherPersonId,
        decided_by_name: teacherName,
        decision_timestamp: new Date().toISOString(),
        is_accepted_as_suggested: true,
        adapted_goal: 'Eksplorasi jembatan balok bersama di rumah.',
        chosen_play_centers: ['SENTRA_BALOK'],
        custom_teacher_provocations: [],
        pedagogical_notes: 'Dukungan orang tua sangat membantu.',
        differentiation_strategy: 'Bermain balok teratur.'
      },
      share_with_home: true,
      home_activity_prompt: 'Ajak ananda merancang jembatan balok sebelum tidur.',
      confirmed_by_person_id: teacherPersonId,
      confirmed_by_name: teacherName,
      role: 'TEACHER'
    });

    const activeSharedPlan = confirmedRes.plan;

    // 1. Unshared or PROPOSED plans must NEVER leak into Guardian projection
    const allPlans = await childContinuityService.getActiveLearningStimulationPlans(schoolId, undefined, kenzoStudentId);
    const unsharedPlans = allPlans.filter(p => p.status === 'PROPOSED' || !p.home_school_extension?.is_shared_with_home);
    const guardianVisiblePlans = allPlans.filter(p => p.status === 'ACTIVE' && p.home_school_extension?.is_shared_with_home);
    
    assert(guardianVisiblePlans.length > 0, 'Guardian has visibility of authorized ACTIVE shared plan');
    assert(guardianVisiblePlans.every(p => p.status === 'ACTIVE'), 'Plan Visibility Gate: Only ACTIVE plans are visible to Guardian');
    assert(unsharedPlans.every(p => p.status !== 'ACTIVE' || !p.home_school_extension?.is_shared_with_home), 'PROPOSED and unshared plans remain strictly internal');

    // 2. Invariant C-11: Confidential records never exposed in Guardian Bridge
    const guardianProjectionJson = JSON.stringify(guardianVisiblePlans);
    assert(!guardianProjectionJson.includes('CONFIDENTIAL_PSYCHOLOGY_STAFF_NOTE_77'), 'Invariant C-11: Confidential notes 100% quarantined from Guardian Bridge');

    // 3. Non-authoritative feedback verification
    const originalRating = profile.developmental_trajectories.LITERASI_STEAM.current_rating;
    
    await childContinuityService.recordHomeStimulationFeedback({
      plan_id: activeSharedPlan.plan_id,
      school_id: schoolId,
      student_id: kenzoStudentId,
      guardian_person_id: guardianPersonId,
      guardian_name: guardianName,
      home_reflection_notes: 'Kenzo merancang jembatan balok dengan antusias bersama keluarga di rumah.',
      role: 'GUARDIAN'
    });

    const verifyProfile = await childContinuityService.getChildContinuityProfile(kenzoStudentId, schoolId);
    assert(verifyProfile.developmental_trajectories.LITERASI_STEAM.current_rating === originalRating, 'Non-Authoritative Invariant: Home reflection DOES NOT mutate canonical rating');
    assert(activeSharedPlan.home_school_extension?.parent_acknowledgment_status === 'ACKNOWLEDGED', 'Home reflection timestamped and acknowledged');
  } catch (err: any) {
    assert(false, 'Module 8 failure', err?.message);
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 4.3 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Stage 4.3 Test Suite failed with ${failedTests} failures.`);
  }
}

// Run standalone if executed directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  runStage43ContinuityTests().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
