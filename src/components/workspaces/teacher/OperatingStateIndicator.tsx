/**
 * Yapendik School OS — Stage 4.1 Operating State Indicator (CC-03)
 * Dynamic indicator of teacher's pedagogical daily rhythm (8 states)
 */

import React, { useState } from 'react';
import { OperatingState } from '../../../types/teacherDailyTypes';
import { 
  Sparkles, 
  Sun, 
  Users, 
  Puzzle, 
  Utensils, 
  BookOpen, 
  HeartHandshake, 
  BrainCircuit, 
  ChevronRight 
} from 'lucide-react';

interface Props {
  currentState: OperatingState;
  onStateChange: (state: OperatingState) => void;
}

interface StateConfig {
  key: OperatingState;
  label: string;
  timeSlot: string;
  icon: React.ElementType;
  description: string;
}

const STATES_CONFIG: StateConfig[] = [
  { key: 'PREPARE', label: '1. Siap Ruang', timeSlot: '06:45', icon: Sun, description: 'Cek lingkungan main & alat sentra' },
  { key: 'WELCOME', label: '2. Sambut Ananda', timeSlot: '07:15', icon: Sparkles, description: 'Presensi cepat, suhu, dan cek mood' },
  { key: 'GATHER', label: '3. Lingkaran Pagi', timeSlot: '07:45', icon: Users, description: 'Doa, nyanyi, dan apersepsi RPPH' },
  { key: 'PLAY_OBSERVE', label: '4. Main Sentra', timeSlot: '08:30', icon: Puzzle, description: 'Momen cepat & tangkap bukti karya' },
  { key: 'CARE_BREAK', label: '5. Rawat & Snack', timeSlot: '10:00', icon: Utensils, description: 'Cuci tangan, makan sehat, toilet training' },
  { key: 'REFLECT', label: '6. Refleksi Lingkaran', timeSlot: '10:30', icon: BookOpen, description: 'Tanya jawab perasaan & recalling main' },
  { key: 'HANDOVER', label: '7. Serah Terima', timeSlot: '11:00', icon: HeartHandshake, description: 'Penjemputan & Buku Penghubung Ortu' },
  { key: 'SYNTHESIZE', label: '8. Sintesis & LPPA', timeSlot: '11:30', icon: BrainCircuit, description: 'Perkaya narasi & susun capaian rapor' },
];

export const OperatingStateIndicator: React.FC<Props> = ({ currentState, onStateChange }) => {
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);
  const activeConfig = STATES_CONFIG.find(s => s.key === currentState) || STATES_CONFIG[1];
  const ActiveIcon = activeConfig.icon;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm mb-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Active State Badge */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
            <ActiveIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold uppercase tracking-wider text-indigo-700">
                Ritme Saat Ini ({activeConfig.timeSlot})
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            </div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>{activeConfig.label}</span>
              <span className="text-xs font-medium text-slate-600">— {activeConfig.description}</span>
            </h3>
          </div>
        </div>

        {/* Phase Timeline Navigation / Override */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {STATES_CONFIG.map((state) => {
            const isCurrent = state.key === currentState;
            const Icon = state.icon;
            return (
              <button
                key={state.key}
                onClick={() => onStateChange(state.key)}
                title={`${state.label} (${state.timeSlot}): ${state.description}`}
                className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                    : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 font-medium'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{state.timeSlot}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
