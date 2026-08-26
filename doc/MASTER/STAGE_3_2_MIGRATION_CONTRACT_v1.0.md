# YAPENDIK SCHOOL OS — STAGE 3.2: MIGRATION CONTRACT
## Version 1.0 — Execution Contract for Governed State Transitions, Temporal Lifecycle RPCs & Derived Intelligence

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Document Type:** Migration Execution & Governance Contract  
**Status:** **ACTIVE CONTRACT — LOCKED GOVERNANCE BOUNDARY PRIOR TO RPC SQL CODING**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2, EIA v0.1, Stage 3 Canonical Information Model v1.0 (Locked Baseline), Stage 3 Technical Specification v1.1, and Stage 3.1 Certified Baseline.  
**Target Migration File:** `db_migrations/m06_governed_lifecycle_rpcs_and_telemetry.sql`  
**Prerequisites:** Stage 3.1 Certified Baseline (FROZEN & VERIFIED).  
**Core Motto:** *RPC is a Governance Boundary, Not a CRUD Convenience • Lineage Wins • Service Before Surveillance.*

---

## 1. Executive Summary & Architectural Philosophy

Dokumen ini adalah **kontrak eksekusi migrasi resmi (Execution Contract)** untuk **Milestone 3.2: Governed State Transitions & Derived Intelligence**. 

Jika Milestone 3.1 menjawab:  
> *“Apa yang boleh ada dan bagaimana skema mencegah fakta historis dirusak?”*  

Maka Milestone 3.2 menjawab:  
> *“Siapa yang berwenang menyebabkan perubahan state, kapan, dengan prasyarat apa, dan melalui transaksi atomik apa?”*

Di dalam Yapendik School OS, PostgreSQL RPC bukan sekadar pembungkus (*wrapper*) query CRUD atau jalan pintas API. **RPC adalah Batas Tata Kelola Mutlak (*Absolute Governance Boundary*)**. Tidak ada satu baris kode frontend pun yang diperbolehkan mengubah riwayat penempatan atau status siklus akademik secara langsung. Seluruh perubahan state wajib dievaluasi melalui gerbang validasi berlapis:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                     GOVERNED RPC STATE-TRANSITION LIFECYCLE PIPELINE                   │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. COMMAND INGESTION      ──► Client passes intent & explicit parameters              │
│ 2. TRUSTED IDENTITY CHECK ──► Actor identity derived strictly from `get_auth_person_id`│
│ 3. CONTEXTUAL AUTH CHECK  ──► Superadmin / Assigned School Headmaster jurisdiction     │
│ 4. TEMPORAL STATE GUARD   ──► Verify lifecycle_status of source/target academic terms  │
│ 5. RECONCILIATION INVARIANT─► Population matching (100% LPPA, Capacity check, etc.)    │
│ 6. ATOMIC LINEAGE MUTATION──► Terminalize old active placement + Append new placement  │
│ 7. PROJECTION SYNC        ──► `students.current_class_id` auto-projected via trigger   │
│ 8. GOVERNANCE AUDIT LOG   ──► Structured immutable audit payload appended to ledger    │
│ 9. ATOMIC COMMIT / ABORT  ──► Complete state transition or 100% rollback on failure    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Hardened Alignment with Stage 3.1 Certified Physical Reality

Kontrak Stage 3.2 secara mutlak mematuhi realitas fisik database yang telah disertifikasi pada Stage 3.1:

1. **Temporal Container Reality:**  
   Tabel `public.academic_years` bertindak sebagai kontainer temporal tunggal per sekolah yang menyimpan periode semester (`name` e.g. `'T.A. 2026/2027'`, `semester` `'GANJIL'`/`'GENAP'`, `lifecycle_status`, `start_date`, `end_date`, `is_active`). Tidak ada tabel `academic_periods` terpisah yang dibuat agar tidak menimbulkan fragmentasi skema.
2. **Authoritative Lineage vs. Projection Reality:**  
   `public.student_placement_records` adalah **Authoritative Temporal Lineage** (Append-Only). Kolom `public.students.current_class_id` adalah **Current Operational Projection** yang dikendalikan oleh trigger sinkronisasi otomatis (*Lineage Wins*).
3. **Hardening Verification Debt from 3.1:**  
   Trigger `fn_guard_closed_semester_mutations` yang melindungi periode `CLOSED`/`ARCHIVED` wajib diuji secara eksplisit untuk ketiga operasi DML (`INSERT`, `UPDATE`, dan `DELETE`) dalam test suite 3.2.

---

## 3. Discrete State Machine & Irreversibility Matrix

Seluruh transisi state pada Stage 3 bersifat **searah (*unidirectional / forward-only*)**. Tidak ada transisi mundur (*no reverse transition*) yang diizinkan oleh sistem.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        DISCRETE STATE TRANSITION CONTRACTS                             │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Academic Term:     PLANNED ──► ACTIVE ──► CLOSING ──► CLOSED ──► ARCHIVED          │
│ 2. Placement Record:  ACTIVE  ──► PROMOTED / COMPLETED / TRANSFERRED (Frozen Forever)  │
│ 3. Student Profile:   ACTIVE  ──► TRANSFERRED / WITHDRAWN / GRADUATED                 │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

```text
┌──────────────────────┬──────────────────────┬──────────────────────┬───────────────────────────────────────────┐
│ Entity               │ Initial State        │ Target State         │ Permitted Trigger / Governed RPC          │
├──────────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────────────┤
│ `academic_years`     │ `PLANNED`            │ `ACTIVE`             │ `rpc_initialize_next_semester` (Term start)│
│ `academic_years`     │ `ACTIVE`             │ `CLOSING`            │ Direct Headmaster review initiation       │
│ `academic_years`     │ `ACTIVE` / `CLOSING` │ `CLOSED`             │ `rpc_close_academic_semester`             │
│ `academic_years`     │ `CLOSED`             │ `ARCHIVED`           │ Long-term foundation archive command      │
├──────────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────────────┤
│ `student_placement_` │ `ACTIVE`             │ `PROMOTED`           │ `rpc_promote_classroom_cohort`            │
│ `records`            │ `ACTIVE`             │ `COMPLETED`          │ `rpc_graduate_student_cohort`             │
│                      │ `ACTIVE`             │ `TRANSFERRED`        │ Governed student transfer command         │
├──────────────────────┼──────────────────────┼──────────────────────┼───────────────────────────────────────────┤
│ `students`           │ `ACTIVE`             │ `GRADUATED`          │ `rpc_graduate_student_cohort`             │
│                      │ `ACTIVE`             │ `TRANSFERRED`        │ Governed student transfer command         │
│                      │ `ACTIVE`             │ `WITHDRAWN`          │ Governed formal withdrawal command        │
└──────────────────────┴──────────────────────┴──────────────────────┴───────────────────────────────────────────┘
```

---

## 4. Contextual Authorization Matrix

Setiap operasi dibatasi oleh jurisdiksi peran aktor yang diverifikasi langsung di sisi server PostgreSQL:

```text
┌───────────────────────────────┬────────────┬─────────────┬─────────────┬─────────────┐
│ Governed Operation / Function │ Superadmin │ Headmaster  │ Teacher     │ Guardian    │
├───────────────────────────────┼────────────┼─────────────┼─────────────┼─────────────┤
│ `rpc_close_academic_semester` │ 🟢 ALLOW   │ 🟢 ALLOW*   │ 🔴 FORBIDDEN│ 🔴 FORBIDDEN│
├───────────────────────────────┼────────────┼─────────────┼─────────────┼─────────────┤
│ `rpc_promote_classroom_cohort`│ 🟢 ALLOW   │ 🟢 ALLOW*   │ 🔴 FORBIDDEN│ 🔴 FORBIDDEN│
├───────────────────────────────┼────────────┼─────────────┼─────────────┼─────────────┤
│ `rpc_graduate_student_cohort` │ 🟢 ALLOW   │ 🟢 ALLOW*   │ 🔴 FORBIDDEN│ 🔴 FORBIDDEN│
├───────────────────────────────┼────────────┼─────────────┼─────────────┼─────────────┤
│ `rpc_initialize_next_semester`│ 🟢 ALLOW   │ 🟢 ALLOW*   │ 🔴 FORBIDDEN│ 🔴 FORBIDDEN│
├───────────────────────────────┼────────────┼─────────────┼─────────────┼─────────────┤
│ `fn_derive_school_health_tel.`│ 🟢 ALLOW   │ 🟢 ALLOW*   │ 🔴 FORBIDDEN│ 🔴 FORBIDDEN│
├───────────────────────────────┼────────────┼─────────────┼─────────────┼─────────────┤
│ `fn_get_student_longitudinal` │ 🟢 ALLOW   │ 🟢 ALLOW*   │ 🟢 ALLOW**  │ 🟢 ALLOW*** │
├───────────────────────────────┼────────────┼─────────────┼─────────────┼─────────────┤
│ Direct Client DML (Lineage)   │ 🔴 DENIED  │ 🔴 DENIED   │ 🔴 DENIED   │ 🔴 DENIED   │
└───────────────────────────────┴────────────┴─────────────┴─────────────┴─────────────┘
```
* `ALLOW*`: Terbatas secara ketat hanya pada unit sekolah tempat Kepala Sekolah ditugaskan (`schools.headmaster_person_id = get_auth_person_id()`).  
* `ALLOW**`: Terbatas pada siswa di unit sekolah tempat guru aktif bertugas.  
* `ALLOW***`: Terbatas mutlak hanya pada anak kandung/perwalian sah yang terdaftar dalam `guardian_relationships`.

---

## 5. Formal Governed RPC Specifications

---

### 5.1 `rpc_close_academic_semester`

* **Purpose:** Menutup operasi akademik sebuah semester/tahun akademik secara definitif dan membekukan seluruh data operasional (presensi, observasi, rapor) menjadi *read-only*.
* **Signature:** `rpc_close_academic_semester(p_school_id TEXT, p_academic_year_id TEXT)`
* **Execution Security:** `SECURITY DEFINER`, `SET search_path = public, pg_temp`.

```text
┌──────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Field            │ Technical Guarantee Specification                                      │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Caller Identity  │ Server-side via `get_auth_person_id()`. Rejects if NULL.               │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Authorization    │ Superadmin OR assigned Headmaster of `p_school_id`.                    │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Preconditions    │ 1. `p_academic_year_id` exists in school and status is ACTIVE/CLOSING. │
│                  │ 2. 100% Reconciliation: All active placed students in this AY must    │
│                  │    have progress reports (LPPA) in `APPROVED` or `PUBLISHED` status.   │
│                  │ 3. Zero DRAFT or unapproved LPPA reports remain for this AY.           │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ State Transition │ `academic_years.lifecycle_status` becomes `'CLOSED'`.                  │
│                  │ `academic_years.is_active` becomes `FALSE`.                            │
│                  │ `academic_years.closed_at` recorded as `now()`.                        │
│                  │ `academic_years.closed_by_person_id` recorded as caller Person ID.     │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Placement Impact │ OPTION A GUARANTEE: `student_placement_records` are NOT terminalized.  │
│                  │ Placements remain intact until promotion or graduation occurs.         │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Audit Event      │ Action: `'CLOSE_SEMESTER'`, Resource: `'academic_year'`,               │
│                  │ Details: includes reconciled active student count and closed timestamp.│
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Idempotency      │ Calling on already CLOSED period throws `'INVALID_SEMESTER_STATE'`.    │
└──────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

### 5.2 `rpc_promote_classroom_cohort`

* **Purpose:** Memajukan rombel siswa dari kelas asal (e.g. TK A) ke kelas tujuan (e.g. TK B) secara atomik, membekukan penempatan lama (`PROMOTED`), dan menambahkan penempatan baru (`ACTIVE`).
* **Signature:** `rpc_promote_classroom_cohort(p_school_id TEXT, p_source_class_id TEXT, p_target_class_id TEXT, p_target_academic_year_id TEXT, p_student_ids TEXT[])`
* **Execution Security:** `SECURITY DEFINER`, `SET search_path = public, pg_temp`.

```text
┌──────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Field            │ Technical Guarantee Specification                                      │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Caller Identity  │ Server-side via `get_auth_person_id()`. Rejects if NULL.               │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Authorization    │ Superadmin OR assigned Headmaster of `p_school_id`.                    │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Preconditions    │ 1. Source class and Target class belong to `p_school_id`.              │
│                  │ 2. Source academic year must be `CLOSED` or `CLOSING`.                 │
│                  │ 3. Target academic year must be `PLANNED` or `ACTIVE`.                 │
│                  │ 4. `p_student_ids` is non-empty.                                       │
│                  │ 5. Every student in `p_student_ids` has an active placement in source  │
│                  │    class.                                                              │
│                  │ 6. Capacity Invariant: Current active placements in target class plus  │
│                  │    promoted student count <= target class capacity.                    │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ State Transition │ For each student:                                                      │
│                  │ 1. Old placement: `placement_status = 'PROMOTED'`, `exit_date = now()`.│
│                  │ 2. New placement: `INSERT` with `placement_status = 'ACTIVE'`,         │
│                  │    `academic_year_id = p_target_academic_year_id`,                      │
│                  │    `class_id = p_target_class_id`.                                     │
│                  │ 3. `students.current_class_id` auto-synced via trigger.                │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Audit Event      │ Action: `'PROMOTE_COHORT'`, Resource: `'class'`,                       │
│                  │ Details: source class, target class, target AY, promoted student IDs.  │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Failure Behavior │ If capacity exceeded or any student not active in source: TRANSACTION  │
│                  │ ABORTS 100%. No partial promotions.                                    │
└──────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

### 5.3 `rpc_graduate_student_cohort`

* **Purpose:** Menyelesaikan penempatan siswa tingkat akhir (TK B) sebagai lulusan resmi Yapendik, membekukan penempatan (`COMPLETED`), dan memperbarui status institusional menjadi `GRADUATED`.
* **Signature:** `rpc_graduate_student_cohort(p_school_id TEXT, p_class_id TEXT, p_student_ids TEXT[])`
* **Execution Security:** `SECURITY DEFINER`, `SET search_path = public, pg_temp`.

```text
┌──────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Field            │ Technical Guarantee Specification                                      │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Caller Identity  │ Server-side via `get_auth_person_id()`. Rejects if NULL.               │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Authorization    │ Superadmin OR assigned Headmaster of `p_school_id`.                    │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Preconditions    │ 1. Class belongs to `p_school_id`.                                     │
│                  │ 2. `p_student_ids` is non-empty.                                       │
│                  │ 3. All selected students must have active placement in `p_class_id`.   │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ State Transition │ For each student:                                                      │
│                  │ 1. Placement: `placement_status = 'COMPLETED'`, `exit_date = now()`,   │
│                  │    `promotion_remarks = 'Graduated from TK B'`.                        │
│                  │ 2. Student Profile: `status = 'GRADUATED'`, `current_class_id = NULL`. │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Audit Event      │ Action: `'GRADUATE_COHORT'`, Resource: `'class'`,                      │
│                  │ Details: class ID, graduated count, graduated student IDs.             │
└──────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

### 5.4 `rpc_initialize_next_semester`

* **Purpose:** Membuka periode/semester baru (e.g. Semester GENAP atau Tahun Akademik Baru) setelah periode sebelumnya ditutup secara sah.
* **Signature:** `rpc_initialize_next_semester(p_school_id TEXT, p_name TEXT, p_semester TEXT, p_start_date DATE, p_end_date DATE)`
* **Execution Security:** `SECURITY DEFINER`, `SET search_path = public, pg_temp`.

```text
┌──────────────────┬────────────────────────────────────────────────────────────────────────┐
│ Field            │ Technical Guarantee Specification                                      │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Caller Identity  │ Server-side via `get_auth_person_id()`. Rejects if NULL.               │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Authorization    │ Superadmin OR assigned Headmaster of `p_school_id`.                    │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Preconditions    │ 1. `p_semester IN ('GANJIL', 'GENAP')`.                                │
│                  │ 2. `p_end_date > p_start_date`.                                        │
│                  │ 3. Zero conflicting active periods in school (`uq_academic_years_`).   │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ State Transition │ `INSERT INTO academic_years` with `lifecycle_status = 'ACTIVE'`,       │
│                  │ `is_active = TRUE`.                                                    │
├──────────────────┼────────────────────────────────────────────────────────────────────────┤
│ Audit Event      │ Action: `'INITIALIZE_SEMESTER'`, Resource: `'academic_year'`.          │
└──────────────────┴────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Derived Intelligence & Telemetry Specifications

---

### 6.1 `fn_derive_school_health_telemetry` (On-the-Fly Telemetry)

* **Design Invariant:** Telemetri dihitung secara dinamis dari agregasi relasional murni. **Tidak ada tabel mutasi status kesehatan yang disimpan di database**.
* **Signature:** `fn_derive_school_health_telemetry(p_school_id TEXT) RETURNS JSONB`
* **Four Canonical Indicators Computed:**
  1. **Capacity Utilization:** $\frac{\text{Total Placed Students}}{\text{Total Class Capacity}} \times 100\%$
  2. **Staffing Compliance:** $\text{Unstaffed Active Classes} == 0$
  3. **Attendance Consistency:** Jumlah hari presensi terdaftar dalam periode aktif.
  4. **Curriculum Velocity:** $\frac{\text{Approved LPPA Count}}{\text{Total Active Placed Students}} \times 100\%$
* **Exceptions Surfaced:** `NO_ACTIVE_SEMESTER`, `UNSTAFFED_CLASSES`, `PENDING_LPPA_APPROVALS`, `OVERCAPACITY_ROOMS`.

---

### 6.2 `fn_get_student_longitudinal_trajectory` (Authorized Longitudinal Curve)

* **Design Invariant:** Menampilkan garis waktu penempatan kronologis dan riwayat rapor anak tanpa batasan semester tunggal.
* **Signature:** `fn_get_student_longitudinal_trajectory(p_student_id TEXT) RETURNS JSONB`
* **Authorization Barrier:** Memverifikasi pemanggil adalah Superadmin, Guru di sekolah siswa, atau Orang Tua/Wali Sah yang terdaftar dalam `guardian_relationships`. Jika tidak berwenang, melempar exception `UNAUTHORIZED`.

---

## 7. Failure & Rollback Protocol

Seluruh eksekusi RPC berjalan di bawah transaksi atomik PostgreSQL:
1. Jika satu validasi prasyarat (*precondition*) gagal, **seluruh transaksi dibatalkan (*100% ROLLBACK*)**.
2. Tidak ada mutasi parsial pada tabel lineage, status siswa, maupun tahun akademik jika terjadi kegagalan di tengah jalan.
3. Seluruh error melempar kode error terstandar (*canonical error codes*):
   * `UNAUTHENTICATED`, `UNAUTHORIZED`, `SEMESTER_NOT_FOUND`, `INVALID_SEMESTER_STATE`, `PRECONDITION_FAILED`, `CAPACITY_EXCEEDED`, `STUDENT_NOT_ACTIVE_IN_SOURCE`.

---

## 8. Verification Protocol (Pre-requisite to Milestone 3.3)

Setelah SQL migrasi `m06` dieksekusi, skrip pengujian live `scripts/verify_stage3_2_rpcs.mjs` wajib memverifikasi:

```text
┌───┬──────────────────────────────────┬────────────────────────────────────────────────────────┐
│ # │ Verification Check               │ Mandatory Success Assertion                            │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 1 │ Hardening Debt: UPDATE / DELETE  │ UPDATE/DELETE pada CLOSED academic year ditolak trigger│
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 2 │ Negative Auth Boundary on RPCs   │ Guru & Wali memanggil close/promote ditolak UNAUTHORIZED│
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 3 │ Close Semester Reconciliation     │ Close semester tanpa 100% approved LPPA ditolak abort. │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 4 │ Cohort Promotion Lifecycle       │ TK A -> TK B: placement lama PROMOTED, baru ACTIVE,    │
│   │                                  │ projection current_class_id terupdate.                 │
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 5 │ Cohort Graduation Lifecycle      │ TK B -> GRADUATED: placement COMPLETED, projection NULL│
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 6 │ Health Telemetry Calculation     │ 4 indikator kanonikal & exceptions terhitung on-the-fly│
├───┼──────────────────────────────────┼────────────────────────────────────────────────────────┤
│ 7 │ Longitudinal Auth Enforcement    │ Wali asing ditolak; Wali sah menerima trajectory 100%.│
└───┴──────────────────────────────────┴────────────────────────────────────────────────────────┘
```

---

*Status: **ACTIVE CONTRACT — LOCKED GOVERNANCE BOUNDARY APPROVED FOR MILESTONE 3.2 SQL IMPLEMENTATION**.*
