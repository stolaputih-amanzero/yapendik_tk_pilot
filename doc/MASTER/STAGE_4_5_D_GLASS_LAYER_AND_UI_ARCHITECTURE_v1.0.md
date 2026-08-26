# STAGE 4.5-D THE GLASS LAYER & UI/UX ARCHITECTURE v1.0
## Yapendik School OS — TK Pilot
### Multi-Unit Institutional Stewardship & School Adoption Interface Specification

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS) — TK Pilot  
**Document ID:** `STAGE_4_5_D_GLASS_LAYER_AND_UI_ARCHITECTURE_v1.0`  
**Milestone:** Stage 4.5-D — The Glass Layer (Frontend Stewardship & Adoption Hub)  
**Status:** **🟢 ARCHITECTURAL CONTRACT & UI SPECIFICATION**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2 & Gate 0.1 s.d. Gate 3 Review Process  
**Prerequisites & Context:**  
- `doc/MASTER/STAGE_4_5_GATE_1_TECHNICAL_ARCHITECTURE_AND_ENFORCEMENT_DESIGN_v1.0.md` (Gate 1 API Contracts)  
- `doc/MASTER/STAGE_4_5_A_DOMAIN_MODEL_AND_INVARIANT_CONTRACTS_v1.0.md` (Gate 2 Domain Contracts)  
- `doc/MASTER/STAGE_4_5_C_SERVICE_LAYER_AND_PROJECTION_ARCHITECTURE_v1.0.md` (Gate 3 Backend & Projection Engine)  
- `doc/MASTER/STAGE_5_POST_MILESTONE_ARCHITECTURE_REVIEW_v1.0.md` (Hardened Enterprise Infrastructure Baseline)  

---

## 1. Executive Summary: The Glass Layer Mandate

Tahap implementasi backend dan basis data (Stage 4.5-A s.d. 4.5-C) serta pengerasan infrastruktur (Stage 5) telah berhasil membangun fondasi tata kelola multi-sekolah yang kokoh. Namun, sebuah sistem perangkat lunak pendidikan akan kehilangan esensi kemanusiaannya jika antarmuka visualnya gagal merefleksikan nilai-nilai etis yang menjadi landasan sistem tersebut.

**The Glass Layer (Lapisan Kaca)** adalah arsitektur antarmuka pengguna (*Frontend*) yang dirancang dengan satu mandat utama:

> **"OS Menghilang ke Dalam Hari Kerja — Bukan Sebagai Alat Pengawasan Mikro (Surveillance), Melainkan Sebagai Kokpit Pelayanan & Dukungan Kelembagaan (Institutional Stewardship & Support Cockpit)."**

```text
═══════════════════════════════════════════════════════════════════════════════════════════
                      THE GLASS LAYER (PROJECTION ONLY ARCHITECTURE)
═══════════════════════════════════════════════════════════════════════════════════════════

   ┌─────────────────────────────────────────────────────────────────────────────────┐
   │ 🏛️ FOUNDATION GOVERNANCE WORKSPACE          🏫 HEADMASTER ADOPTION WORKSPACE    │
   │    • Aggregated Projections (Zero PII)       • Contextual Adoption Inbox        │
   │    • PrivacyShield Guarded Heatmaps          • Local Implementation Notes       │
   │    • Institutional Action Ledger             • Qualitative Outcome Reflection   │
   └────────────────────────────────────────┬────────────────────────────────────────┘
                                            │ Pure Read Projections & Governed Actions
                                            ▼
   ┌─────────────────────────────────────────────────────────────────────────────────┐
   │ 🔒 BACKEND PROJECTION ENGINE & SERVICE LAYER (STAGE 4.5-C)                      │
   │    Anti-Differencing Engine • FB-06 Mutation Hard Block • Kmin >= 5 Redactor    │
   └─────────────────────────────────────────────────────────────────────────────────┘
```

### Prinsip Arsitektur Utama:
1. **Pure Projection (Zero Direct Client DML)**: Frontend tidak pernah mengirim query `INSERT`/`UPDATE` langsung ke 15 tabel kanonikal sekolah. Seluruh visualisasi data agregat adalah hasil proyeksi *on-the-fly* dari backend yang telah teredaksi.
2. **Zero PII Rendering for Foundation**: Tidak ada satupun elemen visual (tabel, kartu, grafik, tooltip) di area Yayasan yang merender nama anak, NIK, NIS, atau foto wajah siswa.
3. **Anti-Panopticon Design**: UI sengaja dirancang tanpa tombol "Ubah Data Sekolah", "Ranking Sekolah", atau "Beri Nilai Rapor" di sisi Yayasan (`FB-04` & `FB-06`).
4. **Honest Typography (Non-Causal Lexicon)**: Seluruh metrik evaluasi hasil disajikan dengan tipografi etis yang membedakan asosiasi empiris dari klaim kausalitas mutlak (`H-02` & `FB-05`).

---

## 2. Workspace Topology & Routing Architecture

Topologi navigasi dan ruang kerja (*Workspace*) dipisahkan secara tegas berdasarkan `SecurityContext.role`. Pengguna tidak dapat berpindah rute di luar batas otorisasi institusionalnya.

```text
                               ┌───────────────────────────┐
                               │   AUTHENTICATED SESSION   │
                               │   (SecurityContext Gate)  │
                               └─────────────┬─────────────┘
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
       [Role: FOUNDATION_* / SUPERADMIN]              [Role: HEADMASTER / PRINCIPAL]
                      │                                             │
      ┌───────────────┴───────────────┐             ┌───────────────┴───────────────┐
      │ FOUNDATION GOVERNANCE CONSOLE │             │     HEADMASTER ADOPTION HUB   │
      │        (/foundation/*)        │             │      (/school/adoption/*)     │
      └───────────────────────────────┘             └───────────────────────────────┘
```

### 2.1 Foundation Governance Console (`/foundation/*`)

Diakses secara eksklusif oleh peran Dewan Yayasan (`FOUNDATION_DIRECTOR`, `FOUNDATION_TRUSTEE`, `SUPERADMIN`, `SUPERVISOR`, `AUDITOR`).

| Path Rute | Nama Tampilan | Deskripsi Fungsional & Kontrak Data |
|---|---|---|
| `/foundation/projections` | **Multi-School Stewardship Heatmap** | Menampilkan agregasi distribusi capaian 6 domain perkembangan PAUD per unit sekolah. Memasang `<PrivacyShield />` pada sel data yang memiliki $N < 5$ atau risiko *differencing*. |
| `/foundation/insights` | **Pattern Analysis & Insight Studio** | Ruang kerja peninjauan temuan analitis sistem (*Derived Analytical Patterns*). Dewan Yayasan memvalidasi pola menjadi keputusan resmi (*Institutional Decision*). |
| `/foundation/actions` | **Institutional Action Ledger** | Buku besar tindakan kelembagaan (*Support* vs *Directive*). Memuat status siklus tertutup (*Closed-Loop Tracker*) dan tautan jangkar `action_id`. |

### 2.2 Headmaster Adoption Hub (`/school/adoption/*`)

Diakses secara eksklusif oleh Kepala Sekolah unit yang terautentikasi (`HEADMASTER`).

| Path Rute | Nama Tampilan | Deskripsi Fungsional & Kontrak Data |
|---|---|---|
| `/school/adoption/inbox` | **Action Inbox & Directives** | Daftar aksi/dukungan yang ditujukan ke unit sekolah yang bersangkutan. Menampilkan rincian dukungan, target capaian, dan alasan kebijakan. |
| `/school/adoption/responses` | **Local Adaptation & Outcome Studio** | Formulir pencatatan respons adopsi lokal (`ACCEPTED`, `MODIFIED_LOCALLY`, `DEFERRED`). Tempat Kepala Sekolah mengisi refleksi manusiawi (*Qualitative Human Reflection*) dan data dampak pasca-implementasi. |

---

## 3. UI Invariants & Component Contracts (The Defense-in-Depth Glass)

Komponen UI tingkat rendah (*atomic components*) memegang tanggung jawab kritis dalam mempertahankan invarian tata kelola secara visual.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          ATOMIC DEFENSE-IN-DEPTH UI COMPONENTS                         │
├──────────────────────────┬──────────────────────────┬──────────────────────────────────┤
│ Component Name           │ Invariant Enforced       │ Visual Behavior                  │
├──────────────────────────┼──────────────────────────┼──────────────────────────────────┤
│ `<PrivacyShield />`      │ FB-07 & Kmin >= 5        │ Frosted Glass + Lock Icon + Tip  │
│ `<NonCausalDelta />`     │ H-02 & FB-05 (Asosiasi)  │ Metric Badge + Ethics Subtitle   │
│ `<CanonicalAnchor />`    │ H-06 & Action Anchoring  │ Immutable Monospace Trace Badge  │
│ `<ForbiddenActionGate />`│ FB-06 (Mutation Hard Blk)│ Suppresses Mutation Buttons      │
└──────────────────────────┴──────────────────────────┴──────────────────────────────────┘
```

### 3.1 The `<PrivacyShield />` Component (FB-07 K-Anonymity & Anti-Differencing)

Komponen ini membungkus representasi angka metrik agregat. Jika backend menandai data sebagai `SUPPRESSED_SMALL_COHORT` atau `SUPPRESSED_DIFFERENCING_RISK`, komponen menolak merender angka dan menampilkan visualisasi privasi.

#### Component Contract (Interface Specification):
```typescript
export interface PrivacyShieldProps {
  exposureStatus: 'VISIBLE' | 'SUPPRESSED_SMALL_COHORT' | 'SUPPRESSED_DIFFERENCING_RISK';
  sampleSize: number;
  metricValue?: number;
  metricLabel: string;
  format?: 'PERCENTAGE' | 'COUNT' | 'AVERAGE';
}
```

#### Visual Behavior Matrix:
* **Status `VISIBLE`**: Merender angka dengan format yang ditentukan (misal: `84.5%`).
* **Status `SUPPRESSED_SMALL_COHORT` ($N < 5$)**: Merender badge abu-abu dengan efek *frosted blur*, ikon gembok kecil, dan teks `"Tersupresi (N < 5)"`. Tooltip edukatif menampilkan: *"Data dilindungi untuk menjaga privasi anak pada kelompok observasi kecil ($N = {sampleSize}$)."*
* **Status `SUPPRESSED_DIFFERENCING_RISK`**: Merender badge kuning keemasan dengan teks `"Tersupresi (Risiko Diferensiasi)"`. Tooltip edukatif menampilkan: *"Selisih data populasi berisiko membuka identitas individu ($N_{\text{diff}} < 5$)."*

---

### 3.2 The `<NonCausalDelta />` Component (H-02 & FB-05 Non-Causal Semantics)

Komponen ini menyajikan hasil perubahan sebelum dan sesudah intervensi tindakan kelembagaan.

#### Component Contract (Interface Specification):
```typescript
export interface NonCausalDeltaProps {
  baselineValue: number;
  outcomeValue: number;
  delta: number;
  unit?: string;
  statisticalNature: 'OBSERVED_EMPIRICAL_ASSOCIATION';
  qualitativeReflection: string;
  evaluatedAt: string;
}
```

#### Visual & Typography Rules:
1. **The Delta Badge**: Menampilkan $\Delta$ dengan warna netral/hijau lembut (misal: `+12.4%`).
2. **Mandatory Ethical Lexicon Footnote**: Di bawah angka perubahan, wajib dirender teks tipografi mikro (*fine print*) berbunyi:
   > *"Asosiasi Empiris Teramati ($\Delta$). Perubahan metrik mencerminkan dinamika lapangan, bukan pembuktian hubungan sebab-akibat deterministik."*
3. **Qualitative Reflection Callout**: Menampilkan kutipan refleksi kualitatif Kepala Sekolah di dalam kotak *quote* berlatar lembut:
   > *"Pendidik merasa penambahan balok unit kayu meningkatkan kolaborasi verbal anak secara alami selama sesi sentra main."*

---

### 3.3 The `<CanonicalAnchor />` Badge Component (H-06 Action Anchoring)

Komponen penunjuk identitas tunggal yang merekatkan Insight, Keputusan Yayasan, Aksi Sekolah, dan Dampak Lapangan.

#### Component Contract (Interface Specification):
```typescript
export interface CanonicalAnchorProps {
  actionId: string; // e.g. "act_2026_q1_curriculum_support_01"
  status: 'DRAFT' | 'APPROVED' | 'DEPLOYED' | 'ADOPTED' | 'MEASURED' | 'COMPLETED';
  isClosedLoop: boolean;
  createdAt: string;
}
```

#### Visual Behavior:
* Merender ID berfont *monospace* dengan ikon jangkar (`Anchor`).
* Mengklik badge akan membuka *Drawer Audit Trail* yang menampilkan riwayat perjalanan aksi dari hari pertama diterbitkan hingga siklus tertutup.
* Dilengkapi status visual: `DEPLOYED` (Biru), `ADOPTED` (Ungu), `COMPLETED / CLOSED-LOOP` (Hijau Berpendar).

---

## 4. State Management & Data Fetching Strategy

Lapisan kaca mengandalkan pemisahan ketat antara *Read Projections* dan *Command Actions*.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DATA FETCHING & MUTATION STRATEGY                               │
├─────────────────────────┬──────────────────────────┬───────────────────────────────────┤
│ Pola Interaksi          │ Endpoint / Service Method│ Strategi Konsistensi Cache        │
├─────────────────────────┼──────────────────────────┼───────────────────────────────────┤
│ Read Projections        │ `getMultiSchoolSummary()`│ Stale-Time: 5 Menit (Edge Cached) │
│ Action Ledger Poll      │ `getActionLedger()`      │ Invalidation pasca adopsi/mutasi │
│ Issue Action Command    │ `issueAction()`          │ Strict Confirmation (No Optimism) │
│ Record Adoption Command │ `recordAdoption()`       │ Strict Confirmation (No Optimism) │
│ Verify Closed-Loop RPC  │ `verifyClosedLoop()`     │ Real-Time Transactional Check     │
└─────────────────────────┴──────────────────────────┴───────────────────────────────────┘
```

### 4.1 Strict Consistency vs Optimistic UI Rules

Untuk menjaga integritas tata kelola hukum pendidikan:
* **Area Optimistic UI (Boleh Cepat)**: 
  * Filter pencarian tabel, pemilihan tahun ajaran, penggantian tab rute, toggle visualisasi.
* **Area Strict Server Consistency (Dilarang Optimistic)**:
  * Pengesahan Aksi Yayasan (`issueInstitutionalAction`): Tombol disabled dan menampilkan *spinner* hingga respons database sukses.
  * Pencatatan Adopsi Unit (`recordSchoolAdoption`): Wajib menunggu konfirmasi transaksi PostgreSQL sebelum status visual berpindah.
  * Penutupan Siklus (`verifyClosedLoopCondition`): Memerlukan verifikasi RPC kriptografis sebelum menyalakan lencana *Closed-Loop*.

### 4.2 Cache Invalidation Flow
Ketika Kepala Sekolah menyimpan respons adopsi di unitnya:
1. Mutasi `recordSchoolAdoption` dieksekusi.
2. React Query memicu *targeted invalidation* untuk query keys:
   * `['foundation', 'actions', 'ledger']`
   * `['school', 'adoption', 'inbox']`
   * `['school', 'adoption', actionId]`
3. Layanan tidak me-refresh seluruh database, melainkan hanya node proyeksi terkait.

---

## 5. The Closed-Loop Visualizer (UX Highlight)

Sesuai mandat **Gate 0.1 Decision 8 (Closed-Loop Operational Requirement)**, setiap inisiatif kelembagaan yang diterbitkan oleh Yayasan wajib memiliki visualisasi perjalanan siklus tertutup (*Closed-Loop Stepper*).

```text
═══════════════════════════════════════════════════════════════════════════════════════════
                      THE CLOSED-LOOP INTERACTIVE TIMELINE (UX)
═══════════════════════════════════════════════════════════════════════════════════════════

    [1. INSIGHT] ────────► [2. ACTION] ────────► [3. ADOPTION] ────────► [4. OUTCOME]
   Pola Terdeteksi         Diterbitkan Yayasan   Diadopsi Unit Sekolah    Evaluasi Dampak
    (N=14 Siswa)             (Dukungan APE)      (Modifikasi Jadwal)      (Δ = +12.4%)
         │                          │                     │                     │
         ▼                          ▼                     ▼                     ▼
    🟢 TERVERIFIKASI       🟢 DEPLOYED           🟢 DITERIMA UNIT       🟢 EVALUASI LENGKAP
                                                                                │
                                                                                ▼
                                                                      ╔═══════════════════╗
                                                                      ║ 🏁 CLOSED-LOOP    ║
                                                                      ║    TRANSAKSI RESMI║
                                                                      ╚═══════════════════╝
```

### Detail Tahapan Visual:
1. **Langkah 1 (Insight Anchor)**: Menampilkan tanggal deteksi pola dan kategori domain Kurikulum Merdeka.
2. **Langkah 2 (Action Deployment)**: Menampilkan apakah aksi bersifat *Support* (Bantuan APE/Pelatihan) atau *Directive* (Kebijakan).
3. **Langkah 3 (School Adoption)**: Menampilkan nama Kepala Sekolah yang mengonfirmasi adopsi dan catatan adaptasi lokalnya.
4. **Langkah 4 (Outcome Measurement)**: Menampilkan metrik delta $\Delta$ pasca-intervensi dan narasi kualitatif guru/kepala sekolah.
5. **Simbol Siklus Tertutup (Closed-Loop Seal)**: Menampilkan lencana hijau bercahaya yang menandakan bahwa kebijakan ini telah menyelesaikan pertanggungjawaban etis penuh (*Zero Verification Debt*).

---

## 6. Adversarial UI Test Specifications (Suites 24 & 25)

Untuk menjamin bahwa batasan arsitektur tidak bocor ke lapisan visual, dua suite pengujian antarmuka otomatis (*Adversarial Frontend Tests*) ditetapkan:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        ADVERSARIAL UI TEST SUITE ARCHITECTURE                          │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ Test Suite                     │ Invariant Verification Scope                          │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ **Suite 24: UI PII Leak Guard**│ DOM Scraper Assertion (Anti Child Data Exfiltration)  │
│ **Suite 25: UI Mutation Guard**│ DOM Element Presence Assertion (Anti Foundation DML)  │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

### 6.1 Test Suite 24: UI PII Leak & Redaction Assertion
* **Target Rute**: `/foundation/projections`, `/foundation/insights`, `/foundation/actions`.
* **Skenario Adversarial**:
  1. Render tampilan Yayasan dengan dataset sampel yang memuat 50 anak.
  2. Scrape seluruh text content dan atribut HTML di dalam DOM (`document.body.innerHTML`).
  3. **Assertion 1**: Assert bahwa tidak ada string yang cocok dengan format NIK (16 digit angka) atau NIS (10 digit angka).
  4. **Assertion 2**: Assert bahwa tidak ada nama lengkap siswa dari database yang muncul di DOM teks Yayasan.
  5. **Assertion 3**: Assert bahwa elemen gambar (`<img />`) di area Yayasan tidak memuat URL foto observasi siswa privat.

### 6.2 Test Suite 25: Forbidden Mutation UI Block Assertion
* **Konteks Pengguna**: `role: 'FOUNDATION_DIRECTOR'`.
* **Skenario Adversarial**:
  1. Navigasikan pengguna ke seluruh rute aplikasi.
  2. **Assertion 1 (No Classroom Edit Buttons)**: Periksa ketiadaan tombol dengan label `"Edit Presensi"`, `"Tambah Observasi"`, atau `"Ubah Nilai Rapor"`.
  3. **Assertion 2 (No Cross-School Leaderboard)**: Periksa bahwa tabel perbandingan sekolah tidak memiliki kolom `"Peringkat"`, `"Ranking"`, atau `"Skor Juara"` (`FB-04 Anti-Ranking`).
  4. **Assertion 3 (Direct DML Barrier)**: Memastikan form Yayasan hanya mampu memicu endpoint `issueInstitutionalAction` dan tidak memiliki akses ke state form kelas.

---

## 7. Rangkuman Matriks Kepatuhan Tata Kelola

```text
╔═══════════════════════════════════════════════════════════════════════════════════════════╗
║               STAGE 4.5-D THE GLASS LAYER — GOVERNANCE COMPLIANCE MATRIX                  ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║  Gate 0.1 Invariant FB-01 (Zero PII for Foundation)   : 🟢 100% ENFORCED VIA PROJECTIONS  ║
║  Gate 0.1 Invariant FB-03 (School Adoption Autonomy)  : 🟢 100% ENFORCED VIA INBOX HUB    ║
║  Gate 0.1 Invariant FB-04 (Anti-Ranking / No League)  : 🟢 100% ENFORCED VIA DESIGN TOKENS║
║  Gate 0.1 Invariant FB-05 (Non-Causal Lexicon)        : 🟢 100% ENFORCED VIA TYPOGRAPHY   ║
║  Gate 0.1 Invariant FB-06 (No Foundation Mutations)   : 🟢 100% ENFORCED VIA SUITE 25 DOM ║
║  Gate 0.1 Invariant FB-07 (Kmin >= 5 Privacy Shield)  : 🟢 100% ENFORCED VIA COMPONENT    ║
║  Stage 4.5-A Invariant H-01 (Payload Immutability)    : 🟢 100% ENFORCED VIA ACTION BADGE ║
║  Stage 4.5-A Invariant H-06 (Canonical Action Anchor) : 🟢 100% ENFORCED VIA STEPPER UI   ║
╠═══════════════════════════════════════════════════════════════════════════════════════════╣
║  STATUS SPESIFIKASI ARSITEKTUR                        : 🟢 APPROVED & READY FOR SPRINT 4   ║
╚═══════════════════════════════════════════════════════════════════════════════════════════╝
```

---

*Disahkan oleh:* Senior Architecture Review Board (ARB)  
*Status Dokumen:* **MASTER UI/UX ARCHITECTURAL CONTRACT** (`doc/MASTER/STAGE_4_5_D_GLASS_LAYER_AND_UI_ARCHITECTURE_v1.0.md`)
