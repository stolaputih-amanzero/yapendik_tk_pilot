# STAGE 4.3-A — CHILD CONTINUITY DOMAIN MODEL & GOVERNANCE CONTRACT v1.0
## Yapendik School OS — TK Pilot

---

## 1. Executive Summary & Epistemological Stance

Fase 4.3-A mendefinisikan lapisan **Domain Model, Entity Lifecycles, and Governance Contracts** untuk *Child Development & Learning Continuity Loop*.

### Prinsip Inti Arsitektur Kontinuitas:

1. **Continuity as a Derived Read-Model Projection**:
   > `ChildContinuityProfile` **BUKAN** sumber kebenaran baru dan tidak menduplikasi data historis. Profil ini adalah proyeksi dinamis dari `CanonicalPublishedLppaRecord` yang telah berstatus `PUBLISHED`.

2. **Mandatory Historical Anchor**:
   > Setiap `LearningStimulationPlan` **wajib** memiliki `source_historical_baseline_record_id` yang merujuk pada rekor LPPA yang sah. Setiap rencana harus dapat menjawab secara empiris: *"Mengapa stimulasi ini dirancang?"*

3. **System Proposes — Educator Decides**:
   > Terdapat pemisahan tegas antara usulan sistem (`StimulationRecommendation`) dan keputusan pedagogis guru (`TeacherPedagogicalDecision`). Sistem tidak pernah membuat keputusan kurikulum secara otonom.

4. **Home-School Bridge as Scoped Partnership**:
   > Kemitraan orang tua adalah ruang kolaborasi kontekstual di rumah (*Home Reflection*), bukan mekanisme pengubahan asesmen kanonikal sekolah.

---

## 2. Invariant Governance Matrix (Stage 4.3)

| Invariant ID | Nama Invariant | Deskripsi & Penegakan Aturan Tata Kelola |
|---|---|---|
| **CONT-INV-01** | *Derived Projection Only* | `ChildContinuityProfile` dihitung secara dinamis dari catatan LPPA kanonikal yang telah diterbitkan (`PUBLISHED`) dan portofolio observasi. Tidak ada duplikasi rekam medis/perkembangan tersendiri. |
| **CONT-INV-02** | *Mandatory Baseline Anchor* | Entitas `LearningStimulationPlan` wajib memiliki referensi sah ke `source_historical_baseline_record_id`. Pembuatan rencana tanpa jangkar historis akan ditolak. |
| **CONT-INV-03** | *Separation of Suggestion & Decision* | Sistem menghasilkan `system_proposal` (ide sentra & provokasi main), namun status `ACTIVE` hanya dapat dipicu setelah guru kelas mengisi `teacher_decision` yang terotorisasi. |
| **CONT-INV-04** | *Governed Lifecycle State Machine* | Rencana stimulasi mematuhi siklus: `PROPOSED` $\rightarrow$ `TEACHER_REVIEW` $\rightarrow$ `ACTIVE` $\rightarrow$ `COMPLETED` $\rightarrow$ `ARCHIVED`. |
| **CONT-INV-05** | *Invariant C-11 Zero Leakage Quarantine* | Catatan staf rahasia (`is_staff_confidential = true`) 100% diblokir dari proses ekstraksi ide stimulasi maupun proyeksi profil kontinuitas anak. |
| **CONT-INV-06** | *Scoped Guardian Bridge* | Wali murid (`Role: GUARDIAN`) hanya dapat membaca prompt aktivitas rumah dan mengirimkan catatan refleksi keluarga. Umpan balik rumah tidak memutasi rating milestone anak di sistem sekolah. |
| **CONT-INV-07** | *Stage 3 Closed Semester Guard* | Seluruh mutasi rencana stimulasi (`PROPOSED`, `ACTIVE`, `COMPLETED`) mewarisi proteksi `CANNOT_MUTATE_CLOSED_SEMESTER` jika semester target telah ditutup. |
| **CONT-INV-08** | *Strict Non-Goals Enforcement* | Dilarang keras menghasilkan skor ranking kuantitatif, inferensi diagnosis medis/psikologis otomatis, atau automasi evaluasi tanpa keterlibatan guru. |

---

## 3. Lifecycle State Machine: `LearningStimulationPlan`

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│             LEARNING STIMULATION PLAN LIFECYCLE STATE MACHINE               │
│                                                                             │
│   [ Published LPPA ]                                                        │
│           │                                                                 │
│           ▼                                                                 │
│     ┌───────────┐         Guru Menelaah Draf                                │
│     │ PROPOSED  │ ─────────────────────────────────┐                        │
│     └─────┬─────┘                                  │                        │
│           │                                        ▼                        │
│           │ Teacher Opens Workspace       ┌──────────────────┐              │
│           └──────────────────────────────►│  TEACHER_REVIEW  │              │
│                                           └────────┬─────────┘              │
│                                                    │                        │
│                 Guru Menetapkan Keputusan Pedagogis│ (Command 2)            │
│                                                    ▼                        │
│                                           ┌──────────────────┐              │
│                                           │      ACTIVE      │              │
│                                           └────────┬─────────┘              │
│                                                    │                        │
│          Guru Menautkan Bukti Observasi Baru & Goal│ Tercapai (Command 3)   │
│                                                    ▼                        │
│                                           ┌──────────────────┐              │
│                                           │    COMPLETED     │              │
│                                           └────────┬─────────┘              │
│                                                    │                        │
│                    Penutupan Semester / Diarsipkan │                        │
│                                                    ▼                        │
│                                           ┌──────────────────┐              │
│                                           │     ARCHIVED     │              │
│                                           └──────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Tipe Domain & Command Contracts ([`src/types/childContinuityTypes.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/types/childContinuityTypes.ts))

- **Entitas Utama**:
  - `ChildContinuityProfile`: Proyeksi multi-semester 4 elemen PAUD, busur lintasan MB $\rightarrow$ BSH $\rightarrow$ BSB, dan riwayat LPPA.
  - `LearningStimulationPlan`: Entitas rencana kerja stimulasi sentra main berbasis kebutuhan anak.
  - `StimulationRecommendation`: Usulan ide perancah dan provokasi sentra main dari engine.
  - `TeacherPedagogicalDecision`: Penetapan keputusan guru kelas.
  - `ClassroomDevelopmentalHeatmap`: Agregat kesiapan rombel untuk supervisi Kepala Sekolah.

- **Command Contracts**:
  1. `GenerateProposedStimulationPlansCommand`: Membangkitkan draf rencana stimulasi terarah dari rekor LPPA kanonikal.
  2. `ConfirmLearningStimulationPlanCommand`: Mengesahkan rencana stimulasi oleh guru kelas.
  3. `CompleteLearningStimulationPlanCommand`: Menutup tujuan stimulasi dengan bukti observasi kelas baru.
  4. `RecordHomeStimulationFeedbackCommand`: Mencatat umpan balik kemitraan stimulasi di rumah oleh wali murid.

---

## 5. Kesiapan Menuju Fase 4.3-B

Dengan terkuncinya kontrak dan skema pada Fase 4.3-A:
- **Fase 4.3-B** akan membangun `childContinuityService.ts` yang mengimplementasikan query agregasi profil kontinuitas, generator usulan stimulasi sentra main, dan validasi seluruh invarian di atas melalui test suite otomatis (`tests/stage4_3_continuity.test.ts`).
