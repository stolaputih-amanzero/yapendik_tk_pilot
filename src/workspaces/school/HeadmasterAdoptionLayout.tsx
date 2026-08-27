/**
 * Yapendik School OS — The Glass Layer
 * Headmaster Adoption Hub Layout (`/school/adoption/*`)
 * 
 * Unit School Leadership Workspace for contextualizing and adopting Foundation actions.
 * Enforces School Autonomy (FB-03) and Qualitative Human Reflection recording.
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { institutionalLearningService } from '../../services/institutionalLearningService';
import { 
  InstitutionalActionRecord,
  SchoolAdoptionResponse,
  ObservedOutcomeEffect 
} from '../../types/institutionalLearningTypes';
import { 
  CanonicalAnchor, 
  NonCausalDelta 
} from '../../components/glass';
import { 
  Building2, 
  Inbox, 
  CheckCircle2, 
  PenTool, 
  Clock, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Quote,
  ShieldCheck
} from 'lucide-react';

export type AdoptionView = 'INBOX' | 'RESPONSES';

export const HeadmasterAdoptionLayout: React.FC = () => {
  const { currentPersona, securityContext, activeSchoolId } = useSecurityContext();
  const schoolId = activeSchoolId || securityContext?.activeSchoolId || 'sch_tk_menteng_01';

  const [activeView, setActiveView] = useState<AdoptionView>('INBOX');
  const [actions, setActions] = useState<InstitutionalActionRecord[]>(() => {
    const all = institutionalLearningService.listActions();
    return all.filter(a => a.target_scope === 'ALL_TK_UNITS' || a.target_school_id === schoolId);
  });
  const [adoptions, setAdoptions] = useState<SchoolAdoptionResponse[]>(() => {
    return institutionalLearningService.listAdoptions().filter(ad => ad.school_id === schoolId);
  });
  const [outcomes, setOutcomes] = useState<ObservedOutcomeEffect[]>(() => {
    return institutionalLearningService.listOutcomes().filter(o => o.school_id === schoolId);
  });
  const [isLoading, setIsLoading] = useState(false);

  // Adoption Form State
  const [selectedAction, setSelectedAction] = useState<InstitutionalActionRecord | null>(null);
  const [adoptionDecision, setAdoptionDecision] = useState<'ACCEPTED' | 'MODIFIED_LOCALLY' | 'DEFERRED'>('ACCEPTED');
  const [adaptationNotes, setAdaptationNotes] = useState('');
  const [qualitativeReflection, setQualitativeReflection] = useState('');
  const [outcomeDelta, setOutcomeDelta] = useState('12.5');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const allActions = institutionalLearningService.listActions();
      // Filter actions relevant for this school or ALL_TK_UNITS
      const relevantActions = allActions.filter(
        a => a.target_scope === 'ALL_TK_UNITS' || a.target_school_id === schoolId
      );
      const allAdoptions = institutionalLearningService.listAdoptions();
      const schoolAdoptions = allAdoptions.filter(ad => ad.school_id === schoolId);
      const allOutcomes = institutionalLearningService.listOutcomes();
      const schoolOutcomes = allOutcomes.filter(o => o.school_id === schoolId);

      setActions(relevantActions);
      setAdoptions(schoolAdoptions);
      setOutcomes(schoolOutcomes);
    } catch (err) {
      console.error('Failed to load headmaster adoption data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [schoolId]);

  const handleRecordAdoption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAction) return;

    setIsSubmitting(true);
    setSuccessMessage(null);
    try {
      // 1. Record Adoption Response
      const adoptionStatus: any = adoptionDecision === 'ACCEPTED' ? 'ADOPTED_IN_PRACTICE' : adoptionDecision === 'MODIFIED_LOCALLY' ? 'ADAPTED_LOCALLY' : 'DEFERRED';
      const adoptionRecord: SchoolAdoptionResponse = {
        response_id: `adp_${schoolId}_${selectedAction.action_id}_${Date.now()}`,
        action_id: selectedAction.action_id,
        action_type: selectedAction.action_type,
        school_id: schoolId,
        headmaster_person_id: currentPersona?.personId || 'per_headmaster_esther',
        headmaster_name: currentPersona?.name || 'Dra. Esther Nugroho, M.Pd',
        adoption_status: adoptionStatus,
        local_context_adaptation_notes: adaptationNotes || 'Adopsi kebijakan sesuai jadwal pembelajaran sentra unit.',
        action_timeline: '2026-08-16 s.d. 2026-11-20',
        acknowledged_at: new Date().toISOString()
      };

      await institutionalLearningService.recordSchoolAdoption(
        adoptionRecord,
        securityContext?.role || currentPersona?.role || 'HEADMASTER'
      );

      // 2. If qualitative reflection provided, record empirical outcome
      if (qualitativeReflection.trim()) {
        const delta = parseFloat(outcomeDelta) || 12.4;
        const outcomeRecord: ObservedOutcomeEffect = {
          outcome_id: `out_${schoolId}_${selectedAction.action_id}_${Date.now()}`,
          action_id: selectedAction.action_id,
          school_id: schoolId,
          metric_name: 'Literasi STEAM & Kemandirian',
          observation_window: {
            baseline_period_name: 'Juli 2026',
            evaluation_period_name: 'Agustus 2026'
          },
          measurements: {
            baseline_measurement: {
              metric_value: 62.0,
              unit_of_measure: '%',
              sample_cohort_size: 14
            },
            evaluation_measurement: {
              metric_value: 62.0 + delta,
              unit_of_measure: '%',
              sample_cohort_size: 14
            },
            computed_delta: {
              absolute_delta: delta,
              percentage_change_pct: (delta / 62.0) * 100
            }
          },
          statistical_nature: 'OBSERVED_EMPIRICAL_ASSOCIATION',
          human_reflective_interpretation: qualitativeReflection,
          recorded_by_person_id: currentPersona?.personId || 'per_headmaster_esther',
          recorded_by_name: currentPersona?.name || 'Dra. Esther Nugroho, M.Pd',
          recorded_at: new Date().toISOString()
        };

        await institutionalLearningService.recordObservedOutcome(outcomeRecord);
      }

      setSuccessMessage(`Adopsi untuk aksi ${selectedAction.action_id} berhasil dicatat.`);
      setSelectedAction(null);
      setAdaptationNotes('');
      setQualitativeReflection('');
      await refreshData();
    } catch (err: any) {
      alert(`Gagal mencatat adopsi: ${err?.message || err}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-6 w-full" data-testid="headmaster-adoption-hub">
      {/* Workspace Header */}
      <div className="bg-slate-50 border-b border-slate-200 md:rounded-2xl px-4 py-5 md:p-6 w-full text-slate-900 md:border md:shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-600 text-xs font-mono mb-1">
              <Building2 className="w-4 h-4" />
              <span>Kebijakan Yayasan</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Adopsi Kebijakan</span>
              <span className="hidden md:inline-flex text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 border border-emerald-200 font-mono font-normal">
                School Autonomy (FB-03)
              </span>
            </h1>
            <p className="hidden md:block text-slate-500 text-xs mt-1 max-w-2xl">
              Ruang kerja Kepala Sekolah untuk menerima dukungan Yayasan, mencatat penyesuaian lokal, dan merekam refleksi kualitatif dampak pembelajaran.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors shadow-xs shrink-0"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Inbox</span>
            </button>

            <div className="hidden md:block bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-right shadow-xs">
              <div className="text-[10px] text-slate-500 font-mono">UNIT SEKOLAH</div>
              <div className="text-xs font-bold text-emerald-700 font-mono">{schoolId}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mt-6 gap-2 text-xs">
          <button
            onClick={() => setActiveView('INBOX')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative ${
              activeView === 'INBOX'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            data-testid="tab-inbox"
          >
            <Inbox className="w-4 h-4" />
            <span>Inbox</span>
            {actions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[10px] text-emerald-700 font-mono">
                {actions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('RESPONSES')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative ${
              activeView === 'RESPONSES'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            data-testid="tab-responses"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Riwayat</span>
            {adoptions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-[10px] text-emerald-700 font-mono">
                {adoptions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:underline">
            Tutup
          </button>
        </div>
      )}

      {/* VIEW 1: INCOMING ACTIONS INBOX */}
      {activeView === 'INBOX' && (
        <div className="space-y-6" data-testid="school-inbox-view">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of Incoming Actions */}
            <div className="lg:col-span-2 space-y-4">
              {actions.map((act) => {
                const existingAdoption = adoptions.find(ad => ad.action_id === act.action_id);
                const isSelected = selectedAction?.action_id === act.action_id;

                return (
                  <div
                    key={act.action_id}
                    className={`bg-white md:border md:rounded-xl border-b border-slate-100 p-4 md:p-5 space-y-2 transition-all w-full overflow-hidden ${
                      isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'md:border-slate-200 md:hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 overflow-hidden">
                      <div className="truncate overflow-hidden min-w-0 flex-1">
                        <CanonicalAnchor
                          actionId={act.action_id}
                          status={act.action_type === 'SUPPORT_INITIATIVE' ? act.support_payload?.support_lifecycle_status || 'DEPLOYED' : act.directive_payload?.directive_lifecycle_status || 'DEPLOYED'}
                          isClosedLoop={!!existingAdoption}
                          actionTitle={act.title}
                        />
                      </div>

                      {existingAdoption ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono shrink-0">
                          {`DIADOPSI`}
                        </span>
                      ) : (
                        <button
                          onClick={() => setSelectedAction(act)}
                          className="px-3 py-1.5 rounded-lg border border-emerald-600 text-emerald-700 md:bg-emerald-600 md:text-white md:border-none md:shadow-xs text-[10px] md:text-xs font-bold transition-colors shrink-0"
                        >
                          Respons Aksi
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {act.policy_intent || act.title}
                    </p>

                    {act.support_payload && (
                      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-600 space-y-1">
                        <div className="font-semibold text-slate-800 text-[11px]">Rincian Fasilitasi Yayasan:</div>
                        <p>{act.support_payload.resource_allocation_details}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {actions.length === 0 && (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
                  Tidak ada aksi atau dukungan aktif yang ditujukan ke unit ini.
                </div>
              )}
            </div>

            {/* Adoption Recording Panel */}
            <div className="lg:col-span-1">
              {selectedAction ? (
                <form onSubmit={handleRecordAdoption} className="bg-white md:border md:border-slate-200 md:rounded-xl p-4 md:p-5 space-y-4 md:shadow-xs w-full pb-32 md:pb-5">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold uppercase">Form Respons Unit</span>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedAction.title}</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status Keputusan Adopsi</label>
                    <select
                      value={adoptionDecision}
                      onChange={e => setAdoptionDecision(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="ACCEPTED">ACCEPTED — Diterima Sesuai Rancangan</option>
                      <option value="MODIFIED_LOCALLY">MODIFIED_LOCALLY — Disesuaikan Konteks TK</option>
                      <option value="DEFERRED">DEFERRED — Ditunda (Semester Depan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Penyesuaian Lokal (Opsional)</label>
                    <textarea
                      rows={2}
                      placeholder="Jelaskan bagaimana dukungan ini diintegrasikan ke jadwal sentra..."
                      value={adaptationNotes}
                      onChange={e => setAdaptationNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Refleksi Kualitatif Lapangan (H-02)
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Pengamatan kualitatif pendidik terhadap interaksi dan perkembangan anak..."
                      value={qualitativeReflection}
                      onChange={e => setQualitativeReflection(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 md:relative md:bottom-auto fixed bottom-32 left-4 right-4 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] md:shadow-none p-3 md:p-0 bg-white md:bg-transparent rounded-2xl md:rounded-none border border-slate-200 md:border-none">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 md:py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl md:rounded-lg text-xs transition-colors shadow-xs"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Kirim Respons Resmi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAction(null)}
                      className="px-4 md:px-3 py-2.5 md:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl md:rounded-lg text-xs font-bold"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 space-y-2">
                  <Sparkles className="w-6 h-6 text-emerald-600 mx-auto" />
                  <div className="font-semibold text-slate-800">Pilih Aksi Dari Inbox</div>
                  <p className="text-slate-500 text-[11px]">
                    Klik tombol "Respons Aksi" pada salah satu inisiatif Yayasan untuk mencatat adopsi dan refleksi lapangan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: UNIT ADOPTION & OUTCOME RESPONSES */}
      {activeView === 'RESPONSES' && (
        <div className="space-y-6" data-testid="school-responses-view">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Riwayat Adopsi &amp; Refleksi Lapangan Unit</h2>
            <div className="space-y-4">
              {adoptions.map((ad) => {
                const matchingOutcomes = outcomes.filter(o => o.action_id === ad.action_id);

                return (
                  <div key={ad.response_id} className="border border-slate-200 rounded-xl p-5 space-y-3 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <CanonicalAnchor
                        actionId={ad.action_id}
                        status={ad.adoption_status}
                        isClosedLoop={matchingOutcomes.length > 0}
                      />
                      <span className="text-[11px] font-mono text-slate-400">
                        Dicatat: {ad.adopted_at}
                      </span>
                    </div>

                    {ad.local_adaptation_notes && (
                      <div className="text-xs text-slate-700 bg-white border border-slate-200 rounded-lg p-3">
                        <strong>Catatan Adaptasi:</strong> {ad.local_adaptation_notes}
                      </div>
                    )}

                    {matchingOutcomes.map((out) => (
                      <NonCausalDelta
                        key={out.outcome_id}
                        baselineValue={out.measurements?.baseline_measurement?.metric_value ?? 62.0}
                        outcomeValue={out.measurements?.evaluation_measurement?.metric_value ?? 74.4}
                        delta={out.measurements?.computed_delta?.absolute_delta ?? 12.4}
                        qualitativeReflection={out.human_reflective_interpretation || 'Refleksi kualitatif keterlibatan belajar anak.'}
                        evaluatedAt={out.recorded_at}
                      />
                    ))}
                  </div>
                );
              })}

              {adoptions.length === 0 && (
                <div className="p-8 text-center text-slate-400 text-xs">
                  Belum ada riwayat adopsi tercatat di unit ini.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
