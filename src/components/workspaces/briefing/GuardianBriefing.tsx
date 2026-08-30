/**
 * YAPENDIK SCHOOL OS — STAGE 6-A GUARDIAN BRIEFING
 * Family Compassion & Surat Sore Glass Component
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 * 
 * Rules:
 * - Kamus Keluarga: Friendly parent language, zero pedagogical jargon
 * - Non-surveillance & Non-comparative: Zero scores, zero rankings, zero percentiles (H-07 & FB-04)
 * - Data minimization: Single child context only (FB-09)
 */

import React from 'react';
import { GuardianBriefingData } from '../../../types/briefingTypes';
import { BriefingShell } from './BriefingShell';
import { Sparkles, Heart, Image as ImageIcon, BookOpen, MessageCircle, ArrowRight } from 'lucide-react';

export interface GuardianBriefingProps {
  data: GuardianBriefingData;
  onViewMoments?: () => void;
  onViewDevelopment?: () => void;
}

export const GuardianBriefing: React.FC<GuardianBriefingProps> = ({
  data,
  onViewMoments,
  onViewDevelopment
}) => {
  const { mode, child_name, today_summary, latest_moment, teacher_note, warm_echo } = data;

  return (
    <BriefingShell
      greeting={data.greeting}
      date={data.date_formatted}
      schoolLocalTime={data.school_local_time}
      mode={mode}
    >
      <div className="space-y-4">
        {/* OPERATIONAL MODE: Daytime Story & Latest Moment */}
        {mode === 'OPERASIONAL' && (
          <div className="space-y-3">
            {/* Kabar Hari Ini Narrative Capsule */}
            <div className="p-4 rounded-field bg-surface-subtle space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-brand-deep font-semibold">
                <Heart className="w-4 h-4 text-brand-primary" />
                <span>Kabar {child_name} Hari Ini</span>
              </div>
              <p className="text-sm text-ink leading-relaxed">
                <strong className="font-semibold text-ink">{child_name}</strong> {today_summary.attendance_status.toLowerCase()} di sekolah
                {today_summary.meal_status && ` • ${today_summary.meal_status.toLowerCase()}`}
                {today_summary.active_phase_name && ` • sedang ${today_summary.active_phase_name.toLowerCase()}`}.
              </p>
            </div>

            {/* Momen Terbaru Preview */}
            {latest_moment && (
              <div className="p-3 rounded-field border border-line flex items-center gap-3 bg-surface">
                <div className="w-14 h-14 rounded-control bg-surface-subtle shrink-0 overflow-hidden flex items-center justify-center border border-line-hairline">
                  {latest_moment.thumbnail_url ? (
                    <img
                      src={latest_moment.thumbnail_url}
                      alt={`Momen ${child_name}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback icon if image path is unavailable
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-ink-faint" />
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <span className="text-[11px] text-brand-deep font-semibold uppercase tracking-wider block">
                    Momen Terkini • {latest_moment.captured_at}
                  </span>
                  <p className="text-xs text-ink line-clamp-2 leading-snug">
                    {latest_moment.caption}
                  </p>
                </div>
              </div>
            )}

            {/* Catatan Ibu Guru */}
            {teacher_note && (
              <div className="border-l-2 border-brand-primary pl-3 py-1 text-sm italic font-serif text-ink-soft leading-relaxed">
                "{teacher_note}"
              </div>
            )}

            {/* Dominant Primary CTA */}
            <button
              type="button"
              onClick={onViewMoments}
              className="w-full min-h-[44px] px-4 py-3 rounded-field bg-brand-primary hover-only:bg-brand-deep active:scale-[0.98] text-on-brand font-medium text-sm transition-all shadow-hairline flex items-center justify-center gap-2"
            >
              <span>Lihat Momen & Karya Hari Ini</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* PRATINJAU MODE: Morning Greeting */}
        {mode === 'PRATINJAU' && (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">
              Pintu sekolah dibuka pukul 06:45. Guru dan teman-teman siap menyambut {child_name}.
            </p>
            <button
              type="button"
              onClick={onViewMoments}
              className="w-full min-h-[44px] px-4 py-3 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-brand-primary" />
              <span>Buka Jejak Bermain Kemarin</span>
            </button>
          </div>
        )}

        {/* CLOSURE MODE (Surat Sore) */}
        {mode === 'PENUTUP' && (
          <div className="space-y-3">
            <div className="p-4 rounded-field bg-surface-subtle space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-brand-deep font-semibold">
                <Sparkles className="w-4 h-4 text-brand-primary" />
                <span>Surat Sore untuk Ayah & Bunda</span>
              </div>
              <p className="text-sm text-ink leading-relaxed">
                Hari ini {child_name} telah menyelesaikan kegiatan bermain dan belajar dengan gembira di sekolah. Selamat beristirahat dan berkumpul bersama keluarga malam ini.
              </p>
            </div>

            {/* Warm Echo if available */}
            {warm_echo && (
              <div className="border-l-2 border-brand-primary pl-3 py-1 text-sm italic font-serif text-ink-soft leading-relaxed">
                "{warm_echo.quote_text}"
              </div>
            )}

            {/* Ghost Action [Baca Laporan Perkembangan] */}
            <button
              type="button"
              onClick={onViewDevelopment}
              className="w-full min-h-[44px] px-4 py-3 rounded-field border border-line hover-only:bg-surface-subtle active:scale-[0.98] text-ink font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 text-ink-soft" />
              <span>Baca Rangkuman Perkembangan</span>
            </button>
          </div>
        )}
      </div>
    </BriefingShell>
  );
};
