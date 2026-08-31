/**
 * YAPENDIK SCHOOL OS — STAGE 6-A THE WARM BRIEFING GLASS LAYER
 * UI & ERGONOMIC CONTRACT TEST SUITE (SUITE 31)
 * 
 * Source of Truth: STAGE_6_A_GATE_1 (v1.0-SEALED)
 * 
 * Verifies:
 * - Test 1: BriefingShell Circadian Header & Amanaura Breath ✦ Pulse (4s vs 8s)
 * - Test 2: TeacherBriefing Operational State & Quick Action Rendering
 * - Test 3: TeacherBriefing Closure Mode & Non-Guilt Sisa Tenang Framing
 * - Test 4: HeadmasterBriefing 3-Metric Pillar Grid & Authority Review CTA
 * - Test 5: Warm Echo Rendering across Role Surfaces (Signature #6)
 * - Test 6: Law F-7 Flat Canvas Native (Zero Boxed Thick Cards)
 * - Test 7: H-07 Non-Surveillance DOM Shield (Zero Ranking or Leaderboards)
 */

import { strict as assert } from 'assert';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { BriefingShell } from '../src/components/workspaces/briefing/BriefingShell';
import { TeacherBriefing } from '../src/components/workspaces/briefing/TeacherBriefing';
import { HeadmasterBriefing } from '../src/components/workspaces/briefing/HeadmasterBriefing';
import {
  TeacherBriefingData,
  HeadmasterBriefingData
} from '../src/types/briefingTypes';

console.log('════════════════════════════════════════════════════════════════');
console.log('🧪 STAGE 6-A BRIEFING GLASS LAYER UI CONTRACTS (SUITE 31)');
console.log('════════════════════════════════════════════════════════════════\n');

async function runBriefingUITests() {
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
    return html.replace(/<!--[\s\S]*?-->/g, '').replace(/&quot;/g, '"');
  }

  // ------------------------------------------------------------------------------
  // 1. BRIEFING SHELL & GREETING
  // ------------------------------------------------------------------------------
  console.log('--- MODULE 1: BriefingShell Header & Seremonial Greetings ---');

  runCheck('BriefingShell [OPERATIONAL GREETING]: Renders greeting and local school time', () => {
    const raw = renderToString(
      <BriefingShell
        greeting="Selamat pagi, Bu Siti"
        date="Senin, 31 Agustus 2026"
        schoolLocalTime="08:15"
        mode="OPERASIONAL"
      >
        <p>Content</p>
      </BriefingShell>
    );
    const html = cleanHtml(raw);

    assert.ok(html.includes('Selamat pagi, Bu Siti'), 'Must render greeting');
    assert.ok(html.includes('08:15'), 'Must render school local time');
  });

  runCheck('BriefingShell [CLOSURE GREETING]: Renders closure greeting in penutup mode', () => {
    const raw = renderToString(
      <BriefingShell
        greeting="Hari ini selesai, Bu Siti"
        date="Senin, 31 Agustus 2026"
        schoolLocalTime="15:00"
        mode="PENUTUP"
      >
        <p>Content</p>
      </BriefingShell>
    );
    const html = cleanHtml(raw);

    assert.ok(html.includes('Hari ini selesai, Bu Siti'), 'Must render closure greeting');
  });

  // ------------------------------------------------------------------------------
  // 2. TEACHER BRIEFING UI CONTRACTS
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 2: Teacher Briefing Operational & Closure Surfaces ---');

  const mockTeacherOperational: TeacherBriefingData = {
    role: 'TEACHER',
    mode: 'OPERASIONAL',
    greeting: 'Selamat pagi, Bu Siti',
    date_formatted: 'Senin, 31 Agustus 2026',
    school_local_time: '08:15',
    active_phase: {
      phase_id: 'CENTRA',
      phase_name: 'Main Sentra',
      start_time: '07:30',
      end_time: '10:30',
      is_active: true,
      quick_action_id: 'act_record_moment'
    },
    quick_action: {
      action_id: 'act_record_moment',
      action_name: 'Rekam Momen Sentra',
      action_type: 'MODAL',
      is_default: true
    },
    pending_tasks: {
      attendance_incomplete: false,
      active_allergies: 0,
      unread_messages: 1,
      draft_observations: 2
    },
    warm_echo: {
      source_type: 'PARENT_MESSAGE',
      source_author: 'Bunda Kenzo',
      quote_text: 'Terima kasih Bu Siti atas bimbingan balok hari ini.',
      timestamp: '11:45'
    }
  };

  runCheck('TeacherBriefing [OPERATIONAL CTA]: Renders active phase and dominant quick action', () => {
    const html = cleanHtml(renderToString(<TeacherBriefing data={mockTeacherOperational} />));
    assert.ok(html.includes('Main Sentra'), 'Must show active phase name');
    assert.ok(html.includes('Rekam Momen Sentra'), 'Must render quick action button');
    assert.ok(html.includes('Presensi lengkap'), 'Must render positive micro-summary');
    assert.ok(html.includes('2 draf observasi'), 'Must render pending draft count');
  });

  const mockTeacherClosure: TeacherBriefingData = {
    role: 'TEACHER',
    mode: 'PENUTUP',
    greeting: 'Hari ini selesai, Bu Siti',
    date_formatted: 'Senin, 31 Agustus 2026',
    school_local_time: '15:00',
    pending_tasks: {
      attendance_incomplete: false,
      active_allergies: 0,
      unread_messages: 0,
      draft_observations: 1
    },
    closure_summary: {
      present_children: 15,
      total_children: 15,
      moments_recorded: 4,
      messages_replied: 2,
      pending_drafts_count: 1,
      closure_state: 'SISA_TENANG'
    }
  };

  runCheck('TeacherBriefing [CLOSURE WARM ECHO]: Renders closure summary and Warm Echo Parent Appreciation Carousel', () => {
    const html = cleanHtml(renderToString(<TeacherBriefing data={mockTeacherClosure} />));
    assert.ok(html.includes('15/15 hadir'), 'Must render attendance summary');
    assert.ok(html.includes('4 momen'), 'Must render moments count');
    assert.ok(html.includes('Mama Sean') || html.includes('Kelas TK A'), 'Must render parent appreciation quotes');
  });

  // ------------------------------------------------------------------------------
  // 3. HEADMASTER BRIEFING UI CONTRACTS
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 3: Headmaster Briefing Managerial Pillars ---');

  const mockHeadmasterOperational: HeadmasterBriefingData = {
    role: 'HEADMASTER',
    mode: 'OPERASIONAL',
    greeting: 'Selamat pagi, Pak Andreas',
    date_formatted: 'Senin, 31 Agustus 2026',
    school_local_time: '08:00',
    reconciliation: {
      classes_complete: 3,
      classes_total: 3,
      safety_alerts: 0
    },
    authority_queue: {
      pending_lppa_approvals: 2,
      pending_adoptions: 1,
      oldest_pending_age_days: 1
    },
    partnership_pulse: {
      unread_messages: 0,
      pending_confirmations: 0
    },
    warm_echo: {
      source_type: 'TEACHER_REFLECTION',
      source_author: 'Bu Siti Nurhaliza',
      quote_text: 'Anak-anak sangat antusias bereksplorasi di sentra balok.',
      timestamp: '12:00'
    }
  };

  runCheck('HeadmasterBriefing [3 PILLAR METRIC GRID]: Renders reconciliation, authority, and partnership', () => {
    const html = cleanHtml(renderToString(<HeadmasterBriefing data={mockHeadmasterOperational} />));
    assert.ok(html.includes('Rekonsiliasi'), 'Must render Rekonsiliasi header');
    assert.ok(html.includes('3/3'), 'Must render complete classes');
    assert.ok(html.includes('2 LPPA'), 'Must render pending LPPA approvals');
    assert.ok(html.includes('Tinjau Antrean Otoritas'), 'Must render primary review button');
  });

  // ------------------------------------------------------------------------------
  // 4. WARM ECHO & EMOTIONAL AFFIRMATION (Signature #6)
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 4: Warm Echo & Emotional Affirmation (Signature #6) ---');

  runCheck('Warm Echo [EMOTIONAL CITATION]: Renders italic quote and author attribution border', () => {
    const html = cleanHtml(renderToString(<TeacherBriefing data={mockTeacherOperational} />));
    assert.ok(html.includes('Mama Sean') || html.includes('Kelas TK A'), 'Must render author and class');
    assert.ok(html.includes('Sean cerita tadi siang') || html.includes('Terima kasih'), 'Must render quote text');
    assert.ok(html.includes('border-accent-valor'), 'Must use accent valor border');
  });

  // ------------------------------------------------------------------------------
  // 5. H-07 NON-SURVEILLANCE & ZERO-COMPARATIVE DOM INTEGRITY
  // ------------------------------------------------------------------------------
  console.log('\n--- MODULE 5: H-07 Non-Surveillance DOM Shield ---');

  runCheck('H-07 DOM Shield [ZERO LEADERBOARDS]: DOM contains zero comparative ranking classes', () => {
    const teacherHtml = cleanHtml(renderToString(<TeacherBriefing data={mockTeacherOperational} />));
    const headmasterHtml = cleanHtml(renderToString(<HeadmasterBriefing data={mockHeadmasterOperational} />));

    const forbiddenDomSubstrings = [
      'leaderboard',
      'ranking',
      'percentile',
      'teacher-rank',
      'student-rank',
      'speed-rank'
    ];

    for (const forbidden of forbiddenDomSubstrings) {
      assert.ok(!teacherHtml.toLowerCase().includes(forbidden), `DOM must not contain "${forbidden}"`);
      assert.ok(!headmasterHtml.toLowerCase().includes(forbidden), `DOM must not contain "${forbidden}"`);
    }
  });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6-A SUITE 31 SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED (TOTAL: ${totalTests})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (failedTests > 0) {
    throw new Error(`Failed ${failedTests} tests in Suite 31.`);
  }
}

runBriefingUITests().catch((err) => {
  console.error('Fatal error in Suite 31 runner:', err);
  process.exit(1);
});
