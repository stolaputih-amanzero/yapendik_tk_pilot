# YAPENDIK SCHOOL OS (TK PILOT v1.0)
# PRR REMEDIATION BASELINE SNAPSHOT (PHASE 0)

**Date:** 2026-08-25  
**Authoritative Baseline:** V2.1.5 Definitive Production Baseline & Yapendik OS Constitution  
**Pre-Remediation Status:** NOT READY FOR PILOT (Identified 3 P0 Blockers, 4 P1 Blockers, 2 P2 Findings, 1 P3 Finding)

---

## 1. Initial Build & Tooling Health

- **TypeScript Typecheck (`pnpm lint` / `tsc --noEmit`):** PASSED (0 errors).
- **Production Bundle (`pnpm build`):** PASSED (Vite 6 build completed in 10.67s, assets generated in `dist/`).
- **Dev Server:** Active on Vite dev port 3000.

---

## 2. Baseline Deficit Inventory (Target of Remediation)

| ID | Category | Severity | Current Defect / Gap | Target Remediation |
|---|---|---|---|---|
| **SEC-01** | Cache Security | **P0 (Blocker)** | `signOut()` does not purge `localStorage`. Shared tablets/desktops retain all student PII, medical records, attendance, and observations. | Secure cache lifecycle: flush namespace on logout / persona switch. |
| **SEC-02** | Credentials | **P0 (Blocker)** | Plaintext DB passwords (`!V6i#=Qtz54+QpW`) & `service_role` keys in `.env.supabase`, `scripts/run_schema.mjs`, `scripts/seed_auth.mjs`. | Strip hardcoded secrets, use environment variables only, sanitize `.gitignore`. |
| **SEC-03** | Database RLS | **P0 (Blocker)** | `supabase_schema.sql` contains Phase 14 script (`Public Full Access For Pilot`) with `USING (true) WITH CHECK (true)` on all tables. | Remove permissive Phase 14. Establish `rls_migration_v2_1_5_hardened.sql` as the single authoritative source of truth. |
| **SEC-04** | Authentication | **P1 (Blocker)** | Frontend authentication is tightly coupled to static `SEED_PERSONAS` array. Real Supabase users cannot resolve institutional roles dynamically. | Implement dynamic context resolution via `get_auth_person_id` RPC and profile queries; isolate `SEED_PERSONAS` to explicit DEMO mode only. |
| **SEC-05** | Cloud Audit | **P1 (Blocker)** | Direct client `insert` to `audit_logs` is denied by V2.1.5 RLS; client audit events silently fail to reach Supabase. | Create and invoke `rpc_log_client_event` (SECURITY DEFINER) to record client events through the database boundary. |
| **SEC-06** | Progress Reports | **P1 (Blocker)** | `DevelopmentWorkspace.tsx` manages report approval only in local React state (`useState`), bypassing V2.1.5 RPC state machine. | Wire `rpc_save_progress_report_draft`, `rpc_submit_report_for_review`, `rpc_approve_progress_report`, `rpc_publish_progress_report`. |
| **SEC-07** | Privacy | **P1** | Unredacted confidential observations (`is_confidential_to_staff`) and rosters are fetched into client memory and only filtered in React. | Server-side query filtering so guardians never download staff-confidential observations. |
| **SEC-08** | Attendance | **P2** | Attendance batch save generates random timestamp IDs (`Date.now()`), causing duplicate rows on cloud upsert. | Add deterministic uniqueness constraint on `(school_id, class_id, student_id, date)` and deterministic upsert. |
| **SEC-09** | Configuration | **P2** | `SupabaseSettingsModal.tsx` allows unauthenticated clients to overwrite Supabase project URL and key in localStorage. | Restrict configuration override to `SUPERADMIN` role or build-time environment variables. |
| **SEC-10** | Testing | **P3** | Lack of automated CI integration/security tests executing against PostgreSQL / Supabase instance. | Create automated Vitest security test suite. |

---

## 3. Authoritative Reference Hierarchy

1. `doc/MASTER/01-YAPENDIK OPERATING SYSTEM CONSTITUTION.md` (Constitutional Invariants)
2. `doc/MASTER/08` & `12` (Domain & Canonical Entity Models)
3. `doc/MASTER/10` (Contextual Authorization Engine)
4. `doc/MASTER/15` & `16` (Database Blueprint & API Contracts)
5. `db_migrations/rls_migration_v2_1_5_hardened.sql` (Authoritative Database Baseline)
6. `db_migrations/rls_security_tests_v2_1_5.sql` (Security Test Scenarios)
7. `db_migrations/pilot_seed_v2_1_5.sql` (Pilot Seed Fixtures)

---
*Snapshot locked prior to code remediation.*
