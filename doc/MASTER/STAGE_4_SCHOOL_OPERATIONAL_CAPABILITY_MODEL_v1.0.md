# Yapendik School OS — Stage 4 School Operational Capability Model v1.0
**Document ID:** `DOC-STAGE-4-CAPABILITY-MODEL-v1.0`  
**Status:** `ACTIVE ARCHITECTURE CONTRACT — DISCOVERY BASELINE`  
**Date:** `2026-08-26`  
**Target Milestone:** `Stage 4 Operational Capabilities & School Workflow Modernization`  
**Baseline Dependency:** `Stage 3 Frozen Baseline (DOC-STAGE-3-CLOSURE-CERT-v1.0)`

---

## 1. Stage 4 Charter & Mission

Platform *Yapendik School OS* telah menyelesaikan fondasi integritas data, tata kelola siklus akademik, dan batas otorisasi pada **Stage 3 (Certified & Frozen)**. 

Fokus Stage 4 berpindah secara fundamental dari:
$$\text{Data Truth + Governance + Lifecycle Enforcement (Stage 3)}$$
menjadi:
$$\text{Real-World School Work + Operational Capabilities + Human-Centered Experience (Stage 4)}$$

### Pernyataan Misi Stage 4
> **"Membangun rangkaian kapabilitas operasional sekolah ramah-anak dan bebas-beban-administrasi (zero-friction operational workflows) yang memberdayakan guru, kepala sekolah, orang tua murid, dan pengawas yayasan untuk menjalankan pendidikan anak usia dini (PAUD/TK) bermutu tinggi di atas fondasi tata kelola yang teruji."**

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           STAGE 4 ARCHITECTURAL POSITION                          │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  STAGE 3 FROZEN GOVERNANCE CORE                                                   │
│  (Data Truth • 4 Mutating RPCs • 2 Derived Functions • C-11 Privacy • Lineage)    │
│                                       │                                           │
│                                       ▼                                           │
│  STAGE 4 OPERATIONAL CAPABILITY LAYER                                             │
│  ┌───────────────────┬───────────────────┬───────────────────┐                    │
│  │ School Operations │ Child & Learning  │ Family Engagement │                    │
│  ├───────────────────┼───────────────────┼───────────────────┤                    │
│  │ Admissions (PPDB) │ People & Roles    │ Foundation Mgmt   │                    │
│  └───────────────────┴───────────────────┴───────────────────┘                    │
│                                       │                                           │
│                                       ▼                                           │
│  MODERN WORKFLOWS & HIGH-IMPACT UX PROJECTIONS                                    │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Scope & Non-Scope

### In-Scope (Stage 4 Focus)
1. **Model Operasional Harian Sekolah:** Alur kerja guru kelas dari presensi kedatangan, jurnal aktivitas bermain harian (RPPH), catatan observasi anekdot, hingga kepulangan.
2. **Asesmen & Portofolio Anak Autentik:** Sintesis observasi terpadu berbasis Capaian Pembelajaran Kurikulum Merdeka PAUD menjadi Laporan Perkembangan Peserta Didik Anak (LPPA) terstruktur.
3. **Keterlibatan Keluarga (Family-School Linkage):** Buku penghubung digital dua arah terverifikasi, pengumuman kegiatan resmi ber-tanda terima, dan umpan balik orang tua.
4. **Alur Penerimaan Peserta Didik Baru (PPDB & Enrollment Pipeline):** Dari prospek calon siswa, seleksi berkas, penerimaan resmi, hingga penempatan rombel kanonikal Stage 3.
5. **Supervisi Kepala Sekolah & Telemetri Terpadu:** Pengawasan kelancaran kurikulum, validasi rapor cepat, dan persetujuan terkelola.

### Non-Scope (Explicit Out-of-Scope)
* ❌ **Modifikasi Fondasi Governance Stage 3:** Dilarang mengubah DDL core, merusak trigger proteksi, membongkar partial index penempatan, atau menghapus fail-closed RLS.
* ❌ **Enterprise Accounting & ERP Billing:** Pengelolaan buku besar keuangan akuntansi yayasan (fokus School OS tetap pada pendidikan & operasional sekolah).
* ❌ **Integrasi Hardware Fisik Khusus (Biometrik/IoT/RFID Gate):** Mengandalkan web standard responsive tanpa ketergantungan perangkat keras proprietary.

---

## 3. School Operating Model (Siklus Operasional TK)

Operasional harian dan tahunan unit PAUD/TK Yapendik mengikuti siklus berulang yang terstruktur:

```text
                           SIKLUS OPERASIONAL SEKOLAH (TK)
                                         │
                                         ▼
                     [1. PERSIAPAN & PENERIMAAN (TAHUNAN)]
                        • Setup Tahun Ajaran & Rombel
                        • Pendaftaran & Seleksi PPDB
                        • Penempatan Awal Rombel Siswa (Stage 3)
                                         │
                                         ▼
                     [2. OPERASIONAL HARIAN (DAILY RHYTHM)]
                        ┌─────────────────────────────────┐
                        │ • Kedatangan & Cek Presensi     │
                        │ • Rencana Belajar-Bermain (RPPH)│
                        │ • Observasi & Catatan Anekdot   │
                        │ • Buku Penghubung Harian        │
                        │ • Kepulangan Siswa              │
                        └─────────────────────────────────┘
                                         │
                                         ▼
                     [3. EVALUASI & SINTESIS (BULANAN/TENGAH TAHUN)]
                        • Agregasi Dokumentasi Capaian Portofolio
                        • Validasi Kesiapan Data Perkembangan Anak
                        • Konsultasi & Dialog Guru-Orang Tua
                                         │
                                         ▼
                     [4. PELAPORAN & KELULUSAN (AKHIR SEMESTER)]
                        • Penyusunan Rapor LPPA oleh Guru
                        • Persetujuan Resmi Kepala Sekolah (100% Gate)
                        • Penutupan Semester Terkelola (Stage 3 Option A)
                        • Promosi Rombel & Registrasi Kelulusan (Stage 3)
```

---

## 4. Actor Model (6 Persona Kanonikal)

| Aktor / Peran | Tanggung Jawab Operasional Utama | Ruang Kerja Utama (Workspace) | Pain Point yang Diselesaikan Stage 4 |
|:---|:---|:---|:---|
| **Guru Kelas (Homeroom)**<br>*(cth: Ibu Siti)* | Memimpin kelas, mencatat presensi, menyusun RPPH harian, mengambil observasi anekdot, menyusun draf rapor LPPA. | `TeacherDailyWorkWorkspace`<br>`ObservationWorkspace`<br>`DevelopmentWorkspace` | Menghilangkan duplikasi pencatatan kertas; mengubah observasi mentah menjadi draf LPPA otomatis. |
| **Guru Pendamping (Co-Teacher)**<br>*(cth: Ibu Maria)* | Mendampingi pembelajaran, membantu dokumentasi karya anak, mencatat kehadiran dan observasi harian bersama. | `TeacherDailyWorkWorkspace`<br>`ObservationWorkspace` | Kolaborasi satu rombel tanpa bentrok data atau saling menimpa catatan. |
| **Kepala Sekolah (Headmaster)**<br>*(cth: Ibu Esther)* | Mengawasi kelancaran kurikulum, mereviu dan menyetujui LPPA, menutup semester, mengevaluasi kesiapan sekolah. | `SchoolReviewWorkspace`<br>`AcademicLifecycleWorkspace`<br>`InstitutionalHealthDashboard` | Verifikasi 100% rapor selesai dalam sekali klik; eliminasi proses manual menjelang tutup buku semester. |
| **Orang Tua / Wali (Guardian)**<br>*(cth: Pak Budi)* | Memantau perkembangan ananda, menandatangani pengumuman penting, menerima rapor berkala, berkomunikasi dengan guru. | `StudentJourneyTimeline`<br>`CommunicationWorkspace` | Transparansi penuh tumbuh kembang anak; jaminan privasi keluarga mutlak (C-11). |
| **Staf Administrasi (Admin)** | Mengelola biodata murid, berkas pendaftaran PPDB, mutasi siswa, dan kelengkapan profil rombel. | `EnrollmentWorkspace`<br>`CohortPromotionWorkspace`<br>`GraduationRegistryWorkspace` | Pendaftaran langsung menghasilkan *single placement* kanonikal tanpa rekonsiliasi manual. |
| **Pengawas Yayasan (Superadmin)**<br>*(cth: Pak Andreas)* | Memantau kesehatan kelembagaan multi-unit, utilisasi kapasitas, audit trail, dan kepatuhan standar yayasan. | `InstitutionalHealthDashboard`<br>`GovernanceWorkspace` | Observabilitas real-time seluruh unit TK tanpa menunggu laporan manual bulanan. |

---

## 5. Capability Map (6 Rumpun Kapabilitas)

```text
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                            YAPENDIK OS — CAPABILITY MAP                               │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  1. SCHOOL OPERATIONS (OPERASIONAL HARIAN)                                            │
│     ├── 1.1 Presensi Presisi & Mood Kedatangan (One-Tap Attendance & Morning Check)   │
│     ├── 1.2 Jurnal Rencana Belajar Harian (RPPH / Daily Play Activities Engine)       │
│     └── 1.3 Catatan Insiden & Log Harian Kelas (Daily Incident & Health Triage)       │
│                                                                                       │
│  2. CHILD & LEARNING (TUMBUH KEMBANG & ASESMEN AUTENTIK)                             │
│     ├── 2.1 Observasi Terintegrasi Kurikulum Merdeka PAUD (Anecdotal & Checklist)     │
│     ├── 2.2 Dokumentasi Portofolio Hasil Karya Anak (Evidence Capture)                │
│     └── 2.3 Mesin Sintesis & Asesmen LPPA (Narrative Report Generator Engine)         │
│                                                                                       │
│  3. FAMILY ENGAGEMENT (KEMITRAAN KELUARGA & RUMAH)                                    │
│     ├── 3.1 Buku Penghubung Terarah & Terverifikasi (Two-Way Home-School Link)         │
│     ├── 3.2 Surat Edaran & Pengumuman Ber-Tanda Terima (Governed Notice & Ack)       │
│     └── 3.3 Konsultasi Perkembangan & Tanggapan Rapor (Parent Reflection Ledger)       │
│                                                                                       │
│  4. ADMISSIONS & ENROLLMENT (PPDB & PENDAFTARAN)                                      │
│     ├── 4.1 Registrasi Calon Murid Baru (Prospective Student Funnel)                  │
│     ├── 4.2 Verifikasi Usia, Berkas, & Pemetaan Hubungan Wali (Eligibility Check)     │
│     └── 4.3 Penerimaan Resmi & Auto-Placement ke Rombel Kanonikal (Stage 3 Bridging)   │
│                                                                                       │
│  5. PEOPLE & ROLES (TATA KELOLA SDM & KELAS)                                          │
│     ├── 5.1 Penugasan Guru Wali & Guru Pendamping Rombel (Classroom Staffing Matrix)  │
│     ├── 5.2 Manajemen Hubungan Legal Guardian (Verified Kinship Registry)             │
│     └── 5.3 Profil & Direktori Warga Sekolah (Canonical People Directory)             │
│                                                                                       │
│  6. INSTITUTIONAL MANAGEMENT (SUPERVISI & TATA KELOLA YAYASAN)                        │
│     ├── 6.1 Cockpit Supervisi Kepala Sekolah (Headmaster Oversight & Quick-Approve)   │
│     ├── 6.2 Telemetri Multi-Unit Yayasan Real-Time (Cross-School Health Matrix)       │
│     └── 6.3 Audit Trail & Log Kepatuhan Regulasi (Immutable Audit Review)             │
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Capability $\rightarrow$ Business Outcome Mapping

| Rumpun Kapabilitas | Hasil Bisnis yang Terukur (Business Outcome) |
|:---|:---|
| **School Operations** | • 0% presensi tercecer atau salah rekap.<br>• Guru menghemat $\ge 45$ menit/hari dari pencatatan manual. |
| **Child & Learning** | • Observasi terhubung langsung ke rapor LPPA tanpa pengetikan ulang saat akhir semester.<br>• 100% keselarasan terhadap standar Kurikulum Merdeka PAUD. |
| **Family Engagement** | • 100% kepastian tanda terima surat edaran & pengumuman penting oleh orang tua.<br>• Eliminasi miskomunikasi jadwal dan kebutuhan belajar anak di rumah. |
| **Admissions & PPDB** | • Proses pendaftaran calon murid transparan dengan validasi daya tampung (*capacity limit*).<br>• Calon murid diterima langsung masuk ke skema penempatan Stage 3 (*Zero Ghost Students*). |
| **People & Roles** | • Tidak ada rombel tanpa guru penanggung jawab (*Zero Unstaffed Classes*).<br>• Batas akses data anak terjamin sesuai hak orang tua sah (C-11). |
| **Institutional Mgmt** | • Yayasan memantau performa dan kepatuhan seluruh unit TK secara *real-time*.<br>• Rekonsiliasi kelulusan dan promosi semester tuntas tanpa penundaan operasional. |

---

## 7. Capability $\rightarrow$ Stage 3 Frozen Foundation Mapping

Tabel berikut membuktikan bahwa seluruh kapabilitas Stage 4 **mengonsumsi fondasi Stage 3 yang telah terkunci**, tanpa menciptakan logika bayangan:

```text
┌──────────────────────────────┬────────────────────────────────────────────────────────┐
│ Kapabilitas Stage 4          │ Fondasi Stage 3 yang Digunakan (Konsumsi Kanonikal)    │
├──────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1.1 Presensi Presisi         │ uq_daily_attendance_record • trg_closed_period_guard   │
│ 1.2 Jurnal Belajar Harian    │ learning_activities table • RLS Context Scope          │
│ 2.1 Observasi Kurikulum      │ observation_records • trg_closed_period_guard          │
│ 2.3 Mesin Sintesis LPPA      │ rpc_submit_report_for_review • rpc_approve_report      │
│ 3.1 Buku Penghubung          │ guardian_notices • server-side staff confidentiality   │
│ 4.3 Penerimaan & Placement   │ student_placement_records • partial index single-active│
│ 5.1 Penugasan Guru           │ staff_profiles • classes.homeroom_teacher_id           │
│ 5.2 Verifikasi Wali          │ guardian_relationships • fn_get_student_trajectory()   │
│ 6.1 Supervisi Kepala Sekolah │ rpc_close_academic_semester (100% LPPA check)          │
│ 6.2 Telemetri Yayasan        │ fn_derive_school_health_telemetry() (Pure Projection)  │
└──────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

## 8. Capability Gaps (Kondisi Saat Ini vs Target Stage 4)

1. **Jurnal Aktivitas & RPPH Guru:**  
   *Saat ini:* Entri aktivitas harian dasar telah tersedia di database lokal, namun belum terhubung ke saran observasi capaian pembelajaran terstruktur.  
   *Target Stage 4:* Alur kerja di mana aktivitas bermain langsung memunculkan indikator capaian observasi.
2. **Sintesis Narasi LPPA Otomatis:**  
   *Saat ini:* Guru menginput draf refleksi rapor secara manual per anak.  
   *Target Stage 4:* Guru dapat menarik kumpulan observasi satu semester anak menjadi kerangka narasi LPPA siap reviu.
3. **Penerimaan Murid Baru (PPDB Funnel):**  
   *Saat ini:* Siswa dibuat langsung di tabel `students`.  
   *Target Stage 4:* Pipeline pendaftaran (`PROSPECTIVE` $\rightarrow$ `ENROLLED` $\rightarrow$ `ACTIVE` Placement via Stage 3).
4. **Buku Penghubung Berkelanjutan:**  
   *Saat ini:* Notisi satu arah dan balasan dasar telah ada.  
   *Target Stage 4:* Timeline komunikasi harian anak dengan penanda penting (*urgency tags & read receipts*).

---

## 9. Candidate Stage 4 Domains (Paket Domain Kerja)

Kami membagi implementasi kapabilitas Stage 4 ke dalam 4 domain modular:

```text
STAGE 4 DOMAIN PACKAGES
│
├── DOMAIN 4.1: TEACHER DAILY WORK & CONTINUOUS LEARNING
│   ├── Presensi Kelas Satu-Ketuk & Catatan Mood/Suhu
│   ├── Jurnal Rencana Aktivitas Bermain Harian (RPPH)
│   └── Observasi Cepat di Kelas & Dokumentasi Hasil Karya
│
├── DOMAIN 4.2: AUTHENTIC CHILD PORTFOLIO & LPPA SYNTHESIS
│   ├── Kurasi Dokumentasi Portofolio Tumbuh Kembang
│   ├── Generator Kerangka Narasi LPPA Berbasis Bukti
│   └── Alur Persetujuan Bertingkat Guru ➔ Kepala Sekolah
│
├── DOMAIN 4.3: FAMILY LINKAGE & INTERACTIVE ENGAGEMENT
│   ├── Buku Penghubung Terpadu Dua Arah
│   ├── Pengumuman Resmi & Surat Edaran dengan Tanda Terima Sah
│   └── Catatan Dialog Konsultasi Perkembangan Anak
│
└── DOMAIN 4.4: ADMISSIONS, ENROLLMENT & ROSTER STEWARDSHIP
    ├── Pipeline Pendaftaran Siswa Baru (PPDB Calon Siswa)
    ├── Validasi Daya Tampung Rombel & Kesiapan Berkas
    └── Jembatan Penerimaan ke Penempatan Rombel Kanonikal Stage 3
```

---

## 10. Priority Matrix & Business Value Assessment

| Domain Paket | Nilai Bisnis Guru & Siswa | Kompleksitas Teknis | Kesiapan Fondasi Stage 3 | Rekomendasi Urutan |
|:---|:---:|:---:|:---:|:---:|
| **Domain 4.1: Teacher Daily Work & Learning** | ⭐⭐⭐⭐⭐ (Sangat Tinggi) | Rendah–Sedang | 🟢 100% Ready (Database & RLS siap) | **P-1 (Prioritas Pertama)** |
| **Domain 4.2: Child Portfolio & LPPA Synthesis** | ⭐⭐⭐⭐⭐ (Sangat Tinggi) | Sedang | 🟢 100% Ready (LPPA State Machine siap) | **P-2 (Prioritas Kedua)** |
| **Domain 4.3: Family Linkage & Engagement** | ⭐⭐⭐⭐ (Tinggi) | Sedang | 🟢 100% Ready (Guardian RLS teruji) | **P-3 (Prioritas Ketiga)** |
| **Domain 4.4: Admissions & PPDB Pipeline** | ⭐⭐⭐⭐ (Tinggi) | Sedang–Tinggi | 🟢 100% Ready (Lineage RPCs siap) | **P-4 (Prioritas Keempat)** |

---

## 11. Architecture Constraints Inherited from Stage 3

Setiap domain yang dibangun pada Stage 4 **wajib mematuhi 6 Invarian Arsitektural Stage 3**:
1. **Constraint C-01:** Mutasi status siswa dan periode akademik wajib melalui RPC resmi yang telah disertifikasi.
2. **Constraint C-02:** Komponen antarmuka tidak boleh menghitung ulang data kebenaran (*zero client-side domain calculations*).
3. **Constraint C-03:** Penutupan semester mengunci mutasi harian secara permanen melalui trigger database (`trg_closed_period_guard`).
4. **Constraint C-04:** Batas privasi keluarga (C-11) tidak boleh dikompromikan: wali murid hanya boleh mengakses data anaknya sendiri.
5. **Constraint C-05:** Telemetri kesehatan lembaga tetap bersifat *read-only on-the-fly projection*.
6. **Constraint C-06:** Setiap aksi sensitif wajib tercatat pada `audit_logs` secara otomatis.

---

## 12. Discovery Questions untuk Penyusunan Stage 4.1

Sebelum mengeksekusi kontrak implementasi Stage 4.1, pertanyaan discovery operasional berikut menjadi acuan perancangan:
1. *Bagaimana format jurnal harian (RPPH) yang paling mudah diisi oleh guru TK di sela-sela mengajar tanpa mengorbankan interaksi tatap muka dengan anak?*
2. *Bagaimana membuat pencatatan observasi anekdot semudah "ambil foto + ketik 1 kalimat + pilih dimensi capaian", sehingga guru tidak merasa terbebani administrasi?*
3. *Bagaimana menyajikan ringkasan presensi harian agar Kepala Sekolah dapat langsung mengetahui rombel mana yang membutuhkan perhatian khusus pada jam 08:30 pagi?*

---

## 13. Next Architecture Gate

Tahap berikutnya setelah evaluasi dokumen ini:
1. **Persetujuan Baseline Discovery Stage 4.**
2. **Pembuatan Kontrak Desain Domain 4.1:** `STAGE_4_1_TEACHER_DAILY_WORK_AND_LEARNING_CONTRACT_v1.0.md`.
3. **Spesifikasi Alur Kerja Komponen & Testing Suite 4.1.**

---

**Drafted and Governed by:**  
*Yapendik School OS Capability Architecture Board*  
`2026-08-26 • Jakarta, Indonesia`
