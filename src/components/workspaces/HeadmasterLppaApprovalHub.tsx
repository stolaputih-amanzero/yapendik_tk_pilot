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
import { ProgressBar } from '../ui';
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
  const [approvalNotes, setApprovalNotes] = useState('Narasi komprehensif, selaras dengan capaian Kurikulum Merdeka TK.');
  
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
    <div className="px-4 medium:px-6 py-6 space-y-6 animate-in fade-in duration-200 pb-[132px] expanded:pb-8">
      
      {/* HEADER & RECONCILIATION PULSE */}
      <div className="bg-surface border-y medium:border medium:border-line medium:rounded-3xl p-4 medium:p-6 medium:shadow-hairline -mx-4 expanded:mx-0">
        <div className="flex flex-col expanded:flex-row expanded:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-card bg-indigo-600 text-on-brand shadow-ambient shadow-indigo-600/20">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-ink">
                  Gerbang Verifikasi & Pengesahan Rapor LPPA
                </h2>
                <span className="px-2 py-1 text-xs font-black rounded-lg bg-indigo-100 text-lppa-deep border border-lppa-line">
                  Kepala Sekolah
                </span>
              </div>
              <p className="text-xs text-ink-soft font-medium mt-1">
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
                className="w-full medium:w-auto mt-3 medium:mt-0 px-4 py-2 rounded-field bg-success hover-only:bg-emerald-700 text-on-brand text-xs font-black transition flex items-center justify-center gap-2 shadow-ambient shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Sahkan Semua yang Siap ({readyCount} Rapor)</span>
              </button>
            )}

            {isAuthorized && readyToPublishCount > 0 && (
              <button
                onClick={handleBatchPublishApproved}
                disabled={isProcessing}
                className="w-full medium:w-auto mt-3 medium:mt-0 px-4 py-2 rounded-field bg-purple-600 hover-only:bg-purple-700 text-on-brand text-xs font-black transition flex items-center justify-center gap-2 shadow-ambient shadow-purple-600/20 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publikasikan Semua Disahkan ({readyToPublishCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* 100% Reconciliation Progress Bar */}
        <div className="mt-6 pt-6 border-t border-line grid grid-cols-1 medium:grid-cols-4 gap-4 items-center">
          <div className="expanded:col-span-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-ink-soft font-bold flex items-center gap-2">
                <Award className="w-4 h-4 text-lppa" />
                <span>Kesiapan Pengesahan Rapor Rombel:</span>
                <strong className="text-ink font-black">{approvedCount} dari {totalReports} Siswa Disahkan</strong>
              </span>
              <span className={`font-black ${isOptionAReady ? 'text-success-deep' : 'text-lppa-deep'}`}>
                {approvalPercentage}%
              </span>
            </div>
            <ProgressBar
              value={approvalPercentage}
              variant={isOptionAReady ? 'success' : 'lppa'}
              trackClassName="h-3"
            />
            <div className="flex items-center justify-between text-[11px] text-ink-soft">
              <span>{readyCount} siap ditinjau • {draftCount} masih draf guru</span>
              <span className={`font-bold ${isOptionAReady ? 'text-success-deep' : 'text-warning-deep'}`}>
                {isOptionAReady ? 'Syarat Tutup Semester Terpenuhi (100%)' : 'Belum Siap Tutup Semester'}
              </span>
            </div>
          </div>

          <div className="bg-surface-subtle p-3 rounded-card border border-line text-center">
            <div className="text-[11px] text-ink-soft font-bold">Status Rapor</div>
            <div className="text-sm font-black text-ink mt-0.5">
              {isOptionAReady ? 'Semua Disahkan' : `${totalReports - approvedCount} Belum Disahkan`}
            </div>
          </div>
        </div>
      </div>

      {/* FEEDBACK BANNERS */}
      {feedback && (
        <div className={`p-4 rounded-card border text-xs font-bold flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'bg-success-tint border-success-line text-success-deep' 
            : 'bg-danger-tint border-danger-line text-danger-deep'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* CONTROLS: Filter & Search */}
      <div className="flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-3 bg-surface p-4 rounded-card border border-line shadow-hairline">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 medium:pb-0 [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1 text-xs font-bold rounded-field border transition cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-brand text-on-brand border-brand'
                : 'bg-surface-subtle text-ink-soft border-line hover-only:bg-surface-subtle'
            }`}
          >
            Semua ({totalReports})
          </button>
          <button
            onClick={() => setStatusFilter('READY_FOR_REVIEW')}
            className={`px-3 py-1 text-xs font-bold rounded-field border transition cursor-pointer flex items-center gap-1 ${
              statusFilter === 'READY_FOR_REVIEW'
                ? 'bg-info text-on-brand border-sky-600'
                : 'bg-info-tint text-info-deep border-info-line hover-only:bg-info-tint'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Siap Ditinjau ({readyCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('APPROVED')}
            className={`px-3 py-1 text-xs font-bold rounded-field border transition cursor-pointer flex items-center gap-1 ${
              statusFilter === 'APPROVED'
                ? 'bg-success text-on-brand border-emerald-600'
                : 'bg-success-tint text-success-deep border-success-line hover-only:bg-success-tint'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Disahkan ({approvedCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('DRAFT')}
            className={`px-3 py-1 text-xs font-bold rounded-field border transition cursor-pointer flex items-center gap-1 ${
              statusFilter === 'DRAFT'
                ? 'bg-warning text-on-brand border-amber-600'
                : 'bg-warning-tint text-warning-deep border-warning-line hover-only:bg-warning-tint'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Draf ({draftCount})</span>
          </button>
        </div>

        <div className="relative max-w-xs">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="text"
            placeholder="Cari nama atau NIS..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-1 text-xs rounded-field bg-surface-subtle border border-line text-ink font-medium placeholder:text-ink-soft focus:outline-none focus:ring-2 focus:ring-brass/30"
          />
        </div>
      </div>

      {/* REPORTS LIST / CARDS */}
      <div className="grid grid-cols-1 medium:grid-cols-2 expanded:grid-cols-3 gap-4">
        {filteredReports.map(doc => {
          const isApproved = doc.status === 'APPROVED' || doc.status === 'PUBLISHED';
          const isReady = doc.status === 'READY_FOR_REVIEW';

          return (
            <div
              key={doc.id}
              className={`p-4 rounded-card border transition-all flex flex-col justify-between shadow-hairline ${
                isApproved 
                  ? 'border-success-line bg-success-tint/20' 
                  : isReady
                  ? 'border-sky-300 ring-2 ring-sky-500/10 bg-surface'
                  : 'border-line bg-surface'
              }`}
            >
              <div>
                {/* Header: Student Name & Status */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h4 className="text-sm font-bold text-ink leading-tight">
                      {doc.student_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] text-ink-soft font-mono font-semibold whitespace-nowrap">NIS {doc.student_nis}</span>
                      <span className="text-[10px] text-ink-soft">• {doc.class_id ? 'Kelompok A' : 'TK'}</span>
                    </div>
                  </div>

                  <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${
                    isApproved
                      ? 'bg-success-tint text-success-deep border-success-line'
                      : isReady
                      ? 'bg-info-tint text-info-deep border-info-line'
                      : 'bg-warning-tint text-warning-deep border-warning-line'
                  }`}>
                    {isApproved ? 'Disahkan' : isReady ? 'Siap Ditinjau' : 'Draf Guru'}
                  </span>
                </div>

                {/* Elements Rating Breakdown Chips */}
                <div className="bg-surface-subtle p-3 rounded-field border border-line space-y-1.5 mb-4">
                  <div className="text-[10px] font-bold text-ink-soft uppercase tracking-wider">
                    Ringkasan Capaian:
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="flex items-center justify-between bg-surface px-2 py-1 rounded-lg border border-line">
                      <span className="text-ink-soft truncate mr-1">NABP:</span>
                      <span className="font-bold text-ink font-mono">{doc.elements.NILAI_AGAMA_BUDI_PEKERTI.rating_summary}</span>
                    </div>
                    <div className="flex items-center justify-between bg-surface px-2 py-1 rounded-lg border border-line">
                      <span className="text-ink-soft truncate mr-1">Jati Diri:</span>
                      <span className="font-bold text-ink font-mono">{doc.elements.JATI_DIRI.rating_summary}</span>
                    </div>
                    <div className="flex items-center justify-between bg-surface px-2 py-1 rounded-lg border border-line">
                      <span className="text-ink-soft truncate mr-1">STEAM:</span>
                      <span className="font-bold text-ink font-mono">{doc.elements.LITERASI_STEAM.rating_summary}</span>
                    </div>
                    <div className="flex items-center justify-between bg-surface px-2 py-1 rounded-lg border border-line">
                      <span className="text-ink-soft truncate mr-1">P5:</span>
                      <span className="font-bold text-ink font-mono">{doc.elements.PROJEK_P5.rating_summary}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1.5 pt-3 border-t border-line-soft">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setSelectedReport(doc)}
                    className="py-2 px-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink border border-line text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-ink-soft" />
                    <span>Tinjau Narasi</span>
                  </button>

                  <button
                    onClick={() => setPreviewReport(doc)}
                    className="py-2 px-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink border border-line text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-ink-soft" />
                    <span>Pratinjau PDF</span>
                  </button>
                </div>

                {isAuthorized && !isApproved && (
                  <button
                    onClick={() => handleApproveSingle(doc)}
                    disabled={isProcessing}
                    className="w-full py-2 px-3 rounded-field bg-brand hover-only:bg-surface-inset text-on-brand text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-hairline disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sahkan Rapor (Kepala Sekolah)</span>
                  </button>
                )}

                {isAuthorized && doc.status === 'APPROVED' && (
                  <button
                    onClick={() => handlePublishSingle(doc)}
                    disabled={isProcessing}
                    className="w-full py-2 px-3 rounded-field bg-brand hover-only:bg-surface-inset text-on-brand text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-hairline disabled:opacity-50"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Publikasikan ke Orang Tua</span>
                  </button>
                )}

                {doc.status === 'PUBLISHED' && (
                  <div className="text-center py-2 bg-success-tint text-success-deep border border-success-line rounded-field text-[11px] font-bold flex items-center justify-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-success" />
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 medium:p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-card border border-line shadow-floating w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-ink">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-line-soft bg-surface-subtle flex items-center justify-between gap-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-field bg-brand text-on-brand shadow-hairline">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-ink">
                    Penelaahan Rapor LPPA • {selectedReport.student_name}
                  </h3>
                  <p className="text-xs text-ink-soft font-medium">
                    NIS {selectedReport.student_nis} • Status: {selectedReport.status}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-line-soft text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Elements Review */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              
              {/* Element Navigation Tabs */}
              <div className="grid grid-cols-2 medium:grid-cols-4 gap-2">
                {(['NILAI_AGAMA_BUDI_PEKERTI', 'JATI_DIRI', 'LITERASI_STEAM', 'PROJEK_P5'] as LppaElementKey[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setActiveElementKey(k)}
                    className={`p-2 text-left rounded-field border text-xs font-bold transition cursor-pointer ${
                      activeElementKey === k
                        ? 'bg-indigo-600 text-on-brand border-indigo-600 shadow-hairline'
                        : 'bg-surface-subtle text-ink-soft border-line hover-only:bg-surface-subtle'
                    }`}
                  >
                    <div className="truncate">{selectedReport.elements[k].element_title}</div>
                    <div className={`text-[10px] font-black mt-0.5 ${activeElementKey === k ? 'text-indigo-200' : 'text-lppa-deep'}`}>
                      Rating: {selectedReport.elements[k].rating_summary}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Element Narrative & Citations */}
              <div className="bg-surface-subtle p-4 rounded-card border border-line space-y-4">
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-ink-soft mb-1">
                    Narasi Reflektif Akhir Guru:
                  </h4>
                  <p className="text-xs text-ink leading-relaxed font-medium bg-surface p-3 rounded-field border border-line">
                    "{selectedReport.elements[activeElementKey].teacher_final_narrative}"
                  </p>
                </div>

                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-ink-soft mb-1">
                    Rekomendasi Stimulasi Lanjutan:
                  </h4>
                  <p className="text-xs text-ink italic bg-surface p-2 rounded-field border border-line">
                    {selectedReport.elements[activeElementKey].growth_recommendations || 'Pendampingan berkelanjutan.'}
                  </p>
                </div>
              </div>

              {/* Homeroom Reflection */}
              <div className="bg-lppa-tint p-4 rounded-card border border-lppa-line space-y-1">
                <div className="text-xs font-black text-lppa-deep">
                  Refleksi Guru Kelas untuk Orang Tua:
                </div>
                <p className="text-xs text-lppa-deep font-medium italic">
                  "{selectedReport.homeroom_teacher_reflection}"
                </p>
              </div>

              {/* Headmaster Approval Note Input */}
              {isAuthorized && selectedReport.status !== 'APPROVED' && selectedReport.status !== 'PUBLISHED' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">
                    Catatan Pengesahan Kepala Sekolah:
                  </label>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={e => setApprovalNotes(e.target.value)}
                    className="w-full p-2 text-xs font-medium rounded-field bg-surface-subtle border border-line text-ink"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-line bg-surface-subtle flex flex-col medium:flex-row items-center justify-end medium:justify-between gap-3 shrink-0">
              <div className="flex flex-col medium:flex-row items-center gap-2 w-full medium:w-auto">
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-full medium:w-auto px-4 py-2 rounded-field bg-line-soft hover-only:bg-line-strong text-ink text-xs font-bold transition cursor-pointer"
                >
                  Tutup
                </button>

                <button
                  onClick={() => {
                    setPreviewReport(selectedReport);
                  }}
                  className="w-full medium:w-auto px-4 py-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink text-xs font-bold transition flex justify-center items-center gap-2 cursor-pointer border border-line"
                >
                  <Printer className="w-4 h-4 text-lppa" />
                  <span>Pratinjau PDF</span>
                </button>
              </div>

              {isAuthorized && selectedReport.status !== 'APPROVED' && selectedReport.status !== 'PUBLISHED' && (
                <button
                  onClick={() => handleApproveSingle(selectedReport)}
                  disabled={isProcessing}
                  className="w-full medium:w-auto mt-3 medium:mt-0 px-5 py-2 rounded-field bg-success hover-only:bg-emerald-700 text-on-brand text-xs font-black transition flex justify-center items-center gap-2 shadow-ambient shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sahkan & Beri Cap Persetujuan</span>
                </button>
              )}

              {isAuthorized && selectedReport.status === 'APPROVED' && (
                <button
                  onClick={() => handlePublishSingle(selectedReport)}
                  disabled={isProcessing}
                  className="w-full medium:w-auto mt-3 medium:mt-0 px-5 py-2 rounded-field bg-purple-600 hover-only:bg-purple-700 text-on-brand text-xs font-black transition flex justify-center items-center gap-2 shadow-ambient shadow-purple-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publikasikan ke Orang Tua</span>
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
