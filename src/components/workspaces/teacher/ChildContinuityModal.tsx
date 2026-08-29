/**
 * Yapendik School OS — Stage 4.3 Child Continuity & Learning Plan Surface (Fase 4.3-C)
 * 
 * Epistemological Principles:
 * 1. "Presentation layer over childContinuityService: no duplicated analytics logic."
 * 2. "Progress Over Labeling: visualizes continuous growth arcs across 4 elements."
 * 3. "System Proposes, Educator Decides: explicit boundary between proposal & decision."
 * 4. "Historical LPPA is read-only reference context."
 */

import React, { useState, useEffect } from 'react';
import { childContinuityService } from '../../../services/childContinuityService';
import { 
  ChildContinuityProfile, 
  LearningStimulationPlan,
  PlayCenterType 
} from '../../../types/childContinuityTypes';
import { LppaElementKey } from '../../../types/lppaReportingTypes';
import { 
  Compass, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  BookOpen, 
  Activity, 
  Heart, 
  X, 
  CheckCheck, 
  ChevronRight, 
  FileText, 
  Lightbulb, 
  ShieldCheck,
  RotateCcw,
  Target,
  Calendar
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  schoolId: string;
  academicYearId: string;
  semester: 'GANJIL' | 'GENAP';
  teacherPersonId: string;
  teacherName: string;
}

export const ChildContinuityModal: React.FC<Props> = ({
  isOpen,
  onClose,
  studentId,
  schoolId,
  academicYearId,
  semester,
  teacherPersonId,
  teacherName
}) => {
  const [profile, setProfile] = useState<ChildContinuityProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'TRAJECTORY' | 'PLANS'>('TRAJECTORY');
  const [activeElementKey, setActiveElementKey] = useState<LppaElementKey>('LITERASI_STEAM');
  
  // Plan Editor State
  const [selectedPlan, setSelectedPlan] = useState<LearningStimulationPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Teacher Decision Inputs
  const [adaptedGoal, setAdaptedGoal] = useState('');
  const [selectedCenters, setSelectedCenters] = useState<PlayCenterType[]>(['SENTRA_BALOK']);
  const [pedagogicalNotes, setPedagogicalNotes] = useState('');
  const [shareWithHome, setShareWithHome] = useState(true);
  const [homePrompt, setHomePrompt] = useState('');
  const [completionReflection, setCompletionReflection] = useState('');

  const loadProfile = async () => {
    if (!studentId || !isOpen) return;
    setLoading(true);
    setFeedback(null);
    try {
      const data = await childContinuityService.getChildContinuityProfile(studentId, schoolId);
      setProfile(data);
      if (data.active_stimulation_plans.length > 0) {
        const first = data.active_stimulation_plans[0];
        setSelectedPlan(first);
        setAdaptedGoal(first.system_proposal.suggested_goal);
        setSelectedCenters(first.system_proposal.suggested_play_centers);
        setHomePrompt(first.home_school_extension?.home_activity_prompt || 'Ajak ananda bermain balok bersama keluarga di rumah.');
      }
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal memuat profil kontinuitas.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [studentId, isOpen]);

  if (!isOpen) return null;

  const handleGenerateProposal = async () => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const res = await childContinuityService.generateProposedStimulationPlans({
        school_id: schoolId,
        class_id: profile?.current_class_id || '',
        academic_year_id: academicYearId,
        semester,
        student_ids: [studentId],
        requested_by_person_id: teacherPersonId,
        requested_by_name: teacherName,
        role: 'TEACHER'
      });

      if (res.generated_plans.length > 0) {
        setSelectedPlan(res.generated_plans[0]);
        setAdaptedGoal(res.generated_plans[0].system_proposal.suggested_goal);
        setSelectedCenters(res.generated_plans[0].system_proposal.suggested_play_centers);
      }
      setFeedback({ type: 'success', message: 'Engine berhasil menyintesis usulan rencana stimulasi bermain!' });
      await loadProfile();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal menghasilkan usulan.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDecision = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await childContinuityService.confirmLearningStimulationPlan({
        plan_id: selectedPlan.plan_id,
        school_id: schoolId,
        teacher_decision: {
          decided_by_person_id: teacherPersonId,
          decided_by_name: teacherName,
          decision_timestamp: new Date().toISOString(),
          is_accepted_as_suggested: true,
          adapted_goal: adaptedGoal,
          chosen_play_centers: selectedCenters,
          custom_teacher_provocations: ['Menyiapkan kartu tantangan arsitektur bergradasi.'],
          pedagogical_notes: pedagogicalNotes || 'Kenzo sangat responsif terhadap tantangan spasial bergradasi.',
          differentiation_strategy: 'Pendampingan dialog scaffolding saat anak merancang pondasi balok.'
        },
        share_with_home: shareWithHome,
        home_activity_prompt: homePrompt,
        confirmed_by_person_id: teacherPersonId,
        confirmed_by_name: teacherName,
        role: 'TEACHER'
      });

      setFeedback({ type: 'success', message: 'Keputusan pedagogis berhasil ditetapkan! Rencana berstatus ACTIVE.' });
      await loadProfile();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal menetapkan keputusan.' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompletePlan = async () => {
    if (!selectedPlan) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      await childContinuityService.completeLearningStimulationPlan({
        plan_id: selectedPlan.plan_id,
        school_id: schoolId,
        completion_reflection: completionReflection || 'Tujuan stimulasi berhasil dicapai dengan karya balok terverifikasi.',
        linked_observation_evidence_ids: ['obs_demo_steam_01'],
        completed_by_person_id: teacherPersonId,
        completed_by_name: teacherName,
        role: 'TEACHER'
      });

      setFeedback({ type: 'success', message: 'Rencana stimulasi berhasil diselesaikan (Status: COMPLETED)!' });
      await loadProfile();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err?.message || 'Gagal menyelesaikan rencana.' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-70 flex items-end medium:items-center justify-center p-0 medium:p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-surface rounded-t-3xl medium:rounded-card border-t medium:border border-line shadow-floating w-full max-w-5xl h-[90vh] medium:h-[85vh] flex flex-col overflow-hidden text-ink">
        
        {/* HEADER BAR (Amanaura Standard Eyebrow + Title + Badge) */}
        <div className="px-4 medium:px-5 py-3 medium:py-3 border-b border-line-soft bg-surface flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3 pr-6 medium:pr-0 min-w-0">
            <div className="w-10 h-10 rounded-card bg-lppa-tint border border-indigo-100 text-lppa-deep flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              {/* Eyebrow */}
              <div className="text-lppa text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-0.5">
                Kontinuitas & Rencana Belajar
              </div>
              
              {/* Title + Student Badge + NIS */}
              <h3 className="text-sm medium:text-base font-bold text-ink flex items-center gap-2 flex-wrap leading-tight">
                <span>Busur Kontinuitas & Rencana</span>
                <span className="text-xs font-medium px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line">
                  {profile?.student_name || 'Peserta Didik'}
                </span>
                <span className="text-xs font-mono font-medium px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line whitespace-nowrap">
                  NIS {profile?.nis}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 medium:p-2 rounded-field text-ink-faint hover-only:text-ink-soft hover-only:bg-surface-subtle transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTEXT & STATUS RIBBON (Amanaura Standard Matching Pill Strips) */}
        <div className="px-4 medium:px-5 py-2 border-b border-line-soft bg-surface-subtle/60 flex flex-col medium:flex-row items-start medium:items-center justify-between gap-2 shrink-0">
          {/* Badge 1: Academic & Curriculum Info */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface border border-line text-[11px] font-medium text-ink-soft shadow-hairline">
            <Calendar className="w-4 h-4 text-ink-faint shrink-0" />
            <span>TA 2026/2027</span>
            <span className="text-ink-faint">•</span>
            <span>GANJIL</span>
            <span className="text-ink-faint">•</span>
            <span>Kurikulum Merdeka TK</span>
          </div>

          {/* Badge 2: Progress Focus Pill */}
          <div className="flex items-center">
            <span className="px-3 py-1 text-[11px] font-semibold rounded-full border border-lppa-line bg-lppa-tint text-lppa-deep inline-flex items-center gap-2 shadow-hairline">
              <Compass className="w-4 h-4 text-lppa" />
              <span>Fokus Perkembangan Berkelanjutan</span>
            </span>
          </div>
        </div>

        {/* SUB-TABS (Fluid Pill Bar) */}
        <div className="flex border-b border-line-soft bg-surface-subtle/70 px-4 py-2 gap-2 overflow-x-auto scrollbar-hide shrink-0 min-w-0">
          <button
            onClick={() => setActiveTab('TRAJECTORY')}
            className={`px-3 py-1 rounded-field text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'TRAJECTORY'
                ? 'bg-surface text-ink shadow-hairline border border-line'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-lppa" />
            <span>Busur Perkembangan</span>
          </button>

          <button
            onClick={() => setActiveTab('PLANS')}
            className={`px-3 py-1 rounded-field text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'PLANS'
                ? 'bg-surface text-ink shadow-hairline border border-line'
                : 'text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle/60'
            }`}
          >
            <Target className="w-4 h-4 text-lppa" />
            <span>Rencana Stimulasi</span>
          </button>
        </div>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div className={`px-6 py-2 text-xs font-bold flex items-center gap-2 border-b shrink-0 ${
            feedback.type === 'success' 
              ? 'bg-success-tint text-success-deep border-success-line' 
              : 'bg-danger-tint text-danger-deep border-danger-line'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : <X className="w-4 h-4 text-danger shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* BODY WORKSPACE */}
        <div className="flex-1 p-6 overflow-y-auto bg-surface-subtle/50">
          
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-ink-soft font-bold">
              Memproyeksikan data kontinuitas perkembangan...
            </div>
          ) : profile && activeTab === 'TRAJECTORY' ? (
            
            /* TAB 1: DEVELOPMENTAL TRAJECTORY ARCS */
            <div className="space-y-6">
              
              {/* Historical Context Notice */}
              <div className="bg-lppa-tint/50 p-4 rounded-card border border-indigo-100/80 flex flex-col medium:flex-row items-start medium:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-lppa shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-ink">
                      Rekam Historis Rapor Siswa
                    </h4>
                    <p className="text-[11px] text-ink-soft font-medium">
                      Data di bawah diproyeksikan dari {profile.historical_lppa_references.length} rapor LPPA resmi yang telah disahkan. Data masa lalu tersimpan sebagai arsip rujukan.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-lppa-deep bg-surface px-2 py-1 rounded-full border border-lppa-line shrink-0 shadow-hairline">
                  Fokus Perkembangan Berkelanjutan
                </span>
              </div>

              {/* Element Selector Cards */}
              <div className="grid grid-cols-2 medium:grid-cols-4 gap-3">
                {(['NILAI_AGAMA_BUDI_PEKERTI', 'JATI_DIRI', 'LITERASI_STEAM', 'PROJEK_P5'] as LppaElementKey[]).map(k => {
                  const traj = profile.developmental_trajectories[k];
                  const isSelected = activeElementKey === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setActiveElementKey(k)}
                      className={`p-3 rounded-card border text-left transition cursor-pointer ${
                        isSelected 
                          ? 'bg-lppa-tint/70 text-ink border-2 border-indigo-600 shadow-hairline ring-2 ring-indigo-500/20' 
                          : 'bg-surface text-ink border-line hover-only:bg-surface-subtle shadow-hairline'
                      }`}
                    >
                      <div className="text-xs font-bold truncate text-ink">{traj.element_title}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-medium text-ink-soft">
                          Capaian Terkini:
                        </span>
                        <span className={`text-xs font-bold px-2 py-1 rounded-full border ${
                          isSelected 
                            ? 'bg-indigo-600 text-on-brand border-indigo-600' 
                            : 'bg-surface-subtle text-ink-soft border-line'
                        }`}>
                          {traj.current_rating}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Arc for Selected Element */}
              {profile.developmental_trajectories[activeElementKey] && (
                <div className="bg-surface rounded-3xl border border-line p-6 shadow-hairline space-y-6">
                  
                  <div className="flex flex-col medium:flex-row items-start medium:items-center justify-between gap-3 border-b border-line-soft pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-ink-faint">
                        Lintasan Perkembangan Lintas Semester
                      </span>
                      <h4 className="text-base font-bold text-ink mt-0.5">
                        {profile.developmental_trajectories[activeElementKey].element_title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-ink-soft">Status Capaian:</span>
                      <span className="px-3 py-1 rounded-full bg-success-tint text-success-deep border border-success-line font-bold text-xs">
                        {profile.developmental_trajectories[activeElementKey].current_rating}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Semester Timeline Nodes */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-ink">Rekam Jejak Evaluasi Multi-Semester:</div>
                    <div className="grid grid-cols-1 medium:grid-cols-2 gap-3">
                      {profile.developmental_trajectories[activeElementKey].trajectory_points.map((pt, idx) => (
                        <div key={idx} className="bg-surface-subtle/70 p-3 rounded-card border border-line/80 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-ink">{pt.academic_year_name} (Semester {pt.semester})</div>
                            <span className="text-[10px] font-medium text-ink-faint">Dokumen Rapor Resmi Terbit</span>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 rounded-full bg-surface text-ink-soft border border-line shadow-hairline">
                            {pt.rating}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Growth Areas */}
                  <div className="grid grid-cols-1 medium:grid-cols-2 gap-4 pt-2">
                    <div className="bg-success-tint/50 p-4 rounded-card border border-emerald-100 space-y-2">
                      <div className="text-xs font-bold text-success-deep flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success" />
                        <span>Kekuatan & Minat yang Teramati:</span>
                      </div>
                      <ul className="text-xs text-success-deep space-y-1 font-normal list-disc list-inside">
                        {profile.developmental_trajectories[activeElementKey].observed_strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-lppa-tint/50 p-4 rounded-card border border-purple-100 space-y-2">
                      <div className="text-xs font-bold text-lppa-deep flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-lppa" />
                        <span>Area Fokus Stimulasi Berkelanjutan:</span>
                      </div>
                      <ul className="text-xs text-lppa-deep space-y-1 font-normal list-disc list-inside">
                        {profile.developmental_trajectories[activeElementKey].system_identified_growth_focus.map((foc, idx) => (
                          <li key={idx}>{foc}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>
              )}

            </div>

          ) : (

            /* TAB 2: LEARNING STIMULATION PLANS */
            <div className="space-y-6">
              
              {/* Header Action Bar */}
              <div className="flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-ink">
                    Rencana Stimulasi Pembelajaran
                  </h4>
                  <p className="text-xs text-ink-soft font-medium">
                    Rekomendasi aktivitas bermain terarah berbasis rekam capaian ananda
                  </p>
                </div>

                <button
                  onClick={handleGenerateProposal}
                  disabled={isProcessing}
                  className="w-full medium:w-auto px-4 py-2 rounded-field bg-lppa-tint hover-only:bg-lppa-tint text-lppa-deep border border-lppa-line text-xs font-bold transition flex justify-center items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-lppa" />
                  <span>Rekomendasikan Rencana Sentra</span>
                </button>
              </div>

              {selectedPlan ? (
                <div className="bg-surface rounded-card border border-line p-4 medium:p-6 shadow-hairline space-y-5">
                  
                  {/* Status Banner */}
                  <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-2 bg-surface-subtle/70 p-3 rounded-card border border-line/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-ink-soft">Status Rencana:</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold border ${
                        selectedPlan.status === 'ACTIVE'
                          ? 'bg-success-tint text-success-deep border-success-line'
                          : selectedPlan.status === 'COMPLETED'
                          ? 'bg-lppa-tint text-lppa-deep border-lppa-line'
                          : 'bg-warning-tint text-warning-deep border-warning-line'
                      }`}>
                        {selectedPlan.status === 'ACTIVE' ? 'Aktif' : selectedPlan.status === 'COMPLETED' ? 'Tuntas' : 'Draf Rekomendasi'}
                      </span>
                    </div>

                    <span className="text-xs font-medium text-ink-soft">
                      Fokus Elemen: <strong className="text-ink font-bold">{profile.developmental_trajectories[selectedPlan.target_element_key]?.element_title || selectedPlan.target_element_key}</strong>
                    </span>
                  </div>

                  {/* SECTION 1: SYSTEM RECOMMENDATION */}
                  <div className="bg-lppa-tint/50 p-4 rounded-card border border-purple-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-lppa-deep">
                      <Sparkles className="w-4 h-4 text-lppa" />
                      <span>Rekomendasi Rencana Stimulasi Bermain:</span>
                    </div>
                    <div className="bg-surface p-3 rounded-field border border-purple-100 text-xs text-ink leading-relaxed font-normal">
                      "{selectedPlan.system_proposal.suggested_goal}"
                    </div>
                    <div className="text-[11px] text-lppa-deep space-y-1">
                      <div><strong className="font-semibold text-lppa-deep">Sentra Bermain yang Direkomendasikan: </strong> {selectedPlan.system_proposal.suggested_play_centers.join(', ')}</div>
                      <div><strong className="font-semibold text-lppa-deep">Ide & Pemicu Main: </strong> {selectedPlan.system_proposal.suggested_provocations.join(' ')}</div>
                    </div>
                  </div>

                  {/* SECTION 2: TEACHER DECISION WORKSPACE */}
                  <div className="space-y-4 pt-2 border-t border-line-soft">
                    <div className="text-xs font-bold uppercase tracking-wider text-ink-soft flex items-center gap-2">
                      <Compass className="w-4 h-4 text-lppa" />
                      <span>Catatan & Arahan Pembelajaran Guru Kelas</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-ink">
                        Tujuan Pembelajaran yang Ditetapkan:
                      </label>
                      <textarea
                        rows={2}
                        value={adaptedGoal}
                        onChange={e => setAdaptedGoal(e.target.value)}
                        disabled={selectedPlan.status === 'COMPLETED'}
                        className="w-full p-3 text-xs font-medium rounded-field bg-surface-subtle border border-line text-ink focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brass/30 shadow-hairline"
                        placeholder="Sesuaikan tujuan stimulasi yang akan diimplementasikan di kelas..."
                      />
                    </div>

                    <div className="grid grid-cols-1 medium:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink">
                          Pendampingan Guru (Scaffolding):
                        </label>
                        <input
                          type="text"
                          value={pedagogicalNotes}
                          onChange={e => setPedagogicalNotes(e.target.value)}
                          disabled={selectedPlan.status === 'COMPLETED'}
                          placeholder="Contoh: Pendampingan dialog saat ananda merancang pondasi."
                          className="w-full p-2 text-xs font-medium rounded-field bg-surface-subtle border border-line text-ink focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brass/30 shadow-hairline"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-ink">
                          Saran Stimulasi untuk Orang Tua di Rumah:
                        </label>
                        <input
                          type="text"
                          value={homePrompt}
                          onChange={e => setHomePrompt(e.target.value)}
                          disabled={selectedPlan.status === 'COMPLETED'}
                          placeholder="Contoh: Ajak ananda menyusun balok bersama keluarga."
                          className="w-full p-2 text-xs font-medium rounded-field bg-surface-subtle border border-line text-ink focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brass/30 shadow-hairline"
                        />
                      </div>
                    </div>

                    {/* Completion Section if Active */}
                    {selectedPlan.status === 'ACTIVE' && (
                      <div className="bg-success-tint/70 p-4 rounded-card border border-success-line space-y-2">
                        <div className="text-xs font-bold text-success-deep">
                          Refleksi Penuntasan Tujuan Stimulasi:
                        </div>
                        <input
                          type="text"
                          value={completionReflection}
                          onChange={e => setCompletionReflection(e.target.value)}
                          placeholder="Tuliskan bukti pengamatan ketercapaian tujuan anak..."
                          className="w-full p-2 text-xs font-medium rounded-field bg-surface border border-success-line text-ink focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-hairline"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col medium:flex-row items-stretch medium:items-center justify-end gap-2 pt-3 border-t border-line-soft">
                    {selectedPlan.status === 'PROPOSED' && (
                      <button
                        onClick={handleConfirmDecision}
                        disabled={isProcessing}
                        className="w-full medium:w-auto px-4 py-2 rounded-field bg-brand hover-only:bg-surface-inset text-on-brand text-xs font-bold transition flex justify-center items-center gap-2 shadow-hairline cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tetapkan & Aktifkan Rencana</span>
                      </button>
                    )}

                    {selectedPlan.status === 'ACTIVE' && (
                      <button
                        onClick={handleCompletePlan}
                        disabled={isProcessing}
                        className="w-full medium:w-auto px-4 py-2 rounded-field bg-success hover-only:opacity-90 text-on-brand text-xs font-bold transition flex justify-center items-center gap-2 shadow-hairline cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesaikan Rencana Belajar</span>
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                <div className="bg-surface rounded-card border border-line p-8 text-center space-y-3">
                  <Lightbulb className="w-8 h-8 text-lppa mx-auto opacity-70" />
                  <h4 className="text-xs font-bold text-ink">
                    Belum Ada Rencana Stimulasi Aktif untuk {profile.student_name}
                  </h4>
                  <p className="text-xs text-ink-soft max-w-md mx-auto">
                    Klik tombol "Rekomendasikan Rencana Sentra" di atas agar sistem menganalisis rekor capaian dan mengajukan ide bermain terarah.
                  </p>
                </div>
              )}

            </div>

          )}

        </div>

      </div>
    </div>
  );
};
