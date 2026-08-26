# YAPENDIK SCHOOL OS — TK PILOT v1.0
# GATE 6 HUMAN UAT EXECUTION CHECKLIST & OPERATIONAL RUNBOOK

**Document ID:** `YAPENDIK-GATE06-UAT-CHECKLIST-2026-001`  
**Governance Authority:** Yapendik OS Constitution & Architecture Review Board  
**Authoritative Software Baseline:** V2.1.5 Definitive Production Baseline (🔒 FROZEN)  
**Governance Status:** Yapendik OS Constitution — LIVING / ACTIVE GOVERNANCE  
**Target Pilot Institution:** TK Yapendik 01 (Maranatha) & Isolation Unit TK Yapendik 02  
**Target Cloud Endpoint:** `https://diliqtfgzxmjvwzczdcx.supabase.co`  
**Checklist Status:** 🟡 **OPEN / READY FOR IN-PERSON HUMAN EXECUTION**  

---

```
════════════════════════════════════════════════════════════════════════════════
                      YAPENDIK SCHOOL OS (TK PILOT v1.0)
                   HUMAN UAT EXECUTION CHECKLIST & RUNBOOK
════════════════════════════════════════════════════════════════════════════════

  Purpose          : Guide and record real human participant execution of UAT
  Software Baseline: V2.1.5 Definitive Production Baseline — 🔒 FROZEN
  Human Scope      : 6 Authorized Pilot Stakeholders across TK 01 and TK 02
  Governance Rule  : PASS requires actual human participant execution on physical devices

────────────────────────────────────────────────────────────────────────────────
GOVERNANCE INVARIANT:
Automated tests prove technical readiness.
Human UAT proves operational usability.
Institutional sign-off proves institutional acceptance.
════════════════════════════════════════════════════════════════════════════════
```

---

## 1. Security Preconditions Before Handover

Before handing devices and credentials to human participants:
- [ ] **Compromised Seed Password Invalidation:** Verify that the automated testing seed password is completely revoked and non-functional.
- [ ] **Fresh Random Credentials Generated:** Cloud administrator has generated individual, random temporary passwords directly in the Supabase Auth Dashboard.
- [ ] **Zero Credential Exposure:** No user passwords or admin keys are written into this document, Git, or communication channels.
- [ ] **First-Login Change Prompt:** Participants are instructed to update their password upon initial system entry.

---

## 2. The Six (6) Real-Human UAT Protocols

---

### UAT-01: Foundation Superadmin
- **Participant:** Dr. Andreas Hendrawan (`andreas@yapendik.sch.id`)
- **Assigned Role:** `YAPENDIK_SUPERADMIN` (Yayasan Pendidikan Kristen Yapendik)
- **Target Device:** Desktop / Laptop (Admin Workstation)

| Field | Record / Finding |
|---|---|
| **Execution Date & Time** | `[ PENDING HUMAN EXECUTION ]` |
| **Physical Device & OS** | `[ e.g., Windows 11 / macOS / iPad ]` |
| **Browser & Version** | `[ e.g., Chrome 128 / Edge 128 ]` |
| **Step 1: Auth Login** | [ ] Logged in successfully with fresh temporary password |
| **Step 2: Context Resolution** | [ ] Header displays "Dr. Andreas Hendrawan" & "Pengawas Mutu Yayasan" |
| **Step 3: Multi-Unit Oversight**| [ ] Can switch view between TK 01 and TK 02 overview metrics |
| **Step 4: Audit Trail Inspection**| [ ] Audit trail renders chronological event logs from PostgreSQL |
| **Step 5: Read-Only Governance**| [ ] Cannot create or overwrite classroom attendance/observation records |
| **Participant Feedback / Friction** | `[ Notes from Dr. Andreas ]` |
| **Participant Acceptance** | [ ] **ACCEPTED** &nbsp;&nbsp;&nbsp; [ ] **REJECTED** |
| **Tester Verification Signature** | `[ Operator Signature ]` |
| **Official UAT-01 Status** | 🟡 **NOT TESTED / HUMAN EXECUTION REQUIRED** |

---

### UAT-02: TK 01 Headmaster
- **Participant:** Dra. Esther Nugroho, M.Pd (`esther@yapendik.sch.id`)
- **Assigned Role:** `HEADMASTER` (TK Yapendik 01 Menteng)
- **Target Device:** Desktop / Laptop / Tablet

| Field | Record / Finding |
|---|---|
| **Execution Date & Time** | `[ PENDING HUMAN EXECUTION ]` |
| **Physical Device & OS** | `[ e.g., Windows 11 / iPadOS ]` |
| **Browser & Version** | `[ e.g., Safari / Chrome ]` |
| **Step 1: Auth Login** | [ ] Logged in successfully with fresh temporary password |
| **Step 2: Context Resolution** | [ ] Header displays "Dra. Esther Nugroho, M.Pd" & "Kepala Sekolah TK 01" |
| **Step 3: LPPA Review** | [ ] Reviews pending student progress reports in `READY_FOR_REVIEW` |
| **Step 4: Report Approval** | [ ] Approves report $\rightarrow$ State transitions to `APPROVED` |
| **Step 5: Report Publication** | [ ] Publishes report $\rightarrow$ State transitions to `PUBLISHED` |
| **Step 6: Immutability Test** | [ ] UI correctly locks report against editing or deletion after publication |
| **Step 7: Student Placement** | [ ] Places student in class via trusted administrative modal |
| **Participant Feedback / Friction** | `[ Notes from Dra. Esther ]` |
| **Participant Acceptance** | [ ] **ACCEPTED** &nbsp;&nbsp;&nbsp; [ ] **REJECTED** |
| **Tester Verification Signature** | `[ Operator Signature ]` |
| **Official UAT-02 Status** | 🟡 **NOT TESTED / HUMAN EXECUTION REQUIRED** |

---

### UAT-03: Teacher TK A (Kelompok Usia 4–5 Tahun)
- **Participant:** Siti Rahmawati, S.Pd (`siti@yapendik.sch.id`)
- **Assigned Role:** `TEACHER` (Wali Kelas TK A - `cls_tka_01`)
- **Target Device:** Classroom Tablet / Smartphone / Laptop

| Field | Record / Finding |
|---|---|
| **Execution Date & Time** | `[ PENDING HUMAN EXECUTION ]` |
| **Physical Device & OS** | `[ e.g., Android Tablet / iPad / Chrome ]` |
| **Browser & Version** | `[ e.g., Chrome Mobile / Safari ]` |
| **Step 1: Auth Login** | [ ] Logged in successfully with fresh temporary password |
| **Step 2: Context Resolution** | [ ] Header displays "Siti Rahmawati, S.Pd" & "TK A (Bintang Ceria)" |
| **Step 3: Class Roster** | [ ] Roster displays enrolled TK A students accurately |
| **Step 4: Batch Attendance** | [ ] Marks attendance (Hadir/Sakit/Izin), temperature, and mood $\rightarrow$ Saves |
| **Step 5: Learning Activity** | [ ] Creates new daily learning activity description |
| **Step 6: Developmental Observation**| [ ] Records 6-domain observation with milestone checklist |
| **Step 7: Confidential Staff Note** | [ ] Flags note as `is_confidential_to_staff = true` |
| **Step 8: Guardian Shared Note** | [ ] Flags note as `shared_with_guardian = true` |
| **Step 9: LPPA Drafting** | [ ] Compiles term LPPA draft and submits for review |
| **Step 10: Class Boundary Test** | [ ] Cannot record observation or attendance for TK B students |
| **Participant Feedback / Friction** | `[ Notes from Ibu Siti ]` |
| **Participant Acceptance** | [ ] **ACCEPTED** &nbsp;&nbsp;&nbsp; [ ] **REJECTED** |
| **Tester Verification Signature** | `[ Operator Signature ]` |
| **Official UAT-03 Status** | 🟡 **NOT TESTED / HUMAN EXECUTION REQUIRED** |

---

### UAT-04: Teacher TK B (Kelompok Usia 5–6 Tahun)
- **Participant:** Maria Magdalena, S.Pd.Aud (`maria@yapendik.sch.id`)
- **Assigned Role:** `TEACHER` (Wali Kelas TK B - `cls_tkb_01`)
- **Target Device:** Classroom Tablet / Smartphone / Laptop

| Field | Record / Finding |
|---|---|
| **Execution Date & Time** | `[ PENDING HUMAN EXECUTION ]` |
| **Physical Device & OS** | `[ e.g., Android Tablet / Laptop ]` |
| **Browser & Version** | `[ e.g., Chrome / Edge ]` |
| **Step 1: Auth Login** | [ ] Logged in successfully with fresh temporary password |
| **Step 2: Context Resolution** | [ ] Header displays "Maria Magdalena, S.Pd.Aud" & "TK B (Matahari)" |
| **Step 3: Class Roster & Attendance**| [ ] TK B students rendered; batch attendance saved |
| **Step 4: School Readiness Milestones**| [ ] Records literacy, numeracy, and social transition milestones |
| **Step 5: Immutability Verification**| [ ] Views published report $\rightarrow$ Confirms edit controls disabled |
| **Participant Feedback / Friction** | `[ Notes from Ibu Maria ]` |
| **Participant Acceptance** | [ ] **ACCEPTED** &nbsp;&nbsp;&nbsp; [ ] **REJECTED** |
| **Tester Verification Signature** | `[ Operator Signature ]` |
| **Official UAT-04 Status** | 🟡 **NOT TESTED / HUMAN EXECUTION REQUIRED** |

---

### UAT-05: Multi-School Isolation Teacher (TK Yapendik 02)
- **Participant:** Diana Sari, S.Pd (`diana@yapendik.sch.id`)
- **Assigned Role:** `TEACHER` (TK Yapendik 02 Kebayoran - `cls_tka_02`)
- **Target Device:** Tablet / Laptop

| Field | Record / Finding |
|---|---|
| **Execution Date & Time** | `[ PENDING HUMAN EXECUTION ]` |
| **Physical Device & OS** | `[ e.g., Windows Laptop / iPad ]` |
| **Browser & Version** | `[ e.g., Chrome / Safari ]` |
| **Step 1: Auth Login** | [ ] Logged in successfully with fresh temporary password |
| **Step 2: Context Resolution** | [ ] Header displays "Diana Sari, S.Pd" & "TK Yapendik 02 Kebayoran" |
| **Step 3: TK 02 Roster** | [ ] TK 02 student roster renders cleanly |
| **Step 4: Cross-School Isolation**| [ ] Attempting to access TK 01 data is rejected with `DENY_CROSS_SCHOOL` |
| **Step 5: Zero Data Leakage** | [ ] Zero student, class, attendance, or report rows from TK 01 appear in UI/cache |
| **Participant Feedback / Friction** | `[ Notes from Ibu Diana ]` |
| **Participant Acceptance** | [ ] **ACCEPTED** &nbsp;&nbsp;&nbsp; [ ] **REJECTED** |
| **Tester Verification Signature** | `[ Operator Signature ]` |
| **Official UAT-05 Status** | 🟡 **NOT TESTED / HUMAN EXECUTION REQUIRED** |

---

### UAT-06: Guardian / Parent (Ayah Kenzo Pratama)
- **Participant:** Budi Santoso, S.T. (`budi@yapendik.sch.id`)
- **Assigned Role:** `GUARDIAN` (Wali Murid Kenzo Pratama - TK A)
- **Target Device:** Mobile Smartphone (iOS / Android)

| Field | Record / Finding |
|---|---|
| **Execution Date & Time** | `[ PENDING HUMAN EXECUTION ]` |
| **Physical Device & OS** | `[ e.g., iPhone iOS 17 / Android 14 ]` |
| **Browser & Version** | `[ e.g., Safari Mobile / Chrome Mobile ]` |
| **Step 1: Auth Login** | [ ] Logged in successfully with fresh temporary password |
| **Step 2: Context Resolution** | [ ] Portal displays "Budi Santoso, S.T." & "Wali Murid (Kenzo Pratama)" |
| **Step 3: Shared Learning Timeline**| [ ] Can view shared learning activities and non-confidential observations |
| **Step 4: Published LPPA Report**| [ ] Can view published term report card for Kenzo |
| **Step 5: Confidential Note Guard**| [ ] Staff-confidential notes (`is_confidential_to_staff = true`) are **100% INVISIBLE** |
| **Step 6: Cross-Student Privacy**| [ ] Records of other children in TK A are **100% INVISIBLE** |
| **Participant Feedback / Friction** | `[ Notes from Bapak Budi ]` |
| **Participant Acceptance** | [ ] **ACCEPTED** &nbsp;&nbsp;&nbsp; [ ] **REJECTED** |
| **Tester Verification Signature** | `[ Operator Signature ]` |
| **Official UAT-06 Status** | 🟡 **NOT TESTED / HUMAN EXECUTION REQUIRED** |

---

## 3. Human UAT Summary Status Table

$$\begin{array}{|c|l|l|c|}
\hline
\textbf{UAT ID} & \textbf{Persona \& Context} & \textbf{Human Participant} & \textbf{Human UAT Status} \\
\hline
\text{UAT-01} & \text{Superadmin / Governance} & \text{Dr. Andreas Hendrawan} & \text{\color{orange}\textbf{NOT TESTED (PENDING)}} \\
\text{UAT-02} & \text{Headmaster / TK 01} & \text{Dra. Esther Nugroho, M.Pd} & \text{\color{orange}\textbf{NOT TESTED (PENDING)}} \\
\text{UAT-03} & \text{Teacher / TK A} & \text{Siti Rahmawati, S.Pd} & \text{\color{orange}\textbf{NOT TESTED (PENDING)}} \\
\text{UAT-04} & \text{Teacher / TK B} & \text{Maria Magdalena, S.Pd.Aud} & \text{\color{orange}\textbf{NOT TESTED (PENDING)}} \\
\text{UAT-05} & \text{Isolation Teacher / TK 02} & \text{Diana Sari, S.Pd} & \text{\color{orange}\textbf{NOT TESTED (PENDING)}} \\
\text{UAT-06} & \text{Guardian / Kenzo} & \text{Budi Santoso, S.T.} & \text{\color{orange}\textbf{NOT TESTED (PENDING)}} \\
\hline
\end{array}$$

---
*Authored & Issued for In-Person Operational Execution,*  
**Yapendik OS Release Governance & UAT Coordination Lead**
