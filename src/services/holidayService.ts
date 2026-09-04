/**
 * Yapendik School OS — Holiday Service (Amanaura v3.0 Offline-First Architecture)
 * Compliant with Part VIII §8.2, 4 ARB Directives, and Zero-DDL State.
 * 
 * Features:
 * 1. Denominator Exclusion Support (Identification of non-effective school days).
 * 2. Stale-While-Revalidate (SWR) with 30-Day TTL via localStorage namespace `holiday_catalog_{year}`.
 * 3. Built-in Canonical Fallback (`src/data/holidays_fallback.json`) for Zero-Error Policy.
 * 4. School-Level Custom Holiday Precedence (`school_custom_holidays_{schoolId}`).
 */

import fallbackHolidays from '../data/holidays_fallback.json';

export type HolidaySource = 'API_SYNCED' | 'CACHE_HIT' | 'CANONICAL_FALLBACK' | 'CUSTOM_SCHOOL';

export interface HolidayEntry {
  date: string; // ISO format: YYYY-MM-DD
  name: string;
  isNationalHoliday: boolean;
  isCutiBersama: boolean;
  source: HolidaySource;
  description?: string;
  schoolId?: string;
}

export type HolidaySyncStatus = 'ONLINE_SYNCED' | 'USING_FALLBACK' | 'SYNCING';

interface CachedCatalog {
  year: number;
  updatedAt: number; // Unix timestamp ms
  holidays: HolidayEntry[];
}

const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days in ms
const FETCH_TIMEOUT_MS = 3500; // 3.5s fetch timeout for graceful degradation

class HolidayService {
  private memoryCache: Map<number, HolidayEntry[]> = new Map();
  private customHolidaysMemory: Map<string, HolidayEntry[]> = new Map();
  private syncStatus: HolidaySyncStatus = 'USING_FALLBACK';
  private listeners: Set<() => void> = new Set();
  private isRevalidating: Set<number> = new Set();


  constructor() {
    this.initDefaultCatalogs();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        const currentYear = new Date().getFullYear();
        this.revalidateYear(currentYear);
      });
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(fn => {
      try {
        fn();
      } catch (err) {
        console.error('HolidayService subscriber error:', err);
      }
    });
  }

  public getSyncStatus(): HolidaySyncStatus {
    return this.syncStatus;
  }

  /**
   * Initializes memory cache from canonical fallback data.
   */
  private initDefaultCatalogs() {
    const rawFallback = fallbackHolidays as HolidayEntry[];
    const grouped = new Map<number, HolidayEntry[]>();

    rawFallback.forEach(item => {
      const year = parseInt(item.date.split('-')[0], 10);
      if (!grouped.has(year)) {
        grouped.set(year, []);
      }
      grouped.get(year)!.push({
        ...item,
        source: 'CANONICAL_FALLBACK'
      });
    });

    grouped.forEach((list, year) => {
      // Check if localStorage has cached data
      const cached = this.loadFromStorage(year);
      if (cached && cached.length > 0) {
        this.memoryCache.set(year, cached);
        this.syncStatus = 'ONLINE_SYNCED';
      } else {
        this.memoryCache.set(year, list);
        this.syncStatus = 'USING_FALLBACK';
      }
    });
  }

  /**
   * Load cached holiday catalog from localStorage
   */
  private loadFromStorage(year: number): HolidayEntry[] | null {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(`holiday_catalog_${year}`);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as CachedCatalog;
      const isFresh = Date.now() - parsed.updatedAt < CACHE_TTL_MS;
      if (isFresh && Array.isArray(parsed.holidays)) {
        return parsed.holidays.map(h => ({ ...h, source: 'CACHE_HIT' as const }));
      }
    } catch {
      // Ignore JSON parse errors
    }
    return null;
  }

  /**
   * Persist catalog to localStorage
   */
  private saveToStorage(year: number, holidays: HolidayEntry[]) {
    if (typeof localStorage === 'undefined') return;
    try {
      const payload: CachedCatalog = {
        year,
        updatedAt: Date.now(),
        holidays
      };
      localStorage.setItem(`holiday_catalog_${year}`, JSON.stringify(payload));
    } catch {
      // Ignore storage errors (quota, etc.)
    }
  }

  /**
   * Load custom school holidays from Zero-DDL store `school_custom_holidays_{schoolId}`
   */
  /**
   * Load custom school holidays from Zero-DDL store `school_custom_holidays_{schoolId}`
   */
  public getCustomHolidays(schoolId: string): HolidayEntry[] {
    if (!schoolId) return [];
    
    // Check in-memory cache first
    if (this.customHolidaysMemory.has(schoolId)) {
      return this.customHolidaysMemory.get(schoolId)!;
    }

    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem(`school_custom_holidays_${schoolId}`);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            const mapped = parsed.map(h => ({
              ...h,
              source: 'CUSTOM_SCHOOL' as const,
              isNationalHoliday: false,
              isCutiBersama: false
            }));
            this.customHolidaysMemory.set(schoolId, mapped);
            return mapped;
          }
        }
      } catch {
        // Ignore
      }
    }
    return [];
  }

  /**
   * Save a custom school holiday (Zero-DDL Precedence)
   */
  public saveCustomHoliday(schoolId: string, holiday: { date: string; name: string; description?: string }) {
    if (!schoolId) return;
    try {
      const existing = this.getCustomHolidays(schoolId);
      const filtered = existing.filter(h => h.date !== holiday.date);
      filtered.push({
        date: holiday.date,
        name: holiday.name,
        description: holiday.description,
        isNationalHoliday: false,
        isCutiBersama: false,
        source: 'CUSTOM_SCHOOL',
        schoolId
      });
      this.customHolidaysMemory.set(schoolId, filtered);

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`school_custom_holidays_${schoolId}`, JSON.stringify(filtered));
      }
      this.notify();
    } catch {
      // Ignore
    }
  }

  /**
   * Remove custom school holiday
   */
  public removeCustomHoliday(schoolId: string, date: string) {
    if (!schoolId) return;
    try {
      const existing = this.getCustomHolidays(schoolId);
      const filtered = existing.filter(h => h.date !== date);
      this.customHolidaysMemory.set(schoolId, filtered);

      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(`school_custom_holidays_${schoolId}`, JSON.stringify(filtered));
      }
      this.notify();
    } catch {
      // Ignore
    }
  }

  /**
   * Merges API results with built-in canonical catalog to prevent data loss (Directive 2).
   */
  private mergeWithCanonical(year: number, apiEntries: HolidayEntry[]): HolidayEntry[] {
    const canonicalForYear = (fallbackHolidays as HolidayEntry[]).filter(h => h.date.startsWith(`${year}-`));
    const map = new Map<string, HolidayEntry>();

    // 1. Seed canonical catalog
    canonicalForYear.forEach(h => {
      map.set(h.date, { ...h, source: 'CANONICAL_FALLBACK' });
    });

    // 2. Enrich with external API entries
    apiEntries.forEach(h => {
      map.set(h.date, h);
    });

    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Asynchronous background revalidation using Stale-While-Revalidate (SWR)
   */
  public async revalidateYear(year: number): Promise<void> {
    if (this.isRevalidating.has(year)) return;
    this.isRevalidating.add(year);

    try {
      // Attempt primary Indonesian holiday endpoint (SKB 3 Menteri)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

      const res = await fetch(`https://api-harilibur.vercel.app/api?year=${year}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: HolidayEntry[] = data
            .filter((item: any) => item.holiday_date && item.is_national_holiday)
            .map((item: any) => ({
              date: item.holiday_date,
              name: item.holiday_name || 'Hari Libur Nasional',
              isNationalHoliday: true,
              isCutiBersama: Boolean(item.is_cuti_bersama || (item.holiday_name && item.holiday_name.toLowerCase().includes('cuti'))),
              source: 'API_SYNCED' as const
            }));

          if (mapped.length > 0) {
            const merged = this.mergeWithCanonical(year, mapped);
            this.memoryCache.set(year, merged);
            this.saveToStorage(year, merged);
            this.syncStatus = 'ONLINE_SYNCED';
            this.notify();
            return;
          }
        }
      }
    } catch {
      // Fallback silently if offline or API failure
    } finally {
      this.isRevalidating.delete(year);
    }

    // Try secondary Nager.Date ID if primary failed
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      const res = await fetch(`https://date.nager.at/api/v3/publicholidays/${year}/ID`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped: HolidayEntry[] = data.map((item: any) => ({
            date: item.date,
            name: item.localName || item.name || 'Hari Libur Nasional',
            isNationalHoliday: true,
            isCutiBersama: false,
            source: 'API_SYNCED' as const
          }));

          const merged = this.mergeWithCanonical(year, mapped);
          this.memoryCache.set(year, merged);
          this.saveToStorage(year, merged);
          this.syncStatus = 'ONLINE_SYNCED';
          this.notify();
          return;
        }
      }
    } catch {
      // Graceful degradation
    }

    // If network fetches fail, maintain existing or canonical fallback
    if (!this.memoryCache.has(year)) {
      const canonical = (fallbackHolidays as HolidayEntry[]).filter(h => h.date.startsWith(`${year}-`));
      this.memoryCache.set(year, canonical);
    }
    this.syncStatus = 'USING_FALLBACK';
  }

  /**
   * Synchronous check if a given date (YYYY-MM-DD) is a holiday.
   * Priority (ARB Precedence):
   * 1. Custom School Holiday (FB-03 Autonomy)
   * 2. Synced API / Cached / Canonical National Holiday & Cuti Bersama
   */
  public isHoliday(dateStr: string, schoolId?: string): HolidayEntry | null {
    if (!dateStr) return null;

    // 1. Check custom school holiday first
    if (schoolId) {
      const customs = this.getCustomHolidays(schoolId);
      const matchCustom = customs.find(c => c.date === dateStr);
      if (matchCustom) {
        return matchCustom;
      }
    }

    // 2. Check national & cuti bersama
    const parts = dateStr.split('-');
    if (parts.length < 3) return null;
    const year = parseInt(parts[0], 10);

    let yearHolidays = this.memoryCache.get(year);
    if (!yearHolidays) {
      // Trigger background revalidation
      this.revalidateYear(year);
      // Use fallback in the meantime
      yearHolidays = (fallbackHolidays as HolidayEntry[]).filter(h => h.date.startsWith(`${year}-`));
      this.memoryCache.set(year, yearHolidays);
    }

    const match = yearHolidays.find(h => h.date === dateStr);
    return match || null;
  }

  /**
   * Get all holidays for a given month, merged with custom school holidays
   */
  public getHolidaysForMonth(year: number, month: number, schoolId?: string): HolidayEntry[] {
    const prefix = `${year}-${String(month).padStart(2, '0')}-`;
    const results: HolidayEntry[] = [];

    // 1. National holidays from memory cache / fallback
    let yearHolidays = this.memoryCache.get(year);
    if (!yearHolidays) {
      this.revalidateYear(year);
      yearHolidays = (fallbackHolidays as HolidayEntry[]).filter(h => h.date.startsWith(`${year}-`));
      this.memoryCache.set(year, yearHolidays);
    }

    yearHolidays.filter(h => h.date.startsWith(prefix)).forEach(h => {
      results.push(h);
    });

    // 2. Merge with custom school holidays (custom overrides if same date)
    if (schoolId) {
      const customs = this.getCustomHolidays(schoolId).filter(h => h.date.startsWith(prefix));
      customs.forEach(c => {
        const existingIdx = results.findIndex(r => r.date === c.date);
        if (existingIdx >= 0) {
          results[existingIdx] = c;
        } else {
          results.push(c);
        }
      });
    }

    return results.sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Smart school day stepper: shifts date by 1 day in direction (+1 or -1)
   * skipping weekends (Saturday & Sunday) and national/school holidays if skipHolidays is true.
   * Includes a 30-step loop guard to prevent infinite loops.
   */
  public shiftSchoolDate(
    dateStr: string,
    direction: 1 | -1,
    schoolId?: string,
    skipHolidays: boolean = true
  ): string {
    try {
      const [y, m, d] = dateStr.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      let steps = 0;
      const MAX_STEPS = 30; // 30-day loop guard

      while (steps < MAX_STEPS) {
        steps++;
        dateObj.setDate(dateObj.getDate() + direction);
        const dayOfWeek = dateObj.getDay();

        // 1. Skip weekend
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          continue;
        }

        // 2. Check holiday if requested
        if (skipHolidays) {
          const cy = dateObj.getFullYear();
          const cm = String(dateObj.getMonth() + 1).padStart(2, '0');
          const cd = String(dateObj.getDate()).padStart(2, '0');
          const currentIso = `${cy}-${cm}-${cd}`;
          if (this.isHoliday(currentIso, schoolId)) {
            continue;
          }
        }

        // Valid school day reached
        break;
      }

      const ry = dateObj.getFullYear();
      const rm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const rd = String(dateObj.getDate()).padStart(2, '0');
      return `${ry}-${rm}-${rd}`;
    } catch {
      return dateStr;
    }
  }
}

export const holidayService = new HolidayService();
