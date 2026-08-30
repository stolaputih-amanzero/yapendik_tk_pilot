/**
 * Yapendik School OS — Stage 4.1 Operating State Indicator (CC-03)
 * Dynamic indicator of teacher's pedagogical daily rhythm (8 states)
 * ADR-UX-010 Flat Fluid Doctrine (F-1 Screen is the Container, F-2 Single-Depth, Zero Box)
 */

import React from 'react';
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
  School
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
  const activeConfig = STATES_CONFIG.find(s => s.key === currentState) || STATES_CONFIG[1];

  return (
    <section className="space-y-3 mb-8">
      {/* 1. Eyebrow Header (Directly on canvas) */}
      <div className="flex items-center gap-2">
        <School className="w-4 h-4 text-ink-soft shrink-0" />
        <span className="text-xs font-bold uppercase tracking-wider text-brand-deep">
          RITME KELAS
        </span>
        <span className="font-mono text-[11px] font-bold px-2 py-1 rounded-full bg-surface border border-line-hairline text-ink-soft shadow-hairline">
          {activeConfig.timeSlot}
        </span>
        <span className="w-2 h-2 rounded-full bg-success shrink-0" aria-label="Status Aktif" />
      </div>

      {/* 2. Judul & Deskripsi Penuh (Typography Carries Hierarchy) */}
      <div className="text-base font-display font-bold text-ink leading-snug">
        <span>{activeConfig.label}</span>
        <span className="text-xs font-normal text-ink-soft ml-2">— {activeConfig.description}</span>
      </div>

      {/* 3. Baris Chip Waktu (Outline controls) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
        {STATES_CONFIG.map((state) => {
          const isCurrent = state.key === currentState;
          const Icon = state.icon;
          return (
            <button
              key={state.key}
              type="button"
              onClick={() => onStateChange(state.key)}
              title={`${state.label} (${state.timeSlot}): ${state.description}`}
              className={`px-3 py-1 rounded-full text-xs transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer shrink-0 border ${
                isCurrent
                  ? 'bg-brand-primary text-on-brand border-transparent font-bold shadow-hairline'
                  : 'bg-surface text-ink-soft border-line-hairline hover-only:bg-surface-subtle hover-only:text-ink font-medium shadow-hairline'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="font-mono whitespace-nowrap text-[11px]">{state.timeSlot}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
