/**
 * YAPENDIK SCHOOL OS — AMANAURA DESIGN SYSTEM v4.0
 * Pedagogical Rating Pill (Amanaura Canonical Primitive)
 * 
 * 1-Tap Formative Assessment Control for Kurikulum Merdeka PAUD:
 * - BB: Belum Berkembang
 * - MB: Mulai Berkembang
 * - BSH: Berkembang Sesuai Harapan
 * - BSB: Berkembang Sangat Baik
 * 
 * Enforces:
 * - Touch Target Boundaries (Hukum 7.8.1): min-h >= 48dp, min-w >= 48dp
 * - Token Purity: warning, info, success, lppa semantic palettes
 * - Zero Emoji Clutter (Hukum 11 / Lucide icons only)
 * - Zero-Surveillance Doctrine (H-07): Qualitative mastery indicators, not scores
 */

import React from 'react';
import { MilestoneRating } from '../../domain/types';
import { Sparkles, CheckCircle2, TrendingUp, HelpCircle } from 'lucide-react';

export interface PedagogicalRatingPillProps {
  value?: MilestoneRating | string;
  onChange?: (rating: MilestoneRating) => void;
  isReadOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const RATING_CONFIG: Record<MilestoneRating, {
  label: string;
  fullName: string;
  description: string;
  activeClass: string;
  inactiveClass: string;
  icon: any;
}> = {
  BB: {
    label: 'BB',
    fullName: 'Belum Berkembang',
    description: 'Ananda masih memerlukan bimbingan intensif dari guru dan orang tua.',
    activeClass: 'bg-warning-tint text-warning-deep border-warning-line ring-1 ring-warning shadow-sm font-black',
    inactiveClass: 'bg-surface text-ink-soft border-line hover-only:bg-surface-subtle',
    icon: HelpCircle
  },
  MB: {
    label: 'MB',
    fullName: 'Mulai Berkembang',
    description: 'Ananda mulai menunjukkan ketertarikan dan mencoba dengan dorongan berkala.',
    activeClass: 'bg-info-tint text-info-deep border-info-line ring-1 ring-info shadow-sm font-black',
    inactiveClass: 'bg-surface text-ink-soft border-line hover-only:bg-surface-subtle',
    icon: TrendingUp
  },
  BSH: {
    label: 'BSH',
    fullName: 'Berkembang Sesuai Harapan',
    description: 'Ananda telah mencapai indikator perkembangan secara mandiri dan konsisten.',
    activeClass: 'bg-success-tint text-success-deep border-success-line ring-1 ring-success shadow-sm font-black',
    inactiveClass: 'bg-surface text-ink-soft border-line hover-only:bg-surface-subtle',
    icon: CheckCircle2
  },
  BSB: {
    label: 'BSB',
    fullName: 'Berkembang Sangat Baik',
    description: 'Ananda melampaui capaian, berinisiatif tinggi, dan dapat membantu temannya.',
    activeClass: 'bg-lppa-tint text-lppa-deep border-lppa-line ring-1 ring-lppa shadow-sm font-black',
    inactiveClass: 'bg-surface text-ink-soft border-line hover-only:bg-surface-subtle',
    icon: Sparkles
  }
};

export const PedagogicalRatingPill: React.FC<PedagogicalRatingPillProps> = ({
  value,
  onChange,
  isReadOnly = false,
  size = 'md',
  showLabel = true,
  className = ''
}) => {
  const ratings: MilestoneRating[] = ['BB', 'MB', 'BSH', 'BSB'];

  if (isReadOnly) {
    const currentRating = (value as MilestoneRating) || 'BSH';
    const cfg = RATING_CONFIG[currentRating] || RATING_CONFIG.BSH;
    const Icon = cfg.icon;

    return (
      <div 
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl border text-xs font-bold ${cfg.activeClass} ${className}`}
        title={`${cfg.fullName} — ${cfg.description}`}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span>{cfg.label}</span>
        {showLabel && <span className="text-[11px] font-medium opacity-90">• {cfg.fullName}</span>}
      </div>
    );
  }

  return (
    <div 
      className={`inline-flex items-center gap-2 flex-wrap ${className}`}
      role="group" 
      aria-label="Pemilihan Rating Capaian Perkembangan"
    >
      {ratings.map((r) => {
        const cfg = RATING_CONFIG[r];
        const isSelected = value === r;
        const Icon = cfg.icon;

        return (
          <button
            key={r}
            type="button"
            onClick={() => onChange && onChange(r)}
            disabled={isReadOnly}
            title={`${cfg.fullName}: ${cfg.description}`}
            className={`min-h-[48px] min-w-[48px] px-3.5 py-2 rounded-2xl border text-xs transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              isSelected ? cfg.activeClass : cfg.inactiveClass
            } active:scale-95 select-none`}
            aria-pressed={isSelected}
          >
            <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'opacity-100' : 'opacity-60'}`} />
            <span className="font-bold">{cfg.label}</span>
            {showLabel && (
              <span className="hidden medium:inline text-[10px] font-medium opacity-80">
                ({cfg.fullName})
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
