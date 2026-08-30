/**
 * YAPENDIK SCHOOL OS — STAGE 6-A FOUNDATION & GUARDIAN GLASS LAYER
 * UI & ERGONOMIC CONTRACT TEST SUITE (SUITE 32)
 * 
 * Source of Truth: STAGE_6_A_GATE_1 (v1.0-SEALED)
 * 
 * Verifies:
 * - Test 1: FoundationBriefing Strategic Pillars & PrivacyShield K-Anonymity (FB-07)
 * - Test 2: FoundationBriefing H-02 Honest Non-Causal Footnote
 * - Test 3: GuardianBriefing Kamus Keluarga & Daytime Story Contract
 * - Test 4: GuardianBriefing Surat Sore & Evening Closure (Non-Guilt)
 * - Test 5: GuardianMomentsGallery Single-Child Photo Continuum (FB-09)
 * - Test 6: GuardianDevelopmentTimeline Ratified LPPA & Zero-Comparative Doctrine (H-07 / FB-04)
 * - Test 7: H-07 Non-Surveillance DOM Shield across Foundation & Guardian
 */

import { strict as assert } from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { FoundationBriefing } from '../src/components/workspaces/briefing/FoundationBriefing';
import { GuardianBriefing } from '../src/components/workspaces/briefing/GuardianBriefing';
import { GuardianMomentsGallery } from '../src/workspaces/guardian/GuardianMomentsGallery';
import { GuardianDevelopmentTimeline } from '../src/workspaces/guardian/GuardianDevelopmentTimeline';
import {
  FoundationBriefingData,
  GuardianBriefingData
} from '../src/types/briefingTypes';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 STAGE 6-A FOUNDATION & GUARDIAN UI CONTRACTS (SUITE 32)');
console.log('════════════════════════════════════════════════════════════════\n');

async function runFoundationGuardianUITests() {
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

  function cleanHtml(html: string): string {
    return html
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/&quot;/g, '"')
      .replace(/&amp;/g, '&')
      .replace(/&#x27;/g, "'")
      .replace(/&bull;/g, '•');
  }

  // ------------------------------------------------------------------------------
  // 1. FOUNDATION BRIEFING STRATEGIC PILLARS & PRIVACY SHIELD
  // ------------------------------------------------------------------------------
  console.log('--- MODULE 1: Foundation Briefing Strategic Pillars & PrivacyShield ---');

  const mockFoundationOperational: FoundationBriefingData = {
    role: 'FOUNDATION',
    mode: 'OPERASIONAL',
    greeting: 'Selamat pagi, Bu Ketua',
    date_formatted: 'Senin, 31 Agustus 2026',
    school_local_time: '08:30',
    cycle_view: 'WEEKLY_REVIEW',
    decision_queue: {
      insights_awaiting_decision: 3,
      oldest_insight_age_days: 4
    },
    loop_health: {
      actions_awaiting_adoption: 2,
      outcomes_not_recorded: 1
    },
    equity_signals: {
      new_patterns_detected: 2,
      suppressed_cohorts: 1 // Trigger FB-07 PrivacyShield
    },
    warm_echo: {
      source_type: 'HEADMASTER_NOTE',
      source_author: 'Kepala Sekolah TK Menteng',
      quote_text: 'Bantuan material loose-parts sangat meningkatkan kolaborasi anak-anak.',
      timestamp: 'Kemarin'
    }
  };

  runCheck('FoundationBriefing [STRATEGIC PILLARS]: Renders decision queue, loop health, and equity signals', () => {
    const html = cleanHtml(renderToString(<FoundationBriefing data={mockFoundationOperational} />));
    assert.ok(html.includes('3 Insight'), 'Must render pending insights count');
    assert.ok(html.includes('Tertua 4 hari'), 'Must render oldest insight age');
    assert.ok(html.includes('2 Adopsi'), 'Must render awaiting actions count');
    assert.ok(html.includes('Telaah Insight Kebijakan'), 'Must render dominant review CTA');
  });

  runCheck('FoundationBriefing [FB-07 PRIVACY SHIELD]: Renders privacy badge when suppressed cohorts > 0', () => {
    const html = cleanHtml(renderToString(<FoundationBriefing data={mockFoundationOperational} />));
    assert.ok(html.includes('privacy-shield-suppressed-cohort'), 'Must render privacy shield for small cohort');
    assert.ok(html.includes('data-testid="privacy-shield-suppressed-cohort"'), 'Must contain testid');
  });

  runCheck('FoundationBriefing [H-02 NON-CAUSAL FOOTNOTE]: Renders honest non-causal association footnote', () => {
    const html = cleanHtml(renderToString(<FoundationBriefing data={mockFoundationOperational} />));
    assert.ok(
      html.includes('Asosiasi empiris teramati antarsekolah, bukan kausalitas deterministik (H-02).'),
      'Must contain ethical footnote H-02'
    );
  });

  // ------------------------------------------------------------------------------
  // 2. GUARDIAN BRIEFING & KAMUS KELUARGA
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 2: Guardian Briefing & Kamus Keluarga ---');

  const mockGuardianOperational: GuardianBriefingData = {
    role: 'GUARDIAN',
    mode: 'OPERASIONAL',
    greeting: 'Selamat pagi, Bunda Kenzo',
    date_formatted: 'Senin, 31 Agustus 2026',
    school_local_time: '08:30',
    child_name: 'Kenzo',
    today_summary: {
      attendance_status: 'Hadir',
      meal_status: 'Makan siang habis',
      active_phase_name: 'Main Sentra Balok'
    },
    latest_moment: {
      moment_id: 'mom_01',
      thumbnail_url: '/assets/moments/moment_sample1.jpg',
      caption: 'Membangun jembatan balok bersama teman-teman.',
      captured_at: '09:30'
    },
    teacher_note: 'Kenzo sangat fokus dan berbagi balok dengan rukun hari ini.',
    lppa_published_available: true
  };

  runCheck('GuardianBriefing [DAYTIME STORY]: Renders child daytime presence story and teacher note', () => {
    const html = cleanHtml(renderToString(<GuardianBriefing data={mockGuardianOperational} />));
    assert.ok(html.includes('Kabar Kenzo Hari Ini'), 'Must render child story header');
    assert.ok(html.includes('hadir di sekolah'), 'Must render presence');
    assert.ok(html.includes('Makan siang habis'.toLowerCase()), 'Must render meal status');
    assert.ok(html.includes('Main Sentra Balok'.toLowerCase()), 'Must render active phase');
    assert.ok(html.includes('Kenzo sangat fokus dan berbagi balok'), 'Must render teacher note');
    assert.ok(html.includes('Lihat Momen & Karya Hari Ini'), 'Must render primary CTA');
  });

  const mockGuardianClosure: GuardianBriefingData = {
    role: 'GUARDIAN',
    mode: 'PENUTUP',
    greeting: 'Selamat sore, Bunda Kenzo',
    date_formatted: 'Senin, 31 Agustus 2026',
    school_local_time: '16:00',
    child_name: 'Kenzo',
    today_summary: {
      attendance_status: 'Hadir',
      meal_status: 'Habis',
      active_phase_name: 'Tutup Hari'
    },
    teacher_note: 'Kenzo menyelesaikan karya baloknya dengan bangga.',
    lppa_published_available: true
  };

  runCheck('GuardianBriefing [SURAT SORE CLOSURE]: Renders Surat Sore evening closure without guilt', () => {
    const html = cleanHtml(renderToString(<GuardianBriefing data={mockGuardianClosure} />));
    assert.ok(html.includes('Surat Sore untuk Ayah & Bunda'), 'Must render Surat Sore header');
    assert.ok(html.includes('Selamat beristirahat dan berkumpul bersama keluarga'), 'Must render evening affirmation');
    assert.ok(html.includes('Baca Rangkuman Perkembangan'), 'Must render ghost CTA');
  });

  // ------------------------------------------------------------------------------
  // 3. GUARDIAN MOMENTS & DEVELOPMENT SURFACES
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 3: Guardian Moments & Development Surfaces ---');

  runCheck('GuardianMomentsGallery [SINGLE-CHILD CONTINUUM]: Renders moments grid with domain badges', () => {
    const html = cleanHtml(renderToString(<GuardianMomentsGallery childName="Kenzo" />));
    assert.ok(html.includes('Momen & Karya Kenzo'), 'Must render child gallery header');
    assert.ok(html.includes('Sentra Balok & Konstruksi'), 'Must render domain tag');
    assert.ok(html.includes('Membangun menara balok'), 'Must render moment caption');
  });

  runCheck('GuardianDevelopmentTimeline [RATIFIED LPPA & DOMAINS]: Renders 3 growth domains and ratification badge', () => {
    const html = cleanHtml(renderToString(<GuardianDevelopmentTimeline childName="Kenzo" />));
    assert.ok(html.includes('Perkembangan & Laporan Kenzo'), 'Must render development header');
    assert.ok(html.includes('Nilai Agama & Karakter'), 'Must render Domain 1 in family terms');
    assert.ok(html.includes('Jati Diri & Kemandirian'), 'Must render Domain 2 in family terms');
    assert.ok(html.includes('Literasi & Eksplorasi STEAM'), 'Must render Domain 3 in family terms');
    assert.ok(html.includes('Disahkan Kepala Sekolah'), 'Must render ratification badge (FB-04)');
  });

  // ------------------------------------------------------------------------------
  // 4. H-07 NON-SURVEILLANCE & ZERO-COMPARATIVE DOM INTEGRITY
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 4: H-07 Non-Surveillance DOM Shield ---');

  runCheck('H-07 DOM Shield [ZERO SCORES / RANKINGS IN GUARDIAN]: DOM contains zero scores or rankings', () => {
    const guardianBriefingHtml = cleanHtml(renderToString(<GuardianBriefing data={mockGuardianOperational} />));
    const momentsHtml = cleanHtml(renderToString(<GuardianMomentsGallery childName="Kenzo" />));
    const timelineHtml = cleanHtml(renderToString(<GuardianDevelopmentTimeline childName="Kenzo" />));

    const combinedHtml = (guardianBriefingHtml + momentsHtml + timelineHtml).toLowerCase();

    const forbiddenStrings = [
      'ranking',
      'leaderboard',
      'percentile',
      'persentil',
      'skor',
      'peringkat',
      'juara kelas',
      'perbandingan nilai'
    ];

    for (const forbidden of forbiddenStrings) {
      assert.ok(!combinedHtml.includes(forbidden), `Guardian DOM must not contain comparative metric "${forbidden}"`);
    }
  });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6-A SUITE 32 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Failed ${failedTests} tests in Suite 32.`);
  }
}

runFoundationGuardianUITests().catch((err) => {
  console.error('Fatal error in Suite 32 runner:', err);
  process.exit(1);
});
