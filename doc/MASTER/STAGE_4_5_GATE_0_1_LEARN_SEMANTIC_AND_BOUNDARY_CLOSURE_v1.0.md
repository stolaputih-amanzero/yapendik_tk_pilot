# STAGE 4.5 — GATE 0.1: LEARN SEMANTIC & BOUNDARY CLOSURE
## Final Pre-Implementation Governance Specification (v1.0)
### Yapendik School OS — Multi-Unit Institutional Learning Architecture

---

## 1. Executive Intent & Gate 0.1 Scope

Dokumen ini merupakan **Penyegelan Semantik & Batas Otoritas Akhir (Gate 0.1)** sebelum perancangan teknis dan implementasi **Stage 4.5 (Institutional Learning & Multi-School Governance Loop)**.

Dokumen ini mengunci 8 keputusan arsitektur penentu untuk memastikan bahwa lapisan **LEARN** tidak pernah berubah menjadi instrumen pengawasan mikro (*surveillance*), tidak mengklaim kausalitas semu (*pseudo-causality*), dan tidak melanggar batas kedaulatan sekolah.

```text
                     YAPENDIK ARCHITECTURAL BOUNDARY
                     
           ┌──────────────────────────────────────────────────┐
           │ FOUNDATION CONTEXT (LEARN & GOVERNANCE)          │
           │                                                  │
           │  • Derived Multi-School Projections              │
           │  • Minimum Cohort Suppression (FB-07)            │
           │  • Pattern ──► Insight ──► Decision              │
           │  • Canonical action_id Anchor                    │
           │  • Non-Causal Outcome Measurement                │
           └────────────────────────┬─────────────────────────┘
                                    │
                         READ-ONLY PROJECTION ONLY
                       (FB-06: NO CANONICAL MUTATION)
                                    │
                                    ▼
           ┌──────────────────────────────────────────────────┐
           │ SCHOOL CONTEXT (AUTONOMOUS LEADERSHIP)           │
           │                                                  │
           │  • Academic Period & Option A Verification Gate  │
           │  • Contextual Adoption & Local Adaptation Plan   │
           │  • Resolution Console & Handover Reconciliation  │
           └────────────────────────┬─────────────────────────┘
                                    │
                                    ▼
           ┌──────────────────────────────────────────────────┐
           │ CLASSROOM CONTEXT (TEACHER DAILY FLOW)           │
           │                                                  │
           │  • Hari Ini • Belajar & Karya • Siswa & Rapor    │
           │  • Authoritative Formative Observation           │
           └──────────────────────────────────────────────────┘
```

---

## 2. Matriks Lengkap 7 Invarian Yayasan (FB-01 s.d. FB-07)

| Invarian | Nama Invarian | Definisi Teknis & Batas Penegakan |
|---|---|---|
| **FB-01** | *Zero Individual Exposure* | Batas privasi ditegakkan pada layer proyeksi database/service; identitas anak individual dan rekam medis privat 100% diredaksi dari konteks Yayasan. |
| **FB-02** | *Derived Telemetry Only* | Data multi-sekolah murni berupa kalkulasi *on-the-fly*; dilarang membuat tabel status KPI statis yang rentan manipulasi (*anti-gaming*). |
| **FB-03** | *Autonomous Unit Leadership* | Yayasan berperan dalam *stewardship & support*; keputusan operasional dan pedagogis harian tetap menjadi hak mutlak Kepala Sekolah dan Guru. |
| **FB-04** | *No Cross-School Ranking* | Dilarang membuat leaderboard pemeringkatan kompetitif antar sekolah. Data disajikan murni untuk **Equity & Priority Support**. |
| **FB-05** | *Institutional Learning Must Close the Loop* | Setiap wawasan wajib memiliki alur lengkap: $\text{INSIGHT} \rightarrow \text{DECISION} \rightarrow \text{ACTION} \rightarrow \text{ADOPTION} \rightarrow \text{OUTCOME} \rightarrow \text{FEEDBACK}$. |
| **FB-06** | *No Canonical School Mutation from Foundation* | Yayasan **DILARANG KERAS** memutasi data kanonikal sekolah (presensi, observasi, LPPA, catatan murid). Yayasan hanya menerbitkan *Institutional Action*. |
| **FB-07** | *Minimum Aggregation & Anti-Reidentification* | **(BARU)** Jika ukuran populasi kohor $< K_{\min}$ (ambang batas: $N < 5$ anak), hasil persentase agregat wajib disupresi (`SUPPRESSED_SMALL_COHORT`) untuk mencegah re-identifikasi anak perorangan secara deduktif. |

---

## 3. Spesifikasi 8 Keputusan Arsitektur Kunci (Gate 0.1 Closures)

### 3.1 Keputusan 1: Canonical `action_id` sebagai Jangkar Identitas Tunggal
Setiap inisiatif bantuan (*Support Initiative*) maupun direktif kebijakan (*Governance Directive*) diikat oleh satu identitas kanonikal: `action_id`.

```typescript
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
  
  // Specific Execution Payloads (One of two must be present)
  support_payload?: {
    initiative_type: 'TEACHER_COACHING' | 'LEARNING_MATERIALS' | 'SAFETY_EQUIPMENT' | 'SPECIALIST_CONSULTATION';
    resource_allocation_details: string;
    deployed_facilitator_name?: string;
  };
  directive_payload?: {
    directive_code: string;
    advisory_guidelines: string;
    compliance_recommendations: string;
  };

  lifecycle_status: 'PROPOSED' | 'APPROVED' | 'PUBLISHED_DEPLOYED' | 'ADOPTED' | 'CLOSED_LOOP';
}
```

---

### 3.2 Keputusan 2: Semantik Non-Kausal untuk `ObservedOutcomeEffect`
Sistem dilarang menyimpulkan kausalitas otomatis (*"Directive X menyebabkan kenaikan Y"*). Sistem murni mencatat **asosiasi empiris dan selisih matematis ($\Delta$)**, sedangkan pemaknaan dan evaluasi efektivitas menjadi tanggung jawab refleksi manusia.

```typescript
export interface ObservedOutcomeEffect {
  outcome_id: string;
  action_id: string; // Terikat ke canonical action_id
  school_id: string;
  metric_name: string;
  observation_window: {
    baseline_period: string; // e.g. "2025/2026 GANJIL"
    evaluation_period: string; // e.g. "2025/2026 GENAP"
  };
  measurements: {
    baseline_value: number;
    evaluation_value: number;
    delta_absolute: number;
    delta_percentage_pct: number;
  };
  statistical_nature: 'OBSERVED_EMPIRICAL_ASSOCIATION'; // Explicit Non-Causal Semantics
  human_reflective_interpretation: string; // Catatan evaluasi makna oleh Dewan Pengurus / Pimpinan Sekolah
  recorded_by_person_id: string;
  recorded_by_name: string;
  recorded_at: string;
}
```

---

### 3.3 Keputusan 3: Rantai Semantik 3-Tahap (`Pattern` $\rightarrow$ `Insight` $\rightarrow$ `Decision`)
- **Pattern**: Observasi numerik/analitik deterministik hasil kalkulasi mesin (*"STEAM rate 52%"*).
- **Insight**: Wawasan institusional yang telah ditelaah dan divalidasi manusia (*"TK Menteng membutuhkan pengayaan sentra balok"*).
- **Decision Record**: Keputusan sah berjejak audit (*"Disetujui pengiriman fasilitator sentra balok untuk 4 pertemuan"*).

---

### 3.4 Keputusan 4: Penegakan Anti Re-identifikasi Kohor Kecil (Invarian FB-07)
```text
IF (Cohort_Student_Count < 5) THEN
    Display: "SUPPRESSED_DUE_TO_PRIVACY_THRESHOLD (Populasi < 5)"
    Foundation Exposure: 0%
ELSE
    Display: Derived_Percentage_Aggregate (%)
END IF
```

---

### 3.5 Keputusan 5: Permukaan API / RPC Terlarang (Forbidden Surface)
Untuk menegakkan invarian **FB-06**, akun atau kredensial dengan peran Yayasan (`FOUNDATION_DIRECTOR`, `FOUNDATION_TRUSTEE`, `YAPENDIK_SUPERADMIN`) **DIBLOKIR SECARA ABSOLUT** dari pemanggilan RPC/Endpoint berikut:

```text
❌ DIBLOKIR UNTUK YAYASAN:
  • rpc_record_student_attendance
  • rpc_create_teacher_observation
  • rpc_update_lppa_narrative
  • rpc_mutate_child_dossier
  • rpc_override_teacher_milestone_rating
```

---

### 3.6 Keputusan 6: Prinsip UX Guru "OS Menghilang ke Dalam Hari Guru"
Hasil analitik Yayasan yang mengalir kembali ke sekolah diubah menjadi **konteks pendampingan yang sederhana bagi guru**:
- Guru tidak pernah melihat grafik multi-sekolah atau kalkulasi regresi yang rumit.
- Guru hanya menerima dukungan konkret: *"Fasilitator Sentra Balok hadir mendampingi kelas bermain hari Kamis"* atau *"Tersedia bahan loose-parts baru di loker sentra"*.

---

### 3.7 Keputusan 7: Hierarki Konteks & Jalur Transmisi Otoritas

$$\mathbf{FOUNDATION\ CONTEXT} \xrightarrow[\text{Support / Directive}]{\text{Institutional Action}} \mathbf{SCHOOL\ CONTEXT} \xrightarrow[\text{Contextual Guidance}]{\text{Local Schedule}} \mathbf{CLASSROOM\ CONTEXT} \longrightarrow \mathbf{CHILD}$$

---

### 3.8 Keputusan 8: Kondisi Penutupan Siklus Institusional (`CLOSED_LOOP`)
Status `CLOSED_LOOP` hanya tercapai apabila seluruh rantai berikut terekam:
1. `action_id` diterbitkan dan berstatus `PUBLISHED_DEPLOYED`.
2. Kepala Sekolah mencatat `SchoolAdoptionResponse` (`ADOPTED_IN_PRACTICE` atau `ADAPTED_LOCALLY`).
3. Evaluasi periode berikutnya merekam `ObservedOutcomeEffect` dengan catatan refleksi kualitatif manusia.

---

## 4. Deklarasi Kelayakan Implementasi (Implementation Readiness Declaration)

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║             STAGE 4.5 — IMPLEMENTATION READINESS CERTIFICATION               ║
║                                                                              ║
║  GATE 0 (CONTRACT HARDENING)          : PASSED & SEALED                      ║
║  GATE 0.1 (SEMANTIC & BOUNDARY)       : PASSED & SEALED                      ║
║  INVARIANTS ACTIVE                    : FB-01 s.d. FB-07                     ║
║  CANONICAL ANCHOR                     : action_id ROOT IDENTITY              ║
║  NON-CAUSALITY SEMANTICS              : FORMALLY ENFORCED                    ║
║  ANTI RE-IDENTIFICATION (FB-07)       : K-ANONYMITY COHORT SUPPRESSION       ║
║  FORBIDDEN MUTATION SURFACE (FB-06)   : HARD BLOCKED                         ║
║                                                                              ║
║  OVERALL READINESS                    : 🟢 GO FOR STAGE 4.5 ARCHITECTURE     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

*Dokumen ini menjadi ketetapan batas tata kelola final (Gate 0.1) untuk memulai perancangan modul teknis Stage 4.5 Yapendik School OS.*
