import { SelectSheet } from '../../components/ui';
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
    <div className="space-y-6 medium:space-y-6 w-full pb-[132px] expanded:pb-8" data-testid="headmaster-adoption-hub">
      {/* Workspace Header */}
      <div className="bg-surface-subtle border-b border-line medium:rounded-card px-4 py-5 medium:p-6 w-full text-ink medium:border medium:shadow-hairline">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-success text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4" />
              <span>Standar Yayasan</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2 flex-wrap">
              <span>Adopsi Kebijakan</span>
              <div className="group relative flex items-center ml-1">
                <ShieldCheck className="w-4 h-4 text-success/70 hover-only:text-success-deep transition-colors cursor-help" />
                <div className="absolute left-1/2 medium:left-auto medium:right-0 -translate-x-1/2 medium:translate-x-0 top-full mt-2 hidden group-hover:block w-64 p-2 bg-brand text-on-brand text-[11px] font-medium leading-relaxed rounded-field shadow-floating z-50">
                  <div className="absolute -top-1 left-1/2 medium:left-auto medium:right-2 -translate-x-1/2 medium:translate-x-0 w-2 h-2 bg-brand rotate-45"></div>
                  Otonomi Sekolah (FB-03): Kepala Sekolah memiliki hak untuk memodifikasi atau menunda kebijakan Yayasan sesuai konteks lokal.
                </div>
              </div>
            </h1>
            <p className="hidden expanded:block text-ink-soft text-xs mt-1 max-w-2xl">
              Ruang kerja Kepala Sekolah untuk menerima dukungan Yayasan, mencatat penyesuaian lokal, dan merekam refleksi kualitatif dampak pembelajaran.
            </p>
          </div>

          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 p-2 medium:px-3 medium:py-1 rounded-lg bg-surface hover-only:bg-surface-subtle text-ink-soft border border-line text-xs font-medium transition-colors shadow-hairline shrink-0 cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 medium:w-3.5 medium:h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden medium:inline">Segarkan Data</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-line mt-6 gap-2 text-xs">
          <button
            onClick={() => setActiveView('INBOX')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative cursor-pointer ${
              activeView === 'INBOX'
                ? 'text-ink border-b-2 border-brand'
                : 'text-ink-soft hover-only:text-ink'
            }`}
            data-testid="tab-inbox"
          >
            <Inbox className="w-4 h-4" />
            <span>Inbox</span>
            {actions.length > 0 && (
              <span className="px-1 py-0 rounded-full bg-surface-subtle text-[10px] text-ink-soft font-mono whitespace-nowrap">
                {actions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('RESPONSES')}
            className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative cursor-pointer ${
              activeView === 'RESPONSES'
                ? 'text-ink border-b-2 border-brand'
                : 'text-ink-soft hover-only:text-ink'
            }`}
            data-testid="tab-responses"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Riwayat</span>
            {adoptions.length > 0 && (
              <span className="px-1 py-0 rounded-full bg-surface-subtle text-[10px] text-ink-soft font-mono whitespace-nowrap">
                {adoptions.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="p-4 bg-success-tint border border-success-line rounded-field text-success-deep text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-success hover-only:underline">
            Tutup
          </button>
        </div>
      )}

      {/* VIEW 1: INCOMING ACTIONS INBOX */}
      {activeView === 'INBOX' && (
        <div className="space-y-6 px-4 medium:px-5 medium:px-0" data-testid="school-inbox-view">
          <div className="grid grid-cols-1 expanded:grid-cols-3 gap-6">
            {/* List of Incoming Actions */}
            <div className="expanded:col-span-2 space-y-4">
              {actions.map((act) => {
                const isSelected = selectedAction?.action_id === act.action_id;
                const canAdopt = true; // Logic assumed

                return (
                  <div
                    key={act.action_id}
                    className={`bg-surface border rounded-card p-4 medium:p-4 space-y-3.5 shadow-hairline transition-all ${
                      isSelected ? 'border-brand ring-2 ring-brass/30' : 'border-line'
                    }`}
                  >
                    <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 medium:gap-2">
                      <div className="overflow-x-auto min-w-0 w-full medium:w-auto pb-1 -mb-1 scrollbar-hide [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]">
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
                          className="px-3 py-1 rounded-field bg-brand hover-only:bg-surface-inset text-on-brand shadow-hairline text-xs font-bold transition-colors shrink-0 w-fit cursor-pointer"
                        >
                          Respons Aksi
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-ink-soft leading-relaxed font-medium">
                      {act.policy_intent || act.title}
                    </p>

                    {act.support_payload && (
                      <div className="bg-surface-subtle border border-line-soft rounded-field p-3 text-xs text-ink-soft space-y-1">
                        <div className="font-semibold text-ink text-[11px]">Rincian Fasilitasi Yayasan:</div>
                        <p>{act.support_payload.resource_allocation_details}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {actions.length === 0 && (
                <div className="p-8 text-center bg-surface border border-line rounded-card text-ink-faint text-xs shadow-hairline">
                  Tidak ada aksi atau dukungan aktif yang ditujukan ke unit ini.
                </div>
              )}
            </div>

            {/* Adoption Recording Panel */}
            <div className="expanded:col-span-1">
              {selectedAction ? (
                <form onSubmit={handleRecordAdoption} className="bg-surface border border-line rounded-card p-4 medium:p-4 space-y-4 shadow-hairline w-full pb-32 medium:pb-5">
                  <div className="border-b border-line-soft pb-3">
                    <span className="text-[10px] font-mono text-success-deep font-semibold uppercase tracking-wider whitespace-nowrap">Form Respons Unit</span>
                    <h3 className="font-bold text-ink text-sm">{selectedAction.title}</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Status Keputusan Adopsi</label>
                    <SelectSheet value={adoptionDecision} onChange={(val) => setAdoptionDecision(val as any)} options={[{ value: "ACCEPTED", label: "Diterima Sesuai Rancangan" }, { value: "MODIFIED_LOCALLY", label: "Disesuaikan dengan Konteks TK" }, { value: "DEFERRED", label: "Ditunda (Untuk Semester Depan)" }]} />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-ink-soft mb-1">Catatan Penyesuaian Lokal (Opsional)</label>
                    <textarea
                      rows={2}
                      placeholder="Jelaskan bagaimana dukungan ini diintegrasikan ke jadwal sentra..."
                      value={adaptationNotes}
                      onChange={e => setAdaptationNotes(e.target.value)}
                      className="w-full bg-surface-subtle border border-line rounded-field p-2 text-xs text-ink focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brass/30 shadow-hairline"
                    />
                  </div>

                  <div className="pt-3 border-t border-line-soft space-y-2">
                    <label className="flex items-center gap-2 text-xs font-semibold text-ink-soft">
                      <span>Refleksi Kualitatif Lapangan</span>
                      <div className="group relative flex items-center">
                        <ShieldCheck className="w-4 h-4 text-ink-faint hover-only:text-ink-soft cursor-help" />
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-56 p-2 bg-brand text-on-brand text-[10px] font-medium leading-relaxed rounded-lg shadow-floating z-50">
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-brand rotate-45"></div>
                          Invarian H-02: Memastikan setiap angka perubahan selalu didampingi oleh refleksi kualitatif dari pendidik (human-in-the-loop).
                        </div>
                      </div>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Pengamatan kualitatif pendidik terhadap interaksi dan perkembangan anak..."
                      value={qualitativeReflection}
                      onChange={e => setQualitativeReflection(e.target.value)}
                      className="w-full bg-surface-subtle border border-line rounded-field p-2 text-xs text-ink focus:bg-surface focus:outline-none focus:ring-2 focus:ring-brass/30 shadow-hairline"
                    />
                  </div>

                  <div className="flex gap-2 pt-2 expanded:relative expanded:bottom-auto fixed bottom-32 left-4 right-4 z-40 shadow-[0_-4px_16px_rgba(0,0,0,0.1)] medium:shadow-none p-3 medium:p-0 bg-surface expanded:bg-transparent rounded-card medium:rounded-none border border-line medium:border-none">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 py-2 medium:py-2 bg-brand hover-only:bg-surface-inset text-on-brand font-bold rounded-field medium:rounded-lg text-xs transition-colors shadow-hairline cursor-pointer"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Kirim Respons Resmi'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedAction(null)}
                      className="px-4 medium:px-3 py-2 medium:py-2 bg-surface-subtle hover-only:bg-line-soft text-ink-soft rounded-field medium:rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-6 bg-surface-subtle border border-line rounded-card text-center text-xs text-ink-soft space-y-2 shadow-hairline">
                  <Sparkles className="w-6 h-6 text-ink-faint mx-auto" />
                  <div className="font-semibold text-ink">Pilih Aksi Dari Inbox</div>
                  <p className="text-ink-soft text-[11px]">
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
        <div className="space-y-4 px-4 medium:px-5 medium:px-0" data-testid="school-responses-view">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-sm medium:text-base font-bold text-ink">Riwayat Adopsi &amp; Refleksi Lapangan Unit</h2>
            <span className="text-xs text-ink-soft font-medium">{adoptions.length} Catatan Tersimpan</span>
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
                <div key={ad.response_id} className="bg-surface border border-line rounded-card p-4 medium:p-4 space-y-3.5 shadow-hairline">
                  <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 medium:gap-2">
                    <div className="overflow-x-auto min-w-0 w-full medium:w-auto pb-1 -mb-1 scrollbar-hide [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]">
                      <CanonicalAnchor
                        actionId={ad.action_id}
                        status={ad.adoption_status}
                        isClosedLoop={matchingOutcomes.length > 0}
                      />
                    </div>
                    <span className="text-[11px] text-ink-faint shrink-0">
                      Dicatat: {formattedDate}
                    </span>
                  </div>

                  {ad.local_context_adaptation_notes && (
                    <div className="text-xs text-ink-soft bg-surface-subtle border border-line-soft rounded-field p-3">
                      <strong className="font-semibold text-ink">Catatan Adaptasi:</strong> {ad.local_context_adaptation_notes}
                    </div>
                  )}

                  {matchingOutcomes.map((out) => (
                    <div key={out.outcome_id} className="p-4 bg-surface-subtle/70 border border-line/80 rounded-field space-y-3 text-xs">
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-ink flex items-center gap-2 uppercase text-[11px] tracking-wider">
                          <Scale className="w-4 h-4 text-ink-soft" />
                          <span>Dinamika Capaian Teramati</span>
                        </div>
                        {out.measurements?.computed_delta?.percentage_change_pct !== undefined && (
                          <span className="px-2 py-1 rounded-full text-[11px] font-bold bg-success-tint text-success-deep border border-success-line">
                            ↗ Δ +{out.measurements.computed_delta.percentage_change_pct.toFixed(1)}%
                          </span>
                        )}
                      </div>

                      {out.measurements?.baseline_measurement?.metric_value !== undefined && out.measurements?.evaluation_measurement?.metric_value !== undefined && (
                        <div className="grid grid-cols-2 gap-4 p-3 bg-surface border border-line/70 rounded-field text-center shadow-hairline">
                          <div>
                            <span className="text-[10px] text-ink-faint uppercase tracking-wider font-bold block">Baseline</span>
                            <span className="font-bold text-ink text-sm">{out.measurements.baseline_measurement.metric_value.toFixed(1)}%</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-ink-faint uppercase tracking-wider font-bold block">Pasca-Aksi</span>
                            <span className="font-bold text-ink text-sm">{out.measurements.evaluation_measurement.metric_value.toFixed(1)}%</span>
                          </div>
                        </div>
                      )}

                      {out.human_reflective_interpretation && (
                        <div className="p-3 bg-surface border-l-2 border-l-amber-500 border border-line/70 rounded-field space-y-1 shadow-hairline">
                          <div className="text-[10px] font-bold text-ink-soft flex items-center gap-1">
                            <Quote className="w-3 h-3 text-brass" />
                            <span>Refleksi Kualitatif Pendidik / Kepala Sekolah:</span>
                          </div>
                          <p className="text-ink italic font-medium leading-relaxed">
                            "{out.human_reflective_interpretation}"
                          </p>
                          <div className="text-[10px] text-ink-faint text-right">
                            Dicatat pada: {new Date(out.recorded_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-2 text-[10px] text-ink-soft leading-normal pt-1">
                        <Sparkles className="w-4 h-4 text-brass shrink-0 mt-0.5" />
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
              <div className="p-8 text-center bg-surface border border-line rounded-card text-ink-faint text-xs shadow-hairline">
                Belum ada respons atau refleksi adopsi yang dicatat oleh unit sekolah ini.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
