import { SelectSheet } from '../../ui';
/**
 * Yapendik School OS — Stage 4.1 Enrichment Tray Drawer (CC-10)
 * Slide-over drawer for Phase 8 pedagogical narrative enrichment & LPPA curation
 * Strictly enforces Invariant C-11: Mutual Exclusivity between Confidential and Parent Share
 */

import React, { useState, useEffect } from 'react';
import { ClassObservationItem } from '../../../types/teacherDailyTypes';
import { DevelopmentDomain, MilestoneRating } from '../../../domain/types';
import { 
  X, 
  Sparkles, 
  Lock, 
  Share2, 
  Award, 
  BookOpen, 
  Check, 
  AlertTriangle 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  observation: ClassObservationItem | null;
  onSaveEnrichment: (payload: {
    observationId: string;
    narrative: string;
    domain: DevelopmentDomain;
    milestoneRating: MilestoneRating;
    indicators: string[];
    isLppaEvidence: boolean;
    isStaffConfidential: boolean;
    isSharedWithGuardian: boolean;
  }) => Promise<void>;
}

const DOMAINS: { key: DevelopmentDomain; label: string }[] = [
  { key: 'NILAI_AGAMA_MORAL', label: 'Nilai Agama & Moral' },
  { key: 'JATI_DIRI' as any, label: 'Jati Diri (Sosial-Emosional)' },
  { key: 'KOGNITIF', label: 'Kognitif / Logika' },
  { key: 'BAHASA', label: 'Bahasa & Literasi' },
  { key: 'FISIK_MOTORIK', label: 'Fisik & Motorik' },
  { key: 'SENI', label: 'Seni & Kreativitas' }
];

const RATINGS: { key: MilestoneRating; label: string; desc: string }[] = [
  { key: 'BB', label: 'BB', desc: 'Belum Berkembang' },
  { key: 'MB', label: 'MB', desc: 'Mulai Berkembang' },
  { key: 'BSH', label: 'BSH', desc: 'Berkembang Sesuai Harapan' },
  { key: 'BSB', label: 'BSB', desc: 'Berkembang Sangat Baik' }
];

export const EnrichmentTrayDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  observation,
  onSaveEnrichment
}) => {
  const [narrative, setNarrative] = useState('');
  const [domain, setDomain] = useState<DevelopmentDomain>('KOGNITIF');
  const [milestoneRating, setMilestoneRating] = useState<MilestoneRating>('BSH');
  const [isLppaEvidence, setIsLppaEvidence] = useState(true);
  
  // Invariant C-11: Mutually exclusive privacy state
  // 'CONFIDENTIAL' -> isStaffConfidential=true, isShared=false
  // 'SHARED' -> isStaffConfidential=false, isShared=true
  // 'INTERNAL_NON_CONFIDENTIAL' -> isStaffConfidential=false, isShared=false
  const [privacyChoice, setPrivacyChoice] = useState<'CONFIDENTIAL' | 'SHARED' | 'INTERNAL'>('SHARED');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (observation) {
      setNarrative(observation.anecdote_description || '');
      setDomain(observation.domain || 'KOGNITIF');
      setMilestoneRating(observation.milestone_rating || 'BSH');
      setIsLppaEvidence(observation.is_lppa_evidence);
      
      if (observation.is_staff_confidential) {
        setPrivacyChoice('CONFIDENTIAL');
      } else if (observation.is_shared_with_guardian) {
        setPrivacyChoice('SHARED');
      } else {
        setPrivacyChoice('INTERNAL');
      }
      setIsSaving(false);
    }
  }, [observation]);

  if (!isOpen || !observation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!narrative.trim()) {
      alert('Tuliskan narasi refleksi pedagogis.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveEnrichment({
        observationId: observation.id,
        narrative: narrative.trim(),
        domain,
        milestoneRating,
        indicators: observation.quick_tags || [],
        isLppaEvidence,
        isStaffConfidential: privacyChoice === 'CONFIDENTIAL',
        isSharedWithGuardian: privacyChoice === 'SHARED'
      });
      onClose();
    } catch (err: any) {
      alert(`Gagal menyimpan pengayaan: ${err?.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-end bg-brand/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface border-l border-line w-full max-w-lg h-full shadow-floating flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-line flex items-center justify-between bg-surface-subtle">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-field bg-lppa-tint text-lppa-deep border border-lppa-line">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-ink">
                Laci Pengayaan Refleksi & Bukti LPPA
              </h3>
              <p className="text-xs text-ink-soft font-medium">
                Siswa: <strong className="text-ink font-bold">{observation.target_student_names.join(', ')}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-field text-ink-faint hover-only:text-ink-soft hover-only:bg-surface-subtle transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Media preview if present */}
          {observation.media_url && (
            <div className="rounded-card overflow-hidden h-36 bg-surface-inset border border-line">
              <img src={observation.media_url} alt="Evidence" className="w-full h-full object-cover" />
            </div>
          )}

          {/* 1. Narasi Refleksi Pedagogis */}
          <div>
            <label className="block font-extrabold text-ink uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-lppa" />
              <span>Narasi Deskripsi & Refleksi Pedagogis:</span>
            </label>
            <textarea
              rows={4}
              value={narrative}
              onChange={e => setNarrative(e.target.value)}
              placeholder="Jelaskan proses belajar, capaian anak, dan tindak lanjut pendidik..."
              className="w-full px-3 py-2 rounded-card bg-surface-subtle border border-line focus:outline-none focus:ring-2 focus:ring-indigo-500 text-ink placeholder:text-ink-soft font-medium leading-relaxed"
            />
          </div>

          {/* 2. Dimensi Capaian Kurikulum */}
          <div>
            <label className="block font-extrabold text-ink uppercase tracking-wider mb-1.5">
              Dimensi Capaian Pembelajaran:
            </label>
            <SelectSheet value={domain} onChange={(val) => setDomain(val as any)} options={DOMAINS.map(d => ({ value: d.key, label: d.label }))} />
          </div>

          {/* 3. Penilaian Milestone PAUD */}
          <div>
            <label className="block font-extrabold text-ink uppercase tracking-wider mb-2">
              Tingkat Capaian (Rating):
            </label>
            <div className="grid grid-cols-2 medium:grid-cols-4 gap-2">
              {RATINGS.map(r => (
                <button
                  type="button"
                  key={r.key}
                  onClick={() => setMilestoneRating(r.key)}
                  className={`py-2 medium:py-2 px-1 rounded-field text-center transition cursor-pointer border ${
                    milestoneRating === r.key
                      ? 'bg-lppa text-on-brand border-lppa-line font-bold shadow-ambient shadow-hairline'
                      : 'bg-surface-subtle border-line text-ink hover-only:bg-surface-subtle font-semibold'
                  }`}
                >
                  <div className="text-xs font-bold">{r.label}</div>
                  <div className="text-[9px] opacity-80 truncate font-normal">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. LPPA Evidence Flag */}
          <div className="p-3 rounded-card bg-lppa-tint border border-lppa-line">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isLppaEvidence}
                onChange={e => setIsLppaEvidence(e.target.checked)}
                className="w-4 h-4 rounded text-lppa focus:ring-brand-primary/30"
              />
              <div>
                <span className="font-bold text-lppa-deep flex items-center gap-2">
                  <Award className="w-4 h-4 text-lppa" /> Tetapkan Sebagai Bukti LPPA (Rapor)
                </span>
                <p className="text-[11px] text-lppa-deep mt-0.5 font-medium">
                  Momen ini akan otomatis menjadi materi sintesis portofolio rapor akhir semester.
                </p>
              </div>
            </label>
          </div>

          {/* 5. Invariant C-11: Mutually Exclusive Privacy Selection */}
          <div className="p-3 rounded-card bg-surface-subtle border border-line space-y-2">
            <div className="font-extrabold text-ink uppercase tracking-wider mb-1">
              DISTRIBUSI & PRIVASI
            </div>

            <label className="flex items-start gap-2 p-2 rounded-field hover-only:bg-surface-subtle cursor-pointer">
              <input
                type="radio"
                name="privacyChoice"
                checked={privacyChoice === 'SHARED'}
                onChange={() => setPrivacyChoice('SHARED')}
                className="mt-0.5 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-bold text-teal-800 flex items-center gap-1">
                  <Share2 className="w-4 h-4 text-teal-700" /> Bagikan ke Orang Tua (Buku Penghubung)
                </span>
                <p className="text-[10px] text-ink-soft font-medium">
                  Orang tua dapat melihat karya & apresiasi ananda di portal wali murid.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2 p-2 rounded-field hover-only:bg-surface-subtle cursor-pointer">
              <input
                type="radio"
                name="privacyChoice"
                checked={privacyChoice === 'CONFIDENTIAL'}
                onChange={() => setPrivacyChoice('CONFIDENTIAL')}
                className="mt-0.5 text-brand-primary focus:ring-warning"
              />
              <div>
                <span className="font-bold text-warning-deep flex items-center gap-1">
                  <Lock className="w-4 h-4 text-warning-deep" /> Khusus Pendidik / Catatan Sensitif (Rahasia)
                </span>
                <p className="text-[10px] text-ink-soft font-medium">
                  Hanya dapat dilihat oleh dewan guru dan kepala sekolah (tidak bocor ke orang tua).
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-line flex flex-col medium:flex-row items-stretch medium:items-center justify-end gap-3 pb-6 medium:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full medium:w-auto px-4 py-2 medium:py-2 rounded-field font-bold text-ink-soft hover-only:bg-surface-subtle transition cursor-pointer order-2 medium:order-1"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="w-full medium:w-auto px-6 py-2 rounded-field font-extrabold bg-lppa hover-only:bg-lppa text-on-brand shadow-ambient shadow-hairline transition-all disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2 order-1 medium:order-2"
            >
              <Check className="w-4 h-4" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengayaan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
