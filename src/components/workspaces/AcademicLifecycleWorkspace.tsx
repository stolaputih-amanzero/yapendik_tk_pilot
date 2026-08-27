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
  ShieldAlert
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
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 space-y-6 text-slate-900 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 md:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-slate-600 text-xs font-bold tracking-wider uppercase mb-1">
              <Calendar className="w-4 h-4" />
              <span>Stage 3.4 • Academic Lifecycle & Temporal Engine</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Tata Kelola Siklus Akademik & Semester
            </h1>
            <p className="text-slate-500 text-sm mt-1">
              {school?.name || 'TK Yapendik Menteng'} • NPSN: {school?.npsn || 'NPSN-20104567'}
            </p>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto mt-3 md:mt-0">
            <button
              onClick={loadLifecycleData}
              disabled={refreshing}
              className="w-full md:w-auto px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex justify-center items-center space-x-2 transition-all shadow-xs cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-slate-600' : ''}`} />
              <span>Muat Ulang</span>
            </button>

            {isAuthorizedActor && activePeriod?.lifecycle_status === 'CLOSED' && (
              <button
                onClick={() => setShowInitModal(true)}
                className="w-full md:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs shadow-xs flex justify-center items-center space-x-2 transition-all cursor-pointer mt-3 md:mt-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Buka Semester Baru</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div className={`p-4 rounded-xl border flex items-start space-x-3 animate-in fade-in slide-in-from-top-2 duration-200 ${
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
              <p className="mt-2 text-amber-900 font-medium bg-amber-50 p-2 rounded-lg border border-amber-200">
                💡 Rekomendasi Tindakan: {feedback.diagnostics.actionSuggestion}
              </p>
            )}
          </div>
        </div>
      )}
      {/* Sub-Tab Switcher for Headmaster & Superadmin */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('OVERVIEW')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'OVERVIEW'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Status & Tata Kelola Semester</span>
        </button>

        <button
          onClick={() => setActiveSubTab('LPPA_APPROVAL')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'LPPA_APPROVAL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Gerbang Verifikasi & Pengesahan LPPA</span>
          {draftLppaCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-slate-100 text-slate-800 border border-slate-200">
              {draftLppaCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('HEATMAP')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'HEATMAP'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Peta Kontinuitas & Kesiapan Rombel</span>
        </button>

        {/* Stage 4.4-D: Sub-Tab 4 - Headmaster Operational Assurance Hub */}
        <button
          onClick={() => setActiveSubTab('ASSURANCE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeSubTab === 'ASSURANCE'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Jaminan Operasional & Keselamatan</span>
        </button>
      </div>

      {activeSubTab === 'LPPA_APPROVAL' ? (
        <HeadmasterLppaApprovalHub onSuccessReconciliation={loadLifecycleData} />
      ) : activeSubTab === 'HEATMAP' ? (
        <ClassroomHeatmapView 
          schoolId={activePeriod?.school_id || 'sch_tk_yapendik_01'} 
          classId={'cls_tk_a_menteng'} 
        />
      ) : activeSubTab === 'ASSURANCE' ? (
        <HeadmasterAssuranceView
          schoolId={activePeriod?.school_id || currentSchoolId}
          headmasterPersonId={securityContext?.personId || 'per_hm_esther'}
          headmasterName={securityContext?.userEmail || 'Dra. Esther Nugroho, M.Pd'}
          role={securityContext?.role || 'HEADMASTER'}
        />
      ) : (
        <>
          {/* Main Grid: Active Term & LPPA Reconciliation */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Card 1: Active Period Overview & State Machine */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Periode Berjalan</span>
                  {activePeriod && (
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center space-x-1.5 ${
                      activePeriod.lifecycle_status === 'ACTIVE' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : activePeriod.lifecycle_status === 'CLOSED'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        activePeriod.lifecycle_status === 'ACTIVE' ? 'bg-emerald-600' : 'bg-slate-400'
                      }`}></span>
                      <span>{activePeriod.lifecycle_status}</span>
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">{activePeriod?.name || 'T.A. 2025/2026'}</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">Semester {activePeriod?.semester || 'GANJIL'}</p>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tanggal Mulai:</span>
                      <span className="font-mono text-slate-900">{activePeriod?.start_date || '—'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tanggal Selesai:</span>
                      <span className="font-mono text-slate-900">{activePeriod?.end_date || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button: Close Semester */}
              <div className="pt-6 border-t border-slate-100 mt-4">
                {activePeriod?.lifecycle_status === 'ACTIVE' || activePeriod?.lifecycle_status === 'CLOSING' ? (
                  <button
                    onClick={() => setShowCloseModal(true)}
                    disabled={!isAuthorizedActor}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-semibold text-xs shadow-xs flex items-center justify-center space-x-2 transition-all cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Tutup Semester Akademik</span>
                  </button>
                ) : (
                  <div className="text-center py-2 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500 font-medium">
                    🔒 Semester Ini Telah Berstatus CLOSED
                  </div>
                )}
              </div>
            </div>

            {/* Card 2: 100% LPPA Reconciliation Diagnostic Gate */}
            <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Syarat Penutupan Semester</span>
                    <h3 className="text-base font-bold text-slate-900 mt-0.5">Gerbang Rekonsiliasi Rapor LPPA (100% Rule)</h3>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    isReadyForClosure 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {isReadyForClosure ? 'Siap Ditutup (100%)' : 'Belum Lengkap'}
                  </span>
                </div>

                {/* Reconciliation Progress Meter */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-slate-500">Ketuntasan Persetujuan Rapor LPPA:</span>
                    <span className="text-slate-900 font-bold">{reconciliationPct}% ({approvedLppaCount}/{enrolledCount} Siswa)</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 p-0.5 border border-slate-200">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        reconciliationPct === 100 
                          ? 'bg-emerald-600' 
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${reconciliationPct}%` }}
                    ></div>
                  </div>
                </div>

                {/* 3-Column Metrics Breakdown */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                      <Users className="w-3.5 h-3.5 text-slate-700" />
                      <span>Siswa Aktif</span>
                    </div>
                    <div className="text-xl font-bold text-slate-900">{enrolledCount}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Penempatan aktif di rombel</div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>LPPA Disetujui</span>
                    </div>
                    <div className="text-xl font-bold text-emerald-600">{approvedLppaCount}</div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Status APPROVED / PUBLISHED</div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <div className="flex items-center space-x-2 text-slate-500 text-xs mb-1">
                      <FileText className="w-3.5 h-3.5 text-amber-500" />
                      <span>LPPA DRAFT / Pending</span>
                    </div>
                    <div className={`text-xl font-bold ${draftLppaCount > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
                      {draftLppaCount}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Memerlukan review Kepala Sekolah</div>
                  </div>
                </div>

                {/* Shortcut to Hub */}
                <button
                  onClick={() => setActiveSubTab('LPPA_APPROVAL')}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs mb-4"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buka Gerbang Verifikasi & Pengesahan LPPA ({draftLppaCount} Pending)</span>
                  <ArrowRight className="w-4 h-4 ml-auto" />
                </button>

                {/* Option A Invariant Assurance Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700 space-y-1.5">
                  <div className="flex items-center space-x-2 text-slate-900 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-slate-700" />
                    <span>Jaminan Integritas Siklus (Prinsip Option A Stage 3)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Menutup semester akan membekukan operasi akademik harian (presensi, observasi, rapor LPPA) menjadi catatan historis *read-only*. Penempatan siswa di rombel **tetap utuh dan aktif** sampai dilakukan proses promosi rombel (*Cohort Promotion*) atau kelulusan (*Graduation*).
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Terms Archive Ledger */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Archive className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-bold text-slate-900">Buku Catatan Riwayat Semester & Arsip Periode</h3>
              </div>
              <span className="text-xs text-slate-500">Total {allPeriods.length} Periode Tercatat</span>
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
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          p.lifecycle_status === 'ACTIVE' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {p.lifecycle_status}
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
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-100 pb-3">
              <Lock className="w-5 h-5 text-slate-700" />
              <h3 className="text-base font-bold text-slate-900">Konfirmasi Penutupan Semester Akademik</h3>
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
                  <span className="text-slate-500">Rapor LPPA Disetujui:</span>
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
                  ⚠️ Peringatan: Masih ada siswa tanpa rapor LPPA berstatus APPROVED. Eksekusi penutupan akan ditolak oleh PostgreSQL RPC.
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCloseModal(false)}
                disabled={isProcessing}
                className="w-full md:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleCloseSemester}
                disabled={isProcessing}
                className="w-full md:w-auto mt-3 md:mt-0 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex justify-center items-center space-x-2 shadow-xs cursor-pointer"
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
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-slate-900">
            <div className="flex items-center space-x-3 text-slate-900 border-b border-slate-100 pb-3">
              <PlusCircle className="w-5 h-5 text-slate-700" />
              <h3 className="text-base font-bold text-slate-900">Inisialisasi & Buka Semester Baru</h3>
            </div>

            <form onSubmit={handleInitializeNextSemester} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Nama Tahun Ajaran & Semester</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: T.A. 2026/2027 Genap"
                  value={nextName}
                  onChange={(e) => setNextName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Semester</label>
                <select
                  value={nextSemester}
                  onChange={(e) => setNextSemester(e.target.value as 'GANJIL' | 'GENAP')}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400 flex justify-between items-center"
                >
                  <option value="GANJIL">GANJIL</option>
                  <option value="GENAP">GENAP</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    required
                    value={nextStartDate}
                    onChange={(e) => setNextStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-semibold mb-1">Tanggal Selesai</label>
                  <input
                    type="date"
                    required
                    value={nextEndDate}
                    onChange={(e) => setNextEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-slate-400"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center justify-end gap-3 pt-3 border-t border-slate-100 mt-4">
                <button
                  type="button"
                  onClick={() => setShowInitModal(false)}
                  disabled={isProcessing}
                  className="w-full md:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full md:w-auto mt-3 md:mt-0 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex justify-center items-center space-x-2 cursor-pointer shadow-xs"
                >
                  {isProcessing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <PlusCircle className="w-3.5 h-3.5" />}
                  <span>Buka Semester</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
