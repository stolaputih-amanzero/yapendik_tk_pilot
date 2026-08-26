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
  Target
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden text-slate-900">
        
        {/* HEADER BAR */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-slate-900">
                  Busur Kontinuitas Perkembangan & Rencana Stimulasi
                </h3>
                <span className="text-xs font-black px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-200">
                  {profile?.student_name || 'Peserta Didik'}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium mt-0.5">
                {profile?.current_class_name} • NIS: {profile?.nis} • Kurikulum Merdeka PAUD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Switcher Tabs */}
            <div className="flex p-1 bg-slate-200/80 rounded-xl">
              <button
                onClick={() => setActiveTab('TRAJECTORY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'TRAJECTORY'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Busur Perkembangan</span>
              </button>

              <button
                onClick={() => setActiveTab('PLANS')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'PLANS'
                    ? 'bg-white text-indigo-900 shadow-xs'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>Rencana Stimulasi</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
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
              
              {/* Historical Context Notice (Read-Only Seal) */}
              <div className="bg-purple-50/70 p-4 rounded-2xl border border-purple-200 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
                  <div>
                    <h4 className="text-xs font-black text-purple-950">
                      Basis Rekor Historis Sah (Immutable Archive)
                    </h4>
                    <p className="text-[11px] text-purple-900 font-medium">
                      Data di bawah diproyeksikan dari {profile.historical_lppa_references.length} rapor LPPA yang telah berstatus PUBLISHED. Data masa lalu berstatus read-only murni.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono font-black text-purple-950 bg-white px-2.5 py-1 rounded-lg border border-purple-300 shrink-0">
                  Prinsip: Progress Over Labeling
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
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/20' 
                          : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50 shadow-xs'
                      }`}
                    >
                      <div className="text-xs font-black truncate">{traj.element_title}</div>
                      <div className="flex items-center justify-between mt-2">
                        <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-200' : 'text-slate-500'}`}>
                          Capaian Terkini:
                        </span>
                        <span className={`text-xs font-black px-2 py-0.5 rounded ${
                          isSelected 
                            ? 'bg-white/20 text-white' 
                            : 'bg-purple-100 text-purple-950 border border-purple-200'
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
                  
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
                        Lintasan Perkembangan Lintas Semester
                      </span>
                      <h4 className="text-base font-black text-slate-900 mt-0.5">
                        {profile.developmental_trajectories[activeElementKey].element_title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-600">Status Capaian:</span>
                      <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-950 border border-emerald-300 font-black text-xs">
                        {profile.developmental_trajectories[activeElementKey].current_rating}
                      </span>
                    </div>
                  </div>

                  {/* Multi-Semester Timeline Nodes */}
                  <div className="space-y-2">
                    <div className="text-xs font-bold text-slate-700">Rekam Jejak Evaluasi Multi-Semester:</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {profile.developmental_trajectories[activeElementKey].trajectory_points.map((pt, idx) => (
                        <div key={idx} className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-black text-slate-900">{pt.academic_year_name} (Semester {pt.semester})</div>
                            <span className="text-[10px] font-mono text-slate-500">Ref: {pt.published_record_id.slice(0, 20)}...</span>
                          </div>
                          <span className="text-xs font-black px-2.5 py-1 rounded-lg bg-purple-100 text-purple-950 border border-purple-300">
                            {pt.rating}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Strengths & Growth Areas */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-2">
                      <div className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Kekuatan & Minat yang Teramati:</span>
                      </div>
                      <ul className="text-xs text-emerald-900 space-y-1 font-medium list-disc list-inside">
                        {profile.developmental_trajectories[activeElementKey].observed_strengths.map((str, idx) => (
                          <li key={idx}>{str}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-purple-50/60 p-4 rounded-2xl border border-purple-200 space-y-2">
                      <div className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-purple-600" />
                        <span>Area Fokus Stimulasi Berkelanjutan:</span>
                      </div>
                      <ul className="text-xs text-purple-900 space-y-1 font-medium list-disc list-inside">
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

            /* TAB 2: LEARNING STIMULATION PLANS (System Proposes, Educator Decides) */
            <div className="space-y-6">
              
              {/* Header Action Bar */}
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    Rencana Stimulasi Pembelajaran Terarah Guru
                  </h4>
                  <p className="text-xs text-slate-500 font-medium">
                    Sistem mengusulkan ide perancah bermain • Guru kelas menetapkan keputusan pedagogis
                  </p>
                </div>

                <button
                  onClick={handleGenerateProposal}
                  disabled={isProcessing}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-purple-600/20 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4 text-purple-200" />
                  <span>⚡ Usulkan Rencana Stimulasi Sentra</span>
                </button>
              </div>

              {selectedPlan ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
                  
                  {/* Status Banner */}
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-600">Status Rencana:</span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-xs font-black uppercase border ${
                          selectedPlan.status === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                            : selectedPlan.status === 'COMPLETED'
                            ? 'bg-purple-100 text-purple-950 border-purple-300'
                            : 'bg-amber-100 text-amber-950 border-amber-300'
                        }`}>
                          {selectedPlan.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">
                        Jangkar Historis LPPA: {selectedPlan.source_historical_baseline_record_id}
                      </p>
                    </div>

                    <span className="text-xs font-bold text-slate-600">
                      Target: {selectedPlan.target_element_key}
                    </span>
                  </div>

                  {/* SECTION 1: SYSTEM RECOMMENDATION (Non-Authoritative) */}
                  <div className="bg-purple-50/50 p-4.5 rounded-2xl border border-purple-200 space-y-3">
                    <div className="flex items-center gap-2 text-xs font-black text-purple-950">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>Usulan Sistem Berdasarkan Rekor Historis (Non-Authoritative):</span>
                    </div>
                    <div className="bg-white p-3.5 rounded-xl border border-purple-200 text-xs text-purple-950 leading-relaxed font-medium">
                      "{selectedPlan.system_proposal.suggested_goal}"
                    </div>
                    <div className="text-[11px] text-purple-900 space-y-1">
                      <div><strong>Sentra Bermain yang Direkomendasikan: </strong> {selectedPlan.system_proposal.suggested_play_centers.join(', ')}</div>
                      <div><strong>Provokasi Main: </strong> {selectedPlan.system_proposal.suggested_provocations.join(' ')}</div>
                    </div>
                  </div>

                  {/* SECTION 2: TEACHER DECISION WORKSPACE (Authoritative) */}
                  <div className="space-y-4 pt-2 border-t border-slate-100">
                    <div className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-indigo-600" />
                      <span>Keputusan Pedagogis Guru Kelas (Otoritas Mutlak):</span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-900">
                        Tujuan Stimulasi Pembelajaran yang Ditetapkan Guru:
                      </label>
                      <textarea
                        rows={2}
                        value={adaptedGoal}
                        onChange={e => setAdaptedGoal(e.target.value)}
                        disabled={selectedPlan.status === 'COMPLETED'}
                        className="w-full p-3 text-xs font-medium rounded-xl bg-slate-50 border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-500"
                        placeholder="Sesuaikan tujuan stimulasi yang akan diimplementasikan di kelas..."
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900">
                          Catatan Perancah (Scaffolding Strategy):
                        </label>
                        <input
                          type="text"
                          value={pedagogicalNotes}
                          onChange={e => setPedagogicalNotes(e.target.value)}
                          disabled={selectedPlan.status === 'COMPLETED'}
                          placeholder="Contoh: Pendampingan dialog saat ananda merancang pondasi."
                          className="w-full p-2.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-900">
                          Prompt Kemitraan Stimulasi di Rumah:
                        </label>
                        <input
                          type="text"
                          value={homePrompt}
                          onChange={e => setHomePrompt(e.target.value)}
                          disabled={selectedPlan.status === 'COMPLETED'}
                          placeholder="Ajak ananda menyusun balok bersama keluarga."
                          className="w-full p-2.5 text-xs font-medium rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
                        />
                      </div>
                    </div>

                    {/* Completion Section if Active */}
                    {selectedPlan.status === 'ACTIVE' && (
                      <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 space-y-2">
                        <div className="text-xs font-black text-emerald-950">
                          Refleksi Penuntasan Tujuan Stimulasi:
                        </div>
                        <input
                          type="text"
                          value={completionReflection}
                          onChange={e => setCompletionReflection(e.target.value)}
                          placeholder="Tuliskan bukti pengamatan ketercapaian tujuan anak..."
                          className="w-full p-2.5 text-xs font-medium rounded-xl bg-white border border-emerald-300 text-slate-900"
                        />
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                    {selectedPlan.status === 'PROPOSED' && (
                      <button
                        onClick={handleConfirmDecision}
                        disabled={isProcessing}
                        className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCheck className="w-4 h-4" />
                        <span>✅ Tetapkan Keputusan & Aktifkan Rencana</span>
                      </button>
                    )}

                    {selectedPlan.status === 'ACTIVE' && (
                      <button
                        onClick={handleCompletePlan}
                        disabled={isProcessing}
                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>🏁 Selesaikan Rencana dengan Bukti Baru</span>
                      </button>
                    )}
                  </div>

                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-3">
                  <Lightbulb className="w-8 h-8 text-purple-600 mx-auto opacity-70" />
                  <h4 className="text-xs font-black text-slate-900">
                    Belum Ada Rencana Stimulasi Aktif untuk {profile.student_name}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Klik tombol "Usulkan Rencana Stimulasi Sentra" di atas agar sistem menganalisis rekor historis dan mengajukan ide bermain terarah.
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
