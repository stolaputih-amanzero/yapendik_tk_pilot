/**
 * Suite 48: Pedagogical Operating Loop Synchronization Tests
 * Verifies 5 architectural invariants mandated by ARB:
 * 1. Stepper skips weekend (Friday -> Monday)
 * 2. Stepper skips national holiday (Thu 24 Sep -> Mon 28 Sep 2026, skipping Maulid Nabi 25 Sep)
 * 3. Reverse stepper skips national holiday and weekend (Mon 28 Sep -> Thu 24 Sep 2026)
 * 4. RPPM weekly matrix effective days count (Week 21-25 Sep = exactly 4 effective KBM days)
 * 5. Law 11 Zero-Emoji compliance in column headers and status capsules
 */

import { holidayService } from '../services/holidayService';

export function runSuite48PedagogicalLoopTests(): { passed: number; failed: number; errors: string[] } {
  console.log('\n================================================================================');
  console.log('  RUNNING SUITE 48: Pedagogical Operating Loop Synchronization Tests');
  console.log('================================================================================');

  let passed = 0;
  let failed = 0;
  const errors: string[] = [];

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✓ ${testName}`);
      passed++;
    } else {
      console.error(`  ✗ ${testName}${detail ? ` - ${detail}` : ''}`);
      errors.push(`${testName}${detail ? `: ${detail}` : ''}`);
      failed++;
    }
  }

  // --------------------------------------------------------------------------
  // Invariant 1: Stepper skips weekend (Friday -> Monday)
  // --------------------------------------------------------------------------
  try {
    // 2026-09-04 is Friday. Shifting +1 should skip Saturday (5) & Sunday (6) and land on Monday 2026-09-07.
    const nextSchoolDay = holidayService.shiftSchoolDate('2026-09-04', 1);
    assert(
      nextSchoolDay === '2026-09-07',
      'Invariant 1: Stepper skips weekend (Fri 4 Sep -> Mon 7 Sep 2026)',
      `Expected 2026-09-07, got ${nextSchoolDay}`
    );
  } catch (err: any) {
    assert(false, 'Invariant 1: Stepper skips weekend', err.message);
  }

  // --------------------------------------------------------------------------
  // Invariant 2: Stepper skips national holiday (Thu 24 Sep -> Mon 28 Sep 2026)
  // --------------------------------------------------------------------------
  try {
    // 2026-09-24 is Thursday.
    // 2026-09-25 is Friday (Maulid Nabi Muhammad SAW - National Holiday).
    // 2026-09-26 is Saturday (Weekend).
    // 2026-09-27 is Sunday (Weekend).
    // Target should be Monday 2026-09-28.
    const nextSchoolDayAfterHoliday = holidayService.shiftSchoolDate('2026-09-24', 1);
    assert(
      nextSchoolDayAfterHoliday === '2026-09-28',
      'Invariant 2: Stepper skips national holiday (Thu 24 Sep -> Mon 28 Sep 2026, skipping Maulid Nabi 25 Sep)',
      `Expected 2026-09-28, got ${nextSchoolDayAfterHoliday}`
    );
  } catch (err: any) {
    assert(false, 'Invariant 2: Stepper skips national holiday', err.message);
  }

  // --------------------------------------------------------------------------
  // Invariant 3: Reverse stepper skips national holiday and weekend (Mon 28 Sep -> Thu 24 Sep 2026)
  // --------------------------------------------------------------------------
  try {
    // 2026-09-28 is Monday.
    // Shifting -1 should skip Sun 27 Sep, Sat 26 Sep, and Fri 25 Sep (Holiday), landing on Thu 2026-09-24.
    const prevSchoolDay = holidayService.shiftSchoolDate('2026-09-28', -1);
    assert(
      prevSchoolDay === '2026-09-24',
      'Invariant 3: Reverse stepper skips weekend and holiday (Mon 28 Sep -> Thu 24 Sep 2026)',
      `Expected 2026-09-24, got ${prevSchoolDay}`
    );
  } catch (err: any) {
    assert(false, 'Invariant 3: Reverse stepper skips weekend and holiday', err.message);
  }

  // --------------------------------------------------------------------------
  // Invariant 4: RPPM weekly matrix effective days count (Week 21-25 Sep = 4 days)
  // --------------------------------------------------------------------------
  try {
    // Monday 2026-09-21 to Friday 2026-09-25
    const weekDays = [
      '2026-09-21', // Mon
      '2026-09-22', // Tue
      '2026-09-23', // Wed
      '2026-09-24', // Thu
      '2026-09-25', // Fri (Maulid Nabi)
    ];

    const effectiveDays = weekDays.filter(d => !holidayService.isHoliday(d));
    assert(
      effectiveDays.length === 4,
      'Invariant 4: RPPM weekly matrix effective days (Week 21-25 Sep = 4 Effective KBM Days)',
      `Expected 4 days, got ${effectiveDays.length} (${effectiveDays.join(', ')})`
    );
  } catch (err: any) {
    assert(false, 'Invariant 4: RPPM weekly matrix effective days', err.message);
  }

  // --------------------------------------------------------------------------
  // Invariant 5: Law 11 Zero-Emoji compliance in column headers and status capsules
  // --------------------------------------------------------------------------
  try {
    const holidayEntry = holidayService.isHoliday('2026-09-25');
    assert(
      !!holidayEntry && holidayEntry.name.includes('Maulid Nabi'),
      'Invariant 5a: Canonical holiday 2026-09-25 recognized as Maulid Nabi',
      `Found: ${holidayEntry?.name}`
    );

    // Ensure holiday entry name contains no unicode emojis
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    const hasEmoji = emojiRegex.test(holidayEntry?.name || '');
    assert(
      !hasEmoji,
      'Invariant 5b: Law 11 compliance - zero unicode emoji in holiday name string',
      `Holiday name "${holidayEntry?.name}" contained emoji`
    );
  } catch (err: any) {
    assert(false, 'Invariant 5: Law 11 Zero-Emoji compliance', err.message);
  }

  console.log('================================================================================');
  console.log(`  Suite 48: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================================\n');

  return { passed, failed, errors };
}

// Standalone execution support
if (import.meta.url.endsWith(process.argv[1]) || process.argv[1]?.includes('suite48PedagogicalLoopTests')) {
  const result = runSuite48PedagogicalLoopTests();
  if (result.failed > 0) {
    process.exit(1);
  }
}
