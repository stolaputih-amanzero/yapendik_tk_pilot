/**
 * Yapendik School OS — Stage 4.1 Classroom Pulse Banner (CC-02)
 * Tier 1: Real-time classroom attendance pulse & active exception banner
 */

import React from 'react';
import { ClassroomPulseData, ActiveTeacherContext } from '../../../types/teacherDailyTypes';
import { Users, AlertTriangle, MessageSquare, CheckCircle2, HeartPulse, ShieldAlert } from 'lucide-react';

interface Props {
  context: ActiveTeacherContext;
  pulse: ClassroomPulseData;
  onFilterExceptionStudent?: (studentId: string) => void;
  onOpenGuardianNotices?: () => void;
  onOpenSafetyModal?: () => void;
  activeIncidentsCount?: number;
}

export const ClassroomPulseBanner: React.FC<Props> = ({
  context,
  pulse,
  onFilterExceptionStudent,
  onOpenGuardianNotices,
  onOpenSafetyModal,
  activeIncidentsCount = 0
}) => {
  const attendanceRate = pulse.total_students > 0
    ? Math.round((pulse.present_count / pulse.total_students) * 100)
    : 0;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-5 text-white shadow-xl mb-6 backdrop-blur-md">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Class Context & Pulse Counter */}
        <div className="flex items-start gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-center text-emerald-400 shadow-inner">
            <HeartPulse className="w-8 h-8 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">{context.class_name}</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
                {context.academic_year_name} ({context.semester})
              </span>
              {context.is_semester_closed && (
                <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300">
                  SEMESTER CLOSED
                </span>
              )}
            </div>
            <p className="text-sm text-slate-300 mt-1 flex items-center gap-2">
              <span>Pendidik: <strong className="text-white font-medium">{context.teacher.name}</strong> ({context.teacher.role})</span>
              <span className="text-slate-500">•</span>
              <span>{new Date(context.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </p>
          </div>
        </div>

        {/* Right: Quick Pulse Stats & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Attendance Stat Chip */}
          <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <div className="text-right">
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Kehadiran Hari Ini</div>
              <div className="text-base font-bold text-emerald-400">
                {pulse.present_count} / {pulse.total_students} <span className="text-xs text-slate-400 font-normal">({attendanceRate}%)</span>
              </div>
            </div>
            {pulse.unaccounted_count > 0 ? (
              <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                {pulse.unaccounted_count} Belum
              </span>
            ) : (
              <span className="px-2 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> 100% Lengkap
              </span>
            )}
          </div>

          {/* Unread Parent Notes Chip */}
          {pulse.unread_guardian_notes > 0 && (
            <button
              onClick={onOpenGuardianNotices}
              className="bg-sky-950/70 border border-sky-600/40 hover:bg-sky-900/60 transition-all rounded-xl px-3.5 py-2.5 flex items-center gap-2.5 text-sky-200 text-sm font-medium shadow-md cursor-pointer"
            >
              <MessageSquare className="w-4 h-4 text-sky-400" />
              <span>{pulse.unread_guardian_notes} Pesan Ortu</span>
            </button>
          )}

          {/* Stage 4.4-C: Safety & Incident Fast Capture Button */}
          {onOpenSafetyModal && (
            <button
              onClick={onOpenSafetyModal}
              className={`border transition-all rounded-xl px-3.5 py-2.5 flex items-center gap-2 text-sm font-bold shadow-md cursor-pointer ${
                activeIncidentsCount > 0
                  ? 'bg-rose-950/80 border-rose-500/50 text-rose-300 hover:bg-rose-900 animate-pulse'
                  : 'bg-amber-950/70 border-amber-600/40 hover:bg-amber-900/60 text-amber-300'
              }`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>{activeIncidentsCount > 0 ? `${activeIncidentsCount} Insiden Aktif` : '🚨 Keselamatan Rombel'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Critical Health & Safety Exceptions Row */}
      {(() => {
        const validAlerts = pulse.health_alerts.filter(
          a => a.alert_type === 'FEVER' || (a.note && !['tidak ada', 'none', '-', 'tidak'].includes(a.note.replace(/^alergi:\s*/i, '').trim().toLowerCase()))
        );
        if (validAlerts.length === 0) return null;

        return (
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5 mr-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Perhatian Pagi:
            </span>
            {validAlerts.map((alert, idx) => (
              <button
                key={`${alert.student_id}_${idx}`}
                onClick={() => onFilterExceptionStudent && onFilterExceptionStudent(alert.student_id)}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-amber-500/15 border border-amber-500/30 text-amber-200 hover:bg-amber-500/25 transition cursor-pointer"
              >
                <strong className="text-amber-100">{alert.student_name}:</strong> {alert.note}
                {alert.temperature && <span className="ml-1 text-rose-300 font-bold">({alert.temperature}°C)</span>}
              </button>
            ))}
          </div>
        );
      })()}
    </div>
  );
};
