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
  ShieldCheck,
  Scale
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
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Standar Yayasan</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2 flex-wrap">
              <span>Adopsi Kebijakan</span>
              <div className="group relative flex items-center ml-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600/70 hover:text-emerald-700 transition-colors cursor-help" />
                <div className="absolute left-1/2 sm:left-auto sm:right-0 -translate-x-1/2 sm:translate-x-0 top-full mt-2 hidden group-hover:block w-64 p-2.5 bg-slate-900 text-white text-[11px] font-medium leading-relaxed rounded-xl shadow-xl z-50">
                  <div className="absolute -top-1 left-1/2 sm:left-auto sm:right-2 -translate-x-1/2 sm:translate-x-0 w-2 h-2 bg-slate-900 rotate-45"></div>
                  Otonomi Sekolah (FB-03): Kepala Sekolah memiliki hak untuk memodifikasi atau menunda kebijakan Yayasan sesuai konteks lokal.
                </div>
              </div>
            </h1>
            <p className="hidden md:block text-slate-500 text-xs mt-1 max-w-2xl">
              Ruang kerja Kepala Sekolah untuk menerima dukungan Yayasan, mencatat penyesuaian lokal, dan merekam refleksi kualitatif dampak pembelajaran.
            </p>
          </div>

          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors shadow-xs shrink-0 cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Segarkan Data</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mt-6 gap-2 text-xs">
          <button
            onClick={() => setActiveView('INBOX')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative cursor-pointer ${
              activeView === 'INBOX'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            data-testid="tab-inbox"
          >
            <Inbox className="w-4 h-4" />
            <span>Inbox</span>
            {actions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-700 font-mono">
                {actions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('RESPONSES')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative cursor-pointer ${
              activeView === 'RESPONSES'
                ? 'text-slate-900 border-b-2 border-slate-900'
                : 'text-slate-500 hover:text-slate-800'
            }`}
            data-testid="tab-responses"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Riwayat</span>
            {adoptions.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-700 font-mono">
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
        <div className="space-y-6 px-4 sm:px-5 md:px-0" data-testid="school-inbox-view">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List of Incoming Actions */}
            <div className="lg:col-span-2 space-y-4">
              {actions.map((act) => {
                const isSelected = selectedAction?.action_id === act.action_id;
                const canAdopt = true; // Logic assumed

                return (
                  <div
                    key={act.action_id}
                    className={`bg-white border rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs transition-all ${
                      isSelected ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
                      <div className="overflow-x-auto min-w-0 w-full sm:w-auto pb-1 -mb-1 scrollbar-hide">
                        <CanonicalAnchor
                          actionId={act.action_id}
                          status={act.action_type === 'SUPPORT_INITIATIVE' ? act.support_payload?.support_lifecycle_status || 'DEPLOYED' : act.directive_payload?.directive_lifecycle_status || 'DEPLOYED'}
                          isClosedLoop={false}
                        />
                      </div>

                      {canAdopt && (
                        <button
                          onClick={() => {
                            setSelectedAction(act);
                            setAdoptionDecision('ACCEPTED');
                            setAdaptationNotes('');
                            setQualitativeReflection('');
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs text-xs font-bold transition-colors shrink-0 w-fit cursor-pointer"
                        >
                          Respons Aksi
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {act.policy_intent || act.title}
                    </p>

                    {act.support_payload && (
                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs text-slate-600 space-y-1">
                        <div className="font-semibold text-slate-800 text-[11px]">Rincian Fasilitasi Yayasan:</div>
                        <p>{act.support_payload.resource_allocation_details}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {actions.length === 0 && (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs shadow-2xs">
                  Tidak ada aksi atau dukungan aktif yang ditujukan ke unit ini.
                </div>
              )}
            </div>

            {/* Adoption Recording Panel */}
            <div className="lg:col-span-1">
              {selectedAction ? (
                <form onSubmit={handleRecordAdoption} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs w-full pb-32 md:pb-5">
                  <div className="border-b border-slate-100 pb-3">
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold uppercase">Form Respons Unit</span>
                    <h3 className="font-bold text-slate-900 text-sm">{selectedAction.title}</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Status Keputusan Adopsi</label>
                    <select
                      value={adoptionDecision}
                      onChange={e => setAdoptionDecision(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    >
                      <option value="ACCEPTED">Diterima Sesuai Rancangan</option>
                      <option value="MODIFIED_LOCALLY">Disesuaikan dengan Konteks TK</option>
                      <option value="DEFERRED">Ditunda (Untuk Semester Depan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Catatan Penyesuaian Lokal (Opsional)</label>
                    <textarea
                      rows={2}
                      placeholder="Jelaskan bagaimana dukungan ini diintegrasikan ke jadwal sentra..."
                      value={adaptationNotes}
                      onChange={e => setAdaptationNotes(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    />
                  </div>

                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <span>Refleksi Kualitatif Lapangan</span>
                      <div className="group relative flex items-center">
                        <ShieldCheck className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600 cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-slate-900 text-white text-[10px] font-medium leading-relaxed rounded-lg shadow-xl z-50">
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 rotate-45"></div>
                          Invarian H-02: Memastikan setiap angka perubahan selalu didampingi oleh refleksi kualitatif dari pendidik (human-in-the-loop).
                        </div>
                      </div>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Pengamatan kualitatif pendidik terhadap interaksi dan perkembangan anak..."
                      value={qualitativeReflection}
                      onChange={e => setQualitativeReflection(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 md:relative md:bottom-auto fixed bottom-32 left-4 right-4 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] md:shadow-none p-3 md:p-0 bg-white md:bg-transparent rounded-2xl md:rounded-none border border-slate-200 md:border-none">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2.5 md:py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl md:rounded-lg text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Kirim Respons Resmi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAction(null)}
                      className="px-4 md:px-3 py-2.5 md:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl md:rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-center text-xs text-slate-500 space-y-2 shadow-2xs">
                  <Sparkles className="w-6 h-6 text-slate-400 mx-auto" />
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
        <div className="space-y-4 px-4 sm:px-5 md:px-0" data-testid="school-responses-view">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">Riwayat Adopsi &amp; Refleksi Lapangan Unit</h2>
            <span className="text-xs text-slate-500 font-medium">{adoptions.length} Catatan Tersimpan</span>
          </div>

          <div className="space-y-4">
            {adoptions.map((ad) => {
              const matchingOutcomes = outcomes.filter(o => o.action_id === ad.action_id);
              const formattedDate = (() => {
                if (!ad.adopted_at) return '20 Agustus 2026';
                const d = new Date(ad.adopted_at);
                return isNaN(d.getTime()) ? '20 Agustus 2026' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
              })();

              return (
                <div key={ad.response_id} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2">
                    <div className="overflow-x-auto min-w-0 w-full sm:w-auto pb-1 -mb-1 scrollbar-hide">
                      <CanonicalAnchor
                        actionId={ad.action_id}
                        status={ad.adoption_status}
                        isClosedLoop={matchingOutcomes.length > 0}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      Dicatat: {formattedDate}
                    </span>
                  </div>

                  {ad.local_context_adaptation_notes && (
                    <div className="text-xs text-slate-700 bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <strong className="font-semibold text-slate-900">Catatan Adaptasi:</strong> {ad.local_context_adaptation_notes}
                    </div>
                  )}

                  {matchingOutcomes.map((out) => (
                    <div key={out.outcome_id} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5 uppercase text-[11px] tracking-wider">
                          <Scale className="w-3.5 h-3.5 text-slate-500" />
                          <span>Dinamika Capaian Teramati</span>
                        </div>
                        {out.measurements?.computed_delta?.percentage_change_pct !== undefined && (
                          <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ↗ Δ +{out.measurements.computed_delta.percentage_change_pct.toFixed(1)}%
                          </span>
                        )}
                      </div>

                      {out.measurements?.baseline_measurement?.metric_value !== undefined && out.measurements?.evaluation_measurement?.metric_value !== undefined && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-white border border-slate-200/70 rounded-xl text-center shadow-2xs">
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Baseline</span>
                            <span className="font-bold text-slate-900 text-sm">{out.measurements.baseline_measurement.metric_value.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">Pasca-Aksi</span>
                            <span className="font-bold text-slate-900 text-sm">{out.measurements.evaluation_measurement.metric_value.toFixed(1)}%</span>
                          </div>
                        </div>
                      )}

                      {out.human_reflective_interpretation && (
                        <div className="p-3 bg-white border-l-2 border-l-amber-500 border border-slate-200/70 rounded-xl space-y-1 shadow-2xs">
                          <div className="text-[10px] font-bold text-slate-700 flex items-center gap-1">
                            <Quote className="w-3 h-3 text-amber-600" />
                            <span>Refleksi Kualitatif Pendidik / Kepala Sekolah:</span>
                          </div>
                          <p className="text-slate-800 italic font-medium leading-relaxed">
                            "{out.human_reflective_interpretation}"
                          </p>
                          <div className="text-[10px] text-slate-400 text-right">
                            Dicatat pada: {new Date(out.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-1.5 text-[10px] text-slate-500 leading-normal pt-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>
                          <strong>Catatan Pengamatan:</strong> Angka kenaikan persentase ini adalah hasil pengamatan di lapangan, bukan bukti mutlak bahwa kebijakan tersebut adalah satu-satunya penyebab perubahan.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}

            {adoptions.length === 0 && (
              <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs shadow-2xs">
                Belum ada respons atau refleksi adopsi yang dicatat oleh unit sekolah ini.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
