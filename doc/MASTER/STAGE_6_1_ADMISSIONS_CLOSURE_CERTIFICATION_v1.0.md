# YAPENDIK SCHOOL OS — STAGE 6.1 ADMISSIONS & ENROLLMENT CONTINUUM CLOSURE CERTIFICATION

> **STATUS:** AUTHORITATIVE & RATIFIED BY ARCHITECTURE REVIEW BOARD (ARB)  
> **STAGE:** 6.1 — Admissions & Enrollment Continuum (Pre-Canonical Staging & Atomic Ceremony Engine)  
> **DATE OF SEALING:** 2026-08-29  
> **TARGET COLD BASELINE:** `v3.0.2-PATCH`  
> **CANONICAL REFERENCE:** `ADR-05 (Pre-Canonical Staging & Atomic Ceremony RPC Pattern)`  
> **SECURITY BASELINE:** Invarian AP-01 s.d. AP-07 Sealed · Zero-PII Foundation Projection · 100% Contract Pass

---

## 1. EXECUTIVE DECREE (DEKLARASI PENUTUPAN ARB)

Dengan ini **Architecture Review Board (ARB) Yapendik School OS** secara retrospektif menyatakan bahwa **Stage 6.1 (Admissions & Enrollment Continuum)** telah **LENGKAP, TERVERIFIKASI, DAN DISEGEL SECARA KANONIKAL**.

Stage 6.1 menetapkan batas pemisah (*firewall epistemologis*) antara dunia pra-kanonikal (pendaftaran calon siswa oleh masyarakat umum) dan dunia kanonikal operasional sekolah. Seluruh transaksi promosi siswa dari pra-kanonikal ke kanonikal beroperasi di bawah mandat **ADR-05**, menjamin sifat atomik (*all-or-nothing*), pembersihan data otomatis (*90-day privacy purge*), privasi anti-panoptikon yayasan (*Zero-PII telemetry*), dan isolasi ketat peran *Applicant Guardian*.

Berdasarkan hasil eksekusi 18 pengujian kontrak dan adversarial (Suites 26, 27, 28, dan 29) dengan tingkat kelulusan **100% PASS (18/18 checks)**, seluruh artefak Stage 6.1 dibekukan. Modifikasi lebih lanjut pada tipe data kanonikal atau engine layanan penerimaan wajib melalui prosedur perubahan arsitektur (ADR) baru dengan persetujuan formal ARB.

---

## 2. THE COMPLETE ADMISSIONS STACK (DIAGRAM 4 LAPIS)

Arsitektur Admissions & Enrollment Continuum Yapendik School OS terstruktur dalam 4 lapisan terisolasi:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LAPIS 1: USER INTERFACE & GLASS LAYER BOUNDARIES                                        │
│  • Portal Orang Tua (/admissions/portal/*): Contextual Auth [APPLICANT_GUARDIAN]       │
│  • Meja PPDB Kepala Sekolah (/admissions/school/*): Admissions Desk & Ceremony Modal    │
│  • Isolasi DOM: Zero PII leakage, zero cross-parent selector, read-only staging views  │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LAPIS 2: PRE-CANONICAL STAGING REPOSITORIES (`AdmissionsService`)                       │
│  • Quotas (`admissions_capacity_quotas`)                                               │
│  • Staging Pelamar (`prospective_child_applicants`)                                     │
│  • Berkas Terenkripsi (`admissions_documents`) [AES-256 Storage Paths]                 │
│  • Observasi Diagnostik (`admissions_intake_observations`) [Karantina AP-02]            │
│  • 90-Day Privacy Retention Purge Daemon [AP-01]                                       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LAPIS 3: THE ENROLLMENT CEREMONY ENGINE (ADR-05 ATOMIC RPC)                             │
│  • RPC: `rpc_execute_enrollment_ceremony(p_applicant_id, p_target_class_id)`           │
│  • Validasi Pre-kondisi: Role HEADMASTER, Status == TUITION_SETTLED, Quota Available   │
│  • Deduplikasi Wali (`deterministicMd5(guardian_nik)`) & Multi-Unit Cancellation        │
│  • Baseline Snapshot Injection (Critical Fix #1: Memori Intake tanpa tabel fisik baru) │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ LAPIS 4: CANONICAL SCHOOL REALITY (DATABASE TERSEGEL)                                  │
│  • `persons` (Anak & Wali Murid)                                                       │
│  • `students` (Siswa Resmi Unit TK)                                                    │
│  • `enrollments` (Status Aktif Rombel Kelompok A/B)                                    │
│  • `student_guardians` (Relasi Legal Formal)                                           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. MATRIKS AUDIT INVARIAN (AP-01 s.d. AP-07 + ADR-05)

| Kode Invarian | Nama Invarian & Prinsip Epistemologis | Lapis Service / Database | Lapis UI / Glass Layer | Lapis Verifikasi (Tests) |
|---|---|---|---|---|
| **AP-01** | **Prospective Child Privacy & Retention**<br>Data calon siswa yang tidak diterima/batal wajib dihapus tuntas dalam 90 hari. | `admissionsService.ts:705-734`<br>(`purgeExpiredAdmissions`) | `ApplicationStepper.tsx:165-172`<br>(Status withdraw/not admitted) | `stage6_admissions_contracts.test.ts:360-395`<br>(`Suite 28 [Check 2]`) |
| **AP-02** | **Intake Observation Quarantine**<br>Observasi diagnostik awal terisolasi total dari portofolio LPPA aktif anak. | `admissionsService.ts:157, 413-419`<br>(`intakeObservations` map) | `IntakeObservationForm.tsx:50-71, 85-91`<br>(Diagnostik tanpa sinkronisasi LPPA) | `stage6_admissions_ui_contracts.test.tsx:122-140`<br>(`Suite 29 [Check 4]`) |
| **AP-03** | **Waitlist Confidentiality & Anti-Comparison**<br>Posisi antrean daftar tunggu bersifat rahasia dan non-komparatif. | `admissionsTypes.ts:57`<br>(`waitlist_capacity` limit) | `ApplicationStepper.tsx:46, 185-200`<br>(Status informatif tanpa ranking) | `stage6_admissions_ui_contracts.test.tsx:165-180`<br>(`Suite 29 [Check 6]`) |
| **AP-04** | **Guardian Self-Service Boundary**<br>Orang tua hanya dapat melihat dan memutasi data aplikasi miliknya sendiri. | `admissionsService.ts:317-365`<br>(`getMyApplications`) | `ApplicationDashboard.tsx:30-85`<br>(Isolasi akun wali murid) | `stage6_admissions_contracts.test.ts:195-240`<br>(`Suite 27 [Check 2]`) |
| **AP-05** | **Non-Discriminatory Developmental Intake**<br>Asesmen diagnostik untuk pemetaan stimulasi, bukan seleksi eliminatif. | `admissionsTypes.ts:114-135`<br>(`DevelopmentalDomainsReadiness`) | `IntakeObservationForm.tsx:20-60, 114-207`<br>(Pemetaan kualitatif 7 domain) | `stage6_admissions_contracts.test.ts:250-290`<br>(`Suite 27 [Check 5]`) |
| **AP-06** | **Atomic Promotion Transactionality**<br>Upacara promosi siswa kanonikal bersifat all-or-nothing dan mewajibkan SPP lunas. | `admissionsService.ts:426-658`<br>(`executeEnrollmentCeremony`) | `CeremonyExecutionModal.tsx:40-95`<br>(Tombol disabled jika status != TUITION_SETTLED) | `stage6_admissions_contracts.test.ts:54-185`<br>(`Suite 26 [Checks 1-4]`) |
| **AP-07** | **Anti-Panopticon Multi-Unit Redaction**<br>Proyeksi data yayasan wajib zero-PII (hanya agregat numerik per status). | `admissionsService.ts:664-694`<br>(`getAdmissionsTelemetry`) | `FoundationLayout.tsx`<br>(Telemetri statistik tanpa daftar nama) | `stage6_admissions_contracts.test.ts:335-358`<br>(`Suite 28 [Check 1]`) |
| **ADR-05** | **Pre-Canonical Staging & Atomic Ceremony Pattern**<br>Arsitektur pemisahan tabel pra-kanonikal & upacara promosi multi-tabel. | `admissionsService.ts:152-160, 426-658`<br>(Staging + Ceremony Pattern) | `ApplicantReviewTable.tsx`, `CeremonyExecutionModal.tsx` | `stage6_admissions_contracts.test.ts:54-290`<br>(`Suites 26-27 All Checks`) |

---

## 4. STATE MACHINE FORMAL (`AdmissionStatus`)

Siklus hidup pendaftaran calon siswa diatur oleh mesin status 12 tingkat:

```
[DRAFT_APPLICATION] ──(Ajukan Form)──► [SUBMITTED] ──(Validasi Berkas)──► [DOCUMENT_VERIFIED]
                                                                                  │
                                                                         (Jadwalkan Observasi)
                                                                                  │
                                                                                  ▼
[OFFERED_ADMISSION] ◄──(Lulus Asesmen)── [INTAKE_ASSESSED] ◄──(Asesmen)── [INTAKE_SCHEDULED]
        │
        ├──(Daftar Tunggu)──────────────► [WAITLISTED]
        │
        ├──(Batal / Mundur)─────────────► [APPLICATION_WITHDRAWN] (Terminal)
        │
        ├──(Ditolak / Kuota Penuh)──────► [NOT_ADMITTED] (Terminal)
        │
        ├──(Diterima di Unit Lain)──────► [CANCELLED_ENROLLED_ELSEWHERE] (Terminal)
        │
        ▼ (Pelunasan Uang Pangkal)
[TUITION_SETTLED]
        │
        ▼ (Eksekusi The Enrollment Ceremony — AP-06)
[ENROLLED_PROMOTED] (Terminal Kanonikal)
```

### Tabel Transisi Status

| # | Status (`AdmissionStatus`) | Tipe Status | Transisi Legal Berikutnya | Penegakan Invarian & Syarat |
|---|---|---|---|---|
| 1 | `DRAFT_APPLICATION` | Active | `SUBMITTED`, `APPLICATION_WITHDRAWN` | Pengisian identitas anak dan wali. |
| 2 | `SUBMITTED` | Active | `DOCUMENT_VERIFIED`, `APPLICATION_WITHDRAWN` | Berkas terunggah lengkap. |
| 3 | `DOCUMENT_VERIFIED` | Active | `INTAKE_SCHEDULED`, `APPLICATION_WITHDRAWN` | Verifikasi panitia PPDB unit. |
| 4 | `INTAKE_SCHEDULED` | Active | `INTAKE_ASSESSED`, `APPLICATION_WITHDRAWN` | Penetapan jadwal observasi intake. |
| 5 | `INTAKE_ASSESSED` | Active | `OFFERED_ADMISSION`, `WAITLISTED`, `NOT_ADMITTED` | Karantina diagnostik (AP-02 & AP-05). |
| 6 | `OFFERED_ADMISSION` | Active | `TUITION_SETTLED`, `APPLICATION_WITHDRAWN` | Penawaran kursi resmi unit TK. |
| 7 | `WAITLISTED` | Active | `OFFERED_ADMISSION`, `APPLICATION_WITHDRAWN`, `NOT_ADMITTED` | Kerahasiaan antrean (AP-03). |
| 8 | `NOT_ADMITTED` | **Terminal** | *None* (Subjek Retensi 90 Hari) | Dihapus otomatis via AP-01. |
| 9 | `APPLICATION_WITHDRAWN` | **Terminal** | *None* (Subjek Retensi 90 Hari) | Dihapus otomatis via AP-01. |
| 10 | `CANCELLED_ENROLLED_ELSEWHERE` | **Terminal** | *None* (Subjek Retensi 90 Hari) | Pembatalan otomatis lintas unit (ADR-05). |
| 11 | `TUITION_SETTLED` | Active | `ENROLLED_PROMOTED`, `APPLICATION_WITHDRAWN` | **Pre-kondisi Mutlak AP-06** untuk Upacara Promosi. |
| 12 | `ENROLLED_PROMOTED` | **Terminal** | *Promoted into Canonical Roster* | Siswa aktif kanonikal permanen (ADR-05). |

---

## 5. AUTHORITY MATRIX (7 OPERASI INTI × 4 PERAN)

| Operasi Layanan | `APPLICANT_GUARDIAN` | `HEADMASTER` | `YAPENDIK_SUPERADMIN` | `FOUNDATION_DIRECTOR` | Alasan Penegakan Invarian |
|---|---|---|---|---|---|
| `createApplicant` | 🟢 **ALLOWED** | 🟢 **ALLOWED** | 🟢 **ALLOWED** | 🔴 **BLOCKED** | Pendaftaran mandiri wali atau operator unit sekolah (AP-04). |
| `getMyApplications` | 🟢 **ALLOWED** | 🔴 **BLOCKED** | 🔴 **BLOCKED** | 🔴 **BLOCKED** | Isolasi data pendaftar khusus sesi login wali terkait (AP-04). |
| `verifyDocument` | 🔴 **BLOCKED** | 🟢 **ALLOWED** | 🟢 **ALLOWED** | 🔴 **BLOCKED** | Validasi berkas fisik kewenangan panitia sekolah unit. |
| `recordIntakeObservation` | 🔴 **BLOCKED** | 🟢 **ALLOWED** | 🟢 **ALLOWED** | 🔴 **BLOCKED** | Asesmen perkembangan anak oleh pendidik/kepala sekolah (AP-02/AP-05). |
| `executeEnrollmentCeremony` | 🔴 **BLOCKED** | 🟢 **ALLOWED** (Unit Sendiri) | 🟢 **ALLOWED** | 🔴 **BLOCKED** | Otoritas kanonikal pengukuhan siswa unit (AP-06 & Tenant C-11). |
| `getAdmissionsTelemetry` | 🔴 **BLOCKED** | 🟢 **ALLOWED** (Unit Sendiri) | 🟢 **ALLOWED** | 🟢 **ALLOWED** | Proyeksi kuota dan demografi Zero-PII agregat (AP-07). |
| `purgeExpiredAdmissions` | 🔴 **BLOCKED** | 🔴 **BLOCKED** | 🟢 **ALLOWED** (Daemon) | 🔴 **BLOCKED** | Otomasi penghapusan data kedaluwarsa 90 hari (AP-01). |

---

## 6. VERIFICATION PROOF MATRIX (18 CHECKS SUITES 26–29)

Seluruh 18 assert/check pada rangkaian tes Stage 6 lulus tanpa kegagalan:

### Backend Contracts & Rollback Integrity (`tests/stage6_admissions_contracts.test.ts`)
* **Suite 26: The Ceremony Atomicity & Rollback Integrity (AP-06 & ADR-05)**
  1. `[PRECONDITION STATUS]`: Ceremony ditolak jika status $\neq$ `TUITION_SETTLED` *(PASS)*
  2. `[TENANT ISOLATION C-11]`: Kepala Sekolah TK 02 diblokir mempromosikan calon siswa TK 01 *(PASS)*
  3. `[QUOTA OVERFLOW GUARD]`: Ceremony ditolak jika kapasitas rombel telah 100% penuh *(PASS)*
  4. `[SUCCESSFUL CEREMONY]`: Promosi atomik serentak ke 4 tabel kanonikal (`persons`, `students`, `enrollments`, `student_guardians`) *(PASS)*
* **Suite 27: Guardian Deduplication & Multi-Unit Cancellation (AP-04 & ADR-05)**
  5. `[DETERMINISTIC ID]`: ID anak dan wali adalah pure deterministic hash NIK *(PASS)*
  6. `[GUARDIAN DEDUPLICATION]`: Pendaftaran adik/saudara kandung mendeteksi dan menggunakan ulang `person_id` wali yang ada *(PASS)*
  7. `[MULTI-UNIT CANCELLATION]`: Promosi anak di TK 01 otomatis membatalkan aplikasi paralel di TK 02 dengan status `CANCELLED_ENROLLED_ELSEWHERE` *(PASS)*
  8. `[IDEMPOTENCY GUARD]`: Eksekusi upacara ulang pada siswa yang telah dipromosikan ditolak *(PASS)*
  9. `[SNAPSHOT INJECTION CRITICAL FIX #1]`: Injeksi `promoted_baseline_snapshot` memindahkan data intake ke memori siswa tanpa membuat tabel baru *(PASS)*
* **Suite 28: Zero-PII Foundation Projection & 90-Day Privacy Purge (AP-01 & AP-07)**
  10. `[ZERO-PII PROJECTION AP-07]`: Telemetri yayasan hanya memuat kolom agregat kuantitatif tanpa nama/NIK anak *(PASS)*
  11. `[90-DAY PRIVACY PURGE AP-01]`: Penghapusan menyeluruh data pelamar dan dokumen yang kedaluwarsa $> 90$ hari *(PASS)*

### Glass Layer UI Adversarial Suite (`tests/stage6_admissions_ui_contracts.test.tsx`)
* **Suite 29: Admissions Glass Layer UI & Role Boundary Assertions**
  12. `[GUEST ROLE ISOLATION]`: Peran `APPLICANT_GUARDIAN` dikarantina ketat hanya pada rute portal `/admissions/portal/*` *(PASS)*
  13. `[AP-04 SELF-SERVICE]`: DOM portal orang tua 100% bersih dari pemilih/pencarian data pelamar lain *(PASS)*
  14. `[AP-06 CEREMONY PRECONDITION]`: Modal upacara menonaktifkan tombol konfirmasi jika pendaftar belum `TUITION_SETTLED` *(PASS)*
  15. `[AP-02 INTAKE QUARANTINE]`: Form observasi intake tidak memiliki tombol ekspor/sinkronisasi ke portofolio LPPA *(PASS)*
  16. `[STAGING ISOLATION]`: Tabel review penerimaan hanya merender data pra-kanonikal pendaftar *(PASS)*
  17. `[STEPPER LIFECYCLE]`: Stepper alur pendaftaran merender tahapan status yang sesuai *(PASS)*
  18. `[DOCUMENT ZONE]`: Zona unggah dokumen menampilkan jaminan enkripsi AES-256 dan kepatuhan privasi *(PASS)*

---

## 7. WHAT IS NOW CANONICAL (DIBEKUKAN)

### A. Entitas Tipe Data Domain (`src/types/admissionsTypes.ts`)
1. `ProspectiveChildApplicant`
2. `AdmissionsCapacityQuota`
3. `AdmissionsDocument`
4. `AdmissionsIntakeObservation`
5. `AdmissionsTelemetryProjection`
6. `EnrollmentCeremonyResult`
7. `PurgeAdmissionsResult`
8. `AdmissionStatus` (12 status union)
9. `ClassLevel` (`TK_A | TK_B | KB | TPA`)
10. `DocumentType` (5 kategori berkas)
11. `DocumentVerificationStatus`
12. `GuardianRelationshipType`
13. `DevelopmentalDomainsReadiness`

### B. Service & Mutation API (`src/services/admissionsService.ts`)
1. `createApplicant`
2. `getApplicant`
3. `listApplicantsForSchool`
4. `updateApplicantStatus`
5. `getMyApplications`
6. `uploadDocument`
7. `listDocuments`
8. `verifyDocument`
9. `recordIntakeObservation`
10. `getIntakeObservation`
11. `executeEnrollmentCeremony`
12. `getAdmissionsTelemetry`
13. `purgeExpiredAdmissions`
14. `listQuotas`
15. `getQuota`

> **ATURAN PEMBEKUAN:** Seluruh tipe dan fungsi di atas berstatus **SEALED**. Dilarang mengubah nama properti, menambah field opsional tak berizin, atau mengubah alur validasi upacara tanpa persetujuan formal ARB dan pembuatan dokumen ADR pendukung.

---

## 8. DEFERRED & PROJECTION INVENTORY

1. **AP-03 & AP-05 Runtime Hardening:**  
   Meskipun AP-03 (Kerahasiaan Antrean) dan AP-05 (Intake Holistik Non-Diskriminatif) telah terbukti patuh pada level kontrak model, antarmuka portal, dan suite tes, audit berkala pada alur notifikasi publik tetap dicatat sebagai item pemantauan (*Watch-Item*).
2. **BSrE Digital Signature Verification Gateway:**  
   Penyelarasan sertifikat elektronik BSrE untuk surat penerimaan resmi ditautkan pada integrasi infrastruktur tahap lanjutan (mengacu pada *Stage 4.5 §6*).
3. **WhatsApp / SMS Gateway Dispatcher:**  
   Pengiriman otomatis notifikasi status penerimaan dan instruksi pembayaran SPP via WhatsApp Business API dijadwalkan pada antrean integrasi pesan pasca-pilot.

---

## 9. FINAL CERTIFICATION SCORECARD

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│               YAPENDIK SCHOOL OS — STAGE 6.1 CLOSURE CERTIFICATION                     │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ ARB SEAL ID:           ARB-STG-6.1-20260829-CANONICAL                                  │
│ DOMAIN:                Admissions & Enrollment Continuum (Pre-Canonical Staging Engine)│
│ STATUS:                SEALED & FROZEN (100% CANONICAL)                                │
│ BASELINE COMMIT REF:   v3.0.2-PATCH (2026-08-29)                                       │
│ CONTRACT INTEGRITY:    18 / 18 CHECKS PASSED (100%)                                    │
│ INVARIANTS RATIFIED:   AP-01, AP-02, AP-03, AP-04, AP-05, AP-06, AP-07, ADR-05          │
│ SECURITY BOUNDARY:     ZERO PII FOUNDATION PROJECTION · ATOMIC CEREMONY VERIFIED       │
│ AUTHORIZING BODY:      Yapendik Architecture Review Board (ARB)                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```
