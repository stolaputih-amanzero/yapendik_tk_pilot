/**
 * Yapendik School OS — Stage 4.4 School Safety & Operational Assurance Contract Suite
 * 
 * Tests the 8 Acceptance Gates:
 * 1. AB-01: Policy configuration (not hard-coded)
 * 2. AB-02: Signal != diagnosis (advisory trigger)
 * 3. AB-03: ASSURANCE-INV-01 (No silent safety state)
 * 4. AB-04: Audited incident transitions (who, when, why, action)
 * 5. AB-05: Closed semester mutation guard (CANNOT_MUTATE_CLOSED_SEMESTER)
 * 6. AB-06: Invariant C-11 quarantine for sensitive dossiers
 * 7. AB-07: Derived operational assurance telemetry (zero stale KPI tables)
 * 8. AB-08: Human authority escalation gates
 */

import { db } from '../src/db/database';
import { schoolSafetyAssuranceService } from '../src/services/schoolSafetyAssuranceService';
import { teacherDailyWorkService } from '../src/services/teacherDailyWorkService';

export async function runStage44SafetyAssuranceTests() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 4.4 SCHOOL SAFETY & OPERATIONAL ASSURANCE CONTRACT SUITE');
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
  const teacherPersonId = 'per_teacher_siti';
  const teacherName = 'Siti Rahmawati, S.Pd';
  const headmasterPersonId = 'per_hm_esther';
  const headmasterName = 'Dra. Esther Nugroho, M.Pd';

  const students = db.getStudents(schoolId);
  const kenzo = students[0];
  const kenzoStudentId = kenzo.id;
  const actualClassId = kenzo.currentClassId || classId;

  // -------------------------------------------------------------------------
  // MODULE 1: Configurable Policy Thresholds (AB-01) & Non-Diagnostic Signals (AB-02)
  // -------------------------------------------------------------------------
  console.log('--- MODULE 1: Configurable Policy & Non-Diagnostic Signals ---');
  try {
    // 1. Policy retrieved and modified dynamically
    const currentPolicy = schoolSafetyAssuranceService.getAttendanceRiskPolicy(schoolId);
    assert(currentPolicy.temperature_fever_threshold_celsius === 37.8, 'Default temperature fever threshold configured at 37.8°C');

    // 2. Record elevated temperature
    await teacherDailyWorkService.recordDailyAttendanceBatch({
      school_id: schoolId,
      class_id: actualClassId,
      attendance_date: new Date().toISOString().slice(0, 10),
      recorded_by_person_id: teacherPersonId,
      recorded_by_name: teacherName,
      role: 'TEACHER',
      entries: [
        {
          student_id: kenzoStudentId,
          status: 'HADIR',
          temperature_celsius: 38.2, // Elevated above 37.8°C
          arrival_mood: 'GELISAH'
        }
      ]
    });

    const pulse = await schoolSafetyAssuranceService.evaluateClassroomSafetyPulse(actualClassId, schoolId);
    const tempSignal = pulse.active_exception_signals.find(s => s.category === 'HEALTH_OBSERVATION' && s.student_id === kenzoStudentId);

    assert(Boolean(tempSignal), 'Deterministic exception signal emitted for elevated temperature');
    assert(tempSignal?.tier === 'TIER_2_EXCEPTION_SIGNAL', 'Classified accurately as Tier 2 Exception Signal');
    assert(!tempSignal?.deterministic_trigger_reason.includes('Demam Berdarah') && !tempSignal?.deterministic_trigger_reason.includes('Infeksi'), 'Non-Diagnostic Invariant: Signal contains zero clinical disease diagnoses');
    assert(tempSignal?.advisory_recommendation.suggested_actor_role === 'TEACHER', 'Recommends action to educator role');
  } catch (err: any) {
    assert(false, 'Module 1 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 2: Invariant ASSURANCE-INV-01 (No Silent Safety State) (AB-03)
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 2: ASSURANCE-INV-01 (No Silent Safety State) ---');
  try {
    const pulse = await schoolSafetyAssuranceService.evaluateClassroomSafetyPulse(actualClassId, schoolId);
    const tempSignal = pulse.active_exception_signals.find(s => s.category === 'HEALTH_OBSERVATION' && s.student_id === kenzoStudentId);
    
    if (tempSignal) {
      // 1. Blank action must fail validation
      let blankRejected = false;
      try {
        await schoolSafetyAssuranceService.acknowledgeExceptionSignal({
          signal_id: tempSignal.signal_id,
          school_id: schoolId,
          resolution_action_taken: '   ',
          acknowledged_by_person_id: teacherPersonId,
          acknowledged_by_name: teacherName,
          role: 'TEACHER'
        });
      } catch (err: any) {
        if (err?.message?.includes('VALIDATION_FAILED')) blankRejected = true;
      }
      assert(blankRejected, 'ASSURANCE-INV-01: Blank resolution rejected (No silent clearance)');

      // 2. Valid human acknowledgement
      const ackRes = await schoolSafetyAssuranceService.acknowledgeExceptionSignal({
        signal_id: tempSignal.signal_id,
        school_id: schoolId,
        resolution_action_taken: 'Ananda telah diberikan kompres hangat di UKS dan ayah telah dihubungi.',
        acknowledged_by_person_id: teacherPersonId,
        acknowledged_by_name: teacherName,
        role: 'TEACHER'
      });

      assert(ackRes.success, 'Exception signal acknowledged by authorized teacher');
      assert(ackRes.signal.is_acknowledged === true, 'Signal marked acknowledged with traceable timestamp');
    } else {
      assert(false, 'Temperature signal not found for Module 2');
    }
  } catch (err: any) {
    assert(false, 'Module 2 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 3: Incident Lifecycle State Machine & Audited Transitions (AB-04, AB-08)
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 3: Incident Lifecycle & Audited Transitions ---');
  let incidentRecord: any;
  try {
    // 1. Initial Report (DETECTED)
    const reportRes = await schoolSafetyAssuranceService.reportSafetyIncident({
      school_id: schoolId,
      class_id: actualClassId,
      affected_student_ids: [kenzoStudentId],
      tier: 'TIER_3_SAFETY_INCIDENT',
      severity: 'MODERATE_SUPERVISED',
      is_staff_confidential: false,
      title: 'Lutut lecet terbentur balok kayu',
      factual_chronology: 'Saat merancang jembatan balok, ananda tersandung balok landasan dan mengalami lecet ringan di lutut kanan.',
      location_in_school: 'Sentra Balok Kelas TK A',
      detected_by_person_id: teacherPersonId,
      detected_by_name: teacherName,
      role: 'TEACHER'
    });

    assert(reportRes.success, 'Initial safety incident reported successfully');
    incidentRecord = reportRes.incident;
    assert(incidentRecord.status === 'DETECTED', 'Initial lifecycle status is DETECTED');
    assert(incidentRecord.state_transitions.length === 1, 'Initial state transition logged');

    // 2. Unauthorized Triage Attempt (Role Gate Guard)
    let unauthTriageBlocked = false;
    try {
      await schoolSafetyAssuranceService.transitionIncidentLifecycle({
        incident_id: incidentRecord.incident_id,
        school_id: schoolId,
        target_status: 'TRIAGED',
        action_summary: 'Mencoba triage sebagai siswa',
        rationale_notes: 'Unauthorized test',
        notify_parent: false,
        actor_person_id: 'per_imposter',
        actor_name: 'Imposter',
        role: 'STUDENT'
      });
    } catch (err: any) {
      if (err?.message?.includes('UNAUTHORIZED')) unauthTriageBlocked = true;
    }
    assert(unauthTriageBlocked, 'Unauthorized actor blocked from triaging incident (Role Authority Guard)');

    // 3. Headmaster Triages (TRIAGED)
    const triageRes = await schoolSafetyAssuranceService.transitionIncidentLifecycle({
      incident_id: incidentRecord.incident_id,
      school_id: schoolId,
      target_status: 'TRIAGED',
      action_summary: 'Kepala sekolah memeriksa kondisi luka dan memverifikasi SOP P3K.',
      rationale_notes: 'Cedera kategori sedang, memerlukan perawatan antiseptik dan penjemputan awal.',
      notify_parent: true,
      parent_name: 'Budi Santoso, S.T.',
      actor_person_id: headmasterPersonId,
      actor_name: headmasterName,
      role: 'HEADMASTER'
    });

    assert(triageRes.incident.status === 'TRIAGED', 'Incident transitioned to TRIAGED by Headmaster');
    assert(triageRes.incident.parent_notified === true, 'Parent notified flag recorded');

    // 4. Contain & Resolve (CONTAINED -> RESOLVED)
    const resolveRes = await schoolSafetyAssuranceService.transitionIncidentLifecycle({
      incident_id: incidentRecord.incident_id,
      school_id: schoolId,
      target_status: 'RESOLVED',
      action_summary: 'Luka dibersihkan dengan antiseptik di UKS, diperban steril, dan ananda dijemput ayah pukul 10.30.',
      rationale_notes: 'Situasi tuntas dan terkendali dengan baik.',
      notify_parent: false,
      actor_person_id: teacherPersonId,
      actor_name: teacherName,
      role: 'TEACHER'
    });

    assert(resolveRes.incident.status === 'RESOLVED', 'Incident transitioned to RESOLVED');
    assert(resolveRes.incident.state_transitions.length === 3, 'Audit log tracks full sequence: DETECTED -> TRIAGED -> RESOLVED');
    assert(Boolean(resolveRes.incident.resolved_at), 'Resolution timestamp recorded');
  } catch (err: any) {
    assert(false, 'Module 3 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 4: Invariant C-11 Confidential Quarantine (AB-06)
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 4: Invariant C-11 Sensitive Dossier Quarantine ---');
  try {
    // Report Tier 4 confidential child protection case
    const tier4Res = await schoolSafetyAssuranceService.reportSafetyIncident({
      school_id: schoolId,
      class_id: actualClassId,
      affected_student_ids: [kenzoStudentId],
      tier: 'TIER_4_CHILD_PROTECTION_DOSSIER',
      severity: 'CRITICAL_URGENT',
      is_staff_confidential: true,
      title: 'CONFIDENTIAL_PROTECTION_CASE_88',
      factual_chronology: 'Catatan mediasi internal tertutup mengenai hak perwalian anak.',
      location_in_school: 'Ruang Kepala Sekolah',
      detected_by_person_id: headmasterPersonId,
      detected_by_name: headmasterName,
      role: 'HEADMASTER'
    });

    // Query incidents as public/guardian role
    const publicIncidents = await schoolSafetyAssuranceService.getIncidents(schoolId, 'GUARDIAN', actualClassId);
    const leakedConfidential = publicIncidents.find(i => i.title.includes('CONFIDENTIAL_PROTECTION_CASE_88'));

    assert(!leakedConfidential, 'Invariant C-11: Confidential Tier 4 dossiers are 100% quarantined from unprivileged roles');

    const privilegedIncidents = await schoolSafetyAssuranceService.getIncidents(schoolId, 'HEADMASTER', actualClassId);
    assert(Boolean(privilegedIncidents.find(i => i.title.includes('CONFIDENTIAL_PROTECTION_CASE_88'))), 'Authorized Headmaster granted access to sensitive protection dossier');
  } catch (err: any) {
    assert(false, 'Module 4 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 5: Derived Operational Assurance Telemetry (AB-07)
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 5: Derived Operational Assurance Telemetry ---');
  try {
    const assurance = await schoolSafetyAssuranceService.getSchoolOperationalAssurance(schoolId);
    
    assert(Boolean(assurance), 'Operational assurance telemetry computed dynamically');
    assert(typeof assurance.operational_integrity_score_pct === 'number', 'Integrity score projected as quantitative percentage');
    assert(assurance.operational_integrity_score_pct >= 0 && assurance.operational_integrity_score_pct <= 100, 'Score is bounded between 0-100%');
    assert(Boolean(assurance.foundation_assurance_badges), 'Projects high-level assurance badges for Foundation');
    
    const assuranceJson = JSON.stringify(assurance);
    assert(!assuranceJson.includes('CONFIDENTIAL_PROTECTION_CASE_88'), 'Foundation telemetry is strictly aggregated (Zero individual medical/confidential details)');
  } catch (err: any) {
    assert(false, 'Module 5 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 6: Stage 3 Closed Semester Guard (AB-05)
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 6: Stage 3 Closed Semester Guard ---');
  try {
    const academicYears = db.getAcademicYears(schoolId);
    const activeAy = academicYears.find(ay => ay.isActive);
    if (activeAy) {
      activeAy.isActive = false;
      let closedBlocked = false;
      try {
        await schoolSafetyAssuranceService.reportSafetyIncident({
          school_id: schoolId,
          class_id: actualClassId,
          affected_student_ids: [kenzoStudentId],
          tier: 'TIER_3_SAFETY_INCIDENT',
          severity: 'MINOR_RESOLVABLE',
          is_staff_confidential: false,
          title: 'Blocked closed semester test',
          factual_chronology: 'Should fail',
          location_in_school: 'Kelas',
          detected_by_person_id: teacherPersonId,
          detected_by_name: teacherName,
          role: 'TEACHER'
        });
      } catch (err: any) {
        if (err?.message?.includes('CANNOT_MUTATE_CLOSED_SEMESTER')) {
          closedBlocked = true;
        }
      }
      assert(closedBlocked, 'Safety mutations blocked on closed semester (CANNOT_MUTATE_CLOSED_SEMESTER)');
      activeAy.isActive = true; // Restore
    }
  } catch (err: any) {
    assert(false, 'Module 6 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 7: Headmaster Operational Assurance View Model (HD-01, HD-02, HD-08)
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 7: Headmaster Operational Assurance View Model ---');
  try {
    const hmViewModel = await schoolSafetyAssuranceService.getHeadmasterOperationalAssurance(
      schoolId,
      'HEADMASTER',
      headmasterPersonId
    );

    assert(Boolean(hmViewModel), 'Headmaster operational assurance read-model projected');
    assert(hmViewModel.school_context.school_name === 'TK Yapendik Menteng', 'Accurate school jurisdiction context (HD-01)');
    assert(typeof hmViewModel.today_assurance.attendance.attendance_rate_pct === 'number', 'Derived attendance rate projected (HD-02)');
    assert(hmViewModel.today_assurance.handover.handover_rate_pct === 100, 'Handover reconciliation projected as first-class metric (HD-08)');
    assert(Array.isArray(hmViewModel.needs_attention_queue), 'Needs attention queue projected');
    assert(Array.isArray(hmViewModel.incident_pipeline), 'Incident pipeline projected');
    assert(typeof hmViewModel.audit_readiness.semester_close_ready === 'boolean', 'Projects audit readiness for Option A Gate');
  } catch (err: any) {
    assert(false, 'Module 7 failure', err?.message);
  }

  // -------------------------------------------------------------------------
  // MODULE 8: Full 5-State Audited Lifecycle E2E (HD-04: DETECTED -> TRIAGED -> CONTAINED -> RESOLVED -> AUDITED_CLOSED)
  // -------------------------------------------------------------------------
  console.log('\n--- MODULE 8: Full 5-State Audited Lifecycle E2E ---');
  try {
    // 1. DETECTED
    const fullLifecycleRes = await schoolSafetyAssuranceService.reportSafetyIncident({
      school_id: schoolId,
      class_id: actualClassId,
      affected_student_ids: [kenzoStudentId],
      tier: 'TIER_3_SAFETY_INCIDENT',
      severity: 'MODERATE_SUPERVISED',
      is_staff_confidential: false,
      title: 'Jari terjepit loker sepatu',
      factual_chronology: 'Saat mengganti sepatu di loker, jari telunjuk kanan ananda terjepit pintu loker.',
      location_in_school: 'Lobi Masuk TK A',
      detected_by_person_id: teacherPersonId,
      detected_by_name: teacherName,
      role: 'TEACHER'
    });
    const incId = fullLifecycleRes.incident.incident_id;
    assert(fullLifecycleRes.incident.status === 'DETECTED', 'State 1/5: DETECTED verified');

    // 2. TRIAGED (Headmaster)
    const triagedRes = await schoolSafetyAssuranceService.transitionIncidentLifecycle({
      incident_id: incId,
      school_id: schoolId,
      target_status: 'TRIAGED',
      action_summary: 'Kepala sekolah memeriksa kondisi bengkak dan kompres es.',
      rationale_notes: 'Tingkat sedang, perlu pemantauan gerak motorik halus jari.',
      notify_parent: true,
      parent_name: 'Budi Santoso',
      actor_person_id: headmasterPersonId,
      actor_name: headmasterName,
      role: 'HEADMASTER'
    });
    assert(triagedRes.incident.status === 'TRIAGED', 'State 2/5: TRIAGED verified');

    // 3. CONTAINED (Teacher / Nurse)
    const containedRes = await schoolSafetyAssuranceService.transitionIncidentLifecycle({
      incident_id: incId,
      school_id: schoolId,
      target_status: 'CONTAINED',
      action_summary: 'Jari dikompres es 15 menit, ananda kembali tenang dan dapat menggenggam krayon.',
      rationale_notes: 'Kondisi stabil di bawah pengawasan guru pendamping.',
      notify_parent: false,
      actor_person_id: teacherPersonId,
      actor_name: teacherName,
      role: 'TEACHER'
    });
    assert(containedRes.incident.status === 'CONTAINED', 'State 3/5: CONTAINED verified');

    // 4. RESOLVED (Teacher)
    const resolvedRes = await schoolSafetyAssuranceService.transitionIncidentLifecycle({
      incident_id: incId,
      school_id: schoolId,
      target_status: 'RESOLVED',
      action_summary: 'Ananda dijemput ayah saat pulang sekolah dalam kondisi ceria tanpa rasa sakit.',
      rationale_notes: 'Penanganan tuntas.',
      notify_parent: false,
      actor_person_id: teacherPersonId,
      actor_name: teacherName,
      role: 'TEACHER'
    });
    assert(resolvedRes.incident.status === 'RESOLVED', 'State 4/5: RESOLVED verified');

    // 5. AUDITED_CLOSED (Headmaster)
    const closedRes = await schoolSafetyAssuranceService.transitionIncidentLifecycle({
      incident_id: incId,
      school_id: schoolId,
      target_status: 'AUDITED_CLOSED',
      action_summary: 'Verifikasi audit akhir semester: SOP loker diperbaiki dan kasus dinyatakan selesai permanen.',
      rationale_notes: 'Penutupan audit sah oleh Kepala Sekolah.',
      notify_parent: false,
      actor_person_id: headmasterPersonId,
      actor_name: headmasterName,
      role: 'HEADMASTER'
    });
    assert(closedRes.incident.status === 'AUDITED_CLOSED', 'State 5/5: AUDITED_CLOSED verified (Zero Verification Debt)');
    assert(closedRes.incident.state_transitions.length === 5, 'Full 5-step transition audit trail sealed');
  } catch (err: any) {
    assert(false, 'Module 8 failure', err?.message);
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 4.4 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Stage 4.4 Test Suite failed with ${failedTests} failures.`);
  }
}

// Run standalone if executed directly
if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/'))) {
  runStage44SafetyAssuranceTests().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
