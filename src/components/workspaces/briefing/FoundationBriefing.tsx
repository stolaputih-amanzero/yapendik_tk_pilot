/**
 * YAPENDIK SCHOOL OS — STAGE 6-A FOUNDATION BRIEFING
 * Strategic Multilateral Loop & Human Reflective Glass Component
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 */

import React, { useState } from 'react';
import { FoundationBriefingData } from '../../../types/briefingTypes';
import { BriefingShell } from './BriefingShell';
import { PrivacyShield } from '../../glass/PrivacyShield';
import { 
  Building2, 
  Activity, 
  ShieldAlert, 
  Scale, 
  ArrowRight, 
  CheckCircle2, 
  Quote, 
  Info 
} from 'lucide-react';

export interface FoundationBriefingProps {
  data: FoundationBriefingData;
  onOpenInsightsConsole?: () => void;
}

export const FoundationBriefing: React.FC<FoundationBriefingProps> = ({
  data,
  onOpenInsightsConsole
}) => {
  const { mode, decision_queue, loop_health, equity_signals, warm_echo } = data;
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <BriefingShell
      greeting={data.greeting}
      date={data.date_formatted}
      schoolLocalTime={data.school_local_time}
      mode={mode}
    >
      <div className="space-y-4">
        {/* OPERATIONAL MODE: 3 Multilateral Strategic Pillars */}
        {mode === 'OPERASIONAL' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2.5">
              {/* 1. Antrean Keputusan Dewan */}
              <div className="p-3 rounded-field bg-surface-subtle space-y-1">
                <div className="flex items-center gap-1 text-xs text-ink-faint">
                  <Building2 className="w-4 h-4 text-brand-primary" />
                  <span>Keputusan</span>
                </div>
                <div className="text-base font-semibold text-ink">
                  {decision_queue.insights_awaiting_decision} Insight
                </div>
                <div className="text-[11px] text-ink-faint">
                  Tertua {decision_queue.oldest_insight_age_days} hari
                </div>
              </div>

              {/* 2. Kesehatan Loop Pembelajaran */}
              <div className="p-3 rounded-field bg-surface-subtle space-y-1">
                <div className="flex items-center gap-1 text-xs text-ink-faint">
                  <Activity className="w-4 h-4 text-success" />
                  <span>Kesehatan Loop</span>
                </div>
                <div className="text-base font-semibold text-ink">
                  {loop_health.actions_awaiting_adoption} Adopsi
                </div>
                <div className="text-[11px] text-ink-faint">
                  {loop_health.outcomes_not_recorded} refleksi tertunda
                </div>
              </div>

              {/* 3. Sinyal Equity & Proteksi Privasi (FB-07) */}
              <div className="p-3 rounded-field bg-surface-subtle space-y-1">
                <div className="flex items-center gap-1 text-xs text-ink-faint">
                  <Scale className="w-4 h-4 text-brand-accent" />
                  <span>Sinyal Equity</span>
                </div>
                <div className="text-base font-semibold text-ink">
                  {equity_signals.new_patterns_detected} Pola
                </div>
                <div className="pt-0.5">
                  <PrivacyShield
                    exposureStatus={equity_signals.suppressed_cohorts > 0 ? 'SUPPRESSED_SMALL_COHORT' : 'VISIBLE'}
                    sampleSize={3}
                    metricLabel="Kohor"
                    metricValue={equity_signals.suppressed_cohorts}
                  />
                </div>
              </div>
            </div>

            {/* Dominant Primary CTA */}
            <button
              type="button"
              onClick={onOpenInsightsConsole}
              className="w-full min-h-[44px] px-4 py-3 rounded-field bg-brand-primary hover-only:bg-brand-deep active:scale-[0.98] text-on-brand font-medium text-sm transition-all shadow-hairline flex items-center justify-center gap-2"
            >
              <span>Telaah Insight Kebijakan</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* H-02 Honest Non-Causal Footnote */}
            <div className="flex items-start gap-1.5 text-[11px] text-ink-faint pt-1">
              <Info className="w-4 h-4 text-ink-faint shrink-0 mt-0.5" />
              <span>
                Asosiasi empiris teramati antarsekolah, bukan kausalitas deterministik (H-02).
              </span>
            </div>
          </div>
        )}

        {/* PRATINJAU MODE */}
        {mode === 'PRATINJAU' && (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">
              Ikhtisar mingguan jaringan sekolah Yapendik siap diproyeksikan untuk peninjauan Dewan.
            </p>
            <button
              type="button"
              onClick={onOpenInsightsConsole}
              className="w-full min-h-[44px] px-4 py-3 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Buka Konsol Yayasan</span>
            </button>
          </div>
        )}

        {/* CLOSURE MODE (Weekly Stewardship Summary) */}
        {mode === 'PENUTUP' && (
          <div className="space-y-3">
            {isCompleted ? (
              <div className="p-3 rounded-field bg-surface-subtle text-xs text-ink-soft flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Siklus peninjauan minggu ini selesai. Rekam data terlindungi secara aman.</span>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                  <span>Siklus Pembelajaran Mingguan Tuntas</span>
                  <span>•</span>
                  <span className="text-success-deep font-medium">Privasi K-Anonymity Terjaga</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCompleted(true)}
                  className="w-full min-h-[44px] px-4 py-3 rounded-field border border-line hover-only:bg-surface-subtle active:scale-[0.98] text-ink font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-ink-soft" />
                  <span>Selesai Minggu Ini</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* WARM ECHO (Headmaster Reflection Voice to Foundation) */}
        {warm_echo && (
          <div className="border-l-2 border-brand-primary pl-3 py-1 mt-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-ink-faint">
              <Quote className="w-4 h-4 text-brand-primary" />
              <span>Suara Satuan Pendidikan • {warm_echo.source_author}</span>
            </div>
            <p className="text-sm italic font-serif text-ink-soft leading-relaxed">
              "{warm_echo.quote_text}"
            </p>
          </div>
        )}
      </div>
    </BriefingShell>
  );
};
