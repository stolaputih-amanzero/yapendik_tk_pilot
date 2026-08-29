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
    <div className="fixed inset-0 z-70 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface rounded-t-3xl medium:rounded-card border-t medium:border border-line w-full max-w-5xl h-[90vh] medium:h-[85vh] shadow-floating overflow-hidden flex flex-col">
        {/* Header: Amanaura Standard Eyebrow + Title + Actions */}
        <div className="px-4 medium:px-5 py-3 medium:py-3 border-b border-line-soft bg-surface flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3 pr-6 medium:pr-0 min-w-0">
            <div className="w-10 h-10 rounded-card bg-lppa-tint border border-indigo-100 flex items-center justify-center text-lppa-deep font-bold text-sm shadow-hairline shrink-0">
              {childData?.student.name.slice(0, 2).toUpperCase() || 'AN'}
            </div>
            <div className="min-w-0">
              {/* Eyebrow */}
              <div className="text-lppa text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-0.5">
                Rekam Jejak & Portofolio Ananda
              </div>

              {/* Title + NIS Badge */}
              <h3 className="text-sm medium:text-base font-bold text-ink flex items-center gap-2 flex-wrap leading-tight">
                <span>Rekam Jejak Perkembangan</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line">
                  {childData?.student.name || 'Memuat Profil...'}
                </span>
                <span className="text-xs font-mono font-medium px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line whitespace-nowrap">
                  NIS {childData?.student.nis}
                </span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenQuickCaptureForChild(studentId)}
              className="hidden medium:flex px-3 py-1 rounded-field bg-brand hover-only:bg-surface-inset text-on-brand font-bold text-xs items-center gap-2 shadow-hairline transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-brass fill-brass" />
              <span>+ Momen Ananda</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 medium:p-2 rounded-field text-ink-faint hover-only:text-ink-soft hover-only:bg-surface-subtle transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTEXT & STATUS RIBBON (Amanaura Standard Matching Pill Strips) */}
        <div className="px-4 medium:px-5 py-2 border-b border-line-soft bg-surface-subtle/60 flex flex-col medium:flex-row items-start medium:items-center justify-between gap-2 shrink-0">
          {/* Badge 1: Academic & Curriculum Info */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line text-[11px] font-medium text-ink-soft shadow-hairline">
            <Calendar className="w-4 h-4 text-ink-faint shrink-0" />
            <span>TA 2026/2027</span>
            <span className="text-ink-faint">•</span>
            <span>GANJIL</span>
            <span className="text-ink-faint">•</span>
            <span>Kurikulum Merdeka TK</span>
          </div>

          {/* Badge 2: LPPA Readiness Metric */}
          <div className="flex items-center">
            {childData?.student.lppa_ready_percentage !== undefined && (
              <span className="px-3 py-1 text-[11px] font-semibold rounded-full border border-success-line bg-success-tint text-success-deep inline-flex items-center gap-2 shadow-hairline">
                <Award className="w-4 h-4 text-success" />
                <span>Kesiapan LPPA {childData.student.lppa_ready_percentage}%</span>
              </span>
            )}
          </div>
        </div>

        {/* Sub-Tabs (Fluid Pill Bar) */}
        <div className="flex border-b border-line-soft bg-surface-subtle/70 px-4 py-2 gap-2 overflow-x-auto scrollbar-hide shrink-0 min-w-0">
          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`px-3 py-1 text-xs font-bold rounded-field transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'EVIDENCE'
                ? 'bg-surface text-ink shadow-hairline border border-line'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/60'
            }`}
          >
            <Award className="w-4 h-4 text-lppa" />
            <span>Portofolio & Bukti ({childData?.evidence_portfolio.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`px-3 py-1 text-xs font-bold rounded-field transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'ATTENDANCE'
                ? 'bg-surface text-ink shadow-hairline border border-line'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/60'
            }`}
          >
            <Calendar className="w-4 h-4 text-success" />
            <span>Riwayat Presensi ({childData?.attendance_history.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`px-3 py-1 text-xs font-bold rounded-field transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'HEALTH'
                ? 'bg-surface text-ink shadow-hairline border border-line'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/60'
            }`}
          >
            <Heart className="w-4 h-4 text-danger" />
            <span>Kesehatan & Alergi</span>
          </button>

          <button
            onClick={() => setActiveTab('LPPA')}
            className={`px-3 py-1 text-xs font-bold rounded-field transition flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === 'LPPA'
                ? 'bg-surface text-ink shadow-hairline border border-line'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/60'
            }`}
          >
            <BookOpen className="w-4 h-4 text-lppa" />
            <span>Status Rapor LPPA</span>
          </button>
        </div>

        {/* Tab Contents: Full-height internal scroll */}
        <div className="overflow-y-auto flex-1 p-4 medium:p-6 text-xs">
          {loading ? (
            <div className="py-16 text-center text-ink-faint font-medium">Memuat rekam jejak ananda...</div>
          ) : activeTab === 'EVIDENCE' ? (
            <div>
              {childData?.evidence_portfolio && childData.evidence_portfolio.length > 0 ? (
                <div className="grid grid-cols-1 medium:grid-cols-2 gap-4">
                  {childData.evidence_portfolio.map(obs => (
                    <div key={obs.id} className="p-4 rounded-card border border-line bg-surface shadow-hairline space-y-3 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-bold text-ink text-xs uppercase tracking-wider tracking-wide">{obs.domain}</span>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-lppa-tint text-lppa-deep border border-lppa-line">
                              {obs.milestone_rating}
                            </span>
                            {obs.is_staff_confidential ? (
                              <Lock className="w-4 h-4 text-brass" />
                            ) : obs.is_shared_with_guardian ? (
                              <Share2 className="w-4 h-4 text-teal-600" />
                            ) : null}
                          </div>
                        </div>
                        {obs.media_url && (
                          <img src={obs.media_url} alt="Karya" className="rounded-field h-36 w-full object-cover mb-2.5 border border-line-soft" />
                        )}
                        <p className="text-ink-soft leading-relaxed font-normal">{obs.anecdote_description}</p>
                      </div>
                      <div className="text-[11px] text-ink-faint font-medium pt-2 border-t border-line-soft flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Dicatat oleh {obs.recorded_by_name} • {new Date(obs.recorded_at).toLocaleDateString('id-ID')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-ink-faint">
                  <Award className="w-10 h-10 mx-auto mb-2 text-ink-faint" />
                  <p className="text-sm font-semibold text-ink-soft">Belum ada portofolio tersimpan</p>
                  <p className="text-xs text-ink-faint mt-1">Gunakan tombol "+ Momen Ananda" untuk mencatat bukti belajar.</p>
                </div>
              )}
            </div>
          ) : activeTab === 'ATTENDANCE' ? (
            <div className="space-y-2">
              {childData?.attendance_history && childData.attendance_history.length > 0 ? (
                <div className="divide-y divide-line-soft border border-line rounded-card overflow-hidden bg-surface shadow-hairline">
                  {childData.attendance_history.map((att, idx) => (
                    <div key={idx} className="p-3 medium:p-4 flex flex-col medium:flex-row items-start medium:items-center justify-between gap-2 hover-only:bg-surface-subtle/50 transition">
                      <div>
                        <div className="font-bold text-ink text-xs">{att.date}</div>
                        {att.notes && <div className="text-ink-soft text-[11px] font-medium mt-0.5">{att.notes}</div>}
                      </div>
                      <div className="flex items-center gap-2">
                        {att.temperature && (
                          <span className="text-[11px] font-semibold px-2 py-1 rounded-md bg-surface-subtle text-ink-soft border border-line">
                            {att.temperature}°C
                          </span>
                        )}
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${
                          att.status === 'HADIR' ? 'bg-success-tint text-success-deep border-success-line' :
                          att.status === 'SAKIT' ? 'bg-warning-tint text-warning-deep border-warning-line' :
                          att.status === 'IZIN' ? 'bg-info-tint text-info-deep border-info-line' : 'bg-danger-tint text-danger-deep border-danger-line'
                        }`}>
                          {att.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center text-ink-faint">
                  <Calendar className="w-10 h-10 mx-auto mb-2 text-ink-faint" />
                  <p className="text-sm font-semibold text-ink-soft">Belum ada riwayat presensi tercatat</p>
                </div>
              )}
            </div>
          ) : activeTab === 'HEALTH' ? (
            <div className="space-y-4 max-w-2xl">
              <div className="p-4 rounded-card bg-warning-tint/70 border border-warning-line/80">
                <h4 className="font-bold text-warning-deep flex items-center gap-2 mb-1.5 text-xs">
                  <AlertCircle className="w-4 h-4 text-warning-deep shrink-0" /> 
                  <span>Informasi Alergi & Perhatian Khusus</span>
                </h4>
                <p className="text-warning-deep font-medium text-xs leading-relaxed">
                  {childData?.student.allergies || 'Tidak ada catatan alergi tercatat.'}
                </p>
                {childData?.student.special_needs_notes && (
                  <p className="text-warning-deep mt-2 pt-2 border-t border-warning-line/60 font-medium text-xs">
                    <strong>Kebutuhan Khusus:</strong> {childData.student.special_needs_notes}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-card bg-surface-subtle border border-line">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-ink-soft text-[11px] font-semibold">Golongan Darah</div>
                    <div className="text-sm font-bold text-ink mt-0.5">
                      {childData?.student.blood_type || 'Belum diisi'}
                    </div>
                  </div>
                  <div>
                    <div className="text-ink-soft text-[11px] font-semibold">Tanggal Lahir</div>
                    <div className="text-sm font-bold text-ink mt-0.5">
                      {childData?.student.birth_date || '-'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-2xl">
              <div className="p-4 rounded-card bg-surface border border-line shadow-hairline space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-ink text-xs">Status Sintesis Rapor Semester</h4>
                  <span className="px-2 py-1 text-[10px] font-bold rounded-full bg-lppa-tint text-lppa-deep border border-lppa-line">
                    {childData?.lppa_summary.status || 'DRAFT'}
                  </span>
                </div>
                <p className="text-xs text-ink-soft">
                  <strong className="text-ink">{childData?.lppa_summary.domains_covered || 0}</strong> Dimensi Pembelajaran PAUD telah terpenuhi buktinya.
                </p>
                {childData?.lppa_summary.homeroom_feedback && (
                  <div className="p-3 bg-surface-subtle rounded-field border border-line text-xs text-ink-soft italic">
                    "{childData.lppa_summary.homeroom_feedback}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile Floating Action Footer */}
        <div className="medium:hidden p-3 border-t border-line-soft bg-surface shrink-0">
          <button
            type="button"
            onClick={() => onOpenQuickCaptureForChild(studentId)}
            className="w-full py-2 rounded-field bg-brand hover-only:bg-surface-inset text-on-brand font-bold text-xs flex justify-center items-center gap-2 shadow-hairline transition"
          >
            <Sparkles className="w-4 h-4 text-brass fill-brass" />
            <span>+ Momen Ananda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
