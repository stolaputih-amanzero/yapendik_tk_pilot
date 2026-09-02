/**
 * Yapendik School OS — Stage 6 Gate 4: Evidence Capture Sheet (CC-07)
 * Ultra-fast modal sheet (< 15s) for instant photo/note capture during active play.
 * Features:
 * - Native HTML5 camera & gallery picker
 * - S-Pen / Stylus annotation pad integration
 * - Watermark "PORTOFOLIO KARYA — YAPENDIK" (FB-01 Child Privacy Protection)
 * - Zero Emoji Clutter (Hukum 11 / Lucide icons only)
 * - Multi-student selection & Kurikulum Merdeka 6 domains
 */

import React, { useState, useEffect, useRef } from 'react';
import { StudentRosterItem, PAUDQuickTag } from '../../../types/teacherDailyTypes';
import { DevelopmentDomain, MilestoneRating } from '../../../domain/types';
import { teacherHomeQueryService } from '../../../services';
import { SignatureAndAnnotationPad } from './SignatureAndAnnotationPad';
import { 
  X, 
  Camera, 
  ImagePlus, 
  Sparkles, 
  Tag, 
  Users, 
  FileText, 
  Check, 
  PencilLine, 
  ShieldCheck, 
  Award,
  Layers
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  roster: StudentRosterItem[];
  preselectedStudentId?: string;
  onSaveCapture: (payload: {
    targetStudentIds: string[];
    quickTags: PAUDQuickTag[];
    initialNote: string;
    mediaUrl?: string;
    domain?: DevelopmentDomain;
    milestoneRating?: MilestoneRating;
  }) => Promise<void>;
}

const DOMAIN_OPTIONS: { id: DevelopmentDomain; label: string }[] = [
  { id: 'NILAI_AGAMA_MORAL', label: 'Nilai Agama & Moral' },
  { id: 'SOSIAL_EMOSIONAL', label: 'Jati Diri (Sosial Emosional)' },
  { id: 'BAHASA', label: 'Dasar-dasar Literasi' },
  { id: 'KOGNITIF', label: 'STEAM & Konstruksi' },
  { id: 'FISIK_MOTORIK', label: 'Fisik & Motorik' },
  { id: 'SENI', label: 'Seni & Ekspresi' }
];

const RATING_OPTIONS: { id: MilestoneRating; label: string; full: string }[] = [
  { id: 'BB', label: 'BB', full: 'Belum Berkembang' },
  { id: 'MB', label: 'MB', full: 'Mulai Berkembang' },
  { id: 'BSH', label: 'BSH', full: 'Berkembang Sesuai Harapan' },
  { id: 'BSB', label: 'BSB', full: 'Berkembang Sangat Baik' }
];

export const EvidenceCaptureSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  roster,
  preselectedStudentId,
  onSaveCapture
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<PAUDQuickTag[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<DevelopmentDomain>('KOGNITIF');
  const [selectedRating, setSelectedRating] = useState<MilestoneRating>('BSH');
  const [noteText, setNoteText] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(undefined);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [privacyConfirmed, setPrivacyConfirmed] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const quickTagsList = teacherHomeQueryService.getQuickTags();

  useEffect(() => {
    if (isOpen) {
      if (preselectedStudentId) {
        setSelectedStudentIds([preselectedStudentId]);
      } else {
        setSelectedStudentIds([]);
      }
      setSelectedTags([]);
      setSelectedDomain('KOGNITIF');
      setSelectedRating('BSH');
      setNoteText('');
      setPhotoUrl(undefined);
      setIsAnnotating(false);
      setPrivacyConfirmed(true);
      setIsSaving(false);
    }
  }, [isOpen, preselectedStudentId]);

  if (!isOpen) return null;

  const toggleStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter(s => s !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const toggleTag = (tagId: PAUDQuickTag) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(t => t !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
      // Auto-set domain matching quick tag
      const matched = quickTagsList.find(q => q.id === tagId);
      if (matched?.domain) {
        setSelectedDomain(matched.domain);
      }
    }
  };

  // Watermark and compress captured photo via Canvas
  const processImageWithWatermark = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 1000;
        const scale = Math.min(maxW / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          setPhotoUrl(dataUrl);
          return;
        }

        // Draw image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Watermark: PORTOFOLIO KARYA — YAPENDIK (15% opacity)
        const watermarkText = 'PORTOFOLIO KARYA — YAPENDIK';
        const fontSize = Math.max(14, Math.round(canvas.width * 0.03));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText(watermarkText, canvas.width - 16, canvas.height - 12);

        // Dark subtle shadow behind text for readability on bright photos
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        ctx.fillText(watermarkText, canvas.width - 17, canvas.height - 13);

        try {
          const finalUrl = canvas.toDataURL('image/webp', 0.82);
          setPhotoUrl(finalUrl);
        } catch {
          setPhotoUrl(canvas.toDataURL('image/jpeg', 0.85));
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageWithWatermark(file);
    }
  };

  const handleSimulatePhoto = () => {
    // High-quality simulated educational moment photo with client-side watermark
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800&auto=format&fit=crop&q=80';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0);
        const fontSize = Math.max(16, Math.round(canvas.width * 0.035));
        ctx.font = `bold ${fontSize}px sans-serif`;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.fillText('PORTOFOLIO KARYA — YAPENDIK', canvas.width - 20, canvas.height - 16);
        setPhotoUrl(canvas.toDataURL('image/webp', 0.85));
      } else {
        setPhotoUrl(img.src);
      }
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0) {
      alert('Pilih minimal 1 ananda yang diobservasi.');
      return;
    }

    setIsSaving(true);
    try {
      await onSaveCapture({
        targetStudentIds: selectedStudentIds,
        quickTags: selectedTags,
        initialNote: noteText.trim() || 'Momen cepat bermain dan karya anak di sentra.',
        mediaUrl: photoUrl,
        domain: selectedDomain,
        milestoneRating: selectedRating
      });
      onClose();
    } catch (err: any) {
      alert(`Gagal menyimpan momen belajar: ${err?.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 medium:p-4 bg-brand/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface border border-line rounded-3xl w-full max-w-xl shadow-floating overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 medium:px-6 py-4 bg-surface-subtle border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand text-on-brand shadow-sm">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">
                Rekam Momen Belajar
              </h3>
              <p className="text-xs text-ink-soft font-medium">
                Dokumentasi karya dan interaksi ananda saat bermain di sentra.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-ink-soft hover-only:text-ink hover-only:bg-surface transition cursor-pointer"
            title="Tutup"
            aria-label="Tutup formulir rekam momen"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* S-Pen Stylus Annotation Pad Overlay */}
        {isAnnotating && photoUrl ? (
          <div className="p-4 flex-1 overflow-y-auto">
            <SignatureAndAnnotationPad
              imageSrc={photoUrl}
              onSaveAnnotation={(annotated) => {
                setPhotoUrl(annotated);
                setIsAnnotating(false);
              }}
              onCancel={() => setIsAnnotating(false)}
            />
          </div>
        ) : (
          /* Form Body */
          <form onSubmit={handleSubmit} className="p-4 medium:p-6 overflow-y-auto space-y-5 flex-1">
            {/* 1. Pilih Ananda (Multi-Student Selection) */}
            <div>
              <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-ink-soft" />
                <span>Pilih Ananda ({selectedStudentIds.length} terpilih):</span>
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-surface-subtle rounded-2xl border border-line">
                {roster.map(s => {
                  const isSelected = selectedStudentIds.includes(s.student_id);
                  return (
                    <button
                      type="button"
                      key={s.student_id}
                      onClick={() => toggleStudent(s.student_id)}
                      className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-2 border ${
                        isSelected
                          ? 'bg-brand text-on-brand border-brand shadow-hairline'
                          : 'bg-surface border-line text-ink-soft hover-only:bg-surface-subtle hover-only:text-ink'
                      }`}
                    >
                      <span>{s.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Media Bukti Visual (Camera / Gallery / S-Pen) */}
            <div>
              <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
                <Camera className="w-4 h-4 text-ink-soft" />
                <span>Bukti Foto Karya:</span>
              </label>

              {/* Hidden File Inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Ambil foto menggunakan kamera"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                aria-label="Pilih foto dari galeri"
              />

              {photoUrl ? (
                <div className="space-y-2">
                  <div className="relative rounded-2xl overflow-hidden border border-line h-48 bg-surface-inset">
                    <img src={photoUrl} alt="Bukti Momen Belajar" className="w-full h-full object-cover" />
                    
                    {/* Top Action Buttons on Preview */}
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setIsAnnotating(true)}
                        className="min-h-[38px] px-3 rounded-xl bg-brand text-on-brand text-xs font-bold shadow-md hover-only:opacity-90 flex items-center gap-1.5 cursor-pointer"
                        title="Beri coretan atau lingkari bagian karya menggunakan S-Pen"
                      >
                        <PencilLine className="w-3.5 h-3.5" />
                        <span>Anotasi S-Pen</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoUrl(undefined)}
                        className="min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl bg-surface/90 text-danger-deep hover-only:bg-danger hover-only:text-on-brand transition shadow-md cursor-pointer"
                        title="Hapus foto ini"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Watermark Tag Badge Indicator */}
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-brand/70 text-on-brand text-[10px] font-mono font-semibold tracking-wider">
                      PORTOFOLIO KARYA — YAPENDIK
                    </div>
                  </div>

                  {/* Privacy Checkbox Confirmation */}
                  <div className="p-2.5 rounded-xl bg-surface-subtle border border-line flex items-center gap-2 text-xs text-ink">
                    <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                    <label className="cursor-pointer font-medium select-none flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={privacyConfirmed}
                        onChange={e => setPrivacyConfirmed(e.target.checked)}
                        className="rounded text-brand cursor-pointer w-4 h-4"
                      />
                      <span>Saya memastikan tidak ada wajah anak yang terekspos tanpa persetujuan.</span>
                    </label>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 medium:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="min-h-[50px] py-2.5 px-3 rounded-2xl border border-line hover-only:border-brand bg-surface-subtle text-ink text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-hairline"
                  >
                    <Camera className="w-4 h-4 text-brand" />
                    <span>Ambil Foto</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="min-h-[50px] py-2.5 px-3 rounded-2xl border border-line hover-only:border-brand bg-surface-subtle text-ink text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-hairline"
                  >
                    <ImagePlus className="w-4 h-4 text-accent-valor" />
                    <span>Pilih Galeri</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSimulatePhoto}
                    className="min-h-[50px] py-2.5 px-3 rounded-2xl border border-dashed border-line hover-only:border-line-strong bg-surface text-ink-soft text-xs font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-warning-deep" />
                    <span>Contoh Karya</span>
                  </button>
                </div>
              )}
            </div>

            {/* 3. Domain Perkembangan & Rating Capaian */}
            <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-ink-soft" />
                  <span>Domain Perkembangan:</span>
                </label>
                <div className="space-y-1">
                  {DOMAIN_OPTIONS.map(d => {
                    const isSelected = selectedDomain === d.id;
                    return (
                      <button
                        type="button"
                        key={d.id}
                        onClick={() => setSelectedDomain(d.id)}
                        className={`w-full min-h-[38px] px-3 py-1.5 rounded-xl text-xs text-left font-semibold transition cursor-pointer border flex items-center justify-between ${
                          isSelected
                            ? 'bg-brand text-on-brand border-brand shadow-hairline'
                            : 'bg-surface-subtle border-line text-ink-soft hover-only:text-ink'
                        }`}
                      >
                        <span>{d.label}</span>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
                  <Award className="w-4 h-4 text-ink-soft" />
                  <span>Rating Capaian:</span>
                </label>
                <div className="space-y-1.5">
                  {RATING_OPTIONS.map(r => {
                    const isSelected = selectedRating === r.id;
                    return (
                      <button
                        type="button"
                        key={r.id}
                        onClick={() => setSelectedRating(r.id)}
                        className={`w-full min-h-[38px] px-3 py-1.5 rounded-xl text-xs text-left transition cursor-pointer border flex items-center justify-between ${
                          isSelected
                            ? 'bg-brand text-on-brand border-brand font-bold shadow-hairline'
                            : 'bg-surface-subtle border-line text-ink-soft hover-only:text-ink'
                        }`}
                      >
                        <div>
                          <span className="font-mono font-bold mr-2">{r.label}</span>
                          <span className="text-[11px] opacity-90">{r.full}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 4. Quick Tags */}
            <div>
              <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
                <Tag className="w-4 h-4 text-ink-soft" />
                <span>Fokus Indikator (1-Tap):</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickTagsList.map(tag => {
                  const isSelected = selectedTags.includes(tag.id);
                  return (
                    <button
                      type="button"
                      key={tag.id}
                      onClick={() => toggleTag(tag.id)}
                      className={`min-h-[36px] px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                        isSelected
                          ? 'bg-brand text-on-brand border-brand shadow-hairline'
                          : 'bg-surface-subtle text-ink-soft border-line hover-only:bg-surface hover-only:text-ink'
                      }`}
                    >
                      {tag.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Catatan Singkat Anekdot */}
            <div>
              <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-1.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-ink-soft" />
                <span>Catatan Anekdot (Faktual &amp; Obyektif):</span>
              </label>
              <textarea
                rows={2}
                placeholder="Contoh: Berhasil menyusun menara 12 balok secara mandiri dengan seimbang..."
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-2xl bg-surface-subtle border border-line focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand text-ink placeholder:text-ink-faint font-medium shadow-hairline resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 flex flex-col medium:flex-row items-stretch medium:items-center justify-end gap-3 border-t border-line pb-6 medium:pb-0">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[46px] w-full medium:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-ink-soft hover-only:bg-surface-subtle transition cursor-pointer order-2 medium:order-1"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isSaving || selectedStudentIds.length === 0 || !privacyConfirmed}
                className="min-h-[46px] w-full medium:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-brand hover-only:opacity-90 text-on-brand shadow-sm ring-1 ring-brand/50 transition-all disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2 order-1 medium:order-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Momen Belajar'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
