/**
 * YAPENDIK SCHOOL OS — STAGE 7 GATE 3 ADVERSARIAL TEST (SUITE 46)
 * Foundation LEARN Dashboard Live Activation & Ethical Intelligence
 * Governing Treaties: FB-01, FB-02, FB-03, FB-04, FB-07, H-02 Non-Causal Semantics, Amanaura v3.0
 */

import React from 'react';
import { renderToString } from 'react-dom/server';
import assert from 'node:assert/strict';
import { SecurityContextProvider } from '../src/auth/context';
import { FoundationLayout } from '../src/workspaces/foundation/FoundationLayout';
import { InitiativeCreatorModal } from '../src/components/workspaces/foundation/InitiativeCreatorModal';
import { institutionalLearningService } from '../src/services/institutionalLearningService';
import { db } from '../src/db/database';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 SUITE 46: STAGE 7 GATE 3 — FOUNDATION LEARN LIVE ACTIVATION');
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

async function runStage7Gate3Tests() {
  // ----------------------------------------------------------------------------
  // SCENARIO 1: Live Multi-Projection Derivation (Zero-DDL & FB-02)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 1: Live Multi-Projection Derivation (Zero-DDL & FB-02) ---');
  {
    const currPatterns = await institutionalLearningService.deriveCurriculumDomainDistribution('ay_2026_2027');
    const sentraPatterns = await institutionalLearningService.deriveSentraEngagementProjection('ay_2026_2027');
    const intakePatterns = await institutionalLearningService.deriveIntakeReadinessProjection('ay_2026_2027');

    runCheck('Curriculum Domain Distribution derives 4 Kurikulum Merdeka domains', () => {
      assert.equal(currPatterns.length, 4);
      assert.ok(currPatterns.some(p => p.curriculum_domain === 'STEAM'));
      assert.ok(currPatterns.some(p => p.curriculum_domain === 'LITERACY'));
      assert.ok(currPatterns.some(p => p.curriculum_domain === 'SOCIAL_EMOTIONAL'));
      assert.ok(currPatterns.some(p => p.curriculum_domain === 'RELIGIOUS_AND_MORAL'));
    });

    runCheck('Sentra Engagement Projection derives 5 canonical activity centers', () => {
      assert.equal(sentraPatterns.length, 5);
      assert.ok(sentraPatterns.some(p => p.curriculum_domain === 'SENTRA_BALOK'));
      assert.ok(sentraPatterns.some(p => p.curriculum_domain === 'SENTRA_BAHAN_ALAM'));
      assert.ok(sentraPatterns.some(p => p.curriculum_domain === 'SENTRA_SENI'));
      assert.ok(sentraPatterns.some(p => p.curriculum_domain === 'SENTRA_MAIN_PERAN'));
      assert.ok(sentraPatterns.some(p => p.curriculum_domain === 'SENTRA_PERSIAPAN'));
    });

    runCheck('Intake Readiness Projection correlates Mile Zero baseline entry skills', () => {
      assert.equal(intakePatterns.length, 4);
      assert.ok(intakePatterns.some(p => p.curriculum_domain === 'MOTORIK_KASAR_HALUS'));
      assert.ok(intakePatterns.some(p => p.curriculum_domain === 'KEMANDIRIAN_DIRI'));
      assert.ok(intakePatterns.some(p => p.curriculum_domain === 'KOMUNIKASI_VERBAL'));
      assert.ok(intakePatterns.some(p => p.curriculum_domain === 'KEMATANGAN_SOSIAL'));
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 2: FB-07 K-Anonymity Guard (Kmin >= 5) & Small-Cohort Suppression
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 2: FB-07 K-Anonymity & Small-Cohort Privacy Guard ---');
  {
    // Safe cohort (N=16)
    const safeCohortPatterns = await institutionalLearningService.deriveSentraEngagementProjection('ay_2026_2027', 'sch_tk_maranatha');
    runCheck('FB-07 Safe Cohort (N >= 5) is VISIBLE with computed metrics', () => {
      const balok = safeCohortPatterns.find(p => p.curriculum_domain === 'SENTRA_BALOK');
      assert.ok(balok);
      assert.equal(balok.exposure_status, 'VISIBLE');
      assert.equal(typeof balok.computed_metric_value, 'number');
    });

    // Suppressed small cohort (N=4)
    const smallCohortPatterns = await institutionalLearningService.deriveSentraEngagementProjection('ay_2026_2027', 'sch_tk_small_unit');
    runCheck('FB-07 Small Cohort (N < 5) transitions to SUPPRESSED_SMALL_COHORT with undefined metric', () => {
      const balok = smallCohortPatterns.find(p => p.curriculum_domain === 'SENTRA_BALOK');
      assert.ok(balok);
      assert.equal(balok.exposure_status, 'SUPPRESSED_SMALL_COHORT');
      assert.equal(balok.computed_metric_value, undefined, 'Metric must be redacted when suppressed');
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 3: Zero-PII Redaction Barrier on Foundation DOM (FB-01)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 3: Zero-PII Redaction Barrier on Foundation DOM (FB-01) ---');
  {
    const foundationHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_superadmin_shirley">
        <FoundationLayout initialView="PROJECTIONS" />
      </SecurityContextProvider>
    );

    runCheck('Foundation DOM contains ZERO individual student names from roster', () => {
      const students = db.getStudents('sch_tk_maranatha');
      for (const s of students) {
        const p = db.getPersonById(s.personId);
        if (p?.fullName) {
          assert.ok(
            !foundationHtml.includes(p.fullName),
            `Leaked individual student name: ${p.fullName} in Foundation DOM`
          );
        }
      }
    });

    runCheck('Foundation DOM contains ZERO 16-digit NIK or 10-digit NIS', () => {
      const nikMatch = foundationHtml.match(/\b\d{16}\b/);
      assert.equal(nikMatch, null, `Found 16-digit NIK in Foundation DOM: ${nikMatch}`);

      const nisMatch = foundationHtml.match(/\b\d{10}\b/);
      assert.equal(nisMatch, null, `Found 10-digit NIS in Foundation DOM: ${nisMatch}`);
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 4: Automated Anomaly Detection & Guardrail H-02 (Human-in-the-Loop)
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 4: Automated Anomaly Detection & Guardrail H-02 ---');
  {
    const initialInsightsCount = institutionalLearningService.listInsights().length;
    const initialActionsCount = institutionalLearningService.listActions().length;

    const anomalies = await institutionalLearningService.detectPedagogicalAnomalies('ay_2026_2027');

    runCheck('detectPedagogicalAnomalies flags patterns with status AVAILABLE_FOR_REVIEW', () => {
      assert.ok(anomalies.length > 0, 'Should detect at least 1 pedagogical support opportunity');
      assert.ok(anomalies.every(p => p.pattern_status === 'AVAILABLE_FOR_REVIEW'));
    });

    runCheck('Guardrail H-02 Enforcement: Machine NEVER auto-creates Insight or Action without human review', () => {
      const currentInsightsCount = institutionalLearningService.listInsights().length;
      const currentActionsCount = institutionalLearningService.listActions().length;
      assert.equal(currentInsightsCount, initialInsightsCount, 'Machine must not auto-generate Insights');
      assert.equal(currentActionsCount, initialActionsCount, 'Machine must not auto-generate Actions');
    });

    // Human-in-the-Loop confirmation by Mrs. Shirley
    const confirmedInsight = await institutionalLearningService.confirmInsightFromPattern(
      anomalies[0].pattern_id,
      {
        category: 'RESOURCE_NEED',
        title: `Kebutuhan APE Terstandar untuk ${anomalies[0].pattern_name}`,
        empiricalObservation: anomalies[0].description || 'Perlu intervensi',
        urgencyLevel: 'PRIORITY_SUPPORT',
        deciderPersonId: 'per_superadmin_shirley',
        deciderName: 'SHIRLEY A.T.WAKKARY',
        deciderRole: 'YAPENDIK_SUPERADMIN',
        decisionRationale: 'Disetujui pengadaan APE tambahan.',
        actionPlanType: 'SUPPORT_INITIATIVE'
      }
    );

    runCheck('Human-in-the-Loop: Foundation Superadmin confirms pattern into InstitutionalInsight', () => {
      assert.ok(confirmedInsight);
      assert.equal(confirmedInsight.status, 'ACTION_DECIDED');
      assert.equal(confirmedInsight.decision_record?.decided_by_name, 'SHIRLEY A.T.WAKKARY');
    });
  }

  // ----------------------------------------------------------------------------
  // SCENARIO 5: Closed-Loop Support Triggering & AdaptiveDialog Ribbon
  // ----------------------------------------------------------------------------
  console.log('\n--- SCENARIO 5: Closed-Loop Support Triggering & AdaptiveDialog ---');
  {
    const modalHtml = renderToString(
      <SecurityContextProvider initialPersonaId="user_superadmin_shirley">
        <InitiativeCreatorModal
          isOpen={true}
          onClose={() => {}}
          onInitiativeCreated={() => {}}
          initialData={{
            actionType: 'SUPPORT_INITIATIVE',
            title: 'Pengadaan Balok Unit Kayu Hardwood',
            policyIntent: 'Mendukung Sentra Balok & Inkuiri TK Maranatha.',
            resourceDetails: '2 set balok hardwood 120 pcs.',
            initiativeType: 'LEARNING_MATERIALS'
          }}
        />
      </SecurityContextProvider>
    );

    runCheck('InitiativeCreatorModal renders as AdaptiveDialog with 2-Tier matching-pill ribbon', () => {
      assert.ok(modalHtml.includes('Terbitkan Inisiatif Yayasan'));
      assert.ok(modalHtml.includes('Pusat Tata Kelola Yayasan'));
      assert.ok(modalHtml.includes('Inisiatif Bantuan (Support)'));
      assert.ok(modalHtml.includes('Pengadaan Balok Unit Kayu Hardwood'));
    });

    // Create action
    const newAction = await institutionalLearningService.createInstitutionalAction({
      action_type: 'SUPPORT_INITIATIVE',
      target_scope: 'ALL_TK_UNITS',
      title: 'Inisiatif Dukungan Fasilitasi Sentra Balok',
      policy_intent: 'Penyaluran media manipulatif standar.',
      issued_by_person_id: 'per_superadmin_shirley',
      issued_by_name: 'SHIRLEY A.T.WAKKARY',
      support_payload: {
        initiative_type: 'LEARNING_MATERIALS',
        resource_allocation_details: 'Balok kayu hardwood 120 pcs.',
        support_lifecycle_status: 'DEPLOYED'
      }
    });

    runCheck('Newly created action anchors with canonical action_id and deployed status', () => {
      assert.ok(newAction.action_id.startsWith('act_2026_'));
      assert.equal(newAction.support_payload?.support_lifecycle_status, 'DEPLOYED');
    });
  }

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 SUITE 46 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runStage7Gate3Tests().catch(err => {
  console.error('Unhandled error in Suite 46:', err);
  process.exit(1);
});
