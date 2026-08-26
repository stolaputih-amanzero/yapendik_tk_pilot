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
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border-l border-slate-200 w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Laci Pengayaan Refleksi & Bukti LPPA
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Siswa: <strong className="text-slate-900 font-bold">{observation.target_student_names.join(', ')}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Media preview if present */}
          {observation.media_url && (
            <div className="rounded-2xl overflow-hidden h-36 bg-slate-950 border border-slate-200">
              <img src={observation.media_url} alt="Evidence" className="w-full h-full object-cover" />
            </div>
          )}

          {/* 1. Narasi Refleksi Pedagogis */}
          <div>
            <label className="block font-extrabold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>Narasi Deskripsi & Refleksi Pedagogis:</span>
            </label>
            <textarea
              rows={4}
              value={narrative}
              onChange={e => setNarrative(e.target.value)}
              placeholder="Jelaskan proses belajar, capaian anak, dan tindak lanjut pendidik..."
              className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 placeholder:text-slate-500 font-medium leading-relaxed"
            />
          </div>

          {/* 2. Dimensi Capaian Kurikulum */}
          <div>
            <label className="block font-extrabold text-slate-800 uppercase tracking-wider mb-1.5">
              Dimensi Capaian Pembelajaran:
            </label>
            <select
              value={domain}
              onChange={e => setDomain(e.target.value as DevelopmentDomain)}
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 font-medium text-slate-900"
            >
              {DOMAINS.map(d => (
                <option key={d.key} value={d.key}>{d.label}</option>
              ))}
            </select>
          </div>

          {/* 3. Penilaian Milestone PAUD */}
          <div>
            <label className="block font-extrabold text-slate-800 uppercase tracking-wider mb-2">
              Tingkat Capaian (Rating):
            </label>
            <div className="grid grid-cols-4 gap-2">
              {RATINGS.map(r => (
                <button
                  type="button"
                  key={r.key}
                  onClick={() => setMilestoneRating(r.key)}
                  className={`py-2 px-1 rounded-xl text-center transition cursor-pointer border ${
                    milestoneRating === r.key
                      ? 'bg-indigo-600 text-white border-indigo-600 font-bold shadow-md shadow-indigo-600/30'
                      : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <div className="text-xs font-bold">{r.label}</div>
                  <div className="text-[9px] opacity-80 truncate font-normal">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. LPPA Evidence Flag */}
          <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={isLppaEvidence}
                onChange={e => setIsLppaEvidence(e.target.checked)}
                className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
              />
              <div>
                <span className="font-bold text-purple-950 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" /> Tetapkan Sebagai Bukti LPPA (Rapor)
                </span>
                <p className="text-[11px] text-purple-800 mt-0.5 font-medium">
                  Momen ini akan otomatis menjadi materi sintesis portofolio rapor akhir semester.
                </p>
              </div>
            </label>
          </div>

          {/* 5. Invariant C-11: Mutually Exclusive Privacy Selection */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="font-extrabold text-slate-800 uppercase tracking-wider mb-1">
              Distribusi & Privasi (Invariant C-11):
            </div>

            <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
              <input
                type="radio"
                name="privacyChoice"
                checked={privacyChoice === 'SHARED'}
                onChange={() => setPrivacyChoice('SHARED')}
                className="mt-0.5 text-teal-600 focus:ring-teal-500"
              />
              <div>
                <span className="font-bold text-teal-800 flex items-center gap-1">
                  <Share2 className="w-3.5 h-3.5 text-teal-700" /> Bagikan ke Orang Tua (Buku Penghubung)
                </span>
                <p className="text-[10px] text-slate-600 font-medium">
                  Orang tua dapat melihat karya & apresiasi ananda di portal wali murid.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-100 cursor-pointer">
              <input
                type="radio"
                name="privacyChoice"
                checked={privacyChoice === 'CONFIDENTIAL'}
                onChange={() => setPrivacyChoice('CONFIDENTIAL')}
                className="mt-0.5 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="font-bold text-amber-900 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-amber-700" /> Khusus Pendidik / Catatan Sensitif (Rahasia)
                </span>
                <p className="text-[10px] text-slate-600 font-medium">
                  Hanya dapat dilihat oleh dewan guru dan kepala sekolah (tidak bocor ke orang tua).
                </p>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              Tutup
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl font-extrabold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer flex items-center gap-2"
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
