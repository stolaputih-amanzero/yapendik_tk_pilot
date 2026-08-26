# YAPENDIK SCHOOL OS — INSTITUTIONAL LIFECYCLE ARCHITECTURE
## Version 1.0 — Canonical Invariant Baseline (Harmonized)

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Document Type:** Foundational Institutional Lifecycle Architecture  
**Status:** **LIVING — CANONICAL INVARIANT BASELINE (v1.0)**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION & EIA  
**Software Baseline:** V2.1.5 Definitive Production Baseline (🔒 Frozen)  
**Supersedes:** Version 0.2  

---

## 1. Constitutional Purpose & Architectural Framing

Yapendik School OS exists to serve the educational mission of Yayasan Pendidikan GPIB across its multi-school landscape.

This document establishes the **Canonical Invariant Baseline** for how a Yapendik School is legally chartered, structured, staffed, populated with students, connected through relationships, given digital identities, operated daily, and rolled over across academic epochs:

> **Constitutional Objective:**  
> The entire institutional lifecycle must be executable by authorized institutional actors through governed application workflows, without ad-hoc direct database intervention or developer-mediated data mutation.

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                              YAPENDIK OS GOVERNANCE STACK                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  YAPENDIK OS CONSTITUTION        ──► Institutional Purpose, Principles & Boundaries     │
│             ↓                                                                           │
│  ENTERPRISE INFO ARCHITECTURE    ──► Information Landscape & Entity Relationships       │
│             ↓                                                                           │
│  INSTITUTIONAL LIFECYCLE (v1.0)  ──► Invariants, State Machines & Transition Contracts  │
│             ↓                                                                           │
│  ONBOARDING ENGINE (v1.1)        ──► Atomic Domain Commands, Setup Wizard & Provisioning│
│             ↓                                                                           │
│  SCHOOL OS RUNTIME (V2.1.5 🔒)   ──► Daily Sentra Work, Attendance, LPPA & Audit        │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

`[FACT]` **Governance Invariant:** The School OS Runtime baseline (**V2.1.5**) remains **🔒 FROZEN**. All institutional lifecycle and onboarding capabilities are architected as the foundational administrative layer that initializes and governs data prior to runtime execution.

---

## 2. Institutional Jurisdictional Boundaries (Normalized 3-Tier Model)

`[DECISION]` Authority across Yapendik OS is strictly partitioned into three institutional tiers and one technical platform layer:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                           INSTITUTIONAL GOVERNANCE TIERS                                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  TIER 1: YAYASAN (Stewardship & Governance Oversight)                                   │
│  • Roles: YAPENDIK_SUPERADMIN, AUDITOR                                                  │
│                                                                                         │
│  TIER 2: SEKOLAH / KEPALA SEKOLAH (Institutional Leadership & Academic Autonomy)        │
│  • Role: HEADMASTER                                                                     │
│                                                                                         │
│  TIER 3: SCHOOL ACTORS (Pedagogical, Relational & Operational Execution)               │
│  • Sub-Actors: TEACHER (Pendidik), STAFF (Tata Usaha), GUARDIAN (Orang Tua / Wali)      │
│                                                                                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  PLATFORM ENGINE LAYER (Technical & Cryptographic Service)                              │
│  • Role: SYSTEM_SERVICE_ROLE (RLS Enforcement, Replicas, Cryptographic Audit)          │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Jurisdictional Authority & Constraint Matrix

| Governance Tier | Institutional Role | Authorized Invariant Capabilities | Explicit Non-Authority & Boundaries |
|---|---|---|---|
| **Tier 1: Yayasan** | `YAPENDIK_SUPERADMIN`, `AUDITOR` | • Menerbitkan SK Pendirian Unit Sekolah (`School.status = ACTIVE`).<br>• Mengangkat & memberhentikan Kepala Sekolah.<br>• Menetapkan standar kurikulum & milestone PAUD.<br>• Mengakses jejak audit lintas-unit untuk pengawasan mutu.<br>• Membekukan (`SUSPENDED`) atau menutup unit (`CLOSED`). | ❌ Dilarang mengedit jurnal kegiatan harian sentra, mencatat presensi harian siswa, atau mengambil alih persetujuan evaluasi formatif/LPPA siswa per sekolah. |
| **Tier 2: Kepala Sekolah** | `HEADMASTER` | • Mengonfigurasi Kalender Akademik (Tahun Ajaran & Semester).<br>• Membuat Rombongan Belajar (Rombel) & menetapkan kapasitas.<br>• Mendaftarkan guru & menetapkan wali kelas.<br>• Menetapkan penempatan kelas siswa (`place_student`).<br>• **Otoritas Eksklusif:** Menyetujui (`APPROVED`) dan menerbitkan (`PUBLISHED`) LPPA.<br>• Melakukan rollover tahun ajaran (`rollover_academic_year`).<br>• Menerbitkan kartu akses aktivasi digital bagi guru & wali murid. | ❌ Dilarang mendirikan unit sekolah baru, menghapus log audit permanen, atau memindahkan guru ke unit sekolah lain tanpa SK Yayasan. |
| **Tier 3: School Actors (Pendidik & Staf)** | `TEACHER`, `STAFF` | • Menyusun RPPH mingguan & harian di sentra kegiatan.<br>• Mencatat presensi harian & skrining kesehatan kedatangan.<br>• Merekam observasi anekdot 6 domain Kurikulum Merdeka.<br>• Menyusun draf LPPA & mengirimkannya untuk telaah pimpinan.<br>• Mengirim catatan komunikasi harian di Buku Penghubung. | ❌ Dilarang menyetujui/menerbitkan LPPA sendiri, mengubah rombel siswa, atau mengakses catatan rahasia kelas lain. |
| **Tier 3: School Actors (Wali Murid)** | `GUARDIAN` | • Mengakses portofolio observasi & LPPA anak kandung/wali sah.<br>• Menandatangani tanda terima catatan Buku Penghubung.<br>• Memperbarui data kontak darurat pribadi. | ❌ Dilarang mengakses data, foto, presensi, atau identitas anak lain; dilarang mengakses catatan rahasia internal staf (`is_confidential_to_staff`). |
| **Platform Layer** | `SYSTEM_SERVICE_ROLE` | • Menjamin isolasi RLS database, replikasi Supabase Cloud, dan integritas kriptografi audit log. | ❌ Berjalan fail-closed; tidak memiliki hak diskresi pedagogis atau keputusan institusional. |

---

## 3. LPPA Approval Authority Harmonization (School Autonomy Principle)

`[DECISION]` **Penyelesaian Konflik Otoritas LPPA (Constitution vs RPC Lama):**

- **Prinsip Konstitusi (School Autonomy):** *Standardize what must be shared; preserve autonomy where context matters.*
- **Keputusan Kanonikal:** **Kepala Sekolah adalah satu-satunya otoritas persetujuan (`APPROVED`) dan penerbitan (`PUBLISHED`) rapor perkembangan siswa (LPPA).**
- **Peran Yayasan:** Yayasan bertindak sebagai **Pengawas Mutu & Auditor (Audit & Quality Oversight)**, bukan approver harian rapor siswa.
- **Catatan Penyelarasan:**
  > `[LIFECYCLE AUTHORITY OVERRIDE — PENDING RUNTIME/RPC ALIGNMENT]`:  
  > Klausul `auth_is_yayasan()` pada RPC `rpc_approve_progress_report` di baseline V2.1.5 diklasifikasikan sebagai *break-glass administrative fallback* untuk keperluan pengujian fixture pilot. Pada spesifikasi Onboarding Engine v1.1, kontrak otorisasi akan diselaraskan murni ke Kepala Sekolah aktif demi menegakkan prinsip otonomi akademik sekolah.

---

## 4. The 4 Canonical Orthogonal State Dimensions of Yapendik OS

`[DECISION]` Untuk mencegah kebingungan konsep (*One Concept, One Governed Meaning*), Yapendik OS mendefinisikan empat dimensi status yang **sepenuhnya ortogonal (independen)**, bukan sebuah rantai berurutan:

```text
                       YAPENDIK OS MULTI-DIMENSIONAL STATE MATRIX

   ┌───────────────────────────────────┐           ┌───────────────────────────────────┐
   │ 1. LEGAL / INSTITUTIONAL STATE    │           │ 2. OPERATIONAL READINESS STATE    │
   │    (School Unit Legal Existence)  │           │    (School Topology & Staffing)   │
   │    • PLANNED                      │           │    • NOT_READY                    │
   │    • ACTIVE                       │           │    • READY                        │
   │    • SUSPENDED                    │           └───────────────────────────────────┘
   │    • CLOSED                       │
   └───────────────────────────────────┘                             +
                     +
   ┌───────────────────────────────────┐           ┌───────────────────────────────────┐
   │ 3. PARTICIPATION / COHORT STATE   │           │ 4. DIGITAL IDENTITY & ACCOUNT     │
   │    (Student & Pendidik Lifecycle) │           │    (Authentication Lifecycle)     │
   │    • ADMITTED                     │           │    • PROVISIONED                  │
   │    • ACTIVE                       │           │    • CLAIMABLE                    │
   │    • TRANSFERRED                  │           │    • CLAIMED                      │
   │    • GRADUATED                    │           │    • ACTIVE                       │
   │    • WITHDRAWN                    │           │    • SUSPENDED                    │
   │    (Progression: PROMOTED/RETAINED)           │    • DEACTIVATED                  │
   └───────────────────────────────────┘           └───────────────────────────────────┘
```

- **Prinsip Ortogonalitas:**
  - `School.status = ACTIVE` tidak otomatis berarti `School.operational_readiness = READY`.
  - `Student.status = ACTIVE` tidak otomatis berarti akun digitalnya `UserAccount.status = ACTIVE`.
  - `GuardianRelationship` yang sah secara hukum tidak otomatis menghasilkan hak akses digital jika ada restriksi hak asuh (`can_view_records = false`).
  - **Promosi Jenjang (`PROMOTION`):** Naik tingkat dari TK A ke TK B adalah **transaksi/event progres akademik**, bukan status terminal; status institusional siswa tetap `ACTIVE` pada rombel baru.

---

## 5. Institutional State Machines & Invariant Contracts

---

### 5.1. School Lifecycle & Operational Readiness

```text
LEGAL STATUS (School.status)
  [PLANNED] ──(SK Yayasan + Naming + NPSN)──► [ACTIVE] ──(SK Pembekuan)──► [SUSPENDED]
                                                 │                             │
                                                 │ (SK Penutupan)              │ (Reaktivasi)
                                                 ▼                             ▼
                                             [CLOSED] ◄────────────────────────┘

OPERATIONAL READINESS (School.operational_readiness)
  [NOT_READY] ──(Topology Validation: Year + Period + Rombel + Staff + Student)──► [READY]
```

- **Invariant:**
  - Sebuah unit sekolah **sah berstatus `ACTIVE` secara legal meskipun `operational_readiness = NOT_READY`** (misalnya saat baru berdiri dan mempersiapkan admisi).
  - Transisi `operational_readiness: NOT_READY -> READY` dievaluasi otomatis saat unit telah memiliki:
    1. Minimal 1 `AcademicYear` berstatus `ACTIVE`.
    2. Minimal 1 `AcademicPeriod` (Semester) berstatus `ACTIVE`.
    3. Minimal 1 `ClassRoom` aktif dengan `homeroom_teacher_id` terdaftar.
    4. Minimal 1 `Student` aktif yang telah ditempatkan pada rombel.

---

### 5.2. Academic Year & Academic Period (Semester) Sequencing

```text
ACADEMIC YEAR (Contoh: T.A. 2026/2027)
  [PLANNED] ──(Aktivasi Awal Tahun)──► [ACTIVE] ──(Explicit Rollover Transaction)──► [CLOSED]
                                          │
                  ┌───────────────────────┴───────────────────────┐
                  ▼                                               ▼
     SEMESTER 1 / GANJIL (AcademicPeriod)            SEMESTER 2 / GENAP (AcademicPeriod)
     [PLANNED] ──► [ACTIVE] ──► [CLOSED]             [PLANNED] ──► [ACTIVE] ──► [CLOSED]
```

- **Invariants & Sequencing Contract:**
  1. Tepat **satu** `AcademicYear` yang boleh berstatus `ACTIVE` per unit sekolah.
  2. Tepat **satu** `AcademicPeriod` yang boleh berstatus `ACTIVE` per tahun ajaran.
  3. `AcademicYear` **dapat berstatus `ACTIVE` saat belum ada `AcademicPeriod` yang aktif** (pada masa jeda persiapan kalender / libur semester).
  4. **Persyaratan Transaksi Pembelajaran Harian (Runtime):** Transaksi instruksional harian (RPPH sentra, presensi, observasi, draf LPPA) **wajib memiliki tepat satu `AcademicPeriod` berstatus `ACTIVE`**.
  5. **Larangan Auto-Archival Implisit:** Penutupan tahun ajaran lama dan promosi kohort wajib melalui transaksi **Explicit Governed Rollover (`rpc_rollover_academic_year`)**.
  6. Saat `AcademicYear -> CLOSED`, seluruh data evaluasi dan presensi pada tahun tersebut menjadi **read-only permanen**.

---

### 5.3. ClassRoom (Rombel) Lifecycle & Capacity Policy

```text
CLASSROOM LIFECYCLE
  [CONFIGURED] ──(Tahun Ajaran Aktif + Guru Ditugaskan)──► [ACTIVE] ──(Tutup Tahun)──► [ARCHIVED]
```

- **Kebijakan Kapasitas Terkendali (Governed Capacity Policy):**
  - Eksekusi penempatan siswa melempar error `CLASS_CAPACITY_EXCEEDED` jika kapasitas rombel terpenuhi.
  - Kepala Sekolah memiliki wewenang diskresi melalui command `PLACE_STUDENT_WITH_OVERRIDE` dengan kewajiban mencatat `override_reason` yang direkam dalam log audit institusi.

---

### 5.4. Student Admissions, Placement & Cohort Movement

```text
STUDENT COHORT LIFECYCLE
  [ADMITTED] ──(Penetapan Rombel oleh Kepsek)──► [ACTIVE] ──(Rollover Tahun)──► [PROMOTED]
                                                    │                               │
                                                    ├──(Pindah Sekolah)────────► [TRANSFERRED]
                                                    ├──(Lulus TK B)────────────► [GRADUATED]
                                                    └──(Mengundurkan Diri)─────► [WITHDRAWN]
```

- **Pemisahan Admisi vs. Penempatan:**
  1. `ADMIT_STUDENT`: Staf TU atau Kepala Sekolah mendaftarkan identitas anak dan wali. Status siswa menjadi `ADMITTED` (`current_class_id = NULL`).
  2. `PLACE_STUDENT`: Kepala Sekolah menetapkan rombel siswa melalui transaksi terverifikasi kapasitas. Status menjadi `ACTIVE`.
- **Trigger Guard:** `trg_student_placement_guard` memblokir pengubahan kolom `current_class_id` secara langsung dari client queries.

---

### 5.5. Guardian Relationship & Access Entitlement Separation

`[DECISION]` **Pemisahan Status Relasi Genealogis dari Hak Akses Institusional:**

```text
                 ┌──────────────────────────────────────────────┐
                 │       GENEALOGICAL / LEGAL RELATIONSHIP      │
                 │   (persons ──► guardian_relationships)       │
                 └──────────────────────┬───────────────────────┘
                                        │
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │       INSTITUTIONAL ACCESS ENTITLEMENT       │
                 │  • is_legal_guardian: boolean                │
                 │  • can_view_records: boolean                 │
                 │  • is_primary_contact: boolean               │
                 │  • emergency_priority: integer               │
                 └──────────────────────┬───────────────────────┘
                                        │
                                        ▼
                 ┌──────────────────────────────────────────────┐
                 │       GOVERNED PROJECTION / RLS BOUNDARY     │
                 │  • LPPA Progress Report (Shared)             │
                 │  • Observations (Non-Confidential Only)      │
                 │  • Buku Penghubung Notice & Acknowledgment   │
                 └──────────────────────────────────────────────┘
```

- **Perlindungan Sengketa Hak Asuh (Custody Disputes):**  
  Jika pengadilan atau otoritas keluarga membatasi hak akses salah satu orang tua, Kepala Sekolah mengubah flag `can_view_records = false`. Hubungan keluarga tetap tercatat dalam sejarah kanonikal, namun layer otorisasi dan RLS PostgreSQL memutus proyeksi data anak terhadap akun tersebut.

---

### 5.6. Identity Lifecycle & One-Time Claim Protocol

`[DECISION]` **Pemisahan Transaksi Klaim Akun dari Sesi Otentikasi:**

```text
[PROVISIONED] ──(Generate Claim Code)──► [CLAIMABLE] ──(Input Token Sekali Pakai)──► [CLAIMED]
                                                                                        │
                                                                       (Set Password)   ▼
[DEACTIVATED] ◄────── (Nonaktif) ────── [SUSPENDED] ◄────── (Mutasi) ─────────────── [ACTIVE]
```

1. **`PROVISIONED`:** Akun dibuat di Supabase Auth; digenerasikan **One-Time Claim Code** (kriptografis acak, kedaluwarsa 14 hari).
2. **Kartu Akses Digital:** Dokumen resmi diserahkan tertutup pada saat orientasi sekolah. Berisi:
   - Login Identifier / Email Institusi.
   - One-Time Claim Code (bukan password permanen).
   - QR Code verifikasi aktivasi.
3. **`CLAIMED` (Institutional Identity State):**
   - Pengguna memasukkan Identifier + Claim Code.
   - Sistem memvalidasi dan **seketika menganulir (invalidate) Claim Code**.
4. **`FIRST_LOGIN` & Forced Setup (UX Transition):**
   - Pengguna memasukkan kata sandi pribadi baru.
   - Sesi resmi diterbitkan; status akun beralih menjadi `ACTIVE`.
5. **`SUSPENDED`:** Jika terjadi mutasi atau evaluasi etik, status dipetakan `SUSPENDED` di database. `get_auth_person_id()` mengembalikan `NULL`, memicu penutupan sesi seketika (Fail-Closed).

---

## 6. Domain Commands Inventory (Atomic Architecture)

`[DECISION]` **Prinsip Abstraksi:** **Domain Commands** adalah konsep arsitektur tingkat tinggi (domain intent), sedangkan **Supabase / PostgreSQL RPC** adalah bentuk implementasi teknis pertamanya pada v1.1. Setup Wizard UI bertindak sebagai orkestrator transaksi yang memanggil urutan atomic commands ini:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                          ATOMIC DOMAIN COMMANDS (BACKEND SUITE)                         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  [INSTITUTIONAL COMMANDS]                                                               │
│   • cmd_charter_school(p_npsn, p_name, p_level, p_address, p_headmaster_person_id)      │
│   • cmd_configure_academic_year(p_school_id, p_name, p_start_date, p_end_date)          │
│   • cmd_activate_academic_year(p_school_id, p_academic_year_id)                         │
│   • cmd_configure_academic_period(p_academic_year_id, p_name, p_semester, ...)          │
│   • cmd_activate_academic_period(p_academic_period_id)                                  │
│   • cmd_rollover_academic_year(p_school_id, p_closing_year_id, p_new_year_id)           │
│   • cmd_create_classroom(p_school_id, p_academic_year_id, p_name, p_age_group, p_cap)   │
│                                                                                         │
│  [PEOPLE & ADMISSIONS COMMANDS]                                                         │
│   • cmd_register_person(p_nik, p_full_name, p_gender, p_birth_date, p_birth_place, ...) │
│   • cmd_register_teacher_profile(p_person_id, p_school_id, p_nuptk, p_specialization)   │
│   • cmd_assign_homeroom_teacher(p_classroom_id, p_teacher_person_id)                    │
│   • cmd_admit_student(p_person_id, p_school_id, p_nisn, p_nis, p_blood_type, ...)      │
│   • cmd_place_student(p_student_id, p_target_classroom_id)                              │
│   • cmd_place_student_with_override(p_student_id, p_target_classroom_id, p_reason)      │
│   • cmd_link_guardian(p_student_person_id, p_guardian_person_id, p_relation_type, ...)   │
│                                                                                         │
│  [IDENTITY & CREDENTIAL COMMANDS]                                                       │
│   • cmd_provision_account(p_person_id, p_email, p_role, p_claim_code_hash)             │
│   • cmd_claim_account(p_email, p_claim_code, p_new_password)                            │
│   • cmd_suspend_account(p_auth_user_id, p_reason)                                       │
│   • cmd_reactivate_account(p_auth_user_id)                                              │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Two-Stage Pilot Strategy with Governance Checkpoint

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                         TWO-STAGE PILOT GOVERNANCE ROADMAP                              │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  STAGE 1: RUNTIME OPERATIONAL HUMAN UAT (V2.1.5 🔒 — LIVE NOW)                          │
│  • Dataset: Pre-seeded (TK 01 Menteng, 2 Rombel, 5 Siswa, 6 Akun Terverifikasi).       │
│  • Peserta: 6 Partisipan Manusia Nyata (Yayasan, Kepsek, Guru TK A/B, Guru TK 02, Wali).│
│  • Tujuan: Validasi nilai pedagogis Kurikulum Merdeka, presensi, LPPA, Buku Penghubung. │
│  • Status: 🟢 TECHNICALLY CERTIFIED — READY FOR HUMAN UAT.                             │
│                                                                                         │
│                                           │                                             │
│                                           ▼                                             │
│  ┌───────────────────────────────────────────────────────────────────────────────────┐  │
│  │ GOVERNANCE CHECKPOINT & EVIDENCE REVIEW                                           │  │
│  │ • Evaluasi temuan lapangan dari Human UAT Stage 1                                 │  │
│  │ • Penyelarasan akhir parameter Onboarding Engine sebelum rekayasa v1.1            │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                           │                                             │
│                                           ▼                                             │
│                                                                                         │
│  STAGE 2: ONBOARDING ENGINE SPECIFICATION & REPAIR (v1.1 — NEXT MILESTONE)              │
│  • Ruang Lingkup: Implementasi Command RPCs, Setup Wizard UX, dan Kartu Akses Klaim.   │
│  • Tujuan: Validasi kemampuan mandiri Kepala Sekolah mendirikan & mengelola unit baru.  │
│  • Pengujian: Pilot Institutional Journeys (PIJ-01 .. PIJ-07).                          │
│                                                                                         │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Summary of Canonical Invariants (Locked Baseline v1.0)

1. `[INVARIANT 1]` **V2.1.5 Runtime Remains Frozen:** Onboarding architecture expands administrative capabilities without modifying the proven educational runtime.
2. `[INVARIANT 2]` **Person is Canonical:** Physical human identities exist independently of institutional profiles and authentication accounts.
3. `[INVARIANT 3]` **School Status vs. Readiness:** Legal status (`PLANNED|ACTIVE|SUSPENDED|CLOSED`) is decoupled from operational readiness (`NOT_READY|READY`).
4. `[INVARIANT 4]` **Academic Year vs. Period:** `AcademicYear` may be `ACTIVE` during preparation windows, but runtime transactions require exactly one `ACTIVE` `AcademicPeriod`.
5. `[INVARIANT 5]` **Headmaster Exclusive LPPA Authority:** Approval and publication of student progress reports belong strictly to the Headmaster (School Autonomy); Yayasan holds audit and quality oversight.
6. `[INVARIANT 6]` **Explicit Rollover:** Semester and year transitions are governed explicit transactions, never hidden auto-archivals.
7. `[INVARIANT 7]` **Relationship $\neq$ Entitlement:** Biological/legal guardian records are decoupled from operational access permissions to handle custody restrictions cleanly.
8. `[INVARIANT 8]` **One-Time Claim Protocol:** Initial credentials utilize single-use activation tokens (`CLAIMABLE -> CLAIMED -> ACTIVE`) rather than permanent plaintext passwords.
9. `[INVARIANT 9]` **Fail-Closed Security:** PostgreSQL table permissions remain locked; all lifecycle mutations execute via audited `SECURITY DEFINER` domain commands.

---

*Harmonized and formally established as Version 1.0.*  
*Status: Living Canonical Invariant Baseline — Ready for Stage 1 Human UAT & Stage 2 Technical Specification.*
