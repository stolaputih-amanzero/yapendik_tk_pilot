# STAGE 6 — GATE 0: ADMISSIONS & ENROLLMENT CONTINUUM (PPDB LOOP)
## Semantic & Boundary Closure Specification (v1.0)
### Yapendik School OS — Early Childhood Intake & Sovereign Admission Architecture

**Document Version:** `v1.0.0-SEALED`  
**Milestone:** Stage 6 — Gate 0 (Semantic & Boundary Closure)  
**Governing Authority:** Senior Architecture Reviewer (ARB) & Technical Steering Board  
**Target Codebase:** `yapendik-tk-pilot`  
**Baseline Anchor:** V2.1.5 Frozen Baseline + Stage 4.5 LEARN + Stage 5 Hardening (348 Checks Passing)  
**Classification:** ARCHITECTURAL CONSTITUTION — GATE 0 SEALED  

---

## 1. EXECUTIVE INTENT & GATE 0 SCOPE

Dokumen ini merupakan **Penyegelan Semantik & Batas Otoritas (Gate 0)** sebelum perancangan teknis dan implementasi **Stage 6: Admissions & Enrollment Continuum (PPDB Loop)** dimulai.

Tujuan filosofis dari Stage 6 adalah **memperluas siklus hidup anak (*Student Lifecycle*) ke titik nol (*Point Zero*)**—yaitu masa transisi krusial saat seorang anak dan keluarganya pertama kali berinteraksi dengan Yapendik sebelum terdaftar sebagai siswa resmi.

```text
════════════════════════════════════════════════════════════════════════════════════════════
                        YAPENDIK STUDENT LIFECYCLE HORIZON
════════════════════════════════════════════════════════════════════════════════════════════

   [ STAGE 6: PPDB CONTINUUM ]          [ STAGE 3 & 4: CANONICAL SCHOOL REALITY ]
   Point Zero (Pre-Canonical)           Active Canonical Enrollment
   ──────────────────────────           ───────────────────────────
   • Calon Siswa (Applicant)    ──────► • Siswa Resmi (Student Entity)
   • Akun Wali Calon Siswa      ──────► • Guardian Relationship (C-11 Enforced)
   • Observasi Intake Fondasi   ──────► • Child Continuity Baseline (Fase 4.3)
   • Verifikasi Dokumen Masuk   ──────► • Student Placement & Roster Rombel

                      ▲                                    ▲
                      │                                    │
               STAGING DOMAIN                       CANONICAL DOMAIN
           (Isolated Staging Tables)          (V2.1.5 Frozen 15 Tables)
                      │                                    │
                      └────────── THE ENROLLMENT ──────────┘
                                   CEREMONY
                              (Atomic Promotion)
```

> ### ⚠️ PRINSIP PERLINDUNGAN BASELINE BEKU (V2.1.5 FROZEN PROTECTION)
> 1. **Dilarang Keras Merusak Skema Inti**: Tabel kanonikal `persons`, `students`, `guardian_relationships`, dan `student_placement_records` berstatus **🔒 FROZEN**. Stage 6 DILARANG memasukkan data pendaftar mentah/sementara ke dalam tabel-tabel ini.
> 2. **Staging Domain Isolation**: Seluruh entitas pra-penerimaan wajib hidup di tabel pementasan (*staging schema/tables*) terpisah sampai *The Enrollment Ceremony* dieksekusi secara resmi.
> 3. **Zero Regression Guarantee**: Implementasi Stage 6 tidak boleh merusak skor **348 / 348 checks PASS** yang telah dicapai pada Stage 4.5 dan Stage 5.

---

## 2. THE ONTOLOGICAL PROBLEM: PRE-CANONICAL IDENTITY

Sistem penerimaan siswa baru menghadirkan tantangan ontologis: *bagaimana mengelola entitas yang belum memiliki status hukum resmi di dalam sistem sekolah tanpa mencemari integritas data kanonikal?*

Berikut adalah **6 Keputusan Ontologis Berbahaya** yang ditetapkan secara mengikat:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        6 KEPUTUSAN ONTOLOGIS UTAMA STAGE 6                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Pre-Canonical Child    : ProspectiveChildApplicant di Staging Table (Prefix: app_)  │
│ 2. Pre-Canonical Guardian : Guest Auth Context (APPLICANT_GUARDIAN, Scope: App ID)     │
│ 3. Intake Observation     : Entitas Terpisah dari Formative Observation (Quarantined)  │
│ 4. Multi-Unit Policy      : Pendaftaran Multi-Tenant Terisolasi (Deduplikasi NIK Staging)│
│ 5. Enrollment Ceremony    : Transaksi Atomik Promosi (Staging ──► Canonical Tables)    │
│ 6. Foundation Role        : Agregat Kapasitas & Demografi (Zero PII, FB-01 Extended)   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Keputusan 1: Pre-Canonical Child Entity (`ProspectiveChildApplicant`)
- **Masalah**: Sebelum diterima, anak belum memiliki `person_id` kanonikal atau NIS/NISN resmi. Jika dimasukkan ke tabel `students`, data statistik sekolah aktif akan tercemar oleh anak yang batal mendaftar atau ditolak.
- **Keputusan Arsitektur**:
  - Dibuat entitas independen: `ProspectiveChildApplicant` dengan identitas primer monospaced: `applicant_id` (format: `app_2026_[school_id]_[hash8]`).
  - Entitas ini hidup di tabel staging khusus: `admissions_applicants`.
  - Data identitas hukum anak (NIK, nama akta lahir, tempat/tanggal lahir) disimpan di tabel staging ini dan **TIDAK MENDAPATKAN** `person_id` sampai upacara penerimaan selesai.

---

### Keputusan 2: Pre-Canonical Guardian Entity (`ApplicantGuardianContext`)
- **Masalah**: Orang tua pendaftar belum terikat dalam `guardian_relationships` kanonikal sekolah karena anak belum menjadi siswa. Memberikan peran `LEGAL_GUARDIAN` kanonikal akan melanggar *Contextual Authorization* (C-11).
- **Keputusan Arsitektur**:
  - Orang tua mendaftar ke portal publik PPDB melalui autentikasi nomor WhatsApp / Email terverifikasi.
  - Sesi login diberikan peran terbatas: `APPLICANT_GUARDIAN`.
  - Otorisasi dibatasi secara ketat (*Row-Level Security*): `APPLICANT_GUARDIAN` hanya memiliki hak membaca dan menulis pada baris `admissions_applicants` dan `admissions_documents` yang secara eksplisit terikat pada `auth.uid()` miliknya.

---

### Keputusan 3: Intake Observation vs Formative Observation
- **Masalah**: Apakah asesmen observasi saat tes masuk/wawancara PPDB sama dengan `observation_records` harian yang dilakukan guru (Stage 4.1)?
- **Keputusan Arsitektur**:
  - Secara semantik, keduanya adalah **entitas yang sepenuhnya terpisah**.
  - Observasi intake adalah **`IntakeReadinessObservation`** (asesmen kesiapan fondasi perkembangan awal, interaksi motorik, kemandirian toilet training, dan profil bahasa).
  - Observasi intake disimpan di tabel pementasan `admissions_intake_observations`.
  - **Invarian Karantina**: Jika calon siswa tidak jadi mendaftar atau mengundurkan diri, observasi intake ini **TIDAK BOLEH** bocor atau masuk ke dalam rapor LPPA atau portofolio siswa mana pun.

---

### Keputusan 4: Multi-Unit Application Policy & Tenant Isolation
- **Masalah**: Apakah satu orang tua boleh mendaftarkan anaknya ke lebih dari satu TK Yayasan (misal: mendaftar ke TK Menteng sekaligus TK Rawamangun)?
- **Keputusan Arsitektur**:
  - Orang tua diperbolehkan mengajukan pendaftaran ke lebih dari 1 unit TK Yapendik.
  - Setiap aplikasi pendaftaran menghasilkan `applicant_id` unik yang terikat pada `target_school_id` masing-masing.
  - **Isolasi Kepala Sekolah**: Kepala Sekolah TK Menteng hanya dapat melihat aplikasi untuk unitnya; tidak dapat melihat apakah calon siswa tersebut juga mendaftar di TK Rawamangun (mencegah bias penerimaan).
  - **Deduplikasi Finansial & Penerimaan**: Saat salah satu sekolah menerima dan orang tua melunasi biaya formulir/pangkal (*The Enrollment Ceremony*), aplikasi di unit lain otomatis berubah status menjadi `CANCELLED_ENROLLED_ELSEWHERE`.

---

### Keputusan 5: The Enrollment Ceremony (Momen Transisi Ontologis)
- **Masalah**: Kapan tepatnya seorang `ProspectiveChildApplicant` bermutasi menjadi `Student` resmi di sistem sekolah?
- **Keputusan Arsitektur**:
  - Transisi terjadi pada **The Enrollment Ceremony** melalui prosedur transaksional atomik (`rpc_execute_enrollment_ceremony`).
  - **Otoritas Tunggal**: Hanya **Kepala Sekolah** dari unit penerima yang berhak memvalidasi upacara ini setelah syarat verifikasi dokumen dan administrasi terpenuhi.
  - **Operasi Atomik Transaksional**:
    1. Mengubah status aplikasi di staging menjadi `ENROLLED_PROMOTED`.
    2. Membuat baris baru di tabel kanonikal `persons` untuk anak (menghasilkan `person_id`).
    3. Membuat baris baru di tabel kanonikal `persons` untuk wali (jika belum ada).
    4. Membuat baris baru di tabel kanonikal `students` (status `ACTIVE`).
    5. Membuat baris baru di `guardian_relationships` (menautkan wali dan anak).
    6. Mengalokasikan rombel awal di `student_placement_records` (TK A atau TK B).
    7. Mentransfer ringkasan `IntakeReadinessObservation` menjadi baseline awal pada `ChildContinuityProfile` (Fase 4.3).

---

### Keputusan 6: Foundation Role in PPDB (Perluasan Prinsip FB-01)
- **Masalah**: Apakah Pengurus Yayasan boleh melihat daftar calon siswa baru, nama anak, dan identitas orang tua yang mendaftar?
- **Keputusan Arsitektur**:
  - **TIDAK BOLEH**. Prinsip **FB-01 (*Zero Individual Exposure*)** diperluas ke domain PPDB.
  - Yayasan hanya berhak menerima **Proyeksi Agregat Masuk (*Admissions Telemetry Projection*)**:
    - Rasio Keterisian Kursi Unit: $\frac{\text{Total Pendaftar Diterima}}{\text{Target Daya Tampung Rombel}}$.
    - Distribusi Kelompok Usia Calon Siswa (Agregat).
    - Kecepatan Konversi Pendaftaran (*Funnel Velocity*).
  - Konsol Yayasan dilarang keras merender tabel berisi nama anak, NIK, alamat rumah, atau nomor telepon wali calon siswa.

---

## 3. THE INVARIANT EXTENSION: ADMISSIONS PRIVACY (AP-01 s.d. AP-07)

Sebagai domain yang berinteraksi langsung dengan publik dan data anak pra-sekolah, Stage 6 memberlakukan 7 Invarian Privasi Penerimaan (**Admissions Privacy Invariants**):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                   MATRIKS INVARIAN PRIVASI PENERIMAAN (AP-01 s.d. AP-07)               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ AP-01 : Prospective Child Privacy & Retention (Penghapusan data pendaftar batal)      │
│ AP-02 : Intake Observation Quarantine (Karantina mutlak dari portofolio kanonikal)    │
│ AP-03 : Waitlist Confidentiality & Anti-Comparison (Kerahasiaan posisi antrean)       │
│ AP-04 : Guardian Self-Service Boundary (Isolasi data antar-wali pendaftar)            │
│ AP-05 : Non-Discriminatory Developmental Intake (Asesmen kesiapan, bukan eliminasi)   │
│ AP-06 : Atomic Promotion Transactionality (Integritas mutlak upacara penerimaan)      │
│ AP-07 : Anti-Panopticon Multi-Unit Redaction (Yayasan 100% bebas PII calon siswa)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

| ID Invarian | Nama Invarian | Definisi Teknis & Batas Penegakan |
|:---|:---|:---|
| **AP-01** | **Prospective Child Privacy & Retention** | Data identitas calon siswa yang berstatus `NOT_ADMITTED` atau `APPLICATION_WITHDRAWN` wajib dienkripsi dan diarsipkan/dibersihkan secara otomatis setelah masa retensi $T_{\text{retention}} = 90\text{ hari}$ pasca penutupan tahun ajaran PPDB. |
| **AP-02** | **Intake Observation Quarantine** | Data catatan perkembangan intake pra-sekolah tidak boleh diekspor, diakses oleh guru kelas lain, atau diintegrasikan ke rapor LPPA selama anak belum berstatus `ENROLLED_PROMOTED`. |
| **AP-03** | **Waitlist Confidentiality & Anti-Comparison** | Status daftar tunggu (*waitlist*) hanya menampilkan estimasi status personal kepada orang tua terkait. Dilarang merender daftar tunggu publik yang mengekspos nama atau nomor urut anak lain. |
| **AP-04** | **Guardian Self-Service Boundary** | Sesi `APPLICANT_GUARDIAN` hanya memiliki akses baca/tulis terhadap data aplikasi yang diciptakan oleh identitas autentikasinya sendiri. Akses lintas calon siswa langsung ditolak dengan `403 Forbidden`. |
| **AP-05** | **Non-Discriminatory Intake Policy** | Observasi intake PAUD bertujuan untuk memetakan kebutuhan stimulasi awal dan penempatan rombel yang adil, bukan instrumen seleksi akademis diskriminatif. |
| **AP-06** | **Atomic Promotion Transactionality** | Transformasi dari data staging ke 4 tabel kanonikal (`persons`, `students`, `guardian_relationships`, `student_placement_records`) wajib berada dalam 1 transaksi ACID database. Jika ada 1 kegagalan constraint, seluruh proses di-rollback 100%. |
| **AP-07** | **Anti-Panopticon Multi-Unit Redaction** | Seluruh proyeksi PPDB untuk pengurus Yayasan dan pengawas eksternal wajib diredaksi dari seluruh identifier personal anak (NIK, NIS, Nama, Alamat, Foto). |

---

## 4. THE DOMAIN LIFECYCLE: PPDB STATE MACHINE

Siklus hidup aplikasi pendaftaran calon siswa (*Admissions Application Lifecycle*) dikendalikan oleh **Mesin Status 8-Tahap Deterministik**:

```
                       ALUR SIKLUS HIDUP PENDAFTARAN PPDB (STAGE 6)

          [ 1. DRAFT_APPLICATION ]
                     │  (Wali mengisi biodata & unggah dokumen)
                     ▼
          [ 2. SUBMITTED ]
                     │  (Panitia PPDB memverifikasi kelengkapan berkas)
                     ▼
          [ 3. DOCUMENT_VERIFIED ]
                     │  (Jadwal interaksi & asesmen awal anak ditentukan)
                     ▼
          [ 4. INTAKE_SCHEDULED ]
                     │  (Pendidik melaksanakan observasi bermain & stimulasi)
                     ▼
          [ 5. INTAKE_ASSESSED ]
                     │  (Kepala Sekolah menerbitkan keputusan penerimaan)
                     ▼
          [ 6. ADMISSION_DECIDED ]
            ├──► OFFERED_ADMISSION  (Diterima masuk)
            ├──► WAITLISTED         (Kapasitas penuh, masuk daftar tunggu)
            ├──► NOT_ADMITTED       (Diarahkan ke program stimulasi lain)
            └──► WITHDRAWN          (Wali mengundurkan diri mandiri)
                     │
            (Hanya jalur OFFERED_ADMISSION)
                     │  (Wali menyelesaikan administrasi & biaya masuk)
                     ▼
          [ 7. TUITION_SETTLED ]
                     │  (Kepala Sekolah memvalidasi upacara penerimaan)
                     ▼
          [ 8. ENROLLED_PROMOTED ] ──► [ THE ENROLLMENT CEREMONY ]
                                       • Insert persons (Child & Guardian)
                                       • Insert students (Status: ACTIVE)
                                       • Insert guardian_relationships
                                       • Insert student_placement_records
                                       • Seed ChildContinuityProfile Baseline
```

### Rincian Transisi & Hak Otoritas Tiap Status

| No | Status Asal | Status Tujuan | Syarat Transisi (*Pre-Conditions*) | Aktor Berwenang |
|:---:|:---|:---|:---|:---|
| 1 | `DRAFT_APPLICATION` | `SUBMITTED` | Formulir identitas anak dan wali lengkap; minimal akta lahir & KK diunggah. | `APPLICANT_GUARDIAN` |
| 2 | `SUBMITTED` | `DOCUMENT_VERIFIED` | Panitia PPDB memverifikasi keabsahan dokumen usia dan kartu keluarga. | `SCHOOL_ADMISSIONS_STAFF` / `HEADMASTER` |
| 3 | `DOCUMENT_VERIFIED` | `INTAKE_SCHEDULED` | Jadwal sesi observasi bermain dan temu ramah anak-guru telah ditetapkan. | `HEADMASTER` / `TEACHER` |
| 4 | `INTAKE_SCHEDULED` | `INTAKE_ASSESSED` | Instrumen observasi intake diisi lengkap oleh pendidik pengamat. | `TEACHER_OBSERVER` |
| 5 | `INTAKE_ASSESSED` | `ADMISSION_DECIDED` | Kuota daya tampung rombel dievaluasi; keputusan penerimaan ditetapkan. | `HEADMASTER` (Otoritas Mutlak) |
| 6 | `OFFERED_ADMISSION` | `TUITION_SETTLED` | Pembayaran biaya administrasi terverifikasi oleh bagian keuangan unit. | `SCHOOL_FINANCE` / `HEADMASTER` |
| 7 | `TUITION_SETTLED` | `ENROLLED_PROMOTED` | Eksekusi upacara promosi kanonikal; data dialirkan ke 15 tabel sekolah. | `HEADMASTER` (Eksklusif) |
| 8 | Status apa pun < 7 | `APPLICATION_WITHDRAWN` | Orang tua calon siswa menyatakan pengunduran diri secara resmi. | `APPLICANT_GUARDIAN` |

---

## 5. BOUNDARY MAP & INTERFACE CONTRACTS WITH FROZEN BASELINE

Diagram berikut memetakan batas arsitektural (*Architectural Boundary Map*) antara Domain PPDB (Stage 6) dan Domain Sekolah Kanonikal (Stage 3 & 4):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 6: ADMISSIONS STAGING BOUNDARY                            │
│                                                                                        │
│  Tabel Pementasan Terisolasi:                                                          │
│  • admissions_applicants            : Data calon siswa (app_xxx) & identitas orang tua │
│  • admissions_documents             : Berkas digital KK, Akta Lahir, Buku Imunisasi   │
│  • admissions_intake_observations   : Catatan asesmen perkembangan bermain awal        │
│  • admissions_capacity_quotas       : Target daya tampung per tahun ajaran & rombel    │
│                                                                                        │
│  Peran Akses Terisolasi:                                                               │
│  • APPLICANT_GUARDIAN (Guest context, scoped by application UID)                       │
│  • SCHOOL_ADMISSIONS_COMMITTEE (Headmaster & appointed teacher intake)                 │
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
                                           │ THE ENROLLMENT CEREMONY
                                           │ (ACID Transactional Promotion Procedure)
                                           │
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                    V2.1.5 FROZEN BASELINE: CANONICAL SCHOOL BOUNDARY                   │
│                                                                                        │
│  15 Tabel Kanonikal yang Dilindungi (Read/Write Hanya via Transaksi Resmi):            │
│  1. persons                      ◄── [NEW CHILD & GUARDIAN PERSON ROWS]                │
│  2. students                     ◄── [NEW ACTIVE STUDENT ROW]                          │
│  3. guardian_relationships       ◄── [NEW LEGAL GUARDIAN LINK]                         │
│  4. student_placement_records    ◄── [NEW CLASSROOM ROMBEL ALLOCATION]                 │
│  5. child_continuity_profiles    ◄── [INITIAL BASELINE FROM INTAKE OBSERVATION]        │
│  6. daily_attendance             (Untouched during PPDB)                               │
│  7. observation_records          (Untouched during PPDB)                               │
│  8. student_work_artifacts       (Untouched during PPDB)                               │
│  9. lppa_reports                 (Untouched during PPDB)                               │
│  10-15. Other Core Tables        (Untouched during PPDB)                               │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. GATE 0 DECISION MATRIX & SIGN-OFF

Dengan ini, **Dewan Peninjau Arsitektur (ARB)** menetapkan matriks keputusan resmi Gate 0 untuk Stage 6:

```
╔═══════════════════════════════════════════════════════════════════════════════════════╗
║                  STAGE 6: GATE 0 DECISION MATRIX & GOVERNANCE SEAL                    ║
╠═══════════════════════════════════════════════════════════════════════════════════════╣
║                                                                                       ║
║  1. STAGING DOMAIN ISOLATION  : [DISETUJUI] Calon siswa tidak masuk tabel students.   ║
║  2. GUEST GUARDIAN AUTH       : [DISETUJUI] APPLICANT_GUARDIAN terisolasi RLS.       ║
║  3. INTAKE OBSERVATION QUAR.  : [DISETUJUI] Observasi intake terpisah dari LPPA.      ║
║  4. MULTI-TENANT ISOLATION    : [DISETUJUI] Kepala sekolah hanya melihat unitnya.     ║
║  5. THE ENROLLMENT CEREMONY   : [DISETUJUI] Promosi kanonikal 100% transaksional.     ║
║  6. FOUNDATION PII REDACTION  : [DISETUJUI] Yayasan hanya menerima proyeksi agregat.  ║
║  7. 7 ADMISSIONS INVARIANTS   : [DISETUJUI] AP-01 s.d. AP-07 menjadi hukum permanen.  ║
║                                                                                       ║
║  STATUS GATE 0                : 🔒 SEALED AND APPROVED TO PROCEED TO GATE 1           ║
║  VERIFIKASI BASELINE          : 348 / 348 CHECKS ZERO REGRESSION PRESERVED            ║
║  DATE OF SEALING              : 2026-08-26                                            ║
║                                                                                       ║
╚═══════════════════════════════════════════════════════════════════════════════════════╝
```

---
*Dokumen ini merupakan spesifikasi konstitusi Gate 0 resmi yang menjadi acuan wajib perancangan Gate 1 (Technical Architecture & DDL) Stage 6.*
