/**
 * Yapendik School OS — Stage 4.1 Classroom Pulse Banner (CC-02)
 * Tier 1: Real-time classroom attendance pulse & active exception banner
 * Decluttered & Mobile-First Clean Aesthetic
 */

import React from 'react';
import { ClassroomPulseData, ActiveTeacherContext } from '../../../types/teacherDailyTypes';
import { AlertTriangle, MessageSquare, CheckCircle2, HeartPulse, ShieldAlert } from 'lucide-react';
import { Button, Badge } from '../../ui';

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
    <div className="bg-surface border border-line rounded-card p-4 medium:p-4 text-ink shadow-hairline mb-5">
      {/* ═══ EXPANDED / LARGE (≥ 840px): 1 Single Row ═══ */}
      <div className="hidden expanded:flex expanded:items-center expanded:justify-between gap-4">
        {/* Left: Class Name & Date */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 bg-surface-subtle border border-line rounded-control flex items-center justify-center text-brass shrink-0">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-display font-bold tracking-tight text-ink whitespace-nowrap">
                {context.class_name}
              </h2>
              {context.is_semester_closed && (
                <Badge variant="danger" dot>
                  SEMESTER DITUTUP
                </Badge>
              )}
            </div>
            <p className="text-xs text-ink-soft font-medium mt-0.5">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Right: Attendance Chip & Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2">
          {/* Attendance Stat Chip */}
          <div className="h-10 bg-surface-subtle border border-line rounded-field px-3 flex items-center gap-3 text-ink shrink-0">
            <div className="text-right">
              <div className="text-[10px] text-ink-soft uppercase tracking-wider font-semibold leading-none">Kehadiran</div>
              <div className="text-sm font-bold text-success leading-tight mt-0.5 font-mono whitespace-nowrap">
                {pulse.present_count}/{pulse.total_students} <span className="text-[10px] text-ink-soft font-normal">({attendanceRate}%)</span>
              </div>
            </div>
            {pulse.unaccounted_count > 0 ? (
              <Badge variant="warning">
                {pulse.unaccounted_count} Belum
              </Badge>
            ) : (
              <Badge variant="success">
                100%
              </Badge>
            )}
          </div>

          {/* Action Buttons Group */}
          {pulse.unread_guardian_notes > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenGuardianNotices}
              leftIcon={<MessageSquare className="w-4 h-4 text-ink-soft shrink-0" />}
              className="h-10 text-sm font-semibold rounded-field cursor-pointer whitespace-nowrap"
            >
              <span>{pulse.unread_guardian_notes} Pesan Ortu</span>
            </Button>
          )}

          {onOpenSafetyModal && (
            <Button
              variant={activeIncidentsCount > 0 ? 'danger' : 'secondary'}
              size="sm"
              onClick={onOpenSafetyModal}
              leftIcon={<HeartPulse className="w-4 h-4 text-danger shrink-0" />}
              className="h-10 text-sm font-semibold rounded-field cursor-pointer whitespace-nowrap"
            >
              <span>
                {activeIncidentsCount > 0 ? (
                  `${activeIncidentsCount} Catatan Khusus`
                ) : (
                  'Perhatian & Kesehatan'
                )}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* ═══ MEDIUM (600px – 839px): 2-Tier Balanced Stacking ═══ */}
      <div className="hidden medium:flex expanded:hidden flex-col gap-3">
        {/* Tier 1: Identity & Attendance in 1 Row */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-surface-subtle border border-line rounded-control flex items-center justify-center text-brass shrink-0">
              <HeartPulse className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base font-display font-bold tracking-tight text-ink whitespace-nowrap">
                  {context.class_name}
                </h2>
                {context.is_semester_closed && (
                  <Badge variant="danger" dot>
                    SEMESTER DITUTUP
                  </Badge>
                )}
              </div>
              <p className="text-xs text-ink-soft font-medium mt-0.5">
                {formattedDate}
              </p>
            </div>
          </div>

          <div className="h-10 bg-surface-subtle border border-line rounded-field px-3 flex items-center gap-2 text-ink shrink-0">
            <div className="text-right">
              <div className="text-[10px] text-ink-soft uppercase tracking-wider font-semibold leading-none">Kehadiran</div>
              <div className="text-xs font-bold text-success leading-tight mt-0.5 font-mono whitespace-nowrap">
                {pulse.present_count}/{pulse.total_students} <span className="text-[10px] text-ink-soft font-normal">({attendanceRate}%)</span>
              </div>
            </div>
            {pulse.unaccounted_count > 0 ? (
              <Badge variant="warning">
                {pulse.unaccounted_count} Belum
              </Badge>
            ) : (
              <Badge variant="success">
                100%
              </Badge>
            )}
          </div>
        </div>

        {/* Tier 2: Action Buttons Full-Wrap */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-line-soft">
          {pulse.unread_guardian_notes > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenGuardianNotices}
              leftIcon={<MessageSquare className="w-4 h-4 text-ink-soft shrink-0" />}
              className="h-9 text-xs font-semibold rounded-field cursor-pointer whitespace-nowrap"
            >
              <span>{pulse.unread_guardian_notes} Pesan Ortu</span>
            </Button>
          )}

          {onOpenSafetyModal && (
            <Button
              variant={activeIncidentsCount > 0 ? 'danger' : 'secondary'}
              size="sm"
              onClick={onOpenSafetyModal}
              leftIcon={<HeartPulse className="w-4 h-4 text-danger shrink-0" />}
              className="h-9 text-xs font-semibold rounded-field cursor-pointer whitespace-nowrap"
            >
              <span>
                {activeIncidentsCount > 0 ? (
                  `${activeIncidentsCount} Catatan Khusus`
                ) : (
                  'Perhatian & Kesehatan'
                )}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* ═══ COMPACT (< 600px): Clean 3-Tier Vertical Flow ═══ */}
      <div className="flex medium:hidden flex-col gap-3">
        {/* Tier 1: Identity */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-surface-subtle border border-line rounded-control flex items-center justify-center text-brass shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base font-display font-bold tracking-tight text-ink leading-tight">
                {context.class_name}
              </h2>
              {context.is_semester_closed && (
                <Badge variant="danger" dot>
                  SEMESTER DITUTUP
                </Badge>
              )}
            </div>
            <p className="text-xs text-ink-soft font-medium mt-0.5">
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Tier 2: Full-Width Attendance Chip */}
        <div className="h-10 bg-surface-subtle border border-line rounded-field px-3 flex items-center justify-between text-ink w-full">
          <div>
            <div className="text-[10px] text-ink-soft uppercase tracking-wider font-semibold leading-none">Kehadiran Hari Ini</div>
            <div className="text-xs font-bold text-success leading-tight mt-0.5 font-mono whitespace-nowrap">
              {pulse.present_count}/{pulse.total_students} <span className="text-[10px] text-ink-soft font-normal">({attendanceRate}%)</span>
            </div>
          </div>
          {pulse.unaccounted_count > 0 ? (
            <Badge variant="warning">
              {pulse.unaccounted_count} Belum
            </Badge>
          ) : (
            <Badge variant="success">
              100%
            </Badge>
          )}
        </div>

        {/* Tier 3: Full-Width Action Buttons (Grid) */}
        <div className="grid grid-cols-1 gap-2 w-full pt-1">
          {pulse.unread_guardian_notes > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onOpenGuardianNotices}
              leftIcon={<MessageSquare className="w-4 h-4 text-ink-soft shrink-0" />}
              className="h-10 text-xs font-semibold rounded-field w-full justify-center"
            >
              <span>{pulse.unread_guardian_notes} Pesan Ortu</span>
            </Button>
          )}

          {onOpenSafetyModal && (
            <Button
              variant={activeIncidentsCount > 0 ? 'danger' : 'secondary'}
              size="sm"
              onClick={onOpenSafetyModal}
              leftIcon={<HeartPulse className="w-4 h-4 text-danger shrink-0" />}
              className="h-10 text-xs font-semibold rounded-field w-full justify-center"
            >
              <span>
                {activeIncidentsCount > 0 ? (
                  `${activeIncidentsCount} Catatan Khusus`
                ) : (
                  'Perhatian & Kesehatan'
                )}
              </span>
            </Button>
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
          <div className="mt-3.5 pt-3 border-t border-line-soft flex flex-col medium:flex-row medium:items-start gap-2">
            <span className="text-[11px] medium:text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center gap-2 shrink-0 medium:pt-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-brass" /> Perhatian Pagi:
            </span>
            <div className="flex flex-col medium:flex-row medium:flex-wrap gap-2 w-full">
              {validAlerts.map((alert, idx) => (
                <button
                  key={`${alert.student_id}_${idx}`}
                  type="button"
                  onClick={() => onFilterExceptionStudent && onFilterExceptionStudent(alert.student_id)}
                  className="flex flex-col medium:flex-row medium:items-center gap-1 medium:gap-2 px-3 py-2 rounded-field text-xs bg-warning-tint border border-warning-line text-warning-deep text-left hover-only:bg-warning-tint active:scale-[0.99] transition cursor-pointer w-full medium:w-auto"
                >
                  <div className="flex items-center flex-wrap">
                    <strong className="text-warning-deep font-bold">{alert.student_name}</strong>
                    <span className="text-warning-deep mx-1">—</span>
                    {alert.temperature && <span className="text-danger font-bold mr-1 font-mono whitespace-nowrap">({alert.temperature}°C)</span>}
                    <span className="text-warning-deep leading-snug">{alert.note?.replace(/^alergi:\s*/i, '')}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
};
