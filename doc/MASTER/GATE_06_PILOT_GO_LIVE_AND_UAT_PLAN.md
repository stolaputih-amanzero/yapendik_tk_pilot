# YAPENDIK SCHOOL OS — TK PILOT v1.0
# GATE 6 EXECUTION PLAN: PILOT GO-LIVE, USER ONBOARDING & INSTITUTIONAL ACCEPTANCE (UAT)

**Document ID:** `YAPENDIK-GATE06-PLAN-2026-001`  
**Governance Authority:** Yapendik OS Constitution & Architecture Review Board  
**Authoritative Software Baseline:** V2.1.5 Definitive Production Baseline (🔒 FROZEN)  
**Governance Status:** Yapendik OS Constitution — LIVING / ACTIVE GOVERNANCE  
**Target Pilot Institution:** TK Yapendik 01 (Maranatha) & Isolation Unit TK Yapendik 02  
**Target Cloud Endpoint:** `https://diliqtfgzxmjvwzczdcx.supabase.co`  
**Plan Date:** 2026-08-25  

---

```
════════════════════════════════════════════════════════════════════════════════
                      YAPENDIK SCHOOL OS (TK PILOT v1.0)
             GATE 6 — PILOT GO-LIVE, UAT & INSTITUTIONAL ACCEPTANCE
════════════════════════════════════════════════════════════════════════════════

  Transition       : ENGINEERING CERTIFICATION (Gate 0-5) ──► INSTITUTIONAL ACCEPTANCE
  Software Baseline: V2.1.5 Definitive Production Baseline — 🔒 FROZEN
  Primary Focus    : Real-world human journeys, pedagogical workflow & feedback
  Acceptance Rule  : Zero P0 Security / Zero Isolation Leakage / Core Workflow Pass

────────────────────────────────────────────────────────────────────────────────
GOAL: Establish the operational bridge between frozen pilot software and
institutional learning, leading to verified institutional acceptance.
════════════════════════════════════════════════════════════════════════════════
```

---

## 1. Executive Summary & Governance Intent

The technical deployment gates (Gate 0 through Gate 5) have conclusively certified that **Yapendik School OS — TK Pilot v1.0** is technically secure, mathematically compliant with PostgreSQL Row-Level Security, and cleanly deployable.

**Gate 6** represents the formal transition from **Engineering Verification** to **Institutional Acceptance**. The objective of Gate 6 is not to invent new software features or modify the frozen V2.1.5 codebase, but to:
1. Safely onboard the six (6) real kindergarten pilot participants.
2. Execute systematic User Acceptance Testing (UAT) across all contextual roles.
3. Validate multi-school isolation and child privacy boundaries in real browser environments.
4. Establish structured field observation protocols to capture pedagogical insights for **School OS v2.0**.
5. Obtain formal **Institutional Sign-Off** for live pilot operations.

---

## 2. The Three-Layer Gate 6 Operating Model

$$\begin{array}{c}
\textbf{YAPENDIK SCHOOL OS TK PILOT} \\
\Downarrow \\
\begin{array}{|c|}
\hline
\textbf{GATE 6: PILOT GO-LIVE \& ACCEPTANCE} \\
\hline
\end{array} \\
\Downarrow
\end{array}$$
$$\begin{array}{ccc}
\begin{array}{|c|}
\hline
\textbf{LAYER 1: USER ONBOARDING} \\
\hline
\text{Secure Credential Handover} \\
\text{First-Login Password Reset} \\
\text{Device Context Verification} \\
\hline
\end{array}
&
\begin{array}{|c|}
\hline
\textbf{LAYER 2: ROLE-BASED UAT} \\
\hline
\text{6 Persona Journey Validation} \\
\text{End-to-End Workflow Pass} \\
\text{Multi-School Isolation Check} \\
\hline
\end{array}
&
\begin{array}{|c|}
\hline
\textbf{LAYER 3: FIELD OBSERVATION} \\
\hline
\text{CAT-A to CAT-I Feedback} \\
\text{P0 - P3 Defect Triage} \\
\text{School OS v2.0 Learning Loop} \\
\hline
\end{array}
\end{array}$$
$$\Downarrow$$
$$\begin{array}{|c|}
\hline
\textbf{INSTITUTIONAL SIGN-OFF (FOUNDATION \& SCHOOL LEADERSHIP)} \\
\Downarrow \\
\mathbf{\color{green}\text{🟢 TK PILOT LIVE}} \\
\hline
\end{array}$$

---

## 3. Layer 1: Pilot User Onboarding & Credential Governance

### 3.1. Mandatory Precondition: Secret Invalidation & Password Reset
In accordance with operational security hygiene:
1. **Compromised Key Prohibition:** The temporary fixture seed password used during initial testing is formally invalidated and must never be distributed to human users.
2. **Fresh Credential Issuance:** The cloud administrator generates a distinct, cryptographically strong temporary password for each pilot user directly via the Supabase Auth Dashboard.
3. **First-Login Mandate:** Each user must perform a password change upon initial login.
4. **Zero Chat/Git Exposure:** Live user passwords must never be pasted in chat, committed to Git, or stored in documentation.

### 3.2. Pilot Persona Onboarding Roster

| Persona Identifier | Human Participant | Canonical Role | Contextual Assignment | Primary Workstation / Device |
|---|---|---|---|---|
| `user_superadmin_yapendik` | Dr. Andreas Hendrawan | `YAPENDIK_SUPERADMIN` | Foundation Governance | Desktop / Laptop (Admin Console) |
| `user_headmaster_esther` | Dra. Esther Nugroho, M.Pd | `HEADMASTER` | TK 01 (Supervisory) | Desktop / Tablet (Review Workspace) |
| `user_teacher_siti` | Siti Rahmawati, S.Pd | `TEACHER` | TK A (`cls_tka_01`) | Tablet / Mobile / Desktop (Classroom) |
| `user_teacher_maria` | Maria Magdalena, S.Pd.Aud | `TEACHER` | TK B (`cls_tkb_01`) | Tablet / Mobile / Desktop (Classroom) |
| `user_teacher_diana_tk2` | Diana Sari, S.Pd | `TEACHER` | TK 02 (`cls_tka_02`) | Tablet / Desktop (Cross-School Boundary) |
| `user_parent_budi` | Budi Santoso, S.T. | `GUARDIAN` | Kenzo Pratama (Child) | Mobile Smartphone (Parent Portal) |

---

## 4. Layer 2: User Acceptance Testing (UAT) Matrix

### 4.1. Core End-to-End Kindergarten Workflow
The complete pedagogical and operational lifecycle must execute without friction:

$$\text{Auth Login} \rightarrow \text{Context Resolution} \rightarrow \text{Class Roster} \rightarrow \text{Daily Attendance} \rightarrow \text{Activity \& Observation} \rightarrow \text{LPPA Draft} \rightarrow \text{Headmaster Approval} \rightarrow \text{Publish} \rightarrow \text{Guardian View}$$

### 4.2. Detailed Role-Based Acceptance Scenarios

| Test Code | Target Role | Persona | Specific User Journey & Acceptance Criteria | Expected Outcome |
|---|---|---|---|---|
| **UAT-01** | Superadmin | Andreas Hendrawan | 1. Login with Foundation account.<br>2. Inspect cross-school analytics dashboard.<br>3. Verify audit log trail entries.<br>4. Validate read-only visibility over TK 01 and TK 02 without mutating classroom records. | Foundation oversight active; audit trail immutable. |
| **UAT-02** | Headmaster | Esther Nugroho | 1. Login with Headmaster account.<br>2. Review pending LPPA Progress Reports for TK A and TK B.<br>3. Approve report `READY_FOR_REVIEW` $\rightarrow$ `APPROVED`.<br>4. Publish report $\rightarrow$ verify state becomes `PUBLISHED` and locked against further edit.<br>5. Execute student class placement via trusted RPC. | Full supervisory authority exercised; immutability enforced. |
| **UAT-03** | Teacher (TK A) | Siti Rahmawati | 1. Login with Teacher account.<br>2. Submit batch daily attendance for TK A (`cls_tka_01`).<br>3. Record daily learning activity & developmental observation.<br>4. Create confidential staff note (`is_confidential_to_staff = true`).<br>5. Create shared guardian note (`shared_with_guardian = true`).<br>6. Draft LPPA report $\rightarrow$ submit for review (`DRAFT` $\rightarrow$ `READY_FOR_REVIEW`). | Class TK A managed smoothly; unassigned class TK B creation denied. |
| **UAT-04** | Teacher (TK B) | Maria Magdalena | 1. Login with Teacher account.<br>2. Verify access to TK B (`cls_tkb_01`).<br>3. Submit attendance and developmental milestones for 5-6 age group.<br>4. Attempt to edit published report $\rightarrow$ verify UI disables edit button. | Class TK B workflow pass; published reports immutable. |
| **UAT-05** | Isolation Teacher | Diana Sari (TK 02) | 1. Login with TK 02 account.<br>2. View TK 02 class roster.<br>3. Attempt to navigate or query TK 01 data $\rightarrow$ verify UI & RLS block access with `DENY_CROSS_SCHOOL`. | Multi-school tenant isolation 100% enforced. |
| **UAT-06** | Guardian | Budi Santoso | 1. Login with Guardian mobile account.<br>2. Access Parent Workspace for child Kenzo Pratama.<br>3. View shared learning observations and published LPPA report.<br>4. Verify staff-confidential observations are **completely invisible**.<br>5. Verify records of other children are **completely invisible**. | Child privacy & data minimization strictly preserved. |

### 4.3. Real-Device & Multi-Form-Factor Validation
- **Desktop Browsers:** Google Chrome, Microsoft Edge (1920x1080 & 1366x768).
- **Mobile & Tablet:** iOS Safari (iPad / iPhone), Android Chrome (Samsung Tablet / Smartphone).
- **Session Lifecycles:** Verify session recovery after backgrounding browser, offline reconnection toast, and complete local cache purge upon user logout.

---

## 5. Layer 3: Field Observation & Defect Triage Protocol

### 5.1. Classification of Field Findings
All observations captured during the pilot operation are classified into standardized governance categories:

$$\begin{array}{|c|l|l|}
\hline
\textbf{Category} & \textbf{Classification} & \textbf{Governance Action} \\
\hline
\text{CAT-A} & \textbf{Software Bug} & \text{Targeted defect fix under Change Control} \\
\text{CAT-B} & \textbf{Security / Privacy Incident} & \text{Immediate containment $\rightarrow$ P0 Stop Condition} \\
\text{CAT-C} & \textbf{UX / Friction Finding} & \text{Usability enhancement backlog} \\
\text{CAT-D} & \textbf{Workflow Mismatch} & \text{Operational adjustment / ADR analysis} \\
\text{CAT-E} & \textbf{Data Model Gap} & \text{Input for School OS v2.0 specification} \\
\text{CAT-F} & \textbf{LPPA Report Format Gap} & \text{Curricular review with Headmaster} \\
\text{CAT-G} & \textbf{Pedagogical Insight} & \text{Learning capture for early childhood education} \\
\text{CAT-H} & \textbf{Governance Insight} & \text{Policy refinement for Foundation board} \\
\text{CAT-I} & \textbf{Future Feature Request} & \text{School OS v2.0 Enterprise Backlog} \\
\hline
\end{array}$$

### 5.2. Defect Severity & Stop Conditions

- **P0 — Critical Security / Isolation Defect:** Cross-school data leak, guardian privacy bypass, role escalation.  
  $$\textbf{Action:} \text{ Immediate Pilot Halt } \longrightarrow \text{ Emergency Patch } \longrightarrow \text{ 28-Point Regression } \longrightarrow \text{ Re-Audit}$$
- **P1 — Core Workflow Blocker:** Attendance submission crash, report approval state machine freeze.  
  $$\textbf{Action:} \text{ Fix before institutional sign-off } \longrightarrow \text{ Regression Gate Passed}$$
- **P2 — Non-Blocking Usability Issue:** Minor alignment discrepancy, dropdown ordering preference.  
  $$\textbf{Action:} \text{ Log in Pilot Ledger } \longrightarrow \text{ Decide with Headmaster}$$
- **P3 — Future Enhancement:** Advanced graphing, export format options.  
  $$\textbf{Action:} \text{ Defer to School OS v2.0}$$

---

## 6. Institutional Sign-Off Criteria (Gate 6 Pass Rule)

The pilot is officially certified as **🟢 ACCEPTED / LIVE** when all the following criteria are satisfied:

$$\begin{array}{|c|l|c|}
\hline
\textbf{No} & \textbf{Acceptance Criterion} & \textbf{Mandatory Standard} \\
\hline
1 & \textbf{Security Invariants} & \text{Zero P0 Security or Privacy Defects} \\
2 & \textbf{Multi-School Isolation} & \text{100\% isolation verified between TK 01 and TK 02} \\
3 & \textbf{Authentication Acceptance} & \text{All 6 pilot personas successfully authenticated with fresh passwords} \\
4 & \textbf{Core Workflow Acceptance} & \text{Attendance, Observation, LPPA State Machine executed end-to-end} \\
5 & \textbf{Guardian Privacy} & \text{Zero confidential staff notes visible to parent account} \\
6 & \textbf{Educator Sign-Off} & \text{TK A \& TK B Teachers accept daily classroom usability} \\
7 & \textbf{Leadership Sign-Off} & \text{Headmaster accepts LPPA supervisory and approval workflow} \\
8 & \textbf{Foundation Sign-Off} & \text{Superadmin accepts governance and audit trail visibility} \\
\hline
\end{array}$$

---

## 7. Knowledge Transfer Loop: Pilot Learning $\rightarrow$ School OS v2.0

$$\text{Frozen V2.1.5 Baseline} \xrightarrow{\text{Gate 6 Live Pilot}} \text{Real Field Observation} \xrightarrow{\text{Evidence Ledger}} \text{Governance Review} \xrightarrow{\text{Formal ADR}} \text{\textbf{School OS v2.0}}$$

*Living Constitution Principle:* The software baseline remains locked to ensure stability during the pilot. However, institutional learning is active and continuous. Every pedagogical insight and workflow nuance captured during Gate 6 directly informs the enterprise architecture of **Yapendik School OS v2.0** (expanding to SD, SMP, and SMA).

---
*Authored & Recommended for Execution,*  
**Yapendik OS Release Governance & Security Architecture Review Board**
