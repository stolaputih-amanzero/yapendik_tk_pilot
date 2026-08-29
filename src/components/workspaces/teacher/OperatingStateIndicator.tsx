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
    <div className="bg-surface border border-line rounded-card p-4 medium:p-4 shadow-hairline mb-5">
      <div className="flex flex-col gap-3 medium:flex-row medium:items-center medium:justify-between">
        
        {/* Baris 1: Identitas */}
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-control bg-surface-subtle text-ink border border-line shrink-0 mt-0.5">
            <ActiveIcon className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            {/* Baris 1: Eyebrow + Slot Badge + Status Dot */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-ink-soft whitespace-nowrap shrink-0">
                Ritme Kelas
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-1 rounded-pill bg-surface-subtle border border-line text-ink-soft whitespace-nowrap">
                {activeConfig.timeSlot}
              </span>
              <span className="w-2 h-2 rounded-pill bg-success shrink-0" aria-label="Status Aktif" />
            </div>

            {/* Baris 2: Judul & Deskripsi Penuh (Anti Terbelah) */}
            <div className="mt-1">
              <h3 className="text-base font-display font-bold text-ink leading-snug line-clamp-2">
                <span>{activeConfig.label}</span>
                <span className="text-xs font-medium text-ink-soft ml-1.5">— {activeConfig.description}</span>
              </h3>
            </div>
          </div>
        </div>

        {/* Baris 3: Tombol aksi */}
        <div className="flex-1 min-w-0 flex flex-wrap gap-2 pt-2 medium:pt-0 border-t medium:border-t-0 border-line-soft">
          {STATES_CONFIG.map((state) => {
            const isCurrent = state.key === currentState;
            const Icon = state.icon;
            return (
              <button
                key={state.key}
                type="button"
                onClick={() => onStateChange(state.key)}
                title={`${state.label} (${state.timeSlot}): ${state.description}`}
                className={`px-3 py-1 rounded-field text-xs transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer shrink-0 ${
                  isCurrent
                    ? 'bg-brand text-on-brand font-bold shadow-hairline'
                    : 'bg-surface-subtle text-ink-soft border border-line hover-only:bg-surface-subtle/80 hover-only:text-ink font-medium'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="font-mono whitespace-nowrap">{state.timeSlot}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
