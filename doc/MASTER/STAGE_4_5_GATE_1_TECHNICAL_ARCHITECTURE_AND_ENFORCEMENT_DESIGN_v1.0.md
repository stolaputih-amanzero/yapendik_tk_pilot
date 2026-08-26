# STAGE 4.5 — GATE 1: TECHNICAL ARCHITECTURE & ENFORCEMENT DESIGN
## Multi-Unit Institutional Learning & Governance Operating Substrate (v1.0)
### Yapendik School OS — Architecture Specification

---

## 1. Executive Purpose & Governance Framing

Dokumen ini merupakan **Spesifikasi Arsitektur Teknis dan Desain Penegakan Tata Kelola (Gate 1)** untuk **Stage 4.5 — Yapendik Institutional Learning & Multi-School Governance Loop (LEARN)**.

Dokumen ini menerjemahkan seluruh kontrak semantik dari Gate 0 & Gate 0.1 menjadi **aturan arsitektur teknis yang dapat ditegakkan secara deterministik** oleh lapisan database, projection engine, service layer, RPC/API guards, dan adversarial security tests tanpa pernah bergantung pada disiplin antarmuka (UI).

```text
                     YAPENDIK 5-STAGE OPERATING LOOP
                     
      TEACHER (Stage 4.1) : Intent ──► Context ──► Action ──► State
      SCHOOL  (Stage 4.4) : Need ──► Resolution ──► Adoption ──► Operation
      FOUNDATION (Stage 4.5): Question ──► Safe Projection ──► Insight ──► Decision
                             ──► Institutional Action ──► School Adoption
                             ──► Observed Outcome ──► Institutional Learning
```

---

## 2. Bagian 1: LEARN Information Architecture (EIA Extension)

Arsitektur informasi memetakan relasi entitas, kepemilikan data, dan batas transmisi:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. CANONICAL SCHOOL LAYER (Authoritative School Reality - Frozen from FB-06)│
│    • attendance, observations, lppa_records, child_dossiers, classrooms     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. PROJECTION ENGINE LAYER (Anti-Differencing & Privacy Gatekeeper)         │
│    • Aggregate Filters, Cohort Suppression ($N < 5$), Anti-Deduction Engine │
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. INSTITUTIONAL LEARNING LAYER (Foundation Governance Context)             │
│    • DerivedAnalyticalPattern  (Machine-detected analytical observation)    │
│    • InstitutionalInsight      (Human-confirmed institutional finding)      │
│    • InsightDecisionRecord     (Audited governance choice by Trustees)      │
│    • InstitutionalActionRecord (Canonical root identity: action_id)         │
│      ├── SupportInitiativePayload    (Fasilitator / Material / Coaching)    │
│      └── GovernanceDirectivePayload  (Kebijakan / SOP / Regulasi)           │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. ADOPTION & CONTEXTUAL FEEDBACK LAYER (School Leadership Level)           │
│    • SchoolAdoptionResponse    (Konfirmasi & catatan adaptasi lokal KS)     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. EMPIRICAL OUTCOME LAYER (Non-Causal Observed Associations)               │
│    • ObservedOutcomeEffect     (Pengukuran $\Delta$ & Refleksi Kualitatif)  │
│    • Derived Closed-Loop Condition (Verifikasi penutupan siklus penuh)      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Bagian 2: LEARN Domain & Entity Model (TypeScript Specifications)

```typescript
// 1. ANALYTICAL PATTERN (Machine Detection)
export interface DerivedAnalyticalPattern {
  pattern_id: string;
  source_projection: 'CURRICULUM_DOMAIN_DISTRIBUTION' | 'SAFETY_INTEGRITY_INDEX' | 'ATTENDANCE_STABILITY';
  target_school_id?: string;
  observation_window: {
    academic_year_id: string;
    semester: 'GANJIL' | 'GENAP';
    start_date: string;
    end_date: string;
  };
  cohort_size: number;
  is_suppressed: boolean; // True jika N < 5 (FB-07)
  aggregation_rule: string;
  threshold_rule_version: string;
  computed_metric_value: number;
  pattern_status: 'DETECTED' | 'AVAILABLE_FOR_REVIEW' | 'ARCHIVED' | 'INSIGHT_CANDIDATE';
  detected_at: string;
}

// 2. INSTITUTIONAL INSIGHT (Human Confirmed)
export interface InstitutionalInsight {
  insight_id: string;
  originating_pattern_id: string;
  provenance: {
    source_projection: DerivedAnalyticalPattern['source_projection'];
    target_school_id?: string;
    academic_period_name: string;
    semester: 'GANJIL' | 'GENAP';
    aggregation_rule: string;
    threshold_rule_version: string;
    computation_timestamp: string;
  };
  category: 'PEDAGOGICAL_EQUITY' | 'SAFETY_INTEGRITY' | 'CURRICULUM_BALANCE' | 'RESOURCE_NEED';
  title: string;
  empirical_observation: string;
  urgency_level: 'ROUTINE' | 'PRIORITY_SUPPORT' | 'STRATEGIC_REVIEW';
  status: 'IDENTIFIED' | 'REVIEWED' | 'ACTION_DECIDED' | 'DISMISSED';
  decision_record?: InsightDecisionRecord;
  created_at: string;
}

// 3. DECISION RECORD (Audited Human Choice)
export interface InsightDecisionRecord {
  decision_id: string;
  decision_type: 'ACCEPTED_FOR_ACTION' | 'DISMISSED' | 'DEFERRED_MONITORING';
  decision_rationale: string;
  action_plan_type?: 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE' | 'NONE';
  decided_by_person_id: string;
  decided_by_name: string;
  decided_by_role: 'FOUNDATION_DIRECTOR' | 'FOUNDATION_TRUSTEE' | 'YAPENDIK_SUPERADMIN';
  decided_at: string;
}

// 4. CANONICAL INSTITUTIONAL ACTION RECORD (Canonical Root Anchor: action_id)
export interface InstitutionalActionRecord {
  action_id: string; // CANONICAL ROOT IDENTITY (e.g. "act_2026_steam_084")
  originating_insight_id: string;
  action_type: 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE';
  target_scope: 'ALL_TK_UNITS' | 'SPECIFIC_SCHOOL';
  target_school_id?: string;
  title: string;
  policy_intent: string;
  issued_by_person_id: string;
  issued_by_name: string;
  issued_at: string;

  // Support Payload (Independent Lifecycle: PROPOSED -> APPROVED -> DEPLOYED -> COMPLETED)
  support_payload?: {
    initiative_type: 'TEACHER_COACHING' | 'LEARNING_MATERIALS' | 'SAFETY_EQUIPMENT' | 'SPECIALIST_CONSULTATION';
    resource_allocation_details: string;
    deployed_facilitator_name?: string;
    support_lifecycle_status: 'PROPOSED' | 'APPROVED' | 'DEPLOYED' | 'COMPLETED';
  };

  // Directive Payload (Independent Lifecycle: DRAFT -> PUBLISHED -> SUPERSEDED)
  directive_payload?: {
    directive_code: string;
    advisory_guidelines: string;
    compliance_recommendations: string;
    directive_lifecycle_status: 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED';
  };
}

// 5. SCHOOL ADOPTION RESPONSE (School Contextual Leadership)
export interface SchoolAdoptionResponse {
  response_id: string;
  action_id: string; // Terikat ke canonical action_id
  action_type: 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE';
  school_id: string;
  headmaster_person_id: string;
  headmaster_name: string;
  adoption_status: 'ACKNOWLEDGED' | 'ADOPTED_IN_PRACTICE' | 'ADAPTED_LOCALLY' | 'DEFERRED';
  local_context_adaptation_notes: string;
  action_timeline: string;
  acknowledged_at: string;
}

// 6. OBSERVED OUTCOME EFFECT (Non-Causal Empirical Association)
export interface ObservedOutcomeEffect {
  outcome_id: string;
  action_id: string; // Terikat ke canonical action_id
  school_id: string;
  metric_name: string;
  observation_window: {
    baseline_period: string;
    evaluation_period: string;
  };
  measurements: {
    baseline_value: number;
    evaluation_value: number;
    delta_absolute: number;
    delta_percentage_pct: number;
  };
  statistical_nature: 'OBSERVED_EMPIRICAL_ASSOCIATION';
  human_reflective_interpretation: string; // Refleksi makna oleh manusia
  recorded_by_person_id: string;
  recorded_by_name: string;
  recorded_at: string;
}
```

---

## 4. Bagian 3: Projection & Privacy Architecture (Penegakan FB-01, FB-02 & FB-07)

Projection Engine beroperasi sebagai gerbang keamanan data satu arah (*one-way cryptographic & aggregate projection*):

```text
CANONICAL DATA (PostgreSQL)
  │
  ├── Raw Attendance / Daily Temps
  ├── Teacher Formative Observations
  ├── Official Canonical LPPA Narratives
  └── Child Protection Dossiers (Tier 4)
  │
  ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│ PROJECTION & PRIVACY ENGINE                                                 │
│                                                                             │
│ 1. Zero-PII Redaction Engine: Menghapus seluruh nama anak, NIK, NISN, foto  │
│ 2. K-Anonymity Guard (FB-07): Cohort N < 5 ──► 'SUPPRESSED_SMALL_COHORT'    │
│ 3. Anti-Differencing Engine: Memverifikasi selisih antar proyeksi tidak      │
│    dapat membuka data kelompok terisolasi secara deduktif.                  │
│ 4. Temporal Window Anchor: Mengunci data pada snapshot semester resmi.      │
└─────────────────────────────────────────────────────────────────────────────┘
  │
  ▼
FOUNDATION READ MODEL (Purely Aggregated, Non-Identifiable)
```

---

## 5. Bagian 4: Context & Authorization Contract (Penegakan FB-03 & FB-06)

Batas wewenang ditegakkan secara absolut pada layer Service dan Database (RLS/RPC):

| Operasi / Endpoint | Wewenang Guru | Wewenang Kepala Sekolah | Wewenang Yayasan (Pusat) |
|---|---|---|---|
| `getFoundationProjections` | ❌ BLOCKED | ❌ BLOCKED | 🟢 ALLOWED |
| `reviewInsight & decide` | ❌ BLOCKED | ❌ BLOCKED | 🟢 ALLOWED |
| `issueInstitutionalAction` | ❌ BLOCKED | ❌ BLOCKED | 🟢 ALLOWED |
| `recordSchoolAdoption` | ❌ BLOCKED | 🟢 ALLOWED | ❌ BLOCKED |
| `mutateAttendance / Observe` | 🟢 ALLOWED | 🟢 ALLOWED | ❌ **HARD BLOCKED (FB-06)** |
| `mutateLppa / GradeChild` | 🟢 ALLOWED | 🟢 ALLOWED (Approve) | ❌ **HARD BLOCKED (FB-06)** |
| `mutateChildDossier` | 🟢 ALLOWED | 🟢 ALLOWED (Tier 4) | ❌ **HARD BLOCKED (FB-06)** |

---

## 6. Bagian 5: State Machine & Lifecycle Contract

### 6.1 State Machine: Analytical Pattern
$$\mathbf{DETECTED} \longrightarrow \mathbf{AVAILABLE\_FOR\_REVIEW} \xrightarrow[\text{Telaah Manusia}]{\text{Review}} \mathbf{INSIGHT\_CANDIDATE} \quad (\text{atau } \mathbf{ARCHIVED})$$

### 6.2 State Machine: Institutional Insight
$$\mathbf{IDENTIFIED} \longrightarrow \mathbf{REVIEWED} \xrightarrow[\text{Keputusan Dewan}]{\text{Decision}} \mathbf{ACTION\_DECIDED} \quad (\text{atau } \mathbf{DISMISSED})$$

### 6.3 State Machine Asimetris: Institutional Actions
- **Support Payload Lifecycle**:  
  $$\mathbf{PROPOSED} \longrightarrow \mathbf{APPROVED} \longrightarrow \mathbf{DEPLOYED} \longrightarrow \mathbf{COMPLETED}$$
- **Directive Payload Lifecycle**:  
  $$\mathbf{DRAFT} \longrightarrow \mathbf{PUBLISHED} \longrightarrow \mathbf{SUPERSEDED}$$

### 6.4 Derived Condition: Penutupan Siklus Penuh (`CLOSED_LOOP`)
`isClosedLoopVerified(action_id)` bernilai **TRUE** jika dan hanya jika:
1. `action_id` berstatus `DEPLOYED` (Support) atau `PUBLISHED` (Directive).
2. Terdapat rekor `SchoolAdoptionResponse` (`ADOPTED_IN_PRACTICE` / `ADAPTED_LOCALLY`).
3. Terdapat rekor `ObservedOutcomeEffect` dengan catatan `human_reflective_interpretation`.

---

## 7. Bagian 6: LEARN API & Command Contracts

### 7.1 Foundation Read Queries
- `getFoundationProjections(scope, academic_period_id)`
- `getAnalyticalPatterns(status_filter)`
- `getInstitutionalInsights(category_filter)`
- `getInsightProvenance(insight_id)`
- `getActionLedger(school_id?)`
- `getAdoptionStatus(action_id)`
- `getOutcomeEffects(action_id)`

### 7.2 Foundation Governance Commands
- `reviewInsight(insight_id, decision_type, rationale, action_plan_type)`
- `issueInstitutionalAction(insight_id, action_type, payload)`
- `approveSupportInitiative(action_id)`
- `publishGovernanceDirective(action_id)`

### 7.3 School Contextual Commands
- `recordSchoolAdoption(action_id, adoption_status, local_adaptation_notes)`

### 7.4 Outcome & Learning Commands
- `recordOutcomeMeasurement(action_id, baseline, evaluation, delta, reflection_notes)`
- `verifyClosedLoopCondition(action_id)`

---

## 8. Bagian 7: LEARN Security & Adversarial Test Architecture (Suites 9 s.d. 16)

Stage 4.5 akan diuji dengan 8 modul pengujian ketahanan (*Adversarial Security Suites*):

| Test Suite | Target Invarian | Skenario Uji Ketahanan (Adversarial Case) |
|---|---|---|
| **Suite 9** | *Projection Privacy* | Yayasan memanggil query proyeksi $\rightarrow$ assert 0 nama anak, 0 NIK, 0 narasi mentah. |
| **Suite 10** | *Pattern $\neq$ Insight* | Mesin mendeteksi pola $\rightarrow$ assert pola tidak dapat otomatis memicu aksi tanpa telaah manusia. |
| **Suite 11** | *Foundation Authorization* | Aktor non-Yayasan mencoba menerbitkan direktif $\rightarrow$ assert `FORBIDDEN_ROLE`. |
| **Suite 12** | *Action Lifecycle* | Support berstatus `PROPOSED` dicoba diadopsi sekolah $\rightarrow$ assert `INVALID_ACTION_STATE`. |
| **Suite 13** | *School Adoption* | Yayasan mencoba menandai adopsi atas nama Kepala Sekolah $\rightarrow$ assert `BLOCKED_ROLE`. |
| **Suite 14** | *Non-Causality* | Sistem mencoba mengklaim klausa kausalitas otomatis $\rightarrow$ assert ditolak; wajib refleksi manusia. |
| **Suite 15** | *FB-07 Anti-Reidentification* | Kohor $N = 4$ dievaluasi $\rightarrow$ assert output `is_suppressed === true`. Uji differencing 2 subset yang menyisakan 1 anak $\rightarrow$ assert `SUPPRESSED`. |
| **Suite 16** | *FB-06 Mutation Boundary* | Akun Yayasan memanggil `rpc_record_student_attendance` atau mutasi LPPA $\rightarrow$ assert `MUTATION_REJECTED_FB06`. |

---

## 9. Bagian 8: Sertifikasi Kesiapan Implementasi (Implementation Gate Certified)

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║              STAGE 4.5 — TECHNICAL ARCHITECTURE CERTIFIED (GATE 1)           ║
║                                                                              ║
║  INFORMATION ARCHITECTURE (EIA)       : COMPLETE & BOUNDED                   ║
║  PROJECTION & PRIVACY ENGINE          : K-ANONYMITY & ANTI-DIFFERENCING SEAL ║
║  AUTHORITY & FORBIDDEN MUTATION (FB06): HARD BLOCKED AT RPC/SERVICE LEVEL    ║
║  STATE MACHINES (ASYMMETRICAL ACTIONS): FORMALLY SPECIFIED                   ║
║  ADVERSARIAL TEST ARCHITECTURE        : 8 SUITES SPECIFIED (SUITES 9-16)     ║
║                                                                              ║
║  OVERALL STATUS                       : 🟢 GATE 1 SEALED & READY FOR CODE     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

*Disahkan sebagai Dokumen Desain Teknis & Penegakan Tata Kelola Resmi (Gate 1) Stage 4.5 Yapendik School OS.*
