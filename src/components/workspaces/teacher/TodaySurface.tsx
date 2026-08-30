/**
 * Yapendik School OS — Stage 4.1 Today Surface (Tab 1: Hari Ini)
 * Consolidates daily attendance grid, arrival moods, health exception alerts, and guardian notices ledger
 */

import React from 'react';
import { 
  StudentRosterItem, 
  GuardianNoticeItem, 
  ArrivalMood,
  ClassroomPulseData 
} from '../../../types/teacherDailyTypes';
import { AttendanceStatus } from '../../../domain/types';
import { AttendanceGrid } from './AttendanceGrid';
import { AlertTriangle, ChevronRight } from 'lucide-react';

interface Props {
  roster: StudentRosterItem[];
  onUpdateAttendanceBatch: (updates: { studentId: string; status: AttendanceStatus; mood?: ArrivalMood; temp?: number; note?: string }[]) => void;
  onOpenChildPivot: (studentId: string) => void;
  onQuickCaptureForChild: (studentId: string) => void;
  pulse?: ClassroomPulseData;
  hasSafetyExceptions?: boolean;
  onOpenPulseModal?: () => void;
}

export const TodaySurface: React.FC<Props> = ({
  roster,
  onUpdateAttendanceBatch,
  onOpenChildPivot,
  onQuickCaptureForChild,
  pulse,
  hasSafetyExceptions,
  onOpenPulseModal
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 2. Attendance & Health Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-ink">
              Presensi Harian
            </h3>
            <p className="text-xs text-ink-soft font-medium mt-0.5 hidden medium:block">
              Sentuh 1-ketuk untuk mengubah status. Rekam suhu &amp; mood pagi.
            </p>
          </div>

          {/* Mobile Sleek Integrated Status Capsule */}
          {pulse && onOpenPulseModal && (
            <button
              type="button"
              onClick={onOpenPulseModal}
              className="large:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface border border-line hover-only:border-brand-primary text-xs cursor-pointer active:scale-95 transition shadow-hairline text-ink"
              aria-label="Lihat ringkasan kehadiran dan status kelas"
            >
              <span className="w-2 h-2 rounded-full bg-success shrink-0" />
              <span className="font-mono font-bold text-success-deep text-xs">
                {pulse.present_count}/{pulse.total_students}
              </span>
              {hasSafetyExceptions && (
                <span className="ml-1 px-1.5 py-0.5 rounded-full bg-danger-tint text-danger-deep font-bold text-[10px] flex items-center gap-0.5 border border-danger-line">
                  <AlertTriangle className="w-2.5 h-2.5 text-danger shrink-0" />
                  <span>Medis</span>
                </span>
              )}
              <ChevronRight className="w-3.5 h-3.5 text-ink-faint shrink-0" />
            </button>
          )}
        </div>

        <AttendanceGrid
          roster={roster}
          onUpdateBatch={onUpdateAttendanceBatch}
          onOpenChildPivot={onOpenChildPivot}
          onQuickCaptureForChild={onQuickCaptureForChild}
        />
      </section>
    </div>
  );
};
