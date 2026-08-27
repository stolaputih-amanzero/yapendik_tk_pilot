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
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 shadow-2xl w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* HEADER BAR (Amanaura Standard Eyebrow + Title + Badge) */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-100 bg-white flex items-center justify-between relative shrink-0">
          <div className="flex items-center gap-3 pr-6 sm:pr-0 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Compass className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              {/* Eyebrow */}
              <div className="text-indigo-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-0.5">
                Kontinuitas & Rencana Belajar
              </div>
              
              {/* Title + Student Badge + NIS */}
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5 flex-wrap leading-tight">
                <span>Busur Kontinuitas & Rencana</span>
                <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                  {profile?.student_name || 'Peserta Didik'}
                </span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  NIS {profile?.nis}
                </span>
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTEXT & STATUS RIBBON (Amanaura Standard Matching Pill Strips) */}
        <div className="px-4 sm:px-5 py-2.5 border-b border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 shrink-0">
          {/* Badge 1: Academic & Curriculum Info */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-[11px] font-medium text-slate-700 shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>TA 2026/2027</span>
            <span className="text-slate-300">•</span>
            <span>GANJIL</span>
            <span className="text-slate-300">•</span>
            <span>Kurikulum Merdeka TK</span>
          </div>

          {/* Badge 2: Progress Focus Pill */}
          <div className="flex items-center">
            <span className="px-3 py-1 text-[11px] font-semibold rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700 inline-flex items-center gap-1.5 shadow-2xs">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>Fokus Perkembangan Berkelanjutan</span>
            </span>
          </div>
        </div>

        {/* SUB-TABS (Fluid Pill Bar) */}
        <div className="flex border-b border-slate-100 bg-slate-50/70 px-4 py-2 gap-2 overflow-x-auto scrollbar-hide shrink-0">
          <button
            onClick={() => setActiveTab('TRAJECTORY')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'TRAJECTORY'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
            <span>Busur Perkembangan</span>
          </button>

          <button
            onClick={() => setActiveTab('PLANS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              activeTab === 'PLANS'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <span>Rencana Stimulasi</span>
          </button>
        </div>

        {/* FEEDBACK BANNER */}
        {feedback && (
          <div className={`px-6 py-2.5 text-xs font-bold flex items-center gap-2 border-b shrink-0 ${
            feedback.type === 'success' 
              ? 'bg-emerald-50 text-emerald-900 border-emerald-200' 
              : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <X className="w-4 h-4 text-rose-600 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* BODY WORKSPACE */}
        <div className="flex-1 p-6 overflow-y-auto bg-slate-50/50">
          
          {loading ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-500 font-bold">
              Memproyeksikan data kontinuitas perkembangan...
            </div>
          ) : profile && activeTab === 'TRAJECTORY' ? (
            
            /* TAB 1: DEVELOPMENTAL TRAJECTORY ARCS */
            <div className="space-y-6">
              
              {/* Historical Context Notice */}
              <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">
                      Rekam Historis Rapor Siswa
                    </h4>
                    <p className="text-[11px] text-slate-600 font-medium">
                      Data di bawah diproyeksikan dari {profile.historical_lppa_references.length} rapor LPPA resmi yang telah disahkan. Data masa lalu tersimpan sebagai arsip rujukan.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-semibold text-indigo-900 bg-white px-2.5 py-1 rounded-full border border-indigo-200 shrink-0 shadow-2xs">
                  Fokus Perkembangan Berkelanjutan
                </span>
              </div>

              {/* Element Selector Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {(['NILAI_AGAMA_BUDI_PEKERTI', 'JATI_DIRI', 'LITERASI_STEAM', 'PROJEK_P5'] as LppaElementKey[]).map(k => {
                  const traj = profile.developmental_trajectories[k];
                  const isSelected = activeElementKey === k;
                  return (
                    <button
                      key={k}
                      onClick={() => setActiveElementKey(k)}
                      className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                        isSelected 
                          ? 'bg-indigo-50/70 text-slate-900 border-2 border-indigo-600 shadow-xs ring-2 ring-indigo-500/20' 
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      <div className="text-xs font-bold truncate text-slate-900">{traj.element_title}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] font-medium text-slate-500">
                          Capaian Terkini:
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                          isSelected 
                            ? 'bg-indigo-600 text-white border-indigo-600' 
                            : 'bg-slate-100 text-slate-700 border-slate-200'
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
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                  
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Lintasan Perkembangan Lintas Semester
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">
                        {profile.developmental_trajectories[activeElementKey].element_title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Status Capaian:</span>
                      <span className="px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                        {profile.developmental_trajectories[activeElementKey].current_rating}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Semester Timeline Nodes */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-800">Rekam Jejak Evaluasi Multi-Semester:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.developmental_trajectories[activeElementKey].trajectory_points.map((pt, idx) => (
                        <div key={idx} className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-slate-900">{pt.academic_year_name} (Semester {pt.semester})</div>
                            <span className="text-[10px] font-medium text-slate-400">Dokumen Rapor Resmi Terbit</span>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 shadow-2xs">
                            {pt.rating}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Growth Areas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-2">
                      <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Kekuatan & Minat yang Teramati:</span>
                      </div>
                      <ul className="text-xs text-emerald-900 space-y-1 font-normal list-disc list-inside">
                        {profile.developmental_trajectories[activeElementKey].observed_strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-2">
                      <div className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-purple-600" />
                        <span>Area Fokus Stimulasi Berkelanjutan:</span>
                      </div>
                      <ul className="text-xs text-purple-900 space-y-1 font-normal list-disc list-inside">
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
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Rencana Stimulasi Pembelajaran
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Rekomendasi aktivitas bermain terarah berbasis rekam capaian ananda
                  </p>
                </div>

                <button
                  onClick={handleGenerateProposal}
                  disabled={isProcessing}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-bold transition flex justify-center items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Rekomendasikan Rencana Sentra</span>
                </button>
              </div>

              {selectedPlan ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-5">
                  
                  {/* Status Banner */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/70 p-3.5 rounded-2xl border border-slate-200/80">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-500">Status Rencana:</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                        selectedPlan.status === 'ACTIVE'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : selectedPlan.status === 'COMPLETED'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}>
                        {selectedPlan.status === 'ACTIVE' ? 'Aktif' : selectedPlan.status === 'COMPLETED' ? 'Tuntas' : 'Draf Rekomendasi'}
                      </span>
                    </div>

                    <span className="text-xs font-medium text-slate-500">
                      Fokus Elemen: <strong className="text-slate-800 font-bold">{profile.developmental_trajectories[selectedPlan.target_element_key]?.element_title || selectedPlan.target_element_key}</strong>
                    </span>
                  </div>

                  {/* SECTION 1: SYSTEM RECOMMENDATION */}
                  <div className="bg-purple-50/50 p-4 rounded-2xl border border-purple-100 space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-bold text-purple-950">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Rekomendasi Rencana Stimulasi Bermain:</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-purple-100 text-xs text-slate-800 leading-relaxed font-normal">
                      "{selectedPlan.system_proposal.suggested_goal}"
                    </div>
                    <div className="text-[11px] text-purple-900 space-y-1">
                      <div><strong className="font-semibold text-purple-950">Sentra Bermain yang Direkomendasikan: </strong> {selectedPlan.system_proposal.suggested_play_centers.join(', ')}</div>
                      <div><strong className="font-semibold text-purple-950">Ide & Pemicu Main: </strong> {selectedPlan.system_proposal.suggested_provocations.join(' ')}</div>
                    </div>
                  </div>

                  {/* SECTION 2: TEACHER DECISION WORKSPACE */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-indigo-600" />
                      <span>Catatan & Arahan Pembelajaran Guru Kelas</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900">
                        Tujuan Pembelajaran yang Ditetapkan:
                      </label>
                      <textarea
                        rows={2}
                        value={adaptedGoal}
                        onChange={e => setAdaptedGoal(e.target.value)}
                        disabled={selectedPlan.status === 'COMPLETED'}
                        className="w-full p-3 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                        placeholder="Sesuaikan tujuan stimulasi yang akan diimplementasikan di kelas..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900">
                          Pendampingan Guru (Scaffolding):
                        </label>
                        <input
                          type="text"
                          value={pedagogicalNotes}
                          onChange={e => setPedagogicalNotes(e.target.value)}
                          disabled={selectedPlan.status === 'COMPLETED'}
                          placeholder="Contoh: Pendampingan dialog saat ananda merancang pondasi."
                          className="w-full p-2.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900">
                          Saran Stimulasi untuk Orang Tua di Rumah:
                        </label>
                        <input
                          type="text"
                          value={homePrompt}
                          onChange={e => setHomePrompt(e.target.value)}
                          disabled={selectedPlan.status === 'COMPLETED'}
                          placeholder="Contoh: Ajak ananda menyusun balok bersama keluarga."
                          className="w-full p-2.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                        />
                      </div>
                    </div>

                    {/* Completion Section if Active */}
                    {selectedPlan.status === 'ACTIVE' && (
                      <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                        <div className="text-xs font-bold text-emerald-950">
                          Refleksi Penuntasan Tujuan Stimulasi:
                        </div>
                        <input
                          type="text"
                          value={completionReflection}
                          onChange={e => setCompletionReflection(e.target.value)}
                          placeholder="Tuliskan bukti pengamatan ketercapaian tujuan anak..."
                          className="w-full p-2.5 text-xs font-medium rounded-xl bg-white border border-emerald-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                    {selectedPlan.status === 'PROPOSED' && (
                      <button
                        onClick={handleConfirmDecision}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex justify-center items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Tetapkan & Aktifkan Rencana</span>
                      </button>
                    )}

                    {selectedPlan.status === 'ACTIVE' && (
                      <button
                        onClick={handleCompletePlan}
                        disabled={isProcessing}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex justify-center items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesaikan Rencana Belajar</span>
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                  <Lightbulb className="w-8 h-8 text-purple-600 mx-auto opacity-70" />
                  <h4 className="text-xs font-bold text-slate-900">
                    Belum Ada Rencana Stimulasi Aktif untuk {profile.student_name}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
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
