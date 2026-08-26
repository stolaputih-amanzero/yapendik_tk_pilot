/**
 * Yapendik School OS — Stage 4.1 Attendance Grid (CC-04 Container)
 * Container for fast attendance marking with bulk actions and status filters
 */

import React, { useState } from 'react';
import { StudentRosterItem, ArrivalMood } from '../../../types/teacherDailyTypes';
import { AttendanceStatus } from '../../../domain/types';
import { ChildCard } from './ChildCard';
import { 
  CheckCheck, 
  Search, 
  Filter, 
  Users, 
  AlertTriangle,
  Sparkles
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
      {/* Top Toolbar: Search, Filters & Bulk Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama ananda / NIS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-500 font-medium"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
            }`}
          >
            Semua ({roster.length})
          </button>

          <button
            onClick={() => setStatusFilter('UNACCOUNTED')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'UNACCOUNTED'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            <span>Belum Diisi</span>
            {unaccountedCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {unaccountedCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('ATTENTION')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              statusFilter === 'ATTENTION'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-rose-50 text-rose-900 border border-rose-300 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Perhatian</span>
          </button>
        </div>

        {/* Quick Bulk Action Button */}
        <button
          onClick={handleMarkAllPresent}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <CheckCheck className="w-4 h-4" />
          <span>Tandai Semua Hadir</span>
        </button>
      </div>

      {/* Children Cards Grid (1 to 16 cards) */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-10 text-center">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Tidak ada ananda yang sesuai filter</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau ganti filter chip.</p>
        </div>
      )}
    </div>
  );
};
