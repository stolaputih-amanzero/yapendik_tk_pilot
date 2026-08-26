# YAPENDIK SCHOOL OS — STAGE 2: CANONICAL SCHEMA RECONCILIATION & DATABASE MIGRATION PLAN
## Version 1.0 — Pre-Implementation Governance Baseline

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Document Type:** Schema Reconciliation & Migration Architecture Plan  
**Status:** **AWAITING GOVERNANCE APPROVAL — CODE/MIGRATION EXECUTION ON HOLD**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2, EIA v0.1 & STAGE 2 SPECIFICATION v1.1  
**Upstream Runtime Baseline:** V2.1.5 Definitive Production Baseline (🔒 **FROZEN**)  
**Audit Target:** `supabase_schema.sql`, `db_migrations/rls_migration_v2_1_5_hardened.sql`, `src/domain/types.ts`, `src/db/database.ts`

---

## LAYER 1: Canonical Schema Readiness Audit

Hasil audit menyeluruh terhadap skema aktual V2.1.5 dibandingkan dengan kebutuhan domain Stage 2:

| Entitas Domain | Skema Aktual V2.1.5 | Status Rekonsiliasi | Analisis Kesenjangan & Tindakan |
|---|---|:---:|---|
| **`School`** | Tabel `schools` (`id`, `npsn`, `name`, `level`, `sub_type`, `address`, `city`, `province`, `phone`, `email`, `headmaster_person_id`, `academic_year_active_id`, `created_at`) | 🟠 **EXISTS BUT NEEDS AMENDMENT** | Kolom `status` (`ACTIVE`/`ARCHIVED`) dan `operational_readiness` (`NOT_READY`/`READY`) belum ada di database fisik. Perlu penambahan kolom deklaratif non-breaking. |
| **`AcademicYear`** | Tabel `academic_years` (`id`, `school_id`, `name`, `semester`, `start_date`, `end_date`, `is_active`) | 🟢 **EXISTS & COMPATIBLE** | Kolom `semester` (`GANJIL`/`GENAP`) sudah mencakup temporal period untuk TK Pilot. |
| **`ClassRoom`** | Tabel `classes` (`id`, `school_id`, `academic_year_id`, `name`, `age_group`, `room_number`, `capacity`, `homeroom_teacher_id`, `co_teacher_id`, `is_active`) | 🟢 **EXISTS & COMPATIBLE** | Kapasitas rombel dan penugasan guru wali kelas sudah ada dan kompatibel. |
| **`Person`** | Tabel `persons` (`id`, `national_id_number`, `full_name`, `preferred_name`, `gender`, `birth_date`, `birth_place`, `phone`, `address`) | 🟢 **EXISTS & COMPATIBLE** | Identitas kanonikal manusia tunggal sudah terisolasi sempurna. |
| **`TeacherProfile`** | Tabel `teacher_profiles` (`id`, `person_id`, `school_id`, `nuptk`, `specialization`, `employment_type`, `join_date`, `is_active`) | 🟢 **EXISTS & COMPATIBLE** | Relasi penugasan guru ke unit sekolah sudah ada. |
| **`Student` & `Enrollment`** | Tabel `students` (`id`, `person_id`, `school_id`, `nisn`, `nis`, `current_class_id`, `blood_type`, `allergies`, `special_needs_notes`, `enrollment_date`, `status`) | 🟢 **EXISTS & COMPATIBLE** | Menyimpan relasi siswa, admisi ke sekolah, dan penempatan kelas (`current_class_id`). |
| **`GuardianRelationship`** | Tabel `guardian_relationships` (`id`, `student_person_id`, `guardian_person_id`, `relationship_type`, `is_primary_contact`, `is_legal_guardian`, `emergency_contact_priority`) | 🟢 **EXISTS & COMPATIBLE** | Relasi wali sah $\leftrightarrow$ anak sudah ada dan kompatibel. |
| **`AuditLog`** | Tabel `audit_logs` & RPC `rpc_log_client_event` | 🟢 **EXISTS & COMPATIBLE** | Jejak audit institusi sudah aktif dan terenkapsulasi via SECURITY DEFINER. |

> **Prinsip Utama Rekonsiliasi (Add Only What Is Missing):**  
> Tidak ada tabel kanonikal paralel ("onboarding database") yang dibuat. Penambahan skema **murni non-destructive** pada tabel `schools` yang sudah ada untuk mendukung lifecycle state machine.

---

## LAYER 2: Canonical Lifecycle Model

Pemisahan tegas dua dimensi ortogonal pada entitas `School`:

```text
                                CANONICAL SCHOOL
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
         LEGAL STATUS                              OPERATIONAL READINESS
         (Status Hukum)                             (Kesiapan Topologi)
                │                                             │
             ACTIVE                                       NOT_READY
             ARCHIVED                                         │
                                                              ▼ (Evaluasi 6 Gate)
                                                            READY
```

### Invariant Kontrak Status:
- `School.status = 'ACTIVE'` menyatakan keabsahan hukum legal (SK Yayasan & NPSN).
- `School.operational_readiness = 'NOT_READY'` menyatakan sekolah baru berdiri dan sedang melengkapi topologi.
- `School.operational_readiness = 'READY'` menyatakan bahwa 6 gate topologi telah terpenuhi 100%, membuka gerbang akses bagi runtime harian Stage 1.

---

## LAYER 3: Provisioning Transaction Model

Setiap aksi provisioning dieksekusi secara atomik dengan pola baku:

```text
  1. Authenticate Actor & Extract Context
           ↓
  2. Evaluate Jurisdictional Authorization (Tier Matrix)
           ↓
  3. Validate Preconditions & Invariants (Fail-Closed)
           ↓
  4. Execute Atomic Database Mutation
           ↓
  5. Emit Immutable Audit Event (WHO -> DID WHAT -> TO CONTEXT -> RESULT)
           ↓
  6. Re-evaluate School Readiness Projection & Return Canonical Result
```

### Daftar Governed Domain Commands:
1. `CREATE_SCHOOL` (Yayasan Superadmin)
2. `ASSIGN_HEADMASTER` (Yayasan Superadmin)
3. `INITIALIZE_ACADEMIC_YEAR` (Yayasan Superadmin)
4. `CONFIGURE_ACADEMIC_PERIOD` (Kepala Sekolah)
5. `CREATE_CLASSROOM` (Kepala Sekolah)
6. `ASSIGN_HOMEROOM_TEACHER` (Kepala Sekolah)
7. `ADMIT_STUDENT` (Kepala Sekolah)
8. `PLACE_STUDENT_IN_CLASS` (Kepala Sekolah)
9. `EVALUATE_OPERATIONAL_READINESS` (Kepala Sekolah / Superadmin)

---

## LAYER 4: Deterministic Readiness Engine

Mesin evaluasi kesiapan operasional (`ReadinessEngine`) diimplementasikan sebagai domain service deterministik murni:

```typescript
export interface ReadinessEvaluationResult {
  schoolId: string;
  status: 'READY' | 'NOT_READY';
  gates: {
    gate1_legalActive: boolean;
    gate2_academicYearActive: boolean;
    gate3_academicPeriodActive: boolean;
    gate4_headmasterAssigned: boolean;
    gate5_classroomStaffed: boolean;
    gate6_studentsPlaced: boolean;
  };
  blockers: string[];
  evaluatedAt: string;
}
```

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ DETERMINISTIC READINESS GATES                                                          │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ Gate 1: School.status === 'ACTIVE'                                                     │
│ Gate 2: Count(AcademicYear WHERE school_id = :id AND is_active = true) === 1           │
│ Gate 3: Count(AcademicYear WHERE school_id = :id AND semester IS NOT NULL) === 1       │
│ Gate 4: School.headmaster_person_id IS NOT NULL                                        │
│ Gate 5: Count(Class WHERE school_id = :id AND homeroom_teacher_id IS NOT NULL) >= 1    │
│ Gate 6: Count(Student WHERE school_id = :id AND current_class_id IS NOT NULL) >= 1     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

Jika seluruh 6 gate bernilai `true` $\rightarrow$ `status = 'READY'`. Jika salah satu `false` $\rightarrow$ `status = 'NOT_READY'` dan daftar `blockers` dihasilkan secara spesifik untuk panduan perbaikan pimpinan sekolah.

---

## LAYER 5: RLS & Authorization Matrix

Penegakan batas keamanan dilakukan di level server & database (RLS), bukan sekadar penyembunyian tombol UI (*Fail-Closed Boundary*):

| Governed Command | Superadmin | Headmaster | Teacher | Guardian | Server/DB Security Constraint |
|---|:---:|:---:|:---:|:---:|---|
| **`CREATE_SCHOOL`** | 🟢 ALLOW | 🔴 DENY | 🔴 DENY | 🔴 DENY | `auth_is_yayasan() = true` |
| **`ASSIGN_HEADMASTER`** | 🟢 ALLOW | 🔴 DENY | 🔴 DENY | 🔴 DENY | `auth_is_yayasan() = true` |
| **`INITIALIZE_ACADEMIC_YEAR`** | 🟢 ALLOW | 🔴 DENY | 🔴 DENY | 🔴 DENY | `auth_is_yayasan() = true` |
| **`CONFIGURE_ACADEMIC_PERIOD`** | 🔴 DENY | 🟢 ALLOW | 🔴 DENY | 🔴 DENY | `auth_is_headmaster(school_id)` |
| **`CREATE_CLASSROOM`** | 🔴 DENY | 🟢 ALLOW | 🔴 DENY | 🔴 DENY | `auth_is_headmaster(school_id)` |
| **`ASSIGN_HOMEROOM_TEACHER`** | 🔴 DENY | 🟢 ALLOW | 🔴 DENY | 🔴 DENY | `auth_is_headmaster(school_id)` |
| **`ADMIT_STUDENT`** | 🔴 DENY | 🟢 ALLOW | 🔴 DENY | 🔴 DENY | `auth_is_headmaster(school_id)` |
| **`PLACE_STUDENT_IN_CLASS`** | 🔴 DENY | 🟢 ALLOW | 🔴 DENY | 🔴 DENY | `auth_is_headmaster(school_id)` |
| **`EVALUATE_READINESS`** | 🟢 ALLOW | 🟢 ALLOW | 🔴 DENY | 🔴 DENY | `auth_is_headmaster(school_id) OR auth_is_yayasan()` |

---

## LAYER 6: Database Migration Sequence

Rencana migrasi SQL deklaratif, berurutan, dan idempotent:

```text
M01: Add Lifecycle Status Primitives to School Table
     ALTER TABLE schools ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'ACTIVE' 
       CHECK (status IN ('ACTIVE', 'ARCHIVED'));
     ALTER TABLE schools ADD COLUMN IF NOT EXISTS operational_readiness TEXT DEFAULT 'NOT_READY' 
       CHECK (operational_readiness IN ('NOT_READY', 'READY'));

M02: Synchronize Seed/Existing Schools to READY Baseline
     UPDATE schools SET status = 'ACTIVE', operational_readiness = 'READY' 
       WHERE id IN ('sch_tk_yapendik_01', 'sch_tk_yapendik_02');

M03: Governed Onboarding RPCs (Creation, Assignment, Admission, Placement)
     - rpc_create_school(...)
     - rpc_assign_headmaster(...)
     - rpc_create_classroom(...)
     - rpc_admit_and_place_student(...)
     - rpc_evaluate_school_readiness(...)

M04: RLS Policies for School Provisioning & Readiness Evaluation
     - Enforce Yayasan-only access on school establishment
     - Enforce Headmaster-only access on class & student admission in active school context
```

---

## LAYER 7: UAT-07 s.d. UAT-14 Acceptance Contract

UAT bukan pengujian tambahan setelah rilis, melainkan **kontrak penerimaan implementasi (Acceptance Contract)**:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2 ACCEPTANCE CONTRACT SUITE                                                      │
├─────────┬───────────────────────────────┬──────────────────────┬───────────────────────┤
│ Skenario│ Aktor & Skenario              │ Command Teruji       │ Acceptance Criteria   │
├─────────┴───────────────────────────────┴──────────────────────┴───────────────────────┤
│ GROUP A: INSTITUTIONAL BIRTH                                                           │
├─────────┬───────────────────────────────┬──────────────────────┬───────────────────────┤
│ UAT-07  │ Superadmin Yayasan            │ `CREATE_SCHOOL`      │ Unit TK 03 Rawamangun │
│         │ (Dr. Andreas Hendrawan)       │                      │ dibuat (NOT_READY)    │
├─────────┼───────────────────────────────┼──────────────────────┼───────────────────────┤
│ UAT-08  │ Superadmin Yayasan            │ `ASSIGN_HEADMASTER`  │ SK Pengangkatan Kepsek│
│         │ (Dr. Andreas Hendrawan)       │                      │ terikat ke TK 03      │
├─────────┴───────────────────────────────┴──────────────────────┴───────────────────────┤
│ GROUP B: SCHOOL PROVISIONING                                                           │
├─────────┬───────────────────────────────┬──────────────────────┬───────────────────────┤
│ UAT-09  │ Superadmin & Kepsek TK 03     │ `INIT_ACADEMIC_YEAR` │ T.A. 2026/2027 &      │
│         │                               │                      │ Semester Ganjil aktif │
├─────────┼───────────────────────────────┼──────────────────────┼───────────────────────┤
│ UAT-10  │ Kepala Sekolah TK 03          │ `CREATE_CLASSROOM` & │ Rombel terbentuk &    │
│         │                               │ `ASSIGN_TEACHER`     │ Guru ditugaskan       │
├─────────┼───────────────────────────────┼──────────────────────┼───────────────────────┤
│ UAT-11  │ Kepala Sekolah TK 03          │ `ADMIT_STUDENT`      │ Data anak & wali sah  │
│         │                               │                      │ tersimpan kanonikal   │
├─────────┼───────────────────────────────┼──────────────────────┼───────────────────────┤
│ UAT-12  │ Kepala Sekolah TK 03          │ `PLACE_STUDENT`      │ Siswa masuk rombel &  │
│         │                               │                      │ validasi kapasitas OK │
├─────────┼───────────────────────────────┼──────────────────────┼───────────────────────┤
│ UAT-13  │ Kepala Sekolah TK 03          │ `EVALUATE_READINESS` │ 6/6 Gate PASS         │
│         │                               │                      │ status -> 'READY'     │
├─────────┴───────────────────────────────┴──────────────────────┴───────────────────────┤
│ GROUP C: REALITY BRIDGE & STAGE 2 EXIT GATE                                            │
├─────────┬───────────────────────────────┬──────────────────────┬───────────────────────┤
│ UAT-14  │ Guru & Orang Tua TK 03 Baru   │ FIRST-DAY RUNTIME    │ Login, presensi,      │
│         │ (Pendidik & Wali Siswa Baru)  │ FLOW (Stage 1 Bridge)│ observasi, draf LPPA  │
│         │                               │                      │ ZERO DB INTERVENTION  │
└─────────┴───────────────────────────────┴──────────────────────┴───────────────────────┘
```

> **Kontrak Kelulusan Tahap (Stage 2 Exit Gate):**  
> Stage 2 hanya dinyatakan selesai apabila **UAT-14 (The Bridge Test)** berhasil membuktikan bahwa sekolah baru yang dibuat dari ketiadaan dapat langsung digunakan oleh guru dan orang tua pada modul harian Stage 1 **tanpa satu pun intervensi pengembang/database**.

---

```text
========================================================================================
    RECONCILIATION & MIGRATION PLAN COMPLETE — AWAITING FORMAL GOVERNANCE APPROVAL
========================================================================================
```
