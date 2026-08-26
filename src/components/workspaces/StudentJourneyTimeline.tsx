/**
 * Yapendik School OS — Stage 3.4-E: Student Longitudinal Journey Timeline
 * 
 * Governed Visual Interface for Child Developmental Continuum:
 * - Invokes fn_get_student_longitudinal_trajectory(student_id)
 * - Chronological Multi-Year Placement Curve (ACTIVE -> PROMOTED -> COMPLETED)
 * - Longitudinal LPPA Progress Reports Ledger
 * - Strict Legal Guardian Privacy Boundary
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { db } from '../../db/database';
import { studentTrajectoryService, StudentLongitudinalTrajectory } from '../../services/studentTrajectoryService';
import { translateGovernanceError, TranslatedGovernanceError } from '../../services/governanceErrorTranslator';
import { lppaReportingService } from '../../services/lppaReportingService';
import { childContinuityService } from '../../services/childContinuityService';
import { LearningStimulationPlan } from '../../types/childContinuityTypes';
import { LppaPrintPreviewModal } from './teacher/LppaPrintPreviewModal';
import { CanonicalPublishedLppaRecord } from '../../types/lppaReportingTypes';
import { 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Calendar, 
  GraduationCap, 
  Sparkles, 
  UserCheck, 
  RefreshCw, 
  ArrowRight, 
  Award, 
  FileText, 
  Lock, 
  HeartHandshake,
  Baby,
  ChevronRight,
  BookOpen,
  Printer,
  Lightbulb,
  Send
} from 'lucide-react';

export const StudentJourneyTimeline: React.FC<{ initialStudentId?: string }> = ({ initialStudentId }) => {
  const { securityContext, currentPersona } = useSecurityContext();
  const currentSchoolId = securityContext?.activeSchoolId || 'sch_tk_yapendik_01';
  const isGuardian = currentPersona?.role === 'PARENT_BUDI' || securityContext?.role === 'GUARDIAN';

  const [studentsList, setStudentsList] = useState<Array<{ id: string; name: string; nis: string; status: string }>>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  const [trajectory, setTrajectory] = useState<StudentLongitudinalTrajectory | null>(null);
  const [homePlans, setHomePlans] = useState<LearningStimulationPlan[]>([]);
  const [reflectionInput, setReflectionInput] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<TranslatedGovernanceError | null>(null);
  const [previewRecord, setPreviewRecord] = useState<CanonicalPublishedLppaRecord | null>(null);

  // Load available students based on role
  useEffect(() => {
    const loadStudents = () => {
      if (isGuardian && securityContext?.guardianChildrenPersonIds) {
        const guardianStudents = db.getStudents(currentSchoolId)
          .filter(s => securityContext.guardianChildrenPersonIds?.includes(s.personId));
        
        const mapped = guardianStudents.map(s => {
          const p = db.getPersonById(s.personId);
          return { id: s.id, name: p?.fullName || 'Anak Anda', nis: s.nis, status: s.status };
        });
        setStudentsList(mapped);
        if (mapped.length > 0 && !selectedStudentId) {
          setSelectedStudentId(mapped[0].id);
        }
      } else {
        const allStudents = db.getStudents(currentSchoolId);
        const mapped = allStudents.map(s => {
          const p = db.getPersonById(s.personId);
          return { id: s.id, name: p?.fullName || 'Nama Siswa', nis: s.nis, status: s.status };
        });
        setStudentsList(mapped);
        if (mapped.length > 0 && !selectedStudentId) {
          setSelectedStudentId(mapped[0].id);
        }
      }
    };

    loadStudents();
  }, [currentSchoolId, isGuardian, securityContext]);

  // Load trajectory & home-school plans when selectedStudentId changes
  const loadTrajectory = async () => {
    if (!selectedStudentId) return;
    setRefreshing(true);
    setErrorFeedback(null);
    try {
      const data = await studentTrajectoryService.getStudentLongitudinalTrajectory(selectedStudentId);
      setTrajectory(data);

      const allPlans = await childContinuityService.getActiveLearningStimulationPlans(currentSchoolId, undefined, selectedStudentId);
      const sharedActive = allPlans.filter(p => p.status === 'ACTIVE' && p.home_school_extension?.is_shared_with_home);
      setHomePlans(sharedActive);
    } catch (err: any) {
      const diag = (err as any).diagnostics || translateGovernanceError(err);
      setErrorFeedback(diag);
      setTrajectory(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleSendHomeReflection = async (planId: string) => {
    const note = reflectionInput[planId];
    if (!note || !selectedStudentId) return;
    setIsSubmitting(true);
    try {
      await childContinuityService.recordHomeStimulationFeedback({
        plan_id: planId,
        school_id: currentSchoolId,
        student_id: selectedStudentId,
        guardian_person_id: currentPersona?.personId || 'per_parent_budi',
        guardian_name: currentPersona?.name || 'Budi Santoso, S.T.',
        home_reflection_notes: note,
        role: isGuardian ? 'GUARDIAN' : 'PARENT_BUDI'
      });
      await loadTrajectory();
    } catch (err) {
      console.error('Failed to submit home reflection:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedStudentId) {
      loadTrajectory();
    }
  }, [selectedStudentId]);

  const selectedStudentMeta = studentsList.find(s => s.id === selectedStudentId);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6 text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold tracking-wider uppercase mb-1">
              <Compass className="w-4 h-4" />
              <span>Stage 3.4 • Child Longitudinal Continuity & Trajectory</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Linimasa & Kurva Rekam Jejak Perkembangan Anak
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Rekonstruksi perjalanan historis multi-tahun anak dari awal penempatan rombel hingga kelulusan resmi.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {/* Student Selector (if not single guardian child) */}
            {studentsList.length > 1 && (
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-medium"
              >
                {studentsList.map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({s.nis})</option>
                ))}
              </select>
            )}

            <button
              onClick={loadTrajectory}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center space-x-2 transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-amber-400' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error / Privacy Boundary Warning */}
      {errorFeedback && (
        <div className="p-4 rounded-xl border bg-rose-950/40 border-rose-500/40 text-rose-300 flex items-start space-x-3 text-xs animate-in fade-in">
          <Lock className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">{errorFeedback.title}</p>
            <p className="mt-0.5 opacity-90">{errorFeedback.message}</p>
            {errorFeedback.actionSuggestion && (
              <p className="mt-2 text-amber-300 font-medium bg-amber-950/40 p-2 rounded-lg border border-amber-500/20">
                💡 Rekomendasi: {errorFeedback.actionSuggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Trajectory Main Content */}
      {trajectory && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Student Identity Profile Card (4 Cols) */}
          <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
                <Baby className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{selectedStudentMeta?.name || 'Profil Siswa'}</h3>
                <p className="text-xs text-slate-400 font-mono">NIS: {trajectory.nis || '—'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex justify-between text-slate-400">
                  <span>Status Lembaga:</span>
                  <span className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                    trajectory.current_status === 'GRADUATED' 
                      ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30' 
                      : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  }`}>
                    {trajectory.current_status}
                  </span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Periode Penempatan:</span>
                  <span className="font-bold text-white">{trajectory.placement_lineage.length} Semester</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Laporan LPPA Terbit:</span>
                  <span className="font-bold text-amber-400">{trajectory.lppa_history.length} Laporan</span>
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 text-slate-400 text-[11px] space-y-1.5">
                <div className="flex items-center space-x-1.5 text-amber-400 font-semibold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Jaminan Privasi Keluarga (C-11)</span>
                </div>
                <p className="leading-relaxed">
                  Rekam jejak longitudinal anak dilindungi secara kriptografis dan hanya dapat diakses oleh Orang Tua/Wali Sah terdaftar serta staf pendidik berwenang.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Chronological Placement Lineage & LPPA Timeline (8 Cols) */}
          <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Kurva Linimasa</span>
                <h3 className="text-base font-bold text-white mt-0.5">Riwayat Penempatan & Rapor Perkembangan</h3>
              </div>
              <span className="text-xs text-amber-400 font-mono bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                Kronologis Kanonikal
              </span>
            </div>

            {/* Stage 4.3-D: Home-School Growth Bridge (Guardian Collaborative Reflection) */}
            {homePlans.length > 0 && (
              <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-5 space-y-4 shadow-lg">
                <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Kemitraan Tumbuh Kembang di Rumah</h4>
                      <p className="text-xs text-indigo-300 font-medium mt-0.5">
                        Saran stimulasi bermain bersama keluarga dari Guru Kelas
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Kolaborasi Non-Authoritative
                  </span>
                </div>

                {homePlans.map(plan => {
                  const isAck = plan.home_school_extension?.parent_acknowledgment_status === 'ACKNOWLEDGED';
                  return (
                    <div key={plan.plan_id} className="bg-slate-950/80 p-4 rounded-xl border border-indigo-500/30 space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          Saran Stimulasi dari Ibu Guru ({plan.target_element_key.replace('_', ' ')}):
                        </span>
                        <p className="text-xs text-white font-medium mt-1 leading-relaxed">
                          "{plan.home_school_extension?.home_activity_prompt}"
                        </p>
                      </div>

                      {isAck ? (
                        <div className="bg-emerald-950/40 p-3 rounded-lg border border-emerald-500/30 space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Terkonfirmasi oleh Orang Tua ({new Date(plan.home_school_extension?.parent_acknowledged_at || '').toLocaleDateString('id-ID')})</span>
                          </div>
                          <p className="text-xs text-emerald-200 italic">
                            "{plan.home_school_extension?.parent_reflection_notes}"
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1 border-t border-slate-800">
                          <label className="text-[11px] font-medium text-slate-300">
                            Catatan Respon / Refleksi Keluarga:
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={reflectionInput[plan.plan_id] || ''}
                              onChange={e => setReflectionInput({ ...reflectionInput, [plan.plan_id]: e.target.value })}
                              placeholder="Ceritakan aktivitas bermain bersama anak di rumah..."
                              className="flex-1 px-3 py-2 text-xs rounded-lg bg-slate-900 border border-slate-700 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            />
                            <button
                              onClick={() => handleSendHomeReflection(plan.plan_id)}
                              disabled={isSubmitting || !reflectionInput[plan.plan_id]}
                              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Kirim</span>
                            </button>
                          </div>
                        </div>
                      )}

                      <p className="text-[10px] text-slate-500 italic">
                        💡 Catatan: Refleksi keluarga memperkaya pemahaman guru di sekolah tanpa memutasi rapor kanonikal.
                      </p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Vertical Milestones Timeline */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {trajectory.placement_lineage.map((plc, idx) => {
                const matchedLppa = trajectory.lppa_history.find(
                  l => l.academic_year_id === plc.academic_year_id && l.semester === plc.semester
                );

                return (
                  <div key={plc.placement_id} className="relative group">
                    {/* Node Dot */}
                    <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-slate-950 flex items-center justify-center ${
                      plc.placement_status === 'COMPLETED'
                        ? 'border-purple-500 text-purple-400 shadow-md shadow-purple-500/20'
                        : plc.placement_status === 'ACTIVE'
                        ? 'border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'border-blue-500 text-blue-400'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        plc.placement_status === 'COMPLETED' ? 'bg-purple-400' : plc.placement_status === 'ACTIVE' ? 'bg-emerald-400' : 'bg-blue-400'
                      }`}></div>
                    </div>

                    {/* Milestone Card */}
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 transition-all group-hover:border-slate-700">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-white">{plc.academic_year_name} ({plc.semester})</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                              plc.placement_status === 'COMPLETED'
                                ? 'bg-purple-500/10 text-purple-400 border border-purple-500/30'
                                : plc.placement_status === 'ACTIVE'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            }`}>
                              {plc.placement_status}
                            </span>
                          </div>
                          <p className="text-xs text-amber-400 font-semibold mt-0.5">{plc.class_name}</p>
                        </div>

                        <div className="text-[11px] font-mono text-slate-500">
                          {plc.entry_date} s.d. {plc.exit_date || 'Sekarang'}
                        </div>
                      </div>

                      {/* Promotion or Exit Remarks */}
                      {plc.promotion_remarks && (
                        <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                          📝 {plc.promotion_remarks}
                        </p>
                      )}

                      {/* LPPA Report Section for this period */}
                      {matchedLppa ? (
                        <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-purple-400 font-semibold">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Laporan Capaian Perkembangan Anak (LPPA)</span>
                            </div>
                            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border ${
                              matchedLppa.status === 'PUBLISHED'
                                ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            }`}>
                              {matchedLppa.status}
                            </span>
                          </div>

                          {matchedLppa.homeroom_feedback && (
                            <p className="text-slate-300 text-[11px] italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                              "{matchedLppa.homeroom_feedback}"
                            </p>
                          )}

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                            {matchedLppa.headmaster_approval_date ? (
                              <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-mono">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Disahkan Kepala Sekolah • {new Date(matchedLppa.headmaster_approval_date).toLocaleDateString('id-ID')}</span>
                              </div>
                            ) : <div></div>}

                            <button
                              onClick={async () => {
                                const fullDoc = await lppaReportingService.getLppaReport(matchedLppa.report_id, currentSchoolId);
                                if (fullDoc) {
                                  const canonical = lppaReportingService.toCanonicalPublishedRecord(
                                    fullDoc,
                                    'TK Yapendik 01 Menteng',
                                    '20104821',
                                    plc.class_name,
                                    'Siti Rahmawati, S.Pd',
                                    'Dra. Esther Nugroho, M.Pd'
                                  );
                                  setPreviewRecord(canonical);
                                }
                              }}
                              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ml-auto"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>🖨️ Buka Rapor Resmi (PDF)</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-slate-500 italic">
                          Belum ada laporan perkembangan LPPA yang diterbitkan untuk semester ini.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Official Canonical Print Preview Modal (Fase E2-E4) */}
      {previewRecord && (
        <LppaPrintPreviewModal
          isOpen={Boolean(previewRecord)}
          onClose={() => setPreviewRecord(null)}
          record={previewRecord}
        />
      )}
    </div>
  );
};
