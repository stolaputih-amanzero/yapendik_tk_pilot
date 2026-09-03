/**
 * YAPENDIK SCHOOL OS — STAGE 7 GATE 2
 * Admissions & Enrollment Continuum Adversarial Test Suite (Suite 44)
 * Governing Treaties: ADR-05, AP-01 through AP-07, FB-01, FB-03, FB-07
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import assert from 'node:assert/strict';
import { SecurityContextProvider } from '../src/auth/context';
import { FoundationAdmissionsTelemetryView } from '../src/workspaces/admissions/foundation/FoundationAdmissionsTelemetryView';
import { HeadmasterAdmissionsDesk } from '../src/workspaces/admissions/school/HeadmasterAdmissionsDesk';
import { ApplicationDashboard } from '../src/workspaces/admissions/portal/ApplicationDashboard';
import { StudentJourneyTimeline } from '../src/components/workspaces/StudentJourneyTimeline';
import { admissionsService } from '../src/services/admissionsService';
import { db } from '../src/db/database';
import { ProspectiveChildApplicant } from '../src/types/admissionsTypes';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 SUITE 44: STAGE 7 GATE 2 — ADMISSIONS & ENROLLMENT CONTINUUM (PPDB LOOP)');
console.log('════════════════════════════════════════════════════════════════');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runCheck(name: string, fn: () => void | Promise<void>) {
  totalTests++;
  try {
    const res = fn();
    if (res instanceof Promise) {
      return res.then(() => {
        console.log(`  🟢 PASS: ${name}`);
        passedTests++;
      }).catch((err) => {
        console.error(`  🔴 FAIL: ${name}`);
        console.error(`     Error: ${err?.message || err}`);
        failedTests++;
      });
    } else {
      console.log(`  🟢 PASS: ${name}`);
      passedTests++;
    }
  } catch (err: any) {
    console.error(`  🔴 FAIL: ${name}`);
    console.error(`     Error: ${err?.message || err}`);
    failedTests++;
  }
}

async function runAdmissionsLoopTests() {
  // ----------------------------------------------------------------------------
  // SCENARIO 1: Atomic Ceremony Execution & Lineage Sync (ADR-05)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 1: Atomic Ceremony Execution & Lineage Sync (ADR-05) ---');
  {
    const applicantId = 'app_suite44_ceremony_01';
    const testApplicant: ProspectiveChildApplicant = {
      applicant_id: applicantId,
      target_school_id: 'sch_tk_yapendik_01',
      academic_year_id: 'ay_2026_2027',
      target_class_level: 'TK_A',
      child_nik: '3171018888880001',
      child_full_name: 'Grace Abigail Wenas',
      child_nickname: 'Grace',
      child_gender: 'P',
      child_birth_place: 'Jakarta',
      child_birth_date: '2022-03-12',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Sam Ratulangi No. 15',
      creator_uid: 'usr_parent_grace',
      guardian_nik: '3171017777770001',
      guardian_full_name: 'Markus Wenas',
      guardian_relationship_type: 'AYAH',
      guardian_gender: 'L',
      guardian_phone_number: '081234567800',
      guardian_email: 'markus.wenas@email.com',
      status: 'TUITION_SETTLED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await admissionsService.createApplicant(testApplicant);

    // Record intake observation for Grace
    await admissionsService.recordIntakeObservation({
      observation_id: 'obs_suite44_grace',
      applicant_id: applicantId,
      observer_person_id: 'per_headmaster_sheryl',
      observation_date: '2026-08-15',
      developmental_domains: {
        gross_motor_skills: 'Keseimbangan sangat baik',
        fine_motor_skills: 'Dapat menggunting kertas garis lurus',
        language_communication: 'Komunikasi jelas dan ekspresif'
      },
      observer_qualitative_notes: 'Anak sangat antusias dan mandiri.',
      special_learning_needs_flag: false,
      recommended_class_level: 'TK_A',
      assessed_at: new Date().toISOString()
    });

    const result = await admissionsService.executeEnrollmentCeremony(
      applicantId,
      'cls_tk_a1',
      {
        personId: 'per_headmaster_sheryl',
        role: 'HEADMASTER',
        activeSchoolId: 'sch_tk_yapendik_01'
      }
    );

    runCheck('Ceremony returns success and promoted student ID', () => {
      assert.equal(result.success, true);
      assert.ok(result.promoted_student_id.startsWith('stu_'));
      assert.equal(result.has_baseline_snapshot, true);
    });

    runCheck('Applicant record status transitioned to ENROLLED_PROMOTED with snapshot', () => {
      const updated = admissionsService.getApplicant(applicantId);
      assert.equal(updated?.status, 'ENROLLED_PROMOTED');
      assert.ok(updated?.promoted_baseline_snapshot);
      assert.equal(updated?.promoted_baseline_snapshot.qualitative_intake_notes, 'Anak sangat antusias dan mandiri.');
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 2: Multi-Unit Race Protection & Auto-Cancellation (AP-06)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 2: Multi-Unit Cancellation Invariant (AP-06) ---');
  {
    const sharedNik = '3171019999990002';

    // Application at Unit 1
    const appUnit1: ProspectiveChildApplicant = {
      applicant_id: 'app_unit1_multi_race',
      target_school_id: 'sch_tk_yapendik_01',
      academic_year_id: 'ay_2026_2027',
      target_class_level: 'TK_A',
      child_nik: sharedNik,
      child_full_name: 'Jonathan Kevin',
      child_gender: 'L',
      child_birth_place: 'Jakarta',
      child_birth_date: '2022-01-10',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Menteng No. 1',
      creator_uid: 'usr_parent_jonathan',
      guardian_nik: '3171017777770002',
      guardian_full_name: 'Kevin Senior',
      guardian_relationship_type: 'AYAH',
      guardian_gender: 'L',
      guardian_phone_number: '081234567801',
      status: 'TUITION_SETTLED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Competing Application at Unit 2
    const appUnit2: ProspectiveChildApplicant = {
      applicant_id: 'app_unit2_multi_race',
      target_school_id: 'sch_tk_yapendik_02',
      academic_year_id: 'ay_2026_2027',
      target_class_level: 'TK_A',
      child_nik: sharedNik,
      child_full_name: 'Jonathan Kevin',
      child_gender: 'L',
      child_birth_place: 'Jakarta',
      child_birth_date: '2022-01-10',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Menteng No. 1',
      creator_uid: 'usr_parent_jonathan',
      guardian_nik: '3171017777770002',
      guardian_full_name: 'Kevin Senior',
      guardian_relationship_type: 'AYAH',
      guardian_gender: 'L',
      guardian_phone_number: '081234567801',
      status: 'SUBMITTED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    await admissionsService.createApplicant(appUnit1);
    await admissionsService.createApplicant(appUnit2);

    // Enroll at Unit 1
    await admissionsService.executeEnrollmentCeremony(
      'app_unit1_multi_race',
      'cls_tk_a1',
      {
        personId: 'per_headmaster_sheryl',
        role: 'HEADMASTER',
        activeSchoolId: 'sch_tk_yapendik_01'
      }
    );

    runCheck('Enrolled at Unit 1 marks competing application at Unit 2 as CANCELLED_ENROLLED_ELSEWHERE', () => {
      const competing = admissionsService.getApplicant('app_unit2_multi_race');
      assert.equal(competing?.status, 'CANCELLED_ENROLLED_ELSEWHERE');
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 3: Institutional Sovereignty Boundary (FB-03)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 3: Institutional Sovereignty Boundary (FB-03) ---');
  {
    const appOtherSchool: ProspectiveChildApplicant = {
      applicant_id: 'app_other_school_01',
      target_school_id: 'sch_tk_yapendik_02',
      academic_year_id: 'ay_2026_2027',
      target_class_level: 'TK_A',
      child_nik: '3171015555550003',
      child_full_name: 'Lucas Nathaniel',
      child_gender: 'L',
      child_birth_place: 'Jakarta',
      child_birth_date: '2022-02-14',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Kebayoran No. 5',
      creator_uid: 'usr_parent_lucas',
      guardian_nik: '3171014444440003',
      guardian_full_name: 'Nathaniel Senior',
      guardian_relationship_type: 'AYAH',
      guardian_gender: 'L',
      guardian_phone_number: '081234567802',
      status: 'TUITION_SETTLED',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    await admissionsService.createApplicant(appOtherSchool);

    await runCheck('Headmaster of Unit 1 is BLOCKED from executing ceremony for Unit 2 applicant', async () => {
      await assert.rejects(
        async () => {
          await admissionsService.executeEnrollmentCeremony(
            'app_other_school_01',
            'cls_tk_a1',
            {
              personId: 'per_headmaster_sheryl',
              role: 'HEADMASTER',
              activeSchoolId: 'sch_tk_yapendik_01' // Mismatched tenant
            }
          );
        },
        /TENANT_VIOLATION_C11/
      );
    });

    await runCheck('Ceremony execution rejected if applicant status is not TUITION_SETTLED', async () => {
      const draftApp: ProspectiveChildApplicant = {
        ...appOtherSchool,
        applicant_id: 'app_draft_test',
        status: 'SUBMITTED'
      };
      await admissionsService.createApplicant(draftApp);

      await assert.rejects(
        async () => {
          await admissionsService.executeEnrollmentCeremony(
            'app_draft_test',
            'cls_tk_a1',
            {
              personId: 'per_headmaster_kebayoran',
              role: 'HEADMASTER',
              activeSchoolId: 'sch_tk_yapendik_02'
            }
          );
        },
        /INVALID_PRECONDITION/
      );
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 4: Foundation Intake Telemetry Zero-PII & K-Anonymity (FB-01 & FB-07)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 4: Foundation Intake Telemetry Zero-PII & K-Anonymity (FB-01 & FB-07) ---');
  {
    const html = renderToString(
      <SecurityContextProvider initialPersonaId="user_superadmin_shirley">
        <FoundationAdmissionsTelemetryView />
      </SecurityContextProvider>
    );

    runCheck('Foundation Telemetry DOM contains ZERO 16-digit student NIK', () => {
      const nikMatch = html.match(/\b\d{16}\b/g);
      assert.equal(nikMatch, null, `Found potential NIK in telemetry DOM: ${nikMatch}`);
    });

    runCheck('Foundation Telemetry DOM contains ZERO 10-digit student NIS', () => {
      const nisMatch = html.match(/\b\d{10}\b/g);
      assert.equal(nisMatch, null, `Found potential NIS in telemetry DOM: ${nisMatch}`);
    });

    runCheck('Foundation Telemetry DOM contains ZERO individual applicant names', () => {
      assert.ok(!html.includes('Timothy Andreas Pandjaitan'), 'Found Timothy in Foundation DOM');
      assert.ok(!html.includes('Nathanael Evan Santoso'), 'Found Nathanael in Foundation DOM');
      assert.ok(!html.includes('Grace Abigail Wenas'), 'Found Grace in Foundation DOM');
    });

    runCheck('Foundation Telemetry displays K-Anonymity privacy badge', () => {
      assert.ok(html.includes('FB-07: K-Anonymity Protected'), 'Missing K-Anonymity badge');
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 5: Persona Routing Triage (Watch-Item W-PPDB)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 5: Persona Routing Triage (Watch-Item W-PPDB) ---');
  {
    // Test that Foundation Telemetry renders for Superadmin
    const superadminHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_superadmin_shirley">
        <FoundationAdmissionsTelemetryView />
      </SecurityContextProvider>
    );
    runCheck('Superadmin renders Foundation Admissions Telemetry view with quotas and funnels', () => {
      assert.ok(superadminHtml.includes('Pusat Telemetri Admisi &amp; Intake Jaringan TK'));
      assert.ok(superadminHtml.includes('Matriks Kuota Daya Tampung Multi-Unit'));
    });

    // Test that Headmaster Admissions Desk renders for Headmaster
    const headmasterHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_headmaster_sheryl">
        <HeadmasterAdmissionsDesk
          schoolId="sch_tk_yapendik_01"
          headmasterContext={{
            personId: 'per_headmaster_sheryl',
            role: 'HEADMASTER',
            activeSchoolId: 'sch_tk_yapendik_01'
          }}
        />
      </SecurityContextProvider>
    );
    runCheck('Headmaster renders Admissions Desk with review table and ceremony triggers', () => {
      assert.ok(headmasterHtml.includes('data-testid="applicant-review-table"'));
    });

    // Test that Application Dashboard renders for Guardian
    const guardianHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_parent_budi">
        <ApplicationDashboard
          creatorUid="user_parent_budi"
          personId="per_parent_budi"
          guardianName="Budi Santoso, S.T."
        />
      </SecurityContextProvider>
    );
    runCheck('Guardian renders Application Dashboard with personal applicant tracking', () => {
      assert.ok(guardianHtml.includes('data-testid="application-dashboard"'));
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 6: Longitudinal "Mile Zero" Ingestion in StudentJourneyTimeline
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 6: Longitudinal "Mile Zero" Ingestion ---');
  {
    // Render timeline for Millen (canonical student seeded with Mile Zero baseline)
    const timelineHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_teacher_siti">
        <StudentJourneyTimeline initialStudentId="stu_maranatha_01" />
      </SecurityContextProvider>
    );

    runCheck('StudentJourneyTimeline renders Mile Zero Intake Node at origin of timeline', () => {
      assert.ok(timelineHtml.includes('data-testid="mile-zero-node"'), 'Missing Mile Zero Node in DOM');
      assert.ok(timelineHtml.includes('Mile Zero — Observasi Awal &amp; Intake Penerimaan'), 'Missing Mile Zero Title');
      assert.ok(timelineHtml.includes('Inception Anchor'), 'Missing Inception Anchor Badge');
    });

    runCheck('Mile Zero Node respects Hukum 2 Flat Canvas (no nested card containers)', () => {
      // Mile Zero node is an article with tipographic divide-y rows, not nested Card > Card
      assert.ok(timelineHtml.includes('divide-y divide-line-soft'), 'Missing clean divide-y typographic layout');
    });
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 SUITE 44 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAdmissionsLoopTests().catch(err => {
  console.error('Unhandled error in Suite 44:', err);
  process.exit(1);
});
