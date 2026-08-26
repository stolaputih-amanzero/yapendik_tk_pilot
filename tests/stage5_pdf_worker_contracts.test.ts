/**
 * ==============================================================================
 * YAPENDIK SCHOOL OS TK PILOT - TEST SUITE 23
 * STAGE 5 SPRINT 3: SERVER-SIDE PDF WORKER & TAMPER-PROOF CONTRACTS (ADR-04)
 * ==============================================================================
 * Covers:
 * - Module 1: PDF Generation Queue Authorization & Pre-condition Workflow
 * - Module 2: Cross-Tenant Queue Isolation (Headmaster Scope Barrier)
 * - Module 3: Cryptographic Integrity Verification & Anti-Tampering Guarantee
 * - Module 4: State Machine Immutability & Terminal Completion Rules
 * - Module 5: Migration M10 DDL & Down-Script Rollback Contract
 * ==============================================================================
 */

import { strict as assert } from 'node:assert/strict';
import fs from 'fs';
import path from 'path';

import {
  pdfWorkerService,
  PdfSecurityContext
} from '../src/services/pdfWorkerService';

export async function runStage5PdfWorkerContractsTests() {
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 5 PDF WORKER & TAMPER-PROOF CONTRACT TEST SUITE (SUITE 23)');
  console.log('════════════════════════════════════════════════════════════════\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;

  function runCheck(testName: string, fn: () => Promise<void> | void) {
    totalTests++;
    try {
      const res = fn();
      if (res && typeof (res as any).then === 'function') {
        return (res as Promise<void>).then(() => {
          passedTests++;
          console.log(`  🟢 PASS: ${testName}`);
        }).catch((err: any) => {
          failedTests++;
          console.error(`  ❌ FAIL: ${testName}`);
          console.error(`     Error: ${err?.message || err}`);
        });
      }
      passedTests++;
      console.log(`  🟢 PASS: ${testName}`);
    } catch (err: any) {
      failedTests++;
      console.error(`  ❌ FAIL: ${testName}`);
      console.error(`     Error: ${err?.message || err}`);
    }
  }

  const migrationsDir = path.resolve(process.cwd(), 'db_migrations');
  const m10Path = path.join(migrationsDir, 'm10_pdf_generation_queue_and_ledger.sql');
  const m10DownPath = path.join(migrationsDir, 'm10_pdf_generation_queue_and_ledger_down.sql');

  const teacherContext: PdfSecurityContext = {
    personId: 'per_teacher_siti',
    role: 'TEACHER',
    schoolId: 'sch_tk_menteng_01'
  };

  const guardianContext: PdfSecurityContext = {
    personId: 'per_parent_budi',
    role: 'GUARDIAN'
  };

  const headmasterTk01: PdfSecurityContext = {
    personId: 'per_hm_esther',
    role: 'HEADMASTER',
    schoolId: 'sch_tk_menteng_01'
  };

  const headmasterTk02: PdfSecurityContext = {
    personId: 'per_hm_cabang',
    role: 'HEADMASTER',
    schoolId: 'sch_tk_cabang_02'
  };

  const superadminContext: PdfSecurityContext = {
    personId: 'per_admin_andreas',
    role: 'SUPERADMIN'
  };

  pdfWorkerService.resetLedger();

  // ------------------------------------------------------------------------------
  // MODULE 1: QUEUE AUTHORIZATION & PRE-CONDITION WORKFLOW
  // ------------------------------------------------------------------------------
  console.log('--- MODULE 1: Queue Authorization & Pre-condition Workflow ---');

  await runCheck('Suite 23 [ROLE BLOCK]: Teacher is strictly blocked from commissioning official PDF', async () => {
    await assert.rejects(
      async () => {
        await pdfWorkerService.requestOfficialPdfGeneration(
          'LPPA_SEMESTER_REPORT',
          'lppa_sem1_stu_101',
          teacherContext,
          { entitySchoolId: 'sch_tk_menteng_01', entityStatus: 'APPROVED' }
        );
      },
      /PDF_GENERATION_ACCESS_DENIED/
    );
  });

  await runCheck('Suite 23 [ROLE BLOCK]: Guardian is strictly blocked from commissioning official PDF', async () => {
    await assert.rejects(
      async () => {
        await pdfWorkerService.requestOfficialPdfGeneration(
          'LPPA_SEMESTER_REPORT',
          'lppa_sem1_stu_101',
          guardianContext,
          { entitySchoolId: 'sch_tk_menteng_01', entityStatus: 'APPROVED' }
        );
      },
      /PDF_GENERATION_ACCESS_DENIED/
    );
  });

  await runCheck('Suite 23 [PRE-CONDITION]: Unapproved LPPA (DRAFT) cannot be commissioned for PDF', async () => {
    await assert.rejects(
      async () => {
        await pdfWorkerService.requestOfficialPdfGeneration(
          'LPPA_SEMESTER_REPORT',
          'lppa_draft_stu_102',
          headmasterTk01,
          { entitySchoolId: 'sch_tk_menteng_01', entityStatus: 'DRAFT' }
        );
      },
      /LPPA_NOT_OFFICIALLY_APPROVED/
    );
  });

  let createdRequest: any;
  await runCheck('Suite 23 [HEADMASTER VALID]: Headmaster commissioning APPROVED LPPA succeeds (PENDING status)', async () => {
    createdRequest = await pdfWorkerService.requestOfficialPdfGeneration(
      'LPPA_SEMESTER_REPORT',
      'lppa_approved_stu_101',
      headmasterTk01,
      { entitySchoolId: 'sch_tk_menteng_01', entityStatus: 'APPROVED' }
    );

    assert.ok(createdRequest.requestId.startsWith('pdf_req_'));
    assert.equal(createdRequest.status, 'PENDING');
    assert.equal(createdRequest.schoolId, 'sch_tk_menteng_01');
    assert.equal(createdRequest.bsreSignatureStatus, 'UNSIGNED');
  });

  // ------------------------------------------------------------------------------
  // MODULE 2: CROSS-TENANT QUEUE ISOLATION
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 2: Cross-Tenant Queue Isolation ---');

  await runCheck('Suite 23 [TENANT ISOLATION]: Headmaster from TK 02 commissioning PDF for TK 01 is rejected', async () => {
    await assert.rejects(
      async () => {
        await pdfWorkerService.requestOfficialPdfGeneration(
          'LPPA_SEMESTER_REPORT',
          'lppa_approved_stu_101',
          headmasterTk02,
          { entitySchoolId: 'sch_tk_menteng_01', entityStatus: 'APPROVED' }
        );
      },
      /PDF_CROSS_TENANT_ACCESS_DENIED/
    );
  });

  await runCheck('Suite 23 [TENANT ISOLATION]: Headmaster from TK 02 reading TK 01 queue record is rejected', () => {
    assert.throws(
      () => {
        pdfWorkerService.getPdfRequestById(createdRequest.requestId, headmasterTk02);
      },
      /PDF_CROSS_TENANT_ACCESS_DENIED/
    );
  });

  await runCheck('Suite 23 [TENANT VALID]: Headmaster from TK 01 can read their own queue item', () => {
    const item = pdfWorkerService.getPdfRequestById(createdRequest.requestId, headmasterTk01);
    assert.ok(item);
    assert.equal(item?.requestId, createdRequest.requestId);
  });

  // ------------------------------------------------------------------------------
  // MODULE 3: CRYPTOGRAPHIC INTEGRITY & ANTI-TAMPERING (ADR-04)
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 3: Cryptographic Integrity & Anti-Tampering (ADR-04) ---');

  const authenticPdfBuffer = Buffer.from('%PDF-1.4 \n1 0 obj\n<< /Title (Official LPPA 2025/2026) >>\nendobj\n%%EOF');
  const tamperedPdfBuffer = Buffer.from('%PDF-1.4 \n1 0 obj\n<< /Title (Tampered Fake Grade LPPA) >>\nendobj\n%%EOF');

  let completedRequest: any;
  await runCheck('Suite 23 [WORKER COMPLETION]: Simulating worker completion calculates SHA-256 and sets COMPLETED', async () => {
    completedRequest = await pdfWorkerService.simulateWorkerCompletion(
      createdRequest.requestId,
      authenticPdfBuffer
    );

    assert.equal(completedRequest.status, 'COMPLETED');
    assert.ok(completedRequest.sha256Checksum);
    assert.equal(completedRequest.sha256Checksum?.length, 64, 'SHA-256 hash must be 64 hexadecimal characters');
    assert.ok(completedRequest.storageObjectPath?.includes('official_reports/sch_tk_menteng_01/lppa_semester_report/'));
  });

  await runCheck('Suite 23 [INTEGRITY PASS]: Verifying authentic PDF binary matches recorded ledger checksum', () => {
    const result = pdfWorkerService.verifyPdfArtifactIntegrity(
      completedRequest.requestId,
      authenticPdfBuffer
    );

    assert.equal(result.isValid, true);
    assert.equal(result.checksum, completedRequest.sha256Checksum);
  });

  await runCheck('Suite 23 [TAMPER DETECTION]: Corrupted/altered PDF binary is rejected with ARTIFACT_TAMPERED_OR_CORRUPTED', () => {
    assert.throws(
      () => {
        pdfWorkerService.verifyPdfArtifactIntegrity(
          completedRequest.requestId,
          tamperedPdfBuffer // Altered binary
        );
      },
      /ARTIFACT_TAMPERED_OR_CORRUPTED/
    );
  });

  await runCheck('Suite 23 [TAMPER DETECTION]: Forged external hash comparison is rejected', () => {
    assert.throws(
      () => {
        pdfWorkerService.verifyPdfArtifactIntegrity(
          completedRequest.requestId,
          'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855' // Mismatched SHA-256 string
        );
      },
      /ARTIFACT_TAMPERED_OR_CORRUPTED/
    );
  });

  // ------------------------------------------------------------------------------
  // MODULE 4: STATE MACHINE & IMMUTABILITY
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 4: State Machine & Immutability ---');

  await runCheck('Suite 23 [STATE IMMUTABILITY]: Completed PDF cannot be re-processed or mutated', async () => {
    await assert.rejects(
      async () => {
        await pdfWorkerService.simulateWorkerCompletion(
          completedRequest.requestId,
          Buffer.from('Some other content')
        );
      },
      /INVALID_STATE_TRANSITION/
    );
  });

  await runCheck('Suite 23 [SUPERADMIN]: Superadmin has universal oversight to commission PDF for any school', async () => {
    const adminReq = await pdfWorkerService.requestOfficialPdfGeneration(
      'CONTINUITY_PROFILE',
      'cont_prof_stu_201',
      superadminContext,
      { entitySchoolId: 'sch_tk_cabang_02' }
    );

    assert.equal(adminReq.status, 'PENDING');
    assert.equal(adminReq.schoolId, 'sch_tk_cabang_02');
  });

  // ------------------------------------------------------------------------------
  // MODULE 5: MIGRATION M10 DDL & DOWN-SCRIPT CONTRACT
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 5: Migration M10 DDL & Down-Script Contract ---');

  runCheck('Suite 23 [MIGRATION M10]: m10 DDL creates pdf_generation_requests with state guard & RLS', () => {
    assert.ok(fs.existsSync(m10Path), 'm10 migration file must exist');
    const m10Sql = fs.readFileSync(m10Path, 'utf8');

    assert.ok(m10Sql.includes('CREATE TABLE IF NOT EXISTS public.pdf_generation_requests'));
    assert.ok(m10Sql.includes('sha256_checksum TEXT'));
    assert.ok(m10Sql.includes('bsre_signature_status TEXT'));
    assert.ok(m10Sql.includes('fn_guard_pdf_request_lifecycle()'));
    assert.ok(m10Sql.includes('CREATE POLICY "Headmaster and Governance can view PDF queue"'));
    assert.ok(m10Sql.includes('CREATE POLICY "Headmaster and Governance can enqueue PDF request"'));
  });

  runCheck('Suite 23 [MIGRATION M10 DOWN]: m10 rollback down-script complies with ADR-01', () => {
    assert.ok(fs.existsSync(m10DownPath), 'm10 down-script file must exist');
    const m10DownSql = fs.readFileSync(m10DownPath, 'utf8');

    const expectedWarning = 'WARNING: Future down-scripts for tables with historical data MUST NOT use DROP TABLE. Use ARCHIVE quarantine instead (ADR-01).';
    assert.ok(m10DownSql.includes(expectedWarning), 'm10 down script must include ADR-01 archive warning');
    assert.ok(m10DownSql.includes('BEGIN;') && m10DownSql.includes('COMMIT;'), 'Must be transactional');
  });

  // ------------------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------------------
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 5 SUITE 23 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Stage 5 PDF Worker Test Suite Failed with ${failedTests} error(s).`);
  }
}

// Execute when invoked directly
if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('stage5_pdf_worker_contracts.test.ts')) {
  runStage5PdfWorkerContractsTests().catch(err => {
    console.error('Test execution failed:', err);
    process.exit(1);
  });
}
