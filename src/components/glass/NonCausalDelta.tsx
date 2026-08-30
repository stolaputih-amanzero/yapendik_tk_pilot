/**
 * Yapendik School OS — The Glass Layer
 * NonCausalDelta Component (H-02 & FB-05 Honest Non-Causal Semantics)
 */

import React from 'react';
import { TrendingUp, TrendingDown, Minus, Quote, Sparkles, Scale } from 'lucide-react';

export interface NonCausalDeltaProps {
  baselineValue: number;
  outcomeValue: number;
  delta: number;
  unit?: string;
  qualitativeReflection: string;
  evaluatedAt?: string;
  className?: string;
}

export const NonCausalDelta: React.FC<NonCausalDeltaProps> = ({
  baselineValue,
  outcomeValue,
  delta,
  unit = '%',
  qualitativeReflection,
  evaluatedAt,
  className = ''
}) => {
  const isPositive = delta > 0;
  const isNegative = delta < 0;
  const deltaString = isPositive ? `+${delta.toFixed(1)}` : delta.toFixed(1);

  return (
    <div 
      className={`bg-surface border border-line rounded-field p-4 shadow-hairline space-y-3 ${className}`}
      data-testid="non-causal-delta-card"
    >
      {/* 1. Metric Header & Delta Display */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] medium:text-[11px] text-ink-soft font-bold uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-ink-faint shrink-0" />
            <span className="truncate">Dinamika Capaian Teramati</span>
          </div>
          
          {/* Delta Badge */}
          <div 
            className={`inline-flex items-center gap-1 px-2 py-1 medium:px-2 medium:py-1 rounded-full text-[10px] medium:text-xs font-mono font-bold shrink-0 ${
              isPositive
                ? 'bg-success-tint text-success-deep border border-success-line'
                : isNegative
                ? 'bg-warning-tint text-warning-deep border border-warning-line'
                : 'bg-surface-subtle text-ink-soft border border-line'
            }`}
            data-testid="delta-badge"
          >
            {isPositive && <TrendingUp className="w-4 h-4" />}
            {isNegative && <TrendingDown className="w-4 h-4" />}
            {!isPositive && !isNegative && <Minus className="w-4 h-4" />}
            <span>{`Δ ${deltaString}${unit}`}</span>
          </div>
        </div>

        {/* Numbers */}
        <div className="flex items-center gap-2 medium:gap-4 bg-surface-subtle p-2 medium:p-3 rounded-lg border border-line-soft">
          <div className="flex-1">
            <div className="text-[10px] font-medium text-ink-faint uppercase tracking-wider tracking-wide">Baseline</div>
            <div className="text-sm medium:text-base font-mono font-bold text-ink-soft">{baselineValue.toFixed(1)}{unit}</div>
          </div>
          <div className="text-ink-faint shrink-0 px-2">
            <span className="text-lg">→</span>
          </div>
          <div className="flex-1 text-right">
            <div className="text-[10px] font-medium text-ink-faint uppercase tracking-wider tracking-wide">Pasca-Aksi</div>
            <div className="text-sm medium:text-base font-mono font-black text-ink">{outcomeValue.toFixed(1)}{unit}</div>
          </div>
        </div>
      </div>

      {/* 2. Qualitative Human Reflection Callout */}
      <div className="bg-surface-subtle/80 border-l-2 border-warning-deep rounded-r-lg p-3 text-xs text-ink-soft space-y-1">
        <div className="flex items-center gap-1 font-semibold text-ink text-[11px]">
          <Quote className="w-3 h-3 text-brand-primary" />
          <span>Refleksi Kualitatif Pendidik / Kepala Sekolah:</span>
        </div>
        <p className="italic text-ink-soft leading-relaxed font-serif pl-2">
          {`"${qualitativeReflection}"`}
        </p>
        {evaluatedAt && (
          <div className="text-[10px] text-ink-faint pt-1 text-right">
            {`Dicatat pada: ${new Date(evaluatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
          </div>
        )}
      </div>

      {/* 3. Mandatory Micro-Typography Ethical Footnote */}
      <div 
        className="pt-2 border-t border-line-soft text-[10px] text-ink-faint leading-tight flex items-start gap-1"
        data-testid="ethical-footnote"
      >
        <Sparkles className="w-3 h-3 text-brand-primary/70 shrink-0 mt-0.5" />
        <span className="max-w-prose text-justify">
          <strong className="text-ink-soft">Catatan Pengamatan:</strong> Angka kenaikan persentase ini adalah hasil pengamatan di lapangan, bukan bukti mutlak bahwa kebijakan tersebut adalah satu-satunya penyebab perubahan.
        </span>
      </div>
    </div>
  );
};
