/**
 * Yapendik School OS — Stage 4.1 Student Roster Surface (Tab 3: Siswa & Rapor)
 * Class roster with longitudinal evidence counts, LPPA readiness metrics, and One Child Context pivots
 */

import React, { useState } from 'react';
import { StudentRosterItem } from '../../../types/teacherDailyTypes';
import { 
  Users, 
  Search, 
  Award, 
  FolderOpen, 
  Sparkles, 
  AlertCircle, 
  ChevronRight, 
  CheckCircle2,
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
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Search & Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-black text-slate-900">Roster & Rekam Jejak Perkembangan Siswa</h3>
            <span className="px-2.5 py-0.5 text-xs font-black rounded-lg bg-purple-100 text-purple-900 border border-purple-200">
              {roster.length} Peserta Didik
            </span>
          </div>
          <p className="text-xs text-slate-600 font-medium mt-1">
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
            className="w-full pl-9 pr-4 py-2 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(student => {
          const isLppaReady = student.lppa_ready_percentage >= 75;

          return (
            <div
              key={student.student_id}
              className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
            >
              <div>
                {/* Header Profile */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-sm font-black text-indigo-700 shadow-xs">
                      {student.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 leading-snug">{student.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">NIS: {student.nis}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => onQuickCaptureForChild(student.student_id)}
                    title="Catat Momen untuk Anak Ini"
                    className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-semibold flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-purple-600" /> Kesiapan LPPA:
                    </span>
                    <strong className="text-slate-900 font-black">{student.lppa_ready_percentage}%</strong>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLppaReady ? 'bg-emerald-500' : 'bg-purple-600'
                      }`}
                      style={{ width: `${student.lppa_ready_percentage}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium">
                    <span>{student.evidence_count_semester} Bukti Tersimpan</span>
                    <span className="font-bold text-slate-700">{isLppaReady ? 'Siap Rapor' : 'Perlu Bukti'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons: LPPA Studio, Continuity & One Child Pivot */}
              <div className="space-y-1.5">
                {onOpenLppaStudio && (
                  <button
                    onClick={() => onOpenLppaStudio(student.student_id)}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-purple-600/20"
                  >
                    <Award className="w-3.5 h-3.5 text-purple-200" />
                    <span>📝 Susun Rapor LPPA</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-75 ml-auto" />
                  </button>
                )}

                {onOpenContinuityModal && (
                  <button
                    onClick={() => onOpenContinuityModal(student.student_id)}
                    className="w-full py-1.5 px-3 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-indigo-200"
                  >
                    <span>🌱 Busur Kontinuitas & Rencana</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenChildPivot(student.student_id)}
                  className="w-full py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Buka Rekam Jejak (One Child)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
