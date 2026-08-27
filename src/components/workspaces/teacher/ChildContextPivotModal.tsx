/**
 * Yapendik School OS — Stage 4.1 Child Context Pivot Modal (CC-09)
 * One Child Context deep dive: Zero redundant dropdowns, full semester longitudinal evidence,
 * attendance health history, and LPPA synthesis readiness.
 */

import React, { useState, useEffect } from 'react';
import { ChildContextDeepPayload } from '../../../types/teacherDailyTypes';
import { teacherHomeQueryService } from '../../../services';
import { 
  X, 
  Sparkles, 
  Calendar, 
  Award, 
  Heart, 
  Lock, 
  Share2, 
  FileText,
  AlertCircle,
  User,
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';

interface Props {
  studentId: string | null;
  schoolId: string;
  classId: string;
  onClose: () => void;
  onOpenQuickCaptureForChild: (studentId: string) => void;
}

export const ChildContextPivotModal: React.FC<Props> = ({
  studentId,
  schoolId,
  classId,
  onClose,
  onOpenQuickCaptureForChild
}) => {
  const [activeTab, setActiveTab] = useState<'EVIDENCE' | 'ATTENDANCE' | 'HEALTH' | 'LPPA'>('EVIDENCE');
  const [childData, setChildData] = useState<ChildContextDeepPayload | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentId) {
      setLoading(true);
      teacherHomeQueryService.getChildContextDeep(studentId, schoolId, classId)
        .then(data => {
          setChildData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error loading child deep context:', err);
          setLoading(false);
        });
    }
  }, [studentId, schoolId, classId]);

  if (!studentId) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 w-full max-w-5xl h-[90vh] sm:h-[85vh] shadow-2xl overflow-hidden flex flex-col">
        {/* Header: Amanaura Standard Eyebrow + Title + Actions */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 bg-white flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3 pr-6 sm:pr-0 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shadow-2xs shrink-0">
              {childData?.student.name.slice(0, 2).toUpperCase() || 'AN'}
            </div>
            <div className="min-w-0">
              {/* Eyebrow */}
              <div className="text-indigo-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-0.5">
                Rekam Jejak & Portofolio Ananda
              </div>

              {/* Title + NIS Badge */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 flex-wrap leading-tight">
                <span>Rekam Jejak Perkembangan</span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {childData?.student.name || 'Memuat Profil...'}
                </span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  NIS {childData?.student.nis}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenQuickCaptureForChild(studentId)}
              className="hidden sm:flex px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>+ Momen Ananda</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTEXT & STATUS RIBBON (Amanaura Standard Matching Pill Strips) */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
          {/* Badge 1: Academic & Curriculum Info */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>TA 2026/2027</span>
            <span className="text-slate-300">•</span>
            <span>GANJIL</span>
            <span className="text-slate-300">•</span>
            <span>Kurikulum Merdeka TK</span>
          </div>

          {/* Badge 2: LPPA Readiness Metric */}
          <div className="flex items-center">
            {childData?.student.lppa_ready_percentage !== undefined && (
              <span className="px-3 py-1 text-[11px] font-semibold rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 inline-flex items-center gap-1.5 shadow-2xs">
                <Award className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kesiapan LPPA {childData.student.lppa_ready_percentage}%</span>
              </span>
            )}
          </div>
        </div>

        {/* Sub-Tabs (Fluid Pill Bar) */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-4 py-2 gap-2 overflow-x-auto scrollbar-hide shrink-0">
          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'EVIDENCE'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Award className="w-3.5 h-3.5 text-indigo-600" />
            <span>Portofolio & Bukti ({childData?.evidence_portfolio.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'ATTENDANCE'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 text-emerald-600" />
            <span>Riwayat Presensi ({childData?.attendance_history.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'HEALTH'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-rose-500" />
            <span>Kesehatan & Alergi</span>
          </button>

          <button
            onClick={() => setActiveTab('LPPA')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'LPPA'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-purple-600" />
            <span>Status Rapor LPPA</span>
          </button>
        </div>

        {/* Tab Contents: Full-height internal scroll */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 text-xs">
          {loading ? (
            <div className="py-16 text-center text-slate-400 font-medium">Memuat rekam jejak ananda...</div>
          ) : activeTab === 'EVIDENCE' ? (
            <div>
              {childData?.evidence_portfolio && childData.evidence_portfolio.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {childData.evidence_portfolio.map(obs => (
                    <div key={obs.id} className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-bold text-slate-900 text-xs uppercase tracking-wide">{obs.domain}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                              {obs.milestone_rating}
                            </span>
                            {obs.is_staff_confidential ? (
                              <Lock className="w-3.5 h-3.5 text-amber-600" />
                            ) : obs.is_shared_with_guardian ? (
                              <Share2 className="w-3.5 h-3.5 text-teal-600" />
                            ) : null}
                          </div>
                        </div>
                        {obs.media_url && (
                          <img src={obs.media_url} alt="Karya" className="rounded-xl h-36 w-full object-cover mb-2.5 border border-slate-100" />
                        )}
                        <p className="text-slate-600 leading-relaxed font-normal">{obs.anecdote_description}</p>
                      </div>
                      <div className="text-[11px] text-slate-400 font-medium pt-2 border-t border-slate-100 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Dicatat oleh {obs.recorded_by_name} • {new Date(obs.recorded_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <Award className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada portofolio tersimpan</p>
                  <p className="text-xs text-slate-400 mt-1">Gunakan tombol "+ Momen Ananda" untuk mencatat bukti belajar.</p>
                </div>
              )}
            </div>
          ) : activeTab === 'ATTENDANCE' ? (
            <div className="space-y-2">
              {childData?.attendance_history && childData.attendance_history.length > 0 ? (
                <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                  {childData.attendance_history.map((att, idx) => (
                    <div key={idx} className="p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-slate-50/50 transition">
                      <div>
                        <div className="font-bold text-slate-900 text-xs">{att.date}</div>
                        {att.notes && <div className="text-slate-500 text-[11px] font-medium mt-0.5">{att.notes}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        {att.temperature && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {att.temperature}°C
                          </span>
                        )}
                        <span className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                          att.status === 'HADIR' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          att.status === 'SAKIT' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                          att.status === 'IZIN' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}>
                          {att.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-slate-400">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-semibold text-slate-700">Belum ada riwayat presensi tercatat</p>
                </div>
              )}
            </div>
          ) : activeTab === 'HEALTH' ? (
            <div className="space-y-4 max-w-2xl">
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80">
                <h4 className="font-bold text-amber-950 flex items-center gap-1.5 mb-1.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" /> 
                  <span>Informasi Alergi & Perhatian Khusus</span>
                </h4>
                <p className="text-amber-900 font-medium text-xs leading-relaxed">
                  {childData?.student.allergies || 'Tidak ada catatan alergi tercatat.'}
                </p>
                {childData?.student.special_needs_notes && (
                  <p className="text-amber-900 mt-2 pt-2 border-t border-amber-200/60 font-medium text-xs">
                    <strong>Kebutuhan Khusus:</strong> {childData.student.special_needs_notes}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-500 text-[11px] font-semibold">Golongan Darah</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {childData?.student.blood_type || 'Belum diisi'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[11px] font-semibold">Tanggal Lahir</div>
                    <div className="text-sm font-bold text-slate-900 mt-0.5">
                      {childData?.student.birth_date || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-xs">Status Sintesis Rapor Semester</h4>
                  <span className="px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {childData?.lppa_summary.status || 'DRAFT'}
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-900">{childData?.lppa_summary.domains_covered || 0}</strong> Dimensi Pembelajaran PAUD telah terpenuhi buktinya.
                </p>
                {childData?.lppa_summary.homeroom_feedback && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 italic">
                    "{childData.lppa_summary.homeroom_feedback}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Floating Action Footer */}
        <div className="sm:hidden p-3 border-t border-slate-100 bg-white shrink-0">
          <button
            type="button"
            onClick={() => onOpenQuickCaptureForChild(studentId)}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex justify-center items-center gap-1.5 shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>+ Momen Ananda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
