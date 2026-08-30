/**
 * Yapendik School OS — Stage 4.1 Attendance Grid (CC-04 Container)
 * Container for fast attendance marking with bulk actions and status filters (Amanaura Design System v1.0)
 */

import React, { useState } from 'react';
import { StudentRosterItem, ArrivalMood } from '../../../types/teacherDailyTypes';
import { AttendanceStatus } from '../../../domain/types';
import { ChildCard } from './ChildCard';
import { Button } from '../../ui';
import { 
  CheckCheck, 
  Search, 
  Users, 
  AlertTriangle 
} from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'UNACCOUNTED' | 'HADIR' | 'ATTENTION'>('ALL');

  // Filter students based on search and selected filter chip
  const filteredStudents = roster.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.nis.includes(searchQuery);

    if (!matchesSearch) return false;

    if (statusFilter === 'UNACCOUNTED') return !student.today_status;
    if (statusFilter === 'HADIR') return student.today_status === 'HADIR';
    if (statusFilter === 'ATTENTION') return student.today_status === 'SAKIT' || Boolean(student.allergies);
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

  const handleMarkAllPresent = () => {
    const updates = roster.map(s => ({
      studentId: s.student_id,
      status: (s.today_status || 'HADIR') as AttendanceStatus,
      mood: s.today_mood || 'CERIA'
    }));
    onUpdateBatch(updates);
  };
  const unaccountedCount = roster.filter(s => !s.today_status).length;

  return (
    <div className="space-y-4">
      {/* Top Toolbar: Search, Filters & Bulk Actions (Flat Fluid single-depth) */}
      <div className="space-y-2.5">
        {/* Row 1: Search Input (flex-1) + Quick Bulk Action (sejajar) */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Cari nama ananda / NIS..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface border border-line focus:outline-none focus:ring-1 focus:ring-brand-primary text-ink placeholder:text-ink-faint font-medium transition-all shadow-hairline"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleMarkAllPresent}
            leftIcon={<CheckCheck className="w-3.5 h-3.5" />}
            className="shrink-0 text-xs font-semibold rounded-xl cursor-pointer whitespace-nowrap px-3 py-2"
            title="Tandai Semua Hadir Sekaligus"
          >
            <span className="hidden compact:inline">Tandai </span>Semua Hadir
          </Button>
        </div>

        {/* Row 2: Flat Fluid Filter Chips Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar select-none">
          <button
            type="button"
            onClick={() => setStatusFilter('ALL')}
            className={`
              px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap
              ${statusFilter === 'ALL'
                ? 'bg-ink text-on-brand font-bold shadow-hairline'
                : 'bg-surface text-ink-soft border border-line hover-only:text-ink hover-only:bg-surface-subtle'
              }
            `.trim()}
          >
            Semua ({roster.length})
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('UNACCOUNTED')}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap
              ${statusFilter === 'UNACCOUNTED'
                ? 'bg-brand-primary text-on-brand font-bold shadow-hairline'
                : 'bg-surface text-ink-soft border border-line hover-only:text-ink hover-only:bg-surface-subtle'
              }
            `.trim()}
          >
            <span>Belum Diisi</span>
            {unaccountedCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${statusFilter === 'UNACCOUNTED' ? 'bg-surface text-ink' : 'bg-warning text-on-brand'}`}>
                {unaccountedCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setStatusFilter('ATTENTION')}
            className={`
              flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer whitespace-nowrap
              ${statusFilter === 'ATTENTION'
                ? 'bg-danger text-on-brand font-bold shadow-hairline'
                : 'bg-surface text-danger-deep border border-danger-line hover-only:bg-danger-tint'
              }
            `.trim()}
          >
            <AlertTriangle className="w-3 h-3 text-danger shrink-0" />
            <span>Perhatian</span>
          </button>
        </div>
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
