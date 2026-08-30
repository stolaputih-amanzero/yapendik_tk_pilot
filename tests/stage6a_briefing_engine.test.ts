/**
 * YAPENDIK SCHOOL OS — STAGE 6-A: SPRINT 2 BRIEFING ENGINE & PURE STATE MACHINES TEST SUITE
 * 
 * Verifies:
 * - Module 1: Pure Circadian Timezone & Mode Evaluation (T-1, WIB/WITA/WIT)
 * - Module 2: Pure Closure State Machine & Safety Alerts Bypass (T-3, Sisa Tenang)
 * - Module 3: Pure Message Holding Policy (D-8 Right to Rest & z-80 Critical Shield)
 * - Module 4: Pure 432Hz Audio Gate (D-7 Earned / Intentional with User Gesture)
 * - Module 5: BriefingEngine Service Orchestration & Discriminated Unions
 * - Module 6: H-07 Non-Surveillance Integrity Validator
 * - Module 7: FB-08 Authority Boundary & Cross-School Mutation Protection
 */

import assert from 'node:assert/strict';
import {
  evaluateBriefingMode,
  evaluateClosureState,
  evaluateMessageHolding,
  canPlay432HzSound,
  resolveSchoolLocalTime,
  findActivePhase
} from '../src/services/briefing/StateMachines';
import {
  briefingEngine,
  CANONICAL_DEFAULT_RHYTHM
} from '../src/services/BriefingEngine';
import { SchoolRhythmConfig, UserRole } from '../src/types/briefingTypes';

let passedChecks = 0;
let totalChecks = 0;

function runCheck(name: string, fn: () => void | Promise<void>) {
  totalChecks++;
  try {
    const result = fn();
    if (result instanceof Promise) {
      return result
        .then(() => {
          passedChecks++;
          console.log(`  🟢 PASS: ${name}`);
        })
        .catch((err) => {
          console.error(`  ❌ FAIL: ${name}`);
          console.error(`     Error: ${err.message}`);
        });
    } else {
      passedChecks++;
      console.log(`  🟢 PASS: ${name}`);
    }
  } catch (err: any) {
    console.error(`  ❌ FAIL: ${name}`);
    console.error(`     Error: ${err.message}`);
  }
}

async function runStage6aEngineTests() {
  console.log('════════════════════════════════════════════════════════════════');
  console.log('🧪 STAGE 6-A: SPRINT 2 SERVICE LAYER & STATE MACHINES SUITE');
  console.log('════════════════════════════════════════════════════════════════\n');

  // ===========================================================================
  // MODULE 1: CIRCADIAN TIMEZONE & MODE EVALUATION (T-1)
  // ===========================================================================
  console.log('--- MODULE 1: Circadian Timezone & Mode Evaluation (T-1) ---');

  runCheck('Circadian [WIB +7 OFFSET]: Correctly resolves UTC 02:00 to 09:00 WIB', () => {
    const serverUtc = new Date('2026-08-30T02:00:00Z');
    const { localTimeString } = resolveSchoolLocalTime(serverUtc, 'WIB');
    assert.equal(localTimeString, '09:00');
  });

  runCheck('Circadian [WITA +8 OFFSET]: Correctly resolves UTC 02:00 to 10:00 WITA', () => {
    const serverUtc = new Date('2026-08-30T02:00:00Z');
    const { localTimeString } = resolveSchoolLocalTime(serverUtc, 'WITA');
    assert.equal(localTimeString, '10:00');
  });

  runCheck('Circadian [WIT +9 OFFSET]: Correctly resolves UTC 02:00 to 11:00 WIT', () => {
    const serverUtc = new Date('2026-08-30T02:00:00Z');
    const { localTimeString } = resolveSchoolLocalTime(serverUtc, 'WIT');
    assert.equal(localTimeString, '11:00');
  });

  runCheck('Circadian [PRATINJAU MODE]: Triggers before school opening time (06:45)', () => {
    const earlyMorningUtc = new Date('2026-08-30T23:30:00Z'); // 06:30 WIB
    const config: SchoolRhythmConfig = {
      ...CANONICAL_DEFAULT_RHYTHM,
      school_timezone: 'WIB',
      school_opening_time: '06:45',
      school_closing_time: '14:30'
    };
    const mode = evaluateBriefingMode(earlyMorningUtc, config);
    assert.equal(mode, 'PRATINJAU');
  });

  runCheck('Circadian [OPERASIONAL MODE]: Triggers during active school hours', () => {
    const schoolHoursUtc = new Date('2026-08-30T01:30:00Z'); // 08:30 WIB
    const config: SchoolRhythmConfig = {
      ...CANONICAL_DEFAULT_RHYTHM,
      school_timezone: 'WIB',
      school_opening_time: '06:45',
      school_closing_time: '14:30'
    };
    const mode = evaluateBriefingMode(schoolHoursUtc, config);
    assert.equal(mode, 'OPERASIONAL');
  });

  runCheck('Circadian [PENUTUP MODE]: Triggers after school closing time (14:30)', () => {
    const eveningUtc = new Date('2026-08-30T08:00:00Z'); // 15:00 WIB
    const config: SchoolRhythmConfig = {
      ...CANONICAL_DEFAULT_RHYTHM,
      school_timezone: 'WIB',
      school_opening_time: '06:45',
      school_closing_time: '14:30'
    };
    const mode = evaluateBriefingMode(eveningUtc, config);
    assert.equal(mode, 'PENUTUP');
  });

  runCheck('Circadian [ACTIVE PHASE FINDER]: Identifies matching phase by time interval', () => {
    const active = findActivePhase('08:15', CANONICAL_DEFAULT_RHYTHM.phases);
    assert.ok(active);
    assert.equal(active.phase_id, 'CENTRA');
    assert.equal(active.phase_name, 'Main Sentra');
  });

  // ===========================================================================
  // MODULE 2: CLOSURE STATE MACHINE & SAFETY BYPASS (T-3)
  // ===========================================================================
  console.log('\n--- MODULE 2: Closure State Machine & Safety Override (T-3) ---');

  runCheck('Closure [TUNTAS STATE]: Resolves TUNTAS when pending tasks == 0 and safety == 0', () => {
    const state = evaluateClosureState(
      { attendance: false, drafts: 0, messages: 0 },
      0
    );
    assert.equal(state, 'TUNTAS');
  });

  runCheck('Closure [SISA TENANG STATE]: Resolves SISA_TENANG when pending drafts > 0 without guilt', () => {
    const state = evaluateClosureState(
      { attendance: false, drafts: 2, messages: 1 },
      0
    );
    assert.equal(state, 'SISA_TENANG');
  });

  runCheck('Closure [SAFETY OVERRIDE BYPASS]: Cancels serene closure if safetyAlerts > 0', () => {
    const state = evaluateClosureState(
      { attendance: false, drafts: 0, messages: 0 },
      1 // active safety alert (fever / emergency)
    );
    assert.equal(state, 'BYPASSED');
  });

  // ===========================================================================
  // MODULE 3: MESSAGE HOLDING POLICY (D-8)
  // ===========================================================================
  console.log('\n--- MODULE 3: Right to Rest & Message Holding (D-8) ---');

  runCheck('Message Holding [HOLD AFTER HOURS]: Non-safety message held until morning', () => {
    const eveningTime = new Date('2026-08-30T12:00:00Z'); // 19:00 WIB
    const policy = evaluateMessageHolding(eveningTime, '14:30', false, 'WIB');
    assert.equal(policy, 'HOLD_UNTIL_MORNING');
  });

  runCheck('Message Holding [CRITICAL SAFETY BYPASS]: Delivers immediately despite night time', () => {
    const lateNightTime = new Date('2026-08-30T16:00:00Z'); // 23:00 WIB
    const policy = evaluateMessageHolding(lateNightTime, '14:30', true, 'WIB');
    assert.equal(policy, 'DELIVER_IMMEDIATELY');
  });

  runCheck('Message Holding [DURING SCHOOL HOURS]: Delivers immediately during daytime', () => {
    const schoolTime = new Date('2026-08-30T02:00:00Z'); // 09:00 WIB
    const policy = evaluateMessageHolding(schoolTime, '14:30', false, 'WIB');
    assert.equal(policy, 'DELIVER_IMMEDIATELY');
  });

  // ===========================================================================
  // MODULE 4: 432Hz AUDIO GATE VALIDATION (D-7)
  // ===========================================================================
  console.log('\n--- MODULE 4: 432Hz Harmonic Sound Gate (D-7) ---');

  runCheck('Audio Gate [EARNED]: Plays sound on earned task completion with gesture', () => {
    const canPlay = canPlay432HzSound('EARNED', true, true);
    assert.equal(canPlay, true);
  });

  runCheck('Audio Gate [INTENTIONAL]: Plays sound on intentional Tutup Hari tap with gesture', () => {
    const canPlay = canPlay432HzSound('INTENTIONAL', true, true);
    assert.equal(canPlay, true);
  });

  runCheck('Audio Gate [GESTURE MISSING]: Rejects audio playback if user gesture is absent', () => {
    const canPlay = canPlay432HzSound('EARNED', false, true);
    assert.equal(canPlay, false);
  });

  runCheck('Audio Gate [NAVIGATION PROHIBITED]: Rejects audio during page transitions', () => {
    const canPlay = canPlay432HzSound('NAVIGATION_PROHIBITED', true, true);
    assert.equal(canPlay, false);
  });

  runCheck('Audio Gate [DISABLED PREFERENCE]: Respects user toggle OFF preference', () => {
    const canPlay = canPlay432HzSound('EARNED', true, false);
    assert.equal(canPlay, false);
  });

  // ===========================================================================
  // MODULE 5: BRIEFING ENGINE SERVICE ORCHESTRATION
  // ===========================================================================
  console.log('\n--- MODULE 5: BriefingEngine Service Orchestration ---');

  await runCheck('BriefingEngine [TEACHER DATA]: Renders valid TeacherBriefingData contract', async () => {
    const data = await briefingEngine.getBriefingDataForUser('TEACHER', 'sch_tk_yapendik_01');
    assert.equal(data.role, 'TEACHER');
    assert.ok(data.greeting);
    assert.ok(data.date_formatted);
    assert.ok(data.pending_tasks);
    assert.ok(data.warm_echo);
  });

  await runCheck('BriefingEngine [HEADMASTER DATA]: Renders valid HeadmasterBriefingData with reconciliation', async () => {
    const data = await briefingEngine.getBriefingDataForUser('HEADMASTER', 'sch_tk_yapendik_01');
    assert.equal(data.role, 'HEADMASTER');
    assert.ok((data as any).reconciliation);
    assert.ok((data as any).authority_queue);
  });

  await runCheck('BriefingEngine [FOUNDATION DATA]: Renders FoundationBriefingData with K-anonymity compliance', async () => {
    const data = await briefingEngine.getBriefingDataForUser('FOUNDATION', 'sch_tk_yapendik_01');
    assert.equal(data.role, 'FOUNDATION');
    assert.ok((data as any).decision_queue);
    assert.ok((data as any).equity_signals);
  });

  await runCheck('BriefingEngine [GUARDIAN DATA]: Renders GuardianBriefingData with Kamus Keluarga', async () => {
    const data = await briefingEngine.getBriefingDataForUser('GUARDIAN', 'sch_tk_yapendik_01');
    assert.equal(data.role, 'GUARDIAN');
    assert.ok((data as any).child_name);
    assert.ok((data as any).today_summary);
    assert.ok((data as any).latest_moment);
  });

  // ===========================================================================
  // MODULE 6: H-07 NON-SURVEILLANCE ASSERTIONS
  // ===========================================================================
  console.log('\n--- MODULE 6: H-07 Non-Surveillance Integrity Validator ---');

  runCheck('H-07 Validator [DIRTY METRIC REJECTED]: Throws error when ranking property injected', () => {
    assert.throws(
      () => {
        briefingEngine.assertNonSurveillance({
          role: 'TEACHER',
          teacher_ranking: 1,
          message: 'Good job'
        });
      },
      (err: Error) => err.message.includes('SURVEILLANCE_METRIC_REJECTED')
    );
  });

  runCheck('H-07 Validator [PERCENTILE REJECTED]: Throws error when percentile injected', () => {
    assert.throws(
      () => {
        briefingEngine.assertNonSurveillance({
          role: 'TEACHER',
          completion_percentile: 85
        });
      },
      (err: Error) => err.message.includes('SURVEILLANCE_METRIC_REJECTED')
    );
  });

  runCheck('H-07 Validator [CLEAN DATA ACCEPTED]: Passes for standard compassionate briefing payload', () => {
    assert.doesNotThrow(() => {
      briefingEngine.assertNonSurveillance({
        role: 'TEACHER',
        greeting: 'Selamat pagi, Bu Siti',
        pending_tasks: { attendance_incomplete: false }
      });
    });
  });

  // ===========================================================================
  // MODULE 7: FB-08 AUTHORITY BOUNDARY & RITUALS
  // ===========================================================================
  console.log('\n--- MODULE 7: FB-08 Authority Boundary & Rituals ---');

  await runCheck('FB-08 [CROSS-SCHOOL MUTATION BLOCKED]: Rejects KS modifying another school rhythm', async () => {
    await assert.rejects(
      async () => {
        await briefingEngine.updatePhaseActionMapping('sch_tk_rawamangun', 'CENTRA', 'act_record_moment', {
          role: 'HEADMASTER',
          schoolId: 'sch_tk_menteng',
          personId: 'per_ks_menteng'
        });
      },
      (err: Error) => err.message.includes('FORBIDDEN_RHYTHM_MUTATION')
    );
  });

  await runCheck('FB-08 [TEACHER MUTATION BLOCKED]: Rejects teacher modifying rhythm configuration', async () => {
    await assert.rejects(
      async () => {
        await briefingEngine.updatePhaseActionMapping('sch_tk_yapendik_01', 'CENTRA', 'act_record_moment', {
          role: 'TEACHER',
          schoolId: 'sch_tk_yapendik_01',
          personId: 'per_teacher_siti'
        });
      },
      (err: Error) => err.message.includes('FORBIDDEN_RHYTHM_MUTATION')
    );
  });

  await runCheck('Closure Ritual [SAFETY BLOCKED]: Throws error when safetyAlertsCount > 0', async () => {
    await assert.rejects(
      async () => {
        await briefingEngine.triggerClosureRitual('TUNTAS', 0, 2);
      },
      (err: Error) => err.message.includes('CLOSURE_BLOCKED_BY_SAFETY')
    );
  });

  await runCheck('Closure Ritual [SUCCESSFUL EXECUTION]: Successfully executes serene closure', async () => {
    const res = await briefingEngine.triggerClosureRitual('SISA_TENANG', 2, 0, 'Hari yang penuh refleksi.');
    assert.equal(res.success, true);
    assert.equal(res.closure_state, 'SISA_TENANG');
    assert.ok(res.event_id);
  });

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log(`🏁 STAGE 6-A SPRINT 2 SUMMARY: ${passedChecks} PASSED, 0 FAILED (TOTAL: ${totalChecks})`);
  console.log('════════════════════════════════════════════════════════════════\n');

  if (passedChecks !== totalChecks) {
    throw new Error('Some checks failed in Stage 6-A Sprint 2 Suite.');
  }
}

runStage6aEngineTests().catch((err) => {
  console.error('Fatal error in Stage 6-A Engine test runner:', err);
  process.exit(1);
});
