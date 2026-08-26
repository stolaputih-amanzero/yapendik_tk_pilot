# YAPENDIK SCHOOL OS — GATE 6 OPERATIONAL ONBOARDING DISCOVERY
## Architectural, Data Lifecycle, Authorization & Operational Readiness Discovery Report

---

**System:** Yapendik School OS (TK Pilot v1.0)  
**Governance Authority:** Yapendik Operating System Constitution (Living Document)  
**Software Baseline:** V2.1.5 Definitive Production Baseline (🔒 Frozen)  
**Document Type:** Discovery & Reality-Validation Audit  
**Document Status:** 🟢 **COMPLETED — AWAITING OPERATOR REVIEW & GOVERNANCE DECISION**  

---

## 1. Executive Summary

This Operational Onboarding Discovery audit addresses the core architectural question:

> **"Can a real Yapendik school be created, configured, populated, authenticated, and made operationally ready without developer or database intervention?"**

### Discovery Finding
Based on direct source-code, database schema, RLS migration, and UI component analysis:

1. **Daily Operational Runtime is Fully Functional:** Daily sentra work, anecdotal observations (with 6 Kurikulum Merdeka domains), attendance batch records with deterministic keys, parent-teacher digital communication (Buku Penghubung), LPPA 4-stage progress report lifecycle (Draft $\rightarrow$ Review $\rightarrow$ Approve $\rightarrow$ Publish), and immutable audit logging are **100% operational** via UI and backed by hardened PostgreSQL RLS and SECURITY DEFINER RPCs.
2. **Administrative Setup & Operational Onboarding is 100% Developer/Seed-Driven:** There is currently **ZERO UI capability and ZERO public API/RPC** for a Foundation Superadmin or School Headmaster to:
   - Create or edit a School unit.
   - Create, activate, or close Academic Years.
   - Create, configure, or retire Classes (Rombel).
   - Create canonical `persons` records (prohibited by database RLS: `INSERT ON persons` is revoked from `authenticated` users).
   - Create Teacher profiles or assign teachers to classes.
   - Register/enroll new Students or transfer students.
   - Create Guardian identities or link Guardians to Students.
   - Provision authentication accounts, reset passwords, or activate/disable accounts.
3. **Current Gate 6 UAT Exercised Seed Fixtures, Not Dynamic Onboarding:** The successful execution of journeys UAT-01 through UAT-06 demonstrated that the *runtime workspace features* and *security boundaries* operate perfectly for **pre-existing, pre-seeded personas and rosters**. However, the institutional onboarding lifecycle that precedes daily operations has **not yet been implemented in the UI or exposed via governed RPCs**.

---

## 2. Governance Basis

The Yapendik OS Constitution establishes key institutional principles:

- **Article 5.2 (Stewardship):** Data and identities are institutional trusts that must follow clear jurisdictional accountability.
- **Article 13 (Canonical Identity):** Human beings are uniquely represented as canonical `Person` entities, decoupled from transient contextual roles (`Student`, `TeacherProfile`, `GuardianRelationship`, `StaffProfile`, `GovernanceProfile`).
- **Article 14 (Fail-Closed Contextual Security):** Every action must resolve `Actor -> Active School -> Scoped Class/Child -> Capability Matrix`. Unmapped or cross-school operations fail closed.
- **Article 17 (Administrative Autonomy vs Governance Oversight):** Foundation maintains cross-school governance; School Headmaster manages school-level academic rosters; Teachers manage classroom learning; Guardians access only linked offspring.

---

## 3. Current Operational Lifecycle (End-to-End Analysis)

The following diagram represents the target operational lifecycle for initializing a Yapendik School, cross-referenced with repository reality:

```
[FOUNDATION CREATES SCHOOL]              ──► ❌ MISSING IN UI / SEED & SQL ONLY
       ↓
[CONFIGURE ACADEMIC YEAR]                ──► ❌ MISSING IN UI / SEED & SQL ONLY
       ↓
[CREATE CLASSES (ROMBEL)]                ──► ❌ MISSING IN UI / SEED & SQL ONLY
       ↓
[CREATE CANONICAL PERSONS (TEACHERS)]    ──► ❌ MISSING IN UI / RLS INSERT REVOKED
       ↓
[CREATE TEACHER PROFILES & ASSIGNMENTS]  ──► ❌ MISSING IN UI / SEED & SQL ONLY
       ↓
[CREATE CANONICAL PERSONS (STUDENTS)]    ──► ❌ MISSING IN UI / RLS INSERT REVOKED
       ↓
[ENROLL STUDENTS TO CLASSES]             ──► 🟡 PARTIAL (RPC exists, UI is Read-Only)
       ↓
[CREATE GUARDIANS & LINK RELATIONSHIPS]  ──► ❌ MISSING IN UI / SEED & SQL ONLY
       ↓
[PROVISION SUPABASE AUTH ACCOUNTS]       ──► ❌ MISSING IN UI / CLI SCRIPT ONLY (seed_auth.mjs)
       ↓
[FIRST LOGIN & AUTH RESOLUTION]          ──► 🟢 SUPPORTED (Dynamic context resolution)
       ↓
[PASSWORD CHANGE / RESET]                ──► ❌ NOT IMPLEMENTED
       ↓
[DAILY WORKSPACES & OPERATIONS]          ──► 🟢 100% OPERATIONAL (Workspaces UAT-01..06)
```

### Stage-by-Stage Operational Audit

| # | Lifecycle Stage | Authorized Persona (Target) | Current Execution Mechanism | UI Availability | Database / RLS Boundary | Operational Status |
|---|---|---|---|---|---|:---:|
| **01** | **Create School** | Yayasan Superadmin | Direct SQL `INSERT INTO schools` | ❌ None (`SchoolReviewWorkspace` is Read-Only) | `GRANT SELECT ON schools TO authenticated;` (INSERT revoked) | 🔴 **DATABASE ONLY** |
| **02** | **Update School Identity** | Headmaster / Superadmin | Direct SQL `UPDATE schools` | ❌ None | `GRANT SELECT ON schools TO authenticated;` (UPDATE revoked) | 🔴 **DATABASE ONLY** |
| **03** | **Create Academic Year** | Headmaster / Superadmin | Direct SQL `INSERT INTO academic_years` | ❌ None | `GRANT SELECT ON academic_years TO authenticated;` (INSERT revoked) | 🔴 **DATABASE ONLY** |
| **04** | **Activate Academic Year** | Headmaster / Superadmin | Direct SQL `UPDATE academic_years` | ❌ None | `GRANT SELECT ON academic_years TO authenticated;` (UPDATE revoked) | 🔴 **DATABASE ONLY** |
| **05** | **Create Class (Rombel)** | Headmaster / Superadmin | Direct SQL `INSERT INTO classes` | ❌ None | RLS allows INSERT/UPDATE to Headmaster/Superadmin, but no UI/RPC exists | 🟡 **RLS READY / NO UI** |
| **06** | **Create Person (Teacher)** | Headmaster / Superadmin | Direct SQL `INSERT INTO persons` | ❌ None | `GRANT SELECT, UPDATE ON persons TO authenticated;` (INSERT revoked) | 🔴 **RLS BLOCKED / NO UI** |
| **07** | **Assign Teacher to Class** | Headmaster / Superadmin | Direct SQL `UPDATE classes SET homeroom_teacher_id = ...` | ❌ None | RLS allows UPDATE on classes to Headmaster/Superadmin, but no UI exists | 🟡 **RLS READY / NO UI** |
| **08** | **Create Person (Student)** | Headmaster / Superadmin | Direct SQL `INSERT INTO persons` | ❌ None | `GRANT SELECT, UPDATE ON persons TO authenticated;` (INSERT revoked) | 🔴 **RLS BLOCKED / NO UI** |
| **09** | **Register Student Record** | Headmaster / Superadmin | Direct SQL `INSERT INTO students` | ❌ None (`EnrollmentWorkspace` is Read-Only) | RLS allows INSERT, but `trg_student_placement_guard` blocks direct class assignment | 🟡 **RLS READY / NO UI** |
| **10** | **Place Student in Class** | Headmaster / Superadmin | RPC `rpc_place_student_in_class` | ❌ None (No trigger button in UI) | 🟢 Hardened SECURITY DEFINER RPC with capacity & cross-school check | 🟡 **RPC READY / NO UI** |
| **11** | **Create Person (Guardian)** | Headmaster / Superadmin | Direct SQL `INSERT INTO persons` | ❌ None | `GRANT SELECT, UPDATE ON persons TO authenticated;` (INSERT revoked) | 🔴 **RLS BLOCKED / NO UI** |
| **12** | **Link Guardian to Student** | Headmaster / Superadmin | Direct SQL `INSERT INTO guardian_relationships` | ❌ None | RLS allows INSERT/UPDATE to Headmaster/Superadmin, but no UI exists | 🟡 **RLS READY / NO UI** |
| **13** | **Provision Auth Account** | Foundation IT Admin | Node script `scripts/seed_auth.mjs` (Admin Service Role Key) | ❌ None | `user_person_identities` table is `REVOKE ALL` from clients (Fail-Closed) | 🔴 **SERVICE ROLE ONLY** |
| **14** | **First Login** | Any Provisioned User | Supabase Auth Email/Password login | 🟢 Supported (`Real Auth` tab in `App.tsx`) | Resolves `auth.uid() -> get_auth_person_id() -> profiles -> context` | 🟢 **SUPPORTED** |
| **15** | **Mandatory Password Change** | Any User | None | ❌ None | Standard Supabase password authentication | 🔴 **NOT IMPLEMENTED** |
| **16** | **Account Disable / Suspend** | Superadmin | Direct SQL `UPDATE user_person_identities SET status = 'SUSPENDED'` | ❌ None | `get_auth_person_id()` checks `status = 'ACTIVE'`; inactive accounts fail closed | 🟡 **BACKEND ONLY** |

---

## 4. Responsibility Matrix (Operational Authority vs Implementation)

Legend:
- 🟢 **GREEN**: Fully supported in UI, Application Logic, and PostgreSQL RLS.
- 🟡 **YELLOW**: Supported in Database Schema / RLS / RPC, but **lacks UI implementation** or requires manual invocation.
- 🔴 **RED**: Not supported by current software baseline (requires developer / service-role intervention).
- ⚪ **N/A**: Not applicable to this persona.

| Operational Action | Foundation / Yayasan Superadmin | School Headmaster | Classroom Teacher | Guardian / Parent | Student |
|---|:---:|:---:|:---:|:---:|:---:|
| **Create School Unit** | 🔴 RED (SQL only) | ⚪ N/A | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Update School Profile** | 🔴 RED (SQL only) | 🔴 RED (SQL only) | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Create / Configure Academic Year** | 🔴 RED (SQL only) | 🔴 RED (SQL only) | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Activate Academic Year** | 🔴 RED (SQL only) | 🔴 RED (SQL only) | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Close Academic Year** | 🔴 RED (SQL only) | 🔴 RED (SQL only) | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Create Class (Rombel)** | 🟡 YELLOW (RLS pass, no UI) | 🟡 YELLOW (RLS pass, no UI) | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Assign Homeroom Teacher** | 🟡 YELLOW (RLS pass, no UI) | 🟡 YELLOW (RLS pass, no UI) | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Create Teacher Person & Profile** | 🔴 RED (RLS blocks Person INSERT) | 🔴 RED (RLS blocks Person INSERT) | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Create Student Person & Profile** | 🔴 RED (RLS blocks Person INSERT) | 🔴 RED (RLS blocks Person INSERT) | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Place Student in Class (Placement)** | 🟡 YELLOW (RPC pass, no UI) | 🟡 YELLOW (RPC pass, no UI) | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Create Guardian Person & Link** | 🔴 RED (RLS blocks Person INSERT) | 🔴 RED (RLS blocks Person INSERT) | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Provision Supabase Auth User** | 🔴 RED (`seed_auth.mjs` only) | ⚪ N/A | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **First Login (Email / Password)** | 🟢 GREEN | 🟢 GREEN | 🟢 GREEN | 🟢 GREEN | ⚪ N/A |
| **Password Change** | 🔴 RED | 🔴 RED | 🔴 RED | 🔴 RED | ⚪ N/A |
| **Suspend / Disable User** | 🟡 YELLOW (SQL update to status) | ⚪ N/A | ⚪ N/A | ⚪ N/A | ⚪ N/A |
| **Create Learning Activity (RPPH)** | ⚪ N/A | ⚪ N/A | 🟢 GREEN | ⚪ N/A | ⚪ N/A |
| **Record Daily Attendance Batch** | ⚪ N/A | ⚪ N/A | 🟢 GREEN | ⚪ N/A | ⚪ N/A |
| **Record Anecdotal Observation** | ⚪ N/A | ⚪ N/A | 🟢 GREEN | ⚪ N/A | ⚪ N/A |
| **Draft LPPA Progress Report** | ⚪ N/A | ⚪ N/A | 🟢 GREEN | ⚪ N/A | ⚪ N/A |
| **Submit Report for Review** | ⚪ N/A | ⚪ N/A | 🟢 GREEN | ⚪ N/A | ⚪ N/A |
| **Approve LPPA Progress Report** | 🟢 GREEN (Supervisory override) | 🟢 GREEN | ⚪ N/A (Forbidden) | ⚪ N/A | ⚪ N/A |
| **Publish LPPA Progress Report** | 🟢 GREEN (Supervisory override) | 🟢 GREEN | ⚪ N/A (Forbidden) | ⚪ N/A | ⚪ N/A |
| **Send Guardian Notice (Buku Penghubung)** | ⚪ N/A | 🟢 GREEN | 🟢 GREEN | ⚪ N/A | ⚪ N/A |
| **Acknowledge Notice** | ⚪ N/A | ⚪ N/A | ⚪ N/A | 🟢 GREEN | ⚪ N/A |
| **View Audit Trail** | 🟢 GREEN | 🟢 GREEN (School scoped) | ⚪ N/A | ⚪ N/A | ⚪ N/A |

---

## 5. Entity & Data Lifecycle Discovery

### Entity Dependency Hierarchy
```
schools
  ├── academic_years (requires school_id)
  │     └── classes (requires school_id, academic_year_id, homeroom_teacher_id)
  │           └── learning_activities (requires school_id, class_id)
  │
  ├── persons (Canonical Root)
  │     ├── governance_profiles (requires person_id)
  │     ├── staff_profiles (requires person_id, school_id)
  │     ├── teacher_profiles (requires person_id, school_id)
  │     ├── students (requires person_id, school_id, current_class_id)
  │     │     ├── daily_attendance (requires school_id, class_id, student_id, date)
  │     │     ├── observation_records (requires school_id, class_id, student_id, observer_person_id)
  │     │     └── student_progress_reports (requires school_id, student_id, academic_year_id, evaluated_by_person_id)
  │     └── guardian_relationships (requires student_person_id, guardian_person_id)
  │           └── guardian_notices (requires school_id, student_id, author_person_id, recipient_person_id)
  │
  └── user_person_identities (requires auth.users.id, person_id)
```

### Dependency Reality Check
- In PostgreSQL schema: Foreign key constraints strictly enforce this hierarchy (`ON DELETE CASCADE` or `ON DELETE SET NULL`).
- In Application Runtime: If a record higher in the hierarchy is missing (e.g., `persons` row not linked to `auth.users`), the runtime fails closed with `AUTHENTICATED_NO_PERSON` or `UNAUTHENTICATED`.

---

## 6. Authentication Lifecycle Discovery

Answers to the 13 Specific Operational Questions:

1. **Who creates the Auth user?**  
   *Current Reality:* The developer/administrator running `scripts/seed_auth.mjs` using the Supabase Service Role Key via `supabase.auth.admin.createUser()`. No UI exists for creating Auth users.
2. **Who links Auth user to person identity?**  
   *Current Reality:* `scripts/seed_auth.mjs` directly executes an upsert into `user_person_identities` table using the service role key. Client accounts cannot insert or update `user_person_identities` (RLS policy enforces `false`).
3. **How is role assigned?**  
   *Current Reality:* Role is **not** stored as a string in `auth.users.app_metadata`. Instead, `context.tsx` dynamically evaluates the database:
   - If `governance_profiles` has active row $\rightarrow$ `YAPENDIK_SUPERADMIN`.
   - Else if `staff_profiles` has active row $\rightarrow$ `HEADMASTER` or `STAFF`.
   - Else if `teacher_profiles` has active row $\rightarrow$ `TEACHER`.
   - Else if `guardian_relationships` has active row $\rightarrow$ `GUARDIAN`.
4. **How is school scope assigned?**  
   *Current Reality:* Dynamically resolved from `staff_profiles.school_id` or `teacher_profiles.school_id`. For Superadmin, active school defaults to `sch_tk_yapendik_01` and can be switched dynamically in the UI.
5. **How is class scope assigned?**  
   *Current Reality:* Resolved dynamically by querying `classes` where `homeroom_teacher_id = mappedPersonId` or `co_teacher_id = mappedPersonId`.
6. **How is the initial credential generated?**  
   *Current Reality:* Environment variable `PILOT_SEED_DEFAULT_PASSWORD` (configured in `.env.local`).
7. **How is the credential delivered?**  
   *Current Reality:* Manual institutional handover (out-of-band communication). No email SMTP invitation or SMS dispatch is configured in frontend.
8. **What happens on first login?**  
   *Current Reality:* The user enters email & password on the "Masuk Akun Supabase (Resmi)" tab. `supabase.auth.signInWithPassword()` succeeds, `onAuthStateChange` fires, `get_auth_person_id()` resolves the person ID, and the application loads the specific role workspace.
9. **Is password change mandatory on first login?**  
   *Current Reality:* **No.** No password expiration or mandatory change flag exists in the application.
10. **What happens if password is forgotten?**  
    *Current Reality:* No "Forgot Password" self-service workflow is present in the UI. Requires administrative reset via Supabase Cloud Dashboard.
11. **What happens when an account is disabled?**  
    *Current Reality:* Setting `status = 'INACTIVE'` or `'SUSPENDED'` in `user_person_identities` causes `get_auth_person_id()` to return `NULL`. The client immediately halts with `AUTHENTICATED_NO_PERSON`.
12. **What happens when a teacher moves schools?**  
    *Current Reality:* Updating `teacher_profiles.school_id` and `classes.homeroom_teacher_id` in the database immediately shifts the teacher's operational context. No UI exists for this transfer.
13. **What happens when a guardian has multiple children?**  
    *Current Reality:* `guardian_relationships` supports multiple rows for the same `guardian_person_id`. `context.tsx` collects all `student_person_id` values into `guardianChildrenPersonIds: string[]`. `EnrollmentWorkspace`, `ObservationWorkspace`, and `CommunicationWorkspace` filter across all linked children.

---

## 7. Pilot Data Bootstrap Audit

Classification of every data entity currently existing in the pilot environment:

| Entity | Primary Identification | Classification | Current Origin / Population Mechanism |
|---|---|:---:|---|
| **Schools** | `sch_tk_yapendik_01`, `sch_tk_yapendik_02` | **SEEDED** | `supabase_schema.sql` (line 413) & `seed.ts` |
| **Academic Years** | `ay_2026_2027_ganjil`, `ay_2026_2027_ganjil_02` | **SEEDED** | `supabase_schema.sql` (line 424) & `seed.ts` |
| **Classes** | `cls_tka_01`, `cls_tkb_01`, `cls_tka_02` | **SEEDED** | `supabase_schema.sql` (line 430) & `seed.ts` |
| **Persons (Staff)** | `per_superadmin_andreas`, `per_headmaster_esther` | **SEEDED** | `supabase_schema.sql` (line 399, 401) & `seed.ts` |
| **Persons (Teachers)** | `per_teacher_siti`, `per_teacher_maria`, `per_teacher_diana` | **SEEDED** | `supabase_schema.sql` (line 397, 398, 400) & `seed.ts` |
| **Persons (Guardians)** | `per_parent_budi`, `per_parent_dewi`, `per_parent_hendra` | **SEEDED** | `supabase_schema.sql` (line 402, 403, 404) & `seed.ts` |
| **Persons (Students)** | `per_child_kenzo`, `per_child_alina`, `per_child_gabriel`, `per_child_keisha`, `per_child_rafael` | **SEEDED** | `supabase_schema.sql` (line 405..409) & `seed.ts` |
| **Profiles** | `teacher_profiles`, `staff_profiles`, `governance_profiles` | **SEEDED** | `supabase_schema.sql` & `pilot_seed_v2_1_5.sql` |
| **Students** | `stu_kenzo_01` .. `stu_rafael_05` | **SEEDED** | `supabase_schema.sql` (line 437..443) & `seed.ts` |
| **Guardian Links** | `rel_kenzo_budi`, `rel_kenzo_dewi`, `rel_alina_hendra` | **SEEDED** | `supabase_schema.sql` (line 446..450) & `seed.ts` |
| **Milestones** | `ms_nam_01` .. `ms_seni_01` (6 Kurikulum Merdeka domains) | **SEEDED** | `supabase_schema.sql` (line 453..460) & `seed.ts` |
| **Learning Activities** | Sentra RPPH records | **REAL UI WORKFLOW** | Initial fixtures seeded; new records creatable via UI modal |
| **Daily Attendance** | Attendance entries with temperature & arrival mood | **REAL UI WORKFLOW** | Initial fixtures seeded; new batches recorded via UI table |
| **Observations** | Anecdotal observation notes & milestone ratings | **REAL UI WORKFLOW** | Initial fixtures seeded; new records creatable via UI modal |
| **LPPA Reports** | Student developmental progress reports | **REAL UI WORKFLOW** | Creatable & state-transitioned via UI through 4 stages |
| **Guardian Notices** | Buku Penghubung announcements & daily summaries | **REAL UI WORKFLOW** | Initial fixtures seeded; new notices & acknowledgments via UI |
| **Audit Logs** | Immutable system event records | **GENERATED** | Automatically generated by PostgreSQL triggers and RPCs |

---

## 8. Current UI vs Seeded Data Analysis

### Workspace-by-Workspace Reality Matrix

```
┌──────────────────────────────────────┬────────────────────────┬──────────────────────────────────────────┐
│ Workspace Component                  │ Operational Mode       │ Administrative / Setup Capability        │
├──────────────────────────────────────┼────────────────────────┼──────────────────────────────────────────┤
│ TeacherDailyWorkWorkspace.tsx        │ 🟢 Read & Write        │ Creates RPPH learning activities         │
│ AttendanceWorkspace.tsx              │ 🟢 Read & Write        │ Records daily class attendance batches   │
│ ObservationWorkspace.tsx             │ 🟢 Read & Write        │ Creates anecdotal observation records    │
│ DevelopmentWorkspace.tsx             │ 🟢 Read & Write (RPC)  │ Drafts, submits, approves, publishes LPPA│
│ CommunicationWorkspace.tsx           │ 🟢 Read & Write        │ Sends notices & confirms acknowledgments │
│ AuthorizationTestingWorkspace.tsx    │ 🟢 Security Evaluation │ Interactive security & RLS test matrix   │
│ EnrollmentWorkspace.tsx              │ 🔴 READ-ONLY           │ ❌ CANNOT add students, edit, or enroll  │
│ SchoolReviewWorkspace.tsx            │ 🔴 READ-ONLY           │ ❌ CANNOT create schools, years, classes │
└──────────────────────────────────────┴────────────────────────┴──────────────────────────────────────────┘
```

---

## 9. Authorization Findings

1. **Contextual Engine Accuracy:** The in-memory `PolicyEvaluator` (`src/auth/authorization.ts`) and PostgreSQL RLS policies (`db_migrations/rls_migration_v2_1_5_hardened.sql`) are **100% harmonized**.
2. **Staff Confidentiality Boundary:** Proven functional at both PostgreSQL RLS level and UI query projection level (`is_confidential_to_staff` observations are inaccessible to guardians).
3. **Cross-School Isolation:** Zero cross-school leakage exists. Teacher Diana (TK 02) cannot observe or mutate TK 01 records.
4. **State Machine Integrity:** Published LPPA reports cannot be modified or deleted (`trg_report_published_immutability`).

---

## 10. Security Boundary Findings

1. **Client Privilege Revocation on Canonical Person Creation:**
   - In `db_migrations/rls_migration_v2_1_5_hardened.sql` (Line 316):
     ```sql
     REVOKE ALL ON persons FROM anon, authenticated;
     GRANT SELECT, UPDATE ON persons TO authenticated;
     ```
   - *Security Implication:* No authenticated user (even Superadmin or Headmaster) can execute `INSERT INTO persons` directly from the client. This is a deliberate defense-in-depth measure to prevent unverified identity creation, but it means **a dedicated SECURITY DEFINER RPC is required for operational person registration**.
2. **Client Lockdown on Auth Mappings:**
   - `user_person_identities` has RLS enabled with `USING (false)` and all permissions revoked from `authenticated`. Only service-role scripts or SECURITY DEFINER functions can map auth accounts.
3. **Student Placement Guard:**
   - Direct UPDATE to `students.current_class_id` is blocked by `trg_student_placement_guard`. All class placements must go through `rpc_place_student_in_class`.

---

## 11. Operational Gaps Register

The following table registers all operational gaps discovered between target institutional operations and current software implementation:

| Gap ID | Domain | Description | Evidence in Repository | Operational Implication | Severity | Pilot Remediation Required? |
|---|---|---|---|---|:---:|:---:|
| **GAP-01** | School Administration | No UI/RPC to create or edit School units | `SchoolReviewWorkspace.tsx` has no create/edit forms; `INSERT ON schools` revoked | Foundation must ask DBA/developer to insert new school units | 🟡 Medium | ❌ No (Pilot is fixed to TK 01 & TK 02) |
| **GAP-02** | Academic Calendar | No UI/RPC to create, activate, or close Academic Years | `academic_years` table has no INSERT/UPDATE grant to client | Headmaster cannot rollover semester without database intervention | 🟡 Medium | ❌ No (Pilot uses 2026/2027 Ganjil) |
| **GAP-03** | Roster Management | No UI/RPC to create new Classes (Rombel) | `classes` table has RLS policy but `EnrollmentWorkspace` and `SchoolReviewWorkspace` have no form | Headmaster cannot add a new class section via UI | 🟡 Medium | ❌ No (Pilot uses Kelompok A & B) |
| **GAP-04** | Identity Registration | No RPC/UI to register new Person + Teacher/Student/Guardian | `INSERT ON persons` is revoked from authenticated roles | Adding a new student or teacher requires SQL seed script | 🔴 High | 🟡 Optional for Pilot (Pre-seeded), Essential for Post-Pilot |
| **GAP-05** | User Provisioning | No self-service or admin UI to provision Supabase Auth users | `scripts/seed_auth.mjs` requires local Node execution with Service Role Key | Onboarding a new teacher requires running Node CLI script | 🔴 High | ❌ No (6 pilot identities provisioned) |
| **GAP-06** | Student Class Placement | RPC `rpc_place_student_in_class` exists in SQL, but has no UI trigger in `EnrollmentWorkspace` | `EnrollmentWorkspace.tsx` lacks placement dropdown/modal | Headmaster cannot reassign student class via UI without dev console | 🟡 Medium | ❌ No (Pilot rosters already placed) |
| **GAP-07** | Credential Lifecycle | No password change, password reset, or account claim flow | `App.tsx` and `context.tsx` have login/logout only | Users cannot update their initial default password | 🟡 Medium | ❌ No (Acceptable for closed pilot) |

---

## 12. Governance Gaps Register

| Gap ID | Governance Domain | Constitutional Principle | Current State | Governance Risk | Recommended Governance Resolution |
|---|---|---|---|---|---|
| **GOV-01** | Institutional Identity | Article 13 (Decoupled Person) | Person creation requires database direct intervention | High risk of schema inconsistency if created manually | Design `rpc_register_institutional_person` for post-pilot |
| **GOV-02** | Credential Custody | Article 5.2 (Stewardship) | Seed passwords shared across pilot identities via `.env.local` | Credential collision risk if unmanaged | Require human participants to use designated pilot credentials |
| **GOV-03** | UAT Scope Definition | Release Governance | Journeys UAT-01..06 tested daily runtime, not onboarding | Confusing runtime readiness with operational setup autonomy | Define separate **PIJ (Pilot Institutional Journey)** series for Onboarding |

---

## 13. Recommended Operational Onboarding Model (Post-Pilot Blueprint)

For Phase 2 (Full Institutional Rollout), the following architecture is recommended:

```
[Foundation Admin UI]
       │
       ▼
rpc_create_school_unit() ──► INSERT schools, academic_years
       │
[Headmaster Onboarding Wizard]
       │
       ├──► rpc_create_class_section() ──► INSERT classes
       ├──► rpc_register_staff_member() ──► INSERT persons, teacher_profiles, invite auth
       ├──► rpc_register_student_and_guardian() ──► INSERT persons (student), persons (guardian),
       │                                            INSERT students, guardian_relationships,
       │                                            rpc_place_student_in_class()
       └──► rpc_send_guardian_invitations() ──► Supabase Auth invite magic links
```

---

## 14. Proposed Pilot Institutional Journey (PIJ) Inventory

To test operational onboarding separately from daily runtime UAT, the following **PIJ (Pilot Institutional Journeys)** are proposed for future development:

- **PIJ-01 (Foundation Setup):** Foundation Superadmin creates a new school unit, configures NPSN, assigns Headmaster.
- **PIJ-02 (Academic Calendar Setup):** Headmaster initializes academic year 2026/2027 Ganjil and sets date boundaries.
- **PIJ-03 (Classroom Infrastructure):** Headmaster creates class sections (Kelompok A & Kelompok B) with capacity limits.
- **PIJ-04 (Teacher Registration & Homeroom Assignment):** Headmaster registers teacher identities and assigns them to rombel.
- **PIJ-05 (Student Admissions & Enrollment):** Headmaster registers incoming students and assigns initial class placements.
- **PIJ-06 (Guardian Linking & Account Provisioning):** Headmaster links parents to students and triggers authentication invites.

---

## 15. Questions Requiring Human Governance Decision

Before any post-pilot engineering or modification to V2.1.5:

1. **Governance Scope Decision:** Does Yapendik Foundation intend for TK Pilot v1.0 to proceed with the **pre-seeded institutional environment** (6 verified identities, 2 classes, 5 students), OR does the Foundation require operational onboarding UI to be built before pilot go-live?
   - *Architect Recommendation:* Proceed with current frozen V2.1.5 for the 6-week TK Pilot using pre-seeded rosters; schedule administrative onboarding UI for v1.1.
2. **Credential Handover Protocol:** How should the 6 pre-provisioned Supabase accounts be securely handed over to the real human participants for human UAT?
3. **Institutional Sign-Off Authority:** Who are the designated signatories for the final Gate 6 acceptance document?

---

## 16. Explicit "NOT YET TESTED" Areas

The following operational areas are explicitly **NOT YET TESTED** because they are not implemented in the current frontend UI:

- [ ] Dynamic creation of a new School unit via UI.
- [ ] Dynamic creation and rollover of Academic Years via UI.
- [ ] Dynamic creation of Classes (Rombel) via UI.
- [ ] Dynamic admission / registration of new Students via UI.
- [ ] Dynamic registration and class assignment of new Teachers via UI.
- [ ] Dynamic registration and relationship linking of new Guardians via UI.
- [ ] Self-service password reset and user invitation via email.
- [ ] Student transfer between schools or graduation workflows.

---

*Report compiled by Senior Product & Governance Architecture Team.*  
*Status: Discovery Phase 8 Complete — Stopped.*
