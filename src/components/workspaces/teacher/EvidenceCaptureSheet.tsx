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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
              <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                Momen Cepat (Fast Capture)
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Tangkap seketika (&lt;15 dtk). Perkaya narasi saat sintesis siang.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* 1. Pilih Ananda (Child Selector Chips) */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-slate-600" />
              <span>Pilih Ananda ({selectedStudentIds.length} terpilih):</span>
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-slate-50 rounded-2xl border border-slate-200">
              {roster.map(s => {
                const isSelected = selectedStudentIds.includes(s.student_id);
                return (
                  <button
                    type="button"
                    key={s.student_id}
                    onClick={() => toggleStudent(s.student_id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
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
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-slate-600" />
              <span>Foto / Bukti Visual Karya:</span>
            </label>
            {mockPhotoUrl ? (
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 group h-36 bg-slate-950">
                <img src={mockPhotoUrl} alt="Captured Moment" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setMockPhotoUrl(undefined)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-slate-900/80 text-rose-400 hover:bg-rose-600 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleSimulatePhoto}
                  className="flex-1 py-3 px-4 rounded-2xl border-2 border-dashed border-slate-300 hover:border-slate-400 bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Camera className="w-4 h-4 text-slate-600" />
                  <span>Ambil Foto Momen / Karya</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Kurikulum Merdeka PAUD Quick Tags */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-600" />
              <span>Tag Cepat Dimensi PAUD:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {quickTagsList.map(tag => {
                const isSelected = selectedTags.includes(tag.id);
                return (
                  <button
                    type="button"
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isSelected
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Catatan Singkat Anecdot */}
          <div>
            <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-slate-600" />
              <span>Kata Kunci / Catatan Singkat (Opsional):</span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Berhasil susun menara 12 balok mandiri tanpa jatuh..."
              value={noteText}
              onChange={e => setNoteText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:border-slate-400 text-slate-900 placeholder:text-slate-400 font-medium"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 border-t border-slate-100 pb-6 sm:pb-0">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer order-2 sm:order-1"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSaving || selectedStudentIds.length === 0}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer flex justify-center items-center gap-2 order-1 sm:order-2"
            >
              <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Momen Cepat'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
