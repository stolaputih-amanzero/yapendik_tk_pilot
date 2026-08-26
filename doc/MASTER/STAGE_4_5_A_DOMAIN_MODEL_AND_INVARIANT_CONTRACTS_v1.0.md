# STAGE 4.5-A — DOMAIN MODEL & INVARIANT CONTRACTS
## Multi-Unit Institutional Learning & Governance Domain Substrate (v1.0 — Sealed)
### Yapendik School OS — Architecture Contract Specification

---

## 1. Purpose & Scope

Dokumen ini merupakan **Spesifikasi Kontrak Model Domain & Invarian yang Telah Disahkan (Fase 4.5-A / Gate 2 Sealed)** untuk **Stage 4.5 — Yapendik Institutional Learning & Multi-School Governance Loop (LEARN)**.

Dokumen ini memformalkan 6 Entitas Kanonikal, Objek Nilai, State Machine Asimetris, Penegakan 7 Invarian Tata Kelola (**FB-01 s.d. FB-07**), Protokol *Anti-Differencing*, dan 6 Penyempurnaan Semantik (*Semantic Hardenings*).

```text
               YAPENDIK 4.5-A DOMAIN LINEAGE & ANCHOR CHAIN
               
            DerivedAnalyticalPattern (Machine Pattern)
                        │
                        ▼
            InstitutionalInsight (Human Confirmed)
                        │
                        ▼
            InsightDecisionRecord (Audited Governance Choice)
                        │
                        ▼
            InstitutionalActionRecord (CANONICAL ROOT: action_id)
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    SchoolAdoptionResponse    ObservedOutcomeEffect
            │                       │
            └───────────┬───────────┘
                        ▼
            [ DERIVED CLOSED_LOOP ]
```

---

## 2. Domain Vocabulary & Semantic Definitions

| Istilah | Definisi Domain | Batas & Otoritas |
|---|---|---|
| **`AnalyticalPattern`** | Pola matematis atau anomali terdistribusi yang dihitung secara deterministik oleh mesin dari data historis sekolah. | Murni observasi analitik; **tidak memiliki wewenang hukum atau intervensi**. |
| **`InstitutionalInsight`** | Temuan institusional yang telah ditelaah, dikonfirmasi relevansinya, dan divalidasi oleh manusia dari satu atau lebih pola analitik. | Wawasan resmi yang siap diajukan ke Dewan Pengurus Yayasan. |
| **`InsightDecision`** | Keputusan resmi Dewan Pengurus berjejak audit (*ACCEPTED*, *DISMISSED*, atau *DEFERRED*). | Titik awal sebelum penerbitan aksi intervensi institusional. |
| **`InstitutionalAction`** | Jangkar tunggal aksi institusi (*canonical root*) yang mengikat identitas `action_id`. | Mengalirkan wewenang strategis Yayasan ke satuan sekolah. |
| **`SupportInitiative`** | Muatan aksi berupa alokasi sumber daya nyata (fasilitator sentra, materi ajar, alat P3K). | Membantu sekolah tanpa mengambil alih otonomi kelas. |
| **`GovernanceDirective`** | Muatan aksi berupa panduan kebijakan atau SOP standar yang diterbitkan Yayasan. | Diadopsi secara kontekstual oleh Kepala Sekolah. |
| **`SchoolAdoption`** | Catatan resmi Kepala Sekolah mengenai penerimaan dan adaptasi lokal terhadap aksi institusi. | Wewenang eksklusif satuan sekolah (*School Context*). |
| **`ObservedOutcome`** | Pengukuran selisih matematis ($\Delta$) empiris pada siklus data berikutnya pasca adopsi. | Asosiasi statistik empiris; **bukan klaim kausalitas otomatis**. |
| **`ClosedLoop`** | Kondisi tata kelola turunan yang tercapai saat rantai $\text{Insight} \rightarrow \text{Decision} \rightarrow \text{Action} \rightarrow \text{Adoption} \rightarrow \text{Outcome} \rightarrow \text{Reflection}$ lengkap. | Bukan status mutasi statis; dihitung secara dinamis. |

---

## 3. Canonical Entity Model (6 Entitas Utama)

### 3.1 Entity 1: `DerivedAnalyticalPattern`
```typescript
export interface DerivedAnalyticalPattern {
  pattern_id: string; // e.g. "pat_2026_tk_menteng_steam_01"
  source_projection: 'CURRICULUM_DOMAIN_DISTRIBUTION' | 'SAFETY_INTEGRITY_INDEX' | 'ATTENDANCE_STABILITY';
  target_school_id?: string; // Kosong jika pola sistemik seluruh unit
  observation_window: ObservationWindow;
  cohort_size: number;
  exposure_status: ExposurePrivacyStatus; // VISIBLE | SUPPRESSED_SMALL_COHORT | SUPPRESSED_DIFFERENCING_RISK (Hardening 03)
  aggregation_rule: string;
  threshold_rule_version: string;
  computed_metric_value?: number; // Undefined jika exposure_status !== 'VISIBLE'
  pattern_status: PatternLifecycleStatus;
  detected_at: string;
}
```

### 3.2 Entity 2: `InstitutionalInsight`
```typescript
export interface InstitutionalInsight {
  insight_id: string; // e.g. "ins_2026_steam_gap_01"
  originating_pattern_id: string;
  provenance: InsightProvenance;
  category: 'PEDAGOGICAL_EQUITY' | 'SAFETY_INTEGRITY' | 'CURRICULUM_BALANCE' | 'RESOURCE_NEED';
  title: string;
  empirical_observation: string;
  urgency_level: 'ROUTINE' | 'PRIORITY_SUPPORT' | 'STRATEGIC_REVIEW';
  status: InsightLifecycleStatus;
  decision_record?: InsightDecisionRecord;
  created_at: string;
}
```

### 3.3 Entity 3: `InsightDecisionRecord`
```typescript
export interface InsightDecisionRecord {
  decision_id: string; // e.g. "dec_2026_091"
  insight_id: string;
  decision_type: 'ACCEPTED_FOR_ACTION' | 'DISMISSED' | 'DEFERRED_MONITORING';
  decision_rationale: string;
  action_plan_type?: 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE' | 'NONE';
  decided_by_person_id: string;
  decided_by_name: string;
  decided_by_role: 'FOUNDATION_DIRECTOR' | 'FOUNDATION_TRUSTEE' | 'YAPENDIK_SUPERADMIN';
  decided_at: string;
}
```

### 3.4 Entity 4: `InstitutionalActionRecord` (Root Identity Anchor: `action_id`)
```typescript
export interface InstitutionalActionRecord {
  action_id: string; // CANONICAL ROOT IDENTITY (IMMUTABLE FOREVER - Hardening 06)
  originating_insight_id: string;
  originating_decision_id: string;
  action_type: 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE';
  target_scope: TargetScope;
  target_school_id?: string; // Wajib ada jika SPECIFIC_SCHOOL, wajib kosong jika ALL_TK_UNITS (Hardening 05)
  title: string;
  policy_intent: string;
  issued_by_person_id: string;
  issued_by_name: string;
  issued_at: string;

  // Specific Payloads with Independent State Machines (Hardening 01)
  support_payload?: SupportPayload;
  directive_payload?: DirectivePayload;
}
```

### 3.5 Entity 5: `SchoolAdoptionResponse`
```typescript
export interface SchoolAdoptionResponse {
  response_id: string; // e.g. "adp_2026_act01_menteng"
  action_id: string; // Terikat secara kanonikal ke action_id
  action_type: 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE';
  school_id: string;
  headmaster_person_id: string;
  headmaster_name: string;
  adoption_status: AdoptionLifecycleStatus;
  local_context_adaptation_notes: string;
  action_timeline: string;
  acknowledged_at: string;
}
```

### 3.6 Entity 6: `ObservedOutcomeEffect`
```typescript
export interface ObservedOutcomeEffect {
  outcome_id: string; // e.g. "out_2026_act01_eval"
  action_id: string; // Terikat secara kanonikal ke action_id
  school_id: string;
  metric_name: string;
  observation_window: {
    baseline_period_name: string;
    evaluation_period_name: string;
  };
  measurements: {
    baseline_measurement: MeasurementValue;
    evaluation_measurement: MeasurementValue;
    computed_delta: DeltaChange;
  };
  statistical_nature: 'OBSERVED_EMPIRICAL_ASSOCIATION'; // Strict Non-Causal Semantics
  human_reflective_interpretation: string; // Refleksi makna kualitatif manusia (Wajib diisi valid)
  recorded_by_person_id: string;
  recorded_by_name: string;
  recorded_at: string;
}
```

---

## 4. Value Objects & Privacy Semantics

```typescript
export type ExposurePrivacyStatus = 
  | 'VISIBLE' 
  | 'SUPPRESSED_SMALL_COHORT' 
  | 'SUPPRESSED_DIFFERENCING_RISK';

export type PatternLifecycleStatus = 
  | 'DETECTED' 
  | 'AVAILABLE_FOR_REVIEW' 
  | 'INSIGHT_CANDIDATE' 
  | 'ARCHIVED';

export type InsightLifecycleStatus = 
  | 'IDENTIFIED' 
  | 'REVIEWED' 
  | 'ACTION_DECIDED' 
  | 'DISMISSED';

export type SupportLifecycleStatus = 
  | 'PROPOSED' 
  | 'APPROVED' 
  | 'DEPLOYED' 
  | 'COMPLETED';

export type DirectiveLifecycleStatus = 
  | 'DRAFT' 
  | 'PUBLISHED' 
  | 'SUPERSEDED';

export type AdoptionLifecycleStatus = 
  | 'ACKNOWLEDGED' 
  | 'ADOPTED_IN_PRACTICE' 
  | 'ADAPTED_LOCALLY' 
  | 'DEFERRED';

export interface ObservationWindow {
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  start_date: string;
  end_date: string;
}

export interface InsightProvenance {
  source_projection: 'CURRICULUM_DOMAIN_DISTRIBUTION' | 'SAFETY_INTEGRITY_INDEX' | 'ATTENDANCE_STABILITY';
  target_school_id?: string;
  academic_period_name: string;
  semester: 'GANJIL' | 'GENAP';
  aggregation_rule: string;
  threshold_rule_version: string;
  computation_timestamp: string;
}

export interface SupportPayload {
  initiative_type: 'TEACHER_COACHING' | 'LEARNING_MATERIALS' | 'SAFETY_EQUIPMENT' | 'SPECIALIST_CONSULTATION';
  resource_allocation_details: string;
  deployed_facilitator_name?: string;
  support_lifecycle_status: SupportLifecycleStatus;
}

export interface DirectivePayload {
  directive_code: string; // e.g. "DIR-2026-STEAM-01"
  advisory_guidelines: string;
  compliance_recommendations: string;
  directive_lifecycle_status: DirectiveLifecycleStatus;
}

export interface MeasurementValue {
  metric_value: number;
  unit_of_measure: string;
  sample_cohort_size: number;
}

export interface DeltaChange {
  absolute_delta: number;
  percentage_change_pct: number;
}

export type TargetScope = 'ALL_TK_UNITS' | 'SPECIFIC_SCHOOL';
```

---

## 5. Matriks 6 Penyempurnaan Semantik (Semantic Hardenings)

| No | Nama Hardening | Aturan Tata Kelola & Batas Penegakan | Status |
|---|---|---|---|
| **H-01** | *Action Anchor vs Payload Lifecycle* | `InstitutionalActionRecord` adalah identity anchor (`action_id`). State machine operasional hidup di `SupportPayload.support_lifecycle_status` dan `DirectivePayload.directive_lifecycle_status`. | 🟢 SEALED |
| **H-02** | *Valid Outcome for Loop Closure* | Outcome valid wajib memiliki: `action_id`, `school_id`, `observation_window`, `baseline`, `evaluation`, `delta`, `recorded_by`, `recorded_at`, dan `human_reflective_interpretation` yang bermakna. | 🟢 SEALED |
| **H-03** | *Exposure State Enum* | Mengganti boolean dengan `ExposurePrivacyStatus` (`VISIBLE` / `SUPPRESSED_SMALL_COHORT` / `SUPPRESSED_DIFFERENCING_RISK`). | 🟢 SEALED |
| **H-04** | *Precision Terminology FB-07* | Disebut secara formal sebagai: *Minimum Cohort Privacy Threshold ($K_{\min} = 5$) + Anti-Differencing Protection*. | 🟢 SEALED |
| **H-05** | *Target Scope Invariant* | `target_scope === 'SPECIFIC_SCHOOL'` mewajibkan `target_school_id` ada; `target_scope === 'ALL_TK_UNITS'` mewajibkan `target_school_id` kosong. | 🟢 SEALED |
| **H-06** | *Immutable `action_id` Anchor* | Sekali diterbitkan, `action_id` tidak pernah dapat dimutasi, digunakan ulang, atau dialihkan (*immutable canonical lineage*). | 🟢 SEALED |

---

## 6. Derived Closed-Loop Condition Contract

Kondisi penutupan siklus penuh (**`CLOSED_LOOP`**) dihitung secara deterministik melalui:

```typescript
export function isInstitutionalClosedLoopSatisfied(
  action: InstitutionalActionRecord,
  adoption?: SchoolAdoptionResponse,
  outcome?: ObservedOutcomeEffect
): boolean {
  // 1. Invariant Scope Guard (Hardening 05)
  if (action.target_scope === 'SPECIFIC_SCHOOL' && !action.target_school_id) return false;
  if (action.target_scope === 'ALL_TK_UNITS' && action.target_school_id) return false;

  // 2. Aksi wajib telah dieksekusi / dipublikasikan (Hardening 01)
  const isActionActive = 
    (action.action_type === 'SUPPORT_INITIATIVE' && action.support_payload?.support_lifecycle_status === 'DEPLOYED') ||
    (action.action_type === 'GOVERNANCE_DIRECTIVE' && action.directive_payload?.directive_lifecycle_status === 'PUBLISHED');

  if (!isActionActive) return false;

  // 3. Satuan sekolah wajib telah mengadopsi aksi secara nyata (School Autonomy)
  const isAdopted = 
    adoption && 
    adoption.action_id === action.action_id &&
    (adoption.adoption_status === 'ADOPTED_IN_PRACTICE' || adoption.adoption_status === 'ADAPTED_LOCALLY');

  if (!isAdopted) return false;

  // 4. Validitas Outcome Record Lengkap (Hardening 02)
  const isOutcomeValid = 
    outcome && 
    outcome.action_id === action.action_id &&
    Boolean(outcome.human_reflective_interpretation?.trim()) &&
    outcome.measurements.baseline_measurement.sample_cohort_size >= 5 &&
    outcome.measurements.evaluation_measurement.sample_cohort_size >= 5 &&
    outcome.measurements.computed_delta !== undefined;

  return Boolean(isOutcomeValid);
}
```

---

## 7. Penegakan Teknis 7 Invarian Tata Kelola (FB-01 s.d. FB-07)

| Invarian | Aturan Penegakan Teknis | Titik Penegakan (Enforcement Point) |
|---|---|---|
| **FB-01** | *Zero Individual Exposure*: Data anak dihapus dari DTO output Yayasan. | Service Projection Layer & API Gateway Redactor. |
| **FB-02** | *Derived Telemetry Only*: Dilarang menyimpan status skor KPI ke tabel terpisah. | Database Schema (Hanya View / On-the-fly Service Functions). |
| **FB-03** | *Autonomous Unit Leadership*: Peran Yayasan dilarang mengoverride jadwal/RPP guru. | RBAC Guard & Role Authority Middleware. |
| **FB-04** | *No Cross-School Ranking*: Response payload tidak memiliki atribut `rank` / `leaderboard_position`. | Projection Engine Schema Guard. |
| **FB-05** | *Close the Loop*: Wawasan tanpa keputusan/tindakan ditandai sebagai siklus terbuka. | `isInstitutionalClosedLoopSatisfied` Engine. |
| **FB-06** | *No Canonical School Mutation*: Akun Yayasan diblokir dari RPC mutasi kelas. | PostgreSQL RLS Policies & RPC Invoker Role Guards. |
| **FB-07** | *Minimum Cohort Privacy Threshold ($K_{\min} = 5$) + Anti-Differencing*. | Statistical Aggregator Service & Anti-Differencing Engine. |

---

## 8. Anti-Differencing Protocol

Jika terdapat dua query agregat yang beririsan:
- **Query 1 (Total Rombel)**: $N = 8$ anak.
- **Query 2 (Subset Karakteristik A)**: $N = 5$ anak.
- **Differencing Risk**: Sisa $N = 3$ anak ($8 - 5 = 3 < 5$) dapat teridentifikasi karakternya secara deduktif.
- **Protokol Penegakan**: Anti-Differencing Engine otomatis mendeteksi selisih $< 5$ dan menetapkan `exposure_status = 'SUPPRESSED_DIFFERENCING_RISK'` serta mengosongkan `computed_metric_value`.

---

## 9. Matriks Pengujian Kontrak (Contract Test Matrix)

| Modul Uji | Target Invarian / Hardening | Skenario Verifikasi |
|---|---|---|
| **Module 1** | *H-01 & H-06: Action Root Identity* | Memverifikasi `action_id` mengikat Support/Directive dan tidak dapat dimutasi. |
| **Module 2** | *H-05: Target Scope Invariant* | Memverifikasi penolakan data inkonsisten (`ALL_TK_UNITS` dengan `target_school_id`). |
| **Module 3** | *H-03 & FB-07: Minimum Cohort ($K_{\min} = 5$)* | Memverifikasi `exposure_status === 'SUPPRESSED_SMALL_COHORT'` untuk $N < 5$. |
| **Module 4** | *Anti-Differencing Engine* | Memverifikasi penekanan selisih subset yang mengekspos $< 5$ anak (`SUPPRESSED_DIFFERENCING_RISK`). |
| **Module 5** | *H-02: Valid Outcome & Derived Closed-Loop* | Memverifikasi `isInstitutionalClosedLoopSatisfied` hanya `true` saat 4 syarat sah. |
| **Module 6** | *FB-01 Zero Individual Exposure* | Memverifikasi nol PII anak pada payload output Yayasan. |
| **Module 7** | *FB-06 Canonical Mutation Hard Block* | Memverifikasi kegagalan mutasi data sekolah oleh peran Yayasan. |
| **Module 8** | *Non-Causal Association Semantics* | Memverifikasi sistem murni menyajikan $\Delta$ matematis dan asosiasi empiris. |

---

## 10. Sertifikasi Kelulusan Gate 2 (Gate 2 Sealed & Certified)

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║              STAGE 4.5-A DOMAIN CONTRACT SEALED & CERTIFIED (GATE 2)          ║
║                                                                              ║
║  CANONICAL ROOT IDENTITY             : action_id IMMUTABLE ANCHOR (H-06)     ║
║  ASYMMETRICAL STATE MACHINES         : PAYLOAD-BOUND LIFECYCLES (H-01)       ║
║  DERIVED CLOSED-LOOP VALIDATION      : DETERMINISTIC FUNCTION (H-02)         ║
║  PRIVACY EXPOSURE STATUS             : 3-TIER EXPOSURE ENUM (H-03)           ║
║  TARGET SCOPE INVARIANT              : STRICTLY ENFORCED (H-05)              ║
║  MINIMUM COHORT PRIVACY (FB-07)      : Kmin = 5 + ANTI-DIFFERENCING (H-04)   ║
║  CANONICAL MUTATION BLOCK (FB-06)    : HARD BLOCKED ON RPC/SERVICE           ║
║                                                                              ║
║  OVERALL STATUS                      : 🟢 GATE 2 PASSED & SEALED              ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

*Dokumen ini menjadi Kontrak Domain Final (Gate 2 Sealed) untuk membuka implementasi Type System & Service Layer (Fase 4.5-B/C) Yapendik School OS.*
