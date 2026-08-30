/**
 * Yapendik School OS — Stage 4.1 Attendance Grid (CC-04 Container)
 * Container for fast attendance marking with bulk actions and status filters (Amanaura Design System v1.0)
 */

import React, { useState } from 'react';
import { StudentRosterItem, ArrivalMood } from '../../../types/teacherDailyTypes';
import { AttendanceStatus } from '../../../domain/types';
import { ChildCard } from './ChildCard';
import { Users } from 'lucide-react';

interface Props {
  roster: StudentRosterItem[];
  onUpdateBatch: (updates: { studentId: string; status: AttendanceStatus; mood?: ArrivalMood; temp?: number; note?: string }[]) => void;
  onOpenChildPivot: (studentId: string) => void;
  onQuickCaptureForChild: (studentId: string) => void;
}

export const AttendanceGrid: React.FC<Props> = ({
  roster,
  onUpdateBatch,
  onOpenChildPivot,
  onQuickCaptureForChild
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'HADIR' | 'SAKIT' | 'IZIN' | 'ALPA'>('ALL');

  // Compute live counts
  const totalStudents = roster.length;
  const recordedCount = roster.filter(s => !!s.today_status).length;
  const hadirCount = roster.filter(s => s.today_status === 'HADIR').length;
  const sakitCount = roster.filter(s => s.today_status === 'SAKIT').length;
  const izinCount = roster.filter(s => s.today_status === 'IZIN').length;
  const alpaCount = roster.filter(s => s.today_status === 'ALPA').length;

  // Filter students based on selected metric filter
  const filteredStudents = roster.filter(student => {
    if (statusFilter === 'HADIR') return student.today_status === 'HADIR';
    if (statusFilter === 'SAKIT') return student.today_status === 'SAKIT';
    if (statusFilter === 'IZIN') return student.today_status === 'IZIN';
    if (statusFilter === 'ALPA') return student.today_status === 'ALPA';
    return true;
  });

  const handleSingleStatusChange = (studentId: string, status: AttendanceStatus) => {
    onUpdateBatch([{ studentId, status }]);
  };

  const handleSingleMoodChange = (studentId: string, mood: ArrivalMood) => {
    onUpdateBatch([{ studentId, status: roster.find(r => r.student_id === studentId)?.today_status || 'HADIR', mood }]);
  };

  const handleSingleTempChange = (studentId: string, temp: number | undefined) => {
    onUpdateBatch([{ studentId, status: roster.find(r => r.student_id === studentId)?.today_status || 'HADIR', temp }]);
  };

  const handleSingleNoteChange = (studentId: string, note: string) => {
    onUpdateBatch([{ studentId, status: roster.find(r => r.student_id === studentId)?.today_status || 'HADIR', note }]);
  };

  return (
    <div className="space-y-4">
      {/* 5 Clickable Metric Cards as Interactive Filters (Unified with Attendance Workspace) */}
      <div className="grid grid-cols-5 gap-1.5 medium:gap-2">
        {/* 1. Total (Recorded / Total) */}
        <button
          type="button"
          onClick={() => setStatusFilter('ALL')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer select-none active:scale-95 min-h-[46px] ${
            statusFilter === 'ALL'
              ? 'bg-surface-subtle border-brand-primary text-ink ring-1 ring-brand-primary/50 shadow-hairline'
              : 'bg-surface border-line text-ink hover-only:border-line-strong hover-only:bg-surface-subtle'
          }`}
          title="Tampilkan Semua Ananda"
          aria-pressed={statusFilter === 'ALL'}
        >
          <span className="font-mono tabular-nums font-bold text-xs medium:text-sm text-ink leading-tight">
            {recordedCount}/{totalStudents}
          </span>
          <span className="text-[10px] medium:text-[11px] font-medium text-ink-soft leading-tight mt-0.5 whitespace-nowrap">
            Total
          </span>
        </button>

        {/* 2. Hadir */}
        <button
          type="button"
          onClick={() => setStatusFilter(prev => prev === 'HADIR' ? 'ALL' : 'HADIR')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer select-none active:scale-95 min-h-[46px] ${
            statusFilter === 'HADIR'
              ? 'bg-success-tint border-success text-success-deep ring-1 ring-success/50 shadow-hairline'
              : 'bg-success-tint/30 border-success-line/60 text-success-deep hover-only:bg-success-tint/60'
          }`}
          title="Filter Ananda Hadir"
          aria-pressed={statusFilter === 'HADIR'}
        >
          <span className="font-mono tabular-nums font-bold text-xs medium:text-sm text-success-deep leading-tight">
            {hadirCount}
          </span>
          <span className="text-[10px] medium:text-[11px] font-semibold text-success-deep leading-tight mt-0.5 whitespace-nowrap">
            Hadir
          </span>
        </button>

        {/* 3. Sakit */}
        <button
          type="button"
          onClick={() => setStatusFilter(prev => prev === 'SAKIT' ? 'ALL' : 'SAKIT')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer select-none active:scale-95 min-h-[46px] ${
            statusFilter === 'SAKIT'
              ? 'bg-warning-tint border-warning text-warning-deep ring-1 ring-warning/50 shadow-hairline'
              : sakitCount > 0
                ? 'bg-warning-tint/30 border-warning-line/60 text-warning-deep hover-only:bg-warning-tint/60'
                : 'bg-surface border-line text-ink hover-only:border-line-strong hover-only:bg-surface-subtle'
          }`}
          title="Filter Ananda Sakit"
          aria-pressed={statusFilter === 'SAKIT'}
        >
          <span className={`font-mono tabular-nums font-bold text-xs medium:text-sm leading-tight ${sakitCount > 0 ? 'text-warning-deep' : 'text-ink'}`}>
            {sakitCount}
          </span>
          <span className={`text-[10px] medium:text-[11px] leading-tight mt-0.5 whitespace-nowrap ${sakitCount > 0 ? 'font-semibold text-warning-deep' : 'font-medium text-ink-soft'}`}>
            Sakit
          </span>
        </button>

        {/* 4. Izin */}
        <button
          type="button"
          onClick={() => setStatusFilter(prev => prev === 'IZIN' ? 'ALL' : 'IZIN')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer select-none active:scale-95 min-h-[46px] ${
            statusFilter === 'IZIN'
              ? 'bg-info-tint border-info text-info-deep ring-1 ring-info/50 shadow-hairline'
              : izinCount > 0
                ? 'bg-info-tint/30 border-info-line/60 text-info-deep hover-only:bg-info-tint/60'
                : 'bg-surface border-line text-ink hover-only:border-line-strong hover-only:bg-surface-subtle'
          }`}
          title="Filter Ananda Izin"
          aria-pressed={statusFilter === 'IZIN'}
        >
          <span className={`font-mono tabular-nums font-bold text-xs medium:text-sm leading-tight ${izinCount > 0 ? 'text-info-deep' : 'text-ink'}`}>
            {izinCount}
          </span>
          <span className={`text-[10px] medium:text-[11px] leading-tight mt-0.5 whitespace-nowrap ${izinCount > 0 ? 'font-semibold text-info-deep' : 'font-medium text-ink-soft'}`}>
            Izin
          </span>
        </button>

        {/* 5. Alpa */}
        <button
          type="button"
          onClick={() => setStatusFilter(prev => prev === 'ALPA' ? 'ALL' : 'ALPA')}
          className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl border text-center transition-all cursor-pointer select-none active:scale-95 min-h-[46px] ${
            statusFilter === 'ALPA'
              ? 'bg-danger-tint border-danger text-danger-deep ring-1 ring-danger/50 shadow-hairline'
              : alpaCount > 0
                ? 'bg-danger-tint/30 border-danger-line/60 text-danger-deep hover-only:bg-danger-tint/60'
                : 'bg-surface border-line text-ink hover-only:border-line-strong hover-only:bg-surface-subtle'
          }`}
          title="Filter Ananda Alpa"
          aria-pressed={statusFilter === 'ALPA'}
        >
          <span className={`font-mono tabular-nums font-bold text-xs medium:text-sm leading-tight ${alpaCount > 0 ? 'text-danger-deep' : 'text-ink'}`}>
            {alpaCount}
          </span>
          <span className={`text-[10px] medium:text-[11px] leading-tight mt-0.5 whitespace-nowrap ${alpaCount > 0 ? 'font-semibold text-danger-deep' : 'font-medium text-ink-soft'}`}>
            Alpa
          </span>
        </button>
      </div>

      {/* Children Cards Grid (1 to 16 cards) */}
      {filteredStudents.length > 0 ? (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(320px,1fr))]">
          {filteredStudents.map((student) => (
            <ChildCard
              key={student.student_id}
              student={student}
              onStatusChange={status => handleSingleStatusChange(student.student_id, status)}
              onMoodChange={mood => handleSingleMoodChange(student.student_id, mood)}
              onTempChange={temp => handleSingleTempChange(student.student_id, temp)}
              onArrivalNoteChange={note => handleSingleNoteChange(student.student_id, note)}
              onOpenChildPivot={() => onOpenChildPivot(student.student_id)}
              onQuickCaptureForChild={() => onQuickCaptureForChild(student.student_id)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-surface rounded-2xl p-10 text-center shadow-hairline">
          <Users className="w-10 h-10 text-ink-faint mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-ink-soft">Tidak ada ananda yang sesuai filter</h4>
          <p className="text-xs text-ink-soft mt-1">Coba sesuaikan kata kunci pencarian atau ganti filter chip.</p>
        </div>
      )}
    </div>
  );
};
