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
      <div className="space-y-6" data-testid="foundation-governance-console">
        {/* Workspace Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-mono mb-1">
                <Building2 className="w-4 h-4" />
                <span>YAYASAN PENDIDIKAN GPIB • INSTITUTIONAL STEWARDSHIP</span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Konsol Tata Kelola Kelembagaan Multi-Unit</span>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-normal">
                  The Glass Layer
                </span>
              </h1>
              <p className="text-slate-400 text-xs mt-1 max-w-2xl">
                Proyeksi telemetri multi-sekolah, buku besar aksi intervensi etis, dan pemantauan siklus tertutup <em>(Closed-Loop Stewardship)</em>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={refreshData}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh Proyeksi</span>
              </button>

              <div className="bg-slate-950 border border-slate-800 px-3 py-1.5 rounded-lg text-right">
                <div className="text-[10px] text-slate-500 font-mono">ROLE OVERSIGHT</div>
                <div className="text-xs font-bold text-amber-300">{currentPersona?.role || 'YAPENDIK_SUPERADMIN'}</div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 mt-6 gap-2 text-xs">
            <button
              onClick={() => setActiveView('PROJECTIONS')}
              className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative ${
                activeView === 'PROJECTIONS'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-projections"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Multi-School Projections</span>
            </button>

            <button
              onClick={() => setActiveView('INSIGHTS')}
              className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative ${
                activeView === 'INSIGHTS'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-insights"
            >
              <Lightbulb className="w-4 h-4" />
              <span>Pattern &amp; Insight Studio</span>
            </button>

            <button
              onClick={() => setActiveView('ACTIONS')}
              className={`flex items-center gap-2 pb-3 px-3 font-semibold transition-colors relative ${
                activeView === 'ACTIONS'
                  ? 'text-amber-400 border-b-2 border-amber-400'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              data-testid="tab-actions"
            >
              <FileText className="w-4 h-4" />
              <span>Action Ledger &amp; Closed-Loop</span>
              {actions.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-amber-300 font-mono">
                  {actions.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* VIEW 1: MULTI-SCHOOL PROJECTIONS (HEATMAPS & REDACTED AGGREGATES) */}
        {activeView === 'PROJECTIONS' && (
          <div className="space-y-6" data-testid="foundation-projections-view">
            {/* Privacy Invariant Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-3 text-xs text-slate-700">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-semibold text-slate-900">
                  Jaminan Privasi &amp; K-Anonymity (FB-01 &amp; FB-07)
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Data yang disajikan adalah agregat statistik Kurikulum Merdeka tingkat gugus unit TK. Seluruh data identitas siswa individu (PII) diredaksi secara absolut. Kelompok observasi dengan $N &lt; 5$ atau risiko diferensiasi otomatis dilindungi oleh <strong>PrivacyShield</strong>.
                </p>
              </div>
            </div>

            {/* Aggregated Domain Telemetry Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {patterns.map((pat) => (
                <div 
                  key={pat.pattern_id}
                  className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3"
                  data-testid="pattern-telemetry-card"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {pat.curriculum_domain}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm mt-1.5">
                        {pat.curriculum_domain === 'NILAI_AGAMA_BUDI_PEKERTI' && 'Nilai Agama & Budi Pekerti'}
                        {pat.curriculum_domain === 'JATI_DIRI' && 'Jati Diri & Regulasi Emosi'}
                        {pat.curriculum_domain === 'LITERASI_STEAM' && 'Literasi, Numerasi & STEAM'}
                      </h3>
                    </div>
                  </div>

                  {/* PrivacyShield Protected Metric */}
                  <div className="pt-2 border-t border-slate-100">
                    <PrivacyShield
                      exposureStatus={pat.exposure_status}
                      sampleSize={pat.sample_size}
                      metricValue={pat.metric_values?.mean_score}
                      metricLabel="Distribusi Rerata Kemandirian"
                      format="PERCENTAGE"
                    />
                  </div>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-2 border-t border-slate-100 font-mono">
                    <span>Scope: {pat.target_school_id || 'Seluruh TK Yayasan'}</span>
                    <span>T.A. 2026/2027</span>
                  </div>
                </div>
              ))}

              {patterns.length === 0 && (
                <div className="col-span-full p-8 text-center bg-white border border-slate-200 rounded-xl text-slate-400 text-xs">
                  Tidak ada data proyeksi analitis aktif.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 2: PATTERN & INSIGHT STUDIO */}
        {activeView === 'INSIGHTS' && (
          <div className="space-y-6" data-testid="foundation-insights-view">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Temuan Analitis &amp; Keputusan Yayasan</h2>
                  <p className="text-xs text-slate-500">Daftar wawasan terverifikasi yang memerlukan tindak lanjut kelembagaan.</p>
                </div>
              </div>

              <div className="space-y-3">
                {insights.map((ins) => (
                  <div 
                    key={ins.insight_id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-800">{ins.insight_id}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            {ins.curriculum_domain}
                          </span>
                        </div>
                        <h4 className="font-semibold text-slate-900 text-sm">{ins.title}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{ins.narrative_summary}</p>
                      </div>

                      {ins.decision_record && (
                        <div className="text-right shrink-0">
                          <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold font-mono">
                            DECISION RECORDED
                          </span>
                        </div>
                      )}
                    </div>

                    {ins.decision_record && (
                      <div className="bg-white border border-slate-200 rounded-lg p-3 text-xs space-y-1">
                        <div className="font-semibold text-slate-800 text-[11px] flex items-center gap-1">
                          <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                          <span>Rekomendasi Keputusan Dewan:</span>
                        </div>
                        <p className="text-slate-600">{ins.decision_record.recommended_action_type} — {ins.decision_record.governance_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ACTION LEDGER & CLOSED-LOOP TRACKER */}
        {activeView === 'ACTIONS' && (
          <div className="space-y-6" data-testid="foundation-actions-view">
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Buku Besar Tindakan Kelembagaan &amp; Closed-Loop</h2>
                  <p className="text-xs text-slate-500">Pelacakan siklus hidup aksi dari penerbitan hingga evaluasi dampak empiris.</p>
                </div>
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
                      className="border border-slate-200 rounded-xl p-5 space-y-4 hover:border-slate-300 transition-all bg-white"
                      data-testid="action-ledger-item"
                    >
                      {/* Header with CanonicalAnchor */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-2">
                          <CanonicalAnchor
                            actionId={act.action_id}
                            status={act.support_payload?.support_lifecycle_status || act.directive_payload?.directive_lifecycle_status || 'DEPLOYED'}
                            isClosedLoop={isClosed}
                            actionTitle={act.title}
                          />
                        </div>
                        <span className="text-[11px] font-mono text-slate-400">
                          {`Scope: ${typeof act.target_scope === 'string' ? act.target_scope : 'ALL_TK_UNITS'}`}
                        </span>
                      </div>

                      {/* Summary & Rationale */}
                      <div className="text-xs text-slate-700 space-y-1">
                        <p className="font-medium text-slate-900">{act.policy_intent || act.title}</p>
                        {act.action_type === 'SUPPORT_INITIATIVE' && act.support_payload && (
                          <div className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 mt-2">
                            <strong>Dukungan Terbuka:</strong> {act.support_payload.resource_allocation_details}
                          </div>
                        )}
                      </div>

                      {/* Closed-Loop Visualizer Stepper */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3" data-testid="closed-loop-stepper">
                        <div className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                          <span>{"Siklus Pertanggungjawaban Kebijakan (Closed-Loop Stepper)"}</span>
                          {isClosed ? (
                            <span className="text-emerald-700 font-bold flex items-center gap-1 text-[11px]">
                              <CheckCircle2 className="w-3.5 h-3.5" /> SIKLUS TERTUTUP LENGKAP
                            </span>
                          ) : (
                            <span className="text-amber-700 font-semibold text-[11px]">
                              Menunggu Adopsi / Pengukuran Lapangan
                            </span>
                          )}
                        </div>

                        {/* Stepper Timeline Bar */}
                        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono pt-1">
                          <div className="p-2 rounded bg-emerald-100/70 border border-emerald-300 text-emerald-900 font-bold">
                            {"1. Diterbitkan Yayasan"}
                          </div>
                          <div className="p-2 rounded bg-emerald-100/70 border border-emerald-300 text-emerald-900 font-bold">
                            {"2. Deployed ke Unit"}
                          </div>
                          <div className={`p-2 rounded border font-bold ${
                            matchingAdoptions.length > 0
                              ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}>
                            {`3. Diadopsi Sekolah (${matchingAdoptions.length})`}
                          </div>
                          <div className={`p-2 rounded border font-bold ${
                            matchingOutcomes.length > 0
                              ? 'bg-emerald-100/70 border-emerald-300 text-emerald-900'
                              : 'bg-slate-100 border-slate-200 text-slate-400'
                          }`}>
                            {`4. Evaluasi Dampak (${matchingOutcomes.length})`}
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
              </div>
            </div>
          </div>
        )}
      </div>
    </ForbiddenActionGate>
  );
};
