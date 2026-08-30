/**
 * Yapendik School OS — Stage 4.2 Headmaster LPPA Verification & Approval Hub (Fase D)
 * 
 * Epistemological & Governance Principle:
 * "Teacher Authoring -> Headmaster Verification -> Approval -> Publication"
 * 
 * Canvas-Native Flat Architecture (Hukum F-7 / A-2).
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { db } from '../../db/database';
import { lppaReportingService } from '../../services/lppaReportingService';
import { LppaReportDocument, LppaReportStatus, LppaElementKey } from '../../types/lppaReportingTypes';
import { LppaPrintPreviewModal } from './teacher/LppaPrintPreviewModal';
import { ProgressBar, Button } from '../ui';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Award, 
  Search, 
  AlertCircle, 
  CheckCheck, 
  Eye, 
  X, 
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
      const classes = db.getClasses(schoolId);
      const allReports: LppaReportDocument[] = [];

      for (const cls of classes) {
        const students = db.getStudents(schoolId, cls.id);
        for (const st of students) {
          const reportId = `lppa_${schoolId}_${st.id}_${activeAy?.semester?.toLowerCase() || 'ganjil'}`;
          let doc = await lppaReportingService.getLppaReport(reportId, schoolId);
          
          if (!doc) {
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
        message: `Rapor LPPA atas nama ${reportDoc.student_name} (${reportDoc.student_nis}) berhasil disahkan secara resmi!` 
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

  const handlePublishSingle = async (reportDoc: LppaReportDocument) => {
    if (!isAuthorized) {
      setFeedback({ type: 'error', message: 'Hanya Kepala Sekolah yang berhak mempublikasikan rapor.' });
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
        message: `Rapor LPPA atas nama ${reportDoc.student_name} resmi dipublikasikan dan sekarang dapat diakses oleh Orang Tua.` 
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

  const handleBatchApproveReady = async () => {
    const readyReports = reports.filter(r => r.status === 'READY_FOR_REVIEW');
    if (readyReports.length === 0) return;

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

  const handleBatchPublishApproved = async () => {
    const approvedReports = reports.filter(r => r.status === 'APPROVED');
    if (approvedReports.length === 0) return;

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
    <div 
      className="w-full max-w-6xl mx-auto px-4 medium:px-6 pt-6 pb-[160px] space-y-8 animate-in fade-in duration-200 text-ink"
      data-testid="headmaster-lppa-hub"
    >
      {/* 1. HERO CANVAS (R-1 Hero Canvas) */}
      <header className="space-y-4">
        <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand-deep text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-brand-deep shrink-0" />
              <span>Verifikasi &amp; Pengesahan • Kurikulum Merdeka TK</span>
            </div>
            <h1 className="text-[28px] medium:text-3xl font-bold tracking-tight text-ink leading-tight flex items-center gap-2 flex-wrap">
              <span>Pengesahan Rapor LPPA</span>
              <span className="text-xs font-normal text-success-deep flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Stage 3 Option A</span>
              </span>
            </h1>
            <p className="text-ink-soft text-sm max-w-2xl mt-1">
              {activeAy?.name} • Semester {activeAy?.semester} • Syarat Mutlak Penutupan Semester (Stage 3 Option A: 100% LPPA Approval).
            </p>
          </div>

          {/* Batch Actions Flat */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {isAuthorized && readyCount > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleBatchApproveReady}
                disabled={isProcessing}
                className="rounded-xl text-xs font-bold"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Sahkan Semua yang Siap ({readyCount})</span>
              </Button>
            )}

            {isAuthorized && readyToPublishCount > 0 && (
              <Button
                variant="primary"
                size="sm"
                onClick={handleBatchPublishApproved}
                disabled={isProcessing}
                className="rounded-xl text-xs font-bold bg-brand-primary"
              >
                <Sparkles className="w-4 h-4" />
                <span>Publikasikan ({readyToPublishCount})</span>
              </Button>
            )}
          </div>
        </div>

        {/* 100% Reconciliation Progress Bar (Flat on Canvas) */}
        <div className="pt-2 space-y-2 border-b border-line pb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-ink-soft font-bold flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand-primary" />
              <span>Kesiapan Pengesahan Rapor:</span>
              <strong className="text-ink font-bold">{approvedCount} dari {totalReports} Siswa Disahkan</strong>
            </span>
            <span className={`font-mono font-bold ${isOptionAReady ? 'text-success-deep' : 'text-brand-deep'}`}>
              {approvalPercentage}%
            </span>
          </div>
          <ProgressBar
            value={approvalPercentage}
            variant={isOptionAReady ? 'success' : 'lppa'}
            trackClassName="h-2 rounded-full"
          />
          <div className="flex items-center justify-between text-xs text-ink-faint font-mono">
            <span>{readyCount} siap ditinjau • {draftCount} masih draf guru</span>
            <span className={isOptionAReady ? 'text-success-deep font-bold' : 'text-warning-deep'}>
              {isOptionAReady ? 'Syarat Tutup Semester Terpenuhi (100%)' : 'Menunggu Penuntasan Rapor'}
            </span>
          </div>
        </div>

        {/* 2. NAVIGATION PILLS FLAT & SEARCH (R-2 Kontrol Flat) */}
        <div className="flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-brand-primary text-on-brand shadow-hairline'
                  : 'bg-surface-subtle text-ink-soft hover-only:text-ink border border-line-hairline'
              }`}
            >
              Semua ({totalReports})
            </button>
            <button
              onClick={() => setStatusFilter('READY_FOR_REVIEW')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'READY_FOR_REVIEW'
                  ? 'bg-brand-primary text-on-brand shadow-hairline'
                  : 'bg-surface-subtle text-info-deep hover-only:text-ink border border-line-hairline'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Siap Ditinjau ({readyCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('APPROVED')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'APPROVED'
                  ? 'bg-brand-primary text-on-brand shadow-hairline'
                  : 'bg-surface-subtle text-success-deep hover-only:text-ink border border-line-hairline'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Disahkan ({approvedCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('DRAFT')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'DRAFT'
                  ? 'bg-brand-primary text-on-brand shadow-hairline'
                  : 'bg-surface-subtle text-warning-deep hover-only:text-ink border border-line-hairline'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Draf Guru ({draftCount})</span>
            </button>
          </div>

          <div className="relative max-w-xs">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
            <input
              type="text"
              placeholder="Cari nama atau NIS..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-surface-subtle border border-line-hairline text-ink font-medium placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-primary"
            />
          </div>
        </div>
      </header>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div className={`border-l-2 pl-3 py-2 text-xs font-bold flex items-center gap-2 ${
          feedback.type === 'success' 
            ? 'border-success-line text-success-deep' 
            : 'border-danger-line text-danger-deep'
        }`}>
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* 3. REPORTS LIST (R-3 divide-y divide-line on Canvas) */}
      <div className="divide-y divide-line border-y border-line">
        {filteredReports.map(doc => {
          const isApproved = doc.status === 'APPROVED' || doc.status === 'PUBLISHED';
          const isReady = doc.status === 'READY_FOR_REVIEW';

          return (
            <article
              key={doc.id}
              className="py-5 space-y-3"
            >
              <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-bold text-ink leading-tight">
                      {doc.student_name}
                    </h4>
                    <span className="text-xs text-ink-soft font-mono whitespace-nowrap">
                      NIS {doc.student_nis}
                    </span>
                    <span className="text-xs text-ink-faint">
                      • {doc.class_id ? 'Kelompok A' : 'TK'}
                    </span>
                  </div>
                  
                  {/* Rating Breakdown Badges */}
                  <div className="flex items-center gap-2 flex-wrap text-xs pt-0.5">
                    <span className="text-ink-soft">NABP: <strong className="text-ink font-mono">{doc.elements.NILAI_AGAMA_BUDI_PEKERTI.rating_summary}</strong></span>
                    <span className="text-ink-faint">•</span>
                    <span className="text-ink-soft">Jati Diri: <strong className="text-ink font-mono">{doc.elements.JATI_DIRI.rating_summary}</strong></span>
                    <span className="text-ink-faint">•</span>
                    <span className="text-ink-soft">STEAM: <strong className="text-ink font-mono">{doc.elements.LITERASI_STEAM.rating_summary}</strong></span>
                    <span className="text-ink-faint">•</span>
                    <span className="text-ink-soft">P5: <strong className="text-ink font-mono">{doc.elements.PROJEK_P5.rating_summary}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <span className={`px-3 py-1 text-[10px] font-bold font-mono rounded-full border whitespace-nowrap ${
                    isApproved
                      ? 'bg-success-tint text-success-deep border-success-line'
                      : isReady
                      ? 'bg-info-tint text-info-deep border-info-line'
                      : 'bg-warning-tint text-warning-deep border-warning-line'
                  }`}>
                    {isApproved ? 'Disahkan' : isReady ? 'Siap Ditinjau' : 'Draf Guru'}
                  </span>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedReport(doc)}
                    className="rounded-xl text-xs font-bold"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Tinjau</span>
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPreviewReport(doc)}
                    className="rounded-xl text-xs font-bold"
                  >
                    <Printer className="w-4 h-4" />
                    <span>PDF</span>
                  </Button>

                  {isAuthorized && !isApproved && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleApproveSingle(doc)}
                      disabled={isProcessing}
                      className="rounded-xl text-xs font-bold"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sahkan</span>
                    </Button>
                  )}

                  {isAuthorized && doc.status === 'APPROVED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handlePublishSingle(doc)}
                      disabled={isProcessing}
                      className="rounded-xl text-xs font-bold"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Publikasikan</span>
                    </Button>
                  )}
                </div>
              </div>
            </article>
          );
        })}

        {filteredReports.length === 0 && (
          <div className="py-12 text-center text-ink-faint text-xs">
            Tidak ada rapor siswa yang cocok dengan kriteria filter.
          </div>
        )}
      </div>

      {/* DEEP REVIEW & APPROVAL MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-surface rounded-2xl border border-line-hairline shadow-floating w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden text-ink">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-line bg-surface-subtle flex items-center justify-between gap-4 shrink-0">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-ink">
                    Penelaahan Rapor LPPA • {selectedReport.student_name}
                  </h3>
                  <span className="text-xs font-mono text-ink-soft">
                    NIS {selectedReport.student_nis}
                  </span>
                </div>
                <p className="text-xs text-ink-soft">
                  Status Saat Ini: <strong className="font-mono">{selectedReport.status}</strong>
                </p>
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
              
              {/* Element Navigation Tabs (Flat) */}
              <div className="grid grid-cols-2 medium:grid-cols-4 gap-2">
                {(['NILAI_AGAMA_BUDI_PEKERTI', 'JATI_DIRI', 'LITERASI_STEAM', 'PROJEK_P5'] as LppaElementKey[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setActiveElementKey(k)}
                    className={`p-3 text-left rounded-xl border text-xs font-bold transition cursor-pointer ${
                      activeElementKey === k
                        ? 'bg-brand-primary text-on-brand border-brand-primary shadow-hairline'
                        : 'bg-surface-subtle text-ink-soft border-line-hairline hover-only:text-ink'
                    }`}
                  >
                    <div className="truncate">{selectedReport.elements[k].element_title}</div>
                    <div className={`text-[10px] font-mono mt-1 ${activeElementKey === k ? 'text-on-brand/80' : 'text-brand-deep'}`}>
                      Rating: {selectedReport.elements[k].rating_summary}
                    </div>
                  </button>
                ))}
              </div>

              {/* Active Element Narrative & Citations */}
              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-ink-soft uppercase tracking-wider">
                    Narasi Reflektif Akhir Guru:
                  </h4>
                  <p className="text-xs medium:text-sm text-ink leading-relaxed font-normal p-4 rounded-xl bg-surface-subtle border border-line-hairline">
                    "{selectedReport.elements[activeElementKey].teacher_final_narrative}"
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-xs font-bold text-ink-soft uppercase tracking-wider">
                    Rekomendasi Stimulasi Lanjutan:
                  </h4>
                  <p className="text-xs medium:text-sm text-ink-soft italic p-3 rounded-xl bg-surface-subtle border border-line-hairline">
                    {selectedReport.elements[activeElementKey].growth_recommendations || 'Pendampingan stimulasi terpadu di sekolah dan rumah.'}
                  </p>
                </div>
              </div>

              {/* Homeroom Reflection */}
              <div className="border-l-2 border-brand-primary pl-3 py-1 space-y-1">
                <div className="text-xs font-bold text-ink">
                  Refleksi Guru Kelas untuk Orang Tua:
                </div>
                <p className="text-xs text-ink-soft italic">
                  "{selectedReport.homeroom_teacher_reflection}"
                </p>
              </div>

              {/* Headmaster Approval Note Input */}
              {isAuthorized && selectedReport.status !== 'APPROVED' && selectedReport.status !== 'PUBLISHED' && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-ink">
                    Catatan Pengesahan Kepala Sekolah:
                  </label>
                  <input
                    type="text"
                    value={approvalNotes}
                    onChange={e => setApprovalNotes(e.target.value)}
                    className="w-full p-3 text-xs font-medium rounded-xl bg-surface-subtle border border-line-hairline text-ink focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="px-6 py-4 border-t border-line bg-surface-subtle flex flex-col medium:flex-row items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-xl text-xs font-bold"
                >
                  Tutup
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPreviewReport(selectedReport)}
                  className="rounded-xl text-xs font-bold"
                >
                  <Printer className="w-4 h-4" />
                  <span>Pratinjau PDF</span>
                </Button>
              </div>

              {isAuthorized && selectedReport.status !== 'APPROVED' && selectedReport.status !== 'PUBLISHED' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleApproveSingle(selectedReport)}
                  disabled={isProcessing}
                  className="rounded-xl text-xs font-bold"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sahkan &amp; Beri Cap Persetujuan</span>
                </Button>
              )}

              {isAuthorized && selectedReport.status === 'APPROVED' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handlePublishSingle(selectedReport)}
                  disabled={isProcessing}
                  className="rounded-xl text-xs font-bold"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Publikasikan ke Orang Tua</span>
                </Button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Official Canonical Print Preview Modal */}
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
