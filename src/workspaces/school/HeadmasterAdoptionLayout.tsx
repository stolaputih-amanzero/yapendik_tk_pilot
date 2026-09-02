/**
 * Yapendik School OS — The Glass Layer
 * Headmaster Adoption Hub Layout (`/school/adoption/*`)
 * 
 * Unit School Leadership Workspace for contextualizing and adopting Foundation actions.
 * Enforces School Autonomy (FB-03) and Qualitative Human Reflection recording.
 * Canvas-Native Flat Architecture (Hukum F-7 / A-1).
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { db } from '../../db/database';
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
import { SelectSheet, Button } from '../../components/ui';
import { 
  Building2, 
  Inbox, 
  CheckCircle2, 
  RefreshCw, 
  Quote, 
  ShieldCheck, 
  Scale, 
  Sparkles,
  Layers
} from 'lucide-react';
import { HeadmasterBriefing } from '../../components/workspaces/briefing/HeadmasterBriefing';
import { HeadmasterBriefingData } from '../../types/briefingTypes';
import { briefingEngine } from '../../services/BriefingEngine';

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
  const [briefingData, setBriefingData] = useState<HeadmasterBriefingData | null>(null);
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

      const bData = await briefingEngine.getBriefingDataForUser(
        'HEADMASTER',
        schoolId,
        currentPersona?.personId || currentPersona?.id
      );
      setBriefingData(bData as HeadmasterBriefingData);
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
      const adoptionStatus: any = adoptionDecision === 'ACCEPTED' ? 'ADOPTED_IN_PRACTICE' : adoptionDecision === 'MODIFIED_LOCALLY' ? 'ADAPTED_LOCALLY' : 'DEFERRED';
      const adoptionRecord: SchoolAdoptionResponse = {
        response_id: `adp_${schoolId}_${selectedAction.action_id}_${Date.now()}`,
        action_id: selectedAction.action_id,
        action_type: selectedAction.action_type,
        school_id: schoolId,
        headmaster_person_id: currentPersona?.personId || db.getHeadmaster(schoolId)?.id || 'per_headmaster_sheryl',
        headmaster_name: currentPersona?.name || db.getHeadmaster(schoolId)?.fullName || '—',
        adoption_status: adoptionStatus,
        local_context_adaptation_notes: adaptationNotes || 'Adopsi kebijakan sesuai jadwal pembelajaran sentra unit.',
        action_timeline: '2026-08-16 s.d. 2026-11-20',
        acknowledged_at: new Date().toISOString()
      };

      await institutionalLearningService.recordSchoolAdoption(
        adoptionRecord,
        securityContext?.role || currentPersona?.role || 'HEADMASTER'
      );

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
          recorded_by_person_id: currentPersona?.personId || db.getHeadmaster(schoolId)?.id || 'per_headmaster_sheryl',
          recorded_by_name: currentPersona?.name || db.getHeadmaster(schoolId)?.fullName || '—',
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
    <div 
      className="w-full max-w-6xl mx-auto px-4 medium:px-6 pt-4 pb-[160px] space-y-6 animate-in fade-in duration-200 text-ink"
      data-testid="headmaster-adoption-hub"
    >
      {/* Stage 6-A The Warm Briefing Header */}
      {briefingData && (
        <HeadmasterBriefing
          data={briefingData}
          onOpenAuthorityQueue={() => setActiveView('INBOX')}
        />
      )}

      {/* 1. HERO CANVAS (R-1 Hero Canvas) */}
      <header className="space-y-4">
        <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand-deep text-xs font-bold uppercase tracking-wider mb-1">
              <Building2 className="w-4 h-4 text-brand-deep shrink-0" />
              <span>Standar Yayasan • Adopsi Kebijakan Unit</span>
            </div>
            <h1 className="text-[28px] medium:text-3xl font-bold tracking-tight text-ink leading-tight flex items-center gap-2 flex-wrap">
              <span>Adopsi Kebijakan</span>
              <span className="text-xs font-normal text-success-deep flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-success" />
                <span>Otonomi Sekolah (FB-03)</span>
              </span>
            </h1>
            <p className="text-ink-soft text-sm max-w-2xl mt-1">
              Ruang kerja Kepala Sekolah untuk menerima dukungan Yayasan, mencatat penyesuaian lokal, dan merekam refleksi kualitatif dampak pembelajaran.
            </p>
          </div>

          <button
            onClick={refreshData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-subtle hover-only:bg-surface-subtle/80 text-ink-soft border border-line-hairline text-xs font-semibold transition-colors shrink-0 cursor-pointer"
            title="Segarkan Data"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-primary' : ''}`} />
            <span>Segarkan Data</span>
          </button>
        </div>

        {/* 2. NAVIGATION PILLS FLAT (R-2 Kontrol Flat) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2">
          <button
            onClick={() => setActiveView('INBOX')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'INBOX'
                ? 'bg-brand-primary text-on-brand shadow-hairline'
                : 'bg-surface-subtle text-ink-soft hover-only:text-ink border border-line-hairline'
            }`}
            data-testid="tab-inbox"
          >
            <Inbox className="w-4 h-4" />
            <span>Inbox Inisiatif</span>
            {actions.length > 0 && (
              <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
                activeView === 'INBOX'
                  ? 'bg-on-brand/20 text-on-brand'
                  : 'bg-surface-subtle text-ink-soft'
              }`}>
                {actions.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveView('RESPONSES')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeView === 'RESPONSES'
                ? 'bg-brand-primary text-on-brand shadow-hairline'
                : 'bg-surface-subtle text-ink-soft hover-only:text-ink border border-line-hairline'
            }`}
            data-testid="tab-responses"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Riwayat &amp; Refleksi</span>
            {adoptions.length > 0 && (
              <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
                activeView === 'RESPONSES'
                  ? 'bg-on-brand/20 text-on-brand'
                  : 'bg-surface-subtle text-ink-soft'
              }`}>
                {adoptions.length}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Success Notification */}
      {successMessage && (
        <div className="border-l-2 border-success-line pl-3 py-2 space-y-1 text-xs text-success-deep flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-xs underline cursor-pointer">
            Tutup
          </button>
        </div>
      )}

      {/* VIEW 1: INCOMING ACTIONS INBOX (R-3 divide-y) */}
      {activeView === 'INBOX' && (
        <div className="space-y-6" data-testid="school-inbox-view">
          <div className="grid grid-cols-1 expanded:grid-cols-12 gap-8">
            
            {/* List of Incoming Actions (8 Cols) */}
            <div className="expanded:col-span-8 divide-y divide-line border-y border-line">
              {actions.map((act) => {
                const isSelected = selectedAction?.action_id === act.action_id;

                return (
                  <article
                    key={act.action_id}
                    className={`py-5 space-y-3 transition-colors ${
                      isSelected ? 'bg-brand-tint/20 -mx-4 px-4 rounded-xl' : ''
                    }`}
                  >
                    <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 medium:gap-2">
                      <div className="overflow-x-auto min-w-0 w-full medium:w-auto pb-1 -mb-1 scrollbar-hide">
                        <CanonicalAnchor
                          actionId={act.action_id}
                          status={act.action_type === 'SUPPORT_INITIATIVE' ? act.support_payload?.support_lifecycle_status || 'DEPLOYED' : act.directive_payload?.directive_lifecycle_status || 'DEPLOYED'}
                          isClosedLoop={false}
                          actionTitle={act.title}
                        />
                      </div>

                      <Button
                        variant={isSelected ? 'primary' : 'secondary'}
                        size="sm"
                        onClick={() => {
                          setSelectedAction(act);
                          setAdoptionDecision('ACCEPTED');
                          setAdaptationNotes('');
                          setQualitativeReflection('');
                        }}
                        className="rounded-xl text-xs font-bold shrink-0 w-fit"
                      >
                        Respons Aksi
                      </Button>
                    </div>

                    <p className="text-xs medium:text-sm text-ink-soft leading-relaxed font-normal">
                      {act.policy_intent || act.title}
                    </p>

                    {act.support_payload && (
                      <p className="text-xs text-ink-soft pl-3 border-l-2 border-line">
                        <strong className="text-ink">Rincian Fasilitasi Yayasan:</strong> {act.support_payload.resource_allocation_details}
                      </p>
                    )}
                  </article>
                );
              })}

              {actions.length === 0 && (
                <div className="py-12 text-center text-ink-faint text-xs">
                  Tidak ada aksi atau dukungan aktif yang ditujukan ke unit ini.
                </div>
              )}
            </div>

            {/* Adoption Recording Panel (4 Cols) */}
            <div className="expanded:col-span-4">
              {selectedAction ? (
                <form onSubmit={handleRecordAdoption} className="space-y-4 border-l-2 border-brand-primary pl-4">
                  <div className="border-b border-line pb-2">
                    <span className="text-[10px] font-mono text-brand-deep font-semibold uppercase tracking-wider">
                      Form Respons Unit
                    </span>
                    <h3 className="font-bold text-ink text-base mt-0.5">{selectedAction.title}</h3>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-soft mb-1">Status Keputusan Adopsi</label>
                    <SelectSheet 
                      value={adoptionDecision} 
                      onChange={(val) => setAdoptionDecision(val as any)} 
                      options={[
                        { value: "ACCEPTED", label: "Diterima Sesuai Rancangan" }, 
                        { value: "MODIFIED_LOCALLY", label: "Disesuaikan dengan Konteks TK" }, 
                        { value: "DEFERRED", label: "Ditunda (Untuk Semester Depan)" }
                      ]} 
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-ink-soft mb-1">Catatan Penyesuaian Lokal (Opsional)</label>
                    <textarea
                      rows={2}
                      placeholder="Jelaskan bagaimana dukungan ini diintegrasikan ke jadwal sentra..."
                      value={adaptationNotes}
                      onChange={e => setAdaptationNotes(e.target.value)}
                      className="w-full bg-surface-subtle border border-line-hairline rounded-xl p-3 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none"
                    />
                  </div>

                  <div className="space-y-2 pt-2 border-t border-line">
                    <label className="flex items-center gap-1.5 text-xs font-bold text-ink-soft">
                      <ShieldCheck className="w-4 h-4 text-brand-primary" />
                      <span>Refleksi Kualitatif Lapangan (H-02)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Pengamatan kualitatif pendidik terhadap interaksi dan perkembangan anak..."
                      value={qualitativeReflection}
                      onChange={e => setQualitativeReflection(e.target.value)}
                      className="w-full bg-surface-subtle border border-line-hairline rounded-xl p-3 text-xs text-ink placeholder:text-ink-faint focus:outline-none focus:ring-1 focus:ring-brand-primary resize-none"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={isSubmitting}
                      className="flex-1 rounded-xl text-xs font-bold"
                    >
                      {isSubmitting ? 'Menyimpan...' : 'Kirim Respons Resmi'}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedAction(null)}
                      className="rounded-xl text-xs font-bold text-ink-soft"
                    >
                      Batal
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="py-8 text-center text-xs text-ink-soft space-y-2 border-l-2 border-line pl-4">
                  <Sparkles className="w-6 h-6 text-ink-faint mx-auto" />
                  <div className="font-bold text-ink">Pilih Aksi Dari Inbox</div>
                  <p className="text-ink-faint text-[11px]">
                    Klik tombol "Respons Aksi" pada salah satu inisiatif Yayasan untuk mencatat adopsi dan refleksi lapangan.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: UNIT ADOPTION & OUTCOME RESPONSES (R-3 divide-y) */}
      {activeView === 'RESPONSES' && (
        <div className="space-y-6" data-testid="school-responses-view">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <h2 className="text-base font-bold text-ink">Riwayat Adopsi &amp; Refleksi Lapangan Unit</h2>
            <span className="text-xs text-ink-faint font-mono">{adoptions.length} Catatan Tersimpan</span>
          </div>

          <div className="divide-y divide-line border-b border-line">
            {adoptions.map((ad) => {
              const matchingOutcomes = outcomes.filter(o => o.action_id === ad.action_id);
              const formattedDate = (() => {
                if (!ad.adopted_at) return '20 Agustus 2026';
                const d = new Date(ad.adopted_at);
                return isNaN(d.getTime()) ? '20 Agustus 2026' : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
              })();

              return (
                <article key={ad.response_id} className="py-6 space-y-4">
                  <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-2">
                    <div className="overflow-x-auto min-w-0 w-full medium:w-auto pb-1 -mb-1 scrollbar-hide">
                      <CanonicalAnchor
                        actionId={ad.action_id}
                        status={ad.adoption_status}
                        isClosedLoop={matchingOutcomes.length > 0}
                      />
                    </div>
                    <span className="text-xs font-mono text-ink-faint shrink-0">
                      Dicatat: {formattedDate}
                    </span>
                  </div>

                  {ad.local_context_adaptation_notes && (
                    <p className="text-xs text-ink-soft pl-3 border-l-2 border-line">
                      <strong className="font-bold text-ink">Catatan Adaptasi:</strong> {ad.local_context_adaptation_notes}
                    </p>
                  )}

                  {matchingOutcomes.map((out) => (
                    <div key={out.outcome_id} className="pt-2">
                      <NonCausalDelta
                        baselineValue={out.measurements?.baseline_measurement?.metric_value ?? 62.0}
                        outcomeValue={out.measurements?.evaluation_measurement?.metric_value ?? 74.4}
                        delta={out.measurements?.computed_delta?.absolute_delta ?? 12.4}
                        qualitativeReflection={out.human_reflective_interpretation || 'Pengamatan empiris perkembangan siswa teramati secara konsisten.'}
                        evaluatedAt={out.recorded_at}
                      />
                    </div>
                  ))}
                </article>
              );
            })}

            {adoptions.length === 0 && (
              <div className="py-12 text-center text-ink-faint text-xs">
                Belum ada respons atau refleksi adopsi yang dicatat oleh unit sekolah ini.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
