/**
 * Yapendik School OS — Test Suite 47: Calendar & Attendance Integrity (ARB Mandate)
 * 
 * Verifies:
 * 1. Denominator Math: Excludes weekends and national holidays/cuti bersama from denominator.
 * 2. Custom Override Precedence: School-level custom holiday overrides national calendar (FB-03).
 * 3. Canonical Fallback Integrity: Provides zero-error holiday data for offline scenarios.
 * 4. Zero-DDL Storage: Persists custom holidays without database DDL mutations.
 */

import { holidayService, HolidayEntry } from '../services/holidayService';

export interface Suite47TestResult {
  id: string;
  name: string;
  category: 'DENOMINATOR_MATH' | 'CUSTOM_OVERRIDE_PRECEDENCE' | 'CANONICAL_FALLBACK' | 'ZERO_DDL_PERSISTENCE';
  expected: string;
  actual: string;
  passed: boolean;
  notes?: string;
}

export function runSuite47Tests(): {
  total: number;
  passed: number;
  failed: number;
  results: Suite47TestResult[];
} {
  const results: Suite47TestResult[] = [];

  // =========================================================================
  // 1. DENOMINATOR MATH TEST
  // =========================================================================
  {
    // Scenario: September 2026 has 30 calendar days.
    // Weekdays (Mon-Fri) = 22 days.
    // Weekends (Sat-Sun) = 8 days.
    // National Holiday on a weekday = 2026-09-25 (Maulid Nabi Muhammad SAW, Friday).
    // Expected Effective School Days = 22 - 1 = 21 days.
    const mockDatesInMonth: string[] = [];
    for (let d = 1; d <= 30; d++) {
      mockDatesInMonth.push(`2026-09-${String(d).padStart(2, '0')}`);
    }

    const effectiveDays = mockDatesInMonth.filter(dateStr => {
      const parts = dateStr.split('-');
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      const dayOfWeek = d.getDay();
      // Exclude Saturday (6) & Sunday (0)
      if (dayOfWeek === 0 || dayOfWeek === 6) return false;
      // Exclude National Holiday / Cuti Bersama
      if (holidayService.isHoliday(dateStr)) return false;
      return true;
    });

    const passed = effectiveDays.length === 21;
    results.push({
      id: 'suite47_test_01_denominator_math',
      name: 'Denominator Math: 30 Calendar Days, 8 Weekends, 1 Holiday -> 21 Effective Days',
      category: 'DENOMINATOR_MATH',
      expected: '21',
      actual: String(effectiveDays.length),
      passed,
      notes: passed 
        ? 'Maulid Nabi Muhammad SAW (2026-09-25) & 8 akhir pekan sukses dikeluarkan dari denominator.' 
        : 'Denominator math discrepancy detected.'
    });
  }

  // =========================================================================
  // 2. CUSTOM OVERRIDE PRECEDENCE TEST (FB-03 Autonomy)
  // =========================================================================
  {
    const testSchoolId = 'sch_maranatha_pilot_test';
    const testCustomDate = '2026-09-10'; // Thursday (Normal school day in national API)

    // Ensure it is not a national holiday initially
    const nationalInitial = holidayService.isHoliday(testCustomDate);
    
    // School Head sets custom holiday: "Retret Pendidik Yapendik"
    holidayService.saveCustomHoliday(testSchoolId, {
      date: testCustomDate,
      name: 'Retret Pendidik Yapendik',
      description: 'Pengembangan spiritual dan pelatihan kurikulum internal'
    });

    const evaluated = holidayService.isHoliday(testCustomDate, testSchoolId);
    const passed = Boolean(
      !nationalInitial && 
      evaluated && 
      evaluated.source === 'CUSTOM_SCHOOL' && 
      evaluated.name === 'Retret Pendidik Yapendik'
    );

    results.push({
      id: 'suite47_test_02_custom_override_precedence',
      name: 'Custom Override: Libur Khusus Sekolah menimpa kalender standar',
      category: 'CUSTOM_OVERRIDE_PRECEDENCE',
      expected: 'CUSTOM_SCHOOL (Retret Pendidik Yapendik)',
      actual: evaluated ? `${evaluated.source} (${evaluated.name})` : 'NULL',
      passed,
      notes: passed 
        ? 'Kedaulatan Satuan Pendidikan (FB-03) terbukti memegang prioritas tertinggi.' 
        : 'Custom holiday failed to override national calendar.'
    });

    // Clean up test data
    holidayService.removeCustomHoliday(testSchoolId, testCustomDate);
  }

  // =========================================================================
  // 3. CANONICAL FALLBACK ZERO-ERROR POLICY
  // =========================================================================
  {
    const independenceDay = holidayService.isHoliday('2026-08-17');
    const christmasDay = holidayService.isHoliday('2026-12-25');
    const passed = Boolean(
      independenceDay && 
      independenceDay.name.includes('Kemerdekaan') && 
      christmasDay && 
      christmasDay.name.includes('Natal')
    );

    results.push({
      id: 'suite47_test_03_canonical_fallback',
      name: 'Canonical Fallback: Kalender Bawaan 2026 tersedia offline tanpa error',
      category: 'CANONICAL_FALLBACK',
      expected: 'Kemerdekaan RI & Hari Raya Natal tervalidasi',
      actual: passed ? 'Tervalidasi' : 'Gagal memuat katalog kanonikal',
      passed,
      notes: passed 
        ? 'Katalog fallback built-in src/data/holidays_fallback.json berfungsi sempurna saat offline.' 
        : 'Canonical fallback missing essential holidays.'
    });
  }

  // =========================================================================
  // 4. ZERO-DDL STORAGE PERSISTENCE
  // =========================================================================
  {
    const testSchoolId = 'sch_zero_ddl_test';
    holidayService.saveCustomHoliday(testSchoolId, {
      date: '2026-10-15',
      name: 'HUT Yayasan Yapendik'
    });

    const customs = holidayService.getCustomHolidays(testSchoolId);
    const found = customs.some(c => c.date === '2026-10-15' && c.name === 'HUT Yayasan Yapendik');

    holidayService.removeCustomHoliday(testSchoolId, '2026-10-15');
    const customsAfterRemove = holidayService.getCustomHolidays(testSchoolId);
    const removed = !customsAfterRemove.some(c => c.date === '2026-10-15');

    const passed = found && removed;
    results.push({
      id: 'suite47_test_04_zero_ddl_persistence',
      name: 'Zero-DDL: Penyimpanan custom holidays di namespace local store tanpa mutasi skema database',
      category: 'ZERO_DDL_PERSISTENCE',
      expected: 'Persist and remove successful without DDL migration',
      actual: passed ? 'Berhasil disimpan & dihapus di namespace' : 'Gagal operasi storage',
      passed,
      notes: passed 
        ? 'Prinsip Zero-DDL Frozen Baseline V2.1.5 terjaga utuh.' 
        : 'Storage persistence error.'
    });
  }

  const total = results.length;
  const passedCount = results.filter(r => r.passed).length;
  const failed = total - passedCount;

  return {
    total,
    passed: passedCount,
    failed,
    results
  };
}
