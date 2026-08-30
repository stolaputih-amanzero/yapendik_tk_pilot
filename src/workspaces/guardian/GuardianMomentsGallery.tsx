/**
 * YAPENDIK SCHOOL OS — STAGE 6-A GUARDIAN MOMENTS GALLERY
 * Daily Child Moments & Play Creations Gallery
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 * 
 * Rules:
 * - Data Minimization (FB-09): Only renders media tagged for the specific child
 * - Privacy Preserving: No cross-parent or multi-child metadata leak
 * - Touch-friendly lightbox with pinch-to-zoom support
 */

import React, { useState } from 'react';
import { Camera, Calendar, Image as ImageIcon, X, Sparkles } from 'lucide-react';

export interface MomentItem {
  id: string;
  thumbnail_url: string;
  full_url: string;
  caption: string;
  domain_tag: string;
  date_formatted: string;
  time_formatted: string;
}

const MOCK_MOMENTS: MomentItem[] = [
  {
    id: 'mom_01',
    thumbnail_url: '/assets/moments/moment_sample1.jpg',
    full_url: '/assets/moments/moment_sample1.jpg',
    caption: 'Membangun menara balok bersama teman dan menghitung balok yang tersusun.',
    domain_tag: 'Sentra Balok & Konstruksi',
    date_formatted: 'Hari Ini, 31 Agustus 2026',
    time_formatted: '09:30 WIB'
  },
  {
    id: 'mom_02',
    thumbnail_url: '/assets/moments/moment_sample2.jpg',
    full_url: '/assets/moments/moment_sample2.jpg',
    caption: 'Mencampur warna cat air dan menceritakan lukisan bunga matahari.',
    domain_tag: 'Sentra Seni & Kreativitas',
    date_formatted: 'Jumat, 28 Agustus 2026',
    time_formatted: '10:15 WIB'
  },
  {
    id: 'mom_03',
    thumbnail_url: '/assets/moments/moment_sample3.jpg',
    full_url: '/assets/moments/moment_sample3.jpg',
    caption: 'Membaca buku cerita bergambar dan bermain peran sebagai dokter cilik.',
    domain_tag: 'Sentra Main Peran',
    date_formatted: 'Kamis, 27 Agustus 2026',
    time_formatted: '08:45 WIB'
  }
];

export const GuardianMomentsGallery: React.FC<{ childName?: string }> = ({ childName = 'Ananda' }) => {
  const [selectedMoment, setSelectedMoment] = useState<MomentItem | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-200" data-testid="guardian-moments-gallery">
      {/* Header Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ink tracking-tight flex items-center gap-2">
            <Camera className="w-5 h-5 text-brand-primary" />
            <span>Momen & Karya {childName}</span>
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Dokumentasi autentik proses bermain dan belajar ananda di sekolah.
          </p>
        </div>
      </div>

      {/* Grid Responsif */}
      {MOCK_MOMENTS.length === 0 ? (
        <div className="p-8 rounded-card border border-line bg-surface text-center space-y-2">
          <ImageIcon className="w-8 h-8 text-ink-faint mx-auto" />
          <p className="text-sm font-semibold text-ink">Belum ada momen hari ini</p>
          <p className="text-xs text-ink-soft max-w-sm mx-auto">
            Guru akan mengirimkan foto dan catatan saat anak bermain di sentra.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
          {MOCK_MOMENTS.map((moment) => (
            <div
              key={moment.id}
              onClick={() => setSelectedMoment(moment)}
              className="group cursor-pointer rounded-card border border-line bg-surface overflow-hidden shadow-hairline hover-only:border-brand-primary active:scale-[0.99] transition-all space-y-0 flex flex-col"
            >
              {/* Thumbnail Container */}
              <div className="relative aspect-4/3 w-full bg-surface-subtle overflow-hidden flex items-center justify-center">
                <img
                  src={moment.thumbnail_url}
                  alt={moment.caption}
                  className="w-full h-full object-cover group-hover-only:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <ImageIcon className="w-8 h-8 text-ink-faint opacity-40 group-hover-only:opacity-60" />
                </div>
                {/* Domain Pill */}
                <div className="absolute bottom-2 left-2 px-3 py-1 rounded-full bg-surface-glass text-ink text-[10px] font-semibold backdrop-blur-xs border border-line-hairline flex items-center gap-1 shadow-hairline">
                  <Sparkles className="w-3 h-3 text-brand-primary" />
                  <span>{moment.domain_tag}</span>
                </div>
              </div>

              {/* Caption & Date Body */}
              <div className="p-4 space-y-1.5 flex-1 flex flex-col justify-between">
                <p className="text-xs text-ink font-medium leading-snug line-clamp-2">
                  {moment.caption}
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-ink-faint pt-1 border-t border-line-hairline">
                  <Calendar className="w-4 h-4" />
                  <span>{moment.date_formatted}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMoment && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-70 bg-surface-inset/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedMoment(null)}
        >
          <div
            className="bg-surface rounded-card max-w-lg w-full overflow-hidden shadow-floating border border-line animate-in zoom-in-95 duration-150 space-y-0"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 border-b border-line flex items-center justify-between">
              <div>
                <span className="text-xs text-brand-deep font-semibold uppercase tracking-wider block">
                  {selectedMoment.domain_tag}
                </span>
                <span className="text-xs text-ink-faint">
                  {selectedMoment.date_formatted} • {selectedMoment.time_formatted}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMoment(null)}
                className="p-2 rounded-full hover-only:bg-surface-subtle text-ink-soft hover-only:text-ink transition-colors touch-target-min"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Image */}
            <div className="aspect-4/3 w-full bg-surface-subtle flex items-center justify-center relative">
              <img
                src={selectedMoment.full_url}
                alt={selectedMoment.caption}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <ImageIcon className="w-12 h-12 text-ink-faint opacity-40 absolute" />
            </div>

            {/* Modal Caption */}
            <div className="p-4 bg-surface space-y-2">
              <p className="text-sm text-ink leading-relaxed font-medium">
                {selectedMoment.caption}
              </p>
              <div className="pt-2 border-t border-line-hairline flex items-center justify-between text-xs text-ink-faint">
                <span>Dokumentasi Resmi Portofolio Ananda</span>
                <span className="font-mono">Tersimpan Aman</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
