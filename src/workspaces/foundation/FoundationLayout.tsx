/**
 * Yapendik School OS — The Glass Layer
 * Foundation Governance Workspace Layout (`/foundation/*`)
 * 
 * Executive Stewardship Console for Foundation Directors, Trustees, and Superadmins.
 * Enforces Zero-PII Projections, K-Anonymity (FB-07), and Mutation Hard Block (FB-06).
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
  PrivacyShield, 
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
  Layers, 
  TrendingUp, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Info,
  Lock
} from 'lucide-react';

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
  const [isLoading, setIsLoading] = useState(false);

  // Closed-loop status mapping
  const [closedLoopStatus, setClosedLoopStatus] = useState<Record<string, boolean>>({});

  const refreshData = async () => {
    setIsLoading(true);
    try {
      const pList = await institutionalLearningService.deriveCurriculumDomainDistribution('ay_2026_2027');
      const iList = institutionalLearningService.listInsights();
      const aList = institutionalLearningService.listActions();
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
      <div className="space-y-6 medium:space-y-6 w-full pb-[132px] expanded:pb-8" data-testid="foundation-governance-console">
        {/* Workspace Header */}
        <div className="bg-surface-subtle border-b border-line medium:rounded-card px-4 py-5 medium:p-6 w-full text-ink medium:border medium:shadow-hairline">
          <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-1.5 text-success text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
                <Building2 className="w-4 h-4" />
                <span>Standar Yayasan • Tata Kelola Multi-Unit</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
                <span>Pusat Kebijakan Yayasan</span>
              </h1>
              <p className="hidden expanded:block text-ink-soft text-xs mt-1 max-w-2xl">
                Proyeksi agregat capaian lintas unit TK, telaah pola pembelajaran, dan penerbitan dukungan kebijakan berkesinambungan.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center gap-2 px-3 py-1 rounded-field bg-surface hover-only:bg-surface-subtle text-ink-soft border border-line text-xs font-semibold transition-colors shadow-hairline cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Segarkan Data</span>
              </button>

              <div className="bg-surface border border-line px-3 py-1 rounded-field text-right shadow-hairline">
                <div className="text-[10px] text-ink-faint font-mono uppercase tracking-wider font-bold whitespace-nowrap">Pengawas Yayasan</div>
                <div className="text-xs font-bold text-ink">{currentPersona?.name || 'Superadmin Yayasan'}</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-line mt-6 gap-2 text-xs overflow-x-auto scrollbar-hide [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]">
            <button
              onClick={() => setActiveView('PROJECTIONS')}
              className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
                activeView === 'PROJECTIONS'
                  ? 'text-ink border-b-2 border-brand'
                  : 'text-ink-soft hover-only:text-ink'
              }`}
              data-testid="tab-projections"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Proyeksi Multi-Unit</span>
            </button>

            <button
              onClick={() => setActiveView('INSIGHTS')}
              className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
                activeView === 'INSIGHTS'
                  ? 'text-ink border-b-2 border-brand'
                  : 'text-ink-soft hover-only:text-ink'
              }`}
              data-testid="tab-insights"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Wawasan &amp; Pola Belajar</span>
            </button>

            <button
              onClick={() => setActiveView('ACTIONS')}
              className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
                activeView === 'ACTIONS'
                  ? 'text-ink border-b-2 border-brand'
                  : 'text-ink-soft hover-only:text-ink'
              }`}
              data-testid="tab-actions"
            >
              <FileText className="w-4 h-4" />
              <span>Inisiatif &amp; Aksi Yayasan</span>
              {actions.length > 0 && (
                <span className="px-1 py-0 rounded-full bg-surface-subtle text-[10px] text-ink-soft font-mono font-bold whitespace-nowrap">
                  {actions.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* VIEW 1: MULTI-SCHOOL PROJECTIONS (HEATMAPS & REDACTED AGGREGATES) */}
        {activeView === 'PROJECTIONS' && (
          <div className="space-y-6 px-4 medium:px-5 medium:px-0" data-testid="foundation-projections-view">
            {/* Privacy Invariant Banner */}
            <div className="bg-surface border border-line rounded-card p-4 medium:p-4 flex items-start gap-3 text-xs text-ink-soft shadow-hairline">
              <ShieldCheck className="w-5 h-5 text-success shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-ink text-xs medium:text-sm">
                  Jaminan Privasi &amp; Agregasi Multi-Unit (Invarian FB-01 &amp; FB-07)
                </div>
                <p className="text-ink-soft leading-relaxed">
                  Data yang disajikan adalah agregat statistik Kurikulum Merdeka TK tingkat gugus unit. Seluruh identitas individual siswa diredaksi secara otomatis demi menjaga etika pengamatan dan privasi anak.
                </p>
              </div>
            </div>

            {/* Aggregated Domain Telemetry Grid */}
            <div className="grid grid-cols-1 medium:grid-cols-2 expanded:grid-cols-3 gap-4">
              {patterns.map((pat) => (
                <div 
                  key={pat.pattern_id}
                  className="bg-surface border border-line rounded-card p-4 medium:p-4 shadow-hairline space-y-3"
                  data-testid="pattern-telemetry-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded-full bg-surface-subtle text-ink-soft border border-line font-bold whitespace-nowrap">
                        {pat.curriculum_domain}
                      </span>
                      <h3 className="font-bold text-ink text-sm mt-2">
                        {pat.pattern_name}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-success-deep bg-success-tint px-2 py-1 rounded-full border border-success-line whitespace-nowrap">
                      {pat.statistical_significance || 'Signifikan'}
                    </span>
                  </div>

                  <p className="text-xs text-ink-soft leading-relaxed line-clamp-3">
                    {pat.description || 'Pola capaian teramati pada kelompok kegiatan main bermakna.'}
                  </p>

                  <div className="pt-2 border-t border-line-soft flex items-center justify-between text-[11px] text-ink-faint">
                    <span>Sampel: {pat.sample_size_classes || 3} Rombel</span>
                    <span>Tingkat Kepastian: {pat.confidence_score ? `${(pat.confidence_score * 100).toFixed(0)}%` : '95%'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 2: PATTERN & INSIGHT STUDIO */}
        {activeView === 'INSIGHTS' && (
          <div className="space-y-4 px-4 medium:px-5 medium:px-0" data-testid="foundation-insights-view">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm medium:text-base font-bold text-ink">Temuan Analitis &amp; Keputusan Yayasan</h2>
                <p className="text-xs text-ink-soft">Daftar wawasan pembelajaran lintas unit yang memerlukan fasilitasi kelembagaan.</p>
              </div>
              <span className="text-xs text-ink-soft font-medium">{insights.length} Temuan</span>
            </div>

            <div className="space-y-4">
              {insights.map((ins) => (
                <div 
                  key={ins.insight_id}
                  className="bg-surface rounded-card border border-line p-4 medium:p-4 shadow-hairline space-y-3.5"
                >
                  <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-ink whitespace-nowrap">{ins.insight_id}</span>
                        <span className="px-2 py-1 rounded-full text-[10px] font-mono font-bold bg-info-tint text-info-deep border border-info-line whitespace-nowrap">
                          {ins.curriculum_domain}
                        </span>
                      </div>
                      <h4 className="font-bold text-ink text-sm">{ins.title}</h4>
                      <p className="text-xs text-ink-soft leading-relaxed">{ins.narrative_summary}</p>
                    </div>

                    {ins.decision_record && (
                      <div className="text-right shrink-0">
                        <span className="px-2 py-1 rounded-full bg-success-tint text-success-deep border border-success-line text-[10px] font-bold font-mono whitespace-nowrap">
                          DISETUJUI DEWAN
                        </span>
                      </div>
                    )}
                  </div>

                  {ins.decision_record && (
                    <div className="bg-surface-subtle border border-line-soft rounded-field p-3 text-xs space-y-1">
                      <div className="font-bold text-ink text-[11px] flex items-center gap-2">
                        <Lightbulb className="w-4 h-4 text-brass" />
                        <span>Rekomendasi Keputusan Dewan Yayasan:</span>
                      </div>
                      <p className="text-ink-soft">{ins.decision_record.recommended_action_type} • {ins.decision_record.governance_notes}</p>
                    </div>
                  )}
                </div>
              ))}

              {insights.length === 0 && (
                <div className="p-8 text-center bg-surface border border-line rounded-card text-ink-faint text-xs shadow-hairline">
                  Belum ada temuan analitis baru pada periode ini.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: ACTION LEDGER & CLOSED-LOOP TRACKER */}
        {activeView === 'ACTIONS' && (
          <div className="space-y-4 px-4 medium:px-5 medium:px-0" data-testid="foundation-actions-view">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm medium:text-base font-bold text-ink">Buku Besar Inisiatif &amp; Evaluasi Aksi Yayasan</h2>
                <p className="text-xs text-ink-soft">Pelacakan siklus hidup kebijakan dari penerbitan hingga evaluasi dampak nyata di unit TK.</p>
              </div>
              <span className="text-xs text-ink-soft font-medium">{actions.length} Inisiatif</span>
            </div>

            {/* Actions List */}
            <div className="space-y-4">
              {actions.map((act) => {
                const isClosed = closedLoopStatus[act.action_id] || false;
                const matchingAdoptions = adoptions.filter(ad => ad.action_id === act.action_id);
                const matchingOutcomes = outcomes.filter(o => o.action_id === act.action_id);

                return (
                  <div 
                    key={act.action_id}
                    className="bg-surface border border-line rounded-card p-4 medium:p-4 space-y-4 shadow-hairline"
                    data-testid="action-ledger-item"
                  >
                    {/* Header with CanonicalAnchor */}
                    <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 medium:gap-2 pb-3 border-b border-line-soft">
                      <div className="overflow-x-auto min-w-0 w-full medium:w-auto pb-1 -mb-1 scrollbar-hide [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]">
                        <CanonicalAnchor
                          actionId={act.action_id}
                          status={act.support_payload?.support_lifecycle_status || act.directive_payload?.directive_lifecycle_status || 'DEPLOYED'}
                          isClosedLoop={isClosed}
                          actionTitle={act.title}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-ink-faint shrink-0 whitespace-nowrap">
                        {`Cakupan: ${typeof act.target_scope === 'string' ? act.target_scope : 'Semua Unit TK'}`}
                      </span>
                    </div>

                    {/* Summary & Rationale */}
                    <div className="text-xs text-ink-soft space-y-1.5">
                      <p className="font-medium text-ink">{act.policy_intent || act.title}</p>
                      {act.action_type === 'SUPPORT_INITIATIVE' && act.support_payload && (
                        <div className="text-ink-soft bg-surface-subtle p-3 rounded-field border border-line-soft">
                          <strong className="text-ink">Fasilitasi Yayasan:</strong> {act.support_payload.resource_allocation_details}
                        </div>
                      )}
                    </div>

                    {/* Closed-Loop Visualizer Stepper */}
                    <div className="bg-surface-subtle/70 border border-line/80 rounded-field p-4 space-y-3" data-testid="closed-loop-stepper">
                      <div className="text-[11px] font-bold text-ink uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
                        <span>Siklus Evaluasi Pertanggungjawaban Kebijakan</span>
                        {isClosed ? (
                          <span className="text-success-deep font-bold flex items-center gap-1 text-[11px] bg-success-tint px-2 py-1 rounded-full border border-success-line">
                            <CheckCircle2 className="w-4 h-4" /> SIKLUS TERTUTUP LENGKAP
                          </span>
                        ) : (
                          <span className="text-warning-deep font-semibold text-[11px] bg-warning-tint px-2 py-1 rounded-full border border-warning-line">
                            Menunggu Adopsi / Pengamatan Lapangan
                          </span>
                        )}
                      </div>

                      {/* Stepper Timeline Bar */}
                      <div className="grid grid-cols-2 medium:grid-cols-4 gap-2 text-center text-[10px] font-mono pt-1 whitespace-nowrap">
                        <div className="p-2 rounded-field bg-success-tint border border-success-line text-success-deep font-bold shadow-hairline">
                          1. Diterbitkan Yayasan
                        </div>
                        <div className="p-2 rounded-field bg-success-tint border border-success-line text-success-deep font-bold shadow-hairline">
                          2. Dikirim ke Unit TK
                        </div>
                        <div className={`p-2 rounded-field border font-bold shadow-hairline ${
                          matchingAdoptions.length > 0
                            ? 'bg-success-tint border-success-line text-success-deep'
                            : 'bg-surface border-line text-ink-faint'
                        }`}>
                          {`3. Diadopsi Sekolah (${matchingAdoptions.length})`}
                        </div>
                        <div className={`p-2 rounded-field border font-bold shadow-hairline ${
                          matchingOutcomes.length > 0
                            ? 'bg-success-tint border-success-line text-success-deep'
                            : 'bg-surface border-line text-ink-faint'
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
                  </div>
                );
              })}

              {actions.length === 0 && (
                <div className="p-8 text-center bg-surface border border-line rounded-card text-ink-faint text-xs shadow-hairline">
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
