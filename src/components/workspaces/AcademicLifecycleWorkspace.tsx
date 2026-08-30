import { SelectSheet } from '../ui';
/**
 * Yapendik School OS — Stage 3.4-B: Academic Lifecycle Workspace
 * 
 * Governed Visual Interface for Academic Period & Semester Transitions:
 * - Current Academic Period & State Machine Indicator (PLANNED -> ACTIVE -> CLOSING -> CLOSED)
 * - 100% LPPA Reconciliation Diagnostic Gate ($Approved = Enrolled$)
 * - Governed Term Closure Action Modal with Option A Protection
 * - Successor Term Rollover & Initialization Wizard
 * - Historical Terms Ledger (Read-Only Archive)
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { db } from '../../db/database';
import { getSupabaseClient } from '../../db/supabaseClient';
import { academicLifecycleService } from '../../services/academicLifecycleService';
import { translateGovernanceError, TranslatedGovernanceError } from '../../services/governanceErrorTranslator';
import { HeadmasterLppaApprovalHub } from './HeadmasterLppaApprovalHub';
import { ClassroomHeatmapView } from './ClassroomHeatmapView';
import { HeadmasterAssuranceView } from './HeadmasterAssuranceView';
import { 
  Calendar, 
  ShieldCheck, 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  Clock, 
  PlusCircle, 
  ArrowRight, 
  FileText, 
  Users, 
  RefreshCw, 
  Sparkles,
  Info,
  Archive,
  Layers,
  AlertCircle,
  Award,
  ShieldAlert,
  X
} from 'lucide-react';

interface AcademicPeriodData {
  id: string;
  school_id: string;
  name: string;
  semester: 'GANJIL' | 'GENAP';
  start_date: string;
  end_date: string;
  is_active: boolean;
  lifecycle_status: 'PLANNED' | 'ACTIVE' | 'CLOSING' | 'CLOSED' | 'ARCHIVED';
  closed_at?: string | null;
  closed_by_person_id?: string | null;
}

export const AcademicLifecycleWorkspace: React.FC = () => {
  const { securityContext, activeSchoolId } = useSecurityContext();
  const isAuthorizedActor = 
    securityContext?.role === 'YAPENDIK_SUPERADMIN' || 
    securityContext?.role === 'HEADMASTER';

  const [activeSubTab, setActiveSubTab] = useState<'OVERVIEW' | 'LPPA_APPROVAL' | 'HEATMAP' | 'ASSURANCE'>('OVERVIEW');
  const [activePeriod, setActivePeriod] = useState<AcademicPeriodData | null>(null);
  const [allPeriods, setAllPeriods] = useState<AcademicPeriodData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Reconciliation State
  const [enrolledCount, setEnrolledCount] = useState(0);
  const [approvedLppaCount, setApprovedLppaCount] = useState(0);
  const [draftLppaCount, setDraftLppaCount] = useState(0);
  const [isReadyForClosure, setIsReadyForClosure] = useState(false);

  // Modal States
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showInitModal, setShowInitModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Feedback State
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string; diagnostics?: TranslatedGovernanceError } | null>(null);

  // Form State for Next Semester Initialization
  const [nextName, setNextName] = useState('');
  const [nextSemester, setNextSemester] = useState<'GANJIL' | 'GENAP'>('GENAP');
  const [nextStartDate, setNextStartDate] = useState('');
  const [nextEndDate, setNextEndDate] = useState('');

  const school = securityContext ? db.getSchoolById(securityContext.activeSchoolId) : null;
  const currentSchoolId = securityContext?.activeSchoolId || 'sch_tk_yapendik_01';

  const loadLifecycleData = async () => {
    setRefreshing(true);
    setFeedback(null);
    try {
      const supabase = getSupabaseClient();
      if (supabase) {
        // 1. Fetch all academic periods for active school
        const { data: periods, error: pErr } = await supabase
          .from('academic_years')
          .select('*')
          .eq('school_id', currentSchoolId)
          .order('start_date', { ascending: false });

        if (!pErr && periods) {
          setAllPeriods(periods as AcademicPeriodData[]);
          const currentActive = periods.find(p => p.is_active || p.lifecycle_status === 'ACTIVE' || p.lifecycle_status === 'CLOSING');
          const effectiveCurrent = currentActive || periods[0] || null;
          setActivePeriod(effectiveCurrent as AcademicPeriodData);

          // 2. If an active period exists, query reconciliation status
          if (effectiveCurrent) {
            const recon = await academicLifecycleService.getSemesterReconciliationStatus(currentSchoolId, effectiveCurrent.id);
            setEnrolledCount(recon.enrolled_count);
            setApprovedLppaCount(recon.approved_lppa_count);
            setDraftLppaCount(recon.draft_lppa_count);
            setIsReadyForClosure(recon.is_ready_for_closure);
          }
        }
      } else {
        // Fallback local memory data
        const localYears = db.getAcademicYears().filter(y => y.schoolId === currentSchoolId);
        const mapped: AcademicPeriodData[] = localYears.map(y => ({
          id: y.id,
          school_id: y.schoolId,
          name: y.name,
          semester: y.semester,
          start_date: y.startDate,
          end_date: y.endDate,
          is_active: y.isActive,
          lifecycle_status: y.isActive ? 'ACTIVE' : 'CLOSED',
          closed_at: null,
          closed_by_person_id: null
        }));
        setAllPeriods(mapped);
        const current = mapped.find(p => p.is_active) || mapped[0] || null;
        setActivePeriod(current);
        if (current) {
          const students = db.getStudents(currentSchoolId);
          setEnrolledCount(students.length);
          setApprovedLppaCount(students.length);
          setDraftLppaCount(0);
          setIsReadyForClosure(true);
        }
      }
    } catch (err: any) {
      console.error('Error loading academic lifecycle data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLifecycleData();
  }, [currentSchoolId]);

  const handleCloseSemester = async () => {
    if (!activePeriod) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await academicLifecycleService.closeSemester(currentSchoolId, activePeriod.id);
      setFeedback({
        type: 'success',
        message: `Semester ${activePeriod.name} (${activePeriod.semester}) berhasil ditutup secara resmi! Seluruh data presensi, observasi, dan rapor telah dibekukan menjadi arsip permanen (Option A).`
      });
      setShowCloseModal(false);
      await loadLifecycleData();
    } catch (err: any) {
      const diag = (err as any).diagnostics || translateGovernanceError(err);
      setFeedback({
        type: 'error',
        message: diag.message || err.message,
        diagnostics: diag
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitializeNextSemester = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nextName || !nextStartDate || !nextEndDate) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await academicLifecycleService.initializeNextSemester({
        schoolId: currentSchoolId,
        name: nextName,
        semester: nextSemester,
        startDate: nextStartDate,
        endDate: nextEndDate
      });
      setFeedback({
        type: 'success',
        message: `Semester baru ${nextName} (${nextSemester}) berhasil diinisialisasi dan diaktifkan!`
      });
      setShowInitModal(false);
      setNextName('');
      setNextStartDate('');
      setNextEndDate('');
      await loadLifecycleData();
    } catch (err: any) {
      const diag = (err as any).diagnostics || translateGovernanceError(err);
      setFeedback({
        type: 'error',
        message: diag.message || err.message,
        diagnostics: diag
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const reconciliationPct = enrolledCount > 0 
    ? Math.min(100, Math.round((approvedLppaCount / enrolledCount) * 100)) 
    : 0;

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-ink-faint pb-[160px] expanded:pb-8">
        <RefreshCw className="w-8 h-8 animate-spin text-brand-primary mb-3" />
        <p className="text-sm font-medium">Memuat Status Siklus Akademik & Rekonsiliasi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-ink font-sans w-full" data-testid="academic-lifecycle-workspace">
      {/* Header Banner */}
      <div className="bg-surface border-b border-line medium:rounded-card px-4 py-5 medium:p-6 w-full text-ink medium:border medium:shadow-hairline">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-brand-deep text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
              <Calendar className="w-4 h-4 text-brand-deep shrink-0" />
              <span>Standar Yayasan • Tahun Ajaran &amp; Semester</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <span>Tata Kelola Tahun Ajaran &amp; Semester</span>
            </h1>
            <p className="hidden expanded:block text-ink-soft text-xs mt-1 max-w-2xl">
              {school?.name || 'TK Yapendik Menteng'} • NPSN: {school?.npsn || '20104821'} • Rekonsiliasi rapor LPPA 100% dan pembekuan arsip resmi.
            </p>
          </div>

          <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-2 w-full medium:w-auto">
            <button
              onClick={loadLifecycleData}
              disabled={refreshing}
              className="px-3 py-2 rounded-field bg-surface hover-only:bg-surface-subtle text-ink-soft border border-line text-xs font-semibold flex justify-center items-center space-x-2 transition-all shadow-hairline cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-ink-soft' : ''}`} />
              <span>Segarkan Data</span>
            </button>

            {isAuthorizedActor && activePeriod?.lifecycle_status === 'CLOSED' && (
              <button
                onClick={() => setShowInitModal(true)}
                className="px-4 py-2 rounded-field bg-brand hover-only:opacity-90 text-on-brand font-bold text-xs shadow-hairline flex justify-center items-center space-x-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buka Semester Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tab Switcher for Headmaster & Superadmin */}
        <div className="flex border-b border-line mt-6 gap-2 text-xs overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'OVERVIEW'
                ? 'text-ink border-b-2 border-brand'
                : 'text-ink-soft hover-only:text-ink'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Status &amp; Tata Kelola Semester</span>
          </button>

          <button
            onClick={() => setActiveSubTab('LPPA_APPROVAL')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'LPPA_APPROVAL'
                ? 'text-ink border-b-2 border-brand'
                : 'text-ink-soft hover-only:text-ink'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verifikasi &amp; Pengesahan LPPA</span>
            {draftLppaCount > 0 && (
              <span className="px-2 py-0 text-[10px] font-bold rounded-full bg-surface-subtle text-ink font-mono whitespace-nowrap">
                {draftLppaCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('HEATMAP')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'HEATMAP'
                ? 'text-ink border-b-2 border-brand'
                : 'text-ink-soft hover-only:text-ink'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Distribusi Capaian Rombel</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ASSURANCE')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'ASSURANCE'
                ? 'text-ink border-b-2 border-brand'
                : 'text-ink-soft hover-only:text-ink'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Asuransi Operasional &amp; Keselamatan</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-card border flex items-start space-x-3 shadow-hairline ${
          feedback.type === 'success' 
            ? 'bg-success-tint border-success-line text-success-deep' 
            : 'bg-danger-tint border-danger-line text-danger-deep'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-success" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-danger" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold">{feedback.type === 'success' ? 'Operasi Sukses' : feedback.diagnostics?.title || 'Operasi Gagal'}</p>
            <p className="mt-0.5">{feedback.message}</p>
            {feedback.diagnostics?.actionSuggestion && (
              <p className="mt-2 text-warning-deep font-medium bg-warning-tint p-2 rounded-field border border-warning-line">
                Saran Tindakan: {feedback.diagnostics.actionSuggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: LPPA Approval Hub */}
      {activeSubTab === 'LPPA_APPROVAL' && (
        <HeadmasterLppaApprovalHub onSuccessReconciliation={loadLifecycleData} />
      )}

      {/* Tab 3: Heatmap Analytics View */}
      {activeSubTab === 'HEATMAP' && (
        <ClassroomHeatmapView 
          schoolId={activePeriod?.school_id || currentSchoolId} 
          classId={'cls_tk_a_menteng'} 
        />
      )}

      {/* Tab 4: Headmaster Assurance View */}
      {activeSubTab === 'ASSURANCE' && (
        <HeadmasterAssuranceView
          schoolId={activePeriod?.school_id || currentSchoolId}
          headmasterPersonId={securityContext?.personId || 'per_hm_esther'}
          headmasterName={securityContext?.userEmail || 'Dra. Esther Nugroho, M.Pd'}
          role={securityContext?.role || 'HEADMASTER'}
        />
      )}

      {/* Tab 1: Overview & Lifecycle Governance */}
      {activeSubTab === 'OVERVIEW' && (
        <>
          {/* Active Period & Closure Gate Cards */}
          <div className="grid grid-cols-1 expanded:grid-cols-3 gap-6">
            {/* Card 1: Active Period State Machine */}
            <div className="expanded:col-span-2 bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline space-y-4">
              <div className="flex items-center justify-between border-b border-line-soft pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-ink-soft" />
                  <h2 className="text-sm font-bold text-ink">Status Periode Semester Aktif</h2>
                </div>
                {activePeriod && (
                  <span className={`px-2 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${
                    activePeriod.lifecycle_status === 'ACTIVE' 
                      ? 'bg-success-tint text-success-deep border-success-line'
                      : 'bg-surface-subtle text-ink-soft border-line'
                  }`}>
                    {activePeriod.lifecycle_status === 'ACTIVE' ? 'SEMESTER BERJALAN' : activePeriod.lifecycle_status}
                  </span>
                )}
              </div>

              {activePeriod ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 medium:grid-cols-4 gap-3">
                    <div className="p-3 bg-surface-subtle border border-line-soft rounded-field">
                      <span className="text-[10px] text-ink-soft block uppercase tracking-wider font-semibold">Tahun Ajaran</span>
                      <span className="text-xs font-bold text-ink">{activePeriod.name}</span>
                    </div>
                    <div className="p-3 bg-surface-subtle border border-line-soft rounded-field">
                      <span className="text-[10px] text-ink-soft block uppercase tracking-wider font-semibold">Semester</span>
                      <span className="text-xs font-bold text-ink">{activePeriod.semester}</span>
                    </div>
                    <div className="p-3 bg-surface-subtle border border-line-soft rounded-field">
                      <span className="text-[10px] text-ink-soft block uppercase tracking-wider font-semibold">Mulai</span>
                      <span className="text-xs font-mono font-semibold text-ink whitespace-nowrap">{activePeriod.start_date}</span>
                    </div>
                    <div className="p-3 bg-surface-subtle border border-line-soft rounded-field">
                      <span className="text-[10px] text-ink-soft block uppercase tracking-wider font-semibold">Selesai</span>
                      <span className="text-xs font-mono font-semibold text-ink whitespace-nowrap">{activePeriod.end_date}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-surface-subtle/70 border border-line/80 rounded-field space-y-2 text-xs">
                    <div className="flex items-center space-x-1.5 text-ink font-semibold">
                      <Info className="w-4 h-4 text-ink-soft" />
                      <span>Jaminan Integritas Temporal:</span>
                    </div>
                    <p className="text-ink-soft leading-relaxed">
                      Penutupan semester akan membekukan seluruh catatan pembelajaran, presensi, dan narasi LPPA menjadi arsip permanen yang tidak dapat diubah kembali.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-surface-subtle border border-dashed border-line rounded-field text-ink-faint text-xs">
                  Tidak ada periode akademik aktif saat ini.
                </div>
              )}
            </div>

            {/* Card 2: Governed Reconciliation Gate */}
            <div className="bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-line-soft pb-3">
                  <ShieldCheck className="w-4 h-4 text-ink-soft" />
                  <h2 className="text-sm font-bold text-ink">Gerbang Rekonsiliasi Tutup Buku</h2>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2 bg-surface-subtle rounded-field border border-line-soft">
                    <span className="text-ink-soft">Total Siswa Aktif:</span>
                    <span className="font-bold text-ink font-mono">{enrolledCount} Anak</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-surface-subtle rounded-field border border-line-soft">
                    <span className="text-ink-soft">Rapor LPPA Disahkan:</span>
                    <span className="font-bold text-success-deep font-mono">{approvedLppaCount} Rapor</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-surface-subtle rounded-field border border-line-soft">
                    <span className="text-ink-soft">Rapor Masih Draf:</span>
                    <span className={`font-bold font-mono ${draftLppaCount > 0 ? 'text-brand-primary' : 'text-ink-faint'}`}>
                      {draftLppaCount} Draf
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-field border text-xs flex items-center space-x-2 ${
                  isReadyForClosure 
                    ? 'bg-success-tint border-success-line text-success-deep' 
                    : 'bg-warning-tint border-warning-line text-warning-deep'
                }`}>
                  {isReadyForClosure ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : <AlertCircle className="w-4 h-4 text-brand-primary shrink-0" />}
                  <span className="font-semibold">
                    {isReadyForClosure 
                      ? 'Seluruh siswa telah memiliki rapor LPPA sah (100%).' 
                      : 'Masih ada siswa yang belum memiliki rapor LPPA sah.'}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {activePeriod?.lifecycle_status === 'ACTIVE' && (
                <button
                  onClick={() => setShowCloseModal(true)}
                  disabled={!isAuthorizedActor}
                  className="w-full py-2 rounded-field bg-brand hover-only:opacity-90 disabled:opacity-50 text-on-brand font-bold text-xs shadow-hairline flex items-center justify-center space-x-2 transition-all cursor-pointer mt-4"
                >
                  <Lock className="w-4 h-4" />
                  <span>Tutup Semester Secara Resmi</span>
                </button>
              )}
            </div>
          </div>

          {/* Historical Terms Ledger Table */}
          <div className="bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline space-y-4">
            <div className="flex items-center justify-between border-b border-line-soft pb-3">
              <div className="flex items-center space-x-2">
                <Archive className="w-4 h-4 text-ink-soft" />
                <h3 className="text-sm font-bold text-ink">Buku Catatan Riwayat Semester &amp; Arsip Periode</h3>
              </div>
              <span className="text-xs text-ink-soft font-medium">Total {allPeriods.length} Periode Tercatat</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-subtle text-ink-soft uppercase tracking-wider font-semibold border-b border-line">
                  <tr>
                    <th className="py-3 px-4">Tahun Ajaran</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Rentang Tanggal</th>
                    <th className="py-3 px-4">Status Siklus</th>
                    <th className="py-3 px-4">Waktu Penutupan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line-soft font-medium">
                  {allPeriods.map((p) => (
                    <tr key={p.id} className="hover-only:bg-surface-subtle transition-colors">
                      <td className="py-3 px-4 font-bold text-ink">{p.name}</td>
                      <td className="py-3 px-4 text-ink-soft font-semibold">{p.semester}</td>
                      <td className="py-3 px-4 font-mono text-ink-soft">{p.start_date} s.d. {p.end_date}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                          p.lifecycle_status === 'ACTIVE' 
                            ? 'bg-success-tint text-success-deep border-success-line' 
                            : 'bg-surface-subtle text-ink-soft border border-line'
                        }`}>
                          {p.lifecycle_status === 'ACTIVE' ? 'AKTIF' : 'DITUTUP'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-ink-soft text-[11px] whitespace-nowrap">
                        {p.closed_at ? new Date(p.closed_at).toLocaleString('id-ID') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Modal 1: Governed Semester Closure Confirmation */}
      {showCloseModal && activePeriod && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-line rounded-card max-w-lg w-full p-4 medium:p-6 shadow-floating space-y-4 text-ink">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-ink-soft" />
                <h3 className="text-base font-bold text-ink">Konfirmasi Penutupan Semester</h3>
              </div>
              <button
                onClick={() => setShowCloseModal(false)}
                className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-line-soft text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-ink-soft space-y-3">
              <p>
                Anda akan menutup secara permanen semester <strong>{activePeriod.name} ({activePeriod.semester})</strong> untuk unit sekolah <strong>{school?.name}</strong>.
              </p>

              <div className="bg-surface-subtle p-3 rounded-field border border-line space-y-2">
                <div className="flex justify-between">
                  <span className="text-ink-soft">Total Siswa Aktif:</span>
                  <span className="font-bold text-ink">{enrolledCount} Siswa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">Rapor LPPA Disahkan:</span>
                  <span className="font-bold text-success-deep">{approvedLppaCount} Rapor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-soft">Status Rekonsiliasi:</span>
                  <span className={isReadyForClosure ? 'text-success-deep font-bold' : 'text-warning-deep font-bold'}>
                    {isReadyForClosure ? 'Lolos Prasyarat (100%)' : 'Belum Memenuhi Syarat'}
                  </span>
                </div>
              </div>

              {!isReadyForClosure && (
                <div className="bg-danger-tint border border-danger-line p-3 rounded-field text-danger-deep">
                  Peringatan: Masih ada siswa tanpa rapor LPPA berstatus disahkan.
                </div>
              )}
            </div>

            <div className="flex flex-col medium:flex-row items-center justify-end gap-2 pt-3 border-t border-line-soft">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                disabled={isProcessing}
                className="w-full medium:w-auto px-4 py-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink-soft text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCloseSemester}
                disabled={isProcessing}
                className="w-full medium:w-auto px-4 py-2 rounded-field bg-brand hover-only:opacity-90 text-on-brand text-xs font-bold flex justify-center items-center space-x-2 shadow-hairline transition-colors cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                <span>Eksekusi Penutupan Semester</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Initialize Next Semester Wizard */}
      {showInitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface border border-line rounded-card max-w-md w-full p-4 medium:p-6 shadow-floating space-y-4 text-ink">
            <div className="flex items-center justify-between pb-3 border-b border-line-soft">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-ink-soft" />
                <h3 className="text-base font-bold text-ink">Inisialisasi Semester Baru</h3>
              </div>
              <button
                onClick={() => setShowInitModal(false)}
                className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-line-soft text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInitializeNextSemester} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-ink-soft font-semibold mb-1">Nama Tahun Ajaran &amp; Semester</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TA 2026/2027 Genap"
                  value={nextName}
                  onChange={(e) => setNextName(e.target.value)}
                  className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
                />
              </div>

              <div>
                <label className="block text-ink-soft font-semibold mb-1">Semester</label>
                <SelectSheet value={nextSemester}   options={[{ value: "GANJIL", label: "GANJIL" }, { value: "GENAP", label: "GENAP" }]} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-ink-soft font-semibold mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={nextStartDate}
                    onChange={(e) => setNextStartDate(e.target.value)}
                    className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
                  />
                </div>
                <div>
                  <label className="block text-ink-soft font-semibold mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={nextEndDate}
                    onChange={(e) => setNextEndDate(e.target.value)}
                    className="w-full bg-surface-subtle border border-line rounded-field px-3 py-2 text-ink focus:bg-surface focus:outline-none focus:ring-1 focus:ring-brand-primary shadow-hairline"
                  />
                </div>
              </div>

              <div className="flex flex-col medium:flex-row items-center justify-end gap-2 pt-3 border-t border-line-soft">
                <button
                  type="button"
                  onClick={() => setShowInitModal(false)}
                  disabled={isProcessing}
                  className="w-full medium:w-auto px-4 py-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink-soft font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full medium:w-auto px-4 py-2 rounded-field bg-brand hover-only:opacity-90 text-on-brand font-bold flex justify-center items-center space-x-2 shadow-hairline transition-colors cursor-pointer"
                >
                  {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
                  <span>Aktifkan Semester Baru</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
