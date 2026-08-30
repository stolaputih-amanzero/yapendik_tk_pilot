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
