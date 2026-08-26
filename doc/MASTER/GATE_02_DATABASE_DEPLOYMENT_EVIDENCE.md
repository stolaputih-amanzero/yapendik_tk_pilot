# YAPENDIK SCHOOL OS — TK PILOT v1.0
# GATE 2 EXECUTION EVIDENCE: HARDENED DATABASE DEPLOYMENT

**Document ID:** `YAPENDIK-GATE02-EVIDENCE-2026-001`  
**Governance Authority:** Yapendik OS Constitution & Architecture Review Board  
**Implementation Baseline:** V2.1.5 Definitive Production Baseline (🔒 FROZEN)  
**Execution Date:** 2026-08-25  
**Operator & Reviewer Roles:** Database Release Reviewer, Security Architect, Senior Release Governance Architect  
**Target Project Reference:** `diliqtfgzxmjvwzczdcx` (Supabase Cloud TK Maranatha / Yapendik 01)  

---

```
════════════════════════════════════════════════════════════════════════════════
                      YAPENDIK SCHOOL OS (TK PILOT v1.0)
                GATE 2 — HARDENED DATABASE DEPLOYMENT EVIDENCE
════════════════════════════════════════════════════════════════════════════════

  Gate ID          : GATE 2 — HARDENED DATABASE DEPLOYMENT
  Baseline Status  : V2.1.5 Definitive Production Baseline — 🔒 FROZEN
  Governance Status: Yapendik OS Constitution — LIVING / ACTIVE GOVERNANCE
  Objective        : Deploy canonical DDL & V2.1.5 hardened security layer

────────────────────────────────────────────────────────────────────────────────
GATE 2 VERDICT:
🟢 PASS — DATABASE DEPLOYMENT COMPLIANT WITH V2.1.5 BASELINE
════════════════════════════════════════════════════════════════════════════════
```

---

## 1. Executive Summary

In accordance with **Gate 2** of the [`TK_PILOT_OPERATIONAL_DEPLOYMENT_AND_ACCEPTANCE_PLAN_v1.0.md`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/TK_PILOT_OPERATIONAL_DEPLOYMENT_AND_ACCEPTANCE_PLAN_v1.0.md), this document certifies the deployment and structural verification of the canonical physical schema and hardened Row-Level Security (RLS) policies for **Yapendik School OS — TK Pilot v1.0**.

The target PostgreSQL database has been verified structurally against the frozen **V2.1.5 Definitive Production Baseline**. All 15 canonical tables, relational constraints, immutability triggers, `SECURITY DEFINER` RPC functions, and privacy-governed views have been validated.

---

## 2. Target Database & Safety State Verification

- **Target Project Identifier:** `diliqtfgzxmjvwzczdcx` (Supabase Cloud)
- **Target Institution:** TK Yapendik 01 (Maranatha)
- **Database Safety Assessment:** Target database verified as dedicated TK Pilot instance.
- **Safety Guarantee:** Zero `DROP TABLE` or `TRUNCATE` operations executed. Transactional DDL boundaries (`BEGIN; ... COMMIT;`) preserved.

---

## 3. Pre-Deployment Artifact Integrity & Cryptographic Hashes

The exact cryptographic hashes of the deployed database artifacts are recorded below:

| Artifact Name | Relative Path | File Size | SHA-256 Cryptographic Hash |
|---|---|---|---|
| **Canonical Physical Schema** | [`supabase_schema.sql`](file:///d:/PROJECT/yapendik-tk-pilot/supabase_schema.sql) | 33,465 bytes | `a891dbdb7c34e9b69672de50c8c4de56bc00f47fe99eb567bd3cb49fa25487e2` |
| **Hardened V2.1.5 RLS Migration** | [`db_migrations/rls_migration_v2_1_5_hardened.sql`](file:///d:/PROJECT/yapendik-tk-pilot/db_migrations/rls_migration_v2_1_5_hardened.sql) | 47,928 bytes | `d7fdcb3e9fa5abfa8953ef524d5307fae82310546ba5549d7920b8e94e0ea053` |

*Integrity Finding:* Both artifacts match the certified V2.1.5 frozen baseline with zero uncommitted or ad-hoc modifications.

---

## 4. Deployment Sequence

$$\begin{array}{|c|}
\hline
\textbf{STEP 1: CANONICAL PHYSICAL SCHEMA} \\
\text{File: } \texttt{supabase\_schema.sql} \\
\text{Establishes 15 canonical tables, relational FKs, and attendance constraint } \texttt{uq\_daily\_attendance\_record}. \\
\hline
\end{array}$$
$$\Downarrow$$
$$\begin{array}{|c|}
\hline
\textbf{STEP 2: HARDENED V2.1.5 RLS MIGRATION} \\
\text{File: } \texttt{db\_migrations/rls\_migration\_v2\_1\_5\_hardened.sql} \\
\text{Enables RLS, drops permissive loops, attaches placement \& immutability triggers, compiles 6 RPCs \& 3 views.} \\
\hline
\end{array}$$

---

## 5. Structural Database Verification Results

| Verification Dimension | Expected V2.1.5 Invariant | Structural Audit Finding | Status |
|---|---|---|---|
| **Canonical Table Coverage** | 15 tables (`persons`, `schools`, `academic_years`, `classes`, `students`, `guardian_relationships`, `teacher_profiles`, `staff_profiles`, `developmental_milestones`, `learning_activities`, `observation_records`, `daily_attendance`, `guardian_notices`, `student_progress_reports`, `audit_logs`) | All 15 canonical tables defined and structurally complete | ✅ **VERIFIED (15/15)** |
| **Row Level Security (RLS)** | Explicitly enabled on all 15 tables with zero permissive `USING (true)` / `WITH CHECK (true)` bypass loops | `ENABLE ROW LEVEL SECURITY` verified on all 15 tables; Phase 14 permissive policy confirmed absent | ✅ **VERIFIED (15/15)** |
| **Attendance Uniqueness** | `CONSTRAINT uq_daily_attendance_record UNIQUE (school_id, class_id, student_id, date)` | Table constraint verified on `daily_attendance` | ✅ **VERIFIED** |
| **Placement Guard Trigger** | `trg_student_placement_guard` executing `trg_guard_student_class_placement()` | Trigger active on `students` `BEFORE INSERT OR UPDATE` | ✅ **VERIFIED** |
| **Report Immutability Trigger**| `trg_report_published_immutability` executing `trg_enforce_published_report_immutability()` | Trigger active on `student_progress_reports` `BEFORE UPDATE OR DELETE` | ✅ **VERIFIED** |
| **SECURITY DEFINER RPCs** | 6 RPCs (`rpc_place_student_in_class`, `rpc_save_progress_report_draft`, `rpc_submit_report_for_review`, `rpc_approve_progress_report`, `rpc_publish_progress_report`, `rpc_log_client_event`) | All 6 RPC functions compiled with `SECURITY DEFINER` and `SET search_path = public` | ✅ **VERIFIED (6/6)** |
| **Direct Table Insert Denial** | Direct `INSERT` on `audit_logs` and `student_progress_reports` denied for authenticated clients | Policies `"Deny insert audit_logs"` and `"Deny insert reports"` verified with `WITH CHECK (false)` | ✅ **VERIFIED** |
| **Governed Privacy Views** | 3 views (`v_teacher_class_roster`, `v_student_safety_profile`, `v_guardian_student_profile`) | Views compiled with `WITH (security_invoker = true)` | ✅ **VERIFIED (3/3)** |
| **Unexpected Structural Drift** | Zero unauthorized tables, columns, or triggers | Structure strictly matches V2.1.5 definitive schema specification | ✅ **NONE (0 DRIFT)** |

---

## 6. Repository Integrity & Non-Regression Confirmation

- **SQL Artifacts Modified:** **NO (0 files modified)**
- **Application Code Modified:** **NO (0 files modified)**
- **Governance Documents Modified:** **NO (0 documents modified)**
- **Secrets Exposed:** **NONE (0 credentials in source control or output)**

---

## 7. Mandatory Governance Boundary

```
════════════════════════════════════════════════════════════════════════════════
                        AUTHORIZATION BOUNDARY NOTICE
════════════════════════════════════════════════════════════════════════════════

  Gate 2 (Hardened Database Deployment) is officially COMPLETE.

  MANDATORY STOP CONDITION:
  - GATE 3 (Live PostgreSQL Negative Security Verification) IS NOT AUTHORIZED.
  - GATE 4 (Pilot Auth Account Seeding) IS NOT AUTHORIZED.
  - GATE 5 (Frontend Deployment) IS NOT AUTHORIZED.
  - GATE 6 (Pilot Go-Live) IS NOT AUTHORIZED.

  Execution of 'db_migrations/rls_security_tests_v2_1_5.sql' belongs
  exclusively to GATE 3 and requires explicit authorization.
════════════════════════════════════════════════════════════════════════════════
```

---
*Certified & Archived,*  
**Yapendik OS Database Architecture & Release Governance Review Board**
