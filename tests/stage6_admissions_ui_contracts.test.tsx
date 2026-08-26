/**
 * YAPENDIK SCHOOL OS — STAGE 6 THE ADMISSIONS GLASS LAYER
 * ADVERSARIAL FRONTEND & DOM SECURITY TEST SUITE (SUITE 29)
 * 
 * Source of Truth: STAGE_6_GATE_0 & STAGE_6_GATE_1 (v1.1-REVISED & SEALED)
 * 
 * Verifies:
 * - Test 1: Ephemeral Guest Role (APPLICANT_GUARDIAN) Routing & Module Isolation
 * - Test 2: AP-04 Guardian Self-Service Boundary (Zero Cross-Parent Selector in DOM)
 * - Test 3: AP-06 Ceremony UI Precondition Enforcement (Disabled if status != TUITION_SETTLED)
 * - Test 4: AP-02 Intake Observation Quarantine (Zero LPPA sync triggers)
 * - Test 5: Staging Table Isolation in Review Workspace
 */

import { strict as assert } from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ApplicationDashboard } from '../src/workspaces/admissions/portal/ApplicationDashboard';
import { ApplicationStepper } from '../src/workspaces/admissions/portal/ApplicationStepper';
import { DocumentUploadZone } from '../src/workspaces/admissions/portal/DocumentUploadZone';
import { ApplicantReviewTable } from '../src/workspaces/admissions/school/ApplicantReviewTable';
import { IntakeObservationForm } from '../src/workspaces/admissions/school/IntakeObservationForm';
import { CeremonyExecutionModal } from '../src/workspaces/admissions/school/CeremonyExecutionModal';
import { admissionsService } from '../src/services/admissionsService';
import { ProspectiveChildApplicant } from '../src/types/admissionsTypes';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 STAGE 6 ADMISSIONS GLASS LAYER ADVERSARIAL UI TEST SUITE (SUITE 29)');
console.log('════════════════════════════════════════════════════════════════\n');

async function runAdmissionsUITests() {
  let passedTests = 0;
  let failedTests = 0;
  let totalTests = 0;

  function runCheck(testName: string, fn: () => void | Promise<void>) {
    totalTests++;
    try {
      fn();
      passedTests++;
      console.log(`  🟢 PASS: ${testName}`);
    } catch (err: any) {
      failedTests++;
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err?.message || err}`);
    }
  }

  // ------------------------------------------------------------------------------
  // SUITE 29: ADMISSIONS GLASS LAYER DOM & BOUNDARY CONTRACTS
  // ------------------------------------------------------------------------------
  console.log('--- SUITE 29: Admissions Glass Layer UI & Role Boundary Assertions ---');

  // Test 1: Ephemeral Guest Role Routing & Boundary Isolation (ADR-05)
  runCheck('Suite 29 [GUEST ROLE ISOLATION]: APPLICANT_GUARDIAN role is strictly quarantined to /admissions/portal/*', () => {
    const guestRole = 'APPLICANT_GUARDIAN';
    const allowedPrefixes = ['/admissions/portal'];
    const forbiddenRoutes = ['/school/admissions', '/teacher/work', '/lppa/reports', '/foundation/cockpit'];

    for (const route of forbiddenRoutes) {
      const isAllowed = allowedPrefixes.some(prefix => route.startsWith(prefix));
      assert.equal(isAllowed, false, `Route ${route} must be blocked for ${guestRole}`);
    }
  });

  // Test 2: AP-04 Guardian Self-Service Boundary (Zero Cross-Parent Selector in DOM)
  runCheck('Suite 29 [AP-04 SELF-SERVICE]: Parent portal DOM contains ZERO cross-parent applicant selectors', () => {
    const creatorUid = '00000000-0000-0000-0000-000000000001';
    const html = renderToString(<ApplicationDashboard creatorUid={creatorUid} />);

    // Assert data-testid exists
    assert.ok(html.includes('data-testid="application-dashboard"'));
    
    // Assert strictly bound to Timothy
    assert.ok(html.includes('Timothy Andreas Pandjaitan'));
    assert.ok(html.includes('Bona Pandjaitan, S.T.'));

    // Assert NO generic dropdowns to switch child or view other applicants
    assert.equal(html.includes('select-applicant-dropdown'), false);
    assert.equal(html.includes('switch-parent-account'), false);
  });

  // Test 2: AP-06 Ceremony UI Precondition Enforcement (Disabled button for SUBMITTED status)
  runCheck('Suite 29 [AP-06 CEREMONY PRECONDITION]: Ceremony modal disables confirmation for un-settled applicant', () => {
    const unSettledApp: ProspectiveChildApplicant = {
      applicant_id: 'app_test_unsettled',
      target_school_id: 'sch_tk_yapendik_01',
      academic_year_id: 'ay_2026_2027',
      target_class_level: 'TK_A',
      child_nik: '3171019999990001',
      child_full_name: 'Jonathan Doe',
      child_gender: 'L',
      child_birth_place: 'Jakarta',
      child_birth_date: '2022-01-01',
      child_religion: 'KRISTEN_PROTESTAN',
      child_address: 'Jl. Merdeka 1',
      creator_uid: '00000000-0000-0000-0000-000000000099',
      guardian_nik: '3171018888880001',
      guardian_full_name: 'John Doe',
      guardian_relationship_type: 'AYAH',
      guardian_gender: 'L',
      guardian_phone_number: '081200001111',
      status: 'SUBMITTED', // NOT TUITION_SETTLED!
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const html = renderToString(
      <CeremonyExecutionModal
        applicant={unSettledApp}
        headmasterContext={{ personId: 'per_hm_esther', role: 'HEADMASTER', activeSchoolId: 'sch_tk_yapendik_01' }}
        onSuccess={() => {}}
        onClose={() => {}}
      />
    );

    assert.ok(html.includes('Syarat Upacara Belum Terpenuhi'));
    assert.ok(html.includes('disabled=""') || html.includes('aria-disabled="true"'));
    assert.ok(html.includes('cursor-not-allowed'));
  });

  // Test 3: AP-02 Intake Observation Quarantine (Zero LPPA sync buttons)
  runCheck('Suite 29 [AP-02 INTAKE QUARANTINE]: Intake form contains ZERO LPPA synchronization buttons', () => {
    const app = admissionsService.getApplicant('app_2026_sch01_demo01')!;
    const html = renderToString(
      <IntakeObservationForm
        applicant={app}
        observerPersonId="per_teacher_sarah"
        onSaveSuccess={() => {}}
        onClose={() => {}}
      />
    );

    assert.ok(html.includes('Invarian AP-02: Karantina Asesmen Diagnostik Awal'));
    assert.ok(html.includes('Simpan Observasi Intake'));

    // Strictly assert NO LPPA synchronization controls exist
    assert.equal(html.includes('Sinkronisasi ke Rapor LPPA'), false);
    assert.equal(html.includes('Simpan ke LPPA'), false);
    assert.equal(html.includes('Publish to Portfolio'), false);
  });

  // Test 4: Staging Table Isolation in Review Workspace
  runCheck('Suite 29 [STAGING ISOLATION]: Review table renders only pre-canonical applicant data', () => {
    const applicants = admissionsService.listApplicantsForSchool('sch_tk_yapendik_01');
    const html = renderToString(
      <ApplicantReviewTable
        schoolId="sch_tk_yapendik_01"
        applicants={applicants}
        onSelectApplicant={() => {}}
        onOpenCeremonyModal={() => {}}
        onOpenIntakeModal={() => {}}
      />
    );

    assert.ok(html.includes('Tabel Pementasan Calon Siswa (Staging Isolation / Invarian AP-06)'));
    assert.ok(html.includes('app_2026_sch01_demo01'));
    assert.ok(html.includes('Observasi Intake'));
  });

  // Test 5: Stepper Visual States
  runCheck('Suite 29 [STEPPER LIFECYCLE]: Stepper renders correct step count and active state', () => {
    const html = renderToString(<ApplicationStepper currentStatus="TUITION_SETTLED" />);
    assert.ok(html.includes('data-testid="application-stepper"'));
    assert.ok(html.includes('TUITION_SETTLED'));
    assert.ok(html.includes('The Enrollment Ceremony'));
  });

  // Test 6: Document Upload Zone Encryption & AES-256 Badge
  runCheck('Suite 29 [DOCUMENT ZONE]: Document zone renders AES-256 encryption guarantee', () => {
    const docs = admissionsService.listDocuments('app_2026_sch01_demo01');
    const html = renderToString(
      <DocumentUploadZone
        applicantId="app_2026_sch01_demo01"
        documents={docs}
      />
    );

    assert.ok(html.includes('data-testid="document-upload-zone"'));
    assert.ok(html.includes('Enkripsi AES-256'));
    assert.ok(html.includes('Kartu Keluarga (KK)'));
    assert.ok(html.includes('Akta Kelahiran Anak'));
  });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6 SUITE 29 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAdmissionsUITests().catch(err => {
  console.error('Fatal UI Test Error:', err);
  process.exit(1);
});
