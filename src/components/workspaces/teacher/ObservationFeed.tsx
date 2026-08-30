/**
 * Yapendik School OS — Stage 4.1 Observation Feed (CC-08)
 * Class-wide timeline feed of daily moments, collaborative capture initial badges, and enrichment triggers
 */

import React from 'react';
import { ClassObservationItem } from '../../../types/teacherDailyTypes';
import { 
  Sparkles, 
  Clock, 
  Lock, 
  Share2, 
  FileEdit, 
  Award, 
  CheckCircle, 
  Image as ImageIcon,
  Tag
} from 'lucide-react';

interface Props {
  observations: ClassObservationItem[];
  onOpenEnrichment: (obs: ClassObservationItem) => void;
  onOpenQuickCapture: () => void;
}

export const ObservationFeed: React.FC<Props> = ({
  observations,
  onOpenEnrichment,
  onOpenQuickCapture
}) => {
  if (observations.length === 0) {
    return (
      <div className="bg-surface border border-dashed border-line rounded-3xl p-8 medium:p-10 text-center">
        <div className="w-12 h-12 rounded-card bg-warning-tint border border-warning-line text-brand-primary flex items-center justify-center mx-auto mb-3 shadow-hairline">
          <Sparkles className="w-6 h-6 fill-brand-primary text-brand-primary" />
        </div>
        <h4 className="text-sm font-bold text-ink">Belum ada momen belajar tercatat hari ini</h4>
        <p className="text-xs text-ink-soft mt-1 max-w-md mx-auto">
          Dokumentasikan interaksi, karya, atau celoteh ananda saat kegiatan bermain di sentra berlangsung.
        </p>
        <button
          onClick={onOpenQuickCapture}
          className="mt-4 w-full medium:w-auto px-4 py-2 rounded-field text-xs font-bold bg-brand text-on-brand hover-only:opacity-90 shadow-hairline transition cursor-pointer flex justify-center items-center mx-auto gap-2"
        >
          <Sparkles className="w-4 h-4 text-brand-primary fill-brand-primary" />
          <span>+ Rekam Momen Belajar Pertama</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-ink flex items-center gap-2">
          <span>Linimasa Momen & Bukti Karya Hari Ini</span>
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-lppa-tint text-lppa-deep border border-lppa-line">
            {observations.length}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 medium:grid-cols-2 gap-4">
        {observations.map((obs) => {
          const isDraft = obs.status === 'QUICK_DRAFT';
          const timeStr = new Date(obs.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={obs.id}
              className={`rounded-card border transition-all duration-200 p-4 bg-surface shadow-hairline flex flex-col justify-between ${
                isDraft
                  ? 'border-warning-line bg-warning-tint/20'
                  : 'border-line hover-only:border-lppa-line'
              }`}
            >
              <div>
                {/* Header: Teacher Badge, Child Names, Time */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    {/* Teacher Initial Badge (Multi-teacher collaboration) */}
                    <div
                      title={`Pencatat: ${obs.recorded_by_name}`}
                      className="w-7 h-7 rounded-field bg-lppa text-on-brand font-bold text-[11px] flex items-center justify-center shadow-hairline"
                    >
                      {obs.recorded_by_initials}
                    </div>

                    <div>
                      <div className="text-xs font-black text-ink">
                        {obs.target_student_names.join(', ')}
                      </div>
                      <div className="text-[10px] text-ink-soft font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-ink-faint" /> {timeStr} • {obs.domain}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-1">
                    {isDraft ? (
                      <span className="px-2 py-1 text-[10px] font-extrabold rounded-lg bg-warning-tint text-warning-deep border border-warning-line flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-warning-deep" /> Draf
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-[10px] font-extrabold rounded-lg bg-success-tint text-success-deep border border-success-line flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-success-deep" /> Matang
                      </span>
                    )}

                    {obs.is_lppa_evidence && (
                      <span title="Ditetapkan sebagai Bukti LPPA" className="p-1 rounded-lg bg-lppa-tint text-lppa-deep border border-lppa-line">
                        <Award className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Media preview if available */}
                {obs.media_url && (
                  <div className="mb-2.5 rounded-field overflow-hidden h-32 bg-surface-inset border border-line">
                    <img src={obs.media_url} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Observation Anecdote Narrative */}
                <p className="text-xs text-ink line-clamp-3 leading-relaxed mb-3 font-normal">
                  {obs.anecdote_description}
                </p>

                {/* Quick Tag Chips */}
                {obs.quick_tags && obs.quick_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {obs.quick_tags.map(t => (
                      <span
                        key={t}
                        className="px-2 py-1 text-[10px] font-semibold rounded-md bg-surface-subtle text-ink-soft border border-line"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Footer: Privacy State & Enrich Button */}
              <div className="pt-3 medium:pt-2 border-t border-line-soft flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-3">
                <div className="flex items-center gap-2 mb-1 medium:mb-0">
                  {obs.is_staff_confidential ? (
                    <span className="text-[11px] text-warning-deep flex items-center gap-1 font-bold">
                      <Lock className="w-3 h-3" /> Khusus Pendidik
                    </span>
                  ) : obs.is_shared_with_guardian ? (
                    <span className="text-[11px] text-teal-800 flex items-center gap-1 font-bold">
                      <Share2 className="w-3 h-3" /> Dibagi ke Ortu
                    </span>
                  ) : null}
                </div>

                <button
                  onClick={() => onOpenEnrichment(obs)}
                  className="w-full medium:w-auto px-3 py-2 medium:py-1 rounded-field text-xs font-bold bg-lppa-tint hover-only:bg-lppa-tint text-lppa-deep border border-lppa-line transition flex justify-center items-center gap-2 cursor-pointer shadow-hairline"
                >
                  <FileEdit className="w-4 h-4 text-lppa" />
                  <span>{isDraft ? 'Perkaya Narasi' : 'Edit Narasi'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
