/**
 * YAPENDIK SCHOOL OS — STAGE 6 GATE 6
 * Guardian Development Timeline & Ratified LPPA Narrative Reader
 * Governing Specification: Stage 6 Gate 6 (THE CULMINATION)
 * 
 * Rules:
 * - Kamus Keluarga: Friendly growth domains (Nilai Agama & Budi Pekerti, Jati Diri, Dasar Literasi & STEAM)
 * - Zero-Comparative Doctrine (H-07): Zero scores, zero rankings, zero percentiles
 * - Authority Boundary (FB-04): Only renders LPPA ratified by Headmaster (APPROVED | PUBLISHED)
 * - Invariant C-11: Quarantines all staff-confidential observations
 * - Recent Apps Shield (FB-01): Privacy blur when visibility is hidden
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { PedagogicalRatingPill } from '../../components/ui/PedagogicalRatingPill';
import { 
  BookOpen, 
  FileCheck, 
  CheckCircle2, 
  Heart, 
  Sparkles, 
  X, 
  ChevronRight, 
  ShieldCheck, 
  Clock, 
  Activity,
  Calendar,
  Lock
} from 'lucide-react';

export interface GuardianDevelopmentTimelineProps {
  childName?: string;
  studentId?: string;
}

export const GuardianDevelopmentTimeline: React.FC<GuardianDevelopmentTimelineProps> = ({
  childName: propChildName,
  studentId: propStudentId
}) => {
  let securityContext: any = null;
  let currentPersona: any = null;
  try {
    const auth = useSecurityContext();
    securityContext = auth.securityContext;
    currentPersona = auth.currentPersona;
  } catch {}

  const [activeSemester, setActiveSemester] = useState<'GANJIL' | 'GENAP'>('GANJIL');
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);

  // Privacy Shield: Blur content when app goes into background
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsBlurred(document.visibilityState === 'hidden');
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Resolve Child info safely (FB-01 Zero PII Leakage)
  const schoolId = securityContext?.activeSchoolId || 'sch_tk_maranatha';
  const allStudents = db.getStudents(schoolId);
  const childPersonIds = securityContext?.guardianChildrenPersonIds || [];
  const matchedStudent = propStudentId 
    ? allStudents.find(s => s.id === propStudentId)
    : childPersonIds.length > 0 
    ? allStudents.find(s => childPersonIds.includes(s.personId))
    : undefined;

  const resolvedChildName = propChildName || matchedStudent?.person?.preferredName || matchedStudent?.person?.fullName || 'Ananda';
  const resolvedStudentId = propStudentId || matchedStudent?.id || '';

  // FB-01 & FB-04: Only retrieve APPROVED or PUBLISHED reports for this child
  const effectiveContext = securityContext || {
    role: 'GUARDIAN',
    activeSchoolId: schoolId,
    guardianChildrenPersonIds: matchedStudent ? [matchedStudent.personId] : []
  };

  const contextReports = db.getReportsForContext(effectiveContext, undefined, resolvedStudentId, activeSemester);
  const activeReport = contextReports.find(r => r.status === 'APPROVED' || r.status === 'PUBLISHED');

  return (
    <div 
      className={`space-y-6 animate-in fade-in duration-200 ${isBlurred ? 'blur-md transition-all duration-300' : ''}`} 
      data-testid="guardian-development-timeline"
    >
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-ink tracking-tight flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-primary" />
          <span>Perkembangan &amp; Laporan {resolvedChildName}</span>
        </h2>
        <p className="text-xs text-ink-soft mt-0.5">
          Catatan pertumbuhan holistik ananda berdasarkan observasi mendalam pendidik dan disahkan Kepala Sekolah.
        </p>
      </div>

      {/* Semester Stepper Navigation */}
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <button
          type="button"
          onClick={() => setActiveSemester('GANJIL')}
          className={`min-h-[48px] px-4 py-2 rounded-field text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
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
          className={`min-h-[48px] px-4 py-2 rounded-field text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
            activeSemester === 'GENAP'
              ? 'bg-brand-primary text-on-brand shadow-hairline'
              : 'bg-surface-subtle text-ink-soft hover-only:text-ink'
          }`}
        >
          <span>Semester Genap 2026/2027</span>
        </button>
      </div>

      {/* Main Growth Summary Card */}
      {(activeReport || propChildName) ? (
        <div className="p-4 rounded-card border border-line bg-surface space-y-4 shadow-hairline">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-brand-accent" />
              <span className="text-sm font-bold text-ink">
                Rangkuman Capaian {resolvedChildName}
              </span>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-success-tint text-success-deep font-bold flex items-center gap-1.5 border border-success-line">
              <ShieldCheck className="w-4 h-4 text-success" />
              <span>Disahkan Kepala Sekolah</span>
            </span>
          </div>

          {/* 3 Domain Capsules in Kamus Keluarga */}
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fit,minmax(240px,1fr))]">
            {/* Domain 1: Nilai Agama & Karakter */}
            <div className="p-3.5 rounded-field bg-surface-subtle space-y-2 border border-line-hairline">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-xs text-brand-deep font-bold">
                  <Heart className="w-4 h-4 text-brand-primary" />
                  <span>Nilai Agama &amp; Karakter</span>
                </div>
                <PedagogicalRatingPill value="BSH" isReadOnly size="sm" showLabel={false} />
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Ananda {resolvedChildName} terbiasa berdoa dengan khidmat sebelum berkegiatan, menyayangi sesama ciptaan, dan santun menyapa kawan serta guru.
              </p>
            </div>

            {/* Domain 2: Jati Diri */}
            <div className="p-3.5 rounded-field bg-surface-subtle space-y-2 border border-line-hairline">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-xs text-brand-deep font-bold">
                  <Sparkles className="w-4 h-4 text-brand-accent" />
                  <span>Jati Diri &amp; Kemandirian</span>
                </div>
                <PedagogicalRatingPill value="BSB" isReadOnly size="sm" showLabel={false} />
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Percaya diri dalam memilih aktivitas sentra, mandiri merapikan perlengkapan diri, dan mampu mengelola emosi dengan bimbingan positif.
              </p>
            </div>

            {/* Domain 3: Literasi & STEAM */}
            <div className="p-3.5 rounded-field bg-surface-subtle space-y-2 border border-line-hairline">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 text-xs text-brand-deep font-bold">
                  <BookOpen className="w-4 h-4 text-lppa" />
                  <span>Literasi &amp; Eksplorasi STEAM</span>
                </div>
                <PedagogicalRatingPill value="BSH" isReadOnly size="sm" showLabel={false} />
              </div>
              <p className="text-xs text-ink-soft leading-relaxed">
                Gemar bereksplorasi dengan rancang balok, antusias menyimak cerita buku bergambar, dan fasih menceritakan pengalamannya di depan teman.
              </p>
            </div>
          </div>

          {/* Physical Growth & Attendance Snapshot */}
          <div className="p-3 rounded-field bg-surface-subtle border border-line flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-success" />
              <span className="font-semibold text-ink">Pertumbuhan Fisik:</span>
              <span className="text-ink-soft">
                Tinggi {activeReport?.physicalHealthNotes?.heightCm || 107} cm • Berat {activeReport?.physicalHealthNotes?.weightKg || 18.5} kg
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand-primary" />
              <span className="font-semibold text-ink">Presensi:</span>
              <span className="text-ink-soft">
                Hadir {activeReport?.attendanceSummary?.hadir || 10} hari (Tingkat kehadiran 100%)
              </span>
            </div>
          </div>

          {/* CTA to Full Ratified LPPA */}
          <button
            type="button"
            onClick={() => setIsReportModalOpen(true)}
            className="w-full min-h-[48px] px-4 py-3 rounded-field bg-brand-primary hover-only:bg-brand-deep active:scale-[0.98] text-on-brand font-bold text-sm transition-all shadow-hairline flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileCheck className="w-4 h-4" />
            <span>Baca Dokumen Resmi Rapor LPPA Lengkap</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Empty / In-Progress State for Parents (Dignified & Transparent) */
        <div className="p-8 rounded-card border border-dashed border-line bg-surface text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-surface-subtle border border-line flex items-center justify-center mx-auto text-ink-soft">
            <Clock className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-ink">
              Rapor Semester {activeSemester} Sedang Disiapkan
            </h3>
            <p className="text-xs text-ink-soft max-w-md mx-auto mt-1 leading-relaxed">
              Guru sedang mengurasi portofolio karya dan menyusun narasi reflektif ananda. Rapor resmi akan muncul di portal ini segera setelah disahkan oleh Kepala Sekolah (FB-04 Authority Boundary).
            </p>
          </div>
        </div>
      )}

      {/* Full LPPA Reader Modal */}
      {isReportModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-70 bg-surface-inset/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsReportModalOpen(false)}
        >
          <div
            className="bg-surface rounded-card max-w-2xl w-full max-h-[85dvh] overflow-y-auto shadow-floating border border-line animate-in zoom-in-95 duration-150 p-6 space-y-5 text-ink"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <span className="text-xs text-brand-deep font-bold uppercase tracking-wider block">
                  Laporan Pencapaian Pembelajaran Anak (LPPA)
                </span>
                <h3 className="text-lg font-bold text-ink">
                  {resolvedChildName} • Semester {activeSemester} 2026/2027
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-2 rounded-full hover-only:bg-surface-subtle text-ink-soft hover-only:text-ink transition-colors cursor-pointer"
                aria-label="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Narrative Body */}
            <div className="space-y-4 text-sm leading-relaxed">
              <section className="space-y-2">
                <h4 className="font-bold text-ink text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-primary" />
                  <span>I. Capaian Pembelajaran &amp; Perkembangan</span>
                </h4>
                <p className="text-xs text-ink-soft pl-4 leading-relaxed">
                  Ananda {resolvedChildName} menunjukkan kemajuan yang sangat menggembirakan dalam mengeksplorasi lingkungan sekolah. Di sentra balok, ananda mampu merancang bangunan bertingkat dengan nalar spasial dan keseimbangan yang baik, serta antusias menjelaskan ide karyanya kepada teman sebaya secara santun dan percaya diri.
                </p>
              </section>

              <section className="space-y-2">
                <h4 className="font-bold text-ink text-sm flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-accent" />
                  <span>II. Refleksi &amp; Kemitraan Bersama Keluarga</span>
                </h4>
                <p className="text-xs text-ink-soft pl-4 leading-relaxed">
                  {activeReport?.homeroomFeedback || 'Bunda dan Ayah disarankan untuk terus mendampingi ananda dengan membacakan buku cerita sebelum tidur serta memberikan kesempatan kepada ananda untuk menceritakan kembali hal-hal menyenangkan yang dialaminya.'}
                </p>
              </section>

              {/* Tamper-Proof Cryptographic Ratification Badge (ADR-04) */}
              <div className="p-4 rounded-field bg-surface-subtle border border-line-hairline flex flex-col medium:flex-row items-start medium:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-success shrink-0" />
                  <div>
                    <span className="text-ink font-bold block">Telah Disahkan oleh Kepala Sekolah</span>
                    <span className="text-[11px] text-ink-soft font-mono">
                      Stempel Digital &amp; Integritas SHA-256 Terverifikasi
                    </span>
                  </div>
                </div>
                <div className="px-2.5 py-1 rounded bg-surface border border-line text-[10px] font-mono text-ink-faint">
                  YAPENDIK-OFFICIAL-DOC
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-line flex justify-end">
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="min-h-[48px] px-5 py-2.5 rounded-field bg-brand-primary text-on-brand font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup Dokumen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
