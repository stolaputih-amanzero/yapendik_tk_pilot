# YAPENDIK SCHOOL OS — STAGE 2: SCHOOL LIFECYCLE & ONBOARDING SPECIFICATION
## Version 1.1 — Harmonized Canonical Baseline (Post-Governance Review)

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Module:** Institutional Onboarding & Lifecycle Provisioning Engine  
**Document Type:** Stage 2 Specification Document  
**Status:** **APPROVED FOR DETAILED DESIGN WITH GOVERNANCE AMENDMENTS**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2, ENTERPRISE INFORMATION ARCHITECTURE v0.1 & OPERATING MODEL v0.1  
**Upstream Runtime Baseline:** V2.1.5 Definitive Production Baseline (🔒 **FROZEN**)  
**Empirical Evidence Baseline:** Gate 06 Stage 1 Human Operational Evidence (UAT-01 s.d. UAT-06: 100% PASS)

---

## 1. Constitutional Purpose & Epistemic Separation

### 1.1. Status Penutupan Gate 06 Stage 1
Gate 06 Stage 1 telah resmi diselesaikan dan ditutup dengan ketetapan tata kelola:

> **STAGE 1 — OPERATIONAL RUNTIME: VERIFIED / CLOSED (100% PASS)**  
> **STAGE 2 — INSTITUTIONAL PROVISIONING: APPROVED FOR DETAILED DESIGN (WITH AMENDMENTS)**

Pengujian empiris manusia live pada 6 persona (`UAT-01` s.d. `UAT-06`) telah membuktikan secara konklusif:
- **Kondisi Terbukti (Stage 1 - "Operate"):** *"Jika sebuah sekolah telah berstatus legal `ACTIVE`, memiliki Tahun Akademik aktif, rombel sah, guru terpasang, siswa terdaftar, dan berstatus `READY`, maka seluruh operasional harian School OS (presensi, observasi sentra, pengesahan/penerbitan LPPA, buku penghubung, isolasi multi-unit, dan proteksi PII) bekerja secara aman, presisi, dan sesuai konstitusi."*
- **Kondisi Tahap Ini (Stage 2 - "Become Operational"):** *"Bagaimana sebuah institusi sekolah baru 'dilahirkan' dari ketiadaan, dikonfigurasi secara legal, distrukturkan rombel dan stafnya, dipopulasi siswanya melalui proses admisi & penempatan, serta divalidasi hingga mencapai status `READY`."*

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: OPERATE (VERIFIED & CLOSED)                                                  │
│ Sekolah READY ──► Presensi ──► Observasi ──► LPPA Sah ──► Buku Penghubung ──► Aman    │
└────────────────────────────────────────────────────────────────────────────────────────┘
                                            ▲
                                            │ KONTRAK STATUS: "READY"
                                            │
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: BECOME OPERATIONAL (CURRENT SPECIFICATION FOCUS)                              │
│ Legal Establishment ──► Academic Year ──► Class ──► Staff ──► Admission ──► READY     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

> **Prinsip Epistemik Stage 2:**  
> Stage 1 menguji *"Operate"*. Stage 2 menguji *"Become Operational"*.  
> Tidak ada kode antarmuka atau migrasi skema yang diimplementasikan sebelum dokumen spesifikasi dan desain domain ini diverifikasi dan disetujui.

---

## 2. Institutional Model & The `READY` Contract (AMEND #1 & AMEND #2)

### 2.1. Ortogonalitas Status Hukum & Kesiapan Operasional
`[DECISION]` Untuk mencegah semantic collision (*One Concept, One Governed Meaning*), Yapendik OS memisahkan status hukum legal institusi dari kesiapan operasional teknisnya:

```text
                 CANONICAL SCHOOL ENTITY
                           │
          ┌────────────────┴────────────────┐
          │                                 │
   LEGAL / INSTITUTIONAL           OPERATIONAL READINESS
        (Status Hukum)               (Kesiapan Topologi)
          │                                 │
       ACTIVE                           NOT_READY
       ARCHIVED                             │
                                            ▼ (Evaluasi 6 Gate)
                                          READY
```

1. **`School.status` (Status Hukum Legal):**
   - **`ACTIVE`:** Sekolah secara sah diakui dan didirikan oleh Yayasan (memiliki SK Pendirian dan NPSN).
   - **`ARCHIVED`:** Sekolah ditutup atau dibekukan operasionalnya secara permanen berdasarkan SK Yayasan.
2. **`School.operational_readiness` (Kesiapan Operasional):**
   - **`NOT_READY`:** Struktur akademik (tahun ajaran, semester, rombel, guru, siswa) belum lengkap untuk menjalankan pembelajaran harian.
   - **`READY`:** Seluruh 6 gate topologi terpenuhi 100%. Sekolah sah memulai hari pertama operasional runtime.

---

### 2.2. The Canonical `READY` Validation Contract

`[DECISION]` **Kontrak Mutlak Kesiapan Operasional (The Operational Readiness Invariant):**  
Sebuah sekolah **dilarang keras** diakses oleh guru atau orang tua untuk transaksi pembelajaran harian sebelum mesin validasi kesiapan (`EVALUATE_OPERATIONAL_READINESS`) menyatakan status `READY`.

Evaluasi `READY` dievaluasi secara deterministik berdasarkan 6 gate struktural:

```text
                               THE "READY" VALIDATION GATES
                               
  Gate 1: Legal Entity Active          ──► School.status === 'ACTIVE'
  Gate 2: Active Academic Year         ──► Count(AcademicYear.status === 'ACTIVE') === 1 [Pilot Decision]
  Gate 3: Active Academic Period       ──► Count(AcademicPeriod.status === 'ACTIVE') === 1 [Pilot Decision]
  Gate 4: Appointed Headmaster         ──► School.headmaster_person_id IS NOT NULL
  Gate 5: Staffed Classroom            ──► Count(ClassRoom.status === 'ACTIVE' WITH homeroom_teacher_id) >= 1
  Gate 6: Placed & Admitted Students   ──► Count(Enrollment.status === 'ACTIVE' WITH class_id) >= 1
```

Jika salah satu dari keenam gate bernilai `FALSE`, status `operational_readiness` sekolah tetap **`NOT_READY`** dengan daftar diagnostik error yang jelas bagi Kepala Sekolah.

---

## 3. Matriks Pembagian Kewenangan Provisioning (Authority by Tier)

Sesuai invariant konstitusi *Authority Follows Context*, pembagian hak aksi pembentukan institusi diatur secara ketat:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ TIERS & PROVISIONING JURISDICTION MATRIX                                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  TIER 1: YAYASAN SUPERADMIN (Institutional Charter & Governance Stewardship)           │
│  ✔ Menerbitkan SK Pendirian Sekolah Baru (`CREATE_SCHOOL`)                             │
│  ✔ Menetapkan & Mengangkat Kepala Sekolah pada Sekolah (`ASSIGN_HEADMASTER`)           │
│  ✔ Menginisialisasi Tahun Akademik (`INITIALIZE_ACADEMIC_YEAR`)                        │
│  ✔ Memantau status kesiapan operasional (`READINESS_DASHBOARD`) seluruh sekolah        │
│  ❌ DILARANG: Mengatur pembagian murid ke rombel atau membuat agenda sentra harian     │
│                                                                                        │
│  TIER 2: KEPALA SEKOLAH (School Autonomy & Academic Topology Leadership)               │
│  ✔ Mengonfigurasi Kalender Semester / Academic Period (`CONFIGURE_ACADEMIC_PERIOD`)   │
│  ✔ Membentuk Rombongan Belajar (Rombel) (`CREATE_CLASSROOM`)                           │
│  ✔ Menugaskan Pendidik sebagai Wali Kelas (`ASSIGN_HOMEROOM_TEACHER`)                  │
│  ✔ Menerima Pendaftaran Siswa Baru (`ADMIT_STUDENT`) & relasi wali sah                 │
│  ✔ Menempatkan Siswa ke Rombel Belajar (`PLACE_STUDENT_IN_CLASS`)                      │
│  ✔ Menjalankan Evaluasi Kesiapan Sekolah (`EVALUATE_OPERATIONAL_READINESS`)            │
│  ❌ DILARANG: Mendirikan sekolah baru tanpa SK Yayasan                                 │
│                                                                                        │
│  TIER 3: GURU & WALI MURID (Operational Actors / Consumers)                            │
│  ❌ DILARANG KERAS melakukan provisioning struktural (0% Provisioning Authority)       │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Spesifikasi Perintah Domain Atomik (Governed Domain Commands)

Setiap aksi provisioning dijalankan melalui **Atomic Governed Commands** dengan pencatatan jejak audit institusi:

```text
Actor + Context + Action + Validation + Server Enforcement + Database RLS + Audit
```

### 4.1. `CREATE_SCHOOL` (AMEND #2 & AMEND #3)
- **Aktor Berwenang:** `YAPENDIK_SUPERADMIN`
- **Input:** `name`, `npsn`, `school_level` (`TK`, `SD`, `SMP`, `SMA` - generic foundation), `address`, `city`, `phone`, `email`
- **Invariant:** NPSN harus unik; status awal `School.status = 'ACTIVE'`, `School.operational_readiness = 'NOT_READY'`.
- **Audit Log:** `INSTITUTIONAL_EVENT` $\rightarrow$ `SCHOOL_ESTABLISHED`.

### 4.2. `ASSIGN_HEADMASTER`
- **Aktor Berwenang:** `YAPENDIK_SUPERADMIN`
- **Input:** `school_id`, `person_id` (Identitas Kepala Sekolah), `sk_number`, `effective_date`
- **Invariant:** Kepala Sekolah harus memiliki entitas `Person` yang valid; otomatis diberikan context role `HEADMASTER` terikat pada `school_id`.
- **Audit Log:** `GOVERNANCE_EVENT` $\rightarrow$ `HEADMASTER_APPOINTED`.

### 4.3. `INITIALIZE_ACADEMIC_YEAR` & `CONFIGURE_ACADEMIC_PERIOD` (AMEND #4)
- **Aktor Berwenang:** `YAPENDIK_SUPERADMIN` (Tahun Akademik) & `HEADMASTER` (Semester)
- **Input:** `school_id`, `name` (mis. "2026/2027"), `start_date`, `end_date`, `period_type` (`SEMESTER_1_GANJIL` / `SEMESTER_2_GENAP`)
- **Pilot Readiness Rule:** Tepat satu `AcademicYear` dan tepat satu `AcademicPeriod` yang aktif per sekolah untuk validasi kesiapan TK Pilot.
- **Audit Log:** `ACADEMIC_EVENT` $\rightarrow$ `ACADEMIC_PERIOD_ACTIVATED`.

### 4.4. `CREATE_CLASSROOM` & `ASSIGN_HOMEROOM_TEACHER` (AMEND #5)
- **Aktor Berwenang:** `HEADMASTER`
- **Input:** `school_id`, `academic_year_id`, `name` (mis. "Kelompok A (Bintang Kejora)"), `grade_level` (`TK_A` / `TK_B`), `capacity` (konfigurasi fleksibel, default pilot: 15), `homeroom_teacher_id`
- **Invariant:** Pendidik yang ditugaskan harus berstatus aktif di unit sekolah terkait.
- **Audit Log:** `ROSTER_EVENT` $\rightarrow$ `CLASSROOM_CONFIGURED`.

### 4.5. `ADMIT_STUDENT` & `PLACE_STUDENT_IN_CLASS` (AMEND #6)
- **Aktor Berwenang:** `HEADMASTER`
- **Alur Kanonikal:**
  ```text
  Person (Child) ──► Student ──► Enrollment (School + AcademicYear) ──► ClassPlacement (ClassRoom)
  Person (Adult) ──► GuardianRelationship (Student)
  ```
- **Input:** `school_id`, `academic_year_id`, data identitas anak, data wali sah, `target_class_id`
- **Invariant:** Penempatan kelas memvalidasi kapasitas rombel ($n \le \text{capacity}$).
- **Audit Log:** `ADMISSION_EVENT` $\rightarrow$ `STUDENT_ADMITTED_AND_ENROLLED`.

### 4.6. `EVALUATE_OPERATIONAL_READINESS`
- **Aktor Berwenang:** `HEADMASTER` atau `YAPENDIK_SUPERADMIN`
- **Proses:** Mengevaluasi keenam Gate Kesiapan Operasional.
- **Hasil:** Jika 6/6 Gate PASS $\rightarrow$ Mengubah `School.operational_readiness = 'READY'`.
- **Audit Log:** `READINESS_EVENT` $\rightarrow$ `SCHOOL_DECLARED_OPERATIONAL_READY`.

---

## 5. Matriks Skenario UAT Stage 2 (UAT-07 s.d. UAT-14)

Skenario pengujian dibagi menjadi 3 kelompok terstruktur:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2 HUMAN UAT SCENARIO MATRIX                                                      │
├─────────┬───────────────────────────────┬──────────────────────┬───────────────────────┤
│ UAT-ID  │ Persona & Skenario            │ Aksi Pembuktian      │ Kriteria Sukses (PASS)│
├─────────┴───────────────────────────────┴──────────────────────┴───────────────────────┤
│ GROUP A: INSTITUTIONAL BIRTH                                                           │
├─────────┬───────────────────────────────┬──────────────────────┬───────────────────────┤
│ UAT-07  │ Superadmin Yayasan            │ Create New School    │ Entitas TK 03 dibuat, │
│         │ (Dr. Andreas Hendrawan)       │ (TK Rawamangun)      │ status = NOT_READY    │
├─────────┼───────────────────────────────┼──────────────────────┼───────────────────────┤
│ UAT-08  │ Superadmin Yayasan            │ Assign Headmaster to │ Kepsek terikat sah ke │
│         │ (Dr. Andreas Hendrawan)       │ New School           │ sekolah TK 03         │
├─────────┴───────────────────────────────┴──────────────────────┴───────────────────────┤
│ GROUP B: SCHOOL PROVISIONING                                                           │
├─────────┬───────────────────────────────┬──────────────────────┬───────────────────────┤
│ UAT-09  │ Kepala Sekolah TK Baru        │ Initialize Academic  │ T.A. 2026/2027 &      │
│         │ (Kepsek TK 03)                │ Year & Semester      │ Ganjil aktif di TK 03 │
├─────────┼───────────────────────────────┼──────────────────────┼───────────────────────┤
│ UAT-10  │ Kepala Sekolah TK Baru        │ Configure Classrooms │ Rombel terbentuk &    │
│         │ (Kepsek TK 03)                │ & Assign Teachers    │ Guru terpasang        │
├─────────┼───────────────────────────────┼──────────────────────┼───────────────────────┤
│ UAT-11  │ Kepala Sekolah TK Baru        │ Student Admission &  │ Data anak & wali sah  │
│         │ (Kepsek TK 03)                │ Guardian Binding     │ tercatat kanonikal    │
├─────────┼───────────────────────────────┼──────────────────────┼───────────────────────┤
│ UAT-12  │ Kepala Sekolah TK Baru        │ Student Placement &  │ Siswa masuk rombel &  │
│         │ (Kepsek TK 03)                │ Capacity Validation  │ kapasitas tervalidasi │
├─────────┼───────────────────────────────┼──────────────────────┼───────────────────────┤
│ UAT-13  │ Kepala Sekolah TK Baru        │ Trigger Operational  │ Evaluasi 6/6 Gate PASS│
│         │ (Kepsek TK 03)                │ Readiness Check      │ status -> READY       │
├─────────┴───────────────────────────────┴──────────────────────┴───────────────────────┤
│ GROUP C: REALITY BRIDGE & STAGE 2 EXIT GATE                                            │
├─────────┬───────────────────────────────┬──────────────────────┬───────────────────────┤
│ UAT-14  │ Guru & Wali TK Baru           │ BRIDGE TEST: First-  │ Guru login di TK 03,  │
│         │ (Pendidik & Orang Tua TK 03)  │ Day Operational Flow │ catat presensi & LPPA │
└─────────┴───────────────────────────────┴──────────────────────┴───────────────────────┘
```

> **Signifikansi Utama UAT-14 (Stage 2 Exit Gate Criterion):**  
> UAT-14 adalah **bukti hidup integrasi end-to-end**: Sekolah yang baru saja dibangun dari nol melalui UAT-07 s.d. UAT-13 harus dapat **langsung menjalankan alur kerja harian Stage 1 secara mulus tanpa intervensi pengembang/database**.

---

## 6. Protokol Kompleksitas Sederhana & Anti-Bloat Guardrails

1. **Zero Hypothetical Wizard Bloat:**  
   Tidak membangun framework orchestration atau 12-step wizard yang rumit. Antarmuka menggunakan aksi langsung yang terikat pada konteks peran pimpinan:
   $$\text{Actor} + \text{Context} + \text{Action} + \text{Validation} + \text{Audit} + \text{Readiness Projection}$$
2. **Integritas Runtime V2.1.5 Tetap Terkunci (🔒 Frozen):**  
   Seluruh kapabilitas onboarding diintegrasikan sebagai layer inisialisasi administratif pada `SuperadminWorkspace` dan `HeadmasterWorkspace` tanpa mengganggu modul pembelajaran runtime.
3. **Database Migration Disiplin:**  
   Seluruh penambahan tabel/kolom provisioning ditulis sebagai migrasi SQL deklaratif idempotent.

---

```text
========================================================================================
   STAGE 2 SPECIFICATION v1.1 COMPLETED — READY FOR DETAILED DOMAIN & LIFECYCLE DESIGN
========================================================================================
```
