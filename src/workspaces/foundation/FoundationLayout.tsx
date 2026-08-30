/**
 * Yapendik School OS — The Glass Layer
 * Foundation Governance Workspace Layout (`/foundation/*`)
 * 
 * Executive Stewardship Console for Foundation Directors, Trustees, and Superadmins.
 * Enforces Zero-PII Projections, K-Anonymity (FB-07), and Mutation Hard Block (FB-06).
 * Canvas-Native Flat Architecture (Hukum F-7 / A-3).
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { institutionalLearningService } from '../../services/institutionalLearningService';
import { 
  DerivedAnalyticalPattern, 
  InstitutionalInsight, 
  InstitutionalActionRecord,
  SchoolAdoptionResponse,
  ObservedOutcomeEffect 
} from '../../types/institutionalLearningTypes';
import { 
  CanonicalAnchor, 
  NonCausalDelta, 
  ForbiddenActionGate 
} from '../../components/glass';
import { 
  Building2, 
  ShieldCheck, 
  BarChart3, 
  Lightbulb, 
  FileText, 
  CheckCircle2, 
  RefreshCw
} from 'lucide-react';
import { FoundationBriefing } from '../../components/workspaces/briefing/FoundationBriefing';
import { FoundationBriefingData } from '../../types/briefingTypes';
import { briefingEngine } from '../../services/BriefingEngine';

export type FoundationView = 'PROJECTIONS' | 'INSIGHTS' | 'ACTIONS';

export interface FoundationLayoutProps {
  initialView?: FoundationView;
}

export const FoundationLayout: React.FC<FoundationLayoutProps> = ({ initialView = 'PROJECTIONS' }) => {
  const context = useSecurityContext();
  const currentPersona = context?.currentPersona;
  const [activeView, setActiveView] = useState<FoundationView>(initialView);
  const [patterns, setPatterns] = useState<DerivedAnalyticalPattern[]>([]);
  const [insights, setInsights] = useState<InstitutionalInsight[]>(() => institutionalLearningService.listInsights());
  const [actions, setActions] = useState<InstitutionalActionRecord[]>(() => institutionalLearningService.listActions());
  const [adoptions, setAdoptions] = useState<SchoolAdoptionResponse[]>(() => institutionalLearningService.listAdoptions());
  const [outcomes, setOutcomes] = useState<ObservedOutcomeEffect[]>(() => institutionalLearningService.listOutcomes());
  const [briefingData, setBriefingData] = useState<FoundationBriefingData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Closed-loop status mapping
  const [closedLoopStatus, setClosedLoopStatus] = useState<Record<string, boolean>>({});

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const pList = await institutionalLearningService.deriveCurriculumDomainDistribution('ay_2026_2027');
      const iList = institutionalLearningService.listInsights();
      const aList = institutionalLearningService.listActions();

      const bData = await briefingEngine.getBriefingDataForUser(
        'FOUNDATION',
        'sch_tk_yapendik_01',
        currentPersona?.personId
      );
      setBriefingData(bData as FoundationBriefingData);
      const adList = institutionalLearningService.listAdoptions();
      const oList = institutionalLearningService.listOutcomes();

      setPatterns(pList);
      setInsights(iList);
      setActions(aList);
      setAdoptions(adList);
      setOutcomes(oList);

      // Verify closed-loop status for each action
      const loopMap: Record<string, boolean> = {};
      for (const act of aList) {
        const loopRes = await institutionalLearningService.verifyClosedLoopCondition(act.action_id);
        loopMap[act.action_id] = loopRes.is_closed_loop;
      }
      setClosedLoopStatus(loopMap);
    } catch (err) {
      console.error('Failed to load foundation governance data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <ForbiddenActionGate>
      <div 
        className="w-full max-w-6xl mx-auto px-4 medium:px-6 pt-4 pb-[160px] space-y-6 animate-in fade-in duration-200 text-ink"
        data-testid="foundation-governance-console"
      >
        {/* Stage 6-A The Warm Briefing Header */}
        {briefingData && (
          <FoundationBriefing
            data={briefingData}
            onOpenInsightsConsole={() => setActiveView('INSIGHTS')}
          />
        )}

        {/* 1. HERO CANVAS (Hukum F-7: R-1 Hero Canvas tanpa panel pembungkus) */}
        <header className="space-y-4">
          <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-brand-deep text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4 text-brand-deep shrink-0" />
                <span>Standar Yayasan • Tata Kelola Multi-Unit</span>
              </div>
              <h1 className="text-[28px] medium:text-3xl font-bold tracking-tight text-ink leading-tight">
                Pusat Kebijakan Yayasan
              </h1>
              <p className="text-ink-soft text-sm max-w-2xl mt-1">
                Proyeksi agregat capaian lintas unit TK, telaah pola pembelajaran, dan penerbitan dukungan kebijakan berkesinambungan.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-subtle hover-only:bg-surface-subtle/80 text-ink-soft border border-line-hairline text-xs font-semibold transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-primary' : ''}`} />
                <span>Segarkan Data</span>
              </button>

              <div className="bg-surface-subtle border border-line-hairline px-3 py-1 rounded-xl text-right">
                <div className="text-[10px] text-ink-faint font-mono uppercase tracking-wider font-bold whitespace-nowrap">
                  Pengawas Yayasan
                </div>
                <div className="text-xs font-bold text-ink">
                  {currentPersona?.name || 'Superadmin Yayasan'}
                </div>
              </div>
            </div>
          </div>

          {/* 2. NAVIGATION PILLS FLAT (R-2 Kontrol Flat) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-2">
            <button
              onClick={() => setActiveView('PROJECTIONS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'PROJECTIONS'
                  ? 'bg-brand-primary text-on-brand shadow-hairline'
                  : 'bg-surface-subtle text-ink-soft hover-only:text-ink border border-line-hairline'
              }`}
              data-testid="tab-projections"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Proyeksi Multi-Unit</span>
            </button>

            <button
              onClick={() => setActiveView('INSIGHTS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'INSIGHTS'
                  ? 'bg-brand-primary text-on-brand shadow-hairline'
                  : 'bg-surface-subtle text-ink-soft hover-only:text-ink border border-line-hairline'
              }`}
              data-testid="tab-insights"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Wawasan &amp; Pola Belajar</span>
            </button>

            <button
              onClick={() => setActiveView('ACTIONS')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeView === 'ACTIONS'
                  ? 'bg-brand-primary text-on-brand shadow-hairline'
                  : 'bg-surface-subtle text-ink-soft hover-only:text-ink border border-line-hairline'
              }`}
              data-testid="tab-actions"
            >
              <FileText className="w-4 h-4" />
              <span>Inisiatif &amp; Aksi Yayasan</span>
              {actions.length > 0 && (
                <span className={`px-2 py-1 rounded-full text-[10px] font-mono font-bold whitespace-nowrap ${
                  activeView === 'ACTIONS'
                    ? 'bg-on-brand/20 text-on-brand'
                    : 'bg-surface-subtle text-ink-soft'
                }`}>
                  {actions.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* VIEW 1: MULTI-SCHOOL PROJECTIONS (R-3 & R-4) */}
        {activeView === 'PROJECTIONS' && (
          <div className="space-y-6" data-testid="foundation-projections-view">
            {/* Jaminan Privasi (R-4 Footnote Etis) */}
            <div className="border-l-2 border-info-line pl-3 py-1 space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-ink text-xs">
                <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
                <span>Jaminan Privasi &amp; Agregasi Multi-Unit (Invarian FB-01 &amp; FB-07)</span>
              </div>
              <p className="text-ink-soft leading-relaxed text-xs">
                Data yang disajikan adalah agregat statistik Kurikulum Merdeka TK tingkat gugus unit. Seluruh identitas individual siswa diredaksi secara otomatis demi menjaga etika pengamatan dan privasi anak.
              </p>
            </div>

            {/* Aggregated Domain Telemetry (R-3 divide-y di canvas) */}
            <div className="divide-y divide-line border-y border-line">
              {patterns.map((pat) => (
                <article 
                  key={pat.pattern_id}
                  className="py-5 space-y-3"
                  data-testid="pattern-telemetry-card"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-wider px-3 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line-hairline font-bold whitespace-nowrap">
                        {pat.curriculum_domain}
                      </span>
                      <h3 className="font-bold text-ink text-base pt-1">
                        {pat.pattern_name}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-success-deep bg-success-tint px-3 py-1 rounded-full border border-success-line whitespace-nowrap">
                      {pat.statistical_significance || 'Signifikan'}
                    </span>
                  </div>

                  <p className="text-xs medium:text-sm text-ink-soft leading-relaxed">
                    {pat.description || 'Pola capaian teramati pada kelompok kegiatan main bermakna.'}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-xs text-ink-faint font-mono">
                    <span>Sampel: {pat.sample_size_classes || 3} Rombel</span>
                    <span>Tingkat Kepastian: {pat.confidence_score ? `${(pat.confidence_score * 100).toFixed(0)}%` : '95%'}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: PATTERN & INSIGHT STUDIO (R-3 divide-y) */}
        {activeView === 'INSIGHTS' && (
          <div className="space-y-6" data-testid="foundation-insights-view">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h2 className="text-base font-bold text-ink">Temuan Analitis &amp; Keputusan Yayasan</h2>
                <p className="text-xs text-ink-soft mt-0.5">Daftar wawasan pembelajaran lintas unit yang memerlukan fasilitasi kelembagaan.</p>
              </div>
              <span className="text-xs text-ink-faint font-mono">{insights.length} Temuan</span>
            </div>

            <div className="divide-y divide-line border-b border-line">
              {insights.map((ins) => (
                <article 
                  key={ins.insight_id}
                  className="py-5 space-y-3"
                >
                  <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink whitespace-nowrap">{ins.insight_id}</span>
                        <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold bg-info-tint text-info-deep border border-info-line whitespace-nowrap">
                          {ins.curriculum_domain}
                        </span>
                      </div>
                      <h4 className="font-bold text-ink text-base">{ins.title}</h4>
                      <p className="text-xs medium:text-sm text-ink-soft leading-relaxed">{ins.narrative_summary}</p>
                    </div>

                    {ins.decision_record && (
                      <div className="text-right shrink-0 flex items-center gap-2">
                        {ins.decision_record.decision_id && (
                          <span className="font-mono text-[10px] text-ink-faint">
                            {ins.decision_record.decision_id}
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-info-tint text-info-deep border border-info-line text-[10px] font-bold font-mono whitespace-nowrap">
                          DISETUJUI DEWAN
                        </span>
                      </div>
                    )}
                  </div>

                  {ins.decision_record && (
                    <div className="border-l-2 border-brand-primary/40 pl-3 py-1 space-y-1 text-xs">
                      <div className="font-bold text-ink text-xs flex items-center gap-1.5">
                        <Lightbulb className="w-4 h-4 text-brand-primary shrink-0" />
                        <span>Rekomendasi Keputusan Dewan Yayasan:</span>
                      </div>
                      <p className="text-ink-soft">{ins.decision_record.recommended_action_type} • {ins.decision_record.governance_notes}</p>
                    </div>
                  )}
                </article>
              ))}

              {insights.length === 0 && (
                <div className="py-12 text-center text-ink-faint text-xs">
                  Belum ada temuan analitis baru pada periode ini.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: ACTION LEDGER & CLOSED-LOOP TRACKER (R-3 divide-y & R-5 Timeline Stepper) */}
        {activeView === 'ACTIONS' && (
          <div className="space-y-6" data-testid="foundation-actions-view">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <h2 className="text-base font-bold text-ink">Buku Besar Inisiatif &amp; Evaluasi Aksi Yayasan</h2>
                <p className="text-xs text-ink-soft mt-0.5">Pelacakan siklus hidup kebijakan dari penerbitan hingga evaluasi dampak nyata di unit TK.</p>
              </div>
              <span className="text-xs text-ink-faint font-mono">{actions.length} Inisiatif</span>
            </div>

            {/* Actions List (divide-y divide-line) */}
            <div className="divide-y divide-line border-b border-line">
              {actions.map((act) => {
                const isClosed = closedLoopStatus[act.action_id] || false;
                const matchingAdoptions = adoptions.filter(ad => ad.action_id === act.action_id);
                const matchingOutcomes = outcomes.filter(o => o.action_id === act.action_id);

                return (
                  <article 
                    key={act.action_id}
                    className="py-6 space-y-4"
                    data-testid="action-ledger-item"
                  >
                    {/* Header with CanonicalAnchor */}
                    <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 medium:gap-2">
                      <div className="overflow-x-auto min-w-0 w-full medium:w-auto pb-1 -mb-1 scrollbar-hide">
                        <CanonicalAnchor
                          actionId={act.action_id}
                          status={act.support_payload?.support_lifecycle_status || act.directive_payload?.directive_lifecycle_status || 'DEPLOYED'}
                          isClosedLoop={isClosed}
                          actionTitle={act.title}
                        />
                      </div>
                      <span className="text-xs font-mono text-ink-faint shrink-0 whitespace-nowrap">
                        {`Cakupan: ${typeof act.target_scope === 'string' ? act.target_scope : 'Semua Unit TK'}`}
                      </span>
                    </div>

                    {/* Summary & Rationale */}
                    <div className="text-xs space-y-1.5">
                      <p className="font-medium text-ink text-sm">{act.policy_intent || act.title}</p>
                      {act.action_type === 'SUPPORT_INITIATIVE' && act.support_payload && (
                        <p className="text-ink-soft pl-3 border-l-2 border-line">
                          <strong className="text-ink">Fasilitasi Yayasan:</strong> {act.support_payload.resource_allocation_details}
                        </p>
                      )}
                    </div>

                    {/* Closed-Loop Visualizer Stepper (R-5 Timeline Stepper langsung di canvas) */}
                    <div className="space-y-3 pt-1" data-testid="closed-loop-stepper">
                      <div className="text-xs font-bold text-ink uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
                        <span>Siklus Evaluasi Pertanggungjawaban Kebijakan</span>
                        {isClosed ? (
                          <span className="text-success-deep font-bold flex items-center gap-1 text-xs bg-success-tint px-3 py-1 rounded-full border border-success-line">
                            <CheckCircle2 className="w-4 h-4 text-success" /> SIKLUS TERTUTUP LENGKAP
                          </span>
                        ) : (
                          <span className="text-warning-deep font-semibold text-xs bg-warning-tint px-3 py-1 rounded-full border border-warning-line">
                            Menunggu Adopsi / Pengamatan Lapangan
                          </span>
                        )}
                      </div>

                      {/* Stepper Timeline Bar */}
                      <div className="grid grid-cols-2 medium:grid-cols-4 gap-2 text-center text-xs font-mono pt-1 whitespace-nowrap">
                        <div className="p-3 rounded-xl bg-success-tint border border-success-line text-success-deep font-bold shadow-hairline">
                          1. Diterbitkan Yayasan
                        </div>
                        <div className="p-3 rounded-xl bg-success-tint border border-success-line text-success-deep font-bold shadow-hairline">
                          2. Dikirim ke Unit TK
                        </div>
                        <div className={`p-3 rounded-xl border font-bold shadow-hairline ${
                          matchingAdoptions.length > 0
                            ? 'bg-success-tint border-success-line text-success-deep'
                            : 'bg-surface-subtle border-line text-ink-faint'
                        }`}>
                          {`3. Diadopsi Sekolah (${matchingAdoptions.length})`}
                        </div>
                        <div className={`p-3 rounded-xl border font-bold shadow-hairline ${
                          matchingOutcomes.length > 0
                            ? 'bg-success-tint border-success-line text-success-deep'
                            : 'bg-surface-subtle border-line text-ink-faint'
                        }`}>
                          {`4. Dampak Terukur (${matchingOutcomes.length})`}
                        </div>
                      </div>
                    </div>

                    {/* NonCausalDelta Render for Measured Outcomes */}
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

              {actions.length === 0 && (
                <div className="py-12 text-center text-ink-faint text-xs">
                  Belum ada inisiatif kebijakan yang diterbitkan oleh Yayasan.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </ForbiddenActionGate>
  );
};
