/**
 * Yapendik School OS — Stage 4.2 Headmaster LPPA Verification & Approval Hub (Fase D)
 * 
 * Epistemological & Governance Principle:
 * "Teacher Authoring -> Headmaster Verification -> Approval -> Publication"
 * 
 * Headmaster Approval Gate:
 * - Review student LPPA narratives against empirical evidence citations
 * - Single & Batch Approval Actions (Calls `lppaReportingService.approveLppaReport`)
 * - Stage 3 Option A Reconciliation: 100% LPPA Approval before Semester Closure
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { db } from '../../db/database';
import { lppaReportingService } from '../../services/lppaReportingService';
import { LppaReportDocument, LppaReportStatus, LppaElementKey } from '../../types/lppaReportingTypes';
import { LppaPrintPreviewModal } from './teacher/LppaPrintPreviewModal';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Award, 
  Search, 
  Filter, 
  AlertCircle, 
  CheckCheck, 
  Eye, 
  X, 
  BookOpen, 
  Heart, 
  Compass, 
  Layers, 
  Activity, 
  Camera, 
  Lock,
  ChevronRight,
  Sparkles,
  Printer
} from 'lucide-react';

interface Props {
  onSuccessReconciliation?: () => void;
}

export const HeadmasterLppaApprovalHub: React.FC<Props> = ({
  onSuccessReconciliation
}) => {
  const { securityContext, currentPersona } = useSecurityContext();
  const schoolId = securityContext?.activeSchoolId || 'sch_tk_yapendik_01';
  const isAuthorized = 
    securityContext?.role === 'HEADMASTER' || 
    securityContext?.role === 'YAPENDIK_SUPERADMIN' ||
    currentPersona?.role === 'HEADMASTER' ||
    currentPersona?.role === 'YAPENDIK_SUPERADMIN';

  const [reports, setReports] = useState<LppaReportDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY_FOR_REVIEW' | 'APPROVED' | 'DRAFT'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected Report for Deep Review Modal
  const [selectedReport, setSelectedReport] = useState<LppaReportDocument | null>(null);
  const [previewReport, setPreviewReport] = useState<LppaReportDocument | null>(null);
  const [activeElementKey, setActiveElementKey] = useState<LppaElementKey>('LITERASI_STEAM');
  const [approvalNotes, setApprovalNotes] = useState('Narasi komprehensif, selaras dengan capaian Kurikulum Merdeka PAUD.');
  
  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const academicYears = db.getAcademicYears(schoolId);
  const activeAy = academicYears.find(ay => ay.isActive) || academicYears[0];

  const loadReports = async () => {
    setLoading(true);
    try {
      // Fetch all students for active classes in school
      const classes = db.getClasses(schoolId);
      const allReports: LppaReportDocument[] = [];

      for (const cls of classes) {
        const students = db.getStudents(schoolId, cls.id);
        for (const st of students) {
          const reportId = `lppa_${schoolId}_${st.id}_${activeAy?.semester?.toLowerCase() || 'ganjil'}`;
          let doc = await lppaReportingService.getLppaReport(reportId, schoolId);
          
          if (!doc) {
            // Synthesize virtual draft if not existing yet
            doc = await lppaReportingService.synthesizeLppaDraft({
              school_id: schoolId,
              class_id: cls.id,
              student_id: st.id,
              academic_year_id: activeAy?.id || 'ay_2025_2026',
              semester: (activeAy?.semester as any) || 'GANJIL',
              requested_by_person_id: currentPersona?.personId || 'per_hm_marlina',
              requested_by_name: currentPersona?.name || 'Kepala Sekolah',
              role: currentPersona?.role || 'HEADMASTER'
            });
          }
          allReports.push(doc);
        }
      }
      setReports(allReports);
    } catch (err: any) {
      console.error('Error loading LPPA reports for Headmaster Hub:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [schoolId]);

  // Reconciliation Metrics
  const totalReports = reports.length;
  const approvedCount = reports.filter(r => r.status === 'APPROVED' || r.status === 'PUBLISHED').length;
  const readyCount = reports.filter(r => r.status === 'READY_FOR_REVIEW').length;
  const draftCount = reports.filter(r => r.status === 'DRAFT').length;
  const approvalPercentage = totalReports > 0 ? Math.round((approvedCount / totalReports) * 100) : 0;
  const isOptionAReady = approvedCount === totalReports && totalReports > 0;

  // Filtered List
  const filteredReports = reports.filter(r => {
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'READY_FOR_REVIEW' ? r.status === 'READY_FOR_REVIEW' :
      statusFilter === 'APPROVED' ? (r.status === 'APPROVED' || r.status === 'PUBLISHED') :
      r.status === 'DRAFT';

    const matchesSearch = 
      r.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.student_nis.includes(searchQuery);

    return matchesStatus && matchesSearch;
  });

  const handleApproveSingle = async (reportDoc: LppaReportDocument) => {
    if (!isAuthorized) {
      setFeedback({ type: 'error', message: 'Hanya Kepala Sekolah atau Pengawas yang berhak mengesahkan rapor.' });
      return;
    }
    setIsProcessing(true);
    setFeedback(null);
    try {
      await lppaReportingService.approveLppaReport({
        report_id: reportDoc.id,
        school_id: schoolId,
        approved_by_person_id: currentPersona?.personId || 'per_hm_marlina',
        approved_by_name: currentPersona?.name || 'Marlina Simanjuntak, M.Pd',
        role: currentPersona?.role || 'HEADMASTER'
      });

      setFeedback({ 
        type: 'success', 
        message: `Rapor LPPA ananda ${reportDoc.student_name} resmi disahkan Kepala Sekolah!` 
      });
      setSelectedReport(null);
      await loadReports();
      if (onSuccessReconciliation) onSuccessReconciliation();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal mengesahkan rapor.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchApproveReady = async () => {
    if (!isAuthorized) return;
    const readyReports = reports.filter(r => r.status === 'READY_FOR_REVIEW');
    if (readyReports.length === 0) {
      setFeedback({ type: 'error', message: 'Tidak ada rapor bertatus "Siap Ditinjau" (Ready for Review) saat ini.' });
      return;
    }

    if (!confirm(`Sahkan seluruh ${readyReports.length} rapor LPPA yang siap ditinjau secara serentak?`)) {
      return;
    }

    setIsProcessing(true);
    setFeedback(null);
    try {
      for (const r of readyReports) {
        await lppaReportingService.approveLppaReport({
          report_id: r.id,
          school_id: schoolId,
          approved_by_person_id: currentPersona?.personId || 'per_hm_marlina',
          approved_by_name: currentPersona?.name || 'Marlina Simanjuntak, M.Pd',
          role: currentPersona?.role || 'HEADMASTER'
        });
      }

      setFeedback({ 
        type: 'success', 
        message: `Berhasil mengesahkan ${readyReports.length} rapor LPPA serentak!` 
      });
      await loadReports();
      if (onSuccessReconciliation) onSuccessReconciliation();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal batch approval.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePublishSingle = async (reportDoc: LppaReportDocument) => {
    if (!isAuthorized) {
      setFeedback({ type: 'error', message: 'Hanya Kepala Sekolah atau Pengawas yang berhak mempublikasikan rapor.' });
      return;
    }
    setIsProcessing(true);
    setFeedback(null);
    try {
      await lppaReportingService.publishLppaReport({
        report_id: reportDoc.id,
        school_id: schoolId,
        published_by_person_id: currentPersona?.personId || 'per_hm_marlina',
        published_by_name: currentPersona?.name || 'Marlina Simanjuntak, M.Pd',
        role: currentPersona?.role || 'HEADMASTER'
      });

      setFeedback({ 
        type: 'success', 
        message: `Rapor LPPA ananda ${reportDoc.student_name} RESMI DIPUBLIKASIKAN ke Portal Orang Tua!` 
      });
      setSelectedReport(null);
      await loadReports();
      if (onSuccessReconciliation) onSuccessReconciliation();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal mempublikasikan rapor.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchPublishApproved = async () => {
    if (!isAuthorized) return;
    const approvedReports = reports.filter(r => r.status === 'APPROVED');
    if (approvedReports.length === 0) {
      setFeedback({ type: 'error', message: 'Tidak ada rapor bertatus APPROVED yang siap dipublikasikan.' });
      return;
    }

    if (!confirm(`Publikasikan ${approvedReports.length} rapor LPPA yang telah disahkan ke Portal Wali Murid?`)) {
      return;
    }

    setIsProcessing(true);
    setFeedback(null);
    try {
      for (const r of approvedReports) {
        await lppaReportingService.publishLppaReport({
          report_id: r.id,
          school_id: schoolId,
          published_by_person_id: currentPersona?.personId || 'per_hm_marlina',
          published_by_name: currentPersona?.name || 'Marlina Simanjuntak, M.Pd',
          role: currentPersona?.role || 'HEADMASTER'
        });
      }

      setFeedback({ 
        type: 'success', 
        message: `Berhasil mempublikasikan ${approvedReports.length} rapor LPPA serentak ke orang tua siswa!` 
      });
      await loadReports();
      if (onSuccessReconciliation) onSuccessReconciliation();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal batch publish.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const readyToPublishCount = reports.filter(r => r.status === 'APPROVED').length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER & RECONCILIATION PULSE */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">
                  Gerbang Verifikasi & Pengesahan Rapor LPPA
                </h2>
                <span className="px-2 py-0.5 text-xs font-black rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-200">
                  Kepala Sekolah
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-1">
                {activeAy?.name} • Semester {activeAy?.semester} • Syarat Mutlak Penutupan Semester (Stage 3 Option A)
              </p>
            </div>
          </div>

          {/* Batch Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {isAuthorized && readyCount > 0 && (
              <button
                onClick={handleBatchApproveReady}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Sahkan Semua yang Siap ({readyCount} Rapor)</span>
              </button>
            )}

            {isAuthorized && readyToPublishCount > 0 && (
              <button
                onClick={handleBatchPublishApproved}
                disabled={isProcessing}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>📢 Publikasikan Semua Disahkan ({readyToPublishCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* 100% Reconciliation Progress Bar */}
        <div className="mt-6 pt-6 border-t border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
          <div className="md:col-span-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-700 font-bold flex items-center gap-1.5">
                <Award className="w-4 h-4 text-purple-600" />
                <span>Kesiapan Pengesahan Rapor Rombel:</span>
                <strong className="text-slate-900 font-black">{approvedCount} dari {totalReports} Siswa Disahkan</strong>
              </span>
              <span className={`font-black ${isOptionAReady ? 'text-emerald-700' : 'text-purple-700'}`}>
                {approvalPercentage}%
              </span>
            </div>
            <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOptionAReady ? 'bg-emerald-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${approvalPercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>{readyCount} siap ditinjau • {draftCount} masih draf guru</span>
              <span className={`font-bold ${isOptionAReady ? 'text-emerald-700' : 'text-amber-700'}`}>
                {isOptionAReady ? '✅ Syarat Tutup Semester Terpenuhi (100%)' : '⏳ Belum Siap Tutup Semester'}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-center">
            <div className="text-[11px] text-slate-600 font-bold">Status Rapor</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {isOptionAReady ? 'Semua Disahkan' : `${totalReports - approvedCount} Belum Disahkan`}
            </div>
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
            : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* CONTROLS: Filter & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-slate-900 text-white border-slate-900'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua ({totalReports})
          </button>
          <button
            onClick={() => setStatusFilter('READY_FOR_REVIEW')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1 ${
              statusFilter === 'READY_FOR_REVIEW'
                ? 'bg-sky-600 text-white border-sky-600'
                : 'bg-sky-50 text-sky-800 border-sky-200 hover:bg-sky-100'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Siap Ditinjau ({readyCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1 ${
              statusFilter === 'APPROVED'
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Disahkan ({approvedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition cursor-pointer flex items-center gap-1 ${
              statusFilter === 'DRAFT'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Draf ({draftCount})</span>
          </button>
        </div>

        <div className="relative max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama atau NIS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* REPORTS LIST / CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map(doc => {
          const isApproved = doc.status === 'APPROVED' || doc.status === 'PUBLISHED';
          const isReady = doc.status === 'READY_FOR_REVIEW';

          return (
            <div
              key={doc.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isApproved 
                  ? 'border-emerald-200 bg-emerald-50/20' 
                  : isReady
                  ? 'border-sky-300 ring-2 ring-sky-500/10'
                  : 'border-slate-200'
              }`}
            >
              <div>
                {/* Header: Student Name & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                      {doc.student_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-slate-600 font-mono font-semibold">NIS {doc.student_nis}</span>
                      <span className="text-[10px] text-slate-500">• {doc.class_id ? 'Kelompok A' : 'TK'}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full border ${
                    isApproved
                      ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                      : isReady
                      ? 'bg-sky-100 text-sky-900 border-sky-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                  }`}>
                    {isApproved ? 'Disahkan' : isReady ? 'Siap Ditinjau' : 'Draf Guru'}
                  </span>
                </div>

                {/* Elements Rating Breakdown Chips */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1.5 mb-4">
                  <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                    Ringkasan Capaian:
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200">
                      <span className="text-slate-700 truncate mr-1">NABP:</span>
                      <span className="font-black text-purple-700">{doc.elements.NILAI_AGAMA_BUDI_PEKERTI.rating_summary}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200">
                      <span className="text-slate-700 truncate mr-1">Jati Diri:</span>
                      <span className="font-black text-purple-700">{doc.elements.JATI_DIRI.rating_summary}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200">
                      <span className="text-slate-700 truncate mr-1">STEAM:</span>
                      <span className="font-black text-purple-700">{doc.elements.LITERASI_STEAM.rating_summary}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2 py-1 rounded border border-slate-200">
                      <span className="text-slate-700 truncate mr-1">P5:</span>
                      <span className="font-black text-purple-700">{doc.elements.PROJEK_P5.rating_summary}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setSelectedReport(doc)}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-indigo-100 text-slate-800 hover:text-indigo-900 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Tinjau Narasi</span>
                  </button>

                  <button
                    onClick={() => setPreviewReport(doc)}
                    className="py-2 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>Pratinjau PDF</span>
                  </button>
                </div>

                {isAuthorized && !isApproved && (
                  <button
                    onClick={() => handleApproveSingle(doc)}
                    disabled={isProcessing}
                    className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Sahkan Rapor (Kepala Sekolah)</span>
                  </button>
                )}

                {isAuthorized && doc.status === 'APPROVED' && (
                  <button
                    onClick={() => handlePublishSingle(doc)}
                    disabled={isProcessing}
                    className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>📢 Publikasikan ke Orang Tua</span>
                  </button>
                )}

                {doc.status === 'PUBLISHED' && (
                  <div className="text-center py-1.5 bg-purple-50 text-purple-900 border border-purple-200 rounded-xl text-[11px] font-black flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                    <span>Terbit Resmi di Portal Orang Tua</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* DEEP REVIEW & APPROVAL MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/75 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-slate-900">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Penelaahan Rapor LPPA — {selectedReport.student_name}
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    NIS {selectedReport.student_nis} • Status: {selectedReport.status}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Elements Review */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* Element Navigation Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['NILAI_AGAMA_BUDI_PEKERTI', 'JATI_DIRI', 'LITERASI_STEAM', 'PROJEK_P5'] as LppaElementKey[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setActiveElementKey(k)}
                    className={`p-2.5 text-left rounded-xl border text-xs font-bold transition cursor-pointer ${
                      activeElementKey === k
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <div className="truncate">{selectedReport.elements[k].element_title}</div>
                    <div className={`text-[10px] font-black mt-0.5 ${activeElementKey === k ? 'text-indigo-200' : 'text-purple-700'}`}>
                      Rating: {selectedReport.elements[k].rating_summary}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Element Narrative & Citations */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                    Narasi Reflektif Akhir Guru:
                  </h4>
                  <p className="text-xs text-slate-900 leading-relaxed font-medium bg-white p-3.5 rounded-xl border border-slate-200">
                    "{selectedReport.elements[activeElementKey].teacher_final_narrative}"
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-1">
                    Rekomendasi Stimulasi Lanjutan:
                  </h4>
                  <p className="text-xs text-slate-800 italic bg-white p-2.5 rounded-xl border border-slate-200">
                    {selectedReport.elements[activeElementKey].growth_recommendations || 'Pendampingan berkelanjutan.'}
                  </p>
                </div>
              </div>

              {/* Homeroom Reflection */}
              <div className="bg-purple-50 p-4 rounded-2xl border border-purple-200 space-y-1">
                <div className="text-xs font-black text-purple-900">
                  Refleksi Guru Kelas untuk Orang Tua:
                </div>
                <p className="text-xs text-purple-950 font-medium italic">
                  "{selectedReport.homeroom_teacher_reflection}"
                </p>
              </div>

              {/* Headmaster Approval Note Input */}
              {isAuthorized && selectedReport.status !== 'APPROVED' && selectedReport.status !== 'PUBLISHED' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-900">
                    Catatan Pengesahan Kepala Sekolah:
                  </label>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={e => setApprovalNotes(e.target.value)}
                    className="w-full p-2.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition cursor-pointer"
                >
                  Tutup
                </button>

                <button
                  onClick={() => {
                    setPreviewReport(selectedReport);
                  }}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
                >
                  <Printer className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Pratinjau PDF</span>
                </button>
              </div>

              {isAuthorized && selectedReport.status !== 'APPROVED' && selectedReport.status !== 'PUBLISHED' && (
                <button
                  onClick={() => handleApproveSingle(selectedReport)}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sahkan & Beri Cap Persetujuan</span>
                </button>
              )}

              {isAuthorized && selectedReport.status === 'APPROVED' && (
                <button
                  onClick={() => handlePublishSingle(selectedReport)}
                  disabled={isProcessing}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>📢 Publikasikan ke Orang Tua</span>
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Official Canonical Print Preview Modal (Fase E2 & E3) */}
      {previewReport && (
        <LppaPrintPreviewModal
          isOpen={Boolean(previewReport)}
          onClose={() => setPreviewReport(null)}
          record={lppaReportingService.toCanonicalPublishedRecord(
            previewReport,
            'TK Yapendik 01 Menteng',
            '20104821',
            'Kelompok A (Usia 4-5 Tahun)',
            'Siti Rahmawati, S.Pd',
          )}
        />
      )}
    </div>
  );
};
