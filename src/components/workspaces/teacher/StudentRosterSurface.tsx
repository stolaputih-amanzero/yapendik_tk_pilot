/**
 * Yapendik School OS — Stage 4.1 Student Roster Surface (Tab 3: Siswa & Rapor)
 * Class roster with longitudinal evidence counts, LPPA readiness metrics, and One Child Context pivots
 */

import React, { useState } from 'react';
import { StudentRosterItem } from '../../../types/teacherDailyTypes';
import { AvatarChild, Button, Badge } from '../../ui';
import { 
  Search, 
  Award, 
  FolderOpen, 
  Sparkles, 
  ChevronRight, 
  Camera
} from 'lucide-react';

interface Props {
  roster: StudentRosterItem[];
  onOpenChildPivot: (studentId: string) => void;
  onQuickCaptureForChild: (studentId: string) => void;
  onOpenLppaStudio?: (studentId: string) => void;
  onOpenContinuityModal?: (studentId: string) => void;
}

export const StudentRosterSurface: React.FC<Props> = ({
  roster,
  onOpenChildPivot,
  onQuickCaptureForChild,
  onOpenLppaStudio,
  onOpenContinuityModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = roster.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.nis.includes(searchQuery)
  );

  return (
    <div className="space-y-5 animate-in fade-in duration-200">
      {/* Search & Header */}
      <div className="bg-white md:rounded-2xl border-y md:border border-x-0 border-slate-200 p-4 sm:p-5 md:shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mx-4 md:mx-0 mb-2 md:mb-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">Roster & Rekam Jejak Perkembangan Siswa</h3>
            <Badge variant="lppa">
              {roster.length} Peserta Didik
            </Badge>
          </div>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Pusat sintesis rapor LPPA, busur kontinuitas multi-semester, dan portofolio bukti otentik per anak.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Cari nama atau NIS..."
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white text-slate-900 placeholder:text-slate-400 transition-all"
          />
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2 md:gap-4">
        {filtered.map(student => {
          const isLppaReady = student.lppa_ready_percentage >= 75;

          return (
            <div
              key={student.student_id}
              className="bg-white md:rounded-2xl border-y md:border border-x-0 border-slate-200 p-4 sm:p-5 shadow-xs hover:border-slate-300 transition-all duration-150 flex flex-col justify-between gap-4 -mx-4 md:mx-0"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <AvatarChild
                      name={student.name}
                      id={student.student_id}
                      size="md"
                      showSymbol
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-bold text-slate-900 leading-snug truncate">{student.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono font-semibold">NIS: {student.nis}</p>
                    </div>
                  </div>

                  <Button
                    variant="icon"
                    size="sm"
                    onClick={() => onQuickCaptureForChild(student.student_id)}
                    title="Catat Momen untuk Anak Ini"
                    className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                  >
                    <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
                  </Button>
                </div>

                {/* Progress Indicators */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-semibold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-indigo-600" /> Kesiapan LPPA:
                    </span>
                    <strong className="text-slate-900 font-bold">{student.lppa_ready_percentage}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLppaReady ? 'bg-emerald-500' : 'bg-slate-900'
                      }`}
                      style={{ width: `${student.lppa_ready_percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>{student.evidence_count_semester} Bukti Tersimpan</span>
                    <span className={`font-bold ${isLppaReady ? 'text-emerald-700' : 'text-slate-700'}`}>
                      {isLppaReady ? 'Siap Rapor' : 'Perlu Bukti'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: LPPA Studio, Continuity & One Child Pivot */}
              <div className="space-y-1.5 pt-2 border-t border-slate-50">
                {onOpenLppaStudio && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onOpenLppaStudio(student.student_id)}
                    className="w-full shadow-xs justify-start"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" />
                        <span>Susun Rapor LPPA</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-75" />
                    </div>
                  </Button>
                )}

                {onOpenContinuityModal && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onOpenContinuityModal(student.student_id)}
                    className="w-full text-xs"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-1.5">
                        <span>🌱 Busur Kontinuitas & Rencana</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                    </div>
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenChildPivot(student.student_id)}
                  className="w-full text-xs text-slate-700 hover:text-slate-900 border border-slate-200/60"
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1.5">
                      <FolderOpen className="w-3.5 h-3.5 text-slate-600" />
                      <span>Buka Rekam Jejak (One Child)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                  </div>
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
