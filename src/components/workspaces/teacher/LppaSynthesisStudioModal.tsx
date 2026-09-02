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
import { db } from '../../../db/database';
import { MilestoneRating } from '../../../domain/types';
import { PedagogicalRatingPill } from '../../ui/PedagogicalRatingPill';
import { validateNarrative, generateAppreciativeNarrative } from '../../../services/lppaNarrativeEngine';
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
    icon: <Heart className="w-4 h-4 text-danger" />,
    colorClass: 'bg-danger-tint border-danger-line text-danger-deep',
    desc: 'Mengenal Tuhan, doa harian, dan sikap santun terhadap sesama.'
  },
  JATI_DIRI: {
    title: 'Jati Diri & Regulasi Emosi',
    icon: <Compass className="w-4 h-4 text-brand-primary" />,
    colorClass: 'bg-warning-tint border-warning-line text-warning-deep',
    desc: 'Regulasi emosi, kemandirian rutinitas, dan motorik kasar & halus.'
  },
  LITERASI_STEAM: {
    title: 'Dasar Literasi & STEAM',
    icon: <BookOpen className="w-4 h-4 text-lppa" />,
    colorClass: 'bg-lppa-tint border-lppa-line text-lppa-deep',
    desc: 'Konstruksi balok, nalar spasial, pra-membaca, sains, dan karya seni.'
  },
  PROJEK_P5: {
    title: 'Projek Profil Pelajar Pancasila (P5)',
    icon: <Layers className="w-4 h-4 text-lppa" />,
    colorClass: 'bg-lppa-tint border-lppa-line text-lppa-deep',
    desc: 'Kerja sama tim dalam projek kontekstual Aku Sayang Bumi.'
  }
};

const getRatingBadgeClass = (rating?: string) => {
  switch (rating) {
    case 'BSB': return 'bg-lppa-tint text-lppa-deep border-lppa-line';
    case 'BSH': return 'bg-success-tint text-success-deep border-success-line';
    case 'MB': return 'bg-info-tint text-info-deep border-info-line';
    case 'BB': return 'bg-warning-tint text-warning-deep border-warning-line';
    default: return 'bg-surface-subtle text-ink-soft border-line';
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

        // Check Auto-Draft Shield (localStorage) per Amanaura Part V §5.2
        try {
          const draftKey = `lppa_draft_${studentId}_${semester}`;
          const cachedDraft = localStorage.getItem(draftKey);
          if (cachedDraft) {
            const parsed = JSON.parse(cachedDraft);
            if (parsed.elements) {
              synthesized.elements = { ...synthesized.elements, ...parsed.elements };
            }
            if (parsed.reflection) synthesized.homeroom_teacher_reflection = parsed.reflection;
          }
        } catch {}

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

  // Auto-Draft Shield (localStorage) per Amanaura Part V §5.2
  useEffect(() => {
    if (report && report.status === 'DRAFT' && studentId) {
      try {
        const draftKey = `lppa_draft_${studentId}_${semester}`;
        localStorage.setItem(draftKey, JSON.stringify({
          elements: report.elements,
          reflection: reflectionInput,
          height: heightInput,
          weight: weightInput,
          head: headInput,
          savedAt: new Date().toISOString()
        }));
      } catch {}
    }
  }, [report, reflectionInput, heightInput, weightInput, headInput, studentId, semester]);

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
    <div className="fixed inset-0 z-70 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface rounded-t-3xl medium:rounded-card border-t medium:border border-line shadow-floating w-full max-w-5xl h-[90vh] medium:h-[85vh] flex flex-col overflow-hidden text-ink">
        
        {/* TOP BAR: Studio Header (Clean & Compact) */}
        <div className="px-4 medium:px-5 py-3 medium:py-3 border-b border-line-soft bg-surface flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3 pr-6 medium:pr-0 min-w-0">
            <div className="w-10 h-10 rounded-card bg-lppa-tint border border-lppa-line text-lppa-deep flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              {/* Eyebrow (Clean without duplicate icon) */}
              <div className="text-lppa text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-0.5">
                Sintesis & Penyusunan Rapor LPPA
              </div>
              
              {/* Title + Student Badge + NIS */}
              <h3 className="text-sm medium:text-base font-bold text-ink flex items-center gap-2 flex-wrap leading-tight">
                <span>Rapor Perkembangan Ananda</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line">
                  {studentName}
                </span>
                <span className="text-xs font-mono font-medium px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line whitespace-nowrap">
                  NIS {studentNis}
                </span>
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 medium:p-2 rounded-field text-ink-faint hover-only:text-ink-soft hover-only:bg-surface-subtle transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTEXT & STATUS RIBBON (Amanaura Standard Matching Pill Strips) */}
        <div className="px-4 medium:px-5 py-2 border-b border-line-soft bg-surface-subtle/60 flex flex-col medium:flex-row items-start medium:items-center justify-between gap-2 shrink-0">
          {/* Badge 1: Academic & Curriculum Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line text-[11px] font-medium text-ink-soft shadow-hairline">
            <Calendar className="w-4 h-4 text-ink-faint shrink-0" />
            <span>TA {academicYearName.replace(/^Tahun Ajaran\s+/i, '')}</span>
            <span className="text-ink-faint">•</span>
            <span>{semester}</span>
            <span className="text-ink-faint">•</span>
            <span>Kurikulum Merdeka TK</span>
          </div>

          {/* Badge 2: Document Status Pill */}
          <div className="flex items-center">
            <span className={`px-3 py-1 text-[11px] font-semibold rounded-full border inline-flex items-center gap-2 shadow-hairline ${
              report?.status === 'APPROVED'
                ? 'bg-success-tint text-success-deep border-success-line'
                : report?.status === 'READY_FOR_REVIEW'
                ? 'bg-info-tint text-info-deep border-info-line'
                : report?.status === 'PUBLISHED'
                ? 'bg-lppa-tint text-lppa-deep border-lppa-line'
                : 'bg-warning-tint text-warning-deep border-warning-line'
            }`}>
              {report?.status === 'APPROVED' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-success" /> <span>Disahkan KS</span>
                </>
              ) : report?.status === 'READY_FOR_REVIEW' ? (
                <>
                  <Clock className="w-4 h-4 text-info" /> <span>Menunggu KS</span>
                </>
              ) : report?.status === 'PUBLISHED' ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-lppa" /> <span>Diterbitkan</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-brand-primary" /> <span>Draf Guru (Proposal)</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* MOBILE SEGMENTED TABS (4 Elemen di Mobile — Anti Stack Fatigue) */}
        <div className="expanded:hidden flex border-b border-line-soft bg-surface-subtle/70 px-3 py-2 gap-2 overflow-x-auto scrollbar-hide shrink-0 min-w-0">
          {(Object.keys(ELEMENT_CONFIG) as LppaElementKey[]).map(key => {
            const cfg = ELEMENT_CONFIG[key];
            const isActive = activeElementKey === key;
            const elem = report?.elements[key];

            return (
              <button
                key={key}
                onClick={() => setActiveElementKey(key)}
                className={`px-3 py-1 rounded-field text-xs font-bold transition flex items-center gap-2 whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-surface text-ink shadow-hairline border border-line'
                    : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/60'
                }`}
              >
                {cfg.icon}
                <span>{cfg.title.split(' ')[0]} {cfg.title.split(' ')[1] || ''}</span>
                <span className={`px-1 py-0 text-[9px] font-bold rounded-full border ${getRatingBadgeClass(elem?.rating_summary)}`}>
                  {elem?.rating_summary || 'BSH'}
                </span>
              </button>
            );
          })}
        </div>

        {/* FEEDBACK BANNERS */}
        {saveSuccessMsg && (
          <div className="bg-success-tint border-b border-success-line px-5 py-2 text-xs text-success-deep font-bold flex items-center gap-2 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <span>{saveSuccessMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="bg-danger-tint border-b border-danger-line px-5 py-2 text-xs text-danger-deep font-bold flex items-center gap-2 shrink-0">
            <AlertCircle className="w-4 h-4 text-danger shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MAIN STUDIO WORKSPACE (Dual-Pane on Desktop, Tabbed on Mobile) */}
        <div className="flex-1 flex flex-col medium:flex-row overflow-hidden">
          
          {/* DESKTOP LEFT SIDEBAR: 4 Elements Navigation & Physical Stats */}
          <div className="hidden expanded:flex w-80 border-r border-line-soft bg-surface-subtle/50 p-4 flex-col justify-between overflow-y-auto shrink-0 space-y-4">
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-ink-soft px-1">
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
                    className={`w-full text-left p-3 rounded-card border transition-all cursor-pointer flex items-start gap-3 ${
                      isActive
                        ? 'bg-surface border-2 border-lppa-line shadow-hairline ring-2 ring-lppa/10'
                        : 'bg-surface border-line hover-only:border-line hover-only:bg-surface-subtle'
                    }`}
                  >
                    <div className="p-2 rounded-field bg-surface-subtle border border-line-soft shrink-0 mt-0.5">
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h4 className="text-xs font-bold text-ink truncate">
                          {cfg.title}
                        </h4>
                        <span className={`px-2 py-1 text-[10px] font-bold rounded-full border ${getRatingBadgeClass(elem?.rating_summary)}`}>
                          {elem?.rating_summary || 'BSH'}
                        </span>
                      </div>
                      <p className="text-[11px] text-ink-soft truncate mt-0.5">
                        {evidenceCount} bukti tersemat
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Physical Growth Card */}
            <div className="bg-surface p-4 rounded-card border border-line shadow-hairline space-y-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-ink">
                <Activity className="w-4 h-4 text-success" />
                <span>Pertumbuhan Fisik</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] text-ink-soft font-semibold block">Tinggi (cm)</label>
                  <input
                    type="number"
                    value={heightInput}
                    disabled={isReadOnly}
                    onChange={e => setHeightInput(e.target.value)}
                    className="w-full text-xs font-bold p-2 rounded-lg bg-surface-subtle border border-line text-ink focus:bg-surface focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ink-soft font-semibold block">Berat (kg)</label>
                  <input
                    type="number"
                    value={weightInput}
                    disabled={isReadOnly}
                    onChange={e => setWeightInput(e.target.value)}
                    className="w-full text-xs font-bold p-2 rounded-lg bg-surface-subtle border border-line text-ink focus:bg-surface focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-ink-soft font-semibold block">Lingkar (cm)</label>
                  <input
                    type="number"
                    value={headInput}
                    disabled={isReadOnly}
                    onChange={e => setHeadInput(e.target.value)}
                    className="w-full text-xs font-bold p-2 rounded-lg bg-surface-subtle border border-line text-ink focus:bg-surface focus:ring-1 focus:ring-brand-primary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT WORKSPACE: Authoring & Evidence Studio */}
          <div className="flex-1 p-4 medium:p-6 overflow-y-auto space-y-6">
            {currentElement && (
              <div className="space-y-6">
                
                {/* Element Header */}
                <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 bg-surface-subtle p-4 rounded-card border border-line">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-field bg-surface border border-line shadow-hairline">
                      {ELEMENT_CONFIG[activeElementKey].icon}
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-ink">
                        {ELEMENT_CONFIG[activeElementKey].title}
                      </h4>
                      <p className="text-xs text-ink-soft font-medium">
                        {ELEMENT_CONFIG[activeElementKey].desc}
                      </p>
                    </div>
                  </div>

                  {/* Rating Selector using PedagogicalRatingPill */}
                  <div className="flex items-center gap-2 self-start medium:self-auto">
                    <span className="text-xs font-semibold text-ink-soft mr-1">Rating:</span>
                    <PedagogicalRatingPill
                      value={currentElement.rating_summary}
                      onChange={(r) => handleRatingChange(activeElementKey, r)}
                      isReadOnly={isReadOnly}
                      showLabel={false}
                    />
                  </div>
                </div>

                {/* Evidence Citations Gallery */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-black text-ink">
                      <Camera className="w-4 h-4 text-lppa" />
                      <span>Bukti Observasi & Karya Terkurasi ({currentElement.supporting_evidences?.length || 0})</span>
                    </div>
                    <span className="text-[11px] text-ink-soft font-medium">
                      Sumber data empiris sintesis
                    </span>
                  </div>

                  {currentElement.supporting_evidences && currentElement.supporting_evidences.length > 0 ? (
                    <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
                      {currentElement.supporting_evidences.map((ev, idx) => (
                        <div
                          key={ev.observation_id || idx}
                          className="bg-surface p-3 rounded-card border border-line shadow-hairline flex items-start gap-3"
                        >
                          {ev.photo_url ? (
                            <div className="relative shrink-0 overflow-hidden rounded-field border border-line">
                              <img
                                src={ev.photo_url}
                                alt="Bukti foto"
                                className="w-16 h-16 object-cover"
                              />
                              <div className="absolute inset-x-0 bottom-0 bg-ink/80 text-on-brand text-[7px] font-mono text-center py-0.5 truncate px-0.5">
                                PORTOFOLIO KARYA
                              </div>
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-field bg-lppa-tint border border-lppa-line flex items-center justify-center text-lppa-deep shrink-0">
                              <Camera className="w-6 h-6" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-mono font-bold text-[10px] text-ink-soft whitespace-nowrap">
                                {ev.observed_at ? ev.observed_at.slice(0, 10) : 'Hari Ini'}
                              </span>
                              <span className="px-1 py-1 text-[9px] font-black rounded bg-lppa-tint text-lppa-deep">
                                {ev.milestone_rating}
                              </span>
                            </div>
                            <p className="text-ink font-medium line-clamp-2 mt-1">
                              {ev.anecdote_snippet}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 rounded-card bg-surface-subtle border border-dashed border-line text-center text-xs text-ink-soft">
                      Belum ada rekaman bukti observasi spesifik untuk elemen ini. Narasi menggunakan pengamatan umum.
                    </div>
                  )}
                </div>

                {/* Proposed Synthesis Banner */}
                <div className="p-4 rounded-card bg-lppa-tint/60 border border-lppa-line space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-lppa-deep flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-lppa" /> Rekomendasi Draf Narasi:
                    </span>
                    <button
                      onClick={() => handleNarrativeChange(activeElementKey, currentElement.proposed_narrative)}
                      disabled={isReadOnly}
                      className="text-[11px] font-semibold text-lppa-deep hover-only:text-lppa-deep underline flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" /> Salin Usulan ke Editor
                    </button>
                  </div>
                  <p className="text-xs text-lppa-deep leading-relaxed italic bg-surface p-3 rounded-field border border-lppa-line font-medium">
                    "{currentElement.proposed_narrative}"
                  </p>
                </div>

                {/* Teacher Final Narrative Editor with Anti-Jargon & Template Support */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-ink flex items-center gap-2">
                      <FileText className="w-4 h-4 text-lppa" />
                      <span>Narasi Reflektif Akhir Guru (Akan Dicetak di Rapor)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const narrative = generateAppreciativeNarrative({
                            studentName,
                            elementKey: activeElementKey,
                            rating: currentElement.rating_summary || 'BSH'
                          });
                          handleNarrativeChange(activeElementKey, narrative);
                        }}
                        disabled={isReadOnly}
                        className="text-[11px] font-bold text-brand-primary hover-only:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" /> Draf Kamus Keluarga
                      </button>
                      <span className="text-[11px] text-ink-soft font-medium">
                        Guru pengarang utama
                      </span>
                    </div>
                  </div>
                  <textarea
                    rows={4}
                    disabled={isReadOnly}
                    value={currentElement.teacher_final_narrative}
                    onChange={e => handleNarrativeChange(activeElementKey, e.target.value)}
                    placeholder="Tuliskan narasi perkembangan anak..."
                    className="w-full p-3 text-xs font-medium rounded-card bg-surface border border-line text-ink focus:outline-none focus:ring-1 focus:ring-brand-primary leading-relaxed shadow-hairline"
                  />
                  {/* Anti-Jargon Enforcer Alert (Hukum 12) */}
                  {(() => {
                    const check = validateNarrative(currentElement.teacher_final_narrative);
                    if (!check.valid) {
                      return (
                        <div className="p-2.5 rounded-xl bg-warning-tint border border-warning-line text-warning-deep text-xs flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 shrink-0 text-warning" />
                          <span>
                            <strong>Perhatian (Hukum 12 Anti-Jargon):</strong> Ditemukan istilah evaluasi kaku/komparatif:{' '}
                            <span className="underline font-bold">{check.violations.join(', ')}</span>. Mohon gunakan bahasa perkembangan apresiatif.
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>

                {/* Recommendations */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-ink">
                    Rekomendasi Stimulasi & Pendampingan Berkelanjutan
                  </label>
                  <input
                    type="text"
                    disabled={isReadOnly}
                    value={currentElement.growth_recommendations}
                    onChange={e => handleGrowthRecChange(activeElementKey, e.target.value)}
                    className="w-full p-2 text-xs font-medium rounded-field bg-surface border border-line text-ink focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

                {/* Homeroom Reflection Section */}
                <div className="pt-4 border-t border-line space-y-2">
                  <label className="text-xs font-bold text-ink">
                    Pesan Reflektif & Peneguhan Guru Kelas untuk Orang Tua
                  </label>
                  <textarea
                    rows={2}
                    disabled={isReadOnly}
                    value={reflectionInput}
                    onChange={e => setReflectionInput(e.target.value)}
                    placeholder="Tuliskan apresiasi dan pesan hangat bagi ananda dan keluarga..."
                    className="w-full p-3 text-xs font-medium rounded-field bg-surface-subtle border border-line text-ink focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  />
                </div>

              </div>
            )}
          </div>
        </div>

        {/* BOTTOM ACTION BAR (Clean Responsive Hierarchy) */}
        <div className="px-4 medium:px-5 py-3 border-t border-line-soft bg-surface flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-2 shrink-0">
          {/* Secondary Action: Re-synthesize */}
          <button
            onClick={handleReSynthesize}
            disabled={isSynthesizing || isReadOnly}
            className="w-full medium:w-auto px-3 py-2 rounded-field bg-lppa-tint hover-only:bg-lppa-tint text-lppa-deep border border-lppa-line text-xs font-bold transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4 text-lppa" />
            <span>{isSynthesizing ? 'Menyintesis...' : 'Segarkan Narasi Otomatis'}</span>
          </button>

          {/* Action Button Group */}
          <div className="grid grid-cols-2 medium:flex medium:items-center gap-2 w-full medium:w-auto">
            <button
              onClick={() => setShowPrintPreview(true)}
              className="px-3 py-2 rounded-field bg-surface hover-only:bg-surface-subtle text-ink-soft text-xs font-bold transition flex justify-center items-center gap-2 cursor-pointer border border-line"
            >
              <Printer className="w-4 h-4 text-ink-soft" />
              <span>Pratinjau PDF</span>
            </button>

            <button
              onClick={onClose}
              className="hidden medium:flex px-4 py-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink-soft text-xs font-bold transition cursor-pointer justify-center items-center"
            >
              Tutup
            </button>

            {!isReadOnly && (
              <>
                <button
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="px-3 py-2 rounded-field bg-brand hover-only:opacity-90 text-on-brand text-xs font-bold transition flex justify-center items-center gap-2 shadow-hairline cursor-pointer disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isSaving ? 'Menyimpan...' : 'Simpan Draf'}</span>
                </button>

                <button
                  onClick={handleSubmitForReview}
                  disabled={isSubmitting || report?.status === 'READY_FOR_REVIEW'}
                  className="col-span-2 medium:col-span-1 px-4 py-2 rounded-field bg-lppa hover-only:bg-indigo-700 text-on-brand text-xs font-bold transition flex justify-center items-center gap-2 shadow-hairline cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
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
          record={(() => {
            const meta = db.getOfficialSchoolMetadata(schoolId, report.class_id);
            return lppaReportingService.toCanonicalPublishedRecord(
              report,
              meta.schoolName,
              meta.schoolNpsn,
              meta.className !== '—' ? meta.className : report.class_name,
              teacherName || meta.homeroomTeacherName,
              meta.headmasterName
            );
          })()}
        />
      )}
    </div>
  );
};
