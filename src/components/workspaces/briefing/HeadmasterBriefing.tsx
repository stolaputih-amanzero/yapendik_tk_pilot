/**
 * YAPENDIK SCHOOL OS — STAGE 6-A HEADMASTER BRIEFING
 * Headmaster Authority Machine & Reconciliation Glass Component
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 */

import React, { useState } from 'react';
import { HeadmasterBriefingData } from '../../../types/briefingTypes';
import { BriefingShell } from './BriefingShell';
import { ShieldCheck, FileCheck, Users, ArrowRight, CheckCircle2, Quote } from 'lucide-react';

export interface HeadmasterBriefingProps {
  data: HeadmasterBriefingData;
  onOpenAuthorityQueue?: () => void;
}

export const HeadmasterBriefing: React.FC<HeadmasterBriefingProps> = ({
  data,
  onOpenAuthorityQueue
}) => {
  const { mode, reconciliation, authority_queue, partnership_pulse, warm_echo, closure_summary } = data;
  const [isCompleted, setIsCompleted] = useState(false);

  return (
    <BriefingShell
      greeting={data.greeting}
      date={data.date_formatted}
      schoolLocalTime={data.school_local_time}
      mode={mode}
    >
      <div className="space-y-4">
        {/* OPERATIONAL MODE: 3 Managerial Metric Pillars */}
        {mode === 'OPERASIONAL' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2.5">
              {/* 1. Rekonsiliasi Kelas */}
              <div className="p-3 rounded-field bg-surface-subtle space-y-1">
                <div className="flex items-center gap-1 text-xs text-ink-faint">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span>Rekonsiliasi</span>
                </div>
                <div className="text-base font-semibold text-ink">
                  {reconciliation.classes_complete === 0 ? (
                    <span className="text-xs font-medium text-ink-soft">Menunggu</span>
                  ) : (
                    `${reconciliation.classes_complete}/${reconciliation.classes_total}`
                  )}
                </div>
                <div className="text-[11px] text-ink-faint">
                  {reconciliation.classes_complete === 0 ? 'Wali kelas absen' : 'Kelas tuntas'}
                </div>
              </div>

              {/* 2. Antrean Otoritas */}
              <div className="p-3 rounded-field bg-surface-subtle space-y-1">
                <div className="flex items-center gap-1 text-xs text-ink-faint">
                  <FileCheck className="w-4 h-4 text-brand-primary" />
                  <span>Otoritas</span>
                </div>
                <div className="text-base font-semibold text-ink">
                  {authority_queue.pending_lppa_approvals} LPPA
                </div>
                <div className="text-[11px] text-ink-faint">Menunggu sah</div>
              </div>

              {/* 3. Kemitraan Ortu */}
              <div className="p-3 rounded-field bg-surface-subtle space-y-1">
                <div className="flex items-center gap-1 text-xs text-ink-faint">
                  <Users className="w-4 h-4 text-brand-accent" />
                  <span>Kemitraan</span>
                </div>
                <div className="text-base font-semibold text-ink">
                  {partnership_pulse.unread_messages} Pesan
                </div>
                <div className="text-[11px] text-ink-faint">Buku penghubung</div>
              </div>
            </div>

            {/* Progressive Guidance for 06:30 Morning Calm (Amanaura Part VI §6.4) */}
            {reconciliation.classes_complete === 0 && authority_queue.pending_lppa_approvals === 0 && (
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-subtle border border-line-hairline text-xs text-ink-soft animate-in fade-in">
                <span className="w-2 h-2 rounded-full bg-ink-faint shrink-0" />
                <span>Menunggu rekonsiliasi presensi pagi dari Wali Kelas...</span>
              </div>
            )}

            {/* Dominant Primary Action */}
            <button
              type="button"
              onClick={onOpenAuthorityQueue}
              className="w-full min-h-[44px] px-4 py-3 rounded-field bg-brand-primary hover-only:bg-brand-deep active:scale-[0.98] text-on-brand font-medium text-sm transition-all shadow-hairline flex items-center justify-center gap-2"
            >
              <span>Tinjau Antrean Otoritas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PRATINJAU MODE */}
        {mode === 'PRATINJAU' && (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">
              Rekonsiliasi pagi dan antrean tanda tangan siap ditinjau sebelum jam operasional dimulai.
            </p>
            <button
              type="button"
              onClick={onOpenAuthorityQueue}
              className="w-full min-h-[44px] px-4 py-3 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <span>Buka Antrean Hari Ini</span>
            </button>
          </div>
        )}

        {/* CLOSURE MODE */}
        {mode === 'PENUTUP' && (
          <div className="space-y-3">
            {isCompleted ? (
              <div className="p-3 rounded-field bg-surface-subtle text-xs text-ink-soft flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Otoritas operasional hari ini telah tuntas. Selamat beristirahat.</span>
              </div>
            ) : (
              <>
                <div className="flex flex-wrap items-center gap-2 text-xs text-ink-soft">
                  <span>{closure_summary?.lppa_approved_today ?? 2} LPPA disahkan</span>
                  <span>•</span>
                  <span>{closure_summary?.directives_responded_today ?? 1} direktif direspons</span>
                  <span>•</span>
                  <span className="text-success-deep font-medium">Status sekolah aman</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsCompleted(true)}
                  className="w-full min-h-[44px] px-4 py-3 rounded-field border border-line hover-only:bg-surface-subtle active:scale-[0.98] text-ink font-medium text-sm transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-ink-soft" />
                  <span>Selesai Hari Ini</span>
                </button>
              </>
            )}
          </div>
        )}

        {/* WARM ECHO (Teacher Reflection for Headmaster) */}
        {warm_echo && (
          <div className="border-l-2 border-brand-primary pl-3 py-1 mt-3 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-ink-faint">
              <Quote className="w-4 h-4 text-brand-primary" />
              <span>Refleksi Pendidik • {warm_echo.source_author}</span>
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
