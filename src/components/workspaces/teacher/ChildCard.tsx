/**
 * Yapendik School OS — Stage 4.1 Child Card (CC-04)
 * Tactile, touch-optimized attendance card synchronized with Amanaura FLOW v2.2
 */

import React, { useState } from 'react';
import { StudentRosterItem, ArrivalMood } from '../../../types/teacherDailyTypes';
import { AttendanceStatus } from '../../../domain/types';
import { 
  AvatarChild, 
  Badge, 
  Button, 
  SegmentedControl, 
  SegmentedControlOption, 
  AutoResizeTextarea 
} from '../../ui';
import { 
  Thermometer, 
  FolderOpen,
  Sparkles,
  Smile,
  Meh,
  Frown,
  Angry,
  FileText,
  Plus
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

const statusSegments: SegmentedControlOption[] = [
  { id: 'HADIR', label: 'Hadir', activeClassName: 'bg-success text-on-brand shadow-hairline' },
  { id: 'SAKIT', label: 'Sakit', activeClassName: 'bg-warning text-on-brand shadow-hairline' },
  { id: 'IZIN', label: 'Izin', activeClassName: 'bg-info text-on-brand shadow-hairline' },
  { id: 'ALPA', label: 'Alpa', activeClassName: 'bg-danger text-on-brand shadow-hairline' }
];

const moodSegments: SegmentedControlOption[] = [
  { id: 'CERIA', label: 'Ceria', tooltip: 'Ceria / Senang', icon: <Smile className="w-4 h-4" />, hideLabel: true, activeClassName: 'bg-success text-on-brand shadow-hairline' },
  { id: 'TENANG', label: 'Stabil', tooltip: 'Stabil / Tenang', icon: <Meh className="w-4 h-4" />, hideLabel: true, activeClassName: 'bg-info text-on-brand shadow-hairline' },
  { id: 'GELISAH', label: 'Lesu', tooltip: 'Lesu / Lelah', icon: <Frown className="w-4 h-4" />, hideLabel: true, activeClassName: 'bg-warning text-on-brand shadow-hairline' },
  { id: 'MENANGIS', label: 'Rewel', tooltip: 'Rewel / Menangis', icon: <Angry className="w-4 h-4" />, hideLabel: true, activeClassName: 'bg-danger text-on-brand shadow-hairline' }
];

const toTitleCase = (str: string) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const ChildCard: React.FC<Props> = ({
  student,
  onStatusChange,
  onMoodChange,
  onTempChange,
  onArrivalNoteChange,
  onOpenChildPivot,
  onQuickCaptureForChild
}) => {
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [isAllergyExpanded, setIsAllergyExpanded] = useState(false);

  const status = student.today_status || 'HADIR';
  const temperature = student.today_temperature ?? 36.5;
  const mood = student.today_mood || 'CERIA';
  const notes = student.today_arrival_note || '';

  const isFever = temperature >= 37.5;
  const isCustomTemp = temperature !== 36.5;
  const hasNotes = Boolean(notes && notes.trim().length > 0);
  const hasSpecialDetail = hasNotes || (status === 'HADIR' && isCustomTemp);

  const handleTempChange = (newTemp: number) => {
    onTempChange(newTemp);
  };

  const hasRealAllergy = Boolean(
    student.allergies &&
    student.allergies.trim() !== '' &&
    !['tidak ada', 'none', '-', 'tidak'].includes(student.allergies.trim().toLowerCase())
  );

  return (
    <div className="relative flex flex-col justify-between h-full rounded-2xl bg-surface p-4 shadow-hairline border border-line gap-3 hover-only:border-brand-primary/40 transition-colors text-ink">
      <div className="space-y-3">
        {/* Header: Child Avatar, Name, NIS & Pivot Button */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <AvatarChild
              name={student.name}
              id={student.student_id}
              size="md"
              showSymbol={false}
            />
            <div className="min-w-0 flex-1">
              <h4 className="text-[15px] font-semibold text-ink leading-snug break-words">
                {toTitleCase(student.name)}
              </h4>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                <Badge variant="neutral">
                  NIS {student.nis}
                </Badge>
                {hasRealAllergy && (
                  <button
                    type="button"
                    onClick={() => setIsAllergyExpanded(!isAllergyExpanded)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-warning-tint text-warning-deep border border-warning-line transition cursor-pointer text-left ${
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

          {/* Action icons: Quick Moment Capture & One Child Pivot */}
          <div className="flex items-center gap-1.5 shrink-0">
            <Button
              variant="icon"
              size="sm"
              onClick={onQuickCaptureForChild}
              title="Momen Cepat untuk Ananda ini"
              aria-label="Momen Cepat"
              className="p-2 rounded-xl bg-brand-tint hover-only:bg-brand-tint/80 text-brand-deep border-0 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-brand-primary fill-brand-primary" />
            </Button>
            <Button
              variant="icon"
              size="sm"
              onClick={onOpenChildPivot}
              title="Buka Rekam Jejak / One Child Pivot"
              aria-label="Rekam Jejak"
              className="p-2 rounded-xl bg-surface-subtle hover-only:bg-surface-subtle/80 text-ink-soft border-0 cursor-pointer"
            >
              <FolderOpen className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Status: 1-Tap SegmentedControl (min-h-[44px], w-full) */}
        <div className="w-full pt-1">
          <SegmentedControl
            options={statusSegments}
            value={status}
            onChange={(val) => onStatusChange(val as AttendanceStatus)}
            size="sm"
            className="w-full min-h-[44px]"
          />
        </div>

        {/* Conditional Arrival Mood (Rendered ONLY when status === 'HADIR') */}
        {status === 'HADIR' && (
          <div className="w-full pt-1 animate-in fade-in slide-in-from-top-1 duration-150">
            <SegmentedControl
              options={moodSegments}
              value={mood}
              onChange={(val) => onMoodChange(val as ArrivalMood)}
              size="sm"
              className="w-full min-h-[44px]"
            />
          </div>
        )}
      </div>

      {/* Arrival Notes & Special Screening (Option B) */}
      <div className="w-full pt-1 border-t border-line-hairline mt-auto">
        {isEditingNote ? (
          <div className="space-y-2.5 animate-in fade-in duration-150 bg-surface-subtle/50 p-3 rounded-xl border border-line-soft">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-ink-soft flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-primary shrink-0" />
                Catatan &amp; Skrining Khusus
              </label>
              <button
                type="button"
                onClick={() => setIsEditingNote(false)}
                className="text-[11px] font-semibold text-brand-primary hover-only:underline cursor-pointer"
              >
                Selesai
              </button>
            </div>

            {/* Temperature Stepper inside Screening Panel (HADIR-only) */}
            {status === 'HADIR' && (
              <div className={`flex items-center justify-between gap-3 border rounded-xl px-3 py-2 transition-colors ${
                isFever 
                  ? 'bg-warning-tint text-warning-deep border-warning-line' 
                  : 'bg-surface border-line text-ink'
              }`}>
                <div className="flex items-center gap-2">
                  <Thermometer className={`w-4 h-4 shrink-0 ${isFever ? 'text-warning-deep' : 'text-brand-primary'}`} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-medium text-ink-soft">Suhu Tubuh</span>
                    <span className="font-mono tabular-nums font-bold text-xs">
                      {temperature.toFixed(1)} °C {isFever && <span className="text-[10px] text-warning-deep font-bold ml-1">(Demam)</span>}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={temperature <= 34.0}
                    onClick={() => handleTempChange(Math.max(34.0, Math.round((temperature - 0.1) * 10) / 10))}
                    className="w-7 h-7 rounded-lg bg-surface-subtle hover-only:bg-line-soft border border-line flex items-center justify-center font-bold text-ink text-xs active:scale-95 disabled:opacity-40 cursor-pointer"
                    title="Turunkan 0.1°C"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    disabled={temperature >= 42.0}
                    onClick={() => handleTempChange(Math.min(42.0, Math.round((temperature + 0.1) * 10) / 10))}
                    className="w-7 h-7 rounded-lg bg-surface-subtle hover-only:bg-line-soft border border-line flex items-center justify-center font-bold text-ink text-xs active:scale-95 disabled:opacity-40 cursor-pointer"
                    title="Naikkan 0.1°C"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {/* AutoResize Textarea */}
            <AutoResizeTextarea
              minRows={2}
              maxRows={4}
              autoFocus
              placeholder="Tulis catatan kondisi kedatangan, kesehatan, atau penjemputan anak..."
              value={notes}
              onChange={(e) => onArrivalNoteChange(e.target.value)}
              className="bg-surface border border-line rounded-xl text-xs text-ink placeholder:text-ink-faint focus:border-brand-primary p-3"
            />
          </div>
        ) : hasSpecialDetail ? (
          <div 
            onClick={() => setIsEditingNote(true)}
            className="flex items-center justify-between gap-2 text-xs bg-surface-subtle hover-only:bg-surface-subtle/80 px-3 py-2 rounded-xl border border-line-soft cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
              {status === 'HADIR' && isCustomTemp && (
                <Badge variant={isFever ? 'warning' : 'neutral'}>
                  <Thermometer className="w-3 h-3 mr-0.5 inline" />
                  {temperature.toFixed(1)} °C
                </Badge>
              )}
              {hasNotes ? (
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <FileText className="w-3.5 h-3.5 text-brand-primary shrink-0" />
                  <span className="text-ink text-xs line-clamp-1 truncate font-medium">
                    {notes}
                  </span>
                </div>
              ) : (
                <span className="text-ink-soft text-xs italic font-medium">
                  Suhu tercatat
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-ink-soft bg-surface border border-line-soft px-2 py-1 rounded shrink-0">
              Ubah
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditingNote(true)}
            className="w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-ink-soft hover-only:text-ink py-2 px-3 rounded-xl border border-dashed border-line-soft hover-only:border-brand-primary/50 bg-surface-subtle/30 hover-only:bg-surface-subtle transition-all cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4 text-brand-primary shrink-0" />
            <span>Catatan</span>
          </button>
        )}
      </div>
    </div>
  );
};
