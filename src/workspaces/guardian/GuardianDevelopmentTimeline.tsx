/**
 * YAPENDIK SCHOOL OS — STAGE 6-A GUARDIAN DEVELOPMENT TIMELINE
 * Qualitative Child Growth & Ratified LPPA Narrative Reader
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 * 
 * Rules:
 * - Kamus Keluarga: Friendly growth domains (Nilai Agama & Budi Pekerti, Jati Diri, Dasar Literasi & STEAM)
 * - Zero-Comparative Doctrine (H-07): Zero scores, zero rankings, zero percentiles
 * - Authority Boundary (FB-04): Only renders LPPA ratified by Headmaster
 */

import React, { useState } from 'react';
import { BookOpen, FileCheck, CheckCircle2, Heart, Sparkles, X, ChevronRight, ShieldCheck } from 'lucide-react';

export interface GuardianDevelopmentTimelineProps {
  childName?: string;
}

export const GuardianDevelopmentTimeline: React.FC<GuardianDevelopmentTimelineProps> = ({
  childName = 'Kenzo'
}) => {
  const [activeSemester, setActiveSemester] = useState<'GANJIL' | 'GENAP'>('GANJIL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-200" data-testid="guardian-development-timeline">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-ink tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-primary" />
          <span>Perkembangan & Laporan {childName}</span>
        </h2>
        <p className="text-xs text-ink-soft mt-0.5">
          Catatan pertumbuhan holistik ananda berdasarkan observasi mendalam guru.
        </p>
      </div>

      {/* Semester Stepper Navigation */}
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => setActiveSemester('GANJIL')}
          className={`min-h-[44px] px-4 py-2 rounded-field text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSemester === 'GANJIL'
              ? 'bg-brand-primary text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:text-ink'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Semester Ganjil 2026/2027</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSemester('GENAP')}
          className={`min-h-[44px] px-4 py-2 rounded-field text-xs font-semibold transition-all flex items-center gap-2 ${
            activeSemester === 'GENAP'
              ? 'bg-brand-primary text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:text-ink'
          }`}
        >
          <span>Semester Genap 2026/2027</span>
        </button>
      </div>

      {/* Growth Summary Card (Kamus Keluarga) */}
      <div className="p-4 rounded-card border border-line bg-surface space-y-4 shadow-hairline">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-brand-accent" />
            <span className="text-sm font-bold text-ink">
              Rangkuman Capaian {childName}
            </span>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-success-tint text-success-deep font-semibold flex items-center gap-1 border border-success-line">
            <ShieldCheck className="w-4 h-4" />
            <span>Disahkan Kepala Sekolah</span>
          </span>
        </div>

        {/* 3 Domain Capsules in Kamus Keluarga */}
        <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {/* Domain 1 */}
          <div className="p-3 rounded-field bg-surface-subtle space-y-1.5 border border-line-hairline">
            <div className="flex items-center gap-1.5 text-xs text-brand-deep font-bold">
              <Heart className="w-4 h-4 text-brand-primary" />
              <span>Nilai Agama & Karakter</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              {childName} terbiasa berdoa sebelum bermain, menyayangi teman, dan selalu merapikan mainan bersama-sama.
            </p>
          </div>

          {/* Domain 2 */}
          <div className="p-3 rounded-field bg-surface-subtle space-y-1.5 border border-line-hairline">
            <div className="flex items-center gap-1.5 text-xs text-brand-deep font-bold">
              <Sparkles className="w-4 h-4 text-brand-accent" />
              <span>Jati Diri & Kemandirian</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Percaya diri dalam memilih aktivitas sentra, mandiri saat makan bekal, dan mampu mengekspresikan perasaannya.
            </p>
          </div>

          {/* Domain 3 */}
          <div className="p-3 rounded-field bg-surface-subtle space-y-1.5 border border-line-hairline">
            <div className="flex items-center gap-1.5 text-xs text-brand-deep font-bold">
              <BookOpen className="w-4 h-4 text-success-deep" />
              <span>Literasi & Eksplorasi STEAM</span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed">
              Gemar menyusun pola balok tinggi, antusias mendengarkan cerita bergambar, dan aktif bertanya saat observasi sains alam.
            </p>
          </div>
        </div>

        {/* CTA to Full Ratified LPPA */}
        <button
          type="button"
          onClick={() => setIsReportModalOpen(true)}
          className="w-full min-h-[44px] px-4 py-3 rounded-field bg-brand-primary hover-only:bg-brand-deep active:scale-[0.98] text-on-brand font-medium text-sm transition-all shadow-hairline flex items-center justify-center gap-2"
        >
          <FileCheck className="w-4 h-4" />
          <span>Baca Laporan Perkembangan Utuh (LPPA)</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Full LPPA Reader Modal */}
      {isReportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-70 bg-surface-inset/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className="bg-surface rounded-card max-w-2xl w-full max-h-[85dvh] overflow-y-auto shadow-floating border border-line animate-in zoom-in-95 duration-150 p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs text-brand-deep font-bold uppercase tracking-wider block">
                  Laporan Perkembangan Peserta Didik (LPPA)
                </span>
                <h3 className="text-lg font-bold text-ink">
                  {childName} • Semester Ganjil 2026/2027
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 rounded-full hover-only:bg-surface-subtle text-ink-soft hover-only:text-ink transition-colors touch-target-min"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Narrative Body */}
            <div className="space-y-4 text-sm text-ink leading-relaxed">
              <section className="space-y-2">
                <h4 className="font-bold text-ink text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-primary" />
                  <span>I. Capaian Pembelajaran & Perkembangan</span>
                </h4>
                <p className="text-xs text-ink-soft pl-4">
                  Ananda {childName} menunjukkan kemajuan yang sangat menggembirakan dalam mengeksplorasi lingkungan sekolah. Di sentra balok, {childName} mampu merancang bangunan bertingkat dengan keseimbangan yang baik, serta menjelaskan ide karyanya kepada teman sebaya secara runtut.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-ink text-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-accent" />
                  <span>II. Refleksi & Penguatan di Rumah</span>
                </h4>
                <p className="text-xs text-ink-soft pl-4">
                  Bunda dan Ayah disarankan untuk terus mendampingi ananda membacakan buku cerita sebelum tidur dan memberikan kesempatan menceritakan kembali tokoh yang disukainya.
                </p>
              </section>

              {/* Ratification Badge */}
              <div className="p-4 rounded-field bg-surface-subtle border border-line-hairline flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-success" />
                  <span className="text-ink font-semibold">Telah Disahkan oleh Kepala Sekolah</span>
                </div>
                <span className="text-ink-faint font-mono">Yapendik Certified</span>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="min-h-[44px] px-4 py-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink font-medium text-xs transition-colors"
              >
                Tutup Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
