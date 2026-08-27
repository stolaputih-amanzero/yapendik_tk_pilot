/**
 * Yapendik School OS — Stage 4.1 Classroom Pulse Banner (CC-02)
 * Tier 1: Real-time classroom attendance pulse & active exception banner
 * Decluttered & Mobile-First Clean Aesthetic
 */

import React from 'react';
import { ClassroomPulseData, ActiveTeacherContext } from '../../../types/teacherDailyTypes';
import { AlertTriangle, MessageSquare, CheckCircle2, HeartPulse, ShieldAlert } from 'lucide-react';

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

  const formattedDate = new Date(context.date).toLocaleDateString('id-ID', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 text-slate-900 shadow-xs mb-5">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left: Simplified Class Name & Date */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 sm:p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-center text-emerald-600 shrink-0">
            <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">
                {context.class_name}
              </h2>
              {context.is_semester_closed && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-rose-50 border border-rose-200 text-rose-700">
                  SEMESTER DITUTUP
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Right: Quick Pulse Stats & Action Buttons (Harmonized Grid / Inline) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {/* Attendance Stat Chip */}
          <div className="h-10 bg-slate-50 border border-slate-200 rounded-xl px-3.5 flex items-center justify-between sm:justify-start gap-3 text-slate-900 shrink-0">
            <div className="text-left sm:text-right">
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold leading-none">Kehadiran</div>
              <div className="text-xs sm:text-sm font-bold text-emerald-600 leading-tight mt-0.5">
                {pulse.present_count}/{pulse.total_students} <span className="text-[10px] text-slate-500 font-normal">({attendanceRate}%)</span>
              </div>
            </div>
            {pulse.unaccounted_count > 0 ? (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                {pulse.unaccounted_count} Belum
              </span>
            ) : (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" /> 100%
              </span>
            )}
          </div>

          {/* Action Buttons Group (Side-by-side on mobile, inline on desktop) */}
          <div className={`grid ${pulse.unread_guardian_notes > 0 && onOpenSafetyModal ? 'grid-cols-2' : 'grid-cols-1'} sm:flex items-center gap-2 w-full sm:w-auto`}>
            {/* Unread Parent Notes Chip */}
            {pulse.unread_guardian_notes > 0 && (
              <button
                type="button"
                onClick={onOpenGuardianNotices}
                className="h-10 bg-slate-50 border border-slate-200 hover:bg-slate-100 active:scale-[0.98] transition-all rounded-xl px-3 flex justify-center items-center gap-2 text-slate-700 text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer truncate"
              >
                <MessageSquare className="w-4 h-4 text-slate-600 shrink-0" />
                <span className="truncate">{pulse.unread_guardian_notes} Pesan Ortu</span>
              </button>
            )}

            {/* Safety / Attention Button */}
            {onOpenSafetyModal && (
              <button
                type="button"
                onClick={onOpenSafetyModal}
                className={`h-10 border active:scale-[0.98] transition-all rounded-xl px-3 flex justify-center items-center gap-2 text-xs sm:text-sm font-semibold shadow-2xs cursor-pointer truncate ${
                  activeIncidentsCount > 0
                    ? 'bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-700'
                }`}
              >
                <HeartPulse className={`w-4 h-4 shrink-0 ${activeIncidentsCount > 0 ? 'text-rose-600' : 'text-rose-500'}`} />
                <span className="truncate">{activeIncidentsCount > 0 ? `${activeIncidentsCount} Catatan Khusus` : 'Perhatian & Kesehatan'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Critical Health & Safety Exceptions Row */}
      {(() => {
        const validAlerts = pulse.health_alerts.filter(
          a => a.alert_type === 'FEVER' || (a.note && !['tidak ada', 'none', '-', 'tidak'].includes(a.note.replace(/^alergi:\s*/i, '').trim().toLowerCase()))
        );
        if (validAlerts.length === 0) return null;

        return (
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-start gap-2">
            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 shrink-0 sm:pt-2">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" /> Perhatian Pagi:
            </span>
            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1.5 w-full">
              {validAlerts.map((alert, idx) => (
                <button
                  key={`${alert.student_id}_${idx}`}
                  type="button"
                  onClick={() => onFilterExceptionStudent && onFilterExceptionStudent(alert.student_id)}
                  className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 px-3 py-2 rounded-xl text-xs bg-amber-50 border border-amber-200 text-amber-900 text-left hover:bg-amber-100 active:scale-[0.99] transition cursor-pointer w-full sm:w-auto"
                >
                  <div className="flex items-center gap-1.5">
                    <strong className="text-amber-950 font-bold">{alert.student_name}:</strong>
                    {alert.temperature && <span className="text-rose-600 font-bold">({alert.temperature}°C)</span>}
                  </div>
                  <span className="text-amber-900 leading-snug">{alert.note}</span>
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
