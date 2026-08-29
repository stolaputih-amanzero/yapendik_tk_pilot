import { SelectSheet } from '../ui';
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
    <div className="w-full space-y-6 text-ink font-sans pb-[132px] expanded:pb-8">
      {/* Header Banner */}
      <div className="bg-surface-subtle border-b border-line expanded:rounded-card px-4 py-5 medium:p-6 relative overflow-hidden expanded:border expanded:shadow-hairline w-full">
        <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-4 relative z-10">
          <div className="flex items-start justify-between gap-4 w-full medium:w-auto">
            <div>
              <div className="flex items-center space-x-1.5 text-success text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
                <Compass className="w-4 h-4" />
                <span>Rekam Jejak Siswa</span>
              </div>
              <h1 className="text-xl medium:text-2xl font-bold text-ink tracking-tight">
                Linimasa & Kurva Rekam Jejak Perkembangan Anak
              </h1>
              <p className="text-ink-soft text-xs medium:text-sm mt-0.5">
                Rekonstruksi perjalanan historis multi-tahun anak dari awal penempatan rombel hingga kelulusan resmi.
              </p>
            </div>
            <button
              onClick={loadTrajectory}
              disabled={refreshing}
              className="flex expanded:hidden items-center justify-center p-2 rounded-lg bg-surface hover-only:bg-surface-subtle text-ink-soft border border-line text-xs font-medium transition-colors shadow-hairline shrink-0 cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-success' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col medium:flex-row items-stretch medium:items-start gap-3 mt-4 medium:mt-0 w-full medium:w-auto">
            {/* Student Selector (if not single guardian child) */}
            {studentsList.length > 1 && (
              <SelectSheet
    value={selectedStudentId || ''}
    onChange={setSelectedStudentId}
    options={studentsList.map(s => ({ value: s.id, label: `${s.name} (${s.status})` }))}
  />
            )}

            <button
              onClick={loadTrajectory}
              disabled={refreshing}
              className="hidden expanded:flex items-center justify-center gap-2 px-3 py-1 rounded-lg bg-surface hover-only:bg-surface-subtle text-ink-soft border border-line text-xs font-medium transition-colors shadow-hairline shrink-0 cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-success' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 expanded:px-0 space-y-6">

      {/* Error / Privacy Boundary Warning */}
      {errorFeedback && (
        <div className="p-4 rounded-field border bg-danger-tint border-danger-line text-danger-deep flex items-start space-x-3 text-xs animate-in fade-in">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-danger" />
          <div>
            <p className="font-semibold text-danger-deep">{errorFeedback.title}</p>
            <p className="mt-0.5">{errorFeedback.message}</p>
          </div>
        </div>
      )}

      {/* Trajectory Main Content */}
      {trajectory && (
        <div className="grid grid-cols-1 expanded:grid-cols-12 gap-6">
          {/* Left Column: Student Identity Profile Card (4 Cols) */}
          <div className="expanded:col-span-4 bg-surface border-y medium:border border-line medium:rounded-card p-4 medium:p-6 medium:shadow-hairline space-y-6 -mx-4 expanded:mx-0">
            <div className="flex items-center space-x-3 border-b border-line-soft pb-4">
              <div className="w-12 h-12 rounded-card bg-surface-subtle border border-line flex items-center justify-center text-ink-soft font-bold text-lg">
                <Baby className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-ink tracking-tight">{selectedStudentMeta?.name || 'Profil Siswa'}</h3>
                <p className="text-xs text-ink-soft font-mono whitespace-nowrap">NIS: {trajectory.nis || '—'}</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-surface-subtle p-3 rounded-field border border-line space-y-2">
                <div className="flex justify-between text-ink-soft">
                  <span>Status Lembaga:</span>
                  <span className={`font-bold px-2 py-1 rounded text-[10px] uppercase tracking-wider ${
                    trajectory.current_status === 'GRADUATED' 
                      ? 'bg-lppa-tint text-lppa-deep border border-lppa-line' 
                      : 'bg-success-tint text-success-deep border border-success-line'
                  }`}>
                    {trajectory.current_status}
                  </span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Total Periode Penempatan:</span>
                  <span className="font-bold text-ink">{trajectory.placement_lineage.length} Semester</span>
                </div>
                <div className="flex justify-between text-ink-soft">
                  <span>Laporan LPPA Terbit:</span>
                  <span className="font-bold text-ink">{trajectory.lppa_history.length} Laporan</span>
                </div>
              </div>

              <div className="bg-surface-subtle p-3 rounded-field border border-line text-ink-soft text-[11px] space-y-1.5">
                <div className="flex items-center space-x-1.5 text-success-deep font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Jaminan Privasi Keluarga (C-11)</span>
                </div>
                <p className="leading-relaxed text-ink-soft">
                  Rekam jejak longitudinal anak dilindungi secara kriptografis dan hanya dapat diakses oleh Orang Tua/Wali Sah terdaftar serta staf pendidik berwenang.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Chronological Placement Lineage & LPPA Timeline (8 Cols) */}
          <div className="expanded:col-span-8 bg-surface border-y medium:border border-line medium:rounded-card p-4 medium:p-6 medium:shadow-hairline space-y-6 -mx-4 expanded:mx-0">
            <div className="border-b border-line-soft pb-3 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-ink-soft uppercase tracking-wider">Kurva Linimasa</span>
                <h3 className="text-base font-bold text-ink mt-0.5">Riwayat Penempatan & Rapor Perkembangan</h3>
              </div>
              <span className="text-xs text-ink-soft font-mono bg-surface-subtle px-2 py-1 rounded-lg border border-line whitespace-nowrap">
                Riwayat Akademik Resmi
              </span>
            </div>

            {/* Stage 4.3-D: Home-School Growth Bridge (Guardian Collaborative Reflection) */}
            {homePlans.length > 0 && (
              <div className="bg-surface-subtle border-y medium:border border-line medium:rounded-card p-4 medium:p-4 space-y-4 medium:shadow-hairline -mx-4 expanded:mx-0">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-field bg-brand text-on-brand shadow-hairline">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink">Kemitraan Tumbuh Kembang di Rumah</h4>
                      <p className="text-xs text-ink-soft font-medium mt-0.5">
                        Saran stimulasi bermain bersama keluarga dari Guru Kelas
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-lg bg-line-soft text-ink-soft border border-line">
                    Kolaborasi Non-Authoritative
                  </span>
                </div>

                <div className="flex flex-col divide-y divide-line-soft expanded:divide-none medium:space-y-4 -mx-4 expanded:mx-0">
                  {homePlans.map(plan => {
                    const isAck = plan.home_school_extension?.parent_acknowledgment_status === 'ACKNOWLEDGED';
                    return (
                      <div key={plan.plan_id} className="bg-surface px-4 py-4 medium:p-4 border-0 medium:border medium:rounded-field medium:border-line space-y-3">
                      <div>
                        <span className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">
                          Saran Stimulasi dari Ibu Guru ({plan.target_element_key.replace('_', ' ')}):
                        </span>
                        <p className="text-xs text-ink font-medium mt-1 leading-relaxed">
                          "{plan.home_school_extension?.home_activity_prompt}"
                        </p>
                      </div>

                      {isAck ? (
                        <div className="bg-success-tint p-3 rounded-lg border border-success-line space-y-1">
                          <div className="flex items-center gap-2 text-xs font-bold text-success-deep">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Terkonfirmasi oleh Orang Tua ({new Date(plan.home_school_extension?.parent_acknowledged_at || '').toLocaleDateString('id-ID')})</span>
                          </div>
                          <p className="text-xs text-success-deep italic">
                            "{plan.home_school_extension?.parent_reflection_notes}"
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 pt-1 border-t border-line-soft">
                          <label className="text-[11px] font-medium text-ink-soft">
                            Catatan Respon / Refleksi Keluarga:
                          </label>
                          <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-2">
                            <input
                              type="text"
                              value={reflectionInput[plan.plan_id] || ''}
                              onChange={e => setReflectionInput({ ...reflectionInput, [plan.plan_id]: e.target.value })}
                              placeholder="Ceritakan aktivitas bermain bersama anak di rumah..."
                              className="flex-1 px-3 py-2 text-xs rounded-lg bg-surface-subtle border border-line text-ink placeholder:text-ink-faint focus:outline-none focus:border-line-strong"
                            />
                            <button
                              onClick={() => handleSendHomeReflection(plan.plan_id)}
                              disabled={isSubmitting || !reflectionInput[plan.plan_id]}
                              className="w-full medium:w-auto flex justify-center items-center px-3 py-2 medium:py-2 rounded-lg bg-brand hover-only:bg-surface-inset disabled:opacity-50 text-on-brand text-xs font-bold transition gap-2 cursor-pointer shrink-0 shadow-hairline"
                            >
                              <Send className="w-4 h-4" />
                              <span>Kirim</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                </div>
              </div>
            )}

            {/* Vertical Milestones Timeline */}
            <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-line-soft">
              {trajectory.placement_lineage.map((plc, idx) => {
                const matchedLppa = trajectory.lppa_history.find(
                  l => l.academic_year_id === plc.academic_year_id && l.semester === plc.semester
                );

                return (
                  <div key={plc.placement_id} className="relative group">
                    {/* Node Dot */}
                    <div className={`absolute -left-6 top-1 w-5 h-5 rounded-full border-2 bg-surface flex items-center justify-center ${
                      plc.placement_status === 'COMPLETED'
                        ? 'border-purple-600 text-lppa'
                        : plc.placement_status === 'ACTIVE'
                        ? 'border-emerald-600 text-success'
                        : 'border-line-strong text-ink-soft'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        plc.placement_status === 'COMPLETED' ? 'bg-lppa' : plc.placement_status === 'ACTIVE' ? 'bg-success' : 'bg-line-strong'
                      }`}></div>
                    </div>

                    {/* Milestone Card */}
                    <div className="bg-surface-subtle/50 border border-line rounded-field p-4 space-y-3 transition-all group-hover-only:border-line">
                      <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-2 border-b border-line pb-2.5">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-bold text-ink">{plc.academic_year_name} ({plc.semester})</span>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                              plc.placement_status === 'COMPLETED'
                                ? 'bg-lppa-tint text-lppa-deep border border-lppa-line'
                                : plc.placement_status === 'ACTIVE'
                                ? 'bg-success-tint text-success-deep border border-success-line'
                                : 'bg-surface-subtle text-ink-soft border border-line'
                            }`}>
                              {plc.placement_status}
                            </span>
                          </div>
                          <p className="text-xs text-ink-soft font-semibold mt-0.5">{plc.class_name}</p>
                        </div>

                        <div className="text-[11px] font-mono text-ink-soft whitespace-nowrap">
                          {plc.entry_date} s.d. {plc.exit_date || 'Sekarang'}
                        </div>
                      </div>

                      {/* Promotion or Exit Remarks */}
                      {plc.promotion_remarks && (
                        <p className="text-xs text-ink-soft bg-surface p-2 rounded-lg border border-line">
                          {plc.promotion_remarks}
                        </p>
                      )}

                      {/* LPPA Report Section for this period */}
                      {matchedLppa ? (
                        <div className="p-3 bg-surface rounded-field border border-line space-y-2.5 text-xs">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-ink font-semibold">
                              <BookOpen className="w-4 h-4 text-lppa" />
                              <span>Laporan Capaian Perkembangan Anak (LPPA)</span>
                            </div>
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              matchedLppa.status === 'PUBLISHED'
                                ? 'bg-lppa-tint text-lppa-deep border-lppa-line'
                                : 'bg-success-tint text-success-deep border-success-line'
                            }`}>
                              {matchedLppa.status}
                            </span>
                          </div>

                          {matchedLppa.homeroom_feedback && (
                            <p className="text-ink-soft text-[11px] italic bg-surface-subtle p-2 rounded-lg border border-line">
                              "{matchedLppa.homeroom_feedback}"
                            </p>
                          )}

                          <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-2 pt-1 border-t border-line-soft">
                            {matchedLppa.headmaster_approval_date ? (
                              <div className="flex items-center space-x-1.5 text-[10px] text-ink-soft font-mono whitespace-nowrap">
                                <CheckCircle2 className="w-3 h-3 text-success" />
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
                              className="w-full medium:w-auto mt-2 medium:mt-0 px-3 py-2 medium:py-1 rounded-lg bg-brand hover-only:bg-surface-inset text-on-brand text-[11px] font-bold transition flex items-center justify-center gap-2 shadow-hairline cursor-pointer expanded:ml-auto"
                            >
                              <Printer className="w-4 h-4" />
                              <span>Buka Rapor Resmi (PDF)</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="text-[11px] text-ink-soft italic">
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
    </div>
  );
};
