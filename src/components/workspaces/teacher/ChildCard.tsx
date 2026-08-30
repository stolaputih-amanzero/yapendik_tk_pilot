/**
 * Yapendik School OS — Stage 4.1 Child Card (CC-04)
 * Tactile, touch-optimized attendance card with Amanaura Design System v4.0 (Fluid Anchors)
 */

import React, { useState } from 'react';
import { StudentRosterItem, ArrivalMood } from '../../../types/teacherDailyTypes';
import { AttendanceStatus } from '../../../domain/types';
import { AvatarChild, Button } from '../../ui';
import { 
  Check, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Thermometer, 
  FolderOpen,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Annoyed,
  LucideIcon
} from 'lucide-react';

interface Props {
  student: StudentRosterItem;
  onStatusChange: (status: AttendanceStatus) => void;
  onMoodChange: (mood: ArrivalMood) => void;
  onTempChange: (temp: number | undefined) => void;
  onArrivalNoteChange: (note: string) => void;
  onOpenChildPivot: () => void;
  onQuickCaptureForChild: () => void;
}

const MOODS: { key: ArrivalMood; label: string; icon: LucideIcon }[] = [
  { key: 'CERIA', label: 'Ceria', icon: Smile },
  { key: 'TENANG', label: 'Tenang', icon: Meh },
  { key: 'GELISAH', label: 'Gelisah', icon: Annoyed },
  { key: 'MENANGIS', label: 'Menangis', icon: Frown }
];

export const ChildCard: React.FC<Props> = ({
  student,
  onStatusChange,
  onMoodChange,
  onTempChange,
  onArrivalNoteChange,
  onOpenChildPivot,
  onQuickCaptureForChild
}) => {
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [isAllergyExpanded, setIsAllergyExpanded] = useState(false);
  const [tempInput, setTempInput] = useState<string>(
    student.today_temperature ? String(student.today_temperature) : ''
  );
  const [noteInput, setNoteInput] = useState<string>(student.today_arrival_note || '');

  const status = student.today_status;

  const handleTempBlur = () => {
    const val = parseFloat(tempInput);
    if (!isNaN(val) && val > 34 && val < 42) {
      onTempChange(val);
    } else if (tempInput === '') {
      onTempChange(undefined);
    }
  };

  const handleNoteBlur = () => {
    onArrivalNoteChange(noteInput);
  };

  const hasRealAllergy = Boolean(
    student.allergies &&
    student.allergies.trim() !== '' &&
    !['tidak ada', 'none', '-', 'tidak'].includes(student.allergies.trim().toLowerCase())
  );

  return (
    <div className="relative flex flex-col h-full rounded-2xl bg-surface p-4 medium:p-5 shadow-hairline transition-all duration-200 text-ink">
      {/* Header: Child Avatar, Name, NIS & Pivot Button */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <AvatarChild
            name={student.name}
            id={student.student_id}
            size="md"
            showSymbol
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-bold text-ink leading-tight truncate">
              {student.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-ink-soft font-mono font-semibold whitespace-nowrap">
                NIS {student.nis}
              </span>
              {hasRealAllergy && (
                <button
                  type="button"
                  onClick={() => setIsAllergyExpanded(!isAllergyExpanded)}
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-warning-tint text-warning-deep transition cursor-pointer text-left ${
                    isAllergyExpanded ? 'w-full whitespace-normal' : 'max-w-[140px] truncate'
                  }`}
                  title={student.allergies}
                  aria-label={`Alergi: ${student.allergies}`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-warning shrink-0" />
                  <span className="truncate flex-1">{student.allergies}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Action icons (D-3: Brand-tint for Moment Capture) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="icon"
            size="sm"
            onClick={onQuickCaptureForChild}
            title="Momen Cepat untuk Ananda ini"
            aria-label="Momen Cepat"
            className="p-2 rounded-xl bg-brand-tint hover-only:bg-brand-tint/80 text-brand-deep border-0"
          >
            <Sparkles className="w-4 h-4 text-brand-primary fill-brand-primary" />
          </Button>
          <Button
            variant="icon"
            size="sm"
            onClick={onOpenChildPivot}
            title="Buka Rekam Jejak / One Child Pivot"
            aria-label="Rekam Jejak"
            className="p-2 rounded-xl bg-surface-subtle hover-only:bg-surface-subtle/80 text-ink-soft border-0"
          >
            <FolderOpen className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 1-Tap Attendance State Selector (48dp thumb touch compliant) */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <button
          type="button"
          onClick={() => onStatusChange('HADIR')}
          className={`min-h-[48px] py-3 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] ${
            status === 'HADIR'
              ? 'bg-success text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:bg-success-tint hover-only:text-success-deep'
          }`}
        >
          <Check className="w-4 h-4" />
          <span>Hadir</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onStatusChange('SAKIT');
            setShowDetailDrawer(true);
          }}
          className={`min-h-[48px] py-3 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] ${
            status === 'SAKIT'
              ? 'bg-warning text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:bg-warning-tint hover-only:text-warning-deep'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Sakit</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange('IZIN')}
          className={`min-h-[48px] py-3 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] ${
            status === 'IZIN'
              ? 'bg-info text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:bg-info-tint hover-only:text-info-deep'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Izin</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange('ALPA')}
          className={`min-h-[48px] py-3 px-3 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.97] ${
            status === 'ALPA'
              ? 'bg-danger text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:bg-danger-tint hover-only:text-danger-deep'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Alpa</span>
        </button>
      </div>

      {/* D-4: Mood Selector Grid & Temperature */}
      <div className="flex flex-col mt-auto gap-3 pt-3 border-t border-line">
        {/* Mood Row full-width grid */}
        <div className="flex flex-col gap-1.5 w-full">
          <span className="text-[11px] text-ink-soft font-semibold">Mood:</span>
          <div className="grid grid-cols-4 gap-2 w-full">
            {MOODS.map(m => {
              const isSelected = student.today_mood === m.key;
              const Icon = m.icon;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => onMoodChange(m.key)}
                  title={m.label}
                  className={`min-h-[44px] flex items-center justify-center p-2 rounded-xl text-sm transition-all duration-150 cursor-pointer active:scale-95 ${
                    isSelected
                      ? 'bg-lppa-tint font-bold text-lppa-deep shadow-hairline ring-1 ring-lppa'
                      : 'bg-surface-subtle text-ink-faint hover-only:text-ink hover-only:bg-surface-subtle/80'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Temperature & Notes */}
        <div className="flex items-center gap-2 w-full pt-1">
          <div className="relative flex items-center flex-1">
            <Thermometer className="absolute left-2.5 w-4 h-4 text-ink-faint" />
            <input
              type="number"
              step="0.1"
              min="34"
              max="42"
              value={tempInput}
              onChange={e => setTempInput(e.target.value)}
              onBlur={handleTempBlur}
              placeholder="Suhu °C"
              className={`w-full min-h-[44px] pl-8 pr-2 py-1 rounded-xl text-xs font-semibold bg-surface-subtle border border-line-hairline focus:outline-none focus:ring-1 focus:ring-brand-primary transition-colors ${
                student.today_temperature && student.today_temperature > 37.5
                  ? 'text-danger-deep'
                  : student.today_temperature
                  ? 'text-success-deep'
                  : 'text-ink'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowDetailDrawer(!showDetailDrawer)}
            title="Tambah Catatan Kondisi"
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-xl bg-surface-subtle border border-line-hairline text-ink-soft transition-colors shrink-0 cursor-pointer hover-only:bg-surface-subtle/80 ${
              student.today_arrival_note ? 'text-brand-deep font-bold' : ''
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Health & Arrival Detail Drawer */}
      {showDetailDrawer && (
        <div className="mt-3 pt-3 border-t border-line space-y-2 bg-surface-subtle p-3 rounded-xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <label className="text-xs text-ink-soft font-bold whitespace-nowrap flex items-center gap-1">
              <Thermometer className="w-4 h-4 text-ink-soft" /> Suhu (°C):
            </label>
            <input
              type="number"
              step="0.1"
              min="34"
              max="42"
              placeholder="36.5"
              value={tempInput}
              onChange={e => setTempInput(e.target.value)}
              onBlur={handleTempBlur}
              className="w-20 px-2 py-1 text-xs font-semibold rounded-lg bg-surface border border-line-hairline focus:outline-none focus:ring-1 focus:ring-brand-primary text-ink"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Catatan kedatangan (mis. batuk/minum obat jam 10)"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onBlur={handleNoteBlur}
              className="w-full px-2 py-1 text-xs rounded-lg bg-surface border border-line-hairline focus:outline-none focus:ring-1 focus:ring-brand-primary text-ink placeholder:text-ink-faint font-medium"
            />
          </div>
        </div>
      )}
    </div>
  );
};
