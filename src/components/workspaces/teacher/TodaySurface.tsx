import React from 'react';
import { StudentRosterItem } from '../../../types/teacherDailyTypes';
import { TeacherCircadianTimeline } from './TeacherCircadianTimeline';
import { WorkspaceTab } from '../../layout/TopBar';

interface Props {
  roster: StudentRosterItem[];
  onNavigateTab?: (tab: WorkspaceTab) => void;
  onOpenQuickCapture?: () => void;
  onUpdateAttendanceBatch?: (updates: any[]) => void;
  onOpenChildPivot?: (studentId: string) => void;
  onQuickCaptureForChild?: (studentId: string) => void;
  pulse?: any;
  hasSafetyExceptions?: boolean;
  onOpenPulseModal?: () => void;
}

export const TodaySurface: React.FC<Props> = ({
  roster,
  onNavigateTab,
  onOpenQuickCapture
}) => {
  const hadirCount = roster.filter(s => s.today_status === 'HADIR').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Jadwal Kegiatan Harian PAUD (Clean Vertical Timeline) */}
      {onNavigateTab && (
        <TeacherCircadianTimeline
          onNavigateTab={onNavigateTab}
          onOpenQuickCapture={onOpenQuickCapture}
          attendanceCount={{ present: hadirCount, total: roster.length }}
        />
      )}
    </div>
  );
};
