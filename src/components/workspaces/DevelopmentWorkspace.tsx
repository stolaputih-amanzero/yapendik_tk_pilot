/**
 * Yapendik School OS — Domain 03: Student Development & LPPA (Laporan Capaian Perkembangan Anak)
 * Production-Hardened: Connected to V2.1.5 RPC State Machine (Draft -> Review -> Approve -> Publish)
 */

import React, { useState, useEffect } from 'react';
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
  Award, 
  CheckCircle2, 
  FileText, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  Printer, 
  AlertCircle,
  Clock,
  Send,
  Lock
} from 'lucide-react';

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

  useEffect(() => {
    if (selectedStudentId && securityContext) {
      const isGuardian = securityContext.role === 'GUARDIAN';
      const obs = db.getObservations(securityContext.activeSchoolId, selectedClassId, selectedStudentId, isGuardian);
      setObservations(obs);

      // Load existing report
      const rep = db.getProgressReport(selectedStudentId);
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

  const domains: { key: DevelopmentDomain; title: string; description: string }[] = [
    { 
      key: 'NILAI_AGAMA_MORAL', 
      title: '1. Nilai Agama dan Moral', 
      description: 'Mengenal Tuhan, kebiasaan berdoa, sopan santun, menghargai sesama dan alam ciptaan.' 
    },
    { 
      key: 'FISIK_MOTORIK', 
      title: '2. Fisik-Motorik (Kasar & Halus)', 
      description: 'Keseimbangan tubuh, koordinasi mata-tangan, kelincahan gerak, dan kemandirian kebersihan diri.' 
    },
    { 
      key: 'KOGNITIF', 
      title: '3. Kognitif & Pemecahan Masalah', 
      description: 'Eksplorasi sebab-akibat, membedakan pola/bentuk/ukuran, kemampuan logika awal.' 
    },
    { 
      key: 'BAHASA', 
      title: '4. Bahasa & Literasi Awal', 
      description: 'Memahami instruksi bertahap, perbendaharaan kata, menyimak cerita, dan mengekspresikan ide.' 
    },
    { 
      key: 'SOSIAL_EMOSIONAL', 
      title: '5. Sosial-Emosional & Kemandirian', 
      description: 'Mengenali emosi diri, berempati, antre berbagi giliran, dan adaptasi dalam kelompok.' 
    },
    { 
      key: 'SENI', 
      title: '6. Seni & Kreativitas', 
      description: 'Ekspresi visual (lukis/kriya), gerak berirama, apresiasi musik dan imajinasi anak.' 
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

  const currentStatus = currentReport?.status || 'DRAFT';

  // --- V2.1.5 RPC Actions ---

  const handleSaveDraft = async () => {
    if (!selectedStudent || !securityContext) return;
    setIsProcessing(true);

    const reportId = currentReport?.id || `rep_${securityContext.activeSchoolId}_${selectedStudentId}_2026_ganjil`;
    
    const summaryNotes = domains.map(d => {
      const { dominantRating } = getDomainStats(d.key);
      return {
        domain: d.key,
        rating: dominantRating,
        narrative: `Capaian Ananda pada domain ${d.title} berkembang dengan baik.`,
        strengths: 'Menunjukkan inisiatif positif.',
        growthFocus: 'Stimulasi berkelanjutan di rumah.'
      };
    });

    const draftReport: StudentProgressReport = {
      id: reportId,
      schoolId: securityContext.activeSchoolId,
      studentId: selectedStudentId,
      academicYearId: 'ay_2026_2027_ganjil',
      semester: 'GANJIL',
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
    const reportId = currentReport?.id || `rep_${securityContext?.activeSchoolId}_${selectedStudentId}_2026_ganjil`;
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
    <div className="px-4 md:px-6 py-6 space-y-6">
      {/* Control Bar */}
      <div className="bg-white border-y md:border border-slate-200 md:rounded-lg p-4 md:shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 -mx-4 md:mx-0">
        <div>
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            Laporan Capaian Perkembangan Siswa (LPPA)
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Sintesis data observasi harian menjadi rapor capaian komprehensif berstandar TK Kurikulum Merdeka.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full md:w-auto">
          <div className="w-full flex justify-between items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">Kelas:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 outline-none"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="w-full flex justify-between items-center space-x-2 bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 text-xs">
            <span className="text-slate-500 font-medium">Siswa:</span>
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="bg-transparent font-bold text-slate-900 outline-none"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.person?.fullName || 'Siswa'} ({s.nis || s.id})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {feedbackMessage && (
        <div className={`p-3 rounded-lg text-xs font-semibold border ${
          feedbackMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {feedbackMessage.text}
        </div>
      )}

      {selectedStudent && (
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
          {/* Document Header */}
          <div className="bg-slate-900 text-white p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono text-amber-400 uppercase tracking-widest mb-1">
                  YAPENDIK SCHOOL OS — DOKUMEN RESMI LPPA
                </div>
                <h2 className="text-2xl font-bold">{selectedStudent.person.fullName}</h2>
                <div className="text-xs text-slate-300 mt-1 flex flex-wrap gap-x-4 gap-y-1">
                  <span>NISN: <b className="text-white">{selectedStudent.nisn || '-'}</b></span>
                  <span>NIS: <b className="text-white">{selectedStudent.nis}</b></span>
                  <span>Gol. Darah: <b className="text-white">{selectedStudent.bloodType || '-'}</b></span>
                  <span>Tahun Ajaran: <b className="text-white">2026/2027 (Ganjil)</b></span>
                </div>
              </div>

              {/* Status Badge & Actions (V2.1.5 RPC State Machine) */}
              <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-2 w-full md:w-auto mt-4 md:mt-0">
                {currentStatus === 'PUBLISHED' && (
                  <div className="w-full md:w-auto justify-center flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-purple-900/80 border border-purple-400 text-purple-200 text-xs font-semibold">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Resmi Dipublikasikan (Terkunci)</span>
                  </div>
                )}

                {currentStatus === 'APPROVED' && (
                  <div className="w-full md:w-auto justify-center flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-emerald-900/80 border border-emerald-500 text-emerald-300 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Disahkan Kepala Sekolah</span>
                  </div>
                )}

                {currentStatus === 'READY_FOR_REVIEW' && (
                  <div className="w-full md:w-auto justify-center flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-amber-900/80 border border-amber-500 text-amber-300 text-xs font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Draf Menunggu Pengesahan</span>
                  </div>
                )}

                {currentStatus === 'DRAFT' && (
                  <div className="w-full md:w-auto justify-center flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-600 text-slate-300 text-xs font-semibold">
                    <FileText className="w-3.5 h-3.5" />
                    <span>Draf Awal Guru</span>
                  </div>
                )}

                {/* Workflow Buttons */}
                {canEdit && currentStatus === 'DRAFT' && (
                  <>
                    <button
                      onClick={handleSaveDraft}
                      disabled={isProcessing}
                      className="w-full md:w-auto mt-2 md:mt-0 flex justify-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-3 py-2 rounded transition-colors shadow-sm"
                    >
                      Simpan Draf LPPA
                    </button>
                    <button
                      onClick={handleSubmitForReview}
                      disabled={isProcessing}
                      className="w-full md:w-auto mt-2 md:mt-0 flex justify-center bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded transition-colors items-center space-x-1.5 shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Ajukan ke Kepala Sekolah</span>
                    </button>
                  </>
                )}

                {canApprove && currentStatus === 'READY_FOR_REVIEW' && (
                  <button
                    onClick={handleApproveReport}
                    disabled={isProcessing}
                    className="w-full md:w-auto mt-2 md:mt-0 flex justify-center bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded transition-colors items-center space-x-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sahkan Laporan LPPA</span>
                  </button>
                )}

                {canApprove && currentStatus === 'APPROVED' && (
                  <button
                    onClick={handlePublishReport}
                    disabled={isProcessing}
                    className="w-full md:w-auto mt-2 md:mt-0 flex justify-center bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2 rounded transition-colors items-center space-x-1.5 shadow-sm"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Publikasikan ke Wali Murid</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Child Medical & Psychological Notes */}
          <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-semibold text-slate-900 block mb-0.5">Catatan Alergi & Medis:</span>
              <p className="text-slate-600">{selectedStudent.allergies || 'Tidak ada catatan alergi khusus.'}</p>
            </div>
            <div>
              <span className="font-semibold text-slate-900 block mb-0.5">Karakteristik & Dukungan Belajar:</span>
              <p className="text-slate-600">{selectedStudent.specialNeedsNotes || 'Menunjukkan kemandirian belajar yang stabil.'}</p>
            </div>
          </div>

          {/* Domain Review Grid */}
          <div className="p-4 md:p-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide border-b border-slate-200 pb-2">
              Sintesis Capaian 6 Domain Perkembangan Anak
            </h3>

            <div className="flex flex-col divide-y divide-slate-100 md:divide-none md:space-y-4 -mx-4 md:mx-0">
              {domains.map(dom => {
                const { count, domainObs, dominantRating } = getDomainStats(dom.key);
                return (
                  <div key={dom.key} className="bg-white px-4 py-5 md:p-4 md:border md:border-slate-200 md:rounded-lg">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{dom.title}</h4>
                        <p className="text-xs text-slate-500">{dom.description}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded bg-slate-900 text-white">
                          Capaian: {dominantRating}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-1">
                          {count} Catatan Bukti
                        </div>
                      </div>
                    </div>

                    {domainObs.length > 0 ? (
                      <div className="mt-3 bg-slate-50 rounded-md p-3 border border-slate-100 space-y-2 text-xs">
                        <span className="font-semibold text-slate-800 text-[11px] block">
                          Bukti Peristiwa Terpilih:
                        </span>
                        {domainObs.map(obs => (
                          <div key={obs.id} className="pl-2 border-l-2 border-slate-300 text-slate-700">
                            <span className="font-medium text-slate-900">
                              [{obs.milestoneRating}] {new Date(obs.observedAt).toLocaleDateString('id-ID')}:
                            </span>{' '}
                            "{obs.anecdoteDescription}"
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic mt-2">
                        Belum ada catatan observasi spesifik pada domain ini untuk siswa terpilih.
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Teacher Homeroom Narrative */}
            <div className="mt-6 p-4 rounded-lg bg-amber-50/50 border border-amber-200">
              <span className="font-bold text-slate-900 text-xs uppercase tracking-wide block mb-1">
                Catatan Wali Kelas & Rekomendasi Stimulasi di Rumah:
              </span>
              <p className="text-xs text-slate-800 leading-relaxed">
                {currentReport?.homeroomFeedback || `Ananda ${selectedStudent.person.fullName} menunjukkan perkembangan sosial-emosional dan kognitif yang sangat pesat. Mampu mengekspresikan ide dengan santun dan menunjukkan empati tinggi saat kegiatan bersama teman. Disarankan orang tua di rumah terus membiasakan bercerita sebelum tidur serta memberikan stimulasi kegiatan motorik halus seperti menyusun origami dan puzzle.`}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
