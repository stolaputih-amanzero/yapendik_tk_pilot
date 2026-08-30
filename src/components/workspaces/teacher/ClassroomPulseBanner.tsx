/**
 * Yapendik School OS — Stage 4.1 Classroom Pulse Banner (CC-02)
 * Tier 1: Real-time classroom attendance pulse & active exception banner
 * ADR-UX-010 Flat Fluid Doctrine (Fluid Anchors: Surface Material, Separator Divide, Typographic Anchors)
 */

import React from 'react';
import { ClassroomPulseData, ActiveTeacherContext } from '../../../types/teacherDailyTypes';
import { AlertTriangle, MessageSquare, HeartPulse } from 'lucide-react';
import { Badge } from '../../ui';

interface Props {
  context: ActiveTeacherContext;
  pulse: ClassroomPulseData;
  onFilterExceptionStudent?: (studentId: string) => void;
  onOpenGuardianNotices?: () => void;
  onOpenSafetyModal?: () => void;
  activeIncidentsCount?: number;
}

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

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

  const validAlerts = pulse.health_alerts.filter(
    a => a.alert_type === 'FEVER' || (a.note && !['tidak ada', 'none', '-', 'tidak'].includes(a.note.replace(/^alergi:\s*/i, '').trim().toLowerCase()))
  );

  return (
    <section className="space-y-4 mb-6">
      {/* 1. Status Semester Khusus */}
      {context.is_semester_closed && (
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="danger" dot>
            SEMESTER DITUTUP
          </Badge>
        </div>
      )}

      {/* 2. Strip Kehadiran (Anchor 1: bg-surface Panel on Canvas) */}
      <div className="bg-surface rounded-2xl p-4 medium:p-5 flex items-center justify-between text-ink w-full shadow-hairline border border-line">
        <div>
          <div className="text-[11px] text-ink-soft font-semibold leading-none">
            Kehadiran Hari Ini
          </div>
          <div className="text-base medium:text-lg font-bold text-success-deep leading-tight mt-1.5 font-mono whitespace-nowrap">
            {pulse.present_count}/{pulse.total_students} <span className="text-xs text-ink-soft font-normal">({attendanceRate}%)</span>
          </div>
        </div>

        {pulse.unaccounted_count > 0 ? (
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-warning-tint text-warning-deep text-xs font-mono font-bold shadow-hairline">
            <span className="w-2 h-2 rounded-full bg-warning" />
            <span>{pulse.unaccounted_count} Belum</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-success-tint text-success-deep text-xs font-mono font-bold shadow-hairline">
            <span className="w-2 h-2 rounded-full bg-success" />
            <span>100%</span>
          </span>
        )}
      </div>

      {/* 3. Bar Aksi (Anchor 1: bg-surface White Buttons min-h-[56px] on Gray Canvas) */}
      <div className="flex flex-col gap-2.5 w-full">
        {pulse.unread_guardian_notes > 0 && (
          <button
            type="button"
            onClick={onOpenGuardianNotices}
            className="w-full bg-surface rounded-2xl min-h-[56px] px-4 flex items-center justify-center gap-2.5 text-xs medium:text-sm font-semibold text-ink active:scale-[0.99] transition cursor-pointer hover-only:bg-surface-subtle shadow-hairline"
          >
            <MessageSquare className="w-5 h-5 text-ink-soft shrink-0" />
            <span>{pulse.unread_guardian_notes} Pesan Ortu</span>
          </button>
        )}

        {onOpenSafetyModal && (
          <button
            type="button"
            onClick={onOpenSafetyModal}
            className="w-full bg-surface rounded-2xl min-h-[56px] px-4 flex items-center justify-center gap-2.5 text-xs medium:text-sm font-semibold text-ink active:scale-[0.99] transition cursor-pointer hover-only:bg-surface-subtle shadow-hairline"
          >
            <HeartPulse className="w-5 h-5 text-danger shrink-0" />
            <span>
              {activeIncidentsCount > 0 ? (
                `${activeIncidentsCount} Catatan Khusus`
              ) : (
                'Perhatian & Kesehatan'
              )}
            </span>
          </button>
        )}
      </div>

      {/* 4. Critical Health & Safety Exceptions Row (Anchor 2: divide-y divide-line 0.12 opacity) */}
      {validAlerts.length > 0 && (
        <div className="pt-2 space-y-1">
          <h3 className="text-xs font-bold text-brand-deep mb-2 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-warning shrink-0" />
            <span>Perhatian Pagi:</span>
          </h3>

          <div className="divide-y divide-line w-full">
            {validAlerts.map((alert, idx) => (
              <div
                key={`${alert.student_id}_${idx}`}
                onClick={() => onFilterExceptionStudent && onFilterExceptionStudent(alert.student_id)}
                className="py-3 flex items-start gap-2.5 text-xs cursor-pointer hover-only:opacity-80 active:scale-[0.99] transition"
              >
                <AlertTriangle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <div className="flex flex-wrap items-baseline gap-1.5 min-w-0 flex-1">
                  <span className="font-semibold text-warning-deep">{toTitleCase(alert.student_name)}</span>
                  <span className="text-warning-deep">—</span>
                  {alert.temperature && (
                    <span className="text-danger-deep font-bold mr-1 font-mono whitespace-nowrap">
                      ({alert.temperature}°C)
                    </span>
                  )}
                  <span className="text-warning-deep leading-snug">{alert.note?.replace(/^alergi:\s*/i, '')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
