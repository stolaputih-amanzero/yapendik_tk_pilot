# YAPENDIK SCHOOL OS — TK PILOT v1.0
# GATE 4 EXECUTION EVIDENCE: PILOT AUTHENTICATION ACCOUNT SEEDING

**Document ID:** `YAPENDIK-GATE04-EVIDENCE-2026-001`  
**Governance Authority:** Yapendik OS Constitution & Architecture Review Board  
**Implementation Baseline:** V2.1.5 Definitive Production Baseline (🔒 FROZEN)  
**Execution Date:** 2026-08-25  
**Operator & Auditor Roles:** Identity Administrator, Security Architect, Senior Release Governance Architect  
**Target Project Reference:** `diliqtfgzxmjvwzczdcx` (Supabase Cloud TK Maranatha / Yapendik 01)  

---

```
════════════════════════════════════════════════════════════════════════════════
                      YAPENDIK SCHOOL OS (TK PILOT v1.0)
         GATE 4 — PILOT AUTHENTICATION ACCOUNT PROVISIONING EVIDENCE
════════════════════════════════════════════════════════════════════════════════

  Gate ID          : GATE 4 — PILOT AUTHENTICATION ACCOUNT SEEDING
  Baseline Status  : V2.1.5 Definitive Production Baseline — 🔒 FROZEN
  Governance Status: Yapendik OS Constitution — LIVING / ACTIVE GOVERNANCE
  Provisioning DDL : user_person_identities (Supabase Auth Linking)
  Seed Script Hash : fb576fa968e7ec8949826a7f8e811c750b329434b9d036ceadcf885b5976b9f1

────────────────────────────────────────────────────────────────────────────────
GATE 4 VERDICT:
🟢 PASS — PILOT AUTHENTICATION IDENTITIES PROVISIONED & MAPPED
════════════════════════════════════════════════════════════════════════════════
```

---

## 1. Executive Summary

In accordance with **Gate 4** of the [`TK_PILOT_OPERATIONAL_DEPLOYMENT_AND_ACCEPTANCE_PLAN_v1.0.md`](file:///d:/PROJECT/yapendik-tk-pilot/doc/MASTER/TK_PILOT_OPERATIONAL_DEPLOYMENT_AND_ACCEPTANCE_PLAN_v1.0.md), this document records the preflight audit, provisioning, and identity mapping verification for all six (6) authoritative pilot user accounts on **Yapendik School OS — TK Pilot v1.0**.

The execution strictly followed the dynamic identity pipeline:

$$\text{Supabase Auth User (UUID)} \xrightarrow{\texttt{user\_person\_identities}} \text{Canonical Person ID} \xrightarrow{\texttt{get\_auth\_person\_id()}} \text{Institutional Profiles \& Roles}$$

All accounts were provisioned idempotently without hardcoded credentials, and verified against the canonical schema and domain specifications.

---

## 2. Preflight Audit & Safety Verification

Prior to execution, the read-only preflight verification established:
- **Target Cloud Project:** Verified as `diliqtfgzxmjvwzczdcx` (TK Maranatha / Yapendik 01).
- **Idempotency Guarantee:** Script checks `supabase.auth.admin.listUsers()` before creation, ensuring repeated runs update mapping records without duplicating accounts or throwing fatal exceptions.
- **Secret Protection:** Passwords injected dynamically via runtime environment variable (`PILOT_SEED_DEFAULT_PASSWORD`) without recording plaintext strings in source control.

---

## 3. The Six (6) Target Pilot Identities Ledger

| Persona / Name | Email Identifier | Canonical Person ID | Canonical Role | School Context & Assignment | Provisioning Status |
|---|---|---|---|---|---|
| **Siti Rahmawati, S.Pd** | `siti@yapendik.sch.id` | `per_teacher_siti` | `TEACHER` | TK Yapendik 01 (`cls_tka_01`) | ✅ **PROVISIONED & MAPPED** |
| **Maria Magdalena, S.Pd.Aud** | `maria@yapendik.sch.id` | `per_teacher_maria` | `TEACHER` | TK Yapendik 01 (`cls_tkb_01`) | ✅ **PROVISIONED & MAPPED** |
| **Dra. Esther Nugroho, M.Pd** | `esther@yapendik.sch.id` | `per_headmaster_esther` | `HEADMASTER` | TK Yapendik 01 (All Classes) | ✅ **PROVISIONED & MAPPED** |
| **Budi Santoso, S.T.** | `budi@yapendik.sch.id` | `per_parent_budi` | `GUARDIAN` | TK Yapendik 01 (Kenzo Pratama) | ✅ **PROVISIONED & MAPPED** |
| **Diana Sari, S.Pd** | `diana@yapendik.sch.id` | `per_teacher_diana` | `TEACHER` | TK Yapendik 02 (`cls_tka_02`) | ✅ **PROVISIONED & MAPPED** |
| **Dr. Andreas Hendrawan** | `andreas@yapendik.sch.id` | `per_superadmin_andreas` | `YAPENDIK_SUPERADMIN` | Foundation Governance | ✅ **PROVISIONED & MAPPED** |

---

## 4. Post-Provisioning Identity Mapping Verification

- **Identity Table (`user_person_identities`):** All 6 records verified active with `status = 'ACTIVE'`.
- **Zero Duplicate Mappings:** Primary key constraint on `user_person_identities.auth_user_id` verified; zero duplicate email mappings exist.
- **Zero Orphaned Accounts:** Every created `auth.users` record resolves to an existing, valid `persons` entity.
- **Contextual Integrity:** Role queries (`staff_profiles`, `teacher_profiles`, `guardian_relationships`, `governance_profiles`) align 100% with the certified authorization matrix.

---

## 5. Security & Repository Integrity Statements

1. **Credential Hygiene:** Zero user passwords, database passwords, or JWT secrets were printed, logged, or committed to documentation.
2. **Repository Integrity:** Zero application code, schema DDL, RLS migrations, or test files were modified during Gate 4.
3. **Frozen Baseline Preserved:** V2.1.5 Definitive Production Baseline remains locked.
4. **Constitutional Compliance:** Follows human-first canonical identity model established in Constitution Document 01.

---

## 6. Mandatory Governance Boundary

```
════════════════════════════════════════════════════════════════════════════════
                        AUTHORIZATION BOUNDARY NOTICE
════════════════════════════════════════════════════════════════════════════════

  Gate 4 (Pilot Authentication Account Seeding) is officially COMPLETE.

  MANDATORY STOP CONDITION:
  - GATE 5 (Production Frontend Deployment) IS NOT AUTHORIZED.
  - GATE 6 (Pilot Go-Live & User Onboarding) IS NOT AUTHORIZED.

  Deployment of the production frontend bundle to the hosting provider
  belongs exclusively to GATE 5 and requires separate explicit authorization.
════════════════════════════════════════════════════════════════════════════════
```

---
*Certified & Archived,*  
**Yapendik OS Identity Architecture & Release Governance Review Board**
