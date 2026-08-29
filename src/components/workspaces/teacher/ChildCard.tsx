/**
 * Yapendik School OS — Stage 4.1 Child Card (CC-04)
 * Tactile, touch-optimized attendance card with Amanaura Design System v1.0
 */

import React, { useState } from 'react';
import { StudentRosterItem, ArrivalMood } from '../../../types/teacherDailyTypes';
import { AttendanceStatus } from '../../../domain/types';
import { AvatarChild, Button, Badge } from '../../ui';
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
    <div className={`relative flex flex-col h-full rounded-card border transition-all duration-200 p-4 shadow-hairline ${
      status === 'HADIR'
        ? 'bg-success-tint/40 border-success-line'
        : status === 'SAKIT'
        ? 'bg-warning-tint/50 border-warning-line'
        : status === 'IZIN'
        ? 'bg-info-tint/40 border-info-line'
        : status === 'ALPA'
        ? 'bg-danger-tint/40 border-danger-line'
        : 'bg-surface border-line hover-only:border-line hover-only:shadow-hairline'
    }`}>
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
              <span className="text-[11px] text-ink-soft font-mono font-semibold whitespace-nowrap">NIS {student.nis}</span>
              {hasRealAllergy && (
                <Badge variant="warning" dot className="max-w-[130px]" title={student.allergies}>
                  {student.allergies}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="icon"
            size="sm"
            onClick={onQuickCaptureForChild}
            title="Momen Cepat untuk Ananda ini"
            aria-label="Momen Cepat"
            className="p-2 rounded-control bg-warning-tint hover-only:bg-warning-tint text-warning-deep border border-warning-line"
          >
            <Sparkles className="w-4 h-4 text-brass fill-brass" />
          </Button>
          <Button
            variant="icon"
            size="sm"
            onClick={onOpenChildPivot}
            title="Buka Rekam Jejak / One Child Pivot"
            aria-label="Rekam Jejak"
            className="p-2 rounded-control bg-surface-subtle hover-only:bg-surface-subtle text-ink-soft border border-line"
          >
            <FolderOpen className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* 1-Tap Attendance State Selector */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          type="button"
          onClick={() => onStatusChange('HADIR')}
          className={`py-2 rounded-field text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.97] ${
            status === 'HADIR'
              ? 'bg-success text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:bg-success-tint hover-only:text-success-deep border border-line'
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
          className={`py-2 rounded-field text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.97] ${
            status === 'SAKIT'
              ? 'bg-warning text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:bg-warning-tint hover-only:text-warning-deep border border-line'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Sakit</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange('IZIN')}
          className={`py-2 rounded-field text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.97] ${
            status === 'IZIN'
              ? 'bg-info text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:bg-info-tint hover-only:text-info-deep border border-line'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Izin</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange('ALPA')}
          className={`py-2 rounded-field text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.97] ${
            status === 'ALPA'
              ? 'bg-danger text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:bg-danger-tint hover-only:text-danger-deep border border-line'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Alpa</span>
        </button>
      </div>

      {/* Mood Selector (Quick 1-tap emojis) */}
      <div className="flex flex-col mt-auto justify-between gap-3 pt-3 border-t border-line-soft">
        <div className="flex items-center justify-between medium:justify-start gap-2 w-full medium:w-auto">
          <span className="text-[11px] text-ink-soft font-medium whitespace-nowrap">Mood:</span>
          <div className="flex items-center gap-1">
            {MOODS.map(m => {
              const isSelected = student.today_mood === m.key;
              const Icon = m.icon;
              return (
              <button
                key={m.key}
                type="button"
                onClick={() => onMoodChange(m.key)}
                title={m.label}
                className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-control text-sm transition-all duration-150 cursor-pointer active:scale-[0.95] ${
                  isSelected
                    ? 'bg-lppa-tint ring-1 ring-inset ring-current font-bold border border-lppa-line shadow-hairline text-lppa-deep'
                    : 'text-ink-faint hover-only:text-ink hover-only:scale-110 hover-only:bg-surface-subtle'
                }`}
              >
                <Icon className="w-4 h-4" />
              </button>
            );
          })}
          </div>
        </div>

        {/* Temperature Quick Input */}
        <div className="flex items-center gap-2 w-full medium:w-auto mt-2 medium:mt-0">
          <div className="relative flex items-center shrink-0 flex-1 medium:flex-none">
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
              className={`w-full medium:w-[90px] pl-7 pr-2 py-1 medium:py-1 rounded-field text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-brass/30 transition-colors ${
                student.today_temperature && student.today_temperature > 37.5
                  ? 'bg-danger-tint border-danger-line text-danger-deep focus:border-rose-500'
                  : student.today_temperature
                  ? 'bg-success-tint border-success-line text-success-deep focus:border-emerald-500'
                  : 'bg-surface border-line text-ink'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowDetailDrawer(!showDetailDrawer)}
            title="Tambah Catatan Kondisi"
            className={`min-h-[44px] min-w-[44px] flex items-center justify-center p-2 rounded-field border transition-colors shrink-0 ${
              student.today_arrival_note
                ? 'bg-lppa-tint border-lppa-line text-lppa-deep'
                : 'bg-surface-subtle border-line text-ink-soft hover-only:bg-surface-subtle'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Health & Arrival Detail Drawer */}
      {showDetailDrawer && (
        <div className="mt-3 pt-3 border-t border-line-soft space-y-2 bg-surface-subtle p-2 rounded-control animate-in fade-in duration-150">
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
              className="w-20 px-2 py-1 text-xs font-semibold rounded-field bg-surface border border-line focus:outline-none focus:ring-1 focus:ring-brass/30 text-ink"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Catatan kedatangan (mis. batuk/minum obat jam 10)"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onBlur={handleNoteBlur}
              className="w-full px-2 py-1 text-xs rounded-field bg-surface border border-line focus:outline-none focus:ring-1 focus:ring-brass/30 text-ink placeholder:text-ink-faint font-medium"
            />
          </div>
        </div>
      )}
    </div>
  );
};
