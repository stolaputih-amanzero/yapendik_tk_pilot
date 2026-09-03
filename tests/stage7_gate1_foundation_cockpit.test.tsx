/**
 * YAPENDIK SCHOOL OS — STAGE 7 GATE 1
 * The Foundation Stewardship Cockpit Adversarial Test Suite (Suite 43)
 * Governing Treaties: Gate 0.1, FB-01 s.d. FB-07, H-01, H-06
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import assert from 'node:assert/strict';
import { SecurityContextProvider } from '../src/auth/context';
import { FoundationLayout } from '../src/workspaces/foundation/FoundationLayout';
import { institutionalLearningService } from '../src/services/institutionalLearningService';
import { briefingEngine } from '../src/services/BriefingEngine';
import { db } from '../src/db/database';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 SUITE 43: THE FOUNDATION STEWARDSHIP COCKPIT (STAGE 7 GATE 1)');
console.log('════════════════════════════════════════════════════════════════');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function runCheck(name: string, fn: () => void) {
  totalTests++;
  try {
    fn();
    console.log(`  🟢 PASS: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  🔴 FAIL: ${name}`);
    console.error(`     Error: ${err?.message || err}`);
    failedTests++;
  }
}

async function runFoundationCockpitTests() {
  // ----------------------------------------------------------------------------
  // MODULE 1: Live Projection Zero-PII Scan (FB-01)
  // ----------------------------------------------------------------------------
  console.log('\n--- MODULE 1: Live Projection Zero-PII Scan (FB-01) ---');
  {
    const html = renderToString(
      <SecurityContextProvider initialPersonaId="user_superadmin_shirley">
        <FoundationLayout />
      </SecurityContextProvider>
    );

    runCheck('PII Guard: Foundation DOM contains ZERO 16-digit student NIK', () => {
      const nikMatch = html.match(/\b\d{16}\b/g);
      assert.equal(nikMatch, null, `Found potential student NIK in Foundation DOM: ${nikMatch}`);
    });

    runCheck('PII Guard: Foundation DOM contains ZERO 10-digit student NIS', () => {
      const nisMatch = html.match(/\b\d{10}\b/g);
      assert.equal(nisMatch, null, `Found potential student NIS in Foundation DOM: ${nisMatch}`);
    });

    runCheck('PII Guard: Foundation DOM contains ZERO individual student names from roster', () => {
      const students = db.getStudents('sch_tk_maranatha');
      const foundNames: string[] = [];
      for (const student of students) {
        const studentName = student.person?.fullName;
        if (studentName && html.includes(studentName)) {
          foundNames.push(studentName);
        }
      }
      assert.equal(foundNames.length, 0, `Student names leaked into Foundation DOM: ${foundNames.join(', ')}`);
    });
  }

  // ----------------------------------------------------------------------------
  // MODULE 2: FB-07 K-Anonymity Guard & Small Cohort Suppression
  // ----------------------------------------------------------------------------
  console.log('\n--- MODULE 2: FB-07 K-Anonymity Guard (Minimum Cohort N >= 5) ---');
  {
    const patternsSmall = await institutionalLearningService.deriveCurriculumDomainDistribution(
      'ay_2026_2027',
      'sch_tk_small_cohort',
      4 // subsetCohortSize = 4 (< 5)
    );

    runCheck('FB-07: Small cohort (N=4) triggers SUPPRESSED_SMALL_COHORT', () => {
      assert.ok(patternsSmall.length > 0, 'Must produce derived patterns');
      for (const pat of patternsSmall) {
        assert.equal(pat.exposure_status, 'SUPPRESSED_SMALL_COHORT', 'Status must be SUPPRESSED_SMALL_COHORT');
        assert.equal(pat.computed_metric_value, undefined, 'Metric must be undefined when suppressed');
      }
    });

    const patternsSafe = await institutionalLearningService.deriveCurriculumDomainDistribution(
      'ay_2026_2027',
      'sch_tk_maranatha',
      17 // Normal active cohort N=17
    );

    runCheck('FB-07: Safe cohort (N=17) is VISIBLE with computed metrics', () => {
      assert.ok(patternsSafe.length > 0, 'Must produce derived patterns');
      for (const pat of patternsSafe) {
        assert.equal(pat.exposure_status, 'VISIBLE', 'Status must be VISIBLE');
        assert.ok(typeof pat.computed_metric_value === 'number', 'Metric must be a computed number');
        assert.ok(pat.computed_metric_value > 0, 'Metric value must be positive');
      }
    });
  }

  // ----------------------------------------------------------------------------
  // MODULE 3: Action Initiative Creator & Closed-Loop Integration (FB-05 / H-01)
  // ----------------------------------------------------------------------------
  console.log('\n--- MODULE 3: Action Initiative Creator & Closed-Loop State Machine ---');
  {
    const createdAction = await institutionalLearningService.createInstitutionalAction({
      action_type: 'SUPPORT_INITIATIVE',
      target_scope: 'SPECIFIC_SCHOOL',
      target_school_id: 'sch_tk_maranatha',
      title: 'Fasilitasi Bahan Loose-Parts Sentra Bahan Alam',
      policy_intent: 'Menyediakan material sensori dan bahan alam untuk menstimulasi eksplorasi inkuiri.',
      issued_by_person_id: 'per_superadmin_shirley',
      issued_by_name: 'SHIRLEY A.T.WAKKARY',
      support_payload: {
        initiative_type: 'LEARNING_MATERIALS',
        resource_allocation_details: 'Biji-bijian, batu kerikil halus, dan ranting kayu kering 2 baki.',
        support_lifecycle_status: 'DEPLOYED'
      }
    });

    runCheck('Action Creator: Canonical action_id format matches act_2026_*', () => {
      assert.ok(createdAction.action_id.startsWith('act_2026_'), 'Action ID must start with act_2026_');
      assert.equal(createdAction.issued_by_name, 'SHIRLEY A.T.WAKKARY');
      assert.equal(createdAction.action_type, 'SUPPORT_INITIATIVE');
    });

    runCheck('Action Creator: Newly created action appears in living actions list', () => {
      const allActions = institutionalLearningService.listActions();
      const found = allActions.find(a => a.action_id === createdAction.action_id);
      assert.ok(found, 'Created action must be listed in institutionalLearningService');
      assert.equal(found.title, 'Fasilitasi Bahan Loose-Parts Sentra Bahan Alam');
    });

    runCheck('Closed-Loop Lifecycle: School can record adoption for this action', async () => {
      const adoption = await institutionalLearningService.recordSchoolAdoption({
        response_id: `adp_maranatha_${createdAction.action_id}`,
        action_id: createdAction.action_id,
        action_type: createdAction.action_type,
        school_id: 'sch_tk_maranatha',
        headmaster_person_id: 'per_headmaster_sheryl',
        headmaster_name: 'SHERYL Y N UMBAS, S.IKOM, M.PD',
        adoption_status: 'ADOPTED_IN_PRACTICE',
        local_context_adaptation_notes: 'Diterapkan pada sentra alam setiap hari Rabu.',
        action_timeline: '2026-09-01 s.d. 2026-11-30',
        acknowledged_at: new Date().toISOString()
      }, 'HEADMASTER');

      assert.equal(adoption.adoption_status, 'ADOPTED_IN_PRACTICE');
      const allAdoptions = institutionalLearningService.listAdoptions();
      assert.ok(allAdoptions.some(ad => ad.action_id === createdAction.action_id));
    });
  }

  // ----------------------------------------------------------------------------
  // MODULE 4: Identity Hygiene & Authentic Authority Verification
  // ----------------------------------------------------------------------------
  console.log('\n--- MODULE 4: Identity Hygiene & Authentic Authority ---');
  {
    const briefingData = await briefingEngine.getBriefingDataForUser(
      'FOUNDATION',
      'sch_tk_maranatha',
      'per_superadmin_shirley'
    );

    runCheck('Identity Hygiene: Foundation Briefing greeting addresses Shirley', () => {
      assert.ok(briefingData.greeting.includes('Shirley'), `Greeting must address Shirley, got: ${briefingData.greeting}`);
      assert.ok(!briefingData.greeting.includes('Andreas'), 'Greeting must not contain legacy mock name Andreas');
    });

    runCheck('Identity Hygiene: Briefing quote author resolves authentic TK Maranatha', () => {
      assert.equal(briefingData.warm_echo?.source_author, 'Kepala Sekolah TK Maranatha');
    });

    runCheck('Identity Hygiene: Actions ledger attributes Shirley as primary issuer', () => {
      const actions = institutionalLearningService.listActions();
      for (const act of actions) {
        assert.ok(!act.issued_by_name.includes('Andreas'), `Action ${act.action_id} leaked legacy name: ${act.issued_by_name}`);
      }
    });
  }

  // ----------------------------------------------------------------------------
  // MODULE 5: 4-Zone Foundation Layout Structure (Hukum 1 & 3)
  // ----------------------------------------------------------------------------
  console.log('\n--- MODULE 5: 4-Zone Foundation Layout DOM Contracts ---');
  {
    const html = renderToString(
      <SecurityContextProvider initialPersonaId="user_superadmin_shirley">
        <FoundationLayout />
      </SecurityContextProvider>
    );

    runCheck('4-Zone Anatomy: Renders root console container', () => {
      assert.ok(html.includes('data-testid="foundation-governance-console"'), 'Must render root testid');
    });

    runCheck('4-Zone Anatomy: Zona 2 renders Macro Quick Launchpad', () => {
      assert.ok(html.includes('Pusat Kemudi Strategis'), 'Must render Zona 2 title');
      assert.ok(html.includes('Terbitkan Inisiatif'), 'Must render Terbitkan Inisiatif launchpad card');
      assert.ok(html.includes('Audit Tata Kelola'), 'Must render Audit Tata Kelola launchpad card');
      assert.ok(html.includes('Kesiapan Unit'), 'Must render Kesiapan Unit launchpad card');
      assert.ok(html.includes('Portal PPDB'), 'Must render Portal PPDB launchpad card');
      assert.ok(html.includes('data-testid="btn-create-initiative"'), 'Must render create initiative button');
    });

    runCheck('4-Zone Anatomy: Zona 3 renders Network Vitality Telemetry', () => {
      assert.ok(html.includes('Denyut Capaian Jaringan Sekolah'), 'Must render Zona 3 title');
      assert.ok(html.includes('data-testid="pattern-telemetry-card"'), 'Must render pattern telemetry cards');
    });

    runCheck('4-Zone Anatomy: Zona 4 renders Closed-Loop Governance Studio', () => {
      assert.ok(html.includes('Pusat Kebijakan Yayasan'), 'Must render Zona 4 title');
      assert.ok(html.includes('data-testid="tab-projections"'), 'Must render tab projections');
      assert.ok(html.includes('data-testid="tab-insights"'), 'Must render tab insights');
      assert.ok(html.includes('data-testid="tab-actions"'), 'Must render tab actions');
    });
  }

  // ----------------------------------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------------------------------
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 SUITE 43 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Suite 43 failed with ${failedTests} error(s).`);
  }
}

runFoundationCockpitTests().catch(err => {
  console.error('Fatal Suite 43 execution error:', err);
  process.exit(1);
});
