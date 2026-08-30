/**
 * Yapendik School OS — Stage 4.1 Evidence Capture Sheet (CC-07)
 * Ultra-fast modal sheet (< 15s) for instant photo/audio/note capture during active play
 */

import React, { useState, useEffect } from 'react';
import { StudentRosterItem, PAUDQuickTag } from '../../../types/teacherDailyTypes';
import { teacherHomeQueryService } from '../../../services';
import { 
  X, 
  Camera, 
  Sparkles, 
  Tag, 
  Users, 
  FileText, 
  Check, 
  Mic, 
  Image as ImageIcon 
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
  }) => Promise<void>;
}

export const EvidenceCaptureSheet: React.FC<Props> = ({
  isOpen,
  onClose,
  roster,
  preselectedStudentId,
  onSaveCapture
}) => {
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<PAUDQuickTag[]>([]);
  const [noteText, setNoteText] = useState('');
  const [mockPhotoUrl, setMockPhotoUrl] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);

  const quickTagsList = teacherHomeQueryService.getQuickTags();

  useEffect(() => {
    if (isOpen) {
      if (preselectedStudentId) {
        setSelectedStudentIds([preselectedStudentId]);
      } else {
        setSelectedStudentIds([]);
      }
      setSelectedTags([]);
      setNoteText('');
      setMockPhotoUrl(undefined);
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
    }
  };

  const handleSimulatePhoto = () => {
    // High-quality simulated educational moment photo
    setMockPhotoUrl('https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=600&auto=format&fit=crop&q=80');
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
        initialNote: noteText.trim() || 'Momen cepat bermain di sentra.',
        mediaUrl: mockPhotoUrl
      });
      onClose();
    } catch (err: any) {
      alert(`Gagal menyimpan momen cepat: ${err?.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-center justify-center p-3 medium:p-4 bg-brand/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface border border-line rounded-3xl w-full max-w-xl shadow-floating overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 medium:px-6 py-4 bg-surface-subtle border-b border-line flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-field bg-warning-tint text-brand-primary border border-warning-line/80 shadow-hairline">
              <Sparkles className="w-5 h-5 text-brand-primary fill-brand-primary" />
            </div>
            <div>
              <h3 className="text-base font-bold text-ink">
                Rekam Momen Belajar
              </h3>
              <p className="text-xs text-ink-soft font-medium">
                Dokumentasikan interaksi dan karya ananda saat kegiatan main.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-field text-ink-faint hover-only:text-ink-soft hover-only:bg-surface-subtle transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 medium:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Pilih Ananda (Child Selector Chips) */}
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 text-ink-soft" />
              <span>Pilih Ananda ({selectedStudentIds.length} terpilih):</span>
            </label>
            <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 bg-surface-subtle rounded-card border border-line">
              {roster.map(s => {
                const isSelected = selectedStudentIds.includes(s.student_id);
                return (
                  <button
                    type="button"
                    key={s.student_id}
                    onClick={() => toggleStudent(s.student_id)}
                    className={`px-3 py-1 rounded-field text-xs font-bold transition cursor-pointer flex items-center gap-2 ${
                      isSelected
                        ? 'bg-brand text-on-brand shadow-hairline'
                        : 'bg-surface border border-line text-ink-soft hover-only:bg-surface-subtle'
                    }`}
                  >
                    <span>{s.name}</span>
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Media Bukti Visual (Photo/Audio) */}
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4 text-ink-soft" />
              <span>Foto / Bukti Karya:</span>
            </label>
            {mockPhotoUrl ? (
              <div className="relative rounded-card overflow-hidden border border-line group h-36 bg-surface-inset">
                <img src={mockPhotoUrl} alt="Captured Moment" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setMockPhotoUrl(undefined)}
                  className="absolute top-2 right-2 p-2 rounded-lg bg-brand/80 text-danger-deep hover-only:bg-danger hover-only:text-on-brand transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className="flex-1 py-3 px-4 rounded-card border-2 border-dashed border-line hover-only:border-line-strong bg-surface-subtle text-ink-soft text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-hairline"
                >
                  <Camera className="w-4 h-4 text-ink-soft" />
                  <span>Ambil Foto Momen / Karya</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Kurikulum Merdeka TK Quick Tags */}
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-ink-soft" />
              <span>Fokus Perkembangan (TK):</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {quickTagsList.map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1 rounded-field text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-brand text-on-brand shadow-hairline'
                        : 'bg-surface-subtle text-ink-soft border border-line hover-only:bg-line-soft'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Catatan Singkat Anekdot */}
          <div>
            <label className="block text-xs font-bold text-ink-soft uppercase tracking-wider mb-1.5 flex items-center gap-2">
              <FileText className="w-4 h-4 text-ink-soft" />
              <span>Catatan Observasi (Opsional):</span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Berhasil menyusun menara 12 balok secara mandiri dengan seimbang..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-card bg-surface-subtle border border-line focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary text-ink placeholder:text-ink-faint font-medium shadow-hairline"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col medium:flex-row items-stretch medium:items-center justify-end gap-3 border-t border-line-soft pb-6 medium:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full medium:w-auto px-5 py-2 rounded-field text-xs font-semibold text-ink-soft hover-only:bg-surface-subtle transition cursor-pointer order-2 medium:order-1"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || selectedStudentIds.length === 0}
              className="w-full medium:w-auto px-6 py-2 rounded-field text-xs font-bold bg-brand hover-only:opacity-90 text-on-brand shadow-hairline transition-all disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2 order-1 medium:order-2"
            >
              <Sparkles className="w-4 h-4 text-brand-primary fill-brand-primary" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Momen Belajar'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
