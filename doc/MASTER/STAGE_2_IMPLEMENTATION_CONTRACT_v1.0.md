# YAPENDIK SCHOOL OS — STAGE 2: IMPLEMENTATION CONTRACT
## Version 1.0 — Canonical Engineering & Governance Guarantees

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Document Type:** Technical Implementation Contract  
**Status:** **ACTIVE CONTRACT — LOCKING ARCHITECTURAL GUARANTEES PRIOR TO SQL MIGRATION**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2, EIA v0.1 & STAGE 2 SPECIFICATION v1.1  
**Upstream Runtime Baseline:** V2.1.5 Definitive Production Baseline (🔒 **FROZEN**)  

---

## 1. Executive Summary & Contract Scope

Dokumen ini mengunci **5 Jaminan Keteknikan & Tata Kelola (5 Engineering & Governance Guarantees)** untuk eksekusi implementasi Stage 2. Seluruh migrasi SQL, RPC domain, dan antarmuka provisioning wajib mematuhi kontrak ini secara mutlak tanpa deviasi.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 2 IMPLEMENTATION CONTRACT PILLARS                         │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 1. Transaction Boundary ──► Multi-entity atomicity via ACID database transaction blocks│
│ 2. Idempotency & Keys   ──► Uniqueness constraints & replay protection on all commands │
│ 3. Concurrency Safety   ──► Read-committed snapshot isolation on topology evaluations  │
│ 4. Derived Readiness    ──► Readiness is 100% derived from topology, never client-set │
│ 5. Operational Semantics──► READY is the strict prerequisite contract for Stage 1      │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The 5 Locked Engineering Guarantees

### GUARANTEE A: Transaction Boundary & Multi-Entity Atomicity
Setiap perintah domain yang memodifikasi lebih dari satu entitas kanonikal **wajib dibungkus dalam satu blok transaksi database ACID (PostgreSQL Transaction / RPC)**:

1. **`ADMIT_STUDENT` Atomicity Contract:**
   - Transaksi mencakup pembuatan/pembaruan:
     $$\text{Person (Anak)} + \text{Student} + \text{Person (Wali)} + \text{GuardianRelationship} + \text{Enrollment} + \text{Audit Log}$$
   - **Invariant:** Jika pendaftaran wali gagal, pembuatan data anak **wajib di-rollback 100%** (*All-or-Nothing Guarantee*).
2. **`ASSIGN_HEADMASTER` Atomicity Contract:**
   - Transaksi mencakup pengangkatan identitas `Person` sebagai Kepala Sekolah pada entitas `School` dan pembaharuan konteks peran `HEADMASTER` terikat unit.
3. **`CREATE_CLASSROOM` & `ASSIGN_HOMEROOM_TEACHER` Atomicity Contract:**
   - Transaksi mencakup pembentukan rombel `classes`, penetapan kapasitas, dan pengikatan `homeroom_teacher_id` ke `teacher_profiles`.

---

### GUARANTEE B: Idempotency & Unique Invariants
Untuk mencegah duplikasi data akibat koneksi lambat, double-click, atau retry jaringan, setiap perintah dilindungi oleh **Uniqueness Constraints & Idempotency Rules**:

| Perintah Domain | Natural Idempotency Key / Constraint | Perilaku Saat Terjadi Duplikasi (Replay) |
|---|---|---|
| **`CREATE_SCHOOL`** | `UNIQUE (npsn)` | Melempar error `DUPLICATE_NPSN` (Fail-Closed). |
| **`INITIALIZE_ACADEMIC_YEAR`** | `UNIQUE (school_id, name)` | Melempar error `DUPLICATE_ACADEMIC_YEAR`. |
| **`CREATE_CLASSROOM`** | `UNIQUE (school_id, academic_year_id, name)` | Melempar error `DUPLICATE_CLASS_NAME`. |
| **`ASSIGN_HOMEROOM_TEACHER`** | `classes.id` (Single update) | Idempotent update pada kolom `homeroom_teacher_id`. |
| **`ADMIT_STUDENT`** | `UNIQUE (school_id, nis)` | Melempar error `DUPLICATE_STUDENT_NIS`. |
| **`PLACE_STUDENT_IN_CLASS`** | `students.id` (Single assignment) | Idempotent update pada kolom `current_class_id`. |
| **`GUARDIAN_BINDING`** | `UNIQUE (student_person_id, guardian_person_id)` | Idempotent upsert pada relasi wali sah. |

---

### GUARANTEE C: Concurrency Isolation & Snapshot Consistency
1. Evaluasi kesiapan operasional (`EVALUATE_OPERATIONAL_READINESS`) dijalankan pada tingkat isolasi transaksi **Read Committed** yang mengevaluasi kondisi tabel saat perintah dipanggil.
2. Penempatan siswa ke kelas (`PLACE_STUDENT_IN_CLASS`) memverifikasi kapasitas aktual rombel dengan klausa:
   $$\text{Current Student Count} < \text{Class Capacity}$$
   Mencegah *race condition* kelebihan kapasitas kelas pada admisi simultan.

---

### GUARANTEE D: Derived Readiness (No Direct Client Mutation)
`[DECISION]` **Status `READY` adalah Konsekuensi Matematis Topologi, Bukan Deklarasi Manual:**
1. Kolom `School.operational_readiness` **dilarang keras** dimutasi secara langsung oleh perintah `UPDATE` dari client.
2. Mutasi `operational_readiness: NOT_READY -> READY` **hanya dapat dilakukan oleh RPC `rpc_evaluate_school_readiness(p_school_id)`** setelah seluruh 6 Gate diverifikasi bernilai `true`:
   - *Gate 1:* `School.status === 'ACTIVE'`
   - *Gate 2:* Tepat 1 `AcademicYear` aktif di unit sekolah
   - *Gate 3:* Tepat 1 `AcademicPeriod` (Semester) terisi
   - *Gate 4:* `headmaster_person_id IS NOT NULL`
   - *Gate 5:* Minimal 1 `ClassRoom` aktif dengan Guru Wali Kelas terdaftar
   - *Gate 6:* Minimal 1 `Student` terdaftar sah dan ditempatkan pada kelas
3. Jika terdapat gate yang gagal, RPC mengembalikan `status: 'NOT_READY'` beserta daftar array `blockers` diagnostik.

---

### GUARANTEE E: Operational Semantics of `READY` vs `ACTIVE`
1. **`School.status: ACTIVE`** adalah status hukum legal unit sekolah (terdaftar sah di Yayasan).
2. **`School.operational_readiness: READY`** adalah status topologi operasional (seluruh rombel, guru, murid siap memulai pembelajaran).
3. Saat sebuah sekolah mencapai status `READY`:
   - Seluruh modul runtime Stage 1 (**Kerja Harian Sentra, Presensi, Observasi, Draf LPPA, Buku Penghubung**) **seketika terbuka penuh** bagi guru dan orang tua murid di sekolah tersebut.
   - Tidak diperlukan perlakuan khusus (*zero special casing*) pada modul Stage 1.

---

## 3. Implementation Sequence & Acceptance Protocol

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              STAGE 2 EXECUTION ROADMAP                                 │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [PHASE 1: SQL MIGRATIONS (M01 - M04)]                                                 │
│  • M01: Add status & operational_readiness columns to schools table                    │
│  • M02: Set baseline schools (TK 01 & TK 02) to ACTIVE & READY                         │
│  • M03: Deploy Governed RPCs (create_school, assign_headmaster, admit_student, etc.)   │
│  • M04: Deploy Fail-Closed RLS policies for provisioning tier                          │
│                                                                                        │
│  [PHASE 2: DOMAIN COMMANDS & CLIENT REPOSITORIES]                                      │
│  • Implement atomic TypeScript domain commands in src/db/database.ts                   │
│  • Implement deterministic ReadinessEngine in src/domain/readiness.ts                  │
│                                                                                        │
│  [PHASE 3: PROVISIONING USER INTERFACE]                                                │
│  • Superadmin Workspace: School Establishment & Headmaster Appointment                 │
│  • Headmaster Workspace: Class Topology, Teacher Assignment & Student Admission        │
│  • Readiness Diagnostic Widget with Live Gate Projections                              │
│                                                                                        │
│  [PHASE 4: STAGE 2 ACCEPTANCE SUITE (UAT-07 s.d. UAT-14)]                              │
│  • Group A: UAT-07 (Create School), UAT-08 (Assign Headmaster)                         │
│  • Group B: UAT-09 (Academic Year), UAT-10 (Class/Teacher),                            │
│             UAT-11 (Admission), UAT-12 (Placement), UAT-13 (Readiness PASS)            │
│  • Group C (STAGE 2 EXIT GATE): UAT-14 (First-Day Operational Journey - ZERO DB PATCH) │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

```text
========================================================================================
     STAGE 2 IMPLEMENTATION CONTRACT LOCKED — READY FOR MIGRATION M01 GENERATION
========================================================================================
```
