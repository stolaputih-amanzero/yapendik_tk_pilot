/**
 * Yapendik School OS — Stage 3.4-E: Student Longitudinal Journey Timeline
 * 
 * Governed Visual Interface for Child Developmental Continuum:
 * - Invokes fn_get_student_longitudinal_trajectory(student_id)
 * - Chronological Multi-Year Placement Curve (ACTIVE -> PROMOTED -> COMPLETED)
 * - Longitudinal LPPA Progress Reports Ledger
 * - Strict Legal Guardian Privacy Boundary
 * - Canvas-Native Flat Architecture (Hukum F-7 / Specimen #2)
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
import { SelectSheet, Button } from '../ui';
import { 
  Compass, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  HeartHandshake,
  Baby,
  BookOpen,
  Printer,
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
    <div className="w-full max-w-5xl mx-auto px-4 medium:px-6 pt-6 pb-[160px] space-y-8 animate-in fade-in duration-200 text-ink overflow-x-hidden">
      
      {/* 1. HERO CANVAS (Hukum F-7: Tanpa kartu panel pembungkus) */}
      <header className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {/* J-4: Eyebrow text-brand-deep kanonikal */}
            <div className="flex items-center gap-1.5 text-brand-deep text-xs font-bold uppercase tracking-wider mb-1">
              <Compass className="w-4 h-4 text-brand-deep shrink-0" />
              <span>Rekam Jejak Siswa</span>
            </div>
            <h1 className="text-xl sm:text-2xl medium:text-3xl font-bold text-ink tracking-tight leading-snug break-words">
              Linimasa &amp; Kurva Rekam Jejak Perkembangan Anak
            </h1>
            <p className="text-ink-soft text-xs sm:text-sm max-w-prose mt-1 leading-relaxed">
              Rekonstruksi perjalanan historis multi-tahun anak dari awal penempatan rombel hingga kelulusan resmi.
            </p>
          </div>

          <button
            onClick={loadTrajectory}
            disabled={refreshing}
            className="min-w-[48px] min-h-[48px] flex items-center justify-center p-2 rounded-xl text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle transition-colors shrink-0 cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin text-brand-primary' : ''}`} />
          </button>
        </div>

        {/* 2. SELECTOR ANAK (Kontrol flat langsung di canvas) */}
        {studentsList.length > 1 && (
          <div className="w-full max-w-md bg-surface-subtle rounded-xl min-h-[52px] p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs border border-line-hairline">
            <span className="text-ink-soft font-medium shrink-0">Pilih Profil Anak:</span>
            <div className="w-full sm:flex-1">
              <SelectSheet
                value={selectedStudentId || ''}
                onChange={setSelectedStudentId}
                options={studentsList.map(s => ({ value: s.id, label: `${s.name} (${s.status})` }))}
              />
            </div>
          </div>
        )}
      </header>

      {/* Error / Privacy Boundary Warning */}
      {errorFeedback && (
        <div className="p-4 rounded-xl border bg-danger-tint border-danger-line text-danger-deep flex items-start space-x-3 text-xs animate-in fade-in">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5 text-danger" />
          <div>
            <p className="font-semibold text-danger-deep">{errorFeedback.title}</p>
            <p className="mt-0.5">{errorFeedback.message}</p>
          </div>
        </div>
      )}

      {/* Trajectory Main Content (Canvas-Native Layout) */}
      {trajectory && (
        <div className="grid grid-cols-1 expanded:grid-cols-12 gap-8">
          
          {/* 3. BLOK IDENTITAS SISWA (Left Column - 4 Cols) */}
          <div className="expanded:col-span-4 space-y-6">
            {/* Profil Avatar & Nama */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-xl bg-surface-subtle border border-line-hairline flex items-center justify-center text-ink-soft font-bold text-lg shrink-0">
                <Baby className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
                  {selectedStudentMeta?.name || 'Profil Siswa'}
                </h3>
                <p className="text-xs text-ink-faint font-mono truncate">
                  NIS: {trajectory.nis || '—'}
                </p>
              </div>
            </div>

            {/* J-2: Stat Lembaga sebagai baris divide-y divide-line langsung di canvas */}
            <div className="divide-y divide-line border-y border-line text-xs">
              <div className="py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 text-ink-soft">
                <span>Status Lembaga:</span>
                <span className={`font-mono text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                  trajectory.current_status === 'GRADUATED' 
                    ? 'bg-lppa-tint text-lppa-deep border border-lppa-line' 
                    : 'bg-success-tint text-success-deep border border-success-line'
                }`}>
                  {trajectory.current_status === 'ACTIVE' ? 'Aktif' : trajectory.current_status === 'GRADUATED' ? 'Lulus' : trajectory.current_status}
                </span>
              </div>
              <div className="py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 text-ink-soft">
                <span>Total Periode Penempatan:</span>
                <span className="font-mono font-bold text-ink">
                  {trajectory.placement_lineage.length} Semester
                </span>
              </div>
              <div className="py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2 text-ink-soft">
                <span>Laporan LPPA Terbit:</span>
                <span className="font-mono font-bold text-ink">
                  {trajectory.lppa_history.length} Laporan
                </span>
              </div>
            </div>

            {/* J-3: Jaminan Privasi C-11 sebagai Footnote Flat TANPA kotak */}
            <div className="border-l-2 border-success-line pl-3 py-1 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-success-deep">
                <ShieldCheck className="w-4 h-4 text-success shrink-0" />
                <span>Jaminan Privasi Keluarga (C-11)</span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed break-words">
                Rekam jejak longitudinal anak dilindungi secara kriptografis dan hanya dapat diakses oleh Orang Tua/Wali Sah terdaftar serta staf pendidik berwenang.
              </p>
            </div>
          </div>

          {/* 5. KURVA LINIMASA & LINIMASA PENEMPATAN (Right Column - 8 Cols) */}
          <div className="expanded:col-span-8 space-y-8 min-w-0">
            
            {/* Header Kurva Linimasa */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <div>
                <span className="text-xs font-bold text-brand-deep uppercase tracking-wider">
                  Kurva Linimasa
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-ink mt-0.5">
                  Riwayat Penempatan &amp; Rapor Perkembangan
                </h2>
              </div>
              <span className="text-xs text-ink-soft font-mono bg-surface-subtle px-3 py-1 rounded-full border border-line-hairline shrink-0">
                Riwayat Akademik Resmi
              </span>
            </div>

            {/* 6. KEMITRAAN TUMBUH KEMBANG DI RUMAH (Home-School Growth Bridge) */}
            {homePlans.length > 0 && (
              <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-brand-tint text-brand-deep shrink-0">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-ink">Kemitraan Tumbuh Kembang di Rumah</h4>
                      <p className="text-xs text-ink-soft mt-0.5">
                        Saran stimulasi bermain bersama keluarga dari Guru Kelas
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line-hairline shrink-0">
                    Non-Authoritative
                  </span>
                </div>

                <div className="divide-y divide-line">
                  {homePlans.map(plan => {
                    const isAck = plan.home_school_extension?.parent_acknowledgment_status === 'ACKNOWLEDGED';
                    return (
                      <div key={plan.plan_id} className="py-4 space-y-3">
                        <div>
                          <span className="text-[10px] font-bold text-brand-deep uppercase tracking-wider">
                            Saran Stimulasi dari Ibu Guru ({plan.target_element_key.replace('_', ' ')}):
                          </span>
                          <p className="text-xs text-ink font-medium mt-1 leading-relaxed break-words">
                            "{plan.home_school_extension?.home_activity_prompt}"
                          </p>
                        </div>

                        {isAck ? (
                          <div className="border-l-2 border-success-line pl-3 py-1 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-success-deep">
                              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                              <span>Terkonfirmasi oleh Orang Tua ({new Date(plan.home_school_extension?.parent_acknowledged_at || '').toLocaleDateString('id-ID')})</span>
                            </div>
                            <p className="text-xs text-ink-soft italic break-words">
                              "{plan.home_school_extension?.parent_reflection_notes}"
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-2 pt-2 border-t border-line">
                            <label className="text-xs font-medium text-ink-soft">
                              Catatan Respon / Refleksi Keluarga:
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                              <input
                                type="text"
                                value={reflectionInput[plan.plan_id] || ''}
                                onChange={e => setReflectionInput({ ...reflectionInput, [plan.plan_id]: e.target.value })}
                                placeholder="Ceritakan aktivitas bermain bersama anak di rumah..."
                                className="min-h-[48px] flex-1 px-3 py-2 text-xs rounded-xl bg-surface-subtle border border-line-hairline text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-primary"
                              />
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleSendHomeReflection(plan.plan_id)}
                                disabled={isSubmitting || !reflectionInput[plan.plan_id]}
                                leftIcon={<Send className="w-4 h-4" />}
                                className="min-h-[48px] w-full sm:w-auto text-xs font-bold rounded-xl"
                              >
                                Kirim
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* 5. TIMELINE STEPPER KANONIKAL §5.1.2 (border-l-2 vertikal langsung di canvas) */}
            <div className="relative pl-6 space-y-8 border-l-2 border-line ml-3 sm:ml-4">
              {trajectory.placement_lineage.map((plc) => {
                const matchedLppa = trajectory.lppa_history.find(
                  l => l.academic_year_id === plc.academic_year_id && l.semester === plc.semester
                );

                return (
                  <article key={plc.placement_id} className="relative space-y-3">
                    {/* Node Dot (Centered on border-l-2) */}
                    <div className={`absolute -left-[33px] top-1 w-4 h-4 rounded-full border-2 bg-surface flex items-center justify-center ${
                      plc.placement_status === 'COMPLETED'
                        ? 'border-lppa-line'
                        : plc.placement_status === 'ACTIVE'
                        ? 'border-success-line'
                        : 'border-line-strong'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        plc.placement_status === 'COMPLETED' ? 'bg-lppa' : plc.placement_status === 'ACTIVE' ? 'bg-success' : 'bg-line-strong'
                      }`} />
                    </div>

                    {/* Milestone Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm sm:text-base font-bold font-mono text-ink">
                            {plc.academic_year_name} ({plc.semester === 'GANJIL' ? 'Semester Ganjil' : 'Semester Genap'})
                          </span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            plc.placement_status === 'COMPLETED'
                              ? 'bg-lppa-tint text-lppa-deep border border-lppa-line'
                              : plc.placement_status === 'ACTIVE'
                              ? 'bg-success-tint text-success-deep border border-success-line'
                              : 'bg-surface-subtle text-ink-soft border border-line-hairline'
                          }`}>
                            {plc.placement_status === 'ACTIVE' ? 'Aktif' : plc.placement_status === 'COMPLETED' ? 'Selesai' : plc.placement_status}
                          </span>
                        </div>
                        <p className="text-sm text-ink-soft font-semibold mt-0.5">
                          {plc.class_name}
                        </p>
                      </div>

                      <div className="text-xs font-mono text-ink-faint">
                        {plc.entry_date} s.d. {plc.exit_date || 'Sekarang'}
                      </div>
                    </div>

                    {/* Promotion or Exit Remarks */}
                    {plc.promotion_remarks && (
                      <p className="text-xs text-ink-soft italic py-1 pl-3 border-l-2 border-line break-words">
                        {plc.promotion_remarks}
                      </p>
                    )}

                    {/* LPPA Report Section for this period (Canvas-Native) */}
                    {matchedLppa ? (
                      <div className="border-t border-line pt-3 space-y-2 text-xs">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2 text-ink font-semibold">
                            <BookOpen className="w-4 h-4 text-lppa shrink-0" />
                            <span>Laporan Capaian Perkembangan Anak (LPPA)</span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                            matchedLppa.status === 'PUBLISHED'
                              ? 'bg-lppa-tint text-lppa-deep border border-lppa-line'
                              : 'bg-success-tint text-success-deep border border-success-line'
                          }`}>
                            {matchedLppa.status === 'PUBLISHED' ? 'Telah Terbit' : matchedLppa.status === 'APPROVED' ? 'Disahkan' : matchedLppa.status}
                          </span>
                        </div>

                        {matchedLppa.homeroom_feedback && (
                          <p className="text-ink-soft text-xs italic py-1 pl-3 border-l-2 border-line break-words">
                            "{matchedLppa.homeroom_feedback}"
                          </p>
                        )}

                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                          {matchedLppa.headmaster_approval_date ? (
                            <div className="flex items-center space-x-1.5 text-xs text-ink-soft font-mono">
                              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                              <span>Disahkan Kepala Sekolah • {new Date(matchedLppa.headmaster_approval_date).toLocaleDateString('id-ID')}</span>
                            </div>
                          ) : <div />}

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={async () => {
                              const fullDoc = await lppaReportingService.getLppaReport(matchedLppa.report_id, currentSchoolId);
                              if (fullDoc) {
                                const currentSchool = db.getSchoolById(currentSchoolId);
                                const canonical = lppaReportingService.toCanonicalPublishedRecord(
                                  fullDoc,
                                  currentSchool?.name || 'TK Yapendik Maranatha',
                                  currentSchool?.npsn || '20104821',
                                  plc.class_name,
                                  'Erna Susanti, S.Pd',
                                  'Marlina Simanjuntak, M.Pd'
                                );
                                setPreviewRecord(canonical);
                              }
                            }}
                            leftIcon={<Printer className="w-4 h-4" />}
                            className="min-h-[48px] w-full sm:w-auto text-xs font-bold rounded-xl"
                          >
                            Buka Rapor Resmi (PDF)
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-ink-faint italic py-1">
                        Belum ada laporan perkembangan LPPA yang diterbitkan untuk semester ini.
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Official Canonical Print Preview Modal */}
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
