import React, { useState, useEffect } from 'react';
import { SelectSheet } from '../ui';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { evaluateAuthorization } from '../../auth/authorization';
import { 
  DevelopmentDomain, 
  MilestoneRating, 
  ObservationRecord, 
  ClassRoom,
  StudentProgressReport
} from '../../domain/types';
import { 
  CheckCircle2, 
  FileText, 
  ShieldCheck, 
  Clock,
  Send,
  Lock,
  AlertTriangle,
  Heart,
  Activity,
  Brain,
  MessageSquare,
  Smile,
  Sparkles
} from 'lucide-react';

/**
 * Yapendik School OS — Domain 03: Student Development & LPPA (Laporan Capaian Perkembangan Anak)
 * Aligned with Amanaura Design System v4.0 (ADR-UX-010 / ADR-UX-011) & Kurikulum Merdeka TK
 * Production-Hardened: Connected to V2.1.5 RPC State Machine (Draft -> Review -> Approve -> Publish)
 */
export const DevelopmentWorkspace: React.FC = () => {
  const { securityContext } = useSecurityContext();
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('cls_tka_01');
  const [students, setStudents] = useState<any[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [observations, setObservations] = useState<ObservationRecord[]>([]);
  
  // Persisted report state
  const [currentReport, setCurrentReport] = useState<StudentProgressReport | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const loadData = () => {
    if (!securityContext) return;
    const isGuardian = securityContext.role === 'GUARDIAN';
    const clsList = db.getClasses(securityContext.activeSchoolId);
    setClasses(clsList);
    if (clsList.length > 0 && !clsList.some(c => c.id === selectedClassId)) {
      setSelectedClassId(clsList[0].id);
    }
    const studentList = db.getStudents(securityContext.activeSchoolId, selectedClassId);
    setStudents(studentList);
    if (studentList.length > 0 && (!selectedStudentId || !studentList.some(s => s.id === selectedStudentId))) {
      setSelectedStudentId(studentList[0].id);
    }
  };

  useEffect(() => {
    loadData();
    return db.subscribe(loadData);
  }, [securityContext?.activeSchoolId, selectedClassId]);

  const activeSchoolAcademicYears = securityContext?.activeSchoolId 
    ? db.getAcademicYears(securityContext.activeSchoolId) 
    : [];
  const activeAy = activeSchoolAcademicYears.find(ay => ay.isActive) || activeSchoolAcademicYears[0];
  const academicYearId = activeAy?.id || 'ay_maranatha_2026_2027_ganjil';
  const currentSemester = activeAy?.semester || 'GANJIL';

  useEffect(() => {
    if (selectedStudentId && securityContext) {
      const isGuardian = securityContext.role === 'GUARDIAN';
      const obs = db.getObservations(securityContext.activeSchoolId, selectedClassId, selectedStudentId, isGuardian);
      setObservations(obs);

      const ays = db.getAcademicYears(securityContext.activeSchoolId);
      const currAy = ays.find(a => a.isActive) || ays[0];

      // Load existing report
      const rep = db.getProgressReport(selectedStudentId, currAy?.id);
      setCurrentReport(rep || null);
    }
  }, [selectedStudentId, securityContext?.activeSchoolId, selectedClassId]);

  const selectedStudent = students.find(s => s.id === selectedStudentId);

  // Authorization checks
  const canApprove = securityContext ? evaluateAuthorization({
    context: securityContext,
    action: 'APPROVE',
    resource: 'STUDENT_DEVELOPMENT',
    resourceSchoolId: securityContext.activeSchoolId
  }).granted : false;

  const canEdit = securityContext ? evaluateAuthorization({
    context: securityContext,
    action: 'EDIT',
    resource: 'STUDENT_DEVELOPMENT',
    resourceSchoolId: securityContext.activeSchoolId
  }).granted : false;

  const domains: { key: DevelopmentDomain; title: string; subtitle: string; description: string; icon: React.ReactNode }[] = [
    { 
      key: 'NILAI_AGAMA_MORAL', 
      title: '1. Nilai Agama dan Budi Pekerti (NABP)', 
      subtitle: 'Mengenal Tuhan & Sikap Kasih',
      description: 'Mengenal Tuhan melalui ciptaan-Nya, kebiasaan berdoa harian, santun, menghargai sesama dan alam ciptaan.',
      icon: <Heart className="w-4 h-4 text-danger" />
    },
    { 
      key: 'SOSIAL_EMOSIONAL', 
      title: '2. Jati Diri & Regulasi Emosi', 
      subtitle: 'Kemandirian & Relasi Sosial',
      description: 'Mengenali emosi diri, berempati, antre berbagi giliran, interaksi hangat, dan adaptasi dalam kelompok.',
      icon: <Smile className="w-4 h-4 text-brand-primary" />
    },
    { 
      key: 'FISIK_MOTORIK', 
      title: '3. Fisik-Motorik & Kesehatan Diri', 
      subtitle: 'Kelincahan Gerak & Kebersihan',
      description: 'Keseimbangan tubuh, koordinasi mata-tangan (motorik halus), kelincahan motorik kasar, dan kemandirian kebersihan diri.',
      icon: <Activity className="w-4 h-4 text-success" />
    },
    { 
      key: 'BAHASA', 
      title: '4. Bahasa & Literasi Awal', 
      subtitle: 'Komunikasi & Minat Buku',
      description: 'Memahami instruksi bertahap, perbendaharaan kata, menyimak cerita, dan mengekspresikan ide dengan santun.',
      icon: <MessageSquare className="w-4 h-4 text-info" />
    },
    { 
      key: 'KOGNITIF', 
      title: '5. Kognitif & Nalar Pemecahan Masalah', 
      subtitle: 'Eksplorasi Sebab-Akibat & Pola',
      description: 'Eksplorasi sebab-akibat, membedakan pola/bentuk/ukuran, kemampuan logika awal, dan nalar kontekstual.',
      icon: <Brain className="w-4 h-4 text-brand-accent" />
    },
    { 
      key: 'SENI', 
      title: '6. Seni, Kreativitas & STEAM', 
      subtitle: 'Ekspresi Visual, Rancang Bangun & Musik',
      description: 'Ekspresi visual (lukis/kriya/balok), gerak berirama, apresiasi musik, imajinasi kreatif, dan eksplorasi STEAM.',
      icon: <Sparkles className="w-4 h-4 text-lppa" />
    }
  ];

  const getDomainStats = (domainKey: DevelopmentDomain) => {
    const domainObs = observations.filter(o => o.domain === domainKey);
    const count = domainObs.length;
    const bsbCount = domainObs.filter(o => o.milestoneRating === 'BSB').length;
    const bshCount = domainObs.filter(o => o.milestoneRating === 'BSH').length;
    const mbCount = domainObs.filter(o => o.milestoneRating === 'MB').length;
    const bbCount = domainObs.filter(o => o.milestoneRating === 'BB').length;

    let dominantRating: MilestoneRating = 'BSH';
    if (bsbCount >= bshCount && bsbCount > 0) dominantRating = 'BSB';
    else if (bshCount >= mbCount) dominantRating = 'BSH';
    else if (mbCount >= bbCount && mbCount > 0) dominantRating = 'MB';
    else if (bbCount > 0) dominantRating = 'BB';

    return { count, domainObs, dominantRating };
  };

  const getRatingBadgeStyle = (rating: MilestoneRating) => {
    switch (rating) {
      case 'BSB':
        return 'bg-lppa-tint text-lppa-deep border border-lppa-line';
      case 'BSH':
        return 'bg-success-tint text-success-deep border border-success-line';
      case 'MB':
        return 'bg-info-tint text-info-deep border border-info-line';
      case 'BB':
        return 'bg-warning-tint text-warning-deep border border-warning-line';
      default:
        return 'bg-surface-subtle text-ink-soft border border-line-hairline';
    }
  };

  const currentStatus = currentReport?.status || 'DRAFT';

  // --- V2.1.5 RPC Actions ---

  const handleSaveDraft = async () => {
    if (!selectedStudent || !securityContext) return;
    setIsProcessing(true);

    const ays = db.getAcademicYears(securityContext.activeSchoolId);
    const currAy = ays.find(a => a.isActive) || ays[0];
    const currAyId = currAy?.id || 'ay_maranatha_2026_2027_ganjil';
    const currSemester = currAy?.semester || 'GANJIL';

    const reportId = currentReport?.id || `rep_${securityContext.activeSchoolId}_${selectedStudentId}_${currAyId}`;
    
    const summaryNotes = domains.map(d => {
      const { dominantRating } = getDomainStats(d.key);
      return {
        domain: d.key,
        rating: dominantRating,
        narrative: `Capaian Ananda pada domain ${d.title} berkembang dengan baik.`,
        strengths: 'Menunjukkan inisiatif positif dan antusiasme belajar.',
        growthFocus: 'Stimulasi berkelanjutan dan pembiasaan positif di rumah.'
      };
    });

    const draftReport: StudentProgressReport = {
      id: reportId,
      schoolId: securityContext.activeSchoolId,
      studentId: selectedStudentId,
      academicYearId: currAyId,
      semester: currSemester,
      evaluatedByPersonId: securityContext.personId,
      evaluatedAt: new Date().toISOString(),
      summaryNotes,
      physicalHealthNotes: { heightCm: 105, weightKg: 17, visionHearingHealth: 'Sehat & Normal' },
      attendanceSummary: { hadir: 20, sakit: 1, izin: 0, alpa: 0 },
      homeroomFeedback: 'Ananda sangat aktif, kreatif, dan mandiri dalam kegiatan harian.',
      status: 'DRAFT'
    };

    const res = await db.saveProgressReportDraft(draftReport);
    setIsProcessing(false);
    if (res.success) {
      setCurrentReport(draftReport);
      setFeedbackMessage({ text: 'Draf laporan LPPA berhasil disimpan di database.', type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } else {
      setFeedbackMessage({ text: `Gagal menyimpan draf: ${res.error}`, type: 'error' });
    }
  };

  const handleSubmitForReview = async () => {
    if (!currentReport) return;
    setIsProcessing(true);
    const res = await db.submitReportForReview(currentReport.id);
    setIsProcessing(false);
    if (res.success) {
      setCurrentReport({ ...currentReport, status: 'READY_FOR_REVIEW' });
      setFeedbackMessage({ text: 'Laporan LPPA berhasil diajukan untuk peninjauan Kepala Sekolah.', type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } else {
      setFeedbackMessage({ text: `Gagal mengajukan laporan: ${res.error}`, type: 'error' });
    }
  };

  const handleApproveReport = async () => {
    if (!canApprove) {
      alert('Hanya Kepala Sekolah yang memiliki wewenang mengesahkan Laporan LPPA.');
      return;
    }
    const ays = db.getAcademicYears(securityContext?.activeSchoolId);
    const currAy = ays.find(a => a.isActive) || ays[0];
    const currAyId = currAy?.id || 'ay_maranatha_2026_2027_ganjil';
    const reportId = currentReport?.id || `rep_${securityContext?.activeSchoolId}_${selectedStudentId}_${currAyId}`;
    setIsProcessing(true);
    const res = await db.approveProgressReport(reportId, approvalNotes || 'Disahkan oleh Kepala Sekolah.');
    setIsProcessing(false);
    if (res.success) {
      setCurrentReport(prev => prev ? { ...prev, status: 'APPROVED' } : null);
      setFeedbackMessage({ text: 'Laporan LPPA berhasil disahkan oleh Kepala Sekolah.', type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } else {
      setFeedbackMessage({ text: `Gagal mengesahkan laporan: ${res.error}`, type: 'error' });
    }
  };

  const handlePublishReport = async () => {
    if (!canApprove || !currentReport) return;
    setIsProcessing(true);
    const res = await db.publishProgressReport(currentReport.id);
    setIsProcessing(false);
    if (res.success) {
      setCurrentReport({ ...currentReport, status: 'PUBLISHED' });
      setFeedbackMessage({ text: 'Laporan LPPA berhasil dipublikasikan secara resmi ke Orang Tua.', type: 'success' });
      setTimeout(() => setFeedbackMessage(null), 3000);
    } else {
      setFeedbackMessage({ text: `Gagal mempublikasikan: ${res.error}`, type: 'error' });
    }
  };

  return (
    <div className="space-y-6 pb-36 expanded:pb-12 px-4 medium:px-6 py-6">
      {/* Eyebrow & Title Banner (Flat Fluid F-6) with Global Academic Year & Semester */}
      <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 pb-3 border-b border-line-hairline">
        <div className="space-y-0.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-brand-deep">
            DOKUMEN RESMI LPPA • KURIKULUM MERDEKA TK
          </div>
          <h1 className="text-[24px] medium:text-[28px] font-bold tracking-tight text-ink">
            Laporan Pencapaian Perkembangan Anak (LPPA)
          </h1>
          <p className="text-xs medium:text-sm text-ink-soft">
            Sintesis data observasi harian menjadi draf laporan capaian komprehensif berstandar TK Kurikulum Merdeka.
          </p>
        </div>

        {/* Global Academic Year & Semester Banner */}
        <div className="flex items-center gap-2 self-start medium:self-auto bg-surface border border-line-hairline px-3 py-1.5 rounded-full text-xs font-mono text-ink-soft shrink-0">
          <span>T.A.: <b className="text-ink">{activeAy?.name ? activeAy.name.replace('Tahun Ajaran ', '') : '2026/2027'}</b></span>
          <span className="text-line-soft">•</span>
          <span>Semester: <b className="text-ink">{activeAy?.semester || 'GANJIL'}</b></span>
        </div>
      </div>

      {/* Filter & Selector Bar (Single-Depth Tint Panel F-2 & Law 4) */}
      <div className="bg-surface-subtle/70 border border-line-hairline rounded-2xl p-4 medium:p-5 flex flex-col medium:flex-row medium:items-center justify-between gap-4">
        <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-3 w-full medium:w-auto">
          {/* Class Toggle Segmented Buttons (2 Classes) */}
          <div className="flex items-center gap-1.5 p-1 bg-surface rounded-xl border border-line-hairline">
            {classes.map(cls => (
              <button
                key={cls.id}
                type="button"
                onClick={() => setSelectedClassId(cls.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all min-h-[40px] flex items-center justify-center cursor-pointer ${
                  selectedClassId === cls.id
                    ? 'bg-brand text-on-brand shadow-xs'
                    : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle'
                }`}
              >
                {cls.name}
              </button>
            ))}
          </div>

          {/* Student Selector Dropdown (Name Only) */}
          <div className="w-full medium:w-72 flex justify-between items-center bg-surface border border-line-hairline rounded-xl px-3 py-2 text-xs min-h-[44px]">
            <span className="text-ink-soft font-medium mr-2">Siswa:</span>
            <SelectSheet
              value={selectedStudentId}
              onChange={setSelectedStudentId}
              options={students.map(s => ({ value: s.id, label: s.person?.fullName || 'Siswa' }))}
            />
          </div>
        </div>

        {/* Realtime Status Indicator */}
        <div className="text-xs text-ink-soft font-mono flex items-center gap-2 shrink-0">
          <span>Total Observasi: <b className="text-ink">{observations.length}</b></span>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-4 rounded-xl text-xs font-semibold border ${
          feedbackMessage.type === 'success' 
            ? 'bg-success-tint text-success-deep border-success-line' 
            : 'bg-danger-tint text-danger-deep border-danger-line'
        }`}>
          {feedbackMessage.text}
        </div>
      )}

      {selectedStudent && (
        <div className="space-y-6">
          {/* Identity & Status Ribbon (Single-Depth Tone Panel F-2) */}
          <div className="bg-surface border border-line-hairline rounded-2xl p-5 space-y-4">
            <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-[11px] font-mono uppercase tracking-wider text-brand-deep font-semibold">
                  Peserta Didik Terpilih
                </div>
                <h2 className="text-xl medium:text-2xl font-bold text-ink">
                  {selectedStudent.person.fullName}
                </h2>
                <div className="text-xs text-ink-soft font-mono flex flex-wrap gap-x-4 gap-y-1 pt-1">
                  <span>NISN: <b className="text-ink">{selectedStudent.nisn || '-'}</b></span>
                  <span>NIS: <b className="text-ink">{selectedStudent.nis}</b></span>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 flex items-center">
                {currentStatus === 'PUBLISHED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-lppa-tint border border-lppa-line text-lppa-deep text-xs font-semibold">
                    <Lock className="w-4 h-4" />
                    <span>Resmi Dipublikasikan (Terkunci)</span>
                  </span>
                )}

                {currentStatus === 'APPROVED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-tint border border-success-line text-success-deep text-xs font-semibold">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Disahkan Kepala Sekolah</span>
                  </span>
                )}

                {currentStatus === 'READY_FOR_REVIEW' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-tint border border-warning-line text-warning-deep text-xs font-semibold">
                    <Clock className="w-4 h-4" />
                    <span>Draf Menunggu Pengesahan</span>
                  </span>
                )}

                {currentStatus === 'DRAFT' && (
                  currentReport ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-tint border border-success-line text-success-deep text-xs font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-success-deep" />
                      <span>Draf Tersimpan</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-subtle border border-line-hairline text-ink-soft text-xs font-semibold">
                      <FileText className="w-4 h-4 text-ink-faint" />
                      <span>Draf Awal Guru</span>
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Workflow Action Buttons (Law 3 CTA Dominance & Ergonomics Floor 48dp) */}
            <div className="pt-2 border-t border-line-hairline flex flex-col medium:flex-row items-stretch medium:items-center justify-end gap-3">
              {canEdit && currentStatus === 'DRAFT' && (
                <>
                  <button
                    onClick={handleSaveDraft}
                    disabled={isProcessing}
                    className="w-full medium:w-auto min-h-[48px] px-4 py-3 rounded-xl bg-surface border border-line-hairline hover-only:bg-surface-subtle text-ink text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                  >
                    <FileText className="w-4 h-4 text-ink-soft" />
                    <span>Simpan Draf LPPA</span>
                  </button>
                  <button
                    onClick={handleSubmitForReview}
                    disabled={isProcessing}
                    className="w-full medium:w-auto min-h-[48px] px-5 py-3 rounded-xl bg-warning text-on-brand text-xs font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                  >
                    <Send className="w-4 h-4" />
                    <span>Ajukan ke Kepala Sekolah</span>
                  </button>
                </>
              )}

              {canApprove && currentStatus === 'READY_FOR_REVIEW' && (
                <button
                  onClick={handleApproveReport}
                  disabled={isProcessing}
                  className="w-full medium:w-auto min-h-[48px] px-5 py-3 rounded-xl bg-success text-on-brand text-xs font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Sahkan Laporan LPPA</span>
                </button>
              )}

              {canApprove && currentStatus === 'APPROVED' && (
                <button
                  onClick={handlePublishReport}
                  disabled={isProcessing}
                  className="w-full medium:w-auto min-h-[48px] px-5 py-3 rounded-xl bg-lppa text-on-brand text-xs font-bold flex items-center justify-center gap-2 transition-colors active:scale-[0.99]"
                >
                  <Lock className="w-4 h-4" />
                  <span>Publikasikan ke Wali Murid</span>
                </button>
              )}
            </div>
          </div>

          {/* Child Medical & Health Notes (Safety Salience F-3) */}
          <div className="bg-surface-subtle/70 border border-line-hairline rounded-2xl p-4 medium:p-5 grid grid-cols-1 medium:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="font-semibold text-ink flex items-center gap-1.5">
                {selectedStudent.allergies ? <AlertTriangle className="w-4 h-4 text-warning" /> : null}
                Catatan Alergi & Medis:
              </span>
              <p className={selectedStudent.allergies ? 'text-warning-deep font-medium' : 'text-ink-soft'}>
                {selectedStudent.allergies || 'Tidak ada catatan alergi khusus.'}
              </p>
            </div>
            <div className="space-y-1">
              <span className="font-semibold text-ink block">Karakteristik & Dukungan Belajar:</span>
              <p className="text-ink-soft">
                {selectedStudent.specialNeedsNotes || 'Menunjukkan kemandirian belajar yang stabil.'}
              </p>
            </div>
          </div>

          {/* 6 Kurikulum Merdeka TK Developmental Domains (Flat Fluid F-3 divide-y) */}
          <div className="bg-surface border border-line-hairline rounded-2xl p-4 medium:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-line-hairline">
              <h3 className="text-xs font-bold text-ink uppercase tracking-wider">
                Sintesis 6 Domain Pencapaian Perkembangan Anak
              </h3>
              <span className="text-xs text-ink-faint font-mono">Kurikulum Merdeka TK</span>
            </div>

            <div className="divide-y divide-line-hairline">
              {domains.map(dom => {
                const { count, domainObs, dominantRating } = getDomainStats(dom.key);
                return (
                  <div key={dom.key} className="py-5 first:pt-2 last:pb-2 space-y-3">
                    <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          {dom.icon}
                          <h4 className="font-bold text-ink text-sm">{dom.title}</h4>
                        </div>
                        <p className="text-xs text-ink-soft pl-6">{dom.description}</p>
                      </div>

                      <div className="flex items-center gap-2 pl-6 medium:pl-0 shrink-0">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${getRatingBadgeStyle(dominantRating)}`}>
                          Capaian: {dominantRating}
                        </span>
                        <span className="text-[11px] text-ink-faint font-mono">
                          {count} Catatan Bukti
                        </span>
                      </div>
                    </div>

                    {domainObs.length > 0 ? (
                      <div className="ml-6 pl-3 border-l-2 border-line-hairline space-y-2 text-xs">
                        <span className="font-semibold text-ink text-[11px] block text-ink-soft">
                          Bukti Observasi Terpilih:
                        </span>
                        {domainObs.map(obs => (
                          <div key={obs.id} className="text-ink-soft leading-relaxed">
                            <span className="font-medium text-ink">
                              [{obs.milestoneRating}] {new Date(obs.observedAt).toLocaleDateString('id-ID')}:
                            </span>{' '}
                            "{obs.anecdoteDescription}"
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-ink-faint italic ml-6">
                        Belum ada catatan observasi spesifik pada domain ini untuk siswa terpilih.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Teacher Homeroom Reflection (Kamus Pendidik & Tone Band F-2) */}
          <div className="p-5 rounded-2xl bg-warning-tint/40 border border-warning-line/60 space-y-2">
            <span className="font-bold text-warning-deep text-xs uppercase tracking-wider block">
              Catatan Wali Kelas & Rekomendasi Stimulasi di Rumah:
            </span>
            <p className="text-xs text-ink leading-relaxed font-sans">
              {currentReport?.homeroomFeedback || `Ananda ${selectedStudent.person.fullName} menunjukkan perkembangan sosial-emosional dan kognitif yang sangat pesat. Mampu mengekspresikan ide dengan santun dan menunjukkan empati tinggi saat kegiatan bersama teman. Disarankan orang tua di rumah terus membiasakan bercerita sebelum tidur serta memberikan stimulasi kegiatan motorik halus seperti menyusun origami dan puzzle.`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
