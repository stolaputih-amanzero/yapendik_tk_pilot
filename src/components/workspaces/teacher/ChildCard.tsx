/**
 * Yapendik School OS — Stage 4.1 Child Card (CC-04)
 * Tactile, touch-optimized attendance card with 1-tap toggle and health exception inputs
 */

import React, { useState } from 'react';
import { StudentRosterItem, ArrivalMood } from '../../../types/teacherDailyTypes';
import { AttendanceStatus } from '../../../domain/types';
import { 
  Check, 
  AlertCircle, 
  Clock, 
  XCircle, 
  Thermometer, 
  Smile, 
  Meh, 
  Frown, 
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
    <div className={`relative rounded-2xl border transition-all duration-200 p-4 shadow-sm ${
      status === 'HADIR'
        ? 'bg-emerald-50/70 border-emerald-300 shadow-emerald-500/5'
        : status === 'SAKIT'
        ? 'bg-amber-50/80 border-amber-300'
        : status === 'IZIN'
        ? 'bg-sky-50/70 border-sky-300'
        : status === 'ALPA'
        ? 'bg-rose-50/70 border-rose-300'
        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md'
    }`}>
      {/* Header: Child Avatar, Name, NIS & Pivot Button */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shadow-sm ${
            student.gender === 'FEMALE'
              ? 'bg-rose-100 text-rose-800 border border-rose-200'
              : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
          }`}>
            {student.name.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-900 leading-tight">
              {student.name}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-slate-600 font-mono font-semibold">NIS {student.nis}</span>
              {hasRealAllergy && (
                <span className="px-1.5 py-0.5 text-[10px] font-extrabold rounded bg-amber-100 text-amber-900 border border-amber-300">
                  ⚠️ {student.allergies}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onQuickCaptureForChild}
            title="Momen Cepat untuk Ananda ini"
            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-800 transition cursor-pointer border border-amber-300/60"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenChildPivot}
            title="Buka Rekam Jejak / One Child Pivot"
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-800 transition cursor-pointer border border-slate-200"
          >
            <FolderOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1-Tap Attendance State Selector */}
      <div className="grid grid-cols-4 gap-1.5 mb-3">
        <button
          onClick={() => onStatusChange('HADIR')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            status === 'HADIR'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
              : 'bg-slate-100 text-slate-700 hover:bg-emerald-100 hover:text-emerald-800 border border-slate-200'
          }`}
        >
          <Check className="w-3.5 h-3.5" />
          <span>Hadir</span>
        </button>

        <button
          onClick={() => {
            onStatusChange('SAKIT');
            setShowDetailDrawer(true);
          }}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            status === 'SAKIT'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
              : 'bg-slate-100 text-slate-700 hover:bg-amber-100 hover:text-amber-800 border border-slate-200'
          }`}
        >
          <AlertCircle className="w-3.5 h-3.5" />
          <span>Sakit</span>
        </button>

        <button
          onClick={() => onStatusChange('IZIN')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            status === 'IZIN'
              ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
              : 'bg-slate-100 text-slate-700 hover:bg-sky-100 hover:text-sky-800 border border-slate-200'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Izin</span>
        </button>

        <button
          onClick={() => onStatusChange('ALPA')}
          className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
            status === 'ALPA'
              ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
              : 'bg-slate-100 text-slate-700 hover:bg-rose-100 hover:text-rose-800 border border-slate-200'
          }`}
        >
          <XCircle className="w-3.5 h-3.5" />
          <span>Alpa</span>
        </button>
      </div>

      {/* Mood Selector (Quick 1-tap emojis) */}
      <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-200/70 dark:border-slate-800/80">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Mood Datang:</span>
        <div className="flex items-center gap-1">
          {MOODS.map(m => {
            const isSelected = student.today_mood === m.key;
            return (
              <button
                key={m.key}
                onClick={() => onMoodChange(m.key)}
                title={m.label}
                className={`p-1.5 rounded-lg text-sm transition-transform cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600/15 dark:bg-indigo-400/20 scale-125 border border-indigo-400/40'
                    : 'opacity-60 hover:opacity-100 hover:scale-110'
                }`}
              >
                <span>{m.icon}</span>
              </button>
            );
          })}
        </div>

        {/* Temperature Quick Input Toggle */}
        <button
          onClick={() => setShowDetailDrawer(!showDetailDrawer)}
          className={`px-2 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition cursor-pointer ${
            student.today_temperature && student.today_temperature > 37.5
              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold'
              : student.today_temperature
              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}
        >
          <Thermometer className="w-3 h-3" />
          <span>{student.today_temperature ? `${student.today_temperature}°C` : 'Suhu'}</span>
        </button>
      </div>

      {/* Expanded Health & Arrival Detail Drawer */}
      {showDetailDrawer && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2 bg-slate-50 dark:bg-slate-950/50 p-2.5 rounded-xl animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 dark:text-slate-400 font-medium whitespace-nowrap flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5" /> Suhu (°C):
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
              className="w-20 px-2 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div>
            <input
              type="text"
              placeholder="Catatan kedatangan (mis. batuk/minum obat jam 10)"
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              onBlur={handleNoteBlur}
              className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
