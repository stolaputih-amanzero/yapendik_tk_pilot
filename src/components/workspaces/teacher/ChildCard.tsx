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
  Sparkles
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

const MOODS: { key: ArrivalMood; label: string; icon: string }[] = [
  { key: 'CERIA', label: 'Ceria', icon: '😊' },
  { key: 'TENANG', label: 'Tenang', icon: '😌' },
  { key: 'GELISAH', label: 'Gelisah', icon: '😟' },
  { key: 'MENANGIS', label: 'Menangis', icon: '😢' }
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
    <div className={`relative flex flex-col h-full rounded-2xl border transition-all duration-200 p-4 shadow-xs ${
      status === 'HADIR'
        ? 'bg-emerald-50/40 border-emerald-300'
        : status === 'SAKIT'
        ? 'bg-amber-50/50 border-amber-300'
        : status === 'IZIN'
        ? 'bg-sky-50/40 border-sky-300'
        : status === 'ALPA'
        ? 'bg-rose-50/40 border-rose-300'
        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
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
            <h4 className="text-sm font-bold text-slate-900 leading-tight truncate">
              {student.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-[11px] text-slate-500 font-mono font-semibold">NIS {student.nis}</span>
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
            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
          >
            <Sparkles className="w-4 h-4 text-amber-600 fill-amber-600" />
          </Button>
          <Button
            variant="icon"
            size="sm"
            onClick={onOpenChildPivot}
            title="Buka Rekam Jejak / One Child Pivot"
            aria-label="Rekam Jejak"
            className="p-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
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
          className={`py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.97] ${
            status === 'HADIR'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Hadir</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onStatusChange('SAKIT');
            setShowDetailDrawer(true);
          }}
          className={`py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.97] ${
            status === 'SAKIT'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-amber-50 hover:text-amber-800 border border-slate-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Sakit</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange('IZIN')}
          className={`py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.97] ${
            status === 'IZIN'
              ? 'bg-sky-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-sky-50 hover:text-sky-800 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Izin</span>
        </button>

        <button
          type="button"
          onClick={() => onStatusChange('ALPA')}
          className={`py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center justify-center gap-1 cursor-pointer active:scale-[0.97] ${
            status === 'ALPA'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-50 text-slate-700 hover:bg-rose-50 hover:text-rose-800 border border-slate-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Alpa</span>
        </button>
      </div>

      {/* Mood Selector (Quick 1-tap emojis) */}
      <div className="flex flex-col mt-auto justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
          <span className="text-[11px] text-slate-500 font-medium">Mood Datang:</span>
          <div className="flex items-center gap-1">
            {MOODS.map(m => {
              const isSelected = student.today_mood === m.key;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => onMoodChange(m.key)}
                title={m.label}
                className={`p-1.5 rounded-lg text-sm transition-all duration-150 cursor-pointer active:scale-[0.95] ${
                  isSelected
                    ? 'bg-indigo-50 scale-125 border border-indigo-200 shadow-2xs'
                    : 'opacity-60 hover:opacity-100 hover:scale-110'
                }`}
              >
                <span>{m.icon}</span>
              </button>
            );
          })}
          </div>
        </div>

        {/* Temperature Quick Input */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto mt-2 sm:mt-0">
          <div className="relative flex items-center shrink-0 flex-1 sm:flex-none">
            <Thermometer className="absolute left-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="number"
              step="0.1"
              min="34"
              max="42"
              value={tempInput}
              onChange={e => setTempInput(e.target.value)}
              onBlur={handleTempBlur}
              placeholder="Suhu °C"
              className={`w-full sm:w-[90px] pl-7 pr-2 py-1.5 sm:py-1 rounded-lg text-xs font-semibold border focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors ${
                student.today_temperature && student.today_temperature > 37.5
                  ? 'bg-rose-50 border-rose-300 text-rose-900 focus:border-rose-500'
                  : student.today_temperature
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 focus:border-emerald-500'
                  : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowDetailDrawer(!showDetailDrawer)}
            title="Tambah Catatan Kondisi"
            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
              student.today_arrival_note
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Health & Arrival Detail Drawer */}
      {showDetailDrawer && (
        <div className="mt-3 pt-3 border-t border-slate-100 space-y-2 bg-slate-50 p-2.5 rounded-xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-700 font-bold whitespace-nowrap flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-slate-500" /> Suhu (°C):
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
              className="w-20 px-2 py-1 text-xs font-semibold rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Catatan kedatangan (mis. batuk/minum obat jam 10)"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onBlur={handleNoteBlur}
              className="w-full px-2.5 py-1 text-xs rounded-lg bg-white border border-slate-300 focus:outline-none focus:ring-1 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>
      )}
    </div>
  );
};
