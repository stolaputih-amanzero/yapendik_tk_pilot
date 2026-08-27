/**
 * Yapendik School OS — Stage 4.2 LPPA Synthesis Studio Modal
 * 
 * Epistemological Principle:
 * "LPPA Synthesis Engine generates a proposed narrative, not the truth."
 * 
 * Human-in-the-Loop Teacher Authoring Surface:
 * Evidence Citations -> Synthesis Draft -> Teacher Review/Edit -> Save Draft -> Submit for Review
 */

import React, { useState, useEffect } from 'react';
import { 
  LppaElementKey, 
  LppaReportDocument, 
  LppaElementNarrativeDraft 
} from '../../../types/lppaReportingTypes';
import { lppaReportingService } from '../../../services/lppaReportingService';
import { MilestoneRating } from '../../../domain/types';
import { LppaPrintPreviewModal } from './LppaPrintPreviewModal';
import { 
  Award, 
  Sparkles, 
  Save, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  BookOpen, 
  Heart, 
  Compass, 
  Activity, 
  X, 
  Calendar, 
  FileText, 
  Camera, 
  Layers,
  Clock,
  ShieldCheck,
  RotateCcw,
  Printer
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
  studentNis: string;
  schoolId: string;
  classId: string;
  academicYearId: string;
  academicYearName: string;
  semester: 'GANJIL' | 'GENAP';
  teacherPersonId: string;
  teacherName: string;
  onSuccessNotification?: (msg: string) => void;
}

const ELEMENT_CONFIG: Record<LppaElementKey, { title: string; icon: React.ReactNode; colorClass: string; desc: string }> = {
  NILAI_AGAMA_BUDI_PEKERTI: {
    title: 'Nilai Agama & Budi Pekerti',
    icon: <Heart className="w-4 h-4 text-rose-600" />,
    colorClass: 'bg-rose-50 border-rose-200 text-rose-900',
    desc: 'Mengenal Tuhan, doa harian, dan sikap santun terhadap sesama.'
  },
  JATI_DIRI: {
    title: 'Jati Diri & Regulasi Emosi',
    icon: <Compass className="w-4 h-4 text-amber-600" />,
    colorClass: 'bg-amber-50 border-amber-200 text-amber-900',
    desc: 'Regulasi emosi, kemandirian rutinitas, dan motorik kasar & halus.'
  },
  LITERASI_STEAM: {
    title: 'Dasar Literasi & STEAM',
    icon: <BookOpen className="w-4 h-4 text-indigo-600" />,
    colorClass: 'bg-indigo-50 border-indigo-200 text-indigo-900',
    desc: 'Konstruksi balok, nalar spasial, pra-membaca, sains, dan karya seni.'
  },
  PROJEK_P5: {
    title: 'Projek Profil Pelajar Pancasila (P5)',
    icon: <Layers className="w-4 h-4 text-purple-600" />,
    colorClass: 'bg-purple-50 border-purple-200 text-purple-900',
    desc: 'Kerja sama tim dalam projek kontekstual Aku Sayang Bumi.'
  }
};

const getRatingBadgeClass = (rating?: string) => {
  switch (rating) {
    case 'BSB': return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'BSH': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'MB': return 'bg-sky-50 text-sky-700 border-sky-200';
    case 'BB': return 'bg-amber-50 text-amber-800 border-amber-200';
    default: return 'bg-slate-100 text-slate-700 border-slate-200';
  }
};

export const LppaSynthesisStudioModal: React.FC<Props> = ({
  isOpen,
  onClose,
  studentId,
  studentName,
  studentNis,
  schoolId,
  classId,
  academicYearId,
  academicYearName,
  semester,
  teacherPersonId,
  teacherName,
  onSuccessNotification
}) => {
  const [report, setReport] = useState<LppaReportDocument | null>(null);
  const [activeElementKey, setActiveElementKey] = useState<LppaElementKey>('LITERASI_STEAM');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Form State
  const [heightInput, setHeightInput] = useState('107');
  const [weightInput, setWeightInput] = useState('18.5');
  const [headInput, setHeadInput] = useState('50.2');
  const [reflectionInput, setReflectionInput] = useState('');

  useEffect(() => {
    if (isOpen && studentId) {
      loadOrSynthesizeReport();
    }
  }, [isOpen, studentId]);

  const loadOrSynthesizeReport = async () => {
    setIsSynthesizing(true);
    setErrorMsg(null);
    try {
      const reportId = `lppa_${schoolId}_${studentId}_${semester.toLowerCase()}`;
      const existing = await lppaReportingService.getLppaReport(reportId, schoolId);

      if (existing) {
        setReport(existing);
        setHeightInput(String(existing.physical_growth.height_cm || '107'));
        setWeightInput(String(existing.physical_growth.weight_kg || '18.5'));
        setHeadInput(String(existing.physical_growth.head_circumference_cm || '50.2'));
        setReflectionInput(existing.homeroom_teacher_reflection || '');
      } else {
        const synthesized = await lppaReportingService.synthesizeLppaDraft({
          school_id: schoolId,
          class_id: classId,
          student_id: studentId,
          academic_year_id: academicYearId,
          semester,
          requested_by_person_id: teacherPersonId,
          requested_by_name: teacherName,
          role: 'TEACHER'
        });
        setReport(synthesized);
        setHeightInput(String(synthesized.physical_growth.height_cm || '107'));
        setWeightInput(String(synthesized.physical_growth.weight_kg || '18.5'));
        setHeadInput(String(synthesized.physical_growth.head_circumference_cm || '50.2'));
        setReflectionInput(synthesized.homeroom_teacher_reflection || '');
      }
    } catch (err: any) {
      console.error('Error loading LPPA report:', err);
      setErrorMsg(err?.message || 'Gagal memuat rapor LPPA.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleReSynthesize = async () => {
    if (!confirm('Hasilkan ulang proposal draf dari bukti observasi? Draf narasi yang belum tersimpan akan diperbarui.')) {
      return;
    }
    setIsSynthesizing(true);
    setErrorMsg(null);
    try {
      const synthesized = await lppaReportingService.synthesizeLppaDraft({
        school_id: schoolId,
        class_id: classId,
        student_id: studentId,
        academic_year_id: academicYearId,
        semester,
        requested_by_person_id: teacherPersonId,
        requested_by_name: teacherName,
        role: 'TEACHER'
      });
      setReport(synthesized);
      setSaveSuccessMsg('Proposal draf narasi berhasil disintesis dari bukti portofolio.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyintesis proposal draf.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  const handleNarrativeChange = (elementKey: LppaElementKey, text: string) => {
    if (!report) return;
    setReport({
      ...report,
      elements: {
        ...report.elements,
        [elementKey]: {
          ...report.elements[elementKey],
          teacher_final_narrative: text,
          is_teacher_edited: true
        }
      }
    });
  };

  const handleRatingChange = (elementKey: LppaElementKey, rating: MilestoneRating) => {
    if (!report) return;
    setReport({
      ...report,
      elements: {
        ...report.elements,
        [elementKey]: {
          ...report.elements[elementKey],
          rating_summary: rating
        }
      }
    });
  };

  const handleGrowthRecChange = (elementKey: LppaElementKey, text: string) => {
    if (!report) return;
    setReport({
      ...report,
      elements: {
        ...report.elements,
        [elementKey]: {
          ...report.elements[elementKey],
          growth_recommendations: text
        }
      }
    });
  };

  const handleSaveDraft = async () => {
    if (!report) return;
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const elementsPayload: any = {};
      (Object.entries(report.elements) as [LppaElementKey, LppaElementNarrativeDraft][]).forEach(([key, val]) => {
        elementsPayload[key] = {
          teacher_final_narrative: val.teacher_final_narrative,
          rating_summary: val.rating_summary,
          growth_recommendations: val.growth_recommendations,
          supporting_evidence_ids: val.supporting_evidence_ids,
          observed_strengths: val.observed_strengths
        };
      });

      await lppaReportingService.saveLppaReportDraft({
        report_id: report.id,
        school_id: schoolId,
        class_id: classId,
        student_id: studentId,
        academic_year_id: academicYearId,
        semester,
        elements: elementsPayload,
        p5_project_title: report.p5_project_title,
        p5_project_description: report.p5_project_description,
        physical_growth: {
          height_cm: parseFloat(heightInput) || 107,
          weight_kg: parseFloat(weightInput) || 18.5,
          head_circumference_cm: parseFloat(headInput) || 50.2,
          physical_notes: 'Tumbuh kembang optimal.',
          vision_hearing_notes: 'Penglihatan & pendengaran normal.'
        },
        homeroom_teacher_reflection: reflectionInput,
        saved_by_person_id: teacherPersonId,
        saved_by_name: teacherName,
        role: 'TEACHER'
      });

      setSaveSuccessMsg('Draf narasi reflektif LPPA berhasil disimpan!');
      if (onSuccessNotification) onSuccessNotification('Draf LPPA tersimpan.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal menyimpan draf LPPA.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    if (!report) return;
    if (!confirm('Kunci draf dan ajukan Rapor LPPA ini untuk pengesahan Kepala Sekolah?')) {
      return;
    }
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      // Save latest edits first
      await handleSaveDraft();

      await lppaReportingService.submitLppaForReview({
        report_id: report.id,
        school_id: schoolId,
        submitted_by_person_id: teacherPersonId,
        submitted_by_name: teacherName,
        role: 'TEACHER'
      });

      setReport({ ...report, status: 'READY_FOR_REVIEW' });
      setSaveSuccessMsg('Rapor LPPA berhasil diajukan ke Kepala Sekolah!');
      if (onSuccessNotification) onSuccessNotification('Rapor diajukan ke Kepala Sekolah.');
      setTimeout(() => setSaveSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Gagal mengajukan rapor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentElement = report?.elements[activeElementKey];
  const isReadOnly = report?.status === 'APPROVED' || report?.status === 'PUBLISHED';

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 shadow-2xl w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* TOP BAR: Studio Header (Clean & Compact) */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 bg-white flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3 pr-6 sm:pr-0 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              {/* Eyebrow (Clean without duplicate icon) */}
              <div className="text-purple-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-0.5">
                Sintesis & Penyusunan Rapor LPPA
              </div>
              
              {/* Title + Student Badge + NIS */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 flex-wrap leading-tight">
                <span>Rapor Perkembangan Ananda</span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {studentName}
                </span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  NIS {studentNis}
                </span>
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTEXT & STATUS RIBBON (Amanaura Standard Matching Pill Strips) */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
          {/* Badge 1: Academic & Curriculum Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>TA {academicYearName.replace(/^Tahun Ajaran\s+/i, '')}</span>
            <span className="text-slate-300">•</span>
            <span>{semester}</span>
            <span className="text-slate-300">•</span>
            <span>Kurikulum Merdeka TK</span>
          </div>

          {/* Badge 2: Document Status Pill */}
          <div className="flex items-center">
            <span className={`px-3 py-1 text-[11px] font-semibold rounded-full border inline-flex items-center gap-1.5 shadow-2xs ${
              report?.status === 'APPROVED'
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : report?.status === 'READY_FOR_REVIEW'
                ? 'bg-sky-50 text-sky-700 border-sky-200'
                : report?.status === 'PUBLISHED'
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : 'bg-amber-50 text-amber-800 border-amber-200'
            }`}>
              {report?.status === 'APPROVED' ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> <span>Disahkan KS</span>
                </>
              ) : report?.status === 'READY_FOR_REVIEW' ? (
                <>
                  <Clock className="w-3.5 h-3.5 text-sky-600" /> <span>Menunggu KS</span>
                </>
              ) : report?.status === 'PUBLISHED' ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> <span>Diterbitkan</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 text-amber-600" /> <span>Draf Guru (Proposal)</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* MOBILE SEGMENTED TABS (4 Elemen di Mobile — Anti Stack Fatigue) */}
        <div className="md:hidden flex border-b border-slate-100 bg-slate-50/70 px-3 py-2 gap-1.5 overflow-x-auto scrollbar-hide shrink-0">
          {(Object.keys(ELEMENT_CONFIG) as LppaElementKey[]).map(key => {
            const cfg = ELEMENT_CONFIG[key];
            const isActive = activeElementKey === key;
            const elem = report?.elements[key];

            return (
              <button
                key={key}
                onClick={() => setActiveElementKey(key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
                }`}
              >
                {cfg.icon}
                <span>{cfg.title.split(' ')[0]} {cfg.title.split(' ')[1] || ''}</span>
                <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full border ${getRatingBadgeClass(elem?.rating_summary)}`}>
                  {elem?.rating_summary || 'BSH'}
                </span>
              </button>
            );
          })}
        </div>

        {/* FEEDBACK BANNERS */}
        {saveSuccessMsg && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2 text-xs text-emerald-900 font-bold flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-rose-50 border-b border-rose-200 px-5 py-2 text-xs text-rose-900 font-bold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MAIN STUDIO WORKSPACE (Dual-Pane on Desktop, Tabbed on Mobile) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* DESKTOP LEFT SIDEBAR: 4 Elements Navigation & Physical Stats */}
          <div className="hidden md:flex w-80 border-r border-slate-100 bg-slate-50/50 p-4 flex-col justify-between overflow-y-auto shrink-0 space-y-4">
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 px-1">
                4 Elemen Capaian Pembelajaran
              </div>

              {(Object.keys(ELEMENT_CONFIG) as LppaElementKey[]).map(key => {
                const cfg = ELEMENT_CONFIG[key];
                const isActive = activeElementKey === key;
                const elem = report?.elements[key];
                const evidenceCount = elem?.supporting_evidence_ids.length || 0;

                return (
                  <button
                    key={key}
                    onClick={() => setActiveElementKey(key)}
                    className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'bg-white border-2 border-indigo-600 shadow-xs ring-2 ring-indigo-500/10'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {cfg.title}
                        </h4>
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${getRatingBadgeClass(elem?.rating_summary)}`}>
                          {elem?.rating_summary || 'BSH'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {evidenceCount} bukti tersemat
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Physical Growth Card */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>Pertumbuhan Fisik</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block">Tinggi (cm)</label>
                  <input
                    type="number"
                    value={heightInput}
                    disabled={isReadOnly}
                    onChange={e => setHeightInput(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block">Berat (kg)</label>
                  <input
                    type="number"
                    value={weightInput}
                    disabled={isReadOnly}
                    onChange={e => setWeightInput(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 font-semibold block">Lingkar (cm)</label>
                  <input
                    type="number"
                    value={headInput}
                    disabled={isReadOnly}
                    onChange={e => setHeadInput(e.target.value)}
                    className="w-full text-xs font-bold p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT WORKSPACE: Authoring & Evidence Studio */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {currentElement && (
              <div className="space-y-6">
                
                {/* Element Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs">
                      {ELEMENT_CONFIG[activeElementKey].icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900">
                        {ELEMENT_CONFIG[activeElementKey].title}
                      </h4>
                      <p className="text-xs text-slate-600 font-medium">
                        {ELEMENT_CONFIG[activeElementKey].desc}
                      </p>
                    </div>
                  </div>

                  {/* Rating Selector */}
                  <div className="flex items-center gap-1.5 self-start sm:self-auto">
                    <span className="text-xs font-semibold text-slate-600 mr-1">Rating:</span>
                    {(['BB', 'MB', 'BSH', 'BSB'] as MilestoneRating[]).map(r => (
                      <button
                        key={r}
                        disabled={isReadOnly}
                        onClick={() => handleRatingChange(activeElementKey, r)}
                        className={`px-3 py-1 text-xs font-bold rounded-lg border transition cursor-pointer ${
                          currentElement.rating_summary === r
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Evidence Citations Gallery */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-black text-slate-900">
                      <Camera className="w-4 h-4 text-purple-600" />
                      <span>Bukti Observasi & Karya Terkurasi ({currentElement.supporting_evidences?.length || 0})</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Sumber data empiris sintesis
                    </span>
                  </div>

                  {currentElement.supporting_evidences && currentElement.supporting_evidences.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {currentElement.supporting_evidences.map((ev, idx) => (
                        <div
                          key={ev.observation_id || idx}
                          className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-3"
                        >
                          {ev.photo_url ? (
                            <img
                              src={ev.photo_url}
                              alt="Bukti foto"
                              className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                              <Camera className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-[10px] text-slate-500">
                                {ev.observed_at ? ev.observed_at.slice(0, 10) : 'Hari Ini'}
                              </span>
                              <span className="px-1.5 py-0.5 text-[9px] font-black rounded bg-purple-100 text-purple-900">
                                {ev.milestone_rating}
                              </span>
                            </div>
                            <p className="text-slate-800 font-medium line-clamp-2 mt-1">
                              {ev.anecdote_snippet}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center text-xs text-slate-500">
                      Belum ada rekaman bukti observasi spesifik untuk elemen ini. Narasi menggunakan pengamatan umum.
                    </div>
                  )}
                </div>

                {/* Proposed Synthesis Banner */}
                <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" /> Rekomendasi Draf Narasi:
                    </span>
                    <button
                      onClick={() => handleNarrativeChange(activeElementKey, currentElement.proposed_narrative)}
                      disabled={isReadOnly}
                      className="text-[11px] font-semibold text-purple-700 hover:text-purple-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Salin Usulan ke Editor
                    </button>
                  </div>
                  <p className="text-xs text-purple-950 leading-relaxed italic bg-white p-3 rounded-xl border border-purple-100 font-medium">
                    "{currentElement.proposed_narrative}"
                  </p>
                </div>

                {/* Teacher Final Narrative Editor */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <span>Narasi Reflektif Akhir Guru (Akan Dicetak di Rapor)</span>
                    </label>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Guru adalah pengarang utama
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    disabled={isReadOnly}
                    value={currentElement.teacher_final_narrative}
                    onChange={e => handleNarrativeChange(activeElementKey, e.target.value)}
                    placeholder="Tuliskan narasi perkembangan anak..."
                    className="w-full p-3.5 text-xs font-medium rounded-2xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 leading-relaxed shadow-xs"
                  />
                </div>

                {/* Recommendations */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800">
                    Rekomendasi Stimulasi & Pendampingan Berkelanjutan
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={currentElement.growth_recommendations}
                    onChange={e => handleGrowthRecChange(activeElementKey, e.target.value)}
                    className="w-full p-2.5 text-xs font-medium rounded-xl bg-white border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {/* Homeroom Reflection Section */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <label className="text-xs font-bold text-slate-900">
                    Pesan Reflektif & Peneguhan Guru Kelas untuk Orang Tua
                  </label>
                  <textarea
                    rows={2}
                    disabled={isReadOnly}
                    value={reflectionInput}
                    onChange={e => setReflectionInput(e.target.value)}
                    placeholder="Tuliskan apresiasi dan pesan hangat bagi ananda dan keluarga..."
                    className="w-full p-3 text-xs font-medium rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR (Clean Responsive Hierarchy) */}
        <div className="px-4 sm:px-5 py-3 border-t border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 shrink-0">
          {/* Secondary Action: Re-synthesize */}
          <button
            onClick={handleReSynthesize}
            disabled={isSynthesizing || isReadOnly}
            className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>{isSynthesizing ? 'Menyintesis...' : 'Segarkan Narasi Otomatis'}</span>
          </button>

          {/* Action Button Group */}
          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowPrintPreview(true)}
              className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex justify-center items-center gap-1.5 cursor-pointer border border-slate-200"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Pratinjau PDF</span>
            </button>

            <button
              onClick={onClose}
              className="hidden sm:flex px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer justify-center items-center"
            >
              Tutup
            </button>

            {!isReadOnly && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex justify-center items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Draf'}</span>
                </button>

                <button
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting || report?.status === 'READY_FOR_REVIEW'}
                  className="col-span-2 sm:col-span-1 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex justify-center items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Mengajukan...' : 'Ajukan ke KS'}</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Official Canonical Print Preview Modal (Fase E2 & E3) */}
      {showPrintPreview && report && (
        <LppaPrintPreviewModal
          isOpen={showPrintPreview}
          onClose={() => setShowPrintPreview(false)}
          record={lppaReportingService.toCanonicalPublishedRecord(
            report,
            'TK Yapendik 01 Menteng',
            '20104821',
            'Kelompok A (Usia 4-5 Tahun)',
            teacherName,
            'Dra. Esther Nugroho, M.Pd'
          )}
        />
      )}
    </div>
  );
};
