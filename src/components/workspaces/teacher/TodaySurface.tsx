/**
 * Yapendik School OS — Stage 4.1 Today Surface (Tab 1: Hari Ini)
 * Consolidates daily attendance grid, arrival moods, health exception alerts, and guardian notices ledger
 */

import React from 'react';
import { 
  StudentRosterItem, 
  GuardianNoticeItem, 
  ArrivalMood 
} from '../../../types/teacherDailyTypes';
import { AttendanceStatus } from '../../../domain/types';
import { AttendanceGrid } from './AttendanceGrid';
import { GuardianNoticeLedger } from './GuardianNoticeLedger';
import { DailyCompletionSummary } from './DailyCompletionSummary';

interface Props {
  roster: StudentRosterItem[];
  guardianNotices: GuardianNoticeItem[];
  isAttendanceComplete: boolean;
  pendingEnrichmentCount: number;
  unacknowledgedNoticeCount: number;
  isAllClear: boolean;
  onUpdateAttendanceBatch: (updates: { studentId: string; status: AttendanceStatus; mood?: ArrivalMood; temp?: number; note?: string }[]) => void;
  onOpenChildPivot: (studentId: string) => void;
  onQuickCaptureForChild: (studentId: string) => void;
  onAcknowledgeNotice: (noticeId: string, replyText?: string) => Promise<void>;
  onSendNewNotice: (notice: { studentId?: string; type: any; title: string; content: string }) => void;
  onOpenEnrichmentQueue: () => void;
}

export const TodaySurface: React.FC<Props> = ({
  roster,
  guardianNotices,
  isAttendanceComplete,
  pendingEnrichmentCount,
  unacknowledgedNoticeCount,
  isAllClear,
  onUpdateAttendanceBatch,
  onOpenChildPivot,
  onQuickCaptureForChild,
  onAcknowledgeNotice,
  onSendNewNotice,
  onOpenEnrichmentQueue
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* 1. Daily Completion Summary Status */}
      <DailyCompletionSummary
        isAttendanceComplete={isAttendanceComplete}
        pendingEnrichmentCount={pendingEnrichmentCount}
        unacknowledgedNoticeCount={unacknowledgedNoticeCount}
        isAllClear={isAllClear}
        onOpenEnrichmentQueue={onOpenEnrichmentQueue}
      />

      {/* 2. Attendance & Health Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Presensi & Kondisi Kedatangan Ananda
            </h3>
            <p className="text-xs text-slate-600 font-medium mt-0.5">
              Sentuh 1-ketuk untuk mengubah status. Rekam suhu & mood pagi.
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

      {/* 3. Guardian Communication Ledger */}
      <section className="pt-6 border-t border-slate-300">
        <GuardianNoticeLedger
          notices={guardianNotices}
          onAcknowledgeNotice={onAcknowledgeNotice}
          onSendNewNotice={onSendNewNotice}
        />
      </section>
    </div>
  );
};
