# YAPENDIK INSTITUTIONAL LEARNING LOOP — CONTRACT HARDENING & IMPLEMENTATION READINESS
## Gate 0 Architecture Specification (v1.0)
### Yapendik School OS — Multi-Unit Foundation Architecture

---

## 1. Executive Context & Gate 0 Purpose

Dokumen ini merupakan **Spesifikasi Pengerasan Kontrak (Contract Hardening)** untuk **Yapendik Institutional Learning & Governance Loop (LEARN)**. 

Dokumen ini berfungsi sebagai **Gate 0** sebelum pembukaan fase implementasi, mengunci secara deterministik 7 penyempurnaan tata kelola:
1. **Insight Provenance & Traceability** (Asal-usul kalkulasi tanpa ekspos data anak).
2. **Pemisahan `Pattern` (Deteksi Mesin) vs `Insight` (Telaah Manusia)**.
3. **Audited Decision Record** (Bukan sekadar enum status).
4. **Lifecycle Asimetris: Support Initiative vs Governance Directive**.
5. **Generalisasi `SchoolAdoptionResponse`** melalui abstraksi `InstitutionalAction`.
6. **Kontrak Komparasi Empiris `ObservedOutcomeEffect`** (Sistem menghitung $\Delta$, manusia memaknai hasil).
7. **Penegakan Invarian Mutlak FB-06 (*No Canonical School Mutation*)** dan hierarki konteks kanonikal.

```text
               YAPENDIK HARDENED INSTITUTIONAL OPERATING LOOP
               
                    ┌──────────────────────────────────────┐
                    ▼                                      │
              SCHOOL REALITY                               │
         (Fakta Operasional Rombel)                        │
                    │                                      │
                    ▼                                      │
          DERIVED PROJECTION ENGINE                        │
         (Agregasi Privasi Mutlak FB-01)                   │
                    │                                      │
                    ▼                                      │
           ANALYTICAL PATTERN                              │
          (Observasi Analitik Mesin)                       │
                    │                                      │
                    ▼                                      │
          INSTITUTIONAL INSIGHT                            │
         (Temuan Terverifikasi dengan                      │
           Provenance Matematis)                           │
                    │                                      │
                    ▼                                      │
          HUMAN DECISION RECORD                            │
         (Dewan Pengurus Yayasan)                          │
                    │                                      │
           ┌────────┴────────┐                             │
           ▼                 ▼                             │
   SUPPORT INITIATIVE  GOVERNANCE DIRECTIVE                │
   (Alokasi Bantuan)   (Panduan Kebijakan)                 │
           │                 │                             │
           └────────┬────────┘                             │
                    ▼                                      │
       INSTITUTIONAL ACTION ENVELOPE                       │
                    │                                      │
                    ▼                                      │
          HEADMASTER CONTEXTUAL                            │
                ADOPTION                                   │
          (Adopsi Satuan Sekolah)                          │
                    │                                      │
                    ▼                                      │
         MEASURED OUTCOME EFFECT                           │
        (Perhitungan Delta Empiris)                        │
                    │                                      │
                    ▼                                      │
        HUMAN REFLECTION & LEARNING                        │
                    │                                      │
                    └──────────────────────────────────────┘
```

---

## 2. Invarian Tata Kelola Lengkap (FB-01 s.d. FB-06)

| Invarian | Nama Invarian | Deskripsi & Penegakan Teknis |
|---|---|---|
| **FB-01** | *Zero Individual Exposure* | Batas privasi ditegakkan pada layer proyeksi service; dilarang keras meloloskan identitas anak, rekam medis privat, atau catatan guru ke konteks Yayasan. |
| **FB-02** | *Derived Telemetry Only* | Data multi-sekolah murni berupa kalkulasi *on-the-fly*; dilarang membuat tabel status KPI statis/mutable yang dapat dimanipulasi (*anti-gaming*). |
| **FB-03** | *Autonomous Unit Leadership* | Yayasan berperan dalam *stewardship & support*; keputusan operasional dan pedagogis harian tetap menjadi kedaulatan mutlak Kepala Sekolah dan Guru. |
| **FB-04** | *No Cross-School Ranking* | Telemetri multi-sekolah dirancang untuk **Equity & Priority Support**, dilarang membuat antarmuka pemeringkatan kompetitif atau pelabelan sekolah. |
| **FB-05** | *Institutional Learning Must Close the Loop* | Wawasan institusional wajib memiliki alur lengkap: $\text{INSIGHT} \rightarrow \text{DECISION} \rightarrow \text{ACTION} \rightarrow \text{ADOPTION} \rightarrow \text{OUTCOME} \rightarrow \text{FEEDBACK}$. |
| **FB-06** | *No Canonical School Mutation from Foundation* | **(BARU)** Lapisan Yayasan **DILARANG KERAS** memutasi data kanonikal sekolah (presensi, observasi, LPPA, catatan murid). Yayasan hanya menerbitkan *Institutional Action*; penerapan mutasi ke fakta operasional menjadi wewenang eksklusif satuan sekolah. |

---

## 3. Spesifikasi Domain Model yang Telah Dikeraskan (Hardened DTOs)

### 3.1 Pattern vs Insight dengan Provenance Lengkap
```typescript
// Objek Derivasi Mesin (Machine-Detected Analytical Pattern)
export interface DerivedAnalyticalPattern {
  pattern_id: string;
  source_projection: 'CURRICULUM_DOMAIN_DISTRIBUTION' | 'SAFETY_INTEGRITY_INDEX' | 'ATTENDANCE_STABILITY';
  target_school_id?: string; // Kosong jika pola lintas seluruh sekolah
  observation_window: {
    academic_year_id: string;
    semester: 'GANJIL' | 'GENAP';
    start_date: string;
    end_date: string;
  };
  aggregation_rule: string; // e.g. "PERCENTAGE_BELOW_THRESHOLD(STEAM, 60)"
  threshold_rule_version: string; // e.g. "RULE_V1.2_TK_STEAM_BENCHMARK"
  detected_signal_summary: string;
  computed_metric_value: number;
  detected_at: string;
}

// Objek Temuan Institusional (Human-Reviewable Institutional Insight)
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

// Rekor Keputusan Telaah Wawasan (Audited Insight Decision Record)
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
```

---

### 3.2 Abstraksi Institutional Action & Asimetri Siklus Hidup

```typescript
export type InstitutionalActionType = 'SUPPORT_INITIATIVE' | 'GOVERNANCE_DIRECTIVE';

// Abstraksi Payung Aksi Institusi
export interface InstitutionalActionEnvelope {
  action_id: string;
  action_type: InstitutionalActionType;
  originating_insight_id: string;
  target_scope: 'ALL_TK_UNITS' | 'SPECIFIC_SCHOOL';
  target_school_id?: string;
  title: string;
  summary: string;
  issued_by_name: string;
  issued_at: string;
}

// Jalur 1: Support Initiative (Pemberian Dukungan Fasilitator / Sarana)
export interface SupportInitiative {
  initiative_id: string;
  originating_insight_id: string;
  target_school_id: string;
  initiative_type: 'TEACHER_COACHING' | 'LEARNING_MATERIALS' | 'SAFETY_EQUIPMENT' | 'SPECIALIST_CONSULTATION';
  title: string;
  resource_description: string;
  allocated_by_person_id: string;
  allocated_by_name: string;
  allocated_at: string;
  execution_status: 'PROPOSED' | 'APPROVED' | 'DEPLOYED' | 'COMPLETED';
}

// Jalur 2: Governance Directive (Penerbitan Kebijakan / SOP Yayasan)
export interface GovernanceDirective {
  directive_id: string;
  directive_code: string; // e.g. "DIR-2026-STEAM-01"
  title: string;
  policy_intent: string;
  advisory_guidance: string;
  target_audience: 'ALL_TK_UNITS' | 'SPECIFIC_SCHOOL';
  target_school_id?: string;
  issued_by_person_id: string;
  issued_by_name: string;
  effective_date: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SUPERSEDED';
}
```

---

### 3.3 Generalisasi Adopsi Sekolah & Pengukuran Dampak Empiris

```typescript
// Respon & Adaptasi Satuan Sekolah Terhadap Aksi Institusi
export interface SchoolAdoptionResponse {
  response_id: string;
  institutional_action_id: string; // Menunjuk ke initiative_id ATAU directive_id
  action_type: InstitutionalActionType;
  school_id: string;
  headmaster_person_id: string;
  headmaster_name: string;
  adoption_status: 'ACKNOWLEDGED' | 'ADOPTED_IN_PRACTICE' | 'ADAPTED_LOCALLY' | 'DEFERRED';
  local_context_adaptation_notes: string;
  action_timeline: string;
  acknowledged_at: string;
}

// Pengukuran Dampak Empiris Siklus Berikutnya (Evidence-Based Outcome)
export interface ObservedOutcomeEffect {
  outcome_id: string;
  institutional_action_id: string;
  school_id: string;
  metric_definition: string;
  baseline_measurement: {
    period_name: string;
    metric_value: number;
    unit_of_measure: string;
  };
  evaluation_measurement: {
    period_name: string;
    metric_value: number;
    unit_of_measure: string;
  };
  delta_change: {
    absolute_delta: number;
    percentage_change_pct: number;
  };
  human_qualitative_interpretation: string; // Interpretasi makna oleh manusia, bukan kesimpulan otomatis mesin
  closed_loop_verified: boolean;
  evaluated_by_name: string;
  evaluated_at: string;
}
```

---

## 4. Hirarki Konteks Kanonikal (Context Hierarchy Lock)

Konteks berakar dari yurisdiksi tertinggi menuju unit operasional tanpa pernah memotong jalur:

```text
1. FOUNDATION CONTEXT (Jurisdiksi Yayasan Multi-Sekolah)
   │ • Multi-Unit Aggregations
   │ • Institutional Insights
   │ • Support Initiatives & Governance Directives Ledgers
   │
   ▼
2. SCHOOL CONTEXT (Konteks Satuan Sekolah - Canonical Operational Root)
   │ • Academic Period & Semester State Machine
   │ • School Adoption Responses & Incident Lifecycles
   │ • Handover Reconciliation & LPPA Approval Gates
   │
   ▼
3. CLASSROOM CONTEXT (Konteks Rombongan Belajar)
   │ • Pendidik, Sentra Bermain, Jadwal Rombel
   │ • Classroom Pulse & Sinyal Keselamatan Kelas
   │
   ▼
4. CHILD CONTEXT (Konteks Peserta Didik)
     • Portofolio Bukti Karya, Narasi Capaian LPPA, Lintasan Kontinuitas
```

---

## 5. Matriks Kesiapan Implementasi (Gate 0 Verification Scorecard)

| Item Verifikasi Kontrak | Standar Penegakan | Status Gate 0 |
|---|---|---|
| **Provenance Traceability** | Insight mencatat `source_projection`, `aggregation_rule`, dan `threshold_rule_version`. | 🟢 TERVERIFIKASI |
| **Pattern $\neq$ Insight** | Pola dihasilkan deterministik oleh mesin; wawasan disahkan oleh manusia. | 🟢 TERVERIFIKASI |
| **Audited Decision Record** | Keputusan penelaahan wawasan mencatat `who`, `when`, `why`, dan `action_type`. | 🟢 TERVERIFIKASI |
| **Asymmetrical Lifecycles** | `SupportInitiative` (`DEPLOYED`) dan `GovernanceDirective` (`PUBLISHED`) memiliki siklus independen. | 🟢 TERVERIFIKASI |
| **Universal Action Envelope** | `SchoolAdoptionResponse` mengadopsi baik bantuan materiil maupun kebijakan regulatif. | 🟢 TERVERIFIKASI |
| **Non-Judgmental Outcome** | Sistem menyajikan fakta $\Delta$, makna efektivitas dinilai oleh aktor manusia. | 🟢 TERVERIFIKASI |
| **Invarian FB-06** | Tidak ada wewenang mutasi data mentah sekolah dari level Yayasan. | 🟢 TERVERIFIKASI |

---

*Disahkan sebagai Dokumen Kontrak Pengerasan & Gerbang Kesiapan Implementasi (Gate 0) Tahap Pembelajaran Institusional Yayasan Yapendik.*
