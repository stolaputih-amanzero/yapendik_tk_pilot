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
      <div className="flex flex-col expanded:flex-row items-stretch expanded:items-center justify-between gap-2.5 medium:gap-3 bg-surface p-3 medium:p-4 rounded-2xl shadow-hairline border border-line">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Cari nama ananda / NIS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-subtle border border-line-hairline focus:outline-none focus:ring-1 focus:ring-brand-primary text-ink placeholder:text-ink-faint font-medium transition-all"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 medium:pb-0 scrollbar-hide min-w-0">
          <Button
            variant={statusFilter === 'ALL' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('ALL')}
            className="rounded-xl"
          >
            Semua ({roster.length})
          </Button>

          <Button
            variant={statusFilter === 'UNACCOUNTED' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('UNACCOUNTED')}
            rightIcon={
              unaccountedCount > 0 ? (
                <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold bg-warning text-on-brand">
                  {unaccountedCount}
                </span>
              ) : undefined
            }
            className="rounded-xl"
          >
            Belum Diisi
          </Button>

          <Button
            variant={statusFilter === 'ATTENTION' ? 'danger' : 'secondary'}
            size="sm"
            onClick={() => setStatusFilter('ATTENTION')}
            leftIcon={<AlertTriangle className="w-4 h-4 text-warning" />}
            className="rounded-xl"
          >
            Perhatian
          </Button>
        </div>

        {/* Quick Bulk Action Button */}
        <div className="shrink-0 flex items-center">
          <Button
            variant="primary"
            size="sm"
            onClick={handleMarkAllPresent}
            leftIcon={<CheckCheck className="w-4 h-4" />}
            className="w-full expanded:w-auto text-xs font-semibold rounded-xl cursor-pointer"
          >
            Tandai Semua Hadir
          </Button>
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
