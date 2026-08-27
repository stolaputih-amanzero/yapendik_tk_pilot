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
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-400">
        <RefreshCw className="w-8 h-8 animate-spin text-amber-500 mb-3" />
        <p className="text-sm font-medium">Memuat Status Siklus Akademik & Rekonsiliasi...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 font-sans w-full" data-testid="academic-lifecycle-workspace">
      {/* Header Banner */}
      <div className="bg-slate-50 border-b border-slate-200 md:rounded-2xl px-4 py-5 md:p-6 w-full text-slate-900 md:border md:shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Standar Yayasan • Tahun Ajaran &amp; Semester</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Tata Kelola Tahun Ajaran &amp; Semester</span>
            </h1>
            <p className="hidden md:block text-slate-500 text-xs mt-1 max-w-2xl">
              {school?.name || 'TK Yapendik Menteng'} • NPSN: {school?.npsn || '20104821'} • Rekonsiliasi rapor LPPA 100% dan pembekuan arsip resmi.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={loadLifecycleData}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex justify-center items-center space-x-2 transition-all shadow-2xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-slate-600' : ''}`} />
              <span>Segarkan Data</span>
            </button>

            {isAuthorizedActor && activePeriod?.lifecycle_status === 'CLOSED' && (
              <button
                onClick={() => setShowInitModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs flex justify-center items-center space-x-2 transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buka Semester Baru</span>
              </button>
            )}
          </div>
        </div>

        {/* Sub-Tab Switcher for Headmaster & Superadmin */}
        <div className="flex border-b border-slate-200 mt-6 gap-2 text-xs overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'OVERVIEW'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Status &amp; Tata Kelola Semester</span>
          </button>

          <button
            onClick={() => setActiveSubTab('LPPA_APPROVAL')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'LPPA_APPROVAL'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verifikasi &amp; Pengesahan LPPA</span>
            {draftLppaCount > 0 && (
              <span className="px-2 py-0.2 text-[10px] font-bold rounded-full bg-slate-100 text-slate-800 font-mono">
                {draftLppaCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveSubTab('HEATMAP')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'HEATMAP'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Distribusi Capaian Rombel</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ASSURANCE')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
              activeSubTab === 'ASSURANCE'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Asuransi Operasional &amp; Keselamatan</span>
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-2xl border flex items-start space-x-3 shadow-2xs ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
            : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          )}
          <div className="flex-1 text-xs">
            <p className="font-semibold">{feedback.type === 'success' ? 'Operasi Sukses' : feedback.diagnostics?.title || 'Operasi Gagal'}</p>
            <p className="mt-0.5">{feedback.message}</p>
            {feedback.diagnostics?.actionSuggestion && (
              <p className="mt-2 text-amber-900 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Active Period State Machine */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-700" />
                  <h2 className="text-sm font-bold text-slate-900">Status Periode Semester Aktif</h2>
                </div>
                {activePeriod && (
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border ${
                    activePeriod.lifecycle_status === 'ACTIVE' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {activePeriod.lifecycle_status === 'ACTIVE' ? 'SEMESTER BERJALAN' : activePeriod.lifecycle_status}
                  </span>
                )}
              </div>

              {activePeriod ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Tahun Ajaran</span>
                      <span className="text-xs font-bold text-slate-900">{activePeriod.name}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Semester</span>
                      <span className="text-xs font-bold text-slate-900">{activePeriod.semester}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Mulai</span>
                      <span className="text-xs font-mono font-semibold text-slate-800">{activePeriod.start_date}</span>
                    </div>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-[10px] text-slate-500 block uppercase font-semibold">Selesai</span>
                      <span className="text-xs font-mono font-semibold text-slate-800">{activePeriod.end_date}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-800 font-semibold">
                      <Info className="w-4 h-4 text-slate-500" />
                      <span>Jaminan Integritas Temporal:</span>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      Penutupan semester akan membekukan seluruh catatan pembelajaran, presensi, dan narasi LPPA menjadi arsip permanen yang tidak dapat diubah kembali.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                  Tidak ada periode akademik aktif saat ini.
                </div>
              )}
            </div>

            {/* Card 2: Governed Reconciliation Gate */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
                  <ShieldCheck className="w-4 h-4 text-slate-700" />
                  <h2 className="text-sm font-bold text-slate-900">Gerbang Rekonsiliasi Tutup Buku</h2>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600">Total Siswa Aktif:</span>
                    <span className="font-bold text-slate-900 font-mono">{enrolledCount} Anak</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600">Rapor LPPA Disahkan:</span>
                    <span className="font-bold text-emerald-700 font-mono">{approvedLppaCount} Rapor</span>
                  </div>
                  <div className="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-slate-600">Rapor Masih Draf:</span>
                    <span className={`font-bold font-mono ${draftLppaCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {draftLppaCount} Draf
                    </span>
                  </div>
                </div>

                <div className={`p-3 rounded-xl border text-xs flex items-center space-x-2 ${
                  isReadyForClosure 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-amber-50 border-amber-200 text-amber-800'
                }`}>
                  {isReadyForClosure ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />}
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
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer mt-4"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Tutup Semester Secara Resmi</span>
                </button>
              )}
            </div>
          </div>

          {/* Historical Terms Ledger Table */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <Archive className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Buku Catatan Riwayat Semester &amp; Arsip Periode</h3>
              </div>
              <span className="text-xs text-slate-500 font-medium">Total {allPeriods.length} Periode Tercatat</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Tahun Ajaran</th>
                    <th className="py-3 px-4">Semester</th>
                    <th className="py-3 px-4">Rentang Tanggal</th>
                    <th className="py-3 px-4">Status Siklus</th>
                    <th className="py-3 px-4">Waktu Penutupan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {allPeriods.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">{p.name}</td>
                      <td className="py-3.5 px-4 text-slate-700 font-semibold">{p.semester}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-600">{p.start_date} s.d. {p.end_date}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          p.lifecycle_status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {p.lifecycle_status === 'ACTIVE' ? 'AKTIF' : 'DITUTUP'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Penutupan Semester</h3>
              </div>
              <button
                onClick={() => setShowCloseModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3">
              <p>
                Anda akan menutup secara permanen semester <strong>{activePeriod.name} ({activePeriod.semester})</strong> untuk unit sekolah <strong>{school?.name}</strong>.
              </p>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Siswa Aktif:</span>
                  <span className="font-bold text-slate-900">{enrolledCount} Siswa</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Rapor LPPA Disahkan:</span>
                  <span className="font-bold text-emerald-700">{approvedLppaCount} Rapor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status Rekonsiliasi:</span>
                  <span className={isReadyForClosure ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                    {isReadyForClosure ? 'Lolos Prasyarat (100%)' : 'Belum Memenuhi Syarat'}
                  </span>
                </div>
              </div>

              {!isReadyForClosure && (
                <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-rose-700">
                  Peringatan: Masih ada siswa tanpa rapor LPPA berstatus disahkan.
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCloseSemester}
                disabled={isProcessing}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex justify-center items-center space-x-2 shadow-xs transition-colors cursor-pointer"
              >
                {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
                <span>Eksekusi Penutupan Semester</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Initialize Next Semester Wizard */}
      {showInitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <PlusCircle className="w-4 h-4 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">Inisialisasi Semester Baru</h3>
              </div>
              <button
                onClick={() => setShowInitModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleInitializeNextSemester} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Nama Tahun Ajaran &amp; Semester</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: TA 2026/2027 Genap"
                  value={nextName}
                  onChange={(e) => setNextName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Semester</label>
                <select
                  value={nextSemester}
                  onChange={(e) => setNextSemester(e.target.value as 'GANJIL' | 'GENAP')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                >
                  <option value="GANJIL">GANJIL</option>
                  <option value="GENAP">GENAP</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={nextStartDate}
                    onChange={(e) => setNextStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={nextEndDate}
                    onChange={(e) => setNextEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowInitModal(false)}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex justify-center items-center space-x-2 shadow-xs transition-colors cursor-pointer"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
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
