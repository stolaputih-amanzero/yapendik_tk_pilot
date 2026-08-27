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
      className={`bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3 ${className}`}
      data-testid="non-causal-delta-card"
    >
      {/* 1. Metric Header & Delta Display */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="text-[10px] sm:text-[11px] text-slate-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Dinamika Capaian Teramati</span>
          </div>
          
          {/* Delta Badge */}
          <div 
            className={`inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold shrink-0 ${
              isPositive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : isNegative
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-slate-50 text-slate-600 border border-slate-200'
            }`}
            data-testid="delta-badge"
          >
            {isPositive && <TrendingUp className="w-3.5 h-3.5" />}
            {isNegative && <TrendingDown className="w-3.5 h-3.5" />}
            {!isPositive && !isNegative && <Minus className="w-3.5 h-3.5" />}
            <span>{`Δ ${deltaString}${unit}`}</span>
          </div>
        </div>

        {/* Numbers */}
        <div className="flex items-center gap-2 sm:gap-4 bg-slate-50 p-2.5 sm:p-3 rounded-lg border border-slate-100">
          <div className="flex-1">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Baseline</div>
            <div className="text-sm sm:text-base font-mono font-bold text-slate-600">{baselineValue.toFixed(1)}{unit}</div>
          </div>
          <div className="text-slate-300 shrink-0 px-2">
            <span className="text-lg">→</span>
          </div>
          <div className="flex-1 text-right">
            <div className="text-[10px] font-medium text-slate-400 uppercase tracking-wide">Pasca-Aksi</div>
            <div className="text-sm sm:text-base font-mono font-black text-slate-900">{outcomeValue.toFixed(1)}{unit}</div>
          </div>
        </div>
      </div>

      {/* 2. Qualitative Human Reflection Callout */}
      <div className="bg-slate-50/80 border-l-2 border-amber-500 rounded-r-lg p-3 text-xs text-slate-700 space-y-1">
        <div className="flex items-center gap-1 font-semibold text-slate-900 text-[11px]">
          <Quote className="w-3 h-3 text-amber-600" />
          <span>Refleksi Kualitatif Pendidik / Kepala Sekolah:</span>
        </div>
        <p className="italic text-slate-600 leading-relaxed font-serif pl-2">
          {`"${qualitativeReflection}"`}
        </p>
        {evaluatedAt && (
          <div className="text-[10px] text-slate-400 pt-1 text-right">
            {`Dicatat pada: ${new Date(evaluatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`}
          </div>
        )}
      </div>

      {/* 3. Mandatory Micro-Typography Ethical Footnote */}
      <div 
        className="pt-2 border-t border-slate-100 text-[10px] text-slate-400 leading-tight flex items-start gap-1"
        data-testid="ethical-footnote"
      >
        <Sparkles className="w-3 h-3 text-amber-500/70 shrink-0 mt-0.5" />
        <span className="max-w-prose text-justify">
          <strong className="text-slate-500">Catatan Pengamatan:</strong> Angka kenaikan persentase ini adalah hasil pengamatan di lapangan, bukan bukti mutlak bahwa kebijakan tersebut adalah satu-satunya penyebab perubahan.
        </span>
      </div>
    </div>
  );
};
