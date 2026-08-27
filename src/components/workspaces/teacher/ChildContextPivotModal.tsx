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
  MessageSquare, 
  Clock, 
  Thermometer, 
  Lock, 
  Share2, 
  FileText,
  AlertCircle
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header: Child Summary */}
        <div className="p-4 sm:p-5 bg-slate-50 text-slate-900 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5 pr-8 sm:pr-0">
            <div className="w-12 h-12 rounded-2xl bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-800 text-base font-bold shadow-2xs shrink-0">
              {childData?.student.name.slice(0, 2).toUpperCase() || 'AN'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">
                  {childData?.student.name || 'Memuat...'}
                </h3>
                <span className="px-2 py-0.5 text-[11px] font-mono rounded-md bg-slate-200 text-slate-700">
                  NIS {childData?.student.nis}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-1.5">
                <span>{childData?.evidence_portfolio.length || 0} Bukti Karya Semester</span>
                <span className="hidden sm:inline">•</span>
                <span>LPPA Kesiapan: <strong className="text-emerald-700 font-bold">{childData?.student.lppa_ready_percentage}%</strong></span>
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => onOpenQuickCaptureForChild(studentId)}
              className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex justify-center items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>+ Momen Ananda</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 px-4 sm:px-6 pt-3 border-b border-slate-200 bg-slate-50 text-xs font-bold overflow-x-auto whitespace-nowrap">
          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`pb-3 px-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'EVIDENCE'
                ? 'border-indigo-600 text-indigo-700 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Portofolio & Bukti ({childData?.evidence_portfolio.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('ATTENDANCE')}
            className={`pb-3 px-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ATTENDANCE'
                ? 'border-indigo-600 text-indigo-700 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Riwayat Presensi ({childData?.attendance_history.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`pb-3 px-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'HEALTH'
                ? 'border-indigo-600 text-indigo-700 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>Kesehatan & Alergi</span>
          </button>

          <button
            onClick={() => setActiveTab('LPPA')}
            className={`pb-3 px-2 border-b-2 transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'LPPA'
                ? 'border-indigo-600 text-indigo-700 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Sintesis Rapor LPPA</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 text-xs">
          {loading ? (
            <div className="py-12 text-center text-slate-500 font-medium">Memuat rekam jejak ananda...</div>
          ) : activeTab === 'EVIDENCE' ? (
            <div className="space-y-3">
              {childData?.evidence_portfolio && childData.evidence_portfolio.length > 0 ? (
                childData.evidence_portfolio.map(obs => (
                  <div key={obs.id} className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-indigo-700">{obs.domain}</span>
                      <div className="flex items-center gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                          {obs.milestone_rating}
                        </span>
                        {obs.is_staff_confidential ? (
                          <Lock className="w-3.5 h-3.5 text-amber-700" />
                        ) : obs.is_shared_with_guardian ? (
                          <Share2 className="w-3.5 h-3.5 text-teal-700" />
                        ) : null}
                      </div>
                    </div>
                    {obs.media_url && (
                      <img src={obs.media_url} alt="Karya" className="rounded-xl h-28 w-full object-cover mb-2" />
                    )}
                    <p className="text-slate-800 leading-relaxed font-normal">{obs.anecdote_description}</p>
                    <div className="text-[10px] text-slate-500 font-semibold mt-2">
                      Dicatat oleh {obs.recorded_by_name} • {new Date(obs.recorded_at).toLocaleDateString('id-ID')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-500">Belum ada portofolio tersimpan untuk ananda ini.</div>
              )}
            </div>
          ) : activeTab === 'ATTENDANCE' ? (
            <div className="space-y-2">
              {childData?.attendance_history && childData.attendance_history.length > 0 ? (
                childData.attendance_history.map((att, idx) => (
                  <div key={idx} className="p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-white shadow-xs">
                    <div>
                      <div className="font-bold text-slate-900">{att.date}</div>
                      {att.notes && <div className="text-slate-600 text-[11px] font-medium">{att.notes}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      {att.temperature && (
                        <span className="text-[11px] font-semibold text-slate-700">
                          {att.temperature}°C
                        </span>
                      )}
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                        att.status === 'HADIR' ? 'bg-emerald-100 text-emerald-800' :
                        att.status === 'SAKIT' ? 'bg-amber-100 text-amber-800' :
                        att.status === 'IZIN' ? 'bg-sky-100 text-sky-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {att.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-10 text-center text-slate-500">Belum ada riwayat kehadiran tercatat.</div>
              )}
            </div>
          ) : activeTab === 'HEALTH' ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <h4 className="font-bold text-amber-900 flex items-center gap-1.5 mb-1">
                  <AlertCircle className="w-4 h-4 text-amber-700" /> Informasi Alergi & Kondisi Khusus
                </h4>
                <p className="text-amber-900 font-medium">
                  {childData?.student.allergies || 'Tidak ada catatan alergi tercatat.'}
                </p>
                {childData?.student.special_needs_notes && (
                  <p className="text-amber-900 mt-2 pt-2 border-t border-amber-200 font-medium">
                    <strong>Kebutuhan Khusus:</strong> {childData.student.special_needs_notes}
                  </p>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-slate-600 text-[11px] font-semibold">Golongan Darah</div>
                    <div className="text-base font-black text-slate-900">
                      {childData?.student.blood_type || 'Belum diisi'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-600 text-[11px] font-semibold">Tanggal Lahir</div>
                    <div className="text-base font-black text-slate-900">
                      {childData?.student.birth_date || '2020-01-01'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200">
                <h4 className="font-bold text-indigo-900 mb-1">Status Rapor Semester</h4>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 text-xs font-bold rounded-xl bg-indigo-600 text-white">
                    {childData?.lppa_summary.status || 'DRAFT'}
                  </span>
                  <span className="text-slate-800 font-semibold">
                    {childData?.lppa_summary.domains_covered || 0} Dimensi PAUD Terpenuhi
                  </span>
                </div>
                {childData?.lppa_summary.homeroom_feedback && (
                  <p className="mt-3 text-slate-800 italic font-normal">
                    "{childData.lppa_summary.homeroom_feedback}"
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
