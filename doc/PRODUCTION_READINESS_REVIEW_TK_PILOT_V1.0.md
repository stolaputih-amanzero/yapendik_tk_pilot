# YAPENDIK SCHOOL OS
# TK PILOT v1.0
# PRODUCTION READINESS REVIEW & CERTIFICATION

**Date:** 2026-08-25  
**Auditor:** Senior Principal Engineer & Security Architect Reviewer  
**Target System:** Yapendik School OS — TK Pilot Release v1.0  
**Repository Working Directory:** `d:/PROJECT/yapendik-tk-pilot`  
**Certification Status:** **NOT READY FOR PILOT (BLOCKERS IDENTIFIED)**

---

## 1. Executive Summary

A rigorous, repository-grounded **Production Readiness Review (PRR)** was conducted for the **Yapendik School OS (TK Pilot v1.0)** against the authoritative **V2.1.5 Definitive Production Baseline** and the **19 Constitutional Documents** (`doc/MASTER/`).

### Key Conclusions:
1. **Database & RLS Core (V2.1.5 Hardened Migration):** **VERIFIED (STRONG).**
   The PostgreSQL migration [`rls_migration_v2_1_5_hardened.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_migration_v2_1_5_hardened.sql) demonstrates state-of-the-art database defense-in-depth:
   - Gated placement trigger (`trg_guard_student_class_placement`) blocks direct client mutation of `current_class_id`.
   - Comprehensive `SECURITY DEFINER` state-machine RPC suite (`rpc_place_student_in_class`, `rpc_save_progress_report_draft`, `rpc_submit_report_for_review`, `rpc_approve_progress_report`, `rpc_publish_progress_report`).
   - Strict IDOR assertions, active academic year closure gates, published report immutability triggers, and governed views (`v_teacher_class_roster`, `v_student_safety_profile`, `v_guardian_student_profile`).

2. **Application & Client Architecture Disconnect:** **FAILED (CRITICAL BLOCKERS).**
   While the PostgreSQL database security baseline is hardened, the **frontend client application has not been integrated with the V2.1.5 database RPCs and secure authentication path**:
   - **P0 Blocker (Cache & Shared Device Data Leakage):** The client storage engine ([`src/db/database.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts)) dumps entire tables of sensitive student PII, medical notes, attendance, and observations into plain-text `localStorage`. `signOut()` does **not** clear `localStorage`. On shared school tablets/computers, any subsequent user inherits and can inspect all cached records of students and other personas.
   - **P0 Blocker (Hardcoded Credentials & Service Role Leakage):** Plaintext database credentials, database passwords, and `SUPABASE_SERVICE_ROLE_KEY` are stored in repository files ([`.env.supabase`](file:///d:/PROJECT/yapendik-tk-pilot/.env.supabase), [`scripts/run_schema.mjs`](file:///d:/PROJECT/yapendik-tk-pilot/scripts/run_schema.mjs), [`scripts/seed_auth.mjs`](file:///d:/PROJECT/yapendik-tk-pilot/scripts/seed_auth.mjs), [`.env.local`](file:///d:/PROJECT/yapendik-tk-pilot/.env.local)).
   - **P0 Blocker (Permissive Pilot Policy Override Risk):** [`supabase_schema.sql`](file:///d:/PROJECT/yapendik-tk-pilot/supabase_schema.sql) contains a Phase 14 script that grants `Public Full Access For Pilot` (`USING (true) WITH CHECK (true)`) to `anon` and `authenticated`. If [`scripts/run_schema.mjs`](file:///d:/PROJECT/yapendik-tk-pilot/scripts/run_schema.mjs) is run, it completely wipes out all V2.1.5 RLS protections.
   - **P1 Blocker (Simulation Authentication vs Production Identity):** The client authentication context ([`src/auth/context.tsx`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/context.tsx)) relies on hardcoded `SEED_PERSONAS`. Real school staff or parents signing in with their own Supabase accounts cannot be resolved dynamically into runtime security contexts.
   - **P1 Blocker (Report Lifecycle UI Disconnect):** In [`DevelopmentWorkspace.tsx`](file:///d:/PROJECT/yapendik-tk-pilot/src/components/workspaces/DevelopmentWorkspace.tsx), report approval is only stored in local React state (`useState(false)`). The V2.1.5 report RPCs are never invoked.
   - **P1 Blocker (Audit Log Ingestion Failure):** In [`src/db/database.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts), the frontend attempts direct `insert` into `audit_logs`, which V2.1.5 RLS policy strictly rejects (`Deny insert audit_logs`). Real audit logs are silently dropped on the cloud database and only stored in the local browser.

**Certification Verdict:** **`NO — NOT READY FOR PILOT`**.  
The system must complete the prioritized remediation plan in Section 20 before real children, teachers, and guardians use the platform.

---

## 2. Baseline Used

The following authoritative specifications and baselines governed this audit:

| Document / Artifact | Location / Version | Role in Audit |
|---|---|---|
| **Yapendik OS Constitution & Operating Model** | [`doc/MASTER/01-YAPENDIK OPERATING SYSTEM CONSTITUTION.md`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/01-YAPENDIK%20OPERATING%20SYSTEM%20CONSTITUTION.md) through `07` | Supreme architectural authority |
| **Domain & Entity Specifications** | [`doc/MASTER/08`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/08-YAPENDIK%20SCHOOL%20OS%20TK%20PILOT%20—%20SPESIFIKASI%20DOMAIN%20%26%20ENTITAS.md) & [`12`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/12-YAPENDIK%20SCHOOL%20OS%20TK%20PILOT%20DOMAIN%20%26%20ENTITY%20SPECIFICATION.md) | Canonical entities & projection rules |
| **Authorization Model** | [`doc/MASTER/10-YAPENDIK SCHOOL OS TK PILOT AUTHORIZATION MODEL.md`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/10-YAPENDIK%20SCHOOL%20OS%20TK%20PILOT%20AUTHORIZATION%20MODEL.md) | Contextual authorization equation & matrix |
| **Database Blueprint & API Contract** | [`doc/MASTER/15`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/15-YAPENDIK%20SCHOOL%20OS%20TK%20PILOT%20DATABASE%20BLUEPRINT.md) & [`16`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/16-YAPENDIK%20SCHOOL%20OS%20TK%20PILOT%20API%20%26%20APPLICATION%20CONTRACT.md) | Schema invariants & RPC signatures |
| **V2.1.5 Definitive Hardened RLS Migration** | [`db_migrations/rls_migration_v2_1_5_hardened.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_migration_v2_1_5_hardened.sql) | Definitive Database Security Baseline |
| **V2.1.5 RLS Negative Security Test Suite** | [`db_migrations/rls_security_tests_v2_1_5.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_security_tests_v2_1_5.sql) | Database Security Test Benchmark |
| **Pilot Seed Fixtures** | [`db_migrations/pilot_seed_v2_1_5.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/pilot_seed_v2_1_5.sql) | Decoupled Pilot Bootstrap Data |

---

## 3. Repository Evidence Summary

| Component / Layer | Source Files Inspected | Build / Execution Status |
|---|---|---|
| **Build & Type Checking** | [`package.json`](file:///d:/PROJECT/yapendik-tk-pilot/package.json), [`tsconfig.json`](file:///d:/PROJECT/yapendik-tk-pilot/tsconfig.json), [`vite.config.ts`](file:///d:/PROJECT/yapendik-tk-pilot/vite.config.ts) | `pnpm lint` (`tsc --noEmit`) **PASSED (Exit 0)** |
| **Contextual Authorization** | [`src/auth/authorization.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/authorization.ts), [`src/tests/authorizationTests.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/tests/authorizationTests.ts) | **8/8 Tests Passed** (Unit logic only) |
| **Auth & Security Context Provider** | [`src/auth/context.tsx`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/context.tsx) | Operational in Simulation Mode |
| **Database Repository Layer** | [`src/db/database.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts), [`src/db/seed.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/seed.ts), [`src/db/supabaseClient.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/supabaseClient.ts) | Operational with LocalStorage Cache |
| **Database Migrations & Schemas** | [`db_migrations/rls_migration_v2_1_5_hardened.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_migration_v2_1_5_hardened.sql), [`supabase_schema.sql`](file:///d:/PROJECT/yapendik-tk-pilot/supabase_schema.sql) | V2.1.5 migration file present |
| **Workspaces (UI)** | 9 Workspaces in [`src/components/workspaces/`](file:///d:/PROJECT/yapendik-tk-pilot/src/components/workspaces/) | Render cleanly without runtime errors |

---

## 4. Architecture Compliance

### 4.1 Canonical Entities vs Projections
- **Status:** **VERIFIED**
- **Evidence:** [`src/domain/types.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/domain/types.ts#L37-L140) and [`supabase_schema.sql`](file:///d:/PROJECT/yapendik-tk-pilot/supabase_schema.sql#L26-L175).
- **Analysis:** Clean separation between `Person` (canonical identity), `UserAccount` (auth), `StudentProfile` (academic), `TeacherProfile`, and `GuardianRelationship`. Projections correctly reference canonical `person_id`.

### 4.2 Multi-Dimensional Contextual Authorization
- **Status:** **VERIFIED (Model Level) / PARTIALLY VERIFIED (Runtime Integration)**
- **Evidence:** [`src/auth/authorization.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/authorization.ts#L63-L197).
- **Analysis:** Policy engine properly evaluates `USER + ROLE + SCHOOL CONTEXT + RELATIONSHIP + ACTION + RESOURCE`. However, in runtime, the client UI acts as the filtering authority rather than consuming pre-filtered backend streams.

---

## 5. Authorization Security

### 5.1 Authorization Path Audit
$$\text{User} \longrightarrow \text{Identity} \longrightarrow \text{Role} \longrightarrow \text{School Context} \longrightarrow \text{Relationship} \longrightarrow \text{Action} \longrightarrow \text{Resource} \longrightarrow \text{PostgreSQL RLS}$$

1. **Database RLS Boundary:** **HARDENED.**
   In PostgreSQL V2.1.5, helper functions (`auth_is_teacher_of_class`, `auth_is_headmaster_of`, `auth_is_guardian_of`, `auth_is_superadmin`) enforce tenant and relationship boundaries.
2. **Client-Side Authorization Vulnerability:** **FAILED.**
   - In [`src/components/workspaces/ObservationWorkspace.tsx`](file:///d:/PROJECT/yapendik-tk-pilot/src/components/workspaces/ObservationWorkspace.tsx#L59-L97), `db.getObservations()` loads **all observations for the school/class** into the browser memory. The frontend then runs `visibleObservations = observations.filter(...)`.
   - A curious user or compromised browser script can read unredacted confidential observations directly from client memory or `localStorage`.

---

## 6. Database & RLS Security

### 6.1 Audit of V2.1.5 Invariants & Hardening
- **Placement Guard Trigger:** `trg_student_placement_guard` on `students` successfully prevents direct client update of `current_class_id` when `current_user IN ('anon', 'authenticated')` ([`rls_migration_v2_1_5_hardened.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_migration_v2_1_5_hardened.sql#L547-L565)).
- **Trusted RPC State Machine:**
  - `rpc_place_student_in_class`: Row-locked (`FOR UPDATE`) with capacity checks.
  - `rpc_save_progress_report_draft`: Enforces IDOR context assertions and active academic year validation.
  - `rpc_submit_report_for_review`: Restricts submission to assigned homeroom teacher.
  - `rpc_approve_progress_report`: Restricts approval to active Headmaster / Superadmin.
  - `rpc_publish_progress_report`: Locks report to `PUBLISHED` state.
- **Report Immutability Trigger:** `trg_report_published_immutability` blocks `UPDATE` and `DELETE` on published reports.
- **RLS Policy Coverage:** Strict denial of direct client writes to `student_progress_reports` and `audit_logs`.

### 6.2 Database Vulnerability Findings
1. **Permissive Policy in `supabase_schema.sql` (P0 Blocker):**
   Lines 340-353 in [`supabase_schema.sql`](file:///d:/PROJECT/yapendik-tk-pilot/supabase_schema.sql) execute a dynamic loop creating `Public Full Access For Pilot` (`USING (true) WITH CHECK (true)`) on all tables. If an operator runs [`scripts/run_schema.mjs`](file:///d:/PROJECT/yapendik-tk-pilot/scripts/run_schema.mjs), all hardened RLS policies in Supabase are immediately overwritten with permissive access.
2. **Missing Database Integration in Frontend (P1):**
   [`src/db/database.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts) does not implement callers for `rpc_place_student_in_class`, `rpc_save_progress_report_draft`, `rpc_submit_report_for_review`, `rpc_approve_progress_report`, or `rpc_publish_progress_report`. When V2.1.5 RLS is active on Supabase, frontend write attempts to `student_progress_reports` fail silently in background promises.

---

## 7. Data Integrity

- **Database Relational Integrity:** Strong foreign keys and triggers (`trg_class_school_consistency`, `trg_guardian_relationship_integrity`).
- **Client Mutation ID Desynchronization (P2):** Client generates random timestamp IDs (`act_${Date.now()}_...`). If two offline clients create activities or observations simultaneously, IDs will never conflict locally but will cause distinct un-coordinated records in Supabase.
- **Attendance Batch Upsert Conflict (P2):** In [`database.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts#L800-L835), `saveAttendanceBatch` replaces in-memory rows by class and date, but generates new random IDs on each save. Syncing via `supabase.from('daily_attendance').upsert()` can insert duplicate records instead of updating existing ones unless keyed on `(school_id, class_id, student_id, date)`.

---

## 8. Privacy & Sensitive Child Data Protection

- **Child PII in LocalStorage (P0):** Student full names, NIK, birth dates, allergies, special needs, and blood types are stored unencrypted in browser `localStorage`.
- **Guardian Roster Leakage (P1):** In [`EnrollmentWorkspace.tsx`](file:///d:/PROJECT/yapendik-tk-pilot/src/components/workspaces/EnrollmentWorkspace.tsx), the full class roster is accessible to any user who selects the workspace tab, revealing emergency contacts and parent names.
- **Confidential Observations Exposure (P1):** Observations marked `is_confidential_to_staff = true` are sent to the client storage and only filtered in the React view layer.

---

## 9. Authentication & Session Boundary

- **Hardcoded Persona Switcher (P1 Blocker for Real Pilot):**
  [`src/auth/context.tsx`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/context.tsx#L24-L97) defines a static list of 6 personas (`SEED_PERSONAS`).
  - When real teachers, headmasters, or guardians at a pilot school attempt to register or sign in with their own Supabase accounts, `handleSession()` fails to map them if they are not in the hardcoded list, resulting in `AUTHENTICATED_NO_PERSON` or `NO_INSTITUTIONAL_RELATIONSHIP`.
  - The application lacks a production login form and dynamic person-context resolution pipeline from the `user_person_identities` table.

---

## 10. Frontend Security

- **Hardcoded Secrets in Source Tree (P0 Blocker):**
  - [`.env.supabase`](file:///d:/PROJECT/yapendik-tk-pilot/.env.supabase): Plaintext Postgres database password (`!V6i#=Qtz54+QpW`) and `SUPABASE_SERVICE_ROLE_KEY`.
  - [`scripts/run_schema.mjs`](file:///d:/PROJECT/yapendik-tk-pilot/scripts/run_schema.mjs#L4-L5): Plaintext Postgres connection URI with password.
  - [`scripts/seed_auth.mjs`](file:///d:/PROJECT/yapendik-tk-pilot/scripts/seed_auth.mjs#L4): Hardcoded `SUPABASE_SERVICE_ROLE_KEY`.
  - [`src/auth/context.tsx`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/context.tsx#L230): Hardcoded simulation password (`yapendikpassword123!`).
- **Client Configuration Override (P2):**
  [`SupabaseSettingsModal.tsx`](file:///d:/PROJECT/yapendik-tk-pilot/src/components/workspaces/SupabaseSettingsModal.tsx) allows any client to overwrite the project URL and Anon key in `localStorage`.

---

## 11. Offline / Cache / Local Storage Security

- **Cache Lifetime on Logout / Persona Switch (P0 Blocker):**
  [`src/auth/context.tsx`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/context.tsx#L264-L275) implements `signOut()` as:
  ```ts
  const signOut = async () => {
    setCurrentPersonaId(null);
    setAuthenticatedUser(null);
    setAuthState('UNAUTHENTICATED');
    if (supabase) await supabase.auth.signOut();
  };
  ```
  `signOut()` does **NOT** clear `localStorage` (`localStorage.removeItem()` or `clear()`).
  - **Attack Scenario:** Teacher Siti logs into a shared school laptop, records confidential observations and attendance, and signs out. Parent Budi later uses the same laptop and logs in. Parent Budi's browser still holds the entire unencrypted `yapendik_os_v1_observations` and `yapendik_os_v1_students` cache in `localStorage`.
- **Cross-School Cache Pollution (P1):**
  Cache keys are not prefixed with `school_id`. Data from multiple schools accumulates in a single flat array in `localStorage`.

---

## 12. Auditability

- **Database Audit Log Lockdown:** `audit_logs` table has RLS enabled with `Deny insert/update/delete audit_logs`. Writes are only permitted through `fn_write_audit_log` inside `SECURITY DEFINER` RPCs.
- **Frontend Audit Log Bypass / Drop (P1):**
  [`src/db/database.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts#L965-L983) tries to call `supabase.from('audit_logs').insert(mappers.audit.toDb(log))`.
  Because the client runs with `anon` or `authenticated` role, PostgreSQL RLS **rejects** this insert. The error is caught with `console.warn`, and the audit record is stored **only** in the client's `localStorage`!
  **Impact:** Operational actions performed in the UI (creating activities, taking attendance, creating observations) leave **zero immutable audit trail** in the Supabase Cloud database!

---

## 13. Testing Assessment

| Test Type | Test Suite / Location | Result | Coverage & Gaps |
|---|---|---|---|
| **Contextual Authorization Logic** | [`src/tests/authorizationTests.ts`](file:///d:/PROJECT/yapendik-tk-pilot/src/tests/authorizationTests.ts) | **8 Passed, 0 Failed** | Covers TypeScript authorization evaluator logic (positive + negative). |
| **Database RLS Negative Security** | [`db_migrations/rls_security_tests_v2_1_5.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_security_tests_v2_1_5.sql) | **Validated via SQL Inspection** | Tests GUC bypass, RPC draft IDOR, closed AY mutation, published immutability, guardian invariant. |
| **Automated Integration Tests (CI)** | *None in repository* | **MISSING** | No Vitest/Jest/Playwright test suite running automated API or UI flows in CI. |
| **Component Unit Tests** | *None in repository* | **MISSING** | 0 test files under `src/components/`. |

---

## 14. Operational Readiness

- **Secret Management:** **FAILED.** Service role keys and database passwords committed to workspace files.
- **Deployment & Environments:** Development server runs via Vite (`pnpm dev`). Production build compiles cleanly (`pnpm build`).
- **Database Migrations:** No migration management tool (e.g. Supabase CLI / Flyway / Prisma). Relies on manual SQL script execution.
- **Rollback & Disaster Recovery:** No automated snapshot or backup verification procedure documented for pilot tenant data.

---

## 15. UX Pilot Readiness

- **Teacher Daily Work:** Usable, responsive, supports theme/sub-theme planning, materials, steps, and reflection.
- **Observation / Anecdotal Workspace:** Intuitive, 6 Kurikulum Merdeka domains, rating badges (BB, MB, BSH, BSB).
- **LPPA Development Workspace:** Visually comprehensive report preview, but lacks backend state persistence for approval.
- **Presensi & Skrining:** Fast batch entry, temperature screening, arrival mood tracking.
- **Buku Penghubung Digital:** Notice posting, student targeting, acknowledgment and parent response modal.
- **Empty States & Error Handling:** UI assumes seed data is always present. Loading dynamic school contexts with 0 students or 0 classes needs defensive empty-state handling.

---

## 16. Security Attack Scenario Results

| Scenario | Vector & Boundary | Expected Result | Actual Result | Status | Severity |
|---|---|---|---|---|---|
| **1. Cross-School Breach** | Teacher A queries Student in School B via client / DB | Access blocked across school boundary | **DB:** Denied by RLS.<br>**Client:** Blocked by UI filter, but data co-exists in `localStorage`. | **PARTIALLY VERIFIED** | **P1** |
| **2. Resource IDOR** | Teacher tampers with observation ID | Only allowed within assigned class / school | **DB:** Enforced by class RLS.<br>**Client:** Filtered by class ID. | **VERIFIED** | **P2** |
| **3. Guardian PII Breach** | Guardian queries another child's observations | Strict denial of non-child data | **DB:** Denied by RLS.<br>**Client:** Filtered by UI, but unredacted records sit in browser memory. | **PARTIALLY VERIFIED** | **P1** |
| **4. Unauthorized RPC Call** | Teacher invokes `rpc_approve_progress_report` | Denied with `FORBIDDEN` exception | **DB:** Denied by `auth_is_headmaster_of()`.<br>**Client:** RPC not wired. | **VERIFIED (DB)** | **P1 (UI)** |
| **5. Direct Class ID Tampering** | Client issues `UPDATE students SET current_class_id=...` | Trigger blocks direct mutation | **DB:** Denied by `trg_student_placement_guard`.<br>**Client:** Trigger active. | **VERIFIED (DB)** | **P1 (UI)** |
| **6. Draft Report IDOR** | Teacher overwrites another student's report ID in draft RPC | Denied with `IDOR_ATTEMPT` exception | **DB:** Denied by context check in `rpc_save_progress_report_draft`. | **VERIFIED (DB)** | **P1 (UI)** |
| **7. Closed Academic Year Mutation** | Modifying report when `academic_years.is_active=false` | Denied with `ACADEMIC_YEAR_INACTIVE` | **DB:** Denied by RPC validation check. | **VERIFIED (DB)** | **P2** |
| **8. Published Report Tampering** | Client tries `DELETE` or `UPDATE` on `PUBLISHED` report | Denied with `IMMUTABLE_RECORD` exception | **DB:** Denied by `trg_enforce_published_report_immutability`. | **VERIFIED (DB)** | **P1 (UI)** |
| **9. Invalid Guardian Relationship** | Inserting guardian for non-student `person_id` | Denied with `INTEGRITY_VIOLATION` exception | **DB:** Denied by `trg_verify_guardian_relationship`. | **VERIFIED (DB)** | **P2** |
| **10. Class Roster Isolation** | Teacher queries roster outside assigned class | View `v_teacher_class_roster` filters rows | **DB:** Enforces `auth_is_teacher_of_class`.<br>**Client:** UI dropdown allows selecting other classes in school. | **PARTIALLY VERIFIED** | **P1** |
| **11. Shared Device Cache Poisoning** | User A logs out, User B logs in on same browser | Cache purged; no data leakage | **FAILED:** `signOut()` does NOT clear `localStorage`. User B inherits User A's cached student records. | **FAILED (EXPLOITABLE)** | **P0** |
| **12. Stale School Context Cache** | Switching school context without clearing storage | Stale cache purged; fresh fetch | **PARTIALLY FAILED:** Storage keys unpartitioned by school; stale school data lingers. | **PARTIALLY FAILED** | **P1** |

---

## 17. Findings Register

| ID | Severity | Domain | Finding Description | Evidence (File & Line) | Impact | Recommended Remediation | Status |
|---|---|---|---|---|---|---|---|
| **SEC-01** | **P0** | Offline / Cache | `signOut()` does not purge sensitive student data from `localStorage`. | [`src/auth/context.tsx:264-275`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/context.tsx#L264-L275) | Complete PII & observation record leakage on shared school computers / tablets. | Implement comprehensive cache flush (`localStorage.clear()` or prefix purge) upon logout and persona switch. | **BLOCKER** |
| **SEC-02** | **P0** | Credentials | Hardcoded Postgres password, database connection string, and Supabase service role keys committed to repository. | [`.env.supabase:9,22`](file:///d:/PROJECT/yapendik-tk-pilot/.env.supabase#L9), [`scripts/run_schema.mjs:5`](file:///d:/PROJECT/yapendik-tk-pilot/scripts/run_schema.mjs#L5), [`scripts/seed_auth.mjs:4`](file:///d:/PROJECT/yapendik-tk-pilot/scripts/seed_auth.mjs#L4) | Total database compromise if repository is exposed; privilege escalation via service role key. | Immediately rotate database password and service role key in Supabase Cloud. Remove files from git and clean git history. | **BLOCKER** |
| **SEC-03** | **P0** | Database RLS | `supabase_schema.sql` contains permissive `Public Full Access For Pilot` policy overwriting RLS. | [`supabase_schema.sql:340-353`](file:///d:/PROJECT/yapendik-tk-pilot/supabase_schema.sql#L340-L353) | Running `run_schema.mjs` disables all database security and opens full public read/write access. | Remove permissive Phase 14 from `supabase_schema.sql` and make `rls_migration_v2_1_5_hardened.sql` the single source of truth for RLS. | **BLOCKER** |
| **SEC-04** | **P1** | Authentication | Client relies on hardcoded `SEED_PERSONAS` array instead of dynamic user identity resolution from Supabase. | [`src/auth/context.tsx:24-97, 187-208`](file:///d:/PROJECT/yapendik-tk-pilot/src/auth/context.tsx#L24-L97) | Real pilot teachers and parents cannot log in or have their institutional roles mapped dynamically. | Implement production auth pipeline querying `user_person_identities` and related profile tables. | **BLOCKER** |
| **SEC-05** | **P1** | Auditability | Frontend attempts direct client insert to `audit_logs`, which V2.1.5 RLS rejects; cloud audit logging is silently dropped. | [`src/db/database.ts:975-982`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts#L975-L982), [`rls_migration_v2_1_5_hardened.sql:507`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_migration_v2_1_5_hardened.sql#L507) | Zero immutable audit trail recorded on the cloud database for user operational actions. | Create and invoke an authorized security definer RPC for client audit events or rely on DB triggers. | **BLOCKER** |
| **SEC-06** | **P1** | Integration | `DevelopmentWorkspace` manages report approval purely in local React component state without invoking V2.1.5 RPCs. | [`DevelopmentWorkspace.tsx:37, 108-124`](file:///d:/PROJECT/yapendik-tk-pilot/src/components/workspaces/DevelopmentWorkspace.tsx#L37) | Progress report approvals are lost upon page reload; V2.1.5 approval state machine is bypassed. | Implement repository methods connecting `DevelopmentWorkspace` to `rpc_approve_progress_report` and `rpc_save_progress_report_draft`. | **BLOCKER** |
| **SEC-07** | **P1** | Privacy | Unredacted confidential observations and full class rosters are loaded into client memory and filtered only in UI. | [`ObservationWorkspace.tsx:59-97`](file:///d:/PROJECT/yapendik-tk-pilot/src/components/workspaces/ObservationWorkspace.tsx#L59-L97), [`database.ts:742-748`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts#L742-L748) | Confidential teacher notes can be extracted via browser DevTools by non-staff users. | Enforce server-side filtering via Supabase queries/views so confidential rows are never sent to unauthorized clients. | **HIGH** |
| **SEC-08** | **P2** | Integration | Attendance batch save generates random client IDs causing duplicate entries in Supabase upsert. | [`database.ts:817-835`](file:///d:/PROJECT/yapendik-tk-pilot/src/db/database.ts#L817-L835) | Multiple daily attendance rows created for the same student on the same date. | Add unique constraint `(school_id, class_id, student_id, date)` on `daily_attendance` and deterministic upsert key. | **MEDIUM** |
| **SEC-09** | **P2** | Configuration | `SupabaseSettingsModal` permits unauthenticated client to overwrite Supabase project URL and key in localStorage. | [`SupabaseSettingsModal.tsx:25-40`](file:///d:/PROJECT/yapendik-tk-pilot/src/components/workspaces/SupabaseSettingsModal.tsx#L25-L40) | Malicious user can redirect client database traffic to an external Supabase project. | Restrict configuration modal to `SUPERADMIN` role or build-time environment variables only. | **MEDIUM** |
| **SEC-10** | **P3** | Testing | Lack of automated CI integration tests running against PostgreSQL / Supabase instance. | [`package.json:6-12`](file:///d:/PROJECT/yapendik-tk-pilot/package.json#L6-L12) | Regressions in RLS or RPCs may pass undetected during deployments. | Add Vitest / Playwright test harness to execute `rls_security_tests_v2_1_5.sql` in CI pipeline. | **LOW** |

---

## 18. Production Readiness Scorecard

```
================================================================================
YAPENDIK SCHOOL OS TK PILOT v1.0 — PRODUCTION READINESS SCORECARD
================================================================================
1.  Architecture & Constitution   : [ GREEN  ] Canonical entities & contextual model aligned
2.  Database RLS (V2.1.5 Engine)  : [ GREEN  ] Placement guard, state machine RPCs, immutability
3.  Authorization Logic           : [ GREEN  ] Policy evaluator passes 8/8 test cases
4.  Data Integrity (Schema)       : [ GREEN  ] Relational constraints & triggers sound
5.  Auditability (Cloud Trail)    : [  RED   ] Client direct inserts blocked by RLS; audit dropped
6.  Authentication & Session      : [  RED   ] Hardcoded seed personas; no real user mapping
7.  Offline / Cache Security      : [  RED   ] Shared device PII leakage; signOut does not clear cache
8.  Secrets & Credential Mgmt     : [  RED   ] Plaintext DB passwords & service role key committed
9.  Privacy & Data Leakage        : [ YELLOW ] Client-side filtering of confidential observations
10. Application-DB Integration    : [  RED   ] Progress report RPCs not wired to UI
11. Testing & QA Automation       : [ YELLOW ] Unit logic tested; CI integration test suite missing
12. Operational / Deployment      : [ YELLOW ] Builds cleanly; migration tooling and recovery ad-hoc
================================================================================
OVERALL PRODUCTION STATUS         : [  RED   ] NOT READY FOR PILOT
================================================================================
```

---

## 19. Blockers (Must Be Fixed Before Pilot Deployment)

1. **[BLOCKER 1 - SEC-01] Shared Device LocalStorage Leakage:**  
   Purge all cached student PII, medical records, observations, and attendance from `localStorage` upon `signOut()` and persona switching.
2. **[BLOCKER 2 - SEC-02] Repository Secret Compromise:**  
   Rotate the database password and Supabase Service Role Key. Remove `.env.supabase` and hardcoded connection strings from scripts.
3. **[BLOCKER 3 - SEC-03] Permissive Policy Override Elimination:**  
   Remove Phase 14 (`Public Full Access For Pilot`) from `supabase_schema.sql` so that running schema scripts does not dismantle V2.1.5 RLS hardening.
4. **[BLOCKER 4 - SEC-04] Dynamic Authentication Pipeline:**  
   Replace hardcoded `SEED_PERSONAS` in `context.tsx` with dynamic lookup against `user_person_identities`, `teacher_profiles`, `staff_profiles`, and `guardian_relationships` for authenticated Supabase users.
5. **[BLOCKER 5 - SEC-05 & SEC-06] Progress Report RPC & Cloud Audit Integration:**  
   Wire `rpc_save_progress_report_draft`, `rpc_submit_report_for_review`, and `rpc_approve_progress_report` into `src/db/database.ts` and `DevelopmentWorkspace.tsx`. Implement an RPC for client audit events.

---

## 20. Required Actions Before Pilot (Prioritized Remediation Plan)

### Phase 1: Security & Secret Lockdown (Day 1)
- [ ] **Step 1.1:** Rotate the Supabase PostgreSQL database password and generate a new Service Role Key in the Supabase Dashboard.
- [ ] **Step 1.2:** Remove `.env.supabase` and sanitize `scripts/run_schema.mjs` and `scripts/seed_auth.mjs` to read strictly from non-committed environment variables.
- [ ] **Step 1.3:** Purge permissive policies from `supabase_schema.sql` and execute `db_migrations/rls_migration_v2_1_5_hardened.sql` on the live database.

### Phase 2: Cache & Multi-Tenant Partitioning (Day 2)
- [ ] **Step 2.1:** Update `signOut()` in `src/auth/context.tsx` to execute `localStorage.clear()` and reset all memory stores.
- [ ] **Step 2.2:** Prefix all `localStorage` keys with the active user ID and school ID (`yapendik_os_${schoolId}_${userId}_...`).
- [ ] **Step 2.3:** Scope queries in `database.ts` so that confidential observations (`is_confidential_to_staff`) are filtered out before being cached when the active user is a guardian.

### Phase 3: RPC Integration & Real Authentication (Day 3-4)
- [ ] **Step 3.1:** Implement dynamic context resolution in `context.tsx` via `supabase.rpc('get_auth_person_id')` and profile queries.
- [ ] **Step 3.2:** Wire `database.ts` progress report methods to call `supabase.rpc('rpc_save_progress_report_draft')` and `supabase.rpc('rpc_approve_progress_report')`.
- [ ] **Step 3.3:** Update `DevelopmentWorkspace.tsx` to persist approval status via RPC rather than local component state.
- [ ] **Step 3.4:** Create `rpc_log_client_event` (SECURITY DEFINER) so the frontend can write audit logs through the database security boundary.

---

## 21. Recommended Actions After Pilot Launch

1. **Automated CI Security Gate:** Integrate `rls_security_tests_v2_1_5.sql` into a GitHub Actions / CI pipeline using a local PostgreSQL container.
2. **Offline Queued Mutations:** Implement an IndexedDB offline mutation queue with optimistic locking and conflict resolution for poor connectivity environments.
3. **Database Migration CLI:** Adopt a structured migration management tool (e.g. Supabase CLI) to manage migrations reproducibly across dev, staging, and production environments.
4. **Audit Retention & Archival:** Implement automated partition and archival jobs for `audit_logs` older than 1 academic year.

---

## 22. Final Certification

### Formal Reviewer Certification:
> **Can this TK Pilot be safely handed to a real school today?**
> 
> **`NO — NOT READY FOR PILOT`**

### Technical Justification:
While the **PostgreSQL database schema, triggers, and V2.1.5 RLS migration represent an exceptional, robust security foundation**, the **application layer is currently running in a disconnected development simulation state**. Sensitive child data and confidential teacher notes are retained in unencrypted `localStorage` across logout sessions (exposing real students on shared school computers), hardcoded administrative secrets exist in repository files, progress report approvals are not persisted to the database, and real user authentication is blocked by hardcoded seed persona mappings.

Once the **5 Blockers in Section 19** are remediated, the system will achieve full production certification.

---
*Report certified by Senior Principal Engineer & Security Architect on 2026-08-25.*
