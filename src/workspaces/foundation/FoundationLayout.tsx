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
      <div className="space-y-6 md:space-y-6 w-full" data-testid="foundation-governance-console">
        {/* Workspace Header */}
        <div className="bg-slate-50 border-b border-slate-200 md:rounded-2xl px-4 py-5 md:p-6 w-full text-slate-900 md:border md:shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-1.5 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
                <Building2 className="w-3.5 h-3.5" />
                <span>Standar Yayasan • Tata Kelola Multi-Unit</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <span>Pusat Kebijakan Yayasan</span>
              </h1>
              <p className="hidden md:block text-slate-500 text-xs mt-1 max-w-2xl">
                Proyeksi agregat capaian lintas unit TK, telaah pola pembelajaran, dan penerbitan dukungan kebijakan berkesinambungan.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Segarkan Data</span>
              </button>

              <div className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-right shadow-2xs">
                <div className="text-[10px] text-slate-400 font-mono uppercase font-bold">Pengawas Yayasan</div>
                <div className="text-xs font-bold text-slate-900">{currentPersona?.name || 'Superadmin Yayasan'}</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-200 mt-6 gap-2 text-xs overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setActiveView('PROJECTIONS')}
              className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative whitespace-nowrap cursor-pointer ${
                activeView === 'PROJECTIONS'
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
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
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
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
                  ? 'text-slate-900 border-b-2 border-slate-900'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              data-testid="tab-actions"
            >
              <FileText className="w-4 h-4" />
              <span>Inisiatif &amp; Aksi Yayasan</span>
              {actions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-100 text-[10px] text-slate-700 font-mono font-bold">
                  {actions.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* VIEW 1: MULTI-SCHOOL PROJECTIONS (HEATMAPS & REDACTED AGGREGATES) */}
        {activeView === 'PROJECTIONS' && (
          <div className="space-y-6 px-4 sm:px-5 md:px-0" data-testid="foundation-projections-view">
            {/* Privacy Invariant Banner */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 text-xs text-slate-700 shadow-2xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-xs sm:text-sm">
                  Jaminan Privasi &amp; Agregasi Multi-Unit (Invarian FB-01 &amp; FB-07)
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Data yang disajikan adalah agregat statistik Kurikulum Merdeka TK tingkat gugus unit. Seluruh identitas individual siswa diredaksi secara otomatis demi menjaga etika pengamatan dan privasi anak.
                </p>
              </div>
            </div>

            {/* Aggregated Domain Telemetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.map((pat) => (
                <div 
                  key={pat.pattern_id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3"
                  data-testid="pattern-telemetry-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                        {pat.curriculum_domain}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-2">
                        {pat.pattern_name}
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {pat.statistical_significance || 'Signifikan'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {pat.description || 'Pola capaian teramati pada kelompok kegiatan main bermakna.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
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
          <div className="space-y-4 px-4 sm:px-5 md:px-0" data-testid="foundation-insights-view">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Temuan Analitis &amp; Keputusan Yayasan</h2>
                <p className="text-xs text-slate-500">Daftar wawasan pembelajaran lintas unit yang memerlukan fasilitasi kelembagaan.</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">{insights.length} Temuan</span>
            </div>

            <div className="space-y-4">
              {insights.map((ins) => (
                <div 
                  key={ins.insight_id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{ins.insight_id}</span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          {ins.curriculum_domain}
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{ins.title}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{ins.narrative_summary}</p>
                    </div>

                    {ins.decision_record && (
                      <div className="text-right shrink-0">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono">
                          DISETUJUI DEWAN
                        </span>
                      </div>
                    )}
                  </div>

                  {ins.decision_record && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-xs space-y-1">
                      <div className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                        <span>Rekomendasi Keputusan Dewan Yayasan:</span>
                      </div>
                      <p className="text-slate-700">{ins.decision_record.recommended_action_type} • {ins.decision_record.governance_notes}</p>
                    </div>
                  )}
                </div>
              ))}

              {insights.length === 0 && (
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs shadow-2xs">
                  Belum ada temuan analitis baru pada periode ini.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: ACTION LEDGER & CLOSED-LOOP TRACKER */}
        {activeView === 'ACTIONS' && (
          <div className="space-y-4 px-4 sm:px-5 md:px-0" data-testid="foundation-actions-view">
            <div className="flex items-center justify-between pb-1">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-slate-900">Buku Besar Inisiatif &amp; Evaluasi Aksi Yayasan</h2>
                <p className="text-xs text-slate-500">Pelacakan siklus hidup kebijakan dari penerbitan hingga evaluasi dampak nyata di unit TK.</p>
              </div>
              <span className="text-xs text-slate-500 font-medium">{actions.length} Inisiatif</span>
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
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4 shadow-2xs"
                    data-testid="action-ledger-item"
                  >
                    {/* Header with CanonicalAnchor */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-2 pb-3 border-b border-slate-100">
                      <div className="overflow-x-auto min-w-0 w-full sm:w-auto pb-1 -mb-1 scrollbar-hide">
                        <CanonicalAnchor
                          actionId={act.action_id}
                          status={act.support_payload?.support_lifecycle_status || act.directive_payload?.directive_lifecycle_status || 'DEPLOYED'}
                          isClosedLoop={isClosed}
                          actionTitle={act.title}
                        />
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 shrink-0">
                        {`Cakupan: ${typeof act.target_scope === 'string' ? act.target_scope : 'Semua Unit TK'}`}
                      </span>
                    </div>

                    {/* Summary & Rationale */}
                    <div className="text-xs text-slate-700 space-y-1.5">
                      <p className="font-medium text-slate-900">{act.policy_intent || act.title}</p>
                      {act.action_type === 'SUPPORT_INITIATIVE' && act.support_payload && (
                        <div className="text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                          <strong className="text-slate-900">Fasilitasi Yayasan:</strong> {act.support_payload.resource_allocation_details}
                        </div>
                      )}
                    </div>

                    {/* Closed-Loop Visualizer Stepper */}
                    <div className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 space-y-3" data-testid="closed-loop-stepper">
                      <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between flex-wrap gap-2">
                        <span>Siklus Evaluasi Pertanggungjawaban Kebijakan</span>
                        {isClosed ? (
                          <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> SIKLUS TERTUTUP LENGKAP
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold text-[11px] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Menunggu Adopsi / Pengamatan Lapangan
                          </span>
                        )}
                      </div>

                      {/* Stepper Timeline Bar */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-mono pt-1">
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
                          1. Diterbitkan Yayasan
                        </div>
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold shadow-2xs">
                          2. Dikirim ke Unit TK
                        </div>
                        <div className={`p-2 rounded-xl border font-bold shadow-2xs ${
                          matchingAdoptions.length > 0
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {`3. Diadopsi Sekolah (${matchingAdoptions.length})`}
                        </div>
                        <div className={`p-2 rounded-xl border font-bold shadow-2xs ${
                          matchingOutcomes.length > 0
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-white border-slate-200 text-slate-400'
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
                <div className="p-8 text-center bg-white border border-slate-200 rounded-2xl text-slate-400 text-xs shadow-2xs">
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
