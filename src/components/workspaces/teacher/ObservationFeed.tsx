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
      <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl p-10 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Belum ada momen cepat hari ini</h4>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
          Sentra main sedang aktif? Rekam interaksi dan karya anak dalam &lt;15 detik menggunakan tombol Momen Cepat.
        </p>
        <button
          onClick={onOpenQuickCapture}
          className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md shadow-amber-500/20 transition cursor-pointer"
        >
          + Rekam Momen Cepat Pertama
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
          <span>Linimasa Momen & Bukti Karya Hari Ini</span>
          <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800 border border-indigo-200">
            {observations.length}
          </span>
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {observations.map((obs) => {
          const isDraft = obs.status === 'QUICK_DRAFT';
          const timeStr = new Date(obs.recorded_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

          return (
            <div
              key={obs.id}
              className={`rounded-2xl border transition-all duration-200 p-4 bg-white shadow-sm flex flex-col justify-between ${
                isDraft
                  ? 'border-amber-300 bg-amber-50/20'
                  : 'border-slate-200 hover:border-indigo-300'
              }`}
            >
              <div>
                {/* Header: Teacher Badge, Child Names, Time */}
                <div className="flex items-start justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    {/* Teacher Initial Badge (Multi-teacher collaboration) */}
                    <div
                      title={`Pencatat: ${obs.recorded_by_name}`}
                      className="w-7 h-7 rounded-xl bg-indigo-600 text-white font-bold text-[11px] flex items-center justify-center shadow-sm"
                    >
                      {obs.recorded_by_initials}
                    </div>

                    <div>
                      <div className="text-xs font-black text-slate-900">
                        {obs.target_student_names.join(', ')}
                      </div>
                      <div className="text-[10px] text-slate-500 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" /> {timeStr} • {obs.domain}
                      </div>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-1">
                    {isDraft ? (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-lg bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-700" /> Draf
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-emerald-700" /> Matang
                      </span>
                    )}

                    {obs.is_lppa_evidence && (
                      <span title="Ditetapkan sebagai Bukti LPPA" className="p-1 rounded-lg bg-purple-100 text-purple-800 border border-purple-200">
                        <Award className="w-3.5 h-3.5" />
                      </span>
                    )}
                  </div>
                </div>

                {/* Media preview if available */}
                {obs.media_url && (
                  <div className="mb-2.5 rounded-xl overflow-hidden h-32 bg-slate-950 border border-slate-200">
                    <img src={obs.media_url} alt="Evidence" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Observation Anecdote Narrative */}
                <p className="text-xs text-slate-800 line-clamp-3 leading-relaxed mb-3 font-normal">
                  {obs.anecdote_description}
                </p>

                {/* Quick Tag Chips */}
                {obs.quick_tags && obs.quick_tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {obs.quick_tags.map(t => (
                      <span
                        key={t}
                        className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-slate-100 text-slate-700 border border-slate-200"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Footer: Privacy State & Enrich Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {obs.is_staff_confidential ? (
                    <span className="text-[11px] text-amber-800 flex items-center gap-1 font-bold">
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
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileEdit className="w-3.5 h-3.5 text-indigo-600" />
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
