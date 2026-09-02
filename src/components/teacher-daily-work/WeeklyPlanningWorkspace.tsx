/**
 * Yapendik School OS — Domain 01: Weekly Planning Workspace (RPPM Sentra PAUD)
 * 5-Day Weekly Matrix (Senin-Jumat) with SSOT sync to learning_activities.
 * Responsive: 5-Column Grid (Expanded) & Day Switcher (Compact/Medium).
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { LearningActivity, ClassRoom, WeeklyPlan } from '../../domain/types';
import { Button, SegmentedControl, SegmentedControlOption, Badge } from '../ui';
import { 
  CalendarRange, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Clock, 
  Check, 
  Printer, 
  Sparkles, 
  Layers, 
  BookOpen,
  Edit3,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface Props {
  selectedClassId: string;
  onClassChange: (classId: string) => void;
  classes: ClassRoom[];
  canEdit: boolean;
  onSwitchToDaily: (targetDate?: string) => void;
  onAddActivityForDate: (dateStr: string) => void;
}

// Helpers for Week Dates
const getMonday = (d: Date): Date => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(date.setDate(diff));
};

const formatDateIso = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatShortDate = (isoStr: string): string => {
  try {
    const [y, m, d] = isoStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    return dateObj.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short'
    });
  } catch {
    return isoStr;
  }
};

const DAY_NAMES = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat'];

export const WeeklyPlanningWorkspace: React.FC<Props> = ({
  selectedClassId,
  onClassChange,
  classes,
  canEdit,
  onSwitchToDaily,
  onAddActivityForDate
}) => {
  const { securityContext } = useSecurityContext();
  
  // Current Monday reference
  const [currentMonday, setCurrentMonday] = useState<Date>(() => getMonday(new Date()));
  const [activeDayIndex, setActiveDayIndex] = useState<number>(0); // 0 (Senin) to 4 (Jumat) for compact view
  
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [weekActivities, setWeekActivities] = useState<LearningActivity[]>([]);
  
  // Theme Edit Modal
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [themeInput, setThemeInput] = useState('Lingkunganku / Sekolah & Rumahku');
  const [subThemeInput, setSubThemeInput] = useState('Membangun Ruang Kebersamaan');

  // Compute 5 school days (Senin s.d. Jumat)
  const weekDays = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(currentMonday);
    d.setDate(currentMonday.getDate() + i);
    const iso = formatDateIso(d);
    return {
      name: DAY_NAMES[i],
      dateIso: iso,
      displayDate: formatShortDate(iso)
    };
  });

  const weekStartDate = weekDays[0].dateIso;
  const weekEndDate = weekDays[4].dateIso;

  const loadWeeklyData = () => {
    if (!securityContext) return;
    const schoolId = securityContext.activeSchoolId;

    // Load activities for the 5 days
    const acts = db.getLearningActivitiesRange(schoolId, selectedClassId, weekStartDate, weekEndDate);
    setWeekActivities(acts);

    // Load or generate weekly plan header
    const plan = db.getWeeklyPlan(schoolId, selectedClassId, weekStartDate);
    if (plan) {
      setWeeklyPlan(plan);
      setThemeInput(plan.weeklyTheme);
      setSubThemeInput(plan.weeklySubtheme);
    } else {
      setWeeklyPlan(null);
    }
  };

  useEffect(() => {
    loadWeeklyData();
    return db.subscribe(loadWeeklyData);
  }, [securityContext?.activeSchoolId, selectedClassId, weekStartDate]);

  const handleShiftWeek = (weeks: number) => {
    setCurrentMonday(prev => {
      const next = new Date(prev);
      next.setDate(prev.getDate() + weeks * 7);
      return next;
    });
  };

  const handleResetCurrentWeek = () => {
    setCurrentMonday(getMonday(new Date()));
  };

  const handleSaveTheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityContext || !themeInput.trim()) return;

    db.saveWeeklyPlan({
      schoolId: securityContext.activeSchoolId,
      classId: selectedClassId,
      teacherPersonId: securityContext.userId,
      academicYearId: 'ay_2026_2027_ganjil',
      semester: 'GANJIL',
      weekNumber: 1,
      weekStartDate,
      weekEndDate,
      weeklyTheme: themeInput,
      weeklySubtheme: subThemeInput,
      status: 'DRAFT'
    });

    setShowThemeModal(false);
  };

  const classSegments: SegmentedControlOption[] = classes.map(c => ({
    id: c.id,
    label: c.name.includes('A') ? 'Kelas TK A' : c.name.includes('B') ? 'Kelas TK B' : c.name,
    activeClassName: 'bg-brand text-on-brand font-bold shadow-sm ring-1 ring-brand/50'
  }));

  const currentTheme = weeklyPlan?.weeklyTheme || 'Lingkunganku / Sekolah & Rumahku';
  const currentSubTheme = weeklyPlan?.weeklySubtheme || 'Membangun Ruang Kebersamaan';

  return (
    <div className="space-y-4 animate-in fade-in duration-150 text-ink">
      {/* ═══════════════════════════════════════════════════════════
          1. WEEKLY FILTER BAR & THEME RIBBON
          ═══════════════════════════════════════════════════════════ */}
      <div className="bg-surface border border-line rounded-2xl p-4 medium:p-5 shadow-hairline space-y-4">
        {/* Controls Row */}
        <div className="flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-3">
          {/* Week Selector */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleShiftWeek(-1)}
              className="w-9 h-9 rounded-xl bg-surface border border-line hover-only:bg-surface-subtle flex items-center justify-center text-ink-soft hover-only:text-ink cursor-pointer shrink-0"
              title="Pekan Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="min-h-[38px] px-3 py-1.5 rounded-xl bg-surface-subtle border border-line flex items-center gap-2 text-xs font-medium text-ink shadow-hairline">
              <CalendarRange className="w-4 h-4 text-accent-valor shrink-0" />
              <span className="font-mono font-bold">{formatShortDate(weekStartDate)} – {formatShortDate(weekEndDate)}</span>
            </div>

            <button
              type="button"
              onClick={() => handleShiftWeek(1)}
              className="w-9 h-9 rounded-xl bg-surface border border-line hover-only:bg-surface-subtle flex items-center justify-center text-ink-soft hover-only:text-ink cursor-pointer shrink-0"
              title="Pekan Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={handleResetCurrentWeek}
              className="px-2.5 py-1.5 rounded-xl bg-surface-subtle border border-line text-[11px] font-semibold text-accent-valor hover-only:bg-surface cursor-pointer"
            >
              Minggu Ini
            </button>
          </div>

          {/* Class Switcher & Print Actions */}
          <div className="flex items-center gap-2">
            <div className="w-44 shrink-0">
              <SegmentedControl
                options={classSegments}
                value={selectedClassId}
                onChange={onClassChange}
                size="sm"
                className="w-full min-h-[38px]"
              />
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-4 h-4" />}
              className="rounded-xl text-xs font-bold shrink-0 min-h-[38px]"
            >
              Cetak RPPM
            </Button>
          </div>
        </div>

        {/* Weekly Theme Banner (RPPM Header) */}
        <div className="bg-surface-subtle/60 rounded-xl p-3.5 border border-line-soft flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-accent-valor block">
              RPPM • Rencana Pelaksanaan Pembelajaran Mingguan
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm font-bold text-ink">
                Tema: <span className="text-brand">{currentTheme}</span>
              </h3>
              <span className="text-ink-soft text-xs">•</span>
              <p className="text-xs text-ink-soft">
                Sub-tema: <strong className="text-ink font-semibold">{currentSubTheme}</strong>
              </p>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={() => setShowThemeModal(true)}
              className="px-3 py-1.5 rounded-lg bg-surface border border-line text-xs font-semibold text-ink hover-only:border-brand flex items-center gap-1.5 cursor-pointer shadow-hairline transition-all"
            >
              <Edit3 className="w-3.5 h-3.5 text-accent-valor" />
              <span>Ubah Tema Pekan</span>
            </button>
          )}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. COMPACT VIEW: DAY TABS (< 840px)
          ═══════════════════════════════════════════════════════════ */}
      <div className="expanded:hidden flex items-center gap-1.5 overflow-x-auto pb-1">
        {weekDays.map((day, idx) => {
          const count = weekActivities.filter(a => a.date === day.dateIso).length;
          const isActive = activeDayIndex === idx;
          return (
            <button
              key={day.dateIso}
              type="button"
              onClick={() => setActiveDayIndex(idx)}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 cursor-pointer shrink-0 transition-all ${
                isActive
                  ? 'bg-surface text-ink border-line font-bold shadow-soft ring-1 ring-brand/30'
                  : 'bg-surface-subtle text-ink-soft border-line hover-only:text-ink'
              }`}
            >
              <span>{day.name}</span>
              <span className="text-[11px] font-mono text-ink-faint">({day.displayDate})</span>
              {count > 0 && (
                <span className="w-4 h-4 rounded-full bg-brand text-on-brand text-[10px] font-bold flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. 5-DAY WEEKLY GRID MATRIX
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 expanded:grid-cols-5 gap-3.5">
        {weekDays.map((day, idx) => {
          // On mobile, show only active day; on expanded, show all 5 columns
          const isVisibleOnMobile = activeDayIndex === idx;
          const dayActs = weekActivities.filter(a => a.date === day.dateIso);

          return (
            <div
              key={day.dateIso}
              className={`bg-surface border border-line rounded-2xl p-3.5 shadow-hairline space-y-3 flex flex-col ${
                !isVisibleOnMobile ? 'hidden expanded:flex' : 'flex'
              }`}
            >
              {/* Day Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-line">
                <div>
                  <h4 className="font-bold text-xs text-ink">{day.name}</h4>
                  <p className="text-[11px] font-mono text-ink-soft">{day.displayDate}</p>
                </div>
                <button
                  type="button"
                  onClick={() => onSwitchToDaily(day.dateIso)}
                  className="text-[11px] font-semibold text-accent-valor hover-only:underline cursor-pointer"
                  title="Buka tampilan harian untuk tanggal ini"
                >
                  Lihat Detail ↗
                </button>
              </div>

              {/* Activities in this Day */}
              <div className="space-y-2.5 grow">
                {dayActs.map(act => (
                  <div
                    key={act.id}
                    className={`bg-surface-subtle/60 rounded-xl p-3 border text-xs space-y-2 transition-all ${
                      act.completed ? 'border-success-line/60 bg-success-tint/20' : 'border-line-soft hover-only:border-brand/60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono text-[10px] font-bold text-accent-valor flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {act.timeSlot}
                      </span>
                      {act.completed && (
                        <span className="text-[10px] text-success-deep font-bold flex items-center gap-0.5">
                          <Check className="w-3 h-3" /> Selesai
                        </span>
                      )}
                    </div>

                    <h5 className="font-bold text-ink leading-snug line-clamp-2">
                      {act.activityName}
                    </h5>

                    {/* Domain Tags */}
                    {act.developmentalFocus && act.developmentalFocus.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {act.developmentalFocus.slice(0, 2).map(d => (
                          <span key={d} className="px-1.5 py-0.5 rounded bg-surface text-[9px] font-semibold text-ink-soft border border-line">
                            {d.replace(/_/g, ' ')}
                          </span>
                        ))}
                        {act.developmentalFocus.length > 2 && (
                          <span className="text-[9px] text-ink-faint">
                            +{act.developmentalFocus.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {dayActs.length === 0 && (
                  <div className="py-6 text-center text-ink-faint text-[11px] border border-dashed border-line-soft rounded-xl">
                    Belum ada sentra terjadwal
                  </div>
                )}
              </div>

              {/* Quick Add Button for this Day */}
              {canEdit && (
                <button
                  type="button"
                  onClick={() => onAddActivityForDate(day.dateIso)}
                  className="w-full py-2 rounded-xl border border-dashed border-line hover-only:border-brand hover-only:text-brand text-xs font-semibold text-ink-soft flex items-center justify-center gap-1.5 transition-all cursor-pointer mt-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Sentra</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          4. MODAL: UBAH TEMA MINGGUAN (RPPM)
          ═══════════════════════════════════════════════════════════ */}
      {showThemeModal && (
        <div className="fixed inset-0 bg-brand/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-surface rounded-2xl shadow-floating border border-line max-w-md w-full p-5 text-ink space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-accent-valor" />
                <span>Tema &amp; Sub-tema RPPM Pekan Ini</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowThemeModal(false)}
                className="w-7 h-7 rounded-lg text-ink-soft hover-only:bg-surface-subtle flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTheme} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Tema Utama Pekan:</label>
                <input
                  type="text"
                  required
                  value={themeInput}
                  onChange={(e) => setThemeInput(e.target.value)}
                  className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:border-brand"
                  placeholder="mis. Lingkunganku / Sekolah &amp; Rumahku"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-ink">Sub-Tema Pekan:</label>
                <input
                  type="text"
                  required
                  value={subThemeInput}
                  onChange={(e) => setSubThemeInput(e.target.value)}
                  className="w-full bg-surface-subtle border border-line rounded-xl px-3 py-2 text-xs text-ink focus:outline-hidden focus:border-brand"
                  placeholder="mis. Membangun Ruang Kebersamaan"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-line">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowThemeModal(false)}
                  className="rounded-xl text-xs font-bold"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="rounded-xl text-xs font-bold shadow-soft"
                >
                  Simpan Tema RPPM
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
