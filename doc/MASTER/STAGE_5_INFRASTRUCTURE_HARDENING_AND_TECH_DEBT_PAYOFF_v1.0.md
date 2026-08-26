# STAGE 5 — INFRASTRUCTURE HARDENING & TECHNICAL DEBT PAYOFF MASTER PLAN (v1.0)
## Enterprise Scalability, Database Resilience & DevOps Safety Architecture
### Yapendik School OS — Architecture Decision Records (ADR-01 to ADR-04)

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Document ID:** `STAGE_5_INFRASTRUCTURE_HARDENING_AND_TECH_DEBT_PAYOFF_v1.0`  
**Milestone:** Stage 5 — Infrastructure Hardening & Technical Debt Payoff  
**Status:** **APPROVED ARCHITECTURAL DECISION MASTER PLAN (ENTERPRISE GRADE)**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2 & ARB Review Mandate  
**Prerequisites:** Stage 1–4.5 Baseline Certified (292 / 292 Checks PASS — 100% Zero Regression)  
**Target Scope:** Database Partitioning Engine, Migration Down-Script Tooling, Media CDN & Storage RLS, Server-Side Document Generation  

---

## 1. Executive Summary: The Hardening Mandate

> *"Refuse Feature Creep, Embrace Resilience."*  
> *(Menolak penambahan fitur tanpa kendali, memprioritaskan ketahanan sistem jangka panjang).*

Penyelesaian **Stage 1 hingga Stage 4.5** telah melengkapi seluruh kapabilitas inti operasional sekolah dan tata kelola kelembagaan Yayasan:
- **Daily Memory (4.1)** $\rightarrow$ **Trust & LPPA (4.2)** $\rightarrow$ **Continuity (4.3)** $\rightarrow$ **Safety Assurance (4.4)** $\rightarrow$ **Institutional Learning (4.5)**.

Kini, Yapendik School OS memasuki fase krusial: **Stage 5 — Infrastructure Hardening & Technical Debt Payoff**.

```text
═══════════════════════════════════════════════════════════════════════════════════════════
                      STAGE 5 INFRASTRUCTURE & RESILIENCE PILLARS
═══════════════════════════════════════════════════════════════════════════════════════════

  ┌─────────────────────────────────┐         ┌─────────────────────────────────┐
  │ ADR-01: MIGRATION ROLLBACK SAFE │         │ ADR-02: ZERO-DOWNTIME PARTITION │
  │ • Automated Down-Scripts Tooling│         │ • Shadow Migration Protocol     │
  │ • Non-Destructive Ledger Safety │         │ • High-Volume Attendance & Obs  │
  └────────────────┬────────────────┘         └────────────────┬────────────────┘
                   │                                           │
                   └─────────────────────┬─────────────────────┘
                                         │
  ┌──────────────────────────────────────┴──────────────────────────────────────┐
  │                      V2.1.5 FROZEN BASELINE INTEGRITY                       │
  │     (Zero Regression on 15 Canonical Tables, Fail-Closed RLS & Triggers)    │
  └──────────────────────────────────────┬──────────────────────────────────────┘
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   │                                           │
  ┌────────────────┴────────────────┐         ┌────────────────┴────────────────┐
  │ ADR-03: STORAGE & EDGE CACHING  │         │ ADR-04: SERVER-SIDE PDF WORKER  │
  │ • On-the-Fly Image Optimization │         │ • Headless Async Worker Queue   │
  │ • Real-time Session Edge Auth   │         │ • Tamper-Proof Official Archive │
  └─────────────────────────────────┘         └─────────────────────────────────┘
```

### Prinsip Dasar Tata Kelola Stage 5:
1. **Zero Business Feature Creep**: Stage 5 tidak menambahkan entitas atau fitur bisnis baru ke antarmuka pengguna. Seluruh fokus dialokasikan pada *throughput*, *data integrity*, *storage cost reduction*, dan *disaster recovery*.
2. **Frozen Baseline Inviolability**: 15 tabel kanonikal V2.1.5 dan 5 tabel LEARN Stage 4.5 tetap terlindungi secara semantik; optimasi partisi dilakukan secara transparan di balik abstraksi PostgreSQL tanpa merusak relasi foreign key atau RLS.
3. **Deterministic Verification**: Setiap perubahan infrastruktur wajib dibuktikan dengan nol regresi terhadap seluruh 292 pengujian eksisting.

---

## 2. ADR-01: Migration Down-Scripts & Rollback Safety Strategy

```text
STATUS       : APPROVED
DECIDERS     : Senior Architecture Reviewer (ARB), DevOps & Database Lead
CONSULTED    : Full-Stack Engineering, QA Automation Lead
INFORMED     : Foundation Trustees, School System Administrators
```

### 2.1 Konteks & Permasalahan (*Context & Problem Statement*)
Hingga Stage 4.5, seluruh migrasi database dijalankan secara *forward-only* (`m01` s.d. `m07`). Ketiadaan script rollback otomatis (`down-scripts`) menimbulkan risiko fatal:
1. **CI/CD Pipeline Rigidity**: Kegagalan pada saat *deployment* otomatis mengharuskan *point-in-time restore* (PITR) manual yang memakan waktu dan berpotensi memicu *downtime*.
2. **Disaster Recovery Gap**: Pengembang tidak memiliki mekanisme terstandardisasi untuk membatalkan modifikasi DDL secara deterministik.

### 2.2 Keputusan Arsitektural (*Architectural Decision*)
1. **Mandatory Bi-directional Migration Pairing**:
   Setiap berkas migrasi ke depan (`mXX_*.sql`) **WAJIB** memiliki pasangan berkas rollback: `mXX_*_down.sql`.
2. **Strict Rule: Non-Destructive Ledger Rollback (Prinsip Keabadian Data Transaksional)**:
   - Berkas *down-script* untuk tabel yang menyimpan data transaksi historis (`audit_logs`, `daily_attendance`, `observation_records`, `student_progress_reports`, `student_placement_records`, `observed_outcome_effects`) **DILARANG KERAS MENJALANKAN `DROP TABLE` ATAU `DELETE`**.
   - Rollback hanya diizinkan mencabut (*drop*) kolom baru, menonaktifkan trigger baru, merevert fungsi RPC, atau memindahkan data ke tabel karantina (`_archive_quarantine`).

```text
┌─────────────────────────────────────────────────────────────────────────────────┐
│                      MIGRATION ROLLBACK SAFETY RULES MATRIX                     │
├──────────────────────────────┬──────────────────────────────────────────────────┤
│ Tipe Objek Database          │ Batasan Down-Script Rollback                     │
├──────────────────────────────┼──────────────────────────────────────────────────┤
│ Function / RPC               │ CREATE OR REPLACE versi sebelumnya / DROP FUNCTION│
│ Database Trigger             │ DROP TRIGGER IF EXISTS                          │
│ RLS Policies                 │ DROP POLICY IF EXISTS                           │
│ Added Column on Existing Tbl │ ALTER TABLE ... DROP COLUMN (Hanya jika aman)    │
│ Historical Ledger Table      │ ⛔ DROP TABLE DILARANG! Pindahkan ke ARCHIVE!   │
└──────────────────────────────┴──────────────────────────────────────────────────┘
```

### 2.3 Konsekuensi & Mitigasi (*Consequences & Mitigation*)
* **Positif**: Pemulihan instan saat terjadi kegagalan deployment; integrasi pipeline CI/CD yang mendukung *automated deployment verification with auto-rollback*.
* **Mitigasi**: Validasi otomatis di pre-commit hook untuk memverifikasi keberadaan file `*_down.sql` sebelum PR disetujui.

---

## 3. ADR-02: Zero-Downtime Table Partitioning Strategy

```text
STATUS       : APPROVED
DECIDERS     : Senior Architecture Reviewer (ARB), Database Engineering
CONSULTED    : Application Services Lead
INFORMED     : Foundation Leadership
```

### 3.1 Konteks & Permasalahan (*Context & Problem Statement*)
Tabel operasional harian sekolah (`daily_attendance` dan `observation_records`) mengalami pertumbuhan volume eksponensial:
* Diperkirakan mencapai ratusan ribu hingga jutaan baris per tahun ajaran pada jaringan multi-unit Yapendik.
* Query scan penuh pada tabel monolitik akan menurunkan kinerja *Teacher Home* (Stage 4.1) dan memperlambat evaluasi *LPPA Synthesis* (Stage 4.2).
* PostgreSQL tidak mengizinkan partisi langsung pada tabel eksisting yang memiliki data dan relasi foreign key via perintah `ALTER TABLE` tunggal.

### 3.2 Keputusan Arsitektural (*Architectural Decision*)
1. **Declarative Temporal Partitioning**: Menggunakan *Declarative Range Partitioning* PostgreSQL berbasis `academic_year_id` (didukung sub-partisi per `school_id` jika diperlukan di masa depan).
2. **The Shadow Migration Protocol (Protokol Migrasi 5-Langkah Zero-Downtime)**:

```text
═══════════════════════════════════════════════════════════════════════════════════════════
                           THE 5-STEP SHADOW MIGRATION PROTOCOL
═══════════════════════════════════════════════════════════════════════════════════════════

 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 1: PROVISION SHADOW TABLE                                                         │
 │ Buat tabel berpartisi: daily_attendance_partitioned (Kloning kolom & data types presisi)│
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 2: REPLICATE CONSTRAINTS, RLS & TRIGGERS                                          │
 │ Pasang Triggers (trg_fb06_*), RLS Policies, dan Indexes pada Shadow Table              │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 3: CHUNKED BATCH BACKFILL (ZERO LOCK CONTENTION)                                  │
 │ Salin data historis per semester dengan pg_advisory_lock batching tanpa table lock     │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 4: ATOMIC CUTOVER (SINGLE TRANSACTION BLOCK)                                      │
 │ DO $$ BEGIN                                                                            │
 │   ALTER TABLE daily_attendance RENAME TO daily_attendance_archive_monolith;            │
 │   ALTER TABLE daily_attendance_partitioned RENAME TO daily_attendance;                 │
 │ END $$;                                                                                │
 └───────────────────────────────────────────┬────────────────────────────────────────────┘
                                             │
                                             ▼
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ STEP 5: REBUILD VIEWS & DEPENDENCY VERIFICATION                                        │
 │ Recompile RPCs, verify Option A Academic Gate & run Master Test Pipeline (292 checks)  │
 └────────────────────────────────────────────────────────────────────────────────────────┘
```

### 3.3 Dampak pada Stage 3 (Option A Academic Gate)
* **Kesesuaian `rpc_close_academic_semester`**: Partisi berbasis `academic_year_id` mempercepat rekonsiliasi semester karena PostgreSQL engine secara cerdas membatasi scan hanya pada partisi semester aktif (*partition pruning*).
* **Foreign Key Resolution**: Seluruh foreign key masuk dari tabel lain diarahkan ke tabel partisi root.

---

## 4. ADR-03: Storage Optimization, Image Resizing & CDN Edge Caching

```text
STATUS       : APPROVED
DECIDERS     : Senior Architecture Reviewer (ARB), Frontend & Cloud Architect
CONSULTED    : Safety & Privacy Lead
INFORMED     : Guardian Experience Team
```

### 4.1 Konteks & Permasalahan (*Context & Problem Statement*)
Setiap kegiatan observasi bermain anak (Stage 4.1) menyertakan foto dokumentasi otentik. Hal ini menimbulkan beban pada *bandwidth* seluler guru dan memicu biaya penyimpanan object storage yang tinggi jika foto resolusi penuh (3–5 MB) dimuat berulang kali di galeri observasi.

### 4.2 Keputusan Arsitektural (*Architectural Decision*)
1. **Dynamic Edge Image Transformation**:
   * Memanfaatkan transformasi gambar dinamis di edge storage (on-the-fly thumbnail generation):
     - Grid Guru / Galeri: `width=320&quality=75&format=webp` (~25 KB per foto)
     - Detail Observasi: `width=1080&quality=85&format=webp` (~150 KB per foto)
2. **Deterministic Edge Caching vs Privacy Invariants**:
   * *Anti-Pattern yang Dilarang*: Menggunakan *Temporary Signed URLs* dengan masa berlaku 15 menit (merusak cache CDN dan memaksa *re-fetch* konstan).
   * *Solusi Terpilih*: Menggunakan **Session-Validated Media Proxy** di backend atau **Storage RLS Policies Terotentikasi**:
     - CDN meng-cache objek berdasarkan URI unik yang di-hash.
     - Header `Cache-Control: private, max-age=86400, stale-while-revalidate=3600` diterapkan.
     - Permintaan ke media sensitif diverifikasi secara real-time terhadap `auth.uid()` untuk memastikan orang tua hanya dapat melihat foto anak kandungnya (Invariant C-11 & FB-01).

---

## 5. ADR-04: Server-Side Cryptographic PDF Generation Worker

```text
STATUS       : PROPOSED (ROADMAP FOR SPRINT 3)
DECIDERS     : Senior Architecture Reviewer (ARB), Product Security Officer
CONSULTED    : Legal & Accreditation Specialist
INFORMED     : Foundation Trustees
```

### 5.1 Konteks & Permasalahan (*Context & Problem Statement*)
Rapor LPPA (Stage 4.2) saat ini dicetak menggunakan mesin cetak peramban (*CSS Paged Media Print Engine*). Meskipun sangat presisi secara visual:
* Mengharuskan perangkat guru/kepala sekolah memproses rendering PDF secara lokal.
* Menghadapi potensi perbedaan minor antar engine peramban (Chrome vs Safari vs Firefox).
* Dokumen resmi institusi memerlukan kepastian *pixel-perfect* dan sertifikasi tanda tangan digital resmi (BSrE / Badan Siber dan Sandi Negara).

### 5.2 Keputusan Arsitektural (*Architectural Decision*)
1. **Asynchronous Headless Worker Queue**:
   Rancang arsitektur pembuatan dokumen di sisi server menggunakan *Worker Daemon* terisolasi:

```text
Client (Kepala Sekolah)
        │ 1. Request Official Signed PDF
        ▼
PostgreSQL Database ──► INSERT INTO pdf_generation_requests (status = 'PENDING')
        │
        ▼ 2. Async Webhook / Queue Trigger
Headless PDF Generation Worker (Node.js / Playwright / Puppeteer Server)
        │ 3. Fetch CanonicalPublishedLppaRecord & Snapshot Evidence
        │ 4. Render Pixel-Perfect Kurikulum Merdeka PAUD Template
        │ 5. Compute SHA-256 Checksum & Inject BSrE Digital Signature Stamp
        │ 6. Upload PDF to Private Storage Bucket
        ▼
PostgreSQL Database ──► UPDATE pdf_generation_requests (status = 'COMPLETED', storage_url = '...')
        │
        ▼ 7. WebSocket / Polling Notification
Client Receives Verified Download Link
```

---

## 6. Implementation Roadmap (The Hardening Sprints)

Eksekusi Stage 5 dibagi menjadi **3 Sprint Terstruktur**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              STAGE 5 EXECUTION ROADMAP                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 1: DevOps, Migration Down-Tooling & Database Partitioning                       │
│ • Setup automated migration runner with bi-directional verification.                   │
│ • Create down-scripts for m01 through m07.                                             │
│ • Execute Shadow Migration Protocol for daily_attendance & observation_records.        │
│ • Target Gate: Zero Lock Contention & 292 Checks PASS.                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 2: Storage Optimization, Image Compression & Edge Caching                       │
│ • Implement dynamic URL-based image transformation (WebP conversion & thumbnailing).   │
│ • Configure Private Storage RLS & Session-Validated Caching Headers.                   │
│ • Target Gate: >70% Bandwidth Reduction on Teacher Home Gallery.                       │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ SPRINT 3: Server-Side PDF Worker & Legal Compliance Interface                          │
│ • Deploy Headless Document Worker for Canonical LPPA Reports.                          │
│ • Draft API Contracts & Cryptographic Validation for BSrE Digital Signatures.          │
│ • Target Gate: End-to-End Server-Side Rendered Tamper-Proof Document Delivery.         │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Verification & Regression Gates (Suite 21 Design)

Untuk menjamin bahwa partisi database dan optimasi storage tidak merusak kontrak eksisting, dirancang **Test Suite 21**:

### Spesifikasi Suite 21: *Database Partitioning & Rollback Safety Contract*
1. **Partition Pruning & Schema Contract**:
   * Memverifikasi bahwa query dengan filter `academic_year_id` hanya menyentuh partisi yang relevan.
   * Memverifikasi keutuhan seluruh triggers (`trg_student_placement_guard`, `trg_fb06_*`, dll.) pada tabel partisi.
2. **Rollback Determinism Check**:
   * Menguji eksekusi `mXX_down.sql` pada lingkungan test terisolasi dan memastikan database kembali ke *state* sebelumnya tanpa membuang tabel data transaksional.
3. **Option A Gate Non-Regression**:
   * Menjalankan simulasi penuh penutupan semester (`rpc_close_academic_semester`) di atas tabel berpartisi.

```text
════════════════════════════════════════════════════════════════════════════════════
📋 TARGET PIPELINE THRESHOLD: STAGE 5 COMPLETION
════════════════════════════════════════════════════════════════════════════════════
• Existing Baseline Checks (Suites 1–10)               : 292 / 292 PASS
• Suite 21: Database Partitioning & Rollback Safety    : 15 / 15 PASS
────────────────────────────────────────────────────────────────────────────────────
🏁 TARGET MASTER VERIFICATION SCORE                    : 307 / 307 PASS (100%)
════════════════════════════════════════════════════════════════════════════════════
```

---

## 8. Kesimpulan & Pengesahan ARB

Dokumen ini mengunci arah strategis keteknikan Yapendik School OS menuju kesiapan skala industri (*enterprise-ready*). Dengan menyegel **ADR-01 hingga ADR-04**, tim rekayasa memiliki panduan definitif untuk memperkuat fondasi sistem tanpa pernah mengorbankan stabilitas fungsional yang telah dicapai pada Stage 1–4.5.

```text
╔═══════════════════════════════════════════════════════════════════════════════════╗
║          STAGE 5 INFRASTRUCTURE HARDENING MASTER PLAN — ARB SEALED                ║
╠═══════════════════════════════════════════════════════════════════════════════════╣
║  ADR-01: Migration Down-Scripts & Rollback Strategy         : 🟢 APPROVED         ║
║  ADR-02: Zero-Downtime Shadow Table Partitioning Protocol   : 🟢 APPROVED         ║
║  ADR-03: Storage Optimization & Deterministic Edge Caching  : 🟢 APPROVED         ║
║  ADR-04: Asynchronous Server-Side PDF Generation Worker     : 🟢 APPROVED         ║
║  Three-Sprint Execution Roadmap                             : 🟢 SEALED           ║
║  Suite 21 Non-Regression Verification Gate                  : 🟢 DEFINED          ║
╠═══════════════════════════════════════════════════════════════════════════════════╣
║  OVERALL STATUS                                             : 🟢 CLEARED FOR EXEC ║
╚═══════════════════════════════════════════════════════════════════════════════════╝
```

*Disahkan oleh Architectural Review Board (ARB) Yayasan Pendidikan GPIB sebagai Dokumen Induk Infrastruktur dan Pembayaran Hutang Teknis Yapendik School OS.*
