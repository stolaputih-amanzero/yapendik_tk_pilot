/**
 * YAPENDIK SCHOOL OS — MASTER TEST SUITE RUNNER
 */

import { execSync } from 'child_process';

console.log('════════════════════════════════════════════════════════════════');
console.log('🚀 YAPENDIK SCHOOL OS TK PILOT — COMPREHENSIVE TEST PIPELINE');
console.log('════════════════════════════════════════════════════════════════\n');

try {
  console.log('▶️ [1/16] Running Runtime Behavioral & Authorization Security Suite...');
  execSync('npx tsx tests/runtime_security.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [2/16] Running SQL Schema & V2.1.5 RLS Contract Suite...');
  execSync('npx tsx tests/sql_schema_contract.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [3/16] Running Stage 3.4 Application Services Contract Suite...');
  execSync('npx tsx tests/stage3_4_services.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [4/16] Running Stage 4.1 Teacher Daily Work & Loop Contract Suite...');
  execSync('npx tsx tests/stage4_1_teacher_daily.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [5/16] Running Stage 4.1 Full End-to-End Persona Loop & Acceptance Suite...');
  execSync('npx tsx tests/stage4_1_full_e2e_persona_loop.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [6/16] Running Stage 4.2 LPPA Synthesis & Reporting Contract Suite...');
  execSync('npx tsx tests/stage4_2_lppa_reporting.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [7/16] Running Stage 4.3 Child Continuity & Learning Loop Suite...');
  execSync('npx tsx tests/stage4_3_continuity.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [8/16] Running Stage 4.4 School Safety & Operational Assurance Suite...');
  execSync('npx tsx tests/stage4_4_safety_assurance.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [9/16] Running Stage 4.5 Type System & Contract Tests Suite...');
  execSync('npx tsx tests/stage4_5_type_and_contract.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [10/16] Running Stage 4.5-C Service & DB Contracts Suite...');
  execSync('npx tsx tests/stage4_5_c_service_and_db_contracts.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [11/16] Running Stage 5 Infrastructure & Tech Debt Contracts Suite...');
  execSync('npx tsx tests/stage5_infrastructure_contracts.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [12/16] Running Stage 5 Storage & Edge Caching Contracts Suite...');
  execSync('npx tsx tests/stage5_storage_and_edge_contracts.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [13/16] Running Stage 5 PDF Worker & Tamper-Proof Contracts Suite...');
  execSync('npx tsx tests/stage5_pdf_worker_contracts.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [14/16] Running Stage 4.5-D The Glass Layer Adversarial Frontend Security Suite...');
  execSync('npx tsx tests/stage4_5_d_glass_layer_adversarial.test.tsx', { stdio: 'inherit' });

  console.log('\n▶️ [15/16] Running Stage 6 Admissions Backend Contracts Suite (Suites 26-28)...');
  execSync('npx tsx tests/stage6_admissions_contracts.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [16/16] Running Stage 6 Admissions Glass Layer Adversarial UI Suite (Suite 29)...');
  execSync('npx tsx tests/stage6_admissions_ui_contracts.test.tsx', { stdio: 'inherit' });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🎉 ALL INTEGRATION & SECURITY TEST SUITES COMPLETED SUCCESSFULLY');
  console.log('════════════════════════════════════════════════════════════════');
} catch (error) {
  console.error('\n❌ Test pipeline failed!');
  process.exit(1);
}
