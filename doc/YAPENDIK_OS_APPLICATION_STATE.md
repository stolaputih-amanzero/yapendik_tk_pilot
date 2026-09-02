Listed directory yapendik-tk-pilot
Listed directory doc
Listed directory MASTER
Listed directory db_migrations
Listed directory scripts
Listed directory components
Listed directory workspaces
Listed directory teacher
Listed directory db
Listed directory tests
Listed directory e2e
Viewed rules.md:1-342
Viewed 01-YAPENDIK%20OPERATING%20SYSTEM%20CONSTITUTION.md:1-120
Searched for "Educator Decides"
Searched for "Evidence Before"
Viewed STAGE_4_POST_MILESTONE_ARCHITECTURE_REVIEW_v1.0.md:1-100
Viewed STAGE_4_POST_MILESTONE_ARCHITECTURE_REVIEW_v1.0.md:101-171
Viewed STAGE_4_4_FINAL_CLOSURE_AND_ARCHITECTURE_CERTIFICATION_v1.0.md:1-105
Viewed STAGE_4_5_GATE_0_1_LEARN_SEMANTIC_AND_BOUNDARY_CLOSURE_v1.0.md:1-100
Viewed STAGE_4_5_GATE_1_TECHNICAL_ARCHITECTURE_AND_ENFORCEMENT_DESIGN_v1.0.md:1-100
Viewed rls_migration_v2_1_5_hardened.sql:1-100
Searched for "CREATE TRIGGER"
Viewed m05_temporal_lineage_and_protection_triggers.sql:1-100
Viewed m05_temporal_lineage_and_protection_triggers.sql:101-250
Viewed m06_governed_lifecycle_rpcs_and_telemetry.sql:1-100
Searched for "CREATE OR REPLACE FUNCTION"
Searched for "FUNCTION public."
Searched for "CREATE OR REPLACE FUNCTION"
Searched for "CREATE OR REPLACE FUNCTION"
Viewed m06_governed_lifecycle_rpcs_and_telemetry.sql:101-300
Viewed m06_governed_lifecycle_rpcs_and_telemetry.sql:301-550
Viewed m06_governed_lifecycle_rpcs_and_telemetry.sql:551-750
Viewed m04_fail_closed_rls_policies.sql:1-80
Viewed runtime_security.test.ts:1-60
Viewed sql_schema_contract.test.ts:1-60
Viewed security_regression.test.ts:1-60
Searched for "TEST SUITE"
Viewed security_regression.test.ts:50-200
Viewed security_regression.test.ts:201-335
Viewed context.tsx:1-100
Viewed database.ts:1-110
Viewed database.ts:170-220
Searched for "purgeAllSessionCache"
Searched for "purge"
Searched for "purgeAllSessionCache"
Viewed database.ts:500-560
Viewed database.ts:470-500
Viewed database.ts:440-470
Searched for "sha-256"
Searched for "checksum"
Searched for "publish"
Viewed lppaReportingService.ts:1-80
Searched for "publishLppaReport"
Viewed lppaReportingService.ts:300-450
Viewed lppaReportingService.ts:500-641
Viewed App.tsx:1-100
Viewed TopBar.tsx:1-60
Viewed tsconfig.json:1-27
Viewed vite.config.ts:1-24
Viewed .env.example:1-26
Viewed STAGE_3_TECHNICAL_AND_GOVERNANCE_SPECIFICATION_v1.0.md:1-100
Viewed STAGE_4_1_TEACHER_DAILY_OPERATING_MODEL_v1.0.md:1-100
Viewed STAGE_4_2_LPPA_SYNTHESIS_AND_REPORTING_SPECIFICATION_v1.0.md:1-60
Viewed STAGE_4_3_A_CHILD_CONTINUITY_DOMAIN_AND_GOVERNANCE_CONTRACT_v1.0.md:1-70
Viewed STAGE_4_4_A_SCHOOL_SAFETY_AND_ASSURANCE_DOMAIN_AND_GOVERNANCE_CONTRACT_v1.0.md:1-60

# YAPENDIK OS APPLICATION STATE DOCUMENT
## Generated: 2026-08-26T17:08:00+07:00
## Baseline Version: V2.1.5 Definitive Production Baseline + Stage 3 & Stage 4.1–4.4 Certified Substrate

---

### Executive Summary

**Yapendik School OS** telah bertransformasi dari sekadar aplikasi pencatatan operasional sekolah menjadi **Sistem Operasi Tata Kelola Kelembagaan Multi-Unit (School Operating Model)** yang utuh untuk Yayasan Pendidikan GPIB (Yapendik). Sistem beroperasi di bawah fondasi ganda: **FROZEN Production Baseline (V2.1.5)** yang mengunci model entitas kanonikal, autentikasi berbasis identitas manusia (*Human-First*), isolasi multi-tenant antar unit TK, dan RLS *fail-closed*, serta **LIVING Baseline** yang telah menyelesaikan siklus nilai pedagogis dan tata kelola: **GOVERNANCE (Stage 3)**, **CAPTURE (Stage 4.1)**, **TRUST (Stage 4.2)**, **CONTINUE (Stage 4.3)**, dan **ASSURE (Stage 4.4)**. Seluruh kontrak didukung oleh verifikasi otomatis **234/234 checks (100% pass across 8 master test suites)** dengan *zero type errors* dan *clean production bundle*. Saat ini sistem berada pada status **Gate 2 Sealed / Gate 2.1 Unlocked** menuju implementasi tipe dan tes kontrak **Institutional Learning & Multi-School Governance Loop (Stage 4.5-B)**.

---

### Architecture Overview

```text
═════════════════════════════════════════════════════════════════════════════════════════════
                       YAPENDIK SCHOOL OS MULTI-TIER ARCHITECTURE MAP
═════════════════════════════════════════════════════════════════════════════════════════════

 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │ FOUNDATION CONTEXT (Stage 4.5: Institutional Learning & Multi-School Stewardship)       │
 │ • Pure Derived Projections (FB-02) • Zero Individual Exposure (FB-01)                   │
 │ • Kmin = 5 Cohort Suppression (FB-07) • Anti-Differencing Protection Engine             │
 │ • Analytical Pattern ──► Institutional Insight ──► Board Decision Record                │
 │ • Canonical action_id Root Anchor (H-06) ──► Support Initiatives / Governance Directives│
 └────────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │ READ-ONLY PROJECTIONS (FB-06: NO MUTATION)
                                              ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │ SCHOOL CONTEXT (Stage 3 & 4.4: Autonomous Unit Leadership & Operational Assurance)      │
 │ • Academic Period State Machine (PLANNED ──► ACTIVE ──► CLOSING ──► CLOSED ──► ARCHIVED)│
 │ • Option A Gate (100% LPPA Reconciled before Semester Close) • Closed Semester Guard    │
 │ • Headmaster Assurance Hub (HD-01 s.d. HD-08) • Handover Reconciliation Integrity       │
 │ • 5-Stage Audited Safety Incident Lifecycle (DETECTED ──► TRIAGED ──► CONTAINED ...)    │
 └────────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                                              ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │ CLASSROOM & TEACHER CONTEXT (Stage 4.1, 4.2, 4.3: Daily Pedagogical Flow)               │
 │ • Unified Teacher Home: 8 Ritme Kerja Guru (Prepare ──► Welcome ──► ... ──► Synthesize)│
 │ • Formative Observations ──► LPPA Authentic Synthesis (Kurikulum Merdeka 4 Elements)    │
 │ • SHA-256 Canonical Checksum • Child Longitudinal Continuity Profile (System Proposes) │
 │ • Offline Sync Queue & Auto-Drain • Invariant C-11 Confidential Staff Quarantine        │
 └────────────────────────────────────────────┬────────────────────────────────────────────┘
                                              │
                                              ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────────┐
 │ SECURITY, IDENTITY & STORAGE ENGINE (V2.1.5 FROZEN SUBSTRATE)                           │
 │ • Human-First Identity: Person != UserAccount != StudentProfile != TeacherProfile       │
 │ • Contextual Authorization: SecurityContext = (User × Person × Role × School × Classes) │
 │ • Dual-Boundary RLS (15 Tables) • SECURITY DEFINER RPCs (search_path = public)          │
 │ • Storage Isolation: yapendik_os_v2_u_{userId}_s_{schoolId}_{table} + Instant Purge     │
 └─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Frozen Baseline Components

Komponen-komponen berikut berstatus **🔒 FROZEN BASELINE (V2.1.5 / Stage 3 Locked)** dan dilarang dimutasi tanpa *Architectural Decision Record (ADR)* dan *Change Control* formal ([`rules.md:L62-L76`](file:///d:/PROJECT/yapendik-tk-pilot/rules.md#L62-L76)):

| Komponen Frozen | Lokasi File / Implementasi | Batas & Aturan Kunci |
|---|---|---|
| **Canonical Entity Model** | [`src/domain/types.ts:L37-L150`](file:///d:/PROJECT/yapendik-tk-pilot/src/domain/types.ts#L37-L150) | `Person`, `StudentProfile`, `TeacherProfile`, `GuardianRelationship` terpisah secara ontologis. |
| **Authentication Pipeline** | [`src/auth/context.tsx:L1-L150`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/context.tsx#L1-L150) | Resolusi identitas dinamis: `Supabase Auth -> get_auth_person_id() -> persons -> profiles`. |
| **Contextual Authorization** | [`src/auth/authorization.ts:L61-L207`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/authorization.ts#L61-L207) | 6 Discrete Roles dievaluasi terhadap `SecurityContext` lengkap; dilarang berasumsi single role flag. |
| **Multi-School Isolation** | [`src/auth/authorization.ts:L66-L74`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/authorization.ts#L66-L74) | Batas keras tenant: `sch_tk_yapendik_01` vs `sch_tk_yapendik_02`. Ditolak *fail-closed* (`DENY_CROSS_SCHOOL`). |
| **Hardened RLS Policies** | [`db_migrations/rls_migration_v2_1_5_hardened.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_migration_v2_1_5_hardened.sql), [`db_migrations/m04_fail_closed_rls_policies.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/m04_fail_closed_rls_policies.sql) | RLS aktif pada seluruh 15 tabel; nol kebijakan `USING (true)` pada data privat. |
| **Database Triggers** | [`db_migrations/m05_temporal_lineage_and_protection_triggers.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/m05_temporal_lineage_and_protection_triggers.sql) | `trg_student_placement_guard`, `trg_guard_closed_semester_*`, `fn_guard_placement_terminalization`. |
| **Audit Logging Engine** | [`db_migrations/rls_migration_v2_1_5_hardened.sql:L34-L60`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_migration_v2_1_5_hardened.sql#L34-L60) | Internal `fn_write_audit_log` + Public RPC `rpc_log_client_event`. DML langsung ke `audit_logs` diblokir. |
| **Attendance Determinism** | [`src/db/database.ts:L248-L287`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts#L248-L287) | Format ID kanonikal `att_{schoolId}_{classId}_{studentId}_{date}` dengan upsert idempotent. |
| **Session Cache Scoping** | [`src/db/database.ts:L457-L459`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts#L457-L459) | Key: `yapendik_os_v2_u_{userId}_s_{schoolId}_{table}` + `purgeAllSessionCache()` saat logout. |
| **Option A Academic Gate** | [`db_migrations/m06_governed_lifecycle_rpcs_and_telemetry.sql:L70-L100`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/m06_governed_lifecycle_rpcs_and_telemetry.sql#L70-L100) | Penutupan semester mewajibkan 100% siswa aktif memiliki rapor LPPA berstatus `APPROVED`/`PUBLISHED`. |

---

### Living Governance Components

Area-area berikut berstatus **🌱 LIVING GOVERNANCE** dan dapat berevolusi secara terstruktur melalui dokumen Master Specs dan Gate Checkpoints:

1. **Yapendik OS Constitution**: Konstitusi induk institusional yang memandu filosofi, batas etika, dan arah sistem ([`doc/MASTER/01-YAPENDIK OPERATING SYSTEM CONSTITUTION.md`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/01-YAPENDIK%20OPERATING%20SYSTEM%20CONSTITUTION.md)).
2. **Pedagogical Stimulation Library (Stage 4.3)**: Variasi provokasi main sentra (Sentra Balok, Bahan Alam, Main Peran, dsb.).
3. **Reflective Narrative Templates (Stage 4.2)**: Panduan tata bahasa sintesis LPPA Kurikulum Merdeka PAUD.
4. **Safety & Exception Policies (Stage 4.4)**: Kebijakan ambang batas demam ($37.8^\circ\text{C}$) dan absensi kronis ($10\%$) yang dapat dikonfigurasi per unit sekolah via `AttendanceRiskPolicy`.
5. **Multi-School Institutional Learning (Stage 4.5)**: Domain baru untuk tata kelola agregat Yayasan (*Analytical Patterns*, *Insights*, *Decisions*, *Institutional Actions*, *Adoption*, *Outcomes*).
6. **Living UI Micro-Refinements**: Peningkatan ergonomi antarmuka berlandaskan `doc/MASTER/YAPENDIK_SCHOOL_OS_UI_UX_DESIGN_FOUNDATION_v1.0.md`.

---

### Empat Batas Tata Kelola Absolut (Core Architectural Invariants)

Berdasarkan [`doc/MASTER/STAGE_4_POST_MILESTONE_ARCHITECTURE_REVIEW_v1.0.md:L53-L58`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/STAGE_4_POST_MILESTONE_ARCHITECTURE_REVIEW_v1.0.md#L53-L58):

1. **Boundary 1: Evidence Before Interpretation**  
   *Tidak ada narasi evaluasi perkembangan atau usulan stimulasi yang dapat dibuat tanpa adanya jangkar bukti empiris otentik (catatan anekdot, foto hasil karya, observasi indikator).*
2. **Boundary 2: System Proposes — Educator Decides**  
   *Sistem berstatus penasihat non-otoritatif (`StimulationRecommendation`). Pendidik/Kepala Sekolah memegang wewenang mutlak atas aktivasi rencana, asesmen, dan keputusan kelas.*
3. **Boundary 3: Guardian Contributes Context — School Owns Assessment**  
   *Umpan balik kemitraan keluarga memperkaya pemahaman pendampingan di rumah (`Home Reflection`), namun secara matematis dan prosedural dilarang memutasi rating rapor/asesmen resmi sekolah.*
4. **Boundary 4: Immutable Historical Baseline**  
   *Rekor akademik masa lalu terkunci secara permanen (`CANNOT_MUTATE_CLOSED_SEMESTER`). Semester baru hanya mereferensikan arsip lampau tanpa memodifikasi dokumen lama.*

---

### Stage Implementation Matrix

| Stage | Domain / Milestone | Status | Key Components & Enforcements | Verification Status |
|---|---|---|---|---|
| **Stage 1** | Runtime Baseline & Identity | 🔒 **FROZEN** | Supabase Auth, Person/User mapping, Scoped Cache, Role simulation. | 🟢 **20/20 PASS** (Suite 1) |
| **Stage 2** | Governed Provisioning & Multi-Tenant | 🔒 **FROZEN** | M01–M04 SQL migrations, fail-closed RLS, `schools`, `classes`, `academic_years`. | 🟢 **8/8 PASS** (Suite 2) |
| **Stage 3** | Governance & Temporal Lifecycle | 🔒 **FROZEN** | M05–M06 SQL, Option A Academic Gate, `student_placement_records`, `rpc_close_academic_semester`, `rpc_promote_classroom_cohort`, `fn_derive_school_health_telemetry`. | 🟢 **35/35 PASS** (Suite 3) |
| **Stage 4.1** | Daily Operational Memory (CAPTURE) | 🟢 **CERTIFIED** | 8 Ritme Kerja Guru, Unified Teacher Home (`TodaySurface`, `LearningSurface`, `StudentRosterSurface`), Offline Sync Queue & Auto-Drain. | 🟢 **56/56 PASS** (Suites 4 & 5) |
| **Stage 4.2** | Canonical Official Record (TRUST) | 🟢 **CERTIFIED** | Authentic LPPA Synthesis, 4 Elemen Kurikulum Merdeka PAUD, Evidence-Grounded Proposer, SHA-256 Checksum, Headmaster Approval Gate. | 🟢 **36/36 PASS** (Suite 6) |
| **Stage 4.3** | Continuity Intelligence (CONTINUE) | 🟢 **CERTIFIED** | `ChildContinuityProfile` (Derived read-model), Multi-Semester Trajectory Arcs, Stimulation Plans (`PROPOSED` $\rightarrow$ `ACTIVE` $\rightarrow$ `COMPLETED`), Scoped Guardian Bridge. | 🟢 **41/41 PASS** (Suite 7) |
| **Stage 4.4** | School Safety Assurance (ASSURE) | 🟢 **CERTIFIED** | 4-Tier Safety Taxonomy, `ASSURANCE-INV-01` (No silent clearance), Non-Diagnostic Signals, 5-State Audited Incident Lifecycle (`DETECTED` $\dots$ `AUDITED_CLOSED`), Headmaster Assurance Hub. | 🟢 **38/38 PASS** (Suite 8) |
| **Stage 4.5** | Multi-Unit Institutional Learning (LEARN) | 🟡 **IN PROGRESS (4.5-B UNLOCKED)** | Gate 0.1, Gate 1, Gate 2 (4.5-A Sealed). 6 Entities (`DerivedAnalyticalPattern`, `InstitutionalInsight`, etc.), 6 Hardenings (H-01..H-06), 7 Invariants (FB-01..FB-07), Kmin=5, Anti-Differencing. | ⏳ **Test Suites 09–16 Planned** |

---

### Test Coverage Summary

Eksekusi master pipeline ([`tests/run_all_tests.ts`](file:///d:/PROJECT/yapendik-tk-pilot/tests/run_all_tests.ts)):

```text
════════════════════════════════════════════════════════════════════════════════
📋 MASTER TEST SUITE PIPELINE SCORECARD (234 / 234 CHECKS PASS — 100%)
════════════════════════════════════════════════════════════════════════════════
▶️ [1/8] Suite 1: Runtime Behavioral & Auth Security Suite          20/20 PASS
▶️ [2/8] Suite 2: SQL Schema & V2.1.5 RLS Contract Suite             8/8   PASS
▶️ [3/8] Suite 3: Stage 3.4 Application Services Suite              35/35 PASS
▶️ [4/8] Suite 4: Stage 4.1 Teacher Daily Work Suite                30/30 PASS
▶️ [5/8] Suite 5: Stage 4.1 Full E2E Persona Loop Suite             26/26 PASS
▶️ [6/8] Suite 6: Stage 4.2 LPPA Synthesis & Reporting Suite        36/36 PASS
▶️ [7/8] Suite 7: Stage 4.3 Child Continuity & Learning Loop        41/41 PASS
▶️ [8/8] Suite 8: Stage 4.4 School Safety & Operational Assurance   38/38 PASS
────────────────────────────────────────────────────────────────────────────────
🏁 TOTAL CHECKS PASSED:                                             234 / 234 (100%)
⚖️ STATIC TYPECHECK (tsc --noEmit):                                  0 ERRORS (CLEAN)
📦 PRODUCTION BUILD (vite build):                                   CLEAN (dist/)
```

#### Tiga Tingkatan Verifikasi (*Verification Tiers*):
1. **Tier 1: Static Contract Tests**: Memverifikasi AST skema SQL, integritas DDL, pendaftaran trigger, dan ketiadaan bypass RLS permisif ([`tests/sql_schema_contract.test.ts`](file:///d:/PROJECT/yapendik-tk-pilot/tests/sql_schema_contract.test.ts)).
2. **Tier 2: Runtime Behavioral Tests**: Mensimulasikan alur komprehensif, evaluasi otorisasi multi-role, state machine rapor & insiden, isolasi cache, dan logika offline queue dalam memori runtime ([`tests/runtime_security.test.ts`](file:///d:/PROJECT/yapendik-tk-pilot/tests/runtime_security.test.ts), Suites 3–8).
3. **Tier 3: Live PostgreSQL Tests**: Menjalankan skrip validasi DDL/RLS langsung terhadap instance PostgreSQL/Supabase riil ([`db_migrations/rls_security_tests_v2_1_5.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_security_tests_v2_1_5.sql), [`scripts/run_stage3_3_uat_suite.mjs`](file:///d:/PROJECT/yapendik-tk-pilot/scripts/run_stage3_3_uat_suite.mjs), [`tests/e2e/`](file:///d:/PROJECT/yapendik-tk-pilot/tests/e2e)).

---

### Security & Privacy Invariants Checklist

| Invariant / Rule | Titik Penegakan (Enforcement Point) | Mekanisme Teknis | Status |
|---|---|---|---|
| **Invariant C-11 (Confidential Quarantine)** | Service Query Layer & Database DTOs | `isConfidentialToStaff = true` / `is_staff_confidential = true` disaring di server-side sebelum payload sampai ke client. 100% diblokir dari Portal Orang Tua, Proyeksi Kontinuitas, dan Sintesis LPPA. | 🟢 AKTIF |
| **Zero Permissive RLS** | PostgreSQL Database Engine | Seluruh tabel sensitif melarang `USING (true)` atau `WITH CHECK (true)` untuk operasi DML publik. | 🟢 AKTIF |
| **Non-Regression Security Rule** | `rules.md` & Pre-commit Gates | Segala penurunan batasan keamanan langsung memicu `GOVERNANCE STOP`. | 🟢 AKTIF |
| **Fail-Closed Contextual Auth** | [`src/auth/authorization.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/authorization.ts) | Akses default `granted: false`. Evaluasi wajib memvalidasi role, assigned classes, school jurisdiction, dan hubungan wali anak. | 🟢 AKTIF |
| **Search Path Security** | Seluruh RPC Functions | Wajib mendeklarasikan `SET search_path = public, pg_temp` untuk mencegah serangan schema injection. | 🟢 AKTIF |
| **Closed Semester Guard** | Database Trigger `fn_guard_closed_semester_mutations` | Memblokir operasi `INSERT`/`UPDATE`/`DELETE` pada semester berstatus `CLOSED` atau `ARCHIVED`. | 🟢 AKTIF |
| **Terminal Placement Immutability** | Database Trigger `fn_guard_placement_terminalization` | Memblokir perubahan placement yang telah berstatus `COMPLETED`, `PROMOTED`, atau `TRANSFERRED`. | 🟢 AKTIF |
| **Zero Individual Exposure (FB-01)** | Projection Engine & Redactor (Stage 4.5) | Menghapus NIK, NIS, nama siswa, dan riwayat kesehatan individual dari DTO Yayasan. | 🟢 DISAHKAN (4.5-A) |
| **Minimum Cohort Threshold (FB-07)** | Anti-Differencing Engine (Stage 4.5) | Ambang batas $K_{\min} = 5$. Jika kohor $< 5$, status `SUPPRESSED_SMALL_COHORT`. Jika selisih irisan $< 5$, status `SUPPRESSED_DIFFERENCING_RISK`. | 🟢 DISAHKAN (4.5-A) |
| **Foundation Mutation Hard Block (FB-06)** | RLS Policies & RPC Invoker Guards (Stage 4.5) | Peran Yayasan dilarang memutasi data kanonikal operasional sekolah. | 🟢 DISAHKAN (4.5-A) |

---

### Database Schema & Canonical Entities Map

#### 15 Tabel Kanonikal Berproteksi RLS:
1. `schools` — Profil unit sekolah (NPSN, status operasional, Kepala Sekolah).
2. `academic_years` — Tahun ajaran & semester (`PLANNED`, `ACTIVE`, `CLOSING`, `CLOSED`, `ARCHIVED`).
3. `classes` — Rombongan belajar (TK A, TK B, kapasitas, wali kelas).
4. `persons` — Entitas kanonikal manusia (NIK, nama lengkap, kontak).
5. `user_accounts` — Akun login sistem terikat ke `person_id` dan `role`.
6. `staff_profiles` — Profil pendidik/staf terikat ke unit sekolah.
7. `students` — Profil peserta didik terikat ke `person_id`, NIS, NISN, dan rombel aktif.
8. `guardian_relationships` — Hubungan legal orang tua/wali ke peserta didik.
9. `student_placement_records` — Rekor riwayat penempatan rombel peserta didik (*append-only placement lineage*).
10. `developmental_milestones` — Standar capaian Kurikulum Merdeka PAUD.
11. `learning_activities` — Rencana aktivitas bermain & tema sentra.
12. `observation_records` — Rekor bukti observasi harian pendidik (foto, anekdot, rating BB/MB/BSH/BSB).
13. `daily_attendance` — Presensi harian deterministik dengan suhu dan catatan serah terima.
14. `student_progress_reports` — Rapor LPPA semesteran (`DRAFT` $\rightarrow$ `READY_FOR_REVIEW` $\rightarrow$ `APPROVED` $\rightarrow$ `PUBLISHED`).
15. `audit_logs` — Buku besar jejak audit sistem (*append-only governance ledger*).

---

### Contextual Authority Matrix (6 Discrete Roles)

Didefinisikan di [`src/auth/authorization.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/authorization.ts) dan [`src/domain/types.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/domain/types.ts):

$$\text{SecurityContext} = (\text{User ID} \times \text{Person ID} \times \text{Role} \times \text{School ID} \times \text{Assigned Classes} \times \text{Guardian Children})$$

```text
┌─────────────────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┬──────────────┐
│ Kewenangan Operasional   │ SUPERADMIN   │ HEADMASTER   │ TEACHER      │ ASST_TEACHER │ STAFF        │ GUARDIAN     │
├─────────────────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┼──────────────┤
│ Observasi Kelas Sendiri │  LIHAT/AUDIT │  LIHAT/SUPER │  BUAT/EDIT   │  BUAT/CATAT  │     DENY     │     DENY     │
│ Observasi Kelas Lain    │  LIHAT/AUDIT │  LIHAT/SUPER │     DENY     │     DENY     │     DENY     │     DENY     │
│ Observasi Anak Sendiri  │  LIHAT/AUDIT │  LIHAT/SUPER │     DENY     │     DENY     │     DENY     │  LIHAT (Umum)│
│ Catatan C-11 Rahasia    │  LIHAT/AUDIT │  LIHAT/SUPER │  BUAT/LIHAT  │  BUAT/LIHAT  │     DENY     │     DENY     │
│ Presensi Harian         │  LIHAT/AUDIT │  SUPERVISI   │  CATAT/EDIT  │  CATAT/EDIT  │  CATAT OPER  │     LIHAT    │
│ Sintesis LPPA Draf      │     DENY     │  TINJAU DRAF │  SINTESIS    │     DENY     │     DENY     │     DENY     │
│ Pengesahan LPPA Rapor   │     DENY     │   MENGESAHKAN│     DENY     │     DENY     │     DENY     │     DENY     │
│ Publikasi ke Orang Tua  │     DENY     │   PUBLIKASI  │     DENY     │     DENY     │     DENY     │     DENY     │
│ Tutup Semester (Opt A)  │  SUPERVISI   │   EKSEKUSI   │     DENY     │     DENY     │     DENY     │     DENY     │
│ Mutasi Data Sekolah Lain│     DENY     │     DENY     │     DENY     │     DENY     │     DENY     │     DENY     │
│ Mutasi Kelas dr Yayasan │  DENY (FB-06)│     N/A      │     N/A      │     N/A      │     N/A      │     N/A      │
└─────────────────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┴──────────────┘
```

---

### Technical Debt & Deferred Backlog

Item-item berikut telah didokumentasikan secara transparan dalam [`doc/MASTER/STAGE_4_POST_MILESTONE_ARCHITECTURE_REVIEW_v1.0.md:L105-L121`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/STAGE_4_POST_MILESTONE_ARCHITECTURE_REVIEW_v1.0.md#L105-L121) sebagai *deferred engineering backlog* yang tidak memblokir operasional TK Pilot:

| Item Backlog | Prioritas | Domain & Deskripsi | Rencana Penanganan |
|---|---|---|---|
| **PgBouncer & Read-Replicas** | P2 (Scale) | Infrastruktur connection pooling PostgreSQL untuk skala puluhan unit sekolah. | Fase Scaling Multi-Unit. |
| **Migration Down-Scripts** | P2 (Ops) | Script rollback migrasi database otomatis per commit. | DevOps Automation Sprint. |
| **Digital Certificate Signatures** | P2 (Legal) | Integrasi sertifikat digital BSrE/PrivyID (saat ini menggunakan internal SHA-256 hash stamp). | Fase Sertifikasi Hukum Rapor. |
| **Server-Side Binary PDF** | P3 (Output) | Headless Chromium PDF renderer di server (saat ini menggunakan paged CSS media print preview engine). | Backend Worker Extension. |
| **Table Partitioning Multi-Year** | P3 (Scale) | Partisi tabel `daily_attendance` dan `observation_records` per tahun ajaran. | Skala $> 5$ tahun ajaran. |
| **CDN Image Compression** | P2 (Storage) | Kompresi otomatis dan thumbnailing foto observasi anak pada Supabase Storage. | Object Storage Pipeline. |
| **WhatsApp Webhook Notifications**| P2 (Bridge) | Notifikasi otomatis prompt stimulasi rumah via WhatsApp Business API. | Communication Service V2. |

---

### Known Constraints & Limitations

1. **Lingkup Jenjang Terkunci pada TK/PAUD**: Sistem saat ini murni dioptimasi untuk karakteristik PAUD (Kurikulum Merdeka PAUD, 4 elemen perkembangan, ritme bermain sentra). Dilarang melakukan *premature generalization* untuk jenjang SD/SMP/SMA tanpa spesifikasi domain terpisah ([`rules.md:L220-L224`](file:///d:/PROJECT/yapendik-tk-pilot/rules.md#L220-L224)).
2. **Single Active Academic Period Constraint**: Setiap unit sekolah hanya dapat memiliki tepat 1 periode akademik aktif pada suatu waktu (`uq_academic_years_single_active_per_school`).
3. **Capacity Utilization Hard Ceiling**: Kelas rombel memiliki batasan kapasitas (default 15–18 anak per kelas) yang divalidasi pada saat promosi kohor (`CAPACITY_EXCEEDED`).
4. **Proyeksi Read-Model Murni**: `ChildContinuityProfile`, `ClassroomHeatmapView`, `HeadmasterOperationalAssuranceSummary`, dan `DerivedAnalyticalPattern` tidak memiliki tabel penyimpanan terpisah, melainkan dikalkulasi secara deterministik saat diminta (*on-the-fly*).

---

### Integration Points & Dependencies Map

#### Dependencies Inti ([`package.json`](file:///d:/PROJECT/yapendik-tk-pilot/package.json)):
- **Frontend Core**: `react` (v19.0.1), `react-dom` (v19.0.1), `lucide-react` (v0.546.0), `motion` (v12.23.24).
- **Styling**: `tailwindcss` (v4.1.14), `@tailwindcss/vite` (v4.1.14).
- **Backend & Database**: `@supabase/supabase-js` (v2.112.3), `pg` (v8.23.0), `express` (v4.21.2).
- **AI Integration**: `@google/genai` (v2.4.0) untuk kapabilitas asisten reflektif opsional.
- **Build & Test Engine**: `vite` (v6.2.3), `typescript` (~5.8.2), `tsx` (v4.21.0), `@playwright/test` (v1.62.1).

#### Lingkungan & Konfigurasi Deployment:
- **Environment Variables**: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `DATABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` ([`.env.example`](file:///d:/PROJECT/yapendik-tk-pilot/.env.example)).
- **Unit Pilot Aktif**:
  - `sch_tk_yapendik_01` (TK Yapendik 01 Menteng — Unit Pilot Utama).
  - `sch_tk_yapendik_02` (TK Yapendik 02 Kebayoran — Unit Uji Multi-Tenant).

---

### Next Stage Readiness Assessment (Stage 4.5-B)

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║              STAGE 4.5 READINESS & GOVERNANCE GATEWAY                        ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Gate 0 / 0.1 (Semantic & Boundary Closure) : 🟢 SEALED & CERTIFIED          ║
║  Gate 1 (Technical Architecture Design)     : 🟢 SEALED & CERTIFIED          ║
║  Gate 2 (4.5-A Domain Model Contracts)      : 🟢 SEALED & CERTIFIED          ║
║  4.5-B (Type System & Contract Tests 09–16) : 🔓 UNLOCKED FOR IMPLEMENTATION  ║
║  4.5-C (Service Layer & Projections)        : 🔒 BLOCKED PENDING GATE 2.1    ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

**Kesiapan Implementasi**:
- Dokumen Kontrak Domain `STAGE_4_5_A_DOMAIN_MODEL_AND_INVARIANT_CONTRACTS_v1.0.md` telah memformalkan seluruh 6 Entitas Kanonikal, Value Objects, 6 Hardenings (H-01 s.d. H-06), dan 7 Invarian Yayasan (FB-01 s.d. FB-07).
- Rencana implementasi teknis `implementation_plan.md` telah disiapkan untuk membangun:
  1. `src/types/institutionalLearningTypes.ts`
  2. `src/domain/institutionalLearningValidators.ts`
  3. `tests/stage4_5_type_and_contract.test.ts` (Suites 09–16 mencakup kuadran *Valid*, *Invalid*, *Boundary*, dan *Adversarial*).

---

### Stage 6 Gate 1: Data Roster & Student Identity State

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║              STAGE 6 GATE 1: DATA ROSTER CERTIFIED STATE                     ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  Roster & Class Switching (TK A / TK B)     : 🟢 CERTIFIED & VERIFIED        ║
║  Student Photo Storage Engine (Supabase)    : 🟢 CERTIFIED & VERIFIED        ║
║  Parent / Guardian Fallback Relations       : 🟢 CERTIFIED & VERIFIED        ║
║  Cross-Class Directory Visibility (School)  : 🟢 CERTIFIED & VERIFIED        ║
║  Master Data Edit Restriction (Headmaster)  : 🟢 CERTIFIED & VERIFIED        ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

- **Dokumentasi Formal**: [`doc/MASTER/STAGE_6_GATE_1_DATA_ROSTER_CLOSURE_v1.0.md`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/STAGE_6_GATE_1_DATA_ROSTER_CLOSURE_v1.0.md)
- **Komponen Kunci**:
  - `src/pages/roster/DataRosterWorkspace.tsx`
  - `src/components/roster/StudentListItem.tsx` (Avatar 1 warna, Preview Dialog, Full Address, Guardian Links)
  - `src/components/roster/StudentPhotoUpload.tsx` (Kamera, Unggah, Reset Default)
  - `src/lib/queries/class-queries.ts` (Hybrid Cache-First, RPC photo update, Guardian fallback)
- **Migrasi Database**: `20260902040000` s.d. `20260902080000` (termasuk RPC `rpc_update_student_photo` & Storage Bucket `student-photos` public).

---

### Recommendations for AI Memory

Untuk memastikan AI Agent / Copilot mempertahankan pemahaman yang konsisten dan akurat pada interaksi mendatang:

1. **Jadikan [`rules.md`](file:///d:/PROJECT/yapendik-tk-pilot/rules.md) sebagai Hirarki Otoritas Utama**: AI adalah *Implementation Agent (Level 6)*, bukan *Architecture Authority*. Modifikasi pada area FROZEN wajib melalui ADR.
2. **Pertahankan Integritas 234 Existing Checks & Token Purity**: Setiap perubahan kode wajib lulus `pnpm run lint` (0 errors) dan `node scripts/token-purity.mjs` (0 violations).
3. **Patuhi Pemisahan Hak Akses Guru**: Guru memiliki hak baca (*Read*) direktori seluruh siswa satu sekolah di Data Roster (`auth_shares_school_with`), namun mutasi asesmen/presensi/LPPA terikat pada kelas tugas masing-masing (`DENY_CLASS_UNASSIGNED`).
4. **Patuhi Pemisahan Siklus Hidup H-01**: `InstitutionalActionRecord` adalah identity anchor (`action_id`). State machine operasional hidup di `SupportPayload` dan `DirectivePayload`, bukan di action root.
5. **Terapkan Penegakan Privasi FB-07 ($K_{\min} = 5$) & Anti-Differencing**: Jangan pernah menampilkan data agregat untuk kelompok $< 5$ anak atau kelompok dengan selisih irisan $< 5$ anak ke level Yayasan.
6. **Kunci Otoritas Sekolah (FB-03 & FB-06)**: Yayasan tidak memiliki hak mutasi kanonikal terhadap presensi, observasi, atau penilaian siswa di sekolah.
7. **Gunakan Kosakata Tata Kelola Baku**: `FROZEN`, `LIVING`, `VERIFIED`, `NOT VERIFIED`, `BLOCKED`, `GOVERNANCE STOP`.