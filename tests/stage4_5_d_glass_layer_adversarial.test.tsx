/**
 * YAPENDIK SCHOOL OS — STAGE 4.5-D THE GLASS LAYER
 * ADVERSARIAL FRONTEND & DOM SECURITY TEST SUITE (SUITES 24 & 25)
 * 
 * Source of Truth: STAGE_4_5_D_GLASS_LAYER_AND_UI_ARCHITECTURE_v1.0.md
 * 
 * Suite 24: UI PII Leak Guard & PrivacyShield Redaction Assertions
 * Suite 25: Forbidden Mutation UI Block & Ethical Lexicon Assertions
 */

import { strict as assert } from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { 
  PrivacyShield, 
  NonCausalDelta, 
  CanonicalAnchor, 
  ForbiddenActionGate 
} from '../src/components/glass';
import { FoundationLayout } from '../src/workspaces/foundation/FoundationLayout';
import { HeadmasterAdoptionLayout } from '../src/workspaces/school/HeadmasterAdoptionLayout';
import { SecurityContextProvider } from '../src/auth/context';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 STAGE 4.5-D THE GLASS LAYER ADVERSARIAL TEST SUITE (SUITES 24 & 25)');
console.log('════════════════════════════════════════════════════════════════\n');

async function runAdversarialTests() {
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
  // SUITE 24: UI PII LEAK GUARD & PRIVACY SHIELD ASSERTIONS
  // ------------------------------------------------------------------------------
  console.log('--- SUITE 24: UI PII Leak Guard & PrivacyShield K-Anonymity (FB-01 & FB-07) ---');

  runCheck('Suite 24 [PII LEAK DOM SCAN]: Foundation console DOM contains ZERO student NIK (16 digits)', () => {
    // Render Foundation Layout within security context
    const html = renderToString(
      <SecurityContextProvider>
        <FoundationLayout />
      </SecurityContextProvider>
    );

    // Regex for 16-digit Indonesian NIK
    const nikRegex = /\b\d{16}\b/g;
    const matches = html.match(nikRegex);
    assert.equal(matches, null, `Found leaking NIKs in Foundation DOM: ${JSON.stringify(matches)}`);
  });

  runCheck('Suite 24 [PII LEAK DOM SCAN]: Foundation console DOM contains ZERO student NIS (10 digits)', () => {
    const html = renderToString(
      <SecurityContextProvider>
        <FoundationLayout />
      </SecurityContextProvider>
    );

    // Regex for 10-digit NIS
    const nisRegex = /\b\d{10}\b/g;
    const matches = html.match(nisRegex);
    assert.equal(matches, null, `Found leaking NIS in Foundation DOM: ${JSON.stringify(matches)}`);
  });

  runCheck('Suite 24 [PII LEAK DOM SCAN]: Foundation console DOM contains ZERO student names from roster', () => {
    const html = renderToString(
      <SecurityContextProvider>
        <FoundationLayout />
      </SecurityContextProvider>
    );

    // Seed student test names that must NEVER appear in Foundation aggregates
    const forbiddenStudentNames = [
      'Ananda Pratama',
      'Kenzo Santoso',
      'Clarissa Putri',
      'Jonathan Wijaya',
      'Siti Nurhaliza Junior'
    ];

    for (const name of forbiddenStudentNames) {
      assert.ok(
        !html.includes(name),
        `Privacy Violation (FB-01): Student name "${name}" leaked into Foundation DOM!`
      );
    }
  });

  runCheck('Suite 24 [IMAGE PII EXCLUSION FB-01]: Foundation console DOM contains ZERO private student photos', () => {
    const html = renderToString(
      <SecurityContextProvider>
        <FoundationLayout />
      </SecurityContextProvider>
    );

    assert.ok(
      !html.includes('stu_ananda_123') && !html.includes('stu_kenzo_01'),
      'Private child student media paths must not be rendered in Foundation console'
    );
  });

  runCheck('Suite 24 [PRIVACY SHIELD FB-07]: Suppresses small cohort (N < 5) with K-Anonymity badge', () => {
    const html = renderToString(
      <PrivacyShield
        exposureStatus="SUPPRESSED_SMALL_COHORT"
        sampleSize={3}
        metricValue={88.5}
        metricLabel="Kemandirian Bermain"
      />
    );

    assert.ok(html.includes('Tersupresi (N &lt; 5)'), 'Must render suppressed badge');
    assert.ok(!html.includes('88.5%'), 'Must NOT reveal metric percentage when suppressed');
    assert.ok(html.includes('K-Anonymity'), 'Must display K-Anonymity info badge');
  });

  runCheck('Suite 24 [PRIVACY SHIELD FB-07]: Suppresses differencing risk with anti-reconstruction badge', () => {
    const html = renderToString(
      <PrivacyShield
        exposureStatus="SUPPRESSED_DIFFERENCING_RISK"
        sampleSize={12}
        metricValue={91.0}
        metricLabel="Literasi Awal"
      />
    );

    assert.ok(html.includes('Risiko Diferensiasi'), 'Must render differencing risk badge');
    assert.ok(!html.includes('91.0%'), 'Must NOT reveal metric percentage');
    assert.ok(html.includes('Proteksi Rekonstruksi PII'), 'Must render reconstruction protection label');
  });

  runCheck('Suite 24 [PRIVACY SHIELD VISIBLE]: Renders clean metric for large cohorts (N >= 5)', () => {
    const html = renderToString(
      <PrivacyShield
        exposureStatus="VISIBLE"
        sampleSize={18}
        metricValue={84.2}
        metricLabel="Regulasi Emosi"
        format="PERCENTAGE"
      />
    );

    assert.ok(html.includes('84.2%'), 'Must render formatted metric value');
    assert.ok(html.includes('N = 18'), 'Must render cohort sample size');
  });

  // ------------------------------------------------------------------------------
  // SUITE 25: FORBIDDEN MUTATION UI BLOCK & ETHICAL LEXICON ASSERTIONS
  // ------------------------------------------------------------------------------
  console.log('\n--- SUITE 25: Forbidden Mutation UI Block & Ethical Lexicon (FB-05 & FB-06) ---');

  runCheck('Suite 25 [MUTATION HARD BLOCK FB-06]: ForbiddenActionGate suppresses classroom edit triggers', () => {
    // Attempting to render a classroom mutation inside ForbiddenActionGate
    const html = renderToString(
      <SecurityContextProvider>
        <ForbiddenActionGate actionType="CLASSROOM_MUTATION">
          <button id="btn-edit-attendance">Edit Presensi</button>
          <button id="btn-edit-lppa">Ubah Nilai Rapor</button>
        </ForbiddenActionGate>
      </SecurityContextProvider>
    );

    // In Foundation context or guarded mode, classroom mutations are strictly omitted
    assert.ok(!html.includes('btn-edit-attendance'), 'Must suppress edit attendance button');
    assert.ok(!html.includes('btn-edit-lppa'), 'Must suppress edit lppa button');
  });

  runCheck('Suite 25 [ANTI-RANKING FB-04]: Foundation console contains ZERO competitive ranking columns', () => {
    const html = renderToString(
      <SecurityContextProvider>
        <FoundationLayout />
      </SecurityContextProvider>
    );

    // Assert absence of competitive ranking text
    const forbiddenRankingTerms = [
      'Peringkat Sekolah',
      'Ranking Juara',
      'Leaderboard',
      'Sekolah Terbaik #1'
    ];

    for (const term of forbiddenRankingTerms) {
      assert.ok(
        !html.includes(term),
        `Governance Violation (FB-04): Anti-ranking term "${term}" found in Foundation DOM!`
      );
    }
  });

  runCheck('Suite 25 [NON-CAUSAL ETHICAL LEXICON H-02]: Renders mandatory non-causal disclaimer footnote', () => {
    const html = renderToString(
      <NonCausalDelta
        baselineValue={62.0}
        outcomeValue={74.4}
        delta={12.4}
        qualitativeReflection="Pendidik mengamati interaksi verbal anak meningkat selama bermain balok kayu."
        evaluatedAt="2026-08-20"
      />
    );

    assert.ok(html.includes('Δ +12.4%'), 'Must render delta badge with positive sign');
    assert.ok(
      html.includes('Asosiasi Empiris Teramati'),
      'Must contain mandatory non-causal header label'
    );
    assert.ok(
      html.includes('bukan klaim hubungan sebab-akibat deterministik'),
      'Must contain exact ethical disclaimer footnote'
    );
    assert.ok(
      html.includes('Pendidik mengamati interaksi verbal anak'),
      'Must render qualitative human reflection quote'
    );
  });

  runCheck('Suite 25 [CANONICAL ANCHOR H-06]: Renders immutable monospace action_id and closed-loop badge', () => {
    const html = renderToString(
      <CanonicalAnchor
        actionId="act_2026_q1_curriculum_support_01"
        status="COMPLETED"
        isClosedLoop={true}
        actionTitle="Fasilitasi APE Balok Unit Kayu"
      />
    );

    assert.ok(html.includes('act_2026_q1_curriculum_support_01'), 'Must render exact action_id');
    assert.ok(html.includes('COMPLETED'), 'Must render status badge');
    assert.ok(html.includes('CLOSED-LOOP'), 'Must render glowing closed loop seal');
  });

  runCheck('Suite 25 [CLOSED-LOOP STEPPER H-06]: Renders 4-stage governance accountability timeline', () => {
    const html = renderToString(
      <SecurityContextProvider>
        <FoundationLayout initialView="ACTIONS" />
      </SecurityContextProvider>
    );

    assert.ok(html.includes('closed-loop-stepper') || html.includes('Closed-Loop'), 'Must render Closed-Loop stepper title');
    assert.ok(html.includes('1. Diterbitkan Yayasan'), 'Must render stage 1');
    assert.ok(html.includes('2. Deployed ke Unit'), 'Must render stage 2');
    assert.ok(html.includes('3. Diadopsi Sekolah'), 'Must render stage 3');
    assert.ok(html.includes('4. Evaluasi Dampak'), 'Must render stage 4');
  });

  runCheck('Suite 25 [HEADMASTER ADOPTION HUB FB-03]: Renders School Autonomy adaptation and reflection studio', () => {
    const html = renderToString(
      <SecurityContextProvider>
        <HeadmasterAdoptionLayout />
      </SecurityContextProvider>
    );

    assert.ok(html.includes('School Autonomy (FB-03)'), 'Must render school autonomy badge');
    assert.ok(html.includes('Adopsi Kebijakan'), 'Must render adoption hub title');
    assert.ok(html.includes('Inbox'), 'Must render incoming inbox tab');
  });

  // ------------------------------------------------------------------------------
  // SUMMARY
  // ------------------------------------------------------------------------------
  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 4.5-D SUITES 24 & 25 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAdversarialTests().catch(err => {
  console.error('Test suite failed:', err);
  process.exit(1);
});
