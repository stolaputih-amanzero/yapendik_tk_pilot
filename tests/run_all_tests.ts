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

  console.log('\n▶️ [16/17] Running Stage 6 Admissions Glass Layer Adversarial UI Suite (Suite 29)...');
  execSync('npx tsx tests/stage6_admissions_ui_contracts.test.tsx', { stdio: 'inherit' });

  console.log('\n▶️ [17/18] Running Amanaura Design System v1.0 Primitives Suite (Suite 30)...');
  execSync('npx tsx tests/amanaura_primitives.test.tsx', { stdio: 'inherit' });

  console.log('\n▶️ [18/19] Running Stage 6-A Briefing & Closure Backend Contracts Suite...');
  execSync('npx tsx tests/stage6a_briefing_backend.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [19/20] Running Stage 6-A Briefing Engine & State Machines Suite...');
  execSync('npx tsx tests/stage6a_briefing_engine.test.ts', { stdio: 'inherit' });

  console.log('\n▶️ [20/21] Running Stage 6-A Teacher & KS Briefing Glass Layer UI Suite (Suite 31)...');
  execSync('npx tsx tests/stage6a_briefing_ui_contracts.test.tsx', { stdio: 'inherit' });

  console.log('\n▶️ [21/22] Running Stage 6-A Foundation & Guardian Briefing UI Suite (Suite 32)...');
  execSync('npx tsx tests/stage6a_foundation_guardian_ui.test.tsx', { stdio: 'inherit' });

  console.log('\n▶️ [22/23] Running Stage 6-A Adaptive Chrome & Navigation Contracts Suite (Suite 33)...');
  execSync('npx tsx tests/stage6a_adaptive_chrome.test.tsx', { stdio: 'inherit' });

  console.log('\n▶️ [23/24] Running Stage 6-A The Living Shell & Ergonomics Suite (Suite 34)...');
  execSync('npx tsx tests/stage6a_living_shell.test.tsx', { stdio: 'inherit' });

  console.log('\n▶️ [24/25] Running Stage 6-A Weight Discipline & VRT Final Suite (Suite 35)...');
  execSync('npx tsx tests/stage6a_weight_discipline_vrt.test.tsx', { stdio: 'inherit' });

  console.log('\n▶️ [25/26] Running Stage 6-A Identity Hygiene & Brand Contracts Suite (Suite 36)...');
  execSync('npx tsx tests/stage6a_identity_hygiene.test.tsx', { stdio: 'inherit' });

  console.log('\n▶️ [26/27] Running Stage 6-A Profile Hub v2 & User Management Suite (Suite 37)...');
  execSync('npx tsx tests/stage6a_profile_hub.test.tsx', { stdio: 'inherit' });

  console.log('\n▶️ [27/27] Running Stage 6-B Passkey WebAuthn Integration Suite (Suite 38)...');
  execSync('npx tsx tests/stage6b_passkey_webauthn.test.tsx', { stdio: 'inherit' });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('🎉 ALL INTEGRATION & SECURITY TEST SUITES COMPLETED SUCCESSFULLY');
  console.log('════════════════════════════════════════════════════════════════');
} catch (error) {
  console.error('\n❌ Test pipeline failed!');
  process.exit(1);
}
