/**
 * YAPENDIK SCHOOL OS — STAGE 6-A PURE STATE MACHINES
 * The Warm Briefing & The Closure Mode
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 * 
 * Rules:
 * - Pure functions only (Zero I/O, Zero DB, Deterministic)
 * - T-1: Timezone Resolution (WIB/WITA/WIT) with Server Time Authority
 * - T-3: Non-Aggregability & Sisa Tenang non-guilt framing
 * - D-7: 432Hz Sound Gate (Earned/Intentional with User Gesture)
 * - D-8: Right to Rest & Message Holding (Critical Safety Bypass)
 */

import {
  BriefingMode,
  ClosureState,
  MessageDeliveryPolicy,
  SchoolRhythmConfig,
  SchoolTimezone,
  SoundTriggerContext,
  PhaseConfig
} from '../../types/briefingTypes';

/**
 * Mengonversi waktu UTC server ke waktu lokal zona sekolah.
 * Toleransi: WIB (+7), WITA (+8), WIT (+9).
 */
export function resolveSchoolLocalTime(
  serverUtc: Date,
  timezone: SchoolTimezone = 'WIB'
): { localDate: Date; localTimeString: string } {
  const offsetHours = timezone === 'WIT' ? 9 : timezone === 'WITA' ? 8 : 7;
  const localDate = new Date(serverUtc.getTime() + offsetHours * 3600 * 1000);
  const hours = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  return {
    localDate,
    localTimeString: `${hours}:${minutes}`
  };
}

/**
 * Menentukan fase ritme yang sedang aktif saat ini.
 */
export function findActivePhase(
  localTimeString: string,
  phases: PhaseConfig[]
): PhaseConfig | undefined {
  if (!phases || !Array.isArray(phases) || phases.length === 0) {
    return undefined;
  }
  return phases.find(
    p => p.is_active && localTimeString >= p.start_time && localTimeString < p.end_time
  );
}

/**
 * Mengevaluasi mode briefing sirkadian (PRATINJAU / OPERASIONAL / PENUTUP).
 */
export function evaluateBriefingMode(
  currentTime: Date,
  schedule: SchoolRhythmConfig
): BriefingMode {
  if (!schedule) {
    return 'OPERASIONAL';
  }

  const { localTimeString } = resolveSchoolLocalTime(
    currentTime,
    schedule.school_timezone || 'WIB'
  );

  const openingTime = schedule.school_opening_time || '06:45';
  const closingTime = schedule.school_closing_time || '14:30';

  if (localTimeString < openingTime) {
    return 'PRATINJAU';
  }
  if (localTimeString > closingTime) {
    return 'PENUTUP';
  }
  return 'OPERASIONAL';
}

/**
 * Predikat tugas pending untuk evaluasi penutup hari.
 */
export interface PendingTaskPredicate {
  attendance?: boolean;
  attendance_incomplete?: boolean;
  drafts?: number;
  draft_observations?: number;
  messages?: number;
  unread_messages?: number;
  pending_lppa?: number;
}

/**
 * Mengevaluasi status emosional Closure Mode.
 * 
 * ATURAN KESELAMATAN:
 * - Jika safetyAlertsCount > 0 -> 'BYPASSED' (Safety override)
 * 
 * ATURAN PENUTUP:
 * - Jika 0 pending -> 'TUNTAS'
 * - Jika > 0 pending -> 'SISA_TENANG'
 */
export function evaluateClosureState(
  pendingTasks: PendingTaskPredicate,
  safetyAlertsCount: number
): ClosureState | 'BYPASSED' {
  if (safetyAlertsCount > 0) {
    return 'BYPASSED';
  }

  const hasIncompleteAttendance = Boolean(
    pendingTasks.attendance ?? pendingTasks.attendance_incomplete
  );
  const draftsCount = Number(pendingTasks.drafts ?? pendingTasks.draft_observations ?? 0);
  const messagesCount = Number(pendingTasks.messages ?? pendingTasks.unread_messages ?? 0);
  const lppaCount = Number(pendingTasks.pending_lppa ?? 0);

  const totalPending =
    (hasIncompleteAttendance ? 1 : 0) + draftsCount + messagesCount + lppaCount;

  if (totalPending === 0) {
    return 'TUNTAS';
  }

  return 'SISA_TENANG';
}

/**
 * Mengevaluasi apakah pesan ditahan sampai pagi (D-8 Hak Istirahat).
 */
export function evaluateMessageHolding(
  messageTimestamp: Date,
  schoolClosingTime: Date | string,
  isCriticalSafety: boolean,
  timezone: SchoolTimezone = 'WIB'
): MessageDeliveryPolicy {
  // Pengecualian Keselamatan Kritis (Bypass Mutlak via z-80 critical shield)
  if (isCriticalSafety) {
    return 'DELIVER_IMMEDIATELY';
  }

  if (typeof schoolClosingTime === 'string') {
    const { localTimeString } = resolveSchoolLocalTime(messageTimestamp, timezone);
    if (localTimeString > schoolClosingTime) {
      return 'HOLD_UNTIL_MORNING';
    }
    return 'DELIVER_IMMEDIATELY';
  }

  if (messageTimestamp.getTime() > schoolClosingTime.getTime()) {
    return 'HOLD_UNTIL_MORNING';
  }

  return 'DELIVER_IMMEDIATELY';
}

/**
 * Memvalidasi apakah audio harmonis 432Hz diizinkan berbunyi (D-7).
 */
export function canPlay432HzSound(
  context: SoundTriggerContext,
  hasUserGesture: boolean,
  preferenceEnabled: boolean
): boolean {
  if (!preferenceEnabled) {
    return false;
  }

  if (!hasUserGesture) {
    return false;
  }

  return (
    context === 'EARNED' ||
    context === 'TASK_COMPLETION_EARNED' ||
    context === 'INTENTIONAL' ||
    context === 'USER_TAP_INTENTIONAL'
  );
}
